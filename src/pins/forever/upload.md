# 3 Animals That Live Forever

> **Channel: not decided yet.** Paste the channel's subscribe block above
> the hashtags before you upload.

## Title

They Don't Die?! 😨

Alternates:

- Animals That Basically Live Forever
- This Tortoise Is Older Than Photography 🐢 #shorts

## Description

In this video we reveal three animals that basically live forever. #animal #facts #viral #interestingfacts #shorts

The immortal jellyfish (Turritopsis dohrnii), only about 4.5 mm across, can turn back into its baby polyp stage when it's old or injured, and start its life over. The Greenland shark is the longest-lived vertebrate known: scientists estimated one at around 400 years old (the range is roughly 270 to 510), it grows about a centimetre a year and doesn't mature until it's around 150. Jonathan, a Seychelles giant tortoise living on St Helena, is believed to have hatched around 1832, before the first photograph of a person was taken (1838), making him the oldest known living land animal.

Sources: Piraino et al. 1996, *The Biological Bulletin*: "Reversing the life cycle" (Turritopsis). Nielsen et al. 2016, *Science*: "Eye lens radiocarbon reveals centuries of longevity in the Greenland shark". Guinness World Records: Jonathan, oldest living land animal.

**Check before uploading:** that Jonathan is still alive (he's a very old tortoise).

Images: AI-generated for the channel.

#shorts #animals #animalfacts #immortaljellyfish #greenlandshark #tortoise #jonathanthetortoise #oldestanimal #didyouknow #facts #wildlife #nature

## Tags

animals that live forever, immortal animals, immortal jellyfish, turritopsis dohrnii, greenland shark, oldest shark, 400 year old shark, jonathan the tortoise, oldest tortoise, oldest land animal, longest living animals, animal facts, weird animal facts, did you know, wildlife, nature, shorts

## Thumbnail

`out/pins/thumbnail-forever.jpg`, 1080×1920. Build it with `npm run pins:forever:thumb`.

## Upload settings

| field | value |
|---|---|
| Aspect | 9:16, 1080×1920, 38.7 s, 30 fps (a Short) |
| Category | Pets & Animals |
| Audience | not made for kids (the Grim Reaper gag), general-audience animal facts |
| Chapters | none, because Shorts don't show them |
| `#shorts` | in the description |

## Credits (images)

Every image is AI-generated for the channel, so no photo credit is owed:

- animals, props, the Reaper and backgrounds: FLUX.1 [schnell] on Runware,
  from the prompts in `src/pins/forever/images.json` (16 images, $0.0096 of
  the $0.03 cap), built with `scripts/gen-images.py`; the deep-sea backdrop is
  reused from the sleep Short
- the scientist's body: TubeAI's image generator (from the talk Short), the
  comic head drawn in code

## Audio

Narration: the channel's ElevenLabs read, `.vo-takes/forever-1.mp3`
(gitignored), pauses trimmed to 0.3 s, with a 1.5 s hold after the hook for
the Reaper gag. Music: the channel's track, 18 dB under the voice. SFX: the
channel's files under `.sfx/pins/` (ding at 0:00, the riser peaking as
"forever." ends, "dun dun dun" for the Reaper, tape rewind, ticking clock,
party blower, bubble pop, counter, whoosh, pop). Rebuild:

    python3 scripts/build-pins-audio.py forever --vo .vo-takes/forever-1.mp3
    npm run pins:forever
