import React from "react";
import { BoardThumb, ShadowThumb, type ThumbConfig } from "../guess/Thumbnail";
import { veggieSubject } from "./subject";

const config: ThumbConfig = {
  subject: veggieSubject,
  noun: "VEGGIE!",
  heroes: [
    { id: "carrot", x: 430, scale: 2.35 },
    { id: "broccoli", x: 960, scale: 2.5 },
    { id: "tomato", x: 1490, scale: 2.5 },
  ],
  boardLine: "CAN YOU NAME ALL 12?",
};

export const ThumbnailA: React.FC = () => <ShadowThumb config={config} />;
export const ThumbnailB: React.FC = () => <BoardThumb config={config} />;
