import React from "react";
import { INK } from "../common";
import { P, Part, pose, Pose, Regular, smooth, tube } from "../bowling/characters";
import { GuestFace } from "../guest";

/**
 * "Zoro Gets Lost" cast extras: the walk cycle, Zoro's souvenirs, the guest
 * after years of pointing, and the creatures of the montage. Everything is
 * on the shared figure kit (src/akki/bowling/characters.tsx).
 */

export const rnd = (i: number, s = 1) => { const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); };
export const mod = (a: number, b: number) => ((a % b) + b) % b;

/* ----------------------------------- walking ---------------------------------- */

/**
 * A side-on walk for the front-on figure kit: feet scissor along x, the lifted
 * foot comes forward with a bent knee, arms swing opposite. Faces +x; flip
 * the figure for the other way.
 */
export const walkPose = (t: number, o: { stride?: number; lift?: number; swing?: number; turn?: number; period?: number; head?: number } = {}): Pose => {
  const { stride = 120, lift = 70, swing = 70, turn = 0.85, period = 12, head = 0 } = o;
  const ph = (t / period) * Math.PI * 2;
  const leg = (side: -1 | 1, phi: number): { hip: P; kn: P; ft: P } => {
    const hip: P = [side * 48, -492];
    const fwd = Math.max(0, Math.cos(phi));
    const ft: P = [side * 14 + Math.sin(phi) * stride, -14 - fwd * lift];
    const kn: P = [(hip[0] + ft[0]) / 2 + 26 * fwd + 12, (hip[1] + ft[1]) / 2];
    return { hip, kn, ft };
  };
  const L = leg(-1, ph), R = leg(1, ph + Math.PI);
  const aL = Math.sin(ph + Math.PI) * swing, aR = Math.sin(ph) * swing;
  return pose({
    head: [6 + head, -905], turn, tilt: 0,
    elL: [-114 + aL * 0.5, -616 - Math.abs(aL) * 0.1], haL: [-110 + aL, -450 - Math.abs(aL) * 0.3 + Math.max(0, aL) * 0.3],
    elR: [114 + aR * 0.5, -616 - Math.abs(aR) * 0.1], haR: [110 + aR, -450 - Math.abs(aR) * 0.3 + Math.max(0, aR) * 0.3],
    hipL: L.hip, knL: L.kn, ftL: L.ft, hipR: R.hip, knR: R.kn, ftR: R.ft, fdL: 1, fdR: 1,
  });
};
export const bob = (t: number, period = 12, amp = 12) => -Math.abs(Math.cos((t / period) * Math.PI * 2)) * amp;

/** arms folded, chin up: the pose of a man who knows exactly where he is going */
export const CONFIDENT: Pose = pose({
  head: [0, -905], turn: -0.35,
  shL: [-94, -806], elL: [-20, -690], haL: [88, -724], hL: "fist",
  shR: [94, -806], elR: [24, -640], haR: [-90, -700], hR: "fist",
});

/* --------------------------------- small things --------------------------------- */

export const Sweat: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <path d="M0,-26 Q16,0 14,10 Q10,24 0,24 Q-10,24 -14,10 Q-16,0 0,-26Z" fill="#8fd8ff" stroke={INK} strokeWidth={3.4} strokeLinejoin="round" />
    <path d="M-6,4 Q-8,12 -3,16" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" />
  </g>
);

export const Puff: React.FC<{ x: number; y: number; r: number; t: number; c?: string }> = ({ x, y, r, t, c = "#f1e2c0" }) => {
  if (t < 0 || t > 1) return null;
  const k = 0.5 + t * 0.9;
  return (
    <g opacity={1 - t * t} transform={`translate(${x},${y - t * r * 0.6})`}>
      <circle cx={-r * 0.4} cy={0} r={r * 0.5 * k} fill={c} stroke={INK} strokeWidth={4} />
      <circle cx={r * 0.35} cy={-r * 0.1} r={r * 0.6 * k} fill={c} stroke={INK} strokeWidth={4} />
      <circle cx={0} cy={-r * 0.35} r={r * 0.5 * k} fill={c} stroke={INK} strokeWidth={4} />
    </g>
  );
};

/** dust puffs kicked up at the heels, one every `every` frames, drifting back */
export const DustTrail: React.FC<{ t: number; x: number; y: number; dir: 1 | -1; every?: number; r?: number; c?: string }> = ({ t, x, y, dir, every = 6, r = 46, c }) => (
  <>
    {Array.from({ length: 4 }, (_, i) => {
      const born = Math.floor(t / every) * every - i * every;
      const age = (t - born) / (every * 3);
      if (age < 0 || age > 1) return null;
      return <Puff key={i} x={x - dir * (60 + (t - born) * 14)} y={y} r={r} t={age} c={c} />;
    })}
  </>
);

/* ------------------------------- Zoro's souvenirs ------------------------------- */

const Flower: React.FC<{ x: number; y: number; r: number; c: string; i: number }> = ({ x, y, r, c, i }) => (
  <g transform={`translate(${x},${y}) rotate(${i * 23})`}>
    {Array.from({ length: 5 }, (_, k) => <circle key={k} cx={Math.cos((k / 5) * Math.PI * 2) * r * 0.62} cy={Math.sin((k / 5) * Math.PI * 2) * r * 0.62} r={r * 0.46} fill={c} stroke={INK} strokeWidth={2.6} />)}
    <circle r={r * 0.34} fill="#ffe36a" stroke={INK} strokeWidth={2} />
  </g>
);

/** straw sun hat + flower lei + souvenir coconut, in figure space (children of <ZoroPre>) */
export const Souvenirs: React.FC<{ p: Pose; hat?: boolean; lei?: boolean; coconut?: boolean }> = ({ p, hat = true, lei = true, coconut = true }) => {
  const sx = p.turn * 12;
  const cols = ["#ff5d8f", "#ffd23f", "#ff8a3d", "#ff5d8f", "#ffd23f", "#ff8a3d", "#ff5d8f", "#ffd23f", "#ff8a3d"];
  const A: P = [-62, -832], C: P = [0, -650], B: P = [62, -832];
  return (
    <g>
      {lei && (
        <g>
          <path d={`M${A[0]},${A[1]} Q${C[0]},${C[1]} ${B[0]},${B[1]}`} stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" />
          {cols.map((c, i) => {
            const u = (i + 0.5) / cols.length;
            const x = (1 - u) * (1 - u) * A[0] + 2 * u * (1 - u) * C[0] + u * u * B[0];
            const y = (1 - u) * (1 - u) * A[1] + 2 * u * (1 - u) * C[1] + u * u * B[1];
            return <Flower key={i} x={x} y={y} r={19} c={c} i={i} />;
          })}
        </g>
      )}
      {coconut && (
        <g transform={`translate(${p.haR[0] + 18},${p.haR[1] - 6})`}>
          <circle r={36} fill="#6b4226" stroke={INK} strokeWidth={5} />
          <path d="M-24,-14 Q-14,-30 6,-30" stroke="#8a5a36" strokeWidth={7} fill="none" strokeLinecap="round" />
          <circle cx={-10} cy={-2} r={4.5} fill={INK} /><circle cx={6} cy={-6} r={4.5} fill={INK} /><circle cx={-2} cy={10} r={4.5} fill={INK} />
          <path d="M6,-32 L20,-70 Q24,-78 34,-74" stroke={INK} strokeWidth={13} fill="none" strokeLinecap="round" />
          <path d="M6,-32 L20,-70 Q24,-78 34,-74" stroke="#ff5d8f" strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
      )}
      {hat && (
        <g transform={`translate(${p.head[0]},${p.head[1]}) rotate(${p.tilt}) scale(1.1)`}>
          <ellipse cx={sx * 0.5} cy={-58} rx={108} ry={26} fill="#e8c36a" stroke={INK} strokeWidth={4.5} />
          <ellipse cx={sx * 0.5} cy={-54} rx={92} ry={17} fill="#c9a24e" opacity={0.55} />
          <path d={`M${-54 + sx * 0.5},-60 Q${-60 + sx * 0.5},-136 ${sx * 0.5},-140 Q${60 + sx * 0.5},-136 ${54 + sx * 0.5},-60 Q${sx * 0.5},-50 ${-54 + sx * 0.5},-60Z`} fill="#f2d283" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
          <path d={`M${-56 + sx * 0.5},-74 Q${sx * 0.5},-62 ${56 + sx * 0.5},-74 L${55 + sx * 0.5},-88 Q${sx * 0.5},-76 ${-55 + sx * 0.5},-88Z`} fill="#d6453a" stroke={INK} strokeWidth={3} />
          <path d={`M${-40 + sx * 0.5},-104 Q${sx * 0.5},-96 ${40 + sx * 0.5},-104 M${-26 + sx * 0.5},-122 Q${sx * 0.5},-116 ${26 + sx * 0.5},-122`} stroke="#c9a24e" strokeWidth={3} fill="none" />
        </g>
      )}
    </g>
  );
};

/** icicle on the nose, frost in the hair, snow on the shoulders — in figure space */
export const Frosted: React.FC<{ p: Pose; k?: number }> = ({ p, k = 1 }) => {
  const sx = p.turn * 12;
  return (
    <g>
      <g transform={`translate(${p.head[0]},${p.head[1]}) rotate(${p.tilt}) scale(1.1)`}>
        <path d={`M${sx + 8},26 L${sx + 18},30 L${sx + 18},${30 + 56 * k}Z`} fill="#bfe8ff" stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />
        <path d={`M${sx + 13},30 L${sx + 16},${30 + 30 * k}`} stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
        <path d={`M${-50 + sx},-70 q10,-14 24,-6 q14,-12 28,-2 q16,-10 30,2 q10,-6 18,6 q-30,-8 -50,0 q-24,-8 -50,0Z`} fill="#fff" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        {[[-30, -74], [8, -86], [34, -70]].map(([x, y], i) => <circle key={i} cx={x + sx} cy={y} r={7} fill="#fff" stroke={INK} strokeWidth={2} />)}
      </g>
      {[p.shL, p.shR].map((s, i) => (
        <path key={i} d={`M${s[0] - 34},${s[1] + 4} Q${s[0] - 24},${s[1] - 26} ${s[0]},${s[1] - 20} Q${s[0] + 26},${s[1] - 28} ${s[0] + 36},${s[1] + 4}Q${s[0]},${s[1] - 4} ${s[0] - 34},${s[1] + 4}Z`} fill="#fff" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      ))}
    </g>
  );
};

/** the canteen: flat flask on a strap */
export const CanteenProp: React.FC<{ x: number; y: number; a: number; s?: number }> = ({ x, y, a, s = 1 }) => (
  <g transform={`translate(${x},${y}) rotate(${a}) scale(${s})`}>
    <path d="M-10,-44 Q-60,-70 -62,-6 Q-60,60 -10,52 L26,52 Q60,56 60,-6 Q60,-70 26,-44Z" fill="#7d8b4a" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M-34,-24 Q-44,-4 -34,24" stroke="#a6b46a" strokeWidth={6} fill="none" strokeLinecap="round" />
    <rect x={-14} y={-72} width={30} height={30} rx={6} fill="#c9c9cf" stroke={INK} strokeWidth={4.5} />
    <path d="M-24,-46 Q-70,-66 -76,-20" stroke="#6a4a2a" strokeWidth={8} fill="none" strokeLinecap="round" />
  </g>
);

/* ------------------------------------- the guest ------------------------------------ */

/**
 * The guest, years later: a beard that reaches the floor, a bird's nest for a
 * hat, wrinkles and tired white-grey brows. Drawn in head space (eye line y=0,
 * chin ≈ 70, crown ≈ -120): `len` is how far the beard runs down in those units.
 */
export const OldHeadExtras: React.FC<{ len: number; t?: number; lw?: number; wide?: number; chirp?: number }> = ({ len, t = 0, lw = 4, wide = 1, chirp = 0 }) => {
  const W0 = wide;
  const beard = smooth([
    [-60, 6], [-68, 44], [-84 * W0, 110], [-88 * W0, 220], [-70 * W0, len * 0.5], [-46 * W0, len * 0.76], [-24 * W0, len * 0.93], [-6 * W0, len + 24], [14 * W0, len - 6],
    [30 * W0, len * 0.9], [54 * W0, len * 0.74], [76 * W0, len * 0.5], [90 * W0, 220], [86 * W0, 110], [68, 44], [60, 6], [34, 40], [0, 54], [-34, 40],
  ]);
  const bob = Math.sin(t * 0.5) * 3;
  return (
    <g>
      {/* gray scraggly hair hanging down the sides */}
      {[-1, 1].map((sd) => (
        <path key={sd} d={`M${sd * 56},-86 Q${sd * 86},-60 ${sd * 78},-8 Q${sd * 96},30 ${sd * 70},64 Q${sd * 74},34 ${sd * 62},18 Q${sd * 66},-30 ${sd * 48},-70Z`} fill="#cfccc6" stroke={INK} strokeWidth={lw * 0.8} strokeLinejoin="round" />
      ))}
      {/* the beard */}
      <Part d={beard} fill="#e6e3dc" shade="#b9b5ad" lw={lw} sh={[-10, -4]}>
        {[-50, -24, 0, 26, 52].map((x, i) => <path key={i} d={`M${x},${70 + i * 8} Q${x + 10},${len * 0.4} ${x * 1.5},${len * 0.9}`} stroke="#b9b5ad" strokeWidth={3.4} fill="none" />)}
      </Part>
      {/* mustache */}
      <path d="M-62,40 Q-30,24 0,36 Q30,24 62,40 Q50,62 22,52 Q0,46 -22,52 Q-50,62 -62,40Z" fill="#e6e3dc" stroke={INK} strokeWidth={lw * 0.7} strokeLinejoin="round" />
      {/* white brows, bags, wrinkles */}
      <path d="M-42,-22 Q-24,-34 -6,-20 L-8,-8 Q-24,-18 -40,-10Z M42,-22 Q24,-34 6,-20 L8,-8 Q24,-18 40,-10Z" fill="#eceae4" stroke={INK} strokeWidth={2} />
      <path d="M-34,16 Q-20,26 -8,16 M34,16 Q20,26 8,16 M-50,-50 Q0,-62 50,-50 M-44,-40 Q0,-50 44,-40" stroke={INK} strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.7} />
      {/* the nest */}
      <g transform={`translate(0,${-112 + bob * 0.2})`}>
        <ellipse cx={0} cy={4} rx={92} ry={26} fill="#7a5230" stroke={INK} strokeWidth={lw} />
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return <path key={i} d={`M${Math.cos(a) * 60},${Math.sin(a) * 14} l${Math.cos(a) * (34 + 16 * rnd(i, 3))},${Math.sin(a) * 18 - 4 - 8 * rnd(i, 4)}`} stroke={i % 2 ? "#a67844" : "#5a3a20"} strokeWidth={5} strokeLinecap="round" />;
        })}
        <path d="M-70,6 Q0,36 70,6" stroke="#5a3a20" strokeWidth={5} fill="none" strokeLinecap="round" />
        <ellipse cx={-34} cy={-8} rx={13} ry={16} fill="#a8e3ee" stroke={INK} strokeWidth={3} />
        <ellipse cx={36} cy={-6} rx={13} ry={16} fill="#a8e3ee" stroke={INK} strokeWidth={3} />
        <g transform={`translate(0,${-18 + bob})`}>
          <ellipse cx={0} cy={-6} rx={30} ry={26} fill="#4b8de0" stroke={INK} strokeWidth={4} />
          <path d="M-28,-2 Q-40,10 -30,22 Q-12,10 -12,2Z" fill="#2f6bbd" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          <path d="M-26,-26 l-6,-14 M-12,-30 l-2,-16 M2,-32 l4,-14" stroke={INK} strokeWidth={3.4} strokeLinecap="round" />
          <circle cx={14} cy={-14} r={5} fill="#fff" stroke={INK} strokeWidth={2} /><circle cx={15} cy={-14} r={2.4} fill={INK} />
          <path d={`M26,-10 L${44 + chirp * 6},${-12 - chirp * 4} L26,${-4}Z`} fill="#ffb02e" stroke={INK} strokeWidth={2.8} strokeLinejoin="round" />
          {chirp > 0 && <path d="M26,-4 L42,2 L26,2Z" fill="#ff9a1e" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />}
        </g>
      </g>
    </g>
  );
};

/** the aged guest in a full-length figure, beard to the floor */
export const OldGuest: React.FC<{ p: Pose; x: number; y: number; s: number; face?: GuestFace | "grin" | "blank" | "shock"; t?: number; chirp?: number }> = ({ p, x, y, s, face = "blank", t = 0, chirp = 0 }) => {
  const len = (-p.head[1] + 4) / 1.1;
  return (
    <g>
      <Regular p={p} x={x} y={y} s={s} face={face === "yell" ? "shock" : face} lw={4} />
      <g transform={`translate(${x},${y}) scale(${s})`}>
        <g transform={`translate(${p.head[0]},${p.head[1]}) rotate(${p.tilt}) scale(1.1)`}>
          <OldHeadExtras len={len} t={t} lw={4 / 1.1} chirp={chirp} />
        </g>
      </g>
    </g>
  );
};

export const Cobweb: React.FC<{ x: number; y: number; r: number; rot?: number; flip?: boolean }> = ({ x, y, r, rot = 0, flip }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${flip ? -1 : 1},1)`} stroke="#f4f4f4" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.92}>
    {[0, 22, 45, 68, 90].map((a, i) => <path key={i} d={`M0,0 L${Math.cos((a * Math.PI) / 180) * r},${Math.sin((a * Math.PI) / 180) * r}`} />)}
    {[0.3, 0.55, 0.8].map((k, i) => (
      <path key={i} d={`M${r * k},0 Q${r * k * 0.8},${r * k * 0.5} ${Math.cos(0.4) * r * k},${Math.sin(0.4) * r * k} Q${r * k * 0.5},${r * k * 0.9} ${Math.cos(0.8) * r * k},${Math.sin(0.8) * r * k} Q${r * k * 0.3},${r * k * 1.0} ${Math.cos(1.2) * r * k},${Math.sin(1.2) * r * k} Q${r * k * 0.1},${r * k} 0,${r * k}`} />
    ))}
  </g>
);

export const Tumbleweed: React.FC<{ x: number; y: number; r: number; rot: number }> = ({ x, y, r, rot }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <circle r={r} fill="#b98a4a" stroke={INK} strokeWidth={5} />
    {Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2;
      return <path key={i} d={`M${Math.cos(a) * r},${Math.sin(a) * r} Q${Math.cos(a + 1) * r * 0.2},${Math.sin(a + 1) * r * 0.2} ${Math.cos(a + 2.4) * r * 0.9},${Math.sin(a + 2.4) * r * 0.9}`} stroke="#6a4a22" strokeWidth={3.6} fill="none" strokeLinecap="round" />;
    })}
    <path d={`M${-r * 0.5},${-r * 0.5} Q0,${-r * 0.1} ${r * 0.5},${-r * 0.5}`} stroke="#6a4a22" strokeWidth={3} fill="none" />
  </g>
);

/** tears as cartoon geysers: parabolic streams spraying out of an eye */
export const TearGeyser: React.FC<{ x: number; y: number; dir: number; t: number; power?: number; seed?: number }> = ({ x, y, dir, t, power = 1, seed = 1 }) => {
  const n = 16;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const life = 14;
        const born = Math.floor(t) - i;
        const age = t - born;
        if (age < 0 || age > life) return null;
        const jitter = rnd(born, seed) - 0.5;
        const vx = dir * (14 + 10 * rnd(born, seed + 1)) * power;
        const vy = (-44 - 16 * rnd(born, seed + 2)) * power + jitter * 10;
        const px = x + vx * age, py = y + vy * age + 3.4 * age * age;
        const r = 16 - age * 0.5;
        return <circle key={i} cx={px} cy={py} r={Math.max(4, r)} fill="#6fd0ff" stroke={INK} strokeWidth={3.4} />;
      })}
      <path d={`M${x},${y} q${dir * 60 * power},${-100 * power} ${dir * 140 * power},${-30 * power}`} stroke="#6fd0ff" strokeWidth={22} fill="none" strokeLinecap="round" opacity={0.9} />
      <path d={`M${x},${y} q${dir * 60 * power},${-100 * power} ${dir * 140 * power},${-30 * power}`} stroke="#d8f4ff" strokeWidth={7} fill="none" strokeLinecap="round" />
    </g>
  );
};

/* -------------------------------------- creatures -------------------------------------- */

/** a theropod facing left, feet at y=0. jaw: lower-jaw opening in degrees; run: leg phase */
export const Dino: React.FC<{ x: number; y: number; s?: number; run?: number; jaw?: number; rot?: number; sx?: number; sy?: number; pivot?: P; dazed?: number }> = ({ x, y, s = 1, run = 0, jaw = 20, rot = 0, sx = 1, sy = 1, pivot = [-60, 0], dazed = 0 }) => {
  const G1 = "#5fa83e", G2 = "#3f7f2a", BELLY = "#ead88c";
  const leg = (hx: number, ph: number, key: string, dark: boolean) => {
    const fwd = Math.max(0, Math.cos(ph));
    const ft: P = [hx - 20 + Math.sin(ph) * 100, -fwd * 70];
    const hip: P = [hx, -300];
    const kn: P = [hx - 50 + fwd * -20, -170 - fwd * 40];
    return (
      <g key={key}>
        <Part d={tube([hip, kn, ft], [64, 42, 28])} fill={dark ? G2 : G1} shade={dark ? "#2c5c1e" : G2} lw={5} />
        <Part d={smooth([[ft[0] + 20, ft[1] - 12], [ft[0] - 60, ft[1] - 8], [ft[0] - 78, ft[1] + 4], [ft[0] - 56, ft[1] + 12], [ft[0] + 24, ft[1] + 12]])} fill={dark ? G2 : G1} shade="#2c5c1e" lw={5} />
        {[-70, -52, -34].map((o, i) => <path key={i} d={`M${ft[0] + o},${ft[1] + 8} l-10,8 l16,-2Z`} fill="#fff" stroke={INK} strokeWidth={2} />)}
      </g>
    );
  };
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <g transform={`translate(${pivot[0]},${pivot[1]}) rotate(${rot}) scale(${sx},${sy}) translate(${-pivot[0]},${-pivot[1]})`}>
        {/* tail */}
        <Part d={smooth([[170, -420], [330, -400], [470, -330], [500, -300], [420, -300], [300, -330], [170, -270]])} fill={G1} shade={G2} lw={5} />
        {leg(150, run + Math.PI, "far", true)}
        {/* body */}
        <Part d={smooth([[-70, -430], [-10, -560], [110, -610], [230, -510], [250, -360], [170, -250], [10, -240], [-70, -310]])} fill={G1} shade={G2} lw={5} sh={[-18, -10]}>
          <path d="M-60,-330 Q40,-230 190,-290 L190,-240 L-60,-240Z" fill={BELLY} />
          {[0, 1, 2].map((i) => <path key={i} d={`M${60 + i * 50},${-420 - i * 6} q14,-20 28,0`} stroke={G2} strokeWidth={6} fill="none" strokeLinecap="round" />)}
        </Part>
        {/* spines */}
        {[-20, 40, 100, 160, 220].map((o, i) => <path key={i} d={`M${o},${-540 + Math.abs(i - 2) * 22 + i * 6 - 40} l16,-34 l18,34Z`} fill="#e2b43a" stroke={INK} strokeWidth={3} strokeLinejoin="round" />)}
        {/* neck + head */}
        <Part d={smooth([[-70, -430], [-120, -560], [-180, -660], [-310, -690], [-340, -620], [-300, -570], [-130, -540], [-60, -440]])} fill={G1} shade={G2} lw={5} sh={[-14, -8]} />
        <Part d={smooth([[-330, -690], [-260, -750], [-150, -745], [-90, -700], [-90, -620], [-150, -590], [-300, -600], [-340, -640]])} fill={G1} shade={G2} lw={5} sh={[-12, -8]}>
          <path d="M-330,-650 Q-290,-640 -250,-650" stroke={INK} strokeWidth={4} fill="none" />
        </Part>
        {/* eye + brow */}
        <circle cx={-170} cy={-700} r={14} fill="#fff4a8" stroke={INK} strokeWidth={4} /><circle cx={-175} cy={-698} r={5.5} fill={INK} />
        <path d="M-196,-726 L-142,-704" stroke={INK} strokeWidth={8} strokeLinecap="round" />
        <circle cx={-318} cy={-668} r={5} fill={INK} />
        {/* upper teeth */}
        {[-300, -268, -236, -204, -172].map((tx, i) => <path key={i} d={`M${tx},-616 l8,${20 + (i % 2) * 6} l8,-20Z`} fill="#fff" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />)}
        {/* lower jaw hinged at the back of the mouth */}
        <g transform={`translate(-110,-608) rotate(${-jaw})`}>
          <Part d={smooth([[-200, -4], [-190, 26], [-120, 38], [0, 28], [6, 0], [-60, -10]])} fill={G2} shade="#2c5c1e" lw={5} sh={[-8, -6]} />
          {[-180, -150, -120, -90].map((tx, i) => <path key={i} d={`M${tx},-4 l7,-22 l8,22Z`} fill="#fff" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />)}
        </g>
        {/* tiny arms */}
        <Part d={tube([[-20, -480], [-70, -450], [-78, -420]], [18, 14, 12])} fill={G1} shade={G2} lw={4} />
        {[-92, -80].map((o, i) => <path key={i} d={`M${o},-420 l-6,18 l12,-8Z`} fill="#fff" stroke={INK} strokeWidth={2} />)}
        {leg(90, run, "near", false)}
        {dazed > 0 && Array.from({ length: 3 }, (_, i) => {
          const a = dazed * 0.6 + i * 2.1;
          return <path key={i} d={`M${-200 + Math.cos(a) * 90},${-790 + Math.sin(a) * 22} l6,14 l14,2 l-10,10 l3,14 l-13,-7 l-12,8 l3,-14 l-10,-10 l14,-2Z`} fill="#ffe14a" stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />;
        })}
      </g>
    </g>
  );
};

export const Seagull: React.FC<{ x: number; y: number; s?: number; flap?: number; perched?: boolean; look?: number }> = ({ x, y, s = 1, flap = 0, perched = false, look = 0 }) => {
  const w = perched ? -0.15 : Math.sin(flap);
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {perched && <path d="M-8,26 l0,26 M10,26 l0,26" stroke="#ff9a2a" strokeWidth={6} strokeLinecap="round" />}
      <path d={`M-10,-6 Q-40,${-70 * w - 30} -96,${-60 * w - 10} Q-54,-20 -20,10Z`} fill="#dfe6ee" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M-44,6 L-84,-2 L-80,20 L-44,24Z" fill="#fff" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M-46,-4 Q-4,-30 54,-12 Q70,6 60,18 Q40,34 -10,32 Q-52,26 -46,-4Z" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M-40,12 Q-10,28 40,22" stroke="#cdd6e0" strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d={`M-6,0 Q-10,${-80 * w - 10} -70,${-86 * w + 6} Q-40,${-30 * w + 10} -30,24Z`} fill="#f2f5f9" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <circle cx={60 + look * 4} cy={-14} r={22} fill="#fff" stroke={INK} strokeWidth={5} />
      <path d={`M${78 + look * 4},-16 L${112 + look * 4},-8 L${80 + look * 4},-4Z`} fill="#ffb02e" stroke={INK} strokeWidth={3.6} strokeLinejoin="round" />
      <circle cx={64 + look * 5} cy={-20} r={5.4} fill="#fff" stroke={INK} strokeWidth={2.4} /><circle cx={66 + look * 7} cy={-20} r={2.6} fill={INK} />
    </g>
  );
};
