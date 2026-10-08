import { Asset } from "../engine";
import SIZES from "../../../public/images/pins-space-ai/sizes.json";

/**
 * The space short's images: AI-generated for the channel (FLUX.1 [schnell] on
 * Runware, prompts in images.json).
 */
const IMG = "images/pins-space-ai/";
const S = SIZES as Record<string, number[]>;
const a = (id: string, eyes: Asset["eyes"] = []): Asset => ({ src: IMG + id + ".png", w: S[id][0], h: S[id][1], eyes });

export const ASSETS = {
  fly: a("fly", [{ x: 0.113, y: 0.462, r: 0.06 }]),
  rocket: a("rocket"),
  laika: a("laika", [{ x: 0.428, y: 0.204, r: 0.05 }, { x: 0.751, y: 0.188, r: 0.05 }]),
  sputnik: a("sputnik"),
  ham: a("ham", [{ x: 0.398, y: 0.218, r: 0.04 }, { x: 0.607, y: 0.218, r: 0.04 }]),
  capsule: a("capsule"),
  apple: a("apple"),
  astronaut: a("astronaut"),
};

export const BG = {
  desert: IMG + "bg-desert.jpg",
  space: IMG + "bg-space.jpg",
  moscow: IMG + "bg-moscow.jpg",
  ocean: IMG + "bg-ocean.jpg",
  control: IMG + "bg-control.jpg",
};
