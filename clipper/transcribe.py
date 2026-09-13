#!/usr/bin/env python3
"""Turn a voiceover recording into word-level timings for the caption track.

    python3 transcribe.py vo.wav -o words.json [--model base.en]

Captions in this format change every ~0.24s, so word-level timestamps are not
optional — sentence-level timing will not cut it.
"""

import argparse
import json
import os
import sys


def transcribe(audio_path, model_size="base.en"):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        sys.exit("faster-whisper is not installed:  pip install faster-whisper")

    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    segments, _ = model.transcribe(audio_path, word_timestamps=True, beam_size=5)

    words, sentences = [], []
    for seg in segments:
        sentences.append({
            "start": round(seg.start, 2),
            "end": round(seg.end, 2),
            "text": seg.text.strip(),
        })
        for w in (seg.words or []):
            token = w.word.strip()
            if token:
                words.append({
                    "w": token,
                    "s": round(w.start, 2),
                    "e": round(w.end, 2),
                })
    return words, sentences


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("-o", "--out", default=None)
    ap.add_argument("--model", default="base.en",
                    help="base.en is fine for clean VO; small.en if unsure")
    args = ap.parse_args()

    words, sentences = transcribe(args.audio, args.model)
    out = args.out or os.path.splitext(args.audio)[0] + ".words.json"
    with open(out, "w") as fh:
        json.dump({"words": words, "sentences": sentences}, fh, indent=1)

    dur = words[-1]["e"] if words else 0
    wpm = len(words) / dur * 60 if dur else 0
    print(f"{len(words)} words, {dur:.1f}s, {wpm:.0f} WPM  ->  {out}")
    for s in sentences:
        print(f"  [{s['start']:>5.1f}-{s['end']:>5.1f}] {s['text']}")


if __name__ == "__main__":
    main()
