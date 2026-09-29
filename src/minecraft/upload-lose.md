# Upload copy — Losing your stuff in Minecraft (Oofy remake)

A shot-for-shot remake of GarrettTheCarrot's **"Losing your stuff in
Minecraft"** (https://www.youtube.com/shorts/ydJd0FWZhNM), with Oofy in the
hand-drawn look, played on **his own soundtrack**. It reuses the shot-for-shot
rebuild in this folder (`shots.tsx`); `cast="oofy"` swaps the stick figure for
Oofy and `drawn` adds the hand-drawn look.

## Before you upload: the audio is his

Same warning as the bridging Short. The sound is lifted straight off his
video, and every cut is on his frame, so he can claim it or take it down,
and Content ID can match any music under it. The description credits him;
that helps but is not a licence. The safe routes: ask him first, or upload
`losing-your-stuff-silent.mp4` and add a song in YouTube's Shorts sound
picker.

## Title

```
Losing your stuff in Minecraft 💀 #shorts
```

**Alternates:**

```
Minecrafters every time they lose their stuff #minecraft #shorts
```
```
Minecraft death is the worst part of the game 😭 #shorts
```

## Description

```
Die → walk all the way back → it's all still there… 🥹
…and then it despawns 💀

Reanimated with Oofy, after GarrettTheCarrot's "Losing your stuff in Minecraft":
https://www.youtube.com/@GarrettTheCarrot

Oofy always gets hurt. New Minecraft animation every week.

🥕 Subscribe:
https://www.youtube.com/@LaughQuakees

#minecraft #minecraftshorts #minecraftmemes #minecraftanimation #oofy #shorts
```

## Tags

```
minecraft, minecraft shorts, losing your stuff, minecraft death, minecraft creeper, minecraft despawn, minecraft items, minecraft lava, minecraft animation, minecraft meme, minecraft memes, minecraft funny, minecraft logic, minecraft cartoon, oofy, oof craft, reanimated, gaming animation, shorts
```

(299 characters, inside YouTube's 500.)

## Pinned comment

```
how many times has this happened to you? 😭 be honest
```

## Files

| file | what it is |
|---|---|
| `losing-your-stuff.mp4` | the Short on his soundtrack, 16.9 s, 1080×1920 |
| `losing-your-stuff-silent.mp4` | the same picture with no sound, for the Shorts sound picker |
| `thumbnail-losing-your-stuff.jpg` | 9:16, the joyful "it's all still there" moment |

Category **Gaming** (game: Minecraft), language English, not made for kids.

## Rebuilding it

```bash
npm run lose:audio   # render the silent picture, then ffmpeg lays his track under it
npm run lose:thumb
```

Needs his video at `public/audio/src/garrett-losing-stuff.mp4` (the owner's
copy, ignored, never committed). The wall sign, which reads "GarrettTheCarrot"
in his, reads "Oof Craft".
