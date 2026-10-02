import React from "react";
import { H, INK, W } from "../common";
import { Part, smooth, tube } from "../bowling/characters";
import { Cobweb, mod, rnd } from "./cast";

/**
 * Sets for "Zoro Gets Lost": the inn hallway (side-on, so a walk reads as a
 * walk) and the six places he ends up on the way to the toilet. Flat cel
 * fills, one hard shadow tone, thick near-black outlines. The montage worlds
 * take `sc`, how far the ground has scrolled past a man who is walking left.
 */

type P = [number, number];

export const FLOOR_Y = 1500;
export const DOOR = { x0: 805, x1: 995, top: 700, bot: 1380 };
export const GROUND_Y = 1700;

/* ----------------------------------- the hallway ----------------------------------- */

const Lantern: React.FC<{ x: number; y: number; t: number; dim?: boolean; seed?: number }> = ({ x, y, t, dim, seed = 1 }) => {
  const sw = Math.sin(t * 0.22 + seed) * (dim ? 5 : 2.2);
  return (
    <g transform={`translate(${x},${y}) rotate(${sw})`}>
      {!dim && <circle cx={0} cy={110} r={150} fill="#ffcf7a" opacity={0.22} />}
      <path d="M0,0 L0,70" stroke={INK} strokeWidth={5} />
      <rect x={-22} y={64} width={44} height={16} rx={4} fill="#2a2024" stroke={INK} strokeWidth={4} />
      <path d="M-22,80 Q-70,130 -22,190 L22,190 Q70,130 22,80Z" fill={dim ? "#a8664a" : "#ee5a32"} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M-14,82 Q-44,130 -14,188 M14,82 Q44,130 14,188 M0,82 L0,188" stroke={dim ? "#7a4632" : "#b8381c"} strokeWidth={3.4} fill="none" />
      <path d="M-30,100 Q-48,134 -28,168" stroke={dim ? "#c98a6e" : "#ff9a66"} strokeWidth={6} fill="none" strokeLinecap="round" />
      <rect x={-22} y={186} width={44} height={14} rx={4} fill="#2a2024" stroke={INK} strokeWidth={4} />
      <path d="M-10,200 l0,22 M0,200 l0,28 M10,200 l0,22" stroke="#e8b84a" strokeWidth={4} strokeLinecap="round" />
    </g>
  );
};

const Toilet: React.FC = () => (
  <g>
    <rect x={778} y={538} width={244} height={126} rx={16} fill="#2563c9" stroke={INK} strokeWidth={6} />
    <rect x={788} y={548} width={224} height={106} rx={10} fill="none" stroke="#fff" strokeWidth={3} />
    {/* pictogram: a figure on the loo */}
    <circle cx={850} cy={578} r={13} fill="#fff" stroke={INK} strokeWidth={3} />
    <path d="M836,598 L864,598 L866,632 L856,632 L856,648 L846,648 L846,632 L834,632Z" fill="#fff" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <path d="M866,614 h26 v34 h-26" fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
    {/* arrow, pointing down at the door */}
    <path d="M944,566 L944,616 L926,616 L958,644 L990,616 L972,616 L972,566Z" fill="#ffd23f" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

const Closet: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={DOOR.x0} y={DOOR.top} width={DOOR.x1 - DOOR.x0} height={DOOR.bot - DOOR.top} fill="#2b2733" />
    <rect x={DOOR.x0} y={DOOR.top} width={DOOR.x1 - DOOR.x0} height={90} fill="#1f1b27" />
    {/* shelf with a lone sponge */}
    <rect x={DOOR.x0} y={880} width={DOOR.x1 - DOOR.x0} height={14} fill="#6a4a30" stroke={INK} strokeWidth={4} />
    <rect x={DOOR.x0 + 100} y={846} width={50} height={34} rx={6} fill="#e8d44a" stroke={INK} strokeWidth={4} />
    {/* bulb swinging on its cord */}
    <g transform={`translate(900,${DOOR.top}) rotate(${Math.sin(t * 0.25) * 8})`}>
      <path d="M0,0 L0,70" stroke={INK} strokeWidth={4} />
      <circle cx={0} cy={84} r={16} fill="#fff6b0" stroke={INK} strokeWidth={4} />
      <circle cx={0} cy={84} r={44} fill="#fff6b0" opacity={0.25} />
    </g>
    {/* the mop: one mop */}
    <path d="M868,760 L850,1280" stroke={INK} strokeWidth={22} strokeLinecap="round" />
    <path d="M868,760 L850,1280" stroke="#b98a52" strokeWidth={12} strokeLinecap="round" />
    <path d="M820,1260 Q850,1244 884,1260 L896,1370 Q850,1384 806,1370Z" fill="#d7d8da" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    {[828, 842, 856, 870, 884].map((x, i) => <path key={i} d={`M${x},1270 L${x - 4 + i % 2 * 4},1366`} stroke="#9a9ca2" strokeWidth={3.4} />)}
    <ellipse cx={958} cy={1356} rx={34} ry={14} fill="#3b6fd0" stroke={INK} strokeWidth={4} />
  </g>
);

export const Hall: React.FC<{ aged?: boolean; open?: number; t?: number; dark?: number }> = ({ aged = false, open = 0, t = 0, dark = 0 }) => {
  const th = (open * 78 * Math.PI) / 180;
  const lx = DOOR.x1 - (DOOR.x1 - DOOR.x0) * Math.cos(th);
  const grow = Math.sin(th) * 46;
  return (
    <g>
      {/* ceiling + beams */}
      <rect width={W} height={450} fill="#3a2a24" />
      <rect y={372} width={W} height={78} fill="#2a1d19" stroke={INK} strokeWidth={5} />
      {[0, 270, 540, 810].map((x) => <rect key={x} x={x + 30} y={0} width={40} height={372} fill="#4a362c" stroke={INK} strokeWidth={4} />)}
      {/* shoji wall */}
      <rect y={450} width={W} height={930} fill={aged ? "#d9c796" : "#f3e1b3"} />
      {[0, 1, 2].map((k) => (
        <g key={k}>
          <rect x={k * 360 + 30} y={470} width={300} height={650} fill={aged ? "#ddcb9c" : "#f6e8c2"} stroke={INK} strokeWidth={5} />
          {[1, 2, 3, 4].map((i) => <path key={i} d={`M${k * 360 + 30 + i * 60},470 L${k * 360 + 30 + i * 60},1120`} stroke="#8a5f3a" strokeWidth={4} />)}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => <path key={i} d={`M${k * 360 + 30},${470 + i * 59} L${k * 360 + 330},${470 + i * 59}`} stroke="#8a5f3a" strokeWidth={3} />)}
          <rect x={k * 360 + 30} y={470} width={300} height={70} fill="#000" opacity={0.06} />
        </g>
      ))}
      {[0, 360, 720, 1080].map((x) => <rect key={x} x={x - 20} y={450} width={40} height={930} fill="#5b3a28" stroke={INK} strokeWidth={5} />)}
      {/* wainscot */}
      <rect y={1120} width={W} height={260} fill="#8c5b3a" stroke={INK} strokeWidth={5} />
      {Array.from({ length: 18 }, (_, i) => <path key={i} d={`M${i * 64 + 20},1120 L${i * 64 + 20},1380`} stroke="#6b4228" strokeWidth={4} />)}
      <rect y={1120} width={W} height={18} fill="#5b3a28" />
      {/* floor */}
      <rect y={1380} width={W} height={H - 1380} fill="#b9814f" />
      <rect y={1380} width={W} height={26} fill="#4a2f1e" stroke={INK} strokeWidth={5} />
      {[1470, 1570, 1690, 1830].map((y, i) => <path key={y} d={`M0,${y} L${W},${y}`} stroke="#8a5c36" strokeWidth={5 + i} />)}
      {[[1406, 1470, [200, 620, 940]], [1470, 1570, [80, 400, 760]], [1570, 1690, [260, 560, 900]], [1690, 1830, [120, 480, 820]], [1830, 1920, [300, 700]]].map(([a, b, xs], i) => (
        <g key={i}>{(xs as number[]).map((x) => <path key={x} d={`M${x},${a} L${x},${b}`} stroke="#8a5c36" strokeWidth={4} />)}</g>
      ))}
      <path d="M0,1420 Q300,1412 540,1424 T1080,1418" stroke="#d09a64" strokeWidth={8} fill="none" opacity={0.6} />
      {/* lanterns */}
      <Lantern x={130} y={450} t={t} dim={aged} seed={1} />
      <Lantern x={410} y={450} t={t} dim={aged} seed={2.4} />
      {!aged && <Lantern x={650} y={450} t={t} seed={4} />}
      {aged && <path d="M650,450 L650,520" stroke={INK} strokeWidth={5} />}
      {/* the door */}
      <rect x={DOOR.x0 - 18} y={DOOR.top - 20} width={DOOR.x1 - DOOR.x0 + 36} height={DOOR.bot - DOOR.top + 20} fill="#3d2616" stroke={INK} strokeWidth={6} />
      {open > 0 && <Closet t={t} />}
      <g>
        <path d={`M${DOOR.x1},${DOOR.top} L${lx},${DOOR.top - grow} L${lx},${DOOR.bot + grow * 0.6} L${DOOR.x1},${DOOR.bot}Z`} fill="#a9703f" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        {open < 0.5 && (
          <g>
            <rect x={DOOR.x0 + 24} y={DOOR.top + 40} width={DOOR.x1 - DOOR.x0 - 48} height={230} fill="#946034" stroke={INK} strokeWidth={4} />
            <rect x={DOOR.x0 + 24} y={DOOR.top + 330} width={DOOR.x1 - DOOR.x0 - 48} height={250} fill="#946034" stroke={INK} strokeWidth={4} />
            <circle cx={DOOR.x0 + 26} cy={1040} r={13} fill="#e8c24a" stroke={INK} strokeWidth={4} />
          </g>
        )}
      </g>
      <Toilet />
      {aged && (
        <g>
          <Cobweb x={0} y={450} r={300} />
          <Cobweb x={W} y={450} r={260} flip />
          <Cobweb x={DOOR.x0 - 18} y={DOOR.top - 20} r={120} flip rot={10} />
          <Cobweb x={560} y={450} r={150} />
          {/* a spider, hanging about */}
          <path d={`M340,450 L340,${700 + Math.sin(t * 0.2) * 20}`} stroke="#f4f4f4" strokeWidth={3} />
          <g transform={`translate(340,${712 + Math.sin(t * 0.2) * 20})`}>
            <circle r={14} fill="#2a2a30" stroke={INK} strokeWidth={3} />
            {[-1, 1].map((s) => [0, 1, 2].map((k) => <path key={s + "_" + k} d={`M${s * 10},${-4 + k * 5} l${s * 18},${-8 + k * 8}`} stroke={INK} strokeWidth={3} strokeLinecap="round" />))}
          </g>
          <rect width={W} height={H} fill="#2a1a40" opacity={0.2} />
        </g>
      )}
      {dark > 0 && <rect width={W} height={H} fill="#000" opacity={dark} />}
    </g>
  );
};

/** dotted five-step path from the guest to the door, footprints lighting up in turn */
export const StepPath: React.FC<{ t: number; x0?: number; x1?: number; y?: number; ghost?: boolean }> = ({ t, x0 = 330, x1 = 770, y = 1560, ghost }) => (
  <g>
    {Array.from({ length: 5 }, (_, i) => {
      const x = x0 + ((x1 - x0) * i) / 4;
      const lit = ghost ? 0 : Math.max(0, Math.min(1, (t - 6 - i * 3) / 3));
      const pop = lit > 0 && lit < 1 ? 1 + 0.5 * Math.sin(lit * Math.PI) : 1;
      return (
        <g key={i} transform={`translate(${x},${y + (i % 2 ? 14 : -6)}) scale(${pop})`} opacity={ghost ? 0.35 : 0.25 + 0.75 * lit}>
          <ellipse rx={30} ry={15} fill="#fff6c0" stroke={INK} strokeWidth={4} />
          <text textAnchor="middle" y={9} fontFamily="Poppins Black" fontSize={26} fill={INK}>{i + 1}</text>
        </g>
      );
    })}
    <path d={`M${x0 + 40},${y + 4} L${x1 - 40},${y + 4}`} stroke={INK} strokeWidth={5} strokeDasharray="4 18" strokeLinecap="round" opacity={ghost ? 0.3 : 0.7} />
  </g>
);

/* ------------------------------------- shared bits ------------------------------------- */

const ridge = (sc: number, speed: number, base: number, amp: number, wl: number, bottom: number, seed = 1): string => {
  const pts: P[] = [];
  for (let x = -80; x <= W + 80; x += 40) {
    const u = (x - sc * speed) / wl;
    pts.push([x, base + amp * Math.sin(u * Math.PI * 2 + seed) + amp * 0.45 * Math.sin(u * Math.PI * 5.3 + seed * 2)]);
  }
  return smooth(pts, false) + `L${W + 80},${bottom} L-80,${bottom}Z`;
};

const Streaks: React.FC<{ t: number; n?: number; c?: string; sp?: number; slant?: number; w?: number }> = ({ t, n = 26, c = "#fff", sp = 70, slant = 0.35, w = 5 }) => (
  <g stroke={c} strokeWidth={w} strokeLinecap="round" opacity={0.85}>
    {Array.from({ length: n }, (_, i) => {
      const x = mod(rnd(i, 1) * 1500 + t * sp * (0.7 + rnd(i, 2)), 1500) - 200;
      const y = mod(rnd(i, 3) * 1900 + t * sp * slant, 1900) - 0;
      const l = 80 + rnd(i, 4) * 120;
      return <path key={i} d={`M${W - x},${y} l${-l},${l * slant}`} />;
    })}
  </g>
);

/* ------------------------------------------ desert ------------------------------------------ */

const Cactus: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <Part d={tube([[0, 0], [0, -230], [0, -430]], [40, 38, 34])} fill="#4aa152" shade="#2f7a3a" lw={6} />
    <Part d={tube([[0, -150], [-90, -150], [-100, -270]], [24, 22, 20])} fill="#4aa152" shade="#2f7a3a" lw={6} />
    <Part d={tube([[0, -210], [88, -210], [96, -320]], [24, 22, 20])} fill="#4aa152" shade="#2f7a3a" lw={6} />
    {[-300, -240, -170, -100, -40].map((yy, i) => <path key={i} d={`M${i % 2 ? -18 : 12},${yy} l${i % 2 ? -10 : 10},-6 M${i % 2 ? 4 : -4},${yy - 20} l6,-8`} stroke="#d9f2c4" strokeWidth={3} strokeLinecap="round" />)}
    <circle cx={0} cy={-444} r={12} fill="#ff5d8f" stroke={INK} strokeWidth={4} />
  </g>
);

export const Desert: React.FC<{ sc: number; t: number }> = ({ sc, t }) => (
  <g>
    <rect width={W} height={H} fill="#ffd873" />
    <rect y={700} width={W} height={500} fill="#ffc85c" opacity={0.6} />
    {/* the sun, huge */}
    <g transform="translate(760,430)">
      {Array.from({ length: 14 }, (_, i) => <path key={i} transform={`rotate(${i * 25.7 + t * 2})`} d="M-22,-250 L0,-340 L22,-250Z" fill="#ffb02e" stroke={INK} strokeWidth={4} strokeLinejoin="round" />)}
      <circle r={210} fill="#fff1a8" stroke={INK} strokeWidth={7} />
      <circle r={170} fill="#ffe27a" />
    </g>
    {/* heat shimmer */}
    {[1180, 1230, 1290].map((y, i) => <path key={y} d={`M0,${y} Q135,${y - 12 + Math.sin(t * 0.8 + i) * 8} 270,${y} T540,${y} T810,${y} T1080,${y}`} stroke="#fff" strokeWidth={5} fill="none" opacity={0.5} />)}
    {/* vultures */}
    {[0, 1].map((i) => <path key={i} d={`M${200 + i * 160 + Math.sin(t * 0.2 + i) * 30},${240 + i * 70} q22,-26 44,0 q22,-26 44,0`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />)}
    <path d={ridge(sc, 0.15, 1170, 40, 900, H, 1)} fill="#f0b857" stroke={INK} strokeWidth={6} />
    <path d={ridge(sc, 0.4, 1320, 36, 700, H, 3)} fill="#e6a04b" stroke={INK} strokeWidth={6} />
    <path d={ridge(sc, 1, 1500, 18, 600, H, 5)} fill="#f4c46e" stroke={INK} strokeWidth={6} />
    <path d={ridge(sc, 1, 1500, 18, 600, 1560, 5)} fill="#e8b25c" opacity={0.0} />
    {/* cacti sliding by */}
    <Cactus x={mod(-200 + sc * 0.45, 1700) - 300} y={1420} s={0.6} />
    <Cactus x={mod(300 + sc * 1.0, 1900) - 400} y={1580} s={1.25} />
    {/* skull and bones, for mood */}
    <g transform={`translate(${mod(900 + sc * 1.0, 2300) - 400},1640)`}>
      <path d="M-34,0 Q-44,-40 0,-44 Q44,-40 34,0 L20,10 L-20,10Z" fill="#f4f0e2" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <circle cx={-12} cy={-16} r={9} fill={INK} /><circle cx={12} cy={-16} r={9} fill={INK} />
      <path d="M-70,16 L70,26" stroke={INK} strokeWidth={14} strokeLinecap="round" /><path d="M-70,16 L70,26" stroke="#f4f0e2" strokeWidth={7} strokeLinecap="round" />
    </g>
  </g>
);

/* ------------------------------------------ snowfield ------------------------------------------ */

const Pine: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-14} y={-60} width={28} height={60} fill="#6a4a30" stroke={INK} strokeWidth={5} />
    {[[-40, 220, 150], [-150, 170, 120], [-250, 120, 90]].map(([yy, w, h], i) => (
      <g key={i}>
        <path d={`M${-w},${yy} L0,${yy - h * 1.5} L${w},${yy}Z`} fill="#2f6b4a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d={`M${-w * 0.7},${yy - h * 0.45} Q${-w * 0.35},${yy - h * 0.3} 0,${yy - h * 0.62} Q${w * 0.35},${yy - h * 0.3} ${w * 0.7},${yy - h * 0.45} L${w * 0.45},${yy - h * 0.8} L0,${yy - h * 1.5} L${-w * 0.45},${yy - h * 0.8}Z`} fill="#fff" opacity={0.9} />
      </g>
    ))}
  </g>
);

export const Snow: React.FC<{ sc: number; t: number }> = ({ sc, t }) => (
  <g>
    <rect width={W} height={H} fill="#c9dff0" />
    <rect y={600} width={W} height={700} fill="#dbeaf6" opacity={0.7} />
    <path d={ridge(sc, 0.1, 1020, 90, 1100, H, 2)} fill="#e9f3fb" stroke={INK} strokeWidth={6} />
    <path d={ridge(sc, 0.3, 1230, 50, 800, H, 4)} fill="#f3f9fd" stroke={INK} strokeWidth={6} />
    {[0, 1, 2].map((i) => <Pine key={i} x={mod(100 + i * 620 + sc * 0.45, 1900) - 400} y={1330} s={0.8} />)}
    <path d={ridge(sc, 1, 1500, 20, 640, H, 7)} fill="#f8fcff" stroke={INK} strokeWidth={6} />
    <path d={ridge(sc, 1, 1640, 14, 500, H, 9)} fill="#dcebf6" />
    {/* the snowman at the roadside, unimpressed */}
    <g transform={`translate(${mod(700 + sc * 1.0, 2200) - 400},1590)`}>
      <circle cy={-60} r={64} fill="#fff" stroke={INK} strokeWidth={5} />
      <circle cy={-150} r={46} fill="#fff" stroke={INK} strokeWidth={5} />
      <path d="M0,-150 l50,8 l-50,10Z" fill="#ff8a2a" stroke={INK} strokeWidth={3} />
      <circle cx={-14} cy={-166} r={5} fill={INK} /><circle cx={14} cy={-166} r={5} fill={INK} />
    </g>
    <Streaks t={t} n={34} c="#ffffff" sp={80} slant={0.28} w={6} />
    {Array.from({ length: 22 }, (_, i) => <circle key={i} cx={mod(rnd(i, 9) * 1300 - t * 60 * (0.6 + rnd(i, 10)), 1300) - 100} cy={mod(rnd(i, 11) * 1900 + t * 22, 1900)} r={5 + rnd(i, 12) * 8} fill="#fff" />)}
    <rect width={W} height={H} fill="#dff0ff" opacity={0.18 + 0.08 * Math.sin(t * 0.7)} />
  </g>
);

/* ------------------------------------------- jungle ------------------------------------------- */

const Trunk: React.FC<{ x: number; w: number; c: string; s: string }> = ({ x, w, c, s }) => (
  <g>
    <rect x={x - w / 2} y={-40} width={w} height={H + 80} fill={c} stroke={INK} strokeWidth={6} />
    <rect x={x + w * 0.1} y={-40} width={w * 0.4} height={H + 80} fill={s} />
    {[300, 700, 1100, 1500].map((y, i) => <path key={i} d={`M${x - w / 2},${y} q${w * 0.5},${30} ${w},0`} stroke={INK} strokeWidth={4} fill="none" />)}
  </g>
);

const Leaf: React.FC<{ x: number; y: number; r: number; rot: number; c?: string }> = ({ x, y, r, rot, c = "#2f9a46" }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <path d={`M0,0 Q${r * 0.5},${-r * 0.5} ${r},0 Q${r * 0.5},${r * 0.5} 0,0Z`} fill={c} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d={`M0,0 L${r * 0.9},0`} stroke="#1f6d30" strokeWidth={5} />
  </g>
);

export const Jungle: React.FC<{ sc: number; t: number }> = ({ sc, t }) => (
  <g>
    <rect width={W} height={H} fill="#a8d96a" />
    <rect y={0} width={W} height={900} fill="#7cc653" opacity={0.7} />
    {/* sun shafts */}
    {[180, 460, 760].map((x, i) => <path key={i} d={`M${x},0 L${x + 120},0 L${x + 420},1500 L${x + 160},1500Z`} fill="#fff7b0" opacity={0.22} />)}
    {[0, 1, 2, 3].map((i) => <Trunk key={"f" + i} x={mod(120 + i * 420 + sc * 0.25, 1700) - 300} w={86} c="#5a7a3a" s="#476a2c" />)}
    {[0, 1, 2].map((i) => <Trunk key={"m" + i} x={mod(40 + i * 560 + sc * 0.6, 1700) - 300} w={140} c="#6a4a2a" s="#523620" />)}
    {/* canopy */}
    {[0, 1, 2, 3, 4, 5].map((i) => <Leaf key={i} x={mod(i * 260 + sc * 0.7, 1700) - 300} y={-20 + (i % 2) * 40} r={380} rot={80 + (i % 3) * 14} c={i % 2 ? "#2f9a46" : "#3fb256"} />)}
    {[0, 1, 2, 3].map((i) => <Leaf key={"b" + i} x={mod(60 + i * 400 + sc * 0.8, 1700) - 300} y={120 + (i % 2) * 40} r={300} rot={100 + (i % 3) * 20} c="#1f7d38" />)}
    {/* vines */}
    {[0, 1, 2].map((i) => <path key={i} d={`M${mod(200 + i * 500 + sc * 0.6, 1700) - 300},0 Q${mod(200 + i * 500 + sc * 0.6, 1700) - 260},500 ${mod(200 + i * 500 + sc * 0.6, 1700) - 300},900`} stroke="#2a6a2a" strokeWidth={14} fill="none" />)}
    {/* ground */}
    <path d={ridge(sc, 1, 1560, 14, 500, H, 3)} fill="#4a6a2a" stroke={INK} strokeWidth={6} />
    <path d={ridge(sc, 1, 1640, 10, 400, H, 6)} fill="#3a5a22" />
    {[0, 1, 2].map((i) => <g key={i} transform={`translate(${mod(100 + i * 700 + sc * 1.0, 1900) - 300},1620)`}><Leaf x={0} y={0} r={140} rot={-70} /><Leaf x={0} y={0} r={140} rot={-110} c="#3fb256" /></g>)}
  </g>
);

/* -------------------------------------------- ocean -------------------------------------------- */

export const Ocean: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect width={W} height={H} fill="#ffe9b8" />
    <rect y={500} width={W} height={500} fill="#ffd69a" opacity={0.8} />
    <g transform="translate(300,780)">
      <circle r={180} fill="#ff9a5a" stroke={INK} strokeWidth={6} /><circle r={140} fill="#ffc07a" />
    </g>
    {[0, 1, 2].map((i) => <path key={i} d={`M${700 + i * 120},${260 + i * 60} q16,-18 32,0 q16,-18 32,0`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />)}
    <rect y={1000} width={W} height={H - 1000} fill="#2a9bd1" stroke={INK} strokeWidth={6} />
    <rect y={1000} width={W} height={50} fill="#58bde8" />
    {[0, 1, 2, 3, 4].map((k) => {
      const y = 1130 + k * 130;
      return <path key={k} d={`M-40,${y} ${Array.from({ length: 9 }, (_, i) => `Q${i * 140 + 70 + Math.sin(t * 0.35 + k) * 30},${y - 28 - k * 4} ${i * 140 + 140},${y}`).join(" ")}`} stroke={k % 2 ? "#7fd0f2" : "#1f7fb8"} strokeWidth={8 + k * 2} fill="none" strokeLinecap="round" />;
    })}
  </g>
);
export const OceanFront: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <path d={`M-40,1760 ${Array.from({ length: 9 }, (_, i) => `Q${i * 140 + 70 + Math.sin(t * 0.4 + i) * 20},${1700 + Math.sin(t * 0.3) * 14} ${i * 140 + 140},1760`).join(" ")} L1120,1920 L-40,1920Z`} fill="#1f7fb8" stroke={INK} strokeWidth={7} />
    {[0, 1, 2, 3].map((i) => <path key={i} d={`M${i * 300 + 60 + Math.sin(t * 0.4 + i) * 20},1790 q40,-30 80,0`} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" />)}
  </g>
);

/* ------------------------------------------- volcano -------------------------------------------- */

export const Volcano: React.FC<{ sc: number; t: number; erupt?: number }> = ({ sc, t, erupt = 0 }) => (
  <g>
    <rect width={W} height={H} fill="#5a1a2a" />
    <rect y={600} width={W} height={600} fill="#a8322a" opacity={0.7} />
    <rect y={1000} width={W} height={300} fill="#ff7a2a" opacity={0.55} />
    {/* the mountain */}
    <path d="M-80,1420 L380,760 Q480,700 560,720 L1160,1420Z" fill="#3a2230" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M380,760 Q480,700 560,720 L640,800 Q500,760 380,800Z" fill="#ff9a2a" stroke={INK} strokeWidth={5} />
    <path d="M470,740 Q450,980 380,1420 M520,740 Q560,1000 650,1420 M480,760 Q500,1100 520,1420" stroke="#ff7a2a" strokeWidth={14} fill="none" strokeLinecap="round" />
    {/* smoke column */}
    {[0, 1, 2, 3].map((i) => <circle key={i} cx={480 + Math.sin(t * 0.2 + i) * 30 + i * 18} cy={620 - i * 120 - (t * 6) % 40} r={70 + i * 30} fill={i % 2 ? "#4a3a46" : "#5a4a56"} stroke={INK} strokeWidth={6} />)}
    {/* eruption */}
    {erupt > 0 && (
      <g>
        <path d={`M440,760 L${400 - 220 * erupt},${760 - 520 * erupt} L${520},${760 - 760 * erupt} L${640 + 220 * erupt},${760 - 520 * erupt} L600,760Z`} fill="#ffb02e" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={520 + (rnd(i, 3) - 0.5) * 900 * erupt} cy={760 - 560 * erupt * (0.4 + rnd(i, 4)) + 380 * erupt * erupt * rnd(i, 5)} r={22 + rnd(i, 6) * 26} fill={i % 2 ? "#ff5a1a" : "#ffd23f"} stroke={INK} strokeWidth={5} />)}
      </g>
    )}
    <path d={ridge(sc, 0.5, 1440, 24, 700, H, 1)} fill="#2a1c26" stroke={INK} strokeWidth={6} />
    <path d={ridge(sc, 1, 1560, 12, 500, H, 3)} fill="#1c1420" stroke={INK} strokeWidth={6} />
    {/* embers */}
    {Array.from({ length: 18 }, (_, i) => <circle key={i} cx={mod(rnd(i, 1) * 1300 + t * 8 * (rnd(i, 2) - 0.3), 1300) - 100} cy={mod(rnd(i, 3) * 1900 - t * (14 + 22 * rnd(i, 4)), 1900)} r={4 + rnd(i, 5) * 6} fill="#ffb02e" />)}
  </g>
);

/** the trench of lava he steps over, in the ground plane, scrolling with it */
export const LavaRiver: React.FC<{ x: number; y: number; t: number; w?: number }> = ({ x, y, t, w = 250 }) => (
  <g>
    <path d={`M${x - w / 2},${y - 40} L${x + w / 2},${y - 40} L${x + w / 2 + 40},${H} L${x - w / 2 - 40},${H}Z`} fill="#ff7a1a" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d={`M${x - w / 2 + 30},${y - 20} L${x + w / 2 - 30},${y - 20} L${x + w / 2 + 6},${H} L${x - w / 2 - 6},${H}Z`} fill="#ffd23f" opacity={0.9} />
    {[0, 1, 2, 3].map((i) => <circle key={i} cx={x + (rnd(i, 3) - 0.5) * w * 0.7} cy={y + 40 + i * 70 + Math.sin(t * 0.5 + i) * 10} r={14 + rnd(i, 5) * 10} fill="#fff1a8" stroke={INK} strokeWidth={4} />)}
    {[0, 1, 2].map((i) => <circle key={"b" + i} cx={x + (i - 1) * w * 0.28} cy={y - 60 - ((t * 5 + i * 14) % 50)} r={10 + i * 3} fill="#ff9a2a" stroke={INK} strokeWidth={3} opacity={0.9} />)}
  </g>
);

/* --------------------------------------------- night --------------------------------------------- */

export const Night: React.FC<{ sc: number; t: number }> = ({ sc, t }) => (
  <g>
    <rect width={W} height={H} fill="#0e1a4a" />
    <rect y={800} width={W} height={500} fill="#1a2a6a" opacity={0.8} />
    {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={rnd(i, 1) * W} cy={rnd(i, 2) * 1100} r={2 + rnd(i, 3) * 4 + (Math.sin(t * 0.6 + i) > 0.7 ? 2 : 0)} fill="#fff9d0" />)}
    <g transform="translate(830,760)">
      <circle r={190} fill="#fff7c2" stroke={INK} strokeWidth={7} />
      <circle cx={-60} cy={-40} r={34} fill="#e8dfa0" /><circle cx={50} cy={50} r={46} fill="#e8dfa0" /><circle cx={70} cy={-70} r={20} fill="#e8dfa0" />
    </g>
    <path d={ridge(sc, 0.2, 1240, 70, 1000, H, 3)} fill="#16245a" stroke={INK} strokeWidth={6} />
    <path d={ridge(sc, 0.5, 1400, 40, 800, H, 5)} fill="#1c2e70" stroke={INK} strokeWidth={6} />
    <path d={ridge(sc, 1, 1560, 14, 560, H, 7)} fill="#243a82" stroke={INK} strokeWidth={6} />
    {/* fireflies */}
    {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={mod(rnd(i, 4) * 1300 + sc * 1.1, 1300) - 100} cy={1250 + rnd(i, 5) * 400 + Math.sin(t * 0.4 + i) * 30} r={7} fill="#e8ff7a" />)}
    {/* a bat */}
    <path d={`M${140 + Math.sin(t * 0.2) * 40},${420 + Math.cos(t * 0.3) * 20} q22,${-20 + Math.sin(t) * 12} 44,0 q22,${-20 + Math.sin(t) * 12} 44,0`} stroke="#000" strokeWidth={9} fill="none" strokeLinecap="round" />
  </g>
);

/** a tear-off calendar. `flips`: frames (relative) at which the top page flips away */
export const Calendar: React.FC<{ t: number; flips: number[]; x?: number; y?: number; s?: number }> = ({ t, flips, x = 540, y = 360, s = 1 }) => {
  const labels = ["DAY 1", "DAY 2", "DAY 3"];
  const pop = Math.min(1, Math.max(0, t / 3));
  const page = (i: number) => {
    const at = flips[i];
    const k = at === undefined ? 0 : Math.max(0, Math.min(1, (t - at) / 4));
    return k;
  };
  return (
    <g transform={`translate(${x},${y}) scale(${s * (0.4 + 0.6 * pop)}) rotate(${(1 - pop) * -14})`} opacity={pop > 0 ? 1 : 0}>
      <rect x={-250} y={-200} width={500} height={540} rx={20} fill="#c43030" stroke={INK} strokeWidth={8} />
      {[-150, -50, 50, 150].map((cx) => <rect key={cx} x={cx - 12} y={-232} width={24} height={70} rx={10} fill="#d8d8de" stroke={INK} strokeWidth={5} />)}
      {[2, 1, 0].map((i) => {
        const k = page(i);
        if (k >= 1) return null;
        const sy = Math.cos(k * Math.PI * 0.5);
        return (
          <g key={i} transform={`translate(0,-170) scale(1,${sy}) translate(0,170)`}>
            <rect x={-232} y={-170} width={464} height={490} rx={10} fill="#fffdf4" stroke={INK} strokeWidth={6} />
            <rect x={-232} y={-170} width={464} height={78} rx={10} fill="#e84a4a" stroke={INK} strokeWidth={6} />
            <text x={0} y={150} textAnchor="middle" fontFamily="Poppins Black" fontSize={i === 2 ? 150 : 150} fill={INK}>{labels[i].split(" ")[1]}</text>
            <text x={0} y={-112} textAnchor="middle" fontFamily="Poppins Black" fontSize={52} fill="#fff" stroke={INK} strokeWidth={9} paintOrder="stroke">DAY</text>
          </g>
        );
      })}
    </g>
  );
};
