import React from "react";
import { AbsoluteFill } from "remotion";
import { loadAkkiFonts } from "../common";

/** placeholder: the kit-v2 art sheet (all characters, poses, expressions on a plate) */
export const Kit2ArtSheet: React.FC = () => {
  loadAkkiFonts();
  return <AbsoluteFill style={{ backgroundColor: "#222" }} />;
};
