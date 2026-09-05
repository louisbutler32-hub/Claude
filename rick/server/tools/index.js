"use strict";
// Tool definitions (Anthropic tool schema) + the dispatcher that runs them.
const system = require("./system");
const youtube = require("./youtube");
const knowledge = require("./knowledge");
const memory = require("./memory");

function buildTools(cfg, bus) {
  const channelNames = (cfg.youtube?.channels || []).map((c) => c.name);

  const defs = [
    {
      name: "get_time",
      description: "Current local date and time on this computer.",
      input_schema: { type: "object", properties: {}, additionalProperties: false },
    },
    {
      name: "system_stats",
      description: "CPU load, memory usage, uptime and machine name of this computer.",
      input_schema: { type: "object", properties: {}, additionalProperties: false },
    },
    {
      name: "youtube_channel_stats",
      description:
        "Live subscriber count, total views and video count for one of the user's YouTube channels, or any channel by @handle. " +
        `Configured channels: ${channelNames.join(", ") || "(none configured yet)"}. Omit 'channel' to get all configured channels.`,
      input_schema: {
        type: "object",
        properties: {
          channel: { type: "string", description: "Configured channel name, or an @handle / channel id for any other channel" },
        },
        additionalProperties: false,
      },
    },
    {
      name: "youtube_recent_videos",
      description: "Most recent uploads (title, views, likes, comments, date) for one of the user's channels or any @handle.",
      input_schema: {
        type: "object",
        properties: {
          channel: { type: "string", description: "Configured channel name or @handle" },
          max: { type: "integer", minimum: 1, maximum: 25, description: "How many videos (default 5)" },
        },
        required: ["channel"],
        additionalProperties: false,
      },
    },
    {
      name: "youtube_search",
      description: "Search YouTube for videos on a topic (competitor research, trending ideas).",
      input_schema: {
        type: "object",
        properties: { query: { type: "string" }, max: { type: "integer", minimum: 1, maximum: 15 } },
        required: ["query"],
        additionalProperties: false,
      },
    },
    {
      name: "list_knowledge",
      description: "List the files in the user's business knowledge folder (notes, plans, clients, channel notes).",
      input_schema: { type: "object", properties: {}, additionalProperties: false },
    },
    {
      name: "read_knowledge",
      description: "Read one file from the knowledge folder. Use list_knowledge first if unsure of the name.",
      input_schema: {
        type: "object",
        properties: { file: { type: "string", description: "Relative path, e.g. business.md" } },
        required: ["file"],
        additionalProperties: false,
      },
    },
    {
      name: "search_knowledge",
      description: "Keyword search across every knowledge file. Returns matching lines with file names.",
      input_schema: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
        additionalProperties: false,
      },
    },
    {
      name: "remember",
      description: "Store a fact in long-term memory so it is available in every future conversation. Use when the user says 'remember that ...' or shares something durable about their business, preferences or channels.",
      input_schema: {
        type: "object",
        properties: { fact: { type: "string", description: "One clear sentence" } },
        required: ["fact"],
        additionalProperties: false,
      },
    },
    {
      name: "forget",
      description: "Remove memories containing the given text.",
      input_schema: {
        type: "object",
        properties: { text: { type: "string" } },
        required: ["text"],
        additionalProperties: false,
      },
    },
    {
      name: "open_app",
      description:
        "Launch an application or website on this computer. Accepts a configured app name " +
        `(${Object.keys(cfg.apps || {}).join(", ")}), any URL, or an executable name.`,
      input_schema: {
        type: "object",
        properties: { target: { type: "string" } },
        required: ["target"],
        additionalProperties: false,
      },
    },
    {
      name: "set_reminder",
      description: "Set a timer. Rick will speak the message aloud when it fires.",
      input_schema: {
        type: "object",
        properties: {
          minutes: { type: "number", minimum: 0.1, maximum: 1440 },
          message: { type: "string" },
        },
        required: ["minutes", "message"],
        additionalProperties: false,
      },
    },
    {
      name: "hud",
      description:
        "Control the HUD. mode: 'focus' dims the panels, 'normal' restores them, 'alert' flashes red briefly. " +
        "'note' pins a short text on screen (pass 'text').",
      input_schema: {
        type: "object",
        properties: {
          mode: { type: "string", enum: ["focus", "normal", "alert", "note"] },
          text: { type: "string" },
        },
        required: ["mode"],
        additionalProperties: false,
      },
    },
  ];

  if (cfg.allowShell) {
    defs.push({
      name: "run_command",
      description: "Run a shell command on this computer and return its output. Only for things the user explicitly asked for.",
      input_schema: {
        type: "object",
        properties: { command: { type: "string" } },
        required: ["command"],
        additionalProperties: false,
      },
    });
  }

  if (cfg.webSearch) {
    defs.push({ type: "web_search_20260209", name: "web_search", max_uses: 3 });
  }

  function findChannel(ref) {
    if (!ref) return null;
    const list = cfg.youtube?.channels || [];
    const byName = list.find((c) => c.name.toLowerCase() === ref.toLowerCase());
    if (byName) return byName;
    if (ref.startsWith("@")) return { name: ref, handle: ref };
    if (/^UC[\w-]{20,}$/.test(ref)) return { name: ref, id: ref };
    const fuzzy = list.find((c) => c.name.toLowerCase().includes(ref.toLowerCase()));
    return fuzzy || { name: ref, handle: "@" + ref.replace(/\s+/g, "") };
  }

  async function run(name, input) {
    switch (name) {
      case "get_time": {
        const d = new Date();
        return { iso: d.toISOString(), local: d.toString(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone };
      }
      case "system_stats": {
        const s = system.stats();
        return { ...s, uptime: system.humanUptime(s.uptimeSeconds) };
      }
      case "youtube_channel_stats": {
        if (!youtube.enabled()) return { error: "YOUTUBE_API_KEY not set in rick/.env - I can't pull live numbers yet." };
        const refs = input.channel ? [findChannel(input.channel)] : cfg.youtube?.channels || [];
        if (!refs.length) return { error: "No channels configured in rick.config.json" };
        const out = [];
        for (const r of refs) {
          try {
            out.push({ configuredName: r.name, ...(await youtube.resolveChannel(r)) });
          } catch (e) {
            out.push({ configuredName: r.name, error: e.message });
          }
        }
        bus.emit("panel", { key: "channels", data: out });
        return out;
      }
      case "youtube_recent_videos": {
        if (!youtube.enabled()) return { error: "YOUTUBE_API_KEY not set in rick/.env." };
        return youtube.recentVideos(findChannel(input.channel), input.max || 5);
      }
      case "youtube_search": {
        if (!youtube.enabled()) return { error: "YOUTUBE_API_KEY not set in rick/.env." };
        return youtube.search(input.query, input.max || 5);
      }
      case "list_knowledge":
        return knowledge.listFiles(cfg.paths.knowledge);
      case "read_knowledge":
        return { file: input.file, content: knowledge.readFile(cfg.paths.knowledge, input.file) };
      case "search_knowledge":
        return knowledge.search(cfg.paths.knowledge, input.query);
      case "remember":
        return { stored: true, totalFacts: memory.remember(cfg.paths.memory, input.fact) };
      case "forget":
        return { removed: memory.forget(cfg.paths.memory, input.text) };
      case "open_app": {
        const key = input.target.toLowerCase().trim();
        const target = cfg.apps?.[key] || input.target;
        bus.emit("panel", { key: "activity", data: `LAUNCH ${target}` });
        return system.openTarget(target);
      }
      case "set_reminder": {
        const ms = Math.round(input.minutes * 60 * 1000);
        const at = new Date(Date.now() + ms);
        setTimeout(() => bus.emit("reminder", { message: input.message }), ms).unref();
        bus.emit("panel", { key: "activity", data: `TIMER ${input.minutes}m` });
        return { set: true, firesAt: at.toISOString() };
      }
      case "hud":
        bus.emit("hud", { mode: input.mode, text: input.text || "" });
        return { ok: true };
      case "run_command":
        return system.runShell(input.command);
      default:
        return { error: `Unknown tool ${name}` };
    }
  }

  return { defs, run };
}

module.exports = { buildTools };
