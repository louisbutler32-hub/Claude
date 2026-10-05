import React from "react";
import { ZoroShort, ZoroThumb, ZORO_FRAMES } from "./akki/zoro/ZoroShort";
import { BowlingShort, BowlingThumb, BOWLING_FRAMES } from "./akki/bowling/BowlingShort";
import { BreakfastShort, BreakfastThumb, BREAKFAST_FRAMES } from "./akki/breakfast/BreakfastShort";
import { LostShort, LostThumb, LOST_FRAMES } from "./akki/lost/LostShort";
import { BuffetShort, BuffetThumb, BUFFET_FRAMES } from "./akki/buffet/BuffetShort";
import { FearShort, FearThumb, FEAR_FRAMES } from "./akki/fear/FearShort";
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
import { WildArtSheet } from "./wild/ArtSheet";
import { FruitArtSheet } from "./fruits/ArtSheet";
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
import { WildThumbA, WildThumbB } from "./wild/Thumbnail";
import { FruitThumbA, FruitThumbB } from "./fruits/Thumbnail";
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
import { WildVideo, WILD_DURATION_IN_FRAMES } from "./wild/WildVideo";
import { FruitVideo, FRUIT_DURATION_IN_FRAMES } from "./fruits/FruitVideo";
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
import { ChunkLoadShort, ChunkLoadThumb, CHUNKLOAD_FRAMES } from "./minecraft-chunkload/ChunkLoadShort";
import { FallShort, FallThumb, FALL_FRAMES } from "./minecraft-fall/FallShort";
import { OofySheet, OofyShortlist, OofyVariants } from "./minecraft/oofy";
import { OofyStyles } from "./minecraft/oofyStyles";
import { SneakCompare, SneakShort, SneakThumb, SNEAK_FRAMES } from "./minecraft-sneak/SneakShort";
import { BridgeShort, BridgeThumb, BRIDGE_FRAMES } from "./minecraft-bridge/BridgeShort";
import { SleepShort, SleepThumb, SLEEP_FRAMES } from "./minecraft-sleep/SleepShort";
import { LoseStuff2Short, LoseStuff2Thumb, LOSE2_FRAMES } from "./minecraft-lose2/LoseStuff2";
import { GrassShort, GrassThumb, GRASS_FRAMES } from "./minecraft-grass/GrassShort";
import { PovShort, PovThumb, POV_FRAMES } from "./minecraft-pov/PovShort";
import { NightShort, NightThumb, NIGHT_FRAMES } from "./minecraft-pov2/NightShort";
import { DiamondShort, DiamondThumb, DIAMOND_FRAMES } from "./minecraft-pov2/DiamondShort";
import { EnderShort, EnderThumb, ENDER_FRAMES } from "./minecraft-pov2/EnderShort";
import { LaPeaceShort, LaPeaceThumb, LAPEACE_FRAMES } from "./minecraft-lapeace/LaPeaceShort";
import { ToonSheet } from "./minecraft-lapeace/toon";
import { PickShort, PickThumb, PICK_FRAMES } from "./minecraft-pick/PickShort";
import { LaPeace3D, LAPEACE3D_FRAMES } from "./lapeace3d/LaPeace3D";
import { TennisShort, TennisThumb, TENNIS_FRAMES } from "./tennis/TennisShort";
import { TableTennisShort, TableTennisThumb, TT_FRAMES } from "./tabletennis/TableTennisShort";
import { FoodShort, FoodThumb, FOOD_FRAMES } from "./minecraft-food/FoodShort";
import { CreeperShort, CreeperThumb, CREEPER_FRAMES } from "./minecraft-creeper/CreeperShort";
import { NetherShort, NetherThumb, NETHER_FRAMES } from "./minecraft-nether/NetherShort";
import { BuildShort, BuildThumb, BUILD_FRAMES } from "./minecraft-build/BuildShort";
import {
  LongIntro, INTRO_FRAMES,
  Chapter1Card, Chapter2Card, Chapter3Card, Chapter4Card, Chapter5Card, CHAPTER_FRAMES,
  LongCast, CAST_FRAMES,
  LongVote, VOTE_FRAMES,
  LongOutro, OUTRO_FRAMES,
} from "./minecraft-longform/LongformParts";
import { BrandAvatar, BrandBanner, BrandBannerGuides } from "./brand/OofCraft";
import { DigShort, DigThumb, DIG_FRAMES } from "./minecraft-dig/DigShort";

import { BeringShort, BERING_FPS, BERING_SECONDS } from "./geo/bering/BeringShort";
import { LouisianaShort, LOUISIANA_FPS, LOUISIANA_SECONDS } from "./geo/louisiana/LouisianaShort";
import { DarienShort, DARIEN_FPS, DARIEN_FRAMES } from "./geo/darien/DarienShort";
import { BeringThumb, DarienThumb, LouisianaThumb, StatesThumb, TexasThumb, WaterlooThumb, Ww1Thumb, THUMB_FRAMES } from "./geo/Thumbnails";
import { Ww1Short, WW1_FPS, WW1_FRAMES } from "./geo/ww1/Ww1Short";
import { WaterlooShort, WATERLOO_FPS, WATERLOO_FRAMES } from "./geo/waterloo/WaterlooShort";
import { TexasShort, TEXAS_FPS, TEXAS_FRAMES } from "./geo/texas/TexasShort";
import { StatesShort, STATES_FPS, STATES_FRAMES } from "./geo/states/StatesShort";
import { SleepShort, SleepThumb, SLEEP_FPS, SLEEP_FRAMES } from "./pins/sleep/SleepShort";

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
        durationInFrames={DARIEN_FRAMES}
        fps={DARIEN_FPS}
        width={1080}
        height={1920}
        defaultProps={{ music: null, narration: "assets/vo/geo-darien.mp3" }}
      />
      <Composition id="Geo-Ww1" component={Ww1Short} durationInFrames={WW1_FRAMES} fps={WW1_FPS} width={1080} height={1920} defaultProps={{ music: null, narration: "assets/vo/geo-ww1.mp3" }} />
      <Composition id="Geo-Waterloo" component={WaterlooShort} durationInFrames={WATERLOO_FRAMES} fps={WATERLOO_FPS} width={1080} height={1920} defaultProps={{ music: null, narration: "assets/vo/geo-waterloo.mp3" }} />
      <Composition id="Geo-Texas" component={TexasShort} durationInFrames={TEXAS_FRAMES} fps={TEXAS_FPS} width={1080} height={1920} defaultProps={{ music: null, narration: "assets/vo/geo-texas.mp3", sfx: "audio/geo-texas-sfx.mp3" }} />
      <Composition id="Geo-States" component={StatesShort} durationInFrames={STATES_FRAMES} fps={STATES_FPS} width={1080} height={1920} defaultProps={{ music: null, narration: "assets/vo/geo-states.mp3" }} />
      <Composition id="Geo-Ww1-Thumb" component={Ww1Thumb} durationInFrames={THUMB_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="Geo-Waterloo-Thumb" component={WaterlooThumb} durationInFrames={THUMB_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="Geo-Texas-Thumb" component={TexasThumb} durationInFrames={THUMB_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="Geo-States-Thumb" component={StatesThumb} durationInFrames={THUMB_FRAMES} fps={30} width={1080} height={1920} />
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
        id="LoseStuffShort"
        component={MinecraftShort}
        durationInFrames={MINECRAFT_FRAMES}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ audio: null, cast: "oofy" as const, drawn: true, signText: "Oof Craft" }}
      />
      <Composition
        id="LoseStuff-Thumbnail"
        component={MinecraftThumb}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ cast: "oofy" as const }}
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
      <Composition id="Long-Intro" component={LongIntro} durationInFrames={INTRO_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Long-Chapter1" component={Chapter1Card} durationInFrames={CHAPTER_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Long-Chapter2" component={Chapter2Card} durationInFrames={CHAPTER_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Long-Chapter3" component={Chapter3Card} durationInFrames={CHAPTER_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Long-Chapter4" component={Chapter4Card} durationInFrames={CHAPTER_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Long-Chapter5" component={Chapter5Card} durationInFrames={CHAPTER_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Long-Cast" component={LongCast} durationInFrames={CAST_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Long-Vote" component={LongVote} durationInFrames={VOTE_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Long-Outro" component={LongOutro} durationInFrames={OUTRO_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="BuildShort" component={BuildShort} durationInFrames={BUILD_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Build-Thumbnail" component={BuildThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="NetherShort" component={NetherShort} durationInFrames={NETHER_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Nether-Thumbnail" component={NetherThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="CreeperShort" component={CreeperShort} durationInFrames={CREEPER_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Creeper-Thumbnail" component={CreeperThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="ChunkLoadShort" component={ChunkLoadShort} durationInFrames={CHUNKLOAD_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="ChunkLoad-Thumbnail" component={ChunkLoadThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="FallShort" component={FallShort} durationInFrames={FALL_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Fall-Thumbnail" component={FallThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="Oofy-Sheet" component={OofySheet} durationInFrames={1} fps={30} width={1920} height={1080} />
      <Composition id="Oofy-Variants" component={OofyVariants} durationInFrames={1} fps={30} width={1920} height={1080} />
      <Composition id="Oofy-Shortlist" component={OofyShortlist} durationInFrames={1} fps={30} width={1920} height={1080} />
      <Composition id="Oofy-Styles" component={OofyStyles} durationInFrames={1} fps={30} width={1920} height={1080} />
      <Composition id="Akki-Zoro" component={ZoroShort} durationInFrames={ZORO_FRAMES} fps={24} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Akki-Bowling" component={BowlingShort} durationInFrames={BOWLING_FRAMES} fps={24} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Akki-Breakfast" component={BreakfastShort} durationInFrames={BREAKFAST_FRAMES} fps={24} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Akki-Breakfast-Thumbnail" component={BreakfastThumb} durationInFrames={1} fps={24} width={1080} height={1920} />
      <Composition id="Akki-Lost" component={LostShort} durationInFrames={LOST_FRAMES} fps={24} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Akki-Lost-Thumbnail" component={LostThumb} durationInFrames={1} fps={24} width={1080} height={1920} />
      <Composition id="Akki-Buffet" component={BuffetShort} durationInFrames={BUFFET_FRAMES} fps={24} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Akki-Buffet-Thumbnail" component={BuffetThumb} durationInFrames={1} fps={24} width={1080} height={1920} />
      <Composition id="Akki-Fear" component={FearShort} durationInFrames={FEAR_FRAMES} fps={24} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Akki-Fear-Thumbnail" component={FearThumb} durationInFrames={1} fps={24} width={1080} height={1920} />
      <Composition id="Pins-Sleep" component={SleepShort} durationInFrames={SLEEP_FRAMES} fps={SLEEP_FPS} width={1080} height={1920} defaultProps={{ audio: "audio/pins-sleep-mix.mp3", captions: true }} />
      <Composition id="Pins-Sleep-Thumbnail" component={SleepThumb} durationInFrames={1} fps={SLEEP_FPS} width={1080} height={1920} />
      <Composition id="Akki-Zoro-Thumbnail" component={ZoroThumb} durationInFrames={1} fps={24} width={1080} height={1920} />
      <Composition id="Akki-Bowling-Thumbnail" component={BowlingThumb} durationInFrames={1} fps={24} width={1080} height={1920} />
      <Composition id="SneakShort" component={SneakShort} durationInFrames={SNEAK_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Sneak-Thumbnail" component={SneakThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="Sneak-Compare" component={SneakCompare} durationInFrames={SNEAK_FRAMES} fps={30} width={1080} height={1040} defaultProps={{ audio: null }} />
      <Composition id="BridgeShort" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Bridge-Thumbnail" component={BridgeThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="SleepShort" component={SleepShort} durationInFrames={SLEEP_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Sleep-Thumbnail" component={SleepThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="LoseStuff2Short" component={LoseStuff2Short} durationInFrames={LOSE2_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="LoseStuff2-Thumbnail" component={LoseStuff2Thumb} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="GrassShort" component={GrassShort} durationInFrames={GRASS_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Grass-Thumbnail" component={GrassThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="PovShort" component={PovShort} durationInFrames={POV_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Pov-Thumbnail" component={PovThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="PovNightShort" component={NightShort} durationInFrames={NIGHT_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="PovNight-Thumbnail" component={NightThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="PovDiamondShort" component={DiamondShort} durationInFrames={DIAMOND_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="PovDiamond-Thumbnail" component={DiamondThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="PovEnderShort" component={EnderShort} durationInFrames={ENDER_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="PovEnder-Thumbnail" component={EnderThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="LaPeaceShort" component={LaPeaceShort} durationInFrames={LAPEACE_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="LaPeaceCast" component={ToonSheet} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="LaPeace-Thumbnail" component={LaPeaceThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="PickShort" component={PickShort} durationInFrames={PICK_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Pick-Thumbnail" component={PickThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="LaPeace3D" component={LaPeace3D} durationInFrames={LAPEACE3D_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="TennisShort" component={TennisShort} durationInFrames={TENNIS_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Tennis-Thumbnail" component={TennisThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="TableTennisShort" component={TableTennisShort} durationInFrames={TT_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="TableTennis-Thumbnail" component={TableTennisThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="FoodShort" component={FoodShort} durationInFrames={FOOD_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: null }} />
      <Composition id="Food-Thumbnail" component={FoodThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
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
        id="Wild-Thumbnail"
        component={WildThumbA}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Wild-Thumbnail-Board"
        component={WildThumbB}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Fruit-Thumbnail"
        component={FruitThumbA}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Fruit-Thumbnail-Board"
        component={FruitThumbB}
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
        id="WildVideo"
        component={WildVideo}
        durationInFrames={WILD_DURATION_IN_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Wild-ArtSheet"
        component={WildArtSheet}
        durationInFrames={30}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FruitVideo"
        component={FruitVideo}
        durationInFrames={FRUIT_DURATION_IN_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Fruit-ArtSheet"
        component={FruitArtSheet}
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
