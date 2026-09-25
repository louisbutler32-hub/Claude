import React from "react";
import { durationFor, GuessVideo } from "../guess/GuessVideo";
import { fruitSubject } from "./subject";

/**
 * "Peekaboo Pebblo — FRUIT": the fruit episode, on the channel's own cast.
 * `audio` is the drop-in slot under public/audio; pass null to render
 * silent (e.g. `--props='{"audio":null}'` before the mix exists).
 */
export const FruitVideo: React.FC<{ audio?: string | null }> = ({
  audio = "audio/fruit-mix.mp3",
}) => <GuessVideo subject={fruitSubject} audio={audio ?? undefined} />;

export const FRUIT_DURATION_IN_FRAMES = durationFor(fruitSubject);
