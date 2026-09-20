#!/usr/bin/env python3
"""Soundtrack for the long-form compilation's connective cards (intro,
chapter cards, behind-the-build, vote, outro). The five Shorts being
compiled keep their own already-built mixes untouched; this only scores
the new material wrapped around them.

Reads public/audio/src/{sneaky-snitch,run-amok,mc-hit}.mp3, writes five
files into public/audio/: longintro-mix.mp3, longchapter-sting.mp3 (reused
for all five chapter cards), longcast-mix.mp3, longvote-mix.mp3,
longoutro-mix.mp3.
"""
import os, sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mc_audio_lib import SR, decode, place, fade, hiss, whoosh, write_mp3

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "audio", "src")
OUT = os.path.join(ROOT, "public", "audio")
FF = os.environ.get("FFMPEG", "ffmpeg")
FPS = 30
sec = lambda f: f / FPS


def slice_track(track, start_s, len_s):
    a = int(start_s * SR)
    n = int(len_s * SR)
    return track[a:a + n] if a + n <= len(track) else np.tile(track, 2)[a:a + n]


if __name__ == "__main__":
    for name in ("sneaky-snitch.mp3", "run-amok.mp3", "mc-hit.mp3"):
        if not os.path.exists(os.path.join(SRC, name)):
            sys.exit("missing " + name)
    snitch = decode(FF, os.path.join(SRC, "sneaky-snitch.mp3"))
    amok = decode(FF, os.path.join(SRC, "run-amok.mp3"))
    hit = fade(decode(FF, os.path.join(SRC, "mc-hit.mp3"), "atrim=0.74:0.95,asetpts=PTS-STARTPTS"), 0.003, 0.03)

    # --- intro, 14s: a whoosh, then the track rising in as the list appears ---
    mix = np.zeros((int(14 * SR), 2), dtype=np.float32)
    place(mix, fade(whoosh(0.7, seed=51), 0.01, 0.1), 0.2, 0.7)
    place(mix, fade(slice_track(snitch, 0, 13.6), 1.0, 0.6), 0.4, 0.55)
    write_mp3(FF, mix, os.path.join(OUT, "longintro-mix.mp3"))

    # --- chapter sting, ~1.6s: reused at the start of each of the 5 cards ---
    mix = np.zeros((int(1.6 * SR), 2), dtype=np.float32)
    place(mix, hit, 0.0, 0.8)
    place(mix, fade(hiss(0.5, center=2200, seed=53), 0.01, 0.3), 0.05, 0.35)
    write_mp3(FF, mix, os.path.join(OUT, "longchapter-sting.mp3"))

    # --- behind the build, 20s: a calmer stretch of the track, three soft blips ---
    mix = np.zeros((int(20 * SR), 2), dtype=np.float32)
    place(mix, fade(slice_track(snitch, 20, 19.6), 0.4, 0.6), 0.2, 0.45)
    for t in (0.2, sec(200) + 0.1, sec(400) + 0.1):
        place(mix, fade(hiss(0.3, center=2800, seed=57), 0.01, 0.2), t, 0.3)
    write_mp3(FF, mix, os.path.join(OUT, "longcast-mix.mp3"))

    # --- vote, 20s: run-amok for energy, three blips at the slide changes ---
    mix = np.zeros((int(20 * SR), 2), dtype=np.float32)
    place(mix, fade(slice_track(amok, 5, 19.6), 0.3, 0.6), 0.2, 0.5)
    for t in (0.2, sec(200) + 0.1, sec(400) + 0.1):
        place(mix, fade(hiss(0.3, center=1800, seed=61), 0.01, 0.2), t, 0.35)
    write_mp3(FF, mix, os.path.join(OUT, "longvote-mix.mp3"))

    # --- outro, 16s: the track's tail, fading all the way out, plus a chime ---
    mix = np.zeros((int(16 * SR), 2), dtype=np.float32)
    place(mix, fade(slice_track(snitch, 40, 12.5), 0.3, 3.5), 0.3, 0.5)
    place(mix, fade(hiss(0.6, center=3600, seed=63), 0.01, 0.3), 4.2, 0.3)
    write_mp3(FF, mix, os.path.join(OUT, "longoutro-mix.mp3"))

    print("wrote longintro-mix.mp3, longchapter-sting.mp3, longcast-mix.mp3, longvote-mix.mp3, longoutro-mix.mp3")
