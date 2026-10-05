#!/usr/bin/env python3
"""
Full-frame backdrop photos for the Pins-format Shorts (src/pins/).

Same Openverse search and licence filter as fetch-photo-cutouts.py (by,
by-sa, cc0, pdm only; upload.wikimedia.org skipped), but no background
removal: the photo *is* the set the cutouts are composited onto. Every
candidate lands in the review folder with its credit beside it, so a human
picks — nothing is auto-chosen and nothing is licensed silently.

Usage:
    python3 scripts/fetch-photo-backdrops.py <episode> <queries.json> [--want N]

queries.json: {"sea": "calm ocean surface", "sky": "blue sky clouds", ...}
Writes:
    .photo-review/<episode>/bg-<id>-<n>.jpg
    .photo-review/<episode>/bg-<id>-<n>.credit.json
"""
import importlib.util
import io
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_spec = importlib.util.spec_from_file_location(
    "cutouts", os.path.join(ROOT, "scripts", "fetch-photo-cutouts.py"))
cutouts = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(cutouts)


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    episode = sys.argv[1]
    queries = json.load(open(sys.argv[2]))
    want = 3
    if "--want" in sys.argv:
        want = int(sys.argv[sys.argv.index("--want") + 1])

    from PIL import Image

    out_dir = os.path.join(ROOT, ".photo-review", episode)
    os.makedirs(out_dir, exist_ok=True)
    for bid, query in queries.items():
        print(f"== {bid}: {query!r} ==")
        try:
            candidates = cutouts.search(query, want)
        except Exception as e:
            print(f"  search failed: {e}")
            continue
        for n, c in enumerate(candidates):
            dst = os.path.join(out_dir, f"bg-{bid}-{n}.jpg")
            if os.path.exists(dst):
                print(f"  [{n}] cached")
                continue
            try:
                im = Image.open(io.BytesIO(cutouts.get(c["url"]))).convert("RGB")
                im.save(dst, quality=92)
                json.dump(c, open(dst[:-4] + ".credit.json", "w"), indent=2)
                print(f"  [{n}] {c['title'][:60]!r} ({c['license']}) {im.width}x{im.height}")
            except Exception as e:
                print(f"  [{n}] failed: {e}")
    print(f"\nreview candidates in {out_dir}")


if __name__ == "__main__":
    main()
