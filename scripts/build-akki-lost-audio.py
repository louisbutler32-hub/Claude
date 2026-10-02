#!/usr/bin/env python3
"""Soundtrack for the AKKI TALKS "Zoro Gets Lost" short.

Effects: a handful of One Piece sounds from .sfx/op/ (gitignored, never
committed) for the whip-pans, the freeze, the volcano, the haki rumble and
the collapse; everything else (footsteps, wind, roar, gull, creaks, tears,
the sting, the bed) is synthesised here with numpy. The bed is a light
pizzicato walking-bass comedy tune that ducks under hits and drops out for
the deadpan beats.

Cue frames come from src/akki/lost/beats.json, the file the video reads.
Writes public/audio/akki-lost-mix.wav (WAV, so no encoder padding).
"""
import json
import os
import subprocess
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mc_audio_lib import SR, N, band, boing, decay, decode, env, place, stereo, tone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FF = os.environ.get("FFMPEG", "ffmpeg")
OP = os.path.join(ROOT, ".sfx", "op")
B = json.load(open(os.path.join(ROOT, "src", "akki", "lost", "beats.json")))
FPS = B["fps"]
S = B["shots"]
sec = lambda f: f / FPS
DUR = sec(B["frames"])
OUT = os.path.join(ROOT, "public", "audio", "akki-lost-mix.wav")


def op(name):
    path = os.path.join(OP, name + ".wav")
    if not os.path.exists(path):
        sys.exit(f"missing .sfx/op/{name}.wav (see .sfx/op/catalog.json)")
    return decode(FF, path)


# ------------------------------------------------------------ synthesis

def pl(hz, dur=0.3, h=3, rate=10):
    n = N(dur)
    return tone(hz, dur, harmonics=h) * decay(n, rate) * env(n, 0.002, 0.03)


def slide(f0, f1, dur, h=1, vib=0.0, rate=3.0):
    n = N(dur)
    return tone(np.linspace(f0, f1, n), dur, harmonics=h, vib=vib, vib_rate=6) * decay(n, rate) * env(n, 0.004, 0.05)


def step(kind, seed):
    if kind == "wood":
        n = N(0.12)
        return stereo((band(n, 600, 400, seed) * 0.8 + tone(95, 0.12) * 0.8) * decay(n, 38))
    if kind == "sand":
        n = N(0.14)
        return stereo(band(n, 2600, 1800, seed) * decay(n, 20) * 0.5 * env(n, 0.012, 0.04))
    if kind == "snow":
        n = N(0.16)
        c = band(n, 3800, 1800, seed) * decay(n, 24) * 0.5
        c[N(0.05):] += band(n, 3000, 1500, seed + 1)[N(0.05):] * decay(n, 30)[: n - N(0.05)].mean() * 0
        return stereo(c * env(n, 0.006, 0.05))
    if kind == "dirt":
        n = N(0.12)
        return stereo((band(n, 400, 300, seed) * 0.7 + tone(70, 0.12) * 0.7) * decay(n, 34))
    if kind == "rock":
        n = N(0.1)
        return stereo((band(n, 1200, 900, seed) * 0.6 + tone(110, 0.1) * 0.5) * decay(n, 50))
    n = N(0.1)
    return stereo(band(n, 700, 500, seed) * decay(n, 45))


def roar(dur=1.0):
    n = N(dur)
    t = np.arange(n) / SR
    f0 = (300 * np.exp(-t * 1.6) + 70) * (1 + 0.2 * np.sin(2 * np.pi * 26 * t))
    saw = tone(f0, dur, harmonics=9)
    am = 0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 38 * t))
    out = (saw * 0.5 + band(n, 1100, 900, 7) * 0.7) * am * env(n, 0.04, 0.3) * decay(n, 0.8)
    return stereo(out / (np.max(np.abs(out)) + 1e-9) * 0.9)


def gull(dur=0.55):
    out = np.zeros(N(dur))
    for k, st in enumerate((0.0, 0.2, 0.34)):
        n = N(0.16)
        f = np.linspace(1900, 1100, n) * (1 + 0.03 * np.sin(np.arange(n) / SR * 2 * np.pi * 40))
        c = tone(f, 0.16, harmonics=3) * env(n, 0.01, 0.06)
        i = N(st)
        out[i:i + n] += c[: max(0, min(n, len(out) - i))] * (0.8 - 0.15 * k)
    return stereo(out)


def creak(dur, seed=3):
    n = N(dur)
    t = np.arange(n) / SR
    f = 160 + 80 * np.sin(2 * np.pi * 2.5 * t) + 160 * t / dur
    c = tone(f, dur, harmonics=14)
    rng = np.random.default_rng(seed)
    chop = np.repeat(rng.uniform(0.3, 1.0, int(dur * 24) + 2), SR // 24 + 1)[:n]
    return stereo(c * chop * band(n, 900, 700, seed) * 0.3 * env(n, 0.05, 0.1) + c * chop * 0.15 * env(n, 0.05, 0.1))


def wind(dur, seed=1, center=500, gain=1.0):
    n = N(dur)
    t = np.arange(n) / SR
    m = 0.55 + 0.45 * np.sin(2 * np.pi * 0.6 * t + seed)
    return stereo(band(n, center, center * 0.6, seed) * m * env(n, 0.3, 0.3) * gain)


def sob(dur=0.34, hz=420):
    n = N(dur)
    f = np.concatenate([np.linspace(hz * 0.9, hz * 1.35, n // 2), np.linspace(hz * 1.35, hz * 1.05, n - n // 2)])
    c = tone(f, dur, harmonics=6, vib=0.03) * env(n, 0.03, 0.12)
    return stereo(c * 0.45 + band(n, 1500, 900, 4)[:n] * 0.08)


def spray(dur=0.5, seed=2):
    n = N(dur)
    t = np.arange(n) / SR
    return stereo(band(n, 3800, 2500, seed) * (0.6 + 0.4 * np.sin(2 * np.pi * 14 * t)) * env(n, 0.03, 0.15) * 0.5)


def cricket_bed(dur, seed=5):
    out = np.zeros(N(dur))
    rng = np.random.default_rng(seed)
    for st in np.arange(0, dur, 0.32):
        for k in range(3):
            n = N(0.035)
            i = int((st + k * 0.05) * SR)
            c = tone(4300 + rng.uniform(-80, 80), 0.035) * env(n, 0.003, 0.012) * 0.25
            if i + n < len(out):
                out[i:i + n] += c
    return stereo(out)


def owl(hz=360):
    n = N(0.3)
    return stereo(tone(np.linspace(hz, hz * 0.88, n), 0.3, vib=0.01) * env(n, 0.05, 0.12) * 0.5)


def flip_paper(seed):
    n = N(0.16)
    t = np.arange(n) / SR
    c = band(n, 3200, 1800, seed) * decay(n, 24) * env(n, 0.002, 0.04) * 0.6
    th = tone(150, 0.1) * decay(N(0.1), 40) * 0.5
    c[N(0.07):N(0.07) + len(th)] += th[: max(0, n - N(0.07))]
    return stereo(c)


def thud(freq=60, dur=0.3, k=18):
    n = N(dur)
    return stereo((tone(np.linspace(freq * 2, freq, n), dur) + band(n, 300, 250, 3) * 0.3) * decay(n, k))


def slam():
    return thud(80, 0.35, 14) * 1.0 + stereo(band(N(0.35), 900, 700, 6) * decay(N(0.35), 40) * 0.5)


def bubble(seed):
    n = N(0.12)
    r = np.random.default_rng(seed)
    f = r.uniform(130, 220)
    return stereo(tone(np.linspace(f, f * 2.5, n), 0.12) * decay(n, 22) * env(n, 0.004, 0.03) * 0.6)


def dun_sting(f):
    notes = [(146.8, 0.0, 0.2), (146.8, 3.0, 0.2), (110.0, 6.0, 1.0)]
    for hz, st, d in notes:
        n = N(d)
        c = tone(hz, d, harmonics=8, vib=0.01 if d > 0.5 else 0) * env(n, 0.01, 0.1) * decay(n, 1.5 if d > 0.5 else 5)
        place(mix, stereo(c * 0.7), sec(f + st), 1.0)
        place(mix, thud(55, 0.4, 10), sec(f + st), 0.9)


def ukulele(f, gain=0.8):
    for k, hz in enumerate((392.0, 261.63, 329.63, 440.0)):
        place(mix, stereo(pl(hz, 0.5, 4, 7) * 0.4), sec(f) + k * 0.014, gain)


# --------------------------------------------------------------- the bed

BPM = 132
BEAT = 60 / BPM
CHORDS = [(261.63, 329.63, 392.0), (220.0, 261.63, 329.63), (174.61, 220.0, 261.63), (196.0, 246.94, 293.66)]


def bed(dur):
    n = N(dur)
    out = np.zeros(n)
    for b in range(int(dur / BEAT) + 1):
        i = int(b * BEAT * SR)
        chord = CHORDS[(b // 4) % 4]
        bass = pl(chord[0] / 2 * (1, 1.25, 1.5, 1.335)[b % 4], 0.34, 3, 9) * 0.45
        out[i:i + len(bass)] += bass[:max(0, min(len(bass), n - i))]
        if b % 2 == 1:
            for k, hz in enumerate(chord):
                s = pl(hz * 2, 0.18, 3, 14) * 0.13
                j = i + int(k * 0.01 * SR)
                out[j:j + len(s)] += s[:max(0, min(len(s), n - j))]
        m = N(0.05)
        h = band(m, 6000, 2500, b) * decay(m, 70) * 0.1
        j = i + int(BEAT / 2 * SR)
        out[j:j + m] += h[:max(0, min(m, n - j))]
        if b % 2 == 1:
            m = N(0.1)
            sn = band(m, 2200, 1500, b) * decay(m, 30) * 0.16
            out[i:i + m] += sn[:max(0, min(m, n - i))]
    return out


if __name__ == "__main__":
    mix = np.zeros((N(DUR + 0.5), 2), dtype=np.float32)
    duck = np.ones(len(mix))
    bedg = np.zeros(len(mix))

    def bed_on(f0, f1, g=1.0):
        bedg[int(sec(f0) * SR):int(sec(f1) * SR)] = g

    def put(clip, f, gain=1.0):
        place(mix, clip, sec(f), gain)

    def hit(name, f, gain=1.0, dk=0.25, hold=0.5):
        put(op(name), f, gain)
        i = int(sec(f) * SR)
        duck[i:min(len(duck), i + int(hold * SR))] = np.minimum(duck[i:min(len(duck), i + int(hold * SR))], dk)

    # which stretches have the bed: bright on the hall, out for the deadpan,
    # full through the montage, gone for the aged hall, shy return after
    bed_on(0, S["boots"][0], 0.7)
    bed_on(S["desert"][0], S["aged"][0], 1.0)
    bed_on(S["enter"][0], S["sob"][0], 0.5)
    bed_on(S["sob"][0], S["toDoor"][0], 0.55)
    bed_on(S["toDoor"][0], S["closet"][0], 0.6)
    bed_on(S["nodBack"][0], S["fall"][0], 0.7)

    # 1. the hall: five footprints light up in turn, two confident nods
    for i, hz in enumerate((523.25, 587.33, 659.25, 698.46, 783.99)):
        put(stereo(pl(hz, 0.25, 2, 9) * 0.5), 6 + 3 * i, 0.9)
    for fr in B["nodAt"]:
        put(stereo(slide(190, 150, 0.28, 2, 0.01) * 0.5), fr, 0.9)
    # 2. the wrong way
    put(op("haki_rumble"), B["rumble"] - 1, 0.9)
    for k in range(7):
        put(step("wood", k) * 1.0, 49 + k * 1.5 * 2 * 0.5 * 2, 1.0)
    duck[int(sec(S["boots"][0]) * SR):int(sec(S["desert"][0]) * SR)] = 0.0
    dun_sting(B["sting"])
    # 3. whip-pans
    for fr in B["montage"]:
        hit("whoosh_01", fr - 6, 0.6, 0.5, 0.3)
    # desert
    put(wind(1.0, 2, 700, 0.35), S["desert"][0], 1.0)
    for k in range(8):
        put(step("sand", k) * 0.9, 74 + k * 3, 0.8)
    put(stereo(band(N(0.3), 2500, 1500, 5) * env(N(0.3), 0.1, 0.1) * 0.3), B["drink"], 1.0)
    for k, fr in enumerate((B["shake"], B["shake"] + 2, B["shake"] + 4)):
        put(stereo(tone(1100 - k * 100, 0.06) * decay(N(0.06), 70) * 0.5), fr, 0.9)
    put(boing(260, 120, 0.5, 0.6), B["shake"] + 6, 0.8)
    put(stereo(tone(1500, 0.1) * decay(N(0.1), 30) * 0.4), S["desert"][0] + 16, 0.8)
    # snow
    hit("kuzan_freeze_01", B["freeze"], 0.5, 0.5, 0.5)
    put(wind(1.0, 5, 900, 0.5), S["snow"][0], 1.0)
    for k in range(8):
        put(step("snow", k) * 1.0, 98 + k * 3, 0.9)
    put(stereo(tone(2400, 0.4) * decay(N(0.4), 8) * 0.25), 101, 0.9)
    # jungle: a dinosaur
    put(roar(1.0), B["roar"], 0.9)
    for k in range(5):
        put(thud(60, 0.25, 16), 122 + k * 2.4, 0.8)
        put(step("dirt", k), 122 + k * 6, 0.7)
    put(stereo(slide(1200, 200, 0.45, 1) * 0.4), B["trip"] - 2, 0.9)
    put(thud(45, 0.6, 9), B["trip"] + 3, 1.2)
    put(stereo(band(N(0.5), 700, 500, 3) * decay(N(0.5), 7) * 0.4), B["trip"] + 3, 0.8)
    put(boing(200, 600, 0.4, 0.5), B["trip"] + 8, 0.7)
    # ocean: gull, plank creak, waves
    put(wind(1.0, 8, 350, 0.5), S["ocean"][0], 1.0)
    put(gull(), B["gull"], 0.8)
    put(gull(), B["gull"] + 9, 0.7)
    put(stereo(np.zeros(1)), 0)
    put(stereo(pl(220, 0.08, 1, 40) * 0.5), B["land"], 0.9)
    put(creak(0.4, 5), S["ocean"][0] + 3, 0.5)
    for k in range(6):
        put(step("wood", k + 20) * 0.7, 146 + k * 3.5, 0.6)
    # volcano
    for k in range(7):
        put(bubble(k), 169 + k * 3, 0.5)
    put(op("whoosh_01"), B["step"] - 3, 0.3)
    duck[int(sec(B["boom"] - 2) * SR):int(sec(S["night"][0]) * SR)] = 0.0
    put(op("akainu_eruption"), B["boom"], 0.9)
    put(op("explosion_01"), B["boom"], 0.8)
    put(op("explosion_02"), B["flash"][1] - 1, 0.35)
    # night
    put(cricket_bed(0.9), S["night"][0], 0.7)
    put(boing(300, 500, 0.3, 0.5), S["night"][0] + 1, 0.8)
    for fr in B["flip"][:2]:
        put(flip_paper(fr), fr, 1.0)
    put(thud(120, 0.2, 25), B["flip"][2], 0.7)
    put(owl(), 199, 0.8)
    put(owl(330), 205, 0.8)
    for k in range(4):
        put(step("dirt", k + 9) * 0.5, 193 + k * 6, 0.6)
    # 4. the aged hall
    put(wind(1.0, 11, 380, 0.9), S["aged"][0], 1.0)
    put(creak(0.6, 8), B["tumble"], 0.4)
    for k in range(5):
        put(stereo(tone(70, 0.1) * decay(N(0.1), 30) * 0.4), B["tumble"] + 3 + k * 4, 0.7)
    for fr in B["chirps"]:
        put(stereo(slide(3000, 3600, 0.08, 1) * 0.4), fr, 0.7)
    put(thud(48, 0.5, 8), B["stepThud"], 1.4)
    put(creak(0.3, 4), B["stepThud"], 0.5)
    put(stereo(band(N(0.3), 1800, 1500, 9) * env(N(0.3), 0.15, 0.1) * 0.3), B["stepThud"] + 2, 1.0)  # gasp
    for k in range(6):
        put(stereo(band(N(0.04), 4000, 2000, k) * decay(N(0.04), 60) * 0.5), B["stepThud"] + k, 0.7)
    duck[int(sec(S["aged"][0]) * SR):int(sec(S["enter"][0]) * SR)] = 0.0
    # Zoro, in no hurry
    ukulele(S["enter"][0], 0.8)
    ukulele(S["enter"][0] + 6, 0.7)
    for k in range(5):
        put(step("wood", k + 30) * 1.1, 253 + k * 2.5, 0.9)
    # the guest sobs with joy
    for k in range(8):
        put(sob(0.34, 400 + 40 * (k % 3)), S["sob"][0] + k * 3, 0.9)
    put(spray(0.9), S["sob"][0], 0.8)
    put(spray(0.9, 4), S["sob"][0] + 10, 0.7)
    put(spray(0.9, 6), S["sob"][0] + 20, 0.7)
    for k, hz in enumerate((261.63, 329.63, 392.0)):
        n = N(0.9)
        put(stereo(tone(hz, 0.9, harmonics=2, vib=0.01) * env(n, 0.3, 0.3) * 0.18), S["sob"][0] + 4, 1.0)
    for fr in B["sobNods"]:
        put(stereo(slide(190, 150, 0.25, 2, 0.01) * 0.5), fr, 0.9)
    # the door
    for k in range(6):
        put(step("wood", k + 40), 289 + k * 2.5, 0.9)
    put(creak(0.45, 2), B["doorOpen"], 0.8)
    duck[int(sec(S["closet"][0]) * SR):int(sec(S["nodBack"][0]) * SR)] = 0.0
    put(stereo(tone(90, 0.3) * decay(N(0.3), 7) * 0.4), B["doorOpen"] + 5, 0.9)  # the closet's flat note
    put(creak(0.2, 6), B["doorShut"] - 3, 0.6)
    put(slam(), B["doorShut"], 0.9)
    for fr in B["nodBackAt"]:
        put(stereo(slide(190, 150, 0.25, 2, 0.01) * 0.5), fr, 0.9)
    for k in range(3):
        put(step("wood", k + 50) * 1.2, 330 + k * 2.2, 1.0)
    # 6. the collapse
    put(stereo(slide(900, 260, 0.35, 1, 0.02) * 0.4), B["fallStart"], 0.8)
    duck[int(sec(S["fall"][0]) * SR):] = 0.0
    hit("impact_heavy_01", B["collapse"], 0.9, 0.0, 0.0)
    put(stereo(band(N(0.5), 900, 700, 12) * decay(N(0.5), 7) * 0.35), B["collapse"], 1.0)
    put(wind(0.5, 13, 380, 0.5), S["door"][0], 1.0)
    put(stereo(slide(3200, 3700, 0.08, 1) * 0.4), S["door"][0] + 4, 0.7)
    put(stereo(slide(293.66, 277.18, 0.18, 6, 0.02) * 0.5), S["door"][0] + 6, 0.9)
    put(stereo(slide(246.94, 220.0, 0.4, 6, 0.04) * 0.5), S["door"][0] + 10, 0.9)

    b = bed(DUR + 0.5)[: len(mix)]
    k = N(0.06)
    sm = np.convolve(duck * bedg, np.ones(k) / k, mode="same")
    mix += stereo(b * sm * 0.75)[: len(mix)]

    mix = mix[: N(DUR)]
    peak = float(np.max(np.abs(mix)))
    if peak > 0.98:
        mix *= 0.98 / peak
    tmp = OUT + ".f32"
    mix.astype(np.float32).tofile(tmp)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    raw = ["-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", tmp]
    meas = subprocess.run([FF, "-hide_banner", *raw, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    li = float([l for l in meas.splitlines() if l.strip().startswith("I:")][-1].split()[1])
    gain = -14.0 - li
    subprocess.run([FF, "-v", "error", "-y", *raw, "-af", f"volume={gain:.2f}dB,alimiter=limit=0.85:attack=2:release=60:level=false",
                    "-ar", "48000", "-c:a", "pcm_s16le", OUT], check=True)
    print(f"measured {li:.1f} LUFS, applied {gain:+.1f} dB")
    os.remove(tmp)
    print("wrote", os.path.relpath(OUT, ROOT), f"({DUR:.2f}s)")
