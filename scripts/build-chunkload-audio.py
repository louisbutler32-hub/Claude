#!/usr/bin/env python3
"""Soundtrack for "Java vs Bedrock: the chunk loads".

Sneaky Snitch under Java (it just works), a synthesised whoosh into the
void, then a sparser, slightly uneasy stretch of the track under Bedrock
with a soft pop on each tree and a thud when the cow lands. Reads
public/audio/src/{sneaky-snitch,mc-hit}.mp3, writes
public/audio/chunkload-mix.mp3.
"""
import os, sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mc_audio_lib import SR, decode, place, fade, hiss, whoosh, write_mp3

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "audio", "src")
OUT = os.path.join(ROOT, "public", "audio", "chunkload-mix.mp3")
FF = os.environ.get("FFMPEG", "ffmpeg")
FPS, FRAMES = 30, 420
sec = lambda f: f / FPS

if __name__ == "__main__":
    for name in ("sneaky-snitch.mp3", "mc-hit.mp3"):
        if not os.path.exists(os.path.join(SRC, name)):
            sys.exit("missing " + name)
    mix = np.zeros((int(sec(FRAMES) * SR), 2), dtype=np.float32)
    snitch = decode(FF, os.path.join(SRC, "sneaky-snitch.mp3"))
    pop = fade(decode(FF, os.path.join(SRC, "mc-hit.mp3"), "atrim=0.74:0.92,asetpts=PTS-STARTPTS"), 0.003, 0.03)

    MUSIC = 0.5
    place(mix, fade(snitch[:int(sec(150) * SR)], 0.1, 0.3), 0, MUSIC)
    place(mix, fade(whoosh(0.6, seed=71), 0.01, 0.08), sec(150), 0.6)
    off = 150 / FPS
    place(mix, fade(snitch[int(off * SR):int(off * SR) + int((sec(FRAMES) - sec(150)) * SR)], 0.2, 0.4), sec(150) + 0.3, MUSIC * 0.7)

    # a soft pop as each tree loads in
    for at in (170, 195, 220, 245, 280, 315):
        place(mix, fade(hiss(0.3, center=3400, seed=73 + at), 0.01, 0.2), sec(at), 0.35)
    for at in (170, 195, 220, 245, 280, 315):
        place(mix, pop, sec(at), 0.4)
    # the cow's thud on landing
    place(mix, fade(hiss(0.5, center=500, seed=81), 0.005, 0.3), sec(150 + 224), 0.6)

    write_mp3(FF, mix, OUT)
    print("wrote", os.path.relpath(OUT, ROOT))
