#!/usr/bin/env python3
"""
Soundtracks for the interactive Shorts (src/play/), synthesised from
scratch so there is nothing to license:

  beat   a 112.5 BPM song — kick on every stomp note, clap on every clap
         note, hats, a bass root and a plucked chord arpeggio — read from
         src/play/beat-pattern.json, the same file the picture uses
  race   an upbeat 96 BPM bed, count-in ticks, a GO whistle, and the
         slip / boing / eagle / fall / snore / fanfare effects on the
         frames in src/play/race-schedule.json

Output: public/audio/play-beat-mix.mp3, public/audio/play-race-mix.mp3

Usage:  python3 scripts/build-play-audio.py [beat|race|all]
Needs:  numpy, and ffmpeg — falls back to the one Remotion ships.
"""

import json, os, shutil, subprocess, sys, wave
import numpy as np

SR = 44100
FPS = 30
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "public", "audio")
FFMPEG = os.environ.get("FFMPEG") or shutil.which("ffmpeg") or os.path.join(
    ROOT, "node_modules", "@remotion", "compositor-linux-x64-gnu", "ffmpeg")

WHICH = (sys.argv[1] if len(sys.argv) > 1 else "all").lower()


# ── little synth kit ──────────────────────────────────────────────────
def t_arr(dur):
    return np.arange(int(dur * SR)) / SR


def norm(x, peak=0.9):
    m = np.max(np.abs(x)) or 1.0
    return (x / m * peak).astype(np.float32)


def env_exp(t, k):
    return np.exp(-t * k)


def kick(dur=0.32):
    t = t_arr(dur)
    f = 150 * np.exp(-t * 18) + 42
    ph = np.cumsum(2 * np.pi * f / SR)
    body = np.sin(ph) * env_exp(t, 9)
    click = np.random.default_rng(1).standard_normal(len(t)) * env_exp(t, 260) * 0.35
    return norm(body + click, 0.95)


def clap(dur=0.3):
    rng = np.random.default_rng(3)
    t = t_arr(dur)
    n = rng.standard_normal(len(t)).astype(np.float32)
    # band-pass-ish by differencing and smoothing
    n = n - np.convolve(n, np.ones(40, np.float32) / 40, mode="same")
    n = np.convolve(n, np.ones(3, np.float32) / 3, mode="same")
    env = np.zeros_like(t)
    for k, g in ((0.0, 1.0), (0.012, 0.8), (0.026, 0.65)):
        s = int(k * SR)
        env[s:] += g * env_exp(t[: len(t) - s], 55)
    return norm(n * env, 0.8)


def hat(dur=0.09):
    rng = np.random.default_rng(5)
    t = t_arr(dur)
    n = rng.standard_normal(len(t)).astype(np.float32)
    n = n - np.convolve(n, np.ones(6, np.float32) / 6, mode="same")
    return norm(n * env_exp(t, 60), 0.35)


def tick(freq=1800, dur=0.09):
    t = t_arr(dur)
    return norm(np.sin(2 * np.pi * freq * t) * env_exp(t, 50), 0.6)


def pluck(freq, dur=0.5):
    t = t_arr(dur)
    body = np.sin(2 * np.pi * freq * t) * env_exp(t, 6.5)
    bright = 0.35 * np.sin(2 * np.pi * freq * 3 * t) * env_exp(t, 16)
    return (body + bright).astype(np.float32)


def bass(freq, dur=0.5):
    t = t_arr(dur)
    x = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * freq * 2 * t)
    return (x * env_exp(t, 4) * 0.8).astype(np.float32)


def sweep(f0, f1, dur, curve=1.0):
    t = t_arr(dur)
    f = f0 + (f1 - f0) * (t / dur) ** curve
    ph = np.cumsum(2 * np.pi * f / SR)
    return np.sin(ph).astype(np.float32), t


def slide_down():
    sig, t = sweep(900, 260, 0.6, 0.8)
    return norm(sig * np.sin(np.pi * t / 0.6) ** 0.5, 0.55)


def boing():
    t = t_arr(0.45)
    f = 320 + 220 * np.sin(2 * np.pi * 9 * t) * env_exp(t, 6)
    ph = np.cumsum(2 * np.pi * f / SR)
    return norm(np.sin(ph) * env_exp(t, 7), 0.6)


def whistle_up():
    sig, t = sweep(600, 1500, 0.5, 1.0)
    return norm(sig * np.sin(np.pi * t / 0.5) ** 0.6, 0.6)


def fall_whistle():
    sig, t = sweep(1400, 300, 1.1, 1.2)
    return norm(sig * np.sin(np.pi * t / 1.1) ** 0.4, 0.5)


def screech():
    rng = np.random.default_rng(9)
    sig, t = sweep(2400, 1500, 0.55, 0.6)
    n = rng.standard_normal(len(t)).astype(np.float32) * 0.3
    return norm((sig + n) * np.sin(np.pi * t / 0.55) ** 0.7, 0.55)


def thud():
    t = t_arr(0.3)
    f = 120 * np.exp(-t * 20) + 50
    ph = np.cumsum(2 * np.pi * f / SR)
    return norm(np.sin(ph) * env_exp(t, 12), 0.7)


def snore():
    t = t_arr(0.7)
    x = np.sin(2 * np.pi * 110 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 28 * t))
    return norm(x * np.sin(np.pi * t / 0.7), 0.35)


def tada():
    notes = [523.25, 659.25, 783.99, 1046.5]
    out = np.zeros(int(2.2 * SR), np.float32)
    for i, f in enumerate(notes):
        seg = pluck(f, 1.6) * 0.8
        s = int(i * 0.1 * SR)
        out[s:s + len(seg)] += seg
    return norm(out, 0.7)


def cheer(dur=2.4):
    rng = np.random.default_rng(11)
    t = t_arr(dur)
    n = rng.standard_normal(len(t)).astype(np.float32)
    n = np.convolve(n, np.ones(12, np.float32) / 12, mode="same")
    env = np.sin(np.pi * t / dur) ** 0.8
    # a scatter of claps on top
    claps = np.zeros_like(n)
    c = clap()
    for k in range(38):
        s = int(rng.uniform(0.05, dur - 0.4) * SR)
        claps[s:s + len(c)] += c * rng.uniform(0.2, 0.6)
    return norm(n * env * 1.6 + claps, 0.55)


def place(track, clip, frame, gain=1.0):
    s = int(round(frame / FPS * SR))
    if s >= len(track):
        return
    e = min(s + len(clip), len(track))
    track[s:e] += clip[: e - s] * gain


def write(mix, name, sec):
    mix = np.tanh(mix * 1.05)
    mix = norm(mix, 0.891)
    stereo = np.stack([mix, mix], axis=1)
    pcm = (stereo * 32767).astype("<i2").tobytes()
    os.makedirs(OUT_DIR, exist_ok=True)
    raw = os.path.join(OUT_DIR, f".{name}.wav")
    with wave.open(raw, "w") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm)
    out = os.path.join(OUT_DIR, f"{name}.mp3")
    subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-i", raw,
                    "-c:a", "libmp3lame", "-b:a", "160k", out], check=True)
    os.remove(raw)
    print(f"wrote {out}  ({os.path.getsize(out) // 1024} KB, {sec:.1f}s)")


# chords: C  Am  F  G, as pluck frequencies
CHORDS = [
    [261.63, 329.63, 392.00, 523.25],
    [220.00, 261.63, 329.63, 440.00],
    [174.61, 220.00, 261.63, 349.23],
    [196.00, 246.94, 293.66, 392.00],
]


# ── the beat short ────────────────────────────────────────────────────
def build_beat():
    P = json.load(open(os.path.join(ROOT, "src", "play", "beat-pattern.json")))
    frames = P["duration"]
    total = int(frames / FPS * SR)
    sfx = np.zeros(total, np.float32)
    music = np.zeros(total, np.float32)
    B = P["beatFrames"]
    K, C, HH = kick(), clap(), hat()

    # count-in
    for i in range(4):
        place(sfx, tick(1400 if i < 3 else 1900), P["countFrom"] + i * B, 0.8)

    hits = []
    for b, bar in enumerate(P["bars"]):
        for i, ch in enumerate(bar):
            fr = P["firstHit"] + (b * 4 + i) * B
            if ch == "L":
                hits.append((fr, "L"))
                place(sfx, K, fr, 1.0)
            elif ch == "R":
                hits.append((fr, "R"))
                place(sfx, C, fr, 0.9)
    last = max(h[0] for h in hits)

    # the song underneath: hats on the offbeat, bass on the bar, plucks
    n_beats = (last - P["firstHit"]) // B + 1
    for k in range(n_beats):
        fr = P["firstHit"] + k * B
        bar = k // 4
        chord = CHORDS[bar % 4]
        place(music, HH, fr + B / 2, 0.5)
        if k % 4 == 0:
            place(music, bass(chord[0] / 2, 1.6), fr, 0.7)
        # arpeggio: one pluck per beat, a second on the offbeat
        place(music, pluck(chord[(k % 4)], 0.7), fr, 0.42)
        place(music, pluck(chord[(k + 2) % 4] * 2, 0.5), fr + B / 2, 0.22)

    # BRAVO: fanfare and applause
    place(sfx, tada(), P["bravoAt"], 0.8)
    place(sfx, cheer(), P["bravoAt"] + 4, 0.7)

    mix = 0.9 * sfx + 0.55 * music
    write(mix, "play-beat-mix", frames / FPS)


# ── the race short ────────────────────────────────────────────────────
def build_race():
    S = json.load(open(os.path.join(ROOT, "src", "play", "race-schedule.json")))
    E = S["events"]
    frames = S["duration"]
    total = int(frames / FPS * SR)
    sfx = np.zeros(total, np.float32)
    music = np.zeros(total, np.float32)
    K, C, HH = kick(), clap(), hat()

    # count-in and GO
    for i in range(3):
        place(sfx, tick(1400), S["countFrom"] + i * S["countBeat"], 0.8)
    place(sfx, whistle_up(), S["countFrom"] + 3 * S["countBeat"], 0.8)

    # 96 BPM bed from GO to the win
    beat = 60.0 / 96.0 * FPS
    fr = float(S["go"])
    k = 0
    while fr < E["win"] - 4:
        bar = k // 4
        chord = CHORDS[bar % 4]
        if k % 2 == 0:
            place(music, K, fr, 0.8)
        else:
            place(music, C, fr, 0.45)
        place(music, HH, fr + beat / 2, 0.45)
        if k % 4 == 0:
            place(music, bass(chord[0] / 2, 2.0), fr, 0.65)
        place(music, pluck(chord[k % 4], 0.6), fr, 0.36)
        place(music, pluck(chord[(k + 1) % 4] * 2, 0.4), fr + beat / 2, 0.2)
        fr += beat
        k += 1

    # the story beats
    place(sfx, slide_down(), E["rollerSlide"], 0.7)
    place(sfx, boing(), E["snatchedJump"], 0.7)
    place(sfx, slide_down(), E["slipperSlip"], 0.7)
    place(sfx, tick(900, 0.2), E["slipperSlip"] + 18, 0.5)
    place(sfx, slide_down(), E["winnerSlip"], 0.55)
    for key in ("snatchedLands", "winnerLands", "rollerLands", "slipperLands"):
        place(sfx, thud(), E[key], 0.6)
        place(sfx, tick(2200, 0.12), E[key] + 2, 0.35)
    place(sfx, screech(), E["eagleStart"] + 6, 0.7)
    place(sfx, screech(), E["eagleGrab"] + 4, 0.5)
    place(sfx, fall_whistle(), E["slipperOff"] + 10, 0.7)
    for i in range(3):
        place(sfx, snore(), E["rollerYawn"] - 20 + i * 24, 0.6)
    place(sfx, fall_whistle(), E["rollerOff"], 0.7)
    place(sfx, tada(), E["win"], 0.85)
    place(sfx, cheer(2.0), E["win"] + 6, 0.6)

    mix = 0.9 * sfx + 0.5 * music
    write(mix, "play-race-mix", frames / FPS)


if __name__ == "__main__":
    if not os.path.exists(FFMPEG):
        sys.exit(f"ffmpeg not found — set FFMPEG=/path/to/ffmpeg (tried {FFMPEG})")
    if WHICH in ("beat", "all"):
        build_beat()
    if WHICH in ("race", "all"):
        build_race()
