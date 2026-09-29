# Upload copy — Minecraft sleeping makes no sense

Third in the "Minecraft ___ makes no sense" series after fall damage and
crouching — same title shape, same star.

## Title

```
Minecraft sleeping makes no sense 💀 #shorts
```

**Alternates:**

```
"You may not rest now, there are monsters nearby" #minecraft #shorts
```
```
Every Minecraft player has done this 😭 #shorts
```

## Description

```
Try to sleep ❌
"You may not rest now, there are monsters nearby" 🧟
Walk 100 blocks to kill the ONE zombie ⚔️
Try to sleep again ❌
…the spider on the ceiling 🕷️

(The check is 8 blocks across and 5 up. Nothing far away stops you sleeping — but you'll never look up.)

Oofy always gets hurt. New Minecraft animation every week.

🥕 Subscribe:
https://www.youtube.com/@LaughQuakees

#minecraft #minecraftshorts #minecraftmemes #minecraftanimation #oofy #shorts
```

## Tags

```
minecraft, minecraft shorts, minecraft sleeping, minecraft bed, you may not rest now, there are monsters nearby, minecraft spider, minecraft zombie, minecraft night, minecraft animation, minecraft meme, minecraft memes, minecraft funny, minecraft logic, minecraft cartoon, oofy, oof craft, gaming animation, shorts
```

## Pinned comment

```
how many times has a spider on the ceiling ruined your night? 🕷️😭
```

## Which version to upload

| file | music | copyright |
|---|---|---|
| `minecraft-sleeping.mp4` | an original music-box lullaby made for this Short | none — nothing licensed in it |
| `minecraft-sleeping-no-music.mp4` | none — add a song in YouTube's Shorts sound picker | licensed through YouTube |

A real song goes through the picker, not into the file (it would be claimed).
Song for the picker route: **"Mr. Sandman" (The Chordettes)** — the "bring me
a dream" opening over the walk-in, then cut it when the bed refuses him.
Runner-up: **"Sleep Walk" (Santo & Johnny)**.

To bake a song into a private cut instead, put it in `public/audio/src/` and
run `python3 scripts/build-sleep-audio.py --song FILE.mp3 --at SECONDS
[--resume SECONDS]` (`--at` = where in the track frame 0 sits). It plays to the
first refusal, then picks up for his second try — where it left off, or at
`--resume`. For Mr. Sandman, `--at 11.9 --resume 26.8` puts "bring me a dream"
over the walk-in and "his lonesome nights are over" on the second refusal.
That cut is `minecraft-sleeping-mr-sandman.mp4` and will be claimed.

The run out and the fight can carry a second song. `--chase eye-of-the-tiger.mp3
--chase-at 3.66` fades it in as he leaves and cuts it at the poof, with the
riff's three stabs on the three sword hits (`minecraft-sleeping-sandman-tiger.mp4`,
also claimed).

## Upload settings

Category **Gaming** (game: Minecraft), language English, uploaded as a Short
(17 s, 1080×1920). Audience **not made for kids**.

Thumbnail: `thumbnail-sleeping.jpg` (`npm run sleep:thumb`).

Sound: `npm run sleep:mix` (lullaby) or `sleep:sfx` (no music), then
`npm run sleep:audio` for the muxed cut.

## Why this one

Same shape as the Short that scored: one relatable Minecraft moment, a hopeful
build-up, and a twist that reframes it. Every player has hit "You may not rest
now", and the punchline (the monster was on the ceiling the whole time) is
exactly the kind of accurate detail players comment on.
