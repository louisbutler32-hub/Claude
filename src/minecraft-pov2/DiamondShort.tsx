import React from "react";
import { random, staticFile, useCurrentFrame } from "remotion";
import { H, PANEL_TOP, W } from "../minecraft/beats";
import { ease } from "../minecraft/figure";
import { Pixels } from "../minecraft/pixels";
import { Block2D, Palette } from "../minecraft-bridge/blocks";
import { CX, CY, LINE, MONO, PovFrame, PovHud, clamp01, lerp, usePreload } from "./kit";
import B from "./beats-diamond.json";

/**
 * "POV: You finally find diamonds" — first person, in a dark stone tunnel.
 * Every strike lands on a beat of Harder, Better, Faster, Stronger; the last
 * stone breaks on the drop and a wall of diamond ore is right there. You mine
 * them one a beat — until the pickaxe breaks on the sixth.
 */

export const DIAMOND_FRAMES = B.frames;
export const DIAMOND_CAPTION = ["POV: You finally", "find diamonds"];

const STONE: Palette = { base: ["#8d8d96", "#7c7c86", "#9d9da6", "#6c6c76"], weights: [0.42, 0.3, 0.18, 0.1] };
const PICK = staticFile("images/pov/pickaxe.png");
const PICK_SIZE: [number, number] = [767, 1021];
const FOCAL = 520;

const ALL_STRIKES = [...B.tunnel.flatMap((t) => t.strikes), ...B.ores, B.pickBreak];
const OREBREAK = new Set<number>(B.ores);

const strikeState = (f: number) => {
  let since = 99, toNext = 99;
  for (const s of ALL_STRIKES) {
    if (f >= s) since = Math.min(since, f - s);
    else toNext = Math.min(toNext, s - f);
  }
  return { since, toNext };
};

const shake = (f: number) => {
  let x = 0, y = 0;
  for (const s of ALL_STRIKES) {
    const t = f - s;
    if (t >= 0 && t < 9) {
      const big = s === B.reveal || s === B.pickBreak ? 2.2 : 1;
      x += Math.sin(t * 6.3) * 8 * big * (1 - t / 9);
      y += Math.cos(t * 5.1) * 6 * big * (1 - t / 9);
    }
  }
  return [x, y] as const;
};

/* ---------------------------------- tunnel ---------------------------------- */

const CRACKS: string[] = (() => {
  const out: string[] = [];
  for (let i = 0; i < 9; i++) {
    let x = 0.5 + (random(`dk${i}a`) - 0.5) * 0.3, y = 0.5 + (random(`dk${i}b`) - 0.5) * 0.3;
    const a0 = random(`dk${i}c`) * Math.PI * 2;
    let d = `M${x.toFixed(3)},${y.toFixed(3)}`;
    for (let k = 0; k < 6; k++) {
      const a = a0 + (random(`dk${i}${k}`) - 0.5) * 1.1;
      x += Math.cos(a) * 0.11; y += Math.sin(a) * 0.11;
      d += ` L${x.toFixed(3)},${y.toFixed(3)}`;
    }
    out.push(d);
  }
  return out;
})();

const Cracks: React.FC<{ x: number; y: number; s: number; stage: number }> = ({ x, y, s, stage }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke="#0c0a10" strokeWidth={0.014} strokeLinecap="round" strokeLinejoin="round" opacity={0.9}>
    {CRACKS.slice(0, Math.min(9, stage)).map((d, i) => <path key={i} d={d} />)}
  </g>
);

const tunnelState = (f: number) => {
  let n = 0;
  B.tunnel.forEach((t, i) => { if (f >= t.break) n = i + 1; });
  const prev = n > 0 ? B.tunnel[n - 1].break : -99;
  const rise = ease(f, prev + 3, prev + 11);
  return { n, zc: n === 0 ? 2 : lerp(3, 2, rise) };
};

const Tunnel: React.FC<{ f: number }> = ({ f }) => {
  const { n, zc } = tunnelState(f);
  const hwF = FOCAL / zc;
  const nearZ = 0.5;
  const hwN = FOCAL / nearZ;
  const cl = (c: string) => c;
  const quad = (pts: number[][], fill: string, key: string) => <polygon key={key} points={pts.map((p) => p.join(",")).join(" ")} fill={fill} stroke={LINE} strokeWidth={8} strokeLinejoin="round" />;
  const L = CX - hwF, R = CX + hwF, T = CY - hwF, Bo = CY + hwF;
  const out: React.ReactNode[] = [];
  out.push(quad([[CX - hwN, CY - hwN], [L, T], [L, Bo], [CX - hwN, CY + hwN]], cl("#6e6e78"), "l"));
  out.push(quad([[CX + hwN, CY - hwN], [R, T], [R, Bo], [CX + hwN, CY + hwN]], cl("#777782"), "r"));
  out.push(quad([[CX - hwN, CY - hwN], [L, T], [R, T], [CX + hwN, CY - hwN]], cl("#55555f"), "t"));
  out.push(quad([[CX - hwN, CY + hwN], [L, Bo], [R, Bo], [CX + hwN, CY + hwN]], cl("#61616b"), "b"));
  // block seams along the walls: one ring per block between the camera and the front
  for (let m = 1; m < 3; m++) {
    const z = zc - m;
    if (z <= nearZ + 0.1) break;
    const hw = FOCAL / z;
    out.push(<rect key={`ring${m}`} x={CX - hw} y={CY - hw} width={hw * 2} height={hw * 2} fill="none" stroke="#2a2a33" strokeWidth={7} />);
  }
  const breaking = B.tunnel[Math.min(n, B.tunnel.length - 1)];
  const taps = breaking.strikes.filter((s) => f >= s).length;
  const stage = n >= B.tunnel.length ? 0 : taps * 2 + (taps > 0 ? 1 : 0);
  if (n < B.tunnel.length) {
    out.push(<Block2D key="front" x={L} y={T} s={hwF * 2} pal={STONE} k={0.6} lw={9} />);
    out.push(<Cracks key="ck" x={L} y={T} s={hwF * 2} stage={stage} />);
  }
  return <g>{out}</g>;
};

/* ---------------------------------- the wall ---------------------------------- */

const CELL = 300;
const cellXY = (c: number, r: number): [number, number] => [CX - CELL * 1.5 + c * CELL, CY - CELL * 1.5 + r * CELL];
const oreIndexAt = (f: number, cr: [number, number]) => B.oreCells.findIndex((o) => o[0] === cr[0] && o[1] === cr[1]);

const Ore: React.FC<{ x: number; y: number; s: number; f: number; k: number }> = ({ x, y, s, f, k }) => {
  const dots: [number, number, number][] = [[0.18, 0.2, 0.16], [0.55, 0.14, 0.2], [0.7, 0.5, 0.18], [0.22, 0.62, 0.2], [0.5, 0.74, 0.16]];
  const pulse = 0.6 + 0.4 * Math.sin(f * 0.35 + x);
  return (
    <g>
      <Block2D x={x} y={y} s={s} pal={STONE} k={k} lw={9} />
      {dots.map(([a, b, c], i) => (
        <g key={i}>
          <rect x={x + a * s} y={y + b * s} width={c * s} height={c * s} fill="#35e6dc" stroke="#0c6f78" strokeWidth={5} />
          <rect x={x + a * s + 4} y={y + b * s + 4} width={c * s * 0.35} height={c * s * 0.35} fill="#e8fffd" opacity={pulse} />
        </g>
      ))}
    </g>
  );
};

const Wall: React.FC<{ f: number }> = ({ f }) => {
  const settle = ease(f, B.reveal, B.reveal + 12);
  const z = lerp(0.82, 1, settle);
  const cells: React.ReactNode[] = [];
  const mined = (c: number, r: number) => {
    const i = oreIndexAt(f, [c, r]);
    return i >= 0 && f >= B.ores[i] + 1;
  };
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const [x, y] = cellXY(c, r);
    const isOre = oreIndexAt(f, [c, r]) >= 0 || (c === B.failCell[0] && r === B.failCell[1]);
    if (mined(c, r)) { cells.push(<g key={`${c}${r}`}><rect x={x} y={y} width={CELL} height={CELL} fill="#0b0b10" stroke={LINE} strokeWidth={9} /><rect x={x + 30} y={y + 30} width={CELL - 60} height={CELL - 60} fill="#15151c" /></g>); continue; }
    cells.push(isOre ? <Ore key={`${c}${r}`} x={x} y={y} s={CELL} f={f} k={0.75} /> : <Block2D key={`${c}${r}`} x={x} y={y} s={CELL} pal={STONE} k={0.55} lw={9} />);
  }
  // cracks on the ore being struck right now
  const cur = B.ores.findIndex((o) => f >= o - 12 && f < o + 1);
  const crackOn = cur >= 0 ? B.oreCells[cur] : f >= B.pickBreak - 14 && f < B.pickBreak ? B.failCell : null;
  return (
    <g transform={`translate(${CX} ${CY}) scale(${z}) translate(${-CX} ${-CY})`}>
      <rect x={-300} y={PANEL_TOP - 300} width={W + 600} height={H + 600} fill="#101016" />
      {/* the rest of the cave, dim, around the 3x3 */}
      {Array.from({ length: 5 }, (_, r) => Array.from({ length: 5 }, (_, c) => {
        if (c >= 1 && c <= 3 && r >= 1 && r <= 3) return null;
        return <Block2D key={`o${r}${c}`} x={CX - CELL * 2.5 + c * CELL} y={CY - CELL * 2.5 + r * CELL} s={CELL} pal={STONE} k={0.3} lw={9} />;
      }))}
      {cells}
      {crackOn && <Cracks x={cellXY(crackOn[0], crackOn[1])[0]} y={cellXY(crackOn[0], crackOn[1])[1]} s={CELL} stage={4 + Math.floor(random(`cs${f}`) * 3)} />}
    </g>
  );
};

/* ---------------------------------- effects ---------------------------------- */

const Debris: React.FC<{ f: number }> = ({ f }) => {
  const evs: { t: number; x: number; y: number; c: string[] }[] = [
    ...B.tunnel.map((t) => ({ t: t.break, x: CX, y: CY, c: ["#8d8d96", "#6c6c76", "#9d9da6"] })),
    ...B.ores.map((o, i) => ({ t: o, x: cellXY(B.oreCells[i][0], B.oreCells[i][1])[0] + CELL / 2, y: cellXY(B.oreCells[i][0], B.oreCells[i][1])[1] + CELL / 2, c: ["#35e6dc", "#8d8d96", "#6c6c76"] })),
  ];
  return (
    <g>
      {evs.map((e, k) => {
        const t = f - e.t;
        if (t < 0 || t > 14) return null;
        return Array.from({ length: 12 }, (_, i) => {
          const a = random(`db${k}${i}`) * Math.PI * 2, v = 12 + random(`dv${k}${i}`) * 22;
          return <rect key={`${k}${i}`} x={e.x + Math.cos(a) * v * t} y={e.y + Math.sin(a) * v * t + t * t * 2.4} width={24} height={24} fill={e.c[i % e.c.length]} stroke={LINE} strokeWidth={4} opacity={1 - t / 15} />;
        });
      })}
    </g>
  );
};

const DIAMOND_ROWS = [
  "..DDDDD..",
  ".DwwCCCD.",
  "DwCCCCCCD",
  "DCCCCCCCD",
  ".DCCCCCD.",
  "..DCCCD..",
  "...DCD...",
  "....D....",
];
const DIAMOND_COL = { D: "#0e6f7a", w: "#e8fffd", C: "#3df0e6" };
const SLOT = (i: number): [number, number] => [(W - 86 * 9) / 2 + i * 86 + 43, 1812 + 43];

/** a diamond flying from the wall to its hotbar slot */
const Flyers: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {B.ores.map((o, i) => {
      const t = (f - o) / 16;
      if (t < 0 || t > 1) return null;
      const [cx0, cy0] = cellXY(B.oreCells[i][0], B.oreCells[i][1]);
      const [sx, sy] = SLOT(2);
      const u = t * t;
      return <Pixels key={i} rows={DIAMOND_ROWS} colors={DIAMOND_COL} px={10} x={lerp(cx0 + CELL / 2, sx, u)} y={lerp(cy0 + CELL / 2, sy, u) - Math.sin(t * Math.PI) * 140} />;
    })}
  </g>
);

const flashAt = (f: number) => {
  let o = 0;
  const t = f - B.reveal;
  if (t >= 0 && t < 3) o = 1;
  else if (t >= 3 && t < 20) o = 0.7 * (1 - (t - 3) / 17);
  return o;
};

/* ---------------------------------- the pickaxe ---------------------------------- */

const pickTarget = (f: number): [number, number] => {
  const cur = B.ores.findIndex((o) => f >= o - 8 && f <= o + 12);
  if (cur >= 0) { const [x, y] = cellXY(B.oreCells[cur][0], B.oreCells[cur][1]); return [x + CELL / 2, y + CELL / 2]; }
  if (f >= B.pickBreak - 8) { const [x, y] = cellXY(B.failCell[0], B.failCell[1]); return [x + CELL / 2, y + CELL / 2]; }
  return [CX, CY];
};

const Pickaxe: React.FC<{ f: number }> = ({ f }) => {
  if (f >= B.pickBreak + 1) return null;
  const { since, toNext } = strikeState(f);
  let k = 0;
  if (toNext <= 7 && toNext >= 1) k = clamp01((7 - toNext) / 6);
  if (since === 0) k = 2;
  if (since > 0 && since < 10) k = 2 - ease(since, 0, 10) * 2;
  const [tx, ty] = pickTarget(f);
  const s = 0.8, th = -35, Lg = PICK_SIZE[1] * s;
  const hit = { x: tx + Lg * 0.574, y: ty + Lg * 0.819, r: th, s };
  const idle = { x: 930, y: 2110, r: -18, s: 0.66 };
  const wind = { x: hit.x + 70, y: hit.y + 150, r: th + 22, s: 0.74 };
  const pose = k <= 1 ? { x: lerp(idle.x, wind.x, k), y: lerp(idle.y, wind.y, k), r: lerp(idle.r, wind.r, k), s: lerp(idle.s, wind.s, k) }
    : { x: lerp(wind.x, hit.x, k - 1), y: lerp(wind.y, hit.y, k - 1), r: lerp(wind.r, hit.r, k - 1), s: lerp(wind.s, hit.s, k - 1) };
  const weak = f >= B.weak && f < B.pickBreak;
  const wob = weak ? Math.sin(f * 2.2) * 5 : 0;
  return (
    <g transform={`translate(${pose.x} ${pose.y}) rotate(${pose.r + wob}) scale(${pose.s}) translate(${-PICK_SIZE[0] / 2} ${-PICK_SIZE[1]})`}>
      <filter id="pickRed" x="0" y="0" width="100%" height="100%">
        <feColorMatrix type="matrix" values="1 0.15 0.15 0 0.18  0 0.45 0 0 0  0 0 0.45 0 0  0 0 0 1 0" />
      </filter>
      <image href={PICK} x={0} y={0} width={PICK_SIZE[0]} height={PICK_SIZE[1]} filter={weak ? "url(#pickRed)" : undefined} />
    </g>
  );
};

const Shards: React.FC<{ f: number }> = ({ f }) => {
  const t = f - B.pickBreak;
  if (t < 0 || t > 22) return null;
  const [tx, ty] = pickTarget(B.pickBreak);
  return (
    <g>
      {Array.from({ length: 18 }, (_, i) => {
        const a = random(`sh${i}`) * Math.PI * 2, v = 10 + random(`sv${i}`) * 28;
        const c = ["#3df0e6", "#0e6f7a", "#8b5a34", "#e8fffd"][i % 4];
        return <rect key={i} x={tx + Math.cos(a) * v * t} y={ty + Math.sin(a) * v * t + t * t * 3} width={30 - t * 0.6} height={18} fill={c} stroke={LINE} strokeWidth={4} transform={`rotate(${t * 22 + i * 40} ${tx + Math.cos(a) * v * t} ${ty + Math.sin(a) * v * t + t * t * 3})`} opacity={1 - t / 24} />;
      })}
    </g>
  );
};

/* ---------------------------------- assembly ---------------------------------- */

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const [sx, sy] = shake(f);
  const wall = f >= B.reveal;
  const gloom = wall ? 0 : 1;
  return (
    <g transform={`translate(${sx} ${sy})`}>
      {wall ? <Wall f={f} /> : <Tunnel f={f} />}
      <Debris f={f} />
      <Flyers f={f} />
      {/* torchlight: dark at the edges, a warm pool in the middle, flickering */}
      <defs>
        <radialGradient id="dkVig" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.25" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.88 * gloom + 0.3 * (1 - gloom)} />
        </radialGradient>
      </defs>
      <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="url(#dkVig)" />
      {!wall && <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#ff9a30" opacity={0.05 + 0.03 * Math.sin(f * 0.9)} />}
      {wall && <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#35e6dc" opacity={0.05} />}
      <Shards f={f} />
      <Pickaxe f={f} />
      {f >= B.pickBreak + 1 && <BareArm f={f} />}
    </g>
  );
};

const BareArm: React.FC<{ f: number }> = ({ f }) => {
  const t = f - B.pickBreak;
  const k = ease(t, 0, 10) * 0.35;
  const x = lerp(930, 900, k), y = lerp(2100, 2020, k) + Math.sin(f * 0.1) * 5;
  return (
    <g transform={`translate(${x} ${y}) rotate(-18)`} stroke={LINE} strokeWidth={9} strokeLinejoin="round">
      <rect x={-92} y={-520} width={184} height={560} fill="#c68863" />
      <rect x={-92} y={-520} width={184} height={90} fill="#d79f78" />
      <rect x={-92} y={-210} width={184} height={250} fill="#3aa6b4" />
      <rect x={-92} y={-210} width={184} height={36} fill="#2d8793" />
    </g>
  );
};

const Hud: React.FC<{ f: number }> = ({ f }) => {
  const mined = B.ores.filter((o) => f >= o + 12).length;
  const left = B.ores.filter((o) => f >= o + 1).length;
  void left;
  const used = ALL_STRIKES.filter((s) => f >= s).length;
  const dur = Math.max(0.04, 1 - used / (ALL_STRIKES.length + 2) - (f >= B.weak ? 0.1 : 0));
  const broke = f > B.pickBreak;
  const [px] = SLOT(1);
  const [dx, dy] = SLOT(2);
  return (
    <g>
      <PovHud f={f} hp={20} items={[null, broke ? null : "pickaxe", null, null, null, null, null, null, null]} sel={1} />
      {!broke && f > B.tunnel[0].strikes[0] && (
        <g>
          <rect x={px - 30} y={1812 + 66} width={60} height={8} fill="#000" />
          <rect x={px - 30} y={1812 + 66} width={60 * dur} height={8} fill={dur > 0.5 ? "#4cd04c" : dur > 0.25 ? "#e0c030" : "#e03030"} />
        </g>
      )}
      {mined > 0 && (
        <g>
          <Pixels rows={DIAMOND_ROWS} colors={DIAMOND_COL} px={6} x={dx} y={dy - 4} />
          <text x={dx + 36} y={dy + 36} textAnchor="end" fontFamily={MONO} fontSize={30} fill="#fff" stroke="#000" strokeWidth={5} paintOrder="stroke">{mined}</text>
        </g>
      )}
      {f >= B.pickBreak - 2 && f < B.pickBreak + 22 && <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#ff2a2a" opacity={0.18 * (1 - (f - B.pickBreak) / 22)} />}
      {flashAt(f) > 0 && <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#e8fffd" opacity={flashAt(f)} />}
    </g>
  );
};

export const DiamondShort: React.FC<{ audio?: string | null; drawn?: boolean }> = ({ audio = null, drawn = true }) => {
  usePreload([PICK]);
  const f = useCurrentFrame();
  return <PovFrame audio={audio} drawn={drawn} caption={DIAMOND_CAPTION} panelId="dmPanel" scene={<Scene f={f} />} hud={<Hud f={f} />} />;
};

export const DiamondThumb: React.FC = () => {
  usePreload([PICK]);
  const f = B.ores[1] + 3;
  return <PovFrame drawn={false} caption={DIAMOND_CAPTION} panelId="dmPanelT" scene={<Scene f={f} />} hud={<Hud f={f} />} />;
};
