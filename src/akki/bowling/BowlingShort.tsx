import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { ease, H, INK, lerp, loadAkkiFonts, W } from "../common";
import { HandDrawn } from "../../minecraft/handdrawn";
import B from "./beats.json";
import { Luffy, lerpPose, P, Pose, Regular, RubberArm, Sanji, Zoro } from "./characters";
import { RegularChibi, RegularGaunt, RegularWrinkled, ZoroBig } from "./closeups";
import * as PS from "./poses";
import { Alley, Ball, BallKey, ballOnLane, BarSet, BrushBlue, Cam, CyanMottle, GlowDefs, NeonBokeh, proj } from "./sets";

/**
 * "One Piece Bowling" — 17.7s, a scene-for-scene redraw of the channel's own
 * short, every pixel drawn here in SVG. Luffy hand-delivers his ball with a
 * rubber arm, Sanji kicks his down the lane, Zoro throws three at once and
 * leaves every pin standing, and the Regular in the cyan T-shirt reacts in a
 * different drawing style every time we cut back to him.
 *
 * Shot boundaries and sound cues live in beats.json (the audio script reads
 * the same file). Characters animate on twos inside <HandDrawn>; cameras,
 * balls and flashes move on ones.
 */

export const BOWLING_FRAMES = B.frames; // 425 = 17.708s at 24fps, same as the original upload
const S = B.shots as unknown as Record<string, [number, number]>;
const C = B.cues;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const shake = (f: number, at: number, amp: number, len = 8): P => {
  const t = f - at;
  if (t < 0 || t > len) return [0, 0];
  const k = amp * (1 - t / len);
  return [Math.sin(t * 7.1) * k, Math.cos(t * 9.3) * k];
};
const Svg: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, ...style }}>{children}</svg>
);
/** characters: on twos with a light line boil */
const Drawn: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <HandDrawn hold={2} boil={0.45} grain={0} bleed={0.012}>{children}</HandDrawn>
);
const Shot: React.FC<{ k: string; children: React.ReactNode }> = ({ k, children }) => (
  <Sequence from={S[k][0]} durationInFrames={S[k][1] - S[k][0]} layout="none">{children}</Sequence>
);
const Vignette: React.FC<{ k?: number }> = ({ k = 0.55 }) => (
  <Svg>
    <defs>
      <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75">
        <stop offset="0.55" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor="#000" stopOpacity={k} />
      </radialGradient>
    </defs>
    <rect width={W} height={H} fill="url(#vig)" />
  </Svg>
);

/* ------------------------------------ title ------------------------------------ */

const Title: React.FC = () => (
  <Svg>
    <defs>
      <linearGradient id="opBlue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7cc8ff" />
        <stop offset="0.5" stopColor="#2a7ae8" />
        <stop offset="1" stopColor="#163fa8" />
      </linearGradient>
      <linearGradient id="opGold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff27a" />
        <stop offset="1" stopColor="#ffc20e" />
      </linearGradient>
    </defs>
    <text x={540} y={312} textAnchor="middle" fontFamily="Poppins Black" fontSize={112} letterSpacing={-3} fill="none" stroke="#06102c" strokeWidth={30} strokeLinejoin="round">ONE PIECE</text>
    <text x={540} y={312} textAnchor="middle" fontFamily="Poppins Black" fontSize={112} letterSpacing={-3} fill="none" stroke="#e8f0ff" strokeWidth={12} strokeLinejoin="round">ONE PIECE</text>
    <text x={540} y={312} textAnchor="middle" fontFamily="Poppins Black" fontSize={112} letterSpacing={-3} fill="url(#opBlue)">ONE PIECE</text>
    <text x={540} y={432} textAnchor="middle" fontFamily="Poppins Black" fontSize={84} fill="url(#opGold)" stroke="#2a1600" strokeWidth={16} paintOrder="stroke" strokeLinejoin="round">BOWLING</text>
  </Svg>
);

/* ------------------------------------ flashes ------------------------------------ */

const spiky = (cx: number, cy: number, r0: number, r1: number, n: number, seed: number) => {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const v = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
    const j = v - Math.floor(v);
    const r = i % 2 ? r0 * (0.8 + 0.3 * j) : r1 * (0.7 + 0.5 * j);
    pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return "M" + pts.join("L") + "Z";
};

const SpeedFlash: React.FC = () => {
  const d = "M-40,700 L420,850 L620,760 L700,930 L520,1000 L800,1050 L520,1110 L640,1260 L420,1170 L-40,1300Z";
  return (
    <Svg>
      <rect width={W} height={H} fill="#000" />
      <path d={d} fill="#ff2040" transform="translate(-14,6)" />
      <path d={d} fill="#20e0ff" transform="translate(14,-6)" />
      <path d={d} fill="#fffef6" />
    </Svg>
  );
};

/** the white-on-black / black-on-white impact sequence */
const ImpactFlash: React.FC<{ i: number }> = ({ i }) => {
  const sparkle = (x: number, y: number, r: number, c: string) => <path d={`M${x},${y - r} Q${x + r * 0.12},${y - r * 0.12} ${x + r},${y} Q${x + r * 0.12},${y + r * 0.12} ${x},${y + r} Q${x - r * 0.12},${y + r * 0.12} ${x - r},${y} Q${x - r * 0.12},${y - r * 0.12} ${x},${y - r}Z`} fill={c} />;
  if (i === 0) return <Svg><rect width={W} height={H} fill="#000" />{sparkle(500, 1050, 70, "#fff")}</Svg>;
  if (i === 1) return (
    <Svg>
      <rect width={W} height={H} fill="#000" />
      <path d="M150,0 Q120,600 80,1060 Q120,1500 150,1920 Q190,1500 230,1060 Q190,600 150,0Z" fill="#fff" />
      <path d={spiky(560, 1040, 150, 240, 64, 3)} fill="#fff" />
      <path d={spiky(250, 1060, 60, 110, 30, 5)} fill="#fff" />
    </Svg>
  );
  if (i === 2) return (
    <Svg>
      <rect width={W} height={H} fill="#fbfbf8" />
      <circle cx={420} cy={1020} r={86} fill="none" stroke={INK} strokeWidth={9} />
      {sparkle(470, 1050, 120, INK)}
      <path d="M180,1300 Q560,1340 620,1920 L0,1920 L0,1300Z" fill={INK} opacity={i === 2 ? 0 : 1} />
    </Svg>
  );
  return (
    <Svg>
      <rect width={W} height={H} fill="#fbfbf8" />
      <g stroke={INK} strokeWidth={10} strokeLinecap="round">
        {Array.from({ length: 70 }, (_, k) => {
          const a = (k / 70) * Math.PI * 2 + Math.sin(k * 3.1) * 0.08;
          const r0 = 40 + Math.abs(Math.sin(k * 5.7)) * 60, r1 = 170 + Math.abs(Math.sin(k * 2.3)) * 110;
          return <path key={k} d={`M${720 + Math.cos(a) * r0},${1000 + Math.sin(a) * r0} L${720 + Math.cos(a) * r1},${1000 + Math.sin(a) * r1}`} />;
        })}
      </g>
      <circle cx={720} cy={1000} r={110} fill={INK} />
    </Svg>
  );
};

/* -------------------------------- shared alley cams -------------------------------- */

const HEAD_Z = 17.4;
const FRONT: Cam = { x: 0, h: 1.65, z: -0.4, yaw: 0, f: 1150, cx: 540, cy: 860 };
const POV: Cam = { x: 0, h: 1.25, z: -0.6, yaw: 0, f: 1250, cx: 540, cy: 880 };
const DECK: Cam = { x: 0, h: 0.75, z: 14.4, yaw: 0, f: 1250, cx: 540, cy: 700 };

/* ------------------------------------ shots ------------------------------------ */

/** 1 — Luffy front, ball at the shoulder; wind-up; the ball swings into the lens */
const LuffyFront: React.FC = () => {
  const f = useCurrentFrame();
  const wind = ease(f, 9, 13), rel = ease(f, 15, 18);
  let p: Pose = lerpPose(PS.LUFFY_HOLD, PS.LUFFY_WIND, wind);
  if (f >= 15) p = lerpPose(PS.LUFFY_WIND, PS.LUFFY_RELEASE, rel);
  const bob = f < 9 ? Math.sin(f * 0.5) * 6 : 0;
  const LX = 540, LY = 1610, LS = 1.06;
  const holding = f < 16;
  // the ball in flight, in screen space, toward the lens
  const t = clamp01((f - 16) / 5);
  const start: P = [LX + p.haL[0] * LS, LY + p.haL[1] * LS - 50];
  const bx = lerp(start[0], 300, Math.pow(t, 1.4)), by = lerp(start[1], 1500, Math.pow(t, 1.2));
  const br = 52 * Math.pow(22, Math.pow(t, 1.6));
  const cam: Cam = { ...FRONT, x: lerp(0, -0.04, ease(f, 0, 24)), z: FRONT.z + ease(f, 0, 24) * 0.25 };
  return (
    <AbsoluteFill>
      <Alley cam={cam} />
      <Drawn>
        <Svg>
          <Regular p={PS.REG_STAND} x={190} y={1290} s={0.56} face="blank" lw={4} />
          <Luffy p={p} x={LX} y={LY + bob} s={LS} face={f < 9 ? "grin" : "focus"} lw={3.6} held={holding ? { L: "red", r: 50 } : undefined} />
        </Svg>
      </Drawn>
      {!holding && f < 22 && (
        <Svg><Ball x={bx} y={by} r={br} c="red" lw={Math.max(5, br * 0.04)} shade={br < 600} /></Svg>
      )}
      {f >= 22 && (
        <Svg>
          <defs>
            <radialGradient id="dark" cx="0.5" cy="0.3" r="0.9">
              <stop offset="0" stopColor="#3a1e24" />
              <stop offset="1" stopColor="#000" />
            </radialGradient>
          </defs>
          <rect width={W} height={H} fill="url(#dark)" />
        </Svg>
      )}
      <Vignette k={0.5} />
    </AbsoluteFill>
  );
};

/** 2 — the lunge, side-on, arm stretching off down the lane */
const LuffyLunge: React.FC = () => {
  const f = useCurrentFrame();
  const cam: Cam = { x: 2.6, h: 1.1, z: 1.2, yaw: -1.05, f: 900, cx: 520, cy: 720 };
  const push = 1 + ease(f, 0, 20) * 0.04;
  const stretch = ease(f, 0, 6);
  const LX = 600, LY = 1490, LS = 1.08;
  const p = PS.LUFFY_LUNGE;
  const sh: P = [LX + p.shL[0] * LS, LY + p.shL[1] * LS];
  const reach: P = [lerp(sh[0] - 300, -120, stretch), lerp(sh[1] + 120, 1060, stretch)];
  const [sx, sy] = shake(f, 0, 10, 6);
  return (
    <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px) scale(${push})` }}>
      <Alley cam={cam} />
      <Drawn>
        <Svg>
          <Regular p={PS.REG_STARTLE} x={905} y={1000} s={0.74} face="shock" lw={4} />
          <RubberArm from={sh} to={reach} w={19} lw={3.8} sag={12} hand="open" />
          <Luffy p={{ ...p, elL: [(reach[0] - LX) / LS * 0.3 + p.shL[0] * 0.7, p.shL[1] + 40], haL: [(reach[0] - LX) / LS * 0.35 + p.shL[0] * 0.65, p.shL[1] + 52], hL: "none" }} x={LX} y={LY} s={LS} face="focus" lw={3.6} />
        </Svg>
      </Drawn>
      <Vignette k={0.45} />
    </AbsoluteFill>
  );
};

/** 3 — the pin deck: the rubber arm hand-places the ball against the pins */
const PinPlace: React.FC = () => {
  const lf = useCurrentFrame();
  const f = lf + S.pinPlace[0];
  const cam: Cam = { x: 0.95, h: 0.42, z: 15.4, yaw: -0.36, f: 1100, cx: 640, cy: 820 };
  const arrive = ease(f, C.armArrive - 4, C.ballPlace);
  const z = lerp(15.9, HEAD_Z - 0.3, arrive);
  const ball = ballOnLane(cam, 0.02, z);
  const fall = clamp01((f - C.pinsFall) / 8);
  const [sx, sy] = shake(f, C.ballPlace, 8, 8);
  return (
    <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px)` }}>
      <Alley cam={cam} blueLane pins={{ fallen: f >= C.pinsFall ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : [], t: fall * 0.95 }} lanes={[-1, 0, 1]} />
      <Drawn>
        <Svg>
          {f >= C.armArrive - 4 && (
            <>
              <RubberArm from={[1180, ball.y + ball.r * 0.9 + 30]} to={[ball.x + ball.r * 0.75, ball.y + ball.r * 0.3]} w={Math.max(9, ball.r * 0.22)} lw={3} hand="open" />
              <Ball x={ball.x} y={ball.y} r={ball.r} c="red" lw={4} />
              <g transform={`translate(${ball.x + ball.r * 0.5},${ball.y - ball.r * 0.55}) rotate(160) scale(${ball.r / 70})`}>
                <path d="M0,0 q-18,-10 -36,4 M0,14 q-20,-8 -38,8 M0,28 q-18,-6 -34,10" stroke={INK} strokeWidth={3} fill="none" />
              </g>
            </>
          )}
        </Svg>
      </Drawn>
      {f === C.speedFlash && <SpeedFlash />}
      <Vignette k={0.55} />
    </AbsoluteFill>
  );
};

/** 4 — the Regular, wrinkled deadpan, slow push */
const RegWrinkle: React.FC = () => {
  const f = useCurrentFrame();
  const k = 1 + ease(f, 0, 24) * 0.05;
  return (
    <AbsoluteFill>
      <BrushBlue seed={3} />
      <AbsoluteFill style={{ transform: `scale(${k})`, transformOrigin: "50% 45%" }}>
        <Drawn><Svg><RegularWrinkled /></Svg></Drawn>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** the ball-return rack the Regular hides behind */
const BallRack: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-260,40 Q-250,-80 -120,-120 L180,-120 Q300,-80 300,40Z" fill="#141028" stroke="#3a5aff" strokeWidth={6} />
    <path d="M-262,40 L300,40" stroke="#4a7bff" strokeWidth={10} filter="url(#glowS)" />
    {(["red", "magenta", "purple", "red", "lime", "pink", "yellow", "red"] as BallKey[]).map((c, i) => (
      <Ball key={i} x={-200 + (i % 4) * 110 + (i > 3 ? 55 : 0)} y={i > 3 ? -60 : -110} r={52} c={c} lw={4} />
    ))}
  </g>
);

/** 5/6 — Sanji with the yellow ball; toss; the kick flash; the blurred kick */
const SanjiStand: React.FC = () => {
  const lf = useCurrentFrame();
  const f = lf + S.sanjiStand[0];
  const cam: Cam = { x: -2.2, h: 1.55, z: 0.4, yaw: 0.62, f: 860, cx: 540, cy: 760 };
  const SX = 710, SY = 1600, SS = 1.12;
  let p: Pose = PS.SANJI_STAND;
  let ball: { x: number; y: number } | null = null;
  if (f >= C.sanjiToss) {
    const t = (f - C.sanjiToss) / (C.sanjiKick - C.sanjiToss);
    p = t < 0.55 ? lerpPose(PS.SANJI_STAND, PS.SANJI_TOSS, ease(t, 0, 0.25)) : lerpPose(PS.SANJI_TOSS, PS.SANJI_CHAMBER, ease(t, 0.55, 1));
    const hand: P = [SX + PS.SANJI_TOSS.haL[0] * SS, SY + PS.SANJI_TOSS.haL[1] * SS];
    const up = Math.sin(Math.PI * clamp01(t * 1.05));
    ball = { x: hand[0] + t * 60, y: hand[1] - 70 - up * 210 + Math.max(0, t - 0.7) * 1400 };
  }
  const dark = 1 - ease(lf, 0, 2) * 0;
  return (
    <AbsoluteFill>
      <Alley cam={cam} lanes={[-1, 0, 1, 2]} dim={0.15 * dark} />
      <Drawn>
        <Svg>
          <defs><GlowDefs /></defs>
          <Regular p={PS.REG_STARTLE} x={250} y={1290} s={0.42} face="shock" lw={3} />
          <BallRack x={230} y={1250} s={1.0} />
          <Sanji p={p} x={SX} y={SY} s={SS} face="calm" lw={3.6} held={f < C.sanjiToss ? { L: "yellow", r: 54 } : undefined} />
          {ball && <Ball x={ball.x} y={ball.y} r={54} c="yellow" lw={4} />}
        </Svg>
      </Drawn>
      <Vignette k={0.5} />
    </AbsoluteFill>
  );
};

const SanjiFlash: React.FC = () => {
  const f = useCurrentFrame();
  const sil = (dx: number, col: string) => (
    <g transform={`translate(${dx},0)`} filter={`url(#to${col.slice(1)})`}>
      <Sanji p={PS.SANJI_KICK} x={720} y={1640} s={1.0} lw={3} />
      <Ball x={720 - 440} y={1640 - 480} r={70} c="yellow" />
    </g>
  );
  const flt = (id: string, r: number, g: number, b: number) => (
    <filter id={id}><feColorMatrix type="matrix" values={`0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  0 0 0 1 0`} /></filter>
  );
  if (f === 0) return (
    <Svg>
      <defs>{flt("toff2050", 1, 0.13, 0.31)}{flt("to20e0ff", 0.13, 0.88, 1)}{flt("tofffef6", 1, 1, 0.96)}</defs>
      <rect width={W} height={H} fill="#060408" />
      {sil(-14, "#ff2050")}{sil(14, "#20e0ff")}{sil(0, "#fffef6")}
    </Svg>
  );
  if (f === 1) return (
    <Svg>
      <rect width={W} height={H} fill="#060408" />
      <path d="M0,0 Q640,960 0,1920 L0,1920 L0,0Z" fill="#fbfaf6" transform="scale(1.35,1)" />
    </Svg>
  );
  return <Svg><rect width={W} height={H} fill="#f2f0f4" /></Svg>;
};

const SanjiKick: React.FC = () => {
  const f = useCurrentFrame();
  const cam: Cam = { x: -2.2, h: 1.55, z: 0.4, yaw: 0.62, f: 860, cx: 540, cy: 760 };
  const p = PS.SANJI_KICK;
  return (
    <AbsoluteFill style={{ transform: `rotate(${-3 + f}deg) scale(1.12)` }}>
      <AbsoluteFill style={{ filter: "blur(10px)" }}>
        <Alley cam={cam} lanes={[-1, 0, 1, 2]} dim={0.2} />
      </AbsoluteFill>
      <AbsoluteFill style={{ filter: "blur(7px)" }}>
        <Svg>
          <defs><GlowDefs /></defs>
          <Regular p={PS.REG_STARTLE} x={250} y={1290} s={0.42} face="shock" lw={3} />
          <BallRack x={230} y={1250} s={1.0} />
          <Sanji p={p} x={720} y={1640} s={1.08} lw={3.6} />
          {/* smear arcs */}
          <g stroke="#4a7bff" strokeWidth={10} fill="none" opacity={0.8} strokeLinecap="round">
            <path d="M120,1010 Q400,820 700,1060" />
            <path d="M160,1110 Q420,900 680,1140" stroke="#dfe8ff" strokeWidth={5} />
          </g>
          <Ball x={300 - f * 30} y={1120 + f * 20} r={92} c="yellow" lw={5} />
          <g stroke="#f4ff8a" strokeWidth={8} opacity={0.6}>
            {[0, 1, 2, 3].map((i) => <path key={i} d={`M${380 - f * 30},${1060 + i * 30 + f * 20} l${220},${-30}`} />)}
          </g>
        </Svg>
      </AbsoluteFill>
      <Vignette k={0.6} />
    </AbsoluteFill>
  );
};

/** 7 — POV down the lane: the yellow ball rockets away and lifts */
const LaneYellow: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / (S.laneYellow[1] - S.laneYellow[0]);
  // screen-space flight (keyframed off the reference timing)
  const path: [number, number, number, number][] = [[0, 400, 1560, 50], [0.33, 520, 1160, 24], [0.62, 690, 760, 13], [1, 1010, 560, 9]];
  let i = 0;
  while (i < path.length - 2 && t > path[i + 1][0]) i++;
  const [ta, xa, ya, ra] = path[i], [tb, xb, yb, rb] = path[i + 1];
  const u = clamp01((t - ta) / (tb - ta));
  const bx = lerp(xa, xb, u), by = lerp(ya, yb, u), br = lerp(ra, rb, u);
  const cam: Cam = { ...POV, z: POV.z + t * 0.6 };
  return (
    <AbsoluteFill>
      <Alley cam={cam} />
      <Svg>
        <Ball x={bx} y={by} r={br} c="yellow" lw={Math.max(2.5, br * 0.08)} />
        {f < 8 && <g stroke="#f4ff8a" strokeWidth={6} opacity={0.5}>{[0, 1, 2].map((k) => <path key={k} d={`M${bx - 20 + k * 20},${by + br + 10} l${-30 + k * 30},${120}`} />)}</g>}
      </Svg>
      <Vignette k={0.5} />
    </AbsoluteFill>
  );
};

/** 8 — chibi Regular (snap zoom out) */
const RegChibi: React.FC = () => {
  const f = useCurrentFrame();
  const k = f < 4 ? 1.5 : 1 + 0.03 * ease(f, 4, 18);
  return (
    <AbsoluteFill>
      <CyanMottle />
      <AbsoluteFill style={{ transform: `scale(${k})`, transformOrigin: "50% 30%" }}>
        <Drawn><Svg><RegularChibi /></Svg></Drawn>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 9 — tiny ball at the pins; impact flash; pins scatter */
const LaneImpact: React.FC = () => {
  const lf = useCurrentFrame();
  const f = lf + S.laneImpact[0];
  const cam: Cam = { ...POV, z: 1.5, h: 1.35 };
  const t = clamp01((f - S.laneImpact[0]) / (C.impactFlash - S.laneImpact[0]));
  const end = proj(cam, [0, 0.11, 17.3]);
  const bx = lerp(820, end[0], t), by = lerp(640, end[1], t * t), br = lerp(10, 5, t);
  const flash = f - C.impactFlash;
  const scatter = f >= C.pinsScatter ? clamp01((f - C.pinsScatter) / 10) * 1.6 + 0.25 : 0;
  const [sx, sy] = shake(f, C.pinsScatter, 16, 10);
  if (flash >= 0 && flash < 4) return <ImpactFlash i={flash} />;
  return (
    <AbsoluteFill style={{ transform: `translate(${sx}px,${sy}px)` }}>
      <Alley cam={cam} pins={{ scatter }} />
      {f < C.impactFlash && <Svg><Ball x={bx} y={by} r={br} c="yellow" lw={2.5} /></Svg>}
      <Vignette k={0.5} />
    </AbsoluteFill>
  );
};

/** 10 — gaunt Regular, blurred arcade wall */
const RegGaunt: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <NeonBokeh variant="arcade" />
      <AbsoluteFill style={{ transform: `scale(${1 + ease(f, 0, 18) * 0.03})`, transformOrigin: "40% 40%" }}>
        <Drawn><Svg><RegularGaunt /></Svg></Drawn>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 11/12 — Zoro: three balls, then the three-ball throw */
const ZoroLane: React.FC = () => {
  const lf = useCurrentFrame();
  const f = lf + S.zoroHold[0];
  const ZX = 540, ZY = 1580, ZS = 1.08;
  const throwT = f - C.zoroThrow;
  let p: Pose = PS.ZORO_HOLD;
  if (throwT >= 0) p = throwT < 3 ? lerpPose(PS.ZORO_HOLD, PS.ZORO_RELEASE, throwT / 3) : lerpPose(PS.ZORO_RELEASE, PS.ZORO_THROW, ease(throwT, 3, 6));
  const holding = throwT < 2;
  const cam: Cam = { ...FRONT, h: 1.8, cy: 820, z: -0.6 + (throwT >= 0 ? 0 : ease(lf, 0, 19) * 0.12) };
  // balls in flight (screen space): start at the hands/head, bounce toward the lens
  const H0 = { purple: [ZX + PS.ZORO_HOLD.haL[0] * ZS - 10, ZY + PS.ZORO_HOLD.haL[1] * ZS - 60], lime: [ZX + PS.ZORO_HOLD.haR[0] * ZS + 10, ZY + PS.ZORO_HOLD.haR[1] * ZS - 60], pink: [ZX, ZY - 1080 * ZS] } as Record<string, number[]>;
  const fly = (c: "purple" | "lime" | "pink", t: number) => {
    const [x0, y0] = H0[c];
    const tgt = { purple: [330, 1480, 112, -260], lime: [700, 1520, 118, 40], pink: [540, 1500, 96, 0] }[c];
    const t1 = clamp01(t / 8);
    let x = lerp(x0, tgt[0], t1), y = lerp(y0, tgt[1], t1 * t1) - (c === "pink" ? Math.sin(Math.PI * t1) * 380 : 0), r = lerp(62 * ZS * 0.9, tgt[2], t1);
    if (t > 8) {
      const u = t - 8;
      if (c === "pink") {
        // bounce, then roll away into the foreground spot
        const b = Math.abs(Math.sin(u * 0.4)) * 90 * Math.exp(-u * 0.25);
        x = lerp(tgt[0], 520, clamp01(u / 20));
        y = lerp(tgt[1], 1560, clamp01(u / 20)) - b;
        r = lerp(tgt[2], 84, clamp01(u / 20));
      } else {
        const b = Math.abs(Math.sin(u * 0.45)) * 70 * Math.exp(-u * 0.2);
        x = tgt[0] + tgt[3] * (u / 10);
        y = tgt[1] + u * 26 - b;
        r = tgt[2] + u * 4;
      }
    }
    return { x, y, r };
  };
  return (
    <AbsoluteFill>
      <Alley cam={cam} />
      <Drawn>
        <Svg>
          <Regular p={PS.REG_STAND} x={200} y={1240} s={0.5} face="blank" lw={4} />
          <Zoro p={p} x={ZX} y={ZY} s={ZS} face={throwT >= 3 ? "grin" : "calm"} lw={3.6} held={holding ? { L: "purple", R: "lime", head: "pink", r: 56 } : undefined} />
        </Svg>
      </Drawn>
      {!holding && (
        <Svg>
          {(["purple", "pink", "lime"] as const).map((c) => {
            const b = fly(c, throwT - 2);
            if (b.y - b.r > H) return null;
            return <Ball key={c} x={b.x} y={b.y} r={b.r} c={c} lw={5} />;
          })}
        </Svg>
      )}
      <Vignette k={0.45} />
    </AbsoluteFill>
  );
};

/** 13 — the pin deck: purple and lime into the gutters, pink rolls in, nothing falls */
const ZoroDeck: React.FC = () => {
  const lf = useCurrentFrame();
  const f = lf + S.zoroDeck[0];
  const cam: Cam = { ...DECK, z: DECK.z + ease(lf, 0, 40) * 0.25 };
  const u = (a: number, b: number) => clamp01((f - a) / (b - a));
  const purple = ballOnLane(cam, lerp(-0.32, -0.66, ease(u(S.zoroDeck[0], C.gutterL), 0, 1)), lerp(15.25, 16.9, ease(u(S.zoroDeck[0], C.gutterL + 20), 0, 1)), -0.05 * u(C.gutterL - 6, C.gutterL));
  const lime = ballOnLane(cam, lerp(0.34, 0.66, ease(u(S.zoroDeck[0], C.gutterR), 0, 1)), lerp(15.3, 17.1, ease(u(S.zoroDeck[0], C.gutterR + 20), 0, 1)), -0.05 * u(C.gutterR - 6, C.gutterR));
  const pk = u(S.zoroDeck[0], S.zoroDeck[1]);
  return (
    <AbsoluteFill>
      <Alley cam={cam} bigPanel lanes={[-1, 0, 1]} />
      <Svg>
        <Ball x={purple.x} y={purple.y} r={purple.r} c="purple" lw={4} />
        <Ball x={lime.x} y={lime.y} r={lime.r} c="lime" lw={4} />
        <Ball x={540 + Math.sin(pk * 3) * 6} y={lerp(1990, 1930, pk)} r={lerp(250, 222, pk)} c="pink" lw={7} />
      </Svg>
      <Vignette k={0.55} />
    </AbsoluteFill>
  );
};

/** 14/15 — Zoro bust, smug; then the colour drains out */
const ZoroBust: React.FC<{ bw?: boolean }> = ({ bw }) => {
  const f = useCurrentFrame();
  const k = 1 + ease(f, 0, 26) * (bw ? 0.025 : 0.015);
  return (
    <AbsoluteFill style={{ filter: bw ? "grayscale(1) contrast(1.1)" : undefined }}>
      <NeonBokeh variant="room" />
      <AbsoluteFill style={{ transform: `scale(${k})`, transformOrigin: "50% 45%" }}>
        <Drawn><Svg><g transform="translate(560,860) scale(1.55)"><ZoroBig expr="smug" lw={3.6} bw={bw} /></g></Svg></Drawn>
      </AbsoluteFill>
      <Vignette k={0.45} />
    </AbsoluteFill>
  );
};

/** 16 — Sanji doubled over laughing, pointing; Zoro seething */
const SanjiLaugh: React.FC = () => {
  const f = useCurrentFrame();
  const beat = Math.floor(f / 4) % 2;
  const sp = beat ? PS.SANJI_LAUGH2 : PS.SANJI_LAUGH;
  return (
    <AbsoluteFill>
      <NeonBokeh variant="two" />
      <Drawn>
        <Svg>
          <Sanji p={sp} x={840} y={1720 + beat * 8} s={1.45} face="laugh" lw={3.4} />
          <Zoro p={PS.ZORO_ANGRY} x={230} y={1880} s={1.62} face="grit" lw={3.4} />
        </Svg>
      </Drawn>
      <Vignette k={0.4} />
    </AbsoluteFill>
  );
};

/** 17 — extreme close-up: furious */
const ZoroRage: React.FC = () => {
  const f = useCurrentFrame();
  const [sx, sy] = [Math.sin(f * 2.1) * 2, Math.cos(f * 2.7) * 2];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Drawn>
        <Svg><g transform={`translate(${520 + sx},${700 + sy}) scale(${3.1 + ease(f, 0, 24) * 0.08})`}><ZoroBig expr="rage" lw={2.4} /></g></Svg>
      </Drawn>
    </AbsoluteFill>
  );
};

/** 18 — the brawl at the bar */
const Brawl: React.FC = () => {
  const lf = useCurrentFrame();
  const zoom = lerp(2.1, 1, ease(lf, 0, 7));
  const d = Math.floor(lf / 2) % 4;
  const z = PS.BRAWL_ZORO[d], s = PS.BRAWL_SANJI[d];
  const hit = Math.floor(lf / 2) % 2 === 0;
  const zx = [330, 340, 380, 320][d], sx = [720, 640, 700, 700][d];
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "30% 60%" }}>
      <BarSet />
      <Drawn>
        <Svg>
          <Zoro p={z.p} x={zx} y={1300 + z.dy * 0.54} s={0.54} face="grit" lw={5.5} />
          <Sanji p={s.p} x={sx} y={1300 + s.dy * 0.54} s={0.54} face="angry" lw={5.5} />
          {/* motion streaks + hit spark */}
          <g stroke={INK} strokeWidth={3} opacity={0.7} fill="none">
            {[0, 1, 2, 3].map((i) => <path key={i} d={`M${zx - 160 + i * 20},${1080 + i * 40 + d * 10} Q${(zx + sx) / 2},${1000 + i * 30} ${sx + 40},${1060 + i * 50 - d * 8}`} />)}
          </g>
          {hit && <path d={`M${(zx + sx) / 2},${1060 - d * 20} l14,-40 l10,34 l38,-14 l-26,30 l36,18 l-40,4 l6,40 l-22,-30 l-26,30 l6,-40 l-38,-6 l34,-18 l-24,-30 l36,12Z`} fill="#fff6c0" stroke={INK} strokeWidth={3} />}
        </Svg>
      </Drawn>
      <Vignette k={0.55} />
    </AbsoluteFill>
  );
};

/* ------------------------------------ the cut ------------------------------------ */

export const BowlingShort: React.FC<{ audio?: string | null }> = ({ audio }) => {
  loadAkkiFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#07050d" }}>
      <Shot k="luffyFront"><LuffyFront /></Shot>
      <Shot k="luffyLunge"><LuffyLunge /></Shot>
      <Shot k="pinPlace"><PinPlace /></Shot>
      <Shot k="regWrinkle"><RegWrinkle /></Shot>
      <Shot k="sanjiStand"><SanjiStand /></Shot>
      <Shot k="sanjiFlash"><SanjiFlash /></Shot>
      <Shot k="sanjiKick"><SanjiKick /></Shot>
      <Shot k="laneYellow"><LaneYellow /></Shot>
      <Shot k="regChibi"><RegChibi /></Shot>
      <Shot k="laneImpact"><LaneImpact /></Shot>
      <Shot k="regGaunt"><RegGaunt /></Shot>
      <Sequence from={S.zoroHold[0]} durationInFrames={S.zoroThrow[1] - S.zoroHold[0]} layout="none"><ZoroLane /></Sequence>
      <Shot k="zoroDeck"><ZoroDeck /></Shot>
      <Shot k="zoroSmug"><ZoroBust /></Shot>
      <Shot k="zoroBW"><ZoroBust bw /></Shot>
      <Shot k="sanjiLaugh"><SanjiLaugh /></Shot>
      <Shot k="zoroRage"><ZoroRage /></Shot>
      <Shot k="brawl"><Brawl /></Shot>
      {f < S.luffyLunge[1] && !(f >= 21 && f < 24) && <Title />}
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};

/** thumbnail: Zoro with the three balls, big "3 BALLS AT ONCE?!" */
export const BowlingThumb: React.FC = () => {
  loadAkkiFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#07050d" }}>
      <Alley cam={{ ...FRONT, h: 1.8, cy: 900, z: -0.4 }} />
      <Svg>
        <Zoro p={PS.ZORO_HOLD} x={540} y={1900} s={1.16} face="smug" lw={4} held={{ L: "purple", R: "lime", head: "pink", r: 60 }} />
      </Svg>
      <Vignette k={0.6} />
      <Svg>
        <g transform="rotate(-4 540 260)">
          <text x={540} y={225} textAnchor="middle" fontFamily="Poppins Black" fontSize={160} fill="#fff" stroke={INK} strokeWidth={30} paintOrder="stroke" strokeLinejoin="round">3 BALLS</text>
          <text x={540} y={390} textAnchor="middle" fontFamily="Poppins Black" fontSize={144} fill="#ffd21a" stroke={INK} strokeWidth={28} paintOrder="stroke" strokeLinejoin="round">AT ONCE?!</text>
        </g>
      </Svg>
    </AbsoluteFill>
  );
};
