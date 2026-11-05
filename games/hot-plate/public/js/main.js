// Boots the app and routes server messages to the parts of the screen that care.
import { $, buzz, replay, TIERS } from "./util.js";
import { S, setRoom, profile, phase, seating, byId } from "./state.js";
import { connect, on, send, getSession, setSession } from "./net.js";
import { sfx, setSizzle } from "./sound.js";
import { burst, floatScore, kissBanner, shake, pop, turnBanner } from "./fx.js";
import { Scene, layout } from "./scene.js";
import * as table from "./table.js";
import { renderHUD, flash } from "./hud.js";
import { renderPanel, refreshModals } from "./panels.js";
import { showError, startTableList, readLinkCode, refreshFaces } from "./home.js";
import { renderAccount } from "./account.js";

/* ---------- stage geometry ---------- */

const stage = $("stage");
const scene = new Scene($("room-bg"), $("room-fx"));
let geoKey = "";
// below this width the table is too narrow to hold the question, so it gets its own band
// at the top of the screen instead (matches the max-width: 699px rule in style.css)
const PHONE = 700;

function relayout(force) {
  const W = stage.clientWidth, H = stage.clientHeight;
  const { count } = seating();
  const wide = W >= 1100;
  // the big title (home, lobby, game over) needs more headroom than the one-line category
  const ph = phase(), titled = ph === "home" || ph === "lobby" || ph === "over";
  const area = wide
    ? { left: 40, right: S.room && !document.body.classList.contains("chat-closed") ? 340 : 40, top: titled ? 185 : 150, bottom: 150 }
    : { left: 14, right: 14, top: titled ? 190 : W < PHONE ? 215 : 160, bottom: W < PHONE ? 160 : 140 };
  // on phones the question has its own band at the top: fit the table between it and the dock
  if (W < PHONE && !titled && !$("prompt").hidden) {
    const st = stage.getBoundingClientRect();
    area.top = Math.round($("prompt").getBoundingClientRect().bottom - st.top + 66);
    area.bottom = Math.round(Math.max(140, st.bottom - $("dock").getBoundingClientRect().top + 24));
  }
  const key = [W, H, count, area.right, area.top, area.bottom].join("x");
  if (!force && key === geoKey) return;
  geoKey = key;
  const L = layout(W, H, count, area);
  scene.draw(L);
  table.setLayout(L);
  // during play the question box sits in the middle of the table, sized to fit inside it
  const css = document.documentElement.style;
  css.setProperty("--prompt-x", L.centre.x.toFixed(0) + "px");
  // vertically: midway between the far seats' points tally and the near seats' heads
  const P = L.P, cyPx = L.cy * P, ryPx = L.ry * P;
  const far = L.seats.filter((s) => Math.sin(s.a) < -0.3).map((s) => s.y + 27 * P);
  const near = L.seats.filter((s) => Math.sin(s.a) > 0.3).map((s) => s.y - 31 * P - 10);
  const hi = far.length ? Math.max(...far) : cyPx - ryPx * 0.6;
  const lo = near.length ? Math.min(...near) : cyPx + ryPx * 0.6;
  css.setProperty("--prompt-y", ((hi + lo) / 2).toFixed(0) + "px");
  // wide enough to read, narrow enough to stay between the side seats' place settings
  const gap = 2 * (L.rx * 0.84 - 22) * L.P - 20;
  css.setProperty("--prompt-w", Math.round(Math.max(220, Math.min(360, gap))) + "px");
  table.renderSeats();
  table.renderBubbles();
  table.placeCloche();
}
new ResizeObserver(() => relayout()).observe(stage);
window.addEventListener("hp-layout", () => relayout());

function render() {
  const ph = phase();
  $("home").hidden = ph !== "home";
  relayout();
  renderHUD();
  relayout(); // again, now the question box and dock have their final size
  renderPanel();
  refreshModals();
  table.renderSeats();
  table.renderBubbles();
  table.placeCloche();
  if (ph === "break") setTimeout(() => phase() === "break" && renderHUD(), 1000);
}

/* ---------- messages ---------- */

const prevOf = () => S.prev && S.prev.game;

on("avatar", (m) => { S.avatars[m.id] = m.img; table.renderSeats(); });

on("welcome", (m) => {
  setSession({ code: m.code, id: m.id, token: m.token });
  if (profile.img) S.avatars[m.id] = profile.img;
  history.replaceState(null, "", "/?t=" + m.code);
  showError("");
});

on("state", (m) => {
  setRoom(m);
  const p = prevOf(), g = m.game;
  if (p && g && p.holder !== g.holder) table.clearTyping(p.holder);
  // your turn
  if (m.phase === "playing" && g.holder === m.you && !(S.prev && S.prev.phase === "playing" && p && p.holder === m.you && p.turnEnd === g.turnEnd)) {
    sfx.yourTurn(); buzz(50); lastTick = null; turnBanner();
  }
  if (m.phase === "over" && (!S.prev || S.prev.phase !== "over")) sfx.win();
  render();
});

on("typing", (m) => table.setTyping(m.id, m.text));
on("drafting", (m) => table.setDrafting(m.id, m.on));
on("account", () => { refreshFaces(); render(); });
on("nope", (m) => table.setNope(m.id, m.text));

on("served", (m) => {
  const p = byId(m.by), t = TIERS[m.tier];
  if (m.kiss) { sfx.kiss(); kissBanner(m.by === S.room.you ? "You" : p ? p.name : "Someone", m.name); shake(6); }
  else { sfx.pass(m.tier); if (m.tier === 3) shake(3); }
  if (m.by === S.room.you) $("answer-input").value = ""; // served: clear the box for your next turn
  const at = table.seatPoint(m.by);
  if (at) { burst(at.x, at.y, m.tier); floatScore(at.x, at.y - 30, m.pts, m.tier, m.mult); }
  if (m.heart) setTimeout(sfx.heart, 200);
  table.clearTyping(m.by);
  const spicy = m.mult > 1 ? ` · 🌶️ ×${m.mult}` : "";
  flash(`${m.by === S.room.you ? "you" : p ? p.name : "someone"}: ${m.name} · ${t.name.toLowerCase()} +${m.pts}${spicy}${m.heart ? " · +1 ♥" : ""}`, "good");
  setTimeout(() => table.renderBubbles(m.by), 30);
});

on("result", (m) => {
  const inp = $("answer-input");
  if (m.kind === "taken") { const p = byId(m.by); flash(`${m.name} is already served${p ? " by " + p.name : ""}. quick, another!`, "warn"); }
  else if (m.kind === "which") flash(`which ${m.text}? add their first name.`, "warn");
  else flash(`"${m.text}" isn't on the menu`, "warn");
  sfx.nope();
  if (m.kind === "which") inp.setSelectionRange(0, 0);
  else { inp.value = ""; send({ t: "type", text: "" }); }
  table.setNope(S.room.you, m.text, 1000);
  replay(inp, "shake");
});

on("burn", (m) => {
  sfx.burn();
  const at = table.clochePoint();
  if (at) pop(at.x, at.y);
  shake(5);
  replay($("cloche"), "popped");
  if (m.id === S.room.you) buzz([120, 60, 200]);
  setTimeout(() => replay(document.querySelector(`.seat[data-id="${m.id}"]`), "hit"), 60);
});

on("error", (m) => {
  // a stale seat from an old visit: quietly forget it
  if (autoRejoin) { autoRejoin = false; setSession(null); setRoom(null); render(); return; }
  showError(m.msg);
  setRoom(null); render();
});

on("left", () => {
  setSession(null); setRoom(null);
  history.replaceState(null, "", "/");
  render();
});

/* ---------- answering ---------- */

let typeTimer = null;
$("answer-input").addEventListener("input", () => {
  table.renderBubbles();
  clearTimeout(typeTimer);
  typeTimer = setTimeout(() => send({ t: "type", text: $("answer-input").value }), 35);
});
$("answer-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const v = $("answer-input").value.trim();
  clearTimeout(typeTimer);
  const r = S.room;
  if (!r || !r.game || r.game.holder !== r.you) return flash("not your plate yet · keep it ready", "warn");
  if (v) send({ t: "answer", text: v });
});

/* ---------- the clock ---------- */

// your own turn: a bar that drains from green to red, flashing near the end
const bar = $("turn-bar"), barFill = $("turn-bar-fill");
function turnBar(heat) {
  const r = S.room;
  const playing = !!(r && r.phase === "playing" && r.game);
  const mine = playing && r.game.holder === r.you;
  // the bar keeps its space during play so the dock doesn't jump; only you see it fill
  if (bar.hidden === playing) bar.hidden = !playing;
  bar.classList.toggle("idle", !mine);
  if (!mine) return;
  const frac = Math.max(0, 1 - heat);
  barFill.style.width = (frac * 100).toFixed(1) + "%";
  barFill.style.setProperty("--hue", Math.round(120 * frac));
  bar.classList.toggle("urgent", frac < 0.3);
}

let lastTick = null;
function frame() {
  requestAnimationFrame(frame);
  const heat = table.tickClock((left) => {
    const whole = Math.ceil(left / 1000);
    if (left < 3500 && left > 0 && whole !== lastTick) { lastTick = whole; sfx.tick(S.room.game.holder === S.room.you); }
  });
  scene.setHeat(heat);
  turnBar(heat);
  setSizzle(S.room && S.room.phase === "playing" ? heat : 0);
}
requestAnimationFrame(frame);

/* ---------- boot ---------- */

const link = readLinkCode();
let autoRejoin = !!getSession();
if (link && getSession() && getSession().code !== link) { setSession(null); autoRejoin = false; }
on("welcome", () => { autoRejoin = false; });
startTableList();
renderAccount();
render();
connect(() => profile);
