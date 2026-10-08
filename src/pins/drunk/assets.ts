import { Asset } from "../engine";
import SIZES from "../../../public/images/pins-drunk-ai/sizes.json";

/**
 * The drunk short's cutouts: AI-generated for the channel (FLUX.1 [schnell] on
 * Runware, prompts in images.json). Eye centres and radii in 0–1 of the image,
 * read off gridded crops. moose-stuck is a full scene (not a cutout) with eyes.
 */
const IMG = "images/pins-drunk-ai/";
const S = SIZES as Record<string, number[]>;
const a = (id: string, eyes: Asset["eyes"] = [], ext = "png"): Asset => ({ src: IMG + id + "." + ext, w: S[id][0], h: S[id][1], eyes });

export const ASSETS = {
  chimp: a("chimp", [{ x: 0.195, y: 0.171, r: 0.03 }, { x: 0.329, y: 0.153, r: 0.03 }]),
  chimpDrink: a("chimp-drink", [{ x: 0.425, y: 0.184, r: 0.03 }, { x: 0.581, y: 0.178, r: 0.03 }]),
  chimpSleep: a("chimp-sleep", [{ x: 0.648, y: 0.16, r: 0.024, rot: 55 }, { x: 0.684, y: 0.27, r: 0.024, rot: 55 }]),
  jug: a("jug"),
  moose: a("moose", [{ x: 0.761, y: 0.373, r: 0.025 }]),
  mooseStuck: a("moose-stuck", [{ x: 0.482, y: 0.307, r: 0.025 }, { x: 0.639, y: 0.291, r: 0.025 }], "jpg"),
  apples: a("apples"),
  waxwing: a("waxwing", [{ x: 0.209, y: 0.215, r: 0.03 }]),
  waxwingDizzy: a("waxwing-dizzy", [{ x: 0.106, y: 0.753, r: 0.035 }]),
  berries: a("berries"),
  cage: a("cage"),
};

export const BG = {
  jungle: IMG + "bg-jungle.jpg",
  orchard: IMG + "bg-orchard.jpg",
  snow: IMG + "bg-snowtown.jpg",
};
