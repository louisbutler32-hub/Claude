import React from "react";
import { Body, Face, Shine } from "../guess/art";
import { FishArt } from "../animals/animals";
import type { GuessArt } from "../guess/types";

/**
 * The twelve sea creatures. Fish is borrowed from the animal episode's cast
 * (as a clownfish here); the rest are drawn for this episode.
 */

const OUT = "#2c5266";

export const SeaDefs: React.FC = () => (
  <defs>
    <radialGradient id="gOcto" cx="0.36" cy="0.28" r="0.9">
      <stop offset="0%" stopColor="#e88bc9" />
      <stop offset="60%" stopColor="#d461a8" />
      <stop offset="100%" stopColor="#b04486" />
    </radialGradient>
    <radialGradient id="gCrab" cx="0.36" cy="0.28" r="0.9">
      <stop offset="0%" stopColor="#f4826b" />
      <stop offset="60%" stopColor="#ea5b3f" />
      <stop offset="100%" stopColor="#c73f28" />
    </radialGradient>
    <radialGradient id="gStar" cx="0.36" cy="0.28" r="0.9">
      <stop offset="0%" stopColor="#f4a94a" />
      <stop offset="60%" stopColor="#ea8f26" />
      <stop offset="100%" stopColor="#c9721a" />
    </radialGradient>
    <radialGradient id="gSeahorse" cx="0.36" cy="0.28" r="0.9">
      <stop offset="0%" stopColor="#f4c95e" />
      <stop offset="60%" stopColor="#eab033" />
      <stop offset="100%" stopColor="#c9911d" />
    </radialGradient>
    <radialGradient id="gWhale" cx="0.36" cy="0.28" r="0.9">
      <stop offset="0%" stopColor="#7fb8dd" />
      <stop offset="60%" stopColor="#5497c4" />
      <stop offset="100%" stopColor="#3a76a1" />
    </radialGradient>
    <radialGradient id="gDolphin" cx="0.36" cy="0.28" r="0.9">
      <stop offset="0%" stopColor="#a0c8dd" />
      <stop offset="60%" stopColor="#7ba8c9" />
      <stop offset="100%" stopColor="#5a89ab" />
    </radialGradient>
    <radialGradient id="gJelly" cx="0.36" cy="0.24" r="0.9">
      <stop offset="0%" stopColor="#e0b0ea" />
      <stop offset="60%" stopColor="#c98bd6" />
      <stop offset="100%" stopColor="#a968b8" />
    </radialGradient>
    <radialGradient id="gTurtle" cx="0.36" cy="0.28" r="0.9">
      <stop offset="0%" stopColor="#8fcf87" />
      <stop offset="60%" stopColor="#6bb862" />
      <stop offset="100%" stopColor="#4f9c47" />
    </radialGradient>
    <radialGradient id="gShark" cx="0.36" cy="0.28" r="0.9">
      <stop offset="0%" stopColor="#a8b6be" />
      <stop offset="60%" stopColor="#8598a3" />
      <stop offset="100%" stopColor="#657882" />
    </radialGradient>
    <radialGradient id="gSquid" cx="0.36" cy="0.28" r="0.9">
      <stop offset="0%" stopColor="#c495d9" />
      <stop offset="60%" stopColor="#a86ec2" />
      <stop offset="100%" stopColor="#8752a1" />
    </radialGradient>
    <radialGradient id="gLobster" cx="0.36" cy="0.28" r="0.9">
      <stop offset="0%" stopColor="#e8776a" />
      <stop offset="60%" stopColor="#d9503f" />
      <stop offset="100%" stopColor="#b83a2b" />
    </radialGradient>
  </defs>
);

/* ------------------------------------------------------------------ */
/* 1. octopus                                                          */
/* ------------------------------------------------------------------ */
export const OctopusArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {[-84, -50, -16, 16, 50, 84].map((x, i) => (
        <path
          key={i}
          d={`M ${x * 0.5} 28 Q ${x} 70 ${x * 0.8} ${
            i % 2 ? 110 : 96
          } Q ${x * 1.1} 96 ${x * 0.9} 70 Z`}
          fill="url(#gOcto)"
          stroke={OUT}
          strokeWidth={4}
          strokeLinejoin="round"
        />
      ))}
      <circle cx={0} cy={-8} r={82} fill="url(#gOcto)" stroke={OUT} strokeWidth={5} />
      {!sil ? <Shine cx={-30} cy={-32} rx={16} ry={20} o={0.4} /> : null}
      {!sil ? <Face cy={-4} gap={28} blushGap={56} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 2. crab                                                             */
/* ------------------------------------------------------------------ */
export const CrabArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <g stroke={OUT} strokeWidth={5} fill="url(#gCrab)" strokeLinejoin="round">
        <path d="M -70 -14 Q -100 -30 -110 -58 Q -80 -50 -62 -30 Q -50 -50 -30 -50 Q -46 -22 -70 -14 Z" />
        <path d="M 70 -14 Q 100 -30 110 -58 Q 80 -50 62 -30 Q 50 -50 30 -50 Q 46 -22 70 -14 Z" />
      </g>
      <g stroke={OUT} strokeWidth={6} strokeLinecap="round">
        <path d="M -54 30 L -84 54 M -46 42 L -72 62 M 54 30 L 84 54 M 46 42 L 72 62" />
      </g>
      <ellipse cx={0} cy={14} rx={74} ry={50} fill="url(#gCrab)" stroke={OUT} strokeWidth={5} />
      {!sil ? (
        <>
          <circle cx={-24} cy={-16} r={13} fill="#fff" stroke={OUT} strokeWidth={3} />
          <circle cx={24} cy={-16} r={13} fill="#fff" stroke={OUT} strokeWidth={3} />
          <circle cx={-24} cy={-14} r={6} fill="#2c2c2c" />
          <circle cx={24} cy={-14} r={6} fill="#2c2c2c" />
          <Shine cx={-28} cy={2} rx={12} ry={16} o={0.35} />
        </>
      ) : null}
      {!sil ? <Face cy={26} gap={22} eye={0.7} blushGap={44} blushY={8} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 3. starfish                                                         */
/* ------------------------------------------------------------------ */
export const StarfishArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path
        d="M 0 -92 Q 18 -34 60 -30 Q 96 -6 78 34 Q 92 78 48 74 Q 24 108 0 68
           Q -24 108 -48 74 Q -92 78 -78 34 Q -96 -6 -60 -30 Q -18 -34 0 -92 Z"
        fill="url(#gStar)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {!sil ? (
        <g fill="#c9721a" opacity={0.5}>
          <circle cx={-14} cy={-26} r={5} /><circle cx={16} cy={-14} r={5} />
          <circle cx={40} cy={8} r={5} /><circle cx={-38} cy={10} r={5} />
          <circle cx={18} cy={40} r={5} /><circle cx={-20} cy={42} r={5} />
        </g>
      ) : null}
      {!sil ? <Shine cx={-16} cy={-16} rx={12} ry={16} o={0.35} /> : null}
      {!sil ? <Face cy={2} gap={20} eye={0.75} blushGap={40} blushY={8} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 4. seahorse                                                         */
/* ------------------------------------------------------------------ */
export const SeahorseArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path
        d="M -6 -86 Q 30 -90 32 -58 Q 34 -34 10 -24 Q 40 -14 38 16
           Q 36 44 8 50 Q 30 62 20 86 Q 6 100 -10 84 Q -26 70 -14 50
           Q -40 42 -38 12 Q -36 -12 -12 -20 Q -30 -32 -24 -56 Q -20 -82 -6 -86 Z"
        fill="url(#gSeahorse)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path d="M -6 -80 Q -20 -96 -2 -104 Q 10 -98 4 -82 Z" fill="url(#gSeahorse)" stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
      {!sil ? (
        <g stroke="#c9911d" strokeWidth={3.5} fill="none" opacity={0.5}>
          <path d="M -18 -50 q 20 6 26 0 M -22 -18 q 22 6 30 -2 M -20 14 q 20 8 28 0" />
        </g>
      ) : null}
      {!sil ? <Shine cx={-4} cy={-64} rx={9} ry={12} o={0.35} /> : null}
      {!sil ? <Face cy={-58} gap={13} eye={0.55} blushGap={26} blushY={5} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 5. whale                                                            */
/* ------------------------------------------------------------------ */
export const WhaleArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path d="M 60 -6 Q 110 -34 130 -10 Q 110 -6 92 8 Q 104 16 96 30 Q 74 24 58 8 Z" fill="url(#gWhale)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path
        d="M -110 8 Q -104 -40 -40 -46 Q 30 -52 70 -14 Q 84 0 66 14
           Q 50 26 20 22 Q -20 40 -70 32 Q -110 26 -110 8 Z"
        fill="url(#gWhale)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path d="M -30 -44 Q -16 -66 4 -58 Q -6 -46 -12 -34 Z" fill="#8ec7e8" opacity={sil ? 0 : 0.85} />
      {!sil ? (
        <g stroke="#3a76a1" strokeWidth={4} fill="none" opacity={0.4}>
          <path d="M -80 24 Q -60 34 -30 28 M -60 -4 Q -30 6 4 -2" />
        </g>
      ) : null}
      {!sil ? <Shine cx={-70} cy={-20} rx={16} ry={16} o={0.35} /> : null}
      {!sil ? <Face cy={-4} gap={22} eye={0.7} blushGap={44} blushY={8} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 6. dolphin                                                          */
/* ------------------------------------------------------------------ */
export const DolphinArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g transform="rotate(-10)">
      <path d="M -20 -20 Q -10 -60 20 -68 Q 8 -40 4 -18 Z" fill="url(#gDolphin)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 40 24 Q 76 40 100 24 Q 78 54 44 46 Z" fill="url(#gDolphin)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path
        d="M -104 6 Q -84 -30 -30 -30 Q 34 -30 62 8 Q 70 22 50 26
           Q 28 30 10 20 Q -20 34 -60 26 Q -104 20 -104 6 Z"
        fill="url(#gDolphin)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {!sil ? <Shine cx={-50} cy={-8} rx={13} ry={13} o={0.35} /> : null}
      {!sil ? (
        <g transform="rotate(10)">
          <Face cy={4} gap={20} eye={0.7} blushGap={40} blushY={8} />
        </g>
      ) : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 7. jellyfish                                                        */
/* ------------------------------------------------------------------ */
export const JellyfishArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path
        d="M -64 -6 Q -70 -56 0 -60 Q 70 -56 64 -6 Q 30 12 0 6 Q -30 12 -64 -6 Z"
        fill="url(#gJelly)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {!sil ? (
        <g stroke="#a968b8" strokeWidth={7} strokeLinecap="round" fill="none">
          <path d="M -40 6 q -6 30 4 54" />
          <path d="M -16 10 q 4 34 -6 60" />
          <path d="M 10 10 q -4 32 8 56" />
          <path d="M 36 6 q 8 28 -4 52" />
        </g>
      ) : (
        <g stroke="#000" strokeWidth={7} strokeLinecap="round" fill="none">
          <path d="M -40 6 q -6 30 4 54" />
          <path d="M -16 10 q 4 34 -6 60" />
          <path d="M 10 10 q -4 32 8 56" />
          <path d="M 36 6 q 8 28 -4 52" />
        </g>
      )}
      {!sil ? <Shine cx={-24} cy={-32} rx={14} ry={12} o={0.4} /> : null}
      {!sil ? <Face cy={-24} gap={22} eye={0.7} blushGap={44} blushY={8} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 8. turtle                                                           */
/* ------------------------------------------------------------------ */
export const TurtleArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path d="M -60 -10 Q -100 -14 -104 14 Q -100 34 -66 22 Z" fill="url(#gTurtle)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 56 -20 Q 92 -34 100 -10 Q 96 10 58 4 Z" fill="url(#gTurtle)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 46 30 Q 76 46 68 68 Q 44 60 38 38 Z" fill="url(#gTurtle)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -44 32 Q -70 52 -58 72 Q -34 60 -32 36 Z" fill="url(#gTurtle)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <ellipse cx={-6} cy={6} rx={78} ry={58} fill="#e0c584" stroke={OUT} strokeWidth={5} />
      {!sil ? (
        <g fill="#c9a86a" stroke="#a3854e" strokeWidth={2.5}>
          <path d="M -6 -30 l 22 18 l -8 26 l -28 0 l -8 -26 Z" />
          <circle cx={-52} cy={2} r={12} />
          <circle cx={38} cy={-6} r={12} />
          <circle cx={30} cy={30} r={12} />
          <circle cx={-30} cy={36} r={12} />
        </g>
      ) : null}
      <circle cx={62} cy={-30} r={26} fill="url(#gTurtle)" stroke={OUT} strokeWidth={5} />
      {!sil ? <Shine cx={-30} cy={-14} rx={13} ry={16} o={0.3} /> : null}
      {!sil ? <Face cy={-32} gap={11} eye={0.5} blushGap={22} blushY={5} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 9. shark                                                            */
/* ------------------------------------------------------------------ */
export const SharkArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path d="M 20 -30 L 44 -84 L 60 -28 Z" fill="url(#gShark)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 60 20 Q 106 44 126 20 Q 104 56 62 46 Z" fill="url(#gShark)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path
        d="M -110 4 Q -86 -34 -20 -32 Q 46 -30 74 6 Q 86 22 62 28
           Q 30 34 4 20 Q -30 40 -74 30 Q -110 22 -110 4 Z"
        fill="url(#gShark)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {!sil ? (
        <g fill="#fff" stroke={OUT} strokeWidth={1.6}>
          <path d="M -24 14 l 10 -8 l 2 12 Z" />
          <path d="M -8 16 l 10 -6 l 0 12 Z" />
        </g>
      ) : null}
      {!sil ? <Shine cx={-58} cy={-12} rx={13} ry={14} o={0.3} /> : null}
      {!sil ? <Face cy={-8} gap={22} eye={0.7} blushGap={44} blushY={8} color="#2c3a42" /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 10. squid                                                           */
/* ------------------------------------------------------------------ */
export const SquidArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {[-50, -28, -8, 12, 32, 52].map((x, i) => (
        <path
          key={i}
          d={`M ${x * 0.5} 40 Q ${x} 74 ${x * 0.7} ${i % 2 ? 104 : 92}`}
          stroke="url(#gSquid)"
          strokeWidth={12}
          fill="none"
          strokeLinecap="round"
        />
      ))}
      <path
        d="M -66 -20 Q -70 -80 0 -84 Q 70 -80 66 -20 Q 66 24 0 40 Q -66 24 -66 -20 Z"
        fill="url(#gSquid)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path d="M -20 -84 Q -10 -100 0 -84 M 4 -84 Q 14 -100 24 -84" stroke="url(#gSquid)" strokeWidth={10} fill="none" strokeLinecap="round" />
      {!sil ? <Shine cx={-26} cy={-40} rx={14} ry={20} o={0.35} /> : null}
      {!sil ? <Face cy={-16} gap={22} eye={0.75} blushGap={44} blushY={8} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 11. lobster                                                         */
/* ------------------------------------------------------------------ */
export const LobsterArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {/* claws, drawn as solid pincer shapes rather than thin legs */}
      <path
        d="M -56 -30 Q -100 -40 -108 -8 Q -104 16 -78 8 Q -86 -6 -70 -16
           Q -58 -22 -56 -30 Z"
        fill="url(#gLobster)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path
        d="M 56 -30 Q 100 -40 108 -8 Q 104 16 78 8 Q 86 -6 70 -16
           Q 58 -22 56 -30 Z"
        fill="url(#gLobster)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* small walking legs, close to the body */}
      <path d="M -46 34 L -66 50 M -34 44 L -50 60 M 46 34 L 66 50 M 34 44 L 50 60" stroke={OUT} strokeWidth={5} strokeLinecap="round" opacity={sil ? 0 : 0.7} />
      {/* tail fan */}
      <path d="M -6 30 Q -12 60 -30 72 M 6 30 Q 12 60 30 72" stroke="url(#gLobster)" strokeWidth={16} fill="none" strokeLinecap="round" />
      {/* body, one connected shape covering the leg joins */}
      <path
        d="M -58 2 Q -62 -38 -10 -44 Q 42 -38 38 2 Q 38 30 0 36 Q -58 36 -58 2 Z"
        fill="url(#gLobster)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path d="M -18 -44 l -8 -18 M 2 -46 l 4 -20" stroke={OUT} strokeWidth={4} strokeLinecap="round" />
      {!sil ? <Shine cx={-16} cy={-18} rx={12} ry={16} o={0.35} /> : null}
      {!sil ? <Face cy={-4} gap={16} eye={0.62} blushGap={32} blushY={6} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 12. clownfish (reuses the animal episode's fish)                    */
/* ------------------------------------------------------------------ */
export const ClownfishArt: GuessArt = FishArt;

/* ------------------------------------------------------------------ */
/* registry                                                             */
/* ------------------------------------------------------------------ */

export const SEA_ART: Record<string, GuessArt> = {
  octopus: OctopusArt,
  crab: CrabArt,
  starfish: StarfishArt,
  seahorse: SeahorseArt,
  whale: WhaleArt,
  dolphin: DolphinArt,
  jellyfish: JellyfishArt,
  turtle: TurtleArt,
  shark: SharkArt,
  squid: SquidArt,
  lobster: LobsterArt,
  clownfish: ClownfishArt,
};

export const SEA_NAME: Record<string, string> = {
  octopus: "Octopus",
  crab: "Crab",
  starfish: "Starfish",
  seahorse: "Seahorse",
  whale: "Whale",
  dolphin: "Dolphin",
  jellyfish: "Jellyfish",
  turtle: "Turtle",
  shark: "Shark",
  squid: "Squid",
  lobster: "Lobster",
  clownfish: "Clownfish",
};

/** The sound / splash beat for each — not every sea creature makes noise. */
export const SEA_SOUND: Record<string, string> = {
  octopus: "Splash!",
  crab: "Click click!",
  starfish: "Wiggle wiggle!",
  seahorse: "Bubble bubble!",
  whale: "Splash!",
  dolphin: "Eee-eee!",
  jellyfish: "Wobble wobble!",
  turtle: "Plip plop!",
  shark: "Snap snap!",
  squid: "Squirt!",
  lobster: "Click click!",
  clownfish: "Blub blub!",
};
