#!/usr/bin/env python3
"""Soundtrack for "Nobody: / Minecraft players:" (cooking by crafting rules).

Placed on frames read from src/minecraft-food/beats.json, the same file the
video reads.

Sound effects are the owner's own Minecraft files (public/audio/src/, never
committed): the XP ding on every craft and the eating crunches, one crunch per
bite, both cut from mc-sfx-top20.mp4, and mc-damage.mp3 for the chicken. A
little synthesis (scripts/mc_audio_lib.py) adds the item pops, the burp, the
queasy wobble, and an original light bossa groove under the cooking: a walking
bass on the beat, a plucked chord on the off-beat, a shaker. The groove stops
dead on a record scratch the moment the raw chicken goes down.

  --music none   the effects only, a few dB quieter

Writes public/audio/food-mix.mp3 or food-sfx.mp3.
"""
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mc_audio_lib import SR, N, band, boing, decay, decode, env, fade, place, record_scratch, shimmer, stereo, thump, tone, write_mp3

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "audio", "src")
FF = os.environ.get("FFMPEG", "ffmpeg")
B = json.load(open(os.path.join(ROOT, "src", "minecraft-food", "beats.json")))
FPS = B["fps"]
sec = lambda f: f / FPS
NO_MUSIC = "--music" in sys.argv and sys.argv[sys.argv.index("--music") + 1] == "none"
OUT = os.path.join(ROOT, "public", "audio", "food-sfx.mp3" if NO_MUSIC else "food-mix.mp3")

hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)


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


def pop(f0=520, dur=0.09):
    """an item set down on the board: a short rising bloop"""
    n = N(dur)
    return stereo(tone(np.linspace(f0, f0 * 1.9, n), dur) * decay(n, 30) * env(n, 0.002, 0.03))


def pluck(freq, dur=0.45, bright=1.0):
    n = N(dur)
    t = np.arange(n) / SR
    out = sum(a * np.sin(2 * np.pi * freq * h * t) * np.exp(-(5 + 3 * h) * t) for h, a in ((1, 1.0), (2, 0.45 * bright), (3, 0.2 * bright), (4, 0.1 * bright)))
    return stereo(out * env(n, 0.002, 0.08))


def bass(freq, dur=0.3):
    n = N(dur)
    return stereo(tone(freq, dur, harmonics=3) * decay(n, 6) * env(n, 0.004, 0.06))


def shaker(seed):
    n = N(0.06)
    return stereo(band(n, 6500, 2500, seed) * decay(n, 55))


def burp():
    n = N(0.7)
    t = np.arange(n) / SR
    f = 95 + 30 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 3) - 40 * t
    x = tone(f, 0.7, harmonics=6) * 0.7 + band(n, 400, 300, 17) * 0.35
    return stereo(x * np.sin(np.linspace(0, np.pi, n)) ** 0.7 * env(n, 0.02, 0.15))


def queasy(dur=1.6):
    n = N(dur)
    t = np.arange(n) / SR
    f = 180 * (1 + 0.25 * np.sin(2 * np.pi * 3.1 * t)) * np.exp(-t * 0.35)
    return stereo(tone(f, dur, harmonics=4) * (0.6 + 0.4 * np.sin(2 * np.pi * 4.2 * t)) * env(n, 0.05, 0.4))


if __name__ == "__main__":
    total = sec(B["frames"])
    mix = np.zeros((int(total * SR) + SR, 2), dtype=np.float32)
    bread, carrot, cake, chicken = B["bread"], B["carrot"], B["cake"], B["chicken"]

    # ---- the owner's effects ----
    ding = clip("mc-sfx-top20.mp4", 2.18, 2.75)
    # the eating segment, one crunch per bite: onsets measured in the file
    ons = [3.63, 3.80, 4.01, 4.22, 4.46, 4.64, 4.82, 5.02]
    crunch = [clip("mc-sfx-top20.mp4", ons[i], ons[i + 1] - 0.01) for i in range(len(ons) - 1)]
    hurt = clip("mc-damage.mp3", 0.0, 0.95)

    # ---- placing: a pop each time something lands on the board ----
    places = bread["place"] + carrot["place"] + cake["place"] + [chicken["place"]]
    for i, f in enumerate(places):
        place(mix, pop(480 + 40 * (i % 4)), sec(f), 0.45)

    # ---- crafting: the XP ding the moment the result appears ----
    for f in (bread["craft"], carrot["craft"], cake["craft"]):
        at_peak(mix, ding, f, 0.9)
        place(mix, stereo(band(N(0.18), 3500, 2500, f) * decay(N(0.18), 20)), sec(f), 0.25)

    # ---- eating: a crunch per bite, rotating through the seven takes ----
    k = 0
    for f in bread["chomps"] + carrot["chomps"] + cake["chomps"] + chicken["chomps"]:
        c = crunch[k % len(crunch)]
        at_peak(mix, c, f, 0.9 if k % 2 else 0.8)
        k += 1
    # the pick-up before eating: a soft tick
    for f in (bread["pick"][0], carrot["pick"][0], chicken["pick"][0]):
        place(mix, pop(900, 0.05), sec(f), 0.22)

    # ---- night vision, the burp, the chicken ----
    place(mix, shimmer() * 1.6, sec(carrot["nightVision"]), 0.5)
    place(mix, burp(), sec(cake["burp"]), 0.55)
    at_peak(mix, hurt, chicken["sick"], 0.8)
    place(mix, queasy(), sec(chicken["sick"] + 2), 0.28)
    place(mix, thump(60, 0.3) * 1.4, sec(chicken["hunger"]), 0.5)
    place(mix, boing(230, 520, 0.5, 0.8), sec(chicken["thumbs"]), 0.35)  # the thumbs-up bounce

    # ---- the groove, until the raw chicken ----
    if not NO_MUSIC:
        beat = 15  # frames: 120 bpm
        chords = [(48, [60, 64, 67]), (45, [57, 60, 64]), (41, [53, 57, 60]), (43, [55, 59, 62])]  # C Am F G
        stop = chicken["place"]
        for bi in range(0, stop // beat + 1):
            f = bi * beat
            if f >= stop:
                break
            root, tri = chords[(bi // 4) % 4]
            walk = [0, 7, 12, 7][bi % 4]
            place(mix, bass(hz(root + walk), 0.28), sec(f), 0.55)
            # the chord on the off-beat, an arpeggio on the "and"
            place(mix, pluck(hz(tri[bi % 3] + 12), 0.4), sec(f + beat // 2), 0.34)
            if bi % 2:
                place(mix, pluck(hz(tri[(bi + 1) % 3] + 24), 0.3, 0.7), sec(f + 3 * beat // 4), 0.2)
            place(mix, shaker(bi), sec(f), 0.25)
            place(mix, shaker(bi + 90), sec(f + beat // 2), 0.18)
            if bi % 2 == 0:
                place(mix, thump(70, 0.12) * 1.4, sec(f), 0.35)
        place(mix, record_scratch(), sec(stop), 0.6)

    write_mp3(FF, mix[: int(total * SR)], OUT, lufs=-18 if NO_MUSIC else -14)
    print("wrote", os.path.relpath(OUT, ROOT), f"({total:.1f}s)")
