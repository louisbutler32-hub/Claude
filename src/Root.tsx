import React from "react";
import { Composition } from "remotion";
import { BountyVideo, TOTAL_DURATION_IN_FRAMES } from "./BountyVideo";
import { WhatIfVideo } from "./whatif/WhatIfVideo";
import { WHATIF_DURATION_IN_FRAMES } from "./whatif/shots";
import { AdmiralsVideo, ADMIRALS_DURATION_IN_FRAMES } from "./admirals/AdmiralsVideo";
import { SfxCueReview } from "./admirals/SfxCueReview";
import {
  KateOverlay,
  KateOverlaySplit,
  KateOverlayVertical,
  KateScene,
  KateScenePinned,
  KateSceneVertical,
  KateSplitCards,
  KateSplitCardsVertical,
  LabelOverlay,
  LabelOverlayVertical,
  NameOverlay,
  NameOverlayVertical,
  TITLE_DURATION_IN_FRAMES,
} from "./titles/compositions";
import { WW2Europe, WW2_DURATION_IN_FRAMES } from "./maps/ww2";
import {
  VeggieVideo,
  VEGGIE_DURATION_IN_FRAMES,
} from "./veggies/VeggieVideo";
import { ArtSheet } from "./veggies/ArtSheet";
import { AnimalArtSheet } from "./animals/ArtSheet";
import { Banner, BannerGuides } from "./guess/Banner";
import { AnimalThumbA, AnimalThumbB } from "./animals/Thumbnail";
import { NumberThumbA, NumberThumbB } from "./numbers/Thumbnail";
import {
  CountingShort,
  SHORT_FRAMES,
  ShortThumbnail,
} from "./numbers/CountingShort";
import {
  NumberVideo,
  NUMBER_DURATION_IN_FRAMES,
} from "./numbers/NumberVideo";
import {
  AnimalVideo,
  ANIMAL_DURATION_IN_FRAMES,
} from "./animals/AnimalVideo";
import { PlanetsVideo, PLANETS_DURATION_SECONDS } from "./planets/PlanetsVideo";
import { ThumbnailA, ThumbnailB } from "./planets/Thumbnail";
import {
  ThumbnailA as VeggieThumbnailA,
  ThumbnailB as VeggieThumbnailB,
} from "./veggies/Thumbnail";
import { FaceVideo, FACE_DURATION_SECONDS } from "./face/FaceVideo";
import { MummyVideo, MUMMY_DURATION_SECONDS } from "./mummy/MummyVideo";
import { MummyThumbA, MummyThumbB } from "./mummy/Thumbnail";
import { MongolsEurope, MONGOLS_DURATION_IN_FRAMES } from "./maps/mongols";
import { MansaMusa, MANSA_DURATION_IN_FRAMES } from "./maps/mansa";
import { Shelterbelt, SHELTERBELT_DURATION_IN_FRAMES } from "./maps/shelterbelt";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ── doodle science essays ── */}
      <Composition
        id="FaceVideo"
        component={FaceVideo}
        durationInFrames={FACE_DURATION_SECONDS * 30}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="MummyVideo"
        component={MummyVideo}
        durationInFrames={MUMMY_DURATION_SECONDS * 30}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="Mummy-Thumbnail"
        component={MummyThumbA}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Mummy-Thumbnail-Board"
        component={MummyThumbB}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="PlanetsVideo"
        component={PlanetsVideo}
        durationInFrames={PLANETS_DURATION_SECONDS * 30}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition id="Planets-ThumbA" component={ThumbnailA} durationInFrames={1} fps={30} width={1280} height={720} />
      <Composition id="Planets-ThumbB" component={ThumbnailB} durationInFrames={1} fps={30} width={1280} height={720} />

      {/* ── kids "guess the vegetable" video ── */}
      <Composition
        id="VeggieVideo"
        component={VeggieVideo}
        durationInFrames={VEGGIE_DURATION_IN_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Short-Thumbnail"
        component={ShortThumbnail}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Animal-Thumbnail"
        component={AnimalThumbA}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Animal-Thumbnail-Board"
        component={AnimalThumbB}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Number-Thumbnail"
        component={NumberThumbA}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Number-Thumbnail-Board"
        component={NumberThumbB}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Counting-Short"
        component={CountingShort}
        durationInFrames={SHORT_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Channel-Banner"
        component={Banner}
        durationInFrames={1}
        fps={30}
        width={2560}
        height={1440}
      />
      <Composition
        id="Channel-Banner-Guides"
        component={BannerGuides}
        durationInFrames={1}
        fps={30}
        width={2560}
        height={1440}
      />
      <Composition
        id="NumberVideo"
        component={NumberVideo}
        durationInFrames={NUMBER_DURATION_IN_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AnimalVideo"
        component={AnimalVideo}
        durationInFrames={ANIMAL_DURATION_IN_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Animal-ArtSheet"
        component={AnimalArtSheet}
        durationInFrames={30}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Veggie-Thumbnail"
        component={VeggieThumbnailA}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Veggie-Thumbnail-Board"
        component={VeggieThumbnailB}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Veggie-ArtSheet"
        component={ArtSheet}
        durationInFrames={30}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* ── animated historical maps ── */}
      <Composition
        id="Map-Shelterbelt"
        component={Shelterbelt}
        durationInFrames={SHELTERBELT_DURATION_IN_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Map-Mansa-Musa"
        component={MansaMusa}
        durationInFrames={MANSA_DURATION_IN_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Map-Mongols-Europe"
        component={MongolsEurope}
        durationInFrames={MONGOLS_DURATION_IN_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Map-WW2-Europe"
        component={WW2Europe}
        durationInFrames={WW2_DURATION_IN_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* ── 3D-perspective documentary titles ── */}
      <Composition
        id="Title-Kate"
        component={KateScene}
        durationInFrames={TITLE_DURATION_IN_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Title-Kate-Vertical"
        component={KateSceneVertical}
        durationInFrames={TITLE_DURATION_IN_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Title-Kate-Pinned"
        component={KateScenePinned}
        durationInFrames={TITLE_DURATION_IN_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Title-Kate-SplitCards"
        component={KateSplitCards}
        durationInFrames={TITLE_DURATION_IN_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Title-Kate-SplitCards-Vertical"
        component={KateSplitCardsVertical}
        durationInFrames={TITLE_DURATION_IN_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Title-Kate-Overlay"
        component={KateOverlay}
        durationInFrames={TITLE_DURATION_IN_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Title-Kate-Overlay-Vertical"
        component={KateOverlayVertical}
        durationInFrames={TITLE_DURATION_IN_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Title-Kate-Overlay-SplitCards"
        component={KateOverlaySplit}
        durationInFrames={TITLE_DURATION_IN_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* one line per file — separate overlays */}
      <Composition
        id="Title-Name-Overlay"
        component={NameOverlay}
        durationInFrames={TITLE_DURATION_IN_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Title-Label-Overlay"
        component={LabelOverlay}
        durationInFrames={TITLE_DURATION_IN_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Title-Name-Overlay-Vertical"
        component={NameOverlayVertical}
        durationInFrames={TITLE_DURATION_IN_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Title-Label-Overlay-Vertical"
        component={LabelOverlayVertical}
        durationInFrames={TITLE_DURATION_IN_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="AdmiralsVideo"
        component={AdmiralsVideo}
        durationInFrames={ADMIRALS_DURATION_IN_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AdmiralsVideo-SFXcues"
        component={SfxCueReview}
        durationInFrames={ADMIRALS_DURATION_IN_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="WhatIfVideo"
        component={WhatIfVideo}
        durationInFrames={WHATIF_DURATION_IN_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="BountyVideo"
        component={BountyVideo}
        durationInFrames={TOTAL_DURATION_IN_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
