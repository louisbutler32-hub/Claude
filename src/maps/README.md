# Animated historical maps

The map format: real vector coastlines, territories that change hands,
engraved place names, city markers and drawn-on offensive arrows, with a
camera that pushes between beats.

```
src/maps/
  theme.ts        palettes — BRIGHT_ATLAS (house), INK_AMBER, DEEP_SLATE
  projection.ts   Mercator, camera keyframes, curves, arrow geometry
  MapCanvas.tsx   the world: sea, land, borders, grade, map context
  layers.tsx      Territory, MapLabel, CityMarker, MapArrow, LinkLine, EraChip
  ww2.tsx         worked example — Europe 1939-41, 22s vertical
  data/europe.json  generated, do not hand-edit
scripts/build-map-data.mjs
```

```bash
npm start                       # Remotion Studio — scrub the whole sequence
npm run map                     # renders out/map-ww2-europe.mp4 (1080x1920)
node scripts/build-map-data.mjs # regenerate the coastlines
```

## Where the map comes from

Natural Earth, via the `world-atlas` package — **public domain**, no
attribution required, safe to monetise. The build script decodes the
TopoJSON, keeps the parts that touch Europe, simplifies them to about 6 m of
detail and writes plain GeoJSON that gets bundled into the render. Nothing is
fetched at render time, and nothing is a screenshot of somebody else's
basemap, so the whole frame is yours to colour and it stays sharp at any
resolution.

Three things in that pipeline are load-bearing and easy to break if you
rewrite it:

- **Antimeridian unwrapping.** Russia's outline holds longitudes at both
  +179 and -179. Projected as-is it spans every longitude on screen and
  fills the Arctic as a band of land. Rings that wrap get their negative
  side shifted to +360.
- **Per-part region filter.** Applied to each polygon of a country, not the
  country as a whole, so far-side pieces (Chukotka) are dropped.
- **Simplify, don't clip.** Clipping a concave country against a box leaves
  connecting edges along that box which fill as bands. Douglas–Peucker
  keeps the file small without inventing geometry.

## Building a sequence

Everything is placed in longitude/latitude and timed in seconds, so layers
stay glued to the ground while the camera moves.

```tsx
<MapCanvas camera={CAMERA} theme={BRIGHT_ATLAS} hud={<EraChip steps={...} />}>
  <Territory countries={["Germany", "Austria"]} color="oxblood" in={0.4} />
  <MapLabel at={[10.4, 51]} text="GERMANY" size={54} in={1.0} until={4.4} />
  <CityMarker at={[21.01, 52.23]} name="Warsaw" in={5.0} />
  <MapArrow from={[14.6, 52.3]} to={[20.2, 52.3]} bow={0.1} in={5.2} dur={1.0} />
</MapCanvas>
```

**Camera.** A list of keyframes; the camera eases between them, with zoom
interpolated logarithmically so a push doesn't lurch.

```ts
const CAMERA: CameraKey[] = [
  { at: 0,   lon: 11,   lat: 51.5, scale: 6500 },   // continental
  { at: 6.2, lon: 19.6, lat: 52.2, scale: 16500 },  // a country fills frame
];
```

`scale` is how many pixels the whole world would be: ~6000 continental,
~16000 for one country. Keep a slow drift between beats — a static map
looks like a diagram.

**Territory** fills countries and draws their outline on. Conquest is just a
second Territory in the new colour starting when the first one ends:

```tsx
<Territory countries={POLAND} color="ochre"   in={0.8} until={8.6} />
<Territory countries={POLAND} color="oxblood" in={8.6} draw={1.3} />
```

**MapArrow** is a tapered ribbon that grows along a curve — `bow` bends it
(positive is left of travel), `width` sets the head size, `dur` the draw
time. **LinkLine** is the thin travelling line for alliances and sea routes.
**MapLabel** takes `bow` to arc a name across a territory the way an atlas
sets it. **EraChip** is the date in the corner; pass it as `hud`, not as a
child, because it is HTML rather than SVG.

## Colour

`theme.palette` names the nation colours. Give every power one and keep it
for the whole channel — an audience learns colours faster than names.

```ts
palette: { oxblood, ochre, indigo, moss, plum, teal, rust, slate }
```

Swap `BRIGHT_ATLAS` for `INK_AMBER` on the `MapCanvas` and the same sequence
becomes a near-monochrome slate map where only the country being discussed
carries colour. Same data, same timings, different identity.

## Accuracy

The outlines are modern national borders standing in for period ones —
Natural Earth has no historical frontiers. At these zooms it reads fine for
blocs and arrows, and it is what most channels in this format actually use.
For period-accurate frontiers, add your own polygons to the data build and
pass their names to `Territory`; nothing else has to change.
