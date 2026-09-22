import React from "react";
import { ANIMAL_PHOTO_CREDITS } from "./animals";
import { durationFor, GuessVideo } from "../guess/GuessVideo";
import { usePhotoArt } from "../guess/photoArt";
import { animalSubject } from "./subject";

/** "Chomp Chomp ANIMALS" — the animal episode of the guess format. */
export const AnimalVideo: React.FC = () => {
  usePhotoArt("animals", ANIMAL_PHOTO_CREDITS);
  return <GuessVideo subject={animalSubject} audio="audio/animals-mix.mp3" />;
};

export const ANIMAL_DURATION_IN_FRAMES = durationFor(animalSubject);
