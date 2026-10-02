#!/usr/bin/env python3
"""Soundtrack for "The wooden pickaxe nobody picks".

Placed on frames read from src/minecraft-pick/beats.json, the same file the
video reads. The music is entirely original and synthesised here (90 bpm, a
beat every 20 frames, so every event in the picture is on a beat): a sad
A-minor piano and pad while the wooden pickaxe hopes and gets passed over,
a bright C-major drop with drums when the diamond pickaxe is lifted (frame
260), the sad piano again for the durability running out, a hit-and-stop on
the break (500), and a warm resolve under the ghost. Nothing licensed.

Effects are the owner's files where they exist: stone-breaking for the mining,
the Top-20 grab bag for the XP ding and the footsteps, and the Sword-Armor-
Tool-Break file for the pickaxe snapping; the snores, sobs, grumbles, cracks,
the lava sizzle and the ghost's harp are synthesised (scripts/mc_audio_lib.py).

  --music none   effects only, a few dB quieter

Writes public/audio/pick-mix.mp3 or pick-sfx.mp3.
"""
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mc_audio_lib import SR, N, band, boing, click, decay, decode, env, fade, footstep, place, record_scratch, shimmer, stereo, thump, tone, whoosh, write_mp3

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "audio", "src")
FF = os.environ.get("FFMPEG", "ffmpeg")
B = json.load(open(os.path.join(ROOT, "src", "minecraft-pick", "beats.json")))
FPS = B["fps"]
sec = lambda f: f / FPS
BEAT = 20  # frames
NO_MUSIC = "--music" in sys.argv and sys.argv[sys.argv.index("--music") + 1] == "none"
OUT = os.path.join(ROOT, "public", "audio", "pick-sfx.mp3" if NO_MUSIC else "pick-mix.mp3")
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


# ----------------------------------------------------------------- instruments
def piano(freq, dur=1.2, bright=1.0):
    n = N(dur)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for h, a in ((1, 1.0), (2, 0.5 * bright), (3, 0.28 * bright), (4, 0.14 * bright), (5.01, 0.08 * bright)):
        out += a * np.sin(2 * np.pi * freq * h * t) * np.exp(-(2.4 + 1.6 * h) * t)
    return stereo(out * env(n, 0.003, 0.15))


def pad(freqs, dur, gain=0.6):
    n = N(dur)
    t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2 * t) for f in freqs) / len(freqs)
    return stereo(x * gain * env(n, 0.35, 0.5))


def kick():
    return thump(58, 0.22) * 2.2


def snare():
    n = N(0.16)
    t = np.arange(n) / SR
    return stereo((band(n, 2400, 2000, 5) * np.exp(-t * 28) * 0.8 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.5))


def hat():
    n = N(0.05)
    return stereo(band(n, 7000, 3000, 9) * np.exp(-np.arange(n) / SR * 90) * 0.5)


def breath(dur=0.9):
    """a sleeper's breath: filtered noise swelling in and out"""
    n = N(dur)
    return stereo(band(n, 500, 300, 3) * np.sin(np.linspace(0, np.pi, n)) ** 2 * 0.5)


def sob(dur=0.5, f0=360, seed=1):
    n = N(dur)
    t = np.arange(n) / SR
    f = f0 * (1 + 0.12 * np.sin(2 * np.pi * 9 * t)) * (1 - 0.3 * t / dur)
    return stereo((tone(f, dur, harmonics=4) * 0.4 + band(n, 1100, 600, seed) * 0.15) * np.sin(np.linspace(0, np.pi, n)) ** 0.7 * (0.6 + 0.4 * np.sin(2 * np.pi * 14 * t)))


def grumble(dur=0.7):
    n = N(dur)
    t = np.arange(n) / SR
    f = 95 * (1 + 0.2 * np.sin(2 * np.pi * 6 * t))
    return stereo((tone(f, dur, harmonics=6) * 0.5 + band(n, 300, 200, 4) * 0.4) * env(n, 0.05, 0.2))


def gasp(dur=0.35):
    n = N(dur)
    t = np.linspace(0, 1, n)
    return stereo(band(n, 1800, 1400, 7) * t ** 1.5 * (1 - t) ** 0.3 * 0.9)


def wail(dur=0.9):
    """the diamond pickaxe's 'nooo' as it falls: a voice sliding down"""
    n = N(dur)
    t = np.arange(n) / SR
    f = np.linspace(520, 150, n) * (1 + 0.04 * np.sin(2 * np.pi * 7 * t))
    return stereo(tone(f, dur, harmonics=5) * 0.6 * env(n, 0.03, 0.2))


def sizzle(dur=1.2):
    n = N(dur)
    t = np.arange(n) / SR
    pops = (np.random.default_rng(5).random(n) > 0.9992).astype(float)
    return stereo((band(n, 4500, 2500, 12) * 0.5 + np.convolve(pops, decay(900, 80), "same") * 1.5) * env(n, 0.03, 0.5))


def crack():
    n = N(0.22)
    t = np.arange(n) / SR
    return stereo((band(n, 2800, 2000, 15) * np.exp(-t * 35) * 0.9 + np.sin(2 * np.pi * 140 * t) * np.exp(-t * 40) * 0.5))


def harp(notes, gap=0.07):
    out = np.zeros((N(2.6), 2), dtype=np.float32)
    for i, m in enumerate(notes):
        p = piano(hz(m), 1.4, 1.4)
        place(out, p, i * gap, 0.55)
    return out


def pop():
    n = N(0.12)
    t = np.arange(n) / SR
    return stereo(np.sin(2 * np.pi * (700 + 900 * np.exp(-t * 40)) * t) * np.exp(-t * 28))


if __name__ == "__main__":
    need = ["stone-breaking.mp4", "mc-sfx-top20.mp4", "tool-break.mp3"]
    for name in need:
        if not os.path.exists(os.path.join(SRC, name)):
            sys.exit("missing public/audio/src/" + name)
    total = sec(B["frames"])
    mix = np.zeros((int(total * SR), 2), dtype=np.float32)

    # ------------------------------------------------ music
    def chord_bar(start, notes, bass, style="sad", bars=1):
        for bar in range(bars):
            f0 = start + bar * 4 * BEAT
            place(mix, pad([hz(n) for n in notes], 4 * BEAT / FPS, 0.5 if style == "sad" else 0.6), sec(f0), 0.28)
            place(mix, piano(hz(bass), 1.6, 0.8), sec(f0), 0.5)
            # an arpeggio on the beats
            for i, n in enumerate([notes[0], notes[1], notes[2], notes[1]] * 1):
                place(mix, piano(hz(n + 12), 0.9, 1.0), sec(f0 + i * BEAT), 0.3 if style == "sad" else 0.36)
            if style == "bright":
                for i in range(4):
                    place(mix, kick(), sec(f0 + i * BEAT), 0.55)
                    if i in (1, 3):
                        place(mix, snare(), sec(f0 + i * BEAT), 0.4)
                for i in range(8):
                    place(mix, hat(), sec(f0 + i * BEAT / 2), 0.25)

    AM, F, C, G = ([57, 60, 64], 45), ([53, 57, 60], 41), ([55, 60, 64], 48), ([55, 59, 62], 43)
    if not NO_MUSIC:
        # 0-260: sad, starting a beat in: Am F C (G)
        for k, (ch, bass) in enumerate([AM, F, C]):
            chord_bar(20 + k * 80, ch, bass, "sad")
        # a lonely melody over the sad bars: hopeful, then dropping away
        mel = [(30, 76), (50, 72), (70, 69), (110, 72), (130, 69), (150, 65), (190, 67), (210, 72), (230, 71)]
        for f, m in mel:
            place(mix, piano(hz(m), 1.4, 1.1), sec(f), 0.42)
        # 260: the drop: C major, drums and a rising swell into it
        place(mix, fade(whoosh(0.7, seed=3), 0.6, 0.02), sec(240), 0.25)
        for k, (ch, bass) in enumerate([([55, 60, 64], 48), ([55, 59, 62], 43), ([57, 60, 64], 45), ([53, 57, 60], 41)]):
            if 260 + k * 80 < 400:
                chord_bar(260 + k * 80, ch, bass, "bright")
        for f, m in [(260, 79), (280, 76), (300, 79), (320, 84), (340, 83), (360, 79), (380, 76)]:
            place(mix, piano(hz(m), 1.2, 1.4), sec(f), 0.45)
        # 400-500: the sad piano again while the durability runs out, slowing
        for k in range(5):
            place(mix, piano(hz([57, 52, 53, 55, 57][k]), 1.6, 0.9), sec(400 + k * 20), 0.45)
        place(mix, pad([hz(n) for n in [57, 60, 64]], 4.0, 0.6), sec(400), 0.28)
        # 500: the hit: everything cuts, one low note
        place(mix, piano(hz(33), 2.5, 0.6), sec(B["break"]), 0.7)
        # 580-660: the resolve under the ghost: Am to C
        place(mix, pad([hz(n) for n in [57, 60, 64]], 2.4, 0.8), sec(580), 0.3)
        place(mix, pad([hz(n) for n in [60, 64, 67]], 2.4, 0.8), sec(620), 0.3)
        for f, m in [(600, 76), (620, 79), (640, 84)]:
            place(mix, piano(hz(m), 1.8, 1.3), sec(f), 0.4)

    # ------------------------------------------------ effects
    step_a = clip("mc-sfx-top20.mp4", 20.76, 21.0)
    step_b = clip("mc-sfx-top20.mp4", 22.32, 22.56)
    xp = clip("mc-sfx-top20.mp4", 2.22, 2.7)
    stone_break = clip("stone-breaking.mp4", 1.37, 1.95)
    stone_tap = clip("stone-breaking.mp4", 0.875, 1.06)
    tool_break = clip("tool-break.mp3", 0.15, 0.92)

    # asleep: two sleepers breathing out of step
    for k in range(3):
        place(mix, breath(), sec(6 + k * 44), 0.25)
        place(mix, breath(0.8), sec(24 + k * 44), 0.18)
    # waking: a little 'boing' and a happy chirp
    place(mix, boing(260, 560, 0.4, 0.8), sec(B["wake"] + 14), 0.4)
    place(mix, pop(), sec(B["wake"] + 20), 0.3)
    # the player walks in: a step every 10 frames
    for i, f in enumerate(range(B["enter"] + 4, B["enter"] + 44, 11)):
        at_peak(mix, step_a if i % 2 == 0 else step_b, f, 0.5)
    # he points: a tap
    place(mix, click(2600, 0.02) * 1.5, sec(B["point"]), 0.5)
    # the daydream appears with a soft chime, and pops at the pass with a scratch and a gasp
    place(mix, shimmer(), sec(B["wake"] + 32), 0.25)
    place(mix, pop(), sec(B["pass"]), 0.5)
    place(mix, record_scratch(), sec(B["pass"]), 0.55)
    place(mix, gasp(), sec(B["pass"] - 4), 0.45)
    # the diamond pickaxe is lifted: the XP ding, sparkles, a smug 'hm'
    at_peak(mix, xp, B["lift"], 0.9)
    place(mix, shimmer(), sec(B["lift"] + 2), 0.4)
    # the wooden one sobs while he mines
    for f, hzv in [(300, 380), (320, 360), (350, 340), (385, 360)]:
        place(mix, sob(0.5, hzv, f), sec(f), 0.22)
    # mining: three hits, each a stone break and an XP-ish ding for the diamond
    for h in B["mine"]:
        at_peak(mix, stone_tap, h - 3, 0.5)
        at_peak(mix, stone_break, h, 0.9)
        at_peak(mix, xp, h + 2, 0.45)
    # the cutaway: crying, then angry grumbling, cracks, steam
    for f in (404, 424, 440):
        place(mix, sob(0.6, 340, f), sec(f), 0.28)
    place(mix, grumble(0.9), sec(448), 0.35)
    for f in B["cracks"]:
        place(mix, crack(), sec(f), 0.7)
    place(mix, fade(sizzle(1.0), 0.1, 0.4), sec(456), 0.2)  # steam
    # the break: the owner's tool-break sound, and a thump
    at_peak(mix, tool_break, B["break"], 1.0)
    place(mix, thump(60, 0.4) * 1.6, sec(B["break"]), 0.5)
    # lava: the diamond pickaxe jumps, wails, splashes, sizzles
    place(mix, whoosh(0.5, seed=8), sec(B["fly"]), 0.3)
    place(mix, wail(0.9), sec(B["fly"]), 0.5)
    place(mix, gasp(), sec(B["fly"] - 3), 0.4)
    place(mix, thump(70, 0.35) * 2.0, sec(B["splash"]), 0.6)
    place(mix, sizzle(1.3), sec(B["splash"]), 0.6)
    place(mix, boing(120, 60, 0.3, 0.6), sec(B["splash"] + 2), 0.3)
    # the end: a sad sigh from the player and the ghost's harp rising
    place(mix, breath(1.2), sec(B["table"] + 6), 0.35)
    place(mix, harp([69, 72, 76, 81, 84]), sec(B["ghost"]), 0.55)
    place(mix, shimmer(), sec(B["ghost"] + 14), 0.3)

    write_mp3(FF, mix, OUT, lufs=-18 if NO_MUSIC else -14)
    print("wrote", os.path.relpath(OUT, ROOT), f"({total:.2f}s)")
