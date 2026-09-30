import React from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, random, staticFile, useCurrentFrame } from "remotion";
import { H, PANEL_TOP, W } from "../minecraft/beats";
import { ease } from "../minecraft/figure";
import { loadMinecraftFonts } from "../minecraft/fonts";
import { Cow } from "../minecraft/mobs";
import { HandDrawn } from "../minecraft/handdrawn";
import { Puff } from "../minecraft/pixels";
import { Block2D, Palette } from "../minecraft-bridge/blocks";
import B from "./beats.json";

/**
 * "POV: You finally reach grass" — first person the whole way. The character
 * is never on screen: just the view from his eyes.
 *
 * Looking straight up a one-wide shaft, a diamond pickaxe coming up from the
 * bottom corner and cracking the ceiling a block at a time (the walls rush
 * outward as the camera rises through each hole). The strikes land on the
 * timpani of Also sprach Zarathustra and the last block breaks on its big
 * orchestral hit, dropping sunlight and dirt onto the lens. Up into the
 * meadow with the sky in view — and when the camera tilts down there is a
 * creeper standing right there, the whole time, a few steps away. It takes
 * four slow steps closer on the music's steps, swells, and the picture cuts to
 * black a beat before it goes off, on the music's hit.
 */

export const POV_FRAMES = B.frames;
export const POV_CAPTION = ["POV: You finally", "reach grass"];

const LINE = "#141414";
const MONO = "Monocraft, monospace";
const CX = 540, CY = 1158; // centre of the panel
const FOCAL = 720;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

const STONE: Palette = { base: ["#8d8d96", "#7c7c86", "#9d9da6", "#6c6c76"], weights: [0.42, 0.3, 0.18, 0.1] };
const DIRT: Palette = { base: ["#8b5a34", "#7a4b2a", "#9c6a40", "#6a3f22"], weights: [0.42, 0.3, 0.18, 0.1] };

const PICK = staticFile("images/pov/pickaxe.png");
const CREEP = staticFile("images/pov/creeper.png");
const PICK_SIZE: [number, number] = [767, 1021];
const CREEP_SIZE: [number, number] = [800, 1436];

/** hold the render until the pictures are in the cache, so the first frames are not missing them */
const usePreload = (urls: string[]) => {
  const [handle] = React.useState(() => delayRender("loading the pov pictures"));
  React.useEffect(() => {
    Promise.all(urls.map((u) => new Promise<void>((r) => { const im = new window.Image(); im.onload = () => r(); im.onerror = () => r(); im.src = u; }))).then(() => continueRender(handle));
  }, [handle, urls]);
};

/* -------------------------------- the strikes -------------------------------- */

const ALL_STRIKES = B.blocks.flatMap((b) => b.strikes);
const BREAKS = B.blocks.map((b) => b.break);

/** how long ago the nearest strike was, and how far into its windup we are */
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
    if (t >= 0 && t < 10) {
      const big = s === B.final ? 3 : 1;
      x += Math.sin(t * 6.3) * 9 * big * (1 - t / 10);
      y += Math.cos(t * 5.1) * 7 * big * (1 - t / 10);
    }
  }
  return [x, y] as const;
};

/** which block is over his head, and the camera's distance to it (2 when settled, 3 just after a break) */
const blockAt = (f: number) => {
  let n = 0;
  for (let i = 0; i < BREAKS.length - 1; i++) if (f >= BREAKS[i]) n = i + 1;
  const prev = n > 0 ? BREAKS[n - 1] : -99;
  const rise = ease(f, prev + 4, prev + 4 + B.riseLen);
  const zc = n === 0 ? 2 : lerp(3, 2, rise);
  return { n, zc, broken: f >= B.final };
};

/* -------------------------------- cracks -------------------------------- */

/** crack paths on a unit square, revealed stage by stage (like the game's ten break stages) */
const CRACKS: string[] = (() => {
  const out: string[] = [];
  for (let i = 0; i < 9; i++) {
    let x = 0.5 + (random(`ck${i}a`) - 0.5) * 0.3, y = 0.5 + (random(`ck${i}b`) - 0.5) * 0.3;
    const a0 = random(`ck${i}c`) * Math.PI * 2;
    let d = `M${x.toFixed(3)},${y.toFixed(3)}`;
    for (let k = 0; k < 6; k++) {
      const a = a0 + (random(`ck${i}${k}`) - 0.5) * 1.1;
      x += Math.cos(a) * 0.11;
      y += Math.sin(a) * 0.11;
      d += ` L${x.toFixed(3)},${y.toFixed(3)}`;
    }
    out.push(d);
  }
  return out;
})();

const Cracks: React.FC<{ x: number; y: number; s: number; stage: number }> = ({ x, y, s, stage }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke="#0c0a10" strokeWidth={0.014} strokeLinecap="round" strokeLinejoin="round" opacity={0.9}>
    {CRACKS.slice(0, Math.min(9, stage)).map((d, i) => <path key={i} d={d} />)}
    {stage >= 6 && CRACKS.slice(0, stage - 5).map((d, i) => <path key={`b${i}`} d={d} transform="translate(0.08 -0.06) scale(0.85)" />)}
  </g>
);

/* -------------------------------- the shaft -------------------------------- */

const wallFill = (layer: string, side: number) => {
  const g = layer === "stone" ? ["#8b8b93", "#7a7a82", "#686870", "#9a9aa2"] : ["#8a5b36", "#744a2a", "#643f23", "#9b6a40"];
  return g[side];
};

const Shaft: React.FC<{ f: number }> = ({ f }) => {
  const { n, zc, broken } = blockAt(f);
  const hw = FOCAL / zc;
  const layerOf = (idx: number) => (idx < 2 ? "stone" : "dirt");
  const segs: React.ReactNode[] = [];
  // rings of the shaft between the camera and the ceiling: one per block already mined
  for (let m = 0; m < 4; m++) {
    const zFar = zc - m, zNear = Math.max(0.45, zc - m - 1);
    if (zFar <= 0.45) break;
    const hf = FOCAL / zFar, hn = FOCAL / zNear;
    const layer = layerOf(Math.max(0, n - m - 1));
    const quad = (side: number, pts: [number, number][]) => (
      <polygon key={`${m}-${side}`} points={pts.map((p) => p.join(",")).join(" ")} fill={wallFill(layer, side)} stroke={LINE} strokeWidth={9} strokeLinejoin="round" />
    );
    segs.push(
      quad(0, [[CX - hf, CY - hf], [CX + hf, CY - hf], [CX + hn, CY - hn], [CX - hn, CY - hn]]), // the far wall, north
      quad(1, [[CX - hf, CY + hf], [CX + hf, CY + hf], [CX + hn, CY + hn], [CX - hn, CY + hn]]), // south
      quad(2, [[CX - hf, CY - hf], [CX - hf, CY + hf], [CX - hn, CY + hn], [CX - hn, CY - hn]]), // west
      quad(3, [[CX + hf, CY - hf], [CX + hf, CY + hf], [CX + hn, CY + hn], [CX + hn, CY - hn]]), // east
    );
    // the seam down the middle of each two-block-wide wall
    segs.push(
      <path key={`s${m}`} d={`M${CX},${CY - hf} L${CX},${CY - hn} M${CX},${CY + hf} L${CX},${CY + hn} M${CX - hf},${CY} L${CX - hn},${CY} M${CX + hf},${CY} L${CX + hn},${CY}`} stroke={LINE} strokeWidth={5} opacity={0.6} />
    );
  }
  const strike = strikeState(f);
  const blk = B.blocks[Math.min(n, B.blocks.length - 1)];
  const hitsDone = blk.strikes.filter((s) => f >= s).length;
  const stage = broken ? 0 : Math.min(9, Math.round((hitsDone / blk.strikes.length) * 7 + (hitsDone > 0 ? 1 : 0)));
  const leaking = f >= B.leak && !broken;
  return (
    <g>
      <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#15121b" />
      {segs}
      {!broken ? (
        <g>
          <Block2D x={CX - hw} y={CY - hw} s={hw * 2} pal={blk.layer === "stone" ? STONE : DIRT} lw={10} />
          <Cracks x={CX - hw} y={CY - hw} s={hw * 2} stage={stage} />
          {leaking && (
            <g fill="#fff6c8" opacity={0.55 + 0.4 * Math.sin(f * 0.7)}>
              <rect x={CX - hw - 6} y={CY - hw - 6} width={hw * 2 + 12} height={12} />
              <rect x={CX - hw - 6} y={CY + hw - 6} width={hw * 2 + 12} height={12} />
              <rect x={CX - hw - 6} y={CY - hw - 6} width={12} height={hw * 2 + 12} />
              <rect x={CX + hw - 6} y={CY - hw - 6} width={12} height={hw * 2 + 12} />
            </g>
          )}
        </g>
      ) : (
        <Sky hw={hw} f={f} />
      )}
      <Debris f={f} zc={zc} hw={hw} />
      <g opacity={0}>{strike.since}</g>
    </g>
  );
};

/** the square of sky at the top of the shaft, with the grass rim round it and light pouring in */
const Sky: React.FC<{ hw: number; f: number }> = ({ hw, f }) => {
  const x = CX - hw, y = CY - hw;
  return (
    <g>
      {/* light spilling down the walls */}
      <g fill="#fff6c8" opacity={0.3}>
        <polygon points={`${x},${y} ${x + hw * 2},${y} ${CX + 1400},${CY - 1400} ${CX - 1400},${CY - 1400}`} />
        <polygon points={`${x},${y + hw * 2} ${x + hw * 2},${y + hw * 2} ${CX + 1400},${CY + 1400} ${CX - 1400},${CY + 1400}`} opacity={0.6} />
      </g>
      <clipPath id="holeClip"><rect x={x} y={y} width={hw * 2} height={hw * 2} /></clipPath>
      <g clipPath="url(#holeClip)">
        <rect x={x} y={y} width={hw * 2} height={hw * 2} fill="#8fd2ff" />
        <rect x={x} y={y + hw} width={hw * 2} height={hw} fill="#b8e4ff" />
        <rect x={CX + hw * 0.1} y={CY - hw * 0.6} width={hw * 0.55} height={hw * 0.55} fill="#fff6c8" />
        {[[-0.7, 0.3, 0.7], [0.2, 0.75, 0.6]].map(([cx, cy, w], i) => (
          <rect key={i} x={CX + cx * hw + ((f * (0.8 + i * 0.3)) % hw) - hw * 0.4} y={CY + cy * hw - hw * 0.3} width={hw * w} height={hw * 0.25} fill="#fff" opacity={0.95} />
        ))}
        {f >= B.birds[0] && <Bird x={CX + Math.cos(f * 0.05) * hw * 0.6} y={CY - hw * 0.2 + Math.sin(f * 0.11) * hw * 0.1} f={f} s={hw / 260} />}
      </g>
      {/* the grass rim: the last block of the surface, seen from underneath */}
      <rect x={x - 0.09 * hw} y={y - 0.09 * hw} width={hw * 2.18} height={hw * 2.18} fill="none" stroke="#5fb04a" strokeWidth={hw * 0.18} />
      <rect x={x} y={y} width={hw * 2} height={hw * 2} fill="none" stroke={LINE} strokeWidth={9} />
    </g>
  );
};

const Bird: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => {
  const flap = Math.sin(f * 0.9) * 26;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke="#2a1b3d" strokeWidth={5} strokeLinejoin="round">
      <ellipse rx={30} ry={20} fill="#6aa0ff" />
      <circle cx={24} cy={-10} r={14} fill="#6aa0ff" />
      <path d="M36,-12 L50,-8 L36,-4 Z" fill="#f4b73c" />
      <path d={`M-6,0 L14,0 L4,${-28 - flap} Z`} fill="#4c82ea" />
    </g>
  );
};

/** chunks of the broken block falling straight at the lens, growing as they come */
const Debris: React.FC<{ f: number; zc: number; hw: number }> = ({ f, zc }) => (
  <g>
    {BREAKS.map((b, bi) => {
      const t = f - b;
      if (t < 0 || t > 20) return null;
      const final = bi === BREAKS.length - 1;
      const pal = B.blocks[bi].layer === "stone" ? STONE : DIRT;
      const n = final ? 16 : 9;
      return (
        <g key={b}>
          {Array.from({ length: n }, (_, i) => {
            const u = t / 20;
            const z = lerp(zc > 2.4 ? 3 : 2, 0.42, u * u * (final ? 0.9 : 1));
            const ang = random(`db${bi}${i}`) * Math.PI * 2, r = 0.25 + random(`dr${bi}${i}`) * 0.8;
            const px = CX + Math.cos(ang) * r * (FOCAL / z) * (0.45 + u), py = CY + Math.sin(ang) * r * (FOCAL / z) * (0.45 + u);
            const sz = (final ? 0.42 : 0.3) * (FOCAL / z) * (0.5 + random(`ds${bi}${i}`) * 0.6);
            return <rect key={i} x={px - sz / 2} y={py - sz / 2} width={sz} height={sz} fill={pal.base[i % 4]} stroke={LINE} strokeWidth={Math.max(3, sz * 0.06)} transform={`rotate(${(random(`dq${bi}${i}`) - 0.5) * 120 * u} ${px} ${py})`} opacity={1 - Math.max(0, u - 0.8) * 5} />;
          })}
        </g>
      );
    })}
  </g>
);

/* ------------------------------- the pickaxe ------------------------------- */

const Pickaxe: React.FC<{ f: number }> = ({ f }) => {
  const { since, toNext } = strikeState(f);
  const last = f >= B.final;
  // windup (pulled back and down), strike (up into the ceiling), recoil, settle
  let k = 0; // 0 idle, 1 wound up, 2 at the ceiling
  if (toNext <= 7) k = 1 - (toNext - 1) / 7 * 0.0 - 0;
  if (toNext <= 7 && toNext >= 1) k = clamp01((7 - toNext) / 6);
  if (since === 0) k = 2;
  if (since > 0 && since < 10) k = 2 - ease(since, 0, 10) * 2;
  const idle = { x: 880, y: 2060, r: -20, s: 0.62 };
  const wind = { x: 930, y: 2140, r: 2, s: 0.56 };
  const hit = { x: 900, y: 1960, r: -24, s: 0.86 };
  const pose = k <= 1 ? { x: lerp(idle.x, wind.x, k), y: lerp(idle.y, wind.y, k), r: lerp(idle.r, wind.r, k), s: lerp(idle.s, wind.s, k) }
    : { x: lerp(wind.x, hit.x, k - 1), y: lerp(wind.y, hit.y, k - 1), r: lerp(wind.r, hit.r, k - 1), s: lerp(wind.s, hit.s, k - 1) };
  // it drops out of view after the last block goes
  const away = last ? ease(f, B.final + 6, B.final + 22) : 0;
  const w = PICK_SIZE[0], h = PICK_SIZE[1];
  return (
    <g transform={`translate(${pose.x} ${pose.y + away * 700}) rotate(${pose.r}) scale(${pose.s * (f >= B.final - 0 ? 1.05 : 1)}) translate(${-w / 2} ${-h})`}>
      <image href={PICK} x={0} y={0} width={w} height={h} />
    </g>
  );
};

/** sparks where the pick meets the ceiling */
const Sparks: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {ALL_STRIKES.map((s) => {
      const t = f - s;
      if (t < 0 || t > 6) return null;
      return (
        <g key={s} opacity={1 - t / 7}>
          <circle cx={CX - 40} cy={CY + 40} r={40 + t * 22} fill="#fff6c8" opacity={0.75 - t / 8} />
          {Array.from({ length: 8 }, (_, i) => <rect key={i} x={CX - 40 + Math.cos(i * 0.785) * t * 34 - 7} y={CY + 40 + Math.sin(i * 0.785) * t * 34 - 7} width={14} height={14} fill="#ffe08a" />)}
        </g>
      );
    })}
  </g>
);

/* --------------------------------- meadow --------------------------------- */

const Flower: React.FC<{ x: number; y: number; s: number; c: string }> = ({ x, y, s, c }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-4} y={-50} width={8} height={50} fill="#3f8a32" />
    <rect x={-16} y={-76} width={32} height={28} fill={c} stroke={LINE} strokeWidth={4} />
  </g>
);

/** first person on the grass. horizon is the screen y of the horizon line, yaw pans the world sideways */
const Meadow: React.FC<{ f: number; horizon: number; yaw: number; blades: number; gross?: number }> = ({ f, horizon, yaw, blades }) => {
  const px = (x: number, depth = 1) => x - yaw * depth;
  return (
    <g>
      <rect x={-200} y={PANEL_TOP - 600} width={W + 400} height={horizon - PANEL_TOP + 600} fill="#8fd2ff" />
      <rect x={-200} y={horizon - 440} width={W + 400} height={440} fill="#b8e4ff" />
      <rect x={px(740, 0.25)} y={horizon - 760} width={170} height={170} fill="#fff6c8" />
      {[[40, 520, 320], [560, 660, 380], [900, 400, 260], [1300, 580, 300]].map(([x, y, w], i) => (
        <rect key={i} x={px(x, 0.4) + ((f * (0.5 + i * 0.15)) % 300) - 160} y={horizon - y - 240} width={w} height={84} fill="#ffffff" opacity={0.95} />
      ))}
      <path d={`M-400,${horizon} V${horizon - 70} h600 v-50 h420 v40 h460 v-60 h520 V${horizon} Z`} transform={`translate(${-yaw * 0.6} 0)`} fill="#6cbf55" stroke={LINE} strokeWidth={8} strokeLinejoin="round" />
      <rect x={-200} y={horizon} width={W + 400} height={H - horizon + 40} fill="#5fb04a" />
      {Array.from({ length: 22 }, (_, i) => <rect key={i} x={px(-100 + i * 90 + random(`mg${i}`) * 40, 0.8)} y={horizon + 40 + random(`mg${i}y`) * 520} width={10} height={24} fill="#4a9a3a" />)}
      {[[170, 0.25, "#e8483a"], [420, 0.4, "#ffd84a"], [760, 0.3, "#e8483a"], [980, 0.5, "#ffd84a"], [1240, 0.35, "#e8483a"], [-60, 0.45, "#ffd84a"]].map(([x, s, c], i) => (
        <Flower key={i} x={px(x as number, 1.2)} y={horizon + 60 + (s as number) * 360} s={(s as number) * 1.6} c={c as string} />
      ))}
      <Cow x={px(250, 0.9)} y={horizon - 70} scale={0.6} walk={f * 0.1} />
      {f >= B.birds[2] && <Bird x={px(300 + f * 1.2 - 300, 0.5)} y={horizon - 520 + Math.sin(f * 0.1) * 20} f={f} s={1.1} />}
      {/* grass blades at the edges, rising as he lies back in it */}
      {[[-30, 1], [70, 1.3], [200, 0.9], [960, 1.1], [1050, 1.4], [880, 0.8]].map(([x, k], i) => {
        const hgt = blades * (k as number);
        return <path key={i} d={`M${(x as number) - 60},${H + 10} L${(x as number) + Math.sin(f * 0.05 + i) * 10},${H - hgt} L${(x as number) + 60},${H + 10} Z`} fill="#3f8a32" stroke="#2a1b3d" strokeWidth={8} strokeLinejoin="round" />;
      })}
    </g>
  );
};

const meadowParams = (f: number) => {
  const [t0, t1] = B.tilt;
  // out of the hole he is looking at the sky; the camera tilts down and the creeper is standing there
  const horizon = lerp(2250, 1040, ease(f, t0, t1));
  const yaw = f >= t0 ? Math.sin((f - t0) * 0.09) * 10 : 0;
  return { horizon, blades: 140, yaw };
};

/* ---------------------------- the creeper, from below ---------------------------- */

const creeperDist = (f: number) => {
  // standing a few steps off, then four slow steps closer, each on a footfall of the music
  const D = [1.75, 1.55, 1.4, 1.25, 1.1];
  let d = D[0];
  B.steps.forEach((st, i) => { d = lerp(d, D[i + 1], ease(f, st, st + 6)); });
  if (f >= B.hiss[0]) d = lerp(D[4], 0.98, ease(f, B.hiss[0], B.hiss[1]));
  return d;
};

const CreeperView: React.FC<{ f: number; horizon: number }> = ({ f, horizon }) => {
  const d = creeperDist(f);
  const sc = 0.85 / d;
  const footY = horizon + 30 + 820 / d;
  const hissT = clamp01((f - B.hiss[0]) / (B.hiss[1] - B.hiss[0]));
  const swell = f >= B.hiss[0] ? hissT : 0;
  const flick = f >= B.hiss[0] && Math.floor(f / 3) % 2 === 0 ? swell : swell * 0.3;
  const w = CREEP_SIZE[0] * sc * (1 + swell * 0.16), h = CREEP_SIZE[1] * sc * (1 + swell * 0.16);
  // each footfall: a little squash, then it settles
  let stepBump = 0;
  for (const st of B.steps) { const t = f - st; if (t >= 0 && t < 8) stepBump = Math.max(stepBump, Math.sin((t / 8) * Math.PI)); }
  const sx = f >= B.hiss[0] ? Math.sin(f * 4.3) * (3 + swell * 12) : 0;
  return (
    <g transform={`translate(${CX + sx} ${footY + stepBump * 10 * sc})`}>
      <filter id="creeperFlash" x="-10%" y="-10%" width="120%" height="120%">
        <feFlood floodColor="#ffffff" floodOpacity={flick * 0.9} result="w" />
        <feComposite in="w" in2="SourceAlpha" operator="in" result="wa" />
        <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="wa" /></feMerge>
      </filter>
      <image href={CREEP} x={-w / 2} y={-h} width={w} height={h} filter="url(#creeperFlash)" />
    </g>
  );
};

/* -------------------------------- assembly -------------------------------- */

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const [sx, sy] = shake(f);
  if (f >= B.cut) return <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#000" />;
  if (f < B.meadow) {
    // rising through the hole: the walls fall away as the sky comes up to meet you
    const zoom = f >= B.holeRise[0] ? ease(f, B.holeRise[0], B.holeRise[1]) : 0;
    const z = 1 + zoom * 1.4;
    return (
      <g transform={`translate(${sx} ${sy})`}>
        <g transform={`translate(${CX} ${CY}) scale(${z}) translate(${-CX} ${-CY})`}>
          <Shaft f={f} />
        </g>
        <Sparks f={f} />
        <Pickaxe f={f} />
      </g>
    );
  }
  const { horizon, blades, yaw } = meadowParams(f);
  return (
    <g>
      <Meadow f={f} horizon={horizon} yaw={yaw} blades={blades} />
      {f >= B.butterfly && f < B.tilt[1] && <Butterfly f={f} />}
      <CreeperView f={f} horizon={horizon} />
      {/* eyelids opening as he comes up into the light */}
      {f < B.meadow + 12 && <rect x={0} y={PANEL_TOP} width={W} height={(H - PANEL_TOP) * 0.5 * (1 - ease(f, B.meadow, B.meadow + 12))} fill="#fffbe0" />}
    </g>
  );
};

const Butterfly: React.FC<{ f: number }> = ({ f }) => {
  const u = ease(f, B.butterfly, B.butterfly + 24);
  const x = lerp(860, 640, u), y = lerp(PANEL_TOP + 300, PANEL_TOP + 520, u) + Math.sin(f * 0.5) * 10;
  const w = 0.35 + 0.65 * Math.abs(Math.sin(f * 0.7));
  return (
    <g transform={`translate(${x} ${y})`} stroke="#2a1b3d" strokeWidth={4} strokeLinejoin="round">
      <ellipse cx={-16 * w} cy={-6} rx={18 * w} ry={14} fill="#ffb347" />
      <ellipse cx={16 * w} cy={-6} rx={18 * w} ry={14} fill="#ffb347" />
      <ellipse cx={-12 * w} cy={10} rx={12 * w} ry={10} fill="#ff7a59" />
      <ellipse cx={12 * w} cy={10} rx={12 * w} ry={10} fill="#ff7a59" />
      <rect x={-3} y={-14} width={6} height={32} fill="#2a1b3d" />
    </g>
  );
};

const CaptionBand: React.FC = () => (
  <div style={{ position: "absolute", left: 0, top: 0, width: W, height: PANEL_TOP, background: "#ffffff" }}>
    <div style={{ position: "absolute", left: 80, top: 111, fontFamily: "Selawik, 'Segoe UI', sans-serif", fontSize: 88, lineHeight: "118px", color: "#000", whiteSpace: "pre" }}>
      {POV_CAPTION.join("\n")}
    </div>
  </div>
);

const Flash: React.FC<{ f: number }> = ({ f }) => {
  const a = B.final, b = B.meadow;
  let o = 0;
  if (f >= a && f < a + 3) o = 1;
  else if (f >= a + 3 && f < a + 26) o = 0.75 * (1 - ease(f, a + 3, a + 26));
  if (f >= b - 8 && f < b) o = Math.max(o, ease(f, b - 8, b));
  return o <= 0 ? null : <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#fffbe0" opacity={o} />;
};

const YReadout: React.FC<{ f: number }> = ({ f }) => {
  if (f >= B.meadow) return null;
  const ys = [-52, -31, -9, 14, 38, 64];
  let i = 0;
  for (let k = 0; k < BREAKS.length; k++) if (f >= BREAKS[k] + 4) i = k + 1;
  const y = ys[Math.min(i, ys.length - 1)];
  return (
    <g>
      <rect x={30} y={PANEL_TOP + 24} width={250} height={84} fill="#000" opacity={0.55} />
      <text x={56} y={PANEL_TOP + 82} fontFamily={MONO} fontSize={42} fill={y >= 60 ? "#7dff7d" : "#ffffff"}>{`Y: ${y}`}</text>
    </g>
  );
};

export const PovShort: React.FC<{ audio?: string | null; drawn?: boolean }> = ({ audio = null, drawn = true }) => {
  loadMinecraftFonts();
  usePreload([PICK, CREEP]);
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {audio && <Audio src={staticFile(audio)} />}
      <HandDrawn enabled={drawn} hold={1} boilEvery={2} boil={0.75} grain={0}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          <defs><clipPath id="povPanel"><rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} /></clipPath></defs>
          <g clipPath="url(#povPanel)"><Scene f={f} /></g>
        </svg>
      </HandDrawn>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <Flash f={f} />
        {f < B.cut && <YReadout f={f} />}
      </svg>
      <CaptionBand />
    </AbsoluteFill>
  );
};

export const PovThumb: React.FC = () => {
  loadMinecraftFonts();
  usePreload([PICK, CREEP]);
  const f = B.hiss[0] - 2; // the creeper right there, a moment before it swells
  const { horizon, blades, yaw } = meadowParams(f);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs><clipPath id="povPanelT"><rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} /></clipPath></defs>
        <g clipPath="url(#povPanelT)">
          <Meadow f={f} horizon={horizon} yaw={yaw} blades={blades} />
          <CreeperView f={f} horizon={horizon} />
        </g>
      </svg>
      <CaptionBand />
    </AbsoluteFill>
  );
};
