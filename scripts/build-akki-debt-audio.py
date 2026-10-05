#!/usr/bin/env python3
"""Soundtrack for the AKKI TALKS "This Is Ronan's Biggest Fear" short (15 s, 24 fps). SPARSE.

Silence / low drone to the turn; ONE dramatic sting on the Sea King, a sword cut on the slash flash,
terror + alert stings on the turn and the receipt (counter ticks), a thump on the drain; Yakety Sax
from the chase (frame 156), stopped dead on the Boss's point and back on the grab, stopped again on
"Your turn."; synthesised bells on Ronan's footsteps, a quiet tick on every bubble pop, a ka-ching on
the 10% pouch. Licensed cuts (.sfx/op100/, gitignored): 027, 019, 070, 097, 037, 095 only.
Cue frames come from src/akki/debt/beats.json. Writes public/audio/akki-debt-mix.wav
(48 kHz stereo, -14 LUFS, limit 0.7).

  python3 scripts/build-akki-debt-audio.py [--no-music]
"""
import glob
import json
import os
import subprocess
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mc_audio_lib import SR, N, band, decay, decode, env, place, stereo, thump, tone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FF = os.environ.get("FFMPEG", "ffmpeg")
B = json.load(open(os.path.join(ROOT, "src", "akki", "debt", "beats.json")))
FPS = B["fps"]
S = B["shots"]
sec = lambda f: f / FPS
DUR = sec(B["frames"])
ARGS = sys.argv[1:]
MUSIC = "--no-music" not in ARGS
OUT = os.path.join(ROOT, "public", "audio", "akki-debt-mix.wav" if MUSIC else "akki-debt-nomusic.wav")

# Yakety Sax: ~123 bpm, riff onsets measured at 2.07 s + n * 60/123.05 s. Starting the track at the first
# onset puts a riff beat exactly on the chase's first frame (B["music"]); later beats land on 226 (the
# point), ~250 (the drag) and ~273 (the pouch) to within a frame or three.
YAK_BEAT = 60 / 123.05
YAK_ONSET = 2.07


def op(prefix):
    hits = sorted(glob.glob(os.path.join(ROOT, ".sfx", "op100", prefix + "*.wav")))
    if not hits:
        sys.exit(f"missing .sfx/op100/{prefix}*.wav - cut the One Piece effects first (see .sfx/op100/INDEX.md)")
    return decode(FF, hits[0])


def onset(clip, frac=0.2):
    m = np.abs(clip).max(1)
    return int(np.argmax(m > frac * m.max())) / SR


def peak_t(clip):
    return int(np.argmax(np.abs(clip).max(1))) / SR


# ------------------------------------------------------------ synthesised bits

def drone(dur):
    """a low, slowly breathing storm drone: two sines a fifth apart under filtered wind"""
    n = N(dur)
    t = np.arange(n) / SR
    swell = 0.6 + 0.4 * np.sin(2 * np.pi * t / 3.1 - 1.0)
    hum = (np.sin(2 * np.pi * 55 * t) * 0.55 + np.sin(2 * np.pi * 82.4 * t + 0.5 * np.sin(2 * np.pi * 0.35 * t)) * 0.3 + np.sin(2 * np.pi * 110 * t) * 0.1) * swell
    wind = band(n, 420, 360, 12) * (0.5 + 0.5 * np.sin(2 * np.pi * t / 2.3 + 0.7)) * 0.35
    sea = band(n, 160, 120, 3) * (0.6 + 0.4 * np.sin(2 * np.pi * t / 1.7)) * 0.3
    return stereo((hum + wind + sea) * 0.5)


def tick(i, k):
    """the receipt counter: a dry mechanical click, rising a little with each frame"""
    n = N(0.05)
    s = band(n, 2600 + 90 * i, 1500, 40 + i) * decay(n, 70) * 0.9 + tone(900 + 55 * i, 0.05) * decay(n, 90) * 0.5
    return stereo(s * env(n, 0.0005, 0.01) * (0.55 + 0.4 * k))


def ting(hz=3136, dur=0.5, g=0.22):
    n = N(dur)
    return stereo((tone(hz, dur) + 0.5 * tone(hz * 1.5, dur)) * decay(n, 8) * env(n, 0.001, 0.08) * g)


def kaching():
    """cash-register: a drawer thunk, then a double bell"""
    n = N(1.0)
    out = np.zeros(n)
    m = N(0.12)
    out[:m] += band(m, 700, 500, 21) * decay(m, 40) * 0.6 + tone(np.linspace(220, 90, m), 0.12) * decay(m, 30) * 0.5
    for off, hz in ((0.06, 2349), (0.16, 3136)):
        k = N(0.85)
        i = int(off * SR)
        bell = (tone(hz, 0.85) + 0.6 * tone(hz * 2.76, 0.85) + 0.3 * tone(hz * 5.4, 0.85)) * decay(k, 6.5) * env(k, 0.001, 0.2)
        out[i:i + k] += bell[: n - i] * 0.3
    return stereo(out)


def coin(hz=2637):
    n = N(0.35)
    return stereo((tone(hz, 0.35) + 0.6 * tone(hz * 1.335, 0.35)) * decay(n, 15) * env(n, 0.001, 0.05) * 0.22)


def spin_whir(dur):
    """the counter winding up: a rising ratchet of clicks under a rising whine"""
    n = N(dur)
    t = np.linspace(0, 1, n)
    whine = tone(300 + 1500 * t ** 1.6, dur) * 0.12 * (0.3 + 0.7 * t)
    return stereo(whine * env(n, 0.01, 0.05))



def jingle(amp=1.0, seed=0):
    """three small brass bells: a short cluster of inharmonic pings"""
    n = N(0.45)
    out = np.zeros(n)
    for k, hz in enumerate((3520, 4186, 3135)):
        i = int(k * 0.012 * SR)
        m = n - i
        out[i:] += (tone(hz + 40 * seed, 0.45)[:m] + 0.5 * tone(hz * 2.4, 0.45)[:m]) * decay(m, 14) * env(m, 0.0006, 0.05) * 0.18
    return stereo(out * amp)


def bubble_tick():
    n = N(0.04)
    return stereo(band(n, 1800, 900, 5) * decay(n, 120) * env(n, 0.0005, 0.01) * 0.5)


def low_drone(dur):
    n = N(dur)
    t = np.arange(n) / SR
    return stereo((np.sin(2 * np.pi * 55 * t) * 0.5 + np.sin(2 * np.pi * 82.4 * t) * 0.25) * (0.6 + 0.4 * np.sin(2 * np.pi * t / 3.1)) * 0.5)


if __name__ == "__main__":
    mix = np.zeros((N(DUR + 0.5), 2), dtype=np.float32)
    duck = np.ones(len(mix))

    def dk(t0, hold, lvl):
        i = int(t0 * SR)
        j = min(len(duck), i + int(hold * SR))
        duck[i:j] = np.minimum(duck[i:j], lvl)

    def hit(prefix, frame, gain=1.0, lvl=0.35, hold=0.6, align="onset", trim=None, tail=0.0):
        clip = op(prefix)
        if trim:
            clip = clip[: int(trim * SR)].copy()
            fo = int(min(tail or 0.15, trim) * SR)
            clip[-fo:] *= np.linspace(1, 0, fo)[:, None]
        a = onset(clip) if align == "onset" else peak_t(clip)
        place(mix, clip, max(0.0, sec(frame) - a), gain)
        dk(sec(frame) - 0.05, hold, lvl)

    sil = sec(B["silenceFrom"])
    d = drone(sil)
    d *= env(len(d), 0.15, 0.35)[:, None]
    place(mix, d, 0.0, 0.7)
    hit("027", B["reveal"], 1.0, 0.3, 1.6, align="peak", trim=2.0, tail=0.4)   # Sea King
    hit("019", B["slash"], 1.0, 0.3, 0.7, align="peak")                         # the cut
    hit("070", B["turn"], 1.0, 0.0, 1.0, trim=2.2, tail=0.5)                    # the turn
    hit("097", B["receiptHit"], 0.9, 0.0, 0.8, trim=1.0, tail=0.2)              # the receipt
    t0, t1 = B["tick"]
    for i, f in enumerate(range(t0, t1 + 1)):
        place(mix, tick(i, i / (t1 - t0)), sec(f), 0.8)
    place(mix, spin_whir(sec(t1 - t0)), sec(t0), 0.8)
    place(mix, ting(3136, 0.6, 0.2), sec(B["stamp"]), 0.8)
    place(mix, thump(52, 0.5), sec(B["drain"]), 1.1)
    hit("037", B["pointHit"], 1.5, 0.25, 0.75, trim=1.5, tail=0.4)              # the betrayal
    hit("095", B["grabHit"], 1.0, 0.3, 0.5, trim=0.6, tail=0.15)                # the grab
    dk(sec(B["pouch"]), 0.9, 0.4)
    place(mix, kaching(), sec(B["kaching"][0]), 1.0)
    for f in B["kaching"][1:]:
        place(mix, coin(2500 + 120 * (f % 3)), sec(f), 0.8)
    # bells on Ronan's footsteps (quiet), a tick on each bubble pop
    for key, g in (("stroll", 0.5), ("run", 0.32), ("drag", 0.55)):
        for i, f in enumerate(B["bells"][key]):
            place(mix, jingle(1.0, i % 3), sec(f), g)
    for f in B["bubbles"]:
        place(mix, bubble_tick(), sec(f), 0.35)
    # after "Your turn.": the sax is gone, a low drone and one thump
    place(mix, low_drone(DUR - sec(B["saxStop"])) * env(N(DUR - sec(B["saxStop"])), 0.3, 0.05)[:, None], sec(B["saxStop"]), 0.5)
    place(mix, thump(48, 0.5), sec(B["yourTurn"]), 0.8)

    if MUSIC:
        path = os.path.join(ROOT, "public", "audio", "src", "yakety-sax.mp3")
        if os.path.exists(path):
            song = decode(FF, path)
            i0 = int(YAK_ONSET * SR)
            j = int(sec(B["music"]) * SR)
            seg = song[i0:i0 + len(mix) - j].copy()
            k = N(0.01)
            seg[:k] *= np.linspace(0, 1, k)[:, None]
            # gates: dead stop on the point (back on the grab), stop for good on "Your turn."
            gate = np.ones(len(mix))
            a, b = int(sec(B["pointHit"]) * SR), int(sec(B["sax_back"]) * SR)
            gate[a:b] = 0
            fi = N(0.04)
            gate[b:b + fi] = np.linspace(0, 1, fi)
            c = int(sec(B["saxStop"]) * SR)
            fo = N(0.12)
            gate[c:c + fo] = np.linspace(1, 0, fo)
            gate[c + fo:] = 0
            smooth_k = N(0.08)
            gm = np.convolve(duck, np.ones(smooth_k) / smooth_k, mode="same") * gate
            L = min(len(seg), len(mix) - j)
            mix[j:j + L] += seg[:L] * np.clip(gm[j:j + L], 0.0, 1.0)[:, None] * 1.7
        else:
            print("note: public/audio/src/yakety-sax.mp3 is missing - mixing without the music")

    mix = mix[: N(DUR)]
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
    subprocess.run([FF, "-v", "error", "-y", *raw, "-af", f"volume={gain:.2f}dB,alimiter=limit=0.7:attack=2:release=60:level=false",
                    "-ar", "48000", "-c:a", "pcm_s16le", OUT], check=True)
    print(f"measured {li:.1f} LUFS, applied {gain:+.1f} dB")
    os.remove(tmp)
    print("wrote", os.path.relpath(OUT, ROOT), f"({DUR:.2f}s)")
