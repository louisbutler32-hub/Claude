import React from "react";
import { random, useCurrentFrame } from "remotion";
import { H, PANEL_TOP, W } from "../minecraft/beats";
import { Zombie } from "../minecraft/mobs";
import { Block2D, Palette } from "../minecraft-bridge/blocks";
import { Arm, CX, LINE, PovFrame, PovHud, ease3, lerp } from "./kit";
import B from "./beats-night.json";

/**
 * "POV: Your first night in Minecraft" — first person, from inside a dirt
 * hut with one window. The sun sets, the zombies come to the window, you plug
 * it with a block and they pound on it all night — until the light cracks
 * through and the block comes out onto a burning morning.
 */

export const NIGHT_FRAMES = B.frame;
export const NIGHT_CAPTION = ["POV: Your first night", "in Minecraft"];

const DIRT: Palette = { base: ["#8b5a34", "#7a4b2a", "#9c6a40", "#6a3f22"], weights: [0.42, 0.3, 0.18, 0.1] };
const WIN = { x: 90, y: 560, w: 900, h: 760 };
const HORIZON = 1000;

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = hex(a), Bv = hex(b);
  return "#" + A.map((v, i) => Math.round(lerp(v, Bv[i], t)).toString(16).padStart(2, "0")).join("");
};

const skyAt = (f: number): [string, string] => {
  if (f >= B.dawn) return ["#7fc8ff", "#cdeaff"];
  const stops: [number, string, string][] = [
    [0, "#ff9d52", "#ffd08a"],
    [B.dusk, "#a14d86", "#e8845e"],
    [B.night, "#1a2150", "#3a3a78"],
    [130, "#0a0e2c", "#1b2050"],
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    const [a, c1, c2] = stops[i], [b, d1, d2] = stops[i + 1];
    if (f <= b) { const t = ease3(f, a, b); return [mix(c1, d1, t), mix(c2, d2, t)]; }
  }
  return [stops[3][1], stops[3][2]];
};

/** a plain zombie walking in from the horizon to the window */
const zombiePos = (f: number, from: number, x0: number, x1: number, s1: number, y1: number) => {
  const t = ease3(f, from, B.arrive + 4);
  const s = lerp(0.12, s1, t * t);
  const x = lerp(x0, x1, t);
  const y = lerp(HORIZON + 10 - 230 * 0.12, y1, t * t);
  return { s, x, y, t, bob: f * 0.35 };
};

const Outside: React.FC<{ f: number }> = ({ f }) => {
  const [top, bot] = skyAt(f);
  const night = clamp(ease3(f, B.dusk, B.night + 20), 0, 1) * (f >= B.dawn ? 0 : 1);
  const day = f >= B.dawn;
  return (
    <g>
      <defs>
        <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bot} /></linearGradient>
      </defs>
      <rect x={WIN.x} y={WIN.y} width={WIN.w} height={HORIZON - WIN.y} fill="url(#nightSky)" />
      {/* stars */}
      {Array.from({ length: 34 }, (_, i) => (
        <rect key={i} x={WIN.x + 20 + random(`st${i}`) * (WIN.w - 40)} y={WIN.y + 10 + random(`sy${i}`) * 300} width={8} height={8} fill="#ffffff" opacity={night * (0.5 + 0.5 * Math.sin(f * 0.2 + i))} />
      ))}
      {/* the moon / the sun */}
      {!day && <rect x={650} y={720} width={90} height={90} fill="#f4f4e8" opacity={night} />}
      {!day && f < B.night && <rect x={430} y={lerp(900, 1000, ease3(f, 0, B.night))} width={110} height={110} fill="#fff1b0" opacity={1 - night} />}
      {day && <rect x={600} y={730} width={120} height={120} fill="#fff6c8" />}
      {/* the ground */}
      <rect x={WIN.x} y={HORIZON} width={WIN.w} height={WIN.y + WIN.h - HORIZON} fill={day ? "#5fb04a" : mix("#3f8a32", "#0e2a14", night)} />
      {/* trees: dark pillars with leaf blocks */}
      {[[240, 0.9], [770, 1.1], [520, 0.55]].map(([x, s], i) => (
        <g key={i} stroke={LINE} strokeWidth={6}>
          <rect x={(x as number) - 14 * (s as number)} y={HORIZON - 130 * (s as number)} width={28 * (s as number)} height={140 * (s as number)} fill={mix("#6b4a2a", "#1a1008", night)} />
          <rect x={(x as number) - 70 * (s as number)} y={HORIZON - 250 * (s as number)} width={140 * (s as number)} height={130 * (s as number)} fill={day ? "#3f8a32" : mix("#3f8a32", "#0a2410", night)} />
        </g>
      ))}
    </g>
  );
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const Mobs: React.FC<{ f: number }> = ({ f }) => {
  const list: React.ReactNode[] = [];
  const burning = f >= B.dawn;
  const add = (key: string, from: number, x0: number, x1: number, s1: number, y1: number, extra = 0) => {
    if (f < from) return;
    const p = zombiePos(f, from, x0, x1, s1, y1);
    const sc = p.s * (burning ? 1 : 1);
    const hurtArm = f >= B.hurt[0] && f < B.hurt[0] + 8 ? Math.sin((f - B.hurt[0]) * 0.8) * 0.2 : 0;
    list.push(
      <g key={key} opacity={1}>
        <Zombie x={p.x} y={p.y + extra} scale={sc} walk={p.bob + hurtArm} flash={burning && Math.floor(f / 3) % 2 === 0} />
        {burning && <Flames x={p.x} y={p.y + 120 * sc} s={sc * 0.8} f={f} />}
      </g>
    );
  };
  add("c", B.arrive - 20, 330, 450, 1.7, 930);
  add("b", B.zombieB, 730, 880, 1.9, 960);
  add("a", B.zombieA, 400, 640, 2.5, 900);
  return <g>{list}</g>;
};

const Flames: React.FC<{ x: number; y: number; s: number; f: number }> = ({ x, y, s, f }) => (
  <g>
    {Array.from({ length: 9 }, (_, i) => {
      const u = (f * 0.12 + i * 0.37) % 1;
      const fx = x + (random(`fl${i}`) - 0.5) * 120 * s;
      const fy = y + 40 * s - u * 260 * s;
      return <rect key={i} x={fx - 18 * s} y={fy} width={36 * s} height={44 * s} fill={i % 3 ? "#ff8a1e" : "#ffd23a"} opacity={1 - u} />;
    })}
  </g>
);

/** the dirt wall around the window, with a bevel so the window reads as a hole through a block */
const Wall: React.FC<{ f: number; dark: number; shakeX: number; shakeY: number }> = ({ f, dark, shakeX, shakeY }) => {
  const cells: React.ReactNode[] = [];
  const S = 270;
  for (let r = 0; r < 7; r++) for (let c = -1; c < 5; c++) cells.push(<Block2D key={`${r}-${c}`} x={c * S + shakeX} y={PANEL_TOP - 40 + r * S + shakeY} s={S} pal={DIRT} k={1 - dark * 0.55} lw={6} />);
  void f;
  return <g>{cells}</g>;
};

const Plug: React.FC<{ f: number }> = ({ f }) => {
  // the block sliding into the window
  const p = ease3(f, B.plug - 6, B.plug);
  if (f < B.plug - 6) return null;
  const s = lerp(1.25, 1, p);
  const cx = WIN.x + WIN.w / 2, cy = WIN.y + WIN.h / 2;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`} opacity={clamp(p * 1.6, 0, 1)}>
      <Block2D x={WIN.x} y={WIN.y} s={Math.max(WIN.w, WIN.h)} pal={DIRT} k={0.55} lw={9} />
    </g>
  );
};

const Cracks: React.FC<{ f: number }> = ({ f }) => {
  if (f < B.cracks || f >= B.dawn) return null;
  const u = (f - B.cracks) / (B.dawn - B.cracks);
  const paths = [
    `M${WIN.x + 100},${WIN.y + 20} l60,150 l-40,120 l70,160`,
    `M${WIN.x + 420},${WIN.y + 10} l-30,170 l80,140 l-30,170`,
    `M${WIN.x + 640},${WIN.y + 60} l-70,130 l40,160 l-20,120`,
  ];
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {paths.map((d, i) => <path key={i} d={d} stroke="#fff3b0" strokeWidth={10 + u * 14} opacity={clamp(u * 2 - i * 0.2, 0, 1)} />)}
      <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#fff3b0" opacity={u * 0.18} />
    </g>
  );
};

const Chips: React.FC<{ f: number }> = ({ f }) => {
  const t = f - B.dawn;
  if (t < 0 || t > 16) return null;
  return (
    <g>
      {Array.from({ length: 22 }, (_, i) => {
        const a = random(`cp${i}`) * Math.PI * 2, v = 14 + random(`cv${i}`) * 26;
        return <rect key={i} x={CX + Math.cos(a) * v * t} y={WIN.y + 320 + Math.sin(a) * v * t + t * t * 2.2} width={26} height={26} fill={i % 2 ? "#8b5a34" : "#6a3f22"} stroke={LINE} strokeWidth={4} />;
      })}
    </g>
  );
};

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const plugged = f >= B.plug && f < B.dawn;
  const dawn = f >= B.dawn;
  // shake on each pounding thump
  let sx = 0, sy = 0;
  for (const t of B.thumps) {
    const d = f - t;
    if (d >= 0 && d < 9) { sx += Math.sin(d * 3.4) * 16 * (1 - d / 9); sy += Math.cos(d * 2.7) * 10 * (1 - d / 9); }
  }
  // the opening narrows as the first block goes in at plug1
  const closing = ease3(f, B.plug1 - 6, B.plug1 + 2);
  const dark = plugged ? 1 : clamp(ease3(f, B.dusk, B.night + 20) * 0.8, 0, 1);
  return (
    <g>
      <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#000" />
      <g transform={`translate(${sx} ${sy})`}>
        <Outside f={f} />
        <Mobs f={f} />
        {/* the wall, over everything outside, with the window cut out of it */}
        <WallWithWindow f={f} dark={dark} closing={closing} dawn={dawn} />
        {plugged && <Plug f={f} />}
        {f >= B.plug && !dawn && <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#0a0603" opacity={0.3} />}
        <Cracks f={f} />
        <Chips f={f} />
      </g>
      {f >= B.night && f < B.plug && <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#000820" opacity={0.18} />}
    </g>
  );
};

const WallWithWindow: React.FC<{ f: number; dark: number; closing: number; dawn: boolean }> = ({ f, dark, closing, dawn }) => {
  // the wall is four slabs around the window, so the outside shows through the hole
  const k = 1 - dark * 0.55;
  const left = WIN.x + closing * 250;
  if (f >= B.plug && !dawn) return <Wall f={f} dark={1} shakeX={0} shakeY={0} />;
  const S = 270;
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < 7; r++) for (let c = -1; c < 5; c++) {
    const x = c * S, y = PANEL_TOP - 40 + r * S;
    // skip tiles that fall entirely inside the opening
    const inside = x >= left - 4 && x + S <= WIN.x + WIN.w + 4 && y >= WIN.y - 4 && y + S <= WIN.y + WIN.h + 4;
    if (!inside) cells.push(<Block2D key={`${r}-${c}`} x={x} y={y} s={S} pal={DIRT} k={k} lw={6} />);
  }
  return (
    <g>
      <defs>
        <clipPath id="wallClip"><path clipRule="evenodd" fillRule="evenodd" d={`M0,${PANEL_TOP} H${W} V${H} H0 Z M${left},${WIN.y} H${WIN.x + WIN.w} V${WIN.y + WIN.h} H${left} Z`} /></clipPath>
      </defs>
      <g clipPath="url(#wallClip)">{cells}</g>
      {/* the window's reveal: the thickness of the wall, shaded */}
      <path d={`M${left},${WIN.y} H${WIN.x + WIN.w} V${WIN.y + WIN.h} H${left} Z`} fill="none" stroke={LINE} strokeWidth={14} />
    </g>
  );
};

const handK = (f: number) => {
  const swing = (t: number, len = 9) => (f >= t - 4 && f < t + len ? Math.sin(clamp((f - (t - 4)) / (len + 4), 0, 1) * Math.PI) : 0);
  return Math.max(swing(B.plug1), swing(B.plug), swing(B.dawn - 2, 7)) * 0.85;
};

export const NightShort: React.FC<{ audio?: string | null; drawn?: boolean }> = ({ audio = null, drawn = true }) => {
  const f = useCurrentFrame();
  const hp = f < B.hurt[0] ? 20 : f < B.hurt[1] ? 16 : 12;
  const flash = (f >= B.hurt[0] && f < B.hurt[0] + 4) || (f >= B.hurt[1] && f < B.hurt[1] + 4);
  const holding = f < B.plug + 4 && !(f >= B.plug1 + 14 && f < B.plug - 12) ? "#8b5a34" : null;
  return (
    <PovFrame
      audio={audio}
      drawn={drawn}
      caption={NIGHT_CAPTION}
      panelId="nightPanel"
      scene={<Scene f={f} />}
      hud={<>
        {f >= B.hurt[0] && f < B.hurt[0] + 5 && <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#c01818" opacity={0.28} />}
        <PovHud f={f} hp={hp} items={["cobble", "pickaxe", null, null, null, null, null, null, null]} sel={0} flash={flash} />
      </>}
      top={<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <g clipPath="none"><ArmLayer f={f} held={holding} k={handK(f)} /></g>
      </svg>}
    />
  );
};

const ArmLayer: React.FC<{ f: number; held: string | null; k: number }> = ({ f, held, k }) => {
  void f;
  return <Arm k={k} held={held} dy={Math.sin(f * 0.1) * 6} />;
};

export const NightThumb: React.FC = () => {
  const f = B.arrive + 14;
  return (
    <PovFrame caption={NIGHT_CAPTION} panelId="nightPanelT" drawn={false} scene={<Scene f={f} />} hud={<PovHud f={f} hp={20} items={["cobble", "pickaxe", null, null, null, null, null, null, null]} sel={0} />} top={<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}><Arm k={0} held="#8b5a34" /></svg>} />
  );
};
