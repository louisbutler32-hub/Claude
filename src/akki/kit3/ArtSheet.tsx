import React from "react";
import { AbsoluteFill } from "remotion";
import { HandDrawn } from "../../minecraft/handdrawn";
import { INK, loadAkkiFonts } from "../common";
import { Boss, Characters, POSES, pose, Scene, SeaKing } from "../kit2";
import { Duelist, Guard, Mira, Ronan, RonanHead, MiraHead } from "./index";

const Label: React.FC<{ x: number; y: number; text: string; size?: number }> = ({ x, y, text, size = 20 }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily="Poppins Black" fontSize={size} fill="#fff" stroke={INK} strokeWidth={size * 0.22} paintOrder="stroke" strokeLinejoin="round">{text}</text>
);

/** the original cast — design sheet (1920x1080) */
export const Kit3ArtSheet: React.FC = () => {
  loadAkkiFonts();
  const faceR = ["calm", "smirk", "narrow", "terror", "drained", "proud", "wink", "yawn"] as const;
  const faceM = ["sweet", "cold", "furious", "counting", "smug"] as const;
  return (
    <Scene plate="harbour2" light="warm" dof={0.8} vignette={0.6}>
      <AbsoluteFill style={{ background: "rgba(10,10,20,0.35)" }} />
      <HandDrawn hold={1} grain={0.3} boil={0.5}>
        <Characters>
          <Ronan pose={POSES.stand} face="calm" x={150} y={470} s={0.5} />
          <Ronan pose={POSES.walk2} face="smirk" x={420} y={470} s={0.5} t={0.3} wind={1.6} />
          <Ronan pose={pose({ ...POSES.stand, elR: [180, -640], haR: [210, -480], hR: "hold" })} sword="hand" swordRot={-62} face="narrow" x={720} y={470} s={0.5} />
          <Mira pose={POSES.stand} face="sweet" x={900} y={470} s={0.5} />
          <Mira pose={pose({ ...POSES.armsFolded, elR: [150, -650], haR: [150, -520], hR: "hold" })} prop="clipboard" face="cold" x={1060} y={470} s={0.5} />
          <Mira pose={POSES.run2} face="furious" x={1220} y={470} s={0.5} />
          <Guard pose={POSES.stand} face="blank" x={1390} y={470} s={0.5} />
          <Duelist pose={pose({ ...POSES.stand, turn: -0.6, shR: [100, -784], elR: [-60, -700], haR: [-180, -700], hR: "hold" })} rapierRot={190} face="cold" x={1560} y={470} s={0.5} />
          <Boss pose={POSES.stand} face="grin" x={1730} y={470} s={0.5} />
          {faceR.map((f, i) => <g key={f} transform={`translate(${110 + i * 120},620) scale(0.8)`}><RonanHead face={f} lw={4} drained={f === "drained"} ink={f === "drained" ? "#5a5e68" : INK} /></g>)}
          {faceM.map((f, i) => <g key={f} transform={`translate(${1130 + i * 130},620) scale(0.8)`}><MiraHead face={f} lw={4} /></g>)}
          <SeaKing x={1500} y={1000} s={0.2} jaw={30} />
        </Characters>
      </HandDrawn>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {["RONAN", "RONAN walk", "RONAN cleaver", "MIRA", "MIRA clipboard", "MIRA run", "GUARD", "DUELIST", "THE BOSS"].map((t, i) => <Label key={t} x={[150, 420, 720, 900, 1060, 1220, 1390, 1560, 1730][i]} y={510} text={t} size={18} />)}
        <Label x={500} y={720} text={faceR.join(" · ")} size={16} />
        <Label x={1400} y={720} text={faceM.join(" · ")} size={16} />
        <Label x={960} y={40} text="KIT 3 — original cast" size={30} />
      </svg>
    </Scene>
  );
};
