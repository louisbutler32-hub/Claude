# One Piece video projects (Remotion)

Two compositions live in this repo:

- **`WhatIfVideo`** — "What If The Straw Hats Were Reborn" essay edit (4:45)
- **`BountyVideo`** — "The Most Broken Bounty Jump" data-viz video (13:00)

## WhatIfVideo — how it works

`src/whatif/shots.ts` encodes the full scene-by-scene breakdown (times in
seconds, matching the spec exactly). Every copyrighted visual — anime PNG
cutouts, clips, manga panels — is a **placeholder slot** rendered as a
labeled dashed box telling you exactly which asset goes there and what
filename to use. To fill one in:

1. Drop your licensed file into `public/assets/` (e.g. `assets/ace-death.png`)
2. In `shots.ts`, add `src: "assets/ace-death.png"` to that slot

All original graphics are fully implemented: impact text cards, typewriter
chapter cards, speech bubbles, location pins, floating ?/hearts, greyscale/
sepia/red-tint filters, screen shake, red-X denial, comedic punch wipe,
Conqueror's-Haki glow, speed lines, glitch, static, film grain, ember
particles, and the narrator set (hoodie silhouette, brick wall, neon sign,
mic, manga shelf). `sfx` fields on shots are audio-pass cue notes only.

---

# The Most Broken Bounty Jump in One Piece History

Remotion project that renders the full script as a data-viz-only video —
bar-chart-race style bounty comparisons, no anime footage or manga art, so
it stays clear of Content ID.

## Structure

- `src/data/bounty-data.json` — every bounty figure from the script (old →
  new → delta, plus multipliers where the script calls them out).
- `src/BountyVideo.tsx` — top-level composition; `TIMELINE` maps 1:1 to the
  script's own timestamps (0:00 cold open through 12:30 close).
- `src/sections/` — one component per script section (Cold Open, Rules,
  Warm-Up Tier, Mid Tier, Record Holders, Record Break #1, The Answer,
  Close).
- `src/components/` — reusable pieces: `BarRow` (growing bounty bar),
  `AxisBreakGag` (Buggy's finale — bar rockets past frame, camera zooms
  out in steps, matches the script's visual note), `Caption` (VO lower
  third), `TitleCard`, `SectionLabel`, `BerryCounter`.

Captions currently show the VO lines as on-screen lower-thirds and are
timed by estimated reading pace — once you record or generate real VO
audio, re-time each `Sequence`'s `durationInFrames` to match the actual
audio and add an `<Audio src={...} />` track in `BountyVideo.tsx`.

## Commands

```bash
npm install
npm start          # opens Remotion Studio for live preview/scrubbing
npm run build       # renders out/bounty-video.mp4 (full 13:00)
npm run still       # renders a single still frame for a quick sanity check
```
