// Kitchen sound effects, synthesized live (no audio files): a service bell for your turn, a plate
// whoosh-and-clink on every pass, a sizzle that builds as the clock runs down, wood-block ticks,
// a flame crackle for a burn, a rising chime per rarity tier and a jingle for the chef's kiss.
// Browsers only allow sound after a tap, so unlock() runs on the first one.
import { store } from "./util.js";

let ctx = null, master = null, noiseBuf = null, sizzle = null;
let muted = !!store.get("hp-muted");

export const isMuted = () => muted;
export function toggleMute() {
  muted = !muted;
  store.set("hp-muted", muted);
  if (master) master.gain.value = muted ? 0 : 0.9;
  return muted;
}

function ac() {
  if (ctx) return ctx;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 0.9;
  const comp = ctx.createDynamicsCompressor();
  master.connect(comp).connect(ctx.destination);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return ctx;
}
export function unlock() { try { ac().resume(); } catch {} }

const ready = () => { try { return !muted && ac() && ctx.state === "running"; } catch { return false; } };

// one pitched voice with an attack/decay envelope
function voice(freq, { type = "sine", dur = 0.3, vol = 0.2, at = 0, attack = 0.005, glide = null, detune = 0 } = {}) {
  const t = ctx.currentTime + at;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); o.detune.value = detune;
  if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t); o.stop(t + dur + 0.05);
}

// a burst of filtered noise
function noise({ dur = 0.2, vol = 0.2, at = 0, type = "bandpass", freq = 1000, freqEnd = null, q = 1 } = {}) {
  const t = ctx.currentTime + at;
  const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = noiseBuf;
  f.type = type; f.Q.value = q; f.frequency.setValueAtTime(freq, t);
  if (freqEnd) f.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t, Math.random()); src.stop(t + dur + 0.05);
}

// a struck bell: a few inharmonic partials ringing out
function bell(freq, at = 0, vol = 0.18, dur = 1.2) {
  [[1, 1], [2.76, 0.45], [5.4, 0.25], [8.93, 0.12]].forEach(([m, v]) => voice(freq * m, { dur: dur / Math.sqrt(m), vol: vol * v, at }));
}

const NOTES = { C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, E6: 1318.5, G6: 1568, C7: 2093 };

export const sfx = {
  // ding! the plate is yours
  yourTurn() { if (!ready()) return; bell(1760, 0, 0.16, 1.1); },
  // three rings of the dinner bell to start the game
  bell() { if (!ready()) return; [0, 0.18, 0.36].forEach((at) => bell(1318, at, 0.14, 0.9)); },
  // the plate slides across the cloth and clinks down
  slide() { if (!ready()) return; noise({ dur: 0.28, vol: 0.12, freq: 600, freqEnd: 2600, q: 0.8 }); voice(2400, { dur: 0.12, vol: 0.06, at: 0.24, type: "triangle" }); voice(3600, { dur: 0.08, vol: 0.04, at: 0.25 }); },
  // a chime that climbs higher the rarer the answer
  pass(tier) {
    if (!ready()) return;
    this.slide();
    const runs = [["C5", "G5"], ["D5", "A5", "D6"], ["E5", "G5", "C6", "E6"], ["G5", "C6", "E6", "G6", "C7"]];
    const run = runs[Math.min(tier, 3)];
    run.forEach((n, i) => voice(NOTES[n] || 1174.66, { type: "triangle", dur: 0.25 + i * 0.03, vol: 0.12, at: 0.05 + i * 0.07 }));
    if (tier >= 3) run.forEach((n, i) => voice((NOTES[n] || 1174.66) * 2, { dur: 0.4, vol: 0.04, at: 0.1 + i * 0.07, detune: 8 }));
  },
  // the chef's kiss: a little fanfare with a sparkle on top
  kiss() {
    if (!ready()) return;
    ["C5", "E5", "G5", "C6", "E6", "G6"].forEach((n, i) => voice(NOTES[n], { type: "square", dur: 0.22, vol: 0.06, at: i * 0.08 }));
    voice(NOTES.C6, { type: "triangle", dur: 0.9, vol: 0.12, at: 0.5 });
    voice(NOTES.E6, { type: "triangle", dur: 0.9, vol: 0.1, at: 0.5 });
    voice(NOTES.G6, { type: "triangle", dur: 0.9, vol: 0.08, at: 0.5 });
    for (let i = 0; i < 10; i++) voice(2500 + Math.random() * 2500, { dur: 0.12, vol: 0.04, at: 0.55 + i * 0.05 });
  },
  // not on the menu: a dull pan bonk
  nope() { if (!ready()) return; voice(220, { dur: 0.25, vol: 0.18, glide: 110 }); noise({ dur: 0.08, vol: 0.06, freq: 300, q: 2 }); },
  // already served: two short buzzes
  taken() { if (!ready()) return; voice(311, { type: "square", dur: 0.09, vol: 0.05 }); voice(233, { type: "square", dur: 0.14, vol: 0.05, at: 0.11 }); },
  // wood-block tick, sharper when it's your plate
  tick(urgent) { if (!ready()) return; noise({ dur: 0.04, vol: urgent ? 0.22 : 0.1, freq: urgent ? 2200 : 1600, q: 6 }); },
  // whoomph and crackle: someone got burned
  burn() {
    if (!ready()) return;
    noise({ dur: 0.7, vol: 0.3, type: "lowpass", freq: 3000, freqEnd: 120, q: 0.7 });
    voice(90, { dur: 0.5, vol: 0.25, glide: 45 });
    for (let i = 0; i < 12; i++) noise({ dur: 0.03, vol: 0.12, freq: 2000 + Math.random() * 3000, q: 4, at: 0.1 + Math.random() * 0.7 });
  },
  heart() { if (!ready()) return; voice(NOTES.E5, { type: "triangle", dur: 0.15, vol: 0.12 }); voice(NOTES.A5, { type: "triangle", dur: 0.3, vol: 0.12, at: 0.1 }); },
  win() {
    if (!ready()) return;
    [["C5", 0], ["E5", 0.12], ["G5", 0.24], ["C6", 0.36], ["G5", 0.52], ["C6", 0.64]].forEach(([n, at]) => voice(NOTES[n], { type: "square", dur: 0.2, vol: 0.06, at }));
    bell(NOTES.C6, 0.7, 0.12, 1.4);
  },
  click() { if (!ready()) return; voice(1400, { type: "triangle", dur: 0.05, vol: 0.05 }); },
  chat() { if (!ready()) return; voice(990, { dur: 0.08, vol: 0.05 }); voice(1320, { dur: 0.1, vol: 0.04, at: 0.06 }); },
};

// a pan sizzle under the table that grows louder as the clock runs down (0..1)
export function setSizzle(heat) {
  if (!ctx || muted) { if (sizzle) sizzle.g.gain.value = 0; return; }
  if (!sizzle) {
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf; src.loop = true;
    f.type = "highpass"; f.frequency.value = 3000;
    g.gain.value = 0;
    src.connect(f).connect(g).connect(master);
    src.start();
    sizzle = { src, f, g };
  }
  const target = heat > 0.35 ? (heat - 0.35) * 0.09 : 0;
  sizzle.g.gain.setTargetAtTime(target, ctx.currentTime, 0.15);
}
