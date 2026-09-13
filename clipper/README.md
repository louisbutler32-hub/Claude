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
2. **You drop the source video in** `projects/<slug>/source/` — any filename;
   it just has to be the only video in there.
3. **I write the script and the edit list** — `config.json`, one entry per shot.
4. **You record or generate the VO**, drop it in `projects/<slug>/vo/`.
5. **`transcribe.py`** turns the VO into word timings.
6. **`render.py`** cuts, composites, captions, mixes and masters.
7. **`validate.py`** checks the cut against the format before it goes out.
8. **`upload.py`** builds the packaging — title, description, tags, thumbnail.
9. **You post it.**

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

# packaging — run after the render so the thumbnail matches the real framing
python3 upload.py projects/gold-bars/config.json
```

Output lands in `out/<slug>.mp4` — 1080×1920, 60fps, mastered to −17.3 LUFS.

## When the source is too big to hand over

A 30-minute 1080p video is a couple of gigabytes. It does not need to move —
**an edit list is just timecodes, and timecodes do not care what resolution
they were picked at.** `scout.py` splits the job in two so nothing large is
ever transferred.

**Stage 1 — survey.** Run against the full file; produces a few megabytes.

```bash
python3 scout.py "C:/Users/You/Downloads/source.mp4"
```

```
scout/
  info.json      duration, resolution, frame rate
  shots.txt      every scene change with timecodes  (~30 KB of text)
  sheet_NN.jpg   contact sheets, timecode burned into every frame
```

For a 31-minute source that is about **7 MB**. `shots.txt` is the valuable
part — it turns "find a good shot near 10:40" into a list to pick from.

**Stage 2 — pull only the shots the cut uses.** Once the edit list exists, it
is only ~58 seconds of footage:

```bash
python3 scout.py "C:/.../source.mp4" --windows 1:20-1:31,8:22-8:24,... --budget 25
```

58 seconds inside a 25 MB budget is ~3400 kbps — good quality, and it uploads.
It writes `windows.mp4` plus `windows.json`, which records what came from where
so a config can be written against it without guessing.

**Or skip both** and render locally: the config is the only thing that has to
travel, and `render.py` runs against the original where it already lives.

## Where files go

Each project has three drop-in folders. They are tracked in git (empty, via
`.gitkeep`) so they exist on a fresh clone; their contents are ignored.

```
projects/<slug>/
  source/   the long-form video          <- drop it here
  vo/       narration, and its .words.json
  music/    the bed
```

**Filenames do not matter.** The `source`, `vo` and `music` fields in the
config are hints — if the folder holds exactly one file of the right type, that
is what gets used, whatever it is called. Only when a folder has two or more
does the config field have to pick between them.

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
| `title_alternates` | Two alternates, required by the delivery convention |
| `summary`, `credit`, `tags`, `hashtags` | Feed the description and tag list |
| `thumbnail` | `{"frame": 24.5, "text": "81 GRAMS|OF PURE GOLD"}` — `|` splits lines |
| `beats` | The beat map, carried into `upload.md` for reference |

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
  upload.py          title, description, tags and 9:16 thumbnail
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

## Packaging

A render never goes out on its own — `upload.md` and the thumbnail go with it
in the same message, per the delivery convention in `CLAUDE.md`. `upload.py`
builds all of it:

- title plus two alternates
- description, with the Pebblo Pebble playlist and subscribe block above the
  hashtags, and the source creator credited above that
- tags, trimmed to YouTube's 500-character cap (it reports what it dropped)
- `out/thumbnail-<slug>.jpg` at 1080x1920, hook text in the caption face

No chapter list: these are sub-60s Shorts and YouTube needs every chapter to be
at least 10s. The beat map is written into `upload.md` as an edit reference
instead.

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
