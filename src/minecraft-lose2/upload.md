# Upload copy — Dying in the Nether with your gear

The same audio as GarrettTheCarrot's "Losing your stuff in Minecraft"
(https://www.youtube.com/shorts/ydJd0FWZhNM), with its own story. Every cut and
sound cue sits on the frame it does in his video, so the track lines up, but the
picture is different: a ghast fireball instead of a creeper, a respawn in his
bedroom, a map, a portal, a strider across the lava, a piglin who pays him in
cobblestone, and a despawn countdown you watch run out. The stick-figure remake
of his original is a separate video (`losing-your-stuff.mp4`).

## Before you upload: the audio is his

The sound is lifted straight off his video. He can claim it or take it down,
and Content ID can match any music under it. The description credits him; that
helps but is not a licence. The picture is different enough that this one
reads as its own video, but the audio is still his. The safe routes: ask him
first, or upload `nether-death-silent.mp4` and add a song in YouTube's Shorts
sound picker.

## Title

```
Dying in the Nether with your gear 💀 #shorts
```

**Alternates:**

```
Ghasts are the reason you lose your stuff #minecraft #shorts
```
```
POV: you died in the Nether 😭 #shorts
```

## Description

```
Die to a ghast 💥
Walk all the way back through the portal…
Trade with a piglin (get cobblestone) 🐷
It's all still there!! 🥹
…5 minutes later 💀

Sound from GarrettTheCarrot's "Losing your stuff in Minecraft":
https://www.youtube.com/@GarrettTheCarrot

Oofy always gets hurt. New Minecraft animation every week.

🥕 Subscribe:
https://www.youtube.com/@LaughQuakees

#minecraft #minecraftshorts #minecraftmemes #minecraftanimation #oofy #shorts
```

## Tags

```
minecraft, minecraft shorts, minecraft nether, minecraft ghast, losing your stuff, minecraft death, minecraft item despawn, minecraft piglin, minecraft strider, minecraft portal, minecraft animation, minecraft meme, minecraft memes, minecraft funny, minecraft logic, minecraft cartoon, oofy, oof craft, gaming animation, shorts
```

## Pinned comment

```
how many times has a ghast taken your whole inventory? 😭
```

## Files

| file | what it is |
|---|---|
| `nether-death.mp4` | the Short on his soundtrack, 16.9 s, 1080×1920 |
| `nether-death-silent.mp4` | the same picture with no sound, for the Shorts sound picker |
| `thumbnail-nether-death.jpg` | 9:16, the last second before it all despawns |

Category **Gaming** (game: Minecraft), language English, not made for kids.

## Rebuilding it

```bash
npm run lose2:audio   # render the silent picture, then ffmpeg lays his track under it
npm run lose2:thumb
```

Needs his video at `public/audio/src/garrett-losing-stuff.mp4` (the owner's
copy, ignored, never committed).

## What is his and what is ours

His: the audio, and the shape of the joke (die, get everything back, lose it
again). Ours: everything you see. The timeline is his, so sound cues land
correctly: explosion at frame 2, respawn 19, the eyes 265–279, the grin 300 and
the "meh" 315, the despawn at 421, the scratch 423, the gasp 426, the scream 461.
