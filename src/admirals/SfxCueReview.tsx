import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AdmiralsVideo } from "./AdmiralsVideo";
import { SFX_CUES } from "./sfx";

// Overlays the SFX cue sheet on top of the Admirals video so you can scrub
// and see exactly which sound fires at which frame, and its timestamp in
// your own SFX source file. Render this comp for review; render the plain
// AdmiralsVideo for the clean visual.
export const SfxCueReview: React.FC = () => {
  const frame = useCurrentFrame();
  const active = SFX_CUES.filter((c) => frame >= c.frame && frame < c.frame + 45);

  return (
    <AbsoluteFill>
      <AdmiralsVideo />
      {active.map((c, i) => {
        const local = frame - c.frame;
        const op = interpolate(local, [0, 4, 38, 45], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div
            key={c.frame + c.label}
            style={{
              position: "absolute",
              top: 30 + i * 64,
              right: 30,
              opacity: op,
              background: "rgba(0,0,0,0.8)",
              border: "2px solid #ffd75e",
              borderRadius: 8,
              padding: "10px 18px",
              maxWidth: 620,
            }}
          >
            <span style={{ fontFamily: "'Courier New',monospace", fontWeight: 700, fontSize: 24, color: "#ffd75e" }}>🔊 {c.ref} </span>
            <span style={{ fontFamily: "'Helvetica Neue',sans-serif", fontSize: 22, color: "#fff" }}>{c.label}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
