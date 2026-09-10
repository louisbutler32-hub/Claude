import React from "react";
import { BoardThumb, ShadowThumb, type ThumbConfig } from "../guess/Thumbnail";
import { animalSubject } from "./subject";

const config: ThumbConfig = {
  subject: animalSubject,
  noun: "ANIMAL!",
  heroes: [
    { id: "cow", x: 430, scale: 2.4 },
    { id: "duck", x: 960, scale: 1.95 },
    { id: "elephant", x: 1500, scale: 2.2 },
  ],
  boardLine: "CAN YOU NAME ALL 12?",
};

export const AnimalThumbA: React.FC = () => <ShadowThumb config={config} />;
export const AnimalThumbB: React.FC = () => <BoardThumb config={config} />;
