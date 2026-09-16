#!/usr/bin/env python3
"""Cut a music bed for a geo short out of a licensed track.

    python3 scripts/make-geo-music.py darien path/to/track.mp3 [--start 0] [--length 60]

Takes `length` seconds from `start`, fades the ends, and levels it to about
14 dB under the narration (the narration is normalised to -16 LUFS by
make-vo.py, so the bed lands at -30). Writes public/audio/geo-<name>-music.mp3,
which is gitignored: the track is licensed to the channel, not to the repo,
so it stays a local drop-in. Credit the track in the short's upload.md.
"""
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    args = sys.argv[1:]
    if len(args) < 2:
        sys.exit(__doc__)
    name, src = args[0], args[1]
    start = float(args[args.index("--start") + 1]) if "--start" in args else 0.0
    length = float(args[args.index("--length") + 1]) if "--length" in args else 60.0
    out_dir = os.path.join(ROOT, "public", "audio")
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, "geo-%s-music.mp3" % name)
    fade_out = max(0.0, length - 2.5)
    subprocess.run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-ss", str(start), "-t", str(length), "-i", src, "-vn",
        "-af", "afade=t=in:st=0:d=1.2,afade=t=out:st=%.2f:d=2.5,loudnorm=I=-30:TP=-6:LRA=9" % fade_out,
        "-ar", "44100", "-b:a", "192k", out,
    ], check=True)
    print("wrote", os.path.relpath(out, ROOT), "(%ss from %ss of %s)" % (length, start, os.path.basename(src)))


if __name__ == "__main__":
    main()
