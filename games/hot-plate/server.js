// Dining Room: Hot Plate — room-code multiplayer category game.
// One Node process holds every room in memory. Clients talk JSON over a WebSocket at /ws.
// The server is the only judge: it checks answers, runs the hidden fuse and keeps score.

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, "public");
const DATA = path.join(__dirname, "data");

const TIERS = [
  { name: "Bread Basket", pts: 10 },
  { name: "Side Dish", pts: 25 },
  { name: "Main Course", pts: 50 },
  { name: "Chef's Secret", pts: 100 },
];
const MAX_PLAYERS = 12;
const FUSE_MIN = 14, FUSE_MAX = 38;   // seconds a plate stays hot, picked at random and never shown
const HANDOFF_MIN = 3.5;              // whoever catches the plate always gets at least this long
const BREAK_MS = 5000;                // pause between plates
const EMOJIS = ["😎", "🤠", "👽", "🦊", "🐸", "🤖", "👻", "🐼", "🦄", "💀", "🧃", "🍉", "🐙", "🦖", "🍄", "🐝"];

/* ------------------------------------------------------------------ */
/* answer data + matching                                              */
/* ------------------------------------------------------------------ */

function norm(s) {
  return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/&/g, "and").replace(/\$/g, "s").replace(/^\s*the\s+/, "").replace(/[^a-z0-9]/g, "");
}

// edit distance that counts a swapped pair of letters as one typo; gives up past `max`
function dist(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let pp = null, prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (pp && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, pp[j - 2] + 1);
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    pp = prev; prev = cur;
  }
  return prev[b.length];
}

const CATS = new Map();
function loadCategories() {
  for (const f of fs.readdirSync(DATA).filter((f) => f.endsWith(".json")).sort()) {
    const c = JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
    if (!c.answers || c.answers.length < 300) { console.warn(`skipping ${c.id}: only ${c.answers?.length || 0} answers`); continue; }
    const answers = c.answers.map(([name, tier, alts]) => ({ name, tier, alts: alts || [] }));
    const exact = new Map();
    const add = (k, i) => { if (k && !exact.has(k)) exact.set(k, i); };
    // most famous first, so a shared alias belongs to the better-known answer
    answers.forEach((a, i) => { add(norm(a.name), i); a.alts.forEach((x) => add(norm(x), i)); });
    // a lone first or last name counts when exactly one answer has it ("LeBron", "Haaland", "Hermione")
    const names = new Map();
    if (c.kind === "person" || c.kind === "character") {
      answers.forEach((a, i) => {
        const words = a.name.split(/\s+/).map(norm).filter((w) => w.length >= 4);
        if (words.length < 2) return;
        for (const w of new Set([words[0], words[words.length - 1]])) {
          if (exact.has(w)) continue;
          names.set(w, names.has(w) ? -1 : i);
        }
      });
    }
    const shared = new Set();
    for (const [w, i] of names) {
      if (i >= 0) exact.set(w, i);
      else shared.add(w); // "Curry", "Jordan": several answers have it
    }
    const fuzzy = [...exact.entries()].filter(([k]) => k.length >= 5 && !/\d/.test(k));
    CATS.set(c.id, { id: c.id, group: c.group, emoji: c.emoji, prompt: c.prompt, kind: c.kind, answers, exact, fuzzy, shared });
  }
  const total = [...CATS.values()].reduce((n, c) => n + c.answers.length, 0);
  console.log(`loaded ${CATS.size} categories, ${total.toLocaleString()} answers`);
}

// returns an answer index, -1 for no match, or -2 when a lone name fits several answers
function matchAnswer(cat, input) {
  const k = norm(input);
  if (!k) return -1;
  if (cat.exact.has(k)) return cat.exact.get(k);
  if (cat.shared.has(k)) return -2;
  // typo help only on longer answers, and never across a single word (Curry is not Curly)
  if (k.length < 6 || /\d/.test(k)) return -1;
  const max = k.length >= 9 ? 2 : 1;
  let best = -1, bestD = max + 1;
  for (const [key, i] of cat.fuzzy) {
    const d = dist(k, key, max);
    if (d < bestD || (d === bestD && i < best)) { bestD = d; best = i; }
  }
  return best;
}

/* ------------------------------------------------------------------ */
/* rooms                                                               */
/* ------------------------------------------------------------------ */

const rooms = new Map();
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
function newCode() {
  for (;;) {
    let c = "";
    for (let i = 0; i < 4; i++) c += CODE_CHARS[crypto.randomInt(CODE_CHARS.length)];
    if (!rooms.has(c)) return c;
  }
}
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const cleanName = (s) => String(s || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 16);

function createRoom() {
  const room = {
    code: newCode(),
    hostId: null,
    players: [],               // seat order
    phase: "lobby",            // lobby | playing | break | over
    settings: { hearts: 3, cats: [...CATS.keys()] },
    game: null,
    timer: null,
    lastActive: Date.now(),
  };
  rooms.set(room.code, room);
  return room;
}

function addPlayer(room, ws, name, emoji) {
  const p = {
    id: crypto.randomBytes(6).toString("hex"),
    token: crypto.randomBytes(16).toString("hex"),
    name: cleanName(name) || "Guest",
    emoji: EMOJIS.includes(emoji) ? emoji : pick(EMOJIS),
    ws, connected: true,
    hearts: 0, alive: false, score: 0, served: 0, best: null,
    lastAnswer: 0, lastType: 0,
  };
  // late arrivals watch until the next game
  room.players.push(p);
  if (!room.hostId) room.hostId = p.id;
  return p;
}

function publicState(room, forId) {
  const g = room.game;
  return {
    t: "state",
    code: room.code,
    you: forId,
    hostId: room.hostId,
    phase: room.phase,
    settings: room.settings,
    players: room.players.map((p) => ({
      id: p.id, name: p.name, emoji: p.emoji, connected: p.connected,
      hearts: p.hearts, alive: p.alive, score: p.score, served: p.served,
    })),
    game: g && {
      round: g.round,
      cat: g.cat && { id: g.cat.id, emoji: g.cat.emoji, prompt: g.cat.prompt, size: g.cat.answers.length },
      holder: g.holder,
      served: g.served.slice(0, 60),
      startedAt: g.startedAt,
      now: Date.now(),
      winner: g.winner || null,
      bestFind: g.bestFind || null,
      lastPop: g.lastPop || null,
      breakUntil: g.breakUntil || null,
    },
  };
}

function send(ws, msg) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg)); }
function broadcast(room, msg) { for (const p of room.players) send(p.ws, msg); }
function sync(room) { room.lastActive = Date.now(); for (const p of room.players) send(p.ws, publicState(room, p.id)); }

const alive = (room) => room.players.filter((p) => p.alive);
function nextAlive(room, fromId) {
  const n = room.players.length;
  const start = room.players.findIndex((p) => p.id === fromId);
  // skip anyone who is reconnecting, unless they're all that's left
  for (const needConnected of [true, false]) {
    for (let s = 1; s <= n; s++) {
      const p = room.players[(start + s + n) % n];
      if (p.alive && (!needConnected || p.connected)) return p.id;
    }
  }
  return fromId;
}

function finishIfOver(room) {
  const g = room.game;
  const left = alive(room);
  const over = g.solo ? left.length === 0 : left.length <= 1;
  if (!over) return false;
  clearTimeout(room.timer);
  room.phase = "over";
  const ranked = [...room.players].sort((a, b) => (b.alive - a.alive) || (b.hearts - a.hearts) || (b.score - a.score));
  g.winner = g.solo ? null : (left[0] || ranked[0]).id;
  const finds = room.players.filter((x) => x.best).sort((a, b) => b.best.tier - a.best.tier || b.best.rank - a.best.rank);
  g.bestFind = finds.length ? { id: finds[0].id, ...finds[0].best } : null;
  sync(room);
  return true;
}

// a player who drops mid-game has a short grace period, then leaves the table
function forfeit(room, p) {
  if (!room.game || p.connected || !p.alive || (room.phase !== "playing" && room.phase !== "break")) return;
  p.alive = false; p.hearts = 0;
  if (finishIfOver(room)) return;
  if (room.game.holder === p.id && room.phase === "playing") room.game.holder = nextAlive(room, p.id);
  sync(room);
}

function startGame(room) {
  clearTimeout(room.timer);
  const playing = room.players.filter((p) => p.connected);
  if (!playing.length) return;
  for (const p of room.players) {
    const inGame = p.connected;
    Object.assign(p, { hearts: inGame ? room.settings.hearts : 0, alive: inGame, score: 0, served: 0, best: null });
  }
  room.game = { round: 0, cat: null, holder: playing[Math.floor(Math.random() * playing.length)].id, served: [], used: new Set(), recentCats: [], solo: playing.length === 1 };
  nextPlate(room, room.game.holder);
}

function nextPlate(room, holderId) {
  const g = room.game;
  const pool = room.settings.cats.filter((id) => CATS.has(id));
  const fresh = pool.filter((id) => !g.recentCats.includes(id));
  const catId = pick(fresh.length ? fresh : pool);
  g.recentCats = [catId, ...g.recentCats].slice(0, Math.min(6, Math.max(0, pool.length - 1)));
  Object.assign(g, {
    round: g.round + 1, cat: CATS.get(catId), holder: holderId, served: [], used: new Set(),
    startedAt: Date.now(), lastPop: null, breakUntil: null,
  });
  g.fuseEnd = Date.now() + rand(FUSE_MIN, FUSE_MAX) * 1000;
  room.phase = "playing";
  armFuse(room);
  sync(room);
}

function armFuse(room) {
  clearTimeout(room.timer);
  room.timer = setTimeout(() => pop(room), Math.max(0, room.game.fuseEnd - Date.now()));
}

function pop(room) {
  const g = room.game;
  if (room.phase !== "playing") return;
  const p = room.players.find((x) => x.id === g.holder);
  let out = false;
  if (p) {
    p.hearts = Math.max(0, p.hearts - 1);
    if (p.hearts === 0) { p.alive = false; out = true; }
  }
  // a few answers nobody said, leaning rare
  const unused = g.cat.answers.map((a, i) => i).filter((i) => !g.used.has(i));
  const sample = (tier, n) => {
    const c = unused.filter((i) => g.cat.answers[i].tier === tier);
    const outArr = [];
    while (c.length && outArr.length < n) outArr.push(c.splice(Math.floor(Math.random() * c.length), 1)[0]);
    return outArr;
  };
  const missed = [...sample(1, 2), ...sample(2, 3), ...sample(3, 2)].map((i) => ({ name: g.cat.answers[i].name, tier: g.cat.answers[i].tier }));
  g.lastPop = { id: g.holder, out, missed };
  broadcast(room, { t: "pop", id: g.holder, out });
  if (finishIfOver(room)) return;
  room.phase = "break";
  g.breakUntil = Date.now() + BREAK_MS;
  const nextHolder = nextAlive(room, g.holder);
  sync(room);
  room.timer = setTimeout(() => nextPlate(room, nextHolder), BREAK_MS);
}

function handleAnswer(room, p, text) {
  const g = room.game;
  if (room.phase !== "playing" || g.holder !== p.id) return;
  const now = Date.now();
  if (now - p.lastAnswer < 60) return; // flood guard
  p.lastAnswer = now;
  const raw = String(text || "").slice(0, 60).trim();
  if (!raw) return;
  const i = matchAnswer(g.cat, raw);
  if (i === -2) return send(p.ws, { t: "result", kind: "which", text: raw });
  if (i < 0) return send(p.ws, { t: "result", kind: "miss", text: raw });
  const a = g.cat.answers[i];
  if (g.used.has(i)) {
    const by = g.served.find((s) => s.i === i);
    return send(p.ws, { t: "result", kind: "taken", name: a.name, by: by && by.by });
  }
  g.used.add(i);
  const pts = TIERS[a.tier].pts;
  p.score += pts; p.served++;
  if (!p.best || a.tier > p.best.tier || (a.tier === p.best.tier && i > p.best.rank)) p.best = { name: a.name, tier: a.tier, rank: i, cat: g.cat.prompt };
  g.served.unshift({ i, name: a.name, tier: a.tier, by: p.id });
  broadcast(room, { t: "served", by: p.id, name: a.name, tier: a.tier, pts, typed: raw });
  // pass the plate; the catcher always gets a moment to react
  g.holder = nextAlive(room, p.id);
  if (g.fuseEnd - Date.now() < HANDOFF_MIN * 1000) { g.fuseEnd = Date.now() + HANDOFF_MIN * 1000; armFuse(room); }
  sync(room);
}

function leave(room, p, forGood) {
  p.connected = false;
  p.ws = null;
  clearTimeout(p.dropTimer);
  if (room.phase === "lobby") room.players = room.players.filter((x) => x !== p);
  else if (forGood) forfeit(room, p);
  else p.dropTimer = setTimeout(() => forfeit(room, p), 20000);
  if (room.hostId === p.id) {
    const nh = room.players.find((x) => x.connected);
    room.hostId = nh ? nh.id : null;
  }
  if (!room.players.some((x) => x.connected)) {
    // keep an empty room a little while so a refresh can reconnect
    room.lastActive = Date.now();
  }
  sync(room);
}

// sweep rooms nobody has touched for 20 minutes
setInterval(() => {
  const cutoff = Date.now() - 20 * 60 * 1000;
  for (const [code, room] of rooms) {
    if (!room.players.some((p) => p.connected) && room.lastActive < cutoff) {
      clearTimeout(room.timer);
      rooms.delete(code);
    }
  }
}, 60 * 1000);

/* ------------------------------------------------------------------ */
/* http + websocket                                                    */
/* ------------------------------------------------------------------ */

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".json": "application/json" };

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  if (url.pathname === "/api/categories") {
    const list = [...CATS.values()].map((c) => ({ id: c.id, group: c.group, emoji: c.emoji, prompt: c.prompt, size: c.answers.length }));
    res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-cache" });
    return res.end(JSON.stringify({ categories: list, tiers: TIERS }));
  }
  if (url.pathname === "/healthz") { res.writeHead(200); return res.end("ok"); }
  let file = path.normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, "");
  if (!file || file.endsWith("/")) file += "index.html";
  const full = path.join(PUBLIC, file);
  if (!full.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
  fs.readFile(full, (err, buf) => {
    if (err) {
      // unknown paths fall back to the app so /ABCD style links work
      return fs.readFile(path.join(PUBLIC, "index.html"), (e2, html) => {
        if (e2) { res.writeHead(404); return res.end("not found"); }
        res.writeHead(200, { "Content-Type": TYPES[".html"] });
        res.end(html);
      });
    }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(full)] || "application/octet-stream", "Cache-Control": "no-cache" });
    res.end(buf);
  });
});

const wss = new WebSocketServer({ server, path: "/ws", maxPayload: 4096 });

wss.on("connection", (ws) => {
  let room = null, me = null;
  ws.isAlive = true;
  ws.on("pong", () => { ws.isAlive = true; });

  ws.on("message", (data) => {
    let m;
    try { m = JSON.parse(data); } catch { return; }
    if (!m || typeof m.t !== "string") return;

    if (m.t === "create" || m.t === "join" || m.t === "rejoin") {
      if (room && me) return;
      if (m.t === "create") {
        room = createRoom();
      } else {
        room = rooms.get(String(m.code || "").toUpperCase().trim());
        if (!room) { room = null; return send(ws, { t: "error", msg: "No table with that code. Check the four letters and try again." }); }
      }
      if (m.t === "rejoin") {
        const p = room.players.find((x) => x.id === m.id && x.token === m.token);
        if (p) {
          if (p.ws && p.ws !== ws) try { p.ws.close(); } catch {}
          clearTimeout(p.dropTimer);
          p.ws = ws; p.connected = true; me = p;
          if (!room.hostId || !room.players.some((x) => x.id === room.hostId && x.connected)) room.hostId = p.id;
          send(ws, { t: "welcome", id: p.id, token: p.token, code: room.code });
          return sync(room);
        }
      }
      if (room.players.filter((x) => x.connected).length >= MAX_PLAYERS) { room = null; return send(ws, { t: "error", msg: `That table is full (${MAX_PLAYERS} seats).` }); }
      me = addPlayer(room, ws, m.name, m.emoji);
      send(ws, { t: "welcome", id: me.id, token: me.token, code: room.code });
      return sync(room);
    }

    if (!room || !me) return;
    const isHost = room.hostId === me.id;

    switch (m.t) {
      case "settings": {
        if (!isHost || room.phase === "playing" || room.phase === "break") return;
        const hearts = Math.round(Number(m.hearts));
        if (hearts >= 1 && hearts <= 5) room.settings.hearts = hearts;
        if (Array.isArray(m.cats)) {
          const cats = m.cats.filter((id) => CATS.has(id));
          if (cats.length) room.settings.cats = [...new Set(cats)];
        }
        return sync(room);
      }
      case "start": {
        if (!isHost || room.phase === "playing" || room.phase === "break") return;
        return startGame(room);
      }
      case "lobby": {
        if (!isHost || room.phase !== "over") return;
        clearTimeout(room.timer);
        room.phase = "lobby"; room.game = null;
        room.players = room.players.filter((p) => p.connected);
        return sync(room);
      }
      case "type": {
        if (room.phase !== "playing" || room.game.holder !== me.id) return;
        const now = Date.now();
        if (now - me.lastType < 60) return;
        me.lastType = now;
        const text = String(m.text || "").slice(0, 40);
        for (const p of room.players) if (p !== me) send(p.ws, { t: "typing", id: me.id, text });
        return;
      }
      case "answer":
        return handleAnswer(room, me, m.text);
      case "profile": {
        if (room.phase !== "lobby") return;
        const name = cleanName(m.name);
        if (name) me.name = name;
        if (EMOJIS.includes(m.emoji)) me.emoji = m.emoji;
        return sync(room);
      }
      case "leave": {
        leave(room, me, true);
        room = null; me = null;
        return send(ws, { t: "left" });
      }
    }
  });

  ws.on("close", () => { if (room && me && me.ws === ws) leave(room, me); });
});

// drop dead sockets so phones that lock their screen show as away
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) { ws.terminate(); continue; }
    ws.isAlive = false;
    try { ws.ping(); } catch {}
  }
}, 25000);

loadCategories();
server.listen(PORT, () => console.log(`Hot Plate on http://localhost:${PORT}`));

module.exports = { norm, matchAnswer, CATS };
