# 3 Animals That Went to Space Before Us

> **Channel: not decided yet.** Paste the channel's subscribe block above
> the hashtags before you upload.

## Title

They Sent WHAT to Space?! 😱

Alternates:

- Animals That Went to Space Before Humans
- This Chimp Beat Humans to Space 🚀 #shorts

## Description

In this video we reveal three animals that went to space before us. #animal #facts #viral #interestingfacts #shorts

On 20 February 1947, fruit flies were launched on a V-2 rocket from White Sands in New Mexico. The capsule reached about 109 km (68 miles), past the 100 km line generally counted as the edge of space, and came back down by parachute with the flies alive. They were the first animals in space. On 3 November 1957, Laika, a stray dog from the streets of Moscow, rode Sputnik 2 and became the first animal to orbit the Earth. There was no way to bring her back, and she died in orbit. On 31 January 1961, Ham the chimpanzee flew on Mercury-Redstone 2 and pulled levers in response to flashing lights, which showed a person could work in space. He splashed down in the Atlantic, was recovered safely, and was given an apple. About three months later, on 5 May 1961, Alan Shepard became the first American in space.

Sources: NASA History Office: "A Brief History of Animals in Space". NASA: Mercury-Redstone 2 mission (Ham). Malashenkov 2002, World Space Congress, on Laika's flight.

Images: AI-generated for the channel.

#shorts #animals #animalfacts #space #laika #hamthechimp #fruitflies #spacehistory #didyouknow #facts #history

## Tags

animals in space, first animals in space, fruit flies space, laika, laika the dog, sputnik 2, ham the chimp, first chimp in space, space history, space race, nasa history, animal facts, did you know, history facts, shorts

(221 characters, under YouTube's 500 cap)

## Thumbnail

`out/pins/thumbnail-space.jpg`, 1080×1920. Build it with `npm run pins:space:thumb`.

## Upload settings

| field | value |
|---|---|
| Aspect | 9:16, 1080×1920, 38.6 s, 30 fps (a Short) |
| Category | Pets & Animals |
| Audience | not made for kids, general-audience animal and space history |
| Chapters | none, because Shorts don't show them |
| `#shorts` | in the description |

## Credits (images)

Every image is AI-generated for the channel, so no photo credit is owed:

- animals, props and backgrounds: FLUX.1 [schnell] on Runware, from the
  prompts in `src/pins/space/images.json` (13 images (16 generations with two re-rolls), $0.0096 of the $0.03 cap), built with
  `scripts/gen-images.py`
- the man's and scientist's bodies: TubeAI's image generator (from the talk Short), comic heads drawn in code; the astronaut is a FLUX image with a closed gold visor (no face)

**Note:** Laika's fate is told plainly and her shot has no gags.

## Audio

Narration: the channel's ElevenLabs read, `.vo-takes/space-1.mp3, cut from the week1 read (1:50.4–2:28.0)`
(gitignored), pauses trimmed to 0.3 s, with a 1.2 s hold after the hook for
the payoff gag. Music: the channel's track, about 18 dB under the voice. SFX:
the channel's files under `.sfx/pins/` (ding at 0:00, the riser peaking as "us." ends, party blower and "huh?" for the "FIRST!" gag, beeps, splash, monkey, ka-ching, ticking clock, counter, pop, whoosh). Rebuild:

    python3 scripts/build-pins-audio.py space --vo .vo-takes/space-1.mp3
    npm run pins:space
