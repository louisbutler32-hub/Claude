import React from "react";
import * as THREE from "three";
import { continueRender, delayRender, random, staticFile } from "remotion";

/** load pixel textures (nearest filtering) before the first frame renders */
export const useTextures = (names: Record<string, string>) => {
  const [handle] = React.useState(() => delayRender("loading textures"));
  const [tex, setTex] = React.useState<Record<string, THREE.Texture>>({});
  React.useEffect(() => {
    const loader = new THREE.TextureLoader();
    const keys = Object.keys(names);
    Promise.all(keys.map((k) => new Promise<[string, THREE.Texture]>((res) => loader.load(staticFile(names[k]), (t) => {
      t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace; t.generateMipmaps = false;
      res([k, t]);
    }, undefined, () => res([k, new THREE.Texture()]))))).then((arr) => { setTex(Object.fromEntries(arr)); continueRender(handle); });
  }, [handle]);
  return tex;
};

/** a procedural pixel texture: n x n cells coloured by fn */
export const pixelTexture = (n: number, fn: (x: number, y: number) => string, size = 256) => {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const k = size / n;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { g.fillStyle = fn(x, y); g.fillRect(x * k, y * k, k + 0.5, k + 0.5); }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace; t.generateMipmaps = false;
  return t;
};

export const hexShade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (s: number) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * k)));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
};

export const noiseTex = (base: string, amt: number, seed: string, n = 16) => pixelTexture(n, (x, y) => hexShade(base, 1 + (random(`${seed}${x}_${y}`) - 0.5) * amt));

/** Minecraft-layout box geometry: u, v are the box's origin in the 64x64 skin atlas */
export const mcBox = (w: number, h: number, d: number, u: number, v: number, atlas = 64) => {
  const g = new THREE.BoxGeometry(w, h, d);
  const rect = (x: number, y: number, rw: number, rh: number): [number, number, number, number] => [x / atlas, 1 - y / atlas, (x + rw) / atlas, 1 - (y + rh) / atlas];
  // three.js face order: +x, -x, +y, -y, +z, -z
  const faces: [number, number, number, number][] = [
    rect(u + d + w, v + d, d, h), // +x : the character's left
    rect(u, v + d, d, h), //          -x : the character's right
    rect(u + d, v, w, d), //          +y : top
    rect(u + d + w, v, w, d), //      -y : bottom
    rect(u + d, v + d, w, h), //      +z : front
    rect(u + 2 * d + w, v + d, w, h), // -z : back
  ];
  const uv = g.attributes.uv as THREE.BufferAttribute;
  faces.forEach(([u0, v0, u1, v1], f) => {
    // each face has 4 vertices in the order: top-left, top-right, bottom-left, bottom-right
    uv.setXY(f * 4 + 0, u0, v0); uv.setXY(f * 4 + 1, u1, v0); uv.setXY(f * 4 + 2, u0, v1); uv.setXY(f * 4 + 3, u1, v1);
  });
  uv.needsUpdate = true;
  return g;
};
