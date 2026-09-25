/** Small geometry helpers for the winding paths the animals walk along. */

export type Pt = { x: number; y: number };

/** Sample a Catmull-Rom spline through `pts`, `per` samples per segment. */
export function spline(pts: Pt[], per = 24): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < per; k++) {
      const t = k / per;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push({
        x:
          0.5 *
          (2 * p1.x +
            (-p0.x + p2.x) * t +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y:
          0.5 *
          (2 * p1.y +
            (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/** Offset a sampled centreline by `half(i)` either side → polygon points. */
export function ribbon(line: Pt[], half: (i: number, n: number) => number): string {
  const n = line.length;
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = line[Math.max(0, i - 1)];
    const b = line[Math.min(n - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const h = half(i, n);
    left.push({ x: line[i].x + nx * h, y: line[i].y + ny * h });
    right.push({ x: line[i].x - nx * h, y: line[i].y - ny * h });
  }
  return [...left, ...right.reverse()].map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

/** x of a (y-monotonic, top-to-bottom decreasing) centreline at height `y`. */
export function xAtY(line: Pt[], y: number): number {
  for (let i = 0; i < line.length - 1; i++) {
    const a = line[i];
    const b = line[i + 1];
    if ((a.y >= y && b.y <= y) || (a.y <= y && b.y >= y)) {
      const t = (y - a.y) / (b.y - a.y || 1);
      return a.x + (b.x - a.x) * t;
    }
  }
  return line[line.length - 1].x;
}

export function polyline(pts: Pt[]): string {
  return pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}
