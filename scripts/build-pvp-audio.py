#!/usr/bin/env python3
"""Mix the soundtrack for the Java vs Bedrock PvP Short.

    python3 scripts/build-pvp-audio.py

Reads three files the channel owner supplies in public/audio/src/ (gitignored):
  sneaky-snitch.mp3   Kevin MacLeod, CC BY 4.0 — credit line goes in the description
  run-amok.mp3        Kevin MacLeod, CC BY 4.0 — the fast half, sped up
  mc-hit.mp3          the game's hit sound
  mc-damage.mp3       the game's damage sound
and writes public/audio/pvp-mix.mp3 on the Short's frame grid: Sneaky
Snitch under the two Java halves, Run Amok sped up under the Bedrock half,
a hit on every swing, a damage sound on every kill. The closing Java half
plays the tune from its start and the opening half continues from there,
so the music is seamless when the Short loops.
"""
import os, subprocess, sys, numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "audio", "src")
OUT = os.path.join(ROOT, "public", "audio", "pvp-mix.mp3")
FF = os.environ.get("FFMPEG", "ffmpeg")
SR = 44100
FPS = 30
FRAMES = 390

def decode(path, filters=None):
    cmd = [FF, "-v", "error", "-i", path]
    if filters:
        cmd += ["-af", filters]
    cmd += ["-f", "f32le", "-ac", "2", "-ar", str(SR), "-"]
    raw = subprocess.run(cmd, check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()

def sec(f):
    return f / FPS

def place(mix, clip, t, gain=1.0):
    i = int(t * SR)
    n = min(len(clip), len(mix) - i)
    if n > 0:
        mix[i:i + n] += clip[:n] * gain

def fade(clip, a=0.02, b=0.02):
    c = clip.copy()
    na, nb = int(a * SR), int(b * SR)
    if na: c[:na] *= np.linspace(0, 1, na)[:, None]
    if nb: c[-nb:] *= np.linspace(1, 0, nb)[:, None]
    return c

if __name__ == "__main__":
    for name in ("sneaky-snitch.mp3", "run-amok.mp3", "mc-hit.mp3", "mc-damage.mp3"):
        if not os.path.exists(os.path.join(SRC, name)):
            sys.exit("missing %s — see the docstring" % os.path.join(SRC, name))
    total = int(sec(FRAMES) * SR)
    mix = np.zeros((total, 2), dtype=np.float32)

    # the slow tune, and the fast one sped up (pitch up too, the meme way)
    slow = decode(os.path.join(SRC, "sneaky-snitch.mp3"))
    fast = decode(os.path.join(SRC, "run-amok.mp3"), "asetrate=%d,aresample=%d,atempo=1.2" % (int(SR * 1.18), SR))
    MUSIC = 0.55
    java1 = (sec(0), sec(130))
    bed = (sec(130), sec(320))
    java2 = (sec(320), sec(FRAMES))
    def seg(src, t0, t1, src_offset):
        a = int(src_offset * SR); n = int((t1 - t0) * SR)
        return fade(src[a:a + n], 0.03, 0.06)
    # the loop: the closing half starts the tune, the opening half continues it
    java2_len = java2[1] - java2[0]
    place(mix, seg(slow, *java1, java2_len), java1[0], MUSIC)
    place(mix, seg(fast, *bed, 0.0), bed[0], MUSIC)
    place(mix, seg(slow, *java2, 0.0), java2[0], MUSIC)

    # the two effects, trimmed to the hit itself
    hit = decode(os.path.join(SRC, "mc-hit.mp3"), "atrim=0.74:0.95,asetpts=PTS-STARTPTS")
    dmg = decode(os.path.join(SRC, "mc-damage.mp3"), "atrim=0.20:0.62,asetpts=PTS-STARTPTS")
    hit = fade(hit, 0.003, 0.03); dmg = fade(dmg, 0.003, 0.05)
    HIT, DMG = 0.9, 0.85

    # Java: three swings land on 37, 65, 93; the zombie dies on 94
    for f in (37, 65, 93):
        place(mix, hit, sec(f), HIT)
    place(mix, dmg, sec(94), DMG)
    # Bedrock: spam from 165, while something is there to hit
    spans = [(165, 190), (222, 248), (258, 278), (280, 316)]
    for a, b in spans:
        for f in range(a, b, 3):
            place(mix, hit, sec(f), HIT * (0.55 if a == 280 else 0.85) * (0.8 + 0.2 * ((f // 3) % 2)))
    for f in (190, 248, 278):
        place(mix, dmg, sec(f), DMG)

    peak = float(np.max(np.abs(mix)))
    if peak > 0.98:
        mix *= 0.98 / peak
    tmp = OUT + ".f32"
    mix.astype(np.float32).tofile(tmp)
    subprocess.run([FF, "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", tmp,
                    "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-c:a", "libmp3lame", "-b:a", "192k", OUT], check=True)
    os.remove(tmp)
    print("wrote", os.path.relpath(OUT, ROOT), "%.2fs" % sec(FRAMES))
