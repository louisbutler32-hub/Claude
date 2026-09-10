#!/usr/bin/env python3
"""Synthesised sound effects for the doodle-essay videos.

Every effect here is generated from oscillators and noise at call time, so
the videos carry no sampled audio and nothing to be claimed. The palette is
deliberately meme-shaped — the deep boom, the airhorn, the record scratch,
the sad trombone — because those are *kinds* of sound, and a kind of sound
can be built. The specific famous recordings cannot: see the note in
src/mummy/README.md.

    from sfx import render
    clip = render("boom")          # float32 mono at SR
"""
import numpy as np
from scipy.signal import butter, lfilter

SR = 24000


def t(dur):
    return np.arange(int(dur * SR)) / SR


def env(x, attack=0.005, release=0.25, curve=2.0):
    """Percussive envelope: fast in, exponential out."""
    n = len(x)
    a = max(1, int(attack * SR))
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a)
    tail = np.linspace(0, 1, n - a)
    e[a:] = np.exp(-tail * curve * (1 / max(release, 1e-3)) * 0.35)
    return x * e


def noise(dur, seed=0):
    return np.random.default_rng(seed).standard_normal(int(dur * SR)).astype(np.float32)


def lowpass(x, cutoff, order=4):
    """Butterworth low-pass. A one-pole filter barely dents broadband noise —
    at 6 dB/octave a "rumble" still measures as hiss — so this is 24 dB."""
    b, a = butter(order, min(cutoff / (SR / 2), 0.99), btype="low")
    return lfilter(b, a, x).astype(np.float32)


def highpass(x, cutoff, order=4):
    b, a = butter(order, min(cutoff / (SR / 2), 0.99), btype="high")
    return lfilter(b, a, x).astype(np.float32)


def sweep(f0, f1, dur, curve=1.0):
    """A tone gliding between two frequencies."""
    tt = t(dur)
    k = (tt / max(dur, 1e-6)) ** curve
    freq = f0 + (f1 - f0) * k
    return np.sin(2 * np.pi * np.cumsum(freq) / SR)


def norm(x, peak=0.85):
    m = float(np.max(np.abs(x))) or 1.0
    return (x * (peak / m)).astype(np.float32)


def saw(freq_arr):
    ph = np.cumsum(freq_arr) / SR
    return 2 * (ph - np.floor(ph + 0.5))


# ── the palette ─────────────────────────────────────────────────────

def s_boom():
    """The deep bass hit used for a beat landing. Sub with a fast drop."""
    x = sweep(150, 34, 1.5, curve=0.35)
    x += 0.3 * sweep(300, 68, 1.5, curve=0.35)
    body = env(x, attack=0.004, release=0.9, curve=1.4)
    click = env(noise(0.05, 3), attack=0.001, release=0.05, curve=3) * 0.25
    out = body.copy()
    out[: len(click)] += click
    return norm(out, 0.95)


def s_airhorn():
    dur = 1.4
    tt = t(dur)
    wob = 1 + 0.012 * np.sin(2 * np.pi * 6.5 * tt)
    base = 233.0 * wob
    x = sum(saw(base * k * np.ones_like(tt)) / (k * 1.3) for k in (1, 2, 3))
    x = lowpass(x, 2600, order=2)
    x *= np.clip(np.minimum(tt / 0.05, (dur - tt) / 0.25), 0, 1)
    return norm(x, 0.8)


def s_scratch():
    """Record scratch: a band of noise dragged up then down."""
    a = noise(0.22, 11)
    b = noise(0.2, 12)
    a = lowpass(a * (1 + 4 * np.linspace(0, 1, len(a))), 2600)
    b = lowpass(b * (1 + 4 * np.linspace(1, 0, len(b))), 1800)
    x = np.concatenate([a, b])
    x *= np.abs(sweep(120, 900, len(x) / SR, curve=0.7))
    return norm(env(x, attack=0.002, release=0.5, curve=1.2), 0.7)


def s_sadtrom():
    """Wah wah wah waaah, four descending slides."""
    notes = [(233, 220), (207, 196), (185, 175), (165, 130)]
    parts = []
    for i, (f0, f1) in enumerate(notes):
        d = 0.34 if i < 3 else 0.95
        tt = t(d)
        freq = f0 + (f1 - f0) * (tt / d)
        x = lowpass(sum(saw(freq * k) / (k * 1.6) for k in (1, 2, 3)), 1400, order=2)
        wah = 0.55 + 0.45 * np.sin(2 * np.pi * 5.5 * tt)
        x *= wah * np.clip(np.minimum(tt / 0.02, (d - tt) / 0.08), 0, 1)
        parts.append(x)
        parts.append(np.zeros(int(0.05 * SR)))
    return norm(np.concatenate(parts), 0.72)


def s_boing():
    tt = t(0.45)
    freq = 420 * np.exp(-tt * 7) + 90
    x = np.sin(2 * np.pi * np.cumsum(freq) / SR)
    x *= 1 + 0.5 * np.sin(2 * np.pi * 22 * tt)
    return norm(env(x, attack=0.002, release=0.35, curve=2.2), 0.7)


def s_bonk():
    x = env(noise(0.12, 21), attack=0.001, release=0.09, curve=3)
    x = lowpass(x, 900)
    x += 0.6 * env(sweep(320, 120, 0.12), attack=0.001, release=0.09, curve=3)
    return norm(x, 0.8)


def s_slide_up():
    x = sweep(320, 1500, 0.5, curve=1.6)
    return norm(env(x, attack=0.01, release=0.5, curve=1.0), 0.55)


def s_slide_down():
    x = sweep(1500, 300, 0.6, curve=0.7)
    return norm(env(x, attack=0.01, release=0.6, curve=1.0), 0.55)


def s_error():
    """Two descending square-ish tones — the generic 'wrong' beep."""
    out = []
    for f, d in ((520, 0.16), (392, 0.30)):
        tt = t(d)
        x = np.sign(np.sin(2 * np.pi * f * tt)) * 0.5
        out.append(env(x, attack=0.004, release=d, curve=1.2))
        out.append(np.zeros(int(0.03 * SR)))
    return norm(np.concatenate(out), 0.55)


def s_tada():
    out = []
    for f, d in ((523, 0.12), (659, 0.12), (784, 0.14), (1047, 0.75)):
        tt = t(d)
        x = sum(np.sin(2 * np.pi * f * k * tt) / k for k in (1, 2, 3))
        out.append(env(x, attack=0.005, release=d, curve=1.1))
    return norm(np.concatenate(out), 0.6)


def s_ding():
    tt = t(0.85)
    x = np.sin(2 * np.pi * 1320 * tt) + 0.5 * np.sin(2 * np.pi * 2640 * tt)
    return norm(env(x, attack=0.002, release=0.8, curve=1.1), 0.45)


def s_pop():
    x = env(sweep(700, 220, 0.09), attack=0.001, release=0.07, curve=3)
    return norm(x, 0.55)


def s_blip():
    x = env(sweep(880, 1500, 0.07), attack=0.001, release=0.06, curve=2)
    return norm(x, 0.45)


def s_whoosh():
    x = lowpass(noise(0.45, 31), 3000)
    x *= np.sin(np.pi * np.linspace(0, 1, len(x))) ** 1.5
    return norm(x, 0.4)


def s_thud():
    x = env(sweep(120, 44, 0.4), attack=0.002, release=0.35, curve=1.8)
    x += 0.4 * env(lowpass(noise(0.4, 41), 400, order=6), attack=0.002, release=0.3, curve=2)
    return norm(x, 0.75)


def s_rumble():
    x = lowpass(noise(1.6, 51), 130, order=6)
    x *= np.sin(np.pi * np.linspace(0, 1, len(x)))
    return norm(x, 0.6)


def s_shimmer():
    """Ice: a run of high bell partials descending."""
    out = np.zeros(int(1.1 * SR), dtype=np.float32)
    rng = np.random.default_rng(7)
    for i in range(9):
        f = 2600 - i * 190 + rng.uniform(-60, 60)
        d = 0.55
        tt = t(d)
        c = env(np.sin(2 * np.pi * f * tt), attack=0.002, release=0.5, curve=1.4)
        at = int(i * 0.055 * SR)
        out[at : at + len(c)] += c * 0.32
    return norm(out, 0.4)


def s_squelch():
    x = lowpass(noise(0.5, 61), 700, order=6)
    x *= np.abs(sweep(60, 250, 0.5, curve=0.6))
    return norm(env(x, attack=0.01, release=0.4, curve=1.6), 0.6)


def s_bubble():
    out = np.zeros(int(1.2 * SR), dtype=np.float32)
    rng = np.random.default_rng(9)
    for i in range(11):
        d = 0.09
        x = env(sweep(rng.uniform(300, 700), rng.uniform(900, 1500), d), 0.001, d, 3)
        at = int(rng.uniform(0, 1.05) * SR)
        out[at : at + len(x)] += x * 0.4
    return norm(out, 0.4)


def s_fizz():
    x = noise(1.1, 71)
    x = x - lowpass(x, 1800)
    x *= np.linspace(1, 0, len(x)) ** 1.4
    return norm(x, 0.3)


def s_sprinkle():
    out = np.zeros(int(0.9 * SR), dtype=np.float32)
    rng = np.random.default_rng(13)
    for _ in range(40):
        d = 0.03
        x = env(noise(d, int(rng.integers(0, 9999))), 0.001, d, 3)
        x = x - lowpass(x, 3000)
        at = int(rng.uniform(0, 0.85) * SR)
        out[at : at + len(x)] += x * 0.5
    return norm(out, 0.35)


def s_wind():
    x = lowpass(noise(2.4, 81), 500, order=6)
    mod = 0.55 + 0.45 * np.sin(2 * np.pi * 0.6 * t(2.4))
    x *= mod * np.sin(np.pi * np.linspace(0, 1, len(x))) ** 0.7
    return norm(x, 0.32)


def s_crunch():
    out = np.zeros(int(0.5 * SR), dtype=np.float32)
    rng = np.random.default_rng(17)
    for i in range(6):
        d = 0.06
        x = env(noise(d, int(rng.integers(0, 9999))), 0.001, d, 3)
        x = lowpass(x, 2200)
        at = int(i * 0.055 * SR)
        out[at : at + len(x)] += x * rng.uniform(0.5, 1.0)
    return norm(out, 0.55)


def s_slurp():
    x = sweep(180, 900, 0.7, curve=1.8)
    x *= 0.5 + 0.5 * np.sin(2 * np.pi * 14 * t(0.7))
    x += 0.5 * lowpass(noise(0.7, 91), 1400)
    return norm(env(x, attack=0.02, release=0.6, curve=1.2), 0.55)


def s_bell():
    tt = t(2.4)
    x = sum(a * np.sin(2 * np.pi * f * tt) for f, a in ((523, 1.0), (1046, 0.5), (1570, 0.28), (2093, 0.15)))
    return norm(env(x, attack=0.002, release=2.2, curve=1.0), 0.45)


def s_gong():
    tt = t(2.8)
    rng = np.random.default_rng(23)
    x = sum(np.sin(2 * np.pi * f * tt) / (i + 1) for i, f in enumerate(rng.uniform(90, 900, 9)))
    return norm(env(x, attack=0.01, release=2.6, curve=1.0), 0.5)


def s_clink():
    tt = t(0.4)
    x = np.sin(2 * np.pi * 2100 * tt) + 0.6 * np.sin(2 * np.pi * 3300 * tt)
    return norm(env(x, attack=0.001, release=0.35, curve=1.6), 0.35)


def s_creak():
    x = sweep(180, 90, 1.1, curve=0.5)
    x *= 0.4 + 0.6 * (np.sin(2 * np.pi * 9 * t(1.1)) > 0)
    x += 0.3 * lowpass(noise(1.1, 101), 900)
    return norm(env(x, attack=0.05, release=0.9, curve=1.1), 0.4)


def s_stone():
    x = env(lowpass(noise(0.9, 111), 500, order=6), attack=0.002, release=0.7, curve=1.6)
    x += 0.5 * env(sweep(90, 50, 0.9), 0.002, 0.7, 1.6)
    return norm(x, 0.6)


def s_wrap():
    x = noise(0.34, 121)
    x = x - lowpass(x, 1500)
    x *= np.sin(np.pi * np.linspace(0, 1, len(x))) ** 0.8
    return norm(x, 0.35)


def s_rip():
    x = noise(0.55, 131)
    x = x - lowpass(x, 1100)
    x *= np.linspace(0.4, 1.4, len(x)) * np.sin(np.pi * np.linspace(0, 1, len(x))) ** 0.5
    return norm(x, 0.5)


def s_pour():
    x = lowpass(noise(1.3, 141), 2400)
    x *= 0.5 + 0.5 * np.sin(2 * np.pi * 3.5 * t(1.3))
    x *= np.sin(np.pi * np.linspace(0, 1, len(x))) ** 0.6
    return norm(x, 0.32)


def s_tick():
    out = np.zeros(int(2.4 * SR), dtype=np.float32)
    for i in range(5):
        x = env(noise(0.02, 150 + i), 0.001, 0.02, 3)
        at = int(i * 0.5 * SR)
        out[at : at + len(x)] += x * 0.6
    return norm(out, 0.3)


def s_twang():
    tt = t(0.8)
    freq = 300 * np.exp(-tt * 3) + 150
    x = lowpass(saw(freq), 1800, order=2) * 0.4
    return norm(env(x, attack=0.002, release=0.7, curve=1.6), 0.45)


def s_deflate():
    x = lowpass(noise(1.2, 161), 1200, order=6)
    x *= np.linspace(1, 0.1, len(x))
    x *= 0.6 + 0.4 * np.sin(2 * np.pi * 2 * t(1.2))
    x += 0.3 * env(sweep(500, 90, 1.2, curve=0.6), 0.01, 1.0, 1.0)
    return norm(x, 0.4)


def s_shrivel():
    x = sweep(700, 180, 1.0, curve=0.6)
    x *= 0.5 + 0.5 * (np.sin(2 * np.pi * 17 * t(1.0)) > 0)
    return norm(env(x, attack=0.01, release=0.9, curve=1.2), 0.35)


def s_camera():
    a = env(noise(0.04, 171), 0.001, 0.04, 3)
    b = env(noise(0.05, 172), 0.001, 0.05, 3)
    gap = np.zeros(int(0.06 * SR))
    return norm(np.concatenate([a, gap, b]), 0.5)


def s_siren():
    tt = t(1.8)
    freq = 700 + 260 * np.sin(2 * np.pi * 1.6 * tt)
    x = np.sin(2 * np.pi * np.cumsum(freq) / SR)
    x *= np.sin(np.pi * np.linspace(0, 1, len(x))) ** 0.5
    return norm(x, 0.4)


def s_vacuum():
    x = lowpass(noise(1.8, 181), 700, order=6)
    x *= np.linspace(0.3, 1.0, len(x))
    x += 0.4 * sweep(200, 60, 1.8, curve=0.7)
    return norm(env(x, attack=0.2, release=1.4, curve=0.9), 0.4)


def s_scribble():
    out = np.zeros(int(1.0 * SR), dtype=np.float32)
    rng = np.random.default_rng(29)
    for i in range(14):
        d = 0.05
        x = env(noise(d, int(rng.integers(0, 9999))), 0.002, d, 2)
        x = x - lowpass(x, 2500)
        at = int(i * 0.065 * SR)
        out[at : at + len(x)] += x * rng.uniform(0.4, 0.9)
    return norm(out, 0.3)


EFFECTS = {
    "boom": s_boom, "airhorn": s_airhorn, "scratch": s_scratch, "sadtrom": s_sadtrom,
    "boing": s_boing, "bonk": s_bonk, "slideup": s_slide_up, "slidedown": s_slide_down,
    "error": s_error, "tada": s_tada, "ding": s_ding, "pop": s_pop, "blip": s_blip,
    "whoosh": s_whoosh, "thud": s_thud, "rumble": s_rumble, "shimmer": s_shimmer,
    "squelch": s_squelch, "bubble": s_bubble, "fizz": s_fizz, "sprinkle": s_sprinkle,
    "wind": s_wind, "crunch": s_crunch, "chomp": s_crunch, "slurp": s_slurp,
    "bell": s_bell, "gong": s_gong, "clink": s_clink, "creak": s_creak,
    "stone": s_stone, "wrap": s_wrap, "rip": s_rip, "pour": s_pour, "tick": s_tick,
    "twang": s_twang, "deflate": s_deflate, "shrivel": s_shrivel, "camera": s_camera,
    "siren": s_siren, "vacuum": s_vacuum, "scribble": s_scribble,
    # aliases so the script can name the moment rather than the waveform
    "clunk": s_bonk, "pick": s_bonk, "hammer": s_bonk, "stone_seal": s_stone,
    "bin": s_bonk, "paint": s_wrap, "scan": s_blip, "gasp": s_boom,
    "retch": s_deflate, "neigh": s_boing, "silence": lambda: np.zeros(1, dtype=np.float32),
}


def render(name):
    if name not in EFFECTS:
        raise KeyError("no such effect: %s (have %s)" % (name, ", ".join(sorted(EFFECTS))))
    return EFFECTS[name]()
