import React from "react";
import { interpolate, spring } from "remotion";
import { FPS } from "./kit";

/**
 * The 2D layer, measured off the reference sims (720x1280, scaled to 1080x1920):
 * - captions: lowercase, small, yellow with a dark edge, centred two-thirds down
 * - name tags: white caps on a black pill with a white rim, over a character's head
 * - stat cards: big yellow numbers with a black outline at the top, a sub-line under them
 * - action labels: the same yellow in a pixel face (PUMP FAKE, LATERAL QUICKNESS: 0)
 */

const YELLOW = "#fff200";

export const Caption: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 1272, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
    <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 44, color: YELLOW, letterSpacing: -0.5, WebkitTextStroke: "3px #111", paintOrder: "stroke fill", textShadow: "0 3px 6px rgba(0,0,0,0.55)", whiteSpace: "nowrap" }}>{text}</div>
  </div>
);

const pop = (t: number) => spring({ frame: t, fps: FPS, config: { damping: 11, stiffness: 180, mass: 0.6 } });

export const NameTag: React.FC<{ text: string; x: number; y: number; t: number }> = ({ text, x, y, t }) => {
  const s = pop(t);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${s})`, background: "#121212", border: "3px solid #ffffff", borderRadius: 16, padding: "10px 26px", fontFamily: "Montserrat", fontWeight: 800, fontSize: 48, color: "#ffffff", whiteSpace: "nowrap", boxShadow: "0 6px 16px rgba(0,0,0,0.4)" }}>{text}</div>
  );
};

/** big yellow number at the top; `sub` is the small line under it */
export const StatCard: React.FC<{ big: string; sub?: string; t: number; y?: number; size?: number }> = ({ big, sub, t, y = 150, size = 150 }) => {
  const s = pop(t);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${s})`, transformOrigin: `540px ${size / 2}px` }}>
      <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: size, lineHeight: 1, color: "#ffd21c", WebkitTextStroke: "12px #111", paintOrder: "stroke fill", letterSpacing: -2, textShadow: "0 8px 18px rgba(0,0,0,0.45)", whiteSpace: "nowrap" }}>{big}</div>
      {sub && <div style={{ marginTop: 10, fontFamily: "Montserrat", fontWeight: 900, fontSize: 46, color: "#ffd21c", WebkitTextStroke: "7px #111", paintOrder: "stroke fill", letterSpacing: 0, whiteSpace: "nowrap" }}>{sub}</div>}
    </div>
  );
};

/** the pixel-face label (player names, moves, the zero stats) */
export const PixelLabel: React.FC<{ text: string; t: number; y?: number; size?: number; color?: string }> = ({ text, t, y = 130, size = 70, color = "#ffd21c" }) => {
  const o = interpolate(t, [0, 3], [0, 1], { extrapolateRight: "clamp" });
  const s = interpolate(t, [0, 4], [1.25, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", opacity: o, transform: `scale(${s})` }}>
      <span style={{ fontFamily: "Silkscreen", fontSize: size, color, WebkitTextStroke: "10px #111", paintOrder: "stroke fill", textShadow: "0 6px 0 rgba(0,0,0,0.35)", whiteSpace: "nowrap" }}>{text}</span>
    </div>
  );
};

/** a quick white flash on impacts */
export const Flash: React.FC<{ t: number; len?: number }> = ({ t, len = 6 }) => {
  const o = interpolate(t, [0, len], [0.7, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return o > 0 ? <div style={{ position: "absolute", inset: 0, background: "#ffffff", opacity: o }} /> : null;
};

/** speed lines from the frame edges */
export const SpeedLines: React.FC<{ f: number; o?: number }> = ({ f, o = 0.6 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: o }}>
    {Array.from({ length: 26 }, (_, i) => {
      const a = (i / 26) * Math.PI * 2 + ((f * 7 + i * 13) % 5) * 0.03;
      const r0 = 520 + ((i * 97 + f * 41) % 220), r1 = 1300;
      return <line key={i} x1={540 + Math.cos(a) * r0} y1={960 + Math.sin(a) * r0 * 1.5} x2={540 + Math.cos(a) * r1} y2={960 + Math.sin(a) * r1 * 1.5} stroke="#ffffff" strokeWidth={4 + (i % 3) * 3} strokeLinecap="round" />;
    })}
  </svg>
);
