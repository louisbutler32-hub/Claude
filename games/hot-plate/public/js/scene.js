// The dining room. Drawn at low resolution with smooth shapes and scaled up with crisp
// edges, so it reads as pixel art. layout() is shared with the table layer so seats,
// bubbles and the hot plate land on the drawn tablecloth.

const COL = {
  roomTop: "#1d0b11", roomMid: "#13070b", roomBot: "#090305",
  paper: "rgba(122,46,62,.09)",
  beam: "rgba(255,206,140,",
  curtain: ["#2c0910", "#5e1726", "#7c2133", "#45101c"], curtainFold: "rgba(0,0,0,.28)",
  gold: "#c99442", goldHi: "#f2cf85",
  rim: "#2c140b", rimHi: "#5a2d18",
  skirt: "#3a0e18", skirtFold: "rgba(0,0,0,.22)",
  clothHi: "#933443", clothMid: "#6c1f2d", clothLo: "#3e0e1a",
  lattice: "rgba(255,214,160,.07)",
  leaf: "#0d1711", leafHi: "#1d3324",
  iron: "#0c0608", candle: "#efe0c2",
};

/* ---------- layout ---------- */

// area: the part of the stage the table should fill (CSS px); n: seats
export function layout(W, H, n, area) {
  const P = W >= 1000 && H >= 600 ? 3 : 2;
  const w = Math.ceil(W / P), h = Math.ceil(H / P);
  const ax0 = area.left / P, ax1 = (W - area.right) / P, ay0 = area.top / P, ay1 = (H - area.bottom) / P;
  const aw = ax1 - ax0, ah = ay1 - ay0;
  const cx = (ax0 + ax1) / 2, cy = ay0 + ah * 0.5;
  const portrait = aw < ah;
  const rx = aw * (portrait ? 0.46 : 0.45);
  const ry = Math.min(ah * 0.47, portrait ? rx * 1.45 : rx * 0.5);
  // seats sit just inside the cloth's edge, starting at the bottom (where "you" sit)
  const srx = rx * 0.84, sry = ry * 0.78;
  const seats = Array.from({ length: n }, (_, i) => {
    const a = Math.PI / 2 + (i * 2 * Math.PI) / n;
    return { a, x: (cx + Math.cos(a) * srx) * P, y: (cy + Math.sin(a) * sry) * P };
  });
  return { P, w, h, W, H, cx, cy, rx, ry, portrait, seats, centre: { x: cx * P, y: (cy - ry * 0.05) * P } };
}

/* ---------- drawing helpers ---------- */

const rnd = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
function ell(g, x, y, rx, ry) { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2); }

function curtain(g, L, side) {
  const { w, h } = L;
  const cw = Math.max(18, w * (L.portrait ? 0.1 : 0.11));
  const x0 = side < 0 ? 0 : w;
  const tieY = h * 0.62;
  g.save();
  g.beginPath();
  g.moveTo(x0, 0);
  g.lineTo(x0 - side * cw * 1.6, 0);
  g.bezierCurveTo(x0 - side * cw * 1.2, h * 0.25, x0 - side * cw * 0.4, tieY * 0.8, x0 - side * cw * 0.45, tieY);
  g.bezierCurveTo(x0 - side * cw * 0.7, tieY + h * 0.12, x0 - side * cw * 0.8, h * 0.9, x0 - side * cw * 0.9, h);
  g.lineTo(x0, h);
  g.closePath();
  const grd = g.createLinearGradient(x0, 0, x0 - side * cw * 1.6, 0);
  COL.curtain.forEach((c, i) => grd.addColorStop(i / (COL.curtain.length - 1), c));
  g.fillStyle = grd; g.fill();
  g.clip();
  g.strokeStyle = COL.curtainFold; g.lineWidth = 2;
  for (let k = 1; k < 6; k++) {
    const fx = x0 - side * cw * 0.28 * k;
    g.beginPath(); g.moveTo(fx, 0); g.bezierCurveTo(fx + side * 4, h * 0.3, fx + side * cw * 0.12 * k, tieY, fx + side * 2, h); g.stroke();
  }
  g.restore();
  // tie-back
  g.fillStyle = COL.gold; g.fillRect(side < 0 ? 0 : w - cw * 0.6, tieY - 2, cw * 0.6, 3);
  g.fillStyle = COL.goldHi; g.fillRect(side < 0 ? 0 : w - cw * 0.6, tieY - 2, cw * 0.6, 1);
}

function valance(g, L) {
  const { w } = L;
  const vh = Math.max(9, L.h * 0.045);
  g.fillStyle = "#3b0c17"; g.fillRect(0, 0, w, vh);
  g.fillStyle = "#5e1726";
  const sc = Math.max(16, w / 14);
  for (let x = -sc / 2; x < w + sc; x += sc) { ell(g, x, vh, sc / 2, vh * 0.55); g.fill(); }
  g.fillStyle = COL.gold;
  for (let x = 0; x < w; x += 3) g.fillRect(x, vh + vh * 0.5 * Math.abs(Math.sin((x / sc) * Math.PI)) - 1, 1, 2 + ((x / 3) % 2));
  g.fillStyle = COL.goldHi; g.fillRect(0, vh - 2, w, 1);
}

function fern(g, x, y, len, ang, bend, rand) {
  g.strokeStyle = COL.leaf; g.lineWidth = 1.5;
  const pts = [];
  for (let t = 0; t <= 1.0001; t += 0.05) {
    const a = ang + bend * t * t;
    const px = x + Math.cos(ang) * len * t + Math.cos(a + Math.PI / 2) * bend * len * 0.15 * t * t;
    const py = y + Math.sin(ang) * len * t + Math.sin(a + Math.PI / 2) * bend * len * 0.15 * t * t;
    pts.push([px, py, a]);
  }
  g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.stroke();
  pts.forEach(([px, py, a], i) => {
    if (i < 2) return;
    const l = len * 0.22 * (1 - i / pts.length) + 2;
    for (const s of [-1, 1]) {
      const la = a + s * 1.05;
      g.strokeStyle = rand() > 0.82 ? COL.leafHi : COL.leaf;
      g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(la) * l, py + Math.sin(la) * l); g.stroke();
    }
  });
}

function candelabra(g, x, y, s, flames) {
  g.fillStyle = COL.iron;
  g.fillRect(x - 1, y - 20 * s, 2, 20 * s);
  ell(g, x, y, 5 * s, 1.6 * s); g.fill();
  g.strokeStyle = COL.iron; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(x - 7 * s, y - 24 * s); g.quadraticCurveTo(x, y - 14 * s, x + 7 * s, y - 24 * s); g.stroke();
  for (const dx of [-7, 0, 7]) {
    const cxp = x + dx * s, top = y - (dx ? 24 : 27) * s;
    g.fillStyle = COL.candle; g.fillRect(cxp - 1, top - 5 * s, 2, 5 * s);
    flames.push({ x: cxp, y: top - 5 * s, s });
  }
}

function chandelier(g, L, flames) {
  const { cx } = L;
  const y = Math.max(14, L.h * 0.07);
  g.strokeStyle = COL.iron; g.lineWidth = 1;
  g.beginPath(); g.moveTo(cx, 0); g.lineTo(cx, y); g.stroke();
  g.fillStyle = COL.iron; ell(g, cx, y + 2, 4, 3); g.fill();
  g.lineWidth = 1.5;
  for (const k of [-2, -1, 1, 2]) {
    const ex = cx + k * 9;
    g.beginPath(); g.moveTo(cx, y + 3); g.quadraticCurveTo(cx + k * 5, y + 10, ex, y + 3); g.stroke();
    g.fillStyle = COL.candle; g.fillRect(ex - 1, y - 1, 2, 4);
    flames.push({ x: ex, y: y - 1, s: 0.8 });
  }
}

/* ---------- the room ---------- */

function drawRoom(L) {
  const { w, h, cx, cy, rx, ry } = L;
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const g = cv.getContext("2d");
  const rand = rnd(7);
  L.flames = [];

  // walls
  let grd = g.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, COL.roomTop); grd.addColorStop(0.55, COL.roomMid); grd.addColorStop(1, COL.roomBot);
  g.fillStyle = grd; g.fillRect(0, 0, w, h);
  g.fillStyle = COL.paper;
  for (let y = 6; y < cy; y += 9) for (let x = (y / 9) % 2 ? 4 : 0; x < w; x += 9) { g.fillRect(x, y, 1, 3); g.fillRect(x - 1, y + 1, 3, 1); }

  // light falling from the chandelier
  g.globalCompositeOperation = "lighter";
  for (const b of [-0.55, -0.2, 0.18, 0.5]) {
    const tx = cx + b * 14, bx = cx + b * rx * 1.3, bw = rx * 0.22;
    grd = g.createLinearGradient(0, 0, 0, cy + ry * 0.4);
    grd.addColorStop(0, COL.beam + "0.10)"); grd.addColorStop(1, COL.beam + "0)");
    g.fillStyle = grd;
    g.beginPath(); g.moveTo(tx - 2, 0); g.lineTo(tx + 3, 0); g.lineTo(bx + bw, cy + ry * 0.4); g.lineTo(bx - bw, cy + ry * 0.4); g.closePath(); g.fill();
  }
  g.globalCompositeOperation = "source-over";

  // table: shadow, wooden rim, cloth hanging over the front, then the top
  for (let k = 0; k < 8; k++) { ell(g, cx, cy + ry * 0.16 + k * 0.6, rx + 10 - k, ry + 8 - k); g.fillStyle = "rgba(0,0,0,.09)"; g.fill(); }
  const drop = Math.max(6, ry * 0.12);
  ell(g, cx, cy + drop, rx * 1.005, ry); g.fillStyle = COL.skirt; g.fill();
  g.save(); ell(g, cx, cy + drop, rx * 1.005, ry); g.clip();
  g.strokeStyle = COL.skirtFold; g.lineWidth = 2;
  for (let x = cx - rx; x < cx + rx; x += 7) { g.beginPath(); g.moveTo(x, cy); g.lineTo(x + 1, cy + ry + drop); g.stroke(); }
  g.restore();
  ell(g, cx, cy + 1.5, rx + 1.5, ry + 1.2); g.fillStyle = COL.rim; g.fill();
  grd = g.createRadialGradient(cx, cy - ry * 0.15, 2, cx, cy, Math.max(rx, ry));
  grd.addColorStop(0, COL.clothHi); grd.addColorStop(0.5, COL.clothMid); grd.addColorStop(1, COL.clothLo);
  ell(g, cx, cy, rx, ry); g.fillStyle = grd; g.fill();
  // damask lattice and an embroidered gold border
  g.save(); ell(g, cx, cy, rx, ry); g.clip();
  g.fillStyle = COL.lattice;
  for (let y = cy - ry; y < cy + ry; y += 10) for (let x = cx - rx + ((y / 10) % 2 ? 5 : 0); x < cx + rx; x += 10) {
    g.fillRect(x, y - 2, 1, 5); g.fillRect(x - 2, y, 5, 1);
  }
  g.restore();
  g.strokeStyle = "rgba(201,148,66,.55)"; g.lineWidth = 1;
  ell(g, cx, cy, rx - 4, ry - 3); g.stroke();
  g.setLineDash([2, 3]); ell(g, cx, cy, rx - 7, ry - 5.5); g.stroke(); g.setLineDash([]);
  // pool of candlelight on the cloth
  g.globalCompositeOperation = "lighter";
  grd = g.createRadialGradient(cx, cy - ry * 0.1, 1, cx, cy, Math.max(rx, ry) * 0.75);
  grd.addColorStop(0, "rgba(255,200,140,.16)"); grd.addColorStop(1, "rgba(255,200,140,0)");
  g.fillStyle = grd; ell(g, cx, cy, rx, ry); g.fill();
  g.globalCompositeOperation = "source-over";

  // the room around the table
  if (cy - ry > 30) chandelier(g, L, L.flames);
  const side = rx + 14;
  if (cx - side > 14) {
    const s = L.portrait ? 0.8 : 1;
    candelabra(g, cx - side, cy + ry * 0.15, s, L.flames);
    candelabra(g, cx + side, cy + ry * 0.15, s, L.flames);
  }
  for (const [fx, dir] of [[2, -1], [w - 2, 1]]) {
    for (let k = 0; k < 6; k++) {
      const ang = -Math.PI / 2 - dir * (0.15 + k * 0.22);
      fern(g, fx, h + 2, h * (0.22 + rand() * 0.14), ang, dir * (0.5 + rand() * 0.6), rand);
    }
  }
  curtain(g, L, -1);
  curtain(g, L, 1);
  valance(g, L);

  // vignette, then a little grain
  grd = g.createRadialGradient(cx, cy, Math.min(w, h) * 0.3, cx, cy, Math.max(w, h) * 0.75);
  grd.addColorStop(0, "rgba(0,0,0,0)"); grd.addColorStop(1, "rgba(0,0,0,.6)");
  g.fillStyle = grd; g.fillRect(0, 0, w, h);
  const img = g.getImageData(0, 0, w, h), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rand() - 0.5) * 10;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  return cv;
}

/* ---------- the live scene ---------- */

export class Scene {
  constructor(bg, fx) {
    this.bg = bg; this.fx = fx;
    this.L = null; this.room = null; this.heat = 0;
    this.motes = [];
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.tick = this.tick.bind(this);
    requestAnimationFrame(this.tick);
  }

  draw(L) {
    this.L = L;
    for (const c of [this.bg, this.fx]) {
      c.width = L.w; c.height = L.h;
      c.style.width = L.w * L.P + "px"; c.style.height = L.h * L.P + "px";
    }
    this.room = drawRoom(L);
    this.bg.getContext("2d").drawImage(this.room, 0, 0);
    const r = rnd(3);
    this.motes = Array.from({ length: 26 }, () => ({ x: L.cx + (r() - 0.5) * L.rx * 1.3, y: L.cy + (r() - 0.5) * L.ry * 2, v: 0.04 + r() * 0.08, p: r() * 6 }));
  }

  tick(t) {
    requestAnimationFrame(this.tick);
    if (!this.L || t - (this.last || 0) < 80) return;
    this.last = t;
    const L = this.L, g = this.fx.getContext("2d");
    g.clearRect(0, 0, L.w, L.h);
    const frame = this.reduced ? 0 : Math.floor(t / 90);
    // candle flames
    L.flames.forEach((f, i) => {
      const fl = this.reduced ? 1 : ((frame + i * 7) * 2654435761 >>> 0) % 3;
      g.globalCompositeOperation = "lighter";
      g.fillStyle = "rgba(255,180,90,.10)";
      g.beginPath(); g.arc(f.x, f.y - 3, 8 * f.s + fl, 0, Math.PI * 2); g.fill();
      g.globalCompositeOperation = "source-over";
      g.fillStyle = "#ff8a2b"; g.fillRect(f.x - 1, f.y - 3 - fl, 2, 3 + fl);
      g.fillStyle = "#ffe08a"; g.fillRect(f.x, f.y - 2 - fl, 1, 2 + fl);
    });
    // dust drifting up through the light
    if (!this.reduced) for (const m of this.motes) {
      m.y -= m.v; m.p += 0.08;
      if (m.y < L.cy - L.ry * 1.2) m.y = L.cy + L.ry;
      g.fillStyle = `rgba(255,236,200,${0.25 + 0.25 * Math.sin(m.p)})`;
      g.fillRect(Math.round(m.x + Math.sin(m.p) * 2), Math.round(m.y), 1, 1);
    }
    // the cloth glows as the clock runs down
    if (this.heat > 0) {
      const grd = g.createRadialGradient(L.cx, L.cy, 1, L.cx, L.cy, Math.max(L.rx, L.ry) * (0.4 + this.heat * 0.4));
      grd.addColorStop(0, `rgba(255,${Math.round(140 - this.heat * 100)},50,${0.08 + this.heat * 0.22})`);
      grd.addColorStop(1, "rgba(255,80,40,0)");
      g.fillStyle = grd; g.fillRect(0, 0, L.w, L.h);
    }
  }

  setHeat(v) { this.heat = Math.max(0, Math.min(1, v)); }
}
