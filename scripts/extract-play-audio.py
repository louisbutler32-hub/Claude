#!/usr/bin/env python3
"""
Pull the soundtrack out of the two reference clips and drop it into the
play-along Shorts' audio slots:

  public/audio/play-beat-ref.{wav,m4a}   <- the "play along with the beat!" clip
  public/audio/play-race-ref.{wav,m4a}   <- the "Choose your champion!" clip

The .wav is for previewing in Remotion Studio; the .m4a is the original
stream, copied untouched, which scripts/mux-play-audio.py puts on the
final render.

Usage:  python3 scripts/extract-play-audio.py <beat-clip.mp4> <race-clip.mp4>

The Shorts were re-timed frame by frame to these clips (src/play/*.json),
so their audio lines up without any offset. public/audio is gitignored:
the reference audio is not ours to publish in the repo. See
src/play/README.md on what uploading it involves.
"""

import os, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "audio")
FFMPEG = os.environ.get("FFMPEG") or shutil.which("ffmpeg") or os.path.join(
    ROOT, "node_modules", "@remotion", "compositor-linux-x64-gnu", "ffmpeg")

if len(sys.argv) != 3:
    sys.exit(__doc__)
os.makedirs(OUT, exist_ok=True)
for src, name in ((sys.argv[1], "play-beat-ref"), (sys.argv[2], "play-race-ref")):
    # .wav: what Remotion Studio plays while previewing
    wav = os.path.join(OUT, name + ".wav")
    subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-i", src,
                    "-vn", "-ac", "2", "-ar", "44100", "-c:a", "pcm_s16le", wav], check=True)
    # .m4a: the original AAC stream, copied untouched, for the final mux
    # (scripts/mux-play-audio.py) so the audio keeps the reference's timing
    m4a = os.path.join(OUT, name + ".m4a")
    subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-i", src,
                    "-vn", "-c:a", "copy", "-f", "mp4", m4a], check=True)
    print(f"wrote {wav} and {m4a}")
