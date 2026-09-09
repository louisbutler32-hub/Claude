import React from "react";
import { useVideoConfig } from "remotion";
import { useMap } from "./MapCanvas";
import { LonLat, clamp01, easeOutCubic, ramp, visibility } from "./projection";
import { cornerPinMatrix } from "../titles/perspective";

// ── Things that belong to the ground ───────────────────────────────────
//
// Everything here is placed in longitude/latitude and drawn through the map
// projector, so it rakes and turns with the terrain instead of floating
// over it.

// ── Survey grid ────────────────────────────────────────────────────────
// The graticule that makes a satellite shot read as a *map*. Drawn as real
// lines through the projector, so it lies down in perspective.

export const Graticule: React.FC<{
  /** Degrees between lines. */
  step?: number;
  in?: number;
  until?: number;
  opacity?: number;
}> = ({ step = 5, in: from = 0, until, opacity = 0.22 }) => {
  const { project, camera, theme, t } = useMap();
  const { width, height } = useVideoConfig();
  const alive = visibility(t, from, until, 0.4);
  if (alive <= 0.01) return null;

  // Only draw what can plausibly be on screen: a window around the camera
  // sized from the zoom, so a wide shot doesn't try to draw the planet.
  const spanLon = Math.min(170, (360 * width) / camera.scale);
  const spanLat = Math.min(70, spanLon * 0.7);
  const west = Math.floor((camera.lon - spanLon) / step) * step;
  const east = Math.ceil((camera.lon + spanLon) / step) * step;
  const south = Math.max(-80, Math.floor((camera.lat - spanLat) / step) * step);
  const north = Math.min(80, Math.ceil((camera.lat + spanLat) / step) * step);

  const lines: string[] = [];
  for (let lon = west; lon <= east; lon += step) {
    const pts: string[] = [];
    for (let lat = south; lat <= north; lat += step / 2) {
      const [x, y] = project([lon, lat]);
      pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    lines.push(`M${pts.join("L")}`);
  }
  for (let lat = south; lat <= north; lat += step) {
    const pts: string[] = [];
    for (let lon = west; lon <= east; lon += step / 2) {
      const [x, y] = project([lon, lat]);
      pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    lines.push(`M${pts.join("L")}`);
  }

  return (
    <path
      d={lines.join("")}
      fill="none"
      stroke={theme.label}
      strokeWidth={1}
      opacity={alive * opacity}
    />
  );
};

// ── Scale bar ──────────────────────────────────────────────────────────
// Measured on the ground between two real points, so it stays honest when
// the camera moves — and it is the thing that makes a distance land.

export const ScaleBar: React.FC<{
  from: LonLat;
  to: LonLat;
  label: string;
  sub?: string;
  in?: number;
  until?: number;
  color?: string;
}> = ({ from: a, to: b, label, sub, in: start = 0, until, color = "#ffd84a" }) => {
  const { project, theme, t } = useMap();
  const { width: canvasWidth } = useVideoConfig();
  const alive = visibility(t, start, until, 0.25);
  if (alive <= 0.01) return null;

  const scale = canvasWidth / 1080;
  const p = easeOutCubic(ramp(t, start, start + 0.35));
  const [x1, y1] = project(a);
  const [x2, y2] = project(b);
  // The bar draws itself out from the left end.
  const x = x1 + (x2 - x1) * p;
  const y = y1 + (y2 - y1) * p;
  const tick = 11 * scale;
  const mx = (x1 + x) / 2;
  const my = (y1 + y) / 2;

  return (
    <g opacity={alive}>
      <g stroke={color} strokeWidth={3.4 * scale} strokeLinecap="round">
        <path d={`M${x1} ${y1} L${x} ${y}`} />
        <path d={`M${x1} ${y1 - tick} L${x1} ${y1 + tick}`} />
        {p > 0.98 ? <path d={`M${x2} ${y2 - tick} L${x2} ${y2 + tick}`} /> : null}
      </g>
      <text
        x={mx}
        y={my - 16 * scale}
        textAnchor="middle"
        fontFamily={theme.fontChip}
        fontSize={34 * scale}
        fontWeight={800}
        fill={color}
        stroke="rgba(0,0,0,0.75)"
        strokeWidth={6 * scale}
        paintOrder="stroke"
        opacity={p}
      >
        {label}
      </text>
      {sub ? (
        <text
          x={mx}
          y={my + 30 * scale}
          textAnchor="middle"
          fontFamily={theme.fontChip}
          fontSize={22 * scale}
          fontWeight={700}
          fill={color}
          stroke="rgba(0,0,0,0.75)"
          strokeWidth={5 * scale}
          paintOrder="stroke"
          opacity={p}
        >
          {sub}
        </text>
      ) : null}
    </g>
  );
};

// ── Trees ──────────────────────────────────────────────────────────────
// Scattered along a line in lon/lat, popping in a few at a time. Drawn, not
// sourced, so there is nothing to license and they stay sharp.

const Tree: React.FC<{ size: number; seed: number }> = ({ size, seed }) => {
  const lean = ((seed * 7919) % 11) - 5;
  const s = size;
  return (
    <g transform={`rotate(${lean * 0.6})`}>
      <rect x={-s * 0.05} y={-s * 0.1} width={s * 0.1} height={s * 0.42} fill="#4a3a24" />
      <ellipse cx={0} cy={-s * 0.34} rx={s * 0.34} ry={s * 0.3} fill="#2f6b32" />
      <ellipse cx={-s * 0.19} cy={-s * 0.18} rx={s * 0.25} ry={s * 0.22} fill="#3a7d3a" />
      <ellipse cx={s * 0.19} cy={-s * 0.2} rx={s * 0.24} ry={s * 0.21} fill="#275c2b" />
      <ellipse cx={0} cy={-s * 0.46} rx={s * 0.2} ry={s * 0.17} fill="#417f3f" />
    </g>
  );
};

export const TreeBelt: React.FC<{
  /** The spine of the belt, north to south. */
  path: LonLat[];
  /** How many trees to scatter along it. */
  count?: number;
  /** Half-width of the scatter, in degrees of longitude. */
  spread?: number;
  /** First tree lands here … */
  in?: number;
  /** … and the last one lands here. */
  through?: number;
  until?: number;
  size?: number;
}> = ({ path, count = 60, spread = 2.2, in: start = 0, through, until, size = 46 }) => {
  const { project, t } = useMap();
  const { width: canvasWidth } = useVideoConfig();
  const alive = visibility(t, start, until, 0.4);
  if (alive <= 0.01) return null;

  const scale = canvasWidth / 1080;
  const last = through ?? start + 4;

  const trees = [];
  for (let i = 0; i < count; i++) {
    // Walk the spine, then jitter either side of it. Deterministic, so the
    // forest is the same forest on every render.
    const u = i / (count - 1);
    const seg = u * (path.length - 1);
    const k = Math.min(path.length - 2, Math.floor(seg));
    const f = seg - k;
    const lon = path[k][0] + (path[k + 1][0] - path[k][0]) * f;
    const lat = path[k][1] + (path[k + 1][1] - path[k][1]) * f;

    const r1 = Math.sin(i * 12.9898) * 43758.5453;
    const r2 = Math.sin(i * 78.233) * 12345.6789;
    const jx = ((r1 - Math.floor(r1)) - 0.5) * 2 * spread;
    const jy = ((r2 - Math.floor(r2)) - 0.5) * 1.1;

    // Planted top to bottom, so the belt grows down the map.
    const at = start + (last - start) * u;
    const p = easeOutCubic(ramp(t, at, at + 0.28));
    if (p <= 0.01) continue;

    const [x, y] = project([lon + jx, lat + jy]);
    const pop = 0.4 + 0.6 * p + Math.sin(Math.PI * clamp01(p)) * 0.2;
    trees.push(
      <g key={i} transform={`translate(${x} ${y}) scale(${pop})`} opacity={Math.min(1, p * 1.4)}>
        <Tree size={size * scale} seed={i} />
      </g>
    );
  }

  return <g opacity={alive}>{trees}</g>;
};

// ── Ground label ───────────────────────────────────────────────────────
// Type that lies ON the terrain. The four corners of a lon/lat quad are
// projected, then the text block is corner-pinned into them — so the words
// rake and turn with the ground exactly, instead of sitting on the lens.
//
// Renders as HTML, so pass it to MapCanvas's `hud`, not as a child.

export const GroundLabel: React.FC<{
  at: LonLat;
  /** Quad size on the ground, in degrees. */
  spanLon: number;
  spanLat: number;
  text: string;
  sub?: string;
  in?: number;
  until?: number;
  color?: string;
  weight?: number;
}> = ({
  at,
  spanLon,
  spanLat,
  text,
  sub,
  in: start = 0,
  until,
  color = "#fdf8ec",
  weight = 800,
}) => {
  const { project, theme, t } = useMap();
  const alive = visibility(t, start, until, 0.3);
  if (alive <= 0.01) return null;

  const p = easeOutCubic(ramp(t, start, start + 0.4));
  const [w2, h2] = [spanLon / 2, spanLat / 2];
  const corners: [number, number][] = [
    project([at[0] - w2, at[1] + h2]),
    project([at[0] + w2, at[1] + h2]),
    project([at[0] + w2, at[1] - h2]),
    project([at[0] - w2, at[1] - h2]),
  ];

  const BOX_W = 1200;
  const BOX_H = 340;
  const matrix = cornerPinMatrix(BOX_W, BOX_H, corners as never);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: BOX_W,
        height: BOX_H,
        transform: matrix,
        transformOrigin: "0 0",
        opacity: alive * p,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontFamily: theme.fontLabel,
          color,
          textShadow: "0 6px 18px rgba(0,0,0,0.75), 0 2px 4px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ fontSize: 132, fontWeight: weight, lineHeight: 1, letterSpacing: 2 }}>
          {text}
        </div>
        {sub ? (
          <div style={{ fontSize: 104, fontWeight: weight, lineHeight: 1.2, opacity: 0.95 }}>
            {sub}
          </div>
        ) : null}
      </div>
    </div>
  );
};
