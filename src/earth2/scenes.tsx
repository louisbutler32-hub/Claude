import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { STROKE, W, H, blob, line, ridge, rng } from "../planets/kit";
import { Camera, Reveal, bob } from "../planets/motion";
import {
  AMBER, FAINT, GAS, GREY, INK, NIGHT, PAPER, Paper, RED, ROCK, SKY, WATER,
  CraterLake, GasFlow, House, Strata, Void, Volcano,
} from "../earth/art";
import { Bed, Figure, Pose } from "./figure";
import { Photo, PhotoFull, hasPhoto } from "./photo";

// Scene grammar v2. Three rules, all from docs/format-v2.md:
//
//   1. Something moves while the line is spoken. A scene is never a still
//      with a camera push over it.
//   2. There is a person in it wherever a person makes sense.
//   3. Text is a headline or a number. Never a caption of the narration —
//      the narration is already saying it.

/** Progress 0..1 through the current scene. */
const useP = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return durationInFrames > 1 ? Math.min(1, frame / (durationInFrames - 1)) : 0;
};

/** Eased 0..1, starting `at` and finishing `by` (both in scene progress). */
const ramp = (p: number, at: number, by: number) =>
  Math.max(0, Math.min(1, (p - at) / Math.max(0.0001, by - at)));

export const DARK = new Set([
  "bedroom", "bedroom-under", "floor-goes", "hole", "hole-brother",
  "hole-deputy", "hole-filled", "ground-truth", "ground-truth-2",
  "out", "out-collapse", "out-beams", "out-narrow", "out-2022", "out-ion",
  "out-close", "out-warning", "out-none", "out-none-2", "signoff",
  "sun-aurora", "close-1", "close-2", "close-3",
]);

const dark = (s: string) => DARK.has(s);

/** The one text element. Big, short, and never a transcript of the line. */
const Word: React.FC<{
  children: React.ReactNode; y?: number; size?: number;
  color?: string; delay?: number; sub?: boolean;
}> = ({ children, y = 180, size = 96, color, delay = 0, sub = false }) => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [delay, delay + 8], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return (
    <text
      x={W / 2} y={y} textAnchor="middle" opacity={a}
      fontSize={sub ? size * 0.42 : size}
      fill={color ?? INK}
      style={{ fontFamily: "'ComicRelief', 'Comic Sans MS', cursive", fontWeight: sub ? 400 : 700 }}
    >
      {children}
    </text>
  );
};

/** A number that counts while the line runs. */
const Num: React.FC<{ to: number; x?: number; y?: number; size?: number; suffix?: string; color?: string }> = ({
  to, x = W / 2, y = H / 2, size = 150, suffix = "", color = RED,
}) => {
  const p = useP();
  const v = Math.round(to * (1 - Math.pow(1 - Math.min(1, p / 0.7), 3)));
  return (
    <text
      x={x} y={y} textAnchor="middle" fontSize={size} fill={color}
      style={{ fontFamily: "'ComicRelief', 'Comic Sans MS', cursive", fontWeight: 700 }}
    >
      {v.toLocaleString("en-GB")}{suffix}
    </text>
  );
};

const Ground: React.FC<{ y?: number; fill?: string }> = ({ y = 820, fill = ROCK }) => (
  <path d={`M 0 ${y} ${ridge(0, W, y, 9, 3, 21)} L ${W} ${H} L 0 ${H} Z`} {...line(STROKE)} fill={fill} />
);

/** A gas / ash body that spreads across the frame as the line runs. */
const Spread: React.FC<{ from: number; to: number; y: number; fill: string; op?: number }> = ({
  from, to, y, fill, op = 0.85,
}) => {
  const p = useP();
  const x = interpolate(p, [0, 1], [from, to]);
  const frame = useCurrentFrame();
  return (
    <g opacity={op}>
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={blob(x + i * 110 - 220, y + Math.sin(frame / 9 + i) * 9, 120 + i * 18, 20 + i, 0.12)}
          {...line(0)}
          fill={fill}
        />
      ))}
    </g>
  );
};

const Stars: React.FC<{ n?: number; seed?: number }> = ({ n = 90, seed = 4 }) => {
  const r = rng(seed);
  const frame = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = r() * W, y = r() * H * 0.8, s = 1 + r() * 2.2;
        return <circle key={i} cx={x} cy={y} r={s} fill="#e8e2d6" opacity={0.35 + 0.45 * Math.abs(Math.sin(frame / 26 + i))} />;
      })}
    </g>
  );
};

// ── the scenes ────────────────────────────────────────────────────────

const SCENES: Record<string, React.FC> = {
  // 1 · THE FLOOR
  "bedroom": () => {
    const p = useP();
    return (
      <>
        <Stars n={40} />
        <Ground y={880} fill="#242c39" />
        <Bed x={W / 2} y={880} color="#cfc8ba" />
        <Figure x={W / 2 - 60} y={880 - 66} pose="sleep" scale={0.82} color="#cfc8ba" />
        <Word y={200} size={62} color="#cfc8ba" delay={4}>11:31 pm</Word>
        <g opacity={0.5 + 0.3 * Math.sin(p * 9)}>
          <circle cx={W / 2 + 340} cy={300} r={5} fill="#cfc8ba" />
        </g>
      </>
    );
  },
  "bedroom-under": () => (
    <>
      <Stars n={30} />
      <Ground y={620} fill="#242c39" />
      <Bed x={W / 2} y={620} w={360} color="#cfc8ba" />
      <Figure x={W / 2 - 50} y={620 - 58} pose="sleep" scale={0.72} color="#cfc8ba" />
      <Reveal from="down" delay={6}>
        <Strata y={620} layers={[{ h: 70, fill: "#cfc6b2", label: "carpet" }, { h: 90, fill: "#b9b0a0", label: "concrete" }, { h: 120, fill: "#d8c79c", label: "sand" }, { h: 260, fill: "#a9a08c", label: "limestone" }]} />
      </Reveal>
    </>
  ),
  "strata-sand": () => (
    <>
      <Ground y={420} fill="#242c39" />
      <Reveal from="down" delay={2}>
        <Strata y={420} layers={[{ h: 70, fill: "#cfc6b2", label: "carpet" }, { h: 90, fill: "#b9b0a0", label: "concrete" }, { h: 120, fill: "#d8c79c", label: "sand" }, { h: 260, fill: "#a9a08c", label: "limestone" }]} />
      </Reveal>
    </>
  ),
  "strata-lime": () => {
    const p = useP();
    return (
      <>
        <Ground y={360} fill="#242c39" />
        <Strata y={360} layers={[{ h: 70, fill: "#cfc6b2", label: "carpet" }, { h: 90, fill: "#b9b0a0", label: "concrete" }, { h: 120, fill: "#d8c79c", label: "sand" }, { h: 260, fill: "#a9a08c", label: "limestone" }]} />
        {/* the limestone hollowing out under everything */}
        <g opacity={ramp(p, 0.2, 0.9)}>
          <path d={blob(W / 2, 880, 190 * ramp(p, 0.2, 1), 31, 0.1)} {...line(0)} fill={NIGHT} />
        </g>
        <Word y={H - 70} size={44} color={FAINT} sub delay={10}>forty thousand years</Word>
      </>
    );
  },
  "floor-goes": () => {
    const p = useP();
    return (
      <>
        <Stars n={30} />
        <Ground y={620} fill="#242c39" />
        <Bed x={W / 2} y={620} w={360} color="#cfc8ba" />
        <g transform={`translate(0 ${ramp(p, 0.25, 1) * 520}) rotate(${ramp(p, 0.25, 1) * 22} ${W / 2} 620)`} opacity={1 - ramp(p, 0.75, 1)}>
          <Figure x={W / 2 - 50} y={620 - 58} pose="fall" scale={0.72} color="#cfc8ba" breathe={false} />
        </g>
        <Void x={W / 2} y={620} scale={1.5} open={ramp(p, 0.2, 0.9)} />
      </>
    );
  },
  "hole": () => (
    <>
      <Ground y={700} fill="#242c39" />
      <Void x={W / 2} y={700} scale={1.7} open={1} />
      <Reveal delay={6}><Word y={230} size={78} color="#e8e2d6">6 metres across</Word></Reveal>
    </>
  ),
  "hole-brother": () => {
    const p = useP();
    return (
      <>
        <Ground y={700} fill="#242c39" />
        <Void x={W / 2 + 120} y={700} scale={1.5} open={1} />
        <g transform={`translate(${interpolate(p, [0, 1], [-260, -40])} 0)`}>
          <Figure x={W / 2} y={700} pose="run" scale={0.95} color="#cfc8ba" />
        </g>
      </>
    );
  },
  "hole-deputy": () => {
    const p = useP();
    return (
      <>
        <Ground y={700} fill="#242c39" />
        <Void x={W / 2 + 140} y={700} scale={1.6} open={1} />
        <g transform={`translate(${interpolate(p, [0, 1], [40, -180])} 0)`}>
          <Figure x={W / 2} y={700} pose="flail" scale={0.95} color="#cfc8ba" />
          <Figure x={W / 2 - 90} y={700} pose="run" scale={0.95} color={AMBER} seed={9} />
        </g>
      </>
    );
  },
  "hole-filled": () => (
    <>
      <Ground y={760} fill="#242c39" />
      <g opacity={0.9}>
        <path d={blob(W / 2, 790, 200, 14, 0.09)} {...line(STROKE - 1, "#6f6a60")} fill="#4a463f" />
      </g>
      <Reveal delay={8}><Word y={250} size={62} color="#e8e2d6">gravel</Word></Reveal>
    </>
  ),
  "ground-truth": () => (
    <>
      <Stars n={26} />
      <Ground y={820} fill="#242c39" />
      <Figure x={W / 2} y={820} pose="stand" scale={1.15} color="#cfc8ba" />
      <Reveal delay={5}><Word y={220} size={70} color="#e8e2d6">no crack</Word></Reveal>
      <Reveal delay={16}><Word y={330} size={70} color="#e8e2d6">no creak</Word></Reveal>
    </>
  ),
  "ground-truth-2": () => (
    <>
      <Ground y={820} fill="#242c39" />
      <Strata y={300} layers={[{ h: 70, fill: "#cfc6b2", label: "carpet" }, { h: 90, fill: "#b9b0a0", label: "concrete" }, { h: 120, fill: "#d8c79c", label: "sand" }, { h: 260, fill: "#a9a08c", label: "limestone" }]} />
      <Reveal delay={6}><Word y={190} size={64} color="#e8e2d6">it just stops holding</Word></Reveal>
    </>
  ),
  "keep-going": () => {
    const p = useP();
    return (
      <>
        <Paper />
        <Ground y={860} />
        <g transform={`translate(${interpolate(p, [0, 1], [-200, 260])} 0)`}>
          <Figure x={W / 2} y={860} pose="run" scale={1.1} />
        </g>
      </>
    );
  },

  // 2 · THE LAKE
  "shore": () => (
    <>
      <Paper fill={SKY} />
      <CraterLake x={W / 2} y={700} scale={1.15} charge={0} />
      <Figure x={330} y={868} pose="look" scale={1.05} />
    </>
  ),
  "lake-deep": () => (
    <>
      <Paper fill={SKY} />
      <CraterLake x={W / 2} y={700} scale={1.15} charge={0} />
      <Reveal delay={4}><Word y={200} size={86} color={INK}>200 m deep</Word></Reveal>
    </>
  ),
  "lake-gas": () => <><Paper fill={SKY} /><CraterLake x={W / 2} y={700} scale={1.15} charge={0.35} /></>,
  "lake-charge": () => <><Paper fill={SKY} /><CraterLake x={W / 2} y={700} scale={1.15} charge={0.8} /></>,
  "lake-shake": () => {
    const p = useP();
    return (
      <>
        <Paper fill={SKY} />
        <g transform={`translate(${Math.sin(p * 40) * 7} 0)`}><CraterLake x={W / 2} y={700} scale={1.15} charge={0.9} /></g>
      </>
    );
  },
  "lake-flip": () => {
    const p = useP();
    return (
      <>
        <Paper fill={SKY} />
        <CraterLake x={W / 2} y={700} scale={1.15} charge={1} />
        <Spread from={W / 2} to={W / 2} y={700 - ramp(p, 0, 1) * 240} fill={GAS} />
      </>
    );
  },
  "lake-column": () => {
    const p = useP();
    return (
      <>
        <Paper fill={SKY} />
        <CraterLake x={W / 2} y={700} scale={1.15} charge={1} />
        <g opacity={0.9}>
          <path
            d={`M ${W / 2 - 150} 760 L ${W / 2 - 110} ${760 - ramp(p, 0, 1) * 640} L ${W / 2 + 110} ${760 - ramp(p, 0, 1) * 640} L ${W / 2 + 150} 760 Z`}
            {...line(0)} fill={GAS} opacity={0.75}
          />
        </g>
        <Reveal delay={10}><Word y={160} size={64}>100 m</Word></Reveal>
      </>
    );
  },
  "lake-heavy": () => (
    <>
      <Paper fill={SKY} />
      <Ground y={760} />
      <GasFlow level={0.4} y={760} />
      <Reveal delay={6}><Word y={190} size={66}>heavier than air</Word></Reveal>
    </>
  ),
  "lake-villages": () => {
    const p = useP();
    return (
      <>
        <Paper fill={SKY} />
        <Ground y={790} />
        <House x={520} y={790} scale={0.9} />
        <House x={1180} y={790} scale={1.05} />
        <House x={1520} y={790} scale={0.8} />
        <Spread from={-200} to={W + 200} y={735} fill={GAS} />
        <Reveal delay={12}><Word y={170} size={58}>70 km/h</Word></Reveal>
      </>
    );
  },
  "lake-breath": () => {
    const p = useP();
    return (
      <>
        <Paper fill={SKY} />
        <Ground y={860} />
        <GasFlow level={0.55} y={860} />
        <Figure x={W / 2} y={860} pose="stand" scale={1.2} taken={ramp(p, 0.45, 1) * 0.85} />
      </>
    );
  },
  "lake-toll": () => (
    <>
      <Paper fill={SKY} />
      <Ground y={880} />
      <GasFlow level={0.5} y={880} />
      <Num to={1746} y={430} size={190} />
      <Word y={540} size={40} color={GREY} sub delay={14}>people</Word>
    </>
  ),
  "lake-slept": () => (
    <>
      <Paper fill={SKY} />
      <Ground y={880} />
      <GasFlow level={0.45} y={880} />
      <Reveal delay={4}><Word y={380} size={76} color={INK}>almost nobody woke up</Word></Reveal>
    </>
  ),
  "lake-three": () => {
    const p = useP();
    return (
      <>
        <Paper />
        {["Nyos", "Monoun", "Kivu"].map((n, i) => (
          <g key={n} opacity={ramp(p, 0.1 + i * 0.22, 0.35 + i * 0.22)}>
            <path d={blob(430 + i * 530, 520, 130, 20 + i, 0.07)} {...line(STROKE)} fill={WATER} />
            <text x={430 + i * 530} y={740} textAnchor="middle" fontSize={46} fill={INK}
              style={{ fontFamily: "'ComicRelief', 'Comic Sans MS', cursive" }}>{n}</text>
          </g>
        ))}
      </>
    );
  },
  "lake-kivu": () => {
    const p = useP();
    return (
      <>
        <Paper />
        <path d={blob(430, 560, 90, 20, 0.07)} {...line(STROKE)} fill={WATER} />
        <text x={430} y={720} textAnchor="middle" fontSize={40} fill={GREY}
          style={{ fontFamily: "'ComicRelief', 'Comic Sans MS', cursive" }}>Nyos</text>
        <path d={blob(1300, 540, 90 + ramp(p, 0.1, 0.9) * 260, 22, 0.06)} {...line(STROKE)} fill={WATER} />
        <text x={1300} y={900} textAnchor="middle" fontSize={52} fill={INK}
          style={{ fontFamily: "'ComicRelief', 'Comic Sans MS', cursive" }}>Kivu</text>
        <Reveal delay={16}><Word y={170} size={60} color={RED}>2 million people</Word></Reveal>
      </>
    );
  },
  "lake-pipes": () => (
    <>
      <Paper fill={SKY} />
      <CraterLake x={W / 2} y={700} scale={1.15} charge={0.2} />
      <Photo slug="crater-lake" x={1180} y={120} w={620} h={400} seed={11} />
    </>
  ),

  // 3 · THE HILL
  "hill": () => (
    <>
      <Paper fill={SKY} />
      <Ground y={880} />
      <Volcano x={1300} y={880} scale={1.1} flow={0.2} />
      <Figure x={430} y={880} pose="look" scale={1.05} />
    </>
  ),
  "hill-smoke": () => (
    <>
      <Paper fill={SKY} />
      <Ground y={880} />
      <Volcano x={1300} y={880} scale={1.1} flow={0.6} />
      <House x={430} y={880} scale={0.9} />
      <House x={660} y={880} scale={0.8} />
    </>
  ),
  "hill-election": () => (
    <>
      <Paper fill={SKY} />
      <Ground y={880} />
      <Volcano x={1400} y={880} scale={1.0} flow={0.7} />
      <Photo slug="pyroclastic" x={180} y={210} w={700} h={470} seed={5} />
      <Word y={150} size={44} color={GREY} sub>Saint-Pierre, 1902</Word>
    </>
  ),
  "hill-collapse": () => {
    const p = useP();
    return (
      <>
        <Paper fill={SKY} />
        <g transform={`translate(${Math.sin(p * 55) * 9} 0)`}>
          <Ground y={880} />
          <Volcano x={1300} y={880} scale={1.1} flow={1} />
        </g>
      </>
    );
  },
  "hill-flow": () => (
    <>
      <Paper fill={SKY} />
      <PhotoFull slug="volcano-plume" push={0.09} />
      <Reveal delay={6}><Word y={180} size={78} color="#ffffff">not lava</Word></Reveal>
    </>
  ),
  "hill-flow-2": () => (
    <>
      <Paper fill={SKY} />
      <Ground y={880} />
      <Volcano x={1300} y={880} scale={1.1} flow={0.4} />
      <Reveal delay={6}><Word y={190} size={86} color={RED}>1,000 °C</Word></Reveal>
    </>
  ),
  "hill-speed": () => {
    const p = useP();
    return (
      <>
        <Paper fill={SKY} />
        <Ground y={880} />
        <House x={340} y={880} scale={0.85} />
        <House x={560} y={880} scale={0.95} />
        <Volcano x={1500} y={880} scale={1.0} flow={1} />
        <Spread from={W + 200} to={-300} y={800} fill="#8a8378" />
        <Reveal delay={10}><Word y={170} size={62} color={RED}>600 km/h</Word></Reveal>
      </>
    );
  },
  "hill-instant": () => (
    <>
      <Paper fill={SKY} />
      <Ground y={880} />
      <Spread from={W} to={-200} y={790} fill="#8a8378" />
      <Reveal delay={8}><Word y={200} size={66}>too fast to burn</Word></Reveal>
    </>
  ),
  "hill-hercul": () => (
    <>
      <Paper />
      <Ground y={900} fill="#b6ac98" />
      <Reveal delay={4}><Word y={260} size={62}>brain tissue</Word></Reveal>
      <Reveal delay={14}><Word y={380} size={86} color={RED}>turned to glass</Word></Reveal>
    </>
  ),
  "hill-glass": () => {
    const p = useP();
    return (
      <>
        <Paper />
        <g>
          <path d={`M 360 700 L ${360 + ramp(p, 0, 0.5) * 1200} 700`} {...line(STROKE + 2, RED)} />
          <path d={`M 360 700 L 360 ${700 - ramp(p, 0.1, 0.55) * 380}`} {...line(STROKE, GREY)} />
        </g>
        <Word y={220} size={56}>up, then straight back down</Word>
      </>
    );
  },
  "hill-toll": () => (
    <>
      <Paper fill={SKY} />
      <Ground y={900} fill="#8a8378" />
      <Num to={28000} y={440} size={180} />
      <Word y={550} size={40} color={GREY} sub delay={16}>in under a minute</Word>
    </>
  ),
  "hill-survivor": () => (
    <>
      <Paper />
      <Ground y={880} fill="#8a8378" />
      {/* the cell */}
      <path d={`M 760 480 L 1160 480 L 1160 880 L 760 880 Z`} {...line(STROKE + 1)} fill="#5c564c" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${900 + i * 40} 560 L ${900 + i * 40} 640`} {...line(STROKE - 1, "#e8e2d6")} />
      ))}
      <Figure x={960} y={860} pose="stand" scale={0.9} color="#e8e2d6" />
      <Reveal delay={10}><Word y={220} size={62}>two survived</Word></Reveal>
    </>
  ),
  "hill-cell": () => (
    <>
      <Paper />
      <Ground y={880} fill="#8a8378" />
      <path d={`M 760 480 L 1160 480 L 1160 880 L 760 880 Z`} {...line(STROKE + 1)} fill="#5c564c" />
      <Figure x={960} y={860} pose="sleep" scale={0.9} color="#e8e2d6" />
      <Reveal delay={8}><Word y={230} size={56} color={GREY}>locked up the night before</Word></Reveal>
    </>
  ),
  "hill-circus": () => (
    <>
      <Paper fill={SKY} />
      <Ground y={880} />
      <Figure x={W / 2} y={880} pose="point" scale={1.25} />
      <Reveal delay={10}><Word y={210} size={66} color={AMBER}>he toured with a circus</Word></Reveal>
    </>
  ),

  // 4 · THE BASIN
  "basin": () => (
    <>
      <Paper fill={SKY} />
      <Ground y={900} fill="#7d8a6a" />
      <path d={`M 300 700 L 1620 700 L 1620 900 L 300 900 Z`} {...line(STROKE)} fill={WATER} />
      <Figure x={220} y={900} pose="look" scale={1.0} />
    </>
  ),
  "basin-calm": () => (
    <>
      <Paper fill={SKY} />
      <Ground y={900} fill="#7d8a6a" />
      <path d={`M 300 700 L 1620 700 L 1620 900 L 300 900 Z`} {...line(STROKE)} fill={WATER} />
      <Reveal delay={8}><Word y={230} size={58} color={GREY}>a still day</Word></Reveal>
    </>
  ),
  "basin-lisbon": () => {
    const p = useP();
    return (
      <>
        <Paper />
        <Ground y={900} fill="#b6ac98" />
        <g transform={`translate(${Math.sin(p * 60) * 12} 0)`}>
          <House x={1400} y={900} scale={1.2} tilt={ramp(p, 0.3, 1) * 22} />
          <House x={1620} y={900} scale={1.0} tilt={-ramp(p, 0.4, 1) * 16} />
        </g>
        <Word y={200} size={54} color={GREY} sub>Lisbon, 1755</Word>
        <Reveal delay={14}><Word y={300} size={62} color={RED}>2,000 km away</Word></Reveal>
      </>
    );
  },
  "basin-wave": () => {
    const p = useP();
    const r = ramp(p, 0, 1);
    return (
      <>
        <Paper fill={SKY} />
        <Ground y={900} fill="#7d8a6a" />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={1700} cy={880} r={200 + r * 900 + i * 180} {...line(2, FAINT)} fill="none" opacity={0.5} />
        ))}
        <Figure x={300} y={900} pose="stand" scale={1.0} />
      </>
    );
  },
  "basin-match": () => {
    const p = useP();
    const a = Math.sin(p * 16) * 26;
    return (
      <>
        <Paper />
        <path d={`M ${W / 2} 200 L ${W / 2 + Math.sin((a * Math.PI) / 180) * 420} ${200 + Math.cos((a * Math.PI) / 180) * 420}`} {...line(STROKE - 1, GREY)} />
        <circle cx={W / 2 + Math.sin((a * Math.PI) / 180) * 420} cy={200 + Math.cos((a * Math.PI) / 180) * 420} r={44} {...line(STROKE)} fill={WATER} />
        <Word y={150} size={50} color={GREY} sub>the loch has a rhythm</Word>
      </>
    );
  },
  "basin-push": () => {
    const p = useP();
    const a = Math.sin(p * 16) * (10 + ramp(p, 0, 1) * 34);
    return (
      <>
        <Paper />
        <path d={`M ${W / 2} 200 L ${W / 2 + Math.sin((a * Math.PI) / 180) * 420} ${200 + Math.cos((a * Math.PI) / 180) * 420}`} {...line(STROKE - 1, GREY)} />
        <circle cx={W / 2 + Math.sin((a * Math.PI) / 180) * 420} cy={200 + Math.cos((a * Math.PI) / 180) * 420} r={44} {...line(STROKE)} fill={WATER} />
        <Reveal delay={12}><Word y={H - 120} size={54} color={RED}>same rhythm, every time</Word></Reveal>
      </>
    );
  },
  "basin-slosh": () => {
    const p = useP();
    const tilt = Math.sin(p * 12) * 60;
    return (
      <>
        <Paper fill={SKY} />
        <Ground y={920} fill="#7d8a6a" />
        <path d={`M 300 ${740 + tilt} L 1620 ${740 - tilt} L 1620 920 L 300 920 Z`} {...line(STROKE)} fill={WATER} />
        <Figure x={220} y={920} pose="flail" scale={1.0} />
      </>
    );
  },
  "basin-obs": () => {
    const p = useP();
    const tilt = Math.sin(p * 10) * 50;
    return (
      <>
        <Paper fill={SKY} />
        <Ground y={920} fill="#7d8a6a" />
        <path d={`M 300 ${740 + tilt} L 1620 ${740 - tilt} L 1620 920 L 300 920 Z`} {...line(STROKE)} fill={WATER} />
        <Word y={190} size={52} color={GREY} sub>Scotland, 1755</Word>
      </>
    );
  },
  "basin-norway": () => {
    const p = useP();
    const tilt = Math.sin(p * 11) * 44;
    return (
      <>
        <Paper fill={SKY} />
        <Ground y={920} fill="#6d7a66" />
        <path d={`M 300 ${740 + tilt} L 1620 ${740 - tilt} L 1620 920 L 300 920 Z`} {...line(STROKE)} fill={WATER} />
        <Reveal delay={10}><Word y={190} size={58}>30 minutes later</Word></Reveal>
      </>
    );
  },
  "basin-moor": () => {
    const p = useP();
    return (
      <>
        <Paper fill={SKY} />
        <Ground y={920} fill="#6d7a66" />
        <path d={`M 0 760 L ${W} 760 L ${W} 920 L 0 920 Z`} {...line(STROKE)} fill={WATER} />
        <g transform={`translate(${interpolate(p, [0, 1], [0, 420])} ${Math.sin(p * 14) * 22})`}>
          <path d={blob(700, 730, 78, 9, 0.1)} {...line(STROKE)} fill="#c8bfa8" />
        </g>
      </>
    );
  },

  // 5 · THE CONTINENT
  "cont": () => (
    <>
      <Paper />
      <Strata y={280} layers={[{ h: 70, fill: "#cfc6b2", label: "carpet" }, { h: 90, fill: "#b9b0a0", label: "concrete" }, { h: 120, fill: "#d8c79c", label: "sand" }, { h: 260, fill: "#a9a08c", label: "limestone" }]} />
      <Reveal delay={6}><Word y={180} size={62}>under the continent</Word></Reveal>
    </>
  ),
  "cont-chamber": () => {
    const p = useP();
    return (
      <>
        <Paper />
        <Ground y={480} fill="#9a8f7d" />
        <path d={blob(W / 2, 800, 200 + ramp(p, 0, 1) * 300, 44, 0.07)} {...line(STROKE)} fill={RED} opacity={0.8} />
        <Reveal delay={14}><Word y={200} size={54} color={GREY} sub>the size of a county</Word></Reveal>
      </>
    );
  },
  "cont-toba": () => (
    <>
      <Paper />
      <PhotoFull slug="caldera" push={0.08} />
      <Reveal delay={8}><Word y={170} size={58} color="#ffffff">74,000 years ago</Word></Reveal>
    </>
  ),
  "cont-myth": () => (
    <>
      <Paper />
      <Reveal delay={4}><Word y={H / 2 - 40} size={82} color={RED}>and here is the bit</Word></Reveal>
      <Reveal delay={14}><Word y={H / 2 + 80} size={82} color={RED}>that isn't true</Word></Reveal>
    </>
  ),
  "cont-bottleneck": () => {
    const p = useP();
    return (
      <>
        <Paper />
        <g>
          {Array.from({ length: 24 }, (_, i) => (
            <g key={i} opacity={i < 22 ? 1 - ramp(p, 0.25, 0.85) : 1}>
              <Figure x={220 + (i % 12) * 130} y={480 + Math.floor(i / 12) * 300} pose="stand" scale={0.5} seed={i} breathe={false} color={GREY} />
            </g>
          ))}
        </g>
      </>
    );
  },
  "cont-genome": () => {
    const p = useP();
    return (
      <>
        <Paper />
        {/* a flat line where the crash was supposed to be */}
        <path d={`M 200 600 L ${200 + ramp(p, 0, 0.8) * 1520} 600`} {...line(STROKE + 1, INK)} />
        <Reveal delay={16}><Word y={430} size={56} color={GREY}>no crash in the genome</Word></Reveal>
      </>
    );
  },
  "cont-real": () => (
    <>
      <Paper />
      <Reveal delay={4}><Word y={420} size={62}>the eruption: real</Word></Reveal>
      <Reveal delay={16}><Word y={560} size={62} color={RED}>the near-extinction: not</Word></Reveal>
    </>
  ),
  "cont-warning": () => (
    <>
      <Paper />
      <Ground y={820} />
      <Volcano x={W / 2} y={820} scale={1.3} flow={0.15} />
    </>
  ),
  "cont-months": () => (
    <>
      <Paper />
      <Ground y={820} />
      <Volcano x={W / 2} y={820} scale={1.3} flow={0.3} />
      <Reveal delay={8}><Word y={200} size={90} color={AMBER}>months</Word></Reveal>
    </>
  ),
  "cont-swarm": () => {
    const p = useP();
    return (
      <>
        <Paper />
        <Ground y={820} />
        <Volcano x={W / 2} y={820 - ramp(p, 0.2, 1) * 40} scale={1.3} flow={0.4} />
        {Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx={420 + i * 80} cy={940} r={4 + Math.abs(Math.sin(p * 20 + i)) * 14}
            fill={RED} opacity={0.6} />
        ))}
      </>
    );
  },
  "cont-irony": () => (
    <>
      <Paper />
      <Ground y={880} />
      <Volcano x={1420} y={880} scale={1.1} flow={0.35} />
      <Figure x={420} y={880} pose="run" scale={1.1} />
      <Reveal delay={12}><Word y={200} size={58}>you could walk away</Word></Reveal>
    </>
  ),

  // 6 · THE SUN
  "sun": () => (
    <>
      <Paper fill={NIGHT} />
      <Stars n={70} />
      <PhotoFull slug="solar-flare" push={0.06} />
    </>
  ),
  "sun-cme": () => (
    <>
      <Paper fill={NIGHT} />
      <PhotoFull slug="cme" push={0.08} />
      <Reveal delay={8}><Word y={150} size={62} color="#ffffff">a billion tonnes</Word></Reveal>
    </>
  ),
  "sun-1859": () => (
    <>
      <Paper />
      <circle cx={W / 2} cy={520} r={250} {...line(STROKE)} fill={AMBER} />
      <path d={blob(W / 2 + 90, 470, 54, 8, 0.12)} {...line(STROKE - 1)} fill="#7a5a20" />
      <Word y={H - 140} size={50} color={GREY} sub>1 September 1859</Word>
    </>
  ),
  "sun-aurora": () => (
    <>
      <Paper fill={NIGHT} />
      <PhotoFull slug="aurora" push={0.07} />
      <Reveal delay={10}><Word y={160} size={58} color="#ffffff">17 hours later</Word></Reveal>
    </>
  ),
  "sun-telegraph": () => (
    <>
      <Paper />
      <Photo slug="telegraph" x={140} y={160} w={760} h={720} seed={6} />
      <Reveal delay={10}><Word y={330} size={54} color={RED}>sparks</Word></Reveal>
    </>
  ),
  "sun-disconnect": () => {
    const p = useP();
    return (
      <>
        <Paper />
        <Photo slug="telegraph" x={120} y={200} w={640} h={600} seed={6} credit={false} />
        <g opacity={ramp(p, 0.3, 0.8)}>
          <Word y={300} size={56} color={RED}>batteries off</Word>
          <Word y={420} size={56} color={AMBER}>still sending</Word>
        </g>
      </>
    );
  },
  "sun-1859-grid": () => (
    <>
      <Paper />
      <Num to={120000} y={480} size={150} color={GREY} />
      <Word y={600} size={40} color={GREY} sub delay={16}>miles of wire, 1859</Word>
    </>
  ),
  "sun-now": () => {
    const p = useP();
    const r = rng(3);
    return (
      <>
        <Paper fill={NIGHT} />
        <g>
          {Array.from({ length: 70 }, (_, i) => {
            const x = r() * W, y = 200 + r() * 700;
            return <circle key={i} cx={x} cy={y} r={3} fill={AMBER} opacity={ramp(p, i / 140, i / 140 + 0.2)} />;
          })}
        </g>
      </>
    );
  },
  "sun-transformer": () => (
    <>
      <Paper />
      <Photo slug="grid" x={480} y={150} w={960} h={740} seed={4} />
    </>
  ),
  "sun-lead": () => (
    <>
      <Paper />
      <Photo slug="grid" x={120} y={220} w={700} h={560} seed={4} credit={false} />
      <Reveal delay={8}><Word y={380} size={72} color={RED}>a year to replace</Word></Reveal>
    </>
  ),
  "sun-17": () => (
    <>
      <Paper />
      <Num to={17} y={520} size={230} color={AMBER} />
      <Word y={640} size={44} color={GREY} sub delay={18}>hours of warning</Word>
    </>
  ),
  "sun-what": () => (
    <>
      <Paper />
      <Reveal delay={4}><Word y={420} size={58}>enough to switch a grid off</Word></Reveal>
      <Reveal delay={18}><Word y={560} size={58} color={RED}>not enough to rewire a country</Word></Reveal>
    </>
  ),

  // 7 · OUTSIDE
  "out": () => (<><Paper fill={NIGHT} /><Stars n={140} /></>),
  "out-collapse": () => {
    const p = useP();
    return (
      <>
        <Paper fill={NIGHT} />
        <Stars n={100} />
        <circle cx={W / 2} cy={H / 2} r={interpolate(p, [0, 1], [210, 22])} fill="#dfe6ef" />
      </>
    );
  },
  "out-beams": () => {
    const p = useP();
    const L = ramp(p, 0, 0.7) * 900;
    return (
      <>
        <Paper fill={NIGHT} />
        <Stars n={100} />
        <path d={`M ${W / 2} ${H / 2} L ${W / 2 - 70} ${H / 2 - L} L ${W / 2 + 70} ${H / 2 - L} Z`} fill="#9fc2e0" opacity={0.8} />
        <path d={`M ${W / 2} ${H / 2} L ${W / 2 - 70} ${H / 2 + L} L ${W / 2 + 70} ${H / 2 + L} Z`} fill="#9fc2e0" opacity={0.8} />
        <circle cx={W / 2} cy={H / 2} r={20} fill="#ffffff" />
      </>
    );
  },
  "out-narrow": () => (
    <>
      <Paper fill={NIGHT} />
      <Stars n={90} />
      <path d={`M ${W / 2} ${H / 2} L ${W / 2 - 60} 60 L ${W / 2 + 60} 60 Z`} fill="#9fc2e0" opacity={0.85} />
      <Reveal delay={10}><Word y={H - 150} size={58} color="#e8e2d6">narrow — that is the only reason</Word></Reveal>
    </>
  ),
  "out-2022": () => (
    <>
      <Paper fill={NIGHT} />
      <PhotoFull slug="deep-space" push={0.07} />
      <Reveal delay={10}><Word y={150} size={54} color="#ffffff">October 2022</Word></Reveal>
    </>
  ),
  "out-ion": () => (
    <>
      <Paper fill={NIGHT} />
      <Stars n={80} />
      <Word y={440} size={120} color="#e8e2d6">1.9 billion</Word>
      <Word y={560} size={46} color={FAINT} sub delay={14}>light years away</Word>
    </>
  ),
  "out-close": () => {
    const p = useP();
    return (
      <>
        <Paper fill={NIGHT} />
        <Stars n={60} />
        <circle cx={W / 2} cy={620} r={190} {...line(STROKE, "#6f8fae")} fill="#28405a" />
        <path d={`M ${W / 2 - 190} 620 A 190 190 0 0 1 ${W / 2 + 190} 620`} {...line(STROKE + 3, RED)} fill="none"
          opacity={ramp(p, 0.3, 0.9)} />
        <Reveal delay={16}><Word y={220} size={56} color="#e8e2d6">ozone, one hemisphere</Word></Reveal>
      </>
    );
  },
  "out-warning": () => (
    <>
      <Paper fill={NIGHT} />
      <Stars n={70} />
      <Reveal delay={4}><Word y={H / 2} size={74} color="#e8e2d6">the warning is the light</Word></Reveal>
    </>
  ),
  "out-none": () => (
    <>
      <Paper fill={NIGHT} />
      <Stars n={70} />
      <Reveal delay={4}><Word y={H / 2 - 30} size={64} color={FAINT}>light arrives with itself</Word></Reveal>
    </>
  ),
  "out-none-2": () => (
    <>
      <Paper fill={NIGHT} />
      <Stars n={70} />
      <Reveal delay={4}><Word y={H / 2} size={100} color={RED}>no warning</Word></Reveal>
    </>
  ),

  // CLOSE
  "close-1": () => {
    const p = useP();
    const items = ["ground", "lake", "hill", "water", "rock", "star", "outside"];
    return (
      <>
        <Paper fill={NIGHT} />
        <Stars n={60} />
        {items.map((s, i) => (
          <text key={s} x={W / 2} y={220 + i * 106} textAnchor="middle" fontSize={58}
            fill={i === 6 ? RED : "#e8e2d6"} opacity={ramp(p, i * 0.1, i * 0.1 + 0.18)}
            style={{ fontFamily: "'ComicRelief', 'Comic Sans MS', cursive" }}>{s}</text>
        ))}
      </>
    );
  },
  "close-2": () => (
    <>
      <Paper fill={NIGHT} />
      <Stars n={60} />
      <Figure x={W / 2} y={820} pose="stand" scale={1.2} color="#cfc8ba" />
      <Reveal delay={6}><Word y={260} size={58} color="#e8e2d6">most of it never will</Word></Reveal>
    </>
  ),
  "close-3": () => (
    <>
      <Paper fill={NIGHT} />
      <Stars n={60} />
      <Figure x={W / 2} y={820} pose="look" scale={1.2} color="#cfc8ba" />
      <Reveal delay={6}><Word y={250} size={54} color={FAINT}>but somewhere, roughly on schedule</Word></Reveal>
    </>
  ),
  "signoff": () => (
    <>
      <Paper fill={NIGHT} />
      <Stars n={50} />
      <Bed x={W / 2} y={880} color="#cfc8ba" />
      <Figure x={W / 2 - 60} y={880 - 66} pose="sleep" scale={0.82} color="#cfc8ba" />
      <Reveal delay={8}><Word y={250} size={70} color="#e8e2d6">sleep well</Word></Reveal>
    </>
  ),

  // added for density — the script was running short and the gap scaler
  // would otherwise have stretched every pause to nearly a second.
  "rain-acid": () => {
    const p = useP();
    const r = rng(17);
    return (
      <>
        <Paper fill={NIGHT} />
        <Ground y={880} fill="#242c39" />
        {Array.from({ length: 34 }, (_, i) => {
          const x = r() * W;
          const y = ((r() * H + p * 900 + i * 40) % (H + 120)) - 60;
          return <path key={i} d={`M ${x} ${y} L ${x - 6} ${y + 34}`} {...line(3, "#7fa8c4")} />;
        })}
        <Reveal delay={10}><Word y={230} size={58} color="#e8e2d6">slightly acidic</Word></Reveal>
      </>
    );
  },
  "lime-dissolve": () => {
    const p = useP();
    return (
      <>
        <Paper fill={NIGHT} />
        <Ground y={420} fill="#242c39" />
        <path d={blob(W / 2, 760, 150 + ramp(p, 0, 1) * 210, 33, 0.09)} {...line(0)} fill={NIGHT} />
        <Word y={H - 90} size={44} color={FAINT} sub delay={8}>it never stops</Word>
      </>
    );
  },
  "hill-density": () => {
    const p = useP();
    return (
      <>
        <Paper fill={SKY} />
        <Ground y={880} />
        <Volcano x={1400} y={880} scale={1.0} flow={1} />
        <Spread from={W} to={W / 2} y={810} fill="#8a8378" />
        <Reveal delay={10}><Word y={190} size={58}>denser than air</Word></Reveal>
      </>
    );
  },
  "basin-resonance": () => {
    const p = useP();
    const a = Math.sin(p * 13) * 34;
    const b = Math.sin(p * 5) * 34;
    return (
      <>
        <Paper />
        <path d={`M 200 ${520 + a} L 820 ${520 - a} L 820 660 L 200 660 Z`} {...line(STROKE)} fill={WATER} />
        <text x={510} y={740} textAnchor="middle" fontSize={44} fill={GREY}
          style={{ fontFamily: "'ComicRelief', 'Comic Sans MS', cursive" }}>a bath</text>
        <path d={`M 1100 ${520 + b} L 1720 ${520 - b} L 1720 660 L 1100 660 Z`} {...line(STROKE)} fill={WATER} />
        <text x={1410} y={740} textAnchor="middle" fontSize={44} fill={GREY}
          style={{ fontFamily: "'ComicRelief', 'Comic Sans MS', cursive" }}>a loch</text>
      </>
    );
  },
  "basin-why": () => (
    <>
      <Paper />
      <Reveal delay={4}><Word y={H / 2 - 20} size={110}>seiche</Word></Reveal>
      <Reveal delay={16}><Word y={H / 2 + 110} size={46} color={GREY} sub>no wave. no tsunami. no local quake.</Word></Reveal>
    </>
  ),
  "sun-fails": () => {
    const p = useP();
    const items = ["water", "fuel", "payments", "refrigeration"];
    return (
      <>
        <Paper fill={NIGHT} />
        {items.map((n, i) => (
          <text key={n} x={W / 2} y={330 + i * 130} textAnchor="middle" fontSize={68}
            fill={ramp(p, 0.12 + i * 0.18, 0.3 + i * 0.18) > 0.5 ? "#4a4640" : "#e8e2d6"}
            style={{ fontFamily: "'ComicRelief', 'Comic Sans MS', cursive" }}>{n}</text>
        ))}
      </>
    );
  },
  "sun-order": () => {
    const p = useP();
    return (
      <>
        <Paper />
        <Photo slug="grid" x={1180} y={240} w={620} h={520} seed={4} credit={false} />
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i} opacity={ramp(p, i * 0.08, i * 0.08 + 0.2)}>
            <Figure x={200 + (i % 5) * 130} y={520 + Math.floor(i / 5) * 300} pose="stand" scale={0.55} seed={i} breathe={false} />
          </g>
        ))}
        <Reveal delay={18}><Word y={180} size={54} color={RED}>all at once</Word></Reveal>
      </>
    );
  },
  "out-odds": () => {
    const p = useP();
    return (
      <>
        <Paper fill={NIGHT} />
        <Stars n={70} />
        <path d={`M ${W / 2} 40 L ${W / 2 - 48} ${40 + ramp(p, 0, 0.8) * 1000} L ${W / 2 + 48} ${40 + ramp(p, 0, 0.8) * 1000} Z`}
          fill="#9fc2e0" opacity={0.85} />
        <circle cx={W / 2} cy={880} r={70} {...line(STROKE, "#6f8fae")} fill="#28405a" />
      </>
    );
  },
};

export const renderScene = (name: string) => {
  const S = SCENES[name];
  if (!S) return <Paper />;
  return (
    <Camera push={0.03} seconds={7}>
      <S />
    </Camera>
  );
};

export const KNOWN = new Set(Object.keys(SCENES));
