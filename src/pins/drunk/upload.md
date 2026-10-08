# 3 Animals That Actually Get Drunk

> **Channel: not decided yet.** Paste the channel's subscribe block above
> the hashtags before you upload.

## Title

Animals Get DRUNK?! 🥴

Alternates:

- Animals That Actually Get Drunk
- This Moose Got Drunk and Stuck in a Tree 🍎 #shorts

## Description

In this video we reveal three animals that actually get drunk. #animal #facts #viral #interestingfacts #shorts

Chimpanzees at Bossou in Guinea raid the containers farmers hang on raffia palms to collect sap, which ferments into palm wine. Researchers filmed them over 17 years using crumpled leaves as sponges to drink it, and some showed signs of being drunk, including resting soon after. In 2011 in Gothenburg, Sweden, a moose that had been eating fermented apples was found stuck in an apple tree, and rescuers had to cut branches to free it. Bohemian waxwings gorge on fermenting berries and can fly into windows; in 2014 wildlife officers in Whitehorse, Yukon, Canada, kept the drunk birds in small cages until they sobered up.

Sources: Hockings et al. 2015, *Royal Society Open Science*: "Tools to tipple: ethanol ingestion by wild chimpanzees using leaf-sponges". Moose: news reports from Gothenburg, Sweden, September 2011. Waxwings: Yukon Department of Environment, as reported by CBC News, 2014.

Images: AI-generated for the channel.

#shorts #animals #animalfacts #drunkanimals #chimpanzee #moose #waxwing #didyouknow #facts #wildlife #nature

## Tags

drunk animals, animals that get drunk, drunk moose, moose stuck in tree, chimpanzees palm wine, drunk chimps, drunk birds, waxwings drunk, bird drunk tank, fermented fruit animals, animal facts, weird animal facts, funny animal facts, did you know, wildlife, nature, shorts

(273 characters, under YouTube's 500 cap)

## Thumbnail

`out/pins/thumbnail-drunk.jpg`, 1080×1920. Build it with `npm run pins:drunk:thumb`.

## Upload settings

| field | value |
|---|---|
| Aspect | 9:16, 1080×1920, 37.3 s, 30 fps (a Short) |
| Category | Pets & Animals |
| Audience | not made for kids (alcohol theme), general-audience animal facts |
| Chapters | none, because Shorts don't show them |
| `#shorts` | in the description |

## Credits (images)

Every image is AI-generated for the channel, so no photo credit is owed:

- animals, props and backgrounds: FLUX.1 [schnell] on Runware, from the
  prompts in `src/pins/drunk/images.json` (14 images, $0.0090 of the $0.03 cap), built with
  `scripts/gen-images.py`
- the rescuer's and keeper's bodies: TubeAI's image generator (from the talk Short), comic heads drawn in code

## Audio

Narration: the channel's ElevenLabs read, `.vo-takes/drunk-1.mp3, cut from the week1 read (0:35.3–1:12.4)`
(gitignored), pauses trimmed to 0.3 s, with a 1.2 s hold after the hook for
the payoff gag. Music: the channel's track, about 18 dB under the voice. SFX:
the channel's files under `.sfx/pins/` (ding at 0:00, the riser peaking as "drunk." ends, party blower, bubbles, bird chirp, tiptoe, wrong buzzer, pop, whoosh). Rebuild:

    python3 scripts/build-pins-audio.py drunk --vo .vo-takes/drunk-1.mp3
    npm run pins:drunk
