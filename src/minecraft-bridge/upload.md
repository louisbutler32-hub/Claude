# Upload copy — Java Players vs Bedrock Players: bridging

A shot-for-shot remake of GarrettTheCarrot's **"Bridging in Minecraft
(REANIMATED)"** (https://www.youtube.com/shorts/GFMQV5TiUSw), drawn with our
cast in our hand-drawn look and played on **his own soundtrack**. Third in
the channel's Java vs Bedrock run after PvP and the chunk loads.

## Before you upload: the audio is his

The track is lifted straight off his video, and the picture copies his
shots beat for beat. That is the ask. It also means:

- **He can claim it or take it down.** The sound is his work, and any
  licensed music under it belongs to its label, so Content ID can match
  it. A manual claim or a copyright strike from him is also possible,
  since the whole video copies his.
- **Credit him in the description** (already written in below). Remakes that
  name their source are the ones creators tend to leave alone; it is not a
  licence, though.
- **The safe route is to ask him first**, or swap the track: the video
  keeps every beat without it, so `out/java-vs-bedrock-bridging-silent.mp4`
  plus a song from YouTube's Shorts sound picker is a claim-free version.

## Title

```
Java Players vs Bedrock Players: Bridging 🧱😳 #shorts
```

**Alternates:**

```
Bedrock players can bridge forward 💀 (Java vs Bedrock) #minecraft #shorts
```
```
Bridging in Minecraft: Java vs Bedrock #shorts
```

## Description

```
Java: sneak… place… don't look down… 😰
Bedrock: walk forward, build a staircase to space, do a loop-the-loop 😎

Reanimated with Oofy, after GarrettTheCarrot's "Bridging in Minecraft":
https://www.youtube.com/@GarrettTheCarrot

Oofy always gets hurt. New Minecraft animation every week.

🥕 Subscribe:
https://www.youtube.com/@LaughQuakees

#minecraft #minecraftshorts #javavsbedrock #minecraftmemes #minecraftanimation #shorts
```

## Tags

```
minecraft, minecraft shorts, java vs bedrock, java players vs bedrock players, bedrock players, java players, minecraft bridging, bridging, speed bridging, sneak bridging, minecraft animation, minecraft meme, minecraft memes, minecraft funny, minecraft logic, minecraft cartoon, oofy, oof craft, reanimated, gaming animation, shorts
```

(332 characters, inside YouTube's 500.)

## Pinned comment

```
Java or Bedrock — which one are you? 👇
```

## Files

| file | what it is |
|---|---|
| `java-vs-bedrock-bridging.mp4` | the Short on Garrett's soundtrack, 13.9 s, 1080×1920 |
| `java-vs-bedrock-bridging-silent.mp4` | the same picture with no sound, for the Shorts sound picker |
| `thumbnail-java-vs-bedrock-bridging.jpg` | 9:16, the pass-by: Bedrock blasting past, Java losing his block |

## Upload settings

Category **Gaming** (game: Minecraft), language English, uploaded as a Short.
Audience **not made for kids**.

## Rebuilding it

```bash
npm run bridge:mix      # his video → public/audio/bridge-mix.wav (needs public/audio/src/garrett-bridging-reanimated.mp4)
npm run bridge:audio    # render the silent picture, then ffmpeg lays the track under it
npm run bridge:thumb
```

ffmpeg does the final mux on purpose. The renderer's own AAC encode writes
no priming edit list, so it plays 28 ms late. The ffmpeg mux measures
sample-exact against the reference (lag 0, correlation 1.000).

## How it maps to his

Every cut is on his frame: 29, 65, 149, 176, 192, 249, 339, out at 416.
They were measured with a scene-change detector, and every beat inside a
shot was checked frame by frame (`beats.json`). The perspective shots use
measured screen quads. The end shot uses a pinhole camera fitted to his
bridge's corners and vanishing point. What changed:

- The stick figures are Oofy. Java wears the purple hoodie and band-aid.
  Bedrock wears a blue hoodie and has no band-aid, because he never gets
  hurt.
- The motion runs on ones, smooth at the full 30 fps like his. The lines
  still boil every other frame, and the textures are flat pixels with plum
  outlines like Oofy's.
- Faces slide across the head toward where the character is looking, the
  way his do. Bedrock's opening is sped up: a block every 4 frames, with
  the camera scrolling to keep up.
- The name tags are set in Monocraft, the open lookalike of the game's own
  lettering.
- His "GarrettTheCarrot" on the side of the blue bridge reads "Oof Craft".
