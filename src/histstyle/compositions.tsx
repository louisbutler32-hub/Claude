import React from "react";
import { Composition } from "remotion";
import { EngravingStyle } from "./Engraving";
import { PaperStyle } from "./Paper";
import { CinematicStyle } from "./Cinematic";
import { PosterStyle } from "./Poster";
import { StyleCompare } from "./Compare";
import { BEAN_FPS, BEAN_FRAMES, BeanRainShort } from "./bean/RainShort";
import { FPS, FRAMES, H, W } from "./shared";

// The history-style tests, 9:16, ten seconds each. See shared.tsx.
export const HistoryStyleCompositions: React.FC = () => (
  <>
    <Composition id="HistStyle-A-Engraving" component={EngravingStyle} durationInFrames={FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="HistStyle-B-Paper" component={PaperStyle} durationInFrames={FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="HistStyle-C-Cinematic" component={CinematicStyle} durationInFrames={FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="HistStyle-D-Poster" component={PosterStyle} durationInFrames={FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="HistStyle-E-Bean-Rain" component={BeanRainShort} durationInFrames={BEAN_FRAMES} fps={BEAN_FPS} width={W} height={H} />
    <Composition id="HistStyle-Compare" component={StyleCompare} durationInFrames={FRAMES} fps={FPS} width={W} height={H} />
  </>
);
