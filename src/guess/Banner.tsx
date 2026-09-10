import React from "react";
import { AbsoluteFill } from "remotion";
import { ANIMAL_ART, AnimalDefs } from "../animals/animals";
import { VeggieDefs, VEGGIE_ART, type VeggieId } from "../veggies/veggies";
import { Crocodile } from "./critters";
import { loadVeggieFonts } from "./fonts";
import { bushes, fonts, ground, sky, sun as sunC } from "./palette";
import { SceneFilters } from "./scene";

/**
 * YouTube channel banner, 2560x1440.
 *
 * YouTube crops this hard: phones only ever show the centred 1546x423
 * band, so the whole message lives in there and nothing outside it carries
 * meaning — the field around it is scenery that only desktop sees. Kept
 * deliberately plain so the words are the loudest thing on it.
 */

const W = 2560;
const H = 1440;
const SAFE_W = 1546;
const SAFE_H = 423;
const TABLET_W = 1855;
const SAFE_X = (W - SAFE_W) / 2;
const SAFE_Y = (H - SAFE_H) / 2;

const HILL_Y = 1180;

const CHIPS: [string, string][] = [
  ["Learning", "#ea5b52"],
  ["Nursery Rhymes", "#4a9450"],
  ["Stories", "#5aa0c8"],
];

/** Cast members, kept sparse and pushed to the outer edges. */
const CAST: { kind: "veg" | "animal"; id: string; x: number; y: number; s: number; r: number }[] = [
  { kind: "veg", id: "carrot", x: 190, y: 470, s: 1.5, r: -10 },
  { kind: "animal", id: "cow", x: 250, y: 940, s: 1.35, r: 6 },
  { kind: "animal", id: "duck", x: 560, y: 1030, s: 1.1, r: -6 },
  { kind: "animal", id: "lion", x: 2330, y: 470, s: 1.45, r: 8 },
  { kind: "veg", id: "tomato", x: 2300, y: 960, s: 1.35, r: -8 },
  { kind: "animal", id: "frog", x: 2010, y: 1030, s: 1.2, r: 6 },
];

const Word: React.FC<{ text: string; size: number }> = ({ text, size }) => {
  const colors: [string, string][] = [
    ["#ef8a3c", "#c96a22"],
    ["#ea5b52", "#c23f38"],
    ["#4a9450", "#357038"],
    ["#f3c93f", "#cfa423"],
    ["#5aa0c8", "#3d7a9e"],
    ["#8b58b3", "#6b3d92"],
  ];
  return (
    <span style={{ display: "inline-flex" }}>
      {text.split("").map((ch, i) => {
        if (ch === " ") return <span key={i} style={{ width: size * 0.28 }} />;
        const [fill, shade] = colors[i % colors.length];
        const tilt = (i % 2 === 0 ? -1 : 1) * (1.6 + (i % 2));
        return (
          <span
            key={i}
            style={{
              fontFamily: fonts.script,
              fontWeight: 800,
              fontSize: size,
              lineHeight: 0.96,
              color: fill,
              WebkitTextStroke: `${size * 0.072}px ${shade}`,
              paintOrder: "stroke fill",
              textShadow: `0 ${size * 0.05}px 0 ${shade}, 0 ${size * 0.09}px ${
                size * 0.08
              }px rgba(60,45,35,.28)`,
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
};

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

        <g filter="url(#chalk)" fill="#ffffff" opacity={0.8}>
          <ellipse cx={520} cy={330} rx={150} ry={32} />
          <ellipse cx={470} cy={306} rx={70} ry={44} />
          <ellipse cx={2020} cy={300} rx={130} ry={28} />
          <ellipse cx={1980} cy={280} rx={62} ry={38} />
        </g>

        {/* sun, far corner — nothing important lives out here */}
        <g transform="translate(2400 220)">
          <g filter="url(#wobble)">
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return (
                <line
                  key={i}
                  x1={Math.cos(a) * 78}
                  y1={Math.sin(a) * 78}
                  x2={Math.cos(a) * (78 + (i % 2 ? 28 : 42))}
                  y2={Math.sin(a) * (78 + (i % 2 ? 28 : 42))}
                  stroke={sunC.ray}
                  strokeWidth={8}
                  strokeLinecap="round"
                />
              );
            })}
          </g>
          <circle r={70} fill={sunC.body} filter="url(#chalk)" />
          <path d="M -30 -6 q 11 -15 22 0 M 8 -6 q 11 -15 22 0" stroke={sunC.face} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M -13 15 q 13 15 26 0" stroke={sunC.face} strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>

        {/* one soft hill, low enough to stay clear of the type */}
        <path
          d={`M -100 ${HILL_Y + 60} q 700 -230 1330 -40 q 640 190 1430 -20 L ${W + 100} ${H} L -100 ${H} Z`}
          fill={bushes.liteFill}
          stroke={bushes.liteLine}
          strokeWidth={10}
          filter="url(#wobble)"
        />
        <rect x={0} y={HILL_Y + 128} width={W} height={H - HILL_Y - 128} fill="url(#bannerGrass)" />

        {CAST.map((c, i) => {
          const Art =
            c.kind === "veg" ? VEGGIE_ART[c.id as VeggieId] : ANIMAL_ART[c.id];
          return (
            <g
              key={i}
              transform={`translate(${c.x} ${c.y}) rotate(${c.r}) scale(${c.s})`}
            >
              <Art />
            </g>
          );
        })}

        <g transform={`translate(1560 ${H - 118}) scale(1.22)`}>
          <Crocodile chomp={0.12} step={1.2} />
        </g>
      </svg>

      {/* ── the whole message, inside the mobile-safe band ── */}
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
          gap: 30,
        }}
      >
        <div style={{ display: "flex", gap: 22 }}>
          {CHIPS.map(([label, colour]) => (
            <span
              key={label}
              style={{
                fontFamily: fonts.display,
                fontSize: 56,
                color: "#ffffff",
                background: colour,
                border: "6px solid rgba(255,255,255,.9)",
                borderRadius: 999,
                padding: "10px 40px 16px",
                boxShadow: "0 8px 0 rgba(60,45,35,.2)",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <Word text="Kids fun with Pebblo" size={146} />
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
          <text x={20} y={SAFE_Y - 20} fill="#00b37a" fontSize={34} fontFamily={fonts.display}>
            desktop 2560&times;423
          </text>
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};

export const BannerGuides: React.FC = () => <Banner guides />;
