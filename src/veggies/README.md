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

`public/audio/veggies-mix.mp3` is a **drop-in slot**: whatever 10:28 track
sits there is what the video plays. Replace it with your own recording and
re-render — nothing else needs to change.

To build one:

```bash
pip install numpy edge-tts     # ffmpeg also needs to be on PATH
npm run veggies:audio          # writes public/audio/veggies-mix.mp3
```

`scripts/build-veggie-audio.py` lays three layers onto the same frame grid
the animation uses, so nothing has to be nudged by hand in an editor:

| layer | what it is |
|---|---|
| voice | 109 lines across two readers — see the table below |
| sfx | synthesised in the script, so there is nothing to license: a slide-whistle rise, the reveal bloop, hop bounces, the crocodile's two crunches, the board whoosh, twelve slot blips, a twinkle on the slot landing, a bell arpeggio on the celebration |
| music | a soft four-chord marimba bed, ducked ~6 dB under anything spoken |

The generated audio is **gitignored on purpose**. `edge-tts` reads from the
endpoint behind Edge's read-aloud feature, which is not licensed for
commercial use — fine for auditioning the timing, not for a monetised
upload. The same voices are sold properly through Azure Speech (the whole
script is ~700 characters, inside their free tier), or record the lines
yourself and drop the file in the same slot.

### The two readers

**Ana** (`en-US-AnaNeural`, −5%) is the child playing along, and **Emma**
(`en-US-EmmaNeural`, −12%) is the narrator who explains the screen and puts
the questions to the viewer. They alternate across each round:

| frame | who | what |
|---|---|---|
| 150 | Emma | "Something is hiding in the bushes" — sets the guess up |
| 382 | Ana | "What is that?" |
| 546 | Ana | "It's a carrot! Carrot." |
| 668 | Ana | "A crunchy orange carrot." |
| 806 | Emma | "Now, where does the carrot grow?" |
| 890 | Emma | how it actually grows — the teaching line |
| 1046 | Emma | "Uh oh! Here comes the crocodile." |
| 1225 | Emma | "Can you find where the carrot goes?" — the board as a puzzle |
| 1418 | Emma | praise plus the running count: one, two, three… twelve |

Emma sits ~1 dB under Ana so the reveal stays the loudest moment of the
round. The script checks every line against the next and reports any that
overrun, since two readers on one timeline is where collisions happen —
it must print `no overlaps` before the mix is worth using.

Edit `ROUNDS`, `QUESTIONS` and `PEEKS` at the top of the script to change
the words; the fourth field of each `ROUNDS` entry is Emma's growing fact.

## Fonts

`public/fonts/` holds Fredoka (the rounded label face) and Baloo 2 (the
title face), both SIL Open Font License, loaded from disk so a render never
has to reach the network.
