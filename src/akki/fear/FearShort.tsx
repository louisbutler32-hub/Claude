import React from "react";
import { AbsoluteFill } from "remotion";
import { loadAkkiFonts } from "../common";

export const FEAR_FRAMES = 288; // 12.0s at 24fps

export const FearShort: React.FC<{ audio?: string | null }> = () => {
  loadAkkiFonts();
  return <AbsoluteFill style={{ backgroundColor: "#222" }} />;
};

export const FearThumb: React.FC = () => <FearShort />;
