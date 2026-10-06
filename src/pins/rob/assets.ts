import { Asset } from "../engine";
import SIZES from "../../../public/images/pins-rob-ai/sizes.json";

/**
 * The robbers short's cutouts: AI-generated for the channel (FLUX.1 [schnell]
 * on Runware, prompts in images.json, cut out by scripts/gen-images.py). Eye
 * centres and radii in 0–1 of the image, read off a gridded crop.
 */
const IMG = "images/pins-rob-ai/";
const S = SIZES as Record<string, number[]>;
const a = (id: string, eyes: Asset["eyes"] = []): Asset => ({ src: IMG + id + ".png", w: S[id][0], h: S[id][1], eyes });

export const ASSETS = {
  gull: a("gull", [{ x: 0.388, y: 0.064, r: 0.045 }]),
  gullFly: a("gull-fly", [{ x: 0.492, y: 0.217, r: 0.014 }, { x: 0.519, y: 0.217, r: 0.014 }]),
  kea: a("kea", [{ x: 0.164, y: 0.07, r: 0.036 }]),
  keaTug: a("kea-tug", [{ x: 0.446, y: 0.194, r: 0.028 }, { x: 0.544, y: 0.2, r: 0.013 }]),
  monkey: a("monkey", [{ x: 0.661, y: 0.116, r: 0.03 }, { x: 0.745, y: 0.128, r: 0.03 }]),
  /** wearing the stolen sunglasses: the shades are the joke, so no cartoon eyes */
  monkeyGlasses: a("monkey-glasses"),
  chips: a("chips"),
  backpack: a("backpack"),
  car: a("car"),
  fruit: a("fruit"),
};

export const BG = {
  beach: IMG + "bg-beach.jpg",
  carpark: IMG + "bg-carpark.jpg",
  playground: IMG + "bg-playground.jpg",
  temple: IMG + "bg-temple.jpg",
  templePath: IMG + "bg-temple-path.jpg",
  carClose: IMG + "bg-car-close.jpg",
};
