import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { HandDrawn } from "../../minecraft/handdrawn";
import { Hand, lerpPose, Part, pose, Pose, Regular, SKIN_TAN, tube } from "../bowling/characters";
import { RegularWrinkled } from "../bowling/closeups";
import { BrushBlue } from "../bowling/sets";
import { ease, H, INK, lerp, loadAkkiFonts, TitleText, W } from "../common";
import { Boom, FxDefs, ImpactFlash, Smoke } from "../breakfast/fx";
import { G, GuestHead } from "../guest";
import { ZoroPre } from "../zoro/cast";
import {
  bob, CanteenProp, CONFIDENT, Dino, DustTrail, Frosted, mod, OldGuest, OldHeadExtras, Puff, rnd, Seagull, Souvenirs, Sweat, TearGeyser, Tumbleweed, walkPose,
} from "./cast";
import { Calendar, Desert, DOOR, FLOOR_Y, Hall, Jungle, LavaRiver, Night, Ocean, OceanFront, Snow, StepPath, Volcano } from "./sets";
import B from "./beats.json";

/**
 * "Zoro Gets Lost" — 15 seconds, AKKI TALKS house style, every frame drawn here.
 *
 * The guest (the channel owner) points at the toilet door, five steps away.
 * Zoro nods with total confidence and walks the other way. Desert, blizzard,
 * dinosaur, open sea, volcano, three days of night. The guest grows a beard
 * to the floor and a bird's nest. Zoro strolls back in a lei and a straw hat,
 * opens the door, finds a mop closet, shuts it, nods, and walks off the wrong
 * way again. The guest falls on his face, still pointing.
 *
 * Cuts, cue frames and chapter-style timings live in src/akki/lost/beats.json,
 * which scripts/build-akki-lost-audio.py reads too.
 */

export const LOST_FRAMES = B.frames;
const S = B.shots;
type P = [number, number];

const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
    <FxDefs />
    {children}
  </svg>
);
const Cam: React.FC<{ z?: number; cx?: number; cy?: number; tx?: number; ty?: number; rot?: number; shake?: number; f?: number; children: React.ReactNode }> = ({ z = 1, cx = 540, cy = 960, tx = 0, ty = 0, rot = 0, shake = 0, f = 0, children }) => {
  const sx = shake ? Math.sin(f * 2.7) * shake : 0, sy = shake ? Math.cos(f * 3.3) * shake : 0;
  return <g transform={`translate(${cx + tx + sx},${cy + ty + sy}) rotate(${rot}) scale(${z}) translate(${-cx},${-cy})`}>{children}</g>;
};
const kick = (f: number, at: number, amt = 26, decay = 4) => (f >= at ? amt * Math.exp(-(f - at) / decay) : 0);
const bell = (t: number, c: number, w: number) => Math.exp(-((t - c) * (t - c)) / (2 * w * w));

/* ---------------------------------- poses ---------------------------------- */

const GS = 0.78; // hallway figure scale
const GUEST_X = 190;
const GUEST_POINT: Pose = pose({ turn: 0.55, shR: [94, -806], elR: [270, -800], haR: [430, -808], hR: "point", elL: [-110, -612], haL: [-112, -446] });
const jab = (t: number): Pose => ({ ...GUEST_POINT, haR: [430 + 16 * Math.max(0, Math.sin(t * 0.9)), -808], elR: [270 + 8 * Math.max(0, Math.sin(t * 0.9)), -800] });
const GREET: Pose = pose({ turn: 0.5, elR: [176, -690], haR: [196, -772], hR: "hold", elL: [-110, -612], haL: [-112, -446] });

/* ---------------------------------- shots ---------------------------------- */

/** 1. wide: "it's RIGHT there" */
const ShotHall: React.FC<{ t: number; f: number }> = ({ t, f }) => (
  <Cam z={1 + t * 0.0016} cx={540} cy={1100} f={f}>
    <Hall t={f} />
    <StepPath t={t} />
    <Regular p={jab(t)} x={GUEST_X} y={FLOOR_Y} s={GS} face="grin" lw={4} />
    {/* emphasis ticks off the fingertip */}
    {[-1, 0, 1].map((k) => <path key={k} d={`M${GUEST_X + 470 * GS + 14},${FLOOR_Y - 810 * GS + k * 30} l${22 + 8 * Math.max(0, Math.sin(t * 0.9))},${k * 12}`} stroke={INK} strokeWidth={6} strokeLinecap="round" />)}
    <ZoroPre p={CONFIDENT} x={640} y={FLOOR_Y} s={GS} face="calm" />
  </Cam>
);

/** 1b. in on Zoro: the nod of total confidence */
const ShotNod: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const dip = (a: number) => bell(t, a, 1.5) * 44;
  const d = dip(B.nodAt[0] - S.nod[0] + 1) + dip(B.nodAt[1] - S.nod[0] + 1);
  const p: Pose = { ...CONFIDENT, head: [0, -905 + d], tilt: d * 0.12 };
  return (
    <Cam z={2.3} cx={640} cy={900} tx={-100} ty={100} f={f}>
      <Hall t={f} />
      <Regular p={jab(t + 30)} x={GUEST_X} y={FLOOR_Y} s={GS} face="grin" lw={4} />
      <ZoroPre p={p} x={640} y={FLOOR_Y} s={GS} face={d > 18 ? "closed" : "smirk"} lw={2.4} />
    </Cam>
  );
};

/** 2. worm's-eye on the boots, walking the wrong way */
const ShotBoots: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const p = walkPose(t + 2, { stride: 130, lift: 80, swing: 60 });
  const x = lerp(900, 330, t / 12);
  return (
    <Cam z={1} ty={240} f={f} shake={2}>
      <rect x={-100} y={-600} width={W + 200} height={1000} fill="#3a2a24" />
      <Hall t={f} />
      <StepPath t={0} ghost />
      <DustTrail t={t} x={x + 200} y={FLOOR_Y - 10} dir={-1} r={110} every={4} />
      <ZoroPre p={p} x={x} y={FLOOR_Y - 10} s={2.4} flipX face="calm" lw={6} />
    </Cam>
  );
};

/** 3. the guest's deadpan */
const ShotDeadpan: React.FC<{ t: number }> = ({ t }) => (
  <>
    <BrushBlue seed={3} />
    <Cam z={1 + t * 0.004} cy={900} f={t}><RegularWrinkled /></Cam>
    {t >= 3 && [0, 1, 2].map((i) => t >= 3 + i * 2 && <circle key={i} cx={360 + i * 180} cy={380} r={52 * (1 + 0.3 * bell(t, 4 + i * 2, 1.1))} fill="#fff" stroke={INK} strokeWidth={14} />)}
  </>
);

/* ----------------------------- the montage worlds ----------------------------- */

const ZX = 520, ZY = 1700;

const ShotDesert: React.FC<{ t: number }> = ({ t }) => {
  const sc = t * 26;
  const k = ease(t, 10, 14);
  const walk = walkPose(t + 3, { stride: 112, lift: 70, swing: 70 });
  const shake = bell(t, 17.5, 1.8);
  const empty = ease(t, 19, 21);
  const p: Pose = { ...walk, elR: lerpPose(walk, { ...walk, elR: [196, -770] }, k).elR, haR: [lerp(walk.haR[0], 80, k), lerp(walk.haR[1], -884, k)], hR: k > 0.5 ? "hold" : walk.hR, tilt: -8 * k * (1 - empty), head: [walk.head[0], -905] };
  const ang = -118 + Math.sin(t * 2.4) * 16 * shake - 8 * empty;
  return (
    <Cam z={1 + t * 0.002} cx={540} cy={1300} f={t}>
      <Desert sc={sc} t={t} />
      <DustTrail t={t} x={ZX} y={ZY - 4} dir={-1} r={70} />
      <ZoroPre p={p} x={ZX} y={ZY + bob(t + 3)} s={1} flipX face={k > 0.5 && empty < 0.5 ? "closed" : "narrow"} lw={4}>
        {k > 0.1 && <CanteenProp x={78 - (1 - k) * 80} y={-890 + (1 - k) * 100} a={ang} s={1.15} />}
      </ZoroPre>
      {/* the single drop that does come out, and it is sweat */}
      {t >= 15 && t < 22 && <Sweat x={ZX - 80} y={ZY - 800 + (t - 15) * (t - 15) * 7} s={0.8} />}
      {[0, 1, 2].map((i) => {
        const a = mod(t * 1.3 + i * 8, 22) / 22;
        return <Sweat key={i} x={ZX + 40 + 90 * a * (i + 1) * 0.6} y={ZY - 1010 + 330 * a * a - 90 * a} s={0.8 - a * 0.3} rot={-20 * a} />;
      })}
    </Cam>
  );
};

const ShotSnow: React.FC<{ t: number }> = ({ t }) => {
  const sc = t * 26;
  const walk = walkPose(t + 5, { stride: 110, lift: 70, swing: 70 });
  return (
    <Cam z={1.12} cx={540} cy={1500} rot={-4} f={t} shake={2}>
      <Snow sc={sc} t={t} />
      {/* footprints he leaves behind */}
      {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={ZX + 120 + i * 120 + (t % 3) * 4} cy={ZY + 6} rx={36} ry={10} fill="#bcd3e6" />)}
      <ZoroPre p={walk} x={ZX} y={ZY + bob(t + 5, 12, 8)} s={1} flipX face="calm" lw={4}>
        <Frosted p={walk} k={0.5 + 0.5 * ease(t, 0, 16)} />
      </ZoroPre>
      {/* breath, calm and regular */}
      {[0, 1].map((i) => {
        const a = mod(t + i * 6, 12) / 12;
        return <circle key={i} cx={ZX - 30 - a * 120} cy={ZY - 850 - a * 40} r={14 + a * 40} fill="#fff" stroke={INK} strokeWidth={4} opacity={1 - a} />;
      })}
    </Cam>
  );
};

const ShotJungle: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const sc = t * 26;
  const walk = walkPose(t + 1, { stride: 100, lift: 60, swing: 60 });
  const zx = 215;
  const trip = B.trip - S.jungle[0]; // 14
  const tr = Math.max(0, t - (trip - 1));
  const fall = ease(t, trip - 1, trip + 3);
  const rot = -40 * fall + (t > trip + 3 ? 4 * bell(t, trip + 5, 1.5) : 0);
  const logX = 485 + t * 26;
  const dinoX = 990 + (t > trip - 1 ? (t - (trip - 1)) * 26 * 0.0 : 0) + (t > trip + 4 ? (t - trip - 4) * 26 : 0);
  const sq = t > trip + 2 ? 1 + 0.18 * bell(t, trip + 3.5, 1.2) : 1;
  return (
    <Cam z={1} cx={540} cy={1400} f={f} shake={kick(t, trip + 3, 16, 3)}>
      <Jungle sc={sc} t={t} />
      {/* the log that does it */}
      <g transform={`translate(${logX},${ZY - 4})`}>
        <path d="M-90,-50 L90,-50 Q112,-24 90,2 L-90,2 Q-112,-24 -90,-50Z" fill="#7a5230" stroke={INK} strokeWidth={6} />
        <ellipse cx={90} cy={-24} rx={18} ry={26} fill="#c9985a" stroke={INK} strokeWidth={5} />
        <path d="M-70,-30 h110" stroke="#5a3a20" strokeWidth={4} />
      </g>
      <Dino x={dinoX} y={ZY} s={0.98} run={t * 0.6} jaw={t < trip - 1 ? 14 + 26 * Math.abs(Math.sin(t * 0.8)) : 6} rot={rot} sx={1 / sq} sy={sq} pivot={[-70, 0]} dazed={fall >= 1 ? t - trip : 0} />
      {tr > 3 && <Puff x={dinoX - 180} y={ZY - 20} r={150} t={(tr - 3) / 12} />}
      <DustTrail t={t} x={zx} y={ZY - 4} dir={-1} r={60} />
      <ZoroPre p={walk} x={zx} y={ZY + bob(t + 1)} s={1} flipX face="calm" lw={4} />
    </Cam>
  );
};

const ShotOcean: React.FC<{ t: number }> = ({ t }) => {
  const walk = walkPose(t + 2, { stride: 80, lift: 50, swing: 50 });
  const tilt = Math.sin(t * 0.38) * 4;
  const rise = Math.sin(t * 0.38 + 1) * 22;
  const land = B.land - S.ocean[0];
  const gx = t < land ? lerp(1250, ZX - 20, ease(t, 0, land)) : ZX - 20;
  const gy = t < land ? lerp(300, ZY - 1010 + 30 + rise, ease(t, 0, land)) - Math.sin(t * 1.4) * 30 * (1 - ease(t, 0, land)) : ZY - 1010 + 30 + rise;
  return (
    <Cam z={1} cx={540} cy={1300} rot={-5} f={t}>
      <Ocean t={t} />
      <g transform={`translate(0,${rise}) rotate(${tilt} 540 1640)`}>
        {/* the raft: one plank */}
        <path d="M200,1648 L880,1648 L900,1692 L216,1692Z" fill="#b8814a" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <path d="M200,1648 L880,1648 L876,1664 L206,1664Z" fill="#d8a468" />
        {[300, 420, 700, 800].map((x) => <path key={x} d={`M${x},1674 h30`} stroke="#7a5230" strokeWidth={4} strokeLinecap="round" />)}
        {[250, 840].map((x) => <circle key={x} cx={x} cy={1660} r={6} fill="#d8d8de" stroke={INK} strokeWidth={3} />)}
        <ZoroPre p={walk} x={ZX} y={1650 + bob(t + 2, 12, 6)} s={1} flipX face="narrow" lw={4} />
      </g>
      {/* a fin, circling, no interest */}
      <path d={`M${200 + t * 14},1790 q30,-90 90,-100 q-14,52 10,100Z`} fill="#4a6a86" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <OceanFront t={t} />
      {t < land ? <Seagull x={gx} y={gy} s={1.1} flap={t * 1.5} /> : <Seagull x={gx} y={gy} s={1.1} perched look={-1} />}
    </Cam>
  );
};

const ShotVolcano: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const sc = t * 26;
  const bt = B.boom - S.volcano[0]; // 13
  const erupt = ease(t, bt, bt + 7);
  const trench = 150 + t * 26;
  const stepK = bell(t, 8.5, 2.2);
  const walk = walkPose(t + 3, { stride: 112 + 60 * stepK, lift: 70 + 190 * stepK, swing: 70 });
  const post = Math.max(0, t - (bt + 3));
  return (
    <Cam z={1.14} cx={540} cy={1700} rot={3} f={f} shake={kick(f, B.flash[1], 28, 4)}>
      <Volcano sc={sc} t={t} erupt={erupt} />
      <LavaRiver x={trench} y={ZY - 20} t={t} />
      {t >= bt && t < bt + 8 && <Boom x={520} y={780} r={560} t={(t - bt) / 8} seed={4} />}
      {t > bt + 2 && <Smoke x={520} y={700} r={320} t={post / 14} c="#4a3a46" />}
      <ZoroPre p={walk} x={ZX} y={ZY + bob(t + 3) * (1 - stepK)} s={1} flipX face="calm" lw={4} />
      {post > 0 && Array.from({ length: 8 }, (_, i) => <circle key={i} cx={mod(rnd(i, 7) * 1100, 1100)} cy={mod(rnd(i, 8) * 600 + post * 50, 1700)} r={8 + rnd(i, 9) * 10} fill={i % 2 ? "#3a2a30" : "#ffb02e"} stroke={INK} strokeWidth={3} />)}
    </Cam>
  );
};

const NoseBubble: React.FC<{ p: Pose; t: number }> = ({ p, t }) => {
  const r = 12 + 26 * (0.5 + 0.5 * Math.sin(t * 0.55));
  return (
    <g transform={`translate(${p.head[0]},${p.head[1]}) scale(1.1)`}>
      <circle cx={p.turn * 12 + 20 + r * 0.6} cy={30 + r * 0.3} r={r} fill="#d8f3ff" fillOpacity={0.75} stroke={INK} strokeWidth={3.4} />
      <path d={`M${p.turn * 12 + 20 + r * 0.2},${30 + r * 0.1} q${r * 0.2},${-r * 0.5} ${r * 0.7},${-r * 0.4}`} stroke="#fff" strokeWidth={3.6} fill="none" strokeLinecap="round" />
    </g>
  );
};

const ShotNight: React.FC<{ t: number }> = ({ t }) => {
  const sc = t * 26;
  const walk = walkPose(t + 4, { stride: 100, lift: 56, swing: 50 });
  return (
    <Cam z={1.02} cx={540} cy={1300} f={t}>
      <Night sc={sc} t={t} />
      <ZoroPre p={walk} x={ZX} y={ZY + bob(t + 4, 12, 8)} s={0.95} flipX face="closed" lw={4}>
        <NoseBubble p={walk} t={t} />
      </ZoroPre>
      <Calendar t={t} flips={[B.flip[0] - S.night[0], B.flip[1] - S.night[0]]} x={540} y={360} s={0.92} />
    </Cam>
  );
};

/** whip-pan wrapper: scenes slide in from the right and out to the left with a horizontal smear */
const Whip: React.FC<{ t: number; children: React.ReactNode }> = ({ t, children }) => {
  const inn = t < 3 ? (3 - t) / 3 : 0;
  const out = t >= 21 ? (t - 20) / 3 : 0;
  const k = Math.max(inn, out);
  const dx = inn * W * 0.95 - out * W * 0.95;
  const id = "smear";
  return (
    <g>
      <defs><filter id={id} x="-30%" y="0" width="160%" height="100%"><feGaussianBlur stdDeviation={`${Math.round(k * 70)} 0`} /></filter></defs>
      {k > 0 && <rect width={W} height={H} fill="#f3e3b8" />}
      <g transform={`translate(${dx},0)`} filter={k > 0 ? `url(#${id})` : undefined}>{children}</g>
      {k > 0 && (
        <g stroke="#fff" strokeLinecap="round" opacity={0.75 * k}>
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M0,${160 + i * 150 + rnd(i, 3) * 60} L${W},${160 + i * 150 + rnd(i, 3) * 60}`} strokeWidth={5 + rnd(i, 5) * 12} />)}
        </g>
      )}
    </g>
  );
};

/* ------------------------------------ the guest ages ------------------------------------ */

const AgedPose = (t: number): Pose => ({ ...GUEST_POINT, haR: [430 + Math.sin(t * 1.7) * 3, -808 + Math.sin(t * 2.3) * 3] });

const ShotAged: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const tx = lerp(1300, -260, t / 23);
  return (
    <Cam z={1 + t * 0.002} cx={540} cy={1100} f={f}>
      <Hall aged t={f} />
      <StepPath t={0} ghost />
      <OldGuest p={AgedPose(t)} x={GUEST_X} y={FLOOR_Y} s={GS} face="blank" t={t} chirp={t === 9 || t === 10 || t === 16 ? 1 : 0} />
      <Tumbleweed x={tx} y={FLOOR_Y + 70 - Math.abs(Math.sin(t * 0.7)) * 70} r={70} rot={-t * 28} />
      {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={rnd(i, 1) * W} cy={mod(rnd(i, 2) * 1400 + t * (2 + rnd(i, 3) * 3), 1400) + 400} r={2 + rnd(i, 4) * 3} fill="#fff" opacity={0.5} />)}
    </Cam>
  );
};

/** a footstep from somewhere: close on his face, the nest bird startles */
const ShotListen: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const th = B.stepThud - S.listen[0];
  const turn = ease(t, th + 3, th + 8) * 0.7;
  const wide = t >= th + 3;
  const bird = t >= th && t < th + 4 ? -26 : 0;
  return (
    <>
      <Cam z={2.6} cx={300} cy={900} tx={240} ty={80} f={f}><Hall aged t={f} /></Cam>
      {/* dust shaken from the ceiling */}
      <Cam shake={kick(t, th, 14, 3)} f={f}>
        <g transform={`translate(540,${880 + bird * 0.3}) scale(5.2)`}>
          <GuestHead face={wide ? "shock" : "blank"} turn={turn} lw={1.1} />
          <OldHeadExtras len={640} t={t} lw={1.1} chirp={t >= th && t < th + 6 ? 1 : 0} />
        </g>
        {t >= th && Array.from({ length: 14 }, (_, i) => <circle key={i} cx={rnd(i, 1) * W} cy={mod(rnd(i, 2) * 500 + (t - th) * 40, 1500)} r={5 + rnd(i, 3) * 7} fill="#d8cdb0" stroke={INK} strokeWidth={2.6} />)}
      </Cam>
    </>
  );
};

/** Zoro strolls in from the other end, in a lei and a straw hat, coconut in hand */
const ShotEnter: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const walk = walkPose(t + 2, { stride: 150, lift: 80, swing: 40 });
  const x = lerp(1330, 800, t / 11);
  return (
    <Cam z={1 + t * 0.002} cx={540} cy={1100} f={f} shake={kick(f, B.stepThud + 12, 4, 3)}>
      <Hall aged t={f} />
      <OldGuest p={AgedPose(t)} x={GUEST_X} y={FLOOR_Y} s={GS} face="blank" t={t} />
      <DustTrail t={t} x={x} y={FLOOR_Y - 4} dir={-1} r={50} every={4} />
      <ZoroPre p={{ ...walk, turn: 0.85 }} x={x} y={FLOOR_Y + bob(t + 2, 12, 8)} s={GS} flipX face="smirk" lw={4}>
        <Souvenirs p={walk} />
      </ZoroPre>
    </Cam>
  );
};

/** he sobs with joy: tears in geysers; Zoro arrives at the edge of frame and nods */
const ShotSob: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const sob = Math.sin(t * 2.3) * 7;
  const zin = ease(t, 2, 9);
  const nod = bell(t, 15, 1.6) * 30 + bell(t, 20, 1.6) * 30;
  const zp: Pose = { ...GREET, head: [0, -905 + nod], tilt: nod * 0.1 };
  const hx = 420, hy = 900 + sob;
  return (
    <>
      <Cam z={2.6} cx={300} cy={900} tx={240} ty={80} f={f}><Hall aged t={f} dark={0.1} /></Cam>
      <g transform={`translate(${hx},${hy}) scale(${5.2 + Math.sin(t * 2.3) * 0.1})`}>
        <GuestHead face="grin" turn={0.15} lw={1.1} />
        <OldHeadExtras len={640} t={t} lw={1.1} wide={1} chirp={t % 6 < 2 ? 1 : 0} />
      </g>
      <TearGeyser x={hx - 20 * 5.2} y={hy - 2 * 5.2} dir={-1} t={t * 1.0} power={1.1} seed={1} />
      <TearGeyser x={hx + 20 * 5.2} y={hy - 2 * 5.2} dir={1} t={t * 1.0 + 3} power={1.1} seed={5} />
      {/* a puddle forming under the whole thing */}
      <ellipse cx={540} cy={1930} rx={200 + t * 30} ry={40 + t * 3} fill="#6fd0ff" stroke={INK} strokeWidth={6} />
      <ZoroPre p={zp} x={lerp(1500, 880, zin)} y={2330} s={1.6} flipX face={nod > 14 ? "closed" : "smirk"} lw={3.4}>
        <Souvenirs p={zp} />
      </ZoroPre>
    </>
  );
};

/* ------------------------------------ the door ------------------------------------ */

const GuestJoy: React.FC<{ t: number; p?: Pose; rot?: number }> = ({ t, p = AgedPose(t), rot = 0 }) => (
  <g>
    <g transform={`rotate(${rot} ${GUEST_X} ${FLOOR_Y})`}>
      <OldGuest p={p} x={GUEST_X} y={FLOOR_Y} s={GS} face="grin" t={t} />
    </g>
    {rot === 0 && (
      <>
        <TearGeyser x={GUEST_X - 22} y={FLOOR_Y - 905 * GS - 4} dir={-1} t={t} power={0.35} seed={2} />
        <TearGeyser x={GUEST_X + 30} y={FLOOR_Y - 905 * GS - 4} dir={1} t={t + 2} power={0.35} seed={6} />
      </>
    )}
  </g>
);

const ShotToDoor: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const x = lerp(560, 735, ease(t, 0, 14));
  const walk = t < 14 ? walkPose(t + 2, { stride: 56, lift: 40, swing: 30, turn: 0.85 }) : walkPose(0, { stride: 0, lift: 0, swing: 0 });
  const p: Pose = t >= 12 ? { ...walk, elR: [200, -760], haR: [330, -760], hR: "open" } : walk;
  return (
    <Cam z={1} cx={540} cy={1100} f={f}>
      <Hall aged t={f} />
      <StepPath t={0} ghost />
      <GuestJoy t={t} />
      <ZoroPre p={p} x={x} y={FLOOR_Y + bob(t + 2, 12, 5) * (t < 14 ? 1 : 0)} s={GS} face="smirk" lw={4}>
        <Souvenirs p={p} />
      </ZoroPre>
    </Cam>
  );
};

const ShotCloset: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const open = ease(t, 0, 5) * (1 - ease(t, 8, 11));
  const p: Pose = pose({ turn: 0.85, elR: [200, -760], haR: [330, -760 + open * 20], hR: "open", elL: [-110, -612], haL: [-112, -446], head: [30 * open, -905], tilt: 4 * open });
  return (
    <Cam z={2.3} cx={900} cy={1040} tx={-230} ty={-80} f={f}>
      <Hall aged t={f} open={open} />
      <ZoroPre p={p} x={690} y={FLOOR_Y} s={GS} face="narrow" lw={2.6}>
        <Souvenirs p={p} />
      </ZoroPre>
      {/* a single fly, because nobody has opened this in years */}
      <g transform={`translate(${880 + Math.sin(t * 1.3) * 40},${900 + Math.cos(t * 1.9) * 30})`}><circle r={5} fill={INK} /><path d="M-8,-6 l-6,-6 M8,-6 l6,-6" stroke={INK} strokeWidth={2.4} /></g>
    </Cam>
  );
};

const ShotNodBack: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const dip = (a: number) => bell(t, a, 1.4) * 36;
  const d = dip(4) + dip(9);
  const p: Pose = { ...CONFIDENT, head: [0, -905 + d], tilt: d * 0.12 };
  return (
    <Cam z={1.12} cx={560} cy={1000} f={f}>
      <Hall aged t={f} />
      <GuestJoy t={t} />
      <ZoroPre p={p} x={700} y={FLOOR_Y} s={GS} face={d > 15 ? "closed" : "smirk"} lw={4}>
        <Souvenirs p={p} />
      </ZoroPre>
    </Cam>
  );
};

const ShotWalkOff: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const walk = walkPose(t + 1, { stride: 150, lift: 80, swing: 40 });
  const x = lerp(740, 1010, t / 5);
  const lean = ease(t, 2, 6) * 7;
  return (
    <Cam z={1} cx={540} cy={1100} f={f}>
      <Hall aged t={f} />
      <g transform={`rotate(${lean} ${GUEST_X} ${FLOOR_Y})`}><OldGuest p={AgedPose(t)} x={GUEST_X} y={FLOOR_Y} s={GS} face="blank" t={t} /></g>
      <DustTrail t={t} x={x} y={FLOOR_Y - 4} dir={1} r={50} every={3} />
      <ZoroPre p={walk} x={x} y={FLOOR_Y + bob(t + 1, 12, 8)} s={GS} face="smirk" lw={4}>
        <Souvenirs p={walk} />
      </ZoroPre>
    </Cam>
  );
};

/** he topples, face first, arm still out */
const ShotFall: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const g = Math.min(1, t / 7);
  const th = 72 * g * g + (t > 7 ? -3 * bell(t, 8, 0.8) : 0);
  const a = (th * Math.PI) / 180;
  // keep the pointing arm level in world space as the body rotates
  const arm = (len: number): P => [Math.cos(-a) * len, Math.sin(-a) * len];
  const sh: P = [94, -806];
  const e = arm(176), h = arm(336);
  const p: Pose = { ...GUEST_POINT, elR: [sh[0] + e[0], sh[1] + e[1]], haR: [sh[0] + h[0], sh[1] + h[1]], tilt: -th * 0.3, head: [10, -905] };
  const hit = t >= 8;
  return (
    <Cam z={1} cx={540} cy={1100} f={f} shake={hit ? kick(t, 8, 22, 3) : 0}>
      <Hall aged t={f} />
      <g transform={`rotate(${th} ${GUEST_X} ${FLOOR_Y})`}>
        <OldGuest p={p} x={GUEST_X} y={FLOOR_Y} s={GS} face="shock" t={t} />
      </g>
      {hit && (
        <>
          <Puff x={GUEST_X + 640} y={FLOOR_Y + 20} r={200} t={(t - 8) / 6} c="#e8dcc0" />
          <Puff x={GUEST_X + 480} y={FLOOR_Y + 30} r={160} t={(t - 8.5) / 6} c="#e8dcc0" />
          <Puff x={GUEST_X + 300} y={FLOOR_Y + 30} r={120} t={(t - 9) / 6} c="#e8dcc0" />
        </>
      )}
    </Cam>
  );
};

/** hold on the door: the hand, still pointing */
const ShotDoor: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const wob = Math.sin(t * 0.8) * 2;
  const sk = G.skin;
  return (
    <Cam z={1.7 + t * 0.006} cx={900} cy={1100} tx={-120} ty={-120} f={f}>
      <Hall aged t={f} />
      {/* the arm comes in from the lower left, hand pointing up at the door */}
      <Part d={tube([[300, 1700], [560, 1560], [700 + wob, 1470]], [34, 30, 26])} fill={sk.base} shade={sk.shade} lw={5} />
      <Part d={tube([[300, 1700], [420, 1640]], [48, 44])} fill={G.tee} shade={G.teeS} lw={5} />
      <Hand at={[700 + wob, 1470]} dir={-30} kind="point" s={1.9} skin={sk.base} shade={sk.shade} lw={5} />
      {/* the beard, spilled across the floor */}
      <path d="M-100,1740 Q200,1690 380,1760 Q300,1830 -100,1820Z" fill="#e6e3dc" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <Puff x={380} y={1700} r={170} t={Math.min(1, t / 16) * 0.8 + 0.15} c="#e8dcc0" />
      {/* the nest bird, flown, now on the sign */}
      <g transform={`translate(${880 + (t < 5 ? (5 - t) * -60 : 0)},${520 - Math.abs(Math.sin(t * 0.9)) * (t < 5 ? 80 : 4)})`}>
        <ellipse cx={0} cy={-6} rx={30} ry={26} fill="#4b8de0" stroke={INK} strokeWidth={4} />
        <circle cx={14} cy={-14} r={5} fill="#fff" stroke={INK} strokeWidth={2} /><circle cx={15} cy={-14} r={2.4} fill={INK} />
        <path d="M26,-10 L44,-8 L26,-4Z" fill="#ffb02e" stroke={INK} strokeWidth={2.8} strokeLinejoin="round" />
      </g>
    </Cam>
  );
};

/* ---------------------------------- the edit ---------------------------------- */

const World: React.FC<{ f: number }> = ({ f }) => {
  const at = (k: keyof typeof S) => { const s = S[k] as number[]; return f >= s[0] && f < s[1] ? f - s[0] : -1; };
  let t: number;
  if ((t = at("hall")) >= 0) return <ShotHall t={t} f={f} />;
  if ((t = at("nod")) >= 0) return <ShotNod t={t} f={f} />;
  if ((t = at("boots")) >= 0) return <ShotBoots t={t} f={f} />;
  if ((t = at("deadpan")) >= 0) return <ShotDeadpan t={t} />;
  if (f >= S.desert[0] && f < S.night[1]) {
    const tl = f - S.desert[0];
    const i = Math.floor(tl / 24), t0 = tl - i * 24;
    // the impact flash on the volcano's boom
    if (f >= B.flash[0] && f < B.flash[1]) return <ImpactFlash x={540} y={1050} seed={(f % 2) + 3} />;
    return (
      <Whip t={t0}>
        {i === 0 && <ShotDesert t={t0} />}
        {i === 1 && <ShotSnow t={t0} />}
        {i === 2 && <ShotJungle t={t0} f={f} />}
        {i === 3 && <ShotOcean t={t0} />}
        {i === 4 && <ShotVolcano t={t0} f={f} />}
        {i === 5 && <ShotNight t={t0} />}
      </Whip>
    );
  }
  if ((t = at("aged")) >= 0) return <ShotAged t={t} f={f} />;
  if ((t = at("listen")) >= 0) return <ShotListen t={t} f={f} />;
  if ((t = at("enter")) >= 0) return <ShotEnter t={t} f={f} />;
  if ((t = at("sob")) >= 0) return <ShotSob t={t} f={f} />;
  if ((t = at("toDoor")) >= 0) return <ShotToDoor t={t} f={f} />;
  if ((t = at("closet")) >= 0) return <ShotCloset t={t} f={f} />;
  if ((t = at("nodBack")) >= 0) return <ShotNodBack t={t} f={f} />;
  if ((t = at("walkOff")) >= 0) return <ShotWalkOff t={t} f={f} />;
  if ((t = at("fall")) >= 0) return <ShotFall t={t} f={f} />;
  return <ShotDoor t={f - S.door[0]} f={f} />;
};

const WorldAt: React.FC = () => {
  const f = useCurrentFrame();
  return <Frame><World f={f} /></Frame>;
};

export const LostShort: React.FC<{ audio?: string | null }> = ({ audio = null }) => {
  loadAkkiFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <HandDrawn hold={2} grain={0.4} boil={0.7}>
        <WorldAt />
      </HandDrawn>
      {f < 48 && <TitleText text="ZORO GOES TO THE BATHROOM" y={243} size={50} />}
    </AbsoluteFill>
  );
};

/* --------------------------------- thumbnail --------------------------------- */

export const LostThumb: React.FC = () => {
  loadAkkiFonts();
  const t = 7;
  const walk = walkPose(t, { stride: 130, lift: 90, swing: 80 });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Frame>
        <Desert sc={140} t={4} />
        {/* a signpost pointing the opposite way */}
        <g transform="translate(860,1120)">
          <rect x={-14} y={-20} width={28} height={420} fill="#7a5230" stroke={INK} strokeWidth={6} />
          <path d="M-190,-170 L100,-170 L190,-100 L100,-30 L-190,-30Z" fill="#2563c9" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          <path d="M-150,-100 L100,-100 M60,-134 L110,-100 L60,-66" stroke="#fff" strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <OldGuest p={GUEST_POINT} x={880} y={1450} s={0.62} face="shock" t={0} />
        <ZoroPre p={walk} x={400} y={1400} s={1.3} flipX face="calm" lw={5} />
      </Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <text x={540} y={1690} textAnchor="middle" fontFamily="Poppins Black" fontSize={190} fill="#ffd400" stroke={INK} strokeWidth={34} paintOrder="stroke" strokeLinejoin="round" textLength={960} lengthAdjust="spacingAndGlyphs">WRONG</text>
        <text x={540} y={1860} textAnchor="middle" fontFamily="Poppins Black" fontSize={190} fill="#ffffff" stroke={INK} strokeWidth={34} paintOrder="stroke" strokeLinejoin="round">WAY?!</text>
      </svg>
    </AbsoluteFill>
  );
};
