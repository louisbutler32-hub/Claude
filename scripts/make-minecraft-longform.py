#!/usr/bin/env python3
"""
Joins the Minecraft long-form compilation: an intro, five chapter cards
each followed by its own already-built Short, a behind-the-build segment,
a vote-for-the-next-one segment, and an outro.

Mirrors scripts/make-compilation.py's approach (normalise every part to
one codec/size/frame rate, concat demuxer, embed chapters with a
chapterless fallback) rather than reinventing it, since that script
already worked out the gotchas — Remotion's bundled ffmpeg lacks the
ffmetadata demuxer on some builds, and a stream-copy concat needs every
input on identical parameters first.

The five Shorts stay untouched; only the connective cards in out/.lf/ are
new. Usage:

    python3 scripts/make-minecraft-longform.py --out out/relatable-minecraft-longform.mp4
"""
import argparse
import os
import subprocess
import sys

FFMPEG = os.environ.get("FFMPEG", "ffmpeg")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

W, H, FPS = 1080, 1920, 30
LF = os.path.join(ROOT, "out", ".lf")


def duration(path):
    out = subprocess.run([FFMPEG, "-hide_banner", "-i", path], capture_output=True, text=True).stderr
    for line in out.splitlines():
        if "Duration:" in line:
            hms = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = hms.split(":")
            return int(h) * 3600 + int(m) * 60 + float(s)
    sys.exit(f"could not read duration of {path}")


def normalise(src, dst, crf):
    subprocess.run([
        FFMPEG, "-hide_banner", "-loglevel", "error", "-y",
        "-i", src,
        "-vf", f"scale={W}:{H}:flags=lanczos",
        "-r", str(FPS),
        "-pix_fmt", "yuv420p",
        "-c:v", "libx264", "-crf", str(crf), "-preset", "veryfast",
        "-c:a", "aac", "-b:a", "128k", "-ar", "44100", "-ac", "2",
        "-movflags", "+faststart",
        dst,
    ], check=True)


def chapter_metadata(parts, path):
    lines = [";FFMETADATA1"]
    t = 0.0
    for title, _, dur, chaptered in parts:
        if chaptered:
            lines += [
                "[CHAPTER]", "TIMEBASE=1/1000",
                f"START={int(t * 1000)}", f"END={int((t + dur) * 1000) - 1}",
                f"title={title}",
            ]
        t += dur
    open(path, "w").write("\n".join(lines) + "\n")
    return t


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=os.path.join(ROOT, "out", "relatable-minecraft-longform.mp4"))
    ap.add_argument("--crf", type=int, default=23)
    ap.add_argument("--work", default=os.path.join(ROOT, ".compile-longform"))
    args = ap.parse_args()

    # (title-for-chapter-list, path, start-a-new-chapter-here)
    parts_spec = [
        ("Intro", os.path.join(LF, "intro.mp4"), True),
        (None, os.path.join(LF, "ch1.mp4"), False),
        ("Dig Straight Down", os.path.join(ROOT, "out", "dig-straight-down.mp4"), True),
        (None, os.path.join(LF, "ch2.mp4"), False),
        ("Java vs Bedrock PvP", os.path.join(ROOT, "out", "java-vs-bedrock-pvp.mp4"), True),
        (None, os.path.join(LF, "ch3.mp4"), False),
        ("You vs The Creeper", os.path.join(ROOT, "out", "creeper.mp4"), True),
        (None, os.path.join(LF, "ch4.mp4"), False),
        ("First Time in the Nether", os.path.join(ROOT, "out", "nether-first-time.mp4"), True),
        (None, os.path.join(LF, "ch5.mp4"), False),
        ("Building the Perfect House", os.path.join(ROOT, "out", "building-perfect-house.mp4"), True),
        ("Behind the Build", os.path.join(LF, "cast.mp4"), True),
        ("Vote for Episode 6", os.path.join(LF, "vote.mp4"), True),
        ("Thanks for Watching", os.path.join(LF, "outro.mp4"), True),
    ]

    for _, p, _ in parts_spec:
        if not os.path.exists(p):
            sys.exit(f"missing part: {p} — render it first (see package.json's long-* scripts)")

    os.makedirs(args.work, exist_ok=True)
    os.makedirs(os.path.dirname(args.out), exist_ok=True)

    parts = []
    for i, (title, src, new_chapter) in enumerate(parts_spec):
        dst = os.path.join(args.work, f"part{i}.mp4")
        print(f"  normalising {title or '(continued)'}…")
        normalise(src, dst, args.crf)
        parts.append((title, dst, duration(dst), new_chapter))

    # merge each card into the chapter that follows it: the chapter's
    # displayed start time is the card's start, so pop the placeholder
    # (title=None) entries by just not opening a chapter mark for them —
    # chapter_metadata already skips non-chaptered rows, so the running
    # clock still advances correctly through the card.
    listing = os.path.join(args.work, "parts.txt")
    open(listing, "w").write("\n".join(f"file '{p}'" for _, p, _, _ in parts) + "\n")

    meta = os.path.join(args.work, "chapters.txt")
    total = chapter_metadata(parts, meta)

    print("  joining…")
    join_cmd = [
        FFMPEG, "-hide_banner", "-loglevel", "error", "-y",
        "-f", "concat", "-safe", "0", "-i", listing,
        "-i", meta, "-map_metadata", "1",
        "-c", "copy", "-movflags", "+faststart",
        args.out,
    ]
    result = subprocess.run(join_cmd)
    if result.returncode != 0:
        print("  embedding chapters failed (ffmpeg build likely lacks the "
              "ffmetadata demuxer) — joining without embedded chapters; "
              "the description's chapter list still works on YouTube")
        subprocess.run([
            FFMPEG, "-hide_banner", "-loglevel", "error", "-y",
            "-f", "concat", "-safe", "0", "-i", listing,
            "-c", "copy", "-movflags", "+faststart",
            args.out,
        ], check=True)

    mb = os.path.getsize(args.out) / 1048576
    print(f"\nwrote {args.out}  ({mb:.0f} MB, {int(total // 60)}:{int(total % 60):02d})")
    print("\nchapters (paste into the description too — YouTube reads them from there):")
    t = 0.0
    for title, _, dur, new_chapter in parts:
        if new_chapter:
            print(f"  {int(t // 60)}:{int(t % 60):02d}  {title}")
        t += dur


if __name__ == "__main__":
    main()
