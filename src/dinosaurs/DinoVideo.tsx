import React from "react";
import { durationFor, GuessVideo } from "../guess/GuessVideo";
import { dinoSubject } from "./subject";

/** "Chomp Chomp DINOSAURS" — the dinosaur episode of the guess format. */
export const DinoVideo: React.FC = () => (
  <GuessVideo subject={dinoSubject} audio="audio/dinosaurs-mix.mp3" />
);

export const DINO_DURATION_IN_FRAMES = durationFor(dinoSubject);
