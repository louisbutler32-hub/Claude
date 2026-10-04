import React from "react";
import { AbsoluteFill } from "remotion";
import { loadAkkiFonts } from "../../common";

export const ACT4_FRAMES = 1680; // 70.0s at 24fps

export const Act4: React.FC<{ audio?: string | null }> = () => {
  loadAkkiFonts();
  return <AbsoluteFill style={{ backgroundColor: "#222" }} />;
};

export const Act4Thumb: React.FC = () => <Act4 />;
