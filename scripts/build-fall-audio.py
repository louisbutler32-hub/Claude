#!/usr/bin/env python3
"""Soundtrack for "How to survive ANY fall in Minecraft".

Everything is placed on frames read from src/minecraft-fall/beats.json, the
same file the video reads, so picture and sound can't drift apart.

  --music runamok (default)  run-amok.mp3, Kevin MacLeod, CC BY 4.0, sped up like the PvP Short
  --music hbfs               harder-better-faster-stronger.mp3 (Daft Punk; the owner's copy,
                             never committed). Starts 49.1s in, so "work it" arrives on the
                             first clutch and "harder, better, faster, stronger" on the slime
                             launch; "stronger" ends right as the music cuts at the ledge
  --music none               no music: every effect, a few dB quieter, for uploading with a
                             song added in YouTube's own Shorts sound picker
  mc-damage.mp3              the game's hurt sound — the "oof" on the hay bale and on the ledge

Everything else is synthesised here: wind that follows the actual fall
speed, a slow-motion drop, splash and droplets, hotbar clicks, a hay-bale
crunch, slime boings, a heartbeat that speeds up at half a heart, a record
scratch into silence, footsteps and a whistle, a sad trombone, and the
respawn shimmer. The music under the respawn is the few seconds just
before where the video's opening picks it up, so the loop is seamless.

Writes public/audio/fall-mix.mp3, fall-mix-hbfs.mp3 or fall-sfx.mp3.
Through each slow-motion clutch the music is muffled (low-passed) rather than
just turned down, the way time-slowing sounds in a film.
"""
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mc_audio_lib import (SR, N, band, boing, boom, click, decay, decode, env, fade, footstep, heartbeat, place,
                          record_scratch, sad_trombone, shimmer, splash, stereo, thump, tone, vwoom, whistle, whoosh, write_mp3)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "audio", "src")
# name: (file, ffmpeg filter, seconds into the track where frame 0 sits, output)
SONGS = {
    "runamok": ("run-amok.mp3", "asetrate=%d,aresample=%d,atempo=1.2" % (int(44100 * 1.18), 44100), 1.5, "fall-mix.mp3"),
    "hbfs": ("harder-better-faster-stronger.mp3", None, 49.13, "fall-mix-hbfs.mp3"),
}
CHOICE = sys.argv[sys.argv.index("--music") + 1] if "--music" in sys.argv else "none" if "--no-music" in sys.argv else "runamok"
if CHOICE not in SONGS and CHOICE != "none":
    sys.exit("--music must be one of: " + ", ".join(SONGS) + ", none")
NO_MUSIC = CHOICE == "none"
OUT = os.path.join(ROOT, "public", "audio", "fall-sfx.mp3" if NO_MUSIC else SONGS[CHOICE][3])
FF = os.environ.get("FFMPEG", "ffmpeg")
B = json.load(open(os.path.join(ROOT, "src", "minecraft-fall", "beats.json")))
FPS = B["fps"]
sec = lambda f: f / FPS


# ------------------------------------------------------------ physics (mirrors FallShort.tsx)

P = B["physics"]
TC = (P["vmax"] + P["v0"]) / P["g"]


def fall_vel(tau):
    return min(P["vmax"], -P["v0"] + P["g"] * tau)


def tau_at(key, l):
    seg, ev = B["seg"][key], B[key]
    s, L, t0 = ev["slowStart"] - seg[0], ev["land"] - seg[0], P["tau0"][key]
    if l < s:
        return t0 + l
    if l < L:
        return t0 + s + (l - s) * P["slow"]
    return None  # landed


def wind(key):
    """rushing air whose loudness and brightness follow the fall speed, frame by frame"""
    seg, ev = B["seg"][key], B[key]
    frames = ev["land"] - seg[0]
    n = int(sec(frames) * SR)
    low, high = band(n, 450, 500, 31), band(n, 1900, 350, 37)
    speed = np.zeros(n)
    for l in range(frames):
        tau = tau_at(key, l)
        v = max(0.0, fall_vel(tau)) / P["vmax"] if tau is not None else 0
        if l >= ev["slowStart"] - seg[0]:
            v *= 0.45  # slow-motion: the air goes quiet
        speed[int(sec(l) * SR):int(sec(l + 1) * SR)] = v
    k = N(0.05)
    speed = np.convolve(speed, np.ones(k) / k, mode="same")
    return stereo((low * 0.8 + high * 0.35 * speed) * speed ** 1.3 * env(n, 0.05, 0.03))


# ------------------------------------------------------------ mix

if __name__ == "__main__":
    for name in ("mc-damage.mp3",) + (() if NO_MUSIC else (SONGS[CHOICE][0],)):
        if not os.path.exists(os.path.join(SRC, name)):
            sys.exit("missing public/audio/src/" + name)
    total = sec(B["frames"])
    mix = np.zeros((int(total * SR), 2), dtype=np.float32)
    S, W_, H_, SL, LD, D, R = B["seg"], B["water"], B["hay"], B["slime"], B["ledge"], B["dead"], B["respawn"]

    # music under the stunts, muffled through each slow-motion clutch, gone at the ledge
    if not NO_MUSIC:
        name, filt, X, _ = SONGS[CHOICE]
        path = os.path.join(SRC, name)
        song = decode(FF, path, filt)
        muffled = decode(FF, path, (filt + "," if filt else "") + "lowpass=f=450,lowpass=f=450")
        # the ledge is meant to feel like the music died: its whistle and heartbeat sit well under this
        MUSIC = 0.6
        n = int(sec(S["ledge"][0]) * SR)
        wet = np.zeros(n)  # 0 = the song as is, 1 = fully muffled
        ramp = N(0.12)
        for ev in (W_, H_, SL):
            a, b = int(sec(ev["slowStart"]) * SR), int(sec(ev["land"]) * SR)
            wet[a:b] = 1
            wet[a:a + ramp] = np.linspace(0, 1, ramp)
            wet[b:b + ramp] = np.linspace(1, 0, ramp)
        i0 = int(X * SR)
        body = song[i0:i0 + n] * (1 - wet[:, None]) + muffled[i0:i0 + n] * 0.45 * wet[:, None]  # a low-pass keeps the bass, so drop the level too or it isn't a hush
        place(mix, fade(body * MUSIC, 0.0, 0.03), 0)
        # the respawn plays the stretch just before X, so the last frame flows into the first
        pre = sec(S["respawn"][1] - S["respawn"][0])
        place(mix, fade(song[int((X - pre) * SR):i0] * MUSIC, 0.25, 0.0), sec(S["respawn"][0]))

    oof = decode(FF, os.path.join(SRC, "mc-damage.mp3"), "atrim=0.20:0.62,asetpts=PTS-STARTPTS")

    # 1. the leap and the three falls
    place(mix, fade(whoosh(0.35, seed=3), 0.01, 0.1), 0, 0.35)
    for key in ("water", "hay", "slime"):
        place(mix, wind(key), sec(S[key][0]), 0.55)
        place(mix, vwoom(), sec(B[key]["slowStart"]), 0.45)

    # water bucket: pour, splash
    n = N(0.14)
    place(mix, stereo(tone(np.linspace(700, 250, n), 0.14) * decay(n, 18)), sec(W_["place"]), 0.35)
    place(mix, splash(), sec(W_["land"]), 0.8)

    # hay: the bucket slips, the hotbar scramble, the crunch, the oof
    n = N(0.25)
    place(mix, stereo(tone(np.linspace(300, 950, n), 0.25) * env(n, 0.01, 0.08)), sec(H_["slip"]), 0.35)
    f = H_["scramble"][0]
    while f < H_["scramble"][1]:
        place(mix, click(), sec(f), 0.35)
        f += 1.8
    n = N(0.1)
    place(mix, stereo(band(n, 300, 200, 41) * decay(n, 30)), sec(H_["place"]), 0.4)
    place(mix, fade(boom(0.5, seed=44), 0.002, 0.2), sec(H_["land"]), 0.7)
    n = N(0.16)
    place(mix, stereo(band(n, 2200, 900, 45) * decay(n, 25)), sec(H_["land"]), 0.45)
    place(mix, oof, sec(H_["land"] + 1), 0.9)

    # slime: squelch, then a boing per bounce, the first launching him out of frame
    n = N(0.18)
    place(mix, stereo(band(n, 350, 200, 51) * decay(n, 16) * (1 + 0.5 * np.sin(np.arange(n) / SR * 2 * np.pi * 30))), sec(SL["place"]), 0.4)
    bn, v, t0, contacts = B["bounce"], B["bounce"]["v"], 0.0, []
    while v >= bn["minV"]:
        contacts.append(t0)
        t0 += 2 * v / bn["g"]
        v *= bn["e"]
    for i, c in enumerate(contacts):
        place(mix, boing(170 + i * 60, 420 + i * 90, gain=0.9 * 0.62 ** i), sec(SL["land"] + c), 0.75)
    place(mix, fade(whoosh(0.5, seed=55), 0.01, 0.2), sec(SL["land"] + 2), 0.35)

    # heartbeat from the moment he's on half a heart until the ledge, faster as he walks to the edge
    ledge_land = LD["stepOff"] + LD["fallFrames"]
    f = H_["land"] + 14
    while f < ledge_land:
        near = max(0.0, min(1.0, (f - S["ledge"][0]) / (LD["stepOff"] - S["ledge"][0])))
        place(mix, heartbeat(), sec(f), 0.16 + 0.16 * near)
        f += 24 - 9 * near

    # 2. the ledge: music stops dead, footsteps and a whistle, a tiny drop, the oof
    place(mix, record_scratch(), sec(S["ledge"][0]), 0.4)
    f = LD["walk"][0] + LD["stride"] / 2
    while f < LD["walk"][1]:
        place(mix, footstep(int(f)), sec(f), 0.18)
        f += LD["stride"] / 2
    place(mix, whistle([(784, 0, 6), (659, 6, 6), (784, 12, 6), (1047, 18, 8), (880, 26, 8), (784, 34, 12)], FPS), sec(LD["walk"][0] + 2), 0.07)
    place(mix, fade(whoosh(0.2, seed=61), 0.005, 0.08), sec(LD["stepOff"]), 0.2)
    place(mix, fade(boom(0.3, seed=62), 0.002, 0.15), sec(ledge_land), 0.35)
    place(mix, oof, sec(ledge_land + 1), 1.6)  # the punchline: the loudest thing in the video
    place(mix, thump(70, 0.2), sec(LD["tip"][1]), 0.4)
    n = N(0.4)
    place(mix, stereo(band(n, 2600, 1200, 71) * env(n, 0.02, 0.3)), sec(LD["poof"]), 0.3)

    # 3. death screen, respawn
    place(mix, sad_trombone(), sec(D["youDied"]), 0.5)
    place(mix, click(2400, 0.015), sec(D["cursor"][1]), 0.3)
    place(mix, click(1800, 0.03), sec(D["click"]), 0.5)
    place(mix, shimmer(), sec(D["flash"]), 0.45)
    place(mix, fade(whoosh(0.4, seed=81), 0.01, 0.15), sec(D["flash"] + 2), 0.3)

    write_mp3(FF, mix, OUT, lufs=-18 if NO_MUSIC else -14)  # quieter, so the added song sits on top
    print("wrote", os.path.relpath(OUT, ROOT), f"({total:.1f}s, music: {CHOICE})")
