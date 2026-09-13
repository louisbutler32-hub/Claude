#!/usr/bin/env python3
"""Survey a long source video into a bundle small enough to hand over.

A 30-minute 1080p source is a couple of gigabytes and will not upload. It does
not need to: an edit list is just timecodes, and timecodes do not care what
resolution they were chosen at. So the source stays on your machine, and this
produces the few megabytes actually needed to plan the cut.

    # survey the whole video -> scout/ (upload this folder)
    python3 scout.py "C:/path/to/source.mp4"

    # once the edit list exists, pull just those windows at a size budget
    python3 scout.py "C:/path/to/source.mp4" --windows 1:20-1:50,8:20-9:40 --budget 25

What the survey gives whoever is planning the cut:

  info.json    duration, resolution, frame rate
  shots.txt    every scene change in the source, with timecodes — this is the
               single most useful artefact and it is about 20 KB of text
  sheet_NN.jpg contact sheets, one frame every few seconds, timecode burned in
  proxy.mp4    optional low-res proxy of the whole thing

Then the finished config comes back and `render.py` runs against the original
full-quality file, here, where it already lives.
"""

import argparse
import json
import math
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib.video import run  # noqa: E402


def hhmmss(t):
    t = float(t)
    return f"{int(t // 3600):d}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"


def parse_time(s):
    """Accept 93, 1:33, 1:33.5 or 0:01:33."""
    s = str(s).strip()
    if not s:
        raise ValueError("empty timecode")
    parts = s.split(":")
    try:
        parts = [float(p) for p in parts]
    except ValueError:
        raise ValueError(f"bad timecode {s!r}")
    total = 0.0
    for p in parts:
        total = total * 60 + p
    return total


def probe(path):
    out = run([
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height,r_frame_rate,codec_name",
        "-show_entries", "format=duration,size,bit_rate",
        "-of", "json", path,
    ]).stdout
    d = json.loads(out)
    st = (d.get("streams") or [{}])[0]
    fm = d.get("format") or {}
    num, _, den = (st.get("r_frame_rate") or "0/1").partition("/")
    fps = float(num) / float(den or 1) if float(den or 1) else 0.0
    return {
        "path": os.path.abspath(path),
        "width": st.get("width"),
        "height": st.get("height"),
        "fps": round(fps, 3),
        "codec": st.get("codec_name"),
        "duration": round(float(fm.get("duration", 0)), 2),
        "size_mb": round(int(fm.get("size", 0)) / 1e6, 1),
    }


def detect_shots(path, threshold=0.25):
    """Every scene change in the source. Pure text, and the most useful thing
    here — it turns 'find a good shot around 10:40' into a list to pick from."""
    proc = run([
        "ffmpeg", "-hide_banner", "-i", path,
        "-filter:v", f"select='gt(scene,{threshold})',showinfo",
        "-f", "null", "-",
    ])
    times = [float(m) for m in
             re.findall(r"pts_time:([0-9.]+)", proc.stderr)]
    merged = []
    for t in times:
        if not merged or t - merged[-1] > 0.4:
            merged.append(t)
    return merged


def write_shots(shots, duration, out_path):
    lines = ["# scene changes in the source",
             "# start        end          length   (use these as clip in/out)",
             ""]
    for i, t in enumerate(shots):
        end = shots[i + 1] if i + 1 < len(shots) else duration
        lines.append(f"{hhmmss(t):>12}  {hhmmss(end):>12}  {end - t:6.2f}s"
                     f"   # {t:.2f} -> {end:.2f}")
    with open(out_path, "w") as fh:
        fh.write("\n".join(lines) + "\n")
    return len(shots)


def contact_sheets(path, duration, out_dir, every=4.0, cols=6, rows=5, width=320):
    """Frames across the whole video with the timecode burned into each."""
    per_sheet = cols * rows
    total = max(1, int(duration // every))
    sheets = math.ceil(total / per_sheet)
    made = []
    for s in range(sheets):
        start = s * per_sheet * every
        out = os.path.join(out_dir, f"sheet_{s:02d}.jpg")
        # The fps filter already leaves `t` in source seconds relative to the
        # seek point, so the label is just the sheet offset plus t.
        label = (f"drawtext=text='%{{eif\\:trunc(({start}+t)/60)\\:d\\:2}}"
                 f"\\:%{{eif\\:mod({start}+t\\,60)\\:d\\:2}}'"
                 f":x=6:y=6:fontsize=26:fontcolor=yellow:box=1:boxcolor=black@0.6")
        try:
            run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                 "-ss", f"{start:.2f}", "-i", path,
                 "-vf", (f"fps=1/{every},scale={width}:-2,{label},"
                         f"tile={cols}x{rows}"),
                 "-frames:v", "1", "-q:v", "5", out])
        except RuntimeError:
            break
        if os.path.exists(out):
            made.append(out)
    return made


def size_targeted(path, out_path, budget_mb, duration, height=540, segments=None):
    """Encode to land near a size budget. Video bitrate is whatever is left
    after a small audio track."""
    audio_kbps = 64
    total_kbits = budget_mb * 8 * 1000 * 0.94          # leave container headroom
    v_kbps = max(120, int(total_kbits / max(duration, 0.1)) - audio_kbps)

    if segments:
        # trim+concat inside one graph so the output is a single file
        parts, labels = [], []
        for i, (a, b) in enumerate(segments):
            parts.append(f"[0:v]trim={a:.3f}:{b:.3f},setpts=PTS-STARTPTS,"
                         f"scale=-2:{height}[v{i}]")
            parts.append(f"[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS[a{i}]")
            labels.append(f"[v{i}][a{i}]")
        parts.append(f"{''.join(labels)}concat=n={len(segments)}:v=1:a=1[v][a]")
        filt = ";".join(parts)
        maps = ["-filter_complex", filt, "-map", "[v]", "-map", "[a]"]
    else:
        maps = ["-vf", f"scale=-2:{height}", "-map", "0:v:0", "-map", "0:a:0?"]

    run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", path,
         *maps,
         "-c:v", "libx264", "-preset", "veryfast", "-b:v", f"{v_kbps}k",
         "-maxrate", f"{int(v_kbps * 1.4)}k", "-bufsize", f"{v_kbps * 2}k",
         "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", f"{audio_kbps}k", "-ac", "1",
         "-movflags", "+faststart", out_path])
    return os.path.getsize(out_path) / 1e6


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("-o", "--out", default="scout")
    ap.add_argument("--windows", default=None,
                    help="comma-separated ranges to extract, e.g. 1:20-1:50,8:20-9:40")
    ap.add_argument("--budget", type=float, default=20.0,
                    help="target megabytes for proxy/windows output")
    ap.add_argument("--proxy", action="store_true",
                    help="also make a low-res proxy of the whole video")
    ap.add_argument("--every", type=float, default=4.0,
                    help="seconds between contact-sheet frames")
    ap.add_argument("--no-sheets", action="store_true")
    args = ap.parse_args()

    if not os.path.exists(args.video):
        sys.exit(f"not found: {args.video}")
    os.makedirs(args.out, exist_ok=True)

    info = probe(args.video)
    print(f"{info['width']}x{info['height']} @ {info['fps']}fps  "
          f"{info['duration'] / 60:.1f} min  {info['size_mb']} MB")

    # ---- windows mode: pull just the ranges the edit list needs -----------
    if args.windows:
        segs = []
        for chunk in args.windows.split(","):
            chunk = chunk.strip()
            if not chunk:
                continue
            if "-" not in chunk:
                sys.exit(f"window needs a range: {chunk!r}")
            a, b = chunk.rsplit("-", 1)
            segs.append((parse_time(a), parse_time(b)))
        span = sum(b - a for a, b in segs)
        out = os.path.join(args.out, "windows.mp4")
        print(f"extracting {len(segs)} windows, {span:.0f}s total, "
              f"targeting {args.budget:.0f} MB ...")
        got = size_targeted(args.video, out, args.budget, span, segments=segs)

        # Times inside windows.mp4 run from 0, so record where each segment
        # came from and where it landed. That makes the file self-describing:
        # a config can be written against it without guessing.
        mapping, offset = [], 0.0
        for a, b in segs:
            mapping.append({
                "source_in": round(a, 3), "source_out": round(b, 3),
                "file_in": round(offset, 3), "file_out": round(offset + b - a, 3),
            })
            offset += b - a
        with open(os.path.join(args.out, "windows.json"), "w") as fh:
            json.dump({"source": info["path"], "segments": mapping}, fh, indent=1)

        print(f"\n{out}  ({got:.1f} MB)")
        print(f"{os.path.join(args.out, 'windows.json')}  (source -> file offsets)")
        for m in mapping:
            print(f"  {hhmmss(m['source_in'])} -> {m['file_in']:7.2f}s")
        print("\nUpload both files. Times inside windows.mp4 run from 0; "
              "windows.json says what came from where.")
        return

    # ---- survey mode -----------------------------------------------------
    with open(os.path.join(args.out, "info.json"), "w") as fh:
        json.dump(info, fh, indent=1)

    print("detecting scene changes ...")
    shots = detect_shots(args.video)
    n = write_shots(shots, info["duration"], os.path.join(args.out, "shots.txt"))
    print(f"  {n} shots")

    sheets = []
    if not args.no_sheets:
        print("building contact sheets ...")
        sheets = contact_sheets(args.video, info["duration"], args.out,
                                every=args.every)
        print(f"  {len(sheets)} sheets")

    if args.proxy:
        print(f"building proxy at ~{args.budget:.0f} MB ...")
        p = os.path.join(args.out, "proxy.mp4")
        got = size_targeted(args.video, p, args.budget, info["duration"],
                            height=360)
        print(f"  proxy.mp4 {got:.1f} MB")

    total = sum(os.path.getsize(os.path.join(args.out, f))
                for f in os.listdir(args.out)) / 1e6
    print(f"\n{args.out}/  —  {total:.1f} MB total. Upload this folder.")


if __name__ == "__main__":
    main()
