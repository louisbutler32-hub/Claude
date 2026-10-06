# 3 Animals That Sleep in the Craziest Ways

> **Channel: not decided yet.** This line copies the Pins Guy format and
> isn't listed under "The channels" in CLAUDE.md. Pick the channel and
> paste its subscribe block above the hashtags before you upload.

## Title

They Sleep Like THIS?! 😴

Alternates:

- Animals That Sleep in the Craziest Ways
- Why Sea Otters Hold Hands 🦦 #shorts

(Pins Guy titles are short and emotional, with no numbers: "Animals that
mourn like Us", "Cute but Catastrophic". Keep it under ~40 characters.)

## Description

Three animals that sleep in the craziest ways. Sea otters hold hands while they sleep so the current can't pull them apart, and some wrap themselves in kelp that's anchored to the sea floor. Pups nap on mom's belly. The great frigatebird can stay in the air for up to two months without landing. It sleeps on the wing in bursts of about 12 seconds, often with one half of its brain awake, and adds up to only about 42 minutes of sleep a day. Sperm whales sleep upright, hanging motionless just under the surface for up to 10–15 minutes at a time. When researchers drifted their boat into a sleeping group, the whales didn't react until the boat touched one.

Sources: Rattenborg et al. 2016, *Nature Communications*: "Evidence that birds sleep in mid-flight" (frigatebirds: ~0.7 h/day of sleep in flight, mean bout ~12 s, often unihemispheric). Weimerskirch et al. 2016, *Science* (frigatebirds aloft for up to two months). Miller et al. 2008, *Current Biology*: "Stereotypical resting behavior of the sperm whale" (vertical drift-dives, unresponsive to a drifting vessel until it touched one). Monterey Bay Aquarium (sea otters rafting, holding paws, wrapping in kelp).

Frigatebird photo: "Magnificent Frigatebird Juvenile" by Kurayba, CC BY-SA 2.0 (https://www.flickr.com/photos/48503330@N08/5662605084). All other images are AI-generated.

#shorts #animals #animalfacts #seaotter #spermwhale #frigatebird #nature #wildlife #sleep #didyouknow #ocean #facts #learning #cuteanimals

## Tags

animals that sleep weird, sea otters holding hands, why sea otters hold hands, sperm whale sleeping, sperm whales sleep vertically, frigatebird sleep while flying, birds sleep while flying, half brain sleep, animal facts, weird animal facts, animal sleep, ocean animals, sea otter, sperm whale, frigatebird, nature facts, cute animals, wildlife, shorts, did you know

## Thumbnail

`out/pins/thumbnail-sleep.jpg`, 1080×1920. Build it with `npm run pins:sleep:thumb`.
Shorts only show a custom thumbnail on the channel page and in search. The
feed plays the video itself, so the first frame (the upright sleeping whale
under the hook) is what most people see.

## Upload settings

| field | value |
|---|---|
| Aspect | 9:16, 1080×1920, 58.4 s, 30 fps (a Short) |
| Category | Pets & Animals |
| Audience | **not made for kids**. The format is general-audience animal facts (the reference channel covers death and mating too). This episode alone would be fine for kids, so flip it if it ships on a kids channel. |
| Chapters | none, because Shorts don't show them |
| `#shorts` | in the description |

## Credits (images)

Everything but one image is AI-generated for the channel, so no credit is owed
for it:

- animals, the boat and every background: FLUX.1 [schnell] on Runware, from
  the prompts in `src/pins/sleep/images.json` (14 images; the boat's
  garbled AI lettering painted out), built with `scripts/gen-images.py`
- the scientists' bodies: TubeAI's image generator, cut by
  `scripts/prep-people.py`; the comic heads are drawn in code

The one real photo is the flying frigatebird (the generated one came out as a
stork). It needs its credit in the description, as above:

| id | title | creator | licence | source |
|---|---|---|---|---|
| frigate | Magnificent Frigatebird Juvenile | Kurayba | CC BY-SA 2.0 | https://www.flickr.com/photos/48503330@N08/5662605084 |

It's cut out and composited, so the video is an adaptation under BY-SA.

## Audio

The narration is the channel's ElevenLabs read ("Revenant – Young Epic
Narrator", Multilingual v2), licensed to the channel, not the repo. It's
kept out of git: the take lives in `.vo-takes/sleep-2-frigate-whales.mp3`
(the full script in one read), and the mix is at
`public/audio/pins-sleep-mix.mp3`. Pauses longer than 0.3 s were trimmed to
0.3 s (67.6 s read → 58.4 s Short); the delivery and pitch are untouched.
The captions and every cut are timed to this read by faster-whisper. To
rebuild:

    python3 scripts/build-pins-audio.py sleep --vo .vo-takes/sleep-2-frigate-whales.mp3
    npm run pins:sleep

Music: the track the channel supplied (`.music/pins-sleep-track.wav`, cut
from the video it came in; gitignored), played from its first second, sitting
18 dB under the voice while it speaks and ~15 dB under in the gaps, faded out
over the last 0.6 s. **Credit the track in the description if its licence
asks for it**; the name and licence weren't given with the file.

SFX: the channel's own files under `.sfx/pins/` (ding at 0:00, whoosh on
every section and hook cut, pop, wrong, counter, wing flaps, whale call,
splash), cued by word in `script.json`.
