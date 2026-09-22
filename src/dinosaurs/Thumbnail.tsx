import React from "react";
import { BoardThumb, ShadowThumb, type ThumbConfig } from "../guess/Thumbnail";
import { usePhotoArt } from "../guess/photoArt";
import { DINO_PHOTO_CREDITS } from "./dinosaurs";
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

export const DinoThumbA: React.FC = () => {
  usePhotoArt("dinosaurs", DINO_PHOTO_CREDITS);
  return <ShadowThumb config={config} />;
};
export const DinoThumbB: React.FC = () => {
  usePhotoArt("dinosaurs", DINO_PHOTO_CREDITS);
  return <BoardThumb config={config} />;
};
