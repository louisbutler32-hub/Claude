import React from "react";
import { Composition } from "remotion";
import { BountyVideo, TOTAL_DURATION_IN_FRAMES } from "./BountyVideo";
import { WhatIfVideo } from "./whatif/WhatIfVideo";
import { WHATIF_DURATION_IN_FRAMES } from "./whatif/shots";
import { AdmiralsVideo, ADMIRALS_DURATION_IN_FRAMES } from "./admirals/AdmiralsVideo";
import { SfxCueReview } from "./admirals/SfxCueReview";

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
