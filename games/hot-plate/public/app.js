// Hot Plate client. The server decides everything; this file draws the latest state and sends what the player does.
(() => {
  const $ = (id) => document.getElementById(id);
  const EMOJIS = ["😎", "🤠", "👽", "🦊", "🐸", "🤖", "👻", "🐼", "🦄", "💀", "🧃", "🍉", "🐙", "🦖", "🍄", "🐝"];
  const TIERS = [
    { name: "Bread Basket", pts: 10 },
    { name: "Side Dish", pts: 25 },
    { name: "Main Course", pts: 50 },
    { name: "Chef's Secret", pts: 100 },
  ];
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} },
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------------- sound ---------------- */
  let actx = null;
  let muted = !!store.get("hp-muted");
  function tone(freq, dur = 0.12, type = "sine", vol = 0.12, delay = 0) {
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
    pass(tier) { const base = [523, 587, 698, 880][tier]; tone(base, 0.1, "triangle"); tone(base * 1.5, 0.14, "triangle", 0.1, 0.07); if (tier === 3) tone(base * 2, 0.2, "triangle", 0.1, 0.15); },
    yourTurn() { tone(880, 0.08, "square", 0.05); tone(1175, 0.1, "square", 0.05, 0.08); },
    miss() { tone(200, 0.18, "sawtooth", 0.06); },
    taken() { tone(330, 0.08, "square", 0.05); tone(260, 0.12, "square", 0.05, 0.08); },
    burn() { tone(120, 0.5, "sawtooth", 0.12); tone(80, 0.6, "square", 0.08, 0.1); },
    win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.2, "triangle", 0.12, i * 0.12)); },
  };
  const buzz = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch {} };

  /* ---------------- connection ---------------- */
  let ws = null, retry = 0, queue = [];
  let session = store.get("hp-session");   // { code, id, token }
  let S = null;                            // latest room state
  let clockOffset = 0;
  let autoRejoin = !!session;

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

  /* ---------------- profile (home) ---------------- */
  const profile = store.get("hp-profile") || { name: "", emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)] };
  $("name-input").value = profile.name;
  function renderEmojis() {
    $("emoji-row").innerHTML = EMOJIS.map((e) => `<button type="button" role="radio" aria-checked="${e === profile.emoji}" aria-label="${e}">${e}</button>`).join("");
  }
  $("emoji-row").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    profile.emoji = b.textContent; store.set("hp-profile", profile); renderEmojis();
  });
  $("name-input").addEventListener("input", () => { profile.name = $("name-input").value.trim(); store.set("hp-profile", profile); });
  renderEmojis();

  function needName() {
    if (profile.name) return false;
    $("home-error").textContent = "Pop your name in first.";
    $("name-input").focus();
    return true;
  }
  $("create-btn").onclick = () => {
    if (needName()) return;
    unlockAudio();
    session = null; autoRejoin = false;
    send({ t: "create", name: profile.name, emoji: profile.emoji });
  };
  $("join-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (needName()) return;
    const code = $("code-input").value.trim().toUpperCase();
    if (!/^[A-Z]{4}$/.test(code)) { $("home-error").textContent = "Table codes are four letters."; return; }
    unlockAudio();
    if (session && session.code === code) return send({ t: "rejoin", ...session, name: profile.name, emoji: profile.emoji });
    session = null; autoRejoin = false;
    send({ t: "join", code, name: profile.name, emoji: profile.emoji });
  });
  $("code-input").addEventListener("input", (e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, ""); });
  function unlockAudio() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume(); } catch {} }

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
        if (m.game) clockOffset = m.game.now - Date.now();
        render(prev);
        break;
      }
      case "typing":
        if (S && S.game && S.game.holder === m.id && m.id !== S.you) { $("bubble").textContent = m.text; }
        break;
      case "served": onServed(m); break;
      case "result": onResult(m); break;
      case "pop": onPop(m); break;
      case "error":
        if (autoRejoin) { session = null; store.del("hp-session"); autoRejoin = false; show("scr-home"); break; }
        $("home-error").textContent = m.msg;
        show("scr-home");
        break;
      case "left":
        session = null; store.del("hp-session"); S = null;
        history.replaceState(null, "", "/");
        show("scr-home");
        break;
    }
  }

  /* ---------------- render ---------------- */
  function show(id) {
    for (const s of document.querySelectorAll(".screen")) s.hidden = s.id !== id;
  }
  const meP = () => S && S.players.find((p) => p.id === S.you);
  const byId = (id) => S && S.players.find((p) => p.id === id);
  const isHost = () => S && S.hostId === S.you;

  function render(prev) {
    if (!S) return show("scr-home");
    if (S.phase === "lobby") { show("scr-lobby"); renderLobby(); }
    else if (S.phase === "over") { show("scr-over"); renderOver(prev); }
    else { show("scr-game"); renderGame(prev); }
  }

  /* lobby */
  let CATS = [], catsLoaded = false;
  fetch("/api/categories").then((r) => r.json()).then((d) => { CATS = d.categories; catsLoaded = true; if (S && S.phase === "lobby") renderLobby(); }).catch(() => {});

  function renderLobby() {
    $("room-code").textContent = S.code;
    const link = location.origin + "/?t=" + S.code;
    $("link-text").textContent = link;
    $("lobby-players").innerHTML = S.players.filter((p) => p.connected).map((p) =>
      `<li class="${p.id === S.you ? "me" : ""}"><span>${p.emoji}</span><span>${esc(p.name)}</span>${p.id === S.hostId ? `<span class="host">host</span>` : ""}</li>`).join("");
    const host = isHost();
    $("host-panel").hidden = !host;
    const hostP = byId(S.hostId);
    $("guest-wait").textContent = host ? "" : `Waiting for ${hostP ? hostP.emoji + " " + hostP.name : "the host"} to serve the first plate…`;
    if (!host) return;
    $("hearts-seg").innerHTML = [1, 2, 3, 4, 5].map((h) => `<button data-h="${h}" aria-pressed="${S.settings.hearts === h}">❤️ ${h}</button>`).join("");
    if (!catsLoaded) return;
    const sel = new Set(S.settings.cats);
    const groups = {};
    CATS.forEach((c) => (groups[c.group] = groups[c.group] || []).push(c));
    const total = CATS.filter((c) => sel.has(c.id)).reduce((n, c) => n + c.size, 0);
    $("cat-count").textContent = `Categories · ${sel.size} picked · ${total.toLocaleString()} answers`;
    $("cat-groups").innerHTML = Object.entries(groups).map(([g, list]) => `
      <div class="cat-group"><h3>${esc(g)}</h3><div class="cat-list">
        ${list.map((c) => `<button class="cat-chip" data-id="${c.id}" aria-pressed="${sel.has(c.id)}">${c.emoji} ${esc(c.prompt.replace(/^Name (any |an? )?/i, ""))} <small>${c.size.toLocaleString()}</small></button>`).join("")}
      </div></div>`).join("");
  }
  $("hearts-seg").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b || !isHost()) return;
    send({ t: "settings", hearts: +b.dataset.h });
  });
  $("cat-groups").addEventListener("click", (e) => {
    const b = e.target.closest(".cat-chip"); if (!b || !isHost()) return;
    const sel = new Set(S.settings.cats);
    if (sel.has(b.dataset.id)) { if (sel.size === 1) return toast("Keep at least one category."); sel.delete(b.dataset.id); }
    else sel.add(b.dataset.id);
    send({ t: "settings", cats: [...sel] });
  });
  $("cats-all").onclick = () => send({ t: "settings", cats: CATS.map((c) => c.id) });
  $("cats-none").onclick = () => {
    const ids = CATS.map((c) => c.id).sort(() => Math.random() - 0.5).slice(0, 6);
    if (ids.length) send({ t: "settings", cats: ids });
  };
  $("start-btn").onclick = () => { unlockAudio(); send({ t: "start" }); };
  $("copy-link").onclick = async () => {
    const link = location.origin + "/?t=" + S.code;
    if (navigator.share && matchMedia("(pointer: coarse)").matches) {
      try { await navigator.share({ title: "Hot Plate", text: `Join my Hot Plate table: ${S.code}`, url: link }); return; } catch {}
    }
    try { await navigator.clipboard.writeText(link); toast("Invite link copied"); }
    catch { toast("Copy this: " + link); }
  };
  $("lobby-leave").onclick = $("game-leave").onclick = () => { send({ t: "leave" }); };

  /* game */
  let heatRaf = null;
  function renderGame(prev) {
    const g = S.game;
    const me = meP();
    $("game-meta").textContent = `${S.code} · plate ${g.round}`;
    $("prompt").textContent = `${g.cat.emoji} ${g.cat.prompt}`;
    $("prompt-sub").textContent = `${g.cat.size.toLocaleString()} answers on the menu · ${g.served.length} served`;

    // seats around the table
    const players = S.players.filter((p) => p.connected || p.alive || p.score);
    const n = players.length;
    const table = $("table");
    const size = table.clientWidth || 320;
    const r = size * 0.43;
    let html = "";
    let holderAngle = 0;
    players.forEach((p, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      if (p.id === g.holder) holderAngle = a;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      const cls = ["seat", p.id === S.you ? "me" : "", p.id === g.holder && S.phase === "playing" ? "holder" : "", p.alive ? "" : "out", p.connected ? "" : "away"].join(" ");
      html += `<div class="${cls}" data-id="${p.id}" style="transform:translate(${x.toFixed(1)}px,${y.toFixed(1)}px)">
        <div class="face">${p.emoji}</div><div class="nm">${esc(p.name)}</div>
        <div class="hp">${p.alive ? "❤️".repeat(p.hearts) : p.hearts === 0 && g.round > 0 ? "💀" : "👀"}</div><div class="sc">${p.score}</div></div>`;
    });
    table.querySelectorAll(".seat").forEach((el) => el.remove());
    table.insertAdjacentHTML("beforeend", html);
    $("pointer").style.transform = `rotate(${(holderAngle * 180) / Math.PI + 90}deg)`;
    $("pointer").hidden = S.phase !== "playing";
    $("plate").classList.toggle("burnt", S.phase === "break");
    $("plate-face").textContent = S.phase === "break" ? "💥" : g.cat.emoji;

    // whose turn
    const holder = byId(g.holder);
    const mine = S.phase === "playing" && g.holder === S.you;
    const watching = !me || (!me.alive && g.round > 0);
    $("answer-form").hidden = !mine;
    $("bubble").hidden = mine || S.phase !== "playing";
    if (S.phase === "playing") {
      $("turn-who").innerHTML = mine
        ? `<span class="you">Your plate! Name one…</span>`
        : `${holder ? holder.emoji + " " + esc(holder.name) : "Someone"} is holding the plate${watching ? " · you're watching" : ""}`;
    } else {
      $("turn-who").textContent = "";
    }
    const becameMine = mine && !(prev && prev.phase === "playing" && prev.game && prev.game.holder === S.you && prev.game.round === g.round);
    if (becameMine) {
      $("answer-input").value = "";
      $("answer-input").focus({ preventScroll: true });
      sfx.yourTurn(); buzz(60);
    }
    if (!prev || !prev.game || prev.game.holder !== g.holder || prev.game.round !== g.round) $("bubble").textContent = "";
    if (prev && prev.game && prev.game.round !== g.round) setFlash("", "");

    // burned panel
    const burn = $("burn");
    if (S.phase === "break" && g.lastPop) {
      const p = byId(g.lastPop.id);
      const secs = Math.max(0, Math.round((g.breakUntil - (Date.now() + clockOffset)) / 1000));
      burn.hidden = false;
      burn.innerHTML = `<h3>${g.lastPop.out ? "💀" : "🔥"} ${p ? esc(p.name) : "Someone"} got burned</h3>
        <p>${g.lastPop.out ? "Out of hearts. They're off the table." : "That's a heart gone."} Next plate in ${secs}s.</p>
        ${g.lastPop.missed.length ? `<p>Nobody said:</p><div class="chips" style="justify-content:center">${g.lastPop.missed.map((x) => chip(x)).join("")}</div>` : ""}`;
    } else burn.hidden = true;

    // served list
    $("served-label").textContent = g.served.length ? "Already served (off the menu)" : "";
    $("served").innerHTML = g.served.map((s, i) => chip(s, i === 0 && prev && prev.game && prev.game.served.length < g.served.length)).join("");

    // heat: grows with time since the plate came out (the real fuse is secret)
    cancelAnimationFrame(heatRaf);
    const loop = () => {
      if (!S || !S.game || S.phase !== "playing") { document.documentElement.style.setProperty("--heat", S && S.phase === "break" ? 1 : 0); return; }
      const t = (Date.now() + clockOffset - S.game.startedAt) / 1000;
      document.documentElement.style.setProperty("--heat", Math.min(1, t / 30).toFixed(3));
      heatRaf = requestAnimationFrame(loop);
    };
    loop();
    if (S.phase === "break") setTimeout(() => S && S.phase === "break" && renderGame(S), 1000);
  }
  function chip(s, isNew) {
    const p = s.by && byId(s.by);
    return `<span class="chip t${s.tier}${isNew ? " new" : ""}" title="${TIERS[s.tier].name}"><span>${esc(s.name)}</span><small>${p ? p.emoji : TIERS[s.tier].pts}</small></span>`;
  }

  // typing + answering
  let typeTimer = null;
  $("answer-input").addEventListener("input", () => {
    clearTimeout(typeTimer);
    typeTimer = setTimeout(() => send({ t: "type", text: $("answer-input").value }), 40);
  });
  $("answer-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = $("answer-input").value.trim();
    if (v) send({ t: "answer", text: v });
  });

  function setFlash(text, cls) { const f = $("flash"); f.textContent = text; f.className = "flash " + cls; }
  function onServed(m) {
    const p = byId(m.by);
    const t = TIERS[m.tier];
    sfx.pass(m.tier);
    $("plate").classList.remove("pass"); void $("plate").offsetWidth; $("plate").classList.add("pass");
    if (m.by === S.you) {
      setFlash(`${m.name} · ${t.name} · +${m.pts}`, "good");
      const r = $("answer-input").getBoundingClientRect();
      const f = document.createElement("div");
      f.className = "fly"; f.textContent = `+${m.pts}`;
      f.style.left = r.left + r.width / 2 + "px"; f.style.top = r.top - 10 + "px";
      document.body.appendChild(f); setTimeout(() => f.remove(), 1200);
    } else {
      setFlash(`${p ? p.emoji + " " + p.name : "Someone"}: ${m.name} · ${t.name}`, "good");
    }
  }
  function onResult(m) {
    const inp = $("answer-input");
    if (m.kind === "taken") {
      const p = byId(m.by);
      setFlash(`${m.name} is already served${p ? " by " + p.emoji + " " + p.name : ""}. Quick, another!`, "warn");
      sfx.taken();
    } else if (m.kind === "which") {
      setFlash(`Which ${m.text}? Add their first name.`, "warn");
      sfx.taken();
    } else {
      setFlash(`"${m.text}" isn't on the menu.`, "warn");
      sfx.miss();
    }
    if (m.kind === "which") {
      inp.setSelectionRange(0, 0); // cursor at the start, ready for the first name
    } else {
      inp.value = "";
      send({ t: "type", text: "" });
    }
    inp.classList.remove("shake"); void inp.offsetWidth; inp.classList.add("shake");
  }
  function onPop(m) {
    sfx.burn();
    if (m.id === (S && S.you)) buzz([120, 60, 200]);
    setTimeout(() => {
      const el = document.querySelector(`.seat[data-id="${m.id}"]`);
      if (el) { el.classList.remove("hit"); void el.offsetWidth; el.classList.add("hit"); }
    }, 50);
  }

  /* over */
  function renderOver(prev) {
    const g = S.game;
    const ranked = [...S.players].filter((p) => p.alive || p.score || p.served || p.connected)
      .sort((a, b) => (b.id === g.winner) - (a.id === g.winner) || b.score - a.score);
    const w = byId(g.winner);
    if (w) {
      $("over-emoji").textContent = w.emoji;
      $("over-kicker").textContent = "Last one at the table";
      $("over-title").textContent = `${w.name} wins`;
    } else {
      const me = meP();
      $("over-emoji").textContent = "🍽️";
      $("over-kicker").textContent = "Solo practice";
      $("over-title").textContent = `${me ? me.score : 0} points`;
    }
    const bf = g.bestFind;
    const bfp = bf && byId(bf.id);
    $("over-sub").textContent = bf ? `Best find: ${bf.name} (${TIERS[bf.tier].name}) by ${bfp ? bfp.emoji + " " + bfp.name : "someone"}` : "";
    $("bill").innerHTML = `<h3>The Bill</h3>` + ranked.map((p, i) => `
      <div class="bill-row"><span>${i + 1}</span><span class="who">${p.emoji} ${esc(p.name)}</span>
      <span class="ex">${p.served} served</span><span class="tot">${p.score}</span></div>`).join("");
    $("over-actions").innerHTML = isHost()
      ? `<button class="big-btn" id="again-btn">Play again</button><button class="pill" id="lobby-btn">Change categories</button><button class="pill" id="over-leave">Leave table</button>`
      : `<p class="waiting">Waiting for the host to start another round…</p><button class="pill" id="over-leave">Leave table</button>`;
    const again = $("again-btn"); if (again) again.onclick = () => send({ t: "start" });
    const lob = $("lobby-btn"); if (lob) lob.onclick = () => send({ t: "lobby" });
    $("over-leave").onclick = () => send({ t: "leave" });
    if (!prev || prev.phase !== "over") sfx.win();
  }

  /* misc */
  let toastTimer = null;
  function toast(msg) { const t = $("toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 2600); }
  function paintMute() { $("mute-btn").textContent = muted ? "🔇" : "🔊"; }
  $("mute-btn").onclick = () => { muted = !muted; store.set("hp-muted", muted); paintMute(); };
  paintMute();
  window.addEventListener("resize", () => { if (S && S.game && (S.phase === "playing" || S.phase === "break")) renderGame(S); });

  show("scr-home");
  connect();
})();
