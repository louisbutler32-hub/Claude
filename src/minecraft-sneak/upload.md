# Upload copy — Minecraft crouching makes no sense

Second in the "Minecraft ___ makes no sense" series after fall damage —
same title shape, same star, so the two start to read as a series.

## Title

```
Minecraft crouching makes no sense 💀 #shorts
```

**Alternates:**

```
Shift makes you invincible in Minecraft #minecraft #shorts
```
```
Never let go of shift #minecraft #shorts
```

## Description

```
Holding shift = can't fall ✅
Leaning 86° over lava ✅
Grabbing the diamond ✅
Pressing jump ❌🔥

(Sneaking only stops you walking off an edge. It does nothing in the air.)

Oofy always gets hurt. New Minecraft animation every week.

🥕 Subscribe:
https://www.youtube.com/@LaughQuakees

Music: "Sneaky Snitch" by Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0
https://creativecommons.org/licenses/by/4.0/

#minecraft #minecraftshorts #minecraftmemes #minecraftanimation #oofy #shorts
```

## Tags

```
minecraft, minecraft shorts, minecraft crouching, minecraft sneaking, shift in minecraft, minecraft lava, minecraft diamond, minecraft death, minecraft animation, minecraft meme, minecraft memes, minecraft funny, minecraft logic, minecraft cartoon, oofy, oof craft, gaming animation, shorts
```

(290 characters, inside YouTube's 500.)

## Pinned comment

```
be honest, how many diamonds have you lost to lava? 💎🔥
```

## Which version to upload

| file | music | copyright |
|---|---|---|
| `minecraft-crouching.mp4` | Sneaky Snitch, Kevin MacLeod (credit already in the description) | free to use with credit |
| `minecraft-crouching-pink-panther.mp4` | The Pink Panther Theme — baked in, the bass entrance on frame 0, cut at the mid-air realisation | **will almost certainly be claimed by Content ID** — usually stays up with the revenue going to the rights holder; can be blocked or muted in some countries. Swap the music line for `Music: Henry Mancini – The Pink Panther Theme` |
| `minecraft-crouching-no-music.mp4` | none — add a song in YouTube's Shorts sound picker | licensed through YouTube; delete the music line from the description |

Song for the picker route: **"The Pink Panther Theme" (Henry Mancini)** —
the sneaking tune everyone knows. Cut it at **0:09.7**, where he hangs in the
air and the record scratch hits; if the picker can't trim, the scratch still
reads as a gag over it.

## Upload settings

Category **Gaming** (game: Minecraft), language English, uploaded as a Short
(16s, 1080×1920). Audience **not made for kids**.

Thumbnail: `thumbnail-crouching.jpg` (`npm run sneak:thumb`).

Sound: `npm run sneak:mix` (Sneaky Snitch), `sneak:mix:pink` (Pink Panther,
the owner's copy in the ignored `public/audio/src/`) or `sneak:sfx` (no music), then
`npm run sneak:audio`. Everything but the music and the three "oof"s is
synthesised in `scripts/build-sneak-audio.py`.

Loop: the respawn crouch-walks into frame 0's exact position and walk cycle,
and the music comes back in under the respawn at the point the opening
continues from.

## Why this one

Same shape as the channel's reference data says wins (GarrettTheCarrot's top
Shorts all take one well-known mechanic and play out its logic): the sneak
edge-catch is something every player relies on, it has never been one of his
titles, and the rule it breaks — sneaking does nothing mid-air — is exactly
the kind of accurate detail players comment on.
