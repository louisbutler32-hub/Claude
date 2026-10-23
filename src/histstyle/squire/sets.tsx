import React from "react";
import { hash } from "../shared";

// ── Sets for the long-form explainer, v2 ──────────────────────────────
//
// Painted-flat landscapes built in depth: every layer can be blurred on its
// own, so a close shot keeps the actor sharp and lets the world go soft
// behind them (the single biggest thing that makes this look produced, not
// rendered). Layers, back to front: sky → clouds → far hills with tree
// clumps and a village → patchwork fields and hedgerows → near meadow with
// tufts and poppies → road. Thick dark outlines on the near layers, lighter
// and thinner with distance.

export const W = 1920;
export const H = 1080;
const LN = "#1d1818";

export const Blur: React.FC<{ id: string; px: number; children: React.ReactNode }> = ({ id, px, children }) =>
  px > 0 ? (
    <g>
      <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation={px} />
      </filter>
      <g filter={`url(#${id})`}>{children}</g>
    </g>
  ) : (
    <g>{children}</g>
  );

export const Cloud2: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-170,30 C-190,-4 -150,-34 -112,-22 C-106,-70 -40,-86 -8,-50 C14,-96 92,-92 104,-40 C150,-52 186,-12 168,30 Z" fill="#f9e3d6" />
    <path d="M-150,-10 C-130,-30 -110,-26 -100,-14 C-92,-56 -40,-70 -12,-40 C10,-80 80,-76 92,-30 C80,-50 30,-56 6,-24 C-14,-52 -70,-50 -88,-6 C-104,-22 -130,-24 -150,-10 Z" fill="#fff5ee" />
    <path d="M-170,30 C-110,10 110,10 168,30 Z" fill="#eebcab" />
  </g>
);

const Clump: React.FC<{ x: number; y: number; s: number; c: string; d: string; line?: string; lw?: number }> = ({ x, y, s, c, d, line = LN, lw = 4 }) => {
  const blobs: [number, number, number][] = [
    [0, -150, 62],
    [-50, -112, 50],
    [50, -108, 52],
    [0, -92, 56],
  ];
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M-12,0 L-9,-86 L9,-86 L12,0 Z" fill="#7a5233" stroke={line} strokeWidth={lw} strokeLinejoin="round" />
      <path d="M0,-60 L-22,-84 M2,-70 L20,-90" stroke="#5e3f27" strokeWidth={6} strokeLinecap="round" />
      {blobs.map(([bx, by, r], i) => (
        <circle key={`o${i}`} cx={bx} cy={by} r={r} fill="none" stroke={line} strokeWidth={lw * 2} />
      ))}
      {blobs.map(([bx, by, r], i) => (
        <circle key={`f${i}`} cx={bx} cy={by} r={r} fill={c} />
      ))}
      <path d="M-60,-84 C-30,-58 40,-58 76,-92 C64,-48 -40,-44 -60,-84 Z" fill={d} />
      <path d="M-36,-176 C-20,-196 12,-200 28,-186" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={10} fill="none" strokeLinecap="round" />
    </g>
  );
};

const House: React.FC<{ x: number; y: number; w: number; h: number; wall?: string; roof?: string; line: string; lw: number }> = ({
  x, y, w, h, wall = "#f1e4c9", roof = "#b9553b", line, lw,
}) => (
  <g>
    <rect x={x} y={y - h} width={w} height={h} fill={wall} stroke={line} strokeWidth={lw} />
    <rect x={x + w - w * 0.3} y={y - h} width={w * 0.3} height={h} fill="#000" opacity={0.08} />
    <path d={`M${x - 8},${y - h} L${x + w / 2},${y - h - h * 0.7} L${x + w + 8},${y - h} Z`} fill={roof} stroke={line} strokeWidth={lw} strokeLinejoin="round" />
    <rect x={x + w * 0.68} y={y - h - h * 0.62} width={w * 0.12} height={h * 0.3} fill="#9a7a62" stroke={line} strokeWidth={lw * 0.8} />
    {[0.22, 0.58].map((u) => (
      <rect key={u} x={x + w * u} y={y - h * 0.72} width={w * 0.16} height={h * 0.26} fill="#5f7b96" stroke={line} strokeWidth={lw * 0.7} />
    ))}
    <rect x={x + w * 0.42} y={y - h * 0.42} width={w * 0.16} height={h * 0.42} fill="#6b4a32" stroke={line} strokeWidth={lw * 0.7} />
  </g>
);

/**
 * French countryside, August: blue sky, pink-lit cumulus, a village with a
 * spire on the far ridge, golden wheat and green pasture split by hedges,
 * a meadow with poppies in front. `blur` softens each depth band.
 */
export const Countryside: React.FC<{
  f: number;
  id: string;
  blur?: { far?: number; mid?: number; near?: number };
  horizon?: number; // y of the far ridge
  road?: boolean;
  poppies?: boolean;
}> = ({ f, id, blur = {}, horizon = 560, road = true, poppies = true }) => {
  const hz = horizon;
  const field = (x0: number, x1: number, y0: number, y1: number, c: string, rows: string) => (
    <g>
      <path d={`M${x0},${y0} L${x1},${y0 - 10} L${x1 + 30},${y1} L${x0 - 30},${y1 + 10} Z`} fill={c} stroke="#5b7a3a" strokeWidth={2.5} strokeLinejoin="round" />
      {Array.from({ length: 6 }, (_, i) => {
        const t = (i + 1) / 7;
        return <path key={i} d={`M${x0 - 30 * t},${y0 + (y1 - y0) * t} L${x1 + 30 * t},${y0 - 10 + (y1 - y0 + 10) * t}`} stroke={rows} strokeWidth={2} opacity={0.6} />;
      })}
    </g>
  );
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fbde3" />
          <stop offset="0.55" stopColor="#bfe0ef" />
          <stop offset="1" stopColor="#f6e3d0" />
        </linearGradient>
        <linearGradient id={`${id}-far`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a9caa0" />
          <stop offset="1" stopColor="#8fb985" />
        </linearGradient>
        <linearGradient id={`${id}-near`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8cc25f" />
          <stop offset="1" stopColor="#6aa543" />
        </linearGradient>
      </defs>
      <rect x={-300} y={-300} width={W + 600} height={H + 600} fill={`url(#${id}-sky)`} />
      <Blur id={`${id}-bf`} px={blur.far ?? 0}>
        <Cloud2 x={360 + f * 0.25} y={190} s={1.25} />
        <Cloud2 x={1380 + f * 0.18} y={140} s={0.95} />
        <Cloud2 x={900 + f * 0.32} y={330} s={0.6} />
        <Cloud2 x={1820 + f * 0.2} y={300} s={0.55} />
        {/* far ridge, the village, tree clumps */}
        <path d={`M-300,${hz} C100,${hz - 50} 500,${hz - 10} 860,${hz - 40} C1220,${hz - 70} 1600,${hz - 20} ${W + 300},${hz - 45} L${W + 300},${H + 300} L-300,${H + 300} Z`} fill={`url(#${id}-far)`} stroke="#6f8f66" strokeWidth={3} />
        {[60, 230, 330, 1560, 1700, 1860].map((x, i) => (
          <Clump key={x} x={x} y={hz - 10 - (i % 3) * 8} s={0.32 + (i % 2) * 0.06} c="#8db87a" d="#78a668" line="#5f7f57" lw={3} />
        ))}
        <g transform={`translate(1030,${hz - 26})`}>
          <House x={-150} y={0} w={86} h={52} line="#5d5048" lw={3} />
          <House x={-50} y={6} w={110} h={64} line="#5d5048" lw={3} />
          <House x={90} y={2} w={76} h={46} line="#5d5048" lw={3} />
          <rect x={196} y={-112} width={38} height={118} fill="#e9dcc0" stroke="#5d5048" strokeWidth={3} />
          <circle cx={215} cy={-80} r={9} fill="#fff" stroke="#5d5048" strokeWidth={2} />
          <path d="M190,-112 L215,-186 L240,-112 Z" fill="#6f8095" stroke="#5d5048" strokeWidth={3} strokeLinejoin="round" />
        </g>
      </Blur>
      <Blur id={`${id}-bm`} px={blur.mid ?? 0}>
        {/* patchwork: wheat and pasture, hedges between */}
        <path d={`M-300,${hz + 70} C300,${hz + 30} 900,${hz + 60} 1300,${hz + 40} C1600,${hz + 25} 1800,${hz + 40} ${W + 300},${hz + 30} L${W + 300},${H + 300} L-300,${H + 300} Z`} fill="#9cc66b" stroke="#5b7a3a" strokeWidth={3} />
        {field(-60, 520, hz + 70, hz + 150, "#e3c46a", "#c9a64c")}
        {field(560, 1080, hz + 60, hz + 140, "#a8cf74", "#8cb65e")}
        {field(1120, 1700, hz + 48, hz + 130, "#e8cd78", "#cfae55")}
        {field(1740, 2200, hz + 40, hz + 120, "#a2c96f", "#88b35a")}
        {Array.from({ length: 34 }, (_, i) => (
          <ellipse key={i} cx={-80 + i * 62} cy={hz + 66 - Math.sin(i / 3) * 8 - (i * 62 > 1100 ? 14 : 0)} rx={40} ry={20} fill="#5f8f3f" stroke="#3f5f2b" strokeWidth={3} />
        ))}
        {[180, 760, 1320, 1900].map((x, i) => (
          <Clump key={x} x={x} y={hz + 72 - (i % 2) * 12} s={0.55} c="#79b04f" d="#5f9440" line="#38512a" lw={4} />
        ))}
      </Blur>
      <Blur id={`${id}-bn`} px={blur.near ?? 0}>
        <path d={`M-300,${hz + 220} C400,${hz + 180} 1100,${hz + 210} ${W + 300},${hz + 180} L${W + 300},${H + 300} L-300,${H + 300} Z`} fill={`url(#${id}-near)`} stroke={LN} strokeWidth={5} />
        {road && (
          <path d={`M1240,${hz + 192} C1200,${hz + 260} 1040,${hz + 330} 1100,${hz + 410} C1150,${hz + 470} 1340,${hz + 520} 1400,${hz + 600} L1640,${hz + 600} C1500,${hz + 500} 1300,${hz + 450} 1270,${hz + 400} C1240,${hz + 330} 1340,${hz + 260} 1300,${hz + 190} Z`} fill="#dcc18c" stroke={LN} strokeWidth={5} strokeLinejoin="round" />
        )}
        {Array.from({ length: 70 }, (_, i) => {
          const x = hash(i) * (W + 200) - 100;
          const y = hz + 240 + hash(i + 7) * 300;
          const sc = 0.7 + ((y - hz) / 500) * 0.8;
          return (
            <path key={i} d={`M${x},${y} q-6,-18 -10,-24 M${x},${y} q2,-20 4,-30 M${x},${y} q8,-14 14,-20`} stroke="#4f8a32" strokeWidth={3.5 * sc} fill="none" strokeLinecap="round" transform={`translate(0,0)`} />
          );
        })}
        {poppies &&
          Array.from({ length: 26 }, (_, i) => {
            const x = hash(i + 40) * W;
            const y = hz + 250 + hash(i + 50) * 280;
            const r = 6 + ((y - hz) / 500) * 6;
            return (
              <g key={`p${i}`}>
                <line x1={x} y1={y} x2={x} y2={y + r * 2.4} stroke="#4f8a32" strokeWidth={3} />
                <circle cx={x} cy={y} r={r} fill="#d8362b" stroke={LN} strokeWidth={2.4} />
                <circle cx={x} cy={y} r={r * 0.3} fill="#2a1d1a" />
              </g>
            );
          })}
      </Blur>
    </g>
  );
};
