# One Piece Video Project — Summary

_Last updated: 2026-07-30_

## What this project is

A set of **code-generated One Piece videos** built with [Remotion](https://remotion.dev)
(React that renders to MP4). Everything lives in this repo on branch
`claude/one-piece-bounty-video-bl8596`. The videos are motion-graphics
edits in the fast-cut "anime what-if essay" style: impact text cards,
speech bubbles, stat gauges, screen shakes, colored flash frames, animated
fire/ice/light effects, a narrator avatar, backgrounds, and character
cutouts — with **slots** where licensed anime footage can be dropped in.

## What the user wants

- High-energy One Piece "what-if" / ranking essay videos, edited to a
  detailed scene-by-scene blueprint (fast cuts 0.5–2s, screen shake,
  pan/zoom, saturation boost on hype shots, B&W for flashbacks, colored
  flash frames per admiral — red/cyan/yellow).
- The main active video: **"What if the 3 Admirals became pirates?"** —
  a full 7-minute edit (Akainu, Kuzan/Aokiji, Kizaru defect and take down
  every Yonko).
- Real anime **footage and sound effects dropped into the edit**, plus
  animated character cutouts and custom graphics.
- To preview/render the videos locally on the user's **Windows PC**.

## The three videos (Remotion compositions)

| Composition | Length | What it is |
|---|---|---|
| `AdmiralsVideo` | 7:00 | The main video — "3 Admirals become pirates," full blueprint |
| `AdmiralsVideo-SFXcues` | 7:00 | Same video with on-screen SFX timing markers for the audio pass |
| `WhatIfVideo` | 4:45 | "What if the Straw Hats were reborn" essay edit |
| `BountyVideo` | 13:00 | "The most broken bounty jump" data-viz video |

## What's been built (done)

- **AdmiralsVideo, full 0:00–7:00** to the blueprint: intro (glitch text,
  3-way split reveal, ability montage, Sengoku "?", scale shatter, world
  map, "COULD ANYONE STOP THEM?"), Chapter 1 betrayal + B&W atrocity
  flashbacks, three admiral profile sections with stat gauges, synergy
  triangle + crosshairs + newspapers, then Big Mom / Kaido / Shanks /
  Blackbeard takedowns and the "NO YONKO LEFT / ONLY THE ADMIRALS" finale.
- **Animated fire / ice / light ability effects** built from the admiral
  cutouts (Akainu magma-burst lunge, Kuzan ice-spread, Kizaru light-dash),
  playing over the location backgrounds with colored atmosphere washes.
- **9 character cutouts** processed to transparent PNGs (`public/assets/`):
  akainu, kuzan, kizaru, fujitora, greenbull, garp, sengoku, luffy,
  luffy-kid.
- **7 backgrounds** upscaled to 1080p (`public/assets/backgrounds/`).
- **Frame-accurate SFX cue sheet** (`src/admirals/sfx.ts`) mapping every
  blueprint sound to its exact frame + its timestamp in the user's SFX file.
- The other two videos (`WhatIfVideo`, `BountyVideo`) fully built.

## How footage / clips work (the drop-in system)

The videos are built so licensed footage is added by the user, not baked in
by the assistant. Every footage point is a **ClipSlot** (shows a labeled
placeholder box until a file is supplied).

To add clips:
1. Put video files in `public/assets/clips/` (e.g. `akainu.mp4`,
   `kuzan.mp4`, `kizaru.mp4`).
2. Register them in the `CLIPS` map near the top of
   `src/admirals/AdmiralsVideo.tsx` (already pre-filled to reuse the 3
   ability files across each admiral's scenes).

Enemy cutouts (Big Mom, Kaido, Shanks, Blackbeard) work the same way via the
`ENEMY_CUTOUTS` set in `src/admirals/part2.tsx` — add an id once you drop the
matching `public/assets/<id>.png`.

## Important constraint (why some things weren't done)

The assistant **will not cut ripped/watermarked anime footage into a
rendered video, strip watermarks, or extract a ripped SFX compilation** —
the supplied footage carries another channel's on-screen watermark and
YouTube-ripper filenames. So the assistant built everything *around* the
footage (graphics, effects, cutouts, timing, labeled slots) and left the
actual footage drop-in to the user, who does it locally in the project. The
`CLIPS` / `ENEMY_CUTOUTS` system exists specifically so the user can preview
and render with their own footage on their own machine, under their control.

## How to run it (Windows)

Open PowerShell (Start → type "PowerShell"). First time only:
```
git clone https://github.com/louisbutler32-hub/claude.git one-piece
cd one-piece
git checkout claude/one-piece-bounty-video-bl8596
npm install
```
Every time after, from inside the `one-piece` folder:

- **Preview in browser (Remotion Studio, localhost:3000):**
  ```
  npm start
  ```
- **Render the full-quality MP4:**
  ```
  npx remotion render AdmiralsVideo out/admirals.mp4
  ```
  then open it with `start out\admirals.mp4`.
- Get the latest changes anytime: `git pull`

Note: `remotion.config.ts` has a `Config.setBrowserExecutable(...)` line only
needed for the cloud sandbox — delete it if it causes a browser error locally.

## Suggested next steps

- Cut the 3 ability files to the specific moments per scene (trim points),
  or process enemy cutouts (Big Mom, Kaido, Shanks, Blackbeard).
- Generate / record the voiceover and lock caption + scene timing to it.
- Wire the real SFX in an editor using the `AdmiralsVideo-SFXcues` markers.
- Design the thumbnail.

## Repo map

```
src/
  Root.tsx                     # registers all compositions
  admirals/
    AdmiralsVideo.tsx          # the 7:00 main video + CLIPS map
    parts.tsx                  # chapter cards, gauges, pins, triangle, crosshairs, newspapers
    part2.tsx                  # 3:20–7:00 scenes: targets, assaults, quake, finale + ENEMY_CUTOUTS
    effects.tsx                # animated magma / ice / light effects
    sfx.ts                     # SFX cue sheet (frame -> sound + timestamp)
    SfxCueReview.tsx           # overlay comp showing cues on screen
  whatif/                      # WhatIfVideo (Straw Hats reborn)
  data/ + BountyVideo.tsx      # BountyVideo (bounty data-viz)
public/assets/                 # cutouts, backgrounds, (clips/ = your footage)
```
