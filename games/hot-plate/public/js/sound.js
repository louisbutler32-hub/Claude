// Little square-wave blips. Browsers only allow sound after a tap, so unlock() runs on the first one.
import { store } from "./util.js";

let ctx = null;
let muted = !!store.get("hp-muted");

export const isMuted = () => muted;
export function toggleMute() { muted = !muted; store.set("hp-muted", muted); return muted; }
export function unlock() {
  try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); ctx.resume(); } catch {}
}

function tone(freq, dur = 0.12, type = "square", vol = 0.06, delay = 0) {
  if (muted) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
  } catch {}
}

export const sfx = {
  pass(tier) { const b = [523, 587, 698, 880][tier]; tone(b, 0.08); tone(b * 1.5, 0.12, "square", 0.05, 0.06); if (tier === 3) tone(b * 2, 0.18, "square", 0.05, 0.13); },
  yourTurn() { tone(988, 0.07); tone(1319, 0.1, "square", 0.06, 0.07); },
  nope() { tone(196, 0.14, "sawtooth", 0.05); },
  tick(urgent) { tone(urgent ? 1400 : 1000, 0.03, "square", urgent ? 0.05 : 0.025); },
  burn() { tone(110, 0.45, "sawtooth", 0.1); tone(70, 0.5, "square", 0.07, 0.08); },
  bell() { [1319, 1568, 2093].forEach((f, i) => tone(f, 0.35, "triangle", 0.07, i * 0.09)); },
  win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, "square", 0.06, i * 0.12)); },
  heart() { tone(784, 0.08, "triangle", 0.08); tone(1046, 0.14, "triangle", 0.08, 0.08); },
  click() { tone(660, 0.04, "square", 0.03); },
};
