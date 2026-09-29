import React from "react";
import { Figure, Tint, TINT } from "./figure";
import { Oofy, OofyTint, OOFY_TINT } from "./oofy";

/**
 * One drawing call for both casts. shots.tsx draws every figure through
 * <Figure> from here; inside <CastProvider cast="oofy"> the same call draws
 * Oofy instead of the reference's stick figure, with the same pose, face,
 * tint and hand props, so a rebuilt shot can be re-cast without touching it.
 */
export type Cast = "stick" | "oofy";
const CastContext = React.createContext<Cast>("stick");
export const CastProvider = CastContext.Provider;
export const useCast = () => React.useContext(CastContext);

const SHIRT_LUM = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.3 * ((n >> 16) & 255) + 0.59 * ((n >> 8) & 255) + 0.11 * (n & 255);
};
const scale = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (s: number) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * k)));
  return `#${((1 << 24) + (ch(16) << 16) + (ch(8) << 8) + ch(0)).toString(16).slice(1)}`;
};

/** the stick figure's lighting tints, carried over to Oofy: same head brightness, hoodie dimmed as the shirt was */
export const oofyTintFor = (t: Tint): OofyTint => {
  if (t === TINT.hurt) return OOFY_TINT.hurt;
  const k = SHIRT_LUM(t.shirt) / SHIRT_LUM(TINT.normal.shirt);
  const base = OOFY_TINT.normal;
  return {
    skin: t.head,
    line: k < 0.95 ? scale(base.line, 0.7) : base.line,
    hoodie: scale(base.hoodie, Math.min(1, k)),
    pants: scale(base.pants, Math.min(1, 0.5 + k / 2)),
    shoe: scale(base.shoe, Math.min(1, 0.5 + k / 2)),
  };
};

export const ActorFigure: React.FC<React.ComponentProps<typeof Figure>> = (props) => {
  const cast = React.useContext(CastContext);
  if (cast === "stick") return <Figure {...props} />;
  const { x, y, scale: sc, pose, face, tint = TINT.normal, look, tilt, flip, armsOverHead, hands, faceOffset, shadow } = props;
  return (
    <Oofy
      x={x} y={y} scale={sc} pose={pose} face={face} tint={oofyTintFor(tint)} look={look} tilt={tilt} flip={flip}
      armsOverHead={armsOverHead} hands={hands} faceOffset={faceOffset} shadow={shadow}
      bandAid
    />
  );
};
