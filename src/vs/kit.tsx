import React from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { continueRender, delayRender, staticFile } from "remotion";

/**
 * Shared helpers for the "Could <player> beat <opponent>?" 3D sims: maths, the
 * camera rig, canvas textures and the fonts. 1 unit = 1 metre, y is up, the
 * main hoop is at the -z end of the court.
 */

export const W = 1080, H = 1920, FPS = 30;
export type V = [number, number, number];

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
/** smoothstep of f between a and b */
export const sm = (f: number, a: number, b: number) => { const t = clamp01((f - a) / (b - a)); return t * t * (3 - 2 * t); };
export const lin = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
export const lerpV = (a: V, b: V, t: number): V => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
/** 0 → 1 → 0 bump over [a, b] */
export const bump = (f: number, a: number, b: number) => (f <= a || f >= b ? 0 : Math.sin(((f - a) / (b - a)) * Math.PI));
export const D2R = Math.PI / 180;

export const CamRig: React.FC<{ pos: V; look: V; fov?: number; roll?: number; shake?: number; f?: number }> = ({ pos, look, fov = 50, roll = 0, shake = 0, f = 0 }) => {
  const { camera } = useThree();
  const sx = shake ? Math.sin(f * 2.7) * shake : 0, sy = shake ? Math.cos(f * 3.3) * shake : 0;
  React.useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(pos[0] + sx, pos[1] + sy, pos[2]);
    c.up.set(Math.sin(roll * D2R), Math.cos(roll * D2R), 0);
    c.fov = fov; c.aspect = W / H; c.near = 0.05; c.far = 900;
    c.lookAt(look[0] + sx, look[1] + sy, look[2]);
    c.updateProjectionMatrix();
  }, [camera, ...pos, ...look, fov, roll, sx, sy]);
  return null;
};

const texCache = new Map<string, THREE.CanvasTexture>();
/** a cached canvas texture, drawn once per key */
export const canvasTex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, opts: { repeat?: [number, number]; pixel?: boolean } = {}) => {
  const k = `${key}|${opts.repeat?.join(",") ?? ""}`;
  const hit = texCache.get(k);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (opts.pixel) { t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; }
  if (opts.repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...opts.repeat); }
  texCache.set(k, t);
  return t;
};

/** deterministic 0..1 noise from integers */
export const hash = (a: number, b = 0) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

let fontsLoaded: Promise<unknown> | null = null;
/** true once the fonts are in; canvas textures (scoreboards, banners) are drawn with them, so scenes wait for it */
export const useVsFonts = () => {
  const [ready, setReady] = React.useState(false);
  const [handle] = React.useState(() => delayRender("loading vs fonts"));
  React.useEffect(() => {
    if (!fontsLoaded) {
      const faces = [
        new FontFace("Montserrat", `url(${staticFile("fonts/Montserrat-Variable.ttf")}) format("truetype")`, { weight: "100 900" }),
        new FontFace("Silkscreen", `url(${staticFile("fonts/Silkscreen-Regular.ttf")}) format("truetype")`, { weight: "400" }),
        new FontFace("Anton", `url(${staticFile("fonts/Anton-Regular.ttf")}) format("truetype")`, { weight: "400" }),
      ];
      fontsLoaded = Promise.all(faces.map((f) => f.load().then((l) => document.fonts.add(l)))).catch(() => undefined);
    }
    fontsLoaded.then(() => { setReady(true); continueRender(handle); });
  }, [handle]);
  return ready;
};
