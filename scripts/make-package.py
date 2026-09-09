#!/usr/bin/env python3
"""Build the upload package for the planets video.

Collects everything needed to publish into out/package/: the video, both
thumbnails, a description with chapter timestamps taken from the real
narration timings, title options, tags and the source credits.

    npm run planets            # render the video first
    npm run planets:thumbs     # and the thumbnails
    python3 scripts/make-package.py
"""
import json
import os
import shutil
import subprocess
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "out")
PKG = os.path.join(OUT, "package")

CHAPTERS = {
    "m": "Mercury", "v": "Venus", "r": "Mars", "j": "Jupiter",
    "s": "Saturn", "u": "Uranus", "n": "Neptune", "z": "The full list",
}

TITLES = [
    "How Long Would You Last on Every Planet?",
    "How Long You'd Survive on Every Planet",
    "Every Planet, Ranked by How Fast It Kills You",
    "How Long Would You Last on Every Planet? (All 8)",
]

TAGS = [
    "how long would you last", "every planet", "planets", "solar system",
    "space", "survival", "mercury", "venus", "mars", "jupiter", "saturn",
    "uranus", "neptune", "science", "what if", "space facts", "nasa",
    "astronomy", "would you survive", "planet comparison",
]

SOURCES = """\
Figures
  Planetary temperatures, pressures, atmospheres, winds and day lengths:
  NASA planetary fact sheets.
  Suit limits: NASA EMU rated environment, roughly -157 C to +121 C.
  Armstrong limit: 6.3 kPa, about 6% of sea-level pressure on Earth.
  Galileo atmospheric probe, 7 December 1995 — 58 minutes, 156 km, ended
  at about 23 bar and 153 C.
  Venera 13, 1 March 1982 — 127 minutes on the surface of Venus.
  Cassini, 15 September 2017 — transmitted through entry into Saturn.
  Europa surface radiation: about 540 rem/day, against a lethal dose of
  roughly 500 rem.

Images
  All planet photographs are public domain, NASA/JPL, Hubble and Voyager 2,
  via Wikimedia Commons:
    Mercury   MESSENGER
    Venus     Magellan / JPL
    Earth     Apollo 17
    Mars      Hubble
    Jupiter   Hubble
    Uranus    Voyager 2
    Neptune   Voyager 2

Everything else on screen — the artwork, the animation, the narration and
the edit — was generated for this video and is yours to use.
"""


def timestamp(seconds):
    m, s = divmod(int(seconds), 60)
    return "%d:%02d" % (m, s)


def main():
    timing = json.load(open(os.path.join(ROOT, "src", "planets", "timing.json")))
    os.makedirs(PKG, exist_ok=True)

    # chapters: the first line of each planet, at its real narration time
    chapters, seen = [], set()
    for line in timing:
        key = line["id"][0]
        if key in seen:
            continue
        seen.add(key)
        start = 0 if not chapters else line["start"]
        chapters.append("%s %s" % (timestamp(start), CHAPTERS[key]))

    description = (
        "How long would you actually last on each of the eight planets?\n"
        "Every number here is the real one where a real one exists, including\n"
        "the records set by the machines we have already sent.\n\n"
        + "\n".join(chapters)
        + "\n\nFigures come from NASA's planetary fact sheets and from the probes\n"
        "themselves — Galileo into Jupiter in 1995, Venera 13 on Venus in 1982,\n"
        "and Cassini's final descent into Saturn in 2017.\n\n"
        "Planet photography is public domain NASA imagery. Everything else was\n"
        "drawn and animated for this video.\n\n"
        "Subscribe for more, or join the Discord to suggest the next one:\n"
        "[ your link here ]\n"
    )

    write = {
        "description.txt": description,
        "titles.txt": "\n".join("%d. %s" % (i + 1, t) for i, t in enumerate(TITLES)) + "\n",
        "tags.txt": ", ".join(TAGS) + "\n",
        "sources.txt": SOURCES,
    }
    for name, body in write.items():
        open(os.path.join(PKG, name), "w").write(body)

    # the video: ship the small cut, and say where the full-quality one is
    small = os.path.join(OUT, "planets-small.mp4")
    if os.path.exists(small):
        shutil.copy(small, os.path.join(PKG, "planets-1080p.mp4"))
    shutil.copy(os.path.join(ROOT, "scripts-vo", "planets-survival.md"),
                os.path.join(PKG, "script.md"))

    open(os.path.join(PKG, "README.txt"), "w").write(
        "How Long Would You Last on Every Planet? — upload package\n"
        "=========================================================\n\n"
        "  planets-1080p.mp4   the video, 1920x1080, 30 fps, 8:00\n"
        "  thumbnail-a.png     Venus + the astronaut, 1280x720\n"
        "  thumbnail-b.png     four planets and their times, 1280x720\n"
        "  description.txt     description with chapter timestamps\n"
        "  titles.txt          title options\n"
        "  tags.txt            tags\n"
        "  sources.txt         where every figure and image came from\n"
        "  script.md           the narration, line by line, with timings\n\n"
        "The copy here is compressed to move around easily. Re-render the\n"
        "full-quality master any time with:  npm run planets\n"
    )

    zip_path = os.path.join(OUT, "planets-package.zip")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        for name in sorted(os.listdir(PKG)):
            z.write(os.path.join(PKG, name), name)
    print("package: %s (%.1f MiB)" % (zip_path, os.path.getsize(zip_path) / 1048576))
    for name in sorted(os.listdir(PKG)):
        print("   ", name)


if __name__ == "__main__":
    main()
