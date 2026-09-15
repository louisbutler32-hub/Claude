import { continueRender, delayRender, staticFile } from "remotion";

/**
 * The caption is set in Selawik, Microsoft's open (OFL) metric-compatible
 * stand-in for Segoe UI — which is what the original's caption is set in.
 * The wall sign uses Comic Relief, already in public/fonts.
 */
let started = false;

export const loadMinecraftFonts = () => {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("loading minecraft fonts");
  const faces: FontFace[] = [
    new FontFace(
      "Selawik",
      `url(${staticFile("fonts/Selawik-Regular.ttf")}) format("truetype")`,
      { weight: "400" }
    ),
    new FontFace(
      "ComicRelief",
      `url(${staticFile("fonts/ComicRelief.ttf")}) format("truetype")`,
      { weight: "400" }
    ),
  ];
  Promise.all(
    faces.map((f) => f.load().then((loaded) => document.fonts.add(loaded)))
  )
    .then(() => continueRender(handle))
    .catch(() => continueRender(handle));
};
