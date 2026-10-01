import React from "react";
import { random, staticFile, useCurrentFrame } from "remotion";
import { H, PANEL_TOP, W } from "../minecraft/beats";
import { ease } from "../minecraft/figure";
import { Pixels } from "../minecraft/pixels";
import { Hearts } from "../minecraft-fall/hud";
import { LINE, MONO, PovFrame, clamp01, lerp, usePreload } from "./kit";
import B from "./beats-diamond.json";

/**
 * "POV: You finally find diamonds" — first person, in a dark stone tunnel.
 * One hit breaks the stone; you walk the two blocks of tunnel on the beat;
 * on the drop of Harder, Better, Faster, Stronger there is a wall of diamond
 * ore. The first three break on three kicks, and the fourth breaks the
 * pickaxe. The textures are the real ones (stone, diamond ore, the iron
 * pickaxe, the block-breaking cracks), shown as crisp pixels.
 */

export const DIAMOND_FRAMES = B.frame;
export const DIAMOND_CAPTION = ["POV: You finally", "find diamonds"];

const IMG = {
  pick: staticFile("images/pov2/iron-pickaxe.png"),
  ore: staticFile("images/pov2/diamond-ore.png"),
  stone: staticFile("images/pov2/stone.png"),
  breaks: [0, 1, 2, 3, 4, 5].map((i) => staticFile(`images/pov2/break-${i}.png`)),
};
const PX: React.CSSProperties = { imageRendering: "pixelated" };

const FOCAL = 520;
const SCX = 540;
const SCY = 960; // the view is centred high so the HUD sits well above the Shorts buttons

const HITS = [B.hit, ...B.ores, B.pickBreak];

/** stage 0-5 of the cracks, during the three frames before a block goes */
const crackStage = (f: number, hit: number) => {
  const d = hit - f;
  return d >= 1 && d <= 3 ? [5, 3, 1][d - 1] : -1;
};

const strikeState = (f: number) => {
  let since = 99, toNext = 99;
  for (const s of HITS) {
    if (f >= s) since = Math.min(since, f - s);
    else toNext = Math.min(toNext, s - f);
  }
  return { since, toNext };
};

const shake = (f: number) => {
  let x = 0, y = 0;
  for (const s of [...HITS, ...B.steps]) {
    const t = f - s;
    const big = s === B.reveal || s === B.pickBreak ? 2.2 : B.steps.includes(s) ? 0.35 : 1;
    if (t >= 0 && t < 9) {
      x += Math.sin(t * 6.3) * 8 * big * (1 - t / 9);
      y += Math.cos(t * 5.1) * 6 * big * (1 - t / 9);
    }
  }
  return [x, y] as const;
};

/* ---------------------------------- tunnel ---------------------------------- */

const Tunnel: React.FC<{ f: number }> = ({ f }) => {
  const broken = f >= B.hit;
  const d = 2 * ease(f, B.walk[0], B.walk[1]);
  const hwF = FOCAL / 2;
  const nearZ = 0.5, hwN = FOCAL / nearZ;
  const farZ = broken ? 9 : 2, hwFar = FOCAL / farZ;
  const L = SCX - hwFar, R = SCX + hwFar, T = SCY - hwFar, Bo = SCY + hwFar;
  const quad = (pts: number[][], fill: string, key: string) => <polygon key={key} points={pts.map((p) => p.join(",")).join(" ")} fill={fill} stroke={LINE} strokeWidth={8} strokeLinejoin="round" />;
  const out: React.ReactNode[] = [];
  if (broken) out.push(<rect key="void" x={SCX - 700} y={SCY - 700} width={1400} height={1400} fill="#06060a" />);
  out.push(quad([[SCX - hwN, SCY - hwN], [L, T], [L, Bo], [SCX - hwN, SCY + hwN]], "#6e6e78", "l"));
  out.push(quad([[SCX + hwN, SCY - hwN], [R, T], [R, Bo], [SCX + hwN, SCY + hwN]], "#777782", "r"));
  out.push(quad([[SCX - hwN, SCY - hwN], [L, T], [R, T], [SCX + hwN, SCY - hwN]], "#55555f", "t"));
  out.push(quad([[SCX - hwN, SCY + hwN], [L, Bo], [R, Bo], [SCX + hwN, SCY + hwN]], "#61616b", "b"));
  // a seam ring per block, sliding toward you as you walk
  for (let k = 0; k < 10; k++) {
    const z = k + 1 - (broken ? d % 1 : 0);
    if (z <= 0.6 || z >= farZ) continue;
    const hw = FOCAL / z;
    out.push(<rect key={`ring${k}`} x={SCX - hw} y={SCY - hw} width={hw * 2} height={hw * 2} fill="none" stroke="#2a2a33" strokeWidth={7} />);
  }
  if (!broken) {
    out.push(<image key="front" href={IMG.stone} x={SCX - hwF} y={SCY - hwF} width={hwF * 2} height={hwF * 2} style={PX} />);
    out.push(<rect key="fr" x={SCX - hwF} y={SCY - hwF} width={hwF * 2} height={hwF * 2} fill="none" stroke={LINE} strokeWidth={9} />);
    const st = crackStage(f, B.hit);
    if (st >= 0) out.push(<image key="ck" href={IMG.breaks[st]} x={SCX - hwF} y={SCY - hwF} width={hwF * 2} height={hwF * 2} style={PX} />);
  }
  return <g>{out}</g>;
};

/* ---------------------------------- the wall ---------------------------------- */

const CELL = 270;
const cellXY = (c: number, r: number): [number, number] => [SCX - CELL * 1.5 + c * CELL, SCY - CELL * 1.5 + r * CELL];
const oreIndex = (c: number, r: number) => B.oreCells.findIndex((o) => o[0] === c && o[1] === r);
const isFail = (c: number, r: number) => c === B.failCell[0] && r === B.failCell[1];
const OREISH: [number, number][] = [[1, 1], [0, 1], [2, 1], [1, 0], [0, 0], [2, 2]];

const Wall: React.FC<{ f: number }> = ({ f }) => {
  const settle = ease(f, B.reveal, B.reveal + 10);
  const z = lerp(0.84, 1, settle);
  const cells: React.ReactNode[] = [];
  const crack = (x: number, y: number, hit: number, key: string) => {
    const st = crackStage(f, hit);
    return st >= 0 ? <image key={key} href={IMG.breaks[st]} x={x} y={y} width={CELL} height={CELL} style={PX} /> : null;
  };
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const [x, y] = cellXY(c, r);
    const oi = oreIndex(c, r);
    const mined = oi >= 0 && f >= B.ores[oi];
    if (mined) {
      cells.push(<g key={`${c}${r}`}><rect x={x} y={y} width={CELL} height={CELL} fill="#0b0b10" stroke={LINE} strokeWidth={9} /><rect x={x + 30} y={y + 30} width={CELL - 60} height={CELL - 60} fill="#15151c" /></g>);
      continue;
    }
    const ore = oi >= 0 || isFail(c, r) || OREISH.slice(0, 6).some((o) => o[0] === c && o[1] === r && (c + r) % 2 === 0 && false);
    cells.push(
      <g key={`${c}${r}`}>
        <image href={ore ? IMG.ore : IMG.stone} x={x} y={y} width={CELL} height={CELL} style={PX} />
        {!ore && <rect x={x} y={y} width={CELL} height={CELL} fill="#000" opacity={0.28} />}
        <rect x={x} y={y} width={CELL} height={CELL} fill="none" stroke={LINE} strokeWidth={9} />
        {oi >= 0 && crack(x, y, B.ores[oi], `ck${c}${r}`)}
        {isFail(c, r) && crack(x, y, B.pickBreak, `ckf`)}
        {isFail(c, r) && f >= B.pickBreak && <image href={IMG.breaks[4]} x={x} y={y} width={CELL} height={CELL} style={PX} />}
      </g>
    );
  }
  return (
    <g transform={`translate(${SCX} ${SCY}) scale(${z}) translate(${-SCX} ${-SCY})`}>
      <rect x={-300} y={PANEL_TOP - 300} width={W + 600} height={H + 600} fill="#101016" />
      {Array.from({ length: 5 }, (_, r) => Array.from({ length: 5 }, (_, c) => {
        if (c >= 1 && c <= 3 && r >= 1 && r <= 3) return null;
        const x = SCX - CELL * 2.5 + c * CELL, y = SCY - CELL * 2.5 + r * CELL;
        return <g key={`o${r}${c}`}><image href={IMG.stone} x={x} y={y} width={CELL} height={CELL} style={PX} /><rect x={x} y={y} width={CELL} height={CELL} fill="#000" opacity={0.6} /><rect x={x} y={y} width={CELL} height={CELL} fill="none" stroke={LINE} strokeWidth={9} /></g>;
      }))}
      {cells}
    </g>
  );
};

/* ---------------------------------- effects ---------------------------------- */

const Debris: React.FC<{ f: number }> = ({ f }) => {
  const evs: { t: number; x: number; y: number; c: string[] }[] = [
    { t: B.hit, x: SCX, y: SCY, c: ["#8d8d96", "#6c6c76", "#9d9da6"] },
    ...B.ores.map((o, i) => { const [cx, cy] = cellXY(B.oreCells[i][0], B.oreCells[i][1]); return { t: o, x: cx + CELL / 2, y: cy + CELL / 2, c: ["#35e6dc", "#8d8d96", "#6c6c76"] }; }),
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

const DIAMOND_ROWS = ["..DDDDD..", ".DwwCCCD.", "DwCCCCCCD", "DCCCCCCCD", ".DCCCCCD.", "..DCCCD..", "...DCD...", "....D...."];
const DIAMOND_COL = { D: "#0e6f7a", w: "#e8fffd", C: "#3df0e6" };

/* the HUD: big and high, so it survives a phone's Shorts buttons */
const SLOT = 108;
const HB_X = (W - SLOT * 9) / 2;
const HB_Y = 1500;
const slotCenter = (i: number): [number, number] => [HB_X + i * SLOT + SLOT / 2, HB_Y + SLOT / 2];

const Flyers: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {B.ores.map((o, i) => {
      const t = (f - o) / 16;
      if (t < 0 || t > 1) return null;
      const [cx0, cy0] = cellXY(B.oreCells[i][0], B.oreCells[i][1]);
      const [sx, sy] = slotCenter(1);
      const u = t * t;
      return <Pixels key={i} rows={DIAMOND_ROWS} colors={DIAMOND_COL} px={13} x={lerp(cx0 + CELL / 2, sx, u)} y={lerp(cy0 + CELL / 2, sy, u) - Math.sin(t * Math.PI) * 160} />;
    })}
  </g>
);

const flashAt = (f: number) => {
  const t = f - B.reveal;
  if (t >= 0 && t < 3) return 1;
  if (t >= 3 && t < 20) return 0.7 * (1 - (t - 3) / 17);
  return 0;
};

/* ---------------------------------- the pickaxe ---------------------------------- */

// the sprite is 360 px; the handle's end and the head's point (after the mirror that puts it in the right hand)
const HANDLE: [number, number] = [295, 325];
const POINT: [number, number] = [75, 105];
const PS = 2.4;
const rot = (v: [number, number], deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
};
const poseFor = (tip: [number, number], deg: number, s: number) => {
  const v = rot([(POINT[0] - HANDLE[0]) * s, (POINT[1] - HANDLE[1]) * s], deg);
  return { x: tip[0] - v[0], y: tip[1] - v[1], r: deg, s };
};

const pickTarget = (f: number): [number, number] => {
  const cur = B.ores.findIndex((o) => f >= o - 9 && f <= o + 10);
  if (cur >= 0) { const [x, y] = cellXY(B.oreCells[cur][0], B.oreCells[cur][1]); return [x + CELL / 2, y + CELL / 2]; }
  if (f >= B.pickBreak - 9 && f <= B.pickBreak + 4) { const [x, y] = cellXY(B.failCell[0], B.failCell[1]); return [x + CELL / 2, y + CELL / 2]; }
  return [SCX, SCY];
};

const Pickaxe: React.FC<{ f: number }> = ({ f }) => {
  if (f >= B.pickBreak) return null;
  const { since, toNext } = strikeState(f);
  // contact lands 3 frames before the block goes, so the break itself is on the beat
  let k = 0;
  if (toNext <= 9 && toNext >= 3) k = clamp01((9 - toNext) / 6);
  else if (toNext < 3) k = 2;
  if (since >= 0 && since < 10) k = Math.max(k, 2 - ease(since, 0, 10) * 2);
  const tip = pickTarget(f);
  const walking = f >= B.walk[0] && f < B.reveal;
  const sway = walking ? Math.sin((f - B.walk[0]) / 14.6 * Math.PI) * 18 : 0;
  const idle = poseFor([800, 1300 + sway], 12, 2.1);
  const wind = poseFor([tip[0] + 80, tip[1] + 130], 24, 2.2);
  const hit = poseFor(tip, 0, PS);
  const mix = (a: typeof idle, b: typeof idle, t: number) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), r: lerp(a.r, b.r, t), s: lerp(a.s, b.s, t) });
  const pose = k <= 1 ? mix(idle, wind, k) : mix(wind, hit, k - 1);
  return (
    <g transform={`translate(${pose.x} ${pose.y}) rotate(${pose.r}) scale(${pose.s}) translate(${-HANDLE[0]} ${-HANDLE[1]})`}>
      <image href={IMG.pick} x={0} y={0} width={360} height={360} style={PX} transform="translate(360 0) scale(-1 1)" />
    </g>
  );
};

const Shards: React.FC<{ f: number }> = ({ f }) => {
  const t = f - B.pickBreak;
  if (t < 0 || t > 22) return null;
  const [cx, cy] = cellXY(B.failCell[0], B.failCell[1]);
  const tx = cx + CELL / 2, ty = cy + CELL / 2;
  return (
    <g>
      {Array.from({ length: 22 }, (_, i) => {
        const a = random(`sh${i}`) * Math.PI * 2, v = 10 + random(`sv${i}`) * 28;
        const c = ["#d8d8d8", "#8b8b8b", "#8b5a34", "#4a2f14"][i % 4];
        const x = tx + Math.cos(a) * v * t, y = ty + Math.sin(a) * v * t + t * t * 3;
        return <rect key={i} x={x} y={y} width={34 - t * 0.7} height={20} fill={c} stroke={LINE} strokeWidth={4} transform={`rotate(${t * 22 + i * 40} ${x} ${y})`} opacity={1 - t / 24} />;
      })}
    </g>
  );
};

/* ---------------------------------- assembly ---------------------------------- */

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const [sx, sy] = shake(f);
  const wall = f >= B.reveal;
  return (
    <g transform={`translate(${sx} ${sy})`}>
      {wall ? <Wall f={f} /> : <Tunnel f={f} />}
      <Debris f={f} />
      <Flyers f={f} />
      <defs>
        <radialGradient id="dkVig" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.25" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={wall ? 0.35 : 0.85} />
        </radialGradient>
      </defs>
      <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="url(#dkVig)" />
      {!wall && <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#ff9a30" opacity={0.05 + 0.03 * Math.sin(f * 0.9)} />}
      <Shards f={f} />
      <Pickaxe f={f} />
      {f >= B.pickBreak && <BareArm f={f} />}
    </g>
  );
};

const BareArm: React.FC<{ f: number }> = ({ f }) => {
  const t = f - B.pickBreak;
  const k = ease(t, 0, 10) * 0.3;
  const x = lerp(960, 930, k), y = lerp(2120, 2040, k) + Math.sin(f * 0.1) * 5;
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
  const broke = f >= B.pickBreak;
  const used = HITS.filter((s) => f >= s).length;
  const dur = Math.max(0.05, 1 - used * 0.22);
  const [dx, dy] = slotCenter(1);
  const [px, py] = slotCenter(0);
  const heartsX = HB_X;
  return (
    <g>
      {/* hearts, scaled up to sit exactly over the hotbar's width */}
      <g transform={`translate(${heartsX} 1400) scale(1.62) translate(${-heartsX} -1400)`}>
        <Hearts x={heartsX} y={1400} hp={20} frame={f} />
      </g>
      <rect x={HB_X} y={HB_Y} width={SLOT * 9} height={SLOT} fill="#141414" opacity={0.6} />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={HB_X + i * SLOT + 4} y={HB_Y + 4} width={SLOT - 8} height={SLOT - 8} fill="none" stroke="#8b8b8b" strokeWidth={5} />)}
      {!broke && <image href={IMG.pick} x={px - 46} y={py - 46} width={92} height={92} style={PX} />}
      {!broke && f > B.hit - 4 && (
        <g>
          <rect x={px - 38} y={HB_Y + 84} width={76} height={9} fill="#000" />
          <rect x={px - 38} y={HB_Y + 84} width={76 * dur} height={9} fill={dur > 0.5 ? "#4cd04c" : dur > 0.25 ? "#e0c030" : "#e03030"} />
        </g>
      )}
      <rect x={HB_X - 6} y={HB_Y - 6} width={SLOT + 12} height={SLOT + 12} fill="none" stroke="#ffffff" strokeWidth={10} />
      {mined > 0 && (
        <g>
          <Pixels rows={DIAMOND_ROWS} colors={DIAMOND_COL} px={8} x={dx} y={dy - 4} />
          <text x={dx + 44} y={dy + 44} textAnchor="end" fontFamily={MONO} fontSize={38} fill="#fff" stroke="#000" strokeWidth={6} paintOrder="stroke">{mined}</text>
        </g>
      )}
      {flashAt(f) > 0 && <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#e8fffd" opacity={flashAt(f)} />}
    </g>
  );
};

export const DiamondShort: React.FC<{ audio?: string | null; drawn?: boolean }> = ({ audio = null, drawn = true }) => {
  usePreload([IMG.pick, IMG.ore, IMG.stone, ...IMG.breaks]);
  const f = useCurrentFrame();
  return <PovFrame audio={audio} drawn={drawn} caption={DIAMOND_CAPTION} panelId="dmPanel" scene={<Scene f={f} />} hud={<Hud f={f} />} />;
};

export const DiamondThumb: React.FC = () => {
  usePreload([IMG.pick, IMG.ore, IMG.stone, ...IMG.breaks]);
  const f = B.ores[1] + 10;
  return <PovFrame drawn={false} caption={DIAMOND_CAPTION} panelId="dmPanelT" scene={<Scene f={f} />} hud={<Hud f={f} />} />;
};
