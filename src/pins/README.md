# Pins format: animal-fact Shorts in the style of @PinsGuy

The reference is https://www.youtube.com/@PinsGuy/shorts (388K subs, 62
Shorts, ~8.9M average views, top Short 50M). Every number below was measured
off its top Shorts ("Three love stories", "Animals that mourn like Us",
"When humans like something way too much!") and off 48 of its own frames
(YouTube's auto-thumbnails at 25/50/75% of 16 Shorts), so treat them as
findings, not preferences.

## The format

| piece | what the reference does | where it lives here |
|---|---|---|
| length | 34–62 s, mostly 44–57 s | `script.json`. Aim for ~130–150 words at +12% rate ≈ 50 s |
| structure | **"Three animals that …"** hook (≤3 s), then three items, each opened by *First / Next / Finally* (or "And what about…"), ~15 s each | `script.json` lines |
| ending | no outro, no CTA. It stops on the third item's punchline so the Short loops | last line of the script |
| art | photoreal animals (theirs look AI-rendered: clean, full-body, centred, often facing camera) composited over **sharp, bright daylight photo backdrops**, puppeted with scale/rotate/float. Underwater sets are a painted teal→navy gradient | `Actor` + `Backdrop` (blur 0.5, slight lift) + `PaintedDeep` |
| faces | cartoon eyes over the real eyes, white with a **thin** outline and a big pupil, and above all **thick black eyebrows**: worried for sad (inner ends up), a V for angry, raised for shock. Blue tears on sad, sweat drops on shock, X-eyes for dead | `Eye` moods: open, closed, wide, sad, dead, angry. Brows on by default (`Asset.brows`) |
| props | big **red X** struck over what's ruled out, red pointer arrows, little white hand-lettered notes ("food →"), clocks, calendars, brain/DNA diagrams, hearts, signs | `RedX`, `Arrow`, `Note`, `Clock`, `Calendar`, `SplitBrain`, `Heart`, `Chip`, `Mark`, `Bonk`, `Current`, `Zzz` |
| people | whenever the narration mentions humans (scientists, owners, hunters), **cartoon-headed people**: a believable body in real clothes under a flat comic head (outlined face, big whites with small pupils, heavy brows, the mouth doing the acting) | `Person` in `people.tsx`: faces neutral, happy, curious, shocked, worried, smirk; caps, beanies, beards, glasses; a binoculars, clipboard or pointing prop; `talk` windows flap the mouth. `AboveLine` cuts them off at a gunwale or waterline. Check the look with the `Pins-People-Sheet` still |
| branding | a round orange channel logo top-right (~11% of width), the channel name set faint and vertical down one edge | `Brand` (`logo`, `name` props; off until the channel is picked) |
| camera | constant slow push-ins, pans down/up between sets, a shake on impacts | `Cam` (`z`, `x`, `y`, `shake`) |
| cuts | hard cuts on the narration beats, one new picture every ~1.5–2.5 s (≈25 shots in 52 s) | `ShotPlayer`: one `Shot` per beat, keyed to a word |
| captions | **one word at a time**, **orange** (`#ff7a14`), condensed heavy caps with a dark outline and a small drop shadow, centred at **~69% down** the frame. Cap height ~3.6% of the frame; an 8-letter word spans about a third of the width | `WordCaption` (Anton, 100 px). `Captions` (2–3 words, spoken one yellow) is kept for other looks |
| voice | male, standard American, energetic but warm, fast with no dead air | `edge-tts` `en-US-AndrewNeural` at `+12%` (timing only, swap in a real VO) |
| music | low plucky/upbeat bed (or soft piano on the sad ones) | synthesised in `build-pins-audio.py` |
| sfx | cartoon pops, whooshes on each section cut, boings, ticks, animal sounds | cues per line in `script.json` (`"sfx": [[name, word_index]]`) |
| titles | short and emotional, with no number: "Animals that mourn like Us", "Cute but Catastrophic", "They Scam Better Than Us" | `upload.md` |
| topics | emotional or absurd animal behaviour that mirrors humans: love, grief, parenting, unlucky animals, "better than us" | pick one per episode |

## Making an episode

1. **Script.** Write `src/pins/<ep>/script.json`: the hook line plus three
   items, ~13 lines. Fact-check every claim and list the sources in
   `upload.md`.
2. **Voice and timing.** Run `python3 scripts/build-pins-audio.py <ep>`. It
   writes `public/audio/pins-<ep>-mix.mp3` (gitignored) and
   `src/pins/<ep>/timing.json` (tracked: the shots key off it).
3. **Cutouts.** Run `python3 scripts/fetch-photo-cutouts.py pins-<ep> queries.json --want 4`.
   It uses Openverse, licence-filtered to BY / BY-SA / CC0 / PD, with rembg
   for the cutout. Pick the cleanest candidate per animal, then run
   `python3 scripts/finalize-photo-cutouts.py pins-<ep> picks.json` to get
   `public/images/pins-<ep>/` and its `credits.json`.
4. **Backdrops.** Run `python3 scripts/fetch-photo-backdrops.py pins-<ep> bg.json`,
   copy the picks in, and add them to `credits.json`. For open water use
   `PaintedDeep`: real open-ocean photos with nothing in them are rare.
5. **Eyes.** Lay a 10% grid over each cutout and write each eye's centre
   and radius as 0–1 of the image into the `Asset`.
6. **Shots.** Write one `Shot` per beat, with `at: cue(T, lineId, wordIndex)`.
   Change the picture every ~2 s and land a prop or a mood change on the
   key word.
7. **Package.** Write `upload.md` (title + 2 alternates, description with
   sources and photo credits, tags under 500 characters) and build the
   9:16 thumbnail (`<Ep>Thumb`).

## Episodes

| id | subject | files |
|---|---|---|
| sleep | 3 animals that sleep in the craziest ways (sea otters, frigatebird, sperm whales) | `sleep/` · `npm run pins:sleep`, `pins:sleep:audio`, `pins:sleep:thumb` |
