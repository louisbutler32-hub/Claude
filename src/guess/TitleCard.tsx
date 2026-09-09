import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Item } from "./Board";
import { Crocodile } from "./critters";
import { fonts } from "./palette";
import { H, W } from "./scene";
import type { GuessSubject } from "./types";

/** "Chomp Chomp <SUBJECT>", each letter painted a different colour. */
export const TitleCard: React.FC<{ subject: GuessSubject }> = ({ subject }) => {
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
  const letters = subject.titleWord.split("");
  // long words need smaller type to stay on one line
  const size = Math.min(300, Math.round(2100 / Math.max(letters.length, 5)));

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <subject.Defs />
        <defs>
          <linearGradient id="titleSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dfeff2" />
            <stop offset="100%" stopColor="#e8f2e0" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#titleSky)" />

        {subject.ringItems.map((v, i) => {
          const pop = spring({
            frame: frame - 4 - i * 1.6,
            fps,
            config: { damping: 11, mass: 0.45, stiffness: 160 },
          });
          return (
            <Item
              key={i}
              subject={subject}
              id={v.id}
              x={v.x}
              y={v.y}
              size={v.s * (0.6 + pop * 0.4)}
              rotate={v.r}
              opacity={pop}
            />
          );
        })}

        <g
          transform={`translate(1560 960) scale(${1.05 * chomp})`}
          opacity={chomp}
        >
          <Crocodile chomp={0.15} step={frame / 5} />
        </g>

        <g
          transform={`translate(960 470) scale(${0.86 + banner * 0.14})`}
          opacity={banner}
        >
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
        {letters.map((ch, i) => {
          const pop = spring({
            frame: frame - 10 - i * 3,
            fps,
            config: { damping: 10, mass: 0.5, stiffness: 170 },
          });
          const [fill, shade] =
            subject.titleLetters[i % subject.titleLetters.length];
          const tilt = (i % 2 === 0 ? -1 : 1) * (3 + (i % 3));
          return (
            <span
              key={i}
              style={{
                fontFamily: fonts.script,
                fontSize: size,
                lineHeight: 0.95,
                fontWeight: 800,
                color: fill,
                WebkitTextStroke: `${size * 0.033}px ${shade}`,
                paintOrder: "stroke fill",
                textShadow: `0 ${size * 0.047}px 0 ${shade}, 0 ${
                  size * 0.073
                }px ${size * 0.087}px rgba(90,50,40,0.3)`,
                transform: `translateY(${(1 - pop) * 90}px) scale(${
                  0.5 + pop * 0.5
                }) rotate(${tilt}deg)`,
                opacity: Math.min(1, pop * 1.5),
                display: "inline-block",
                margin: "0 -6px",
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
    </div>
  );
};
