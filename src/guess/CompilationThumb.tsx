import React from "react";
import { AbsoluteFill } from "remotion";
import { ANIMAL_ART, AnimalDefs } from "../animals/animals";
import { RainbowArt } from "../colours/extras";
import { DinoDefs, DINO_ART } from "../dinosaurs/dinosaurs";
import { NUMBER_ART } from "../numbers/numbers";
import { SeaDefs, SEA_ART } from "../sea/sea";
import { VeggieDefs, VEGGIE_ART } from "../veggies/veggies";
import { VehicleDefs, VEHICLE_ART } from "../vehicles/vehicles";
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
 * Thumbnail for the seven-episode compilation.
 *
 * Single episodes lead on the shadow, because the guess is the hook. A
 * compilation sells on length and variety instead, so this one leads on the
 * running time and shows the cast in full colour — one hero from each of
 * the seven episodes.
 */

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
    label: "VEGGIES",
    tint: "#e2efd2",
    ink: "#4a7f2e",
    render: () => {
      const Carrot = VEGGIE_ART.carrot;
      return (
        <g transform="scale(1.6)">
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
        <g transform="scale(1.7)">
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
        <g transform="scale(1.85)">
          <Seven />
        </g>
      );
    },
  },
  {
    label: "VEHICLES",
    tint: "#f6d9d4",
    ink: "#c23f38",
    render: () => {
      const FireEngine = VEHICLE_ART.fireEngine;
      return (
        <g transform="scale(1.5)">
          <FireEngine />
        </g>
      );
    },
  },
  {
    label: "DINOSAURS",
    tint: "#ddeecb",
    ink: "#357038",
    render: () => {
      const TRex = DINO_ART.trex;
      return (
        <g transform="scale(1.5)">
          <TRex />
        </g>
      );
    },
  },
  {
    label: "SEA LIFE",
    tint: "#cfe6ee",
    ink: "#2d6699",
    render: () => {
      const Octopus = SEA_ART.octopus;
      return (
        <g transform="scale(1.75)">
          <Octopus />
        </g>
      );
    },
  },
  {
    label: "COLOURS",
    tint: "#f0dcec",
    ink: "#8b58b3",
    render: () => (
      <g transform="scale(1.3)">
        <RainbowArt />
      </g>
    ),
  },
];

/** A dedicated strip above the grid for the count/length badge, so it never
 *  has to sit on top of — and fight for space with — a panel label. */
const BANNER_H = 168;

export const CompilationThumbQuad: React.FC = () => {
  loadVeggieFonts();
  const topRow = PANELS.slice(0, 4);
  const botRow = PANELS.slice(4);
  const gridH = H - BANNER_H;
  const topH = BANNER_H + gridH * 0.52;
  const botH = H - topH;
  return (
    <AbsoluteFill style={{ backgroundColor: "#dceaee", overflow: "hidden" }}>
      <SceneFilters />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <VeggieDefs />
        <AnimalDefs />
        <VehicleDefs />
        <DinoDefs />
        <SeaDefs />
        {topRow.map((p, i) => {
          const w = W / topRow.length;
          const x = i * w;
          return (
            <g key={p.label}>
              <rect x={x} y={BANNER_H} width={w} height={topH - BANNER_H} fill={p.tint} />
              <g transform={`translate(${x + w / 2} ${BANNER_H + (topH - BANNER_H) / 2 - 20})`}>
                {p.render()}
              </g>
              <text
                x={x + w / 2}
                y={topH - 26}
                textAnchor="middle"
                fontFamily={fonts.script}
                fontWeight={800}
                fontSize={56}
                fill={p.ink}
                stroke="#ffffff"
                strokeWidth={11}
                paintOrder="stroke"
              >
                {p.label}
              </text>
            </g>
          );
        })}
        {botRow.map((p, i) => {
          const w = W / botRow.length;
          const x = i * w;
          return (
            <g key={p.label}>
              <rect x={x} y={topH} width={w} height={botH} fill={p.tint} />
              <g transform={`translate(${x + w / 2} ${topH + botH / 2 - 20})`}>
                {p.render()}
              </g>
              <text
                x={x + w / 2}
                y={H - 26}
                textAnchor="middle"
                fontFamily={fonts.script}
                fontWeight={800}
                fontSize={56}
                fill={p.ink}
                stroke="#ffffff"
                strokeWidth={11}
                paintOrder="stroke"
              >
                {p.label}
              </text>
            </g>
          );
        })}
        <g stroke="#ffffff" strokeWidth={14}>
          <line x1={0} y1={topH} x2={W} y2={topH} />
          {topRow.slice(1).map((p, i) => (
            <line key={p.label} x1={((i + 1) * W) / topRow.length} y1={BANNER_H} x2={((i + 1) * W) / topRow.length} y2={topH} />
          ))}
          {botRow.slice(1).map((p, i) => (
            <line key={p.label} x1={((i + 1) * W) / botRow.length} y1={topH} x2={((i + 1) * W) / botRow.length} y2={H} />
          ))}
        </g>
        {/* the banner strip, painted over the grid's top edge so it never
            competes with a panel label for space */}
        <rect x={0} y={0} width={W} height={BANNER_H} fill="#ef559b" />
        <line x1={0} y1={BANNER_H} x2={W} y2={BANNER_H} stroke="#ffffff" strokeWidth={14} />
        <text x={W / 2 - 220} y={BANNER_H / 2 + 24} textAnchor="middle" fontFamily={fonts.script} fontWeight={800} fontSize={88} fill="#ffffff">
          7 in 1
        </text>
        <text x={W / 2 + 220} y={BANNER_H / 2 + 20} textAnchor="middle" fontFamily={fonts.display} fontSize={52} fill="#ffffff">
          73 MINUTES
        </text>
      </svg>
      <PaperGrain opacity={0.1} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* C — the format's hook, at compilation length                        */
/* ------------------------------------------------------------------ */

const SHADOW_CAST: { Art: React.FC<{ sil?: boolean }>; x: number; scale: number }[] = [
  { Art: VEGGIE_ART.carrot, x: 100, scale: 1.05 },
  { Art: ANIMAL_ART.cow, x: 387, scale: 1.05 },
  { Art: NUMBER_ART["7"], x: 673, scale: 1.2 },
  { Art: VEHICLE_ART.fireEngine, x: 960, scale: 0.85 },
  { Art: DINO_ART.trex, x: 1247, scale: 0.85 },
  { Art: SEA_ART.octopus, x: 1533, scale: 1.0 },
  { Art: RainbowArt, x: 1810, scale: 0.75 },
];

export const CompilationThumbShadows: React.FC = () => {
  loadVeggieFonts();
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
        <VehicleDefs />
        <DinoDefs />
        <SeaDefs />
        {SHADOW_CAST.map(({ Art, x, scale }, i) => (
          <g key={i} transform={`translate(${x} 762) scale(${scale})`}>
            <Art sil />
          </g>
        ))}
      </svg>
      <Punch text="73 MINUTES" size={196} top={34} />
      <Punch text="OF SHADOW GUESSING" size={82} top={252} colors={WHITE} steady />
      <PaperGrain opacity={0.12} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* D — one board holding all seven episodes                            */
/* ------------------------------------------------------------------ */

const MIXED: {
  kind: "veg" | "animal" | "num" | "vehicle" | "dino" | "sea" | "colour";
  id: string;
  s: number;
}[] = [
  { kind: "veg", id: "tomato", s: 1.0 },
  { kind: "veg", id: "carrot", s: 0.95 },
  { kind: "vehicle", id: "fireEngine", s: 0.86 },
  { kind: "dino", id: "trex", s: 0.86 },
  { kind: "sea", id: "octopus", s: 0.92 },
  { kind: "animal", id: "cow", s: 0.9 },
  { kind: "animal", id: "duck", s: 0.74 },
  { kind: "colour", id: "rainbow", s: 0.68 },
  { kind: "num", id: "3", s: 0.92 },
  { kind: "num", id: "7", s: 0.92 },
  { kind: "num", id: "10", s: 1.1 },
  { kind: "veg", id: "broccoli", s: 0.95 },
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
        <VehicleDefs />
        <DinoDefs />
        <SeaDefs />
        <g transform="translate(0 -74) scale(0.84) translate(180 40)">
          <rect x={300} y={16} width={1300} height={870} rx={92} fill="#ef559b" filter="url(#wobble)" />
          <rect x={334} y={50} width={1232} height={802} rx={62} fill="#bbd08f" />
          {MIXED.map((m, i) => {
            const col = i % 4;
            const row = Math.floor(i / 4);
            const cx = 334 + 154 + col * 308;
            const cy = 50 + 134 + row * 267;
            const Art =
              m.kind === "veg"
                ? VEGGIE_ART[m.id as keyof typeof VEGGIE_ART]
                : m.kind === "animal"
                ? ANIMAL_ART[m.id]
                : m.kind === "num"
                ? NUMBER_ART[m.id]
                : m.kind === "vehicle"
                ? VEHICLE_ART[m.id]
                : m.kind === "dino"
                ? DINO_ART[m.id]
                : m.kind === "sea"
                ? SEA_ART[m.id]
                : RainbowArt;
            return (
              <g key={i} transform={`translate(${cx} ${cy}) scale(${m.s})`}>
                <Art />
              </g>
            );
          })}
        </g>
      </svg>
      <Punch text="7 SHOWS IN ONE" size={124} top={806} />
      <PaperGrain opacity={0.12} />
    </AbsoluteFill>
  );
};

export const CompilationThumb: React.FC = () => {
  loadVeggieFonts();
  const CAST: {
    Art: React.FC<{ sil?: boolean }>;
    x: number;
    y: number;
    rot: number;
    scale: number;
  }[] = [
    { Art: VEGGIE_ART.carrot, x: 110, y: 726, rot: -8, scale: 2.2 },
    { Art: ANIMAL_ART.cow, x: 393, y: 736, rot: 6, scale: 2.3 },
    { Art: NUMBER_ART["7"], x: 677, y: 720, rot: -5, scale: 2.5 },
    { Art: VEHICLE_ART.fireEngine, x: 940, y: 746, rot: 7, scale: 1.9 },
    { Art: DINO_ART.trex, x: 1230, y: 734, rot: 0, scale: 1.45 },
    { Art: SEA_ART.octopus, x: 1560, y: 738, rot: 5, scale: 2.0 },
    { Art: RainbowArt, x: 1770, y: 730, rot: -4, scale: 1.25 },
  ];

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
        <VehicleDefs />
        <DinoDefs />
        <SeaDefs />
        {CAST.map(({ Art, x, y, rot, scale }, i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
            <Art />
          </g>
        ))}
        <g transform={`translate(1436 ${H - 22}) scale(0.72)`}>
          <Crocodile chomp={0.1} step={1.1} />
        </g>
      </svg>

      <Punch text="73 MINUTES" size={200} top={38} />
      <Punch text="OF GUESSING FUN" size={98} top={264} colors={WHITE} steady />
      <PaperGrain opacity={0.12} />
    </AbsoluteFill>
  );
};
