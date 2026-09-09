import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts } from "./palette";
import { H, W } from "./scene";
import { Crocodile } from "./critters";
import { Veggie, VeggieDefs, type VeggieId } from "./veggies";

/**
 * The opening card: "Chomp Chomp VEGGIES", each letter painted as a
 * different vegetable, ringed by the cast.
 */

type Letter = { ch: string; fill: string; shade: string };

const LETTERS: Letter[] = [
  { ch: "V", fill: "#ef8a3c", shade: "#c96a22" }, // carrot
  { ch: "E", fill: "#ea5b52", shade: "#c23f38" }, // tomato
  { ch: "G", fill: "#4a9450", shade: "#357038" }, // broccoli
  { ch: "G", fill: "#f3c93f", shade: "#cfa423" }, // corn
  { ch: "I", fill: "#ea5a4d", shade: "#c23f38" }, // pepper
  { ch: "E", fill: "#8b58b3", shade: "#6b3d92" }, // eggplant
  { ch: "S", fill: "#5da648", shade: "#427f33" }, // cucumber
];

/** Kawaii produce ringing the card. */
const RING: { id: VeggieId; x: number; y: number; s: number; r: number }[] = [
  // left edge
  { id: "broccoli", x: 92, y: 118, s: 0.95, r: -8 },
  { id: "carrot", x: 78, y: 430, s: 0.9, r: -14 },
  { id: "peas", x: 118, y: 700, s: 0.8, r: 8 },
  { id: "onion", x: 96, y: 930, s: 0.82, r: -6 },
  // top edge
  { id: "tomato", x: 360, y: 62, s: 0.82, r: 6 },
  { id: "cucumber", x: 640, y: 76, s: 0.7, r: -18 },
  { id: "corn", x: 950, y: 60, s: 0.8, r: 9 },
  { id: "eggplant", x: 1250, y: 66, s: 0.78, r: -7 },
  { id: "mushroom", x: 1520, y: 84, s: 0.76, r: 5 },
  // right edge
  { id: "pumpkin", x: 1810, y: 210, s: 0.95, r: 7 },
  { id: "pepper", x: 1830, y: 520, s: 0.88, r: -9 },
  { id: "potato", x: 1806, y: 780, s: 0.84, r: 12 },
  // bottom edge
  { id: "carrot", x: 300, y: 980, s: 0.78, r: 16 },
  { id: "tomato", x: 560, y: 1020, s: 0.72, r: -10 },
  { id: "broccoli", x: 820, y: 1010, s: 0.74, r: 6 },
  { id: "corn", x: 1075, y: 1000, s: 0.7, r: -12 },
  { id: "peas", x: 1330, y: 1020, s: 0.66, r: 9 },
];

export const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const banner = spring({
    frame: frame - 2,
    fps,
    config: { damping: 13, mass: 0.7, stiffness: 110 },
  });
  const chomp = spring({
    frame: frame - 6,
    fps,
    config: { damping: 12, mass: 0.6 },
  });

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <VeggieDefs />
        <defs>
          <linearGradient id="titleSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dfeff2" />
            <stop offset="100%" stopColor="#e8f2e0" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#titleSky)" />

        {/* ring of produce */}
        {RING.map((v, i) => {
          const pop = spring({
            frame: frame - 4 - i * 1.6,
            fps,
            config: { damping: 11, mass: 0.45, stiffness: 160 },
          });
          return (
            <Veggie
              key={i}
              id={v.id}
              x={v.x}
              y={v.y}
              size={v.s * (0.6 + pop * 0.4)}
              rotate={v.r}
              opacity={pop}
            />
          );
        })}

        {/* the crocodile, bottom right */}
        <g
          transform={`translate(1560 960) scale(${1.05 * chomp})`}
          opacity={chomp}
        >
          <Crocodile chomp={0.15} step={frame / 5} />
        </g>

        {/* banner */}
        <g transform={`translate(960 470) scale(${0.86 + banner * 0.14})`} opacity={banner}>
          <rect
            x={-760}
            y={-330}
            width={1520}
            height={620}
            rx={90}
            fill="#c05a52"
            opacity={0.92}
            filter="url(#wobble)"
          />
          <rect
            x={-700}
            y={-70}
            width={1400}
            height={200}
            rx={30}
            fill="#e6efe4"
            opacity={0.5}
          />
        </g>
      </svg>

      {/* "Chomp Chomp" */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          top: 202,
          textAlign: "center",
          fontFamily: fonts.script,
          fontSize: 118,
          color: "#ffffff",
          letterSpacing: 4,
          textShadow: "0 6px 0 rgba(120,50,45,0.35)",
          opacity: chomp,
          transform: `translateY(${(1 - chomp) * -30}px)`,
        }}
      >
        Chomp Chomp
      </div>

      {/* "VEGGIES" */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          top: 326,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        {LETTERS.map((l, i) => {
          const pop = spring({
            frame: frame - 10 - i * 3,
            fps,
            config: { damping: 10, mass: 0.5, stiffness: 170 },
          });
          const tilt = (i % 2 === 0 ? -1 : 1) * (3 + (i % 3));
          return (
            <span
              key={i}
              style={{
                fontFamily: fonts.script,
                fontSize: 300,
                lineHeight: 0.95,
                fontWeight: 800,
                color: l.fill,
                WebkitTextStroke: `10px ${l.shade}`,
                paintOrder: "stroke fill",
                textShadow: `0 14px 0 ${l.shade}, 0 22px 26px rgba(90,50,40,0.3)`,
                transform: `translateY(${(1 - pop) * 90}px) scale(${
                  0.5 + pop * 0.5
                }) rotate(${tilt}deg)`,
                opacity: Math.min(1, pop * 1.5),
                display: "inline-block",
                margin: "0 -6px",
              }}
            >
              {l.ch}
            </span>
          );
        })}
      </div>
    </div>
  );
};
