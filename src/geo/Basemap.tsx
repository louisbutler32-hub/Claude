import React from "react";
import { Img, staticFile } from "remotion";
import regions from "./data/regions.json";
import { Projector, WORLD, mercLat, tileLevel } from "./projection";

// ── The satellite ground ──────────────────────────────────────────────
//
// NASA Blue Marble, cut into Web Mercator tiles by scripts/build-geo-basemap.py.
// Two levels are drawn every frame: a world level that always exists, and
// on top of it the finest level the camera's zoom calls for, wherever that
// level was built. Where it wasn't, the world level shows through, so a
// camera that strays outside its region degrades to soft instead of blank.
//
// Every tile is a plain <Img> placed in screen space — the camera is a
// similarity transform, so a tile is always an axis-aligned square and the
// browser's own image scaling does the resampling.

const { tileSize: TILE, worldMaxZoom: WORLD_MAX } = regions;

type Region = { name: string; west: number; east: number; south: number; north: number; maxZoom: number };
const REGIONS = regions.regions as Region[];

const lonOverlaps = (a0: number, a1: number, b0: number, b1: number) =>
  [-360, 0, 360].some((s) => a0 + s < b1 && a1 + s > b0);

/** Was this tile built? Mirrors the predicate in the build script. */
export const tileExists = (z: number, x: number, y: number): boolean => {
  if (z <= WORLD_MAX) return true;
  const n = 2 ** z;
  const lon0 = (x / n) * 360 - 180;
  const lon1 = ((x + 1) / n) * 360 - 180;
  const latN = mercLat(y / n);
  const latS = mercLat((y + 1) / n);
  return REGIONS.some(
    (r) => r.maxZoom >= z && latS < r.north && latN > r.south && lonOverlaps(lon0, lon1, r.west, r.east)
  );
};

const maxRegionZoom = Math.max(WORLD_MAX, ...REGIONS.map((r) => r.maxZoom));

const mod = (a: number, n: number) => ((a % n) + n) % n;

type Tile = { key: string; src: string; left: number; top: number; size: number };

const tilesFor = (proj: Projector, z: number): Tile[] => {
  const n = 2 ** z;
  const tw = WORLD / n; // world units per tile
  const { width, height, k, cx, cy } = proj;
  const wx0 = cx - width / 2 / k;
  const wx1 = cx + width / 2 / k;
  const wy0 = cy - height / 2 / k;
  const wy1 = cy + height / 2 / k;
  const tx0 = Math.floor(wx0 / tw);
  const tx1 = Math.floor(wx1 / tw);
  const ty0 = Math.max(0, Math.floor(wy0 / tw));
  const ty1 = Math.min(n - 1, Math.floor(wy1 / tw));
  const out: Tile[] = [];
  for (let ty = ty0; ty <= ty1; ty++) {
    for (let tx = tx0; tx <= tx1; tx++) {
      const x = mod(tx, n);
      if (!tileExists(z, x, ty)) continue;
      const [left, top] = proj.world(tx * tw, ty * tw);
      out.push({
        key: `${z}/${tx}/${ty}`,
        src: staticFile(`assets/geo/tiles/${z}/${x}/${ty}.jpg`),
        left,
        top,
        size: tw * k,
      });
    }
  }
  return out;
};

const missing = new Set<string>();

const TileImg: React.FC<{ tile: Tile }> = ({ tile }) => (
  <Img
    src={tile.src}
    onError={() => {
      if (!missing.has(tile.src)) {
        missing.add(tile.src);
        console.warn(`geo: missing tile ${tile.src} — run: python3 scripts/build-geo-basemap.py`);
      }
    }}
    style={{
      position: "absolute",
      left: tile.left,
      top: tile.top,
      // a hair of overlap hides the seam the browser's resampling leaves
      width: tile.size * (1 + 1 / TILE),
      height: tile.size * (1 + 1 / TILE),
      display: "block",
    }}
  />
);

export const Basemap: React.FC<{ proj: Projector; scale: number }> = ({ proj, scale }) => {
  const detail = tileLevel(scale, TILE, maxRegionZoom);
  const base = Math.min(detail, WORLD_MAX);
  const layers = base === detail ? [base] : [base, detail];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {layers.map((z) => (
        <div key={z} style={{ position: "absolute", inset: 0 }}>
          {tilesFor(proj, z).map((tile) => (
            <TileImg key={tile.key} tile={tile} />
          ))}
        </div>
      ))}
    </div>
  );
};
