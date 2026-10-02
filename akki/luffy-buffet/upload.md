# Luffy at the All-You-Can-Eat Buffet — upload package

Channel: AKKI TALKS — https://www.youtube.com/@akkitalkss
Format: Short, 1080×1920, 14s (cut at 0:14: ends on Luffy's thumbs-up; the full 16s version adds Zoro walking in), 24fps. Shorts take no chapter list.
Audience: **made for kids: NO** (anime parody).

## Title
Luffy Ate the Entire All-You-Can-Eat Buffet 💀 #shorts

Alternates:
- All You Can Eat* (*Not Luffy) 😭 #shorts
- The Buffet Owner Never Recovered #shorts

## Description
```
"All you can eat — 20 berries!" Luffy ate every tray, every plate and the whole counter… then rolled around the restaurant like a ball 🍖💀

The owner added one new line of fine print: *NOT LUFFY 😭

Would you let Luffy into your buffet? Tell me below 👇

🎬 Subscribe to AKKI TALKS:
https://www.youtube.com/@akkitalkss

#shorts #onepiece #luffy #anime #animation #funny #buffet
```

## Tags
```
one piece, luffy, monkey d luffy, luffy eating, luffy buffet, all you can eat, one piece funny, one piece parody, one piece animation, anime shorts, anime funny, anime comedy, luffy food, gomu gomu no mi, akki talks, animation, cartoon, shorts, anime
```

## Build
Drawn in code (`src/akki/buffet/`); the restaurant owner is the channel owner (`src/akki/guest.tsx`).
Sound: One Piece effects from `.sfx/op/` (gitignored, never committed) plus numpy synthesis; cue frames come from `src/akki/buffet/beats.json`.

```
npm run akki:buffet:audio   # public/audio/akki-buffet-mix.wav (needs .sfx/op/)
npm run akki:buffet         # out/akki/luffy-buffet.mp4
npm run akki:buffet:thumb   # out/akki/thumbnail-luffy-buffet.jpg (1080×1920)
```

14s cut with Yakety Sax and the One Piece compilation cuts (music is the owner's file in `public/audio/src/yakety-sax.mp3`, gitignored):

```
python3 scripts/build-akki-buffet-audio.py --music yakety --cut 14 --op100
ffmpeg -i out/akki/luffy-buffet.mp4 -i public/audio/akki-buffet-yakety-op100-14s.wav -t 14 -map 0:v -map 1:a -c:v libx264 -crf 17 -c:a aac -b:a 192k out/akki/luffy-buffet-yakety-op.mp4
```
