#!/usr/bin/env python3
"""
Aggregate analyze_channel.py's out/<id>.json files into a style report.

    python summarize.py                 # reads out/, writes out/style_report.md
    python summarize.py --out other/    # a different analysis folder

Writes style_report.md (for reading), style_report.json (every number in the
report, for reuse) and style_palette.png (the dominant colours as swatches).

Sections: the corpus, shot-length distribution, hook structure (the first few
seconds: cuts, opening caption, first words), on-screen text frequency, title
patterns, spoken words, and dominant colours.
"""
import argparse
import colorsys
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from statistics import median

import numpy as np

HERE = Path(__file__).resolve().parent

STOPWORDS = set("""
a about above after again against all am an and any are as at be because been before being below between both but
by can could did do does doing down during each few for from further had has have having he her here hers herself him
himself his how i if in into is it its itself just let me more most my myself no nor not now of off on once only or
other our ours ourselves out over own same she should so some such than that the their theirs them themselves then
there these they this those through to too under until up very was we were what when where which while who whom why
will with would you your yours yourself yourselves im its dont thats youre ive ill id oh uh um yeah okay ok gonna
""".split())

SHOT_BUCKETS = [(0, 0.5), (0.5, 1), (1, 2), (2, 3), (3, 5), (5, 10), (10, float("inf"))]


# --------------------------------------------------------------------------
# helpers
# --------------------------------------------------------------------------

def norm(text):
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9' ]+", " ", (text or "").lower())).strip()


def words(text):
    return [w.strip("'") for w in norm(text).split() if len(w.strip("'")) > 1 and not w.strip("'").isdigit()]


def content_words(text):
    return [w for w in words(text) if w not in STOPWORDS]


def stats(values):
    if not values:
        return None
    a = np.asarray(values, dtype=float)
    p10, p25, p50, p75, p90 = np.percentile(a, [10, 25, 50, 75, 90])
    return {"n": len(a), "mean": round(float(a.mean()), 2), "min": round(float(a.min()), 2), "p10": round(p10, 2),
            "p25": round(p25, 2), "median": round(p50, 2), "p75": round(p75, 2), "p90": round(p90, 2),
            "max": round(float(a.max()), 2)}


def pct(part, whole):
    return round(100 * part / whole, 1) if whole else 0.0


def bar(share, width=30):
    return "█" * round(share / 100 * width)


def jaccard(a, b):
    a, b = set(a), set(b)
    return len(a & b) / len(a | b) if a | b else 0.0


def position(box):
    cy = (box[1] + box[3]) / 2
    return "top" if cy < 1 / 3 else "middle" if cy < 2 / 3 else "bottom"


def real_segments(doc):
    """Drop what Whisper produces over music: the standard no-speech + low-confidence test."""
    tr = doc.get("transcript") or {}
    return [s for s in tr.get("segments", []) if not (s["no_speech_prob"] > 0.6 and s["avg_logprob"] < -1.0)]


def lines_of(shot, min_conf):
    return [norm(h["text"]) for h in shot.get("ocr", []) if h["conf"] >= min_conf and norm(h["text"])]


def load(out):
    docs = []
    for p in sorted(out.glob("*.json")):
        try:
            d = json.loads(p.read_text())
        except json.JSONDecodeError:
            continue
        if isinstance(d, dict) and "shots" in d and "video" in d:
            docs.append(d)
    return docs


# --------------------------------------------------------------------------
# sections
# --------------------------------------------------------------------------

def corpus(docs):
    durs = [d["video"]["duration"] or d["shots"][-1]["end"] for d in docs]
    dates = sorted(d["video"]["upload_date"] for d in docs if d["video"].get("upload_date"))
    views = [d["video"]["view_count"] for d in docs if d["video"].get("view_count") is not None]
    return {"videos": len(docs), "total_minutes": round(sum(durs) / 60, 1), "duration_s": stats(durs),
            "first_upload": dates[0] if dates else None, "last_upload": dates[-1] if dates else None,
            "views": stats(views)}


def shot_lengths(docs):
    all_d = [s["duration"] for d in docs for s in d["shots"]]
    first = [d["shots"][0]["duration"] for d in docs]
    rest = [s["duration"] for d in docs for s in d["shots"][1:]]
    per_video = [len(d["shots"]) for d in docs]
    asl = [d["shots"][-1]["end"] / len(d["shots"]) for d in docs]
    cpm = [(len(d["shots"]) - 1) / (d["shots"][-1]["end"] / 60) for d in docs if d["shots"][-1]["end"] > 0]
    hist = []
    for lo, hi in SHOT_BUCKETS:
        n = sum(1 for x in all_d if lo <= x < hi)
        hist.append({"bucket": f"{lo:g}–{hi:g}s" if hi != float("inf") else f"{lo:g}s+", "shots": n, "pct": pct(n, len(all_d))})
    return {"shot_seconds": stats(all_d), "first_shot_seconds": stats(first), "later_shot_seconds": stats(rest),
            "shots_per_video": stats(per_video), "avg_shot_length_per_video": stats(asl),
            "cuts_per_minute": stats(cpm), "histogram": hist}


def hooks(docs, window, min_conf):
    rows = []
    for d in docs:
        shots = d["shots"]
        opening = " ".join(lines_of(shots[0], min_conf))
        tokens = words(opening)
        # how long does the opening caption stay up? share of runtime whose text matches it
        held = sum(s["duration"] for s in shots if tokens and jaccard(words(" ".join(lines_of(s, min_conf))), tokens) >= 0.5)
        positions = [position(h["box"]) for h in shots[0].get("ocr", []) if h["conf"] >= min_conf]
        segs = real_segments(d)
        first_word = next((w for s in segs for w in s["words"]), None)
        rows.append({
            "id": d["video"]["id"], "title": d["video"].get("title"), "views": d["video"].get("view_count"),
            "first_shot_s": shots[0]["duration"],
            "cuts_in_window": sum(1 for s in shots[1:] if s["start"] < window),
            "opening_text": opening if tokens else "",
            "opening_text_position": Counter(positions).most_common(1)[0][0] if positions else None,
            "opening_text_held_pct": pct(held, shots[-1]["end"]) if tokens else None,
            "title_matches_opening_text": bool(tokens) and jaccard(words(d["video"].get("title")), tokens) >= 0.5,
            "first_word_s": first_word["start"] if first_word else None,
            "first_words": " ".join(w["word"] for w in [w for s in segs for w in s["words"]][:12]) or None,
        })
    n = len(rows)
    texted = [r for r in rows if r["opening_text"]]
    spoken = [r for r in rows if r["first_word_s"] is not None]
    openers = Counter(" ".join(r["opening_text"].split()[:2]) for r in texted)
    by_views = sorted(rows, key=lambda r: r["views"] or 0, reverse=True)
    return {
        "window_s": window,
        "first_shot_seconds": stats([r["first_shot_s"] for r in rows]),
        "cut_within_window_pct": pct(sum(1 for r in rows if r["cuts_in_window"]), n),
        "cuts_in_window": stats([r["cuts_in_window"] for r in rows]),
        "opening_text_pct": pct(len(texted), n),
        "opening_text_position": dict(Counter(r["opening_text_position"] for r in texted if r["opening_text_position"])),
        "opening_text_held_pct": stats([r["opening_text_held_pct"] for r in texted]),
        "opening_text_held_most_of_video_pct": pct(sum(1 for r in texted if r["opening_text_held_pct"] >= 80), len(texted)),
        "title_matches_opening_text_pct": pct(sum(1 for r in rows if r["title_matches_opening_text"]), n),
        "top_openers": openers.most_common(15),
        "speech_pct": pct(len(spoken), n),
        "first_word_seconds": stats([r["first_word_s"] for r in spoken]),
        "speech_within_window_pct": pct(sum(1 for r in spoken if r["first_word_s"] < window), n),
        "top_videos": by_views[:12],
    }


def on_screen_text(docs, min_conf):
    line_df, word_df, bigram_df = Counter(), Counter(), Counter()
    positions = Counter()
    shots_total = shots_texted = 0
    for d in docs:
        lines, ws, bgs = set(), set(), set()
        for s in d["shots"]:
            shots_total += 1
            ls = lines_of(s, min_conf)
            shots_texted += bool(ls)
            lines.update(ls)
            positions.update(position(h["box"]) for h in s.get("ocr", []) if h["conf"] >= min_conf)
            for line in ls:
                cw = content_words(line)
                ws.update(cw)
                bgs.update(" ".join(p) for p in zip(cw, cw[1:]))
        # count each video once, so a caption held across 20 shots isn't 20 votes
        line_df.update(lines)
        word_df.update(ws)
        bigram_df.update(bgs)
    return {"shots_with_text_pct": pct(shots_texted, shots_total),
            "text_position": {k: pct(v, sum(positions.values())) for k, v in positions.most_common()},
            "recurring_lines": [(t, n) for t, n in line_df.most_common(25) if n > 1],
            "top_words": word_df.most_common(40), "top_bigrams": [(t, n) for t, n in bigram_df.most_common(20) if n > 1]}


TITLE_PATTERNS = {
    "X vs Y": r"\bvs\.?\b", "starts with POV": r"^\s*pov\b", "when …": r"\bwhen\b", "question": r"\?",
    "#shorts": r"#shorts", "has emoji": r"[\U0001F300-\U0001FAFF☀-➿]", "ALL-CAPS word": r"\b[A-Z]{3,}\b",
}


def titles(docs):
    ts = [d["video"].get("title") or "" for d in docs]
    return {"words": stats([len(t.split()) for t in ts]), "chars": stats([len(t) for t in ts]),
            "patterns": {k: pct(sum(1 for t in ts if re.search(p, t, re.I if k != "ALL-CAPS word" else 0)), len(ts))
                         for k, p in TITLE_PATTERNS.items()},
            "top_words": Counter(w for t in ts for w in set(content_words(t))).most_common(30)}


def speech(docs):
    df, wpm = Counter(), []
    for d in docs:
        segs = real_segments(d)
        text = " ".join(s["text"] for s in segs)
        df.update(set(content_words(text)))
        talk = sum(s["end"] - s["start"] for s in segs)
        if talk > 1:
            wpm.append(len(words(text)) / (talk / 60))
    langs = Counter((d.get("transcript") or {}).get("language") for d in docs if real_segments(d))
    return {"videos_with_speech": sum(1 for d in docs if real_segments(d)), "languages": dict(langs),
            "words_per_minute_while_talking": stats(wpm), "top_words": df.most_common(30)}


def colours(docs, first_shot_only=False):
    """Pool every shot's palette weighted by screen time, merged into 32-step RGB bins."""
    weight, rgb_sum = defaultdict(float), defaultdict(lambda: np.zeros(3))
    for d in docs:
        for s in d["shots"][:1] if first_shot_only else d["shots"]:
            for c in s.get("colors", []):
                rgb = np.array([int(c["hex"][i:i + 2], 16) for i in (1, 3, 5)], dtype=float)
                w = s["duration"] * c["share"]
                key = tuple((rgb // 32).astype(int))
                weight[key] += w
                rgb_sum[key] += rgb * w
    total = sum(weight.values()) or 1
    out = []
    for key, w in sorted(weight.items(), key=lambda kv: -kv[1]):
        r, g, b = (rgb_sum[key] / w).round().astype(int)
        h, l, sat = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
        out.append({"hex": f"#{r:02x}{g:02x}{b:02x}", "pct": round(100 * w / total, 1), "chromatic": sat > 0.2 and 0.12 < l < 0.92})
    return out


def palette_png(entries, dst):
    from PIL import Image, ImageDraw
    width, height = 1200, 140
    im = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(im)
    total, x = sum(e["pct"] for e in entries), 0
    for e in entries:
        w = round(width * e["pct"] / total)
        draw.rectangle([x, 0, x + w, height - 30], fill=e["hex"])
        if w > 60:
            draw.text((x + 4, height - 24), f"{e['hex']} {e['pct']}%", fill="black")
        x += w
    im.save(dst)


# --------------------------------------------------------------------------
# report
# --------------------------------------------------------------------------

def md_stats(s, unit="s"):
    if not s:
        return "—"
    return f"median **{s['median']}{unit}** (p25 {s['p25']}{unit}, p75 {s['p75']}{unit}, p10–p90 {s['p10']}–{s['p90']}{unit})"


def md_counts(pairs, head=("", "videos")):
    if not pairs:
        return "_none_\n"
    rows = [f"| {head[0]} | {head[1]} |", "|---|---:|"] + [f"| {t} | {n} |" for t, n in pairs]
    return "\n".join(rows) + "\n"


def render(r, channel):
    c, sl, hk, tx, ti, sp = r["corpus"], r["shots"], r["hook"], r["text"], r["titles"], r["speech"]
    o = [f"# Style report — {channel}", "",
         f"{c['videos']} Shorts, {c['total_minutes']} minutes in all, uploaded {c['first_upload']} → {c['last_upload']}. "
         f"Length {md_stats(c['duration_s'])}."]
    if c["views"]:
        o.append(f"Views {md_stats(c['views'], '')}.")
    o += ["", "## Shot length", "",
          f"- **{sl['shot_seconds']['n']} shots**, each {md_stats(sl['shot_seconds'])}, mean {sl['shot_seconds']['mean']}s",
          f"- per video: {md_stats(sl['shots_per_video'], ' shots')}",
          f"- average shot length per video: {md_stats(sl['avg_shot_length_per_video'])}",
          f"- cuts per minute: {md_stats(sl['cuts_per_minute'], '')}",
          f"- opening shot {md_stats(sl['first_shot_seconds'])} vs later shots {md_stats(sl['later_shot_seconds'])}",
          "", "| shot length | shots | % | |", "|---|---:|---:|---|"]
    o += [f"| {h['bucket']} | {h['shots']} | {h['pct']} | {bar(h['pct'])} |" for h in sl["histogram"]]
    o += ["", f"## Hook structure (first {hk['window_s']:g}s)", "",
          f"- first cut after {md_stats(hk['first_shot_seconds'])}; **{hk['cut_within_window_pct']}%** cut inside the window",
          f"- **{hk['opening_text_pct']}%** open with text on screen — position: "
          + ", ".join(f"{k} {v}" for k, v in sorted(hk["opening_text_position"].items(), key=lambda kv: -kv[1])),
          f"- that opening text stays up for {md_stats(hk['opening_text_held_pct'], '%')} of the runtime; "
          f"**{hk['opening_text_held_most_of_video_pct']}%** keep it for 80%+ (a caption held for the whole video)",
          f"- title ≈ opening text in **{hk['title_matches_opening_text_pct']}%**",
          f"- **{hk['speech_pct']}%** have speech; first word at {md_stats(hk['first_word_seconds'])}; "
          f"{hk['speech_within_window_pct']}% speak inside the window",
          "", "Most common openings (first two words of the opening text):", "",
          md_counts(hk["top_openers"], ("opens with", "videos")),
          "Top videos by views — what the first frame says:", "",
          "| views | title | opening text | first words spoken |", "|---:|---|---|---|"]
    for v in hk["top_videos"]:
        views = f"{v['views']:,}" if isinstance(v["views"], int) else "—"
        o.append(f"| {views} | {v['title']} | {v['opening_text'] or '—'} | {v['first_words'] or '—'} |")
    o += ["", "## On-screen text", "",
          f"- text on **{tx['shots_with_text_pct']}%** of shots; position of detections: "
          + ", ".join(f"{k} {v}%" for k, v in tx["text_position"].items()),
          "", "Lines that recur across videos:", "", md_counts(tx["recurring_lines"], ("line", "videos")),
          "Words (each video counted once):", "", md_counts(tx["top_words"][:25], ("word", "videos")),
          "Word pairs:", "", md_counts(tx["top_bigrams"], ("pair", "videos")),
          "## Titles", "",
          f"- {md_stats(ti['words'], ' words')}, {md_stats(ti['chars'], ' chars')}",
          "- " + " · ".join(f"{k} {v}%" for k, v in ti["patterns"].items()),
          "", md_counts(ti["top_words"][:20], ("title word", "videos")),
          "## Speech", "",
          f"- speech in {sp['videos_with_speech']} of {c['videos']} videos ({', '.join(f'{k} {v}' for k, v in sp['languages'].items()) or '—'}); "
          f"pace while talking {md_stats(sp['words_per_minute_while_talking'], ' wpm')}",
          "", md_counts(sp["top_words"][:20], ("spoken word", "videos")),
          "## Dominant colours", "",
          "Screen-time-weighted, every shot's palette pooled. ![palette](style_palette.png)", "",
          "| overall | % | | colour only (no white/black/grey) | % | | opening shot | % |", "|---|---:|---|---|---:|---|---|---:|"]
    chroma = [e for e in r["colours"] if e["chromatic"]]
    total_chroma = sum(e["pct"] for e in chroma) or 1
    for i in range(12):
        a = r["colours"][i] if i < len(r["colours"]) else None
        b = chroma[i] if i < len(chroma) else None
        f = r["opening_colours"][i] if i < len(r["opening_colours"]) else None
        cell = lambda e, p=None: (f"`{e['hex']}` | {p if p is not None else e['pct']}" if e else " | ")
        o.append(f"| {cell(a)} | | {cell(b, round(100 * b['pct'] / total_chroma, 1) if b else None)} | | {cell(f)} |")
    return "\n".join(o) + "\n"


def main(argv=None):
    ap = argparse.ArgumentParser(description="Aggregate analyze_channel.py output into a style report.")
    ap.add_argument("--out", type=Path, default=HERE / "out", help="analysis folder (default: out/ next to this script)")
    ap.add_argument("--hook-seconds", type=float, default=3.0, help="length of the opening window (default 3)")
    ap.add_argument("--min-conf", type=float, default=0.4, help="OCR confidence floor for text stats (default 0.4)")
    args = ap.parse_args(argv)

    docs = load(args.out)
    if not docs:
        raise SystemExit(f"no analysed videos in {args.out} — run analyze_channel.py first")
    listing = args.out / "_listing.json"
    channel = (json.loads(listing.read_text()).get("channel") if listing.exists() else None) \
        or docs[0]["video"].get("channel") or "channel"

    report = {
        "channel": channel, "corpus": corpus(docs), "shots": shot_lengths(docs),
        "hook": hooks(docs, args.hook_seconds, args.min_conf), "text": on_screen_text(docs, args.min_conf),
        "titles": titles(docs), "speech": speech(docs),
        "colours": colours(docs)[:40], "opening_colours": colours(docs, first_shot_only=True)[:12],
    }
    (args.out / "style_report.json").write_text(json.dumps(report, indent=1, ensure_ascii=False))
    palette_png(report["colours"][:16], args.out / "style_palette.png")
    (args.out / "style_report.md").write_text(render(report, channel))

    sl, hk = report["shots"], report["hook"]
    print(f"{len(docs)} videos · median shot {sl['shot_seconds']['median']}s · "
          f"{sl['cuts_per_minute']['median']} cuts/min · opening text in {hk['opening_text_pct']}% · "
          f"speech in {hk['speech_pct']}%")
    print(f"→ {args.out / 'style_report.md'}")


if __name__ == "__main__":
    main()
