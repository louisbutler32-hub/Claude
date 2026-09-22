import React from "react";
import { usePhotoArt } from "../guess/photoArt";
import { durationFor, GuessVideo } from "../guess/GuessVideo";
import { DINO_PHOTO_CREDITS } from "./dinosaurs";
import { dinoSubject } from "./subject";

/** "Chomp Chomp DINOSAURS" — the dinosaur episode of the guess format. */
export const DinoVideo: React.FC = () => {
  usePhotoArt("dinosaurs", DINO_PHOTO_CREDITS);
  return <GuessVideo subject={dinoSubject} audio="audio/dinosaurs-mix.mp3" />;
};

export const DINO_DURATION_IN_FRAMES = durationFor(dinoSubject);
