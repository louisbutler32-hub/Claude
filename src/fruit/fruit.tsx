import React from "react";
import { Body, Face, Shine } from "../guess/art";
import type { GuessArt } from "../guess/types";

/**
 * The twelve fruits.
 *
 * Every one is drawn once, in a -100..100 box, and renders in colour or as
 * its own flat-black shadow (`Body`) — the silhouette is guaranteed to be
 * the exact outline of the thing it hides, which is the whole trick of the
 * format. Same soft picture-book look as the vegetables: chalky radial
 * fills, a specular blob, a two-dot face with blush.
 */

export type FruitId =
  | "apple"
  | "banana"
  | "orange"
  | "strawberry"
  | "grapes"
  | "watermelon"
  | "pineapple"
  | "pear"
  | "cherry"
  | "lemon"
  | "peach"
  | "kiwi";

const defs = (
  <defs>
    <radialGradient id="gApple" cx="0.36" cy="0.28" r="0.85">
      <stop offset="0%" stopColor="#f47a6d" />
      <stop offset="60%" stopColor="#e8483f" />
      <stop offset="100%" stopColor="#c8332c" />
    </radialGradient>
    <linearGradient id="gBanana" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#fbe57a" />
      <stop offset="55%" stopColor="#f5cf4a" />
      <stop offset="100%" stopColor="#e0b12b" />
    </linearGradient>
    <radialGradient id="gOrange" cx="0.36" cy="0.28" r="0.85">
      <stop offset="0%" stopColor="#ffb155" />
      <stop offset="60%" stopColor="#f6902f" />
      <stop offset="100%" stopColor="#dd7420" />
    </radialGradient>
    <radialGradient id="gStraw" cx="0.36" cy="0.26" r="0.9">
      <stop offset="0%" stopColor="#f66d69" />
      <stop offset="60%" stopColor="#e8403e" />
      <stop offset="100%" stopColor="#c72d2f" />
    </radialGradient>
    <radialGradient id="gGrape" cx="0.34" cy="0.3" r="0.9">
      <stop offset="0%" stopColor="#a97bd0" />
      <stop offset="60%" stopColor="#8b58b3" />
      <stop offset="100%" stopColor="#6d3f92" />
    </radialGradient>
    <radialGradient id="gMelon" cx="0.4" cy="0.2" r="0.9">
      <stop offset="0%" stopColor="#ff8a8a" />
      <stop offset="60%" stopColor="#f25b5b" />
      <stop offset="100%" stopColor="#d84343" />
    </radialGradient>
    <radialGradient id="gPine" cx="0.36" cy="0.26" r="0.9">
      <stop offset="0%" stopColor="#f9d86a" />
      <stop offset="60%" stopColor="#f2bf3c" />
      <stop offset="100%" stopColor="#d99e22" />
    </radialGradient>
    <radialGradient id="gPear" cx="0.36" cy="0.3" r="0.9">
      <stop offset="0%" stopColor="#cfe58a" />
      <stop offset="60%" stopColor="#a9cc55" />
      <stop offset="100%" stopColor="#86ab3c" />
    </radialGradient>
    <radialGradient id="gCherry" cx="0.36" cy="0.28" r="0.85">
      <stop offset="0%" stopColor="#f2665f" />
      <stop offset="60%" stopColor="#d63a3a" />
      <stop offset="100%" stopColor="#b02a2c" />
    </radialGradient>
    <radialGradient id="gLemon" cx="0.36" cy="0.28" r="0.9">
      <stop offset="0%" stopColor="#fff08a" />
      <stop offset="60%" stopColor="#f6df3c" />
      <stop offset="100%" stopColor="#e0c11f" />
    </radialGradient>
    <radialGradient id="gPeach" cx="0.34" cy="0.26" r="0.9">
      <stop offset="0%" stopColor="#ffc59a" />
      <stop offset="55%" stopColor="#f9a06a" />
      <stop offset="100%" stopColor="#e4805a" />
    </radialGradient>
    <radialGradient id="gKiwiSkin" cx="0.36" cy="0.3" r="0.9">
      <stop offset="0%" stopColor="#a7825a" />
      <stop offset="60%" stopColor="#8a6a45" />
      <stop offset="100%" stopColor="#6e5334" />
    </radialGradient>
    <radialGradient id="gKiwiFlesh" cx="0.5" cy="0.5" r="0.6">
      <stop offset="0%" stopColor="#b8df6a" />
      <stop offset="100%" stopColor="#7fbf3f" />
    </radialGradient>
  </defs>
);

/** Mount once per SVG that draws fruit. */
export const FruitDefs: React.FC = () => defs;

const LEAF = "#5aa84f";
const LEAF_DK = "#43893c";
const LEAF_LT = "#7cc25c";
const STEM = "#7a5a3a";
const STEM_DK = "#6a4a2e";

/* ------------------------------------------------------------------ */
/* 1. apple                                                            */
/* ------------------------------------------------------------------ */
export const Apple: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path d="M 2 -66 q -2 -22 12 -34 q 6 14 -2 34 Z" fill={STEM} stroke={STEM_DK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 12 -78 q 36 -34 66 -8 q -30 26 -66 8 Z" fill={LEAF} />
      <path d="M 14 -76 q 30 -14 58 -10" stroke={LEAF_DK} strokeWidth={3} fill="none" strokeLinecap="round" />
      <path
        d="M 0 -58 C -20 -84 -72 -78 -78 -30 C -84 20 -56 78 -22 84 C -8 87 8 87 22 84 C 56 78 84 20 78 -30 C 72 -78 20 -84 0 -58 Z"
        fill="url(#gApple)"
      />
      {!sil ? (
        <>
          <Shine cx={-40} cy={-26} rx={12} ry={26} rot={14} o={0.42} />
          <Face cy={4} gap={24} blushGap={46} blushY={14} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 2. banana                                                           */
/* ------------------------------------------------------------------ */
export const Banana: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g transform="rotate(-8)">
      <path
        d="M -88 -34 Q -74 60 10 84 Q 70 98 98 50 Q 104 34 92 32 Q 64 72 16 50 Q -36 32 -66 -40 Q -80 -54 -88 -34 Z"
        fill="url(#gBanana)"
      />
      <path d="M -90 -36 q -10 -12 2 -18 q 12 -2 14 12 Z" fill={STEM} stroke={STEM_DK} strokeWidth={3.5} strokeLinejoin="round" />
      <path d="M 94 32 q 12 -2 10 12 q -8 8 -16 4 Z" fill={STEM_DK} />
      {!sil ? (
        <>
          <g stroke="#e0b12b" strokeWidth={3.5} strokeLinecap="round" fill="none" opacity={0.55}>
            <path d="M -74 -20 Q -56 46 8 68" />
            <path d="M -60 -30 Q -40 26 30 56" />
          </g>
          <Shine cx={-48} cy={-6} rx={7} ry={22} rot={-40} o={0.4} />
          <Face cy={56} gap={15} eye={0.72} mouth={0.72} blushGap={30} blushY={6} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 3. orange                                                           */
/* ------------------------------------------------------------------ */
export const Orange: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <circle cx={0} cy={6} r={82} fill="url(#gOrange)" />
      <path d="M -4 -70 q 8 -16 20 -14 q -2 12 -12 20 Z" fill={STEM} stroke={STEM_DK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M 10 -84 q 40 -30 68 -2 q -34 24 -68 2 Z" fill={LEAF} />
      <path d="M 12 -82 q 30 -14 60 -6" stroke={LEAF_DK} strokeWidth={3} fill="none" strokeLinecap="round" />
      {!sil ? (
        <>
          <g fill="#e07a24" opacity={0.35}>
            {[
              [-52, -20], [-58, 24], [-34, 56], [48, 40], [60, -6], [40, -46], [-14, 66], [20, 70],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={3.2} />
            ))}
          </g>
          <Shine cx={-36} cy={-30} rx={12} ry={24} rot={20} o={0.42} />
          <Face cy={6} gap={24} blushGap={46} blushY={14} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 4. strawberry                                                       */
/* ------------------------------------------------------------------ */
export const Strawberry: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path d="M 0 -76 q -4 -18 10 -26 q 4 14 -2 28 Z" fill={LEAF_DK} />
      <path
        d="M -70 -36 Q -92 30 0 96 Q 92 30 70 -36 Q 34 -58 0 -52 Q -34 -58 -70 -36 Z"
        fill="url(#gStraw)"
      />
      {/* calyx */}
      <g fill={LEAF} stroke={LEAF_DK} strokeWidth={3} strokeLinejoin="round">
        <path d="M 0 -50 q -40 -28 -78 -14 q 30 22 60 22 Z" />
        <path d="M 0 -50 q 40 -28 78 -14 q -30 22 -60 22 Z" />
        <path d="M -8 -50 q -24 -40 -40 -66 q 30 14 44 50 Z" />
        <path d="M 8 -50 q 24 -40 40 -66 q -30 14 -44 50 Z" />
        <path d="M 0 -50 q -6 -36 0 -60 q 8 26 2 60 Z" />
      </g>
      {!sil ? (
        <>
          <g fill="#ffe0a6" opacity={0.85}>
            {[
              [-44, -8], [-52, 22], [-32, 44], [-10, 64], [18, 60], [40, 40], [50, 12], [30, -14], [-8, 20], [10, -20],
            ].map(([x, y], i) => (
              <ellipse key={i} cx={x} cy={y} rx={3.4} ry={5} />
            ))}
          </g>
          <Shine cx={-40} cy={-12} rx={9} ry={22} rot={18} o={0.38} />
          <Face cy={14} gap={22} blushGap={42} blushY={14} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 5. grapes                                                           */
/* ------------------------------------------------------------------ */
export const Grapes: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path d="M 0 -72 q -2 -26 8 -40" stroke={STEM} strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d="M 4 -92 q 44 -30 70 0 q -36 22 -70 0 Z" fill={LEAF} />
      <path d="M 6 -90 q 30 -12 60 -4" stroke={LEAF_DK} strokeWidth={3} fill="none" strokeLinecap="round" />
      <g fill="url(#gGrape)">
        <circle cx={-26} cy={-58} r={24} />
        <circle cx={26} cy={-58} r={24} />
        <circle cx={-52} cy={-20} r={24} />
        <circle cx={52} cy={-20} r={24} />
        <circle cx={-30} cy={16} r={24} />
        <circle cx={30} cy={16} r={24} />
        <circle cx={0} cy={54} r={24} />
        <circle cx={0} cy={-24} r={30} />
      </g>
      {!sil ? (
        <>
          <g fill="#ffffff" opacity={0.42}>
            <ellipse cx={-34} cy={-66} rx={5} ry={8} transform="rotate(-24 -34 -66)" />
            <ellipse cx={-60} cy={-28} rx={5} ry={8} transform="rotate(-24 -60 -28)" />
            <ellipse cx={-38} cy={8} rx={5} ry={8} transform="rotate(-24 -38 8)" />
            <ellipse cx={-8} cy={46} rx={5} ry={8} transform="rotate(-24 -8 46)" />
            <ellipse cx={-10} cy={-36} rx={6} ry={10} transform="rotate(-24 -10 -36)" />
          </g>
          <Face cy={-26} gap={13} eye={0.72} mouth={0.7} blushGap={28} blushY={8} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 6. watermelon                                                       */
/* ------------------------------------------------------------------ */
export const Watermelon: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g transform="translate(0 -6)">
      <path d="M -96 -44 L 96 -44 A 100 100 0 0 1 -96 -44 Z" fill="#4a9450" />
      <path d="M -86 -44 L 86 -44 A 90 90 0 0 1 -86 -44 Z" fill="#7cc25c" />
      <path d="M -76 -44 L 76 -44 A 80 80 0 0 1 -76 -44 Z" fill="#f4f0dc" />
      <path d="M -68 -44 L 68 -44 A 72 72 0 0 1 -68 -44 Z" fill="url(#gMelon)" />
      {!sil ? (
        <>
          <g fill="#3a302a">
            <ellipse cx={-42} cy={-20} rx={4} ry={6.5} transform="rotate(20 -42 -20)" />
            <ellipse cx={44} cy={-16} rx={4} ry={6.5} transform="rotate(-20 44 -16)" />
            <ellipse cx={-22} cy={16} rx={4} ry={6.5} transform="rotate(10 -22 16)" />
            <ellipse cx={26} cy={18} rx={4} ry={6.5} transform="rotate(-10 26 18)" />
            <ellipse cx={0} cy={-30} rx={4} ry={6.5} />
          </g>
          <Shine cx={-30} cy={-20} rx={8} ry={16} rot={20} o={0.32} />
          <Face cy={-10} gap={20} eye={0.9} blushGap={40} blushY={12} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 7. pineapple                                                        */
/* ------------------------------------------------------------------ */
export const Pineapple: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <g fill={LEAF} stroke={LEAF_DK} strokeWidth={3} strokeLinejoin="round">
        <path d="M -8 -40 q -50 -10 -70 -60 q 44 4 70 42 Z" />
        <path d="M 8 -40 q 50 -10 70 -60 q -44 4 -70 42 Z" />
        <path d="M -6 -46 q -30 -40 -30 -90 q 30 34 36 82 Z" />
        <path d="M 6 -46 q 30 -40 30 -90 q -30 34 -36 82 Z" />
        <path d="M 0 -50 q -10 -50 0 -100 q 10 50 0 100 Z" fill={LEAF_LT} />
      </g>
      <ellipse cx={0} cy={26} rx={60} ry={74} fill="url(#gPine)" />
      {!sil ? (
        <>
          <g stroke="#d39322" strokeWidth={3} fill="none" opacity={0.55}>
            {[-48, -24, 0, 24, 48].map((y) => (
              <path key={`a${y}`} d={`M -60 ${y + 26} L 60 ${y - 34}`} />
            ))}
            {[-48, -24, 0, 24, 48].map((y) => (
              <path key={`b${y}`} d={`M -60 ${y - 34} L 60 ${y + 26}`} />
            ))}
          </g>
          <Shine cx={-32} cy={-14} rx={9} ry={26} rot={10} o={0.36} />
          <Face cy={22} gap={22} blushGap={40} blushY={14} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 8. pear                                                             */
/* ------------------------------------------------------------------ */
export const Pear: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path d="M 0 -82 q 2 -20 14 -28 q 4 14 -6 30 Z" fill={STEM} stroke={STEM_DK} strokeWidth={4.5} strokeLinejoin="round" />
      <path d="M 8 -96 q 40 -26 62 4 q -34 18 -62 -4 Z" fill={LEAF} />
      <path
        d="M 0 -84 C 30 -84 40 -40 46 -14 C 72 20 84 60 46 86 C 22 96 -22 96 -46 86 C -84 60 -72 20 -46 -14 C -40 -40 -30 -84 0 -84 Z"
        fill="url(#gPear)"
      />
      {!sil ? (
        <>
          <g fill="#7f9a3a" opacity={0.3}>
            {[[-30, 30], [36, 44], [-14, 68], [22, -20], [-40, 60]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={2.6} />
            ))}
          </g>
          <Shine cx={-32} cy={16} rx={10} ry={26} rot={14} o={0.4} />
          <Face cy={40} gap={22} blushGap={42} blushY={14} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 9. cherries                                                         */
/* ------------------------------------------------------------------ */
export const Cherry: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <g stroke={LEAF_DK} strokeWidth={7} fill="none" strokeLinecap="round">
        <path d="M -40 8 Q -30 -60 12 -84" />
        <path d="M 42 14 Q 40 -50 12 -84" />
      </g>
      <path d="M 10 -86 q 44 -34 72 -4 q -38 22 -72 4 Z" fill={LEAF} />
      <path d="M 12 -84 q 30 -16 62 -8" stroke={LEAF_DK} strokeWidth={3} fill="none" strokeLinecap="round" />
      <circle cx={-44} cy={46} r={40} fill="url(#gCherry)" />
      <circle cx={44} cy={52} r={40} fill="url(#gCherry)" />
      {!sil ? (
        <>
          <Shine cx={-62} cy={30} rx={7} ry={14} rot={20} o={0.42} />
          <Shine cx={26} cy={36} rx={7} ry={14} rot={20} o={0.42} />
          <g transform="translate(-44 46)">
            <Face cy={2} gap={12} eye={0.66} mouth={0.62} blushGap={24} blushY={8} />
          </g>
          <g transform="translate(44 52)">
            <Face cy={2} gap={12} eye={0.66} mouth={0.62} blushGap={24} blushY={8} />
          </g>
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 10. lemon                                                           */
/* ------------------------------------------------------------------ */
export const Lemon: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g transform="rotate(-16)">
      <ellipse cx={-80} cy={0} rx={16} ry={11} fill="url(#gLemon)" />
      <ellipse cx={80} cy={0} rx={16} ry={11} fill="url(#gLemon)" />
      <ellipse cx={0} cy={0} rx={78} ry={56} fill="url(#gLemon)" />
      <path d="M -20 -54 q 30 -40 66 -14 q -38 20 -66 14 Z" fill={LEAF} transform="rotate(16)" />
      {!sil ? (
        <>
          <g fill="#d8b41c" opacity={0.3}>
            {[[-50, -14], [-40, 26], [44, 22], [56, -12], [0, 40], [16, -36]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={3} />
            ))}
          </g>
          <Shine cx={-30} cy={-24} rx={12} ry={18} rot={20} o={0.42} />
          <g transform="rotate(16)">
            <Face cy={0} gap={22} blushGap={44} blushY={12} />
          </g>
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 11. peach                                                           */
/* ------------------------------------------------------------------ */
export const Peach: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path d="M 2 -70 q -2 -20 12 -30 q 6 14 -2 32 Z" fill={STEM} stroke={STEM_DK} strokeWidth={4.5} strokeLinejoin="round" />
      <path d="M -10 -84 q -46 -26 -70 4 q 40 20 70 -4 Z" fill={LEAF} />
      <path
        d="M 0 -66 C -24 -86 -78 -72 -80 -20 C -82 30 -50 82 0 84 C 50 82 82 30 80 -20 C 78 -72 24 -86 0 -66 Z"
        fill="url(#gPeach)"
      />
      {!sil ? (
        <>
          <path d="M 0 -64 q 14 40 8 90" stroke="#e07a56" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.5} />
          <Shine cx={-38} cy={-26} rx={12} ry={24} rot={16} o={0.42} />
          <Face cy={8} gap={24} blushGap={46} blushY={14} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 12. kiwi                                                            */
/* ------------------------------------------------------------------ */
export const Kiwi: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {/* the whole kiwi behind */}
      <ellipse cx={40} cy={10} rx={52} ry={68} fill="url(#gKiwiSkin)" transform="rotate(22 40 10)" />
      {!sil ? (
        <g stroke="#5e4630" strokeWidth={2} strokeLinecap="round" opacity={0.5}>
          {[[-6, -40], [10, -20], [56, -30], [70, 10], [36, 40], [64, 52], [20, 60]].map(([x, y], i) => (
            <path key={i} d={`M ${x + 30} ${y} l 5 -6`} />
          ))}
        </g>
      ) : null}
      {/* the cut half in front */}
      <ellipse cx={-30} cy={12} rx={60} ry={72} fill="url(#gKiwiSkin)" />
      <ellipse cx={-30} cy={12} rx={52} ry={64} fill="url(#gKiwiFlesh)" />
      {!sil ? (
        <>
          <ellipse cx={-30} cy={12} rx={14} ry={22} fill="#eef6cc" />
          <g fill="#2a2520">
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return (
                <ellipse
                  key={i}
                  cx={-30 + Math.cos(a) * 26}
                  cy={12 + Math.sin(a) * 36}
                  rx={2.6}
                  ry={4.6}
                  transform={`rotate(${(a * 180) / Math.PI + 90} ${-30 + Math.cos(a) * 26} ${12 + Math.sin(a) * 36})`}
                />
              );
            })}
          </g>
          <Face cy={-2} gap={18} eye={0.8} mouth={0.8} blushGap={36} blushY={12} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */

export const FRUIT_ART: Record<FruitId, GuessArt> = {
  apple: Apple,
  banana: Banana,
  orange: Orange,
  strawberry: Strawberry,
  grapes: Grapes,
  watermelon: Watermelon,
  pineapple: Pineapple,
  pear: Pear,
  cherry: Cherry,
  lemon: Lemon,
  peach: Peach,
  kiwi: Kiwi,
};

export const FRUIT_NAME: Record<FruitId, string> = {
  apple: "Apple",
  banana: "Banana",
  orange: "Orange",
  strawberry: "Strawberry",
  grapes: "Grapes",
  watermelon: "Watermelon",
  pineapple: "Pineapple",
  pear: "Pear",
  cherry: "Cherries",
  lemon: "Lemon",
  peach: "Peach",
  kiwi: "Kiwi",
};
