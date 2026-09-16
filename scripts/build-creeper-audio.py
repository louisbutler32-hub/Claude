#!/usr/bin/env python3
"""Soundtrack for the creeper Short: Run Amok under the chase, Sneaky Snitch
under the creeper's side, and a synthesised hiss + boom at each explosion.
Reads public/audio/src/{run-amok,sneaky-snitch}.mp3, writes public/audio/creeper-mix.mp3.
"""
import os, subprocess, sys, numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "audio", "src")
OUT = os.path.join(ROOT, "public", "audio", "creeper-mix.mp3")
FF = os.environ.get("FFMPEG", "ffmpeg")
SR, FPS, FRAMES = 44100, 30, 390

def decode(path, filters=None):
    cmd = [FF, "-v", "error", "-i", path] + (["-af", filters] if filters else []) + ["-f", "f32le", "-ac", "2", "-ar", str(SR), "-"]
    return np.frombuffer(subprocess.run(cmd, check=True, capture_output=True).stdout, dtype=np.float32).reshape(-1, 2).copy()

sec = lambda f: f / FPS

def place(mix, clip, t, gain=1.0):
    i = int(t * SR); n = min(len(clip), len(mix) - i)
    if n > 0: mix[i:i + n] += clip[:n] * gain

def fade(clip, a, b):
    c = clip.copy(); na, nb = int(a * SR), int(b * SR)
    if na: c[:na] *= np.linspace(0, 1, na)[:, None]
    if nb: c[-nb:] *= np.linspace(1, 0, nb)[:, None]
    return c

def hiss(dur=1.0):
    n = int(dur * SR); t = np.linspace(0, 1, n)
    noise = np.random.default_rng(3).standard_normal(n).astype(np.float32)
    env = (t ** 2.2) * 0.9
    # a rising band-passed hiss
    from numpy.fft import rfft, irfft
    spec = rfft(noise); freqs = np.fft.rfftfreq(n, 1 / SR)
    spec *= np.exp(-((freqs - 3200) / 1800) ** 2)
    band = irfft(spec, n).astype(np.float32); band /= np.max(np.abs(band))
    return np.stack([band * env, band * env], 1)

def boom(dur=1.4):
    n = int(dur * SR); t = np.linspace(0, dur, n)
    f0 = 140 * np.exp(-t * 3) + 32
    ph = np.cumsum(2 * np.pi * f0 / SR)
    body = np.sin(ph) * np.exp(-t * 2.8)
    crack = np.random.default_rng(5).standard_normal(n).astype(np.float32) * np.exp(-t * 18)
    s = (body * 0.9 + crack * 0.5).astype(np.float32); s /= np.max(np.abs(s))
    return np.stack([s, s], 1)

if __name__ == "__main__":
    for name in ("run-amok.mp3", "sneaky-snitch.mp3"):
        if not os.path.exists(os.path.join(SRC, name)): sys.exit("missing " + name)
    mix = np.zeros((int(sec(FRAMES) * SR), 2), dtype=np.float32)
    amok = decode(os.path.join(SRC, "run-amok.mp3"))
    snitch = decode(os.path.join(SRC, "sneaky-snitch.mp3"))
    MUSIC = 0.5
    you = (sec(0), sec(165)); creeper = (sec(165), sec(390))
    seg = lambda src, t0, t1, off: fade(src[int(off * SR):int(off * SR) + int((t1 - t0) * SR)], 0.15, 0.4)
    place(mix, seg(amok, *you, 0.0), you[0], MUSIC)
    place(mix, seg(snitch, *creeper, 0.0), creeper[0], MUSIC * 0.9)
    # music ducks out at each boom
    for b in (126, 165 + 205):
        i = int(sec(b) * SR); d = min(int(1.2 * SR), len(mix) - i)
        mix[i:i + d] *= np.linspace(0.25, 1, d)[:, None]
    h = fade(hiss(1.0), 0.02, 0.02); bm = fade(boom(1.4), 0.002, 0.3)
    place(mix, h, sec(96), 0.7); place(mix, bm, sec(126), 1.0)
    place(mix, h, sec(165 + 100) , 0.5); place(mix, h, sec(165 + 150), 0.6); place(mix, bm, sec(165 + 205), 1.0)
    peak = float(np.max(np.abs(mix)))
    if peak > 0.98: mix *= 0.98 / peak
    tmp = OUT + ".f32"; mix.astype(np.float32).tofile(tmp)
    subprocess.run([FF, "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", tmp, "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-c:a", "libmp3lame", "-b:a", "192k", OUT], check=True)
    os.remove(tmp); print("wrote", os.path.relpath(OUT, ROOT))
