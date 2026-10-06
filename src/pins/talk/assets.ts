import { Asset } from "../engine";
import SIZES from "../../../public/images/pins-talk-ai/sizes.json";

/**
 * The talk short's cutouts: AI-generated for the channel (FLUX.1 [schnell] on
 * Runware, prompts in images.json, cut out by scripts/gen-images.py). Eye
 * centres and radii in 0–1 of the image, placed off a gridded sheet.
 */
const IMG = "images/pins-talk-ai/";
const S = SIZES as Record<string, number[]>;
const a = (id: string, eyes: Asset["eyes"] = []): Asset => ({ src: IMG + id + ".png", w: S[id][0], h: S[id][1], eyes });

export const ASSETS = {
  elephant: a("elephant", [{ x: 0.41, y: 0.265, r: 0.05 }, { x: 0.8, y: 0.265, r: 0.046 }]),
  elephantTrunk: a("elephant-trunk", [{ x: 0.376, y: 0.357, r: 0.05 }]),
  elephantSad: a("elephant-sad", [{ x: 0.42, y: 0.196, r: 0.05 }]),
  honeyguide: a("honeyguide", [{ x: 0.75, y: 0.086, r: 0.04 }, { x: 0.69, y: 0.075, r: 0.032 }]),
  honeyguideFly: a("honeyguide-fly", [{ x: 0.766, y: 0.482, r: 0.034 }]),
  beluga: a("beluga", [{ x: 0.827, y: 0.28, r: 0.02 }, { x: 0.865, y: 0.24, r: 0.017 }]),
  belugaUp: a("beluga-up", [{ x: 0.21, y: 0.236, r: 0.05 }, { x: 0.717, y: 0.236, r: 0.05 }]),
  honeycomb: a("honeycomb"),
};

export const BG = {
  zoo: IMG + "bg-zoo.jpg",
  zooDusk: IMG + "bg-zoo-dusk.jpg",
  village: IMG + "bg-village.jpg",
  hiveTree: IMG + "bg-hive-tree.jpg",
  deep: IMG + "bg-deep.jpg",
  bay: IMG + "bg-bay.jpg",
};
