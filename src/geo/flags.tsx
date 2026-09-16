import React from "react";

// ── Flags, drawn in code ──────────────────────────────────────────────
//
// Each flag is drawn to fill a rectangle: a country wears its flag the way
// the reference channel does, stretched over the shape's bounding box, so a
// flag never has to keep its own proportions. Nothing here is an image file:
// nothing to license, and sharp at any zoom.

export type FlagKey =
  | "usa"
  | "russia"
  | "france"
  | "spain"
  | "haiti"
  | "panama"
  | "colombia"
  | "argentina"
  | "canada"
  | "mexico"
  | "uk"
  | "germany"
  | "germany1914"
  | "belgium"
  | "netherlands"
  | "austria"
  | "prussia"
  | "texas"
  | "napoleon";

type Box = { x: number; y: number; w: number; h: number };

/** The colour that stands in for the flag on a shape too small to read. */
export const FLAG_COLOR: Record<FlagKey, string> = {
  usa: "#b22234",
  russia: "#d52b1e",
  france: "#0055a4",
  spain: "#c60b1e",
  haiti: "#00209f",
  panama: "#005293",
  colombia: "#fcd116",
  argentina: "#74acdf",
  canada: "#d80621",
  mexico: "#006847",
  uk: "#012169",
  germany: "#dd0000",
  germany1914: "#1a1a1a",
  belgium: "#fdda24",
  netherlands: "#ae1c28",
  austria: "#ed2939",
  prussia: "#1a1a1a",
  texas: "#002868",
  napoleon: "#0055a4",
};

const star = (cx: number, cy: number, r: number): string => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.382;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + Math.cos(a) * radius).toFixed(2)},${(cy + Math.sin(a) * radius).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
};

const bands = (b: Box, colors: string[], vertical: boolean, weights?: number[]) => {
  const total = (weights ?? colors.map(() => 1)).reduce((a, c) => a + c, 0);
  let acc = 0;
  return colors.map((c, i) => {
    const w = (weights ?? colors.map(() => 1))[i] / total;
    const el = vertical ? (
      <rect key={i} x={b.x + b.w * acc} y={b.y} width={b.w * w + 0.5} height={b.h} fill={c} />
    ) : (
      <rect key={i} x={b.x} y={b.y + b.h * acc} width={b.w} height={b.h * w + 0.5} fill={c} />
    );
    acc += w;
    return el;
  });
};

const Usa: React.FC<Box> = (b) => {
  const stripes: React.ReactNode[] = [];
  for (let i = 0; i < 13; i++) {
    stripes.push(
      <rect
        key={i}
        x={b.x}
        y={b.y + (b.h * i) / 13}
        width={b.w}
        height={b.h / 13 + 0.5}
        fill={i % 2 === 0 ? "#b22234" : "#ffffff"}
      />
    );
  }
  const cw = b.w * 0.4;
  const ch = (b.h * 7) / 13;
  const stars: React.ReactNode[] = [];
  const r = Math.min(cw / 12, ch / 11) * 0.62;
  for (let row = 0; row < 9; row++) {
    const count = row % 2 === 0 ? 6 : 5;
    for (let col = 0; col < count; col++) {
      const cx = b.x + (cw * (col + (row % 2 === 0 ? 0.5 : 1))) / 6;
      const cy = b.y + (ch * (row + 0.5)) / 9;
      stars.push(<path key={`${row}-${col}`} d={star(cx, cy, r)} fill="#ffffff" />);
    }
  }
  return (
    <>
      {stripes}
      <rect x={b.x} y={b.y} width={cw} height={ch} fill="#3c3b6e" />
      {stars}
    </>
  );
};

const Panama: React.FC<Box> = (b) => {
  const hw = b.w / 2;
  const hh = b.h / 2;
  const r = Math.min(hw, hh) * 0.3;
  return (
    <>
      <rect x={b.x} y={b.y} width={hw + 0.5} height={hh + 0.5} fill="#ffffff" />
      <rect x={b.x + hw} y={b.y} width={hw} height={hh + 0.5} fill="#d21034" />
      <rect x={b.x} y={b.y + hh} width={hw + 0.5} height={hh} fill="#005293" />
      <rect x={b.x + hw} y={b.y + hh} width={hw} height={hh} fill="#ffffff" />
      <path d={star(b.x + hw / 2, b.y + hh / 2, r)} fill="#005293" />
      <path d={star(b.x + hw * 1.5, b.y + hh * 1.5, r)} fill="#d21034" />
    </>
  );
};

const Argentina: React.FC<Box> = (b) => {
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  const r = Math.min(b.w, b.h) * 0.11;
  const rays: React.ReactNode[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const len = i % 2 === 0 ? r * 2.1 : r * 1.6;
    rays.push(
      <line
        key={i}
        x1={cx + Math.cos(a) * r * 1.05}
        y1={cy + Math.sin(a) * r * 1.05}
        x2={cx + Math.cos(a) * len}
        y2={cy + Math.sin(a) * len}
        stroke="#f6b40e"
        strokeWidth={Math.max(1.5, r * 0.22)}
        strokeLinecap="round"
      />
    );
  }
  return (
    <>
      {bands(b, ["#74acdf", "#ffffff", "#74acdf"], false)}
      {rays}
      <circle cx={cx} cy={cy} r={r} fill="#f6b40e" />
    </>
  );
};

const Haiti: React.FC<Box> = (b) => (
  <>
    {bands(b, ["#00209f", "#d21034"], false)}
    <rect
      x={b.x + b.w * 0.38}
      y={b.y + b.h * 0.3}
      width={b.w * 0.24}
      height={b.h * 0.4}
      fill="#ffffff"
    />
  </>
);

const Canada: React.FC<Box> = (b) => {
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  const s = Math.min(b.w * 0.5, b.h) * 0.34;
  // a simplified maple leaf
  const leaf = `M ${cx} ${cy - s} l ${s * 0.18} ${s * 0.35} l ${s * 0.3} ${-s * 0.15} l ${-s * 0.12} ${s * 0.45} l ${s * 0.45} ${-s * 0.1} l ${-s * 0.15} ${s * 0.3} l ${s * 0.3} ${s * 0.25} l ${-s * 0.75} ${s * 0.1} l ${s * 0.05} ${s * 0.4} l ${-s * 0.26} ${-s * 0.3} l ${-s * 0.26} ${s * 0.3} l ${s * 0.05} ${-s * 0.4} l ${-s * 0.75} ${-s * 0.1} l ${s * 0.3} ${-s * 0.25} l ${-s * 0.15} ${-s * 0.3} l ${s * 0.45} ${s * 0.1} l ${-s * 0.12} ${-s * 0.45} l ${s * 0.3} ${s * 0.15} Z`;
  return (
    <>
      {bands(b, ["#d80621", "#ffffff", "#d80621"], true, [1, 2, 1])}
      <path d={leaf} fill="#d80621" />
    </>
  );
};

const Uk: React.FC<Box> = (b) => {
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  const sw = Math.min(b.w, b.h);
  return (
    <>
      <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="#012169" />
      <line x1={b.x} y1={b.y} x2={b.x + b.w} y2={b.y + b.h} stroke="#ffffff" strokeWidth={sw * 0.2} />
      <line x1={b.x + b.w} y1={b.y} x2={b.x} y2={b.y + b.h} stroke="#ffffff" strokeWidth={sw * 0.2} />
      <line x1={b.x} y1={b.y} x2={b.x + b.w} y2={b.y + b.h} stroke="#c8102e" strokeWidth={sw * 0.07} />
      <line x1={b.x + b.w} y1={b.y} x2={b.x} y2={b.y + b.h} stroke="#c8102e" strokeWidth={sw * 0.07} />
      <rect x={cx - sw * 0.17} y={b.y} width={sw * 0.34} height={b.h} fill="#ffffff" />
      <rect x={b.x} y={cy - sw * 0.17} width={b.w} height={sw * 0.34} fill="#ffffff" />
      <rect x={cx - sw * 0.1} y={b.y} width={sw * 0.2} height={b.h} fill="#c8102e" />
      <rect x={b.x} y={cy - sw * 0.1} width={b.w} height={sw * 0.2} fill="#c8102e" />
    </>
  );
};

export const Flag: React.FC<{ flag: FlagKey } & Box> = ({ flag, ...b }) => {
  switch (flag) {
    case "usa":
      return <Usa {...b} />;
    case "russia":
      return <>{bands(b, ["#ffffff", "#0039a6", "#d52b1e"], false)}</>;
    case "france":
      return <>{bands(b, ["#0055a4", "#ffffff", "#ef4135"], true)}</>;
    case "spain":
      return <>{bands(b, ["#c60b1e", "#ffc400", "#c60b1e"], false, [1, 2, 1])}</>;
    case "haiti":
      return <Haiti {...b} />;
    case "panama":
      return <Panama {...b} />;
    case "colombia":
      return <>{bands(b, ["#fcd116", "#003893", "#ce1126"], false, [2, 1, 1])}</>;
    case "argentina":
      return <Argentina {...b} />;
    case "canada":
      return <Canada {...b} />;
    case "mexico":
      return <>{bands(b, ["#006847", "#ffffff", "#ce1126"], true)}</>;
    case "uk":
      return <Uk {...b} />;
    case "germany":
      return <>{bands(b, ["#1a1a1a", "#dd0000", "#ffce00"], false)}</>;
    // the Kaiserreich tricolour, 1871-1918
    case "germany1914":
      return <>{bands(b, ["#1a1a1a", "#ffffff", "#dd0000"], false)}</>;
    case "belgium":
      return <>{bands(b, ["#1a1a1a", "#fdda24", "#ef3340"], true)}</>;
    case "netherlands":
      return <>{bands(b, ["#ae1c28", "#ffffff", "#21468b"], false)}</>;
    case "austria":
      return <>{bands(b, ["#ed2939", "#ffffff", "#ed2939"], false)}</>;
    // Prussia's black over white
    case "prussia":
      return <>{bands(b, ["#1a1a1a", "#ffffff"], false)}</>;
    case "texas":
      return <Texas {...b} />;
    // the First Empire's tricolour, same cloth as France's
    case "napoleon":
      return <>{bands(b, ["#0055a4", "#ffffff", "#ef4135"], true)}</>;
  }
};

/** The Lone Star: a blue hoist with a white star, white over red at the fly. */
const Texas: React.FC<Box> = (b) => {
  const hoist = b.w / 3;
  return (
    <>
      <rect x={b.x} y={b.y} width={hoist + 0.5} height={b.h} fill="#002868" />
      <rect x={b.x + hoist} y={b.y} width={b.w - hoist} height={b.h / 2 + 0.5} fill="#ffffff" />
      <rect x={b.x + hoist} y={b.y + b.h / 2} width={b.w - hoist} height={b.h / 2} fill="#bf0a30" />
      <path d={star(b.x + hoist / 2, b.y + b.h / 2, Math.min(hoist, b.h) * 0.36)} fill="#ffffff" />
    </>
  );
};

/** The soft moving sheen that makes a flat flag read as cloth. */
export const Sheen: React.FC<Box & { t: number }> = ({ x, y, w, h, t }) => {
  const id = `sheen-${Math.round(x)}-${Math.round(y)}`;
  const phase = (t * 0.09) % 1;
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0.6">
          <stop offset={Math.max(0, phase - 0.35)} stopColor="#000" stopOpacity="0" />
          <stop offset={Math.max(0, phase - 0.18)} stopColor="#000" stopOpacity="0.22" />
          <stop offset={phase} stopColor="#fff" stopOpacity="0.16" />
          <stop offset={Math.min(1, phase + 0.16)} stopColor="#000" stopOpacity="0.2" />
          <stop offset={Math.min(1, phase + 0.32)} stopColor="#000" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} />
    </>
  );
};
