#!/usr/bin/env python3
"""Soundtrack for the AKKI TALKS "Admirals make breakfast" short.

Effects: the real One Piece sounds, cut from the owner's own admiral clips
into .sfx/op/ (gitignored, third-party audio — never committed; see
.sfx/op/catalog.json for where each one came from). Bed: a light synthesised
canteen tune (plucked chords, brushed drums, walking bass) that ducks under
every big hit, cuts out for the admirals' glare, and leaves the crater
nearly silent.

Cue frames come from src/akki/breakfast/beats.json, the file the video
reads. Writes public/audio/akki-breakfast-mix.wav (WAV, so no encoder
padding shifts it off the picture).
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
B = json.load(open(os.path.join(ROOT, "src", "akki", "breakfast", "beats.json")))
FPS = B["fps"]
S = B["shots"]
sec = lambda f: f / FPS
DUR = sec(B["frames"])
OUT = os.path.join(ROOT, "public", "audio", "akki-breakfast-mix.wav")


def op(name):
    path = os.path.join(OP, name + ".wav")
    if not os.path.exists(path):
        sys.exit(f"missing .sfx/op/{name}.wav — cut the One Piece effects first (see .sfx/op/catalog.json)")
    return decode(FF, path)


# --------------------------------------------------------------- the bed

BPM = 120
BEAT = 60 / BPM
CHORDS = [(261.63, 329.63, 392.0), (220.0, 261.63, 329.63), (174.61, 220.0, 261.63), (196.0, 246.94, 293.66)]  # C Am F G


def pluck(hz, dur=0.35):
    n = N(dur)
    return tone(hz, dur, harmonics=4) * decay(n, 9) * env(n, 0.002, 0.05)


def bed(dur):
    n = N(dur)
    out = np.zeros(n)
    beats = int(dur / BEAT) + 1
    for b in range(beats):
        t0 = b * BEAT
        i = int(t0 * SR)
        chord = CHORDS[(b // 4) % 4]
        # offbeat strum
        for k, hz in enumerate(chord):
            s = pluck(hz * 2, 0.3) * 0.12
            j = i + int((BEAT / 2 + k * 0.012) * SR)
            out[j:j + len(s)] += s[:max(0, min(len(s), n - j))]
        # walking bass
        bass = pluck(chord[0] / 2 * (1, 1.25, 1.5, 1.335)[b % 4], 0.4) * 0.35
        out[i:i + len(bass)] += bass[:max(0, min(len(bass), n - i))]
        # brushed kick/snare
        m = N(0.12)
        if b % 2 == 0:
            k = np.sin(2 * np.pi * np.cumsum(55 + 80 * np.exp(-np.arange(m) / SR * 40)) / SR) * decay(m, 30) * 0.5
        else:
            k = band(m, 2500, 1500, b) * decay(m, 25) * 0.18
        out[i:i + m] += k[:max(0, min(m, n - i))]
    return out


if __name__ == "__main__":
    mix = np.zeros((N(DUR + 0.5), 2), dtype=np.float32)
    duck = np.ones(len(mix))

    def hit(name, f, gain=1.0, dk=0.25, hold=0.6):
        clip = op(name)
        place(mix, clip, sec(f), gain)
        i = int(sec(f) * SR)
        j = min(len(duck), i + int(hold * SR))
        duck[i:j] = np.minimum(duck[i:j], dk)

    # order → Akainu
    hit("akainu_magma_ignite", B["ignite"], 0.9, 0.35, 1.0)
    hit("akainu_magma_fist", B["punch"] - 6, 0.9, 0.3, 0.6)
    hit("akainu_eruption", B["punch"], 1.0, 0.15, 1.4)
    hit("impact_heavy_01", B["flash1"][0], 0.8)
    # Kuzan
    hit("kuzan_freeze_charge", B["breath"] - 4, 0.8, 0.4, 0.8)
    hit("kuzan_ice_age", B["freeze"], 1.0, 0.15, 1.6)
    hit("kuzan_ice_impact", S["frozen"][0], 0.7, 0.3, 0.5)
    # Kizaru
    hit("kizaru_teleport_01", B["glint"] - 2, 0.8, 0.4, 0.6)
    hit("kizaru_light_charge", B["charge"], 0.7, 0.4, 0.8)
    hit("kizaru_beam_02", B["fire"], 1.0, 0.2, 0.8)
    hit("explosion_01", B["boom"], 1.0, 0.1, 1.6)
    # the golden slice, the snatch
    sparkle = stereo(sum(tone(hz, 0.5) * decay(N(0.5), 6) for hz in (1568, 2093, 2637)) * 0.15)
    place(mix, sparkle, sec(B["land"] - 8), 1.0)
    place(mix, sparkle, sec(B["land"]), 0.8)
    hit("whoosh_01", B["grab"] - 6, 0.9, 0.4, 0.4)
    place(mix, boing(150, 420, 0.5, 0.8), sec(B["grab"]), 0.6)
    hit("punch_01", B["grab"] + 8, 0.5, 0.5, 0.2)
    # the glare: bed out, rumble in
    duck[int(sec(S["glare"][0]) * SR):int(sec(S["triple"][0]) * SR)] = 0.0
    hit("haki_rumble", B["rumble"] - 2, 1.0, 0.0, 0.0)
    # the triple attack
    hit("akainu_magma_rise", B["attack"], 0.6, 0.0, 0.0)
    hit("kuzan_freeze_03", B["attack"] + 2, 0.55, 0.0, 0.0)
    hit("kizaru_beam_01", B["attack"] + 4, 0.7, 0.0, 0.0)
    hit("explosion_06", B["flash3"][0], 1.0, 0.0, 0.0)
    hit("explosion_05", B["flash3"][1], 0.8, 0.0, 0.0)
    # the crater: bed gone, the blast tails sink away, then one sad pluck
    duck[int(sec(S["triple"][0]) * SR):] = 0.0
    a, b2 = int(sec(S["crater"][0] + 6) * SR), int(sec(S["crater"][0] + 20) * SR)
    mix[a:b2] *= np.linspace(1, 0.12, b2 - a)[:, None]
    mix[b2:] *= 0.12
    for k, hz in enumerate((392.0, 369.99, 349.23, 329.63)):
        place(mix, stereo(pluck(hz, 0.6) * 0.5), sec(S["crater"][0] + 4 + k * 6), 0.8)

    # bed under everything, ducked; smooth the duck envelope so it breathes
    b = bed(DUR + 0.5)[: len(mix)]
    k = N(0.08)
    sm = np.convolve(duck, np.ones(k) / k, mode="same")
    mix += stereo(b * sm * 0.9)[: len(mix)]

    mix = mix[: N(DUR)]
    peak = float(np.max(np.abs(mix)))
    if peak > 0.98:
        mix *= 0.98 / peak
    tmp = OUT + ".f32"
    mix.astype(np.float32).tofile(tmp)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    # one fixed gain to -14 LUFS (measured), then a brickwall limiter for the
    # peaks — no dynamic normalising, so the quiet crater stays quiet
    raw = ["-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", tmp]
    meas = subprocess.run([FF, "-hide_banner", *raw, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    li = float([l for l in meas.splitlines() if l.strip().startswith("I:")][-1].split()[1])
    gain = -14.0 - li
    subprocess.run([FF, "-v", "error", "-y", *raw, "-af", f"volume={gain:.2f}dB,alimiter=limit=0.85:attack=2:release=60:level=false",
                    "-ar", "48000", "-c:a", "pcm_s16le", OUT], check=True)
    print(f"measured {li:.1f} LUFS, applied {gain:+.1f} dB")
    os.remove(tmp)
    print("wrote", os.path.relpath(OUT, ROOT), f"({DUR:.2f}s)")
