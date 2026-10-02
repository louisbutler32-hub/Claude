# Upload copy — Nobody: / Minecraft players: (cooking)

An original take on the viral "Minecraft food" format (GarrettTheCarrot's
top Short, https://www.youtube.com/@GarrettTheCarrot): Oofy cooks four meals
by Minecraft's crafting rules and eats them. Not a copy of his video: the
picture, jokes and sound are new.

## Before you upload

- The picture and the music are original, but the XP ding, eating crunches
  and hurt sound are Minecraft's own sound files (yours, from
  `public/audio/src/`). Game sound effects are normally fine, but if Content ID
  flags it, use `minecraft-food-nomusic.mp4` or pick a song in the Shorts
  sound picker.
- Audience: **not made for kids**, Category Gaming (Minecraft).

## Title

```
Nobody: Minecraft players cooking 💀 #shorts
```

**Alternates:**

```
Cooking in Minecraft is just a crafting table 🍞🎂 #shorts
```
```
Minecraft players eating be like… 🐔💀 #minecraft #shorts
```

## Description

```
Bread: 3 wheat in a row 🍞
Golden carrot: 1 carrot + 8 gold nuggets 🥕
Cake: 9 ingredients, 7 bites 🎂
Raw chicken: "it's fine" 🐔💀

Which one do you eat when you're starving? 👇

Oofy always gets hurt. New Minecraft animation every week.

🥕 Subscribe:
https://www.youtube.com/@LaughQuakees

#minecraft #minecraftshorts #minecraftmemes #minecraftanimation #shorts
```

## Tags

```
minecraft, minecraft shorts, minecraft food, minecraft cooking, minecraft crafting, minecraft memes, minecraft funny, minecraft logic, nobody minecraft players, minecraft golden carrot, minecraft cake, raw chicken minecraft, minecraft animation, minecraft cartoon, oofy, oof craft, gaming animation, shorts
```

## Pinned comment

```
Raw chicken or starve? Be honest 👇
```

## Files

| file | what it is |
|---|---|
| `minecraft-food.mp4` | the Short with music, 12.5 s, 1080×1920 |
| `minecraft-food-nomusic.mp4` | effects only, for the sound picker |
| `thumbnail-minecraft-food.jpg` | 9:16, the finished cake |

## Rebuilding it

```bash
npm run food:mix && npm run food:sfx   # needs public/audio/src/mc-sfx-top20.mp4, mc-damage.mp3
npm run food:audio
npm run food:thumb
```
