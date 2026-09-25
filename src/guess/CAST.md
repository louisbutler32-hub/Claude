# The Peekaboo Pebblo cast

The guess format's own characters. The first episodes (Veggies, Animals,
Numbers, Wild, Vehicles, Dinosaurs, Sea, Colours) were built to match the
reference "Chomp Chomp Fruit" edit and borrowed its crocodile and four
generic cheering animals. From the Fruit episode on, the line has a cast of
its own — same look, same beat sheet, same concept, but characters a viewer
can learn to recognise and a series name that is ours.

Everything is in [`cast.tsx`](cast.tsx). Render the model sheet with
`npm run cast:sheet` → `out/cast-sheet.png`.

## Who they are

| character | what | job in every episode |
|---|---|---|
| **Pebblo** | the channel's pebble — warm grey stone, moss tuft, big oval eyes with whites, freckles, mitten hands | **The host.** Waves on the title card. Peeks up from behind the left bush while the shadow rises, looks up at it and *thinks* along with the viewer, throws both arms up on the reveal, ducks back down. Stands in the middle of the cheer line at the board. |
| **Munch** | a round, fuzzy teal monster — two yellow horns, one huge mouth of square teeth, three-toed feet | **The chomper.** Walks in from the right after the "where it grows" beat and eats the thing. Any subject that used the crocodile uses Munch instead (`cast.Chomper`). The narrator says "Uh oh! Here comes Munch." |
| **Pip** | a yellow chick in an acorn cap | cheer squad, far left |
| **Bloom** | a pink tulip who stands on her two leaves | cheer squad |
| **Tock** | a small green turtle, yellow-spotted shell | cheer squad |
| **Wisp** | a little white cloud with a face, hovers and drips three drops | cheer squad, far right, floats higher than the others |

Pebblo already exists for the Minecraft Shorts (`src/minecraft/pebblo.tsx`,
thick black lines, stick limbs). This is the same character redrawn for
the picture-book look: coloured outlines, chalky fills, blush, no black.
Keep the two consistent on the things a child notices — the moss tuft, the
chipped corner, the big eyes with whites, the freckles.

## The rules

- **Two-dot faces, coloured outlines, no black lines.** Same as every fruit
  and vegetable in the format. Pebblo's eyes are the one exception (whites
  and a highlight) — that is his signature, don't give it to anyone else.
- **Munch is never scary.** Round, soft edges, blush, a big smile when the
  mouth is shut. He eats the thing and toddles off; nobody is frightened.
- **Pebblo never speaks on screen** — the narration is Ana (kid) and Emma
  (narrator). Pebblo reacts. Body language only.
- **The cheer line is always the same five, in the same order**, left to
  right: Pip, Bloom, Pebblo, Tock, Wisp. Consistency is the point.
- **The title card says "Peekaboo Pebblo"** above the subject word. The
  opener line the kid voice says is "Peekaboo! <Subject>!"

## How an episode opts in

Set `cast: PEBBLO_CAST` on the `GuessSubject`. That switches the title-card
mascot and line, the host peek, and the cheer squad. The subject's own
`MidBeat` mounts `PEBBLO_CAST.Chomper` if it wants something eaten — see
`src/fruit/subject.tsx` for the reference implementation.

In `scripts/build-audio.py`, give the subject `opener`, `chomper` and
`peeks` fields (see the `"fruit"` entry) so the voice track says the right
names.

Episodes **without** `cast` keep the crocodile and the original animals, so
the eight already published still render exactly as uploaded.

## What to build next on this cast

Same engine, new twelve, Munch eats them: **Snacks & Treats**, **Bugs**,
**Farm** (the animal mid-beat, Pebblo does the noise gesture), **Shapes**,
**Things That Go** part 2. Each one is a `src/<subject>/` folder like
`src/fruit/`: `<subject>.tsx` (the twelve, drawn once), `habitats.tsx`,
`subject.tsx`, `ArtSheet.tsx`, `Thumbnail.tsx`, `<Subject>Video.tsx`,
`upload.md`, plus a `<SUBJECT>_ROUNDS` list in the audio script in the
**same order** as `rounds`.
