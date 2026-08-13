# 3D-perspective documentary titles

Cinematic historical-documentary name cards — a small category label over a
large white name, sitting on a flat plane inside the 3D space of the shot,
revealed with a very fast left-to-right type-on.

```
src/titles/
  perspective.ts        homography / corner-pin math + easings
  PerspectiveTitle.tsx  the effect — one component, one config object
  presets.ts            NAKAJIMA KATE / JAPANESE CARRIER, and variants
  TitleScene.tsx        plate → text → foreground subject wiring
  compositions.tsx      the registered compositions
```

## Preview and render

```bash
npm start                       # Remotion Studio — scrub the reveal frame by frame

# one line per file — two separate transparent overlays
npm run name:alpha              # NAKAJIMA KATE,    16:9 → out/name-alpha.webm
npm run name:alpha:vertical     # NAKAJIMA KATE,    9:16 → out/name-vertical-alpha.webm
npm run label:alpha             # JAPANESE CARRIER, 16:9 → out/label-alpha.webm
npm run label:alpha:vertical    # JAPANESE CARRIER, 9:16 → out/label-vertical-alpha.webm
npm run name:prores             # ProRes 4444 versions
npm run label:prores

# both lines baked into one file, if you'd rather place them together
npm run title:alpha             # 16:9 WebM    → out/kate-title-alpha.webm
npm run title:alpha:vertical    # 9:16 WebM    → out/kate-title-vertical-alpha.webm
npm run title:prores            # 16:9 ProRes  → out/kate-title-alpha.mov
npm run title:prores:vertical   # 9:16 ProRes  → out/kate-title-vertical-alpha.mov

# demo scene with the built-in placeholder background (for previewing only)
npm run title                   # 1920x1080 → out/kate-title.mp4
npm run title:vertical          # 1080x1920 → out/kate-title-vertical.mp4
```

## Getting it over your footage without a black box

Which file to use depends on whether your editor reads an alpha channel.

| Editor | File | Notes |
| --- | --- | --- |
| Premiere, Resolve, Final Cut, After Effects | `.mov` (ProRes 4444) | alpha is automatic — just drop it on a track above |
| CapCut desktop, browser editors, OBS | `.webm` | tiny files; if it comes in black, use the blend route below |
| CapCut mobile, Instagram/TikTok editors, iMovie | `.mp4` + Screen blend | mobile editors generally ignore alpha, and iOS Photos won't even import `.webm` |

**The blend route** (`npm run name:black` etc.) renders white type on pure
black instead of transparency. Put the clip on the layer above your footage
and set its blend mode to **Screen** (or Add / Lighten). Black is the
identity colour for Screen, so it drops out completely and only the type
remains. It works in every editor ever made, including mobile.

Its one cost: the soft drop shadow is dark, so Screen removes it along with
the background — the type reads slightly flatter against a bright plate. If
that matters, use the alpha files.

**Separate files are the default.** The name and the label are independent
layers with their own position, angle and timing, each rendering to its own
transparent file. Their default positions are the reference layout — label
just above the name — so dropping both onto a timeline unchanged reproduces
the combined card, while either can be moved, retimed, or used alone. Edit
`CARD_MAIN` / `CARD_LABEL` in `presets.ts` to move them apart.

The alpha exports carry a real alpha channel — everything except the type is
fully transparent — so the card sits over whatever footage is underneath it.
ProRes 4444 (`.mov`) is the safer choice for Premiere, Resolve and Final Cut;
WebM is ~100× smaller and works in CapCut and browser-based editors. Both are
5 seconds, with the card fading out at 4.3s (`exitStart: null` keeps it up
forever instead — see `compositions.tsx`).

**Occlusion with an overlay file.** An overlay sits above everything, so the
foreground subject won't pass in front of the text on its own. Two options:
duplicate your footage on a layer *above* the overlay in your editor and mask
out the subject; or bring the shot into this project as `backgroundSrc` and
let `TitleScene` do the layering (see "Using your own footage" below).

Compositions: `Title-Name-Overlay`, `Title-Label-Overlay` and their
`-Vertical` twins (the separate cards); `Title-Kate-Overlay`,
`-Overlay-Vertical`, `-Overlay-SplitCards` (combined, transparent); and the
demo scenes `Title-Kate`, `Title-Kate-Vertical`, `Title-Kate-Pinned`,
`Title-Kate-SplitCards`, `Title-Kate-SplitCards-Vertical`.

## Changing the card

Everything is one config object — `src/titles/presets.ts`:

```ts
export const NAKAJIMA_KATE = makeTitle(DOC_LOOK, {
  eyebrow: "JAPANESE CARRIER",   // small label
  title: "NAKAJIMA KATE",        // large name
  x: 215, y: 585, anchor: "left",
  titleSize: 138,
  rotateY: -15,                  // the swing into depth
  revealDuration: 0.35,          // seconds, first char to last
});
```

Every field is documented inline in `PerspectiveTitle.tsx`. The ones you'll
actually reach for:

| What | Field | Notes |
| --- | --- | --- |
| Text | `title`, `eyebrow` | `eyebrow` is optional |
| Font | `fontFamily`, `titleWeight`, `titleTracking` | any font the render machine has |
| Size | `titleSize`, `eyebrowSize` | px at composition resolution |
| Position | `x`, `y`, `anchor` | the plane rotates *around* this point |
| Perspective angle | `rotateX`, `rotateY`, `rotateZ`, `perspective` | see below |
| Animation speed | `speed`, `revealDuration`, `charFade` | `speed: 2` = twice as fast |
| Slide distance | `slideDistance`, `charSlide` | px; block slide and per-char catch-up |
| Shadow | `shadowStrength`, `shadowOffset`, `shadowBlur`, `softness` | 0 disables |
| Opacity | `opacity` | master, 0–1 |
| Label placement | `eyebrowPlacement: "above" \| "beside"`, `eyebrowGap` | |
| Exit | `exitStart`, `exitDuration` | seconds; `null` = never leaves |

Timings are in **seconds**, so they survive an fps change.

## The perspective

Two ways to put the plane in space. Both keep it as live text, so it stays
crisp at any render resolution — no pre-rendered image is warped.

**Angle mode (default).** A real CSS perspective camera. `rotateY: -15`
swings the right edge away from the lens, so the far end genuinely recedes
and shrinks while the near end grows. `perspective` is the camera distance
in px: 2300 is a longish lens (subtle), 900 is wide (aggressive). Keep
`rotateZ` under a couple of degrees — more reads as a tilted 2D layer.

**Corner-pin mode.** Trace four points off a real surface in the plate —
top-left, top-right, bottom-right, bottom-left — and the text is warped into
exactly that quad by a projective transform (the After Effects Corner Pin
equivalent, solved in `perspective.ts`):

```ts
makeTitle(NAKAJIMA_KATE, {
  cornerPin: [[250, 520], [1600, 610], [1560, 830], [230, 700]],
  planeWidth: 1350,
  planeHeight: 260,
})
```

This is the one to use when the text must lock to a specific floor, wall or
deck rather than just look angled. `debug: true` draws the plane box and the
anchor point while you line it up.

## The reveal

`0.00s` invisible → `0.05s` a hard wipe edge starts moving left to right →
characters resolve just behind it, each fading and sliding a few px into
place, with a touch of motion blur → `0.40s` fully on. The whole block also
slides in *along the plane*, so the slide inherits the same foreshortening
as the text.

After it lands, `idleDrift` / `idleScale` keep a very slow push running for
`idleDuration` seconds — a couple of px and about 1%. It's below conscious
notice, and it's the difference between "in the shot" and "pasted on".

Faster or slower without touching anything else: `speed: 1.4`, `speed: 0.7`.

## Using your own footage

Put files in `public/` and pass paths relative to it:

```tsx
<TitleScene
  backgroundSrc="assets/kate-shot.mp4"
  occluderSrc="assets/kate-shot-fg.png"   // alpha cutout, drawn in front
  config={NAKAJIMA_KATE}
/>
```

Layer order is background plate → text → foreground subject, so anything in
the occluder layer passes **in front of** the text.

No cutout handy? Give a polygon in composition pixels instead and a second
copy of the plate is drawn on top, clipped to it — the subject occludes the
text with no roto app involved:

```tsx
<TitleScene
  backgroundSrc="assets/kate-shot.mp4"
  occluderPolygon={[[980, 300], [1240, 300], [1300, 1080], [920, 1080]]}
  config={NAKAJIMA_KATE}
/>
```

That works as-is for a locked-off shot. For a moving subject, either supply
a per-frame alpha cutout (an image sequence or a video with alpha) as
`occluderSrc`, or key the polygon off `useCurrentFrame()`.

With no `backgroundSrc` you get a built-in placeholder hall — a checkerboard
floor receding under a stone wall, plus a stand-in figure — so the
compositions render out of the box and you can judge the perspective against
real receding geometry.

## Fonts

The default stack is Helvetica Neue → Liberation Sans → Arial, i.e. whatever
clean grotesque the machine has. To pin an exact face, set `fontFamily` to
one you have installed, or load a web font in Remotion:

```bash
npm i @remotion/google-fonts
```

```ts
import { loadFont } from "@remotion/google-fonts/Inter";
const { fontFamily } = loadFont();
makeTitle(NAKAJIMA_KATE, { fontFamily });
```
