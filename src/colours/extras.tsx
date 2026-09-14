import React from "react";
import { Body, Face } from "../guess/art";
import type { GuessArt } from "../guess/types";

/**
 * The two pieces of art this episode needs that don't already exist
 * elsewhere in the cast.
 */

/** The finale hero — every colour in one arc, so it needs its own art
 *  rather than borrowing a single-hue character. */
export const RainbowArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      {/* six concentric bands, widest (outermost) drawn first */}
      {[
        ["#e04a4a", 108],
        ["#ef8a3c", 92],
        ["#f3c93f", 76],
        ["#4a9450", 60],
        ["#3f83bd", 44],
        ["#8b58b3", 28],
      ].map(([colour, r], i) => (
        <path
          key={i}
          d={`M ${-(r as number)} 20 A ${r} ${r} 0 0 1 ${r} 20`}
          fill="none"
          stroke={colour as string}
          strokeWidth={15}
          strokeLinecap="round"
        />
      ))}
      <g fill="#ffffff">
        <ellipse cx={-104} cy={26} rx={26} ry={16} />
        <ellipse cx={104} cy={26} rx={26} ry={16} />
        <ellipse cx={-86} cy={10} rx={20} ry={13} />
        <ellipse cx={86} cy={10} rx={20} ry={13} />
      </g>
      {!sil ? <Face cy={-6} gap={16} eye={0.6} blush={false} /> : null}
    </g>
  </Body>
);

/** The "black" round's second friend. */
export const BlackCatArt: GuessArt = ({ sil }) => (
  <Body sil={sil}>
    <g>
      <path d="M -50 -60 L -66 -100 L -28 -76 Z" fill="#1a1a1a" stroke="#000000" strokeWidth={4} strokeLinejoin="round" />
      <path d="M 50 -60 L 66 -100 L 28 -76 Z" fill="#1a1a1a" stroke="#000000" strokeWidth={4} strokeLinejoin="round" />
      <circle cx={0} cy={-30} r={70} fill="#1a1a1a" stroke="#000000" strokeWidth={5} />
      <path d="M 44 10 Q 90 20 84 60 Q 78 78 60 66 Q 70 40 40 28 Z" fill="#1a1a1a" stroke="#000000" strokeWidth={4} strokeLinejoin="round" />
      {!sil ? (
        <>
          <path d="M -30 -34 q 6 -8 12 0 M 18 -34 q 6 -8 12 0" stroke="#f4c95e" strokeWidth={3} fill="none" strokeLinecap="round" />
          <g stroke="#3a3a3a" strokeWidth={2.5} strokeLinecap="round">
            <path d="M -18 -6 l -34 -6 M -18 0 l -34 8 M 18 -6 l 34 -6 M 18 0 l 34 8" />
          </g>
        </>
      ) : null}
      {!sil ? <Face cy={-28} gap={22} eye={0.8} blush={false} color="#f4c95e" /> : null}
    </g>
  </Body>
);
