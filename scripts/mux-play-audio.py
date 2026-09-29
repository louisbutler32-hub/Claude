#!/usr/bin/env python3
"""
Put the reference clip's own audio stream on a rendered play-along Short,
copied bit for bit (no re-encode).

Why not let Remotion embed it: Remotion's AAC encoder writes ~43 ms of
encoder priming at the start without marking it skippable, so the audio
plays about a frame and a third late against the picture. On a rhythm game
that reads as the stomp landing just after the button flashes. Copying the
reference's AAC stream keeps its own priming markers, so it plays exactly
where it did in the reference, which is where every beat was timed.

Usage:  python3 scripts/mux-play-audio.py beat|race|thumb|thumb2
Needs:  public/audio/play-<beat|race|thumb|thumb2>-ref.m4a (scripts/extract-play-audio.py)
"""

import os, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FFMPEG = os.environ.get("FFMPEG") or shutil.which("ffmpeg") or os.path.join(
    ROOT, "node_modules", "@remotion", "compositor-linux-x64-gnu", "ffmpeg")

which = sys.argv[1] if len(sys.argv) > 1 else ""
if which not in ("beat", "race", "thumb", "thumb2"):
    sys.exit(__doc__)
video = os.path.join(ROOT, "out", "play-thumb-2.mp4" if which == "thumb2" else f"play-{which}.mp4")
audio = os.path.join(ROOT, "public", "audio", f"play-{which}-ref.m4a")
for p in (video, audio):
    if not os.path.exists(p):
        sys.exit(f"missing {p}")
tmp = video + ".mux.mp4"
FFPROBE = os.path.join(os.path.dirname(FFMPEG), "ffprobe")
if not os.path.exists(FFPROBE):
    FFPROBE = shutil.which("ffprobe") or "ffprobe"
# the audio is copied whole, so cut it to the picture (a Short trimmed shorter than its clip)
vlen = subprocess.run([FFPROBE, "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration",
                       "-of", "default=nw=1:nk=1", video], capture_output=True, text=True, check=True).stdout.strip()
subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y",
                "-i", video, "-i", audio, "-map", "0:v:0", "-map", "1:a:0",
                "-c", "copy", "-t", vlen, "-movflags", "+faststart", tmp], check=True)
os.replace(tmp, video)
print(f"put the reference audio on {video}")
