// ── Perspective math ───────────────────────────────────────────────────
//
// Two ways to put a flat text plane into 3D space:
//
//   1. "angle"     — a CSS perspective camera + rotateX/Y/Z. Easy to dial in
//                    by feel; the far edge recedes and shrinks for real.
//   2. "cornerPin" — After-Effects-style corner pin. You give four screen
//                    points (the quad you want the text to sit in, e.g.
//                    traced off a floor or a wall) and the text is warped
//                    into exactly that quad by a projective transform.
//
// Both end up as a single CSS transform on the plane element, so the text
// stays live text (crisp at any render resolution), not a rasterised image.

export type Point = [number, number];

// Solve the 8 unknowns of a 2D homography mapping the unit rect
// (0,0)-(w,h) onto four destination points, then emit it as a CSS
// `matrix3d(...)`. Destination order is TL, TR, BR, BL.
export const cornerPinMatrix = (
  w: number,
  h: number,
  dst: [Point, Point, Point, Point]
): string => {
  const src: [Point, Point, Point, Point] = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];

  // Unknowns: [h11 h12 h13 h21 h22 h23 h31 h32], with h33 pinned to 1.
  const a: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = dst[i];
    a.push([x, y, 1, 0, 0, 0, -x * u, -y * u]);
    b.push(u);
    a.push([0, 0, 0, x, y, 1, -x * v, -y * v]);
    b.push(v);
  }

  const solved = solve(a, b);
  if (!solved) return "none"; // degenerate quad — fall back to no transform

  const [h11, h12, h13, h21, h22, h23, h31, h32] = solved;

  // CSS matrix3d is column-major. The 3x3 homography lifts to:
  //   [h11 h12 0 h13]
  //   [h21 h22 0 h23]
  //   [ 0   0  1  0 ]
  //   [h31 h32 0  1 ]
  return `matrix3d(${[
    h11, h21, 0, h31,
    h12, h22, 0, h32,
    0, 0, 1, 0,
    h13, h23, 0, 1,
  ].join(",")})`;
};

// Gaussian elimination with partial pivoting.
const solve = (a: number[][], b: number[]): number[] | null => {
  const n = b.length;
  const m = a.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(m[r][col]) > Math.abs(m[pivot][col])) pivot = r;
    }
    if (Math.abs(m[pivot][col]) < 1e-10) return null;
    [m[col], m[pivot]] = [m[pivot], m[col]];

    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = m[r][col] / m[col][col];
      if (f === 0) continue;
      for (let c = col; c <= n; c++) m[r][c] -= f * m[col][c];
    }
  }

  return m.map((row, i) => row[n] / row[i]);
};

// ── Easing ─────────────────────────────────────────────────────────────

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Fast-out settle. Used for the slide-in — most of the travel happens in
 *  the first third of the reveal, which is what makes it read as "snappy". */
export const easeOutCubic = (p: number) => 1 - Math.pow(1 - clamp01(p), 3);

export const easeOutQuint = (p: number) => 1 - Math.pow(1 - clamp01(p), 5);

export const easeInOutSine = (p: number) =>
  -(Math.cos(Math.PI * clamp01(p)) - 1) / 2;

/** Linear ramp between two times, clamped at both ends. */
export const ramp = (t: number, from: number, to: number) =>
  to === from ? (t >= to ? 1 : 0) : clamp01((t - from) / (to - from));
