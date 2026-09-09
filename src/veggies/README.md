# Chomp Chomp VEGGIES

A kids' "guess the vegetable from its shadow" video — the vegetable version
of the *Chomp Chomp FRUIT* edit, built to the same beat sheet, in the same
soft hand-drawn picture-book style.

Composition id **`VeggieVideo`** · 1920×1080 · 30 fps · **10:27** (18,840 frames).

```bash
npm start                 # Remotion Studio, live preview
npm run veggies           # renders out/chomp-chomp-veggies.mp4
npm run veggies:still     # contact sheet of all twelve vegetables
```

## The format

A 4-second title card, then **twelve rounds** of 52 seconds each. Every
round runs the same beats (frame numbers are relative to the round, see
`BEAT` in `rounds.ts`):

| frames | seconds | beat |
|---|---|---|
| 0–150 | 0–5 | quiet meadow; a bee / kite / snail / dinosaur drifts across |
| 130–320 | 4–11 | a tiny version of the vegetable hops along the bush line and out |
| 350–518 | 12–17 | a black silhouette rises out of the bushes; **"What is that?"** types on |
| 518–546 | 17–18 | white flash + pop lines |
| 546–716 | 18–24 | it turns into the full-colour kawaii vegetable; its **name** pops in |
| 716–806 | 24–27 | it shrinks and settles onto the grass |
| 800–1010 | 27–34 | cut to **where it grows** — the plant row — and it rolls off right |
| 996–1150 | 33–38 | the **crocodile** walks in and chomps it |
| 1212–1478 | 40–49 | the **board** rises, twelve silhouettes pop in, the new vegetable flies into its slot, sparkles + confetti + the four animals cheer |
| 1478–1560 | 49–52 | the board drops away, back to the meadow |

The board doubles as the progress bar: one more slot turns from black to
full colour every round, so by the end all twelve are filled in.

## The twelve

Reveal order (`ROUNDS` in `rounds.ts`) — it jumps around the board on
purpose, so the grid fills in scattered rather than left to right:

> carrot → corn → tomato → pumpkin → bell pepper → cucumber → potato →
> onion → eggplant → peas → broccoli → mushroom

Board layout (`BOARD_ORDER` in `board.tsx`), 4 across × 3 down:

| | | | |
|---|---|---|---|
| carrot | potato | eggplant | tomato |
| peas | pumpkin | pepper | broccoli |
| onion | mushroom | corn | cucumber |

## How the silhouette trick works

Each vegetable is drawn **once**, in a −100..100 box, as a component that
takes a `sil` prop (`veggies.tsx`). In silhouette mode the whole group gets
`filter: brightness(0) saturate(0)` and the face, highlights and detail
lines are dropped. So the shadow is guaranteed to be the exact outline of
the thing it hides — the reveal always lines up, and adding a vegetable
means drawing one shape, not two.

## Files

```
src/veggies/
  VeggieVideo.tsx   the composition — one <Sequence> per round, the beat wiring
  rounds.ts         the twelve rounds, the BEAT sheet, hero sizes, VO cues
  veggies.tsx       the twelve vegetables (colour + silhouette in one component)
  scene.tsx         sky, clouds, kawaii sun, crayon bushes, grass, tulips, tree
  habitats.tsx      the "where it grows" plant row for each vegetable
  critters.tsx      the crocodile, the four cheering animals, the nine drifters
  board.tsx         the collection board, slot positions, the fly-into-slot move
  title.tsx         the "Chomp Chomp VEGGIES" opening card
  ui.tsx            the wobbly white on-screen type
  fx.tsx            confetti, sparkles, reveal flash, pop lines
  fonts.ts          loads Fredoka + Baloo 2 from public/fonts (no network at render)
  ArtSheet.tsx      review composition: all twelve, colour beside silhouette
```

## Audio

The render is **silent** — every visual beat is in place, but no music,
voiceover or sound effects are baked in. To finish it:

- `ROUNDS[n].vo` carries a one-line voiceover cue per round
  ("What is that? … A carrot! Crunchy orange carrot.").
- The beats to hit with sound effects are the ones in the table above: the
  rise, the pop at frame 518, the chomp at 1104, the board rise at 1212,
  the slot landing at 1382 and the confetti at 1386.
- Add the tracks in an editor, or drop an `<Audio src={staticFile(...)} />`
  into `VeggieVideo.tsx` once you have them.

## Fonts

`public/fonts/` holds Fredoka (the rounded label face) and Baloo 2 (the
title face), both SIL Open Font License, loaded from disk so a render never
has to reach the network.
