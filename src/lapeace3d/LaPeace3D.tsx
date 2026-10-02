import React from "react";
import { AbsoluteFill, Audio, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { loadMinecraftFonts } from "../minecraft/fonts";
import B from "../minecraft-lapeace/beats.json";
import { Character, CPose, Mood } from "./Character";
import { noiseTex, pixelTexture, useTextures } from "./lib";
import { Beam, Clouds, Glow, GoldApple, Pickaxe3D, Valley } from "./world";

/**
 * "That's La Peace" — rebuilt in real 3D, the way the reference is made: a Minecraft
 * world of voxel blocks with lit materials, fog, a sunbeam and glowing items, and
 * Minecraft-skin characters (the owner's IShowSpeed and Kai Cenat), seen through a
 * moving camera. Cuts, voice lines and subtitles are on the reference's own times
 * (../minecraft-lapeace/beats.json).
 */

export const LAPEACE3D_FRAMES = B.frames;
const W = 1080, H = 1920;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const sm = (f: number, a: number, b: number) => { const t = clamp01((f - a) / (b - a)); return t * t * (3 - 2 * t); };
type V = [number, number, number];

const CamRig: React.FC<{ pos: V; look: V; fov: number; roll?: number }> = ({ pos, look, fov, roll = 0 }) => {
  const { camera } = useThree();
  React.useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...pos);
    c.up.set(Math.sin((roll * Math.PI) / 180), Math.cos((roll * Math.PI) / 180), 0);
    c.fov = fov; c.aspect = W / H;
    c.lookAt(...look);
    c.updateProjectionMatrix();
  }, [camera, pos[0], pos[1], pos[2], look[0], look[1], look[2], fov, roll]);
  return null;
};

type Tex = Record<string, THREE.Texture>;
const TEXTURES = {
  speed: "images/skins/speed.png", kai: "images/skins/kai.png", sh: "images/skins/speed-hair.png", kh: "images/skins/kai-hair.png",
  lapis: "images/skins/lapis.png", toga: "images/skins/toga.png", leaf: "images/skins/leaf.png", marble: "images/skins/marble.png",
  stone: "images/pov2/stone.png", pick: "images/pov2/iron-pickaxe.png", crack: "images/pov2/break-5.png", crack3: "images/pov2/break-3.png",
};

const rep = (t: THREE.Texture, x: number, y: number) => { const c = t.clone(); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(x, y); c.needsUpdate = true; return c; };

/* ----------------------------------------------------------------- shot 1: the cave */
const Cave: React.FC<{ t: number; tex: Tex }> = ({ t, tex }) => {
  const nether = React.useMemo(() => rep(noiseTex("#a63522", 0.7, "nr"), 30, 20), []);
  const lava = React.useMemo(() => rep(pixelTexture(8, (x, y) => (random(`lv${x}${y}`) > 0.55 ? "#ffb347" : random(`lw${x}${y}`) > 0.4 ? "#ff6a1a" : "#c0381a")), 6, 10), []);
  const basalt = React.useMemo(() => rep(noiseTex("#4a3e5a", 0.5, "bs"), 3, 18), []);
  const hits = [0, 34];
  const bounce = Math.max(...hits.map((h) => (t >= h && t < h + 10 ? Math.sin(((t - h) / 10) * Math.PI) : 0)));
  const shouting = hits.some((h) => t >= h && t < h + 14);
  const walk = sm(t, 22, 54);
  const stride = walk > 0 && walk < 1 ? Math.sin(t * 0.8) * 30 : 0;
  const speedPose: CPose = { armL: [0, shouting ? 155 : 40], armR: [0, shouting ? 155 : 40], bounce: bounce * 3, legL: stride, legR: -stride };
  const kaiPose: CPose = { armR: [shouting ? 20 : 95, shouting ? 40 : 8], armL: [0, shouting ? 150 : 6], bounce: shouting ? bounce * 1.5 : 0 };
  const flick = 1 + 0.15 * Math.sin(t * 0.7);
  const cam = { pos: [lerp(-2, 6, t / 56), 18, lerp(225, 212, t / 56)] as V, look: [lerp(2, 12, t / 56), 26, -20] as V };
  return (
    <>
      <color attach="background" args={["#16080d"]} />
      <fog attach="fog" args={["#22090e", 160, 620]} />
      <CamRig pos={cam.pos} look={cam.look} fov={56} />
      <ambientLight intensity={1.5} color="#e0a090" />
      <directionalLight position={[60, 120, 160]} intensity={1.6} color="#ffb090" />
      <pointLight position={[-120, 50, -30]} intensity={6 * flick} color="#ff7a3a" distance={520} decay={1.2} />
      <pointLight position={[-6, 14, 150]} intensity={14} color="#4a7cff" distance={300} decay={1.0} />
      {/* the nether wall, the lava, the basalt pillars, the ledge */}
      <mesh position={[0, 150, -130]}><planeGeometry args={[900, 520]} /><meshStandardMaterial map={nether} roughness={1} /></mesh>
      <mesh position={[-170, 120, -40]} rotation={[0, Math.PI / 2.4, 0]}><planeGeometry args={[320, 400]} /><meshStandardMaterial map={nether} roughness={1} /></mesh>
      <mesh position={[-120, 120, -118]}><planeGeometry args={[110, 420]} /><meshStandardMaterial map={lava} emissive="#ff6a1a" emissiveMap={lava} emissiveIntensity={1.3} /></mesh>
      {[[-40, 130], [70, 150], [190, 120], [-190, 100]].map(([x, h], i) => <mesh key={i} position={[x, h, -100 - (i % 2) * 20]}><boxGeometry args={[34 + (i % 2) * 16, h * 2 + 40, 34]} /><meshStandardMaterial map={basalt} roughness={1} /></mesh>)}
      <mesh position={[0, -8, -20]}><boxGeometry args={[520, 16, 190]} /><meshStandardMaterial color="#3b3244" roughness={1} /></mesh>
      <mesh position={[0, -24, 40]}><boxGeometry args={[520, 16, 80]} /><meshStandardMaterial color="#2a2332" roughness={1} /></mesh>
      {/* the two of them */}
      <Character who="kai" mood={shouting ? "grin" : "smile"} pose={kaiPose} skin={tex.kai} hair={tex.kh} position={[-26, 0, -22]} rotation={[0, 24, 0]} />
      <Character who="speed" mood={shouting ? "shout" : "grin"} pose={speedPose} skin={tex.speed} hair={tex.sh} position={[lerp(26, 40, walk), 0, lerp(-22, 30, walk)]} rotation={[0, -22, 0]} />
      {/* real lapis blocks in front */}
      {[[-12, 0, 180], [-12, 16, 180], [-28, 0, 172], [8, -16, 190], [28, -16, 184], [-6, -16, 196]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, 0.2 * (i % 3), 0]}><boxGeometry args={[16, 16, 16]} /><meshStandardMaterial map={tex.lapis} roughness={0.9} emissive="#1a3cff" emissiveIntensity={0.35} /></mesh>
      ))}
      {Array.from({ length: 16 }, (_, i) => {
        const u = ((t * 0.02 + random(`em${i}`)) % 1);
        return <mesh key={i} position={[-110 + random(`ex${i}`) * 120, 6 + u * 150, -90 + random(`ez${i}`) * 60]}><boxGeometry args={[1.2, 1.2, 1.2]} /><meshBasicMaterial color="#ffb347" transparent opacity={1 - u} /></mesh>;
      })}
    </>
  );
};

/* ----------------------------------------------------------------- shot 2: mining on the lapis floor */
const Mine: React.FC<{ t: number; tex: Tex }> = ({ t, tex }) => {
  const beat = (Math.sin(t * 0.46 - 1.2) + 1) / 2;
  const shout = (t >= 0 && t < 9) || (t >= 19 && t < 28);
  const pose: CPose = { armR: [lerp(60, 150, beat), 6], armL: [20, 14], bounce: beat * 1.2, legL: beat * 6, legR: -beat * 6 };
  const cubes = React.useMemo(() => {
    const out: { x: number; y: number; z: number }[] = [];
    for (let gz = -5; gz <= 4; gz++) for (let gx = -6; gx <= 6; gx++) {
      const stair = gx >= 1 && gz <= 0 ? Math.min(gx, -gz + 1, 3) : 0;
      for (let k = 0; k <= stair; k++) out.push({ x: gx * 16, y: -8 + k * 16, z: gz * 16 });
    }
    return out;
  }, []);
  return (
    <>
      <color attach="background" args={["#0a0a28"]} />
      <fog attach="fog" args={["#0c0c34", 120, 520]} />
      <CamRig pos={[-48 + Math.sin(t * 0.3) * 1.5, 98, 92]} look={[-14, 12, 6]} fov={48} />
      <ambientLight intensity={1.6} color="#7a8cff" />
      <directionalLight position={[40, 120, 60]} intensity={2.2} color="#b0c0ff" />
      <pointLight position={[0, 40, 20]} intensity={6} color="#3a5cff" distance={400} decay={1.2} />
      {cubes.map((c, i) => <mesh key={i} position={[c.x, c.y, c.z]}><boxGeometry args={[16, 16, 16]} /><meshStandardMaterial map={tex.lapis} roughness={0.95} /></mesh>)}
      <Character who="speed" mood={shout ? "shout" : "grin"} pose={pose} skin={tex.speed} hair={tex.sh} position={[-30, 0, 18]} rotation={[0, 192, 0]}
        held={<group rotation={[-1.0, 0, 0.35]} position={[0, -1, 3]}><Pickaxe3D image={tex.pick?.image as HTMLImageElement} scale={1.5} /></group>} />
    </>
  );
};

/* ----------------------------------------------------------------- shot 3: breaking through the wall */
const HIT1 = 4, HIT2 = 24;
const Breakthrough: React.FC<{ t: number; tex: Tex }> = ({ t, tex }) => {
  const hole = sm(t, HIT2, HIT2 + 14);
  const shake = t >= HIT1 && t < HIT1 + 8 ? Math.sin(t * 7) * 2.5 : t >= HIT2 && t < HIT2 + 10 ? Math.sin(t * 7) * 5 : 0;
  const crackTex = t < HIT2 ? (t >= HIT1 ? tex.crack3 : null) : null;
  const strike = (h: number) => (t >= h - 9 && t < h + 9 ? (t < h - 3 ? sm(t, h - 9, h - 3) * 0.6 : t < h ? 0.6 + 0.4 * sm(t, h - 3, h) : 1 - sm(t, h, h + 9)) : 0);
  const pk = Math.max(strike(HIT1), strike(HIT2));
  const cells: { x: number; y: number; z: number }[] = [];
  for (let r = -3; r <= 3; r++) for (let c = -2; c <= 2; c++) cells.push({ x: c * 40, y: r * 40, z: 0 });
  return (
    <>
      <color attach="background" args={["#fff7c8"]} />
      <CamRig pos={[shake, 4 + shake * 0.6, 150 - t * 0.6]} look={[0, 0, 0]} fov={48} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[0, 60, 120]} intensity={1.4} />
      {/* the daylight behind the wall */}
      <mesh position={[0, 0, -40]}><planeGeometry args={[900, 900]} /><meshBasicMaterial color={hole > 0 ? "#dff1ff" : "#000000"} /></mesh>
      <Glow position={[0, 0, -20]} size={hole * 700} opacity={hole} />
      {cells.map((c, i) => {
        const dx = c.x, dy = c.y;
        const d = Math.hypot(dx, dy);
        const central = d < 90;
        const fly = central ? hole : 0;
        const ang = Math.atan2(dy, dx);
        const out = fly * (160 + 80 * random(`bf${i}`));
        return (
          <mesh key={i} position={[c.x + Math.cos(ang) * out * (central ? 1 : 0.15), c.y + Math.sin(ang) * out * (central ? 1 : 0.15) - fly * fly * 60, 10 + fly * 90]} rotation={[fly * 3 * random(`bx${i}`), fly * 4 * random(`by${i}`), 0]}>
            <boxGeometry args={[40, 40, 40]} /><meshStandardMaterial map={tex.stone} roughness={1} color="#9a9aa4" />
          </mesh>
        );
      })}
      {crackTex && <mesh position={[0, 0, 20.5]}><planeGeometry args={[75, 75]} /><meshBasicMaterial map={crackTex} transparent opacity={0.9} /></mesh>}
      {/* the pickaxe, swung in from the lower right */}
      <group position={[lerp(48, 14, pk), lerp(-70, -12, pk), 30]} rotation={[0, 0, lerp(0.5, 0.0, pk)]} scale={3.4}>
        <group rotation={[0, 0, 0]}><Pickaxe3D image={tex.pick?.image as HTMLImageElement} /></group>
      </group>
    </>
  );
};

/* ----------------------------------------------------------------- the sunlit valley shots */
const Sunbeam: React.FC<{ t: number; f: number; tex: Tex; closer: number }> = ({ t, f, closer }) => {
  const item: V = [8, 150, -250];
  const camPos: V = [0, 34, lerp(70, -90, closer)];
  return (
    <>
      <color attach="background" args={["#4b9bff"]} />
      <fog attach="fog" args={["#cfe6ff", 1500, 5200]} />
      <CamRig pos={camPos} look={[6, lerp(98, 128, closer), -300]} fov={lerp(60, 48, closer)} />
      <hemisphereLight args={["#bfe2ff", "#6a8a4a", 1.1]} />
      <directionalLight position={[300, 500, 200]} intensity={2.4} color="#fff0c8" />
      <Valley position={[0, -62, -40]} zMax={-5} />
      <Clouds f={f} y={400} />
      <Beam to={item} width={420} cam={camPos} />
      <Beam to={[item[0] + 20, item[1] - 40, item[2] + 10]} from={[item[0] + 380, item[1] + 760, item[2] - 80]} width={170} opacity={0.8} cam={camPos} />
      <Glow position={item} size={120} opacity={0.8} />
      <group position={[item[0], item[1] + Math.sin(f * 0.12) * 4, item[2]]}><GoldApple scale={1.15 - closer * 0.4} f={f} /></group>
    </>
  );
};

/* ----------------------------------------------------------------- shot 5 / 7: Speed in the meadow */
const Meadow: React.FC<{ tex: Tex; f: number; z?: number }> = ({ f }) => {
  const grass = React.useMemo(() => rep(noiseTex("#5fb04a", 0.35, "gr"), 40, 40), []);
  return (
    <>
      <color attach="background" args={["#4b9bff"]} />
      <fog attach="fog" args={["#bfe0ff", 500, 2400]} />
      <hemisphereLight args={["#bfe2ff", "#6a8a4a", 1.0]} />
      <directionalLight position={[160, 260, 160]} intensity={2.3} color="#fff0c8" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}><planeGeometry args={[1200, 1200]} /><meshStandardMaterial map={grass} roughness={1} /></mesh>
      <Valley position={[0, -62, -190]} zMax={0} />
      <Clouds f={f} y={420} spread={1100} />
    </>
  );
};

const Hero: React.FC<{ t: number; f: number; tex: Tex }> = ({ t, f, tex }) => {
  const turn = sm(t, 28, 40);
  const hype = [t - 22, t - 5].map((d) => (d >= 0 && d < 12 ? Math.sin((d / 12) * Math.PI) : 0));
  const mood: Mood = t < 24 ? "shock" : "shout";
  const pose: CPose = { armL: [30, lerp(110, 150, turn)], armR: [0, lerp(40, 150, turn)], head: [0, lerp(8, -4, turn), 0], bounce: Math.max(...hype) * 2 };
  return (
    <>
      <Meadow tex={tex} f={f} />
      <CamRig pos={[lerp(-26, -10, turn), 22, lerp(54, 46, turn)]} look={[lerp(2, 5, turn), 28, 0]} fov={52} />
      <Character who="speed" mood={mood} pose={pose} skin={tex.speed} hair={tex.sh} position={[0, 0, 0]} rotation={[0, lerp(-30, -12, turn), 0]}
        held={<mesh position={[0, -2, 2]} rotation={[0.3, 0.5, 0]}><boxGeometry args={[7, 7, 7]} /><meshStandardMaterial map={tex.lapis} roughness={0.9} /></mesh>} heldHand="L" />
    </>
  );
};

const Shock: React.FC<{ t: number; f: number; tex: Tex }> = ({ t, f, tex }) => {
  const jx = Math.sin(t * 5.2) * 1.2, jy = Math.cos(t * 4.4) * 0.9;
  return (
    <>
      <Meadow tex={tex} f={f} />
      <CamRig pos={[jx - 2, 30 + jy, 36]} look={[0, 29, 0]} fov={50} />
      <Character who="speed" mood="shock" skin={tex.speed} hair={tex.sh} position={[0, 0, 0]} rotation={[0, -8, 0]}
        pose={{ armL: [0, 120 + Math.sin(t * 0.9) * 14], armR: [0, 120 - Math.sin(t * 0.9) * 14], head: [0, 0, Math.sin(t * 0.9) * 4] }} />
    </>
  );
};

/* ----------------------------------------------------------------- shot 6: the temple */
const Temple: React.FC<{ t: number; f: number; tex: Tex }> = ({ t, f, tex }) => {
  const marble = React.useMemo(() => rep(tex.marble, 6, 6), [tex.marble]);
  const mat = <meshStandardMaterial map={marble} roughness={0.8} color="#f4eee0" />;
  const cols: V[] = [];
  for (let i = 0; i < 8; i++) cols.push([-30 * 8 + i * 8.4 * 8, 0, 10 * 8]);
  for (let j = 0; j < 9; j++) cols.push([28.8 * 8, 0, -10 * 8 + j * 2.5 * 8]);
  return (
    <>
      <Meadow tex={tex} f={f} />
      <CamRig pos={[lerp(-150, -110, t / 32), 40, lerp(60, 30, t / 32)]} look={[20, 56, -380]} fov={46} />
      <group position={[0, 0, -420]} scale={0.42}>
        <mesh position={[0, 8, 0]} castShadow><boxGeometry args={[576, 16, 256]} />{mat}</mesh>
        <mesh position={[0, 24, 0]}><boxGeometry args={[544, 16, 224]} />{mat}</mesh>
        <mesh position={[0, 40, 0]}><boxGeometry args={[512, 16, 192]} />{mat}</mesh>
        {cols.map((c, i) => <mesh key={i} position={[c[0], 48 + 112, c[2]]} castShadow><boxGeometry args={[24, 224, 24]} />{mat}</mesh>)}
        <mesh position={[0, 120, 0]}><boxGeometry args={[384, 160, 128]} /><meshStandardMaterial map={marble} roughness={1} color="#d8d0bc" /></mesh>
        <mesh position={[0, 276, 0]}><boxGeometry args={[512, 24, 200]} />{mat}</mesh>
        <mesh position={[0, 300, 0]}><boxGeometry args={[528, 12, 208]} />{mat}</mesh>
        {/* the pediment: stepped blocks */}
        {Array.from({ length: 6 }, (_, k) => <mesh key={k} position={[0, 318 + k * 16, 100]}><boxGeometry args={[480 - k * 80, 16, 8]} />{mat}</mesh>)}
      </group>
      <Character who="speed" mood="plain" skin={tex.speed} hair={tex.sh} position={[-84, 0, -120]} scale={1.6} rotation={[0, 192, 0]} pose={{ armL: [0, 12], armR: [0, 12] }} />
      <Character who="kai" mood="plain" skin={tex.kai} hair={tex.kh} position={[-52, 0, -122]} scale={1.6} rotation={[0, 172, 0]} pose={{ armL: [0, 10], armR: [0, 10] }} />
    </>
  );
};

/* ----------------------------------------------------------------- shot 9: Kai in a toga and a laurel crown */
const Crowned: React.FC<{ t: number; f: number; tex: Tex }> = ({ t, f, tex }) => {
  const field = React.useMemo(() => rep(noiseTex("#c9a24a", 0.3, "fd"), 40, 40), []);
  return (
    <>
      <color attach="background" args={["#4b9bff"]} />
      <fog attach="fog" args={["#cfe6ff", 500, 2400]} />
      <hemisphereLight args={["#bfe2ff", "#b89a4a", 1.0]} />
      <directionalLight position={[160, 260, 160]} intensity={2.3} color="#fff0c8" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}><planeGeometry args={[1200, 1200]} /><meshStandardMaterial map={field} roughness={1} /></mesh>
      <Valley position={[0, -62, -190]} flowers={false} />
      <Clouds f={f} y={420} spread={1100} />
      <CamRig pos={[-10 + t * 0.03, 24, 44]} look={[0, 33, 0]} fov={50} />
      <Character who="kai" mood={t < 25 ? "calm" : "smile"} skin={tex.kai} hair={tex.kh} toga={tex.toga} leaf={tex.leaf} laurel position={[0, 0, 0]} rotation={[0, -34, 0]} pose={{ armR: [30, 10], armL: [0, 8], head: [0, 0, 0] }} />
    </>
  );
};

/* ----------------------------------------------------------------- subtitles + assembly */
const SubBar: React.FC<{ f: number }> = ({ f }) => {
  const s = B.subs.find(([a, b]) => f >= (a as number) && f < (b as number));
  if (!s) return null;
  const text = s[2] as string;
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: 1380, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "rgba(0,0,0,0.55)", color: "#fff", fontFamily: "Monocraft, monospace", fontSize: 46, padding: "14px 36px", whiteSpace: "pre" }}>{text}</div>
    </div>
  );
};

const shotAt = (f: number) => {
  const c = B.cuts;
  for (let i = 0; i < c.length - 1; i++) if (f >= c[i] && f < c[i + 1]) return { i, t: f - c[i], len: c[i + 1] - c[i] };
  return { i: 8, t: 0, len: 1 };
};

export const LaPeace3D: React.FC<{ audio?: string | null; captions?: boolean }> = ({ audio = null, captions = true }) => {
  loadMinecraftFonts();
  const f = useCurrentFrame();
  const tex = useTextures(TEXTURES);
  const ready = Object.keys(tex).length === Object.keys(TEXTURES).length;
  const { i, t, len } = shotAt(f);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {audio && <Audio src={staticFile(audio)} />}
      {ready && (
        <ThreeCanvas width={W} height={H} camera={{ position: [0, 20, 100], fov: 45 }} gl={{ antialias: true }} style={{ filter: "saturate(1.18) contrast(1.06)" }}>
          {i === 0 && <Cave t={t} tex={tex} />}
          {i === 1 && <Mine t={t} tex={tex} />}
          {i === 2 && <Breakthrough t={t} tex={tex} />}
          {i === 3 && <Sunbeam t={t} f={f} tex={tex} closer={t / len * 0.35} />}
          {i === 4 && <Hero t={t} f={f} tex={tex} />}
          {i === 5 && <Temple t={t} f={f} tex={tex} />}
          {i === 6 && <Shock t={t} f={f} tex={tex} />}
          {i === 7 && <Sunbeam t={t} f={f} tex={tex} closer={0.3 + (t / len) * 0.3} />}
          {i === 8 && <Crowned t={t} f={f} tex={tex} />}
        </ThreeCanvas>
      )}
      {/* a soft vignette like the reference's grading */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)", pointerEvents: "none" }} />
      {captions && <SubBar f={f} />}
    </AbsoluteFill>
  );
};

void interpolate;
