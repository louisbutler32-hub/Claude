import React from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile } from "remotion";
import { H, PANEL_TOP, W } from "../minecraft/beats";
import { HandDrawn } from "../minecraft/handdrawn";
import { loadMinecraftFonts } from "../minecraft/fonts";
import { Hearts, Hotbar, SlotItem } from "../minecraft-fall/hud";

/**
 * Shared bits of the first-person ("POV") Shorts: the white caption band,
 * the hand-drawn wrapper, the crosshair, hearts and hotbar, and the arm that
 * comes in from the bottom-right corner. The character is never shown.
 */

export const LINE = "#141414";
export const MONO = "Monocraft, monospace";
export const CX = 540;
export const CY = (PANEL_TOP + H) / 2;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
export const ease3 = (f: number, a: number, b: number) => {
  const t = clamp01((f - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export const usePreload = (urls: string[]) => {
  const [handle] = React.useState(() => delayRender("loading the pov pictures"));
  React.useEffect(() => {
    Promise.all(urls.map((u) => new Promise<void>((r) => { const im = new window.Image(); im.onload = () => r(); im.onerror = () => r(); im.src = u; }))).then(() => continueRender(handle));
  }, [handle, urls]);
};

export const CaptionBand: React.FC<{ lines: string[] }> = ({ lines }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: W, height: PANEL_TOP, background: "#ffffff" }}>
    <div style={{ position: "absolute", left: 80, top: 111, fontFamily: "Selawik, 'Segoe UI', sans-serif", fontSize: 88, lineHeight: "118px", color: "#000", whiteSpace: "pre" }}>
      {lines.join("\n")}
    </div>
  </div>
);

export const Crosshair: React.FC<{ x?: number; y?: number; o?: number; color?: string }> = ({ x = CX, y = CY, o = 0.9, color = "#ffffff" }) => (
  <g opacity={o} transform={`translate(${x} ${y})`}>
    <rect x={-22} y={-4} width={44} height={8} fill={color} />
    <rect x={-4} y={-22} width={8} height={44} fill={color} />
  </g>
);

/** the HUD along the bottom: hearts, hotbar */
export const PovHud: React.FC<{ f: number; hp?: number; items: SlotItem[]; sel: number; flash?: boolean; showBar?: boolean }> = ({ f, hp = 20, items, sel, flash = false, showBar = true }) => (
  <g>
    {showBar && <Hearts x={CX - 540 + 150} y={1722} hp={hp} frame={f} flash={flash} />}
    <Hotbar y={1812} items={items} selected={sel} />
  </g>
);

/**
 * The arm from the bottom-right corner, drawn flat like the game's own:
 * a long box going up and left, with a sleeve and a hand. `k` 0 rest … 1 swung
 * forward; `held` draws a cube in the hand.
 */
export const Arm: React.FC<{ k?: number; held?: string | null; dx?: number; dy?: number; sleeve?: string }> = ({ k = 0, held = null, dx = 0, dy = 0, sleeve = "#3aa6b4" }) => {
  const x = lerp(930, 780, k) + dx, y = lerp(2010, 1760, k) + dy, r = lerp(-18, -30, k);
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`} stroke={LINE} strokeWidth={9} strokeLinejoin="round">
      <rect x={-92} y={-520} width={184} height={560} fill="#c68863" />
      <rect x={-92} y={-520} width={184} height={90} fill="#d79f78" />
      <rect x={-92} y={-210} width={184} height={250} fill={sleeve} />
      <rect x={-92} y={-210} width={184} height={36} fill="#2d8793" />
      {held && (
        <g transform="translate(-30 -560)">
          <rect x={-90} y={-40} width={180} height={180} fill={held} />
          <rect x={-90} y={-40} width={180} height={34} fill="#ffffff" opacity={0.18} stroke="none" />
          <path d="M-90,52 H90 M-30,-40 V140" stroke="#00000033" strokeWidth={5} fill="none" />
        </g>
      )}
    </g>
  );
};

export const PovFrame: React.FC<{
  audio?: string | null;
  drawn?: boolean;
  caption: string[];
  panelId: string;
  boil?: number;
  scene: React.ReactNode;
  hud?: React.ReactNode;
  top?: React.ReactNode;
}> = ({ audio = null, drawn = true, caption, panelId, boil = 0.75, scene, hud, top }) => {
  loadMinecraftFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {audio && <Audio src={staticFile(audio)} />}
      <HandDrawn enabled={drawn} hold={1} boilEvery={2} boil={boil} grain={0}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          <defs><clipPath id={panelId}><rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} /></clipPath></defs>
          <g clipPath={`url(#${panelId})`}>{scene}</g>
        </svg>
      </HandDrawn>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>{hud}</svg>
      {top}
      <CaptionBand lines={caption} />
    </AbsoluteFill>
  );
};
