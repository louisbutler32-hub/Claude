import React from "react";
import { random, useCurrentFrame } from "remotion";
import { H, PANEL_TOP, W } from "../minecraft/beats";
import { CX, CY, LINE, PovFrame, PovHud, Crosshair, clamp01, ease3, lerp } from "./kit";
import B from "./beats-ender.json";

/**
 * "POV: You accidentally look at an Enderman" — first person, walking through a
 * night forest on the beat of the Pink Panther theme. The camera drifts across
 * a tall dark figure far off, the crosshair lands on its head — eye contact —
 * you whip away, pretend it never happened, and it is right there when you turn back.
 */

export const ENDER_FRAMES = B.frame;
export const ENDER_CAPTION = ["POV: You accidentally", "look at an Enderman"];

const FOCAL = 560;
const HORIZON = CY - 40;
const CAM_H = 1.6;
const TARGET: [number, number] = [2.4, 14.5];

const STEP = 0.062;
const camZ = (f: number) => STEP * Math.min(f, B.lock);

/** yaw: a slow drift across the forest, onto the enderman at the lock, off it, and back */
const yawAt = (f: number) => {
  const cz = camZ(B.lock);
  const onIt = Math.atan2(TARGET[0], TARGET[1] - cz);
  let y = lerp(-0.25, onIt, ease3(f, 70, B.lock));
  if (f >= B.away[0]) y = lerp(onIt, onIt - 1.25, ease3(f, B.away[0], B.away[1]));
  if (f >= B.teleport) y = onIt - 1.25 + Math.sin((f - B.teleport) * 0.4) * 0.006;
  return y;
};

const bobAt = (f: number) => (f < B.lock ? Math.sin((f - B.stepFrom) / B.beat * Math.PI) ** 2 * 10 : 0);

/** the trees: a fixed forest in the world */
const segDist = (px: number, pz: number, ax: number, az: number, bx: number, bz: number) => {
  const dx = bx - ax, dz = bz - az;
  const t = clamp01(((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz));
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
};
const LOOK2 = (() => {
  const cz = STEP * B.lock;
  const yaw = Math.atan2(TARGET[0], TARGET[1] - cz) - 1.25;
  return { cz, ex: Math.sin(yaw) * 7, ez: cz + Math.cos(yaw) * 7 };
})();
const TREES: { x: number; z: number; h: number }[] = Array.from({ length: 140 }, (_, i) => ({
  x: (random(`tx${i}`) - 0.5) * 40,
  z: 1 + random(`tz${i}`) * 40,
  h: 3.4 + random(`th${i}`) * 2.4,
})).filter((t) =>
  segDist(t.x, t.z, 0, 0, TARGET[0], TARGET[1]) > 2.6 &&
  segDist(t.x, t.z, 0, LOOK2.cz, LOOK2.ex, LOOK2.ez) > 2.4 &&
  Math.hypot(t.x - TARGET[0], t.z - TARGET[1]) > 3.2);

const project = (wx: number, wz: number, f: number): [number, number] | null => {
  const dx = wx, dz = wz - camZ(f);
  const yaw = yawAt(f);
  const xr = dx * Math.cos(yaw) - dz * Math.sin(yaw);
  const zr = dx * Math.sin(yaw) + dz * Math.cos(yaw);
  if (zr < 0.4) return null;
  return [CX + (FOCAL * xr) / zr, zr];
};

const Tree: React.FC<{ sx: number; zr: number; h: number; f: number; pitch: number }> = ({ sx, zr, h, pitch }) => {
  const g = HORIZON + pitch + (FOCAL * CAM_H) / zr;
  const k = FOCAL / zr;
  const tw = 0.7 * k;
  const fog = clamp01(zr / 34);
  const trunk = mixc("#4a321c", "#101018", fog * 0.7);
  const leaf = mixc("#1f5a22", "#0c1220", fog * 0.8);
  return (
    <g stroke={LINE} strokeWidth={Math.max(2, 7 * (1 - fog))} strokeLinejoin="round">
      <rect x={sx - tw / 2} y={g - h * k} width={tw} height={h * k} fill={trunk} />
      <rect x={sx - 1.7 * k} y={g - (h + 1.6) * k} width={3.4 * k} height={2.4 * k} fill={leaf} />
      <rect x={sx - 1.1 * k} y={g - (h + 2.8) * k} width={2.2 * k} height={1.4 * k} fill={leaf} />
    </g>
  );
};

const mixc = (a: string, b: string, t: number) => {
  const A = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), Bv = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + A.map((v, i) => Math.round(lerp(v, Bv[i], t)).toString(16).padStart(2, "0")).join("");
};

/* ---------------------------------- the Enderman ---------------------------------- */

type EnderPose = { stare: number; shake: number; mouth: number };

/** face-on, k px per world unit, feet at (x, groundY) */
const Ender: React.FC<{ x: number; groundY: number; k: number; p: EnderPose }> = ({ x, groundY, k, p }) => {
  const sx = p.shake ? (random(`es${Math.floor(p.shake * 100)}${x}`) - 0.5) * p.shake * k * 0.06 : 0;
  const body = "#16121a", rim = "#3a2a4a";
  const legH = 1.55, torsoH = 0.8, headH = 0.55;
  const y0 = groundY, yLeg = y0 - legH * k, yTor = yLeg - torsoH * k, yHead = yTor - headH * k;
  const eyeCol = p.stare > 0.5 ? "#f4d6ff" : "#c35bff";
  const eyeW = Math.max(0.2 * k, 7), eyeH = Math.max((0.07 + p.mouth * 0.04) * k, 5);
  return (
    <g transform={`translate(${sx} 0)`} stroke={rim} strokeWidth={Math.max(2, k * 0.025)} strokeLinejoin="round" fill={body}>
      <rect x={x - 0.3 * k} y={yLeg} width={0.2 * k} height={legH * k} />
      <rect x={x + 0.1 * k} y={yLeg} width={0.2 * k} height={legH * k} />
      <rect x={x - 0.26 * k} y={yTor} width={0.52 * k} height={torsoH * k} />
      <rect x={x - 0.4 * k} y={yTor + 0.02 * k} width={0.13 * k} height={1.5 * k} />
      <rect x={x + 0.27 * k} y={yTor + 0.02 * k} width={0.13 * k} height={1.5 * k} />
      <rect x={x - 0.28 * k} y={yHead} width={0.56 * k} height={headH * k} />
      <g stroke="none">
        <rect x={x - 0.22 * k} y={yHead + 0.2 * k} width={eyeW} height={eyeH} fill={eyeCol} />
        <rect x={x + 0.02 * k} y={yHead + 0.2 * k} width={eyeW} height={eyeH} fill={eyeCol} />
        {p.stare > 0 && <rect x={x - 0.22 * k} y={yHead + 0.2 * k + eyeH * 0.3} width={0.44 * k} height={eyeH * 0.4} fill="#ffffff" opacity={p.stare * 0.8} />}
        {p.mouth > 0 && <rect x={x - 0.2 * k} y={yHead + (0.32 + 0.05) * k} width={0.4 * k} height={(0.04 + 0.16 * p.mouth) * k} fill="#05020a" />}
        {p.mouth > 0 && <rect x={x - 0.17 * k} y={yHead + 0.4 * k} width={0.34 * k} height={0.1 * k * p.mouth} fill="#b04cff" opacity={0.8} />}
      </g>
    </g>
  );
};

const Particles: React.FC<{ x: number; y: number; k: number; t: number; n?: number }> = ({ x, y, k, t, n = 26 }) => (
  <g>
    {t >= 0 && t < 16 && Array.from({ length: n }, (_, i) => {
      const a = random(`pp${i}`) * Math.PI * 2, v = (0.04 + random(`pv${i}`) * 0.2) * k;
      return <rect key={i} x={x + Math.cos(a) * v * t} y={y + (random(`py${i}`) - 0.5) * 1.4 * k + Math.sin(a) * v * t * 0.6 - t * 2} width={0.07 * k + 5} height={0.07 * k + 5} fill={i % 3 ? "#b04cff" : "#e6b8ff"} opacity={1 - t / 16} />;
    })}
  </g>
);

/* ---------------------------------- scene ---------------------------------- */

const Sky: React.FC<{ f: number; pitch: number }> = ({ f, pitch }) => {
  const yaw = yawAt(f);
  return (
    <g>
      <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#080b1c" />
      <rect x={0} y={HORIZON + pitch - 380} width={W} height={380} fill="#101a3a" opacity={0.9} />
      {Array.from({ length: 40 }, (_, i) => {
        const a = random(`sa${i}`) * 6.28 - 3.14;
        const x = CX + FOCAL * Math.tan((a - yaw) * 0.5) * 1.1;
        return <rect key={i} x={x} y={PANEL_TOP + 20 + random(`sb${i}`) * (HORIZON + pitch - PANEL_TOP - 160)} width={8} height={8} fill="#fff" opacity={0.4 + 0.5 * Math.abs(Math.sin(f * 0.15 + i))} />;
      })}
      <rect x={CX + FOCAL * Math.tan((0.9 - yaw) * 0.5) * 1.1} y={HORIZON + pitch - 640} width={110} height={110} fill="#f1f1e4" />
      <rect x={0} y={HORIZON + pitch} width={W} height={H} fill="#0f2a14" />
      <rect x={0} y={HORIZON + pitch} width={W} height={160} fill="#0a1a10" opacity={0.7} />
    </g>
  );
};

const Scene: React.FC<{ f: number }> = ({ f }) => {
  if (f >= B.cut) return <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#000" />;
  const bob = bobAt(f);
  // tilt up to centre its head on the crosshair for the lock, and back down
  const pitch = bob + lerp(0, 56, ease3(f, 110, B.lock)) * (f < B.away[0] ? 1 : 1 - ease3(f, B.away[0], B.away[1]));
  const items: { z: number; node: React.ReactNode }[] = [];
  TREES.forEach((t, i) => {
    const p = project(t.x, t.z, f);
    if (!p) return;
    items.push({ z: p[1], node: <Tree key={i} sx={p[0]} zr={p[1]} h={t.h} f={f} pitch={pitch} /> });
  });
  // the first Enderman, standing with its back to you until the lock
  const e = project(TARGET[0], TARGET[1], f);
  const locked = f >= B.lock && f < B.teleport;
  if (e && f < B.teleport) {
    const k = FOCAL / e[1];
    const g = HORIZON + pitch + CAM_H * k;
    const stare = locked ? clamp01((f - B.lock) / 3) : 0;
    const shake = locked ? ease3(f, B.lock + 4, B.away[0]) : 0;
    items.push({ z: e[1] - 0.01, node: <g key="e1"><Ender x={e[0]} groundY={g} k={k} p={{ stare, shake: shake * 3, mouth: locked ? clamp01((f - B.lock - 6) / 10) : 0 }} /></g> });
  }
  items.sort((a, b) => b.z - a.z);
  // the teleported one: appears in the middle of the new view, then closes in
  let big: React.ReactNode = null;
  if (f >= B.teleport) {
    const t1 = ease3(f, B.teleport, B.near[0]), t2 = ease3(f, B.near[0], B.near[1]);
    const dist = lerp(3.4, 1.9, t1) - (lerp(0, 0.35, t2));
    const k = FOCAL / dist;
    const x = lerp(CX - 60, CX, t2);
    const g = HORIZON + CAM_H * k + (f >= B.near[1] ? ease3(f, B.near[1], B.scream) * 40 : 0);
    const mouth = ease3(f, B.near[1], B.scream);
    big = (
      <g>
        <Ender x={x} groundY={g} k={k} p={{ stare: 1, shake: f >= B.near[1] ? 4 : 0, mouth }} />
        <Particles x={CX} y={g - 1.6 * k} k={k} t={f - B.teleport} />
      </g>
    );
  }
  const lockP = e && f === B.lock ? e : null;
  void lockP;
  const zoom = f >= B.lock && f < B.away[0] ? 1 + ease3(f, B.lock, B.lock + 6) * 0.1 : 1;
  const sc = f >= B.near[1] ? 1 + ease3(f, B.near[1], B.scream) * 0.35 : zoom;
  return (
    <g transform={`translate(${CX} ${CY}) scale(${sc}) translate(${-CX} ${-CY})`}>
      <Sky f={f} pitch={pitch} />
      {items.map((it) => it.node)}
      {big}
      {locked && <Particles x={e ? e[0] : CX} y={e ? HORIZON + pitch + CAM_H * (FOCAL / e[1]) - 1.6 * (FOCAL / e[1]) : CY} k={e ? FOCAL / e[1] : 100} t={f - B.away[0] + 8} n={16} />}
      {/* a darkening vignette */}
      <defs><radialGradient id="enVig" cx="0.5" cy="0.5" r="0.8"><stop offset="0.35" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.7} /></radialGradient></defs>
      <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="url(#enVig)" />
    </g>
  );
};

const Hud: React.FC<{ f: number }> = ({ f }) => {
  const eye = f >= B.lock && f < B.teleport;
  return (
    <g>
      {f < B.cut && <Crosshair o={eye ? 1 : 0.8} color={eye ? "#ffe0ff" : "#ffffff"} />}
      {f < B.cut && <PovHud f={f} hp={20} items={["pickaxe", "bread", null, null, null, null, null, null, null]} sel={0} />}
      {f >= B.near[1] && f < B.cut && <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#7a1cc0" opacity={0.12 + 0.12 * Math.sin(f * 1.7)} />}
    </g>
  );
};

export const EnderShort: React.FC<{ audio?: string | null; drawn?: boolean }> = ({ audio = null, drawn = true }) => {
  const f = useCurrentFrame();
  return <PovFrame audio={audio} drawn={drawn} caption={ENDER_CAPTION} panelId="enPanel" scene={<Scene f={f} />} hud={<Hud f={f} />} />;
};

export const EnderThumb: React.FC = () => {
  const f = B.near[0] + 4;
  return <PovFrame drawn={false} caption={ENDER_CAPTION} panelId="enPanelT" scene={<Scene f={f} />} hud={<Hud f={f} />} />;
};
