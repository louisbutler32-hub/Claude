import { Asset } from "../engine";
import SIZES from "../../../public/images/pins-tools-ai/sizes.json";
import { ASSETS as FACES } from "../faces/assets";
import { ASSETS as DRUNK } from "../drunk/assets";
import { ASSETS as FOREVER } from "../forever/assets";

/**
 * The tools short's cutouts: AI-generated for the channel (FLUX.1 [schnell] on
 * Runware, prompts in images.json), plus the crow (faces), the chimp (drunk)
 * and the shark (forever) reused from earlier shorts.
 */
const IMG = "images/pins-tools-ai/";
const S = SIZES as Record<string, number[]>;
const a = (id: string, eyes: Asset["eyes"] = []): Asset => ({ src: IMG + id + ".png", w: S[id][0], h: S[id][1], eyes });

export const ASSETS = {
  octopus: a("octopus", [{ x: 0.49, y: 0.173, r: 0.045 }]),
  shells: a("shells"),
  chimpFish: a("chimp-fish", [{ x: 0.388, y: 0.205, r: 0.035 }, { x: 0.61, y: 0.205, r: 0.035 }]),
  twig: a("twig"),
  crow: FACES.crow,
  chimp: DRUNK.chimp,
  shark: FOREVER.sharkHead,
};

export const BG = {
  sea: IMG + "bg-seafloor.jpg",
  lab: IMG + "bg-lab.jpg",
  gombe: IMG + "bg-gombe.jpg",
};
