#!/usr/bin/env python3
"""Build the narration track for the planets video.

Reads scripts-vo/planets-survival.json, synthesises every line with the local
Kokoro TTS model, trims the silence around each take, lays the takes out on a
timeline with the per-line gaps, and writes:

  public/assets/vo/planets-survival.mp3   the finished narration track
  src/planets/timing.json                 { start, end } per line, in seconds

The gaps are scaled by a single factor so the track lands exactly on TARGET.
"""
import json
import os
import subprocess
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TTS = os.path.join(ROOT, ".tts")
SR = 24000
TARGET = 180.0  # the video is exactly three minutes
TAIL = 0.45     # silence left after the final word


def trim(x, thresh=0.008, pad=0.04):
    """Trim near-silence from both ends, leaving a little padding."""
    loud = np.where(np.abs(x) > thresh)[0]
    if len(loud) == 0:
        return x
    p = int(pad * SR)
    return x[max(0, loud[0] - p):min(len(x), loud[-1] + p)]


def main():
    spec = json.load(open(os.path.join(ROOT, "scripts-vo", "planets-survival.json")))
    lines = spec["lines"]
    kokoro = Kokoro(os.path.join(TTS, "kokoro-v1.0.onnx"), os.path.join(TTS, "voices-v1.0.bin"))

    takes = []
    for i, line in enumerate(lines):
        samples, sr = kokoro.create(
            line["text"], voice=spec["voice"], speed=spec["speed"],
            lang=spec.get("lang", "en-us" if spec["voice"].startswith("a") else "en-gb"),
        )
        assert sr == SR
        audio = trim(np.asarray(samples, dtype=np.float32))
        takes.append(audio)
        print("  %-4s %5.2fs  %s" % (line["id"], len(audio) / SR, line["text"][:58]))

    speech = sum(len(a) for a in takes) / SR
    gaps = sum(l.get("gap", 0.25) for l in lines)
    room = TARGET - TAIL - speech
    scale = room / gaps if gaps else 0
    print("\nspeech %.2fs + gaps %.2fs -> scale gaps by %.2f to hit %.1fs" % (speech, gaps, scale, TARGET))
    if not 0.4 <= scale <= 2.5:
        print("!! gap scale is out of range - edit the script text and re-run", file=sys.stderr)

    track = np.zeros(int(TARGET * SR) + SR, dtype=np.float32)
    timing, cursor = [], 0.0
    for line, audio in zip(lines, takes):
        start = int(cursor * SR)
        track[start:start + len(audio)] += audio
        end = cursor + len(audio) / SR
        timing.append({"id": line["id"], "scene": line["scene"], "text": line["text"],
                       "start": round(cursor, 3), "end": round(end, 3)})
        cursor = end + line.get("gap", 0.25) * scale
    print("last word ends at %.2fs" % timing[-1]["end"])

    track = track[:int(TARGET * SR)]
    peak = float(np.max(np.abs(track))) or 1.0
    track *= 0.89 / peak

    os.makedirs(os.path.join(ROOT, "public", "assets", "vo"), exist_ok=True)
    os.makedirs(os.path.join(ROOT, "src", "planets"), exist_ok=True)
    wav = os.path.join(TTS, "planets-survival.wav")
    mp3 = os.path.join(ROOT, "public", "assets", "vo", "planets-survival.mp3")
    sf.write(wav, track, SR)
    # loudness-matched to the reference channel (its 3:00 sits at -18.3 LUFS;
    # the narration lands there once the music bed is mixed under it)
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", wav,
                    "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-b:a", "192k", mp3], check=True)
    json.dump(timing, open(os.path.join(ROOT, "src", "planets", "timing.json"), "w"), indent=1)
    print("wrote %s and src/planets/timing.json" % os.path.relpath(mp3, ROOT))


if __name__ == "__main__":
    main()
