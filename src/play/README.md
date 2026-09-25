# The play-along Shorts

Interactive vertical Shorts in the look of the two reference clips the
channel owner supplied. A viewer does something along with the video
(claps, stomps, picks a champion) and gets a payoff at the end. The format,
look and pacing match the references. The characters, the song and every
drawing are ours.

| composition | what | length |
|---|---|---|
| `Play-Beat` | **"play along with the beat!"** A concert stage. Notes fall onto a stomp button and a clap button, and the viewer plays along while Pebblo sings. Ends on "BRAVO!!" | 28 s |
| `Play-Race` | **"Choose your champion!"** Four ropes on a paper wall. 3-2-1-GO! and the cast climbs, with gags along the way. Last one standing on the ledge gets the crown and "WINNER!" | 28 s |
| `Play-Sheet` | model sheet: the four characters in five poses, plus the type | still |

```bash
npm run play:audio        # builds both soundtracks into public/audio (needed on a fresh clone)
npm run play:beat         # → out/play-beat.mp4
npm run play:race         # → out/play-race.mp4
npm run play:beat:thumb   # → out/thumbnail-play-beat.jpg (1080×1920)
npm run play:race:thumb   # → out/thumbnail-play-race.jpg
```

`public/audio` is gitignored, so run `play:audio` before the first render
or the render fails on a missing file. Pass `--props='{"audio":null}'` to
render silent.

## What the references do (measured)

Both references are 720×1280, 30 fps, about 27.6 s. Their grammar:

- **One instruction at the top, in a handwritten marker face.** It reads
  "play along with the beat!" or "Choose your champion!". There is no other
  text until the payoff.
- **A red hand-drawn countdown under it** (4-3-2-1, or 3-2-1-GO!), about
  half a second per number. The action starts on the last count.
- **Pastel chibi animals.** Each has one flat fill, a thick outline in a
  darker shade of the same colour, a lighter belly, dot eyes and blush.
  There is no black anywhere except the mic stand.
- **The whole Short is one continuous scene.** There are no cuts. The beat
  Short holds a locked camera. The race Short follows the leader up the
  ropes until the sky and the ledge arrive.
- **A single payoff word at the end** ("BRAVO!! 👏", "WINNER!") over a
  character celebrating.
- **Beat Short:** coloured lane beams show where to look during the
  count-in, then clear. Translucent notes fall onto two big white round
  buttons, which go grey with a spiky burst when hit. The singer walks on
  after the count and stands behind the mic. Two friends bop by the buttons.
- **Race Short:** the climbers are drawn **from behind**. Around the middle
  there are gags: a slide, a leap, a slip. Near the top an eagle snatches
  the leader, which is the twist. Only one character is left, and it gets
  a crown.

## The cast

`chars.tsx`. Four characters, all drawn the same way, all posed with the
same `Pose` object (eyes, mouth, arms or absolute hands, squash, tilt, and
`back` for the from-behind view).

| | look |
|---|---|
| **Pebblo** | the channel's pebble: warm grey stone, moss tuft, chipped corner, freckles |
| **Capy** | a capybara: tan loaf, round ears, flat unbothered mouth |
| **Bun** | a lilac bunny: long ears with pink insides, cotton tail from behind |
| **Mint** | a mint-green frog: wide grin, two eye bumps, spots on the back |

## Timing lives in JSON

- `beat-pattern.json` holds the tempo (16 frames a beat, 112.5 BPM), the
  bars of stomps (`L`) and claps (`R`), the count-in and the BRAVO frame.
- `race-schedule.json` holds the count-in, GO, and every story beat (slide,
  leap, slips, landings, eagle, fall-offs, win).

`scripts/build-play-audio.py` reads the same two files, so every kick lands
on a stomp note and every clap on a clap note. Every slide whistle and boing
lands on the frame it belongs to. Change the pattern, rebuild the audio and
re-render. Nothing else needs touching.

## Audio

The music and effects are synthesised in `scripts/build-play-audio.py`, so
there is nothing to license. The kick, clap, hats, bass, plucked chords,
slide whistle, boing, eagle screech, snore, fanfare and applause are all
generated there. The beat reference has a sung vocal. This one is
instrumental on purpose. A recorded vocal can go in the same drop-in slot,
`public/audio/play-beat-mix.mp3`, as long as it keeps the tempo.

## Making the next one

The engine is the cast plus a schedule. New episodes in the same formats:

- **Race variants:** `winner` is a prop, so four endings come out of one
  file. New obstacles belong in the `events` table.
- **Beat variants:** new `bars` give a new song, and a different stage
  gives a new episode. The pattern is `L`, `R` or `-` per beat.
- **New interactive formats in this look:** "tap when it turns green",
  "pick a door", "which one is different?". Use the same `Headline` /
  `Countdown` / `Payoff` text kit and the same cast.
