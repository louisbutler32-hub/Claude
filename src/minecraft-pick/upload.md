# Upload copy — The wooden pickaxe nobody picks

A neglected-gear story in the reference's stick-figure look: an old **Wooden Pickaxe**
wakes up thrilled when its player walks in and daydreams about being used; his hand
reaches for it, goes right past it, and takes the shiny **Diamond Pickaxe** next to it.
It cries while he mines diamonds, its durability runs out and it cracks and breaks; the
diamond pickaxe then jumps out of his hand into lava; and the last shot is the player
mourning both while the wooden pickaxe's ghost floats up smiling. The last frames
dissolve into the first (the pickaxe asleep), so the Short loops.

Inspired by the "Xbox 360 gets replaced by a PS5" Short (same idea: the old thing hopes,
gets passed over, and dies of heartbreak). The pickaxes, the setting, the story, the ending
and the soundtrack are all different. If you want to credit the idea, add that Short's
creator to the description.

## Before you upload

- **The music is entirely original** (synthesised in `scripts/build-pick-audio.py`), so it
  ships with no claim. The effects are your Minecraft sound files (stone breaking, XP
  ding, footsteps, tool break) plus synthesised snores, sobs, cracks, lava and a harp.
- Audience: **not made for kids**. Category Gaming (Minecraft).

## Title

```
The wooden pickaxe nobody picks 😭⛏️ #shorts
```

**Alternates:**

```
Wooden pickaxe vs diamond pickaxe (he picked wrong) 💀 #minecraft #shorts
```
```
When you upgrade your pickaxe and your old one finds out 😭 #minecraft #shorts
```

## Description

```
He woke up so happy. Then the hand went right past him. 😭⛏️

(Wooden pickaxe: 59 uses. Diamond pickaxe: 1,561. One of them did not make it.)

Which pickaxe was your first? 👇

Oofy always gets hurt. New Minecraft animation every week.

🥕 Subscribe:
https://www.youtube.com/@LaughQuakees

#minecraft #minecraftshorts #minecraftmemes #minecraftanimation #pickaxe #shorts
```

## Tags

```
minecraft, minecraft shorts, minecraft animation, minecraft memes, minecraft funny, wooden pickaxe, diamond pickaxe, pickaxe breaks, minecraft durability, minecraft sad, minecraft story, minecraft lava, minecraft diamonds, stick figure animation, oof craft, gaming animation, shorts
```

## Pinned comment

```
RIP wooden pickaxe. What was your first tool? 👇
```

## Files

| file | what it is |
|---|---|
| `pick.mp4` | the Short with music, 22 s, 1080×1920, loops clean |
| `pick-nomusic.mp4` | effects only |
| `thumbnail-pick.jpg` | 9:16, the hand passing the wooden pickaxe |

## Rebuilding it

```bash
npm run pick:mix && npm run pick:sfx   # needs stone-breaking.mp4, mc-sfx-top20.mp4, tool-break.mp3
npm run pick:audio
npm run pick:thumb
```
