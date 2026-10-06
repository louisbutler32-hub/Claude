#!/usr/bin/env python3
"""Turn generated full-body photos into head-less bodies for PhotoPerson.

    python3 scripts/prep-people.py scripts/people.json

people.json: {"out": "public/images/pins-people", "poses": [
    {"id": "keeper-stand", "src": ".photo-review/people-ai/keeper-stand-a.jpg",
     "crop": [x0, y0, x1, y1],          # optional: one figure out of a sheet (px)
     "neck": [x, y],                     # optional override, px in the source image
     "head": [cx, cy, rx, ry],           # optional override of the head ellipse, px in the source
     "turn": 0.3, "tilt": 0,             # which way the body faces; its head angle
     "model": "u2net"}                   # optional: rembg model for poses holding a prop
]}

For each pose: crop, cut the background (rembg u2net_human_seg: made for
people, fast on CPU), trim to the figure, find the neck (the narrowest row
between the top of the head and the shoulders) and erase the real head
above it, so the comic head mounts cleanly at the neck. Writes
<out>/<id>.png and <out>/poses.json with each pose's size, neck point and
head width in 0–1 of the image, for src/pins/people.tsx.
"""
import io, json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def find_neck(a):
    """a: alpha (H, W) uint8 of a trimmed upright figure. Returns (neck_y, cx, head_w, head_top)."""
    H, W = a.shape
    on = a > 100
    rows = np.where(on.any(1))[0]
    top = rows[0]
    widths = []
    spans = []
    for y in range(top, top + int(H * 0.28)):
        xs = np.where(on[y])[0]
        if len(xs) == 0:
            widths.append(0); spans.append((0, 0)); continue
        # the run of the figure nearest the head's centre column
        widths.append(xs[-1] - xs[0]); spans.append((xs[0], xs[-1]))
    widths = np.array(widths, float)
    head_h_guess = int(H * 0.13)
    head_w = widths[: head_h_guess].max()
    # neck: narrowest row between ~60% of a head height and ~1.6 head heights down
    lo, hi = int(head_h_guess * 0.6), min(len(widths) - 1, int(head_h_guess * 1.6))
    k = lo + int(np.argmin(widths[lo:hi])) if hi > lo else head_h_guess
    neck_y = top + k
    x0, x1 = spans[k]
    return neck_y, (x0 + x1) / 2, head_w, top


def main():
    spec = json.load(open(sys.argv[1]))
    out = os.path.join(ROOT, spec["out"])
    os.makedirs(out, exist_ok=True)
    from rembg import new_session, remove
    sess = new_session("u2net_human_seg")
    sessions = {}
    index = {}
    for p in spec["poses"]:
        im = Image.open(os.path.join(ROOT, p["src"])).convert("RGB")
        ox, oy = (p["crop"][0], p["crop"][1]) if "crop" in p else (0, 0)
        if "crop" in p:
            im = im.crop(tuple(p["crop"]))
        # a pose holding a prop (honeycomb, a tool) wants a general model: the people one drops the prop
        cut = remove(im, session=sessions.setdefault(p["model"], new_session(p["model"]))) if "model" in p else remove(im, session=sess)
        a = np.array(cut)[..., 3]
        a[a < 25] = 0
        cut.putalpha(Image.fromarray(a))
        bbox = cut.getbbox()
        pad = 6
        bbox = (max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(cut.width, bbox[2] + pad), min(cut.height, bbox[3] + pad))
        cut = cut.crop(bbox)
        a = np.array(cut)[..., 3]
        H, W = a.shape
        if "neck" in p:
            nx, ny = p["neck"][0] - ox - bbox[0], p["neck"][1] - oy - bbox[1]
        else:
            ny, nx, _, _ = find_neck(a)
        if "head" in p:
            cx, cy, rx, ry = p["head"]; cx -= ox + bbox[0]; cy -= oy + bbox[1]
        else:
            top = np.where((a > 100).any(1))[0][0]
            cy = (top + ny) / 2
            ry = (ny - top) / 2 + 4
            row = np.where(a[int(cy)] > 100)[0]
            cx = (row[0] + row[-1]) / 2 if len(row) else nx
            rx = max((row[-1] - row[0]) / 2 + 6 if len(row) else ry * 0.8, ry * 0.7)
        # erase the real head: its ellipse, plus everything above the neck line inside it
        m = Image.new("L", (W, H), 0)
        d = ImageDraw.Draw(m)
        d.ellipse((cx - rx * 1.12, cy - ry * 1.15, cx + rx * 1.12, ny + ry * 0.08), fill=255)
        m = m.filter(ImageFilter.GaussianBlur(1.5))
        alpha = np.array(cut)[..., 3].astype(np.float32) * (1 - np.array(m, np.float32) / 255)
        cut.putalpha(Image.fromarray(alpha.astype(np.uint8)))
        # drop stray islands (a cap brim, a hand-off scrap): keep blobs over 2% of the figure
        from scipy import ndimage
        al = np.array(cut)[..., 3]
        lab, n = ndimage.label(al > 40)
        if n > 1:
            sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
            keep = np.isin(lab, [i + 1 for i, sz in enumerate(sizes) if sz > 0.02 * sizes.max()])
            al = np.where(keep, al, 0).astype(np.uint8)
            cut.putalpha(Image.fromarray(al))
        cut.save(os.path.join(out, p["id"] + ".png"))
        index[p["id"]] = {"file": p["id"] + ".png", "w": W, "h": H,
                          "neck": [round(nx / W, 4), round(ny / H, 4)],
                          "headW": round(rx * 2 / W, 4),
                          "turn": p.get("turn", 0), "tilt": p.get("tilt", 0)}
        print(f"{p['id']:16s} {W}x{H} neck=({nx:.0f},{ny:.0f}) head w={rx*2:.0f}")
    json.dump(index, open(os.path.join(out, "poses.json"), "w"), indent=1)


if __name__ == "__main__":
    main()
