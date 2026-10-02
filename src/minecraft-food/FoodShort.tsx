import React from "react";
import { AbsoluteFill, Audio, random, staticFile, useCurrentFrame } from "remotion";
import { H, PANEL_TOP, W } from "../minecraft/beats";
import { ease, FaceKind, lerpPose, limb, Pose, POSE, Pt } from "../minecraft/figure";
import { loadMinecraftFonts } from "../minecraft/fonts";
import { HandDrawn } from "../minecraft/handdrawn";
import { Oofy, OofyTint, OOFY_TINT } from "../minecraft/oofy";
import { Pixels, Puff } from "../minecraft/pixels";
import B from "./beats.json";

/**
 * "Nobody: / Minecraft players:" — 12.5 seconds, starring Oofy.
 *
 * A kitchen counter with a crafting grid on the cutting board. Oofy cooks by
 * Minecraft's rules: three wheat in a row is bread; a carrot ringed by eight
 * gold nuggets is a golden carrot (and eating it gives night vision); nine
 * ingredients in the right pattern are a whole cake, eaten in seven clicks.
 * Then, last, a raw chicken.
 */

export const FOOD_FRAMES = B.frames;
export const FOOD_CAPTION = ["Nobody:", "Minecraft players:"];

const LINE = "#2a1b3d";
const MONO = "Monocraft, monospace";
const OOF: OofyTint = { ...OOFY_TINT.normal, skin: "#ffffff" };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const smooth = (t: number) => t * t * (3 - 2 * t);

/* ------------------------------ the pixel food ------------------------------ */

type Sprite = { rows: string[]; colors: Record<string, string> };
const S: Record<string, Sprite> = {
  wheat: { rows: ["...Y....", "..YyY...", ".Y.Y.Y..", "..YyY...", ".Y.y.Y..", "..YyY...", "...y....", "...g....", "...g....", "...g...."], colors: { Y: "#e7c548", y: "#b88b2c", g: "#7a9a38" } },
  bread: { rows: ["..bbbbbbbb..", ".bBBBBBBBBb.", "bBBBBBBBBBBb", "bBBBBBBBBBBb", ".bBBBBBBBBb.", "..bbbbbbbb.."], colors: { b: "#8a4f22", B: "#d4994d" } },
  carrot: { rows: [".......gg", "......gGg", ".....OOo.", "....OOO..", "...OOo...", "..OOO....", ".OOo.....", "OOo......", "Oo......."], colors: { O: "#f08a1c", o: "#c96a0c", g: "#4aa03a", G: "#2f7a28" } },
  gcarrot: { rows: [".......gg", "......gGg", ".....YYy.", "....YYY..", "...YYy...", "..YYY....", ".YYy.....", "YYy......", "Yy......."], colors: { Y: "#ffd84a", y: "#c9a028", g: "#4aa03a", G: "#2f7a28" } },
  nugget: { rows: ["..Y..", ".YYy.", "YYYYy", ".yyy."], colors: { Y: "#ffd84a", y: "#c9a028" } },
  milk: { rows: ["..bbbb..", "b.wwww.b", ".bwwwwb.", "bbbbbbbb", "bBBBBBBb", ".BBBBBB.", ".BBBBBB.", ".BBBBBB.", "..bbbb.."], colors: { b: "#4a4a55", B: "#aeb2bd", w: "#ffffff" } },
  egg: { rows: ["..ee..", ".eEEe.", "eEEEEe", "eEEEEe", "eEEEEe", ".eEEe.", "..ee.."], colors: { E: "#f0dcb8", e: "#a58a5a" } },
  sugar: { rows: [".wwww.", "wWWWWw", "wWWWWw", "wWWWWw", "wWWWWw", ".wwww."], colors: { W: "#ffffff", w: "#cfd8e0" } },
  chicken: { rows: ["..pppp....", ".pPPPPp...", "pPPPPPPp..", "pPPPPPPp..", ".pPPPPp...", "..pppp.bb.", "......bBb.", ".......bb."], colors: { P: "#eaa3a3", p: "#c77777", B: "#f1e8d4", b: "#b9ad92" } },
  flesh: { rows: ["..gGGg...", ".GgBBGg..", "GBBgGBBg.", "gGBBBgBG.", ".GgBGgG..", "..gGg...."], colors: { G: "#6f8a3a", g: "#4f6a2a", B: "#8a4a3a" } },
};
const cakeRows = (slices: number): string[] => {
  const full = ["wwwwwwwwwwwwww", "wwrwwwwwwwwrww", "wwwwwwrwwwwwww", "cccccccccccccc", "BBBBBBBBBBBBBB", "BBBBBBBBBBBBBB", "cccccccccccccc", "BBBBBBBBBBBBBB", "BBBBBBBBBBBBBB"];
  const cut = Math.max(0, 14 - slices * 2);
  return full.map((r) => r.slice(0, cut).padEnd(14, ".")).filter((r) => r.replace(/\./g, "").length > 0);
};
const CAKE_COLORS = { w: "#f6f0e6", r: "#d3212b", c: "#fffaf0", B: "#6e3b1f" };

const Spr: React.FC<{ n: keyof typeof S; x: number; y: number; px?: number; rot?: number; o?: number }> = ({ n, x, y, px = 9, rot = 0, o = 1 }) => <Pixels rows={S[n].rows} colors={S[n].colors} px={px} x={x} y={y} rotate={rot} opacity={o} />;

/* ---------------------------------- the grid ---------------------------------- */

const COLS = [380, 540, 700], ROWS = [1335, 1475, 1615];
const cell = (c: number, r: number): Pt => [COLS[c], ROWS[r]];
const BOARD = { x: 280, y: 1255, w: 520, h: 440 };
const SURFACE_Y = 1160;

/* each meal's contents, as (column, row, sprite) in the order they are placed */
const BREAD: [number, number, keyof typeof S][] = [[0, 1, "wheat"], [1, 1, "wheat"], [2, 1, "wheat"]];
const RING: [number, number][] = [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2]];
const CAKE: [number, number, keyof typeof S][] = [[0, 0, "milk"], [1, 0, "milk"], [2, 0, "milk"], [0, 1, "sugar"], [1, 1, "egg"], [2, 1, "sugar"], [0, 2, "wheat"], [1, 2, "wheat"], [2, 2, "wheat"]];

const placedCount = (f: number, list: number[]) => list.filter((t) => f >= t).length;

/** a thing "lands" on the board: drops from above with a small bounce */
const dropIn = (f: number, t: number): { dy: number; sq: number } => {
  const k = f - t;
  if (k < 0) return { dy: -200, sq: 1 };
  if (k < 4) return { dy: -90 * (1 - k / 4) ** 2, sq: 1 };
  if (k < 8) return { dy: 0, sq: 1 - 0.14 * Math.sin(((k - 4) / 4) * Math.PI) };
  return { dy: 0, sq: 1 };
};

/* ------------------------------- the scene state ------------------------------- */

type Meal = "bread" | "carrot" | "cake" | "chicken";
const mealAt = (f: number): Meal => (f < 100 ? "bread" : f < 192 ? "carrot" : f < 300 ? "cake" : "chicken");

/** the crafting flash: a white burst, a ring of sparkle, and the result popping in */
const Burst: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const k = f - t;
  if (k < 0 || k > 14) return null;
  return (
    <g>
      <circle cx={540} cy={1475} r={90 + k * 26} fill="#fff6c8" opacity={0.85 * (1 - k / 14)} />
      <circle cx={540} cy={1475} r={60 + k * 40} fill="none" stroke="#ffffff" strokeWidth={14 - k} opacity={1 - k / 14} />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return <rect key={i} x={540 + Math.cos(a) * (40 + k * 34) - 9} y={1475 + Math.sin(a) * (40 + k * 28) - 9} width={18} height={18} fill={i % 2 ? "#ffe08a" : "#ffffff"} opacity={1 - k / 14} />;
      })}
    </g>
  );
};

const Wall: React.FC = () => (
  <g>
    {/* the kitchen behind: tiles and upper cabinets */}
    <rect x={0} y={PANEL_TOP} width={W} height={SURFACE_Y - PANEL_TOP} fill="#e9e4da" />
    {Array.from({ length: 8 }, (_, r) => Array.from({ length: 9 }, (_, c) => <rect key={`${r}-${c}`} x={c * 125 - ((r % 2) * 62)} y={770 + r * 66} width={122} height={63} fill={(r + c) % 2 ? "#dfe6e2" : "#e8eeea"} stroke="#c3ccc6" strokeWidth={3} />))}
    {[[20, 300], [390, 300], [760, 300]].map(([x, w], i) => (
      <g key={i}>
        <rect x={x} y={420} width={w} height={330} fill="#f6f1e6" stroke={LINE} strokeWidth={8} />
        <rect x={x + 22} y={444} width={w - 44} height={282} fill="#faf6ed" stroke="#d6cfc0" strokeWidth={4} />
        <rect x={x + w - 54} y={650} width={16} height={60} rx={6} fill="#b9a98a" stroke={LINE} strokeWidth={4} />
      </g>
    ))}
    <rect x={0} y={740} width={W} height={34} fill="#cdbf9c" stroke={LINE} strokeWidth={6} />
    {/* a window and a plant, so the wall is not empty */}
    <rect x={800} y={800} width={190} height={180} fill="#9fd6ff" stroke={LINE} strokeWidth={8} />
    <path d="M895,800 V980 M800,890 H990" stroke={LINE} strokeWidth={8} />
  </g>
);

const Counter: React.FC = () => (
  <g>
    {/* the counter top */}
    <rect x={0} y={SURFACE_Y} width={W} height={H - SURFACE_Y} fill="#b98a58" stroke={LINE} strokeWidth={8} />
    <rect x={0} y={SURFACE_Y} width={W} height={26} fill="#d4a972" />
    {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${i * 160},${SURFACE_Y + 40} q80,-14 160,0`} stroke="#a37845" strokeWidth={4} fill="none" opacity={0.6} />)}
    {/* the cutting board, which is a crafting grid */}
    <rect x={BOARD.x} y={BOARD.y} width={BOARD.w} height={BOARD.h} rx={14} fill="#8a5a2e" stroke={LINE} strokeWidth={9} />
    <rect x={BOARD.x + 12} y={BOARD.y + 12} width={BOARD.w - 24} height={BOARD.h - 24} rx={8} fill="#a8733c" />
    {[1, 2].map((i) => <path key={`v${i}`} d={`M${BOARD.x + (BOARD.w / 3) * i},${BOARD.y + 12} V${BOARD.y + BOARD.h - 12}`} stroke="#6b4421" strokeWidth={6} />)}
    {[1, 2].map((i) => <path key={`h${i}`} d={`M${BOARD.x + 12},${BOARD.y + (BOARD.h / 3) * i} H${BOARD.x + BOARD.w - 12}`} stroke="#6b4421" strokeWidth={6} />)}
  </g>
);

/* ---------------------------------- Oofy ---------------------------------- */

const NECK: Pt = [540, 1010];
const OS = 1.3;

type Act = { pose: Pose; face: FaceKind; hand?: { sprite: keyof typeof S | "cake"; slices?: number; o?: number } };

const REST = (): Pose => ({ ...POSE.stand, armL: limb(-90, 120, -60, 210), armR: limb(90, 120, 60, 210) });

const handTo = (c: number, r: number, lift = 0): Pt => [(COLS[c] - NECK[0]) / OS, (ROWS[r] - 40 - lift - NECK[1]) / OS];
const armTo = (side: "L" | "R", p: Pt): [Pt, Pt] => {
  const sh: Pt = side === "L" ? [-46, 18] : [46, 18];
  return [[(sh[0] + p[0]) / 2 + (side === "L" ? -34 : 34), (sh[1] + p[1]) / 2], p];
};

const eatPose = (f: number, chomps: number[], pick: [number, number] | null, item: keyof typeof S | "cake", slices = 0): { pose: Pose; mouth: boolean; hand: Act["hand"] } => {
  // up to the mouth, a bite every few frames, then lowered
  const mouth: Pt = [28, -22];
  const rest: Pt = [60, 210];
  const start = pick ? pick[0] : chomps[0] - 14;
  const up = pick ? ease(f, pick[0], pick[1]) : ease(f, chomps[0] - 12, chomps[0] - 2);
  const down = ease(f, chomps[chomps.length - 1] + 6, chomps[chomps.length - 1] + 16);
  const k = clamp01(up - down);
  void start;
  const hp: Pt = [lerp(rest[0], mouth[0], k), lerp(rest[1], mouth[1], k)];
  const bite = chomps.some((c) => f >= c - 2 && f < c + 3);
  const arm = armTo("R", hp);
  return { pose: { ...REST(), armR: limb(arm[0][0], arm[0][1], arm[1][0], arm[1][1]) }, mouth: bite, hand: k > 0.05 ? { sprite: item, slices } : undefined };
};

const act = (f: number): Act => {
  const m = mealAt(f);
  const idle: Act = { pose: REST(), face: "sly" };
  if (m === "bread") {
    const b = B.bread;
    // placing: the left hand sets each wheat
    for (let i = 0; i < 3; i++) {
      const t = b.place[i];
      if (f >= t - 4 && f < t + 4) { const a = armTo("L", handTo(BREAD[i][0], BREAD[i][1], f < t ? 60 : 0)); return { pose: { ...REST(), armL: limb(a[0][0], a[0][1], a[1][0], a[1][1]) }, face: "plain" }; }
    }
    if (f >= b.craft - 2 && f < b.craft + 12) return { pose: { ...REST(), armL: limb(-130, 20, -190, -60), armR: limb(130, 20, 190, -60) }, face: "surprised" };
    if (f >= b.pick[0]) { const e = eatPose(f, b.chomps, b.pick as [number, number], "bread"); return { pose: e.pose, face: e.mouth ? "joy" : "happy", hand: e.hand }; }
    return idle;
  }
  if (m === "carrot") {
    const c = B.carrot;
    for (let i = 0; i < c.place.length; i++) {
      const t = c.place[i];
      if (f >= t - 3 && f < t + 3) { const cc = i === 0 ? [1, 1] : RING[i - 1]; const a = armTo(i % 2 ? "L" : "R", handTo(cc[0], cc[1], f < t ? 50 : 0)); return { pose: { ...REST(), [i % 2 ? "armL" : "armR"]: limb(a[0][0], a[0][1], a[1][0], a[1][1]) }, face: "plain" }; }
    }
    if (f >= c.craft - 2 && f < c.craft + 12) return { pose: { ...REST(), armL: limb(-130, 20, -190, -60), armR: limb(130, 20, 190, -60) }, face: "surprised" };
    if (f >= c.pick[0]) { const e = eatPose(f, c.chomps, c.pick as [number, number], "gcarrot"); return { pose: e.pose, face: f >= c.nightVision ? "surprised" : e.mouth ? "joy" : "happy", hand: e.hand }; }
    return idle;
  }
  if (m === "cake") {
    const c = B.cake;
    for (let i = 0; i < 9; i++) {
      const t = c.place[i];
      if (f >= t - 2 && f < t + 3) { const a = armTo(i % 2 ? "L" : "R", handTo(CAKE[i][0], CAKE[i][1], f < t ? 50 : 0)); return { pose: { ...REST(), [i % 2 ? "armL" : "armR"]: limb(a[0][0], a[0][1], a[1][0], a[1][1]) }, face: "plain" }; }
    }
    if (f >= c.craft - 2 && f < c.craft + 14) return { pose: { ...REST(), armL: limb(-140, -10, -200, -100), armR: limb(140, -10, 200, -100) }, face: "scream" };
    if (f >= c.chomps[0] - 6) {
      // right-click, right-click, right-click: his hand does not leave the cake
      const bite = c.chomps.some((t) => f >= t - 2 && f < t + 3);
      const a = armTo("R", [60, 120]);
      return { pose: { ...REST(), armR: limb(a[0][0], a[0][1], a[1][0], a[1][1]) }, face: bite ? "joy" : "happy" };
    }
    return idle;
  }
  const ch = B.chicken;
  if (f >= ch.place - 3 && f < ch.place + 4) { const a = armTo("R", handTo(1, 1, f < ch.place ? 50 : 0)); return { pose: { ...REST(), armR: limb(a[0][0], a[0][1], a[1][0], a[1][1]) }, face: "plain" }; }
  if (f >= ch.pick[0] && f < ch.thumbs) { const e = eatPose(f, ch.chomps, ch.pick as [number, number], "chicken"); return { pose: e.pose, face: f >= ch.sick ? "worried" : e.mouth ? "joy" : "happy", hand: e.hand }; }
  if (f >= ch.thumbs) return { pose: { ...REST(), armR: limb(120, 30, 190, -40) }, face: "joy" };
  return idle;
};

/** the green of food poisoning, and the glow of night vision */
const tintAt = (f: number): OofyTint => {
  if (f >= B.chicken.sick) { const k = clamp01((f - B.chicken.sick) / 12); return { ...OOF, skin: `rgb(${Math.round(lerp(255, 170, k))},${Math.round(lerp(255, 228, k))},${Math.round(lerp(255, 150, k))})` }; }
  return OOF;
};

const Cheeks: React.FC<{ f: number }> = ({ f }) => {
  // after the cake his cheeks stay puffed, a little less each bite he swallows
  const c = B.cake;
  const k = f >= c.chomps[2] ? clamp01((f - c.chomps[2]) / 24) * (f < B.chicken.place ? 1 : Math.max(0, 1 - (f - B.chicken.place) / 20)) : 0;
  if (k <= 0) return null;
  const hy = NECK[1] - 96;
  return (
    <g>
      <ellipse cx={NECK[0] - 78} cy={hy + 44} rx={38 * k + 4} ry={30 * k + 4} fill="#ffffff" stroke={LINE} strokeWidth={8} />
      <ellipse cx={NECK[0] + 78} cy={hy + 44} rx={38 * k + 4} ry={30 * k + 4} fill="#ffffff" stroke={LINE} strokeWidth={8} />
    </g>
  );
};

const NightGlow: React.FC<{ f: number }> = ({ f }) => {
  if (f < B.carrot.nightVision || f >= B.cake.place[0]) return null;
  const k = ease(f, B.carrot.nightVision, B.carrot.nightVision + 8) * (1 - ease(f, B.cake.place[0] - 8, B.cake.place[0]));
  const hy = NECK[1] - 96;
  return (
    <g>
      <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#bfe8ff" opacity={0.18 * k} />
      {[-33, 33].map((dx) => <circle key={dx} cx={NECK[0] + dx * 1.0} cy={hy - 12} r={34 * k} fill="#ffffff" opacity={0.9 * k} />)}
      {[-33, 33].map((dx) => <circle key={`g${dx}`} cx={NECK[0] + dx} cy={hy - 12} r={70 * k} fill="#9fe0ff" opacity={0.28 * k} />)}
    </g>
  );
};

/* -------------------------------- overlays: HUD -------------------------------- */

const Drumstick: React.FC<{ x: number; y: number; fill: "full" | "half" | "empty"; green?: boolean }> = ({ x, y, fill, green }) => {
  const body = green ? "#7fae3a" : "#c2651e", dark = green ? "#4f7a22" : "#7a3a10";
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={4} y={14} width={34} height={16} fill="none" stroke="#1a1a22" strokeWidth={5} opacity={fill === "empty" ? 1 : 0} />
      {fill !== "empty" && (
        <>
          <rect x={10} y={0} width={26} height={24} fill={body} stroke="#1a1a22" strokeWidth={5} clipPath="none" />
          <rect x={14} y={4} width={9} height={9} fill="#f0a060" />
          <rect x={0} y={20} width={18} height={14} fill="#f1e8d4" stroke="#1a1a22" strokeWidth={4} />
          {fill === "half" && <rect x={23} y={-4} width={20} height={34} fill="#2a2a3a" opacity={0.85} />}
        </>
      )}
      <rect x={10} y={0} width={26} height={24} fill="none" stroke="#1a1a22" strokeWidth={5} opacity={fill === "empty" ? 0.6 : 0} />
      <rect x={0} y={20} width={18} height={14} fill="none" stroke={dark} strokeWidth={0} />
    </g>
  );
};

const hungerAt = (f: number) => {
  // drumsticks out of 10, each bite a little more; the raw chicken is the reason the last ones go green
  let h = 4;
  const add = (chomps: number[], amount: number) => chomps.forEach((c, i) => { h += clamp01((f - c) / 4) * (amount / chomps.length); });
  add(B.bread.chomps, 3);
  add(B.carrot.chomps, 3);
  return Math.min(10, h);
};

const Hud: React.FC<{ f: number }> = ({ f }) => {
  const h = hungerAt(f);
  const sick = f >= B.chicken.hunger;
  const stuffed = f >= B.cake.chomps[0];
  return (
    <g>
      {/* the hunger bar, over the hotbar on the right */}
      {Array.from({ length: 10 }, (_, i) => {
        const slot = 9 - i;
        const fill = h >= slot + 1 ? "full" : h >= slot + 0.5 ? "half" : "empty";
        const jig = sick ? Math.sin(f * 1.3 + i) * 3 : 0;
        return <Drumstick key={i} x={560 + i * 46} y={1738 + jig} fill={sick ? "full" : fill} green={sick} />;
      })}
      <rect x={140} y={1806} width={800} height={86} fill="#141414" opacity={0.55} />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={146 + i * 88} y={1812} width={76} height={74} fill="none" stroke="#8b8b8b" strokeWidth={4} />)}
      <rect x={140} y={1806} width={88} height={86} fill="none" stroke="#ffffff" strokeWidth={8} />
      <Spr n={mealAt(f) === "bread" ? "wheat" : mealAt(f) === "carrot" ? "carrot" : mealAt(f) === "cake" ? "egg" : "chicken"} x={184} y={1849} px={5} />
      {stuffed && f < B.chicken.place && <text x={146} y={1700} fontFamily={MONO} fontSize={0} fill="#fff" />}
    </g>
  );
};

const Effect: React.FC<{ x: number; y: number; label: string; time: string; color: string; icon: React.ReactNode; o: number }> = ({ x, y, label, time, color, icon, o }) => (
  <g opacity={o} transform={`translate(${x} ${y})`}>
    <rect width={330} height={92} fill="#000" opacity={0.6} />
    <rect x={10} y={10} width={72} height={72} fill={color} stroke="#fff" strokeWidth={4} />
    <g transform="translate(46 46)">{icon}</g>
    <text x={96} y={42} fontFamily={MONO} fontSize={26} fill="#ffffff">{label}</text>
    <text x={96} y={76} fontFamily={MONO} fontSize={26} fill="#c7c7d6">{time}</text>
  </g>
);

const Effects: React.FC<{ f: number }> = ({ f }) => {
  const nv = f >= B.carrot.nightVision && f < B.cake.place[0] + 20 ? clamp01((f - B.carrot.nightVision) / 5) * (1 - clamp01((f - (B.cake.place[0] + 8)) / 12)) : 0;
  const hu = f >= B.chicken.hunger ? clamp01((f - B.chicken.hunger) / 5) : 0;
  return (
    <g>
      {nv > 0 && <Effect x={720} y={PANEL_TOP + 24} label="Night Vision" time={f < B.carrot.nightVision + 100 ? "7:59" : "7:54"} color="#2a5fb0" o={nv} icon={<g><ellipse rx={26} ry={16} fill="#fff" /><circle r={9} fill="#1a1a22" /></g>} />}
      {hu > 0 && <Effect x={720} y={PANEL_TOP + 24 + (nv > 0 ? 104 : 0)} label="Hunger" time="0:30" color="#4f7a22" o={hu} icon={<g><rect x={-14} y={-18} width={28} height={26} fill="#7fae3a" stroke="#1a1a22" strokeWidth={4} /><rect x={-24} y={4} width={18} height={14} fill="#f1e8d4" stroke="#1a1a22" strokeWidth={3} /></g>} />}
    </g>
  );
};

/* ------------------------------ items on the board ------------------------------ */

const BoardItems: React.FC<{ f: number }> = ({ f }) => {
  const els: React.ReactNode[] = [];
  const b = B.bread, c = B.carrot, k = B.cake, ch = B.chicken;
  const inBread = f < b.craft;
  const gone = (t: number) => f >= t;
  // bread
  if (f >= b.place[0] && f < b.pick[1] + 6) {
    if (inBread) BREAD.forEach(([cc, rr, n], i) => { if (f >= b.place[i]) { const d = dropIn(f, b.place[i]); const p = cell(cc, rr); els.push(<g key={`b${i}`} transform={`translate(0 ${d.dy})`}><Spr n={n} x={p[0]} y={p[1]} px={9} /></g>); } });
    else if (f < b.pick[0] + 6) { const p = cell(1, 1); const d = dropIn(f, b.craft + 2); els.push(<Spr key="bread" n="bread" x={p[0]} y={p[1] + d.dy} px={13} />); }
  }
  // golden carrot
  if (f >= c.place[0] && f < c.pick[1] + 6) {
    if (f < c.craft) {
      const d0 = dropIn(f, c.place[0]); const p0 = cell(1, 1);
      els.push(<g key="c0" transform={`translate(0 ${d0.dy})`}><Spr n="carrot" x={p0[0]} y={p0[1]} px={9} /></g>);
      RING.forEach(([cc, rr], i) => { const t = c.place[i + 1]; if (f >= t) { const d = dropIn(f, t); const p = cell(cc, rr); els.push(<g key={`n${i}`} transform={`translate(0 ${d.dy})`}><Spr n="nugget" x={p[0]} y={p[1]} px={12} /></g>); } });
    } else if (f < c.pick[0] + 6) { const p = cell(1, 1); const d = dropIn(f, c.craft + 2); els.push(<Spr key="gc" n="gcarrot" x={p[0]} y={p[1] + d.dy} px={14} />); }
  }
  // cake
  if (f >= k.place[0]) {
    if (f < k.craft) CAKE.forEach(([cc, rr, n], i) => { if (f >= k.place[i]) { const d = dropIn(f, k.place[i]); const p = cell(cc, rr); els.push(<g key={`k${i}`} transform={`translate(0 ${d.dy})`}><Spr n={n} x={p[0]} y={p[1]} px={n === "milk" || n === "wheat" ? 9 : 11} /></g>); } });
    else {
      const eaten = k.chomps.filter((t) => f >= t).length;
      if (eaten < 7) { const d = dropIn(f, k.craft + 2); els.push(<Pixels key="cake" rows={cakeRows(eaten)} colors={CAKE_COLORS} px={30} x={540 - eaten * 14} y={1475 + d.dy} />); }
    }
  }
  // chicken
  if (f >= ch.place && f < ch.pick[0] + 6) { const d = dropIn(f, ch.place); const p = cell(1, 1); els.push(<Spr key="ck" n="chicken" x={p[0]} y={p[1] + d.dy} px={13} />); }
  void gone;
  return <g>{els}</g>;
};

/** the food in his hand on its way to his mouth, shrinking a little with each bite */
const HandFood: React.FC<{ f: number; a: Act }> = ({ f, a }) => {
  if (!a.hand) return null;
  const h = a.hand;
  const m = mealAt(f);
  const chomps = m === "bread" ? B.bread.chomps : m === "carrot" ? B.carrot.chomps : B.chicken.chomps;
  const eaten = chomps.filter((t) => f >= t).length;
  const left = 1 - eaten / (chomps.length + 0.6);
  // where the hand is, computed again from the pose: the right hand
  const hp = a.pose.armR[1];
  const x = NECK[0] + hp[0] * OS + 6, y = NECK[1] + hp[1] * OS - 20;
  const px = (m === "chicken" ? 10 : 11) * Math.max(0.25, left);
  return <Spr n={h.sprite as keyof typeof S} x={x} y={y} px={px} rot={-10} />;
};

const Crumbs: React.FC<{ f: number }> = ({ f }) => {
  const all = [...B.bread.chomps, ...B.carrot.chomps, ...B.cake.chomps, ...B.chicken.chomps];
  return (
    <g>
      {all.map((t) => {
        const k = f - t;
        if (k < 0 || k > 12) return null;
        const col = t < 100 ? "#d4994d" : t < 192 ? "#ffd84a" : t < 300 ? "#fffaf0" : "#eaa3a3";
        return Array.from({ length: 5 }, (_, i) => <rect key={`${t}${i}`} x={NECK[0] + 20 + (i - 2) * 16 * (k / 3 + 1)} y={NECK[1] + 20 + k * 6 + (i % 2) * 8 + 4 * k * k * 0.05} width={9} height={9} fill={col} opacity={1 - k / 12} stroke="#2a1b3d" strokeWidth={2} />);
      })}
    </g>
  );
};

/** the arms below the counter edge: the counter hides the body but his hands are on the board */
const Arms: React.FC<{ a: Act }> = ({ a }) => {
  const arms: { sh: Pt; l: [Pt, Pt] }[] = [{ sh: [-46, 18], l: a.pose.armL as unknown as [Pt, Pt] }, { sh: [46, 18], l: a.pose.armR as unknown as [Pt, Pt] }];
  return (
    <g clipPath="url(#foodBelow)">
      {arms.map(({ sh, l }, i) => {
        const pts = `${NECK[0] + sh[0]},${NECK[1] + sh[1]} ${NECK[0] + l[0][0]},${NECK[1] + l[0][1]} ${NECK[0] + l[1][0]},${NECK[1] + l[1][1]}`;
        return (
          <g key={i}>
            <polyline points={pts} fill="none" stroke={LINE} strokeWidth={46} strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={pts} fill="none" stroke={OOF.hoodie} strokeWidth={32} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={NECK[0] + l[1][0]} cy={NECK[1] + l[1][1]} r={19} fill="#ffffff" stroke={LINE} strokeWidth={7} />
          </g>
        );
      })}
    </g>
  );
};

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const a = act(f);
  const tint = tintAt(f);
  const bob = Math.sin(f * 0.18) * 3;
  const dizzy = f >= B.chicken.sick && f < B.chicken.thumbs ? Math.sin(f * 0.5) * 6 : 0;
  const crafts = [B.bread.craft, B.carrot.craft, B.cake.craft];
  return (
    <g>
      <defs><clipPath id="foodBelow"><rect x={0} y={SURFACE_Y} width={W} height={H - SURFACE_Y} /></clipPath></defs>
      <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#e9e4da" />
      <Wall />
      <g transform={`translate(${dizzy} ${bob})`}>
        <Oofy x={NECK[0]} y={NECK[1]} scale={OS} pose={a.pose} face={a.face} tint={tint} shadow={false} look={[0, 4]} />
        <Cheeks f={f} />
      </g>
      <Counter />
      <BoardItems f={f} />
      <g transform={`translate(${dizzy} ${bob})`}><Arms a={a} /></g>
      <g transform={`translate(${dizzy} ${bob})`}><HandFood f={f} a={a} /></g>
      <Crumbs f={f} />
      {crafts.map((t) => <Burst key={t} f={f} t={t} />)}
      <NightGlow f={f} />
      {/* the green wash of the raw chicken */}
      {f >= B.chicken.sick && <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#6fa83a" opacity={0.22 * clamp01((f - B.chicken.sick) / 14)} />}
      {f >= B.cake.burp && f < B.cake.burp + 18 && Array.from({ length: 5 }, (_, i) => <Puff key={i} x={NECK[0] + 90 + i * 22} y={NECK[1] + 10 - (f - B.cake.burp) * 3 - i * 8} r={22 + i * 5} opacity={1 - (f - B.cake.burp) / 18} />)}
    </g>
  );
};

const CaptionBand: React.FC = () => (
  <div style={{ position: "absolute", left: 0, top: 0, width: W, height: PANEL_TOP, background: "#ffffff" }}>
    <div style={{ position: "absolute", left: 80, top: 111, fontFamily: "Selawik, 'Segoe UI', sans-serif", fontSize: 88, lineHeight: "118px", color: "#000", whiteSpace: "pre" }}>
      {FOOD_CAPTION.join("\n")}
    </div>
  </div>
);

export const FoodShort: React.FC<{ audio?: string | null; drawn?: boolean }> = ({ audio = null, drawn = true }) => {
  loadMinecraftFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#e9e4da" }}>
      {audio && <Audio src={staticFile(audio)} />}
      <HandDrawn enabled={drawn} hold={1} boilEvery={2} boil={0.7} grain={0}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          <defs><clipPath id="foodPanel"><rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} /></clipPath></defs>
          <g clipPath="url(#foodPanel)"><Scene f={f} /></g>
        </svg>
      </HandDrawn>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <Hud f={f} />
        <Effects f={f} />
      </svg>
      <CaptionBand />
    </AbsoluteFill>
  );
};

export const FoodThumb: React.FC = () => {
  loadMinecraftFonts();
  const f = B.cake.craft + 7;
  return (
    <AbsoluteFill style={{ backgroundColor: "#e9e4da" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs><clipPath id="foodPanelT"><rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} /></clipPath></defs>
        <g clipPath="url(#foodPanelT)"><Scene f={f} /></g>
        <Hud f={f} />
      </svg>
      <CaptionBand />
    </AbsoluteFill>
  );
};
