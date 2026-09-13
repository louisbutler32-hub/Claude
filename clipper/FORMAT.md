# The Format

Reverse-engineered from `Tested And Proved` — *"He Compressed 100 RedBulls into
1 Drink 😳 (@NileRed/YT)"*, 15.4M views, 60.5s. Every number below is measured
off the file, not estimated.

The channel is a **clipping channel**: it takes one long-form science video,
cuts ~60s of the best footage, and lays a newly-written third-person voiceover
over the top. The source creator is credited in the title. Four videos on the
channel, 11.4K subs, one at 15M — the format carries the reach, not the
audience.

---

## 1. Canvas

| Property | Value |
|---|---|
| Output | 1080 × 1920, 60 fps, H.264 |
| Main panel | 1080 × 960, dead centre (y 480 → 1440) |
| Top band | y 0 → 480 — same frame, scaled up, heavy gaussian blur |
| Bottom band | y 1440 → 1920 — same treatment |
| Source crop | 16:9 centre-cropped to 1.125:1, then fitted to the panel |

The panel is exactly half the frame height and exactly centred. Measured
sharpness: main panel 222.3, top band 3.9, bottom band 0.5 — the bands are
blurred to near-mush, so they read as colour context, never as content.

Why it works: the 16:9 source keeps its full width (no cropping into the
action), while the frame still fills a phone screen.

---

## 2. Cut rhythm

52 hard cuts in 60s. **No transitions — every cut is a hard cut.**

| Metric | Value |
|---|---|
| Mean shot | 1.13s |
| Median shot | 0.98s |
| Shortest | 0.60s |
| Longest | 2.27s |

Cut density per 10s block:

```
 0-10s  ██████████ 10     ← hook, fastest
10-20s  ███████████ 11    ← build
20-30s  █████████  9
30-40s  ██████     6      ← the turn; shots get longer to let it land
40-50s  ████████   8      ← conflict + solution
50-60s  ████████   8      ← payoff
```

The dip at 30–40s is deliberate and is the most copyable trick here: when the
twist arrives, **slow down**. Longest shots in the video (2.27s, 2.10s) sit
either side of the reveal. Everywhere else, never let a shot run past ~1.5s.

Shot-type alternation, roughly every other cut: extreme close-up (hands,
product, gauge) → wide (presenter + apparatus) → close-up. Never two wides in a
row.

---

## 3. Script structure

191 words, 59.1s, **194 WPM**. That is fast — conversational is ~150.

The hook is the fastest thing in the video at **247 WPM**. It outruns the
thumb.

Mean gap between sentences: **0.33s**. There is no silence anywhere.

### The beat map

| Time | Beat | Line |
|---|---|---|
| 0.0–3.4 | **HOOK** — open question | "What would happen if you compressed 100 cans of Red Bull into one drink?" |
| 3.8–8.9 | Setup | "This guy bought 100 cans of sugar-free Red Bull and poured every single one into a giant bucket." |
| 9.4–11.0 | Scale stat | "That's 25 litres of energy drink." |
| 11.3–15.2 | Goal | "And the goal was simple — concentrate all of it into the size of one can." |
| 15.5–19.4 | Mechanism | "To do that, he used this insane machine that removes all the water from liquids." |
| 20.1–24.8 | Mechanism detail | "It sprays Red Bull into 150 degree air, instantly drying it into powder." |
| 25.3–29.3 | Stated expectation | "So in theory, all that should be left is the flavour, caffeine, and vitamins." |
| 29.3–35.0 | Progress | "And after running the machine for hours, he finally started collecting actual powdered Red Bull." |
| **35.3–37.5** | **THE TURN** | **"But when he weighed the powder, something weird happened."** |
| 37.8–39.8 | Expectation restated | "He expected the equivalent of 100 cans." |
| 40.2–46.2 | **CONFLICT** | "But instead, he only had about two thirds of it — meaning 33 cans of Red Bull literally evaporated into the air." |
| 46.5–48.3 | **SOLUTION** | "So he rebuilt the drink using what was left." |
| 48.6–52.2 | Result | "He ended up with a bottle containing the energy of 66 cans of Red Bull," |
| 52.3–55.2 | **PAYOFF** | "which means just one tiny sip equals an entire can." |
| 55.5–59.1 | Button | "So he tried it." / "Whoa, that's crazy." / "Crazy good." |

### The rules this encodes

1. **The turn lands at 58%.** Not the middle, not the end. Everything before it
   is a promise; everything after is the complication.
2. **State the expectation before you break it.** "He expected 100 cans" exists
   only so "he had two thirds" hurts. One costs 2 seconds and doubles the
   payoff.
3. **Third person, present-tense energy.** "This guy", "he" — the narrator is a
   fan reporting, not the person who did it. This is what makes clipping
   honest and what makes the credit in the title work.
4. **A number every ~8 seconds.** 100, 25 litres, one can, 150 degrees, two
   thirds, 33, 66, one sip. Numbers are free specificity.
5. **The button is the original creator's own audio.** The last 3.6s drop the
   VO and use the source's live reaction ("Whoa, that's crazy. Crazy good.").
   The payoff is more credible in the voice of the person who tasted it.
6. **No CTA. No outro. No "follow for more".** It ends on the reaction and
   loops.

---

## 4. Captions

One word at a time, burned in, changing every **0.24s median** (~229/min).

| Property | Value |
|---|---|
| Font | Poppins Black (900) — geometric, single-storey `a` |
| Case | lowercase |
| Fill | pure white `#FFFFFF` |
| Outline | black, ~14px at 110px type, **rounded joins** |
| Position | bottom of the main panel, ~71% down the frame |
| Animation | fast scale pop on each word change |

The rounded join on a thick stroke is what produces the signature "blob"
silhouette. A mitred stroke of the same width looks wrong immediately.

**Keyword colouring**: brand and emphasis words get colour instead of white —
`redbull` rendered in the Red Bull red/blue, `liquids` in cyan. Roughly one
coloured word every 10–15 seconds. Used sparingly, it reads as emphasis; used
often, it reads as noise.

---

## 5. On-screen annotations

Hand-drawn style, red or white, appearing for ~1s on the beat the VO names them:

- **Red arrow** — thick, angled, pointing at the thing just mentioned
- **Red circle** — rough hand-drawn ellipse around apparatus
- **White double-ring circle** — softer emphasis on a held object

Roughly 4–6 across a 60s video. They exist to make a cluttered lab frame
legible on a 6-inch screen.

---

## 6. Audio

| Property | Value |
|---|---|
| Integrated loudness | **−17.3 LUFS** |
| Loudness range | **3.2 LU** (extremely compressed) |
| True peak | +1.2 dBFS (clipping, deliberately) |
| Music bed | ~11 dB under the VO |
| Bed character | low-mid heavy, no top end above 6kHz |

LRA of 3.2 is flat — every word is the same volume. This is Shorts mastering:
it survives phone speakers and a noisy room. Master to −17 LUFS with heavy
compression, not to broadcast −14.

The bed never rests. Even at the quietest point there's 120–400Hz energy
underneath.

---

## 7. Title formula

```
[He | This Guy] + [transformation verb] + [absurd quantity / mundane thing]
+ into + [surprising result] + [shock emoji] + (@SourceCreator/YT)
```

All four on the channel:

- He **Compressed** 100 RedBulls **into** 1 Drink 😳 (@NileRed/YT) — 15M
- This Guy **Turned** Cotton Balls **into** Cotton Candy 😳 (@NileRed/YT) — 527K
- He **Condensed** 20 beers **into** 1 Super Beer 😲 (@NileRed/YT) — 167K
- He **Made** A Chemically Pure choc-chip Cookie 😱 (@NileRed) — 139K

The verb does the work: *compressed, turned, condensed, made*. Attribution in
the title is not optional — it is what keeps the channel viable.

---

## 8. The checklist

Before rendering, the cut must satisfy:

- [ ] Hook is a question or an impossible claim, delivered in under 3.5s at 240+ WPM
- [ ] First cut lands before 1.2s
- [ ] No shot longer than 1.5s except the two either side of the turn
- [ ] The turn lands between 55% and 62% of the runtime
- [ ] The expectation is stated explicitly before it breaks
- [ ] A number lands at least every 8 seconds
- [ ] Gaps between sentences under 0.4s throughout
- [ ] The last beat is the source creator's own audio
- [ ] No CTA, no outro
- [ ] Source creator credited in the title
