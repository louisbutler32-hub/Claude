import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import {
  clamp01,
  cornerPinMatrix,
  easeOutCubic,
  easeOutQuint,
  Point,
  ramp,
} from "./perspective";

// ── Config ─────────────────────────────────────────────────────────────
// Every knob lives here. Pass a partial object; anything you leave out
// falls back to DEFAULT_TITLE. All timings are in SECONDS (not frames) so
// they stay correct if you change the composition's fps.

export type TitleConfig = {
  // ── Text ──
  /** Large main line, e.g. "NAKAJIMA KATE". */
  title: string;
  /** Small documentary label above/beside it, e.g. "JAPANESE CARRIER". */
  eyebrow?: string;

  // ── Type ──
  fontFamily: string;
  titleSize: number;
  titleWeight: number;
  /** Letter-spacing in px. Bold documentary titles sit near 0–4. */
  titleTracking: number;
  eyebrowSize: number;
  eyebrowWeight: number;
  eyebrowTracking: number;
  eyebrowPlacement: "above" | "beside";
  /** Gap between eyebrow and title, in px. */
  eyebrowGap: number;
  /** Eyebrow can start slightly before (−) or after (+) the title, seconds. */
  eyebrowDelay: number;
  color: string;
  /** Master opacity of the whole card, 0–1. */
  opacity: number;
  lineHeight: number;

  // ── Placement ──
  /** Anchor point in composition pixels. The plane rotates around this
   *  point, so nudging the angle does not send the text flying off. */
  x: number;
  y: number;
  /** Which part of the text block sits on the anchor point. */
  anchor: "left" | "center" | "right";

  // ── 3D ──
  /** Camera distance in px. Smaller = stronger, wider-lens perspective.
   *  1200–2600 looks like a real lens; below ~700 gets exaggerated. */
  perspective: number;
  /** Vanishing point, in composition px. Defaults to frame centre. */
  perspectiveOriginX?: number;
  perspectiveOriginY?: number;
  /** Tilt back/forward (deg). Positive tips the top edge away. */
  rotateX: number;
  /** Swing (deg). Negative sends the RIGHT edge away from camera. */
  rotateY: number;
  /** Roll in the picture plane (deg). Keep tiny — 0 to ±4. */
  rotateZ: number;
  scale: number;
  /** Corner pin overrides rotateX/Y/Z entirely: four screen-space points
   *  in TL, TR, BR, BL order that the text plane is warped into. Trace
   *  them off a floor/wall in the footage for a perfect lock. */
  cornerPin?: [Point, Point, Point, Point] | null;
  /** Plane box used by corner-pin mode (the rect being warped). */
  planeWidth: number;
  planeHeight: number;

  // ── Depth cues ──
  /** Contact shadow, 0–1. */
  shadowStrength: number;
  shadowOffset: number;
  shadowBlur: number;
  /** Wide, soft dark spread that beds the text into the plate, 0–1. */
  softness: number;

  // ── Animation (seconds) ──
  /** Global multiplier: 2 = twice as fast, 0.5 = half speed. */
  speed: number;
  startDelay: number;
  /** Reveal window, first char to last. 0.25–0.45 reads as "fast typing". */
  revealDuration: number;
  /** How long a single character takes to resolve. */
  charFade: number;
  /** Per-character horizontal catch-up, px. */
  charSlide: number;
  /** Per-character motion blur during the reveal, px. 0 disables. */
  charBlur: number;
  /** How far the whole block slides in, px (plane-local, so it slides
   *  along the 3D surface, not across the screen). */
  slideDistance: number;
  /** Block-level fade-in. */
  fadeIn: number;
  /** How much of the reveal window the hard wipe edge covers, 0–1. */
  wipeSpan: number;

  // ── Settle / drift ──
  /** Slow post-reveal push, px. Keeps it from looking pasted on. */
  idleDrift: number;
  /** Slow post-reveal scale-up, e.g. 0.012 = +1.2%. */
  idleScale: number;
  /** Seconds over which the drift plays out before settling. */
  idleDuration: number;

  // ── Exit (optional) ──
  /** Seconds from card start. null = never leaves. */
  exitStart: number | null;
  exitDuration: number;

  /** Draws the plane box + anchor point. Handy while lining up to plate. */
  debug: boolean;
};

export const DEFAULT_TITLE: TitleConfig = {
  title: "TITLE",
  eyebrow: undefined,

  fontFamily:
    '"Helvetica Neue", Helvetica, "Liberation Sans", Arial, sans-serif',
  titleSize: 132,
  titleWeight: 700,
  titleTracking: 1,
  eyebrowSize: 42,
  eyebrowWeight: 600,
  eyebrowTracking: 7,
  eyebrowPlacement: "above",
  eyebrowGap: 10,
  eyebrowDelay: -0.03,
  color: "#ffffff",
  opacity: 1,
  lineHeight: 1.02,

  x: 200,
  y: 540,
  anchor: "left",

  perspective: 1700,
  rotateX: 6,
  rotateY: -19,
  rotateZ: -1.5,
  scale: 1,
  cornerPin: null,
  planeWidth: 1200,
  planeHeight: 320,

  shadowStrength: 0.55,
  shadowOffset: 3,
  shadowBlur: 14,
  softness: 0.35,

  speed: 1,
  startDelay: 0.05,
  revealDuration: 0.35,
  charFade: 0.07,
  charSlide: 9,
  charBlur: 1.6,
  slideDistance: 34,
  fadeIn: 0.1,
  wipeSpan: 0.88,

  idleDrift: 7,
  idleScale: 0.012,
  idleDuration: 6,

  exitStart: null,
  exitDuration: 0.4,

  debug: false,
};

export const makeTitle = (
  ...parts: Array<Partial<TitleConfig>>
): TitleConfig => Object.assign({}, DEFAULT_TITLE, ...parts);

// ── Shadow ─────────────────────────────────────────────────────────────
// Two tight offset copies read as a contact shadow; one wide low-alpha
// copy beds the type into the plate. No outline, no glow, no bevel.

const buildShadow = (c: TitleConfig, scale: number): string => {
  const layers: string[] = [];
  if (c.shadowStrength > 0) {
    layers.push(
      `0 ${c.shadowOffset * scale}px ${c.shadowBlur * scale}px rgba(0,0,0,${(
        0.5 * c.shadowStrength
      ).toFixed(3)})`
    );
    layers.push(
      `0 ${c.shadowOffset * 0.35 * scale}px ${(c.shadowBlur * 0.3 * scale).toFixed(
        2
      )}px rgba(0,0,0,${(0.32 * c.shadowStrength).toFixed(3)})`
    );
  }
  if (c.softness > 0) {
    layers.push(
      `0 0 ${(26 * c.softness * scale).toFixed(1)}px rgba(0,0,0,${(
        0.34 * c.softness
      ).toFixed(3)})`
    );
  }
  return layers.length ? layers.join(", ") : "none";
};

// ── Per-character reveal ───────────────────────────────────────────────
// A hard wipe edge travels left→right; characters resolve just behind it,
// each fading and sliding a few px into place. Together they read as very
// fast typing rather than a plain wipe or a plain fade.

const RevealLine: React.FC<{
  text: string;
  t: number;
  start: number;
  cfg: TitleConfig;
  style: React.CSSProperties;
}> = ({ text, t, start, cfg, style }) => {
  const chars = Array.from(text);
  const n = chars.length;

  const reveal = cfg.revealDuration / cfg.speed;
  const fade = cfg.charFade / cfg.speed;
  const span = Math.max(reveal - fade, 1e-4);

  const wipe = ramp(t, start, start + reveal * cfg.wipeSpan);
  // Negative insets on the other three sides so the wipe never crops
  // descenders or the soft shadow.
  const clipPath =
    wipe >= 1
      ? undefined
      : `inset(-40% ${((1 - easeOutQuint(wipe)) * 106).toFixed(2)}% -40% -6%)`;

  return (
    <span style={{ ...style, display: "block", clipPath, whiteSpace: "nowrap" }}>
      {chars.map((ch, i) => {
        const t0 = start + (n <= 1 ? 0 : i / (n - 1)) * span;
        const p = clamp01((t - t0) / fade);
        const e = easeOutCubic(p);
        const blur = cfg.charBlur * (1 - e);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              opacity: p,
              transform: `translateX(${((1 - e) * cfg.charSlide).toFixed(2)}px)`,
              filter: blur > 0.06 ? `blur(${blur.toFixed(2)}px)` : undefined,
              willChange: "opacity, transform",
            }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
};

// ── The card ───────────────────────────────────────────────────────────

export const PerspectiveTitle: React.FC<{ config: Partial<TitleConfig> }> = ({
  config,
}) => {
  const cfg = makeTitle(config);
  const { fps, width, height } = useVideoConfig();
  const t = useCurrentFrame() / fps;

  const delay = cfg.startDelay / cfg.speed;
  const reveal = cfg.revealDuration / cfg.speed;

  // Block-level slide + fade. The slide runs in plane-local space, so it
  // travels along the 3D surface and inherits its perspective foreshortening.
  const slideP = easeOutCubic(ramp(t, delay, delay + reveal));
  const slideX = cfg.slideDistance * (1 - slideP);
  const fadeIn = ramp(t, delay, delay + cfg.fadeIn / cfg.speed);

  // Post-reveal settle: a slow push that never quite stops during the hold.
  const tIdle = Math.max(0, t - (delay + reveal));
  const idleP = cfg.idleDuration > 0 ? clamp01(tIdle / cfg.idleDuration) : 0;
  const breathe = Math.sin((tIdle / 7) * Math.PI * 2) * 0.35;
  const driftX = cfg.idleDrift * idleP + breathe;
  const idleScale = 1 + cfg.idleScale * idleP;

  const exitP =
    cfg.exitStart === null
      ? 0
      : ramp(t, cfg.exitStart, cfg.exitStart + cfg.exitDuration);
  const exitFade = 1 - easeOutCubic(exitP);
  const exitDrift = easeOutCubic(exitP) * 14;

  const opacity = cfg.opacity * fadeIn * exitFade;
  if (opacity <= 0.001) return null;

  const shadow = buildShadow(cfg, 1);

  const titleStyle: React.CSSProperties = {
    fontFamily: cfg.fontFamily,
    fontSize: cfg.titleSize,
    fontWeight: cfg.titleWeight,
    letterSpacing: cfg.titleTracking,
    lineHeight: cfg.lineHeight,
    color: cfg.color,
    textShadow: shadow,
  };
  const eyebrowStyle: React.CSSProperties = {
    fontFamily: cfg.fontFamily,
    fontSize: cfg.eyebrowSize,
    fontWeight: cfg.eyebrowWeight,
    letterSpacing: cfg.eyebrowTracking,
    lineHeight: 1.1,
    color: cfg.color,
    textShadow: shadow,
  };

  const beside = cfg.eyebrowPlacement === "beside";
  const eyebrowStart = delay + cfg.eyebrowDelay / cfg.speed;

  const content = (
    <div
      style={{
        display: "flex",
        flexDirection: beside ? "row" : "column",
        alignItems: beside
          ? "baseline"
          : cfg.anchor === "center"
          ? "center"
          : cfg.anchor === "right"
          ? "flex-end"
          : "flex-start",
        gap: cfg.eyebrowGap,
        transform: `translateX(${(slideX + driftX + exitDrift).toFixed(2)}px) scale(${idleScale.toFixed(
          4
        )})`,
        transformOrigin: `${
          cfg.anchor === "center" ? "50%" : cfg.anchor === "right" ? "100%" : "0%"
        } 50%`,
        willChange: "transform",
      }}
    >
      {cfg.eyebrow ? (
        <RevealLine
          text={cfg.eyebrow}
          t={t}
          start={eyebrowStart}
          cfg={cfg}
          style={eyebrowStyle}
        />
      ) : null}
      <RevealLine
        text={cfg.title}
        t={t}
        start={delay}
        cfg={cfg}
        style={titleStyle}
      />
    </div>
  );

  // ── Corner-pin mode: warp the plane box into four screen points ──────
  if (cfg.cornerPin) {
    const matrix = cornerPinMatrix(cfg.planeWidth, cfg.planeHeight, cfg.cornerPin);
    return (
      <AbsoluteFill style={{ opacity }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: cfg.planeWidth,
            height: cfg.planeHeight,
            transform: matrix,
            transformOrigin: "0 0",
            display: "flex",
            alignItems: "center",
            justifyContent:
              cfg.anchor === "center"
                ? "center"
                : cfg.anchor === "right"
                ? "flex-end"
                : "flex-start",
            outline: cfg.debug ? "2px dashed rgba(255,0,80,0.9)" : undefined,
          }}
        >
          {content}
        </div>
      </AbsoluteFill>
    );
  }

  // ── Angle mode: a real perspective camera ────────────────────────────
  const px = cfg.perspectiveOriginX ?? width / 2;
  const py = cfg.perspectiveOriginY ?? height / 2;
  const anchorShift =
    cfg.anchor === "center" ? "-50%" : cfg.anchor === "right" ? "-100%" : "0%";

  return (
    <AbsoluteFill
      style={{
        opacity,
        perspective: `${cfg.perspective}px`,
        perspectiveOrigin: `${px}px ${py}px`,
      }}
    >
      <div style={{ position: "absolute", left: cfg.x, top: cfg.y }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "max-content",
            transform: `rotateX(${cfg.rotateX}deg) rotateY(${cfg.rotateY}deg) rotateZ(${cfg.rotateZ}deg) scale(${cfg.scale})`,
            transformOrigin: "0 0",
            transformStyle: "preserve-3d",
          }}
        >
          <div
            style={{
              transform: `translate(${anchorShift}, -50%)`,
              outline: cfg.debug ? "2px dashed rgba(255,0,80,0.9)" : undefined,
            }}
          >
            {content}
          </div>
        </div>
        {cfg.debug ? (
          <div
            style={{
              position: "absolute",
              left: -6,
              top: -6,
              width: 12,
              height: 12,
              borderRadius: 6,
              background: "rgba(255,0,80,0.95)",
            }}
          />
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
