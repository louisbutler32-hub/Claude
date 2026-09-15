# Minecrafters every time they lose their stuff

A 17-second vertical Short (1080×1920, 30 fps, 506 frames), rebuilt shot for
shot from a reference video: the white caption band on top, and under it a
stick figure who dies to a creeper, grieves in the overworld, walks all the
way back, finds everything still there — and watches it despawn.

```bash
npm run minecraft          # out/minecraft-short.mp4
npm run minecraft:thumb    # out/thumbnail-minecraft-short.jpg (9:16)
npm run minecraft:silent   # the same render with no audio track
npm run minecraft:sheet    # every frame at quarter size, for checking against the reference
```

## How it is put together

| file | what it holds |
|---|---|
| `beats.ts` | the cut list (ten shots) and the event sheet, in absolute frames — measured off the reference with a scene-change detector and a frame-by-frame pass |
| `figure.tsx` | the stick figure: poses are hand and foot positions relative to the neck, faces are named drawings, tints cover the damage flash and the lighting of each room |
| `pixels.tsx` | the pixel-art props (the eight items, poppy, spider eyes) as character grids, plus the creeper, torch, dead bush, chest and wall sign |
| `worlds.tsx` | one background per location: the cave (wide and low-angle), overworld, top-down map, cave mouth, stone room, lava lake, torchlit cave, house |
| `shots.tsx` | one component per shot — what the figure does on which frame |
| `MinecraftShort.tsx` | the composition: caption band, the ten shots in sequence, the audio slot |
| `Thumbnail.tsx` | the 9:16 thumbnail |

Every cut lands on the reference's frame. The caption is set in Selawik,
Microsoft's open-licensed stand-in for Segoe UI (the reference's caption
font); it is built from the UFO source in `microsoft/Selawik` and sits in
`public/fonts` with its licence.

## Things you may want to change

- **The wall sign.** The reference carries its creator's channel name on the
  sign in the stone room and the house. Here it reads `PebbloPebble`; it is
  one constant, `SIGN_TEXT` in `MinecraftShort.tsx`.
- **The sound.** The composition plays `public/audio/minecraft-mix.mp3` if it
  exists (the folder is gitignored). To lift the track off a source file:

  ```bash
  ffmpeg -i source.mp4 -vn -c:a libmp3lame -b:a 192k public/audio/minecraft-mix.mp3
  ```

  Nothing else is licensed for shipping by this repo; a track from YouTube's
  library goes on in the Shorts editor at upload, not into the render.
