#!/usr/bin/env python3
"""Soundtrack for "Minecraft crouching makes no sense".

Placed on frames read from src/minecraft-sneak/beats.json, the same file the
video reads.

  --music snitch (default)  sneaky-snitch.mp3, Kevin MacLeod, CC BY 4.0 — the
                            sneakiest licensed track there is, for a crouch-walk
  --music none              every effect, no music, a few dB quieter — for
                            uploading with a song added in YouTube's own picker

  mc-damage.mp3             the game's hurt sound — three "oof"s in the lava

The rest is synthesised (scripts/mc_audio_lib.py): sneak steps, key clicks,
the edge-catch wobble, three rising strains as he leans further out, the
diamond pickup, the record scratch into dead air when he realises, a
cartoon falling whistle, the lava splash and sizzle, the respawn shimmer.
The music under the respawn is the stretch just before where the opening
picks the track up, so the loop is seamless.

Writes public/audio/sneak-mix.mp3 or sneak-sfx.mp3.
"""
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mc_audio_lib import (SR, N, band, boom, click, decay, decode, env, fade, footstep, place, record_scratch, shimmer,
                          splash, stereo, tone, whoosh, write_mp3)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "audio", "src")
FF = os.environ.get("FFMPEG", "ffmpeg")
B = json.load(open(os.path.join(ROOT, "src", "minecraft-sneak", "beats.json")))
FPS = B["fps"]
sec = lambda f: f / FPS

CHOICE = sys.argv[sys.argv.index("--music") + 1] if "--music" in sys.argv else "snitch"
if CHOICE not in ("snitch", "none"):
    sys.exit("--music must be snitch or none")
NO_MUSIC = CHOICE == "none"
OUT = os.path.join(ROOT, "public", "audio", "sneak-sfx.mp3" if NO_MUSIC else "sneak-mix.mp3")


def chirp(f0, f1, dur, harmonics=1):
    n = N(dur)
    return stereo(tone(np.linspace(f0, f1, n), dur, harmonics=harmonics) * env(n, 0.005, dur * 0.4))


def wobble(dur=0.7):
    """the edge catching him: a low wub that settles"""
    n = N(dur)
    t = np.arange(n) / SR
    return stereo(tone(150, dur, harmonics=3) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * t)) * decay(n, 5) * env(n, 0.01, 0.1))


def strain(level):
    """the rising 'eeee' of reaching just a bit further"""
    dur = 0.9
    n = N(dur)
    return stereo(tone(np.linspace(260 + 60 * level, 520 + 120 * level, n), dur, harmonics=3, vib=0.01, vib_rate=7) * env(n, 0.15, 0.2))


def sizzle(dur=1.6):
    n = N(dur)
    crackle = np.zeros(n)
    rng = np.random.default_rng(3)
    for _ in range(40):
        i = int(rng.uniform(0, dur - 0.02) * SR)
        crackle[i:i + N(0.004)] += rng.uniform(-1, 1)
    return stereo((band(n, 5200, 2200, 17) * 0.6 + crackle * 0.5) * decay(n, 1.6) * env(n, 0.01, 0.3))


if __name__ == "__main__":
    need = ("mc-damage.mp3",) + (() if NO_MUSIC else ("sneaky-snitch.mp3",))
    for name in need:
        if not os.path.exists(os.path.join(SRC, name)):
            sys.exit("missing public/audio/src/" + name)
    total = sec(B["frames"])
    mix = np.zeros((int(total * SR), 2), dtype=np.float32)

    # music: Sneaky Snitch from the first step until he realises, mid-air
    if not NO_MUSIC:
        song = decode(FF, os.path.join(SRC, "sneaky-snitch.mp3"))
        X, MUSIC = 1.0, 0.55  # frame 0 sits this far into the track
        i0 = int(X * SR)
        body = song[i0:i0 + int(sec(B["hang"][0]) * SR)]
        place(mix, fade(body * MUSIC, 0.0, 0.02), 0)
        pre = sec(B["frames"] - B["crouch"])  # it comes back in as he crouches, and flows into frame 0
        place(mix, fade(song[int((X - pre) * SR):i0] * MUSIC, 0.2, 0.0), sec(B["crouch"]))

    oof = decode(FF, os.path.join(SRC, "mc-damage.mp3"), "atrim=0.20:0.62,asetpts=PTS-STARTPTS")

    # sneaking
    for start, end in ((0, B["walk"]["end"]), (B["walkAgain"], B["frames"])):
        for f in range(start + 6, end, 12):
            place(mix, footstep(f), sec(f), 0.16)
    place(mix, chirp(900, 520, 0.12), sec(B["catch"]), 0.35)
    place(mix, wobble(), sec(B["catch"]), 0.45)

    # leaning out, a little further each time
    for i, (s, _, _) in enumerate(B["leans"]):
        place(mix, strain(i), sec(s), 0.16 + 0.05 * i)
    place(mix, chirp(600, 1300, 0.08), sec(B["grab"]), 0.5)
    place(mix, shimmer(), sec(B["grab"] + 2), 0.35)
    place(mix, fade(whoosh(0.3, seed=12), 0.01, 0.1), sec(B["back"][0]), 0.3)

    # the jump, the realisation, the drop
    place(mix, click(1800, 0.03), sec(B["jump"]), 0.7)
    place(mix, fade(whoosh(0.35, seed=13), 0.01, 0.1), sec(B["jump"]), 0.35)
    place(mix, record_scratch(), sec(B["hang"][0]), 0.3)
    place(mix, chirp(220, 140, 0.14), sec(B["hang"][0] + 8), 0.2)
    for f in range(B["hang"][0] + 4, B["hang"][1], 6):  # the realisation is meant to be near-silent: a scratch, a gulp, the shift key being mashed for all the good it does
        place(mix, click(2600, 0.012), sec(f), 0.12)
    dur = sec(B["fall"][1] - B["fall"][0])
    n = N(dur)
    place(mix, stereo(tone(np.linspace(1400, 260, n), dur, vib=0.01, vib_rate=8) * env(n, 0.02, 0.05)), sec(B["fall"][0]), 0.3)

    # lava
    land = B["fall"][1]
    place(mix, splash(seed=21), sec(land), 0.5)
    place(mix, fade(boom(0.5, seed=22), 0.002, 0.2), sec(land), 0.5)
    place(mix, sizzle(), sec(land), 0.22)
    for f in B["oofs"]:
        place(mix, oof, sec(f), 1.6)  # the payoff: they have to cut through the sizzle
    n = N(0.4)
    place(mix, stereo(band(n, 2600, 1200, 71) * env(n, 0.02, 0.3)), sec(B["poof"]), 0.3)

    # respawn
    place(mix, shimmer(), sec(B["respawn"] - 2), 0.45)
    place(mix, click(1500, 0.02), sec(B["crouch"]), 0.4)
    place(mix, click(1700, 0.02), sec(B["walkAgain"]), 0.35)

    write_mp3(FF, mix, OUT, lufs=-18 if NO_MUSIC else -14)
    print("wrote", os.path.relpath(OUT, ROOT), f"({total:.1f}s, music: {CHOICE})")
