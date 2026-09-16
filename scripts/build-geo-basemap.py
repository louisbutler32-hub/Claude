#!/usr/bin/env python3
"""Build the satellite basemap tiles the geo shorts render on.

    python3 scripts/build-geo-basemap.py             # world levels + every region
    python3 scripts/build-geo-basemap.py --world     # just the world levels 0-5
    python3 scripts/build-geo-basemap.py --region darien

Source: NASA Blue Marble Next Generation, August 2004, with topography and
bathymetry. NASA imagery is public domain, so the whole frame is ours to
colour and monetise. The files are fetched into .geo/ on first run and cached
there (the eight 21600x21600 quadrants are ~55 MB each).

Output: public/assets/geo/tiles/{z}/{x}/{y}.jpg — 512 px Web Mercator tiles
addressed like any slippy map. Levels 0-5 cover the whole planet; deeper
levels are only built inside the regions in src/geo/data/regions.json, which
is also what the renderer reads to know which tiles exist. Downloads and
tiles are both gitignored: they are derived, and a few hundred megabytes.

Needs:  pip install pillow numpy
"""
import json
import math
import os
import sys
import urllib.request

import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None  # the quadrants are 466 megapixels each

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, ".geo")
OUT = os.path.join(ROOT, "public", "assets", "geo", "tiles")
REGIONS = os.path.join(ROOT, "src", "geo", "data", "regions.json")
NASA = "https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73776/"
SMALL = "world.topo.bathy.200408.3x5400x2700.jpg"
QUAD = "world.topo.bathy.200408.3x21600x21600.%s.jpg"
QUADS = ["A1", "B1", "C1", "D1", "A2", "B2", "C2", "D2"]
QUAD_PX = 21600
T = 512
JPEG_QUALITY = 88


def fetch(name, dest):
    if os.path.exists(dest):
        return dest
    print("  fetching %s" % name)
    urllib.request.urlretrieve(NASA + name, dest + ".part")
    os.rename(dest + ".part", dest)
    return dest


# ── Web Mercator ─────────────────────────────────────────────────────

def merc_y(lat_deg):
    """Latitude -> world-y fraction in [0, 1], 0 at the north edge (85.05°)."""
    phi = math.radians(max(-85.0511, min(85.0511, lat_deg)))
    return 0.5 - math.log(math.tan(math.pi / 4 + phi / 2)) / (2 * math.pi)


def merc_lat(f):
    """World-y fraction -> latitude in degrees (numpy-friendly)."""
    return np.degrees(2 * np.arctan(np.exp(np.pi * (1 - 2 * np.asarray(f, dtype=np.float64)))) - np.pi / 2)


# ── Sources ──────────────────────────────────────────────────────────
# A source is an equirectangular image of the whole planet at some pixels
# per degree, addressed by fractional column/row. Two of them: the small
# whole-world image for the coarse levels, and the eight native quadrants,
# loaded lazily, for the region levels.

class SmallSource:
    def __init__(self, path):
        self.img = Image.open(path).convert("RGB")
        self.ppd = self.img.width / 360.0

    def resize_box(self, c0, r0, c1, r1, size):
        w, h = self.img.size
        box = (max(0.0, c0), max(0.0, r0), min(float(w), c1), min(float(h), r1))
        return self.img.resize(size, Image.LANCZOS, box=box)


class QuadSource:
    ppd = QUAD_PX * 4 / 360.0  # 240 px per degree

    def __init__(self):
        self.cache = {}
        self.order = []

    def quad(self, qx, qy):
        key = "%s%d" % ("ABCD"[qx], qy + 1)
        if key not in self.cache:
            path = fetch(QUAD % key, os.path.join(CACHE, "bm-%s.jpg" % key))
            print("  decoding quadrant %s" % key)
            self.cache[key] = Image.open(path).convert("RGB")
            self.order.append(key)
            while len(self.order) > 2:  # 1.4 GB each — keep two
                del self.cache[self.order.pop(0)]
        return self.cache[key]

    def resize_box(self, c0, r0, c1, r1, size):
        c0 = max(0.0, c0); r0 = max(0.0, r0)
        c1 = min(QUAD_PX * 4.0, c1); r1 = min(QUAD_PX * 2.0, r1)
        qx0, qx1 = int(c0 // QUAD_PX), int(min(c1 - 1e-6, QUAD_PX * 4 - 1) // QUAD_PX)
        qy0, qy1 = int(r0 // QUAD_PX), int(min(r1 - 1e-6, QUAD_PX * 2 - 1) // QUAD_PX)
        if qx0 == qx1 and qy0 == qy1:
            q = self.quad(qx0, qy0)
            box = (c0 - qx0 * QUAD_PX, r0 - qy0 * QUAD_PX, c1 - qx0 * QUAD_PX, r1 - qy0 * QUAD_PX)
            return q.resize(size, Image.LANCZOS, box=box)
        # the box straddles a quadrant seam: paste the pieces into one image
        ic0, ir0 = int(math.floor(c0)), int(math.floor(r0))
        ic1, ir1 = int(math.ceil(c1)), int(math.ceil(r1))
        mosaic = Image.new("RGB", (ic1 - ic0, ir1 - ir0))
        for qy in range(qy0, qy1 + 1):
            for qx in range(qx0, qx1 + 1):
                q = self.quad(qx, qy)
                x0 = max(ic0, qx * QUAD_PX); x1 = min(ic1, (qx + 1) * QUAD_PX)
                y0 = max(ir0, qy * QUAD_PX); y1 = min(ir1, (qy + 1) * QUAD_PX)
                if x1 <= x0 or y1 <= y0:
                    continue
                part = q.crop((x0 - qx * QUAD_PX, y0 - qy * QUAD_PX, x1 - qx * QUAD_PX, y1 - qy * QUAD_PX))
                mosaic.paste(part, (x0 - ic0, y0 - ir0))
        return mosaic.resize(size, Image.LANCZOS, box=(c0 - ic0, r0 - ir0, c1 - ic0, r1 - ir0))


# ── Tiles ────────────────────────────────────────────────────────────

def render_tile(source, z, x, y):
    n = 2 ** z
    lon0 = x / n * 360 - 180
    lon1 = (x + 1) / n * 360 - 180
    lat_n = float(merc_lat(y / n))
    lat_s = float(merc_lat((y + 1) / n))
    c0 = (lon0 + 180) * source.ppd
    c1 = (lon1 + 180) * source.ppd
    r0 = (90 - lat_n) * source.ppd
    r1 = (90 - lat_s) * source.ppd
    # Resample the tile's footprint to a strip that is T wide and a few
    # times oversampled vertically, then remap rows through the Mercator
    # curve. Lanczos in the resize does the anti-aliasing; the row remap is
    # a smooth warp on top.
    H2 = int(max(T, min(4 * T, round(r1 - r0) * 2)))
    strip = np.asarray(source.resize_box(c0, r0, c1, r1, (T, H2)), dtype=np.float32)
    j = np.arange(T)
    lat = merc_lat((y + (j + 0.5) / T) / n)
    rr = (90 - lat) * source.ppd
    s = np.clip((rr - r0) / (r1 - r0) * H2 - 0.5, 0, H2 - 1)
    i0 = np.floor(s).astype(int)
    i1 = np.minimum(i0 + 1, H2 - 1)
    w = (s - i0)[:, None, None].astype(np.float32)
    out = strip[i0] * (1 - w) + strip[i1] * w
    return Image.fromarray(np.clip(out + 0.5, 0, 255).astype(np.uint8))


def write_tile(img, z, x, y):
    d = os.path.join(OUT, str(z), str(x))
    os.makedirs(d, exist_ok=True)
    img.save(os.path.join(d, "%d.jpg" % y), "JPEG", quality=JPEG_QUALITY, optimize=True)


def region_tiles(region, z):
    """Every (x, y) at level z that touches the region. Longitudes may run
    past 180 so a region can straddle the antimeridian; x wraps."""
    n = 2 ** z
    x0 = int(math.floor((region["west"] + 180) / 360 * n))
    x1 = int(math.floor((region["east"] + 180) / 360 * n - 1e-9))
    y0 = int(math.floor(merc_y(region["north"]) * n))
    y1 = int(math.floor(merc_y(region["south"]) * n - 1e-9))
    for y in range(max(0, y0), min(n - 1, y1) + 1):
        for x in range(x0, x1 + 1):
            yield x % n, y


def build_world(spec, source):
    done = 0
    for z in range(0, spec["worldMaxZoom"] + 1):
        n = 2 ** z
        for y in range(n):
            for x in range(n):
                path = os.path.join(OUT, str(z), str(x), "%d.jpg" % y)
                if os.path.exists(path):
                    continue
                write_tile(render_tile(source, z, x, y), z, x, y)
                done += 1
        print("  world level %d: %d tiles" % (z, n * n))
    return done


def build_region(spec, region, source):
    done = 0
    for z in range(spec["worldMaxZoom"] + 1, region["maxZoom"] + 1):
        count = 0
        for x, y in region_tiles(region, z):
            count += 1
            path = os.path.join(OUT, str(z), str(x), "%d.jpg" % y)
            if os.path.exists(path):
                continue
            write_tile(render_tile(source, z, x, y), z, x, y)
            done += 1
        print("  %s level %d: %d tiles" % (region["name"], z, count))
    return done


def main():
    args = sys.argv[1:]
    spec = json.load(open(REGIONS))
    os.makedirs(CACHE, exist_ok=True)
    os.makedirs(OUT, exist_ok=True)
    only = args[args.index("--region") + 1] if "--region" in args else None

    if only is None:
        print("world levels 0-%d" % spec["worldMaxZoom"])
        # The 5400x2700 image is 15 px/deg; level 5 wants 45. Build the
        # world levels from a 4x-reduced mosaic of the quadrants when all
        # eight are on disk (60 px/deg), else from the small image.
        mosaic = os.path.join(CACHE, "bm-world-21600.jpg")
        if not os.path.exists(mosaic) and all(
            os.path.exists(os.path.join(CACHE, "bm-%s.jpg" % q)) for q in QUADS
        ):
            print("  assembling the 21600x10800 world mosaic from the quadrants")
            world = Image.new("RGB", (QUAD_PX * 4 // 4, QUAD_PX * 2 // 4))
            for i, q in enumerate(QUADS):
                img = Image.open(os.path.join(CACHE, "bm-%s.jpg" % q)).convert("RGB").reduce(4)
                world.paste(img, ((i % 4) * QUAD_PX // 4, (i // 4) * QUAD_PX // 4))
                del img
            world.save(mosaic, "JPEG", quality=92)
            del world
        src_path = mosaic if os.path.exists(mosaic) else fetch(SMALL, os.path.join(CACHE, "bm-5400.jpg"))
        print("  source: %s" % os.path.relpath(src_path, ROOT))
        build_world(spec, SmallSource(src_path))

    if "--world" in args:
        return
    quads = QuadSource()
    for region in spec["regions"]:
        if only and region["name"] != only:
            continue
        print("region %s to level %d" % (region["name"], region["maxZoom"]))
        build_region(spec, region, quads)
    print("done: tiles in %s" % os.path.relpath(OUT, ROOT))


if __name__ == "__main__":
    main()
