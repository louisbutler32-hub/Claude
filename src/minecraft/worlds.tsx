import React from "react";
import { random } from "remotion";
import { H, PANEL_TOP, W } from "./beats";
import { aerial as A, cave as C, house as HS, lava as L, over as O, room as R, torch as T, tunnel as TN } from "./palette";
import { DeadBush, Item, OpenChest, Plush, Poppy, Sign, TreeTop } from "./pixels";

/**
 * The backgrounds, one per location, all drawn in full-frame coordinates
 * (the picture starts at y = PANEL_TOP). Everything is flat fills with
 * thick black outlines, the way the original is drawn.
 */

const LINE = { fill: "none", stroke: "#000", strokeWidth: 14, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** Short horizontal streaks that give flat stone some grain. */
export const Streaks: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  n: number;
  seed: string;
  light: string;
  dark: string;
  len?: number;
}> = ({ x, y, w, h, n, seed, light, dark, len = 90 }) => (
  <g strokeLinecap="round" strokeWidth={9} opacity={0.75}>
    {Array.from({ length: n }, (_, i) => {
      const sx = x + random(`${seed}x${i}`) * w;
      const sy = y + random(`${seed}y${i}`) * h;
      const l = len * (0.4 + random(`${seed}l${i}`));
      return <line key={i} x1={sx} y1={sy} x2={Math.min(x + w, sx + l)} y2={sy} stroke={i % 2 ? light : dark} />;
    })}
  </g>
);

const OreBlobs: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M120,60 q40,-30 90,-10 q30,20 -10,36 q-50,10 -80,-26 z" fill={C.oreBlob} />
    <path d="M200,140 q60,-40 150,-10 q40,24 -20,44 q-90,20 -130,-34 z" fill={C.oreBlob2} />
    <path d="M60,190 q20,-30 60,-14 q26,20 -8,34 q-40,6 -52,-20 z" fill={C.oreBlob} />
    <path d="M170,220 q50,-24 120,-6 q24,18 -14,30 q-80,14 -106,-24 z" fill={C.oreBlob2} />
    <path d="M90,280 q60,-50 170,-20 q50,30 -20,60 q-100,20 -150,-40 z" fill={C.oreBlob} />
    <path d="M300,290 q30,-20 70,-6 q20,16 -10,26 q-50,8 -60,-20 z" fill={C.oreBlob2} />
  </g>
);

const CoalSpecks: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`} fill={C.coal}>
    <rect x={0} y={0} width={70} height={26} rx={12} />
    <rect x={110} y={6} width={60} height={22} rx={11} />
    <rect x={150} y={-18} width={46} height={20} rx={10} />
    <rect x={40} y={48} width={90} height={26} rx={13} />
    <rect x={16} y={90} width={34} height={22} rx={11} />
    <rect x={70} y={104} width={60} height={24} rx={12} />
    <circle cx={90} cy={64} r={6} />
    <rect x={10} y={128} width={80} height={26} rx={13} />
    <rect x={52} y={150} width={24} height={18} rx={9} />
    <circle cx={100} cy={122} r={5} />
  </g>
);

/** The cave where it all happens — wide shot. */
export const CaveWide: React.FC = () => (
  <g>
    <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill={C.base} />
    <rect x={430} y={PANEL_TOP} width={310} height={810} fill={C.recess} />
    <Streaks x={440} y={560} w={290} h={620} n={10} seed="rc" light="#4f4f4f" dark="#424242" />
    {/* the near, lighter stone on the left */}
    <path d={`M0,${PANEL_TOP} H430 V670 H240 V860 H60 V1030 H430 V1380 H0 Z`} fill={C.light} />
    <Streaks x={10} y={420} w={410} h={600} n={16} seed="ls" light={C.streakLight} dark="#474747" />
    {/* the gold ore block he was mining */}
    <rect x={0} y={1030} width={430} height={350} fill={C.ore} />
    <Streaks x={10} y={1040} w={410} h={330} n={12} seed="ore" light="#6a6a6a" dark="#525252" len={70} />
    <OreBlobs x={-20} y={1030} scale={1.2} />
    <CoalSpecks x={490} y={PANEL_TOP} />
    {/* right wall, in shadow */}
    <rect x={740} y={PANEL_TOP} width={340} height={810} fill="#454545" />
    <path d="M740,740 H940 V660 H1080 V1200 H740 Z" fill={C.rightWall} />
    <Streaks x={760} y={760} w={300} h={420} n={8} seed="rw" light="#3a3a3a" dark="#262626" />
    {/* floor */}
    <rect x={0} y={1200} width={W} height={H - 1200} fill={C.floor} />
    <Streaks x={10} y={1230} w={1060} h={660} n={26} seed="fl" light="#5a5a5a" dark="#444444" len={120} />
    <path d="M540,1200 V1130 H700 V1200 Z" fill="#4a4a4a" />
    <path d="M700,1690 H1080 V1920 H880 Z" fill={C.ramp} />
    <Streaks x={760} y={1720} w={300} h={180} n={6} seed="rp" light="#646464" dark="#4c4c4c" />
    {/* outlines */}
    <path d={`M430,${PANEL_TOP} V670 H240 V860 H60 V1030 H430 V1380 H0`} {...LINE} />
    <path d="M740,1200 V740 H940 V660 H1080" {...LINE} />
    <path d="M430,1206 H1080" {...LINE} />
    <path d="M540,1200 V1130 H700 V1200" {...LINE} strokeWidth={10} />
    <path d="M680,1690 H1080 M700,1690 L880,1920" {...LINE} />
  </g>
);

/** The cave from lower down — the close-up of the stuff still on the ledge. */
export const CaveCloseup: React.FC = () => (
  <g>
    <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#4a4a4a" />
    <Streaks x={10} y={900} w={1060} h={1000} n={30} seed="cc" light="#565656" dark="#3f3f3f" len={140} />
    {/* the near stone, right */}
    <path d="M360,870 V740 H500 V640 H630 V760 H730 V920 H920 V1090 H1080 V1920 H0 V870 Z" fill={C.light} />
    <Streaks x={620} y={480} w={450} h={600} n={14} seed="cr" light="#5c5c5c" dark="#454545" />
    <path d="M620,397 H1080 V1090 H920 V920 H730 V760 H630 Z" fill="#505050" />
    <Streaks x={640} y={420} w={430} h={640} n={12} seed="cr2" light="#5b5b5b" dark="#464646" />
    {/* the dark recess up and left */}
    <path d={`M0,${PANEL_TOP} H400 V470 H580 V640 H500 V730 H100 V620 H0 Z`} fill="#262626" />
    {/* ore */}
    <rect x={360} y={740} width={140} height={130} fill={C.ore} />
    <OreBlobs x={330} y={720} scale={0.42} />
    {/* the ledge the stuff sits on */}
    <path d="M0,870 H360" fill="none" stroke="#000" strokeWidth={12} />
    {/* outlines */}
    <path d={`M400,${PANEL_TOP} V470 H580 V640 H500 V730 H100 V620 H0`} {...LINE} />
    <path d="M360,870 V740 H500 V640 H630 V760 H730 V920 H920 V1090 H1080" {...LINE} />
    <path d="M630,397 V640" {...LINE} strokeWidth={10} />
    {/* the stuff, small and far */}
    <Item name="ironIngot" x={8} y={880} px={5} rotate={-10} />
    <Item name="redstone" x={40} y={826} px={5} />
    <Item name="bucket" x={108} y={828} px={5} />
    <Item name="bread" x={160} y={880} px={5} rotate={-20} />
    <Item name="goldApple" x={190} y={836} px={5} />
    <Item name="goldIngot" x={230} y={868} px={5} rotate={-8} />
    <Item name="pickaxe" x={310} y={876} px={5} />
    <Item name="cobble" x={345} y={846} px={5} />
  </g>
);

/* ------------------------------------------------------------------ */
/* overworld                                                           */
/* ------------------------------------------------------------------ */

type Step = readonly [number, number];

/** A stepped grass-topped terrace of dirt. Steps are the top edge, left to right. */
const Terrace: React.FC<{ steps: Step[]; bottom: number; dx: number }> = ({ steps, bottom, dx }) => {
  const top = steps.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x + dx},${y}`).join(" ");
  const last = steps[steps.length - 1];
  const first = steps[0];
  const grassD = `${top} L${last[0] + dx},${last[1] + 36} ${steps
    .slice()
    .reverse()
    .map(([x, y]) => `L${x + dx},${y + 36}`)
    .join(" ")} Z`;
  const dirtD = `${top} L${last[0] + dx},${bottom} L${first[0] + dx},${bottom} Z`;
  return (
    <g>
      <path d={dirtD} fill={O.dirt} />
      <path d={grassD} fill={O.grassStrip} />
      <path d={top} {...LINE} strokeWidth={9} />
      <path d={`${steps.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x + dx},${y + 36}`).join(" ")}`} {...LINE} strokeWidth={8} />
    </g>
  );
};

const BACK_STEPS: Step[] = [
  [-400, 900], [0, 900], [0, 870], [180, 870], [180, 830], [330, 830], [330, 860], [430, 860], [430, 830], [760, 830], [760, 900], [930, 900], [930, 870], [1600, 870],
];
const MID_STEPS: Step[] = [
  [-400, 1000], [100, 1000], [100, 960], [250, 960], [250, 930], [520, 930], [520, 960], [700, 960], [700, 990], [930, 990], [930, 960], [1600, 960],
];
const FRONT_STEPS: Step[] = [
  [-400, 1090], [60, 1090], [60, 1060], [380, 1060], [380, 1080], [800, 1080], [800, 1050], [1600, 1050],
];

/**
 * Sky, sun, blocky clouds and stepped hills. `pan` slides the ground and
 * hills as the figure walks; the sky and sun stay put like a far horizon.
 */
export const Overworld: React.FC<{ pan?: number }> = ({ pan = 0 }) => (
  <g>
    <defs>
      <linearGradient id="mcSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={O.skyTop} />
        <stop offset="100%" stopColor={O.skyBottom} />
      </linearGradient>
      <radialGradient id="mcSunGlow">
        <stop offset="0%" stopColor="#fff2b8" stopOpacity={0.9} />
        <stop offset="55%" stopColor="#fff0b0" stopOpacity={0.35} />
        <stop offset="100%" stopColor="#fff0b0" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect x={0} y={PANEL_TOP} width={W} height={1170 - PANEL_TOP} fill="url(#mcSky)" />
    {/* sun */}
    <circle cx={525} cy={712} r={330} fill="url(#mcSunGlow)" />
    <rect x={425} y={615} width={200} height={192} fill={O.sunGlow} />
    <rect x={447} y={640} width={158} height={146} fill={O.sun} />
    {/* clouds */}
    <g fill={O.cloud} stroke="#000" strokeWidth={9} strokeLinejoin="round">
      <path d={`M${125 + pan * 0.25},640 h90 v-30 h85 v30 h115 v60 h-75 v30 h-125 v-30 h-90 z`} />
      <path d={`M${435 + pan * 0.25},545 h85 v40 h-85 z`} />
      <path d={`M${630 + pan * 0.25},600 h160 v-35 h125 v60 h-85 v35 h-130 v-25 h-70 z`} />
      <path d={`M${-40 + pan * 0.25},560 h50 v40 h-50 z`} />
    </g>
    {/* hills */}
    <Terrace steps={BACK_STEPS} bottom={1175} dx={pan * 0.5} />
    <Terrace steps={MID_STEPS} bottom={1175} dx={pan * 0.7} />
    <Terrace steps={FRONT_STEPS} bottom={1175} dx={pan * 0.85} />
    {/* ground */}
    <rect x={0} y={1170} width={W} height={H - 1170} fill={O.ground} />
    <path d="M0,1170 H1080" {...LINE} strokeWidth={9} />
  </g>
);

/** The things that stand on the grass: they pan with the ground. */
export const OverworldProps: React.FC<{ pan?: number }> = ({ pan = 0 }) => (
  <g>
    <DeadBush x={448 + pan} y={1198} scale={0.62} fill={O.bush} />
    <Poppy x={372 + pan * 1.05} y={1215} px={12} />
    <DeadBush x={160 + pan * 1.9} y={1760} scale={1.6} fill={O.bush} />
    <DeadBush x={1180 + pan * 1.5} y={1420} scale={0.95} fill={O.bush} />
    <Poppy x={1300 + pan * 1.3} y={1320} px={14} />
  </g>
);

/* ------------------------------------------------------------------ */
/* top-down map                                                        */
/* ------------------------------------------------------------------ */

export const Aerial: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="mcAerial" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={A.top} />
        <stop offset="100%" stopColor={A.bottom} />
      </linearGradient>
    </defs>
    <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="url(#mcAerial)" />
    <g fill="none" stroke="#000" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M0,600 H45 V570 H170 V550 H365 V570 H540" />
      <path d="M515,820 H540 V800 H630 V775 H860 V795 H1010 V815 H1080" />
      <path d="M940,470 H1000 V500 H1040 V530 H1080" />
      <path d="M0,985 H45 V960 H170 V920 H420 V945 H540 V1010" />
      <path d="M0,1520 H80 V1500 H470 V1480 H710 V1440 H900 V1465 H1080" />
      <path d="M0,1830 H330 V1810 H720 V1830 H1080" />
      <path d="M910,1090 H970 V1060 H1080" />
    </g>
    {/* stone breaking through the grass: the cave */}
    <path d="M890,1040 q30,-40 90,-30 h100 v110 h-110 q-50,-10 -80,-80 z" fill={A.stone} stroke="#000" strokeWidth={6} strokeLinejoin="round" />
    <path d="M950,1060 h60 v40 h-60 z" fill={A.stoneDark} stroke="#000" strokeWidth={5} />
    <path d="M1010,1010 h70 v50 h-70 z" fill={A.stoneDark} stroke="#000" strokeWidth={5} />
    {/* tufts */}
    <g fill="none" stroke="#2f4a2a" strokeWidth={6} strokeLinecap="round">
      <path d="M130,660 l6,20 M158,672 l-6,18" />
      <path d="M914,520 l6,16 M938,528 l-6,14" />
      <path d="M815,1100 l6,16" />
      <path d="M190,1560 l6,16 M216,1566 l-6,14" />
      <path d="M960,1720 l6,16 M986,1712 l-6,14" />
    </g>
    {/* poppies, tiny */}
    {[[270, 815], [35, 880], [915, 670], [1000, 900], [335, 1195], [985, 1330], [245, 1445]].map(([x, y], i) => (
      <g key={i}>
        <line x1={x} y1={y} x2={x} y2={y + 22} stroke="#2f4a2a" strokeWidth={5} />
        <rect x={x - 9} y={y - 6} width={18} height={12} fill="#c8352e" />
      </g>
    ))}
    <TreeTop x={738} y={640} scale={0.95} />
    <TreeTop x={120} y={1380} scale={0.95} />
    <TreeTop x={862} y={1700} scale={0.95} />
  </g>
);

/* ------------------------------------------------------------------ */
/* the cave mouth, from inside                                         */
/* ------------------------------------------------------------------ */

export const Tunnel: React.FC = () => (
  <g>
    <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill={TN.wall} />
    {/* wall panels converging on the opening */}
    <g stroke="#000" strokeWidth={12} strokeLinejoin="round">
      <path d={`M0,${PANEL_TOP} H230 L370,475 V860 L230,860 L0,980 Z`} fill={TN.wallDark} />
      <path d={`M230,${PANEL_TOP} H380 L370,475 Z`} fill={TN.wallLight} />
      <path d="M0,980 L230,860 L100,950 V1330 L0,1420 Z" fill={TN.wallLight} />
      <path d={`M0,1420 L100,1330 L250,1470 L0,1620 Z`} fill={TN.wallDark} />
      <path d={`M1080,${PANEL_TOP} H860 L760,475 V860 L880,860 L1080,980 Z`} fill={TN.wallDark} />
      <path d={`M860,${PANEL_TOP} H700 L760,475 Z`} fill={TN.wallLight} />
      <path d="M1080,980 L880,860 V1050 L1010,1050 L1010,1330 L1080,1400 Z" fill={TN.wallLight} />
      <path d="M1080,1400 L1010,1330 L880,1470 L1080,1620 Z" fill={TN.wallDark} />
      <path d={`M380,${PANEL_TOP} H700 L760,475 H370 Z`} fill={TN.wallDark} />
    </g>
    {/* the opening */}
    <path d="M370,475 H760 V860 H880 V1050 H1010 V1330 H100 V950 H230 V860 H370 Z" fill={TN.sky} />
    <g fill={O.cloud} stroke="#000" strokeWidth={7} strokeLinejoin="round">
      <path d="M565,565 h60 v30 h-30 v25 h-30 z" />
      <path d="M410,690 h105 v45 h-105 z" />
    </g>
    <path d="M230,860 H370 V800 H500 V820 H620 V830 H700 V860 H760 V880 H880 V1050 H1010 V1330 H100 V950 H230 Z" fill={TN.grassFar} />
    <path d="M100,1150 H230 V1080 H420 V1030 H700 V1080 H900 V1090 H1010 V1330 H100 Z" fill={TN.grassNear} />
    <path d="M230,1360 L280,1270 H400 V1240 H660 V1270 H800 V1360 Z" fill={TN.wallDark} />
    <path d="M100,1330 H1010 L880,1470 H250 Z" fill={TN.floorFar} />
    <path d="M250,1470 H880 L1080,1620 V1920 H0 V1620 Z" fill={TN.floorNear} />
    {/* edge lines */}
    <g fill="none" stroke="#000" strokeWidth={10} strokeLinejoin="round" strokeLinecap="round">
      <path d="M370,475 H760 V860 H880 V1050 H1010 V1330 H100 V950 H230 V860 H370 Z" />
      <path d="M230,860 H370 V800 H500 V820 H620 V830 H700 V860 H760" />
      <path d="M100,1150 H230 V1080 H420 V1030 H700 V1080 H900 V1090 H1010" />
      <path d="M230,1360 L280,1270 H400 V1240 H660 V1270 H800 V1360" />
      <path d="M250,1470 H880 L1080,1620 M250,1470 L0,1620" />
      <path d="M0,1780 L250,1700 M1080,1780 L880,1700" opacity={0.5} />
    </g>
  </g>
);

/* ------------------------------------------------------------------ */
/* the dark stone room                                                 */
/* ------------------------------------------------------------------ */

export const DarkRoom: React.FC<{ signText: string }> = ({ signText }) => (
  <g>
    <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill={R.wall} />
    <rect x={460} y={PANEL_TOP} width={620} height={840} fill={R.wallB} />
    {/* floor */}
    <path d="M0,1000 L460,1200 L1080,1240 V1920 H0 Z" fill={R.floor} />
    <Streaks x={20} y={1260} w={1040} h={640} n={20} seed="dr" light="#575757" dark="#454545" len={140} />
    {/* raised block on the right */}
    <path d="M820,900 L900,840 H1080 V1000 H820 Z" fill={R.block} />
    <path d="M820,900 L900,840 H1080 M820,900 H1080" fill="none" stroke="#000" strokeWidth={12} strokeLinejoin="round" />
    {/* the low block bottom left and the slab bottom right */}
    <path d="M0,1430 L180,1500 V1720 L0,1790 Z" fill={R.low} stroke="#000" strokeWidth={12} strokeLinejoin="round" />
    <path d="M830,1710 L1000,1650 L1080,1690 V1920 H950 Z" fill={R.block} stroke="#000" strokeWidth={12} strokeLinejoin="round" />
    {/* wall lines */}
    <g fill="none" stroke="#000" strokeWidth={12} strokeLinejoin="round" strokeLinecap="round">
      <path d="M0,1000 L460,1200 L1080,1240" />
      <path d={`M145,${PANEL_TOP} V1060 M320,${PANEL_TOP} V1140 M460,${PANEL_TOP} V1200 M560,${PANEL_TOP} V1210`} />
      <path d="M0,700 L460,660 L1080,700" />
      <path d="M0,700 L145,690 M460,660 L320,670" />
      <path d="M460,1000 L560,960 L1080,980" />
    </g>
    {/* coal ore blocks */}
    <g stroke="#000" strokeWidth={12} strokeLinejoin="round">
      <path d="M290,840 H460 V1000 L320,1050 V1000 L290,1000 Z" fill={R.block} />
      <path d="M150,1000 H460 V1250 L320,1280 L150,1230 Z" fill={R.block} />
      <path d="M150,1000 L320,1050 L460,1000 M320,1050 V1280" fill="none" />
    </g>
    <g fill={R.coal} transform="translate(-14 0)">
      <ellipse cx={330} cy={870} rx={30} ry={13} />
      <ellipse cx={380} cy={890} rx={18} ry={9} />
      <ellipse cx={420} cy={920} rx={20} ry={9} />
      <ellipse cx={340} cy={950} rx={26} ry={11} />
      <ellipse cx={400} cy={975} rx={16} ry={8} />
      <ellipse cx={440} cy={1000} rx={14} ry={8} />
      <ellipse cx={200} cy={1090} rx={26} ry={12} />
      <ellipse cx={260} cy={1120} rx={22} ry={10} />
      <ellipse cx={210} cy={1170} rx={20} ry={10} />
      <ellipse cx={280} cy={1190} rx={26} ry={11} />
      <ellipse cx={370} cy={1090} rx={22} ry={10} />
      <ellipse cx={410} cy={1140} rx={18} ry={9} />
      <ellipse cx={360} cy={1190} rx={24} ry={10} />
      <ellipse cx={420} cy={1220} rx={16} ry={8} />
      <ellipse cx={520} cy={870} rx={18} ry={9} />
      <ellipse cx={500} cy={930} rx={20} ry={9} />
    </g>
    <Sign x={490} y={610} text={signText} color={R.sign} size={54} />
  </g>
);

/* ------------------------------------------------------------------ */
/* lava lake                                                           */
/* ------------------------------------------------------------------ */

const LAVA_BLOBS = Array.from({ length: 52 }, (_, i) => ({
  x: random(`lbx${i}`) * 1180 - 50,
  y: 860 + random(`lby${i}`) * 1080,
  rx: 34 + random(`lbr${i}`) * 66,
  ry: 16 + random(`lbs${i}`) * 26,
  light: random(`lbc${i}`) > 0.42,
  drift: random(`lbd${i}`) * 2 + 0.5,
}));

export const LavaLake: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <defs>
      <linearGradient id="mcHaze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={L.wall} stopOpacity={0} />
        <stop offset="100%" stopColor={L.haze} stopOpacity={1} />
      </linearGradient>
    </defs>
    {/* the far wall: rows of stone blocks */}
    <rect x={0} y={PANEL_TOP} width={W} height={450} fill={L.wall} />
    <g fill="none" stroke={L.line} strokeWidth={7} strokeLinejoin="round">
      <path d="M0,490 H1080 M0,555 H1080 M0,690 H1080 M0,760 H1080" />
      <path d="M160,397 V490 M450,397 V490 M620,397 V490 M870,397 V490" />
      <path d="M90,490 V555 M430,490 V555 M590,490 V555 M830,490 V555" />
      <path d="M150,555 V690 M420,555 V690 M600,555 V690 M810,555 V690" />
      <path d="M70,690 V760 M370,690 V760 M560,690 V760 M780,690 V760" />
      <path d="M100,760 V850 M360,760 V850 M520,760 V850 M770,760 V850" />
    </g>
    {/* ledges (the blocks step back) */}
    <path d="M0,555 L20,540 H1080 M0,690 L20,675 H1080" fill="none" stroke="#5a5a5a" strokeWidth={5} />
    {/* ores in the wall */}
    <g fill={L.lapis}>
      <rect x={965} y={545} width={16} height={10} /><rect x={990} y={548} width={14} height={9} /><rect x={975} y={565} width={12} height={9} /><rect x={995} y={575} width={16} height={9} /><rect x={968} y={590} width={18} height={9} /><rect x={992} y={600} width={12} height={9} />
    </g>
    <g fill={L.goldOre}>
      <rect x={495} y={625} width={20} height={10} /><rect x={525} y={630} width={16} height={9} /><rect x={560} y={615} width={18} height={9} /><rect x={585} y={634} width={20} height={10} /><rect x={505} y={646} width={16} height={9} /><rect x={575} y={650} width={22} height={9} />
      <rect x={285} y={810} width={20} height={10} /><rect x={315} y={800} width={16} height={9} /><rect x={340} y={822} width={20} height={9} /><rect x={370} y={780} width={18} height={9} /><rect x={395} y={795} width={16} height={9} /><rect x={365} y={806} width={22} height={9} />
    </g>
    <g fill={L.redOre}>
      <rect x={645} y={400} width={16} height={9} /><rect x={666} y={404} width={12} height={8} /><rect x={652} y={412} width={10} height={7} />
    </g>
    <rect x={0} y={600} width={W} height={250} fill="url(#mcHaze)" />
    {/* lava */}
    <rect x={0} y={845} width={W} height={H - 845} fill={L.base} />
    <g>
      {LAVA_BLOBS.map((b, i) => (
        <ellipse
          key={i}
          cx={b.x + Math.sin(t * 0.03 + i) * 6}
          cy={b.y}
          rx={b.rx * (1 + Math.sin(t * 0.05 * b.drift + i) * 0.08)}
          ry={b.ry}
          fill={b.light ? L.blobLight : L.blobDark}
        />
      ))}
    </g>
    <rect x={0} y={840} width={W} height={40} fill={L.haze} opacity={0.35} />
  </g>
);

export const ObsidianSlab: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M60,0 H560 L490,110 H0 Z" fill={L.obsidianTop} stroke="#1a1420" strokeWidth={6} strokeLinejoin="round" />
    <path d="M0,110 H490 V142 H0 Z" fill={L.obsidian} stroke="#1a1420" strokeWidth={6} strokeLinejoin="round" />
    <path d="M490,110 L560,0 V32 L490,142 Z" fill="#1d1726" stroke="#1a1420" strokeWidth={6} strokeLinejoin="round" />
    <path d="M120,20 L200,90 M300,30 L250,95" fill="none" stroke="#2e2740" strokeWidth={5} />
    <ellipse cx={250} cy={60} rx={170} ry={40} fill="#221b2c" opacity={0.6} />
  </g>
);

/* ------------------------------------------------------------------ */
/* torchlight                                                          */
/* ------------------------------------------------------------------ */

/** Black cave with a warm pool of light. `light` 0-1 is the torch's glow. */
export const TorchCave: React.FC<{ light: number; lx: number; ly: number }> = ({ light, lx, ly }) => (
  <g>
    <defs>
      <radialGradient id="mcTorchGlow" cx={lx} cy={ly} r={1000} gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#857252" />
        <stop offset="30%" stopColor={T.glow} />
        <stop offset="50%" stopColor={T.glowMid} />
        <stop offset="100%" stopColor="#000000" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#000" />
    <linearGradient id="mcFloorSheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#0a0a0a" />
      <stop offset="100%" stopColor="#1f1f1f" />
    </linearGradient>
    <rect x={0} y={1100} width={W} height={820} fill="url(#mcFloorSheen)" opacity={0.9} />
    <g opacity={light}>
      <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="url(#mcTorchGlow)" />
    </g>
    {/* block edges, barely there */}
    <g fill="none" stroke={T.lines} strokeWidth={9} strokeLinejoin="round" opacity={0.28 + light * 0.5}>
      <path d="M0,1230 L230,1150 H480 V1300 M230,1150 V1560 M0,1560 L230,1560 M480,1300 L600,1240 V1560 M380,1560 L600,1560 M120,1730 L340,1690 V1920 M0,1860 L120,1730" />
      <path d="M1000,1080 L1080,1040 M760,1130 L1000,1080 V1260 M600,1240 L760,1130 M600,1560 L740,1500 V1920" />
    </g>
  </g>
);

/* ------------------------------------------------------------------ */
/* home                                                                */
/* ------------------------------------------------------------------ */

const Planks: React.FC<{ x: number; y: number; w: number; h: number; fill: string; seed: string }> = ({ x, y, w, h, fill, seed }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={fill} />
    <g stroke="#000" strokeWidth={6} opacity={0.5}>
      {Array.from({ length: Math.floor(h / 70) }, (_, i) => {
        const yy = y + 35 + i * 70 + random(`${seed}${i}`) * 20;
        const xs = x + random(`${seed}s${i}`) * w * 0.5;
        return <line key={i} x1={xs} y1={yy} x2={Math.min(x + w, xs + w * 0.6)} y2={yy} />;
      })}
    </g>
  </g>
);

export const House: React.FC<{ signText: string }> = ({ signText }) => (
  <g>
    <defs>
      <radialGradient id="mcHouseLight" cx={330} cy={800} r={900} gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor={HS.wallLit} />
        <stop offset="45%" stopColor={HS.wall} />
        <stop offset="100%" stopColor={HS.wallTop} />
      </radialGradient>
    </defs>
    <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="url(#mcHouseLight)" />
    <Streaks x={20} y={640} w={1040} h={1000} n={24} seed="hw" light="#9a8563" dark="#6b5a45" len={120} />
    {/* stone ceiling and floor */}
    <rect x={0} y={PANEL_TOP} width={W} height={225} fill={HS.ceiling} />
    <Streaks x={20} y={420} w={1040} h={190} n={12} seed="hc" light="#3f3f3f" dark="#2a2a2a" len={140} />
    <rect x={0} y={1700} width={W} height={220} fill={HS.floor} />
    <Streaks x={20} y={1720} w={1040} h={180} n={10} seed="hf" light="#383838" dark="#232323" len={140} />
    {/* wood */}
    <Planks x={0} y={620} w={60} h={1080} fill={HS.plank} seed="p1" />
    <Planks x={60} y={620} w={280} h={300} fill={HS.beam} seed="p2" />
    <Planks x={850} y={620} w={230} h={300} fill={HS.plankDeep} seed="p3" />
    <Planks x={960} y={900} w={120} h={800} fill={HS.plankDark} seed="p4" />
    <Planks x={180} y={920} w={80} h={620} fill={HS.plankDark} seed="p5" />
    <g fill="none" stroke="#000" strokeWidth={11} strokeLinejoin="round">
      <path d="M0,620 H1080 M60,620 V1700 M340,620 V920 H60 M850,620 V920 H1080 M960,900 V1700 M180,920 V1540 H260 V920" />
    </g>
    {/* the torch on the beam */}
    <g transform="translate(270 770) rotate(28)" stroke="#000" strokeWidth={7} strokeLinejoin="round">
      <rect x={-18} y={-70} width={36} height={130} fill="#8a6a3d" />
      <rect x={-18} y={-70} width={36} height={40} fill="#ffb347" />
      <path d="M18,-70 l14,-8 v130 l-14,8 z" fill="#5c4426" />
    </g>
    <Sign x={370} y={690} text={signText} color={HS.sign} size={52} />
    <OpenChest x={630} y={1390} />
    <Plush x={940} y={1645} />
  </g>
);
