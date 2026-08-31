import React from "react";

// ── Emblems ────────────────────────────────────────────────────────────
//
// Flags and coats of arms, drawn in code rather than shipped as image
// files: nothing to license, nothing to fetch, sharp at any resolution.
//
// Each emblem carries its own box, so a shield isn't squashed into flag
// proportions. FlagPin scales whatever it is given to fit the pin.
//
// Need one that isn't here? Drop the file in public/assets/ and pass
// `src="assets/..."` to FlagPin instead of a key.

export type Emblem = { width: number; height: number; Draw: React.FC };

const W = 90;
const H = 60;
const flag = (Draw: React.FC): Emblem => ({ width: W, height: H, Draw });

// ── Modern flags ───────────────────────────────────────────────────────

export type FlagKey =
  | "germany"
  | "poland"
  | "france"
  | "britain"
  | "italy"
  | "soviet"
  | "usa"
  | "japan";

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

const bars = (colors: string[], vertical: boolean, w = W, h = H) => (
  <>
    {colors.map((color, i) => (
      <rect
        key={i}
        x={vertical ? (w / colors.length) * i : 0}
        y={vertical ? 0 : (h / colors.length) * i}
        width={vertical ? w / colors.length : w}
        height={vertical ? h : h / colors.length}
        fill={color}
      />
    ))}
  </>
);

export const FLAGS: Record<FlagKey, Emblem> = {
  // Black-white-red: the imperial tricolour, co-official 1933–35 and the
  // standard stand-in on this kind of map. Swap in your own file if your
  // edit calls for a different one.
  germany: flag(() => bars(["#111111", "#f2f2f2", "#c8102e"], false)),
  poland: flag(() => bars(["#f7f7f7", "#d4213d"], false)),
  france: flag(() => bars(["#20408f", "#f7f7f7", "#ce1126"], true)),
  italy: flag(() => bars(["#3f8b4a", "#f7f7f7", "#ce2b37"], true)),

  japan: flag(() => (
    <>
      <rect width={W} height={H} fill="#f7f7f7" />
      <circle cx={W / 2} cy={H / 2} r={17} fill="#bc002d" />
    </>
  )),

  soviet: flag(() => (
    <>
      <rect width={W} height={H} fill="#c1121f" />
      <path d={star(20, 13, 6.5)} fill="#ffd700" />
      <path d="M13 34 A13 13 0 0 1 30 26 A9 9 0 0 0 17 34 Z" fill="#ffd700" />
      <g fill="#ffd700" transform="rotate(-40 22 36)">
        <rect x={20} y={26} width={3.4} height={18} rx={1} />
        <rect x={14} y={24} width={15} height={5} rx={1.4} />
      </g>
    </>
  )),

  britain: flag(() => (
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
  )),

  usa: flag(() => (
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
  )),
};

// ── Medieval arms ──────────────────────────────────────────────────────
// Drawn tall, for the shield pin shape. Angular, blocky heraldry — that is
// what these actually looked like on a banner, and it survives being 60px
// wide on a phone.

export type ArmsKey =
  | "mongol"
  | "mongolBlack"
  | "piast"
  | "arpad"
  | "hre"
  | "babenberg";

const AW = 90;
const AH = 104;
const arms = (Draw: React.FC): Emblem => ({ width: AW, height: AH, Draw });

/** Spread eagle, stylised into straight feathers. */
const Eagle: React.FC<{ fill: string }> = ({ fill }) => (
  <g fill={fill}>
    <circle cx={45} cy={34} r={8} />
    <path d="M37 32 L26 36 L37 40 Z" />
    <path d="M45 40 C53 47 53 68 45 80 C37 68 37 47 45 40 Z" />
    {/* wings */}
    <path d="M43 48 L20 34 L25 47 L11 40 L18 53 L6 51 L20 64 L38 63 Z" />
    <path d="M47 48 L70 34 L65 47 L79 40 L72 53 L84 51 L70 64 L52 63 Z" />
    {/* tail */}
    <path d="M39 76 L45 96 L51 76 Z" />
    <path d="M34 74 L38 90 L43 77 Z" />
    <path d="M56 74 L52 90 L47 77 Z" />
  </g>
);

/** The sülde — the horsehair spirit standard that actually travelled with
 *  the army, rather than a flag they never really used. */
const Sulde: React.FC<{ field: string; ink: string }> = ({ field, ink }) => (
  <>
    <rect width={AW} height={AH} fill={field} />
    <g fill={ink}>
      <path d="M45 12 L51 32 L39 32 Z" />
      <rect x={42.5} y={30} width={5} height={58} rx={2} />
      <circle cx={45} cy={38} r={9} />
      {[-2, -1, 0, 1, 2].map((i) => (
        <rect
          key={i}
          x={44}
          y={44}
          width={2.6}
          height={22}
          rx={1.3}
          transform={`rotate(${i * 17} 45 44)`}
        />
      ))}
    </g>
  </>
);

export const ARMS: Record<ArmsKey, Emblem> = {
  // Köke Mongol — the blue banner, with the sülde standard that actually
  // travelled with the army.
  mongol: arms(() => <Sulde field="#2f5f9e" ink="#f0c44a" />),

  // The black standard. Raised for war, and the banner to fly the moment a
  // khan dies — the same emblem, all the colour gone out of it.
  mongolBlack: arms(() => <Sulde field="#22262c" ink="#b9bcc2" />),

  // Piast Poland: white eagle on red.
  piast: arms(() => (
    <>
      <rect width={AW} height={AH} fill="#c8102e" />
      <Eagle fill="#f7f7f7" />
    </>
  )),

  // Árpád Hungary: eight bars, silver and red.
  arpad: arms(() => (
    <>{bars(["#f2f2f2", "#c8102e", "#f2f2f2", "#c8102e", "#f2f2f2", "#c8102e", "#f2f2f2", "#c8102e"], false, AW, AH)}</>
  )),

  // Holy Roman Empire: black eagle on gold.
  hre: arms(() => (
    <>
      <rect width={AW} height={AH} fill="#e3b23c" />
      <Eagle fill="#151515" />
    </>
  )),

  // Babenberg Austria: red, white, red.
  babenberg: arms(() => (
    <>{bars(["#c8102e", "#f2f2f2", "#c8102e"], false, AW, AH)}</>
  )),
};

export const EMBLEMS: Record<string, Emblem> = { ...FLAGS, ...ARMS };
