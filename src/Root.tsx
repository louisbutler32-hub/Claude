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
import { MongolsEurope, MONGOLS_DURATION_IN_FRAMES } from "./maps/mongols";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ── animated historical maps ── */}
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
