# Upload copy — 5 Relatable Minecraft Moments (Animated)

## A note before the copy

Long-form does not feed the Shorts feed. YouTube runs Shorts placement
and long-form recommendations as separate systems — Shorts get shown
based on how they perform *as Shorts* (swipe-through rate, loop rate, watch
time within the first couple of seconds), not on what else the channel has
posted. This video will not fix a Short that isn't landing.

What it's actually good for: a channel with only 13-second clips gives a
visitor almost nothing to watch if they click through to the channel page,
and it can look thin to anyone deciding whether to subscribe. A real
long-form video gives that visitor something substantial, and it's a
normal, legitimate thing to have on the channel regardless of the Shorts
question. Post it for that reason, not as a Shorts-feed fix.

## Title

```
5 Relatable Minecraft Moments (Animated) — from the Shorts you've seen
```

**Alternates:**

```
Every Relatable Minecraft Moment, Animated (Full Compilation)
```
```
I Animated 5 Minecraft Moments Every Player Has Had
```

## Description

```
Five animated Minecraft moments in one video — digging straight down,
the Java vs Bedrock PvP argument, the creeper's side of the story, a
first trip through the Nether, and a house that didn't make it to day 5.

No footage, no filters — every frame is drawn in code.

0:00 Intro
0:18 Dig Straight Down
0:36 Java vs Bedrock PvP
0:53 You vs The Creeper
1:10 First Time in the Nether
1:38 Building the Perfect House
2:08 Behind the Build
2:28 Vote for Episode 6
2:48 Thanks for Watching

🥕 Subscribe for a new Short every week:
https://www.youtube.com/@LaughQuakees

Music: "Sneaky Snitch" and "Run Amok" by Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0
https://creativecommons.org/licenses/by/4.0/

#minecraft #minecraftanimation #minecraftmemes #minecraftshorts
```

(Chapter times above are exact — they come straight out of
`scripts/make-minecraft-longform.py`'s own print-out, not eyeballed off the
render. Re-run it if any of the five source Shorts ever change length and
paste the new list in.)

## Tags

```
minecraft, minecraft animation, minecraft compilation, minecraft memes, minecraft relatable, minecraft shorts, java vs bedrock, minecraft creeper, minecraft nether, minecraft house build, minecraft funny, minecraft story, steve animation, minecraft cartoon, gaming animation, minecraft survival, animated compilation, oof craft, minecraft best moments, minecraft 2026
```

(388 characters.)

## Upload settings

Category **Gaming** (game: Minecraft), language English. This is a
**long-form upload, not a Short** — 3:04, and vertical framing no longer
keeps a video under 3 minutes out of the Shorts shelf, so the length here
is what does that job. Audience: **not made for kids**, same as the rest
of the channel.

Thumbnail: `thumbnail-longform.jpg` — a frame pulled from the intro card
(`out/relatable-minecraft-longform.mp4` at 0:10). Swap in a custom one if
you want something punchier; the intro card composition (`Long-Intro` in
Remotion Studio) is the same art if you want to re-render a still from a
different frame.

Pin a comment asking which of the five was the favorite, or which of the
three "vote for episode 6" concepts (Ender Dragon fight, villager trading
saga, ocean monument raid) to build next — the outro already asks both
questions on screen, so the pinned comment just gives people somewhere to
answer.

## How it's built

`scripts/make-minecraft-longform.py` joins the five already-rendered
Shorts with six new connective pieces (an intro, five chapter cards, a
"behind the build" segment, a "vote for episode 6" segment, and an
outro — all in `src/minecraft-longform/LongformParts.tsx`), the same way
`scripts/make-compilation.py` already joins the guess-format episodes:
normalise every part to one codec/size/frame rate, concat, embed chapter
marks with a chapterless fallback if the ffmpeg build can't read the
metadata file.

To rebuild after changing anything:

```bash
npm run longform:mix      # scores the six new connective pieces
npm run longform          # renders all nine and joins the final file
```

The five Shorts it pulls in must already be rendered at
`out/dig-straight-down.mp4`, `out/java-vs-bedrock-pvp.mp4`, `out/creeper.mp4`,
`out/nether-first-time.mp4` and `out/building-perfect-house.mp4` — the
join script checks for all of them up front and says which is missing
rather than failing partway through.
