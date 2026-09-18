"""Shared helpers for the Minecraft Shorts' audio builders.

Reads/decodes with ffmpeg, mixes clips onto a sample-accurate numpy buffer,
and synthesises the two effects every build script reaches for: a rising
hiss and a boom (both are numpy, so nothing here needs licensing).
"""
import os, subprocess
import numpy as np

SR = 44100


def decode(ff, path, filters=None):
    cmd = [ff, "-v", "error", "-i", path] + (["-af", filters] if filters else []) + ["-f", "f32le", "-ac", "2", "-ar", str(SR), "-"]
    raw = subprocess.run(cmd, check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


def place(mix, clip, t, gain=1.0):
    i = int(t * SR)
    n = min(len(clip), len(mix) - i)
    if n > 0:
        mix[i:i + n] += clip[:n] * gain


def fade(clip, a, b):
    c = clip.copy()
    na, nb = int(a * SR), int(b * SR)
    if na:
        c[:na] *= np.linspace(0, 1, na)[:, None]
    if nb:
        c[-nb:] *= np.linspace(1, 0, nb)[:, None]
    return c


def hiss(dur=1.0, center=3200, seed=3):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    noise = np.random.default_rng(seed).standard_normal(n).astype(np.float32)
    env = (t ** 2.2) * 0.9
    from numpy.fft import rfft, irfft
    spec = rfft(noise)
    freqs = np.fft.rfftfreq(n, 1 / SR)
    spec *= np.exp(-((freqs - center) / 1800) ** 2)
    band = irfft(spec, n).astype(np.float32)
    band /= np.max(np.abs(band))
    return np.stack([band * env, band * env], 1)


def boom(dur=1.4, seed=5):
    n = int(dur * SR)
    t = np.linspace(0, dur, n)
    f0 = 140 * np.exp(-t * 3) + 32
    ph = np.cumsum(2 * np.pi * f0 / SR)
    body = np.sin(ph) * np.exp(-t * 2.8)
    crack = np.random.default_rng(seed).standard_normal(n).astype(np.float32) * np.exp(-t * 18)
    s = (body * 0.9 + crack * 0.5).astype(np.float32)
    s /= np.max(np.abs(s))
    return np.stack([s, s], 1)


def whoosh(dur=0.5, seed=9):
    """a short rising sweep, for a fireball or a dash"""
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    noise = np.random.default_rng(seed).standard_normal(n).astype(np.float32)
    from numpy.fft import rfft, irfft
    spec = rfft(noise)
    freqs = np.fft.rfftfreq(n, 1 / SR)
    center = 400 + t.mean() * 2000
    spec *= np.exp(-((freqs - center) / 900) ** 2)
    band = irfft(spec, n).astype(np.float32)
    band /= np.max(np.abs(band)) + 1e-9
    env = np.sin(np.pi * t) ** 0.7
    return np.stack([band * env, band * env], 1)


def write_mp3(ff, mix, out_path):
    peak = float(np.max(np.abs(mix)))
    if peak > 0.98:
        mix = mix * (0.98 / peak)
    tmp = out_path + ".f32"
    mix.astype(np.float32).tofile(tmp)
    subprocess.run([ff, "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", tmp,
                    "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-c:a", "libmp3lame", "-b:a", "192k", out_path], check=True)
    os.remove(tmp)
