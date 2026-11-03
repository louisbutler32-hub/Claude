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
