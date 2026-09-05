"use strict";
// Rick's brain: a streaming Claude tool-use loop. Streams text deltas to the HUD
// while it thinks, runs local tools (YouTube, knowledge, system control), and
// keeps a rolling conversation history.
const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");
const path = require("path");
const memory = require("./tools/memory");
const knowledge = require("./tools/knowledge");
const { buildTools } = require("./tools");

const MAX_HISTORY_MESSAGES = 40;

class Brain {
  constructor(cfg, bus) {
    this.cfg = cfg;
    this.bus = bus;
    this.tools = buildTools(cfg, bus);
    this.messages = [];
    this.demo = !process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN;
    this.client = this.demo ? null : new Anthropic();
    this.busy = false;
    this.abort = null;
    this.historyFile = path.join(cfg.paths.data, "history.json");
    this.loadHistory();
  }

  loadHistory() {
    try {
      const h = JSON.parse(fs.readFileSync(this.historyFile, "utf8"));
      if (Array.isArray(h)) this.messages = h.slice(-MAX_HISTORY_MESSAGES);
    } catch {
      this.messages = [];
    }
  }
  saveHistory() {
    try {
      fs.mkdirSync(this.cfg.paths.data, { recursive: true });
      fs.writeFileSync(this.historyFile, JSON.stringify(this.messages.slice(-MAX_HISTORY_MESSAGES), null, 1));
    } catch {}
  }
  reset() {
    this.messages = [];
    this.saveHistory();
  }

  systemPrompt() {
    const cfg = this.cfg;
    const mem = memory.load(cfg.paths.memory).facts;
    const files = knowledge.listFiles(cfg.paths.knowledge).map((f) => f.file);
    const channels = (cfg.youtube?.channels || []).map((c) => `${c.name} (${c.handle || c.id})`);
    const stable = [
      `You are ${cfg.name}, a personal AI assistant running on ${cfg.user}'s computer, in the spirit of JARVIS from Iron Man.`,
      `Personality: ${cfg.personality}`,
      "",
      "Everything you say is spoken aloud through a voice HUD, so:",
      "- Answer in plain spoken sentences. No markdown, no bullet points, no headers, no code blocks, no emojis.",
      "- Be brief. One to three sentences for simple things. Go longer only when the user asks for detail or a briefing.",
      "- Numbers should be said naturally (say 'twelve point four thousand' or 'about twelve thousand', not '12,431').",
      "- Address the user as " + cfg.user + ". 'Sir' is allowed sparingly for flavour.",
      "",
      "You have tools. Use them instead of guessing: live YouTube stats, the business knowledge folder, long-term memory,",
      "launching apps and websites, timers, system stats, HUD control and web search. Call several tools at once when useful.",
      "When the user asks for a 'briefing', 'status', or 'how are we doing', pull channel stats and the knowledge/dashboard together and summarise.",
      "If a tool fails because a key is missing, say so plainly and tell the user which key to add to rick/.env.",
      "If asked to remember something durable, use the remember tool. Do not ask permission for read-only tools.",
      "",
      `Business: ${cfg.business?.name || "unknown"}.`,
      `YouTube channels configured: ${channels.join("; ") || "none yet - tell the user to add them to rick.config.json"}.`,
      `Knowledge files available: ${files.join(", ") || "none yet"}.`,
    ].join("\n");
    const volatile = [
      "",
      "Long-term memory:",
      ...(mem.length ? mem.map((f) => `- ${f}`) : ["- (empty)"]),
    ].join("\n");
    return [
      { type: "text", text: stable, cache_control: { type: "ephemeral" } },
      { type: "text", text: volatile },
    ];
  }

  emitStatus(state, detail) {
    this.bus.emit("status", { state, detail: detail || "" });
  }

  async ask(userText, { onDelta } = {}) {
    if (this.busy) throw new Error("busy");
    this.busy = true;
    this.emitStatus("thinking");
    try {
      this.messages.push({ role: "user", content: `[${new Date().toLocaleString()}] ${userText}` });
      const reply = this.demo ? await this.demoReply(userText, onDelta) : await this.loop(onDelta);
      this.saveHistory();
      return reply;
    } finally {
      this.busy = false;
    }
  }

  cancel() {
    if (this.abort) this.abort.abort();
  }

  async loop(onDelta) {
    const cfg = this.cfg;
    let finalText = "";
    for (let iter = 0; iter < 12; iter++) {
      this.abort = new AbortController();
      const stream = this.client.beta.messages.stream(
        {
          model: cfg.model,
          max_tokens: 4000,
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
          thinking: { type: "adaptive" },
          output_config: { effort: cfg.effort || "medium" },
          system: this.systemPrompt(),
          tools: this.tools.defs,
          messages: this.messages,
        },
        { signal: this.abort.signal },
      );
      let turnText = "";
      stream.on("text", (delta) => {
        turnText += delta;
        if (onDelta) onDelta(delta);
      });
      const msg = await stream.finalMessage();
      this.messages.push({ role: "assistant", content: msg.content });
      if (turnText) finalText = turnText;

      if (msg.stop_reason === "pause_turn") continue;
      if (msg.stop_reason === "refusal") {
        finalText = finalText || "I can't help with that one.";
        break;
      }
      if (msg.stop_reason !== "tool_use") break;

      const uses = msg.content.filter((b) => b.type === "tool_use");
      if (!uses.length) break;
      this.emitStatus("working", uses.map((u) => u.name).join(", "));
      const results = await Promise.all(
        uses.map(async (u) => {
          this.bus.emit("tool", { name: u.name, input: u.input, status: "start" });
          let result, isError = false;
          try {
            result = await this.tools.run(u.name, u.input || {});
          } catch (e) {
            result = { error: e.message };
            isError = true;
          }
          this.bus.emit("tool", { name: u.name, status: isError ? "error" : "done" });
          return {
            type: "tool_result",
            tool_use_id: u.id,
            content: JSON.stringify(result).slice(0, 30000),
            ...(isError ? { is_error: true } : {}),
          };
        }),
      );
      this.messages.push({ role: "user", content: results });
      this.emitStatus("thinking");
    }
    this.abort = null;
    if (this.messages.length > MAX_HISTORY_MESSAGES) this.trimHistory();
    return finalText.trim();
  }

  // Keep history bounded but never split a tool_use / tool_result pair.
  trimHistory() {
    let start = this.messages.length - MAX_HISTORY_MESSAGES;
    while (start < this.messages.length) {
      const m = this.messages[start];
      const isToolResult = m.role === "user" && Array.isArray(m.content) && m.content.some((b) => b.type === "tool_result");
      if (m.role === "user" && !isToolResult) break;
      start++;
    }
    this.messages = this.messages.slice(start);
  }

  // No API key: keep the HUD usable and make the voice loop testable.
  async demoReply(text, onDelta) {
    const t = text.toLowerCase();
    let reply;
    if (/time|date|clock/.test(t)) reply = `It's ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.`;
    else if (/who are you|your name/.test(t)) reply = `I'm ${this.cfg.name}. Demo mode for now. Add an Anthropic API key to rick slash dot env and I get a lot smarter.`;
    else if (/youtube|channel|subs/.test(t)) reply = "I'd love to pull your channel numbers, but I'm running without keys. Add ANTHROPIC_API_KEY and YOUTUBE_API_KEY to the dot env file and ask again.";
    else if (/open /.test(t)) {
      const target = text.replace(/.*open /i, "").trim();
      const r = await this.tools.run("open_app", { target });
      reply = r.ok ? `Opening ${target}.` : `I couldn't open ${target}. ${r.error}`;
    } else reply = `Demo mode. I heard: ${text}. Add ANTHROPIC_API_KEY to rick slash dot env to bring the real brain online.`;
    for (const word of reply.split(" ")) {
      if (onDelta) onDelta(word + " ");
      await new Promise((r) => setTimeout(r, 25));
    }
    this.messages.push({ role: "assistant", content: reply });
    return reply;
  }
}

module.exports = { Brain };
