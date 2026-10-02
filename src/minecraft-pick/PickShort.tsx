import React from "react";
import { AbsoluteFill, Audio, random, staticFile, useCurrentFrame } from "remotion";
import { H, W } from "../minecraft/beats";
import { loadMinecraftFonts } from "../minecraft/fonts";
import { HandDrawn } from "../minecraft/handdrawn";
import { Bang, clamp01, lerp, Man, MAN, ManFace, ManPose, Pick, PickFace, Puff, sm, Sparkles, Star, Tooltip, Workshop, Zzz, LINE } from "./kit";
import B from "./beats.json";

/**
 * "The wooden pickaxe nobody picks" — the neglected-gear story, in the
 * reference's look. An old wooden pickaxe wakes up thrilled when its player
 * walks in; his hand reaches for it, goes right past it, and takes the shiny
 * diamond pickaxe next to it. It cries while he mines, loses its durability
 * and breaks; the diamond one jumps out of his hand into lava; and the last
 * shot is the player mourning both while the wooden pickaxe's ghost floats up,
 * smiling, as the Short loops back to it asleep.
 */

export const PICK_FRAMES = B.frames;

const TABLE_Y = 1240;
const WP: [number, number] = [480, 862];
const DP: [number, number] = [850, 862];
const PS = 0.7; // pickaxe scale on the table

const pose = (a: Partial<ManPose>, base: ManPose = MAN.stand): ManPose => ({ ...base, ...a });
const mixPose = (a: ManPose, b: ManPose, t: number): ManPose => ({
  L: [lerp(a.L[0], b.L[0], t), lerp(a.L[1], b.L[1], t)],
  R: [lerp(a.R[0], b.R[0], t), lerp(a.R[1], b.R[1], t)],
  legL: [[lerp(a.legL[0][0], b.legL[0][0], t), lerp(a.legL[0][1], b.legL[0][1], t)], [lerp(a.legL[1][0], b.legL[1][0], t), lerp(a.legL[1][1], b.legL[1][1], t)]],
  legR: [[lerp(a.legR[0][0], b.legR[0][0], t), lerp(a.legR[0][1], b.legR[0][1], t)], [lerp(a.legR[1][0], b.legR[1][0], t), lerp(a.legR[1][1], b.legR[1][1], t)]],
});

const Cam: React.FC<{ z?: number; cx?: number; cy?: number; dx?: number; dy?: number; r?: number; children: React.ReactNode }> = ({ z = 1, cx = 540, cy = 960, dx = 0, dy = 0, r = 0, children }) => (
  <g transform={`translate(${dx} ${dy}) translate(${cx} ${cy}) rotate(${r}) scale(${z}) translate(${-cx} ${-cy})`}>{children}</g>
);

/* ------------------------------------------------------------------ the table scene ------------------------------------------------------------------ */

const camFor = (f: number) => {
  // [frame, zoom, cx, cy]
  const k: [number, number, number, number][] = [
    [0, 1.0, 540, 960], [100, 1.08, 560, 960], [170, 1.0, 540, 960], [186, 1.2, 480, 940], [250, 1.2, 540, 940],
    [276, 1.05, 480, 960], [330, 1.05, 480, 960], [400, 1.0, 540, 960], [412, 2.1, 430, 880], [500, 2.1, 430, 880],
    [525, 1.5, 480, 960], [580, 1.0, 540, 960], [660, 1.1, 540, 960],
  ];
  for (let i = 0; i < k.length - 1; i++) {
    if (f >= k[i][0] && f <= k[i + 1][0]) {
      const t = sm(f, k[i][0], k[i + 1][0]);
      return { z: lerp(k[i][1], k[i + 1][1], t), cx: lerp(k[i][2], k[i + 1][2], t), cy: lerp(k[i][3], k[i + 1][3], t) };
    }
  }
  return { z: 1, cx: 540, cy: 960 };
};

const wpState = (f: number): { face: PickFace; cracks: number; look: [number, number]; dy: number; squash: number; rot: number } => {
  let face: PickFace = "sleep";
  let look: [number, number] = [0, 0];
  let dy = 0, squash = 1, rot = 0;
  if (f >= B.wake) face = f < B.wake + 14 ? "wake" : "eager";
  if (f >= B.wake + 14 && f < B.enter) { look = [0, 0]; }
  if (f >= B.enter && f < B.pass) look = [-8, 0];
  if (f >= B.pass) face = "shock";
  if (f >= B.pass + 36) face = "sad";
  if (f >= B.lift + 30) face = "cry";
  if (f >= B.cutaway + 40) face = "angry";
  if (f >= B.cracks[2]) face = "cry";
  if (f >= B.break) face = "dead";
  // alive and eager: it bounces
  if (f >= B.wake + 14 && f < B.pass) { dy = -Math.abs(Math.sin(f * 0.35)) * 18; squash = 1 - Math.abs(Math.cos(f * 0.35)) * 0.05; }
  if (f >= B.pass && f < B.pass + 30) { dy = 0; rot = Math.sin(f * 2.2) * 2; }
  if (f >= B.cracks[1] && f < B.break) rot = Math.sin(f * 3) * 3;
  if (f < B.wake) dy = Math.sin(f * 0.07) * 4; // breathing
  const cracks = f >= B.cracks[2] ? 3 : f >= B.cracks[1] ? 2 : f >= B.cracks[0] ? 1 : 0;
  return { face, cracks, look, dy, squash, rot };
};

const dpState = (f: number): { face: PickFace; dy: number; rot: number; x: number; held: boolean } => {
  let face: PickFace = "sleep";
  let dy = 0, rot = 0;
  if (f >= B.wake) face = "smug";
  if (f < B.wake) dy = Math.sin(f * 0.07 + 1) * 4;
  // lifted by his hand
  const lift = sm(f, B.lift - 6, B.lift + 22);
  return { face, dy: dy - lift * 260, rot: lift * -12, x: DP[0] + lift * -360, held: f >= B.lift - 6 };
};

const playerState = (f: number): { x: number; pose: ManPose; face: ManFace; gaze: [number, number]; bob: number; arm: number } => {
  const walk = sm(f, B.enter, B.enter + 40);
  let x = lerp(-260, 140, walk);
  let p = MAN.stand;
  let face: ManFace = "smile";
  let gaze: [number, number] = [14, 0];
  let bob = 0, arm = 135;
  if (f >= B.enter && f < B.enter + 40) bob = Math.abs(Math.sin(f * 0.4)) * 14;
  // the point: finger down at the table
  if (f >= B.point) p = mixPose(MAN.stand, MAN.point, sm(f, B.point, B.point + 14));
  if (f >= B.point && f < B.reach) face = "grin";
  // the reach: over the wooden pickaxe, hovering, then past it to the diamond one
  if (f >= B.reach) {
    arm = 330;
    const toWood = sm(f, B.reach, B.reach + 20);
    const toDia = sm(f, B.pass - 4, B.pass + 22);
    const reachWood: ManPose = { ...MAN.point, R: [272, -60] };
    const reachDia: ManPose = { ...MAN.point, R: [568, -50] };
    p = mixPose(MAN.point, reachWood, toWood);
    p = mixPose(p, reachDia, toDia);
    face = f < B.pass ? "smile" : "grin";
    gaze = [20, 6];
  }
  if (f >= B.lift - 6) {
    // he lifts the diamond pickaxe and beams
    const up = sm(f, B.lift - 6, B.lift + 22);
    p = mixPose(p, { ...MAN.stand, R: [150, -170], L: [-110, 300] }, up);
    face = "cheer";
    arm = lerp(330, 150, up);
    gaze = [0, 0];
  }
  if (f >= B.table) {
    const d = sm(f, B.table, B.table + 16);
    x = 140;
    p = mixPose(MAN.stand, MAN.droop, d);
    face = "sad";
    gaze = [-10, 14];
    arm = 135;
  }
  return { x, pose: p, face, gaze, bob, arm };
};

const Table: React.FC<{ f: number }> = ({ f }) => {
  const cam = camFor(f);
  const wp = wpState(f), dp = dpState(f), pl = playerState(f);
  const broken = f >= B.break;
  const post = f >= B.table;
  const px = pl.x;
  const py = 890 - pl.bob;
  const showPlayer = f >= B.enter && f < B.cutaway || post || (f >= B.break + 18 && f < B.lava);
  const showDP = f < B.cutaway || f >= B.break + 40 && false;
  const dpOnTable = f < B.lift - 6 && f < B.cutaway;
  // after the grab the diamond pickaxe is in his hand; show it there until he leaves for the mine
  const dpInHand = f >= B.lift - 6 && f < 330;
  return (
    <Cam z={cam.z} cx={cam.cx} cy={cam.cy}>
      <Workshop f={f} tableY={TABLE_Y} blur={f >= 180 && f < 260 ? 7 : 5} night={f >= B.cutaway && f < B.lava ? 0.25 : 0} />
      {/* the two pickaxes on the table */}
      {!broken && <Pick kind="wood" x={WP[0]} y={WP[1] + wp.dy} s={PS} rot={wp.rot} squash={wp.squash} face={wp.face} f={f} cracks={wp.cracks} look={wp.look} />}
      {broken && <BrokenWood f={f} />}
      {showDP && dpOnTable && <Pick kind="diamond" x={DP[0]} y={DP[1] + dp.dy} s={PS} face={dp.face} f={f} glow={1} />}
      {f < B.wake && <Zzz x={WP[0] + 120} y={WP[1] - 120} f={f} />}
      {f < B.wake && <Zzz x={DP[0] + 120} y={DP[1] - 120} f={f + 40} />}
      {/* names, so it's obvious who is who */}
      {f < B.enter + 30 && <g opacity={clamp01(f / 14) * (1 - sm(f, B.enter + 10, B.enter + 30))}>
        <Tooltip x={WP[0]} y={WP[1] - 300} name="Wooden Pickaxe" lines={["Old and loyal"]} scale={0.8} />
        <Tooltip x={DP[0]} y={DP[1] - 300} name="Diamond Pickaxe" nameColor="#55ffff" lines={["Shiny and new"]} scale={0.8} />
      </g>}
      {/* the wooden pickaxe daydreams: him using it, hearts everywhere. Then he reaches past it and the bubble pops. */}
      {f >= B.wake + 30 && f < B.pass + 14 && <DayDream f={f} />}
      {/* the player */}
      {showPlayer && (
        <Man x={px} y={py} s={1.25} pose={pl.pose} face={pl.face} gaze={pl.gaze} armLen={pl.arm}
          blink={f % 90 > 84}
          hold={f >= B.lift - 6 && f < 330 ? (h) => <Pick kind="diamond" x={h.R[0] + 8} y={h.R[1] - 250} s={0.45} face="smug" f={f} glow={1} rot={-8} /> : undefined} />
      )}
      {/* his hand over the wooden pickaxe: the question marks that go nowhere */}
      {f >= B.reach + 20 && f < B.pass && <Sparkles x={WP[0]} y={WP[1] - 60} f={f} n={6} spread={190} />}
      {f >= B.pass && f < B.pass + 40 && <Bang x={WP[0] + 20} y={WP[1] - 250} s={1 + 0.2 * Math.sin(f)} />}
      {f >= B.lift && f < B.lift + 70 && <Sparkles x={DP[0] - 220} y={DP[1] - 150} f={f} n={10} spread={300} color="#bdfbff" />}
      {f >= B.lift && f < B.lift + 60 && <Tooltip x={DP[0] - 190} y={DP[1] - 520} name="Diamond Pickaxe" nameColor="#55ffff" lines={["Durability: 1561 / 1561"]} scale={0.75} o={1 - sm(f, B.lift + 40, B.lift + 60)} />}
      {/* the wooden one, ignored */}
      {f >= B.lift + 30 && f < B.cutaway && <Puff x={WP[0]} y={WP[1] - 150} f={f} n={0} />}
      {f >= B.table && <Ghost f={f} />}
      {post && <HalvesOnTable f={f} />}
    </Cam>
  );
};

const DayDream: React.FC<{ f: number }> = ({ f }) => {
  const u = sm(f, B.wake + 30, B.wake + 52);
  const pop = f >= B.pass;
  const t = f - B.pass;
  if (pop) {
    return (
      <g>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <circle key={i} cx={WP[0] - 90 + Math.cos(a) * t * 16} cy={WP[1] - 470 + Math.sin(a) * t * 16} r={18 - t * 0.9} fill="#fff" stroke="#000" strokeWidth={5} opacity={clamp01(1 - t / 14)} />;
        })}
        {t < 14 && <path d="M-46,-30 q-40,-50 -90,-10 q-30,50 46,110 q80,-50 70,-100 q-26,-34 -26,0 z" transform={`translate(${WP[0] - 90} ${WP[1] - 470 + t * 3})`} fill="#ff4d6d" stroke="#000" strokeWidth={8} />}
      </g>
    );
  }
  return (
    <g transform={`translate(${WP[0] - 90} ${WP[1] - 470}) scale(${u})`}>
      <circle cx={-40} cy={250} r={14} fill="#fff" stroke="#000" strokeWidth={6} /><circle cx={-70} cy={210} r={22} fill="#fff" stroke="#000" strokeWidth={6} />
      <ellipse cx={0} cy={0} rx={190} ry={140} fill="#fff" stroke="#000" strokeWidth={10} />
      {/* inside: the two of them, mining happily */}
      <g transform="translate(-60 20) scale(0.5)">
        <rect x={110} y={-70} width={70} height={140} fill="#8d8d96" stroke="#000" strokeWidth={8} />
        <Man x={-30} y={-60} s={0.8} pose={{ ...MAN.stand, R: [120 + Math.sin(f * 0.4) * 50, -30 + Math.sin(f * 0.4) * 80], L: [-95, 330] }} face="grin" legs={false} />
      </g>
      {[[-120, -80, 0], [110, -70, 1], [130, 40, 2]].map(([hx, hy, i], k) => (
        <path key={k} d="M0,-14 q-22,-30 -40,-6 q-8,24 40,52 q48,-28 40,-52 q-18,-24 -40,6 z" transform={`translate(${hx} ${(hy as number) + Math.sin(f * 0.2 + (i as number)) * 8}) scale(0.5)`} fill="#ff4d6d" stroke="#000" strokeWidth={9} />
      ))}
    </g>
  );
};

/** the wooden pickaxe in two pieces: the head and hub fall one way, the handle the other */
const BrokenWood: React.FC<{ f: number }> = ({ f }) => {
  const t = f - B.break;
  const u = clamp01(t / 26);
  const fall = u * u;
  const settled = f >= B.table || t > 30;
  return (
    <g>
      <defs>
        <clipPath id="bwTop"><rect x={WP[0] - 300} y={WP[1] - 300} width={600} height={300 + 190 * PS} /></clipPath>
        <clipPath id="bwBot"><rect x={WP[0] - 300} y={WP[1] - 110 + 190 * PS} width={600} height={800} /></clipPath>
      </defs>
      <g transform={`translate(${-60 * fall} ${settled ? 90 : fall * 90}) rotate(${-22 * fall} ${WP[0]} ${WP[1]})`}>
        <g clipPath="url(#bwTop)"><Pick kind="wood" x={WP[0]} y={WP[1]} s={PS} face="dead" f={f} cracks={3} /></g>
      </g>
      <g transform={`translate(${70 * fall} ${fall * 30}) rotate(${24 * fall} ${WP[0]} ${WP[1] + 300 * PS})`}>
        <g clipPath="url(#bwBot)"><Pick kind="wood" x={WP[0]} y={WP[1]} s={PS} face="dead" f={f} cracks={3} /></g>
      </g>
      {t >= 0 && t < 30 && <Puff x={WP[0]} y={WP[1] + 40} f={f * 2} n={7} color="#d9c9a8" />}
      {t >= 0 && t < 8 && <Star x={WP[0]} y={WP[1] + 60} r={160 - t * 12} color="#fff6a8" />}
    </g>
  );
};

/** what is left on the table at the end: the two halves, the head with its dead face and the handle */
const HalvesOnTable: React.FC<{ f: number }> = () => (
  <g>
    <g transform={`translate(${WP[0] - 80} ${TABLE_Y - 70}) rotate(-12)`}>
      <Pick kind="wood" x={0} y={0} s={0.42} face="dead" f={0} cracks={3} handle={0.0001} />
    </g>
    <g transform={`translate(${WP[0] + 120} ${TABLE_Y - 22}) rotate(86)`}>
      <rect x={-20} y={-6} width={36} height={200} fill="#8b5a2b" stroke={LINE} strokeWidth={10} />
    </g>
  </g>
);

const Ghost: React.FC<{ f: number }> = ({ f }) => {
  const t = f - B.ghost;
  if (t < 0) return null;
  const rise = sm(f, B.ghost, B.ghost + 50);
  const o = 0.4 + 0.6 * sm(f, B.ghost, B.ghost + 14);
  return (
    <g opacity={o}>
      <ellipse cx={WP[0] - 20} cy={WP[1] - 180 - rise * 260 - 190 * 0.56 + 40} rx={110} ry={26} fill="none" stroke="#ffe27a" strokeWidth={14} />
      <Pick kind="wood" x={WP[0] - 20} y={WP[1] + 20 - rise * 260 + Math.sin(f * 0.1) * 8} s={0.5} face="happy" f={f} ghost glow={0.8} />
      <Sparkles x={WP[0] - 20} y={WP[1] - rise * 260} f={f} n={8} spread={220} color="#fff6a8" />
    </g>
  );
};

/* ------------------------------------------------------------------ the durability close-up overlay ------------------------------------------------------------------ */

const DurabilityOverlay: React.FC<{ f: number }> = ({ f }) => {
  if (f < B.cutaway || f >= B.break + 22) return null;
  const dur = f >= B.break ? 0 : Math.max(1, Math.round(59 * (1 - sm(f, B.cutaway + 4, B.break - 6))));
  const frac = dur / 59;
  const col = frac > 0.5 ? "#4cd04c" : frac > 0.2 ? "#e0c030" : "#e03030";
  return (
    <g>
      <Tooltip x={540} y={250} name="Wooden Pickaxe" lines={[`Durability: ${dur} / 59`]} scale={1.15} />
      <rect x={290} y={452} width={500} height={26} fill="#000" />
      <rect x={290} y={452} width={500 * frac} height={26} fill={col} />
      <rect x={290} y={452} width={500} height={26} fill="none" stroke="#fff" strokeWidth={4} />
      {f >= B.break - 4 && f < B.break + 10 && <rect x={0} y={0} width={W} height={H} fill="#fff" opacity={0.45 * (1 - (f - (B.break - 4)) / 14)} />}
    </g>
  );
};

/* ------------------------------------------------------------------ the mine ------------------------------------------------------------------ */

const STONE = ["#8d8d96", "#7c7c86", "#9d9da6", "#6c6c76"];
const Mine: React.FC<{ f: number }> = ({ f }) => {
  const t = f - 330;
  const hits = B.mine;
  const n = hits.filter((h) => f >= h).length;
  // each swing: wind up on the beat before, strike on the beat
  const swing = (() => {
    for (const h of hits) { const d = f - (h - 12); if (d >= 0 && d < 24) return d < 12 ? sm(d, 0, 12) : 1 - sm(d, 12, 24); }
    return 0;
  })();
  const R: [number, number] = [lerp(100, 330, swing), lerp(-170, 130, swing)];
  const p: ManPose = { ...MAN.stand, R, L: [-100, 300] };
  const lastHit = Math.max(0, ...hits.filter((h) => f >= h));
  const sinceHit = f - lastHit;
  const shake = sinceHit >= 0 && sinceHit < 8 && lastHit > 0 ? Math.sin(sinceHit * 3) * (8 - sinceHit) * 2 : 0;
  return (
    <Cam z={1.04} dx={shake} dy={-shake * 0.6}>
      <rect x={-60} y={-60} width={1200} height={2100} fill="#2a2a34" />
      {Array.from({ length: 20 }, (_, r) => Array.from({ length: 10 }, (_, c) => (
        <rect key={`${r}${c}`} x={c * 120 - 30 + (r % 2) * 40} y={r * 120 - 30} width={124} height={124} fill={STONE[Math.floor(random(`mn${r}${c}`) * 4)]} stroke="#1e1e26" strokeWidth={6} opacity={0.9} />
      )))}
      <rect x={-60} y={-60} width={1200} height={2100} fill="#000" opacity={0.28} />
      {/* the ore wall he is digging: three blocks, each full of diamonds */}
      {[0, 1, 2].map((i) => {
        const gone = f >= hits[i];
        if (gone) return null;
        const bx = 640, by = 620 + i * 250;
        return (
          <g key={i}>
            <rect x={bx} y={by} width={250} height={250} fill="#8d8d96" stroke={LINE} strokeWidth={9} />
            {[[30, 40], [120, 30], [60, 130], [150, 150], [190, 70], [30, 190]].map(([dx, dy], j) => <rect key={j} x={bx + dx} y={by + dy} width={46} height={46} fill="#46e6dc" stroke="#0e6f7a" strokeWidth={5} />)}
          </g>
        );
      })}
      {/* diamonds popping out and flying up to the counter */}
      {hits.map((h, i) => {
        const d = f - h;
        if (d < 0 || d > 24) return null;
        const u = d / 24;
        return <path key={i} d="M0,-34 L30,-8 L18,34 L-18,34 L-30,-8 Z" transform={`translate(${lerp(765, 160, u * u)} ${lerp(745 + i * 250, 470, u * u) - Math.sin(u * Math.PI) * 140})`} fill="#46e6dc" stroke="#0e6f7a" strokeWidth={7} />;
      })}
      <Man x={300} y={930} s={1.5} pose={p} face={f < hits[0] ? "grin" : "cheer"} armLen={190} blink={false}
        hold={(h) => <Pick kind="diamond" x={h.R[0] + 40} y={h.R[1] - 200} s={0.4} rot={lerp(-20, 60, swing)} face="smug" f={f} glow={1} />} />
      {/* counter */}
      <g fontFamily="Monocraft, monospace">
        <rect x={60} y={420} width={330} height={84} fill="#000" opacity={0.55} />
        <text x={86} y={480} fontSize={44} fill="#fff">Diamonds: {n}</text>
      </g>
      {hits.map((h) => f >= h && f < h + 12 && <Star key={h} x={760} y={745} r={120 - (f - h) * 8} color="#fff6a8" />)}
      {t > 40 && <Sparkles x={380} y={760} f={f} n={5} spread={180} color="#bdfbff" />}
    </Cam>
  );
};

/* ------------------------------------------------------------------ the lava ------------------------------------------------------------------ */

const Lava: React.FC<{ f: number }> = ({ f }) => {
  const t = f - B.lava;
  const flyT = clamp01((f - B.fly) / (B.splash - B.fly));
  const inLava = f >= B.splash;
  // the pickaxe jumps out of his hand in an arc and into the lava
  const fx = lerp(520, 800, flyT), fy = lerp(780, 1500, flyT * flyT) - Math.sin(flyT * Math.PI) * 420;
  const spin = flyT * 560;
  const handUp = f >= B.fly;
  const p: ManPose = { ...MAN.stand, R: handUp ? [190, -110] : [200, 100 + Math.sin(f * 0.6) * 24], L: [-100, 300] };
  return (
    <Cam z={1.02}>
      <rect x={-60} y={-60} width={1200} height={2100} fill="#1b1124" />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 100 - 20} y={0} width={104} height={180 + random(`lc${i}`) * 300} fill="#2c2038" stroke="#120a1a" strokeWidth={6} />)}
      {/* the lava lake */}
      <rect x={-60} y={1420} width={1200} height={700} fill="#e8441c" />
      {Array.from({ length: 14 }, (_, i) => <rect key={i} x={i * 90 - 30} y={1420 + ((i * 53) % 90)} width={90} height={60 + ((i * 37) % 60)} fill={["#ff8a24", "#f06a1a", "#ffd23a"][i % 3]} opacity={0.8 + 0.2 * Math.sin(f * 0.2 + i)} />)}
      <rect x={-60} y={1380} width={1200} height={50} fill="#ff8a24" opacity={0.5} />
      {/* the ledge he stands on */}
      <rect x={-60} y={1320} width={560} height={120} fill="#7c7c86" stroke={LINE} strokeWidth={9} />
      <rect x={-60} y={1440} width={470} height={300} fill="#6c6c76" stroke={LINE} strokeWidth={9} />
      <Man x={230} y={800} s={1.4} pose={p} face={f < B.fly ? "grin" : f < B.splash ? "shock" : "worried"} armLen={170}
        hold={f < B.fly ? (h) => <Pick kind="diamond" x={h.R[0] + 30} y={h.R[1] - 210} s={0.4} face="smug" f={f} glow={1} rot={Math.sin(f * 0.6) * 25} /> : undefined} />
      {f >= B.fly && !inLava && <Pick kind="diamond" x={fx} y={fy} s={0.5} rot={spin} face="nooo" f={f} glow={0.6} />}
      {inLava && f < B.splash + 22 && <Pick kind="diamond" x={800} y={1500 + (f - B.splash) * 6} s={0.5 * (1 - (f - B.splash) / 30)} rot={560} face="nooo" f={f} />}
      {f >= B.fly && f < B.splash && <Bang x={560} y={640} s={1} />}
      {inLava && f < B.splash + 30 && Array.from({ length: 14 }, (_, i) => {
        const d = f - B.splash, a = -Math.PI * (0.15 + 0.7 * random(`sp${i}`)), v = 16 + random(`sv${i}`) * 26;
        return <circle key={i} cx={800 + Math.cos(a) * v * d} cy={1470 + Math.sin(a) * v * d + d * d * 1.6} r={16 + random(`sr${i}`) * 14} fill={i % 2 ? "#ffd23a" : "#ff6a1a"} stroke="#000" strokeWidth={4} opacity={1 - d / 34} />;
      })}
      {inLava && <Puff x={800} y={1400} f={f * 2} n={5} color="#555" />}
    </Cam>
  );
};

/* ------------------------------------------------------------------ assembly ------------------------------------------------------------------ */

const Scene: React.FC<{ f: number }> = ({ f }) => {
  if (f >= 330 && f < B.cutaway) return <Mine f={f} />;
  if (f >= B.lava && f < B.table) return <Lava f={f} />;
  return <Table f={f} />;
};

export const PickShort: React.FC<{ audio?: string | null; drawn?: boolean }> = ({ audio = null, drawn = true }) => {
  loadMinecraftFonts();
  const f = useCurrentFrame();
  const lb = clamp01((f - (B.frames - B.loopBlend)) / B.loopBlend);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {audio && <Audio src={staticFile(audio)} />}
      <HandDrawn enabled={drawn} hold={1} boilEvery={2} boil={0.7} grain={0}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          <defs><clipPath id="pkAll"><rect x={0} y={0} width={W} height={H} /></clipPath></defs>
          <g clipPath="url(#pkAll)">
            <Scene f={f} />
            {lb > 0 && <g opacity={lb}><Scene f={0} /></g>}
          </g>
        </svg>
      </HandDrawn>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <DurabilityOverlay f={f} />
      </svg>
    </AbsoluteFill>
  );
};

export const PickThumb: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <Scene f={236} />
    </svg>
  </AbsoluteFill>
);
