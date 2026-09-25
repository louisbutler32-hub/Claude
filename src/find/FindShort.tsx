import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ANIMALS, type AnimalId } from "./animals";
import { loadFindFonts } from "./fonts";
import { H, SCENES, W, type SceneId } from "./scenes";

/**
 * "Find 10 …" — a hidden-object Short.
 *
 * One scene, ten of the same animal strung out along its path toward the
 * horizon, each doing its gait on the spot. The near one is huge and
 * half out of frame; the far one is a speck. The only ask is "Find 10",
 * and the ten seconds are just long enough to count them and lose count
 * once. The soundtrack is a drop-in at `public/audio/find-loop.m4a`.
 */

export const FIND_FPS = 30;
/** Matches the loop's length: 10.22 s. */
export const FIND_FRAMES = 306;
export const FIND_COUNT = 10;

export type FindProps = {
  scene: SceneId;
  animal: AnimalId;
  /** Render only the picture — for stills the audio tag is pointless. */
  still?: boolean;
};

export const FindShort: React.FC<FindProps> = ({ scene, animal, still }) => {
  loadFindFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const S = SCENES[scene];
  const A = ANIMALS[animal];

  // slow push-in so the frame is never dead
  const push = interpolate(frame, [0, FIND_FRAMES], [1, 1.045]);
  // title pops in over the first half second
  const pop = spring({ frame, fps, config: { damping: 12, stiffness: 160, mass: 0.7 } });

  // draw far to near so the near ones overlap the far ones
  const slots = S.slots.map((slot, i) => ({ slot, i })).sort((a, b) => a.slot.y - b.slot.y);

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {!still && <Audio src={staticFile("audio/find-loop.m4a")} />}
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 62%" }}>
        <S.Background />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          {slots.map(({ slot, i }) => {
            const scale = slot.s * (A.frontHeight / A.height);
            const phase = ((frame + i * 7) / A.cycle) * Math.PI * 2;
            const flip = i % 3 === 2 ? -1 : 1;
            return (
              <g key={i} transform={`translate(${slot.x} ${slot.y}) scale(${scale * flip} ${scale})`}>
                <ellipse cx={A.shadow.cx} cy={6} rx={A.shadow.rx} ry={A.shadow.ry} fill="#0b1208" opacity={0.35} />
                <A.Art phase={phase} />
              </g>
            );
          })}
        </svg>
        <S.Foreground />
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          top: 250,
          left: 0,
          width: W,
          textAlign: "center",
          fontFamily: "Montserrat, sans-serif",
          fontWeight: 800,
          fontSize: 96,
          letterSpacing: -1,
          color: "#fff",
          WebkitTextStroke: "3px #111",
          paintOrder: "stroke fill",
          textShadow: "0 6px 0 #111, 0 10px 24px rgba(0,0,0,0.55)",
          transform: `scale(${0.6 + 0.4 * pop})`,
          opacity: Math.min(1, pop * 1.4),
        }}
      >
        Find {FIND_COUNT} {A.plural}
      </div>
    </AbsoluteFill>
  );
};

export const FindLakeFrogs: React.FC = () => <FindShort scene="lake" animal="frog" />;
export const FindMeadowCats: React.FC = () => <FindShort scene="meadow" animal="cat" />;
export const FindLakeFrogsThumb: React.FC = () => <FindShort scene="lake" animal="frog" still />;
export const FindMeadowCatsThumb: React.FC = () => <FindShort scene="meadow" animal="cat" still />;
