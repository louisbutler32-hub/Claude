"""Merge freshly built answer lists into the live ones without losing anything.

    python3 scripts/union_lists.py <staging dir> [ids...] [--replace id,id]

For each <id>.json in the staging dir: the fresh list sets the order and tiers, and any answer the
live data/<id>.json has that the fresh one lacks (a song merged in from a Wikipedia list page, an
alias someone added by hand) is kept, with its old tier, after the fresh answers. --replace names
lists whose old answers were wrong (episode titles in a list of shows) and are dropped instead. Spellings are
compared the way the game compares them (server/answers.js norm), so "Beyoncé" and "Beyonce" are
one answer.
"""
import json
import os
import re
import sys
import unicodedata
from pathlib import Path

DATA = Path(os.environ.get("DATA_DIR") or Path(__file__).resolve().parent.parent / "data")


def norm(s):
    s = unicodedata.normalize("NFD", str(s).lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.replace("&", "and").replace("$", "s")
    s = re.sub(r"^\s*the\s+", "", s)
    return re.sub(r"[^a-z0-9]", "", s)


def keys(answer):
    name, _tier, *rest = answer
    return {norm(x) for x in [name, *(rest[0] if rest else [])]} - {""}


def union(fresh, live):
    seen = set()
    for a in fresh["answers"]:
        seen |= keys(a)
    kept = [a for a in live["answers"] if not (keys(a) & seen)]
    fresh["answers"] = fresh["answers"] + kept
    return len(kept)


def main():
    args = sys.argv[2:]
    replace = set()
    if "--replace" in args:
        i = args.index("--replace")
        replace = set(args[i + 1].split(","))
        del args[i:i + 2]
    stage = Path(sys.argv[1])
    wanted = set(args)
    for f in sorted(stage.glob("*.json")):
        if wanted and f.stem not in wanted:
            continue
        fresh = json.loads(f.read_text())
        live_path = DATA / f.name
        before = 0
        kept = 0
        if f.stem in replace:
            print(f"{f.stem:<12} replaced: {len(fresh['answers'])} answers")
            live_path.write_text(json.dumps(fresh, ensure_ascii=False, separators=(",", ":")))
            continue
        if live_path.exists():
            live = json.loads(live_path.read_text())
            before = len(live["answers"])
            kept = union(fresh, live)
        after = len(fresh["answers"])
        if after < before:  # never shrink a list
            print(f"{f.stem:<12} skipped: {after} < {before}")
            continue
        live_path.write_text(json.dumps(fresh, ensure_ascii=False, separators=(",", ":")))
        print(f"{f.stem:<12} {before:>6} -> {after:>6}  (kept {kept} from the old list)")


if __name__ == "__main__":
    main()
