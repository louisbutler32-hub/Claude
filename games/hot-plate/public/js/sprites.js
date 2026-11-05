// Small pixel sprites, drawn at "art pixel" size on tiny canvases and scaled up with crisp
// edges in CSS. Drawing smooth shapes at low resolution is what gives the chunky pixel look.

const C = {
  ink: "#120709",
  gold: "#d9a648", goldHi: "#f6d58a", goldDk: "#8a5e22",
  plate: "#f3e7d0", plateHi: "#fff8ea", plateDk: "#cdbb9c",
  silver: "#c9c6c2", silverHi: "#f4f2ee", silverDk: "#77706b",
  glass: "rgba(220,235,255,.55)", wine: "#7e1428",
};

function canvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d");
  g.imageSmoothingEnabled = false;
  return [c, g];
}
function ellipse(g, x, y, rx, ry, fill) {
  g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fillStyle = fill; g.fill();
}

// a place setting: charger plate, fork, knife and a glass of red
export function placeSetting({ dim = false } = {}) {
  const [c, g] = canvas(40, 22);
  if (dim) g.globalAlpha = 0.45;
  ellipse(g, 20, 13, 13, 7.5, "rgba(0,0,0,.35)");
  ellipse(g, 20, 11.5, 13, 7, C.goldDk);
  ellipse(g, 20, 11, 12.5, 6.6, C.gold);
  ellipse(g, 20, 10.6, 11, 5.6, C.goldHi);
  ellipse(g, 20, 11, 10, 5, C.plateDk);
  ellipse(g, 20, 10.6, 9.5, 4.6, C.plate);
  ellipse(g, 19, 9.8, 6, 2.6, C.plateHi);
  // fork
  g.fillStyle = C.silverDk; g.fillRect(3, 6, 1, 11); g.fillRect(2, 5, 3, 2);
  g.fillStyle = C.silver; g.fillRect(2, 3, 1, 3); g.fillRect(4, 3, 1, 3); g.fillRect(3, 6, 1, 10);
  // knife
  g.fillStyle = C.silverDk; g.fillRect(36, 5, 2, 12);
  g.fillStyle = C.silverHi; g.fillRect(36, 4, 1, 8);
  // glass
  ellipse(g, 34, 3, 2.6, 2.4, C.glass);
  ellipse(g, 34, 3.6, 2, 1.4, C.wine);
  g.fillStyle = C.glass; g.fillRect(33.5, 5, 1, 3);
  return c;
}

// the player's face, drawn small so the emoji turns into pixel art too
export function avatar(emoji, size = 18) {
  const [c, g] = canvas(size, size);
  g.font = `${size - 3}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(emoji, size / 2, size / 2 + 1);
  // quantise alpha so edges stay crisp after scaling
  const img = g.getImageData(0, 0, size, size);
  for (let i = 3; i < img.data.length; i += 4) img.data[i] = img.data[i] > 90 ? 255 : 0;
  g.putImageData(img, 0, 0);
  return c;
}

// the hot plate: a silver cloche on a plate. heat 0..1 tints it towards red-hot.
export function cloche(heat = 0, { gold = false, burnt = false } = {}) {
  const [c, g] = canvas(30, 24);
  const hi = gold ? C.goldHi : C.silverHi, mid = gold ? C.gold : C.silver, dk = gold ? C.goldDk : C.silverDk;
  ellipse(g, 15, 20, 13, 3.5, "rgba(0,0,0,.4)");
  ellipse(g, 15, 18.5, 13, 3.6, burnt ? "#2a1c17" : C.plateDk);
  ellipse(g, 15, 18, 12, 3, burnt ? "#3a2a24" : C.plate);
  // dome
  g.save();
  g.beginPath(); g.ellipse(15, 17, 10.5, 12, 0, Math.PI, 0); g.closePath(); g.clip();
  const grd = g.createLinearGradient(5, 0, 25, 0);
  grd.addColorStop(0, dk); grd.addColorStop(0.35, hi); grd.addColorStop(0.6, mid); grd.addColorStop(1, dk);
  g.fillStyle = burnt ? "#2b201c" : grd; g.fillRect(0, 0, 30, 24);
  if (heat > 0 && !burnt) { g.fillStyle = `rgba(255,${Math.round(110 - heat * 80)},40,${heat * 0.55})`; g.fillRect(0, 0, 30, 24); }
  if (burnt) { g.fillStyle = "#4a3028"; g.fillRect(7, 9, 3, 2); g.fillRect(17, 12, 4, 2); }
  g.restore();
  g.fillStyle = burnt ? "#1a110e" : dk; g.fillRect(4, 16, 22, 1);
  // knob
  ellipse(g, 15, 4.5, 2.4, 1.6, burnt ? "#1a110e" : dk);
  ellipse(g, 15, 4, 1.6, 1.1, burnt ? "#3a2a24" : hi);
  return c;
}

// the pot that boils over. heat 0..1: burner flames grow, foam rises and lifts the lid, then spills
// down the sides. frame 0/1 jiggles the bubbles so it looks alive. burnt: blackened and spilled.
export function pot(heat = 0, frame = 0, { burnt = false } = {}) {
  const [c, g] = canvas(36, 40);
  const rnd = ((s) => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646)(7 + frame * 31);
  const rim = 22, foamTop = rim - 2 - heat * 11;
  // burner flames under the pot
  if (!burnt) {
    const n = 3 + Math.round(heat * 3), h = 2 + heat * 5;
    for (let i = 0; i < n; i++) {
      const x = 9 + (i * 18) / Math.max(1, n - 1) + (frame ? 1 : 0);
      g.fillStyle = "#ff7a2f"; g.fillRect(Math.round(x), 37 - Math.round(h), 2, Math.round(h));
      g.fillStyle = "#ffd35a"; g.fillRect(Math.round(x), 37 - Math.round(h * 0.5), 1, Math.round(h * 0.5));
    }
  }
  ellipse(g, 18, 37.5, 14, 2.2, "rgba(0,0,0,.4)");
  // handles
  g.fillStyle = burnt ? "#1a110e" : "#5a2a14";
  g.fillRect(2, rim + 2, 4, 3); g.fillRect(30, rim + 2, 4, 3);
  // body: copper, darker towards the bottom, glowing with heat
  g.save();
  g.beginPath(); g.moveTo(5, rim); g.lineTo(31, rim); g.lineTo(30, 33); g.quadraticCurveTo(18, 37, 6, 33); g.closePath(); g.clip();
  const grd = g.createLinearGradient(5, 0, 31, 0);
  if (burnt) { grd.addColorStop(0, "#1c1411"); grd.addColorStop(0.4, "#3a2a24"); grd.addColorStop(1, "#140d0b"); }
  else { grd.addColorStop(0, "#6a2f16"); grd.addColorStop(0.35, "#d7884f"); grd.addColorStop(0.6, "#b0602f"); grd.addColorStop(1, "#5a2612"); }
  g.fillStyle = grd; g.fillRect(0, 0, 36, 40);
  if (heat > 0 && !burnt) { g.fillStyle = `rgba(255,${Math.round(90 - heat * 60)},30,${heat * 0.45})`; g.fillRect(0, 26, 36, 14); }
  g.restore();
  // rim and the dark inside
  ellipse(g, 18, rim, 13.5, 3.4, burnt ? "#2b201c" : "#e3a06a");
  ellipse(g, 18, rim, 12, 2.6, "#2a1208");
  // foam rising out of the pot
  const foam = burnt ? "#6b5446" : "#f6efe4", shade = burnt ? "#4a3a30" : "#d6cbbb";
  const blobs = 7 + Math.round(heat * 8);
  for (let i = 0; i < blobs; i++) {
    const x = 7 + rnd() * 22, y = rim - 1 - rnd() * (rim - 1 - foamTop), r = 2 + rnd() * (2 + heat * 2.5);
    ellipse(g, x, y + 0.6, r, r * 0.8, shade);
    ellipse(g, x, y, r, r * 0.8, foam);
  }
  // spilling down the sides once it's past halfway
  if (heat > 0.45 || burnt) {
    const drips = burnt ? 6 : Math.round((heat - 0.45) * 12);
    for (let i = 0; i < drips; i++) {
      const left = i % 2 === 0, x = left ? 5 + rnd() * 5 : 26 + rnd() * 5;
      const len = 3 + rnd() * (burnt ? 9 : heat * 10);
      g.fillStyle = foam; g.fillRect(Math.round(x), rim, 2, Math.round(len));
      ellipse(g, x + 1, rim + len, 1.4, 1.2, foam);
    }
  }
  // the lid, pushed up by the foam
  if (!burnt) {
    const ly = Math.min(rim - 1, foamTop + 1), tilt = heat > 0.6 ? (frame ? 1.2 : -1.2) * heat : 0;
    g.save(); g.translate(18, ly); g.rotate(tilt * 0.08);
    ellipse(g, 0, 0.8, 12.5, 2.6, "#5c5c66");
    ellipse(g, 0, 0, 12.5, 2.4, "#a9a9b4");
    ellipse(g, -2, -0.5, 7, 1.2, "#d8d8e0");
    ellipse(g, 0, -2.6, 2.2, 1.4, "#3a3a44");
    g.restore();
  }
  return c;
}
