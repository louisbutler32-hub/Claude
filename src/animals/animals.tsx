import React from "react";
import { Body, Face, Shine } from "../guess/art";
import { Cat, Dog, Frog, Penguin } from "../guess/critters";
import type { GuessArt } from "../guess/types";

/**
 * The twelve animals.
 *
 * Four of them — cat, dog, frog, penguin — are the same characters that
 * cheer at the board in every episode, so the cast stays consistent across
 * the series; they are just wrapped here so they can play at hero scale
 * and cast their own shadow. The other eight are drawn for this episode.
 */

export const AnimalDefs: React.FC = () => (
  <defs>
    <radialGradient id="gCow" cx="0.36" cy="0.26" r="0.85">
      <stop offset="0%" stopColor="#ffffff" />
      <stop offset="70%" stopColor="#f4efe6" />
      <stop offset="100%" stopColor="#ded5c6" />
    </radialGradient>
    <radialGradient id="gPig" cx="0.36" cy="0.26" r="0.85">
      <stop offset="0%" stopColor="#f8bcc6" />
      <stop offset="60%" stopColor="#f0a2b0" />
      <stop offset="100%" stopColor="#dd8595" />
    </radialGradient>
    <radialGradient id="gSheep" cx="0.36" cy="0.26" r="0.85">
      <stop offset="0%" stopColor="#fdfbf6" />
      <stop offset="65%" stopColor="#f2ece0" />
      <stop offset="100%" stopColor="#ddd4c4" />
    </radialGradient>
    <radialGradient id="gDuck" cx="0.36" cy="0.24" r="0.9">
      <stop offset="0%" stopColor="#fbe485" />
      <stop offset="60%" stopColor="#f5d24f" />
      <stop offset="100%" stopColor="#e3ba33" />
    </radialGradient>
    <radialGradient id="gEle" cx="0.36" cy="0.26" r="0.85">
      <stop offset="0%" stopColor="#b9c4d2" />
      <stop offset="60%" stopColor="#9fadbe" />
      <stop offset="100%" stopColor="#8593a6" />
    </radialGradient>
    <radialGradient id="gLion" cx="0.36" cy="0.26" r="0.85">
      <stop offset="0%" stopColor="#f7cf7e" />
      <stop offset="60%" stopColor="#eeb955" />
      <stop offset="100%" stopColor="#d99e3c" />
    </radialGradient>
    <radialGradient id="gOwl" cx="0.36" cy="0.26" r="0.85">
      <stop offset="0%" stopColor="#c9a075" />
      <stop offset="60%" stopColor="#b0855c" />
      <stop offset="100%" stopColor="#956d47" />
    </radialGradient>
    <radialGradient id="gFish" cx="0.34" cy="0.26" r="0.9">
      <stop offset="0%" stopColor="#ffb98a" />
      <stop offset="60%" stopColor="#fa9a5f" />
      <stop offset="100%" stopColor="#e37f45" />
    </radialGradient>
  </defs>
);

const OUT_DK = "#5a4a3c";

/* ------------------------------------------------------------------ */
/* wrappers around the four cast members                               */
/* ------------------------------------------------------------------ */

const wrap = (Inner: React.FC, scale: number, dy = 0): GuessArt =>
  function Wrapped({ sil }) {
    return (
      <Body sil={sil}>
        <g transform={`translate(0 ${dy}) scale(${scale})`}>
          <Inner />
        </g>
      </Body>
    );
  };

export const CatArt = wrap(Cat, 1.25, -10);
export const FrogArt = wrap(Frog, 1.3, -12);
export const PenguinArt = wrap(Penguin, 1.25, -6);

/* ------------------------------------------------------------------ */
/* dog                                                                 */
/* ------------------------------------------------------------------ */
export const DogArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {/* body */}
      <ellipse cx={0} cy={86} rx={52} ry={42} fill="#e8cba2" stroke={OUT_DK} strokeWidth={4} />
      <path d="M 46 88 q 44 8 38 44 q -6 20 -22 12 q 12 -28 -22 -34 Z" fill="#d2a97c" stroke={OUT_DK} strokeWidth={4} strokeLinejoin="round" />
      {/* long ears, well clear of the head so the shadow keeps them */}
      <ellipse cx={-74} cy={4} rx={26} ry={56} fill="#c79a6b" stroke={OUT_DK} strokeWidth={4} transform="rotate(-12 -74 4)" />
      <ellipse cx={74} cy={4} rx={26} ry={56} fill="#c79a6b" stroke={OUT_DK} strokeWidth={4} transform="rotate(12 74 4)" />
      {/* head */}
      <ellipse cx={0} cy={-14} rx={64} ry={58} fill="#f0dcbc" stroke={OUT_DK} strokeWidth={4} />
      {/* snout */}
      <ellipse cx={0} cy={28} rx={38} ry={28} fill="#f8ecd8" stroke={OUT_DK} strokeWidth={4} />
      <ellipse cx={0} cy={12} rx={12} ry={9} fill="#4a3b30" />
      {!sil ? (
        <>
          <ellipse cx={-26} cy={-20} rx={8} ry={10} fill={OUT_DK} />
          <ellipse cx={26} cy={-20} rx={8} ry={10} fill={OUT_DK} />
          <path d="M -12 32 q 12 12 24 0" stroke="#4a3b30" strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M 0 40 q -10 22 10 22 q 14 0 8 -20" fill="#ef8f9c" stroke={OUT_DK} strokeWidth={3} />
          <ellipse cx={-44} cy={8} rx={12} ry={8} fill="#f0a9a0" opacity={0.6} />
          <ellipse cx={44} cy={8} rx={12} ry={8} fill="#f0a9a0" opacity={0.6} />
          <Shine cx={-34} cy={-40} rx={12} ry={15} o={0.42} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* cow                                                                 */
/* ------------------------------------------------------------------ */
export const CowArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {/* horns */}
      <path d="M -56 -66 q -24 -20 -40 -6 q 16 16 36 16 Z" fill="#e8dcc4" />
      <path d="M 56 -66 q 24 -20 40 -6 q -16 16 -36 16 Z" fill="#e8dcc4" />
      {/* ears */}
      <ellipse cx={-74} cy={-30} rx={26} ry={16} fill="#f4efe6" stroke={OUT_DK} strokeWidth={4} transform="rotate(-22 -74 -30)" />
      <ellipse cx={74} cy={-30} rx={26} ry={16} fill="#f4efe6" stroke={OUT_DK} strokeWidth={4} transform="rotate(22 74 -30)" />
      {/* head */}
      <ellipse cx={0} cy={-6} rx={72} ry={64} fill="url(#gCow)" stroke={OUT_DK} strokeWidth={4} />
      {/* patches */}
      <path d="M -66 -34 q 22 -30 42 -8 q -10 26 -42 8 Z" fill="#4a4038" />
      <path d="M 52 -50 q 22 6 20 30 q -22 6 -30 -14 Z" fill="#4a4038" />
      {/* muzzle */}
      <ellipse cx={0} cy={42} rx={48} ry={34} fill="#f6d3d6" stroke={OUT_DK} strokeWidth={4} />
      <ellipse cx={-17} cy={36} rx={7} ry={9} fill="#c98f95" />
      <ellipse cx={17} cy={36} rx={7} ry={9} fill="#c98f95" />
      {!sil ? (
        <>
          <ellipse cx={-28} cy={-10} rx={9} ry={11} fill={OUT_DK} />
          <ellipse cx={28} cy={-10} rx={9} ry={11} fill={OUT_DK} />
          <path d="M -14 56 q 14 10 28 0" stroke="#c98f95" strokeWidth={4} fill="none" strokeLinecap="round" />
          <Shine cx={-34} cy={-40} rx={12} ry={16} o={0.4} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* pig                                                                 */
/* ------------------------------------------------------------------ */
export const PigArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path d="M -60 -52 q -18 -40 6 -46 q 22 -4 30 40 Z" fill="#f0a2b0" stroke={OUT_DK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M 60 -52 q 18 -40 -6 -46 q -22 -4 -30 40 Z" fill="#f0a2b0" stroke={OUT_DK} strokeWidth={4} strokeLinejoin="round" />
      <ellipse cx={0} cy={0} rx={76} ry={64} fill="url(#gPig)" stroke={OUT_DK} strokeWidth={4} />
      <ellipse cx={0} cy={30} rx={34} ry={26} fill="#f6c0ca" stroke={OUT_DK} strokeWidth={4} />
      <ellipse cx={-12} cy={30} rx={6} ry={9} fill="#c9808f" />
      <ellipse cx={12} cy={30} rx={6} ry={9} fill="#c9808f" />
      {!sil ? (
        <>
          <ellipse cx={-30} cy={-16} rx={8} ry={10} fill={OUT_DK} />
          <ellipse cx={30} cy={-16} rx={8} ry={10} fill={OUT_DK} />
          <ellipse cx={-52} cy={6} rx={12} ry={8} fill="#e88a9c" opacity={0.6} />
          <ellipse cx={52} cy={6} rx={12} ry={8} fill="#e88a9c" opacity={0.6} />
          <Shine cx={-38} cy={-34} rx={12} ry={16} o={0.42} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* sheep                                                               */
/* ------------------------------------------------------------------ */
export const SheepArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {/* fleece */}
      <g fill="url(#gSheep)" stroke={OUT_DK} strokeWidth={4}>
        <circle cx={-52} cy={-24} r={34} />
        <circle cx={-14} cy={-52} r={36} />
        <circle cx={30} cy={-46} r={34} />
        <circle cx={62} cy={-12} r={30} />
        <circle cx={-42} cy={20} r={32} />
        <circle cx={6} cy={18} r={38} />
        <circle cx={50} cy={26} r={30} />
      </g>
      <g fill="url(#gSheep)">
        <circle cx={-52} cy={-24} r={30} />
        <circle cx={-14} cy={-52} r={32} />
        <circle cx={30} cy={-46} r={30} />
        <circle cx={62} cy={-12} r={26} />
        <circle cx={-42} cy={20} r={28} />
        <circle cx={6} cy={18} r={34} />
        <circle cx={50} cy={26} r={26} />
      </g>
      {/* ears + face */}
      <ellipse cx={-52} cy={44} rx={22} ry={13} fill="#4a4038" transform="rotate(-20 -52 44)" />
      <ellipse cx={52} cy={44} rx={22} ry={13} fill="#4a4038" transform="rotate(20 52 44)" />
      <ellipse cx={0} cy={50} rx={44} ry={38} fill="#5b4e42" />
      {!sil ? (
        <>
          <ellipse cx={-16} cy={44} rx={7} ry={9} fill="#fdfbf6" />
          <ellipse cx={16} cy={44} rx={7} ry={9} fill="#fdfbf6" />
          <ellipse cx={-16} cy={45} rx={4} ry={5} fill="#2f2620" />
          <ellipse cx={16} cy={45} rx={4} ry={5} fill="#2f2620" />
          <path d="M -10 66 q 10 8 20 0" stroke="#fdfbf6" strokeWidth={4} fill="none" strokeLinecap="round" />
          <Shine cx={-30} cy={-46} rx={12} ry={15} o={0.5} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* duck                                                                */
/* ------------------------------------------------------------------ */
export const DuckArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {/* tail */}
      <path d="M 84 6 q 40 -22 50 0 q -22 26 -52 20 Z" fill="#e8c247" stroke={OUT_DK} strokeWidth={4} strokeLinejoin="round" />
      {/* body */}
      <ellipse cx={14} cy={34} rx={86} ry={54} fill="url(#gDuck)" stroke={OUT_DK} strokeWidth={4} />
      {/* neck */}
      <path d="M -40 24 q -26 -44 -8 -70 q 30 -12 38 28 q 6 32 -30 42 Z" fill="url(#gDuck)" stroke={OUT_DK} strokeWidth={4} strokeLinejoin="round" />
      {/* head */}
      <circle cx={-50} cy={-46} r={44} fill="url(#gDuck)" stroke={OUT_DK} strokeWidth={4} />
      {/* bill */}
      <path d="M -88 -38 q -44 -6 -44 12 q 4 18 46 12 Z" fill="#f0913f" stroke={OUT_DK} strokeWidth={4} strokeLinejoin="round" />
      {/* wing sits on top, so it never breaks the outline */}
      <path d="M 4 28 q 44 -20 70 8 q -28 30 -70 10 Z" fill="#e8c247" stroke={OUT_DK} strokeWidth={3.5} />
      {!sil ? (
        <>
          <ellipse cx={-58} cy={-56} rx={8} ry={10} fill={OUT_DK} />
          <ellipse cx={-30} cy={-54} rx={8} ry={10} fill={OUT_DK} />
          <ellipse cx={-72} cy={-28} rx={12} ry={8} fill="#f0a9a0" opacity={0.55} />
          <Shine cx={-62} cy={-66} rx={11} ry={14} o={0.45} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* elephant                                                            */
/* ------------------------------------------------------------------ */
export const ElephantArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {/* ears */}
      <path d="M -62 -34 q -68 -26 -74 26 q -6 54 52 56 q 34 0 34 -34 Z" fill="#9fadbe" stroke={OUT_DK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M 62 -34 q 68 -26 74 26 q 6 54 -52 56 q -34 0 -34 -34 Z" fill="#9fadbe" stroke={OUT_DK} strokeWidth={4} strokeLinejoin="round" />
      {/* head */}
      <ellipse cx={0} cy={-14} rx={70} ry={62} fill="url(#gEle)" stroke={OUT_DK} strokeWidth={4} />
      {/* trunk */}
      <path d="M -22 26 q -6 62 20 84 q 30 24 44 -6 q -22 12 -32 -10 q -10 -24 -4 -66 Z" fill="url(#gEle)" stroke={OUT_DK} strokeWidth={4} strokeLinejoin="round" />
      {/* tusks */}
      <path d="M -34 46 q -12 26 -30 30 q 6 -26 14 -36 Z" fill="#f2ece0" stroke={OUT_DK} strokeWidth={3} />
      <path d="M 34 46 q 12 26 30 30 q -6 -26 -14 -36 Z" fill="#f2ece0" stroke={OUT_DK} strokeWidth={3} />
      {!sil ? (
        <>
          <ellipse cx={-30} cy={-22} rx={8} ry={10} fill={OUT_DK} />
          <ellipse cx={30} cy={-22} rx={8} ry={10} fill={OUT_DK} />
          <ellipse cx={-52} cy={2} rx={12} ry={8} fill="#f0a9a0" opacity={0.45} />
          <ellipse cx={52} cy={2} rx={12} ry={8} fill="#f0a9a0" opacity={0.45} />
          <g stroke="#8593a6" strokeWidth={3} opacity={0.6} fill="none">
            <path d="M -14 54 q 20 6 30 0 M -12 74 q 18 6 26 0 M -8 94 q 14 5 20 0" />
          </g>
          <Shine cx={-36} cy={-42} rx={12} ry={16} o={0.35} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* lion                                                                */
/* ------------------------------------------------------------------ */
export const LionArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {/* mane */}
      <g fill="#c8843a">
        {Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2;
          return (
            <ellipse
              key={i}
              cx={Math.cos(a) * 74}
              cy={Math.sin(a) * 70}
              rx={30}
              ry={26}
              transform={`rotate(${(a * 180) / Math.PI} ${Math.cos(a) * 74} ${
                Math.sin(a) * 70
              })`}
            />
          );
        })}
      </g>
      <circle cx={0} cy={0} r={82} fill="#d99e3c" />
      {/* ears */}
      <circle cx={-58} cy={-52} r={20} fill="url(#gLion)" stroke={OUT_DK} strokeWidth={4} />
      <circle cx={58} cy={-52} r={20} fill="url(#gLion)" stroke={OUT_DK} strokeWidth={4} />
      {/* face */}
      <circle cx={0} cy={0} r={62} fill="url(#gLion)" stroke={OUT_DK} strokeWidth={4} />
      <ellipse cx={0} cy={24} rx={36} ry={26} fill="#fbe2ae" />
      <path d="M -12 14 l 24 0 l -12 14 Z" fill="#8a5a34" />
      {!sil ? (
        <>
          <ellipse cx={-24} cy={-10} rx={8} ry={10} fill={OUT_DK} />
          <ellipse cx={24} cy={-10} rx={8} ry={10} fill={OUT_DK} />
          <path d="M -14 32 q 14 12 28 0" stroke="#8a5a34" strokeWidth={4} fill="none" strokeLinecap="round" />
          <g stroke="#c8843a" strokeWidth={3} strokeLinecap="round">
            <path d="M -34 22 l -26 -6 M -34 30 l -26 6 M 34 22 l 26 -6 M 34 30 l 26 6" />
          </g>
          <Shine cx={-30} cy={-32} rx={11} ry={14} o={0.4} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* owl                                                                 */
/* ------------------------------------------------------------------ */
export const OwlArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {/* tufts */}
      <path d="M -56 -60 l -8 -40 l 34 24 Z" fill="#956d47" />
      <path d="M 56 -60 l 8 -40 l -34 24 Z" fill="#956d47" />
      {/* body */}
      <path d="M 0 -78 q 76 0 76 74 q 0 84 -76 84 q -76 0 -76 -84 q 0 -74 76 -74 Z" fill="url(#gOwl)" stroke={OUT_DK} strokeWidth={4} />
      {/* wings */}
      <path d="M -74 -14 q -20 56 6 92 q 22 -30 20 -92 Z" fill="#956d47" stroke={OUT_DK} strokeWidth={3.5} />
      <path d="M 74 -14 q 20 56 -6 92 q -22 -30 -20 -92 Z" fill="#956d47" stroke={OUT_DK} strokeWidth={3.5} />
      {/* belly */}
      <ellipse cx={0} cy={44} rx={44} ry={44} fill="#e6cfae" />
      {/* eye discs */}
      <circle cx={-30} cy={-24} r={34} fill="#f2ece0" stroke={OUT_DK} strokeWidth={3.5} />
      <circle cx={30} cy={-24} r={34} fill="#f2ece0" stroke={OUT_DK} strokeWidth={3.5} />
      <path d="M -14 -6 l 14 -18 l 14 18 q -14 10 -28 0 Z" fill="#f0913f" stroke={OUT_DK} strokeWidth={3} strokeLinejoin="round" />
      {/* feet */}
      <path d="M -26 78 l 0 16 M -34 94 l 16 0 M 26 78 l 0 16 M 18 94 l 16 0" stroke="#f0913f" strokeWidth={5} strokeLinecap="round" />
      {!sil ? (
        <>
          <circle cx={-30} cy={-24} r={14} fill="#2f2620" />
          <circle cx={30} cy={-24} r={14} fill="#2f2620" />
          <circle cx={-25} cy={-29} r={5} fill="#ffffff" />
          <circle cx={35} cy={-29} r={5} fill="#ffffff" />
          <Shine cx={-46} cy={-52} rx={10} ry={13} o={0.35} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* fish                                                                */
/* ------------------------------------------------------------------ */
export const FishArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {/* tail */}
      <path d="M 62 0 q 44 -46 62 -34 q -14 34 -2 68 q -20 10 -60 -30 Z" fill="#fa9a5f" stroke={OUT_DK} strokeWidth={4} strokeLinejoin="round" />
      {/* fins */}
      <path d="M -8 -50 q 8 -42 34 -46 q 6 28 -6 50 Z" fill="#f0913f" stroke={OUT_DK} strokeWidth={3.5} />
      <path d="M -6 50 q 6 36 28 42 q 6 -24 -6 -44 Z" fill="#f0913f" stroke={OUT_DK} strokeWidth={3.5} />
      {/* body */}
      <path d="M -96 2 q 20 -56 80 -56 q 62 0 82 56 q -20 56 -82 56 q -60 0 -80 -56 Z" fill="url(#gFish)" stroke={OUT_DK} strokeWidth={4} strokeLinejoin="round" />
      {!sil ? (
        <>
          <g fill="#e88b4c" opacity={0.55}>
            <path d="M 4 -34 q 22 34 0 68 q -14 -34 0 -68 Z" />
            <path d="M 34 -26 q 20 28 0 56 q -13 -28 0 -56 Z" />
          </g>
          <ellipse cx={-46} cy={-10} rx={9} ry={11} fill={OUT_DK} />
          <ellipse cx={-40} cy={-14} rx={3.5} ry={4} fill="#ffffff" />
          <path d="M -74 16 q 12 10 24 2" stroke={OUT_DK} strokeWidth={4} fill="none" strokeLinecap="round" />
          <ellipse cx={-66} cy={4} rx={11} ry={7} fill="#f0a9a0" opacity={0.5} />
          <Shine cx={-30} cy={-34} rx={14} ry={10} rot={10} o={0.4} />
        </>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* registry                                                            */
/* ------------------------------------------------------------------ */

export const ANIMAL_ART: Record<string, GuessArt> = {
  cow: CowArt,
  duck: DuckArt,
  pig: PigArt,
  sheep: SheepArt,
  cat: CatArt,
  dog: DogArt,
  elephant: ElephantArt,
  lion: LionArt,
  frog: FrogArt,
  owl: OwlArt,
  fish: FishArt,
  penguin: PenguinArt,
};

export const ANIMAL_NAME: Record<string, string> = {
  cow: "Cow",
  duck: "Duck",
  pig: "Pig",
  sheep: "Sheep",
  cat: "Cat",
  dog: "Dog",
  elephant: "Elephant",
  lion: "Lion",
  frog: "Frog",
  owl: "Owl",
  fish: "Fish",
  penguin: "Penguin",
};

/** What each one says — the payoff beat of every round. */
export const ANIMAL_SOUND: Record<string, string> = {
  cow: "Moo!",
  duck: "Quack!",
  pig: "Oink!",
  sheep: "Baa!",
  cat: "Meow!",
  dog: "Woof!",
  elephant: "Toot!",
  lion: "Roar!",
  frog: "Ribbit!",
  owl: "Hoo hoo!",
  fish: "Blub blub!",
  penguin: "Squawk!",
};
