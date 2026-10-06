import React from "react";
import { AbsoluteFill, Img, continueRender, delayRender, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * The Pins-format engine: real photo cutouts with cartoon eyes, composited
 * over photo (or painted) backdrops, a pushing camera, cartoon props, and
 * one-chunk-at-a-time captions with the spoken word lit yellow. See
 * src/pins/README.md for the measured format this reproduces.
 *
 * Everything is driven by seconds (`t`), not frames, so a shot list written
 * against timing.json stays right if the narration is rebuilt.
 */

export const W = 1080;
export const H = 1920;

/**
 * The frame the engine draws into. Shorts are 1080×1920 (the default, and the
 * W/H constants above); a 16:9 long-form wraps its tree in
 * <Stage.Provider value={{ W: 1920, H: 1080 }}> so the camera, backdrops,
 * transitions and captions centre and fill its frame instead.
 */
export const Stage = React.createContext({ W, H });
export const useStage = () => React.useContext(Stage);

/* ------------------------------------------------------------ timing */

export type Word = [string, number, number];
export type TimingLine = { id: string; text: string; start: number; end: number; words: Word[] };
export type Timing = { duration: number; lines: TimingLine[] };

/** start time of word `i` of line `id` (i = 0: the line's first word) */
export const cue = (T: Timing, id: string, i = 0) => {
  const l = T.lines.find((x) => x.id === id);
  if (!l) throw new Error(`no line ${id}`);
  return l.words[Math.min(i, l.words.length - 1)]?.[1] ?? l.start;
};
export const lineEnd = (T: Timing, id: string) => T.lines.find((x) => x.id === id)!.end;

/* ------------------------------------------------------------ easing */

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** smoothstep from a to b */
export const ease = (t: number, a: number, b: number) => { const k = clamp01((t - a) / (b - a)); return k * k * (3 - 2 * k); };
/** ease-out with overshoot (back), 0→1 between a and b */
export const over = (t: number, a: number, b: number) => {
  const k = clamp01((t - a) / (b - a)), c1 = 1.9, c3 = c1 + 1;
  return k <= 0 ? 0 : 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
};
/** 0→1→0 hump between a and b */
export const bell = (t: number, a: number, b: number) => Math.sin(Math.PI * clamp01((t - a) / (b - a)));

export const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

/* ------------------------------------------------------------ fonts */

let fontsStarted = false;
export const loadPinsFonts = () => {
  if (fontsStarted || typeof document === "undefined") return;
  fontsStarted = true;
  const h = delayRender("pins fonts");
  const faces = [
    new FontFace("PoppinsBlack", `url(${staticFile("fonts/Poppins-Black.ttf")}) format("truetype")`, { weight: "900" }),
    new FontFace("Anton", `url(${staticFile("fonts/Anton-Regular.ttf")}) format("truetype")`),
  ];
  Promise.all(faces.map((f) => f.load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(h)).catch(() => continueRender(h));
};
export const FONT = "PoppinsBlack, Poppins, sans-serif";
/** the caption face: condensed heavy caps, like the reference's */
export const CAPTION_FONT = "Anton, Impact, sans-serif";

/* ------------------------------------------------------------ camera */

/**
 * Puts world point (x, y) at the centre of the frame, zoomed by z.
 * shake: amplitude in px of a quick camera rattle (decays by itself if the
 * caller fades it).
 */
export const Cam: React.FC<{ t: number; x?: number; y?: number; z?: number; rot?: number; shake?: number; children: React.ReactNode }> = ({ t, x: cx, y: cy, z = 1, rot = 0, shake = 0, children }) => {
  const { W, H } = useStage();
  const x = cx ?? W / 2, y = cy ?? H / 2;
  const sx = shake ? Math.sin(t * 71) * shake : 0;
  const sy = shake ? Math.cos(t * 53) * shake : 0;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0",
        transform: `translate(${W / 2 + sx}px, ${H / 2 + sy}px) rotate(${rot}deg) scale(${z}) translate(${-x}px, ${-y}px)` }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ backdrops */

/** a photo filling a world rect (default: the frame), with a gentle drift of its own */
export const Backdrop: React.FC<{ src: string; t: number; x?: number; y?: number; w?: number; h?: number; drift?: number; blur?: number; tone?: string; flip?: boolean }> = ({ src, t, x: bx, y: by, w: bw, h: bh, drift = 0.02, blur = 0.5, tone, flip }) => {
  const { W, H } = useStage();
  const x = bx ?? -W * 0.2, y = by ?? -H * 0.2, w = bw ?? W * 1.4, h = bh ?? H * 1.4;
  const s = 1.04 + drift * Math.sin(t * 0.25);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, overflow: "hidden" }}>
      <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
        transform: `scale(${s}) ${flip ? "scaleX(-1)" : ""}`, filter: `blur(${blur}px) saturate(1.18) contrast(1.06) brightness(1.04)` }} />
      {tone && <div style={{ position: "absolute", inset: 0, background: tone }} />}
    </div>
  );
};

/** open water, painted: blue fall-off, slow god rays, drifting motes, a bright surface band */
export const PaintedDeep: React.FC<{ t: number; x?: number; y?: number; w?: number; h?: number; surface?: boolean }> = ({ t, x = -W * 0.2, y = 0, w = W * 1.4, h = H * 1.2, surface = true }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, overflow: "hidden",
    background: "linear-gradient(180deg, #52c3ef 0%, #1d86c4 22%, #0d5a99 55%, #062c5c 100%)" }}>
    {[0, 1, 2, 3, 4].map((i) => (
      <div key={i} style={{ position: "absolute", top: -h * 0.1, left: w * (0.08 + i * 0.21) + Math.sin(t * 0.4 + i) * 30, width: 90 + (i % 2) * 70, height: h * 0.9,
        background: "linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0))", transform: `rotate(${12 - i * 2}deg)`, filter: "blur(18px)",
        opacity: 0.55 + 0.35 * Math.sin(t * 0.7 + i * 1.7) }} />
    ))}
    {Array.from({ length: 40 }).map((_, i) => {
      const px = random(`m${i}`) * w, py = (random(`n${i}`) * h - t * (8 + random(`s${i}`) * 14)) % h;
      return <div key={i} style={{ position: "absolute", left: px, top: (py + h) % h, width: 5 + random(`r${i}`) * 6, height: 5 + random(`r${i}`) * 6, borderRadius: 99, background: "rgba(255,255,255,0.35)" }} />;
    })}
    {surface && (
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: 70,
        background: `repeating-linear-gradient(${90 + Math.sin(t) * 4}deg, rgba(255,255,255,0.55) 0 26px, rgba(180,235,255,0.25) 26px 70px)`, filter: "blur(4px)" }} />
    )}
  </div>
);

/* ------------------------------------------------------------ eyes */

export type Mood = "open" | "closed" | "wide" | "sad" | "dead" | "angry";
export type EyeSpec = { x: number; y: number; r: number; mood?: Mood; rot?: number }; // rot: degrees, to lay the lids along a tilted head

/** mood at time t from a timeline [[t0, mood], [t1, mood], ...] */
export const moodAt = (tl: [number, Mood][], t: number): { mood: Mood; since: number } => {
  let m: Mood = tl[0]?.[1] ?? "open", since = -99;
  for (const [at, mm] of tl) if (t >= at) { m = mm; since = at; }
  return { mood: m, since };
};

const INK = "#111";

/**
 * One cartoon eye centred on (0,0), radius r. `side` is -1 for the eye on
 * the left of the face and 1 for the right, so brows tilt the right way.
 * The reference leans on brows more than on the eyes themselves: worried
 * (inner ends up) for sad, a V for angry, raised for shock. Sad cries,
 * shock sweats.
 */
export const Eye: React.FC<{ r: number; mood: Mood; t: number; since: number; look?: [number, number]; seed?: number; side?: number; brows?: boolean }> = ({ r, mood, t, since, look = [0, 0], seed = 0, side = 1, brows = true }) => {
  const pop = 0.75 + 0.25 * over(t, since, since + 0.25);
  const sw = Math.max(2.5, r * 0.1);
  // blink every few seconds, staggered by seed
  const period = 2.6 + (seed % 3) * 0.7;
  const ph = (t + seed * 0.37) % period;
  const blink = mood === "open" || mood === "sad" || mood === "angry" ? (ph < 0.12 ? 0.12 : 1) : 1;
  const wobble = mood === "wide" ? Math.sin(t * 40) * r * 0.05 : 0;
  const box = r * 4;
  const common: React.CSSProperties = { position: "absolute", left: -box / 2, top: -box / 2, width: box, height: box, overflow: "visible", transform: `scale(${pop})` };
  const vb = `${-box / 2} ${-box / 2} ${box} ${box}`;
  // brow: inner end (towards the nose) and outer end heights, in r
  const browY: Partial<Record<Mood, [number, number]>> = { open: [-1.45, -1.45], sad: [-1.75, -1.2], angry: [-1.1, -1.65], wide: [-1.95, -1.8] };
  const by = browY[mood];
  const brow = brows && by ? (
    <path d={`M ${-side * r * 0.95} ${by[0] * r} Q 0 ${((by[0] + by[1]) / 2 - 0.25) * r} ${side * r * 0.95} ${by[1] * r}`} fill="none" stroke={INK} strokeWidth={r * 0.34} strokeLinecap="round" />
  ) : null;
  if (mood === "closed") {
    return (
      <svg viewBox={vb} style={common}>
        <path d={`M ${-r} ${-r * 0.1} Q 0 ${r * 0.75} ${r} ${-r * 0.1}`} fill="none" stroke={INK} strokeWidth={sw * 2} strokeLinecap="round" />
        <path d={`M ${-r * 0.55} ${r * 0.28} l ${-r * 0.18} ${r * 0.3} M 0 ${r * 0.33} l 0 ${r * 0.34} M ${r * 0.55} ${r * 0.28} l ${r * 0.18} ${r * 0.3}`} stroke={INK} strokeWidth={sw * 1.1} strokeLinecap="round" />
      </svg>
    );
  }
  if (mood === "dead") {
    return (
      <svg viewBox={vb} style={common}>
        <path d={`M ${-r * 0.7} ${-r * 0.7} L ${r * 0.7} ${r * 0.7} M ${r * 0.7} ${-r * 0.7} L ${-r * 0.7} ${r * 0.7}`} stroke={INK} strokeWidth={sw * 2.6} strokeLinecap="round" />
      </svg>
    );
  }
  const rr = mood === "wide" ? r * 1.22 : r;
  const pr = mood === "wide" ? r * 0.3 : r * 0.58;
  const px = look[0] * r * 0.34 + wobble, py = look[1] * r * 0.34;
  const tearK = (t * 0.9 + seed * 0.3) % 1;
  return (
    <svg viewBox={vb} style={common}>
      <g transform={`scale(1 ${blink})`}>
        <ellipse cx={0} cy={0} rx={rr} ry={rr * 1.08} fill="#fff" stroke={INK} strokeWidth={sw} />
        <circle cx={px} cy={py} r={pr} fill={INK} />
        <circle cx={px - pr * 0.35} cy={py - pr * 0.4} r={pr * 0.3} fill="#fff" />
        {mood === "sad" && <path d={`M ${-rr * 1.05} ${-rr * 0.05} Q 0 ${-rr * 0.55} ${rr * 1.05} ${-rr * 0.05} L ${rr * 1.05} ${-rr * 1.2} L ${-rr * 1.05} ${-rr * 1.2} Z`} fill="#fff" stroke={INK} strokeWidth={sw} />}
      </g>
      {brow}
      {mood === "sad" && (
        <path d={`M ${side * rr * 0.3} ${rr * 0.95 + tearK * rr * 2.2} q ${-rr * 0.25} ${rr * 0.4} 0 ${rr * 0.55} q ${rr * 0.25} ${-rr * 0.15} 0 ${-rr * 0.55} Z`}
          fill="#5fb8ff" stroke="#1d5f9c" strokeWidth={sw * 0.6} opacity={1 - tearK * 0.6} />
      )}
      {mood === "wide" && side > 0 && (
        <path d={`M ${rr * 1.6} ${-rr * 1.3} q ${-rr * 0.35} ${rr * 0.55} 0 ${rr * 0.75} q ${rr * 0.35} ${-rr * 0.2} 0 ${-rr * 0.75} Z`} fill="#8fd3ff" stroke="#1d5f9c" strokeWidth={sw * 0.7}
          transform={`translate(0 ${((t * 1.4) % 1) * rr * 0.6})`} />
      )}
    </svg>
  );
};

/* ------------------------------------------------------------ cutouts */

/** a cutout's natural size (from public/images/<ep>/credits.json) and where its eyes sit, in 0–1 of the image */
export type Asset = { src: string; w: number; h: number; eyes?: EyeSpec[]; brows?: boolean };

export type ActorProps = {
  a: Asset;
  t: number;
  x: number; y: number;          // world centre
  w: number;                     // drawn width
  rot?: number;
  flip?: boolean;
  enter?: number;                // pop-in time (squash & stretch)
  enterFrom?: [number, number];  // with enter: slide in from this offset (px) with overshoot
  exit?: number;                 // pop-out time
  bob?: number;                  // px of idle float
  bobRate?: number;
  moods?: [number, Mood][];      // eye mood timeline (global seconds)
  look?: [number, number];
  opacity?: number;
  tint?: string;                 // css filter appended (e.g. "brightness(0.9)")
  children?: React.ReactNode;    // overlays in the cutout's own box (0..w, 0..h)
};

export const Actor: React.FC<ActorProps> = ({ a, t, x, y, w, rot = 0, flip, enter, enterFrom, exit, bob = 8, bobRate = 1.4, moods = [[-99, "open"]], look, opacity = 1, tint, children }) => {
  const h = (w * a.h) / a.w;
  let s = 1, sq = 0;
  if (enter !== undefined) {
    if (t < enter) return null;
    if (enterFrom) {
      const k = over(t, enter, enter + 0.42);
      x += enterFrom[0] * (1 - k); y += enterFrom[1] * (1 - k);
      sq = 0.08 * bell(t, enter + 0.25, enter + 0.55);
    } else {
      s = over(t, enter, enter + 0.4);
      sq = 0.12 * bell(t, enter + 0.15, enter + 0.5);
    }
  }
  if (exit !== undefined && t > exit) {
    s *= 1 - ease(t, exit, exit + 0.25);
    if (t > exit + 0.25) return null;
  }
  const by = Math.sin(t * bobRate * Math.PI) * bob;
  const { mood, since } = moodAt(moods, t);
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2 + by, width: w, height: h, opacity, transform: `rotate(${rot}deg)` }}>
     <div style={{ position: "absolute", inset: 0, transform: `scale(${s * (1 + sq)}, ${s * (1 - sq)})`, transformOrigin: "50% 80%" }}>
      <div style={{ position: "absolute", inset: 0, transform: flip ? "scaleX(-1)" : undefined }}>
        <Img src={staticFile(a.src)} style={{ width: "100%", height: "100%", filter: `drop-shadow(0 10px 14px rgba(0,0,0,0.35)) ${tint ?? ""}` }} />
        {(a.eyes ?? []).map((e, i, all) => {
          const mid = all.reduce((m, q) => m + q.x, 0) / all.length;
          const side = (all.length < 2 ? 1 : e.x < mid ? -1 : 1) * (flip ? -1 : 1);
          return (
            <div key={i} style={{ position: "absolute", left: e.x * w, top: e.y * h, width: 0, height: 0, transform: `${flip ? "scaleX(-1)" : ""} rotate(${e.rot ?? 0}deg)` }}>
              <Eye r={e.r * w} mood={e.mood ?? mood} since={since} t={t} look={look ?? [flip ? -0.4 : 0.4, 0]} seed={i + Math.round(a.w)} side={side} brows={a.brows ?? true} />
            </div>
          );
        })}
      </div>
      {children}
     </div>
    </div>
  );
};

/* ------------------------------------------------------------ props & fx */

const outline: React.CSSProperties = { WebkitTextStroke: "10px #000", paintOrder: "stroke fill" };

/** Z z z rising off a sleeper */
export const Zzz: React.FC<{ t: number; x: number; y: number; size?: number; from?: number; until?: number }> = ({ t, x, y, size = 70, from = -99, until = 999 }) => {
  if (t < from || t > until) return null;
  return (
    <>
      {[0, 1, 2].map((i) => {
        const k = ((t - from) * 0.7 + i / 3) % 1;
        return (
          <div key={i} style={{ position: "absolute", left: x + k * size * 1.4 + Math.sin(k * 6) * 10, top: y - k * size * 2.6, fontFamily: FONT, fontSize: size * (0.55 + k * 0.6),
            color: "#fff", opacity: Math.min(1, k * 4) * (1 - k), ...outline, WebkitTextStroke: `${size * 0.1}px #1a3a6a` }}>Z</div>
        );
      })}
    </>
  );
};

/** a single prop that pops on at `at` (and off at `until`), with a little idle wobble */
export const Pop: React.FC<{ t: number; at: number; until?: number; x: number; y: number; rot?: number; children: React.ReactNode }> = ({ t, at, until = 999, x, y, rot = 0, children }) => {
  if (t < at || t > until + 0.2) return null;
  const s = over(t, at, at + 0.35) * (t > until ? 1 - ease(t, until, until + 0.2) : 1);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, transform: `scale(${s}) rotate(${rot + Math.sin(t * 3) * 3}deg)` }}>
      {children}
    </div>
  );
};

/** centred svg helper */
const Svg: React.FC<{ size: number; vb?: number; children: React.ReactNode }> = ({ size, vb = 100, children }) => (
  <svg viewBox={`${-vb / 2} ${-vb / 2} ${vb} ${vb}`} style={{ position: "absolute", left: -size / 2, top: -size / 2, width: size, height: size, overflow: "visible" }}>{children}</svg>
);

export const Heart: React.FC<{ size?: number }> = ({ size = 120 }) => (
  <Svg size={size}>
    <path d="M0 34 C -46 6 -44 -34 -20 -36 C -8 -37 -2 -28 0 -22 C 2 -28 8 -37 20 -36 C 44 -34 46 6 0 34 Z" fill="#ff3b5c" stroke={INK} strokeWidth={5} />
    <ellipse cx={-18} cy={-20} rx={8} ry={5} fill="#fff" opacity={0.7} transform="rotate(-30 -18 -20)" />
  </Svg>
);

/** clock face; `fill` (0–1) shades a wedge from 12 o'clock, `spin` turns the hand at that many revs/sec */
export const Clock: React.FC<{ t: number; size?: number; fill?: number; spin?: number; color?: string }> = ({ t, size = 220, fill = 0, spin = 1, color = "#ffd400" }) => {
  const a = (t * spin * 360) % 360;
  const f = Math.min(0.999, fill);
  const ex = 40 * Math.sin(f * 2 * Math.PI), ey = -40 * Math.cos(f * 2 * Math.PI);
  return (
    <Svg size={size}>
      <circle r={46} fill="#fff" stroke={INK} strokeWidth={6} />
      {f > 0 && <path d={`M0 0 L0 -40 A40 40 0 ${f > 0.5 ? 1 : 0} 1 ${ex} ${ey} Z`} fill={color} />}
      {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={0} y1={-40} x2={0} y2={-34} stroke={INK} strokeWidth={3} transform={`rotate(${i * 30})`} />)}
      <line x1={0} y1={0} x2={0} y2={-30} stroke={INK} strokeWidth={5} strokeLinecap="round" transform={`rotate(${a})`} />
      <circle r={5} fill={INK} />
    </Svg>
  );
};

/** a tear-off calendar page with a big number on it */
export const Calendar: React.FC<{ n: number | string; label?: string; size?: number }> = ({ n, label = "DAY", size = 240 }) => (
  <div style={{ position: "absolute", left: -size / 2, top: -size / 2, width: size, height: size * 1.05, background: "#fff", border: `6px solid ${INK}`, borderRadius: 22, overflow: "hidden", boxShadow: "0 10px 24px rgba(0,0,0,0.35)" }}>
    <div style={{ height: size * 0.3, background: "#ff4d4d", borderBottom: `6px solid ${INK}`, color: "#fff", fontFamily: FONT, fontSize: size * 0.17, textAlign: "center", lineHeight: `${size * 0.3}px` }}>{label}</div>
    <div style={{ fontFamily: FONT, fontSize: size * 0.42, color: INK, textAlign: "center", lineHeight: `${size * 0.7}px` }}>{n}</div>
  </div>
);

/** a brain split down the middle: left half asleep (blue), right half awake (yellow) */
export const SplitBrain: React.FC<{ t: number; size?: number }> = ({ t, size = 300 }) => {
  const glow = 0.75 + 0.25 * Math.sin(t * 8);
  return (
    <Svg size={size}>
      <path d="M -2 -38 C -20 -46 -44 -36 -44 -14 C -50 0 -44 22 -26 30 C -16 40 -4 36 -2 30 Z" fill="#6aa6ff" stroke={INK} strokeWidth={4} />
      <path d="M 2 -38 C 20 -46 44 -36 44 -14 C 50 0 44 22 26 30 C 16 40 4 36 2 30 Z" fill="#ffd400" stroke={INK} strokeWidth={4} opacity={glow} />
      <path d="M -30 -20 q 8 6 0 12 M -18 -4 q 8 6 -2 14 M 30 -20 q -8 6 0 12 M 18 -4 q -8 6 2 14" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
    </Svg>
  );
};

/** a white rounded label chip, black type (numbers on screen: "12 SEC", "DAY 60") */
export const Chip: React.FC<{ text: string; size?: number; bg?: string; color?: string }> = ({ text, size = 64, bg = "#fff", color = INK }) => (
  <div style={{ position: "absolute", transform: "translate(-50%, -50%)", whiteSpace: "nowrap", background: bg, color, fontFamily: FONT, fontSize: size,
    padding: `${size * 0.12}px ${size * 0.4}px`, borderRadius: size * 0.35, border: `${Math.max(4, size * 0.08)}px solid ${INK}`, boxShadow: "0 8px 18px rgba(0,0,0,0.35)" }}>{text}</div>
);

/** big outlined glyph: "!" "?" "Zz" — the reaction marks */
export const Mark: React.FC<{ text: string; size?: number; color?: string }> = ({ text, size = 150, color = "#ffd400" }) => (
  <div style={{ position: "absolute", transform: "translate(-50%, -50%)", fontFamily: FONT, fontSize: size, color, ...outline, WebkitTextStroke: `${size * 0.09}px #000` }}>{text}</div>
);

/** a comic impact star */
export const Bonk: React.FC<{ size?: number }> = ({ size = 220 }) => (
  <Svg size={size}>
    <path d={Array.from({ length: 16 }).map((_, i) => { const r = i % 2 ? 22 : 46, a = (i / 16) * Math.PI * 2; return `${i ? "L" : "M"} ${r * Math.cos(a)} ${r * Math.sin(a)}`; }).join(" ") + " Z"} fill="#ffe14d" stroke={INK} strokeWidth={4} />
  </Svg>
);

/** curly current lines streaming past (the sea carrying something off) */
export const Current: React.FC<{ t: number; x: number; y: number; w?: number; dir?: number; opacity?: number }> = ({ t, x, y, w = 700, dir = 1, opacity = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: 300, opacity }}>
    {[0, 1, 2].map((i) => {
      const k = ((t * 0.6 + i / 3) % 1);
      return (
        <svg key={i} viewBox="0 0 200 40" style={{ position: "absolute", left: (dir > 0 ? k : 1 - k) * w - 100, top: i * 90, width: 260, height: 52, opacity: Math.sin(k * Math.PI) }}>
          <path d="M 5 20 C 40 0, 60 40, 100 20 S 160 0, 180 20" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" />
          <path d={dir > 0 ? "M 170 8 L 192 20 L 170 32" : "M 30 8 L 8 20 L 30 32"} fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    })}
  </div>
);

/** the reference's big red X, struck over whatever is being ruled out */
export const RedX: React.FC<{ t: number; at: number; size?: number }> = ({ t, at, size = 300 }) => {
  const a = clamp01((t - at) / 0.12), b = clamp01((t - at - 0.12) / 0.12);
  const L = 80;
  return (
    <Svg size={size}>
      <line x1={-L / 2} y1={-L / 2} x2={-L / 2 + L * a} y2={-L / 2 + L * a} stroke="#e8171b" strokeWidth={13} strokeLinecap="round" style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.4))" }} />
      {b > 0 && <line x1={L / 2} y1={-L / 2} x2={L / 2 - L * b} y2={-L / 2 + L * b} stroke="#e8171b" strokeWidth={13} strokeLinecap="round" style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.4))" }} />}
    </Svg>
  );
};

/** a red pointer arrow (rot: degrees, 0 = pointing right), drawn on with a little nudge */
export const Arrow: React.FC<{ t: number; at: number; size?: number; rot?: number; color?: string }> = ({ t, at, size = 160, rot = 0, color = "#e8171b" }) => {
  const k = ease(t, at, at + 0.2);
  const nudge = Math.sin((t - at) * 9) * 4 * (t > at + 0.2 ? 1 : 0);
  return (
    <Svg size={size}>
      <g transform={`rotate(${rot}) translate(${nudge} 0)`} opacity={k}>
        <line x1={-40} y1={0} x2={-40 + 70 * k} y2={0} stroke={color} strokeWidth={10} strokeLinecap="round" />
        {k > 0.9 && <path d="M 14 -18 L 36 0 L 14 18" fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />}
      </g>
    </Svg>
  );
};

/** a small hand-lettered note with an arrow, like the reference's "food →" labels */
export const Note: React.FC<{ text: string; size?: number; color?: string; rot?: number }> = ({ text, size = 54, color = "#fff", rot = -8 }) => (
  <div style={{ position: "absolute", transform: `translate(-50%, -50%) rotate(${rot}deg)`, whiteSpace: "nowrap", fontFamily: FONT, fontSize: size, color,
    textShadow: "0 3px 0 rgba(0,0,0,0.55), 0 0 12px rgba(0,0,0,0.5)" }}>{text}</div>
);

/**
 * Channel branding, as the reference carries it: a round logo top-right and
 * the channel name set faint and vertical down one edge. Both optional;
 * the line has no channel yet, so a short passes nothing and this draws nothing.
 */
export const Brand: React.FC<{ logo?: string; name?: string }> = ({ logo, name }) => (
  <>
    {logo && <Img src={staticFile(logo)} style={{ position: "absolute", right: 40, top: 150, width: 120, height: 120, borderRadius: 999, boxShadow: "0 4px 12px rgba(0,0,0,0.35)" }} />}
    {name && (
      <div style={{ position: "absolute", left: 18, top: H * 0.3, writingMode: "vertical-rl", fontFamily: FONT, fontSize: 30, letterSpacing: "0.55em", color: "rgba(255,255,255,0.28)" }}>
        {name.toUpperCase()}
      </div>
    )}
  </>
);

/**
 * A comic speech bubble with its tail pointing at the speaker (tail: the
 * point, relative to the bubble's centre). `sub` is a small second line
 * (a translation). `jitter` shakes it, for garbled overheard talk.
 */
export const Bubble: React.FC<{ text: string; sub?: string; size?: number; tail?: [number, number]; t?: number; jitter?: number; color?: string }> = ({ text, sub, size = 62, tail = [-80, 120], t = 0, jitter = 0, color = INK }) => {
  const jx = jitter ? Math.sin(t * 37) * jitter : 0, jy = jitter ? Math.cos(t * 29) * jitter : 0;
  const w = Math.max(text.length * size * 0.62, (sub?.length ?? 0) * size * 0.34) + size * 1.1;
  const h = size * (sub ? 2.05 : 1.55);
  const tx = tail[0], ty = tail[1];
  const bx = Math.max(-w / 2 + 30, Math.min(w / 2 - 30, tx * 0.4));
  return (
    <div style={{ position: "absolute", left: jx, top: jy, width: 0, height: 0 }}>
      <svg style={{ position: "absolute", left: -w, top: -h, width: w * 2, height: h * 2 + Math.abs(ty), overflow: "visible" }} viewBox={`${-w} ${-h} ${w * 2} ${h * 2 + Math.abs(ty)}`}>
        <path d={`M ${bx - 22} ${ty > 0 ? h / 2 - 6 : -h / 2 + 6} L ${tx} ${ty} L ${bx + 22} ${ty > 0 ? h / 2 - 6 : -h / 2 + 6} Z`} fill="#fff" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h * 0.45} fill="#fff" stroke={INK} strokeWidth={6} />
        <path d={`M ${bx - 19} ${ty > 0 ? h / 2 - 4 : -h / 2 + 4} L ${bx + 19} ${ty > 0 ? h / 2 - 4 : -h / 2 + 4}`} stroke="#fff" strokeWidth={9} />
      </svg>
      <div style={{ position: "absolute", left: -w / 2, top: -h / 2, width: w, height: h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: FONT, color, lineHeight: 1.05, textAlign: "center" }}>
        <div style={{ fontSize: size }}>{text}</div>
        {sub && <div style={{ fontSize: size * 0.48, color: "#666", marginTop: size * 0.08 }}>{sub}</div>}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------ captions */

/**
 * The reference's caption: ONE word at a time, orange, condensed heavy caps
 * with a dark outline, a third of the way up from the bottom (~69% down),
 * popping on as it's spoken. Measured off its frames: cap height ~3.6% of
 * the frame, an 8-letter word spans ~a third of the width.
 */
export const WordCaption: React.FC<{ T: Timing; t: number; y?: number; size?: number }> = ({ T, t, y: cy, size = 100 }) => {
  const { H } = useStage();
  const y = cy ?? H * 0.69;
  let hit: Word | null = null;
  for (const l of T.lines) {
    for (let i = 0; i < l.words.length; i++) {
      const w = l.words[i], next = l.words[i + 1];
      const end = next ? next[1] : w[2] + 0.25;
      if (t >= w[1] - 0.03 && t < end) hit = w;
    }
  }
  if (!hit) return null;
  const pop = 0.7 + 0.3 * over(t, hit[1] - 0.03, hit[1] + 0.12);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, transform: `translateY(-50%) scale(${pop})`, textAlign: "center", fontFamily: CAPTION_FONT, fontSize: size,
      lineHeight: 1, textTransform: "uppercase", letterSpacing: "0.01em", color: "#ff7a14",
      WebkitTextStroke: `${size * 0.1}px #1b0f05`, paintOrder: "stroke fill", filter: "drop-shadow(0 4px 2px rgba(0,0,0,0.55))" }}>
      {hit[0].replace(/[,.?!;:]+$/, "")}
    </div>
  );
};

/** the phrase style (2–3 words, spoken one yellow): kept for shorts that want it */

const YELLOW = "#ffd400";

/**
 * Two-to-three word chunks, the spoken word lit yellow, the rest white;
 * heavy black outline, lower-centre. A chunk breaks on punctuation or after
 * `max` words, so a phrase reads as a phrase.
 */
export const Captions: React.FC<{ T: Timing; t: number; y?: number; size?: number; max?: number }> = ({ T, t, y = H * 0.7, size = 92, max = 3 }) => {
  const chunks: Word[][] = [];
  for (const l of T.lines) {
    let cur: Word[] = [];
    l.words.forEach((w, i) => {
      cur.push(w);
      const punct = /[,.?!;:]$/.test(l.text.split(/\s+/)[i] ?? "");
      if (cur.length >= max || punct || i === l.words.length - 1) { chunks.push(cur); cur = []; }
    });
  }
  let idx = -1;
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i], next = chunks[i + 1];
    const end = next ? Math.min(next[0][1], c[c.length - 1][2] + 0.5) : c[c.length - 1][2] + 0.5;
    if (t >= c[0][1] - 0.04 && t < end) idx = i;
  }
  if (idx < 0) return null;
  const c = chunks[idx];
  const pop = 0.86 + 0.14 * over(t, c[0][1] - 0.04, c[0][1] + 0.16);
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: y, transform: `translateY(-50%) scale(${pop})`, textAlign: "center", fontFamily: FONT, fontSize: size, lineHeight: 1.08,
      letterSpacing: "0.01em", textTransform: "uppercase", filter: "drop-shadow(0 6px 0 rgba(0,0,0,0.45))" }}>
      {c.map((w, i) => {
        const lit = t >= w[1] - 0.04;
        const on = lit && (i === c.length - 1 || t < c[i + 1][1] - 0.04);
        return (
          <span key={i} style={{ color: on ? YELLOW : "#fff", ...outline, WebkitTextStroke: `${size * 0.13}px #000`, display: "inline-block", margin: `0 ${size * 0.2}px`,
            transform: on ? "scale(1.08)" : undefined }}>{w[0].replace(/[,.?!;:]+$/, "")}</span>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------ shots */

export type ShotCtx = { t: number; u: number; start: number; end: number };
/**
 * transition: how this shot comes in.
 *   "cut"  (default) a hard cut that lands with a small zoom settle, never a dead cut
 *   "whip" a fast horizontal whip-pan with motion blur (section changes)
 *   "zoom" a zoom-through: the new shot rushes in from big and blurred (reveals)
 */
export type Shot = {
  at: number;
  render: (s: ShotCtx) => React.ReactNode;
  transition?: "cut" | "whip" | "zoom";
  /**
   * jump cuts inside the shot: [time, zoom, focusX?, focusY?] hard-cut reframes
   * (tight, wide, tight…), so a long line never sits on one framing. Left out,
   * any shot over ~2 s gets them automatically every ~1.4 s; `false` turns them
   * off (for a shot whose camera move is the point).
   */
  reframes?: [number, number, number?, number?][] | false;
};

const WHIP = 0.2, ZOOM = 0.28, SETTLE = 0.28, JUMP = 1.4;

/** the framing in force at t: the latest reframe, or an automatic tight/wide alternation */
const frameAt = (s: Shot, t: number, end: number, W: number, H: number) => {
  let f = { z: 1, fx: W / 2, fy: H * 0.45, since: s.at };
  if (s.reframes === false) return f;
  let list = s.reframes;
  if (!list) {
    const n = Math.round((end - s.at) / JUMP);
    list = [];
    for (let k = 1; k < n; k++) list.push([s.at + ((end - s.at) * k) / n, k % 2 ? 1.16 : 1]);
  }
  for (const [at, z, fx = W / 2, fy = H * 0.45] of list) if (t >= at) f = { z, fx, fy, since: at };
  return f;
};

/** plays the shot whose `at` is the latest one not after t, with its transition in */
export const ShotPlayer: React.FC<{ shots: Shot[]; t: number; total: number }> = ({ shots, t, total }) => {
  const { W, H } = useStage();
  const sorted = [...shots].sort((a, b) => a.at - b.at);
  let i = 0;
  for (let k = 0; k < sorted.length; k++) if (t >= sorted[k].at) i = k;
  const s = sorted[i], prev = sorted[i - 1];
  const end = sorted[i + 1]?.at ?? total;
  const u = t - s.at;
  const draw = (sh: Shot, e: number) => {
    const f = frameAt(sh, t, e, W, H);
    const body = sh.render({ t, u: t - sh.at, start: sh.at, end: e });
    return f.z === 1 ? body : <AbsoluteFill style={{ transform: `scale(${f.z})`, transformOrigin: `${f.fx}px ${f.fy}px` }}>{body}</AbsoluteFill>;
  };
  const tr = s.transition ?? "cut";
  if (tr === "whip" && prev && u < WHIP) {
    const k = ease(u, 0, WHIP);
    const blur = 26 * Math.sin(Math.PI * k);
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <AbsoluteFill style={{ transform: `translateX(${-W * k}px)`, filter: `blur(${blur}px)` }}>{draw(prev, s.at)}</AbsoluteFill>
        <AbsoluteFill style={{ transform: `translateX(${W * (1 - k)}px)`, filter: `blur(${blur}px)` }}>{draw(s, end)}</AbsoluteFill>
      </AbsoluteFill>
    );
  }
  if (tr === "zoom" && u < ZOOM) {
    const k = ease(u, 0, ZOOM);
    return <AbsoluteFill style={{ transform: `scale(${1.35 - 0.35 * k})`, filter: `blur(${14 * (1 - k)}px)` }}>{draw(s, end)}</AbsoluteFill>;
  }
  // every hard cut (and every jump cut) lands with a small zoom settle
  const v = t - frameAt(s, t, end, W, H).since;
  const settle = v < SETTLE ? 0.06 * (1 - ease(v, 0, SETTLE)) : 0;
  return <AbsoluteFill style={{ transform: `scale(${1 + settle})` }}>{draw(s, end)}</AbsoluteFill>;
};

/**
 * Snap zooms on the stressed words: a quick punch-in (≈7%) that settles,
 * like the reference's editor-keyframed hits (≈10%). Wrap the picture (not the
 * captions) in it; `hits` are the times to punch on.
 */
export const Punch: React.FC<{ t: number; hits: number[]; amount?: number; children: React.ReactNode }> = ({ t, hits, amount = 0.1, children }) => {
  let k = 0, rot = 0;
  for (const h of hits) {
    const v = t < h ? 0 : t < h + 0.07 ? (t - h) / 0.07 : Math.max(0, 1 - (t - h - 0.07) / 0.38);
    if (v > k) { k = v; rot = (Math.round(h * 10) % 2 ? 1 : -1) * 0.6 * v; }
  }
  const e = k * k * (3 - 2 * k);
  return <AbsoluteFill style={{ transform: `scale(${1 + amount * e}) rotate(${rot}deg)` }}>{children}</AbsoluteFill>;
};

/** the times to punch on: every SFX cue in script.json (word index, optional offset) plus any extra words */
export const hitsFromScript = (
  T: Timing,
  script: { lines: { id: string; sfx?: (string | number)[][] }[] },
  extra: [string, number][] = [],
  skip: string[] = ["whoosh"],
) => {
  const out: number[] = [];
  for (const l of script.lines) for (const c of l.sfx ?? []) {
    if (skip.includes(String(c[0]))) continue;
    out.push(cue(T, l.id, Number(c[1])) + Number(c[2] ?? 0));
  }
  for (const [id, i] of extra) out.push(cue(T, id, i));
  return out.sort((a, b) => a - b);
};
