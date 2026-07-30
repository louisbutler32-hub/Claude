import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Slot } from "./shots";

const FONT_IMPACT = "'Arial Black', 'Helvetica Neue', Arial, sans-serif";
const FONT_TYPE = "'Courier New', Courier, monospace";

// ── Full-screen impact card: bold white text popping on black ──────────
export const ImpactCard: React.FC<{ text: string; embers?: boolean }> = ({
  text,
  embers,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 3], [1.18, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ background: "#000", alignItems: "center", justifyContent: "center" }}
    >
      {embers && <Embers />}
      <div
        style={{
          fontFamily: FONT_IMPACT,
          fontWeight: 900,
          fontSize: 150,
          color: "#fff",
          letterSpacing: 4,
          transform: `scale(${scale})`,
          textAlign: "center",
          textShadow: embers ? "0 0 40px rgba(255,120,30,0.6)" : "none",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

// ── Typewriter chapter card on dark grainy background ──────────────────
export const TypewriterCard: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const chars = Math.min(text.length, Math.floor(frame / 1.5));
  const flicker = 0.92 + 0.08 * ((frame % 3) / 2);

  return (
    <AbsoluteFill
      style={{ background: "#0a0a0a", alignItems: "center", justifyContent: "center" }}
    >
      <Grain />
      <div
        style={{
          fontFamily: FONT_TYPE,
          fontWeight: 700,
          fontSize: 64,
          color: "#e8e4da",
          letterSpacing: 2,
          maxWidth: 1500,
          textAlign: "center",
          opacity: flicker,
        }}
      >
        {text.slice(0, chars)}
        <span style={{ opacity: frame % 16 < 8 ? 1 : 0 }}>▌</span>
      </div>
    </AbsoluteFill>
  );
};

// ── Placeholder slot for a licensed asset the editor supplies ──────────
export const AssetSlot: React.FC<{
  slot: Slot;
  dark?: boolean;
  mini?: boolean;
  slideFrom?: "left" | "right" | "bottom" | "none";
}> = ({ slot, dark = true, mini = false, slideFrom = "bottom" }) => {
  const frame = useCurrentFrame();
  if (slot.src) {
    // real cutout: slide in with a short overshoot, never a hard pop
    const t = interpolate(frame, [0, 14], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const ease = t * t * (3 - 2 * t); // smoothstep out
    const dist = mini ? 90 : 260;
    const offset =
      slideFrom === "none"
        ? "none"
        : slideFrom === "left"
          ? `translateX(${-dist * ease}px)`
          : slideFrom === "right"
            ? `translateX(${dist * ease}px)`
            : `translateY(${dist * ease}px)`;
    const opacity = interpolate(frame, [0, 10], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return (
      <Img
        src={staticFile(slot.src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          transform: offset === "none" ? undefined : offset,
          opacity,
          filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.45))",
        }}
      />
    );
  }
  const fg = dark ? "#c9a24a" : "#7a6420";
  const sub = dark ? "#8a8f9c" : "#666";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        border: `3px dashed ${fg}`,
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: mini ? 8 : 24,
        gap: mini ? 4 : 10,
        background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontFamily: FONT_IMPACT,
          fontWeight: 900,
          fontSize: mini ? 16 : 34,
          color: fg,
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {slot.label}
      </div>
      {!mini && slot.desc && (
        <div
          style={{
            fontFamily: FONT_TYPE,
            fontSize: 20,
            color: sub,
            textAlign: "center",
            maxWidth: 500,
          }}
        >
          {slot.desc}
        </div>
      )}
      {!mini && (
        <div style={{ fontFamily: FONT_TYPE, fontSize: 16, color: sub }}>
          → public/assets/{slot.id}.png
        </div>
      )}
    </div>
  );
};

// ── Full-bleed background image with slow Ken Burns zoom ───────────────
export const KenBurnsBg: React.FC<{
  src: string;
  durationInFrames: number;
  darken?: number;
}> = ({ src, durationInFrames, darken = 0.18 }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, durationInFrames], [1.02, 1.1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
        }}
      />
      <AbsoluteFill style={{ background: `rgba(0,0,0,${darken})` }} />
    </AbsoluteFill>
  );
};

// ── Speech bubble ───────────────────────────────────────────────────────
export const SpeechBubble: React.FC<{ text: string; index?: number }> = ({
  text,
  index = 0,
}) => {
  const frame = useCurrentFrame();
  const pop = interpolate(frame, [2, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 110 + index * 130,
        right: 120,
        transform: `scale(${pop})`,
        transformOrigin: "bottom left",
      }}
    >
      <div
        style={{
          background: "#fff",
          color: "#111",
          fontFamily: FONT_IMPACT,
          fontWeight: 900,
          fontSize: 34,
          padding: "18px 30px",
          borderRadius: 26,
          maxWidth: 560,
          boxShadow: "0 4px 0 rgba(0,0,0,0.5)",
        }}
      >
        {text}
      </div>
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "16px solid transparent",
          borderRight: "16px solid transparent",
          borderTop: "26px solid #fff",
          marginLeft: 44,
        }}
      />
    </div>
  );
};

// ── Red location pin (e.g. "SHELLSTOWN") ───────────────────────────────
export const LocationPin: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const drop = interpolate(frame, [0, 8, 12], [-80, 8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 90,
        left: 100,
        transform: `translateY(${drop}px)`,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50% 50% 50% 0",
          background: "#e6423a",
          transform: "rotate(-45deg)",
          border: "3px solid #fff",
        }}
      />
      <div
        style={{
          fontFamily: FONT_IMPACT,
          fontWeight: 900,
          fontSize: 40,
          color: "#fff",
          background: "#e6423a",
          padding: "6px 22px",
          borderRadius: 6,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// ── Floating "?" marks ──────────────────────────────────────────────────
export const QuestionMarks: React.FC<{ dark?: boolean }> = ({ dark = true }) => {
  const frame = useCurrentFrame();
  const positions = [
    { x: 22, y: 18 }, { x: 72, y: 12 }, { x: 84, y: 42 },
    { x: 14, y: 55 }, { x: 60, y: 24 },
  ];

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {positions.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontFamily: FONT_IMPACT,
            fontWeight: 900,
            fontSize: 70 + (i % 3) * 20,
            color: dark ? "#fff" : "#222",
            transform: `translateY(${Math.sin(frame / 9 + i * 1.7) * 12}px) rotate(${(i % 2 === 0 ? 1 : -1) * 10}deg)`,
            textShadow: dark ? "0 2px 0 rgba(0,0,0,0.6)" : "none",
          }}
        >
          ?
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ── Floating hearts ─────────────────────────────────────────────────────
export const Hearts: React.FC = () => {
  const frame = useCurrentFrame();
  const positions = [
    { x: 20, y: 24 }, { x: 76, y: 16 }, { x: 68, y: 52 }, { x: 28, y: 60 },
  ];

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {positions.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: 44,
            height: 40,
            transform: `translateY(${Math.sin(frame / 8 + i * 2.1) * 10}px) rotate(-45deg) scale(${0.8 + (i % 3) * 0.2})`,
          }}
        >
          <div style={{ position: "absolute", width: 28, height: 44, background: "#e6423a", borderRadius: "16px 16px 0 0", left: 14 }} />
          <div style={{ position: "absolute", width: 44, height: 28, background: "#e6423a", borderRadius: "16px 0 0 16px", top: 16 }} />
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ── Ember particles (title card background) ─────────────────────────────
export const Embers: React.FC = () => {
  const frame = useCurrentFrame();
  const seeds = [7, 23, 41, 59, 71, 89, 103, 127, 149, 167];

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {seeds.map((seed, i) => {
        const x = (seed * 613) % 100;
        const speed = 1.2 + (seed % 5) * 0.4;
        const y = 110 - ((frame * speed + seed * 11) % 130);
        const size = 4 + (seed % 4) * 3;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              background: i % 2 === 0 ? "#ff9a3c" : "#ffd077",
              boxShadow: "0 0 12px rgba(255,140,50,0.9)",
              opacity: 0.5 + ((seed + frame) % 10) / 20,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ── Film grain overlay ──────────────────────────────────────────────────
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const offset = (frame * 37) % 100;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: 0.14,
        backgroundImage:
          "repeating-radial-gradient(circle at 30% 40%, #fff 0px, transparent 1px, transparent 3px), repeating-radial-gradient(circle at 70% 60%, #fff 0px, transparent 1px, transparent 4px)",
        backgroundPosition: `${offset}px ${-offset}px, ${-offset}px ${offset}px`,
      }}
    />
  );
};

// ── Static/noise flash frame ────────────────────────────────────────────
export const StaticNoise: React.FC = () => {
  const frame = useCurrentFrame();
  const jump = (frame * 53) % 90;

  return (
    <AbsoluteFill style={{ background: "#111" }}>
      <AbsoluteFill
        style={{
          opacity: 0.6,
          backgroundImage:
            "repeating-linear-gradient(0deg, #999 0px, #222 1px, #777 2px, #333 3px)",
          backgroundPosition: `0 ${jump}px`,
        }}
      />
    </AbsoluteFill>
  );
};

// ── Red X denial slash ──────────────────────────────────────────────────
export const RedX: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const start = Math.floor(durationInFrames * 0.4);
  const grow = interpolate(frame, [start, start + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bar: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: "110%",
    height: 46,
    background: "#e02418",
    borderRadius: 8,
    boxShadow: "0 0 30px rgba(224,36,24,0.7)",
  };

  return (
    <AbsoluteFill style={{ pointerEvents: "none", alignItems: "center", justifyContent: "center" }}>
      <div style={{ ...bar, transform: `translate(-50%, -50%) rotate(38deg) scaleX(${grow})` }} />
      <div style={{ ...bar, transform: `translate(-50%, -50%) rotate(-38deg) scaleX(${grow})` }} />
    </AbsoluteFill>
  );
};

// ── Comedic punch: fist flies in, content gets knocked off-screen ──────
export const PunchFist: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const hit = Math.floor(durationInFrames * 0.55);
  const x = interpolate(frame, [hit - 8, hit, hit + 6], [-500, 660, 2200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (frame < hit - 8) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          left: x,
          width: 240,
          height: 190,
          background: "#f2c14e",
          borderRadius: "38% 46% 46% 38%",
          border: "8px solid #1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT_IMPACT,
          fontWeight: 900,
          fontSize: 52,
          color: "#1a1a1a",
          transform: "rotate(-8deg)",
        }}
      >
        POW!
      </div>
    </AbsoluteFill>
  );
};

export const punchContentOffset = (frame: number, durationInFrames: number): number => {
  const hit = Math.floor(durationInFrames * 0.55);
  return interpolate(frame, [hit, durationInFrames], [0, 2600], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

// ── Conqueror's Haki aura ───────────────────────────────────────────────
export const HakiAura: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 0.5 + 0.5 * Math.sin(frame / 4);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 55%, rgba(230,40,30,${0.12 + pulse * 0.18}) 0%, transparent 55%)`,
        }}
      />
      <AbsoluteFill
        style={{
          boxShadow: `inset 0 0 ${120 + pulse * 80}px rgba(180,20,20,0.55)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ── Speed lines ─────────────────────────────────────────────────────────
export const SpeedLines: React.FC = () => {
  const frame = useCurrentFrame();
  const shift = (frame * 31) % 60;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: 0.35,
        backgroundImage:
          "repeating-linear-gradient(90deg, transparent 0px, transparent 40px, rgba(255,255,255,0.8) 41px, transparent 43px)",
        backgroundPosition: `${-shift}px 0`,
        maskImage:
          "linear-gradient(90deg, #000 0%, transparent 30%, transparent 70%, #000 100%)",
        WebkitMaskImage:
          "linear-gradient(90deg, #000 0%, transparent 30%, transparent 70%, #000 100%)",
      }}
    />
  );
};

// ── Narrator scene: silhouetted hoodie avatar, brick wall, mic, neon ────
export const NarratorScene: React.FC<{ icons?: string[] }> = ({ icons = [] }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / 14) * 4;
  const neonPulse = 0.75 + 0.25 * Math.sin(frame / 8);

  return (
    <AbsoluteFill
      style={{
        background:
          "repeating-linear-gradient(0deg, #1c1614 0px, #1c1614 44px, #120e0c 44px, #120e0c 48px), repeating-linear-gradient(90deg, #1c1614 0px, #1c1614 96px, #120e0c 96px, #120e0c 100px)",
        backgroundBlendMode: "darken",
        alignItems: "center",
        justifyContent: "flex-end",
        flexDirection: "column",
      }}
    >
      {/* dark wash */}
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, transparent 30%, rgba(0,0,0,0.75) 100%)" }} />

      {/* neon jolly roger sign (stylized placeholder) */}
      <div
        style={{
          position: "absolute",
          top: 90,
          right: 140,
          padding: "18px 34px",
          border: "4px solid #a86bff",
          borderRadius: 14,
          fontFamily: FONT_IMPACT,
          fontWeight: 900,
          fontSize: 34,
          color: "#ffd75e",
          textShadow: `0 0 ${14 * neonPulse}px #ffd75e, 0 0 30px #a86bff`,
          boxShadow: `0 0 ${26 * neonPulse}px rgba(168,107,255,0.8), inset 0 0 18px rgba(168,107,255,0.4)`,
          transform: "rotate(3deg)",
        }}
      >
        ☠ JOLLY ROGER
      </div>

      {/* manga shelf hint */}
      <div style={{ position: "absolute", top: 120, left: 110, display: "flex", gap: 8 }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              width: 26,
              height: 120,
              background: ["#b23a34", "#2f5f8f", "#c9922f", "#3f7f4f", "#7a4f9f", "#b23a34"][i],
              borderRadius: 3,
              transform: i === 4 ? "rotate(7deg) translateY(6px)" : "none",
            }}
          />
        ))}
      </div>

      {/* hoodie silhouette */}
      <svg width="620" height="560" viewBox="0 0 620 560" style={{ transform: `translateY(${bob}px)` }}>
        <ellipse cx="310" cy="600" rx="300" ry="120" fill="#08070a" />
        <path
          d="M 130 560 C 130 380 190 330 230 310 C 200 270 200 190 260 150 C 300 120 360 120 400 150 C 460 190 460 270 430 310 C 470 330 530 380 530 560 Z"
          fill="#0c0a10"
          stroke="#241f2e"
          strokeWidth="5"
        />
        <ellipse cx="330" cy="235" rx="88" ry="98" fill="#050408" />
      </svg>

      {/* studio microphone */}
      <div style={{ position: "absolute", bottom: 120, left: 300 }}>
        <div style={{ width: 74, height: 120, background: "#2a2a30", borderRadius: 36, border: "4px solid #444" }} />
        <div style={{ width: 10, height: 90, background: "#444", marginLeft: 32 }} />
      </div>

      {/* side icon slots */}
      {icons.map((label, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 320 + Math.floor(i / 2) * 270,
            left: i % 2 === 0 ? 130 : undefined,
            right: i % 2 === 1 ? 130 : undefined,
            width: 240,
            height: 240,
            transform: `translateY(${Math.sin(frame / 10 + i * 2) * 8}px)`,
          }}
        >
          <AssetSlot slot={{ id: `icon-${i}`, label }} mini />
        </div>
      ))}
    </AbsoluteFill>
  );
};
