import React from "react";

// ── Icons ─────────────────────────────────────────────────────────────
// Small pictograms for the callouts and the reasons row, drawn in code in
// a 100×100 box. Flat, two-tone, the way the reference channel's are.

export type IconKey =
  | "coin"
  | "gold"
  | "note"
  | "dollar"
  | "ice"
  | "thermo"
  | "road"
  | "ship"
  | "rain"
  | "mountain"
  | "swamp"
  | "disease"
  | "tree"
  | "people"
  | "calendar"
  | "clock"
  | "ruler"
  | "wave"
  | "bridge"
  | "tunnel"
  | "question"
  | "arrow"
  | "car"
  | "cross"
  | "check"
  | "missile"
  | "flagpost"
  | "factory";

const GOLD = "#f4c542";
const GOLD_DARK = "#b8860b";

export const Icon: React.FC<{ icon: IconKey; size?: number; color?: string }> = ({ icon, size = 64, color = "#ffffff" }) => {
  const c = color;
  let body: React.ReactNode = null;
  switch (icon) {
    case "coin":
      body = (
        <>
          <circle cx={50} cy={50} r={42} fill={GOLD} stroke={GOLD_DARK} strokeWidth={6} />
          <circle cx={50} cy={50} r={30} fill="none" stroke={GOLD_DARK} strokeWidth={4} />
          <text x={50} y={64} textAnchor="middle" fontSize={40} fontWeight={800} fill={GOLD_DARK} fontFamily="Montserrat, sans-serif">$</text>
        </>
      );
      break;
    case "gold":
      body = (
        <>
          {[
            [10, 60],
            [42, 60],
            [26, 34],
          ].map(([x, y], i) => (
            <g key={i}>
              <path d={`M${x + 8} ${y} h34 l8 22 h-50 z`} fill={GOLD} stroke={GOLD_DARK} strokeWidth={3} strokeLinejoin="round" />
              <path d={`M${x + 8} ${y} h34 l4 11 h-42 z`} fill="#ffe08a" opacity={0.7} />
            </g>
          ))}
        </>
      );
      break;
    case "note":
      body = (
        <>
          <rect x={8} y={26} width={84} height={48} rx={6} fill="#5ba85a" stroke="#2f6e2e" strokeWidth={4} />
          <rect x={18} y={34} width={64} height={32} rx={4} fill="none" stroke="#2f6e2e" strokeWidth={3} />
          <circle cx={50} cy={50} r={11} fill="#c9e7b9" stroke="#2f6e2e" strokeWidth={3} />
        </>
      );
      break;
    case "dollar":
      body = (
        <>
          <circle cx={50} cy={50} r={42} fill="#2ecc71" stroke="#1b7f45" strokeWidth={6} />
          <text x={50} y={66} textAnchor="middle" fontSize={50} fontWeight={800} fill="#ffffff" fontFamily="Montserrat, sans-serif">$</text>
        </>
      );
      break;
    case "ice":
      body = (
        <g stroke={c} strokeWidth={6} strokeLinecap="round" fill="none">
          {[0, 60, 120].map((a) => (
            <g key={a} transform={`rotate(${a} 50 50)`}>
              <line x1={50} y1={8} x2={50} y2={92} />
              <path d="M50 20 l-10 10 M50 20 l10 10 M50 80 l-10 -10 M50 80 l10 -10" />
            </g>
          ))}
        </g>
      );
      break;
    case "thermo":
      body = (
        <>
          <rect x={40} y={8} width={20} height={60} rx={10} fill="none" stroke={c} strokeWidth={6} />
          <circle cx={50} cy={78} r={16} fill="#4fc3f7" stroke={c} strokeWidth={6} />
          <rect x={46} y={40} width={8} height={30} fill="#4fc3f7" />
        </>
      );
      break;
    case "road":
      body = (
        <>
          <path d="M20 92 L40 8 H60 L80 92 Z" fill="#555" stroke={c} strokeWidth={5} strokeLinejoin="round" />
          <path d="M50 20 v14 M50 46 v14 M50 72 v14" stroke="#ffd23f" strokeWidth={5} strokeLinecap="round" />
        </>
      );
      break;
    case "ship":
      body = (
        <>
          <path d="M12 60 H88 L76 84 H24 Z" fill={c} />
          <rect x={34} y={34} width={32} height={26} fill={c} opacity={0.8} />
          <rect x={44} y={18} width={12} height={16} fill={c} opacity={0.8} />
          <path d="M8 90 q10 -8 20 0 t20 0 t20 0 t20 0" stroke="#4fc3f7" strokeWidth={5} fill="none" strokeLinecap="round" />
        </>
      );
      break;
    case "rain":
      body = (
        <>
          <path d="M28 58 a16 16 0 0 1 4 -31 a20 20 0 0 1 38 4 a14 14 0 0 1 2 27 z" fill={c} />
          {[30, 48, 66].map((x, i) => (
            <line key={i} x1={x} y1={68} x2={x - 6} y2={88} stroke="#4fc3f7" strokeWidth={6} strokeLinecap="round" />
          ))}
        </>
      );
      break;
    case "mountain":
      body = (
        <>
          <path d="M6 86 L38 30 L54 56 L66 40 L94 86 Z" fill={c} />
          <path d="M38 30 L46 44 L38 50 L30 44 Z" fill="#dfe9f3" />
        </>
      );
      break;
    case "swamp":
      body = (
        <>
          <path d="M8 70 q12 -10 24 0 t24 0 t24 0 t14 0" stroke="#4fc3f7" strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M8 84 q12 -10 24 0 t24 0 t24 0 t14 0" stroke="#4fc3f7" strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M30 66 v-40 M40 66 v-30 M50 66 v-44" stroke="#7cb342" strokeWidth={6} strokeLinecap="round" />
          <ellipse cx={30} cy={24} rx={6} ry={12} fill="#7cb342" />
        </>
      );
      break;
    case "disease":
      body = (
        <>
          <circle cx={50} cy={50} r={22} fill={c} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <g key={a} transform={`rotate(${a} 50 50)`}>
              <line x1={50} y1={22} x2={50} y2={10} stroke={c} strokeWidth={6} strokeLinecap="round" />
              <circle cx={50} cy={8} r={6} fill={c} />
            </g>
          ))}
        </>
      );
      break;
    case "tree":
      body = (
        <>
          <path d="M50 8 L78 50 H62 L82 78 H18 L38 50 H22 Z" fill="#43a047" />
          <rect x={44} y={78} width={12} height={16} fill="#6d4c41" />
        </>
      );
      break;
    case "people":
      body = (
        <>
          <circle cx={34} cy={30} r={12} fill={c} />
          <circle cx={66} cy={30} r={12} fill={c} />
          <path d="M14 86 v-20 a20 20 0 0 1 40 0 v20 z" fill={c} />
          <path d="M46 86 v-20 a20 20 0 0 1 40 0 v20 z" fill={c} opacity={0.85} />
        </>
      );
      break;
    case "calendar":
      body = (
        <>
          <rect x={12} y={20} width={76} height={70} rx={8} fill={c} />
          <rect x={12} y={20} width={76} height={20} rx={8} fill="#e63946" />
          <rect x={28} y={10} width={8} height={20} rx={4} fill={c} />
          <rect x={64} y={10} width={8} height={20} rx={4} fill={c} />
          {[0, 1, 2].map((r) =>
            [0, 1, 2, 3].map((k) => <rect key={`${r}${k}`} x={22 + k * 16} y={48 + r * 13} width={10} height={8} fill="#0d2f45" opacity={0.5} />)
          )}
        </>
      );
      break;
    case "clock":
      body = (
        <>
          <circle cx={50} cy={50} r={42} fill="none" stroke={c} strokeWidth={7} />
          <path d="M50 24 V50 L68 62" stroke={c} strokeWidth={7} strokeLinecap="round" fill="none" />
        </>
      );
      break;
    case "ruler":
      body = (
        <>
          <rect x={8} y={36} width={84} height={28} rx={4} fill={c} />
          {[20, 32, 44, 56, 68, 80].map((x, i) => (
            <line key={x} x1={x} y1={36} x2={x} y2={i % 2 ? 50 : 56} stroke="#0d2f45" strokeWidth={4} />
          ))}
        </>
      );
      break;
    case "wave":
      body = (
        <g stroke="#4fc3f7" strokeWidth={7} fill="none" strokeLinecap="round">
          <path d="M6 40 q11 -14 22 0 t22 0 t22 0 t22 0" />
          <path d="M6 64 q11 -14 22 0 t22 0 t22 0 t22 0" />
        </g>
      );
      break;
    case "bridge":
      body = (
        <>
          <path d="M6 44 H94" stroke={c} strokeWidth={7} strokeLinecap="round" />
          <path d="M14 44 q36 -40 72 0" stroke={c} strokeWidth={6} fill="none" />
          <path d="M24 44 v40 M50 44 v40 M76 44 v40" stroke={c} strokeWidth={7} strokeLinecap="round" />
        </>
      );
      break;
    case "tunnel":
      body = (
        <>
          <path d="M14 90 V50 a36 36 0 0 1 72 0 V90" fill="none" stroke={c} strokeWidth={8} />
          <path d="M30 90 V56 a20 20 0 0 1 40 0 V90 Z" fill="#0d2f45" />
        </>
      );
      break;
    case "question":
      body = (
        <text x={50} y={78} textAnchor="middle" fontSize={84} fontWeight={900} fill={c} fontFamily="Montserrat, sans-serif">?</text>
      );
      break;
    case "arrow":
      body = <path d="M10 50 H74 M52 24 L80 50 L52 76" stroke={c} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
      break;
    case "car":
      body = (
        <>
          <path d="M14 66 v-14 l14 -22 h44 l14 22 v14 z" fill={c} />
          <circle cx={30} cy={70} r={10} fill="#222" stroke={c} strokeWidth={4} />
          <circle cx={70} cy={70} r={10} fill="#222" stroke={c} strokeWidth={4} />
          <rect x={34} y={36} width={32} height={14} fill="#4fc3f7" />
        </>
      );
      break;
    case "cross":
      body = <path d="M24 24 L76 76 M76 24 L24 76" stroke="#e63946" strokeWidth={14} strokeLinecap="round" />;
      break;
    case "check":
      body = <path d="M18 54 L42 76 L84 26" stroke="#2ecc71" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
      break;
    case "missile":
      body = (
        <>
          <path d="M50 6 C 62 20, 66 44, 62 72 H38 C34 44, 38 20, 50 6 Z" fill={c} />
          <path d="M38 56 L22 76 H38 Z M62 56 L78 76 H62 Z" fill={c} />
          <path d="M42 72 H58 L54 82 H46 Z" fill="#e63946" />
          <path d="M44 84 q6 12 12 0" stroke="#ffb703" strokeWidth={6} fill="none" strokeLinecap="round" />
          <circle cx={50} cy={34} r={5} fill="#0d2f45" />
        </>
      );
      break;
    case "flagpost":
      body = (
        <>
          <rect x={22} y={8} width={6} height={84} rx={3} fill={c} />
          <path d="M28 12 H84 L72 30 L84 48 H28 Z" fill="#e63946" />
        </>
      );
      break;
    case "factory":
      body = (
        <>
          <path d="M10 90 V50 L34 64 V50 L58 64 V50 L82 64 V24 H92 V90 Z" fill={c} />
          <rect x={20} y={70} width={10} height={10} fill="#0d2f45" opacity={0.6} />
          <rect x={44} y={70} width={10} height={10} fill="#0d2f45" opacity={0.6} />
          <rect x={68} y={70} width={10} height={10} fill="#0d2f45" opacity={0.6} />
        </>
      );
      break;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", overflow: "visible" }}>
      {body}
    </svg>
  );
};
