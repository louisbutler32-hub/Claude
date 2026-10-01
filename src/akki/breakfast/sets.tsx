import React from "react";
import { H, INK, W } from "../common";
import { Part, smooth } from "../bowling/characters";

/**
 * The Marine HQ canteen: white-tile walls with a navy stripe, a serving
 * counter with a chrome toaster, a pass-through window, a MARINE banner,
 * blue-and-white checker floor, and a small table up front where our guy
 * waits with a plate.
 */

type P = [number, number];

export const Toaster: React.FC<{ x: number; y: number; s?: number; wreck?: boolean; glow?: number }> = ({ x, y, s = 1, wreck, glow = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {wreck ? (
      <>
        <Part d="M-90,0 L-70,-80 L-30,-50 L0,-110 L30,-60 L80,-90 L90,0Z" fill="#7a7e88" shade="#4a4e58" lw={5} />
        <path d="M-60,-30 l20,-20 M10,-50 l30,10" stroke="#2a2a30" strokeWidth={6} />
      </>
    ) : (
      <>
        <Part d={smooth([[-90, 0], [-96, -90], [-70, -120], [70, -120], [96, -90], [90, 0]], true, 0.5)} fill="#c9cfda" shade="#8a92a4" lw={5}>
          <path d="M-60,-100 L-60,-60 M-60,-100 L-20,-100 M20,-100 L60,-100" stroke="#ffffff" strokeWidth={8} opacity={0.7} />
        </Part>
        <rect x={-60} y={-128} width={44} height={14} rx={5} fill="#2a2a30" />
        <rect x={16} y={-128} width={44} height={14} rx={5} fill="#2a2a30" />
        <Part d="M96,-60 L120,-60 L120,-40 L96,-40Z" fill="#2a2a30" lw={4} />
        {glow > 0 && <rect x={-70} y={-132} width={140} height={20} fill="#ffe680" opacity={glow} />}
      </>
    )}
  </g>
);

export const Toast: React.FC<{ x: number; y: number; s?: number; burnt?: number; frozen?: boolean; golden?: boolean; rot?: number }> = ({ x, y, s = 1, burnt = 0, frozen, golden, rot = 0 }) => {
  const crust = burnt > 0.5 ? "#1e1612" : golden ? "#b8661e" : "#c88a4a";
  const crumb = burnt > 0.5 ? "#2a201c" : golden ? "#f2b048" : "#f4dcae";
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
      <Part d={smooth([[-70, 60], [-74, -20], [-90, -60], [-60, -92], [0, -86], [60, -92], [90, -60], [74, -20], [70, 60]], true, 0.6)} fill={crust} lw={5} />
      <path d={smooth([[-56, 46], [-58, -18], [-70, -54], [-48, -74], [0, -68], [48, -74], [70, -54], [58, -18], [56, 46]], true, 0.6)} fill={crumb} />
      {golden && <path d="M-40,-40 l20,-10 M10,-30 l30,-8 M-20,10 l26,-6" stroke="#ffe4a0" strokeWidth={8} strokeLinecap="round" />}
      {burnt > 0.5 && <path d="M-40,-30 l20,30 M10,-50 l-10,40 M30,0 l20,30" stroke="#0a0806" strokeWidth={5} />}
      {frozen && <rect x={-110} y={-130} width={220} height={220} rx={14} fill="#bfe6ff" opacity={0.6} stroke="#2a5a8a" strokeWidth={5} />}
    </g>
  );
};

export const Plate: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <Part d={smooth([[-150, 0], [-120, -30], [0, -40], [120, -30], [150, 0], [120, 30], [0, 40], [-120, 30]])} fill="#f8f8f6" shade="#c8ccd4" lw={5}>
      <ellipse cx={0} cy={0} rx={100} ry={22} fill="none" stroke="#c8ccd4" strokeWidth={4} />
    </Part>
  </g>
);

/** the canteen, laid out for the 1080×1920 wide shot. `wreck` 0..1 scorches, cracks and dusts it. */
export const Canteen: React.FC<{ wreck?: number; frost?: number }> = ({ wreck = 0, frost = 0 }) => {
  const tiles: string[] = [];
  for (let y = 120; y < 1180; y += 70) for (let x = 0; x < W; x += 70) tiles.push(`M${x},${y}h70v70h-70Z`);
  const floor: string[] = [];
  const fy = 1180;
  for (let r = 0; r < 10; r++) {
    const y0 = fy + Math.pow(r / 10, 1.6) * 760, y1 = fy + Math.pow((r + 1) / 10, 1.6) * 760;
    const k0 = 1 + r * 0.25, k1 = 1 + (r + 1) * 0.25;
    for (let c = -8; c < 8; c++) if ((r + c) % 2 === 0) {
      const xa = 540 + c * 90 * k0, xb = 540 + (c + 1) * 90 * k0, xc = 540 + (c + 1) * 90 * k1, xd = 540 + c * 90 * k1;
      floor.push(`M${xa},${y0}L${xb},${y0}L${xc},${y1}L${xd},${y1}Z`);
    }
  }
  return (
    <g>
      <rect width={W} height={H} fill="#eef3f8" />
      <path d={tiles.join("")} fill="none" stroke="#c9d6e4" strokeWidth={3} />
      <rect y={520} width={W} height={40} fill="#24305a" />
      <rect y={570} width={W} height={12} fill="#24305a" />
      {/* banner */}
      <Part d="M220,300 L860,300 L840,440 L240,440Z" fill="#24305a" shade="#141c3a" lw={6} />
      <text x={540} y={400} textAnchor="middle" fontFamily="Poppins Black" fontSize={88} fill="#ffffff" letterSpacing={6}>MARINE</text>
      {/* pass-through window */}
      <Part d="M120,640 L460,640 L460,900 L120,900Z" fill="#3a4a6a" lw={6}>
        <path d="M150,700 h120 v80 h-120Z M300,680 l60,0 l0,160 l-60,0Z" fill="#5a6a8a" />
      </Part>
      <path d="M100,900 L480,900" stroke={INK} strokeWidth={10} />
      {/* menu board */}
      <Part d="M620,640 L960,640 L960,900 L620,900Z" fill="#1e2a22" lw={6}>
        {["TOAST ....... 1B", "EGGS ........ 2B", "MEAT ...... 999B"].map((s, i) => <text key={s} x={650} y={710 + i * 60} fontFamily="Poppins Black" fontSize={30} fill="#f2f2ea">{s}</text>)}
      </Part>
      {/* serving counter */}
      <Part d="M-20,1000 L1100,1000 L1100,1200 L-20,1200Z" fill="#8a5a34" shade="#5e3a1e" lw={6}>
        <path d="M-20,1040 L1100,1040" stroke={INK} strokeWidth={4} />
        {[180, 540, 900].map((x) => <path key={x} d={`M${x},1060 l0,120`} stroke="#5e3a1e" strokeWidth={6} />)}
      </Part>
      <Part d="M-30,970 L1110,970 L1110,1010 L-30,1010Z" fill="#d8dee8" shade="#a8b0c0" lw={6} />
      {/* floor */}
      <rect y={fy} width={W} height={H - fy} fill="#e8eef6" />
      <path d={floor.join("")} fill="#5a84c4" />
      {frost > 0 && <rect width={W} height={H} fill="#cfeeff" opacity={0.35 * frost} />}
      {wreck > 0 && (
        <g opacity={wreck}>
          <path d="M0,0 L1080,0 L1080,1920 L0,1920Z" fill="#3a2a22" opacity={0.25} />
          {[[260, 420, 1.4], [800, 700, 1], [520, 180, 1.2], [140, 1100, 0.9], [900, 1300, 1.3]].map(([x, y, k], i) => (
            <path key={i} d={`M${x},${y} l${60 * k},${-40 * k} l${-20 * k},${70 * k} l${80 * k},${30 * k} l${-90 * k},${20 * k} l${-10 * k},${70 * k} l${-40 * k},${-60 * k} l${-70 * k},${10 * k}Z`} fill="#1a1412" opacity={0.6} />
          ))}
          <path d="M0,560 L300,600 L520,540 L760,610 L1080,560" stroke={INK} strokeWidth={6} fill="none" />
        </g>
      )}
    </g>
  );
};

/** the canteen table up front, with our guy's plate */
export const Table: React.FC<{ y?: number }> = ({ y = 1560 }) => (
  <g>
    <Part d={`M60,${y} L1020,${y} L1060,${y + 80} L20,${y + 80}Z`} fill="#c8925a" shade="#9a6a38" lw={6} />
    <Part d={`M20,${y + 80} L1060,${y + 80} L1060,${y + 120} L20,${y + 120}Z`} fill="#9a6a38" lw={6} />
  </g>
);

/** a black stage with a red pressure glow — for the admirals' glare */
export const HakiStage: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect width={W} height={H} fill="#120608" />
    <defs>
      <radialGradient id="hakiGlow" cx="0.5" cy="0.6" r="0.7"><stop offset="0" stopColor="#c0181e" stopOpacity={0.7} /><stop offset="1" stopColor="#120608" stopOpacity={0} /></radialGradient>
    </defs>
    <rect width={W} height={H} fill="url(#hakiGlow)" />
    {Array.from({ length: 18 }, (_, i) => {
      const a = (i / 18) * Math.PI * 2 + t * 0.4;
      const r0 = 300 + (i % 3) * 60, r1 = 1400;
      return <path key={i} d={`M${540 + Math.cos(a) * r0},${1100 + Math.sin(a) * r0} L${540 + Math.cos(a + 0.03) * r1},${1100 + Math.sin(a + 0.03) * r1} L${540 + Math.cos(a - 0.03) * r1},${1100 + Math.sin(a - 0.03) * r1}Z`} fill="#000" opacity={0.6} />;
    })}
  </g>
);
