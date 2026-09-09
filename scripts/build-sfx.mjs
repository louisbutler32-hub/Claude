// Builds the sound bed for a map short, from scratch.
//
//   node scripts/build-sfx.mjs
//
// Nothing is sampled or downloaded — every sound here is synthesised, so
// there is no library to license and no attribution to carry. Retime a film
// by editing its CUES table; the numbers are seconds and match the ones in
// the composition.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RATE = 48000;

// ── Voices ─────────────────────────────────────────────────────────────

/** Deterministic noise, so a rebuild sounds identical to the last one. */
const noise = (() => {
  let seed = 22222;
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed / 0x3fffffff) - 1;
  };
})();

const clamp = (v) => Math.max(-1, Math.min(1, v));

/** A whoosh: noise pushed through a filter that opens and shuts again, so
 *  it reads as something passing the camera rather than a hiss. */
const whoosh = (buf, at, dur, gain = 0.5) => {
  const start = Math.floor(at * RATE);
  const n = Math.floor(dur * RATE);
  let lp = 0;
  let hp = 0;
  let prev = 0;
  for (let i = 0; i < n; i++) {
    const u = i / n;
    // bell-shaped envelope, weighted to the front
    const env = Math.pow(Math.sin(Math.PI * Math.pow(u, 0.7)), 1.6);
    const cut = 0.02 + 0.5 * Math.sin(Math.PI * u); // filter sweeps open, then shuts
    const x = noise();
    lp += cut * (x - lp);
    hp = 0.92 * (hp + lp - prev);
    prev = lp;
    const s = hp * env * gain;
    const j = (start + i) * 2;
    if (j + 1 < buf.length) {
      // widen it a touch: the two ears get slightly different filtering
      buf[j] += s;
      buf[j + 1] += s * 0.86 + lp * env * gain * 0.14;
    }
  }
};

/** A low impact: a pitch-dropping sine with a short noise transient. */
const impact = (buf, at, gain = 0.7, freq = 58, dur = 1.5) => {
  const start = Math.floor(at * RATE);
  const n = Math.floor(dur * RATE);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const u = i / n;
    const env = Math.exp(-u * 6);
    const f = freq * (1 - 0.45 * u); // the drop is what makes it land
    phase += (2 * Math.PI * f) / RATE;
    const body = Math.sin(phase) * env;
    const click = i < RATE * 0.012 ? noise() * (1 - i / (RATE * 0.012)) * 0.5 : 0;
    const s = (body + click) * gain;
    const j = (start + i) * 2;
    if (j + 1 < buf.length) {
      buf[j] += s;
      buf[j + 1] += s;
    }
  }
};

/** Wind: broadband noise, slowly modulated. The dust storm. */
const wind = (buf, at, dur, gain = 0.25) => {
  const start = Math.floor(at * RATE);
  const n = Math.floor(dur * RATE);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const u = i / n;
    const env = Math.min(1, u * 4) * Math.min(1, (1 - u) * 3);
    const gust = 0.6 + 0.4 * Math.sin(u * Math.PI * 6) * Math.sin(u * Math.PI * 2.3);
    lp += 0.06 * (noise() - lp);
    const s = lp * env * gust * gain * 3;
    const j = (start + i) * 2;
    if (j + 1 < buf.length) {
      buf[j] += s * 1.05;
      buf[j + 1] += s * 0.95;
    }
  }
};

/** A small dry tick — one tree going in. */
const tick = (buf, at, gain = 0.16) => {
  const start = Math.floor(at * RATE);
  const n = Math.floor(0.09 * RATE);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const u = i / n;
    const env = Math.exp(-u * 14);
    lp += 0.35 * (noise() - lp);
    const s = lp * env * gain;
    const j = (start + i) * 2;
    if (j + 1 < buf.length) {
      buf[j] += s;
      buf[j + 1] += s;
    }
  }
};

/** The bed: two detuned low sines that swell and fade. Barely audible on
 *  its own, and the thing that makes the silence feel intentional. */
const drone = (buf, at, dur, gain = 0.1, freq = 55) => {
  const start = Math.floor(at * RATE);
  const n = Math.floor(dur * RATE);
  for (let i = 0; i < n; i++) {
    const u = i / n;
    const env = Math.min(1, u * 8) * Math.min(1, (1 - u) * 8);
    const t = i / RATE;
    const s =
      (Math.sin(2 * Math.PI * freq * t) * 0.6 +
        Math.sin(2 * Math.PI * freq * 1.005 * t) * 0.4 +
        Math.sin(2 * Math.PI * freq * 2 * t) * 0.12) *
      env *
      gain;
    const j = (start + i) * 2;
    if (j + 1 < buf.length) {
      buf[j] += s;
      buf[j + 1] += s;
    }
  }
};

// ── The film ───────────────────────────────────────────────────────────
// Seconds, matching src/maps/shelterbelt.tsx.

const LENGTH = 58;
const CUES = (buf) => {
  drone(buf, 0, 58, 0.085);

  impact(buf, 0.05, 0.75); // the wall appears
  impact(buf, 5.5, 0.4, 68, 1.2); // "to stop the weather"
  whoosh(buf, 8.7, 0.75, 0.55); // dive onto the plains
  wind(buf, 9.6, 8.6, 0.3); // the plains blowing away
  whoosh(buf, 18.2, 0.7, 0.5); // rip east
  impact(buf, 18.6, 0.4, 74, 1.0); // dust hits the coast
  whoosh(buf, 22.1, 0.8, 0.55); // back to the plains
  impact(buf, 22.8, 0.6, 50, 1.8); // the title lands on the ground
  impact(buf, 29.7, 0.3, 96, 0.7); // scale bar snaps out
  whoosh(buf, 34.2, 0.7, 0.5); // down onto the belt

  // 150 trees go in between 34.6 and 47.4 — thinned to every third, or it
  // turns into a rattle.
  for (let i = 0; i < 150; i += 3) {
    tick(buf, 34.6 + (12.8 * i) / 149, 0.13);
  }

  whoosh(buf, 48.2, 0.9, 0.6); // pull out to the whole belt
  impact(buf, 48.8, 0.55, 46, 2.2); // it worked
  whoosh(buf, 54.8, 0.8, 0.55); // swing to China
  drone(buf, 55.0, 3.0, 0.07, 62);
};

// ── Render ─────────────────────────────────────────────────────────────

const main = () => {
  const frames = LENGTH * RATE;
  const buf = new Float32Array(frames * 2);
  CUES(buf);

  // Peak-normalise with headroom, then a soft knee so nothing spikes.
  let peak = 0;
  for (const v of buf) peak = Math.max(peak, Math.abs(v));
  const norm = peak > 0 ? 0.82 / peak : 1;

  const bytes = Buffer.alloc(44 + frames * 4);
  bytes.write("RIFF", 0);
  bytes.writeUInt32LE(36 + frames * 4, 4);
  bytes.write("WAVEfmt ", 8);
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20);
  bytes.writeUInt16LE(2, 22);
  bytes.writeUInt32LE(RATE, 24);
  bytes.writeUInt32LE(RATE * 4, 28);
  bytes.writeUInt16LE(4, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write("data", 36);
  bytes.writeUInt32LE(frames * 4, 40);

  for (let i = 0; i < frames * 2; i++) {
    const v = clamp(Math.tanh(buf[i] * norm * 1.1));
    bytes.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }

  const out = resolve(ROOT, "out/sfx/shelterbelt.wav");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, bytes);
  process.stdout.write(`wrote ${LENGTH}s to ${out}\n`);
};

main();
