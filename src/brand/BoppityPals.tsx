import React from "react";
import { AbsoluteFill, random } from "remotion";
import { loadVeggieFonts } from "../guess/fonts";
import { Bear, Bunny, Cat, Dog, type Pose } from "../play/chars";
import { loadPlayFonts } from "../play/text";

/**
 * Channel art for Boppity Pals — the play-along Shorts line (src/play/),
 * built from the same character drawings the Shorts use, so the channel
 * page and every video read as one thing.
 *
 *   Avatar      800×800. One face, big: Mimi, the race winner. A single
 *               face is what reads at the 36 px the Shorts feed shows it at.
 *   AvatarGroup 800×800 alternate: all four pals in a bunch.
 *   Banner      2560×1440 as uploaded. Everything that matters sits in the
 *               1546×423 centre band, which is all a phone shows.
 *   Watermark   150×150, transparent: the corner subscribe badge.
 */

const INK = "#3b2a3f";
const CREAM = "#fff7ee";
const LETTERS: [string, string][] = [
  ["#f7a24f", "#c86f1f"],
  ["#f48fb1", "#c65a82"],
  ["#6ec3f0", "#2f8cc0"],
  ["#7fd6a4", "#3a9e68"],
  ["#f7c948", "#c79a14"],
  ["#b69cf0", "#7a5cc4"],
];

/** Bubble wordmark: each letter its own colour, dark keyline, a 3D drop. */
const ADV: Record<string, number> = { B: 0.62, o: 0.58, p: 0.6, i: 0.31, t: 0.42, y: 0.55, P: 0.6, a: 0.57, l: 0.3, s: 0.49, " ": 0.26 };
const Wordmark: React.FC<{ x: number; y: number; size: number; text: string; offset?: number }> = ({ x, y, size, text, offset = 0 }) => {
  const letters = text.split("");
  const advOf = (ch: string) => (ADV[ch] ?? 0.56) * size * 0.97;
  const width = letters.reduce((w, ch) => w + advOf(ch), 0);
  let cx = x - width / 2;
  return (
    <g fontFamily="Baloo2, Fredoka, sans-serif" fontWeight={800} fontSize={size} textAnchor="middle">
      {letters.map((ch, i) => {
        if (ch === " ") {
          cx += advOf(ch);
          return null;
        }
        const [fill, shade] = LETTERS[(i + offset) % LETTERS.length];
        const lx = cx + advOf(ch) / 2;
        cx += advOf(ch);
        const tilt = (i % 2 ? 1 : -1) * (3 + (i % 3));
        const bob = (i % 2 ? -1 : 1) * size * 0.03;
        return (
          <g key={i} transform={`translate(${lx} ${y + bob}) rotate(${tilt})`}>
            <text y={size * 0.09} fill={INK} stroke={INK} strokeWidth={size * 0.2} strokeLinejoin="round">
              {ch}
            </text>
            <text y={size * 0.05} fill={shade} stroke={shade} strokeWidth={size * 0.12} strokeLinejoin="round">
              {ch}
            </text>
            <text y={0} fill={fill} stroke={INK} strokeWidth={size * 0.035} strokeLinejoin="round" paintOrder="stroke">
              {ch}
            </text>
            <ellipse cx={-size * 0.1} cy={-size * 0.46} rx={size * 0.07} ry={size * 0.035} fill="#ffffff" opacity={0.7} transform={`rotate(-25 ${-size * 0.1} ${-size * 0.46})`} />
          </g>
        );
      })}
    </g>
  );
};

/** Soft confetti and music notes, deterministic. */
const Sprinkles: React.FC<{ w: number; h: number; n: number; seed: string; avoid?: { x: number; y: number; w: number; h: number } }> = ({ w, h, n, seed, avoid }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const x = random(`${seed}x${i}`) * w;
      const y = random(`${seed}y${i}`) * h;
      if (avoid && x > avoid.x && x < avoid.x + avoid.w && y > avoid.y && y < avoid.y + avoid.h) return null;
      const c = LETTERS[i % LETTERS.length][0];
      const kind = i % 4;
      const r = 8 + random(`${seed}r${i}`) * 10;
      const rot = random(`${seed}t${i}`) * 360;
      if (kind === 0) return <circle key={i} cx={x} cy={y} r={r * 0.7} fill={c} opacity={0.75} />;
      if (kind === 1) return <rect key={i} x={x - r} y={y - r * 0.45} width={r * 2} height={r * 0.9} rx={r * 0.3} fill={c} opacity={0.75} transform={`rotate(${rot} ${x} ${y})`} />;
      if (kind === 2)
        return (
          <path
            key={i}
            d={`M ${x} ${y - r * 1.4} l ${r * 0.35} ${r} l ${r} ${r * 0.35} l ${-r} ${r * 0.35} l ${-r * 0.35} ${r} l ${-r * 0.35} ${-r} l ${-r} ${-r * 0.35} l ${r} ${-r * 0.35} Z`}
            fill={c}
            opacity={0.8}
          />
        );
      return (
        <g key={i} transform={`translate(${x} ${y}) rotate(${rot / 8 - 20}) scale(${r / 14})`} fill={c} opacity={0.8}>
          <ellipse cx={0} cy={0} rx={10} ry={8} transform="rotate(-20)" />
          <rect x={7} y={-40} width={4} height={40} />
          <path d="M 11 -40 q 16 6 14 22 q -4 -12 -14 -12 Z" />
        </g>
      );
    })}
  </g>
);

/* ------------------------------------------------------------------ */
/* avatars                                                             */
/* ------------------------------------------------------------------ */

const AvatarBg: React.FC<{ a: string; b: string }> = ({ a, b }) => (
  <>
    <defs>
      <radialGradient id="avBg" cx="0.5" cy="0.42" r="0.62">
        <stop offset="0" stopColor={a} />
        <stop offset="1" stopColor={b} />
      </radialGradient>
    </defs>
    <rect width={800} height={800} fill="url(#avBg)" />
    <g opacity={0.35}>
      {Array.from({ length: 12 }, (_, i) => {
        const ang = (i / 12) * Math.PI * 2;
        return <path key={i} d={`M 400 400 L ${400 + Math.cos(ang - 0.13) * 700} ${400 + Math.sin(ang - 0.13) * 700} L ${400 + Math.cos(ang + 0.13) * 700} ${400 + Math.sin(ang + 0.13) * 700} Z`} fill="#ffffff" />;
      })}
    </g>
  </>
);

/** Mimi's face, big enough to fill YouTube's circle crop. */
export const BoppityAvatar: React.FC = () => {
  loadPlayFonts();
  const pose: Pose = { eyes: "sparkle", mouth: "open", armL: [-70, -104], armR: [70, -104], wag: 14 };
  return (
    <AbsoluteFill>
      <svg width={800} height={800} viewBox="0 0 800 800" style={{ position: "absolute", inset: 0 }}>
        <AvatarBg a="#fff4d6" b="#ffc36e" />
        {/* head centre (0,-170) lands at (400,380); the body runs off the bottom */}
        <g transform="translate(400 850) scale(2.62)">
          <Cat {...pose} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** All four pals in a bunch — the alternate avatar. */
export const BoppityAvatarGroup: React.FC = () => {
  loadPlayFonts();
  return (
    <AbsoluteFill>
      <svg width={800} height={800} viewBox="0 0 800 800" style={{ position: "absolute", inset: 0 }}>
        <AvatarBg a="#fdf6ff" b="#c9b6f2" />
        <g transform="translate(250 560) scale(1.55) rotate(-8)">
          <Bunny eyes="happy" mouth="smile" />
        </g>
        <g transform="translate(560 575) scale(1.55) rotate(8)">
          <Bear eyes="open" mouth="smile" />
        </g>
        <g transform="translate(285 900) scale(1.75) rotate(-6)">
          <Dog eyes="open" mouth="tongue" />
        </g>
        <g transform="translate(525 905) scale(1.75) rotate(6)">
          <Cat eyes="sparkle" mouth="open" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* banner                                                              */
/* ------------------------------------------------------------------ */

const Rope: React.FC<{ x: number; y1: number }> = ({ x, y1 }) => (
  <g>
    <path d={`M ${x} -10 L ${x} ${y1}`} stroke="#b08c58" strokeWidth={20} />
    <path d={`M ${x} -10 L ${x} ${y1}`} stroke="#dcbf8e" strokeWidth={14} />
    <g stroke="#a48152" strokeWidth={3} fill="none" strokeLinecap="round">
      {Array.from({ length: Math.floor(y1 / 24) }, (_, i) => (
        <path key={i} d={`M ${x - 8} ${i * 24} q 8 6 16 12`} />
      ))}
    </g>
    <ellipse cx={x} cy={y1} rx={15} ry={19} fill="#dcbf8e" stroke="#b08c58" strokeWidth={4} />
  </g>
);

export const BoppityBanner: React.FC<{ guides?: boolean }> = ({ guides = false }) => {
  loadPlayFonts();
  loadVeggieFonts();
  const cx = 1280;
  const cy = 720;
  const band = { x: (2560 - 1546) / 2, y: (1440 - 423) / 2, w: 1546, h: 423 };
  return (
    <AbsoluteFill style={{ backgroundColor: CREAM }}>
      <svg width={2560} height={1440} viewBox="0 0 2560 1440" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="bnBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d9efff" />
            <stop offset="0.55" stopColor="#fff7ee" />
            <stop offset="1" stopColor="#ffe9d6" />
          </linearGradient>
          <radialGradient id="bnGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffffff" stopOpacity={0.9} />
            <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={2560} height={1440} fill="url(#bnBg)" />
        {/* the two formats, one each side, out at the edges desktop shows */}
        {[180, 330, 480].map((x) => (
          <Rope key={x} x={x} y1={560 + (x % 3) * 40} />
        ))}
        {[2080, 2230, 2380].map((x) => (
          <Rope key={x} x={x} y1={600 - (x % 3) * 30} />
        ))}
        <Sprinkles w={2560} h={1440} n={120} seed="bn" avoid={{ x: band.x + 180, y: band.y - 10, w: band.w - 360, h: band.h + 20 }} />
        <ellipse cx={cx} cy={cy} rx={900} ry={260} fill="url(#bnGlow)" />
        {/* the floor line the pals stand on */}
        <path d={`M 0 ${cy + 200} Q ${cx} ${cy + 170} 2560 ${cy + 200} L 2560 1440 L 0 1440 Z`} fill="#ffe2c4" />
        <path d={`M 0 ${cy + 200} Q ${cx} ${cy + 170} 2560 ${cy + 200}`} stroke="#f1c79c" strokeWidth={6} fill="none" />

        {/* the pals: a pair each side of the wordmark, all inside the phone band */}
        <g transform={`translate(${band.x + 104} ${cy + 180}) scale(0.9) rotate(-6)`}>
          <Bunny eyes="happy" mouth="grin" armL={[-40, -20]} armR={[30, -60]} />
        </g>
        <g transform={`translate(${band.x + 250} ${cy + 204}) scale(1.05) rotate(3)`}>
          <Bear eyes="happy" mouth="open" armL={[-66, -104]} armR={[46, -40]} />
        </g>
        <g transform={`translate(${band.x + band.w - 104} ${cy + 180}) scale(0.9) rotate(6)`}>
          <Dog eyes="happy" mouth="tongue" armL={[-30, -60]} armR={[40, -20]} wag={18} />
        </g>
        <g transform={`translate(${band.x + band.w - 250} ${cy + 204}) scale(1.05) rotate(-3)`}>
          <Cat eyes="sparkle" mouth="open" armL={[-46, -40]} armR={[66, -104]} wag={16} />
        </g>

        <Wordmark x={cx} y={cy + 6} size={140} text="Boppity Pals" />
        <g transform={`translate(${cx} ${cy + 112})`}>
          <rect x={-350} y={-32} width={700} height={64} rx={32} fill={INK} />
          <text y={12} textAnchor="middle" fontFamily="ComicRelief, sans-serif" fontWeight={700} fontSize={32} fill="#ffffff">
            play along · pick a champion · every day
          </text>
        </g>

        {guides ? (
          <g fill="none" strokeWidth={5} strokeDasharray="22 12">
            <rect x={band.x} y={band.y} width={band.w} height={band.h} stroke="#ff2d55" />
            <rect x={0} y={band.y} width={2560} height={band.h} stroke="#2d7dff" />
            <text x={band.x + 16} y={band.y + 44} fill="#ff2d55" stroke="none" fontFamily="sans-serif" fontSize={34}>
              phone + all devices (1546×423)
            </text>
            <text x={20} y={band.y - 16} fill="#2d7dff" stroke="none" fontFamily="sans-serif" fontSize={34}>
              desktop (2560×423)
            </text>
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
export const BoppityBannerGuides: React.FC = () => <BoppityBanner guides />;

/* ------------------------------------------------------------------ */
/* watermark                                                           */
/* ------------------------------------------------------------------ */

/** The corner subscribe badge: Mimi in a white ring, transparent outside. */
export const BoppityWatermark: React.FC = () => {
  loadPlayFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <svg width={150} height={150} viewBox="0 0 150 150" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="wmClip">
            <circle cx={75} cy={75} r={66} />
          </clipPath>
        </defs>
        <circle cx={75} cy={75} r={72} fill="#ffffff" />
        <circle cx={75} cy={75} r={66} fill="#ffc36e" />
        <g clipPath="url(#wmClip)">
          <g transform="translate(75 176) scale(0.6)">
            <Cat eyes="sparkle" mouth="open" />
          </g>
        </g>
        <circle cx={75} cy={75} r={69} fill="none" stroke={INK} strokeWidth={4} />
      </svg>
    </AbsoluteFill>
  );
};
