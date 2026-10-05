#!/usr/bin/env python3
"""Soundtrack for "He just wanted a friend" (src/minecraft-friend/FriendShort.tsx).

All original and synthesised (numpy), so nothing here needs a licence: a playful pluck
tune while the zombie walks up, a hush after the first blow, sad piano while he is
turned away, a music-box lullaby for the nights, a rising drone while the skeleton
draws his bow, silence for a beat when the arrow lands, then sad strings and a warm
C-major resolve on "YES". Frame numbers match the video (30 fps).

  --music none   effects and voices only

Writes public/audio/friend-mix.mp3 (or friend-sfx.mp3).
"""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mc_audio_lib import SR, N, band, boing, decay, env, fade, footstep, place, shimmer, stereo, thump, tone, whoosh, write_mp3

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FF = os.environ.get("FFMPEG", "ffmpeg")
FRAMES = 600
FPS = 30
sec = lambda f: f / FPS
NO_MUSIC = "--music" in sys.argv and sys.argv[sys.argv.index("--music") + 1] == "none"
OUT = os.path.join(ROOT, "public", "audio", "friend-sfx.mp3" if NO_MUSIC else "friend-mix.mp3")
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)

# ---------------------------------------------------------------- instruments

def piano(freq, dur=1.6, vel=1.0, slow=1.0):
    n = N(dur)
    t = np.arange(n) / SR
    out = sum(a * np.sin(2 * np.pi * freq * h * t) * np.exp(-(1.6 + 1.1 * h) * slow * t) for h, a in ((1, 1.0), (2, 0.5), (3, 0.26), (4, 0.13), (5, 0.07)))
    return stereo(out * env(n, 0.004, 0.2) * 0.5 * vel)


def pluck(freq, dur=0.35, vel=1.0):
    n = N(dur)
    t = np.arange(n) / SR
    out = sum(a * np.sin(2 * np.pi * freq * h * t) * np.exp(-(7 + 4 * h) * t) for h, a in ((1, 1.0), (2, 0.5), (3, 0.25)))
    return stereo(out * env(n, 0.002, 0.05) * 0.5 * vel)


def bass(freq, dur=0.3, vel=1.0):
    n = N(dur)
    return stereo(tone(freq, dur, harmonics=3) * decay(n, 7) * env(n, 0.004, 0.06) * 0.6 * vel)


def musicbox(freq, dur=1.2, vel=1.0):
    n = N(dur)
    t = np.arange(n) / SR
    out = np.sin(2 * np.pi * freq * t) * np.exp(-3.2 * t) + 0.4 * np.sin(2 * np.pi * freq * 2.01 * t) * np.exp(-6 * t) + 0.2 * np.sin(2 * np.pi * freq * 4.1 * t) * np.exp(-11 * t)
    return stereo(out * env(n, 0.002, 0.15) * 0.45 * vel)


def pad(freqs, dur, gain=0.2, attack=0.5, release=0.7):
    n = N(dur)
    out = sum(tone(f, dur, harmonics=3, vib=0.004, vib_rate=4.6) for f in freqs) / max(1, len(freqs))
    return stereo(out * env(n, attack, release) * gain)


def blip(f0, f1, dur=0.18, vib=0.0, gain=0.4, harm=3):
    n = N(dur)
    return stereo(tone(np.linspace(f0, f1, n), dur, harmonics=harm, vib=vib, vib_rate=11) * env(n, 0.01, dur * 0.4) * gain)


def scream(dur=0.6, gain=0.5):
    n = N(dur)
    f = 520 + 320 * np.sin(np.linspace(0, np.pi, n)) ** 0.7
    v = tone(f, dur, harmonics=6, vib=0.035, vib_rate=11) * 0.6 + band(n, 1800, 900, 4) * 0.25
    return stereo(v * env(n, 0.02, 0.18) * gain)


def pop(f0=700, f1=1500, dur=0.08, gain=0.3):
    n = N(dur)
    return stereo(tone(np.linspace(f0, f1, n), dur) * decay(n, 30) * env(n, 0.002, 0.03) * gain)


def crack(gain=0.6):
    n = N(0.14)
    return stereo((band(n, 2400, 1800, 31) * 0.9 + tone(np.linspace(420, 120, n), 0.14, harmonics=2) * 0.5) * decay(n, 34) * gain)


def thunk(gain=1.0):
    n = N(0.5)
    low = tone(np.linspace(110, 48, n), 0.5, harmonics=2) * decay(n, 9)
    wood = band(n, 900, 500, 8) * decay(n, 26) * 0.7
    return stereo((low * 0.9 + wood) * env(n, 0.002, 0.1) * gain)


def click(seed, gain=0.3):
    n = N(0.05)
    return stereo(band(n, 2600, 1400, seed) * decay(n, 60) * gain)


def sweep(dur, c0, c1, seed=2, gain=0.3):
    n = N(dur)
    out = np.zeros(n)
    for k in range(8):
        c = c0 + (c1 - c0) * k / 7
        out += band(n, c, 500, seed + k) * np.sin(np.linspace(0, np.pi, n)) ** 2 * 0.15
    return stereo(out * gain)


def mix_add(mix, clip, f, gain=1.0):
    place(mix, clip, sec(f), gain)


# ---------------------------------------------------------------------- build
if __name__ == "__main__":
    total = sec(FRAMES)
    mix = np.zeros((int(total * SR) + SR, 2), dtype=np.float32)

    # ---------- the voices and effects (always on) ----------
    for i, f in enumerate(range(3, 62, 8)):
        mix_add(mix, footstep(i), f, 0.18)                       # the zombie shuffles up
    mix_add(mix, blip(400, 620, 0.17, gain=0.4), 54)              # "hi!"
    mix_add(mix, scream(0.55, 0.55), 58)                          # Steve: AAAH
    for i, f in enumerate(range(62, 80, 4)):
        mix_add(mix, footstep(20 + i), f, 0.3)
    mix_add(mix, sweep(0.14, 600, 3200, 3, 0.9), 74)              # sword whoosh
    # blow one
    mix_add(mix, thump(60, 0.4) * 1.7, 80)
    mix_add(mix, crack(0.8), 80)
    mix_add(mix, whoosh(0.45, 6), 83, 0.5)                        # flung back
    mix_add(mix, blip(900, 220, 0.55, vib=0.02, gain=0.3), 83)    # "wheeee"
    mix_add(mix, thump(45, 0.3) * 1.4, 103)                       # lands
    mix_add(mix, blip(340, 250, 0.3, vib=0.03, gain=0.35), 108)   # "ow..."
    mix_add(mix, boing(230, 520, 0.4, 0.7), 128, 0.35)            # sits up
    mix_add(mix, pop(), 148, 1.0)                                 # picks the flower
    mix_add(mix, blip(500, 760, 0.18, gain=0.3), 156)             # hopeful "heh"
    # blow two
    mix_add(mix, scream(0.3, 0.45), 169)
    mix_add(mix, sweep(0.12, 600, 3000, 5, 0.9), 171)
    mix_add(mix, thump(60, 0.4) * 1.5, 176)
    mix_add(mix, crack(0.7), 176)
    mix_add(mix, whoosh(0.4, 9), 178, 0.35)
    for k, f in enumerate((186, 204)):
        mix_add(mix, blip(380, 290, 0.5, vib=0.04, gain=0.3), f)  # the whimper
    mix_add(mix, pop(1800, 900, 0.14, 0.25), 190)                 # a tear
    # night two
    mix_add(mix, whoosh(0.6, 12), 226, 0.25)
    mix_add(mix, whoosh(0.45, 14), 262, 0.4)                      # the apple is thrown
    mix_add(mix, footstep(40) * 1.6, 284, 0.5)
    mix_add(mix, pop(1000, 1000, 0.1, 0.25), 284)
    mix_add(mix, whoosh(0.5, 16), 310, 0.25)                      # night three
    # the skeleton
    for i, f in enumerate(range(336, 358, 3)):
        mix_add(mix, click(50 + i, 0.35), f)                      # rattle
    mix_add(mix, sweep(0.7, 700, 1900, 9, 0.35), 338)             # the bow creaks
    mix_add(mix, blip(300, 160, 0.35, gain=0.35, harm=4), 358)    # the string
    mix_add(mix, whoosh(0.3, 17), 359, 0.5)                       # the arrow
    mix_add(mix, whoosh(0.75, 18), 345, 0.55)                     # the zombie's dash
    for i, f in enumerate(range(347, 367, 3)):
        mix_add(mix, footstep(70 + i), f, 0.3)
    mix_add(mix, thunk(1.2), 368)
    mix_add(mix, pop(160, 90, 0.2, 0.5), 368)
    mix_add(mix, blip(400, 520, 0.2, gain=0.35), 373)             # Steve: huh?
    mix_add(mix, sweep(0.25, 1500, 2500, 21, 0.5), 372)           # a gasp
    for i, f in enumerate(range(384, 424, 2)):
        mix_add(mix, click(90 + i, 0.18 * (1 - (f - 384) / 44)), f)  # the skeleton clatters away
    mix_add(mix, footstep(5) * 1.6, 398, 0.4)                     # he drops to his knees
    # the plea, the sobs, the yes
    mix_add(mix, blip(330, 420, 0.3, vib=0.05, gain=0.25), 446)   # "...friends?"
    for f in (434, 452, 464):
        mix_add(mix, blip(440, 480, 0.1, gain=0.22), f)
    # the apple and the cure
    mix_add(mix, click(120, 0.5), 506)
    mix_add(mix, click(121, 0.5), 509)
    mix_add(mix, shimmer() * 1.5, 509, 0.7)
    mix_add(mix, blip(400, 1700, 0.55, gain=0.22, harm=2), 510)   # glissando
    mix_add(mix, pop(1400, 2200, 0.1, 0.2), 516)                  # the arrow drops out
    for i, f in enumerate(range(526, 580, 9)):
        mix_add(mix, pop(800 + 90 * (i % 4), 1500 + 90 * (i % 4), 0.09, 0.22), f)  # hearts
    mix_add(mix, footstep(11), 556, 0.3)
    mix_add(mix, blip(420, 700, 0.2, gain=0.3), 584)              # a happy "heh"

    # ---------- the music ----------
    if not NO_MUSIC:
        C, D, E, F, G, A, B = 0, 2, 4, 5, 7, 9, 11
        n = lambda name, octv: 12 * (octv + 1) + name
        # 1. playful, 0-2.6 s: bouncing pluck tune over a walking bass
        tune = [E, G, E, C, D, E, D, G]
        for i in range(16):
            t = i * 0.1625
            m = n(tune[i % 8], 5 if i % 8 < 7 else 4)
            place(mix, pluck(hz(m), 0.28), t + 0.0, 0.55)
            if i % 2 == 0:
                place(mix, bass(hz(n([C, G, C, G, F, C, G, G][(i // 2) % 8], 2)), 0.28), t, 0.6)
        # 2. a hush, then hope, 3.9-5.8 s: music box
        for i, (m, f) in enumerate(((G, 4), (C, 5), (E, 5), (G, 5))):
            place(mix, musicbox(hz(n(m, f)), 1.0), 4.45 + i * 0.35, 0.8)
        # 3. sad, 6.2-8.3 s: piano over a held A-minor pad
        place(mix, pad([hz(n(A, 2)), hz(n(E, 3)), hz(n(A, 3)), hz(n(C, 4))], 2.2, 0.28, 0.5, 0.8), 6.2)
        for i, (m, o) in enumerate(((A, 3), (E, 4), (A, 4), (C, 5), (B, 4), (A, 4), (E, 4))):
            place(mix, piano(hz(n(m, o)), 1.8, 0.9, 0.7), 6.2 + i * 0.3, 0.9)
        place(mix, musicbox(hz(n(F, 6)), 1.6), 7.6, 0.7)
        # 4. the lullaby, 8.4-11 s: music box in 3/4 (Am F C G)
        seq = [(A, 4), (C, 5), (E, 5), (D, 5), (C, 5), (A, 4), (F, 4), (A, 4), (C, 5), (E, 5), (D, 5), (C, 5)]
        for i, (m, o) in enumerate(seq):
            place(mix, musicbox(hz(n(m, o)), 1.1), 8.4 + i * 0.5, 0.85)
        place(mix, pad([hz(n(A, 2)), hz(n(E, 3)), hz(n(A, 3))], 3.0, 0.2, 0.6, 0.8), 8.4)
        place(mix, pad([hz(n(F, 2)), hz(n(C, 3)), hz(n(A, 3))], 2.6, 0.2, 0.6, 0.8), 10.2)
        place(mix, musicbox(hz(n(D, 6)), 1.4), 10.4, 0.5)
        # 5. tension, 10.9-12.27 s: a drone swelling to the arrow, a tick, then nothing
        dur = 12.27 - 10.9
        m_ = N(dur)
        tt = np.arange(m_) / SR
        drone = (tone(hz(n(D, 2)), dur, harmonics=5) * 0.6 + tone(hz(n(A, 2)), dur, harmonics=4) * 0.4) * (0.55 + 0.45 * np.sin(2 * np.pi * 8 * tt)) * np.linspace(0.05, 1.0, m_) ** 1.6
        place(mix, stereo(drone * 0.5), 10.9, 0.6)
        for i in range(7):
            place(mix, click(200 + i, 0.5), 11.0 + i * 0.19)
        # 6. sad strings, 13.3-15.9 s (Dm Am F E)
        place(mix, pad([hz(n(D, 2)), hz(n(A, 2)), hz(n(F, 3)), hz(n(D, 4))], 1.5, 0.3, 0.4, 0.5), 13.3)
        place(mix, pad([hz(n(A, 2)), hz(n(E, 3)), hz(n(C, 4)), hz(n(A, 4))], 1.4, 0.3, 0.4, 0.5), 14.7)
        for i, (m, o) in enumerate(((D, 4), (F, 4), (A, 4), (D, 5), (C, 5), (A, 4), (E, 4), (A, 4))):
            place(mix, piano(hz(n(m, o)), 2.0, 0.85, 0.7), 13.4 + i * 0.32, 0.9)
        # 7. the resolve, 16-20 s: a warm swell, then a gentle C-F-G-C
        place(mix, pad([hz(n(C, 3)), hz(n(G, 3)), hz(n(E, 4)), hz(n(C, 5))], 1.8, 0.4, 0.35, 0.5), 16.0)
        place(mix, pad([hz(n(F, 2)), hz(n(C, 3)), hz(n(A, 3)), hz(n(F, 4))], 1.8, 0.35, 0.3, 0.5), 17.6)
        place(mix, pad([hz(n(C, 3)), hz(n(G, 3)), hz(n(E, 4)), hz(n(C, 5))], 1.9, 0.4, 0.4, 1.0), 19.3)
        arp = [(C, 4), (E, 4), (G, 4), (C, 5), (E, 5), (G, 5), (E, 5), (C, 5), (F, 4), (A, 4), (C, 5), (F, 5), (E, 5), (C, 5), (G, 4), (B, 4), (D, 5), (G, 5), (E, 5), (C, 6)]
        for i, (m, o) in enumerate(arp):
            place(mix, piano(hz(n(m, o)), 1.6, 0.95, 0.8), 16.0 + i * 0.2, 0.9)
        place(mix, shimmer() * 1.3, 19.0, 0.5)

    mix = mix[: int(total * SR)]
    mix = fade(mix, 0.0, 0.5)
    write_mp3(FF, mix, OUT, lufs=-18 if NO_MUSIC else -14)
    print("wrote", os.path.relpath(OUT, ROOT), f"({total:.1f}s)")
