#!/usr/bin/env python3
"""Add answers from Wikipedia list pages to the answer sets built from Wikidata.

Answer sets are aggregated from several sources (Wikidata, Wikipedia list pages, fan wikis
and hand-written lists), then merged and cleaned into one set per question. This step reads
the tables on the Wikipedia pages below, pulls the column that holds the answer, cleans each
name, and appends anything Wikidata didn't have. Those extras are usually deep cuts (album
tracks, minor films), so they go at the rare end of the list.

Run it after build_data.py (which rewrites data/<id>.json from Wikidata):

    python3 scripts/merge_wikipedia.py           # every category listed below
    python3 scripts/merge_wikipedia.py big3 ryans
"""
import json
import re
import subprocess
import sys
import time
from io import StringIO
from pathlib import Path

import pandas as pd
from lxml import html as lhtml

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
UA = "DiningRoomHotPlate/0.2 (https://github.com/louisbutler32-hub/Claude; game data)"

SONG = r"^(song|title|song title)\b"
TITLE = r"^(title|film|programme|program|show|series)\b"

def songs_by(*artists):
    """An artist's full song list where Wikipedia has one, plus the singles on their discography."""
    out = []
    for a in artists:
        out.append((f"List of songs recorded by {a}", SONG, None))
        out.append((f"{a} discography", r"^title\b", r"single|song"))
    return out


# id -> list of (Wikipedia page, column header pattern, table caption pattern or None)
SOURCES = {
    "big3": songs_by("Drake", "J. Cole", "Kendrick Lamar"),
    "legends": songs_by("Queen", "the Beatles", "Fleetwood Mac", "Michael Jackson"),
    "fiftyyejay": songs_by("50 Cent", "Kanye West", "Jay-Z"),
    "lilsong": [(f"{a} discography", r"^title\b", r"single|song") for a in (
        "Lil Wayne", "Lil Baby", "Lil Uzi Vert", "Lil Nas X", "Lil Durk", "Lil Yachty", "Lil Peep", "Lil Pump",
        "Lil Tecca", "Lil Tjay", "Lil' Kim", "Lil Jon", "Lil Mosey", "Lil Dicky", "Lil Skies")]
        + [("List of songs recorded by Lil Wayne", SONG, None)],
    "ryans": [("Ryan Reynolds filmography", r"^title\b", r"film"), ("Ryan Gosling filmography", r"^title\b", r"film"),
              ("Ryan Reynolds", r"^title\b", r"film"), ("Ryan Gosling", r"^title\b", r"film")],
    "animated": [("List of Walt Disney Animation Studios films", r"^(film|title)\b", None), ("List of Pixar films", r"^(film|title)\b", None),
                 ("List of DreamWorks Animation productions", r"^(film|title)\b", None), ("List of Walt Disney Pictures films", r"^(film|title)\b", None)],
    "cnnick": [("List of programs broadcast by Cartoon Network", TITLE, None), ("List of Cartoon Network original programming", TITLE, None),
               ("List of programs broadcast by Nickelodeon", TITLE, None), ("List of Nickelodeon original programming", TITLE, None)],
    "superhero": [("List of American superhero films", r"^(film|title)\b", None)],
    "language": [("List of languages by total number of speakers", r"^language\b", None)],
    "river": [("List of river systems by length", r"^river\b", None)],
    "capital": [("List of national capitals", r"^(city|capital)\b", None)],
    "bigcity": [("List of largest cities", r"^city\b", None)],
    "airline": [("List of largest airlines in the world", r"^airline\b", None)],
    "tech": [("List of largest technology companies by revenue", r"^company\b", None)],
}


SONG_SETS = {"big3", "legends", "fiftyyejay", "lilsong"}


def norm(s):
    import unicodedata
    s = unicodedata.normalize("NFD", str(s).lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"^\s*the\s+", "", s.replace("&", "and"))
    return re.sub(r"[^a-z0-9]", "", s)


def fetch(page):
    url = "https://en.wikipedia.org/wiki/" + page.replace(" ", "_")
    for wait in (5, 15, 40):  # Wikipedia rate-limits shared connections now and then
        p = subprocess.run(["curl", "-sS", "-m", "60", "-A", UA, "-w", "\n%{http_code}", url], capture_output=True, text=True)
        body, _, code = p.stdout.rpartition("\n")
        time.sleep(1.5)
        if code == "200":
            return body
        if code == "404":
            return None
        time.sleep(wait)
    return None


def clean(cell, quoted_only=False, keep_parens=False):
    s = str(cell).split("¦")[0]             # a cell's other names sit on new lines; keep the first
    if s in ("nan", "None", "—", "–", "-", ""):
        return None
    s = re.sub(r"\[[^\]]*\]", "", s)          # footnotes [1] [a]
    q = re.search(r'["“”]([^"“”]{1,80})["“”]', s)  # song titles sit in quotes
    if q:
        s = q.group(1)
    elif quoted_only:
        return None
    s = re.sub(r"\s*[†‡*§¶#^]+\s*$", "", s)  # table marks
    if not keep_parens:
        s = re.sub(r"\s*\([^)]*\)", "", s)    # notes like "(de jure)"
        s = re.split(r"\s*[–—]\s*", s)[0]      # "Nile–White Nile–Kagera" is the Nile
    s = re.sub(r"\s*\((?:song|film|TV series|[^)]*version)\)$", "", s, flags=re.I)
    s = re.sub(r"\s+", " ", s).strip(" \"'“”")
    if not s or len(s) > 70 or re.fullmatch(r"[\d\W]+", s) or re.search(r"\b(TBA|TBD|untitled)\b", s, re.I):
        return None
    return s


def answers_from(page_html, col_pat, cap_pat, quoted_only):
    tree = lhtml.fromstring(page_html)
    for br in tree.iter("br"):
        br.tail = "¦" + (br.tail or "")
    found = []
    for t in tree.xpath('//table[contains(concat(" ", normalize-space(@class), " "), " wikitable ")]'):
        cap = " ".join(t.xpath(".//caption//text()")).lower()
        if cap_pat and not re.search(cap_pat, cap):
            continue
        try:
            df = pd.read_html(StringIO(lhtml.tostring(t, encoding="unicode")))[0]
        except (ValueError, IndexError):
            continue
        cols = [" ".join(str(x) for x in c if not str(x).startswith("Unnamed")) if isinstance(c, tuple) else str(c) for c in df.columns]
        pick = next((i for i, c in enumerate(cols) if re.search(col_pat, c.strip(), re.I)), None)
        if pick is None or any(re.search(r"\brole\b", c, re.I) for c in cols) and col_pat == SONG:
            continue
        for v in df.iloc[:, pick].tolist():
            name = clean(v, quoted_only, keep_parens=quoted_only)
            if name:
                found.append(name)
    return found


def tiers(n):
    cuts = (min(40, max(1, round(n * 0.15))), min(200, max(2, round(n * 0.4))), min(800, max(3, round(n * 0.7))))
    return [sum(r >= c for c in cuts) for r in range(n)]


def merge(cid):
    path = DATA / f"{cid}.json"
    if not path.exists():
        print(f"{cid:<12} no Wikidata file yet, skipped")
        return
    data = json.loads(path.read_text(encoding="utf-8"))
    rows = data["answers"]
    known = set()
    for r in rows:
        known.add(norm(r[0]))
        for a in (r[2] if len(r) > 2 else []):
            known.add(norm(a))
    extra, pages_ok = [], 0
    for page, col, cap in SOURCES[cid]:
        h = fetch(page)
        if not h:
            continue
        pages_ok += 1
        for name in answers_from(h, col, cap, quoted_only=cid in SONG_SETS):
            k = norm(name)
            if k and k not in known:
                known.add(k)
                extra.append(name)
    rows = rows + [[n, 3] for n in extra]
    for r, t in zip(rows, tiers(len(rows))):
        r[1] = t
    data["answers"] = rows
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{cid:<12} +{len(extra):<5} from {pages_ok}/{len(SOURCES[cid])} pages -> {len(rows)} answers   e.g. {', '.join(extra[:5])}", flush=True)


if __name__ == "__main__":
    for cid in (sys.argv[1:] or SOURCES):
        merge(cid)
