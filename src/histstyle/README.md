# History style tests

Four candidate looks for the history videos. Each one tells the same ten
seconds of Waterloo so they can be judged side by side:

- **0–5 s:** over Napoleon's shoulder as the French columns go in, with the title and a question hook
- **5–10 s:** the map, with both lines and then the Prussians arriving

```
src/histstyle/
  shared.tsx      fonts, timing helpers, Napoleon + soldier figures, the Waterloo map data, arrows, grain
  Engraving.tsx   A · Ink & Parchment
  Paper.tsx       B · Paper Diorama
  Cinematic.tsx   C · Cinematic Dusk
  Poster.tsx      D · Two-Ink Print
  Compare.tsx     all four in a 2×2 grid
```

| | look | what makes it feel hand-made |
|---|---|---|
| **A** | a hand-tinted 1830s steel engraving, set in a book plate | ruled skies, crosshatch, contour-stroke ground; the ink "boils" on threes; watercolour wash laid slightly off the lines |
| **B** | a cut-paper tabletop set, shot stop-motion | every sheet has a hand-cut edge, paper fibre and a depth shadow; on twos with a hair of jitter; out-of-focus grass in front of the lens |
| **C** | modern documentary motion design, lit like film | aerial-perspective silhouettes against a low sun, rim light, smooth eased motion, a 3D-tilted map with glowing units |
| **D** | a two-colour screen-printed poster | black and red only, halftone shading, red plate out of register, ink dropout, hard cuts with a red sweep |

```bash
npx remotion render HistStyle-Compare out/histstyle-compare.mp4
npx remotion render HistStyle-A-Engraving out/histstyle-a.mp4   # B-Paper, C-Cinematic, D-Poster
```

Fonts are all SIL OFL and live in `public/fonts`: IM Fell English, Playfair
Display, Oswald and Bebas Neue (added for these), plus Montserrat and Anton.

Once a look is picked, it becomes its own kit. Its scene pieces move out of
the test file into reusable components, the way `src/geo/` is laid out.
