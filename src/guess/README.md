# The guess format

Three episodes share one engine. A shape rises out of the bushes, "What is
that?", it turns into the real thing, and one more slot on a collection
board fills in — twelve times, then the finished board.

| composition | subject | what the middle of each round does |
|---|---|---|
| `VeggieVideo` | 12 vegetables | visits the plant it grew on; the crocodile eats it |
| `AnimalVideo` | 12 animals | goes where the animal lives; the animal makes its noise |
| `NumberVideo` | 1-12 | counts that many things onto the screen, one at a time |

Each is 10:28 — a 4-second title card and twelve 52-second rounds.

## How a subject plugs in

`GuessVideo` owns every beat the episodes share (`beats.ts` has the frame
numbers). A subject supplies its twelve things and takes over frames
800-1240 of each round, which is exactly where the episodes differ:

```ts
type GuessSubject = {
  titleWord, titleLetters   // the title card
  art, names, Defs          // the twelve, drawn once each
  boardOrder, slotScale     // where they sit on the board
  heroScale                 // how big they play in the reveal
  rounds                    // the reveal order
  MidBeat                   // frames 800-1240 belong to the subject
  ringItems                 // produce ringing the title card
}
```

Every item is drawn **once** and renders in colour or as its own flat-black
shadow (`art.tsx`'s `Body` wrapper). That is what guarantees the silhouette
is the exact outline of the thing it hides, and it means adding a
thirteenth item is one drawing, not two.

## Compilation

```bash
npm run animals && npm run numbers          # render what you're missing
python3 scripts/make-compilation.py \
    --fruit path/to/your-fruit-video.mp4
```

Joins the episodes into `out/compilation.mp4` with a chapter mark per
episode. Everything is normalised to one codec, size and frame rate first —
the episodes render at 1080p but the original fruit video is 720p, and
concatenating mismatched streams gives you a file that plays wrong on some
players. Durations are read back from each normalised part rather than
assumed, so the chapter offsets stay right if an episode's length changes.
`--fruit` is optional and missing episodes are skipped with a note, so the
script is usable before everything exists.

All four comes to **41:45** and about **110 MB**.

## Audio

```bash
npm run veggies:audio      # or animals:audio / numbers:audio
```

`scripts/build-audio.py <subject>` lays voice, sound effects and a music
bed onto the same frame grid the animation uses. Two readers: **Ana**
(child) plays the guessing game, **Emma** (narrator) explains the screen
and asks the viewer the questions.

The build reports any line that runs into the next and must print
`no overlaps` before the mix is worth using — two readers on one timeline
is where collisions happen. The one exception is the number episode, where
the count words deliberately run a few frames into each other, which is how
counting actually sounds.

Generated audio is gitignored: `edge-tts` is not licensed for commercial
use, so it is for timing the edit, not for shipping. Each episode's track
is a drop-in slot at `public/audio/<subject>-mix.mp3`.
