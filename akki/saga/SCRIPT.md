# "Zoro Has Until Sunset to Pay Nami 300,000,000 Berries" — shot-by-shot screenplay

Channel: AKKI TALKS — https://www.youtube.com/@akkitalkss
Format: horizontal long-form, 1920×1080, 24 fps, 4 acts × exactly 70.0 s (frames 0–1680 within each act, 6720 frames / 4:40 total), hard cut between acts, stitched by `scripts/akki-saga-stitch.sh`.
Source of truth for story, cast and production rules: `akki/saga/BIBLE.md`. Retention rules: `docs/dopamine-ladder.md`.

## How to read this

- **frames** are act-local (every act restarts at 0 and ends at 1680). Absolute time = act offset (0:00 / 1:10 / 2:20 / 3:30) + frame ÷ 24.
- **plate** is the key from the BIBLE list (`public/plates/<key>-paint.jpg` = *still*, `public/plates/<key>.mp4` = *loop*), through the kit-v2 `Scene` helper, with any reframe / flip / push-in / grade in brackets. Snow = `desert2` with a white-blue grade and snow particles; volcano = `desert2` flipped with a red grade and ash; hidden island = `jungle2` with a gold grade and sparkle; the buffet = `canteen` flipped and warm (the Marine canteen in Act 3 is `canteen` unflipped and cool, so the two rooms never read as the same place).
- **bubbles** are kit-v2 `SpeechBubble`s: ≤ 6 words each, ≤ 2 per shot, Poppins Black, pop-in; no narration anywhere. All lettering is ours (`TitleText`) — no official logo.
- **on-screen text** lists title cards, the debt counter (a receipt in the bottom-right corner on every shot except title cards; the column names only the shots where its value *changes* or it fills the frame) and the sun position (the sky in the plate, and Nami's brass **sun-clock** on the tavern wall — a horizon track with a sun disc that moves right toward a red SUNSET mark).
- **sfx**: ≤ 15 per act, named by `.sfx/op100/` file (category in brackets: sting / slash / impact / whoosh / haki / plink). Everything else is silent — the cuts do the work.
- **music**: Act 1 the light tavern bed (numpy); Act 2 Yakety Sax for the dino chase only; Act 3 tension stings and quiet; Act 4 Yakety Sax for the wrong-way montage and the Sea King chase, then **Overtaken** for the treasure run, with its big section landing exactly on the sun touching the horizon (shot 4.29), cut dead when the sun disappears (4.33). Each act's WAV ends on a 50 ms fade.
- Every act: one **white-on-black impact flash** (3 frames) on its biggest gag, 2–5 **reaction cut-aways**, and a last shot that is the join into the next act's first shot (as specified in the BIBLE).

## The ladder, applied

| rung | where it is |
|---|---|
| 1 Stimulation | Frame 0 of every act is already moving and saturated: spinning digits, a flapping poster, a busy market, water and sun. No fade from black anywhere. |
| 2 Captivation | A question card inside 3 s of every act: *CAN ZORO PAY 300,000,000 BY SUNSET?* / *FIVE MINUTES. HOW HARD CAN IT BE?* / *HOW DO YOU TRACK A PIRATE… WITH NO SENSE OF DIRECTION?* / *405,000,000 BERRIES. 90 MINUTES. HOW?* |
| 3 Anticipation | Headfakes: Zoro nearly works out the crate is cake (2.27–2.28); the chest count comes out exact and then the Boss's 10% makes him short again (4.36–4.41). A second loop opens before the first closes: the crate, the poster's zeros, the Boss's pen, the fine print, Ben's coins. |
| 4 Validation | Payoffs the viewer can't guess: the crate was *Akainu's birthday cake*; BIG PIG BEN is worth 50 berries; the 10%-of-everything contract ends up costing the *Boss*; the pig is the only character who learns to navigate Zoro. |
| 5 Affection | One voice: deadpan. Nobody comments on the joke; the cut does. |
| 6 Revelation | Same cast, same tavern, same counter, same sun-clock, same door sign in every act. |

**Payoff cadence** (≈ every 15 s or faster): a visual gag or a counter change lands at least every 12 shots; the counter itself changes value at 1.13 (preview ×2), 2.41, 3.38, 4.36, 4.40, 4.44 and 4.50. **Cliffhanger at every act break**: the door sign flips (1.52), the bill is unreadable until he turns (2.47), the sun is visibly low over a 405M counter (3.48), *TO BE CONTINUED?* (4.50).

**Running gags** (each pays off in Act 4):
- **The pointing gag** — everyone points Zoro the right way and he goes the opposite: Nami (1.29), the vendor (2.4), the vulture (2.10), the dino (2.16), himself (2.23), the cat (3.7), himself again (4.8). Payoff 4.25–4.27: Ben the pig points the *wrong* way on purpose and Zoro steers home.
- **The 10% contract** — signed unread in 1.35; the Boss collects on every bill (2.43, 3.45); payoff 4.39–4.44: "everything means everything" includes Zoro's debt, so the Boss's 10% is what makes Zoro square.
- **The crate** — Act 1 prop, Act 2 sled/boat/bait, Act 2's cake was Akainu's (3.10), the dent it left is still in the desert (4.9).
- **BIG PIG BEN** — the scary poster (1.20), the 50-berry pig (3.30–3.31), the 50-berry coins he produces (3.43, 4.6, 4.45) that end as Nami's tip.
- **The door sign** — BACK IN 10 MIN (1.52) spins back to OPEN when Zoro crashes through (4.31).
- **Luffy eats everything** — the Boss's breakfast (1.6), the mop (1.33), the cake (2.34), the peanuts and the bowl (4.28), and the finale: his buffet tab (4.47–4.48).

## ACT 1 — THE DEAL

*Harbour Tavern, dawn → early morning.* Frames 0–1680 within the act (70.0 s). 52 shots, 15 sound effects, 1 white-on-black impact flash, 3 reaction cut-aways. Shot 52 is the join into Act 2.

| # | frames | s | plate | camera | in frame / pose / expression | action beat | bubbles (≤ 6 words, ≤ 2) | on-screen text / counter / sun | sfx (.sfx/op100) | music |
|---|---|---|---|---|---|---|---|---|---|---|
| 1.1 | 0–44 | 1.83 | tavern2 (still; slow push-in on the bar top) | extreme close | The receipt alone on the bar, counter digits rolling 0 → 300,000,000 in red. Already moving: digits spin, a sun glint sweeps the paper. | WHITE TITLE slams in over the spinning receipt, letter by letter. | — | TITLE: CAN ZORO PAY 300,000,000 BERRIES BY SUNSET? \| COUNTER rolls to 300,000,000 B | op100 028_enemy_intro_sting_1 (sting) on the last digit | tavern bed (numpy pluck) fades in under the sting |
| 1.2 | 44–72 | 1.17 | tavern2 (still; same frame, tighter) | extreme close | Zoro's one open eye, grey face, pupil a pin-prick. Eyelid twitches on twos. | The question answered with a worse question. | **Zoro:** “...By when?” | — | — | tavern bed |
| 1.3 | 72–106 | 1.42 | tavern2 (loop; door reframed camera-left) | wide | Tavern door bursts open in dawn light. Nami marching in, Zoro dragged behind her BY THE EAR, feet skidding, swords clattering. Boss behind the bar mid-polish. | Entrance. Door swings wide and hits the wall. | — | SUN: just over the horizon through the door (DAWN) | op100 096_whoosh_swing_throw (whoosh) on the door | tavern bed |
| 1.4 | 106–134 | 1.17 | tavern2 (loop) | medium | Boss behind the bar, red apron, glass in hand, eyes turn into berry signs. | He has seen a debt walk in. His favourite kind of customer. | **Boss:** “Business!” | — | — | tavern bed |
| 1.5 | 134–168 | 1.42 | tavern2 (loop; low, floor level) | low | Nami's boots stomping toward camera; Zoro's heels dragging two furrows in the floorboards. | Zoro is NOT walking. | **Nami:** “Walk. You have legs.”<br>**Zoro:** “I was walking the other—” | — | — | tavern bed |
| 1.6 | 168–196 | 1.17 | tavern2 (loop; flipped, booth corner) | medium | REACTION CUT-AWAY: Luffy in the corner booth eating the Boss's own breakfast off the Boss's own plate, fork in each hand, cheeks full. | Nobody invited him. He is already here. | **Luffy:** “Morning!” | — | — | tavern bed |
| 1.7 | 196–230 | 1.42 | tavern2 (loop) | medium | Nami SLAMS the receipt onto the bar. Zoro flinches; the Boss's glass jumps. The slam hits on a WHITE-ON-BLACK IMPACT FLASH (3 frames). | IMPACT FLASH #1 of the act, on the slam. | — | COUNTER on receipt: 300,000,000 B | op100 095_mug_fist_against_table (impact) | tavern bed drops out for 0.5 s then returns |
| 1.8 | 230–258 | 1.17 | tavern2 (still; receipt fills frame) | extreme close | The receipt: 'ZORO — 300,000,000 B. INTEREST: YES. DEADLINE: SUNSET.' Red stamp: OVERDUE. | Hold on the paper so the number is readable. | — | COUNTER: 300,000,000 B | — | tavern bed |
| 1.9 | 258–286 | 1.17 | tavern2 (loop) | close | Boss reading the receipt upside-down from behind the bar, eyebrows up, low whistle. | Professional appraisal. | **Boss:** “That's a lot of burgers.” | — | — | tavern bed |
| 1.10 | 286–320 | 1.42 | tavern2 (loop) | medium | Zoro on his feet, finger raised, defending himself. Nami, calculator already out, doesn't look up. | The origin of the debt, in four words. | **Zoro:** “I borrowed ONE thousand.”<br>**Nami:** “Interest.” | — | — | tavern bed |
| 1.11 | 320–362 | 1.75 | tavern2 (loop; reframe to the back wall) | wide | Nami hangs a big brass SUN-CLOCK on the wall: a horizon track with a sun disc at the far left, SUNSET marked in red at the far right. She taps it with the calculator. | The clock of the whole video goes up. Every act checks it. | — | SUN-CLOCK: sun at DAWN (far left of the track) | op100 118_golden_bell (bell) as it hooks on | tavern bed |
| 1.12 | 362–390 | 1.17 | tavern2 (loop) | close | Nami, sweetest smile, head tilt, calculator raised like a weapon. | The rule, stated once. | **Nami:** “Sunset. Or it doubles.” | — | — | tavern bed |
| 1.13 | 390–418 | 1.17 | tavern2 (still; receipt) | extreme close | The counter flickers 300,000,000 → 600,000,000 → 300,000,000, like a threat. | A preview of the penalty. Audience now knows the stakes. | — | COUNTER flickers 300,000,000 ⇄ 600,000,000 | op100 069_terror_sting (sting) | tavern bed |
| 1.14 | 418–452 | 1.42 | tavern2 (loop) | close | Zoro's hand drifts to a sword hilt. Nami's eyes slide to it. | He considers the only solution he knows. | **Zoro:** “I can't cut a sunset.”<br>**Nami:** “You've tried.” | — | — | tavern bed |
| 1.15 | 452–480 | 1.17 | tavern2 (loop) | medium | Boss slides down the bar on his elbows like it's a counter at a deli, grin enormous. | Opportunity. | **Boss:** “I have JOBS!” | — | — | tavern bed |
| 1.16 | 480–522 | 1.75 | tavern2 (loop; wide, bar + floor) | wide | Boss unrolls the JOB BOARD. It unrolls off the bar, across the floor, past Luffy's booth, and out of frame. Luffy lifts his feet for it. | Scale gag: three jobs on a scroll the length of the room. | — | JOB BOARD header: TODAY'S JOBS (prices stamped) | op100 101_uncovering_coat (whoosh/cloth) | tavern bed |
| 1.17 | 522–550 | 1.17 | tavern2 (still; scroll close) | close | Job 1 stamp: DELIVERY — 100,000,000 B. The Boss's finger lands on it. | Job one. | — | STAMP: DELIVERY 100,000,000 B | — | tavern bed |
| 1.18 | 550–584 | 1.42 | tavern2 (loop) | medium | Boss heaves a GIANT sealed crate onto the bar. Stencils: FRAGILE · THIS WAY UP (the arrow points sideways) · DO NOT EAT. | The crate. Prop of Act 2. | **Boss:** “One crate. One address.” | — | op100 006_floor_wall_breaks (impact, low) as it lands | tavern bed |
| 1.19 | 584–612 | 1.17 | tavern2 (loop) | close | Zoro tilts his head at the sideways arrow. Tilts it the other way. The arrow does not help. | First direction joke of the saga. | **Zoro:** “Which way is up?” | — | — | tavern bed |
| 1.20 | 612–646 | 1.42 | tavern2 (still; scroll close) | close | Job 2 stamp: BOUNTY — 150,000,000 B, with a WANTED poster: BIG PIG BEN — a huge black silhouette with a tiny pink snout and a pirate hat. | Job two. Seed: the zeros on the price are in slightly different ink. | — | POSTER: WANTED · BIG PIG BEN · 150,000,000 | op100 029_enemy_intro_sting_2 (sting) | tavern bed |
| 1.21 | 646–674 | 1.17 | tavern2 (loop) | close | Zoro's eyes narrow at the poster, swordsman mode. | He only hears the first word. | **Zoro:** “Big.”<br>**Boss:** “Huge. Terrifying. Zero survivors.” | — | — | tavern bed |
| 1.22 | 674–702 | 1.17 | tavern2 (loop) | over-shoulder | REACTION CUT-AWAY: over Nami's shoulder — she squints at the poster's zeros, calculator lifting... the Boss's hand slides the poster away before she can count them. | Seed for the Act 3 reveal; nobody comments. | — | — | — | tavern bed |
| 1.23 | 702–736 | 1.42 | tavern2 (still; scroll close) | close | Job 3 stamp: ANYTHING ELSE — 50,000,000 B. Beneath it, a tiny doodle of a mop. | Job three is a mop. | **Zoro:** “Anything else?”<br>**Boss:** “Mop's in the back.” | STAMP: ANYTHING ELSE 50,000,000 B | — | tavern bed |
| 1.24 | 736–764 | 1.17 | tavern2 (loop; booth) | medium | Luffy, hand up like a schoolboy, already chewing something that looks like a mop head. | Luffy applies for job three by eating it. | **Luffy:** “I'll take the mop.” | — | — | tavern bed |
| 1.25 | 764–806 | 1.75 | tavern2 (loop) | medium | Zoro counts on his fingers, mouth moving, crate behind him, poster in his other hand. Nami watches the fingers. | He can do the maths. That is the suspicious part. | **Zoro:** “That's exactly 300,000,000.”<br>**Nami:** “Exact. Suspicious.” | — | — | tavern bed |
| 1.26 | 806–834 | 1.17 | tavern2 (loop) | close | Boss, sweat bead, grin held slightly too long. | Caught, instantly. | **Boss:** “Coincidence!” | — | op100 041_awkward_wtf_spring (sting) | tavern bed |
| 1.27 | 834–868 | 1.42 | tavern2 (loop) | medium | Zoro hoists the crate onto one shoulder, bites the poster between his teeth, hand on a hilt. | Heroic prep. | — | — | — | tavern bed |
| 1.28 | 868–896 | 1.17 | tavern2 (loop; low, hero angle) | low | Hero shot up at Zoro, dawn light behind him, crate silhouetted. One word. | The vow. | **Zoro:** “Sunset.” | — | — | tavern bed swells a touch |
| 1.29 | 896–924 | 1.17 | tavern2 (loop) | medium | Nami, not looking up from the calculator, points flat at the door. | She knows. | **Nami:** “Door's that way.” | — | — | tavern bed |
| 1.30 | 924–958 | 1.42 | tavern2 (loop; reframed to the cupboard side) | wide | Zoro turns 180° from her finger and marches straight into the BROOM CUPBOARD. Door shuts behind him. Mop handles clatter. | The wrong-way habit, established in-house. | — | — | op100 005_character_flies_into_building (impact) | tavern bed |
| 1.31 | 958–992 | 1.42 | tavern2 (loop) | medium | Nami and Boss side by side at the bar, deadpan, watching the cupboard door. | Two professionals assess the asset. | **Boss:** “He'll be fine.”<br>**Nami:** “He'll be doubled.” | — | — | tavern bed |
| 1.32 | 992–1026 | 1.42 | tavern2 (loop) | medium | Cupboard door opens. Zoro steps out with a bucket on his head, crate still on his shoulder, mop in his free hand. | He maintains dignity. | **Zoro:** “Wrong cupboard.” | — | — | tavern bed |
| 1.33 | 1026–1054 | 1.17 | tavern2 (loop; booth) | close | Luffy's rubber arm snakes across frame, takes the mop from Zoro's hand, retracts. Crunch off-screen. | Job three, completed. | **Luffy:** “Anything else!” | — | op100 001_luffy_arm_stretch (whoosh) | tavern bed |
| 1.34 | 1054–1096 | 1.75 | tavern2 (loop) | over-shoulder | Over Zoro's shoulder: the Boss leans to Nami and whispers behind his hand while sliding a CONTRACT along the bar toward Zoro with the other hand. | The contract. Pays off in Act 4. | **Boss:** “10% commission.” | — | — | tavern bed |
| 1.35 | 1096–1130 | 1.42 | tavern2 (still; paper) | extreme close | The contract: 'I, ZORO, agree to 10% of EVERYTHING.' Fine print under it, tiny: 'everything means everything.' | Hold long enough for the fine print to be read on a pause. | — | CONTRACT: 10% OF EVERYTHING (fine print: everything means everything) | — | tavern bed |
| 1.36 | 1130–1164 | 1.42 | tavern2 (loop) | medium | Zoro signs without reading, crate on shoulder, pen upside-down, poster still in his teeth. Boss nods encouragingly. | Signed. | **Zoro:** “Is this the map?”<br>**Boss:** “Sure.” | — | — | tavern bed |
| 1.37 | 1164–1192 | 1.17 | tavern2 (still; paper) | extreme close | The signature: Z O R O — the Z is backwards. The Boss's hand blows on the ink. | Even his signature faces the wrong way. | — | — | — | tavern bed |
| 1.38 | 1192–1220 | 1.17 | tavern2 (loop) | close | Nami stamps the receipt PENDING, hard, and folds it into Zoro's haramaki like a parking ticket. | Clock starts. | **Nami:** “Clock's running.” | COUNTER: 300,000,000 B (PENDING) | op100 095_mug_fist_against_table (impact, quieter) | tavern bed |
| 1.39 | 1220–1248 | 1.17 | tavern2 (still; wall) | close | SUN-CLOCK cut-away: the sun disc nudges one notch to the right with a tick. | Time, visibly. | — | SUN-CLOCK: one notch past DAWN | — | tavern bed |
| 1.40 | 1248–1290 | 1.75 | tavern2 (loop; door side) | medium | Zoro at the door, dramatic look back over the crate. | His sense of time matches his sense of direction. | **Zoro:** “I'll be back by lunch.”<br>**Nami:** “It's 6 a.m.” | — | — | tavern bed |
| 1.41 | 1290–1324 | 1.42 | tavern2 (loop) | close | Boss tucks a paper slip into the crate's string: 'MARINEFORD CAKE SHOP — 5 MIN. LEFT OUT THE DOOR.' | The address. Five minutes. | **Boss:** “Five minutes. Turn LEFT.” | ADDRESS SLIP: 5 MIN · LEFT | — | tavern bed |
| 1.42 | 1324–1352 | 1.17 | tavern2 (loop) | close | Zoro nods slowly, memorising. His eyes flick right. | The audience sees it. He doesn't. | **Zoro:** “Left.” | — | — | tavern bed |
| 1.43 | 1352–1386 | 1.42 | tavern2 (loop) | close | Nami presses a compass into his palm. The needle spins like a fan the second he touches it. | The compass is fine. It's him. | **Nami:** “Don't.”<br>**Zoro:** “It's broken.” | — | — | tavern bed |
| 1.44 | 1386–1414 | 1.17 | tavern2 (loop; booth) | medium | Luffy pops up behind the crate, sniffing it, eyes starry. | Chekhov's cake. | **Luffy:** “Bring back cake.” | — | — | tavern bed |
| 1.45 | 1414–1442 | 1.17 | tavern2 (loop) | close | Boss, startled, half a sentence out before both hands clap over his mouth. | The crate is cake. The Boss is bad at secrets. | **Boss:** “How did you know it's—” | — | — | tavern bed |
| 1.46 | 1442–1470 | 1.17 | tavern2 (still; crate side) | extreme close | The DO NOT EAT stencil on the crate, Zoro's unbothered chin above it. | He doesn't read labels either. | — | — | — | tavern bed |
| 1.47 | 1470–1512 | 1.75 | tavern2 (loop) | medium | Zoro turns for the door; the crate sweeps a shelf of bottles. Boss dives, catches all four, no spill, grins. | Boss protects his margin. | **Boss:** “Ten percent of those is mine.” | — | op100 096_whoosh_swing_throw (whoosh) | tavern bed |
| 1.48 | 1512–1546 | 1.42 | tavern2 (loop) | close | Nami, calculator up to her face, types. The display reads: DOUBLE? | Last word before the door. | **Nami:** “Tick tock.” | CALCULATOR: DOUBLE? | — | tavern bed |
| 1.49 | 1546–1574 | 1.17 | tavern2 (loop) | medium | Zoro heads for the cupboard again. Luffy's rubber arm reaches across the room, takes him by the shoulders, and rotates him toward the actual door. | Luffy is the only reliable navigation in the building. | **Luffy:** “Other way.” | — | op100 002_luffy_arm_retract (whoosh) | tavern bed |
| 1.50 | 1574–1602 | 1.17 | tavern2 (loop) | medium | REACTION CUT-AWAY: Boss waving a bar towel; Nami beside him holding a tiny card to camera that just says 10%, then flipping it to show '...of what?' | The question the finale answers. | **Boss:** “Come back RICH!” | CARD: 10% → ...of what? | — | tavern bed |
| 1.51 | 1602–1630 | 1.17 | tavern2 (still; wall) | close | SUN-CLOCK: sun disc at the DAWN→MORNING mark; light through the door goes from pink to gold. | Act 1 clock reading, final. | — | SUN-CLOCK: early morning | — | tavern bed |
| 1.52 | 1630–1680 | 2.08 | tavern2 (loop; door, camera inside looking out) | wide | LAST FRAME: Zoro walks out through the tavern door into gold morning light, crate on his shoulder, poster in his belt; the Boss waving behind the bar; the door sign swings and flips OPEN → BACK IN 10 MIN. Hold on the sign as the act ends. | JOIN → Act 2 opens on Zoro walking down the street with the crate. | — | DOOR SIGN: BACK IN 10 MIN \| COUNTER (corner receipt): 300,000,000 B | op100 067_scenery_switch_1 (whoosh) on the sign flip | tavern bed resolves, 50 ms fade to clean end |

## ACT 2 — JOB 1: THE DELIVERY

*street → desert → snow → jungle → sea → volcano → buffet, morning → noon.* Frames 0–1680 within the act (70.0 s). 47 shots, 15 sound effects, 1 white-on-black impact flash, 4 reaction cut-aways. Shot 47 is the join into Act 3.

| # | frames | s | plate | camera | in frame / pose / expression | action beat | bubbles (≤ 6 words, ≤ 2) | on-screen text / counter / sun | sfx (.sfx/op100) | music |
|---|---|---|---|---|---|---|---|---|---|---|
| 2.1 | 0–46 | 1.92 | market2 (loop; morning, sun low camera-right) | wide | FIRST FRAME = continuity: Zoro walking down a market street, crate on shoulder, slip fluttering on the string, stall cloths already moving. Act card drops in over the walk. | Open mid-stride, bright and busy. | — | ACT CARD: JOB 1 — THE DELIVERY \| COUNTER (corner): 300,000,000 B \| SUN: low, morning | op100 061_zoro_footsteps_a (footsteps) | silence (street ambience only) |
| 2.2 | 46–78 | 1.33 | market2 (still; slip fills frame) | extreme close | The slip: MARINEFORD CAKE SHOP · 5 MIN · ← LEFT. The arrow is enormous. | The question of the act, on paper. | — | TEXT CARD under it: FIVE MINUTES. HOW HARD CAN IT BE? | — | silence |
| 2.3 | 78–110 | 1.33 | market2 (loop) | close | Zoro reads it, nods, satisfied. Says the word. Turns RIGHT. | He read it correctly. He executed it wrong. | **Zoro:** “Left.” | — | — | silence |
| 2.4 | 110–148 | 1.58 | market2 (loop) | medium | Fruit vendor leans out of his stall and points left, helpfully, with a banana. | Help, refused by instinct. | **Vendor:** “Cake shop's left, sir.”<br>**Zoro:** “Thanks.” | — | — | silence |
| 2.5 | 148–180 | 1.33 | market2 (loop; flipped, shop front dressed camera-left) | wide | REACTION CUT-AWAY: the Cake Shop, thirty metres away. The Clerk (Boss's cousin — same curls, blue apron) waits at the door holding an egg-timer. | Thirty metres. Five minutes. | **Clerk:** “Five minutes, he said.” | SHOP SIGN: MARINEFORD CAKE SHOP | — | silence |
| 2.6 | 180–212 | 1.33 | market2 (loop) | medium | Zoro walks past the shop's back wall. A painted arrow on it: CAKE SHOP →. He goes ←, crate scraping the arrow off. | Last chance, declined. | — | — | — | silence |
| 2.7 | 212–250 | 1.58 | desert (loop; heat shimmer, hard noon-ish light) | wide | HARD CUT. Desert. Zoro mid-stride, crate on shoulder, no transition, no explanation. A single cactus. | The 'Zoro Gets Lost' hard cut, with a crate. | **Zoro:** “Shortcut.” | SUN: climbing | op100 067_scenery_switch_1 (whoosh) | silence |
| 2.8 | 250–282 | 1.33 | desert (still; crate close) | close | The crate's THIS WAY UP arrow now points straight DOWN. Something inside shifts with a soft squish. | Cake, upside down, in a desert. | — | — | — | silence |
| 2.9 | 282–320 | 1.58 | desert (loop) | medium | Zoro sits on the crate to think, chin on fist. The crate creaks and slowly sinks an inch. Squish. | He is sitting on 100,000,000 berries of cake. | **Zoro:** “Think.” | — | — | silence |
| 2.10 | 320–358 | 1.58 | desert (loop) | medium | A vulture lands on the crate. Zoro asks it directions. It points a wing. Zoro stands and goes the other way. The vulture shrugs. | Running gag: everyone points, Zoro goes opposite. | **Zoro:** “Which way's Marineford?” | — | — | silence |
| 2.11 | 358–390 | 1.33 | tavern2 (loop) | medium | REACTION CUT-AWAY: Nami at the bar, chin on hand, watching the sun-clock. Boss polishing a glass. | Ten minutes in. | **Nami:** “Ten minutes.”<br>**Boss:** “Rounding error.” | SUN-CLOCK: morning (sun a quarter along) | — | silence |
| 2.12 | 390–428 | 1.58 | desert2 (still; desaturated, white-blue grade, snow particles overlay = SNOW) | wide | Snowfield. Zoro blue in the face, icicle on the nose, sitting on the crate again — now a sled at the top of a slope. | Snow, one setting over from desert. | **Zoro:** “Downhill is a direction.” | — | op100 067_scenery_switch_2 (whoosh) | silence |
| 2.13 | 428–460 | 1.33 | desert2 (still; same grade, fast push-in) | medium | Zoro shoves off. Crate-sled rockets downhill, Zoro riding it standing, swords out for balance. | Speed. | — | — | op100 098_windy_fall (whoosh) | silence |
| 2.14 | 460–500 | 1.67 | jungle (loop) | wide | Jungle. The sled bursts out of a snowbank that should not be there and skids to a stop in ferns. Zoro steps off, brushes snow off the crate. Two yellow eyes in the leaves behind him. | The dino from the Lost short, back. | — | — | — | silence |
| 2.15 | 500–540 | 1.67 | jungle (loop; low angle) | low | The T-rex rises out of the ferns, ROARS, teeth everywhere. Zoro turns, looks up, unmoved. | He asks the dinosaur for directions. | **Zoro:** “Cake shop?” | — | op100 074_conqueror_haki (haki, as the roar) | silence |
| 2.16 | 540–572 | 1.33 | jungle (loop) | medium | The dino, thrown, points a tiny arm left. Zoro nods and goes right. | Running gag, beat 3. | **Zoro:** “Thanks.” | — | — | silence |
| 2.17 | 572–604 | 1.33 | jungle (loop) | close | The dino's face: offence. Then it charges. | YAKETY SAX IN on the first step of the charge. | — | — | op100 097_sudden_alert (sting) | YAKETY SAX starts (riff onset aligned to this cut) |
| 2.18 | 604–650 | 1.92 | jungle (loop; tilted 10°, fast pan) | tilted | Chase down a jungle hill: the crate bounces loose and slides ahead, Zoro sprinting after it, dino behind, trees whipping by. | The Yakety chase. | **Zoro:** “MY crate!” | — | op100 051_people_running (running) | Yakety Sax |
| 2.19 | 650–682 | 1.33 | jungle (loop) | medium | Crate hits a rock, flips in the air; Zoro dives, catches it on his back like a stuntman, keeps running on all fours. | Save. | — | — | — | Yakety Sax |
| 2.20 | 682–714 | 1.33 | jungle (loop) | close | The dino snaps at the crate and bites a corner clean off. CREAM on its teeth. Its pupils dilate with joy. | Everyone except Zoro knows it's cake now. | — | — | op100 012_cut_into_flesh (bite) | Yakety Sax |
| 2.21 | 714–746 | 1.33 | jungle (loop) | medium | The dino now chases the CRATE, tongue out, not Zoro. Zoro hugs it tighter and runs faster. | A new motive. | **Zoro:** “You can't deliver it!” | — | — | Yakety Sax |
| 2.22 | 746–786 | 1.67 | stormsea (loop) | wide | Zoro on a plank at sea, crate as a boat beside him, paddling with a sword. The dino on the shoreline behind, crying, waving a tiny arm. | Lost at sea, by choice. | **Dino:** “Come baaack...” | SUN: mid-morning | — | Yakety Sax |
| 2.23 | 786–818 | 1.33 | stormsea (loop) | close | Zoro points confidently at the horizon with the sword, then paddles the exact opposite way. | Running gag, beat 4 — he can't even follow himself. | **Zoro:** “Marineford's... that way.” | — | — | Yakety Sax |
| 2.24 | 818–850 | 1.33 | stormsea (loop) | medium | A seagull lands on the crate, opens its beak to point. | He has learned nothing, but he has learned to hate the pointing. | **Zoro:** “Don't.” | — | — | Yakety Sax fades under |
| 2.25 | 850–882 | 1.33 | tavern2 (loop) | medium | REACTION CUT-AWAY: Nami adds a line to the receipt in pen. Boss reads it over her shoulder and winces. | The receipt grows even before the bill does. | **Nami:** “Late fee: pending.” | COUNTER: 300,000,000 B (late fee pending) \| SUN-CLOCK: late morning | — | silence |
| 2.26 | 882–922 | 1.67 | desert2 (still; flipped, red/orange grade, ash particles overlay, lava glow bottom = VOLCANO) | wide | Volcano rim. Zoro standing on a lava rock, crate on his shoulder, steam rising off it. He sniffs the steam. | The crate is now a baking cake. | **Zoro:** “Warm.” | — | — | silence |
| 2.27 | 922–954 | 1.33 | desert2 (still; same grade) | close | Zoro's nose at the crate's bitten corner. A sweet steam curls out, drawn as a little cartoon ribbon. | The headfake: he nearly gets it. | **Zoro:** “Is this... cake?” | — | — | silence |
| 2.28 | 954–986 | 1.33 | desert2 (still; same grade) | medium | He shakes the crate. Squelch. He nods, satisfied. | Headfake knocked down. | **Zoro:** “No. Bricks.” | — | — | silence |
| 2.29 | 986–1026 | 1.67 | harbour (loop) | wide | Harbour. Zoro walks up a jetty under a two-way signpost: BUFFET ← · CAKE SHOP →. He studies both. Goes LEFT. | The final wrong turn of the act. | — | SIGNPOST: BUFFET ← / CAKE SHOP → | op100 067_scenery_switch_1 (whoosh) | silence |
| 2.30 | 1026–1058 | 1.33 | canteen (loop; flipped, warm grade, buffet trays dressed in the foreground) | wide | The buffet restaurant. Zoro kicks the door open with the crate held high. | Delivery, finally. Wrong place. | **Zoro:** “DELIVERY!” | — | — | silence |
| 2.31 | 1058–1090 | 1.33 | canteen (loop; flipped, warm) | medium | Luffy at a table behind forty stacked plates, fork still in his mouth, eyes become cake. | He was promised cake in Act 1. | **Luffy:** “CAKE!” | — | — | silence |
| 2.32 | 1090–1122 | 1.33 | canteen (loop; flipped, warm) | medium | Luffy's rubber arm stretches across the room and snatches the crate off Zoro's shoulder. | Theft, at distance. | — | — | op100 001_luffy_arm_stretch (whoosh) | silence |
| 2.33 | 1122–1162 | 1.67 | canteen (loop; flipped, warm) | close | Luffy rips the lid off. A five-tier cake, candles, and piped on top: HAPPY BIRTHDAY ADMIRAL AKAINU. | Reveal: it was the admirals' cake. (Act 3 callback is loaded.) | — | CAKE TEXT: HAPPY BIRTHDAY ADMIRAL AKAINU | op100 028_enemy_intro_sting_1 (sting) | silence |
| 2.34 | 1162–1194 | 1.33 | canteen (loop; flipped, warm) | medium | Luffy's mouth opens to the size of the cake. One bite. WHITE-ON-BLACK IMPACT FLASH (3 frames) on the chomp. | IMPACT FLASH #1 of the act. | — | — | op100 092_jet_pistol_punch (impact) | silence |
| 2.35 | 1194–1226 | 1.33 | canteen (loop; flipped, warm) | close | Luffy's burp blows Zoro's hair back and leaves crumbs on his face. The empty crate rocks on the floor. | The delivery is complete, technically. | — | — | op100 009_character_pushed_back (impact) | silence |
| 2.36 | 1226–1266 | 1.67 | canteen (loop; flipped, warm; door side) | medium | The Clerk bursts in, red-faced, panting, egg-timer ringing in his fist. He has clearly run the thirty metres many times. | The clerk arrives from the right place. | **Clerk:** “FIVE. MINUTES.” | — | — | silence |
| 2.37 | 1266–1298 | 1.33 | canteen (loop; flipped, warm) | close | The Clerk sees the crumbs, the crate, Luffy. His face crumples. Fat anime tears. | Grief. | **Clerk:** “That was Akainu's birthday cake.” | — | — | silence |
| 2.38 | 1298–1338 | 1.67 | canteen (loop; flipped, warm) | medium | Zoro, crumbs on his cheek, points at Luffy as proof of delivery. | A technicality, delivered with confidence. | **Zoro:** “I delivered it.”<br>**Clerk:** “To LUFFY.” | — | — | silence |
| 2.39 | 1338–1370 | 1.33 | canteen (loop; flipped, warm) | close | Luffy thumbs-up, cream on his nose. | Confirmation from the recipient. | **Luffy:** “Delivered.” | — | — | silence |
| 2.40 | 1370–1410 | 1.67 | canteen (loop; flipped, warm) | close | The Clerk writes a bill on his apron pocket pad, sniffing. Line items appear as he writes. | The bill. | **Clerk:** “Cake. Crate. Emotional damages.” | BILL: CAKE 4,000,000 · CRATE 500,000 · TEARS 500,000 | — | silence |
| 2.41 | 1410–1442 | 1.33 | canteen (still; receipt fills frame) | extreme close | Nami's receipt in Zoro's haramaki. The counter ticks UP: 300,000,000 → 305,000,000. | The number goes the wrong way. Audience: 'wait—' | — | COUNTER: 300,000,000 → 305,000,000 B | op100 069_terror_sting (sting) | silence |
| 2.42 | 1442–1482 | 1.67 | canteen (loop; flipped, warm) | medium | Zoro holds the bill at arm's length like it's a snake. The Clerk shrugs, curls bouncing exactly like the Boss's. | Family business. | **Zoro:** “It goes UP?”<br>**Clerk:** “Cousin rate.” | — | — | silence |
| 2.43 | 1482–1522 | 1.67 | tavern2 (loop) | medium | REACTION CUT-AWAY: the Boss on a snail-phone behind the bar, listening, eyes going to berry signs, counting on fingers. | 10% of everything includes the bill. | **Boss:** “Ten percent of five million...” | — | — | silence |
| 2.44 | 1522–1554 | 1.33 | tavern2 (still; wall) | close | SUN-CLOCK: the sun disc near the top of its arc. Nami's hand in frame, tapping it. | Nearly noon. | — | SUN-CLOCK: late morning → noon | — | silence |
| 2.45 | 1554–1586 | 1.33 | canteen (loop; flipped, warm) | medium | Luffy wipes his nose with the back of his hand, misses the cream completely, leans in. | Luffy, helpful. | **Luffy:** “Any more jobs?” | — | — | silence |
| 2.46 | 1586–1618 | 1.33 | canteen (loop; flipped, warm) | close | Zoro's hand tightens on the bill. His eye twitches toward the poster in his belt: BIG PIG BEN. | Act 3 is in his belt. | **Zoro:** “One more.” | — | — | silence |
| 2.47 | 1618–1680 | 2.58 | canteen (loop; flipped, warm; slow push-in) | medium | LAST FRAME: Zoro, crumbs on his face, slowly turning his head to read the bill one more time; Luffy behind him waving at camera with cream on his nose; the empty crate on its side. Hold. | JOIN → Act 3 opens on Zoro at a crossroads with the poster. | — | COUNTER (corner): 305,000,000 B \| SUN: high | op100 040_ridicule_sting (sting), then clean 50 ms fade | silence |

## ACT 3 — JOB 2: THE BOUNTY

*crossroads → Marine canteen, noon → afternoon.* Frames 0–1680 within the act (70.0 s). 48 shots, 15 sound effects, 1 white-on-black impact flash, 5 reaction cut-aways. Shot 48 is the join into Act 4.

| # | frames | s | plate | camera | in frame / pose / expression | action beat | bubbles (≤ 6 words, ≤ 2) | on-screen text / counter / sun | sfx (.sfx/op100) | music |
|---|---|---|---|---|---|---|---|---|---|---|
| 3.1 | 0–48 | 2.00 | market2 (loop; flipped, dressed with a four-arm signpost — every arm reads MARINE CANTEEN) | wide | FIRST FRAME: Zoro at a crossroads, BIG PIG BEN poster held up to the sun, Ben's pig-ear shadow visible on the poster. Noon light, no shadows on the ground. Act card drops in. | Open on movement: the poster flaps, the sign creaks. | — | ACT CARD: JOB 2 — THE BOUNTY \| COUNTER (corner): 305,000,000 B \| SUN: overhead (NOON) | op100 028_enemy_intro_sting_1 (sting) | quiet (wind, one tension drone) |
| 3.2 | 48–78 | 1.25 | market2 (still; poster fills frame) | extreme close | The poster: WANTED · BIG PIG BEN · 150,000,000. Look closely: the first '1' and the last seven zeros are in two different inks. | Question card over it. | — | TEXT CARD: HOW DO YOU TRACK A PIRATE... WITH NO SENSE OF DIRECTION? | — | quiet |
| 3.3 | 78–108 | 1.25 | market2 (loop; flipped) | close | Zoro, poster lowered, surveying the signpost: four arms, four MARINE CANTEENs. He looks at the fifth direction — the one with no sign. | Of course. | **Zoro:** “Pirates hide where it's loud.” | — | — | quiet |
| 3.4 | 108–148 | 1.67 | market2 (loop; flipped; high angle) | wide | High angle: Zoro walks a perfect circle in the dust, footprints closing on themselves. He looks down at the footprints. | Tracking. | **Zoro:** “Fresh tracks.” | — | op100 062_zoro_footsteps_b (footsteps) | quiet |
| 3.5 | 148–188 | 1.67 | market2 (loop; flipped) | medium | Circle two. A barrel at the edge of the circle. Inside it: BIG PIG BEN — a tiny pig-faced pirate the size of a cat, hat too big, sweating buckets, peeking through a knot-hole. | Reveal of the target to the audience, not to Zoro. | — | — | op100 086_funny_sudden_appearance_1 (sting) | quiet |
| 3.6 | 188–218 | 1.25 | market2 (loop; flipped) | close | Zoro passes the barrel. Passes it again. A third time. Ben relaxes and wipes his brow. | Ben learns the pattern faster than Zoro. | **Ben:** “Oink...” | — | — | quiet |
| 3.7 | 218–258 | 1.67 | market2 (loop; flipped) | medium | Zoro lunges — and lifts a CAT by the scruff. The cat, bored, points a paw. Zoro sets it down and goes the other way. | Running gag, beat 5: even the cat points. | **Zoro:** “Found you.”<br>**Zoro:** “...Not you.” | — | — | quiet |
| 3.8 | 258–288 | 1.25 | market2 (loop; flipped) | wide | Zoro marches off-sign, straight through a doorway marked KITCHEN — DELIVERIES. Ben, in his barrel, rolls the OTHER way... through the canteen's front door. | Both arrive, from both ends. | — | — | — | quiet |
| 3.9 | 288–336 | 2.00 | canteen (loop; cool grade, Marine banners dressed) | wide | The Marine canteen. Admirals at breakfast: AKAINU in a paper party hat before an empty cake stand, arms folded; KUZAN asleep on a stack of pancakes; KIZARU buttering one slice of toast very, very slowly. | The admirals' breakfast, the morning after a cake didn't arrive. | — | — | op100 029_enemy_intro_sting_2 (sting) | quiet (drone up a notch) |
| 3.10 | 336–366 | 1.25 | canteen (loop) | close | Akainu, under the party hat, lava-eyed. | The cake callback lands. | **Akainu:** “Where. Is. My. Cake.” | — | — | quiet |
| 3.11 | 366–396 | 1.25 | canteen (loop; kitchen door) | medium | Zoro enters through the kitchen door carrying a tray he picked up by accident. Poster raised. | Wrong door, right room. | **Zoro:** “Big Pig Ben. Dead or alive.” | — | — | quiet |
| 3.12 | 396–426 | 1.25 | canteen (loop) | close | Behind the admirals' TOASTER, Ben's pig ears rise, see Zoro, and sink back down. | Hiding in plain sight. | — | — | — | quiet |
| 3.13 | 426–466 | 1.67 | canteen (loop) | medium | Kizaru lowers his toast, head tilt, speaking at glacial speed. | Kizaru's cadence in a bubble. | **Kizaru:** “Ohh... a swordsman. At breakfast.”<br>**Kuzan:** “Zzz... dessert.” | — | — | quiet |
| 3.14 | 466–496 | 1.25 | canteen (loop) | close | Zoro spots a curly tail poking out behind the toaster. Eyes lock. | Target acquired. | **Zoro:** “There.” | — | — | quiet |
| 3.15 | 496–536 | 1.67 | canteen (loop; tilted 8°) | tilted | Zoro vaults the admirals' table — through the pancakes, over Kuzan — lunging at the toaster. | The fight starts over breakfast. | — | — | op100 047_jump (whoosh) | tension sting |
| 3.16 | 536–576 | 1.67 | canteen (loop) | medium | Kizaru, not standing up, fires a lazy LIGHT BEAM from one finger. It hits the toaster. Both slices pop. Ben pops with them. | Ben launched by toast. | **Kizaru:** “Ohh... my toaster.” | — | op100 108_pacifista_laser (beam) | quiet |
| 3.17 | 576–606 | 1.25 | canteen (loop) | close | Ben lands on Akainu's head, on top of the party hat. Akainu's eyes roll up to look at it. | A pig on the admiral. | **Akainu:** “...Is that a pig.” | — | — | quiet |
| 3.18 | 606–646 | 1.67 | canteen (loop) | medium | Zoro draws two swords and swings; Kuzan, STILL ASLEEP, exhales and the floor freezes solid. Zoro's swing becomes a slide. | Kuzan fights unconscious. | — | — | op100 115_aokiji_ice_age (ice) | quiet |
| 3.19 | 646–686 | 1.67 | canteen (loop; low angle on the floor) | low | Zoro slides across the ice, spinning, and knocks the table up. The empty cake stand flips onto Akainu's lap. | The empty cake stand. Insult. | **Akainu:** “EMPTY.” | — | — | quiet |
| 3.20 | 686–716 | 1.25 | canteen (loop) | medium | Akainu stands. Magma fist. The table melts into a puddle around the admirals' chairs. The chairs are fine. | Magma, applied to furniture. | — | — | op100 008_explosion (impact) | quiet |
| 3.21 | 716–746 | 1.25 | tavern2 (loop) | medium | REACTION CUT-AWAY: Nami at the bar, calculator face-up. The sun-clock behind her: sun dead centre. | Noon, stated. | **Nami:** “Noon. Halfway.”<br>**Boss:** “Halfway to double!” | SUN-CLOCK: NOON \| CALCULATOR: ×2 AT SUNSET | — | quiet |
| 3.22 | 746–776 | 1.25 | tavern2 (loop; bar end) | close | REACTION CUT-AWAY: the Boss, whistling, drawing with a felt pen on a paper we don't see. Adds a flourish. Caps the pen. | Seed for the reveal: the pen. | — | — | — | quiet |
| 3.23 | 776–816 | 1.67 | canteen (loop) | medium | Fight escalates: Kizaru's beam ricochets off Kuzan's ice wall; Ben sprints the length of the counter knocking over every coffee; Zoro slashes a beam in half. | Three admirals, one pig, one swordsman. | — | — | op100 024_sword_multiple_clashes_1 (clash) | tension sting |
| 3.24 | 816–846 | 1.25 | canteen (loop) | close | Ben, cornered on the coffee machine, holds up a tiny white flag. Zoro doesn't see it; he's looking the wrong way. | Ben surrenders to nobody. | **Ben:** “Oink?!” | — | — | quiet |
| 3.25 | 846–876 | 1.25 | canteen (loop) | medium | Kuzan, asleep, rolls over; the ice spreads up the wall. Kizaru's beam melts a hole in it. Akainu's magma fills the hole. The three attacks are now one object. | The admirals accidentally build a wall. | — | — | — | quiet |
| 3.26 | 876–914 | 1.58 | canteen (loop; low, hero angle) | low | Zoro takes the three-sword stance, third sword in his teeth, poster still tucked in his belt. | Setup for the flash. | **Zoro:** “Three-sword—”<br>**Akainu:** “Not at breakfast.” | — | — | quiet (drone cuts out) |
| 3.27 | 914–952 | 1.58 | canteen (loop) | wide | ONE SLASH through beam, ice, magma and what's left of the table. WHITE-ON-BLACK IMPACT FLASH (3 frames) on the cut. The canteen splits in two halves that lean apart. | IMPACT FLASH #1 of the act, the biggest cut of the video. | — | — | op100 019_sword_powerful_cut (slash) | silence |
| 3.28 | 952–990 | 1.58 | canteen (loop; wide, both halves) | wide | Aftermath: two halves of a canteen, sky between them. The admirals in their three chairs, untouched, each holding a coffee. Kuzan still asleep. Ben dangling from Zoro's fist by the collar. | Everything cut except the people. | **Kizaru:** “Ohh... open plan.” | SUN: just past overhead, through the gap | — | silence |
| 3.29 | 990–1020 | 1.25 | canteen (loop) | close | Ben, upside-down in Zoro's grip, drops a tiny coin purse. It lands with one 'plink'. | One plink. Not a jingle. | — | — | op100 102_cave_waterdrop_1 (plink) | silence |
| 3.30 | 1020–1058 | 1.58 | canteen (still; purse fills frame) | extreme close | Zoro opens the purse. Inside: ONE coin stamped 50 B. The purse's label: BOUNTY — PAID IN FULL. | The bounty. | — | COIN: 50 B | — | silence |
| 3.31 | 1058–1088 | 1.25 | canteen (still; poster fills frame) | extreme close | The poster, close. The zeros smear under Zoro's thumb. Beneath the felt-pen '150,000,000' the printed number is: 50. | The reveal. | — | POSTER: 1̶5̶0̶,̶0̶0̶0̶,̶0̶0̶0̶ → 50 | op100 033_flashback_sting_1 (sting) | silence |
| 3.32 | 1088–1126 | 1.58 | tavern2 (loop; sepia 'flashback' grade) | medium | FLASHBACK CUT-AWAY: the Boss, this morning, adding seven zeros to the poster with a felt pen, whistling, then sliding it away from Nami. | Explains Act 1's 'coincidence'. | **Boss:** “Nobody chases a fifty-berry pig.” | — | — | silence |
| 3.33 | 1126–1156 | 1.25 | canteen (loop) | close | Zoro stares at the coin. Ben, still dangling, stares at Zoro. | A long stare for one coin. | **Zoro:** “Fifty.”<br>**Ben:** “Oink.” | — | — | silence |
| 3.34 | 1156–1194 | 1.58 | canteen (loop) | medium | Kizaru drifts over at the speed of light (which for him is a slow walk) and hands Zoro a long bill. | The admirals itemise. | **Kizaru:** “Ohh... itemised.” | BILL HEADER: CANTEEN DAMAGES — 100,000,000 B | — | silence |
| 3.35 | 1194–1232 | 1.58 | canteen (still; bill) | extreme close | The bill: TABLE 10,000,000 · WALL 40,000,000 · OTHER WALL 40,000,000 · TOASTER 9,999,950 · TOAST 50. | The toast costs exactly the bounty. | — | BILL: ...TOAST 50 | — | silence |
| 3.36 | 1232–1270 | 1.58 | canteen (loop) | medium | Akainu, party hat singed, adds one line with a magma finger. | The cake, again. | **Akainu:** “Plus the cake.”<br>**Zoro:** “That was Luffy.” | — | — | silence |
| 3.37 | 1270–1300 | 1.25 | canteen (loop) | close | Akainu, final word, hat smoking. | The universal law. | **Akainu:** “Everything is Luffy.” | — | — | silence |
| 3.38 | 1300–1338 | 1.58 | canteen (still; receipt fills frame) | extreme close | Nami's receipt: the counter rolls 305,000,000 → 405,000,000. The digits turn redder. | The counter, worst so far. | — | COUNTER: 305,000,000 → 405,000,000 B | op100 070_terrifying_moment_sting (sting) | silence |
| 3.39 | 1338–1368 | 1.25 | tavern2 (loop) | close | REACTION CUT-AWAY: Nami's calculator smokes. She blows on it, cool. | She felt it from here. | **Nami:** “Someone's spending.” | — | — | silence |
| 3.40 | 1368–1398 | 1.25 | canteen (loop) | medium | Kuzan wakes up, looks at the sky where the ceiling was. | He missed it. | **Kuzan:** “Did I miss it?” | — | — | silence |
| 3.41 | 1398–1428 | 1.25 | canteen (loop) | close | Kuzan falls back asleep mid-blink. Pancakes frost over. | He missed it. | — | — | — | silence |
| 3.42 | 1428–1466 | 1.58 | canteen (loop) | medium | Zoro sits down in the rubble, legs out, swords across his lap. Ben climbs his shirt and settles on his head like a hat. | The team is formed. | — | — | — | silence |
| 3.43 | 1466–1496 | 1.25 | canteen (loop) | close | Ben, on Zoro's head, strains. A coin drops from under his tail onto Zoro's knee. Plink. 50 B. | Running gag locked: Ben makes 50-berry coins. | **Zoro:** “...Tip.” | COIN: 50 B | op100 103_cave_waterdrop_2 (plink) | silence |
| 3.44 | 1496–1526 | 1.25 | tavern2 (still; wall) | close | SUN-CLOCK: the sun disc past the top, sliding down toward the red SUNSET mark. Nami's finger taps it. | Afternoon. | **Nami:** “Four hours.” | SUN-CLOCK: AFTERNOON | — | silence |
| 3.45 | 1526–1564 | 1.58 | tavern2 (loop) | medium | REACTION CUT-AWAY: the Boss, counting on his fingers, delighted beyond reason. | 10% of 50 is 5. He is thrilled. | **Boss:** “Ten percent of fifty... five!”<br>**Boss:** “Five whole berries!” | — | — | silence |
| 3.46 | 1564–1594 | 1.25 | canteen (loop; wide, the gap in the wall) | wide | Through the cut in the canteen wall, the sun is visibly lower and the light has gone orange. Dust drifts. | Time is moving in the background of a joke. | — | SUN: low, orange, through the gap (AFTERNOON) | — | silence |
| 3.47 | 1594–1624 | 1.25 | canteen (loop) | close | Zoro looks at the coin on his knee, then at the receipt, then at the sun. | The maths does not work. | **Zoro:** “Four hundred million short.” | COUNTER: 405,000,000 B | — | silence |
| 3.48 | 1624–1680 | 2.33 | canteen (loop; slow push-in) | medium | LAST FRAME: Zoro sitting in the rubble, Ben on his head mid-plink, another 50 B coin falling; the sun low and orange behind him through the gap in the wall. Hold. | JOIN → Act 4 opens on Zoro slumped on the dock, afternoon. | — | COUNTER (corner): 405,000,000 B \| SUN: afternoon | op100 104_cave_waterdrop_3 (plink), then clean 50 ms fade | silence |

## ACT 4 — SUNSET

*dock → the lost worlds → hidden island → sea → tavern, afternoon → sunset.* Frames 0–1680 within the act (70.0 s). 50 shots, 15 sound effects, 1 white-on-black impact flash, 2 reaction cut-aways. Shot 50 is the join into Act —.

| # | frames | s | plate | camera | in frame / pose / expression | action beat | bubbles (≤ 6 words, ≤ 2) | on-screen text / counter / sun | sfx (.sfx/op100) | music |
|---|---|---|---|---|---|---|---|---|---|---|
| 4.1 | 0–48 | 2.00 | sunsetdock (loop; afternoon grade, sun camera-right above the water) | wide | FIRST FRAME: Zoro slumped on the dock edge, legs over the water, Ben on his head, swords leaning on a bollard. Boats bobbing, sun already dropping. Act card drops in. | Open on water, light, movement. | — | ACT CARD: SUNSET \| COUNTER (corner): 405,000,000 B \| SUN: low, afternoon | — | quiet (gulls, water) |
| 4.2 | 48–80 | 1.33 | sunsetdock (still; sun fills frame) | extreme close | The sun, a hand's width above the horizon. Push in. | The question card. | — | TEXT CARD: 405,000,000 BERRIES. 90 MINUTES. HOW? | op100 069_terror_sting (sting) | quiet |
| 4.3 | 80–112 | 1.33 | tavern2 (still; wall) | close | CUT-AWAY: Nami's sun-clock on the tavern wall, the sun disc four-fifths along, ticking. Nami's reflection in the brass, polishing her calculator. | The clock, ticking. | — | SUN-CLOCK: four-fifths to SUNSET | — | quiet |
| 4.4 | 112–144 | 1.33 | sunsetdock (loop) | close | Zoro, eyes shut, thinking. Ben, on his head, also eyes shut, thinking. | Two minds. | **Zoro:** “Think.”<br>**Ben:** “Snort.” | — | — | quiet |
| 4.5 | 144–184 | 1.67 | sunsetdock (loop) | medium | Zoro lays out his assets on the dock: one 50 B coin, three swords, one pig. He looks at a sword. The swords RATTLE in their sheaths, offended. | The swords have opinions. | **Zoro:** “Sell a sword?”<br>**Zoro:** “...No.” | — | op100 011_sword_twisting (sword rattle) | quiet |
| 4.6 | 184–216 | 1.33 | sunsetdock (loop) | close | Ben nudges the 50 B coin toward Zoro with his snout. Zoro picks it up, pockets it. | The coin travels with him. | — | — | — | quiet |
| 4.7 | 216–256 | 1.67 | sunsetdock (loop; low angle) | low | Zoro stands, eyes shut, spins once, and POINTS. Ben points the other way with a trotter. | Pick a direction. | **Zoro:** “Pick a direction.” | — | — | quiet |
| 4.8 | 256–288 | 1.33 | sunsetdock (loop) | medium | Zoro opens his eyes, looks at his own finger, and walks the opposite way from it. | Running gag, beat 6: he overrules himself. | **Zoro:** “Instinct.” | — | — | quiet |
| 4.9 | 288–320 | 1.33 | desert (loop; 1 s) | wide | QUICK REVISIT 1: desert. The crate-shaped dent is still in the sand. Zoro walks past it without stopping, Ben on head. | Montage, one second each. Each world has a scar from Act 2. | — | — | op100 067_scenery_switch_1 (whoosh) | YAKETY SAX starts (riff onset aligned to this cut) |
| 4.10 | 320–352 | 1.33 | desert2 (still; snow grade; 1 s) | wide | QUICK REVISIT 2: snow. The sled track down the hill. Zoro slides down it standing, not looking. | Montage 2. | — | — | — | Yakety Sax |
| 4.11 | 352–384 | 1.33 | jungle (loop; 1 s) | wide | QUICK REVISIT 3: jungle. The dino waves a tiny arm, crumbs still on its teeth, no chase. Zoro waves back. | Montage 3 — the dino is a friend now. | **Dino:** “Cake shop's left!” | — | — | Yakety Sax |
| 4.12 | 384–414 | 1.25 | stormsea (loop; 1 s) | wide | QUICK REVISIT 4: the plank at sea. The seagull is sitting on it waiting. Zoro walks straight past the plank, across the shallows. | Montage 4. | — | — | — | Yakety Sax |
| 4.13 | 414–444 | 1.25 | desert2 (still; volcano grade; 1 s) | wide | QUICK REVISIT 5: the volcano rim. Zoro walks past a lava rock that still smells of cake. Ben sniffs it. | Montage 5. | — | — | — | Yakety Sax fades under |
| 4.14 | 444–484 | 1.67 | jungle2 (loop; gold grade, sparkle particle overlay = HIDDEN ISLAND) | wide | A hidden lagoon. Everything glitters. On a rock in the middle: a TREASURE CHEST, glowing, under a hand-painted sign: DO NOT. | The wrong way led here. (It always does.) | **Zoro:** “Huh.” | SUN: low, gold | — | quiet (drone) |
| 4.15 | 484–514 | 1.25 | jungle2 (still; chest) | close | The chest: gold leaking out the seams. The sign: DO NOT. Nothing else written. The rest of the sentence is in the water. | A warning with the important half missing. | — | SIGN: DO NOT | — | quiet |
| 4.16 | 514–554 | 1.67 | stormsea (loop; composited behind jungle2 foreground, low angle) | low | The SEA KING rises out of the lagoon behind the chest, water sheeting off it, teeth the size of doors. Ben dives into Zoro's haramaki. | The Act 1-of-the-channel enemy, back. | — | — | op100 027_enemy_intro_attack_cliffhanger (sting) | quiet |
| 4.17 | 554–584 | 1.25 | stormsea (loop; composited) | close | Zoro, hand on hilt, looks up. Not scared. Mildly tired. | Callback to 'Zoro's Biggest Fear': the Sea King is nothing. | **Zoro:** “You again.”<br>**Sea King:** “...YOU again.” | — | — | quiet |
| 4.18 | 584–614 | 1.25 | stormsea (loop; composited) | medium | The Sea King points a fin at the chest and then at itself. | Everyone points at things in this video. | **Sea King:** “Treasure's mine.” | — | — | quiet |
| 4.19 | 614–654 | 1.67 | stormsea (loop; composited) | wide | One slash. WHITE-ON-BLACK IMPACT FLASH (3 frames). The Sea King... keeps standing. Its hair — a tall seaweed quiff — falls off into the water. It touches its head. Mortified. | IMPACT FLASH #1 of the act: he didn't kill it, he gave it a haircut. | — | — | op100 022_sword_flying_slice (slash) | silence |
| 4.20 | 654–684 | 1.25 | jungle2 (loop; gold) | medium | Zoro grabs the chest under one arm and RUNS. Straight into the lagoon. | Wrong way, with treasure. | **Zoro:** “Tavern. TAVERN.” | — | op100 096_whoosh_swing_throw (whoosh) | YAKETY SAX back in (riff onset on this cut) |
| 4.21 | 684–714 | 1.25 | stormsea (loop; composited, fast pan) | wide | The Sea King, furious and bald, lunges after him. Zoro, waist-deep, chest overhead, turns the wrong way again — toward the Sea King. | The chase, briefly reversed. | **Sea King:** “MY HAIR.” | — | — | Yakety Sax |
| 4.22 | 714–754 | 1.67 | stormsea (loop; composited, tilted 10°) | tilted | The Sea King's jaws come down; Zoro steps onto its lower lip, up its snout, and sits on its head with the chest. It keeps swimming out of sheer momentum. | He boards it. | **Zoro:** “Faster.” | — | — | Yakety Sax |
| 4.23 | 754–784 | 1.25 | stormsea (loop; composited) | close | The Sea King's eye rolls up at the passenger. | A boat with opinions. | **Sea King:** “I'm not a BOAT.”<br>**Zoro:** “You are now.” | — | — | Yakety Sax |
| 4.24 | 784–814 | 1.25 | sunsetpier (loop; sun just above the horizon) | wide | Wide: the Sea King ploughing across open water toward the pier, Zoro on its head with the chest, the sun a finger above the horizon. | The treasure run proper. Music changes. | — | SUN: one finger above the horizon | — | OVERTAKEN starts here, cued from its 1:28.3 mark so that its big section (1:35) lands 160 frames later on shot 4.29, the sun touching the horizon |
| 4.25 | 814–844 | 1.25 | sunsetpier (loop) | close | Ben, out of the haramaki, points LEFT with a trotter — toward the tavern lights on the shore. Zoro steers RIGHT. | Running gag, beat 7: the setup for the payoff. | — | — | — | Overtaken |
| 4.26 | 844–874 | 1.25 | sunsetpier (loop) | extreme close | Ben's face. The slow dawn of understanding. Eyebrows (pig eyebrows) lift. | The pig figures it out. | **Ben:** “...Oink.” | — | — | Overtaken |
| 4.27 | 874–914 | 1.67 | sunsetpier (loop) | close | Ben points RIGHT — away from the tavern. Zoro, instantly, steers LEFT. Straight at the tavern. Ben's smug face. | RUNNING GAG PAYOFF: point the wrong way and Zoro goes the right way. Ben is the first person in the saga to work this out. | **Zoro:** “Nice try, pig.”<br>**Ben:** “Oink.” | — | — | Overtaken builds |
| 4.28 | 914–944 | 1.25 | tavern2 (loop) | medium | REACTION CUT-AWAY: Nami, the Boss and Luffy at the bar. Luffy eating the peanuts, the bowl, and the bar mat. The sun-clock: last notch. | Thirty seconds. | **Nami:** “Thirty seconds.”<br>**Boss:** “Doubling's good for business too.” | SUN-CLOCK: one notch from SUNSET | — | Overtaken |
| 4.29 | 944–974 | 1.25 | sunsetpier (loop; wide) | wide | THE SUN TOUCHES THE HORIZON. The Sea King hits the shallows at full speed. OVERTAKEN'S BIG SECTION lands on this cut. | Music peak = sun on the horizon, per the bible. | — | SUN: touching the horizon | — | Overtaken — big section (1:35) starts on this cut |
| 4.30 | 974–1004 | 1.25 | sunsetdock (loop; sunset grade, tilted 12°) | tilted | The Sea King beaches on the dock and stops dead; Zoro and the chest keep going — launched through the air over the boats toward the tavern. | Launch. | **Sea King:** “Tip the boat!” | — | — | Overtaken big section |
| 4.31 | 1004–1034 | 1.25 | tavern2 (loop; door, from inside) | wide | Zoro crashes THROUGH the tavern door, chest first, in a shower of splinters. The door sign spins: BACK IN 10 MIN → OPEN. The window behind the bar: the last sliver of sun. | Callback: the door sign from Act 1. | — | DOOR SIGN: BACK IN 10 MIN → OPEN \| SUN: last sliver | op100 007_breaking_through_wall (impact) | Overtaken big section |
| 4.32 | 1034–1064 | 1.25 | tavern2 (loop) | medium | The chest lands on the counter and bursts open. Gold everywhere. One coin rolls the length of the bar and stops in front of Nami. | Delivery, finally, to the right address. | — | — | op100 118_golden_bell (bell) | Overtaken big section |
| 4.33 | 1064–1094 | 1.25 | tavern2 (still; window) | close | The window: the sun DISAPPEARS. Nami's eyes flick to the sun-clock: the disc slides onto the red mark. | Was it in time? Hold the question. | — | SUN: gone \| SUN-CLOCK: SUNSET | — | Overtaken cuts dead on this frame — SILENCE |
| 4.34 | 1094–1134 | 1.67 | tavern2 (loop) | close | Silence. Nami's calculator. Her fingers. Keys. Gold coins sliding into stacks. Ben watching from Zoro's head. Nobody breathes. | The count. | — | — | — | silence (calculator clicks only) |
| 4.35 | 1134–1164 | 1.25 | tavern2 (loop) | medium | Zoro, splinters in his hair, chest heaving, watching her. The Boss watching the gold. Luffy watching the Boss's sandwich. | Three different hungers. | — | — | — | silence |
| 4.36 | 1164–1194 | 1.25 | tavern2 (still; calculator fills frame) | extreme close | The calculator display: 405,000,000. Nami's thumb lifts off the = key. | The number. | — | CALCULATOR: 405,000,000 \| COUNTER: 405,000,000 → 0? | — | silence |
| 4.37 | 1194–1224 | 1.25 | tavern2 (loop) | close | Nami smiles. A real one. Small. | Rare footage. | **Nami:** “Exactly.” | — | — | tavern bed (soft) returns |
| 4.38 | 1224–1254 | 1.25 | tavern2 (loop) | medium | Zoro slumps against the bar, relieved, eyes closed. Ben slides off his head onto the gold. | Done. (It is not done.) | **Zoro:** “Done.” | COUNTER: 0 B | — | tavern bed |
| 4.39 | 1254–1294 | 1.67 | tavern2 (loop) | medium | The Boss slides the CONTRACT across the bar and, with a croupier's rake, pulls a tenth of the gold toward himself. | The 10%. Callback to Act 1. | **Boss:** “Ten percent. The contract.” | CONTRACT: 10% OF EVERYTHING | op100 101_uncovering_coat (whoosh) | tavern bed |
| 4.40 | 1294–1324 | 1.25 | tavern2 (still; calculator) | extreme close | Nami types. The display: 364,500,000. Her thumb hovers over a key marked ×2. | The maths turns on him. | — | CALCULATOR: 364,500,000 → ×2? | op100 069_terror_sting (sting) | tavern bed stops |
| 4.41 | 1324–1364 | 1.67 | tavern2 (loop) | close | Nami, sweet, head tilt — the Act 1 face. | The threat, repeated word for word. | **Nami:** “Short 40,500,000. It doubles.”<br>**Zoro:** “DOUBLE?!” | COUNTER: 40,500,000 B → ×2? | — | silence |
| 4.42 | 1364–1394 | 1.25 | tavern2 (loop) | close | The Boss, mid-gloat, reads his own fine print. His face slowly changes. | 'Everything means everything.' | **Boss:** “...including debts.” | CONTRACT fine print: everything means everything | op100 042_stupid_wtf_spring (sting) | silence |
| 4.43 | 1394–1434 | 1.67 | tavern2 (loop) | medium | The Boss, sinking, slides the exact same tenth of gold across the bar to Nami. 10% of Zoro's debt was his too. | The 10% contract pays off AGAINST the Boss. | **Boss:** “I own ten percent... of that.”<br>**Nami:** “Correct.” | — | — | silence |
| 4.44 | 1434–1464 | 1.25 | tavern2 (still; calculator) | extreme close | The display: 0. The receipt beside it: counter rolls 40,500,000 → 0. Nami stamps it PAID. | Square. | — | CALCULATOR: 0 \| COUNTER: 0 B — PAID | — | silence |
| 4.45 | 1464–1494 | 1.25 | tavern2 (loop) | close | Colour floods back into Zoro's face, grey to skin tone, in one breath. Ben on the counter: plink. A 50 B coin. | Running gag, final plink. | **Nami:** “Tip. Thank you.” | — | op100 105_cave_waterdrop_4 (plink) | silence |
| 4.46 | 1494–1524 | 1.25 | tavern2 (loop) | medium | Nami pockets the coin and turns, pleasant, to the door. | The 'Now—'. | **Nami:** “Now. One more thing.” | — | — | silence |
| 4.47 | 1524–1564 | 1.67 | tavern2 (loop; door) | wide | Luffy walks in from the door side holding a RECEIPT so long it's still coming through the door behind him. Burp. Cream on his nose (still). | The buffet tab from the Buffet short. | **Luffy:** “Zoro's paying!” | — | op100 087_funny_sudden_appearance_2 (sting) | silence |
| 4.48 | 1564–1594 | 1.25 | tavern2 (still; receipt header) | extreme close | The receipt header: ALL-YOU-CAN-EAT BUFFET — TAB: LUFFY. Total at the bottom, scrolling up into frame: 900,000,000 B. | The reveal. | **Nami:** “Luffy's buffet tab.” | TAB: 900,000,000 B | op100 070_terrifying_moment_sting (sting) | silence |
| 4.49 | 1594–1624 | 1.25 | tavern2 (loop) | close | Zoro's face drains — colour to grey, then to line art, then the line boil stops. The Boss, in the back, quietly brightens again. | Ten percent of nine hundred million. | **Boss:** “Ten percent of—”<br>**Nami:** “Yes.” | COUNTER rolls 0 → 900,000,000 B | — | silence |
| 4.50 | 1624–1680 | 2.33 | tavern2 (still; Zoro's face, frozen) | close | LAST FRAME: TO BE CONTINUED? in big white letters over Zoro's frozen grey line-art face; Luffy's belly, round and full, pushing into the bottom-right corner; the sun-clock behind, on SUNSET. Hold to the end. | The question mark is the hook for the sequel. | — | TITLE: TO BE CONTINUED? \| COUNTER (corner): 900,000,000 B | op100 028_enemy_intro_sting_1 (sting), then clean 50 ms fade | one tavern-bed pluck, then silence |
---

## (a) Debt counter

The counter is Nami's receipt, bottom-right, every shot except full-frame title cards. Digits roll like an odometer; the colour goes redder as the number grows.

| act | shot | value shown | why |
|---|---|---|---|
| 1 | 1.1 | 0 → **300,000,000 B** | title card, the digits spin up |
| 1 | 1.13 | 300,000,000 ⇄ **600,000,000** (flicker) | preview of "or it doubles" |
| 1 | 1.38 – 1.52 | **300,000,000 B** (PENDING) | stamped, clock running |
| 2 | 2.1 – 2.40 | **300,000,000 B** (2.24 adds "late fee pending" in small type) | nothing earned yet |
| 2 | 2.41 – 2.47 | 300,000,000 → **305,000,000 B** | the cake bill (cake 4,000,000 + crate 500,000 + tears 500,000) |
| 3 | 3.1 – 3.37 | **305,000,000 B** | the 50-berry bounty is never credited |
| 3 | 3.38 – 3.48 | 305,000,000 → **405,000,000 B** | canteen damages 100,000,000 |
| 4 | 4.1 – 4.35 | **405,000,000 B** | the deadline act |
| 4 | 4.36 – 4.38 | 405,000,000 → **0 B** | chest counted: exactly 405,000,000 |
| 4 | 4.40 – 4.43 | **40,500,000 B → ×2?** | the Boss's 10% taken off the pile |
| 4 | 4.44 – 4.49 | **0 B — PAID** | the Boss's 10% of the *debt* covers it |
| 4 | 4.49 – 4.50 | 0 → **900,000,000 B** | Luffy's buffet tab; TO BE CONTINUED? |

## (b) Sun / clock

Two instruments, always in agreement: the sky in the plate, and Nami's brass sun-clock on the tavern wall (hung 1.11), whose sun disc slides along a horizon track to a red SUNSET mark.

| act | shots | sky | sun-clock | note |
|---|---|---|---|---|
| 1 | 1.3 – 1.10 | dawn, pink, sun on the horizon through the door | — | before the clock goes up |
| 1 | 1.11 – 1.38 | dawn | DAWN (far left) | hung at 1.11 |
| 1 | 1.39 – 1.52 | early morning, gold | one notch past DAWN | last frame: morning light through the door |
| 2 | 2.1 – 2.10 | morning, sun low camera-right | — | |
| 2 | 2.11 | — | MORNING (¼) | cut-away |
| 2 | 2.12 – 2.23 | climbing (snow/jungle/sea) | — | |
| 2 | 2.24 | — | LATE MORNING | cut-away |
| 2 | 2.44 – 2.47 | high | LATE MORNING → NOON | last frame: sun high |
| 3 | 3.1 – 3.20 | NOON, no ground shadows | — | |
| 3 | 3.21 | — | NOON (dead centre) | cut-away |
| 3 | 3.28 – 3.44 | just past overhead, through the cut in the wall | — | |
| 3 | 3.44 | — | AFTERNOON | "Four hours." |
| 3 | 3.46 – 3.48 | low, orange, through the gap | — | last frame: afternoon |
| 4 | 4.1 – 4.2 | low afternoon, a hand's width above the water | — | "90 minutes" |
| 4 | 4.3 | — | ⅘ to SUNSET | cut-away |
| 4 | 4.14 – 4.23 | low, gold (island, sea) | — | |
| 4 | 4.24 | one finger above the horizon | — | Overtaken in |
| 4 | 4.28 | — | one notch from SUNSET | "Thirty seconds." |
| 4 | 4.29 | **touching the horizon** | — | Overtaken big section |
| 4 | 4.31 | last sliver, through the tavern window | — | the crash |
| 4 | 4.33 | **gone** | SUNSET (red mark) | music cuts dead; the count |
| 4 | 4.50 | night-blue window | SUNSET | TO BE CONTINUED? |

## (c) Every speech bubble, numbered (VO script)

Times are absolute (act offset + frame). Delivery note for a future VO: deadpan, no laughs in the read; Kizaru slow, Akainu flat, Boss chirpy, Nami sweet, Luffy with his mouth full, Ben is a pig.

1. [0:01.83 · shot 1.2] **Zoro:** ...By when?
2. [0:04.42 · shot 1.4] **Boss:** Business!
3. [0:05.58 · shot 1.5] **Nami:** Walk. You have legs.
4. [0:05.58 · shot 1.5] **Zoro:** I was walking the other—
5. [0:07.00 · shot 1.6] **Luffy:** Morning!
6. [0:10.75 · shot 1.9] **Boss:** That's a lot of burgers.
7. [0:11.92 · shot 1.10] **Zoro:** I borrowed ONE thousand.
8. [0:11.92 · shot 1.10] **Nami:** Interest.
9. [0:15.08 · shot 1.12] **Nami:** Sunset. Or it doubles.
10. [0:17.42 · shot 1.14] **Zoro:** I can't cut a sunset.
11. [0:17.42 · shot 1.14] **Nami:** You've tried.
12. [0:18.83 · shot 1.15] **Boss:** I have JOBS!
13. [0:22.92 · shot 1.18] **Boss:** One crate. One address.
14. [0:24.33 · shot 1.19] **Zoro:** Which way is up?
15. [0:26.92 · shot 1.21] **Zoro:** Big.
16. [0:26.92 · shot 1.21] **Boss:** Huge. Terrifying. Zero survivors.
17. [0:29.25 · shot 1.23] **Zoro:** Anything else?
18. [0:29.25 · shot 1.23] **Boss:** Mop's in the back.
19. [0:30.67 · shot 1.24] **Luffy:** I'll take the mop.
20. [0:31.83 · shot 1.25] **Zoro:** That's exactly 300,000,000.
21. [0:31.83 · shot 1.25] **Nami:** Exact. Suspicious.
22. [0:33.58 · shot 1.26] **Boss:** Coincidence!
23. [0:36.17 · shot 1.28] **Zoro:** Sunset.
24. [0:37.33 · shot 1.29] **Nami:** Door's that way.
25. [0:39.92 · shot 1.31] **Boss:** He'll be fine.
26. [0:39.92 · shot 1.31] **Nami:** He'll be doubled.
27. [0:41.33 · shot 1.32] **Zoro:** Wrong cupboard.
28. [0:42.75 · shot 1.33] **Luffy:** Anything else!
29. [0:43.92 · shot 1.34] **Boss:** 10% commission.
30. [0:47.08 · shot 1.36] **Zoro:** Is this the map?
31. [0:47.08 · shot 1.36] **Boss:** Sure.
32. [0:49.67 · shot 1.38] **Nami:** Clock's running.
33. [0:52.00 · shot 1.40] **Zoro:** I'll be back by lunch.
34. [0:52.00 · shot 1.40] **Nami:** It's 6 a.m.
35. [0:53.75 · shot 1.41] **Boss:** Five minutes. Turn LEFT.
36. [0:55.17 · shot 1.42] **Zoro:** Left.
37. [0:56.33 · shot 1.43] **Nami:** Don't.
38. [0:56.33 · shot 1.43] **Zoro:** It's broken.
39. [0:57.75 · shot 1.44] **Luffy:** Bring back cake.
40. [0:58.92 · shot 1.45] **Boss:** How did you know it's—
41. [1:01.25 · shot 1.47] **Boss:** Ten percent of those is mine.
42. [1:03.00 · shot 1.48] **Nami:** Tick tock.
43. [1:04.42 · shot 1.49] **Luffy:** Other way.
44. [1:05.58 · shot 1.50] **Boss:** Come back RICH!
45. [1:13.25 · shot 2.3] **Zoro:** Left.
46. [1:14.58 · shot 2.4] **Vendor:** Cake shop's left, sir.
47. [1:14.58 · shot 2.4] **Zoro:** Thanks.
48. [1:16.17 · shot 2.5] **Clerk:** Five minutes, he said.
49. [1:18.83 · shot 2.7] **Zoro:** Shortcut.
50. [1:21.75 · shot 2.9] **Zoro:** Think.
51. [1:23.33 · shot 2.10] **Zoro:** Which way's Marineford?
52. [1:24.92 · shot 2.11] **Nami:** Ten minutes.
53. [1:24.92 · shot 2.11] **Boss:** Rounding error.
54. [1:26.25 · shot 2.12] **Zoro:** Downhill is a direction.
55. [1:30.83 · shot 2.15] **Zoro:** Cake shop?
56. [1:32.50 · shot 2.16] **Zoro:** Thanks.
57. [1:35.17 · shot 2.18] **Zoro:** MY crate!
58. [1:39.75 · shot 2.21] **Zoro:** You can't deliver it!
59. [1:41.08 · shot 2.22] **Dino:** Come baaack...
60. [1:42.75 · shot 2.23] **Zoro:** Marineford's... that way.
61. [1:44.08 · shot 2.24] **Zoro:** Don't.
62. [1:45.42 · shot 2.25] **Nami:** Late fee: pending.
63. [1:46.75 · shot 2.26] **Zoro:** Warm.
64. [1:48.42 · shot 2.27] **Zoro:** Is this... cake?
65. [1:49.75 · shot 2.28] **Zoro:** No. Bricks.
66. [1:52.75 · shot 2.30] **Zoro:** DELIVERY!
67. [1:54.08 · shot 2.31] **Luffy:** CAKE!
68. [2:01.08 · shot 2.36] **Clerk:** FIVE. MINUTES.
69. [2:02.75 · shot 2.37] **Clerk:** That was Akainu's birthday cake.
70. [2:04.08 · shot 2.38] **Zoro:** I delivered it.
71. [2:04.08 · shot 2.38] **Clerk:** To LUFFY.
72. [2:05.75 · shot 2.39] **Luffy:** Delivered.
73. [2:07.08 · shot 2.40] **Clerk:** Cake. Crate. Emotional damages.
74. [2:10.08 · shot 2.42] **Zoro:** It goes UP?
75. [2:10.08 · shot 2.42] **Clerk:** Cousin rate.
76. [2:11.75 · shot 2.43] **Boss:** Ten percent of five million...
77. [2:14.75 · shot 2.45] **Luffy:** Any more jobs?
78. [2:16.08 · shot 2.46] **Zoro:** One more.
79. [2:23.25 · shot 3.3] **Zoro:** Pirates hide where it's loud.
80. [2:24.50 · shot 3.4] **Zoro:** Fresh tracks.
81. [2:27.83 · shot 3.6] **Ben:** Oink...
82. [2:29.08 · shot 3.7] **Zoro:** Found you.
83. [2:29.08 · shot 3.7] **Zoro:** ...Not you.
84. [2:34.00 · shot 3.10] **Akainu:** Where. Is. My. Cake.
85. [2:35.25 · shot 3.11] **Zoro:** Big Pig Ben. Dead or alive.
86. [2:37.75 · shot 3.13] **Kizaru:** Ohh... a swordsman. At breakfast.
87. [2:37.75 · shot 3.13] **Kuzan:** Zzz... dessert.
88. [2:39.42 · shot 3.14] **Zoro:** There.
89. [2:42.33 · shot 3.16] **Kizaru:** Ohh... my toaster.
90. [2:44.00 · shot 3.17] **Akainu:** ...Is that a pig.
91. [2:46.92 · shot 3.19] **Akainu:** EMPTY.
92. [2:49.83 · shot 3.21] **Nami:** Noon. Halfway.
93. [2:49.83 · shot 3.21] **Boss:** Halfway to double!
94. [2:54.00 · shot 3.24] **Ben:** Oink?!
95. [2:56.50 · shot 3.26] **Zoro:** Three-sword—
96. [2:56.50 · shot 3.26] **Akainu:** Not at breakfast.
97. [2:59.67 · shot 3.28] **Kizaru:** Ohh... open plan.
98. [3:05.33 · shot 3.32] **Boss:** Nobody chases a fifty-berry pig.
99. [3:06.92 · shot 3.33] **Zoro:** Fifty.
100. [3:06.92 · shot 3.33] **Ben:** Oink.
101. [3:08.17 · shot 3.34] **Kizaru:** Ohh... itemised.
102. [3:11.33 · shot 3.36] **Akainu:** Plus the cake.
103. [3:11.33 · shot 3.36] **Zoro:** That was Luffy.
104. [3:12.92 · shot 3.37] **Akainu:** Everything is Luffy.
105. [3:15.75 · shot 3.39] **Nami:** Someone's spending.
106. [3:17.00 · shot 3.40] **Kuzan:** Did I miss it?
107. [3:21.08 · shot 3.43] **Zoro:** ...Tip.
108. [3:22.33 · shot 3.44] **Nami:** Four hours.
109. [3:23.58 · shot 3.45] **Boss:** Ten percent of fifty... five!
110. [3:23.58 · shot 3.45] **Boss:** Five whole berries!
111. [3:26.42 · shot 3.47] **Zoro:** Four hundred million short.
112. [3:34.67 · shot 4.4] **Zoro:** Think.
113. [3:34.67 · shot 4.4] **Ben:** Snort.
114. [3:36.00 · shot 4.5] **Zoro:** Sell a sword?
115. [3:36.00 · shot 4.5] **Zoro:** ...No.
116. [3:39.00 · shot 4.7] **Zoro:** Pick a direction.
117. [3:40.67 · shot 4.8] **Zoro:** Instinct.
118. [3:44.67 · shot 4.11] **Dino:** Cake shop's left!
119. [3:48.50 · shot 4.14] **Zoro:** Huh.
120. [3:53.08 · shot 4.17] **Zoro:** You again.
121. [3:53.08 · shot 4.17] **Sea King:** ...YOU again.
122. [3:54.33 · shot 4.18] **Sea King:** Treasure's mine.
123. [3:57.25 · shot 4.20] **Zoro:** Tavern. TAVERN.
124. [3:58.50 · shot 4.21] **Sea King:** MY HAIR.
125. [3:59.75 · shot 4.22] **Zoro:** Faster.
126. [4:01.42 · shot 4.23] **Sea King:** I'm not a BOAT.
127. [4:01.42 · shot 4.23] **Zoro:** You are now.
128. [4:05.17 · shot 4.26] **Ben:** ...Oink.
129. [4:06.42 · shot 4.27] **Zoro:** Nice try, pig.
130. [4:06.42 · shot 4.27] **Ben:** Oink.
131. [4:08.08 · shot 4.28] **Nami:** Thirty seconds.
132. [4:08.08 · shot 4.28] **Boss:** Doubling's good for business too.
133. [4:10.58 · shot 4.30] **Sea King:** Tip the boat!
134. [4:19.75 · shot 4.37] **Nami:** Exactly.
135. [4:21.00 · shot 4.38] **Zoro:** Done.
136. [4:22.25 · shot 4.39] **Boss:** Ten percent. The contract.
137. [4:25.17 · shot 4.41] **Nami:** Short 40,500,000. It doubles.
138. [4:25.17 · shot 4.41] **Zoro:** DOUBLE?!
139. [4:26.83 · shot 4.42] **Boss:** ...including debts.
140. [4:28.08 · shot 4.43] **Boss:** I own ten percent... of that.
141. [4:28.08 · shot 4.43] **Nami:** Correct.
142. [4:31.00 · shot 4.45] **Nami:** Tip. Thank you.
143. [4:32.25 · shot 4.46] **Nami:** Now. One more thing.
144. [4:33.50 · shot 4.47] **Luffy:** Zoro's paying!
145. [4:35.17 · shot 4.48] **Nami:** Luffy's buffet tab.
146. [4:36.42 · shot 4.49] **Boss:** Ten percent of—
147. [4:36.42 · shot 4.49] **Nami:** Yes.

## (d) Upload copy

Channel: AKKI TALKS — https://www.youtube.com/@akkitalkss
Format: long-form, 1920×1080, 4:40, 24 fps.
Audience: **made for kids: NO** (anime parody, cartoon violence, a debt).

### Title
Zoro Funny Moments 💀 Zoro Has Until SUNSET to Pay Nami 300,000,000 Berries | One Piece Funny Moments

Alternates:
- Zoro Nami Debt: 300,000,000 Berries by Sunset or It DOUBLES 😭 One Piece Funny Moments
- Zoro Took 3 Jobs to Pay Nami... and Owes MORE 💀 Zoro Funny Moments (One Piece Parody)

### Description
```
Zoro funny moments: the Zoro Nami debt saga — One Piece funny moments, animated. 300,000,000 berries. One day. Sunset, or it doubles 💀

Nami gives Zoro until sunset to pay back 300,000,000 berries, so he takes three jobs off the Harbour Tavern job board: deliver one crate (five minutes away — he walks through a desert, a blizzard, a dinosaur, the sea and a volcano), catch the terrifying pirate BIG PIG BEN (who turns out to be a very small pig), and "anything else". Every job somehow costs him MORE. By the afternoon he owes 405,000,000, the sun is going down, and there is exactly one direction left to try: the wrong one 🗺️

Also starring: Luffy, who eats Admiral Akainu's birthday cake. Akainu, who would like his cake. And the Boss, who takes 10% of everything. Everything means everything.

Which job would YOU have given Zoro? Tell me below 👇

⏱️ Chapters
0:00 Act 1 — The Deal
1:10 Act 2 — Job 1: The Delivery
2:20 Act 3 — Job 2: The Bounty
3:30 Act 4 — Sunset

🎞️ Background plates — stock footage credits (Pexels)
- tavern2: video by Darlene Alderson — https://www.pexels.com/video/burger-and-beer-at-a-pub-7039149/
- harbour: video by Shutter Break — https://www.pexels.com/video/fishing-boat-ready-to-unload-the-fishes-5564234/
- market2: video by khanhhoangminh — https://www.pexels.com/video/vendors-selling-fruit-on-the-street-15169263/
- canteen: video by Pavel Danilyuk — https://www.pexels.com/video/an-empty-restaurant-7320541/
- stormsea: video by Bisan Subba — https://www.pexels.com/video/lonely-lighthouse-amidst-stormy-sea-waves-32844046/
- sunsetdock: video by Tom Schönmann — https://www.pexels.com/video/a-dock-with-boats-docked-at-sunset-17142580/
- sunsetpier: video by Sergio Scandroglio — https://www.pexels.com/video/sunset-on-clear-sky-over-pier-11566057/
- desert: video by Taryn Elliott — https://www.pexels.com/video/desert-ripples-5442713/
- desert2: video by MART PRODUCTION — https://www.pexels.com/video/sand-dunes-in-dubai-8865366/
- jungle: video by Julio Benito Cabrera — https://www.pexels.com/video/footpath-into-forest-13582327/
- jungle2: video by Gav Hof — https://www.pexels.com/video/lush-jungle-trail-in-asian-rainforest-29636628/

One Piece parody animation, drawn by AKKI TALKS. Not affiliated with the One Piece anime or manga.

🎬 Subscribe to AKKI TALKS:
https://www.youtube.com/@akkitalkss

#onepiece #zoro #nami #luffy #onepiecefunnymoments #zorofunnymoments #anime #animation #funny #parody
```

(The plate credits above are the lines from `public/plates/CREDITS.md` for the eleven plates this script uses; if a plate is swapped at build time, swap its credit line. Full list in that file.)

### Chapters (first at 0:00, each ≥ 10 s — act boundaries, 70 s each)
```
0:00 Act 1 — The Deal
1:10 Act 2 — Job 1: The Delivery
2:20 Act 3 — Job 2: The Bounty
3:30 Act 4 — Sunset
```

### Pinned comment
Would you rather owe Nami 300,000,000 berries or ask Zoro for directions? 👇

### Tags (431 characters, under the 500 cap)
```
zoro funny moments, one piece funny moments, zoro nami debt, zoro debt, nami debt, zoro and nami, zoro one piece, one piece funny, one piece parody, one piece animation, one piece comedy, zoro gets lost, zoro sense of direction, luffy eating, admirals, akainu, kizaru, aokiji, sea king, roronoa zoro, nami one piece, anime funny moments, anime comedy, anime parody, animated comedy, akki talks, animation, cartoon, anime, one piece
```

### Thumbnail (1920×1080)
Zoro's grey face, huge, screaming silently; Nami's calculator in the foreground reading 300,000,000; the sun half under the horizon behind them; three words of our own lettering: PAY BY SUNSET. No "AKKI TALKS" header or watermark anywhere on the thumbnail or in the video (the opening white title card stays).

### Made for kids
**NO.**
