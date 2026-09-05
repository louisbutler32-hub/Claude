/* Rick's reactor: a swirling particle torus around an arc-reactor core.
   Reacts to state (idle / listening / thinking / working / speaking) and to
   an audio level (0..1) fed from the mic or the voice output. */
(function () {
  const TAU = Math.PI * 2;
  const canvas = document.getElementById("reactor");
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, dpr = 1, cx = 0, cy = 0, R = 0;
  let state = "idle";
  let level = 0, levelSmooth = 0;
  let t = 0;
  let rotation = 0;

  // ---- particles ----
  const N = 2600;

  // pre-rendered glow sprites (much faster than shadowBlur)
  function makeSprite(size, r, g, b) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const x = c.getContext("2d");
    const gr = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gr.addColorStop(0, `rgba(${r},${g},${b},1)`);
    gr.addColorStop(0.25, `rgba(${r},${g},${b},0.6)`);
    gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
    x.fillStyle = gr; x.fillRect(0, 0, size, size);
    return c;
  }
  const SPR_TEAL = makeSprite(32, 40, 220, 255);
  const SPR_HOT = makeSprite(32, 210, 250, 255);
  const P = [];
  for (let i = 0; i < N; i++) {
    const band = i % 3;
    P.push({
      a: Math.random() * TAU,          // base angle
      band,                            // 0,1,2 : three interleaved ribbons
      w: 0.35 + Math.random() * 0.9,   // angular speed factor
      off: Math.random() * TAU,        // noise phase
      k: 2 + Math.floor(Math.random() * 4), // noise frequency (lobes)
      size: 1.2 + Math.random() * 2.6,
      alpha: 0.35 + Math.random() * 0.65,
      z: Math.random(),                // depth 0..1 for tilt
    });
  }

  const targets = {
    idle:      { speed: 0.20, amp: 0.09, bright: 0.60, spread: 0.08, core: 0.50, jitter: 0.0 },
    listening: { speed: 0.35, amp: 0.16, bright: 0.85, spread: 0.18, core: 0.75, jitter: 0.2 },
    thinking:  { speed: 1.10, amp: 0.20, bright: 0.80, spread: 0.10, core: 0.80, jitter: 0.6 },
    working:   { speed: 1.50, amp: 0.26, bright: 0.90, spread: 0.12, core: 0.90, jitter: 0.8 },
    speaking:  { speed: 0.55, amp: 0.30, bright: 1.00, spread: 0.20, core: 1.00, jitter: 0.3 },
  };
  const cur = { ...targets.idle };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    W = Math.max(1, Math.floor(rect.width)); H = Math.max(1, Math.floor(rect.height));
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W / 2; cy = H / 2;
    R = Math.min(W, H) * 0.34;
  }
  window.addEventListener("resize", resize);
  resize();

  function lerp(a, b, k) { return a + (b - a) * k; }

  // cheap layered noise for the ribbons
  function ribbon(p, tt) {
    const s = cur.speed;
    return (
      Math.sin(p.a * p.k + tt * s * 1.3 + p.off) * 0.55 +
      Math.sin(p.a * (p.k + 3) - tt * s * 0.7 + p.off * 1.7) * 0.3 +
      Math.sin(p.a * 11 + tt * s * 2.1 + p.band) * 0.15
    );
  }

  function drawParticles(tt) {
    ctx.globalCompositeOperation = "lighter";
    const lv = levelSmooth;
    const amp = R * (cur.amp + lv * 0.45);
    const spread = R * cur.spread;
    const tilt = 0.86 + Math.sin(tt * 0.13) * 0.06;   // ellipse ratio (slight 3D tilt)
    const rot = rotation;
    const hot = Math.min(1, lv * 1.4 + (state === "speaking" ? 0.25 : 0));
    const scale = 1 + lv * 0.9;
    for (let i = 0; i < N; i++) {
      const p = P[i];
      const ang = p.a + rot * p.w + p.band * 0.4;
      const n = ribbon(p, tt);
      const bandOff = (p.band - 1) * spread * 0.6;
      const r = R + bandOff + n * amp + (p.z - 0.5) * spread;
      const x = cx + Math.cos(ang) * r;
      const y = cy + Math.sin(ang) * r * tilt + Math.sin(ang * 2 + tt * 0.4) * spread * 0.25;
      const depth = 0.5 + 0.5 * Math.sin(ang + 1.2); // fake lighting around the ring
      const a = p.alpha * cur.bright * (0.45 + depth * 0.55) * (0.75 + lv * 0.5);
      const sz = p.size * 4 * scale;
      ctx.globalAlpha = Math.min(1, a);
      ctx.drawImage(hot > 0.5 && (i & 3) === 0 ? SPR_HOT : SPR_TEAL, x - sz / 2, y - sz / 2, sz, sz);
    }
    ctx.globalAlpha = 1;
    // a fine bright core line inside the ribbons
    for (let i = 0; i < N; i += 2) {
      const p = P[i];
      const ang = p.a + rot * p.w + p.band * 0.4;
      const n = ribbon(p, tt);
      const r = R + (p.band - 1) * spread * 0.6 + n * amp + (p.z - 0.5) * spread;
      const x = cx + Math.cos(ang) * r;
      const y = cy + Math.sin(ang) * r * tilt + Math.sin(ang * 2 + tt * 0.4) * spread * 0.25;
      ctx.fillStyle = `rgba(${Math.round(120 + hot * 130)},${Math.round(240)},255,${(0.35 * cur.bright * p.alpha).toFixed(3)})`;
      ctx.fillRect(x, y, 1.2, 1.2);
    }
    ctx.globalCompositeOperation = "source-over";
  }

  function arc(r, a0, a1, width, color, dash) {
    ctx.beginPath();
    ctx.lineWidth = width; ctx.strokeStyle = color;
    ctx.setLineDash(dash || []);
    ctx.arc(cx, cy, r, a0, a1);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function ticks(r, count, len, width, color, every, everyLen) {
    ctx.lineWidth = width; ctx.strokeStyle = color;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * TAU;
      const l = every && i % every === 0 ? everyLen : len;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.lineTo(cx + Math.cos(a) * (r + l), cy + Math.sin(a) * (r + l));
      ctx.stroke();
    }
  }

  function drawCore(tt) {
    const lv = levelSmooth;
    const c = cur.core;
    const pulse = 1 + Math.sin(tt * 2.2) * 0.02 + lv * 0.08;
    const r0 = R * 0.30 * pulse;

    // outer glow
    const g = ctx.createRadialGradient(cx, cy, r0 * 0.2, cx, cy, r0 * 2.6);
    g.addColorStop(0, `rgba(25,230,255,${0.32 * c + lv * 0.3})`);
    g.addColorStop(0.35, `rgba(0,150,200,${0.12 * c})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, r0 * 2.6, 0, TAU); ctx.fill();

    // reactor rings (image 2 style)
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(tt * 0.15); ctx.translate(-cx, -cy);
    arc(r0 * 1.55, 0, TAU, 1, "rgba(25,230,255,0.35)");
    ctx.restore();

    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(-tt * 0.35); ctx.translate(-cx, -cy);
    arc(r0 * 1.42, 0.2, 1.4, 3, "rgba(25,230,255,0.9)");
    arc(r0 * 1.42, 2.3, 3.3, 3, "rgba(25,230,255,0.9)");
    arc(r0 * 1.42, 4.3, 5.6, 3, "rgba(25,230,255,0.6)");
    ticks(r0 * 1.22, 60, 4, 1, "rgba(25,230,255,0.5)", 5, 8);
    ctx.restore();

    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(tt * 0.6 * (1 + cur.jitter)); ctx.translate(-cx, -cy);
    arc(r0 * 1.12, 0, TAU, 1, "rgba(25,230,255,0.55)", [6, 10]);
    ctx.restore();

    // segmented ring (the "arc reactor" slots)
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(-tt * 0.08); ctx.translate(-cx, -cy);
    for (let i = 0; i < 10; i++) {
      const a0 = (i / 10) * TAU + 0.06, a1 = ((i + 1) / 10) * TAU - 0.06;
      arc(r0 * 0.86, a0, a1, r0 * 0.14, `rgba(200,250,255,${0.55 * c + lv * 0.3})`);
    }
    ctx.restore();

    // inner disc
    const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, r0 * 0.7);
    g2.addColorStop(0, `rgba(255,255,255,${0.85 * c + lv * 0.15})`);
    g2.addColorStop(0.4, `rgba(180,245,255,${0.7 * c})`);
    g2.addColorStop(1, `rgba(25,230,255,${0.15})`);
    ctx.fillStyle = g2;
    ctx.beginPath(); ctx.arc(cx, cy, r0 * 0.7, 0, TAU); ctx.fill();
    arc(r0 * 0.7, 0, TAU, 1.5, "rgba(255,255,255,0.8)");
    arc(r0 * 0.5, 0, TAU, 1, "rgba(25,230,255,0.9)");

    // triangle (stark-style) rotating slowly
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(tt * 0.1);
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU - Math.PI / 2;
      const x = Math.cos(a) * r0 * 0.42, y = Math.sin(a) * r0 * 0.42;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();

    // outer HUD ring beyond the torus
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(tt * 0.04); ctx.translate(-cx, -cy);
    arc(R * 1.32, 0, TAU, 1, "rgba(25,230,255,0.12)");
    ticks(R * 1.32, 120, 5, 1, "rgba(25,230,255,0.25)", 10, 12);
    arc(R * 1.38, 0.0, 0.9, 2, "rgba(25,230,255,0.5)");
    arc(R * 1.38, 3.1, 4.2, 2, "rgba(25,230,255,0.5)");
    ctx.restore();

    // state sweep when thinking/working: a radar line
    if (state === "thinking" || state === "working") {
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(tt * 3.0);
      const sg = ctx.createLinearGradient(0, 0, R * 1.3, 0);
      sg.addColorStop(0, "rgba(255,209,102,0.0)");
      sg.addColorStop(1, "rgba(255,209,102,0.55)");
      ctx.strokeStyle = sg; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(R * 1.3, 0); ctx.stroke();
      ctx.restore();
    }
  }

  let lastTs = performance.now();
  function frame(ts) {
    const dt = Math.min(0.05, (ts - lastTs) / 1000); lastTs = ts;
    t += dt;
    const tg = targets[state] || targets.idle;
    for (const k in tg) cur[k] = lerp(cur[k], tg[k], 0.04);
    levelSmooth = lerp(levelSmooth, level, level > levelSmooth ? 0.35 : 0.08);
    rotation += dt * (0.25 + cur.speed * 0.9);

    ctx.clearRect(0, 0, W, H);
    drawParticles(t);
    drawCore(t);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  window.Reactor = {
    setState(s) { state = targets[s] ? s : "idle"; },
    setLevel(v) { level = Math.max(0, Math.min(1, v || 0)); },
    getState() { return state; },
  };
})();
