import React from "react";
import { AbsoluteFill } from "remotion";
import { HandDrawn } from "../../minecraft/handdrawn";
import { INK } from "../common";
import { Characters, pose, Scene } from "../kit2";
import { Mira, Ronan } from "../kit3";
import { Drawn, PaperStream } from "./parts";
import { Z as _Z } from "./shots1";
import { TREMBLE } from "./poses";

/** the thumbnail: Ronan terrified, tiny Mira with the receipt behind him, lower-third text */
export const ThumbArt: React.FC = () => {
  const sc = 2.5;
  const p = pose({ ...TREMBLE, head: [0, -884], tilt: 4 });
  return (
    <AbsoluteFill style={{ background: "#111" }}>
      <Scene plate="sunsetdock" fit={{ zoom: 1.3, x: 150 }} light="sunset" dof={0.8} vignette={0.7}>
        <HandDrawn hold={1} grain={0.3} boil={0.5}>
          <Drawn>
            {() => [
              <_Z key="m" z={1}><Mira pose={pose({ ...TREMBLE, hL: "hold", hR: "hold" })} face="cold" x={880} y={1250} s={0.42} /></_Z>,
              <_Z key="p" z={1}><PaperStream from={[840, 1000]} t={2} dir={-1} len={600} w={30} sag={160} /></_Z>,
              <_Z key="r" z={3}><Ronan pose={p} face="terror" x={470} y={760 + 884 * 1.06 * sc * 1.04 + 20} s={sc} lw={1.5} t={0.5} wind={0.4} shadow={false} bellAmp={0} /></_Z>,
            ]}
          </Drawn>
        </HandDrawn>
      </Scene>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <rect y={1380} width={1080} height={540} fill="rgba(0,0,0,0.35)" />
        <text x={540} y={1560} textAnchor="middle" fontFamily="Poppins Black" fontSize={170} fill="#fff" stroke={INK} strokeWidth={34} paintOrder="stroke" strokeLinejoin="round">RONAN'S</text>
        <text x={540} y={1720} textAnchor="middle" fontFamily="Poppins Black" fontSize={104} fill="#ffd62a" stroke={INK} strokeWidth={22} paintOrder="stroke" strokeLinejoin="round">BIGGEST FEAR?!</text>
      </svg>
    </AbsoluteFill>
  );
};
export const _t = { Characters };
