import React from "react";
import { AbsoluteFill } from "remotion";
import { loadAkkiFonts } from "../../common";

export const ACT2_FRAMES = 1680; // 70.0s at 24fps

export const Act2: React.FC<{ audio?: string | null }> = () => {
  loadAkkiFonts();
  return <AbsoluteFill style={{ backgroundColor: "#222" }} />;
};

export const Act2Thumb: React.FC = () => <Act2 />;
