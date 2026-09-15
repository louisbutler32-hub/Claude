import React from "react";
import { AbsoluteFill } from "remotion";
import { FaceKind, POSE, walkPose } from "./figure";
import { loadMinecraftFonts } from "./fonts";
import { Pebblo, PEBBLO_TINT } from "./pebblo";
import { Item } from "./pixels";

/** The character on one page: every face, the main poses, the tints. */
const FACES: FaceKind[] = ["plain", "smile", "happy", "joy", "grin", "worried", "gritted", "frown", "meh", "sly", "scheming", "thinking", "surprised", "whistle", "shocked", "scream", "crying", "side"];

export const PebbloSheet: React.FC = () => {
  loadMinecraftFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#f4efe6" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <text x={60} y={78} fontFamily="Selawik, sans-serif" fontSize={54} fill="#222">
          Pebblo — faces
        </text>
        {FACES.map((f, i) => (
          <g key={f}>
            <Pebblo x={140 + (i % 9) * 205} y={200 + Math.floor(i / 9) * 250} scale={0.62} pose={POSE.stand} face={f} />
            <text x={140 + (i % 9) * 205} y={392 + Math.floor(i / 9) * 250} textAnchor="middle" fontFamily="Selawik, sans-serif" fontSize={24} fill="#555">
              {f}
            </text>
          </g>
        ))}
        <text x={60} y={720} fontFamily="Selawik, sans-serif" fontSize={54} fill="#222">
          poses and tints
        </text>
        <Pebblo x={160} y={870} scale={0.62} pose={POSE.mine} face="plain" hands={({ R }) => <Item name="pickaxe" x={R[0] + 50} y={R[1] - 40} px={9} rotate={-10} />} />
        <Pebblo x={370} y={870} scale={0.62} pose={walkPose(0.2, 90)} face="smile" />
        <Pebblo x={580} y={870} scale={0.62} pose={POSE.cheeks} face="joy" armsOverHead />
        <Pebblo x={790} y={870} scale={0.62} pose={POSE.up} face="happy" />
        <Pebblo x={1000} y={870} scale={0.62} pose={POSE.headHold} face="shocked" />
        <Pebblo x={1210} y={870} scale={0.62} pose={POSE.out} face="scream" />
        <Pebblo x={1420} y={870} scale={0.62} pose={POSE.spread} face="hurt" tint={PEBBLO_TINT.hurt} />
        <Pebblo x={1630} y={870} scale={0.62} pose={POSE.chin} face="thinking" armsOverHead tint={PEBBLO_TINT.dim} />
        <Pebblo x={1810} y={870} scale={0.62} pose={POSE.stand} face="crying" tint={PEBBLO_TINT.warm} />
      </svg>
    </AbsoluteFill>
  );
};
