import React from "react";
import { AbsoluteFill } from "remotion";
import { loadAkkiFonts } from "../common";

/** placeholder: the original-cast design sheet */
export const Kit3ArtSheet: React.FC = () => {
  loadAkkiFonts();
  return <AbsoluteFill style={{ backgroundColor: "#222" }} />;
};
