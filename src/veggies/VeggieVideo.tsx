import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Board, FlyToSlot } from "./board";
import {
  Cat,
  Crocodile,
  DRIFTERS,
  DRIFTER_FLIES,
  Dog,
  Frog,
  Penguin,
} from "./critters";
import { loadVeggieFonts } from "./fonts";
import { Confetti, PopLines, RevealFlash, Sparkles } from "./fx";
import { Habitat } from "./habitats";
import {
  BEAT,
  HERO_SCALE,
  INTRO_LEN,
  ROUNDS,
  ROUND_LEN,
  TOTAL_FRAMES,
  type Round,
} from "./rounds";
import {
  Bush,
  BushPair,
  Clouds,
  GROUND_Y,
  Grass,
  H,
  PaperGrain,
  SceneFilters,
  Sky,
  Sun,
  W,
} from "./scene";
import { TitleCard } from "./title";
import { CornerLabel, WobbleText } from "./ui";
import { Veggie, VeggieDefs, VEGGIE_NAME, type VeggieId } from "./veggies";

/**
 * "Chomp Chomp VEGGIES" — a guess-the-silhouette video for small kids.
 *
 * Twelve rounds, each on the same beat: something drifts past, a black
 * shape rises out of the bushes, "What is that?", the shape turns into a
 * kawaii vegetable, we visit the plant it grew on, the crocodile eats it,
 * and it fills one more slot on the collection board.
 */

const HERO_X = 960;
const HERO_Y = 610;

/* ------------------------------------------------------------------ */
/* one round                                                           */
/* ------------------------------------------------------------------ */

const VeggieRound: React.FC<{
  round: Round;
  solved: VeggieId[];
  /** the last round holds the finished board instead of dropping it */
  finale?: boolean;
}> = ({ round, solved, finale = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const id = round.id;
  const hero = HERO_SCALE[id];

  const onHabitat = frame >= BEAT.habitat && frame < BEAT.habitatOut;
  const boardExit = finale ? ROUND_LEN + 400 : BEAT.boardExit;
  const boardUp = frame >= BEAT.boardRise - 4;
  const celebrating = frame >= BEAT.celebrate && frame < boardExit + 20;

  /* --- silhouette rise ------------------------------------------- */
  const riseS = spring({
    frame: frame - BEAT.silRise,
    fps,
    config: { damping: 13, mass: 0.9, stiffness: 95 },
  });
  const heroY = interpolate(riseS, [0, 1], [HERO_Y + 620, HERO_Y]);
  const heroSway = Math.sin((frame - BEAT.silRise) / 17) * 2.2;

  /* --- reveal bounce --------------------------------------------- */
  const revealS = spring({
    frame: frame - BEAT.reveal,
    fps,
    config: { damping: 8, mass: 0.45, stiffness: 190 },
  });
  const revealBump = 1 + Math.sin(revealS * Math.PI) * 0.16;
  const bob = Math.sin(frame / 14) * 9;

  /* --- shrink onto the grass ------------------------------------- */
  const shrinkT = interpolate(
    frame,
    [BEAT.shrink, BEAT.shrinkEnd],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const shrinkEase = shrinkT * shrinkT * (3 - 2 * shrinkT);
  const heroScale = interpolate(shrinkEase, [0, 1], [hero, 0.5]) * revealBump;
  const heroPosY =
    interpolate(shrinkEase, [0, 1], [heroY + bob * (1 - shrinkEase), GROUND_Y - 34]);

  /* --- roll away, then get eaten --------------------------------- */
  const rollT = interpolate(frame, [BEAT.rollStart, BEAT.rollEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rollX = interpolate(rollT, [0, 1], [HERO_X, 820]);
  const rollHop = Math.abs(Math.sin(rollT * Math.PI * 5)) * 26 * (1 - rollT);
  const eaten = frame >= BEAT.chomp + 4;

  /* --- crocodile -------------------------------------------------- */
  const crocT = interpolate(frame, [BEAT.crocIn, BEAT.chomp], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const crocX =
    frame <= BEAT.chomp
      ? interpolate(crocT, [0, 1], [2560, 1030])
      : interpolate(
          frame,
          [BEAT.chomp, BEAT.habitatOut + 30],
          [1030, -760],
          { extrapolateRight: "clamp" }
        );
  const chompAmt = interpolate(
    frame,
    [BEAT.chomp - 6, BEAT.chomp, BEAT.chomp + 10, BEAT.chomp + 22],
    [0, 1, 1, 0.75],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const crocOnScreen = frame >= BEAT.crocIn - 4 && frame < BEAT.habitatOut + 30;

  /* --- drifter ---------------------------------------------------- */
  const Drifter = DRIFTERS[round.drifter];
  const flies = DRIFTER_FLIES[round.drifter];
  const driftT = interpolate(frame, [BEAT.driftIn, BEAT.driftOut], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const driftX = interpolate(driftT, [0, 1], [-190, W + 190]);
  const driftY = flies
    ? 250 + Math.sin(driftT * Math.PI * 3) * 70
    : GROUND_Y + 26 - Math.abs(Math.sin(driftT * Math.PI * 6)) * 18;

  /* --- the peek-a-boo hop over the bushes -------------------------- */
  const hopT = interpolate(frame, [BEAT.hopIn, BEAT.hopOut], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hopX = interpolate(hopT, [0, 1], [-90, W + 90]);
  const hopY = 596 - Math.abs(Math.sin(hopT * Math.PI * 7)) * 70;
  const hopping = frame >= BEAT.hopIn && frame <= BEAT.hopOut;

  /* --- the four cheering animals ---------------------------------- */
  const cheer = (i: number) =>
    spring({
      frame: frame - BEAT.celebrate - i * 4,
      fps,
      config: { damping: 11, mass: 0.5, stiffness: 160 },
    });

  return (
    <AbsoluteFill style={{ backgroundColor: "#dceaee" }}>
      <Sky />
      <Clouds drift={frame * 0.08} />
      <Sun happy={celebrating} />

      <Grass tulips={boardUp} />

      {onHabitat ? (
        <>
          <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
            <Bush x={1300} y={GROUND_Y - 220} w={740} h={220} tone="lite" seed={11} />
          </svg>
          <Habitat
            id={id}
            x={interpolate(frame, [BEAT.habitat, BEAT.habitatOut], [40, -120])}
          />
        </>
      ) : (
        <BushPair />
      )}

      {/* the drifter */}
      {frame <= BEAT.driftOut ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(${driftX} ${driftY}) scale(1.15)`}>
            <Drifter />
          </g>
        </svg>
      ) : null}

      {/* peek-a-boo hop */}
      {hopping ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <VeggieDefs />
          <Veggie
            id={id}
            x={hopX}
            y={hopY}
            size={0.52}
            rotate={Math.sin(hopT * 22) * 14}
          />
        </svg>
      ) : null}

      {/* the hero: silhouette, then the real thing */}
      {frame >= BEAT.silRise && frame < BEAT.habitat ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <VeggieDefs />
          <g transform={`rotate(${heroSway} ${HERO_X} ${heroPosY})`}>
            <Veggie
              id={id}
              x={HERO_X}
              y={heroPosY}
              size={heroScale}
              sil={frame < BEAT.reveal}
            />
          </g>
        </svg>
      ) : null}

      {/* on the habitat beat it rolls off to the right */}
      {onHabitat && !eaten ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <VeggieDefs />
          <Veggie
            id={id}
            x={rollX}
            y={GROUND_Y - 34 - rollHop}
            size={0.5}
            rotate={rollT * 220}
          />
        </svg>
      ) : null}

      {/* the crocodile */}
      {crocOnScreen ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(${crocX} ${GROUND_Y - 44}) scale(1.72)`}>
            <Crocodile chomp={chompAmt} step={frame / 4.5} />
          </g>
        </svg>
      ) : null}

      {/* the pop */}
      <RevealFlash start={BEAT.flash} />
      <PopLines start={BEAT.reveal} cx={HERO_X} cy={HERO_Y} r={260} />

      {/* type */}
      {frame < BEAT.reveal ? (
        <WobbleText
          text="What is that?"
          start={BEAT.question}
          size={132}
          y={74}
          seed={`q${id}`}
        />
      ) : (
        <WobbleText
          text={VEGGIE_NAME[id]}
          start={BEAT.name}
          size={152}
          y={62}
          seed={`n${id}`}
          out={BEAT.shrinkEnd}
        />
      )}

      {/* the board */}
      {boardUp ? (
        <>
          <Board
            solved={solved}
            filling={id}
            riseAt={BEAT.boardRise}
            popAt={BEAT.boardPop}
            landAt={BEAT.land}
            exitAt={boardExit}
          />
          <FlyToSlot
            id={id}
            start={BEAT.flyStart}
            landAt={BEAT.land}
            fromX={130}
            fromY={640}
          />
          <CornerLabel
            text={VEGGIE_NAME[id]}
            start={BEAT.boardPop}
            out={BEAT.land}
          />
        </>
      ) : null}

      {/* celebration */}
      {celebrating ? (
        <>
          <Sparkles start={BEAT.celebrate} cx={960} cy={520} spread={840} count={18} size={1.6} />
          <Confetti start={BEAT.celebrate} />
          {finale ? (
            <>
              <Sparkles
                start={BEAT.celebrate + 70}
                cx={960}
                cy={480}
                spread={900}
                count={22}
                size={1.8}
              />
              <Confetti start={BEAT.celebrate + 78} count={90} />
              <Sparkles
                start={BEAT.celebrate + 150}
                cx={960}
                cy={520}
                spread={880}
                count={20}
                size={1.7}
              />
            </>
          ) : null}
          <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
            {[
              { C: Cat, x: 140, y: 946 },
              { C: Frog, x: 640, y: 1000 },
              { C: Penguin, x: 1252, y: 986 },
              { C: Dog, x: 1768, y: 950 },
            ].map((a, i) => {
              const s = cheer(i);
              const A = a.C;
              return (
                <g
                  key={i}
                  transform={`translate(${a.x} ${a.y + (1 - s) * 220}) scale(1.05)`}
                  opacity={s}
                >
                  <A />
                </g>
              );
            })}
          </svg>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* the whole video                                                     */
/* ------------------------------------------------------------------ */

export const VeggieVideo: React.FC = () => {
  loadVeggieFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#dceaee" }}>
      {/*
        The soundtrack is a drop-in slot: anything at
        public/audio/veggies-mix.mp3 that runs 10:28 gets used as-is.
        `npm run veggies:audio` builds one (voice + sfx + music bed);
        replace the file to use your own recording instead.
      */}
      <Audio src={staticFile("audio/veggies-mix.mp3")} />
      <SceneFilters />
      <Sequence durationInFrames={INTRO_LEN}>
        <TitleCard />
      </Sequence>
      {ROUNDS.map((round, i) => (
        <Sequence
          key={round.id}
          from={INTRO_LEN + i * ROUND_LEN}
          durationInFrames={ROUND_LEN}
        >
          <VeggieRound
            round={round}
            solved={ROUNDS.slice(0, i).map((r) => r.id)}
            finale={i === ROUNDS.length - 1}
          />
        </Sequence>
      ))}
      <PaperGrain />
    </AbsoluteFill>
  );
};

export const VEGGIE_DURATION_IN_FRAMES = TOTAL_FRAMES;
