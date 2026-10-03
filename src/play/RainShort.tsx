import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { Bear, Bunny, Dog, type Pose } from "./chars";
import { loadPlayFonts } from "./text";
import { backOut, clamp01, Cloud, FPS, Hand, Heart, H, lerp, mix, Puff, ramp, rnd, Sparkle, W, win } from "./finger-kit";

/**
 * "Protect Biscuit from the rain!" — the hold-your-finger Short.
 *
 * Dusk, a storm, Biscuit the puppy sitting in a meadow. A dashed oval above
 * him says "hover your finger to protect Biscuit", and the rain really does
 * stop short of it, so it reads as an umbrella. The viewer holds still for
 * four seconds. The rain stops, Biscuit looks up hopefully, and lightning
 * hits straight through the oval. Then the comfort: Poppy brings ointment
 * and sprinkles good-luck sparkles, Bruno slaps on a giant band-aid, and
 * Biscuit is all better. The last frame cuts back to the first, so it loops.
 *
 * The story times are the format's: rain stops at 4 s, bolt at 5 s, the
 * crying from 6 s, ointment at 9 s, sparkles at 10 s, band-aid at 12.8 s,
 * recovered at 14.2 s, "feel better soon!" at 16.4 s.
 */

export const RAIN_FRAMES = 19 * FPS;

const T = {
  rainStop: 4.0,
  strike: 5.0,
  cry: 6.0,
  poppyIn: 6.3,
  squeeze: 9.0,
  sparkles: 10.0,
  brunoIn: 10.8,
  slap: 12.8,
  better: 14.2,
  caption: 16.4,
};

const BX = 540;
const BY = 1380;
const BSC = 2.05;
const OVAL = { x: 540, y: 640, rx: 270, ry: 96 };

const SKY_STORM: [string, string] = ["#34337a", "#7b76c6"];
const SKY_CLEAR: [string, string] = ["#9fd9fb", "#eaf7ff"];

/* ------------------------------------------------------------------ */

const Scenery: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const clear = ramp(t, 5.3, 8.2);
  const top = mix(SKY_STORM[0], SKY_CLEAR[0], clear);
  const bot = mix(SKY_STORM[1], SKY_CLEAR[1], clear);
  const hill1 = mix("#2d5c63", "#8fd9a3", clear);
  const hill2 = mix("#33685a", "#7fcf8f", clear);
  const field = mix("#3d7761", "#a4e69f", clear);
  const cloudCol = mix("#45448c", "#ffffff", clear);
  return (
    <g>
      <defs>
        <linearGradient id="rain-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bot} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#rain-sky)" />
      {[
        [180, 260, 1.3],
        [820, 180, 1.5],
        [560, 80, 1.8],
        [960, 420, 1.0],
      ].map(([x, y, s], i) => (
        <Cloud key={i} x={x + Math.sin(frame / 90 + i) * 14} y={y} s={s} fill={cloudCol} />
      ))}
      <path d="M -50 1180 C 150 1050 330 1060 520 1130 C 700 1190 860 1040 1130 1110 L 1130 1500 L -50 1500 Z" fill={hill1} />
      <path d="M -50 1260 C 200 1170 420 1230 620 1210 C 820 1190 960 1150 1130 1220 L 1130 1500 L -50 1500 Z" fill={hill2} />
      <rect x={0} y={1290} width={W} height={H - 1290} fill={field} />
      <path d="M 0 1290 C 270 1262 540 1318 810 1280 C 920 1266 1010 1272 1080 1284 L 1080 1330 L 0 1330 Z" fill={field} />
      {Array.from({ length: 26 }, (_, i) => {
        const fx = rnd(i, 3) * W;
        const fy = 1340 + rnd(i, 4) * 520;
        const s = 10 + rnd(i, 5) * 10;
        return (
          <g key={i} transform={`translate(${fx} ${fy})`} opacity={0.9}>
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx={0} cy={-s} rx={s * 0.5} ry={s * 0.8} fill={i % 3 ? "#ffffff" : "#d8b8ff"} transform={`rotate(${a})`} opacity={0.85} />
            ))}
            <circle r={s * 0.4} fill="#f6d65a" />
          </g>
        );
      })}
    </g>
  );
};

const Rain: React.FC<{ frame: number; t: number }> = ({ frame, t }) => {
  const live = 1 - ramp(t, 3.85, 4.2);
  if (live <= 0) return null;
  const N = 190;
  const drops: React.ReactNode[] = [];
  for (let i = 0; i < N; i++) {
    if (i / N > live) continue;
    const x0 = rnd(i, 1) * (W + 300) - 60;
    const len = 56 + rnd(i, 2) * 70;
    const speed = 38 + rnd(i, 3) * 26;
    const phase = rnd(i, 4) * (H + 400);
    const y = ((frame * speed + phase) % (H + 400)) - 200;
    const x = x0 - frame * 0 - y * 0.14;
    // the "umbrella": nothing falls through the oval or in the column under it
    const inCol = Math.abs(x - OVAL.x) < OVAL.rx + 18 && y > OVAL.y - OVAL.ry * 0.4 && y < 1280;
    if (inCol) continue;
    drops.push(<line key={i} x1={x} y1={y} x2={x - len * 0.14} y2={y + len} stroke="#cfe3ff" strokeWidth={4.5} strokeLinecap="round" opacity={0.7} />);
  }
  // splashes in the grass
  const splashes = Array.from({ length: 22 }, (_, i) => {
    const sx = rnd(i, 9) * W;
    if (Math.abs(sx - OVAL.x) < OVAL.rx + 18) return null;
    const sy = 1340 + rnd(i, 10) * 480;
    const k = ((frame + i * 5) % 12) / 12;
    return <ellipse key={i} cx={sx} cy={sy} rx={8 + k * 22} ry={3 + k * 7} fill="none" stroke="#e6f1ff" strokeWidth={3} opacity={(1 - k) * 0.7 * live} />;
  });
  return (
    <g>
      {drops}
      {splashes}
    </g>
  );
};

/** the dashed oval that stands for the finger-umbrella */
const Oval: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const a = win(t, 0.1, 4.05, 0.2);
  if (a <= 0) return null;
  const p = 1 + 0.03 * Math.sin(frame / 4);
  return (
    <g transform={`translate(${OVAL.x} ${OVAL.y}) scale(${p})`} opacity={a} fill="none" strokeWidth={11} strokeLinecap="round">
      <ellipse rx={OVAL.rx} ry={OVAL.ry} fill="#ffffff" fillOpacity={0.08} stroke="#e8394a" strokeDasharray="44 44" strokeDashoffset={-frame * 2} />
      <ellipse rx={OVAL.rx} ry={OVAL.ry} stroke="#4f7cff" strokeDasharray="44 44" strokeDashoffset={-frame * 2 - 44} />
    </g>
  );
};

const Bolt: React.FC<{ t: number }> = ({ t }) => {
  const dt = t - T.strike;
  if (dt < 0 || dt > 0.3) return null;
  const pts = "620,-30 540,170 600,240 500,470 566,540 510,780 548,860 532,1000";
  const flick = dt < 0.1 ? 1 : 0.65 + 0.35 * Math.sin(dt * 90);
  return (
    <g opacity={flick}>
      <polyline points={pts} fill="none" stroke="#ffe36b" strokeWidth={46} strokeLinejoin="round" strokeLinecap="round" opacity={0.55} />
      <polyline points={pts} fill="none" stroke="#ffffff" strokeWidth={20} strokeLinejoin="round" strokeLinecap="round" />
    </g>
  );
};

/* ------------------------------------------------------------------ */

const Tears: React.FC<{ frame: number; on: number }> = ({ frame, on }) => {
  if (on <= 0) return null;
  const out: React.ReactNode[] = [];
  for (const side of [-1, 1]) {
    for (let i = 0; i < 9; i++) {
      const k = ((frame * 0.8 + i * 4.4 + (side > 0 ? 2 : 0)) % 32) / 32;
      const x = BX + side * (78 + k * 150 * (1 + rnd(i, 6) * 0.4));
      const y = BY - 164 * BSC + 8 + k * 120 + k * k * 420;
      out.push(<ellipse key={`${side}${i}`} cx={x} cy={y} rx={9} ry={14} fill="#7ed4ff" stroke="#3a8fd0" strokeWidth={3} opacity={on * (1 - k * 0.5)} />);
    }
  }
  return <g>{out}</g>;
};

const Ointment: React.FC<{ squeeze: number }> = ({ squeeze }) => (
  <g>
    <g transform={`scale(${1 - squeeze * 0.12} ${1 + squeeze * 0.08})`}>
      <path d="M -26 -120 L 26 -120 L 22 40 L -22 40 Z" fill="#f4f6ff" stroke="#6b6f9c" strokeWidth={6} strokeLinejoin="round" />
      <path d="M -24 -60 L 24 -60 L 23 -20 L -23 -20 Z" fill="#ff6b81" />
      <path d="M -14 40 L 14 40 L 10 70 L -10 70 Z" fill="#ff6b81" stroke="#6b6f9c" strokeWidth={5} strokeLinejoin="round" />
      <path d="M -26 -120 q 26 -22 52 0" fill="#ff6b81" stroke="#6b6f9c" strokeWidth={5} />
      <text x={0} y={-30} textAnchor="middle" fontSize={22} fontWeight={800} fill="#ffffff" fontFamily="'Fredoka', sans-serif">
        OW!
      </text>
    </g>
  </g>
);

const Bandage: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <rect x={-190} y={-58} width={380} height={116} rx={58} fill="#f2c79a" stroke="#a9754a" strokeWidth={8} />
    <rect x={-70} y={-58} width={140} height={116} fill="#fbe0bf" stroke="#a9754a" strokeWidth={6} />
    {[-150, -118, -86, 86, 118, 150].map((x) => (
      <g key={x}>
        <circle cx={x} cy={-22} r={6} fill="#c8935f" />
        <circle cx={x} cy={22} r={6} fill="#c8935f" />
      </g>
    ))}
    <path d="M -50 -34 L 50 -34 M -50 0 L 50 0 M -50 34 L 50 34" stroke="#e8bd8f" strokeWidth={6} strokeLinecap="round" />
  </g>
);

/* ------------------------------------------------------------------ */

export const RainShort: React.FC<{ audio?: string | null }> = ({ audio = "audio/play-rain-mix.mp3" }) => {
  loadPlayFonts();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const dt = t - T.strike;

  /* --- Biscuit --- */
  const charred = dt < 0 ? 0 : 1 - ramp(t, 13.6, 14.4);
  const zapping = dt >= 0 && dt < 0.22;
  const crying = t >= T.cry && t < T.better;
  const recovered = t >= T.better;
  let biscuit: Pose;
  if (t < T.rainStop) {
    biscuit = { eyes: "open", mouth: "flat", look: [0, 0.3], squash: 0.9, tilt: Math.sin(frame * 1.9) * 1.6, armL: [-26, 36], armR: [26, 36], wag: 0 };
  } else if (dt < 0) {
    biscuit = { eyes: "sparkle", mouth: "smile", look: [0, -1], squash: 0.95 + 0.02 * Math.sin(frame / 5), tilt: 0, armL: [-26, 36], armR: [26, 36], wag: Math.sin(frame / 3) * 12 };
  } else if (zapping) {
    biscuit = { eyes: "shock", mouth: "o", squash: 1.1, tilt: (frame % 2 ? 1 : -1) * 5, armL: [-70, -50], armR: [70, -50] };
  } else if (t < T.cry) {
    biscuit = { eyes: "dizzy", mouth: "o", squash: 0.9, tilt: Math.sin(frame / 3) * 2, armL: [-30, 30], armR: [30, 30] };
  } else if (crying) {
    const hug = ramp(t, 13.0, 14.0);
    biscuit = {
      eyes: "closed",
      mouth: "shout",
      squash: 0.9 + 0.025 * Math.sin(frame * 0.9),
      tilt: Math.sin(frame * 0.55) * 3,
      armL: [-30 + hug * 10, 30],
      armR: [30 - hug * 10, 30],
    };
  } else {
    biscuit = { eyes: "happy", mouth: "open", squash: 1 + 0.03 * Math.sin(frame / 4), tilt: Math.sin(frame / 8) * 2, armL: [-60, -70], armR: [60, -70], wag: Math.sin(frame / 2.5) * 22, fx: "hearts" };
  }
  const bFilter = `brightness(${lerp(1, 0.28, charred)}) saturate(${lerp(1, 0.35, charred)})${zapping && frame % 2 ? " invert(1)" : ""}`;
  const bx = BX + (zapping ? (frame % 2 ? 6 : -6) : 0);

  /* --- Poppy: floats down under an umbrella with the ointment --- */
  const pDesc = ramp(t, T.poppyIn, T.poppyIn + 1.9);
  const poppyX = lerp(880, 745, pDesc) + Math.sin(t * 1.3) * 8 * pDesc;
  const poppyY = lerp(-460, 905, pDesc) + Math.sin(t * 2.4) * 12 * pDesc;
  const sq = ramp(t, T.squeeze - 0.2, T.squeeze + 0.15) * (1 - ramp(t, T.squeeze + 0.3, T.squeeze + 0.6));
  const poppyScale = 1.5;
  const poppyPose: Pose = {
    eyes: recovered ? "happy" : "open",
    mouth: recovered ? "open" : "o",
    look: [-1, 0.4],
    handL: [-72, -212],
    handR: [78, -104],
    squash: 1 - 0.04 * sq,
    tilt: recovered ? Math.sin(frame / 6) * 4 : Math.sin(t * 1.3) * 3,
    wag: Math.sin(frame / 5) * 10,
  };
  const umbX = poppyX + 72 * poppyScale + 6;
  const umbY = poppyY - 212 * poppyScale - 130;
  const tubeX = poppyX - 78 * poppyScale;
  const tubeY = poppyY - 104 * poppyScale - 60;

  /* --- Bruno: brings the band-aid from the left --- */
  const bIn = ramp(t, T.brunoIn, T.brunoIn + 1.6);
  const lunge = ramp(t, T.slap - 0.25, T.slap) * (1 - ramp(t, T.slap + 0.05, T.slap + 0.55));
  const brunoX = lerp(-260, 215, bIn) + lunge * 120;
  const brunoHop = bIn < 1 ? Math.abs(Math.sin(t * 8)) * 36 : 0;
  const brunoPose: Pose = {
    eyes: recovered ? "happy" : "open",
    mouth: recovered ? "open" : "o",
    look: [1, 0.3],
    handL: [-34, -112],
    handR: [34, -112],
    squash: 1 - 0.04 * lunge,
    tilt: recovered ? -Math.sin(frame / 7) * 4 : 0,
  };
  const brunoScale = 1.7;
  const bandCarry = t < T.slap;
  const slapK = ramp(t, T.slap - 0.2, T.slap);
  // band-aid: held in front of Bruno, then slapped diagonally across Biscuit's head
  const bandX = bandCarry ? lerp(brunoX + 70, 450, slapK) : 540;
  const bandY = bandCarry ? lerp(1370 - 170 - brunoHop, 872, slapK) : 872;
  const bandRot = bandCarry ? lerp(-12, -22, slapK) : -22;
  const bandS = bandCarry ? lerp(0.55, 0.86, slapK) : 0.86 - 0.04 * Math.exp(-(t - T.slap) * 14) * 0 + 0.07 * Math.exp(-(t - T.slap) * 10);
  const bandShow = t >= T.brunoIn - 0.2;

  /* --- ointment dollop --- */
  const dollopT = t - (T.squeeze + 0.1);
  const dollopFall = clamp01(dollopT / 0.45);
  const dollopX = lerp(tubeX - 70, 566, dollopFall);
  const dollopY = lerp(tubeY + 84, 858, dollopFall);

  /* --- sparkles --- */
  const sparkleEls =
    t >= T.sparkles && t < T.sparkles + 3.0
      ? Array.from({ length: 22 }, (_, i) => {
          const life = (t - T.sparkles - i * 0.09) / 1.1;
          if (life < 0 || life > 1) return null;
          const x = lerp(umbX - 60, 330 + rnd(i, 21) * 380, ramp(life, 0, 0.45)) + Math.sin(life * 6 + i) * 22;
          const y = lerp(umbY - 20, 520, ramp(life, 0, 0.35)) + life * 400;
          return <Sparkle key={i} x={x} y={y} r={20 + rnd(i, 22) * 20} rot={life * 180} opacity={Math.sin(life * Math.PI)} />;
        })
      : null;

  /* --- smoke over Biscuit's head while charred --- */
  const smoke =
    charred > 0.05
      ? [0, 1, 2, 3, 4].map((i) => {
          const k = ((frame * 0.35 + i * 7) % 36) / 36;
          return <Puff key={i} x={BX + Math.sin(k * 5 + i) * 40 + (i - 2) * 24} y={BY - 262 * BSC - 20 - k * 260} r={26 + k * 52} opacity={charred * (1 - k) * 0.85} />;
        })
      : null;

  /* --- hearts at the end --- */
  const hearts = recovered
    ? [0, 1, 2, 3, 4, 5].map((i) => {
        const k = ((t - T.better) * 0.5 + i * 0.17) % 1;
        return <Heart key={i} x={BX + (rnd(i, 31) - 0.5) * 520} y={BY - 330 * BSC * 0.6 - k * 420} s={1.1 + rnd(i, 32) * 0.8} opacity={Math.sin(k * Math.PI)} />;
      })
    : null;

  const flash = dt >= 0 ? Math.max(0, 1 - dt / 0.28) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#34337a" }}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <Scenery t={t} frame={frame} />
        <Bolt t={t} />
        <ellipse cx={BX} cy={BY + 8} rx={250} ry={34} fill="#1d2b2a" opacity={0.25} />
        {/* Biscuit */}
        <g style={{ filter: bFilter }}>
          <g transform={`translate(${bx} ${BY}) scale(${BSC})`}>
            <Dog {...biscuit} />
          </g>
          {charred > 0.05 ? (
            <g transform={`translate(${BX} ${BY}) scale(${BSC}) rotate(${biscuit.tilt ?? 0}) scale(1 ${biscuit.squash ?? 1})`} opacity={charred}>
              <path d="M -52 -236 l -14 -30 l 22 14 l -2 -36 l 20 30 l 6 -44 l 12 42 l 18 -34 l 0 38 l 22 -22 l -10 36 Z" fill="#2a2230" stroke="#120e16" strokeWidth={4.5} strokeLinejoin="round" />
            </g>
          ) : null}
        </g>
        {/* the ointment */}
        {t >= T.squeeze + 0.1 && t < T.slap ? <ellipse cx={dollopX} cy={dollopY} rx={44 - (dollopFall >= 1 ? 0 : 6)} ry={34} fill="#ffffff" stroke="#c9cdea" strokeWidth={6} /> : null}
        {smoke}
        <Tears frame={frame} on={crying ? 1 : 0} />
        {sparkleEls}
        {/* Poppy, under her umbrella */}
        {t >= T.poppyIn ? (
          <g>
            <g transform={`translate(${umbX} ${umbY}) rotate(${Math.sin(t * 1.3) * 5 + (t >= T.sparkles && t < T.sparkles + 2.2 ? Math.sin(frame * 0.5) * 8 : 0)}) scale(0.78)`}>
              <path d="M -200 0 C -200 -180 200 -180 200 0 Q 150 -36 100 0 Q 50 -36 0 0 Q -50 -36 -100 0 Q -150 -36 -200 0 Z" fill="#ff9fc4" stroke="#b0527a" strokeWidth={8} strokeLinejoin="round" />
              <path d="M -100 0 C -120 -100 -60 -160 0 -168 C -30 -120 -40 -60 -50 -34 Q -75 -36 -100 0 Z M 100 0 C 120 -100 60 -160 0 -168 C 30 -120 40 -60 50 -34 Q 75 -36 100 0 Z" fill="#ffffff" opacity={0.55} />
              <path d="M 0 -168 L 0 -190" stroke="#b0527a" strokeWidth={9} strokeLinecap="round" />
              <path d="M 0 -2 L 0 160" stroke="#b0527a" strokeWidth={9} strokeLinecap="round" />
            </g>
            <g transform={`translate(${poppyX} ${poppyY}) scale(${-poppyScale} ${poppyScale})`}>
              <Bunny {...poppyPose} />
            </g>
            {t < T.sparkles + 0.4 ? (
              <g transform={`translate(${tubeX} ${tubeY}) rotate(${42 - sq * 6}) scale(0.95)`}>
                <Ointment squeeze={sq} />
              </g>
            ) : null}
          </g>
        ) : null}
        {/* Bruno */}
        {t >= T.brunoIn - 0.2 ? (
          <g transform={`translate(${brunoX} ${1560 - brunoHop}) scale(${brunoScale})`}>
            <Bear {...brunoPose} />
          </g>
        ) : null}
        {/* the band-aid */}
        {bandShow ? (
          <g transform={`translate(${bandX} ${bandY}) rotate(${bandRot})`}>
            <Bandage s={bandS} />
          </g>
        ) : null}
        {hearts}
        <Rain frame={frame} t={t} />
        <Oval t={t} frame={frame} />
        <rect width={W} height={H} fill="#ffffff" opacity={flash * 0.95} />
      </svg>
      {/* the words */}
      <Hand text={"hover your finger\nto protect Biscuit!"} y={250} size={78} fill="#ff9bd4" line="#ffffff" lineW={14} family="round" opacity={win(t, 0, 3.4, 0.25)} />
      <Hand text="are you ok?!" y={250} size={92} fill="#1b1620" line="#ffffff" lineW={14} family="round" opacity={win(t, 6.0, 8.2, 0.2)} />
      <Hand text="feel better soon!" y={250} size={92} fill="#1b1620" line="#ffffff" lineW={14} family="round" opacity={win(t, T.caption, 19, 0.25)} scale={0.9 + 0.1 * backOut((t - T.caption) / 0.5)} />
    </AbsoluteFill>
  );
};
