# Channel banner — AI generation concepts

Five directions, each with a prompt you can paste straight into an image
generator. Read the constraints first: they are the difference between a
banner that works and one that gets its title cropped off on a phone.

---

## The constraints AI generators will not respect

**A YouTube banner is really three crops of one image.**

| where | size | what actually shows |
|---|---|---|
| phone | 1546 × 423 | the centre band only — most of your audience |
| tablet | 1855 × 423 | a bit wider |
| desktop | 2560 × 423 | the full width, short |
| upload | 2560 × 1440 | what you supply; the top and bottom are never seen at all |

So: **generate the artwork, then add the text yourself** in the centre
band. Every model will happily put your wordmark somewhere that gets cut
in half, and none of them can spell reliably at banner scale anyway.

Three things to build into every prompt below:

1. **Ask for a clear centre.** Words like *"open sky across the middle,
   characters clustered at the far left and far right"* leave you somewhere
   to put type.
2. **Generate 16:9**, then upscale to 2560 × 1440. Most models top out well
   below that; a 2× upscale on flat vector-style art is invisible.
3. **Ask for no text.** Add `no text, no letters, no watermark` — it stops
   the model inventing garbled words you then have to paint out.

For a consistent channel look, keep one seed / style reference and vary only
the subject, so the fruit banner and the numbers banner read as siblings.

---

## 1 — Storybook meadow  *(matches the current banner)*

The safe one, and the one that matches the videos frame for frame.

```
Wide children's picture-book illustration, soft pastel storybook style.
A gentle green meadow with rolling scribbled bushes under a pale blue sky
with soft white clouds and a smiling crayon sun. Kawaii cartoon vegetables,
farm animals and fruit with simple dot eyes and rosy cheeks, clustered at
the far left and far right edges. Wide open empty sky across the centre.
Flat vector shapes, soft watercolour gradients, thick friendly outlines,
warm and calm. Cheerful, for toddlers. No text, no letters, no watermark.
--ar 16:9
```

**Why it works:** it is the same world as the episodes, so a viewer who
clicks through gets what the banner promised.

---

## 2 — The shadow reveal

Leads on the format itself rather than the cast. The strongest concept
here, and the one nothing else on the shelf looks like.

```
Wide children's illustration split down the middle. On the left, flat black
silhouettes of a carrot, a cow, a fish and the numeral 3 against a pale blue
sky. On the right, the same four things in full colour as kawaii cartoon
characters with dot eyes and rosy cheeks. A soft glowing seam runs between
the halves. Pastel storybook style, flat vector shapes, thick friendly
outlines, green meadow along the bottom. Empty sky across the upper centre.
No text, no letters, no watermark. --ar 16:9
```

**Watch for:** models tend to make the dark half gloomy. Push back with
*"the black shapes are playful cut-outs, not scary; the sky stays bright"*.

---

## 3 — Peek-a-boo hedge

The literal moment the videos open on, which makes it instantly readable.

```
Wide children's picture-book illustration. A long row of round scribbled
green bushes across the lower third. Kawaii cartoon vegetables and farm
animals peeking up over the top of the bushes — only their heads and eyes
showing, wide-eyed and curious. Pale blue sky above with soft clouds and a
smiling sun in the corner. Clear open sky across the centre. Pastel palette,
flat vector shapes, soft gradients, thick outlines. No text, no letters,
no watermark. --ar 16:9
```

**Why it works:** peeking eyes read at any size, which is the whole
problem with banners.

---

## 4 — Garden basket

Warmer and more homely; leans on the food half of the channel.

```
Wide children's illustration of a woven basket tipped on its side in soft
green grass, with kawaii cartoon vegetables and fruit spilling out in a
gentle arc to the left and right — carrot, tomato, broccoli, corn, pumpkin,
each with simple dot eyes and rosy cheeks. Pale blue sky, soft clouds, warm
afternoon light. Open space above the basket. Pastel storybook palette, flat
vector shapes, thick friendly outlines. No text, no letters, no watermark.
--ar 16:9
```

**Watch for:** ask for *"a shallow arc, nothing stacked in the centre"* or
the pile grows into the middle where your title has to go.

---

## 5 — Chalkboard classroom

Signals *learning* harder than the others. Best if you want parents
searching "educational" to stop.

```
Wide children's illustration of a big soft-edged green chalkboard filling
the frame, with a pale wooden frame. Kawaii cartoon vegetables, animals and
numbers sit along the bottom ledge and peek around the outer edges of the
board. The board face is empty and clean. Warm classroom wall behind, soft
daylight. Pastel storybook palette, flat vector shapes, gentle chalk
texture, thick friendly outlines. No text, no letters, no watermark.
--ar 16:9
```

**Why it works:** the empty board face *is* the safe area — the composition
solves the crop problem for you.

---

## Finishing whichever you pick

1. Upscale to **2560 × 1440**.
2. Set your wordmark and tagline inside a **1546 × 423 box dead centre**.
   `npm run banner:guides` renders that box over the current banner if you
   want something to measure against.
3. Export **JPG under 6 MB** (the built banner is 422 KB — there is room).
4. Check it as a phone crop before uploading: crop to the centre
   1546 × 423 and see whether it still says what the channel is.
