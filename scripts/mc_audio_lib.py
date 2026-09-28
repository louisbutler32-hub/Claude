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


def write_mp3(ff, mix, out_path, lufs=-14):
    peak = float(np.max(np.abs(mix)))
    if peak > 0.98:
        mix = mix * (0.98 / peak)
    tmp = out_path + ".f32"
    mix.astype(np.float32).tofile(tmp)
    subprocess.run([ff, "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", tmp,
                    "-af", f"loudnorm=I={lufs}:TP=-1.5:LRA=9", "-c:a", "libmp3lame", "-b:a", "192k", out_path], check=True)
    os.remove(tmp)


# ------------------------------------------------------------ synthesis kit
# Everything the Shorts synthesise rather than license. Lengths all go
# through N() so arrays that get multiplied together always agree.

def N(dur):
    return int(round(dur * SR))


def stereo(x):
    x = x.astype(np.float32)
    return np.stack([x, x], 1)


def band(n, center, width, seed):
    from numpy.fft import irfft, rfft, rfftfreq
    noise = np.random.default_rng(seed).standard_normal(n)
    spec = rfft(noise) * np.exp(-((rfftfreq(n, 1 / SR) - center) / width) ** 2)
    out = irfft(spec, n)
    return out / (np.max(np.abs(out)) + 1e-9)


def tone(freq, dur, harmonics=1, vib=0.0, vib_rate=5.5):
    """freq is a number or an array per sample; harmonics>1 gives a brassy saw-ish tone"""
    n = len(freq) if np.ndim(freq) else N(dur)
    t = np.arange(n) / SR
    f = np.broadcast_to(np.asarray(freq, dtype=float), (n,)) * (1 + vib * np.sin(2 * np.pi * vib_rate * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return sum(np.sin(ph * k) / k for k in range(1, harmonics + 1))


def env(n, attack, release):
    e = np.ones(n)
    a, r = int(attack * SR), int(release * SR)
    if a:
        e[:a] = np.linspace(0, 1, a)
    if r:
        e[-r:] *= np.linspace(1, 0, r)
    return e


def decay(n, rate):
    return np.exp(-np.arange(n) / SR * rate)


def thump(freq=55, dur=0.14):
    n = N(dur)
    return stereo(tone(np.linspace(freq * 1.6, freq, n), dur) * decay(n, 28))


def heartbeat():
    lub, dub = thump(58), thump(50) * 0.7
    out = np.zeros((N(0.5), 2), dtype=np.float32)
    out[:len(lub)] += lub
    i = N(0.18)
    out[i:i + len(dub)] += dub
    return out


def click(freq=3200, dur=0.012):
    n = N(dur)
    return stereo((tone(freq, dur) * 0.6 + band(n, 5000, 2000, int(freq)) * 0.4) * decay(n, 400))


def splash(seed=7):
    rng = np.random.default_rng(seed)
    n = N(0.9)
    body = band(n, 900, 1400, 11) * decay(n, 7) * 0.9
    for i in range(24):
        at = int(rng.uniform(0.02, 0.7) * SR)
        m = N(0.05)
        f0 = rng.uniform(1100, 3200)
        blip = tone(np.linspace(f0, f0 * 1.6, m), m / SR) * decay(m, 60) * rng.uniform(0.15, 0.4)
        body[at:at + m] += blip[:max(0, min(m, n - at))]
    return stereo(body)


def boing(base=170, top=420, dur=0.75, gain=1.0):
    n = N(dur)
    t = np.arange(n) / SR
    f = (base + (top - base) * (1 - np.exp(-t * 8))) * (1 + 0.3 * np.sin(2 * np.pi * 11 * t) * np.exp(-t * 4))
    return stereo(tone(f, dur, harmonics=2) * decay(n, 5) * env(n, 0.005, 0.1) * gain)


def vwoom():
    n = N(0.8)
    return stereo((tone(np.linspace(220, 55, n), 0.8, harmonics=3) * 0.7 + band(n, 300, 250, 5) * 0.4) * env(n, 0.03, 0.4))


def record_scratch():
    n = N(0.32)
    t = np.arange(n) / SR
    zig = tone(900 + 700 * np.sin(2 * np.pi * 7 * t), 0.32, harmonics=4) * 0.4
    return stereo((band(n, 1800, 1500, 21) * 0.8 + zig) * env(n, 0.005, 0.08))


def whistle(notes, fps=30):
    """notes: (hz, start_frame, len_frames) relative to the phrase start"""
    total = max(s + d for _, s, d in notes) / fps + 0.1
    out = np.zeros(int(total * SR))
    for hz, s, d in notes:
        n = N(d / fps)
        note = tone(hz, n / SR, vib=0.012, vib_rate=6) * env(n, 0.02, 0.05) + band(n, hz, 300, int(hz)) * 0.05
        i = int(s / fps * SR)
        out[i:i + n] += note
    return stereo(out)


def sad_trombone():
    notes = [(293.66, 0.42), (277.18, 0.42), (261.63, 0.42), (246.94, 1.4)]
    parts = []
    for i, (hz, d) in enumerate(notes):
        n = N(d)
        wah = env(n, 0.04, 0.12) * (0.75 + 0.25 * np.sin(np.linspace(0, np.pi, n)))
        parts.append(tone(hz, d, harmonics=7, vib=0.018 if i == 3 else 0.004, vib_rate=5) * wah)
    return stereo(np.concatenate(parts))


def shimmer():
    out = np.zeros(N(0.6))
    for i, hz in enumerate((1046.5, 1318.5, 1568.0, 2093.0)):
        n = N(0.3)
        s = int(i * 0.06 * SR)
        out[s:s + n] += tone(hz, 0.3) * decay(n, 9) * 0.5
    return stereo(out)


def footstep(seed):
    n = N(0.09)
    return stereo(band(n, 700, 500, seed) * decay(n, 45))
