// Hot Plate client. The server decides everything; this file draws the latest state over the
// dining room and sends what the player does.
(() => {
  const $ = (id) => document.getElementById(id);
  const EMOJIS = ["😎", "🤠", "👽", "🦊", "🐸", "🤖", "👻", "🐼", "🦄", "💀", "🧃", "🍉", "🐙", "🦖", "🍄", "🐝"];
  const TIERS = [
    { name: "Bread Basket", pts: 10 },
    { name: "Side Dish", pts: 25 },
    { name: "Main Course", pts: 50 },
    { name: "Chef's Secret", pts: 100 },
  ];
  const PER_HEART = [0, 300, 400, 500, 600, 800, 1000, 1500, 2000];
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} },
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------------- sound ---------------- */
  let actx = null;
  let muted = !!store.get("hp-muted");
  function tone(freq, dur = 0.12, type = "square", vol = 0.06, delay = 0) {
    if (muted) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime + delay;
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur + 0.02);
    } catch {}
  }
  const sfx = {
    pass(tier) { const b = [523, 587, 698, 880][tier]; tone(b, 0.08); tone(b * 1.5, 0.12, "square", 0.05, 0.06); if (tier === 3) tone(b * 2, 0.18, "square", 0.05, 0.13); },
    yourTurn() { tone(988, 0.07); tone(1319, 0.1, "square", 0.06, 0.07); },
    nope() { tone(196, 0.14, "sawtooth", 0.05); },
    tick(urgent) { tone(urgent ? 1400 : 1000, 0.03, "square", urgent ? 0.05 : 0.025); },
    burn() { tone(110, 0.45, "sawtooth", 0.1); tone(70, 0.5, "square", 0.07, 0.08); },
    bell() { [1319, 1568, 2093].forEach((f, i) => tone(f, 0.35, "triangle", 0.07, i * 0.09)); },
    win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, "square", 0.06, i * 0.12)); },
    heart() { tone(784, 0.08, "triangle", 0.08); tone(1046, 0.14, "triangle", 0.08, 0.08); },
  };
  const buzz = (ms) => { try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(ms); } catch {} };
  function unlockAudio() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume(); } catch {} }

  /* ---------------- connection ---------------- */
  let ws = null, retry = 0, queue = [];
  let session = store.get("hp-session");   // { code, id, token }
  let S = null;                            // latest room state
  let clockOffset = 0;
  let autoRejoin = !!session;
  const typing = {};                       // live text of whoever holds the plate
  const nope = {};                         // id -> { text, until }

  function connect() {
    ws = new WebSocket((location.protocol === "https:" ? "wss://" : "ws://") + location.host + "/ws");
    ws.onopen = () => {
      retry = 0;
      if (session) send({ t: "rejoin", code: session.code, id: session.id, token: session.token, name: profile.name, emoji: profile.emoji });
      const q = queue; queue = [];
      q.forEach(send);
    };
    ws.onmessage = (e) => { let m; try { m = JSON.parse(e.data); } catch { return; } onMessage(m); };
    ws.onclose = () => { ws = null; setTimeout(connect, Math.min(8000, 500 * 2 ** retry++)); };
  }
  function send(m) {
    if (ws && ws.readyState === 1) ws.send(JSON.stringify(m));
    else queue.push(m);
  }
  const now = () => Date.now() + clockOffset;

  /* ---------------- home ---------------- */
  const profile = store.get("hp-profile") || { name: "", emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)] };
  $("name-input").value = profile.name;
  function renderFaces() {
    $("faces").innerHTML = EMOJIS.map((e) => `<button type="button" role="radio" aria-checked="${e === profile.emoji}" aria-label="${e}">${e}</button>`).join("");
  }
  $("faces").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    profile.emoji = b.textContent; store.set("hp-profile", profile); renderFaces();
  });
  $("name-input").addEventListener("input", () => { profile.name = $("name-input").value.trim(); store.set("hp-profile", profile); });
  renderFaces();

  function needName() {
    if (profile.name) return false;
    $("home-error").textContent = "Pop your name in first.";
    $("name-input").focus();
    return true;
  }
  function join(code) {
    if (needName()) return;
    unlockAudio();
    if (session && session.code === code) return send({ t: "rejoin", ...session, name: profile.name, emoji: profile.emoji });
    session = null; autoRejoin = false;
    send({ t: "join", code, name: profile.name, emoji: profile.emoji });
  }
  $("create-btn").onclick = () => {
    if (needName()) return;
    unlockAudio();
    session = null; autoRejoin = false;
    send({ t: "create", name: profile.name, emoji: profile.emoji });
  };
  $("join-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const code = $("code-input").value.trim().toUpperCase();
    if (!/^[A-Z]{4}$/.test(code)) { $("home-error").textContent = "Table codes are four letters."; return; }
    join(code);
  });
  $("code-input").addEventListener("input", (e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, ""); });
  $("tables").addEventListener("click", (e) => { const b = e.target.closest("button[data-code]"); if (b) join(b.dataset.code); });

  async function loadTables() {
    if (S) return;
    try {
      const { tables } = await (await fetch("/api/tables")).json();
      $("tables").innerHTML = tables.length
        ? tables.map((t) => `<li><span class="who">${esc(t.host)}'s table${t.playing ? " · eating" : ""}</span><span class="n">${t.players}/${t.seats}</span><button class="px-btn" data-code="${t.code}">Sit</button></li>`).join("")
        : `<li class="muted">No public tables right now. Open one and set it to public.</li>`;
    } catch { $("tables").innerHTML = `<li class="muted">Couldn't load open tables.</li>`; }
  }
  loadTables();
  setInterval(loadTables, 6000);

  // a shared link looks like /?t=ABCD
  const linkCode = (new URLSearchParams(location.search).get("t") || "").toUpperCase();
  if (/^[A-Z]{4}$/.test(linkCode)) {
    $("code-input").value = linkCode;
    if (session && session.code !== linkCode) { session = null; autoRejoin = false; }
  }

  /* ---------------- messages ---------------- */
  function onMessage(m) {
    switch (m.t) {
      case "welcome":
        session = { code: m.code, id: m.id, token: m.token };
        store.set("hp-session", session);
        autoRejoin = false;
        history.replaceState(null, "", "/?t=" + m.code);
        $("home-error").textContent = "";
        break;
      case "state": {
        const prev = S;
        S = m;
        clockOffset = m.now - Date.now();
        render(prev);
        break;
      }
      case "typing":
        // a late echo of the rejected guess, or the box clearing itself, shouldn't hide the crossed-out guess
        if (nope[m.id] && (!m.text || m.text.trim() === nope[m.id].text)) break;
        typing[m.id] = m.text;
        delete nope[m.id];
        renderBubbles();
        break;
      case "nope":
        nope[m.id] = { text: m.text, until: Date.now() + 1300 };
        typing[m.id] = "";
        renderBubbles();
        setTimeout(renderBubbles, 1350);
        break;
      case "served": onServed(m); break;
      case "result": onResult(m); break;
      case "burn": onBurn(m); break;
      case "error":
        if (autoRejoin) { session = null; store.del("hp-session"); autoRejoin = false; S = null; render(); break; }
        $("home-error").textContent = m.msg;
        S = null; render();
        break;
      case "left":
        session = null; store.del("hp-session"); S = null;
        history.replaceState(null, "", "/");
        render();
        loadTables();
        break;
    }
  }

  /* ---------------- geometry ---------------- */
  const scene = $("scene");
  Room.mount($("room-canvas"));
  let L = null, layoutKey = "";
  function seatList() {
    if (!S) return { players: [], count: 6 };
    const players = S.players.filter((p) => p.connected || p.alive || p.score);
    // the lobby shows open chairs; once dinner starts only the people eating get a seat
    const eating = S.phase !== "lobby";
    return { players, count: eating ? Math.max(2, players.length) : Math.max(S.settings.seats, players.length) };
  }
  function relayout(force) {
    const w = scene.clientWidth, h = scene.clientHeight;
    const { count } = seatList();
    const narrow = w < 720;
    const opts = { top: narrow ? 128 : 150, bottom: narrow ? 150 : 140 };
    const key = [w, h, count].join("x");
    if (!force && key === layoutKey) return;
    layoutKey = key;
    L = Room.draw(w, h, count, opts);
    const c = $("centrepiece");
    c.style.left = L.css.cx + "px"; c.style.top = L.css.cy + "px";
  }
  new ResizeObserver(() => { relayout(); renderSeats(); renderBubbles(); }).observe(scene);

  /* ---------------- render ---------------- */
  const meP = () => S && S.players.find((p) => p.id === S.you);
  const byId = (id) => S && S.players.find((p) => p.id === id);
  const isHost = () => S && S.hostId === S.you;
  const phaseName = () => !S ? "home" : S.phase === "playing" ? "play" : S.phase;

  function render(prev) {
    const phase = phaseName();
    $("app").dataset.phase = phase;
    const inRoom = !!S;
    $("home-card").hidden = inRoom;
    $("side").hidden = !inRoom;
    $("code-badge").hidden = !inRoom;
    $("status-badge").hidden = !inRoom;
    $("dock").hidden = !inRoom || phase === "over";
    $("over").hidden = phase !== "over";
    $("centrepiece").hidden = !(phase === "play" || phase === "break");
    relayout();

    if (!inRoom) {
      $("marquee-eyebrow").textContent = "Dining Room presents";
      $("marquee-title").textContent = "HOT PLATE";
      $("marquee-sub").textContent = "pass the plate · don't get burned";
      renderSeats(); renderBubbles();
      return;
    }
    $("badge-kind").textContent = S.settings.public ? "PUBLIC" : "PRIVATE";
    $("badge-code").textContent = S.code;
    $("big-code").textContent = S.code;
    $("link-btn").textContent = location.host + "/?t=" + S.code;
    renderChat();

    $("dock-lobby").hidden = phase !== "lobby";
    $("dock-play").hidden = phase !== "play";
    $("dock-burn").hidden = phase !== "break";

    if (phase === "lobby") renderLobby();
    if (phase === "play" || phase === "break") renderGame(prev);
    if (phase === "over") renderOver(prev);
    renderSeats(); renderBubbles();
    if (!$("settings-modal").hidden) renderSettings();
    if (!$("cats-modal").hidden) renderCats();
  }

  function renderSeats() {
    if (!L) return;
    const { players } = seatList();
    const g = S && S.game;
    const phase = phaseName();
    let html = "";
    L.seats.forEach((seat, i) => {
      const p = players[i];
      const pos = `left:${seat.x.toFixed(1)}px;top:${seat.y.toFixed(1)}px`;
      if (!p) { html += `<div class="seat empty" style="${pos}"><div class="tile">${S ? "OPEN" : ""}</div></div>`; return; }
      const holder = g && phase === "play" && g.holder === p.id;
      const inGame = g && (phase === "play" || phase === "break" || phase === "over");
      const cls = ["seat", p.id === S.you ? "me" : "", holder ? "holder" : "", inGame && !p.alive ? "out" : "", p.connected ? "" : "away"].join(" ");
      let stats;
      if (!inGame) stats = `<span class="tag">${p.id === S.hostId ? "HOST" : p.ready ? "READY" : "…"}</span>`;
      else stats = `<span class="hearts">${p.alive ? "♥".repeat(p.hearts) : p.hearts === 0 && p.score + p.served > 0 ? "✕" : "👀"}</span><span class="sc">${p.score}<small>pts</small></span>`;
      html += `<div class="${cls}" data-id="${p.id}" style="${pos}"><div class="tile">${p.emoji}</div><div class="nm">${esc(p.name)}</div><div class="stats">${stats}</div>${holder ? `<div class="tbar"><i></i></div>` : ""}</div>`;
    });
    $("seats").innerHTML = html;
    // point the plate at whoever holds it
    if (g && phase === "play") {
      const idx = players.findIndex((p) => p.id === g.holder);
      if (idx >= 0) $("pointer").style.transform = `rotate(${(L.seats[idx].a * 180) / Math.PI + 90}deg)`;
    }
    $("pointer").hidden = phase !== "play";
  }

  // speech bubbles over each player's plate: their last answer, or live typing for the holder
  const bubbleEls = new Map();
  function renderBubbles(popId) {
    const layer = $("seats");
    const keep = new Set();
    if (L && S && S.game && (S.phase === "playing" || S.phase === "break" || S.phase === "over")) {
      const { players } = seatList();
      players.forEach((p, i) => {
        const seat = L.seats[i]; if (!seat) return;
        let cls = "", html = "";
        const n = nope[p.id] && nope[p.id].until > Date.now() ? nope[p.id] : null;
        if (S.phase === "playing" && S.game.holder === p.id) {
          if (n) { cls = "nope"; html = esc(n.text); }
          else { cls = "typing"; html = esc(p.id === S.you ? $("answer-input").value : typing[p.id] || ""); }
        } else if (p.last) {
          cls = "t" + p.last.tier;
          html = `${esc(p.last.name)}<small>+${TIERS[p.last.tier].pts}</small>`;
        } else return;
        keep.add(p.id);
        let el = bubbleEls.get(p.id);
        if (!el || !el.isConnected) { el = document.createElement("div"); bubbleEls.set(p.id, el); }
        layer.appendChild(el);
        el.className = "bubble " + cls + (popId === p.id ? " pop" : "");
        el.innerHTML = html;
        el.style.left = seat.plateX + "px";
        el.style.top = seat.plateY + "px";
      });
    }
    for (const [id, el] of bubbleEls) if (!keep.has(id)) { el.remove(); bubbleEls.delete(id); }
  }

  /* lobby */
  function renderLobby() {
    $("marquee-eyebrow").textContent = "Dining Room presents";
    $("marquee-title").textContent = "HOT PLATE";
    $("marquee-sub").textContent = "pass the plate · don't get burned";
    const seated = S.players.filter((p) => p.connected);
    const ready = seated.filter((p) => p.ready || p.id === S.hostId).length;
    $("status-label").textContent = "READY";
    $("status-value").textContent = `${ready}/${S.settings.seats}`;
    $("ready-info").textContent = `${ready} ready · ${Math.max(0, S.settings.seats - seated.length)} open`;
    const me = meP();
    const big = $("big-btn");
    if (isHost()) {
      big.textContent = seated.length === 1 ? "▼ Practise solo ▼" : "▼ Ring the dinner bell ▼";
      big.classList.remove("ready");
    } else {
      big.textContent = me && me.ready ? "✓ Ready · waiting for host" : "▼ I'm ready ▼";
      big.classList.toggle("ready", !!(me && me.ready));
    }
  }
  $("big-btn").onclick = () => {
    unlockAudio();
    if (!S) return;
    if (isHost()) send({ t: "start" });
    else { const me = meP(); send({ t: "ready", ready: !(me && me.ready) }); }
  };

  /* game */
  let lastTickSec = null;
  function renderGame(prev) {
    const g = S.game;
    const me = meP();
    $("marquee-eyebrow").textContent = `Plate ${g.round}`;
    $("marquee-title").textContent = `${g.cat.emoji} ${g.cat.prompt}`;
    $("marquee-sub").textContent = `${g.cat.size.toLocaleString()} on the menu · ${g.served.length} served`;
    $("status-label").textContent = "ALIVE";
    $("status-value").textContent = `${S.players.filter((p) => p.alive).length}/${S.players.filter((p) => p.alive || p.score || p.served).length}`;
    $("plate-dish").textContent = S.phase === "break" ? "💥" : g.cat.emoji;
    $("plate").classList.toggle("burnt", S.phase === "break");

    const holder = byId(g.holder);
    const mine = S.phase === "playing" && g.holder === S.you;
    $("answer-form").hidden = !mine;
    if (S.phase === "playing") {
      const watching = !me || !me.alive;
      $("turn-line").innerHTML = mine
        ? `<span class="you">Your plate! Serve something…</span>`
        : `${holder ? holder.emoji + " " + esc(holder.name) : "Someone"} has the plate${watching ? " · you're watching" : ""}`;
    }
    const becameMine = mine && !(prev && prev.phase === "playing" && prev.game && prev.game.holder === S.you && prev.game.turnEnd === g.turnEnd);
    if (becameMine) {
      $("answer-input").value = "";
      $("answer-input").focus({ preventScroll: true });
      sfx.yourTurn(); buzz(50);
      lastTickSec = null;
    }
    if (prev && prev.game && prev.game.holder !== g.holder) typing[prev.game.holder] = "";
    if (prev && prev.game && prev.game.round !== g.round) setFlash("", "");

    if (S.phase === "break" && g.lastPop) {
      const p = byId(g.lastPop.id);
      const secs = Math.max(0, Math.ceil((g.breakUntil - now()) / 1000));
      $("dock-burn").innerHTML = `<h3>${g.lastPop.out ? "💀" : "🔥"} ${p ? esc(p.name) : "Someone"} got burned</h3>
        <p>${g.lastPop.out ? "Out of hearts. They're off the table." : "One heart gone."} Next plate in ${secs}s.</p>
        ${g.lastPop.missed.length ? `<p>Nobody said:</p><div class="chips">${g.lastPop.missed.map((x) => `<span class="tier t${x.tier}">${esc(x.name)}</span>`).join("")}</div>` : ""}`;
      setTimeout(() => S && S.phase === "break" && renderGame(S), 1000);
    }
  }

  // the clock: ring of blocks round the plate, seconds underneath, bar under the holder
  const tctx = $("timer-canvas").getContext("2d");
  function drawTimer(frac) {
    tctx.clearRect(0, 0, 64, 64);
    const N = 28;
    const lit = Math.ceil(frac * N);
    const col = frac > 0.5 ? "#4fe0a6" : frac > 0.25 ? "#ffc54d" : "#ff4d5e";
    for (let i = 0; i < N; i++) {
      const a = -Math.PI / 2 + (i / N) * Math.PI * 2;
      const x = Math.round(32 + Math.cos(a) * 28 - 2), y = Math.round(32 + Math.sin(a) * 28 - 2);
      tctx.fillStyle = "#12070b"; tctx.fillRect(x - 1, y - 1, 6, 6);
      tctx.fillStyle = i < lit ? col : "#3d2219"; tctx.fillRect(x, y, 4, 4);
    }
  }
  function tick() {
    requestAnimationFrame(tick);
    if (!S || !S.game) { Room.setHeat(0); return; }
    if (S.phase === "break") { drawTimer(0); $("secs").textContent = "BURNED"; $("secs").classList.add("low"); Room.setHeat(1); return; }
    if (S.phase !== "playing") { Room.setHeat(0); return; }
    const g = S.game;
    const left = Math.max(0, g.turnEnd - now());
    const frac = Math.min(1, left / (g.turnLen * 1000));
    drawTimer(frac);
    const secs = $("secs");
    secs.textContent = (left / 1000).toFixed(1) + "s";
    secs.classList.toggle("low", left < 3000);
    const bar = document.querySelector(".seat.holder .tbar i");
    if (bar) { bar.style.transform = `scaleX(${frac})`; bar.style.background = frac > 0.5 ? "#4fe0a6" : frac > 0.25 ? "#ffc54d" : "#ff4d5e"; }
    Room.setHeat(1 - frac);
    const whole = Math.ceil(left / 1000);
    if (left < 3500 && whole !== lastTickSec && left > 0) { lastTickSec = whole; sfx.tick(g.holder === S.you); }
  }
  requestAnimationFrame(tick);

  // typing + answering
  let typeTimer = null;
  $("answer-input").addEventListener("input", () => {
    renderBubbles();
    clearTimeout(typeTimer);
    typeTimer = setTimeout(() => send({ t: "type", text: $("answer-input").value }), 35);
  });
  $("answer-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = $("answer-input").value.trim();
    clearTimeout(typeTimer);
    if (v) send({ t: "answer", text: v });
  });

  function setFlash(text, cls) { const f = $("flash"); f.textContent = text; f.className = "flash " + cls; }
  function onServed(m) {
    const p = byId(m.by);
    const t = TIERS[m.tier];
    sfx.pass(m.tier);
    if (m.heart) setTimeout(sfx.heart, 200);
    typing[m.by] = "";
    $("plate").classList.remove("pass"); void $("plate").offsetWidth; $("plate").classList.add("pass");
    setFlash(`${m.by === S.you ? "You" : p ? p.emoji + " " + p.name : "Someone"}: ${m.name} · ${t.name} +${m.pts}${m.heart ? " · +1 ♥" : ""}`, "good");
    setTimeout(() => renderBubbles(m.by), 30);
  }
  function onResult(m) {
    const inp = $("answer-input");
    if (m.kind === "taken") {
      const p = byId(m.by);
      setFlash(`${m.name} is already served${p ? " by " + p.name : ""}. Quick, another!`, "warn");
    } else if (m.kind === "which") {
      setFlash(`Which ${m.text}? Add their first name.`, "warn");
    } else {
      setFlash(`"${m.text}" isn't on the menu.`, "warn");
    }
    sfx.nope();
    if (m.kind === "which") inp.setSelectionRange(0, 0);
    else { inp.value = ""; send({ t: "type", text: "" }); }
    nope[S.you] = { text: m.text, until: Date.now() + 1000 };
    renderBubbles(); setTimeout(renderBubbles, 1050);
    inp.classList.remove("shake"); void inp.offsetWidth; inp.classList.add("shake");
  }
  function onBurn(m) {
    sfx.burn();
    if (m.id === (S && S.you)) buzz([120, 60, 200]);
    setTimeout(() => {
      const el = document.querySelector(`.seat[data-id="${m.id}"]`);
      if (el) { el.classList.remove("hit"); void el.offsetWidth; el.classList.add("hit"); }
    }, 60);
  }

  /* over */
  function renderOver(prev) {
    const g = S.game;
    const ranked = S.players.filter((p) => p.alive || p.score || p.served)
      .sort((a, b) => (b.id === g.winner) - (a.id === g.winner) || b.score - a.score);
    const w = byId(g.winner);
    $("marquee-eyebrow").textContent = `${g.round} plate${g.round === 1 ? "" : "s"} served`;
    $("marquee-title").textContent = "HOT PLATE";
    $("marquee-sub").textContent = "dinner's done";
    $("over-kicker").textContent = w ? "Last one at the table" : "Solo practice";
    $("over-title").textContent = w ? `${w.emoji} ${w.name} wins` : `${(meP() || {}).score || 0} points`;
    const bf = g.bestFind, bfp = bf && byId(bf.id);
    $("over-sub").textContent = bf ? `Best find: ${bf.name} (${TIERS[bf.tier].name}) by ${bfp ? bfp.name : "someone"}` : "";
    $("bill").innerHTML = ranked.map((p, i) => `<div class="bill-row"><span>${i + 1}.</span><span class="who">${p.emoji} ${esc(p.name)}</span><span class="ex">${p.served} served</span><span class="tot">${p.score}</span></div>`).join("");
    $("over-actions").innerHTML = isHost()
      ? `<button class="px-big" id="again-btn">▼ Another round ▼</button><button class="px-btn" id="lobby-btn">Back to the lobby</button>`
      : `<p class="over-sub">Waiting for the host to serve another round…</p>`;
    const again = $("again-btn"); if (again) again.onclick = () => send({ t: "start" });
    const lob = $("lobby-btn"); if (lob) lob.onclick = () => send({ t: "lobby" });
    $("status-label").textContent = "DONE";
    $("status-value").textContent = `#${g.round}`;
    if (!prev || prev.phase !== "over") sfx.win();
  }

  /* chat */
  let chatCount = 0;
  function renderChat() {
    const log = $("chat-log");
    const atBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 40;
    log.innerHTML = S.chat.map((c) => c.kind === "sys"
      ? `<li class="sys">${esc(c.text)}</li>`
      : `<li><b>${esc(c.emoji)} ${esc(c.name)}:</b> ${esc(c.text)}</li>`).join("");
    if (atBottom || S.chat.length !== chatCount) log.scrollTop = log.scrollHeight;
    chatCount = S.chat.length;
  }
  $("chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = $("chat-input").value.trim();
    if (!v) return;
    send({ t: "chat", text: v });
    $("chat-input").value = "";
  });

  /* settings */
  const STEPS = [
    { k: "hearts", label: "Hearts", vals: [1, 2, 3, 4, 5] },
    { k: "turn", label: "Turn time", vals: Array.from({ length: 16 }, (_, i) => i + 5), fmt: (v) => v + "s" },
    { k: "seats", label: "Seats", vals: Array.from({ length: 11 }, (_, i) => i + 2) },
    { k: "heartCap", label: "Heart cap", vals: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
    { k: "perHeart", label: "Points / heart", vals: PER_HEART, fmt: (v) => (v ? v : "OFF") },
    { k: "public", label: "Room", vals: [false, true], fmt: (v) => (v ? "PUBLIC" : "PRIVATE") },
  ];
  function renderSettings() {
    if (!S) return;
    const host = isHost() && S.phase !== "playing" && S.phase !== "break";
    $("steppers").innerHTML = STEPS.map((s) => {
      const v = S.settings[s.k];
      const i = s.vals.indexOf(v);
      const loop = s.k === "public";
      return `<div class="stepper" data-k="${s.k}"><span class="k">${s.label}</span>
        <button data-d="-1" aria-label="Less ${s.label}" ${!host || (!loop && i <= 0) ? "disabled" : ""}>◀</button>
        <span class="v">${s.fmt ? s.fmt(v) : v}</span>
        <button data-d="1" aria-label="More ${s.label}" ${!host || (!loop && i >= s.vals.length - 1) ? "disabled" : ""}>▶</button></div>`;
    }).join("");
    const sel = S.settings.cats.length;
    $("cats-summary").textContent = CATS.length && sel === CATS.length ? "Everything" : `${sel} picked`;
    $("settings-note").textContent = host
      ? "Each pass takes half a second off the next turn, down to 4s. Points / heart: every time you pass that many points you win a heart back, up to the cap."
      : "Only the host can change these.";
  }
  $("steppers").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-d]"); if (!b || !isHost()) return;
    const row = b.closest(".stepper");
    const s = STEPS.find((x) => x.k === row.dataset.k);
    const i = s.vals.indexOf(S.settings[s.k]);
    const n = (i + Number(b.dataset.d) + s.vals.length) % s.vals.length;
    send({ t: "settings", [s.k]: s.vals[s.k === "public" ? n : Math.max(0, Math.min(s.vals.length - 1, i + Number(b.dataset.d)))] });
  });
  $("settings-btn").onclick = () => { renderSettings(); openModal("settings-modal"); };
  $("cats-open").onclick = () => { renderCats(); openModal("cats-modal"); };
  $("how-btn").onclick = () => openModal("how-modal");
  function openModal(id) { $(id).hidden = false; }
  document.querySelectorAll(".modal").forEach((m) => m.addEventListener("click", (e) => {
    if (e.target === m || e.target.closest("[data-close]")) m.hidden = true;
  }));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") document.querySelectorAll(".modal").forEach((m) => (m.hidden = true)); });

  /* categories */
  let CATS = [];
  fetch("/api/categories").then((r) => r.json()).then((d) => { CATS = d.categories; }).catch(() => {});
  function renderCats() {
    if (!S) return;
    const host = isHost();
    const sel = new Set(S.settings.cats);
    const total = CATS.filter((c) => sel.has(c.id)).reduce((n, c) => n + c.size, 0);
    $("cats-title").textContent = `Categories · ${sel.size} · ${total.toLocaleString()} answers`;
    const groups = {};
    CATS.forEach((c) => (groups[c.group] = groups[c.group] || []).push(c));
    $("cat-groups").innerHTML = Object.entries(groups).map(([g, list]) => `
      <div class="cat-group"><h3>${esc(g)}</h3><div class="cat-list">
        ${list.map((c) => `<button class="cat-chip" data-id="${c.id}" aria-pressed="${sel.has(c.id)}" ${host ? "" : "disabled"}>${c.emoji} ${esc(c.prompt.replace(/^Name (any |an? )?/i, ""))} <small>${c.size.toLocaleString()}</small></button>`).join("")}
      </div></div>`).join("");
    $("cats-all").hidden = $("cats-rand").hidden = !host;
  }
  $("cat-groups").addEventListener("click", (e) => {
    const b = e.target.closest(".cat-chip"); if (!b || !isHost()) return;
    const sel = new Set(S.settings.cats);
    if (sel.has(b.dataset.id)) { if (sel.size === 1) return toast("Keep at least one category."); sel.delete(b.dataset.id); }
    else sel.add(b.dataset.id);
    send({ t: "settings", cats: [...sel] });
  });
  $("cats-all").onclick = () => send({ t: "settings", cats: CATS.map((c) => c.id) });
  $("cats-rand").onclick = () => send({ t: "settings", cats: CATS.map((c) => c.id).sort(() => Math.random() - 0.5).slice(0, 6) });

  /* invite, menu */
  async function invite() {
    if (!S) return;
    const link = location.origin + "/?t=" + S.code;
    if (navigator.share && matchMedia("(pointer: coarse)").matches) {
      try { await navigator.share({ title: "Hot Plate", text: `Sit at my Hot Plate table: ${S.code}`, url: link }); return; } catch {}
    }
    try { await navigator.clipboard.writeText(link); toast("Invite link copied"); }
    catch { toast("Send friends: " + link); }
  }
  $("invite-btn").onclick = invite;
  $("link-btn").onclick = invite;
  $("menu-btn").onclick = () => { const m = $("menu"); m.hidden = !m.hidden; $("menu-btn").setAttribute("aria-expanded", String(!m.hidden)); };
  document.addEventListener("click", (e) => { if (!e.target.closest(".top-left")) $("menu").hidden = true; });
  function paintMute() { $("mute-btn").textContent = "Sound: " + (muted ? "off" : "on"); }
  $("mute-btn").onclick = () => { muted = !muted; store.set("hp-muted", muted); paintMute(); };
  paintMute();
  $("leave-btn").onclick = () => { $("menu").hidden = true; if (S) send({ t: "leave" }); };

  let toastTimer = null;
  function toast(msg) { const t = $("toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 2600); }

  render();
  connect();
})();
