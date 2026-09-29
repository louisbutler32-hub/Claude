#!/usr/bin/env python3
"""Lay a reference video's own soundtrack under a remake of it.

    lift-reference-audio.py SOURCE.mp4 NAME.wav SILENT.mp4 FINAL.mp4

Decodes SOURCE's audio to public/audio/NAME.wav (untouched, sample for
sample), then has ffmpeg mux it under SILENT.mp4 to make FINAL.mp4. ffmpeg
does the final mux, not the renderer: the renderer's own AAC encode has no
priming edit list and plays 28 ms late, where this measures sample-exact.
The source stays in the owner's ignored public/audio/src/ and is never
committed.
"""
import os
import subprocess
import sys

if len(sys.argv) != 5:
    sys.exit(__doc__)
src, wav, silent, final = sys.argv[1:]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FF = os.environ.get("FFMPEG", "ffmpeg")
wav_path = os.path.join(ROOT, "public", "audio", wav)
os.makedirs(os.path.dirname(wav_path), exist_ok=True)
for p in (src, silent):
    if not os.path.exists(os.path.join(ROOT, p)):
        sys.exit("missing " + p)
subprocess.run([FF, "-loglevel", "error", "-y", "-i", os.path.join(ROOT, src), "-vn", "-c:a", "pcm_s16le", wav_path], check=True)
subprocess.run([FF, "-loglevel", "error", "-y", "-i", os.path.join(ROOT, silent), "-i", wav_path, "-map", "0:v", "-map", "1:a",
                "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", os.path.join(ROOT, final)], check=True)
print("wrote", final)
