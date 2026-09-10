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

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfx import SR, render  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DUCK = 0.62  # effects sit under the voice, not on top of it


def main():
    name = sys.argv[1] if len(sys.argv) > 1 else "mummy"
    spec = json.load(open(os.path.join(ROOT, "scripts-vo", "%s.json" % name)))
    out_dir = os.path.join(ROOT, *spec.get("out", "src/mummy").split("/"))
    timing = {l["id"]: l for l in json.load(open(os.path.join(out_dir, "timing.json")))}

    total = int(spec.get("duration", 480) * SR)
    track = np.zeros(total + SR, dtype=np.float32)

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
                try:
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
    peak = float(np.max(np.abs(track)))
    if peak > 0.95:
        track *= 0.95 / peak
    print("placed %d cues, %d distinct effects, peak %.2f" % (placed, len(cache), peak))

    wav = os.path.join(ROOT, ".tts", "%s-sfx.wav" % name)
    mp3 = os.path.join(ROOT, "public", "assets", "vo", "%s-sfx.mp3" % name)
    os.makedirs(os.path.dirname(wav), exist_ok=True)
    sf.write(wav, track, SR)
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                    "-i", wav, "-b:a", "160k", mp3], check=True)
    print("wrote", os.path.relpath(mp3, ROOT))


if __name__ == "__main__":
    main()
