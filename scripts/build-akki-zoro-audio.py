#!/usr/bin/env python3
"""Soundtrack for the AKKI TALKS "Zoro vs the cursed sword" short.

All synthesised in numpy (scripts/mc_audio_lib.py) — no samples, no
licensed music. Cues come from src/akki/zoro/beats.json, the file the video
reads, so a re-timed shot moves its sound with it.

  shop      (0–2s)    a light plucked koto-ish phrase over a soft pad
  the test  (2–8.5s)  a taiko hit as the camera drops under him, then a low
                      drone and heartbeat taiko while the sword turns; airy
                      whooshes each time it passes, a steel ring on the sweep
  the floor           the drone cuts dead; the thunk of the blade into
                      the boards; a beat of silence; the arm lands, wet thud
  denial              a spurt hiss, then a cheap bouncy oom-pah with a boing
                      on every hop
  the end             a big low brass hit as the spotlight clunks on, and a
                      held heroic chord under the three-sword reveal

Writes public/audio/akki-zoro-mix.mp3 at -14 LUFS.
"""
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mc_audio_lib import SR, N, band, boing, boom, click, decay, env, place, stereo, thump, tone, whoosh, write_mp3

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FF = os.environ.get("FFMPEG", "ffmpeg")
B = json.load(open(os.path.join(ROOT, "src", "akki", "zoro", "beats.json")))
FPS = B["fps"]
S = B["shots"]
sec = lambda f: f / FPS
DUR = sec(B["frames"]) + 0.2
OUT = os.path.join(ROOT, "public", "audio", "akki-zoro-mix.mp3")

A3, D4, E4, G4, A4, C5, D5, E5 = 220.0, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25


# ------------------------------------------------------------------ voices

def pluck(hz, dur=0.6):
    """koto-ish: bright attack, fast decay, a little pitch bend down into the note"""
    n = N(dur)
    t = np.arange(n) / SR
    f = hz * (1 + 0.02 * np.exp(-t * 40))
    return stereo(tone(f, dur, harmonics=5) * decay(n, 6) * env(n, 0.002, 0.08) * 0.5)


def pad(hzs, dur, level=0.12):
    n = N(dur)
    out = sum(tone(h, dur, harmonics=3, vib=0.003, vib_rate=4.5) for h in hzs) / len(hzs)
    return stereo(out * env(n, 0.3, 0.4) * level)


def taiko(big=1.0, seed=1):
    n = N(0.9)
    t = np.arange(n) / SR
    f = 62 + 90 * np.exp(-t * 20)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5)
    skin = band(n, 400, 300, seed) * np.exp(-t * 30) * 0.4
    return stereo((body + skin) * big)


def drone(dur, hz=55.0):
    n = N(dur)
    t = np.arange(n) / SR
    s = tone(hz, dur, harmonics=6) * 0.5 + tone(hz * 1.5, dur, harmonics=3) * 0.2
    s *= 0.7 + 0.3 * np.sin(2 * np.pi * 0.5 * t)
    return stereo(s * env(n, 0.5, 0.02))


def ring(hz=2400, dur=1.2):
    """steel: a few inharmonic partials, long shimmer"""
    n = N(dur)
    s = sum(tone(hz * k, dur) * (0.6 / i) for i, k in enumerate((1.0, 1.51, 2.27, 3.1), 1))
    return stereo(s * decay(n, 3.5) * env(n, 0.001, 0.2))


def swish(dur, seed):
    w = whoosh(dur, seed)
    return w * 0.9


def thunk():
    """blade into floorboards: a woody knock plus a short steel twang"""
    n = N(0.5)
    t = np.arange(n) / SR
    wood = band(n, 260, 160, 31) * np.exp(-t * 22)
    knock = np.sin(2 * np.pi * np.cumsum(140 + 120 * np.exp(-t * 60)) / SR) * np.exp(-t * 14)
    twang = tone(620 * (1 + 0.04 * np.sin(2 * np.pi * 18 * t)), 0.5, harmonics=3) * np.exp(-t * 7) * 0.35
    return stereo(wood * 0.8 + knock * 0.9 + twang)


def splat():
    n = N(0.45)
    t = np.arange(n) / SR
    thud = np.sin(2 * np.pi * np.cumsum(90 + 60 * np.exp(-t * 30)) / SR) * np.exp(-t * 12)
    wet = band(n, 1100, 900, 41) * np.exp(-t * 9) * (0.5 + 0.5 * np.sin(2 * np.pi * 37 * t))
    return stereo(thud * 0.9 + wet * 0.6)


def spurt(dur=0.9):
    n = N(dur)
    t = np.arange(n) / SR
    pulses = 0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 7 * t))
    return stereo(band(n, 3200, 1600, 51) * pulses * env(n, 0.01, 0.3) * 0.7)


def squeal(dur=0.6):
    """the clerk's eep — a rising cartoon whistle, not a voice"""
    n = N(dur)
    return stereo(tone(np.linspace(900, 1700, n), dur, harmonics=2, vib=0.03, vib_rate=11) * env(n, 0.02, 0.15) * 0.4)


def tuba(hz, dur=0.22):
    n = N(dur)
    return stereo(tone(hz, dur, harmonics=6) * env(n, 0.01, 0.08) * 0.45)


def brass_hit(dur=2.0):
    n = N(dur)
    t = np.arange(n) / SR
    chord = sum(tone(h, dur, harmonics=7, vib=0.004, vib_rate=5) for h in (A3 / 2, A3, E4, A4)) / 4
    return stereo(chord * (0.6 + 0.4 * np.exp(-t * 3)) * env(n, 0.01, 0.6))


def clunk():
    n = N(0.25)
    t = np.arange(n) / SR
    return stereo(band(n, 900, 400, 61) * np.exp(-t * 30) + np.sin(2 * np.pi * 120 * t) * np.exp(-t * 25) * 0.6)


# ------------------------------------------------------------------ the mix

if __name__ == "__main__":
    mix = np.zeros((N(DUR), 2), dtype=np.float32)

    # shop: a little plucked phrase over a pad
    phrase = [(A4, 0), (C5, 4), (D5, 8), (E5, 12), (D5, 16), (C5, 18), (A4, 20)]
    for hz, f in phrase:
        place(mix, pluck(hz), sec(f), 0.7)
    place(mix, pad((A3, E4, A4), sec(S["below"][0]) + 0.1), 0, 1.0)
    place(mix, swish(0.45, 3), sec(B["toss"] - 1), 0.5)
    # the sword turning up there: a soft whirr that comes and goes
    n = N(sec(S["ceiling"][1] - S["ceiling"][0]))
    tt = np.arange(n) / SR
    place(mix, stereo(band(n, 700, 300, 7) * (0.5 + 0.5 * np.sin(2 * np.pi * 6 * tt)) * env(n, 0.05, 0.1) * 0.25), sec(S["ceiling"][0]))

    # the test: taiko as we drop under him, drone, heartbeat taiko
    place(mix, taiko(1.0), sec(S["below"][0]), 0.9)
    place(mix, drone(sec(S["bootDark"][0] - S["below"][0])), sec(S["below"][0]), 0.22)
    for f in range(S["below"][0] + 18, S["bootDark"][0] - 6, 18):
        place(mix, taiko(0.6, seed=f), sec(f), 0.45)
    place(mix, boom(1.2), sec(S["faceBlack"]), 0.35)
    place(mix, ring(1800, 0.9), sec(S["face"][0] + 4), 0.12)
    place(mix, swish(0.6, 11), sec(B["swordPass"] - 6), 0.9)
    place(mix, swish(0.5, 12), sec(B["swordArc"] - 6), 0.7)
    place(mix, swish(0.45, 13), sec(B["bladeSweep"] - 4), 0.9)
    place(mix, ring(2600, 1.2), sec(B["bladeSweep"] + 4), 0.3)

    # the floor: drone already cut at the hard cut; thunk; silence; the arm
    place(mix, swish(0.25, 14), sec(B["stick"] - 6), 0.6)
    place(mix, thunk(), sec(B["stick"]), 1.0)
    place(mix, click(2200, 0.02), sec(S["bootLit"][0]), 0.2)
    place(mix, swish(0.3, 15), sec(B["armLand"] - 7), 0.4)
    place(mix, splat(), sec(B["armLand"]), 1.0)

    # denial
    place(mix, spurt(), sec(B["spray"]), 0.8)
    place(mix, squeal(), sec(B["spray"] + 3), 0.6)
    bass = [A3 / 2, E4 / 2, A3 / 2, E4 / 2, D4 / 2, A3 / 2]
    for i, f in enumerate(range(B["dance"][0], B["dance"][1], 5)):
        place(mix, tuba(bass[i % len(bass)]), sec(f), 0.9)
        if i % 2 == 0:
            place(mix, boing(160, 380, 0.4, 0.6), sec(f), 0.5)
        place(mix, pluck([E5, C5, D5, A4][i % 4], 0.25), sec(f + 2), 0.35)

    # the end: spotlight clunk, brass hit, held chord
    place(mix, clunk(), sec(B["spotOn"] - 2), 0.8)
    place(mix, brass_hit(sec(B["frames"] - B["spotOn"]) + 0.2), sec(B["spotOn"]), 0.75)
    place(mix, taiko(1.2, seed=99), sec(B["spotOn"]), 0.8)
    place(mix, ring(2200, 1.0), sec(B["spotOn"] + 6), 0.15)

    write_mp3(FF, mix, OUT, lufs=-14)
    print("wrote", os.path.relpath(OUT, ROOT), f"({DUR:.1f}s)")
