# Upload copy — POV: you never miss at table tennis

An original Short in the same shape as "tennis time": one well-known thing taken
to its logical extreme, in about eleven seconds. You never miss. Every return is a
little quicker than the last, and the rally runs away from him. The audio is
entirely original, so nothing in it can be claimed.

## Title

```
POV: you never miss at table tennis 🏓😭 #shorts
```

**Alternates:**

```
Table tennis, but you are way too good #shorts
```
```
He's been returning for 8 seconds. Please stop. 🏓 #shorts
```

## Description

```
POV: you never miss at table tennis 🏓
Every return gets a little faster. He is not okay.

BALL SPEED: 10 → 999 km/h 😳

Oofy always gets hurt. New animation every week.

🥕 Subscribe:
https://www.youtube.com/@LaughQuakees

#shorts #tabletennis #pingpong #animation #oofy
```

## Tags

```
table tennis, ping pong, table tennis funny, ping pong funny, table tennis meme, table tennis animation, ping pong animation, ping pong rally, funny animation, cartoon, animation meme, oofy, oof craft, shorts
```

## Pinned comment

```
how many times do you think it goes back and forth? 🏓👇
```

(It is 15 returns, from one every 0.7 s down to one every 0.27 s.)

## Which version to upload

| file | music | copyright |
|---|---|---|
| `table-tennis.mp4` | an original melody made from the rally itself (every hit is a note), with a bass pulse, a riser and a kick | none — nothing licensed in it |
| `table-tennis-no-music.mp4` | none — only the paddle knocks, table ticks and the bonk | add a song in YouTube's Shorts sound picker if you like |

Song for the picker route: any fast, escalating track works. Start it so its
drop lands at **0:07.8** (the bonk).

## Upload settings

Category **Entertainment**, language English, uploaded as a Short (11.5 s,
1080×1920). Audience **not made for kids**.

Thumbnail: `thumbnail-table-tennis.jpg` (`npm run tt:thumb`).

## How it works

- **The rally:** you stand at one end of the table, Oofy at the other (blue hoodie).
  He serves. Your paddle swings in at the bottom of the frame for every return.
  The gap between hits shrinks 7% each time, from 22 frames to 8.
- **The build:** his face goes from sly to plain to gritted to worried to a scream;
  sweat flies off him; his paddle smears into a blur; the speed readout climbs
  from 10 to 214 km/h (it shows the real pace of the rally, so it stops where the
  rally does).
- **The music is the rally:** each hit is a note of a rising pentatonic scale
  (bright and high when he hits, lower and rounder when you do), with a bass
  pulse on yours, a rising noise riser, and a kick that joins when it gets quick.
- **The twist:** your last return is never returned. It bounces on his half and
  hits him in the face. He falls over off the end of the table, and the ball
  bounces itself out, each bounce lower and softer, to silence.

## Rebuilding it

```bash
npm run tt:audio   # render, then ffmpeg lays the mix under it
npm run tt:thumb
```

The rally's timing is in `src/tabletennis/beats.json`, shared by the picture and
the sound.
