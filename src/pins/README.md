# Pins format: animal-fact Shorts in the style of @PinsGuy

The reference is https://www.youtube.com/@PinsGuy/shorts (388K subs, 62
Shorts, ~8.9M average views, top Short 50M). Every number below was measured
off its top Shorts ("Three love stories", "Animals that mourn like Us",
"When humans like something way too much!"), so treat them as findings,
not preferences.

## The format

| piece | what the reference does | where it lives here |
|---|---|---|
| length | 34–62 s, mostly 44–57 s | `script.json`. Aim for ~130–150 words at +12% rate ≈ 50 s |
| structure | **"Three animals that …"** hook (≤3 s), then three items, each opened by *First / Next / Finally* (or "And what about…"), ~15 s each | `script.json` lines |
| ending | no outro, no CTA. It stops on the third item's punchline so the Short loops | last line of the script |
| art | **real photo cutouts** of the animals over photo backdrops (2.5D collage), puppeted with scale/rotate/float | `Actor` + `Backdrop` in `engine.tsx` |
| faces | big cartoon googly eyes over the real eyes; tears, X-eyes, halos, sweat, "!" / "?" marks | `Eye` moods: open, closed, wide, sad, dead, angry |
| props | flat cartoon overlays: clocks spinning, calendars, thought bubbles, brain/DNA diagrams, crossed-out icons, hearts | `Clock`, `Calendar`, `SplitBrain`, `Heart`, `Chip`, `Mark`, `Bonk`, `Current`, `Zzz` |
| camera | constant slow push-ins, pans down/up between sets, a shake on impacts | `Cam` (`z`, `x`, `y`, `shake`) |
| cuts | hard cuts on the narration beats, one new picture every ~1.5–2.5 s (≈25 shots in 52 s) | `ShotPlayer`: one `Shot` per beat, keyed to a word |
| captions | bold rounded sans, uppercase, heavy black outline + drop shadow, lower-centre; 2–3 words at a time with the **spoken word in yellow**, the rest white | `Captions` (Poppins Black, `#ffd400`) |
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
