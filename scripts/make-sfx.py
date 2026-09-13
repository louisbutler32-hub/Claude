#!/usr/bin/env python3
"""Lay the sound effects onto the narration timeline.

Reads the cues from scripts-vo/<name>.json — each line may carry
"sfx": [["boom", 1.2], ...], where the number is seconds from the start of
that line — and the line start times from the generated <out>/timing.json.
Writes public/assets/vo/<name>-sfx.mp3, a track the same length as the
narration, which the composition plays underneath it.

    python3 scripts/make-sfx.py mummy
"""
import json
import os
import subprocess
import sys

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfx import SR, render  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DUCK = 0.62   # effects sit under the voice, not on top of it
MAX_CLIP = 3.0  # a sting longer than this is a bed, not a sting


def load_pack():
    """Real recordings from a third-party pack, keyed by slug.

    Only the clips the catalogue marked usable are offered: the ones whose
    names identify copyrighted music, film, TV or game audio are left out, so
    a cue sheet cannot reach them by accident.

    A cue sheet asks for one with the "pack:" prefix — "pack:bruh" — because
    the synthesised palette and the pack share names ("bonk" is in both), and
    an implicit lookup silently rescored an already-delivered video.
    """
    cat = os.path.join(ROOT, ".sfx", "catalogue.json")
    if not os.path.exists(cat):
        return {}
    rows = json.load(open(cat))["files"]
    return {r["slug"]: r["name"] for r in rows if r.get("bucket") == "usable"}


def load_clip(name):
    """One pack file, made usable as a sting: mono, at SR, trimmed, levelled."""
    x, sr = sf.read(os.path.join(ROOT, ".sfx", "raw", name))
    if x.ndim > 1:
        x = x.mean(1)
    if sr != SR:
        g = np.gcd(int(sr), SR)
        x = resample_poly(x, SR // g, sr // g)
    x = np.asarray(x, dtype=np.float32)
    loud = np.where(np.abs(x) > 0.02)[0]
    if len(loud):
        x = x[max(0, loud[0] - int(0.01 * SR)):loud[-1] + int(0.02 * SR)]
    if len(x) > MAX_CLIP * SR:
        x = x[: int(MAX_CLIP * SR)]
    peak = float(np.max(np.abs(x))) if len(x) else 0.0
    if peak > 0:
        x = x * (0.9 / peak)  # the pack is wildly uneven; level it
    fade = min(len(x), int(0.04 * SR))
    if fade:
        x[-fade:] *= np.linspace(1.0, 0.0, fade, dtype=np.float32)
    return x


def main():
    name = sys.argv[1] if len(sys.argv) > 1 else "mummy"
    spec = json.load(open(os.path.join(ROOT, "scripts-vo", "%s.json" % name)))
    out_dir = os.path.join(ROOT, *spec.get("out", "src/mummy").split("/"))
    timing = {l["id"]: l for l in json.load(open(os.path.join(out_dir, "timing.json")))}

    total = int(spec.get("duration", 480) * SR)
    track = np.zeros(total + SR, dtype=np.float32)

    pack = load_pack()
    cache, placed, missing = {}, 0, []
    for line in spec["lines"]:
        cues = line.get("sfx") or []
        if not cues:
            continue
        start = timing[line["id"]]["start"]
        for cue in cues:
            eff, offset = cue[0], float(cue[1])
            gain = float(cue[2]) if len(cue) > 2 else 1.0
            if eff not in cache:
                # a cue resolves to a real recording first, then to a
                # synthesised effect, so a sheet can mix the two freely
                try:
                    if eff.startswith("pack:"):
                        cache[eff] = load_clip(pack[eff[5:]])
                    else:
                        cache[eff] = render(eff)
                except KeyError:
                    missing.append(eff)
                    cache[eff] = np.zeros(1, dtype=np.float32)
            clip = cache[eff]
            at = int((start + offset) * SR)
            if at < 0 or at >= total:
                continue
            end = min(total, at + len(clip))
            track[at:end] += clip[: end - at] * DUCK * gain
            placed += 1

    if missing:
        print("!! unknown effects: %s" % ", ".join(sorted(set(missing))), file=sys.stderr)

    track = track[:total]
    # any effect still ringing at the end would otherwise be cut off square,
    # which reads as a click on the last frame
    fade = int(0.25 * SR)
    track[-fade:] *= np.linspace(1.0, 0.0, fade, dtype=np.float32)
    peak = float(np.max(np.abs(track)))
    if peak > 0.95:
        track *= 0.95 / peak
    from_pack = sum(1 for e in cache if e.startswith("pack:"))
    print("placed %d cues, %d distinct effects (%d from the pack, %d synthesised), peak %.2f"
          % (placed, len(cache), from_pack, len(cache) - from_pack, peak))

    wav = os.path.join(ROOT, ".tts", "%s-sfx.wav" % name)
    mp3 = os.path.join(ROOT, "public", "assets", "vo", "%s-sfx.mp3" % name)
    os.makedirs(os.path.dirname(wav), exist_ok=True)
    sf.write(wav, track, SR)
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                    "-i", wav, "-b:a", "160k", mp3], check=True)
    print("wrote", os.path.relpath(mp3, ROOT))


if __name__ == "__main__":
    main()
