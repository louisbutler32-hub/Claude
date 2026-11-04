// Boots the app and routes server messages to the parts of the screen that care.
import { $, buzz, replay, TIERS } from "./util.js";
import { S, setRoom, profile, phase, seating, byId } from "./state.js";
import { connect, on, send, getSession, setSession } from "./net.js";
import { sfx, setSizzle } from "./sound.js";
import { burst, floatScore, kissBanner, shake, pop } from "./fx.js";
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

function relayout(force) {
  const W = stage.clientWidth, H = stage.clientHeight;
  const { count } = seating();
  const wide = W >= 1100;
  // the big title (home, lobby, game over) needs more headroom than the one-line category
  const ph = phase(), titled = ph === "home" || ph === "lobby" || ph === "over";
  const area = wide
    ? { left: 40, right: S.room && !document.body.classList.contains("chat-closed") ? 340 : 40, top: titled ? 185 : 140, bottom: 150 }
    : { left: 14, right: 14, top: titled ? 190 : 140, bottom: 130 };
  const key = [W, H, count, area.right, area.top].join("x");
  if (!force && key === geoKey) return;
  geoKey = key;
  const L = layout(W, H, count, area);
  scene.draw(L);
  table.setLayout(L);
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
    sfx.yourTurn(); buzz(50); lastTick = null;
  }
  if (m.phase === "over" && (!S.prev || S.prev.phase !== "over")) sfx.win();
  render();
});

on("typing", (m) => table.setTyping(m.id, m.text));
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

let lastTick = null;
function frame() {
  requestAnimationFrame(frame);
  const heat = table.tickClock((left) => {
    const whole = Math.ceil(left / 1000);
    if (left < 3500 && left > 0 && whole !== lastTick) { lastTick = whole; sfx.tick(S.room.game.holder === S.room.you); }
  });
  scene.setHeat(heat);
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
