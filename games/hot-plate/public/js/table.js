// Everything that sits on the tablecloth: place settings with each player behind theirs,
// answer bubbles, and the hot plate (a silver cloche) that slides to whoever holds it.
import { $, esc, TIERS, replay } from "./util.js";
import { S, now, seating, phase } from "./state.js";
import { placeSetting, avatar, cloche } from "./sprites.js";

let L = null;
const urls = new Map();
function spriteURL(key, make) {
  if (!urls.has(key)) urls.set(key, make().toDataURL());
  return urls.get(key);
}
// sprites are drawn at art-pixel size; [w, h] here are those sizes, scaled up crisply
const SIZE = { setting: [40, 22], face: [18, 18] };
const img = (key, make, scale, cls) => {
  const [w, h] = SIZE[cls];
  return `<img class="px ${cls}" src="${spriteURL(key, make)}" alt="" width="${w * scale}" height="${h * scale}">`;
};

export function setLayout(layout) { L = layout; }

// a player's answer sits beside their place setting, on the side facing into the table
function bubbleSpot(seat) {
  const side = Math.cos(seat.a) > 0.15 ? "left" : "right";
  return { x: seat.x + (side === "right" ? 1 : -1) * 21 * L.P, y: seat.y - 12 * L.P, side };
}
// the hot plate hovers just above the holder's head, or under the name for the far seats
function clocheSpot(seat) {
  return Math.sin(seat.a) < -0.45 ? { x: seat.x, y: seat.y + 30 * L.P } : { x: seat.x, y: seat.y - 44 * L.P };
}

/* ---------- seats ---------- */

export function renderSeats() {
  if (!L) return;
  const r = S.room, ph = phase();
  const { players } = seating();
  const g = r && r.game;
  const inGame = ph === "play" || ph === "break" || ph === "over";
  const maxHearts = r ? Math.max(r.settings.hearts, ...players.map((p) => p.hearts)) : 0;
  let html = "";
  L.seats.forEach((seat, i) => {
    const p = players[i];
    const pos = `left:${seat.x.toFixed(1)}px;top:${seat.y.toFixed(1)}px;z-index:${Math.round(seat.y)}`;
    const setting = img(p ? "set" : "set-dim", () => placeSetting({ dim: !p }), L.P, "setting");
    if (!p) { html += `<div class="seat empty" style="${pos}"><div class="figure">${setting}</div>${r ? `<div class="nm">open seat</div>` : ""}</div>`; return; }
    const holder = g && ph === "play" && g.holder === p.id;
    const winner = ph === "over" && g && g.winner === p.id;
    const cls = ["seat", p.id === r.you ? "me" : "", holder ? "holder" : "", inGame && !p.alive ? "out" : "", p.connected ? "" : "away", winner ? "winner" : ""].join(" ");
    let under;
    if (!inGame) under = `<div class="tag">${p.id === r.hostId ? "host" : p.ready ? "ready" : "&nbsp;"}</div>`;
    else {
      const lost = Math.max(0, maxHearts - p.hearts);
      under = `<div class="hp"><b>${"♥".repeat(p.hearts)}</b><i>${"♥".repeat(lost)}</i></div><div class="sc">${p.score}</div>`;
    }
    html += `<div class="${cls}" data-id="${p.id}" style="${pos}">
      <div class="figure">${img("av" + p.emoji, () => avatar(p.emoji), L.P, "face")}${setting}</div>
      <div class="nm">${esc(p.name)}</div>${under}</div>`;
  });
  $("seats").innerHTML = html;
}

/* ---------- bubbles ---------- */

const typing = {};  // live text of whoever holds the plate
const nope = {};    // id -> { text, until }
export function setTyping(id, text) {
  // a late echo of the rejected guess, or the box clearing itself, shouldn't hide the crossed-out guess
  if (nope[id] && nope[id].until > Date.now() && (!text || text.trim() === nope[id].text)) return;
  typing[id] = text;
  delete nope[id];
  renderBubbles();
}
export function setNope(id, text, ms = 1300) {
  nope[id] = { text, until: Date.now() + ms };
  typing[id] = "";
  renderBubbles();
  setTimeout(renderBubbles, ms + 50);
}
export const clearTyping = (id) => { typing[id] = ""; };

const bubbleEls = new Map();
export function renderBubbles(popId) {
  const keep = new Set();
  const r = S.room;
  if (L && r && r.game && phase() !== "lobby") {
    const { players } = seating();
    players.forEach((p, i) => {
      const seat = L.seats[i];
      if (!seat) return;
      let cls, html;
      const n = nope[p.id] && nope[p.id].until > Date.now() ? nope[p.id] : null;
      if (r.phase === "playing" && r.game.holder === p.id) {
        if (n) { cls = "nope"; html = esc(n.text); }
        else { cls = "typing"; html = esc(p.id === r.you ? $("answer-input").value : typing[p.id] || ""); }
      } else if (p.last) {
        cls = "t" + p.last.tier;
        html = `${esc(p.last.name)}<small>+${TIERS[p.last.tier].pts}</small>`;
      } else return;
      keep.add(p.id);
      let el = bubbleEls.get(p.id);
      if (!el) { el = document.createElement("div"); bubbleEls.set(p.id, el); $("bubbles").appendChild(el); }
      const at = bubbleSpot(seat);
      el.className = `bubble at-${at.side} ${cls}`;
      el.innerHTML = html;
      el.style.left = at.x + "px"; el.style.top = at.y + "px";
      el.style.zIndex = 2000 + Math.round(at.y);
      if (popId === p.id) replay(el, "pop");
    });
  }
  for (const [id, el] of bubbleEls) if (!keep.has(id)) { el.remove(); bubbleEls.delete(id); }
}

/* ---------- the hot plate ---------- */

let clocheAt = null, lastHolder = null;
function seatOf(id) {
  const i = seating().players.findIndex((p) => p.id === id);
  return i >= 0 && L ? L.seats[i] : null;
}

export function placeCloche() {
  if (!L) return;
  const el = $("cloche"), r = S.room, ph = phase();
  let at = L.centre, mode = "idle";
  if (r && r.game && (ph === "play" || ph === "break")) {
    const id = ph === "play" ? r.game.holder : r.game.lastPop && r.game.lastPop.id;
    const seat = seatOf(id);
    if (seat) at = clocheSpot(seat);
    mode = ph === "play" ? "hot" : "burnt";
  } else if (ph === "over") {
    const seat = r.game && seatOf(r.game.winner);
    if (seat) at = { x: seat.x, y: seat.y - 46 * L.P };
    mode = seat ? "gold" : "idle";
  }
  el.dataset.mode = mode;
  el.style.transform = `translate(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px)`;
  el.style.zIndex = Math.round(at.y) + 1; // depth-sorted with the seats
  el.style.setProperty("--s", L.P);
  const holder = ph === "play" ? r.game.holder : null;
  if (holder && holder !== lastHolder && clocheAt) replay(el.querySelector(".hop"), "go");
  lastHolder = holder;
  clocheAt = at;
  if (mode !== "hot") setDish(mode === "gold" ? "gold" : mode === "burnt" ? "burnt" : 0);
}

let dishKey = null;
function setDish(heatOrMode) {
  if (!L) return;
  const key = typeof heatOrMode === "number" ? "h" + Math.round(heatOrMode * 10) : heatOrMode;
  if (key === dishKey) return;
  dishKey = key;
  const make = key === "gold" ? () => cloche(0, { gold: true }) : key === "burnt" ? () => cloche(0, { burnt: true }) : () => cloche(Math.round(heatOrMode * 10) / 10);
  const dish = $("dish");
  dish.src = spriteURL("cl" + key, make);
  dish.width = 30 * L.P; dish.height = 24 * L.P;
}

// called every frame: the countdown under the dish, its colour, and how hard it steams
export function tickClock(onTick) {
  const r = S.room, el = $("cloche");
  if (!r || !r.game || r.phase !== "playing") {
    el.style.setProperty("--heat", r && r.phase === "break" ? 1 : 0);
    $("fuse").style.setProperty("--f", 0);
    $("secs").textContent = r && r.phase === "break" ? "burned!" : "";
    return 0;
  }
  const g = r.game;
  const left = Math.max(0, g.turnEnd - now());
  const frac = Math.min(1, left / (g.turnLen * 1000));
  const heat = 1 - frac;
  setDish(heat);
  el.style.setProperty("--heat", heat.toFixed(2));
  $("fuse").style.setProperty("--f", frac.toFixed(3));
  $("fuse").dataset.level = frac > 0.5 ? "ok" : frac > 0.25 ? "warn" : "hot";
  $("secs").textContent = (left / 1000).toFixed(1) + "s";
  onTick && onTick(left);
  return heat;
}
