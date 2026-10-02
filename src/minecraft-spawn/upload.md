# Upload copy — "I spawned in a cave!!" (Oof Craft remake)

A shot-for-shot remake, in the Oof Craft cube-head cartoon look, of a 24-second Minecraft
animation Short: a skeleton spawns in a trial chamber and thinks it's a cave, a tired old
zombie sat against the wall tells it otherwise, the skeleton finds the water channels,
rides them ("wee!!"), goes straight off the drop, dies, lands pink, respawns — "I'm
alive!!" — climbs out into the sunshine, and a player in netherite is waiting at the
door. Every cut and every caption is on the reference's own time (cuts measured with a
scene-change detector and a 10 fps contact sheet, lines timed with Whisper).

## Before you upload

- **The voice track is the original's**, lifted straight off the source video, and the
  picture copies its shots beat for beat. The source carries a CircleToonsHD watermark,
  so that is who to credit — add the credit where marked in the description, or ask
  them first. Their watermark is not reproduced in the remake.
- No swearing in the track. Category **Gaming** (game: Minecraft), language English,
  Short (24 s, 1080×1920). Audience **not made for kids**, as on the rest of the line.

## Title

```
I spawned in a cave!! 💀 (it was not a cave) #shorts
```

**Alternates:**

```
Skeleton's first day in the trial chamber 💀🌊 #minecraft #shorts
```
```
"Wow, it's got water too!" — famous last words #minecraft #shorts
```

## Description

```
"I spawned in a cave!!" — "This is no cave…" 💀

The skeleton found the trial chamber's water channels. Wee!! 🌊

Redrawn in the Oof Craft style after the original Minecraft animation by CircleToonsHD: [ADD THE ORIGINAL'S LINK HERE]

Oofy always gets hurt. New Minecraft animation every week.

🥕 Subscribe:
https://www.youtube.com/@LaughQuakees

#minecraft #minecraftanimation #minecraftmemes #minecraftshorts #shorts
```

## Tags

```
minecraft, minecraft animation, minecraft shorts, minecraft memes, minecraft funny, trial chamber, minecraft skeleton, minecraft zombie, skeleton spawn, i spawned in a cave, minecraft water, minecraft cartoon, minecraft remake, redrawn, oofy, oof craft, gaming animation, shorts
```

(378 characters, inside YouTube's 500-character cap.)

## Pinned comment

```
What would YOU do if you spawned in a trial chamber? 👇
```

## Files

| file | what it is |
|---|---|
| `spawn.mp4` | the Short on the original's soundtrack, 24.3 s, 1080×1920 |
| `spawn-nocaptions.mp4` | the same Short with no captions |
| `spawn-silent.mp4` | the same picture with no sound, for the sound picker |
| `thumbnail-spawn.jpg` | 9:16, the skeleton happy in the water |

## Rebuilding it

```bash
npm run spawn:audio      # renders the silent picture, then ffmpeg lays the original's track under it
npm run spawn:nocaptions
npm run spawn:thumb
npm run spawn:sheet      # half-size render + a 2 fps contact sheet, for checking against the reference
```

The original's video sits at `public/audio/src/spawn.mp4` (gitignored, never
committed). The characters are drawn in code (`src/minecraft-spawn/cast.tsx`), the
chamber in `src/minecraft-spawn/scenery.tsx`, and the shots in
`src/minecraft-spawn/SpawnShort.tsx`; the cut list and captions are `beats.json`.
