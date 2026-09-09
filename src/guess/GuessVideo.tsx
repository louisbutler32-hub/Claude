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
import { BEAT, INTRO_LEN, ROUND_LEN, totalFrames } from "./beats";
import { Board, FlyToSlot, Item } from "./Board";
import { Cat, Dog, DRIFTERS, DRIFTER_FLIES, Frog, Penguin } from "./critters";
import { loadVeggieFonts } from "./fonts";
import { Confetti, PopLines, RevealFlash, Sparkles } from "./fx";
import {
  BushPair,
  Clouds,
  Grass,
  GROUND_Y,
  H,
  PaperGrain,
  SceneFilters,
  Sky,
  Sun,
  W,
} from "./scene";
import { TitleCard } from "./TitleCard";
import type { GuessRound, GuessSubject } from "./types";
import { CornerLabel, WobbleText } from "./ui";

/**
 * The guess-the-silhouette engine.
 *
 * A title card, then twelve rounds on one beat: something drifts past, a
 * black shape rises out of the bushes, "What is that?", the shape turns
 * into the real thing, the subject takes over the middle of the round, and
 * one more slot on the collection board fills in.
 */

const HERO_X = 960;
const HERO_Y = 610;

const GuessRoundScene: React.FC<{
  subject: GuessSubject;
  round: GuessRound;
  solved: string[];
  /** the last round holds the finished board instead of dropping it */
  finale?: boolean;
}> = ({ subject, round, solved, finale = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const id = round.id;
  const hero = subject.heroScale[id] ?? 2.3;

  const boardExit = finale ? ROUND_LEN + 400 : BEAT.boardExit;
  const onMid = frame >= BEAT.mid && frame < BEAT.midOut;
  const boardUp = frame >= BEAT.boardRise - 4;
  const celebrating = frame >= BEAT.celebrate && frame < boardExit + 20;

  const riseS = spring({
    frame: frame - BEAT.silRise,
    fps,
    config: { damping: 13, mass: 0.9, stiffness: 95 },
  });
  const heroY = interpolate(riseS, [0, 1], [HERO_Y + 620, HERO_Y]);
  const heroSway = Math.sin((frame - BEAT.silRise) / 17) * 2.2;

  const revealS = spring({
    frame: frame - BEAT.reveal,
    fps,
    config: { damping: 8, mass: 0.45, stiffness: 190 },
  });
  const revealBump = 1 + Math.sin(revealS * Math.PI) * 0.16;
  const bob = Math.sin(frame / 14) * 9;

  const shrinkT = interpolate(frame, [BEAT.shrink, BEAT.shrinkEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shrinkEase = shrinkT * shrinkT * (3 - 2 * shrinkT);
  const heroScale = interpolate(shrinkEase, [0, 1], [hero, 0.5]) * revealBump;
  const heroPosY = interpolate(
    shrinkEase,
    [0, 1],
    [heroY + bob * (1 - shrinkEase), GROUND_Y - 34]
  );

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

  const hopT = interpolate(frame, [BEAT.hopIn, BEAT.hopOut], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hopX = interpolate(hopT, [0, 1], [-90, W + 90]);
  const hopY = 596 - Math.abs(Math.sin(hopT * Math.PI * 7)) * 70;
  const hopping = frame >= BEAT.hopIn && frame <= BEAT.hopOut;

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

      {onMid ? <subject.MidBeat id={id} /> : <BushPair />}

      {frame <= BEAT.driftOut ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(${driftX} ${driftY}) scale(1.15)`}>
            <Drifter />
          </g>
        </svg>
      ) : null}

      {hopping ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <subject.Defs />
          <Item
            subject={subject}
            id={id}
            x={hopX}
            y={hopY}
            size={0.52}
            rotate={Math.sin(hopT * 22) * 14}
          />
        </svg>
      ) : null}

      {frame >= BEAT.silRise && frame < BEAT.mid ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <subject.Defs />
          <g transform={`rotate(${heroSway} ${HERO_X} ${heroPosY})`}>
            <Item
              subject={subject}
              id={id}
              x={HERO_X}
              y={heroPosY}
              size={heroScale}
              sil={frame < BEAT.reveal}
            />
          </g>
        </svg>
      ) : null}

      <RevealFlash start={BEAT.flash} />
      <PopLines start={BEAT.reveal} cx={HERO_X} cy={HERO_Y} r={260} />

      {frame < BEAT.reveal ? (
        <WobbleText
          text="What is that?"
          start={BEAT.question}
          size={132}
          y={74}
          seed={`q${subject.key}${id}`}
        />
      ) : (
        <WobbleText
          text={subject.names[id]}
          start={BEAT.name}
          size={152}
          y={62}
          seed={`n${subject.key}${id}`}
          out={BEAT.shrinkEnd}
        />
      )}

      {boardUp ? (
        <>
          <Board
            subject={subject}
            solved={solved}
            filling={id}
            riseAt={BEAT.boardRise}
            popAt={BEAT.boardPop}
            landAt={BEAT.land}
            exitAt={boardExit}
          />
          <FlyToSlot
            subject={subject}
            id={id}
            start={BEAT.flyStart}
            landAt={BEAT.land}
          />
          <CornerLabel
            text={subject.names[id]}
            start={BEAT.boardPop}
            out={BEAT.land}
          />
        </>
      ) : null}

      {celebrating ? (
        <>
          <Sparkles
            start={BEAT.celebrate}
            cx={960}
            cy={520}
            spread={840}
            count={18}
            size={1.6}
          />
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

/**
 * The whole episode. `audio` names a file under public/audio — a drop-in
 * slot, so a hand-recorded track replaces the generated one without any
 * code change.
 */
export const GuessVideo: React.FC<{
  subject: GuessSubject;
  audio?: string;
}> = ({ subject, audio }) => {
  loadVeggieFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#dceaee" }}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <SceneFilters />
      <Sequence durationInFrames={INTRO_LEN}>
        <TitleCard subject={subject} />
      </Sequence>
      {subject.rounds.map((round, i) => (
        <Sequence
          key={round.id}
          from={INTRO_LEN + i * ROUND_LEN}
          durationInFrames={ROUND_LEN}
        >
          <GuessRoundScene
            subject={subject}
            round={round}
            solved={subject.rounds.slice(0, i).map((r) => r.id)}
            finale={i === subject.rounds.length - 1}
          />
        </Sequence>
      ))}
      <PaperGrain />
    </AbsoluteFill>
  );
};

export const durationFor = (subject: GuessSubject) =>
  totalFrames(subject.rounds.length);
