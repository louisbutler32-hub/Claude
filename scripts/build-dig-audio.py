#!/usr/bin/env python3
"""Soundtrack for "Minecrafters who dig straight down".

Sneaky Snitch as a calm bed throughout, hit taps on each pickaxe swing,
a rising hiss as the glow comes up, and the damage/splash boom when the
floor gives way. Reads public/audio/src/{sneaky-snitch,mc-hit,mc-damage}.mp3,
writes public/audio/dig-mix.mp3.
"""
import os, sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mc_audio_lib import SR, decode, place, fade, hiss, boom, write_mp3

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "audio", "src")
OUT = os.path.join(ROOT, "public", "audio", "dig-mix.mp3")
FF = os.environ.get("FFMPEG", "ffmpeg")
FPS, FRAMES = 30, 420
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
    place(mix, fade(snitch[:int(sec(FRAMES) * SR)], 0.1, 0.5), 0, MUSIC)

    # pickaxe swings land roughly every 12 frames (the swing period) while
    # mining; tap through the cave shot and the first part of the shaft.
    for f in range(10, 250, 12):
        place(mix, hit, sec(f), 0.55)

    # the rising glow (frame ~146-168 in shot-local terms -> abs 236-258)
    place(mix, fade(hiss(0.9, center=1400, seed=41), 0.05, 0.1), sec(230), 0.5)
    # the crack + splash into lava (abs ~284)
    place(mix, fade(boom(1.1, seed=43), 0.002, 0.3), sec(284), 0.9)
    place(mix, dmg, sec(288), 0.6)

    write_mp3(FF, mix, OUT)
    print("wrote", os.path.relpath(OUT, ROOT))
