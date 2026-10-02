#!/usr/bin/env python3
"""Soundtrack for the AKKI TALKS "Luffy at the All-You-Can-Eat Buffet" short.

Effects: whoosh / explosion / punch / haki rumble from the One Piece library
in .sfx/op/ (gitignored third-party audio, never committed; catalog.json lists
sources). Everything else is synthesised with numpy: rubber boing, chomps,
vacuum slurps, plate clinks, belly drum, the long raspberry, door chime, a
jaunty restaurant bed and the sad trombone (mc_audio_lib).

Cue frames come from src/akki/buffet/beats.json, the file the video reads.
Writes public/audio/akki-buffet-mix.wav (WAV, so no encoder padding shifts it).
"""
import json
import os
import subprocess
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mc_audio_lib import SR, N, band, boing, decay, decode, env, place, sad_trombone, stereo, thump, tone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FF = os.environ.get("FFMPEG", "ffmpeg")
OP = os.path.join(ROOT, ".sfx", "op")
B = json.load(open(os.path.join(ROOT, "src", "akki", "buffet", "beats.json")))
FPS = B["fps"]
S = B["shots"]
sec = lambda f: f / FPS
DUR = sec(B["frames"])
ARGS = sys.argv[1:]
MUSIC = ARGS[ARGS.index("--music") + 1] if "--music" in ARGS else None  # "yakety": the owner's Yakety Sax in public/audio/src/
CUT = float(ARGS[ARGS.index("--cut") + 1]) if "--cut" in ARGS else None  # seconds: end the track here
# Under a real song most of the effects are clutter: keep only the gags that sell a joke.
SPARSE = MUSIC is not None or "--sparse" in ARGS
KEEP = [(53, 54), (77, 84), (150, 151), (206, 207), (252, 258), (317, 326), (328, 331)]  # coin, arm stretch, inflate, sad slide-whistle, burp blast, raspberry, ending hit
allowed = lambda f: (not SPARSE) or any(a <= f <= b for a, b in KEEP)
OUT = os.path.join(ROOT, "public", "audio", "akki-buffet-mix.wav" if not (MUSIC or CUT or "--sparse" in ARGS) else f"akki-buffet-{MUSIC or 'bed'}{'-%gs' % CUT if CUT else ''}.wav")
# Yakety Sax: 123 bpm, riff onsets measured at 2.07s + n*0.4878s. X seconds in puts a beat on the
# burp-blast frame (B["boom"]) so the drop and the music's accents land together.
YAK_BEAT = 60 / 123.05
YAK_X = next(2.07 + k * YAK_BEAT - sec(B["boom"]) for k in range(200) if 2.07 + k * YAK_BEAT - sec(B["boom"]) >= 1.9)


def op(name):
    path = os.path.join(OP, name + ".wav")
    if not os.path.exists(path):
        sys.exit(f"missing .sfx/op/{name}.wav - cut the One Piece effects first (see .sfx/op/catalog.json)")
    return decode(FF, path)


def add(mix, clip, f, gain=1.0):
    if allowed(f):
        place(mix, clip, sec(f), gain)


# ------------------------------------------------------------ synthesised effects

def clink(hz, dur=0.35, g=1.0):
    n = N(dur)
    s = sum(tone(hz * k, dur) * a for k, a in ((1, 1.0), (2.76, 0.6), (5.4, 0.35))) * decay(n, 16) * env(n, 0.001, 0.05)
    return stereo(s * 0.22 * g)


def coin(hz=2637):
    n = N(0.4)
    return stereo((tone(hz, 0.4) + 0.6 * tone(hz * 1.335, 0.4)) * decay(n, 14) * env(n, 0.001, 0.05) * 0.22)


def chomp(seed=1):
    n = N(0.16)
    s = band(n, 1400, 900, seed) * decay(n, 40) * 0.7 + tone(np.linspace(180, 70, n), 0.16) * decay(n, 30) * 0.8
    return stereo(s * env(n, 0.001, 0.02))


def slurp(dur=0.28, seed=2):
    n = N(dur)
    t = np.linspace(0, 1, n)
    out = np.zeros(n)
    for c in (700, 1500, 2600):
        out += band(n, c * (0.6 + 1.4 * t.mean()), 500, seed + c) * 0.3
    out *= np.sin(np.pi * t) ** 0.8
    glide = tone(300 + 1200 * t ** 2, dur) * 0.25 * np.sin(np.pi * t)
    return stereo(out + glide)


def gulp():
    n = N(0.3)
    s = tone(np.linspace(260, 90, n), 0.3, harmonics=2) * decay(n, 8) * env(n, 0.01, 0.1)
    return stereo(s * 0.8)


def belly_bom(hz=95):
    n = N(0.4)
    s = tone(np.linspace(hz * 1.5, hz, n), 0.4) * decay(n, 9) + 0.4 * tone(np.linspace(hz * 3.1, hz * 2, n), 0.4) * decay(n, 16)
    return stereo(s * env(n, 0.002, 0.05) * 0.9)


def raspberry(dur=1.0):
    n = N(dur)
    t = np.arange(n) / SR
    u = t / dur
    fm = 70 - 38 * u ** 1.2                       # flutter rate falls as the air runs out
    ph = np.cumsum(fm * (1 + 0.08 * np.sin(2 * np.pi * 9 * t))) / SR
    gate = (np.sin(2 * np.pi * ph) > -0.25).astype(float)
    gate = np.convolve(gate, np.ones(30) / 30, mode="same")
    nz = band(n, 1100 - 500 * u.mean(), 900, 9)
    saw = tone(np.maximum(90, 230 - 140 * u), dur, harmonics=6)
    sig = (nz * 0.55 + saw * 0.45) * gate
    e = np.minimum(1, t / 0.03) * (1 - u ** 4) * (0.7 + 0.3 * (1 - u))
    return stereo(sig * e * 0.9)


def burp(dur=0.95):
    n = N(dur)
    t = np.arange(n) / SR
    f = 130 - 55 * (t / dur)
    am = 0.55 + 0.45 * np.sin(2 * np.pi * (34 - 10 * t / dur) * t)
    s = tone(f, dur, harmonics=9) * am * 0.8 + band(n, 350, 260, 4) * 0.25 * am
    return stereo(s * env(n, 0.02, 0.25) * 0.9)


def gurgle(dur=0.3):
    n = N(dur)
    t = np.arange(n) / SR
    s = tone(80 + 40 * np.sin(2 * np.pi * 22 * t) + 60 * t / dur, dur, harmonics=5) * 0.5 + band(n, 500, 300, 6) * 0.3
    return stereo(s * env(n, 0.02, 0.05) * (0.4 + 0.6 * t / dur))


def inflate(dur=0.6):
    n = N(dur)
    t = np.linspace(0, 1, n)
    s = tone(200 + 700 * t ** 1.5, dur, harmonics=2, vib=0.04, vib_rate=14) * 0.4 + band(n, 1600, 1100, 3) * 0.12
    return stereo(s * env(n, 0.02, 0.05))


def door_chime():
    parts = np.zeros(N(1.2))
    for off, hz in ((0, 880), (0.22, 659.25)):
        n = N(0.9)
        i = int(off * SR)
        parts[i:i + n] += tone(hz, 0.9, harmonics=2) * decay(n, 4) * env(n, 0.002, 0.2) * 0.25
    return stereo(parts)


def creak(dur=0.45):
    n = N(dur)
    t = np.arange(n) / SR
    s = tone(220 + 180 * np.sin(2 * np.pi * 3 * t) * np.sin(np.pi * t / dur), dur, harmonics=6) * 0.3 + band(n, 1200, 600, 8) * 0.12
    return stereo(s * env(n, 0.03, 0.15))


def pop(hz=700):
    n = N(0.18)
    return stereo(tone(np.linspace(hz * 0.6, hz * 1.6, n), 0.18) * decay(n, 18) * env(n, 0.002, 0.03) * 0.7)


def slide_whistle_down(dur=0.7):
    n = N(dur)
    return stereo(tone(np.linspace(1500, 400, n), dur, vib=0.01, vib_rate=7) * env(n, 0.02, 0.15) * 0.3)


def crack():
    n = N(0.2)
    return stereo(band(n, 3000, 2200, 5) * decay(n, 30) * 0.8)


def ting():
    n = N(0.6)
    return stereo((tone(3136, 0.6) + 0.5 * tone(4699, 0.6)) * decay(n, 7) * env(n, 0.001, 0.1) * 0.25)


def crash(seed, hz=1):
    n = N(0.5)
    ring = sum(tone(f * hz, 0.5) * decay(n, 10 + i * 4) for i, f in enumerate((1180, 1720, 2430, 3260)))
    return stereo((band(n, 2200, 1600, seed) * decay(n, 14) * 0.7 + ring * 0.12) * env(n, 0.001, 0.05))


# ------------------------------------------------------------ the bed

BPM = 132
BEAT = 60 / BPM
CHORDS = [(261.63, 329.63, 392.0), (293.66, 369.99, 440.0), (196.0, 246.94, 293.66), (261.63, 329.63, 392.0)]  # C D G C, a cheery diner tune


def pluck(hz, dur=0.3):
    n = N(dur)
    return tone(hz, dur, harmonics=4) * decay(n, 10) * env(n, 0.002, 0.05)


def bed(dur):
    n = N(dur)
    out = np.zeros(n)
    for b in range(int(dur / BEAT) + 1):
        i = int(b * BEAT * SR)
        chord = CHORDS[(b // 4) % 4]
        for k, hz in enumerate(chord):
            s = pluck(hz * 2, 0.25) * 0.11
            j = i + int((BEAT / 2 + k * 0.01) * SR)
            out[j:j + len(s)] += s[:max(0, min(len(s), n - j))]
        bass = pluck(chord[0] / 2 * (1, 1.5, 1.25, 1.5)[b % 4], 0.3) * 0.33
        out[i:i + len(bass)] += bass[:max(0, min(len(bass), n - i))]
        m = N(0.1)
        if b % 2 == 0:
            k = np.sin(2 * np.pi * np.cumsum(55 + 80 * np.exp(-np.arange(m) / SR * 40)) / SR) * decay(m, 30) * 0.45
        else:
            k = band(m, 2500, 1500, b) * decay(m, 25) * 0.16
        out[i:i + m] += k[:max(0, min(m, n - i))]
    return out


if __name__ == "__main__":
    mix = np.zeros((N(DUR + 0.5), 2), dtype=np.float32)
    duck = np.ones(len(mix))

    def dk(f, gain, hold, lvl):
        if not allowed(f):
            return
        i = int(sec(f) * SR)
        j = min(len(duck), i + int(hold * SR))
        duck[i:j] = np.minimum(duck[i:j], lvl)

    def hit(name, f, gain=1.0, lvl=0.3, hold=0.5):
        add(mix, op(name), f, gain)
        dk(f, gain, hold, lvl)

    def syn(clip, f, gain=1.0, lvl=1.0, hold=0.3):
        add(mix, clip, f, gain)
        if lvl < 1:
            dk(f, gain, hold, lvl)

    # whip-pan whooshes on the montage cuts
    for k in ("arm", "mouth", "towerA", "towerB", "towerC", "reactW", "belly", "reactC", "emptyA", "emptyB", "roll", "domino", "turn", "scribble", "enter", "zoro"):
        add(mix, op("whoosh_01"), S[k][0] - 1, 0.35)

    # 1-2: the welcome, the berries
    syn(door_chime(), 2, 0.6)
    syn(pop(500), B["greet"], 0.6)
    syn(coin(2637), B["berries"], 0.9)
    for i in range(5):
        syn(coin(2200 + 300 * (i % 3)), B["berries"] + 2 + i * 2, 0.5)
    hit("punch_01", B["berries"], 0.7, 0.4, 0.3)
    syn(chomp(3), B["grabTray"] - 1, 0.8)
    syn(clink(1300), B["grabTray"], 0.7)
    syn(ting(), B["grabTray"] + 2, 0.5)

    # 3a: the rubber arm
    add(mix, op("whoosh_01"), B["armFire"] - 1, 0.9)
    syn(boing(170, 520, 0.55, 0.8), B["armFire"], 0.5, 0.5, 0.5)
    for i, f in enumerate((78, 79, 80, 81, 82)):
        syn(crash(i + 1, 1.1 + 0.1 * i), f, 0.55)
    add(mix, op("whoosh_01"), B["armBack"], 0.8)
    syn(boing(520, 160, 0.4, 0.6), B["armBack"] + 1, 0.4)
    syn(gulp(), B["gulp"], 0.9)

    # 3b: the vacuum
    for i, f in enumerate(B["chomps"]):
        syn(slurp(0.3, i + 4), f - 2, 0.7, 0.55, 0.25)
        syn(chomp(i + 1), f, 0.9)
    syn(gulp(), B["chomps"][-1] + 3, 0.9)

    # 3c: the plates
    for i, f in enumerate(B["plates"]):
        for j in range(3 + i):
            syn(clink(1500 + 230 * j + 140 * i), f + j, 0.55 - 0.05 * j)
    # 3d: the smile cracks
    syn(crack(), B["wrinkleCrack"], 0.7)
    syn(crack(), B["wrinkleCrack"] + 5, 0.55)
    # 3e: inflate, then two pats
    syn(inflate(0.6), B["inflate"][0], 0.9, 0.5, 0.7)
    syn(boing(120, 260, 0.5, 0.5), B["inflate"][1], 0.5)
    for f in B["pats"]:
        hit("punch_02", f, 0.35, 0.5, 0.2)
        syn(belly_bom(), f, 1.0)
    # 3g: the empty counter
    syn(clink(2800, 0.5), B["olive"], 0.5)
    syn(slide_whistle_down(0.7), B["signSad"] - 1, 0.7, 0.6, 0.7)

    # 4: the ball, the dominoes, the burp
    for f in B["bounces"]:
        syn(boing(150, 330, 0.3, 0.7), f, 0.55)
        syn(belly_bom(80), f, 0.8)
    for i in range(5):
        f = B["dominoStart"] + i * B["dominoStep"]
        hit("explosion_0%d" % (i + 2), f, 0.28, 0.5, 0.25)
        for j in range(3):
            syn(crash(i * 3 + j + 9, 0.8 + 0.2 * j), f + 2 + j, 0.5)
    syn(gurgle(0.28), B["burpCharge"], 0.9, 0.4, 0.4)
    # the shock-wave: silence for the 3-frame flash, then everything at once
    duck[int(sec(S["flash"][0]) * SR):int(sec(S["flash"][0]) * SR) + int(0.9 * SR)] = 0.0
    hit("explosion_03", B["boom"], 0.9, 0.0, 0.0)
    hit("impact_heavy_01", B["boom"], 0.85, 0.0, 0.0)
    syn(burp(0.95), B["boom"], 1.0)
    for i in range(6):
        syn(crash(30 + i, 0.9 + 0.1 * i), B["boom"] + 3 + i, 0.4)
    if not SPARSE:
        duck[int(sec(S["gaunt"][0]) * SR):int(sec(S["gaunt"][1]) * SR)] = 0.12

    # 5: the asterisk, the deflate
    for i in range(3):
        syn(crack(), B["asterisk"] + i, 0.25)
    for i in range(6):
        syn(stereo(band(N(0.05), 2400, 1200, 40 + i) * decay(N(0.05), 40) * 0.4), B["finePrint"] + i, 0.5)
    hit("punch_02", B["patBelly"], 0.4, 0.5, 0.2)
    syn(belly_bom(), B["patBelly"], 1.0)
    r0, r1 = B["raspberry"]
    syn(raspberry(sec(r1 - r0)), r0, 1.0, 0.35, sec(r1 - r0))
    syn(ting(), B["thumb"], 0.8)

    # 6: Zoro
    syn(creak(0.45), B["door"] - 1, 0.7)
    add(mix, op("whoosh_01"), B["door"], 0.5)
    syn(door_chime(), B["chime"], 0.8)
    duck[int(sec(B["rumble"]) * SR):int(sec(S["zoro"][1]) * SR)] = 0.0
    hit("haki_rumble", B["rumble"], 0.55, 0.0, 0.0)
    syn(pop(520), B["qmark"], 1.0)
    syn(boing(300, 800, 0.3, 0.7), B["qmark"] + 1, 0.5)
    duck[int(sec(B["faintStart"]) * SR):] = 0.0
    syn(sad_trombone(), B["faintStart"], 0.9)
    hit("punch_01", B["thump"], 0.6, 0.0, 0.3)
    syn(thump(60, 0.3), B["thump"], 1.0)

    k = N(0.08)
    sm = np.convolve(duck, np.ones(k) / k, mode="same")
    if MUSIC == "yakety":
        song = decode(FF, os.path.join(ROOT, "public", "audio", "src", "yakety-sax.mp3"))
        i0 = int(YAK_X * SR)
        seg = song[i0:i0 + len(mix)]
        # the sax is dense and loud: sit it under the effects, and drop it further on every hit
        mix[: len(seg)] += seg * np.clip(sm, 0.2, 1.0)[: len(seg), None] * 1.0
    else:
        b = bed(DUR + 0.5)[: len(mix)]
        mix += stereo(b * sm * 0.9)[: len(mix)]

    mix = mix[: N(CUT if CUT else DUR)]
    if CUT:  # the cut ends on the thumbs-up: a rim-shot-ish hit on the last beat, then a short tail
        n = N(0.35)
        hit_ = stereo((band(n, 3500, 2200, 77) * decay(n, 18) * 0.6 + tone(180, 0.35) * decay(n, 14) * 0.5) * env(n, 0.001, 0.05))
        add(mix, hit_, (CUT - 0.30) * FPS, 0.7)
    # a short fade on the very last frames so the tail doesn't click
    fa = N(0.05)
    mix[-fa:] *= np.linspace(1, 0, fa)[:, None]
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
    print("wrote", os.path.relpath(OUT, ROOT), f"({(CUT or DUR):.2f}s)")
