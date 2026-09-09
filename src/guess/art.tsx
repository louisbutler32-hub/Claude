import React from "react";

/**
 * Drawing helpers shared by every subject: the kawaii face, the specular
 * blob, and the wrapper that flattens a drawing to its own silhouette.
 */

export const FACE = "#4a3b30";

/** Two dots and a smile — every character in the format wears this face. */
export const Face: React.FC<{
  cy?: number;
  gap?: number;
  eye?: number;
  mouth?: number;
  blush?: boolean;
  blushY?: number;
  blushGap?: number;
  color?: string;
}> = ({
  cy = 0,
  gap = 26,
  eye = 1,
  mouth = 1,
  blush = true,
  blushY = 12,
  blushGap = 52,
  color = FACE,
}) => (
  <g>
    {blush ? (
      <>
        <ellipse cx={-blushGap} cy={cy + blushY} rx={13 * eye} ry={8 * eye} fill="#f0a9a0" opacity={0.55} />
        <ellipse cx={blushGap} cy={cy + blushY} rx={13 * eye} ry={8 * eye} fill="#f0a9a0" opacity={0.55} />
      </>
    ) : null}
    <ellipse cx={-gap} cy={cy} rx={7.5 * eye} ry={9.5 * eye} fill={color} />
    <ellipse cx={gap} cy={cy} rx={7.5 * eye} ry={9.5 * eye} fill={color} />
    <path
      d={`M ${-11 * mouth} ${cy + 20} q ${11 * mouth} ${13 * mouth} ${22 * mouth} 0`}
      stroke={color}
      strokeWidth={4.5}
      fill="none"
      strokeLinecap="round"
    />
  </g>
);

/** Soft specular blob. */
export const Shine: React.FC<{
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rot?: number;
  o?: number;
}> = ({ cx, cy, rx, ry, rot = -25, o = 0.5 }) => (
  <ellipse
    cx={cx}
    cy={cy}
    rx={rx}
    ry={ry}
    fill="#ffffff"
    opacity={o}
    transform={`rotate(${rot} ${cx} ${cy})`}
  />
);

/**
 * Flattens everything inside to pure black when `sil` is set. Drawing each
 * subject once and filtering it is what guarantees the shadow is the exact
 * outline of the thing it hides.
 */
export const Body: React.FC<{ sil?: boolean; children: React.ReactNode }> = ({
  sil,
  children,
}) => (
  <g style={sil ? { filter: "brightness(0) saturate(0)" } : undefined}>
    {children}
  </g>
);
