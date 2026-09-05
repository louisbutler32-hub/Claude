# RICK — Personal JARVIS-style AI Assistant

> Give this file to Claude Code on desktop. It describes what Rick is, how it is
> built, how to run it, and what to build next. The code already exists in the
> `rick/` folder of this repo (branch `claude/rick-ai-assistant-ojun9r`).
> If you are starting from an empty folder, this document is enough to rebuild it.

---

## 1. What I am trying to make

A JARVIS from Iron Man, but mine, called **Rick**. A program I pull up on my
Windows PC that fills the screen with a glowing sci-fi HUD, listens to my voice,
talks back, and actually *knows and controls* my world:

- **My business** — it can answer questions about it (what we do, clients,
  priorities, deadlines, numbers) from notes I give it, and it remembers things
  I tell it.
- **My YouTube channels** — live subscriber counts, views, latest uploads and
  how they performed, what's trending in my niche, and a spoken "briefing".
- **My computer** — open apps and websites, set timers, tell me CPU/RAM/uptime,
  run commands if I allow it.
- **Anything else** — general questions, web search.

It must **look and move like the reference images**: a swirling ring of cyan
particles rotating around a bright arc-reactor core, glowing cyan line-art panels
on a near-black navy background, circular gauges, ticks, thin bracket corners,
and everything animated. It must feel alive: the reactor reacts to my voice
when I talk and pulses when Rick talks.

### The three visual references (described)

1. **Particle torus** — a ring made of thousands of small cyan/teal particles,
   slightly tilted, forming several wavy interleaved ribbons that flow around a
   small bright disc in the centre. Black background. This is the centrepiece.
2. **JARVIS Rainmeter desktop** — cyan line-art HUD on a dark blue nebula:
   a large date ring on the top-left ("march 31"), time above it, storage
   gauges, a media player bar, a central arc-reactor circle with menu links
   radiating out on thin connector lines (Images, Documents, Videos, Music…),
   a weather ring on the right, CPU/RAM/network mini-monitors top-right,
   and a small terminal window. Typography is thin, spaced, futuristic.
3. **Iron Man / Stark Industries HUD** — blue, darker, more dense: a central
   circular targeting reticle with a figure inside, arc segments, concentric
   rings with ticks, side panels of text, a row of circular icon buttons along
   the bottom, "STARK INDUSTRIES" top-right.

Rick's look = (1) in the centre, (2)'s panel layout and colour, (3)'s density
and ring detail.

---

## 2. How it works (architecture)

```
┌───────────────────────────── Chrome / Edge, fullscreen app window ──────────────────────────────┐
│  public/index.html + hud.css      layout, panels, boot screen                                    │
│  public/reactor.js                canvas: particle torus + arc reactor core, reacts to state     │
│  public/hud.js                    voice in (Web Speech API), voice out (browser TTS / ElevenLabs),│
│                                   wake word, push-to-talk, transcript, live panels, WebSocket     │
└───────────────────────────────────────────▲──────────────────────────────────────────────────────┘
                                            │ WebSocket  ws://127.0.0.1:7777/ws
┌───────────────────────────────────────────▼───────────── Node.js (server/) ──────────────────────┐
│  index.js      Express static server + WebSocket bridge; pushes system stats & channel stats;    │
│                launches the browser in --app fullscreen mode; optional ElevenLabs /api/tts       │
│  brain.js      Claude streaming tool-use loop (Anthropic SDK). Persona + memory in system prompt.│
│  tools/        index.js (tool schemas + dispatcher)  youtube.js  knowledge.js  memory.js  system.js│
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
        │                     │                        │                       │
   Anthropic API        YouTube Data API v3      knowledge/*.md            OS: start apps,
   (claude-opus-5)      (public channel stats)   data/memory.json          timers, cpu/mem
```

**Why a browser window and not Electron:** Chrome/Edge ship free speech
recognition and natural voices via the Web Speech API. The Node server runs on
the same PC, so it can still open apps and read system stats. The launcher opens
Chrome/Edge with `--app=http://127.0.0.1:7777 --start-fullscreen` so it looks
like a native fullscreen program.

**Conversation flow:**
1. HUD hears "Rick, …" (or SPACE held, or typed text) → sends `{type:"ask", text}` over WebSocket.
2. `brain.js` appends the user turn, calls Claude with streaming, tools, adaptive
   thinking, `effort: medium`, prompt caching on the stable part of the system prompt,
   and Anthropic server-side refusal fallbacks (`betas: ["server-side-fallback-2026-07-01"], fallbacks: "default"`).
3. Text deltas stream to the HUD (`{type:"delta"}`); the HUD speaks each
   sentence as soon as it is complete, so Rick starts talking before the answer is finished.
4. When Claude calls tools, the server runs them (in parallel), shows them in the
   ACTIVITY panel, feeds results back, loops. Web search is Claude's built-in
   server tool (`web_search_20260209`).
5. `{type:"reply"}` ends the turn. History is saved to `data/history.json` (last 40 messages,
   trimmed without splitting tool_use/tool_result pairs).

**HUD states** drive the reactor and the status pill:
`idle` STANDBY → `listening` LISTENING (green) → `thinking` PROCESSING (amber, fast spin + radar sweep)
→ `working` EXECUTING · toolname → `speaking` SPEAKING (white, pulses to audio level).

---

## 3. Features (what exists now)

### HUD
- Boot screen: spinning rings, "RICK", typed boot log, pulsing INITIALIZE button
  (the click also grants audio/mic permission).
- Top bar: brand, status pill, chips for BRAIN (model / DEMO), YT (LIVE / OFF), LINK.
- Left: clock with a day-progress ring and big date; SYSTEM panel with CPU and
  MEMORY arc gauges, host, uptime, RAM, 30-sample CPU bar history; ACTIVITY log
  of tool calls with timestamps.
- Centre: reactor canvas (2600 glow-sprite particles, three interleaved ribbons,
  arc-reactor core with rotating segmented rings, ticks, triangle, outer ring),
  corner labels CORE / MODEL / AUDIO / LATENCY, pinned NOTE slot, transcript
  (last 6 lines), waveform (real mic spectrum while listening), input bar with
  mic button, hint row.
- Right: YOUTUBE panel (avatar, name, subs, views, video count per channel),
  BUSINESS panel (metrics + tasks from `knowledge/dashboard.json`), QUICK
  COMMANDS buttons (Briefing, Channels, Priorities, Studio, System, Trends).
- Modes Rick can trigger: focus (dims side panels), alert (red flash), note (pin text).
- Ambient: navy gradient, faint grid, scanlines, vignette, bracket corners.
  Fonts Orbitron / Rajdhani / Share Tech Mono (Google Fonts, with fallbacks).

### Voice
- Wake word (default "rick", "hey rick", "yo rick", "okay rick"); the name is stripped
  and the rest is sent. Saying just "Rick" gets "Yes, Louis?".
- 8-second follow-up window after Rick answers where no wake word is needed.
- Push-to-talk: hold SPACE (or hold the mic button), release to send.
- Barge-in: talking over Rick stops him. ESC stops + cancels. Ctrl+L clears the conversation.
- Output: browser `speechSynthesis` with a preference list (Microsoft Ryan/Guy natural
  voices first), rate 1.04, pitch 0.92; or ElevenLabs (`eleven_flash_v2_5`) if a key is set,
  with a WebAudio analyser driving the reactor to the real audio level.

### Tools Rick can call
| Tool | Does |
|---|---|
| `get_time` | local date/time/timezone |
| `system_stats` | cpu %, memory, uptime, hostname |
| `youtube_channel_stats` | subs/views/videos for configured channels or any `@handle` |
| `youtube_recent_videos` | latest uploads with views, likes, comments, duration |
| `youtube_search` | search YouTube videos |
| `list_knowledge` / `read_knowledge` / `search_knowledge` | the `knowledge/` folder |
| `remember` / `forget` | long-term memory in `data/memory.json`, injected into every prompt |
| `open_app` | launch a configured nickname, a URL or an exe (`start "" target` on Windows) |
| `set_reminder` | timer; HUD speaks the message when it fires |
| `hud` | focus / normal / alert / note |
| `run_command` | shell command, only when `allowShell: true` |
| `web_search` | Claude's built-in web search (max 3 uses per turn) |

### Persona (system prompt)
Rick = JARVIS with more edge. Dry, sharp, loyal. Speaks in short spoken
sentences because everything is read aloud: no markdown, no lists, no emojis,
numbers said naturally. Addresses the user by name, "sir" sparingly. Uses tools
instead of guessing. "Briefing" = channel stats + knowledge + dashboard, summarised.
Says plainly which key is missing when a tool can't run.

### Demo mode
No `ANTHROPIC_API_KEY` → the whole HUD, voice and app-launching still work,
replies are canned. Lets you see the look before paying for anything.

---

## 4. Files

```
rick/
  package.json           deps: @anthropic-ai/sdk, express, ws, dotenv
  rick.config.json       name, user, model, effort, personality, wake words, voice prefs,
                         youtube.channels, business, apps (nickname → url/exe), allowShell, webSearch
  .env.example           ANTHROPIC_API_KEY, YOUTUBE_API_KEY, ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID
  start.bat / start.sh   install if needed, create .env if missing, run server
  server/
    config.js            loads rick.config.json + .env
    index.js             HTTP + WebSocket server, panel pushes, browser launcher, /api/config /api/dashboard /api/tts
    brain.js             Brain class: systemPrompt(), ask(), loop() (streaming tool loop), history, demoReply()
    tools/index.js       buildTools(cfg, bus) → { defs, run } — every tool schema + handler
    tools/youtube.js     YouTube Data API v3 (channels, playlistItems, videos, search) with 5-min cache
    tools/knowledge.js   list / read / search text files under knowledge/, read dashboard.json
    tools/memory.js      load / remember / forget
    tools/system.js      cpu sampling, memory, uptime, openTarget(), runShell()
  public/
    index.html  hud.css  reactor.js  hud.js
  knowledge/
    README.md  business.md  channels.md  dashboard.json     (templates — replace with real info)
  data/
    memory.example.json  (memory.json and history.json are created at runtime, git-ignored)
```

---

## 5. Setup and running (Windows)

1. Install Node.js LTS from nodejs.org.
2. Get the repo: `git clone -b claude/rick-ai-assistant-ojun9r https://github.com/louisbutler32-hub/Claude.git`
3. Open the `rick` folder, double-click `start.bat`. First run installs packages and
   opens `.env` in Notepad.
4. Paste keys into `.env`:
   - `ANTHROPIC_API_KEY` — console.anthropic.com (needed for the real brain)
   - `YOUTUBE_API_KEY` — Google Cloud Console → enable *YouTube Data API v3* → Credentials → API key (optional, for live stats)
   - `ELEVENLABS_API_KEY` + `ELEVENLABS_VOICE_ID` (optional, nicer voice)
5. Edit `rick.config.json`: your name, your channels (`{ "name": "Main", "handle": "@yourhandle" }`), app nicknames.
6. Run `start.bat` again → Rick opens fullscreen in Chrome/Edge → click INITIALIZE → allow the mic.
7. Talk: "Rick, give me a briefing." Hold SPACE to push-to-talk. Type in the bottom bar. ESC to stop.

Terminal alternative: `cd rick && npm install && npm start`.
Env overrides: `RICK_PORT`, `RICK_MODEL`, `RICK_NO_BROWSER=1`.

Mac/Linux: `./start.sh`.

---

## 6. Teaching Rick about my business

- Put notes in `knowledge/` as `.md` / `.txt` / `.json` / `.csv`. Suggested files:
  `business.md` (what we do, offers, pricing, people, goals), `channels.md` (per channel:
  niche, schedule, what works, current projects), `clients.md`, `goals.md`.
- `knowledge/dashboard.json` = the numbers and tasks shown in the BUSINESS panel:
  `{ "title": "BUSINESS", "metrics": [{ "label": "MRR", "value": "$0" }], "tasks": ["..."] }`
- Say "Rick, remember that …" for durable facts.

---

## 7. Instructions for Claude Code (what to do with this)

When I open this repo in Claude Code on desktop and point you at this file:

1. **Run it first.** `cd rick`, `npm install`, create `.env` from `.env.example`, `npm start`.
   Confirm the HUD opens, the boot screen appears, and a typed question gets a reply
   (demo mode is fine without keys). Fix anything that breaks on my machine.
2. **Help me fill in my real data**: ask for my channel handles and business details,
   write them into `rick.config.json` and the `knowledge/` files.
3. **Keep the look.** Any UI change must stay inside the cyan-on-navy JARVIS style:
   thin glowing lines, spaced futuristic type, circular gauges, animated reactor.
   Do not add generic web-app styling.
4. **Keep it spoken-first.** Rick's answers are read aloud; keep the persona rules in
   `brain.js` intact (short, no markdown).
5. **Keep the Claude API usage current.** Model `claude-opus-5`, adaptive thinking,
   `output_config.effort`, streaming with `finalMessage()`, tool results returned in one
   user message, no `budget_tokens`, no prefill.
6. Commit as you go with clear messages.

### Ideas for the next versions (in rough priority order)
- **YouTube OAuth** so Rick can read private analytics: revenue, watch time, CTR,
  retention, realtime views (YouTube Analytics API) — not just public counts.
- **Global hotkey / always-on**: run the server at Windows login (Task Scheduler) and a
  hotkey (e.g. Ctrl+Shift+R) that brings the HUD to the front.
- **Better wake word**: on-device wake-word engine (e.g. Porcupine) instead of the
  browser's continuous recognition, for reliability and privacy.
- **Calendar & email**: Google Calendar / Gmail tools so "what's on today" and
  "reply to the sponsor" work.
- **Notion / Google Sheets** as the business knowledge source instead of local files.
- **Video pipeline hooks**: tools that talk to the Remotion projects in this repo
  (render status, start a render, list compositions).
- **Camera / face**: the Stark-HUD reticle in reference 3 with a webcam feed behind it.
- **Multiple monitors / widget mode**: a compact always-on-top mini reactor.
- **Streaming TTS**: ElevenLabs websocket streaming for near-zero latency speech.
- **Screen awareness**: screenshot tool so Rick can look at what's on screen and help.

---

## 8. Key implementation notes (so it isn't rebuilt wrong)

- Speech recognition must run in **Chrome or Edge**; Firefox and Electron (without
  a Google API key) do not support `webkitSpeechRecognition`.
- Browsers require a user gesture before audio plays — that is why the boot screen
  has an INITIALIZE button.
- Chrome's `speechSynthesis` stalls on long utterances; the HUD splits text into
  sentences and nudges `pause()/resume()` every 10 s as a guard.
- CPU % on Windows cannot come from `os.loadavg()`; it is sampled from `os.cpus()` deltas.
- `open_app` on Windows uses `start "" "<target>"` (the empty quotes are the window title
  argument; without them a quoted path is treated as the title).
- History trimming must not separate an assistant `tool_use` from the following
  `tool_result` user message, or the API rejects the request.
- All tool results for one assistant turn go back in a **single** user message.
- The stable part of the system prompt carries `cache_control` so repeated turns are cheap;
  the memory list comes after it because it changes.
- The server binds to `127.0.0.1` only. Nothing is exposed to the network.
