# The dopamine ladder

The retention framework every BANE History short is built against. Six
levels, each a bigger dopamine hit than the last. Levels 1–4 are the video.
Levels 5–6 are the channel.

Use it as a checklist before a script is written and again when the contact
sheet comes back — most retention problems are a missing rung, not a bad
fact.

| # | Level | What fires it | What it looks like here |
|---|---|---|---|
| 1 | **Stimulation** | Colour, motion, brightness, in the first 200 ms | The first frame is already moving and already saturated |
| 2 | **Captivation** | An open question the viewer wants closed | The question is asked out loud in the first 3 seconds |
| 3 | **Anticipation** | Guessing the answer, and being made to wait | Headfakes, a second question opened before the first closes |
| 4 | **Validation** | The loop closing on something non-obvious | The payoff is a fact they could not have guessed |
| 5 | **Affection** | Liking and trusting whoever is talking | One narrator, one voice, one point of view, every time |
| 6 | **Revelation** | Recognising the channel as a reliable source of value | The thumbnail alone starts the anticipation |

## What each rung means for a short

**1 · Stimulation — the first 200 milliseconds.**
The subconscious decides before the conscious mind arrives. Frame one must
already be in motion, already coloured, already bright. Never open on a
static wide map and never open on a fade from black. Open mid-push, with a
saturated fill and a 3D word already landing. Keep the palette ours —
saturated country fills, white outlines, the yellow — so the look itself
becomes recognisable, which is what feeds rung 6.

**2 · Captivation — ask, do not state.**
A statement closes a loop. A question opens one. "For nine years Texas was
its own country" is a fact; "Texas was its own country — so why did it
ever give that up?" is a question, and the brain cannot leave it alone.
Ask it out loud inside the first three seconds, before any exposition, and
make it a question the target viewer already half-wonders about.

**3 · Anticipation — never let the loop close early.**
Dopamine peaks *just before* the answer, not at it. So stretch the gap:
give facts that circle the question without answering it, and open a second
loop before closing the first. A headfake — an answer that looks right and
is then knocked down — resets the whole cycle and buys another 15 seconds.
"Take a guess" is the cheapest version of this and it works, but the
stronger version is a wrong answer offered seriously and then broken.

**4 · Validation — the answer has to be non-obvious.**
If the viewer guessed it, there is no reward. The payoff should be the
thing they could not have reached: not "Texas is big" but "annexing Texas
is why America owns California". Land it late, land it clean, and cut.

**5 · Affection — the narrator is a person.**
Faceless does not mean voiceless. One voice, one register, a point of view
that is willing to be surprised. Say "here is the part nobody expects"
rather than "additionally". Never hedge a good fact.

**6 · Revelation — consistency is the whole trick.**
Same palette, same voice, same shape of story, every upload, so the
thumbnail alone triggers the anticipation. This one is not earned inside
any single video — it is earned by not drifting.

## The shape this implies

Every short in `src/geo/` follows the same spine:

```
0:00  the question, out loud, over something already moving      (1, 2)
0:05  what actually happened — facts that circle the question    (3)
0:30  a headfake: the obvious answer, offered and knocked down    (3)
0:45  "so what really happened?"  — the loop reopened            (3)
0:55  the answer, non-obvious                                    (4)
1:10  the consequence nobody expects, then cut                   (4)
```

The cut lands on the last word so the loop restarts into the question,
which is the cheapest retention trick available to a Short and the reason
these are built to loop.

## Checking a cut against it

When the contact sheet comes back, walk the rungs:

- Is frame one moving and saturated? If it could be a screenshot, rung 1 failed.
- Is there a question in the first three seconds? Not a topic — a question.
- Between the question and the answer, is there a stretch where the viewer
  has nothing to wonder about? That is where they leave.
- Could a reasonably informed viewer have guessed the payoff? Then it is
  not validation, it is confirmation, and it does not pay out.
- Does any beat sit on screen with nothing happening? Dead air is a rung-1
  failure happening in the middle of the video.
