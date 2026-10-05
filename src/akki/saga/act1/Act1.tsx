import React from "react";
import { AbsoluteFill } from "remotion";
import { loadAkkiFonts } from "../../common";

export const ACT1_FRAMES = 1680; // 70.0s at 24fps

export const Act1: React.FC<{ audio?: string | null }> = () => {
  loadAkkiFonts();
  return <AbsoluteFill style={{ backgroundColor: "#222" }} />;
};

export const Act1Thumb: React.FC = () => <Act1 />;
