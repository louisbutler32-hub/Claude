// The dining room, painted smoothly at full device resolution. Everything is still laid out in
// "art units" (one art unit = P CSS px) so the table layer's maths is unchanged: the canvases
// carry a P × devicePixelRatio transform and the room is drawn with gradients and curves.
// layout() is shared with the table layer so seats, bubbles and the pot land on the tablecloth.

/* ---------- layout ---------- */

// area: the part of the stage the table should fill (CSS px); n: seats
export function layout(W, H, n, area) {
  const P = W >= 1000 && H >= 600 ? 3 : 2;
  const w = Math.ceil(W / P), h = Math.ceil(H / P);
  const ax0 = area.left / P, ax1 = (W - area.right) / P, ay0 = area.top / P, ay1 = (H - area.bottom) / P;
  const aw = ax1 - ax0, ah = ay1 - ay0;
  const cx = (ax0 + ax1) / 2, cy = ay0 + ah * 0.5;
  const portrait = W < H; // the screen, not the table area (a phone with the question band up top is still portrait)
  // a smaller table, so the players sit closer together and more of the room shows round the edges
  const rx = aw * (portrait ? 0.4 : 0.33);
  // deep enough that the question box fits between the far and near seats
  const ry = Math.min(ah * (portrait ? 0.46 : 0.42), portrait ? rx * 1.4 : rx * 0.6);
  // seats sit just inside the cloth's edge, starting at the bottom (where "you" sit)
  const srx = rx * 0.84, sry = ry * 0.78;
  const seats = Array.from({ length: n }, (_, i) => {
    const a = Math.PI / 2 + (i * 2 * Math.PI) / n;
    return { a, x: (cx + Math.cos(a) * srx) * P, y: (cy + Math.sin(a) * sry) * P };
  });
  return { P, w, h, W, H, cx, cy, rx, ry, portrait, seats, centre: { x: cx * P, y: (cy - ry * 0.05) * P } };
}

/* ---------- drawing helpers ---------- */

const TAU = Math.PI * 2;
const dprNow = () => Math.min(window.devicePixelRatio || 1, 2);
// device pixels per art unit for the canvas being drawn (shadow blur ignores the transform)
let K = 1;

const rnd = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const mix = (a, b, t) => a + (b - a) * t;
const rgb = (c, k = 1, a = 1) => `rgba(${Math.round(c[0] * k)},${Math.round(c[1] * k)},${Math.round(c[2] * k)},${a})`;
const lerpC = (a, b, t) => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
function ell(g, x, y, rx, ry) { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, TAU); }
function lin(g, x0, y0, x1, y1, stops) {
  const grd = g.createLinearGradient(x0, y0, x1, y1);
  for (const [o, c] of stops) grd.addColorStop(o, c);
  return grd;
}
// a radial gradient squashed into an ellipse
function ellGlow(g, x, y, rx, ry, stops) {
  g.save();
  g.translate(x, y); g.scale(1, Math.max(0.01, ry) / Math.max(0.01, rx));
  const grd = g.createRadialGradient(0, 0, 0, 0, 0, rx);
  for (const [o, c] of stops) grd.addColorStop(o, c);
  g.fillStyle = grd;
  g.beginPath(); g.arc(0, 0, rx, 0, TAU); g.fill();
  g.restore();
}
function glow(g, x, y, r, c, a) {
  ellGlow(g, x, y, r, r, [[0, `rgba(${c},${a})`], [0.25, `rgba(${c},${a * 0.45})`], [0.6, `rgba(${c},${a * 0.12})`], [1, `rgba(${c},0)`]]);
}
const cubic = (p0, p1, p2, p3, t) => {
  const u = 1 - t;
  return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]];
};
const brass = (g, x0, y0, x1, y1) => lin(g, x0, y0, x1, y1, [[0, "#f6dc98"], [0.35, "#c99442"], [0.7, "#7a5020"], [1, "#3c240c"]]);

/* ---------- walls ---------- */

// a faint damask: rows of small lozenges and dots, offset every other row
function damask(g, x0, y0, x1, y1, step, color) {
  g.strokeStyle = color; g.fillStyle = color; g.lineWidth = 0.35;
  for (let row = 0, y = y0; y < y1 + step; y += step * 0.75, row++) {
    for (let x = x0 + (row % 2 ? step / 2 : 0); x < x1 + step; x += step) {
      const a = step * 0.2, b = step * 0.3;
      g.beginPath();
      g.moveTo(x, y - b);
      g.quadraticCurveTo(x + a * 0.15, y - a * 0.2, x + a, y);
      g.quadraticCurveTo(x + a * 0.15, y + a * 0.2, x, y + b);
      g.quadraticCurveTo(x - a * 0.15, y + a * 0.2, x - a, y);
      g.quadraticCurveTo(x - a * 0.15, y - a * 0.2, x, y - b);
      g.stroke();
      g.beginPath(); g.arc(x, y, step * 0.035, 0, TAU); g.fill();
      g.beginPath(); g.arc(x + step / 2, y, step * 0.025, 0, TAU); g.fill();
    }
  }
}

function walls(g, L) {
  const { w, h, cx, cy, ry } = L;
  g.fillStyle = lin(g, 0, 0, 0, h, [[0, "#260c14"], [0.45, "#1a070d"], [0.8, "#100408"], [1, "#0a0305"]]);
  g.fillRect(0, 0, w, h);
  damask(g, 0, 0, w, h, 18, "rgba(214,150,120,.045)");
  // a dado rail behind the table, darker panelling below it
  const rail = cy - ry * 0.35;
  g.fillStyle = lin(g, 0, rail, 0, h, [[0, "rgba(0,0,0,.25)"], [1, "rgba(0,0,0,.45)"]]);
  g.fillRect(0, rail, w, h - rail);
  g.fillStyle = lin(g, 0, rail - 1.2, 0, rail + 1.2, [[0, "rgba(242,207,133,0)"], [0.4, "rgba(242,207,133,.22)"], [0.6, "rgba(120,70,30,.25)"], [1, "rgba(0,0,0,0)"]]);
  g.fillRect(0, rail - 1.2, w, 2.4);
  // warm light from the chandelier and the candles, behind the table
  g.globalCompositeOperation = "lighter";
  ellGlow(g, cx, cy - ry * 0.55, Math.max(w, h) * 0.55, h * 0.5,
    [[0, "rgba(255,160,100,.15)"], [0.45, "rgba(200,80,60,.06)"], [1, "rgba(0,0,0,0)"]]);
  g.globalCompositeOperation = "source-over";
}

// soft cones of light falling from the chandelier onto the cloth
function beams(g, L) {
  const { cx, cy, rx, ry } = L;
  const foot = cy + ry * 0.4;
  g.save();
  g.globalCompositeOperation = "lighter";
  for (const b of [-0.55, -0.2, 0.18, 0.5]) {
    const tx = cx + b * 14, bx = cx + b * rx * 1.3, bw = rx * 0.22;
    // a few widening layers give the cone a soft edge
    for (const [k, a] of [[0.55, 0.035], [0.8, 0.03], [1.1, 0.022], [1.45, 0.014]]) {
      g.fillStyle = lin(g, 0, 0, 0, foot, [[0, `rgba(255,214,160,${a})`], [0.6, `rgba(255,200,140,${a * 0.6})`], [1, "rgba(255,200,140,0)"]]);
      g.beginPath();
      g.moveTo(tx - 1.5 * k, 0); g.lineTo(tx + 1.5 * k, 0);
      g.lineTo(bx + bw * k, foot); g.lineTo(bx - bw * k, foot);
      g.closePath(); g.fill();
    }
  }
  g.restore();
}

/* ---------- the table ---------- */

function table(g, L) {
  const { cx, cy, rx, ry } = L;
  const drop = Math.max(6, ry * 0.12);
  // a soft shadow pooled underneath
  ellGlow(g, cx, cy + drop + ry * 0.12, rx * 1.2, ry * 1.12, [[0, "rgba(0,0,0,.6)"], [0.65, "rgba(0,0,0,.4)"], [1, "rgba(0,0,0,0)"]]);

  // the cloth hanging over the front edge, in soft vertical folds
  g.save();
  ell(g, cx, cy + drop, rx * 1.004, ry); g.clip();
  const folds = Math.max(8, Math.round(rx / 7));
  const dark = [34, 6, 13], light = [118, 30, 48];
  const skirt = g.createLinearGradient(cx - rx, 0, cx + rx, 0);
  for (let i = 0; i <= folds * 4; i++) {
    const t = i / (folds * 4), xn = t * 2 - 1;
    const cyl = Math.sqrt(Math.max(0, 1 - xn * xn)) ** 0.7;   // rounder towards the middle
    const crest = 0.5 - 0.5 * Math.cos(t * folds * TAU);
    skirt.addColorStop(t, rgb(lerpC(dark, light, (0.25 + 0.75 * crest) * (0.2 + 0.8 * cyl))));
  }
  g.fillStyle = skirt; g.fillRect(cx - rx - 2, cy - ry, rx * 2 + 4, ry * 2 + drop + 2);
  g.fillStyle = lin(g, 0, cy + ry * 0.5, 0, cy + ry + drop, [[0, "rgba(0,0,0,0)"], [1, "rgba(0,0,0,.45)"]]);
  g.fillRect(cx - rx - 2, cy, rx * 2 + 4, ry + drop + 2);
  g.restore();
  // gold braid along the hem
  g.save();
  g.beginPath(); g.ellipse(cx, cy + drop - 0.7, rx * 1.004 - 0.4, ry - 0.4, 0, 0.02, Math.PI - 0.02);
  g.lineWidth = 1.3; g.strokeStyle = lin(g, cx - rx, 0, cx + rx, 0, [[0, "rgba(90,58,20,0)"], [0.08, "rgba(150,105,45,.8)"], [0.3, "#e8c072"], [0.55, "#b9853a"], [0.8, "#f2cf85"], [0.92, "rgba(150,105,45,.8)"], [1, "rgba(90,58,20,0)"]]);
  g.stroke();
  g.lineWidth = 0.35; g.strokeStyle = "rgba(255,240,200,.45)";
  g.beginPath(); g.ellipse(cx, cy + drop - 1.1, rx * 1.004 - 0.4, ry - 0.4, 0, 0.3, Math.PI - 0.3); g.stroke();
  g.restore();

  // the edge of the table top
  ell(g, cx, cy + 0.9, rx + 0.6, ry + 0.7); g.fillStyle = "#1c050b"; g.fill();

  // the top: a burgundy cloth, lit from above
  g.save();
  ell(g, cx, cy, rx, ry); g.clip();
  ellGlow(g, cx, cy - ry * 0.22, rx * 1.25, ry * 1.3, [[0, "#a43a4c"], [0.35, "#82263a"], [0.7, "#5c1628"], [1, "#3c0b18"]]);
  // a damask weave, foreshortened with the table
  g.save();
  g.translate(cx, cy); g.scale(1, ry / rx); g.translate(-cx, -cy);
  damask(g, cx - rx, cy - rx, cx + rx, cy + rx, 13, "rgba(255,215,170,.055)");
  g.restore();
  // shade towards the far rim
  g.fillStyle = lin(g, 0, cy - ry, 0, cy + ry, [[0, "rgba(20,0,6,.35)"], [0.35, "rgba(20,0,6,0)"], [1, "rgba(20,0,6,0)"]]);
  g.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);
  g.restore();

  // embroidered gold border: a line and a run of stitched dots
  g.save();
  g.strokeStyle = "rgba(226,178,96,.6)"; g.lineWidth = 0.45;
  ell(g, cx, cy, rx - 4, ry - 3); g.stroke();
  g.lineCap = "round"; g.lineWidth = 0.75; g.strokeStyle = "rgba(226,178,96,.5)";
  g.setLineDash([0.01, 2.6]);
  ell(g, cx, cy, rx - 6.8, ry - 5.3); g.stroke();
  g.setLineDash([]);
  g.lineWidth = 0.3; g.strokeStyle = "rgba(226,178,96,.35)";
  ell(g, cx, cy, rx - 8.6, ry - 6.7); g.stroke();
  // a gilt rim right at the edge
  g.lineWidth = 0.9;
  g.strokeStyle = lin(g, cx - rx, cy - ry, cx + rx, cy + ry, [[0, "#7a5020"], [0.25, "#f2cf85"], [0.5, "#b9853a"], [0.75, "#f6dc98"], [1, "#6a4418"]]);
  ell(g, cx, cy, rx - 0.45, ry - 0.45); g.stroke();
  g.restore();

  // a pool of candlelight on the cloth
  g.globalCompositeOperation = "lighter";
  ellGlow(g, cx, cy - ry * 0.12, rx * 0.8, ry * 0.75, [[0, "rgba(255,196,140,.16)"], [0.5, "rgba(255,170,120,.07)"], [1, "rgba(255,170,120,0)"]]);
  g.globalCompositeOperation = "source-over";
}

/* ---------- lights ---------- */

function candle(g, x, top, len, wid) {
  g.fillStyle = lin(g, x - wid / 2, 0, x + wid / 2, 0, [[0, "#b9a582"], [0.35, "#fff6e2"], [0.7, "#efe0c2"], [1, "#a8916c"]]);
  g.beginPath();
  g.moveTo(x - wid / 2, top + 0.3); g.quadraticCurveTo(x - wid / 2, top, x, top);
  g.quadraticCurveTo(x + wid / 2, top, x + wid / 2, top + 0.3);
  g.lineTo(x + wid / 2, top + len); g.lineTo(x - wid / 2, top + len); g.closePath(); g.fill();
  // a drip of wax and the wick
  g.fillStyle = "rgba(255,250,236,.9)";
  g.beginPath(); g.ellipse(x - wid * 0.28, top + len * 0.3, wid * 0.13, len * 0.22, 0, 0, TAU); g.fill();
  g.strokeStyle = "#2a1a10"; g.lineWidth = 0.22; g.lineCap = "round";
  g.beginPath(); g.moveTo(x, top); g.lineTo(x, top - 0.6); g.stroke();
}

function candelabra(g, x, y, s, flames) {
  // a glow on the wall behind the candles
  g.globalCompositeOperation = "lighter";
  glow(g, x, y - 26 * s, 26 * s, "255,170,90", 0.2);
  g.globalCompositeOperation = "source-over";
  // shadow, foot, stem with two knops
  ellGlow(g, x, y + 0.8 * s, 7 * s, 2 * s, [[0, "rgba(0,0,0,.55)"], [1, "rgba(0,0,0,0)"]]);
  const metal = brass(g, x - 5 * s, 0, x + 5 * s, 0);
  g.fillStyle = metal;
  g.beginPath();
  g.moveTo(x - 5 * s, y);
  g.bezierCurveTo(x - 4.6 * s, y - 2.2 * s, x - 1.4 * s, y - 2 * s, x - 0.8 * s, y - 4 * s);
  g.lineTo(x - 0.65 * s, y - 20 * s); g.lineTo(x + 0.65 * s, y - 20 * s); g.lineTo(x + 0.8 * s, y - 4 * s);
  g.bezierCurveTo(x + 1.4 * s, y - 2 * s, x + 4.6 * s, y - 2.2 * s, x + 5 * s, y);
  g.closePath(); g.fill();
  ell(g, x, y, 5 * s, 1.3 * s); g.fill();
  for (const ky of [8, 15]) { ell(g, x, y - ky * s, 1.5 * s, 1.1 * s); g.fill(); }
  // highlight down the stem
  g.strokeStyle = "rgba(255,236,190,.5)"; g.lineWidth = 0.3 * s; g.lineCap = "round";
  g.beginPath(); g.moveTo(x - 0.25 * s, y - 4.5 * s); g.lineTo(x - 0.25 * s, y - 19.5 * s); g.stroke();
  // the arms
  g.strokeStyle = metal; g.lineWidth = 1.2 * s;
  g.beginPath(); g.moveTo(x - 7 * s, y - 24 * s); g.bezierCurveTo(x - 7 * s, y - 17 * s, x + 7 * s, y - 17 * s, x + 7 * s, y - 24 * s); g.stroke();
  g.strokeStyle = "rgba(255,236,190,.4)"; g.lineWidth = 0.35 * s;
  g.beginPath(); g.moveTo(x - 6.6 * s, y - 23 * s); g.bezierCurveTo(x - 6.4 * s, y - 18.5 * s, x + 6.4 * s, y - 18.5 * s, x + 6.6 * s, y - 23 * s); g.stroke();
  for (const dx of [-7, 0, 7]) {
    const cxp = x + dx * s, top = y - (dx ? 24 : 27) * s;
    g.fillStyle = metal;
    if (!dx) g.fillRect(cxp - 0.6 * s, top, 1.2 * s, 7 * s);
    ell(g, cxp, top + 0.3 * s, 1.9 * s, 0.7 * s); g.fill();
    candle(g, cxp, top - 5 * s, 5 * s, 1.5 * s);
    flames.push({ x: cxp, y: top - 5 * s - 0.4 * s, s });
  }
}

function chandelier(g, L, flames) {
  const { cx } = L;
  const y = Math.max(14, L.h * 0.07);
  g.globalCompositeOperation = "lighter";
  glow(g, cx, y, 50, "255,190,120", 0.22);
  g.globalCompositeOperation = "source-over";
  // the chain
  g.strokeStyle = "#8a6428"; g.lineWidth = 0.35;
  for (let k = 0, cy0 = 1; cy0 < y - 3; cy0 += 1.5, k++) {
    g.beginPath(); g.ellipse(cx, cy0, k % 2 ? 0.25 : 0.55, 0.85, 0, 0, TAU); g.stroke();
  }
  const metal = brass(g, cx - 10, y - 4, cx + 10, y + 8);
  // the arms, sweeping out and up to their candles
  for (const k of [-2, -1, 1, 2]) {
    const ex = cx + k * 9;
    g.strokeStyle = metal; g.lineWidth = 0.95;
    g.beginPath(); g.moveTo(cx, y + 3); g.bezierCurveTo(cx + k * 2.5, y + 11, ex, y + 9, ex, y + 3.4); g.stroke();
    g.strokeStyle = "rgba(255,236,190,.45)"; g.lineWidth = 0.3;
    g.beginPath(); g.moveTo(cx + k * 0.6, y + 3.6); g.bezierCurveTo(cx + k * 2.6, y + 10.2, ex - k * 0.3, y + 8.4, ex - k * 0.3, y + 3.6); g.stroke();
    g.fillStyle = metal; ell(g, ex, y + 3.2, 1.6, 0.6); g.fill();
    candle(g, ex, y - 1, 4, 1.25);
    flames.push({ x: ex, y: y - 1.4, s: 0.8 });
    // a crystal hanging from each arm
    crystal(g, cx + k * 4.5, y + 9.6, 0.8);
  }
  // the body: a turned brass vase
  g.fillStyle = metal;
  g.beginPath();
  g.moveTo(cx - 1, y - 4);
  g.bezierCurveTo(cx - 1.2, y - 1, cx - 4, y + 1, cx - 3.6, y + 3.5);
  g.bezierCurveTo(cx - 3.2, y + 6, cx - 1.2, y + 6.5, cx, y + 8);
  g.bezierCurveTo(cx + 1.2, y + 6.5, cx + 3.2, y + 6, cx + 3.6, y + 3.5);
  g.bezierCurveTo(cx + 4, y + 1, cx + 1.2, y - 1, cx + 1, y - 4);
  g.closePath(); g.fill();
  g.fillStyle = "rgba(255,240,200,.55)";
  g.beginPath(); g.ellipse(cx - 1.4, y + 2.6, 0.5, 1.6, 0.2, 0, TAU); g.fill();
  crystal(g, cx, y + 10.5, 1.1);
}
function crystal(g, x, y, s) {
  g.strokeStyle = "rgba(255,230,190,.35)"; g.lineWidth = 0.18;
  g.beginPath(); g.moveTo(x, y - 2.2 * s); g.lineTo(x, y - 1.1 * s); g.stroke();
  g.fillStyle = lin(g, x - s, y - s, x + s, y + s, [[0, "rgba(255,255,255,.85)"], [0.5, "rgba(255,210,170,.5)"], [1, "rgba(160,90,90,.5)"]]);
  g.beginPath();
  g.moveTo(x, y - 1.2 * s);
  g.quadraticCurveTo(x + 0.75 * s, y + 0.2 * s, x, y + 1.2 * s);
  g.quadraticCurveTo(x - 0.75 * s, y + 0.2 * s, x, y - 1.2 * s);
  g.fill();
}

/* ---------- ferns ---------- */

function frond(g, x, y, len, ang, bend, rand) {
  const pts = [];
  for (let t = 0; t <= 1.0001; t += 0.045) {
    const a = ang + bend * t * t;
    const px = x + Math.cos(ang) * len * t + Math.cos(a + Math.PI / 2) * bend * len * 0.15 * t * t;
    const py = y + Math.sin(ang) * len * t + Math.sin(a + Math.PI / 2) * bend * len * 0.15 * t * t;
    pts.push([px, py, a]);
  }
  const tone = rand();
  const base = lerpC([10, 22, 14], [20, 40, 26], tone), hi = lerpC([26, 52, 32], [40, 74, 44], tone);
  g.strokeStyle = rgb(base, 0.9); g.lineWidth = 0.7; g.lineCap = "round";
  g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.stroke();
  pts.forEach(([px, py, a], i) => {
    if (i < 2) return;
    const f = 1 - i / pts.length;
    const l = len * 0.2 * f + 2, wd = l * 0.22;
    for (const sd of [-1, 1]) {
      const la = a + sd * 1.0;
      const ex = px + Math.cos(la) * l, ey = py + Math.sin(la) * l;
      const nx = -Math.sin(la) * wd, ny = Math.cos(la) * wd;
      const mx = (px + ex) / 2, my = (py + ey) / 2;
      g.fillStyle = lin(g, px, py, ex, ey, [[0, rgb(base)], [1, rgb(hi, 1, 0.95)]]);
      g.beginPath();
      g.moveTo(px, py);
      g.quadraticCurveTo(mx + nx, my + ny, ex, ey);
      g.quadraticCurveTo(mx - nx, my - ny, px, py);
      g.fill();
    }
  });
}

/* ---------- drapes ---------- */

function curtain(g, L, side) {
  const { w, h } = L;
  const cw = Math.max(18, w * (L.portrait ? 0.1 : 0.11));
  const x0 = side < 0 ? 0 : w;
  const tieY = h * 0.62;
  const X = (u) => x0 - side * cw * u;
  const segs = [
    [[X(1.6), 0], [X(1.2), h * 0.25], [X(0.4), tieY * 0.8], [X(0.45), tieY]],
    [[X(0.45), tieY], [X(0.7), tieY + h * 0.12], [X(0.8), h * 0.9], [X(0.9), h]],
  ];
  const path = () => {
    g.beginPath();
    g.moveTo(x0, 0); g.lineTo(...segs[0][0]);
    for (const s of segs) g.bezierCurveTo(...s[1], ...s[2], ...s[3]);
    g.lineTo(x0 - side * 2, h + 2); g.lineTo(x0 - side * 2, 0); g.closePath();
  };
  // the inner edge, sampled, so each row of the drape knows how wide it is
  const edge = [];
  for (const s of segs) for (let i = 0; i <= 40; i++) edge.push(cubic(s[0], s[1], s[2], s[3], i / 40));
  const edgeX = (y) => {
    for (let i = 1; i < edge.length; i++) if (edge[i][1] >= y) {
      const [ax, ay] = edge[i - 1], [bx, by] = edge[i];
      return by > ay ? mix(ax, bx, (y - ay) / (by - ay)) : bx;
    }
    return edge[edge.length - 1][0];
  };
  // a soft shadow on the wall
  g.save();
  g.shadowColor = "rgba(0,0,0,.7)"; g.shadowBlur = 9 * K; g.shadowOffsetX = -side * 2 * K;
  path(); g.fillStyle = "#24070e"; g.fill();
  g.restore();
  // velvet: painted row by row so the folds bunch together at the tie-back
  g.save(); path(); g.clip();
  const folds = 6, dark = [30, 5, 11], light = [150, 38, 56];
  const dy = 0.5;
  for (let y = 0; y < h + dy; y += dy) {
    const ex = edgeX(y);
    const span = Math.abs(ex - x0) || 1;
    const squeeze = Math.min(1, span / (cw * 1.2));     // narrower = folds packed tighter = darker
    const grd = g.createLinearGradient(x0, 0, ex, 0);
    for (let i = 0; i <= folds * 4; i++) {
      const u = i / (folds * 4);
      const crest = (0.5 - 0.5 * Math.cos((u * folds + 0.15) * TAU)) ** 1.4;
      const lit = 0.38 + 0.62 * u ** 0.8;           // the room lights the inner edge
      const vert = 0.75 + 0.25 * Math.sin(Math.min(1, y / h) * Math.PI);
      grd.addColorStop(u, rgb(lerpC(dark, light, crest * lit * (0.6 + 0.4 * squeeze)), vert));
    }
    g.fillStyle = grd;
    g.fillRect(Math.min(x0, ex) - 3, y, span + 6, dy + 0.35);
  }
  // darker at the top under the valance and at the floor
  g.fillStyle = lin(g, 0, 0, 0, h, [[0, "rgba(0,0,0,.45)"], [0.12, "rgba(0,0,0,0)"], [0.85, "rgba(0,0,0,0)"], [1, "rgba(0,0,0,.35)"]]);
  g.fillRect(Math.min(x0, X(1.7)) - 2, 0, cw * 1.7 + 4, h);
  g.restore();
  // a sheen along the inner edge
  g.strokeStyle = "rgba(255,170,170,.14)"; g.lineWidth = 0.6;
  g.beginPath(); g.moveTo(...edge[0]); for (const p of edge) g.lineTo(p[0] + side * 0.4, p[1]); g.stroke();

  // the gold rope tie-back and its tassel
  const tx = X(0.5);
  const rope = lin(g, 0, tieY - 2, 0, tieY + 2, [[0, "#f6dc98"], [0.5, "#c99442"], [1, "#5a3a14"]]);
  g.lineCap = "round";
  g.strokeStyle = "rgba(0,0,0,.4)"; g.lineWidth = 2.6;
  g.beginPath(); g.moveTo(x0, tieY - 1.4); g.quadraticCurveTo(mix(x0, tx, 0.5), tieY + 2.6, tx, tieY + 0.6); g.stroke();
  g.strokeStyle = rope; g.lineWidth = 2;
  g.beginPath(); g.moveTo(x0, tieY - 2); g.quadraticCurveTo(mix(x0, tx, 0.5), tieY + 2, tx, tieY); g.stroke();
  g.strokeStyle = "rgba(60,30,8,.45)"; g.lineWidth = 2; g.setLineDash([0.45, 0.9]);
  g.beginPath(); g.moveTo(x0, tieY - 2); g.quadraticCurveTo(mix(x0, tx, 0.5), tieY + 2, tx, tieY); g.stroke();
  g.setLineDash([]);
  tassel(g, tx, tieY + 0.5, 1);
}

function tassel(g, x, y, s) {
  const gold = lin(g, x - 1.6 * s, 0, x + 1.6 * s, 0, [[0, "#6a4418"], [0.35, "#f2cf85"], [0.7, "#c99442"], [1, "#5a3a14"]]);
  g.fillStyle = gold;
  g.beginPath(); g.arc(x, y + 1 * s, 1.1 * s, 0, TAU); g.fill();
  g.beginPath();
  g.moveTo(x - 0.7 * s, y + 1.8 * s);
  g.bezierCurveTo(x - 1.8 * s, y + 4 * s, x - 1.9 * s, y + 6 * s, x - 1.7 * s, y + 7 * s);
  g.lineTo(x + 1.7 * s, y + 7 * s);
  g.bezierCurveTo(x + 1.9 * s, y + 6 * s, x + 1.8 * s, y + 4 * s, x + 0.7 * s, y + 1.8 * s);
  g.closePath(); g.fill();
  g.strokeStyle = "rgba(70,40,10,.5)"; g.lineWidth = 0.16 * s;
  for (let i = -3; i <= 3; i++) {
    g.beginPath(); g.moveTo(x + i * 0.22 * s, y + 2.6 * s); g.lineTo(x + i * 0.46 * s, y + 6.9 * s); g.stroke();
  }
  g.fillStyle = "rgba(255,240,200,.7)";
  g.beginPath(); g.arc(x - 0.35 * s, y + 0.7 * s, 0.35 * s, 0, TAU); g.fill();
}

// swags across the top with a gold fringe and tassels where they meet
function valance(g, L) {
  const { w } = L;
  const vh = Math.max(9, L.h * 0.045);
  const sc = Math.max(16, w / 14);
  g.fillStyle = lin(g, 0, 0, 0, vh, [[0, "#1e0509"], [1, "#4a1020"]]);
  g.fillRect(0, 0, w, vh);
  const top = vh * 0.55, low = vh * 1.55;
  const swags = [];
  for (let x = -sc / 2; x < w + sc; x += sc) swags.push(x);
  for (const x of swags) {
    const a = x - sc / 2 - 1, b = x + sc / 2 + 1;
    const lower = [[a, top], [a + sc * 0.18, low + vh * 0.05], [b - sc * 0.18, low + vh * 0.05], [b, top]];
    g.save();
    g.shadowColor = "rgba(0,0,0,.55)"; g.shadowBlur = 4 * K; g.shadowOffsetY = 1.2 * K;
    g.beginPath(); g.moveTo(a, 0); g.lineTo(a, top);
    g.bezierCurveTo(...lower[1], ...lower[2], ...lower[3]); g.lineTo(b, 0); g.closePath();
    g.fillStyle = "#3a0c18"; g.fill();
    g.restore();
    g.save();
    g.beginPath(); g.moveTo(a, 0); g.lineTo(a, top);
    g.bezierCurveTo(...lower[1], ...lower[2], ...lower[3]); g.lineTo(b, 0); g.closePath();
    g.clip();
    ellGlow(g, x, vh * 0.75, sc * 0.62, vh * 1.05, [[0, "#9a2c40"], [0.55, "#6a1a2c"], [1, "#2a0710"]]);
    // folds following the curve of the swag
    for (const [d, c, wd] of [[0.3, "rgba(0,0,0,.28)", 1.1], [0.55, "rgba(255,150,160,.10)", 0.6], [0.75, "rgba(0,0,0,.25)", 1], [0.95, "rgba(255,150,160,.08)", 0.5]]) {
      const ly = mix(0, low, d);
      g.strokeStyle = c; g.lineWidth = wd;
      g.beginPath(); g.moveTo(a, ly * 0.35); g.bezierCurveTo(a + sc * 0.2, ly, b - sc * 0.2, ly, b, ly * 0.35); g.stroke();
    }
    g.restore();
    // the fringe and the braid along its hem
    g.lineCap = "butt";
    for (let i = 0; i <= 60; i++) {
      const [fx, fy] = cubic(...lower, i / 60);
      g.strokeStyle = i % 2 ? "rgba(214,164,80,.85)" : "rgba(160,112,46,.85)";
      g.lineWidth = 0.32;
      g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx, fy + vh * 0.34); g.stroke();
    }
    g.lineCap = "round";
    g.strokeStyle = lin(g, 0, low - 1, 0, low + 1, [[0, "#f6dc98"], [1, "#9a6a28"]]); g.lineWidth = 0.75;
    g.beginPath(); g.moveTo(a, top); g.bezierCurveTo(...lower[1], ...lower[2], ...lower[3]); g.stroke();
  }
  for (const x of swags) tassel(g, x + sc / 2, top - 0.6, Math.min(1.2, vh / 9));
  // a gilt cornice along the very top
  const ch = Math.max(2.2, vh * 0.28);
  g.fillStyle = lin(g, 0, 0, 0, ch, [[0, "#5a3a14"], [0.35, "#f2cf85"], [0.65, "#b9853a"], [1, "#4a2c0e"]]);
  g.fillRect(0, 0, w, ch);
  g.fillStyle = "rgba(0,0,0,.4)"; g.fillRect(0, ch, w, 0.5);
}

/* ---------- the room ---------- */

function drawRoom(g, L) {
  const { w, h, cx, cy, rx, ry } = L;
  const rand = rnd(7);
  L.flames = [];

  walls(g, L);
  beams(g, L);
  table(g, L);

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
      frond(g, fx, h + 2, h * (0.22 + rand() * 0.14), ang, dir * (0.5 + rand() * 0.6), rand);
    }
  }
  curtain(g, L, -1);
  curtain(g, L, 1);
  valance(g, L);

  // a gentle vignette
  const grd = g.createRadialGradient(cx, cy, Math.min(w, h) * 0.32, cx, cy, Math.max(w, h) * 0.78);
  grd.addColorStop(0, "rgba(0,0,0,0)"); grd.addColorStop(0.6, "rgba(0,0,0,.22)"); grd.addColorStop(1, "rgba(0,0,0,.62)");
  g.fillStyle = grd; g.fillRect(0, 0, w, h);
}

/* ---------- the live scene ---------- */

// a candle flame: a soft halo, then a teardrop that sways and breathes
function flame(g, f, t, i, still) {
  const a = still ? 0 : Math.sin(t * 0.009 + i * 1.7) * 0.55 + Math.sin(t * 0.023 + i * 3.1) * 0.3 + Math.sin(t * 0.051 + i) * 0.15;
  const s = f.s, hgt = (3.3 + a * 0.55) * s, wid = 1.05 * s, sway = a * 0.35 * s;
  g.globalCompositeOperation = "lighter";
  glow(g, f.x, f.y - hgt * 0.45, (8.5 + a * 0.8) * s, "255,170,80", 0.2);
  g.globalCompositeOperation = "source-over";
  const grd = g.createRadialGradient(f.x, f.y - hgt * 0.25, 0, f.x, f.y - hgt * 0.4, hgt * 0.85);
  grd.addColorStop(0, "#fffbe8"); grd.addColorStop(0.3, "#ffe08a"); grd.addColorStop(0.65, "#ff9a3a"); grd.addColorStop(1, "rgba(255,90,30,0)");
  g.fillStyle = grd;
  g.beginPath();
  g.moveTo(f.x + sway, f.y - hgt);
  g.bezierCurveTo(f.x + wid * 0.5 + sway * 0.5, f.y - hgt * 0.55, f.x + wid, f.y - hgt * 0.15, f.x, f.y + 0.25 * s);
  g.bezierCurveTo(f.x - wid, f.y - hgt * 0.15, f.x - wid * 0.5 + sway * 0.5, f.y - hgt * 0.55, f.x + sway, f.y - hgt);
  g.fill();
}

export class Scene {
  constructor(bg, fx) {
    this.bg = bg; this.fx = fx;
    this.L = null; this.heat = 0; this.dpr = 1;
    this.motes = [];
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.tick = this.tick.bind(this);
    requestAnimationFrame(this.tick);
  }

  draw(L) {
    this.L = L;
    const dpr = (this.dpr = dprNow());
    for (const c of [this.bg, this.fx]) {
      c.width = Math.round(L.W * dpr); c.height = Math.round(L.H * dpr);
      c.style.width = L.W + "px"; c.style.height = L.H + "px";
    }
    K = L.P * dpr;
    const g = this.bg.getContext("2d");
    g.setTransform(K, 0, 0, K, 0, 0);
    g.lineCap = "round"; g.lineJoin = "round";
    drawRoom(g, L);
    const r = rnd(3);
    this.motes = Array.from({ length: 30 }, () => ({ x: L.cx + (r() - 0.5) * L.rx * 1.3, y: L.cy + (r() - 0.5) * L.ry * 2, v: 0.04 + r() * 0.08, p: r() * 6, z: 0.6 + r() * 0.8 }));
    this.last = 0;
  }

  tick(t) {
    requestAnimationFrame(this.tick);
    if (!this.L || t - (this.last || 0) < 33) return;
    const dt = Math.min(4, (t - (this.last || t)) / 80);
    this.last = t;
    // dragged to a screen with a different pixel density: repaint at the new resolution
    if (dprNow() !== this.dpr) return this.draw(this.L);
    const L = this.L, g = this.fx.getContext("2d");
    const k = L.P * this.dpr;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, this.fx.width, this.fx.height);
    g.setTransform(k, 0, 0, k, 0, 0);
    L.flames.forEach((f, i) => flame(g, f, t, i, this.reduced));
    // dust drifting up through the light
    if (!this.reduced) {
      g.globalCompositeOperation = "lighter";
      for (const m of this.motes) {
        m.y -= m.v * dt; m.p += 0.08 * dt;
        if (m.y < L.cy - L.ry * 1.2) m.y = L.cy + L.ry;
        const a = 0.18 + 0.18 * Math.sin(m.p);
        g.fillStyle = `rgba(255,236,200,${a})`;
        g.beginPath(); g.arc(m.x + Math.sin(m.p) * 2, m.y, 0.32 * m.z, 0, TAU); g.fill();
        g.fillStyle = `rgba(255,220,170,${a * 0.25})`;
        g.beginPath(); g.arc(m.x + Math.sin(m.p) * 2, m.y, 0.9 * m.z, 0, TAU); g.fill();
      }
      g.globalCompositeOperation = "source-over";
    }
    // the cloth glows as the clock runs down
    if (this.heat > 0) {
      const r = Math.max(L.rx, L.ry) * (0.4 + this.heat * 0.4);
      ellGlow(g, L.cx, L.cy, r, r * Math.min(1, (L.ry / L.rx) * 1.3), [
        [0, `rgba(255,${Math.round(140 - this.heat * 100)},50,${0.08 + this.heat * 0.22})`],
        [0.55, `rgba(255,${Math.round(120 - this.heat * 80)},50,${(0.08 + this.heat * 0.22) * 0.4})`],
        [1, "rgba(255,80,40,0)"]]);
    }
  }

  setHeat(v) { this.heat = Math.max(0, Math.min(1, v)); }
}
