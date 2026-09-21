#!/usr/bin/env python3
"""
Sources real, licence-checked photo cutouts for the guess-format episodes.

Search runs through the Openverse API (api.openverse.org), which indexes
CC-licensed and public-domain images from many providers with the licence
already attached to each result. Wikimedia Commons itself is excluded —
its asset host (upload.wikimedia.org) rate-limits this build box hard
(confirmed: a single request gets a 429 with a 600s retry-after, and the
message says it's a standing block on this shared IP, not a one-off) — so
results whose image is hosted there are skipped even when Openverse surfaces
them. Only license_type=commercial (usable in a monetised video) is queried.

For each candidate: download, run rembg (U2Net-family background removal)
to cut the subject onto a transparent background, and save every candidate
into a review folder so a human (or a second pass) can pick the cleanest
one per id — background removal quality varies a lot with the source photo
(clutter, contrast, pose), so this never auto-picks.

Nothing is licensed silently: every accepted candidate's title, licence,
credit line and source page are written to credits.json next to the image.

Usage:
    python3 scripts/fetch-photo-cutouts.py <episode> <queries.json> [--want N]

queries.json: {"cow": "cow standing side view", "lion": "lion male", ...}
Writes:
    .photo-review/<episode>/<id>-<n>.png       (candidate cutouts, transparent)
    .photo-review/<episode>/<id>-<n>.credit.json
"""
import io
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

UA = "PebbloPebble-PhotoSourcing/1.0 (https://www.youtube.com/@PebbloPebble; contact louisbutler32@gmail.com)"
BLOCKED_HOSTS = ("upload.wikimedia.org",)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

_last = [0.0]


def get(url, gap=0.6, tries=4):
    for i in range(tries):
        wait = gap - (time.time() - _last[0])
        if wait > 0:
            time.sleep(wait)
        _last[0] = time.time()
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=45) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 429 and i < tries - 1:
                time.sleep(5 * (i + 1))
                continue
            raise
        except Exception:
            if i == tries - 1:
                raise
            time.sleep(2 ** i)


def search(query, want):
    url = ("https://api.openverse.org/v1/images/?"
           + urllib.parse.urlencode({
               "q": query, "license_type": "commercial",
               "page_size": str(want * 4), "mature": "false",
           }))
    data = json.loads(get(url))
    out = []
    for r in data.get("results", []):
        img_url = r.get("url", "")
        host = urllib.parse.urlparse(img_url).netloc
        if host in BLOCKED_HOSTS:
            continue
        if not img_url or r.get("width", 0) < 600:
            continue
        out.append({
            "id": r["id"], "title": r.get("title") or "untitled",
            "url": img_url, "license": r.get("license", "?"),
            "license_version": r.get("license_version", ""),
            "creator": r.get("creator", "unknown"),
            "attribution": r.get("attribution", ""),
            "page": r.get("foreign_landing_url", ""),
            "width": r.get("width"), "height": r.get("height"),
        })
        if len(out) >= want:
            break
    return out


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    episode = sys.argv[1]
    queries = json.load(open(sys.argv[2]))
    want = 3
    if "--want" in sys.argv:
        want = int(sys.argv[sys.argv.index("--want") + 1])

    from rembg import remove
    from PIL import Image

    out_dir = os.path.join(ROOT, ".photo-review", episode)
    os.makedirs(out_dir, exist_ok=True)

    for aid, query in queries.items():
        print(f"== {aid}: {query!r} ==")
        try:
            candidates = search(query, want)
        except Exception as e:
            print(f"  search failed: {e}")
            continue
        if not candidates:
            print("  no usable candidates (all filtered or blocked host)")
            continue
        for n, c in enumerate(candidates):
            dst_png = os.path.join(out_dir, f"{aid}-{n}.png")
            dst_credit = os.path.join(out_dir, f"{aid}-{n}.credit.json")
            if os.path.exists(dst_png):
                print(f"  [{n}] cached")
                continue
            try:
                raw = get(c["url"], gap=0.3)
                src = Image.open(io.BytesIO(raw)).convert("RGB")
                cut = remove(src)
                cut.save(dst_png)
                json.dump(c, open(dst_credit, "w"), indent=2)
                print(f"  [{n}] {c['title'][:60]!r} ({c['license']}) "
                      f"{c['width']}x{c['height']} -> {dst_png}")
            except Exception as e:
                print(f"  [{n}] failed: {e}")

    print(f"\nreview candidates in {out_dir}")


if __name__ == "__main__":
    main()
