#!/usr/bin/env python3
"""
Soundtracks for the "put your finger on the screen" Shorts (src/play/*Short.tsx
for rain / friend / bless / swim), synthesised from scratch so there is
nothing to license. There is no reference audio for these: the clips they
follow could not be downloaded, so each track is written to the story times
in the component (the T tables at the top of each file).

  rain    rain, a bouncy bed, thunder + zap at 5 s, wailing, squish, sparkles
  friend  countdown blips, record scratch, a sad choir, a clink, sobbing
  school  / work / birthday: footsteps, a cough and a pop, a sparkle loop
  swim    countdown, splashes, quacks, a growl, the final fanfare

Output: public/audio/play-<name>-mix.mp3

Usage:  python3 scripts/build-finger-audio.py [rain|friend|school|work|birthday|swim|all]
Needs:  numpy, and ffmpeg (falls back to the one Remotion ships).
"""

import importlib.util, os, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("play_audio", os.path.join(HERE, "build-play-audio.py"))
K = importlib.util.module_from_spec(_spec)
_argv = sys.argv
sys.argv = [_argv[0]]  # the kit reads argv[1] at import
_spec.loader.exec_module(K)
sys.argv = _argv

SR = K.SR
WHICH = (sys.argv[1] if len(sys.argv) > 1 else "all").lower()
rng = np.random.default_rng(7)

# ── helpers ───────────────────────────────────────────────────────────
LEAD = 0.04  # Remotion's AAC encoder adds ~43 ms of priming, so start every sound that much early


def put(track, clip, t, gain=1.0):
    """Place `clip` at `t` seconds (picture time; LEAD makes it land on the frame)."""
    s = int(round((t - LEAD) * SR))
    if s < 0:
        clip, s = clip[-s:], 0
    if s >= len(track) or len(clip) == 0:
        return
    e = min(s + len(clip), len(track))
    track[s:e] += clip[: e - s] * gain


def fade(x, a=0.0, b=0.0):
    x = x.copy()
    na, nb = int(a * SR), int(b * SR)
    if na:
        x[:na] *= np.linspace(0, 1, na)
    if nb:
        x[-nb:] *= np.linspace(1, 0, nb)
    return x


def lowpass(x, n):
    return np.convolve(x, np.ones(n, np.float32) / n, mode="same")


def pink(n):
    w = rng.standard_normal(n).astype(np.float32)
    out = np.zeros(n, np.float32)
    for k in (1, 3, 9, 27, 81):  # a few smoothed octaves of noise
        out += lowpass(w, k) * (k ** 0.5) / 4
    return out


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


# ── a bouncy "boop-boop" bed, the same grammar on every Short ──────────
C_PENT = [60, 62, 64, 67, 69, 72, 74, 76]
PROG_A = [[48, 60, 64, 67], [45, 57, 64, 69], [41, 57, 60, 65], [43, 59, 62, 67]]  # C Am F G
PROG_B = [[45, 57, 60, 64], [41, 57, 60, 65], [48, 60, 64, 67], [43, 59, 62, 67]]  # Am F C G


def bed(total, bpm=104, t0=0.0, t1=None, gain=1.0, prog=PROG_A, drums=True):
    out = np.zeros(int(total * SR), np.float32)
    beat = 60.0 / bpm
    t1 = total if t1 is None else t1
    kk, hh = K.kick(), K.hat()
    k = 0
    t = t0
    while t < t1 - 0.01:
        chord = prog[(k // 4) % len(prog)]
        if k % 4 == 0:
            put(out, K.bass(midi(chord[0]), beat * 3.6), t, 0.55)
        if drums:
            if k % 2 == 0:
                put(out, kk, t, 0.38)
            put(out, hh, t + beat / 2, 0.22)
        put(out, K.pluck(midi(chord[1 + k % 3] + 12), 0.45), t, 0.30)
        put(out, K.pluck(midi(chord[1 + (k + 1) % 3] + 12), 0.40), t + beat / 2, 0.22)
        if k % 8 in (3, 7):
            put(out, K.pluck(midi(C_PENT[(k * 3) % len(C_PENT)] + 12), 0.5), t + beat * 0.75, 0.2)
        t += beat
        k += 1
    return fade(out, 0.0, 0.25) * gain


# ── sound effects (new to this script) ────────────────────────────────
def rain_loop(dur):
    n = int(dur * SR)
    x = pink(n)
    hiss = rng.standard_normal(n).astype(np.float32)
    hiss = hiss - lowpass(hiss, 8)
    drops = np.zeros(n, np.float32)
    for _ in range(int(dur * 90)):
        s = int(rng.uniform(0, dur - 0.02) * SR)
        drops[s : s + 60] += rng.standard_normal(60).astype(np.float32) * np.exp(-np.arange(60) / 14) * rng.uniform(0.2, 0.8)
    return K.norm(0.55 * x + 0.18 * hiss + 0.5 * drops, 0.5)


def thunder(dur=2.6):
    t = K.t_arr(dur)
    n = lowpass(rng.standard_normal(len(t)).astype(np.float32), 60) * 1.6
    boom = np.sin(np.cumsum(2 * np.pi * (70 * np.exp(-t * 1.4) + 32) / SR))
    env = np.exp(-t * 1.5) * (1 - np.exp(-t * 90))
    return K.norm((n + 1.2 * boom) * env, 0.95)


def zap(dur=0.42):
    t = K.t_arr(dur)
    f = 2400 + 1600 * np.sin(2 * np.pi * 38 * t) + 900 * rng.standard_normal(len(t)) * 0.2
    sig = np.sign(np.sin(np.cumsum(2 * np.pi * f / SR)))
    noise = rng.standard_normal(len(t)).astype(np.float32)
    return K.norm((0.6 * sig + 0.5 * noise) * np.exp(-t * 7) * (1 - np.exp(-t * 400)), 0.8)


def crack(dur=0.18):
    t = K.t_arr(dur)
    n = rng.standard_normal(len(t)).astype(np.float32)
    return K.norm(n * np.exp(-t * 38), 0.9)


def wail(dur=1.1, f0=420, vib=5.5):
    """a sobbing 'waaah': a glottal buzz run through two vowel formants"""
    t = K.t_arr(dur)
    f = f0 * (1 + 0.1 * np.sin(2 * np.pi * vib * t)) * (1.18 - 0.35 * (t / dur) ** 1.3)
    ph = np.cumsum(2 * np.pi * f / SR)
    sig = np.zeros(len(t), np.float32)
    for h in range(1, 28):
        fh = f * h
        amp = np.exp(-(((fh - 780) / 340) ** 2)) + 0.6 * np.exp(-(((fh - 1500) / 520) ** 2)) + 0.12 * np.exp(-(((fh - 2800) / 700) ** 2))
        sig += (np.sin(h * ph) * amp / h ** 0.55).astype(np.float32)
    env = np.minimum(1, t / 0.07) * np.exp(-((t / dur) ** 2) * 1.8)
    return K.norm(sig * env, 0.7)


def sniffle(dur=0.35):
    t = K.t_arr(dur)
    n = rng.standard_normal(len(t)).astype(np.float32)
    n = n - lowpass(n, 30)
    env = np.sin(np.pi * np.minimum(1, t / dur)) ** 2 * (1 + 0.8 * np.sin(2 * np.pi * 22 * t))
    return K.norm(n * env, 0.35)


def squish(dur=0.32):
    t = K.t_arr(dur)
    f = 420 * np.exp(-t * 7) + 90
    sig = np.sin(np.cumsum(2 * np.pi * f / SR)) * np.exp(-t * 8)
    n = lowpass(rng.standard_normal(len(t)).astype(np.float32), 14) * np.exp(-t * 10) * 1.4
    return K.norm(sig + n, 0.7)


def twinkle(f=1568, dur=0.5):
    t = K.t_arr(dur)
    x = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.01 * t) + 0.25 * np.sin(2 * np.pi * f * 3.02 * t)
    return K.norm(x * np.exp(-t * 7), 0.5)


def ding(f=1318, dur=0.9):
    t = K.t_arr(dur)
    x = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t)
    return K.norm(x * np.exp(-t * 4.5), 0.6)


def slap(dur=0.25):
    t = K.t_arr(dur)
    n = lowpass(rng.standard_normal(len(t)).astype(np.float32), 5)
    thump = np.sin(np.cumsum(2 * np.pi * (180 * np.exp(-t * 30) + 70) / SR))
    return K.norm((n * np.exp(-t * 40) + 0.9 * thump * np.exp(-t * 18)), 0.85)


def pop(dur=0.14):
    t = K.t_arr(dur)
    f = 900 * np.exp(-t * 28) + 220
    return K.norm(np.sin(np.cumsum(2 * np.pi * f / SR)) * np.exp(-t * 26), 0.8)


def scratch(dur=0.45):
    t = K.t_arr(dur)
    f = 900 + 1200 * np.sin(2 * np.pi * 3.2 * t)
    sig = np.sign(np.sin(np.cumsum(2 * np.pi * np.abs(f) / SR)))
    n = rng.standard_normal(len(t)).astype(np.float32)
    return K.norm((0.5 * sig + 0.4 * n) * np.sin(np.pi * t / dur) ** 0.5, 0.7)


def choir(freqs, dur, vib=4.8):
    """a stacked, slow 'aaah' pad for the sad opera"""
    t = K.t_arr(dur)
    out = np.zeros(len(t), np.float32)
    for i, base in enumerate(freqs):
        for d in (-0.4, 0.0, 0.5):
            f = base * (1 + d * 0.004) * (1 + 0.006 * np.sin(2 * np.pi * (vib + 0.3 * i) * t + i))
            ph = np.cumsum(2 * np.pi * f / SR)
            for h in range(1, 12):
                fh = f * h
                amp = np.exp(-(((fh - 700) / 320) ** 2)) + 0.5 * np.exp(-(((fh - 1200) / 380) ** 2))
                out += (np.sin(h * ph) * amp / h ** 0.8).astype(np.float32) * 0.2
    env = np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 0.8)
    return K.norm(out * env, 0.6)


def clink(dur=0.5):
    t = K.t_arr(dur)
    x = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, d in ((1180, 14), (2230, 18), (3340, 24)))
    return K.norm(x, 0.55)


def footstep(dur=0.12):
    t = K.t_arr(dur)
    f = 130 * np.exp(-t * 30) + 60
    return K.norm(np.sin(np.cumsum(2 * np.pi * f / SR)) * np.exp(-t * 28), 0.45)


def cough(dur=0.55):
    t = K.t_arr(dur)
    n = lowpass(rng.standard_normal(len(t)).astype(np.float32), 4)
    env = np.exp(-((t - 0.1) / 0.05) ** 2) + 0.8 * np.exp(-((t - 0.28) / 0.06) ** 2) + 0.6 * np.exp(-((t - 0.44) / 0.05) ** 2)
    f = 240 * np.exp(-t * 2)
    v = np.sin(np.cumsum(2 * np.pi * f / SR))
    return K.norm((0.7 * n + 0.6 * v) * env, 0.6)


def splash(dur=0.55):
    t = K.t_arr(dur)
    n = rng.standard_normal(len(t)).astype(np.float32)
    n = n - lowpass(n, 5)
    env = (1 - np.exp(-t * 120)) * np.exp(-t * 7)
    return K.norm(n * env, 0.65)


def quack(dur=0.3, f0=520):
    t = K.t_arr(dur)
    f = f0 * (1 - 0.35 * t / dur)
    ph = np.cumsum(2 * np.pi * f / SR)
    sig = np.sign(np.sin(ph)) * 0.5 + np.sin(ph * 2) * 0.3
    return K.norm(sig * np.sin(np.pi * np.minimum(1, t / dur)) ** 0.6 * np.exp(-t * 4), 0.55)


def growl(dur=0.9):
    t = K.t_arr(dur)
    f = 95 + 22 * np.sin(2 * np.pi * 14 * t)
    sig = np.sign(np.sin(np.cumsum(2 * np.pi * f / SR))) * 0.6 + np.sin(np.cumsum(2 * np.pi * f * 2 / SR)) * 0.3
    n = lowpass(rng.standard_normal(len(t)).astype(np.float32), 6) * 0.5
    return K.norm((sig + n) * np.sin(np.pi * t / dur) ** 0.7, 0.8)


def chomp(dur=0.22):
    t = K.t_arr(dur)
    n = lowpass(rng.standard_normal(len(t)).astype(np.float32), 3)
    return K.norm(n * np.exp(-t * 26) + np.sin(2 * np.pi * 120 * t) * np.exp(-t * 30), 0.8)


def whistle(dur=0.5, f=1500):
    t = K.t_arr(dur)
    f_ = f * (1 + 0.01 * np.sin(2 * np.pi * 30 * t))
    return K.norm(np.sin(np.cumsum(2 * np.pi * f_ / SR)) * np.minimum(1, t / 0.02) * np.minimum(1, (dur - t) / 0.05), 0.55)


def fanfare():
    out = np.zeros(int(2.4 * SR), np.float32)
    for i, n in enumerate((72, 76, 79, 84)):
        put(out, K.pluck(midi(n), 1.5) * 0.8, i * 0.11)
    for n in (72, 76, 79, 84):
        put(out, K.pluck(midi(n - 12), 1.8) * 0.5, 0.5)
    return K.norm(out, 0.75)


def sparkle_loop(dur, base=1568):
    out = np.zeros(int(dur * SR), np.float32)
    tt = 0.0
    k = 0
    while tt < dur - 0.3:
        put(out, twinkle(base * (1, 1.25, 1.5, 2, 1.5, 1.25)[k % 6], 0.35) * 0.5, tt)
        tt += 0.085
        k += 1
    return out


# ── the Shorts ────────────────────────────────────────────────────────
def build_rain():
    total = 19.0
    sfx = np.zeros(int(total * SR), np.float32)
    # rain, then a held breath
    put(sfx, fade(rain_loop(4.4), 0.3, 0.5), 0.0, 0.8)
    # a quiet bed under it, and a bigger one once it's over
    music = bed(total, 104, 0.0, 4.0, 0.55)
    music += bed(total, 104, 4.0, total, 0.85)[: len(music)]
    # lightning at 5.0 s
    put(sfx, crack(), 5.0, 1.0)
    put(sfx, zap(), 5.0, 0.9)
    put(sfx, thunder(), 5.08, 0.95)
    # the wailing, a sobbing phrase every 1.6 s while he cries, with sniffles
    t = 6.0
    k = 0
    while t < 13.7:
        put(sfx, wail(1.15, 400 + 30 * (k % 3)), t, 0.55)
        put(sfx, sniffle(), t + 1.2, 0.45)
        t += 1.6
        k += 1
    put(sfx, squish(), 9.1, 0.9)
    for i in range(14):
        put(sfx, twinkle((1319, 1568, 1760, 2093)[i % 4], 0.4), 10.0 + i * 0.13, 0.5)
    put(sfx, slap(), 12.8, 1.0)
    put(sfx, ding(), 14.2, 0.9)
    put(sfx, twinkle(2093, 0.8), 14.3, 0.6)
    put(sfx, twinkle(2637, 0.8), 14.45, 0.5)
    K.write(0.95 * sfx + 0.6 * music, "play-rain-mix", total)



def build_friend():
    total = 16.0
    sfx = np.zeros(int(total * SR), np.float32)
    # 0-3 s: a bright counting tune with a blip on 3, 2, 1
    music = bed(total, 126, 0.0, 3.0, 0.9, PROG_A)
    for i, f in enumerate((880, 1040, 1320)):
        put(sfx, K.tick(f, 0.14), float(i), 0.8)
    # 3.0 s: record scratch, a thud, and the whole room goes "aww"
    put(sfx, scratch(), 2.98, 0.9)
    put(sfx, slap(), 3.0, 0.9)
    aww = choir([midi(57), midi(60), midi(64)], 1.3)
    put(sfx, aww, 3.05, 0.5)
    # then a slow, sad operatic pad: Am, F, Dm, E
    chords = [[57, 60, 64], [53, 57, 60], [50, 53, 57], [52, 56, 59]]
    pad = np.zeros(int(total * SR), np.float32)
    t = 3.2
    k = 0
    while t < 15.6:
        put(pad, choir([midi(n) for n in chords[k % 4]] + [midi(chords[k % 4][0] + 12)], 3.6), t, 0.55)
        t += 3.2
        k += 1
    # the crying: loud on the sign, quieter in the bin scene, muffled under the blanket
    t = 3.6
    k = 0
    while t < 15.4:
        w = wail(1.1, 380 + 25 * (k % 3))
        if t >= 10.5:
            w = lowpass(w, 14) * 1.4
        put(sfx, w, t, 0.5 if t < 8 else 0.42)
        if k % 2:
            put(sfx, sniffle(), t + 1.15, 0.4)
        t += 1.45
        k += 1
    # the note: a crumple, a throw, a clink
    for i in range(5):
        put(sfx, K.hat() * 2.2, 8.15 + i * 0.07, 0.5)
    put(sfx, K.boing() * 0.3, 8.55, 0.4)
    put(sfx, clink(), 9.7, 0.9)
    put(sfx, K.thud(), 9.72, 0.4)
    K.write(0.95 * sfx + 0.55 * pad + 0.6 * music, "play-friend-mix", total)


def build_bless(name, bpm, prog, base):
    total = 17.0
    sfx = np.zeros(int(total * SR), np.float32)
    music = bed(total, bpm, 0.0, total, 0.62, prog)
    # the walk-in
    for i in range(6):
        put(sfx, footstep(), 0.15 + i * 0.16, 0.5)
        put(sfx, footstep(), 0.23 + i * 0.16, 0.35)
    # three coughs and a pop
    for c in (1.15, 1.8, 2.45):
        put(sfx, cough(), c, 0.8)
    put(sfx, pop(), 3.0, 1.0)
    put(sfx, K.whistle_up(), 3.05, 0.3)
    put(sfx, twinkle(base, 0.9), 3.4, 0.6)
    # the beam: a sparkling loop, and a chime as each new word starts
    put(sfx, sparkle_loop(9.2, base), 4.0, 0.55)
    put(sfx, fade(choir([midi(67), midi(71), midi(74)], 9.4), 0.8, 0.8), 3.9, 0.22)
    for i in range(5):
        put(sfx, ding(base * (1, 1.125, 1.25, 1.5, 2)[i], 0.9), 4.0 + 2 * i, 0.5)
    # 13.0: the stamp
    put(sfx, slap(), 13.0, 0.7)
    put(sfx, ding(base * 2, 1.2), 13.02, 0.8)
    put(sfx, twinkle(base * 2.5, 0.9), 13.1, 0.6)
    # 14-17: squeaky wiggles and a cheerful ending
    for i, tt in enumerate((14.3, 14.75, 15.2, 15.65)):
        put(sfx, K.boing() * 0.5, tt, 0.35)
    put(sfx, K.tada(), 14.2, 0.4)
    K.write(0.95 * sfx + 0.7 * music, name, total)


def build_school():
    build_bless("play-school-mix", 112, PROG_B, 1568)


def build_work():
    build_bless("play-work-mix", 120, PROG_A, 1319)


def square(freq, dur, duty=0.5):
    t = K.t_arr(dur)
    ph = (t * freq) % 1.0
    x = np.where(ph < duty, 1.0, -1.0).astype(np.float32)
    return x * np.exp(-t * 9) * 0.5


def meow(dur=0.5):
    t = K.t_arr(dur)
    f = 520 + 380 * np.sin(np.pi * np.minimum(1, t / dur) ** 0.9) - 120 * (t / dur)
    ph = np.cumsum(2 * np.pi * f / SR)
    sig = np.zeros(len(t), np.float32)
    form = 900 + 900 * np.sin(np.pi * t / dur)  # "m-eee-ow": the formant sweeps up and back down
    for h in range(1, 20):
        fh = f * h
        amp = np.exp(-(((fh - form) / 420) ** 2)) + 0.25 * np.exp(-(((fh - 2800) / 800) ** 2))
        sig += (np.sin(h * ph) * amp / h ** 0.6).astype(np.float32)
    env = np.minimum(1, t / 0.05) * np.minimum(1, (dur - t) / 0.12)
    return K.norm(sig * env, 0.6)


def chip_bed(total, bpm=150, t0=0.0, t1=None, gain=1.0):
    out = np.zeros(int(total * SR), np.float32)
    beat = 60.0 / bpm
    t1 = total if t1 is None else t1
    notes = [60, 64, 67, 72, 67, 64, 60, 64, 62, 65, 69, 74, 69, 65, 62, 65, 57, 60, 64, 69, 64, 60, 57, 60, 59, 62, 67, 71, 67, 62, 59, 62]
    roots = [48, 50, 45, 55]
    kk, hh = K.kick(), K.hat()
    k = 0
    t = t0
    while t < t1 - 0.01:
        put(out, square(midi(notes[k % len(notes)]), beat * 0.5, 0.25), t, 0.32)
        put(out, square(midi(notes[(k * 3) % len(notes)] + 12), beat * 0.35, 0.125), t + beat / 2, 0.14)
        if k % 8 == 0:
            r = roots[(k // 8) % 4]
            for j in range(8):
                put(out, square(midi(r if j % 2 == 0 else r + 12), beat * 0.4, 0.5), t + j * beat, 0.2)
        if k % 2 == 0:
            put(out, kk, t, 0.4)
        put(out, hh, t + beat / 2, 0.2)
        t += beat
        k += 1
    return fade(out, 0.0, 0.2) * gain


def build_swim():
    total = 28.0
    sfx = np.zeros(int(total * SR), np.float32)
    music = chip_bed(total, 150, 0.0, 26.0, 0.8)
    # 3 2 1 GO
    for tt, f in ((0.0, 880), (0.67, 1040), (1.33, 1240)):
        put(sfx, K.tick(f, 0.14), tt, 0.8)
    put(sfx, whistle(0.55, 1700), 2.0, 0.7)
    # the dive and the swimming
    for i in range(4):
        put(sfx, splash(), 2.44 + 0.03 * i, 0.55)
    tt = 2.8
    while tt < 23.4:
        put(sfx, splash(0.3) * 0.5, tt, 0.16)
        tt += 0.28
    # Mimi reaches over the rope and hauls Bruno back
    put(sfx, meow(0.55), 4.95, 0.7)
    put(sfx, K.slide_down(), 6.3, 0.5)
    put(sfx, K.boing(), 6.55, 0.5)
    # Poppy turns shark: growl, lunge, chomp, and Mimi is flung off
    put(sfx, growl(1.0), 7.25, 0.8)
    put(sfx, K.fall_whistle() * 0.5, 8.1, 0.5)
    put(sfx, chomp(), 8.38, 1.0)
    put(sfx, slap(), 8.45, 0.8)
    put(sfx, K.slide_down(), 8.6, 0.6)
    for i in range(4):
        put(sfx, twinkle((1568, 1976, 2349, 1760)[i], 0.4), 8.7 + i * 0.1, 0.4)
    # the revenge
    put(sfx, splash(0.6), 15.3, 0.7)
    put(sfx, meow(0.6) , 16.2, 0.6)
    put(sfx, slap(), 17.3, 0.9)
    put(sfx, K.boing(), 17.35, 0.5)
    # the crash: a long chaotic cloud
    put(sfx, splash(0.7), 23.3, 0.8)
    r = np.random.default_rng(3)
    tt = 23.55
    while tt < 25.1:
        fx = r.integers(0, 4)
        put(sfx, (slap(), K.boing(), K.thud(), chomp())[fx], tt, 0.55)
        tt += 0.11 + r.random() * 0.06
    # launched, lands, crowned
    put(sfx, K.whistle_up(), 25.0, 0.6)
    put(sfx, K.thud(), 25.9, 0.9)
    put(sfx, fanfare(), 26.0, 0.9)
    put(sfx, K.cheer(2.0), 26.05, 0.8)
    K.write(0.95 * sfx + 0.6 * music, "play-swim-mix", total)


VOWELS = {  # formant pairs (F1, F2) for the syllables of the song
    "hap": (760, 1400), "py": (320, 2300), "birth": (520, 1300), "day": (480, 2000),
    "to": (360, 900), "you": (320, 850), "dear": (450, 2100), "fri": (330, 2200), "end": (560, 1800),
}


def sing(midi_note, dur, syl, vib=0.0):
    """a goofy wobbly sung vowel: a buzz through two formants, with vibrato on long notes"""
    t = K.t_arr(dur)
    f0 = midi(midi_note)
    f = f0 * (1 + vib * 0.012 * np.sin(2 * np.pi * 6.2 * t)) * (1 + 0.03 * np.exp(-t * 18))
    ph = np.cumsum(2 * np.pi * f / SR)
    f1, f2 = VOWELS.get(syl, (600, 1500))
    sig = np.zeros(len(t), np.float32)
    for h in range(1, 40):
        fh = f * h
        amp = np.exp(-(((fh - f1) / 230) ** 2)) + 0.7 * np.exp(-(((fh - f2) / 330) ** 2)) + 0.05 * np.exp(-(((fh - 3200) / 900) ** 2))
        sig += (np.sin(h * ph) * amp / h ** 0.35).astype(np.float32)
    env = np.minimum(1, t / 0.025) * np.minimum(1, (dur - t) / 0.05)
    return K.norm(sig * env, 0.8)


def build_birthday():
    import json
    song = json.load(open(os.path.join(HERE, "..", "src", "play", "birthday-song.json")))
    total = 18.5
    beat = 60.0 / song["bpm"]
    sfx = np.zeros(int(total * SR), np.float32)
    voice = np.zeros(int(total * SR), np.float32)
    # a light waltz-ish bed: kick-less, a bass pluck on each bar and a pluck on beats 2 and 3
    music = bed(total, song["bpm"], 0.0, total, 0.55, PROG_A, drums=False)
    # the intro: a little drum roll and a sniff
    for i in range(6):
        put(sfx, K.tick(700 + i * 90, 0.08), 0.9 + i * 0.1, 0.5)
    put(sfx, sniffle(0.5), 1.1, 0.4)
    t = song["start"]
    last = t
    for line in song["lines"]:
        for syl, note, beats, _ in line:
            d = beats * beat
            put(voice, sing(note, d * 0.96, syl, vib=1.0 if d > 0.7 else 0.0), t, 0.55)
            if d > 1.5:  # the long "you": slow vibrato swell
                put(voice, sing(note + 12, d * 0.9, syl, vib=1.0) * 0.12, t, 0.5)
            t += d
        last = t
        t += song["gap"] * beat
    # the candle: a big breath and a puff, then a pop of confetti and cheers
    put(sfx, fade(rain_loop(0.7), 0.1, 0.3) * 0.5, last + 0.0, 0.5)
    put(sfx, pop(), last + 0.3, 0.9)
    put(sfx, K.tada(), last + 0.35, 0.7)
    put(sfx, K.cheer(2.0), last + 0.4, 0.8)
    for i in range(10):
        put(sfx, pop() * 0.6, last + 0.5 + i * 0.09, 0.5)
    K.write(0.9 * voice + 0.85 * sfx + 0.55 * music, "play-birthday-mix", total)


BUILDERS = {"rain": build_rain, "friend": build_friend, "school": build_school, "work": build_work, "swim": build_swim, "birthday": build_birthday}

if __name__ == "__main__":
    if not os.path.exists(K.FFMPEG):
        sys.exit(f"ffmpeg not found — set FFMPEG=/path/to/ffmpeg (tried {K.FFMPEG})")
    names = list(BUILDERS) if WHICH == "all" else [WHICH]
    for n in names:
        if n not in BUILDERS:
            sys.exit(f"unknown short {n!r}; try one of {', '.join(BUILDERS)} or all")
        BUILDERS[n]()
