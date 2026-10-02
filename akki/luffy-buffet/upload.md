# Luffy at the All-You-Can-Eat Buffet — upload package

Channel: AKKI TALKS — https://www.youtube.com/@akkitalkss
Format: Short, 1080×1920, 16s, 24fps. Shorts take no chapter list.
Audience: **made for kids: NO** (anime parody).

## Title
Luffy Ate the Entire All-You-Can-Eat Buffet 💀 #shorts

Alternates:
- All You Can Eat* (*Not Luffy) 😭 #shorts
- The Buffet Owner Never Recovered #shorts

## Description
```
"All you can eat — 20 berries!" Luffy ate every tray, every plate and the whole counter… then rolled around the restaurant like a ball 🍖💀

The owner added a new line of fine print. Then Zoro walked in asking for the bathroom 😭

Would you let Luffy into your buffet? Tell me below 👇

🎬 Subscribe to AKKI TALKS:
https://www.youtube.com/@akkitalkss

#shorts #onepiece #luffy #zoro #anime #animation #funny #buffet
```

## Tags
```
one piece, luffy, monkey d luffy, luffy eating, luffy buffet, all you can eat, zoro, one piece funny, one piece parody, one piece animation, anime shorts, anime funny, anime comedy, luffy food, gomu gomu no mi, akki talks, animation, cartoon, shorts, anime
```

## Build
Drawn in code (`src/akki/buffet/`); the restaurant owner is the channel owner (`src/akki/guest.tsx`).
Sound: One Piece effects from `.sfx/op/` (gitignored, never committed) plus numpy synthesis; cue frames come from `src/akki/buffet/beats.json`.

```
npm run akki:buffet:audio   # public/audio/akki-buffet-mix.wav (needs .sfx/op/)
npm run akki:buffet         # out/akki/luffy-buffet.mp4
npm run akki:buffet:thumb   # out/akki/thumbnail-luffy-buffet.jpg (1080×1920)
```
