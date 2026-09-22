import React from "react";
import { durationFor, GuessVideo } from "../guess/GuessVideo";
import { usePhotoArt } from "../guess/photoArt";
import { WILD_PHOTO_CREDITS } from "./wild";
import { wildSubject } from "./subject";

/** "Chomp Chomp WILD ANIMALS" — the second animal episode. */
export const WildVideo: React.FC = () => {
  usePhotoArt("wild", WILD_PHOTO_CREDITS);
  return <GuessVideo subject={wildSubject} audio="audio/wild-mix.mp3" />;
};

export const WILD_DURATION_IN_FRAMES = durationFor(wildSubject);
