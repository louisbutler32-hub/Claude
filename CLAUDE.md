# Working notes

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

## Renders are big

A full episode render is ~110-145 MB, over the 30 MiB send limit. Send a
CRF 28 copy (~25 MB, visually identical on this flat art) and say plainly
that it is the compressed one, with the command to build the master.

## Generated audio is not licensed

`edge-tts` output is for timing the edit, not for shipping. It stays
gitignored. Each episode's track is a drop-in slot at
`public/audio/<subject>-mix.mp3`.
