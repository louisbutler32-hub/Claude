import React from "react";
import { AbsoluteFill } from "remotion";
import { ANIMAL_ART, AnimalDefs } from "../animals/animals";
import { NUMBER_ART, NUMBER_COLORS } from "../numbers/numbers";
import { VeggieDefs, VEGGIE_ART, type VeggieId } from "../veggies/veggies";
import { Crocodile } from "./critters";
import { loadVeggieFonts } from "./fonts";
import { bushes, fonts, ground, sky, sun as sunC } from "./palette";
import { SceneFilters } from "./scene";

/**
 * YouTube channel banner, 2560x1440.
 *
 * YouTube crops this hard: phones only ever show the centred 1546x423
 * band, so the whole identity lives in there and the cast fills the field
 * around it that only desktop sees. `guides` draws the crop boundaries for
 * checking, and is off for the exported art.
 */

const W = 2560;
const H = 1440;
/** Visible on every device — nothing that matters may leave this box. */
const SAFE_W = 1546;
const SAFE_H = 423;
/** Visible on tablets. */
const TABLET_W = 1855;

const SAFE_X = (W - SAFE_W) / 2;
const SAFE_Y = (H - SAFE_H) / 2;

const GROUND_Y = 1120;

const Cloud: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({
  x,
  y,
  s = 1,
  o = 0.9,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <g filter="url(#chalk)" fill="#ffffff">
      <ellipse cx={0} cy={22} rx={150} ry={30} />
      <ellipse cx={-66} cy={8} rx={60} ry={38} />
      <ellipse cx={10} cy={-10} rx={78} ry={52} />
      <ellipse cx={84} cy={12} rx={54} ry={36} />
    </g>
  </g>
);

const Sun: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g filter="url(#wobble)">
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const o = 82 + (i % 2 === 0 ? 46 : 30);
        return (
          <line
            key={i}
            x1={Math.cos(a) * 82}
            y1={Math.sin(a) * 82}
            x2={Math.cos(a) * o}
            y2={Math.sin(a) * o}
            stroke={sunC.ray}
            strokeWidth={8}
            strokeLinecap="round"
          />
        );
      })}
    </g>
    <circle r={74} fill={sunC.body} filter="url(#chalk)" />
    <ellipse cx={-46} cy={12} rx={13} ry={9} fill={sunC.blush} opacity={0.8} />
    <ellipse cx={46} cy={12} rx={13} ry={9} fill={sunC.blush} opacity={0.8} />
    <path d="M -34 -6 q 12 -16 24 0 M 10 -6 q 12 -16 24 0" stroke={sunC.face} strokeWidth={6} fill="none" strokeLinecap="round" />
    <path d="M -14 16 q 14 16 28 0" stroke={sunC.face} strokeWidth={6} fill="none" strokeLinecap="round" />
  </g>
);

const Hill: React.FC<{ x: number; y: number; w: number; h: number; tone?: "dark" | "lite" }> = ({
  x,
  y,
  w,
  h,
  tone = "dark",
}) => (
  <path
    d={`M ${x} ${y} q ${w * 0.25} ${-h} ${w * 0.5} ${-h * 0.72} q ${
      w * 0.25
    } ${h * 0.28} ${w * 0.5} ${h * 0.72} Z`}
    fill={tone === "dark" ? bushes.darkFill : bushes.liteFill}
    stroke={tone === "dark" ? bushes.darkLine : bushes.liteLine}
    strokeWidth={11}
    strokeLinejoin="round"
    filter="url(#wobble)"
  />
);

/** Cast member placements. Everything here sits outside the mobile crop. */
type Cast = { kind: "veg" | "animal" | "num"; id: string; x: number; y: number; s: number; r: number };

const CAST: Cast[] = [
  // far left — desktop only
  { kind: "veg", id: "carrot", x: 150, y: 300, s: 1.5, r: -10 },
  { kind: "animal", id: "cow", x: 400, y: 220, s: 1.4, r: 7 },
  { kind: "num", id: "3", x: 236, y: 620, s: 1.2, r: -8 },
  { kind: "veg", id: "broccoli", x: 130, y: 900, s: 1.5, r: 8 },
  { kind: "animal", id: "duck", x: 470, y: 862, s: 1.15, r: -6 },
  // far right — desktop only
  { kind: "animal", id: "lion", x: 2108, y: 318, s: 1.4, r: 8 },
  { kind: "veg", id: "tomato", x: 2420, y: 470, s: 1.45, r: -9 },
  { kind: "num", id: "7", x: 2330, y: 760, s: 1.2, r: 10 },
  { kind: "veg", id: "pumpkin", x: 2440, y: 980, s: 1.4, r: 6 },
  { kind: "animal", id: "frog", x: 2130, y: 960, s: 1.3, r: -7 },
  // just outside the safe band, above and below — tablet sees these
  { kind: "veg", id: "corn", x: 760, y: 176, s: 1.15, r: -12 },
  { kind: "num", id: "1", x: 1080, y: 150, s: 1.0, r: 8 },
  { kind: "animal", id: "penguin", x: 1450, y: 158, s: 1.1, r: -6 },
  { kind: "veg", id: "eggplant", x: 1790, y: 172, s: 1.1, r: 9 },
  { kind: "animal", id: "fish", x: 800, y: 1246, s: 1.05, r: -8 },
  { kind: "veg", id: "peas", x: 1160, y: 1268, s: 1.0, r: 7 },
  { kind: "num", id: "12", x: 1500, y: 1254, s: 0.95, r: -9 },
  { kind: "animal", id: "owl", x: 1810, y: 1246, s: 1.05, r: 6 },
];

const CastItem: React.FC<{ c: Cast }> = ({ c }) => {
  const Art =
    c.kind === "veg"
      ? VEGGIE_ART[c.id as VeggieId]
      : c.kind === "animal"
      ? ANIMAL_ART[c.id]
      : NUMBER_ART[c.id];
  return (
    <g transform={`translate(${c.x} ${c.y}) rotate(${c.r}) scale(${c.s})`}>
      <Art />
    </g>
  );
};

const TITLE: [string, string][] = [
  ["#ef8a3c", "#c96a22"],
  ["#ea5b52", "#c23f38"],
  ["#4a9450", "#357038"],
  ["#f3c93f", "#cfa423"],
  ["#5aa0c8", "#3d7a9e"],
  ["#8b58b3", "#6b3d92"],
];

const Word: React.FC<{ text: string; size: number; offset?: number }> = ({
  text,
  size,
  offset = 0,
}) => (
  <span style={{ display: "inline-flex" }}>
    {text.split("").map((ch, i) => {
      const [fill, shade] = TITLE[(i + offset) % TITLE.length];
      const tilt = (i % 2 === 0 ? -1 : 1) * (2 + (i % 3));
      return (
        <span
          key={i}
          style={{
            fontFamily: fonts.script,
            fontWeight: 800,
            fontSize: size,
            lineHeight: 0.94,
            color: fill,
            WebkitTextStroke: `${size * 0.07}px ${shade}`,
            paintOrder: "stroke fill",
            textShadow: `0 ${size * 0.05}px 0 ${shade}, 0 ${size * 0.09}px ${
              size * 0.08
            }px rgba(60,45,35,.3)`,
            transform: `rotate(${tilt}deg)`,
            display: "inline-block",
            margin: `0 -${size * 0.012}px`,
          }}
        >
          {ch}
        </span>
      );
    })}
  </span>
);

export const Banner: React.FC<{ guides?: boolean }> = ({ guides = false }) => {
  loadVeggieFonts();
  return (
    <AbsoluteFill style={{ width: W, height: H, overflow: "hidden" }}>
      <SceneFilters />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <VeggieDefs />
        <AnimalDefs />
        <defs>
          <linearGradient id="bannerSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={sky.top} />
            <stop offset="100%" stopColor={sky.bottom} />
          </linearGradient>
          <linearGradient id="bannerGrass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ground.grassTop} />
            <stop offset="100%" stopColor={ground.grassBottom} />
          </linearGradient>
        </defs>

        <rect width={W} height={H} fill="url(#bannerSky)" />
        <Cloud x={470} y={520} s={1.2} />
        <Cloud x={2060} y={620} s={1.05} o={0.8} />
        <Cloud x={1280} y={392} s={0.8} o={0.55} />
        <Sun x={2404} y={150} s={1.06} />

        <Hill x={-140} y={GROUND_Y} w={1100} h={340} tone="dark" />
        <Hill x={1700} y={GROUND_Y} w={1100} h={300} tone="lite" />
        <rect x={0} y={GROUND_Y} width={W} height={H - GROUND_Y} fill="url(#bannerGrass)" />

        {CAST.map((c, i) => (
          <CastItem key={i} c={c} />
        ))}

        <g transform={`translate(2010 ${GROUND_Y + 116}) scale(1.5)`}>
          <Crocodile chomp={0.12} step={1.2} />
        </g>
      </svg>

      {/* ── everything below lives inside the mobile-safe band ── */}
      <div
        style={{
          position: "absolute",
          left: SAFE_X,
          top: SAFE_Y,
          width: SAFE_W,
          height: SAFE_H,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
        }}
      >
        <div style={{ display: "flex", gap: 34, alignItems: "flex-start" }}>
          <Word text="CHOMP" size={168} />
          <Word text="CHOMP" size={168} offset={3} />
        </div>
        <div
          style={{
            fontFamily: fonts.display,
            fontSize: 62,
            color: "#ffffff",
            letterSpacing: 2,
            textShadow: "0 4px 0 rgba(90,110,90,.35), 0 8px 18px rgba(70,90,70,.3)",
            whiteSpace: "nowrap",
          }}
        >
          Guess the shadow &middot; Learn the word
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 6,
          }}
        >
          {["Fruit", "Veggies", "Animals", "Numbers"].map((t, i) => (
            <span
              key={t}
              style={{
                fontFamily: fonts.display,
                fontSize: 38,
                color: "#ffffff",
                background: [
                  "#ea5b52",
                  "#4a9450",
                  "#ef8a3c",
                  "#5aa0c8",
                ][i],
                border: "5px solid rgba(255,255,255,.85)",
                borderRadius: 999,
                padding: "6px 30px 10px",
                boxShadow: "0 6px 0 rgba(60,45,35,.22)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {guides ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <rect x={SAFE_X} y={SAFE_Y} width={SAFE_W} height={SAFE_H} fill="none" stroke="#ff2d6f" strokeWidth={5} strokeDasharray="22 16" />
          <rect x={(W - TABLET_W) / 2} y={SAFE_Y} width={TABLET_W} height={SAFE_H} fill="none" stroke="#2d7dff" strokeWidth={5} strokeDasharray="22 16" />
          <rect x={0} y={SAFE_Y} width={W} height={SAFE_H} fill="none" stroke="#00b37a" strokeWidth={5} strokeDasharray="22 16" />
          <text x={SAFE_X + 12} y={SAFE_Y - 20} fill="#ff2d6f" fontSize={34} fontFamily={fonts.display}>
            phone 1546&times;423
          </text>
          <text x={(W - TABLET_W) / 2 + 12} y={SAFE_Y + SAFE_H + 52} fill="#2d7dff" fontSize={34} fontFamily={fonts.display}>
            tablet 1855&times;423
          </text>
          <text x={20} y={SAFE_Y - 20} fill="#00b37a" fontSize={34} fontFamily={fonts.display}>
            desktop 2560&times;423
          </text>
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};

export const BannerGuides: React.FC = () => <Banner guides />;
