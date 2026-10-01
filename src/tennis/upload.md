# Upload copy — Tennis time (Oofy remake)

A remake of GarrettTheCarrot's "tennis time" (https://www.youtube.com/shorts/OKGK89Peshs,
56M views, 8 s), drawn with Oofy in the hand-drawn look and played on **his own
soundtrack**. The rally's rhythm is his: the opponent hits at frames 16, 76, 136,
196; the viewer's return lands at 46, 106, 166; the music's pocks sit on those.

## Before you upload: the audio is his

The sound is lifted straight off his video. He can claim it or take it down,
and Content ID can match any music under it. The description credits him; that
helps but is not a licence. The safe routes: ask him first, or upload
`tennis-time-silent.mp4` and add a song in YouTube's Shorts sound picker.

## Title

```
Tennis time 🎾 #shorts
```

**Alternates:**

```
Use the comment button to hit back! 🎾 #shorts
```
```
Tennis, but YOU are the other player #shorts
```

## Description

```
Use the comment button to hit back! 🎾
(He's been running for 8 seconds. Please.)

Reanimated with Oofy, after GarrettTheCarrot's "tennis time":
https://www.youtube.com/@GarrettTheCarrot

Oofy always gets hurt. New animation every week.

🥕 Subscribe:
https://www.youtube.com/@LaughQuakees

#shorts #tennis #animation #oofy
```

## Tags

```
tennis, tennis time, tennis funny, tennis meme, tennis animation, tennis shorts, tennis rally, funny animation, cartoon, animation meme, oofy, oof craft, reanimated, shorts
```

## Pinned comment

```
you hit it back 3 times. he missed on the 4th. that's your fault 😭
```

## Files

| file | what it is |
|---|---|
| `tennis-time.mp4` | the Short on his soundtrack, 7.9 s, 1080×1920 |
| `tennis-time-silent.mp4` | the same picture with no sound, for the Shorts sound picker |
| `thumbnail-tennis-time.jpg` | 9:16, the ball huge over the net |

Category **Entertainment**, language English, not made for kids.

## How it works

The camera is on the viewer's side of the net. Oofy hits a high ball that grows
toward the lens (every size and position of the ball was measured off the
reference); an invisible return of yours sends it back up the court; and every
30 frames the ball changes ends, which is the beat. On each return the picture
takes a small knock. The third return goes over his head: he dives, swings at
nothing, lets go of the racket, and lies on the court.

## Rebuilding it

```bash
npm run tennis:audio   # render, then ffmpeg lays his track under it
npm run tennis:thumb
```

Needs his video at `public/audio/src/garrett-tennis.mp4` (the owner's copy,
ignored, never committed).
