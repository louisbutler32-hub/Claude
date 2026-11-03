// The heads-up display over the room: badges along the top, the title (or the category
// during play), the dock along the bottom, and the end-of-game banner.
import { $, esc, TIERS } from "./util.js";
import { S, me, byId, isHost, phase, now } from "./state.js";
import { send } from "./net.js";
import { sfx, unlock } from "./sound.js";

export function renderHUD() {
  const r = S.room, ph = phase();
  document.body.dataset.phase = ph;

  // top badges
  $("code-badge").hidden = !r;
  $("count-badge").hidden = !r;
  if (r) {
    $("code-kind").textContent = r.settings.public ? "public" : "private";
    $("code-value").textContent = r.code;
    const seated = r.players.filter((p) => p.connected);
    if (ph === "lobby") {
      const ready = seated.filter((p) => p.ready || p.id === r.hostId).length;
      setCount("ready", `${ready}/${r.settings.seats}`);
    } else {
      const inGame = r.players.filter((p) => p.alive || p.score || p.served);
      setCount("at the table", `${r.players.filter((p) => p.alive).length}/${inGame.length}`);
    }
  }
  $("phase-label").textContent = { home: "", lobby: "lobby", play: `plate ${r && r.game ? r.game.round : ""}`, break: "burned!", over: "game over" }[ph];

  // title, or the category being served
  if (ph === "play" || ph === "break") {
    const g = r.game;
    $("title").hidden = true;
    $("prompt").hidden = false;
    $("prompt-text").textContent = `${g.cat.emoji} ${g.cat.prompt}`;
    $("prompt-meta").textContent = `${g.cat.size.toLocaleString()} on the menu · ${g.served.length} served`;
  } else {
    $("title").hidden = ph === "over";
    $("prompt").hidden = true;
  }

  $("dock-lobby").hidden = ph !== "lobby";
  $("dock-play").hidden = ph !== "play";
  $("dock-burn").hidden = ph !== "break";
  $("over").hidden = ph !== "over";
  if (ph === "lobby") renderLobbyDock();
  if (ph === "play") renderPlayDock();
  if (ph === "break") renderBurn();
  if (ph === "over") renderOver();
}

function setCount(label, value) { $("count-label").textContent = label; $("count-value").textContent = value; }

/* ---------- lobby ---------- */

function renderLobbyDock() {
  const r = S.room;
  const seated = r.players.filter((p) => p.connected);
  const ready = seated.filter((p) => p.ready || p.id === r.hostId).length;
  $("ready-info").textContent = `${ready} ready · ${Math.max(0, r.settings.seats - seated.length)} open`;
  const big = $("big-btn"), m = me();
  if (isHost()) {
    big.innerHTML = seated.length === 1 ? "▼ practise solo ▼" : "▼ ring the dinner bell ▼";
    big.classList.remove("is-ready");
  } else {
    big.innerHTML = m && m.ready ? "✓ ready · waiting for host" : "▼ i'm ready ▼";
    big.classList.toggle("is-ready", !!(m && m.ready));
  }
}
$("big-btn").onclick = () => {
  unlock();
  if (!S.room) return;
  if (isHost()) { sfx.bell(); send({ t: "start" }); }
  else { const m = me(); send({ t: "ready", ready: !(m && m.ready) }); }
};

/* ---------- play ---------- */

function renderPlayDock() {
  const r = S.room, g = r.game, p = S.prev;
  const mine = g.holder === r.you;
  const holder = byId(g.holder), m = me();
  $("answer-form").hidden = !mine;
  $("turn-line").hidden = mine;
  if (!mine) $("turn-line").innerHTML = `${holder ? `${holder.emoji} <b>${esc(holder.name)}</b>` : "someone"} has the plate${!m || !m.alive ? " · you're watching" : ""}`;
  const fresh = mine && !(p && p.phase === "playing" && p.game && p.game.holder === r.you && p.game.turnEnd === g.turnEnd);
  if (fresh) {
    $("answer-input").value = "";
    $("answer-input").focus({ preventScroll: true });
  }
  if (p && p.game && p.game.round !== g.round) flash("", "");
  return fresh;
}

export function flash(text, cls) { const f = $("flash"); f.textContent = text; f.className = "flash " + cls; }

function renderBurn() {
  const g = S.room.game, pop = g.lastPop;
  if (!pop) return;
  const p = byId(pop.id);
  const secs = Math.max(0, Math.ceil((g.breakUntil - now()) / 1000));
  $("dock-burn").innerHTML = `
    <p class="burn-head">${pop.out ? "💀" : "🔥"} <b>${p ? esc(p.name) : "someone"}</b> got burned${pop.out ? " and is out" : ""}</p>
    ${pop.missed.length ? `<p class="burn-sub">nobody said</p><div class="chips">${pop.missed.map((x) => `<span class="chip t${x.tier}">${esc(x.name)}</span>`).join("")}</div>` : ""}
    <p class="burn-sub">next plate in ${secs}s</p>`;
}

/* ---------- game over ---------- */

function renderOver() {
  const r = S.room, g = r.game;
  const w = byId(g.winner);
  const youWon = w && w.id === r.you;
  $("over-title").textContent = youWon ? "YOU WIN" : w ? `${w.name} wins` : `${(me() || {}).score || 0} points`;
  $("over-sub").textContent = w ? (w.winStreak >= 2 ? `last one at the table · ${w.winStreak} wins in a row 👑` : "last one at the table") : "solo practice";
  const bf = g.bestFind, bfp = bf && byId(bf.id);
  $("over-find").textContent = bf ? `best find: ${bf.name} (${TIERS[bf.tier].name.toLowerCase()}) by ${bfp ? bfp.name : "someone"}` : "";
  $("over-actions").innerHTML = isHost()
    ? `<button class="btn big" id="again-btn">rematch</button><button class="btn" id="lobby-btn">back to the lobby</button>`
    : `<p class="muted">waiting for the host to start a rematch…</p>`;
  const a = $("again-btn"); if (a) a.onclick = () => { sfx.bell(); send({ t: "start" }); };
  const l = $("lobby-btn"); if (l) l.onclick = () => send({ t: "lobby" });
}
