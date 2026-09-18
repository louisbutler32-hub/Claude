#!/usr/bin/env python3
"""Soundtrack for the house-build saga Short.

Sneaky Snitch under the three build days, ducking under the night scene
for a rising hiss and a boom at the explosion, then picking back up for
the morning. A couple of mc-hit taps mark the pickaxe/placing beats.
Reads public/audio/src/{sneaky-snitch,mc-hit,mc-damage}.mp3, writes
public/audio/build-saga-mix.mp3.
"""
import os, sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mc_audio_lib import SR, decode, place, fade, hiss, boom, write_mp3

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "audio", "src")
OUT = os.path.join(ROOT, "public", "audio", "build-saga-mix.mp3")
FF = os.environ.get("FFMPEG", "ffmpeg")
FPS, FRAMES = 30, 900
sec = lambda f: f / FPS

if __name__ == "__main__":
    for name in ("sneaky-snitch.mp3", "mc-hit.mp3", "mc-damage.mp3"):
        if not os.path.exists(os.path.join(SRC, name)):
            sys.exit("missing " + name)
    mix = np.zeros((int(sec(FRAMES) * SR), 2), dtype=np.float32)
    snitch = decode(FF, os.path.join(SRC, "sneaky-snitch.mp3"))
    hit = fade(decode(FF, os.path.join(SRC, "mc-hit.mp3"), "atrim=0.74:0.95,asetpts=PTS-STARTPTS"), 0.003, 0.03)
    dmg = fade(decode(FF, os.path.join(SRC, "mc-damage.mp3"), "atrim=0.20:0.62,asetpts=PTS-STARTPTS"), 0.003, 0.05)

    MUSIC = 0.5
    # days 1-3: one continuous stretch of the track
    days = (sec(0), sec(480))
    place(mix, fade(snitch[:int((days[1] - days[0]) * SR)], 0.1, 0.3), days[0], MUSIC)
    # night: the same track continues, quieter, ducking further at the boom
    off = days[1] - days[0]
    night_len = sec(900) - sec(480)
    night_clip = fade(snitch[int(off * SR):int(off * SR) + int(night_len * SR)], 0.2, 0.4)
    boom_at = sec(480 + 195)
    boom_i = int((boom_at - sec(480)) * SR)
    duck = np.ones(len(night_clip), dtype=np.float32)
    d = min(int(1.0 * SR), len(duck) - boom_i)
    if d > 0:
        duck[boom_i:boom_i + d] *= np.linspace(0.15, 1, d)
    place(mix, night_clip * duck[:, None], sec(480), MUSIC * 0.75)

    # pickaxe taps on day 1 (swings land roughly every 16 frames, a few of them)
    for f in (16, 48, 80, 112):
        place(mix, hit, sec(f), 0.6)
    # block-placing taps on day 2
    for f in (200, 230, 260, 290, 320):
        place(mix, hit, sec(f), 0.5)
    # the creeper: rising hiss then the boom, ducked into the night track above
    place(mix, fade(hiss(1.1, center=3200, seed=31), 0.02, 0.05), sec(480 + 150), 0.65)
    place(mix, fade(boom(1.3, seed=33), 0.002, 0.3), sec(480 + 195), 1.0)
    place(mix, dmg, sec(480 + 200), 0.5)

    write_mp3(FF, mix, OUT)
    print("wrote", os.path.relpath(OUT, ROOT))
