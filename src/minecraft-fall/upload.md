# Upload copy — How to survive ANY fall in Minecraft

## Title

```
Minecraft fall damage makes no sense 💀 #shorts
```

**Alternates:**

```
How to survive ANY fall in Minecraft #minecraft #shorts
```
```
320 blocks: fine. 4 blocks: dead. #minecraft #shorts
```

## Description

```
Water bucket off the height limit ✅
Hay bale on half a heart ✅
Slime block to the moon ✅
A 4-block ledge ❌💀

(4 blocks is exactly half a heart. He had exactly half a heart.)

Oofy always gets hurt. New Minecraft animation every week.

🥕 Subscribe:
https://www.youtube.com/@LaughQuakees

Music: see "Which version to upload" below — this block depends on it.

#minecraft #minecraftshorts #minecraftmemes #mlg #minecraftanimation #shorts
```

## Tags

```
minecraft, minecraft shorts, minecraft fall damage, mlg water bucket, water bucket clutch, minecraft mlg, slime block, hay bale, minecraft death, you died, minecraft animation, minecraft meme, minecraft memes, minecraft funny, minecraft logic, minecraft cartoon, stick figure animation, oofy, gaming animation, oof craft, shorts
```

(328 characters, inside YouTube's 500.)

## Pinned comment

Post and pin this yourself the moment it goes live — a question the viewer
has a story for is the cheapest comment bait there is:

```
what's the dumbest way you've died in Minecraft? 💀
```

## Which version to upload

There are three renders of the same picture. Pick one, and use its music line
in the description in place of the placeholder:

| file | music | copyright | music line |
|---|---|---|---|
| `minecraft-fall-damage-hbfs.mp4` | Harder, Better, Faster, Stronger — baked in, cut to the story | **Will almost certainly be claimed by Content ID.** Usually the Short stays up but the label takes the revenue, and it can be blocked or muted in some countries | `Music: Daft Punk – Harder, Better, Faster, Stronger` |
| `minecraft-fall-damage-no-music.mp4` | none — add the song in YouTube's Shorts sound picker when uploading | licensed through YouTube, no claim | *(delete the line — YouTube credits the song itself)* |
| `minecraft-fall-damage.mp4` | Run Amok, Kevin MacLeod | free to use with credit | `Music: "Run Amok" by Kevin MacLeod (incompetech.com)` / `Licensed under Creative Commons: By Attribution 4.0` / `https://creativecommons.org/licenses/by/4.0/` |

For the picker route, the song's hook lines up if it starts **49.1s in**:
"work it, make it, do it" arrives on the water bucket, "harder, better, faster,
stronger" on the slime launch, and the cut at **0:14.6** (the record scratch)
falls right after "stronger". If the picker can't trim, the scratch still reads
as a gag over the song.

## Upload settings

Category **Gaming** (game: Minecraft), language English, uploaded as a
Short (23s, 1080×1920). Audience **not made for kids**.

Thumbnail: `thumbnail-fall-damage.jpg` (`npm run fall:thumb`).

Sound: `npm run fall:mix` (Run Amok), `fall:mix:hbfs` (Daft Punk) or
`fall:sfx` (no music) builds the track from `public/audio/src/` plus the
game's hurt sound for both "oof"s — every other sound is synthesised in
`scripts/build-fall-audio.py` — then `npm run fall:audio` or
`fall:audio:hbfs`. The songs themselves are the owner's files and are never
committed.

Loop: the respawn lands him back on the cliff edge in the opening frame's
exact framing, crouching into the jump that frame 0 starts; the music under
the respawn is the stretch just before where the opening picks the track up.

## Why this one

GarrettTheCarrot's (6.1M subs) 198 Shorts have a 10M median, and the ones
far above it share one shape: a mechanic every player knows, with its logic
played out on the character — *Minecraft food* 286M, *If Crafting had
Consequences* 210M, *Inventory Parkour* 183M, *Bridging in Minecraft* 95M,
*Minecraft attack speed* 56M. Our earlier Shorts were relatable scenarios,
which is his median shape. Fall damage is a mechanic he has never done (no
title mentions falls, MLGs, water buckets, slime or hay), it builds tension
by itself, and it ends on the thing every player has actually lived: surviving
the huge fall and dying to the tiny one. The numbers are right, too — a
4-block drop deals exactly half a heart — which is the kind of detail that
gets "wait that's actually accurate" comments.
