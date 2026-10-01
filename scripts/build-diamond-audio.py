#!/usr/bin/env python3
"""Soundtrack for the first-person "POV: You finally find diamonds".

Placed on frames read from src/minecraft-pov2/beats-diamond.json, the same
file the video reads.

Music is Harder, Better, Faster, Stronger (the owner's copy,
public/audio/src/harder-better-faster-stronger.mp3), started on a kick at
29.456 s. Its kicks sit on a grid of 0.4858 s anchored on the drop at 36.256 s,
which is the beat the picture's frames are built on: six stone blocks dug on
beats 1-10 and 13-14, two footsteps (11, 12), the drop on beat 14 where the
diamond wall appears, four diamonds of two hits each (15-22), and the pickaxe
breaking on beat 24. The video is exactly 27 beats long, so the track loops on a
kick. When the pickaxe breaks the music is muffled and ducked, then swells back
to full by the loop point, so the loop has no seam.

Effects are the owner's files: stone-breaking (the taps and breaks), the Top-20
grab bag (the XP ding), and Sword-Armor-Tool-Break (the pickaxe breaking), plus
a little synthesis (scripts/mc_audio_lib.py) for the footsteps and the drop.

  --music none   effects only, a few dB quieter

Writes public/audio/diamond-mix.mp3 or diamond-sfx.mp3.
"""
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mc_audio_lib import SR, N, band, decay, decode, env, fade, footstep, place, shimmer, stereo, thump, tone, whoosh, write_mp3

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "audio", "src")
FF = os.environ.get("FFMPEG", "ffmpeg")
B = json.load(open(os.path.join(ROOT, "src", "minecraft-pov2", "beats-diamond.json")))
FPS = B["fps"]
sec = lambda f: f / FPS
NO_MUSIC = "--music" in sys.argv and sys.argv[sys.argv.index("--music") + 1] == "none"
OUT = os.path.join(ROOT, "public", "audio", "diamond-sfx.mp3" if NO_MUSIC else "diamond-mix.mp3")


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


def muffled_ducked(x, t0, t1, floor=0.3):
    """from t0 the music goes dull and quiet, and returns to normal by t1 (the loop point)"""
    n = len(x)
    i0, i1 = int(t0 * SR), min(n, int(t1 * SR))
    # one-pole low-pass at ~600 Hz
    a = 1 - np.exp(-2 * np.pi * 600 / SR)
    lp = np.zeros_like(x)
    y = np.zeros(2)
    for i in range(i0, n):
        y = y + a * (x[i] - y)
        lp[i] = y
    w = np.zeros(n)
    w[i0:i1] = np.linspace(1, 0, i1 - i0) ** 1.6
    w[i0:i0 + int(0.02 * SR)] = np.linspace(0, 1, int(0.02 * SR))
    g = 1 - (1 - floor) * w
    out = x.copy()
    out[i0:] = (lp[i0:] * w[i0:, None] + x[i0:] * (1 - w[i0:, None])) * g[i0:, None]
    return out


if __name__ == "__main__":
    need = ["stone-breaking.mp4", "mc-sfx-top20.mp4", "tool-break.mp3"] + ([] if NO_MUSIC else ["harder-better-faster-stronger.mp3"])
    for name in need:
        if not os.path.exists(os.path.join(SRC, name)):
            sys.exit("missing public/audio/src/" + name)
    total = sec(B["frames"])
    mix = np.zeros((int(total * SR), 2), dtype=np.float32)

    stone_tap = clip("stone-breaking.mp4", 0.875, 1.06)
    stone_break = clip("stone-breaking.mp4", 1.37, 1.95)
    xp = clip("mc-sfx-top20.mp4", 2.22, 2.7)
    tool_break = clip("tool-break.mp3", 0.15, 0.92)

    if not NO_MUSIC:
        s = decode(FF, os.path.join(SRC, "harder-better-faster-stronger.mp3"))
        a = int(B["musicFrom"] * SR)
        seg = (s[a:a + len(mix)] * 1.4).astype(np.float32)
        seg = muffled_ducked(seg, sec(B["pickBreak"]), total)
        place(mix, fade(seg, 0.0, 0.0), 0)

    # the tunnel: a tap on each early hit, the block going on the last
    for t in B["tunnel"]:
        for h in t["hits"][:-1]:
            at_peak(mix, stone_tap, h, 0.6)
        at_peak(mix, stone_break, t["hits"][-1], 0.9)
    for i, st in enumerate(B["steps"]):
        place(mix, footstep(20 + i) * 1.6, sec(st), 0.5)
    # the drop: the wall of diamonds
    place(mix, thump(50, 0.5) * 2.0, sec(B["reveal"]), 0.5)
    place(mix, shimmer(), sec(B["reveal"] + 1), 0.4)
    # each diamond: a tap, then the ore breaks with the XP ding, both on the kick
    for i, o in enumerate(B["ores"]):
        at_peak(mix, stone_tap, o["hits"][0], 0.6)
        at_peak(mix, stone_break, o["hits"][-1], 0.65)
        at_peak(mix, xp, o["hits"][-1], 0.7 + 0.04 * i)
        place(mix, stereo(tone(np.linspace(700, 1500, N(0.08)), 0.08) * decay(N(0.08), 30)), sec(o["hits"][-1] + 14), 0.3)
    # the fifth: a tap, then the pickaxe breaks (the owner's tool-break sound)
    at_peak(mix, stone_tap, B["fail"]["hits"][0], 0.6)
    at_peak(mix, tool_break, B["pickBreak"], 1.0)

    write_mp3(FF, mix, OUT, lufs=-18 if NO_MUSIC else -14)
    print("wrote", os.path.relpath(OUT, ROOT), f"({total:.2f}s)")
