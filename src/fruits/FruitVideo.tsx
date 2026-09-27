import React from "react";
import { durationFor, GuessVideo } from "../guess/GuessVideo";
import { usePhotoArt } from "../guess/photoArt";
import { FRUIT_PHOTO_CREDITS } from "./fruits";
import { fruitSubject } from "./subject";

/** "Fruits" — no title card, straight into round 1 (see noTitleCard on
 *  fruitSubject). */
export const FruitVideo: React.FC = () => {
  usePhotoArt("fruits", FRUIT_PHOTO_CREDITS);
  return <GuessVideo subject={fruitSubject} audio="audio/fruits-mix.mp3" />;
};

export const FRUIT_DURATION_IN_FRAMES = durationFor(fruitSubject);
