import React from "react";
import { AbsoluteFill } from "remotion";
import { ANIMAL_ART, AnimalDefs } from "../animals/animals";
import { NUMBER_ART } from "../numbers/numbers";
import { VeggieDefs, VEGGIE_ART } from "../veggies/veggies";
import { Body, Face, Shine } from "./art";
import { Crocodile } from "./critters";
import { loadVeggieFonts } from "./fonts";
import { fonts } from "./palette";
import {
  Bush,
  Clouds,
  Grass,
  GROUND_Y,
  H,
  PaperGrain,
  SceneFilters,
  Sky,
  Sun,
  W,
} from "./scene";

/**
 * Thumbnail for the 41-minute compilation.
 *
 * Single episodes lead on the shadow, because the guess is the hook. A
 * compilation sells on length and variety instead, so this one leads on the
 * running time and shows the cast in full colour — one from each of the
 * four episodes, fruit included.
 */

/** The compilation covers the fruit episode too, so it needs one apple. */
const Apple: React.FC<{ sil?: boolean }> = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path
        d="M 4 -74 q -4 -26 14 -38 q 10 20 -2 40 Z"
        fill="#7a5a3a"
        stroke="#6a4a2e"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path
        d="M 16 -70 q 44 -30 74 -12 q -20 38 -70 24 Z"
        fill="#5aa84f"
        stroke="#43893c"
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <path
        d="M 0 -62 q 22 -20 50 -6 q 40 20 36 74 q -4 62 -42 76 q -26 10 -44 -4
           q -18 14 -44 4 q -38 -14 -42 -76 q -4 -54 36 -74 q 28 -14 50 6 Z"
        fill="url(#gApple)"
      />
      {!sil ? (
        <>
          <Shine cx={-38} cy={-18} rx={13} ry={28} o={0.45} />
          <Face cy={10} gap={26} blushGap={54} />
        </>
      ) : null}
    </g>
  </Body>
);

const AppleDefs: React.FC = () => (
  <defs>
    <radialGradient id="gApple" cx="0.34" cy="0.26" r="0.86">
      <stop offset="0%" stopColor="#f4796d" />
      <stop offset="60%" stopColor="#e85a52" />
      <stop offset="100%" stopColor="#cf4139" />
    </radialGradient>
  </defs>
);

const TITLE: [string, string][] = [
  ["#ef8a3c", "#c96a22"],
  ["#ea5b52", "#c23f38"],
  ["#4a9450", "#357038"],
  ["#f3c93f", "#cfa423"],
  ["#5aa0c8", "#3d7a9e"],
  ["#8b58b3", "#6b3d92"],
];

const Punch: React.FC<{
  text: string;
  size: number;
  top: number;
  colors?: [string, string][];
  steady?: boolean;
}> = ({ text, size, top, colors = TITLE, steady = false }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 0,
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-end",
    }}
  >
    {text.split("").map((ch, i) => {
      if (ch === " ") return <span key={i} style={{ width: size * 0.26 }} />;
      const [fill, shade] = colors[i % colors.length];
      const tilt = (i % 2 === 0 ? -1 : 1) * (steady ? 1.2 : 2 + (i % 3));
      return (
        <span
          key={i}
          style={{
            fontFamily: fonts.script,
            fontWeight: 800,
            fontSize: size,
            lineHeight: 0.92,
            color: fill,
            WebkitTextStroke: `${size * (steady ? 0.11 : 0.075)}px ${shade}`,
            paintOrder: "stroke fill",
            textShadow: `0 ${size * 0.055}px 0 ${shade}, 0 ${size * 0.1}px ${
              size * 0.09
            }px rgba(50,40,30,.35)`,
            transform: `rotate(${tilt}deg)`,
            display: "inline-block",
            margin: `0 -${size * 0.018}px`,
          }}
        >
          {ch}
        </span>
      );
    })}
  </div>
);

const WHITE: [string, string][] = [["#ffffff", "#2f5d2a"]];

export const CompilationThumb: React.FC = () => {
  loadVeggieFonts();
  const Carrot = VEGGIE_ART.carrot;
  const Broccoli = VEGGIE_ART.broccoli;
  const Cow = ANIMAL_ART.cow;
  const Duck = ANIMAL_ART.duck;
  const Seven = NUMBER_ART["7"];

  return (
    <AbsoluteFill style={{ backgroundColor: "#dceaee", overflow: "hidden" }}>
      <SceneFilters />
      <Sky />
      <Clouds />
      <Sun happy />
      <Grass />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <Bush x={-120} y={GROUND_Y - 250} w={780} h={250} tone="dark" seed={2} />
        <Bush x={1260} y={GROUND_Y - 228} w={800} h={228} tone="lite" seed={6} />
      </svg>

      {/* the cast, one from each episode, in full colour */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <VeggieDefs />
        <AnimalDefs />
        <AppleDefs />
        <g transform="translate(250 726) rotate(-8) scale(2.35)">
          <Apple />
        </g>
        <g transform="translate(640 736) rotate(6) scale(2.2)">
          <Carrot />
        </g>
        <g transform="translate(1010 720) rotate(-5) scale(2.3)">
          <Cow />
        </g>
        <g transform="translate(1390 746) rotate(7) scale(1.75)">
          <Duck />
        </g>
        <g transform="translate(1720 724) rotate(-6) scale(2.5)">
          <Seven />
        </g>
        <g transform="translate(150 1040) rotate(4) scale(1.5)">
          <Broccoli />
        </g>
        <g transform={`translate(1436 ${H - 22}) scale(0.72)`}>
          <Crocodile chomp={0.1} step={1.1} />
        </g>
      </svg>

      <Punch text="41 MINUTES" size={218} top={38} />
      <Punch text="OF GUESSING FUN" size={104} top={268} colors={WHITE} steady />
      <PaperGrain opacity={0.12} />
    </AbsoluteFill>
  );
};
