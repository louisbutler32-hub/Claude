import { Asset } from "../engine";

/**
 * The talk short's cutouts (public/images/pins-talk/): natural sizes from
 * credits.json, eye centres and radii in 0–1 of the image, placed by hand off
 * gridded close-ups of each head.
 */
const IMG = "images/pins-talk/";

const elephant: Asset = { src: IMG + "elephant.png", w: 518, h: 615, eyes: [{ x: 0.75, y: 0.505, r: 0.042 }, { x: 0.9, y: 0.47, r: 0.034 }] };

export const ASSETS = {
  elephant,
  honeyguide: { src: IMG + "honeyguide.png", w: 467, h: 314, eyes: [{ x: 0.12, y: 0.09, r: 0.036 }, { x: 0.158, y: 0.075, r: 0.03 }] } as Asset,
  beluga: { src: IMG + "beluga.png", w: 885, h: 348, eyes: [{ x: 0.86, y: 0.36, r: 0.022 }, { x: 0.9, y: 0.33, r: 0.019 }] } as Asset,
  belugahead: { src: IMG + "belugahead.png", w: 536, h: 360, eyes: [{ x: 0.77, y: 0.555, r: 0.045 }, { x: 0.85, y: 0.5, r: 0.038 }] } as Asset,
  beehive: { src: IMG + "beehive.png", w: 900, h: 818 } as Asset,
  honeycomb: { src: IMG + "honeycomb.png", w: 897, h: 755 } as Asset,
  /** world point of Koshik's mouth when drawn at x 540, y 1060, w 1040 (the close-up aims here) */
  elephantMouth: [852, 1258] as [number, number],
};
