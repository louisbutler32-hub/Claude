import React from "react";
import { AbsoluteFill } from "remotion";
import { Board, Item } from "../guess/Board";
import { Crocodile } from "../guess/critters";
import { loadVeggieFonts } from "../guess/fonts";
import { fonts } from "../guess/palette";
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
} from "../guess/scene";
import { VeggieDefs, type VeggieId } from "./veggies";
import { veggieSubject } from "./subject";

/**
 * Thumbnails. Both are built from the same art the video uses, so a frame
 * grab and the thumbnail can never drift apart.
 *
 *  A — the format's hook: three shadows and a question
 *  B — the payoff: the finished board, "can you name all twelve?"
 */

/** Chunky title type: coloured fill, dark keyline, hard drop shadow. */
const PunchLine: React.FC<{
  text: string;
  colors: [string, string][];
  size: number;
  top: number;
  /** damp the per-letter tilt — helps small text hold its shape */
  steady?: boolean;
}> = ({ text, colors, size, top, steady = false }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 0,
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-end",
      pointerEvents: "none",
    }}
  >
    {text.split("").map((ch, i) => {
      if (ch === " ") {
        return <span key={i} style={{ width: size * 0.26 }} />;
      }
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
            WebkitTextStroke: `${size * (steady ? 0.115 : 0.075)}px ${shade}`,
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

/** The big white question mark that sells the format. */
const QMark: React.FC<{ x: number; y: number; size: number; rot?: number }> = ({
  x,
  y,
  size,
  rot = -8,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `translate(-50%, -50%) rotate(${rot}deg)`,
      fontFamily: fonts.script,
      fontWeight: 800,
      fontSize: size,
      lineHeight: 1,
      color: "#ffffff",
      WebkitTextStroke: `${size * 0.07}px #2f5d2a`,
      paintOrder: "stroke fill",
      textShadow: `0 ${size * 0.05}px 0 #2f5d2a, 0 ${size * 0.09}px ${
        size * 0.08
      }px rgba(40,60,30,.4)`,
      pointerEvents: "none",
    }}
  >
    ?
  </div>
);

/** White on a heavy dark keyline: the most legible pairing on pale sky. */
const KICKER_COLORS: [string, string][] = [["#ffffff", "#2f5d2a"]];

const TITLE_COLORS: [string, string][] = [
  ["#ef8a3c", "#c96a22"],
  ["#ea5b52", "#c23f38"],
  ["#4a9450", "#357038"],
  ["#f3c93f", "#cfa423"],
  ["#8b58b3", "#6b3d92"],
  ["#5da648", "#427f33"],
];

/* ------------------------------------------------------------------ */
/* A — three shadows and a question                                    */
/* ------------------------------------------------------------------ */

const HERO: { id: VeggieId; x: number; scale: number }[] = [
  { id: "carrot", x: 430, scale: 2.35 },
  { id: "broccoli", x: 960, scale: 2.5 },
  { id: "tomato", x: 1490, scale: 2.5 },
];

export const ThumbnailA: React.FC = () => {
  loadVeggieFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#dceaee", overflow: "hidden" }}>
      <SceneFilters />
      <Sky />
      <Clouds />
      <Sun happy />
      <Grass />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <Bush x={-90} y={GROUND_Y - 300} w={820} h={300} tone="dark" seed={2} />
        <Bush x={1180} y={GROUND_Y - 268} w={840} h={268} tone="lite" seed={6} />
      </svg>

      {/* the three shadows */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <VeggieDefs />
        {HERO.map((h) => (
          <Item
            key={h.id}
            subject={veggieSubject}
            id={h.id}
            x={h.x}
            y={700}
            size={h.scale}
            sil
          />
        ))}
      </svg>

      <QMark x={640} y={470} size={200} rot={-12} />
      <QMark x={1246} y={556} size={226} rot={10} />
      <QMark x={1770} y={560} size={170} rot={-6} />

      <PunchLine text="GUESS THE" colors={KICKER_COLORS} size={150} top={40} steady />
      <PunchLine text="VEGGIE!" colors={TITLE_COLORS} size={224} top={176} />

      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(240 ${H - 96}) scale(1.02)`}>
          <Crocodile chomp={0.1} step={1.1} />
        </g>
      </svg>

      <PaperGrain opacity={0.12} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* B — the finished board                                              */
/* ------------------------------------------------------------------ */

export const ThumbnailB: React.FC = () => {
  loadVeggieFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#dceaee", overflow: "hidden" }}>
      <SceneFilters />
      <Sky />
      <Clouds />
      <Sun happy />
      <Grass tulips />
      <div style={{ position: "absolute", inset: 0, transform: "translateY(-16px) scale(0.85)" }}>
        <Board
          subject={veggieSubject}
          solved={veggieSubject.boardOrder}
          riseAt={-100}
          popAt={-100}
          landAt={-100}
          exitAt={100000}
        />
      </div>

      <PunchLine text="CAN YOU NAME ALL 12?" colors={TITLE_COLORS} size={136} top={802} />

      <PaperGrain opacity={0.12} />
    </AbsoluteFill>
  );
};
