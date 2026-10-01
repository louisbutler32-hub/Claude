import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { H, PANEL_TOP, W } from "../minecraft/beats";
import { ease, FaceKind, lerpPose, limb, Pose, POSE, Pt } from "../minecraft/figure";
import { loadMinecraftFonts } from "../minecraft/fonts";
import { HandDrawn } from "../minecraft/handdrawn";
import { Oofy, OofyTint, OOFY_TINT } from "../minecraft/oofy";
import B from "./beats.json";

/**
 * "Tennis time" — 7.9 seconds, starring Oofy.
 *
 * A remake of GarrettTheCarrot's "tennis time", on its own soundtrack. The
 * camera is on the viewer's side of the net, looking at the far baseline: Oofy
 * hits a high ball that grows toward the lens, an invisible return of the
 * viewer's own sends it back, and so on — every thirty frames the ball changes
 * ends, which is the beat of the music. The last time he dives, misses, and
 * lies on the court.
 */

export const TENNIS_FRAMES = B.frames;
export const TENNIS_CAPTION = ["Use the comment button", "to hit back!"];

const LINE = "#2a1b3d";
const K = 3.24; // the reference's measurement scale (its drawing is in half-size units)
const GY = (dy: number) => 200 + dy * K; // reference display y → our y
const X = (dx: number) => dx * K;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const smooth = (t: number) => t * t * (3 - 2 * t);

const KIT: OofyTint = { ...OOFY_TINT.normal };

/* ----------------------------------- the ball ----------------------------------- */

/** shapes measured off the reference: progress s → [screen y, radius] (in its half-size units) */
const SHAPE_A: [number, number, number][] = [[0, 133, 6], [0.06, 120, 8], [0.19, 90, 13], [0.375, 66, 18], [0.56, 61, 25], [0.75, 89, 32], [0.875, 197, 46], [1, 254, 57]];
const SHAPE_B: [number, number, number][] = [[0, 254, 57], [0.14, 142, 45], [0.29, 94, 33], [0.36, 78, 30], [0.43, 66, 27], [0.5, 62, 23], [0.57, 63, 20], [0.64, 73, 18], [0.79, 98, 12], [0.93, 131, 8], [1, 146, 6]];

const sample = (shape: [number, number, number][], s: number): [number, number] => {
  s = clamp01(s);
  for (let i = 1; i < shape.length; i++) {
    if (s <= shape[i][0]) {
      const a = shape[i - 1], b = shape[i], u = (s - a[0]) / (b[0] - a[0]);
      const e = u * u * (3 - 2 * u) * 0.35 + u * 0.65; // eased, but never stalls
      return [lerp(a[1], b[1], e), lerp(a[2], b[2], e)];
    }
  }
  return [shape[shape.length - 1][1], shape[shape.length - 1][2]];
};

type Ball = { x: number; y: number; r: number; spin: number; squash: number; ground: number };

const ballAt = (f: number): Ball | null => {
  const { fHits, oHits, ballStartX, ballNearX } = B;
  // the last time he reaches for it and misses: it floats up and rolls off to the right
  if (f >= B.fHits[3] + 2) {
    const t = f - (fHits[3] + 2);
    const pts: [number, number, number][] = [[198, 190, 74], [206, 222, 72], [210, 237, 120], [216, 256, 146], [224, 281, 156], [230, 296, 155], [238, 309, 162]];
    let a = pts[0], b = pts[pts.length - 1];
    for (let i = 1; i < pts.length; i++) if (f <= pts[i][0]) { a = pts[i - 1]; b = pts[i]; break; }
    const u = clamp01((f - a[0]) / (b[0] - a[0] || 1));
    void t;
    return { x: X(lerp(a[1], b[1], u)), y: GY(lerp(a[2], b[2], u)), r: 7 * K, spin: f * 0.6, squash: 1, ground: GY(lerp(a[2], b[2], u)) + 14 };
  }
  for (let k = 0; k < 4; k++) {
    const F = fHits[k], O = oHits[k];
    // out: from his racket to the viewer
    if (O !== undefined && f >= F - 2 && f < O) {
      const s = (f - (F - 2)) / (O - (F - 2));
      const [dy, r] = sample(SHAPE_A, s);
      const x0 = ballStartX[k], x1 = ballNearX[k];
      return { x: X(lerp(x0, x1, smooth(s))), y: GY(dy), r: r * K, spin: f * 0.5, squash: 1, ground: GY(lerp(148, 380, s ** 1.6)) };
    }
    // back: the viewer's return up to him
    if (O !== undefined && f >= O && f < (fHits[k + 1] ?? 9999) - 1) {
      const s = (f - O) / ((fHits[k + 1] - 1) - O);
      let [dy, r] = sample(SHAPE_B, s);
      const last = k === 2;
      if (last) dy = dy + (66 - 146) * smooth(clamp01((s - 0.55) / 0.45)); // the last lob goes over his head
      const x0 = ballNearX[k], x1 = ballStartX[k + 1];
      const squash = f < O + 3 ? 0.78 + 0.22 * ((f - O) / 3) : 1;
      return { x: X(lerp(x0, x1, smooth(s))), y: GY(dy), r: r * K, spin: -f * 0.5, squash, ground: GY(lerp(380, 148, s ** 0.7)) };
    }
  }
  if (f < fHits[0] - 2) return { x: X(134), y: GY(133), r: 6 * K, spin: 0, squash: 1, ground: GY(150) };
  return null;
};

const TennisBall: React.FC<{ b: Ball }> = ({ b }) => (
  <g transform={`translate(${b.x} ${b.y})`}>
    <ellipse cx={0} cy={0} rx={b.r} ry={b.r * b.squash} fill="#d9e640" stroke="#4a5a10" strokeWidth={Math.max(2.5, b.r * 0.08)} />
    <g transform={`rotate(${b.spin * 60})`} clipPath="none" fill="none" stroke="#ffffff" strokeWidth={Math.max(2, b.r * 0.1)} strokeLinecap="round">
      <path d={`M${-b.r * 0.8},${-b.r * 0.55} Q${-b.r * 0.1},${-b.r * 0.1} ${-b.r * 0.55},${b.r * 0.85}`} />
      <path d={`M${b.r * 0.8},${b.r * 0.55} Q${b.r * 0.1},${b.r * 0.1} ${b.r * 0.55},${-b.r * 0.85}`} />
    </g>
  </g>
);

/* ------------------------------------ the court ------------------------------------ */

const Court: React.FC = () => {
  const vp = -450;
  const lineX = (fr: number, y: number) => 540 + fr * 390 * ((y - vp) / (655 - vp));
  const stripes: React.ReactNode[] = [];
  for (let i = -5; i < 5; i++) {
    const f0 = i * 0.4, f1 = (i + 1) * 0.4;
    stripes.push(<polygon key={i} points={`${lineX(f0, 655)},655 ${lineX(f1, 655)},655 ${lineX(f1, 1920)},1920 ${lineX(f0, 1920)},1920`} fill={i % 2 ? "#5da25b" : "#69b066"} />);
  }
  return (
    <g>
      <rect x={0} y={PANEL_TOP} width={W} height={166} fill="#41683f" />
      <rect x={0} y={563} width={W} height={92} fill="#a4cd85" />
      <rect x={0} y={655} width={W} height={H - 655} fill="#5fa65d" />
      {stripes}
      {/* the chalk: baseline, singles lines, the centre line, the near area */}
      <g stroke="#e8f3dc" strokeLinecap="butt" fill="none">
        <path d="M0,655 H1080" strokeWidth={8} />
        <path d={`M${lineX(-1, 655)},655 L${lineX(-1, 1920)},1920 M${lineX(1, 655)},655 L${lineX(1, 1920)},1920`} strokeWidth={9} />
        <path d={`M${lineX(-0.62, 655)},655 L${lineX(-0.62, 1920)},1920 M${lineX(0.62, 655)},655 L${lineX(0.62, 1920)},1920`} strokeWidth={6} opacity={0.5} />
        <path d={`M${lineX(-1, 740)},740 H${lineX(1, 740)}`} strokeWidth={6} />
        <path d={`M${lineX(0, 740)},740 V1920`} strokeWidth={22} />
      </g>
    </g>
  );
};

const Net: React.FC = () => {
  const top = 832;
  return (
    <g>
      {/* the net's shadow on the court behind it */}
      <rect x={0} y={1010} width={W} height={60} fill="#1b3a1b" opacity={0.2} />
      <clipPath id="tnNet"><rect x={0} y={top + 24} width={W} height={150} /></clipPath>
      <rect x={0} y={top + 24} width={W} height={150} fill="#16241a" opacity={0.28} />
      <g clipPath="url(#tnNet)" stroke="#16160f" strokeWidth={5}>
        {Array.from({ length: 41 }, (_, i) => <path key={`v${i}`} d={`M${i * 27},${top + 24} V${top + 174}`} />)}
        {Array.from({ length: 7 }, (_, i) => <path key={`h${i}`} d={`M0,${top + 28 + i * 24} H1080`} />)}
      </g>
      <rect x={0} y={top} width={W} height={28} fill="#f5f9f0" stroke="#8aa38a" strokeWidth={3} />
      <rect x={500} y={top + 20} width={24} height={156} fill="#f0f5ea" opacity={0.95} />
    </g>
  );
};

/* ----------------------------------- the player ----------------------------------- */

const Racket: React.FC<{ angle: number; len?: number }> = ({ angle, len = 1 }) => (
  <g transform={`rotate(${angle})`}>
    <rect x={-7} y={-120 * len} width={14} height={124 * len} rx={6} fill="#2b2b3a" stroke={LINE} strokeWidth={4} />
    <g transform={`translate(0 ${-120 * len - 62})`}>
      <ellipse rx={48} ry={66} fill="#ffffff" opacity={0.22} />
      <g stroke="#e8eef7" strokeWidth={2.5} opacity={0.8}>
        {[-30, -15, 0, 15, 30].map((x) => <path key={x} d={`M${x},-60 V60`} />)}
        {[-42, -21, 0, 21, 42].map((y) => <path key={y} d={`M-44,${y} H44`} />)}
      </g>
      <ellipse rx={48} ry={66} fill="none" stroke="#3a6f93" strokeWidth={11} />
      <ellipse rx={48} ry={66} fill="none" stroke={LINE} strokeWidth={3} opacity={0.6} />
    </g>
  </g>
);

const PLAYER_S = 0.55;

/** where his feet are, screen x, as he runs to the next ball */
const bodyX = (f: number) => {
  const { fHits, oHits, xb } = B;
  let x = xb[0];
  for (let k = 0; k < 3; k++) x = lerp(x, xb[k + 1], ease(f, oHits[k] - 8, fHits[k + 1] - 7));
  return X(x);
};
const running = (f: number) => {
  const { fHits, oHits } = B;
  for (let k = 0; k < 3; k++) if (f >= oHits[k] - 8 && f < fHits[k + 1] - 7) return true;
  return false;
};

type Swing = { pose: Pose; racket: number; face: FaceKind };

const SWING_POSES = {
  ready: { arm: limb(-120, 70, -146, 14), racket: -12 },
  wind: { arm: limb(-150, 6, -178, -70), racket: -4 },
  contact: { arm: limb(-170, 50, -222, 40), racket: -88 },
  follow: { arm: limb(-120, 90, -60, 124), racket: -168 },
};

const swingAt = (f: number): Swing => {
  const { fHits } = B;
  let arm = SWING_POSES.ready.arm, racket = SWING_POSES.ready.racket;
  let face: FaceKind = "plain";
  const mix = (a: typeof SWING_POSES.ready, b: typeof SWING_POSES.ready, t: number) => {
    arm = [[lerp(a.arm[0][0], b.arm[0][0], t), lerp(a.arm[0][1], b.arm[0][1], t)], [lerp(a.arm[1][0], b.arm[1][0], t), lerp(a.arm[1][1], b.arm[1][1], t)]] as unknown as typeof arm;
    racket = lerp(a.racket, b.racket, t);
  };
  for (const F of fHits.slice(0, 3)) {
    if (f >= F - 9 && f < F - 3) mix(SWING_POSES.ready, SWING_POSES.wind, smooth((f - (F - 9)) / 6));
    else if (f >= F - 3 && f < F) mix(SWING_POSES.wind, SWING_POSES.contact, smooth((f - (F - 3)) / 3));
    else if (f >= F && f < F + 5) mix(SWING_POSES.contact, SWING_POSES.follow, smooth((f - F) / 5));
    else if (f >= F + 5 && f < F + 14) mix(SWING_POSES.follow, SWING_POSES.ready, smooth((f - F - 5) / 9));
  }
  // the sixth face of a man watching a ball come at him: calm, then "o", then a squint as it returns
  const o = B.oHits;
  if (f > o[0] - 12 && f < o[0] + 14) face = "surprised";
  if (f > o[1] - 12 && f < o[1] + 14) face = "surprised";
  if (f > o[2] - 12 && f < o[2] + 14) face = "surprised";
  if (f >= B.fHits[3] - 6) face = "gritted";
  const pose: Pose = { ...POSE.stand, armL: arm, armR: limb(86, 110, 80, 200) };
  return { pose, racket, face };
};

const Player: React.FC<{ f: number }> = ({ f }) => {
  const { dive } = B;
  const x0 = bodyX(f);
  const feetY = 735;
  let { pose, racket, face } = swingAt(f);
  let rot = 0, x = x0, y = feetY, rk: React.ReactNode = null;
  const shuffle = running(f) ? Math.sin(f * 0.9) : 0;
  pose = { ...pose, legL: limb(-40 + shuffle * 12, 228, -50 + shuffle * 28, 335 - Math.max(0, shuffle) * 18), legR: limb(40 + shuffle * 12, 228, 50 + shuffle * 28, 335 - Math.max(0, -shuffle) * 18) };
  const bob = running(f) ? Math.abs(Math.sin(f * 0.9)) * 5 : 0;
  // the last one: he goes for it, swings at nothing, and lies down on the court
  if (f >= dive[0]) {
    const u = ease(f, dive[0] + 2, dive[1]);
    rot = lerp(0, -90, u);
    x = x0 - 12 * u;
    pose = lerpPose(pose, { ...POSE.stand, armL: limb(-130, 40, -190, 120), armR: limb(130, 40, 200, 120), legL: limb(-30, 228, -30, 335), legR: limb(30, 228, 30, 335) }, ease(f, dive[0] + 4, dive[1]));
    face = f >= dive[0] + 6 ? "hurt" : "gritted";
    y = feetY - 28 * u;
    racket = lerp(racket, -200, u);
  }
  const showRacket = f < B.racketFly[0] + 1;
  return (
    <g>
      {/* his shadow on the court */}
      <ellipse cx={x + (f >= dive[0] ? -120 * ease(f, dive[0], dive[1]) : 0)} cy={feetY + 8} rx={70 + (f >= dive[0] ? 120 * ease(f, dive[0], dive[1]) : 0)} ry={12} fill="#1b3a1b" opacity={0.28} />
      <g transform={`translate(${x} ${y - bob}) rotate(${rot})`}>
        <Oofy x={0} y={-335 * PLAYER_S} scale={PLAYER_S} pose={pose} face={face} tint={KIT} shadow={false} look={[2, 2]}
          hands={({ L }) => (showRacket ? <g transform={`translate(${L[0]} ${L[1]})`}><Racket angle={racket} /></g> : null)} />
      </g>
      {rk}
    </g>
  );
};

/** the racket he lets go of, spinning away to the right */
const FlyingRacket: React.FC<{ f: number }> = ({ f }) => {
  if (f < B.racketFly[0]) return null;
  const pts: [number, number, number, number][] = [[197, 205, 110, -10], [203, 229, 135, 120], [207, 240, 142, 230], [211, 262, 140, 262], [216, 284, 154, 276], [238, 286, 156, 280]];
  let a = pts[0], b = pts[pts.length - 1];
  for (let i = 1; i < pts.length; i++) if (f <= pts[i][0]) { a = pts[i - 1]; b = pts[i]; break; }
  const u = clamp01((f - a[0]) / (b[0] - a[0] || 1));
  const x = X(lerp(a[1], b[1], u)), y = GY(lerp(a[2], b[2], u)), r = lerp(a[3], b[3], u);
  return <g transform={`translate(${x} ${y}) scale(0.55)`}><Racket angle={r} len={0.9} /></g>;
};

/* ----------------------------------- assembly ----------------------------------- */

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const ball = ballAt(f);
  // each time the viewer sends it back the whole picture takes the knock
  let sh = 0;
  for (const o of B.oHits) { const t = f - o; if (t >= 0 && t < 5) sh += Math.sin(t * 5) * 5 * (1 - t / 5); }
  const nearBall = ball && ball.r > 20 * K / 2.2;
  return (
    <g transform={`translate(${sh} ${sh * 0.6})`}>
      <Court />
      {/* the far-end action sits behind the net; the ball only crosses in front of it when it is near */}
      <Player f={f} />
      <FlyingRacket f={f} />
      {ball && !nearBall && <TennisBall b={ball} />}
      <Net />
      {ball && nearBall && (
        <g>
          <ellipse cx={ball.x} cy={Math.min(1900, ball.ground)} rx={ball.r * 0.9} ry={ball.r * 0.22} fill="#1b3a1b" opacity={0.28} />
          <TennisBall b={ball} />
        </g>
      )}
      {ball && !nearBall && <ellipse cx={ball.x} cy={Math.min(1900, ball.ground)} rx={ball.r * 0.9} ry={ball.r * 0.2} fill="#1b3a1b" opacity={0.22} />}
    </g>
  );
};

const CaptionBand: React.FC = () => (
  <div style={{ position: "absolute", left: 0, top: 0, width: W, height: PANEL_TOP, background: "#ffffff" }}>
    <div style={{ position: "absolute", left: 80, top: 111, fontFamily: "Selawik, 'Segoe UI', sans-serif", fontSize: 88, lineHeight: "118px", color: "#000", whiteSpace: "pre" }}>
      {TENNIS_CAPTION.join("\n")}
    </div>
  </div>
);

export const TennisShort: React.FC<{ audio?: string | null; drawn?: boolean }> = ({ audio = null, drawn = true }) => {
  loadMinecraftFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#5fa65d" }}>
      {audio && <Audio src={staticFile(audio)} />}
      <HandDrawn enabled={drawn} hold={1} boilEvery={2} boil={0.7} grain={0}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          <defs><clipPath id="tnPanel"><rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} /></clipPath></defs>
          <g clipPath="url(#tnPanel)"><Scene f={f} /></g>
        </svg>
      </HandDrawn>
      <CaptionBand />
    </AbsoluteFill>
  );
};

export const TennisThumb: React.FC = () => {
  loadMinecraftFonts();
  const f = 44; // the ball huge over the net, a frame before the return
  return (
    <AbsoluteFill style={{ backgroundColor: "#5fa65d" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs><clipPath id="tnPanelT"><rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} /></clipPath></defs>
        <g clipPath="url(#tnPanelT)"><Scene f={f} /></g>
      </svg>
      <CaptionBand />
    </AbsoluteFill>
  );
};
