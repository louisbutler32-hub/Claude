import React from "react";
import { BoardThumb, ShadowThumb, type ThumbConfig } from "../guess/Thumbnail";
import { usePhotoArt } from "../guess/photoArt";
import { FRUIT_PHOTO_CREDITS } from "./fruits";
import { fruitSubject } from "./subject";

const config: ThumbConfig = {
  subject: fruitSubject,
  noun: "FRUIT!",
  heroes: [
    { id: "watermelon", x: 430, scale: 1.9 },
    { id: "pineapple", x: 960, scale: 1.9 },
    { id: "strawberry", x: 1500, scale: 2.1 },
  ],
  boardLine: "CAN YOU NAME ALL 12?",
};

export const FruitThumbA: React.FC = () => {
  usePhotoArt("fruits", FRUIT_PHOTO_CREDITS);
  return <ShadowThumb config={config} />;
};
export const FruitThumbB: React.FC = () => {
  usePhotoArt("fruits", FRUIT_PHOTO_CREDITS);
  return <BoardThumb config={config} />;
};
