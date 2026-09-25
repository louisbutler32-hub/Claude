import { continueRender, delayRender, staticFile } from "remotion";

/** Montserrat (variable) for the "Find 10 …" title — heavy, geometric, reads
 *  over a busy scene. Loaded from `public/fonts` so renders stay offline. */
let started = false;

export const loadFindFonts = () => {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("loading find fonts");
  const face = new FontFace(
    "Montserrat",
    `url(${staticFile("fonts/Montserrat-Variable.ttf")}) format("truetype")`,
    { weight: "100 900" }
  );
  face
    .load()
    .then((loaded) => document.fonts.add(loaded))
    .then(() => continueRender(handle))
    .catch(() => continueRender(handle));
};
