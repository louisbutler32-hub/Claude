# 3 Animals That Never Forget Your Face

> **Channel: not decided yet.** Paste the channel's subscribe block above
> the hashtags before you upload.

## Title

They Never Forget You 😳

Alternates:

- Animals That Remember Your Face Forever
- This Crow Will Hold a Grudge for Years 🐦‍⬛ #shorts

## Description

In this video we reveal three animals that never forget a human face. #animal #facts #viral #interestingfacts #shorts

Crows: researchers at the University of Washington in Seattle trapped and banded crows while wearing a "dangerous" caveman mask. For years afterwards the crows scolded and mobbed anyone in that mask, ignored people in a neutral mask, and crows that had never been caught (including young birds) learned to scold it too. Sheep: a Cambridge team trained sheep to pick out the faces of four celebrities, among them Barack Obama and Emma Watson, from photos; they chose the trained face about 8 times out of 10. Honeybees: in a 2005 study, bees trained with sugar rewards learned to tell human face photos apart, and still recognised the trained face two days later, with a brain far smaller than a grain of rice.

Sources: Marzluff et al. 2010, *Animal Behaviour*: "Lasting recognition of threatening people by wild American crows". Cornell, Marzluff & Pecoraro 2012, *Proc. R. Soc. B*: "Social learning spreads knowledge about dangerous humans among American crows". Knolle et al. 2017, *Royal Society Open Science*: "Sheep recognize familiar and unfamiliar human faces from two-dimensional images". Dyer, Neumeyer & Chittka 2005, *J. Exp. Biol.*: "Honeybee (*Apis mellifera*) vision can discriminate between and recognise images of human faces".

Images: AI-generated for the channel.

#shorts #animals #animalfacts #crows #sheep #honeybees #facerecognition #smartanimals #didyouknow #facts #wildlife #nature

## Tags

animals that remember faces, crows remember faces, crow grudge, crows never forget, sheep recognize faces, sheep celebrities, bees recognize faces, honeybee face recognition, smart animals, animal intelligence, animal facts, weird animal facts, did you know, wildlife, nature, shorts

(283 characters, under YouTube's 500 cap)

## Thumbnail

`out/pins/thumbnail-faces.jpg`, 1080×1920. Build it with `npm run pins:faces:thumb`.

## Upload settings

| field | value |
|---|---|
| Aspect | 9:16, 1080×1920, 35.3 s, 30 fps (a Short) |
| Category | Pets & Animals |
| Audience | not made for kids, general-audience animal facts |
| Chapters | none, because Shorts don't show them |
| `#shorts` | in the description |

## Credits (images)

Every image is AI-generated for the channel, so no photo credit is owed:

- animals, props and backgrounds: FLUX.1 [schnell] on Runware, from the
  prompts in `src/pins/faces/images.json` (12 images, $0.0072 of the $0.03 cap), built with
  `scripts/gen-images.py`
- the scientist's body (sci-point, sci-clipboard): TubeAI's image generator (from the talk Short), comic head drawn in code

**Note:** the framed celebrity photos are silhouettes and a drawn comic face, so no real likeness is shown.

## Audio

Narration: the channel's ElevenLabs read, `.vo-takes/faces-1.mp3, cut from the week1 read (0:00–0:35.3)`
(gitignored), pauses trimmed to 0.3 s, with a 1.2 s hold after the hook for
the payoff gag. Music: the channel's track, about 18 dB under the voice. SFX:
the channel's files under `.sfx/pins/` (ding at 0:00, the riser peaking as "face." ends, bird calls and chirps, bees, wings, wrong buzzer, counter, pop, whoosh). Rebuild:

    python3 scripts/build-pins-audio.py faces --vo .vo-takes/faces-1.mp3
    npm run pins:faces
