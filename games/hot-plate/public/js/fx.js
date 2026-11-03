// Answer effects, scaled by rarity: a points label rising from the seat, a burst of particles
// (none for a Bread Basket answer, a gold-and-kisses shower for the chef's kiss), and a banner
// across the table for the kiss itself.
import { $, esc, TIERS } from "./util.js";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
// per tier: how many particles, which glyphs, how far they fly
const BURST = [
  { n: 0 },
  { n: 6, glyphs: ["•"], spread: 50 },
  { n: 12, glyphs: ["✦", "•", "✶"], spread: 80 },
  { n: 20, glyphs: ["✦", "★", "✶", "✧"], spread: 120 },
  { n: 42, glyphs: ["💋", "✦", "★", "❤", "✧"], spread: 200 },
];

function layer() { return $("fx"); }

export function burst(x, y, tier) {
  const b = BURST[tier] || BURST[0];
  if (!b.n || reduced) return;
  const host = layer();
  for (let i = 0; i < b.n; i++) {
    const s = document.createElement("span");
    s.className = `spark t${tier}`;
    s.textContent = b.glyphs[i % b.glyphs.length];
    const a = Math.random() * Math.PI * 2, d = b.spread * (0.4 + Math.random() * 0.6);
    s.style.left = x + "px"; s.style.top = y + "px";
    s.style.setProperty("--dx", Math.cos(a) * d + "px");
    s.style.setProperty("--dy", Math.sin(a) * d - 30 + "px");
    s.style.setProperty("--r", Math.round(Math.random() * 360) + "deg");
    s.style.animationDelay = Math.random() * 0.08 + "s";
    host.appendChild(s);
    setTimeout(() => s.remove(), 1400);
  }
}

export function floatScore(x, y, pts, tier, mult) {
  const s = document.createElement("div");
  s.className = `float-pts t${tier}`;
  s.innerHTML = `+${pts}<small>${esc(TIERS[tier].name.toLowerCase())}${mult > 1 ? ` · 🌶️×${mult}` : ""}</small>`;
  s.style.left = x + "px"; s.style.top = y + "px";
  layer().appendChild(s);
  setTimeout(() => s.remove(), 1700);
}

let bannerTimer = null;
export function kissBanner(who, answer) {
  const b = $("kiss-banner");
  b.innerHTML = `<p class="kiss-title">chef's kiss!</p><p class="kiss-sub">${esc(who)} found the hidden dish: <b>${esc(answer)}</b> · +250</p>`;
  b.hidden = false;
  b.classList.remove("go"); void b.offsetWidth; b.classList.add("go");
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => (b.hidden = true), 2600);
}

export function shake(strength) {
  if (reduced) return;
  const st = $("stage");
  st.style.setProperty("--shake", strength + "px");
  st.classList.remove("shaking"); void st.offsetWidth; st.classList.add("shaking");
}
