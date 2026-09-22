import React from "react";
import { BoardThumb, ShadowThumb, type ThumbConfig } from "../guess/Thumbnail";
import { usePhotoArt } from "../guess/photoArt";
import { WILD_PHOTO_CREDITS } from "./wild";
import { wildSubject } from "./subject";

const config: ThumbConfig = {
  subject: wildSubject,
  noun: "WILD ANIMAL!",
  heroes: [
    { id: "tiger", x: 430, scale: 1.9 },
    { id: "giraffe", x: 960, scale: 1.6 },
    { id: "kangaroo", x: 1500, scale: 2.0 },
  ],
  boardLine: "CAN YOU NAME ALL 12?",
};

export const WildThumbA: React.FC = () => {
  usePhotoArt("wild", WILD_PHOTO_CREDITS);
  return <ShadowThumb config={config} />;
};
export const WildThumbB: React.FC = () => {
  usePhotoArt("wild", WILD_PHOTO_CREDITS);
  return <BoardThumb config={config} />;
};
