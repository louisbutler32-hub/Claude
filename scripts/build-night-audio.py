#!/usr/bin/env python3
"""Soundtrack for the first-person "POV: Your first night in Minecraft".

Placed on frames read from src/minecraft-pov2/beats-night.json, the same file
the video reads.

Music is Sneaky Snitch (the owner's copy, public/audio/src/sneaky-snitch.mp3,
never committed), started 1.7 s in so that its plucks fall on the picture:
the block going into the wall, dusk, the first zombie, the second, the zombie
at the window, the window being plugged, the three pounding thumps, the light
cracking, and the block coming out onto the morning.

Effects are the owner's files (stone/dirt, hit, damage, Top-20 grab bag), plus a
little synthesis (scripts/mc_audio_lib.py) for the zombie groans, the cracking
light, the birds and the sizzle.

  --music none   effects only, a few dB quieter

Writes public/audio/night-mix.mp3 or night-sfx.mp3.
"""
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mc_audio_lib import SR, N, band, decay, decode, env, fade, place, shimmer, stereo, thump, tone, whoosh, write_mp3

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "audio", "src")
FF = os.environ.get("FFMPEG", "ffmpeg")
B = json.load(open(os.path.join(ROOT, "src", "minecraft-pov2", "beats-night.json")))
FPS = B["fps"]
sec = lambda f: f / FPS
NO_MUSIC = "--music" in sys.argv and sys.argv[sys.argv.index("--music") + 1] == "none"
OUT = os.path.join(ROOT, "public", "audio", "night-sfx.mp3" if NO_MUSIC else "night-mix.mp3")


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


def groan(dur=1.2, f0=95, seed=3):
    """a zombie: a low rasp that wobbles and sags"""
    n = N(dur)
    t = np.arange(n) / SR
    f = f0 * (1 + 0.18 * np.sin(2 * np.pi * 5 * t)) * (1 - 0.25 * t / dur)
    x = tone(f, dur, harmonics=7) * 0.6 + band(n, 600, 400, seed) * 0.5 * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t))
    return stereo(x * np.sin(np.linspace(0, np.pi, n)) ** 0.6 * env(n, 0.04, 0.2))


def creak(dur):
    n = N(dur)
    t = np.arange(n) / SR
    f = 300 + 500 * np.abs(np.sin(2 * np.pi * 2.3 * t)) * (t / dur)
    return stereo((tone(f, dur, harmonics=3) * 0.3 + band(n, 1200, 900, 8) * 0.2) * env(n, 0.1, 0.3) * (t / dur))


def chirp(f0, f1, dur):
    n = N(dur)
    return stereo(tone(np.linspace(f0, f1, n), dur) * env(n, 0.004, dur * 0.4))


def bird(seed):
    rng = np.random.default_rng(seed)
    out = np.zeros((N(0.6), 2), dtype=np.float32)
    for k in range(int(rng.integers(3, 6))):
        place(out, chirp(rng.uniform(2600, 3600), rng.uniform(3000, 4400), 0.07), k * 0.09, 0.5)
    return out


def sizzle(dur=1.4):
    n = N(dur)
    t = np.arange(n) / SR
    pops = (np.random.default_rng(5).random(n) > 0.9992).astype(float)
    return stereo((band(n, 4500, 2500, 12) * 0.5 + np.convolve(pops, decay(900, 80), "same") * 1.5) * env(n, 0.05, 0.4))


if __name__ == "__main__":
    need = ["dirt-sounds.mp4", "mc-hit.mp3", "mc-damage.mp3", "mc-sfx-top20.mp4"] + ([] if NO_MUSIC else ["sneaky-snitch.mp3"])
    for name in need:
        if not os.path.exists(os.path.join(SRC, name)):
            sys.exit("missing public/audio/src/" + name)
    total = sec(B["frame"])
    mix = np.zeros((int(total * SR), 2), dtype=np.float32)

    dirt_place = clip("dirt-sounds.mp4", 2.20, 2.55)
    dirt_break = clip("dirt-sounds.mp4", 0.84, 1.3)
    hurt = clip("mc-damage.mp3", 0.0, 0.95)
    xp = clip("mc-sfx-top20.mp4", 2.22, 2.7)

    if not NO_MUSIC:
        s = decode(FF, os.path.join(SRC, "sneaky-snitch.mp3"))
        a = int(B["musicFrom"] * SR)
        place(mix, fade(s[a:a + int((total + 0.2) * SR)] * 1.4, 0.05, 1.2), 0)

    # blocks going in
    at_peak(mix, dirt_place, B["plug1"], 0.8)
    at_peak(mix, dirt_place, B["plug"], 1.0)
    # the night comes in: a low swell
    place(mix, fade(whoosh(1.2, seed=4), 0.4, 0.5), sec(B["dusk"] - 6), 0.12)
    # the zombies
    place(mix, groan(1.0, 100, 3), sec(B["zombieA"] + 6), 0.22)
    place(mix, groan(1.0, 85, 4), sec(B["zombieB"] + 6), 0.2)
    place(mix, groan(1.4, 92, 5), sec(B["arrive"]), 0.35)
    # a hit through the window, twice
    for h in B["hurt"]:
        at_peak(mix, hurt, h, 0.9)
    # the pounding on the block
    for t in B["thumps"]:
        place(mix, thump(65, 0.3) * 1.6, sec(t), 0.7)
        place(mix, stereo(band(N(0.15), 700, 500, t) * decay(N(0.15), 28)), sec(t), 0.45)
        place(mix, groan(0.5, 80, t) , sec(t - 2), 0.18)
    # the light cracking through
    place(mix, creak(B["dawn"] / FPS - B["cracks"] / FPS), sec(B["cracks"]), 0.14)
    for k in range(4):
        place(mix, bird(k), sec(B["cracks"] + 12 + k * 7), 0.07 + 0.03 * k)
    # the block breaks, the zombies burn
    at_peak(mix, dirt_break, B["dawn"], 1.0)
    place(mix, shimmer(), sec(B["dawn"] + 2), 0.25)
    at_peak(mix, xp, B["dawn"] + 3, 0.5)
    place(mix, sizzle(), sec(B["dawn"] + 3), 0.5)
    for k in range(3):
        place(mix, groan(0.8, 110 - 10 * k, 20 + k), sec(B["dawn"] + 4 + 4 * k), 0.16)

    write_mp3(FF, mix, OUT, lufs=-18 if NO_MUSIC else -14)
    print("wrote", os.path.relpath(OUT, ROOT), f"({total:.1f}s)")
