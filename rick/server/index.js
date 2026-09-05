"use strict";
// Rick server: serves the HUD, bridges it to the brain over WebSocket,
// pushes live panel data, and opens the HUD as a fullscreen app window.
const http = require("http");
const path = require("path");
const EventEmitter = require("events");
const express = require("express");
const { WebSocketServer } = require("ws");
const { exec } = require("child_process");
const { loadConfig } = require("./config");
const { Brain } = require("./brain");
const system = require("./tools/system");
const youtube = require("./tools/youtube");
const knowledge = require("./tools/knowledge");

const cfg = loadConfig();
const bus = new EventEmitter();
const brain = new Brain(cfg, bus);

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(cfg.paths.public, { etag: false, maxAge: 0 }));

app.get("/api/config", (_req, res) => {
  res.json({
    name: cfg.name,
    user: cfg.user,
    wakeWords: cfg.wakeWords,
    voice: cfg.voice,
    demo: brain.demo,
    model: cfg.model,
    youtubeEnabled: youtube.enabled(),
    elevenlabs: Boolean(process.env.ELEVENLABS_API_KEY),
    channels: (cfg.youtube?.channels || []).map((c) => ({ name: c.name, handle: c.handle || c.id })),
    business: cfg.business,
  });
});

app.get("/api/dashboard", (_req, res) => {
  res.json(knowledge.readDashboard(cfg.paths.knowledge, cfg.business?.dashboardFile || "knowledge/dashboard.json") || {});
});

// Optional ElevenLabs voice. Returns audio/mpeg for the HUD to play.
app.post("/api/tts", async (req, res) => {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return res.status(404).json({ error: "ELEVENLABS_API_KEY not set" });
  const voice = process.env.ELEVENLABS_VOICE_ID || "JBFqnCBsd6RMkjVDRZzb";
  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ text: req.body.text || "", model_id: "eleven_flash_v2_5" }),
    });
    if (!r.ok) return res.status(502).json({ error: `ElevenLabs ${r.status}` });
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(await r.arrayBuffer()));
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

function broadcast(msg) {
  const data = JSON.stringify(msg);
  for (const c of wss.clients) if (c.readyState === 1) c.send(data);
}

bus.on("status", (p) => broadcast({ type: "status", ...p }));
bus.on("tool", (p) => broadcast({ type: "tool", ...p }));
bus.on("panel", (p) => broadcast({ type: "panel", ...p }));
bus.on("reminder", (p) => broadcast({ type: "reminder", ...p }));
bus.on("hud", (p) => broadcast({ type: "hud", ...p }));

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "hello", demo: brain.demo, busy: brain.busy }));
  ws.send(JSON.stringify({ type: "panel", key: "system", data: system.stats() }));
  pushChannels();

  ws.on("message", async (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }
    if (msg.type === "ask") {
      const text = String(msg.text || "").trim();
      if (!text) return;
      if (brain.busy) {
        brain.cancel();
        await new Promise((r) => setTimeout(r, 150));
      }
      broadcast({ type: "user", text });
      try {
        const reply = await brain.ask(text, { onDelta: (d) => broadcast({ type: "delta", text: d }) });
        broadcast({ type: "reply", text: reply });
      } catch (e) {
        if (e?.name === "AbortError" || /abort/i.test(String(e?.message))) {
          broadcast({ type: "status", state: "idle" });
          return;
        }
        console.error("[brain]", e);
        broadcast({ type: "error", text: friendlyError(e) });
      }
      broadcast({ type: "status", state: "idle" });
    } else if (msg.type === "cancel") {
      brain.cancel();
    } else if (msg.type === "reset") {
      brain.reset();
      broadcast({ type: "reply", text: "Conversation cleared." });
    }
  });
});

function friendlyError(e) {
  const m = String(e?.message || e);
  if (/authentication|401|api key/i.test(m)) return "My API key was rejected. Check ANTHROPIC_API_KEY in rick slash dot env.";
  if (/rate limit|429/i.test(m)) return "I'm being rate limited. Give me a moment.";
  if (/ENOTFOUND|ECONN|fetch failed/i.test(m)) return "I can't reach the network right now.";
  return "Something went wrong on my end. " + m.slice(0, 140);
}

// Live panel pushes
setInterval(() => broadcast({ type: "panel", key: "system", data: system.stats() }), 4000).unref();

async function pushChannels() {
  if (!youtube.enabled()) return;
  const out = [];
  for (const c of cfg.youtube?.channels || []) {
    try {
      out.push({ configuredName: c.name, ...(await youtube.resolveChannel(c)) });
    } catch (e) {
      out.push({ configuredName: c.name, error: e.message });
    }
  }
  broadcast({ type: "panel", key: "channels", data: out });
}
setInterval(pushChannels, 10 * 60 * 1000).unref();

server.listen(cfg.port, "127.0.0.1", () => {
  const url = `http://127.0.0.1:${cfg.port}`;
  console.log(`\n  ${cfg.name.toUpperCase()} online  ->  ${url}`);
  console.log(`  brain: ${brain.demo ? "DEMO (no ANTHROPIC_API_KEY)" : cfg.model}`);
  console.log(`  youtube: ${youtube.enabled() ? "live" : "off (no YOUTUBE_API_KEY)"}\n`);
  if (!process.env.RICK_NO_BROWSER) openHud(url);
});

// Open the HUD as a borderless fullscreen app window in Chrome or Edge
// (they both support the Web Speech API that Rick uses for voice in / out).
function openHud(url) {
  const flags = `--app=${url} --start-fullscreen --autoplay-policy=no-user-gesture-required`;
  const candidates =
    process.platform === "win32"
      ? [
          `"%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" ${flags}`,
          `"%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" ${flags}`,
          `"%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe" ${flags}`,
          `"%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" ${flags}`,
          `"%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" ${flags}`,
          `start "" "${url}"`,
        ]
      : process.platform === "darwin"
        ? [`open -na "Google Chrome" --args ${flags}`, `open "${url}"`]
        : [`google-chrome ${flags}`, `chromium ${flags}`, `xdg-open "${url}"`];
  (function tryNext(i) {
    if (i >= candidates.length) return;
    exec(candidates[i], { windowsHide: true }, (err) => {
      if (err) tryNext(i + 1);
    });
  })(0);
}
