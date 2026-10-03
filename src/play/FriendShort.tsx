import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { Bear, Bunny, Dog, type Pose } from "./chars";
import { loadPlayFonts } from "./text";
import { backOut, clamp01, FPS, Fingerprint, FingerRing, H, Hand, lerp, ramp, rnd, W } from "./finger-kit";

/**
 * "Will you be Biscuit's friend?" — the finger-in-the-NO-box Short.
 *
 * The viewer is told to put a finger on the screen and a 3-2-1 counts down
 * while three friends bounce on white. Then a hard cut with a record
 * scratch: a sign reading "Will you be my friend?" with a red fingerprint
 * stamped in the NO box, exactly where the finger was. Biscuit weeps, the
 * friends glare at the viewer, he throws the note in the bin and cries
 * under his blanket while the camera creeps in.
 *
 * Scenes (hard cuts): 0-3 s the count, 3-8 s the sign, 8-10.5 s the bin,
 * 10.5-16 s the bed.
 */

export const FRIEND_FRAMES = 16 * FPS;

/** where the finger is told to go, and where the fingerprint lands */
export const SPOT = { x: 790, y: 1090 };
const CUTS = [0, 3, 8, 10.5, 16];

const GREY = "#76767f";

/* ------------------------------------------------------------------ */

const Tears: React.FC<{ frame: number; eyes: [number, number][]; on: number; s?: number }> = ({ frame, eyes, on, s = 1 }) => {
  if (on <= 0) return null;
  const out: React.ReactNode[] = [];
  eyes.forEach(([ex, ey], side) => {
    const dir = side === 0 ? -1 : 1;
    for (let i = 0; i < 8; i++) {
      const k = ((frame * 0.8 + i * 4 + side * 2) % 30) / 30;
      out.push(
        <ellipse
          key={`${side}-${i}`}
          cx={ex + dir * (10 + k * 120 * s * (1 + rnd(i, 6) * 0.4))}
          cy={ey + k * 90 * s + k * k * 360 * s}
          rx={8 * s}
          ry={12 * s}
          fill="#7ed4ff"
          stroke="#3a8fd0"
          strokeWidth={3}
          opacity={on * (1 - k * 0.5)}
        />,
      );
    }
  });
  return <g>{out}</g>;
};

/** the red fingerprint stamp, with a thud */
const Stamp: React.FC<{ t: number }> = ({ t }) => {
  const dt = t - CUTS[1];
  if (dt < 0) return null;
  const k = clamp01(dt / 0.14);
  const s = lerp(2.0, 1, k * k);
  return <Fingerprint x={SPOT.x} y={SPOT.y} s={1.6 * s} opacity={clamp01(dt / 0.06) * 0.95} />;
};

const Paper: React.FC<{ t: number }> = ({ t }) => {
  const dt = t - CUTS[1];
  const pop = 1 + 0.05 * Math.exp(-dt * 12) * Math.cos(dt * 40);
  return (
    <g transform={`translate(540 890) rotate(-1.2) scale(${pop})`}>
      <rect x={-390} y={-370} width={780} height={740} rx={14} fill="#00000022" transform="translate(10 14)" />
      <rect x={-390} y={-370} width={780} height={740} rx={14} fill="#fbf8ee" stroke="#37363d" strokeWidth={7} />
      <circle cx={-330} cy={-326} r={13} fill="#d9524a" stroke="#37363d" strokeWidth={4} />
      <circle cx={330} cy={-326} r={13} fill="#d9524a" stroke="#37363d" strokeWidth={4} />
      <foreignObject x={-380} y={-290} width={760} height={260}>
        <div
          style={{
            fontFamily: "'ComicRelief', 'Comic Sans MS', sans-serif",
            fontSize: 92,
            fontWeight: 700,
            lineHeight: 1.08,
            color: "#26252b",
            textAlign: "center",
          }}
        >
          Will you be
          <br />
          my friend?
        </div>
      </foreignObject>
      <text x={-210} y={104 - 40} textAnchor="middle" fontFamily="'ComicRelief', sans-serif" fontWeight={700} fontSize={64} fill="#26252b">
        YES
      </text>
      <text x={250} y={104 - 40} textAnchor="middle" fontFamily="'ComicRelief', sans-serif" fontWeight={700} fontSize={74} fill="#c9232d">
        NO
      </text>
      <rect x={-290} y={96 - 10} width={160} height={160} fill="none" stroke="#37363d" strokeWidth={7} />
      <rect x={170} y={96 - 10} width={160} height={160} fill="none" stroke="#c9232d" strokeWidth={7} />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* scene 1: put your finger here, 3 2 1                                */
/* ------------------------------------------------------------------ */

const CountScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const hop = Math.abs(Math.sin(Math.PI * t * 1.7)) * 90;
  const air = hop > 8;
  const base: Pose = {
    eyes: "happy",
    mouth: "open",
    armL: air ? [-56, -76] : [-24, 42],
    armR: air ? [56, -76] : [24, 42],
    squash: air ? 1.06 : 0.94,
    wag: Math.sin(t * 20) * 16,
  };
  const word = ["3", "2", "1"][Math.min(2, Math.floor(t))];
  const local = t - Math.floor(t);
  return (
    <AbsoluteFill style={{ background: "#ffffff" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <ellipse cx={540} cy={1790} rx={260} ry={26} fill="#000" opacity={0.08} />
        <ellipse cx={230} cy={1790} rx={170} ry={22} fill="#000" opacity={0.08} />
        <ellipse cx={850} cy={1790} rx={170} ry={22} fill="#000" opacity={0.08} />
        <g transform={`translate(230 ${1780 - hop * 0.9}) scale(1.45)`}>
          <Bunny {...base} />
        </g>
        <g transform={`translate(540 ${1780 - hop}) scale(1.8)`}>
          <Dog {...base} />
        </g>
        <g transform={`translate(850 ${1780 - hop * 0.9}) scale(1.5)`}>
          <Bear {...base} />
        </g>
        <FingerRing x={SPOT.x} y={SPOT.y} r={108} frame={frame} colour="#e8394a" pulse={0.07} />
      </svg>
      <Hand text="put your finger on the screen" y={360} size={64} fill="#1e1c22" />
      <Hand text={word} y={560} size={190} fill="#e3363f" scale={0.6 + 0.4 * backOut(local / 0.22)} rotate={(Math.floor(t) % 2 ? 1 : -1) * 4} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* scene 2: the sign, and the sobbing                                  */
/* ------------------------------------------------------------------ */

const SignScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const dt = t - CUTS[1];
  const shake = dt < 0.3 ? Math.sin(dt * 90) * 8 * (1 - dt / 0.3) : 0;
  const BXc = 540;
  const BYc = 1790;
  const sob = Math.sin(frame * 0.55);
  const biscuit: Pose = {
    eyes: "closed",
    mouth: dt > 0.45 ? "shout" : "o",
    squash: 0.9 + 0.025 * Math.sin(frame * 0.9),
    tilt: sob * 3,
    armL: [-20, -86],
    armR: [20, -86],
  };
  const glare = dt > 0.6 ? 1 : 0;
  const pat = Math.sin(t * 9) * 16;
  const poppy: Pose = { eyes: glare ? "angry" : "open", mouth: "flat", look: [0, 0.2], armR: [66, -6 + pat], armL: [-30, 46], tilt: -2 };
  const bruno: Pose = { eyes: glare ? "angry" : "open", mouth: "flat", look: [0, 0.2], armR: [66, -6 - pat], armL: [-30, 46], tilt: 2 };
  return (
    <AbsoluteFill style={{ background: GREY }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }} >
        <g transform={`translate(${shake} 0)`}>
          <rect y={1700} width={W} height={H - 1700} fill="#66666f" />
          <g transform={`translate(230 1790) scale(1.45)`}>
            <Bunny {...poppy} />
          </g>
          <g transform={`translate(850 1790) scale(-1.5 1.5)`}>
            <Bear {...bruno} />
          </g>
          <g transform={`translate(${BXc} ${BYc}) scale(1.75)`}>
            <Dog {...biscuit} />
          </g>
          {/* the tissue he's crying into */}
          <g transform={`translate(${BXc} ${BYc - 138 * 1.75 * 0.9 + 10}) rotate(${sob * 5})`}>
            <path d="M -62 -26 C -30 -48 30 -48 62 -26 C 76 6 50 38 20 30 C -4 46 -40 36 -62 -26 Z" fill="#ffffff" stroke="#b9b9c4" strokeWidth={5} strokeLinejoin="round" />
          </g>
          <Tears frame={frame} eyes={[[BXc - 66, BYc - 164 * 1.75 * 0.9], [BXc + 66, BYc - 164 * 1.75 * 0.9]]} on={dt > 0.45 ? 1 : 0} s={1.2} />
        </g>
        <rect width={W} height={H} fill="#1f1f27" opacity={0.3} />
        <g transform={`translate(${shake} 0)`}>
          <Paper t={t} />
          <Stamp t={t} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* scene 3: the note goes in the bin                                   */
/* ------------------------------------------------------------------ */

const BinScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const dt = t - CUTS[2];
  const THROW0 = 0.55;
  const THROW1 = 1.18;
  const can = { x: 800, y: 1560 };
  const k = clamp01((dt - THROW0) / (THROW1 - THROW0));
  const hand = { x: 440, y: 1400 };
  const inCan = k >= 1;
  const ballX = lerp(hand.x, can.x, k);
  const ballY = lerp(hand.y, can.y - 330, k) - 420 * 4 * k * (1 - k);
  const wob = dt > THROW1 && dt < THROW1 + 0.5 ? Math.sin((dt - THROW1) * 38) * 3.5 * (1 - (dt - THROW1) / 0.5) : 0;
  const thrown = dt >= THROW0;
  const pose: Pose = {
    eyes: "closed",
    mouth: dt > 1.3 ? "shout" : "flat",
    squash: 0.92 + 0.02 * Math.sin(frame * 0.8),
    tilt: thrown && !inCan ? 6 : Math.sin(frame * 0.5) * 2,
    handR: thrown ? [92, -250 + 150 * ramp(dt, THROW0 + 0.1, THROW0 + 0.35)] : [70, -150],
    handL: [-40, -60],
  };
  return (
    <AbsoluteFill style={{ background: GREY }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <rect y={1620} width={W} height={H - 1620} fill="#60606a" />
        <ellipse cx={310} cy={1790} rx={290} ry={30} fill="#000" opacity={0.18} />
        <ellipse cx={can.x} cy={1792} rx={230} ry={28} fill="#000" opacity={0.2} />
        <g transform={`translate(310 1790) scale(2.05)`}>
          <Dog {...pose} />
        </g>
        {!thrown ? (
          <g transform={`translate(${hand.x} ${hand.y})`}>
            <circle r={64} fill="#fbf8ee" stroke="#37363d" strokeWidth={6} />
            <path d="M -30 -20 l 20 14 l 14 -26 l 10 30 l 24 -4 M -36 14 l 22 -6 l 10 22 l 20 -22" fill="none" stroke="#a9a9b2" strokeWidth={4} strokeLinecap="round" />
            <circle cx={14} cy={10} r={11} fill="#d9262f" />
          </g>
        ) : null}
        {/* the bin */}
        <g transform={`translate(${can.x} ${can.y}) rotate(${wob})`}>
          <path d="M -150 -300 L 150 -300 L 128 230 Q 0 262 -128 230 Z" fill="#a7aebc" stroke="#4e5463" strokeWidth={8} strokeLinejoin="round" />
          {[-90, -45, 0, 45, 90].map((x) => (
            <path key={x} d={`M ${x} -280 L ${x * 0.86} 224`} stroke="#8a91a1" strokeWidth={9} strokeLinecap="round" />
          ))}
          <ellipse cy={-300} rx={158} ry={34} fill="#6a7180" stroke="#4e5463" strokeWidth={8} />
          {/* the ball sits inside once it has dropped in */}
          {inCan ? <circle cx={0} cy={-300} r={52} fill="#fbf8ee" stroke="#37363d" strokeWidth={5} /> : null}
          <path d="M -158 -300 Q 0 -250 158 -300 L 150 -270 Q 0 -222 -150 -270 Z" fill="#a7aebc" stroke="#4e5463" strokeWidth={8} strokeLinejoin="round" />
        </g>
        {thrown && !inCan ? (
          <g transform={`translate(${ballX} ${ballY}) rotate(${k * 540})`}>
            <circle r={64} fill="#fbf8ee" stroke="#37363d" strokeWidth={6} />
            <path d="M -30 -20 l 20 14 l 14 -26 l 10 30 l 24 -4 M -36 14 l 22 -6 l 10 22 l 20 -22" fill="none" stroke="#a9a9b2" strokeWidth={4} strokeLinecap="round" />
            <circle cx={14} cy={10} r={11} fill="#d9262f" />
          </g>
        ) : null}
        <Tears frame={frame} eyes={[[310 - 78, 1790 - 164 * 2.05 * 0.92], [310 + 78, 1790 - 164 * 2.05 * 0.92]]} on={dt > 0.2 ? 1 : 0} s={1.4} />
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* scene 4: under the blanket                                          */
/* ------------------------------------------------------------------ */

const BedScene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const dt = t - CUTS[3];
  const zoom = lerp(1, 1.34, clamp01(dt / (CUTS[4] - CUTS[3])) ** 1.2);
  const sob = Math.sin(frame * 0.55);
  const pat = Math.sin(t * 9) * 14;
  const biscuit: Pose = { eyes: "closed", mouth: "shout", squash: 1, tilt: sob * 3 - 4, armL: [-30, 40], armR: [30, 40] };
  const poppy: Pose = { eyes: "angry", mouth: "flat", look: [0, 0.2], handR: [96, -50 + pat], handL: [-30, 40] };
  const bruno: Pose = { eyes: "angry", mouth: "flat", look: [0, 0.2], handR: [96, -50 - pat], handL: [-30, 40] };
  const FY = 1620; // bed top edge
  return (
    <AbsoluteFill style={{ background: "#6d6a78" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(540 1180) scale(${zoom}) translate(-540 -1180)`}>
          <rect width={W} height={H} fill="#6d6a78" />
          <rect x={0} y={0} width={W} height={1000} fill="#767384" />
          <rect x={600} y={170} width={300} height={380} rx={14} fill="#32385f" stroke="#555a85" strokeWidth={10} />
          <circle cx={820} cy={290} r={44} fill="#f6efc2" opacity={0.85} />
          {[[660, 230], [720, 330], [680, 440], [850, 450]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={5} fill="#f6efc2" opacity={0.75} />
          ))}
          <rect x={-40} y={1180} width={W + 80} height={800} fill="#4c4a68" />
          <rect x={-40} y={1130} width={W + 80} height={100} rx={40} fill="#4c4a68" />
          {/* friends behind the bed */}
          <g transform={`translate(175 ${FY - 120}) scale(1.75)`}>
            <Bunny {...poppy} />
          </g>
          <g transform={`translate(905 ${FY - 120}) scale(-1.75 1.75)`}>
            <Bear {...bruno} />
          </g>
          {/* pillow and Biscuit */}
          <rect x={250} y={880} width={580} height={250} rx={110} fill="#f1eff7" stroke="#b9b6cc" strokeWidth={8} />
          <g transform={`translate(540 1500) scale(1.95)`}>
            <Dog {...biscuit} />
          </g>
          <Tears frame={frame} eyes={[[540 - 74, 1500 - 164 * 1.95], [540 + 74, 1500 - 164 * 1.95]]} on={1} s={1.3} />
          {/* the blanket, drawn over his body */}
          <path
            d="M -60 1290 C 120 1262 250 1296 380 1286 C 520 1274 560 1252 700 1282 C 860 1316 950 1262 1140 1292 L 1140 2000 L -60 2000 Z"
            fill="#7f86c9"
            stroke="#4f56a0"
            strokeWidth={9}
            strokeLinejoin="round"
          />
          <path d="M 80 1400 q 120 -40 240 0 M 520 1450 q 140 -50 280 0 M 150 1580 q 100 -34 200 0 M 620 1620 q 120 -40 240 0" fill="none" stroke="#9aa1dc" strokeWidth={7} strokeLinecap="round" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */

export const FriendShort: React.FC<{ audio?: string | null }> = ({ audio = "audio/play-friend-mix.mp3" }) => {
  loadPlayFonts();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const scene = t < CUTS[1] ? 0 : t < CUTS[2] ? 1 : t < CUTS[3] ? 2 : 3;
  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff" }}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      {scene === 0 ? <CountScene t={t} frame={frame} /> : null}
      {scene === 1 ? <SignScene t={t} frame={frame} /> : null}
      {scene === 2 ? <BinScene t={t} frame={frame} /> : null}
      {scene === 3 ? <BedScene t={t} frame={frame} /> : null}
    </AbsoluteFill>
  );
};

