import React from "react";
import * as THREE from "three";
import { random } from "remotion";
import { hexShade, noiseTex, pixelTexture } from "./lib";

const BLOCK = 16;

/* ---------------------------- terrain ---------------------------- */

/** the height (in blocks) of the valley floor at (x, z) in block coordinates: a bowl with a river down the middle and mountains far away */
export const valleyHeight = (x: number, z: number) => {
  const n = (a: number, b: number) => Math.sin(a * 0.31 + Math.cos(b * 0.23) * 1.7) * 0.9 + Math.sin(a * 0.11 - b * 0.17 + 2) * 1.8 + Math.sin(a * 0.7 + b * 0.5) * 0.35;
  const far = Math.max(0, -z - 46); // mountains rise beyond 46 blocks away
  const side = Math.max(0, Math.abs(x) - 22);
  let h = 4 + n(x, z) + far * 0.7 + Math.pow(far, 1.4) * 0.08 + side * 0.3;
  // peaks
  h += Math.max(0, Math.sin(x * 0.09 + 1) * Math.sin(z * 0.07)) * Math.min(far, 60) * 0.5;
  // the river
  const rx = 6 + Math.sin(z * 0.12) * 9 + Math.sin(z * 0.33) * 2.5;
  const d = Math.abs(x - rx);
  if (z > -52 && d < 3.5) h = Math.min(h, 1.2 + Math.max(0, d - 2) * 2);
  return Math.max(1, Math.round(h));
};
export const isWater = (x: number, z: number) => {
  const rx = 6 + Math.sin(z * 0.12) * 9 + Math.sin(z * 0.33) * 2.5;
  return z > -52 && Math.abs(x - rx) < 2.6;
};

/** the valley as one instanced mesh of tall blocks; the camera sits over (0, 0, 0) looking toward -z */
export const Valley: React.FC<{ nx?: number; nz?: number; position?: [number, number, number]; flowers?: boolean; zMax?: number }> = ({ nx = 72, nz = 118, position = [0, 0, 0], flowers = true, zMax = -4 }) => {
  const data = React.useMemo(() => {
    const items: { x: number; z: number; h: number; c: THREE.Color; water: boolean }[] = [];
    const fl: { x: number; y: number; z: number; c: THREE.Color }[] = [];
    for (let i = -nx / 2; i < nx / 2; i++) for (let j = -nz + 10; j < zMax; j++) {
      const h = valleyHeight(i, j);
      const water = isWater(i, j);
      const r = random(`vc${i}_${j}`);
      let col: THREE.Color;
      if (water) col = new THREE.Color("#3f76e4").offsetHSL(0, 0, (r - 0.5) * 0.06);
      else if (h > 26) col = new THREE.Color("#f4f7ff").offsetHSL(0, 0, (r - 0.5) * 0.05);
      else if (h > 16) col = new THREE.Color(r > 0.55 ? "#8a8f9a" : "#767c88");
      else if (h > 9) col = new THREE.Color(r > 0.5 ? "#6b7a58" : "#7d8a66");
      else col = new THREE.Color(["#4f9a3a", "#5fb04a", "#6cc152", "#57a23f", "#78c85a"][Math.floor(r * 5)]);
      items.push({ x: i, z: j, h, c: col, water });
      if (flowers && !water && h < 8 && random(`fl${i}_${j}`) > 0.72 && j > -40) {
        fl.push({ x: i * BLOCK + (random(`fx${i}${j}`) - 0.5) * 8, y: h * BLOCK, z: j * BLOCK + (random(`fz${i}${j}`) - 0.5) * 8, c: new THREE.Color(["#e8483a", "#ff6b81", "#ffd84a", "#9a6bd6", "#ffffff"][Math.floor(random(`fc${i}${j}`) * 5)]) });
      }
    }
    return { items, fl };
  }, [nx, nz, flowers, zMax]);
  const ref = React.useRef<THREE.InstancedMesh>(null);
  const fref = React.useRef<THREE.InstancedMesh>(null);
  React.useLayoutEffect(() => {
    const m = ref.current!;
    const o = new THREE.Object3D();
    data.items.forEach((it, k) => {
      o.position.set(it.x * BLOCK, (it.h * BLOCK) / 2 - (it.water ? 6 : 0), it.z * BLOCK);
      o.scale.set(1, it.h - (it.water ? 0.4 : 0), 1);
      o.updateMatrix();
      m.setMatrixAt(k, o.matrix);
      m.setColorAt(k, it.c);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    const fm = fref.current;
    if (fm) {
      data.fl.forEach((fl, k) => {
        o.position.set(fl.x, fl.y + 3, fl.z); o.scale.set(1, 1, 1); o.updateMatrix();
        fm.setMatrixAt(k, o.matrix); fm.setColorAt(k, fl.c);
      });
      fm.instanceMatrix.needsUpdate = true;
      if (fm.instanceColor) fm.instanceColor.needsUpdate = true;
    }
  }, [data]);
  return (
    <group position={position}>
      <instancedMesh ref={ref} args={[undefined, undefined, data.items.length]} receiveShadow>
        <boxGeometry args={[BLOCK, BLOCK, BLOCK]} />
        <meshStandardMaterial roughness={1} />
      </instancedMesh>
      {data.fl.length > 0 && (
        <instancedMesh ref={fref} args={[undefined, undefined, data.fl.length]}>
          <boxGeometry args={[5, 6, 5]} />
          <meshStandardMaterial roughness={1} />
        </instancedMesh>
      )}
    </group>
  );
};

/* ---------------------------- sky, clouds, beam ---------------------------- */

export const Clouds: React.FC<{ f: number; y?: number; spread?: number }> = ({ f, y = 480, spread = 1400 }) => {
  const slabs = React.useMemo(() => Array.from({ length: 60 }, (_, i) => ({ x: (random(`cx${i}`) - 0.5) * spread * 1.6, z: -random(`cz${i}`) * spread * 1.1 + 100, w: 160 + random(`cw${i}`) * 420, d: 90 + random(`cd${i}`) * 260, y: y + random(`cy${i}`) * 240 - 160, o: 0.55 + random(`co${i}`) * 0.35 })), [spread, y]);
  return (
    <group>
      {slabs.map((s, i) => (
        <mesh key={i} position={[((s.x + f * 0.6 + spread) % (spread * 1.6)) - spread * 0.8, s.y, s.z]}>
          <boxGeometry args={[s.w, 6, s.d]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={s.o} fog={false} />
        </mesh>
      ))}
    </group>
  );
};

let _beamTex: THREE.CanvasTexture | null = null;
const beamTexture = () => {
  if (_beamTex) return _beamTex;
  const c = document.createElement("canvas"); c.width = 64; c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, "rgba(255,246,170,0.25)"); grad.addColorStop(0.6, "rgba(255,240,150,0.7)"); grad.addColorStop(1, "rgba(255,236,140,0.95)");
  g.fillStyle = grad; g.fillRect(0, 0, 64, 256);
  const side = g.createLinearGradient(0, 0, 64, 0);
  side.addColorStop(0, "rgba(0,0,0,1)"); side.addColorStop(0.5, "rgba(0,0,0,0)"); side.addColorStop(1, "rgba(0,0,0,1)");
  g.globalCompositeOperation = "destination-out"; g.fillStyle = side; g.fillRect(0, 0, 64, 256);
  _beamTex = new THREE.CanvasTexture(c);
  return _beamTex;
};
let _glowTex: THREE.CanvasTexture | null = null;
export const glowTexture = () => {
  if (_glowTex) return _glowTex;
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,250,200,1)"); grad.addColorStop(0.35, "rgba(255,240,150,0.55)"); grad.addColorStop(1, "rgba(255,230,120,0)");
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
  _glowTex = new THREE.CanvasTexture(c);
  return _glowTex;
};

/** a slanted shaft of sunlight: additive ribbons from the sky down to `to`, turned to face the camera */
export const Beam: React.FC<{ to: [number, number, number]; from?: [number, number, number]; width?: number; opacity?: number; cam?: [number, number, number] }> = ({ to, from = [to[0] + 260, to[1] + 700, to[2] - 120], width = 150, opacity = 1, cam = [0, 34, 70] }) => {
  const dir = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const len = dir.length();
  const mid = new THREE.Vector3((to[0] + from[0]) / 2, (to[1] + from[1]) / 2, (to[2] + from[2]) / 2);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir.clone().normalize());
  // the camera, in the beam's own space: turn the ribbon about its axis to face it
  const local = new THREE.Vector3(cam[0] - mid.x, cam[1] - mid.y, cam[2] - mid.z).applyQuaternion(q.clone().invert());
  const phi = Math.atan2(local.x, local.z);
  return (
    <group position={mid} quaternion={q}>
      {[[0, 1], [0.7, 0.6], [-0.7, 0.6]].map(([da, k], i) => (
        <mesh key={i} rotation={[0, phi + da, 0]}>
          <planeGeometry args={[width * (k as number), len]} />
          <meshBasicMaterial map={beamTexture()} transparent opacity={0.42 * opacity} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} fog={false} />
        </mesh>
      ))}
    </group>
  );
};

export const Glow: React.FC<{ position: [number, number, number]; size: number; opacity?: number }> = ({ position, size, opacity = 1 }) => (
  <sprite position={position} scale={[size, size, 1]}>
    <spriteMaterial map={glowTexture()} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
  </sprite>
);

/* ---------------------------- items ---------------------------- */

const APPLE = [
  "....t....", "...tt....", "..GgGGG..", ".GwgGGGG.", ".GwGGGGGd", ".GGGGGGdd", ".GGGGGddD", "..GGGddD.", "...DDDD..",
];
const APPLE_C: Record<string, string> = { t: "#6b4a2a", G: "#ffd23a", g: "#ffe98a", w: "#fff8c8", d: "#e0a020", D: "#b57a10" };

/** a block-pixel golden apple, glowing */
export const GoldApple: React.FC<{ scale?: number; f?: number }> = ({ scale = 1, f = 0 }) => {
  const cells: React.ReactNode[] = [];
  APPLE.forEach((row, j) => row.split("").forEach((ch, i) => {
    if (ch === ".") return;
    cells.push(<mesh key={`${i}${j}`} position={[(i - 4) * 4, (4 - j) * 4, 0]}><boxGeometry args={[4, 4, 6]} /><meshStandardMaterial color={APPLE_C[ch]} emissive={APPLE_C[ch]} emissiveIntensity={0.7} roughness={0.5} /></mesh>);
  }));
  return <group scale={scale} rotation={[0, f * 0.05, 0]}>{cells}</group>;
};

/** the iron pickaxe, extruded from its pixel picture */
export const Pickaxe3D: React.FC<{ image: HTMLImageElement | null; scale?: number }> = ({ image, scale = 1 }) => {
  const cells = React.useMemo(() => {
    if (!image) return [] as { x: number; y: number; c: string }[];
    const n = 24;
    const c = document.createElement("canvas"); c.width = c.height = n;
    const g = c.getContext("2d")!;
    g.imageSmoothingEnabled = false;
    g.drawImage(image, 0, 0, n, n);
    const d = g.getImageData(0, 0, n, n).data;
    const out: { x: number; y: number; c: string }[] = [];
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const i = (y * n + x) * 4;
      if (d[i + 3] > 110) out.push({ x, y, c: `rgb(${d[i]},${d[i + 1]},${d[i + 2]})` });
    }
    return out;
  }, [image]);
  return (
    <group scale={scale}>
      {cells.map((k, i) => (
        <mesh key={i} position={[(k.x - 12) * 1.0, (12 - k.y) * 1.0, 0]}>
          <boxGeometry args={[1.05, 1.05, 1.6]} />
          <meshStandardMaterial color={k.c} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
};

void hexShade; void noiseTex; void pixelTexture;
