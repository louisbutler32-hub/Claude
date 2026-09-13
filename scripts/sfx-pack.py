#!/usr/bin/env python3
"""Catalogue a third-party sound pack and sort it by how risky it is to use.

The pack lives gitignored in .sfx/raw. This reads every file, measures it, and
splits it three ways:

  ip        clips whose name identifies copyrighted music, film, TV or game
            audio. These are what Content ID actually fingerprints.
  excluded  profanity and slurs. Not a monetisation question.
  usable    everything else — generic foley and unattributed voice clips.

Writes .sfx/catalogue.json. Nothing here is committed: the audio is third
party and stays out of the repo.

    python3 scripts/sfx-pack.py
"""
import json
import os
import re
import sys

import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, ".sfx", "raw")

# Named franchises, games, shows, ads and artists. Broad on purpose: a false
# positive costs one sound, a false negative costs a Content ID claim.
IP = re.compile(
    r"big_shaq|the_office|naruto|roblox|csgo|counter_strike|fortnite|pubg|toyota|vine_boom"
    r"|minecraft|mario|spongebob|patrick|squidward|anime|metal_slug|among_us|windows|star_wars"
    r"|nokia|tiktok|ninja|family_guy|simpsons|homer|peter_griffin|rick_and_morty|dbz|dragon_ball"
    r"|gta|mortal_kombat|finish_him|get_over_here|hadouken|street_fighter|keanu|john_cena"
    r"|undertale|zelda|pokemon|sonic|halo|valorant|overwatch|league_of|skyrim|witcher|portal"
    r"|half_life|fbi_open_up|crab_rave|discord|siri|netflix|nintendo|playstation|xbox|sega"
    r"|wii|duolingo|nokia|whatsapp|super_idol|pacman|pac_man|tetris|doom|gmod|garry",
    re.I,
)
EXCLUDE = re.compile(r"nigg|bitch|fuck|_fk|shit|step_bro|dick|ass_back", re.I)


def main():
    if not os.path.isdir(RAW):
        sys.exit("no pack at %s" % RAW)
    rows, seen = [], set()
    for name in sorted(os.listdir(RAW)):
        if not name.lower().endswith((".wav", ".mp3", ".flac", ".ogg")):
            continue
        path = os.path.join(RAW, name)
        try:
            x, sr = sf.read(path)
        except Exception as e:  # a pack can contain junk
            rows.append({"name": name, "bucket": "unreadable", "error": str(e)})
            continue
        mono = x.mean(1) if x.ndim > 1 else x
        peak = float(np.max(np.abs(mono))) if len(mono) else 0.0
        bucket = "excluded" if EXCLUDE.search(name) else "ip" if IP.search(name) else "usable"
        # the slug is what a cue sheet refers to: "105_bruh.wav" -> "bruh".
        # The pack repeats a few names, so later duplicates keep their number.
        slug = re.sub(r"^\d+_", "", os.path.splitext(name)[0]).strip("_")
        if slug in seen:
            slug = "%s_%s" % (slug, name.split("_", 1)[0])
        seen.add(slug)
        rows.append({
            "name": name,
            "bucket": bucket,
            "slug": slug,
            "seconds": round(len(mono) / sr, 3),
            "rate": sr,
            "peak": round(peak, 3),
        })

    counts = {}
    for r in rows:
        counts[r["bucket"]] = counts.get(r["bucket"], 0) + 1
    usable = [r for r in rows if r["bucket"] == "usable"]
    json.dump({"counts": counts, "files": rows}, open(os.path.join(ROOT, ".sfx", "catalogue.json"), "w"), indent=1)

    print("catalogued %d files: %s" % (len(rows), counts))
    if usable:
        secs = [r["seconds"] for r in usable]
        rates = {}
        for r in usable:
            rates[r["rate"]] = rates.get(r["rate"], 0) + 1
        print("usable: %.2f-%.2fs (median %.2fs), rates %s, %d clip over 4s" % (
            min(secs), max(secs), sorted(secs)[len(secs) // 2], rates,
            sum(1 for s in secs if s > 4)))
        quiet = [r["name"] for r in usable if r["peak"] < 0.2]
        print("very quiet (peak < 0.2): %d%s" % (len(quiet), (" — " + ", ".join(quiet[:4])) if quiet else ""))


if __name__ == "__main__":
    main()
