import { Asset } from "../engine";
import SIZES from "../../../public/images/pins-sleep-ai/sizes.json";

/**
 * The sleep short's cutouts: AI-generated for the channel (FLUX.1 [schnell] on
 * Runware, prompts in images.json, cut out by scripts/gen-images.py), plus the
 * one real photo kept: the flying frigatebird (the generated one came out a
 * stork). Eye centres and radii in 0–1 of the image, read off a gridded crop;
 * `rot` lays the lids along a tilted head.
 */
const IMG = "images/pins-sleep-ai/";
const S = SIZES as Record<string, number[]>;
const a = (id: string, eyes: Asset["eyes"] = []): Asset => ({ src: IMG + id + ".png", w: S[id][0], h: S[id][1], eyes });

export const ASSETS = {
  otter: a("otter", [{ x: 0.107, y: 0.533, r: 0.024, rot: 75 }]),
  otterKelp: a("otter-kelp", [{ x: 0.13, y: 0.185, r: 0.016, rot: -5 }, { x: 0.193, y: 0.178, r: 0.016, rot: -5 }]),
  hold: a("otters-hold", [
    { x: 0.457, y: 0.095, r: 0.015, rot: 55 }, { x: 0.499, y: 0.212, r: 0.015, rot: 55 },
    { x: 0.563, y: 0.182, r: 0.015, rot: -45 }, { x: 0.616, y: 0.061, r: 0.015, rot: -45 },
  ]),
  /** mom awake and watching, the pup asleep on her belly */
  pup: a("otter-pup", [{ x: 0.072, y: 0.103, r: 0.02, mood: "open" }, { x: 0.267, y: 0.586, r: 0.017, rot: -35, mood: "closed" }]),
  frigateHead: a("frigate-head", [{ x: 0.457, y: 0.072, r: 0.034 }]),
  whale: a("whale", [{ x: 0.319, y: 0.335, r: 0.03 }]),
  whaleBelly: a("whale-up"),
  boat: a("boat"),
  /** the real frigatebird photo (Kurayba, CC BY-SA 2.0) */
  frigate: { src: "images/pins-sleep/frigate.png", w: 578, h: 486, eyes: [{ x: 0.125, y: 0.345, r: 0.036 }, { x: 0.168, y: 0.326, r: 0.03 }] } as Asset,
};

/** a whale turned `rot` degrees, its lids counter-turned so they stay level */
export const whaleAt = (rot: number): Asset => ({ ...ASSETS.whale, eyes: ASSETS.whale.eyes!.map((e) => ({ ...e, rot: -rot })) });

export const BG = {
  sea: IMG + "bg-sea.jpg",
  kelp: IMG + "bg-kelp.jpg",
  sky: IMG + "bg-sky.jpg",
  openSea: IMG + "bg-open-sea.jpg",
  surface: IMG + "bg-surface.jpg",
  deep: IMG + "bg-deep.jpg",
};
