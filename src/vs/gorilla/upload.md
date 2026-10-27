# LeBron vs. a Silverback Gorilla — upload package

**Format:** YouTube Short, 9:16, 50 s. Not made for kids: it's sports comedy for a general audience, not aimed at under-13s.
**Composition:** `Vs-Gorilla` (thumbnail: `Vs-Gorilla-Thumbnail`).

## Title

**Could LeBron James Score on a Silverback Gorilla? 🦍🏀**

Alternates:
- LeBron James vs. a 400 lb Gorilla, First Basket Wins
- What If LeBron Played 1-on-1 Against a Gorilla?

## Description

Could LeBron James, 6'9", 250 lbs and the all-time leading scorer, score on a 400-pound silverback gorilla with an 8-foot arm span? One-on-one. First basket wins. 🦍🏀

Which matchup should we simulate next? Drop it in the comments 👇

<!-- channel footer goes here once the channel is decided -->

#Shorts #LeBronJames #NBA #Basketball #Gorilla

Shorts don't support chapters, so there's no chapter list.

## Tags

lebron james, lebron vs gorilla, could lebron beat a gorilla, gorilla vs human, silverback gorilla, nba, basketball, 1v1, one on one, basketball simulation, nba simulation, 3d animation, what if, funny basketball, lebron dunk, gorilla strength, sports comedy, shorts

(266 characters, under YouTube's 500 limit.)

## Thumbnail

`npm run vs:gorilla:thumb` → `out/thumbnail-lebron-vs-gorilla.jpg`, 1080×1920 (9:16).

## Notes

- **Audio:** `npm run vs:gorilla:audio` builds the voiceover, effects and mix into `public/audio/vs-gorilla-mix.mp3`, and writes the caption times to `timing.json`. Then `npm run vs:gorilla` renders the video with that mix. There's no music. The script header lists the Python packages it needs; the voice model and sounds download on the first run.
  - **Voice:** Kokoro-82M, voice `am_fenrir` (Apache-2.0, free for commercial use). The wording is in `script.json`; edit a line there and rebuild. Each line starts at its shot, and a line that would overrun is read slightly faster.
  - **Sound effects:** all CC0 (public domain), so no credit is needed. Kenney Impact and Interface packs (kenney.nl), and from OpenGameArt: "Gorilla Sounds" by antumdeluge, "Crowd Shouting/Speaking Ambience" by starninjas, "Applause in a large hall or church" by expl0it3r, "OoOoOoOoOoOoOo" by nocturnalvanguard, "Swishes Sound Pack" by artisticdude and "Air whoosh" by pyranostudios. The whistle, buzzer and sniffs are synthesised.
  - **Loudness:** about −15 LUFS, so it sits at YouTube's level.
- **Facts used:** LeBron is 6'9", 250 lb, a 4× champion and the all-time leading scorer. A silverback weighs up to ~400 lb and has an arm span up to ~8'6". Their charge is often given as 20–25 mph. "Up to 10× stronger" is the popular figure, but published estimates vary a lot, so the script hedges it with "up to".
- **Likeness:** LeBron is a stylised low-poly caricature in generic gold/purple with no team or league logos. The court branding is made up ("JUNGLE CLASSIC").
