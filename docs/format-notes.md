# What's wrong with the format — the channel owner's read, 13 Sep

Written down because the last list got lost three times.

## The verdict

Thumbnails are good. Concepts are good enough. The videos themselves are
not holding people.

## The six faults, as given

1. **Not enough images, and no real ones.** Everything is drawn in code.
2. **The scripts state facts instead of telling stories.**
3. **The scenes aren't built properly.**
4. **Too much text on screen.**
5. **The scenes aren't engaging, and the lines aren't either.**
6. **Everything is saved for the end.** The structure escalates so that
   item 7 is the biggest payoff — which means the first six are spent
   working towards something the viewer has to wait seven minutes for.

## What the public numbers actually say

| video | published | views |
|---|---|---|
| How Long Would You Last on Every Planet? | 9 Sep | **2,400** |
| MY first and last animation video | 13 Aug | 179 |
| KKK's Rise and Fall | 13 Aug | 45 |
| What is actually living on your face right now? | 10 Sep | **14** |
| Could You Survive a Day in world's deadliest army? | 23 Aug | 6 |
| Rome's Entire History | 13 Aug | 3 |

Channel: 29 subscribers, 6,416 lifetime views.

**The face video is not a retention problem.** It went out one day after
Planets and has 14 views against Planets' 2,400. Fourteen views means it
was barely shown to anyone — the algorithm never tested it. Retention
can't be the cause of an impression count that low. Worth checking in
Studio: whether it is limited, age-flagged, or simply got starved while
Planets was still being pushed.

Planets is the only video with real distribution, so it is the only one
whose retention curve is worth reading. That curve needs owner access —
the Nexlev free plan blocks it and the vidIQ account is out of credits.

## The diagnosis, concretely

Taking the Earth video, which is the freshest example:

- **Text.** Almost every scene carries a chapter title, a headline, a
  caption and a corner chip — four text elements, while the narration
  speaks the same words. That is reading, not watching.
- **Story.** The cold open *is* a story: a lake exhaled in the night and
  1,746 people did not wake up. It is the strongest fifteen seconds in
  the video. Every section after it reverts to an encyclopaedia entry —
  phenomenon, example, warning time.
- **Scenes.** One narration line renders one static composition with a
  slow camera push over it. The motion kit made it a slideshow with Ken
  Burns on it. A scene should *change while the line is spoken*.
- **Structure.** Climbing to the biggest item last asks a viewer with no
  reason to trust the channel to invest seven and a half minutes on a
  promise. At 29 subscribers, nobody pays that in advance.

## Images — what is actually available and clean

Tested from this environment:

- **NASA image API** — HTTP 200, full-size assets download and decode.
  NASA imagery is public domain. Covers the Planets video outright.
- **Wikimedia Commons API** — HTTP 200 once a descriptive user agent is
  sent (a bare request gets 429). Returns per-file licence metadata, so
  each image's licence can be checked and recorded rather than assumed.

Between them: Saint-Pierre 1902, Lake Nyos, the Carrington aurora
records, and every planet are all reachable with a verifiable licence.
