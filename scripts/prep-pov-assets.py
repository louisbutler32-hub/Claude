#!/usr/bin/env python3
"""Key the white background out of the owner's pickaxe and creeper pictures.

Reads public/images/pov-src/{pickaxe,creeper}.png (never committed) and writes
public/images/pov/{pickaxe,creeper}.png with the background made transparent:
only near-white pixels connected to the edge of the picture go, so whites
inside the art survive.
"""
import os

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "images", "pov-src")
OUT = os.path.join(ROOT, "public", "images", "pov")
os.makedirs(OUT, exist_ok=True)
for name in ("pickaxe", "creeper"):
    im = Image.open(os.path.join(SRC, name + ".png")).convert("RGB")
    a = np.array(im)
    near_white = (a.min(axis=2) > 236)
    lab, n = ndimage.label(near_white)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge))
    alpha = np.where(bg, 0, 255).astype(np.uint8)
    out = np.dstack([a, alpha])
    ys, xs = np.where(alpha > 0)
    box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    Image.fromarray(out, "RGBA").crop(box).save(os.path.join(OUT, name + ".png"))
    print(name, im.size, "->", (box[2] - box[0], box[3] - box[1]))
