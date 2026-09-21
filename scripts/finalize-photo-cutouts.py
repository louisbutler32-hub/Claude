#!/usr/bin/env python3
"""
Takes the picked candidates from .photo-review/<episode>/ and turns them
into the final art: trimmed to the subject's own alpha bounding box (a
little padding kept), so `photoArt()`'s BOX-fit sizing measures the actual
subject rather than the padded source photo.

Usage:
    python3 scripts/finalize-photo-cutouts.py <episode> <picks.json>

picks.json: {"cow": "cow-0", "lion": "lion-2", ...}
             (id -> the "<id>-<n>" candidate to use, from .photo-review/<episode>/)

Writes:
    public/images/<episode>/<id>.png
    public/images/<episode>/credits.json
"""
import json
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAD = 6


def trim(img: Image.Image) -> Image.Image:
    alpha = img.split()[-1]
    bbox = alpha.getbbox()
    if not bbox:
        return img
    l, t, r, b = bbox
    l = max(0, l - PAD)
    t = max(0, t - PAD)
    r = min(img.width, r + PAD)
    b = min(img.height, b + PAD)
    return img.crop((l, t, r, b))


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    episode, picks_path = sys.argv[1], sys.argv[2]
    picks = json.load(open(picks_path))

    review_dir = os.path.join(ROOT, ".photo-review", episode)
    out_dir = os.path.join(ROOT, "public", "images", episode)
    os.makedirs(out_dir, exist_ok=True)

    credits = []
    for aid, candidate in picks.items():
        src_png = os.path.join(review_dir, f"{candidate}.png")
        src_credit = os.path.join(review_dir, f"{candidate}.credit.json")
        if not os.path.exists(src_png):
            sys.exit(f"missing {src_png}")
        img = Image.open(src_png).convert("RGBA")
        trimmed = trim(img)
        dst_file = f"{aid}.png"
        trimmed.save(os.path.join(out_dir, dst_file))
        c = json.load(open(src_credit))
        credits.append({
            "id": aid,
            "file": dst_file,
            "width": trimmed.width,
            "height": trimmed.height,
            "title": c["title"],
            "license": (c["license"] + (" " + c["license_version"] if c.get("license_version") else "")).strip(),
            "creator": c.get("creator", "unknown"),
            "page": c.get("page", ""),
        })
        print(f"{aid}: {candidate} -> {dst_file}  {trimmed.width}x{trimmed.height}  "
              f"({c['license']}, {c.get('creator')})")

    json.dump(credits, open(os.path.join(out_dir, "credits.json"), "w"), indent=2)
    print(f"\nwrote {len(credits)} images + credits.json to {out_dir}")


if __name__ == "__main__":
    main()
