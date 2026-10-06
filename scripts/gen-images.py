#!/usr/bin/env python3
"""Generate a video's images with FLUX.1 [schnell] on Runware.

    IMAGE_API_KEY=... python3 scripts/gen-images.py <episode> <spec.json> [--budget 20] [--max-cost 0.03]
    (or IMAGE_API_KEY_FILE=path/to/keyfile)

spec.json: [{"id": "bg-zoo", "prompt": "...", "w": 768, "h": 1344, "cutout": false}, ...]
Writes .photo-review/<episode>-ai/<id>.jpg (and <id>.png with the background
removed when "cutout" is true). Every image generated is counted in
.photo-review/<episode>-ai/_count; past --budget (default 20 per video, the
channel's limit) it stops. Money is capped too: Runware reports each image's
cost, the running total is kept in _cost, and the run stops before any image
that would take the video past --max-cost (default $0.03, the channel's
limit), or at once if the total ever goes over. Cached ids are never re-generated; delete the jpg to
re-roll one. The key is read from the environment, never from the repo.
"""
import json, os, sys, uuid, urllib.error, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL = "runware:100@1"   # FLUX.1 [schnell]


def key():
    k = os.environ.get("IMAGE_API_KEY")
    if not k and os.environ.get("IMAGE_API_KEY_FILE"):
        k = open(os.environ["IMAGE_API_KEY_FILE"]).read().strip()
    if not k:
        sys.exit("set IMAGE_API_KEY (or IMAGE_API_KEY_FILE)")
    return k


def generate(prompt, w, h, seed=None):
    task = {"taskType": "imageInference", "taskUUID": str(uuid.uuid4()), "positivePrompt": prompt, "model": MODEL,
            "width": w, "height": h, "numberResults": 1, "outputType": "URL", "outputFormat": "JPG", "steps": 4, "includeCost": True}
    if seed is not None:
        task["seed"] = seed
    req = urllib.request.Request("https://api.runware.ai/v1", data=json.dumps([task]).encode(),
                                 headers={"Content-Type": "application/json", "Authorization": "Bearer " + key()})
    try:
        d = json.loads(urllib.request.urlopen(req, timeout=120).read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Runware {e.code}: {e.read().decode()[:400]}")
    if d.get("errors"):
        raise RuntimeError(d["errors"])
    r = d["data"][0]
    return urllib.request.urlopen(r["imageURL"], timeout=120).read(), r.get("seed"), float(r.get("cost") or 0)


def main():
    ep, spec = sys.argv[1], json.load(open(sys.argv[2]))
    budget = int(sys.argv[sys.argv.index("--budget") + 1]) if "--budget" in sys.argv else 20
    out = os.path.join(ROOT, ".photo-review", ep + "-ai")
    os.makedirs(out, exist_ok=True)
    cpath = os.path.join(out, "_count")
    count = int(open(cpath).read()) if os.path.exists(cpath) else 0
    max_cost = float(sys.argv[sys.argv.index("--max-cost") + 1]) if "--max-cost" in sys.argv else 0.03
    mpath = os.path.join(out, "_cost")
    spent = float(open(mpath).read()) if os.path.exists(mpath) else 0.0
    each = 0.002   # per-image estimate until Runware reports a real price
    session = None
    for it in spec:
        jpg = os.path.join(out, it["id"] + ".jpg")
        if not os.path.exists(jpg):
            if count >= budget:
                print(f"budget of {budget} images reached; skipping {it['id']}")
                continue
            if spent + each > max_cost:
                sys.exit(f"stopping: ${spent:.4f} spent of the ${max_cost:.2f} cap, and {it['id']} would cost ~${each:.4f} more")
            data, seed, cost = generate(it["prompt"], it.get("w", 768), it.get("h", 1344), it.get("seed"))
            open(jpg, "wb").write(data)
            count += 1
            cost = cost or each   # no price reported: count the estimate, so the cap still holds
            spent += cost
            each = cost
            open(cpath, "w").write(str(count))
            open(mpath, "w").write(f"{spent:.6f}")
            print(f"[{count}/{budget}] {it['id']} (seed {seed}) ${cost:.4f}, ${spent:.4f} so far")
            if spent > max_cost:
                sys.exit(f"stopping: ${spent:.4f} spent, over the ${max_cost:.2f} cap")
        if it.get("cutout"):
            png = jpg[:-4] + ".png"
            if not os.path.exists(png):
                from PIL import Image
                from rembg import new_session, remove
                session = session or new_session(it.get("model", "isnet-general-use"))
                remove(Image.open(jpg).convert("RGB"), session=session).save(png)
                print(f"   cut out -> {os.path.basename(png)}")
    print(f"{count}/{budget} images, ${spent:.4f} of ${max_cost:.2f} used for {ep}")


if __name__ == "__main__":
    main()
