#!/usr/bin/env python3
"""Put word timings into a short's timing.json, for one-word-at-a-time captions.

    python3 scripts/align-words.py geo-ww1

Runs faster-whisper over the finished narration, lines the words it heard up
against the words in the script (each line inside its own time window), and
writes `words: [[word, start, end], …]` into every entry of
<out>/timing.json. Script words the model missed — numbers it heard as
"fifty-six", hyphenated names it split — are placed by interpolation
between their timed neighbours, so every word gets a slot.

Needs:  pip install faster-whisper   (the 'small' model is fetched on first run)
"""
import difflib
import json
import os
import re
import sys

from faster_whisper import WhisperModel

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def norm(w):
    return re.sub(r"[^a-z0-9]", "", w.lower())


def main():
    name = sys.argv[1]
    spec = json.load(open(os.path.join(ROOT, "scripts-vo", "%s.json" % name)))
    out_dir = os.path.join(ROOT, *spec["out"].split("/"))
    path = os.path.join(out_dir, "timing.json")
    timing = json.load(open(path))
    mp3 = os.path.join(ROOT, "public", "assets", "vo", "%s.mp3" % name)

    model = WhisperModel("small", device="cpu", compute_type="int8")
    segments, _ = model.transcribe(mp3, word_timestamps=True, language="en", beam_size=3)
    heard = [(norm(w.word), float(w.start), float(w.end)) for s in segments for w in s.words if norm(w.word)]

    matched = total = 0
    for line in timing:
        words = line["text"].split()
        total += len(words)
        lo, hi = line["start"] - 0.35, line["end"] + 0.35
        window = [h for h in heard if h[1] >= lo and h[2] <= hi]
        sm = difflib.SequenceMatcher(a=[norm(w) for w in words], b=[h[0] for h in window], autojunk=False)
        times = [None] * len(words)
        for tag, i1, i2, j1, j2 in sm.get_opcodes():
            if tag == "equal" or (tag == "replace" and i2 - i1 == j2 - j1):
                for k in range(i2 - i1):
                    times[i1 + k] = [window[j1 + k][1], window[j1 + k][2]]
        matched += sum(1 for t in times if t)

        # interpolate the gaps by character weight between timed neighbours
        i = 0
        while i < len(words):
            if times[i]:
                i += 1
                continue
            j = i
            while j < len(words) and not times[j]:
                j += 1
            t0 = times[i - 1][1] if i > 0 else line["start"]
            t1 = times[j][0] if j < len(words) else line["end"]
            weights = [max(2, len(norm(w))) for w in words[i:j]]
            span = max(t1 - t0, 0.05 * len(weights))
            acc = t0
            for k, w in enumerate(weights):
                d = span * w / sum(weights)
                times[i + k] = [acc, acc + d]
                acc += d
            i = j
        # keep the sequence monotonic and inside the line
        for k in range(len(times)):
            s, e = times[k]
            s = max(s, line["start"] if k == 0 else times[k - 1][1] - 0.02)
            e = max(e, s + 0.05)
            times[k] = [s, e]
        times[-1][1] = min(max(times[-1][1], times[-1][0] + 0.05), line["end"] + 0.05)
        line["words"] = [[w, round(s, 3), round(e, 3)] for w, (s, e) in zip(words, times)]

    json.dump(timing, open(path, "w"), indent=1)
    print("%s: %d/%d words timed by the model, the rest interpolated -> %s" % (name, matched, total, os.path.relpath(path, ROOT)))


if __name__ == "__main__":
    main()
