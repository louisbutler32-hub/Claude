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

/* ------------------------------------------------------------------ */
/* B — four panels, one per episode                                    */
/* ------------------------------------------------------------------ */

const PANELS: {
  label: string;
  tint: string;
  ink: string;
  render: () => React.ReactNode;
}[] = [
  {
    label: "FRUIT",
    tint: "#f6d9d4",
    ink: "#c23f38",
    render: () => (
      <g transform="scale(1.85)">
        <Apple />
      </g>
    ),
  },
  {
    label: "VEGGIES",
    tint: "#e2efd2",
    ink: "#4a7f2e",
    render: () => {
      const Carrot = VEGGIE_ART.carrot;
      return (
        <g transform="scale(1.75)">
          <Carrot />
        </g>
      );
    },
  },
  {
    label: "ANIMALS",
    tint: "#fbeacf",
    ink: "#c07d22",
    render: () => {
      const Cow = ANIMAL_ART.cow;
      return (
        <g transform="scale(1.85)">
          <Cow />
        </g>
      );
    },
  },
  {
    label: "NUMBERS",
    tint: "#d9e9f4",
    ink: "#3d7a9e",
    render: () => {
      const Seven = NUMBER_ART["7"];
      return (
        <g transform="scale(2.0)">
          <Seven />
        </g>
      );
    },
  },
];

export const CompilationThumbQuad: React.FC = () => {
  loadVeggieFonts();
  const halfW = W / 2;
  const halfH = H / 2;
  return (
    <AbsoluteFill style={{ backgroundColor: "#dceaee", overflow: "hidden" }}>
      <SceneFilters />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <VeggieDefs />
        <AnimalDefs />
        <AppleDefs />
        {PANELS.map((p, i) => {
          const x = (i % 2) * halfW;
          const y = Math.floor(i / 2) * halfH;
          return (
            <g key={p.label}>
              <rect x={x} y={y} width={halfW} height={halfH} fill={p.tint} />
              <g transform={`translate(${x + halfW / 2} ${y + halfH / 2 - 26})`}>
                {p.render()}
              </g>
              <text
                x={x + halfW / 2}
                y={y + halfH - 34}
                textAnchor="middle"
                fontFamily={fonts.script}
                fontWeight={800}
                fontSize={76}
                fill={p.ink}
                stroke="#ffffff"
                strokeWidth={14}
                paintOrder="stroke"
              >
                {p.label}
              </text>
            </g>
          );
        })}
        <g stroke="#ffffff" strokeWidth={16}>
          <line x1={halfW} y1={0} x2={halfW} y2={H} />
          <line x1={0} y1={halfH} x2={W} y2={halfH} />
        </g>
        {/* centre badge */}
        <circle cx={W / 2} cy={H / 2} r={210} fill="#ef559b" stroke="#ffffff" strokeWidth={20} />
        <text x={W / 2} y={H / 2 - 22} textAnchor="middle" fontFamily={fonts.script} fontWeight={800} fontSize={116} fill="#ffffff">
          4 in 1
        </text>
        <text x={W / 2} y={H / 2 + 82} textAnchor="middle" fontFamily={fonts.display} fontSize={66} fill="#ffffff">
          41 MIN
        </text>
      </svg>
      <PaperGrain opacity={0.1} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* C — the format's hook, at compilation length                        */
/* ------------------------------------------------------------------ */

export const CompilationThumbShadows: React.FC = () => {
  loadVeggieFonts();
  const Carrot = VEGGIE_ART.carrot;
  const Cow = ANIMAL_ART.cow;
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
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <VeggieDefs />
        <AnimalDefs />
        <AppleDefs />
        <g transform="translate(330 768) scale(1.95)"><Apple sil /></g>
        <g transform="translate(770 762) scale(1.9)"><Carrot sil /></g>
        <g transform="translate(1200 756) scale(1.95)"><Cow sil /></g>
        <g transform="translate(1630 756) scale(2.15)"><Seven sil /></g>
      </svg>
      <Punch text="41 MINUTES" size={206} top={34} />
      <Punch text="OF SHADOW GUESSING" size={88} top={256} colors={WHITE} steady />
      <PaperGrain opacity={0.12} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* D — one board holding all four episodes                             */
/* ------------------------------------------------------------------ */

const MIXED: { kind: "veg" | "animal" | "num" | "apple"; id: string; s: number }[] = [
  { kind: "apple", id: "apple", s: 0.92 },
  { kind: "veg", id: "carrot", s: 0.95 },
  { kind: "veg", id: "broccoli", s: 0.95 },
  { kind: "veg", id: "pumpkin", s: 0.98 },
  { kind: "animal", id: "cow", s: 0.9 },
  { kind: "animal", id: "duck", s: 0.74 },
  { kind: "animal", id: "lion", s: 0.82 },
  { kind: "animal", id: "frog", s: 0.82 },
  { kind: "num", id: "3", s: 0.92 },
  { kind: "num", id: "7", s: 0.92 },
  { kind: "num", id: "10", s: 1.1 },
  { kind: "veg", id: "tomato", s: 1.0 },
];

export const CompilationThumbBoard: React.FC = () => {
  loadVeggieFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#dceaee", overflow: "hidden" }}>
      <SceneFilters />
      <Sky />
      <Clouds />
      <Sun happy />
      <Grass tulips />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <VeggieDefs />
        <AnimalDefs />
        <AppleDefs />
        <g transform="translate(0 -74) scale(0.84) translate(180 40)">
          <rect x={300} y={16} width={1300} height={870} rx={92} fill="#ef559b" filter="url(#wobble)" />
          <rect x={334} y={50} width={1232} height={802} rx={62} fill="#bbd08f" />
          {MIXED.map((m, i) => {
            const col = i % 4;
            const row = Math.floor(i / 4);
            const cx = 334 + 154 + col * 308;
            const cy = 50 + 134 + row * 267;
            const Art =
              m.kind === "apple"
                ? Apple
                : m.kind === "veg"
                ? VEGGIE_ART[m.id as keyof typeof VEGGIE_ART]
                : m.kind === "animal"
                ? ANIMAL_ART[m.id]
                : NUMBER_ART[m.id];
            return (
              <g key={i} transform={`translate(${cx} ${cy}) scale(${m.s})`}>
                <Art />
              </g>
            );
          })}
        </g>
      </svg>
      <Punch text="4 SHOWS IN ONE" size={128} top={806} />
      <PaperGrain opacity={0.12} />
    </AbsoluteFill>
  );
};

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
