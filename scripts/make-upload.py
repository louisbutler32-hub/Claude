#!/usr/bin/env python3
"""Write src/<out>/upload.md for a narrated video.

The chapter times come from the generated timing.json, so they stay correct
whenever the script or the voice changes — they are never eyeballed off the
render.

    python3 scripts/make-upload.py mummy
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def mmss(t):
    return "%d:%02d" % (int(t) // 60, int(t) % 60)


def main():
    name = sys.argv[1] if len(sys.argv) > 1 else "mummy"
    meta = json.load(open(os.path.join(ROOT, "scripts-vo", "%s.upload.json" % name)))
    spec = json.load(open(os.path.join(ROOT, "scripts-vo", "%s.json" % name)))
    out_dir = os.path.join(ROOT, *spec.get("out", "src/%s" % name).split("/"))
    timing = json.load(open(os.path.join(out_dir, "timing.json")))

    # first line of each chapter, in order
    chapters, seen = [], set()
    for line in timing:
        key = line["id"][0]
        title = meta["chapters"].get(key)
        if title is None or key in seen:
            continue
        seen.add(key)
        chapters.append((line["start"], title))
    # YouTube: first chapter at 0:00, each at least 10s long
    chapters[0] = (0.0, chapters[0][1])
    for i in range(1, len(chapters)):
        assert chapters[i][0] - chapters[i - 1][0] >= 10, "chapter %d too short" % i

    tags = ", ".join(meta["tags"])
    assert len(tags) <= 500, "tags are %d characters, over YouTube's 500" % len(tags)

    body = ["# %s\n" % meta["titles"][0], "## Title\n", "%s\n" % meta["titles"][0],
            "Alternates:\n"]
    body += ["- %s" % t for t in meta["titles"][1:]]
    body += ["", "## Description", "", meta["description"].strip(), "", "Chapters:"]
    body += ["%s %s" % (mmss(t), title) for t, title in chapters]
    body += ["", meta.get("footer", "").strip(), "", "## Tags", "", tags, "",
             "## Thumbnail", "", meta["thumbnail"].strip(), ""]

    path = os.path.join(out_dir, "upload.md")
    open(path, "w").write("\n".join(body))
    print("wrote %s (%d chapters, %d chars of tags)" % (
        os.path.relpath(path, ROOT), len(chapters), len(tags)))


if __name__ == "__main__":
    main()
