import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Crocodile } from "../guess/critters";
import { loadVeggieFonts } from "../guess/fonts";
import { Confetti, Sparkles } from "../guess/fx";
import { fonts, ground, sky, sun as sunC } from "../guess/palette";
import { SceneFilters } from "../guess/scene";
import { VeggieDefs, VEGGIE_ART } from "../veggies/veggies";
import { NUMBER_COLORS } from "./numbers";

/**
 * "Count to 10" — a vertical Short.
 *
 * One straight run from one to ten: a carrot drops in, the numeral counts
 * up with it, and the tally builds. Thirty seconds, no rounds, no board —
 * the long-form beat sheet doesn't fit a Short and shouldn't be forced in.
 */

const W = 1080;
const H = 1920;
export const SHORT_FPS = 30;

/** Frame the counting starts, and how long each number holds. */
export const HOOK_LEN = 60;
export const STEP = 60;
export const COUNT_N = 10;
const COUNT_END = HOOK_LEN + COUNT_N * STEP; // 660
const CELEBRATE = COUNT_END;
const OUTRO = COUNT_END + 120;
export const SHORT_FRAMES = OUTRO + 120; // 900 = 30s

const GRASS_Y = 1520;

/** Ten slots, two rows of five. */
const slot = (i: number) => ({
  x: 150 + (i % 5) * 195,
  y: i < 5 ? 900 : 1170,
});

const Sky: React.FC = () => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <linearGradient id="shortSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={sky.top} />
        <stop offset="100%" stopColor={sky.bottom} />
      </linearGradient>
      <linearGradient id="shortGrass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={ground.grassTop} />
        <stop offset="100%" stopColor={ground.grassBottom} />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#shortSky)" />
    <g filter="url(#chalk)" fill="#ffffff" opacity={0.85}>
      <ellipse cx={210} cy={430} rx={130} ry={34} />
      <ellipse cx={170} cy={404} rx={62} ry={40} />
      <ellipse cx={860} cy={640} rx={112} ry={30} />
      <ellipse cx={820} cy={614} rx={54} ry={36} />
    </g>
    <rect x={0} y={GRASS_Y} width={W} height={H - GRASS_Y} fill="url(#shortGrass)" />
    {Array.from({ length: 26 }, (_, i) => {
      const bx = 20 + i * 42 + random(`sg${i}`) * 18;
      const by = GRASS_Y + 40 + random(`sgy${i}`) * 220;
      return (
        <g key={i} stroke={ground.blade} strokeWidth={5} strokeLinecap="round" opacity={0.75}>
          <line x1={bx} y1={by} x2={bx - 8} y2={by - 34} />
          <line x1={bx + 11} y1={by} x2={bx + 18} y2={by - 27} />
        </g>
      );
    })}
    {/* sun */}
    <g transform="translate(900 250)">
      <g filter="url(#wobble)">
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={Math.cos(a) * 70}
              y1={Math.sin(a) * 70}
              x2={Math.cos(a) * (70 + (i % 2 ? 26 : 38))}
              y2={Math.sin(a) * (70 + (i % 2 ? 26 : 38))}
              stroke={sunC.ray}
              strokeWidth={7}
              strokeLinecap="round"
            />
          );
        })}
      </g>
      <circle r={62} fill={sunC.body} filter="url(#chalk)" />
      <path d="M -28 -6 q 10 -14 20 0 M 8 -6 q 10 -14 20 0" stroke={sunC.face} strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M -12 14 q 12 14 24 0" stroke={sunC.face} strokeWidth={6} fill="none" strokeLinecap="round" />
    </g>
  </svg>
);

const Headline: React.FC<{ text: string; y: number; size: number; start: number }> = ({
  text,
  y,
  size,
  start,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - start, fps, config: { damping: 11, mass: 0.5, stiffness: 170 } });
  if (s <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 0,
        width: "100%",
        textAlign: "center",
        fontFamily: fonts.script,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1,
        color: "#ffffff",
        WebkitTextStroke: `${size * 0.075}px #3d5c34`,
        paintOrder: "stroke fill",
        textShadow: `0 ${size * 0.05}px 0 #3d5c34`,
        transform: `scale(${0.6 + s * 0.4})`,
      }}
    >
      {text}
    </div>
  );
};

export const CountingShort: React.FC = () => {
  loadVeggieFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const counted = Math.max(
    0,
    Math.min(COUNT_N, Math.floor((frame - HOOK_LEN) / STEP) + 1)
  );
  const current = Math.max(1, counted);
  const [fill, shade] = NUMBER_COLORS[current];
  const Carrot = VEGGIE_ART.carrot;

  // the numeral punches on each new count
  const punch = spring({
    frame: frame - (HOOK_LEN + (counted - 1) * STEP),
    fps,
    config: { damping: 8, mass: 0.4, stiffness: 220 },
  });
  const numScale = counted > 0 ? 1 + Math.sin(punch * Math.PI) * 0.18 : 0;

  const inCount = frame >= HOOK_LEN && frame < CELEBRATE;
  const done = frame >= CELEBRATE;

  return (
    <AbsoluteFill style={{ backgroundColor: sky.bottom }}>
      <Audio src={staticFile("audio/short-mix.mp3")} />
      <SceneFilters />
      <Sky />

      {frame < HOOK_LEN ? (
        <Headline text="Can you count" y={520} size={124} start={0} />
      ) : null}
      {frame < HOOK_LEN ? (
        <Headline text="to TEN?" y={680} size={168} start={8} />
      ) : null}

      {/* the numeral */}
      {counted > 0 && frame < OUTRO ? (
        <div
          style={{
            position: "absolute",
            top: 300,
            left: 0,
            width: "100%",
            textAlign: "center",
            fontFamily: fonts.script,
            fontWeight: 800,
            fontSize: 380,
            lineHeight: 1,
            color: fill,
            WebkitTextStroke: `28px ${shade}`,
            paintOrder: "stroke fill",
            textShadow: `0 22px 0 ${shade}`,
            transform: `scale(${numScale})`,
          }}
        >
          {current}
        </div>
      ) : null}

      {/* the carrots, one per count */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <VeggieDefs />
        {Array.from({ length: COUNT_N }, (_, i) => {
          const pop = spring({
            frame: frame - HOOK_LEN - i * STEP,
            fps,
            config: { damping: 9, mass: 0.45, stiffness: 200 },
          });
          if (pop <= 0.001) return null;
          const p = slot(i);
          const wiggle = done ? Math.sin(frame / 6 + i) * 5 : 0;
          return (
            <g
              key={i}
              transform={`translate(${p.x} ${p.y + (1 - pop) * -170}) rotate(${wiggle}) scale(${
                0.72 * (0.5 + pop * 0.5)
              })`}
              opacity={Math.min(1, pop * 2)}
            >
              <Carrot />
            </g>
          );
        })}
      </svg>

      {done ? (
        <>
          <Headline text="TEN carrots!" y={1330} size={116} start={CELEBRATE + 6} />
          <Sparkles start={CELEBRATE} cx={540} cy={1000} spread={520} count={16} size={1.5} />
          <Confetti start={CELEBRATE + 4} count={80} />
        </>
      ) : null}
      {frame >= OUTRO ? (
        <Headline text="You did it!" y={330} size={168} start={OUTRO} />
      ) : null}

      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(742 ${H - 178}) scale(1.5)`}>
          <Crocodile chomp={0.12} step={frame / 6} />
        </g>
      </svg>

      {/* keeps the count readable while the confetti falls */}
      {inCount ? null : null}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: interpolate(frame, [SHORT_FRAMES - 20, SHORT_FRAMES], [0, 1], {
            extrapolateLeft: "clamp",
          }),
          background: "#ffffff",
        }}
      />
    </AbsoluteFill>
  );
};
