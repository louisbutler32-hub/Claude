// The dining room, drawn as pixel art on a canvas. Everything is plain fillRect at a coarse
// "art pixel" size, then scaled up with crisp edges. layout() is shared with app.js so the
// seats, plates and bubbles in the DOM land exactly on the chairs and plates in the picture.
(() => {
  const C = {
    wallA: "#3b1420", wallB: "#331019", wallDot: "#5a2431",
    rail: "#24100a", railHi: "#c99a3c",
    woodA: "#4a2a18", woodB: "#55311c", woodC: "#3f2314", seam: "#2a170c",
    rugA: "#6d1a26", rugB: "#5a1420", rugGold: "#c99a3c",
    tableEdge: "#2e180c", skirt: "#8e2430",
    clothDark: "#b52b38", clothMid: "#e39a94", clothLight: "#fbe9d2",
    chair: "#3a2112", chairHi: "#5b3620", chairDk: "#24130a",
    plate: "#f7f1e8", plateRim: "#cfc4b6",
    gold: "#e2b04a", candle: "#f4e6c8", flameA: "#ffd35a", flameB: "#ff8a2b",
    frame: "#c99a3c", pic1: "#1d2b45", pic2: "#2f4d3a", pic3: "#d98a3a",
  };
  const hash = (a, b) => {
    let x = (a * 374761393 + b * 668265263) | 0;
    x = Math.imul(x ^ (x >>> 13), 1274126177);
    return ((x ^ (x >>> 16)) >>> 0) / 4294967295;
  };

  // geometry in CSS pixels, plus the art-pixel grid it was built on
  function layout(cssW, cssH, seatCount, opts = {}) {
    const P = cssW < 720 ? 3 : 4;
    const W = Math.ceil(cssW / P), H = Math.ceil(cssH / P);
    const topRes = (opts.top ?? 120) / P, botRes = (opts.bottom ?? 150) / P;
    const seatHalfW = (cssW < 720 ? 40 : 50) / P, seatHalfH = (cssW < 720 ? 38 : 44) / P;
    const cx = W / 2;
    const cy = (topRes + (H - botRes)) / 2;
    const availW = W / 2 - seatHalfW - 4;
    const availH = (H - botRes - topRes) / 2 - seatHalfH + 2;
    const Rx = Math.max(30, availW);
    const Ry = Math.max(24, Math.min(availH, cssW > cssH ? Rx * 0.62 : Rx * 1.25));
    const narrow = cssW < 720;
    const rx = Math.max(20, Rx - (narrow ? 13 : 22)), ry = Math.max(14, Ry - (narrow ? 12 : 20));
    const seats = [];
    for (let i = 0; i < seatCount; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / seatCount;
      const c = Math.cos(a), s = Math.sin(a);
      seats.push({
        a,
        x: (cx + c * Rx) * P, y: (cy + s * Ry) * P,
        plateX: (cx + c * rx * 0.74) * P, plateY: (cy + s * ry * 0.7) * P,
        ax: cx + c * Rx, ay: cy + s * Ry, apx: cx + c * rx * 0.74, apy: cy + s * ry * 0.7,
      });
    }
    return { P, W, H, cx, cy, rx, ry, Rx, Ry, wallH: Math.round(Math.min(H * 0.22, topRes + 6)), seats, css: { cx: cx * P, cy: cy * P, rx: rx * P, ry: ry * P } };
  }

  function ellipseRows(cx, cy, rx, ry, fn) {
    for (let y = -Math.floor(ry); y <= Math.floor(ry); y++) {
      const half = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
      fn(Math.round(cy + y), Math.round(cx - half), Math.round(cx + half), y);
    }
  }
  function fillEllipse(g, cx, cy, rx, ry, color) {
    g.fillStyle = color;
    ellipseRows(cx, cy, rx, ry, (y, x0, x1) => g.fillRect(x0, y, x1 - x0 + 1, 1));
  }

  function drawBase(L) {
    const { W, H, cx, cy, rx, ry, Rx, Ry, wallH } = L;
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d");

    // floorboards
    for (let row = 0; row * 5 < H; row++) {
      let x = -Math.floor(hash(row, 7) * 30);
      while (x < W) {
        const len = 18 + Math.floor(hash(row, x) * 26);
        const t = hash(x, row * 3);
        g.fillStyle = t < 0.33 ? C.woodA : t < 0.66 ? C.woodB : C.woodC;
        g.fillRect(x, row * 5, len, 5);
        g.fillStyle = C.seam;
        g.fillRect(x, row * 5, 1, 5);
        if (hash(x + 3, row) > 0.7) g.fillRect(x + Math.floor(len / 2), row * 5 + 2, 2, 1);
        x += len;
      }
      g.fillStyle = C.seam;
      g.fillRect(0, row * 5 + 4, W, 1);
    }

    // back wall with striped paper, rail, two pictures and two sconces
    for (let x = 0; x < W; x++) {
      g.fillStyle = Math.floor(x / 4) % 2 ? C.wallA : C.wallB;
      g.fillRect(x, 0, 1, wallH);
    }
    g.fillStyle = C.wallDot;
    for (let y = 3; y < wallH - 4; y += 6) for (let x = (y / 6) % 2 ? 2 : 6; x < W; x += 8) g.fillRect(x, y, 1, 1);
    g.fillStyle = C.rail; g.fillRect(0, wallH, W, 3);
    g.fillStyle = C.railHi; g.fillRect(0, wallH, W, 1);
    const pics = W > 160 ? [0.14, 0.86] : [];
    pics.forEach((fx, i) => {
      const pw = 22, ph = 15, px = Math.round(W * fx - pw / 2), py = Math.max(3, Math.round(wallH * 0.25));
      if (py + ph > wallH - 2) return;
      g.fillStyle = C.frame; g.fillRect(px - 2, py - 2, pw + 4, ph + 4);
      g.fillStyle = C.pic1; g.fillRect(px, py, pw, ph);
      g.fillStyle = i ? C.pic3 : C.flameA; g.fillRect(px + (i ? 15 : 4), py + 3, 3, 3);
      g.fillStyle = C.pic2;
      for (let x = 0; x < pw; x++) { const h = 4 + Math.round(3 * Math.sin((x + i * 5) / 4)); g.fillRect(px + x, py + ph - h, 1, h); }
    });
    L.sconces = W > 120 ? [0.33, 0.67].map((fx) => ({ x: Math.round(W * fx), y: Math.max(4, Math.round(wallH * 0.45)) })).filter((s) => s.y + 6 < wallH) : [];
    L.sconces.forEach((s) => {
      g.fillStyle = C.gold; g.fillRect(s.x - 2, s.y + 3, 5, 2); g.fillRect(s.x, s.y + 5, 1, 3);
      g.fillStyle = C.candle; g.fillRect(s.x - 1, s.y, 3, 3);
    });

    // rug
    fillEllipse(g, cx, cy + 2, Rx + 8, Ry + 7, C.rugGold);
    fillEllipse(g, cx, cy + 2, Rx + 6, Ry + 5, C.rugA);
    ellipseRows(cx, cy + 2, Rx + 3, Ry + 2.5, (y, x0, x1) => { g.fillStyle = C.rugGold; if ((y + x0) % 3 === 0) g.fillRect(x0, y, 1, 1); if ((y + x1) % 3 === 0) g.fillRect(x1, y, 1, 1); });
    fillEllipse(g, cx, cy + 2, Rx, Ry, C.rugB);

    // chairs behind each seat
    L.seats.forEach((s) => {
      const x = Math.round(s.ax), y = Math.round(s.ay);
      g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(x - 9, y - 5, 19, 15);
      g.fillStyle = C.chairDk; g.fillRect(x - 9, y - 8, 18, 15);
      g.fillStyle = C.chair; g.fillRect(x - 8, y - 7, 16, 13);
      g.fillStyle = C.chairHi; g.fillRect(x - 8, y - 7, 16, 2); g.fillRect(x - 6, y - 3, 2, 8); g.fillRect(x + 4, y - 3, 2, 8);
    });

    // table: shadow, wooden edge, cloth skirt, gingham top
    g.fillStyle = "rgba(0,0,0,.4)"; ellipseRows(cx + 2, cy + 6, rx + 3, ry + 2, (y, x0, x1) => g.fillRect(x0, y, x1 - x0 + 1, 1));
    fillEllipse(g, cx, cy + 4, rx + 1, ry + 1, C.tableEdge);
    fillEllipse(g, cx, cy + 3, rx, ry, C.skirt);
    ellipseRows(cx, cy, rx, ry, (y, x0, x1) => {
      for (let x = x0; x <= x1; x++) {
        const a = Math.floor((x - cx + 999) / 3) % 2, b = Math.floor((y - cy + 999) / 3) % 2;
        g.fillStyle = a && b ? C.clothDark : a || b ? C.clothMid : C.clothLight;
        g.fillRect(x, y, 1, 1);
      }
    });

    // a plate in front of every seat
    L.seats.forEach((s) => {
      const x = Math.round(s.apx), y = Math.round(s.apy);
      fillEllipse(g, x, y + 1, 7, 3.5, "rgba(0,0,0,.25)");
      fillEllipse(g, x, y, 7, 3.5, C.plateRim);
      fillEllipse(g, x, y, 5, 2.4, C.plate);
      g.fillStyle = C.plateRim; g.fillRect(x + 8, y - 2, 1, 5); g.fillRect(x - 9, y - 2, 1, 5);
    });

    // candlesticks either side of the centre
    L.candles = [-0.5, 0.5].map((f) => ({ x: Math.round(cx + rx * f), y: Math.round(cy - ry * 0.15) }));
    L.candles.forEach((c) => {
      g.fillStyle = "rgba(0,0,0,.3)"; g.fillRect(c.x - 2, c.y + 2, 6, 2);
      g.fillStyle = C.gold; g.fillRect(c.x - 2, c.y, 5, 2);
      g.fillStyle = C.candle; g.fillRect(c.x - 1, c.y - 7, 3, 7);
    });
    return cv;
  }

  let canvas, ctx, base, L, raf = 0, lastFrame = 0, heat = 0;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function frame(t) {
    raf = requestAnimationFrame(frame);
    if (t - lastFrame < 110) return; // the flicker is about 9 fps, on purpose
    lastFrame = t;
    ctx.drawImage(base, 0, 0);
    const flames = [...(L.candles || []), ...(L.sconces || [])];
    flames.forEach((f, i) => {
      const fl = reduced ? 1 : Math.floor(hash(Math.floor(t / 110), i) * 3);
      ctx.fillStyle = "rgba(255,190,90,.10)";
      ctx.beginPath(); ctx.arc(f.x + 0.5, f.y - 9, 9 + fl, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.flameB; ctx.fillRect(f.x - 1, f.y - 10 - fl, 3, 3 + fl);
      ctx.fillStyle = C.flameA; ctx.fillRect(f.x, f.y - 9 - fl, 1, 2 + fl);
    });
    if (heat > 0) {
      // the table glows hotter as the clock runs down
      const r = Math.min(L.rx, L.ry * 1.6) * (0.35 + heat * 0.3);
      const grd = ctx.createRadialGradient(L.cx, L.cy, 1, L.cx, L.cy, r);
      grd.addColorStop(0, `rgba(255,${Math.round(150 - heat * 110)},40,${0.15 + heat * 0.35})`);
      grd.addColorStop(1, "rgba(255,80,40,0)");
      ctx.fillStyle = grd; ctx.fillRect(0, 0, L.W, L.H);
    }
  }

  window.Room = {
    layout,
    mount(cv) { canvas = cv; ctx = cv.getContext("2d"); },
    draw(cssW, cssH, seatCount, opts) {
      L = layout(cssW, cssH, seatCount, opts);
      canvas.width = L.W; canvas.height = L.H;
      canvas.style.width = L.W * L.P + "px"; canvas.style.height = L.H * L.P + "px";
      ctx.imageSmoothingEnabled = false;
      base = drawBase(L);
      lastFrame = 0;
      if (!raf) raf = requestAnimationFrame(frame);
      return L;
    },
    setHeat(v) { heat = Math.max(0, Math.min(1, v)); },
  };
})();
