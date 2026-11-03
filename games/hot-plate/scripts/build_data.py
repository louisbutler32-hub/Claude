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
    # ---- music ----
    dict(id="big3", group="Music", emoji="🎤", prompt="Name a song by Drake, J. Cole or Kendrick Lamar", kind="thing", limit=1500, minsl=0,
         where="?x wdt:P175 ?a . VALUES ?a { wd:Q33240 wd:Q204018 wd:Q130798 } . %(song)s"),
    dict(id="legends", group="Music", emoji="🎸", prompt="Name a song by Queen, The Beatles, Fleetwood Mac or Michael Jackson", kind="thing", limit=1500, minsl=0,
         where="?x wdt:P175 ?a . VALUES ?a { wd:Q15862 wd:Q1299 wd:Q106648 wd:Q2831 } . %(song)s"),
    dict(id="fiftyyejay", group="Music", emoji="💎", prompt="Name a song by 50 Cent, Kanye West or Jay-Z", kind="thing", limit=1500, minsl=0,
         where="?x wdt:P175 ?a . VALUES ?a { wd:Q6060 wd:Q15935 wd:Q62766 } . %(song)s"),
    dict(id="lilsong", group="Music", emoji="🧢", prompt="Name a song by a \"Lil\" rapper", kind="thing", limit=1500, minsl=0,
         where="?a wdt:P106 wd:Q2252262 ; rdfs:label ?al . FILTER(STRSTARTS(STR(?al), \"Lil \")) ?x wdt:P175 ?a . %(song)s"),
    dict(id="rapper1m", group="Music", emoji="🎙️", prompt="Name a rapper with over a million monthly listeners", kind="person", limit=900, minsl=15,
         where="?x wdt:P106 wd:Q2252262 ."),
    dict(id="maleband", group="Music", emoji="🥁", prompt="Name a male band with over a million monthly listeners", kind="thing", limit=900, minsl=22,
         where="?x wdt:P31 ?c . VALUES ?c { wd:Q215380 wd:Q5741069 wd:Q216337 } .",
         # all-male line-ups only: no girl groups, no band with a woman in it
         drop="{ ?x wdt:P31 wd:Q641066 } UNION { ?x wdt:P527 ?m . ?m wdt:P21 wd:Q6581072 }"),
    dict(id="femaleartist", group="Music", emoji="💃", prompt="Name a female artist with over a million monthly listeners", kind="person", limit=3000, minsl=30,
         where="?x wdt:P106 ?o . VALUES ?o { wd:Q177220 wd:Q2252262 wd:Q488205 } .",
         # women, born 1940 or later: artists people still stream, not film stars who sang
         keep="?x wdt:P21 wd:Q6581072 ; wdt:P569 ?b . FILTER(YEAR(?b) >= 1940)"),
    dict(id="stream100m", group="Music", emoji="🎧", prompt="Name a song with over 100 million streams", kind="thing", limit=1500, minsl=20,
         where="%(song)s", drop="?x wdt:P31 wd:Q23691 ."),  # no national anthems
    # ---- games ----
    dict(id="boardgame", group="Gaming", emoji="🎲", prompt="Name a board game", kind="thing", limit=1500, minsl=3,
         where="?x wdt:P31 wd:Q131436 ."),
    dict(id="videogame", group="Gaming", emoji="🎮", prompt="Name a video game or mobile game", kind="thing", limit=5000, minsl=15,
         where="?x wdt:P31 ?c . VALUES ?c { wd:Q7889 wd:Q1121542 } ."),
    # ---- places ----
    dict(id="mountain", group="Places", emoji="🏔️", prompt="Name a mountain", kind="thing", limit=1500, minsl=15,
         where="?x wdt:P31 wd:Q8502 ."),
    dict(id="capital", group="Places", emoji="🏛️", prompt="Name a country's capital city", kind="thing", limit=400, minsl=0,
         where="?c wdt:P31 wd:Q3624078 ; wdt:P36 ?x ."),
    dict(id="river", group="Places", emoji="🌊", prompt="Name a river", kind="thing", limit=1500, minsl=20,
         where="?x wdt:P31 wd:Q4022 ."),
    dict(id="bigcity", group="Places", emoji="🏙️", prompt="Name a city with over a million people", kind="thing", limit=1500, minsl=0,
         where="?x wdt:P1082 ?pop . FILTER(?pop >= 1000000) ?x wdt:P31 ?t . VALUES ?t { wd:Q515 wd:Q1549591 wd:Q1637706 wd:Q200250 wd:Q5119 wd:Q1093829 } ."),
    # ---- sport ----
    dict(id="cricket", group="Sport", emoji="🏏", prompt="Name a cricket player", kind="person", limit=1500, minsl=6,
         where="?x wdt:P106 wd:Q12299841 .",
         # Beckett and prime ministers played first-class cricket, but nobody says them first
         drop="?x wdt:P106 ?no . VALUES ?no { wd:Q82955 wd:Q36180 wd:Q1028181 wd:Q49757 wd:Q4964182 wd:Q214917 wd:Q1930187 } ."),
    dict(id="rugby", group="Sport", emoji="🏉", prompt="Name an international rugby player from this century", kind="person", limit=1500, minsl=3,
         where="?x wdt:P54 ?t . ?t wdt:P31 wd:Q58840819 . ?x wdt:P569 ?b . FILTER(YEAR(?b) >= 1975)"),
    dict(id="teams", group="Sport", emoji="🏟️", prompt="Name a sports team", kind="thing", limit=2000, minsl=20,
         where="?x wdt:P31 ?c . VALUES ?c { wd:Q476028 wd:Q103229495 wd:Q13393265 wd:Q17156793 wd:Q13027888 wd:Q4498974 wd:Q17376093 wd:Q14645593 } ."),
    dict(id="nbapl", group="Sport", emoji="⭐", prompt="Name a current NBA or Premier League player", kind="person", limit=1500, minsl=3,
         where="?x p:P54 ?m . ?m ps:P54 ?team . FILTER NOT EXISTS { ?m pq:P582 ?end } ?team wdt:P118 ?lg . VALUES ?lg { wd:Q155223 wd:Q9448 } . ?x wdt:P569 ?b . FILTER(YEAR(?b) >= 1984)"),
    # ---- screen ----
    dict(id="cartoonchar", group="Characters", emoji="🐭", prompt="Name a cartoon character", kind="character", limit=2000, minsl=3,
         where="?x wdt:P31 wd:Q15711870 ."),
    dict(id="toon3", group="Characters", emoji="🍩", prompt="Name a character from South Park, The Simpsons or Family Guy", kind="character", limit=1500, minsl=0,
         where="?x wdt:P1441 ?w . VALUES ?w { wd:Q886 wd:Q16538 wd:Q5930 } ."),
    dict(id="animated", group="Movies & TV", emoji="🏰", prompt="Name an original Disney, Pixar or DreamWorks movie", kind="thing", limit=1200, minsl=1,
         where="?x wdt:P272 ?st . VALUES ?st { wd:Q1047410 wd:Q127552 wd:Q500088 wd:Q191224 } . ?x wdt:P31 ?ft . VALUES ?ft { wd:Q11424 wd:Q29168811 wd:Q202866 } ."),
    dict(id="cnnick", group="Movies & TV", emoji="📺", prompt="Name a show from Cartoon Network or Nickelodeon", kind="thing", limit=1200, minsl=1,
         where="?x wdt:P449 ?n . VALUES ?n { wd:Q708290 wd:Q154958 } ."),
    dict(id="ryans", group="Movies & TV", emoji="🎬", prompt="Name a Ryan Reynolds or Ryan Gosling movie", kind="thing", limit=400, minsl=0,
         where="?x wdt:P161 ?a . VALUES ?a { wd:Q192682 wd:Q193815 } . ?x wdt:P31 wd:Q11424 ."),
    dict(id="sitcom", group="Movies & TV", emoji="🛋️", prompt="Name a sitcom", kind="thing", limit=1500, minsl=10,
         where="?x wdt:P136 wd:Q170238 ."),
    dict(id="superhero", group="Movies & TV", emoji="🦸", prompt="Name a superhero movie", kind="thing", limit=800, minsl=3,
         where="?x wdt:P136 wd:Q1535153 ; wdt:P31 wd:Q11424 ."),
    # ---- other ----
    dict(id="tech", group="Other", emoji="💻", prompt="Name a tech company", kind="thing", limit=1200, minsl=20,
         where="{ ?x wdt:P31 ?t . VALUES ?t { wd:Q18388277 wd:Q1058914 } } UNION { ?x wdt:P452 ?ind . VALUES ?ind { wd:Q11661 wd:Q880371 wd:Q11016 } }"),
    dict(id="criminal", group="Other", emoji="🔪", prompt="Name a serial killer or famous criminal", kind="person", limit=1200, minsl=15,
         where="?x wdt:P106 ?o . VALUES ?o { wd:Q484188 wd:Q2159907 } ."),
    dict(id="carbrand", group="Other", emoji="🚗", prompt="Name a car brand", kind="thing", limit=800, minsl=8,
         where="?x wdt:P31 wd:Q786820 ."),
    dict(id="airline", group="Other", emoji="✈️", prompt="Name an airline", kind="thing", limit=1000, minsl=10,
         where="?x wdt:P31 wd:Q46970 ."),
]
for _c in CATEGORIES:
    _c["where"] = _c["where"] % {"song": "?x wdt:P31 ?st . VALUES ?st { wd:Q7366 wd:Q134556 } ."}



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
        if label and label[0].islower() and cat["kind"] == "thing" and cat["id"] in ("boardgame", "mountain", "river"):
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
    n = len(ranked)
    cuts = (min(40, max(1, round(n * 0.15))), min(200, max(2, round(n * 0.4))), min(800, max(3, round(n * 0.7))))
    for rank, it in enumerate(ranked):
        tier = sum(rank >= c for c in cuts)
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
