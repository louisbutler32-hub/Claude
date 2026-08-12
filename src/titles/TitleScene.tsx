import React from "react";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  staticFile,
  useVideoConfig,
} from "remotion";
import { PerspectiveTitle, TitleConfig } from "./PerspectiveTitle";
import { Point } from "./perspective";

// ── Scene wiring ───────────────────────────────────────────────────────
//
// Layer order, back to front:
//
//   background plate  →  3D-perspective text  →  foreground subject
//
// The foreground layer is what sells the illusion: whatever you put in it
// passes IN FRONT of the text, so the text reads as sitting inside the
// room rather than stuck on the lens.

const isVideo = (src: string) => /\.(mp4|mov|webm|mkv)$/i.test(src);
const resolve = (src: string) =>
  /^https?:\/\//.test(src) ? src : staticFile(src);

const Plate: React.FC<{ src: string; style?: React.CSSProperties }> = ({
  src,
  style,
}) => {
  const common: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    ...style,
  };
  return isVideo(src) ? (
    <OffthreadVideo src={resolve(src)} style={common} />
  ) : (
    <Img src={resolve(src)} style={common} />
  );
};

const polygonPath = (pts: Point[]) =>
  `polygon(${pts.map(([x, y]) => `${x}px ${y}px`).join(", ")})`;

export type TitleSceneProps = {
  /** Plate behind the text: file in public/ (e.g. "assets/kate.mp4") or a URL.
   *  Omit to get the built-in placeholder set. */
  backgroundSrc?: string;
  /** Alpha cutout (PNG or video with alpha) drawn IN FRONT of the text. */
  occluderSrc?: string;
  /** No cutout handy? Give a polygon in composition px and a second copy of
   *  the plate is drawn on top, clipped to it — same result, no roto app. */
  occluderPolygon?: Point[];
  config: Partial<TitleConfig>;
  /** Second card, if you want the label as its own layer. */
  secondConfig?: Partial<TitleConfig>;
  /** Draw the placeholder figure so the occlusion is visible in the demo. */
  demoOccluder?: boolean;
};

export const TitleScene: React.FC<TitleSceneProps> = ({
  backgroundSrc,
  occluderSrc,
  occluderPolygon,
  config,
  secondConfig,
  demoOccluder,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {/* 1 ── background plate */}
      {backgroundSrc ? (
        <AbsoluteFill>
          <Plate src={backgroundSrc} />
        </AbsoluteFill>
      ) : (
        <PlaceholderPlate />
      )}

      {/* 2 ── the text, living inside the room */}
      <PerspectiveTitle config={config} />
      {secondConfig ? <PerspectiveTitle config={secondConfig} /> : null}

      {/* 3 ── foreground subject, passing in front of the text */}
      {occluderSrc ? (
        <AbsoluteFill
          style={{
            clipPath: occluderPolygon ? polygonPath(occluderPolygon) : undefined,
          }}
        >
          <Plate src={occluderSrc} />
        </AbsoluteFill>
      ) : occluderPolygon && backgroundSrc ? (
        <AbsoluteFill style={{ clipPath: polygonPath(occluderPolygon) }}>
          <Plate src={backgroundSrc} />
        </AbsoluteFill>
      ) : demoOccluder ? (
        <PlaceholderFigure />
      ) : null}

      {/* grade sits above everything so the text picks up the same falloff */}
      <Vignette />
    </AbsoluteFill>
  );
};

// ── Placeholder plate ──────────────────────────────────────────────────
// A CSS-3D stone hall, purely so the compositions render out of the box
// and you can judge the perspective against real receding geometry.
// Swap in your own footage with `backgroundSrc` and delete nothing.

const PlaceholderPlate: React.FC = () => {
  const { width, height } = useVideoConfig();
  const tile = Math.round(width / 9);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(#1b1a17 0%, #2e2b25 55%, #23211c 100%)",
        perspective: 900,
        perspectiveOrigin: `${width / 2}px ${height * 0.42}px`,
        overflow: "hidden",
      }}
    >
      {/* back wall */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          width: width * 1.1,
          height: height * 0.6,
          transform: "translateX(-50%)",
          background:
            "linear-gradient(#5b564a 0%, #6d675a 40%, #4a463c 100%)",
        }}
      />
      {/* doorway */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: height * 0.08,
          width: width * 0.34,
          height: height * 0.5,
          transform: "translateX(-50%)",
          background: "linear-gradient(#4a3524 0%, #6b4b31 60%, #3a2918 100%)",
          boxShadow: "0 0 90px rgba(0,0,0,0.55) inset",
        }}
      />
      {/* checkerboard floor, receding */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: height * 0.58,
          width: width * 4,
          height: width * 4,
          transformOrigin: "50% 0",
          transform: "translateX(-50%) rotateX(76deg)",
          background: `repeating-conic-gradient(#c9c3ac 0% 25%, #5f7d78 0% 50%) 0 0 / ${tile}px ${tile}px`,
        }}
      />
      {/* light falloff down the hall */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 70% at 50% 30%, rgba(255,226,180,0.16), rgba(0,0,0,0) 60%)",
        }}
      />
    </AbsoluteFill>
  );
};

// ── Placeholder foreground subject ─────────────────────────────────────
// Stands in front of the text to prove the layer order. Replace with your
// own cutout via `occluderSrc`, or a polygon via `occluderPolygon`.

const PlaceholderFigure: React.FC = () => {
  const { width, height } = useVideoConfig();
  const w = Math.min(width, height) * 0.22;

  return (
    <div
      style={{
        position: "absolute",
        left: width * 0.62,
        top: height * 0.34,
        width: w,
        height: w * 3.4,
        filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.5))",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          width: w * 0.3,
          height: w * 0.36,
          borderRadius: "50% 50% 46% 46%",
          transform: "translateX(-50%)",
          background: "linear-gradient(#3a332c, #221e19)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: w * 0.3,
          width: w,
          height: "100%",
          clipPath:
            "polygon(36% 0%, 64% 0%, 82% 9%, 100% 34%, 92% 100%, 8% 100%, 0% 34%, 18% 9%)",
          background: "linear-gradient(#453b31, #201c17)",
        }}
      />
    </div>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(115% 85% at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)",
      pointerEvents: "none",
    }}
  />
);
