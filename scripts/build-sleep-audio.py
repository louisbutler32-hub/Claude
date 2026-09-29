#!/usr/bin/env python3
"""Soundtrack for "Minecraft sleeping makes no sense".

Placed on frames read from src/minecraft-sleep/beats.json, the same file the
video reads.

  --music lullaby (default)  an original music-box lullaby, synthesised here, so
                             the whole Short ships free of any claim. It plays as
                             Oofy shuffles in, dies on the record scratch when
                             the bed refuses him, tiptoes back in hopefully after
                             the zombie is dealt with, and dies again
  --song FILE --at SECONDS   a real song instead (FILE in public/audio/src/).
                             SECONDS is where in the track frame 0 sits. It
                             plays until the first refusal, then picks up for
                             his second try: where it left off, or at
                             --resume SECONDS if given (so a lyric can land on
                             the second refusal). A licensed or claimed song
                             should go on through YouTube's Shorts sound picker
                             over the --music none render instead. For "Mr.
                             Sandman" (The Chordettes): --at 11.9 --resume 26.8
                             puts "bring me a dream" over the walk-in and
                             "his lonesome nights are over" on the second
                             refusal
  --music none               every effect, no music, a few dB quieter

The rest is synthesised (scripts/mc_audio_lib.py): the shuffle in, the yawn,
right-click pops, record scratches, the door, night wind, a far-off zombie
groan, running steps, sword hits, the poof, the spider's thread and squeak.

Writes public/audio/sleep-mix.mp3, sleep-mix-song.mp3 or sleep-sfx.mp3.
"""
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mc_audio_lib import (SR, N, band, boom, click, decay, decode, env, fade, footstep, place, record_scratch, shimmer,
                          stereo, tone, whoosh, write_mp3)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "audio", "src")
FF = os.environ.get("FFMPEG", "ffmpeg")
B = json.load(open(os.path.join(ROOT, "src", "minecraft-sleep", "beats.json")))
FPS = B["fps"]
sec = lambda f: f / FPS

ARGS = sys.argv[1:]
SONG = ARGS[ARGS.index("--song") + 1] if "--song" in ARGS else None
AT = float(ARGS[ARGS.index("--at") + 1]) if "--at" in ARGS else 0.0
RESUME = float(ARGS[ARGS.index("--resume") + 1]) if "--resume" in ARGS else None
CHOICE = ARGS[ARGS.index("--music") + 1] if "--music" in ARGS else "lullaby"
if CHOICE not in ("lullaby", "none"):
    sys.exit("--music must be lullaby or none")
NO_MUSIC = CHOICE == "none" and not SONG
OUT = os.path.join(ROOT, "public", "audio", "sleep-sfx.mp3" if NO_MUSIC else "sleep-mix-song.mp3" if SONG else "sleep-mix.mp3")


def bell(freq, dur=1.6):
    """a music-box tine: a struck bar with a few inharmonic partials"""
    n = N(dur)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for ratio, amp, rate in ((1, 1.0, 2.2), (2.76, 0.32, 4.5), (5.4, 0.12, 8.0)):
        out += amp * np.sin(2 * np.pi * freq * ratio * t) * np.exp(-rate * t)
    return stereo(out * env(n, 0.002, 0.2))


# an original lullaby in C, 3/4: rocking thirds, rising then settling
MELODY = [("E5", 1), ("G5", 1), ("G5", 1), ("E5", 1), ("G5", 1), ("G5", 1), ("E5", 1), ("G5", 1), ("C6", 1), ("B5", 2), ("A5", 1),
          ("F5", 1), ("A5", 1), ("A5", 1), ("F5", 1), ("A5", 1), ("A5", 1), ("F5", 1), ("A5", 1), ("D6", 1), ("C6", 2), ("G5", 1)]
FREQ = {"C5": 523.25, "D5": 587.33, "E5": 659.25, "F5": 698.46, "G5": 783.99, "A5": 880.0, "B5": 987.77, "C6": 1046.5, "D6": 1174.7}
BASS = ["C3", "G3", "C3", "G3", "F3", "C3", "F3", "C3"]


def lullaby(dur, beat=0.36):
    """the melody laid out for `dur` seconds, looping"""
    n = int(dur * SR)
    out = np.zeros((n, 2), dtype=np.float32)
    t, i = 0.0, 0
    while t < dur:
        name, beats = MELODY[i % len(MELODY)]
        note = bell(FREQ[name], 1.8) * 0.5
        place(out, note, t, 1.0)
        if i % 3 == 0:  # a low soft bar every bar
            place(out, bell(130.8 if (i // 3) % 2 == 0 else 196.0, 2.2), t, 0.35)
        t += beats * beat
        i += 1
    return out


def yawn(dur=0.55):
    n = N(dur)
    f = np.linspace(360, 190, n)
    return stereo((tone(f, dur, harmonics=3, vib=0.02, vib_rate=6) * 0.5 + band(n, 1600, 900, 5) * 0.18) * env(n, 0.12, 0.25))


def groan(dur=0.9, gain=1.0):
    n = N(dur)
    f = np.linspace(105, 62, n)
    return stereo(tone(f, dur, harmonics=5, vib=0.04, vib_rate=7) * env(n, 0.05, 0.4) * gain)


def pop(freq=900):
    n = N(0.1)
    return stereo(tone(np.linspace(freq, freq * 1.6, n), 0.1) * env(n, 0.003, 0.05))


def squeak():
    n = N(0.28)
    return stereo(tone(np.linspace(2600, 3400, n), 0.28, vib=0.04, vib_rate=30) * env(n, 0.01, 0.16))


def wind(dur):
    n = N(dur)
    t = np.arange(n) / SR
    return stereo(band(n, 420, 500, 17) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.35 * t)) * 0.5)


if __name__ == "__main__":
    need = ["mc-hit.mp3"] + ([SONG] if SONG else [])
    for name in need:
        if not os.path.exists(os.path.join(SRC, name)):
            sys.exit("missing public/audio/src/" + name)
    total = sec(B["frames"])
    mix = np.zeros((int(total * SR), 2), dtype=np.float32)
    hit = decode(FF, os.path.join(SRC, "mc-hit.mp3"), "atrim=0.0:0.4,asetpts=PTS-STARTPTS")

    # music: until each refusal, then he tries again and it cuts out again
    seg1 = (0.0, sec(B["click1"]) + 0.05)
    seg2 = (sec(B["outdoor"][1] - 20), sec(B["click2"]) + 0.05)
    if SONG:
        song = decode(FF, os.path.join(SRC, SONG))
        M = 0.55
        i0 = int(AT * SR)
        place(mix, fade(song[i0:i0 + int((seg1[1] - seg1[0]) * SR)] * M, 0.12, 0.02), 0)
        j0 = int((RESUME if RESUME is not None else AT + seg1[1]) * SR)
        place(mix, fade(song[j0:j0 + int((seg2[1] - seg2[0]) * SR)] * M, 0.6, 0.02), seg2[0])
    elif not NO_MUSIC:
        L = 0.5
        place(mix, fade(lullaby(seg1[1] - seg1[0]) * L, 0.02, 0.02), seg1[0])
        place(mix, fade(lullaby(seg2[1] - seg2[0]) * L, 0.6, 0.02), seg2[0])

    place(mix, wind(total), 0, 0.05)
    # shuffling in, and the yawn
    for f in range(8, B["walkIn"][1], 14):
        place(mix, footstep(f), sec(f), 0.10)
    place(mix, yawn(), sec(B["yawn"][0]), 0.34)
    # right-click: a pop, and the record scratch that stops the lullaby
    for c in (B["click1"], B["click2"]):
        place(mix, pop(), sec(c), 0.45)
        place(mix, record_scratch(), sec(c + 2), 0.28)
    # the far-off zombie, seen through the window
    place(mix, groan(gain=0.5), sec(B["groan"]), 0.22)
    # to the door, and out
    place(mix, whoosh(0.3, seed=4), sec(B["toDoor"][0] + 8), 0.25)
    place(mix, click(700, 0.05), sec(B["toDoor"][0] + 8), 0.4)
    for f in range(B["toDoor"][0], B["toDoor"][1], 5):
        place(mix, footstep(f), sec(f), 0.15)
    # the long run, closing in
    a, b = B["outdoor"][0], B["runEnd"]
    for f in range(a + 2, b, 5):
        place(mix, footstep(f), sec(f), 0.05 + 0.20 * (f - a) / (b - a))
    place(mix, fade(whoosh(0.6, seed=6), 0.02, 0.2), sec(a), 0.25)
    # the fight
    for h in B["hits"]:
        place(mix, hit, sec(h), 0.9)
        place(mix, groan(0.5, 0.9), sec(h + 1), 0.28)
    n = N(0.4)
    place(mix, stereo(band(n, 2600, 1200, 71) * env(n, 0.02, 0.3)), sec(B["poof"]), 0.35)
    place(mix, shimmer(), sec(B["poof"] + 4), 0.25)
    # back inside
    place(mix, fade(whoosh(0.35, seed=8), 0.01, 0.15), sec(B["room2"]), 0.25)
    # the spider: a thread paying out, then a tiny hello
    place(mix, fade(whoosh(0.7, seed=12), 0.05, 0.3), sec(B["tilt"][0]), 0.10)
    place(mix, boom(0.4, seed=3), sec(B["tilt"][0] + 4), 0.10)
    place(mix, squeak(), sec(B["wave"] - 2), 0.30)
    place(mix, squeak(), sec(B["wave"] + 8), 0.22)

    write_mp3(FF, mix, OUT, lufs=-18 if NO_MUSIC else -14)
    print("wrote", os.path.relpath(OUT, ROOT), f"({total:.1f}s)")
