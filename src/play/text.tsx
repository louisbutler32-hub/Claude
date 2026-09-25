import React from "react";
import { continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * The on-screen words of the interactive Shorts, in the reference's
 * handwritten marker style: a chunky friendly face, an instruction at the
 * top, a red hand-drawn countdown under it, and one big payoff word at the
 * end ("BRAVO!!", "WINNER!").
 */

let started = false;
export const loadPlayFonts = () => {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("loading play fonts");
  const faces = [
    new FontFace("ComicRelief", `url(${staticFile("fonts/ComicRelief.ttf")}) format("truetype")`, { weight: "400" }),
    new FontFace("Fredoka", `url(${staticFile("fonts/Fredoka-SemiBold.ttf")}) format("truetype")`, { weight: "600" }),
  ];
  Promise.all(faces.map((f) => f.load().then((l) => document.fonts.add(l))))
    .then(() => continueRender(handle))
    .catch(() => continueRender(handle));
};

export const HAND = "'ComicRelief', 'Comic Sans MS', 'Fredoka', system-ui, sans-serif";

/** Outlined marker text: `fill` inside, `line` as a thick stroke behind it. */
export const Marker: React.FC<{
  text: string;
  size: number;
  fill?: string;
  line?: string;
  lineW?: number;
  x?: number;
  y: number;
  opacity?: number;
  scale?: number;
  rotate?: number;
  weight?: number;
  letterSpacing?: number;
}> = ({ text, size, fill = "#ffffff", line = "#2b2530", lineW = size * 0.11, x = 540, y, opacity = 1, scale = 1, rotate = 0, weight = 700, letterSpacing = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotate}deg)`,
      fontFamily: HAND,
      fontSize: size,
      fontWeight: weight,
      lineHeight: 1,
      whiteSpace: "nowrap",
      letterSpacing,
      color: fill,
      WebkitTextStroke: `${lineW}px ${line}`,
      paintOrder: "stroke fill",
      opacity,
      pointerEvents: "none",
    }}
  >
    {text}
  </div>
);

/**
 * The instruction line. Pops in with a little bounce, holds, fades out.
 */
export const Headline: React.FC<{ text: string; from: number; until: number; y?: number; dark?: boolean; size?: number }> = ({
  text,
  from,
  until,
  y = 560,
  dark = false,
  size = 66,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < from || frame > until + 12) return null;
  const s = spring({ frame: frame - from, fps, config: { damping: 12, mass: 0.6, stiffness: 140 } });
  const fade = interpolate(frame, [until, until + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Marker
      text={text}
      size={size}
      y={y}
      fill={dark ? "#2b2530" : "#ffffff"}
      line={dark ? "#ffffff" : "#2b2530"}
      lineW={size * 0.12}
      opacity={fade}
      scale={0.8 + 0.2 * s}
    />
  );
};

/**
 * The red hand-drawn count. `marks` are [frame, word] pairs; each word pops
 * in on its frame and holds until the next one (the last until `end`).
 */
export const Countdown: React.FC<{ marks: [number, string][]; end: number; y?: number; size?: number; gap?: number }> = ({
  marks,
  end,
  y = 680,
  size = 120,
  gap = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let i = -1;
  for (let k = 0; k < marks.length; k++) if (frame >= marks[k][0]) i = k;
  if (i < 0 || frame >= end) return null;
  const until = i + 1 < marks.length ? marks[i + 1][0] - gap : end;
  if (frame >= until) return null;
  const local = frame - marks[i][0];
  const s = spring({ frame: local, fps, config: { damping: 9, mass: 0.5, stiffness: 220 } });
  const word = marks[i][1];
  return (
    <Marker
      text={word}
      size={word.length > 2 ? size * 1.05 : size}
      y={y}
      fill="#e3363f"
      line="#ffffff"
      lineW={size * 0.09}
      scale={0.55 + 0.45 * s}
      rotate={(i % 2 ? 1 : -1) * 4}
    />
  );
};

/** The payoff word — "WINNER!", "BRAVO!!" — gold on a dark keyline. */
export const Payoff: React.FC<{
  text: string;
  from: number;
  y?: number;
  size?: number;
  emoji?: string;
  fill?: string;
  line?: string;
}> = ({ text, from, y = 520, size = 108, emoji, fill = "#f7c948", line = "#3a2a10" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < from) return null;
  const s = spring({ frame: frame - from, fps, config: { damping: 9, mass: 0.6, stiffness: 180 } });
  const wob = Math.sin((frame - from) / 6) * 2 * Math.max(0, 1 - (frame - from) / 40);
  return (
    <>
      <Marker text={text} size={size} y={y} fill={fill} line={line} lineW={size * 0.1} scale={0.5 + 0.5 * s} rotate={wob} />
      {emoji ? (
        <div
          style={{
            position: "absolute",
            left: 540 + text.length * size * 0.3 + 30,
            top: y,
            transform: `translate(-50%, -50%) scale(${0.5 + 0.5 * s})`,
            fontSize: size * 0.8,
            lineHeight: 1,
          }}
        >
          {emoji}
        </div>
      ) : null}
    </>
  );
};
