# 3 Animals That Use Tools Like Us

> **Channel: not decided yet.** Paste the channel's subscribe block above
> the hashtags before you upload.

## Title

Smarter Than Us?! 🧠

Alternates:

- Animals That Use Tools Like Humans
- This Crow Made Her Own Tool 🪝 #shorts

## Description

In this video we reveal three animals that use tools like us. #animal #facts #viral #interestingfacts #shorts

The veined octopus collects discarded coconut shell halves, carries them stacked under its body while "stilt-walking" on its arm tips, and assembles them into a shelter when it needs to hide. That carrying of an object for later use is why researchers counted it as tool use. At Oxford in 2002, a New Caledonian crow named Betty was given a straight piece of wire and bent it into a hook to lift a little bucket of food out of a tube. In 1960 at Gombe in Tanzania, Jane Goodall watched chimpanzees strip leaves off twigs and use them to fish termites out of mounds. Until then, making tools was thought to be something only humans did.

Sources: Finn, Tregenza & Norman 2009, *Current Biology*: "Defensive tool use in a coconut-carrying octopus". Weir, Chappell & Kacelnik 2002, *Science*: "Shaping of hooks in New Caledonian crows". Goodall 1964, *Nature*: "Tool-using and aimed throwing in a community of free-living chimpanzees".

Images: AI-generated for the channel.

#shorts #animals #animalfacts #octopus #crow #chimpanzee #janegoodall #smartanimals #didyouknow #facts #wildlife #nature

## Tags

animals that use tools, tool using animals, coconut octopus, veined octopus, betty the crow, new caledonian crow, crow bends wire, chimpanzee termite fishing, jane goodall, smart animals, animal intelligence, animal facts, did you know, wildlife, nature, shorts

(261 characters, under YouTube's 500 cap)

## Thumbnail

`out/pins/thumbnail-tools.jpg`, 1080×1920. Build it with `npm run pins:tools:thumb`.

## Upload settings

| field | value |
|---|---|
| Aspect | 9:16, 1080×1920, 38.6 s, 30 fps (a Short) |
| Category | Pets & Animals |
| Audience | not made for kids, general-audience animal facts |
| Chapters | none, because Shorts don't show them |
| `#shorts` | in the description |

## Credits (images)

Every image is AI-generated for the channel, so no photo credit is owed:

- animals, props and backgrounds: FLUX.1 [schnell] on Runware, from the
  prompts in `src/pins/tools/images.json` (7 images, $0.0042 of the $0.03 cap; the crow, the chimp and the shark are reused from the faces, drunk and forever Shorts), built with
  `scripts/gen-images.py`
- the man's and scientist's bodies: TubeAI's image generator (from the talk Short), comic heads drawn in code

## Audio

Narration: the channel's ElevenLabs read, `.vo-takes/tools-1.mp3, cut from the week1 read (1:12.4–1:50.4, first take)`
(gitignored), pauses trimmed to 0.3 s, with a 1.2 s hold after the hook for
the payoff gag. Music: the channel's track, about 18 dB under the voice. SFX:
the channel's files under `.sfx/pins/` (ding at 0:00, the riser peaking as "us." ends, party blower and "huh?" for the graduation gag, bubbles, wings, "dun dun dun" for the shark, tiptoe, ka-ching, counter, wrong buzzer, pop, whoosh). Rebuild:

    python3 scripts/build-pins-audio.py tools --vo .vo-takes/tools-1.mp3
    npm run pins:tools
