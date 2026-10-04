import React from "react";
import { AbsoluteFill, Img, Loop, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Scene: a photo plate (public/plates/<key>-paint.jpg, or the <key>.mp4 loop
 * with `live`) composited the kit-v2 way:
 *
 *   plate (reframed by `fit`, optionally pushing in / panning over the clip)
 *   → depth blur: a blurred copy masked to a top band, so distance softens
 *   → a colour-light wash (warm / cool / sunset / night)
 *   → vignette
 *   → children: the Characters layer(s), bubbles, etc.
 *   → `fg`: a foreground slot, blurred, for things close to the lens
 *
 * The plate stays crisp outside <HandDrawn>; wrap only <Characters> in it.
 */

export type Light = "none" | "warm" | "cool" | "sunset" | "night" | "dawn" | "noon";
const LIGHTS: Record<Light, { c: string; o: number; blend: React.CSSProperties["mixBlendMode"] }> = {
  none: { c: "transparent", o: 0, blend: "normal" },
  warm: { c: "#ffb35a", o: 0.18, blend: "soft-light" },
  cool: { c: "#5a86ff", o: 0.22, blend: "soft-light" },
  sunset: { c: "#ff6a2a", o: 0.3, blend: "overlay" },
  night: { c: "#1a2a6a", o: 0.55, blend: "multiply" },
  dawn: { c: "#ffc89a", o: 0.26, blend: "overlay" },
  noon: { c: "#fff6d0", o: 0.14, blend: "overlay" },
};

export type Fit = { zoom?: number; x?: number; y?: number; flipX?: boolean };

export type SceneProps = {
  plate: string;
  live?: boolean;
  fit?: Fit;
  light?: Light;
  /** 0 = no depth blur; 1 = heavy. Default 0.6 */
  dof?: number;
  /** how far down the frame (0..1) the blur fades out. Default 0.55 */
  dofBand?: number;
  vignette?: number;
  fg?: React.ReactNode;
  fgBlur?: number;
  /** slow push-in: zoom from → to over `pushFrames` (default the whole composition) */
  push?: [number, number];
  pan?: [number, number];
  pushFrames?: number;
  /** the .mp4 plates are 8 s loops */
  loopSeconds?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
};

export const Scene: React.FC<SceneProps> = ({ plate, live, fit = {}, light = "warm", dof = 0.6, dofBand = 0.55, vignette = 0.5, fg, fgBlur = 10, push, pan, pushFrames, loopSeconds = 8, children, style }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const t = Math.min(1, frame / Math.max(1, (pushFrames ?? durationInFrames) - 1));
  const zoom = (fit.zoom ?? 1) * (push ? push[0] + (push[1] - push[0]) * t : 1);
  const px = (fit.x ?? 0) + (pan ? pan[0] * t : 0), py = (fit.y ?? 0) + (pan ? pan[1] * t : 0);
  const tf = `translate(${px}px, ${py}px) scale(${fit.flipX ? -zoom : zoom}, ${zoom})`;
  const src = staticFile(live ? `plates/${plate}.mp4` : `plates/${plate}-paint.jpg`);
  const media = (extra?: React.CSSProperties) => live
    ? <Loop durationInFrames={Math.round(loopSeconds * fps)} layout="none"><OffthreadVideo src={src} muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: tf, ...extra }} /></Loop>
    : <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", transform: tf, ...extra }} />;
  const L = LIGHTS[light];
  return (
    <AbsoluteFill style={{ backgroundColor: "#111", overflow: "hidden", ...style }}>
      <AbsoluteFill>{media()}</AbsoluteFill>
      {dof > 0 && (
        <AbsoluteFill style={{ WebkitMaskImage: `linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${dofBand * 45}%, rgba(0,0,0,0) ${dofBand * 100}%)`, maskImage: `linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${dofBand * 45}%, rgba(0,0,0,0) ${dofBand * 100}%)` }}>
          {media({ filter: `blur(${(4 + 14 * dof).toFixed(1)}px)`, transform: `${tf} scale(1.03)` })}
        </AbsoluteFill>
      )}
      {L.o > 0 && <AbsoluteFill style={{ backgroundColor: L.c, opacity: L.o, mixBlendMode: L.blend }} />}
      {vignette > 0 && <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,${(0.75 * vignette).toFixed(2)}) 100%)` }} />}
      {children}
      {fg && <AbsoluteFill style={{ filter: `blur(${fgBlur}px)`, pointerEvents: "none" }}>{fg}</AbsoluteFill>}
    </AbsoluteFill>
  );
};

/**
 * The character layer: one full-frame SVG in frame coordinates, children
 * sorted by their `z` prop (lower first). Wrap this in <HandDrawn> for the
 * boil; the plate underneath stays crisp.
 */
export const Characters: React.FC<{ children?: React.ReactNode; width?: number; height?: number; style?: React.CSSProperties }> = ({ children, width, height, style }) => {
  const cfg = useVideoConfig();
  const W = width ?? cfg.width, H = height ?? cfg.height;
  const kids = React.Children.toArray(children).filter(Boolean) as React.ReactElement[];
  const sorted = kids.map((k, i) => ({ k, i, z: (k.props as { z?: number }).z ?? 0 })).sort((a, b) => a.z - b.z || a.i - b.i).map((o) => o.k);
  return (
    <AbsoluteFill style={style}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>{sorted}</svg>
    </AbsoluteFill>
  );
};

/** an actor slot: z-order + ground position; its children are drawn in body space (feet at 0,0) */
export const Actor: React.FC<{ z?: number; x: number; y: number; children?: React.ReactNode }> = ({ x, y, children }) => <g transform={`translate(${x},${y})`}>{children}</g>;
