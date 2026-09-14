import React from "react";
import { BoardThumb, ShadowThumb, type ThumbConfig } from "../guess/Thumbnail";
import { dinoSubject } from "./subject";

const config: ThumbConfig = {
  subject: dinoSubject,
  noun: "DINOSAUR!",
  heroes: [
    { id: "trex", x: 430, scale: 1.9 },
    { id: "triceratops", x: 960, scale: 2.0 },
    { id: "stegosaurus", x: 1500, scale: 2.0 },
  ],
  boardLine: "CAN YOU NAME ALL 12?",
};

export const DinoThumbA: React.FC = () => <ShadowThumb config={config} />;
export const DinoThumbB: React.FC = () => <BoardThumb config={config} />;
