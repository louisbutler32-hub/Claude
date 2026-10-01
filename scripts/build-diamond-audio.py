#!/usr/bin/env python3
"""Soundtrack for the first-person "POV: You finally find diamonds".

Placed on frames read from src/minecraft-pov2/beats-diamond.json, the same
file the video reads.

Music is Harder, Better, Faster, Stronger (the owner's copy,
public/audio/src/harder-better-faster-stronger.mp3), started on a kick at
30.39 s so every pickaxe strike falls on a beat; the track's drop at 36.27 s is
the frame the last stone breaks and the wall of diamonds is there. When the
pickaxe breaks on the sixth, the music is cut dead under a record scratch and
a sad trombone, and the last seconds are cave ambience.

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
from mc_audio_lib import SR, N, band, decay, decode, env, fade, place, record_scratch, sad_trombone, shimmer, stereo, thump, tone, whoosh, write_mp3

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


if __name__ == "__main__":
    need = ["stone-breaking.mp4", "mc-sfx-top20.mp4"] + ([] if NO_MUSIC else ["harder-better-faster-stronger.mp3"])
    for name in need:
        if not os.path.exists(os.path.join(SRC, name)):
            sys.exit("missing public/audio/src/" + name)
    total = sec(B["frame"])
    mix = np.zeros((int(total * SR), 2), dtype=np.float32)

    stone_tap = clip("stone-breaking.mp4", 0.875, 1.06)
    stone_break = clip("stone-breaking.mp4", 1.37, 1.95)
    xp = clip("mc-sfx-top20.mp4", 2.22, 2.7)
    cave = clip("mc-sfx-top20.mp4", 24.38, 26.38, peak=0.9)

    music_end = B["pickBreak"]
    if not NO_MUSIC:
        s = decode(FF, os.path.join(SRC, "harder-better-faster-stronger.mp3"))
        a = int(B["musicFrom"] * SR)
        dur = sec(music_end) + 0.02
        place(mix, fade(s[a:a + int(dur * SR)] * 1.4, 0.05, 0.03), 0)

    # the tunnel: a tap on every beat, the block going on the last
    for ti, t in enumerate(B["tunnel"]):
        for st in t["strikes"]:
            if st == t["break"]:
                at_peak(mix, stone_break, st, 0.8 if ti < 2 else 1.0)
            else:
                at_peak(mix, stone_tap, st, 0.55)
    # the build to the drop, and the drop
    place(mix, fade(riser(sec(B["reveal"] - 120) if False else 2.2), 0.1, 0.01), sec(B["reveal"] - 66), 0.35)
    place(mix, thump(50, 0.5) * 2.0, sec(B["reveal"]), 0.5)
    place(mix, shimmer(), sec(B["reveal"] + 1), 0.4)
    # each diamond: the ore breaks, the XP ding, the pickup pop
    for i, o in enumerate(B["ores"]):
        at_peak(mix, stone_break, o, 0.55)
        at_peak(mix, xp, o, 0.7 + 0.05 * i)
        place(mix, stereo(tone(np.linspace(700, 1500, N(0.08)), 0.08) * decay(N(0.08), 30)), sec(o + 14), 0.3)
    # the pickaxe: a tap, then it breaks
    at_peak(mix, stone_tap, B["pickBreak"], 0.6)
    place(mix, snap(), sec(B["pickBreak"]), 0.9)
    place(mix, record_scratch(), sec(B["pickBreak"] + 1), 0.6)
    place(mix, sad_trombone(), sec(B["pickBreak"] + 14), 0.4)
    place(mix, fade(cave, 0.1, 0.6), sec(B["pickBreak"] + 8), 0.25)

    write_mp3(FF, mix, OUT, lufs=-18 if NO_MUSIC else -14)
    print("wrote", os.path.relpath(OUT, ROOT), f"({total:.1f}s)")
