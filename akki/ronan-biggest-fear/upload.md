# This Is Ronan's Biggest Fear — upload package

Channel: AKKI TALKS — https://www.youtube.com/@akkitalkss
Format: Short, 1080×1920, 15s, 24fps. Shorts take no chapter list.
Audience: **made for kids: NO**.
Search angle: "This Is <Character>'s Biggest Fear" Shorts + "funny moments". All characters are original (Ronan, Mira, the Boss, the harbour guards, the duelist).

## Title
This Is Ronan's Biggest Fear 😳 Funny Moments #shorts #animation

Alternates:
- Ronan Fears NOTHING... Except Mira's Debt 💀 Funny Moments #shorts
- Ronan's Biggest Fear? 300,000,000 G 😭 Animated Comedy #shorts

## Description
```
Ronan funny moments: this is Ronan's biggest fear 😳 A Sea King? Cut in half. A whole harbour guard? He yawned. A hawk-eyed duelist? Smirked. Then Mira showed up with the receipt… 300,000,000 G 💀 Funny animated moments, debt edition.

Ronan ran in a circle. Twice. Then the Boss pointed straight at him 😭

Who's scarier: the Sea King, the duelist, or Mira's abacus? Tell me in the comments 👇

🎬 Subscribe to AKKI TALKS:
https://www.youtube.com/@akkitalkss

Background plates (Pexels stock footage, stylised): stormsea – Bisan Subba; harbour – Shutter Break; harbour2 – Hakan Kayahan; market2 – khanhhoangminh; nightsea – Nothing Ahead; sunsetdock – Tom Schönmann; sunsetpier – Sergio Scandroglio. (public/plates/CREDITS.md)

#shorts #animation #funny #comedy #cartoon #funnymoments
```

## Pinned comment (question)
Who would you rather face: the Sea King or Mira with an abacus? 👇

## Tags
```
ronan funny moments, ronan biggest fear, biggest fear, funny moments, animated comedy, funny animation, animation shorts, cartoon comedy, debt, mira and ronan, sea king, original characters, comedy shorts, funny shorts, shorts, animation
```
(about 250 characters, under the 500 cap)

## Beat sheet (24fps; `src/akki/debt/beats.json` drives video and soundtrack)
| frames | beat |
|---|---|
| 0–36 | Storm, Sea King rears over the ship, Ronan arms folded, title card (first 48 frames), "…Again?" |
| 36–60 | One cleaver slash, 3-frame white-on-black flash, Sea King split, Ronan sheathes without looking |
| 60–84 | Harbour guards charge, Ronan strolls through (bells), dominoes, yawn |
| 84–108 | Duelist on a rock; Ronan's smirk, close-up one eye closed |
| 108–132 | The turn: sunny harbour, tiny Mira unrolls a receipt, push-in on the twitching eye, "No." |
| 132–156 | Receipt spins to 300,000,000 G, UNPAID; Ronan drains to grey; "…Interest?" / "Interest." |
| 156–216 | Chase (Yakety Sax): harbour, over the water, same lighthouse twice ("Wrong way."), hides behind the Boss |
| 216–264 | Boss looks, points ("!!"), thumbs-up to Mira; Mira drags Ronan flat by the scarf |
| 264–360 | "10%." pouch, ka-ching; Mira turns: "Your turn."; Boss freezes "…Business?"; fade to thumbnail pose |

## Build
```
npm run akki:debt:audio   # public/audio/akki-debt-mix.wav (needs .sfx/op100/ and public/audio/src/yakety-sax.mp3; -14 LUFS, limited)
npm run akki:debt         # out/akki/ronan-biggest-fear.mp4
npm run akki:debt:thumb   # out/akki/thumbnail-ronan-biggest-fear.jpg
```
Characters live in `src/akki/kit3/` (Ronan, Mira, Guard, Duelist, props) on the kit-v2 engine; shots in `src/akki/debt/`.
