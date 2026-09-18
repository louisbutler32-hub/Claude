import React from "react";
import { AbsoluteFill } from "remotion";
import { FONT_CAPTION, FONT_SANS, FONT_SERIF } from "./fonts";
import { useGeo } from "./GeoCanvas";
import { Icon, IconKey } from "./icons";
import { alive, beat, clamp01, easeOut, overshoot, pulse } from "./motion";
import { LonLat } from "./projection";

// ── HUD ───────────────────────────────────────────────────────────────
// HTML pinned to the screen: the money callouts, the big year, the slam,
// the reasons row, and the captions. Anything here can also be anchored
// to a place on the ground with `at`, in which case it rides the camera.

const usePos = (at?: LonLat, x?: number, y?: number, dx = 0, dy = 0): [number, number] => {
  const { point, width } = useGeo();
  if (at) {
    const [px, py] = point(at);
    return [px + dx, py + dy];
  }
  return [(x ?? width / 2) + dx, (y ?? 0) + dy];
};

/** A full-screen HTML layer that fades in and out. Panels and diagrams sit
 *  in one of these. */
export const Overlay: React.FC<{
  in: number;
  until?: number;
  fade?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ in: from, until, fade = 0.45, style, children }) => {
  const { t } = useGeo();
  const a = alive(t, from, until, fade);
  if (a <= 0.001) return null;
  return <AbsoluteFill style={{ opacity: a, ...style }}>{children}</AbsoluteFill>;
};

// ── Callout ───────────────────────────────────────────────────────────
// "7.2 MILLION $" with a coin. Engraved serif, a glow, an icon.

export const Callout: React.FC<{
  text: string;
  sub?: string;
  icon?: IconKey;
  in: number;
  until?: number;
  x?: number;
  y?: number;
  at?: LonLat;
  dx?: number;
  dy?: number;
  size?: number;
  color?: string;
  glow?: string;
  font?: "serif" | "sans" | "caption";
  weight?: number;
  iconSize?: number;
  fade?: number;
  align?: "center" | "left" | "right";
  pulseGlow?: boolean;
}> = ({
  text,
  sub,
  icon,
  in: from,
  until,
  x,
  y,
  at,
  dx = 0,
  dy = 0,
  size = 60,
  color = "#ffffff",
  glow = "rgba(255,225,140,0.9)",
  font = "serif",
  weight = 700,
  iconSize,
  fade = 0.35,
  align = "center",
  pulseGlow = true,
}) => {
  const { t } = useGeo();
  const [px, py] = usePos(at, x, y, dx, dy);
  const a = alive(t, from, until, fade);
  if (a <= 0.001) return null;
  const pop = overshoot(beat(t, from, 0.5));
  const scale = 0.5 + 0.5 * pop;
  const g = pulseGlow ? 14 + 10 * pulse(t, 1.9) : 16;
  const family = font === "serif" ? FONT_SERIF : font === "sans" ? FONT_SANS : FONT_CAPTION;
  const translate = align === "center" ? "-50%" : align === "right" ? "-100%" : "0%";
  return (
    <div
      style={{
        position: "absolute",
        left: px,
        top: py,
        transform: `translate(${translate}, -50%) scale(${scale})`,
        opacity: a,
        display: "flex",
        alignItems: "center",
        gap: size * 0.28,
        whiteSpace: "nowrap",
        transformOrigin: align === "center" ? "center" : align === "right" ? "right center" : "left center",
      }}
    >
      {icon ? (
        <div style={{ filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.6))" }}>
          <Icon icon={icon} size={iconSize ?? size * 1.15} />
        </div>
      ) : null}
      <div style={{ display: "flex", flexDirection: "column", alignItems: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start" }}>
        <div
          style={{
            fontFamily: family,
            fontWeight: weight,
            fontSize: size,
            lineHeight: 1.05,
            color,
            letterSpacing: font === "serif" ? "0.04em" : "0.01em",
            textShadow: `0 0 ${g}px ${glow}, 0 0 ${g * 2}px ${glow}, 0 3px 8px rgba(0,0,0,0.75)`,
          }}
        >
          {text}
        </div>
        {sub ? (
          <div
            style={{
              fontFamily: FONT_CAPTION,
              fontWeight: 600,
              fontSize: size * 0.42,
              color: "#ffffff",
              opacity: 0.9,
              marginTop: size * 0.08,
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
              letterSpacing: "0.02em",
            }}
          >
            {sub}
          </div>
        ) : null}
      </div>
    </div>
  );
};

// ── Big number ────────────────────────────────────────────────────────
// "1867": a year or a figure, geometric bold, big.

export const BigNumber: React.FC<{
  text: string;
  in: number;
  until?: number;
  x?: number;
  y?: number;
  at?: LonLat;
  dx?: number;
  dy?: number;
  size?: number;
  color?: string;
  fade?: number;
  weight?: number;
}> = ({ text, in: from, until, x, y, at, dx = 0, dy = 0, size = 150, color = "#ffffff", fade = 0.35, weight = 800 }) => {
  const { t } = useGeo();
  const [px, py] = usePos(at, x, y, dx, dy);
  const a = alive(t, from, until, fade);
  if (a <= 0.001) return null;
  const pop = overshoot(beat(t, from, 0.5));
  return (
    <div
      style={{
        position: "absolute",
        left: px,
        top: py,
        transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * pop})`,
        opacity: a,
        fontFamily: FONT_SANS,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1,
        color,
        letterSpacing: "0.01em",
        textShadow: "0 0 24px rgba(255,255,255,0.45), 0 4px 12px rgba(0,0,0,0.8)",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

// ── Slam ──────────────────────────────────────────────────────────────
// "Economically Unfeasible": red, raked in 3D, slammed down onto the map.

export const Slam: React.FC<{
  text: string;
  in: number;
  until?: number;
  y?: number;
  size?: number;
  color?: string;
  fade?: number;
}> = ({ text, in: from, until, y, size = 120, color = "#e5322d", fade = 0.3 }) => {
  const { t, height } = useGeo();
  const a = alive(t, from, until, fade);
  if (a <= 0.001) return null;
  const p = easeOut(beat(t, from, 0.32));
  const scale = 2.6 - 1.6 * p;
  const shake = p >= 1 ? Math.sin((t - from) * 60) * Math.max(0, 1 - (t - from - 0.32) * 4) * 4 : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: y ?? height * 0.42,
        width: "max-content",
        transform: `translate(-50%, -50%) perspective(900px) rotateX(22deg) rotateZ(-7deg) scale(${scale}) translate(${shake}px, 0)`,
        opacity: a * Math.min(1, p * 2),
        fontFamily: FONT_SANS,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        color,
        whiteSpace: "pre-line",
        textAlign: "center",
        letterSpacing: "-0.01em",
        textShadow: "0 2px 0 #7a1410, 0 4px 0 #6a1010, 0 6px 0 #5a0d0d, 0 10px 24px rgba(0,0,0,0.7)",
      }}
    >
      {text}
    </div>
  );
};

// ── Reasons row ───────────────────────────────────────────────────────
// Circled icons popping in one after another, optionally summing to a
// result: "depth + currents + rock + quakes = $".

export const IconRow: React.FC<{
  icons: IconKey[];
  in: number;
  until?: number;
  y?: number;
  gap?: number;
  size?: number;
  result?: string;
  step?: number;
  ring?: string;
  fade?: number;
}> = ({ icons, in: from, until, y, gap = 0.55, size = 132, result, step, ring = "#e63946", fade = 0.35 }) => {
  const { t, width } = useGeo();
  const a = alive(t, from, until, fade);
  if (a <= 0.001) return null;
  const s = step ?? gap;
  const n = icons.length + (result ? 1 : 0);
  const pitch = Math.min(size * 1.35, (width - 80) / n);
  const x0 = width / 2 - (pitch * (n - 1)) / 2;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: a }}>
      {icons.map((icon, i) => {
        const pop = overshoot(beat(t, from + i * s, 0.45));
        if (pop <= 0) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x0 + i * pitch,
              top: y,
              width: size,
              height: size,
              transform: `translate(-50%, -50%) scale(${pop})`,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.96)",
              border: `${size * 0.06}px solid ${ring}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 18px rgba(0,0,0,0.5)",
            }}
          >
            <Icon icon={icon} size={size * 0.56} color="#0d2f45" />
          </div>
        );
      })}
      {result ? (
        <div
          style={{
            position: "absolute",
            left: x0 + icons.length * pitch,
            top: y,
            transform: `translate(-50%, -50%) scale(${overshoot(beat(t, from + icons.length * s, 0.45))})`,
            fontFamily: FONT_SANS,
            fontWeight: 900,
            fontSize: size * 0.8,
            color: "#2ecc71",
            textShadow: "0 0 18px rgba(46,204,113,0.8), 0 4px 10px rgba(0,0,0,0.7)",
            whiteSpace: "nowrap",
          }}
        >
          {result}
        </div>
      ) : null}
    </div>
  );
};

// ── Captions ──────────────────────────────────────────────────────────
// The narration, a phrase at a time, in the small white sans the reference
// channel uses — sentence case, no animation, a soft shadow, sat at 80% of
// the frame. Chunks come from the script ("cap"), or are cut every four
// words, and share the line's time in proportion to their length.

export type CaptionLine = {
  text: string;
  start: number;
  end: number;
  cap?: string[];
  /** per-word timings from scripts/align-words.py, for one-word captions */
  words?: [string, number, number][];
};

const autoChunk = (text: string): string[] => {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const out: string[] = [];
  let cur: string[] = [];
  for (const w of words) {
    cur.push(w);
    const punct = /[.,;:!?—]$/.test(w);
    if (cur.length >= 4 || (punct && cur.length >= 2)) {
      out.push(cur.join(" "));
      cur = [];
    }
  }
  if (cur.length) {
    if (cur.length === 1 && out.length) out[out.length - 1] += " " + cur[0];
    else out.push(cur.join(" "));
  }
  return out;
};

const strip = (s: string) => s.replace(/[.;:!?]+$/g, "").replace(/,$/g, "");

export const captionAt = (lines: CaptionLine[], t: number): string | null => {
  for (const line of lines) {
    if (t < line.start || t >= line.end + 0.12) continue;
    const chunks = (line.cap && line.cap.length ? line.cap : autoChunk(line.text)).map(strip);
    const weights = chunks.map((c) => Math.max(4, c.replace(/[^a-z0-9]/gi, "").length + 2));
    const total = weights.reduce((a, b) => a + b, 0);
    const span = line.end - line.start;
    let acc = line.start;
    for (let i = 0; i < chunks.length; i++) {
      const dur = (span * weights[i]) / total;
      if (t < acc + dur || i === chunks.length - 1) return chunks[i];
      acc += dur;
    }
  }
  return null;
};

/** The word being spoken at `t`, with when it started. Uses the aligned
 *  timings when the line has them, else shares the line's time out by
 *  word length. A word holds through the pause after it until the next
 *  word starts, so the screen is never blank mid-line. */
export const wordAt = (lines: CaptionLine[], t: number): { word: string; start: number } | null => {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const next = lines[i + 1];
    const lineEnd = next ? next.start : line.end + 0.3;
    if (t < line.start || t >= lineEnd) continue;
    const words: [string, number, number][] =
      line.words && line.words.length
        ? line.words
        : (() => {
            const ws = line.text.split(/\s+/).filter(Boolean);
            const weights = ws.map((w) => Math.max(2, w.replace(/[^a-z0-9]/gi, "").length));
            const total = weights.reduce((a, b) => a + b, 0);
            let acc = line.start;
            return ws.map((w, k) => {
              const d = ((line.end - line.start) * weights[k]) / total;
              const out: [string, number, number] = [w, acc, acc + d];
              acc += d;
              return out;
            });
          })();
    for (let k = 0; k < words.length; k++) {
      const [w, ws] = words[k];
      const until = k + 1 < words.length ? words[k + 1][1] : lineEnd;
      if (t >= ws && t < until) return { word: w, start: ws };
    }
    // before the first word of the line: show nothing
    return null;
  }
  return null;
};

const NUMBERISH = /[0-9%$]/;

/** One word at a time, bigger, and up at two thirds of the frame so the
 *  Shorts title and channel overlay never sit on top of it. Each word pops
 *  in; numbers go yellow. */
export const WordCaptions: React.FC<{ lines: CaptionLine[]; y?: number; size?: number }> = ({ lines, y, size = 76 }) => {
  const { t, height, width } = useGeo();
  const hit = wordAt(lines, t);
  if (!hit) return null;
  const pop = overshoot(beat(t, hit.start, 0.14));
  const word = hit.word.replace(/[.;:!?,]+$/g, "");
  const yellow = NUMBERISH.test(word);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width,
        top: (y ?? height * 0.66) - size * 0.7,
        textAlign: "center",
        fontFamily: FONT_SANS,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.2,
        color: yellow ? "#ffd23f" : "#ffffff",
        letterSpacing: "0.005em",
        transform: `scale(${0.82 + 0.18 * pop})`,
        transformOrigin: "center",
        textShadow: "0 3px 0 rgba(0,0,0,0.55), 0 4px 18px rgba(0,0,0,0.85), 0 0 4px rgba(0,0,0,0.7)",
        WebkitTextStroke: "2px rgba(0,0,0,0.45)",
        paintOrder: "stroke fill",
        padding: "0 40px",
        boxSizing: "border-box",
      }}
    >
      {word}
    </div>
  );
};

export const Captions: React.FC<{ lines: CaptionLine[]; y?: number; size?: number }> = ({ lines, y, size = 46 }) => {
  const { t, height, width } = useGeo();
  const text = captionAt(lines, t);
  if (!text) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width,
        top: (y ?? height * 0.805) - size * 0.7,
        textAlign: "center",
        fontFamily: FONT_CAPTION,
        fontWeight: 600,
        fontSize: size,
        lineHeight: 1.25,
        color: "#ffffff",
        letterSpacing: "0.005em",
        textShadow: "0 2px 14px rgba(0,0,0,0.85), 0 0 3px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.9)",
        padding: "0 60px",
        boxSizing: "border-box",
      }}
    >
      {text}
    </div>
  );
};

/** A short label pinned to the screen: "International Date Line". */
export const Tag: React.FC<{
  text: string;
  in: number;
  until?: number;
  x?: number;
  y?: number;
  at?: LonLat;
  dx?: number;
  dy?: number;
  size?: number;
  color?: string;
  bg?: string;
  fade?: number;
  rotate?: number;
}> = ({ text, in: from, until, x, y, at, dx = 0, dy = 0, size = 30, color = "#ffffff", bg = "rgba(13,47,69,0.85)", fade = 0.3, rotate = 0 }) => {
  const { t } = useGeo();
  const [px, py] = usePos(at, x, y, dx, dy);
  const a = alive(t, from, until, fade);
  if (a <= 0.001) return null;
  const pop = overshoot(beat(t, from, 0.4));
  return (
    <div
      style={{
        position: "absolute",
        left: px,
        top: py,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${0.6 + 0.4 * pop})`,
        opacity: a,
        fontFamily: FONT_CAPTION,
        fontWeight: 700,
        fontSize: size,
        color,
        background: bg,
        padding: `${size * 0.25}px ${size * 0.6}px`,
        borderRadius: size,
        whiteSpace: "nowrap",
        boxShadow: "0 4px 14px rgba(0,0,0,0.5)",
        letterSpacing: "0.02em",
      }}
    >
      {text}
    </div>
  );
};

/** Progress-free helper for scene files: clamp a beat to 0-1. */
export const p01 = clamp01;
