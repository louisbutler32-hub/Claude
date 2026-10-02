# Upload copy — "That's La Peace" (Oof Craft remake)

A shot-for-shot remake, fully in the Oof Craft hand-drawn look, of a viral Minecraft
animation. The three characters keep the original's costumes, redrawn as Oofy: the cap
guy (red cap, white tee, chain), the straw-hat guy (red band, open red vest, yellow sash,
scar under the eye) and the wise one (white toga, laurel crown). Two friends in a lava
cave shout DIAMOND at a wall of lapis, the straw-hat guy mines through into a sunbeam over
an impossible meadow, a glowing little monk floats in the light, a Greek temple stands
in the flowers, and the last close-up finds the wise one crowned in laurel. Every cut and
every subtitle is on the original's own time (cuts measured with a scene-change detector,
voice lines timed with Whisper). The third shot (0:03) is an original scene: the
pickaxe cracks the tunnel wall and daylight floods in.

Two versions: `la-peace.mp4` has the game-style subtitle bar like the original
(DIAMOND, "That's La Peace", ...), and `la-peace-nocaptions.mp4` has none.

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
DIAMOND DIAMOND… what is this Greek temple?! #minecraft #shorts
```
```
Minecraft: The La Peace meadow, redrawn 💎🏛️ #shorts
```

## Description

```
DIAMOND! DIAMOND! Then… what is this? Some Greek temple? 🏛️💎

Redrawn in the Oof Craft style after the original Minecraft animation: [ADD THE ORIGINAL CREATOR'S NAME / LINK HERE]

Oofy always gets hurt. New Minecraft animation every week.

🥕 Subscribe:
https://www.youtube.com/@LaughQuakees

#minecraft #minecraftanimation #minecraftmemes #minecraftshorts #shorts
```

## Tags

```
minecraft, minecraft animation, minecraft shorts, minecraft memes, minecraft funny, diamond diamond, la peace, lapis, minecraft temple, greek minecraft, minecraft remake, redrawn, oofy, oof craft, gaming animation, shorts
```

## Pinned comment

```
What do you think La Peace is? 👇
```

## Files

| file | what it is |
|---|---|
| `la-peace.mp4` | the Short on the original's soundtrack, 13.4 s, 1080×1920 |
| `la-peace-nocaptions.mp4` | the same Short with no subtitle bar |
| `la-peace-silent.mp4` | the same picture with no sound, for the sound picker |
| `thumbnail-la-peace.jpg` | 9:16, the monk in the beam |

## Rebuilding it

```bash
npm run lapeace:audio    # renders the silent picture, then ffmpeg lays the original's track under it
npm run lapeace:nocaptions
npm run lapeace:thumb
```

The original's video sits at `public/audio/src/lapeace.mp4` (gitignored, never
committed). The textures (lapis ore — "La Peace" is lapis — and the pickaxe) are your own pictures in
`public/images/pov2/` (also gitignored). The characters are drawn in code
(`src/minecraft-lapeace/cast.tsx`, on top of `src/minecraft/oofy.tsx`).
