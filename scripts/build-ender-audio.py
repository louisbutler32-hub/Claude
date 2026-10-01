#!/usr/bin/env python3
"""Soundtrack for the first-person "POV: You accidentally look at an Enderman".

Placed on frames read from src/minecraft-pov2/beats-ender.json, the same file
the video reads.

Music is The Pink Panther theme (the owner's copy,
public/audio/src/pink-panther.mp3), started 9.5 s in: the tiptoeing bass walks
the footsteps (one grass step on every beat), and its sax hits land on the
eye contact (14.54 s), the look-away, the teleport (the loud one, 16.08 s),
the Enderman closing in, and the scream (17.66 s). The picture goes black on
frame 276, the scream still going over it.

Effects: the owner's grass footsteps (Top-20 grab bag), plus synthesis from
scripts/mc_audio_lib.py for the Enderman's stare sting, the teleport, the
idle burbling and the scream (all original).

  --music none   effects only, a few dB quieter

Writes public/audio/ender-mix.mp3 or ender-sfx.mp3.
"""
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mc_audio_lib import SR, N, band, decay, decode, env, fade, place, stereo, thump, tone, whoosh, write_mp3

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "audio", "src")
FF = os.environ.get("FFMPEG", "ffmpeg")
B = json.load(open(os.path.join(ROOT, "src", "minecraft-pov2", "beats-ender.json")))
FPS = B["fps"]
sec = lambda f: f / FPS
NO_MUSIC = "--music" in sys.argv and sys.argv[sys.argv.index("--music") + 1] == "none"
OUT = os.path.join(ROOT, "public", "audio", "ender-sfx.mp3" if NO_MUSIC else "ender-mix.mp3")


def clip(name, a, b, peak=0.9):
    c = decode(FF, os.path.join(SRC, name), f"atrim={a}:{b},asetpts=PTS-STARTPTS")
    m = float(np.max(np.abs(c))) or 1.0
    return (c * (peak / m)).astype(np.float32)


def at_peak(mix, c, frame, gain):
    lead = int(np.argmax(np.max(np.abs(c), axis=1)))
    t = sec(frame) - lead / SR
    if t < 0:
        c, t = c[int(-t * SR):], 0.0
    place(mix, c, t, gain)


def burble(dur=1.6, seed=1):
    """the Enderman's idle: a low, wet, wobbling mumble"""
    n = N(dur)
    t = np.arange(n) / SR
    f = 140 + 60 * np.sin(2 * np.pi * 3.7 * t) + 30 * np.sin(2 * np.pi * 7.1 * t)
    return stereo((tone(f, dur, harmonics=5) * 0.4 + band(n, 900, 500, seed) * 0.3) * np.sin(np.linspace(0, np.pi, n)) ** 0.5)


def stare(dur=0.9):
    """a hard, high 'vwip' down to a growl: it has noticed you"""
    n = N(dur)
    t = np.arange(n) / SR
    f = 2600 * np.exp(-t * 7) + 160
    return stereo((tone(f, dur, harmonics=3) * 0.6 + band(n, 1500, 1200, 3) * 0.3) * decay(n, 3.2) * env(n, 0.003, 0.2))


def teleport(dur=0.5):
    n = N(dur)
    t = np.arange(n) / SR
    f = 300 + 3400 * (t / dur) ** 2
    return stereo(tone(f, dur, harmonics=2) * 0.6 * env(n, 0.01, 0.15)) + stereo(band(n, 4500, 2500, 9) * 0.4 * decay(n, 7))


def scream(dur=1.5):
    """the Enderman scream: a distorted wail with a pitch that jumps around, over noise"""
    n = N(dur)
    t = np.arange(n) / SR
    rng = np.random.default_rng(6)
    steps = rng.uniform(380, 900, 24)
    f = np.interp(t, np.linspace(0, dur, 24), steps) * (1 + 0.05 * np.sin(2 * np.pi * 31 * t))
    x = tone(f, dur, harmonics=9) * 0.5 + tone(f * 1.5, dur, harmonics=4) * 0.3 + band(n, 2200, 1800, 15) * 0.5
    x = np.tanh(x * 2.2)
    return stereo(x * env(n, 0.01, 0.35) * (0.7 + 0.3 * np.sin(2 * np.pi * 14 * t)))


if __name__ == "__main__":
    need = ["mc-sfx-top20.mp4"] + ([] if NO_MUSIC else ["pink-panther.mp3"])
    for name in need:
        if not os.path.exists(os.path.join(SRC, name)):
            sys.exit("missing public/audio/src/" + name)
    total = sec(B["frame"])
    mix = np.zeros((int(total * SR), 2), dtype=np.float32)

    step_a = clip("mc-sfx-top20.mp4", 20.76, 21.0)
    step_b = clip("mc-sfx-top20.mp4", 22.32, 22.56)

    if not NO_MUSIC:
        s = decode(FF, os.path.join(SRC, "pink-panther.mp3"))
        a = int(B["musicFrom"] * SR)
        place(mix, fade(s[a:a + int((total + 0.1) * SR)] * 1.7, 0.05, 0.25), 0)

    # footsteps: one on every beat until you stop for the lock
    k = 0
    f = B["lock"] - B["beat"] * int((B["lock"] - B["stepFrom"]) / B["beat"])
    while f <= B["lock"] + 0.5:
        at_peak(mix, step_a if k % 2 == 0 else step_b, round(f), 0.55)
        k += 1
        f += B["beat"]
    # a distant Enderman mumble while you walk
    place(mix, burble(1.8, 1), sec(60), 0.1)
    place(mix, burble(1.4, 2), sec(110), 0.14)
    # eye contact: the sting on the first sax hit, then it shakes
    place(mix, stare(), sec(B["lock"]), 0.55)
    place(mix, thump(50, 0.4) * 1.6, sec(B["lock"]), 0.45)
    place(mix, burble(0.9, 5), sec(B["lock"] + 10), 0.3)
    # you whip away
    place(mix, fade(whoosh(0.35, seed=3), 0.02, 0.2), sec(B["away"][0]), 0.3)
    # the teleport on the loud hit, then it closes in
    place(mix, teleport(), sec(B["teleport"] - 3), 0.7)
    place(mix, thump(45, 0.5) * 2.0, sec(B["teleport"]), 0.6)
    place(mix, burble(1.0, 8), sec(B["near"][0]), 0.3)
    # the scream, on the last hit, running on over the black
    place(mix, scream(1.7), sec(B["scream"] - 2), 0.85)
    place(mix, thump(40, 0.6) * 2.0, sec(B["scream"]), 0.6)

    write_mp3(FF, mix, OUT, lufs=-18 if NO_MUSIC else -14)
    print("wrote", os.path.relpath(OUT, ROOT), f"({total:.1f}s)")
