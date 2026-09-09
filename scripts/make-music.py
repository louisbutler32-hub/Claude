#!/usr/bin/env python3
"""Generate the ambient bed that sits under the narration.

A slow four-chord pad (Am - F - C - G) built from soft sine partials, plus a
low drone and a sparse bell arpeggio. Written from scratch so the video ships
with music that is ours to use.

    python3 scripts/make-music.py  ->  public/assets/vo/planets-bed.mp3
"""
import os
import subprocess

import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 24000
DUR = 181.0
BAR = 7.5  # seconds per chord

CHORDS = [
    [220.00, 261.63, 329.63],  # Am
    [174.61, 220.00, 261.63],  # F
    [261.63, 329.63, 392.00],  # C
    [196.00, 246.94, 293.66],  # G
]


def voice(freq, t, env):
    """One pad note: a few partials, gently detuned so it breathes."""
    out = np.zeros_like(t)
    for k, amp in ((1, 1.0), (2, 0.32), (3, 0.14), (4, 0.06)):
        detune = 1 + 0.0016 * np.sin(2 * np.pi * (0.07 + 0.013 * k) * t)
        out += amp * np.sin(2 * np.pi * freq * k * detune * t)
    return out * env / 1.52


def main():
    n = int(DUR * SR)
    t = np.arange(n) / SR
    mix = np.zeros(n, dtype=np.float32)

    for i in range(int(DUR / BAR) + 1):
        start = i * BAR
        s0 = int(start * SR)
        s1 = min(n, int((start + BAR * 1.25) * SR))
        if s0 >= n:
            break
        local = np.arange(s1 - s0) / SR
        # slow swell in, long tail out
        env = np.minimum(local / 2.2, 1.0) * np.exp(-local / 4.5)
        for f in CHORDS[i % len(CHORDS)]:
            mix[s0:s1] += voice(f, t[s0:s1], env) * 0.22
        mix[s0:s1] += voice(CHORDS[i % len(CHORDS)][0] / 2, t[s0:s1], env) * 0.16

    # sparse bell on every other bar, an octave up
    for i in range(0, int(DUR / BAR), 2):
        s0 = int((i * BAR + 1.5) * SR)
        s1 = min(n, s0 + int(3.0 * SR))
        if s0 >= n:
            break
        local = np.arange(s1 - s0) / SR
        env = np.exp(-local * 1.4) * (1 - np.exp(-local * 60))
        mix[s0:s1] += np.sin(2 * np.pi * CHORDS[i % len(CHORDS)][2] * 2 * local) * env * 0.05

    # a touch of air, then fade the ends
    mix += np.sin(2 * np.pi * 0.11 * t) * 0.004
    fade = int(3 * SR)
    mix[:fade] *= np.linspace(0, 1, fade)
    mix[-fade:] *= np.linspace(1, 0, fade)
    mix *= 0.62 / (np.max(np.abs(mix)) or 1)

    wav = os.path.join(ROOT, ".tts", "planets-bed.wav")
    mp3 = os.path.join(ROOT, "public", "assets", "vo", "planets-bed.mp3")
    sf.write(wav, mix.astype(np.float32), SR)
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                    "-i", wav, "-b:a", "128k", mp3], check=True)
    print("wrote", os.path.relpath(mp3, ROOT))


if __name__ == "__main__":
    main()
