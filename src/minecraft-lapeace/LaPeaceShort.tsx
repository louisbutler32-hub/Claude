import React from "react";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { AbsoluteFill, Audio, continueRender, delayRender, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { H, W } from "../minecraft/beats";
import { ease } from "../minecraft/figure";
import { loadMinecraftFonts } from "../minecraft/fonts";
import { DrawnContext } from "../minecraft/handdrawn";
import { limb, lerpPose, Pose, POSE, Pt } from "../minecraft/figure";
import { Cap, Monk, Straw, Wise } from "./cast";
import { Poppy } from "../minecraft/pixels";
import B from "./beats.json";

/**
 * "That's La Peace" — a shot-for-shot remake, in our look, of a viral Minecraft
 * animation: two friends in a lava cave shout DIAMOND at a wall of ore, a
 * miner breaks through into a sunbeam over an impossible meadow, a glowing
 * treasure hangs in the light, a Greek temple stands in the flowers, and the
 * last close-up finds a hero crowned with laurel. The picture is redrawn with
 * Oofy and the subtitle bar of the game; the voice track is the original's, so
 * the cuts and the lines are on the reference's own times (beats.json).
 */

export const LAPEACE_FRAMES = B.frames;

const LINE = "#2b1d14";
const MONO = "Monocraft, monospace";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const sm = (f: number, a: number, b: number) => ease(f, a, b);

const ORE = staticFile("images/pov2/lapis-ore.png"); // "La Peace" is lapis
const STONE = staticFile("images/pov2/stone.png");
const PICK = staticFile("images/pov2/iron-pickaxe.png");
const BREAKS = [0, 1, 2, 3, 4, 5].map((i) => staticFile(`images/pov2/break-${i}.png`));
const PX: React.CSSProperties = { imageRendering: "pixelated" };

/* ----------------------------- the cast ----------------------------- */

/** the cast (./cast.tsx): the cap guy, the straw-hat guy, the wise one in laurel: the reference's three, drawn as Oofy */
const stand = (extra?: Partial<Pose>): Pose => ({ ...POSE.stand, ...extra });

/** the iron pickaxe in a hand, head up and forward */
const pickInHand = (h: Pt, rot = -25, sc = 0.9) => (
  <g transform={`translate(${h[0]} ${h[1]}) rotate(${rot}) scale(${sc}) translate(-70 -310)`}>
    <image href={PICK} x={0} y={0} width={360} height={360} style={PX} />
  </g>
);

/** a lapis ore block, outlined like everything else */
const Ore: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g>
    <image href={ORE} x={x} y={y} width={s} height={s} style={PX} />
    <rect x={x} y={y} width={s} height={s} fill="none" stroke={LINE} strokeWidth={8} />
  </g>
);

/* ----------------------------- shared scenery ----------------------------- */

/** the air between you and the far mountains: a pale gradient that lifts off the foot of the range */
const Haze: React.FC<{ y: number }> = ({ y }) => (
  <g>
    <defs><linearGradient id="lpHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dfeeff" stopOpacity={0} /><stop offset="1" stopColor="#dfeeff" stopOpacity={0.7} /></linearGradient></defs>
    <rect x={-100} y={y - 380} width={W + 200} height={400} fill="url(#lpHaze)" />
  </g>
);

/** the finish over every shot: soft focus defs, a sun grade from the top right, and a vignette */
const Svg: React.FC<{ children: React.ReactNode; sun?: number }> = ({ children, sun = 0.3 }) => (
  <DrawnContext.Provider value><svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <filter id="lpDof" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={2.6} /></filter>
      <radialGradient id="lpVig" cx="50%" cy="46%" r="75%"><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#0a0518" stopOpacity={0.38} /></radialGradient>
      <radialGradient id="lpSun" cx="82%" cy="6%" r="70%"><stop offset="0" stopColor="#fff2b0" stopOpacity={sun} /><stop offset="1" stopColor="#fff2b0" stopOpacity={0} /></radialGradient>
      <linearGradient id="lpFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0.6" stopColor="#10081c" stopOpacity={0} /><stop offset="1" stopColor="#10081c" stopOpacity={0.3} /></linearGradient>
      <clipPath id="lpAll"><rect x={0} y={0} width={W} height={H} /></clipPath>
    </defs>
    <g clipPath="url(#lpAll)">{children}</g>
    <rect x={0} y={0} width={W} height={H} fill="url(#lpSun)" style={{ mixBlendMode: "screen" }} />
    <rect x={0} y={0} width={W} height={H} fill="url(#lpFloor)" />
    <rect x={0} y={0} width={W} height={H} fill="url(#lpVig)" />
  </svg></DrawnContext.Provider>
);

const INK = "#2b1d14";
const tri = (x: number) => Math.abs((((x % 2) + 2) % 2) - 1);

const SLABS = Array.from({ length: 22 }, (_, i) => ({ u: random(`cu${i}`), v: random(`cv${i}`), w: 0.6 + random(`cw${i}`) * 0.9, o: 0.6 + random(`co${i}`) * 0.4 }));
/** flat sky, with chunky white clouds: one merged outline round each, drifting at different speeds by depth */
const Sky: React.FC<{ f: number; horizon: number; top?: string; bottom?: string }> = ({ f, horizon, top = "#4aa8f2", bottom = "#cdeaff" }) => (
  <g>
    <defs>
      <linearGradient id={`sky${top}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bottom} /></linearGradient>
    </defs>
    <rect x={-100} y={-100} width={W + 200} height={horizon + 100} fill={`url(#sky${top})`} />
    {SLABS.map((c, i) => {
      const y = c.v * horizon * 0.88;
      const near = 1 - y / horizon;
      const w = (170 + 460 * near) * c.w, h = (46 + 80 * near) * c.w;
      const x = ((c.u * 1500 + f * (0.3 + near * 0.8)) % 1500) - 260;
      const shapes = (fill: string, stroke?: string) => (
        <>
          <rect x={x} y={y} width={w} height={h} rx={h * 0.32} fill={fill} stroke={stroke} strokeWidth={stroke ? 12 : 0} />
          <rect x={x + w * 0.16} y={y - h * 0.5} width={w * 0.46} height={h * 0.7} rx={h * 0.32} fill={fill} stroke={stroke} strokeWidth={stroke ? 12 : 0} />
        </>
      );
      return <g key={i} opacity={c.o}>{shapes("#7da6d8", "#7da6d8")}{shapes("#ffffff")}</g>;
    })}
  </g>
);

/** jagged inked mountains with snow caps, a pale far range and a darker near one, and green foothills in front */
const Mountains: React.FC<{ y: number; k?: number }> = ({ y, k = 1 }) => {
  const range = (base: number, amp: number, step: number, off: number, rock: string, shade: string, snowAt: number, snowDepth: number) => {
    const pts: [number, number][] = [];
    for (let x = -step, i = 0; x <= W + step * 2; x += step, i++) {
      const h = (base + amp * (0.55 * tri(i * 0.37 + off) + 0.3 * tri(i * 0.91 + off * 1.7) + 0.15 * tri(i * 1.9 + off * 2.3))) * k;
      pts.push([x, y - h]);
    }
    const bottom = y + 120;
    const ridge = pts.map((p) => p.join(",")).join(" L");
    const out: React.ReactNode[] = [
      <path key="r" d={`M${pts[0][0]},${bottom} L${ridge} L${pts[pts.length - 1][0]},${bottom} Z`} fill={rock} stroke={INK} strokeWidth={8} strokeLinejoin="round" />,
    ];
    for (let i = 1; i < pts.length - 1; i++) {
      const [px, py] = pts[i], [lx, ly] = pts[i - 1], [rx, ry] = pts[i + 1];
      if (!(py < pts[i - 1][1] && py < pts[i + 1][1])) continue;
      out.push(<polygon key={`sh${i}`} points={`${px},${py} ${rx},${ry} ${px + (rx - px) * 0.35},${bottom} ${px},${bottom}`} fill={shade} opacity={0.22} />);
      if (y - py < snowAt * k) continue;
      const cap = Math.min(snowDepth * k, (y - py) * 0.5);
      const sl = (ly - py) / (px - lx), sr = (ry - py) / (rx - px);
      const xl = Math.max(lx, px - cap / sl), xr = Math.min(rx, px + cap / sr);
      out.push(
        <polygon key={`sn${i}`} fill="#ffffff" stroke={INK} strokeWidth={6} strokeLinejoin="round"
          points={`${xl},${py + cap} ${px},${py} ${xr},${py + cap} ${px + (xr - px) * 0.55},${py + cap * 0.62} ${px},${py + cap * 0.95} ${px - (px - xl) * 0.55},${py + cap * 0.62}`} />
      );
    }
    return out;
  };
  return (
    <g>
      {range(150, 230, 120, 0.7, "#9db3d6", "#3a4f86", 190, 120)}
      {range(70, 170, 90, 2.6, "#7d8aa6", "#1d2a55", 120, 90)}
      <path d={`M-100,${y - 20} C150,${y - 70} 380,${y - 10} 600,${y - 40} S950,${y - 80} 1180,${y - 20} L1180,${y + 200} L-100,${y + 200} Z`} fill="#5aa04a" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    </g>
  );
};

const Flowers: React.FC<{ y0: number; y1: number; n?: number; seed?: string; big?: number }> = ({ y0, y1, n = 40, seed = "fl", big = 1 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const t = random(`${seed}y${i}`);
      const y = lerp(y0, y1, t);
      const sc = (0.25 + t * 1.2) * big;
      const c = ["#e8483a", "#ffd84a", "#9a6bd6", "#ffffff"][Math.floor(random(`${seed}c${i}`) * 4)];
      const x = random(`${seed}x${i}`) * 1100 - 20;
      return (
        <g key={i} transform={`translate(${x} ${y}) scale(${sc})`}>
          <rect x={-5} y={0} width={10} height={28} fill="#3f8a32" stroke={INK} strokeWidth={4} />
          <rect x={-17} y={-17} width={34} height={22} fill={c} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        </g>
      );
    })}
  </g>
);

const GREENS = ["#63ad4f", "#6cb957", "#74c25d", "#5ba648", "#7ccb64"];
const Meadow: React.FC<{ y: number; riverX?: number }> = ({ y, riverX = 380 }) => {
  const rows: React.ReactNode[] = [];
  let yy = y;
  let r = 0;
  while (yy < H + 60) {
    const h = 14 + r * 9;
    const w = h * 1.35;
    for (let x = -w; x < W + w; x += w) {
      const key = `${r}${Math.round(x)}`;
      const g = GREENS[Math.floor(random(`mg${key}`) * GREENS.length)];
      rows.push(<rect key={`${key}`} x={x} y={yy} width={w + 1} height={h + 1} fill={g} stroke="#3f8a36" strokeWidth={Math.max(2, h * 0.07)} />);
      const fr = random(`mf${key}`);
      if (fr > 0.84) {
        const c = ["#e8483a", "#ff6b81", "#ffd84a", "#9a6bd6", "#ffffff"][Math.floor(random(`mc${key}`) * 5)];
        const s = Math.max(5, h * 0.36);
        rows.push(<rect key={`f${key}`} x={x + w * 0.3} y={yy + h * 0.15} width={s} height={s} fill={c} stroke={INK} strokeWidth={Math.max(2, h * 0.08)} />);
      } else if (fr < 0.16) {
        // a little inked tuft, like the tick marks the best cartoons scatter over a ground
        const tx = x + w * 0.5, ty = yy + h * 0.6, u = h * 0.28;
        rows.push(<path key={`t${key}`} d={`M${tx - u},${ty} l${u * 0.5},${-u * 1.3} M${tx},${ty} l0,${-u * 1.6} M${tx + u},${ty} l${-u * 0.5},${-u * 1.3}`} stroke={INK} strokeWidth={Math.max(2, h * 0.07)} strokeLinecap="round" fill="none" opacity={0.6} />);
      }
    }
    yy += h;
    r++;
  }
  const rv = `M${riverX},${y + 10} C${riverX - 120},${y + 220} ${riverX + 260},${y + 380} ${riverX - 80},${y + 640} S${riverX - 200},${y + 900} ${riverX - 300},${H + 60}`;
  return (
    <g>
      {rows}
      <path d={rv} fill="none" stroke={INK} strokeWidth={98} strokeLinecap="round" />
      <path d={rv} fill="none" stroke="#3d78d6" strokeWidth={80} strokeLinecap="round" />
      <path d={rv} fill="none" stroke="#5f9cf2" strokeWidth={52} strokeLinecap="round" />
      <path d={rv} fill="none" stroke="#d5e8ff" strokeWidth={10} strokeLinecap="round" opacity={0.8} />
      {[[860, y + 60, 0.5], [120, y + 90, 0.6], [700, y + 40, 0.35], [980, y + 140, 0.8]].map(([tx, ty, ts], i) => (
        <g key={i} transform={`translate(${tx} ${ty}) scale(${ts})`} strokeLinejoin="round" stroke={INK} strokeWidth={9}>
          <rect x={-14} y={-20} width={28} height={90} fill="#6b4724" />
          <rect x={-80} y={-110} width={160} height={100} fill="#3a8f33" />
          <rect x={-50} y={-172} width={100} height={70} fill="#4aa63c" />
        </g>
      ))}
    </g>
  );
};

const Beam: React.FC<{ x0: number; x1: number; tx: number; ty: number; o?: number }> = ({ x0, x1, tx, ty, o = 1 }) => (
  <g opacity={o} style={{ mixBlendMode: "screen" }}>
    <defs>
      <linearGradient id="beamg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff6b0" stopOpacity={0.55} /><stop offset="0.6" stopColor="#fff2a0" stopOpacity={0.75} /><stop offset="1" stopColor="#fff2a0" stopOpacity={0.95} /></linearGradient>
    </defs>
    <polygon points={`${x0 - 80},-100 ${x1 + 60},-100 ${tx + 260},${ty + 340} ${tx - 260},${ty + 340}`} fill="url(#beamg)" opacity={0.55} />
    <polygon points={`${x0},-100 ${x1},-100 ${tx + 150},${ty + 160} ${tx - 150},${ty + 160}`} fill="url(#beamg)" />
    {[0.15, 0.4, 0.62, 0.85].map((u, i) => (
      <polygon key={i} points={`${lerp(x0, x1, u) - 20},-100 ${lerp(x0, x1, u) + 22},-100 ${lerp(tx - 90, tx + 90, u) + 8},${ty + 120} ${lerp(tx - 90, tx + 90, u) - 8},${ty + 120}`} fill="#ffffff" opacity={0.3} />
    ))}
    <circle cx={tx} cy={ty} r={230} fill="#fff6b0" opacity={0.35} />
  </g>
);

/** the glowing treasure in the beam: a little monk (the wise one, cross-legged and calm), bobbing in the light */
const Treasure: React.FC<{ x: number; y: number; k: number; f: number }> = ({ x, y, k, f }) => (
  <g transform={`translate(${x} ${y + Math.sin(f * 0.12) * 12 * k}) scale(${k})`}>
    <circle r={190} fill="#fff6b0" opacity={0.35} />
    <circle r={125} fill="#fff6b0" opacity={0.55} />
    {Array.from({ length: 8 }, (_, i) => (
      <rect key={i} x={-5} y={-230} width={10} height={80} fill="#fff6b0" opacity={0.6} transform={`rotate(${i * 45 + f * 3})`} />
    ))}
    <g transform="scale(1.15)"><Monk f={f} /></g>
  </g>
);

const Cam: React.FC<{ z?: number; cx?: number; cy?: number; r?: number; dx?: number; dy?: number; children: React.ReactNode }> = ({ z = 1, cx = 540, cy = 960, r = 0, dx = 0, dy = 0, children }) => (
  <g transform={`translate(${dx} ${dy}) translate(${cx} ${cy}) rotate(${r}) scale(${z}) translate(${-cx} ${-cy})`}>{children}</g>
);

/* ------------------------------- shot 1: the cave ------------------------------- */

/** the inked furniture of a cave wall: pale pebbles with a thick outline, moss patches, scratch ticks */
const CaveDetail: React.FC = () => (
  <g strokeLinejoin="round" strokeLinecap="round">
    {Array.from({ length: 16 }, (_, i) => {
      const pil = [[340, 100], [580, 130], [840, 170]][i % 3];
      const w = 30 + random(`pbw${i}`) * 40, h = w * (0.6 + random(`pbh${i}`) * 0.4);
      const x = pil[0] + 8 + random(`pbx${i}`) * (pil[1] - w - 16), y = 200 + random(`pby${i}`) * 900;
      return <rect key={i} x={x} y={y} width={w} height={h} rx={w * 0.35} fill="#8a8497" stroke={LINE} strokeWidth={7} opacity={0.9} />;
    })}
    {Array.from({ length: 3 }, (_, i) => {
      const pil = [[340, 100], [580, 130], [840, 170]][i];
      const s = 26 + random(`mss${i}`) * 14, x = pil[0] + 6, y = 60 + random(`msy${i}`) * 500;
      return (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path d={`M0,0 h${s * 2} v${s} h${-s} v${s} h${-s * 1.4} v${-s} h${-s * 0.6} Z`} fill="#5f8a34" stroke={LINE} strokeWidth={6} />
          <path d={`M${s * 0.5},${s * 0.4} l6,-10 M${s * 1.2},${s * 0.5} l5,-9`} stroke={LINE} strokeWidth={4} fill="none" />
        </g>
      );
    })}
    {Array.from({ length: 24 }, (_, i) => {
      const pil = [[340, 100], [580, 130], [840, 170]][i % 3];
      const x = pil[0] + 10 + random(`tkx${i}`) * (pil[1] - 40), y = 120 + random(`tky${i}`) * 1060;
      return <path key={i} d={`M${x},${y} l8,-12 M${x + 14},${y + 2} l4,-10`} stroke={LINE} strokeWidth={4} fill="none" opacity={0.7} />;
    })}
  </g>
);

const LAVA = ["#6a1c14", "#8a2418", "#4d130e", "#7a1e14", "#c0381a"];
const Cave: React.FC<{ f: number }> = ({ f }) => {
  const t = f;
  const lava: React.ReactNode[] = [];
  for (let r = 0; r < 24; r++) for (let c = 0; c < 9; c++) {
    const rr = random(`lv${r}${c}`);
    const x = c * 60 + (r % 2) * 20, y = r * 60;
    if (x > 560 - r * 6) continue;
    lava.push(<rect key={`${r}${c}`} x={x} y={y} width={62} height={62} fill={LAVA[Math.floor(rr * 4)]} stroke="#2a0a08" strokeWidth={3} opacity={0.9 + 0.1 * Math.sin(t * 0.2 + r + c)} />);
  }
  // the voice: DIAMOND on frames 0 and 34 (then 55, 75 in the next shot): arms up and a bounce on each
  const hits = [0, 34];
  const bounce = Math.max(...hits.map((h) => (t >= h && t < h + 10 ? Math.sin(((t - h) / 10) * Math.PI) : 0)));
  const shout = hits.some((h) => t >= h && t < h + 14);
  // the arms rise and fall on a curve instead of snapping between two poses
  const shoutK = Math.max(...hits.map((h) => ease(t, h - 2, h + 3) * (1 - ease(t, h + 9, h + 17))));
  // the straw-hat guy walks up to the camera
  const walk = sm(t, 22, 54);
  const ox = lerp(690, 800, walk), oy = lerp(1214, 1380, walk) - shoutK * 12, os = lerp(0.68, 1.05, walk);
  const step = walk > 0 && walk < 1 ? Math.sin(t * 0.8) * 24 : 0;
  const up = { ...POSE.stand, armR: limb(90, 40, 150, 20), armL: limb(-90, 40, -150, 20) };
  const down = stand({ legL: limb(-40, 190 + step * 0.2, -46 - step, 335), legR: limb(40, 190 - step * 0.2, 46 + step, 335), armR: limb(80, 70, 118 + step * 0.4, 150), armL: limb(-80, 70, -116, 150) });
  const capDown = stand({ armL: limb(-60, 60, -100, 138), armR: limb(60, 60, 110, 130) });
  const capUp = { ...POSE.stand, armR: limb(80, 40, 120, -60), armL: limb(-80, 40, -120, -60) };
  const capPose = lerpPose(capDown, capUp, shoutK);
  return (
    <Cam z={lerp(1, 1.1, t / 56)} cx={540} cy={1200}>
      <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#1b1124" />
      <rect x={-100} y={-100} width={560} height={1500} fill="#7a1c14" />
      {lava}
      <rect x={-100} y={-100} width={760} height={1500} fill="#ff6a1a" opacity={0.12 + 0.05 * Math.sin(t * 0.3)} />
      {[[330, 120, 1260], [560, 160, 1260], [820, 200, 1260]].map(([x, w, h], i) => (
        <g key={i}>
          <rect x={x} y={1260 - h} width={w} height={h} fill={i % 2 ? "#241830" : "#2d2038"} stroke={LINE} strokeWidth={7} />
          <rect x={x} y={1260 - h} width={14} height={h} fill="#ff8a24" opacity={0.25} />
        </g>
      ))}
      <rect x={-100} y={1190} width={W + 200} height={90} fill="#3a2c4a" stroke={LINE} strokeWidth={7} />
      <rect x={-100} y={1190} width={W + 200} height={18} fill="#5a4a72" />
      <rect x={-100} y={1280} width={W + 200} height={700} fill="#241830" />
      <CaveDetail />
      {Array.from({ length: 16 }, (_, i) => {
        const u = ((t * 0.02 + random(`em${i}`)) % 1);
        return <rect key={i} x={60 + random(`ex${i}`) * 500 + Math.sin(u * 8 + i) * 20} y={1180 - u * 900} width={10} height={10} fill="#ffb347" opacity={1 - u} />;
      })}
      <Cap x={290} y={1216 - bounce * 8} s={0.68} p={capPose} face={shout ? "joy" : "grin"} gaze={[10, 2]} idle={t} />
      <Straw x={ox} y={oy} s={os} p={lerpPose(down, up, shoutK)} face={shout ? "joy" : "grin"} gaze={[-14, 4]} idle={t} />
      {/* the ore in front: a tall pillar and a big block */}
      {[0, 1].map((i) => <Ore key={i} x={-70} y={880 + i * 290} s={300} />)}
      <polygon points="-120,1500 1200,1500 1260,1620 -180,1620" fill="#4a52a8" stroke={LINE} strokeWidth={8} />
      {[0, 1, 2, 3].map((i) => <Ore key={i} x={-120 + i * 330} y={1620} s={330} />)}
      <ellipse cx={540} cy={1840} rx={760} ry={230} fill="#2a5bd6" opacity={0.13} />
    </Cam>
  );
};

/* ------------------------------- shot 2: mining ------------------------------- */

const Mine: React.FC<{ f: number }> = ({ f }) => {
  const t = f;
  const swing = (Math.sin(t * 0.46 - 1.2) + 1) / 2;
  const pose: Pose = lerpPose(POSE.holdPick, POSE.mine, swing);
  const shout = (t >= 0 && t < 9) || (t >= 19 && t < 28);
  return (
    <Cam z={lerp(1.04, 1, t / 44)} dx={Math.sin(t * 0.8) * 4}>
      <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#0c0c2a" />
      {/* steps of ore up the back wall */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Ore x={640 + i * 140} y={520 + i * 200} s={340} />
          <rect x={640 + i * 140} y={520 + i * 200} width={340} height={340} fill="#000" opacity={0.25 + i * 0.1} />
        </g>
      ))}
      {/* the floor of ore */}
      {Array.from({ length: 4 }, (_, r) => Array.from({ length: 4 }, (_, c) => (
        <g key={`${r}${c}`} opacity={0.9}><Ore x={-110 + c * 330 + (r % 2) * 90} y={1000 + r * 250} s={330} /></g>
      )))}
      <rect x={-100} y={900} width={W + 200} height={1100} fill="#0a0a30" opacity={0.35} />
      {/* the straw-hat guy from behind, swinging */}
      <Straw back x={430} y={1560} s={1.05} p={pose} face="back" tilt={swing * 4 - 2} idle={t} hands={(h) => pickInHand(h.R, -20 - swing * 10, 1.1)} />
      {shout && <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#1a2cff" opacity={0.08} />}
    </Cam>
  );
};

/* ------------------------------- shot 3: breaking through ------------------------------- */

/** Speed swings at the tunnel wall: a crack on the first hit, the wall bursts on the second and daylight floods in */
const HIT1 = 4, HIT2 = 24;
const Breakthrough: React.FC<{ f: number }> = ({ f }) => {
  const t = f;
  const hitOf = (h: number) => {
    const k = ease(t, h - 9, h - 3) * (1 - ease(t, h - 3, h)) + ease(t, h - 3, h) * (1 - ease(t, h, h + 9));
    return k; // 0 away, 1 wound up, then struck and recoiling
  };
  const wind = Math.max(hitOf(HIT1) * (t < HIT1 + 9 ? 1 : 0), hitOf(HIT2));
  const striking = (t >= HIT1 - 3 && t < HIT1 + 6) || (t >= HIT2 - 3 && t < HIT2 + 6);
  const sx = Math.sin(t * 7) * (t >= HIT1 && t < HIT1 + 8 ? 14 : t >= HIT2 && t < HIT2 + 10 ? 26 : 0);
  const sy = Math.cos(t * 6) * (t >= HIT1 && t < HIT1 + 8 ? 10 : t >= HIT2 && t < HIT2 + 10 ? 20 : 0);
  const stage = t < HIT1 ? -1 : t < HIT2 - 6 ? 2 : t < HIT2 - 3 ? 4 : t < HIT2 ? 5 : -1;
  const hole = ease(t, HIT2, HIT2 + 14);
  const pickPose = striking ? { x: 1090, y: 1510, r: 0 } : { x: lerp(1300, 1200, wind), y: lerp(2000, 1720, wind), r: lerp(25, 15, wind) };
  return (
    <g>
      <Cam z={lerp(1, 1.06, t / 40)} dx={sx} dy={sy}>
        <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#2b2b33" />
        {Array.from({ length: 5 }, (_, r) => Array.from({ length: 3 }, (_, c) => (
          <g key={`${r}${c}`}>
            <image href={STONE} x={-130 + c * 400 + (r % 2) * 130} y={-60 + r * 400} width={400} height={400} style={PX} />
            <rect x={-130 + c * 400 + (r % 2) * 130} y={-60 + r * 400} width={400} height={400} fill="none" stroke={LINE} strokeWidth={8} />
          </g>
        )))}
        <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#000" opacity={0.35} />
        {stage >= 0 && <image href={BREAKS[stage]} x={90} y={420} width={900} height={900} style={PX} />}
        {/* the hole: daylight pouring through */}
        {hole > 0 && (
          <g>
            <circle cx={540} cy={960} r={hole * 1100} fill="#fff7c8" />
            <circle cx={540} cy={960} r={hole * 900} fill="#bfe4ff" />
            <circle cx={540} cy={960} r={hole * 560} fill="#eaf6ff" />
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x={540 - 14} y={960 - hole * 1000} width={28} height={hole * 700} fill="#ffffff" opacity={0.35} transform={`rotate(${i * 30} 540 960)`} />
            ))}
          </g>
        )}
        {/* chips of stone flying out of the break */}
        {t >= HIT2 && t < HIT2 + 16 && Array.from({ length: 22 }, (_, i) => {
          const a = random(`bt${i}`) * Math.PI * 2, v = 18 + random(`bv${i}`) * 34, d = t - HIT2;
          return <rect key={i} x={540 + Math.cos(a) * v * d} y={960 + Math.sin(a) * v * d + d * d * 2} width={46} height={46} fill={i % 2 ? "#8d8d96" : "#6c6c76"} stroke={LINE} strokeWidth={5} />;
        })}
      </Cam>
      <g transform={`translate(${pickPose.x} ${pickPose.y}) rotate(${pickPose.r}) scale(2.5) translate(-295 -325)`}>
        <image href={PICK} x={0} y={0} width={360} height={360} style={PX} transform="translate(360 0) scale(-1 1)" />
      </g>
    </g>
  );
};

/* ------------------------------- the meadow shots ------------------------------- */

const SunMeadow: React.FC<{ f: number; k: number; drift: number }> = ({ f, k, drift }) => (
  <Cam z={k} cx={540} cy={920} dx={drift}>
    <g><Sky f={f} horizon={1300} /></g>
    <Beam x0={500} x1={1020} tx={540} ty={960} />
    <g><Mountains y={1180} k={2} /></g>
    <Meadow y={1170} />
    <Treasure x={540} y={960} k={1} f={f} />
  </Cam>
);

const MeadowBack: React.FC<{ f: number; z?: number; dx?: number }> = ({ f, z = 1, dx = 0 }) => (
  <Cam z={z} cx={540} cy={1000} dx={dx}>
    <g><Sky f={f} horizon={1100} /></g>
    <g><Mountains y={1060} k={1.7} /></g>
    <Meadow y={1050} riverX={230} />
  </Cam>
);

/* shot 5: he meets the meadow, a lapis in his raised fist */
const Hero: React.FC<{ f: number }> = ({ f }) => {
  const t = f;
  const turn = sm(t, 28, 40);
  const arms = sm(t, 36, 50);
  const p = lerpPose({ ...POSE.stand, armL: limb(-110, 60, -190, 40), armR: limb(90, 90, 70, 190) }, { ...POSE.out, armL: limb(-132, 32, -240, -10), armR: limb(132, 32, 250, -10) }, arms);
  return (
    <g>
      <MeadowBack f={f} z={lerp(1, 1.06, t / 65)} />
      <g>
        {[[120, 1560], [60, 1700], [240, 1830]].map(([x, y], i) => <Poppy key={i} x={x} y={y} px={26} />)}
      </g>
      <Cam z={1} dx={lerp(0, -20, turn)}>
        <Straw x={700} y={2250} s={2.1} p={p} face={t < 28 ? "surprised" : "shocked"} gaze={[lerp(-22, 12, turn), 0]} idle={t} hands={(h) => (
          <g transform={`translate(${h.L[0]} ${h.L[1]}) rotate(-12)`}>
            <image href={ORE} x={-40} y={-90} width={90} height={90} style={PX} />
            <rect x={-40} y={-90} width={90} height={90} fill="none" stroke={LINE} strokeWidth={7} />
          </g>
        )} />
      </Cam>
    </g>
  );
};

/* shot 6: the temple */
const Temple: React.FC<{ f: number }> = ({ f }) => {
  const t = f;
  const cols = Array.from({ length: 11 }, (_, i) => 90 + i * 90);
  return (
    <Cam z={lerp(1, 1.1, t / 32)} cx={540} cy={1000}>
      <g><Sky f={f} horizon={1150} /></g>
      <g><Mountains y={900} k={0.7} /></g>
      <rect x={-100} y={950} width={W + 200} height={1100} fill="#5fb04a" stroke={LINE} strokeWidth={6} />
      <g stroke={LINE} strokeWidth={6} strokeLinejoin="round">
        <polygon points="60,830 540,640 1020,830" fill="#f4efe6" />
        <polygon points="130,825 540,670 950,825" fill="#e6dfd0" />
        {[[360, 770], [540, 730], [720, 770]].map(([x, y], i) => <rect key={i} x={x - 14} y={y - 20} width={28} height={36} fill="#d8b24a" />)}
        <rect x={70} y={830} width={940} height={60} fill="#f4efe6" />
        {cols.map((x, i) => <rect key={i} x={x - 22} y={890} width={44} height={240} fill="#fbf8f0" />)}
        {cols.map((x, i) => <path key={`s${i}`} d={`M${x + 4},895 V1125`} stroke="#d9d2c2" strokeWidth={8} fill="none" />)}
        <rect x={50} y={1130} width={980} height={42} fill="#f4efe6" />
        <rect x={20} y={1172} width={1040} height={42} fill="#ece6d8" />
        <rect x={-10} y={1214} width={1100} height={42} fill="#e4ddcc" />
      </g>
      <Flowers y0={1260} y1={1880} n={110} seed="tp" big={1.3} />
      {/* the two of them, small, in the flowers, looking up at it */}
      <Cap back x={200} y={1830} s={0.4} p={stand({ armL: limb(-60, 60, -80, 140), armR: limb(60, 60, 80, 140) })} face="back" idle={t} />
      <Straw back x={320} y={1850} s={0.4} p={stand({ armL: limb(-60, 60, -80, 140), armR: limb(60, 60, 80, 140) })} face="back" idle={t + 9} />
    </Cam>
  );
};

/* shot 7: the shock */
const Shock: React.FC<{ f: number }> = ({ f }) => {
  const t = f;
  const jx = Math.sin(t * 5.2) * 10, jy = Math.cos(t * 4.4) * 8;
  const arms = sm(t, 0, 8);
  const p = lerpPose({ ...POSE.stand }, { ...POSE.out, armL: limb(-132, 32, -240, 30), armR: limb(132, 32, 250, 30) }, arms);
  return (
    <g>
      <MeadowBack f={f} z={1.1} />
      <Cam dx={jx} dy={jy}>
        <Straw x={560} y={2300} s={2.3} p={p} face="scream" gaze={[0, -6]} tilt={Math.sin(t * 0.9) * 3} idle={t} />
      </Cam>
    </g>
  );
};

/* shot 9: crowned in laurel: the wise one, thinking it over, in a toga */
const Crowned: React.FC<{ f: number }> = ({ f }) => {
  const t = f;
  const sway = Math.sin(t * 0.05) * 3;
  return (
    <g>
      <Cam z={1.18} cx={540} cy={1000}>
        <Sky f={f} horizon={1100} />
        <Mountains y={1110} k={1.1} />
        <rect x={-100} y={1110} width={W + 200} height={900} fill="#c9a24a" />
        <rect x={-100} y={1110} width={W + 200} height={140} fill="#e6c870" />
      </Cam>
      <Cam r={sway} cx={460} cy={1500} z={lerp(1, 1.04, t / 61)}>
        <Wise x={460} y={2640} s={3.1} p={POSE.stand} face={t < 25 ? "calm" : "content"} gaze={[0, -4]} tilt={-4} idle={t} />
      </Cam>
    </g>
  );
};

/* ------------------------------- the subtitle bar ------------------------------- */

const SubBar: React.FC<{ f: number }> = ({ f }) => {
  const s = B.subs.find(([a, b]) => f >= (a as number) && f < (b as number));
  if (!s) return null;
  const text = s[2] as string;
  const size = 46;
  const w = text.length * size * 0.62 + 70;
  return (
    <g>
      <rect x={540 - w / 2} y={1380} width={w} height={84} fill="#000000" opacity={0.55} />
      <text x={540} y={1380 + 56} textAnchor="middle" fontFamily={MONO} fontSize={size} fill="#ffffff">{text}</text>
    </g>
  );
};

/* ------------------------------- assembly ------------------------------- */

const shotAt = (f: number) => {
  const c = B.cuts;
  for (let i = 0; i < c.length - 1; i++) if (f >= c[i] && f < c[i + 1]) return { i, t: f - c[i], len: c[i + 1] - c[i] };
  return { i: 8, t: 0, len: 1 };
};

const ShotBody: React.FC<{ i: number; t: number; len: number; f: number }> = ({ i, t, len, f }) => {
  switch (i) {
    case 0: return <Cave f={t} />;
    case 1: return <Mine f={t} />;
    case 2: return <Breakthrough f={t} />;
    case 3: return <SunMeadow f={f} k={lerp(1, 1.12, t / len)} drift={0} />;
    case 4: return <Hero f={t} />;
    case 5: return <Temple f={t} />;
    case 6: return <Shock f={t} />;
    case 7: return <SunMeadow f={f} k={lerp(1.15, 1.5, t / len)} drift={0} />;
    default: return <Crowned f={t} />;
  }
};

/** one shot, on its own clock, with motion blur: the shutter never straddles a cut */
const Shot: React.FC<{ i: number }> = ({ i }) => {
  const t = Math.max(0, useCurrentFrame());
  const len = B.cuts[i + 1] - B.cuts[i];
  return <Svg sun={i >= 3 ? 0.35 : 0.1}><ShotBody i={i} t={t} len={len} f={t + B.cuts[i]} /></Svg>;
};

/** hold the render until every picture is cached, so no frame is missing a sprite */
const usePreload = () => {
  const [handle] = React.useState(() => delayRender("loading the textures"));
  React.useEffect(() => {
    const urls = [ORE, STONE, PICK, ...BREAKS];
    Promise.all(urls.map((u) => new Promise<void>((r) => { const im = new window.Image(); im.onload = () => r(); im.onerror = () => r(); im.src = u; }))).then(() => continueRender(handle));
  }, [handle]);
};

export const LaPeaceShort: React.FC<{ audio?: string | null; captions?: boolean; blur?: boolean }> = ({ audio = null, captions = true, blur = true }) => {
  loadMinecraftFonts();
  usePreload();
  const f = useCurrentFrame();
  const shots = B.cuts.slice(0, -1).map((c, i) => (
    <Sequence key={i} from={c} durationInFrames={B.cuts[i + 1] - c} layout="none">
      {blur ? <CameraMotionBlur shutterAngle={180} samples={5}><Shot i={i} /></CameraMotionBlur> : <Shot i={i} />}
    </Sequence>
  ));
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {audio && <Audio src={staticFile(audio)} />}
      {shots}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {captions && <SubBar f={f} />}
      </svg>
    </AbsoluteFill>
  );
};

export const LaPeaceThumb: React.FC = () => {
  usePreload();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Svg sun={0.35}><ShotBody i={3} t={30} len={45} f={170} /></Svg>
    </AbsoluteFill>
  );
};
