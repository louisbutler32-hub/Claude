// ── Timing helpers ────────────────────────────────────────────────────
// Everything in a short is timed in seconds off the narration, so these
// take `t` (seconds into the composition) rather than frames.

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** 0 before `from`, 1 after `to`, linear between. */
export const ramp = (t: number, from: number, to: number) =>
  to <= from ? (t >= from ? 1 : 0) : clamp01((t - from) / (to - from));

export const easeOut = (p: number) => 1 - Math.pow(1 - clamp01(p), 3);
export const easeIn = (p: number) => Math.pow(clamp01(p), 3);
export const easeInOut = (p: number) =>
  p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

/** A pop with a little overshoot: 0 → 1.08 → 1. */
export const overshoot = (p: number) => {
  const x = clamp01(p);
  const c = 1.70158 * 1.2;
  return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};

/** Fade in at `from`, hold, fade out at `until`. */
export const alive = (t: number, from: number, until?: number, fade = 0.35): number => {
  const on = easeOut(ramp(t, from, from + fade));
  if (until === undefined) return on;
  const off = 1 - easeIn(ramp(t, until - fade, until));
  return Math.min(on, off);
};

/** Progress of a beat that starts at `from` and lasts `dur`. */
export const beat = (t: number, from: number, dur: number) => ramp(t, from, from + dur);

/** A slow breathing pulse in [0, 1]. */
export const pulse = (t: number, period = 1.6) => 0.5 + 0.5 * Math.sin((t / period) * Math.PI * 2);

export const mmss = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
