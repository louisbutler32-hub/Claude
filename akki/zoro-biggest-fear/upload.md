# This Is Zoro's Biggest Fear — upload package

Channel: AKKI TALKS — https://www.youtube.com/@akkitalkss
Format: Short, 1080×1920, 12s, 24fps. Shorts take no chapter list.
Audience: **made for kids: NO** (anime parody).
Search angle: "This Is <Character>'s Biggest Fear | One Piece" Shorts are breaking out right now, and "zoro funny moments" is a high-demand, low-competition query. The gag is the long-running fan joke: Zoro fears nothing — except Nami and the debt he owes her.

## Title
This Is Zoro's Biggest Fear 😳 One Piece Funny Moments #onepiece #shorts

Alternates:
- Zoro Funny Moments 💀 Zoro Fears NOTHING... Except Nami's Debt #shorts
- Zoro's Biggest Fear? 300,000,000 Berries 😭 One Piece #shorts

## Description
```
Zoro funny moments: this is Zoro's biggest fear 😳 A Sea King? Cut in half. A whole Marine army? He yawned. A hawk-eyed swordsman? Smirked. Then Nami showed up with the receipt… 300,000,000 berries 💀 One Piece funny moments, Zoro and Nami debt edition.

Zoro ran in a circle. Twice. Then somebody pointed straight at him 😭

Who's the scariest thing Zoro has ever faced: the Sea King, Hawk Eye, or Nami's calculator? Tell me in the comments 👇

🎬 Subscribe to AKKI TALKS:
https://www.youtube.com/@akkitalkss

#shorts #onepiece #zoro #nami #anime #animation #funny
```

## Pinned comment (question)
Who would you rather face: the Sea King or Nami with a calculator? 👇

## Tags
```
zoro funny moments, one piece funny moments, zoro biggest fear, zoro nami debt, zoro fear, zoro one piece, zoro lost, zoro gets lost, nami debt, nami zoro, one piece nami, one piece parody, one piece animation, one piece shorts, anime funny, anime comedy, anime shorts, roronoa zoro, sea king, animation, cartoon, shorts
```
(Under YouTube's 500-character cap — 320 characters.)

## Beat sheet (24fps; the timings the video and soundtrack both read from `src/akki/fear/beats.json`)
| frames | time | beat |
|---|---|---|
| 0–36 | 0:00 | Storm sea, Sea King rears over the ship, Zoro arms folded; title card ZORO'S BIGGEST FEAR? (first 48 frames) |
| 36–60 | 0:01.5 | One draw, one slash, white impact flash (3 frames), Sea King cut in two, Zoro sheathes without looking back |
| 60–84 | 0:02.5 | Marine army charges the bridge, Zoro walks through with three swords out, dominoes, yawn |
| 84–108 | 0:03.5 | Hawk-eyed swordsman on a rock, Zoro smirks; close-up wink + scar |
| 108–132 | 0:04.5 | The turn. Silence, then a sting: sunny harbour, tiny Nami with a receipt unrolling, push in, eye twitch, sweat drop |
| 132–156 | 0:05.5 | The receipt: ZORO'S DEBT counter spins up to 300,000,000 B, Zoro drains to black-and-white |
| 156–216 | 0:06.5 | The chase (Yakety Sax kicks in): harbour, over water, the map gag (a circle, twice), back at the START sign, the market, hides behind the guest |
| 216–264 | 0:09 | The guest looks at Nami, looks at Zoro, points straight at him, thumbs-up to Nami; Zoro dragged away flat |
| 264–288 | 0:11 | The guest alone with Nami's 10% berry pouch, counting it; the sky darkens back to a storm (loops to frame 0) |

## Build
Drawn in code (`src/akki/fear/`); the guest is the channel owner (`src/akki/guest.tsx`).
Sound: a handful of cuts from the owner's One Piece compilation in `.sfx/op100/` (gitignored third-party audio, never committed) plus numpy synthesis, and the owner's Yakety Sax from `public/audio/src/yakety-sax.mp3` (gitignored). Cue frames come from `src/akki/fear/beats.json`.

```
npm run akki:fear:audio   # public/audio/akki-fear-mix.wav (needs .sfx/op100/ and the Yakety Sax file; -14 LUFS, peak limited)
npm run akki:fear         # out/akki/zoro-biggest-fear.mp4 (also runs scripts/akki-fix-audio-sync.sh)
npm run akki:fear:thumb   # out/akki/thumbnail-zoro-biggest-fear.jpg (1080×1920)
```

Effects-only variant (no music): `python3 scripts/build-akki-fear-audio.py --no-music` → `public/audio/akki-fear-nomusic.wav`.
