# The play-along Shorts

These ship on **Boppity Pals**. The channel package is in
`docs/channel-boppity-pals.md`, and `npm run play:brand` renders the art.

Interactive vertical Shorts rebuilt frame for frame on the two reference
clips the channel owner supplied. The look, timing, story beats and
soundtrack follow the references. The characters and every drawing are ours.

| composition | what | length |
|---|---|---|
| `Play-Beat` | **"play along with the beat!"** A concert stage with notes falling onto a stomp button and a clap button. Biscuit the puppy sings at the mic, Bruno the bear stomps, Mimi the cat claps. Ends on "BRAVO!!" | 831 frames (27.7 s) |
| `Play-Race` | **"Choose your champion!"** Four ropes, 3-2-1-GO! Poppy knocks Biscuit off, Mimi tackles Poppy, Biscuit hops ropes, Mimi shouts Poppy off, an eagle takes Bruno, and Mimi alone reaches the top: "WINNER!" and a crown | 826 frames (27.5 s) |
| `Play-Sheet` | model sheet of the cast in every pose | still |

## Making them

```bash
# once, on a fresh clone: pull the soundtrack out of the two reference clips
npm run play:ref-audio -- path/to/beat-reference.mp4 path/to/race-reference.mp4

npm run play:beat          # → out/play-beat.mp4 (renders, then puts the reference audio on)
npm run play:race          # → out/play-race.mp4
npm run play:beat:thumb    # → out/thumbnail-play-beat.jpg (1080×1920)
npm run play:race:thumb    # → out/thumbnail-play-race.jpg
npm run play:sheet         # → out/play-sheet.png
```

`public/audio` is gitignored. The reference audio is not ours to put in
the repo, and it has to be extracted locally before the first render.

### Why the audio is muxed in after the render

Remotion's AAC encoder writes about 43 ms of encoder priming at the start of
the track without marking it skippable, so embedded audio plays a frame
and a third late. On a rhythm game that shows. `scripts/mux-play-audio.py`
copies the reference clip's own AAC stream onto the render, untouched, with
its priming markers intact. Measured on the final files:

- The audio matches the reference with a correlation of 1.000 at 0 ms
  offset.
- All 60 button presses (40 stomps, 20 claps) detected in the render land
  on the same frame as in the reference.

## How it was matched to the references

Both references are 720×1280 at 30 fps, about 27.6 s long.

- **Beat clip:** every stomp and clap press was read off the reference
  frame by frame, from the moment each button turns grey. There are 40
  stomps and 20 claps in a stomp-stomp-clap pattern, stored in
  `beat-pattern.json`. The count-in (4-3-2-1), the headline, the beams
  clearing, the singer's walk-on and the BRAVO frame all come from the
  same measurement.
- **Race clip:** the story was timed at 10 fps and the countdown
  frame-exact. `race-schedule.json` holds those times: the knock-off at
  5.4 s, the tackle at 8 s, the rope hop at 13.2 s, the shout at 15.5 s,
  the eagle at 20.85 s and WINNER at 25.6 s. The camera roll matches too,
  with the sky arriving at 16.7 s and the ledge settling at half height.

The grammar both references share:

- One handwritten instruction at the top, with a red hand-drawn countdown
  under it.
- Pastel characters, one continuous scene, no cuts.
- One payoff word at the end.

## The cast

`chars.tsx`. All four are built from the same parts so they read as one
set:

- a mochi head and a pear body with radial-gradient volume
- outlines in a darker shade of each character's colour, never black
- glossy two-highlight eyes, gradient blush and a head gloss
- a lighter belly and muzzle
- paws, feet and a species tail

| | look | role |
|---|---|---|
| **Biscuit** | cream puppy, caramel floppy ears and eye patch, red collar with a gold tag | singer; knocked off, climbs back, lets go at the eagle |
| **Poppy** | pink bunny, long ears, a little yellow flower, cotton tail | the troublemaker in the race |
| **Bruno** | honey-brown bear, round ears, tan muzzle | stomps on stage; the steady climber the eagle takes |
| **Mimi** | little orange tabby, forehead stripes, cream paws, striped tail | claps on stage; the fierce winner of the race |

Every character takes one `Pose`:

- eyes: open, happy, closed, shock, angry, dizzy, sparkle
- mouth: smile, open, o, flat, grin, shout, tongue
- arms, or absolute hand positions
- squash, tilt, tail wag and stomp
- `back` for the climbing view
- `fx` for an effect by the head: anger mark, shock lines, sweat, hearts or zzz

## Licence-free fallback

`scripts/build-play-audio.py` synthesises a soundtrack for each Short from
the same JSON, so every kick and clap still lands on its note. Use it if
the reference audio can't be used. Run `npm run play:audio`, then render
with `--props='{"audio":"audio/play-beat-mix.mp3"}'` (or
`play-race-mix.mp3`) and skip the mux step.
