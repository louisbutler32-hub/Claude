import { Asset } from "../engine";

/**
 * The talk short's cutouts (public/images/pins-talk/), natural sizes from
 * credits.json, eye centres and radii in 0–1 of the image. Placeholder until
 * the photos are picked; filled in by hand from a gridded contact sheet.
 */
const IMG = "images/pins-talk/";
export const ASSETS: Record<string, Asset> & { elephantMouth: [number, number] } = {
  elephant: { src: IMG + "elephant.png", w: 1000, h: 800, eyes: [] },
  honeyguide: { src: IMG + "honeyguide.png", w: 1000, h: 700, eyes: [] },
  beehive: { src: IMG + "beehive.png", w: 1000, h: 1000 },
  honeycomb: { src: IMG + "honeycomb.png", w: 1000, h: 800 },
  beluga: { src: IMG + "beluga.png", w: 1000, h: 500, eyes: [] },
  /** world point of Koshik's mouth when drawn at x 540, y 1060, w 1040 (for the close-up) */
  elephantMouth: [540, 1150],
} as never;
