import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { INK, loadAkkiFonts } from "../common";
import { Flash, Smear } from "../kit2";
import B from "./beats.json";
import { sstep } from "./parts";
import * as A from "./shots1";
import * as C from "./shots2";
import { ThumbArt } from "./thumb";

/**
 * "This Is Ronan's Biggest Fear" - 15 seconds, AKKI TALKS house style, ORIGINAL cast.
 * Cue frames and shot windows live in beats.json (scripts/build-akki-debt-audio.py reads it too).
 */

export const DEBT_FRAMES = B.frames; // 360 = 15.0s at 24fps

const SHOTS: [string, React.FC][] = [
  ["sea1", A.Shot1a], ["sea2", A.Shot1b], ["draw", A.Shot2draw], ["flash", A.Shot2draw], ["split", A.Shot2split],
  ["walk", A.Shot3a], ["fall", A.Shot3b], ["duel", A.Shot4a], ["face", A.Shot4b], ["calm", A.Shot5a], ["push", A.Shot5b],
  ["receipt", C.Shot6a], ["drain", C.Shot6b], ["run", C.Shot7run], ["water", C.Shot7water], ["lh1", C.Shot7lh1], ["lh2", C.Shot7lh2],
  ["mkt", C.Shot7mkt], ["hide", C.Shot7hide], ["look", C.Shot8], ["point", C.Shot8], ["thumb", C.Shot8], ["grab", C.Shot8drag], ["drag", C.Shot8drag],
  ["pouch", C.Shot9], ["count", C.Shot9], ["turn", C.Shot9], ["freeze", C.Shot9], ["fade", C.Shot9],
];

const S = B.shots as unknown as Record<string, [number, number]>;

const Title: React.FC<{ f: number }> = ({ f }) => {
  if (f >= B.titleUntil) return null;
  const k = Math.min(1, f / 5);
  const pop = k < 1 ? 0.7 + 0.35 * k : 1.0;
  const out = f > B.titleUntil - 6 ? 1 - (f - (B.titleUntil - 6)) / 6 : 1;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: out }}>
      <g transform={`translate(540,250) scale(${pop})`}>
        {[["RONAN'S", 0, 96], ["BIGGEST FEAR?", 96, 76]].map(([t, y, sz]) => (
          <text key={t as string} x={0} y={y as number} textAnchor="middle" fontFamily="Poppins Black" fontSize={sz as number} fill="#fff" stroke={INK} strokeWidth={(sz as number) * 0.2} paintOrder="stroke" strokeLinejoin="round">{t}</text>
        ))}
      </g>
    </svg>
  );
};

export const DebtShort: React.FC<{ audio?: string | null }> = ({ audio }) => {
  loadAkkiFonts();
  const f = useCurrentFrame();
  const hit = SHOTS.find(([k]) => f >= S[k][0] && f < S[k][1]);
  const Cmp = hit ? hit[1] : null;
  return (
    <AbsoluteFill style={{ backgroundColor: "#111" }}>
      {Cmp && <Cmp key={hit![0]} />}
      {f >= S.sea1[0] && f < 6 && null}
      <Title f={f} />
      {([[S.run[0] - 3, 6, 1], [S.lh1[0] - 3, 6, -1], [S.look[0] - 3, 6, 1]] as [number, number, 1 | -1][]).map(([a, n, d], i) => <Smear key={i} at={a} frames={n} dir={d} frame={f} />)}
      <Flash at={B.slash} frames={3} seed={3} frame={f} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};

export const DebtThumb: React.FC = () => { loadAkkiFonts(); return <ThumbArt />; };
export const _u = { Smear, sstep };
