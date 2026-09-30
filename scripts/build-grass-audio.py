#!/usr/bin/env python3
"""Soundtrack for "POV: You finally reach grass".

Placed on frames read from src/minecraft-grass/beats.json, the same file the
video reads.

  --music lullaby (default)  original and synthesised here, so it ships free of
                             any claim: a dark cave drone while he digs, then a
                             choir swelling in on the breakthrough and a warm
                             acoustic melody over the meadow
  --song FILE --at SECONDS   a real song instead of the choir and the melody
                             (FILE in public/audio/src/). SECONDS is where in
                             the track the breakthrough (frame 222) sits, so the
                             song's big moment lands as the last block breaks.
                             A licensed or claimed song should go through
                             YouTube's Shorts sound picker over the --music none
                             render. For "Here Comes the Sun" (The Beatles),
                             --at 0 starts it at the breakthrough
  --music none               every effect, no music, a few dB quieter

The rest is synthesised (scripts/mc_audio_lib.py): the cave drone and drips, the
sigh, every pickaxe strike, stone and dirt breaking, the block popping in under
his feet, the light leaking, the final crash, birds, the cow, the flop onto
the grass.

Writes public/audio/grass-mix.mp3, grass-mix-song.mp3 or grass-sfx.mp3.
"""
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mc_audio_lib import (SR, N, band, boom, click, decay, decode, env, fade, footstep, heartbeat, hiss, place, record_scratch, shimmer,
                          stereo, thump, tone, whoosh, write_mp3)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "audio", "src")
FF = os.environ.get("FFMPEG", "ffmpeg")
B = json.load(open(os.path.join(ROOT, "src", "minecraft-grass", "beats.json")))
FPS = B["fps"]
sec = lambda f: f / FPS

ARGS = sys.argv[1:]
SONG = ARGS[ARGS.index("--song") + 1] if "--song" in ARGS else None
AT = float(ARGS[ARGS.index("--at") + 1]) if "--at" in ARGS else 0.0
CHOICE = ARGS[ARGS.index("--music") + 1] if "--music" in ARGS else "lullaby"
if CHOICE not in ("lullaby", "none"):
    sys.exit("--music must be lullaby or none")
NO_MUSIC = CHOICE == "none" and not SONG
OUT = os.path.join(ROOT, "public", "audio", "grass-sfx.mp3" if NO_MUSIC else "grass-mix-song.mp3" if SONG else "grass-mix.mp3")


def plus(a, b):
    """sum two clips of different lengths"""
    n = max(len(a), len(b))
    out = np.zeros((n, 2), dtype=np.float32)
    out[: len(a)] += a
    out[: len(b)] += b
    return out


def pick(freq=2300):
    """a pickaxe on stone: a hard tink over a short thud"""
    n = N(0.16)
    t = np.arange(n) / SR
    tink = np.sin(2 * np.pi * freq * t) * np.exp(-40 * t) + 0.5 * np.sin(2 * np.pi * freq * 1.52 * t) * np.exp(-55 * t)
    return plus(stereo(tink * 0.6), thump(95, 0.12) * 0.7)


def crunch(dur=0.28, center=1100, seed=1):
    """a block breaking: a crack and falling crumbs"""
    n = N(dur)
    t = np.arange(n) / SR
    crumbs = band(n, center, 900, seed) * np.exp(-9 * t)
    crack = band(n, 3800, 2400, seed + 7) * np.exp(-60 * t) * 0.8
    return stereo((crumbs + crack) * env(n, 0.002, 0.08))


def pop(freq=420):
    """a block placed under his feet"""
    n = N(0.12)
    f = np.linspace(freq * 1.8, freq, n)
    return plus(stereo(tone(f, 0.12) * env(n, 0.002, 0.06)), thump(120, 0.1) * 0.5)


def drip(seed):
    n = N(0.22)
    t = np.arange(n) / SR
    f = 1900 + 500 * np.exp(-30 * t)
    return stereo(np.sin(2 * np.pi * f * t) * np.exp(-28 * t) * 0.5)


def sigh(dur=0.7):
    n = N(dur)
    return stereo(band(n, 900, 1100, 9) * 0.5 * env(n, 0.25, 0.4) * np.linspace(1, 0.4, n))


def breath_in(dur=0.6):
    n = N(dur)
    return stereo(band(n, 1300, 1600, 4) * 0.45 * np.linspace(0.1, 1, n) * env(n, 0.3, 0.05))


def chirp(f0, f1, dur):
    n = N(dur)
    return stereo(tone(np.linspace(f0, f1, n), dur) * env(n, 0.004, dur * 0.4))


def bird(seed):
    rng = np.random.default_rng(seed)
    out = np.zeros((N(0.6), 2), dtype=np.float32)
    for k in range(int(rng.integers(3, 6))):
        c = chirp(rng.uniform(2600, 3600), rng.uniform(3000, 4400), 0.07)
        place(out, c, k * 0.09, 0.5)
    return out


def moo(dur=1.0):
    n = N(dur)
    t = np.arange(n) / SR
    f = 120 - 35 * np.sin(np.pi * t / dur)
    return stereo(tone(f, dur, harmonics=6, vib=0.03, vib_rate=5) * 0.5 * env(n, 0.08, 0.3))


def flop():
    return plus(thump(70, 0.35) * 1.4, stereo(band(N(0.3), 500, 700, 13) * decay(N(0.3), 9) * 0.8))


def drone(dur):
    n = N(dur)
    t = np.arange(n) / SR
    return stereo(band(n, 120, 140, 21) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.2 * t)) * 0.45)


def choir(dur):
    """an 'aaah' swell: C, G, C, E, G, D stacked, each slightly detuned"""
    n = N(dur)
    out = np.zeros(n)
    for f in (130.8, 196.0, 261.6, 329.6, 392.0, 587.3):
        for d in (-0.6, 0.0, 0.7):
            out += tone(f * (1 + d * 0.003), dur, harmonics=5, vib=0.004, vib_rate=5.2) * 0.12
    return stereo(out * env(n, 1.2, 1.4))


def pluck(freq, dur=0.9):
    n = N(dur)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for h, a in ((1, 1.0), (2, 0.5), (3, 0.25), (4, 0.12)):
        out += a * np.sin(2 * np.pi * freq * h * t) * np.exp(-(3 + h * 1.5) * t)
    return stereo(out * env(n, 0.003, 0.2))


NOTES = {"C4": 261.63, "D4": 293.66, "E4": 329.63, "F4": 349.23, "G4": 392.0, "A4": 440.0, "B4": 493.88, "C5": 523.25, "E5": 659.25, "G5": 783.99}
BARS = [["C4", "E4", "G4", "C5", "G4", "E4", "G4", "E5"], ["B4", "D4", "G4", "B4", "G4", "D4", "G4", "G5"],
        ["A4", "C5", "E5", "C5", "A4", "E4", "A4", "C5"], ["F4", "A4", "C5", "A4", "F4", "C5", "A4", "F4"]]


def melody(dur, beat=0.25):
    out = np.zeros((int(dur * SR), 2), dtype=np.float32)
    t, i = 0.0, 0
    while t < dur:
        name = BARS[(i // 8) % 4][i % 8]
        f = NOTES.get(name, 392.0)
        place(out, pluck(f, 1.0), t, 0.55)
        if i % 8 == 0:
            place(out, pluck(f / 2, 1.6), t, 0.4)
        t += beat
        i += 1
    return out


if __name__ == "__main__":
    need = ["mc-damage.mp3"] + ([SONG] if SONG else [])
    for name in need:
        if not os.path.exists(os.path.join(SRC, name)):
            sys.exit("missing public/audio/src/" + name)
    total = sec(B["frames"])
    mix = np.zeros((int(total * SR), 2), dtype=np.float32)
    bf = B["breakFinal"]

    # the cave: a low drone that thins out as he nears the surface, and drips
    place(mix, fade(drone(sec(bf) + 0.5), 0.2, 0.3), 0, 0.5)
    for k, f in enumerate(range(8, bf - 20, 37)):
        place(mix, drip(k), sec(f), 0.10 + 0.04 * (k % 3))
    place(mix, sigh(), sec(B["sigh"][0]), 0.3)

    # every strike, every break, every block popping in under him
    for i, s in enumerate(B["strikes"][:-1]):
        late = i / max(1, len(B["strikes"]) - 2)
        place(mix, pick(2100 + 500 * late), sec(s), 0.55)
        place(mix, crunch(0.26, 900 + (300 if i > 5 else 0) - (150 if i > 5 else 0), seed=i * 3), sec(s + 1), 0.5)
        r0 = s + 3
        place(mix, pop(380 + i * 18), sec(r0 + 1), 0.4)
        place(mix, footstep(s + 500), sec(r0 + B["riseLen"][i]), 0.22)

    # the last block: light leaking, a held breath, the heartbeat, then the crash
    place(mix, fade(shimmer(), 0.05, 0.2), sec(B["leak"]), 0.25)
    place(mix, breath_in(0.7), sec(B["suspense"][0] + 10), 0.35)
    for k in range(0, B["suspense"][1] - B["suspense"][0] - 6, 10):
        place(mix, heartbeat(), sec(B["suspense"][0] + k), 0.16 + 0.004 * k)
    for k, f in enumerate((B["leak"] + 4, B["leak"] + 12, B["leak"] + 18)):
        place(mix, bird(k + 40), sec(f), 0.05 + 0.03 * k)  # the first birds, muffled, far above
    place(mix, pick(1700), sec(bf), 0.7)
    place(mix, crunch(0.5, 700, seed=99), sec(bf + 1), 0.7)
    place(mix, boom(0.9, seed=8), sec(bf), 0.5)
    place(mix, fade(whoosh(1.0, seed=3), 0.02, 0.5), sec(bf), 0.35)
    place(mix, shimmer(), sec(bf + 2), 0.4)
    place(mix, chirp(1400, 2800, 0.5), sec(bf + 2), 0.12)

    # the meadow: birds, wind, the climb out, the cow, the flop, the butterfly
    n = N(total - sec(B["outside"]))
    t = np.arange(n) / SR
    place(mix, stereo(band(n, 500, 700, 31) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.3 * t)) * 0.3), sec(B["outside"]), 0.12)
    for k, f in enumerate(B["birds"]):
        place(mix, bird(k), sec(f), 0.32)
    for f in range(B["climb"][0], B["climb"][1], 5):
        place(mix, footstep(f), sec(f), 0.2)
    place(mix, moo(), sec(B["moo"]), 0.22)
    place(mix, flop(), sec(B["flop"]), 0.65)
    place(mix, stereo(band(N(0.4), 6000, 3000, 5) * env(N(0.4), 0.02, 0.3)), sec(B["flop"] + 2), 0.12)
    for k in range(3):
        place(mix, chirp(2400, 3600, 0.04), sec(B["butterfly"] + 30 + k * 3), 0.05)

    # the ending: he lies in the grass, eyes open, and something walks up
    n = N(0.5)
    place(mix, stereo(band(n, 700, 900, 6) * np.linspace(0.2, 1, n) * env(n, 0.3, 0.1)), sec(B["eyes"][0]), 0.2)
    c0, c1 = B["creeper"]
    for k, f in enumerate(range(c0 + 2, c1, 8)):
        u = (f - c0) / (c1 - c0)
        place(mix, footstep(900 + k), sec(f), 0.25 + 0.7 * u * u)
    hs, he = B["hiss"]
    nh = N(sec(he - hs) + 0.05)
    place(mix, stereo(band(nh, 6500, 5500, 5) * np.linspace(0.5, 1.3, nh) * env(nh, 0.03, 0.02)), sec(hs), 1.3)
    place(mix, boom(1.6, seed=4), sec(B["boom"]), 0.95)
    place(mix, crunch(0.7, 500, seed=21), sec(B["boom"] + 1), 0.8)
    place(mix, fade(whoosh(0.8, seed=15), 0.01, 0.4), sec(B["boom"]), 0.3)
    nr = N(2.4)
    tr = np.arange(nr) / SR
    ring = np.sin(2 * np.pi * 3300 * tr) * np.exp(-1.6 * tr) * 0.18
    place(mix, stereo(ring * env(nr, 0.01, 0.6)), sec(B["boom"] + 2), 1.0)
    oof = decode(FF, os.path.join(SRC, "mc-damage.mp3"), "atrim=0.20:0.62,asetpts=PTS-STARTPTS")
    place(mix, oof, sec(B["ev"]["youDied"]), 1.15)
    place(mix, click(1600, 0.02), sec(B["ev"]["cursor"][1] + 1), 0.35)

    # the music: a choir on the breakthrough, then the melody over the grass, cut dead when the creeper appears
    if SONG:
        song = decode(FF, os.path.join(SRC, SONG))
        i0 = int(AT * SR)
        place(mix, fade(song[i0:i0 + int((sec(B["pov"] + 6) - sec(bf)) * SR)] * 0.6, 0.1, 0.12), sec(bf))
    elif not NO_MUSIC:
        musicEnd = sec(B["pov"] + 6)  # the creeper turns up and the music stops dead
        place(mix, fade(choir(musicEnd - sec(bf)), 0.05, 0.15), sec(bf), 0.5)
        place(mix, fade(melody(musicEnd - sec(B["outside"] + 14)), 0.4, 0.12), sec(B["outside"] + 14), 0.36)

    write_mp3(FF, mix, OUT, lufs=-18 if NO_MUSIC else -14)
    print("wrote", os.path.relpath(OUT, ROOT), f"({total:.1f}s)")
