#!/usr/bin/env python3
"""Soundtrack for the Nether Short.

Sneaky Snitch under the build/cross/arrival, a synthesised whoosh at the
step-through flash, Run Amok sped up under the ghast chase, Sneaky Snitch
picking back up for the walk home. Reads public/audio/src/{sneaky-snitch,
run-amok}.mp3, writes public/audio/nether-mix.mp3.
"""
import os, sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mc_audio_lib import SR, decode, place, fade, hiss, boom, whoosh, write_mp3

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "audio", "src")
OUT = os.path.join(ROOT, "public", "audio", "nether-mix.mp3")
FF = os.environ.get("FFMPEG", "ffmpeg")
FPS, FRAMES = 30, 720
sec = lambda f: f / FPS

if __name__ == "__main__":
    for name in ("sneaky-snitch.mp3", "run-amok.mp3"):
        if not os.path.exists(os.path.join(SRC, name)):
            sys.exit("missing " + name)
    mix = np.zeros((int(sec(FRAMES) * SR), 2), dtype=np.float32)
    snitch = decode(FF, os.path.join(SRC, "sneaky-snitch.mp3"))
    amok = decode(FF, os.path.join(SRC, "run-amok.mp3"), "asetrate=%d,aresample=%d,atempo=1.2" % (int(SR * 1.18), SR))

    MUSIC = 0.5
    # build + cross + arrive run one continuous stretch of the slow track
    calm = (sec(0), sec(420))
    place(mix, fade(snitch[:int((calm[1] - calm[0]) * SR)], 0.1, 0.3), calm[0], MUSIC)
    # the chase: the fast track
    chase = (sec(420), sec(570))
    place(mix, fade(amok[:int((chase[1] - chase[0]) * SR)], 0.15, 0.3), chase[0], MUSIC)
    # home: slow track continues from where "calm" left off
    home = (sec(570), sec(FRAMES))
    off = calm[1] - calm[0]
    place(mix, fade(snitch[int(off * SR):int(off * SR) + int((home[1] - home[0]) * SR)], 0.15, 0.4), home[0], MUSIC * 0.95)

    # the step-through flash: a whoosh
    place(mix, fade(whoosh(0.6, seed=11), 0.01, 0.05), sec(180 + 5), 0.8)
    # the ghast: a low charging hiss, then a boom on the fireball hit
    place(mix, fade(hiss(1.0, center=900, seed=21), 0.02, 0.05), sec(420), 0.55)
    place(mix, fade(boom(1.2, seed=23), 0.002, 0.3), sec(420 + 60), 0.9)

    write_mp3(FF, mix, OUT)
    print("wrote", os.path.relpath(OUT, ROOT))
