# Find 10 — hidden-object Shorts

A remake of the "Find 10 ducks" format: one still scene, ten of the same
animal strung out along its path toward the horizon, each doing its gait on
the spot, and a "Find 10 …" title. The near one is huge and half out of
frame; the far one is a speck. Ten seconds, 9:16, on Pebblo Pebble.

| composition | scene | animal | render |
|---|---|---|---|
| `Find-Meadow-Cats` | alpine pasture, gravel lane, fence, dandelions | orange tabby, walks | `npm run find:meadow` |
| `Find-Lake-Frogs` | misty jungle lake, wooden walkway to a palm island | green frog, hops | `npm run find:lake` |

Thumbnails: `npm run find:meadow:thumb` / `npm run find:lake:thumb`
(frame 45, 1080×1920 JPEG). Upload copy: `upload.md`.

## How it's built

- `scenes.tsx` — the two scenes, all SVG drawn in code (no photos, nothing
  lifted from the reference). Each exports a background, a foreground drawn
  over the animals, and ten `slots` `{x, y, s}`: where each animal's feet
  go and its scale. `FALLOFF` is the size ladder front-to-back; the second
  one is about half the first, matching the reference.
- `animals.tsx` — the characters, drawn facing right with the ground at
  y = 0, heavy-outlined like a sticker. `phase` is the gait clock: the cat
  swings stub legs and bobs, the frog crouches, hops, hangs and lands.
  Add an animal by drawing one and adding it to `ANIMALS` — the title
  picks up its `plural`.
- `FindShort.tsx` — puts them together: slow push-in, far-to-near draw
  order so near ones overlap far ones, every third one mirrored so the
  line isn't a stamp, title pops in over the first half second.
- `geom.ts` — spline / ribbon helpers for the winding lane.

Swapping the animal or scene is one line: `<FindShort scene="lake"
animal="cat" />`.

## Audio

The soundtrack is a drop-in at `public/audio/find-loop.m4a` (gitignored,
like every other episode's track). `FIND_FRAMES` = 306 is the loop's
length at 30 fps; if the track changes, change that with it.
