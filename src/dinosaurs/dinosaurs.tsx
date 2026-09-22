import React from "react";
import { Body, Face, Shine } from "../guess/art";
import { photoArt, type PhotoCredit } from "../guess/photoArt";
import type { GuessArt } from "../guess/types";
import dinoPhotoCredits from "../../public/images/dinosaurs/credits.json";

/**
 * The twelve dinosaurs. Same trick: drawn once, coloured or flattened to a
 * shadow by the `sil` filter — the shape that must carry the whole guess.
 *
 * This hand-drawn cast (DINO_ART) stays the canonical one — colours and the
 * compilation thumbnail pull individual members of it in to keep one
 * consistent art style across the whole channel. The Dinosaurs episode
 * itself uses real-world cutouts instead (DINO_PHOTO_ART, DINO_PHOTO_CREDITS
 * below) — since no photograph of a living dinosaur exists, these are
 * museum models, statues and toy figures rather than photos of the animal
 * itself. See scripts/fetch-photo-cutouts.py for how they were sourced and
 * licensed.
 */

export const DINO_PHOTO_CREDITS: PhotoCredit[] = dinoPhotoCredits;
export const DINO_PHOTO_ART: Record<string, GuessArt> = photoArt(
  "dinosaurs",
  DINO_PHOTO_CREDITS
);

const OUT = "#3a3226";

export const DinoDefs: React.FC = () => (
  <defs>
    <radialGradient id="gTrex" cx="0.36" cy="0.28" r="0.9">
      <stop offset="0%" stopColor="#8fcf6a" />
      <stop offset="60%" stopColor="#6fb84a" />
      <stop offset="100%" stopColor="#549332" />
    </radialGradient>
    <radialGradient id="gTri" cx="0.36" cy="0.28" r="0.9">
      <stop offset="0%" stopColor="#f4a05e" />
      <stop offset="60%" stopColor="#ea8a3c" />
      <stop offset="100%" stopColor="#c96a22" />
    </radialGradient>
    <radialGradient id="gStego" cx="0.36" cy="0.28" r="0.9">
      <stop offset="0%" stopColor="#7fc7d9" />
      <stop offset="60%" stopColor="#5aa8bd" />
      <stop offset="100%" stopColor="#3f8798" />
    </radialGradient>
    <radialGradient id="gBrachio" cx="0.36" cy="0.28" r="0.9">
      <stop offset="0%" stopColor="#a0d67a" />
      <stop offset="60%" stopColor="#7fbd54" />
      <stop offset="100%" stopColor="#5f9a3a" />
    </radialGradient>
    <radialGradient id="gVelo" cx="0.36" cy="0.28" r="0.9">
      <stop offset="0%" stopColor="#e8c25e" />
      <stop offset="60%" stopColor="#d9a836" />
      <stop offset="100%" stopColor="#b8871f" />
    </radialGradient>
    <radialGradient id="gPtero" cx="0.36" cy="0.28" r="0.9">
      <stop offset="0%" stopColor="#c993d4" />
      <stop offset="60%" stopColor="#ab6cbd" />
      <stop offset="100%" stopColor="#8a4f9c" />
    </radialGradient>
    <radialGradient id="gAnky" cx="0.36" cy="0.28" r="0.9">
      <stop offset="0%" stopColor="#d9b96a" />
      <stop offset="60%" stopColor="#c49c42" />
      <stop offset="100%" stopColor="#a37f2d" />
    </radialGradient>
    <radialGradient id="gSpino" cx="0.36" cy="0.28" r="0.9">
      <stop offset="0%" stopColor="#6fb0d9" />
      <stop offset="60%" stopColor="#4a8fbd" />
      <stop offset="100%" stopColor="#356d94" />
    </radialGradient>
    <radialGradient id="gDiplo" cx="0.36" cy="0.28" r="0.9">
      <stop offset="0%" stopColor="#93cf87" />
      <stop offset="60%" stopColor="#6fb662" />
      <stop offset="100%" stopColor="#4f9944" />
    </radialGradient>
    <radialGradient id="gPara" cx="0.36" cy="0.28" r="0.9">
      <stop offset="0%" stopColor="#e88ba0" />
      <stop offset="60%" stopColor="#d9647e" />
      <stop offset="100%" stopColor="#b84a62" />
    </radialGradient>
    <radialGradient id="gIguana" cx="0.36" cy="0.28" r="0.9">
      <stop offset="0%" stopColor="#8fcf9a" />
      <stop offset="60%" stopColor="#6cb376" />
      <stop offset="100%" stopColor="#4f9457" />
    </radialGradient>
    <radialGradient id="gAllo" cx="0.36" cy="0.28" r="0.9">
      <stop offset="0%" stopColor="#d97a5e" />
      <stop offset="60%" stopColor="#c25b3c" />
      <stop offset="100%" stopColor="#a1462b" />
    </radialGradient>
  </defs>
);

/* ------------------------------------------------------------------ */
/* 1. T-Rex                                                            */
/* ------------------------------------------------------------------ */
export const TRexArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {/* thick standing legs — the feature that separates every biped here */}
      <path d="M -6 40 Q -14 78 -36 88 L -12 92 Q 10 80 16 42 Z" fill="url(#gTrex)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 26 40 Q 30 76 50 88 L 26 92 Q 8 80 6 42 Z" fill="url(#gTrex)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      {/* tiny arm */}
      <path d="M -34 -6 Q -50 2 -46 18" stroke="url(#gTrex)" strokeWidth={12} fill="none" strokeLinecap="round" />
      {/* thick tail, balancing back */}
      <path d="M 40 14 Q 92 6 108 -22 Q 92 6 40 26 Z" fill="url(#gTrex)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      {/* body + big head, the dominant identifying shape */}
      <path
        d="M -50 30 Q -70 -4 -52 -34 Q -34 -62 4 -60 Q 50 -58 66 -22 Q 76 2 56 18
           Q 46 26 30 22 Q 16 46 -14 48 Q -44 48 -50 30 Z"
        fill="url(#gTrex)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path d="M 20 -50 l -8 -24 l 18 10 Z M 44 -44 l -2 -22 l 18 14 Z" fill="url(#gTrex)" stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
      {!sil ? (
        <g fill="#fff" stroke={OUT} strokeWidth={2}>
          <path d="M 50 -6 l 10 -8 l 2 12 Z" />
          <path d="M 62 0 l 10 -6 l 0 12 Z" />
        </g>
      ) : null}
      {!sil ? <Shine cx={-24} cy={-24} rx={13} ry={18} o={0.35} /> : null}
      {!sil ? <Face cy={2} gap={20} eye={0.85} blushGap={40} blushY={9} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 2. Triceratops                                                      */
/* ------------------------------------------------------------------ */
export const TriceratopsArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path d="M -60 40 Q -90 60 -70 74 L 40 74 Q 70 74 60 44 Q 40 30 0 30 Q -30 30 -60 40 Z" fill="url(#gTri)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path
        d="M -20 30 Q -76 26 -84 -18 Q -88 -50 -54 -58 Q -20 -66 4 -44 Q 30 -50 42 -26
           Q 50 -8 34 6 Q 44 14 34 26 Q 14 34 -20 30 Z"
        fill="url(#gTri)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path d="M -60 -20 l -30 -6 l 14 24 Z" fill="url(#gTri)" stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
      <path d="M -34 -48 l -10 -30 l 20 16 Z" fill="#e8dcc4" stroke={OUT} strokeWidth={3} strokeLinejoin="round" />
      <path d="M 0 -50 l 4 -28 l 16 20 Z" fill="#e8dcc4" stroke={OUT} strokeWidth={3} strokeLinejoin="round" />
      <path d="M -76 -6 l -2 -24 l 18 12 Z" fill="#e8dcc4" stroke={OUT} strokeWidth={3} strokeLinejoin="round" />
      {!sil ? <Shine cx={-46} cy={-4} rx={12} ry={16} o={0.35} /> : null}
      {!sil ? <Face cy={-4} gap={20} eye={0.75} blushGap={40} blushY={10} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 3. Stegosaurus                                                       */
/* ------------------------------------------------------------------ */
export const StegosaurusArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path d="M 60 20 Q 96 30 86 54 Q 78 66 60 56 Z" fill="url(#gStego)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path
        d="M -96 10 Q -104 -6 -88 -14 Q -74 -20 -66 -8 Q -50 -26 -20 -20
           Q 10 -16 20 4 Q 40 -4 56 14 Q 68 26 56 40 Q 24 26 -10 22
           Q -50 46 -88 34 Q -108 26 -96 10 Z"
        fill="url(#gStego)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <g fill="url(#gStego)" stroke={OUT} strokeWidth={4} strokeLinejoin="round">
        <path d="M -58 -18 l -8 -34 l 26 22 Z" />
        <path d="M -26 -26 l -4 -38 l 28 26 Z" />
        <path d="M 6 -20 l 4 -36 l 26 28 Z" />
        <path d="M 36 -6 l 12 -32 l 22 32 Z" />
      </g>
      {!sil ? <Shine cx={-68} cy={4} rx={12} ry={14} o={0.35} /> : null}
      {!sil ? <Face cy={4} gap={18} eye={0.65} blushGap={34} blushY={8} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 4. Brachiosaurus                                                     */
/* ------------------------------------------------------------------ */
export const BrachiosaurusArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path d="M -50 40 Q -10 58 60 50 Q 92 46 88 24 Q 40 34 -20 22 Q -60 16 -50 40 Z" fill="url(#gBrachio)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path
        d="M -34 24 Q -50 -30 -30 -76 Q -14 -110 14 -108 Q 34 -106 30 -84
           Q 24 -86 18 -78 Q 30 -70 24 -54 Q 40 -44 46 -20 Q 50 4 30 22
           Q 6 10 -34 24 Z"
        fill="url(#gBrachio)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <ellipse cx={16} cy={-96} rx={22} ry={18} fill="url(#gBrachio)" stroke={OUT} strokeWidth={5} />
      <path d="M -60 34 Q -30 60 20 54" stroke={OUT} strokeWidth={5} fill="none" opacity={sil ? 0 : 0.4} />
      {!sil ? <Shine cx={-4} cy={-90} rx={9} ry={11} o={0.35} /> : null}
      {!sil ? <Face cy={-96} gap={14} eye={0.6} blushGap={28} blushY={6} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 5. Velociraptor                                                      */
/* ------------------------------------------------------------------ */
export const VelociraptorArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g transform="rotate(-8)">
      {/* legs, one raised with the sickle claw that identifies a raptor */}
      <path d="M -20 30 Q -26 58 -44 66 L -24 70 Q -4 60 0 32 Z" fill="url(#gVelo)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 6 30 Q 20 46 40 44 L 44 54 Q 20 62 -4 44 Q -8 36 -8 32 Z" fill="url(#gVelo)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <circle cx={40} cy={48} r={5} fill={OUT} />
      {/* long stiff tail */}
      <path d="M -30 6 Q -80 2 -100 -20 Q -76 -2 -28 18 Z" fill="url(#gVelo)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      {/* sleek body + narrow snout */}
      <path
        d="M -34 20 Q -46 -6 -30 -26 Q -14 -44 14 -38 Q 36 -34 46 -14
           Q 50 -2 36 4 Q 42 10 34 16 Q 20 22 8 16 Q 0 34 -18 34 Q -32 32 -34 20 Z"
        fill="url(#gVelo)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path d="M 22 -34 l -4 -14 l 12 6 Z" fill="url(#gVelo)" stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
      {!sil ? (
        <g fill="#fff" stroke={OUT} strokeWidth={1.6}>
          <path d="M 34 -6 l 8 -5 l 1 8 Z" />
        </g>
      ) : null}
      {!sil ? <Shine cx={-14} cy={-14} rx={9} ry={12} o={0.35} /> : null}
      {!sil ? <g transform="rotate(8)"><Face cy={-2} gap={13} eye={0.6} blushGap={26} blushY={6} /></g> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 6. Pterodactyl                                                       */
/* ------------------------------------------------------------------ */
export const PterodactylArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path d="M -10 10 Q -100 -20 -140 20 Q -90 6 -30 24 Z" fill="url(#gPtero)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 14 10 Q 100 -24 142 14 Q 92 4 32 24 Z" fill="url(#gPtero)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <ellipse cx={0} cy={20} rx={30} ry={22} fill="url(#gPtero)" stroke={OUT} strokeWidth={5} />
      <path d="M -6 -4 Q -20 -46 4 -60 Q 16 -50 8 -26 Q 20 -30 26 -14 Q 20 4 -6 -4 Z" fill="url(#gPtero)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 26 0 L 56 4 L 28 14 Z" fill="#e8dcc4" stroke={OUT} strokeWidth={3} strokeLinejoin="round" />
      {!sil ? <Shine cx={-8} cy={12} rx={10} ry={12} o={0.35} /> : null}
      {!sil ? <Face cy={16} gap={16} eye={0.7} blushGap={30} blushY={6} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 7. Ankylosaurus                                                      */
/* ------------------------------------------------------------------ */
export const AnkylosaurusArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path d="M 70 -4 Q 110 -4 108 20 Q 106 40 78 34 Q 90 16 70 -4 Z" fill="url(#gAnky)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <circle cx={98} cy={16} r={20} fill="url(#gAnky)" stroke={OUT} strokeWidth={5} />
      <path
        d="M -90 -10 Q -96 -34 -70 -38 Q -40 -50 0 -46 Q 44 -42 66 -18
           Q 78 -2 66 16 Q 20 34 -40 30 Q -90 26 -90 -10 Z"
        fill="url(#gAnky)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {!sil ? (
        <g fill="#c49c42" stroke={OUT} strokeWidth={2.5}>
          <circle cx={-56} cy={-16} r={9} /><circle cx={-24} cy={-24} r={9} />
          <circle cx={10} cy={-24} r={9} /><circle cx={40} cy={-12} r={9} />
          <circle cx={-40} cy={4} r={8} /><circle cx={-4} cy={0} r={8} />
        </g>
      ) : null}
      <path d="M -90 -18 l -20 -10 l 6 22 Z M -90 4 l -22 2 l 12 20 Z" fill="url(#gAnky)" stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
      {!sil ? <Face cy={-4} gap={16} eye={0.65} blushGap={32} blushY={6} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 8. Spinosaurus                                                       */
/* ------------------------------------------------------------------ */
export const SpinosaurusArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {/* legs */}
      <path d="M -4 46 Q -10 78 -30 88 L -8 92 Q 12 80 18 48 Z" fill="url(#gSpino)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 24 46 Q 28 76 46 88 L 24 92 Q 8 80 6 48 Z" fill="url(#gSpino)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      {/* the sail — the one feature nothing else on this board has */}
      <path
        d="M -46 -6 Q -30 -76 6 -92 Q 20 -96 18 -78 Q 12 -54 16 -30
           Q 30 -50 34 -76 Q 40 -92 46 -74 Q 48 -48 36 -20
           Q 44 -10 38 4 Q 24 16 8 8 Q -2 30 -30 32 Q -50 28 -46 -6 Z"
        fill="url(#gSpino)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* long crocodile-like snout */}
      <path d="M -46 -2 Q -84 -4 -100 12 Q -84 16 -46 20 Z" fill="url(#gSpino)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 34 8 Q 70 4 84 -14 Q 70 10 32 22 Z" fill="url(#gSpino)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      {!sil ? <Shine cx={-20} cy={-40} rx={10} ry={22} o={0.32} /> : null}
      {!sil ? <Face cy={6} gap={14} eye={0.55} blushGap={28} blushY={6} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 9. Diplodocus                                                        */
/* ------------------------------------------------------------------ */
export const DiplodocusArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path d="M -20 40 Q 40 56 100 30 Q 120 20 108 4 Q 80 20 20 18 Q -30 14 -20 40 Z" fill="url(#gDiplo)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path
        d="M -14 16 Q -30 -30 -14 -66 Q 0 -94 22 -90 Q 30 -78 18 -66
           Q 34 -56 30 -38 Q 44 -26 44 -6 Q 40 14 16 20 Q -4 22 -14 16 Z"
        fill="url(#gDiplo)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <ellipse cx={16} cy={-84} rx={14} ry={12} fill="url(#gDiplo)" stroke={OUT} strokeWidth={5} />
      <path d="M -40 32 Q -10 56 30 46" stroke={OUT} strokeWidth={5} fill="none" opacity={sil ? 0 : 0.4} />
      {!sil ? <Shine cx={4} cy={-78} rx={7} ry={9} o={0.35} /> : null}
      {!sil ? <Face cy={-84} gap={10} eye={0.5} blushGap={20} blushY={5} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 10. Parasaurolophus                                                  */
/* ------------------------------------------------------------------ */
export const ParasaurolophusArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path d="M -8 40 Q -14 74 -34 84 L -12 88 Q 8 76 14 42 Z" fill="url(#gPara)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 20 40 Q 24 72 42 84 L 20 88 Q 4 76 2 42 Z" fill="url(#gPara)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -36 20 Q -66 20 -78 0 Q -60 12 -34 30 Z" fill="url(#gPara)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path
        d="M -40 14 Q -56 -10 -40 -30 Q -26 -46 -2 -42 Q 24 -38 36 -14 Q 42 0 26 8
           Q 32 16 22 22 Q 8 28 -4 20 Q -10 40 -28 40 Q -40 38 -40 14 Z"
        fill="url(#gPara)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* the backward crest — the whole identifying feature */}
      <path
        d="M -6 -38 Q 16 -70 56 -66 Q 78 -62 70 -42 Q 60 -24 36 -20 Q 40 -6 22 4
           Q 8 -6 12 -22 Q -4 -22 -6 -38 Z"
        fill="url(#gPara)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {!sil ? <Shine cx={-20} cy={-14} rx={9} ry={12} o={0.35} /> : null}
      {!sil ? <Face cy={-4} gap={13} eye={0.58} blushGap={26} blushY={6} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 11. Iguanodon                                                        */
/* ------------------------------------------------------------------ */
export const IguanodonArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {/* bulkier, upright stance on two sturdy legs */}
      <path d="M -10 46 Q -16 80 -38 90 L -14 94 Q 8 82 14 48 Z" fill="url(#gIguana)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 22 46 Q 26 78 46 90 L 22 94 Q 4 82 2 48 Z" fill="url(#gIguana)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      {/* arm with the thumb spike, the field mark for iguanodon */}
      <path d="M -40 4 Q -58 10 -58 30" stroke="url(#gIguana)" strokeWidth={13} fill="none" strokeLinecap="round" />
      <path d="M -62 24 l -12 -8 l 4 16 Z" fill="url(#gIguana)" stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
      <path d="M 30 10 Q 60 4 74 -16 Q 60 10 26 24 Z" fill="url(#gIguana)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path
        d="M -46 24 Q -60 -8 -38 -32 Q -18 -52 10 -46 Q 38 -40 46 -14
           Q 50 2 32 8 Q 38 16 28 22 Q 14 28 2 20 Q -6 44 -28 46 Q -44 44 -46 24 Z"
        fill="url(#gIguana)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {!sil ? <Shine cx={-20} cy={-16} rx={10} ry={14} o={0.35} /> : null}
      {!sil ? <Face cy={-2} gap={15} eye={0.62} blushGap={30} blushY={6} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* 12. Allosaurus                                                       */
/* ------------------------------------------------------------------ */
export const AllosaurusArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path d="M -6 44 Q -12 78 -34 88 L -10 92 Q 12 80 18 46 Z" fill="url(#gAllo)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 26 44 Q 30 76 50 88 L 26 92 Q 8 80 6 46 Z" fill="url(#gAllo)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -32 -4 Q -48 4 -44 20" stroke="url(#gAllo)" strokeWidth={11} fill="none" strokeLinecap="round" />
      <path d="M 38 14 Q 84 10 100 -18 Q 84 10 36 28 Z" fill="url(#gAllo)" stroke={OUT} strokeWidth={5} strokeLinejoin="round" />
      <path
        d="M -48 26 Q -66 -2 -48 -30 Q -30 -56 6 -52 Q 44 -48 58 -18
           Q 64 -2 44 6 Q 52 14 42 22 Q 28 30 14 22 Q 4 44 -22 46 Q -46 44 -48 26 Z"
        fill="url(#gAllo)"
        stroke={OUT}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* twin brow crests, the allosaurus field mark */}
      <path d="M -14 -50 Q -20 -66 -6 -70 Q 2 -66 -2 -50 Z" fill="url(#gAllo)" stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
      <path d="M 14 -48 Q 10 -64 24 -68 Q 32 -62 26 -48 Z" fill="url(#gAllo)" stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
      <path d="M 30 -32 l -6 -18 l 16 8 Z" fill="url(#gAllo)" stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
      {!sil ? (
        <g fill="#fff" stroke={OUT} strokeWidth={1.8}>
          <path d="M 42 -4 l 9 -6 l 1 10 Z" />
        </g>
      ) : null}
      {!sil ? <Shine cx={-22} cy={-20} rx={11} ry={15} o={0.35} /> : null}
      {!sil ? <Face cy={-6} gap={17} eye={0.72} blushGap={34} blushY={7} /> : null}
    </g>
  </Body>
);

/* ------------------------------------------------------------------ */
/* registry                                                             */
/* ------------------------------------------------------------------ */

export const DINO_ART: Record<string, GuessArt> = {
  trex: TRexArt,
  triceratops: TriceratopsArt,
  stegosaurus: StegosaurusArt,
  brachiosaurus: BrachiosaurusArt,
  velociraptor: VelociraptorArt,
  pterodactyl: PterodactylArt,
  ankylosaurus: AnkylosaurusArt,
  spinosaurus: SpinosaurusArt,
  diplodocus: DiplodocusArt,
  parasaurolophus: ParasaurolophusArt,
  iguanodon: IguanodonArt,
  allosaurus: AllosaurusArt,
};

export const DINO_NAME: Record<string, string> = {
  trex: "T-Rex",
  triceratops: "Triceratops",
  stegosaurus: "Stegosaurus",
  brachiosaurus: "Brachiosaurus",
  velociraptor: "Velociraptor",
  pterodactyl: "Pterodactyl",
  ankylosaurus: "Ankylosaurus",
  spinosaurus: "Spinosaurus",
  diplodocus: "Diplodocus",
  parasaurolophus: "Parasaurolophus",
  iguanodon: "Iguanodon",
  allosaurus: "Allosaurus",
};

/** The sound beat — most are a roar, varied so twelve rounds don't repeat. */
export const DINO_SOUND: Record<string, string> = {
  trex: "ROAR!",
  triceratops: "Snort snort!",
  stegosaurus: "Stomp stomp!",
  brachiosaurus: "Hmmmmm!",
  velociraptor: "Screech!",
  pterodactyl: "Caw caw!",
  ankylosaurus: "Thud thud!",
  spinosaurus: "ROAR!",
  diplodocus: "Munch munch!",
  parasaurolophus: "Honk honk!",
  iguanodon: "Snort snort!",
  allosaurus: "ROAR!",
};
