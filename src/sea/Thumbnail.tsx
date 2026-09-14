import React from "react";
import { BoardThumb, ShadowThumb, type ThumbConfig } from "../guess/Thumbnail";
import { seaSubject } from "./subject";

const config: ThumbConfig = {
  subject: seaSubject,
  noun: "SEA LIFE!",
  heroes: [
    { id: "octopus", x: 430, scale: 2.0 },
    { id: "crab", x: 960, scale: 2.1 },
    { id: "shark", x: 1500, scale: 2.0 },
  ],
  boardLine: "CAN YOU NAME ALL 12?",
};

export const SeaThumbA: React.FC = () => <ShadowThumb config={config} />;
export const SeaThumbB: React.FC = () => <BoardThumb config={config} />;
