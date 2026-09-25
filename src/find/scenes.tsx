import React from "react";
import { random } from "remotion";
import { polyline, ribbon, spline, xAtY, type Pt } from "./geom";

/**
 * Two hand-drawn scenes, each with a path the animals stand on. A scene is
 * a background layer, a foreground layer (drawn over the animals — bushes
 * and flowers the front one brushes past) and ten slots along its path.
 *
 * Both are laid out in 1080×1920. Slots are chosen by height: the ground
 * line the animal stands on, with its scale falling off toward the horizon
 * so the far ones are the small ones a viewer has to hunt for.
 */

export const W = 1080;
export const H = 1920;

export type Slot = { x: number; y: number; s: number };

/** Scale of each of the ten, front to back — the reference's second duck
 *  is about half the first and the far ones are specks. */
const FALLOFF = [1, 0.55, 0.38, 0.29, 0.23, 0.19, 0.16, 0.135, 0.115, 0.1];

export type SceneSpec = {
  id: string;
  /** Word for the title's location line, if we ever want one. */
  name: string;
  Background: React.FC;
  Foreground: React.FC;
  slots: Slot[];
};

/* ------------------------------------------------------------------ */
/* shared bits                                                          */
/* ------------------------------------------------------------------ */

const Bush: React.FC<{
  cx: number;
  cy: number;
  r: number;
  seed: string;
  fills: string[];
  n?: number;
}> = ({ cx, cy, r, seed, fills, n = 9 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const a = random(`${seed}-a${i}`) * Math.PI * 2;
      const d = random(`${seed}-d${i}`) * r * 0.7;
      const rr = r * (0.45 + random(`${seed}-r${i}`) * 0.4);
      return (
        <circle
          key={i}
          cx={cx + Math.cos(a) * d}
          cy={cy + Math.sin(a) * d * 0.6}
          r={rr}
          fill={fills[i % fills.length]}
        />
      );
    })}
  </g>
);

const Palm: React.FC<{ x: number; y: number; h: number; lean: number; seed: string }> = ({
  x,
  y,
  h,
  lean,
  seed,
}) => {
  const topX = x + lean;
  const topY = y - h;
  const fronds = 8;
  return (
    <g>
      <path
        d={`M ${x - h * 0.04} ${y} Q ${x + lean * 0.4} ${y - h * 0.55} ${topX} ${topY}`}
        fill="none"
        stroke="#2c2018"
        strokeWidth={h * 0.06}
        strokeLinecap="round"
      />
      {Array.from({ length: fronds }, (_, i) => {
        const ang = -200 + (i / (fronds - 1)) * 220 + (random(`${seed}${i}`) - 0.5) * 18;
        const len = h * (0.38 + random(`${seed}l${i}`) * 0.16);
        return (
          <g key={i} transform={`translate(${topX} ${topY}) rotate(${ang})`}>
            <path
              d={`M 0 0 Q ${len * 0.45} ${-len * 0.3} ${len} ${len * 0.18} Q ${len * 0.5} ${len * 0.22} 0 0 Z`}
              fill={i % 2 ? "#2f6a33" : "#3e8a41"}
              stroke="#1f4a24"
              strokeWidth={2}
            />
          </g>
        );
      })}
    </g>
  );
};

const RoundTree: React.FC<{ x: number; y: number; r: number; seed: string }> = ({ x, y, r, seed }) => (
  <g>
    <rect x={x - r * 0.1} y={y - r * 0.4} width={r * 0.2} height={r * 0.6} fill="#5a3b28" />
    <Bush cx={x} cy={y - r * 0.9} r={r} seed={seed} fills={["#3f7f30", "#4f9438", "#63a845"]} n={10} />
    <Bush cx={x - r * 0.2} cy={y - r * 1.1} r={r * 0.6} seed={`${seed}hi`} fills={["#78b84e", "#6cae46"]} n={5} />
  </g>
);

/* ------------------------------------------------------------------ */
/* lake — misty jungle, wooden walkway out to a palm island             */
/* ------------------------------------------------------------------ */

const LAKE_TOP = 1010; // where the walkway meets the island
const WALK_HALF_BOTTOM = 340;
const WALK_HALF_TOP = 36;
const walkHalf = (y: number) =>
  WALK_HALF_TOP + (WALK_HALF_BOTTOM - WALK_HALF_TOP) * ((y - LAKE_TOP) / (H - LAKE_TOP)) ** 1.15;

const LakeBackground: React.FC = () => {
  const plankYs: number[] = [];
  for (let k = 0; k <= 26; k++) plankYs.push(LAKE_TOP + (H + 60 - LAKE_TOP) * (k / 26) ** 2.1);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="lkSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a5b1b4" />
          <stop offset="0.45" stopColor="#c9d2d0" />
          <stop offset="1" stopColor="#e2e6e1" />
        </linearGradient>
        <linearGradient id="lkFarMtn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a9c92" />
          <stop offset="1" stopColor="#5f7566" />
        </linearGradient>
        <linearGradient id="lkMist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dfe5e2" stopOpacity="0" />
          <stop offset="0.5" stopColor="#dfe5e2" stopOpacity="0.75" />
          <stop offset="1" stopColor="#dfe5e2" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lkWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a7757" />
          <stop offset="1" stopColor="#5e8f61" />
        </linearGradient>
        <linearGradient id="lkWood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2a1f" />
          <stop offset="1" stopColor="#4d3627" />
        </linearGradient>
        <filter id="lkBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <clipPath id="lkWalk">
          <polygon
            points={`${540 - WALK_HALF_BOTTOM - 20},${H + 60} ${540 + WALK_HALF_BOTTOM + 20},${H + 60} ${540 + WALK_HALF_TOP},${LAKE_TOP} ${540 - WALK_HALF_TOP},${LAKE_TOP}`}
          />
        </clipPath>
      </defs>

      <rect width={W} height={H} fill="url(#lkSky)" />

      {/* far mountains in mist */}
      <path
        d="M -50 640 L 120 470 Q 260 330 420 300 Q 600 240 760 130 Q 900 60 1130 190 L 1130 700 Z"
        fill="url(#lkFarMtn)"
      />
      <path d="M -50 560 Q 120 400 300 440 Q 420 460 520 560 L 520 720 L -50 720 Z" fill="#56705f" />
      <rect x={0} y={150} width={W} height={420} fill="url(#lkMist)" />
      <rect x={0} y={380} width={W} height={300} fill="url(#lkMist)" opacity={0.7} />

      {/* forested hills */}
      <path
        d="M -50 720 Q 100 600 260 640 Q 380 560 520 620 Q 660 540 800 600 Q 940 560 1130 660 L 1130 820 L -50 820 Z"
        fill="#3b5a3e"
      />
      {Array.from({ length: 70 }, (_, i) => (
        <circle
          key={i}
          cx={random(`lkc${i}`) * W}
          cy={640 + random(`lky${i}`) * 150}
          r={14 + random(`lkr${i}`) * 26}
          fill={i % 3 ? "#456a46" : "#3a5c3c"}
        />
      ))}
      <path d="M -50 790 Q 540 740 1130 790 L 1130 860 L -50 860 Z" fill="#2f4d33" />

      {/* lake */}
      <rect x={0} y={800} width={W} height={H - 800} fill="url(#lkWater)" />
      {Array.from({ length: 30 }, (_, i) => (
        <path
          key={i}
          d={`M ${random(`lkw${i}`) * W} ${880 + random(`lkwy${i}`) * 900} q 60 -4 ${80 + random(`lkwl${i}`) * 200} 0`}
          fill="none"
          stroke="#8bb98a"
          strokeWidth={2}
          opacity={0.25}
        />
      ))}

      {/* island reflection */}
      <g transform={`translate(0 ${1960}) scale(1 -1)`} opacity={0.32} filter="url(#lkBlur)">
        <ellipse cx={540} cy={930} rx={370} ry={60} fill="#2f5a31" />
        <Bush cx={540} cy={900} r={150} seed="isl-r" fills={["#3f7a38", "#4d8a42"]} n={12} />
        <Palm x={380} y={900} h={330} lean={-40} seed="pr1" />
        <Palm x={470} y={890} h={380} lean={30} seed="pr2" />
        <Palm x={620} y={895} h={350} lean={40} seed="pr3" />
        <Palm x={720} y={905} h={300} lean={-20} seed="pr4" />
      </g>

      {/* island */}
      <ellipse cx={540} cy={950} rx={380} ry={70} fill="#2e5a30" />
      <Palm x={380} y={900} h={330} lean={-40} seed="p1" />
      <Palm x={470} y={890} h={380} lean={30} seed="p2" />
      <Palm x={620} y={895} h={350} lean={40} seed="p3" />
      <Palm x={720} y={905} h={300} lean={-20} seed="p4" />
      <Palm x={560} y={910} h={260} lean={-10} seed="p5" />
      <Bush cx={330} cy={920} r={120} seed="isl-a" fills={["#4c7f3c", "#5f9a4a", "#3d6e33"]} n={12} />
      <Bush cx={760} cy={925} r={130} seed="isl-b" fills={["#4c7f3c", "#5f9a4a", "#3d6e33"]} n={12} />
      <Bush cx={540} cy={975} r={110} seed="isl-c" fills={["#5f9a4a", "#6faa54", "#4c7f3c"]} n={10} />
      {/* little railing landing on the island */}
      <rect x={490} y={960} width={100} height={46} fill="#3a2a1f" />
      <path d="M 486 960 l 0 -40 M 590 960 l 0 -40 M 486 930 l 104 0" stroke="#2c2018" strokeWidth={6} fill="none" />

      {/* walkway */}
      <polygon
        points={`${540 - WALK_HALF_BOTTOM - 20},${H + 60} ${540 + WALK_HALF_BOTTOM + 20},${H + 60} ${540 + WALK_HALF_TOP},${LAKE_TOP} ${540 - WALK_HALF_TOP},${LAKE_TOP}`}
        fill="url(#lkWood)"
      />
      <g clipPath="url(#lkWalk)">
        {plankYs.map((y, k) => {
          const next = plankYs[k + 1] ?? H + 80;
          return (
            <g key={k}>
              <rect x={0} y={y} width={W} height={Math.max(2, next - y)} fill={k % 2 ? "#5a4131" : "#4e3829"} />
              <rect x={0} y={y} width={W} height={Math.max(1.5, (next - y) * 0.12)} fill="#6d5140" opacity={0.8} />
              <rect x={0} y={next - Math.max(1.5, (next - y) * 0.1)} width={W} height={Math.max(1.5, (next - y) * 0.1)} fill="#2a1c13" opacity={0.9} />
            </g>
          );
        })}
        {/* wet sheen down the middle */}
        <polygon
          points={`${540 - 120},${H} ${540 + 120},${H} ${540 + 12},${LAKE_TOP} ${540 - 12},${LAKE_TOP}`}
          fill="#c9d5cc"
          opacity={0.08}
        />
      </g>
      {/* railings */}
      {[-1, 1].map((side) => (
        <g key={side}>
          {plankYs
            .filter((_, k) => k % 2 === 0)
            .map((y, k) => {
              const hh = walkHalf(y);
              const x = 540 + side * hh;
              const ph = 40 + (y - LAKE_TOP) * 0.22;
              return (
                <g key={k}>
                  <rect x={x - 6 - ph * 0.04} y={y - ph} width={12 + ph * 0.08} height={ph} rx={3} fill="#2a1d14" />
                  <rect x={x - 6 - ph * 0.04} y={y - ph} width={4} height={ph} fill="#4a3526" opacity={0.6} />
                </g>
              );
            })}
          <polyline
            points={polyline(
              plankYs.filter((_, k) => k % 2 === 0).map((y) => ({ x: 540 + side * walkHalf(y), y: y - (40 + (y - LAKE_TOP) * 0.22) }))
            )}
            fill="none"
            stroke="#2a1d14"
            strokeWidth={10}
            strokeLinejoin="round"
          />
          <polyline
            points={polyline(
              plankYs.filter((_, k) => k % 2 === 0).map((y) => ({ x: 540 + side * walkHalf(y), y: y - (40 + (y - LAKE_TOP) * 0.22) * 0.55 }))
            )}
            fill="none"
            stroke="#2a1d14"
            strokeWidth={7}
            strokeLinejoin="round"
          />
        </g>
      ))}
    </svg>
  );
};

const LakeForeground: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
    {/* left bank */}
    <Bush cx={-20} cy={1300} r={150} seed="fgL0" fills={["#2f5e2e", "#3b7236"]} n={10} />
    <Bush cx={0} cy={1540} r={190} seed="fgL1" fills={["#2f5e2e", "#3f7a38", "#58944a"]} n={12} />
    <Bush cx={-40} cy={1800} r={230} seed="fgL2" fills={["#24512a", "#2f5e2e", "#3f7a38"]} n={12} />
    <Bush cx={60} cy={1990} r={200} seed="fgL3" fills={["#1f4524", "#2f5e2e"]} n={10} />
    {/* right bank */}
    <Bush cx={1100} cy={1220} r={140} seed="fgR0" fills={["#2f5e2e", "#3b7236"]} n={10} />
    <Bush cx={1090} cy={1470} r={190} seed="fgR1" fills={["#2f5e2e", "#3f7a38", "#58944a"]} n={12} />
    <Bush cx={1120} cy={1740} r={230} seed="fgR2" fills={["#24512a", "#2f5e2e", "#3f7a38"]} n={12} />
    <Bush cx={1030} cy={1990} r={200} seed="fgR3" fills={["#1f4524", "#2f5e2e"]} n={10} />
    {/* big leaves */}
    {Array.from({ length: 18 }, (_, i) => {
      const left = i % 2 === 0;
      const x = left ? -20 + random(`lfx${i}`) * 170 : 930 + random(`lfx${i}`) * 170;
      const y = 1250 + random(`lfy${i}`) * 700;
      const ang = (left ? -30 : 210) + (random(`lfa${i}`) - 0.5) * 80;
      const len = 90 + random(`lfl${i}`) * 90;
      return (
        <g key={i} transform={`translate(${x} ${y}) rotate(${ang})`}>
          <path
            d={`M 0 0 Q ${len * 0.5} ${-len * 0.3} ${len} 0 Q ${len * 0.5} ${len * 0.3} 0 0 Z`}
            fill={i % 3 ? "#4f9142" : "#3b7a36"}
            stroke="#1f4524"
            strokeWidth={3}
          />
          <path d={`M 4 0 L ${len - 6} 0`} stroke="#1f4524" strokeWidth={2} opacity={0.6} />
        </g>
      );
    })}
  </svg>
);

const lakeSlots = (): Slot[] => {
  const ys = [1950, 1610, 1440, 1340, 1272, 1220, 1178, 1144, 1116, 1092];
  const side = [0.1, -0.4, 0.4, -0.25, 0.35, -0.35, 0.3, -0.3, 0.25, -0.2];
  return ys.map((y, i) => ({ x: 540 + side[i] * walkHalf(y) * 0.9, y, s: FALLOFF[i] }));
};

export const LAKE: SceneSpec = {
  id: "lake",
  name: "the jungle lake",
  Background: LakeBackground,
  Foreground: LakeForeground,
  slots: lakeSlots(),
};

/* ------------------------------------------------------------------ */
/* meadow — alpine pasture, gravel lane winding up between the hills    */
/* ------------------------------------------------------------------ */

const MEADOW_LANE = spline(
  [
    { x: 300, y: 2000 },
    { x: 380, y: 1820 },
    { x: 560, y: 1600 },
    { x: 640, y: 1440 },
    { x: 520, y: 1300 },
    { x: 470, y: 1190 },
    { x: 560, y: 1095 },
    { x: 690, y: 1020 },
    { x: 780, y: 975 },
  ],
  20
);
const laneHalf = (y: number) => 26 + 250 * Math.max(0, (y - 975) / (2000 - 975)) ** 1.25;

const MeadowBackground: React.FC = () => {
  const lanePoly = ribbon(MEADOW_LANE, (i) => laneHalf(MEADOW_LANE[i].y));
  const laneEdge = ribbon(MEADOW_LANE, (i) => laneHalf(MEADOW_LANE[i].y) + 10);
  const fencePosts = MEADOW_LANE.filter((p, i) => i % 6 === 0 && p.y < 1650 && p.y > 1000);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="mdSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fc0e2" />
          <stop offset="0.6" stopColor="#d7e3ea" />
          <stop offset="1" stopColor="#f6dcc0" />
        </linearGradient>
        <radialGradient id="mdSun" cx="0.85" cy="0.1" r="0.6">
          <stop offset="0" stopColor="#fff2cf" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff2cf" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mdMtn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8d9fb8" />
          <stop offset="1" stopColor="#6f8199" />
        </linearGradient>
        <linearGradient id="mdHaze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3e2d0" stopOpacity="0" />
          <stop offset="1" stopColor="#f3e2d0" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="mdHillFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9ccb58" />
          <stop offset="1" stopColor="#7fb03e" />
        </linearGradient>
        <linearGradient id="mdHillNear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a6d45e" />
          <stop offset="1" stopColor="#6fa237" />
        </linearGradient>
        <linearGradient id="mdGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8cc04a" />
          <stop offset="1" stopColor="#5f9634" />
        </linearGradient>
      </defs>

      <rect width={W} height={H} fill="url(#mdSky)" />
      <rect width={W} height={900} fill="url(#mdSun)" />

      {/* snowy peaks */}
      <path
        d="M -50 560 L 90 470 L 180 500 L 300 380 L 400 440 L 520 330 L 640 420 L 760 340 L 880 430 L 980 380 L 1130 480 L 1130 640 L -50 640 Z"
        fill="url(#mdMtn)"
      />
      <g fill="#f2f5f8">
        <path d="M 300 380 L 260 430 L 290 420 L 320 445 L 350 425 L 340 400 Z" />
        <path d="M 520 330 L 470 390 L 505 375 L 540 400 L 575 380 L 560 360 Z" />
        <path d="M 760 340 L 720 385 L 750 375 L 780 400 L 805 375 L 795 360 Z" />
        <path d="M 980 380 L 950 410 L 975 405 L 1000 425 L 1020 405 Z" />
      </g>
      <rect x={0} y={420} width={W} height={230} fill="url(#mdHaze)" />

      {/* tree line */}
      <path
        d={`M -50 640 ${Array.from({ length: 40 }, (_, i) => `L ${i * 30} ${600 + (i % 2 ? 0 : 26) + random(`tl${i}`) * 14}`).join(" ")} L 1130 640 L 1130 720 L -50 720 Z`}
        fill="#3b6a37"
      />

      {/* rolling hills */}
      <path d="M -50 700 Q 300 620 620 690 Q 900 740 1130 660 L 1130 900 L -50 900 Z" fill="url(#mdHillFar)" />
      <path d="M -50 760 Q 200 700 460 780 Q 700 850 1130 760 L 1130 1000 L -50 1000 Z" fill="#8cc24a" />
      <path d="M -50 900 Q 300 800 700 880 Q 950 930 1130 860 L 1130 1100 L -50 1100 Z" fill="url(#mdHillNear)" />
      {/* the pasture the lane runs through */}
      <rect x={0} y={1000} width={W} height={H - 1000} fill="url(#mdGround)" />
      <path d="M -50 1000 Q 400 940 1130 1010 L 1130 1100 L -50 1100 Z" fill="#8cc04a" />
      {/* hill highlight sweeps */}
      <path d="M 700 1180 Q 950 1080 1130 1120 L 1130 1300 Q 900 1230 700 1300 Z" fill="#a4d05e" opacity={0.5} />
      <path d="M -50 1250 Q 150 1150 330 1240 L 330 1400 Q 150 1330 -50 1420 Z" fill="#a4d05e" opacity={0.45} />

      {/* farmhouse on the far hill */}
      <g transform="translate(700 690)">
        <rect x={0} y={0} width={70} height={40} fill="#ead9c0" stroke="#7a5a44" strokeWidth={2} />
        <path d="M -8 0 L 35 -32 L 78 0 Z" fill="#b83a2c" />
        <rect x={12} y={12} width={12} height={12} fill="#6b8bb8" />
        <rect x={46} y={12} width={12} height={12} fill="#6b8bb8" />
        <rect x={52} y={-30} width={8} height={16} fill="#6a4a3a" />
      </g>

      {/* trees */}
      <RoundTree x={130} y={1040} r={190} seed="tA" />
      <RoundTree x={920} y={760} r={70} seed="tB" />
      <RoundTree x={1010} y={840} r={90} seed="tC" />
      <RoundTree x={340} y={760} r={55} seed="tD" />
      <RoundTree x={820} y={640} r={40} seed="tE" />
      <RoundTree x={1040} y={1140} r={120} seed="tF" />

      {/* the lane */}
      <polygon points={laneEdge} fill="#9ea67a" opacity={0.9} />
      <polygon points={lanePoly} fill="#d9d3c5" />
      <polygon points={ribbon(MEADOW_LANE, (i) => laneHalf(MEADOW_LANE[i].y) * 0.22)} fill="#7fa64a" opacity={0.55} />
      {Array.from({ length: 220 }, (_, i) => {
        const p = MEADOW_LANE[Math.floor(random(`gv${i}`) * MEADOW_LANE.length)];
        const h = laneHalf(p.y);
        const off = (random(`go${i}`) - 0.5) * 2 * h * 0.9;
        return (
          <circle
            key={i}
            cx={p.x + off}
            cy={p.y + (random(`gy${i}`) - 0.5) * 12}
            r={1.5 + random(`gr${i}`) * h * 0.02}
            fill={i % 2 ? "#b8b09f" : "#ece8de"}
          />
        );
      })}

      {/* fence along the left of the lane */}
      <polyline
        points={polyline(fencePosts.map((p) => ({ x: p.x - laneHalf(p.y) - 40, y: p.y - 30 - (p.y - 975) * 0.13 })))}
        fill="none"
        stroke="#4a3526"
        strokeWidth={3}
      />
      <polyline
        points={polyline(fencePosts.map((p) => ({ x: p.x - laneHalf(p.y) - 40, y: p.y - 12 - (p.y - 975) * 0.06 })))}
        fill="none"
        stroke="#4a3526"
        strokeWidth={3}
      />
      {fencePosts.map((p, i) => {
        const ph = 40 + (p.y - 975) * 0.14;
        const pw = 6 + (p.y - 975) * 0.012;
        return <rect key={i} x={p.x - laneHalf(p.y) - 40 - pw / 2} y={p.y - ph} width={pw} height={ph} rx={2} fill="#6b4a33" />;
      })}
      {/* meadow specks in the mid-ground */}
      {Array.from({ length: 90 }, (_, i) => {
        const y = 1020 + random(`sy${i}`) * 500;
        const x = random(`sx${i}`) * W;
        const near = xAtY(MEADOW_LANE, y);
        if (Math.abs(x - near) < laneHalf(y) + 30) return null;
        return <circle key={i} cx={x} cy={y} r={2 + (y - 1000) * 0.006} fill={i % 3 ? "#f4c542" : "#fff6e8"} opacity={0.9} />;
      })}
    </svg>
  );
};

const MeadowForeground: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
    {/* grass tufts both verges */}
    {Array.from({ length: 90 }, (_, i) => {
      const right = i % 3 !== 0;
      const y = 1350 + random(`gty${i}`) * 600;
      const x = right ? 800 + random(`gtx${i}`) * 300 : random(`gtx${i}`) * 110;
      const h = 30 + random(`gth${i}`) * 60 * ((y - 1100) / 800);
      return (
        <path
          key={i}
          d={`M ${x} ${y} q ${-h * 0.2} ${-h * 0.6} ${h * 0.1} ${-h} M ${x + 10} ${y} q ${h * 0.25} ${-h * 0.5} ${h * 0.4} ${-h * 0.9}`}
          fill="none"
          stroke={i % 3 ? "#5f9a38" : "#4f8a30"}
          strokeWidth={4}
          strokeLinecap="round"
        />
      );
    })}
    {/* dandelions on the right verge */}
    {Array.from({ length: 48 }, (_, i) => {
      const y = 1380 + random(`dy${i}`) * 560;
      const x = 790 + random(`dx${i}`) * 310;
      const r = 8 + random(`dr${i}`) * 12 * ((y - 1100) / 800);
      const pink = i % 7 === 0;
      return (
        <g key={i}>
          <path d={`M ${x} ${y + r} l 2 ${r * 2.2}`} stroke="#4f8a30" strokeWidth={3} />
          <circle cx={x} cy={y} r={r} fill={pink ? "#e98ab0" : "#f5c842"} />
          <circle cx={x} cy={y} r={r * 0.45} fill={pink ? "#f7c6da" : "#e5a92c"} />
        </g>
      );
    })}
    {/* a few white daisies on the left */}
    {Array.from({ length: 16 }, (_, i) => {
      const y = 1500 + random(`wy${i}`) * 420;
      const x = random(`wx${i}`) * 110;
      const r = 7 + random(`wr${i}`) * 8;
      return (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill="#fff8ee" />
          <circle cx={x} cy={y} r={r * 0.4} fill="#f2c94c" />
        </g>
      );
    })}
  </svg>
);

const meadowSlots = (): Slot[] => {
  const ys = [1930, 1600, 1430, 1330, 1262, 1210, 1168, 1134, 1106, 1082];
  const side = [0.1, 0.6, -0.5, 0.45, -0.55, 0.5, -0.45, 0.45, -0.35, 0.35];
  return ys.map((y, i) => ({ x: xAtY(MEADOW_LANE, y) + side[i] * laneHalf(y) * 0.8, y, s: FALLOFF[i] }));
};

export const MEADOW: SceneSpec = {
  id: "meadow",
  name: "the mountain meadow",
  Background: MeadowBackground,
  Foreground: MeadowForeground,
  slots: meadowSlots(),
};

export const SCENES = { lake: LAKE, meadow: MEADOW } as const;
export type SceneId = keyof typeof SCENES;
