# Working notes

## The channels

Three channels ship out of this repo. Check which one a subject belongs to
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

**Boppity Pals**: proposed handle `@BoppityPals`, not yet claimed. This is
the play-along Shorts line, all of `src/play/`. Its channel package (art,
description, keywords, playlists, audience, posting plan) is in
`docs/channel-boppity-pals.md`, and `npm run play:brand` renders the art.
Once the channel exists, swap the real URL in here and in
`src/play/upload.md`. The block is:

```
🐾 Subscribe to Boppity Pals:
https://www.youtube.com/@BoppityPals
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

Every guess-format episode says "like and subscribe" three times,
automatically, via the shared engine — no per-episode work needed:

- **Once, out loud together with an on-screen card** ("👍 Like & Subscribe
  for more! 🔔"), during round 0's silent drift-in beat — 5 seconds into
  the video, before anything else is on screen or on the soundtrack, so it
  never competes with the guessing itself. Card: `src/guess/LikeSubscribe.tsx`,
  mounted from `src/guess/GuessVideo.tsx`. Voice line: `LIKE_SUB_START_OFFSET`
  in `scripts/build-audio.py` — keep the two in step if either moves.
- **Twice more, spoken only** (no card), later in the episode, at two
  round indices `like_sub_verbal_rounds()` spreads through the back half.

Both live in `scripts/build-audio.py`, so re-run that script's build (e.g.
`python3 scripts/build-audio.py <subject>`) after changing either — the
video-side engine change alone doesn't update the shipped `-mix.mp3`.

**Round order matters:** whatever `<subject>_ROUNDS` list feeds the audio
script must be in the *exact same order* as that subject's `rounds` array
in `src/<subject>/subject.tsx` — both are indexed by round number, and a
mismatch means the narration names the wrong thing. Check this explicitly
when adding a new episode; it's easy to write the two lists independently
and have them drift (happened once, on Wild Animals).

## Renders are big

A full episode render is ~110-145 MB, over the 30 MiB send limit. Send a
CRF 28 copy (~25 MB, visually identical on this flat art) and say plainly
that it is the compressed one, with the command to build the master.

## Generated audio is not licensed

`edge-tts` output is for timing the edit, not for shipping. It stays
gitignored. Each episode's track is a drop-in slot at
`public/audio/<subject>-mix.mp3`.

## Shorts — the play-along line

`src/play/` rebuilds two reference clips frame for frame as interactive
vertical Shorts: "play along with the beat!" (a rhythm game) and "Choose
your champion!" (a rope race). The cast is Biscuit the puppy, Poppy the
bunny, Bruno the bear and Mimi the cat. **No stone character in this line.**
**Read `src/play/README.md` first.** The timing in `beat-pattern.json` and
`race-schedule.json` was measured off the references, so the Shorts run on
the references' own audio. `npm run play:ref-audio` extracts it, and
`play:beat` / `play:race` mux it back in after rendering. Don't let Remotion
embed it, because that adds 43 ms of lag. That audio isn't ours, so it stays
out of the repo, and the upload copy says what using it involves.

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

## Retention — the dopamine ladder

Every BANE History short is written against the six-rung framework in
[`docs/dopamine-ladder.md`](docs/dopamine-ladder.md): stimulation,
captivation, anticipation, validation, affection, revelation. Read it
before writing a script, and walk the checklist at the end of it when the
contact sheet comes back. The two rules that decide most of a short's
retention: **open on a question, not a statement, inside three seconds**,
and **never let the viewer go a stretch with nothing to wonder about**.

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

**No cartoon faces.** Two of the reference channels put googly eyes on
countries; that is not the look for this channel. The style is the clean,
professional one: flat saturated country fills with white outlines, bold
names set on the country itself, yellow highlight rings with leader lines,
big numbers on leaders, scale-comparison silhouettes, icon props, and 3D
title words. `src/geo/annotate.tsx` holds those pieces.
