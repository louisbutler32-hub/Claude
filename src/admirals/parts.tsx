import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AssetSlot, Grain } from "../whatif/components";

const FONT = "'Arial Black', 'Helvetica Neue', Arial, sans-serif";
const TYPE = "'Courier New', Courier, monospace";

// Labeled slot for licensed footage the editor drops in. If `src` is set
// (a file in public/assets/clips/), it plays; otherwise a dashed marker
// shows exactly which clip and timestamp goes here.
export const ClipSlot: React.FC<{
  id: string;
  label: string;
  note?: string;
  src?: string;
  tint?: string;
}> = ({ id, label, note, src, tint }) => {
  if (src) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { OffthreadVideo } = require("remotion");
    return (
      <AbsoluteFill>
        <OffthreadVideo src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        {tint && <AbsoluteFill style={{ background: tint, mixBlendMode: "overlay" }} />}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: "#0c0e14" }}>
      <div
        style={{
          border: "4px dashed #c9a24a",
          borderRadius: 10,
          padding: "34px 54px",
          textAlign: "center",
          maxWidth: 1100,
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 40, color: "#e8c46a" }}>▶ CLIP: {label}</div>
        {note && <div style={{ fontFamily: TYPE, fontSize: 24, color: "#9aa0ae", marginTop: 12 }}>{note}</div>}
        <div style={{ fontFamily: TYPE, fontSize: 18, color: "#6b7180", marginTop: 14 }}>
          → public/assets/clips/{id}.mp4
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Typewriter chapter heading on dark grain.
export const ChapterCard: React.FC<{ chapter: string; title: string }> = ({ chapter, title }) => {
  const frame = useCurrentFrame();
  const full = `${chapter}: ${title}`;
  const chars = Math.min(full.length, Math.floor(frame / 1.2));
  return (
    <AbsoluteFill style={{ background: "#09090b", alignItems: "center", justifyContent: "center" }}>
      <Grain />
      <div style={{ maxWidth: 1500, textAlign: "center" }}>
        <div style={{ fontFamily: TYPE, fontWeight: 700, fontSize: 70, color: "#e8e4da", letterSpacing: 2 }}>
          {full.slice(0, chars)}
          <span style={{ opacity: frame % 16 < 8 ? 1 : 0 }}>▌</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Animated 0→value stat gauge that pops in.
export const StatGauge: React.FC<{ label: string; value: number; color: string; startFrame?: number }> = ({
  label,
  value,
  color,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grow = spring({ frame: frame - startFrame, fps, config: { damping: 200, stiffness: 90 }, durationInFrames: 30 });
  const shown = Math.round(grow * value);
  return (
    <div
      style={{
        position: "absolute",
        bottom: 90,
        left: 120,
        right: 120,
        background: "rgba(9,11,16,0.82)",
        border: `2px solid ${color}`,
        borderRadius: 10,
        padding: "22px 30px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 34, color: "#fff", letterSpacing: 2 }}>{label}</span>
        <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 34, color }}>{shown}/100</span>
      </div>
      <div style={{ height: 22, background: "rgba(255,255,255,0.1)", borderRadius: 11, overflow: "hidden" }}>
        <div style={{ width: `${grow * value}%`, height: "100%", background: color, boxShadow: `0 0 18px ${color}` }} />
      </div>
    </div>
  );
};

// Red text pin that drops from the top.
export const TextPin: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const y = interpolate(frame, [0, 8, 12], [-90, 8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: 80, left: 100, transform: `translateY(${y}px)`, display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 30, height: 30, borderRadius: "50% 50% 50% 0", background: "#e6231a", transform: "rotate(-45deg)", border: "3px solid #fff" }} />
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 42, color: "#fff", background: "#e6231a", padding: "6px 22px", borderRadius: 6 }}>{text}</div>
    </div>
  );
};

// Fire/Ice/Light synergy triangle connecting the three cutouts, with clip
// slots playing in each corner.
export const SynergyTriangle: React.FC<{ clips?: Record<string, string> }> = ({ clips = {} }) => {
  const frame = useCurrentFrame();
  const pulse = 0.5 + 0.5 * Math.sin(frame / 6);
  const corners = [
    { id: "akainu", label: "FIRE", color: "#e6231a", x: 960, y: 250 },
    { id: "kuzan", label: "ICE", color: "#5ad8ff", x: 480, y: 800 },
    { id: "kizaru", label: "LIGHT", color: "#ffd93c", x: 1440, y: 800 },
  ];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #1a1024 0%, #08060c 70%)" }}>
      <svg width="1920" height="1080" style={{ position: "absolute" }}>
        {corners.map((c, i) => {
          const n = corners[(i + 1) % corners.length];
          return <line key={i} x1={c.x} y1={c.y} x2={n.x} y2={n.y} stroke={`rgba(255,220,120,${0.4 + pulse * 0.5})`} strokeWidth={4} />;
        })}
      </svg>
      {corners.map((c) => (
        <div key={c.id} style={{ position: "absolute", left: c.x - 190, top: c.y - 150, width: 380, height: 300 }}>
          <div style={{ width: "100%", height: "100%", borderRadius: 12, overflow: "hidden", border: `4px solid ${c.color}`, boxShadow: `0 0 30px ${c.color}` }}>
            <ClipSlot id={`synergy-${c.id}`} label={`${c.label} combat`} src={clips[c.id]} tint={`${c.color}22`} />
          </div>
          <div style={{ textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 34, color: c.color, marginTop: 8, textShadow: "0 2px 0 #000" }}>{c.label}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// Three red crosshairs converging on a terrified target.
export const Crosshairs: React.FC = () => {
  const frame = useCurrentFrame();
  const lock = interpolate(frame, [10, 40], [400, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const locked = frame > 40;
  const dirs = [
    { dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: 0, dy: 1 },
  ];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {dirs.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 960 + d.dx * lock - 60,
            top: 460 + d.dy * lock - 60,
            width: 120,
            height: 120,
            border: "5px solid #e6231a",
            borderRadius: "50%",
            boxShadow: locked ? "0 0 24px rgba(230,35,26,0.9)" : "none",
          }}
        >
          <div style={{ position: "absolute", left: "50%", top: -18, width: 3, height: 18, background: "#e6231a", transform: "translateX(-50%)" }} />
          <div style={{ position: "absolute", left: "50%", bottom: -18, width: 3, height: 18, background: "#e6231a", transform: "translateX(-50%)" }} />
          <div style={{ position: "absolute", top: "50%", left: -18, height: 3, width: 18, background: "#e6231a", transform: "translateY(-50%)" }} />
          <div style={{ position: "absolute", top: "50%", right: -18, height: 3, width: 18, background: "#e6231a", transform: "translateY(-50%)" }} />
        </div>
      ))}
      {locked && frame % 12 < 6 && (
        <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 46, color: "#e6231a" }}>
          TARGET LOCKED
        </div>
      )}
    </AbsoluteFill>
  );
};

// A newspaper headline that spins onto screen.
export const NewspaperSpin: React.FC<{ headline: string; startFrame: number }> = ({ headline, startFrame }) => {
  const frame = useCurrentFrame() - startFrame;
  if (frame < 0) return null;
  const t = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rot = (1 - t) * 720;
  const scale = t;
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${scale})`,
        width: 1000,
        background: "#eae6d8",
        border: "6px solid #1a1a1a",
        padding: "40px 50px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
      }}
    >
      <div style={{ fontFamily: TYPE, fontSize: 22, color: "#555", borderBottom: "3px double #1a1a1a", paddingBottom: 8, marginBottom: 16, letterSpacing: 3 }}>
        THE WORLD ECONOMIC JOURNAL — MARINE HQ EDITION
      </div>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 66, color: "#111", lineHeight: 1.05 }}>{headline}</div>
    </div>
  );
};

// Simple full-screen impact word (re-usable here without importing the whole
// whatif module surface).
export const ImpactWord: React.FC<{ text: string; color?: string; embers?: boolean }> = ({ text, color = "#fff" }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 3], [1.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 150, color, letterSpacing: 4, transform: `scale(${scale})`, textAlign: "center" }}>{text}</div>
    </AbsoluteFill>
  );
};

// Cutout helper used across profile scenes.
export const CutoutFull: React.FC<{ id: string; slideFrom?: "left" | "right" | "bottom" | "none"; glow?: string; pad?: string }> = ({
  id,
  slideFrom = "bottom",
  glow,
  pad = "60px 520px 90px",
}) => (
  <AbsoluteFill style={{ padding: pad }}>
    <div style={{ width: "100%", height: "100%", filter: glow ? `drop-shadow(0 0 34px ${glow})` : undefined }}>
      <AssetSlot slot={{ id, label: id, src: `assets/${id}.png` }} slideFrom={slideFrom} />
    </div>
  </AbsoluteFill>
);

export const staticImg = (src: string) => <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />;
