// ── Map identity ───────────────────────────────────────────────────────
// The palette is the channel's signature. INK_AMBER is the house look:
// a near-monochrome slate atlas where saturation is a storytelling tool —
// only the territory currently being talked about carries colour, so the
// eye goes where the narration is without a single arrow being needed.

export type MapTheme = {
  name: string;

  // world
  sea: string;
  seaDeep: string;
  land: string;
  landHigh: string;
  border: string;
  coastGlow: string;

  // the one accent — the subject of the sentence
  accent: string;
  accentBright: string;
  accentFill: string;
  // the other side — present, but never competing for attention
  counter: string;
  counterFill: string;
  // held / neutral territory
  neutral: string;
  neutralFill: string;

  // arrows read as a single language across the whole video
  arrow: string;
  arrowEdge: string;

  /** How solid a territory fill sits over the land. */
  fillOpacity: number;

  /** Named nation colours. Give every power its own and keep it for the
   *  whole channel — the audience learns the colours faster than the names. */
  palette: Record<string, string>;

  // type
  label: string;
  labelDim: string;
  labelShadow: string;
  fontLabel: string;
  fontChip: string;
};

/** House look: a saturated political atlas. Muted blue sea and warm sand
 *  land so the nation colours carry all the saturation in frame. */
export const BRIGHT_ATLAS: MapTheme = {
  name: "Bright Atlas",

  sea: "#54798f",
  seaDeep: "#3b5f76",
  land: "#b5af98",
  landHigh: "#c6c0a8",
  border: "#6e6754",
  coastGlow: "#2c4454",

  accent: "#a8382e",
  accentBright: "#d9564a",
  accentFill: "rgba(168,56,46,0.75)",
  counter: "#3f6fa8",
  counterFill: "rgba(63,111,168,0.72)",
  neutral: "#7d7a6a",
  neutralFill: "rgba(125,122,106,0.45)",

  arrow: "#f2c14e",
  arrowEdge: "rgba(40,26,8,0.75)",
  fillOpacity: 0.78,

  palette: {
    oxblood: "#a8382e",
    ochre: "#d9a441",
    indigo: "#3f6fa8",
    moss: "#5b8f52",
    plum: "#7b5a9e",
    teal: "#2f8386",
    rust: "#c86a2c",
    slate: "#6b7a86",
  },

  label: "#fbf6e8",
  labelDim: "#e6dcc4",
  labelShadow: "rgba(28,22,12,0.9)",
  fontLabel: '"Playfair Display", Georgia, "Liberation Serif", "DejaVu Serif", serif',
  fontChip:
    '"Helvetica Neue", Helvetica, "Liberation Sans", Arial, sans-serif',
};

/** Alternate identity: near-monochrome slate, one amber accent. */
export const INK_AMBER: MapTheme = {
  name: "Ink & Amber",

  sea: "#0b1016",
  seaDeep: "#070a0e",
  land: "#242a32",
  landHigh: "#2f3640",
  border: "#3d4652",
  coastGlow: "#05080b",

  accent: "#e8a33d",
  accentBright: "#ffc673",
  accentFill: "rgba(232,163,61,0.26)",
  counter: "#8b98a6",
  counterFill: "rgba(139,152,166,0.20)",
  neutral: "#5c6672",
  neutralFill: "rgba(92,102,114,0.14)",

  arrow: "#e8a33d",
  arrowEdge: "rgba(0,0,0,0.55)",
  fillOpacity: 0.3,
  palette: {
    amber: "#e8a33d",
    steel: "#8b98a6",
    slate: "#5c6672",
  },

  label: "#e7ecf2",
  labelDim: "#94a0ad",
  labelShadow: "rgba(0,0,0,0.85)",
  fontLabel: '"Playfair Display", Georgia, "Liberation Serif", "DejaVu Serif", serif',
  fontChip:
    '"Helvetica Neue", Helvetica, "Liberation Sans", Arial, sans-serif',
};

/** Alternate identity: same engine, war-room palette. */
export const DEEP_SLATE: MapTheme = {
  ...BRIGHT_ATLAS,
  name: "Deep Slate",
  sea: "#0d1622",
  seaDeep: "#091019",
  land: "#1d2530",
  landHigh: "#28323f",
  border: "#3a4657",
  accent: "#d7443c",
  accentBright: "#ff6a60",
  accentFill: "rgba(215,68,60,0.28)",
  counter: "#3f8fa8",
  counterFill: "rgba(63,143,168,0.24)",
  fontLabel:
    '"Helvetica Neue", Helvetica, "Liberation Sans", Arial, sans-serif',
};
