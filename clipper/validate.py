#!/usr/bin/env python3
"""Check a cut against the measured format before it goes out.

    python3 validate.py projects/red-bull/config.json

This is the FORMAT.md checklist as code. It does not block a render — it tells
you which of the things that made the reference work are missing from yours.
"""

import argparse
import json
import os
import re
import statistics
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import spec  # noqa: E402

PASS, WARN, FAIL = "PASS", "WARN", "FAIL"
NUMBER = re.compile(r"\d|\b(one|two|three|four|five|six|seven|eight|nine|ten|"
                    r"hundred|thousand|half|third|thirds|quarter|double|triple)\b",
                    re.I)


def _line(status, label, detail):
    mark = {PASS: "  ok ", WARN: "  ~~ ", FAIL: "  XX "}[status]
    return f"{mark}{label:<34} {detail}"


def validate(cfg, clips, duration, words=None):
    rows = []

    # ---- runtime -------------------------------------------------------
    if duration > 60.0:
        rows.append((FAIL, "runtime under 60s", f"{duration:.1f}s — Shorts will cut it"))
    elif duration < 25:
        rows.append((WARN, "runtime", f"{duration:.1f}s — short for this format"))
    else:
        rows.append((PASS, "runtime", f"{duration:.1f}s"))

    # ---- shot rhythm ---------------------------------------------------
    lengths = [float(c["out"]) - float(c["in"]) for c in clips]
    if lengths:
        med = statistics.median(lengths)
        mean = statistics.mean(lengths)
        longest = max(lengths)
        rows.append(
            (PASS if 0.7 <= med <= 1.4 else WARN, "median shot length",
             f"{med:.2f}s (reference {spec.SHOT_MEDIAN_S:.2f}s)")
        )
        rows.append(
            (PASS if mean <= 1.35 else WARN, "mean shot length", f"{mean:.2f}s")
        )
        over = [i for i, l in enumerate(lengths) if l > spec.SHOT_MAX_S]
        # the two shots either side of the turn are allowed to run long
        allowed = 2
        if len(over) <= allowed:
            rows.append((PASS, "no shot over 1.5s",
                         f"{len(over)} long shot(s), within the turn allowance"))
        else:
            rows.append((WARN, "no shot over 1.5s",
                         f"{len(over)} shots exceed {spec.SHOT_MAX_S}s "
                         f"(longest {longest:.2f}s) at indices {over[:6]}"))

        first_cut = lengths[0]
        rows.append((PASS if first_cut <= 1.2 else WARN, "first cut before 1.2s",
                     f"{first_cut:.2f}s"))

        # cut density should fall around the turn, then pick back up
        if duration >= 40:
            def density(a, b):
                t, n = 0.0, 0
                for l in lengths:
                    if a <= t < b:
                        n += 1
                    t += l
                return n
            mid = density(duration * 0.5, duration * 0.68)
            early = density(0, duration * 0.33)
            rows.append(
                (PASS if mid < early else WARN, "slows down at the turn",
                 f"{early} cuts in the first third vs {mid} across the turn")
            )

    # ---- script --------------------------------------------------------
    if words:
        total = len(words)
        spoken = words[-1]["e"] - words[0]["s"]
        wpm = total / spoken * 60 if spoken else 0
        rows.append(
            (PASS if wpm >= 175 else WARN, "overall pace",
             f"{wpm:.0f} WPM (reference {spec.TARGET_WPM})")
        )

        hook = [w for w in words if w["e"] <= spec.HOOK_MAX_S]
        hook_wpm = len(hook) / spec.HOOK_MAX_S * 60 if hook else 0
        rows.append(
            (PASS if hook_wpm >= spec.HOOK_WPM_MIN else WARN, "hook pace",
             f"{hook_wpm:.0f} WPM over the first {spec.HOOK_MAX_S}s "
             f"(reference 247)")
        )

        gaps = [words[i + 1]["s"] - words[i]["e"] for i in range(len(words) - 1)]
        big = [g for g in gaps if g > spec.MAX_SENTENCE_GAP_S]
        rows.append(
            (PASS if not big else WARN, "no dead air",
             f"{len(big)} gap(s) over {spec.MAX_SENTENCE_GAP_S}s"
             + (f", longest {max(big):.2f}s" if big else ""))
        )

        # a number at least every 8 seconds
        stamps = [w["s"] for w in words if NUMBER.search(w["w"])]
        worst, prev = 0.0, 0.0
        for t in stamps + [spoken]:
            worst = max(worst, t - prev)
            prev = t
        rows.append(
            (PASS if worst <= spec.NUMBER_EVERY_S else WARN, "a number every 8s",
             f"{len(stamps)} numbers, longest stretch without one {worst:.1f}s")
        )

        text = " ".join(w["w"] for w in words).lower()
        first = text[:90]
        rows.append(
            (PASS if ("?" in first or first.startswith(("what", "how", "why",
                                                        "this", "he ", "imagine")))
             else WARN,
             "hook is a question or claim", f'"{first[:60]}..."')
        )
        for phrase in ("subscribe", "follow for more", "like and", "comment below"):
            if phrase in text:
                rows.append((FAIL, "no CTA", f'script contains "{phrase}"'))
                break
        else:
            rows.append((PASS, "no CTA", "clean"))

    # ---- payoff --------------------------------------------------------
    windows = cfg.get("source_audio_windows") or []
    if windows and duration:
        last = max(float(b) for _, b in windows)
        rows.append(
            (PASS if last >= duration - 6 else WARN, "button uses source audio",
             f"source audio through to {last:.1f}s")
        )
    else:
        rows.append((WARN, "button uses source audio",
                     "none set — the reference ends on the creator's own reaction"))

    # ---- title ---------------------------------------------------------
    title = cfg.get("title", "")
    if not title:
        rows.append((FAIL, "title", "missing"))
    else:
        credited = "@" in title
        rows.append((PASS if credited else FAIL, "source credited in title",
                     title if credited else f'no "@creator" in: {title}'))
        emoji = any(ord(ch) > 0x2100 for ch in title)
        rows.append((PASS if emoji else WARN, "shock emoji in title",
                     "present" if emoji else "none"))

    body = "\n".join(_line(s, l, d) for s, l, d in rows)
    n_fail = sum(1 for s, _, _ in rows if s == FAIL)
    n_warn = sum(1 for s, _, _ in rows if s == WARN)
    verdict = ("on format" if not n_fail and not n_warn
               else f"{n_fail} blocking, {n_warn} to look at")
    return f"format check — {verdict}\n{body}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("config")
    args = ap.parse_args()
    base = os.path.dirname(os.path.abspath(args.config))
    with open(args.config) as fh:
        cfg = json.load(fh)
    clips = cfg.get("clips") or []
    duration = sum(float(c["out"]) - float(c["in"]) for c in clips)
    words = None
    if cfg.get("words"):
        p = cfg["words"]
        p = p if os.path.isabs(p) else os.path.join(base, p)
        if os.path.exists(p):
            with open(p) as fh:
                data = json.load(fh)
            words = data["words"] if isinstance(data, dict) else data
    print(validate(cfg, clips, duration, words))


if __name__ == "__main__":
    main()
