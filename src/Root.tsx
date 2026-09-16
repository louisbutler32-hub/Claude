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
import { VehicleArtSheet } from "./vehicles/ArtSheet";
import { DinoArtSheet } from "./dinosaurs/ArtSheet";
import { SeaArtSheet } from "./sea/ArtSheet";
import { SeaVideo, SEA_DURATION_IN_FRAMES } from "./sea/SeaVideo";
import {
  ColourVideo,
  COLOUR_DURATION_IN_FRAMES,
} from "./colours/ColourVideo";
import { DinoVideo, DINO_DURATION_IN_FRAMES } from "./dinosaurs/DinoVideo";
import {
  VehicleVideo,
  VEHICLE_DURATION_IN_FRAMES,
} from "./vehicles/VehicleVideo";
import { Banner, BannerGuides, BannerWhite } from "./guess/Banner";
import {
  CompilationThumb,
  CompilationThumbBoard,
  CompilationThumbQuad,
  CompilationThumbShadows,
} from "./guess/CompilationThumb";
import { AnimalThumbA, AnimalThumbB } from "./animals/Thumbnail";
import { NumberThumbA, NumberThumbB } from "./numbers/Thumbnail";
import { VehicleThumbA, VehicleThumbB } from "./vehicles/Thumbnail";
import { DinoThumbA, DinoThumbB } from "./dinosaurs/Thumbnail";
import { SeaThumbA, SeaThumbB } from "./sea/Thumbnail";
import { ColourThumbA, ColourThumbB } from "./colours/Thumbnail";
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
import { KillersVideo, KILLERS_DURATION_SECONDS } from "./killers/KillersVideo";
import { EarthVideo, EARTH_DURATION_SECONDS } from "./earth/EarthVideo";
import { Earth2Video, EARTH2_DURATION_SECONDS } from "./earth2/Earth2Video";
import { Earth2ThumbA, Earth2ThumbB } from "./earth2/Thumbnail";
import { EarthThumbA, EarthThumbB } from "./earth/Thumbnail";
import { KillersThumbA, KillersThumbB } from "./killers/Thumbnail";
import { MummyThumbA, MummyThumbB } from "./mummy/Thumbnail";
import { MongolsEurope, MONGOLS_DURATION_IN_FRAMES } from "./maps/mongols";
import { MansaMusa, MANSA_DURATION_IN_FRAMES } from "./maps/mansa";
import { Shelterbelt, SHELTERBELT_DURATION_IN_FRAMES } from "./maps/shelterbelt";
import { MinecraftShort, MINECRAFT_FRAMES } from "./minecraft/MinecraftShort";
import { MinecraftThumb } from "./minecraft/Thumbnail";
import { PebbloSheet } from "./minecraft/PebbloSheet";
import { CharacterOptions } from "./minecraft/characters";
import { PvpShort, PvpThumb, PVP_FRAMES } from "./minecraft-pvp/PvpShort";
import { CreeperShort, CreeperThumb, CREEPER_FRAMES } from "./minecraft-creeper/CreeperShort";
import { BrandAvatar, BrandBanner, BrandBannerGuides } from "./brand/OofCraft";
import { DigShort, DigThumb, DIG_FRAMES } from "./minecraft-dig/DigShort";

import { BeringShort, BERING_FPS, BERING_SECONDS } from "./geo/bering/BeringShort";
import { LouisianaShort, LOUISIANA_FPS, LOUISIANA_SECONDS } from "./geo/louisiana/LouisianaShort";
import { DarienShort, DARIEN_FPS, DARIEN_SECONDS } from "./geo/darien/DarienShort";
import { BeringThumb, DarienThumb, LouisianaThumb, THUMB_FRAMES } from "./geo/Thumbnails";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ── geo shorts: satellite-map explainers, 9:16 ── */}
      <Composition
        id="Geo-Bering"
        component={BeringShort}
        durationInFrames={BERING_SECONDS * BERING_FPS}
        fps={BERING_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="Geo-Louisiana"
        component={LouisianaShort}
        durationInFrames={LOUISIANA_SECONDS * LOUISIANA_FPS}
        fps={LOUISIANA_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="Geo-Darien"
        component={DarienShort}
        durationInFrames={DARIEN_SECONDS * DARIEN_FPS}
        fps={DARIEN_FPS}
        width={1080}
        height={1920}
      />
      <Composition id="Geo-Bering-Thumb" component={BeringThumb} durationInFrames={THUMB_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="Geo-Louisiana-Thumb" component={LouisianaThumb} durationInFrames={THUMB_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="Geo-Darien-Thumb" component={DarienThumb} durationInFrames={THUMB_FRAMES} fps={30} width={1080} height={1920} />

      {/* ── Minecraft meme Short ── */}
      <Composition
        id="MinecraftShort"
        component={MinecraftShort}
        durationInFrames={MINECRAFT_FRAMES}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ audio: "audio/minecraft-mix.mp3" }}
      />
      <Composition
        id="DigShort"
        component={DigShort}
        durationInFrames={DIG_FRAMES}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ audio: null }}
      />
      <Composition
        id="Dig-Thumbnail"
        component={DigThumb}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition id="Brand-Avatar" component={BrandAvatar} durationInFrames={1} fps={30} width={800} height={800} />
      <Composition id="Brand-Banner" component={BrandBanner} durationInFrames={1} fps={30} width={2560} height={1440} />
      <Composition id="Brand-Banner-Guides" component={BrandBannerGuides} durationInFrames={1} fps={30} width={2560} height={1440} />
      <Composition id="CreeperShort" component={CreeperShort} durationInFrames={CREEPER_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Creeper-Thumbnail" component={CreeperThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition
        id="PvpShort"
        component={PvpShort}
        durationInFrames={PVP_FRAMES}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ audio: null }}
      />
      <Composition
        id="Pvp-Thumbnail"
        component={PvpThumb}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Character-Options"
        component={CharacterOptions}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1800}
      />
      <Composition
        id="Pebblo-Sheet"
        component={PebbloSheet}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Minecraft-Thumbnail"
        component={MinecraftThumb}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
      />

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
        id="EarthVideo"
        component={EarthVideo}
        durationInFrames={EARTH_DURATION_SECONDS * 30}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="Earth2Video"
        component={Earth2Video}
        durationInFrames={EARTH2_DURATION_SECONDS * 30}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition id="Earth2-Thumb-A" component={Earth2ThumbA}
        durationInFrames={1} fps={30} width={1920} height={1080} />
      <Composition id="Earth2-Thumb-B" component={Earth2ThumbB}
        durationInFrames={1} fps={30} width={1920} height={1080} />

      <Composition
        id="Earth-Thumbnail"
        component={EarthThumbA}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Earth-Thumbnail-Lake"
        component={EarthThumbB}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="KillersVideo"
        component={KillersVideo}
        durationInFrames={KILLERS_DURATION_SECONDS * 30}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="Killers-Thumbnail"
        component={KillersThumbA}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Killers-Thumbnail-Figures"
        component={KillersThumbB}
        durationInFrames={1}
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
        id="Vehicle-Thumbnail"
        component={VehicleThumbA}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Vehicle-Thumbnail-Board"
        component={VehicleThumbB}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Dino-Thumbnail"
        component={DinoThumbA}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Dino-Thumbnail-Board"
        component={DinoThumbB}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Sea-Thumbnail"
        component={SeaThumbA}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Sea-Thumbnail-Board"
        component={SeaThumbB}
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
        id="Compilation-Thumbnail"
        component={CompilationThumb}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="VehicleVideo"
        component={VehicleVideo}
        durationInFrames={VEHICLE_DURATION_IN_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Vehicle-ArtSheet"
        component={VehicleArtSheet}
        durationInFrames={30}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DinoVideo"
        component={DinoVideo}
        durationInFrames={DINO_DURATION_IN_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Dino-ArtSheet"
        component={DinoArtSheet}
        durationInFrames={30}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ColourVideo"
        component={ColourVideo}
        durationInFrames={COLOUR_DURATION_IN_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Colour-Thumbnail"
        component={ColourThumbA}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Colour-Thumbnail-Board"
        component={ColourThumbB}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SeaVideo"
        component={SeaVideo}
        durationInFrames={SEA_DURATION_IN_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Sea-ArtSheet"
        component={SeaArtSheet}
        durationInFrames={30}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Compilation-Thumbnail-Quad"
        component={CompilationThumbQuad}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Compilation-Thumbnail-Shadows"
        component={CompilationThumbShadows}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Compilation-Thumbnail-Board"
        component={CompilationThumbBoard}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
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
        id="Channel-Banner-White"
        component={BannerWhite}
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
