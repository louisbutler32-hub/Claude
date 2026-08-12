import { makeTitle, TitleConfig } from "./PerspectiveTitle";
import { Point } from "./perspective";

// ── Presets ────────────────────────────────────────────────────────────
// Edit these, or spread one and override a few fields:
//   makeTitle(NAKAJIMA_KATE, { rotateY: -26, titleSize: 150 })

/** Shared look: clean white documentary type, subtle bed-in shadow. */
export const DOC_LOOK: Partial<TitleConfig> = {
  fontFamily:
    '"Helvetica Neue", Helvetica, "Liberation Sans", Arial, sans-serif',
  titleWeight: 700,
  eyebrowWeight: 600,
  color: "#ffffff",
  shadowStrength: 0.55,
  shadowOffset: 3,
  shadowBlur: 14,
  softness: 0.35,
};

/** The reference card: small category label above a large name, sitting on
 *  a plane that swings away to the right. 16:9. */
export const NAKAJIMA_KATE: TitleConfig = makeTitle(DOC_LOOK, {
  eyebrow: "JAPANESE CARRIER",
  title: "NAKAJIMA KATE",

  x: 215,
  y: 585,
  anchor: "left",

  titleSize: 138,
  titleTracking: 1,
  eyebrowSize: 44,
  eyebrowTracking: 8,
  eyebrowPlacement: "above",
  eyebrowGap: 12,

  perspective: 2300,
  rotateX: 4,
  rotateY: -15,
  rotateZ: -1,

  startDelay: 0.05,
  revealDuration: 0.35,
  charFade: 0.07,
  slideDistance: 34,
});

/** Same card framed for 9:16 shorts (1080x1920). */
export const NAKAJIMA_KATE_VERTICAL: TitleConfig = makeTitle(NAKAJIMA_KATE, {
  x: 78,
  y: 760,
  titleSize: 104,
  eyebrowSize: 34,
  eyebrowGap: 10,
  perspective: 1800,
  rotateX: 4,
  rotateY: -14,
});

// ── The two lines as independent cards ─────────────────────────────────
// Same effect, but each line is its own layer with its own position,
// angle and timing — use these when you want the label somewhere else in
// the frame, or want it to land on a different beat.

export const CARD_MAIN: TitleConfig = makeTitle(NAKAJIMA_KATE, {
  eyebrow: undefined,
  x: 215,
  y: 620,
});

export const CARD_LABEL: TitleConfig = makeTitle(DOC_LOOK, {
  title: "JAPANESE CARRIER",
  eyebrow: undefined,
  x: 222,
  y: 505,
  titleSize: 44,
  titleTracking: 8,
  titleWeight: 600,
  perspective: 2300,
  rotateX: 4,
  rotateY: -15,
  rotateZ: -1,
  revealDuration: 0.28,
  slideDistance: 24,
});

// ── Corner-pin example ─────────────────────────────────────────────────
// Trace four points off a surface in your plate (top-left, top-right,
// bottom-right, bottom-left) and the text is warped into exactly that
// quad. This is the one to use when the text has to lock to a real floor
// or wall rather than just look angled.

export const FLOOR_QUAD: [Point, Point, Point, Point] = [
  [250, 520],
  [1600, 610],
  [1560, 830],
  [230, 700],
];

export const NAKAJIMA_KATE_PINNED: TitleConfig = makeTitle(NAKAJIMA_KATE, {
  cornerPin: FLOOR_QUAD,
  planeWidth: 1350,
  planeHeight: 260,
  titleSize: 150,
  anchor: "left",
});
