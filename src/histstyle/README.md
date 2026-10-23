# History style tests

Four candidate looks for the history videos. Each one tells the same ten
seconds of Waterloo so they can be judged side by side:

- **0–5 s:** over Napoleon's shoulder as the French columns go in, with the title and a question hook
- **5–10 s:** the map, with both lines and then the Prussians arriving

```
src/histstyle/
  shared.tsx      fonts, timing helpers, Napoleon + soldier figures, the Waterloo map data, arrows, grain
  Engraving.tsx   A · Ink & Parchment
  Paper.tsx       B · Paper Diorama
  Cinematic.tsx   C · Cinematic Dusk
  Poster.tsx      D · Two-Ink Print
  Compare.tsx     all four in a 2×2 grid
```

| | look | what makes it feel hand-made |
|---|---|---|
| **A** | a hand-tinted 1830s steel engraving, set in a book plate | ruled skies, crosshatch, contour-stroke ground; the ink "boils" on threes; watercolour wash laid slightly off the lines |
| **B** | a cut-paper tabletop set, shot stop-motion | every sheet has a hand-cut edge, paper fibre and a depth shadow; on twos with a hair of jitter; out-of-focus grass in front of the lens |
| **C** | modern documentary motion design, lit like film | aerial-perspective silhouettes against a low sun, rim light, smooth eased motion, a 3D-tilted map with glowing units |
| **D** | a two-colour screen-printed poster | black and red only, halftone shading, red plate out of register, ink dropout, hard cuts with a red sweep |

```bash
npx remotion render HistStyle-Compare out/histstyle-compare.mp4
npx remotion render HistStyle-A-Engraving out/histstyle-a.mp4   # B-Paper, C-Cinematic, D-Poster
```

Fonts are all SIL OFL and live in `public/fonts`: IM Fell English, Playfair
Display, Oswald and Bebas Neue (added for these), plus Montserrat and Anton.

Once a look is picked, it becomes its own kit. Its scene pieces move out of
the test file into reusable components, the way `src/geo/` is laid out.

## E · Pebble People (the bean-format Short)

`bean/` is the house take on the Ricks Clips format: simple cartoon people
acting inside rich, lit sets, a cut every one to two seconds, a slow push on
every shot, and the narration one word at a time in fat white type with
key words in yellow.

The cast is our own, so it isn't a copy. Their people have blank white
circle heads; ours have pebble heads in real skin tones with blush, big
eyebrows that do the acting, a nose, glinting eyes, and pawn-shaped bodies
in period uniform. Hats and coats tell you who's who. `bean/Bean.tsx` is the
rig: `expr` (neutral, worried, sad, angry, determined, shocked, smug),
`look`, `talk` (lip flap), auto-blink, `shiver`, `sweat`, `drip`, a `rim`
light from the set, hand targets, and props (`PocketWatch`, `Telescope`).
`OUTFITS` holds Napoleon, French line, gunner, officer, Prussian, Blücher,
and a rain cloak.

`bean/RainShort.tsx` is the test: "What if one rainstorm cost Napoleon an
empire?" It runs 20 s across six sets (tent at night, storm camp, guns in
the mud, the watch, the Prussians over the hill, the sunset). It's silent:
captions are timed evenly per line until a real voice track sets the beats.

```bash
npx remotion render HistStyle-E-Bean-Rain out/histstyle-e.mp4
```

## F · Storybook explainer (16:9 long-form)

`squire/` is the long-form "imagine you're a…" explainer format: 16:9,
second-person narration with no captions, flat vector sets (soft sky,
peach clouds, layered outlined hills and trees, a village, a road), the
pebble-people cast acting each line, and recurring set pieces: a pointer
label, a binocular POV, a spotlight stage, a year counter, a blueprint,
a crosshair. The rig gained `kepi`, `pickelhaube`, `fr1914`, `de1914`,
`redcoat`, `Musket` and `Binoculars` for it.

The test is an original 31 s script: why French soldiers went to war in
1914 in red trousers. The narration is Kokoro, voice `am_liam`, from
`scripts-vo/histstyle-trousers.json`, and every shot is keyed to
`squire/timing.json`.

```bash
python3 scripts/make-vo.py histstyle-trousers   # needs .tts/ (Kokoro model)
npx remotion render HistStyle-F-Storybook out/histstyle-f.mp4
```

## Ten looks for the storybook explainer

`looks/Looks.tsx` draws the same scene (the red-trousers soldier and his
column) ten ways, so the series can pick one: Storybook, Bold Comic,
Watercolour, Ink & Sepia, Chalkboard, Dusk, Soft Pastel, Riso Print, Clay,
and Pixel Art. A `Look` sets the palette, the outline (via the rig's
`InkCtx`, so the cast is restyled too), the face ink, the frame rate (on
1s, 2s or 3s), an SVG treatment over the whole picture, and a texture.

```bash
npx remotion render HistStyle-Looks-Reel out/histstyle-10-looks.mp4   # 3 s per look
```

## F v2 · the explainer rebuilt to production finish

`squire/TrouserV2.tsx` is the red-trousers test rebuilt after studying the
reference at full resolution. It uses the same original script and
narration, on the reference's general shot grammar:

- **Rig v2** (`squire/Figure.tsx`): a big round head on a small body,
  thick near-black outlines, every part shaded with a soft gradient lit from
  the upper left, two-segment arms posed by name (`down`, `rifle`, `wave`,
  `aim`, `forward`, `shrug`, `hips`), mitten hands with thumbs, walk with
  alternating feet, and proper kit (belts, pouches, packs, crossbelts,
  lapels, buttons). Kits: `fr1914`, `de1914`, `redcoat`, `bluecoat`.
  The cast is our own design (skin tones, blush, eyebrows, period
  uniforms), not a copy of the reference's characters.
- **Sets v2** (`squire/sets.tsx`): layered countryside (three-tone clouds,
  far ridge with a village and spire, patchwork wheat and pasture with
  hedges, a poppy meadow) with a separate blur per depth band, so close
  shots keep the actor sharp and the world soft.
- **Framing:** actors big in frame (waist-up and two-shots), slow camera
  moves, and cutaways (stage spotlight, year banner, blueprint).

```bash
npx remotion render HistStyle-F2-Storybook out/histstyle-f2.mp4
```
