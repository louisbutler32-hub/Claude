import React from "react";
import { H, INK, W } from "../common";
import { Part, smooth } from "../bowling/characters";
import { Food, KINDS } from "./food";
import { Olive } from "./food";
import { clamp, P, rnd, Steam } from "./fx";

/**
 * The restaurant, laid out for the 1080x1920 wide shot: warm striped wall with a
 * red wainscot, the front door on the left, the ALL YOU CAN EAT sign up top,
 * a long counter with six steaming trays behind a sneeze-guard, red-and-cream
 * floor. Split in two layers so a character can stand BEHIND the counter:
 * RestBG (wall/door/sign/floor) then <actors> then CounterFG then front actors.
 */

export const FLOOR_Y = 1290;
export const TOP_Y = 1062;
export const CX0 = 330, CX1 = 1090;
export const TRAY_W = (CX1 - CX0) / 6;
export const trayX = (i: number) => CX0 + TRAY_W * (i + 0.5);
export const SIGN_C: P = [690, 360];

/* ---------------------------------- the sign ---------------------------------- */

export type SignState = { flip?: number; smile?: number; ast?: number; fine?: number; sweat?: number };

export const Sign: React.FC<{ cx?: number; cy?: number; s?: number; st?: SignState; swing?: number; chains?: boolean }> = ({ cx = SIGN_C[0], cy = SIGN_C[1], s = 1, st = {}, swing = 0, chains = true }) => {
  const { flip = 0, smile = 1, ast = 0, fine = 0, sweat = 0 } = st;
  const sx = Math.max(0.04, Math.abs(Math.cos(flip * Math.PI)));
  const back = flip > 0.5;
  const mouth = (() => {
    // smile 1 = big grin, 0 = flat line, below = a tiny wobble
    const c = 8 + 18 * smile;
    return `M-20,${14 - 2 * smile} Q0,${14 + c} 20,${14 - 2 * smile}`;
  })();
  return (
    <g transform={`translate(${cx},${cy}) rotate(${swing}) scale(${s})`}>
      {chains && (
        <g stroke={INK} strokeWidth={6} strokeLinecap="round">
          <path d={`M${-250 * sx},-96 L${-250 * sx - 30},-420`} />
          <path d={`M${250 * sx},-96 L${250 * sx + 30},-420`} />
        </g>
      )}
      <g transform={`scale(${sx},1)`}>
        {!back ? (
          <>
            <Part d={smooth([[-350, -95], [350, -95], [350, 95], [-350, 95]], true, 0.08)} fill="#c8342a" shade="#8e1f18" lw={6} sh={[-6, -7]}>
              <rect x={-334} y={-80} width={668} height={160} rx={12} fill="none" stroke="#ffe9b0" strokeWidth={5} />
            </Part>
            <text x={-20} y={4} textAnchor="middle" fontFamily="Poppins Black" fontSize={60} fill="#ffe27a" stroke="#6e1810" strokeWidth={9} paintOrder="stroke" strokeLinejoin="round">ALL YOU CAN EAT</text>
            <text x={-20} y={60} textAnchor="middle" fontFamily="Poppins Black" fontSize={40} fill="#ffffff" stroke="#6e1810" strokeWidth={7} paintOrder="stroke" strokeLinejoin="round">- 20 BERRIES -</text>
            {/* the sign's own cheerful face */}
            <g transform="translate(300,-78)">
              <circle r={50} fill="#ffd43b" stroke={INK} strokeWidth={6} />
              <ellipse cx={-17} cy={-10} rx={6} ry={10} fill={INK} />
              <ellipse cx={17} cy={-10} rx={6} ry={10} fill={INK} />
              <path d={mouth} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
              {smile < 0.5 && <path d="M-34,-24 L-8,-16 M34,-24 L8,-16" stroke={INK} strokeWidth={5} strokeLinecap="round" />}
              {sweat > 0 && <g transform={`translate(${46},${-20 + sweat * 26})`}><path d="M0,-22 Q15,0 13,10 Q11,22 0,22 Q-11,22 -13,10 Q-15,0 0,-22Z" fill="#8fd8ff" stroke={INK} strokeWidth={4} /></g>}
            </g>
          </>
        ) : (
          <>
            <Part d={smooth([[-350, -95], [350, -95], [350, 95], [-350, 95]], true, 0.08)} fill="#f4ead0" shade="#cbbf9a" lw={6} sh={[-6, -7]} />
            <text x={-34} y={22} textAnchor="middle" fontFamily="Poppins Black" fontSize={64} fill="#c8342a" stroke="#6e1810" strokeWidth={0} letterSpacing={1}>ALL YOU CAN EAT</text>
            <Asterisk x={322} y={-6} k={ast} />
            <FinePrint x={-326} y={72} k={fine} />
          </>
        )}
      </g>
    </g>
  );
};

/** a big hand-scribbled marker asterisk that draws itself in */
export const Asterisk: React.FC<{ x: number; y: number; k: number; size?: number }> = ({ x, y, k, size = 1 }) => {
  if (k <= 0) return null;
  const R = 34 * size;
  return (
    <g stroke="#1a1a1a" strokeWidth={10 * size} strokeLinecap="round" fill="none">
      {[-90, -30, 30].map((deg, i) => {
        const p = clamp(k * 3 - i);
        if (p <= 0) return null;
        const a = (deg * Math.PI) / 180, c = Math.cos(a), sn = Math.sin(a);
        const sx = x - c * R, sy = y - sn * R;
        return <path key={i} d={`M${sx},${sy} L${sx + c * 2 * R * p},${sy + sn * 2 * R * p}`} />;
      })}
    </g>
  );
};

export const FinePrint: React.FC<{ x: number; y: number; k: number; size?: number }> = ({ x, y, k, size = 1 }) => {
  if (k <= 0) return null;
  const id = "fine" + Math.round(size * 10);
  return (
    <g>
      <defs><clipPath id={id}><rect x={x - 6} y={y - 40 * size} width={290 * size * clamp(k)} height={60 * size} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <text x={x} y={y} fontFamily="Poppins Black" fontSize={30 * size} fill="#1a1a1a" letterSpacing={1}>*NOT LUFFY</text>
      </g>
    </g>
  );
};

/* ----------------------------------- the door ----------------------------------- */

export const Door: React.FC<{ open?: number }> = ({ open = 0 }) => {
  const X0 = 30, X1 = 300, Y0 = 480;
  const a = clamp(open) * 1.35; // radians
  const fx2 = X0 + (X1 - X0) * Math.cos(a), grow = Math.sin(a) * 0.22;
  const yt = Y0 - (FLOOR_Y - Y0) * grow * 0.5, yb = FLOOR_Y + (FLOOR_Y - Y0) * grow * 0.12;
  return (
    <g>
      <rect x={X0 - 14} y={Y0 - 14} width={X1 - X0 + 28} height={FLOOR_Y - Y0 + 14} fill="#4a2e1a" stroke={INK} strokeWidth={6} />
      {/* what is outside */}
      <rect x={X0} y={Y0} width={X1 - X0} height={FLOOR_Y - Y0} fill={open > 0 ? "#fff6c8" : "#9fd4f0"} />
      {open > 0 && (
        <g>
          <rect x={X0} y={Y0} width={X1 - X0} height={500} fill="#bfe6ff" />
          <circle cx={170} cy={Y0 + 190} r={70} fill="#fff9d6" />
          <path d={`M${X0},${FLOOR_Y} L${X0},${FLOOR_Y - 130} Q150,${FLOOR_Y - 200} ${X1},${FLOOR_Y - 120} L${X1},${FLOOR_Y}Z`} fill="#8fcf6a" />
          {open > 0.2 && Array.from({ length: 9 }, (_, i) => <path key={i} d={`M170,${Y0 + 190} L${170 + Math.cos(i * 0.7) * 400},${Y0 + 190 + Math.sin(i * 0.7) * 400}`} stroke="#fff9d6" strokeWidth={14} opacity={0.35} />)}
        </g>
      )}
      {/* the panel, hinged on the left, swinging in toward us */}
      <Part d={`M${X0},${Y0} L${fx2},${yt} L${fx2},${yb} L${X0},${FLOOR_Y}Z`} fill="#8a5a34" shade="#5e3a1e" lw={6} sh={[-10, 0]}>
        {open < 0.05 && (
          <>
            <rect x={X0 + 36} y={Y0 + 50} width={X1 - X0 - 72} height={260} rx={8} fill="#bfe6ff" stroke={INK} strokeWidth={6} />
            <path d={`M${X0 + 56},${Y0 + 230} l70,-110 M${X0 + 100},${Y0 + 270} l90,-140`} stroke="#fff" strokeWidth={9} strokeLinecap="round" opacity={0.85} />
            <rect x={X0 + 36} y={Y0 + 380} width={X1 - X0 - 72} height={340} rx={8} fill="none" stroke="#5e3a1e" strokeWidth={8} />
            <circle cx={X1 - 40} cy={Y0 + 520} r={13} fill="#f2c230" stroke={INK} strokeWidth={4} />
          </>
        )}
      </Part>
      {open < 0.05 && (
        <g transform="translate(165,640) rotate(-4)">
          <path d="M0,-70 L0,-30" stroke={INK} strokeWidth={4} />
          <Part d="M-62,-30 L62,-30 L62,32 L-62,32Z" fill="#f4ead0" shade="#cbbf9a" lw={5} />
          <text x={0} y={12} textAnchor="middle" fontFamily="Poppins Black" fontSize={38} fill="#2a8a3a">OPEN</text>
        </g>
      )}
    </g>
  );
};

/* ----------------------------------- the room ----------------------------------- */

export const RestBG: React.FC<{ wreck?: number; door?: number; sign?: SignState; swing?: number; t?: number; noSign?: boolean }> = ({ wreck = 0, door = 0, sign, swing = 0, noSign }) => {
  // checkered floor in perspective
  const floor: string[] = [];
  for (let r = 0; r < 14; r++) {
    const y0 = FLOOR_Y + Math.pow(r / 10, 1.6) * 760, y1 = FLOOR_Y + Math.pow((r + 1) / 10, 1.6) * 760;
    const k0 = 1 + r * 0.25, k1 = 1 + (r + 1) * 0.25;
    for (let c = -10; c < 10; c++) if ((r + c) % 2 === 0) {
      const xa = 540 + c * 90 * k0, xb = 540 + (c + 1) * 90 * k0, xc = 540 + (c + 1) * 90 * k1, xd = 540 + c * 90 * k1;
      floor.push(`M${xa},${y0}L${xb},${y0}L${xc},${y1}L${xd},${y1}Z`);
    }
  }
  const stripes: string[] = [];
  for (let x = -720; x < 1800; x += 120) stripes.push(`M${x},-400h60v1700h-60Z`);
  return (
    <g>
      <rect x={-800} y={-500} width={2700} height={FLOOR_Y + 500} fill="#f6e3b8" />
      <path d={stripes.join("")} fill="#efd49c" />
      {/* wainscot */}
      <rect x={-800} y={1130} width={2700} height={FLOOR_Y - 1130} fill="#b3392b" />
      <rect x={-800} y={1118} width={2700} height={16} fill="#fff4dc" stroke={INK} strokeWidth={4} />
      <path d={Array.from({ length: 30 }, (_, i) => `M${-800 + i * 100},1140 v${FLOOR_Y - 1140}`).join("")} stroke="#8e2a20" strokeWidth={5} />
      {/* pendant lamps */}
      {[420, 720, 1020].map((x) => (
        <g key={x}>
          <path d={`M${x},-200 L${x},70`} stroke={INK} strokeWidth={5} />
          <circle cx={x} cy={150} r={90} fill="#ffe9a0" opacity={0.28} />
          <Part d={`M${x - 70},130 Q${x - 60},64 ${x},58 Q${x + 60},64 ${x + 70},130Z`} fill="#d8262c" shade="#9e1420" lw={5} />
          <ellipse cx={x} cy={134} rx={32} ry={9} fill="#fff6c0" stroke={INK} strokeWidth={3} />
        </g>
      ))}
      <Door open={door} />
      {!noSign && <Sign st={sign} swing={swing} />}
      {/* floor */}
      <rect x={-800} y={FLOOR_Y} width={2700} height={1500} fill="#f3e8d0" />
      <path d={floor.join("")} fill="#c8362c" />
      <rect x={-800} y={FLOOR_Y - 4} width={2700} height={10} fill={INK} />
      {wreck > 0 && <Wreck k={wreck} />}
    </g>
  );
};

/** food splats on the wall, scorch marks, cracked tile, debris on the floor */
export const Wreck: React.FC<{ k: number }> = ({ k }) => {
  const splat = (x: number, y: number, r: number, c: string, i: number) => (
    <g key={i}>
      <circle cx={x} cy={y} r={r} fill={c} stroke={INK} strokeWidth={4} />
      {Array.from({ length: 6 }, (_, j) => { const a = rnd(j, i) * 6.28; return <circle key={j} cx={x + Math.cos(a) * r * 1.5} cy={y + Math.sin(a) * r * 1.5} r={r * 0.22} fill={c} />; })}
    </g>
  );
  return (
    <g opacity={clamp(k * 1.5)}>
      {[[480, 700, 34, "#8a3510"], [840, 820, 26, "#e0b040"], [380, 900, 22, "#c8362c"], [1010, 640, 30, "#8a3510"], [620, 960, 20, "#6aa83a"]].map(([x, y, r, c], i) => splat(x as number, y as number, r as number, c as string, i))}
      {k > 0.5 && <path d="M560,520 L600,600 L570,650 L630,720 M600,600 L680,610" stroke={INK} strokeWidth={5} fill="none" strokeLinejoin="round" />}
      {/* floor debris */}
      {[[460, 1420, 1], [700, 1500, -1], [860, 1380, 1], [260, 1560, -1], [960, 1560, 1]].map(([x, y, d], i) => (
        <g key={i} transform={`translate(${x},${y}) rotate(${(d as number) * 18})`}>
          <path d="M-34,0 L-10,-16 L8,-4 L30,-14 L26,10 L-8,16Z" fill="#fbf8f0" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        </g>
      ))}
    </g>
  );
};

/* ---------------------------------- the counter ---------------------------------- */

export type TrayState = "full" | "empty";

const Pan: React.FC<{ x: number; empty: boolean; olive?: boolean }> = ({ x, empty, olive }) => {
  const w = TRAY_W - 10;
  return (
    <g transform={`translate(${x},${TOP_Y})`}>
      {/* back rim + inside */}
      <Part d={`M${-w / 2},-34 a${w / 2},9 0 1 1 ${w},0 a${w / 2},9 0 1 1 ${-w},0Z`} fill={empty ? "#e8ecf2" : "#6a7284"} shade={empty ? "#b8c0cc" : "#4a5264"} lw={4} sh={[0, 3]} />
      {empty && <path d={`M${-w / 2 + 14},-36 Q0,-26 ${w / 2 - 14},-36`} stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.9} />}
      {olive && <Olive x={12} y={-28} s={0.9} lw={4} />}
    </g>
  );
};
const PanFront: React.FC<{ x: number }> = ({ x }) => {
  const w = TRAY_W - 10;
  return (
    <g transform={`translate(${x},${TOP_Y})`}>
      <Part d={smooth([[-w / 2, -34], [w / 2, -34], [w / 2 - 8, 0], [-w / 2 + 8, 0]], true, 0.05)} fill="#c9cfda" shade="#8a92a4" lw={4.5} sh={[-5, -4]}>
        <path d={`M${-w / 2 + 8},-26 L${w / 2 - 8},-26`} stroke="#fff" strokeWidth={5} opacity={0.7} strokeLinecap="round" />
      </Part>
    </g>
  );
};

export const CounterFG: React.FC<{ trays?: TrayState[]; t?: number; wreck?: number; olive?: boolean; hide?: number[]; glass?: boolean }> = ({ trays = [], t = 0, wreck = 0, olive = false, hide = [], glass = true }) => (
  <g>
    {/* counter body */}
    <Part d={`M${CX0 - 10},${TOP_Y} L${CX1 + 40},${TOP_Y} L${CX1 + 40},${FLOOR_Y} L${CX0 - 10},${FLOOR_Y}Z`} fill="#b3392b" shade="#7e2218" lw={6} sh={[-8, 0]}>
      <path d={`M${CX0},${TOP_Y + 50} L${CX1 + 40},${TOP_Y + 50}`} stroke="#fff4dc" strokeWidth={10} />
      {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${CX0 + 20 + i * 125},${TOP_Y + 70} v${FLOOR_Y - TOP_Y - 80}`} stroke="#7e2218" strokeWidth={6} />)}
    </Part>
    {/* trays: pan back, food, pan front */}
    {KINDS.map((k, i) => {
      const empty = (trays[i] ?? "full") === "empty";
      return (
        <g key={k}>
          <Pan x={trayX(i)} empty={empty} olive={olive && i === 4} />
          {!empty && !hide.includes(i) && <Food kind={k} x={trayX(i)} y={TOP_Y - 30} s={TRAY_W / 140} lw={4} />}
          {!empty && <Steam x={trayX(i)} y={TOP_Y - 130} t={t + i * 5} n={2} h={90} w={10} />}
          <PanFront x={trayX(i)} />
        </g>
      );
    })}
    <Part d={`M${CX0 - 24},${TOP_Y - 2} L${CX1 + 50},${TOP_Y - 2} L${CX1 + 50},${TOP_Y + 20} L${CX0 - 24},${TOP_Y + 20}Z`} fill="#ece0c4" shade="#bfb08a" lw={5} sh={[0, -4]} />
    {/* sneeze guard */}
    {glass && (
      <g>
        <path d={`M${CX0 - 8},${TOP_Y} L${CX0 - 8},850 M${CX1 + 20},${TOP_Y} L${CX1 + 20},850`} stroke="#8a92a4" strokeWidth={12} />
        <path d={`M${CX0 - 8},${TOP_Y} L${CX0 - 8},850 M${CX1 + 20},${TOP_Y} L${CX1 + 20},850`} stroke={INK} strokeWidth={4} />
        <path d={`M${CX0 - 8},880 L${CX1 + 20},880 L${CX1 + 20},1000 L${CX0 - 8},1000Z`} fill="#dff4ff" opacity={0.2} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${CX0 + 80 + i * 260},884 l-60,112 M${CX0 + 120 + i * 260},884 l-40,112`} stroke="#ffffff" strokeWidth={9} opacity={0.5} strokeLinecap="round" />)}
        <rect x={CX0 - 12} y={866} width={CX1 - CX0 + 36} height={18} rx={5} fill="#c9cfda" stroke={INK} strokeWidth={5} />
        <rect x={CX0 - 12} y={996} width={CX1 - CX0 + 36} height={8} rx={4} fill="#c9cfda" stroke={INK} strokeWidth={4} />
      </g>
    )}
  </g>
);

/* ---------------------------------- dirty plates ---------------------------------- */

const SAUCE = ["#8a3510", "#c8362c", "#6aa83a", "#e0b040"];

export const Plate: React.FC<{ x: number; y: number; rx?: number; dirt?: number; seed?: number; rot?: number }> = ({ x, y, rx = 105, dirt = 1, seed = 1, rot = 0 }) => {
  const ry = rx * 0.2;
  const sw = Math.min(5, rx * 0.055);
  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`}>
      <ellipse cx={0} cy={5} rx={rx} ry={ry} fill="#c8ccd4" stroke={INK} strokeWidth={sw} />
      <ellipse cx={0} cy={0} rx={rx} ry={ry} fill="#fbf8f0" stroke={INK} strokeWidth={sw} />
      <ellipse cx={0} cy={1} rx={rx * 0.66} ry={ry * 0.62} fill="none" stroke="#d3d0c4" strokeWidth={sw*0.7} />
      {dirt > 0 && Array.from({ length: 3 }, (_, i) => (
        <ellipse key={i} cx={(rnd(i, seed) - 0.5) * rx * 1.0} cy={(rnd(i, seed + 2) - 0.5) * ry * 0.7} rx={rx * (0.1 + rnd(i, seed + 3) * 0.12)} ry={ry * 0.32} fill={SAUCE[Math.floor(rnd(i, seed + 4) * 4)]} />
      ))}
    </g>
  );
};

/** a tower of dirty plates standing on (x,y); tilt in degrees about its base; wobble adds a sway as plates stack */
export const PlateTower: React.FC<{ x: number; y: number; n: number; rx?: number; tilt?: number; seed?: number; lean?: number; step?: number }> = ({ x, y, n, rx = 105, tilt = 0, seed = 1, lean = 0, step }) => {
  const st = step ?? rx * 0.2;
  return (
    <g transform={`translate(${x},${y}) rotate(${tilt})`}>
      {Array.from({ length: Math.max(0, Math.floor(n)) }, (_, i) => (
        <Plate key={i} x={(rnd(i, seed) - 0.5) * rx * 0.12 + lean * i * i * 0.3} y={-i * st} rx={rx} seed={seed + i} dirt={1} />
      ))}
    </g>
  );
};

export const BG_W = W, BG_H = H;
