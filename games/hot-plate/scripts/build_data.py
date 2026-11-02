#!/usr/bin/env python3
"""Build Hot Plate's answer lists from Wikidata.

Each category is a SPARQL pattern over ?x. We keep the best-known items
(ranked by sitelinks: how many Wikipedias have an article on it), add
their English aliases, and write data/<id>.json.

Rarity comes from that rank: the most famous answers are worth the least.

    python3 scripts/build_data.py            # every category
    python3 scripts/build_data.py nba pokemon

Wikidata content is CC0, so the lists can ship with the game.
"""
import json
import subprocess
import tempfile
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "data"
UA = "DiningRoomHotPlate/0.2 (https://github.com/louisbutler32-hub/Claude)"
ENDPOINT = "https://query.wikidata.org/sparql"

# kind: "person" and "character" also match a unique first or last name at runtime.
# Labels: Wikidata now keeps many names only as a "mul" (all languages) label, so we read
# the English label and fall back to "mul"; dropping that fallback loses Kendrick Lamar.
# checked per item after the main query, which keeps the heavy part off the query service
IS_CHARACTER = "?x wdt:P31/wdt:P279* wd:Q95074 ."

CATEGORIES = [
    # ---- sports ----
    dict(id="nba", group="Sports", emoji="🏀", prompt="Name any NBA player", kind="person", limit=4000, minsl=1,
         where="?x wdt:P54 ?t . ?t wdt:P118 wd:Q155223 ."),
    dict(id="mlb", group="Sports", emoji="⚾", prompt="Name any MLB player", kind="person", limit=4000, minsl=4,
         where="VALUES ?occ { wd:Q10871364 wd:Q11336312 } ?x wdt:P106 ?occ ; wdt:P54 ?t . VALUES ?lg { wd:Q465469 wd:Q858082 wd:Q1163715 } ?t wdt:P118 ?lg ."),
    dict(id="nfl", group="Sports", emoji="🏈", prompt="Name any NFL player", kind="person", limit=4000, minsl=2,
         where="?x wdt:P54 ?t . ?t wdt:P118 wd:Q1215884 ."),
    dict(id="footballer", group="Sports", emoji="⚽", prompt="Name any footballer", kind="person", limit=4500, minsl=10,
         where="?x wdt:P54 ?club . ?club wdt:P118 ?lg . VALUES ?lg { wd:Q9448 wd:Q324867 wd:Q15804 wd:Q82595 wd:Q13394 wd:Q18543 wd:Q182994 } ."),
    dict(id="club", group="Sports", emoji="🥅", prompt="Name any football (soccer) club", kind="thing", limit=3000, minsl=12,
         where="?x wdt:P31 ?c . VALUES ?c { wd:Q476028 wd:Q103229495 } ."),
    dict(id="f1", group="Sports", emoji="🏎️", prompt="Name any Formula 1 driver", kind="person", limit=2000, minsl=1,
         where="?x wdt:P106 wd:Q10841764 ."),
    dict(id="wrestler", group="Sports", emoji="🤼", prompt="Name any pro wrestler", kind="person", limit=2500, minsl=4,
         where="?x wdt:P106 wd:Q13474373 ."),
    dict(id="mma", group="Sports", emoji="🥊", prompt="Name any UFC / MMA fighter", kind="person", limit=2500, minsl=4,
         where="?x wdt:P106 wd:Q11607585 ."),
    # ---- music ----
    dict(id="rapper", group="Music", emoji="🎤", prompt="Name any rapper", kind="person", limit=3500, minsl=4,
         where="?x wdt:P106 wd:Q2252262 ."),
    dict(id="singer", group="Music", emoji="🎙️", prompt="Name any singer", kind="person", limit=5000, minsl=25,
         where="?x wdt:P106 wd:Q177220 ."),
    dict(id="band", group="Music", emoji="🎸", prompt="Name any band or music group", kind="thing", limit=4000, minsl=12,
         where="?x wdt:P31 ?c . VALUES ?c { wd:Q215380 wd:Q5741069 wd:Q216337 wd:Q641066 } ."),
    dict(id="song", group="Music", emoji="🎶", prompt="Name any song", kind="thing", limit=5000, minsl=8,
         where="?x wdt:P31 ?c . VALUES ?c { wd:Q7366 wd:Q134556 } ."),
    dict(id="album", group="Music", emoji="💿", prompt="Name any album", kind="thing", limit=4000, minsl=8,
         where="?x wdt:P31 ?c . VALUES ?c { wd:Q482994 wd:Q208569 } ."),
    dict(id="kpop", group="Music", emoji="💜", prompt="Name any K-pop group or idol", kind="person", limit=2500, minsl=2,
         where="?x wdt:P136 wd:Q213665 ."),
    # ---- screen ----
    dict(id="movie", group="Movies & TV", emoji="🍿", prompt="Name any movie", kind="thing", limit=5000, minsl=35,
         where="?x wdt:P31 wd:Q11424 ."),
    dict(id="tv", group="Movies & TV", emoji="📺", prompt="Name any TV show", kind="thing", limit=5000, minsl=12,
         where="?x wdt:P31 wd:Q5398426 ."),
    dict(id="cartoon", group="Movies & TV", emoji="🧽", prompt="Name any cartoon (animated show)", kind="thing", limit=2500, minsl=6,
         where="?x wdt:P31 ?c . VALUES ?c { wd:Q581714 wd:Q117467246 } ."),
    dict(id="anime", group="Movies & TV", emoji="🍥", prompt="Name any anime or manga", kind="thing", limit=3000, minsl=6,
         where="?x wdt:P31 ?c . VALUES ?c { wd:Q63952888 wd:Q1107 wd:Q21198342 } ."),
    dict(id="actor", group="Movies & TV", emoji="🎬", prompt="Name any actor or actress", kind="person", limit=6000, minsl=45,
         where="?x wdt:P106 ?o . VALUES ?o { wd:Q33999 wd:Q10800557 wd:Q10798782 } .",
         drop="?x wdt:P106 ?no . VALUES ?no { wd:Q82955 wd:Q36180 wd:Q1028181 wd:Q49757 wd:Q4964182 } ."),
    dict(id="tiktoker", group="Internet", emoji="📱", prompt="Name any YouTuber or TikToker", kind="person", limit=3000, minsl=2,
         where="?x wdt:P106 ?o . VALUES ?o { wd:Q17125263 wd:Q94791573 } ."),
    # ---- characters ----
    dict(id="marvel", group="Characters", emoji="🦸", prompt="Name any Marvel character", kind="character", limit=4000, minsl=1,
         where="?x wdt:P1080 ?u . VALUES ?u { wd:Q2246088 wd:Q642878 } . FILTER EXISTS { ?x wdt:P31/wdt:P279* wd:Q95074 } ."),
    dict(id="dc", group="Characters", emoji="🦇", prompt="Name any DC character", kind="character", limit=4000, minsl=1,
         where="?x wdt:P1080 wd:Q1152150 . FILTER EXISTS { ?x wdt:P31/wdt:P279* wd:Q95074 } ."),
    dict(id="animechar", group="Characters", emoji="🍙", prompt="Name any anime character", kind="character", limit=4000, minsl=2,
         where="?x wdt:P1441 ?w . ?w wdt:P31 ?t . VALUES ?t { wd:Q63952888 wd:Q21198342 wd:Q1107 } .", keep=IS_CHARACTER),
    dict(id="gamechar", group="Characters", emoji="🕹️", prompt="Name any video game character", kind="character", limit=4000, minsl=2,
         where="?x wdt:P31 wd:Q1569167 ."),
    dict(id="disney", group="Characters", emoji="🏰", prompt="Name any Disney or Pixar character", kind="character", limit=3000, minsl=1,
         where="?x wdt:P1441 ?w . ?w wdt:P272 ?st . VALUES ?st { wd:Q1047410 wd:Q127552 wd:Q191224 } .", keep=IS_CHARACTER),
    dict(id="starwars", group="Characters", emoji="🌌", prompt="Name any Star Wars character", kind="character", limit=3000, minsl=1,
         where="?x wdt:P8345 wd:Q462 . FILTER EXISTS { ?x wdt:P31/wdt:P279* wd:Q95074 } ."),
    dict(id="pokemon", group="Characters", emoji="⚡", prompt="Name any Pokémon", kind="thing", limit=2000, minsl=1,
         where="?x wdt:P31/wdt:P279* wd:Q3966183 ."),
    # ---- stuff ----
    dict(id="videogame", group="Gaming", emoji="🎮", prompt="Name any video game", kind="thing", limit=6000, minsl=15,
         where="?x wdt:P31 wd:Q7889 ."),
    dict(id="app", group="Internet", emoji="🌐", prompt="Name any app or website", kind="thing", limit=2500, minsl=12,
         where="?x wdt:P31 ?c . VALUES ?c { wd:Q35127 wd:Q620615 wd:Q3220391 wd:Q202833 } ."),
    dict(id="dish", group="Food", emoji="🍝", prompt="Name any food", kind="thing", limit=3000, minsl=8,
         where="?x wdt:P31|wdt:P279 ?c . VALUES ?c { wd:Q746549 wd:Q2095 wd:Q182940 wd:Q3314483 wd:Q11004 } ."),
    dict(id="dog", group="Animals", emoji="🐶", prompt="Name any dog breed", kind="thing", limit=1500, minsl=1,
         where="?x wdt:P31 wd:Q39367 ."),
    dict(id="car", group="Cars", emoji="🚗", prompt="Name any car brand or model", kind="thing", limit=4000, minsl=10,
         where="?x wdt:P31 ?c . VALUES ?c { wd:Q3231690 wd:Q786820 } ."),
    dict(id="brand", group="Brands", emoji="👟", prompt="Name any brand", kind="thing", limit=3000, minsl=8,
         where="?x wdt:P31 ?c . VALUES ?c { wd:Q431289 wd:Q1618899 } ."),
    dict(id="city", group="Places", emoji="🏙️", prompt="Name any city", kind="thing", limit=4000, minsl=60,
         where="?x wdt:P31 ?c . VALUES ?c { wd:Q515 wd:Q1549591 wd:Q1637706 wd:Q200250 } ."),
]

# rank cut-offs for the four tiers (10 / 25 / 50 / 100 points)
TIER_CUTS = (40, 200, 800)


def sparql(query, tries=5):
    """Run a query through curl (the query service throttles Python's urllib far harder)."""
    delay = 20
    with tempfile.NamedTemporaryFile("w", suffix=".rq", delete=False) as f:
        f.write(query)
        qfile = f.name
    try:
        for i in range(tries):
            t0 = time.time()
            p = subprocess.run(
                ["curl", "-sS", "-m", "100", "-G", ENDPOINT, "--data-urlencode", f"query@{qfile}",
                 "-H", "Accept: application/sparql-results+json", "-A", UA,
                 "-w", "\n%{http_code}", "-D", qfile + ".h"],
                capture_output=True, text=True)
            body, _, code = p.stdout.rpartition("\n")
            took = time.time() - t0
            if code == "200":
                # stay under the service's query-time budget (about 60s of work per minute)
                time.sleep(min(45, took * 0.8))
                try:
                    return json.loads(body)["results"]["bindings"]
                except ValueError:
                    code = "200 (cut off)"
            retry = re.search(r"(?im)^retry-after:\s*(\d+)", open(qfile + ".h").read() if Path(qfile + ".h").exists() else "")
            wait = int(retry.group(1)) if retry else delay
            if i == tries - 1 or wait > 1200:
                raise RuntimeError(f"HTTP {code or p.stderr.strip()} (retry-after {wait}s)")
            print(f"    HTTP {code or p.stderr.strip()[:60]}, retrying in {wait}s", flush=True)
            time.sleep(wait)
            delay *= 2
    finally:
        for f in (qfile, qfile + ".h"):
            Path(f).unlink(missing_ok=True)


PAREN = re.compile(r"\s*\([^)]*\)\s*$")


def clean(label):
    label = PAREN.sub("", label).strip()
    if not label or re.fullmatch(r"Q\d+", label) or len(label) > 60:
        return None
    return label


def build(cat):
    t0 = time.time()
    q = f"""SELECT DISTINCT ?x ?sl ?l WHERE {{
      {cat['where']}
      ?x wikibase:sitelinks ?sl . FILTER(?sl >= {cat['minsl']})
      OPTIONAL {{ ?x rdfs:label ?le . FILTER(lang(?le) = "en") }}
      OPTIONAL {{ ?x rdfs:label ?lm . FILTER(lang(?lm) = "mul") }}
      BIND(COALESCE(?le, ?lm) AS ?l) FILTER(BOUND(?l))
    }} ORDER BY DESC(?sl) LIMIT {cat['limit']}"""
    rows = sparql(q)
    items = {}
    for b in rows:
        qid = b["x"]["value"].rsplit("/", 1)[-1]
        label = clean(b["l"]["value"])
        if label and label[0].islower() and cat["id"] in ("dish", "dog"):
            label = label[0].upper() + label[1:]
        if not label:
            continue
        sl = int(b["sl"]["value"])
        if qid not in items or items[qid]["sl"] < sl:
            items[qid] = {"name": label, "sl": sl, "alt": set()}

    # keep / drop filters, run in small batches
    for mode in ("keep", "drop"):
        if not cat.get(mode):
            continue
        hits = set()
        qids = list(items)
        for i in range(0, len(qids), 300):
            vals = " ".join("wd:" + x for x in qids[i:i + 300])
            for b in sparql(f"SELECT DISTINCT ?x WHERE {{ VALUES ?x {{ {vals} }} {cat[mode]} }}"):
                hits.add(b["x"]["value"].rsplit("/", 1)[-1])
        items = {q: v for q, v in items.items() if (q in hits) == (mode == "keep")}

    # aliases in batches
    qids = list(items)
    for i in range(0, len(qids), 250):
        chunk = qids[i:i + 250]
        vals = " ".join("wd:" + x for x in chunk)
        aq = f'SELECT ?x ?a WHERE {{ VALUES ?x {{ {vals} }} ?x skos:altLabel|rdfs:label ?a . FILTER(lang(?a) = "en" || lang(?a) = "mul") }}'
        for b in sparql(aq):
            qid = b["x"]["value"].rsplit("/", 1)[-1]
            a = clean(b["a"]["value"])
            if a and qid in items and len(a) >= 2:
                items[qid]["alt"].add(a)
        time.sleep(0.5)

    # merge items that share a display name (two films called "Halloween") and rank by fame
    merged = {}
    for it in items.values():
        key = it["name"].lower()
        m = merged.get(key)
        if m:
            m["sl"] = max(m["sl"], it["sl"])
            m["alt"] |= it["alt"]
        else:
            merged[key] = it
    ranked = sorted(merged.values(), key=lambda it: -it["sl"])

    answers = []
    for rank, it in enumerate(ranked):
        tier = sum(rank >= c for c in TIER_CUTS)
        alts = sorted(a for a in it["alt"] if a.lower() != it["name"].lower())[:12]
        answers.append([it["name"], tier, alts] if alts else [it["name"], tier])

    out = {k: cat[k] for k in ("id", "group", "emoji", "prompt", "kind")}
    out["answers"] = answers
    (OUT / f"{cat['id']}.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
    top = ", ".join(a[0] for a in answers[:6])
    print(f"{cat['id']:<11} {len(answers):>5} answers  {time.time() - t0:5.0f}s   top: {top}", flush=True)
    return len(answers)


def main():
    OUT.mkdir(exist_ok=True)
    wanted = set(sys.argv[1:])
    for cat in CATEGORIES:
        if wanted and cat["id"] not in wanted:
            continue
        try:
            build(cat)
        except Exception as e:  # keep going; report at the end
            print(f"{cat['id']:<11} FAILED: {e}", flush=True)
        time.sleep(1)


if __name__ == "__main__":
    main()
