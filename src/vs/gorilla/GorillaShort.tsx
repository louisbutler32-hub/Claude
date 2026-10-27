import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { bump, CamRig, H, hash, lerp, lerpV, lin, sm, useVsFonts, V, W } from "../kit";
import { Arena, Blob, Jungle, Podium, RIM, Ruler, Score, START_SCORE, Trophy } from "../arena";
import { Ball, Baller, Banana, Gorilla, mat, Pose, ball as sphere } from "../rig";
import { Caption, Flash, NameTag, PixelLabel, SpeedLines, StatCard } from "../hud";
import { arc, chestBeat, dribble, face, gallop, GO, GO_SCALE, HOLD_BALL, LB, LB_SCALE, mix, OVERHEAD_BALL, project, run, toWorld, waddle, walk } from "../poses";

/**
 * "Could LeBron James score on a silverback gorilla?" — a 50 s one-on-one sim in
 * the format of the reference shorts (Durant vs Galactus, Kawhi vs the Mongols):
 * intro stats for both, first basket wins, a block, a dumb possession, a pump
 * fake, a dunk, a FINAL scoreboard and a punchline. Visuals only for now; the
 * captions are the script a voiceover will be cut to.
 */

const F = (s: number) => Math.round(s * 30);

/* ------------------------------------------------------------------ the script */

const CAPS: [number, string][] = [
  [0.0, "could lebron james"], [0.8, "score on a"], [1.3, "silverback gorilla?"],
  [2.7, "lebron james is"], [3.4, "six-foot-nine,"],
  [4.5, "two hundred fifty pounds,"],
  [5.8, "a four-time champion"], [7.0, "and the all-time"], [7.7, "leading scorer."],
  [8.4, "but a silverback gorilla"],
  [10.0, "weighs up to"], [10.6, "four hundred pounds,"],
  [11.8, "has an eight-foot"], [12.6, "arm span,"],
  [13.6, "and is up to"], [14.2, "ten times stronger"],
  [15.2, "than a grown man."],
  [16.4, "one-on-one."], [17.2, "first basket wins."],
  [18.2, "lebron drives left,"],
  [19.6, "goes up for the layup,"],
  [20.8, "and gets swatted"],
  [22.0, "into the fifth row."],
  [23.4, "gorilla's ball."],
  [24.6, "it sniffs it."],
  [25.8, "it bites it."],
  [27.0, "it tries"], [27.5, "to peel it."],
  [28.6, "then it walks off"], [29.4, "with it."],
  [30.4, "lebron's ball."],
  [31.6, "the gorilla charges"],
  [32.8, "at twenty-five"], [33.5, "miles an hour."],
  [34.4, "lebron pump fakes."],
  [35.6, "the gorilla flies"], [36.3, "right past him"],
  [37.0, "into the bleachers."],
  [38.4, "lebron walks in"],
  [39.8, "and throws it down."],
  [41.6, "final score:"],
  [43.0, "lebron two,"], [43.8, "gorilla zero."],
  [45.0, "the gorilla"], [45.6, "didn't score a point."],
  [47.0, "but it did"], [47.6, "get a banana."],
];
const END = 50.0;
export const GORILLA_FRAMES = F(END);

/* ------------------------------------------------------------------ shot plumbing */

type Actor = { at: V; yaw: number; pose: Pose; holdR?: React.ReactNode; holdL?: React.ReactNode; tilt?: V; pivot?: number; shadow?: boolean };
type Cam = { pos: V; look: V; fov: number; roll?: number; shake?: number };
type State = {
  set?: "arena" | "jungle"; cam: Cam;
  lb?: Actor; go?: Actor; fans?: Actor[]; ball?: V | null; spin?: number;
  score?: Score; sway?: number; bend?: number;
  props?: React.ReactNode; hud?: React.ReactNode;
};
type Shot = { at: number; fn: (t: number, n: number) => State };

const HELD = <Ball position={[0, -0.06, 0.1]} />;
const lbWorld = (a: Actor, l: V): V => toWorld([a.at[0], a.at[1] + (a.pose.y ?? 0) * LB_SCALE, a.at[2]], a.yaw, l, LB_SCALE);
const goWorld = (a: Actor, l: V): V => toWorld([a.at[0], a.at[1] + (a.pose.y ?? 0) * GO_SCALE, a.at[2]], a.yaw, l, GO_SCALE);
const tag = (cam: Cam, p: V, text: string, t: number) => { const [x, y] = project(cam, p); return <NameTag text={text} x={x} y={y} t={t} />; };

/** orbiting dizzy stars over a head */
const Stars: React.FC<{ at: V; t: number }> = ({ at, t }) => (
  <group position={at}>
    {[0, 1, 2, 3].map((i) => { const a = t * 0.18 + (i * Math.PI) / 2; return <mesh key={i} position={[Math.cos(a) * 0.32, 0.05 * Math.sin(a * 2), Math.sin(a) * 0.32]} rotation={[t * 0.2, t * 0.3, 0]} geometry={sphere(0.05, 4, 2)} material={mat("#ffd21c", { emissive: "#ffb800", ei: 0.8 })} />; })}
  </group>
);

/** dust kicked up behind a runner */
const Dust: React.FC<{ at: V; t: number; dir: V }> = ({ at, t, dir }) => (
  <group>
    {Array.from({ length: 8 }, (_, i) => {
      const age = ((t + i * 4) % 32) / 32;
      return <mesh key={i} position={[at[0] - dir[0] * age * 1.6 + (hash(i) - 0.5) * 0.6, 0.15 + age * 0.5, at[2] - dir[2] * age * 1.6 + (hash(i, 2) - 0.5) * 0.6]} scale={0.25 + age * 0.5} geometry={sphere(0.5, 7, 5)}>
        <meshStandardMaterial color="#d8c8a8" transparent opacity={0.45 * (1 - age)} depthWrite={false} />
      </mesh>;
    })}
  </group>
);

/** seats and popcorn thrown out of the stands */
const Debris: React.FC<{ at: V; t: number }> = ({ at, t }) => (
  <group>
    {Array.from({ length: 14 }, (_, i) => {
      const vx = (hash(i, 1) - 0.3) * 0.12, vy = 0.12 + hash(i, 2) * 0.1, vz = (hash(i, 3) - 0.5) * 0.16;
      const y = at[1] + vy * t - 0.006 * t * t;
      if (y < at[1] - 2) return null;
      return <mesh key={i} position={[at[0] + vx * t, y, at[2] + vz * t]} rotation={[t * 0.3 * hash(i, 4), t * 0.2, 0]} geometry={sphere(i % 3 ? 0.06 : 0.14, 4, 2)} material={mat(i % 3 ? "#fff6d0" : i % 2 ? "#e43b3b" : "#3a7be0")} />;
    })}
  </group>
);

/* ------------------------------------------------------------------ positions */

const TOP: V = [0.35, 0, -4.6]; // LeBron at the top of the key
const DEF: V = [0, 0, -7.4]; // the gorilla defending
const WING: V = [-5.5, 0, -6]; // LeBron on the left wing for the second possession
const STAND = (x: number) => 1.2 + (-9.8 - x) * 0.725; // seat height in the left stands
const SEAT: V = [-12.2, STAND(-12.2) - 0.1, -7.6];

/* ------------------------------------------------------------------ the shots */

const SHOTS: Shot[] = [
  // hook: behind LeBron at the top of the key, the gorilla beating its chest under the board
  { at: 0.0, fn: (t, n) => {
    const d = dribble(t);
    const lb: Actor = { at: TOP, yaw: 180, pose: d.pose };
    return { cam: { pos: lerpV([0.95, 1.0, -1.5], [0.75, 1.1, -2.3], t / n), look: [0, 2.7, -10], fov: 54 }, lb, go: { at: DEF, yaw: 0, pose: chestBeat(t) }, ball: lbWorld(lb, d.ball) };
  } },
  // the gorilla, low and close
  { at: 1.5, fn: (t, n) => ({ cam: { pos: lerpV([0.75, 0.5, -5.3], [0.6, 0.55, -5.7], t / n), look: [0, 1.45, -7.4], fov: 50, shake: 0.012 }, go: { at: DEF, yaw: 0, pose: chestBeat(t + 20) } }) },
  // LeBron by the height ruler
  { at: 2.7, fn: (t) => {
    const lb: Actor = { at: [0, 0, 0], yaw: 0, pose: { ...LB.stand, face: "smirk", head: [-2, 0] } };
    return {
      cam: { pos: [0.4, 1.25, 3.7], look: [0.3, lerp(0.9, 1.55, sm(t, 0, 30)), 0], fov: 50 }, lb,
      props: <Ruler position={[0.78, 0, 0.12]} mark={2.06} grow={sm(t, 16, 34)} />,
      hud: t < 22 ? <PixelLabel text="LEBRON JAMES" t={t} /> : <StatCard big={"6'9\""} t={t - 22} />,
    };
  } },
  // the flex
  { at: 4.5, fn: (t, n) => {
    const a = lerp(-28, 18, t / n) * (Math.PI / 180);
    return { cam: { pos: [Math.sin(a) * 3.3, 1.0, Math.cos(a) * 3.3], look: [0, 1.45, 0], fov: 46 }, lb: { at: [0, 0, 0], yaw: 0, pose: mix(LB.stand, LB.flex, sm(t, 0, 8)) }, hud: <StatCard big="250 LBS" t={t - 3} /> };
  } },
  // the trophies
  { at: 5.8, fn: (t, n) => ({
    cam: { pos: lerpV([0, 1.55, 5.4], [0, 1.6, 4.4], t / n), look: [0, 1.45, 0], fov: 46 },
    lb: { at: [0, 0, -0.2], yaw: 0, pose: LB.crossed },
    props: <><Podium position={[0, 0, 1.05]} />{[-1.2, -0.4, 0.4, 1.2].map((x, i) => <Trophy key={i} position={[x, 1.03, 1.05]} s={0.95} />)}</>,
    hud: t < 36 ? <StatCard big="4×" sub="NBA CHAMPION" t={t} /> : <StatCard big="#1" sub="ALL-TIME SCORING LEADER" t={t - 36} />,
  }) },
  // the jungle: the silverback knuckle-walks up to camera
  { at: 8.4, fn: (t, n) => {
    const go: Actor = { at: [0, 0, lerp(-4.6, -2.3, t / n)], yaw: 0, pose: { ...gallop(t, 0.32), face: "plain", y: 0.03 } };
    const cam: Cam = { pos: [0.45, 1.0, 2.4], look: [0, 0.95, -3], fov: 50 };
    return { set: "jungle", cam, go, hud: tag(cam, [go.at[0], 1.95, go.at[2]], "SILVERBACK GORILLA", t - 4) };
  } },
  // stands up, beats chest
  { at: 10.0, fn: (t) => ({
    set: "jungle", cam: { pos: [0.5, 0.35, 0.5], look: [0, 1.5, -2.3], fov: 50, shake: t > 14 ? 0.01 : 0 },
    go: { at: [0, 0, -2.3], yaw: 0, pose: t < 14 ? mix(GO.knuckle, GO.tall, sm(t, 0, 12)) : chestBeat(t - 14) },
    hud: <StatCard big="400 LBS" t={t - 6} />,
  }) },
  // arm spans side by side
  { at: 11.8, fn: (t) => {
    const u = sm(t, 0, 10);
    return {
      cam: { pos: [0, 2.0, 11.5], look: [0, 1.3, 0], fov: 50 },
      lb: { at: [-1.75, 0, 0], yaw: 0, pose: mix(LB.stand, LB.tpose, u) },
      go: { at: [1.55, 0, 0], yaw: 0, pose: mix(GO.tall, GO.tpose, u) },
      props: <mesh position={[1.55, 1.62, 0.5]} scale={[sm(t, 10, 22), 1, 1]}><boxGeometry args={[2.65, 0.05, 0.05]} /><meshBasicMaterial color="#ffd21c" /></mesh>,
      hud: <StatCard big={"8'6\""} sub="GORILLA ARM SPAN" t={t - 8} />,
    };
  } },
  // ten times stronger: push in on the roar
  { at: 13.6, fn: (t, n) => ({ cam: { pos: lerpV([0.3, 1.55, -4.5], [0.15, 1.72, -5.7], t / n), look: [0, 1.65, -7.4], fov: 44, shake: 0.012 }, go: { at: DEF, yaw: 0, pose: chestBeat(t) }, hud: <StatCard big="10×" sub="STRONGER THAN A MAN" t={t - 10} /> }) },
  // LeBron reconsiders
  { at: 15.2, fn: (t) => ({ cam: { pos: [0.15, 2.0, -6.3], look: [0.35, 1.9, -4.6], fov: 38 }, lb: { at: TOP, yaw: 180, pose: { ...mix(LB.stand, LB.shock, sm(t, 0, 6)), head: [-4 + 8 * bump(t, 14, 24), 0] } } }) },
  // the scoreboard
  { at: 16.4, fn: (t, n) => ({ cam: { pos: lerpV([0, 13.5, -16.6], [0, 13.5, -17.6], t / n), look: [0, 13.5, -24], fov: 42 }, score: { label: "FIRST BASKET WINS", a: 0, b: 0 } }) },
  // the drive
  { at: 18.2, fn: (t) => {
    const go_ = sm(t, 12, 42);
    const at = lerpV(TOP, [-1.4, 0, -7.6], go_);
    const d = dribble(t, go_ > 0.02 ? { ...run(t, 0.6), shL: [20, 20] } : {}, go_ > 0.02 ? 1.5 : 1);
    const lb: Actor = { at, yaw: go_ > 0.02 ? face(TOP, [-1.4, 0, -7.6]) : 180, pose: d.pose };
    const gx = lerp(0, -0.9, sm(t, 16, 42));
    return { cam: { pos: [at[0] * 0.5 + 0.7, 2.3, at[2] + 3.9], look: [at[0] * 0.5, 1.2, at[2] - 3], fov: 52 }, lb, go: { at: [gx, 0, DEF[2] - 0.2 * go_], yaw: face([gx, 0, DEF[2]], at), pose: GO.knuckle }, ball: lbWorld(lb, d.ball) };
  } },
  // the layup, from the side
  { at: 19.6, fn: (t, n) => {
    const a: V = [-1.4, 0, -7.6], b: V = [-0.8, 0, -10.6];
    const at = lerpV(a, b, Math.min(1, t / 26));
    const air = t >= 22 ? 0.95 * Math.sin(Math.min(1, (t - 22) / 26) * Math.PI * 0.5) : 0;
    const pose: Pose = t < 22 ? run(t, 0.6) : { ...mix(run(22, 0.6), { lean: 4, hipL: [72, 6], knL: 90, hipR: [-4, 4], knR: 8, shR: [172, 6], elR: 12, shL: [70, 20], elL: 40, face: "focus" }, sm(t, 22, 28)), y: air };
    const lb: Actor = { at, yaw: face(a, b), pose, holdR: HELD };
    const g = lerpV([-0.4, 0, -8.2], [0.7, 0, -10.4], t / n);
    return { cam: { pos: [5.6, 1.8, at[2] + 0.6], look: [at[0], 1.4, at[2] - 0.6], fov: 52 }, lb, go: { at: g, yaw: face(g, at), pose: gallop(t, 0.5) } };
  } },
  // swatted
  { at: 20.8, fn: (t) => {
    const SW = 10;
    const lbAt: V = [-0.75, 0, -10.8];
    const lbPose: Pose = t < SW ? { lean: 4, hipL: [72, 6], knL: 90, hipR: [-4, 4], knR: 8, shR: [172, 6], elR: 12, shL: [70, 20], elL: 40, face: "focus", y: 0.95 } : { ...mix({ lean: 4, hipL: [72, 6], knL: 90, hipR: [-4, 4], knR: 8, shR: [150, 20], elR: 30, shL: [70, 20], elL: 40, face: "shock", y: 0.95 }, { ...LB.shock, y: 0 }, sm(t, SW, 34)), y: 0.95 * (1 - sm(t, SW + 2, 30)) };
    const lb: Actor = { at: lbAt, yaw: 172, pose: lbPose, holdR: t < SW ? HELD : undefined };
    const gAt: V = [0.55, 0, -10.6];
    const gPose: Pose = { ...GO.tall, y: 1.05 * bump(t, -2, 30), shR: t < SW ? [170, 50] : [lerp(170, 95, sm(t, SW - 2, SW + 4)), lerp(50, 80, sm(t, SW - 2, SW + 4))], elR: 10, shL: [40, 30], elL: 30, face: "shout", lean: -6 };
    const p0: V = [-0.55, 3.55, -11.2];
    const b = t >= SW ? arc(p0, [-14.5, 4.85, -8.0], 3, (t - SW) / 40) : null;
    return {
      cam: { pos: [0.9, 0.9, -8.4], look: [-0.3, 2.8, -11.4], fov: 56, shake: t > SW && t < SW + 8 ? 0.06 : 0 },
      lb, go: { at: gAt, yaw: -110, pose: gPose }, ball: b, spin: t * 0.6,
      hud: <>{t >= SW && <Flash t={t - SW} />}{t >= SW && <PixelLabel text="REJECTED" t={t - SW} y={140} size={96} />}</>,
    };
  } },
  // into the crowd
  { at: 22.0, fn: (t) => {
    const u = (t + 26) / 40;
    const b = u < 1 ? arc([-0.55, 3.55, -11.2], [-14.5, 4.85, -8.0], 3, u) : ([-14.5, 4.85 + 0.25 * bump(t, 14, 24), -8.0] as V);
    const caught = u >= 1;
    const fan: Actor = { at: [-14.6, STAND(-14.6), -8.3], yaw: 90, pose: caught ? LB.celebrate : { ...LB.stand, face: "shock" }, holdR: undefined };
    return {
      cam: { pos: [-4.2, 3.2, -6.2], look: lerpV([-8, 4.4, -9], [-14, 4.6, -8.2], sm(t, 0, 14)), fov: 48 },
      ball: caught ? lbWorld(fan, [0, 2.45 / LB_SCALE, 0.1]) : b, spin: t * 0.6,
      fans: [fan, { at: [-15.4, STAND(-15.4), -9.2], yaw: 80, pose: caught ? LB.shrug : LB.stand }, { at: [-15.2, STAND(-15.2), -7.0], yaw: 100, pose: caught ? LB.celebrate : LB.stand }],
      lb: { at: [-0.9, 0, -10.6], yaw: -80, pose: LB.shrug },
    };
  } },
  // gorilla's ball: it drops in from the stands
  { at: 23.4, fn: (t) => {
    const go: Actor = { at: DEF, yaw: 0, pose: { ...GO.hold, head: [t < 12 ? -30 : 6, 0, t > 16 ? 14 : 0] } };
    const hand = goWorld(go, HOLD_BALL);
    return { cam: { pos: [0.95, 1.6, -4.2], look: [0, 1.5, -7.4], fov: 48 }, go, ball: t < 12 ? arc([-4, 6.5, -6], hand, 0.6, t / 12) : hand, spin: t < 12 ? t * 0.5 : 0 };
  } },
  // it sniffs it
  { at: 24.6, fn: (t) => {
    const go: Actor = { at: DEF, yaw: 0, pose: { ...GO.hold, head: [16 + 4 * Math.sin(t * 0.9), 0, 10], face: "sniff" } };
    return { cam: { pos: [0.28, 1.72, -5.7], look: [0, 1.55, -7.3], fov: 40 }, go, ball: goWorld(go, [0, 1.36, 0.5]) };
  } },
  // it bites it
  { at: 25.8, fn: (t) => {
    const chomp = Math.floor(t / 7) % 2 === 0;
    const go: Actor = { at: DEF, yaw: 0, pose: { ...GO.hold, head: [10, 0, -6], face: t > 4 && chomp ? "bite" : "plain" } };
    return { cam: { pos: [-0.55, 1.62, -5.6], look: [0, 1.55, -7.3], fov: 40 }, go, ball: goWorld(go, [0, 1.33, 0.44]), hud: <PixelLabel text="BASKETBALL IQ: 0" t={t - 8} y={150} size={64} /> };
  } },
  // tries to peel it; LeBron behind it, hand on face
  { at: 27.0, fn: (t) => {
    const k = Math.sin(t * 0.5);
    const go: Actor = { at: DEF, yaw: 0, pose: { ...GO.hold, shR: [118 + 14 * k, 8], elR: 104, twR: 10, head: [12, 0], face: "plain" } };
    return { cam: { pos: [0.75, 1.7, -4.3], look: [0.35, 1.45, -8.2], fov: 46 }, go, ball: goWorld(go, [0.06, 1.3, 0.44]), spin: k * 0.3, lb: { at: [1.55, 0, -9.9], yaw: 200, pose: mix(LB.stand, LB.facepalm, sm(t, 6, 14)) } };
  } },
  // and walks off with it
  { at: 28.6, fn: (t, n) => {
    const a = DEF, b: V = [1.7, 0, -4.2];
    const at = lerpV(a, b, t / n);
    const go: Actor = { at, yaw: face(a, b), pose: waddle(t) };
    return { cam: { pos: [5.2, 2.1, -3.4], look: [0.4, 1.1, -6.4], fov: 50 }, go, ball: goWorld(go, HOLD_BALL), lb: { at: [-0.8, 0, -8.8], yaw: face([-0.8, 0, -8.8], at), pose: LB.shrug }, hud: <PixelLabel text="TRAVELING" t={t - 12} y={150} size={92} /> };
  } },
  // LeBron's ball, on the wing
  { at: 30.4, fn: (t) => {
    const d = dribble(t);
    const lb: Actor = { at: WING, yaw: 90, pose: d.pose };
    return { cam: { pos: [-7.4, 2.0, -5.0], look: [3, 1.0, -6.5], fov: 46 }, lb, ball: lbWorld(lb, d.ball), go: { at: [4, 0, -6], yaw: -90, pose: GO.knuckle } };
  } },
  // the charge, head-on
  { at: 31.6, fn: (t, n) => {
    const at: V = [lerp(4, 1.3, t / n), 0, -6];
    return { cam: { pos: [lerp(-0.6, -1.0, t / n), 0.45, -5.65], look: [3, 0.95, -6.1], fov: 52, shake: 0.03 }, go: { at, yaw: -90, pose: gallop(t, 0.85) }, props: <Dust at={at} t={t} dir={[-1, 0, 0]} />, hud: <SpeedLines f={t} o={0.45} /> };
  } },
  // 25 mph, wide
  { at: 32.8, fn: (t, n) => {
    const at: V = [lerp(1.3, -2.6, t / n), 0, -6];
    const d = dribble(t, { face: "focus" }, 0.8);
    const lb: Actor = { at: WING, yaw: 90, pose: d.pose };
    return { cam: { pos: [-2.2, 2.3, 3.2], look: [-2.2, 0.9, -6], fov: 64 }, lb, ball: lbWorld(lb, d.ball), go: { at, yaw: -90, pose: gallop(t + 12, 0.85) }, props: <Dust at={at} t={t} dir={[-1, 0, 0]} />, hud: <StatCard big="25 MPH" t={t - 6} /> };
  } },
  // the pump fake
  { at: 34.4, fn: (t) => {
    const lb: Actor = { at: WING, yaw: 90, pose: mix(dribble(0).pose, LB.overhead, sm(t, 0, 6)) };
    const gx = t < 20 ? lerp(-2.6, -3.7, t / 20) : lerp(-3.7, -4.3, (t - 20) / 16);
    const gy = t < 20 ? 0 : 0.95 * sm(t, 20, 36);
    const goPose: Pose = t < 20 ? gallop(t + 24, 0.85) : { ...mix(GO.knuckle, { lean: 75, shL: [150, 40], shR: [150, 40], elL: 10, elR: 10, hipL: [-20, 14], hipR: [-20, 14], knL: 30, knR: 30, head: [-60, 0], face: "shout" }, sm(t, 20, 28)), y: gy };
    return { cam: { pos: [-3.5, 1.45, -3.4], look: [-5.0, 1.75, -6.3], fov: 52 }, lb, ball: lbWorld(lb, OVERHEAD_BALL), go: { at: [gx, 0, -6], yaw: -90, pose: goPose }, hud: <PixelLabel text="PUMP FAKE" t={t - 4} y={150} size={96} /> };
  } },
  // flies right past him (slow motion, from the floor)
  { at: 35.6, fn: (t, n) => {
    const u = t / n;
    const gp = arc([-4.3, 0.95, -6], [-7.8, 1.0, -6], 0.95, u);
    const lb: Actor = { at: WING, yaw: 90, pose: mix(LB.overhead, LB.duck, sm(t, 0, 10)) };
    const flying: Pose = { lean: 80 + 30 * u, shL: [150, 40], shR: [150, 40], elL: 10, elR: 10, hipL: [-20, 14], hipR: [-20, 14], knL: 30, knR: 30, head: [-60, 0], face: "shock", y: gp[1] };
    return { cam: { pos: [-4.4, 0.35, -4.1], look: [-5.7, 2.2, -6.1], fov: 62 }, lb, ball: lbWorld(lb, lerpV(OVERHEAD_BALL, [0, 1.2, 0.35], sm(t, 0, 10))), go: { at: [gp[0], 0, -6], yaw: -90, pose: flying } };
  } },
  // into the bleachers
  { at: 37.0, fn: (t) => {
    const HIT = 22;
    const land: V = [SEAT[0], SEAT[1], SEAT[2] + 1.6];
    const u = Math.min(1, t / HIT);
    const p = arc([-7.8, 1.0, -6], [land[0], land[1] + 0.3, land[2]], 1.2, u);
    const flying: Pose = { lean: 110 + 40 * u, shL: [150, 40], shR: [150, 40], elL: 10, elR: 10, hipL: [-20, 14], hipR: [-20, 14], knL: 30, knR: 30, head: [-60, 0], face: "shock", y: 0 };
    const sprawl: Pose = { ...GO.tpose, shL: [40, 100], shR: [30, 110], hipL: [60, 30], hipR: [90, 20], knL: 40, knR: 70, face: "dazed", y: 0 };
    const go: Actor = t < HIT ? { at: [p[0], p[1], p[2]], yaw: -90, pose: flying } : { at: land, yaw: 90, pose: sprawl, tilt: [-70, 0, 0], pivot: 0.7, shadow: false };
    return {
      cam: { pos: [-3.3, 2.5, -2.2], look: lerpV([-7.6, 1.6, -6.2], [-11.6, 3.0, -6.4], sm(t, 0, HIT)), fov: 52, shake: t >= HIT && t < HIT + 12 ? 0.08 : 0 },
      go, lb: { at: WING, yaw: -100, pose: { ...LB.stand, head: [-6, 0], face: "smirk" } }, ball: lbWorld({ at: WING, yaw: -100, pose: LB.stand }, [-0.3, 0.95, 0.25]),
      fans: [{ at: [-11.0, STAND(-11.0), -9.4], yaw: 70, pose: t >= HIT ? LB.shock : LB.stand }, { at: [-13.6, STAND(-13.6), -4.6], yaw: 120, pose: t >= HIT ? LB.celebrate : LB.stand }],
      props: t >= HIT ? <Debris at={[land[0], land[1] + 0.5, land[2]]} t={t - HIT} /> : null,
      hud: t >= HIT ? <Flash t={t - HIT} len={5} /> : null,
    };
  } },
  // LeBron strolls in
  { at: 38.4, fn: (t, n) => {
    const a = WING, b: V = [-1.4, 0, -10.4];
    const at = lerpV(a, b, t / n);
    const d = dribble(t, {}, 0.7);
    const yaw = face(a, b);
    const lb: Actor = { at, yaw, pose: { ...walk(t), shR: d.pose.shR, elR: d.pose.elR, face: "smirk" } };
    const back = toWorld(at, yaw, [-0.6, 2.0, -3.2]);
    return { cam: { pos: back, look: [0, 2.4, -12.7], fov: 52 }, lb, ball: lbWorld(lb, [-0.34, d.ball[1] * 0.92, 0.32]), go: { at: [SEAT[0], SEAT[1], SEAT[2] + 1.6], yaw: 90, pose: { ...GO.tpose, shL: [40, 100], shR: [30, 110], hipL: [60, 30], hipR: [90, 20], knL: 40, knR: 70, face: "dazed" }, tilt: [-70, 0, 0], pivot: 0.7, shadow: false } };
  } },
  // the dunk, from under the rim
  { at: 39.8, fn: (t) => {
    const SLAM = 22;
    const a: V = [-1.4, 0, -10.4], b: V = [-0.25, 0, -11.95];
    const at = lerpV(a, b, sm(t, 4, SLAM));
    const y = t < 6 ? 0 : t < 34 ? 1.18 * sm(t, 6, 18) : 1.18 * (1 - sm(t, 34, 46));
    const crouch = bump(t, 0, 10);
    const arm: [number, number] = t < 14 ? [lerp(60, 205, sm(t, 4, 14)), 6] : t < SLAM ? [lerp(205, 128, sm(t, 16, SLAM)), 6] : t < 34 ? [165, 8] : [lerp(165, 20, sm(t, 34, 44)), 8];
    const pose: Pose = { lean: t < SLAM ? 8 : 0, hipL: [30 * crouch + (y > 0.3 ? 40 : 0), 6], knL: 50 * crouch + (y > 0.3 ? 60 : 0), hipR: [30 * crouch + 6, 6], knR: 50 * crouch + 12, shR: arm, elR: t < SLAM ? 30 : 6, shL: [70, 30], elL: 30, face: t < SLAM ? "focus" : "shout", y };
    const lb: Actor = { at, yaw: lerp(142, 176, sm(t, 4, SLAM)), pose, holdR: t < SLAM ? HELD : undefined };
    const drop = Math.max(0, t - SLAM);
    const b2: V | null = t >= SLAM ? [0, Math.max(0.12, RIM.y - 0.05 - 0.02 * drop * drop), RIM.z] : null;
    return { cam: { pos: [1.5, 0.8, -9.5], look: [-0.15, 2.9, -12.3], fov: 58, shake: t >= SLAM && t < SLAM + 8 ? 0.05 : 0 }, lb, ball: b2, bend: bump(t, SLAM, SLAM + 14), sway: t >= SLAM ? Math.sin(t) * bump(t, SLAM, SLAM + 30) : 0, hud: t >= SLAM ? <Flash t={t - SLAM} /> : null };
  } },
  // FINAL
  { at: 41.6, fn: (t, n) => ({ cam: { pos: lerpV([0, 13.5, -17.6], [0, 13.5, -16.9], t / n), look: [0, 13.5, -24], fov: 42 }, score: { label: "FINAL", a: 2, b: 0 }, hud: <Flash t={t} len={4} /> }) },
  // LeBron celebrates
  { at: 43.0, fn: (t, n) => {
    const a = lerp(20, -20, t / n) * (Math.PI / 180);
    const c: V = [-0.3, 0, -11.2];
    return { cam: { pos: [c[0] + Math.sin(a) * 3, 0.9, c[2] + Math.cos(a) * 3], look: [c[0], 1.7, c[2]], fov: 46 }, lb: { at: c, yaw: 0, pose: { ...LB.celebrate, y: 0.12 * Math.abs(Math.sin(t * 0.28)) } }, score: { label: "FINAL", a: 2, b: 0 }, hud: <StatCard big="2 – 0" sub="FINAL" t={t - 4} /> };
  } },
  // the gorilla, dazed in the stands
  { at: 45.0, fn: (t) => {
    const go: Actor = { at: SEAT, yaw: 90, pose: { ...GO.sit, head: [6, 0, 14 * Math.sin(t * 0.15)] }, shadow: false };
    return { cam: { pos: [-8.3, 3.8, -5.3], look: [-12.2, 3.75, -7.6], fov: 42 }, go, props: <Stars at={goWorld(go, [0, 1.62, 0.18])} t={t} />, fans: [{ at: [-11.1, STAND(-11.1), -9.0], yaw: 70, pose: LB.shrug }, { at: [-12.6, STAND(-12.6), -5.9], yaw: 110, pose: LB.stand }] };
  } },
  // one banana
  { at: 47.0, fn: (t) => {
    const chew = Math.floor(t / 6) % 2 === 0;
    const go: Actor = { at: SEAT, yaw: 90, pose: { ...GO.sit, shR: [96, 14], elR: 122, twR: 20, head: [4, 0, 6], face: chew ? "chew" : "plain" }, holdR: <Banana rotation={[0.3, 0, 1.4]} scale={1.6} bitten={sm(t, 10, 60)} />, shadow: false };
    return { cam: { pos: [-9.5, 3.95, -6.5], look: [-12.2, 3.8, -7.6], fov: 40 }, go, fans: [{ at: [-11.1, STAND(-11.1), -9.0], yaw: 70, pose: LB.celebrate }, { at: [-12.6, STAND(-12.6), -5.9], yaw: 110, pose: LB.stand }], hud: <StatCard big="0 POINTS" sub="1 BANANA" t={t - 10} size={128} /> };
  } },
];

const STARTS = SHOTS.map((s) => F(s.at));

/* ------------------------------------------------------------------ rendering */

const FAN_KITS = [{ shirt: "#e43b3b", trim: "#202020" }, { shirt: "#3a7be0", trim: "#ffffff" }, { shirt: "#2fb36b", trim: "#1b1b1b" }];
const FAN_SKIN = ["#e8b48a", "#8a5a3c", "#c98d63"];

const Body: React.FC<{ a: Actor; kind: "lb" | "go" | "fan"; i?: number }> = ({ a, kind, i = 0 }) => {
  const inner = kind === "go"
    ? <Gorilla position={a.tilt ? [0, -(a.pivot ?? 0), 0] : a.at} yaw={a.yaw} pose={a.pose} scale={GO_SCALE} holdR={a.holdR} holdL={a.holdL} />
    : <Baller position={a.tilt ? [0, -(a.pivot ?? 0), 0] : a.at} yaw={a.yaw} pose={a.pose} scale={kind === "fan" ? 0.9 : LB_SCALE} holdR={a.holdR} holdL={a.holdL} fan={kind === "fan"} kit={kind === "fan" ? FAN_KITS[i % 3] : undefined} skin={kind === "fan" ? FAN_SKIN[i % 3] : undefined} />;
  const shadow = a.shadow !== false && a.at[1] === 0;
  return (
    <>
      {a.tilt ? <group position={[a.at[0], a.at[1] + (a.pivot ?? 0), a.at[2]]} rotation={[a.tilt[0] * (Math.PI / 180), a.tilt[1] * (Math.PI / 180), a.tilt[2] * (Math.PI / 180)]}>{inner}</group> : inner}
      {shadow && <Blob x={a.at[0]} z={a.at[2]} r={kind === "go" ? 0.8 : 0.5} o={0.32 / (1 + (a.pose.y ?? 0) * 1.5)} />}
    </>
  );
};

export const GorillaShort: React.FC<{ captions?: boolean }> = ({ captions = true }) => {
  const f = useCurrentFrame();
  const ready = useVsFonts();
  if (!ready) return null;
  let k = 0;
  while (k + 1 < SHOTS.length && f >= STARTS[k + 1]) k++;
  const n = (k + 1 < SHOTS.length ? STARTS[k + 1] : GORILLA_FRAMES) - STARTS[k];
  const s = SHOTS[k].fn(f - STARTS[k], n);
  let c = 0;
  while (c + 1 < CAPS.length && f >= F(CAPS[c + 1][0])) c++;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <ThreeCanvas width={W} height={H} gl={{ antialias: true }}>
        <CamRig pos={s.cam.pos} look={s.cam.look} fov={s.cam.fov} roll={s.cam.roll} shake={s.cam.shake} f={f} />
        {s.set === "jungle" ? <Jungle /> : <Arena score={s.score ?? START_SCORE} sway={s.sway} bend={s.bend} />}
        {s.lb && <Body a={s.lb} kind="lb" />}
        {s.go && <Body a={s.go} kind="go" />}
        {s.fans?.map((a, i) => <Body key={i} a={a} kind="fan" i={i} />)}
        {s.ball && <Ball position={s.ball} spin={s.spin ?? 0} />}
        {s.props}
      </ThreeCanvas>
      {s.hud}
      {captions && <Caption text={CAPS[c][1]} />}
    </AbsoluteFill>
  );
};

/** the thumbnail: LeBron rising over the gorilla, big text */
export const GorillaThumb: React.FC = () => {
  const ready = useVsFonts();
  if (!ready) return null;
  const cam: Cam = { pos: [1.4, 0.9, -8.6], look: [-0.1, 2.5, -11.2], fov: 56 };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <ThreeCanvas width={W} height={H} gl={{ antialias: true }}>
        <CamRig pos={cam.pos} look={cam.look} fov={cam.fov} />
        <Arena />
        <Body a={{ at: [-0.75, 0, -10.8], yaw: 172, pose: { lean: 4, hipL: [72, 6], knL: 90, hipR: [-4, 4], knR: 8, shR: [172, 6], elR: 12, shL: [70, 20], elL: 40, face: "focus", y: 0.95 }, holdR: HELD }} kind="lb" />
        <Body a={{ at: [0.6, 0, -10.4], yaw: -110, pose: { ...GO.tall, y: 0.9, shR: [170, 50], elR: 10, shL: [40, 30], elL: 30, face: "shout", lean: -6 } }} kind="go" />
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontFamily: "Montserrat", fontWeight: 900, fontSize: 150, lineHeight: 1.0, color: "#ffd21c", WebkitTextStroke: "14px #111", paintOrder: "stroke fill" }}>LEBRON<br /><span style={{ color: "#fff" }}>vs</span><br />GORILLA</div>
    </AbsoluteFill>
  );
};
