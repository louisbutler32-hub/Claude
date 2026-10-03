import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { CHAR, type CharId, type Pose } from "./chars";
import { loadPlayFonts } from "./text";
import { backOut, Clover, clamp01, FPS, FingerRing, Hand, H, Heart, INK, lerp, Pill, ramp, rnd, smooth, Sparkle, W, win } from "./finger-kit";

/**
 * The "Send this to a friend who ..." Short.
 *
 * A desk, a spot on it where the viewer is told to put a finger, and two
 * friends. One coughs up a magic wand, and a beam of blessings pours down
 * onto the viewer's finger, one word at a time. The last word lands on the
 * spot like a stamp. It ends on a little question and loops.
 *
 * One component, two Shorts: `school` (Poppy casts "Big brain / Focus /
 * Knowledge / Easy homework / Good grades" on Bruno, who has a backpack)
 * and `work` (Biscuit casts "Happiness / More weekends / ..." on Mimi at her
 * laptop). Times are the format's: walk-in 0-1 s, cough 1-3, wand 3, beam
 * 4-13 with a new word every 2 s, stamp 13-14, closing question 14-17.
 */

export const BLESS_FRAMES = 17 * FPS;

type Variant = "school" | "work";

type Cfg = {
  id: Variant;
  header: string;
  prompt: string;
  closing: string;
  words: string[];
  beam: string;
  beamLine: string;
  wizard: CharId;
  kid: CharId;
  wall: string;
  wallDeep: string;
  desk: string;
  deskEdge: string;
  audio: string;
};

const CFG: Record<Variant, Cfg> = {
  school: {
    id: "school",
    header: "send this to your friend who's starting school",
    prompt: "Put your\nfinger here",
    closing: "feel smarter?",
    words: ["Big brain", "Focus", "Knowledge", "Easy homework", "Good grades"],
    beam: "#5ee27a",
    beamLine: "#1f9a45",
    wizard: "bunny",
    kid: "bear",
    wall: "#f0e6cf",
    wallDeep: "#e4d6b8",
    desk: "#e2c79a",
    deskEdge: "#b98f5a",
    audio: "audio/play-school-mix.mp3",
  },
  work: {
    id: "work",
    header: "send this to a friend at work",
    prompt: "Put your\nfinger here",
    closing: "feel better?",
    words: ["Happiness", "More weekends", "Fewer meetings", "A big raise", "Free snacks"],
    beam: "#ff8fd0",
    beamLine: "#c4408f",
    wizard: "dog",
    kid: "cat",
    wall: "#dfe9f2",
    wallDeep: "#c9d9e8",
    desk: "#d9b992",
    deskEdge: "#a47c4c",
    audio: "audio/play-work-mix.mp3",
  },
};

const T = { walk: 1.0, cough1: 1.0, pop: 3.0, beam0: 4.0, step: 2.0, stamp: 13.0, close: 14.0 };
const SPOT = { x: 290, y: 1560 };
const DESK_Y = 1310;
const WIZ = { x: 575, y: 1430, s: 1.88 };
const KID = { x: 865, y: 1430, s: 1.88 };
const MOUTH = { x: WIZ.x, y: WIZ.y - 134 * WIZ.s };
const PAW = { x: WIZ.x - 96 * WIZ.s, y: WIZ.y - 196 * WIZ.s };
const TIP = { x: 358, y: 740 };

/* ------------------------------------------------------------------ */

const Wand: React.FC<{ t: number; frame: number; cfg: Cfg; variant: Variant }> = ({ t, frame, cfg, variant }) => {
  const r = ramp(t, T.pop, T.pop + 0.5);
  if (t < T.pop) return null;
  const fade = 1 - ramp(t, T.close, T.close + 0.6);
  if (fade <= 0) return null;
  const sway = Math.sin(frame / 7) * 6;
  const tip = { x: lerp(MOUTH.x, TIP.x + sway, r), y: lerp(MOUTH.y - 10, TIP.y, r) };
  const base = { x: lerp(MOUTH.x, PAW.x, r), y: lerp(MOUTH.y, PAW.y, r) };
  const glow = 0.5 + 0.5 * Math.sin(frame / 4);
  return (
    <g opacity={fade}>
      <line x1={base.x} y1={base.y} x2={tip.x} y2={tip.y} stroke="#6d4a2a" strokeWidth={14} strokeLinecap="round" />
      <circle cx={tip.x} cy={tip.y} r={96 + glow * 14} fill={cfg.beam} opacity={0.25 + 0.15 * r} />
      <circle cx={tip.x} cy={tip.y} r={70} fill={cfg.beam} opacity={0.3} />
      {variant === "school" ? (
        <Clover x={tip.x} y={tip.y} s={0.5 + 0.9 * r} rot={Math.sin(frame / 12) * 8} />
      ) : (
        <g transform={`translate(${tip.x} ${tip.y}) scale(${0.5 + 0.9 * r}) rotate(${Math.sin(frame / 12) * 8})`}>
          <path d="M 0 40 C -70 -4 -44 -66 0 -34 C 44 -66 70 -4 0 40 Z" fill="#ff5c9c" stroke="#b02a68" strokeWidth={6} strokeLinejoin="round" />
          <ellipse cx={-20} cy={-20} rx={9} ry={14} fill="#ffffff" opacity={0.6} transform="rotate(30 -20 -20)" />
        </g>
      )}
    </g>
  );
};

const Beam: React.FC<{ t: number; frame: number; cfg: Cfg }> = ({ t, frame, cfg }) => {
  const on = ramp(t, T.beam0 - 0.1, T.beam0 + 0.4) * (1 - ramp(t, T.stamp - 0.2, T.stamp + 0.3));
  if (on <= 0) return null;
  const a = { x: TIP.x + Math.sin(frame / 7) * 6, y: TIP.y };
  const b = SPOT;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const L = Math.hypot(dx, dy);
  const nx = -dy / L;
  const ny = dx / L;
  const w0 = 30;
  const w1 = 210;
  const poly = `${a.x + nx * w0},${a.y + ny * w0} ${b.x + nx * w1},${b.y + ny * w1} ${b.x - nx * w1},${b.y - ny * w1} ${a.x - nx * w0},${a.y - ny * w0}`;
  const sparks = Array.from({ length: 36 }, (_, i) => {
    const u = (t * 0.55 + i / 36 + rnd(i, 5) * 0.2) % 1;
    const w = lerp(w0, w1, u) * (rnd(i, 6) * 2 - 1) * 0.85;
    const px = lerp(a.x, b.x, u) + nx * w;
    const py = lerp(a.y, b.y, u) + ny * w;
    return <Sparkle key={i} x={px} y={py} r={8 + rnd(i, 7) * 14 + u * 6} colour={i % 3 ? cfg.beam : "#ffffff"} rot={u * 240} opacity={Math.sin(u * Math.PI) * 0.95} />;
  });
  return (
    <g opacity={on}>
      <defs>
        <linearGradient id={`beam-${cfg.id}`} gradientUnits="userSpaceOnUse" x1={a.x} y1={a.y} x2={b.x} y2={b.y}>
          <stop offset="0" stopColor={cfg.beam} stopOpacity={0.9} />
          <stop offset="1" stopColor={cfg.beam} stopOpacity={0.35} />
        </linearGradient>
      </defs>
      <polygon points={poly} fill={`url(#beam-${cfg.id})`} />
      {sparks}
    </g>
  );
};

/** the blessing words, floating down the beam one at a time */
const Words: React.FC<{ t: number; cfg: Cfg }> = ({ t, cfg }) => {
  const a = TIP;
  const b = SPOT;
  const out: React.ReactNode[] = [];
  cfg.words.forEach((w, i) => {
    const start = T.beam0 + i * T.step;
    const u = (t - start) / T.step;
    if (u < 0 || u > 1.05) return;
    const last = i === cfg.words.length - 1;
    const p = last ? lerp(0.12, 1, smooth(u * 1.5)) : lerp(0.14, 0.82, smooth(u));
    const x = lerp(a.x, b.x, p);
    const y = lerp(a.y, b.y, p);
    const op = last ? 1 - ramp(t, T.close + 0.2, T.close + 0.8) : Math.sin(clamp01(u) * Math.PI) * 1.6 > 1 ? 1 : Math.sin(clamp01(u) * Math.PI) * 1.6;
    const sc = lerp(0.7, last ? 1.25 : 1.1, clamp01(u * 2));
    out.push(
      <div
        key={w}
        style={{
          position: "absolute",
          left: x + 70,
          top: y,
          transform: `translate(-50%, -50%) scale(${sc}) rotate(${-8 + i * 3}deg)`,
          fontFamily: "'Fredoka', 'ComicRelief', sans-serif",
          fontWeight: 600,
          fontSize: 74,
          lineHeight: 1,
          whiteSpace: "nowrap",
          color: "#ffffff",
          WebkitTextStroke: `13px ${cfg.beamLine}`,
          paintOrder: "stroke fill",
          opacity: op,
        }}
      >
        {w}
      </div>,
    );
  });
  return <>{out}</>;
};

/** "Good grades" lands on the spot: a stamp */
const StampMark: React.FC<{ t: number; variant: Variant; cfg: Cfg }> = ({ t, variant, cfg }) => {
  const dt = t - T.stamp;
  if (dt < 0) return null;
  const k = clamp01(dt / 0.16);
  const s = lerp(1.9, 1, k * k);
  const fade = 1 - ramp(t, T.close + 0.3, T.close + 0.9);
  if (fade <= 0) return null;
  return (
    <g transform={`translate(${SPOT.x} ${SPOT.y}) scale(${s}) rotate(-8)`} opacity={fade * clamp01(dt / 0.05)}>
      <circle r={150} fill={cfg.beam} opacity={0.35} />
      {variant === "school" ? <Clover x={0} y={-6} s={1.9} /> : <path d="M 0 80 C -140 -8 -88 -132 0 -68 C 88 -132 140 -8 0 80 Z" fill="#ff5c9c" stroke="#b02a68" strokeWidth={9} strokeLinejoin="round" />}
    </g>
  );
};

/* ------------------------------------------------------------------ */

const Dress: React.FC<{ cfg: Cfg; variant: Variant; frame: number; layer: "back" | "front" }> = ({ cfg, variant, frame, layer }) => (
  <g>
    {layer === "back" ? (
      <>
    <rect width={W} height={DESK_Y} fill={cfg.wall} />
    {variant === "school" ? (
      <g transform="translate(0 200)">
        {/* a blackboard and a poster on the wall */}
        <rect x={60} y={400} width={470} height={290} rx={14} fill="#2f5a4a" stroke="#8a6a3e" strokeWidth={14} />
        <path d="M 110 470 q 60 -30 110 0 M 130 540 h 160 M 130 590 h 230" fill="none" stroke="#e8f4ec" strokeWidth={8} strokeLinecap="round" opacity={0.85} />
        <text x={400} y={520} fontFamily="'ComicRelief', sans-serif" fontSize={90} fontWeight={700} fill="#e8f4ec" opacity={0.9}>
          ABC
        </text>
        <rect x={760} y={380} width={240} height={320} rx={10} fill="#ffd9a0" stroke="#c78e4a" strokeWidth={8} />
        <circle cx={880} cy={500} r={56} fill="#ff8a8a" />
        <rect x={810} y={580} width={140} height={20} rx={10} fill="#ffffff" opacity={0.8} />
        <rect x={830} y={620} width={100} height={16} rx={8} fill="#ffffff" opacity={0.6} />
      </g>
    ) : (
      <g transform="translate(0 200)">
        {/* a window with a skyline, and a clock */}
        <rect x={80} y={380} width={500} height={330} rx={14} fill="#b9defa" stroke="#7a99b8" strokeWidth={14} />
        {[[130, 560, 70, 150], [220, 500, 90, 210], [330, 540, 70, 170], [420, 480, 100, 230]].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} fill="#8fb1d1" opacity={0.9} />
        ))}
        <circle cx={860} cy={500} r={96} fill="#ffffff" stroke="#7a99b8" strokeWidth={12} />
        <path d="M 860 500 L 860 440 M 860 500 L 900 520" stroke={INK} strokeWidth={9} strokeLinecap="round" />
      </g>
    )}
      </>
    ) : (
      <>
    <rect y={DESK_Y - 8} width={W} height={H - DESK_Y + 8} fill={cfg.desk} />
    <rect y={DESK_Y - 8} width={W} height={22} fill={cfg.deskEdge} />
    <rect y={DESK_Y + 14} width={W} height={10} fill="#ffffff" opacity={0.25} />
    {/* things on the desk */}
    {variant === "school" ? (
      <g>
        <g transform={`translate(${SPOT.x} ${SPOT.y}) rotate(-6)`}>
          <rect x={-210} y={-270} width={420} height={540} rx={8} fill="#000" opacity={0.12} transform="translate(10 12)" />
          <rect x={-210} y={-270} width={420} height={540} rx={8} fill="#ffffff" stroke="#9a96a8" strokeWidth={6} />
          <path d="M -170 -200 h 200 M -170 -160 h 260 M -170 -120 h 150" stroke="#c9c6d6" strokeWidth={8} strokeLinecap="round" />
          <path d="M -170 160 L -90 70 L -20 120 L 60 20 L 150 -30" fill="none" stroke="#e0505a" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M -170 200 H 170 M -170 200 V 40" stroke="#9a96a8" strokeWidth={6} />
        </g>
        <g transform="translate(110 1760) rotate(-30)">
          <rect x={-130} y={-14} width={230} height={28} rx={6} fill="#f6c84b" stroke="#a07a1c" strokeWidth={5} />
          <path d="M 100 -14 L 150 0 L 100 14 Z" fill="#f2d3a4" stroke="#a07a1c" strokeWidth={5} strokeLinejoin="round" />
          <path d="M 138 -4 L 150 0 L 138 4 Z" fill="#33303a" />
          <rect x={-150} y={-14} width={26} height={28} rx={6} fill="#ff8aa8" stroke="#a07a1c" strokeWidth={5} />
        </g>
      </g>
    ) : (
      <g>
        <g transform={`translate(${SPOT.x} ${SPOT.y}) rotate(-5)`}>
          <rect x={-200} y={-260} width={400} height={520} rx={8} fill="#000" opacity={0.12} transform="translate(10 12)" />
          <rect x={-200} y={-260} width={400} height={520} rx={8} fill="#ffffff" stroke="#9aa0ae" strokeWidth={6} />
          {[-190, -150, -110, -70].map((y) => (
            <path key={y} d={`M -160 ${y} h ${300 - ((y * 7) % 90)}`} stroke="#c9ccd8" strokeWidth={8} strokeLinecap="round" />
          ))}
          <rect x={-160} y={-20} width={140} height={110} rx={10} fill="#e9eefa" stroke="#9aa0ae" strokeWidth={5} />
          <path d="M -140 70 L -100 30 L -66 56 L -34 10" fill="none" stroke="#e0505a" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 20 -4 h 130 M 20 40 h 100 M 20 84 h 130" stroke="#c9ccd8" strokeWidth={8} strokeLinecap="round" />
        </g>
        {/* the laptop in front of the worker */}
        <g transform={`translate(${KID.x - 20} ${DESK_Y + 20})`}>
          <path d="M -178 -4 L -178 -104 Q -178 -122 -158 -122 L 158 -122 Q 178 -122 178 -104 L 178 -4 Z" fill="#aab1c4" stroke="#6b7184" strokeWidth={8} strokeLinejoin="round" />
          <circle cx={0} cy={-62} r={20} fill="#ffffff" opacity={0.8} />
          <path d="M -170 0 L 170 0 L 200 120 L -200 120 Z" fill="#c3c8d6" stroke="#6b7184" strokeWidth={8} strokeLinejoin="round" />
          <path d="M -150 20 h 300 M -158 56 h 316 M -166 92 h 332" stroke="#9aa0b6" strokeWidth={7} strokeLinecap="round" />
        </g>
        <g transform={`translate(110 1750)`}>
          <path d="M -50 -60 L 50 -60 L 42 50 Q 0 64 -42 50 Z" fill="#ffffff" stroke="#8a92a6" strokeWidth={7} strokeLinejoin="round" />
          <path d="M 50 -34 q 46 4 38 40 q -8 26 -44 24" fill="none" stroke="#8a92a6" strokeWidth={8} strokeLinecap="round" />
          <path d="M -34 -60 q 34 -20 68 0" fill="#7a4a2a" stroke="#7a4a2a" strokeWidth={4} />
          {[0, 1].map((i) => (
            <path key={i} d={`M ${-10 + i * 24} -80 q ${-10 + (frame % 24) * 0.2} -26 0 -50`} fill="none" stroke="#b9c0d0" strokeWidth={6} strokeLinecap="round" opacity={0.7} />
          ))}
        </g>
      </g>
    )}
      </>
    )}
  </g>
);

/* ------------------------------------------------------------------ */

const makeShort = (variant: Variant): React.FC<{ audio?: string | null }> => {
  const cfg = CFG[variant];
  const WizardC = CHAR[cfg.wizard];
  const KidC = CHAR[cfg.kid];
  const Comp: React.FC<{ audio?: string | null }> = ({ audio = cfg.audio }) => {
    loadPlayFonts();
    const frame = useCurrentFrame();
    const t = frame / FPS;

    /* --- walk-in --- */
    const wIn = ramp(t, 0.0, T.walk);
    const wizX = lerp(1500, WIZ.x, wIn);
    const kidX = lerp(1380, KID.x, ramp(t, 0.0, T.walk * 0.9));
    const stepHop = (k: number) => (k < 1 ? Math.abs(Math.sin(t * 11)) * 30 : 0);

    /* --- the cough --- */
    const coughs = [1.15, 1.8, 2.45];
    const cough = coughs.reduce((m, c) => Math.max(m, t >= c && t < c + 0.4 ? Math.sin(((t - c) / 0.4) * Math.PI) : 0), 0);
    const preCough = t >= 1.0 && t < T.pop;
    const casting = t >= T.beam0 && t < T.stamp;
    const closing = t >= T.close;
    const wizard: Pose = {
      eyes: closing ? "happy" : cough > 0.1 ? "closed" : casting ? "sparkle" : "open",
      mouth: closing ? "open" : cough > 0.1 ? "shout" : t >= T.pop - 0.3 && t < T.pop + 0.2 ? "o" : casting ? "grin" : "smile",
      look: [-0.6, 0],
      squash: 1 + 0.07 * cough - (casting ? 0.02 : 0),
      tilt: preCough ? cough * -14 : closing ? Math.sin(frame / 6) * 5 : 0,
      handL: t >= T.pop ? [-96, -196 + Math.sin(frame / 7) * 6] : [-30, 40 - cough * 30],
      handR: casting ? [52, -150 - Math.sin(frame / 5) * 8] : undefined,
      armR: casting ? undefined : [24, 42],
      wag: Math.sin(frame / 5) * 12,
    };
    const kid: Pose = {
      eyes: closing ? "happy" : casting ? "sparkle" : "open",
      mouth: closing ? "open" : casting ? "open" : "smile",
      look: [-0.8, 0.2],
      squash: 1 + (casting ? 0.025 * Math.sin(frame / 4) : 0),
      tilt: closing ? -Math.sin(frame / 6) * 5 : 0,
      handL: variant === "work" ? [-44, -22] : [-34, -80],
      handR: variant === "work" ? [44, -22] : [34, -80],
      wag: Math.sin(frame / 6) * 10,
    };

    const ringOn = win(t, 0.0, 4.0, 0.25);
    const ringRed = t >= 2.0 && t < 3.6;
    const blessHearts =
      variant === "work" && casting
        ? [0, 1, 2, 3].map((i) => {
            const k = ((t - T.beam0) * 0.45 + i * 0.25) % 1;
            return <Heart key={i} x={KID.x - 140 + i * 90} y={1050 - k * 300} s={0.9} opacity={Math.sin(k * Math.PI) * 0.9} />;
          })
        : null;

    return (
      <AbsoluteFill style={{ background: cfg.wall }}>
        {audio ? <Audio src={staticFile(audio)} /> : null}
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <Dress cfg={cfg} variant={variant} frame={frame} layer="back" />
          {/* the friends stand behind the desk */}
          <g transform={`translate(${kidX} ${KID.y - stepHop(ramp(t, 0, T.walk * 0.9))}) scale(${KID.s})`}>
            {variant === "school" ? (
              <g>
                <rect x={-88} y={-158} width={176} height={134} rx={30} fill="#e8505b" stroke="#a02e3b" strokeWidth={7} />
                <rect x={-50} y={-114} width={100} height={52} rx={16} fill="#f58791" stroke="#a02e3b" strokeWidth={5} />
              </g>
            ) : null}
            <KidC {...kid} />
            {variant === "school" ? (
              <path d="M -38 -104 Q -44 -62 -30 -26 M 38 -104 Q 44 -62 30 -26" fill="none" stroke="#e8505b" strokeWidth={13} strokeLinecap="round" />
            ) : (
              <path d="M -10 -96 L 10 -96 L 16 -70 L 0 -34 L -16 -70 Z" fill="#3f6bd4" stroke="#27418a" strokeWidth={4} strokeLinejoin="round" />
            )}
          </g>
          <g transform={`translate(${wizX} ${WIZ.y - stepHop(wIn)}) scale(${WIZ.s})`}>
            <WizardC {...wizard} />
          </g>
          <Dress cfg={cfg} variant={variant} frame={frame} layer="front" />
          <Wand t={t} frame={frame} cfg={cfg} variant={variant} />
          {blessHearts}
          <Beam t={t} frame={frame} cfg={cfg} />
          {ringOn > 0 ? <FingerRing x={SPOT.x} y={SPOT.y} r={112} frame={frame} colour={ringRed ? "#e8394a" : "#ffffff"} opacity={ringOn} pulse={0.06} /> : null}
          <StampMark t={t} variant={variant} cfg={cfg} />
        </svg>
        <Pill text={cfg.header} y={130} size={46} />
        <Hand text={cfg.prompt} x={SPOT.x} y={SPOT.y - 270} size={56} fill="#e3363f" opacity={ringOn} rotate={-4} />
        <Words t={t} cfg={cfg} />
        <Hand text={cfg.closing} y={420} size={110} fill="#1e1c22" opacity={win(t, T.close + 0.4, 17, 0.25)} scale={0.85 + 0.15 * backOut((t - T.close - 0.4) / 0.4)} />
      </AbsoluteFill>
    );
  };
  return Comp;
};

export const SchoolShort = makeShort("school");
export const WorkShort = makeShort("work");

