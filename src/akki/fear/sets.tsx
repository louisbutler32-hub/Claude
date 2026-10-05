import React from "react";
import { H, INK, W } from "../common";
import { rnd } from "./cast";

/**
 * Backdrops for "Zoro's Biggest Fear": the storm at sea (with the ship's deck), the
 * Marine bridge, the swordsman's rock, the sunny harbour, the market and the
 * treasure map. Flat cel colour, thick outlines, no gradients.
 */

const SW = 6;

/* ------------------------------------- the storm ------------------------------------- */

export const DECK_Y = 1560;

export const StormSea: React.FC<{ t: number; flash?: number; horizon?: number }> = ({ t, flash = 0, horizon = 1180 }) => (
  <g>
    <rect x={-400} y={-400} width={W + 800} height={H + 800} fill="#16203a" />
    <rect x={-400} y={380} width={W + 800} height={400} fill="#1f2e50" />
    <rect x={-400} y={780} width={W + 800} height={horizon - 780} fill="#2c4170" />
    {/* clouds */}
    {[[120, 330, 230], [560, 250, 280], [920, 470, 220], [330, 640, 260], [800, 800, 250], [90, 900, 200]].map(([x, y, r], i) => (
      <g key={i} transform={`translate(${x + Math.sin(t * 0.05 + i) * 14},${y})`}>
        {[[-0.7, 0.1, 0.55], [0, -0.2, 0.75], [0.7, 0.1, 0.6], [0.1, 0.25, 0.7]].map(([cx, cy, k], j) => <circle key={j} cx={cx * r} cy={cy * r} r={k * r * 0.62} fill={i % 2 ? "#3a4d7c" : "#2f4170"} stroke={INK} strokeWidth={SW} />)}
      </g>
    ))}
    {/* the sea */}
    <rect y={horizon} width={W} height={H - horizon} fill="#1b5779" stroke={INK} strokeWidth={SW} />
    {[0, 1, 2, 3, 4, 5].map((k) => {
      const y = horizon + 60 + k * 120;
      const amp = 26 + k * 9;
      return (
        <g key={k}>
          <path d={`M-60,${y} ${Array.from({ length: 8 }, (_, i) => `Q${i * 150 + 75 + Math.sin(t * 0.4 + k * 1.3) * 34},${y - amp} ${i * 150 + 150},${y}`).join(" ")} L1200,${y + 160} L-60,${y + 160}Z`} fill={k % 2 ? "#175170" : "#1d6286"} stroke={INK} strokeWidth={SW} />
          <path d={`M${40 + k * 90},${y - amp * 0.5} q30,-26 60,0 M${520 + k * 40},${y - amp * 0.4} q34,-28 68,0`} stroke="#d8f0ff" strokeWidth={8} fill="none" strokeLinecap="round" />
        </g>
      );
    })}
    {flash > 0 && <rect x={-400} y={-400} width={W + 800} height={H + 800} fill="#fff" opacity={0.3 * flash} />}
  </g>
);

export const Rain: React.FC<{ t: number; n?: number; o?: number }> = ({ t, n = 46, o = 0.5 }) => (
  <g stroke="#cfe6ff" strokeWidth={5} strokeLinecap="round" opacity={o}>
    {Array.from({ length: n }, (_, i) => {
      const x = rnd(i, 3) * 1300 - 100 - ((t * 60 + i * 37) % 200);
      const y = ((rnd(i, 4) * H + t * 190 + i * 53) % (H + 200)) - 100;
      return <path key={i} d={`M${x},${y} l-22,64`} />;
    })}
  </g>
);

export const Bolt: React.FC<{ x: number; k: number }> = ({ x, k }) => {
  if (k <= 0) return null;
  return (
    <g opacity={Math.min(1, k * 2)}>
      <path d={`M${x},0 L${x - 70},360 L${x - 10},370 L${x - 120},820 L${x + 20},470 L${x - 40},460 L${x + 60},0Z`} fill="#fffbd0" stroke="#fff" strokeWidth={6} strokeLinejoin="round" />
    </g>
  );
};

/** the ship: deck and hull in the foreground, mast to the left */
export const Ship: React.FC<{ t: number; mast?: boolean }> = ({ t, mast = true }) => (
  <g>
    {mast && (
      <g>
        <rect x={110} y={-200} width={44} height={DECK_Y + 200} fill="#8a5a30" stroke={INK} strokeWidth={SW} />
        <rect x={120} y={-200} width={12} height={DECK_Y + 200} fill="#a8723c" />
        <path d={`M154,210 Q330,${300 + Math.sin(t * 0.3) * 18} 300,610 Q170,${570} 154,580Z`} fill="#f2ece0" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <path d="M-40,880 L154,860 M-40,330 L154,350" stroke={INK} strokeWidth={5} />
      </g>
    )}
    {/* hull */}
    <path d={`M-60,${DECK_Y + 30} L1140,${DECK_Y + 30} L1100,${DECK_Y + 330} L-20,${DECK_Y + 330}Z`} fill="#6e4524" stroke={INK} strokeWidth={SW + 2} strokeLinejoin="round" />
    {[0, 1, 2].map((i) => <path key={i} d={`M-40,${DECK_Y + 100 + i * 80} L1120,${DECK_Y + 100 + i * 80}`} stroke="#4a2c14" strokeWidth={8} />)}
    {[180, 540, 900].map((x) => <circle key={x} cx={x} cy={DECK_Y + 150} r={42} fill="#2a3a5a" stroke={INK} strokeWidth={SW} />)}
    {/* deck lip */}
    <rect x={-60} y={DECK_Y - 4} width={1200} height={44} fill="#c48a4c" stroke={INK} strokeWidth={SW} />
    <rect x={-60} y={DECK_Y - 4} width={1200} height={12} fill="#e0a864" />
    {/* railing posts at the far edges */}
    {[-30, 280, 800, 1100].map((x) => <rect key={x} x={x - 14} y={DECK_Y - 130} width={28} height={130} fill="#8a5a30" stroke={INK} strokeWidth={SW} />)}
    <path d={`M-40,${DECK_Y - 110} Q500,${DECK_Y - 90} 1120,${DECK_Y - 110}`} stroke={INK} strokeWidth={9} fill="none" />
    <path d={`M-40,${DECK_Y - 112} Q500,${DECK_Y - 92} 1120,${DECK_Y - 112}`} stroke="#d8c090" strokeWidth={4} fill="none" />
  </g>
);

/** foam in front of the ship */
export const SeaFront: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <path d={`M-40,${DECK_Y + 250} ${Array.from({ length: 8 }, (_, i) => `Q${i * 150 + 75 + Math.sin(t * 0.5 + i) * 26},${DECK_Y + 200 + Math.sin(t * 0.4) * 14} ${i * 150 + 150},${DECK_Y + 250}`).join(" ")} L1200,${H + 20} L-40,${H + 20}Z`} fill="#16506f" stroke={INK} strokeWidth={SW + 2} />
    {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${i * 230 + 30 + Math.sin(t * 0.4 + i) * 20},${DECK_Y + 290} q36,-30 72,0`} stroke="#e8f6ff" strokeWidth={9} fill="none" strokeLinecap="round" />)}
  </g>
);

/* ------------------------------------- the bridge ------------------------------------- */

export const BRIDGE_Y = 1500;

export const BridgeSet: React.FC<{ t?: number }> = ({ t = 0 }) => (
  <g>
    <rect x={-400} y={-400} width={W + 800} height={H + 800} fill="#f4b266" />
    <rect x={-400} y={700} width={W + 800} height={500} fill="#f8c98a" />
    <circle cx={800} cy={760} r={190} fill="#ffe7a8" stroke={INK} strokeWidth={SW} />
    {/* fortress on the horizon */}
    <path d={`M-40,1180 L-40,820 L80,820 L80,760 L130,760 L130,820 L230,820 L230,700 L330,700 L330,1180Z`} fill="#9a8f9e" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={20 + i * 70} y={900} width={30} height={60} fill="#5a4f60" stroke={INK} strokeWidth={4} />)}
    <rect x={250} y={760} width={50} height={80} fill="#5a4f60" stroke={INK} strokeWidth={4} />
    {/* chasm and water under the bridge */}
    <rect x={-400} y={1180} width={W + 800} height={740} fill="#3a7ec0" stroke={INK} strokeWidth={SW} />
    {[0, 1, 2].map((i) => <path key={i} d={`M-40,${1640 + i * 90} q70,-30 140,0 t140,0 t140,0 t140,0 t140,0 t140,0 t140,0 t140,0`} stroke="#9fd4f5" strokeWidth={9} fill="none" />)}
    {/* stone parapet behind the runners */}
    <rect x={-40} y={1160} width={W + 80} height={250} fill="#c9bfae" stroke={INK} strokeWidth={SW} />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-30 + i * 100 - (i % 2) * 0} y={1150} width={76} height={34} fill="#c9bfae" stroke={INK} strokeWidth={5} />)}
    {Array.from({ length: 6 }, (_, r) => Array.from({ length: 12 }, (_, i) => <rect key={`${r}${i}`} x={-60 + i * 100 + (r % 2) * 50} y={1200 + r * 36} width={100} height={36} fill="none" stroke="#8f8574" strokeWidth={4} />))}
    {/* the bridge slab (seen from low) */}
    <rect x={-40} y={BRIDGE_Y - 40} width={W + 80} height={90} fill="#a89c88" stroke={INK} strokeWidth={SW + 1} />
    <rect x={-40} y={BRIDGE_Y - 40} width={W + 80} height={20} fill="#d3c8b4" />
    {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${i * 100 - 30 + (t % 1)},${BRIDGE_Y - 20} v70`} stroke="#6f6656" strokeWidth={4} />)}
    <path d={`M-40,${BRIDGE_Y + 50} Q540,${BRIDGE_Y + 160} 1120,${BRIDGE_Y + 50}`} fill="none" stroke={INK} strokeWidth={SW} />
  </g>
);

/* ------------------------------------- the rock ------------------------------------- */

export const RockSet: React.FC<{ t?: number }> = ({ t = 0 }) => (
  <g>
    <rect x={-400} y={-400} width={W + 800} height={H + 800} fill="#7a3a6a" />
    <rect x={-400} y={420} width={W + 800} height={420} fill="#b8486a" />
    <rect x={-400} y={840} width={W + 800} height={300} fill="#f08a4a" />
    <circle cx={300} cy={1010} r={240} fill="#ffd27a" stroke={INK} strokeWidth={SW} />
    <rect x={-400} y={1100} width={W + 800} height={H + 400 - 1100} fill="#2a5a8a" stroke={INK} strokeWidth={SW} />
    {[0, 1, 2, 3].map((k) => <path key={k} d={`M-40,${1240 + k * 140} ${Array.from({ length: 8 }, (_, i) => `Q${i * 150 + 75 + Math.sin(t * 0.3 + k) * 20},${1210 + k * 140} ${i * 150 + 150},${1240 + k * 140}`).join(" ")}`} stroke={k % 2 ? "#4a86b8" : "#1f4a76"} strokeWidth={10} fill="none" strokeLinecap="round" />)}
    {/* the big rock on the right */}
    <path d="M520,1560 L560,1180 L680,1120 L760,1000 L920,1020 L1120,960 L1120,1560Z" fill="#6a5a68" stroke={INK} strokeWidth={SW + 1} strokeLinejoin="round" />
    <path d="M760,1000 L920,1020 L1120,960 L1120,1060 L900,1100 L740,1080Z" fill="#8a7a88" />
    <path d="M600,1300 l60,-80 M760,1400 l70,-110 M900,1250 l-30,120" stroke="#3f3442" strokeWidth={6} fill="none" strokeLinecap="round" />
    {/* the little rock Zoro stands on */}
    <path d="M-40,1560 L-20,1440 L120,1380 L330,1400 L420,1460 L480,1560Z" fill="#6a5a68" stroke={INK} strokeWidth={SW + 1} strokeLinejoin="round" />
    <path d="M-20,1440 L120,1380 L330,1400 L420,1460 L200,1450 L40,1470Z" fill="#8a7a88" />
    <path d="M-40,1580 Q300,1500 560,1580 L600,1920 L-40,1920Z" fill="#1f4a76" stroke={INK} strokeWidth={SW} />
    <path d="M60,1640 q40,-26 80,0 M360,1700 q40,-26 80,0" stroke="#d8f0ff" strokeWidth={9} fill="none" strokeLinecap="round" />
  </g>
);

/* ------------------------------------- the harbour ------------------------------------- */

export const QUAY_Y = 1440;
const HOUSE = [
  { w: 260, h: 470, wall: "#f2a65a", wallS: "#d4823a", roof: "#c2412f" },
  { w: 230, h: 380, wall: "#7fc8a8", wallS: "#4fa07e", roof: "#a63a26" },
  { w: 280, h: 520, wall: "#f6e0a0", wallS: "#d8bc6a", roof: "#c2412f" },
  { w: 220, h: 340, wall: "#e87a6a", wallS: "#c24e40", roof: "#6a3a2a" },
];

const HouseBlock: React.FC<{ x: number; i: number }> = ({ x, i }) => {
  const h = HOUSE[i % HOUSE.length];
  const y0 = QUAY_Y - h.h;
  return (
    <g transform={`translate(${x},0)`}>
      <rect x={0} y={y0} width={h.w} height={h.h} fill={h.wall} stroke={INK} strokeWidth={SW} />
      <rect x={h.w * 0.62} y={y0} width={h.w * 0.38} height={h.h} fill={h.wallS} />
      <path d={`M-16,${y0} L${h.w / 2},${y0 - 120} L${h.w + 16},${y0}Z`} fill={h.roof} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      {[0, 1].map((r) => [0, 1].map((c) => (
        <g key={`${r}${c}`}>
          <rect x={34 + c * (h.w * 0.4)} y={y0 + 70 + r * 150} width={56} height={80} fill="#bfe8ff" stroke={INK} strokeWidth={5} />
          <path d={`M${34 + c * (h.w * 0.4) + 28},${y0 + 70 + r * 150} v80 M${34 + c * (h.w * 0.4)},${y0 + 110 + r * 150} h56`} stroke={INK} strokeWidth={3} />
          <rect x={26 + c * (h.w * 0.4)} y={y0 + 150 + r * 150} width={72} height={14} fill="#8a5a30" stroke={INK} strokeWidth={4} />
        </g>
      )))}
      <rect x={h.w / 2 - 36} y={QUAY_Y - 140} width={72} height={140} rx={8} fill="#7a4a28" stroke={INK} strokeWidth={5} />
    </g>
  );
};

/** wide sunny harbour: `scroll` slides the world; the lighthouse + sign sit only at world x≈0..1080 */
export const Harbour: React.FC<{ t?: number; k0?: number; k1?: number }> = ({ t = 0, k0 = -1, k1 = 2 }) => (
  <g>
    <rect x={-1200} y={-100} width={W * 4} height={H + 200} fill="#7fd4f5" />
    <rect x={-1200} y={480} width={W * 4} height={560} fill="#9adcf7" />
    <circle cx={880} cy={380} r={130} fill="#ffe66a" stroke={INK} strokeWidth={SW} />
    {/* sea band and quay */}
    <rect x={-1200} y={1000} width={W * 4} height={QUAY_Y - 1000} fill="#2a9bd1" stroke={INK} strokeWidth={SW} />
    {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${-1100 + i * 220 + Math.sin(t * 0.4 + i) * 16},${1090 + (i % 3) * 50} q30,-24 60,0 t60,0`} stroke="#bfeaff" strokeWidth={8} fill="none" strokeLinecap="round" />)}
    <rect x={-1200} y={QUAY_Y} width={W * 4} height={H - QUAY_Y + 600} fill="#e6c68e" stroke={INK} strokeWidth={SW} />
    <rect x={-1200} y={QUAY_Y} width={W * 4} height={26} fill="#f4dca8" />
    {Array.from({ length: 36 }, (_, i) => <path key={i} d={`M${-1200 + i * 150},${QUAY_Y + 40} l-90,${H}`} stroke="#c4a06a" strokeWidth={5} />)}
    {[1560, 1700, 1840].map((y, r) => Array.from({ length: 14 }, (_, i) => <path key={`${r}${i}`} d={`M${-1200 + i * 330 + r * 120},${y} h140`} stroke="#c4a06a" strokeWidth={5} />))}
    {/* buildings, repeating every 1080 */}
    {Array.from({ length: k1 - k0 + 1 }, (_, n) => {
      const k = k0 + n;
      return (
        <g key={k}>
          {k === 0 ? (
            <g>
              {/* the lighthouse: the landmark we come back to */}
              <path d={`M770,${QUAY_Y} L810,760 L930,760 L970,${QUAY_Y}Z`} fill="#f6f2ea" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
              <path d={`M796,900 L944,900 L952,1010 L788,1010Z M776,1190 L964,1190 L972,1290 L768,1290Z`} fill="#d83a3a" />
              <rect x={820} y={680} width={100} height={84} fill="#bfe8ff" stroke={INK} strokeWidth={SW} />
              <path d="M806,680 L870,600 L934,680Z" fill="#d83a3a" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
              <HouseBlock x={-30} i={0} />
              <HouseBlock x={250} i={1} />
              <HouseBlock x={500} i={3} />
            </g>
          ) : (
            <g>
              <HouseBlock x={k * W + 20} i={(k + 7) % 4} />
              <HouseBlock x={k * W + 320} i={(k + 8) % 4} />
              <HouseBlock x={k * W + 620} i={(k + 9) % 4} />
              <HouseBlock x={k * W + 880} i={(k + 10) % 4} />
            </g>
          )}
        </g>
      );
    })}
    {/* the signpost + barrels at the start */}
    <g>
      <rect x={598} y={1230} width={26} height={QUAY_Y - 1230 + 30} fill="#8a5a30" stroke={INK} strokeWidth={SW} />
      <path d="M470,1236 L690,1236 L730,1280 L690,1324 L470,1324Z" fill="#fffdf0" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <text x={594} y={1296} textAnchor="middle" fontFamily="Poppins Black" fontSize={44} fill={INK}>START</text>
    </g>
    <g>
      <ellipse cx={400} cy={QUAY_Y + 20} rx={50} ry={16} fill="#6a4020" stroke={INK} strokeWidth={5} />
      <path d={`M350,${QUAY_Y + 20} v-100 q50,-20 100,0 v100`} fill="#a8723c" stroke={INK} strokeWidth={SW} />
      <path d={`M350,${QUAY_Y - 60} q50,-16 100,0 M350,${QUAY_Y - 20} q50,-16 100,0`} stroke={INK} strokeWidth={5} fill="none" />
    </g>
  </g>
);

/** a wooden jetty over water (the "run over water" shot) */
export const Jetty: React.FC<{ t?: number }> = ({ t = 0 }) => (
  <g>
    <rect x={-400} y={-400} width={W + 800} height={H + 800} fill="#7fd4f5" />
    <rect x={-400} y={420} width={W + 800} height={440} fill="#9adcf7" />
    <circle cx={300} cy={520} r={120} fill="#ffe66a" stroke={INK} strokeWidth={SW} />
    <rect x={-400} y={860} width={W + 800} height={H + 400 - 860} fill="#2a9bd1" stroke={INK} strokeWidth={SW} />
    {[0, 1, 2, 3, 4, 5].map((k) => <path key={k} d={`M-60,${980 + k * 150} ${Array.from({ length: 9 }, (_, i) => `Q${i * 140 + 70 + Math.sin(t * 0.5 + k) * 30},${950 + k * 150} ${i * 140 + 140},${980 + k * 150}`).join(" ")}`} stroke={k % 2 ? "#7fd0f2" : "#1f7fb8"} strokeWidth={9 + k} fill="none" strokeLinecap="round" />)}
    {/* a far island and sails */}
    <path d="M700,860 Q820,740 960,860Z" fill="#5aa860" stroke={INK} strokeWidth={SW} />
    <path d="M160,860 L160,740 L250,860Z M270,860 L270,780 L330,860Z" fill="#fffdf0" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  </g>
);

/* ------------------------------------- the market ------------------------------------- */

export const MARKET_Y = 1500;

const Stall: React.FC<{ x: number; c1: string; c2: string; fruit: string; w?: number }> = ({ x, c1, c2, fruit, w = 340 }) => (
  <g transform={`translate(${x},${MARKET_Y}) scale(1.36) translate(0,${-MARKET_Y})`}>
    <rect x={10} y={MARKET_Y - 560} width={18} height={560} fill="#8a5a30" stroke={INK} strokeWidth={5} />
    <rect x={w - 28} y={MARKET_Y - 560} width={18} height={560} fill="#8a5a30" stroke={INK} strokeWidth={5} />
    <path d={`M-10,${MARKET_Y - 560} L${w + 10},${MARKET_Y - 560} L${w + 40},${MARKET_Y - 440} L-40,${MARKET_Y - 440}Z`} fill={c1} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${i * (w / 5) * 2 - 10},${MARKET_Y - 560} L${i * (w / 5) * 2 + w / 5 - 10},${MARKET_Y - 560} L${i * (w / 5) * 2 + w / 5 - 20},${MARKET_Y - 440} L${i * (w / 5) * 2 - 28},${MARKET_Y - 440}Z`} fill={c2} opacity={i * 2 < 5 ? 1 : 0} />)}
    {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${-40 + i * (w + 80) / 6},${MARKET_Y - 440} q${(w + 80) / 12},30 ${(w + 80) / 6},0`} fill={i % 2 ? c1 : c2} stroke={INK} strokeWidth={4} />)}
    <rect x={0} y={MARKET_Y - 230} width={w} height={150} fill="#a8723c" stroke={INK} strokeWidth={SW} />
    <rect x={0} y={MARKET_Y - 230} width={w} height={20} fill="#c48a4c" />
    <rect x={20} y={MARKET_Y - 80} width={w - 40} height={80} fill="#8a5a30" stroke={INK} strokeWidth={SW} />
    {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={46 + i * ((w - 92) / 5)} cy={MARKET_Y - 256 - (i % 2) * 10} r={26} fill={fruit} stroke={INK} strokeWidth={5} />)}
    {Array.from({ length: 5 }, (_, i) => <circle key={`b${i}`} cx={74 + i * ((w - 148) / 4)} cy={MARKET_Y - 290} r={26} fill={fruit} stroke={INK} strokeWidth={5} />)}
  </g>
);

export const MarketSet: React.FC<{ t?: number; k0?: number; k1?: number }> = ({ t = 0, k0 = -1, k1 = 2 }) => (
  <g>
    <rect x={-1200} y={-100} width={W * 4} height={H + 200} fill="#8fd8f6" />
    <rect x={-1200} y={500} width={W * 4} height={500} fill="#b4e6fa" />
    {/* far rooftops */}
    {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${-1200 + i * 300},1000 L${-1200 + i * 300},${820 + (i % 3) * 60} L${-1050 + i * 300},${740 + (i % 3) * 60} L${-900 + i * 300},${820 + (i % 3) * 60} L${-900 + i * 300},1000Z`} fill={["#f2a65a", "#e87a6a", "#f6e0a0"][i % 3]} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />)}
    <rect x={-1200} y={MARKET_Y - 20} width={W * 4} height={H} fill="#d8bd8a" stroke={INK} strokeWidth={SW} />
    {Array.from({ length: 40 }, (_, i) => <path key={i} d={`M${-1200 + i * 130},${MARKET_Y} l-100,${H}`} stroke="#b9996a" strokeWidth={5} />)}
    {Array.from({ length: k1 - k0 + 1 }, (_, n) => {
      const k = k0 + n;
      return (
        <g key={k}>
          <Stall x={k * W + 20} c1="#d83a3a" c2="#fff6e8" fruit="#ff8a1c" />
          <Stall x={k * W + 540} c1="#2e86d8" c2="#fff6e8" fruit="#ec4a4a" />
          {/* bunting */}
          <path d={`M${k * W - 40},640 Q${k * W + 260},760 ${k * W + 540},660 Q${k * W + 820},760 ${k * W + 1100},640`} stroke={INK} strokeWidth={5} fill="none" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${k * W + 20 + i * 120},${690 + Math.sin(i / 8 * Math.PI) * 50} l36,0 l-18,50Z`} fill={["#ffd23a", "#e8613a", "#2e86d8"][i % 3]} stroke={INK} strokeWidth={4} strokeLinejoin="round" />)}
          {/* crates between the stalls */}
          <g>
            <rect x={k * W + 486} y={MARKET_Y - 52} width={52} height={52} fill="#c48a4c" stroke={INK} strokeWidth={5} />
            <path d={`M${k * W + 486},${MARKET_Y - 26} h52 M${k * W + 512},${MARKET_Y - 52} v52`} stroke="#8a5a30" strokeWidth={4} />
          </g>
        </g>
      );
    })}
  </g>
);

/* ------------------------------------- the treasure map ------------------------------------- */

export const MapSet: React.FC = () => (
  <g>
    <rect x={-400} y={-400} width={W + 800} height={H + 800} fill="#e8d09a" />
    <rect x={40} y={330} width={W - 80} height={1500} fill="#f6e4b4" stroke={INK} strokeWidth={SW + 2} rx={14} />
    {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${70 + (i % 4) * 250},${400 + Math.floor(i / 4) * 340} q40,-60 80,0 t80,0`} stroke="#d4b47a" strokeWidth={5} fill="none" />)}
    {/* the harbour landmarks */}
    <path d="M540,1010 L540,1120" stroke={INK} strokeWidth={7} strokeLinecap="round" />
    <path d="M540,1010 L610,1034 L540,1060Z" fill="#d83a3a" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <text x={540} y={1170} textAnchor="middle" fontFamily="Poppins Black" fontSize={40} fill={INK}>START</text>
  </g>
);
