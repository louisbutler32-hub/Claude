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

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAD = 6

# Only drop near-zero noise (stray low-confidence flecks) — do NOT stretch
# the upper range. A first version of this stretched mid-confidence alpha
# toward fully opaque too, which on rembg's actual failure mode (a patch of
# BACKGROUND that got moderate-high confidence, not a thin uncertain edge)
# made a soft, barely-visible smear into a hard, fully-opaque rectangle —
# worse than doing nothing. Wrong-but-confident is a content error a curve
# can't fix; see patch_region() for how those get handled instead.
ALPHA_NOISE_FLOOR = 25


def crisp_alpha(img: Image.Image) -> Image.Image:
    arr = np.array(img)
    a = arr[:, :, 3]
    arr[:, :, 3] = np.where(a < ALPHA_NOISE_FLOOR, 0, a)
    # Some previewers (and any consumer that isn't careful about alpha)
    # show the leftover RGB under a fully transparent pixel instead of
    # compositing it away — harmless in a spec-correct renderer, but zero
    # it too so a stray hue never surfaces where it shouldn't.
    arr[arr[:, :, 3] == 0] = 0
    return Image.fromarray(arr)


def keep_largest_component(img: Image.Image) -> Image.Image:
    """rembg sometimes leaves a small disconnected blob in frame — a chip
    of pedestal, a fold of background it misread as foreground — separate
    from the actual subject. Keeping only the largest connected alpha
    region drops those automatically instead of hand-picking a box per
    image; a genuinely connected prop (fur, a held object) is untouched
    since it's part of the same component as the subject."""
    arr = np.array(img)
    mask = arr[:, :, 3] > ALPHA_NOISE_FLOOR
    lbl, n = ndimage.label(mask)
    if n <= 1:
        return img
    sizes = ndimage.sum(mask, lbl, range(1, n + 1))
    biggest = 1 + int(np.argmax(sizes))
    arr[:, :, 3] = np.where(lbl == biggest, arr[:, :, 3], 0)
    return Image.fromarray(arr)


def patch_region(img: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    """Force a rectangular region fully transparent — for a spot rembg's
    mask got confidently wrong (an in-frame background patch, not a thin
    uncertain edge), found by eye and cleaned by hand rather than guessed
    at with a global curve."""
    arr = np.array(img)
    l, t, r, b = box
    arr[t:b, l:r, 3] = 0
    return Image.fromarray(arr)


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
        img = crisp_alpha(Image.open(src_png).convert("RGBA"))
        img = keep_largest_component(img)
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
