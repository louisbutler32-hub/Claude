#!/usr/bin/env python3
"""Turn hand-written answer lists in data-src/*.txt into data/*.json.

A list file looks like this:

    # id: eu
    # prompt: Name a country in the EU
    # group: Places
    # emoji: 🇪🇺
    # kind: thing
    France
    Germany | Deutschland
    Czechia | Czech Republic

One answer per line, best known first. "|" separates other accepted spellings
(the first is what players see). Blank lines and lines starting with "#" (other
than the header) are ignored. kind is "person", "character" or "thing"; people
and characters also match on a unique first or last name.

    python3 scripts/build_lists.py          # every list
    python3 scripts/build_lists.py eu clash
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / "data-src", ROOT / "data"
HEADER_KEYS = ("id", "prompt", "group", "emoji", "kind")


def tier_cuts(n):
    """Big lists use fixed ranks (top 40 common ... ); small lists split by share."""
    return (min(40, max(1, round(n * 0.15))), min(200, max(2, round(n * 0.4))), min(800, max(3, round(n * 0.7))))


def tiers(n):
    cuts = tier_cuts(n)
    return [sum(rank >= c for c in cuts) for rank in range(n)]


def parse(path):
    meta, rows, seen = {}, [], set()
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        if line.startswith("#"):
            key, _, val = line[1:].partition(":")
            if key.strip() in HEADER_KEYS and val.strip():
                meta[key.strip()] = val.strip()
            continue
        names = [n.strip() for n in line.split("|") if n.strip()]
        if not names or names[0].lower() in seen:
            continue
        seen.add(names[0].lower())
        rows.append(names)
    missing = [k for k in HEADER_KEYS if k not in meta]
    if missing:
        raise ValueError(f"{path.name}: header is missing {', '.join(missing)}")
    return meta, rows


def build(path):
    meta, rows = parse(path)
    answers = []
    for names, tier in zip(rows, tiers(len(rows))):
        answers.append([names[0], tier, names[1:]] if len(names) > 1 else [names[0], tier])
    out = {k: meta[k] for k in HEADER_KEYS}
    out["answers"] = answers
    (OUT / f"{meta['id']}.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{meta['id']:<13}{len(answers):>6} answers   {', '.join(r[0] for r in rows[:5])}")


def main():
    OUT.mkdir(exist_ok=True)
    wanted = set(sys.argv[1:])
    for path in sorted(SRC.glob("*.txt")):
        if wanted and path.stem not in wanted:
            continue
        build(path)


if __name__ == "__main__":
    main()
