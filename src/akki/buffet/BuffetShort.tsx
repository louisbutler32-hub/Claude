import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { HandDrawn } from "../../minecraft/handdrawn";
import { circ, Hand, lerpPose, Luffy, LuffyHead, Part, pose, Pose, RubberArm, SKIN, smooth, STAND, tube } from "../bowling/characters";
import { RegularChibi, RegularGaunt, RegularWrinkled } from "../bowling/closeups";
import { BrushBlue, CyanMottle } from "../bowling/sets";
import { ease, H, INK, lerp, loadAkkiFonts, TitleText, W } from "../common";
import { Boom, ImpactFlash, Smoke } from "../breakfast/fx";
import { G } from "../guest";
import { ZoroPre } from "../zoro/cast";
import { Apron, Bone, GuestFig, LuffyBall, LuffyFig } from "./cast";
import { Food, Drumstick, KINDS, Nigiri, Cake, NoodleBowl } from "./food";
import { back, Berry, Cam, clamp, Fly, Frame, HLines, kick, P, PopText, QMark, rnd, Shock, SpeedLines, Spark, SweatDrop, ThumbUp, WarmBokeh, Whip } from "./fx";
import { CounterFG, FLOOR_Y, Plate, PlateTower, RestBG, SIGN_C, SignState, trayX, TrayState, TOP_Y, CX0 } from "./sets";
import B from "./beats.json";

/**
 * "Luffy at the All-You-Can-Eat Buffet" - 16 seconds, AKKI TALKS house style.
 *
 * The owner (our guy, in a red apron) proudly runs ALL YOU CAN EAT - 20 BERRIES.
 * Luffy walks in. He eats the counter, then the plate towers, then the room
 * (rolled into a ball), burps a shock-wave, and watches the owner add an
 * asterisk to the sign: *NOT LUFFY. Then Zoro walks in and asks where the
 * toilets are. The owner faints.
 *
 * Built like the channel's other shorts: a cut about every second, extreme
 * angles, ONE white-on-black impact frame (the burp), the owner's reaction
 * cut-aways drawn in three different styles (wrinkled / chibi / gaunt).
 * Cue frames live in beats.json, which scripts/build-akki-buffet-audio.py reads.
 */

export const BUFFET_FRAMES = B.frames;
const S = B.shots as unknown as Record<string, [number, number]>;

/* ---------------------------------- poses ---------------------------------- */

const arms = (o: Partial<Pose>) => pose(o);
const G_DOWN = arms({ hL: "relax", hR: "relax" });
const G_WIDE = arms({ elL: [-250, -820], haL: [-420, -790], hL: "open", elR: [250, -820], haR: [420, -790], hR: "open" });
const G_WAVE = arms({ elL: [-120, -640], haL: [-80, -560], hL: "relax", elR: [200, -740], haR: [250, -930], hR: "open" });
const G_SLUMP = arms({ elL: [-170, -640], haL: [-150, -500], hL: "relax", elR: [170, -640], haR: [150, -500], hR: "relax" });
const G_HIRE = arms({ elL: [-200, -880], haL: [-90, -1000], hL: "fist", elR: [200, -880], haR: [90, -1000], hR: "fist" });

const L_STAND = pose({ turn: 0 });
/** right arm tucked behind the body, so a RubberArm can be drawn from the shoulder instead */
const L_NOARM = pose({ elR: [104, -760], haR: [110, -720], hR: "none", backR: true });
const Z_FOLD = arms({ elL: [-60, -640], haL: [70, -700], hL: "fist", elR: [60, -640], haR: [-70, -690], hR: "fist" });
const Z_WALK_A = pose({ ...Z_FOLD, knL: [-70, -258], ftL: [-96, -14], knR: [64, -262], ftR: [74, -60], fdR: 1 });
const Z_WALK_B = pose({ ...Z_FOLD, knR: [70, -258], ftR: [96, -14], knL: [-64, -262], ftL: [-74, -60], fdL: -1 });

/* --------------------------------- helpers --------------------------------- */

const trayStates = (f: number): TrayState[] => KINDS.map(() => (f >= S.arm[0] + 8 ? "empty" : "full"));
const TOWERS = [470, 590, 710, 830, 950];

type Back = React.ReactNode;
const Room: React.FC<{ f: number; wreck?: number; door?: number; sign?: SignState; swing?: number; trays?: TrayState[]; olive?: boolean; back?: Back; front?: Back; hide?: number[] }> = ({ f, wreck = 0, door = 0, sign, swing = 0, trays, olive, back: bk, front, hide }) => (
  <>
    <RestBG wreck={wreck} door={door} sign={sign} swing={swing} />
    {bk}
    <CounterFG trays={trays ?? trayStates(f)} t={f} wreck={wreck} olive={olive} hide={hide} />
    {front}
  </>
);

const Rays: React.FC<{ a: string; b: string; seed?: number; t?: number; x?: number; y?: number }> = ({ a, b, seed = 1, t = 0, x = 540, y = 960 }) => (
  <g>
    <rect width={W} height={H} fill={a} />
    <SpeedLines x={x} y={y} n={22} r0={120} r1={1800} seed={seed + Math.floor(t / 2)} c={b} w={0.09} o={1} />
  </g>
);

/** the owner behind the counter */
const GuestBehind: React.FC<{ p?: Pose; face?: "grin" | "shock" | "blank"; x?: number; y?: number; s?: number; blow?: number; streak?: number; rot?: number }> = ({ p = G_WIDE, face = "grin", x = 720, y = 1280, s = 0.82, blow = 0, streak = 0, rot = 0 }) => (
  <GuestFig p={p} x={x} y={y} s={s} face={face} blow={blow} streak={streak} rot={rot} />
);

/* ----------------------------------- shots ----------------------------------- */

/** 1a - the owner beams, arms wide; Luffy at the door */
const ShotWide: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const open = back(ease(t, 2, 10), 1.5);
  const gp = lerpPose(G_DOWN, G_WIDE, open);
  const bob = Math.abs(Math.sin(t * 0.55)) * 5;
  return (
    <Cam z={1 + t * 0.0022} at={[540, 960]} f={f}>
      <Room
        f={f}
        back={<GuestBehind p={gp} y={1280 - bob} />}
        front={
          <>
            <LuffyFig p={pose({ turn: 0.2, tilt: 2 })} x={205} y={1560} s={0.8} face="smirk" />
            <Fly x={760} y={930} t={f} r={90} />
          </>
        }
      />
    </Cam>
  );
};

/** 1b - low, tilted close-up: Luffy at the door, hat on, tiny grin */
const ShotDoor: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const look = ease(t, 8, 15);
  return (
    <Cam z={2.05 + t * 0.012} at={[210, 1010]} to={[540, 930]} rot={-7} f={f}>
      <RestBG />
      <LuffyFig p={pose({ turn: lerp(-0.1, 0.55, look), tilt: lerp(0, -4, look), head: [0, -905 + Math.sin(t * 0.4) * 3] })} x={205} y={1560} s={0.8} face="smirk" />
    </Cam>
  );
};

/** 2a - 20 berries slammed on the counter; the owner's smile stays locked on */
const ShotSlam: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const hit = B.berries - S.slam[0];
  const down = ease(t, hit - 2, hit);
  const LX = 270, LY = 1600, LS = 0.95;
  const p = pose({
    elR: [lerp(200, 250, down), lerp(-820, -640, down)],
    haR: [lerp(240, 330, down), lerp(-980, -560, down)],
    hR: down > 0.9 ? "open" : "fist",
    turn: -0.1,
  });
  const u = Math.max(0, f - B.berries);
  return (
    <Cam z={1.5} at={[500, 1060]} to={[540, 980]} rot={5} shake={kick(f, B.berries, 18, 3)} f={f}>
      <Room
        f={f}
        back={<GuestBehind p={G_WAVE} face="grin" y={1280 - Math.max(0, 14 - u * 3) * (u > 0 ? 1 : 0)} />}
        front={
          <>
            <LuffyFig p={p} x={LX} y={LY} s={LS} face="grin" />
            {u > 0 && Array.from({ length: 7 }, (_, i) => {
              const vx = (rnd(i, 3) - 0.3) * 38, vy = -34 - rnd(i, 4) * 26;
              const x = 590 + vx * u, y = 1050 + vy * u + 3.2 * u * u;
              return y > 1070 ? null : <Berry key={i} x={x} y={y} s={0.9} rot={u * (14 + i * 9) * (i % 2 ? 1 : -1)} />;
            })}
            {u > 0 && u < 6 && <SpeedLines x={590} y={1060} n={14} r0={20} r1={220} seed={2} w={0.07} o={0.9} />}
            {u > 7 && Array.from({ length: 5 }, (_, i) => <Berry key={i} x={540 + i * 26} y={1058 - (i % 2) * 6} s={0.7} rot={i * 20} />)}
          </>
        }
      />
    </Cam>
  );
};

/** 2b - close-up: Luffy grabs a tray with both hands, eyes sparkling */
const ShotGrab: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const k = ease(t, 0, 4);
  const p = pose({ elL: [-190, -690], haL: [-150, -640], hL: "hold", elR: [190, -690], haR: [150, -640], hR: "hold", turn: 0, head: [0, -905 + 8 * (1 - k)] });
  const LS = 1.8, LX = 540, LY = 2330;
  const hand = (sd: number): P => [LX + sd * 150 * LS, LY - 640 * LS];
  const pulse = 1 + 0.15 * Math.sin(t * 1.4);
  const hx = LX, hy = LY - 905 * LS;
  return (
    <>
      <Rays a="#ffd45a" b="#ffb52a" seed={4} t={t} y={800} />
      <Cam z={1 + t * 0.012} at={[540, 1000]} rot={3} f={f}>
        <LuffyFig p={p} x={LX} y={LY} s={LS} face="grin" />
        {/* the tray he grabbed: roast meat, steaming */}
        <g transform={`translate(540,${1100 + (1 - k) * 90})`}>
          <g transform="scale(1.9)">
            <Food kind="meat" x={0} y={-24} s={1.7} lw={2} />
          </g>
          <Part d={smooth([[-370, -70], [370, -70], [336, 0], [-336, 0]], true, 0.05)} fill="#c9cfda" shade="#8a92a4" lw={6} sh={[-9, -6]}>
            <path d="M-330,-48 L330,-48" stroke="#fff" strokeWidth={9} strokeLinecap="round" opacity={0.7} />
          </Part>
        </g>
        {[-1, 1].map((sd) => <Hand key={sd} at={hand(sd)} dir={sd < 0 ? -80 : -100} kind="hold" s={LS * 1.1} skin={SKIN.base} shade={SKIN.shade} lw={5} flip={sd < 0} />)}
        {/* sparkling eyes */}
        {[-1, 1].map((sd) => <Spark key={sd} x={hx + sd * 40} y={hy - 4} r={34 * pulse} c="#ffffff" />)}
        <Spark x={hx - 78} y={hy - 74} r={20 * pulse} c="#fff6a0" />
        <Spark x={hx + 84} y={hy - 62} r={16} c="#fff6a0" />
      </Cam>
    </>
  );
};

/** 3a - the rubber arm: the whole length of the counter in one frame, scooping every tray */
const ShotArm: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const LX = 190, LY = 1560, LS = 0.85;
  const sh: P = [LX + LS * 94, LY - LS * 806];
  const wind = ease(t, 0, 5);
  const fire = clamp((t - 5) / 2);
  const ret = ease(t, 11, 18);
  let tip: P;
  let reach = 0;
  if (t < 5) tip = [lerp(330, 150, wind), lerp(985, 945, wind)];
  else if (t < 11) { reach = 1 - Math.pow(1 - fire, 3); tip = [lerp(150, 1180, reach), lerp(945, 995, reach)]; }
  else { tip = [lerp(1180, 232, ret), lerp(995, 872, ret)]; reach = 1 - ret; }
  const maxX = t < 5 ? 0 : t < 11 ? tip[0] : 1180;
  const passed = KINDS.map((_, i) => maxX > trayX(i) - 20);
  const nPassed = passed.filter(Boolean).length;
  const trays: TrayState[] = passed.map((p) => (p ? "empty" : "full"));
  const stretch = clamp(Math.hypot(tip[0] - sh[0], tip[1] - sh[1]) / 900);
  const shrink = ret > 0.7 ? 1 - (ret - 0.7) / 0.3 : 1;
  return (
    <Cam z={1.0} at={[540, 1010]} to={[540, 980]} rot={-3} shake={t > 5 && t < 8 ? 7 : 0} f={f}>
      <Room
        f={f}
        trays={trays}
        back={<GuestBehind p={G_WIDE} face="grin" x={720 + (t % 2) * 3} />}
        front={
          <>
            <LuffyFig p={pose({ ...L_NOARM, turn: 0.3, tilt: lerp(0, -8, wind) * (t < 11 ? 1 : 0) })} x={LX} y={LY} s={LS} face={t < 5 ? "grin" : "laugh"} />
            <RubberArm from={sh} to={tip} w={lerp(23, 12, stretch)} lw={4} hand={t < 9 ? "open" : "fist"} />
            {nPassed > 0 && (
              <g opacity={shrink}>
                {KINDS.map((k, i) => passed[i] && <Food key={k} kind={k} x={tip[0] - 20 + (i % 3) * 30} y={tip[1] + 14 - Math.floor(i / 3) * 52} s={0.5 * (0.5 + 0.5 * shrink)} lw={4} />)}
              </g>
            )}
            {t >= 5 && t < 10 && <HLines y0={900} y1={1070} n={9} seed={t} x0={200} x1={1100} sw={7} />}
            {t >= 11 && t < 16 && <HLines y0={870} y1={1000} n={6} seed={t} x0={300} x1={900} sw={5} o={0.6} />}
          </>
        }
      />
    </Cam>
  );
};

/** 3b - extreme close-up on the mouth: food streams in like a vacuum, cheeks puff */
const ShotMouth: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const K = 6.6, OX = 540, OY = 780;
  const cyc = (f - B.chomps[0]) / 4;
  const open = 0.5 - 0.5 * Math.cos(Math.PI * 2 * cyc);
  const cheeks = clamp((f - 92) / 14) * (0.8 + 0.2 * open);
  const mx = OX, my = OY + 46 * K;
  const kinds: ("d" | "n" | "c" | "r")[] = ["d", "n", "c", "r", "d", "n"];
  return (
    <>
      <Rays a="#ff9a3a" b="#ffd070" seed={9} t={t} y={1000} />
      <Cam z={1 + t * 0.004} at={[540, 960]} shake={5} f={f}>
        <g transform={`translate(${OX},${OY}) scale(${K})`}>
          <LuffyHead face="neutral" lw={1} />
          {[-1, 1].map((sd) => <Part key={sd} d={circ([sd * (40 + cheeks * 26), 34], 18 + cheeks * 24)} fill={SKIN.base} shade={SKIN.shade} lw={1} sh={[-2, -2]} />)}
          <g>
            <ellipse cx={0} cy={46} rx={30 - cheeks * 3} ry={5 + 25 * open} fill="#5a1418" stroke={INK} strokeWidth={2.6} />
            <path d={`M${-28 + cheeks * 3},${46 - (5 + 25 * open) * 0.9} Q0,${46 - (5 + 25 * open) * 1.1 + 8} ${28 - cheeks * 3},${46 - (5 + 25 * open) * 0.9} L${26 - cheeks * 3},${46 - (5 + 25 * open) * 0.72} Q0,${46 - (5 + 25 * open) * 0.8} ${-26 + cheeks * 3},${46 - (5 + 25 * open) * 0.72}Z`} fill="#fff" opacity={open > 0.15 ? 1 : 0} />
            <ellipse cx={0} cy={46 + (5 + 25 * open) * 0.5} rx={16} ry={Math.max(0.1, (5 + 25 * open) * 0.4)} fill="#e0585a" />
          </g>
        </g>
        {/* the vacuum: food spirals into the mouth, shrinking */}
        {Array.from({ length: 9 }, (_, i) => {
          const per = 7;
          const u = ((f * 1.0 + i * (per / 9) * 1.0) % per) / per;
          const a0 = (i / 9) * Math.PI * 2 + 0.6;
          const sx = mx + Math.cos(a0) * 760, sy = my + Math.sin(a0) * 640 - 140;
          const e = Math.pow(u, 1.8);
          const x = lerp(sx, mx, e) + Math.sin(u * 6 + i) * 30 * (1 - u), y = lerp(sy, my, e);
          const sc = lerp(2.8, 0.08, Math.pow(u, 1.2));
          const kind = kinds[i % kinds.length];
          const rot = u * (160 + i * 40);
          return (
            <g key={i} transform={`translate(${x},${y}) rotate(${rot}) scale(${sc})`}>
              {kind === "d" && <Drumstick x={-10} y={40} s={1.2} lw={4} />}
              {kind === "n" && <Nigiri x={0} y={30} s={1.2} lw={4} />}
              {kind === "c" && <Cake x={0} y={30} s={1.1} lw={4} />}
              {kind === "r" && <NoodleBowl x={0} y={30} s={1.1} lw={4} />}
            </g>
          );
        })}
        {B.chomps.map((c, i) => <PopText key={c} x={[250, 830, 260, 820, 300][i]} y={[420, 520, 1560, 1620, 330][i]} text={["NOM", "CHOMP", "MUNCH", "GULP", "NOM NOM"][i]} size={92} rot={[-14, 10, -8, 12, -6][i]} t={clamp((f - c + 1) / 3)} />).filter((_, i) => f >= B.chomps[i] - 1 && f < B.chomps[i] + 4)}
      </Cam>
    </>
  );
};

/** 3c - the tower of dirty plates, taller each cut (low, tilted angles) */
const ShotTower: React.FC<{ t: number; f: number; v: 0 | 1 | 2 }> = ({ t, f, v }) => {
  const drop = (f - B.plates[v]);
  const ph = ease(t, 0, 3);
  const n = [7, 15, 24][v];
  const rx = [150, 120, 96][v];
  const st = rx * 0.2;
  const sway = [0, 3, 6][v] * Math.sin(t * 0.7) * (v === 0 ? 0 : 1);
  const cams = [
    { at: [540, 1380] as P, z: 1.05, rot: 0 },
    { at: [560, 1280] as P, z: 1.2, rot: 6 },
    { at: [520, 1160] as P, z: 1.0, rot: -9 },
  ][v];
  const topY = 1620 - n * st;
  const armTip: P = [540 + (v === 2 ? 0 : 0) + sway * 3, topY - 24 + (1 - ph) * -140];
  return (
    <Cam at={cams.at} z={cams.z + t * 0.01} rot={cams.rot} shake={drop >= 0 && drop < 3 ? 8 : 0} f={f}>
      <RestBG />
      <PlateTower x={540} y={1640} n={n - 1} rx={rx} step={st} tilt={sway} seed={3 + v} lean={v === 2 ? -0.012 : 0} />
      {v === 2 && <PlateTower x={810} y={1640} n={13} rx={86} step={17} tilt={-5 + Math.sin(t) * 2} seed={11} lean={0.015} />}
      {v === 2 && <PlateTower x={240} y={1640} n={9} rx={80} step={16} tilt={4} seed={13} />}
      {/* his hand adds one more */}
      <RubberArm from={[1260, armTip[1] + 260]} to={[armTip[0] + rx * 0.4, armTip[1] + 10]} w={26} lw={4} hand="hold" />
      {t < 4 && <Plate x={armTip[0] + rx * 0.35} y={armTip[1] - 6} rx={rx * 0.9} seed={21 + v} />}
      {t >= 3 && <Plate x={540 + sway * 3} y={topY} rx={rx} seed={30 + v} />}
      {drop >= 0 && drop < 4 && <path d={`M${540 - rx - 30},${topY - 20} l-40,-20 M${540 + rx + 30},${topY - 20} l40,-20 M${540},${topY - 50} l0,-46`} stroke={INK} strokeWidth={8} strokeLinecap="round" />}
      {v === 2 && <Fly x={800} y={700} t={f} r={140} s={1.6} />}
    </Cam>
  );
};

/** 3d - the owner, WRINKLED style: the smile is slowly cracking */
const ShotReactW: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const crack = ease(t, 2, 15);
  const cy = lerp(1212, 1304, crack), uc = 1236, lc = lerp(1336, 1288, crack);
  const tw = Math.sin(t * 2.6) * 2 * crack;
  const z = t < 3 ? 1.35 : 1 + 0.04 * ease(t, 3, 18);
  return (
    <>
      <BrushBlue seed={3} />
      <g transform={`translate(540,900) scale(${z}) translate(-540,-900)`}>
        <RegularWrinkled />
        {/* the locked-on smile */}
        <g transform={`translate(0,${tw})`}>
          <path d={`M424,${cy} Q540,${2 * uc - cy} 656,${cy} Q540,${2 * lc - cy} 424,${cy}Z`} fill="#fffdf6" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d={`M424,${cy} Q540,${2 * (uc + lc) / 2 - cy} 656,${cy}`} stroke={INK} strokeWidth={3} fill="none" />
          {[-3, -2, -1, 0, 1, 2, 3].map((i) => <path key={i} d={`M${540 + i * 32},${(uc + cy) / 2 - 2 + Math.abs(i) * Math.abs(i) * 1.5 * (1 - crack * 0.4)} L${540 + i * 32},${(lc + cy) / 2 + 2 - Math.abs(i) * 4}`} stroke="#bdb6a2" strokeWidth={3} />)}
          <path d={`M410,${cy - 4} l-14,-10 M670,${cy - 4} l14,-10`} stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={1 - crack} />
        </g>
        {/* cracks across the face */}
        {crack > 0.35 && <path d={`M424,${cy} l-40,-70 l24,-12 l-30,-60`} stroke={INK} strokeWidth={5} fill="none" strokeLinejoin="round" />}
        {crack > 0.6 && <path d={`M656,${cy} l36,-80 l-22,-10 l34,-70`} stroke={INK} strokeWidth={5} fill="none" strokeLinejoin="round" />}
        {crack > 0.85 && <path d={`M540,${uc - 4} l-8,-50 l14,-14 l-10,-40`} stroke={INK} strokeWidth={4} fill="none" strokeLinejoin="round" />}
        {/* a twitching eye + sweat */}
        <path d={`M310,${896 + tw * 2} l-26,-8 M770,${896 - tw * 2} l26,-8`} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        {t > 7 && <SweatDrop x={300} y={730 + (t - 7) * 24} s={1.4} />}
        {t > 11 && <SweatDrop x={800} y={760 + (t - 11) * 30} s={1.2} />}
        <Fly x={540} y={620} t={f} r={330} s={2.4} />
      </g>
    </>
  );
};

/** 3e - Luffy's belly inflates into a perfectly round ball; he pats it. Plate spinning on a finger, bone in his hair */
const ShotBelly: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const inflate = clamp((f - B.inflate[0]) / (B.inflate[1] - B.inflate[0]));
  const k = back(inflate, 1.2);
  const since = (c: number) => (f >= c ? f - c : 99);
  const wob = Math.max(0, 0.05 * Math.exp(-since(B.inflate[1]) / 3) * Math.cos(since(B.inflate[1]) * 1.6)) + B.pats.reduce((a, c) => a + (since(c) < 8 ? 0.045 * Math.exp(-since(c) / 2.5) * Math.cos(since(c) * 1.8) : 0), 0);
  const pat = B.pats.reduce((a, c) => a + (since(c) < 3 ? 1 - since(c) / 3 : 0), 0);
  const LX = 540, LY = 1850, LS = 1.12;
  const pl = (x: number, y: number): P => [LX + x * LS, LY + y * LS];
  const haL: P = [-330, -1010];
  const patHand: P = [lerp(268, 225, pat), -560];
  const p = pose({ elL: [-300, -840], haL, hL: "point", elR: [300, -720], haR: patHand, hR: "none", turn: 0, tilt: 0, head: [0, -905 + k * 6] });
  const pt = pl(haL[0], haL[1] - 18);
  const spin = f * 0.9;
  return (
    <Cam at={[540, 1120]} z={1.0 + 0.0 * t} rot={-5 + t * 0.12} f={f}>
      <Room f={f} trays={KINDS.map(() => "empty")} wreck={0.15} />
      <Fly x={820} y={1000} t={f} r={110} />
      <LuffyFig p={p} x={LX} y={LY} s={LS} face={inflate < 0.1 ? "grin" : inflate < 1 ? "shock" : "laugh"} belly={k} wob={wob} bone>
        <Hand at={patHand} dir={-170} kind="open" s={1.1} skin={SKIN.base} shade={SKIN.shade} lw={4} />
        {/* plate spinning on his finger */}
        <g transform={`translate(${haL[0]},${haL[1] - 40})`}>
          <path d="M0,0 L0,-4" stroke={INK} strokeWidth={5} />
          <ellipse cx={0} cy={-10} rx={74} ry={15} fill="#c8ccd4" stroke={INK} strokeWidth={5} transform={`rotate(${Math.sin(spin) * 4})`} />
          <ellipse cx={0} cy={-14} rx={74} ry={15} fill="#fbf8f0" stroke={INK} strokeWidth={5} transform={`rotate(${Math.sin(spin) * 4})`} />
          <ellipse cx={Math.cos(spin * 2) * 38} cy={-14 + Math.sin(spin * 2) * 5} rx={9} ry={3} fill="#d3d0c4" />
          <path d="M-96,-28 q-18,12 -4,26 M96,-30 q18,12 4,26" stroke="#ffffff" strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      </LuffyFig>
      {pat > 0.2 && <path d={`M${LX + 180 * LS + 40},${LY - 560 * LS - 30} l50,-24 M${LX + 180 * LS + 50},${LY - 560 * LS + 10} l60,0 M${LX + 180 * LS + 40},${LY - 560 * LS + 46} l50,24`} stroke={INK} strokeWidth={7} strokeLinecap="round" />}
      {pt && null}
    </Cam>
  );
};

/** 3f - the owner, CHIBI style: eyes wide, sweating */
const ShotReactC: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const z = t < 3 ? 1.5 : 1 + 0.03 * ease(t, 3, 16);
  return (
    <>
      <CyanMottle />
      <g transform={`translate(540,600) scale(${z}) translate(-540,-600)`}>
        <g transform={`translate(${Math.sin(t * 3) * 3},0)`}><RegularChibi /></g>
        {[[260, 760, 1], [830, 800, 1.2], [290, 540, 0.9], [790, 520, 1]].map(([x, y, s], i) => {
          const u = clamp((t - 2 - i * 2) / 10);
          return u > 0 ? <SweatDrop key={i} x={(x as number) + (i % 2 ? 1 : -1) * 60 * u} y={(y as number) + 90 * u * u} s={(s as number) * 1.5} rot={(i % 2 ? 1 : -1) * 20} /> : null;
        })}
        <Fly x={540} y={420} t={f} r={380} s={2.6} />
      </g>
    </>
  );
};

/** 3g-i - the counter, empty: pans clean, one lonely olive */
const ShotEmptyA: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const settle = ease(t, 4, 9);
  return (
    <Cam at={[trayX(4) - 30, 1010]} to={[540, 1000]} z={2.2 + t * 0.012} rot={-3} f={f}>
      <Room f={f} trays={KINDS.map(() => "empty")} olive wreck={0.1} />
      {/* the fly lands on the olive */}
      <Fly x={trayX(4) + 30 * (1 - settle)} y={TOP_Y - 70 + 40 * settle} t={f * (1 - settle * 0.8)} r={120 * (1 - settle)} s={1.1} />
    </Cam>
  );
};

/** 3g-ii - the sign's smile fades */
const ShotEmptyB: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const sad = ease(f, B.signSad - 1, B.signSad + 6);
  return (
    <Cam at={[SIGN_C[0] + 40, 360]} to={[540, 940]} z={1.85 - t * 0.01} rot={-5} f={f}>
      <RestBG sign={{ smile: 1 - sad, sweat: clamp((t - 7) / 5) }} swing={Math.sin(t * 0.5) * 2 * (1 - sad)} wreck={0.1} />
    </Cam>
  );
};

/** 4a - Luffy rolls round the room like a ball, bouncing toward the plate towers */
const ShotRoll: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const pos = (u: number): { x: number; y: number; sx: number; sy: number } => {
    const ground = 1590, r = 150;
    const x = 110 + 29 * u;
    const bnc = B.bounces.map((b) => b - S.roll[0]);
    let y = ground - r - 12;
    let sx = 1, sy = 1;
    // bounce arcs between landings
    const marks = [-4, ...bnc, 16];
    for (let i = 0; i < marks.length - 1; i++) {
      if (u >= marks[i] && u < marks[i + 1]) {
        const w = (u - marks[i]) / (marks[i + 1] - marks[i]);
        y = ground - r - Math.sin(Math.PI * w) * (i === 0 ? 300 : 230);
        if (w < 0.18 && i > 0) { sx = 1.16; sy = 0.84; y = ground - r * 0.84; }
        else if (Math.abs(Math.sin(Math.PI * w)) > 0.8) { sx = 0.94; sy = 1.1; }
      }
    }
    return { x, y, sx, sy };
  };
  const cur = pos(t);
  const ghosts = [1, 2].map((g) => pos(t - g * 1.0));
  const lead = Math.min(16, t + 1);
  void lead;
  return (
    <Cam at={[540, 1100]} z={1.0} rot={4} f={f}>
      <Room
        f={f}
        trays={KINDS.map(() => "empty")}
        wreck={0.2}
        back={<GuestBehind p={G_SLUMP} face="grin" x={720} />}
        front={
          <>
            {TOWERS.map((x, i) => <PlateTower key={i} x={x} y={1590} n={10} rx={56} step={11} seed={i + 2} tilt={i === 0 && t > 14 ? (t - 14) * 3 : 0} />)}
            {ghosts.map((g, i) => <g key={i} opacity={0.28 - i * 0.1}><LuffyBall x={g.x - (i + 1) * 20} y={g.y} r={150} rot={(t - (i + 1)) * 40} sx={g.sx} sy={g.sy} /></g>)}
            <LuffyBall x={cur.x} y={cur.y} r={150} rot={t * 40} sx={cur.sx} sy={cur.sy} face="laugh" />
            <HLines y0={1250} y1={1560} n={8} seed={Math.floor(t)} x0={0} x1={cur.x - 120} o={0.7} sw={6} />
            {B.bounces.map((b) => f >= b && f < b + 3 && <Smoke key={b} x={110 + 29 * (b - S.roll[0])} y={1590} r={70} t={(f - b) / 5} c="#d8cfc0" seed={b} />)}
            <Fly x={900} y={1000} t={f} r={100} />
          </>
        }
      />
    </Cam>
  );
};

/** 4b - the domino chain: tower after tower goes over (extreme low angle) */
const ShotDomino: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const bx = 330 + t * 50;
  return (
    <Cam at={[700, 1400]} to={[540, 1060]} z={1.45} rot={-9} shake={t % 3 === 0 ? 5 : 0} f={f}>
      <RestBG wreck={0.2} />
      {TOWERS.map((x, i) => {
        const start = B.dominoStart + i * B.dominoStep;
        const k = ease(f, start, start + 8);
        const fall = k * 92;
        const px = x + 56;
        return (
          <g key={i}>
            <g transform={`translate(${px},1590) rotate(${fall}) translate(${-px},-1590)`}>
              <PlateTower x={x} y={1590} n={10} rx={56} step={11} seed={i + 2} lean={k * 0.01} />
            </g>
            {k > 0.4 && Array.from({ length: 5 }, (_, j) => {
              const u = (k - 0.4) * 1.6 + clamp((f - start - 5) / 12);
              const ox = px + (rnd(j, i) * 260 + 40) * u, oy = 1500 - (rnd(j, i + 5) * 380) * u + 520 * u * u * 0.7;
              return oy < 1620 ? <Plate key={j} x={ox} y={oy} rx={50} seed={j + i} rot={u * (200 + j * 60)} /> : null;
            })}
            {f >= start + 6 && f < start + 11 && <Smoke x={px + 40} y={1590} r={60} t={(f - start - 6) / 5} c="#d8cfc0" seed={i} />}
          </g>
        );
      })}
      <LuffyBall x={bx} y={1440} r={150} rot={t * 50} sx={1.05} sy={0.95} face="laugh" />
      {t >= 4 && <PopText x={760} y={1240} text="CRASH!" size={130} rot={-10} fill="#ffe27a" t={clamp((t - 4) / 3)} />}
    </Cam>
  );
};

/** 4c - cheeks swelling... */
const ShotBurpUp: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const k = ease(t, 0, 5);
  const K = 5.2, OX = 540, OY = 900;
  return (
    <>
      <Rays a="#2a1a10" b="#ff9a3a" seed={5} t={t} y={1000} />
      <Cam z={1 + k * 0.1} rot={k * 4} shake={4 + k * 14} f={f} at={[540, 960]}>
        <g transform={`translate(${OX},${OY}) scale(${K})`}>
          <LuffyHead face="laugh" lw={1.1} />
          {[-1, 1].map((sd) => <Part key={sd} d={circ([sd * (46 + k * 30), 36], 24 + k * 30)} fill={SKIN.base} shade={SKIN.shade} lw={1.1} sh={[-2, -2]} />)}
          <path d={`M-12,${48} q12,${8 + k * 10} 24,0`} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
        </g>
        <SweatDrop x={200} y={760} s={1.8} />
        <PopText x={540} y={1650} text="..." size={200} rot={0} fill="#ffffff" t={clamp(t / 2)} />
      </Cam>
    </>
  );
};

/** 4d - the blast: shock-wave, the owner's hair and apron blown straight back */
const ShotBlast: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const u = f - B.boom;
  const wave = clamp(u / 9);
  const blown = ease(u, 0, 2);
  const lean = -10 * blown;
  const p = pose({ ...G_SLUMP, tilt: -16 * blown, elL: [-170, -700], haL: [-230, -820], elR: [170, -640], haR: [150, -520] });
  return (
    <Cam at={[540, 1100]} z={1.0} rot={3} shake={kick(f, B.boom, 28, 4)} f={f}>
      <Room
        f={f}
        trays={KINDS.map(() => "empty")}
        wreck={0.45}
        sign={{ smile: 1 }}
        swing={-24 * blown + Math.sin(u * 1.4) * 4}
        back={<GuestBehind p={p} face="shock" rot={lean} blow={blown} streak={blown} />}
        front={
          <>
            <Shock x={880} y={1330} t={wave} r={1500} />
            <Boom x={730} y={1250} r={230} t={clamp(u / 9)} seed={7} />
            {/* a green burp cloud */}
            <g opacity={1 - clamp((u - 4) / 8)}>
              {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={790 - i * 52 * clamp(u / 6) - 10} cy={1330 + (i % 2 ? 24 : -22) * clamp(u / 6)} r={46 + i * 10} fill="#b9e07a" stroke={INK} strokeWidth={5} />)}
            </g>
            <LuffyBall x={950} y={1430} r={165} rot={0} sx={1.05 - 0.08 * Math.min(1, u / 3)} sy={0.95 + 0.08 * Math.min(1, u / 3)} face="laugh" cheeks={clamp(1 - u / 4)} />
            {Array.from({ length: 6 }, (_, i) => {
              const v = clamp(u / 12);
              return <Plate key={i} x={600 - (260 + i * 90) * v} y={1220 + (i % 3) * 90 - 160 * v + 300 * v * v} rx={46} seed={i} rot={v * 300 * (i % 2 ? 1 : -1)} />;
            })}
            <PopText x={430} y={1700} text="BUUURP!" size={140} rot={-8} fill="#ffe27a" t={clamp(u / 3)} />
            <HLines y0={700} y1={1500} n={16} seed={2} x0={-40} x1={700} sw={7} o={0.8} />
          </>
        }
      />
    </Cam>
  );
};

/** 4e - the owner, GAUNT style: broken, hands in his hair */
const ShotGaunt: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const shake = Math.sin(t * 5) * 2.5;
  return (
    <>
      <WarmBokeh />
      <g transform={`translate(${436},900) scale(${1 + t * 0.002}) translate(-436,-900)`}>
        <g transform={`translate(${shake},0)`}>
          <RegularGaunt />
          {/* the apron strap and bib over the tee */}
          <Part d="M372,1110 L410,1150 L560,1520 L330,1520Z M500,1110 L460,1150 L330,1520 L560,1520Z" fill="#d8342c" shade="#9c1f1a" lw={5} />
          <Part d="M260,1500 L640,1500 L690,2000 L210,2000Z" fill="#d8342c" shade="#9c1f1a" lw={5} sh={[-20, -10]} />
          {/* both hands buried in the hair */}
          {[[-1, 300, 520], [1, 575, 520]].map(([sd, hx, hy], i) => (
            <g key={i}>
              <Part d={tube([[sd === -1 ? 20 : 860, 2000], [sd === -1 ? 120 : 760, 1250], [hx as number + (sd as number) * 6, (hy as number) + 120]], [58, 50, 42])} fill={G.skin.base} shade={G.skin.shade} lw={5} />
              <Part d={tube([[sd === -1 ? 20 : 860, 2000], [sd === -1 ? 120 : 760, 1250], [sd === -1 ? 190 : 690, 1000]], [66, 60, 56])} fill={G.tee} shade={G.teeS} lw={5} />
              <Hand at={[hx as number, hy as number]} dir={(sd as number) === -1 ? -112 : -68} kind="spread" s={3.2} skin={G.skin.base} shade={G.skin.shade} lw={5} flip={(sd as number) === -1} />
            </g>
          ))}
        </g>
        {t > 5 && <SweatDrop x={650} y={420 + (t - 5) * 14} s={1.5} />}
        <Fly x={436} y={330} t={f} r={260} s={2.4} />
      </g>
    </>
  );
};

/** 5a - he slowly turns the sign over to add an asterisk */
const ShotTurn: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const flip = ease(t, 1, 10);
  const reach = ease(t, 0, 5);
  const p = pose({ ...G_SLUMP, turn: lerp(0, 0.4, reach), elR: [lerp(170, 230, reach), lerp(-640, -940, reach)], haR: [lerp(150, 345, reach), lerp(-500, -990, reach)], hR: "fist" });
  return (
    <Cam at={[720, 640]} to={[540, 900]} z={1.55 + t * 0.01} rot={-2} f={f}>
      <Room
        f={f}
        trays={KINDS.map(() => "empty")}
        wreck={0.5}
        sign={{ flip, smile: 0, ast: 0, fine: 0 }}
        swing={Math.sin(t * 0.9) * 5 * (1 - flip * 0.6)}
        back={<GuestBehind p={p} face="blank" streak={0.35} />}
      />
    </Cam>
  );
};

/** 5b - the asterisk, and a tiny line of fine print */
const ShotScribble: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const ast = clamp((f - B.asterisk) / 4);
  const fine = clamp((f - B.finePrint) / 4.5);
  const wob = Math.sin(t * 4) * 3;
  let tip: P;
  if (f < B.finePrint) tip = [SIGN_C[0] + 322 + Math.sin(t * 5) * 18, SIGN_C[1] - 8 + Math.cos(t * 5) * 18];
  else tip = [SIGN_C[0] - 326 + 30 + 200 * fine, SIGN_C[1] + 72 + wob];
  const settle = ease(t, 0, 3);
  const hand: P = [tip[0] + 44 + (1 - settle) * 160, tip[1] + 34 + (1 - settle) * 120];
  return (
    <Cam at={[SIGN_C[0], SIGN_C[1] + 30]} to={[540, 940]} z={1.15 + t * 0.004} rot={-2} f={f}>
      <RestBG sign={{ flip: 1, ast, fine }} swing={wob * 0.2} wreck={0.5} />
      <Part d={tube([[1300, 1100], [hand[0] + 120, hand[1] + 150], hand], [44, 40, 34])} fill={G.skin.base} shade={G.skin.shade} lw={4} />
      <Part d={tube([[1300, 1100], [hand[0] + 150, hand[1] + 170]], [58, 52])} fill={G.tee} shade={G.teeS} lw={4} />
      <Part d={tube([tip, [tip[0] + 90, tip[1] + 70]], [7, 9])} fill="#2a2a30" lw={3} />
      <Part d={tube([[tip[0] + 38, tip[1] + 30], [tip[0] + 90, tip[1] + 70]], [10, 10])} fill="#f0f0e8" lw={3} />
      <Hand at={[hand[0] + 8, hand[1] + 2]} dir={-140} kind="hold" s={1.4} skin={G.skin.base} shade={G.skin.shade} lw={4} />
    </Cam>
  );
};

/** 5c - Luffy pats the belly, deflates with a long raspberry, grins, thumbs up */
const ShotDeflate: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const since = (c: number) => (f >= c ? f - c : 99);
  const [r0, r1] = B.raspberry;
  const d = clamp((f - r0 + 1) / (r1 - r0 - 4));
  const k = d <= 0 ? 1 : Math.pow(1 - d, 1.7);
  const pat = since(B.patBelly) < 3 ? 1 - since(B.patBelly) / 3 : 0;
  const wob = (since(B.patBelly) < 5 ? 0.05 * Math.exp(-since(B.patBelly) / 2) * Math.cos(since(B.patBelly) * 2) : 0) + (d > 0 && d < 1 ? 0.03 * Math.sin(f * 2.4) : 0);
  const thumb = f >= B.thumb;
  const jerk = d > 0 && d < 1 ? Math.sin(f * 2.1) * 26 * (1 - d * 0.5) : 0;
  const LX = 540 + jerk, LY = 1850, LS = 1.12;
  const patHand: P = [lerp(268, 225, pat) * (0.3 + 0.7 * k) + (1 - k) * 90, -560 + (1 - k) * 90];
  const p = pose({
    elL: [-300, -700], haL: [-340, -520], hL: "relax",
    elR: thumb ? [220, -820] : [300, -720], haR: thumb ? [290, -1000] : patHand, hR: "none",
    tilt: d > 0 && d < 1 ? Math.sin(f * 2.1) * 8 : 0,
  });
  return (
    <Cam at={[540, 1120]} z={1.0} rot={d > 0 && d < 1 ? Math.sin(f * 1.8) * 2 : 0} f={f}>
      <Room f={f} trays={KINDS.map(() => "empty")} wreck={0.5} sign={{ flip: 1, ast: 1, fine: 1 }} back={<GuestBehind p={G_DOWN} face="blank" streak={0.2} />} />
      <g transform={`rotate(${d > 0 && d < 1 ? Math.sin(f * 1.5) * 4 : 0} ${LX} ${LY})`}>
        <LuffyFig p={p} x={LX} y={LY} s={LS} face={thumb ? "grin" : d > 0 ? "laugh" : "smug"} belly={k} wob={wob} bone>
          {!thumb && <Hand at={patHand} dir={-170} kind="open" s={1.1} skin={SKIN.base} shade={SKIN.shade} lw={4} />}
          {thumb && <ThumbUp x={306} y={-1048} s={1.5} rot={-6} lw={4} />}
        </LuffyFig>
      </g>
      {/* the raspberry: air squirting out the side */}
      {d > 0 && d < 1 && (
        <g>
          {Array.from({ length: 6 }, (_, i) => {
            const u = ((f * 1.2 + i * 1.7) % 6) / 6;
            return <circle key={i} cx={LX + 190 + u * 280} cy={LY - 620 + (i % 3 - 1) * 24 * u} r={14 + u * 30} fill="#fff" stroke={INK} strokeWidth={4} opacity={1 - u} />;
          })}
          <PopText x={LX + 300} y={LY - 760} text="PBBBBBT" size={90} rot={-6 + Math.sin(f) * 4} fill="#ffe27a" t={1} />
        </g>
      )}
      {thumb && <Spark x={LX + 22} y={LY - 855 * LS + 66} r={22 + (since(B.thumb) < 4 ? 10 : 0)} c="#ffffff" />}
    </Cam>
  );
};

/** 6a - the door swings open */
const ShotEnter: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const door = ease(t, 0, 3);
  const zx = lerp(120, 200, ease(t, 3, 8));
  return (
    <Cam at={[540, 1060]} z={1.0 + t * 0.004} rot={-3} shake={kick(f, B.door, 10, 3)} f={f}>
      <Room
        f={f}
        trays={KINDS.map(() => "empty")}
        wreck={0.6}
        door={door}
        sign={{ flip: 1, ast: 1, fine: 1 }}
        front={
          <>
            {t >= 3 && <ZoroPre p={t % 4 < 2 ? Z_WALK_A : Z_WALK_B} x={zx} y={1500} s={0.88} face="calm" />}
            <LuffyFig p={pose({ turn: -0.5 })} x={560} y={1700} s={0.85} face="grin" bone />
            <GuestFig p={G_DOWN} x={900} y={1650} s={0.82} face="blank" streak={0.15} />
          </>
        }
      />
    </Cam>
  );
};

/** 6b - Zoro looks round the ruins with total confidence, then asks */
const ShotZoro: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const turn = t < 7 ? lerp(-0.75, 0.75, ease(t, 0, 7)) : 0.1;
  const ask = f >= B.qmark;
  return (
    <Cam at={[420, 1050]} to={[470, 1000]} z={1.45} rot={4} f={f}>
      <Room f={f} trays={KINDS.map(() => "empty")} wreck={0.6} door={1} sign={{ flip: 1, ast: 1, fine: 1 }}
        front={
          <>
            <ZoroPre p={pose({ ...Z_FOLD, turn, head: [turn * -10, -905] })} x={420} y={1640} s={1.0} face={ask ? "smirk" : "calm"} />
            {ask && (
              <g>
                <g transform={`translate(${520},${690}) scale(${0.8 * back(clamp((f - B.qmark) / 3), 2)})`}>
                  <path d="M-160,-110 Q-170,-170 -90,-176 L90,-176 Q170,-170 160,-110 Q170,-30 90,-30 L10,-30 L-40,40 L-60,-30 L-90,-30 Q-170,-30 -160,-110Z" fill="#fff" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
                  {/* WC sign */}
                  <rect x={-130} y={-156} width={110} height={110} rx={14} fill="#2a6fd0" stroke={INK} strokeWidth={5} />
                  <circle cx={-98} cy={-130} r={10} fill="#fff" /><path d="M-98,-118 v34 M-114,-112 h32 M-98,-84 v22 M-98,-84 l-12,22" stroke="#fff" strokeWidth={7} strokeLinecap="round" fill="none" />
                  <circle cx={-52} cy={-130} r={10} fill="#fff" /><path d="M-52,-118 l-14,40 h28Z M-52,-78 v16" stroke="#fff" strokeWidth={6} strokeLinejoin="round" fill="#fff" />
                  <text x={86} y={-72} textAnchor="middle" fontFamily="Poppins Black" fontSize={68} fill={INK}>WC?</text>
                </g>
                <QMark x={680} y={640} s={0.7} t={clamp((f - B.qmark) / 4)} />
              </g>
            )}
          </>
        }
      />
    </Cam>
  );
};

/** 6c - the owner raises a hand and silently faints, flat on the floor, hand still raised */
const ShotFaint: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const up = ease(t, 0, 4);
  const fallT = clamp((t - 6) / 6);
  const fall = fallT * fallT;
  const bounce = f >= B.thump ? Math.exp(-(f - B.thump) / 2) * Math.cos((f - B.thump) * 1.5) * 6 : 0;
  const rot = -90 * fall - bounce * (fallT >= 1 ? 1 : 0);
  // the viewer's-right arm points straight up on screen the whole way down
  const th = (rot * Math.PI) / 180;
  const vx = -Math.sin(th), vy = -Math.cos(th);
  const sh: P = [94, -806];
  const arm = (a: number, b: number): P => [sh[0] + vx * a, sh[1] + vy * a - b * 0];
  const resting: P = [170, -640];
  const raised = lerp(0, 1, up);
  const el: P = [lerp(resting[0], arm(190, 0)[0], raised), lerp(resting[1], arm(190, 0)[1], raised)];
  const ha: P = [lerp(150, arm(380, 0)[0], raised), lerp(-500, arm(380, 0)[1], raised)];
  const p = pose({ ...G_DOWN, elR: el, haR: ha, hR: "point", elL: [-170, -640], haL: [-150, -500], tilt: -fall * 8 });
  return (
    <Cam at={[540, 1100]} z={1.0} rot={-2 * (1 - fall)} shake={kick(f, B.thump, 14, 3)} f={f}>
      <Room
        f={f}
        trays={KINDS.map(() => "empty")}
        wreck={0.6}
        door={1}
        sign={{ flip: 1, ast: 1, fine: 1 }}
        front={
          <>
            <ZoroPre p={pose({ ...Z_FOLD, turn: 0.2 })} x={430} y={1500} s={0.9} face="smirk" />
            <LuffyFig p={pose({ turn: -0.3, tilt: -4 })} x={660} y={1500} s={0.85} face="grin" bone />
            <GuestFig p={p} x={900} y={1650} s={0.82} rot={rot} face={fall > 0.2 ? "blank" : "blank"} dead={fall >= 1} streak={0.15} />
            {f >= B.thump && f < B.thump + 6 && <Smoke x={560} y={1700} r={110} t={(f - B.thump) / 6} c="#e8dfd0" seed={4} />}
          </>
        }
      />
    </Cam>
  );
};

/** 6d - final hold: Zoro nodding, Luffy waving, the owner out cold with his hand still up */
const ShotHold: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const nod = Math.abs(Math.sin(t * 0.55)) * 7;
  const wave = Math.sin(t * 0.9) * 50;
  const th = (-90 * Math.PI) / 180;
  const sh: P = [94, -806];
  const p = pose({ ...G_DOWN, elR: [sh[0] - Math.sin(th) * 190, sh[1] - Math.cos(th) * 190], haR: [sh[0] - Math.sin(th) * 380, sh[1] - Math.cos(th) * 380], hR: "point", elL: [-170, -640], haL: [-150, -500], tilt: -8 });
  return (
    <Cam at={[540, 1300]} to={[540, 1040]} z={1.02 + t * 0.003} rot={0} f={f}>
      <Room
        f={f}
        trays={KINDS.map(() => "empty")}
        wreck={0.6}
        door={1}
        sign={{ flip: 1, ast: 1, fine: 1 }}
        front={
          <>
            <ZoroPre p={pose({ ...Z_FOLD, head: [0, -905 + nod * 2], tilt: nod * 0.8 })} x={430} y={1500} s={0.9} face="closed" />
            <LuffyFig p={pose({ elR: [240, -900], haR: [300 + wave * 0.4, -1080], hR: "open", turn: -0.3, tilt: -4 })} x={660} y={1500} s={0.85} face="grin" bone />
            <GuestFig p={p} x={900} y={1650} s={0.82} rot={-90} face="blank" dead streak={0.15} />
          </>
        }
      />
    </Cam>
  );
};

/* ---------------------------------- the edit ---------------------------------- */

const SHOTS: Record<string, React.FC<{ t: number; f: number }>> = {
  wide: ShotWide, door: ShotDoor, slam: ShotSlam, grab: ShotGrab, arm: ShotArm, mouth: ShotMouth,
  towerA: (p) => <ShotTower {...p} v={0} />, towerB: (p) => <ShotTower {...p} v={1} />, towerC: (p) => <ShotTower {...p} v={2} />,
  reactW: ShotReactW, belly: ShotBelly, reactC: ShotReactC, emptyA: ShotEmptyA, emptyB: ShotEmptyB,
  roll: ShotRoll, domino: ShotDomino, burpUp: ShotBurpUp, blast: ShotBlast, gaunt: ShotGaunt,
  turn: ShotTurn, scribble: ShotScribble, deflate: ShotDeflate, enter: ShotEnter, zoro: ShotZoro, faint: ShotFaint, hold: ShotHold,
};

/** whip-pan cuts: the montage slides and smears into the next shot */
const WHIP: Record<string, number> = { arm: 1, mouth: -1, towerA: 1, towerB: -1, towerC: 1, reactW: -1, belly: 1, reactC: -1, emptyA: 1, emptyB: -1, roll: 1, domino: -1, turn: 1, scribble: -1, enter: 1, zoro: -1 };

const World: React.FC<{ f: number }> = ({ f }) => {
  if (f >= S.flash[0] && f < S.flash[1]) return <ImpactFlash x={720} y={1180} seed={(f % 2) + 3} />;
  const key = Object.keys(S).find((k) => f >= S[k][0] && f < S[k][1]) ?? "hold";
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

export const BuffetShort: React.FC<{ audio?: string | null }> = ({ audio = null }) => {
  loadAkkiFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <HandDrawn hold={2} grain={0.4} boil={0.7}>
        <WorldAt />
      </HandDrawn>
      {f < 48 && <TitleText text="ALL YOU CAN EAT BUFFET" y={243} size={50} />}
    </AbsoluteFill>
  );
};

/* --------------------------------- thumbnail --------------------------------- */

export const BuffetThumb: React.FC = () => {
  loadAkkiFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Frame>
        <Cam at={[540, 1000]} z={1.0}>
          <RestBG sign={{ flip: 1, ast: 1, fine: 1 }} wreck={0.4} />
          <GuestFig p={pose({ ...G_HIRE })} x={800} y={1280} s={0.95} face="shock" />
          <CounterFG trays={KINDS.map(() => "empty")} />
          <PlateTower x={190} y={1690} n={24} rx={80} step={16} tilt={-3} seed={5} lean={0.01} />
          <LuffyFig p={pose({ elL: [-300, -700], haL: [-360, -520], hL: "relax", elR: [300, -720], haR: [240, -560], hR: "none", turn: -0.1 })} x={560} y={1830} s={1.18} face="laugh" belly={1} bone>
            <Hand at={[240, -560]} dir={-170} kind="open" s={1.1} skin={SKIN.base} shade={SKIN.shade} lw={4} />
          </LuffyFig>
        </Cam>
      </Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <text x={540} y={1646} textAnchor="middle" fontFamily="Poppins Black" fontSize={152} fill="#ffffff" stroke={INK} strokeWidth={30} paintOrder="stroke" strokeLinejoin="round">ALL YOU CAN</text>
        <text x={540} y={1832} textAnchor="middle" fontFamily="Poppins Black" fontSize={200} fill="#ffd400" stroke={INK} strokeWidth={34} paintOrder="stroke" strokeLinejoin="round">EAT*</text>
      </svg>
    </AbsoluteFill>
  );
};
