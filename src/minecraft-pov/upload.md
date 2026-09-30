# Upload copy — POV: You finally reach grass (first person)

The same idea as GarrettTheCarrot's "When you finally reach grass" (57M views,
7 s), rebuilt as our own first-person video: the character is never on screen,
only the view from his eyes. New picture, new story, and the music is Also
sprach Zarathustra.

## Before you upload: the music

Also sprach Zarathustra is Strauss's (public-domain composition), but the
recording is the Dudamel / Berlin Philharmonic one, which is **owned by its
label and will very likely be Content ID claimed** if it is baked in. Usually it
stays up with the revenue going to the rights holder; it can be blocked or
muted in some countries. The sound effects are the game's own plus synthesised
ones. The safe route: upload `pov-reach-grass-no-music.mp4` and add the song in
YouTube's Shorts sound picker (see below).

## Title

```
POV: You finally reach grass 🥹 #shorts
```

**Alternates:**

```
Mining up to the sun… then a creeper 💀 #minecraft #shorts
```
```
After 50 blocks of stone… #minecraft #shorts
```

## Description

```
Y: -52 → Y: 64 ⛏️
Stone. Dirt. More dirt. And then…… the sun ☀️🥹
…and then a creeper 💥

Every Minecraft player knows this feeling.

Music: "Also sprach Zarathustra" – Richard Strauss

Oofy always gets hurt. New Minecraft animation every week.

🥕 Subscribe:
https://www.youtube.com/@LaughQuakees

#minecraft #minecraftshorts #minecraftmemes #minecraftanimation #oofy #shorts
```

Delete the "Music:" line if you upload the no-music version and add a song in
the picker.

## Tags

```
minecraft, minecraft shorts, finally reach grass, minecraft mining, minecraft cave, minecraft surface, minecraft creeper, minecraft pov, minecraft first person, minecraft relief, mining up, minecraft animation, minecraft meme, minecraft memes, minecraft funny, minecraft cartoon, oofy, oof craft, gaming animation, shorts
```

## Pinned comment

```
the creeper waiting right at the surface 💀 how many times has that happened to you?
```

## Which version to upload

| file | music | copyright |
|---|---|---|
| `pov-reach-grass.mp4` | Also sprach Zarathustra (Dudamel / Berliner Philharmoniker), baked in | **will likely be claimed by Content ID** |
| `pov-reach-grass-no-music.mp4` | none — add a song in YouTube's Shorts sound picker | licensed through YouTube |

Through the picker: choose "Also sprach Zarathustra" and start it at the point
the timpani begin to build (about **0:33** in the Dudamel recording; other
recordings differ, so scrub to the first drum hits). The video has the pickaxe
strikes at 0:03.4, 0:04.1, 0:07 and the last block breaking at **0:07.0** —
that is where the big orchestral hit should land.

## Upload settings

Category **Gaming** (game: Minecraft), language English, uploaded as a Short
(17.9 s, 1080×1920). Audience **not made for kids**.

Thumbnail: `thumbnail-pov-reach-grass.jpg` (`npm run pov:thumb`) — the creeper
filling the lens.

## How it is built

- **No character.** Every shot is first person. Your hand is the diamond
  pickaxe coming up from the bottom corner.
- **The shaft.** You look straight up a one-wide shaft. The pickaxe cracks
  the ceiling block in stages (the cracks grow like the game's own break
  animation); on each break the camera rises and the walls rush outward. A Y
  readout counts Y: −52 → Y: 64.
- **The music lands on the picture.** Zarathustra's six timpani hits land on the
  last strikes; its full-orchestra hit lands on the frame the last block breaks,
  and the sky, sunlight and dirt pour onto the lens.
- **The meadow.** Up out of the hole: a look at the ground, a look round (sky,
  cow, birds), and he lies back in the grass.
- **The creeper.** It walks up from the horizon on the music's second build,
  its footfalls on the steps. It looms over the lens and starts to swell; the
  picture cuts to black on the music's second hit, **before** it explodes. No
  death screen.
- **Sound effects:** the game's own "hit" sound for every strike (from
  `public/audio/src/mc-hit.mp3`), plus synthesised block breaks, steps, birds and
  the hiss.

## Rebuilding it

```bash
npm run pov:assets   # key the white out of the pickaxe and creeper pictures
npm run pov:audio    # render, then ffmpeg lays the mix under it
npm run pov:thumb
```

Needs the owner's own pickaxe and creeper pictures in
`public/images/pov-src/` and the track at `public/audio/src/zarathustra.mp3`
(all ignored, never committed).
