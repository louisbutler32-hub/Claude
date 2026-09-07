# What this project is

**A code-generated YouTube video studio.** Videos are not edited in a timeline —
they are written as React components and rendered to MP4 by
[Remotion](https://remotion.dev). The repo currently produces anime essay videos
and animated history documentaries, and includes a research tool for deciding
what to make next.

The one-sentence version: *everything about a video that can be expressed as
code is expressed as code, so a video is a thing you can version, diff, re-render
and reuse — and the only manual steps left are the ones that legally or
creatively have to be.*

---

## Why build videos this way

A normal editing workflow puts the video in a binary project file. You cannot
diff it, you cannot reuse a section in another video without rebuilding it, and
changing one timing decision means dragging clips around by hand.

Encoding the video as code buys four things:

| | |
|---|---|
| **Re-render on change** | Fix a stat, change a colour, re-time a beat → re-render. No manual re-edit. |
| **Reuse across videos** | A title card system or an animated map built once works in every future video. |
| **Data-driven visuals** | `BountyVideo` reads real figures from `src/data/bounty-data.json`. The bars *are* the data — they cannot drift out of sync with it. |
| **Version control** | Every change to a video is a diff with a reason attached. |

The cost is that anything genuinely visual — footage choice, thumbnail craft —
still needs a human. The project is designed around that split rather than
pretending it away.

---

## The pipeline

This is the whole ambition, stage by stage, with an honest status for each.

```
  1. IDEA          what video to make          ██████████  built
  2. SCRIPT        beats + voiceover copy      ████░░░░░░  manual, partly templated
  3. VOICEOVER     recorded or generated       ██░░░░░░░░  manual
  4. VISUALS       motion graphics             ██████████  built — the strongest part
  5. FOOTAGE       licensed clips              ████░░░░░░  deliberately manual (see below)
  6. RENDER        MP4 out                     ██████████  built
  7. THUMBNAIL     the click                   ░░░░░░░░░░  not started
  8. PACKAGING     title / description         ██████░░░░  idea lab covers title, not description
```

### 1. Idea — `tools/idea-lab/`

Paste three videos you want to be like, plus niche, goal views and target CTR.
It resolves them to real stats, tells you whether they actually overperformed or
just sit on big channels, places your goal on a real view distribution, and
generates title + concept briefs from formats measured across 18,822 real
videos.

It also encodes a finding that shapes how the rest of the pipeline should be
prioritised: **title surface form does not predict performance.** Tested four
ways on 677 videos across 19 niches, the honest split gives AUC 0.499 — chance.
Full write-up in `tools/idea-lab/docs/evidence.html`.

The practical consequence for this project: time spent on ALL-CAPS-and-emoji
experiments is wasted; time spent on *topic choice* and *distribution* is not.

### 2. Script — `scripts-vo/`

Voiceover scripts live as markdown (`mansa-musa.md`, `mongols-europe.md`). The
scene-by-scene structure is separately encoded in TypeScript — `src/whatif/shots.ts`
holds the full timed breakdown for `WhatIfVideo`, and `src/admirals/` splits its
7-minute blueprint across `AdmiralsVideo.tsx`, `parts.tsx` and `part2.tsx`.

**This is the weakest link.** The script and the timing are written twice, in two
places, by hand, and nothing checks that they agree.

### 3. Voiceover — `public/assets/vo/`

One recorded file so far (`mongols.mp3`). Captions are currently timed by
*estimated reading pace*, which means they drift against real audio. The fix is
mechanical but not yet done: once VO exists, re-time each `Sequence`'s
`durationInFrames` to the real audio and add an `<Audio>` track.

### 4. Visuals — `src/`

The mature part of the project. 19 registered compositions across four systems,
described below.

### 5. Footage — the drop-in slot model

Every point where licensed anime footage belongs is a **placeholder slot** that
renders a labelled dashed box telling you exactly which file goes there. You drop
the file into `public/assets/` and register it; the box becomes the footage.

This exists for a specific reason: the supplied footage carried another channel's
on-screen watermark and YouTube-ripper filenames. Rather than cut that into a
render, everything was built *around* it — graphics, effects, cutouts, timing,
labelled slots — leaving the footage drop-in to you, locally, under your control.

The mechanism: the `CLIPS` map in `src/admirals/AdmiralsVideo.tsx`, and
`ENEMY_CUTOUTS` in `src/admirals/part2.tsx`.

### 6. Render

`npm start` for live preview, `npx remotion render <id> out/<name>.mp4` for the
file. See **Running it** below.

### 7–8. Thumbnail and packaging

Not built. The idea lab produces titles; nothing yet produces descriptions, tags,
or thumbnails. Given the evidence above, the thumbnail is the higher-value gap —
it is the half of the click-through decision the data could not rule out.

---

## The four visual systems

### Anime essay videos

| Composition | Length | What it is |
|---|---|---|
| `AdmiralsVideo` | 7:00 | "What if the 3 Admirals became pirates" — the main video |
| `AdmiralsVideo-SFXcues` | 7:00 | Same edit with on-screen SFX timing markers for the audio pass |
| `WhatIfVideo` | 4:45 | "What if the Straw Hats were reborn" |
| `BountyVideo` | 13:00 | "The most broken bounty jump" — pure data-viz, no anime footage |

`BountyVideo` is worth understanding as a pattern: it is **deliberately
footage-free**, built entirely from bar-chart-race graphics driven by
`src/data/bounty-data.json`. That sidesteps Content ID completely. Any topic with
numbers behind it can be made this way.

`AdmiralsVideo` carries the richest original work: animated magma/ice/light
ability effects built from character cutouts (`src/admirals/effects.tsx`), nine
transparent-PNG cutouts, seven upscaled backgrounds, and a frame-accurate SFX cue
sheet (`src/admirals/sfx.ts`) mapping every sound to its exact frame.

### Animated history maps — `src/maps/`

`Map-WW2-Europe`, `Map-Mongols-Europe`, `Map-Mansa-Musa`. Real Natural Earth
vector coastlines, a keyframed camera, territories changing hands over time,
engraved place names, city markers, drawn-on offensive arrows.

This is the clearest example of the reuse argument: the map engine was built
once and has produced three videos in a completely different genre from the anime
work. Docs in `src/maps/README.md`.

### Title cards — `src/titles/`

Twelve `Title-*` compositions: documentary type on a plane that sits inside the
shot's 3D space, with fast type-on reveal, foreground-subject occlusion, and
transparent overlay exports (WebM alpha and ProRes 4444) so a card can be laid
over footage in any editor. Docs in `src/titles/README.md`.

### Shared components — `src/components/`

`BarRow`, `AxisBreakGag`, `Caption`, `TitleCard`, `SectionLabel`, `BerryCounter`,
`RecordFlash`, `SectionFade`. The pieces the videos above are assembled from.

---

## Where this actually stands

**Strong:** the rendering half. Visual systems are built, documented, reusable
across two unrelated genres, and produce finished 4–13 minute videos.

**Weak:** everything upstream and downstream of rendering.

The three gaps worth naming plainly:

1. **The pipeline has a hole in the middle.** `tools/idea-lab` decides what to
   make. `src/` renders it. Nothing connects them — the output of the idea stage
   does not feed the script stage in any form a machine can use.
2. **Script and timing are duplicated by hand.** Written once as prose in
   `scripts-vo/`, once as frame counts in TypeScript, with no check that they
   agree. This is where re-times get expensive.
3. **Captions are timed to guesses, not audio.** Until real VO exists and
   sequences are re-timed to it, every video is slightly out of sync by
   construction.

If you want a next move, closing gap 2 has the best ratio: one script format that
both generates the VO markdown *and* emits the frame timings, so the two cannot
drift.

---

## Running it

Requires Node 20+. Two independent halves — the video project needs
`npm install`, the idea lab needs nothing.

### Videos

```bash
npm install          # first time only
npm start            # Remotion Studio at localhost:3000 — live preview, scrub any composition
```

Render a specific composition:

```bash
npx remotion render AdmiralsVideo out/admirals.mp4
npx remotion render BountyVideo out/bounty-video.mp4
npx remotion render Map-WW2-Europe out/map-ww2-europe.mp4
```

`package.json` has shortcuts for the common ones: `npm run build`, `npm run map`,
`npm run title`, and alpha-channel variants like `npm run name:alpha` for
transparent overlay exports.

> On Windows, if you hit a browser error, delete the
> `Config.setBrowserExecutable(...)` line in `remotion.config.ts` — it is only
> needed in the cloud sandbox.

### Idea lab

```bash
cd tools/idea-lab
node src/cli.mjs --niche "one piece theory" --goal 500k --ctr 6% --subs 12000 --offline
npm test             # 39 tests, ~2s
```

Full options in `tools/idea-lab/README.md`. Set `YOUTUBE_API_KEY` and drop
`--offline` to analyse your own reference videos.

---

## Repo map

```
src/
  Root.tsx              registers all 19 compositions
  admirals/             AdmiralsVideo — the 7:00 main video
    AdmiralsVideo.tsx     top-level timeline + CLIPS drop-in map
    parts.tsx             chapter cards, stat gauges, pins, triangle, newspapers
    part2.tsx             3:20–7:00 scenes + ENEMY_CUTOUTS
    effects.tsx           animated magma / ice / light ability effects
    sfx.ts                frame-accurate SFX cue sheet
  whatif/               WhatIfVideo + shots.ts (full timed breakdown)
  maps/                 animated history map engine        → README.md
  titles/               3D-perspective title card system   → README.md
  sections/             BountyVideo's per-section components
  components/           shared building blocks
  data/                 bounty-data.json — real figures driving the charts
scripts-vo/             voiceover scripts (markdown)
public/assets/          cutouts, backgrounds, props, vo/, clips/ (your footage)
tools/idea-lab/         idea + title research tool         → README.md
                          docs/evidence.html — the measurement write-up
```

## Related docs

- `README.md` — per-composition detail for the video side
- `PROJECT_SUMMARY.md` — history of what was built and why
- `src/maps/README.md`, `src/titles/README.md` — subsystem docs
- `tools/idea-lab/README.md` — the research tool, and the null result in full
