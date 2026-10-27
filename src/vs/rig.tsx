import React from "react";
import * as THREE from "three";
import { canvasTex, D2R } from "./kit";

/**
 * The two rigs: a low-poly basketball player and a silverback gorilla, both
 * built from flat-shaded capsules and spheres (the reference sims use the same
 * chunky game-model look). Feet on y = 0, facing +z. Every joint angle is in
 * degrees; the hips are lifted automatically so the lower foot stands on the
 * floor, and `y` lifts the whole body off it (jumps).
 */

const matCache = new Map<string, THREE.MeshStandardMaterial>();
export const mat = (color: string, o: { rough?: number; metal?: number; emissive?: string; ei?: number; map?: THREE.Texture; transparent?: boolean; side?: THREE.Side } = {}) => {
  const key = `${color}|${o.rough ?? 0.8}|${o.metal ?? 0}|${o.emissive ?? ""}|${o.ei ?? 0}|${o.map?.uuid ?? ""}|${o.transparent ?? ""}|${o.side ?? ""}`;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: o.rough ?? 0.8, metalness: o.metal ?? 0, flatShading: true, map: o.map ?? null, transparent: o.transparent ?? false, side: o.side ?? THREE.FrontSide });
    if (o.emissive) { m.emissive = new THREE.Color(o.emissive); m.emissiveIntensity = o.ei ?? 1; }
    matCache.set(key, m);
  }
  return m;
};

const geoCache = new Map<string, THREE.BufferGeometry>();
const geo = (key: string, make: () => THREE.BufferGeometry) => { let g = geoCache.get(key); if (!g) { g = make(); geoCache.set(key, g); } return g; };
export const capsule = (r: number, len: number) => geo(`cap${r}|${len}`, () => new THREE.CapsuleGeometry(r, Math.max(0.001, len - 2 * r), 3, 8));
export const ball = (r: number, w = 10, h = 8) => geo(`sph${r}|${w}|${h}`, () => new THREE.SphereGeometry(r, w, h));
const cyl = (rt: number, rb: number, h: number, s = 10, open = false) => geo(`cyl${rt}|${rb}|${h}|${s}|${open}`, () => new THREE.CylinderGeometry(rt, rb, h, s, 1, open));
const box = (x: number, y: number, z: number) => geo(`box${x}|${y}|${z}`, () => new THREE.BoxGeometry(x, y, z));
const cap = (r: number, t0: number, t1: number) => geo(`cap${r}|${t0}|${t1}`, () => new THREE.SphereGeometry(r, 12, 8, 0, Math.PI * 2, t0 * Math.PI, (t1 - t0) * Math.PI));

/** one bone: rotates at its origin and hangs along -y; children hang off its far end */
const Bone: React.FC<{ at: [number, number, number]; rot: [number, number, number]; len: number; r: number; m: THREE.Material; r2?: number; tw?: number; children?: React.ReactNode }> = ({ at, rot, len, r, m, r2, tw = 0, children }) => (
  <group position={at} rotation={[rot[0] * D2R, rot[1] * D2R, rot[2] * D2R]}>
    <group rotation={[0, tw * D2R, 0]}>
      {r2 ? <mesh position={[0, -len / 2, 0]} geometry={cyl(r, r2, len, 8)} material={m} /> : <mesh position={[0, -len / 2, 0]} geometry={capsule(r, len)} material={m} />}
      <group position={[0, -len, 0]}>{children}</group>
    </group>
  </group>
);

/** hip drop for a leg with thigh pitch a (forward +) and knee bend k */
const legDrop = (a: number, k: number, lt: number, ls: number) => lt * Math.cos(a * D2R) + ls * Math.cos((a - k) * D2R);

export type Face = "plain" | "shock" | "grin" | "shout" | "smirk" | "focus" | "sniff" | "bite" | "chew" | "dazed";

export type Pose = {
  lean?: number; twist?: number; side?: number; // torso pitch (forward +), yaw, roll
  head?: [number, number, number?]; // pitch (down +), yaw, roll
  shL?: [number, number]; shR?: [number, number]; // shoulder: forward raise, out raise
  elL?: number; elR?: number; // elbow bend (forearm swings forward/up)
  twL?: number; twR?: number; // upper-arm twist about its own axis (flex: twL 90, twR -90)
  hipL?: [number, number]; hipR?: [number, number]; // thigh: forward raise, out
  knL?: number; knR?: number; // knee bend
  y?: number; // whole-body lift
  face?: Face;
};

type Common = {
  pose?: Pose; position?: [number, number, number]; yaw?: number; scale?: number;
  holdR?: React.ReactNode; holdL?: React.ReactNode; children?: React.ReactNode;
};

/* ======================================================================= the player */

const P = { lt: 0.48, ls: 0.47, foot: 0.07, torso: 0.56, ua: 0.36, fa: 0.32, shW: 0.235, hipW: 0.105 };
const SKIN = "#6e4630", SKIN_D = "#4e2f20", HAIR = "#17100c";
const GOLD = "#f6b92b", PURPLE = "#4b2a85";

const jerseyTex = (num: string, name?: string) => canvasTex(`jersey-${num}-${name ?? ""}`, 256, 256, (g) => {
  g.clearRect(0, 0, 256, 256);
  g.textAlign = "center"; g.textBaseline = "middle";
  if (name) { g.font = "800 40px Montserrat"; g.fillStyle = PURPLE; g.fillText(name, 128, 46); }
  g.font = "400 150px Anton";
  g.lineWidth = 10; g.strokeStyle = "#ffffff"; g.strokeText(num, 128, name ? 150 : 132);
  g.fillStyle = PURPLE; g.fillText(num, 128, name ? 150 : 132);
});

const HumanFace: React.FC<{ face: Face }> = ({ face }) => {
  const wide = face === "shock";
  const eyeY = 0.012, eyeX = 0.045, eyeZ = 0.112;
  const brow = face === "focus" || face === "shout" ? -14 : face === "shock" ? 10 : face === "smirk" ? 0 : 4;
  const white = mat("#f4efe8", { rough: 0.5 }), dark = mat("#140c08", { rough: 0.4 });
  return (
    <group>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * eyeX, eyeY, eyeZ]}>
          <mesh scale={[1, wide ? 1.35 : 0.8, 0.5]} geometry={ball(0.022, 8, 6)} material={white} />
          <mesh position={[0, 0, 0.01]} scale={[1, wide ? 1.1 : 1, 0.5]} geometry={ball(wide ? 0.009 : 0.012, 8, 6)} material={dark} />
          <mesh position={[0, 0.035, 0.008]} rotation={[0, 0, s * brow * D2R]} geometry={box(0.05, 0.012, 0.012)} material={mat(HAIR)} />
        </group>
      ))}
      <mesh position={[0, -0.02, 0.122]} geometry={box(0.03, 0.045, 0.03)} material={mat(SKIN_D)} />
      {face === "shout" || face === "shock" ? (
        <group position={[0, -0.072, 0.11]}>
          <mesh scale={[1, face === "shock" ? 1.4 : 1, 0.4]} geometry={ball(0.03, 8, 6)} material={mat("#5a1414")} />
          <mesh position={[0, 0.018, 0.006]} geometry={box(0.045, 0.01, 0.01)} material={white} />
        </group>
      ) : face === "grin" ? (
        <group position={[0, -0.066, 0.118]}>
          <mesh geometry={box(0.07, 0.022, 0.012)} material={white} />
        </group>
      ) : (
        <mesh position={[face === "smirk" ? 0.01 : 0, -0.066, 0.118]} rotation={[0, 0, face === "smirk" ? 0.25 : 0]} geometry={box(0.05, 0.01, 0.01)} material={mat("#2a1612")} />
      )}
    </group>
  );
};

export const Baller: React.FC<Common & { num?: string; name?: string; kit?: { shirt: string; trim: string }; fan?: boolean; skin?: string }> = ({ pose = {}, position = [0, 0, 0], yaw = 0, scale = 1, holdR, holdL, num = "23", name = "JAMES", kit = { shirt: GOLD, trim: PURPLE }, fan = false, skin: skinColor = SKIN, children }) => {
  const p = { lean: 0, twist: 0, side: 0, head: [0, 0, 0] as [number, number, number?], shL: [0, 6] as [number, number], shR: [0, 6] as [number, number], elL: 8, elR: 8, hipL: [0, 2] as [number, number], hipR: [0, 2] as [number, number], knL: 0, knR: 0, y: 0, face: "plain" as Face, ...pose };
  const hipY = Math.max(legDrop(p.hipL[0], p.knL, P.lt, P.ls), legDrop(p.hipR[0], p.knR, P.lt, P.ls)) + P.foot + p.y;
  const skin = mat(skinColor), shirt = mat(kit.shirt, { rough: 0.7 }), trim = mat(kit.trim), white = mat("#f4f4f4");
  const front = jerseyTex(fan ? "" : num), back = jerseyTex(fan ? "" : num, fan ? undefined : name);
  const arm = (s: 1 | -1, sh: [number, number], el: number, hold?: React.ReactNode, tw = 0) => (
    <group position={[s * P.shW, P.torso - 0.05, 0]}>
      <mesh scale={[1.1, 1, 1]} geometry={ball(0.092, 8, 6)} material={skin} />
      <Bone at={[0, 0, 0]} rot={[-sh[0], 0, s * sh[1]]} len={P.ua} r={0.07} m={skin} tw={tw}>
        <Bone at={[0, 0, 0]} rot={[-el, 0, 0]} len={P.fa} r={0.058} m={skin}>
          <mesh position={[0, -0.05, 0]} scale={[0.85, 1.15, 0.6]} geometry={ball(0.06, 8, 6)} material={skin} />
          {hold && <group position={[0, -0.07, 0.02]}>{hold}</group>}
        </Bone>
      </Bone>
    </group>
  );
  const leg = (s: 1 | -1, hp: [number, number], kn: number) => (
    <group position={[s * P.hipW, 0, 0]}>
      <group rotation={[-hp[0] * D2R, 0, s * hp[1] * D2R]}>
        <mesh position={[0, -0.13, 0]} geometry={cyl(0.115, 0.1, 0.3, 8)} material={shirt} />
        <mesh position={[0, -0.27, 0]} geometry={cyl(0.102, 0.102, 0.03, 8)} material={trim} />
        <mesh position={[0, -P.lt / 2, 0]} geometry={capsule(0.075, P.lt)} material={skin} />
        <Bone at={[0, -P.lt, 0]} rot={[kn, 0, 0]} len={P.ls} r={0.06} m={skin}>
          <mesh position={[0, 0.06, 0]} geometry={cyl(0.062, 0.062, 0.12, 8)} material={white} />
          <group rotation={[-(hp[0] - kn) * D2R * 0.6, 0, 0]}>
            <mesh position={[0, -0.02, 0.05]} geometry={box(0.12, 0.09, 0.3)} material={mat(kit.trim)} />
            <mesh position={[0, -0.055, 0.05]} geometry={box(0.125, 0.025, 0.31)} material={white} />
          </group>
        </Bone>
      </group>
    </group>
  );
  return (
    <group position={position} rotation={[0, yaw * D2R, 0]} scale={scale}>
      <group position={[0, hipY, 0]}>
        {/* pelvis + shorts */}
        <mesh position={[0, 0.02, 0]} scale={[1, 1, 0.68]} geometry={cyl(0.21, 0.23, 0.2, 10)} material={shirt} />
        {leg(1, p.hipL, p.knL)}
        {leg(-1, p.hipR, p.knR)}
        {/* torso */}
        <group rotation={[p.lean * D2R, p.twist * D2R, p.side * D2R]}>
          <mesh position={[0, P.torso / 2, 0]} scale={[1, 1, 0.6]} geometry={cyl(0.25, 0.2, P.torso, 10)} material={shirt} />
          <mesh position={[0, P.torso - 0.02, 0]} scale={[1, 1, 0.6]} geometry={cyl(0.255, 0.25, 0.04, 10)} material={trim} />
          <mesh position={[0, P.torso * 0.5, 0.148]} geometry={geo("jf", () => new THREE.PlaneGeometry(0.28, 0.28))}>
            <meshStandardMaterial map={front} transparent roughness={0.7} />
          </mesh>
          <mesh position={[0, P.torso * 0.52, -0.148]} rotation={[0, Math.PI, 0]} geometry={geo("jb", () => new THREE.PlaneGeometry(0.32, 0.32))}>
            <meshStandardMaterial map={back} transparent roughness={0.7} />
          </mesh>
          {arm(1, p.shL, p.elL, holdL, p.twL ?? 0)}
          {arm(-1, p.shR, p.elR, holdR, p.twR ?? 0)}
          {/* neck + head */}
          <mesh position={[0, P.torso + 0.04, 0]} geometry={cyl(0.06, 0.07, 0.1, 8)} material={skin} />
          <group position={[0, P.torso + 0.21, 0]} rotation={[p.head[0] * D2R, p.head[1] * D2R, (p.head[2] ?? 0) * D2R]}>
            <mesh scale={[1, 1.12, 1.02]} geometry={ball(0.115, 12, 10)} material={skin} />
            <mesh scale={[1.04, 1.14, 1.06]} geometry={cap(0.116, 0, 0.36)} material={mat(HAIR)} />
            {!fan && <mesh position={[0, -0.03, 0.004]} scale={[1.06, 1.08, 1.1]} geometry={cap(0.115, 0.58, 1)} material={mat(HAIR)} />}
            {!fan && <mesh position={[0, 0.06, 0]} scale={[1, 1, 1.02]} geometry={cyl(0.124, 0.124, 0.035, 14, true)} material={white} />}
            {[-1, 1].map((s) => <mesh key={s} position={[s * 0.115, 0, 0]} scale={[0.5, 1, 0.8]} geometry={ball(0.03, 6, 5)} material={skin} />)}
            <HumanFace face={p.face} />
          </group>
        </group>
      </group>
      {children}
    </group>
  );
};

/* ======================================================================= the gorilla */

const G = { lt: 0.32, ls: 0.3, foot: 0.06, torso: 0.62, ua: 0.48, fa: 0.46, shW: 0.31, hipW: 0.15 };
const FUR = "#47413c", FUR_D = "#38332f", SILVER = "#b3aea5", HIDE = "#1e1a18";

const GorillaFace: React.FC<{ face: Face }> = ({ face }) => {
  const hide = mat(HIDE), dark = mat("#0d0a08", { rough: 0.4 });
  const open = face === "shout" ? 1 : face === "bite" ? 0.7 : face === "chew" ? 0.35 : face === "shock" ? 0.6 : 0;
  return (
    <group>
      {/* brow ridge */}
      <mesh position={[0, 0.045, 0.135]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.7]} geometry={capsule(0.03, 0.2)} material={hide} />
      {/* eyes */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.045, 0.012, 0.14]}>
          <mesh scale={[1, face === "shock" || face === "dazed" ? 1.2 : 0.75, 0.5]} geometry={ball(0.02, 8, 6)} material={mat("#7a4414", { rough: 0.3 })} />
          <mesh position={[0, 0, 0.008]} geometry={ball(face === "dazed" ? 0.004 : 0.008, 6, 5)} material={dark} />
          <mesh position={[0.005, 0.005, 0.012]} geometry={ball(0.003, 4, 3)} material={mat("#ffffff", { emissive: "#ffffff", ei: 0.5 })} />
        </group>
      ))}
      {/* muzzle, nostrils, mouth */}
      <group position={[0, -0.06, 0.11]}>
        <mesh scale={[1.25, 0.9, 0.85]} geometry={ball(0.075, 10, 8)} material={hide} />
        <mesh position={[0, 0.035, 0.05]} scale={[1.3, 0.8, 0.8]} geometry={ball(0.03, 8, 6)} material={hide} />
        {[-1, 1].map((s) => <mesh key={s} position={[s * 0.016, 0.03, 0.074]} geometry={ball(0.01, 6, 5)} material={dark} />)}
        {open > 0 ? (
          <group position={[0, -0.03, 0.058]}>
            <mesh scale={[1.3, 0.35 + open * 0.75, 0.4]} geometry={ball(0.035, 8, 6)} material={mat("#4a0e10")} />
            {[-1, 1].map((s) => <mesh key={s} position={[s * 0.026, 0.012 + open * 0.01, 0.01]} rotation={[Math.PI, 0, 0]} geometry={geo("fang", () => new THREE.ConeGeometry(0.008, 0.026, 5))} material={mat("#efe6cf")} />)}
          </group>
        ) : (
          <mesh position={[0, -0.03, 0.062]} geometry={box(0.07, 0.008, 0.01)} material={dark} />
        )}
      </group>
    </group>
  );
};

export const Gorilla: React.FC<Common> = ({ pose = {}, position = [0, 0, 0], yaw = 0, scale = 1, holdR, holdL, children }) => {
  const p = { lean: 8, twist: 0, side: 0, head: [0, 0, 0] as [number, number, number?], shL: [0, 10] as [number, number], shR: [0, 10] as [number, number], elL: 10, elR: 10, hipL: [10, 8] as [number, number], hipR: [10, 8] as [number, number], knL: 18, knR: 18, y: 0, face: "plain" as Face, ...pose };
  const hipY = Math.max(legDrop(p.hipL[0], p.knL, G.lt, G.ls), legDrop(p.hipR[0], p.knR, G.lt, G.ls)) + G.foot + p.y;
  const fur = mat(FUR, { rough: 1 }), furD = mat(FUR_D, { rough: 1 }), hide = mat(HIDE, { rough: 0.7 }), silver = mat(SILVER, { rough: 1 });
  const arm = (s: 1 | -1, sh: [number, number], el: number, hold?: React.ReactNode, tw = 0) => (
    <group position={[s * G.shW, G.torso - 0.1, 0]}>
      <mesh scale={[1, 0.9, 1]} geometry={ball(0.15, 10, 8)} material={fur} />
      <Bone at={[0, 0, 0]} rot={[-sh[0], 0, s * sh[1]]} len={G.ua} r={0.12} m={fur} tw={tw}>
        <Bone at={[0, 0, 0]} rot={[-el, 0, 0]} len={G.fa} r={0.115} m={furD}>
          <group position={[0, -0.06, 0]}>
            <mesh scale={[1, 1.15, 0.75]} geometry={ball(0.095, 8, 6)} material={hide} />
            {[-1.5, -0.5, 0.5, 1.5].map((k) => <mesh key={k} position={[k * 0.034, -0.08, 0.02]} geometry={capsule(0.022, 0.08)} material={hide} />)}
          </group>
          {hold && <group position={[0, -0.13, 0.08]}>{hold}</group>}
        </Bone>
      </Bone>
    </group>
  );
  const leg = (s: 1 | -1, hp: [number, number], kn: number) => (
    <group position={[s * G.hipW, 0, 0]} rotation={[-hp[0] * D2R, 0, s * hp[1] * D2R]}>
      <mesh position={[0, -G.lt / 2, 0]} geometry={capsule(0.13, G.lt + 0.06)} material={fur} />
      <Bone at={[0, -G.lt, 0]} rot={[kn, 0, 0]} len={G.ls} r={0.105} m={furD}>
        <group rotation={[-(hp[0] - kn) * D2R * 0.8, 0, 0]}>
          <mesh position={[0, -0.02, 0.07]} scale={[1, 0.55, 1.6]} geometry={ball(0.08, 8, 6)} material={hide} />
        </group>
      </Bone>
    </group>
  );
  return (
    <group position={position} rotation={[0, yaw * D2R, 0]} scale={scale}>
      <group position={[0, hipY, 0]}>
        <mesh position={[0, 0.02, 0]} scale={[1.15, 0.8, 0.95]} geometry={ball(0.24, 10, 8)} material={fur} />
        {leg(1, p.hipL, p.knL)}
        {leg(-1, p.hipR, p.knR)}
        <group rotation={[p.lean * D2R, p.twist * D2R, p.side * D2R]}>
          {/* barrel body, belly, the silver saddle, the chest plates */}
          <mesh position={[0, 0.36, 0]} scale={[1.15, 1.3, 0.95]} geometry={ball(0.3, 12, 10)} material={fur} />
          <mesh position={[0, 0.2, 0.06]} scale={[1.15, 0.9, 1]} geometry={ball(0.25, 10, 8)} material={fur} />
          <mesh position={[0, 0.24, -0.07]} scale={[1.12, 0.95, 0.9]} geometry={ball(0.3, 12, 10)} material={silver} />
          <mesh position={[0, 0.58, 0]} scale={[1.6, 0.7, 1]} geometry={ball(0.22, 10, 8)} material={fur} />
          {[-1, 1].map((s) => <mesh key={s} position={[s * 0.12, 0.5, 0.2]} scale={[1.2, 0.8, 0.45]} geometry={ball(0.12, 8, 6)} material={hide} />)}
          {arm(1, p.shL, p.elL, holdL, p.twL ?? 0)}
          {arm(-1, p.shR, p.elR, holdR, p.twR ?? 0)}
          {/* head, set low and forward between the shoulders */}
          <group position={[0, G.torso + 0.15, 0.15]} rotation={[p.head[0] * D2R, p.head[1] * D2R, (p.head[2] ?? 0) * D2R]}>
            <mesh scale={[1, 1.05, 1]} geometry={ball(0.16, 12, 10)} material={fur} />
            <mesh position={[0, 0.13, -0.05]} rotation={[-0.35, 0, 0]} scale={[0.55, 1, 1.1]} geometry={ball(0.12, 8, 6)} material={fur} />
            <mesh position={[0, -0.01, 0.03]} scale={[1, 1.1, 0.95]} geometry={ball(0.145, 10, 8)} material={hide} />
            {[-1, 1].map((s) => <mesh key={s} position={[s * 0.15, 0.0, -0.02]} scale={[0.4, 0.8, 0.6]} geometry={ball(0.04, 6, 5)} material={hide} />)}
            <GorillaFace face={p.face} />
          </group>
        </group>
      </group>
      {children}
    </group>
  );
};

/* ======================================================================= props */

export const BALL_R = 0.12;
const ballTex = () => canvasTex("bball", 512, 256, (g) => {
  g.fillStyle = "#e3732b"; g.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${i % 2 ? 120 : 255},${i % 2 ? 40 : 160},20,0.12)`; g.fillRect((i * 97) % 512, (i * 53) % 256, 3, 3); }
  g.strokeStyle = "#1c120c"; g.lineWidth = 6;
  g.beginPath(); g.moveTo(0, 128); g.lineTo(512, 128); g.stroke();
  [128, 384].forEach((x) => { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke(); });
  [0, 256].forEach((x0) => { g.beginPath(); for (let y = 0; y <= 256; y += 4) { const x = x0 + 128 + Math.sin((y / 256) * Math.PI) * 70 - 70; y === 0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); });
});
export const Ball: React.FC<{ position?: [number, number, number]; spin?: number; scale?: number }> = ({ position = [0, 0, 0], spin = 0, scale = 1 }) => (
  <mesh position={position} rotation={[spin, spin * 0.3, 0]} scale={scale} geometry={ball(BALL_R, 16, 12)}>
    <meshStandardMaterial map={ballTex()} roughness={0.75} />
  </mesh>
);

export const Banana: React.FC<{ position?: [number, number, number]; rotation?: [number, number, number]; scale?: number; bitten?: number }> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, bitten = 0 }) => {
  const g = geo("banana", () => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 10; i++) { const a = -0.9 + (i / 10) * 1.8; pts.push(new THREE.Vector3(Math.sin(a) * 0.12, -Math.cos(a) * 0.12 + 0.12, 0)); }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.022, 6, false);
  });
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={g} material={mat("#f3d13a", { rough: 0.6 })} scale={[1 - bitten * 0.45, 1, 1]} />
      <mesh position={[Math.sin(0.9) * 0.12 * (1 - bitten * 0.45), -Math.cos(0.9) * 0.12 + 0.12, 0]} geometry={ball(0.014, 5, 4)} material={mat("#3a2a14")} />
    </group>
  );
};
