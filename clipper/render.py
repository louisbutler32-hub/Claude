#!/usr/bin/env python3
"""Render a short from a project config.

    python3 render.py projects/red-bull/config.json
    python3 render.py projects/red-bull/config.json --preview 0 12

Config shape — see projects/_template/config.json for a documented example:

    {
      "slug":   "gold-bars",
      "title":  "He Turned Old Jewelry into Pure Gold 😳 (@NileRed/YT)",
      "source": "source/nilered-gold.mp4",
      "vo":     "vo/gold.wav",
      "words":  "vo/gold.words.json",
      "music":  "music/bed.mp3",
      "clips":  [{"in": 120.5, "out": 121.6, "pan": 0.2}, ...],
      "keywords": {"gold": "#FFD700"},
      "annotations": [{"t": 16.2, "type": "arrow", "x": 0.62, "y": 0.55}],
      "source_audio_windows": [[55.5, 59.1]]
    }
"""

import argparse
import json
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lib import annotate, audio, captions, media, spec, video  # noqa: E402
from lib.video import run  # noqa: E402
from validate import validate  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.join(HERE, "assets", "fonts")


def resolve(base, path):
    if not path:
        return None
    return path if os.path.isabs(path) else os.path.normpath(os.path.join(base, path))


def load_words(cfg, base):
    """Word timings drive the captions. Prefer an explicit file, else inline."""
    if cfg.get("words"):
        with open(resolve(base, cfg["words"])) as fh:
            data = json.load(fh)
        return data["words"] if isinstance(data, dict) else data
    if cfg.get("word_list"):
        return cfg["word_list"]
    raise SystemExit(
        "config has no word timings: run transcribe.py on the VO and set "
        '"words" to the resulting .words.json'
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("config")
    ap.add_argument("-o", "--out", default=None)
    ap.add_argument("--preview", nargs=2, type=float, metavar=("START", "END"),
                    help="render only this time range, for a fast look")
    ap.add_argument("--no-captions", action="store_true")
    ap.add_argument("--keep-work", action="store_true")
    args = ap.parse_args()

    cfg_path = os.path.abspath(args.config)
    base = os.path.dirname(cfg_path)
    with open(cfg_path) as fh:
        cfg = json.load(fh)

    slug = cfg.get("slug") or os.path.basename(base)
    source = media.find("video", resolve(base, cfg.get("source")),
                        os.path.join(base, "source"), label="source footage",
                        key="source")

    clips = cfg.get("clips") or []
    if not clips:
        raise SystemExit(
            "config has no clips yet — the edit list is empty.\n"
            "Nothing to cut until \"clips\" has in/out times against the source."
        )

    work = os.path.join(base, ".work")
    os.makedirs(work, exist_ok=True)
    out_path = args.out or os.path.join(HERE, "out", f"{slug}.mp4")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)

    # ---------------------------------------------------------- 1. cut
    print(f"cutting {len(clips)} shots ...")
    shot_paths = video.cut_all(
        source, clips, work,
        on_progress=lambda i, n: print(f"\r  {i}/{n}", end="", flush=True),
    )
    print()
    silent = video.concat(shot_paths, os.path.join(work, "silent.mp4"), work)
    duration = video.probe_duration(silent)
    print(f"cut runtime: {duration:.2f}s")

    # ---------------------------------------------------------- 2. captions
    filters, extra_inputs = [], []
    label = "0:v"
    if not args.no_captions:
        words = load_words(cfg, base)
        ass_path = os.path.join(work, "captions.ass")
        captions.write_ass(ass_path, words, cfg.get("keywords"))
        escaped = ass_path.replace("\\", "/").replace(":", r"\:")
        fonts = FONT_DIR.replace("\\", "/").replace(":", r"\:")
        filters.append(f"[0:v]ass='{escaped}':fontsdir='{fonts}'[cap]")
        label = "cap"

    # ---------------------------------------------------------- 3. annotations
    assets = annotate.render_annotation_assets(cfg.get("annotations") or [], work)
    label, anno_inputs, anno_parts = annotate.overlay_filter(assets, label, 1)
    extra_inputs += anno_inputs
    filters += anno_parts

    if not filters:
        filters.append("[0:v]null[out]")
        label = "out"

    burned = os.path.join(work, "burned.mp4")
    print("burning captions and annotations ...")
    run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", silent,
        *extra_inputs,
        "-filter_complex", ";".join(filters),
        "-map", f"[{label}]" if not label.endswith(":v") else label,
        "-c:v", "libx264", "-preset", "medium", "-crf", "18",
        "-pix_fmt", "yuv420p", "-r", str(spec.FPS),
        # annotation stills are looped inputs, so bound the output by the cut
        "-t", f"{duration:.3f}", burned,
    ])

    # ---------------------------------------------------------- 4. audio
    vo = media.find("audio", resolve(base, cfg.get("vo")),
                    os.path.join(base, "vo"), required=False, label="voiceover",
                    key="vo")
    music = media.find("audio", resolve(base, cfg.get("music")),
                       os.path.join(base, "music"), required=False,
                       label="music bed", key="music")
    windows = cfg.get("source_audio_windows") or []
    track = None
    if vo or music or windows:
        print("mixing audio ...")
        track = audio.build_mix(
            os.path.join(work, "mix.wav"), duration,
            vo=vo, music=music,
            source_video=silent if windows else None,
            source_windows=windows,
        )

    # ---------------------------------------------------------- 5. mux
    print("mastering ...")
    cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", burned]
    if track:
        cmd += ["-i", track]
    if args.preview:
        s, e = args.preview
        cmd += ["-ss", f"{s:.3f}", "-to", f"{e:.3f}"]
    cmd += ["-c:v", "libx264", "-preset", "slow", "-crf", "19",
            "-profile:v", "high", "-pix_fmt", "yuv420p",
            "-movflags", "+faststart", "-r", str(spec.FPS)]
    cmd += (["-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest"]
            if track else ["-an"])
    cmd += [out_path]
    run(cmd)

    if not args.keep_work:
        shutil.rmtree(work, ignore_errors=True)

    size_mb = os.path.getsize(out_path) / 1e6
    print(f"\n{out_path}  ({duration:.1f}s, {size_mb:.1f} MB)")
    if track:
        print("  loudness:", audio.measure(out_path))

    # ---------------------------------------------------------- 6. check
    report = validate(cfg, clips, duration,
                      None if args.no_captions else load_words(cfg, base))
    print()
    print(report)


if __name__ == "__main__":
    main()
