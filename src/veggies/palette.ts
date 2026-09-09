/**
 * Colour + type palette for the "Chomp Chomp VEGGIES" kids video.
 *
 * Everything is sampled from the reference edit: a soft, chalky,
 * hand-drawn picture-book look — pale paper-blue sky, crayon-scribbled
 * bushes, and kawaii produce with simple two-dot faces.
 */

export const sky = {
  top: "#cfe2ea",
  bottom: "#dceaee",
  cloud: "#ffffff",
};

export const sun = {
  body: "#f7cf46",
  scribble: "#f0bd2a",
  ray: "#f4c62e",
  blush: "#f3b0a6",
  face: "#2f2a26",
};

export const ground = {
  grassTop: "#b9da6d",
  grassBottom: "#dfe694",
  blade: "#8fbf5a",
  soil: "#c08a5c",
  soilDark: "#a06f45",
};

export const bushes = {
  darkLine: "#2fa14e",
  darkFill: "#86c96f",
  darkHatch: "#5cb861",
  liteLine: "#8ac63f",
  liteFill: "#aed470",
  liteHatch: "#93c85a",
};

export const tree = {
  bark: "#c88a5a",
  barkLine: "#a5663c",
  leafFill: "#8cc47a",
  leafLine: "#33a05a",
  leafHatch: "#6fb166",
};

export const board = {
  border: "#ef559b",
  borderShade: "#d63f85",
  fill: "#bbd08f",
  fillShade: "#aac37e",
  silhouette: "#101010",
};

export const flower = {
  petal: "#f2559b",
  petalDark: "#d94180",
  stem: "#63bd57",
};

export const ink = "#3a332c";

/** Every silhouette in the video is this one flat near-black. */
export const SIL = "#111111";

export const fonts = {
  /** Chunky rounded bubble face — labels, the "What is that?" card. */
  display: "'Fredoka', 'Trebuchet MS', system-ui, sans-serif",
  /** Softer marker-ish face — the "Chomp Chomp" line on the title card. */
  script: "'Baloo2', 'Fredoka', 'Trebuchet MS', system-ui, sans-serif",
};

/** Soft outer glow the white on-screen type carries in the reference. */
export const textShadow =
  "0 3px 0 rgba(120,130,140,0.22), 0 6px 14px rgba(90,110,120,0.28)";
