import React from "react";
import { random } from "remotion";
import { INK } from "./cast";

/**
 * The trial chamber, drawn the way the reference inks it: grey tuff-brick walls in a
 * one-point perspective box, a block grid in thin ink, pale pebbles and dark blotches
 * on the stone, pixel-stepped moss, scratch ticks — and the oak walkways and flat blue
 * water of the chamber's channels. Plus the overworld outside for the last two shots.
 *
 * Everything in the hall is laid out in blocks and projected through `Cam`: the floor
 * is y = 0, up is negative, the hall runs along +z from the camera.
 */

export const W = 1080, H = 1920;

export const STONE = "#8e8e95", STONE_D = "#6f6f78", STONE_L = "#c9c9cf", GROUT = "#3a383c";
export const MOSS = "#6f9a3e", MOSS_D = "#55792d";
export const OAK = "#a97b3f", OAK_L = "#c69552", OAK_D = "#7a5728";
export const WATER = "#5b7ee0", WATER_L = "#8aa6f0";

export type Cam = { F: number; cx: number; cy: number; eh: number };
export const proj = (c: Cam, x: number, y: number, z: number): [number, number] => [c.cx + (c.F * x) / z, c.cy + (c.F * (y + c.eh)) / z];
const pts = (c: Cam, p: [number, number, number][]) => p.map((q) => proj(c, q[0], q[1], q[2]).join(",")).join(" ");

export type Hall = { HW: number; CH: number; z0: number; Z1: number; B?: number };

/* ------------------------------------ stone furniture ------------------------------------ */

/** a pale pebble: a rounded blob with a thick outline, like the ones the reference scatters on every wall */
const Pebble: React.FC<{ x: number; y: number; w: number; h: number; sx?: number; sy?: number; lw?: number }> = ({ x, y, w, h, sx = 1, sy = 1, lw = 6 }) => (
  <g transform={`translate(${x} ${y}) scale(${sx} ${sy})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={Math.min(w, h) * 0.38} fill={STONE_L} stroke={INK} strokeWidth={lw / Math.max(sx, sy)} strokeLinejoin="round" />
  </g>
);

/** a soft dark blotch: the reference's shading on the stone has no outline */
const Blotch: React.FC<{ x: number; y: number; w: number; h: number; sx?: number; sy?: number; o?: number }> = ({ x, y, w, h, sx = 1, sy = 1, o = 0.5 }) => (
  <g transform={`translate(${x} ${y}) scale(${sx} ${sy})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={Math.min(w, h) * 0.45} fill={STONE_D} opacity={o} />
  </g>
);

/** pixel-stepped moss, outlined, with a couple of ticks on it */
export const Moss: React.FC<{ x: number; y: number; s: number; sx?: number; sy?: number; seed?: string }> = ({ x, y, s, sx = 1, sy = 1, seed = "m" }) => {
  const k = Math.floor(random(seed) * 3);
  const shapes = [
    `M0,0 h${s * 2} v${s} h${-s} v${s} h${-s * 1.4} v${-s} h${-s * 0.6} Z`,
    `M0,0 h${s} v${-s} h${s} v${s * 2} h${-s * 0.6} v${s} h${-s * 1.4} Z`,
    `M0,0 h${s * 1.5} v${-s * 0.7} h${s} v${s * 1.7} h${-s * 2.5} Z`,
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${sx} ${sy})`}>
      <path d={shapes[k]} fill={MOSS} stroke={INK} strokeWidth={5 / Math.max(sx, sy)} strokeLinejoin="round" />
      <path d={`M${s * 0.5},${s * 0.5} l${s * 0.12},${-s * 0.22} M${s * 1.2},${s * 0.6} l${s * 0.1},${-s * 0.2}`} stroke={MOSS_D} strokeWidth={4 / Math.max(sx, sy)} fill="none" strokeLinecap="round" />
    </g>
  );
};

const Tick: React.FC<{ x: number; y: number; k?: number }> = ({ x, y, k = 1 }) => (
  <path d={`M${x},${y} l${8 * k},${-12 * k} M${x + 14 * k},${y + 2 * k} l${4 * k},${-10 * k}`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} />
);

/* ------------------------------------ the hall ------------------------------------ */

/**
 * The one-point hall: left and right walls, back wall and floor, each with its block
 * grid, plus pebbles, blotches, moss and ticks placed in block coordinates and projected
 * (so they shrink with depth). `dark` dims the whole thing for the deep shots.
 */
export const HallBox: React.FC<{ cam: Cam; hall: Hall; seed?: string; dark?: number; moss?: number; detail?: number; children?: React.ReactNode }> = ({ cam, hall, seed = "h", dark = 0, moss = 1, detail = 1, children }) => {
  const { HW, CH, z0, Z1 } = hall;
  const B = hall.B ?? 1;
  const lines: React.ReactNode[] = [];
  const gridStroke = { stroke: GROUT, strokeWidth: 4, fill: "none", opacity: 0.85 };
  // floor and ceiling grid
  for (let x = -HW; x <= HW + 1e-6; x += B) lines.push(<polyline key={`fx${x}`} points={pts(cam, [[x, 0, z0], [x, 0, Z1]])} {...gridStroke} />);
  for (let z = Math.ceil(z0 / B) * B; z <= Z1 + 1e-6; z += B) lines.push(<polyline key={`fz${z}`} points={pts(cam, [[-HW, 0, z], [HW, 0, z]])} {...gridStroke} />);
  // side walls
  for (let z = Math.ceil(z0 / B) * B; z <= Z1 + 1e-6; z += B) {
    lines.push(<polyline key={`lz${z}`} points={pts(cam, [[-HW, -CH, z], [-HW, 0, z]])} {...gridStroke} />);
    lines.push(<polyline key={`rz${z}`} points={pts(cam, [[HW, -CH, z], [HW, 0, z]])} {...gridStroke} />);
  }
  for (let y = 0; y >= -CH - 1e-6; y -= B) {
    lines.push(<polyline key={`ly${y}`} points={pts(cam, [[-HW, y, z0], [-HW, y, Z1]])} {...gridStroke} />);
    lines.push(<polyline key={`ry${y}`} points={pts(cam, [[HW, y, z0], [HW, y, Z1]])} {...gridStroke} />);
  }
  // back wall
  for (let x = -HW; x <= HW + 1e-6; x += B) lines.push(<polyline key={`bx${x}`} points={pts(cam, [[x, -CH, Z1], [x, 0, Z1]])} {...gridStroke} />);
  for (let y = 0; y >= -CH - 1e-6; y -= B) lines.push(<polyline key={`by${y}`} points={pts(cam, [[-HW, y, Z1], [HW, y, Z1]])} {...gridStroke} />);

  // furniture, in block coordinates on each surface
  const deco: React.ReactNode[] = [];
  const n = Math.round(44 * detail);
  for (let i = 0; i < n; i++) {
    const side = Math.floor(random(`${seed}s${i}`) * 4); // 0 left, 1 right, 2 back, 3 floor
    const u = random(`${seed}u${i}`), v = random(`${seed}v${i}`), kind = random(`${seed}k${i}`);
    const w = 0.16 + random(`${seed}w${i}`) * 0.2, h = w * (0.6 + random(`${seed}h${i}`) * 0.5);
    let p: [number, number], sx = 1, sy = 1, z = 1;
    if (side === 0 || side === 1) {
      z = z0 + 0.3 + u * (Z1 - z0 - 0.3); const y = -0.2 - v * (CH - 0.4);
      p = proj(cam, side === 0 ? -HW : HW, y, z); const k = cam.F / z; sx = k * 0.55; sy = k;
    } else if (side === 2) {
      z = Z1; const x = -HW + 0.2 + u * (2 * HW - 0.4), y = -0.2 - v * (CH - 0.4);
      p = proj(cam, x, y, z); const k = cam.F / z; sx = k; sy = k;
    } else {
      z = z0 + 0.3 + u * (Z1 - z0 - 0.3); const x = -HW + 0.2 + v * (2 * HW - 0.4);
      p = proj(cam, x, 0, z); const k = cam.F / z; sx = k; sy = k * 0.45;
    }
    if (p[0] < -200 || p[0] > W + 200 || p[1] < -200 || p[1] > H + 200) continue;
    if (kind < 0.4) deco.push(<Pebble key={`p${i}`} x={p[0]} y={p[1]} w={w} h={h} sx={sx} sy={sy} lw={Math.min(7, 5 * (cam.F / z) / 300)} />);
    else if (kind < 0.72) deco.push(<Blotch key={`b${i}`} x={p[0]} y={p[1]} w={w * 1.8} h={h * 1.6} sx={sx} sy={sy} />);
    else if (kind < 0.72 + 0.2 * moss) deco.push(<Moss key={`m${i}`} x={p[0]} y={p[1]} s={w * 0.5} sx={sx} sy={sy} seed={`${seed}ms${i}`} />);
    else deco.push(<Tick key={`t${i}`} x={p[0]} y={p[1]} k={Math.min(1.4, (cam.F / z) / 400)} />);
  }
  const vp = proj(cam, 0, -cam.eh, 1e9);
  const gid = `hallVig${seed}`;
  return (
    <g>
      <defs>
        <radialGradient id={gid} cx={vp[0] / W} cy={vp[1] / H} r={0.75}>
          <stop offset="0" stopColor="#1c1b22" stopOpacity={0.55 + dark * 0.35} />
          <stop offset="0.5" stopColor="#1c1b22" stopOpacity={0.12 + dark * 0.3} />
          <stop offset="1" stopColor="#1c1b22" stopOpacity={dark * 0.25} />
        </radialGradient>
      </defs>
      <rect x={-50} y={-50} width={W + 100} height={H + 100} fill={STONE} />
      {/* floor a touch darker, back wall a touch darker */}
      <polygon points={pts(cam, [[-HW, 0, z0], [HW, 0, z0], [HW, 0, Z1], [-HW, 0, Z1]])} fill="#85858c" />
      <polygon points={pts(cam, [[-HW, -CH, Z1], [HW, -CH, Z1], [HW, 0, Z1], [-HW, 0, Z1]])} fill="#7f7f87" />
      {lines}
      {deco}
      {/* the corner lines, heavy ink */}
      <polyline points={pts(cam, [[-HW, 0, z0], [-HW, 0, Z1], [HW, 0, Z1], [HW, 0, z0]])} fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <polyline points={pts(cam, [[-HW, -CH, z0], [-HW, -CH, Z1], [HW, -CH, Z1], [HW, -CH, z0]])} fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <polyline points={pts(cam, [[-HW, -CH, Z1], [-HW, 0, Z1]])} fill="none" stroke={INK} strokeWidth={7} />
      <polyline points={pts(cam, [[HW, -CH, Z1], [HW, 0, Z1]])} fill="none" stroke={INK} strokeWidth={7} />
      {children}
      <rect x={-50} y={-50} width={W + 100} height={H + 100} fill={`url(#${gid})`} />
    </g>
  );
};

/* ------------------------------------ oak and water ------------------------------------ */

/** a box of oak planks along the hall: top, inner side and underside faces, with plank lines */
export const OakBox: React.FC<{ cam: Cam; x0: number; x1: number; y0: number; y1: number; z0: number; z1: number; planks?: number }> = ({ cam, x0, x1, y0, y1, z0, z1, planks = 8 }) => {
  const inner = x0 < 0 ? x1 : x0; // the face that looks into the hall
  const lines: React.ReactNode[] = [];
  for (let i = 1; i < planks; i++) {
    const z = z0 + ((z1 - z0) * i) / planks;
    lines.push(<polyline key={`t${i}`} points={pts(cam, [[x0, y0, z], [x1, y0, z]])} stroke={OAK_D} strokeWidth={4} fill="none" />);
    lines.push(<polyline key={`s${i}`} points={pts(cam, [[inner, y0, z], [inner, y1, z]])} stroke={OAK_D} strokeWidth={4} fill="none" />);
    lines.push(<polyline key={`u${i}`} points={pts(cam, [[x0, y1, z], [x1, y1, z]])} stroke={OAK_D} strokeWidth={4} fill="none" />);
  }
  const ink = { stroke: INK, strokeWidth: 7, strokeLinejoin: "round" as const };
  return (
    <g>
      <polygon points={pts(cam, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]])} fill={OAK_D} {...ink} />
      <polygon points={pts(cam, [[inner, y0, z0], [inner, y1, z0], [inner, y1, z1], [inner, y0, z1]])} fill={OAK} {...ink} />
      <polygon points={pts(cam, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]])} fill={OAK_L} {...ink} />
      {lines}
    </g>
  );
};

/** a flat oak band in screen space (the side-on shots): planks with a thick outline */
export const OakBand: React.FC<{ x: number; y: number; w: number; h: number; planks?: number; light?: boolean }> = ({ x, y, w, h, planks = 6, light }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={light ? OAK_L : OAK} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    {Array.from({ length: planks - 1 }, (_, i) => <path key={i} d={`M${x + ((i + 1) * w) / planks},${y} V${y + h}`} stroke={OAK_D} strokeWidth={4} />)}
    <path d={`M${x},${y + h * 0.3} H${x + w}`} stroke={OAK_D} strokeWidth={3} opacity={0.6} />
  </g>
);

/** water: flat blue with a few paler streaks */
export const WaterRect: React.FC<{ x: number; y: number; w: number; h: number; f?: number; streaks?: number; vertical?: boolean }> = ({ x, y, w, h, f = 0, streaks = 6, vertical }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={WATER} />
    {Array.from({ length: streaks }, (_, i) => {
      const u = random(`ws${i}`), v = (random(`wv${i}`) + f * 0.012) % 1;
      const len = 60 + random(`wl${i}`) * 120;
      return vertical
        ? <rect key={i} x={x + u * (w - 20)} y={y + v * h} width={10} height={len} rx={5} fill={WATER_L} opacity={0.55} />
        : <rect key={i} x={x + v * w} y={y + u * (h - 12)} width={len} height={10} rx={5} fill={WATER_L} opacity={0.55} />;
    })}
  </g>
);

/** a splash: blue droplets with a thick outline, thrown out from (x, y) and falling back */
export const Splash: React.FC<{ x: number; y: number; t: number; n?: number; seed?: string; k?: number }> = ({ x, y, t, n = 10, seed = "sp", k = 1 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const a = Math.PI + random(`${seed}a${i}`) * Math.PI, v = (14 + random(`${seed}v${i}`) * 20) * k, s = (10 + random(`${seed}s${i}`) * 16) * k;
      const px = x + Math.cos(a) * v * t, py = y + Math.sin(a) * v * t + t * t * 1.4;
      if (t < 0 || t > 22) return null;
      return <rect key={i} x={px - s / 2} y={py - s / 2} width={s} height={s * 1.3} rx={s * 0.4} fill={WATER} stroke={INK} strokeWidth={5} />;
    })}
  </g>
);

/* ------------------------------------ the chamber, flat ------------------------------------ */

/** a flat tuff wall in screen space: block grid, pebbles, blotches, moss, scrolling by `scroll` */
export const FlatWall: React.FC<{ x: number; y: number; w: number; h: number; block?: number; scroll?: number; seed?: string; shade?: number; moss?: number }> = ({ x, y, w, h, block = 300, scroll = 0, seed = "fw", shade = 0, moss = 1 }) => {
  const off = ((scroll % block) + block) % block;
  const items: React.ReactNode[] = [];
  const nx = Math.ceil(w / block) + 1, ny = Math.ceil(h / block) + 2;
  for (let i = 0; i < nx * ny * 1.4; i++) {
    const cx = x + random(`${seed}x${i}`) * w, cy0 = random(`${seed}y${i}`) * (h + block * 2);
    const cy = y - block + ((cy0 + scroll) % (h + block * 2) + (h + block * 2)) % (h + block * 2);
    const k = random(`${seed}k${i}`), s = 28 + random(`${seed}s${i}`) * 50;
    if (k < 0.4) items.push(<Pebble key={i} x={cx} y={cy} w={s} h={s * 0.75} />);
    else if (k < 0.78) items.push(<Blotch key={i} x={cx} y={cy} w={s * 2.2} h={s * 1.6} />);
    else if (k < 0.78 + 0.14 * moss) items.push(<Moss key={i} x={cx} y={cy} s={s * 0.45} seed={`${seed}m${i}`} />);
    else items.push(<Tick key={i} x={cx} y={cy} />);
  }
  return (
    <g>
      <clipPath id={`fwc${seed}`}><rect x={x} y={y} width={w} height={h} /></clipPath>
      <g clipPath={`url(#fwc${seed})`}>
        <rect x={x} y={y} width={w} height={h} fill={STONE} />
        {Array.from({ length: nx + 1 }, (_, i) => <path key={`v${i}`} d={`M${x + i * block},${y} V${y + h}`} stroke={GROUT} strokeWidth={4} opacity={0.85} />)}
        {Array.from({ length: ny + 1 }, (_, i) => <path key={`h${i}`} d={`M${x},${y - block + i * block + off} H${x + w}`} stroke={GROUT} strokeWidth={4} opacity={0.85} />)}
        {items}
        {shade > 0 && <rect x={x} y={y} width={w} height={h} fill="#1c1b22" opacity={shade} />}
      </g>
    </g>
  );
};

/** big tuff bricks, for the climb-out wall */
export const Bricks: React.FC<{ x: number; y: number; w: number; h: number; bw?: number; bh?: number; seed?: string }> = ({ x, y, w, h, bw = 520, bh = 300, seed = "br" }) => {
  const rows = Math.ceil(h / bh) + 1, cols = Math.ceil(w / bw) + 2;
  const out: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const bx = x + c * bw - (r % 2) * bw * 0.5 - bw * 0.5, by = y + r * bh;
    out.push(<rect key={`${r}${c}`} x={bx} y={by} width={bw} height={bh} fill={r % 2 ? "#8a8a91" : STONE} stroke={INK} strokeWidth={9} strokeLinejoin="round" />);
    const k = random(`${seed}${r}${c}`);
    if (k < 0.5) out.push(<Pebble key={`p${r}${c}`} x={bx + bw * (0.2 + k)} y={by + bh * 0.5} w={60 + k * 60} h={44} />);
    else out.push(<Blotch key={`b${r}${c}`} x={bx + bw * 0.6} y={by + bh * 0.4} w={160} h={100} />);
  }
  return <g><clipPath id={`brc${seed}`}><rect x={x} y={y} width={w} height={h} /></clipPath><g clipPath={`url(#brc${seed})`}>{out}</g></g>;
};

/* ------------------------------------ outside ------------------------------------ */

/** a pixel cloud: stepped white blocks, outlined */
export const Cloud: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M0,0 h40 v-30 h50 v-30 h60 v30 h50 v30 h30 v30 h-230 Z" fill="#fff" stroke={INK} strokeWidth={7 / s} strokeLinejoin="round" />
);

/** a blocky oak: stepped canopy, two greens, a trunk */
export const Oak: React.FC<{ x: number; y: number; s: number; seed?: string }> = ({ x, y, s, seed = "oak" }) => {
  const k = random(seed);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={8 / s} strokeLinejoin="round">
      <rect x={-30} y={-80} width={60} height={110} fill="#6b4a2a" />
      <path d={k < 0.5 ? "M-150,-60 h300 v-120 h-60 v-90 h-180 v90 h-60 Z" : "M-170,-60 h340 v-90 h-70 v-120 h-200 v120 h-70 Z"} fill="#4f9a3a" />
      <path d="M-100,-150 h60 v-40 h80 v40 h50 v40 h-190 Z" fill="#62b24a" strokeWidth={0} />
      <path d="M-60,-100 l10,-14 M20,-90 l8,-12 M80,-120 l9,-13" stroke="#2f6a26" strokeWidth={5 / s} fill="none" strokeLinecap="round" />
    </g>
  );
};

export const Grass: React.FC<{ y: number; seed?: string }> = ({ y, seed = "gr" }) => (
  <g>
    <rect x={-50} y={y} width={W + 100} height={H - y + 50} fill="#6fbf4a" />
    <rect x={-50} y={y} width={W + 100} height={30} fill="#7fcb58" />
    <path d={`M-50,${y} H${W + 50}`} stroke={INK} strokeWidth={8} />
    {Array.from({ length: 26 }, (_, i) => {
      const gx = random(`${seed}x${i}`) * W, gy = y + 40 + random(`${seed}y${i}`) * (H - y - 60), k = 0.6 + random(`${seed}k${i}`);
      return <path key={i} d={`M${gx},${gy} l${-6 * k},${-12 * k} M${gx + 10 * k},${gy} l0,${-14 * k} M${gx + 20 * k},${gy} l${6 * k},${-12 * k}`} stroke="#3f8a32" strokeWidth={4} fill="none" strokeLinecap="round" />;
    })}
  </g>
);

export const Sky: React.FC<{ horizon: number; f?: number }> = ({ horizon, f = 0 }) => (
  <g>
    <defs><linearGradient id="spSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5fb0ee" /><stop offset="1" stopColor="#bfe3fb" /></linearGradient></defs>
    <rect x={-50} y={-50} width={W + 100} height={horizon + 60} fill="url(#spSky)" />
    <Cloud x={((120 + f * 0.4) % 1400) - 200} y={190} s={1.1} />
    <Cloud x={((760 + f * 0.3) % 1400) - 200} y={110} s={0.8} />
    <Cloud x={((420 + f * 0.25) % 1400) - 200} y={330} s={0.6} />
  </g>
);

/** sun rays: pale diagonal bands, screen-blended */
export const Rays: React.FC<{ o?: number }> = ({ o = 0.35 }) => (
  <g opacity={o} style={{ mixBlendMode: "screen" }}>
    {[0, 1, 2, 3].map((i) => <polygon key={i} points={`${300 + i * 200},-100 ${380 + i * 200},-100 ${-200 + i * 200},${H + 100} ${-300 + i * 200},${H + 100}`} fill="#fff8c8" />)}
  </g>
);

/** the stone tower the chamber hides under: a tall tuff column with a dark doorway at the foot */
export const Tower: React.FC<{ x: number; w: number; top: number; base: number }> = ({ x, w, top, base }) => (
  <g>
    <FlatWall x={x} y={top} w={w} h={base - top} block={200} seed="tw" moss={1.4} />
    <rect x={x} y={top} width={w} height={base - top} fill="none" stroke={INK} strokeWidth={9} />
    <rect x={x - 60} y={base - 260} width={w + 220} height={260} fill="#7a7a82" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    <rect x={x - 60} y={base - 260} width={w + 220} height={50} fill="#9a9aa2" stroke={INK} strokeWidth={7} />
    <rect x={x + 60} y={base - 200} width={140} height={200} fill="#2a2930" stroke={INK} strokeWidth={8} />
    <Moss x={x + 40} y={top + 80} s={40} seed="twm1" />
    <Moss x={x + w - 120} y={base - 400} s={34} seed="twm2" />
  </g>
);

/** pixel bones, for the ending */
export const Bone: React.FC<{ x: number; y: number; r: number; s?: number }> = ({ x, y, r, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} stroke={INK} strokeWidth={6} strokeLinejoin="round">
    <rect x={-40} y={-9} width={80} height={18} rx={6} fill="#e8e8e8" />
    <rect x={-52} y={-18} width={22} height={36} rx={8} fill="#e8e8e8" />
    <rect x={30} y={-18} width={22} height={36} rx={8} fill="#e8e8e8" />
  </g>
);

export const Arrow: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`} stroke={INK} strokeWidth={5} strokeLinejoin="round">
    <rect x={-60} y={-5} width={110} height={10} fill="#8a6a3a" />
    <polygon points="50,-14 80,0 50,14" fill="#c9c9cf" />
    <polygon points="-60,-16 -40,0 -60,16 -72,0" fill="#e8e8e8" />
  </g>
);
