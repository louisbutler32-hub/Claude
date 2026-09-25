import React from "react";
import { BoardThumb, ShadowThumb, type ThumbConfig } from "../guess/Thumbnail";
import { fruitSubject } from "./subject";

const config: ThumbConfig = {
  subject: fruitSubject,
  noun: "FRUIT!",
  heroes: [
    { id: "strawberry", x: 560, scale: 2.3 },
    { id: "pineapple", x: 1020, scale: 2.4 },
    { id: "banana", x: 1500, scale: 2.4 },
  ],
  boardLine: "CAN YOU NAME ALL 12?",
};

export const FruitThumbA: React.FC = () => <ShadowThumb config={config} />;
export const FruitThumbB: React.FC = () => <BoardThumb config={config} />;
