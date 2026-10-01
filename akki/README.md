# AKKI TALKS re-edits

Re-cuts of finished AKKI TALKS Shorts — the animation is untouched; the edit
adds pop-in hook/beat captions (Poppins Black, white + yellow) in the
centre-lower band, a 12% zoom punch on the payoff beat, and a 9:16 thumbnail.

1. Drop the original render in `akki/source/<name>.mp4` (gitignored).
2. `bash akki/build.sh [name]` → `out/akki/<name>.mp4` + `out/akki/thumbnail-<name>.jpg`.

Per short: `captions.ass` (timed captions), `thumb.ass` (thumbnail text),
`upload.md` (title, alternates, description, tags). Punch-in window and
thumbnail frame live in the `SHORTS` table in `build.sh`.

Captions sit at y≈1240–1300: below the burned-in title (y≈210–440) and above
the Shorts UI. Keep them there.
