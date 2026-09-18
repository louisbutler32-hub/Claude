// ── Narration as the master clock ─────────────────────────────────────
// Every visual beat in a short is keyed to when a line of narration
// starts, so a regenerated voice re-times the whole edit for free.

export type Line = {
  id: string;
  scene: string;
  text: string;
  start: number;
  end: number;
  cap?: string[];
  words?: [string, number, number][];
};

export type Beats = Record<string, { start: number; end: number; next: number }>;

/** scene name → when that line starts, ends, and when the following line
 *  starts (the natural end of its visual beat). */
export const beatsOf = (lines: Line[], total: number): Beats => {
  const out: Beats = {};
  lines.forEach((l, i) => {
    const next = lines[i + 1] ? lines[i + 1].start : total;
    if (!out[l.scene]) out[l.scene] = { start: l.start, end: l.end, next };
    else out[l.scene].next = next;
  });
  return out;
};

/** The start of a scene, or a clear error naming the scene that is missing. */
export const at = (beats: Beats, scene: string): number => {
  const b = beats[scene];
  if (!b) throw new Error(`no narration line with scene "${scene}"`);
  return b.start;
};
