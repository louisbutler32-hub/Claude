// One table: its players, settings, chat and the game itself.
// The room is the only judge: it checks answers, runs the turn clock and keeps score.

const crypto = require("crypto");
const { TIERS, WHICH, matchAnswer } = require("./answers");

const BREAK_MS = 4500;   // pause after a burn before the next plate
const MIN_TURN = 4;      // the clock never drops below this many seconds
const SPEEDUP = 0.5;     // each pass takes this much off the next turn
const DROP_GRACE = 20000; // a player who drops mid-game has this long to come back
const LIMITS = { hearts: [1, 5], turn: [5, 20], seats: [2, 12], heartCap: [1, 9], perHeart: [0, 2000] };
const EMOJIS = ["😎", "🤠", "👽", "🦊", "🐸", "🤖", "👻", "🐼", "🦄", "💀", "🧃", "🍉", "🐙", "🦖", "🍄", "🐝"];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, [lo, hi]) => Math.min(hi, Math.max(lo, v));
const cleanName = (s) => String(s || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 16);
const cleanText = (s, n) => String(s || "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
const send = (ws, msg) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg)); };

class Room {
  constructor(code, cats) {
    this.code = code;
    this.cats = cats;
    this.hostId = null;
    this.players = [];             // seat order
    this.phase = "lobby";          // lobby | playing | break | over
    this.settings = { hearts: 2, turn: 12, seats: 8, heartCap: 5, perHeart: 600, public: false, cats: [...cats.keys()] };
    this.game = null;
    this.chat = [];
    this.timer = null;
    this.lastActive = Date.now();
  }

  /* ---------- people ---------- */

  get seated() { return this.players.filter((p) => p.connected); }
  get alive() { return this.players.filter((p) => p.alive); }
  get midGame() { return this.phase === "playing" || this.phase === "break"; }
  get isFull() { return this.seated.length >= this.settings.seats; }
  get isEmpty() { return !this.players.some((p) => p.connected); }

  join(ws, name, emoji) {
    const taken = new Set(this.players.map((p) => p.emoji));
    const p = {
      id: crypto.randomBytes(6).toString("hex"),
      token: crypto.randomBytes(16).toString("hex"),
      name: cleanName(name) || "Guest",
      emoji: EMOJIS.includes(emoji) ? emoji : pick(EMOJIS.filter((e) => !taken.has(e))) || pick(EMOJIS),
      ws, connected: true, ready: false,
      hearts: 0, alive: false, score: 0, served: 0, best: null, last: null, nextHeartAt: 0,
      lastAnswer: 0, lastType: 0, lastChat: 0, dropTimer: null,
    };
    this.players.push(p); // late arrivals watch until the next game
    if (!this.hostId) this.hostId = p.id;
    this.log(`${p.emoji} ${p.name} ${this.players.length === 1 ? "opened the table" : this.phase === "lobby" ? "sat down" : "is watching"}`);
    this.sync();
    return p;
  }

  rejoin(ws, id, token) {
    const p = this.players.find((x) => x.id === id && x.token === token);
    if (!p) return null;
    if (p.ws && p.ws !== ws) try { p.ws.close(); } catch {}
    clearTimeout(p.dropTimer);
    p.ws = ws; p.connected = true;
    if (!this.players.some((x) => x.id === this.hostId && x.connected)) this.hostId = p.id;
    this.sync();
    return p;
  }

  leave(p, forGood) {
    p.connected = false;
    p.ws = null;
    clearTimeout(p.dropTimer);
    if (this.phase === "lobby") {
      this.players = this.players.filter((x) => x !== p);
      this.log(`${p.emoji} ${p.name} left`);
    } else if (forGood) this.forfeit(p);
    else p.dropTimer = setTimeout(() => this.forfeit(p), DROP_GRACE);
    if (this.hostId === p.id) {
      const next = this.players.find((x) => x.connected);
      this.hostId = next ? next.id : null;
      if (next) this.log(`👑 ${next.name} is now the host`);
    }
    this.lastActive = Date.now();
    this.sync();
  }

  forfeit(p) {
    if (!this.game || p.connected || !p.alive || !this.midGame) return;
    p.alive = false; p.hearts = 0;
    this.log(`🚪 ${p.name} left the table`);
    if (this.finishIfOver()) return;
    if (this.game.holder === p.id && this.phase === "playing") this.giveTurn(this.nextAlive(p.id));
    else this.sync();
  }

  nextAlive(fromId) {
    const n = this.players.length;
    const start = this.players.findIndex((p) => p.id === fromId);
    // skip anyone who is reconnecting, unless they're all that's left
    for (const needConnected of [true, false]) {
      for (let s = 1; s <= n; s++) {
        const p = this.players[(start + s + n) % n];
        if (p.alive && (!needConnected || p.connected)) return p.id;
      }
    }
    return fromId;
  }

  /* ---------- lobby actions ---------- */

  setReady(p, ready) { if (!this.midGame) { p.ready = !!ready; this.sync(); } }

  setProfile(p, name, emoji) {
    if (this.midGame) return;
    if (cleanName(name)) p.name = cleanName(name);
    if (EMOJIS.includes(emoji)) p.emoji = emoji;
    this.sync();
  }

  applySettings(p, m) {
    if (p.id !== this.hostId || this.midGame) return;
    const s = this.settings;
    for (const k of ["hearts", "turn", "seats", "heartCap", "perHeart"]) {
      if (!(k in m)) continue;
      const v = Math.round(Number(m[k]));
      if (Number.isFinite(v)) s[k] = clamp(v, LIMITS[k]);
    }
    s.seats = Math.max(s.seats, Math.min(LIMITS.seats[1], this.seated.length));
    s.heartCap = Math.max(s.heartCap, s.hearts);
    if (s.perHeart && s.perHeart < 100) s.perHeart = 100;
    if (typeof m.public === "boolean") s.public = m.public;
    if (Array.isArray(m.cats)) {
      const cats = m.cats.filter((id) => this.cats.has(id));
      if (cats.length) s.cats = [...new Set(cats)];
    }
    this.sync();
  }

  backToLobby(p) {
    if (p.id !== this.hostId || this.phase !== "over") return;
    clearTimeout(this.timer);
    this.phase = "lobby"; this.game = null;
    this.players = this.players.filter((x) => x.connected);
    for (const x of this.players) Object.assign(x, { alive: false, hearts: 0, last: null });
    this.sync();
  }

  say(p, text) {
    const now = Date.now();
    text = cleanText(text, 160);
    if (!text || now - p.lastChat < 700) return;
    p.lastChat = now;
    this.pushChat({ kind: "chat", id: p.id, name: p.name, emoji: p.emoji, text, at: now });
    this.sync();
  }

  log(text) { this.pushChat({ kind: "sys", text, at: Date.now() }); }
  pushChat(entry) {
    this.chat.push(entry);
    if (this.chat.length > 80) this.chat.splice(0, this.chat.length - 80);
  }

  /* ---------- the game ---------- */

  start(p) {
    if (p.id !== this.hostId || this.midGame) return;
    clearTimeout(this.timer);
    const playing = this.seated;
    if (!playing.length) return;
    const s = this.settings;
    for (const x of this.players) {
      Object.assign(x, { hearts: x.connected ? s.hearts : 0, alive: x.connected, score: 0, served: 0, best: null, last: null, ready: false, nextHeartAt: s.perHeart || 0 });
    }
    this.game = { round: 0, cat: null, holder: pick(playing).id, served: [], used: new Set(), recentCats: [], solo: playing.length === 1, passes: 0 };
    this.log(`🔔 Dinner is served. ${playing.length === 1 ? "Solo practice." : playing.length + " at the table."}`);
    this.nextPlate(this.game.holder);
  }

  nextPlate(holderId) {
    const g = this.game;
    const pool = this.settings.cats.filter((id) => this.cats.has(id));
    const fresh = pool.filter((id) => !g.recentCats.includes(id));
    const catId = pick(fresh.length ? fresh : pool);
    g.recentCats = [catId, ...g.recentCats].slice(0, Math.min(8, Math.max(0, pool.length - 1)));
    Object.assign(g, { round: g.round + 1, cat: this.cats.get(catId), served: [], used: new Set(), passes: 0, lastPop: null, breakUntil: null });
    for (const x of this.players) x.last = null;
    this.phase = "playing";
    this.log(`${g.cat.emoji} New plate: ${g.cat.prompt}`);
    this.giveTurn(holderId);
  }

  giveTurn(holderId) {
    const g = this.game;
    g.holder = holderId;
    g.turnLen = Math.max(MIN_TURN, this.settings.turn - g.passes * SPEEDUP);
    g.turnEnd = Date.now() + g.turnLen * 1000;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.burn(), g.turnLen * 1000);
    this.sync();
  }

  typing(p, text) {
    if (this.phase !== "playing" || this.game.holder !== p.id) return;
    const now = Date.now();
    if (now - p.lastType < 50) return;
    p.lastType = now;
    this.broadcast({ t: "typing", id: p.id, text: cleanText(text, 40) }, p);
  }

  answer(p, text) {
    const g = this.game;
    if (this.phase !== "playing" || g.holder !== p.id) return;
    const now = Date.now();
    if (now - p.lastAnswer < 60) return; // flood guard
    p.lastAnswer = now;
    const raw = cleanText(text, 60);
    if (!raw) return;

    // misses are shown to the whole table, autocorrect disasters included
    const nope = (kind, extra) => {
      send(p.ws, { t: "result", kind, text: raw, ...extra });
      this.broadcast({ t: "nope", id: p.id, kind, text: raw }, p);
    };
    const i = matchAnswer(g.cat, raw);
    if (i === WHICH) return nope("which");
    if (i < 0) return nope("miss");
    const a = g.cat.answers[i];
    if (g.used.has(i)) {
      const by = g.served.find((s) => s.i === i);
      return nope("taken", { name: a.name, by: by && by.by });
    }

    g.used.add(i);
    const pts = TIERS[a.tier].pts;
    p.score += pts; p.served++;
    p.last = { name: a.name, tier: a.tier };
    if (!p.best || a.tier > p.best.tier || (a.tier === p.best.tier && i > p.best.rank)) p.best = { name: a.name, tier: a.tier, rank: i, cat: g.cat.prompt };
    g.served.unshift({ i, name: a.name, tier: a.tier, by: p.id });
    this.log(`${p.emoji} ${p.name} served ${a.name} · +${pts}`);

    // points buy hearts back, up to the cap
    const s = this.settings;
    let heart = false;
    while (s.perHeart && p.score >= p.nextHeartAt) {
      p.nextHeartAt += s.perHeart;
      if (p.hearts < s.heartCap) { p.hearts++; heart = true; }
    }
    if (heart) this.log(`❤️ ${p.name} earned a heart`);
    this.broadcast({ t: "served", by: p.id, name: a.name, tier: a.tier, pts, heart });
    g.passes++;
    this.giveTurn(this.nextAlive(p.id));
  }

  burn() {
    const g = this.game;
    if (this.phase !== "playing") return;
    const p = this.players.find((x) => x.id === g.holder);
    let out = false;
    if (p) {
      p.hearts = Math.max(0, p.hearts - 1);
      if (p.hearts === 0) { p.alive = false; out = true; }
      this.log(out ? `💀 ${p.name} got burned and is out` : `🔥 ${p.name} got burned`);
    }
    g.lastPop = { id: g.holder, out, missed: this.missedAnswers() };
    this.broadcast({ t: "burn", id: g.holder, out });
    if (this.finishIfOver()) return;
    this.phase = "break";
    g.breakUntil = Date.now() + BREAK_MS;
    const next = this.nextAlive(g.holder);
    this.sync();
    this.timer = setTimeout(() => this.nextPlate(next), BREAK_MS);
  }

  // a few answers nobody said, leaning rare, to show after a burn
  missedAnswers() {
    const g = this.game;
    const unused = g.cat.answers.map((_, i) => i).filter((i) => !g.used.has(i));
    const sample = (tier, n) => {
      const c = unused.filter((i) => g.cat.answers[i].tier === tier);
      const res = [];
      while (c.length && res.length < n) res.push(c.splice(Math.floor(Math.random() * c.length), 1)[0]);
      return res;
    };
    return [...sample(1, 2), ...sample(2, 3), ...sample(3, 2)].map((i) => ({ name: g.cat.answers[i].name, tier: g.cat.answers[i].tier }));
  }

  finishIfOver() {
    const g = this.game;
    const left = this.alive;
    if (g.solo ? left.length > 0 : left.length > 1) return false;
    clearTimeout(this.timer);
    this.phase = "over";
    const ranked = [...this.players].sort((a, b) => (b.alive - a.alive) || (b.hearts - a.hearts) || (b.score - a.score));
    g.winner = g.solo ? null : (left[0] || ranked[0]).id;
    const finds = this.players.filter((x) => x.best).sort((a, b) => b.best.tier - a.best.tier || b.best.rank - a.best.rank);
    g.bestFind = finds.length ? { id: finds[0].id, ...finds[0].best } : null;
    const w = this.players.find((x) => x.id === g.winner);
    this.log(w ? `🏆 ${w.name} is the last one at the table` : `🍽️ Practice over: ${this.players[0].score} points`);
    for (const x of this.players) x.ready = false;
    this.sync();
    return true;
  }

  /* ---------- sending ---------- */

  broadcast(msg, except) { for (const p of this.players) if (p !== except) send(p.ws, msg); }

  sync() {
    this.lastActive = Date.now();
    for (const p of this.players) send(p.ws, this.stateFor(p.id));
  }

  stateFor(you) {
    const g = this.game;
    return {
      t: "state",
      code: this.code, you, hostId: this.hostId, phase: this.phase, settings: this.settings, now: Date.now(),
      players: this.players.map((p) => ({
        id: p.id, name: p.name, emoji: p.emoji, connected: p.connected, ready: p.ready,
        hearts: p.hearts, alive: p.alive, score: p.score, served: p.served, last: p.last,
      })),
      chat: this.chat.slice(-50),
      game: g && {
        round: g.round,
        cat: g.cat && { id: g.cat.id, emoji: g.cat.emoji, prompt: g.cat.prompt, size: g.cat.answers.length },
        holder: g.holder, turnEnd: g.turnEnd, turnLen: g.turnLen, passes: g.passes,
        served: g.served.slice(0, 60).map(({ name, tier, by }) => ({ name, tier, by })),
        winner: g.winner || null, bestFind: g.bestFind || null, lastPop: g.lastPop || null, breakUntil: g.breakUntil || null,
      },
    };
  }

  summary() {
    const host = this.players.find((p) => p.id === this.hostId);
    return { code: this.code, host: host ? `${host.emoji} ${host.name}` : "", players: this.seated.length, seats: this.settings.seats, playing: this.phase !== "lobby" };
  }

  close() { clearTimeout(this.timer); for (const p of this.players) clearTimeout(p.dropTimer); }
}

module.exports = { Room, send };
