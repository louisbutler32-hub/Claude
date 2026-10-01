#!/usr/bin/env python3
"""Soundtrack for the first-person "POV: You finally find diamonds".

Placed on frames read from src/minecraft-pov2/beats-diamond.json, the same
file the video reads.

Music is Harder, Better, Faster, Stronger (the owner's copy,
public/audio/src/harder-better-faster-stronger.mp3), started on a kick at
33.357 s. Its kicks (measured) are the picture's beats: one hit breaks the stone
(frame 28), a footstep on each beat of the two-block walk (42 57 74), the
track's drop (36.256 s) is the diamond wall appearing (87), the first three
diamonds break on the next three kicks (102 117 131), and the pickaxe breaks
on the fourth (146), where the music is cut dead and a single meme hit (a
vine boom) lands. Nothing after it but the room tone.

Effects are the owner's files (stone-breaking, Top-20 grab bag), plus
synthesis from scripts/mc_audio_lib.py.

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


def snap(dur=0.35):
    """the tool breaking: a crack, then a shower of little pieces"""
    n = N(dur)
    t = np.arange(n) / SR
    crack = band(n, 2500, 2500, 31) * decay(n, 40)
    bits = np.zeros(n)
    rng = np.random.default_rng(2)
    for _ in range(10):
        i = int(rng.uniform(0.03, 0.3) * SR)
        m = min(N(0.03), n - i)
        bits[i:i + m] += rng.standard_normal(m) * decay(m, 120)
    return stereo((crack + 0.5 * bits) * env(n, 0.0005, 0.05))


def riser(dur):
    n = N(dur)
    t = np.linspace(0, 1, n)
    return stereo(band(n, 3000, 3600, 11) * t ** 2.2 * env(n, 0.05, 0.02)) * 0.7


def vine_boom(dur=1.2):
    """the meme hit: a sub drop with a hard transient and a long tail"""
    n = N(dur)
    t = np.arange(n) / SR
    f = 45 + 95 * np.exp(-t * 9)
    body = tone(f, dur) * np.exp(-t * 3.2) + 0.5 * tone(f * 2.01, dur) * np.exp(-t * 5)
    hit = band(n, 900, 700, 4) * np.exp(-t * 60) * 0.9
    return stereo(np.tanh((body + hit) * 1.8) * env(n, 0.001, 0.3))


if __name__ == "__main__":
    need = ["stone-breaking.mp4", "mc-sfx-top20.mp4"] + ([] if NO_MUSIC else ["harder-better-faster-stronger.mp3"])
    for name in need:
        if not os.path.exists(os.path.join(SRC, name)):
            sys.exit("missing public/audio/src/" + name)
    total = sec(B["frame"])
    mix = np.zeros((int(total * SR), 2), dtype=np.float32)

    stone_break = clip("stone-breaking.mp4", 1.37, 1.95)
    xp = clip("mc-sfx-top20.mp4", 2.22, 2.7)

    if not NO_MUSIC:
        s = decode(FF, os.path.join(SRC, "harder-better-faster-stronger.mp3"))
        a = int(B["musicFrom"] * SR)
        dur = sec(B["pickBreak"]) + 0.02
        place(mix, fade(s[a:a + int(dur * SR)] * 1.4, 0.05, 0.03), 0)

    # one hit breaks the stone
    at_peak(mix, stone_break, B["hit"], 1.0)
    # the two-block walk: a step on each beat
    for i, st in enumerate(B["steps"]):
        place(mix, footstep(20 + i) * 1.6, sec(st), 0.5)
    # the drop: the wall of diamonds
    place(mix, thump(50, 0.5) * 2.0, sec(B["reveal"]), 0.5)
    place(mix, shimmer(), sec(B["reveal"] + 1), 0.4)
    # each diamond: the ore breaks and the XP ding, both on the kick
    for i, o in enumerate(B["ores"]):
        at_peak(mix, stone_break, o, 0.6)
        at_peak(mix, xp, o, 0.7 + 0.05 * i)
        place(mix, stereo(tone(np.linspace(700, 1500, N(0.08)), 0.08) * decay(N(0.08), 30)), sec(o + 14), 0.3)
    # the fourth: the pickaxe breaks, and the meme hit
    place(mix, snap(), sec(B["pickBreak"]), 0.9)
    place(mix, vine_boom(), sec(B["pickBreak"]), 1.0)

    write_mp3(FF, mix, OUT, lufs=-18 if NO_MUSIC else -14)
    print("wrote", os.path.relpath(OUT, ROOT), f"({total:.1f}s)")
