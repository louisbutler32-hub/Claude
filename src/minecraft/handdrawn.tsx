import React from "react";
import { AbsoluteFill, Freeze, useCurrentFrame } from "remotion";

/**
 * The hand-drawn look, for anything wrapped in <HandDrawn>:
 *
 *  - on twos: every drawing is held for `hold` frames, the way hand
 *    animators work — buttery 30fps interpolation is what reads as "made
 *    by a computer"
 *  - line boil: a displacement filter whose noise changes with every
 *    drawing, so each outline wobbles a pixel or two as if redrawn by hand,
 *    plus a finer pass that roughens edges the way a real stroke does
 *  - flat colour: components that check useDrawn() drop their gradients,
 *    shading and blur
 *
 * UI (captions, hearts, keys) should stay outside it — crisp and at full
 * frame rate, like the game's real interface on top of a drawn world.
 */

const DrawnContext = React.createContext(false);
export const useDrawn = () => React.useContext(DrawnContext);

/**
 * `hold` is how many frames each drawing is held (2 = on twos, 1 = smooth
 * full-rate motion); `boilEvery` is how often the line wobble changes,
 * independently — so motion can run on ones while the lines still boil at
 * a drawn pace. `grain` scales the fine edge-roughening pass (0 = off), which
 * chews up small pixel art like items and particles. `bleed` overscans the
 * drawn layer so the displacement never samples empty pixels past the frame
 * edge, which shows up as static along the sides.
 */
export const HandDrawn: React.FC<{ children: React.ReactNode; enabled?: boolean; hold?: number; boil?: number; boilEvery?: number; grain?: number; bleed?: number }> = ({
  children, enabled = true, hold = 2, boil = 1, boilEvery, grain = 1, bleed = 0.02,
}) => {
  const f = useCurrentFrame();
  if (!enabled) return <>{children}</>;
  const drawing = Math.floor(f / hold);
  const seed = (Math.floor(f / (boilEvery ?? hold)) % 3) + 1; // three drawings cycling, the classic boil
  const id = "handDrawnBoil";
  return (
    <DrawnContext.Provider value>
      <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
        <defs>
          <filter id={id} x="-2%" y="-2%" width="104%" height="104%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves={2} seed={seed} result="wobble" />
            <feDisplacementMap in="SourceGraphic" in2="wobble" scale={6 * boil} xChannelSelector="R" yChannelSelector="G" result="boiled" />
            {grain > 0 && <feTurbulence type="fractalNoise" baseFrequency="0.28" numOctaves={1} seed={seed + 10} result="grain" />}
            {grain > 0 && <feDisplacementMap in="boiled" in2="grain" scale={2.4 * boil * grain} xChannelSelector="R" yChannelSelector="G" />}
          </filter>
        </defs>
      </svg>
      <AbsoluteFill style={{ filter: `url(#${id})` }}>
        <AbsoluteFill style={{ transform: `scale(${1 + bleed})` }}>
          <Freeze frame={drawing * hold}>{children}</Freeze>
        </AbsoluteFill>
      </AbsoluteFill>
    </DrawnContext.Provider>
  );
};
