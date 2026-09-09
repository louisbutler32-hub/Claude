import { continueRender, delayRender, staticFile } from "remotion";

/**
 * The two rounded faces the video is set in, loaded straight from
 * `public/fonts` so a render never has to reach the network.
 */
let started = false;

export const loadVeggieFonts = () => {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("loading veggie fonts");
  const faces: FontFace[] = [
    new FontFace(
      "Fredoka",
      `url(${staticFile("fonts/Fredoka-SemiBold.ttf")}) format("truetype")`,
      { weight: "600" }
    ),
    new FontFace(
      "Fredoka",
      `url(${staticFile("fonts/Fredoka-Medium.ttf")}) format("truetype")`,
      { weight: "500" }
    ),
    new FontFace(
      "Baloo2",
      `url(${staticFile("fonts/Baloo2-ExtraBold.ttf")}) format("truetype")`,
      { weight: "800" }
    ),
  ];
  Promise.all(
    faces.map((f) => f.load().then((loaded) => document.fonts.add(loaded)))
  )
    .then(() => continueRender(handle))
    .catch(() => continueRender(handle));
};
