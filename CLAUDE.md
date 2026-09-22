# Working notes

## The channels

Two channels ship out of this repo. Check which one a subject belongs to
before writing a title or description — the footer block differs.

**Pebblo Pebble** — https://www.youtube.com/@PebbloPebble — the kids'
learning-video line (`src/guess/`, `src/veggies/`, `src/numbers/`,
`src/animals/`, `src/vehicles/`, `src/dinosaurs/`, `src/sea/`, and the
doodle-essay subjects: `src/earth/`, `src/mummy/`, `src/face/`,
`src/killers/`, `src/planets/`). Every one of these links the learning
playlist: https://www.youtube.com/playlist?list=PLoUPhFQ29b0IFLdy3cMomLyy1RDAkV2zg

Both go near the end of the description, above the hashtags, in this block:

```
📚 ALL OUR LEARNING VIDEOS
https://www.youtube.com/playlist?list=PLoUPhFQ29b0IFLdy3cMomLyy1RDAkV2zg

🥕 Subscribe to Pebblo Pebble:
https://www.youtube.com/@PebbloPebble
```

**BANE History** — https://www.youtube.com/@BANEHistory — the satellite-map
Shorts line, all of `src/geo/` (Bering, Louisiana, Darién, and the four
what-if alternate-history shorts: WW1, Waterloo, Texas, the states at war).
No known playlist to link yet — the block is just:

```
🎬 Subscribe to BANE History:
https://www.youtube.com/@BANEHistory
```

## Delivering a video

**Every video ships with its packaging.** When a render is sent, send the
upload package with it in the same message — never the file on its own:

| piece | where it lives |
|---|---|
| title (plus two alternates) | `src/<subject>/upload.md` |
| description with chapter list | same file — chapter times come from the beat sheet, not eyeballed |
| tags | same file, inside YouTube's 500-character cap |
| thumbnail | `npm run <subject>:thumb` → `out/thumbnail-*.jpg`, 1920×1080 (9:16 for Shorts) |

If a piece does not exist yet, make it before sending rather than sending
the video and promising the rest.

Chapter times are derived from `src/guess/beats.ts`, so they stay correct
if a round's timing changes. First chapter must be `0:00` and every chapter
at least 10s or YouTube rejects the list.

Anything aimed at under-13s has to be flagged **made for kids** on upload.

## Like & Subscribe reminder

Every guess-format episode shows a "👍 Like & Subscribe for more!" corner
card three times, automatically — it's wired into the shared engine
(`src/guess/LikeSubscribe.tsx`, called from `src/guess/GuessVideo.tsx`),
timed to the celebrate beat of three evenly-spread rounds
(`likeSubRounds()`), so no per-episode work is needed to keep it in every
video going forward.

## Renders are big

A full episode render is ~110-145 MB, over the 30 MiB send limit. Send a
CRF 28 copy (~25 MB, visually identical on this flat art) and say plainly
that it is the compressed one, with the command to build the master.

## Generated audio is not licensed

`edge-tts` output is for timing the edit, not for shipping. It stays
gitignored. Each episode's track is a drop-in slot at
`public/audio/<subject>-mix.mp3`.

## Shorts — the clipper

`clipper/` is a separate line from the learning videos: it cuts one long-form
YouTube video into a 60s Short in a measured format, with the source creator
credited in the title.

**Read `clipper/START-HERE.md` before touching it.** It covers the setup, the
current project state, and the next action. The format spec is
`clipper/FORMAT.md` and every constant in `clipper/lib/spec.py` was measured
off the reference video — treat them as findings, not preferences.

Source videos are gigabytes, so this runs locally, never in a web session.
Run `python clipper/doctor.py` to check the machine has what it needs.

## Shorts — the geo maps

`src/geo/` is the satellite-map explainer line — Bering, Louisiana, Darién,
and the four what-if alternate-history shorts (WW1, Waterloo, Texas, the
states at war): one camera over NASA Blue Marble tiles, flags on the
countries, numbers in callouts. **Read `src/geo/README.md` first.** This
whole line ships on **BANE History**, not Pebblo Pebble — see "The channels"
above for the footer block.

The tiles are derived from public-domain imagery and gitignored — on a fresh
clone run `pip install pillow numpy && npm run geo:tiles` (about ten minutes)
before rendering, or every frame is flat sea. Thumbnails for this line are
9:16, via `npm run geo:<name>:thumb`. The what-if shorts use one-word
captions (`WordCaptions`) instead of the phrase captions (`Captions`) the
first three use — see `src/geo/hud.tsx`.
