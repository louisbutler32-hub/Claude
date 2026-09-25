import React from "react";
import { AbsoluteFill } from "remotion";
import { CHAR, CHAR_IDS, CHAR_NAME, type Pose } from "./chars";
import { HAND, loadPlayFonts, Marker } from "./text";

/** Model sheet: the four characters, five poses each, plus the type. */
export const PlaySheet: React.FC = () => {
  loadPlayFonts();
  const poses: { label: string; pose: Pose }[] = [
    { label: "rest", pose: {} },
    { label: "cheer", pose: { eyes: "happy", mouth: "open", armL: [-46, -70], armR: [46, -70] } },
    { label: "climb", pose: { armL: [-10, -120], armR: [30, -60], squash: 0.94, look: [0, -1] } },
    { label: "shock", pose: { eyes: "shock", mouth: "o", armL: [-70, -20], armR: [70, -20], tilt: -8 } },
    { label: "dizzy", pose: { eyes: "dizzy", mouth: "flat", armL: [-60, 10], armR: [60, 10], tilt: 6 } },
  ];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#f7f2ec, #e9e2dc)" }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {CHAR_IDS.map((id, r) => {
          const C = CHAR[id];
          return poses.map((p, c) => (
            <g key={`${id}${c}`} transform={`translate(${300 + c * 330} ${300 + r * 250}) scale(0.72)`}>
              <C {...p.pose} />
            </g>
          ));
        })}
        {CHAR_IDS.map((id, r) => (
          <text key={id} x={60} y={210 + r * 250} fontFamily={HAND} fontSize={38} fill="#2b2530">
            {CHAR_NAME[id]}
          </text>
        ))}
        {poses.map((p, c) => (
          <text key={p.label} x={300 + c * 330} y={70} textAnchor="middle" fontFamily={HAND} fontSize={30} fill="#7a7068">
            {p.label}
          </text>
        ))}
      </svg>
      <Marker text="Choose your champion!" size={54} x={1700} y={200} fill="#2b2530" line="#2b2530" lineW={2} />
      <Marker text="3" size={110} x={1700} y={330} fill="#e3363f" line="#ffffff" lineW={10} rotate={-4} />
      <Marker text="GO!" size={100} x={1700} y={470} fill="#e3363f" line="#ffffff" lineW={9} rotate={3} />
      <Marker text="WINNER!" size={96} x={1700} y={620} fill="#f7c948" line="#3a2a10" lineW={10} />
      <div style={{ position: "absolute", left: 1500, top: 700, width: 400, height: 300, background: "#6d5a4b", borderRadius: 20 }} />
      <Marker text="play along with the beat!" size={40} x={1700} y={780} fill="#ffffff" line="#2b2530" lineW={5} />
      <Marker text="BRAVO!!" size={90} x={1700} y={900} fill="#ffffff" line="#2b2530" lineW={9} />
    </AbsoluteFill>
  );
};
