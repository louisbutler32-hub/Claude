import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { FPS, Shot, shots } from "./shots";
import {
  AssetSlot,
  Grain,
  HakiAura,
  Hearts,
  ImpactCard,
  KenBurnsBg,
  LocationPin,
  NarratorScene,
  PunchFist,
  punchContentOffset,
  RedX,
  SpeedLines,
  SpeechBubble,
  StaticNoise,
  TypewriterCard,
  QuestionMarks as QMarks,
} from "./components";

const FONT_IMPACT = "'Arial Black', 'Helvetica Neue', Arial, sans-serif";

// Big overlay word(s), cycled evenly across the shot when several are given.
const TextCycle: React.FC<{ texts: string[]; durationInFrames: number }> = ({
  texts,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const idx = Math.min(
    texts.length - 1,
    Math.floor(frame / (durationInFrames / texts.length))
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 100,
        width: "100%",
        textAlign: "center",
        fontFamily: FONT_IMPACT,
        fontWeight: 900,
        fontSize: 92,
        color: "#fff",
        letterSpacing: 3,
        textShadow: "0 4px 0 rgba(0,0,0,0.7), 0 0 30px rgba(0,0,0,0.5)",
      }}
    >
      {texts[idx]}
    </div>
  );
};

const SceneShot: React.FC<{ shot: Shot; durationInFrames: number }> = ({
  shot,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const fx = shot.fx ?? [];
  const white = fx.includes("whitebg");
  const slots = shot.slots ?? [];

  // content filters
  const filters: string[] = [];
  if (fx.includes("greyscale")) filters.push("grayscale(1) contrast(1.1)");
  if (fx.includes("sepia")) filters.push("sepia(0.85) contrast(1.05)");
  if (fx.includes("redtint")) filters.push("grayscale(1)");

  // shake / pan / punch transforms
  let tx = 0;
  if (fx.includes("shake") && frame < 16) tx = Math.sin(frame * 2.6) * 7;
  if (fx.includes("pan"))
    tx = interpolate(frame, [0, durationInFrames], [60, -60]);
  if (fx.includes("punch")) tx += punchContentOffset(frame, durationInFrames);

  // glitch: RGB-split jitter for the first ~20 frames
  const glitching = fx.includes("glitch") && frame < 22;
  const glitchX = glitching ? ((frame * 13) % 7) - 3 : 0;

  if (fx.includes("static")) return <StaticNoise />;

  const ringCenter = shot.layout === "ring" ? slots[0] : null;
  const ringRest = shot.layout === "ring" ? slots.slice(1) : [];

  return (
    <AbsoluteFill style={{ background: white ? "#f2f0ea" : "#0b0d12" }}>
      <AbsoluteFill
        style={{
          filter: filters.join(" ") || undefined,
          transform: `translateX(${tx + glitchX}px)`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {shot.bg && <KenBurnsBg src={shot.bg} durationInFrames={durationInFrames} />}
        {shot.layout === "ring" && ringCenter ? (
          <>
            <div style={{ width: 460, height: 500 }}>
              <AssetSlot slot={ringCenter} dark={!white} />
            </div>
            {ringRest.map((slot, i) => {
              const angle = (i / ringRest.length) * Math.PI * 2 - Math.PI / 2;
              const x = 960 + Math.cos(angle) * 620 - 105;
              const y = 540 + Math.sin(angle) * 330 - 105;
              return (
                <div
                  key={slot.id + i}
                  style={{
                    position: "absolute",
                    left: x,
                    top: y,
                    width: 210,
                    height: 210,
                    transform: `translateY(${Math.sin(frame / 11 + i) * 8}px)`,
                  }}
                >
                  <AssetSlot slot={slot} dark={!white} mini />
                </div>
              );
            })}
          </>
        ) : shot.layout === "column" ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 30,
              transform: fx.includes("slideup")
                ? `translateY(${interpolate(frame, [0, durationInFrames], [340, -340])}px)`
                : undefined,
            }}
          >
            {slots.map((slot, i) => (
              <div key={slot.id + i} style={{ width: 900, height: 460 }}>
                <AssetSlot slot={slot} dark={!white} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 40, padding: "0 100px", width: "100%", justifyContent: "center" }}>
            {slots.map((slot, i) => (
              <div
                key={slot.id + i}
                style={{
                  flex: 1,
                  maxWidth: slots.length === 1 ? 1100 : 560,
                  height: slots.length === 1 ? 720 : 560,
                }}
              >
                <AssetSlot slot={slot} dark={!white} />
              </div>
            ))}
          </div>
        )}
      </AbsoluteFill>

      {/* overlays */}
      {fx.includes("redtint") && (
        <AbsoluteFill style={{ background: "rgba(190,20,20,0.35)", mixBlendMode: "multiply", pointerEvents: "none" }} />
      )}
      {fx.includes("vignette") && (
        <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(circle at 50% 50%, transparent 45%, rgba(0,0,0,0.85) 100%)" }} />
      )}
      {fx.includes("haki") && <HakiAura />}
      {fx.includes("speedlines") && <SpeedLines />}
      {fx.includes("redx") && <RedX durationInFrames={durationInFrames} />}
      {fx.includes("punch") && <PunchFist durationInFrames={durationInFrames} />}
      {fx.includes("flash") && frame < 5 && (
        <AbsoluteFill style={{ background: "#fff", opacity: interpolate(frame, [0, 4], [0.95, 0]) }} />
      )}
      {fx.includes("sepia") && <Grain />}
      {glitching && (
        <AbsoluteFill
          style={{
            pointerEvents: "none",
            opacity: 0.25,
            backgroundImage: "repeating-linear-gradient(0deg, transparent 0px, transparent 5px, rgba(0,255,230,0.4) 6px, rgba(255,0,90,0.4) 7px)",
            backgroundPosition: `0 ${(frame * 29) % 40}px`,
          }}
        />
      )}

      {shot.qmarks && <QMarks dark={!white} />}
      {shot.hearts && <Hearts />}
      {shot.pin && <LocationPin text={shot.pin} />}
      {shot.texts && <TextCycle texts={shot.texts} durationInFrames={durationInFrames} />}
      {shot.bubbles?.map((b, i) => (
        <SpeechBubble key={i} text={b} index={i} />
      ))}
    </AbsoluteFill>
  );
};

const renderShot = (shot: Shot, durationInFrames: number) => {
  switch (shot.kind) {
    case "black":
      return <AbsoluteFill style={{ background: "#000" }} />;
    case "impact":
      return <ImpactCard text={shot.text ?? ""} embers={shot.embers} />;
    case "type":
      return <TypewriterCard text={shot.text ?? ""} />;
    case "narrator":
      return <NarratorScene icons={shot.icons} />;
    case "scene":
      return <SceneShot shot={shot} durationInFrames={durationInFrames} />;
  }
};

export const WhatIfVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {shots.map((shot, i) => {
        const from = Math.round(shot.t[0] * FPS);
        const dur = Math.max(1, Math.round((shot.t[1] - shot.t[0]) * FPS));
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            {renderShot(shot, dur)}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
