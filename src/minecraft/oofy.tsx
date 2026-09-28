import React from "react";
import { AbsoluteFill } from "remotion";
import { Face, FaceKind, Figure, HEAD_R, limb, pose, POSE, Tint, walkPose } from "./figure";
import { loadMinecraftFonts } from "./fonts";

/**
 * Oofy — the Oof Craft mascot. Same rig and line weight as the reference
 * stick figure (so he drops into any Short), with three things that are
 * his alone and read even in silhouette:
 *
 *  - a band-aid on his head: he always gets hurt, and survives anyway
 *  - a blocky three-pixel hair tuft: the Minecraft nod, and it breaks the
 *    perfect circle so his outline isn't just "stick figure"
 *  - a purple shirt: pops on grass and on sky, and isn't the orange the
 *    reference channel owns
 */

export const OOFY_TINT = {
  normal: { head: "#ffffff", line: "#000000", shirt: "#8b5cf6" },
  hurt: { head: "#fca0a1", line: "#5e0000", shirt: "#e0457b" },
  dim: { head: "#b7b7b7", line: "#000000", shirt: "#5b3fa0" },
  warm: { head: "#fdf3e6", line: "#000000", shirt: "#8b5cf6" },
} as const;

const HAIR = "#3b2a20";

/** the tuft and the band-aid, in head space (origin at the head's centre) */
export const OofyHead: React.FC<{ line?: string; bandAid?: boolean }> = ({ line = "#000000", bandAid = true }) => (
  <g>
    {/* tuft: three blocks stepping up and to the right, rooted behind the outline */}
    {[[-34, -HEAD_R - 14, 30], [-6, -HEAD_R - 34, 30], [22, -HEAD_R - 18, 26]].map(([x, y, s], i) => (
      <rect key={i} x={x} y={y} width={s} height={-HEAD_R + 8 - y} fill={HAIR} stroke={line} strokeWidth={7} strokeLinejoin="round" />
    ))}
    <path d={`M${-40},${-HEAD_R + 6} Q0,${-HEAD_R - 6} 40,${-HEAD_R + 6}`} fill="none" stroke={line} strokeWidth={16} strokeLinecap="round" />
    {bandAid && (
      <g transform="translate(46 -54) rotate(-32)">
        <rect x={-36} y={-12} width={72} height={24} rx={11} fill="#f2c29b" stroke={line} strokeWidth={5} />
        <rect x={-12} y={-12} width={24} height={24} fill="#dca07a" stroke={line} strokeWidth={4} />
        {[-26, -20, 20, 26].map((x) => <circle key={x} cx={x} cy={0} r={2} fill="#b98163" />)}
      </g>
    )}
  </g>
);

type FigureProps = React.ComponentProps<typeof Figure>;

/** Oofy anywhere a Figure goes: same props, his tint and head by default. */
export const Oofy: React.FC<Omit<FigureProps, "tint"> & { tint?: Tint; bandAid?: boolean }> = ({ tint = OOFY_TINT.normal, bandAid = true, ...rest }) => (
  <Figure {...rest} tint={tint} headExtras={<OofyHead line={tint.line} bandAid={bandAid} />} />
);

/* ------------------------------ model sheet ------------------------------ */

const PIX = "Silkscreen, monospace";

const Label: React.FC<{ x: number; y: number; children: React.ReactNode; size?: number; fill?: string }> = ({ x, y, children, size = 30, fill = "#141414" }) => (
  <text x={x} y={y} fontFamily={PIX} fontSize={size} fill={fill} textAnchor="middle">{children}</text>
);

const FACES: FaceKind[] = ["plain", "joy", "sly", "shocked", "scream", "hurt"];

export const OofySheet: React.FC = () => {
  loadMinecraftFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#f4f1ea" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <rect x={0} y={0} width={620} height={1080} fill="#e7e0f7" />
        <text x={310} y={130} fontFamily={PIX} fontSize={120} fill="#8b5cf6" stroke="#141414" strokeWidth={10} paintOrder="stroke" textAnchor="middle">OOFY</text>
        <Label x={310} y={190} size={26} fill="#4a3d6b">always gets hurt.</Label>
        <Label x={310} y={226} size={26} fill="#4a3d6b">survives anyway.</Label>
        <Oofy x={310} y={560} scale={1.15} pose={POSE.up} face="joy" />
        {/* palette */}
        {[["#8b5cf6", "shirt"], ["#ffffff", "head"], ["#000000", "line"], ["#f2c29b", "band-aid"], [HAIR, "tuft"]].map(([c, n], i) => (
          <g key={n} transform={`translate(${70 + i * 104} 960)`}>
            <rect width={84} height={60} fill={c} stroke="#141414" strokeWidth={5} />
            <Label x={42} y={96} size={17}>{n}</Label>
          </g>
        ))}

        <Label x={1270} y={90} size={34}>faces</Label>
        {FACES.map((f, i) => (
          <g key={f} transform={`translate(${760 + i * 205} 250)`}>
            <circle r={HEAD_R} fill="#ffffff" stroke="#000" strokeWidth={16} />
            <Face kind={f} />
            <OofyHead />
            <Label x={0} y={150} size={22}>{f}</Label>
          </g>
        ))}

        <Label x={1270} y={468} size={34}>poses</Label>
        <Oofy x={790} y={640} scale={0.62} pose={POSE.stand} face="plain" />
        <Oofy x={1000} y={640} scale={0.62} pose={walkPose(0.2, 60)} face="whistle" />
        <Oofy x={1215} y={640} scale={0.62} pose={pose({ armL: limb(-120, -30, -150, -140), armR: limb(120, -70, 150, -170) })} face="scream" />
        <Oofy x={1430} y={640} scale={0.62} pose={POSE.headHold} face="meh" />
        <g transform="rotate(90 1560 800)">
          <Oofy x={1560} y={800 - 335 * 0.62} scale={0.62} pose={POSE.spread} face="shocked" tint={OOFY_TINT.hurt} shadow={false} />
        </g>
        {["stand", "walk", "panic", "dazed", "oof"].map((n, i) => <Label key={n} x={790 + i * 215 + (i === 4 ? 40 : 0)} y={1000} size={22}>{n}</Label>)}
      </svg>
    </AbsoluteFill>
  );
};
