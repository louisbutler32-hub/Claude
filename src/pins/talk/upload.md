# 3 Animals That Can Talk to Humans

> **Channel: not decided yet.** Paste the channel's subscribe block above
> the hashtags before you upload.

## Title

It Can TALK?! 😳

Alternates:

- Animals That Can Actually Talk to Humans
- The Whale That Told a Diver to Get Out 🐋 #shorts

## Description

Three animals that can actually talk to humans. Koshik, an Asian elephant at a zoo in South Korea, spent years with humans as his only company and learned to imitate five Korean words by putting his trunk in his mouth: annyeong (hello), anja (sit down), aniya (no), nuo (lie down) and choah (good). Native Korean speakers could write down what he was saying. The greater honeyguide answers the honey hunters of Mozambique when they call "brrr-hm" and leads them to wild bees' nests. In experiments, the call raised the chance of being led to a nest from 17% to 54%. The hunters take the honey and the bird eats the wax. And in 1984, staff at the US Navy's marine mammal program in San Diego kept hearing what sounded like people talking near the whale pens, until a diver surfaced and asked, "Who told me to get out?" It was Noc, a beluga whale imitating human voices.

Sources: Stoeger et al. 2012, *Current Biology*: "An Asian Elephant Imitates Human Speech" (Koshik, five words). Spottiswoode, Begg & Begg 2016, *Science*: "Reciprocal signaling in honeyguide-human mutualism" (the brrr-hm call; 17% → 54%). Ridgway et al. 2012, *Current Biology*: "Spontaneous human speech mimicry by a cetacean" (Noc, "Who told me to get out?").

Images: AI-generated for the channel.

#shorts #animals #animalfacts #elephant #beluga #honeyguide #talkinganimals #nature #wildlife #didyouknow #facts #learning #science

## Tags

animals that can talk, talking animals, animals that talk to humans, koshik elephant, elephant speaks korean, talking elephant, noc beluga, beluga mimics human voice, talking whale, honeyguide bird, honeyguide humans, bird leads to honey, animal facts, weird animal facts, smart animals, animal communication, wildlife, shorts, did you know

## Thumbnail

`out/pins/thumbnail-talk.jpg`, 1080×1920. Build it with `npm run pins:talk:thumb`.

## Upload settings

| field | value |
|---|---|
| Aspect | 9:16, 1080×1920, 48.3 s, 30 fps (a Short) |
| Category | Pets & Animals |
| Audience | not made for kids (general-audience animal facts) |
| Chapters | none, because Shorts don't show them |
| `#shorts` | in the description |

## Credits (images)

Every image in this Short is AI-generated for the channel, so no photo
credit is owed:

- animals, props and backgrounds: FLUX.1 [schnell] on Runware, from the
  prompts in `src/pins/talk/images.json` (17 of the 20-image budget used),
  built with `scripts/gen-images.py`
- the people's bodies (zookeeper, honey hunter, Navy divers): TubeAI's image
  generator, cut by `scripts/prep-people.py`; the comic heads are drawn in code

## Audio

Narration: the channel's ElevenLabs read ("Revenant – Young Epic Narrator"),
`.vo-takes/talk-1.mp3` (gitignored), pauses trimmed to 0.3 s. Music: the
channel's track (`.music/pins-sleep-track.wav`), 18 dB under the voice. SFX:
the channel's own files under `.sfx/pins/` (ding, whoosh, pop, wrong,
counter, elephant, bird chirps, bees, wing flaps, humpback call, creepy
whale song, huh). Rebuild with:

    python3 scripts/build-pins-audio.py talk
    npm run pins:talk
