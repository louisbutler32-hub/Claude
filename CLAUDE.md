# Working notes

## The channel

Everything here is for **Pebblo Pebble** — https://www.youtube.com/@PebbloPebble

Every learning video's description links the learning playlist:
https://www.youtube.com/playlist?list=PLoUPhFQ29b0IFLdy3cMomLyy1RDAkV2zg

Both go near the end of the description, above the hashtags, in this block:

```
📚 ALL OUR LEARNING VIDEOS
https://www.youtube.com/playlist?list=PLoUPhFQ29b0IFLdy3cMomLyy1RDAkV2zg

🥕 Subscribe to Pebblo Pebble:
https://www.youtube.com/@PebbloPebble
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

`src/geo/` is the satellite-map explainer line (Bering, Louisiana, Darién):
one camera over NASA Blue Marble tiles, flags on the countries, numbers in
callouts, captions a phrase at a time. **Read `src/geo/README.md` first.**

The tiles are derived from public-domain imagery and gitignored — on a fresh
clone run `pip install pillow numpy && npm run geo:tiles` (about ten minutes)
before rendering, or every frame is flat sea. Thumbnails for this line are
9:16, via `npm run geo:<name>:thumb`.
