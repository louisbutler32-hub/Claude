import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { H, W } from "../minecraft/beats";
import { ease, FaceKind, Figure, limb, POSE, pose } from "../minecraft/figure";
import { loadMinecraftFonts } from "../minecraft/fonts";
import { Sword } from "../minecraft/mobs";
import { Item } from "../minecraft/pixels";

/**
 * The connective tissue for the long-form compilation: an intro, five
 * short chapter cards (one per Short being compiled), a "how it's made"
 * segment, a "vote for the next one" segment, and an outro. Each renders
 * to its own small mp4 (via its own Composition below) and
 * scripts/make-minecraft-longform.py stitches them around the five
 * already-rendered Shorts with embedded chapter marks.
 *
 * All 1080x1920 to match the Shorts being compiled — the whole channel is
 * vertical, and switching just this one upload to 16:9 would need a
 * completely different set of background art. Running past three minutes
 * once everything is joined is what keeps it out of the Shorts shelf
 * rather than the frame shape.
 */

const NAVY = "#1f2a44";
const ORANGE = "#ff7b1f";
const BG = "#7fb7ff";

const Panel: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = BG }) => (
  <AbsoluteFill style={{ backgroundColor: bg }}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      {children}
    </svg>
  </AbsoluteFill>
);

const Stamp: React.FC<{ x: number; y: number; size?: number; fill?: string; stroke?: string }> = ({ x, y, size = 64, fill = "#ffffff", stroke = "#141414" }) => (
  <g fontFamily="Silkscreen, monospace" fontSize={size} textAnchor="middle">
    <text x={x} y={y} fill={fill} stroke={stroke} strokeWidth={size * 0.1} paintOrder="stroke">
      {""}
    </text>
  </g>
);

/* ------------------------------------------------------------------ */
/* Intro                                                                */
/* ------------------------------------------------------------------ */

export const INTRO_FRAMES = 420; // 14s

export const LongIntro: React.FC<{ audio?: string | null }> = ({ audio = null }) => {
  loadMinecraftFonts();
  const f = useCurrentFrame();
  const pop = ease(f, 0, 20);
  const listIn = (i: number) => ease(f, 40 + i * 12, 60 + i * 12);
  const items: { label: string; color: string }[] = [
    { label: "digging straight down", color: "#5fe6e0" },
    { label: "PvP, Java vs Bedrock", color: "#e05555" },
    { label: "a creeper's side of the story", color: "#3f8b48" },
    { label: "the Nether, first time", color: "#ff8a2a" },
    { label: "a house that didn't survive", color: "#c9a15a" },
  ];
  const outT = ease(f, 380, 414);
  return (
    <Panel>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <rect x={0} y={0} width={W} height={H} fill={BG} opacity={1 - outT} />
      <g transform={`translate(0 ${-outT * 200})`}>
        <text x={540} y={220 - (1 - pop) * 60} textAnchor="middle" fontFamily="Silkscreen, monospace" fontSize={92} fill="#ffffff" stroke="#141414" strokeWidth={10} paintOrder="stroke" opacity={pop}>
          5 RELATABLE
        </text>
        <text x={540} y={330 - (1 - pop) * 60} textAnchor="middle" fontFamily="Silkscreen, monospace" fontSize={92} fill={ORANGE} stroke="#141414" strokeWidth={10} paintOrder="stroke" opacity={pop}>
          MINECRAFT MOMENTS
        </text>
        <g transform="translate(220 480)">
          {items.map((it, i) => {
            const t = listIn(i);
            return (
              <g key={it.label} opacity={t} transform={`translate(${(1 - t) * -60} ${i * 150})`}>
                <rect x={0} y={0} width={44} height={44} rx={10} fill={it.color} stroke="#141414" strokeWidth={7} />
                <text x={70} y={34} fontFamily="Selawik, sans-serif" fontSize={40} fill="#141414">
                  {it.label}
                </text>
              </g>
            );
          })}
        </g>
        <g transform={`translate(540 1650) scale(${1 + Math.sin(f / 10) * 0.03})`}>
          <Figure x={0} y={0} scale={1.5} pose={pose({ armR: limb(96, -30, 70, -150), armL: limb(-80, 60, -96, 130) })} face="joy" hands={({ R }) => <Sword x={R[0] + 30} y={R[1] - 60} px={8} rotate={-20} />} />
        </g>
      </g>
    </Panel>
  );
};

/* ------------------------------------------------------------------ */
/* Chapter cards                                                       */
/* ------------------------------------------------------------------ */

export const CHAPTER_FRAMES = 120; // 4s

const ChapterCard: React.FC<{ n: number; title: string; sub: string; bg: string; accent: string }> = ({ n, title, sub, bg, accent }) => {
  loadMinecraftFonts();
  const f = useCurrentFrame();
  const pop = ease(f, 0, 16);
  const outT = ease(f, 96, 120);
  return (
    <Panel bg={bg}>
      <g opacity={1 - outT} transform={`translate(0 ${outT * -80})`}>
        <circle cx={540} cy={640} r={220 * pop} fill={accent} stroke="#141414" strokeWidth={14} />
        <text x={540} y={680} textAnchor="middle" fontFamily="Silkscreen, monospace" fontSize={180} fill="#ffffff" opacity={pop}>
          {n}
        </text>
        <text x={540} y={1020} textAnchor="middle" fontFamily="Selawik, sans-serif" fontSize={72} fontWeight={700} fill="#ffffff" opacity={pop}>
          {title}
        </text>
        <text x={540} y={1100} textAnchor="middle" fontFamily="Selawik, sans-serif" fontSize={38} fill="#ffffff" opacity={pop * 0.85}>
          {sub}
        </text>
      </g>
    </Panel>
  );
};

export const Chapter1Card: React.FC<{ audio?: string | null }> = ({ audio }) => (
  <>
    {audio ? <Audio src={staticFile(audio)} /> : null}
    <ChapterCard n={1} title="Dig Straight Down" sub="never a good idea" bg="#4a4a4a" accent="#5fe6e0" />
  </>
);
export const Chapter2Card: React.FC<{ audio?: string | null }> = ({ audio }) => (
  <>
    {audio ? <Audio src={staticFile(audio)} /> : null}
    <ChapterCard n={2} title="Java vs Bedrock" sub="the PvP everyone argues about" bg="#7fb7ff" accent="#e05555" />
  </>
);
export const Chapter3Card: React.FC<{ audio?: string | null }> = ({ audio }) => (
  <>
    {audio ? <Audio src={staticFile(audio)} /> : null}
    <ChapterCard n={3} title="You vs The Creeper" sub="he just wanted a hug" bg="#4c9a4a" accent="#e0555a" />
  </>
);
export const Chapter4Card: React.FC<{ audio?: string | null }> = ({ audio }) => (
  <>
    {audio ? <Audio src={staticFile(audio)} /> : null}
    <ChapterCard n={4} title="First Time in the Nether" sub="it did not go well" bg="#2a1512" accent="#ff8a2a" />
  </>
);
export const Chapter5Card: React.FC<{ audio?: string | null }> = ({ audio }) => (
  <>
    {audio ? <Audio src={staticFile(audio)} /> : null}
    <ChapterCard n={5} title="Building the Perfect House" sub="then losing it" bg="#6ba264" accent="#c9a15a" />
  </>
);

/* ------------------------------------------------------------------ */
/* Behind the build                                                     */
/* ------------------------------------------------------------------ */

export const CAST_FRAMES = 600; // 20s

const SLIDES = [
  { at: 0, title: "BEHIND THE BUILD", body: "No footage. No filters.\nEvery frame here is drawn in code." },
  { at: 200, title: "MEET THE CAST", body: "Round head, thick outlines,\nand a face that actually changes." },
  { at: 400, title: "ONE RIG, EVERY SCENE", body: "Same poses, same walk cycle —\nthe overworld, the Nether, all of it." },
];

export const LongCast: React.FC<{ audio?: string | null }> = ({ audio = null }) => {
  loadMinecraftFonts();
  const f = useCurrentFrame();
  const slide = SLIDES.reduce((cur, s) => (f >= s.at ? s : cur), SLIDES[0]);
  const local = f - slide.at;
  const pop = ease(local, 0, 16);
  const faceRow: { mood: FaceKind; label: string }[] = [
    { mood: "happy", label: "happy" },
    { mood: "worried", label: "worried" },
    { mood: "shocked", label: "shocked" },
    { mood: "joy", label: "joy" },
    { mood: "gritted", label: "angry" },
  ];
  return (
    <Panel bg="#efe8d8">
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <text x={540} y={220} textAnchor="middle" fontFamily="Silkscreen, monospace" fontSize={62} fill="#141414" opacity={pop}>
        {slide.title}
      </text>
      {slide.body.split("\n").map((line, i) => (
        <text key={i} x={540} y={320 + i * 56} textAnchor="middle" fontFamily="Selawik, sans-serif" fontSize={40} fill="#3a3a3a" opacity={pop}>
          {line}
        </text>
      ))}
      {slide.at === 0 && (
        <g transform="translate(540 900)" opacity={pop}>
          <Figure x={0} y={0} scale={2.1} pose={POSE.stand} face="plain" />
        </g>
      )}
      {slide.at === 200 && (
        <g transform="translate(540 1000)" opacity={pop}>
          <Figure x={0} y={0} scale={2.4} pose={POSE.cheeks} face="joy" armsOverHead />
        </g>
      )}
      {slide.at === 400 && (
        <g opacity={pop}>
          {faceRow.map((r, i) => (
            <g key={r.label} transform={`translate(${210 + i * 165} 950)`}>
              <Figure x={0} y={0} scale={0.85} pose={POSE.stand} face={r.mood} />
              <text x={0} y={220} textAnchor="middle" fontFamily="Selawik, sans-serif" fontSize={26} fill="#555">
                {r.label}
              </text>
            </g>
          ))}
        </g>
      )}
    </Panel>
  );
};

/* ------------------------------------------------------------------ */
/* Vote for the next one                                               */
/* ------------------------------------------------------------------ */

export const VOTE_FRAMES = 600; // 20s

const CONCEPTS = [
  { at: 0, title: "THE ENDER DRAGON FIGHT", body: "crystals, a near-death dodge,\nthe final blow — a whole boss fight", color: "#3a1a5c" },
  { at: 200, title: "THE VILLAGER TRADING SAGA", body: "one emerald, a whole farm,\nthen the market crashes", color: "#8a5a2e" },
  { at: 400, title: "THE OCEAN MONUMENT RAID", body: "guardians, light shafts,\nan actual objective this time", color: "#0e5a6b" },
];

export const LongVote: React.FC<{ audio?: string | null }> = ({ audio = null }) => {
  loadMinecraftFonts();
  const f = useCurrentFrame();
  const c = CONCEPTS.reduce((cur, s) => (f >= s.at ? s : cur), CONCEPTS[0]);
  const local = f - c.at;
  const pop = ease(local, 0, 16);
  const header = ease(f, 0, 20);
  return (
    <Panel bg={c.color}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <text x={540} y={170} textAnchor="middle" fontFamily="Silkscreen, monospace" fontSize={54} fill="#ffffff" opacity={header}>
        VOTE FOR EPISODE 6
      </text>
      <text x={540} y={620} textAnchor="middle" fontFamily="Silkscreen, monospace" fontSize={54} fill="#ffffff" opacity={pop}>
        {c.title}
      </text>
      {c.body.split("\n").map((line, i) => (
        <text key={i} x={540} y={696 + i * 50} textAnchor="middle" fontFamily="Selawik, sans-serif" fontSize={36} fill="#ffffffcc" opacity={pop}>
          {line}
        </text>
      ))}
      <g transform="translate(540 1380)" opacity={pop}>
        <Figure x={0} y={0} scale={1.4} pose={POSE.stand} face="thinking" />
      </g>
      <text x={540} y={1680} textAnchor="middle" fontFamily="Selawik, sans-serif" fontSize={34} fill="#ffffff" opacity={header}>
        comment your pick below
      </text>
    </Panel>
  );
};

/* ------------------------------------------------------------------ */
/* Outro                                                                */
/* ------------------------------------------------------------------ */

export const OUTRO_FRAMES = 480; // 16s

export const LongOutro: React.FC<{ audio?: string | null }> = ({ audio = null }) => {
  loadMinecraftFonts();
  const f = useCurrentFrame();
  const pop = ease(f, 0, 20);
  const bellRing = Math.sin(Math.max(0, f - 120) / 3) * (f > 120 && f < 200 ? 8 : 0);
  return (
    <Panel>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <text x={540} y={260} textAnchor="middle" fontFamily="Silkscreen, monospace" fontSize={70} fill="#ffffff" stroke="#141414" strokeWidth={9} paintOrder="stroke" opacity={pop}>
        NEW SHORTS
      </text>
      <text x={540} y={350} textAnchor="middle" fontFamily="Silkscreen, monospace" fontSize={70} fill={ORANGE} stroke="#141414" strokeWidth={9} paintOrder="stroke" opacity={pop}>
        EVERY WEEK
      </text>
      <g transform="translate(540 800)" opacity={pop}>
        <Figure x={0} y={0} scale={1.5} pose={POSE.cheeks} face="joy" armsOverHead />
      </g>
      <g transform={`translate(880 300) rotate(${bellRing})`} opacity={pop}>
        <path d="M-26,-32 q26,-26 52,0 v36 h4 v11 h-60 v-11 h4 z" fill="#ffe27a" stroke="#141414" strokeWidth={7} />
        <circle cx={0} cy={24} r={8} fill="#ffe27a" stroke="#141414" strokeWidth={5} />
      </g>
      <text x={540} y={1420} textAnchor="middle" fontFamily="Selawik, sans-serif" fontSize={44} fontWeight={700} fill="#141414" opacity={pop}>
        Subscribe + tap the bell
      </text>
      <text x={540} y={1500} textAnchor="middle" fontFamily="Selawik, sans-serif" fontSize={34} fill="#141414" opacity={pop}>
        which one was your favorite?
      </text>
      <text x={540} y={1550} textAnchor="middle" fontFamily="Selawik, sans-serif" fontSize={34} fill="#141414" opacity={pop}>
        tell me in the comments
      </text>
    </Panel>
  );
};
