import React from "react";
import { durationFor, GuessVideo } from "../guess/GuessVideo";
import { veggieSubject } from "./subject";

/** "Chomp Chomp VEGGIES" — the vegetable episode of the guess format. */
export const VeggieVideo: React.FC = () => (
  <GuessVideo subject={veggieSubject} audio="audio/veggies-mix.mp3" />
);

export const VEGGIE_DURATION_IN_FRAMES = durationFor(veggieSubject);
