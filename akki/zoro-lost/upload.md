# Zoro Gets Lost — upload package

Channel: AKKI TALKS — https://www.youtube.com/@akkitalkss
Format: Short, 1080×1920, 15s, 24fps. Shorts take no chapter list.
Audience: **made for kids: NO** (anime parody, cartoon peril).

## Title
Zoro Just Wanted the Bathroom 💀 #shorts

Alternates:
- The Door Was RIGHT There 😭 #shorts
- Zoro Has No Sense of Direction (5 Steps Away) #shorts

## Description
```
The toilet was FIVE steps away. Zoro walked through a desert, a blizzard, a dinosaur, an ocean and a volcano instead. By the time he got back I had a beard to the floor… 🗺️💀

Has your sense of direction ever been this bad? Tell me below 👇

🎬 Subscribe to AKKI TALKS:
https://www.youtube.com/@akkitalkss

#shorts #onepiece #zoro #roronoazoro #zorolost #anime #animation #funny
```

## Tags
```
one piece, zoro, roronoa zoro, zoro gets lost, zoro sense of direction, one piece funny, one piece parody, one piece animation, anime shorts, anime funny, anime comedy, lost zoro, wrong way, akki talks, animation, cartoon, shorts, anime
```

## Build
Drawn in code (`src/akki/lost/`); the guest is the channel owner (`src/akki/guest.tsx`).
Sound: a few One Piece effects from `.sfx/op/` (gitignored, never committed) plus numpy synthesis; cue frames come from `src/akki/lost/beats.json`.

```
npm run akki:lost:audio   # public/audio/akki-lost-mix.wav (needs .sfx/op/)
npm run akki:lost         # out/akki/zoro-lost.mp4
npm run akki:lost:thumb   # out/akki/thumbnail-zoro-lost.jpg (1080×1920)
```
