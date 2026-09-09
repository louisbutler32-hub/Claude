#!/usr/bin/env python3
"""
Joins the guess-format episodes into one long compilation.

The episodes are rendered at 1920x1080; the original fruit video is 1280x720,
so everything is normalised to a single codec, size and frame rate before
concatenating — otherwise the join produces a file that plays wrong (or not
at all) on some players.

Chapter marks are written for each episode boundary, so the compilation is
navigable rather than one 40-minute block.

Usage:
    python3 scripts/make-compilation.py \\
        --fruit path/to/fruit.mp4 \\
        --out out/compilation.mp4
"""

import argparse
import json
import os
import subprocess
import sys

FFMPEG = os.environ.get("FFMPEG", "ffmpeg")
FFPROBE = os.environ.get("FFPROBE", "ffprobe")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

W, H, FPS = 1920, 1080, 30


def duration(path):
    """Seconds, read from the container rather than assumed."""
    out = subprocess.run(
        [FFMPEG, "-hide_banner", "-i", path],
        capture_output=True, text=True
    ).stderr
    for line in out.splitlines():
        if "Duration:" in line:
            hms = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = hms.split(":")
            return int(h) * 3600 + int(m) * 60 + float(s)
    sys.exit(f"could not read duration of {path}")


def normalise(src, dst, crf):
    """One codec, one size, one frame rate, one audio layout."""
    subprocess.run([
        FFMPEG, "-hide_banner", "-loglevel", "error", "-y",
        "-i", src,
        "-vf", f"scale={W}:{H}:flags=lanczos,fps={FPS},format=yuv420p",
        "-c:v", "libx264", "-crf", str(crf), "-preset", "veryfast",
        "-c:a", "aac", "-b:a", "96k", "-ar", "44100", "-ac", "2",
        "-movflags", "+faststart",
        dst,
    ], check=True)


def chapter_metadata(parts, path):
    """ffmetadata chapters, in milliseconds."""
    lines = [";FFMETADATA1"]
    t = 0.0
    for title, _, dur in parts:
        lines += [
            "[CHAPTER]",
            "TIMEBASE=1/1000",
            f"START={int(t * 1000)}",
            f"END={int((t + dur) * 1000) - 1}",
            f"title={title}",
        ]
        t += dur
    open(path, "w").write("\n".join(lines) + "\n")
    return t


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fruit", help="the original fruit episode (optional)")
    ap.add_argument("--out", default=os.path.join(ROOT, "out", "compilation.mp4"))
    ap.add_argument("--crf", type=int, default=27)
    ap.add_argument("--work", default=os.path.join(ROOT, ".compile"))
    args = ap.parse_args()

    episodes = []
    if args.fruit:
        episodes.append(("Guess the Fruit", args.fruit))
    for title, name in (
        ("Guess the Vegetable", "chomp-chomp-veggies.mp4"),
        ("Guess the Animal", "animals.mp4"),
        ("Guess the Number", "numbers.mp4"),
    ):
        p = os.path.join(ROOT, "out", name)
        if os.path.exists(p):
            episodes.append((title, p))
        else:
            print(f"  skipping {title} — {name} not rendered yet")

    if len(episodes) < 2:
        sys.exit("need at least two episodes to compile")

    os.makedirs(args.work, exist_ok=True)
    os.makedirs(os.path.dirname(args.out), exist_ok=True)

    parts = []
    for i, (title, src) in enumerate(episodes):
        dst = os.path.join(args.work, f"part{i}.mp4")
        print(f"  normalising {title}…")
        normalise(src, dst, args.crf)
        parts.append((title, dst, duration(dst)))

    listing = os.path.join(args.work, "parts.txt")
    open(listing, "w").write(
        "\n".join(f"file '{p}'" for _, p, _ in parts) + "\n"
    )
    meta = os.path.join(args.work, "chapters.txt")
    total = chapter_metadata(parts, meta)

    print("  joining…")
    subprocess.run([
        FFMPEG, "-hide_banner", "-loglevel", "error", "-y",
        "-f", "concat", "-safe", "0", "-i", listing,
        "-i", meta, "-map_metadata", "1",
        "-c", "copy", "-movflags", "+faststart",
        args.out,
    ], check=True)

    mb = os.path.getsize(args.out) / 1048576
    print(f"\nwrote {args.out}  ({mb:.0f} MB, {int(total // 60)}:{int(total % 60):02d})")
    print("\nchapters:")
    t = 0.0
    for title, _, dur in parts:
        print(f"  {int(t // 60)}:{int(t % 60):02d}  {title}")
        t += dur


if __name__ == "__main__":
    main()
