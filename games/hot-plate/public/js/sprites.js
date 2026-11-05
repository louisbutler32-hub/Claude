// Table-top sprites, painted as smooth vector drawings. Each one is still laid out in art units
// (the same width × height as before, so table.js sizes them the same way) but drawn K times
// larger than that, so it stays sharp when the browser scales it up to the screen.

const C = {
  gold: "#d9a648", goldHi: "#f6d58a", goldDk: "#8a5e22",
  plate: "#f3e7d0", plateHi: "#fffaf0", plateDk: "#cdbb9c",
  silver: "#c9c6c2", silverHi: "#f7f5f1", silverDk: "#6f6964",
};
const TAU = Math.PI * 2;
// device pixels per art unit: enough for a P=3 layout on a 2× screen
const K = Math.max(4, Math.ceil(3 * Math.min((typeof window !== "undefined" && window.devicePixelRatio) || 1, 2)));

function canvas(w, h) {
  const c = document.createElement("canvas");
  c.width = Math.round(w * K); c.height = Math.round(h * K);
  const g = c.getContext("2d");
  g.scale(K, K);
  g.lineCap = "round"; g.lineJoin = "round";
  return [c, g];
}
function lin(g, x0, y0, x1, y1, stops) {
  const grd = g.createLinearGradient(x0, y0, x1, y1);
  for (const [o, c] of stops) grd.addColorStop(o, c);
  return grd;
}
function ellipse(g, x, y, rx, ry, fill) {
  g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fillStyle = fill; g.fill();
}
// a radial gradient squashed into an ellipse
function ellGrad(g, x, y, rx, ry, stops, fx = 0, fy = 0) {
  g.save();
  g.translate(x, y); g.scale(1, ry / rx);
  const grd = g.createRadialGradient(fx, fy * (rx / ry), 0, 0, 0, rx);
  for (const [o, c] of stops) grd.addColorStop(o, c);
  g.fillStyle = grd;
  g.beginPath(); g.arc(0, 0, rx, 0, TAU); g.fill();
  g.restore();
}
const shadow = (g, x, y, rx, ry, a) => ellGrad(g, x, y, rx, ry, [[0, `rgba(0,0,0,${a})`], [0.6, `rgba(0,0,0,${a * 0.6})`], [1, "rgba(0,0,0,0)"]]);
function rr(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
  g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
  g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
}
const silverAcross = (g, x0, x1) => lin(g, x0, 0, x1, 0, [[0, C.silverDk], [0.35, C.silverHi], [0.65, C.silver], [1, C.silverDk]]);

/* ---------- a place setting ---------- */

function fork(g, x, y0, y1) {
  const len = y1 - y0, neck = y0 + len * 0.36, head = y0 + len * 0.2;
  const draw = (dx, dy, fill, tines) => {
    g.fillStyle = fill;
    g.beginPath();
    g.moveTo(x - 1.25 + dx, head + dy);
    g.quadraticCurveTo(x - 1.2 + dx, neck - 0.6 + dy, x - 0.35 + dx, neck + 0.6 + dy);
    g.lineTo(x - 0.55 + dx, y1 - 1 + dy);
    g.quadraticCurveTo(x + dx, y1 + 0.45 + dy, x + 0.55 + dx, y1 - 1 + dy);
    g.lineTo(x + 0.35 + dx, neck + 0.6 + dy);
    g.quadraticCurveTo(x + 1.2 + dx, neck - 0.6 + dy, x + 1.25 + dx, head + dy);
    g.closePath(); g.fill();
    g.strokeStyle = tines; g.lineWidth = 0.36;
    for (const t of [-0.95, -0.32, 0.32, 0.95]) { g.beginPath(); g.moveTo(x + t + dx, head + 0.3 + dy); g.lineTo(x + t + dx, y0 + dy); g.stroke(); }
  };
  draw(0.35, 0.45, "rgba(0,0,0,.35)", "rgba(0,0,0,.35)");
  const metal = silverAcross(g, x - 1.3, x + 1.3);
  draw(0, 0, metal, metal);
  g.strokeStyle = "rgba(255,255,255,.75)"; g.lineWidth = 0.22;
  g.beginPath(); g.moveTo(x - 0.15, neck + 1); g.lineTo(x - 0.2, y1 - 1.4); g.stroke();
}

function knife(g, x, y0, y1) {
  const len = y1 - y0, bolster = y0 + len * 0.5;
  const draw = (dx, dy, blade, handle) => {
    g.fillStyle = blade;
    g.beginPath();
    g.moveTo(x - 0.75 + dx, bolster + dy);
    g.lineTo(x - 0.75 + dx, y0 + 1.6 + dy);
    g.quadraticCurveTo(x - 0.7 + dx, y0 + dy, x + 0.35 + dx, y0 + dy);
    g.quadraticCurveTo(x + 0.85 + dx, y0 + 1.6 + dy, x + 0.75 + dx, bolster + dy);
    g.closePath(); g.fill();
    g.fillStyle = handle;
    rr(g, x - 0.8 + dx, bolster - 0.2 + dy, 1.6, y1 - bolster + 0.2, 0.75); g.fill();
  };
  draw(0.35, 0.45, "rgba(0,0,0,.35)", "rgba(0,0,0,.35)");
  draw(0, 0, lin(g, x - 0.8, 0, x + 0.8, 0, [[0, C.silverHi], [0.5, C.silver], [1, C.silverDk]]), silverAcross(g, x - 0.8, x + 0.8));
  g.strokeStyle = "rgba(255,255,255,.8)"; g.lineWidth = 0.2;
  g.beginPath(); g.moveTo(x - 0.45, y0 + 1.6); g.lineTo(x - 0.45, bolster - 0.4); g.stroke();
  g.strokeStyle = "rgba(90,80,75,.6)"; g.lineWidth = 0.18;
  g.beginPath(); g.moveTo(x - 0.8, bolster + 0.25); g.lineTo(x + 0.8, bolster + 0.25); g.stroke();
}

function wineGlass(g, x, top, foot) {
  shadow(g, x + 0.6, foot + 0.3, 2.8, 0.8, 0.4);
  const bowlBot = top + 5.6;
  // foot and stem
  ellipse(g, x, foot, 1.9, 0.55, "rgba(225,235,250,.45)");
  g.strokeStyle = "rgba(255,255,255,.7)"; g.lineWidth = 0.18;
  g.beginPath(); g.ellipse(x, foot, 1.9, 0.55, 0, Math.PI * 0.95, Math.PI * 2.05); g.stroke();
  g.strokeStyle = "rgba(225,235,250,.75)"; g.lineWidth = 0.42;
  g.beginPath(); g.moveTo(x, bowlBot); g.lineTo(x, foot); g.stroke();
  // the bowl
  const bowl = () => {
    g.beginPath();
    g.moveTo(x - 2.15, top);
    g.bezierCurveTo(x - 2.5, top + 3.2, x - 1.5, bowlBot, x, bowlBot);
    g.bezierCurveTo(x + 1.5, bowlBot, x + 2.5, top + 3.2, x + 2.15, top);
    g.closePath();
  };
  bowl(); g.fillStyle = "rgba(210,225,245,.16)"; g.fill();
  // red wine, a little over half full
  g.save(); bowl(); g.clip();
  const surf = top + 2.4;
  g.fillStyle = lin(g, 0, surf, 0, bowlBot, [[0, "#9c1c34"], [1, "#3e0610"]]);
  g.fillRect(x - 3, surf, 6, bowlBot - surf + 0.2);
  ellipse(g, x, surf, 2.25, 0.42, "#b8344d");
  ellipse(g, x - 0.6, surf, 0.9, 0.16, "rgba(255,190,200,.45)");
  g.restore();
  bowl(); g.strokeStyle = "rgba(255,255,255,.5)"; g.lineWidth = 0.18; g.stroke();
  g.beginPath(); g.ellipse(x, top, 2.15, 0.45, 0, 0, TAU); g.strokeStyle = "rgba(255,255,255,.65)"; g.lineWidth = 0.2; g.stroke();
  g.strokeStyle = "rgba(255,255,255,.8)"; g.lineWidth = 0.3;
  g.beginPath(); g.moveTo(x - 1.55, top + 0.9); g.quadraticCurveTo(x - 1.75, top + 3, x - 0.9, top + 4.4); g.stroke();
}

// a place setting: gold charger, porcelain plate, fork, knife and a glass of red (40 × 22)
export function placeSetting({ dim = false } = {}) {
  const [c, g] = canvas(40, 22);
  if (dim) g.globalAlpha = 0.45;
  shadow(g, 20.4, 12.6, 15, 8.4, 0.5);
  // charger
  ellipse(g, 20, 11.6, 13, 7, C.goldDk);
  g.beginPath(); g.ellipse(20, 11, 13, 7, 0, 0, TAU);
  g.fillStyle = lin(g, 8, 5, 32, 17, [[0, "#f6dc98"], [0.3, "#d9a648"], [0.55, "#f2cf85"], [0.8, "#a8742e"], [1, "#6a4418"]]);
  g.fill();
  g.strokeStyle = "rgba(255,240,200,.55)"; g.lineWidth = 0.25;
  g.beginPath(); g.ellipse(20, 11, 12.2, 6.5, 0, Math.PI * 1.05, Math.PI * 1.75); g.stroke();
  g.strokeStyle = "rgba(90,55,15,.45)"; g.lineWidth = 0.3;
  g.beginPath(); g.ellipse(20, 11, 11.1, 5.95, 0, 0, TAU); g.stroke();
  // plate
  ellipse(g, 20, 11.25, 10.4, 5.5, "#b9a587");
  ellGrad(g, 20, 10.95, 10.3, 5.35, [[0, C.plateHi], [0.55, "#f6ecda"], [0.85, "#e8dabf"], [1, "#d8c6a6"]], -2.5, -1.5);
  g.strokeStyle = "rgba(201,148,66,.85)"; g.lineWidth = 0.3;
  g.beginPath(); g.ellipse(20, 10.95, 9.2, 4.75, 0, 0, TAU); g.stroke();
  // the well of the plate
  g.strokeStyle = "rgba(150,120,90,.3)"; g.lineWidth = 0.35;
  g.beginPath(); g.ellipse(20, 11.1, 6.4, 3.25, 0, 0, TAU); g.stroke();
  g.strokeStyle = "rgba(255,255,255,.85)"; g.lineWidth = 0.25;
  g.beginPath(); g.ellipse(20, 11.3, 6.4, 3.25, 0, Math.PI * 0.15, Math.PI * 0.85); g.stroke();
  // a glint on the rim
  g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 0.55;
  g.beginPath(); g.ellipse(20, 10.95, 8.6, 4.4, 0, Math.PI * 1.12, Math.PI * 1.4); g.stroke();
  fork(g, 3.6, 3.2, 18.6);
  wineGlass(g, 33, 0.9, 9.4);
  knife(g, 37.4, 4.6, 19);
  return c;
}

// the player's face as a smooth emoji (the table shows emoji as live text; this is a fallback)
export function avatar(emoji, size = 18) {
  const [c, g] = canvas(size, size);
  g.font = `${size - 3}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(emoji, size / 2, size / 2 + 1);
  return c;
}

/* ---------- the cloche ---------- */

// a silver (or gold) cloche on a plate, 30 × 24. heat 0..1 tints it towards red-hot.
export function cloche(heat = 0, { gold = false, burnt = false } = {}) {
  const [c, g] = canvas(30, 24);
  const hi = gold ? "#fff0bf" : C.silverHi, mid = gold ? C.gold : C.silver, dk = gold ? "#6a4418" : C.silverDk;
  shadow(g, 15, 20.4, 14.5, 3.8, 0.55);
  // the plate it sits on
  ellipse(g, 15, 19, 13, 3.6, burnt ? "#1e1411" : gold ? "#8a5e22" : "#a89a86");
  ellGrad(g, 15, 18.5, 12.6, 3.25, burnt ? [[0, "#3a2a24"], [1, "#22170f"]] : gold ? [[0, "#f6dc98"], [1, "#b9853a"]] : [[0, C.plateHi], [1, C.plateDk]], -3, -1);
  // the dome: the top half of an ellipse, closed by the front of its rim
  const dome = () => {
    g.beginPath();
    g.ellipse(15, 17, 10.5, 12, 0, Math.PI, TAU);
    g.ellipse(15, 17, 10.5, 2.3, 0, 0, Math.PI);
    g.closePath();
  };
  g.save(); dome(); g.clip();
  g.fillStyle = burnt ? lin(g, 4, 0, 26, 0, [[0, "#140d0b"], [0.35, "#3a2a24"], [1, "#100a08"]])
    : lin(g, 4.5, 0, 25.5, 0, [[0, dk], [0.18, mid], [0.36, hi], [0.55, mid], [0.82, dk], [1, mid]]);
  g.fillRect(0, 0, 30, 24);
  if (!burnt) {
    // the red room reflected low on the dome, the light high on it
    g.fillStyle = lin(g, 0, 11, 0, 19, [[0, "rgba(120,20,36,0)"], [0.6, gold ? "rgba(140,40,20,.22)" : "rgba(120,20,36,.28)"], [1, "rgba(40,5,12,.35)"]]);
    g.fillRect(0, 0, 30, 24);
    ellGrad(g, 11, 9, 5.5, 4.5, [[0, "rgba(255,255,255,.85)"], [0.4, "rgba(255,255,255,.3)"], [1, "rgba(255,255,255,0)"]]);
    if (heat > 0) {
      g.fillStyle = `rgba(255,${Math.round(110 - heat * 80)},40,${heat * 0.55})`; g.fillRect(0, 0, 30, 24);
    }
  } else {
    for (const [x, y, r] of [[9, 10, 2.6], [19, 13, 3], [14, 7, 1.8]]) ellGrad(g, x, y, r, r * 0.7, [[0, "rgba(80,50,40,.8)"], [1, "rgba(80,50,40,0)"]]);
  }
  g.restore();
  // the rim band
  g.strokeStyle = burnt ? "#0e0806" : dk; g.lineWidth = 0.9;
  g.beginPath(); g.ellipse(15, 17, 10.4, 2.25, 0, 0.05, Math.PI - 0.05); g.stroke();
  g.strokeStyle = burnt ? "rgba(90,60,50,.5)" : "rgba(255,255,255,.6)"; g.lineWidth = 0.3;
  g.beginPath(); g.ellipse(15, 16.3, 10.3, 2.2, 0, 0.2, Math.PI - 0.2); g.stroke();
  // the knob
  ellipse(g, 15, 5.3, 1.5, 0.55, burnt ? "#100a08" : dk);
  g.beginPath(); g.arc(15, 3.5, 1.9, 0, TAU);
  g.fillStyle = burnt ? "#2a1d18" : (() => { const r = g.createRadialGradient(14.3, 2.8, 0.1, 15, 3.5, 1.9); r.addColorStop(0, "#fff"); r.addColorStop(0.35, hi); r.addColorStop(1, dk); return r; })();
  g.fill();
  return c;
}

/* ---------- the pot ---------- */

function burnerFlame(g, x, base, hgt, wid) {
  const grd = g.createRadialGradient(x, base - hgt * 0.2, 0, x, base - hgt * 0.35, hgt);
  grd.addColorStop(0, "rgba(255,250,220,.95)"); grd.addColorStop(0.3, "rgba(255,214,90,.95)");
  grd.addColorStop(0.65, "rgba(255,120,40,.85)"); grd.addColorStop(1, "rgba(255,70,20,0)");
  g.fillStyle = grd;
  g.beginPath();
  g.moveTo(x, base - hgt);
  g.bezierCurveTo(x + wid * 0.45, base - hgt * 0.55, x + wid, base - hgt * 0.2, x, base);
  g.bezierCurveTo(x - wid, base - hgt * 0.2, x - wid * 0.45, base - hgt * 0.55, x, base - hgt);
  g.fill();
  g.fillStyle = "rgba(90,140,255,.55)";
  g.beginPath(); g.ellipse(x, base - 0.4, wid * 0.45, 0.6, 0, 0, TAU); g.fill();
}

// the pot that boils over (36 × 40). heat 0..1: burner flames grow, foam rises and lifts the lid,
// then spills down the sides. frame 0/1 moves the bubbles so it looks alive. burnt: blackened.
export function pot(heat = 0, frame = 0, { burnt = false } = {}) {
  const [c, g] = canvas(36, 40);
  const rnd = ((s) => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646)(7 + frame * 31);
  const rim = 22, foamTop = rim - 2 - heat * 11;
  // the burner under it
  if (!burnt) {
    g.globalCompositeOperation = "lighter";
    ellGrad(g, 18, 35, 15, 5 + heat * 3, [[0, `rgba(255,140,50,${0.25 + heat * 0.35})`], [1, "rgba(255,90,30,0)"]]);
    g.globalCompositeOperation = "source-over";
    const n = 4 + Math.round(heat * 3), fh = 2.6 + heat * 5.2;
    for (let i = 0; i < n; i++) {
      const x = 9 + (i * 18) / Math.max(1, n - 1) + (frame ? 0.4 : -0.4) * (i % 2 ? 1 : -1);
      burnerFlame(g, x, 38, fh * (0.8 + rnd() * 0.4), 1.5 + heat * 0.5);
    }
  }
  shadow(g, 18, 37.4, 15, 2.4, 0.5);
  // handles
  for (const sd of [-1, 1]) {
    const hx = sd < 0 ? 1.4 : 29.6;
    g.fillStyle = burnt ? "#120b09" : lin(g, 0, rim + 1, 0, rim + 4.4, [[0, "#9a5a32"], [1, "#3a1608"]]);
    rr(g, hx, rim + 1.2, 5, 3, 1.4); g.fill();
    g.fillStyle = burnt ? "#000" : "#24100a";
    rr(g, hx + (sd < 0 ? 1 : 1.6), rim + 2.1, 2.4, 1.2, 0.6); g.fill();
  }
  // body: copper, darker towards the bottom, glowing with heat
  const body = () => {
    g.beginPath();
    g.moveTo(5, rim); g.lineTo(31, rim); g.lineTo(30.3, 32.4);
    g.quadraticCurveTo(30.1, 34.6, 26, 35); g.quadraticCurveTo(18, 35.9, 10, 35);
    g.quadraticCurveTo(5.9, 34.6, 5.7, 32.4); g.closePath();
  };
  g.save(); body(); g.clip();
  g.fillStyle = burnt ? lin(g, 5, 0, 31, 0, [[0, "#140d0b"], [0.35, "#3a2a24"], [0.6, "#241915"], [1, "#0e0806"]])
    : lin(g, 5, 0, 31, 0, [[0, "#4a1a0c"], [0.12, "#8a3a1a"], [0.3, "#f0a86e"], [0.42, "#e08a50"], [0.62, "#b45a2a"], [0.85, "#6a2810"], [1, "#3a1406"]]);
  g.fillRect(0, 0, 36, 40);
  g.fillStyle = lin(g, 0, rim, 0, 36, [[0, "rgba(0,0,0,.1)"], [0.3, "rgba(0,0,0,0)"], [1, "rgba(0,0,0,.4)"]]);
  g.fillRect(0, 0, 36, 40);
  if (!burnt) {
    g.fillStyle = "rgba(255,240,220,.45)";
    g.beginPath(); g.ellipse(11, rim + 6.5, 0.9, 4.6, 0, 0, TAU); g.fill();
    g.strokeStyle = "rgba(60,20,6,.35)"; g.lineWidth = 0.35;
    g.beginPath(); g.moveTo(5, rim + 2.6); g.quadraticCurveTo(18, rim + 3.6, 31, rim + 2.6); g.stroke();
    if (heat > 0) {
      g.fillStyle = lin(g, 0, 26, 0, 36, [[0, "rgba(255,90,30,0)"], [1, `rgba(255,${Math.round(90 - heat * 60)},30,${heat * 0.55})`]]);
      g.fillRect(0, 0, 36, 40);
    }
  } else {
    for (const [x, y, r] of [[12, 28, 3], [24, 31, 3.5]]) ellGrad(g, x, y, r, r * 0.7, [[0, "rgba(0,0,0,.6)"], [1, "rgba(0,0,0,0)"]]);
  }
  g.restore();
  // rim and the dark inside
  g.beginPath(); g.ellipse(18, rim, 13.5, 3.4, 0, 0, TAU);
  g.fillStyle = burnt ? "#2b201c" : lin(g, 4.5, 0, 31.5, 0, [[0, "#a8582c"], [0.35, "#ffc890"], [0.7, "#d88850"], [1, "#8a3e18"]]);
  g.fill();
  ellGrad(g, 18, rim, 12, 2.6, [[0, "#1a0804"], [0.8, "#2a1208"], [1, "#4a2210"]], 0, 1);

  // foam rising out of the pot
  const foam = burnt ? "#6b5446" : "#fbf6ee", shade = burnt ? "#3a2c24" : "#cfc2b0";
  const blobs = [];
  for (let x = 7.5; x <= 28.5; x += 3) blobs.push([x, rim - 0.6, 2.2 + rnd() * 0.6]);
  const extra = 6 + Math.round(heat * 9);
  for (let i = 0; i < extra; i++) {
    const r = 2 + rnd() * (1.8 + heat * 2.4);
    blobs.push([7.5 + rnd() * 21, rim - 1 - rnd() * (rim - 1 - foamTop), r]);
  }
  const union = (dy) => { g.beginPath(); for (const [x, y, r] of blobs) { g.moveTo(x + r, y + dy); g.ellipse(x, y + dy, r, r * 0.82, 0, 0, TAU); } };
  union(0.7); g.fillStyle = shade; g.fill();
  union(0); g.fillStyle = foam; g.fill();
  // shade the mass as one: lit from above, darker where it sinks into the pot
  g.save(); union(0); g.clip();
  const ftop = Math.min(...blobs.map(([, y, r]) => y - r));
  g.fillStyle = lin(g, 0, ftop, 0, rim + 3, burnt
    ? [[0, "rgba(150,120,100,.25)"], [0.5, "rgba(0,0,0,0)"], [1, "rgba(0,0,0,.4)"]]
    : [[0, "rgba(255,255,255,.4)"], [0.55, "rgba(255,255,255,0)"], [1, "rgba(150,125,100,.4)"]]);
  g.fillRect(0, ftop, 36, rim + 3 - ftop);
  // soft highlights on the upper bubbles only, so it reads as one froth rather than rings
  for (const [x, y, r] of blobs) if (y - r < rim - 2.5) ellGrad(g, x - r * 0.25, y - r * 0.45, r * 0.5, r * 0.32, [[0, burnt ? "rgba(170,140,120,.3)" : "rgba(255,255,255,.75)"], [1, "rgba(255,255,255,0)"]]);
  g.restore();
  // little bubbles popping on the surface
  if (!burnt) {
    const pops = 4 + Math.round(heat * 6);
    for (let i = 0; i < pops; i++) {
      const [bx, by, br] = blobs[Math.floor(rnd() * blobs.length)];
      const x = bx + (rnd() - 0.5) * br, y = by - rnd() * br * 0.6, r = 0.35 + rnd() * 0.55;
      g.strokeStyle = "rgba(150,130,110,.55)"; g.lineWidth = 0.16;
      g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke();
      g.fillStyle = "rgba(255,255,255,.9)";
      g.beginPath(); g.arc(x - r * 0.35, y - r * 0.35, r * 0.3, 0, TAU); g.fill();
    }
  }
  // spilling down the sides once it's past halfway
  if (heat > 0.45 || burnt) {
    const drips = burnt ? 6 : Math.round((heat - 0.45) * 12);
    for (let i = 0; i < drips; i++) {
      const left = i % 2 === 0, x = left ? 6 + rnd() * 5 : 25 + rnd() * 5;
      const len = 3 + rnd() * (burnt ? 9 : heat * 10), wd = 0.8 + rnd() * 0.4;
      const drip = (dx) => {
        g.beginPath();
        g.moveTo(x - wd - 0.9 + dx, rim);
        g.quadraticCurveTo(x - wd + dx, rim + 0.4, x - wd * 0.8 + dx, rim + len * 0.45);
        g.quadraticCurveTo(x - wd * 0.6 + dx, rim + len * 0.75, x - wd * 1.1 + dx, rim + len);
        g.arc(x + dx, rim + len, wd * 1.1, Math.PI, 0, true);
        g.quadraticCurveTo(x + wd * 0.6 + dx, rim + len * 0.75, x + wd * 0.8 + dx, rim + len * 0.45);
        g.quadraticCurveTo(x + wd + dx, rim + 0.4, x + wd + 0.9 + dx, rim);
        g.closePath();
      };
      drip(0.3); g.fillStyle = shade; g.fill();
      drip(0); g.fillStyle = foam; g.fill();
      g.fillStyle = burnt ? "rgba(160,130,110,.3)" : "rgba(255,255,255,.9)";
      g.beginPath(); g.arc(x - wd * 0.35, rim + len - wd * 0.3, wd * 0.35, 0, TAU); g.fill();
    }
  }
  // the lid, pushed up by the foam
  if (!burnt) {
    const ly = Math.min(rim - 1, foamTop + 1), tilt = heat > 0.6 ? (frame ? 1.2 : -1.2) * heat : 0;
    g.save(); g.translate(18, ly); g.rotate(tilt * 0.08);
    shadow(g, 0, 1.6, 13, 2.8, 0.25);
    ellipse(g, 0, 0.8, 12.5, 2.6, "#4a4a55");
    g.beginPath(); g.ellipse(0, 0, 12.5, 2.4, 0, 0, TAU);
    g.fillStyle = lin(g, -12.5, 0, 12.5, 0, [[0, "#6a6a76"], [0.3, "#e8e8ef"], [0.55, "#b4b4c0"], [0.85, "#7a7a86"], [1, "#55555f"]]);
    g.fill();
    g.strokeStyle = "rgba(60,60,70,.45)"; g.lineWidth = 0.25;
    g.beginPath(); g.ellipse(0, -0.1, 9.5, 1.75, 0, 0, TAU); g.stroke();
    g.strokeStyle = "rgba(255,255,255,.75)"; g.lineWidth = 0.4;
    g.beginPath(); g.ellipse(0, -0.2, 11.4, 2, 0, Math.PI * 1.1, Math.PI * 1.45); g.stroke();
    // the handle on top
    g.fillStyle = "#2c2c34";
    rr(g, -2.4, -3.3, 4.8, 1.9, 0.9); g.fill();
    g.fillStyle = "rgba(255,255,255,.35)";
    rr(g, -1.9, -3.05, 3, 0.55, 0.27); g.fill();
    g.restore();
  }
  return c;
}
