# clipper

Turns one long-form video into a Short cut to the format in
[`FORMAT.md`](FORMAT.md) — the one reverse-engineered from
*"He Compressed 100 RedBulls into 1 Drink"* (15.4M views).

Every number in `lib/spec.py` was measured off that file. The pipeline is
deliberately opinionated: it produces that format, not a general-purpose
editor.

## The loop

1. **I source the concept** — a long-form video with a built-in twist.
   Candidates and their beat maps live in [`CONCEPTS.md`](CONCEPTS.md).
2. **You drop the source video in** `projects/<slug>/source/`.
3. **I write the script and the edit list** — `config.json`, one entry per shot.
4. **You record or generate the VO**, drop it in `projects/<slug>/vo/`.
5. **`transcribe.py`** turns the VO into word timings.
6. **`render.py`** cuts, composites, captions, mixes and masters.
7. **`validate.py`** checks the cut against the format before it goes out.
8. **You post it.**

## Setup

```bash
apt-get install -y ffmpeg
pip install faster-whisper pillow
```

Poppins Black ships in `assets/fonts/` — libass finds it via `fontsdir`, so
nothing needs installing system-wide.

## Running it

```bash
cd clipper

# VO -> word timings (captions change every ~0.24s, so word level is required)
python3 transcribe.py projects/gold-bars/vo/narration.wav

# full render
python3 render.py projects/gold-bars/config.json

# fast look at one section while you tune the cut
python3 render.py projects/gold-bars/config.json --preview 0 12

# check the cut without rendering
python3 validate.py projects/gold-bars/config.json
```

Output lands in `out/<slug>.mp4` — 1080×1920, 60fps, mastered to −17.3 LUFS.

## config.json

See [`projects/_template/config.json`](projects/_template/config.json).

| Field | What it does |
|---|---|
| `title` | Must contain `@creator` — the validator fails without it |
| `source` | The long-form video to cut from |
| `clips` | `in`/`out` in **source** time. Order is the edit; they need not be sequential |
| `clips[].pan` | −1..1. The panel crops ~63% of a 16:9 width, so use this when the subject sits off-centre |
| `clips[].zoom` | >1 punches in. Useful for making a wide shot readable |
| `keywords` | word → colour. One coloured word every 10–15s, no more |
| `annotations` | `arrow`, `circle`, `double-circle` at `x`/`y` in 0..1 of the frame |
| `source_audio_windows` | Where the original audio is heard. The reference uses this once — the creator's own reaction as the final beat |

## What the validator checks

It is `FORMAT.md`'s checklist as code. It never blocks a render; it tells you
which of the things that made the reference work are missing from yours:

- runtime under 60s, median shot ~0.98s, first cut before 1.2s
- cut density falls across the turn and picks back up
- overall pace ≥175 WPM, hook ≥240 WPM
- no gap over 0.4s, a number at least every 8s
- hook is a question or a claim; no CTA anywhere
- final beat uses source audio
- source credited in the title

## Layout

```
clipper/
  FORMAT.md          the measured spec — read this first
  CONCEPTS.md        sourced long-form candidates, ranked, with beat maps
  render.py          cut -> composite -> caption -> mix -> master
  transcribe.py      VO -> word timings
  validate.py        the format checklist, as code
  lib/
    spec.py          every measured constant
    video.py         cutting and the blur-fill composite
    captions.py      word-by-word ASS with the rounded-join outline
    audio.py         VO + ducked bed, compressed to LRA 3.2
    annotate.py      hand-drawn arrows and circles
  assets/fonts/      Poppins Black
  projects/<slug>/   one video: config, source, vo, music
  out/               renders
```

## Notes

- **Source footage and renders are gitignored.** Only configs, scripts and the
  spec are tracked.
- The caption font is Poppins Black. The reference uses something very close to
  it but not identical — at 0.24s per word on a phone, the difference does not
  read. The thing that matters is the *rounded join* on a 15px stroke, which is
  what produces the blob silhouette.
- Attribution is not decoration. The reference channel puts `@NileRed/YT` in
  every title, and that is what makes a clipping channel viable rather than a
  reupload.
