import React from "react";
import { INK } from "../common";
import { FaceSpec, P, Pose, Skin } from "../kit2";

/** shared helpers for the kit-3 original cast */

export type HeadProps = { face?: string; turn?: number; lw: number; ink?: string; drained?: boolean };

export const FaceOf = <T extends string>(table: Record<T, FaceSpec>, name: string, fallback: T): FaceSpec => table[(name in table ? name : fallback) as T];

/** colour -> washed-out grey of the same value, for the "drained" (grey line art) state */
export const toGrey = (hex: string): string => {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const l = (0.3 * r + 0.59 * g + 0.11 * b) / 255;
  const v = Math.round(255 * (0.36 + 0.58 * l));
  const h = (x: number) => Math.min(255, x).toString(16).padStart(2, "0");
  return `#${h(v)}${h(v)}${h(v + 6)}`;
};
/** k(drained)(hex) */
export const K = (drained?: boolean) => (hex: string): string => (drained ? toGrey(hex) : hex);
export const GREY_SKIN: Skin = { base: "#eef0f3", shade: "#c3c8d2" };

/** how a character is built: overall scale and body stretch applied to the shared pose skeleton */
export type Build = { s: number; kx: number; ky: number };
export const reshape = (p: Pose, b: Build): Pose => {
  const o: Record<string, unknown> = { ...p };
  for (const k of Object.keys(p) as (keyof Pose)[]) {
    const v = p[k];
    if (Array.isArray(v)) o[k] = [v[0] * b.kx, v[1] * b.ky];
  }
  return o as Pose;
};
/** body-space point -> frame point for a figure placed with x,y,s,flipX (after its build) */
export const bodyToWorld = (pt: P, at: { x: number; y: number; s: number; flipX?: boolean }, b: Build): P => {
  const sc = at.s * b.s;
  return [at.x + pt[0] * b.kx * sc * (at.flipX ? -1 : 1), at.y + pt[1] * b.ky * sc];
};
/** frame point -> body-space (post-build) coords of a figure */
export const worldToBody = (pt: P, at: { x: number; y: number; s: number; flipX?: boolean }, b: Build): P => {
  const sc = at.s * b.s;
  return [((pt[0] - at.x) / sc) * (at.flipX ? -1 : 1), (pt[1] - at.y) / sc];
};

export const BRASS = { base: "#e5b040", shade: "#a8761c" };
export { INK };
