#!/usr/bin/env python3
"""Cut the owner's character sheets into transparent sprites.

Reads public/images/chars-src/{speed,kai}-sheet.jpg (the owner's own art, never
committed) and writes public/images/chars/*.png: each figure lifted off its
sheet background by flood-filling in from the edge through anything pale and
unsaturated (the lavender and cream panels and the drop shadow), stopped by the
figure's own dark outline, then upscaled 3x with Lanczos and a light feather.
The pictures are the characters exactly as drawn; nothing is redrawn.

    python3 scripts/cut-characters.py
"""
import os
from collections import deque

import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "images", "chars-src")
OUT = os.path.join(ROOT, "public", "images", "chars")
os.makedirs(OUT, exist_ok=True)

# name -> (sheet, (x0, y0, x1, y1))
CUTS = {
    "speed-hero": ("speed-sheet.jpg", (5, 235, 312, 745)),
    "speed-fallen": ("speed-sheet.jpg", (395, 1160, 735, 1330)),
    "kai-think": ("kai-sheet.jpg", (30, 200, 310, 700)),
    "kai-walk": ("kai-sheet.jpg", (15, 715, 150, 975)),
    "kai-stand": ("kai-sheet.jpg", (305, 715, 435, 975)),
    "kai-shrug": ("kai-sheet.jpg", (580, 715, 755, 975)),
    "kai-thumbs": ("kai-sheet.jpg", (245, 990, 395, 1245)),
    "kai-fall": ("kai-sheet.jpg", (520, 1140, 745, 1260)),
}


def cut(sheet, box, name, up=3):
    im = Image.open(os.path.join(SRC, sheet)).convert("RGB").crop(box)
    a = np.asarray(im).astype(int)
    h, w, _ = a.shape
    mx, mn = a.max(2), a.min(2)
    sat = (mx - mn) / np.maximum(mx, 1)
    lum = a.mean(2)
    pale = (lum > 150) & (sat < 0.26)  # lavender, cream, and the soft shadow all read as pale + unsaturated
    bg = np.zeros((h, w), bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if pale[y, x]: bg[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if pale[y, x] and not bg[y, x]: bg[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and pale[ny, nx] and not bg[ny, nx]:
                bg[ny, nx] = True; q.append((ny, nx))
    alpha = Image.fromarray(((~bg) * 255).astype(np.uint8))
    # shrink the mask a pixel so no sheet-coloured fringe survives, then feather
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
    rgb = im.resize((w * up, h * up), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 60, 2))
    alpha = alpha.resize((w * up, h * up), Image.LANCZOS)
    out = rgb.convert("RGBA")
    out.putalpha(alpha)
    bbox = out.getbbox()
    out = out.crop(bbox)
    out.save(os.path.join(OUT, name + ".png"))
    print(name, out.size)


if __name__ == "__main__":
    for name, (sheet, box) in CUTS.items():
        cut(sheet, box, name)
