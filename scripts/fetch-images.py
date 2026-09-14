#!/usr/bin/env python3
"""Fetch real, licence-checked images for a video.

Sources, and what each is actually good for:

  nasa — images-api.nasa.gov. Public domain outright. Space, the planets,
         the sun, and Earth from orbit (volcanoes, lakes, storms).
  loc  — Library of Congress. Historical photography. Rights are read from
         each item page and only "no known restrictions" is accepted.

  commons — Wikimedia Commons. The metadata API answers, but the asset host
         (upload.wikimedia.org) 429s every request from this build box, and
         so does the Openverse proxy in front of it. Left in because it
         works from a normal machine; refuses loudly here rather than
         silently shipping nothing.

Nothing downloads whose licence has not been read. Every image that lands
records its licence and credit in credits.json, and the video description
is built from that file.

Usage:  python3 scripts/fetch-images.py <subject>
Reads:  images/<subject>.json
Writes: public/assets/img/<subject>/*.jpg  +  credits.json
"""
import io, json, os, re, sys, time, urllib.error, urllib.parse, urllib.request
from PIL import Image

UA = ("WonkyAnimationsBot/1.0 "
      "(https://youtube.com/@thewonkyanimations) python-urllib")

LOC_OK = "no known restrictions"
_last = [0.0]


def get(url, tries=5, gap=1.0):
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
            if e.code != 429 or i == tries - 1:
                raise
            time.sleep(5 * (i + 1))
        except Exception:
            if i == tries - 1:
                raise
            time.sleep(2 ** i)


def from_nasa(query, want):
    url = ("https://images-api.nasa.gov/search?"
           + urllib.parse.urlencode({"q": query, "media_type": "image"}))
    items = json.loads(get(url))["collection"]["items"]
    out = []
    for it in items[: want * 3]:
        d = it["data"][0]
        thumb = it["links"][0]["href"]
        out.append({
            "title": d.get("title", "")[:120],
            # the search only hands back ~thumb; ~orig is the full asset
            "url": thumb.replace("~thumb.jpg", "~orig.jpg"),
            "licence": "Public domain (NASA)",
            "credit": f"NASA/{d.get('center', 'NASA')}",
            "source": "nasa",
            "page": f"https://images.nasa.gov/details/{d.get('nasa_id','')}",
        })
    return out


def from_loc(query, want):
    """Search, then read rights off each item page before accepting it."""
    url = ("https://www.loc.gov/photos/?"
           + urllib.parse.urlencode({"q": query, "fo": "json",
                                     "c": str(max(want * 5, 15))}))
    results = json.loads(get(url)).get("results", [])
    out, refused = [], []
    for r in results:
        if len(out) >= want * 2:
            break
        if r.get("access_restricted"):
            refused.append((r.get("title", "?"), "access restricted"))
            continue
        # Pick the largest offered rendition (…v.jpg 1024 > …r.jpg 640).
        best, best_w = None, 0
        for u in (r.get("image_url") or []):
            m = re.search(r"#h=(\d+)&w=(\d+)", u)
            w = int(m.group(2)) if m else 0
            if u.split("#")[0].lower().endswith((".jpg", ".jpeg")) and w > best_w:
                best, best_w = u.split("#")[0], w
        if not best or best_w < 600:
            continue
        item_url = (r.get("id") or "")
        rights = ""
        if item_url.startswith("http"):
            try:
                meta = json.loads(get(item_url.rstrip("/") + "/?fo=json"))
                rights = (meta.get("item", {}).get("rights_advisory")
                          or meta.get("item", {}).get("rights_information") or "")
                if isinstance(rights, list):
                    rights = " ".join(str(x) for x in rights)
            except Exception:
                rights = ""
        if LOC_OK not in rights.lower():
            refused.append((r.get("title", "?")[:50], rights[:60] or "rights not stated"))
            continue
        out.append({
            "title": r.get("title", "")[:120],
            "url": best,
            "licence": "No known restrictions on publication (Library of Congress)",
            "credit": "Library of Congress, Prints & Photographs Division",
            "source": "loc",
            "page": item_url,
        })
    return out, refused


def from_commons(query, want):
    raise RuntimeError(
        "Commons asset host is rate-limited from this build box (429 on "
        "upload.wikimedia.org and on the Openverse proxy). Use nasa or loc "
        "here, or run this script from a normal machine.")


def main():
    subject = sys.argv[1]
    manifest = json.load(open(f"images/{subject}.json"))
    outdir = f"public/assets/img/{subject}"
    os.makedirs(outdir, exist_ok=True)

    credits, refused_all, missing = [], [], []
    for entry in manifest["images"]:
        slug, src, query = entry["slug"], entry["source"], entry["query"]
        idx = entry.get("index", 0)
        try:
            if src == "nasa":
                cands = from_nasa(query, idx + 2)
            elif src == "loc":
                cands, refused = from_loc(query, idx + 2)
                refused_all += [(slug, t, l) for t, l in refused]
            else:
                cands = from_commons(query, idx + 2)
        except Exception as e:
            print(f"  !! {slug}: {e}")
            missing.append(slug)
            continue
        if len(cands) <= idx:
            print(f"  !! {slug}: only {len(cands)} usable for {query!r}")
            missing.append(slug)
            continue
        pick = cands[idx]
        try:
            raw = get(pick["url"])
            im = Image.open(io.BytesIO(raw)).convert("RGB")
        except Exception as e:
            print(f"  !! {slug}: download/decode failed — {e}")
            missing.append(slug)
            continue
        if entry.get("stereo"):
            # A stereoview is the same photograph twice in a card mount.
            # Take the left frame and trim the mount border off it.
            w, h = im.size
            im = im.crop((int(w * 0.075), int(h * 0.10),
                          int(w * 0.475), int(h * 0.88)))
        im.thumbnail((1920, 1920), Image.LANCZOS)
        path = f"{outdir}/{slug}.jpg"
        im.save(path, "JPEG", quality=88, optimize=True)
        pick.update(file=f"img/{subject}/{slug}.jpg", slug=slug, size=list(im.size))
        credits.append(pick)
        print(f"  ok {slug:18s} {im.size[0]:>4}x{im.size[1]:<4} "
              f"{pick['source']:7s} {pick['title'][:44]}")

    json.dump(credits, open(f"{outdir}/credits.json", "w"), indent=2)
    print(f"\n{len(credits)} images -> {outdir}")
    if missing:
        print(f"missing ({len(missing)}): {', '.join(missing)}")
    if refused_all:
        print(f"refused on rights ({len(refused_all)}):")
        for slug, title, lic in refused_all[:8]:
            print(f"  {slug}: {title[:44]} — {lic}")


if __name__ == "__main__":
    main()
