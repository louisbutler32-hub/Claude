#!/usr/bin/env python3
"""Soundtrack for "POV: you never miss at table tennis".

Entirely original and synthesised here (scripts/mc_audio_lib.py), so it ships
free of any claim. Placed on frames read from src/tabletennis/beats.json, the
same file the video reads.

The rally is the music: every paddle hit is a note of a rising pentatonic
scale, bright and high when he hits ("ping"), lower and rounder when you do
("pong"), so as the gaps shrink from 22 frames to 8 the rally turns into a
runaway arpeggio. Under it: the table's tick on every bounce, the paddle's
"tok", a bass pulse on your hits, a rising noise riser, and a kick drum that
joins when it gets quick. Then the bonk, a falling note, and the ball bouncing
itself out, each bounce lower and softer, to silence.

  --music none   the tok/tick/bonk effects only, a few dB quieter

Writes public/audio/tt-mix.mp3 or tt-sfx.mp3.
"""
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mc_audio_lib import SR, N, band, boing, click, decay, env, fade, place, sad_trombone, stereo, thump, tone, whoosh, write_mp3

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FF = os.environ.get("FFMPEG", "ffmpeg")
B = json.load(open(os.path.join(ROOT, "src", "tabletennis", "beats.json")))
FPS = B["fps"]
sec = lambda f: f / FPS
NO_MUSIC = "--music" in sys.argv and sys.argv[sys.argv.index("--music") + 1] == "none"
OUT = os.path.join(ROOT, "public", "audio", "tt-sfx.mp3" if NO_MUSIC else "tt-mix.mp3")
HITS = B["hits"]

PENTA = [0, 2, 4, 7, 9]
midi = lambda i, base=60: base + PENTA[i % 5] + 12 * (i // 5)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)


def pluck(freq, dur=0.5, bright=1.0):
    n = N(dur)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for h, a in ((1, 1.0), (2, 0.5 * bright), (3, 0.3 * bright), (4, 0.16 * bright), (5.02, 0.1 * bright)):
        out += a * np.sin(2 * np.pi * freq * h * t) * np.exp(-(4 + 2.5 * h) * t)
    return stereo(out * env(n, 0.002, 0.08))


def tok(f0=900, dur=0.07):
    """a paddle: a short woody knock"""
    n = N(dur)
    t = np.arange(n) / SR
    knock = np.sin(2 * np.pi * (f0 * np.exp(-t * 18)) * t) * np.exp(-t * 55)
    return stereo((knock + band(n, 3000, 2500, 5) * np.exp(-t * 90) * 0.5) * env(n, 0.0008, 0.02))


def tick(f0=2400, dur=0.05):
    """the ball on the table: a bright little tick"""
    n = N(dur)
    t = np.arange(n) / SR
    return stereo((np.sin(2 * np.pi * f0 * t) * 0.6 + band(n, 5200, 2600, int(f0)) * 0.4) * np.exp(-t * 110) * env(n, 0.0005, 0.01))


def riser(dur):
    n = N(dur)
    t = np.linspace(0, 1, n)
    c = 700 + 5200 * t ** 1.6
    x = band(n, 3000, 3600, 11)
    return stereo(x * t ** 2.2 * env(n, 0.05, 0.02)) * 0.7


if __name__ == "__main__":
    total = sec(B["frames"])
    mix = np.zeros((int(total * SR), 2), dtype=np.float32)
    gaps = [HITS[i + 1]["f"] - HITS[i]["f"] for i in range(len(HITS) - 1)] + [B["dtLast"]]

    # ---- every hit: a knock and a note ----
    for i, h in enumerate(HITS):
        t = sec(h["f"])
        opp = h["who"] == "opp"
        place(mix, tok(780 if opp else 640), t, 0.5)
        if not NO_MUSIC:
            f = hz(midi(i, 72 if opp else 60))
            place(mix, pluck(f, 0.55, 1.0 if opp else 0.6), t, 0.42 if opp else 0.5)
            if not opp:
                place(mix, thump(hz(midi(i, 36)) * 0.5, 0.22) * 2.0, t, 0.35)  # a bass pulse on your hits
            if gaps[i] <= 14:
                place(mix, thump(60, 0.14) * 1.4, t, 0.4)  # a kick joins when it gets quick
        # the table's tick where the ball lands on the receiving half
        nxt = HITS[i + 1]["f"] if i + 1 < len(HITS) else B["bonk"]
        bounce = h["f"] + 0.58 * (nxt - h["f"]) if i + 1 < len(HITS) else h["f"] + 0.52 * (nxt - h["f"])
        place(mix, tick(2300 if opp else 2700), sec(bounce), 0.3)

    # ---- the build ----
    if not NO_MUSIC:
        r0 = HITS[3]["f"]
        place(mix, fade(riser(sec(B["bonk"] - r0)), 0.1, 0.01), sec(r0), 0.35)

    # ---- the bonk ----
    bf = B["bonk"]
    place(mix, tok(300, 0.16), sec(bf), 0.9)
    place(mix, thump(70, 0.3) * 1.8, sec(bf), 0.55)
    place(mix, stereo(band(N(0.3), 1500, 1500, 9) * decay(N(0.3), 14)), sec(bf), 0.35)
    place(mix, boing(260, 90, 0.5, 0.8), sec(bf + 1), 0.5)
    if not NO_MUSIC:
        place(mix, sad_trombone(), sec(bf + 6), 0.32)
        place(mix, stereo(tone(np.linspace(1200, 160, N(0.7)), 0.7) * env(N(0.7), 0.01, 0.1)), sec(bf + 4), 0.18)  # his fall
    # the ball bouncing itself out: lower and softer every time
    for k, b in enumerate(B["afterBounces"]):
        place(mix, tick(2200 * (0.86 ** k), 0.06 + 0.01 * k), sec(b), 0.4 * (0.72 ** k))
    # a last little roll
    nr = N(0.7)
    place(mix, stereo(band(nr, 1800, 1200, 21) * np.linspace(0.5, 0, nr) * env(nr, 0.05, 0.4)), sec(B["afterBounces"][-1] + 2), 0.08)

    write_mp3(FF, mix, OUT, lufs=-18 if NO_MUSIC else -14)
    print("wrote", os.path.relpath(OUT, ROOT), f"({total:.1f}s)")
