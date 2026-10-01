#!/usr/bin/env python3
"""Soundtrack for the AKKI TALKS "One Piece Bowling" short.

Everything is synthesised here in numpy (scripts/mc_audio_lib.py) — no
samples, no licensed music:

  bed   a 116 bpm funk loop in E minor: kick/snare/hats, a plucky
        syncopated saw bass, Em9 / A9 offbeat chord stabs and a short lead
        hook. It drops out on the black-and-white realisation (record
        scratch into dead air) and comes back for Sanji's laugh.
  sfx   placed on the cue frames in src/akki/bowling/beats.json, the same
        file the video reads: whooshes, the rubber-arm boing, ball rumbles,
        pin clatter, the kick thwack, the big boom on the impact flash,
        ball bounces, gutter clunks, synthetic "ha ha" chirps for Sanji, a
        growl for Zoro, and punches for the brawl.

Writes public/audio/akki-bowling-mix.mp3 at -14 LUFS.
"""
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mc_audio_lib import (SR, N, band, boing, boom, click, decay, env, place, record_scratch, shimmer, stereo, thump,
                          tone, whoosh, write_mp3)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FF = os.environ.get("FFMPEG", "ffmpeg")
B = json.load(open(os.path.join(ROOT, "src", "akki", "bowling", "beats.json")))
FPS = B["fps"]
S, C = B["shots"], B["cues"]
DUR = B["frames"] / FPS + 0.4
sec = lambda f: f / FPS
OUT = os.path.join(ROOT, "public", "audio", "akki-bowling-mix.mp3")

BPM = 116
BEAT = 60 / BPM
STEP = BEAT / 4

# ------------------------------------------------------------------ voices

def kick():
    n = N(0.32)
    t = np.arange(n) / SR
    f = 50 + 110 * np.exp(-t * 32)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    return stereo(body + band(n, 3000, 1500, 2) * np.exp(-t * 200) * 0.25)


def snare(seed=3):
    n = N(0.22)
    t = np.arange(n) / SR
    return stereo(band(n, 2200, 1600, seed) * np.exp(-t * 18) * 0.8 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.5)


def hat(open_=False, seed=5):
    n = N(0.18 if open_ else 0.05)
    t = np.arange(n) / SR
    return stereo(band(n, 8500, 2500, seed) * np.exp(-t * (14 if open_ else 70)))


def pluck_bass(hz, dur):
    n = N(dur)
    t = np.arange(n) / SR
    saw = tone(hz, dur, harmonics=6)
    sub = np.sin(2 * np.pi * hz * t)
    return stereo((saw * 0.5 * np.exp(-t * 9) + sub * 0.8) * env(n, 0.004, 0.03) * np.exp(-t * 2.5))


def stab(freqs, dur=0.16):
    n = N(dur)
    out = sum(tone(f, dur, harmonics=4) for f in freqs) / len(freqs)
    return stereo(out * env(n, 0.003, 0.08) * decay(n, 6))


def lead(hz, dur):
    n = N(dur)
    t = np.arange(n) / SR
    sq = tone(hz, dur, harmonics=4, vib=0.004, vib_rate=5.5)
    return stereo(sq * 0.6 * env(n, 0.01, 0.06) * np.exp(-t * 2))


E2, G2, A2, B2, D3, E3 = 82.41, 98.0, 110.0, 123.47, 146.83, 164.81
EM9 = [164.81, 196.0, 246.94, 293.66, 369.99]
A9 = [220.0, 277.18, 329.63, 392.0, 493.88]

# bass: 16 steps per bar, two-bar phrase (step, hz, steps long)
BASS = [(0, E2, 2), (3, E2, 1), (4, E3, 1), (6, D3, 1), (7, E2, 2), (10, G2, 1), (11, A2, 2), (14, B2, 1),
        (16, A2, 2), (19, A2, 1), (20, E3, 1), (22, G2, 1), (23, A2, 2), (26, B2, 1), (27, D3, 2), (30, B2, 1)]
LEAD = [(0, 659.25, 2), (2, 783.99, 2), (4, 880.0, 3), (8, 783.99, 1), (9, 659.25, 3), (16, 587.33, 2), (18, 659.25, 2), (20, 783.99, 4)]


def bed():
    mix = np.zeros((N(DUR), 2), dtype=np.float32)
    steps = int(DUR / STEP) + 1
    k, sn, hc, ho = kick(), snare(), hat(), hat(True)
    for i in range(steps):
        t = i * STEP
        bar16 = i % 16
        if bar16 in (0, 7, 10):
            place(mix, k, t, 0.95)
        if bar16 in (4, 12):
            place(mix, sn, t, 0.6)
        if bar16 in (15,) and (i // 16) % 2:
            place(mix, snare(9), t, 0.25)
        if i % 2 == 0:
            place(mix, hc, t, 0.22 if i % 4 else 0.14)
        if bar16 == 14:
            place(mix, ho, t, 0.18)
        ph = i % 32
        for s0, hz, ln in BASS:
            if ph == s0:
                place(mix, pluck_bass(hz, ln * STEP * 0.95), t, 0.55)
        if bar16 in (2, 6, 11):
            place(mix, stab(EM9 if ph < 16 else A9), t, 0.2)
        # the hook only every other phrase so it doesn't nag
        if (i // 32) % 2 == 1:
            for s0, hz, ln in LEAD:
                if ph == s0:
                    place(mix, lead(hz, ln * STEP * 0.9), t, 0.12)
    return mix


# ------------------------------------------------------------------ sfx

def rumble(dur, seed=4, center=140):
    n = N(dur)
    t = np.arange(n) / SR
    return stereo(band(n, center, 90, seed) * env(n, 0.06, 0.15) * (0.8 + 0.2 * np.sin(2 * np.pi * 9 * t)))


def rise(dur, f0=300, f1=2400, seed=9):
    n = N(dur)
    t = np.linspace(0, 1, n)
    from numpy.fft import irfft, rfft, rfftfreq
    out = np.zeros(n)
    chunks = 12
    for c in range(chunks):
        a, b = c * n // chunks, (c + 1) * n // chunks
        seg = band(b - a, f0 + (f1 - f0) * (c / chunks), 600, seed + c)
        out[a:b] = seg
    return stereo(out * t ** 1.5 * env(n, 0.0, 0.05))


def clatter(seed=11, dur=0.9, hits=26):
    rng = np.random.default_rng(seed)
    n = N(dur)
    out = np.zeros(n)
    for _ in range(hits):
        at = int(rng.uniform(0, dur * 0.7) ** 1.4 / (dur * 0.7) ** 0.4 * SR)
        m = N(0.07)
        f = rng.uniform(900, 2600)
        tt = np.arange(m) / SR
        blip = (np.sin(2 * np.pi * f * tt) * 0.5 + np.sin(2 * np.pi * f * 2.76 * tt) * 0.3 + band(m, f, 400, int(f)) * 0.5) * np.exp(-tt * 55)
        k = min(m, n - at)
        if k > 0:
            out[at:at + k] += blip[:k] * rng.uniform(0.3, 1.0)
    out += band(n, 1500, 1200, seed) * np.exp(-np.arange(n) / SR * 6) * 0.4
    return stereo(out / (np.max(np.abs(out)) + 1e-9))


def thwack(seed=13):
    n = N(0.25)
    t = np.arange(n) / SR
    s = band(n, 1600, 1400, seed) * np.exp(-t * 40) + np.sin(2 * np.pi * np.cumsum(120 * np.exp(-t * 10) + 60) / SR) * np.exp(-t * 14)
    return stereo(s / np.max(np.abs(s)))


def ha(f0=330, seed=1):
    """one synthetic 'ha': a buzzy voiced burst through two vowel-ish formants plus breath"""
    dur = 0.13
    n = N(dur)
    t = np.arange(n) / SR
    f = f0 * (1.06 - 0.12 * t / dur)
    src = tone(f, dur, harmonics=14)
    from numpy.fft import irfft, rfft, rfftfreq
    spec = rfft(src)
    fr = rfftfreq(n, 1 / SR)
    spec *= np.exp(-((fr - 800) / 260) ** 2) + 0.7 * np.exp(-((fr - 1250) / 320) ** 2) + 0.15
    v = irfft(spec, n)
    v /= np.max(np.abs(v)) + 1e-9
    breath = band(n, 1800, 1200, seed) * 0.35
    return stereo((v + breath * np.exp(-t * 30)) * env(n, 0.008, 0.05))


def laugh(f0=330, seed=1):
    out = np.zeros((N(0.6), 2), dtype=np.float32)
    for i in range(3):
        place(out, ha(f0 * (1 - 0.04 * i), seed + i), i * 0.17, 1.0 - 0.15 * i)
    return out


def growl():
    dur = 0.9
    n = N(dur)
    t = np.arange(n) / SR
    f = 88 + 10 * np.sin(2 * np.pi * 3 * t)
    s = tone(f, dur, harmonics=10) * (0.7 + 0.3 * np.sin(2 * np.pi * 23 * t))
    s += band(n, 500, 300, 7) * 0.4
    return stereo(s / np.max(np.abs(s)) * env(n, 0.05, 0.3))


def squawk(f0=520):
    dur = 0.2
    n = N(dur)
    t = np.arange(n) / SR
    f = f0 * (1 + 0.5 * np.sin(np.pi * t / dur))
    s = tone(f, dur, harmonics=8)
    return stereo(s / np.max(np.abs(s)) * env(n, 0.01, 0.06))


def ding(f=1760):
    n = N(0.8)
    t = np.arange(n) / SR
    return stereo((np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.4 * t)) * np.exp(-t * 5))


def pop():
    n = N(0.12)
    t = np.arange(n) / SR
    return stereo(np.sin(2 * np.pi * np.cumsum(300 + 900 * t / 0.12) / SR) * np.exp(-t * 30))


def wah_low():
    n = N(0.6)
    t = np.arange(n) / SR
    return stereo(tone(110 * (1 - 0.15 * t), 0.6, harmonics=6) * env(n, 0.03, 0.25) * (0.6 + 0.4 * np.sin(2 * np.pi * 2 * t)))


def sfx():
    mix = np.zeros((N(DUR), 2), dtype=np.float32)
    # 1-2 Luffy
    place(mix, whoosh(0.35, 3), sec(C["luffyWind"]), 0.35)
    place(mix, rise(0.25, 200, 1500), sec(C["ballFill"] - 3), 0.5)
    place(mix, thump(60, 0.3), sec(21), 0.9)
    place(mix, boing(120, 520, 0.8), sec(C["luffyThrow"]), 0.7)
    place(mix, boing(90, 300, 0.6), sec(C["armStretch"] + 4), 0.35)
    # 3 pin deck
    place(mix, rumble(0.4), sec(C["armArrive"] - 6), 0.5)
    place(mix, whoosh(0.2, 5), sec(C["speedFlash"]), 0.6)
    place(mix, click(1400, 0.05), sec(C["ballPlace"]), 0.6)
    place(mix, clatter(11, 0.9, 22), sec(C["pinsFall"]), 0.55)
    # 4 regular deadpan
    place(mix, wah_low(), sec(C["regPushIn"] + 2), 0.25)
    # 5-6 Sanji
    place(mix, whoosh(0.3, 7), sec(C["sanjiToss"]), 0.3)
    place(mix, whoosh(0.25, 8), sec(C["sanjiKick"] - 3), 0.6)
    place(mix, thwack(), sec(C["sanjiKick"] + 1), 0.95)
    place(mix, squawk(600), sec(C["sanjiKick"] + 1), 0.25)
    # 7 POV rocket
    place(mix, rumble(0.9, 6, 120), sec(C["yellowLaunch"]), 0.6)
    place(mix, rise(0.9, 500, 3000, 21), sec(C["yellowLaunch"]), 0.25)
    # 8 chibi pop
    place(mix, pop(), sec(C["regChibi"] + 4), 0.45)
    # 9 the big one
    place(mix, boom(1.6, 5), sec(C["impactFlash"]), 1.0)
    place(mix, clatter(17, 1.1, 36), sec(C["pinsScatter"]), 0.75)
    # 10 gaunt
    place(mix, wah_low(), sec(C["regGaunt"] + 2), 0.2)
    # 11-12 Zoro
    place(mix, ding(2100), sec(C["zoroPose"]), 0.18)
    place(mix, whoosh(0.4, 12), sec(C["zoroThrow"] - 2), 0.6)
    for i, f in enumerate(C["ballBounce"]):
        place(mix, thump(70 - i * 6, 0.25), sec(f), 0.8)
        place(mix, click(500 + i * 80, 0.03), sec(f), 0.3)
    place(mix, rumble(1.4, 9), sec(C["ballBounce"][-1] + 2), 0.35)
    # 13 deck: two gutter clunks, the pink rolls in... and nothing
    place(mix, rumble(1.6, 10, 110), sec(C["zoroDeck"]), 0.45)
    place(mix, thump(90, 0.2), sec(C["gutterL"]), 0.6)
    place(mix, band(N(0.4), 600, 300, 3)[:, None].repeat(2, 1) * np.exp(-np.arange(N(0.4)) / SR * 8)[:, None], sec(C["gutterL"]), 0.2)
    place(mix, thump(85, 0.2), sec(C["gutterR"]), 0.6)
    place(mix, click(900, 0.04), sec(C["pinkArrive"]), 0.35)
    # 14-15 smug, then the realisation
    place(mix, shimmer(), sec(C["zoroSmug"]), 0.35)
    place(mix, record_scratch(), sec(C["realise"]), 0.8)
    # 16 Sanji laughs
    for i, f in enumerate(C["laughs"]):
        place(mix, laugh(340 + (i % 2) * 30, 3 + i * 5), sec(f), 0.55)
    # 17 Zoro fumes
    place(mix, growl(), sec(C["zoroRage"] + 2), 0.55)
    place(mix, squawk(380), sec(C["zoroRage"] + 16), 0.3)
    # 18 brawl
    place(mix, whoosh(0.3, 30), sec(C["brawl"]), 0.5)
    for i, f in enumerate(C["hits"]):
        place(mix, thwack(40 + i), sec(f), 0.7)
        place(mix, whoosh(0.15, 50 + i), sec(f - 2), 0.3)
    return mix


def main():
    music = bed()
    # music ducks and dies on the realisation, comes back for the laugh
    n = len(music)
    g = np.ones(n, dtype=np.float32)
    a, b = int(sec(C["realise"]) * SR), int(sec(C["sanjiLaugh"]) * SR)
    g[a:b] = 0.0
    g[a - N(0.05):a] *= np.linspace(1, 0, N(0.05))
    g[b:b + N(0.1)] = np.linspace(0, 1, N(0.1))
    # a touch lower under the impact boom
    i0 = int(sec(C["impactFlash"]) * SR)
    g[i0:i0 + N(0.8)] *= np.linspace(0.35, 1, N(0.8))
    music *= g[:, None]
    mix = music * 0.45 + sfx()
    mix[-N(0.4):] *= np.linspace(1, 0, N(0.4))[:, None]
    mix = mix[: int(B["frames"] / FPS * SR)]
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    write_mp3(FF, mix, OUT, lufs=-14)
    print("wrote", OUT)


if __name__ == "__main__":
    main()
