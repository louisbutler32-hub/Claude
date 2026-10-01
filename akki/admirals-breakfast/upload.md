# Admirals Make Breakfast — upload package

Channel: AKKI TALKS — https://www.youtube.com/@akkitalkss
Format: Short, 1080×1920, 15.5s. Shorts take no chapter list.
Audience: **not** made for kids (cartoon violence, explosions).

## Title
Admirals Tried to Make Me Toast 🍞 #shorts

Alternates:
- Never Ask the Admirals for Breakfast 💀 #shorts
- Who Took My Toast?! 🍞 #shorts

## Description
```
I just wanted toast. Akainu burned it, Kuzan froze it, Kizaru blew up the toaster… and then Luffy showed up 🍞💀

Which admiral makes the best breakfast? 👇

🎬 Subscribe to AKKI TALKS:
https://www.youtube.com/@akkitalkss

#shorts #onepiece #akainu #kizaru #aokiji #luffy #anime #animation
```

## Tags
```
one piece, admirals, akainu, kizaru, aokiji, kuzan, luffy, one piece funny, one piece animation, one piece parody, magma, ice age, speed of light, anime shorts, anime funny, akki talks, animation, cartoon, shorts, anime, marine
```

## Build
Drawn in code (`src/akki/breakfast/`); the guy at the table is the channel owner (`src/akki/guest.tsx`).
Sound: the One Piece effects cut from the owner's own admiral clips into `.sfx/op/` (gitignored, never committed; `catalog.json` there lists each source and timestamp), over a synthesised bed.

```
npm run akki:breakfast:audio   # public/audio/akki-breakfast-mix.wav (needs .sfx/op/)
npm run akki:breakfast         # out/akki/admirals-breakfast.mp4
npm run akki:breakfast:thumb   # out/akki/thumbnail-admirals-breakfast.jpg (1080×1920)
```
