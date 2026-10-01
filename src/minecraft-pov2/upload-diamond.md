# Upload copy — POV: You finally find diamonds

First person, in a dark stone tunnel, 13 s, built to loop. Four stone blocks on the
beat; the fourth breaks on the drop of Harder, Better, Faster, Stronger and there is
a wall of diamond ore; four diamonds of two hits each; then the pickaxe breaks (the
Sword-Armor-Tool-Break file). The funny bit: the hotbar scrolls to the bread, he
bonks the ore with it twice (nothing happens), then eats it in three bites. The
music is muffled when the pickaxe goes and swells back by the end, and the last
frames dissolve into the first, so the Short loops with no jump. Real Minecraft
textures (stone, diamond ore, iron pickaxe, the cracks), crisp pixels.

## Before you upload

- The music is Daft Punk's "Harder, Better, Faster, Stronger": a licensed
  track, so Content ID **will** match it. Expect a claim; for a claim-free
  upload use `pov-diamond-nomusic.mp4` with a song from the Shorts sound
  picker. The effects are your Minecraft sound files plus your tool-break file.
- Audience: **not made for kids**. Category Gaming (Minecraft).

## Title

```
POV: You finally find diamonds 💎😭 #shorts
```

**Alternates:**

```
When your pickaxe breaks on the LAST diamond (so you hit it with bread) 💀 #minecraft #shorts
```
```
POV: you found a diamond vein (but…) 💎 #shorts
```

## Description

```
You found the vein. You mined it. Then your pickaxe said no… so you tried bread. 🍞💎

How many diamonds did you get? 👇

Oofy always gets hurt. New Minecraft animation every week.

🥕 Subscribe:
https://www.youtube.com/@LaughQuakees

#minecraft #minecraftshorts #minecraftmemes #minecraftpov #diamonds #shorts
```

## Tags

```
minecraft, minecraft shorts, minecraft diamonds, find diamonds minecraft, minecraft pov, pov minecraft, pickaxe breaks, minecraft mining, minecraft diamond ore, minecraft memes, minecraft funny, minecraft animation, oofy, oof craft, gaming animation, shorts
```

## Pinned comment

```
How many diamonds did you get before it broke? 👇
```

## Files

| file | what it is |
|---|---|
| `pov-diamond.mp4` | the Short with music, 13.1 s, 1080×1920, loops clean |
| `pov-diamond-nomusic.mp4` | effects only, for the sound picker |
| `thumbnail-pov-diamond.jpg` | 9:16, the wall of ore mid-mining |

## Rebuilding it

```bash
npm run pov:diamond:mix && npm run pov:diamond:sfx   # needs harder-better-faster-stronger.mp3, stone-breaking.mp4, mc-sfx-top20.mp4
npm run pov:diamond:audio
npm run pov:diamond:thumb
```
