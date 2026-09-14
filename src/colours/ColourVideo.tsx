import React from "react";
import { durationFor, GuessVideo } from "../guess/GuessVideo";
import { colourSubject } from "./subject";

/** "Chomp Chomp COLOURS" — the colour episode. No shadow beat: a colour
 *  cannot be guessed from a black shape, so the hero is visible in full
 *  colour from the moment it rises, and the "reveal" is the colour word
 *  itself, reinforced by two same-coloured cast members from elsewhere on
 *  the channel. */
export const ColourVideo: React.FC = () => (
  <GuessVideo subject={colourSubject} audio="audio/colours-mix.mp3" />
);

export const COLOUR_DURATION_IN_FRAMES = durationFor(colourSubject);
