import React from "react";
import { AbsoluteFill, Audio, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CHAR, CHAR_TOP, type CharId, type Pose } from "./chars";
import schedule from "./race-schedule.json";
import { Countdown, Headline, loadPlayFonts, Payoff } from "./text";

/**
 * "Choose your champion!" — the rope-race Short, rebuilt beat for beat on
 * the reference clip so it sits on the reference audio.
 *
 * Four ropes, four racers: Bruno the bear, Mimi the cat, Biscuit the puppy,
 * Poppy the bunny. 3-2-1-GO! and they climb, drawn from behind, while the
 * camera rolls up the ropes. Poppy knocks Biscuit off; Mimi gets cross and
 * tackles Poppy and they both drop; Biscuit climbs back and hops ropes;
 * Poppy bounces back up and Mimi shouts her off (the rope snaps); an eagle
 * snatches Bruno near the top and Biscuit lets go in fright; Mimi pulls up
 * over the ledge alone — WINNER! and a crown.
 *
 * Times (seconds) are in race-schedule.json and match the reference's.
 */

export const W = 1080;
export const H = 1920;
export const RACE_FRAMES = schedule.duration;

const T = schedule.t;
const FPS = 30;
const LANE = [180, 428, 668, 908];
const SC = 0.92;
const STAND_Y = 1470;
const HANG_Y = 1290;
const KNOT_Y = 1232;
const OFF = 2300;

/* ------------------------------------------------------------------ */
/* timing helpers                                                      */
/* ------------------------------------------------------------------ */

const smooth = (u: number) => u * u * (3 - 2 * u);
const clamp01 = (u: number) => Math.max(0, Math.min(1, u));
/** keyframed value with smooth easing between keys */
const kf = (t: number, keys: [number, number][]) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      return v0 + (v1 - v0) * smooth((t - t0) / (t1 - t0));
    }
  }
  return keys[keys.length - 1][1];
};
/** linear keyframes (for the camera, which must not stop at every key) */
const lin = (t: number, keys: [number, number][]) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
    }
  }
  return keys[keys.length - 1][1];
};
const u = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
/** fall with gravity from y0 starting at t0 */
const fall = (t: number, t0: number, y0: number) => y0 + 0.5 * 3600 * Math.max(0, t - t0) ** 2;

/**
 * Camera: how far the world has scrolled down the screen. The ledge sits at
 * screen y = SCROLL - LEDGE_AT, arriving at the top at 16.7 s and settling
 * at about half height, as in the reference.
 */
const LEDGE_AT = 3040;
const SCROLL: [number, number][] = [
  [0, 0],
  [2.8, 0],
  [3.3, 80],
  [5.0, 700],
  [16.7, 3040],
  [18.0, 3270],
  [19.2, 3366],
  [20.4, 3539],
  [21.0, 3616],
  [22.2, 3789],
  [23.4, 3866],
  [24.6, 3981],
  [25.8, 4038],
  [30, 4038],
];
const scroll = (t: number) => lin(t, SCROLL);
const ledgeY = (t: number) => scroll(t) - LEDGE_AT;

/* ------------------------------------------------------------------ */
/* poses                                                               */
/* ------------------------------------------------------------------ */

/** Hand over hand up the rope, from behind. */
const climb = (t: number, seed: number): Pose => {
  const ph = Math.floor(t * 30 / 7 + seed * 1.7) % 2;
  const wob = Math.sin(t * 9 + seed);
  return {
    back: true,
    handL: ph ? [-18, -280] : [-18, -258],
    handR: ph ? [18, -258] : [18, -280],
    squash: 0.97 + wob * 0.015,
    tilt: wob * 2,
    wag: wob * 14,
  };
};

const blinkEyes = (frame: number, seed: number): Pose["eyes"] => ((frame + seed * 29) % 84 < 4 ? "closed" : "open");

type State = { x: number; y: number; rot?: number; pose: Pose; show?: boolean; crown?: number };

/** Lineup, crouch and jump onto the ropes (shared by all four). */
const start = (t: number, frame: number, lane: number, seed: number): State | null => {
  const x = LANE[lane];
  if (t < 2.55) {
    return { x, y: STAND_Y + Math.sin(t * 5 + seed) * 3, pose: { eyes: blinkEyes(frame, seed), look: [0, -0.3], wag: Math.sin(t * 6 + seed) * 12 } };
  }
  if (t < T.jump) {
    return { x, y: STAND_Y, pose: { eyes: "open", squash: 0.9, armL: [-30, 30], armR: [30, 30] } };
  }
  if (t < T.jump + 0.16) {
    const k = u(t, T.jump, T.jump + 0.16);
    return { x, y: STAND_Y + (HANG_Y - STAND_Y) * k - Math.sin(k * Math.PI) * 60, pose: { back: true, handL: [-18, -280], handR: [18, -280], squash: 1.06 } };
  }
  return null;
};

/* ------------------------------------------------------------------ */
/* the four racers                                                     */
/* ------------------------------------------------------------------ */

const BEAR_Y: [number, number][] = [
  [2.86, HANG_Y],
  [5.2, HANG_Y],
  [9.7, 1190],
  [12, 1170],
  [14.4, 1260],
  [15.6, 1250],
  [16.3, 1080],
  [16.8, 780],
  [18, 760],
  [20.4, 740],
  [20.9, 740],
];

/** Where the eagle is: in from the upper right, down onto Bruno, off to the left. */
const eaglePos = (t: number): { x: number; y: number } => {
  const bx = LANE[0];
  const by = kf(T.grab, BEAR_Y) - CHAR_TOP.bear * SC - 30;
  if (t < T.grab) {
    const k = smooth(u(t, T.eagleIn, T.grab));
    return { x: 1300 + (bx - 1300) * k, y: by - 380 * (1 - k) ** 2 };
  }
  const k = u(t, T.grab, T.eagleOut);
  return { x: bx + (-420 - bx) * k, y: by - 560 * k * k - 60 * k };
};

const bear = (t: number, frame: number): State => {
  const s = start(t, frame, 0, 0);
  if (s) return s;
  if (t < T.grab) {
    const p = climb(t, 0);
    // a nervous look up as the eagle's shadow arrives
    if (t > T.eagleIn + 0.12) return { x: LANE[0], y: kf(t, BEAR_Y), pose: { eyes: "shock", mouth: "o", fx: "shock", armL: [-70, -90], armR: [70, -90], look: [0.6, -1] } };
    return { x: LANE[0], y: kf(t, BEAR_Y), pose: p };
  }
  const e = eaglePos(t);
  return {
    x: e.x + 8,
    y: e.y + 40 + CHAR_TOP.bear * SC,
    rot: Math.sin(t * 30) * 6,
    pose: { eyes: "shock", mouth: "o", armL: [-40, -110], armR: [40, -110], fx: "shock", squash: 1.04 },
    show: e.x > -300,
  };
};

const DOG_BACK_Y: [number, number][] = [
  [T.dogBack, 2150],
  [10.3, 1760],
  [11.3, 1600],
  [12.0, 1340],
  [12.7, 1250],
  [T.dogJump, 1250],
];
const DOG_LANE1_Y: [number, number][] = [
  [T.dogJumpEnd, 1222],
  [14.4, 1240],
  [15.6, 1320],
  [16.8, 1140],
  [18, 1040],
  [20.4, 820],
  [T.dogFall, 820],
];

const dog = (t: number, frame: number): State => {
  const s = start(t, frame, 2, 2);
  if (s) return s;
  if (t < T.hit) return { x: LANE[2], y: HANG_Y, pose: climb(t, 2) };
  if (t < T.dogBack) {
    const y = fall(t, T.hit + 0.08, HANG_Y);
    return {
      x: LANE[2] - 20 * u(t, T.hit, T.hit + 0.2),
      y,
      rot: -60 * u(t, T.hit, T.hit + 0.9),
      pose: { eyes: "shock", mouth: "o", fx: "shock", armL: [-80, -60], armR: [80, -60] },
      show: y < OFF,
    };
  }
  if (t < T.dogJump) return { x: LANE[2], y: kf(t, DOG_BACK_Y), pose: climb(t, 2) };
  if (t < T.dogJumpEnd) {
    const k = u(t, T.dogJump, T.dogJumpEnd);
    return {
      x: LANE[2] + (LANE[1] - LANE[2]) * smooth(k),
      y: 1250 + (1222 - 1250) * k - Math.sin(k * Math.PI) * 80,
      rot: -18 * Math.sin(k * Math.PI),
      pose: { eyes: "happy", mouth: "open", armL: [-90, -40], armR: [60, -90], wag: 20 },
    };
  }
  if (t < T.dogShock) return { x: LANE[1], y: kf(t, DOG_LANE1_Y), pose: climb(t, 2) };
  if (t < T.dogFall)
    return {
      x: LANE[1] + Math.sin(t * 60) * 3,
      y: 820,
      pose: { eyes: "shock", mouth: "o", fx: "sweat", armL: [-40, -120], armR: [40, -120], look: [-0.8, -1] },
    };
  const y = fall(t, T.dogFall, 820);
  return { x: LANE[1], y, rot: 40 * u(t, T.dogFall, T.dogFall + 0.8), pose: { eyes: "shock", mouth: "o", fx: "shock", armL: [-80, -70], armR: [80, -70] }, show: y < OFF };
};

const CAT_BACK_Y: [number, number][] = [
  [T.catBack, 2100],
  [12.0, 1830],
  [13.2, 1450],
  [14.4, 1230],
  [T.catHop, 1120],
];
const CAT_FINISH_Y = (t: number): number =>
  kf(t, [
    [T.yellEnd + 0.4, 1000],
    [21, 1080],
    [22.2, 1000],
    [23.4, 960],
    [T.pullUp, ledgeY(T.pullUp) + 70],
  ]);

const cat = (t: number, frame: number): State => {
  const s = start(t, frame, 1, 1);
  if (s) return s;
  if (t < T.catAngry) return { x: LANE[1], y: kf(t, [[2.86, HANG_Y], [T.catAngry, 1300]]), pose: climb(t, 1) };
  if (t < T.leap) {
    const shake = Math.sin(t * 50) * 3;
    return {
      x: LANE[1] + shake,
      y: 1305,
      rot: 6,
      pose: { eyes: "angry", mouth: Math.floor(t * 6) % 2 ? "shout" : "flat", fx: "anger", look: [1, 0], armL: [-70, -30], armR: [70, -30] },
    };
  }
  if (t < T.tussle) {
    const k = u(t, T.leap, T.tussle);
    return {
      x: LANE[1] + (LANE[3] - 30 - LANE[1]) * smooth(k),
      y: 1305 - Math.sin(k * Math.PI) * 90,
      rot: -28 * k,
      pose: { eyes: "angry", mouth: "shout", armL: [60, -60], armR: [100, -20], fx: "anger" },
    };
  }
  if (t < T.catBack) {
    const y = fall(t, T.tussle + 0.3, 1300);
    return {
      x: LANE[3] - 30 - 150 * smooth(u(t, T.tussle, T.tussle + 0.8)) + Math.sin(t * 40) * 14,
      y,
      rot: -28 + Math.sin(t * 25) * 20 + 120 * u(t, T.tussle + 0.3, T.tussleEnd),
      pose: { eyes: "angry", mouth: "shout", armL: [70, -70], armR: [96, -10], fx: "anger" },
      show: y < OFF,
    };
  }
  if (t < T.catHop) return { x: LANE[2], y: kf(t, CAT_BACK_Y), pose: climb(t, 1) };
  if (t < T.yellEnd) {
    const hop = u(t, T.catHop, T.catYell);
    const y = 1120 + (800 - 1120) * (1 - (1 - hop) ** 2);
    return {
      x: LANE[2] + Math.sin(t * 50) * (t > T.catYell ? 3 : 0),
      y: y + Math.sin(t * 10) * 4,
      rot: 12,
      pose: { eyes: "angry", mouth: "shout", fx: "anger", look: [0.8, 1], armL: [-70, -30], armR: [80, 40] },
    };
  }
  if (t < T.pullUp) {
    const y = t < T.yellEnd + 0.4 ? 800 + (1000 - 800) * smooth(u(t, T.yellEnd, T.yellEnd + 0.4)) : CAT_FINISH_Y(t);
    return { x: LANE[2], y, pose: climb(t, 1) };
  }
  const ly = ledgeY(t);
  if (t < T.stand) {
    const k = u(t, T.pullUp, T.stand);
    return {
      x: LANE[2],
      y: ly + 70 * (1 - smooth(k)),
      rot: 18 * Math.sin(k * Math.PI),
      pose: { eyes: "closed", mouth: "flat", armL: [-60, -110], armR: [60, -110], squash: 0.94 + 0.06 * k },
    };
  }
  if (t < T.win)
    return { x: LANE[2], y: ly, pose: { eyes: "closed", mouth: "smile", wag: Math.sin(t * 5) * 14, squash: 1 + Math.sin(t * 5) * 0.01 } };
  return {
    x: LANE[2],
    y: ly,
    pose: { eyes: "happy", mouth: "open", armL: [-70, -100], armR: [70, -100], wag: Math.sin(t * 8) * 20 },
    crown: u(t, T.crown, T.crown + 0.2),
  };
};

const bunny = (t: number, frame: number): State => {
  const s = start(t, frame, 3, 3);
  if (s) return s;
  if (t < T.bunnyTurn) return { x: LANE[3], y: HANG_Y, pose: climb(t, 3) };
  if (t < T.hit + 0.05) {
    const k = u(t, T.bunnyTurn, T.hit);
    return {
      x: LANE[3] - 50 * smooth(k),
      y: HANG_Y,
      rot: -12 * k,
      pose: { eyes: "happy", mouth: "grin", handL: [-150 * k - 30, -120], armR: [40, -60] },
    };
  }
  if (t < T.bunnyLaughEnd) {
    return {
      x: LANE[3] - 50 + 50 * smooth(u(t, T.hit + 0.3, T.bunnyLaughEnd)),
      y: HANG_Y + Math.abs(Math.sin(t * 16)) * -8,
      rot: Math.sin(t * 24) * 5,
      pose: { eyes: "happy", mouth: "open", armL: [8, 10], armR: [-8, 10] },
    };
  }
  if (t < T.tussle) return { x: LANE[3], y: HANG_Y, pose: climb(t, 3) };
  if (t < T.tussleEnd) {
    const y = fall(t, T.tussle + 0.3, 1320);
    return {
      x: LANE[3] + 20 - 150 * smooth(u(t, T.tussle, T.tussle + 0.8)) + Math.sin(t * 40 + 2) * 14,
      y,
      rot: 20 + Math.sin(t * 25 + 1) * 20 + 140 * u(t, T.tussle + 0.3, T.tussleEnd),
      pose: { eyes: "shock", mouth: "o", fx: "sweat", armL: [-80, -60], armR: [80, -60] },
      show: y < OFF,
    };
  }
  if (t < T.bunnyBack) return { x: LANE[3], y: OFF + 100, pose: {}, show: false };
  if (t < 15.3) {
    const base = kf(t, [
      [T.bunnyBack, 2150],
      [14.3, 1450],
      [15.3, 1300],
    ]);
    const hop = Math.abs(Math.sin((t - T.bunnyBack) * Math.PI * 3.2));
    return { x: LANE[3], y: base - hop * 70, pose: { eyes: "happy", mouth: "grin", armL: [-60, -80], armR: [60, -80], squash: 0.94 + hop * 0.08 } };
  }
  if (t < T.bunnyScared) return { x: LANE[3], y: kf(t, [[15.3, 1300], [T.bunnyScared, 1180]]), pose: climb(t, 3) };
  if (t < T.bunnyFall)
    return {
      x: LANE[3] + Math.sin(t * 60) * 4,
      y: 1180 - 20 * u(t, T.bunnyScared, T.bunnyFall),
      pose: { eyes: "shock", mouth: "o", fx: "sweat", look: [-0.8, -1], armL: [-30, -130], armR: [30, -130] },
    };
  const y = fall(t, T.bunnyFall, 1160);
  return { x: LANE[3], y, rot: -50 * u(t, T.bunnyFall, T.bunnyFall + 0.8), pose: { eyes: "shock", mouth: "o", fx: "shock", armL: [-80, -70], armR: [80, -70] }, show: y < OFF };
};

const RACERS: { id: CharId; fn: (t: number, frame: number) => State }[] = [
  { id: "bear", fn: bear },
  { id: "dog", fn: dog },
  { id: "bunny", fn: bunny },
  { id: "cat", fn: cat },
];

/* ------------------------------------------------------------------ */
/* scenery                                                             */
/* ------------------------------------------------------------------ */

const Rope: React.FC<{ x: number; top: number; bottom: number; worldShift: number; frayed?: boolean }> = ({ x, top, bottom, worldShift, frayed }) => {
  const y0 = Math.max(top, -40);
  const y1 = Math.min(bottom, H + 40);
  if (y1 <= y0) return null;
  const ticks: React.ReactNode[] = [];
  const first = Math.ceil((y0 - worldShift) / 24);
  const last = Math.floor((y1 - worldShift) / 24);
  for (let i = first; i <= last; i++) {
    const y = i * 24 + worldShift;
    ticks.push(<path key={i} d={`M ${x - 8} ${y} q 8 6 16 12`} />);
  }
  return (
    <g>
      <path d={`M ${x} ${y0} L ${x} ${y1}`} stroke="#b08c58" strokeWidth={20} strokeLinecap="butt" />
      <path d={`M ${x} ${y0} L ${x} ${y1}`} stroke="#dcbf8e" strokeWidth={14} strokeLinecap="butt" />
      <path d={`M ${x - 3} ${y0} L ${x - 3} ${y1}`} stroke="#ecd8b4" strokeWidth={3} opacity={0.8} />
      <g stroke="#a48152" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.85}>
        {ticks}
      </g>
      {frayed ? (
        <g stroke="#c9a66f" strokeWidth={4} strokeLinecap="round">
          <path d={`M ${x - 6} ${bottom} l -6 24 M ${x} ${bottom} l 1 30 M ${x + 6} ${bottom} l 7 22`} />
        </g>
      ) : null}
    </g>
  );
};

const Knot: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <ellipse cx={x} cy={y} rx={15} ry={19} fill="#dcbf8e" stroke="#b08c58" strokeWidth={4} />
    <path d={`M ${x - 10} ${y - 6} q 10 8 20 0 M ${x - 10} ${y + 4} q 10 8 20 0`} stroke="#b08c58" strokeWidth={3} fill="none" />
    <g stroke="#c9a66f" strokeWidth={4} strokeLinecap="round">
      <path d={`M ${x - 6} ${y + 16} l -4 22 M ${x} ${y + 18} l 2 24 M ${x + 6} ${y + 16} l 6 20`} />
    </g>
  </g>
);

const Ledge: React.FC<{ y: number }> = ({ y }) => {
  if (y < -60) return null;
  const scallops = Array.from({ length: 16 }, (_, i) => {
    const x = i * 72 + random(`gs${i}`) * 24 - 10;
    const d = 14 + random(`gd${i}`) * 22;
    return `M ${x} ${y} q 26 ${d} 52 0`;
  }).join(" ");
  return (
    <g>
      <defs>
        <linearGradient id="rsSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfe3f7" />
          <stop offset="100%" stopColor="#eaf7fd" />
        </linearGradient>
      </defs>
      <rect x={0} y={-10} width={W} height={y + 10} fill="url(#rsSky)" />
      <rect x={0} y={y - 5} width={W} height={12} fill="#a9c797" />
      <path d={scallops} fill="#bcd8a6" opacity={0.95} />
      <path d={`M 0 ${y} L ${W} ${y}`} stroke="#8fb07b" strokeWidth={5} />
      {Array.from({ length: 11 }, (_, i) => {
        const x = 30 + i * 100 + random(`gt${i}`) * 50;
        return <path key={i} d={`M ${x} ${y + 2} q -6 -20 4 -30 q 8 12 6 30`} fill="#9dbf86" />;
      })}
    </g>
  );
};

const Eagle: React.FC<{ flap: number }> = ({ flap }) => (
  <g>
    <g fill="#8a5a3a" stroke="#4e3220" strokeWidth={6} strokeLinejoin="round">
      <path d={`M -30 -10 q -110 ${-70 - flap * 40} -230 ${-40 - flap * 70} q 30 10 20 26 q 40 -2 40 24 q 40 0 40 26 q 50 10 130 30 Z`} />
      <path d={`M 30 -10 q 110 ${-70 - flap * 40} 230 ${-40 - flap * 70} q -30 10 -20 26 q -40 -2 -40 24 q -40 0 -40 26 q -50 10 -130 30 Z`} />
      <ellipse cx={0} cy={0} rx={72} ry={44} />
      <path d="M -62 16 q -34 36 -76 40 q 26 -30 44 -60 Z" />
    </g>
    <ellipse cx={-10} cy={6} rx={40} ry={22} fill="#a2724d" opacity={0.6} />
    <circle cx={72} cy={-16} r={36} fill="#f4efe6" stroke="#4e3220" strokeWidth={6} />
    <path d="M 102 -16 q 22 0 32 12 q -14 8 -30 8 Z" fill="#f2b23c" stroke="#4e3220" strokeWidth={4} strokeLinejoin="round" />
    <circle cx={84} cy={-22} r={6} fill="#2b2530" />
    <path d={`M 72 -38 l 22 6`} stroke="#4e3220" strokeWidth={5} strokeLinecap="round" />
    <g stroke="#f2b23c" strokeWidth={8} strokeLinecap="round">
      <path d="M -16 38 l -6 30 M 18 38 l 6 30" />
    </g>
  </g>
);

const Crown: React.FC = () => (
  <g fill="#f7c948" stroke="#b8891a" strokeWidth={5} strokeLinejoin="round">
    <path d="M -52 20 L -60 -34 L -26 -6 L 0 -46 L 26 -6 L 60 -34 L 52 20 Z" />
    <circle cx={-60} cy={-36} r={7} />
    <circle cx={0} cy={-48} r={7} />
    <circle cx={60} cy={-36} r={7} />
    <path d="M -46 8 L 46 8" stroke="#e0a92a" strokeWidth={4} />
  </g>
);

/** Impact star where Poppy's swipe lands, and the scuffle cloud. */
const Impacts: React.FC<{ t: number }> = ({ t }) => {
  const out: React.ReactNode[] = [];
  const hitK = u(t, T.hit, T.hit + 0.25);
  if (hitK > 0 && hitK < 1) {
    out.push(
      <g key="hit" transform={`translate(${LANE[2] + 40} ${HANG_Y - 220}) scale(${0.6 + hitK * 0.6})`} opacity={1 - hitK}>
        <path d="M 0 -50 L 12 -14 L 50 -14 L 20 8 L 32 46 L 0 22 L -32 46 L -20 8 L -50 -14 L -12 -14 Z" fill="#fff4a8" stroke="#f0b23a" strokeWidth={5} strokeLinejoin="round" />
      </g>
    );
  }
  if (t >= T.tussle && t < T.tussle + 0.9) {
    const k = u(t, T.tussle, T.tussle + 0.9);
    const cy = fall(t, T.tussle + 0.3, 1300) - 130;
    out.push(
      <g key="cloud" transform={`translate(${LANE[3] - 10 - 150 * smooth(k)} ${cy})`} opacity={1 - k * 0.8}>
        {Array.from({ length: 7 }, (_, i) => {
          const a = (i / 7) * Math.PI * 2 + t * 6;
          return <circle key={i} cx={Math.cos(a) * 120} cy={Math.sin(a) * 90} r={34 + (i % 3) * 8} fill="#ffffff" opacity={0.85} />;
        })}
        {[0, 1, 2].map((i) => {
          const a = t * 9 + i * 2.1;
          return (
            <path
              key={`s${i}`}
              d="M 0 -18 L 5 -5 L 18 -5 L 8 3 L 12 16 L 0 8 L -12 16 L -8 3 L -18 -5 L -5 -5 Z"
              fill="#f7c948"
              transform={`translate(${Math.cos(a) * 150} ${Math.sin(a) * 110})`}
            />
          );
        })}
      </g>
    );
  }
  return <>{out}</>;
};

/* ------------------------------------------------------------------ */

export const RaceShort: React.FC<{ audio?: string | null }> = ({ audio = "audio/play-race-ref.wav" }) => {
  loadPlayFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / FPS;
  const sc = scroll(t);
  const ly = ledgeY(t);
  const knots = KNOT_Y + sc;
  // Poppy's rope snaps where she was when Mimi shouted her off
  const snapped = t >= T.bunnyFall;
  const snapBottom = 1160 - 240 + (sc - scroll(T.bunnyFall));

  let eagle: React.ReactNode = null;
  if (t >= T.eagleIn && t <= T.eagleOut + 0.05) {
    const e = eaglePos(t);
    eagle = (
      <g transform={`translate(${e.x} ${e.y}) scale(-1 1)`}>
        <Eagle flap={Math.sin(frame / 1.6)} />
      </g>
    );
  }

  const winAt = Math.round(T.win * fps);

  return (
    <AbsoluteFill style={{ background: "linear-gradient(#f8f4ef 0%, #efe8e1 60%, #e6ddd5 100%)" }}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <Ledge y={ly} />
        {LANE.map((x, i) => (
          <Rope
            key={x}
            x={x}
            top={Math.max(ly + 4, -40)}
            bottom={i === 3 && snapped ? snapBottom : knots}
            worldShift={sc % 24}
            frayed={i === 3 && snapped}
          />
        ))}
        {knots < H + 60 ? LANE.map((x, i) => (i === 3 && snapped ? null : <Knot key={x} x={x} y={knots} />)) : null}
        {RACERS.map(({ id, fn }) => {
          const st = fn(t, frame);
          if (st.show === false) return null;
          const C = CHAR[id];
          return (
            <g key={id} transform={`translate(${st.x} ${st.y}) rotate(${st.rot ?? 0}) scale(${SC})`}>
              <C {...st.pose} />
              {st.crown ? (
                <g transform={`translate(0 ${-CHAR_TOP[id] - 40 - (1 - st.crown) * 30}) scale(${0.4 + 0.6 * st.crown})`} opacity={Math.min(1, st.crown * 2)}>
                  <Crown />
                </g>
              ) : null}
            </g>
          );
        })}
        <Impacts t={t} />
        {eagle}
      </svg>
      <Headline text="Choose your champion!" from={schedule.headline[0]} until={schedule.headline[1]} y={500} dark size={74} />
      <Countdown marks={schedule.count as [number, string][]} end={schedule.countEnd} gap={5} y={668} size={140} />
      <Payoff text="WINNER!" from={winAt} y={480} size={116} />
      {frame >= winAt ? <Sparkle frame={frame - winAt} /> : null}
    </AbsoluteFill>
  );
};

/** A little burst of confetti dots around the payoff word, as in the reference. */
const Sparkle: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame > 40) return null;
  const k = frame / 40;
  const cols = ["#ff7a9a", "#7ac8ff", "#ffd45a", "#8fe0a8"];
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const r = 120 + k * 200;
        return <circle key={i} cx={540 + Math.cos(a) * r * 1.6} cy={480 + Math.sin(a) * r * 0.7} r={7 * (1 - k)} fill={cols[i % 4]} />;
      })}
    </svg>
  );
};
