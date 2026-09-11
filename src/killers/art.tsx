import React from "react";
import { STROKE, blob, line, rng, smooth } from "../planets/kit";

// The cast and props for "Ten Serial Killers, and What Actually Caught Them".
//
// Deliberately restrained: a muted palette, faceless silhouettes, and objects
// rather than people wherever the object is the point. Nothing in this file
// draws violence, injury, a weapon in use, or a recognisable likeness — the
// subject is the investigation, not the crime.

export const PAPER = "#f3f1ec";
export const INK = "#1b1b1b";
export const GREY = "#6f6f6f";
export const FAINT = "#c6c3bb";
export const ACCENT = "#a8433a"; // brick, used only for the thing that caught him
export const BLUE = "#4a7089";
export const OCHRE = "#b08c4a";
export const SLATE = "#aeb4ba";

export const FONT = "'ComicRelief', 'Comic Sans MS', cursive";

export const Paper: React.FC<{ fill?: string }> = ({ fill = PAPER }) => (
  <rect x={0} y={0} width={1920} height={1080} fill={fill} />
);

/** A hairline rule, for separating a header from the body of a scene. */
export const Rule: React.FC<{ x: number; y: number; w: number; color?: string }> = ({
  x,
  y,
  w,
  color = FAINT,
}) => <path d={`M ${x} ${y} l ${w} 0`} {...line(3, color)} />;

/**
 * A person, with no face and no features. Every human in this video is one of
 * these: the men, the victims, the police. Nobody is caricatured.
 */
export const Silhouette: React.FC<{
  x: number;
  y: number;
  scale?: number;
  fill?: string;
  outline?: boolean;
}> = ({ x, y, scale = 1, fill = SLATE, outline = true }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path
      d="M -66 0 q 0 -104 42 -128 q -22 -20 -22 -50 q 0 -46 46 -46 q 46 0 46 46 q 0 30 -22 50 q 42 24 42 128 Z"
      {...(outline ? line(STROKE - 1) : { stroke: "none" })}
      fill={fill}
    />
  </g>
);

/** A block of silhouettes, for a count. `lit` of them take the accent colour. */
export const Crowd: React.FC<{
  n: number;
  x: number;
  y: number;
  cols?: number;
  gap?: number;
  scale?: number;
  lit?: number;
  litFill?: string;
  fill?: string;
}> = ({ n, x, y, cols = 12, gap = 62, scale = 0.32, lit = 0, litFill = ACCENT, fill = SLATE }) => (
  <g>
    {[...Array(n)].map((_, i) => (
      <Silhouette
        key={i}
        x={x + (i % cols) * gap}
        y={y + Math.floor(i / cols) * gap * 1.5}
        scale={scale}
        fill={i < lit ? litFill : fill}
      />
    ))}
  </g>
);

/** The recurring verdict card. Muted — this is not a game-show stamp. */
export const Plaque: React.FC<{
  x: number;
  y: number;
  value: string;
  label?: string;
  w?: number;
}> = ({ x, y, value, label = "WHAT CAUGHT HIM", w }) => {
  const width = w ?? Math.max(620, value.length * 27 + 120);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-width / 2} y={-92} width={width} height={184} rx={6} fill="#ffffff" />
      <rect x={-width / 2} y={-92} width={width} height={184} rx={6} {...line(4, INK)} fill="none" />
      <path d={`M ${-width / 2} -34 l ${width} 0`} {...line(3, FAINT)} />
      <text x={0} y={-52} fontFamily={FONT} fontSize={30} fill={GREY} textAnchor="middle" letterSpacing="3">
        {label}
      </text>
      <text x={0} y={44} fontFamily={FONT} fontSize={54} fill={ACCENT} textAnchor="middle">
        {value}
      </text>
    </g>
  );
};

/** Big year, the way each case opens. */
export const Year: React.FC<{ x: number; y: number; text: string; size?: number }> = ({
  x,
  y,
  text,
  size = 150,
}) => (
  <text x={x} y={y} fontFamily={FONT} fontSize={size} fill={INK} textAnchor="start">
    {text}
  </text>
);

/** A labelled horizontal bar, for years and counts. */
export const Bar: React.FC<{
  x: number;
  y: number;
  w: number;
  label: string;
  value: string;
  frac: number;
  fill?: string;
}> = ({ x, y, w, label, value, frac, fill = SLATE }) => (
  <g>
    <text x={x - 24} y={y + 38} fontFamily={FONT} fontSize={38} fill={INK} textAnchor="end">
      {label}
    </text>
    <rect x={x} y={y} width={w} height={52} rx={4} {...line(3, FAINT)} fill="#ffffff" />
    <rect x={x} y={y} width={Math.max(6, w * frac)} height={52} rx={4} fill={fill} />
    <text x={x + w + 24} y={y + 38} fontFamily={FONT} fontSize={34} fill={GREY} textAnchor="start">
      {value}
    </text>
  </g>
);

/** A plain timeline with ticks. */
export const Timeline: React.FC<{
  x: number;
  y: number;
  w: number;
  marks: { at: number; top?: string; bottom?: string; accent?: boolean }[];
}> = ({ x, y, w, marks }) => (
  <g>
    <path d={`M ${x} ${y} l ${w} 0`} {...line(5, INK)} />
    {marks.map((m, i) => (
      <g key={i}>
        <path d={`M ${x + w * m.at} ${y - 18} l 0 36`} {...line(5, m.accent ? ACCENT : INK)} />
        {m.top ? (
          <text
            x={x + w * m.at}
            y={y - 40}
            fontFamily={FONT}
            fontSize={34}
            fill={m.accent ? ACCENT : INK}
            textAnchor="middle"
          >
            {m.top}
          </text>
        ) : null}
        {m.bottom ? (
          <text x={x + w * m.at} y={y + 74} fontFamily={FONT} fontSize={30} fill={GREY} textAnchor="middle">
            {m.bottom}
          </text>
        ) : null}
      </g>
    ))}
  </g>
);

// ── the objects that actually stopped them ──────────────────────────

/** A Volkswagen Beetle, seen from the side. */
export const Beetle: React.FC<{ x: number; y: number; scale?: number; fill?: string }> = ({
  x,
  y,
  scale = 1,
  fill = "#c98a3c",
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path
      d="M -230 0 q -14 -96 40 -128 q 36 -86 150 -86 q 114 0 150 86 q 54 32 40 128 Z"
      {...line(STROKE)}
      fill={fill}
    />
    <path d="M -108 -128 q 30 -62 108 -62 q 78 0 108 62 Z" {...line(4)} fill="#dfe7ec" />
    <path d="M 0 -190 l 0 62" {...line(4)} />
    <circle cx={-132} cy={4} r={48} {...line(STROKE)} fill="#2f2f2f" />
    <circle cx={132} cy={4} r={48} {...line(STROKE)} fill="#2f2f2f" />
    <circle cx={-132} cy={4} r={18} fill="#8d8d8d" />
    <circle cx={132} cy={4} r={18} fill="#8d8d8d" />
    <path d="M -230 -40 l -22 0" {...line(6)} />
  </g>
);

/** A till receipt, curling at the bottom. */
export const Receipt: React.FC<{ x: number; y: number; scale?: number; rotate?: number }> = ({
  x,
  y,
  scale = 1,
  rotate = 0,
}) => {
  const r = rng(19);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <path
        d="M -90 -190 l 180 0 l 0 330 q -45 22 -90 0 q -45 -22 -90 0 Z"
        {...line(4)}
        fill="#ffffff"
      />
      {[...Array(7)].map((_, i) => (
        <path
          key={i}
          d={`M -62 ${-150 + i * 40} l ${60 + r() * 62} 0`}
          {...line(4, i === 3 ? INK : FAINT)}
        />
      ))}
    </g>
  );
};

/** A UK number plate. */
export const Plate: React.FC<{ x: number; y: number; scale?: number; text: string; wrong?: boolean }> = ({
  x,
  y,
  scale = 1,
  text,
  wrong,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-250} y={-66} width={500} height={132} rx={10} {...line(STROKE)} fill="#f2efe2" />
    <text x={0} y={22} fontFamily={FONT} fontSize={76} fill={INK} textAnchor="middle" letterSpacing="6">
      {text}
    </text>
    {/* the cross marks the plate as wrong without hiding what it says */}
    {wrong ? (
      <g opacity={0.5}>
        <path d="M -240 -60 L 240 60 M 240 -60 L -240 60" {...line(6, ACCENT)} />
      </g>
    ) : null}
  </g>
);

/** A police notebook, open, with a name written in it. */
export const Notebook: React.FC<{ x: number; y: number; scale?: number; name: string }> = ({
  x,
  y,
  scale = 1,
  name,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -190 -150 q 190 -26 380 0 l 0 300 q -190 26 -380 0 Z" {...line(STROKE)} fill="#fdfcf7" />
    <path d="M -4 -156 l 0 312" {...line(3, FAINT)} />
    {[...Array(5)].map((_, i) => (
      <path key={i} d={`M -160 ${-90 + i * 52} l 140 0`} {...line(3, FAINT)} />
    ))}
    <text x={100} y={0} fontFamily={FONT} fontSize={40} fill={INK} textAnchor="middle">
      {name}
    </text>
    <path d="M 30 30 l 140 0" {...line(3, FAINT)} />
    <path d="M 30 82 l 140 0" {...line(3, FAINT)} />
  </g>
);

/** A door, ajar. Used for the one victim who got out of one. */
export const Door: React.FC<{ x: number; y: number; scale?: number; open?: number }> = ({
  x,
  y,
  scale = 1,
  open = 0.4,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-170} y={-420} width={340} height={420} rx={6} {...line(STROKE)} fill="#d8d2c6" />
    <rect x={-140} y={-390} width={280} height={360} rx={4} fill="#1d1d1d" />
    <g transform={`translate(-140 0) skewY(${-open * 8})`}>
      <rect x={0} y={-390} width={220} height={390} rx={4} {...line(STROKE)} fill="#e7e1d4" />
      <rect x={26} y={-350} width={168} height={140} rx={4} {...line(3, FAINT)} fill="none" />
      <rect x={26} y={-180} width={168} height={140} rx={4} {...line(3, FAINT)} fill="none" />
      <circle cx={186} cy={-190} r={12} {...line(3)} fill={OCHRE} />
    </g>
  </g>
);

/** A sheet of paper with a signature on it — the forged will. */
export const Will: React.FC<{ x: number; y: number; scale?: number; rotate?: number }> = ({
  x,
  y,
  scale = 1,
  rotate = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
    <rect x={-170} y={-230} width={340} height={460} rx={4} {...line(4)} fill="#ffffff" />
    <text x={0} y={-150} fontFamily={FONT} fontSize={38} fill={INK} textAnchor="middle">
      LAST WILL
    </text>
    {[...Array(6)].map((_, i) => (
      <path key={i} d={`M -126 ${-92 + i * 46} l 252 0`} {...line(3, FAINT)} />
    ))}
    <path d="M -110 190 l 220 0" {...line(3, FAINT)} />
    <path d="M -96 188 q 34 -46 64 -8 q 26 32 58 -26 q 24 -40 56 14" {...line(5, BLUE)} fill="none" />
  </g>
);

/** A cardboard evidence box with a labelled swab inside. */
export const SwabBox: React.FC<{ x: number; y: number; scale?: number; label: string }> = ({
  x,
  y,
  scale = 1,
  label,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -200 -110 l 400 0 l -36 250 l -328 0 Z" {...line(STROKE)} fill="#c8a97a" />
    <path d="M -222 -110 l 444 0 l 0 -46 l -444 0 Z" {...line(STROKE)} fill="#b2905e" />
    <rect x={-120} y={-56} width={240} height={110} rx={6} {...line(3)} fill="#fdfcf7" />
    <text x={0} y={10} fontFamily={FONT} fontSize={34} fill={INK} textAnchor="middle">
      {label}
    </text>
    <path d="M -86 40 l 172 0" {...line(3, FAINT)} />
  </g>
);

/** A 3.5 inch floppy disk. */
export const Floppy: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-160} y={-160} width={320} height={320} rx={10} {...line(STROKE)} fill="#2f3338" />
    <rect x={-86} y={-160} width={172} height={116} rx={4} {...line(3, "#9aa1a8")} fill="#b9c0c6" />
    <rect x={-40} y={-160} width={64} height={110} fill="#6d757c" />
    <rect x={-116} y={20} width={232} height={140} rx={6} {...line(3, "#9aa1a8")} fill="#e9ecef" />
    <path d="M 96 -150 l 0 60" {...line(6, "#6d757c")} />
  </g>
);

/** A family tree: ancestors at the top, the branches meeting at one node. */
export const FamilyTree: React.FC<{ x: number; y: number; scale?: number; litPath?: boolean }> = ({
  x,
  y,
  scale = 1,
  litPath = true,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path
      d="M -300 -200 l 0 60 l 600 0 l 0 -60 M 0 -140 l 0 60
         M -300 -80 l -160 0 l 0 60 M -300 -80 l 160 0 l 0 60
         M 300 -80 l -160 0 l 0 60 M 300 -80 l 160 0 l 0 60"
      {...line(4, FAINT)}
      fill="none"
    />
    {litPath ? (
      <path d="M -460 -20 l 0 90 l 460 0 l 0 90 M 460 -20 l 0 90 l -460 0" {...line(5, ACCENT)} fill="none" />
    ) : null}
    {[
      [-300, -200],
      [300, -200],
      [-460, -20],
      [-140, -20],
      [140, -20],
      [460, -20],
    ].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r={26} {...line(4, FAINT)} fill="#ffffff" />
    ))}
    <circle cx={0} cy={160} r={40} {...line(5, ACCENT)} fill="#ffffff" />
    <text x={0} y={244} fontFamily={FONT} fontSize={34} fill={ACCENT} textAnchor="middle">
      one man
    </text>
  </g>
);

/** A saliva collection tube, for the closing line. */
export const Tube: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -52 -170 l 104 0 l 0 250 q -52 46 -104 0 Z" {...line(STROKE)} fill="#eef4f8" />
    <path d="M -52 -10 l 104 0 l 0 90 q -52 46 -104 0 Z" fill="#bfd8e6" />
    <rect x={-64} y={-200} width={128} height={40} rx={8} {...line(STROKE)} fill="#dfe7ec" />
  </g>
);

/** A fingerprint, drawn as concentric loops. Used for what 1888 did not have. */
export const Fingerprint: React.FC<{ x: number; y: number; scale?: number; color?: string }> = ({
  x,
  y,
  scale = 1,
  color = FAINT,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cx={0} cy={0} rx={104} ry={132} {...line(6, color)} fill="none" />
    {[0, 1, 2, 3].map((i) => (
      <ellipse key={i} cx={0} cy={-6 - i * 4} rx={82 - i * 20} ry={104 - i * 24} {...line(5, color)} fill="none" />
    ))}
    <path d="M -18 132 q 18 -40 36 0" {...line(5, color)} fill="none" />
  </g>
);

/** A sealed envelope, for the letters and the hoax tape. */
export const Envelope: React.FC<{ x: number; y: number; scale?: number; rotate?: number }> = ({
  x,
  y,
  scale = 1,
  rotate = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
    <rect x={-160} y={-104} width={320} height={208} rx={6} {...line(4)} fill="#fdfcf7" />
    <path d="M -160 -104 l 160 120 l 160 -120" {...line(4)} fill="none" />
  </g>
);

/** A cassette tape, for Wearside Jack. */
export const Cassette: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-200} y={-130} width={400} height={260} rx={12} {...line(STROKE)} fill="#3a3a3a" />
    <rect x={-150} y={-96} width={300} height={130} rx={6} {...line(3, "#9aa1a8")} fill="#d8d8d8" />
    <circle cx={-62} cy={-30} r={40} {...line(4, "#6d757c")} fill="#f2f2f2" />
    <circle cx={62} cy={-30} r={40} {...line(4, "#6d757c")} fill="#f2f2f2" />
    <rect x={-110} y={62} width={220} height={40} rx={6} fill="#5a5a5a" />
  </g>
);

export { blob, smooth, rng };
