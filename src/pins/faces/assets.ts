import { Asset } from "../engine";
import SIZES from "../../../public/images/pins-faces-ai/sizes.json";

/**
 * The faces short's cutouts: AI-generated for the channel (FLUX.1 [schnell] on
 * Runware, prompts in images.json). Eye centres and radii in 0–1 of the image,
 * read off gridded crops.
 */
const IMG = "images/pins-faces-ai/";
const S = SIZES as Record<string, number[]>;
const a = (id: string, eyes: Asset["eyes"] = []): Asset => ({ src: IMG + id + ".png", w: S[id][0], h: S[id][1], eyes });

export const ASSETS = {
  crow: a("crow", [{ x: 0.577, y: 0.043, r: 0.04 }]),
  crowAngry: a("crow-angry", [{ x: 0.703, y: 0.149, r: 0.034 }]),
  chick: a("crow-chick", [{ x: 0.548, y: 0.154, r: 0.042 }]),
  mask: a("mask"),
  sheep: a("sheep", [{ x: 0.286, y: 0.169, r: 0.036 }, { x: 0.561, y: 0.169, r: 0.036 }]),
  sheepSide: a("sheep-side"),
  bee: a("bee", [{ x: 0.381, y: 0.182, r: 0.075 }, { x: 0.74, y: 0.182, r: 0.075 }]),
  beeFly: a("bee-fly", [{ x: 0.177, y: 0.49, r: 0.06 }]),
  frame: a("frame"),
};

export const BG = {
  campus: IMG + "bg-campus.jpg",
  field: IMG + "bg-field.jpg",
  flowers: IMG + "bg-flowers.jpg",
};
