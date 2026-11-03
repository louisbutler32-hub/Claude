// Hot Plate server: serves the app, a little JSON API, and a WebSocket at /ws.
// Every table lives in memory in one Node process.

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { WebSocketServer } = require("ws");
const { TIERS, loadCategories } = require("./answers");
const { Room, send } = require("./room");

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const CATS = loadCategories(path.join(ROOT, "data"));

/* ---------- tables ---------- */

const rooms = new Map();
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
function openRoom() {
  let code;
  do code = Array.from({ length: 4 }, () => CODE_CHARS[crypto.randomInt(CODE_CHARS.length)]).join("");
  while (rooms.has(code));
  const room = new Room(code, CATS);
  rooms.set(code, room);
  return room;
}

// forget tables nobody has touched for 20 minutes
setInterval(() => {
  const cutoff = Date.now() - 20 * 60 * 1000;
  for (const [code, room] of rooms) if (room.isEmpty && room.lastActive < cutoff) { room.close(); rooms.delete(code); }
}, 60 * 1000);

/* ---------- http ---------- */

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".json": "application/json" };

function json(res, body) {
  res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-cache" });
  res.end(JSON.stringify(body));
}

function serveFile(res, file) {
  fs.readFile(file, (err, buf) => {
    if (err) {
      // unknown paths get the app, so shared links always open something
      return fs.readFile(path.join(PUBLIC, "index.html"), (e2, html) => {
        if (e2) { res.writeHead(404); return res.end("not found"); }
        res.writeHead(200, { "Content-Type": TYPES[".html"] });
        res.end(html);
      });
    }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-cache" });
    res.end(buf);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  switch (url.pathname) {
    case "/api/categories":
      return json(res, { tiers: TIERS, categories: [...CATS.values()].map((c) => ({ id: c.id, group: c.group, emoji: c.emoji, prompt: c.prompt, size: c.answers.length })) });
    case "/api/tables":
      return json(res, {
        tables: [...rooms.values()]
          .filter((r) => r.settings.public && r.seated.length && !r.isFull)
          .map((r) => r.summary())
          .sort((a, b) => a.playing - b.playing || b.players - a.players)
          .slice(0, 20),
      });
    case "/healthz":
      res.writeHead(200); return res.end("ok");
  }
  let rel = path.normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, "");
  if (!rel || rel.endsWith("/")) rel += "index.html";
  const full = path.join(PUBLIC, rel);
  if (!full.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
  serveFile(res, full);
});

/* ---------- websocket ---------- */

const wss = new WebSocketServer({ server, path: "/ws", maxPayload: 4096 });

wss.on("connection", (ws) => {
  let room = null, me = null;
  ws.isAlive = true;
  ws.on("pong", () => { ws.isAlive = true; });

  function sitDown(m) {
    let r;
    if (m.t === "create") r = openRoom();
    else {
      r = rooms.get(String(m.code || "").toUpperCase().trim());
      if (!r) return send(ws, { t: "error", msg: "No table with that code. Check the four letters and try again." });
    }
    let p = m.t === "rejoin" ? r.rejoin(ws, m.id, m.token) : null;
    if (!p) {
      if (r.isFull) return send(ws, { t: "error", msg: `That table is full (${r.settings.seats} seats).` });
      p = r.join(ws, m.name, m.emoji);
    }
    room = r; me = p;
    send(ws, { t: "welcome", id: p.id, token: p.token, code: r.code });
    r.sync();
  }

  ws.on("message", (data) => {
    let m;
    try { m = JSON.parse(data); } catch { return; }
    if (!m || typeof m.t !== "string") return;

    if (m.t === "create" || m.t === "join" || m.t === "rejoin") return room ? undefined : sitDown(m);
    if (!room || !me) return;

    switch (m.t) {
      case "settings": return room.applySettings(me, m);
      case "start": return room.start(me);
      case "ready": return room.setReady(me, m.ready);
      case "lobby": return room.backToLobby(me);
      case "profile": return room.setProfile(me, m.name, m.emoji);
      case "type": return room.typing(me, m.text);
      case "answer": return room.answer(me, m.text);
      case "chat": return room.say(me, m.text);
      case "leave":
        room.leave(me, true);
        room = null; me = null;
        return send(ws, { t: "left" });
    }
  });

  ws.on("close", () => { if (room && me && me.ws === ws) room.leave(me); });
});

// drop dead sockets so phones that lock their screen show as away
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) { ws.terminate(); continue; }
    ws.isAlive = false;
    try { ws.ping(); } catch {}
  }
}, 25000);

server.listen(PORT, () => console.log(`Hot Plate on http://localhost:${PORT}`));
