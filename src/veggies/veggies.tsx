import React from "react";
import { SIL } from "./palette";

/**
 * The twelve vegetables.
 *
 * Every one is drawn once, in a -100..100 box, and renders in two modes:
 *  - full colour, with its kawaii face  (the reveal, the board, the props)
 *  - flat black                         (the "what is that?" silhouette)
 *
 * Drawing them once means the silhouette is guaranteed to be the exact
 * outline of the thing it hides — which is the whole trick of the format.
 */

export type VeggieProps = { sil?: boolean };
export type VeggieArt = React.FC<VeggieProps>;

const FACE = "#4a3b30";

/** Two dots and a smile — every character in the video wears this face. */
const Face: React.FC<{
  cy?: number;
  gap?: number;
  eye?: number;
  mouth?: number;
  blush?: boolean;
  blushY?: number;
  blushGap?: number;
  color?: string;
}> = ({
  cy = 0,
  gap = 26,
  eye = 1,
  mouth = 1,
  blush = true,
  blushY = 12,
  blushGap = 52,
  color = FACE,
}) => (
  <g>
    {blush ? (
      <>
        <ellipse
          cx={-blushGap}
          cy={cy + blushY}
          rx={13 * eye}
          ry={8 * eye}
          fill="#f0a9a0"
          opacity={0.55}
        />
        <ellipse
          cx={blushGap}
          cy={cy + blushY}
          rx={13 * eye}
          ry={8 * eye}
          fill="#f0a9a0"
          opacity={0.55}
        />
      </>
    ) : null}
    <ellipse cx={-gap} cy={cy} rx={7.5 * eye} ry={9.5 * eye} fill={color} />
    <ellipse cx={gap} cy={cy} rx={7.5 * eye} ry={9.5 * eye} fill={color} />
    <path
      d={`M ${-11 * mouth} ${cy + 20} q ${11 * mouth} ${13 * mouth} ${
        22 * mouth
      } 0`}
      stroke={color}
      strokeWidth={4.5}
      fill="none"
      strokeLinecap="round"
    />
  </g>
);

/** Soft specular blob every piece of produce carries in the reference art. */
const Shine: React.FC<{
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rot?: number;
  o?: number;
}> = ({ cx, cy, rx, ry, rot = -25, o = 0.5 }) => (
  <ellipse
    cx={cx}
    cy={cy}
    rx={rx}
    ry={ry}
    fill="#ffffff"
    opacity={o}
    transform={`rotate(${rot} ${cx} ${cy})`}
  />
);

/** Wrapper that flattens a veggie to pure black when `sil` is set. */
const Body: React.FC<{ sil?: boolean; children: React.ReactNode }> = ({
  sil,
  children,
}) => (
  <g style={sil ? { filter: "brightness(0) saturate(0)" } : undefined}>
    {children}
  </g>
);

const defs = (
  <defs>
    <radialGradient id="gCarrot" cx="0.38" cy="0.28" r="0.85">
      <stop offset="0%" stopColor="#f7a45c" />
      <stop offset="65%" stopColor="#ef8a3c" />
      <stop offset="100%" stopColor="#dd7429" />
    </radialGradient>
    <radialGradient id="gTomato" cx="0.35" cy="0.28" r="0.85">
      <stop offset="0%" stopColor="#f47a6d" />
      <stop offset="60%" stopColor="#ea5b52" />
      <stop offset="100%" stopColor="#d4453e" />
    </radialGradient>
    <radialGradient id="gPumpkin" cx="0.36" cy="0.26" r="0.85">
      <stop offset="0%" stopColor="#f6a659" />
      <stop offset="60%" stopColor="#ef8f3c" />
      <stop offset="100%" stopColor="#dd772a" />
    </radialGradient>
    <radialGradient id="gPepper" cx="0.35" cy="0.26" r="0.85">
      <stop offset="0%" stopColor="#f4796a" />
      <stop offset="60%" stopColor="#ea5a4d" />
      <stop offset="100%" stopColor="#d1443c" />
    </radialGradient>
    <radialGradient id="gEggplant" cx="0.36" cy="0.26" r="0.85">
      <stop offset="0%" stopColor="#a578c9" />
      <stop offset="58%" stopColor="#8b58b3" />
      <stop offset="100%" stopColor="#71429a" />
    </radialGradient>
    <radialGradient id="gPotato" cx="0.36" cy="0.28" r="0.85">
      <stop offset="0%" stopColor="#e0b782" />
      <stop offset="60%" stopColor="#cfa26b" />
      <stop offset="100%" stopColor="#b88a55" />
    </radialGradient>
    <radialGradient id="gOnion" cx="0.36" cy="0.28" r="0.85">
      <stop offset="0%" stopColor="#dda6d0" />
      <stop offset="60%" stopColor="#c78bbd" />
      <stop offset="100%" stopColor="#ab6ea3" />
    </radialGradient>
    <radialGradient id="gCorn" cx="0.36" cy="0.24" r="0.9">
      <stop offset="0%" stopColor="#f9dc6a" />
      <stop offset="60%" stopColor="#f3c93f" />
      <stop offset="100%" stopColor="#e2b12b" />
    </radialGradient>
    <radialGradient id="gCuke" cx="0.34" cy="0.24" r="0.9">
      <stop offset="0%" stopColor="#79bd5f" />
      <stop offset="60%" stopColor="#5da648" />
      <stop offset="100%" stopColor="#478c37" />
    </radialGradient>
    <radialGradient id="gBroc" cx="0.36" cy="0.26" r="0.85">
      <stop offset="0%" stopColor="#5eab5c" />
      <stop offset="60%" stopColor="#4a9450" />
      <stop offset="100%" stopColor="#3b7d43" />
    </radialGradient>
    <radialGradient id="gPod" cx="0.34" cy="0.28" r="0.9">
      <stop offset="0%" stopColor="#92cb6c" />
      <stop offset="60%" stopColor="#77b755" />
      <stop offset="100%" stopColor="#5e9c42" />
    </radialGradient>
    <radialGradient id="gCap" cx="0.34" cy="0.26" r="0.85">
      <stop offset="0%" stopColor="#d78a6a" />
      <stop offset="60%" stopColor="#c4735a" />
      <stop offset="100%" stopColor="#a95c46" />
    </radialGradient>
    <linearGradient id="gStem" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#f7ecd5" />
      <stop offset="100%" stopColor="#e6d4b4" />
    </linearGradient>
  </defs>
);

/** Mount once per SVG that draws vegetables. */
export const VeggieDefs: React.FC = () => defs;

const LEAF = "#5aa84f";
const LEAF_DK = "#43893c";
const LEAF_LT = "#7cc25c";

/* ------------------------------------------------------------------ */
/* 1. carrot                                                           */
/* ------------------------------------------------------------------ */
export const Carrot: VeggieArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {/* ferny tops */}
      <path d="M -4 -58 q -60 -10 -84 -62 q 52 -8 84 34 Z" fill={LEAF} />
      <path d="M 4 -58 q 60 -10 84 -62 q -52 -8 -84 34 Z" fill={LEAF_LT} />
      <path d="M -6 -62 q -34 -34 -30 -74 q 32 26 36 68 Z" fill={LEAF_DK} />
      <path d="M 6 -62 q 34 -34 30 -74 q -32 26 -36 68 Z" fill={LEAF} />
      <path d="M 0 -60 q -12 -46 0 -84 q 12 38 0 84 Z" fill={LEAF_DK} />
      {/* root */}
      <path
        d="M 0 -62 q 56 0 56 34 q 0 60 -22 106 q -20 42 -34 42 q -14 0 -34 -42 q -22 -46 -22 -106 q 0 -34 56 -34 Z"
        fill="url(#gCarrot)"
      />
      {!sil ? (
        <>
          <g stroke="#d76c22" strokeWidth={4.5} strokeLinecap="round" opacity={0.4}>
            <path d="M -40 -14 q 20 10 40 4" />
            <path d="M -32 26 q 17 9 34 3" />
            <path d="M -22 64 q 13 8 26 2" />
          </g>
          <Shine cx={-28} cy={-18} rx={10} ry={30} rot={6} o={0.42} />
          <Face cy={-12} gap={22} eye={0.95} blushGap={40} blushY={12} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 2. tomato                                                           */
/* ------------------------------------------------------------------ */
export const Tomato: VeggieArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path
        d="M 0 -78 q -4 -18 10 -26 q 6 12 -2 26 Z"
        fill="#7a5a3a"
        stroke="#6a4a2e"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <ellipse cx={0} cy={8} rx={86} ry={80} fill="url(#gTomato)" />
      {/* calyx star */}
      <g fill={LEAF}>
        <path d="M 0 -74 q -40 -10 -56 -34 q 38 -4 56 18 Z" />
        <path d="M 0 -74 q 40 -10 56 -34 q -38 -4 -56 18 Z" />
        <path d="M 0 -70 q -22 -22 -18 -46 q 22 16 18 46 Z" />
        <path d="M 0 -70 q 22 -22 18 -46 q -22 16 -18 46 Z" />
        <circle cx={0} cy={-70} r={13} />
      </g>
      {!sil ? (
        <>
          <Shine cx={-38} cy={-24} rx={13} ry={26} o={0.45} />
          <Face cy={6} gap={26} blushGap={54} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 3. broccoli                                                         */
/* ------------------------------------------------------------------ */
export const Broccoli: VeggieArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {/* stalk */}
      <path
        d="M -28 -6 q 28 -10 56 0 q 6 60 2 96 q -30 10 -60 0 q -4 -38 2 -96 Z"
        fill="#b7d48c"
      />
      {/* floret cloud */}
      <g fill="url(#gBroc)">
        <circle cx={-52} cy={-34} r={36} />
        <circle cx={-16} cy={-62} r={42} />
        <circle cx={30} cy={-58} r={38} />
        <circle cx={62} cy={-26} r={32} />
        <circle cx={-34} cy={-6} r={30} />
        <circle cx={8} cy={-14} r={38} />
        <circle cx={44} cy={4} r={27} />
      </g>
      {!sil ? (
        <>
          <g fill="#66b061" opacity={0.6}>
            <circle cx={-40} cy={-52} r={9} />
            <circle cx={4} cy={-74} r={8} />
            <circle cx={44} cy={-46} r={7} />
            <circle cx={-20} cy={-20} r={7} />
          </g>
          <g stroke="#9cc274" strokeWidth={4} strokeLinecap="round" opacity={0.6}>
            <path d="M -8 20 q 2 34 0 62" />
            <path d="M 14 22 q 3 32 1 58" />
          </g>
          <Face cy={-24} gap={24} blushGap={50} blushY={14} color="#31402f" />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 4. corn                                                             */
/* ------------------------------------------------------------------ */
export const Corn: VeggieArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {/* husk leaves, sweeping down and out from the shoulders */}
      <path
        d="M -40 -68 q -54 62 -42 158 q 38 -26 48 -86 q 8 -44 -6 -72 Z"
        fill={LEAF}
      />
      <path
        d="M 40 -68 q 54 62 42 158 q -38 -26 -48 -86 q -8 -44 6 -72 Z"
        fill={LEAF_LT}
      />
      {/* silk tuft */}
      <path
        d="M -8 -98 q -5 -11 -12 -15 M 1 -100 q -1 -12 -4 -17 M 10 -98 q 6 -11 13 -15"
        stroke="#e8c35a"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
      {/* cob */}
      <path
        d="M 0 -96 q 50 0 50 56 q 0 84 -50 114 q -50 -30 -50 -114 q 0 -56 50 -56 Z"
        fill="url(#gCorn)"
      />
      {/* front husk leaf */}
      <path
        d="M -20 40 q -22 40 -10 84 q 26 -18 28 -58 q 2 -22 -18 -26 Z"
        fill={LEAF_DK}
      />
      {!sil ? (
        <>
          <g stroke="#e0ac2c" strokeWidth={3.6} opacity={0.5} fill="none">
            {[-30, -10, 10, 30].map((x) => (
              <path key={x} d={`M ${x} -72 q 4 72 0 128`} />
            ))}
            {[-56, -24, 8, 40].map((y) => (
              <path key={y} d={`M -44 ${y} q 44 12 88 0`} />
            ))}
          </g>
          <Shine cx={-26} cy={-44} rx={9} ry={24} o={0.4} />
          <Face cy={-6} gap={23} blushGap={42} blushY={14} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 5. peas                                                             */
/* ------------------------------------------------------------------ */
export const Peas: VeggieArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path
        d="M 92 -46 q 20 -22 12 -44 M 104 -74 q 4 -22 -10 -34"
        stroke={LEAF_DK}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
      {/* the opened top half of the pod, tipped back */}
      <path
        d="M -104 -30 q 40 -58 104 -58 q 64 0 104 58 q -38 -22 -104 -22 q -66 0 -104 22 Z"
        fill="#6ea94c"
      />
      {/* peas */}
      <g fill="url(#gPod)">
        <circle cx={-56} cy={-4} r={38} />
        <circle cx={0} cy={-12} r={40} />
        <circle cx={56} cy={-4} r={38} />
      </g>
      {/* the boat the peas sit in */}
      <path
        d="M -108 -22 q 12 88 108 88 q 96 0 108 -88 q -30 46 -108 46 q -78 0 -108 -46 Z"
        fill="#5fa044"
      />
      <path
        d="M -108 -22 q 20 26 40 34 M 108 -22 q -20 26 -40 34"
        stroke="#4f8c38"
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
      {!sil ? (
        <>
          <Shine cx={-14} cy={-32} rx={9} ry={13} o={0.45} />
          <Shine cx={-70} cy={-22} rx={7} ry={11} o={0.4} />
          <Face cy={-12} gap={22} eye={0.86} blushGap={42} blushY={12} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 6. pumpkin                                                          */
/* ------------------------------------------------------------------ */
export const Pumpkin: VeggieArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path
        d="M -4 -70 q -6 -26 12 -38 q 26 -16 34 6 q -22 -6 -30 12 q -6 12 -2 22 Z"
        fill="#7d6034"
        stroke="#6a4f27"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <g fill="url(#gPumpkin)">
        <ellipse cx={-56} cy={6} rx={38} ry={72} />
        <ellipse cx={56} cy={6} rx={38} ry={72} />
        <ellipse cx={0} cy={4} rx={72} ry={78} />
      </g>
      {!sil ? (
        <>
          <g stroke="#d97724" strokeWidth={4.5} fill="none" opacity={0.45}>
            <path d="M -30 -62 q -12 66 0 130" />
            <path d="M 30 -62 q 12 66 0 130" />
          </g>
          <Shine cx={-44} cy={-30} rx={11} ry={24} o={0.4} />
          <Face cy={6} gap={27} blushGap={56} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 7. bell pepper                                                      */
/* ------------------------------------------------------------------ */
export const BellPepper: VeggieArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {/* blocky three-lobed body */}
      <path
        d="M 0 -72 C -52 -72 -88 -48 -88 0 C -88 50 -76 84 -52 94
           C -38 100 -30 93 -22 85 C -12 77 -8 77 0 85
           C 8 77 12 77 22 85 C 30 93 38 100 52 94
           C 76 84 88 50 88 0 C 88 -48 52 -72 0 -72 Z"
        fill="url(#gPepper)"
      />
      {/* green calyx sitting on the shoulders */}
      <g fill={LEAF}>
        <path d="M 0 -66 q -52 -18 -62 6 q 30 20 62 12 Z" />
        <path d="M 0 -66 q 52 -18 62 6 q -30 20 -62 12 Z" />
        <path d="M 0 -68 q -26 -6 -34 18 q 22 8 34 -12 Z" />
        <path d="M 0 -68 q 26 -6 34 18 q -22 8 -34 -12 Z" />
        <ellipse cx={0} cy={-64} rx={20} ry={13} />
      </g>
      {/* stem */}
      <path
        d="M -7 -66 q -6 -30 12 -44 q 12 20 0 44 Z"
        fill="#6a4f27"
        stroke="#5b421f"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {!sil ? (
        <>
          <g stroke="#d1453c" strokeWidth={5} fill="none" opacity={0.32}>
            <path d="M -36 -30 q -12 60 4 100" />
            <path d="M 36 -30 q 12 60 -4 100" />
          </g>
          <Shine cx={-46} cy={-12} rx={12} ry={28} o={0.42} />
          <Face cy={14} gap={26} blushGap={58} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 8. onion                                                            */
/* ------------------------------------------------------------------ */
export const Onion: VeggieArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {/* green shoots */}
      <path d="M -10 -66 q -26 -44 -22 -92 q 26 40 32 90 Z" fill={LEAF} />
      <path d="M 2 -70 q 2 -50 22 -84 q 4 48 -12 84 Z" fill={LEAF_DK} />
      <path d="M 14 -66 q 30 -34 62 -44 q -22 42 -52 56 Z" fill={LEAF_LT} />
      {/* bulb */}
      <path
        d="M 0 -74 q 84 26 84 90 q 0 66 -84 66 q -84 0 -84 -66 q 0 -64 84 -90 Z"
        fill="url(#gOnion)"
      />
      {/* root wisps */}
      <path
        d="M -12 80 q -3 12 -8 16 M 2 84 q 0 13 1 18 M 16 80 q 4 12 9 16"
        stroke="#b07ea7"
        strokeWidth={4.5}
        fill="none"
        strokeLinecap="round"
      />
      {!sil ? (
        <>
          <g stroke="#a86ba0" strokeWidth={4} fill="none" opacity={0.4}>
            <path d="M -36 -56 q -22 62 -6 124" />
            <path d="M 36 -56 q 22 62 6 124" />
            <path d="M 0 -66 q -4 74 0 148" />
          </g>
          <Shine cx={-42} cy={-12} rx={12} ry={28} o={0.42} />
          <Face cy={16} gap={26} blushGap={54} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 9. eggplant                                                         */
/* ------------------------------------------------------------------ */
export const Eggplant: VeggieArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path
        d="M 6 -104 q -6 -22 10 -34 q 10 16 0 36 Z"
        fill="#4c7c3a"
        stroke="#3d6a2d"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path
        d="M 10 -86 q 62 -6 74 46 q 22 90 -34 136 q -58 48 -100 -8 q -40 -54 -8 -122 q 26 -54 68 -52 Z"
        fill="url(#gEggplant)"
      />
      {/* calyx */}
      <g fill={LEAF}>
        <path d="M 6 -96 q -44 -6 -62 26 q 34 16 62 -4 Z" />
        <path d="M 6 -96 q 44 -6 62 26 q -34 16 -62 -4 Z" />
        <path d="M 6 -94 q -22 8 -30 42 q 26 -4 30 -42 Z" />
        <path d="M 6 -94 q 22 8 30 42 q -26 -4 -30 -42 Z" />
      </g>
      {!sil ? (
        <>
          <Shine cx={-34} cy={-30} rx={12} ry={30} rot={-18} o={0.4} />
          <Face cy={22} gap={26} blushGap={54} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 10. mushroom                                                        */
/* ------------------------------------------------------------------ */
export const Mushroom: VeggieArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path
        d="M -44 -6 q 44 -16 88 0 q 8 56 -2 96 q -42 16 -84 0 q -10 -40 -2 -96 Z"
        fill="url(#gStem)"
      />
      <path
        d="M -104 -4 q -8 -96 104 -96 q 112 0 104 96 q -104 26 -208 0 Z"
        fill="url(#gCap)"
      />
      {!sil ? (
        <>
          <g fill="#f6e7cf" opacity={0.9}>
            <ellipse cx={-58} cy={-44} rx={20} ry={15} />
            <ellipse cx={14} cy={-64} rx={16} ry={12} />
            <ellipse cx={66} cy={-36} rx={14} ry={10} />
            <ellipse cx={-14} cy={-22} rx={12} ry={8} />
          </g>
          <Shine cx={-56} cy={-62} rx={12} ry={20} o={0.35} />
          <Face cy={34} gap={22} eye={0.9} blushGap={44} blushY={12} color="#8a6a4e" />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 11. cucumber                                                        */
/* ------------------------------------------------------------------ */
export const Cucumber: VeggieArt = ({ sil }) => (
  <Body sil={sil}>
    <g transform="rotate(-14)">
      {/* long gently curved body */}
      <path
        d="M -14 -122 q 38 -8 48 28 q 12 44 2 108 q -10 60 -40 68 q -30 8 -38 -30 q -8 -46 0 -106 q 8 -60 28 -68 Z"
        fill="url(#gCuke)"
      />
      <path d="M -18 -120 q 14 -14 26 0 q -12 10 -26 0 Z" fill="#9ccf7a" />
      {!sil ? (
        <>
          <g stroke="#7cc25c" strokeWidth={4.5} fill="none" opacity={0.5}>
            <path d="M -10 -92 q -10 84 -8 148" />
            <path d="M 10 -86 q -6 84 -6 148" />
            <path d="M 28 -66 q 2 70 -8 126" />
          </g>
          <g fill="#84c765" opacity={0.55}>
            <circle cx={0} cy={-54} r={5} />
            <circle cx={22} cy={6} r={5} />
            <circle cx={-6} cy={64} r={5} />
            <circle cx={24} cy={-46} r={4} />
          </g>
          <Shine cx={-10} cy={-60} rx={8} ry={32} rot={3} o={0.35} />
          <g transform="rotate(14) translate(6 -4)">
            <Face cy={0} gap={22} eye={0.88} blushGap={38} blushY={12} />
          </g>
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 12. potato                                                          */
/* ------------------------------------------------------------------ */
export const Potato: VeggieArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path
        d="M -96 -14 q -10 -58 52 -66 q 62 -8 106 18 q 44 26 34 74 q -10 48 -70 56 q -60 8 -100 -22 q -22 -18 -22 -60 Z"
        fill="url(#gPotato)"
      />
      {!sil ? (
        <>
          <g fill="#a97c4a" opacity={0.5}>
            <ellipse cx={-58} cy={-30} rx={9} ry={6} transform="rotate(-20 -58 -30)" />
            <ellipse cx={62} cy={-24} rx={8} ry={5} transform="rotate(15 62 -24)" />
            <ellipse cx={40} cy={44} rx={9} ry={6} transform="rotate(-10 40 44)" />
            <ellipse cx={-46} cy={40} rx={7} ry={5} />
          </g>
          <Shine cx={-40} cy={-34} rx={13} ry={20} o={0.35} />
          <Face cy={6} gap={26} blushGap={56} blushY={14} color="#6a4d31" />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* registry                                                            */
/* ------------------------------------------------------------------ */

export type VeggieId =
  | "carrot"
  | "tomato"
  | "broccoli"
  | "corn"
  | "peas"
  | "pumpkin"
  | "pepper"
  | "onion"
  | "eggplant"
  | "mushroom"
  | "cucumber"
  | "potato";

export const VEGGIE_ART: Record<VeggieId, VeggieArt> = {
  carrot: Carrot,
  tomato: Tomato,
  broccoli: Broccoli,
  corn: Corn,
  peas: Peas,
  pumpkin: Pumpkin,
  pepper: BellPepper,
  onion: Onion,
  eggplant: Eggplant,
  mushroom: Mushroom,
  cucumber: Cucumber,
  potato: Potato,
};

export const VEGGIE_NAME: Record<VeggieId, string> = {
  carrot: "Carrot",
  tomato: "Tomato",
  broccoli: "Broccoli",
  corn: "Corn",
  peas: "Peas",
  pumpkin: "Pumpkin",
  pepper: "Bell Pepper",
  onion: "Onion",
  eggplant: "Eggplant",
  mushroom: "Mushroom",
  cucumber: "Cucumber",
  potato: "Potato",
};

/** Draw a veggie anywhere: `<Veggie id="carrot" x={960} y={600} size={1.4} />` */
export const Veggie: React.FC<{
  id: VeggieId;
  x?: number;
  y?: number;
  size?: number;
  rotate?: number;
  sil?: boolean;
  opacity?: number;
}> = ({ id, x = 0, y = 0, size = 1, rotate = 0, sil, opacity = 1 }) => {
  const Art = VEGGIE_ART[id];
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${rotate}) scale(${size})`}
      opacity={opacity}
    >
      <Art sil={sil} />
    </g>
  );
};

export const SILHOUETTE_COLOR = SIL;
