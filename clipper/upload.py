#!/usr/bin/env python3
"""Build the upload package for a short: title, description, tags, thumbnail.

    python3 upload.py projects/gold-bars/config.json

Writes `projects/<slug>/upload.md` and `out/thumbnail-<slug>.jpg` (1080x1920,
the 9:16 thumbnail size for Shorts).

A render never goes out on its own — the package goes with it in the same
message. See CLAUDE.md.

Chapters do not apply here: these are sub-60s Shorts, and YouTube's chapter
list needs every chapter to be at least 10s. The beat map in the config serves
the same purpose for the edit, so it is written into upload.md as a reference
rather than as a chapter list.
"""

import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lib import spec  # noqa: E402
from lib.video import run  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.join(HERE, "assets", "fonts")

# Fixed block from CLAUDE.md — goes near the end of the description, above the
# hashtags, on every learning video.
CHANNEL_BLOCK = """📚 ALL OUR LEARNING VIDEOS
https://www.youtube.com/playlist?list=PLoUPhFQ29b0IFLdy3cMomLyy1RDAkV2zg

🥕 Subscribe to Pebblo Pebble:
https://www.youtube.com/@PebbloPebble"""

TAG_LIMIT = 500


def resolve(base, path):
    if not path:
        return None
    return path if os.path.isabs(path) else os.path.normpath(os.path.join(base, path))


def fit_tags(tags):
    """YouTube counts the comma-joined string against a 500-character cap."""
    kept, total = [], 0
    for t in tags:
        cost = len(t) + (1 if kept else 0)
        if total + cost > TAG_LIMIT:
            continue
        kept.append(t)
        total += cost
    return kept, total


def build_thumbnail(cfg, base, slug, out_path):
    """Pull a frame and lay the hook line over it in the caption face."""
    thumb = cfg.get("thumbnail") or {}
    text = thumb.get("text")
    if not text:
        return None, "no thumbnail.text in config"

    # Prefer the finished render so the framing matches what viewers see.
    render = os.path.join(HERE, "out", f"{slug}.mp4")
    src = render if os.path.exists(render) else resolve(base, cfg.get("source"))
    if not src or not os.path.exists(src):
        return None, f"no footage to grab from (looked for {render})"

    at = float(thumb.get("frame", 2.0))
    lines = text.upper().split("|")
    size = int(thumb.get("size", 150))
    # Stack the lines around the caption line, same face and stroke as the edit.
    draws = []
    for i, line in enumerate(lines):
        offset = (i - (len(lines) - 1) / 2) * size * 1.15
        body = line.strip().replace("'", r"\'").replace(":", r"\:")
        draws.append(
            f"drawtext=fontfile='{os.path.join(FONT_DIR, spec.CAPTION_FONT_FILE)}'"
            f":text='{body}':fontcolor=white:fontsize={size}"
            f":borderw={spec.CAPTION_STROKE}:bordercolor=black"
            f":x=(w-text_w)/2:y=(h-text_h)/2+{offset:.0f}"
        )

    vf = ",".join(
        [f"scale={spec.WIDTH}:{spec.HEIGHT}:force_original_aspect_ratio=increase",
         f"crop={spec.WIDTH}:{spec.HEIGHT}",
         "eq=contrast=1.08:saturation=1.15"] + draws
    )
    run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
         "-ss", f"{at:.2f}", "-i", src, "-frames:v", "1",
         "-vf", vf, "-q:v", "2", out_path])
    return out_path, None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("config")
    ap.add_argument("--no-channel-block", action="store_true",
                    help="omit the Pebblo Pebble playlist/subscribe block")
    args = ap.parse_args()

    cfg_path = os.path.abspath(args.config)
    base = os.path.dirname(cfg_path)
    with open(cfg_path) as fh:
        cfg = json.load(fh)

    slug = cfg.get("slug") or os.path.basename(base)
    title = cfg.get("title", "")
    if "@" not in title:
        sys.exit("title must credit the source creator with @handle")

    alts = cfg.get("title_alternates") or []
    summary = cfg.get("summary", "").strip()
    credit = cfg.get("credit") or {}
    tags, tag_chars = fit_tags(cfg.get("tags") or [])
    hashtags = cfg.get("hashtags") or ["#shorts", "#science"]

    parts = [summary] if summary else []
    if credit.get("creator"):
        line = f"🎥 Original video by {credit['creator']}"
        if credit.get("url"):
            line += f"\n{credit['url']}"
        parts.append(line)
    if not args.no_channel_block:
        parts.append(CHANNEL_BLOCK)
    parts.append(" ".join(hashtags))
    description = "\n\n".join(parts)

    os.makedirs(os.path.join(HERE, "out"), exist_ok=True)
    thumb_path = os.path.join(HERE, "out", f"thumbnail-{slug}.jpg")
    thumb, thumb_err = build_thumbnail(cfg, base, slug, thumb_path)

    beats = cfg.get("beats") or []
    beat_table = ""
    if beats:
        rows = "\n".join(
            f"| {b.get('t', '')} | {b.get('beat', '')} | {b.get('line', '')} |"
            for b in beats
        )
        beat_table = (
            "\n## Beat map\n\nReference for the edit — not a YouTube chapter "
            "list; a sub-60s Short cannot carry one.\n\n"
            "| Time | Beat | Line |\n|---|---|---|\n" + rows + "\n"
        )

    doc = f"""# {slug} — upload package

## Title

**{title}**

Alternates:

{chr(10).join(f'{i + 1}. {a}' for i, a in enumerate(alts)) or '_none set_'}

## Description

```
{description}
```

## Tags

{tag_chars}/{TAG_LIMIT} characters used.

```
{", ".join(tags)}
```

## Thumbnail

{f"`out/thumbnail-{slug}.jpg` — 1080x1920 (9:16)" if thumb else f"**not built** — {thumb_err}"}

## Upload settings

- Made for kids: **no** — this is not aimed at under-13s
- Category: Science & Technology
- Shorts: yes (vertical, under 60s)
{beat_table}"""

    out_md = os.path.join(base, "upload.md")
    with open(out_md, "w", encoding="utf-8") as fh:
        fh.write(doc)

    print(f"{out_md}")
    if thumb:
        print(f"{thumb}")
    else:
        print(f"thumbnail skipped: {thumb_err}")
    print(f"\ntitle:  {title}")
    print(f"tags:   {len(tags)} tags, {tag_chars}/{TAG_LIMIT} chars")
    if len(tags) < len(cfg.get("tags") or []):
        dropped = len(cfg.get("tags") or []) - len(tags)
        print(f"        {dropped} tag(s) dropped to stay under the cap")


if __name__ == "__main__":
    main()
