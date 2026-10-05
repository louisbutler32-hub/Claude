# Upload copy — "He just wanted a friend" (original Minecraft animation, 20 s)

An original story, not a remake: a zombie keeps trying to make friends with a Steve who
keeps hitting him, until a skeleton's arrow gives him the chance to prove it. Original
art (cube-head cartoon cast, comic captions), original synthesised music and effects, no
borrowed audio, so it is clear to monetise and cannot be claimed.

Built on what the data says is working right now in Minecraft Shorts from small channels
(vidIQ, 2 Oct 2026): a 38 s zombie sacrifice story with 2.6M views from a 6K-subscriber
channel, and a 13 s "You love me?" Ghast-mother tearjerker with 1.4M views from a 5.7K
channel. What they share, and what this video copies in *structure only*:

| what the hits do | where it is here |
|---|---|
| a question/emotional hook in the first second | 0:00, "CAN WE BE FRIENDS?" over the zombie waving |
| a repeated line that pays off at the end | "friends?" at 0:00, 0:04, 0:15, answered by "YES." at 0:16 |
| trope inversion: the "monster" is the good one | the zombie takes the arrow meant for Steve |
| cute to sad to warm, in under 25 s | blow, blow, nights alone, the arrow, the apple |
| big readable text and a hard cut of music at the climax | comic captions; the score stops dead on the arrow |
| a loopable ending | the answer ("YES.") flows into the opening question |

## Before you upload

- **Nobody can promise views.** These formats win often for small channels, but it is still
  a lottery. The best lever you control is volume: ship one of these a day for two weeks,
  look at which one retains best (check the *Audience retention* graph for the 0:00-0:03
  drop), and make more like that one.
- Audience: Minecraft cartoons attract children. If you are deliberately aimed at under-13s
  you must flag it **made for kids**, which turns off comments and some features; YouTube may
  also decide this itself. If you aren't aiming at kids, leave it unflagged, and don't use
  kid-bait wording.
- Post it natively as a Short (vertical, under 60 s). Don't add a watermark or another
  channel's logo.

## Title

```
He Just Wanted a Friend 🧟💔 Minecraft Animation #shorts
```

**Alternates:**

```
Steve Kept Hitting the Zombie… Until the Skeleton Showed Up 😭 #minecraft #shorts
```
```
The Zombie Who Only Wanted ONE Friend 🥺 (Minecraft Animation)
```

## Description

```
He just wanted a friend. 🧟💔

Would YOU have let the zombie in? Tell me below 👇

An original Minecraft animation. New story every day.

🥕 Subscribe:
https://www.youtube.com/@LaughQuakees

#minecraft #minecraftanimation #shorts #zombie #sad #animation
```

## Tags

```
minecraft animation, minecraft, minecraft shorts, minecraft story, sad minecraft animation, zombie, minecraft zombie, steve, minecraft steve, skeleton, he just wanted a friend, friendship, emotional animation, minecraft sad story, minecraft cartoon, animation shorts, shorts, oof craft, oofy
```

## Pinned comment

```
Be honest: would you have let him sit by the fire the first night? 👇  (Part 2 if this hits 1K likes)
```

## Files

| file | what it is |
|---|---|
| `friend.mp4` | the Short with music, 20 s, 1080×1920 |
| `friend-nomusic.mp4` | the same picture with only the effects and voices, for the Shorts sound picker |
| `friend-silent.mp4` | no audio at all |
| `thumbnail-friend.jpg` | 9:16 |

## Next ones, same formula (each ≤ 20 s, each an original story)

1. **The Creeper who only wanted a hug**: everyone runs; the one who doesn't gets hugged and he cannot explode.
2. **Villager sells his last emerald** so a stranger can eat: relatable guilt, "call your mom"-style comments.
3. **Steve's dog waits at the door** the whole winter, and Steve walks in: the loyalty one.

## Rebuilding it

```bash
python3 scripts/build-friend-audio.py          # music + effects  -> public/audio/friend-mix.mp3
python3 scripts/build-friend-audio.py --music none   # effects only -> friend-sfx.mp3
npm run friend:audio                           # render + mux
npm run friend:thumb
```
