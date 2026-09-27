#!/usr/bin/env python3
"""Build the sound-effects track for a geo short.

    python3 scripts/make-geo-sfx.py texas

Reads src/geo/<name>/sfx.json — a list of [cue, time, gain] — and renders
every cue into one mixed track at public/audio/geo-<name>-sfx.mp3, which
the composition plays as a third audio slot under the narration and music.

The cues are synthesised here from noise and sine sweeps, so there is
nothing to license and nothing to download. They are deliberately plain:
the reference channels hit roughly one sound per second, and what carries
that is the timing, not the sample. Drop real recordings into
public/audio/sfx/<cue>.wav and they are used instead of the synth — see
src/geo/README.md.

Needs:  pip install numpy soundfile   (plus ffmpeg on PATH)
"""
import json
import os
import subprocess
import sys

import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 44100
rng = np.random.default_rng(11)


def env(n, attack=0.004, decay=0.25, power=2.2):
    """A percussive envelope: fast in, curved out."""
    a = int(attack * SR)
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a)
    tail = np.linspace(0, 1, max(1, n - a))
    e[a:] = (1 - tail) ** power
    return e


def noise(n):
    return rng.standard_normal(n)


def lowpass(x, cutoff, order=2):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = x.copy()
    for _ in range(order):
        acc = 0.0
        out = np.empty_like(y)
        b = 1 - a
        for i in range(len(y)):
            acc = a * acc + b * y[i]
            out[i] = acc
        y = out
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def sweep(n, f0, f1, shape="exp"):
    t = np.arange(n) / SR
    if shape == "exp":
        f = f0 * (f1 / f0) ** (t / max(t[-1], 1e-6))
    else:
        f = np.linspace(f0, f1, n)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


# ── the cues ──────────────────────────────────────────────────────────

def cue_whoosh(dur=0.42):
    n = int(dur * SR)
    x = highpass(lowpass(noise(n), 5200), 400)
    # the band sweeps up then down, like something passing the camera
    t = np.linspace(0, 1, n)
    x *= np.sin(np.pi * t) ** 1.5
    x += 0.25 * sweep(n, 220, 900) * env(n, 0.02, 1, 1.4)
    return x * 0.8


def cue_whoosh_down(dur=0.5):
    n = int(dur * SR)
    x = highpass(lowpass(noise(n), 4200), 300) * np.linspace(1, 0.1, n) ** 1.2
    x += 0.3 * sweep(n, 700, 120) * env(n, 0.01, 1, 1.2)
    return x * 0.8


def cue_pop(dur=0.13):
    n = int(dur * SR)
    x = sweep(n, 900, 260) * env(n, 0.002, 1, 3.4)
    x += 0.35 * lowpass(noise(n), 2600) * env(n, 0.001, 1, 6)
    return x


def cue_click(dur=0.08):
    n = int(dur * SR)
    return highpass(noise(n), 2200) * env(n, 0.0008, 1, 9) * 0.7


def cue_thud(dur=0.5):
    n = int(dur * SR)
    x = sweep(n, 180, 42) * env(n, 0.002, 1, 2.0)
    x += 0.5 * lowpass(noise(n), 260) * env(n, 0.001, 1, 3.5)
    return x * 1.1


def cue_boom(dur=1.1):
    n = int(dur * SR)
    x = sweep(n, 120, 28) * env(n, 0.004, 1, 1.5)
    x += 0.4 * lowpass(noise(n), 180) * env(n, 0.002, 1, 2.2)
    return x * 1.2


def cue_ding(dur=0.9):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for f, g in [(1318, 1.0), (1975, 0.5), (2637, 0.28)]:
        x += g * np.sin(2 * np.pi * f * t) * env(n, 0.002, 1, 1.2)
    return x * 0.5


def cue_chime(dur=1.3):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for i, f in enumerate([880, 1108, 1318]):
        d = int(i * 0.07 * SR)
        e = env(n - d, 0.003, 1, 1.1)
        x[d:] += np.sin(2 * np.pi * f * t[: n - d]) * e * (0.8 ** i)
    return x * 0.45


def cue_coin(dur=0.7):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for f, g in [(2100, 1.0), (3150, 0.6), (4300, 0.3)]:
        x += g * np.sin(2 * np.pi * f * t) * env(n, 0.001, 1, 2.4)
    x += 0.3 * highpass(noise(n), 3500) * env(n, 0.001, 1, 7)
    return x * 0.5


def cue_cash(dur=0.55):
    n = int(dur * SR)
    x = np.zeros(n)
    for k in range(5):  # a riffle of notes
        d = int(k * 0.055 * SR)
        seg = highpass(noise(n - d), 2600) * env(n - d, 0.001, 1, 11)
        x[d:] += seg * (0.85 ** k)
    return x * 0.6


def cue_stamp(dur=0.6):
    n = int(dur * SR)
    x = lowpass(noise(n), 900) * env(n, 0.001, 1, 5) * 1.1
    x += 0.6 * sweep(n, 260, 60) * env(n, 0.001, 1, 3)
    return x


def cue_riser(dur=1.4):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    x = highpass(noise(n), 500) * (t ** 2.2)
    x += 0.4 * sweep(n, 160, 1400) * (t ** 2)
    return x * 0.7


def cue_swell(dur=1.8):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    x = lowpass(noise(n), 700) * np.sin(np.pi * t) ** 2
    x += 0.35 * sweep(n, 90, 220, "lin") * np.sin(np.pi * t) ** 2
    return x * 0.7


def cue_error(dur=0.45):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = (np.sin(2 * np.pi * 180 * t) + np.sin(2 * np.pi * 172 * t)) * env(n, 0.003, 1, 2.6)
    return x * 0.5


def cue_pageturn(dur=0.4):
    n = int(dur * SR)
    x = highpass(lowpass(noise(n), 6000), 1400)
    t = np.linspace(0, 1, n)
    return x * (np.sin(np.pi * t) ** 2) * 0.55


def cue_rumble(dur=2.2):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    x = lowpass(noise(n), 110, order=3) * np.sin(np.pi * t) ** 1.5
    return x * 1.3


CUES = {
    "whoosh": cue_whoosh,
    "whoosh_down": cue_whoosh_down,
    "pop": cue_pop,
    "click": cue_click,
    "thud": cue_thud,
    "boom": cue_boom,
    "ding": cue_ding,
    "chime": cue_chime,
    "coin": cue_coin,
    "cash": cue_cash,
    "stamp": cue_stamp,
    "riser": cue_riser,
    "swell": cue_swell,
    "error": cue_error,
    "pageturn": cue_pageturn,
    "rumble": cue_rumble,
}


def load(name):
    """A real recording if one has been dropped in, else the synth."""
    path = os.path.join(ROOT, "public", "audio", "sfx", "%s.wav" % name)
    if os.path.exists(path):
        x, sr = sf.read(path, always_2d=False)
        if x.ndim > 1:
            x = x.mean(axis=1)
        if sr != SR:
            idx = np.linspace(0, len(x) - 1, int(len(x) * SR / sr))
            x = np.interp(idx, np.arange(len(x)), x)
        return x.astype(np.float32)
    if name not in CUES:
        raise SystemExit("unknown cue %r — one of: %s" % (name, ", ".join(sorted(CUES))))
    return CUES[name]().astype(np.float32)


def main():
    name = sys.argv[1] if len(sys.argv) > 1 else "texas"
    spec_path = os.path.join(ROOT, "src", "geo", name, "sfx.json")
    cues = json.load(open(spec_path))
    total = max(c[1] for c in cues) + 3.0
    track = np.zeros(int(total * SR), dtype=np.float32)

    cache = {}
    for entry in cues:
        kind, at = entry[0], float(entry[1])
        gain = float(entry[2]) if len(entry) > 2 else 1.0
        if kind not in cache:
            cache[kind] = load(kind)
        clip = cache[kind]
        s = int(at * SR)
        e = min(len(track), s + len(clip))
        if s >= len(track):
            continue
        track[s:e] += clip[: e - s] * gain

    peak = float(np.max(np.abs(track))) or 1.0
    track *= 0.72 / peak

    work = os.path.join(ROOT, ".tts")
    os.makedirs(work, exist_ok=True)
    wav = os.path.join(work, "geo-%s-sfx.wav" % name)
    sf.write(wav, track, SR)
    out_dir = os.path.join(ROOT, "public", "audio")
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, "geo-%s-sfx.mp3" % name)
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", wav,
         "-af", "loudnorm=I=-24:TP=-3:LRA=11", "-b:a", "192k", out],
        check=True,
    )
    used = sorted({c[0] for c in cues})
    print("wrote %s — %d cues over %.1fs (%.0f/min): %s"
          % (os.path.relpath(out, ROOT), len(cues), total, len(cues) / total * 60, ", ".join(used)))


if __name__ == "__main__":
    main()
