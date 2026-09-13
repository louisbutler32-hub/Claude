# Start here

Read this first if you are a Claude session opening this folder for the first
time, or a human setting the machine up.

## What this is

A pipeline that cuts one long-form YouTube video into a 60-second Short in a
specific, measured format. The format was reverse-engineered from
*"He Compressed 100 RedBulls into 1 Drink"* (Tested And Proved, 15.4M views) —
every constant in `lib/spec.py` was measured off that file, not guessed.

Read in this order:

1. **`FORMAT.md`** — the spec. Canvas geometry, cut rhythm, script structure,
   caption style, audio mastering. The *why* behind every number.
2. **`CONCEPTS.md`** — sourced long-form candidates ranked by curiosity engine,
   with a fully worked beat map for the first video.
3. **`README.md`** — how to run everything.

## Why this runs locally

The source videos are 30-plus minutes at 1080p — a couple of gigabytes each.
They cannot be uploaded into a web session, and they should not be: the render
quality depends on cutting from the original rather than a compressed copy.
On a local machine the file is just a path, and nothing ever moves.

## Setup — Windows

```powershell
winget install Gyan.FFmpeg
winget install Python.Python.3.12
```

**Close and reopen the terminal** so PATH picks them up. Then, in this folder:

```powershell
python -m pip install pillow faster-whisper
python doctor.py
```

`doctor.py` checks everything, including whether ffmpeg has libass compiled in
— without it captions silently do not render, which is a confusing failure.
It prints the exact install line for anything missing.

On macOS or Linux the same thing, with `brew install ffmpeg` or
`sudo apt-get install -y ffmpeg`.

Note: on Windows the command is `python`, not `python3`.

## Current state

**Video #1 is chosen and scripted. It is waiting on footage.**

- Project: `projects/gold-bars/`
- Source needed: NileRed, *"Turning old jewelry into pure gold bars"*
  (`37Kn-kIsVu8`, 31:23) — drop it in `projects/gold-bars/source/`.
  Any filename; it just has to be the only video in that folder.
- `config.json` already has the title, description, tags, keywords, annotation
  cues and beat map.
- `upload.md` is already generated.
- **`clips` is empty.** That is the remaining work — the edit list.

The script is written and timed (192 words, 58.2s, 198 WPM, hook at 247 WPM).
It is in `CONCEPTS.md` under "Fully worked: the first video", with the source
timecode for every beat.

## The next action

Once the source video is in `projects/gold-bars/source/`:

```powershell
python scout.py "projects/gold-bars/source/<whatever it is called>.mp4"
```

That writes `scout/shots.txt` — every scene change in the source with
timecodes — plus contact sheets with the timecode burned into each frame.

Then, for a Claude session: read `shots.txt` and the contact sheets, and fill
in `clips` in `config.json` by matching shots to the beats in `CONCEPTS.md`.
Aim for the rhythm in `FORMAT.md`: median shot ~0.98s, nothing over 1.5s except
either side of the turn, and the cut density dropping across the turn.

Then:

```powershell
python validate.py projects/gold-bars/config.json    # check before rendering
python render.py projects/gold-bars/config.json      # cut it
python upload.py projects/gold-bars/config.json      # packaging
```

The voiceover is still needed — record or generate it, put it in
`projects/gold-bars/vo/`, then `python transcribe.py` on it to get word
timings. Captions change every ~0.24s, so word-level timing is not optional.
Without a VO, `render.py --no-captions` still produces the picture cut, which
is enough to check the rhythm.

## House rules that are easy to miss

- **The source creator goes in the title**, as `@handle`. `validate.py` fails
  the config without it. This is what separates a clipping channel from a
  reupload.
- **A render never ships alone.** `upload.md` and the thumbnail go with it in
  the same message — see `CLAUDE.md` in the repo root.
- **Source footage and renders are gitignored.** Only configs, scripts and the
  spec are tracked. Do not commit video.
- **No CTA in the script.** No "subscribe", no outro. The reference ends on the
  reaction and loops; `validate.py` checks for this.
