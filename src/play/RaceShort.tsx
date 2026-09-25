import React from "react";
import { AbsoluteFill, Audio, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CHAR, CHAR_IDS, CHAR_TOP, type CharId, type Pose } from "./chars";
import schedule from "./race-schedule.json";
import { Countdown, Headline, loadPlayFonts, Payoff } from "./text";

/**
 * "Choose your champion!" — the rope-race Short.
 *
 * Four ropes on a paper wall, the four characters at the bottom. 3-2-1-GO!
 * and they climb while the camera follows the leader; one slides, one
 * leaps, one slips and dangles. The ledge arrives with sky above it. The
 * first one up gets snatched by an eagle, the late one slips straight off
 * the edge, one yawns and rolls off in its sleep — and whoever is left
 * standing gets the crown.
 *
 * `winner` picks who is left standing. The other three take the other
 * roles, so the same engine renders four different episodes.
 */

export const W = 1080;
export const H = 1920;
export const RACE_FRAMES = schedule.duration;

const E = schedule.events;
const FPS = 30;
const T0 = schedule.go / FPS;

const ROPE_X = [180, 420, 660, 900];
const FLOOR_W = 1400; // world y the characters start on
const KNOT_W = 1250; // world y of the rope ends at the start
const CLIMB = 4200; // world units from the floor to the ledge
const LEDGE_W = FLOOR_W - CLIMB;
const CHAR_SCALE = 1.0;
/** the winner hops from its rope to the middle before the crown drops */
const HOP_START = 770;
const HOP_END = 790;
/** the eagle sweeps in from the right and leaves off the top-left */
const EAGLE_ENTER_X = 1400;
const EAGLE_EXIT_X = -420;

type Role = "winner" | "snatched" | "roller" | "slipper";

/** Who plays which part. Bun wants to be the fast one, Capy the sleeper,
 *  Mint the slipper; whoever is the winner hands their part to Pebblo. */
export const castRoles = (winner: CharId): Record<Role, CharId> => {
  const pref: Record<CharId, Role> = { pebblo: "winner", bun: "snatched", capy: "roller", mint: "slipper" };
  const roles = { ...pref };
  if (winner !== "pebblo") {
    roles.pebblo = pref[winner];
    roles[winner] = "winner";
  }
  const out = {} as Record<Role, CharId>;
  (Object.keys(roles) as CharId[]).forEach((c) => {
    out[roles[c]] = c;
  });
  return out;
};

/* ------------------------------------------------------------------ */
/* the climb — height above the floor, in world units, per role         */
/* ------------------------------------------------------------------ */

const f = (fr: number) => fr / FPS;
const lerpKf = (t: number, kf: [number, number][]) => {
  if (t <= kf[0][0]) return kf[0][1];
  for (let i = 1; i < kf.length; i++) {
    if (t <= kf[i][0]) {
      const [t0, h0] = kf[i - 1];
      const [t1, h1] = kf[i];
      const u = (t - t0) / (t1 - t0);
      return h0 + (h1 - h0) * u;
    }
  }
  return kf[kf.length - 1][1];
};

const HEIGHT: Record<Role, [number, number][]> = {
  snatched: [
    [T0, 0],
    [f(E.snatchedJump), 1560],
    [f(E.snatchedJump) + 0.12, 1560],
    [f(E.snatchedJump) + 0.55, 2000],
    [f(E.snatchedLands), CLIMB],
  ],
  winner: [
    [T0, 0],
    [f(E.winnerSlip), 3150],
    [f(E.winnerSlip) + 0.5, 2960],
    [f(E.winnerSlip) + 0.9, 2960],
    [f(E.winnerLands), CLIMB],
  ],
  roller: [
    [T0, 0],
    [f(E.rollerSlide), 900],
    [f(E.rollerSlide) + 1.0, 620],
    [f(E.rollerSlide) + 1.5, 620],
    [f(E.rollerLands), CLIMB],
  ],
  slipper: [
    [T0, 0],
    [f(E.slipperSlip), 2100],
    [f(E.slipperSlip) + 0.6, 1520],
    [f(E.slipperSlip) + 1.1, 1520],
    [f(E.slipperLands), CLIMB],
  ],
};

const heightOf = (role: Role, t: number) => lerpKf(t, HEIGHT[role]);
const leaderHeight = (t: number) => Math.max(...(Object.keys(HEIGHT) as Role[]).map((r) => heightOf(r, t)));

/** World y at the top of the screen. Follows the leader, never above the
 *  point that leaves the ledge sitting in the middle of the frame. */
const cameraTop = (t: number) => {
  const raw = FLOOR_W - leaderHeight(t) - 880;
  return Math.max(LEDGE_W - 900, Math.min(0, raw));
};

/* ------------------------------------------------------------------ */
/* scenery                                                             */
/* ------------------------------------------------------------------ */

const Rope: React.FC<{ x: number; top: number; bottom: number }> = ({ x, top, bottom }) => {
  const y0 = Math.max(top, -40);
  const y1 = Math.min(bottom, H + 40);
  if (y1 <= y0) return null;
  const ticks: React.ReactNode[] = [];
  const start = Math.ceil((y0 - top) / 26);
  const end = Math.floor((y1 - top) / 26);
  for (let i = start; i <= end; i++) {
    const y = top + i * 26;
    ticks.push(<path key={i} d={i % 2 ? `M ${x - 7} ${y} l 14 10` : `M ${x + 7} ${y} l -14 10`} />);
  }
  return (
    <g>
      <path d={`M ${x} ${top} L ${x} ${bottom}`} stroke="#b7955f" strokeWidth={18} strokeLinecap="round" />
      <path d={`M ${x} ${top} L ${x} ${bottom}`} stroke="#dcbf8e" strokeWidth={12} strokeLinecap="round" />
      <g stroke="#a98651" strokeWidth={3.5} strokeLinecap="round" opacity={0.8}>
        {ticks}
      </g>
    </g>
  );
};

const Knot: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <ellipse cx={x} cy={y} rx={14} ry={18} fill="#dcbf8e" stroke="#b7955f" strokeWidth={4} />
    <g stroke="#c9a66f" strokeWidth={4} strokeLinecap="round">
      <path d={`M ${x - 6} ${y + 14} l -4 22 M ${x} ${y + 16} l 2 24 M ${x + 6} ${y + 14} l 6 20`} />
    </g>
  </g>
);

/** Sky above, grass edge on the wall top. Only drawn once the ledge is near. */
const Ledge: React.FC<{ y: number }> = ({ y }) => {
  if (y < -200) return null;
  const scallops = Array.from({ length: 14 }, (_, i) => {
    const x = i * 84 + random(`gs${i}`) * 30;
    const d = 18 + random(`gd${i}`) * 26;
    return `M ${x} ${y} q 30 ${d} 60 0`;
  }).join(" ");
  return (
    <g>
      <defs>
        <linearGradient id="rsSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9e6f6" />
          <stop offset="100%" stopColor="#ecf7fc" />
        </linearGradient>
      </defs>
      <rect x={0} y={Math.min(y, 0) - 2400} width={W} height={y - Math.min(y, 0) + 2400} fill="url(#rsSky)" />
      <rect x={0} y={y - 4} width={W} height={12} fill="#a7c495" />
      <path d={scallops} fill="#b9d6a3" />
      <path d={`M 0 ${y} L ${W} ${y}`} stroke="#93b47f" strokeWidth={5} />
      {Array.from({ length: 9 }, (_, i) => {
        const x = 40 + i * 130 + random(`gt${i}`) * 60;
        return <path key={i} d={`M ${x} ${y + 2} q -6 -22 4 -34 q 8 14 6 34`} fill="#9dbf86" />;
      })}
    </g>
  );
};

const Eagle: React.FC<{ x: number; y: number; flap: number }> = ({ x, y, flap }) => (
  <g transform={`translate(${x} ${y})`}>
    <g fill="#8a5a3a" stroke="#4e3220" strokeWidth={6} strokeLinejoin="round">
      <path d={`M -30 -10 q -110 ${-70 - flap * 40} -230 ${-40 - flap * 70} q 60 30 100 60 q 40 20 130 30 Z`} />
      <path d={`M 30 -10 q 110 ${-70 - flap * 40} 230 ${-40 - flap * 70} q -60 30 -100 60 q -40 20 -130 30 Z`} />
      <ellipse cx={0} cy={0} rx={70} ry={42} />
      <path d="M -60 20 q -30 40 -70 46 q 30 -34 50 -60 Z" />
    </g>
    <circle cx={70} cy={-14} r={34} fill="#f4efe6" stroke="#4e3220" strokeWidth={6} />
    <path d="M 100 -14 l 34 8 l -30 16 Z" fill="#f2b23c" stroke="#4e3220" strokeWidth={4} strokeLinejoin="round" />
    <circle cx={80} cy={-20} r={5} fill="#2b2530" />
    <g stroke="#f2b23c" strokeWidth={7} strokeLinecap="round">
      <path d="M -20 36 l -6 30 M 20 36 l 6 30" />
    </g>
  </g>
);

const Crown: React.FC = () => (
  <g fill="#f7c948" stroke="#b8891a" strokeWidth={5} strokeLinejoin="round">
    <path d="M -52 20 L -60 -34 L -26 -6 L 0 -46 L 26 -6 L 60 -34 L 52 20 Z" />
    <circle cx={-60} cy={-36} r={7} />
    <circle cx={0} cy={-48} r={7} />
    <circle cx={60} cy={-36} r={7} />
  </g>
);

/* ------------------------------------------------------------------ */
/* one racer                                                           */
/* ------------------------------------------------------------------ */

/** Hand over hand up the rope, seen from behind. */
const climbPose = (frame: number, seed: number): Pose => {
  const ph = ((frame + seed * 5) % 14) / 14;
  const up = ph < 0.5;
  const reach = Math.sin(ph * Math.PI * 2);
  return {
    back: true,
    handL: up ? [-10, -236 - reach * 10] : [-10, -150],
    handR: up ? [10, -150] : [10, -236 + reach * 10],
    squash: 0.96 + reach * 0.03,
    tilt: reach * 3,
  };
};

const Racer: React.FC<{ id: CharId; role: Role; camTop: number; roles: Record<Role, CharId> }> = ({ id, role, camTop }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / FPS;
  const C = CHAR[id];
  const laneIdx = CHAR_IDS.indexOf(id);
  const x = ROPE_X[laneIdx];
  const h = heightOf(role, t);
  const landed = h >= CLIMB - 1;
  const ledgeY = LEDGE_W - camTop;
  const idle = frame < schedule.go;
  let pose: Pose = {};
  let px = x;
  let py = FLOOR_W - h - camTop;
  let extra: React.ReactNode = null;
  let rot = 0;

  if (idle) {
    const bob = Math.sin(frame / 9 + laneIdx) * 4;
    py += bob;
    const blink = (frame + laneIdx * 23) % 70 < 4;
    pose = { eyes: blink ? "closed" : "open", look: [0, 0.2] };
  } else if (!landed) {
    pose = climbPose(frame, laneIdx);
    // the moments that break the climb
    if (role === "roller" && frame >= E.rollerSlide && frame < E.rollerSlide + 45) {
      pose = { eyes: "dizzy", mouth: "flat", armL: [-40, -110], armR: [30, -110], tilt: Math.sin(frame / 2) * 8 };
    }
    if (role === "snatched" && frame >= E.snatchedJump && frame < E.snatchedJump + 20) {
      pose = { eyes: "happy", mouth: "open", armL: [-50, -80], armR: [50, -80], squash: 1.06 };
    }
    if (role === "slipper" && frame >= E.slipperSlip && frame < E.slipperSlip + 36) {
      pose = { eyes: "shock", mouth: "o", armL: [-60, -100], armR: [60, -100], tilt: Math.sin(frame / 1.5) * 10 };
    }
    if (role === "winner" && frame >= E.winnerSlip && frame < E.winnerSlip + 28) {
      pose = { eyes: "shock", mouth: "o", armL: [-20, -120], armR: [20, -120], tilt: -6 };
    }
  } else {
    // standing on the ledge
    py = ledgeY;
    const sinceLand = frame - (role === "snatched" ? E.snatchedLands : role === "winner" ? E.winnerLands : role === "roller" ? E.rollerLands : E.slipperLands);
    const landS = spring({ frame: sinceLand, fps, config: { damping: 9, mass: 0.5, stiffness: 200 } });
    pose = { squash: 1 - Math.sin(landS * Math.PI) * 0.12, eyes: "open", mouth: id === "mint" ? "grin" : "smile" };

    if (role === "snatched" && frame >= E.eagleGrab) {
      // carried off
      const u = interpolate(frame, [E.eagleGrab, E.eagleEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const ex = interpolate(u, [0, 1], [x, EAGLE_EXIT_X]);
      const ey = interpolate(Math.pow(u, 0.7), [0, 1], [ledgeY - 60, ledgeY - 1000]);
      px = ex;
      py = ey + 150;
      pose = { eyes: "shock", mouth: "o", armL: [-60, -110], armR: [60, -110], tilt: Math.sin(frame / 2) * 6 };
    }
    if (role === "slipper" && frame >= E.slipperOff) {
      const dt = (frame - E.slipperOff) / FPS;
      const pre = Math.min(dt, 0.35);
      px = x + pre * 90; // a step forward first...
      py = ledgeY + (dt > 0.35 ? 0.5 * 3200 * (dt - 0.35) ** 2 : 0) - (dt < 0.35 ? Math.sin((pre / 0.35) * Math.PI) * 30 : 0);
      rot = dt > 0.35 ? (dt - 0.35) * 260 : 0;
      pose = { eyes: "shock", mouth: "o", armL: [-70, -80], armR: [70, -80] };
    } else if (role === "slipper" && frame >= E.slipperLands + 8) {
      pose = { ...pose, eyes: "happy", mouth: "open" };
    }
    if (role === "roller" && frame >= E.rollerYawn) {
      const yawn = interpolate(frame, [E.rollerYawn, E.rollerOff], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      pose = { eyes: "closed", mouth: yawn < 0.5 ? "o" : "flat", tilt: yawn * 34, armL: [-40, 30], armR: [40, 30] };
      if (frame >= E.rollerOff) {
        const dt = (frame - E.rollerOff) / FPS;
        px = x + dt * 140;
        py = ledgeY + 0.5 * 3000 * dt * dt;
        rot = 34 + dt * 300;
        pose = { eyes: "closed", mouth: "o", armL: [-60, 0], armR: [60, 0] };
        extra = (
          <text x={40} y={-CHAR_TOP[id] - 10} fontFamily="'ComicRelief', sans-serif" fontSize={40} fill="#6b5a7a" opacity={0.7}>
            z
          </text>
        );
      } else {
        extra = (
          <g fontFamily="'ComicRelief', sans-serif" fill="#6b5a7a" opacity={0.75}>
            <text x={60} y={-CHAR_TOP[id] + 10 - ((frame * 2) % 60)} fontSize={34 + ((frame * 2) % 60) / 4}>
              z
            </text>
          </g>
        );
      }
    }
    if (role === "winner" && frame >= HOP_START) {
      // hop to the middle of the ledge, three little bounces
      const u = interpolate(frame, [HOP_START, HOP_END], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const ease = u * u * (3 - 2 * u);
      px = interpolate(ease, [0, 1], [x, W / 2]);
      py = ledgeY - Math.abs(Math.sin(u * Math.PI * 3)) * 34;
      if (frame < E.win) pose = { eyes: "happy", mouth: "smile", squash: 1 - Math.abs(Math.sin(u * Math.PI * 3)) * 0.05 };
    }
    if (role === "winner" && frame >= E.win) {
      const w = spring({ frame: frame - E.win, fps, config: { damping: 8, mass: 0.5, stiffness: 160 } });
      pose = { eyes: "happy", mouth: "open", armL: [-52, -76], armR: [52, -76], squash: 1 + Math.sin(w * Math.PI) * 0.06 };
      const drop = spring({ frame: frame - E.win - 6, fps, config: { damping: 10, mass: 0.8, stiffness: 120 } });
      extra = (
        <g transform={`translate(0 ${-CHAR_TOP[id] - 30 - (1 - drop) * 500}) scale(1.1)`} opacity={drop}>
          <Crown />
        </g>
      );
    }
  }

  if (py > H + 400) return null;
  return (
    <g transform={`translate(${px} ${py}) rotate(${rot}) scale(${CHAR_SCALE})`}>
      <C {...pose} />
      {extra}
    </g>
  );
};

/* ------------------------------------------------------------------ */

export const RaceShort: React.FC<{ winner?: CharId; audio?: string | null }> = ({
  winner = "pebblo",
  audio = "audio/play-race-mix.mp3",
}) => {
  loadPlayFonts();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const camTop = cameraTop(t);
  const roles = castRoles(winner);
  const roleOf = (id: CharId) => (Object.keys(roles) as Role[]).find((r) => roles[r] === id) as Role;
  const ledgeY = LEDGE_W - camTop;

  // the eagle's flight
  let eagle: React.ReactNode = null;
  if (frame >= E.eagleStart && frame <= E.eagleEnd + 10) {
    const sx = ROPE_X[CHAR_IDS.indexOf(roles.snatched)];
    const u1 = interpolate(frame, [E.eagleStart, E.eagleGrab], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const u2 = interpolate(frame, [E.eagleGrab, E.eagleEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const ex = frame < E.eagleGrab ? interpolate(u1, [0, 1], [EAGLE_ENTER_X, sx]) : interpolate(u2, [0, 1], [sx, EAGLE_EXIT_X]);
    const ey =
      frame < E.eagleGrab
        ? interpolate(u1 * u1, [0, 1], [ledgeY - 900, ledgeY - 60])
        : interpolate(Math.pow(u2, 0.7), [0, 1], [ledgeY - 60, ledgeY - 1000]);
    // drawn facing right; it flies leftwards the whole time, so mirror it
    eagle = (
      <g transform={`translate(${ex} ${ey}) scale(-1 1) translate(${-ex} ${-ey})`}>
        <Eagle x={ex} y={ey} flap={Math.sin(frame / 2.2)} />
      </g>
    );
  }

  return (
    <AbsoluteFill style={{ background: "linear-gradient(#f8f4ef 0%, #efe8e1 60%, #e6ddd5 100%)" }}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <Ledge y={ledgeY} />
        {ROPE_X.map((x) => (
          <Rope key={x} x={x} top={ledgeY + 6} bottom={KNOT_W - camTop} />
        ))}
        {ROPE_X.map((x) => (
          <Knot key={x} x={x} y={KNOT_W - camTop} />
        ))}
        {CHAR_IDS.map((id) => (
          <Racer key={id} id={id} role={roleOf(id)} camTop={camTop} roles={roles} />
        ))}
        {eagle}
      </svg>
      <Headline text="Choose your champion!" from={schedule.headlineFrom} until={schedule.headlineUntil} y={560} dark size={74} />
      <Countdown steps={["3", "2", "1", "GO!"]} from={schedule.countFrom} beat={schedule.countBeat} y={720} size={140} />
      <Payoff text="WINNER!" from={E.win} y={ledgeY - 520 > 200 ? Math.min(ledgeY - 520, 620) : 520} size={116} />
    </AbsoluteFill>
  );
};
