#!/usr/bin/env python3
"""Soundtrack for the first-person "POV: You finally reach grass".

Placed on frames read from src/minecraft-pov/beats.json, the same file the
video reads.

Music is Also sprach Zarathustra (Strauss; Dudamel, Berliner Philharmoniker),
the owner's copy in public/audio/src/zarathustra.mp3 (never committed), in
two pieces so its own drama lines up with the picture:

  part A, from 33.0 s   six timpani hits (36.36 37.08 37.74 38.48 38.88 39.30 s)
                        land on the last pickaxe strikes; the full-orchestra hit
                        (39.98 s) lands on the frame the last block breaks
  part B, from 56.06 s  the second build: its steps (57.54 58.14 58.56 59.02 s)
                        are the creeper's footfalls and its hit (59.72 s) is the
                        frame the picture cuts to black, just before it goes off

  --music none          every effect, no music, a few dB quieter

Effects are the game's own "hit" sound (public/audio/src/mc-hit.mp3, used for every
pickaxe strike) plus the synthesised rest (scripts/mc_audio_lib.py): blocks
cracking and breaking, the light, birds and wind, the creeper's steps and hiss.

Writes public/audio/pov-mix.mp3 or pov-sfx.mp3.
"""
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mc_audio_lib import (SR, N, band, click, decay, decode, env, fade, footstep, place, shimmer, stereo, thump, tone, whoosh, write_mp3)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "audio", "src")
FF = os.environ.get("FFMPEG", "ffmpeg")
B = json.load(open(os.path.join(ROOT, "src", "minecraft-pov", "beats.json")))
FPS = B["fps"]
sec = lambda f: f / FPS
NO_MUSIC = "--music" in sys.argv and sys.argv[sys.argv.index("--music") + 1] == "none"
OUT = os.path.join(ROOT, "public", "audio", "pov-sfx.mp3" if NO_MUSIC else "pov-mix.mp3")


def plus(a, b):
    n = max(len(a), len(b))
    out = np.zeros((n, 2), dtype=np.float32)
    out[: len(a)] += a
    out[: len(b)] += b
    return out


def crunch(dur=0.28, center=1100, seed=1):
    n = N(dur)
    t = np.arange(n) / SR
    return stereo((band(n, center, 900, seed) * np.exp(-9 * t) + band(n, 3800, 2400, seed + 7) * np.exp(-60 * t) * 0.8) * env(n, 0.002, 0.08))


def pop(freq=420):
    n = N(0.12)
    return plus(stereo(tone(np.linspace(freq * 1.8, freq, n), 0.12) * env(n, 0.002, 0.06)), thump(120, 0.1) * 0.5)


def crack(dur=0.35, seed=4):
    n = N(dur)
    t = np.arange(n) / SR
    return stereo(band(n, 2600, 2200, seed) * np.exp(-22 * t) * env(n, 0.001, 0.1))


def chirp(f0, f1, dur):
    n = N(dur)
    return stereo(tone(np.linspace(f0, f1, n), dur) * env(n, 0.004, dur * 0.4))


def bird(seed):
    rng = np.random.default_rng(seed)
    out = np.zeros((N(0.6), 2), dtype=np.float32)
    for k in range(int(rng.integers(3, 6))):
        place(out, chirp(rng.uniform(2600, 3600), rng.uniform(3000, 4400), 0.07), k * 0.09, 0.5)
    return out


def wind(dur):
    n = N(dur)
    t = np.arange(n) / SR
    return stereo(band(n, 500, 700, 31) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.3 * t)) * 0.3)


def thud(seed, size=1.0):
    """a heavy footfall on grass"""
    return plus(thump(62, 0.3) * 1.3, stereo(band(N(0.25), 600, 800, seed) * decay(N(0.25), 10) * 0.7)) * size


if __name__ == "__main__":
    need = ["mc-hit.mp3"] + ([] if NO_MUSIC else ["zarathustra.mp3"])
    for name in need:
        if not os.path.exists(os.path.join(SRC, name)):
            sys.exit("missing public/audio/src/" + name)
    total = sec(B["frames"])
    mix = np.zeros((int(total * SR), 2), dtype=np.float32)
    hit = decode(FF, os.path.join(SRC, "mc-hit.mp3"), "atrim=0.0:0.4,asetpts=PTS-STARTPTS")

    # the music, in two pieces
    if not NO_MUSIC:
        z = decode(FF, os.path.join(SRC, "zarathustra.mp3"))
        a0 = int(B["audio"]["aFrom"] * SR)
        aDur = sec(B["audio"]["bAt"])
        place(mix, fade(z[a0:a0 + int((aDur + 0.3) * SR)] * 1.7, 0.05, 0.3), 0)
        b0 = int(B["audio"]["bFrom"] * SR)
        bDur = total - aDur
        place(mix, fade(z[b0:b0 + int(bDur * SR)] * 1.7, 0.25, 0.4), aDur - 0.05)

    # the pickaxe: the game's own hit on every strike, louder as the timpani arrive
    allStrikes = [s for b in B["blocks"] for s in b["strikes"]]
    for i, s in enumerate(allStrikes):
        g = 0.35 + 0.35 * i / (len(allStrikes) - 1)
        place(mix, hit, sec(s), g)
        place(mix, crack(0.25, seed=i), sec(s), 0.22)
    # each block breaking, and the pop of the camera rising to the next one
    for i, b in enumerate(B["blocks"][:-1]):
        place(mix, crunch(0.28, 900 if b["layer"] == "stone" else 700, seed=i * 3 + 1), sec(b["break"] + 1), 0.38)
        place(mix, pop(380 + i * 30), sec(b["break"] + 5), 0.4)

    # the last block: light leaking, then everything at once
    place(mix, shimmer(), sec(B["leak"]), 0.22)
    f = B["final"]
    place(mix, crunch(0.6, 600, seed=77), sec(f + 1), 0.5)
    place(mix, crack(0.6, seed=9), sec(f), 0.5)
    place(mix, fade(whoosh(1.0, seed=3), 0.02, 0.5), sec(f), 0.3)
    place(mix, shimmer(), sec(f + 3), 0.4)
    for k, bf in enumerate(B["birds"]):
        place(mix, bird(k), sec(bf), 0.22 if bf > B["meadow"] else 0.1)

    # up into the meadow
    place(mix, fade(whoosh(1.2, seed=11), 0.3, 0.5), sec(B["holeRise"][0]), 0.3)
    n = N(total - sec(B["meadow"]))
    place(mix, stereo(band(n, 500, 700, 41) * 0.3 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.3 * (np.arange(n) / SR)))), sec(B["meadow"]), 0.15)
    place(mix, thud(3, 0.6), sec(B["lieDown"][0] + 8), 0.35)
    place(mix, thud(5, 0.9), sec(B["lieDown"][1] - 2), 0.55)  # dropping back into the grass

    # the creeper: a long way off, then closing, footfall by footfall, then the hiss
    for k, st in enumerate(B["steps"]):
        place(mix, thud(20 + k, 1.0), sec(st), 0.22 + 0.14 * k)
    c0, c1 = B["creeper"]
    for k, fr in enumerate(range(c0 + 4, B["steps"][0], 11)):
        place(mix, footstep(900 + k), sec(fr), 0.08 + 0.12 * (fr - c0) / (c1 - c0))
    hs, he = B["hiss"]
    nh = N(sec(he - hs))
    place(mix, stereo(band(nh, 6500, 5500, 5) * np.linspace(0.5, 1.3, nh) * env(nh, 0.03, 0.01)), sec(hs), 1.4)

    write_mp3(FF, mix, OUT, lufs=-18 if NO_MUSIC else -14)
    print("wrote", os.path.relpath(OUT, ROOT), f"({total:.1f}s)")
