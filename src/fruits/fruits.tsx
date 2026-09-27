import React from "react";
import { photoArt, type PhotoCredit } from "../guess/photoArt";
import type { GuessArt } from "../guess/types";
import fruitPhotoCredits from "../../public/images/fruits/credits.json";

/**
 * The twelve Fruits — real photo cutouts from the start, same pattern as
 * Wild Animals: nothing else in the channel reuses this cast, so there's
 * no hand-drawn registry to keep around. See
 * scripts/fetch-photo-cutouts.py for how they were sourced and licensed.
 */

export const FRUIT_PHOTO_CREDITS: PhotoCredit[] = fruitPhotoCredits;
export const FRUIT_PHOTO_ART: Record<string, GuessArt> = photoArt(
  "fruits",
  FRUIT_PHOTO_CREDITS
);

/** No vector art here, so nothing to define — kept only because every
 *  subject needs a Defs component. */
export const FruitDefs: React.FC = () => null;

export const FRUIT_NAME: Record<string, string> = {
  apple: "Apple",
  banana: "Banana",
  orange: "Orange",
  strawberry: "Strawberry",
  grape: "Grapes",
  watermelon: "Watermelon",
  pineapple: "Pineapple",
  kiwi: "Kiwi",
  mango: "Mango",
  cherry: "Cherries",
  peach: "Peach",
  pear: "Pear",
};
