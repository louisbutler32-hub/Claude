import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { HandDrawn } from "../../minecraft/handdrawn";
import { Hand, lerpPose, mix, Part, pose, Pose, Regular, SKIN, smooth, tube } from "../bowling/characters";
import { ZoroBig } from "../bowling/closeups";
import { ease, H, INK, lerp, loadAkkiFonts, TitleText, W } from "../common";
import { ImpactFlash } from "../breakfast/fx";
import { back, Berry, Cam, clamp, Frame, HLines, kick, P, PopText, QMark, rnd, Shock, SpeedLines, Spark, SweatDrop, ThumbUp, Whip } from "../buffet/fx";
import { bob, DustTrail, Puff, walkPose } from "../lost/cast";
import { Katana, ZoroPre, ZoroPreHead, ZFace } from "../zoro/cast";
import { Calculator, HawkEye, Marine, NamiFig, NamiHead, NFace, Pouch, SeaKing, SeaKingCut } from "./cast";
import { BRIDGE_Y, BridgeSet, Bolt, DECK_Y, Harbour, Jetty, MapSet, MARKET_Y, MarketSet, QUAY_Y, Rain, RockSet, Ship, SeaFront, StormSea } from "./sets";
import B from "./beats.json";

/**
 * "This Is Zoro's Biggest Fear" - 12 seconds, AKKI TALKS house style.
 *
 * Zoro fears nothing: a Sea King, a Marine army, a hawk-eyed swordsman. Then
 * Nami walks up with a receipt. 300,000,000 berries of debt. He runs (Yakety Sax
 * kicks in), goes in a circle twice, hides behind the guest (the channel owner),
 * who points straight at him and thumbs-up to Nami. Zoro is dragged away flat,
 * the guest takes a 10% commission and counts it. The first frame is a storm sea
 * again, so it loops.
 *
 * Cue frames and shot windows live in beats.json, which scripts/build-akki-fear-audio.py reads too.
 */

export const FEAR_FRAMES = B.frames; // 288 = 12.0s at 24fps
const S = B.shots as unknown as Record<string, [number, number]>;

/* ---------------------------------- poses ---------------------------------- */

const arms = (o: Partial<Pose>) => pose(o);
const Z_FOLD = arms({ elL: [-60, -640], haL: [70, -700], hL: "fist", elR: [60, -640], haR: [-70, -690], hR: "fist" });
const Z_HILT = arms({ elL: [-60, -640], haL: [70, -700], hL: "fist", elR: [150, -650], haR: [96, -480], hR: "fist" });
const Z_HEAD = arms({ elL: [-250, -820], haL: [-50, -930], hL: "relax", elR: [250, -820], haR: [50, -930], hR: "relax", tilt: -4 });
const Z_SWORDS = (t: number) => arms({ elL: [-230, -760], haL: [-360, -830 + Math.sin(t) * 10], hL: "fist", elR: [230, -760], haR: [360, -830 - Math.sin(t) * 10], hR: "fist" });
const Z_CROUCH = arms({
  head: [20, -640], neck: [14, -570], shL: [-84, -548], elL: [-150, -440], haL: [-190, -340], hL: "fist", shR: [100, -548], elR: [170, -440], haR: [196, -340], hR: "fist",
  hipL: [-60, -300], knL: [-190, -190], ftL: [-130, -14], hipR: [60, -300], knR: [190, -190], ftR: [130, -14], fdL: 0, fdR: 0,
});

/** Zoro, flat out: the run cycle, leaning into it, arms flailing */
const zoroRun = (t: number, o: { period?: number; stride?: number; flail?: number } = {}): Pose => {
  const { period = 6, stride = 150, flail = 1 } = o;
  const w = walkPose(t, { stride, lift: 120, swing: 150, period, turn: 0.9 });
  const k = Math.sin((t / period) * Math.PI * 2);
  return {
    ...w,
    head: [70, -880], neck: [40, -820], tilt: 8, shL: [-40, -806], shR: [150, -800],
    elL: [-160, -700 + k * 90 * flail], haL: [-250, -760 - k * 160 * flail], hL: "spread",
    elR: [300, -840 - k * 80 * flail], haR: [400, -980 + k * 150 * flail], hR: "spread",
  };
};

const NamiRun = (t: number, o: { stride?: number; period?: number } = {}): Pose => {
  const w = walkPose(t, { stride: o.stride ?? 130, lift: 110, swing: 100, period: o.period ?? 6, turn: 0.9 });
  return { ...w, head: [50, -880], neck: [30, -820], tilt: 6, shL: [-50, -806], shR: [140, -800], elL: [-130, -700], haL: [-140, -560 - Math.sin(t) * 20], hL: "fist", elR: [250, -830], haR: [310, -960 + Math.sin(t * 1.3) * 22], hR: "fist" };
};

/* --------------------------------- helpers --------------------------------- */

const pt = (p: Pose, k: "haL" | "haR"): P => p[k];

/** lean a runner forward about its feet */
const Lean: React.FC<{ a: number; x: number; y: number; flip?: boolean; children: React.ReactNode }> = ({ a, x, y, flip, children }) => (
  <g transform={`rotate(${flip ? -a : a} ${x} ${y})`}>{children}</g>
);

/** a receipt streaming behind a runner (body space, runner faces +x) */
const Stream: React.FC<{ from: P; t: number; len?: number }> = ({ from, t, len = 560 }) => {
  const n = 9;
  const pts = Array.from({ length: n }, (_, i): P => [from[0] - (i / (n - 1)) * len, from[1] + 30 + Math.sin(t * 0.9 + i * 0.9) * (14 + i * 4) + i * 12]);
  const d = tube(pts, pts.map(() => 24));
  return (
    <g>
      <path d={d} fill="#fffdf0" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {pts.slice(1, -1).map((p, i) => <path key={i} d={`M${p[0]},${p[1] - 14} v28`} stroke="#b8b8c0" strokeWidth={4} />)}
    </g>
  );
};

/** whole Marine crowd: rows on the bridge. `adv` slides them toward -x */
const CROWD: { col: number; row: number }[] = (() => {
  const a: { col: number; row: number }[] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) a.push({ col: c, row: r });
  return a;
})();
const ROW = [{ y: BRIDGE_Y + 30, s: 1.0 }, { y: BRIDGE_Y - 14, s: 0.84 }, { y: BRIDGE_Y - 52, s: 0.7 }];

const crowdX = (c: { col: number; row: number }, x0: number, gap: number) => x0 + c.col * gap * ROW[c.row].s + (c.row % 2) * gap * 0.45 + rnd(c.col, c.row) * 20;
const Crowd: React.FC<{ f: number; x0: number; gap?: number; fallAt?: (c: { col: number; row: number }) => number }> = ({ f, x0, gap = 215, fallAt }) => (
  <g>
    {[2, 1, 0].map((row) => CROWD.filter((c) => c.row === row).map((c) => {
      const R = ROW[row];
      const fa = fallAt ? clamp((f - fallAt(c)) / 5) : 0;
      return <Marine key={`${row}${c.col}`} x={crowdX(c, x0, gap)} y={R.y} s={R.s * 1.28} run={f * 0.9 + c.col * 1.7 + row} fall={fa} fwd dir={-1} />;
    }))}
  </g>
);

/** the white slash crescent */
const SlashArc: React.FC<{ a: P; b: P; bend: number; k: number; w?: number }> = ({ a, b, bend, k, w = 54 }) => {
  if (k <= 0) return null;
  const mid: P = [(a[0] + b[0]) / 2 + bend * 0.5, (a[1] + b[1]) / 2 + bend];
  const d = `M${a[0]},${a[1]} Q${mid[0]},${mid[1]} ${b[0]},${b[1]}`;
  return (
    <g>
      <path d={d} pathLength={1} stroke={INK} strokeWidth={w + 16} strokeLinecap="round" fill="none" strokeDasharray={`${clamp(k)} 1`} />
      <path d={d} pathLength={1} stroke="#fff" strokeWidth={w} strokeLinecap="round" fill="none" strokeDasharray={`${clamp(k)} 1`} />
    </g>
  );
};

const Droplets: React.FC<{ x: number; y: number; t: number; n?: number; r?: number; seed?: number; up?: number }> = ({ x, y, t, n = 14, r = 420, seed = 1, up = 1 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const a = (-0.15 - rnd(i, seed) * 0.7) * Math.PI;
      const v = r * (0.4 + rnd(i, seed + 1) * 0.6);
      const px = x + Math.cos(a) * v * t * (i % 2 ? 1 : -1) * 0.9;
      const py = y + Math.sin(a) * v * t * up + 520 * t * t;
      return <circle key={i} cx={px} cy={py} r={(10 + rnd(i, seed + 2) * 22) * (1 - t * 0.5)} fill="#eaf8ff" stroke={INK} strokeWidth={5} opacity={clamp(1.6 - t * 1.4)} />;
    })}
  </g>
);

/* ----------------------------------- sea shots ----------------------------------- */

const KX = 830, KY = 1500;
const ZXS = 430, ZYS = DECK_Y + 8, ZSS = 0.64;

const SeaWorld: React.FC<{ f: number; king?: React.ReactNode; zoro: React.ReactNode; flash?: number; bolt?: number; rain?: boolean }> = ({ f, king, zoro, flash = 0, bolt = 0, rain = true }) => (
  <>
    <StormSea t={f} flash={flash} />
    <Bolt x={300} k={bolt} />
    {king}
    <Ship t={f} />
    {zoro}
    <SeaFront t={f} />
    {rain && <Rain t={f} />}
  </>
);

const lightning = (f: number) => (f === 4 || f === 5 ? 1 : f === 16 || f === 17 ? 1 : f === 29 ? 1 : 0);

/** 1a - wide: the Sea King rears over the ship; Zoro, arms folded, unimpressed */
const ShotSea1: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const rise = ease(t, 0, 9);
  return (
    <Cam z={1.0 + t * 0.003} at={[540, 960]} rot={Math.sin(f * 0.4) * 1.2} shake={kick(f, B.reveal, 14, 3)} f={f}>
      <SeaWorld f={f} flash={lightning(f)} bolt={lightning(f)}
        king={<SeaKing x={KX} y={KY} lean={lerp(16, -3, rise)} jaw={lerp(8, 46, rise)} head={10} wob={f * 0.35} />}
        zoro={<ZoroPre p={Z_FOLD} x={ZXS} y={ZYS} s={ZSS} face="calm" />}
      />
    </Cam>
  );
};

/** 1b - low, tilted: the open jaw over Zoro, who yawns at it */
const ShotSea2: React.FC<{ t: number; f: number }> = ({ t, f }) => (
  <Cam at={[470, 1250]} to={[540, 1130]} z={1.55 + t * 0.012} rot={5 - t * 0.2} f={f}>
    <SeaWorld f={f} flash={lightning(f)} bolt={lightning(f)}
      king={<SeaKing x={KX} y={KY} rear={0.55} lean={-6} jaw={56 + Math.sin(t) * 3} head={22} wob={f * 0.35} />}
      zoro={<ZoroPre p={pose({ ...Z_FOLD, head: [0, -905 + Math.sin(t * 0.5) * 3] })} x={ZXS} y={ZYS} s={ZSS} face="narrow" />}
    />
  </Cam>
);

/** 1c - the lunge: teeth coming straight down; Zoro's hand finds a hilt, he smirks */
const ShotSea3: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const k = ease(t, 0, 7);
  return (
    <Cam at={[440, 1150]} to={[540, 1050]} z={lerp(1.35, 1.6, k)} rot={lerp(-4, -9, k)} shake={t > 6 ? 6 : 0} f={f}>
      <SeaWorld f={f} flash={lightning(f)} bolt={lightning(f)}
        king={<SeaKing x={KX} y={KY} rear={lerp(0.5, 0, k)} lean={-4} jaw={lerp(40, 66, k)} head={lerp(24, 40, k)} wob={f * 0.3} />}
        zoro={<ZoroPre p={Z_HILT} x={ZXS} y={ZYS} s={ZSS} face={t > 5 ? "smirk" : "narrow"} />}
      />
      {t > 6 && <SpeedLines x={470} y={1000} n={18} r0={300} r1={1500} seed={3 + f} c="#ffffff" w={0.05} o={0.35} />}
    </Cam>
  );
};

/** 2a - one draw: Zoro blurs through a lunge, the white slash crosses the frame */
const ShotDraw: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const wind = ease(t, 0, 2);
  const lunge = ease(t, 2, 4);
  const p = pose({
    head: [lerp(0, 120, lunge), -905 + 60 * lunge], tilt: 14 * lunge, neck: [lerp(0, 90, lunge), -830 + 60 * lunge], turn: 0.6, shL: [-94 + 80 * lunge, -806 + 60 * lunge], shR: [94 + 90 * lunge, -806 + 60 * lunge],
    elL: [lerp(-60, -140, lunge), -640], haL: [lerp(70, -230, lunge), lerp(-700, -560, lunge)], hL: "fist",
    elR: [lerp(150, 330, lunge), lerp(-650, -840, lunge)], haR: [lerp(96, 570, lunge), lerp(-480, -820, lunge)], hR: "fist",
    knL: [lerp(-52, -190, lunge), -254], ftL: [lerp(-58, -310, lunge), -14], knR: [lerp(52, 250, lunge), -270], ftR: [lerp(58, 330, lunge), -14],
  });
  return (
    <Cam at={[540, 1100]} z={lerp(1.2, 1.5, lunge)} rot={lerp(-3, -10, lunge)} shake={t > 3 ? 8 : 0} f={f}>
      <SeaWorld f={f}
        king={<SeaKing x={KX} y={KY} rear={0} lean={-4} jaw={70} head={40} wob={f * 0.3} />}
        zoro={
          <ZoroPre p={p} x={ZXS + 160 * lunge} y={ZYS} s={ZSS * 1.15} face="narrow">
            <Katana x={p.haR[0] - 10} y={p.haR[1] + 10} a={lerp(150, -20, wind)} len={560} sheathed={false} />
          </ZoroPre>
        }
      />
      {t >= 3 && <SlashArc a={[-60, 1750]} b={[1100, 640]} bend={-260} k={(t - 3) / 2.2} />}
      <HLines y0={900} y1={1500} n={9} seed={f} x0={-40} x1={1100} sw={9} o={0.7} />
    </Cam>
  );
};

/** 2b - the cut: the Sea King in two, spray; Zoro sheathes without looking back */
const ShotSplit: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const k = clamp((t - 2) / 9);
  const sheath = ease(t, 3, 11);
  const turnAway = ease(t, 0, 8);
  const p = pose({ ...Z_HILT, turn: lerp(0.5, 0.95, turnAway), elR: [lerp(330, 150, sheath), lerp(-840, -650, sheath)], haR: [lerp(570, 96, sheath), lerp(-820, -480, sheath)], head: [lerp(60, 20, sheath), -905] });
  return (
    <Cam at={[540, 1000]} z={1.05 + t * 0.003} rot={-2 + t * 0.15} shake={kick(f, 45, 22, 3)} f={f}>
      <SeaWorld f={f}
        king={<SeaKingCut k={k} x={KX} y={KY} rear={0} lean={-4} jaw={70 - 30 * k} head={40 - 10 * k} wob={f * 0.3} />}
        zoro={
          <ZoroPre p={p} x={ZXS} y={ZYS} s={ZSS} face="closed">
            <Katana x={lerp(p.haR[0] - 10, 96, sheath)} y={lerp(p.haR[1] + 10, -480, sheath)} a={lerp(150, 78, sheath)} len={560 - 60 * sheath} sheathed={false} />
          </ZoroPre>
        }
      />
      {t < 5 && <SlashArc a={[-60, 1750]} b={[1100, 640]} bend={-260} k={1} w={Math.max(8, 54 - t * 12)} />}
      <Droplets x={KX - 80} y={KY - 300} t={clamp((t - 2) / 12)} n={18} r={520} seed={4} />
      <Droplets x={KX + 120} y={KY} t={clamp((t - 3) / 12)} n={14} r={420} seed={8} />
      {t >= 10 && t < 13 && <Spark x={ZXS + 120} y={ZYS - 300} r={50 - (t - 10) * 14} c="#ffffff" />}
    </Cam>
  );
};

/* ----------------------------------- marine shots ----------------------------------- */

const ZBX = 300, ZBY = BRIDGE_Y + 36;

/** 3a - low and tilted: the whole army charging; Zoro walks into it, three swords out */
const ShotBridge1: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const p = { ...walkPose(t, { stride: 70, lift: 50, swing: 0, period: 14, turn: 0.9 }), ...Z_SWORDS(t) };
  const x0 = 1150 - t * 50;
  return (
    <Cam at={[540, 1500]} to={[540, 1380]} z={1.0 + t * 0.006} rot={-8} shake={t > 3 ? 4 : 0} f={f}>
      <BridgeSet t={f} />
      <Crowd f={f} x0={x0} />
      <ZoroPre p={p} x={ZBX + t * 14} y={ZBY + bob(t, 14, 8)} s={0.66} face="smirk" swords={false}>
        <Katana x={p.haL[0] - 10} y={p.haL[1]} a={188} len={600} sheathed={false} />
        <Katana x={p.haR[0] + 10} y={p.haR[1]} a={-8} len={600} sheathed={false} />
        <g transform={`translate(${p.head[0]},${p.head[1]}) scale(1.1)`}><Katana x={-110} y={44} a={0} len={520} sheathed={false} wrap="#c43030" /></g>
      </ZoroPre>
      {t >= 3 && t < 8 && <SlashArc a={[ZBX + 180, 1060]} b={[ZBX + 760, 1500]} bend={-140} k={(t - 3) / 3} w={44} />}
    </Cam>
  );
};

/** 3b - the dominoes; Zoro yawns */
const ShotBridge2: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const p = { ...walkPose(t + 3, { stride: 70, lift: 50, swing: 40, period: 14, turn: 0.9 }), ...arms({ elL: [-140, -690], haL: [-230, -560], hL: "fist", elR: [200, -760], haR: [90, -980], hR: "relax" }) };
  const yawn = ease(t, 2, 6) * (1 - ease(t, 10, 12));
  return (
    <Cam at={[540, 1500]} to={[540, 1400]} z={1.05} rot={7 - t * 0.2} f={f}>
      <BridgeSet t={f} />
      <Crowd f={f} x0={-120 - t * 4} gap={150} fallAt={(c) => B.domino[0] - 2 + (5 - c.col) * 1.5 + c.row * 0.5} />
      <ZoroPre p={p} x={720 + t * 8} y={ZBY + bob(t, 14, 6)} s={0.68} face="closed" swords={false}>
        <Katana x={p.haL[0] - 10} y={p.haL[1]} a={188} len={600} sheathed={false} />
        <Katana x={p.haR[0]} y={p.haR[1]} a={-70} len={600} sheathed={false} />
        <g transform={`translate(${p.head[0]},${p.head[1]}) scale(1.1)`}>
          <ellipse cx={14} cy={52} rx={4 + 14 * yawn} ry={3 + 22 * yawn} fill="#6a1418" stroke={INK} strokeWidth={3} />
        </g>
      </ZoroPre>
      {CROWD.filter((c) => c.row === 0).map((c) => <Puff key={c.col} x={crowdX(c, -120 - t * 4, 150) - 120} y={BRIDGE_Y + 30} r={90} t={clamp((f - (B.domino[0] + 1 + (5 - c.col) * 1.5)) / 8)} c="#e8dfd0" />)}
    </Cam>
  );
};

/** 4a - the hawk-eyed swordsman on his rock; Zoro on his, not flinching */
const ShotHawk: React.FC<{ t: number; f: number }> = ({ t, f }) => (
  <Cam at={[540, 1060]} z={1.0 + t * 0.006} rot={-2} f={f}>
    <RockSet t={f} />
    <HawkEye x={880} y={1020} s={0.68} flipX coat={f * 0.5} />
    <ZoroPre p={Z_FOLD} x={190} y={1410} s={0.62} face="smirk" />
    <Shock x={880} y={470} t={clamp((t + 1) / 10)} r={900} />
    <g transform="translate(786,462)"><Spark x={0} y={0} r={26 + 8 * Math.sin(t * 2)} c="#fff6a0" /></g>
    <HLines y0={1100} y1={1500} n={7} seed={f} x0={300} x1={900} sw={5} o={0.5} />
  </Cam>
);

/** 4b - Zoro's face: calm, one eye closed, scar, a smirk */
const ShotFace: React.FC<{ t: number; f: number }> = ({ t, f }) => (
  <>
    <g>
      <rect width={W} height={H} fill="#ffd45a" />
      <SpeedLines x={540} y={900} n={22} r0={140} r1={1800} seed={7 + Math.floor(t / 3)} c="#ffb52a" w={0.08} o={1} />
    </g>
    <Cam at={[540, 900]} z={1 + t * 0.006} f={f}>
      <g transform="translate(560,960) scale(2.35)"><ZoroBig expr="smug" lw={4} /></g>
      <Spark x={440} y={1260} r={28 + 6 * Math.sin(t)} c="#ffffff" />
    </Cam>
  </>
);

/* ----------------------------------- the turn ----------------------------------- */

/** 5a - sunny harbour, over Zoro's shoulder; tiny Nami walks up with a receipt */
const ShotHarbour: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const nx = lerp(900, 800, t / 12);
  const un = clamp((t - 1) / 9);
  const np = walkPose(t * 1.4, { stride: 70, lift: 50, swing: 30, period: 14, turn: -0.9 });
  const pn = { ...np, elL: [-130, -690] as P, haL: [-150, -540] as P, hL: "fist" as const };
  return (
    <Cam at={[560, 1100]} z={1.0} f={f}>
      <Harbour t={f} />
      <NamiFig p={{ ...pn, turn: 0.9 }} x={nx} y={QUAY_Y + 36 + bob(t, 14, 3)} s={0.22} flipX face="smile">
        <ReceiptDrop x={pn.haL[0]} y={pn.haL[1]} un={un} />
      </NamiFig>
      <ZoroPre p={{ ...Z_HEAD, turn: -0.35 }} x={260} y={1900} s={1.22} face="calm" />
    </Cam>
  );
};
/** the receipt hanging from Nami's hand and unrolling along the quay behind her (body space, she faces -x when flipped) */
const ReceiptDrop: React.FC<{ x: number; y: number; un: number }> = ({ x, y, un }) => {
  const len = 3200 * un;
  return (
    <g>
      <rect x={x - 22} y={y} width={44} height={-y - 10 + 4} fill="#fffdf0" stroke={INK} strokeWidth={14} />
      {len > 4 && <rect x={x - 22} y={-26} width={len} height={30} fill="#fffdf0" stroke={INK} strokeWidth={14} />}
    </g>
  );
};

/** 5b - push in on the face: the eye twitches, a sweat drop */
const ShotPush: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const k = lerp(5.0, 7.4, ease(t, 0, 12));
  const tw = t > 3 && t % 4 < 2;
  return (
    <>
      <Cam at={[560, 1100]} z={1.0}><Harbour t={f} /></Cam>
      <rect width={W} height={H} fill="#fff" opacity={0.0} />
      <g transform={`translate(540,${1000 + t * 4}) scale(${k})`}>
        <ZoroPreHead face={tw ? "narrow" : "calm"} turn={0} lw={1.2} />
        {/* the white shirt and collar under the neck */}
        <path d="M-190,320 Q-190,126 -86,82 Q-44,68 -16,86 L0,102 L16,86 Q44,68 86,82 Q190,126 190,320Z" fill="#f5f2e8" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
        <path d="M-16,86 L-6,160 M16,86 L6,160 M0,102 L0,230" fill="none" stroke={INK} strokeWidth={1.2} />
      </g>
      {t > 4 && <SweatDrop x={900} y={600 + (t - 4) * 20} s={2.1 + (t - 4) * 0.08} />}
      {tw && <path d="M780,420 l60,-40 M820,470 l80,-26" stroke={INK} strokeWidth={8} strokeLinecap="round" />}
    </>
  );
};

/* ----------------------------------- the receipt ----------------------------------- */

const COUNT_TO = 300_000_000;
const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const spinNumber = (f: number) => {
  const [a, b] = [B.tick[0], B.tick[1]];
  const k = clamp((f - a + 1) / (b - a));
  if (k >= 1) return fmt(COUNT_TO);
  // the top digits are the true running total, the low ones are still spinning
  const v = Math.floor(COUNT_TO * Math.pow(k, 1.4));
  const d = String(v).padStart(9, "0").split("");
  const out = d.map((c, i) => (i < 4 ? c : String(Math.floor(rnd(i + f * 3.1, 5) * 10))));
  return fmt(Number(out.join("")));
};

const ShotReceipt: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const num = spinNumber(f);
  const lines: [string, string][] = [["SWORD REPAIRS", "50,000,000"], ["MEALS (x400)", "90,000,000"], ["GOT LOST (RESCUE)", "80,000,000"], ["INTEREST", "80,000,000"]];
  return (
    <>
      <rect width={W} height={H} fill="#2b1620" />
      <SpeedLines x={540} y={960} n={20} r0={380} r1={1800} seed={9 + (f % 2)} c="#5a2a3a" w={0.06} o={1} />
      <Cam at={[540, 1000]} z={1.0 + t * 0.012} rot={-5} shake={kick(f, B.receiptHit, 16, 3) + (t > 2 ? 3 : 0)} f={f}>
        <g>
          <path d={`M110,200 L970,200 L970,1760 ${Array.from({ length: 14 }, (_, i) => `L${970 - (i + 1) * 61.4},${i % 2 ? 1760 : 1810}`).join(" ")} L110,1760Z`} fill="#fffdf0" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
          <text x={540} y={340} textAnchor="middle" fontFamily="Poppins Black" fontSize={62} fill={INK}>NAMI'S BILL</text>
          <path d="M170,380 H910" stroke={INK} strokeWidth={6} strokeDasharray="22 14" />
          {lines.map(([a, b], i) => (
            <g key={a}>
              <text x={170} y={500 + i * 118} fontFamily="Poppins Black" fontSize={42} fill="#4a4a58">{a}</text>
              <text x={910} y={500 + i * 118} textAnchor="end" fontFamily="Poppins Black" fontSize={42} fill="#4a4a58">{b}</text>
              <path d={`M170,${520 + i * 118} H910`} stroke="#c8c8d0" strokeWidth={4} />
            </g>
          ))}
          <path d="M170,1010 H910" stroke={INK} strokeWidth={6} strokeDasharray="22 14" />
          <text x={540} y={1130} textAnchor="middle" fontFamily="Poppins Black" fontSize={74} fill="#d02828">ZORO'S DEBT:</text>
          <rect x={150} y={1190} width={780} height={250} rx={20} fill="#10141a" stroke={INK} strokeWidth={8} />
          <text x={540} y={1360} textAnchor="middle" fontFamily="Poppins Black" fontSize={num.length > 10 ? 104 : 112} fill="#ffe66a" stroke="#a06a08" strokeWidth={3}>{num}</text>
          <text x={880} y={1420} textAnchor="end" fontFamily="Poppins Black" fontSize={52} fill="#ffe66a">B</text>
          <g transform="translate(790,1620) rotate(-14)">
            <rect x={-170} y={-52} width={340} height={104} rx={14} fill="none" stroke="#d02828" strokeWidth={10} />
            <text x={0} y={22} textAnchor="middle" fontFamily="Poppins Black" fontSize={70} fill="#d02828">UNPAID</text>
          </g>
        </g>
      </Cam>
    </>
  );
};

/** 6b - Zoro drains to line art: eyes shrunk to dots, sweat pouring */
const ShotDrain: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const shrink = ease(t, 0, 4);
  const sh = Math.sin(t * 5) * 2.5;
  const BWSK = "#f4f4f4";
  return (
    <>
      <rect width={W} height={H} fill="#d6d6d6" />
      {/* gloom lines down the frame */}
      {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${40 + i * 66},0 L${40 + i * 66 + (rnd(i, 2) - 0.5) * 30},${420 + rnd(i, 3) * 700}`} stroke="#8a8a8a" strokeWidth={14 + rnd(i, 4) * 18} strokeLinecap="round" />)}
      <g transform={`translate(${545 + sh},${1010}) scale(${2.05 + t * 0.012})`}>
        <ZoroBig expr="smug" bw lw={4} />
        {/* drain the eyes: cover with plain skin, draw dots */}
        <ellipse cx={-76} cy={-8} rx={72} ry={44} fill={BWSK} />
        <ellipse cx={84} cy={-10} rx={64} ry={38} fill={BWSK} />
        <path d="M-88,-96 L-62,60" stroke="#6a6a6a" strokeWidth={5} fill="none" />
        <path d="M-136,-64 Q-80,-74 -24,-58 L-26,-46 Q-80,-58 -134,-48Z" fill={INK} transform={`translate(0,${-6 * shrink}) rotate(${-8 * shrink} -80 -52)`} />
        <path d="M150,-74 Q90,-78 26,-58 L28,-44 Q90,-60 148,-56Z" fill={INK} transform={`translate(0,${-6 * shrink}) rotate(${8 * shrink} 90 -52)`} />
        <circle cx={-74} cy={-6} r={lerp(26, 7, shrink)} fill={shrink > 0.8 ? INK : "#fff"} stroke={INK} strokeWidth={4} />
        <circle cx={80} cy={-8} r={lerp(26, 7, shrink)} fill={shrink > 0.8 ? INK : "#fff"} stroke={INK} strokeWidth={4} />
        <ellipse cx={-6} cy={128} rx={80} ry={34} fill={BWSK} />
        <path d="M-70,148 q20,-18 40,0 t40,0 t40,0 t40,0" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
      </g>
      {[0, 1, 2, 3].map((i) => {
        const u = ((t * 0.18 + i * 0.27) % 1);
        return <SweatDrop key={i} x={[70, 1000, 150, 930][i]} y={600 + u * 640} s={2 + (i % 2) * 0.6} />;
      })}
    </>
  );
};

/* ----------------------------------- the chase ----------------------------------- */

const ShotRun1: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const zx = 280 + t * 62;
  return (
    <Cam at={[zx * 0.85 + 90, 1100]} to={[540, 1100]} z={1.0} f={f}>
      <Harbour t={f} />
      <DustTrail t={t} x={zx} y={1700} dir={1} r={80} every={3} />
      <NamiFig p={NamiRun(t + 2)} x={zx - 470 + t * 8} y={1700 + bob(t, 6, 8)} s={0.84} face="angry">
        <Calculator x={310} y={-1010} a={-14} s={1.3} />
      </NamiFig>
      <Lean a={9} x={zx} y={1700}><ZoroPre p={zoroRun(t)} x={zx} y={1700 + bob(t, 6, 14)} s={0.9} face="wince" swords /></Lean>
      <PopText x={zx - 40} y={760} text="!!" size={150} rot={-8} t={clamp(t / 3)} fill="#ffe66a" />
    </Cam>
  );
};

const ShotWater: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const zx = 960 - t * 66;
  return (
    <Cam at={[540, 1300]} z={1.0} rot={2} f={f}>
      <Jetty t={f} />
      {Array.from({ length: 5 }, (_, i) => <Puff key={i} x={zx + 80 + i * 90} y={1560 + (i % 2) * 14} r={70} t={clamp(((t * 1.4 - i * 0.8) % 4) / 4)} c="#d8f2ff" />)}
      <NamiFig p={{ ...NamiRun(t + 1), turn: 0.9 }} x={zx + 470 - t * 6} y={1560 + bob(t, 6, 10)} s={0.8} flipX face="angry">
        <Calculator x={310} y={-1010} a={-14} s={1.3} />
      </NamiFig>
      <Lean a={9} x={zx} y={1540} flip><ZoroPre p={zoroRun(t + 1)} x={zx} y={1540 + bob(t, 6, 14)} s={0.88} flipX face="wince" /></Lean>
      <Droplets x={zx + 100} y={1540} t={clamp((t % 4) / 4)} n={8} r={220} seed={3 + f} />
    </Cam>
  );
};

/** a round map pin with a head clipped inside */
const Pin: React.FC<{ x: number; y: number; id: string; ring: string; children: React.ReactNode }> = ({ x, y, id, ring, children }) => (
  <g transform={`translate(${x},${y})`}>
    <defs><clipPath id={id}><circle r={84} /></clipPath></defs>
    <circle r={92} fill={ring} stroke={INK} strokeWidth={8} />
    <g clipPath={`url(#${id})`}>
      <circle r={84} fill="#fffdf0" />
      <g transform="translate(0,14) scale(1.15)">{children}</g>
    </g>
  </g>
);

/** the map gag: where he thinks he is going vs where he went. Twice round. */
const ShotCircle: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const C: P = [540, 1130], R = 300;
  const lap = (u: number): P => [C[0] + Math.cos(u) * R, C[1] + Math.sin(u) * R];
  const u0 = -Math.PI / 2 + (t / 10.5) * Math.PI * 4;
  const z = lap(u0), n = lap(u0 - 1.0);
  const trail = Array.from({ length: 16 }, (_, i) => lap(u0 - i * 0.28));
  return (
    <>
      <MapSet />
      <text x={540} y={450} textAnchor="middle" fontFamily="Poppins Black" fontSize={58} fill={INK}>WHERE HE THINKS</text>
      <text x={540} y={512} textAnchor="middle" fontFamily="Poppins Black" fontSize={58} fill={INK}>HE'S GOING</text>
      <path d="M540,700 L540,560" stroke="#3a9a40" strokeWidth={18} strokeLinecap="round" strokeDasharray="30 22" />
      <path d="M492,596 L540,540 L588,596" stroke="#3a9a40" strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={C[0]} cy={C[1]} r={R} stroke="#d02828" strokeWidth={16} fill="none" strokeDasharray="34 24" strokeLinecap="round" />
      <text x={540} y={1650} textAnchor="middle" fontFamily="Poppins Black" fontSize={64} fill="#d02828">WHERE HE WENT</text>
      {trail.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={16 - i * 0.7} fill="#d02828" opacity={0.8 - i * 0.04} />)}
      <Pin x={n[0]} y={n[1]} id="pinN" ring="#ff8a1c"><NamiHead face="angry" turn={0.3} lw={2} /></Pin>
      <Pin x={z[0]} y={z[1]} id="pinZ" ring="#69c043"><ZoroPreHead face="wince" turn={0.3} lw={2} /></Pin>
      <SweatDrop x={z[0] - 84} y={z[1] - 88} s={0.9} />
    </>
  );
};

/** back at the start: same lighthouse, same sign. He skids, reads it, bolts again. */
const ShotBack: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const arrive = ease(t, 0, 5);
  const bolt = ease(t, 8, 12);
  const zx = lerp(-180, 330, arrive) + bolt * 560;
  const stand = t >= 5 && t < 8.5;
  const p = stand ? pose({ ...Z_FOLD, turn: 0.2, head: [10, -905], tilt: -4, elL: [-60, -640], haL: [70, -700], elR: [140, -700], haR: [110, -860], hR: "fist" }) : zoroRun(t);
  const sq = stand ? 1 + 0.04 * Math.sin((t - 5) * 4) : 1;
  return (
    <Cam at={[540, 1100]} z={1.0} f={f}>
      <Harbour t={f} />
      <NamiFig p={NamiRun(t + 3)} x={lerp(-760, 20, ease(t, 2, 12))} y={1700 + bob(t, 6, 8)} s={0.84} face="angry">
        <Calculator x={310} y={-1010} a={-14} s={1.3} />
      </NamiFig>
      {stand && <DustTrail t={t * 2} x={zx - 20} y={1700} dir={1} r={70} every={3} />}
      <g transform={`translate(${zx},1700) scale(1,${sq}) translate(${-zx},-1700)`}>
        <ZoroPre p={p} x={zx} y={1700 + (stand ? 0 : bob(t, 6, 14))} s={0.9} face="wince" />
      </g>
      {stand && <QMark x={zx + 60} y={700} s={0.95} t={clamp((t - 5) / 2)} />}
    </Cam>
  );
};

/** the guest eating an apple in the market */
const GuestMkt: React.FC<{ p: Pose; x: number; y?: number; s?: number; face?: "grin" | "blank" | "shock"; children?: React.ReactNode }> = ({ p, x, y = MARKET_Y + 60, s = 0.95, face = "blank", children }) => (
  <g>
    <Regular p={p} x={x} y={y} s={s} face={face} lw={4} />
    {children && <g transform={`translate(${x},${y}) scale(${s})`}>{children}</g>}
  </g>
);
const G_IDLE = arms({ turn: 0.15, elL: [-120, -610], haL: [-110, -440], elR: [150, -700], haR: [110, -840], hR: "hold" });

const ShotMarket: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const zx = 60 + t * 100;
  return (
    <Cam at={[zx * 0.8 + 100, 1100]} to={[540, 1100]} f={f}>
      <MarketSet t={f} />
      <GuestMkt p={G_IDLE} x={820} />
      <NamiFig p={NamiRun(t + 4)} x={zx - 560} y={MARKET_Y + 100 + bob(t, 6, 8)} s={0.84} face="angry">
        <Calculator x={310} y={-1010} a={-14} s={1.3} />
      </NamiFig>
      {Array.from({ length: 5 }, (_, i) => <Berry key={i} x={zx - 120 - i * 40 + 0} y={MARKET_Y - 280 - (i % 3) * 50 + Math.sin(t + i) * 20} s={0.6} rot={t * 40 + i * 30} />).slice(0, 0)}
      <Lean a={9} x={zx} y={MARKET_Y + 140}><ZoroPre p={zoroRun(t + 2)} x={zx} y={MARKET_Y + 140 + bob(t, 6, 14)} s={0.9} face="wince" /></Lean>
    </Cam>
  );
};

/* the guest/Nami/Zoro staging in the market */
const GX = 600, GY = MARKET_Y + 60, GSC = 0.95;
const NX = 150;
const ZHX = 700;

const HideZoro: React.FC<{ x: number; t: number; shake?: number; face?: ZFace }> = ({ x, t, shake = 4, face = "wince" }) => (
  <ZoroPre p={Z_CROUCH} x={x + Math.sin(t * 5) * shake} y={GY} s={0.8} face={face} swords={false} />
);

const NamiStill: React.FC<{ x: number; t: number; face?: NFace; s?: number }> = ({ x, t, face = "angry", s = 0.88 }) => (
  <NamiFig p={arms({ turn: 0.45, elL: [-100, -640], haL: [-80, -560], hL: "relax", elR: [200, -780], haR: [190, -900 + Math.sin(t * 2) * 10], hR: "fist" })} x={x} y={GY} s={s} face={face}>
    <Calculator x={198} y={-920} a={-10} s={1.3} />
  </NamiFig>
);

const ShotHide: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const zx = lerp(120, ZHX, ease(t, 0, 2.5));
  const nx = lerp(-250, NX, ease(t, 0, 4));
  const crouch = ease(t, 2, 3.5);
  const p = lerpPose({ ...zoroRun(t), hL: "fist", hR: "fist" }, Z_CROUCH, crouch);
  return (
    <Cam at={[540, 1150]} z={1.0} f={f}>
      <MarketSet t={f} />
      <ZoroPre p={p} x={zx} y={GY} s={0.8} face="wince" swords={crouch < 0.5} />
      <GuestMkt p={G_IDLE} x={GX} />
      <NamiFig p={NamiRun(t + 1)} x={nx} y={GY + (t > 4 ? 0 : bob(t, 6, 8))} s={0.88} face="angry" />
      {t > 4 && <DustTrail t={t * 2} x={nx - 30} y={GY} dir={1} r={60} every={2} />}
    </Cam>
  );
};

/** 7a - the guest looks at Nami, then at Zoro cowering behind him */
const ShotLook: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const toN = ease(t, 0, 2.5), toZ = ease(t, 5.5, 7.5);
  const turn = lerp(0.15, -0.75, toN) + (0.75 + 0.7) * toZ;
  const gp = arms({ turn, elL: [-120, -610], haL: [-110, -440], elR: [150, -700], haR: [110, -840 + 60 * toN], hR: toN > 0.3 ? "relax" : "hold", tilt: -4 * toN + 8 * toZ });
  return (
    <Cam at={[430, 1200]} to={[540, 1180]} z={1.12 + t * 0.012} f={f}>
      <MarketSet t={f} />
      <HideZoro x={ZHX} t={t} />
      <GuestMkt p={gp} x={GX} />
      <NamiStill x={NX} t={t} face={t > 7 ? "smug" : "angry"} />
      {t > 6 && <SweatDrop x={ZHX + 170} y={1130 + (t - 6) * 10} s={0.9} />}
    </Cam>
  );
};

/** 7b - he points. Straight at Zoro. No words. */
const ShotPoint: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const ext = ease(t, 0, 2);
  const gp = arms({ turn: 0.1, elL: [-120, -610], haL: [-110, -440], elR: [lerp(150, 197, ext), lerp(-700, -646, ext)], haR: [lerp(110, 299, ext), lerp(-840, -487, ext)], hR: ext > 0.5 ? "point" : "fist", head: [0, -905] });
  return (
    <Cam at={[700, 1180]} to={[540, 1130]} z={1.32 + t * 0.006} rot={-3} shake={kick(f, B.pointHit, 14, 3)} f={f}>
      <MarketSet t={f} />
      <HideZoro x={ZHX + 20} t={t} shake={6} face="wince" />
      <GuestMkt p={gp} x={GX + 60} face="blank" />
      <PopText x={ZHX + 200} y={1090} text="!!" size={120} rot={10} t={clamp((t - 1) / 3)} fill="#ffe66a" />
      <SweatDrop x={ZHX + 140} y={1110 + t * 14} s={1} />
    </Cam>
  );
};

/** 7c - the thumbs-up, to Nami */
const ShotThumb: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const up = ease(t, 0, 3);
  const gp = arms({ turn: -0.5, elL: [lerp(-120, -240, up), lerp(-610, -840, up)], haL: [lerp(-110, -310, up), lerp(-440, -1000, up)], hL: "none", elR: [150, -700], haR: [110, -840], hR: "relax", tilt: -6 });
  return (
    <Cam at={[330, 1130]} to={[540, 1130]} z={1.45 + t * 0.008} rot={2} f={f}>
      <MarketSet t={f} />
      <NamiStill x={NX - 30} t={t} face="coin" />
      <GuestMkt p={gp} x={GX - 140} face="grin">
        <ThumbUp x={gp.haL[0]} y={gp.haL[1] - 20} s={1.5} rot={-8} lw={4} />
      </GuestMkt>
      {t > 3 && <Spark x={NX + 70} y={GY - 880} r={24 + 8 * Math.sin(t * 2)} c="#fff6a0" />}
    </Cam>
  );
};

/** 7d - Nami grabs Zoro by the collar and hoists him */
const ShotGrab: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const lift = ease(t, 1, 4) * 70;
  const zx = 760, zs = 0.9;
  const neck: P = [zx, GY - 40 - lift - 830 * zs + 20];
  const ns = 0.9, nx = 330;
  const tgt: P = [(neck[0] - nx) / ns, (neck[1] - GY) / ns];
  const np = arms({ turn: 0.5, elR: [lerp(200, 250, ease(t, 0, 2)), lerp(-780, -800, ease(t, 0, 2))], haR: [lerp(260, tgt[0] - 30, ease(t, 0, 2)), lerp(-700, tgt[1], ease(t, 0, 2))], hR: "fist", elL: [-100, -640], haL: [-80, -520] });
  const zp = pose({ ...Z_HILT, elL: [-130, -560], haL: [-150, -330], hL: "spread", elR: [140, -560], haR: [160, -330], hR: "spread", ftL: [-58, -14 - 0], ftR: [58, -14], knL: [-52, -254], knR: [52, -254], head: [0, -880], tilt: 6, turn: -0.3 });
  return (
    <Cam at={[560, 1150]} to={[540, 1150]} z={1.15 + t * 0.012} rot={-2} shake={kick(f, B.grabHit, 14, 3)} f={f}>
      <MarketSet t={f} />
      <NamiFig p={np} x={nx} y={GY} s={ns} face="coin" />
      <ZoroPre p={zp} x={zx} y={GY - 40 - lift} s={zs} face="wince" />
      {t < 4 && <SpeedLines x={zx - 50} y={GY - 700} n={14} r0={90} r1={600} seed={f} c="#ffffff" w={0.07} o={0.8} />}
      {t > 2 && <SweatDrop x={zx + 130} y={GY - 800 + t * 8} s={1} />}
    </Cam>
  );
};

/** 7e - dragged along the ground by the collar, fingers clawing */
const ShotDrag: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const ns = 0.9, zs = 0.9, rotZ = -68;
  const nx = 930 - t * 82;
  const fy = MARKET_Y + 190;
  const ny = fy - 20;
  const ra = (-rotZ * Math.PI) / 180;
  const neckW: P = [0, 0];
  const dist = 830 * zs;
  const feet: P = [nx + 170 + Math.sin(ra) * dist, fy];
  neckW[0] = feet[0] - Math.sin(ra) * dist; neckW[1] = fy - Math.cos(ra) * dist;
  const T: P = [(nx - neckW[0]) / ns, (neckW[1] - 30 - ny) / ns];
  const walk = walkPose(t * 1.2, { stride: 90, lift: 60, swing: 0, period: 7, turn: 0.9 });
  const sh: P = [-94, -806];
  const np = { ...walk, head: [20, -895] as P, tilt: -4, elL: sh, haL: sh, hL: "none" as const, elR: [150, -660] as P, haR: [250, -560] as P, hR: "fist" as const };
  const claw = Math.sin(t * 2.6) * 24;
  const zp = pose({
    head: [0, -905], tilt: 6, turn: 0,
    elL: [-130, -940 + claw], haL: [-90, -1130 - claw], hL: "spread", elR: [130, -940 - claw], haR: [100, -1130 + claw], hR: "spread",
    knL: [-52, -254], ftL: [-58, -14 + claw * 0.4], knR: [52, -254], ftR: [58, -14 - claw * 0.4],
  });
  return (
    <Cam at={[560, 1150]} z={1.0} rot={-1} f={f}>
      <MarketSet t={f} />
      {/* claw gouges in the dirt, trailing behind */}
      {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${neckW[0] - 560 + 70 * i},${fy - 14 + i * 12} L${neckW[0] + 1700},${fy - 14 + i * 12}`} stroke="#8a6a3a" strokeWidth={8} strokeLinecap="round" opacity={0.75} />)}
      <DustTrail t={t * 1.5} x={feet[0] + 20} y={fy} dir={-1} r={90} every={2} />
      <g transform={`rotate(${rotZ} ${feet[0]} ${fy})`}>
        <ZoroPre p={zp} x={feet[0]} y={fy} s={zs} face="wince" />
      </g>
      <NamiFig p={np} x={nx} y={ny + bob(t, 7, 6)} s={ns} flipX face="smug">
        <Part d={tube([sh, mix(sh, T, 0.5), T], [14, 12, 11])} fill={SKIN.base} shade={SKIN.shade} lw={4} />
        <Hand at={T} dir={170} kind="fist" skin={SKIN.base} shade={SKIN.shade} lw={4} s={1.1} />
      </NamiFig>
    </Cam>
  );
};

/* ----------------------------------- the end ----------------------------------- */

const MarketDusk: React.FC<{ f: number; dark?: number }> = ({ f, dark = 0 }) => (
  <>
    <MarketSet t={f} />
    {dark > 0 && <rect width={W} height={H} fill="#16203a" opacity={0.55 * dark} />}
    {dark > 0.4 && <Rain t={f} n={26} o={0.45 * dark} />}
  </>
);

const G_RECEIVE = (u: number) => arms({ turn: 0, elL: [lerp(-120, -250, u), lerp(-610, -690, u)], haL: [lerp(-110, -380, u), lerp(-440, -640, u)], hL: u > 0.5 ? "open" : "relax", elR: [140, -690], haR: [100, -540], hR: "relax" });

const ShotCount1: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const arm = ease(t, 0, 3);
  const got = ease(t, 4, 6.5);
  const gp = G_RECEIVE(arm);
  const gs = 1.05, gx = 600, gy = 1700;
  const hand: P = [gx + gp.haL[0] * gs, gy + gp.haL[1] * gs];
  const px = lerp(-80, hand[0] - 10, arm);
  return (
    <Cam at={[540, 1230]} z={1.0 + t * 0.004} f={f}>
      <MarketDusk f={f} />
      <Regular p={{ ...gp, turn: lerp(0, -0.4, arm) }} x={gx} y={gy} s={gs} face={got > 0.5 ? "grin" : "shock"} lw={4} />
      {/* Nami's arm coming in from the left with the pouch */}
      {got < 0.5 && <path d={tube([[-120, hand[1] - 40], [px - 260, hand[1] - 20], [px - 20, hand[1] - 6]], [30, 26, 22])} fill="#f6c9a0" stroke={INK} strokeWidth={8} strokeLinejoin="round" />}
      {got < 0.5 ? <Pouch x={px + 10} y={hand[1] + 36} s={0.9} rot={-8} lw={5} /> : <Pouch x={hand[0] - 8} y={hand[1] + 40 + got * 0} s={0.9} rot={-6 + got * 6} lw={5} />}
      {t > 4 && t < 9 && <Spark x={hand[0] + 70} y={hand[1] - 70} r={30 - (t - 4) * 4} c="#fff6a0" />}
    </Cam>
  );
};

const ShotCount2: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const dark = ease(t, 2, 12);
  const tap = Math.sin(t * 2.2);
  const gp = arms({ turn: -0.12, tilt: -3, elL: [-190, -690], haL: [-200, -590], hL: "none", elR: [190, -720], haR: [120, -640 + tap * 14], hR: "open" });
  const gs = 1.35, gx = 560, gy = 2060;
  return (
    <Cam at={[560, 1150]} z={1.0 + t * 0.006} f={f}>
      <MarketDusk f={f} dark={dark} />
      <Regular p={gp} x={gx} y={gy} s={gs} face="grin" lw={5} />
      <Pouch x={gx + gp.haL[0] * gs - 10} y={gy + gp.haL[1] * gs + 30} s={1.2} rot={-8} lw={5} tag={false} />
      {[0, 1, 2].map((i) => <Berry key={i} x={gx + 190 * gs * 0.55 + i * 38} y={gy - 640 * gs - 20 - (i % 2) * 14 - Math.max(0, tap) * 22 * (i + 1) * 0.4} s={0.7} rot={i * 25} />)}
      {[0, 1, 2, 3].map((i) => <Spark key={i} x={[260, 880, 330, 800][i]} y={[760, 700, 1120, 980][i]} r={(18 + 10 * Math.sin(t * 1.4 + i * 2)) * (i % 2 ? 1 : 1.3)} c="#fff6a0" />)}
    </Cam>
  );
};

/* ---------------------------------- the edit ---------------------------------- */

const SHOTS: Record<string, React.FC<{ t: number; f: number }>> = {
  sea1: ShotSea1, sea2: ShotSea2, sea3: ShotSea3, draw: ShotDraw, split: ShotSplit,
  bridge1: ShotBridge1, bridge2: ShotBridge2, hawk: ShotHawk, face: ShotFace,
  harbour: ShotHarbour, push: ShotPush, receipt: ShotReceipt, drain: ShotDrain,
  run1: ShotRun1, water: ShotWater, circle: ShotCircle, back: ShotBack, market: ShotMarket, hide: ShotHide,
  look: ShotLook, point: ShotPoint, thumb: ShotThumb, grab: ShotGrab, drag: ShotDrag, count1: ShotCount1, count2: ShotCount2,
};

/** whip-pan cuts: smear the first / last frames into the cut */
const WHIP: Record<string, number> = { run1: 1, water: -1, back: 1, market: 1, hide: -1, drag: 0, bridge1: 1, hawk: -1 };

const World: React.FC<{ f: number }> = ({ f }) => {
  if (f >= S.flash[0] && f < S.flash[1]) return <ImpactFlash x={620} y={1000} seed={(f % 2) + 3} />;
  const key = Object.keys(S).find((k) => f >= S[k][0] && f < S[k][1]) ?? "count2";
  const [a, b] = S[key];
  const t = f - a, len = b - a;
  const Shot = SHOTS[key];
  const dir = WHIP[key] ?? 0;
  const next = Object.keys(S).find((k) => S[k][0] === b);
  const outDir = next ? WHIP[next] ?? 0 : 0;
  let amt = 0, dx = 0;
  if (dir && t < 2) { amt = t === 0 ? 46 : 18; dx = dir * (t === 0 ? 300 : 70); }
  else if (outDir && t >= len - 1) { amt = 40; dx = -outDir * 240; }
  return (
    <Whip amt={amt} dx={dx}>
      <Shot t={t} f={f} />
    </Whip>
  );
};

const WorldAt: React.FC = () => {
  const f = useCurrentFrame();
  return <Frame><World f={f} /></Frame>;
};

export const FearShort: React.FC<{ audio?: string | null }> = ({ audio = null }) => {
  loadAkkiFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <HandDrawn hold={2} grain={0.4} boil={0.7}>
        <WorldAt />
      </HandDrawn>
      {f < 48 && <TitleText text="ZORO'S BIGGEST FEAR?" y={243} size={56} />}
    </AbsoluteFill>
  );
};

/* --------------------------------- thumbnail --------------------------------- */

export const FearThumb: React.FC = () => {
  loadAkkiFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Frame>
        <rect width={W} height={H} fill="#ffd45a" />
        <SpeedLines x={540} y={800} n={24} r0={160} r1={1800} seed={11} c="#ffb52a" w={0.07} o={1} />
        {/* Nami, tiny, behind him, with the receipt unrolled along the ground */}
        <path d="M826,905 L826,1150 L-60,1150" stroke={INK} strokeWidth={40} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M826,905 L826,1150 L-60,1150" stroke="#fffdf0" strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <NamiFig p={arms({ turn: 0.2, elR: [180, -760], haR: [130, -900], hR: "fist", elL: [-100, -640], haL: [-80, -560] })} x={880} y={1150} s={0.44} face="grin">
          <Calculator x={140} y={-930} a={-10} s={1.3} />
        </NamiFig>
        <g transform="translate(380,850) scale(4.4)">
          <ZoroPreHead face="wince" turn={0.1} lw={1.2} />
          <path d="M-190,320 Q-190,126 -86,82 Q-44,68 -16,86 L0,102 L16,86 Q44,68 86,82 Q190,126 190,320Z" fill="#f5f2e8" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
          <path d="M-16,86 L-6,160 M16,86 L6,160 M0,102 L0,230" fill="none" stroke={INK} strokeWidth={1.2} />
        </g>
        <SweatDrop x={770} y={560} s={2.6} />
        <SweatDrop x={150} y={730} s={2.0} />
        <SweatDrop x={670} y={900} s={1.4} />
      </Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <text x={540} y={1478} textAnchor="middle" fontFamily="Poppins Black" fontSize={186} fill="#ffffff" stroke={INK} strokeWidth={34} paintOrder="stroke" strokeLinejoin="round">ZORO'S</text>
        <text x={540} y={1672} textAnchor="middle" fontFamily="Poppins Black" fontSize={176} fill="#ffd400" stroke={INK} strokeWidth={34} paintOrder="stroke" strokeLinejoin="round">BIGGEST</text>
        <text x={540} y={1868} textAnchor="middle" fontFamily="Poppins Black" fontSize={190} fill="#ffffff" stroke={INK} strokeWidth={34} paintOrder="stroke" strokeLinejoin="round">FEAR?!</text>
      </svg>
    </AbsoluteFill>
  );
};
