import React from "react";
import { durationFor, GuessVideo } from "../guess/GuessVideo";
import { animalSubject } from "./subject";

/** "Chomp Chomp ANIMALS" — the animal episode of the guess format. */
export const AnimalVideo: React.FC = () => (
  <GuessVideo subject={animalSubject} audio="audio/animals-mix.mp3" />
);

export const ANIMAL_DURATION_IN_FRAMES = durationFor(animalSubject);
