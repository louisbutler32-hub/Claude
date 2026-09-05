/* Rick HUD controller: boot sequence, WebSocket link to the brain, voice in
   (Web Speech API with wake word + push-to-talk), voice out (browser TTS or
   ElevenLabs), and all the live panels. */
(function () {
  const $ = (id) => document.getElementById(id);
  const hud = $("hud"), statusEl = $("status"), transcript = $("transcript");
  const input = $("input"), micBtn = $("mic"), form = $("form");
  let config = { name: "Rick", user: "there", wakeWords: ["rick"], voice: {} };
  let ws = null, wsReady = false;
  let state = "idle";
  let askedAt = 0;

  // ================================================================ status
  const STATUS_TEXT = { idle: "STANDBY", listening: "LISTENING", thinking: "PROCESSING", working: "EXECUTING", speaking: "SPEAKING" };
  function setState(s, detail) {
    state = s;
    statusEl.dataset.state = s;
    statusEl.textContent = STATUS_TEXT[s] + (detail ? " · " + detail.toUpperCase().slice(0, 18) : "");
    Reactor.setState(s);
    $("lbl-core").textContent = s === "idle" ? "STABLE" : s.toUpperCase();
    $("lbl-audio").textContent = s === "listening" ? "INPUT" : s === "speaking" ? "OUTPUT" : "IDLE";
  }

  // ================================================================ transcript
  let currentRickLine = null;
  function addLine(who, text, cls) {
    const div = document.createElement("div");
    div.className = `line ${cls || who}`;
    div.innerHTML = `<span class="who">${who === "rick" ? config.name.toUpperCase() : "YOU"}</span><span class="txt"></span>`;
    div.querySelector(".txt").textContent = text;
    transcript.appendChild(div);
    while (transcript.children.length > 6) transcript.removeChild(transcript.firstChild);
    return div;
  }
  function log(text, err) {
    const ul = $("activity");
    const li = document.createElement("li");
    if (err) li.className = "err";
    const time = new Date().toLocaleTimeString([], { hour12: false });
    li.innerHTML = `<b>${time}</b> `;
    li.appendChild(document.createTextNode(text));
    ul.appendChild(li);
    while (ul.children.length > 14) ul.removeChild(ul.firstChild);
  }

  // ================================================================ websocket
  function connect() {
    const proto = location.protocol === "https:" ? "wss" : "ws";
    ws = new WebSocket(`${proto}://${location.host}/ws`);
    ws.onopen = () => { wsReady = true; setChip("chip-net", "OK"); };
    ws.onclose = () => { wsReady = false; setChip("chip-net", "LOST", true); setTimeout(connect, 1500); };
    ws.onmessage = (ev) => handle(JSON.parse(ev.data));
  }
  function send(obj) { if (wsReady) ws.send(JSON.stringify(obj)); }
  function setChip(id, val, off) { const c = $(id); c.querySelector("b").textContent = val; c.classList.toggle("off", !!off); }

  let pendingText = "";
  function handle(m) {
    switch (m.type) {
      case "hello": break;
      case "status":
        if (m.state === "idle") { if (!speaking()) setState("idle"); }
        else setState(m.state, m.detail);
        break;
      case "user": break;
      case "delta":
        if (!currentRickLine) { currentRickLine = addLine("rick", ""); pendingText = ""; }
        currentRickLine.querySelector(".txt").textContent += m.text;
        pendingText += m.text;
        flushSentences(false);
        break;
      case "reply":
        if (!currentRickLine) currentRickLine = addLine("rick", m.text);
        else currentRickLine.querySelector(".txt").textContent = m.text;
        if (!pendingText && !spokenAny) pendingText = m.text;
        flushSentences(true);
        currentRickLine = null; spokenAny = false;
        $("lbl-lat").textContent = askedAt ? `${((Date.now() - askedAt) / 1000).toFixed(1)}s` : "—";
        break;
      case "error":
        addLine("rick", m.text, "err"); speak(m.text); log(m.text, true); currentRickLine = null;
        break;
      case "tool":
        if (m.status === "start") log(`${m.name} ${m.input ? JSON.stringify(m.input).slice(0, 60) : ""}`);
        else if (m.status === "error") log(`${m.name} failed`, true);
        break;
      case "panel": renderPanel(m.key, m.data); break;
      case "reminder": addLine("rick", `Reminder: ${m.message}`); speak(`Reminder. ${m.message}`); hudMode("alert"); break;
      case "hud": hudMode(m.mode, m.text); break;
    }
  }
  function hudMode(mode, text) {
    if (mode === "focus") hud.classList.add("focus");
    else if (mode === "normal") { hud.classList.remove("focus"); $("note").hidden = true; }
    else if (mode === "alert") { hud.classList.remove("alert"); void hud.offsetWidth; hud.classList.add("alert"); }
    else if (mode === "note") { $("note").textContent = text; $("note").hidden = !text; }
  }

  // ================================================================ ask
  function ask(text) {
    text = (text || "").trim();
    if (!text) return;
    stopSpeaking();
    addLine("user", text);
    askedAt = Date.now();
    currentRickLine = null; pendingText = ""; spokenAny = false;
    setState("thinking");
    send({ type: "ask", text });
  }
  form.addEventListener("submit", (e) => { e.preventDefault(); ask(input.value); input.value = ""; });
  document.querySelectorAll(".cmds button").forEach((b) => b.addEventListener("click", () => ask(b.dataset.cmd)));

  // ================================================================ voice out
  let spokenAny = false;
  const queue = [];
  let playing = false;
  let utterCount = 0;
  let audioCtx = null, analyser = null, freq = null;

  function speaking() { return playing || queue.length > 0; }

  function flushSentences(final) {
    // split completed sentences off pendingText and speak them
    const re = /([^.!?\n]+[.!?]+["')\]]?)\s+/g;
    let m, lastIdx = 0;
    while ((m = re.exec(pendingText))) { enqueue(m[1]); lastIdx = re.lastIndex; }
    pendingText = pendingText.slice(lastIdx);
    if (final && pendingText.trim()) { enqueue(pendingText.trim()); pendingText = ""; }
  }
  function enqueue(text) {
    text = text.replace(/[*_#`>]/g, "").trim();
    if (!text) return;
    spokenAny = true;
    queue.push(text);
    pump();
  }
  async function pump() {
    if (playing || !queue.length) return;
    playing = true;
    setState("speaking");
    const text = queue.shift();
    try {
      if (config.elevenlabs) await speakEleven(text); else await speakBrowser(text);
    } catch (e) { console.warn("tts", e); }
    playing = false;
    if (queue.length) pump();
    else { Reactor.setLevel(0); setState("idle"); openReplyWindow(); }
  }
  function speak(text) { enqueue(text); }
  function stopSpeaking() {
    queue.length = 0;
    try { speechSynthesis.cancel(); } catch {}
    if (currentAudio) { currentAudio.pause(); currentAudio = null; }
    playing = false; Reactor.setLevel(0);
  }

  let voice = null;
  function pickVoice() {
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return;
    const pref = config.voice?.preferred || [];
    for (const name of pref) {
      const v = voices.find((x) => x.name === name) || voices.find((x) => x.name.includes(name));
      if (v) { voice = v; break; }
    }
    if (!voice) voice = voices.find((v) => /en-GB/i.test(v.lang) && /male|ryan|george|daniel/i.test(v.name)) || voices.find((v) => /^en/i.test(v.lang)) || voices[0];
    $("lbl-model").title = voice?.name || "";
  }
  speechSynthesis.onvoiceschanged = pickVoice;
  pickVoice();

  function speakBrowser(text) {
    return new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.rate = config.voice?.rate || 1; u.pitch = config.voice?.pitch || 1;
      let lvlTimer = null;
      u.onstart = () => { lvlTimer = setInterval(() => Reactor.setLevel(0.35 + Math.random() * 0.45), 90); };
      u.onboundary = () => Reactor.setLevel(0.9);
      u.onend = u.onerror = () => { clearInterval(lvlTimer); resolve(); };
      utterCount++;
      speechSynthesis.speak(u);
      // Chrome bug: long utterances can stall; nudge it.
      const guard = setInterval(() => { if (!speechSynthesis.speaking) clearInterval(guard); else { speechSynthesis.pause(); speechSynthesis.resume(); } }, 10000);
      u.addEventListener("end", () => clearInterval(guard));
    });
  }

  let currentAudio = null;
  async function speakEleven(text) {
    const r = await fetch("/api/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
    if (!r.ok) return speakBrowser(text);
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentAudio = audio;
    if (!audioCtx) { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    const src = audioCtx.createMediaElementSource(audio);
    const an = audioCtx.createAnalyser(); an.fftSize = 256;
    src.connect(an); an.connect(audioCtx.destination);
    const data = new Uint8Array(an.frequencyBinCount);
    let raf;
    const tick = () => { an.getByteFrequencyData(data); let s = 0; for (let i = 0; i < 40; i++) s += data[i]; Reactor.setLevel(s / 40 / 160); raf = requestAnimationFrame(tick); };
    await new Promise((res) => { audio.onended = audio.onerror = res; audio.play().then(tick).catch(res); });
    cancelAnimationFrame(raf); URL.revokeObjectURL(url); currentAudio = null;
  }

  // ================================================================ voice in
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null, recOn = false, ptt = false, wantListening = false;
  let replyWindowUntil = 0; // after Rick speaks, accept follow-ups without the wake word
  function openReplyWindow() { replyWindowUntil = Date.now() + 8000; }

  function wakeMatch(text) {
    const t = text.toLowerCase().replace(/[^a-z' ]/g, " ").replace(/\s+/g, " ").trim();
    for (const w of config.wakeWords) {
      const ww = w.toLowerCase();
      if (t === ww) return "";               // just the name: acknowledge
      if (t.startsWith(ww + " ")) return t.slice(ww.length + 1);
      const idx = t.indexOf(" " + ww + " ");
      if (idx >= 0 && idx < 20) return t.slice(idx + ww.length + 2);
    }
    return null;
  }

  function startRec() {
    if (!SR) { micBtn.classList.add("off"); micBtn.title = "Speech recognition needs Chrome or Edge"; return; }
    if (recOn) return;
    rec = new SR();
    rec.continuous = true; rec.interimResults = true; rec.lang = navigator.language || "en-US";
    rec.onstart = () => { recOn = true; micBtn.classList.add("on"); };
    rec.onend = () => { recOn = false; micBtn.classList.remove("on"); if (wantListening) setTimeout(startRec, 300); };
    rec.onerror = (e) => { if (e.error === "not-allowed") { wantListening = false; micBtn.classList.add("off"); log("mic permission denied", true); } };
    rec.onresult = (ev) => {
      let interim = "", final = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (r.isFinal) final += r[0].transcript; else interim += r[0].transcript;
      }
      const heard = (final || interim).trim();
      if (!heard) return;
      // barge-in: user talking while Rick speaks
      if (speaking() && (ptt || wakeMatch(heard) !== null)) stopSpeaking();
      if (interim && state === "idle") { setState("listening"); Reactor.setLevel(0.5); }
      if (!final) return;
      const f = final.trim();
      if (ptt) { pttBuffer += " " + f; return; }
      const stripped = wakeMatch(f);
      if (stripped !== null) {
        if (stripped.trim()) ask(stripped); else { speak(`Yes, ${config.user}?`); openReplyWindow(); }
      } else if (Date.now() < replyWindowUntil && f.split(" ").length >= 2) {
        ask(f);
      } else if (state === "listening") setState("idle");
    };
    try { rec.start(); } catch {}
  }
  function stopRec() { wantListening = false; try { rec && rec.stop(); } catch {} }

  // push-to-talk (hold SPACE or hold the mic button)
  let pttBuffer = "";
  function pttDown() { if (ptt) return; ptt = true; pttBuffer = ""; stopSpeaking(); setState("listening"); micBtn.classList.add("on"); if (!recOn) { wantListening = true; startRec(); } }
  function pttUp() { if (!ptt) return; ptt = false; const t = pttBuffer.trim(); pttBuffer = ""; if (t) ask(t); else setState("idle"); }
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && document.activeElement !== input && !e.repeat) { e.preventDefault(); pttDown(); }
    if (e.key === "Escape") { stopSpeaking(); send({ type: "cancel" }); setState("idle"); input.blur(); }
    if (e.key.toLowerCase() === "l" && e.ctrlKey) { e.preventDefault(); transcript.innerHTML = ""; send({ type: "reset" }); }
  });
  document.addEventListener("keyup", (e) => { if (e.code === "Space" && document.activeElement !== input) { e.preventDefault(); pttUp(); } });
  micBtn.addEventListener("mousedown", pttDown);
  micBtn.addEventListener("mouseup", pttUp);
  micBtn.addEventListener("mouseleave", () => ptt && pttUp());
  micBtn.addEventListener("touchstart", (e) => { e.preventDefault(); pttDown(); });
  micBtn.addEventListener("touchend", (e) => { e.preventDefault(); pttUp(); });

  // mic level -> reactor + waveform (independent of speech recognition)
  async function startMicMeter() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const src = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser(); analyser.fftSize = 512; src.connect(analyser);
      freq = new Uint8Array(analyser.frequencyBinCount);
    } catch { /* no mic: fine */ }
  }

  // ================================================================ waveform
  const wave = $("wave"), wctx = wave.getContext("2d");
  function drawWave() {
    const w = wave.clientWidth, h = wave.clientHeight;
    if (wave.width !== w) { wave.width = w; wave.height = h; }
    wctx.clearRect(0, 0, w, h);
    const bars = 90, gap = 3, bw = (w - gap * bars) / bars;
    let src = null;
    if (analyser && (state === "listening" || ptt)) { analyser.getByteFrequencyData(freq); src = freq; }
    let peak = 0;
    for (let i = 0; i < bars; i++) {
      let v;
      if (src) v = src[Math.floor(i * 0.6) + 2] / 255;
      else if (state === "speaking") v = 0.15 + Math.random() * 0.55 * (0.5 + Math.sin(i * 0.3 + performance.now() / 120) * 0.5);
      else if (state === "thinking" || state === "working") v = 0.1 + Math.abs(Math.sin(i * 0.25 - performance.now() / 200)) * 0.35;
      else v = 0.04 + Math.sin(i * 0.4 + performance.now() / 600) * 0.03;
      peak = Math.max(peak, v);
      const bh = Math.max(2, v * h);
      wctx.fillStyle = state === "listening" || ptt ? "rgba(125,255,176,0.8)" : "rgba(25,230,255,0.7)";
      wctx.fillRect(i * (bw + gap), (h - bh) / 2, bw, bh);
    }
    if (src) Reactor.setLevel(peak);
    requestAnimationFrame(drawWave);
  }

  // ================================================================ panels
  const fmt = (n) => n >= 1e6 ? (n / 1e6).toFixed(2) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "K" : String(n);
  const cpuHist = [];
  function renderPanel(key, data) {
    if (key === "system") {
      $("cpu").textContent = data.cpu.percent; $("mem").textContent = data.memory.percent;
      $("g-cpu").style.strokeDashoffset = 264 - (264 * data.cpu.percent) / 100;
      $("g-mem").style.strokeDashoffset = 264 - (264 * data.memory.percent) / 100;
      $("host").textContent = data.hostname.toUpperCase();
      $("ram").textContent = `${data.memory.usedGb} / ${data.memory.totalGb} GB`;
      const s = data.uptimeSeconds; $("uptime").textContent = `${Math.floor(s / 86400)}D ${Math.floor((s % 86400) / 3600)}H ${Math.floor((s % 3600) / 60)}M`;
      cpuHist.push(data.cpu.percent); if (cpuHist.length > 30) cpuHist.shift();
      const bars = $("cpu-bars");
      if (bars.children.length !== 30) { bars.innerHTML = ""; for (let i = 0; i < 30; i++) bars.appendChild(document.createElement("i")); }
      cpuHist.forEach((v, i) => { bars.children[30 - cpuHist.length + i].style.height = Math.max(4, v) + "%"; });
    } else if (key === "channels") {
      const el = $("channels"); el.innerHTML = "";
      for (const c of data) {
        const d = document.createElement("div");
        d.className = "ch" + (c.error ? " err" : "");
        d.innerHTML = c.error
          ? `<span class="ph"></span><div><div class="n"></div><div class="h"></div></div><div><div class="s">ERR</div></div>`
          : `<img alt="" /><div><div class="n"></div><div class="h"></div></div><div><div class="s"></div><div class="v"></div></div>`;
        d.querySelector(".n").textContent = c.title || c.configuredName;
        d.querySelector(".h").textContent = c.error ? c.error.slice(0, 40) : (c.handle || "");
        if (!c.error) { d.querySelector("img").src = c.thumbnail || ""; d.querySelector(".s").textContent = fmt(c.subscribers) + " SUBS"; d.querySelector(".v").textContent = fmt(c.views) + " VIEWS · " + c.videos + " VIDEOS"; }
        el.appendChild(d);
      }
    } else if (key === "activity") log(data);
  }
  function renderChannelsPlaceholder() {
    const el = $("channels"); el.innerHTML = "";
    if (!config.youtubeEnabled) { el.innerHTML = `<div class="muted">Add YOUTUBE_API_KEY to rick/.env for live stats.</div>`; }
    for (const c of config.channels || []) {
      const d = document.createElement("div"); d.className = "ch";
      d.innerHTML = `<span class="ph"></span><div><div class="n"></div><div class="h"></div></div><div><div class="s">—</div></div>`;
      d.querySelector(".n").textContent = c.name; d.querySelector(".h").textContent = c.handle || "";
      el.appendChild(d);
    }
  }
  async function loadDashboard() {
    try {
      const d = await (await fetch("/api/dashboard")).json();
      if (d.title) $("biz-title").textContent = d.title;
      const m = $("metrics"); m.innerHTML = "";
      for (const x of d.metrics || []) { const e = document.createElement("div"); e.className = "metric"; e.innerHTML = `<span></span><b></b>`; e.querySelector("span").textContent = x.label; e.querySelector("b").textContent = x.value; m.appendChild(e); }
      const t = $("tasks"); t.innerHTML = "";
      for (const x of d.tasks || []) { const e = document.createElement("div"); e.textContent = x; t.appendChild(e); }
    } catch {}
  }

  // clock
  const MONTHS = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
  const DAYS = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
  function tickClock() {
    const d = new Date();
    $("time").textContent = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    $("seconds").textContent = String(d.getSeconds()).padStart(2, "0");
    $("month").textContent = MONTHS[d.getMonth()]; $("day").textContent = String(d.getDate()).padStart(2, "0"); $("weekday").textContent = DAYS[d.getDay()];
    const frac = (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) / 86400;
    $("ring-day").style.strokeDashoffset = 540 - 540 * frac;
  }
  setInterval(tickClock, 1000); tickClock();

  // ================================================================ boot
  const bootLines = [
    "> loading core modules ............ ok",
    "> reactor calibration ............. ok",
    "> linking neural interface ........ ok",
    "> audio subsystem ................. ok",
    "> business intelligence feeds ..... ok",
    "> all systems nominal",
  ];
  async function boot() {
    const logEl = $("boot-log");
    const cfgP = fetch("/api/config").then((r) => r.json()).catch(() => config);
    for (const l of bootLines) { logEl.textContent += l + "\n"; await new Promise((r) => setTimeout(r, 260)); }
    config = Object.assign(config, await cfgP);
    setChip("chip-brain", config.demo ? "DEMO" : config.model.replace("claude-", "").toUpperCase(), config.demo);
    setChip("chip-yt", config.youtubeEnabled ? "LIVE" : "OFF", !config.youtubeEnabled);
    $("lbl-model").textContent = config.demo ? "DEMO" : config.model.toUpperCase();
    $("hint-wake").textContent = `wake word: “${config.wakeWords[0]}”`;
    document.querySelector(".brand-name").textContent = config.name.toUpperCase();
    $("boot-name").textContent = config.name.toUpperCase();
    renderChannelsPlaceholder(); loadDashboard(); connect();
    const btn = $("boot-btn"); btn.hidden = false;
    btn.addEventListener("click", async () => {
      $("boot").classList.add("done"); hud.classList.add("on");
      await startMicMeter();
      wantListening = true; startRec(); drawWave();
      transcript.innerHTML = "";
      log("link established"); log(config.demo ? "brain: demo mode" : `brain: ${config.model}`); log(`youtube feed ${config.youtubeEnabled ? "live" : "offline"}`); log(SR ? "voice input armed" : "voice input unavailable");
      const h = new Date().getHours();
      const greet = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
      const line = `${greet}, ${config.user}. ${config.name} online.` + (config.demo ? " Running in demo mode until you add an API key." : " All systems nominal.");
      addLine("rick", line); speak(line);
    }, { once: true });
  }
  boot();
})();
