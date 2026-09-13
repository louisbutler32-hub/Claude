import React from "react";
import { durationFor, GuessVideo } from "../guess/GuessVideo";
import { seaSubject } from "./subject";

/** "Chomp Chomp SEA LIFE" — the sea-creature episode of the guess format. */
export const SeaVideo: React.FC = () => (
  <GuessVideo subject={seaSubject} audio="audio/sea-mix.mp3" />
);

export const SEA_DURATION_IN_FRAMES = durationFor(seaSubject);
