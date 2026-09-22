import React from "react";
import { photoArt, type PhotoCredit } from "../guess/photoArt";
import type { GuessArt } from "../guess/types";
import wildPhotoCredits from "../../public/images/wild/credits.json";

/**
 * The twelve Wild Animals — a second animals episode, this time zoo and
 * safari animals rather than the farm-and-pond cast of the first one.
 *
 * Unlike Animals or Dinosaurs, there is no hand-drawn cast to preserve here
 * — nothing else in the channel reuses these twelve — so this episode is
 * real photo cutouts from the start. See scripts/fetch-photo-cutouts.py for
 * how they were sourced and licensed.
 */

export const WILD_PHOTO_CREDITS: PhotoCredit[] = wildPhotoCredits;
export const WILD_PHOTO_ART: Record<string, GuessArt> = photoArt(
  "wild",
  WILD_PHOTO_CREDITS
);

/** No vector art here, so nothing to define — kept only because every
 *  subject needs a Defs component (TitleCard, Board, GuessVideo all mount
 *  one unconditionally). */
export const WildDefs: React.FC = () => null;

export const WILD_NAME: Record<string, string> = {
  zebra: "Zebra",
  giraffe: "Giraffe",
  tiger: "Tiger",
  bear: "Bear",
  monkey: "Monkey",
  kangaroo: "Kangaroo",
  panda: "Panda",
  koala: "Koala",
  fox: "Fox",
  camel: "Camel",
  hedgehog: "Hedgehog",
  peacock: "Peacock",
};

/** The sound beat — what each one says (or does) when it's found. */
export const WILD_SOUND: Record<string, string> = {
  zebra: "Neigh neigh!",
  giraffe: "Munch munch!",
  tiger: "ROAR!",
  bear: "Grrrowl!",
  monkey: "Ooh ooh ah ah!",
  kangaroo: "Boing boing!",
  panda: "Crunch crunch!",
  koala: "Snooze snooze!",
  fox: "Yip yip!",
  camel: "Grunt grunt!",
  hedgehog: "Snuffle snuffle!",
  peacock: "Squawk!",
};
