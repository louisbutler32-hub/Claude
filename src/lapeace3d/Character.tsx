import React from "react";
import * as THREE from "three";
import { random } from "remotion";
import { mcBox, pixelTexture } from "./lib";

export type Who = "speed" | "kai";
export type Mood = "shout" | "plain" | "shock" | "smile" | "calm" | "grin";
export type CPose = {
  head?: [number, number, number]; // pitch, yaw, roll (degrees)
  armL?: [number, number]; // forward raise, sideways raise (degrees)
  armR?: [number, number];
  legL?: number; legR?: number;
  bounce?: number;
};

const PXC: Record<string, string> = { W: "#ffffff", D: "#1a1018", R: "#8a1c2c", T: "#ffffff", N: "rgba(0,0,0,0.2)", B: "rgba(24,12,12,0.78)", b: "rgba(24,12,12,0.4)", S: "#f2c29b" };
const rowsFor = (who: Who, m: Mood): string[] => {
  const base: Record<Mood, string[]> = {
    shout: ["........", "........", ".DD..DD.", ".DD..DD.", "......S.", "...NN...", ".TTTTTT.", "..RRRR.."],
    plain: ["........", "........", ".DD..DD.", ".WD..DW.", "......S.", "...NN...", "........", "..DDDD.."],
    shock: ["........", "........", ".DD..DD.", ".WW..WW.", ".WD..DW.", "...NN...", "...RR...", "...RR..."],
    smile: ["........", "........", ".DD..DD.", ".WD..DW.", "......S.", "...NN...", ".D....D.", "..DDDD.."],
    calm: ["........", "........", "..D..D..", ".DD..DD.", "......S.", "...NN...", "........", "..DDDD.."],
    grin: ["........", "........", ".DD..DD.", ".WD..DW.", "......S.", "...NN...", ".TTTTTT.", "..TTTT.."],
  };
  const rows = base[m].map((r) => r.split(""));
  if (who === "kai") {
    rows[5][0] = "B"; rows[5][7] = "B"; rows[6][0] = "B"; rows[6][1] = "B"; rows[6][6] = "B"; rows[6][7] = "B";
    for (let i = 0; i < 8; i++) if (rows[7][i] === ".") rows[7][i] = "B";
  } else {
    for (let i = 0; i < 8; i++) if (rows[7][i] === ".") rows[7][i] = "b";
    rows[6][0] = "b"; rows[6][7] = "b";
  }
  return rows.map((r) => r.join(""));
};

const cache = new Map<string, THREE.CanvasTexture>();
/** the skin atlas with the expression painted on the head front */
const skinWithFace = (who: Who, mood: Mood, base: THREE.Texture) => {
  const key = `${who}-${mood}`;
  if (cache.has(key)) return cache.get(key)!;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  g.imageSmoothingEnabled = false;
  g.drawImage(base.image as CanvasImageSource, 0, 0, 64, 64);
  rowsFor(who, mood).forEach((r, j) => r.split("").forEach((ch, i) => { if (ch !== ".") { g.fillStyle = PXC[ch]; g.fillRect(8 + i, 8 + j, 1, 1); } }));
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace; t.generateMipmaps = false;
  cache.set(key, t);
  return t;
};

const D2R = Math.PI / 180;

/** a Minecraft-skin character, 1 unit = 1 skin pixel, feet at y = 0, facing +z */
export const Character: React.FC<{
  who: Who; mood?: Mood; pose?: CPose; skin: THREE.Texture; hair: THREE.Texture; toga?: THREE.Texture; leaf?: THREE.Texture; laurel?: boolean;
  position?: [number, number, number]; rotation?: [number, number, number]; scale?: number; held?: React.ReactNode; heldHand?: "L" | "R";
}> = ({ who, mood = "plain", pose = {}, skin, hair, toga, leaf, laurel, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, held, heldHand = "R" }) => {
  const head = pose.head ?? [0, 0, 0];
  const aL = pose.armL ?? [0, 4], aR = pose.armR ?? [0, 4];
  const dy = pose.bounce ?? 0;
  const faceTex = skinWithFace(who, mood, skin);
  const mat = (map: THREE.Texture, soft = false) => <meshStandardMaterial map={map} roughness={soft ? 0.95 : 0.9} metalness={0} />;
  const geos = React.useMemo(() => ({
    legR: mcBox(4, 12, 4, 0, 16), body: mcBox(8, 12, 4, 16, 16), armR: mcBox(4, 12, 4, 40, 16), head: mcBox(8, 8, 8, 0, 0),
  }), []);
  const hairMat = <meshStandardMaterial map={hair} roughness={1} />;
  const strands = React.useMemo(() => Array.from({ length: 11 }, (_, i) => {
    const a = (i / 11) * Math.PI * 2, r = 2.6 + (i % 3) * 0.7;
    return { x: Math.cos(a) * r, z: Math.sin(a) * r, lean: 28 + (i % 4) * 9, a, len: 5.4 + (i % 3) };
  }), []);
  return (
    <group position={position} rotation={rotation.map((r) => r * D2R) as unknown as THREE.Euler} scale={scale}>
      <group position={[0, dy, 0]}>
        {/* legs */}
        <group position={[2, 12, 0]} rotation={[(pose.legL ?? 0) * D2R, 0, 0]}><mesh geometry={geos.legR} position={[0, -6, 0]} castShadow>{mat(skin)}</mesh></group>
        <group position={[-2, 12, 0]} rotation={[(pose.legR ?? 0) * D2R, 0, 0]}><mesh geometry={geos.legR} position={[0, -6, 0]} castShadow>{mat(skin)}</mesh></group>
        {/* body */}
        <mesh geometry={geos.body} position={[0, 18, 0]} castShadow>{mat(skin)}</mesh>
        {toga && <mesh position={[0, 17.4, 0]} castShadow><boxGeometry args={[9, 12, 5]} /><meshStandardMaterial map={toga} roughness={1} /></mesh>}
        {/* arms: the character's left arm is +x */}
        <group position={[6, 22, 0]} rotation={[-aL[0] * D2R, 0, aL[1] * D2R]}>
          <mesh geometry={geos.armR} position={[0, -6, 0]} castShadow>{mat(skin)}</mesh>
          {held && heldHand === "L" && <group position={[0, -12, 0]}>{held}</group>}
        </group>
        <group position={[-6, 22, 0]} rotation={[-aR[0] * D2R, 0, -aR[1] * D2R]}>
          <mesh geometry={geos.armR} position={[0, -6, 0]} castShadow>{mat(skin)}</mesh>
          {held && heldHand === "R" && <group position={[0, -12, 0]}>{held}</group>}
        </group>
        {/* head, hair and extras */}
        <group position={[0, 24, 0]} rotation={[head[0] * D2R, head[1] * D2R, head[2] * D2R]}>
          <mesh geometry={geos.head} position={[0, 4, 0]} castShadow>{mat(faceTex)}</mesh>
          {who === "kai" ? (
            <>
              <mesh position={[0, 8.7, -1.4]} castShadow><boxGeometry args={[13.2, 13.5, 10.3]} />{hairMat}</mesh>
              <mesh position={[0, 8.4, 3.8]}><boxGeometry args={[10, 5.4, 1]} />{hairMat}</mesh>
            </>
          ) : (
            <>
              <mesh position={[0, 7.9, 0]} castShadow><boxGeometry args={[8.8, 2.6, 8.8]} />{hairMat}</mesh>
              {[0, 1, 2, 3, 4].map((i) => <mesh key={i} position={[-3.1 + i * 1.55, 7.9, 4.4]}><boxGeometry args={[1.5, 1.5, 0.9]} />{hairMat}</mesh>)}
              {strands.map((s, i) => (
                <group key={i} position={[s.x, 8.6, s.z]} rotation={[Math.sin(s.a) * s.lean * D2R, 0, -Math.cos(s.a) * s.lean * D2R]}>
                  <mesh position={[0, s.len / 2, 0]} castShadow><boxGeometry args={[1.8, s.len, 1.8]} />{hairMat}</mesh>
                </group>
              ))}
            </>
          )}
          {laurel && leaf && Array.from({ length: who === "kai" ? 18 : 14 }, (_: unknown, i: number) => {
            const n = who === "kai" ? 18 : 14;
            const a = Math.PI * (0.02 + 0.96 * (i / (n - 1)));
            const rr = who === "kai" ? 7.4 : 5.0;
            return (
              <mesh key={i} position={[-Math.cos(a) * rr, (who === "kai" ? 8.6 : 7.6) + Math.sin(a) * (who === "kai" ? 5.0 : 1.6), who === "kai" ? 1.5 : 0]} rotation={[0, 0, ((i % 2 ? 1 : -1) * 25 + (a * 180) / Math.PI - 90) * D2R]}>
                <boxGeometry args={[2.8, 1.2, 3.2]} /><meshStandardMaterial map={leaf} roughness={1} />
              </mesh>
            );
          })}
        </group>
      </group>
    </group>
  );
};

void random;
void pixelTexture;
