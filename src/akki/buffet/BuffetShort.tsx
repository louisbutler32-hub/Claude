import React from "react";
import { AbsoluteFill } from "remotion";
import { loadAkkiFonts } from "../common";

export const BUFFET_FRAMES = 384; // 16.0s at 24fps

export const BuffetShort: React.FC<{ audio?: string | null }> = () => {
  loadAkkiFonts();
  return <AbsoluteFill style={{ backgroundColor: "#222" }} />;
};

export const BuffetThumb: React.FC = () => <BuffetShort />;
