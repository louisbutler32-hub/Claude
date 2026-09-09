import React from "react";
import { durationFor, GuessVideo } from "../guess/GuessVideo";
import { numberSubject } from "./subject";

/** "Chomp Chomp NUMBERS" — the counting episode of the guess format. */
export const NumberVideo: React.FC = () => (
  <GuessVideo subject={numberSubject} audio="audio/numbers-mix.mp3" />
);

export const NUMBER_DURATION_IN_FRAMES = durationFor(numberSubject);
