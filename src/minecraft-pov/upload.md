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
| `pov-reach-grass.mp4` | Also sprach Zarathustra (Dudamel / Berliner Philharmoniker), baked in | **will likely be claimed by Content ID** (the music; the sound effects are the owner's) |
| `pov-reach-grass-no-music.mp4` | none — add a song in YouTube's Shorts sound picker | licensed through YouTube |

Through the picker: choose "Also sprach Zarathustra" and start it at the point
the timpani begin to build (about **0:33** in the Dudamel recording; other
recordings differ, so scrub to the first drum hits). The video has the pickaxe
strikes building to the last block breaking at **0:07.0** —
that is where the big orchestral hit should land.

## Upload settings

Category **Gaming** (game: Minecraft), language English, uploaded as a Short
(14.7 s, 1080×1920). Audience **not made for kids**.

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
- **The meadow.** Up out of the hole into the sky — birds, a butterfly —
  and then the camera tilts down and **the creeper is already there**, standing
  a few steps away, the whole time. No walk-in: it is a shock.
- **The creeper.** It takes four slow steps closer on the music's steps, then
  starts to swell and hiss; the picture cuts to black on the music's hit,
  **before** it explodes. No death screen.
- **Sound effects** are the owner's own files, each cut to the piece it needs and
  brought to one level: stone-breaking (mining taps on the stone blocks, the
  break), dirt sounds (dig hits and the break on the dirt blocks), the creeper
  hiss (lifted, the file is quiet), and from the Top-20 compilation the grass
  footsteps, the cave-ambience loop under the shaft and the XP ding when the sky
  appears. Every hit is aligned to its frame by its loudest point (measured: all
  within one frame). The creeper-explosion file is not used; the picture cuts to
  black before it goes off.

## Rebuilding it

```bash
npm run pov:assets   # key the white out of the pickaxe and creeper pictures
npm run pov:audio    # render, then ffmpeg lays the mix under it
npm run pov:thumb
```

Needs the owner's own pickaxe and creeper pictures in
`public/images/pov-src/`, the track at `public/audio/src/zarathustra.mp3` and
the stone, dirt, creeper and sound-effect files in `public/audio/src/` (all
ignored, never committed).
