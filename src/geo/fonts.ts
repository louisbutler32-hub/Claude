import { continueRender, delayRender, staticFile } from "remotion";

/**
 * The three faces the geo shorts are set in, loaded from `public/fonts` so a
 * render never touches the network. All three are variable fonts under the
 * SIL Open Font License.
 *
 *   Montserrat  country names, big years, the slam — the geometric bold
 *   Roboto      captions and small chips — the plain grotesque
 *   Cinzel      money and tonnage callouts — the engraved serif
 */
let started = false;

export const FONT_SANS = "Montserrat, 'Segoe UI', sans-serif";
export const FONT_CAPTION = "Roboto, 'Segoe UI', sans-serif";
export const FONT_SERIF = "Cinzel, 'Times New Roman', serif";

export const useGeoFonts = () => {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("loading geo fonts");
  const faces: FontFace[] = [
    new FontFace("Montserrat", `url(${staticFile("fonts/Montserrat-Variable.ttf")}) format("truetype")`, {
      weight: "100 900",
    }),
    new FontFace("Roboto", `url(${staticFile("fonts/Roboto-Variable.ttf")}) format("truetype")`, {
      weight: "100 900",
    }),
    new FontFace("Cinzel", `url(${staticFile("fonts/Cinzel-Variable.ttf")}) format("truetype")`, {
      weight: "400 900",
    }),
  ];
  Promise.all(faces.map((f) => f.load().then((loaded) => document.fonts.add(loaded))))
    .then(() => continueRender(handle))
    .catch(() => continueRender(handle));
};
