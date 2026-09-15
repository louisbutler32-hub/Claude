import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { CAPTION, H, PANEL_TOP, SHOT, shotLen, TOTAL_FRAMES, W } from "./beats";
import { loadMinecraftFonts } from "./fonts";
import {
  AerialShot,
  CloseupShot,
  DarkRoomShot,
  DeathShot,
  FinaleShot,
  HouseShot,
  LavaShot,
  OverworldShot,
  TorchShot,
  TunnelShot,
} from "./shots";

/**
 * "Minecrafters every time they lose their stuff:" — a 17-second vertical
 * Short, rebuilt shot for shot from the original: the white caption band
 * up top, and below it a stick figure who dies to a creeper, grieves in
 * the overworld, walks all the way back, finds everything still there,
 * and watches it despawn.
 *
 * Every cut is on the original's frame (beats.ts). The audio is a drop-in
 * slot at public/audio/minecraft-mix.mp3.
 */

export const MINECRAFT_FRAMES = TOTAL_FRAMES;

/** What the wall sign says. The original carries its creator's channel name here. */
export const SIGN_TEXT = "PebbloPebble";

export const CaptionBand: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: W,
      height: PANEL_TOP,
      background: "#ffffff",
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 80,
        top: 111,
        fontFamily: "Selawik, 'Segoe UI', sans-serif",
        fontSize: 88,
        lineHeight: "118px",
        color: "#000000",
        whiteSpace: "pre",
      }}
    >
      {CAPTION.join("\n")}
    </div>
  </div>
);

export const MinecraftShort: React.FC<{ audio?: string | null; signText?: string }> = ({
  audio = "audio/minecraft-mix.mp3",
  signText = SIGN_TEXT,
}) => {
  loadMinecraftFonts();
  const shots: { name: keyof typeof SHOT; el: React.ReactNode }[] = [
    { name: "death", el: <DeathShot /> },
    { name: "overworld", el: <OverworldShot /> },
    { name: "aerial", el: <AerialShot /> },
    { name: "tunnel", el: <TunnelShot /> },
    { name: "darkRoom", el: <DarkRoomShot signText={signText} /> },
    { name: "lava", el: <LavaShot /> },
    { name: "torch", el: <TorchShot /> },
    { name: "house", el: <HouseShot signText={signText} /> },
    { name: "closeup", el: <CloseupShot /> },
    { name: "finale", el: <FinaleShot /> },
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff" }}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      {shots.map(({ name, el }) => (
        <Sequence key={name} from={SHOT[name][0]} durationInFrames={shotLen(name)} name={name}>
          <AbsoluteFill>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
              <defs>
                <clipPath id="mcPanel">
                  <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} />
                </clipPath>
                <linearGradient id="creeperShade" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#000000" stopOpacity={0.18} />
                </linearGradient>
              </defs>
              <g clipPath="url(#mcPanel)">{el}</g>
            </svg>
          </AbsoluteFill>
        </Sequence>
      ))}
      <CaptionBand />
    </AbsoluteFill>
  );
};
