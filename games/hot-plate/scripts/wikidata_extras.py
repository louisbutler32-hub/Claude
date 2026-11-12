"""Top up the hand-written lists (data-src/*.txt) with everything Wikidata knows of that kind.

    python3 scripts/wikidata_extras.py [ids...]
    python3 scripts/build_lists.py        # then rebuild data/*.json from data-src

New names are appended to the end of each list (so they land in the rarer tiers) unless the game
would already accept them: spellings are compared the way server/answers.js compares them. Lines
already in the file are never touched.
"""
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_data import sparql, clean  # noqa: E402
from union_lists import norm  # noqa: E402

SRC = Path(__file__).resolve().parent.parent / "data-src"

# "label" kinds use the item's English label (and must have a Wikipedia article);
# "taxon" kinds use English common names (P1843), which is what people actually say.
EXTRAS = {
    "dessert": ("label", "{ ?x wdt:P279+ wd:Q182940 } UNION { ?x wdt:P31/wdt:P279* wd:Q182940 }"),
    "herbspice": ("label", "{ ?x wdt:P279*|wdt:P31/wdt:P279* wd:Q42527 } UNION { ?x wdt:P279*|wdt:P31/wdt:P279* wd:Q207123 }"),
    "alcohol": ("label", "{ ?x wdt:P279+ wd:Q154 } UNION { ?x wdt:P31/wdt:P279* wd:Q154 }"),
    "soda": ("label", "{ ?x wdt:P279+ wd:Q147538 } UNION { ?x wdt:P31/wdt:P279* wd:Q147538 }"),
    "juicesoda": ("label", "{ ?x wdt:P31/wdt:P279* wd:Q147538 } UNION { ?x wdt:P31/wdt:P279* wd:Q8492 }"),
    "lolly": ("label", "{ ?x wdt:P31/wdt:P279* wd:Q1361086 } UNION { ?x wdt:P31/wdt:P279* wd:Q185583 } UNION { ?x wdt:P279+ wd:Q185583 }"),
    "casino": ("label", "{ ?x wdt:P31/wdt:P279* wd:Q133215 } UNION { ?x wdt:P31/wdt:P279* wd:Q3742351 } UNION { ?x wdt:P279+ wd:Q3742351 }"),
    "chips": ("label", "{ ?x wdt:P31/wdt:P279* wd:Q173265 } UNION { ?x wdt:P1056 wd:Q173265 }"),
    "shoes": ("label", "?x wdt:P1056/wdt:P279* wd:Q161928 ."),
    "bible": ("label", "?x wdt:P31 wd:Q20643955 ."),
    "currency": ("label", "?x wdt:P31/wdt:P279* wd:Q8142 ."),
    # every bird species with an English name (BirdLife's list)
    "birdinsect": ("taxon", "?x wdt:P5257 ?id ."),
    # every mammal species in Mammal Species of the World, minus whales, seals, sea cows and sea otters
    "landmammal": ("taxon", "?x wdt:P959 ?id . FILTER NOT EXISTS { ?x wdt:P171* ?o . VALUES ?o { wd:Q160 wd:Q30263 wd:Q25431 wd:Q41407 } }"),
}


def fetch(kind, where):
    if kind == "taxon":
        q = f"""SELECT ?x ?n WHERE {{ {where} ?x wdt:P1843 ?n . FILTER(lang(?n) = "en") }}"""
    else:
        q = f"""SELECT DISTINCT ?x ?n WHERE {{ {where}
          ?x wikibase:sitelinks ?sl . FILTER(?sl >= 1)
          ?x rdfs:label ?n . FILTER(lang(?n) = "en") }}"""
    names = {}
    for b in sparql(q):
        qid = b["x"]["value"].rsplit("/", 1)[-1]
        n = clean(b["n"]["value"])
        if not n or len(n) < 3:
            continue
        if kind == "taxon":
            n = n[0].upper() + n[1:]
        names.setdefault(qid, [])
        if n not in names[qid]:
            names[qid].append(n)
    return list(names.values())


def known(path):
    seen = set()
    for line in path.read_text().splitlines():
        if line.strip() and not line.startswith("#"):
            for part in line.split("|"):
                k = norm(part.strip())
                if k:
                    seen.add(k)
    return seen


def main():
    wanted = set(sys.argv[1:])
    for cid, (kind, where) in EXTRAS.items():
        if wanted and cid not in wanted:
            continue
        path = SRC / f"{cid}.txt"
        if not path.exists():
            print(f"{cid:<12} no data-src file")
            continue
        try:
            groups = fetch(kind, where)
        except Exception as e:
            print(f"{cid:<12} FAILED: {e}", flush=True)
            continue
        seen = known(path)
        lines = []
        for names in groups:
            keys = {norm(n) for n in names} - {""}
            names = names[:4]
            if not names or keys & seen:
                continue
            seen |= keys
            lines.append(" | ".join(names))
        if lines:
            text = path.read_text().rstrip("\n") + "\n" + "\n".join(lines) + "\n"
            path.write_text(text)
        print(f"{cid:<12} +{len(lines)} from Wikidata", flush=True)
        time.sleep(2)


if __name__ == "__main__":
    main()
