import React from "react";
import { AbsoluteFill } from "remotion";
import { CHAR, CHAR_IDS, CHAR_NAME, type Pose } from "./chars";
import { HAND, loadPlayFonts } from "./text";

/** Model sheet: the four characters in the poses the Shorts use. */
export const PlaySheet: React.FC = () => {
  loadPlayFonts();
  const poses: { label: string; pose: Pose }[] = [
    { label: "rest", pose: {} },
    { label: "cheer", pose: { eyes: "happy", mouth: "open", armL: [-66, -110], armR: [66, -110] } },
    { label: "sing", pose: { eyes: "closed", mouth: "open", armL: [-54, -40], armR: [46, 10] } },
    { label: "angry", pose: { eyes: "angry", mouth: "shout", armL: [-70, -20], armR: [70, -20], fx: "anger", tilt: -6 } },
    { label: "shock", pose: { eyes: "shock", mouth: "o", armL: [-78, -80], armR: [78, -80], fx: "shock" } },
    { label: "win", pose: { eyes: "sparkle", mouth: "grin", armL: [-72, -100], armR: [72, -100], wag: 16 } },
    { label: "climb (back)", pose: { back: true, handL: [-18, -280], handR: [18, -258], wag: -10 } },
  ];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#fbf7f2, #ece5de)" }}>
      <svg width={2400} height={1500} style={{ position: "absolute", inset: 0 }}>
        {CHAR_IDS.map((id, r) => {
          const C = CHAR[id];
          return poses.map((p, c) => (
            <g key={`${id}${c}`} transform={`translate(${330 + c * 300} ${440 + r * 330}) scale(0.82)`}>
              <C {...p.pose} />
            </g>
          ));
        })}
        {CHAR_IDS.map((id, r) => (
          <text key={id} x={40} y={340 + r * 330} fontFamily={HAND} fontSize={40} fontWeight={700} fill="#2b2530">
            {CHAR_NAME[id]}
          </text>
        ))}
        {CHAR_IDS.map((id, r) => (
          <text key={`${id}s`} x={40} y={384 + r * 330} fontFamily={HAND} fontSize={28} fill="#7a7068">
            {id}
          </text>
        ))}
        {poses.map((p, c) => (
          <text key={p.label} x={330 + c * 300} y={60} textAnchor="middle" fontFamily={HAND} fontSize={30} fill="#7a7068">
            {p.label}
          </text>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
