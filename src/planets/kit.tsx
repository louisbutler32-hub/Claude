import React from "react";
import {
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ────────────────────────────────────────────────────────────────────
// The look: white paper, black marker outlines, flat highlighter fills,
// handwritten labels. Everything is drawn in one 1920x1080 SVG space so
// scenes can be composed by dropping primitives at absolute coordinates.
// ────────────────────────────────────────────────────────────────────

export const W = 1920;
export const H = 1080;

export const ink = "#111111";
export const red = "#e01b1b";
export const blue = "#2f7fd4";
export const orange = "#f0a11e";
export const grey = "#6c6c6c";

export const FONT = "'ComicRelief', 'Comic Sans MS', cursive";
export const STROKE = 5;

/** Marker-line defaults — round caps, no fill, hand-drawn weight. */
export const line = (width = STROKE, color = ink) => ({
  stroke: color,
  strokeWidth: width,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
});

// ── deterministic jitter ────────────────────────────────────────────
// Never call Math.random() in a component: every frame must draw the
// same wobble or the artwork boils. Everything below is seeded.

const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** A wobbly horizontal edge across [x0,x1] at height y — the terrain line. */
export const ridge = (
  x0: number,
  x1: number,
  y: number,
  amp: number,
  steps: number,
  seed: number,
  bow = 0
) => {
  const r = rng(seed);
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    const curve = bow * Math.sin(Math.PI * t);
    pts.push([x, y - curve + (r() - 0.5) * 2 * amp]);
  }
  return smooth(pts);
};

/** Catmull-Rom through the points, emitted as a cubic path. */
export const smooth = (pts: [number, number][]) => {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${
      p2[0] - (p3[0] - p1[0]) / 6
    } ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`;
  }
  return d;
};

/** A closed hand-drawn circle (slightly out of round, like a marker loop). */
export const blob = (cx: number, cy: number, r: number, seed: number, wob = 0.03) => {
  const rand = rng(seed);
  const pts: [number, number][] = [];
  const n = 14;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 + (rand() - 0.5) * 2 * wob);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  pts.push(pts[0], pts[1], pts[2]);
  return smooth(pts) + " Z";
};

// ── fonts ───────────────────────────────────────────────────────────

let fontsReady: Promise<unknown> | null = null;

export const useDoodleFont = () => {
  const [handle] = React.useState(() => delayRender("comic-relief"));
  React.useEffect(() => {
    if (!fontsReady) {
      const face = new FontFace(
        "ComicRelief",
        `url(${staticFile("fonts/ComicRelief.ttf")})`
      );
      fontsReady = face.load().then((f) => {
        document.fonts.add(f as FontFace);
      });
    }
    fontsReady.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
};

/** Decode the planet photos before frame 0 so none of them pops in late. */
export const PLANET_IMAGES = [
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "uranus",
  "neptune",
];

let imagesReady: Promise<unknown> | null = null;

export const usePlanetImages = () => {
  const [handle] = React.useState(() => delayRender("planet-photos"));
  React.useEffect(() => {
    if (!imagesReady) {
      imagesReady = Promise.all(
        PLANET_IMAGES.map(
          (n) =>
            new Promise((done) => {
              const img = new Image();
              img.onload = done;
              img.onerror = done;
              img.src = staticFile(`assets/planets/${n}.png`);
            })
        )
      );
    }
    imagesReady.then(() => continueRender(handle));
  }, [handle]);
};

// ── timing helpers ──────────────────────────────────────────────────

/** Pop-in: overshoot scale + fade, `delay` frames after the scene starts. */
export const usePop = (delay = 0, damping = 12) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping, mass: 0.6 } });
  return { scale: s, opacity: Math.min(1, s * 1.6) };
};

/** Slow constant drift, for skies and clouds. */
export const drift = (frame: number, speed: number, span: number) =>
  ((frame * speed) % span) - span / 2;

// ── primitives ──────────────────────────────────────────────────────

export const Sky: React.FC<{ from: string; to: string; y?: number }> = ({
  from,
  to,
  y = H,
}) => (
  <>
    <defs>
      <linearGradient id={`sky-${from.slice(1)}-${to.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={from} />
        <stop offset="100%" stopColor={to} />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={W} height={y} fill={`url(#sky-${from.slice(1)}-${to.slice(1)})`} />
  </>
);

/** One wobbly ground band: filled shape plus its inked top edge. */
export const Band: React.FC<{
  y: number;
  fill: string;
  seed: number;
  amp?: number;
  bow?: number;
  stroke?: string;
}> = ({ y, fill, seed, amp = 9, bow = 0, stroke = ink }) => {
  const top = ridge(-10, W + 10, y, amp, 22, seed, bow);
  return (
    <>
      <path d={`${top} L ${W + 10} ${H + 10} L -10 ${H + 10} Z`} fill={fill} />
      <path d={top} {...line(STROKE, stroke)} />
    </>
  );
};

export const Rocks: React.FC<{ y: number; fill: string; seed: number; count?: number }> = ({
  y,
  fill,
  seed,
  count = 6,
}) => {
  const r = rng(seed);
  const items = [];
  for (let i = 0; i < count; i++) {
    const x = 90 + r() * (W - 220);
    const w = 60 + r() * 120;
    const h = 26 + r() * 46;
    const yy = y - r() * 30;
    const d = smooth([
      [x, yy],
      [x + w * 0.2, yy - h],
      [x + w * 0.55, yy - h * 0.75],
      [x + w * 0.8, yy - h * 1.05],
      [x + w, yy],
    ]);
    items.push(
      <g key={i}>
        <path d={`${d} Z`} fill={fill} />
        <path d={d} {...line(STROKE - 1)} />
      </g>
    );
  }
  return <>{items}</>;
};

export const Stars: React.FC<{ seed: number; count?: number; h?: number }> = ({
  seed,
  count = 90,
  h = 700,
}) => {
  const r = rng(seed);
  const dots = [];
  for (let i = 0; i < count; i++) {
    dots.push(
      <circle key={i} cx={r() * W} cy={r() * h} r={r() * 2.6 + 1} fill="#ffffff" opacity={0.5 + r() * 0.5} />
    );
  }
  return <>{dots}</>;
};

export const Sun: React.FC<{ x: number; y: number; r: number; seed?: number; rays?: number }> = ({
  x,
  y,
  r,
  seed = 7,
  rays = 14,
}) => {
  const rand = rng(seed);
  const spokes = [];
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2 + 0.2;
    const r0 = r * (1.18 + rand() * 0.06);
    const r1 = r0 + r * (0.16 + rand() * 0.16);
    spokes.push(
      <path
        key={i}
        d={`M ${x + Math.cos(a) * r0} ${y + Math.sin(a) * r0} Q ${
          x + Math.cos(a + 0.05) * ((r0 + r1) / 2)
        } ${y + Math.sin(a + 0.05) * ((r0 + r1) / 2)} ${x + Math.cos(a) * r1} ${y + Math.sin(a) * r1}`}
        {...line(STROKE + 1, "#eba31c")}
      />
    );
  }
  return (
    <g>
      {spokes}
      <path d={blob(x, y, r, seed + 1, 0.012)} fill="#f9b719" />
      <path d={blob(x, y, r, seed + 1, 0.012)} {...line(STROKE - 1, "#1a1a2e")} />
    </g>
  );
};

/** Flat hand-drawn planet with a few craters — used where a photo is too heavy. */
export const DoodlePlanet: React.FC<{
  x: number;
  y: number;
  r: number;
  fill: string;
  seed?: number;
  craters?: number;
  crater?: string;
}> = ({ x, y, r, fill, seed = 3, craters = 5, crater = "rgba(0,0,0,0.14)" }) => {
  const rand = rng(seed + 99);
  const marks = [];
  for (let i = 0; i < craters; i++) {
    const a = rand() * Math.PI * 2;
    const d = rand() * r * 0.62;
    marks.push(
      <circle
        key={i}
        cx={x + Math.cos(a) * d}
        cy={y + Math.sin(a) * d}
        r={r * (0.08 + rand() * 0.13)}
        fill={crater}
      />
    );
  }
  return (
    <g>
      <path d={blob(x, y, r, seed)} fill={fill} />
      <g clipPath={`url(#clip-${seed})`}>{marks}</g>
      <clipPath id={`clip-${seed}`}>
        <path d={blob(x, y, r, seed)} />
      </clipPath>
      <path d={blob(x, y, r, seed)} {...line(STROKE - 1)} />
    </g>
  );
};

/** A real NASA photo, cut to a disc and inked like the rest of the art. */
export const PlanetPhoto: React.FC<{
  src: string;
  x: number;
  y: number;
  r: number;
  opacity?: number;
}> = ({ src, x, y, r, opacity = 1 }) => (
  <g opacity={opacity}>
    <image href={staticFile(`assets/planets/${src}.png`)} x={x - r} y={y - r} width={r * 2} height={r * 2} />
    <circle cx={x} cy={y} r={r} {...line(STROKE - 1)} />
  </g>
);

/** Handwritten label. `outline` gives the red-on-white callout look. */
export const Note: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  size?: number;
  color?: string;
  anchor?: "start" | "middle" | "end";
  rotate?: number;
  outline?: boolean;
  opacity?: number;
}> = ({ x, y, children, size = 34, color = grey, anchor = "middle", rotate = 0, outline, opacity = 1 }) => (
  <text
    x={x}
    y={y}
    fontFamily={FONT}
    fontSize={size}
    fill={color}
    textAnchor={anchor}
    opacity={opacity}
    transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
    stroke={outline ? "#ffffff" : undefined}
    strokeWidth={outline ? size * 0.16 : undefined}
    paintOrder="stroke"
    style={{ strokeLinejoin: "round" }}
  >
    {children}
  </text>
);

/** Hand-drawn arrow; `bend` curves it, positive bends clockwise. */
export const Arrow: React.FC<{
  from: [number, number];
  to: [number, number];
  color?: string;
  bend?: number;
  width?: number;
  head?: number;
}> = ({ from, to, color = red, bend = 0.18, width = STROKE, head = 20 }) => {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const cx = mx - dy * bend;
  const cy = my + dx * bend;
  // tangent at the end, for the arrowhead
  const a = Math.atan2(y2 - cy, x2 - cx);
  const w = 0.42;
  return (
    <g>
      <path d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`} {...line(width, color)} />
      <path
        d={`M ${x2 - Math.cos(a - w) * head} ${y2 - Math.sin(a - w) * head} L ${x2} ${y2} L ${
          x2 - Math.cos(a + w) * head
        } ${y2 - Math.sin(a + w) * head}`}
        {...line(width, color)}
      />
    </g>
  );
};

/** Big temperature readout — orange when hot, blue when cold. */
export const Temp: React.FC<{
  x: number;
  y: number;
  c: string;
  f: string;
  hot?: boolean;
  size?: number;
  anchor?: "start" | "middle" | "end";
}> = ({ x, y, c, f, hot, size = 62, anchor = "middle" }) => (
  <>
    <Note x={x} y={y} size={size} color={hot ? "#e8631b" : "#3aa0e6"} anchor={anchor} outline>
      {c}
    </Note>
    <Note x={x} y={y + size * 0.85} size={size * 0.72} color={hot ? "#e8631b" : "#3aa0e6"} anchor={anchor} outline>
      {f}
    </Note>
  </>
);

export const Thermometer: React.FC<{ x: number; y: number; fill: number; hot?: boolean; h?: number }> = ({
  x,
  y,
  fill,
  hot = true,
  h = 210,
}) => {
  const w = 34;
  const color = hot ? "#e0341f" : "#3aa0e6";
  return (
    <g>
      <rect x={x - w / 2} y={y - h} width={w} height={h} rx={w / 2} {...line(STROKE - 1)} fill="#fff" />
      <circle cx={x} cy={y + 16} r={w * 0.82} {...line(STROKE - 1)} fill={color} />
      <rect
        x={x - w / 2 + 7}
        y={y - h * fill}
        width={w - 14}
        height={h * fill}
        rx={(w - 14) / 2}
        fill={color}
      />
      {[0.25, 0.5, 0.75].map((t) => (
        <path key={t} d={`M ${x + w / 2} ${y - h * t} l 14 0`} {...line(3)} />
      ))}
    </g>
  );
};

/** The recurring "how long would you last" verdict stamp. */
export const Stamp: React.FC<{ x: number; y: number; label: string; value: string; delay?: number }> = ({
  x,
  y,
  label,
  value,
  delay = 0,
}) => {
  const { scale, opacity } = usePop(delay, 10);
  // wide enough for whichever of the two lines is longer
  const w = Math.max(560, value.length * 34 + 140, label.length * 23 + 110);
  const h = 190;
  return (
    <g transform={`translate(${x} ${y}) rotate(-3) scale(${0.85 + scale * 0.15})`} opacity={opacity}>
      <path d={smooth([
        [-w / 2, -h / 2],
        [0, -h / 2 - 4],
        [w / 2, -h / 2],
        [w / 2 + 4, 0],
        [w / 2, h / 2],
        [0, h / 2 + 4],
        [-w / 2, h / 2],
        [-w / 2 - 4, 0],
        [-w / 2, -h / 2],
      ])} {...line(6, red)} fill="#fff" />
      <Note x={0} y={-18} size={34} color={red}>
        {label}
      </Note>
      <Note x={0} y={52} size={64} color={red}>
        {value}
      </Note>
    </g>
  );
};

export const SpeechBubble: React.FC<{
  x: number;
  y: number;
  text: string;
  tail?: [number, number];
  size?: number;
}> = ({ x, y, text, tail = [0, 60], size = 34 }) => {
  const w = text.length * size * 0.56 + 44;
  const h = size * 1.9;
  return (
    <g>
      <path
        d={`M ${x - w / 2} ${y} a ${w / 2} ${h / 2} 0 1 1 ${w} 0 a ${w / 2} ${h / 2} 0 1 1 ${-w} 0 Z`}
        {...line(STROKE - 1)}
        fill="#fff"
      />
      <path d={`M ${x + tail[0] - 14} ${y + h / 2 - 6} L ${x + tail[0]} ${y + tail[1]} L ${x + tail[0] + 16} ${y + h / 2 - 10}`} {...line(STROKE - 1)} fill="#fff" />
      <Note x={x} y={y + size * 0.36} size={size} color={ink}>
        {text}
      </Note>
    </g>
  );
};

/** The channel's chapter label: centred caps at the very top of frame. */
export const Title: React.FC<{ text: string; boxed?: boolean }> = ({ text, boxed }) => (
  <g>
    {boxed ? (
      <rect x={W / 2 - text.length * 30 - 30} y={16} width={text.length * 60 + 60} height={108} fill="#fff" rx={4} />
    ) : null}
    <Note x={W / 2} y={104} size={96} color={ink}>
      {text}
    </Note>
  </g>
);

/** Scene wrapper. The reference cuts hard between shots, so this does not
 * fade - it only exists to give every scene one root <g>. */
export const SceneFade: React.FC<{ children: React.ReactNode; frames?: number }> = ({ children }) => (
  <g>{children}</g>
);
