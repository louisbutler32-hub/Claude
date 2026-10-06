# 3 Animals That Actually Rob Humans

> **Channel: not decided yet.** Paste the channel's subscribe block above
> the hashtags before you upload.

## Title

They're ROBBING Us?! 😤

Alternates:

- Animals That Actually Rob Humans
- This Monkey Holds Your Phone for Ransom 🐒 #shorts

## Description

Three animals that actually rob humans. First, the kea, New Zealand's mountain parrot: it tears the rubber off car windows, pulls off windscreen wipers and unzips backpacks, so much that conservationists built "kea gyms" near the Homer Tunnel to keep them busy and away from the cars. Next, herring gulls don't just grab any food: in an experiment, gulls watched a person pick up one of two identical snacks and went for the one the human had handled. And the long-tailed macaques at Uluwatu Temple in Bali snatch tourists' phones, glasses and hats and only give them back for food. Researchers found they hold out for more food when the thing they've stolen is worth more.

Sources: Goumas, Boogert & Kelley 2020, *Biology Letters*: "Urban herring gulls use human behavioural cues to locate food" (gulls preferred the food a person had handled). Kea Conservation Trust: kea gyms at the Homer Tunnel, Fiordland. Leca, Gunst, Gardiner & Wandia 2021, *Philosophical Transactions of the Royal Society B*: "Acquisition of object-robbing and object/food-bartering behaviours" (Uluwatu macaques; higher-value items, more food before they're returned).

Images: AI-generated for the channel.

#shorts #animals #animalfacts #monkey #seagull #kea #parrot #bali #funnyanimals #didyouknow #facts #wildlife #nature

## Tags

animals that rob humans, thieving animals, monkey steals phone, bali monkeys, uluwatu monkeys, monkey ransom, seagull steals food, seagulls stealing chips, kea parrot, kea destroys car, smart animals, funny animals, animal facts, weird animal facts, animal thieves, wildlife, shorts, did you know

## Thumbnail

`out/pins/thumbnail-rob.jpg`, 1080×1920. Build it with `npm run pins:rob:thumb`.

## Upload settings

| field | value |
|---|---|
| Aspect | 9:16, 1080×1920, 43.0 s, 30 fps (a Short) |
| Category | Pets & Animals |
| Audience | not made for kids (the hook's payoff is a censored middle finger) |
| Chapters | none, because Shorts don't show them |
| `#shorts` | in the description |

## Credits (images)

Every image is AI-generated for the channel, so no photo credit is owed:

- animals, props, backgrounds and the tourists' bodies: FLUX.1 [schnell] on
  Runware, from the prompts in `src/pins/rob/images.json` (24 images, $0.0144
  of the $0.03 cap), built with `scripts/gen-images.py`; the bodies cut by
  `scripts/prep-people.py`, the comic heads drawn in code
- the scientists' bodies: TubeAI's image generator (from the talk Short)

## Audio

Narration: the channel's ElevenLabs read, `.vo-takes/rob-1.mp3` (gitignored),
re-cut so the kea comes first: the "First," and "Next," words and the two
sections were swapped at silent gaps between words, giving
`.vo-takes/rob-2-kea-first.wav`. Pauses trimmed to 0.3 s, with a 1.0 s hold
after the hook for the payoff.
Music: the channel's track, 18 dB under the voice. SFX: the channel's files
under `.sfx/pins/` (ding at 0:00, then the riser, timed to peak as the hook
line ends; seagull, parrot, monkey, rubber rip, zipper, tiptoe, ka-ching,
whoosh, pop, counter) and a 1 kHz censor beep synthesised for the gag. Rebuild:

    python3 scripts/build-pins-audio.py rob --vo .vo-takes/rob-2-kea-first.wav
    npm run pins:rob
