import React from "react";
import { AbsoluteFill } from "remotion";
import { loadAkkiFonts } from "../../common";

export const ACT3_FRAMES = 864; // 36.0s at 24fps

export const Act3: React.FC<{ audio?: string | null }> = () => {
  loadAkkiFonts();
  return <AbsoluteFill style={{ backgroundColor: "#222" }} />;
};

export const Act3Thumb: React.FC = () => <Act3 />;
