import { Asset } from "../engine";
import SIZES from "../../../public/images/pins-forever-ai/sizes.json";

/**
 * The "live forever" short's cutouts: AI-generated for the channel (FLUX.1
 * [schnell] on Runware, prompts in images.json). Eye centres and radii in 0–1
 * of the image, read off gridded crops; the jellyfish and the polyp get eyes
 * where a face would go, and the Reaper's glow in his hood.
 */
const IMG = "images/pins-forever-ai/";
const S = SIZES as Record<string, number[]>;
const a = (id: string, eyes: Asset["eyes"] = []): Asset => ({ src: IMG + id + ".png", w: S[id][0], h: S[id][1], eyes });

export const ASSETS = {
  jelly: a("jellyfish", [{ x: 0.42, y: 0.5, r: 0.065 }, { x: 0.62, y: 0.5, r: 0.065 }]),
  polyp: a("polyp", [{ x: 0.45, y: 0.8, r: 0.04 }, { x: 0.58, y: 0.8, r: 0.04 }]),
  shark: a("shark", [{ x: 0.218, y: 0.495, r: 0.03 }]),
  sharkHead: a("shark-head", [{ x: 0.3, y: 0.524, r: 0.032 }, { x: 0.686, y: 0.524, r: 0.032 }]),
  tortoise: a("tortoise", [{ x: 0.941, y: 0.607, r: 0.026 }]),
  tortoiseFace: a("tortoise-face", [{ x: 0.142, y: 0.6, r: 0.065 }, { x: 0.836, y: 0.6, r: 0.065 }]),
  reaper: a("reaper", [{ x: 0.493, y: 0.127, r: 0.026 }, { x: 0.563, y: 0.127, r: 0.026 }]),
  cake: a("cake"),
  camera: a("camera"),
  finger: a("finger"),
};

export const BG = {
  arctic: IMG + "bg-arctic.jpg",
  island: IMG + "bg-island.jpg",
  deep: "images/pins-sleep-ai/bg-deep.jpg",
};
