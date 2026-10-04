import React from "react";
import { AbsoluteFill } from "remotion";
import { loadAkkiFonts } from "../common";

export const DEBT_FRAMES = 360; // 15.0s at 24fps

export const DebtShort: React.FC<{ audio?: string | null }> = () => {
  loadAkkiFonts();
  return <AbsoluteFill style={{ backgroundColor: "#222" }} />;
};

export const DebtThumb: React.FC = () => <DebtShort />;
