# Upload copy — "That's La Peace" (IShowSpeed × Kai Cenat remake)

A shot-for-shot remake, in our hand-drawn look with the owner's two characters rebuilt as Minecraft-skin models like the original's (IShowSpeed: locs, stubble, purple hoodie, the hero; Kai Cenat: afro, beard, green hoodie, the one crowned in laurel), of a viral Minecraft
animation: two friends in a lava cave shout DIAMOND at a wall of ore, a miner
breaks through into a sunbeam over an impossible meadow, a glowing treasure hangs
in the light, a Greek temple stands in the flowers, and the last close-up finds the
hero crowned with laurel. Two versions: `la-peace.mp4` has the game-style subtitle bar like the original (DIAMOND, "That's La Peace", ...), and `la-peace-nocaptions.mp4` has none. The third shot (0:03) is an original scene: the hero smashes through the tunnel wall and daylight floods in. Every cut and every subtitle is on the original's own
time (cuts measured with a scene-change detector, voice lines timed with Whisper).

## Version 2: rebuilt in real 3D

`src/lapeace3d/` rebuilds the whole Short as a real 3D scene (three.js through Remotion):
voxel terrain, lit materials, fog, a sunbeam and glowing items, and the owner's two
characters as Minecraft-skin models (skins painted by `scripts/make-skins.py`) seen through
a moving camera, the way the original is made. Same cuts, voice lines and subtitles.
Render with `npm run lapeace3d:audio` (needs `--gl=swangle`, software WebGL; about 4 minutes).
Files: `la-peace-3d.mp4` (with subtitles), `la-peace-3d-nocaptions.mp4`, `la-peace-3d-silent.mp4`.

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
IShowSpeed and Kai Cenat find La Peace 💎🏛️ #shorts
```

## Description

```
DIAMOND! DIAMOND! Then… what is this? Some Greek temple? 🏛️💎

Remade with cartoon IShowSpeed and Kai Cenat after the original Minecraft animation: [ADD THE ORIGINAL CREATOR'S NAME / LINK HERE]

Oofy always gets hurt. New Minecraft animation every week.

🥕 Subscribe:
https://www.youtube.com/@LaughQuakees

#minecraft #minecraftanimation #minecraftmemes #minecraftshorts #shorts
```

## Tags

```
minecraft, minecraft animation, minecraft shorts, minecraft memes, minecraft funny, diamond diamond, la peace, ishowspeed, kai cenat, minecraft temple, greek minecraft, minecraft remake, reanimated, oofy, oof craft, gaming animation, shorts
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
| `thumbnail-la-peace.jpg` | 9:16, the treasure in the beam |

## Rebuilding it

```bash
python3 scripts/make-skins.py   # paints the two Minecraft skins (public/images/skins/)
npm run lapeace:audio    # renders the silent picture, then ffmpeg lays the original's track under it
npm run lapeace:thumb
```

The original's video sits at `public/audio/src/lapeace.mp4` (gitignored, never
committed). The textures (lapis ore — "La Peace" is lapis — and the pickaxe) are your own pictures in
`public/images/pov2/` (also gitignored).
