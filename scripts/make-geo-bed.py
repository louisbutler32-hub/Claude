#!/usr/bin/env python3
"""Synthesise the music bed under the geo shorts.

    python3 scripts/make-geo-bed.py            # writes public/assets/vo/geo-bed.mp3

Sixty seconds of a slow, low documentary pad — two detuned oscillators per
note through a gentle low-pass, a soft sub pulse, and a wash of filtered
noise for air. Made from sine waves here, so there is nothing to license.
It sits ~14 dB under the narration in the mix.
"""
import os
import subprocess

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 44100
DUR = 62.0
BPM = 84

rng = np.random.default_rng(7)
n = int(SR * DUR)
t = np.arange(n) / SR

# ── chords: i - VI - III - VII in D minor, four bars each ────────────
chords = [
    [146.83, 174.61, 220.00, 293.66],   # D minor
    [116.54, 146.83, 174.61, 233.08],   # Bb major
    [174.61, 220.00, 261.63, 349.23],   # F major
    [130.81, 164.81, 196.00, 261.63],   # C major
]
bar = 60.0 / BPM * 4
seg = bar * 4
pad = np.zeros(n)
for i in range(int(np.ceil(DUR / seg))):
    chord = chords[i % len(chords)]
    start = i * seg
    idx = (t >= start) & (t < start + seg + 1.5)
    tt = t[idx] - start
    env = np.clip(tt / 1.8, 0, 1) * np.clip((seg + 1.5 - tt) / 1.5, 0, 1)
    voice = np.zeros_like(tt)
    for f in chord:
        for det in (-0.4, 0.4):
            ph = 2 * np.pi * (f + det) * tt + rng.uniform(0, 2 * np.pi)
            voice += np.sin(ph) * 0.5 + np.sin(2 * ph) * 0.12 + np.sin(3 * ph) * 0.05
    pad[idx] += voice * env / len(chord)

# a slow tremolo so the pad breathes
pad *= 0.85 + 0.15 * np.sin(2 * np.pi * 0.11 * t)

# ── sub pulse on every beat, very soft ────────────────────────────────
pulse = np.zeros(n)
beat = 60.0 / BPM
for k in range(int(DUR / beat)):
    s = int(k * beat * SR)
    e = min(n, s + int(0.35 * SR))
    tt = np.arange(e - s) / SR
    pulse[s:e] += np.sin(2 * np.pi * 55 * tt) * np.exp(-tt * 9) * (0.9 if k % 4 == 0 else 0.5)

# ── air: filtered noise, swelling in and out ──────────────────────────
noise = rng.standard_normal(n)
# one-pole low-pass, twice
def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.zeros_like(x)
    acc = 0.0
    b = 1 - a
    for i in range(len(x)):
        acc = a * acc + b * x[i]
        y[i] = acc
    return y

air = lowpass(lowpass(noise, 900), 900)
air *= 0.5 + 0.5 * np.sin(2 * np.pi * 0.05 * t - 1.2)

mix = pad * 0.55 + pulse * 0.35 + air * 0.9
# fade in / out
mix *= np.clip(t / 2.0, 0, 1) * np.clip((DUR - t) / 3.0, 0, 1)
mix = mix / (np.max(np.abs(mix)) or 1.0) * 0.8

import soundfile as sf
work = os.path.join(ROOT, ".tts")
os.makedirs(work, exist_ok=True)
wav = os.path.join(work, "geo-bed.wav")
sf.write(wav, mix.astype(np.float32), SR)
out = os.path.join(ROOT, "public", "assets", "vo", "geo-bed.mp3")
subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", wav,
                "-af", "loudnorm=I=-24:TP=-3:LRA=9", "-b:a", "160k", out], check=True)
print("wrote", os.path.relpath(out, ROOT))
