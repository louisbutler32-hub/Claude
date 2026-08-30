import React from "react";

// ── Flags ──────────────────────────────────────────────────────────────
//
// Drawn in code rather than shipped as image files: no assets to license,
// no downloads at render time, and they stay sharp at any resolution. Each
// flag draws into a 90x60 box; FlagPin scales it to wherever it is pinned.
//
// Need one that isn't here — a historical or regional flag, a coat of arms?
// Drop the file in public/assets/flags/ and pass `src="assets/flags/x.png"`
// to FlagPin instead of a key. Everything else works the same.

export type FlagKey =
  | "germany"
  | "poland"
  | "france"
  | "britain"
  | "italy"
  | "soviet"
  | "usa"
  | "japan";

const W = 90;
const H = 60;

/** Five-pointed star centred on (cx, cy). */
const star = (cx: number, cy: number, r: number): string => {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.382;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    points.push(
      `${(cx + Math.cos(angle) * radius).toFixed(2)},${(
        cy +
        Math.sin(angle) * radius
      ).toFixed(2)}`
    );
  }
  return `M${points.join("L")}Z`;
};

const bars = (colors: string[], vertical: boolean) => (
  <>
    {colors.map((color, i) => (
      <rect
        key={i}
        x={vertical ? (W / colors.length) * i : 0}
        y={vertical ? 0 : (H / colors.length) * i}
        width={vertical ? W / colors.length : W}
        height={vertical ? H : H / colors.length}
        fill={color}
      />
    ))}
  </>
);

export const FLAGS: Record<FlagKey, React.FC> = {
  // Black-white-red: the imperial tricolour, co-official 1933–35 and the
  // standard stand-in on this kind of map. Swap in your own file if your
  // edit calls for a different one.
  germany: () => bars(["#111111", "#f2f2f2", "#c8102e"], false),
  poland: () => bars(["#f7f7f7", "#d4213d"], false),
  france: () => bars(["#20408f", "#f7f7f7", "#ce1126"], true),
  italy: () => bars(["#3f8b4a", "#f7f7f7", "#ce2b37"], true),

  japan: () => (
    <>
      <rect width={W} height={H} fill="#f7f7f7" />
      <circle cx={W / 2} cy={H / 2} r={17} fill="#bc002d" />
    </>
  ),

  soviet: () => (
    <>
      <rect width={W} height={H} fill="#c1121f" />
      <path d={star(20, 13, 6.5)} fill="#ffd700" />
      {/* sickle */}
      <path
        d="M13 34 A13 13 0 0 1 30 26 A9 9 0 0 0 17 34 Z"
        fill="#ffd700"
      />
      {/* hammer */}
      <g fill="#ffd700" transform="rotate(-40 22 36)">
        <rect x={20} y={26} width={3.4} height={18} rx={1} />
        <rect x={14} y={24} width={15} height={5} rx={1.4} />
      </g>
    </>
  ),

  britain: () => (
    <>
      <rect width={W} height={H} fill="#012169" />
      <g stroke="#f7f7f7" strokeWidth={12}>
        <path d={`M0 0 L${W} ${H}`} />
        <path d={`M${W} 0 L0 ${H}`} />
      </g>
      <g stroke="#c8102e" strokeWidth={5}>
        <path d={`M0 0 L${W} ${H}`} />
        <path d={`M${W} 0 L0 ${H}`} />
      </g>
      <g stroke="#f7f7f7" strokeWidth={20}>
        <path d={`M${W / 2} 0 L${W / 2} ${H}`} />
        <path d={`M0 ${H / 2} L${W} ${H / 2}`} />
      </g>
      <g stroke="#c8102e" strokeWidth={11}>
        <path d={`M${W / 2} 0 L${W / 2} ${H}`} />
        <path d={`M0 ${H / 2} L${W} ${H / 2}`} />
      </g>
    </>
  ),

  usa: () => (
    <>
      {Array.from({ length: 13 }, (_, i) => (
        <rect
          key={i}
          y={(H / 13) * i}
          width={W}
          height={H / 13}
          fill={i % 2 === 0 ? "#b31942" : "#f7f7f7"}
        />
      ))}
      <rect width={W * 0.42} height={(H / 13) * 7} fill="#0a3161" />
      {Array.from({ length: 4 }, (_, row) =>
        Array.from({ length: 5 }, (_, col) => (
          <path
            key={`${row}-${col}`}
            d={star(5 + col * 7.2, 4.5 + row * 7.6, 2.4)}
            fill="#f7f7f7"
          />
        ))
      )}
    </>
  ),
};

export const FLAG_BOX = { width: W, height: H };
