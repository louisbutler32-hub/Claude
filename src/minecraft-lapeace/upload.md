# Upload copy — "That's La Peace" (Oofy remake)

A shot-for-shot remake, in our hand-drawn look with Oofy, of a viral Minecraft
animation: two friends in a lava cave shout DIAMOND at a wall of ore, a miner
breaks through into a sunbeam over an impossible meadow, a glowing treasure hangs
in the light, a Greek temple stands in the flowers, and the last close-up finds the
hero crowned with laurel. Every cut and every subtitle is on the original's own
time (cuts measured with a scene-change detector, voice lines timed with Whisper).

## Before you upload

- **The voice track is the original's**, lifted straight off the video, and the
  picture copies its shots beat for beat. That is the ask, but it means the
  original creator (the faint watermark in the corner of the source reads
  something like "Skitless0", so check) can claim it or take it down, and any
  music under it can be matched by Content ID. **Credit them in the description**
  once you have confirmed the name (add it where marked), or ask them first.
- The track has a strong swear in it ("What the f—k is that"); the on-screen
  subtitles keep the original's censored "F###". If you want to be monetisation
  safe, put a song from the Shorts sound picker over `la-peace-silent.mp4` instead.
- Audience: **not made for kids**. Category Gaming (Minecraft).

## Title

```
That's La Peace 🏛️💎 #shorts
```

**Alternates:**

```
Minecraft: Oofy finds La Peace (Greek temple?!) #minecraft #shorts
```
```
DIAMOND DIAMOND → "What is this some Greek…" 😭 #shorts
```

## Description

```
DIAMOND! DIAMOND! Then… what is this? Some Greek temple? 🏛️💎

Remade with Oofy after the original Minecraft animation: [ADD THE ORIGINAL CREATOR'S NAME / LINK HERE]

Oofy always gets hurt. New Minecraft animation every week.

🥕 Subscribe:
https://www.youtube.com/@LaughQuakees

#minecraft #minecraftanimation #minecraftmemes #minecraftshorts #shorts
```

## Tags

```
minecraft, minecraft animation, minecraft shorts, minecraft memes, minecraft funny, diamond diamond, la peace, minecraft temple, greek minecraft, minecraft remake, reanimated, oofy, oof craft, gaming animation, shorts
```

## Pinned comment

```
What do you think La Peace is? 👇
```

## Files

| file | what it is |
|---|---|
| `la-peace.mp4` | the Short on the original's soundtrack, 13.4 s, 1080×1920 |
| `la-peace-silent.mp4` | the same picture with no sound, for the sound picker |
| `thumbnail-la-peace.jpg` | 9:16, the treasure in the beam |

## Rebuilding it

```bash
npm run lapeace:audio    # renders the silent picture, then ffmpeg lays the original's track under it
npm run lapeace:thumb
```

The original's video sits at `public/audio/src/lapeace.mp4` (gitignored, never
committed). The textures (ore, pickaxe) are your own pictures in
`public/images/pov2/` (also gitignored).
