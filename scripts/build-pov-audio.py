#!/usr/bin/env python3
"""Soundtrack for the first-person "POV: You finally reach grass".

Placed on frames read from src/minecraft-pov/beats.json, the same file the
video reads.

Music is Also sprach Zarathustra (Strauss; Dudamel, Berliner Philharmoniker),
the owner's copy in public/audio/src/zarathustra.mp3 (never committed), in
two pieces so its own drama lines up with the picture:

  part A, from 33.0 s   six timpani hits land on the last pickaxe strikes; the
                        full-orchestra hit lands on the frame the last block breaks
  part B, from 56.06 s  starting at frame 278: its step at 58.56 s is the camera
                        tilting down onto the creeper, its step at 59.02 s is the
                        creeper's one step forward, and its last hit is the frame
                        the picture cuts to black, with the blast over the black

  --music none          every effect, no music, a few dB quieter

Sound effects are the owner's own files in public/audio/src/ (never committed),
each cut to the piece it needs and brought to one common level before it is placed:

  stone-breaking.mp4    mining taps (stone blocks) and the block breaking
  dirt-sounds.mp4       the dig hits (dirt blocks) and the dirt breaking
  creeper-hiss.mp3      the hiss under the swell (the file is quiet; it is lifted)
  mc-sfx-top20.mp4      grass footsteps, the cave ambience (played once, at the start, and
                        never again), the XP ding when the sky appears
  creeper-explosion.mp3 the blast, heard over the black frame (never shown)

A little synthesis (scripts/mc_audio_lib.py) glues those together: the light
leaking, the rush of the camera rising, wind and birds in the meadow.

Writes public/audio/pov-mix.mp3 or pov-sfx.mp3.
"""
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mc_audio_lib import SR, N, band, decode, env, fade, place, shimmer, stereo, thump, tone, whoosh, write_mp3

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "audio", "src")
FF = os.environ.get("FFMPEG", "ffmpeg")
B = json.load(open(os.path.join(ROOT, "src", "minecraft-pov", "beats.json")))
FPS = B["fps"]
sec = lambda f: f / FPS
NO_MUSIC = "--music" in sys.argv and sys.argv[sys.argv.index("--music") + 1] == "none"
OUT = os.path.join(ROOT, "public", "audio", "pov-sfx.mp3" if NO_MUSIC else "pov-mix.mp3")


def clip(name, a, b, peak=0.9, hp=None):
    """cut [a, b] seconds from one of the owner's files and bring its loudest point to `peak`"""
    c = decode(FF, os.path.join(SRC, name), f"atrim={a}:{b},asetpts=PTS-STARTPTS" + (f",highpass=f={hp}" if hp else ""))
    m = float(np.max(np.abs(c))) or 1.0
    return (c * (peak / m)).astype(np.float32)


def at_peak(mix, c, frame, gain):
    """place a clip so its loudest point, not its first sample, lands on `frame`"""
    lead = int(np.argmax(np.max(np.abs(c), axis=1)))
    t = sec(frame) - lead / SR
    if t < 0:
        c, t = c[int(-t * SR):], 0.0
    place(mix, c, t, gain)


def plus(a, b):
    n = max(len(a), len(b))
    out = np.zeros((n, 2), dtype=np.float32)
    out[: len(a)] += a
    out[: len(b)] += b
    return out


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
    return stereo(band(n, 500, 700, 41) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.3 * t)) * 0.3)


def loop(c, dur, xf=0.25):
    """repeat a clip to `dur` seconds with a crossfade at every join"""
    out = np.zeros((int(dur * SR) + len(c), 2), dtype=np.float32)
    step = len(c) - int(xf * SR)
    f = fade(c, xf, xf)
    for i in range(0, len(out) - len(c) + 1, step):
        out[i:i + len(c)] += f
    return out[: int(dur * SR)]


if __name__ == "__main__":
    need = ["stone-breaking.mp4", "dirt-sounds.mp4", "creeper-hiss.mp3", "creeper-explosion.mp3", "mc-sfx-top20.mp4"] + ([] if NO_MUSIC else ["zarathustra.mp3"])
    for name in need:
        if not os.path.exists(os.path.join(SRC, name)):
            sys.exit("missing public/audio/src/" + name)
    total = sec(B["frames"])
    mix = np.zeros((int(total * SR), 2), dtype=np.float32)

    # ---- the owner's clips, each at one level (peak 0.9), cut where the onsets are ----
    stone_tap = clip("stone-breaking.mp4", 0.875, 1.06)      # a pickaxe tap on stone
    stone_break = clip("stone-breaking.mp4", 1.37, 1.95)     # the block going
    dirt_tap = clip("dirt-sounds.mp4", 2.20, 2.55)           # a dig hit in dirt
    dirt_break = clip("dirt-sounds.mp4", 0.84, 1.3)          # the dirt block going
    hiss = clip("creeper-hiss.mp3", 0.0, 1.9, peak=0.95)
    step_a = clip("mc-sfx-top20.mp4", 20.76, 21.0)           # grass footsteps
    step_b = clip("mc-sfx-top20.mp4", 22.32, 22.56)
    xp = clip("mc-sfx-top20.mp4", 2.22, 2.7)
    cave = clip("mc-sfx-top20.mp4", 24.38, 26.38, peak=0.9)
    boom = clip("creeper-explosion.mp3", 2.38, 4.0, peak=0.95)   # the blast itself, without the fuse before it

    # ---- the music, in two pieces ----
    if not NO_MUSIC:
        z = decode(FF, os.path.join(SRC, "zarathustra.mp3"))
        a0 = int(B["audio"]["aFrom"] * SR)
        aDur = sec(B["audio"]["bAt"])
        place(mix, fade(z[a0:a0 + int((aDur + 0.4) * SR)] * 1.7, 0.05, 0.4), 0)
        b0 = int(B["audio"]["bFrom"] * SR)
        place(mix, fade(z[b0:b0 + int((total - aDur) * SR)] * 1.7, 0.3, 0.4), aDur - 0.0)

    # ---- the cave ambience: once, at the very start, and never again ----
    place(mix, fade(cave, 0.05, 0.5), 0, 0.4)

    # ---- the pickaxe: a tap on every strike, a break on each block's last ----
    for bi, blk in enumerate(B["blocks"]):
        stone = blk["layer"] == "stone"
        for s in blk["strikes"]:
            last = s == blk["break"]
            final = last and bi == len(B["blocks"]) - 1
            if last:
                at_peak(mix, stone_break if stone else dirt_break, s, 0.9 if final else 0.6)
            else:
                at_peak(mix, stone_tap if stone else dirt_tap, s, 0.5 + 0.12 * bi)
    # the camera rising through each hole
    for blk in B["blocks"][:-1]:
        place(mix, fade(whoosh(0.35, seed=blk["break"]), 0.02, 0.2), sec(blk["break"] + 3), 0.1)

    # ---- the last block: light leaking, then the sky ----
    place(mix, shimmer(), sec(B["leak"]), 0.2)
    place(mix, fade(whoosh(1.0, seed=3), 0.02, 0.5), sec(B["final"]), 0.25)
    place(mix, xp, sec(B["final"] + 4), 0.5)
    place(mix, shimmer(), sec(B["final"] + 3), 0.25)
    for k, bf in enumerate(B["birds"]):
        place(mix, bird(k), sec(bf), 0.2 if bf > B["meadow"] else 0.09)

    # ---- up into the meadow ----
    place(mix, fade(whoosh(1.2, seed=11), 0.3, 0.5), sec(B["holeRise"][0]), 0.25)
    n = N(total - sec(B["meadow"]))
    place(mix, wind(total - sec(B["meadow"])), sec(B["meadow"]), 0.15)
    place(mix, step_a, sec(B["meadow"] + 6), 0.35)
    place(mix, step_b, sec(B["meadow"] + 14), 0.35)

    # ---- the creeper: the camera snaps down onto it, it takes one step, hisses, and goes ----
    place(mix, thump(60, 0.3) * 1.2, sec(B["reveal"]), 0.4)
    for st in B["steps"]:
        at_peak(mix, step_a, st, 0.9)
        place(mix, thump(70, 0.25) * 1.2, sec(st), 0.4)
    hs, he = B["hiss"]
    place(mix, fade(hiss[: int((sec(he - hs) + 0.06) * SR)], 0.02, 0.02), sec(hs), 1.0)
    # the picture is black from here; the blast is heard over it
    at_peak(mix, boom, B["cut"], 0.9)

    write_mp3(FF, mix, OUT, lufs=-18 if NO_MUSIC else -14)
    print("wrote", os.path.relpath(OUT, ROOT), f"({total:.1f}s)")
