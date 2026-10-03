import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { Bear, Bunny, Cat, type Pose } from "./chars";
import { loadPlayFonts } from "./text";
import song from "./birthday-song.json";
import { backOut, clamp01, FPS, H, Hand, lerp, Pill, ramp, rnd, W } from "./finger-kit";

/**
 * "Send this to a birthday friend" — Mimi sings Happy Birthday.
 *
 * A cake with one candle, Mimi behind it in a party hat. She sings the
 * whole song in a goofy wobbly voice while a big caption pops up on every
 * syllable and the camera cuts between a wide shot and a huge close-up of
 * her mouth. On the last note she blows the candle out and the room
 * explodes in confetti.
 *
 * birthday-song.json is the one source of truth: scripts/build-finger-audio.py
 * reads the same melody and timings, so the voice and the captions agree.
 */

export const BIRTHDAY_FRAMES = Math.round(18.5 * FPS);

/** [syllable, midi note, beats, caption shown while it sounds] */
export type Syl = [string, number, number, string];
const BEAT = 60 / song.bpm;

type Note = { line: number; i: number; t0: number; t1: number; word: string; midi: number };
export const notes = (): Note[] => {
  const out: Note[] = [];
  let t = song.start;
  (song.lines as Syl[][]).forEach((line, li) => {
    line.forEach(([, midi, beats, word], i) => {
      out.push({ line: li, i, t0: t, t1: t + beats * BEAT, word, midi });
      t += beats * BEAT;
    });
    t += song.gap * BEAT;
  });
  return out;
};
const NOTES = notes();
export const SONG_END = NOTES[NOTES.length - 1].t1;
const START = song.start;
const lineStart = (l: number) => NOTES.find((n) => n.line === l)!.t0;

/* the shots: [from, to, kind], cut on the first syllable of each line */
const SHOTS: [number, number, "wide" | "close"][] = [
  [0, lineStart(0), "wide"],
  [lineStart(0), lineStart(1), "wide"],
  [lineStart(1), lineStart(2), "close"],
  [lineStart(2), lineStart(3), "wide"],
  [lineStart(3), SONG_END + 0.3, "close"],
  [SONG_END + 0.3, 18.5, "wide"],
];

/* ------------------------------------------------------------------ */

const Hat: React.FC<{ fill: string; stripe: string }> = ({ fill, stripe }) => (
  <g>
    <path d="M -46 -246 L 0 -352 L 46 -246 Z" fill={fill} stroke="#26202c" strokeWidth={5} strokeLinejoin="round" />
    <path d="M -30 -280 L 30 -280 M -20 -312 L 20 -312" stroke={stripe} strokeWidth={9} strokeLinecap="round" />
    <circle cx={0} cy={-356} r={14} fill="#ffd23a" stroke="#26202c" strokeWidth={4} />
  </g>
);

const Cake: React.FC<{ lit: number; t: number }> = ({ lit, t }) => (
  <g>
    <ellipse cx={540} cy={1700} rx={330} ry={34} fill="#000" opacity={0.12} />
    <path d="M 290 1500 L 790 1500 L 800 1690 Q 540 1730 280 1690 Z" fill="#ff9fc4" stroke="#b0527a" strokeWidth={8} strokeLinejoin="round" />
    <path d="M 290 1500 Q 330 1560 370 1500 Q 410 1560 450 1500 Q 490 1560 530 1500 Q 570 1560 610 1500 Q 650 1560 690 1500 Q 730 1560 770 1500 L 790 1500 L 800 1530 L 280 1530 Z" fill="#ffffff" opacity={0.85} />
    <path d="M 380 1390 L 700 1390 L 710 1505 L 370 1505 Z" fill="#ffe08a" stroke="#c79a28" strokeWidth={8} strokeLinejoin="round" />
    <path d="M 380 1390 Q 410 1440 440 1390 Q 470 1440 500 1390 Q 530 1440 560 1390 Q 590 1440 620 1390 Q 650 1440 680 1390 L 700 1390 L 702 1420 L 378 1420 Z" fill="#ffffff" opacity={0.9} />
    {[[330, 1590], [470, 1610], [610, 1600], [740, 1585]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={14} fill={["#ff5c8a", "#7be0c3", "#8fb4ff", "#ffd23a"][i]} stroke="#ffffff" strokeWidth={4} />
    ))}
    {/* the candle */}
    <rect x={528} y={1296} width={24} height={96} rx={6} fill="#8fb4ff" stroke="#4a6fc0" strokeWidth={5} />
    <path d="M 528 1320 l 24 10 M 528 1344 l 24 10 M 528 1368 l 24 10" stroke="#ffffff" strokeWidth={5} opacity={0.8} />
    {lit > 0 ? (
      <g transform={`translate(540 ${1290}) scale(${1 + 0.12 * Math.sin(t * 22)} ${1 + 0.18 * Math.sin(t * 17)})`} opacity={lit}>
        <path d="M 0 -78 C 30 -40 34 -4 0 4 C -34 -4 -30 -40 0 -78 Z" fill="#ffb02e" stroke="#e8642a" strokeWidth={4} />
        <path d="M 0 -48 C 14 -28 14 -6 0 0 C -14 -6 -14 -28 0 -48 Z" fill="#fff0a6" />
      </g>
    ) : null}
  </g>
);

const Bunting: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <path d="M -20 360 Q 540 470 1100 360" fill="none" stroke="#b0527a" strokeWidth={5} />
    {Array.from({ length: 12 }, (_, i) => {
      const x = 40 + i * 92;
      const y = 360 + Math.sin((x / 1080) * Math.PI) * 78;
      return <path key={i} d={`M ${x - 32} ${y - 4} L ${x + 32} ${y - 4} L ${x} ${y + 76 + Math.sin(t * 3 + i) * 4} Z`} fill={["#ff8fb8", "#ffd23a", "#7be0c3", "#8fb4ff"][i % 4]} stroke="#26202c" strokeWidth={4} strokeLinejoin="round" />;
    })}
  </g>
);

const Confetti: React.FC<{ t: number; from: number }> = ({ t, from }) => {
  const dt = t - from;
  if (dt < 0) return null;
  return (
    <g>
      {Array.from({ length: 90 }, (_, i) => {
        const x = 40 + rnd(i, 41) * 1000;
        const y = -100 + dt * (420 + rnd(i, 42) * 420) + Math.sin(dt * 5 + i) * 34;
        if (y > H + 40) return null;
        return <rect key={i} x={x} y={y} width={16} height={26} fill={["#ff6b81", "#ffd23a", "#5fd3c5", "#9b7bff", "#7bd96a"][i % 5]} transform={`rotate(${i * 37 + dt * 320} ${x} ${y})`} />;
      })}
    </g>
  );
};

/* ------------------------------------------------------------------ */

export const BirthdayShort: React.FC<{ audio?: string | null }> = ({ audio = "audio/play-birthday-mix.mp3" }) => {
  loadPlayFonts();
  const frame = useCurrentFrame();
  const t = frame / FPS;

  const shot = SHOTS.find(([a, b]) => t >= a && t < b) ?? SHOTS[SHOTS.length - 1];
  const close = shot[2] === "close";
  const now = NOTES.find((n) => t >= n.t0 && t < n.t1);
  const singing = !!now;
  const noteK = now ? (t - now.t0) / (now.t1 - now.t0) : 0;
  const lastNote = NOTES[NOTES.length - 1];
  const blowing = t >= lastNote.t1 && t < lastNote.t1 + 0.6;
  const out = t >= lastNote.t1 + 0.25;
  const intro = t < START;

  /* Mimi's face follows the syllables */
  const longNote = now ? now.t1 - now.t0 > 0.55 : false;
  const mimi: Pose = {
    eyes: singing ? (longNote && noteK > 0.2 ? "closed" : "happy") : blowing ? "closed" : intro ? "open" : "happy",
    mouth: singing ? (noteK < 0.82 ? (now!.midi > 74 ? "shout" : "open") : "o") : blowing ? "o" : intro ? "smile" : out ? "grin" : "smile",
    squash: singing ? 1 + 0.045 * Math.sin(noteK * Math.PI) : blowing ? 1.03 : 1,
    tilt: singing ? (now!.line % 2 ? -1 : 1) * 4 * Math.sin(t * 5) : 0,
    armL: singing ? [-52, -60 + Math.sin(t * 7) * 18] : [-24, 42],
    armR: singing ? [52, -60 - Math.sin(t * 7) * 18] : [24, 42],
    wag: Math.sin(t * 8) * 14,
    look: [0, 0],
  };
  const sway = Math.sin(t * 4.2);
  const friend = (even: boolean): Pose => ({
    eyes: out ? "sparkle" : "happy",
    mouth: singing ? "open" : "smile",
    armL: [-52, -70 + sway * (even ? 18 : -18)],
    armR: [52, -70 - sway * (even ? 18 : -18)],
    tilt: sway * (even ? 4 : -4),
    squash: 1 + 0.03 * Math.sin(t * 8 + (even ? 0 : 2)),
  });

  const flame = out ? 1 - ramp(t, lastNote.t1 + 0.25, lastNote.t1 + 0.4) : 1;
  const zoom = close ? lerp(2.5, 2.8, clamp01((t - shot[0]) / (shot[1] - shot[0]))) : 1;

  /* the caption: the word that is sounding, stretched on the long "you" */
  const captionWord = now ? now.word : "";
  const stretched = captionWord === "you" ? "yo" + "u".repeat(1 + Math.floor(noteK * 7)) : captionWord;

  const smoke =
    out
      ? [0, 1, 2].map((i) => {
          const k = clamp01((t - lastNote.t1 - 0.3 - i * 0.12) / 1.4);
          return <circle key={i} cx={540 + Math.sin(k * 9 + i) * 30} cy={1280 - k * 260} r={16 + k * 36} fill="#8a8494" opacity={(1 - k) * 0.7} />;
        })
      : null;

  return (
    <AbsoluteFill style={{ background: "linear-gradient(#cfeeff, #eaf7ff)" }}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g transform={close ? `translate(540 1900) scale(${zoom}) translate(-540 -1650)` : `translate(540 1700) scale(1.2) translate(-540 -1700)`}>
          <rect width={W} height={H} fill="#d9f0ff" />
          {Array.from({ length: 30 }, (_, i) => (
            <circle key={i} cx={rnd(i, 51) * W} cy={rnd(i, 52) * 1300} r={5 + rnd(i, 53) * 9} fill={["#ffffff", "#ffe3ef", "#fff6c9"][i % 3]} opacity={0.7} />
          ))}
          <rect y={1690} width={W} height={H - 1690} fill="#f0cfa0" />
          <rect y={1690} width={W} height={16} fill="#c99a62" />
          {/* the friends, on either side */}
          <g transform="translate(190 1470) scale(1.4)">
            <Bunny {...friend(true)} />
            <Hat fill="#8fb4ff" stripe="#ffffff" />
          </g>
          <g transform="translate(890 1470) scale(-1.4 1.4)">
            <Bear {...friend(false)} />
            <Hat fill="#7be0c3" stripe="#ffffff" />
          </g>
          {/* Mimi, behind the cake */}
          <g transform={`translate(540 ${1400}) scale(1.75)`}>
            <Cat {...mimi} />
            <Hat fill="#ff8fb8" stripe="#ffffff" />
          </g>
          <Cake lit={flame} t={t} />
          {smoke}
          {blowing ? (
            <g stroke="#ffffff" strokeWidth={9} strokeLinecap="round" opacity={0.9}>
              {[0, 1, 2].map((i) => (
                <path key={i} d={`M ${560 + i * 26} ${1228 + i * 22} q 40 ${-6 + i * 8} 80 ${i * 6}`} />
              ))}
            </g>
          ) : null}
        </g>
        {close ? null : <Bunting t={t} />}
        <Confetti t={t} from={lastNote.t1 + 0.3} />
      </svg>
      <Pill text="send this to a birthday friend" y={130} size={46} />
      {singing ? (
        <Hand
          text={stretched}
          y={close ? 1760 : 1790}
          size={close ? 170 : 130}
          fill="#ffffff"
          line="#26202c"
          lineW={close ? 24 : 18}
          family="round"
          scale={0.85 + 0.3 * backOut(noteK * 6) * (1 - 0.3 * noteK)}
          rotate={(now!.line % 2 ? 1 : -1) * 3}
        />
      ) : null}
      {intro ? <Hand text="get ready..." y={1790} size={96} fill="#26202c" line="#ffffff" lineW={14} family="round" opacity={ramp(t, 0.3, 0.7)} /> : null}
      {out ? <Hand text="happy birthday!" y={520} size={118} fill="#ff5c8a" line="#ffffff" lineW={16} family="round" opacity={ramp(t, lastNote.t1 + 0.5, lastNote.t1 + 0.8)} scale={0.8 + 0.2 * backOut((t - lastNote.t1 - 0.5) / 0.4)} /> : null}
    </AbsoluteFill>
  );
};

