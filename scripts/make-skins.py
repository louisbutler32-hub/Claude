#!/usr/bin/env python3
"""Paint the two Minecraft-style skins for the La Peace remake.

Writes public/images/skins/{speed,kai}.png (64x64, the standard layout: head
(0,0), right leg (0,16), body (16,16), right arm (40,16)) plus {speed,kai}-hair.png
(a separate 64x64 atlas for the hair pieces). The faces are NOT painted here: the
renderer draws expressions on top of the head's front, pixel by pixel.

    python3 scripts/make-skins.py
"""
import os
import random

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "images", "skins")
os.makedirs(OUT, exist_ok=True)

LAYOUT = {  # name: (u, v, dx, dy, dz)
    "head": (0, 0, 8, 8, 8), "legR": (0, 16, 4, 12, 4), "body": (16, 16, 8, 12, 4), "armR": (40, 16, 4, 12, 4),
}


def faces(u, v, dx, dy, dz):
    return {
        "top": (u + dz, v, dx, dz), "bottom": (u + dz + dx, v, dx, dz),
        "right": (u, v + dz, dz, dy), "front": (u + dz, v + dz, dx, dy),
        "left": (u + dz + dx, v + dz, dz, dy), "back": (u + 2 * dz + dx, v + dz, dx, dy),
    }


def fill(im, rect, color):
    x, y, w, h = rect
    for j in range(h):
        for i in range(w):
            im.putpixel((x + i, y + j), color)


def mix(c, k):
    return tuple(max(0, min(255, int(v * k))) for v in c[:3]) + (255,)


def noise(im, rect, base, amt, seed):
    rnd = random.Random(seed)
    x, y, w, h = rect
    for j in range(h):
        for i in range(w):
            k = 1 + (rnd.random() - 0.5) * amt
            im.putpixel((x + i, y + j), mix(base, k))


def skin(name, c):
    im = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    skin_c, hoodie, pants, shoe, hair = c["skin"], c["hoodie"], c["pants"], c["shoe"], c["hair"]
    # head: skin on every face, hair on the back, top, and a fringe at the top of the sides and front
    f = faces(*LAYOUT["head"])
    for k, r in f.items():
        noise(im, r, skin_c, 0.08, hash(k) & 255)
    noise(im, f["top"], hair, 0.35, 3)
    noise(im, f["back"], hair, 0.35, 4)
    for k in ("right", "left"):
        x, y, w, h = f[k]
        noise(im, (x, y, w, 3), hair, 0.3, 5)
        noise(im, (x + (0 if k == "right" else w - 1), y, 1, h), hair, 0.3, 6)  # the sideburn edge at the back
    x, y, w, h = f["front"]
    noise(im, (x, y, w, 2), hair, 0.3, 7)
    for (hx, hy) in c.get("hairline", []):
        im.putpixel((x + hx, y + hy), mix(hair, 1.0))
    # body: the hoodie
    b = faces(*LAYOUT["body"])
    for k, r in b.items():
        noise(im, r, hoodie, 0.08, hash(k) & 255)
    fx, fy, fw, fh = b["front"]
    fill(im, (fx + 2, fy + 7, 4, 3), mix(hoodie, 0.82))  # the pocket
    for dx in (2, 5):
        fill(im, (fx + dx, fy + 1, 1, 4), (240, 240, 240, 255))  # drawstrings
    if c.get("patch"):
        fill(im, (fx + 5, fy + 5, 2, 1), (255, 255, 255, 255))
        fill(im, (fx + 5, fy + 6, 2, 1), (230, 230, 240, 255))
    fill(im, (fx, fy, fw, 1), mix(hoodie, 0.8))  # the hood at the neck
    # arms: sleeve, then the hand
    a = faces(*LAYOUT["armR"])
    for k, r in a.items():
        noise(im, r, hoodie, 0.08, hash(k) & 255)
    for k in ("right", "front", "left", "back"):
        x, y, w, h = a[k]
        fill(im, (x, y + h - 3, w, 3), skin_c)
        noise(im, (x, y + h - 3, w, 3), skin_c, 0.08, 11)
    noise(im, a["bottom"], skin_c, 0.08, 12)
    # legs: trousers and trainers
    l = faces(*LAYOUT["legR"])
    for k, r in l.items():
        noise(im, r, pants, 0.1, hash(k) & 255)
    for k in ("right", "front", "left", "back"):
        x, y, w, h = l[k]
        fill(im, (x, y + h - 3, w, 2), shoe)
        fill(im, (x, y + h - 1, w, 1), (40, 40, 48, 255))
    im.save(os.path.join(OUT, name + ".png"))

    # hair atlas: every piece reads as the same dark, curly or twisted mass with a few lit pixels
    hm = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    noise(hm, (0, 0, 64, 64), hair, 0.5, 21)
    rnd = random.Random(33)
    for _ in range(90):
        hm.putpixel((rnd.randrange(64), rnd.randrange(64)), mix(hair, 1.9))
    hm.save(os.path.join(OUT, name + "-hair.png"))


skin("speed", dict(skin=(184, 118, 74, 255), hoodie=(122, 82, 214, 255), pants=(42, 49, 80, 255), shoe=(247, 243, 238, 255), hair=(27, 21, 32, 255), patch=True))
skin("kai", dict(skin=(143, 90, 53, 255), hoodie=(31, 107, 59, 255), pants=(39, 50, 79, 255), shoe=(255, 255, 255, 255), hair=(26, 18, 24, 255)))
# the toga (white cloth with a gold belt) and laurel leaves, as whole-picture textures
toga = Image.new("RGBA", (64, 64), (250, 247, 238, 255))
for y in range(64):
    for x in range(64):
        k = 1 + (random.Random(x * 64 + y).random() - 0.5) * 0.06 + (0.03 if (x // 8) % 2 else 0)
        toga.putpixel((x, y), mix((250, 247, 238), k))
for y in range(40, 46):
    for x in range(64):
        toga.putpixel((x, y), (216, 178, 74, 255))
toga.save(os.path.join(OUT, "toga.png"))
marble = Image.new("RGBA", (64, 64), (240, 234, 220, 255))
for y in range(64):
    for x in range(64):
        k = 1 + (random.Random(x * 131 + y * 7).random() - 0.5) * 0.05 - (0.05 if x % 16 in (0, 1) else 0)
        marble.putpixel((x, y), mix((240, 234, 220), k))
marble.save(os.path.join(OUT, "marble.png"))
leaf = Image.new("RGBA", (16, 16), (90, 168, 58, 255))
noise(leaf, (0, 0, 16, 16), (90, 168, 58, 255), 0.35, 8)
for i in range(16):
    leaf.putpixel((i, 8), (60, 130, 40, 255))
leaf.save(os.path.join(OUT, "leaf.png"))
print("wrote", OUT)
