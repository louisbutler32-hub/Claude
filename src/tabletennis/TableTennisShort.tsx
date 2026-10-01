import React from "react";
import { AbsoluteFill, Audio, random, staticFile, useCurrentFrame } from "remotion";
import { H, PANEL_TOP, W } from "../minecraft/beats";
import { ease, FaceKind, lerpPose, limb, Pose, POSE } from "../minecraft/figure";
import { loadMinecraftFonts } from "../minecraft/fonts";
import { HandDrawn } from "../minecraft/handdrawn";
import { Oofy, OofyTint, OOFY_TINT } from "../minecraft/oofy";
import B from "./beats.json";

/**
 * "POV: you never miss at table tennis" — 11.5 seconds, starring Oofy.
 *
 * You are standing at one end of the table; Oofy is at the other. He serves.
 * You hit it back — you can see your paddle at the bottom of the frame — and
 * every return is a little quicker than the last: the gap between hits shrinks
 * from 22 frames to 8, his swings turn to blurs, the speed readout climbs past
 * 900 km/h, and each hit is a note, so the rally is a melody that runs away
 * from him. Then the one he can't return gets him in the face.
 */

export const TT_FRAMES = B.frames;
export const TT_CAPTION = ["POV: you never miss", "at table tennis"];

const LINE = "#2a1b3d";
const MONO = "Monocraft, monospace";
const BLUE: OofyTint = { ...OOFY_TINT.normal, hoodie: "#2f6fe0" };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const smooth = (t: number) => t * t * (3 - 2 * t);

/* ------------------------------- the camera ------------------------------- */

// world: x across the table (m), z along it from your end (0) to his (2.74), h above the table top (m)
const F = 1400, YH = 440, HCAM = 1.5, ZC0 = 1.6;
const P = (x: number, h: number, z: number): [number, number, number] => {
  const zc = z + ZC0;
  return [540 + (F * x) / zc, YH + (F * (HCAM - h)) / zc, zc];
};
const BALL_R = 0.072; // a ball drawn a bit larger than life, or it vanishes at the far end

/* --------------------------------- the rally -------------------------------- */

type Hit = { f: number; who: "opp" | "you" };
const HITS = B.hits as Hit[];
const HX: number[] = HITS.map((_, i) => (random(`hx${i}`) - 0.5) * 0.7);

type BallState = { x: number; h: number; z: number; spin: number; visible: boolean };

const ballAt = (f: number): BallState => {
  const hits = HITS;
  if (f < hits[0].f) return { x: HX[0], h: 0.28, z: 2.9, spin: 0, visible: f > hits[0].f - 10 };
  for (let i = 0; i < hits.length - 1; i++) {
    const a = hits[i], b = hits[i + 1];
    if (f >= a.f && f < b.f) return leg(f, a, b, HX[i], HX[i + 1], b.who === "you");
  }
  const last = hits[hits.length - 1];
  if (f < B.bonk) {
    // your last one: it bounces on his half and goes for his face
    const b: Hit = { f: B.bonk, who: "opp" };
    return leg(f, last, b, HX[hits.length - 1], 0.05, true, 0.52);
  }
  // after the bonk: off his face, onto the table, and bounces itself out
  const bs = [B.bonk, ...B.afterBounces];
  for (let i = 0; i < bs.length - 1; i++) {
    if (f >= bs[i] && f < bs[i + 1]) {
      const u = (f - bs[i]) / (bs[i + 1] - bs[i]);
      const peak = i === 0 ? 0.5 : 0.34 * Math.pow(0.55, i - 1);
      const z0 = i === 0 ? 2.74 : 2.2 - i * 0.05, z1 = 2.2 - (i + 1) * 0.05;
      return { x: lerp(0.05, 0.1, i / 6), h: i === 0 ? lerp(0.62, 0, u) + 4 * peak * u * (1 - u) * 0 + Math.sin(u * Math.PI) * peak * 0.3 : Math.sin(u * Math.PI) * peak, z: i === 0 ? lerp(3.25, 2.2, u) : lerp(z0, z1, u), spin: f * 0.4, visible: true };
    }
  }
  const lastB = B.afterBounces[B.afterBounces.length - 1];
  return { x: 0.1, h: 0, z: 2.2 - 6 * 0.05 - (f - lastB) * 0.004, spin: f * 0.1, visible: true };
};

/** one leg of the rally: from a hit, down onto the receiving half, up to the next hit */
const leg = (f: number, a: Hit, b: Hit, xa: number, xb: number, toYou: boolean, bounceAt = 0.58): BallState => {
  const u = clamp01((f - a.f) / (b.f - a.f));
  const zHit = (w: "opp" | "you") => (w === "opp" ? 2.95 : -0.15);
  const z0 = zHit(a.who), z1 = toYou ? -0.15 : 2.95;
  const z = lerp(z0, z1, u);
  const x = lerp(xa, xb, smooth(u));
  const hHit = 0.26;
  // two arcs: hit height down to the table at the bounce, then up to the next hit
  let h: number;
  if (u < bounceAt) { const v = u / bounceAt; h = lerp(hHit, 0, v * v) + Math.sin(v * Math.PI) * 0.06; }
  else { const v = (u - bounceAt) / (1 - bounceAt); h = lerp(0, hHit, v * (2 - v)) * 1.0 + Math.sin(v * Math.PI) * 0.1; }
  return { x, h, z, spin: (toYou ? 1 : -1) * f * 0.6, visible: true };
};

/* --------------------------------- drawing --------------------------------- */

const Ball: React.FC<{ s: BallState }> = ({ s }) => {
  const [sx, sy, zc] = P(s.x, s.h, s.z);
  const r = (BALL_R * F) / zc;
  // its shadow on the table, so you can read the height
  const [gx, gy] = P(s.x, 0, s.z);
  return (
    <g>
      {s.h > 0.01 && <ellipse cx={gx} cy={gy} rx={r * 0.95} ry={r * 0.32} fill="#0b1f4a" opacity={0.35} />}
      <circle cx={sx} cy={sy} r={r} fill="#fff8e8" stroke={LINE} strokeWidth={Math.max(2.5, r * 0.14)} />
      <path d={`M${sx - r * 0.55},${sy - r * 0.2} q${r * 0.3},${-r * 0.5} ${r * 0.7},${-r * 0.1}`} transform={`rotate(${s.spin * 40} ${sx} ${sy})`} stroke="#f2a65a" strokeWidth={Math.max(2, r * 0.13)} fill="none" strokeLinecap="round" />
    </g>
  );
};

const Table: React.FC = () => {
  const c = (x: number, z: number): [number, number] => { const p = P(x, 0, z); return [p[0], p[1]]; };
  const pts = (list: [number, number][]) => list.map((p) => p.join(",")).join(" ");
  const W2 = 0.76, L = 2.74;
  const top = [c(-W2, 0), c(W2, 0), c(W2, L), c(-W2, L)];
  const edge = [c(-W2, 0), c(W2, 0), [c(W2, 0)[0], c(W2, 0)[1] + 34] as [number, number], [c(-W2, 0)[0], c(-W2, 0)[1] + 34] as [number, number]];
  // the net: 15 cm high, across the middle
  const nL = P(-W2 - 0.12, 0, L / 2), nR = P(W2 + 0.12, 0, L / 2);
  const nLt = P(-W2 - 0.12, 0.153, L / 2), nRt = P(W2 + 0.12, 0.153, L / 2);
  return (
    <g>
      <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#2b3150" />
      <rect x={0} y={PANEL_TOP} width={W} height={YH + 330 - PANEL_TOP} fill="#3a4170" />
      <rect x={0} y={YH + 330} width={W} height={H - YH - 330} fill="#262b48" />
      <rect x={0} y={YH + 322} width={W} height={12} fill="#1d2140" />
      {/* a gym wall: a row of padded panels, so the top of the frame is not empty */}
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={i * 190 - 20} y={PANEL_TOP + 40} width={170} height={YH + 250 - PANEL_TOP - 40} fill={i % 2 ? "#444b80" : "#3e4577"} stroke="#2f355f" strokeWidth={6} />)}
      {/* the legs, hidden mostly by the top */}
      {[[-W2 + 0.08, 0], [W2 - 0.08, 0], [-W2 + 0.08, L], [W2 - 0.08, L]].map(([x, z], i) => {
        const a = P(x, 0, z), b = P(x, -0.76, z);
        return <path key={i} d={`M${a[0]},${a[1]} L${b[0]},${b[1]}`} stroke="#1a1d34" strokeWidth={Math.max(6, 70 / a[2])} strokeLinecap="round" />;
      })}
      <polygon points={pts(edge)} fill="#163f80" stroke={LINE} strokeWidth={8} strokeLinejoin="round" />
      <polygon points={pts(top)} fill="#2467c4" stroke="#e8f1ff" strokeWidth={12} strokeLinejoin="round" />
      <path d={`M${c(0, 0)[0]},${c(0, 0)[1]} L${c(0, L)[0]},${c(0, L)[1]}`} stroke="#e8f1ff" strokeWidth={5} opacity={0.7} />
      {/* the net, drawn after the ball's first half so it sits in front of the far end */}
      <polygon points={`${nL[0]},${nL[1]} ${nR[0]},${nR[1]} ${nRt[0]},${nRt[1]} ${nLt[0]},${nLt[1]}`} fill="#dfe8f5" opacity={0.28} />
      <path d={`M${nLt[0]},${nLt[1]} L${nRt[0]},${nRt[1]}`} stroke="#ffffff" strokeWidth={9} strokeLinecap="round" />
      {Array.from({ length: 14 }, (_, i) => { const x = lerp(-W2 - 0.12, W2 + 0.12, i / 13); const a = P(x, 0, L / 2), b = P(x, 0.153, L / 2); return <path key={i} d={`M${a[0]},${a[1]} L${b[0]},${b[1]}`} stroke="#f0f5ff" strokeWidth={2} opacity={0.7} />; })}
      {[nL, nR].map((p, i) => { const t = i ? nRt : nLt; return <path key={i} d={`M${p[0]},${p[1]} L${t[0]},${t[1] - 12}`} stroke="#1a1d34" strokeWidth={10} strokeLinecap="round" />; })}
    </g>
  );
};

const Paddle: React.FC<{ angle: number; scale?: number; blur?: number }> = ({ angle, scale = 1, blur = 0 }) => {
  const one = (a: number, o: number, k: string) => (
    <g key={k} transform={`rotate(${a})`} opacity={o}>
      <rect x={-9} y={0} width={18} height={88} rx={8} fill="#c98f52" stroke={LINE} strokeWidth={5} />
      <ellipse cx={0} cy={-52} rx={72} ry={80} fill="#d6363f" stroke={LINE} strokeWidth={8} />
      <ellipse cx={0} cy={-56} rx={52} ry={58} fill="#b52a33" opacity={0.5} />
      <rect x={-8} y={-10} width={16} height={22} fill="#c98f52" stroke={LINE} strokeWidth={4} />
    </g>
  );
  return <g transform={`scale(${scale})`}>{blur > 0 && [1, 2, 3].map((i) => one(angle - i * 26 * blur, 0.22 / i, `b${i}`))}{one(angle, 1, "p")}</g>;
};

/* ---------------------------------- you ---------------------------------- */

/** your paddle, bottom-right of the frame, swinging across for every return */
const YourPaddle: React.FC<{ f: number }> = ({ f }) => {
  let sw = 0;
  for (const h of HITS) if (h.who === "you") { const t = f - h.f; if (t > -4 && t < 8) sw = Math.max(sw, t < 0 ? (t + 4) / 4 * 0.5 : 1 - t / 8); }
  const near = HITS.filter((h) => h.who === "you").map((h) => h.f);
  void near;
  const a = lerp(34, -26, smooth(sw));
  const x = lerp(930, 780, smooth(sw)), y = lerp(1880, 1640, smooth(sw));
  const fast = clamp01((f - 120) / 100);
  return (
    <g transform={`translate(${x} ${y}) scale(1.15)`}>
      <Paddle angle={a} blur={sw > 0.4 ? 0.3 + fast : 0} />
      {/* your hand, a bare white mitten */}
      <circle cx={0} cy={86} r={30} fill="#ffffff" stroke={LINE} strokeWidth={6} />
    </g>
  );
};

/* ------------------------------- the opponent ------------------------------- */

const OPP_S = 0.8;
const OPP_Z = 3.5;

const Opponent: React.FC<{ f: number }> = ({ f }) => {
  const [, feetY0, zc] = P(0, -0.76, OPP_Z);
  const hits = HITS.filter((h) => h.who === "opp");
  // which hit he is on: the faster it gets, the more of a wreck he is
  const done = HITS.filter((h) => h.f <= f).length;
  const stress = clamp01(done / HITS.length);
  const bonked = f >= B.bonk;
  // he follows the ball sideways, a little late and a little worse as it speeds up
  const b = ballAt(Math.min(f, B.bonk));
  const [tx] = P(b.x, 0, OPP_Z);
  const x = lerp(540, tx, 0.7) + (f < B.bonk ? Math.sin(f * 0.7) * 12 * stress : 0);
  const jitter = f < B.bonk ? Math.sin(f * 1.7) * 3 * stress : 0;
  const base = ((): Pose => ({ ...POSE.stand }))();
  // swing
  let arm = limb(-120, 70, -150, 20), ang = 20;
  let blur = 0;
  for (const h of hits) {
    const t = f - h.f;
    if (t >= -5 && t <= 7) {
      const u = t < 0 ? (t + 5) / 5 : 1 - t / 7;
      arm = limb(lerp(-120, -190, smooth(u)), lerp(70, 10, smooth(u)), lerp(-150, -230, smooth(u)), lerp(20, 40, smooth(u)));
      ang = lerp(20, -70, smooth(u)) + (t >= 0 ? 60 * smooth(t / 7) : 0);
      blur = clamp01((f - 80) / 110);
    }
  }
  let face: FaceKind = done < 3 ? "sly" : done < 6 ? "plain" : done < 9 ? "gritted" : done < 13 ? "worried" : "scream";
  let pose: Pose = { ...base, armL: arm, armR: limb(110, 70, 150, 40 - stress * 90), head: [base.head[0], base.head[1] + stress * 6] };
  let rot = 0, y = feetY0, px = x + jitter;
  if (bonked) {
    const u = ease(f, B.bonk + 1, B.bonk + 24);
    face = f < B.bonk + 30 ? "hurt" : "meh";
    rot = lerp(0, 96, u);
    px = x + 215 * u;
    y = feetY0 - 10 * u;
    pose = lerpPose(pose, { ...POSE.stand, armL: limb(-130, 30, -210, -90), armR: limb(130, 30, 210, -80), legL: limb(-40, 228, -60, 300), legR: limb(40, 228, 60, 300) }, ease(f, B.bonk + 2, B.bonk + 14));
  }
  const sc = (F * 1.0) / zc / 590 * 1.75 * 1.05;
  void sc;
  return (
    <g>
      <g transform={`translate(${px} ${y}) rotate(${rot})`}>
        <Oofy x={0} y={-335 * OPP_S} scale={OPP_S} pose={pose} face={face} tint={BLUE} shadow={false} look={[0, 2]}
          hands={({ L }) => (!bonked || f < B.bonk + 3) ? <g transform={`translate(${L[0]} ${L[1]})`}><Paddle angle={ang} scale={0.9} blur={blur} /></g> : null} />
      </g>
      {/* sweat flying off him as it gets worse */}
      {!bonked && done >= 6 && Array.from({ length: Math.min(6, done - 4) }, (_, i) => {
        const t = ((f * 0.6 + i * 3.1) % 9) / 9;
        const side = i % 2 ? 1 : -1;
        return <path key={i} transform={`translate(${px + side * (60 + t * 90)} ${y - 335 * OPP_S - 20 - 90 * t + 120 * t * t})`} d="M0,-14 q10,16 0,24 q-10,-8 0,-24 z" fill="#8fd2ff" stroke={LINE} strokeWidth={3} opacity={1 - t} />;
      })}
    </g>
  );
};

/* ------------------------------- the speed readout ------------------------------- */

const speedAt = (f: number) => {
  let gap = 30;
  for (let i = 0; i < HITS.length - 1; i++) if (f >= HITS[i].f && f < HITS[i + 1].f) gap = HITS[i + 1].f - HITS[i].f;
  if (f < HITS[0].f) return 0;
  if (f >= B.bonk) return 0;
  return Math.min(999, Math.round(10 * Math.pow(26 / gap, 2.6)));
};

const Speed: React.FC<{ f: number }> = ({ f }) => {
  const s = speedAt(f);
  const hot = s > 400;
  const blink = hot && Math.floor(f / 3) % 2 === 0;
  return (
    <g>
      <rect x={30} y={PANEL_TOP + 24} width={410} height={140} fill="#000" opacity={0.6} />
      <text x={56} y={PANEL_TOP + 68} fontFamily={MONO} fontSize={30} fill="#9db4e8">BALL SPEED</text>
      <text x={56} y={PANEL_TOP + 140} fontFamily={MONO} fontSize={64} fill={hot ? (blink ? "#ff4a4a" : "#ffffff") : "#7dff9d"}>{String(s).padStart(3, " ")}</text>
      <text x={250} y={PANEL_TOP + 140} fontFamily={MONO} fontSize={32} fill="#9db4e8">km/h</text>
    </g>
  );
};

/* -------------------------------- assembly -------------------------------- */

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const ball = ballAt(f);
  // the ball is in front of the net on your half and behind it on his; its draw order switches at the net
  const beforeNet = ball.z < 1.37;
  let sh = 0;
  for (const h of HITS) if (h.who === "you") { const t = f - h.f; if (t >= 0 && t < 5) sh += Math.sin(t * 5) * 4 * (1 - t / 5); }
  if (f >= B.bonk && f < B.bonk + 8) sh += Math.sin((f - B.bonk) * 3) * 12 * (1 - (f - B.bonk) / 8);
  return (
    <g transform={`translate(${sh} ${sh * 0.6})`}>
      <Table />
      <Opponent f={f} />
      {ball.visible && !beforeNet && <Ball s={ball} />}
      {ball.visible && beforeNet && <Ball s={ball} />}
      <YourPaddle f={f} />
    </g>
  );
};

const CaptionBand: React.FC = () => (
  <div style={{ position: "absolute", left: 0, top: 0, width: W, height: PANEL_TOP, background: "#ffffff" }}>
    <div style={{ position: "absolute", left: 80, top: 111, fontFamily: "Selawik, 'Segoe UI', sans-serif", fontSize: 88, lineHeight: "118px", color: "#000", whiteSpace: "pre" }}>
      {TT_CAPTION.join("\n")}
    </div>
  </div>
);

export const TableTennisShort: React.FC<{ audio?: string | null; drawn?: boolean }> = ({ audio = null, drawn = true }) => {
  loadMinecraftFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#2b3150" }}>
      {audio && <Audio src={staticFile(audio)} />}
      <HandDrawn enabled={drawn} hold={1} boilEvery={2} boil={0.7} grain={0}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          <defs><clipPath id="ttPanel"><rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} /></clipPath></defs>
          <g clipPath="url(#ttPanel)"><Scene f={f} /></g>
        </svg>
      </HandDrawn>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <Speed f={f} />
      </svg>
      <CaptionBand />
    </AbsoluteFill>
  );
};

export const TableTennisThumb: React.FC = () => {
  loadMinecraftFonts();
  const f = HITS[10].f + 2;
  return (
    <AbsoluteFill style={{ backgroundColor: "#2b3150" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs><clipPath id="ttPanelT"><rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} /></clipPath></defs>
        <g clipPath="url(#ttPanelT)"><Scene f={f} /></g>
        <Speed f={f} />
      </svg>
      <CaptionBand />
    </AbsoluteFill>
  );
};
