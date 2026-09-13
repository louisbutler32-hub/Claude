import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { H, Note, SceneFade, STROKE, W, line } from "../planets/kit";
import { Camera, Counter, DrawOn, Progress, Reveal, bob } from "../planets/motion";
import {
  AMBER,
  Basin,
  Burst,
  CraterLake,
  FAINT,
  Figure,
  GAS,
  GREY,
  GasFlow,
  House,
  INK,
  NIGHT,
  PAPER,
  Paper,
  RED,
  ROCK,
  Readout,
  SKY,
  Strata,
  Sun,
  Transformer,
  Void,
  Volcano,
  WATER,
  smooth,
} from "./art";

type Scene = React.FC;

// Every scene is wrapped so that nothing is ever a still frame: a slow camera
// move underneath, staggered entrances on top. The `warn` value rides along in
// the corner all the way through, because it is the spine of the video.

const WARN: Record<string, { n: number; label: string }> = {
  a: { n: 1, label: "no warning" },
  b: { n: 2, label: "seconds" },
  c: { n: 3, label: "no warning" },
  d: { n: 4, label: "~30 minutes" },
  e: { n: 5, label: "~17 hours" },
  f: { n: 6, label: "months" },
  g: { n: 7, label: "none at all" },
};

/** The standard scene: camera move, headline, body, caption. */
const Beat: React.FC<{
  head?: string;
  caption?: string;
  children?: React.ReactNode;
  bg?: string;
  push?: number;
  drift?: [number, number];
  headColor?: string;
  capColor?: string;
}> = ({ head, caption, children, bg = PAPER, push = 0.04, drift, headColor = INK, capColor = GREY }) => (
  <SceneFade>
    <Paper fill={bg} />
    <Camera push={push} drift={drift}>
      {children}
    </Camera>
    {head ? (
      <Reveal from="down" distance={18}>
        <Note x={W / 2} y={250} size={54} color={headColor}>
          {head}
        </Note>
      </Reveal>
    ) : null}
    {caption ? (
      <Reveal delay={10} from="up" distance={16}>
        <Note x={W / 2} y={1010} size={40} color={capColor}>
          {caption}
        </Note>
      </Reveal>
    ) : null}
  </SceneFade>
);

/** The number card each chapter opens on. */
const Chapter: React.FC<{ n: number; word: string; bg?: string; children?: React.ReactNode }> = ({
  n,
  word,
  bg = PAPER,
  children,
}) => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Paper fill={bg} />
      <Camera push={0.06}>{children}</Camera>
      <Reveal from="none">
        <Note x={W / 2} y={560} size={300} color={INK}>
          {n}
        </Note>
      </Reveal>
      <Reveal delay={6} from="up" distance={24}>
        <Note x={W / 2} y={700} size={86} color={RED}>
          {word}
        </Note>
      </Reveal>
      <g opacity={Math.min(1, frame / 10)}>
        <path d={`M ${W / 2 - 200} 620 l 400 0`} {...line(5, FAINT)} />
      </g>
    </SceneFade>
  );
};

/** The recurring verdict: how much notice this one gives you. */
const Verdict: React.FC<{ value: string; note?: string; bg?: string }> = ({
  value,
  note,
  bg = PAPER,
}) => (
  <SceneFade>
    <Paper fill={bg} />
    <Camera push={0.03}>
      <Reveal from="none">
        <Note x={W / 2} y={420} size={38} color={GREY}>
          WARNING GIVEN
        </Note>
      </Reveal>
      <Reveal delay={6} from="down" distance={26}>
        <Note x={W / 2} y={560} size={116} color={RED}>
          {value}
        </Note>
      </Reveal>
      <Reveal delay={14}>
        <path d={`M ${W / 2 - 300} 620 l 600 0`} {...line(5, FAINT)} />
      </Reveal>
    </Camera>
    {note ? (
      <Reveal delay={18} from="up">
        <Note x={W / 2} y={760} size={42} color={GREY}>
          {note}
        </Note>
      </Reveal>
    ) : null}
  </SceneFade>
);

// ── cold open ───────────────────────────────────────────────────────

const NyosCold: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Paper fill={NIGHT} />
      <Camera push={0.09} seconds={4}>
        <Strata y={880} layers={[{ h: 240, fill: "#2a3442" }]} />
        <CraterLake x={W / 2} y={760} scale={0.78} charge={1} rising />
      </Camera>
      <Reveal delay={4} from="down" distance={22}>
        <Note x={W / 2} y={200} size={62} color="#e8e2d6">
          August 1986. Cameroon.
        </Note>
      </Reveal>
      <g opacity={Math.min(1, frame / 30) * 0.4}>
        <rect x={0} y={0} width={W} height={H} fill={GAS} />
      </g>
    </SceneFade>
  );
};

const NyosCold2: Scene = () => (
  <SceneFade>
    <Paper fill={NIGHT} />
    <Camera push={0.05}>
      <GasFlow level={0.9} y={1080} fill="#8fa383" />
    </Camera>
    <Counter x={W / 2} y={560} to={1746} size={230} color="#f0ebe0" frames={34} />
    <Reveal delay={30} from="up">
      <Note x={W / 2} y={660} size={48} color="#b9b2a4">
        dead by morning
      </Note>
    </Reveal>
  </SceneFade>
);

const NyosCold3: Scene = () => (
  <SceneFade>
    <Paper fill={NIGHT} />
    <Camera push={0.04}>
      <Reveal from="none">
        <Note x={W / 2} y={560} size={88} color="#f0ebe0">
          Almost none of them woke up.
        </Note>
      </Reveal>
    </Camera>
  </SceneFade>
);

const Title: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Paper />
      <Camera push={0.04}>
        <Reveal from="down" distance={30}>
          <Note x={W / 2} y={440} size={96} color={INK}>
            7 ways the ground you are
          </Note>
          <Note x={W / 2} y={560} size={96} color={INK}>
            standing on can kill you
          </Note>
        </Reveal>
      </Camera>
      <g opacity={Math.min(1, Math.max(0, (frame - 18) / 12))}>
        {[...Array(7)].map((_, i) => (
          <circle key={i} cx={W / 2 - 180 + i * 60} cy={700} r={12} fill={i === 0 ? RED : FAINT} />
        ))}
      </g>
    </SceneFade>
  );
};

const WarningClock: Scene = () => (
  <SceneFade>
    <Paper />
    <Camera push={0.05}>
      <Reveal from="none">
        <Note x={W / 2} y={420} size={44} color={GREY}>
          ranked by
        </Note>
        <Note x={W / 2} y={560} size={120} color={RED}>
          how much warning
        </Note>
        <Note x={W / 2} y={690} size={120} color={RED}>
          you get
        </Note>
      </Reveal>
    </Camera>
  </SceneFade>
);

// ── 1 · the lake ────────────────────────────────────────────────────

const One: Scene = () => (
  <Chapter n={1} word="THE LAKE">
    <CraterLake x={W / 2} y={1040} scale={0.5} charge={0.7} />
  </Chapter>
);

const NyosMap: Scene = () => (
  <Beat head="Lake Nyos sits in a volcanic crater." caption="north-west Cameroon">
    <CraterLake x={W / 2} y={820} scale={0.95} charge={0.2} />
  </Beat>
);

const NyosCharge: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <Beat head="Magma underneath leaks carbon dioxide in." caption="the weight of the lake keeps it dissolved">
      <CraterLake x={W / 2} y={820} scale={0.95} charge={Math.min(1, frame / 70)} />
      {[0, 1, 2].map((i) => (
        <DrawOn
          key={i}
          d={`M ${740 + i * 220} 980 l 0 -110`}
          length={110}
          width={7}
          color={AMBER}
          delay={i * 6}
          frames={20}
        />
      ))}
    </Beat>
  );
};

const NyosFizz: Scene = () => (
  <Beat head="It is a bottle of fizzy water." caption="and it has been filling for centuries">
    <CraterLake x={640} y={820} scale={0.68} charge={1} />
    <g transform="translate(1450 700)">
      <path d="M -90 -180 l 180 0 l 26 380 q -116 40 -232 0 Z" {...line(STROKE)} fill="#bcd6e4" />
      <path d="M -64 -240 l 128 0 l 0 60 l -128 0 Z" {...line(STROKE)} fill="#8fb3c6" />
      <Reveal delay={8}>
        <Note x={0} y={300} size={36} color={GREY}>
          same physics
        </Note>
      </Reveal>
    </g>
  </Beat>
);

const NyosTrigger: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <Beat head="On 21 August, something shook it." caption="probably a landslide">
      <g transform={`translate(${bob(frame, 3, 9)} 0)`}>
        <CraterLake x={W / 2} y={820} scale={0.95} charge={1} />
      </g>
    </Beat>
  );
};

const NyosRelease: Scene = () => (
  <Beat head="It came out of solution all at once." push={0.07}>
    <CraterLake x={W / 2} y={860} scale={0.9} charge={0.3} rising />
    <Reveal delay={12} from="none">
      <Readout x={W / 2} y={330} value="100,000–300,000" label="tonnes of carbon dioxide" color={RED} size={78} />
    </Reveal>
  </Beat>
);

const NyosColumn: Scene = () => (
  <Beat head="The column left the surface at" caption="about a hundred kilometres an hour">
    <CraterLake x={W / 2} y={900} scale={0.8} charge={0.2} rising />
    <Reveal delay={8} from="none">
      <Counter x={W / 2} y={470} to={100} size={170} color={RED} suffix=" km/h" commas={false} />
    </Reveal>
  </Beat>
);

const NyosHeavy: Scene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = Math.min(1, frame / (fps * 3));
  return (
    <Beat head="Carbon dioxide is heavier than air." caption="so it did not rise — it flowed downhill">
      <Strata y={900} layers={[{ h: 220, fill: ROCK }]} />
      <GasFlow level={0.15 + t * 0.3} y={960} />
      {[420, 900, 1400].map((x, i) => (
        <Figure key={i} x={x} y={920} scale={0.7} />
      ))}
    </Beat>
  );
};

const NyosValleys: Scene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = Math.min(1, frame / (fps * 2.6));
  return (
    <Beat head="It filled the villages like water filling a bath." push={0.03}>
      <Strata y={920} layers={[{ h: 200, fill: ROCK }]} />
      {[380, 960, 1520].map((x, i) => (
        <House key={i} x={x} y={920} scale={0.72} />
      ))}
      <GasFlow level={0.05 + t * 0.42} y={960} />
    </Beat>
  );
};

const NyosToll: Scene = () => (
  <SceneFade>
    <Paper />
    <Camera push={0.035}>
      <Reveal from="none">
        <Counter x={W / 2} y={480} to={1746} size={220} color={RED} frames={30} />
      </Reveal>
      <Reveal delay={24} from="up">
        <Note x={W / 2} y={570} size={44} color={GREY}>
          people
        </Note>
      </Reveal>
      <Reveal delay={32} from="up">
        <Counter x={640} y={760} to={3500} size={96} color={INK} delay={32} />
        <Note x={640} y={830} size={36} color={GREY}>
          cattle
        </Note>
        <Counter x={1280} y={760} to={25} size={96} color={INK} delay={40} suffix=" km" commas={false} />
        <Note x={1280} y={830} size={36} color={GREY}>
          reach of the cloud
        </Note>
      </Reveal>
    </Camera>
  </SceneFade>
);

const NyosThree: Scene = () => (
  <Beat head="Three lakes on Earth are known to do this." caption="Nyos, Monoun, Kivu">
    {["Nyos", "Monoun", "Kivu"].map((n, i) => (
      <Reveal key={n} i={i} stagger={8} from="up" distance={30}>
        <g transform={`translate(${430 + i * 530} 620)`}>
          <path d={`M -170 0 L -90 -150 L 90 -150 L 170 0 Z`} {...line(STROKE)} fill={ROCK} />
          <path d={`M -96 -150 L 96 -150 L 84 70 L -84 70 Z`} {...line(STROKE)} fill={WATER} />
          <Note x={0} y={170} size={46} color={INK}>
            {n}
          </Note>
        </g>
      </Reveal>
    ))}
  </Beat>
);

const Kivu: Scene = () => (
  <Beat head="Kivu is the big one." caption="a thousand times the volume">
    <g transform="translate(430 640)">
      <path d="M -90 0 L -46 -80 L 46 -80 L 90 0 Z" {...line(STROKE)} fill={ROCK} />
      <path d="M -50 -80 L 50 -80 L 44 40 L -44 40 Z" {...line(STROKE)} fill={WATER} />
      <Note x={0} y={110} size={36} color={GREY}>
        Nyos
      </Note>
    </g>
    <g transform="translate(1180 640)">
      <path d="M -330 0 L -170 -270 L 170 -270 L 330 0 Z" {...line(STROKE)} fill={ROCK} />
      <path d="M -178 -270 L 178 -270 L 160 140 L -160 140 Z" {...line(STROKE)} fill={WATER} />
      <Note x={0} y={210} size={40} color={INK}>
        Kivu
      </Note>
    </g>
    <Reveal delay={16} from="none">
      <Counter x={W / 2} y={940} to={2000000} size={78} color={RED} delay={16} />
      <Note x={W / 2} y={1000} size={36} color={GREY}>
        people live around its shore
      </Note>
    </Reveal>
  </Beat>
);

const NyosVerdict: Scene = () => (
  <Verdict value="none" note="the first sign was the smell, and by then you were breathing it" />
);

// ── 2 · the flow ────────────────────────────────────────────────────

const Two: Scene = () => (
  <Chapter n={2} word="THE FLOW">
    <Volcano x={W / 2} y={1080} scale={0.55} flow={0.4} />
  </Chapter>
);

const PyroWhat: Scene = () => (
  <Beat head="A pyroclastic flow is not lava." caption="lava you can walk away from">
    <g transform="translate(520 700)">
      <Volcano x={0} y={200} scale={0.42} />
      <path d="M -20 -60 q 60 90 30 200" {...line(22, "#c9542a")} />
      <Note x={0} y={330} size={40} color={GREY}>
        lava
      </Note>
    </g>
    <g transform="translate(1400 700)">
      <Volcano x={0} y={200} scale={0.42} flow={0.9} />
      <Note x={0} y={330} size={40} color={RED}>
        this
      </Note>
    </g>
  </Beat>
);

const PyroSpeed: Scene = () => (
  <Beat head="Gas, ash and rock, hugging the ground." caption="several hundred kilometres an hour">
    <Volcano x={760} y={940} scale={0.95} flow={0.95} />
    <Reveal delay={14} from="left" distance={50}>
      <Readout x={1560} y={520} value="670" label="km/h at the start" color={RED} />
    </Reveal>
  </Beat>
);

const PyroRace: Scene = () => {
  const frame = useCurrentFrame();
  const t = Math.min(1, frame / 40);
  return (
    <Beat head="Faster than a car." caption="considerably faster than you">
      <Strata y={880} layers={[{ h: 240, fill: ROCK }]} />
      <g transform={`translate(${120 + t * 900} 0)`}>
        <rect x={-90} y={-60} width={180} height={70} rx={14} {...line(STROKE)} fill="#5f7f9a" transform="translate(0 860)" />
        <circle cx={-46} cy={880} r={24} fill={INK} />
        <circle cx={46} cy={880} r={24} fill={INK} />
      </g>
      <g transform={`translate(${-300 + t * 1500} 0)`}>
        {[...Array(14)].map((_, i) => (
          <circle key={i} cx={i * 46} cy={840 + bob(frame + i * 5, 8, 10)} r={40 + (i % 3) * 18} fill="#9a8f84" opacity={0.92} />
        ))}
      </g>
    </Beat>
  );
};

const Pelee: Scene = () => (
  <Beat head="Martinique, 1902. Mont Pelée opened sideways." caption="160 km/h, straight down the slope">
    <Volcano x={880} y={950} scale={1.05} flow={0.85} />
  </Beat>
);

const PeleeToll: Scene = () => (
  <SceneFade>
    <Paper />
    <Camera push={0.04}>
      <Reveal from="none">
        <Note x={W / 2} y={400} size={54} color={INK}>
          Saint-Pierre, the largest city on the island
        </Note>
      </Reveal>
      <Reveal delay={10} from="none">
        <Counter x={W / 2} y={620} to={30000} size={200} color={RED} delay={10} frames={30} />
      </Reveal>
      <Reveal delay={30} from="up">
        <Note x={W / 2} y={720} size={46} color={GREY}>
          people, and under a minute
        </Note>
      </Reveal>
    </Camera>
  </SceneFade>
);

const PeleeCell: Scene = () => (
  <Beat head="There were three known survivors." caption="put there the day before, for fighting">
    <g transform="translate(960 640)">
      <path d="M -260 260 L -260 -120 q 260 -150 520 0 L 260 260 Z" {...line(STROKE)} fill="#8d8478" />
      <path d="M -190 250 L -190 -70 q 190 -110 380 0 L 190 250 Z" {...line(STROKE)} fill="#2b2f36" />
      <rect x={-90} y={-40} width={180} height={26} rx={4} {...line(4, "#c9c2b4")} fill="#cfe0ea" />
      <Figure x={0} y={230} scale={0.9} fill="#6f7883" />
    </g>
    <Reveal delay={16} from="left">
      <Note x={330} y={560} size={40} color={GREY} anchor="end">
        one slit
      </Note>
      <path d="M 350 550 l 250 40" {...line(4, FAINT)} strokeDasharray="10 8" />
    </Reveal>
  </Beat>
);

const PeleeDug: Scene = () => (
  <Beat
    head="The walls built to keep him in"
    caption="were the only thing thick enough to keep the volcano out"
  >
    <Reveal delay={8} from="none">
      <Readout x={W / 2} y={620} value="3 days" label="before anyone dug him out" color={RED} size={128} />
    </Reveal>
  </Beat>
);

const PyroHercu: Scene = () => (
  <Beat head="Herculaneum, 79. A flow from Vesuvius." caption="which is where the temperature record comes from">
    <Volcano x={1360} y={940} scale={0.85} flow={0.8} />
    <g transform="translate(430 880)">
      {[0, 1, 2].map((i) => (
        <House key={i} x={i * 150} y={0} scale={0.5} />
      ))}
    </g>
  </Beat>
);

const PyroTemp: Scene = () => (
  <Beat head="The flows themselves reached" caption="hot, but not the hottest thing that arrived">
    <Reveal from="none">
      <Counter x={W / 2} y={620} to={465} size={230} color={AMBER} suffix="°C" commas={false} frames={28} />
    </Reveal>
  </Beat>
);

const PyroCloud: Scene = () => (
  <Beat head="Something arrived ahead of them." caption="a cloud of ash, hotter still">
    <Reveal from="none">
      <Counter x={640} y={620} to={465} size={150} color={FAINT} suffix="°C" commas={false} />
      <Note x={640} y={700} size={34} color={GREY}>
        the flow
      </Note>
    </Reveal>
    <Reveal delay={14} from="none">
      <Counter x={1290} y={620} to={510} size={190} color={RED} suffix="°C+" commas={false} delay={14} />
      <Note x={1290} y={700} size={34} color={RED}>
        the cloud in front of it
      </Note>
    </Reveal>
  </Beat>
);

const PyroGlass: Scene = () => (
  <Beat head="A man was lying on a wooden bed." caption="part of his brain turned to glass">
    <g transform="translate(960 700)">
      <rect x={-330} y={40} width={660} height={44} rx={8} {...line(STROKE)} fill="#9a7f5c" />
      <path d="M -300 84 l -16 130 M 300 84 l 16 130" {...line(16, "#7d6647")} />
      <Figure x={0} y={40} scale={0.95} fill="#b9a88f" />
    </g>
  </Beat>
);

const PyroVitrify: Scene = () => (
  <Beat head="Not burnt. Vitrified." caption="heated past 500°C, then cooled fast enough to set like glass">
    <g transform="translate(700 620)">
      <path d="M -120 90 q -40 -190 120 -190 q 160 0 120 190 q -120 60 -240 0 Z" {...line(STROKE)} fill="#d7b9a2" />
      <Note x={0} y={200} size={38} color={GREY}>
        heated
      </Note>
    </g>
    <DrawOn d="M 900 600 L 1140 600" length={240} width={6} color={RED} delay={10} frames={16} />
    <Reveal delay={22} from="right" distance={40}>
      <g transform="translate(1340 620)">
        <path d="M -120 90 q -40 -190 120 -190 q 160 0 120 190 q -120 60 -240 0 Z" {...line(STROKE)} fill="#8fb6c9" />
        <Note x={0} y={200} size={38} color={INK}>
          cooled — glass
        </Note>
      </g>
    </Reveal>
  </Beat>
);

const PyroOnly: Scene = () => (
  <Beat head="The only confirmed case anyone has found." caption="of human brain tissue turning to glass">
    <Reveal from="none">
      <Counter x={W / 2} y={640} to={1} size={280} color={RED} commas={false} frames={14} />
    </Reveal>
  </Beat>
);

const PyroVerdict: Scene = () => (
  <Verdict value="seconds" note="you see it coming down the mountain, and that is all you get" />
);

// ── 3 · the floor ───────────────────────────────────────────────────

const Three: Scene = () => (
  <Chapter n={3} word="THE FLOOR">
    <Strata y={880} layers={[{ h: 240, fill: ROCK }]} />
  </Chapter>
);

const SinkFlorida: Scene = () => (
  <Beat head="Most of Florida is built on limestone." caption="and limestone dissolves in slightly acidic rain">
    <Strata
      y={620}
      layers={[
        { h: 130, fill: "#b9a888", label: "sand" },
        { h: 340, fill: "#cfc6b0", label: "limestone" },
      ]}
    />
    {[...Array(9)].map((_, i) => (
      <DrawOn
        key={i}
        d={`M ${260 + i * 180} 320 l 0 300`}
        length={300}
        width={4}
        color={WATER}
        delay={i * 3}
        frames={26}
      />
    ))}
  </Beat>
);

const SinkVoid: Scene = () => (
  <Beat head="So underneath the lawns there are voids." caption="held up by the sand sitting on them">
    <Strata
      y={600}
      layers={[
        { h: 140, fill: "#b9a888", label: "sand" },
        { h: 360, fill: "#cfc6b0", label: "limestone" },
      ]}
    />
    <Void x={780} y={880} scale={0.9} />
    <Void x={1380} y={930} scale={0.6} />
    <House x={780} y={600} scale={0.7} />
  </Beat>
);

const SinkSeffner: Scene = () => (
  <Beat head="Seffner, Florida, 2013." caption="a man called Jeffrey Bush went to bed">
    <Strata y={640} layers={[{ h: 140, fill: "#b9a888" }, { h: 320, fill: "#cfc6b0" }]} />
    <House x={W / 2} y={640} scale={1.05} />
    <Void x={W / 2} y={920} scale={0.85} />
  </Beat>
);

const SinkOpen: Scene = () => {
  const frame = useCurrentFrame();
  const t = Math.min(1, frame / 30);
  return (
    <Beat head="At about half past eleven, the floor opened." push={0.06}>
      <Strata y={640} layers={[{ h: 140, fill: "#b9a888" }, { h: 320, fill: "#cfc6b0" }]} />
      <Void x={W / 2} y={900} scale={0.95} open={t} />
      <House x={W / 2} y={640 + t * 90} scale={1.05} tilt={t * 9} />
    </Beat>
  );
};

const SinkBrother: Scene = () => (
  <Beat head="His brother ran in and found the room gone." caption="he had to be pulled out as the edges kept collapsing">
    <Strata y={660} layers={[{ h: 140, fill: "#b9a888" }, { h: 300, fill: "#cfc6b0" }]} />
    <Void x={W / 2} y={900} scale={1} open={1} />
    <Figure x={640} y={660} scale={0.85} />
  </Beat>
);

const SinkNever: Scene = () => (
  <Beat head="The hole was too unstable to enter." caption="Jeffrey Bush was never recovered">
    <Strata y={660} layers={[{ h: 140, fill: "#b9a888" }, { h: 300, fill: "#cfc6b0" }]} />
    <Void x={W / 2} y={900} scale={1.05} open={1} />
  </Beat>
);

const SinkReopen: Scene = () => (
  <Beat head="It has reopened twice since." caption="in the same spot">
    <Reveal from="none">
      {["2013", "2015", "2023"].map((y, i) => (
        <Reveal key={y} i={i} stagger={9} from="up" distance={26}>
          <g transform={`translate(${480 + i * 480} 620)`}>
            <circle cx={0} cy={0} r={110} fill={NIGHT} />
            <Note x={0} y={190} size={52} color={i === 0 ? RED : INK}>
              {y}
            </Note>
          </g>
        </Reveal>
      ))}
    </Reveal>
  </Beat>
);

const SinkVerdict: Scene = () => (
  <Verdict value="none" note="ground above a void looks exactly like ground that is not" />
);

// ── 4 · the slosh ───────────────────────────────────────────────────

const Four: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <Chapter n={4} word="THE SLOSH">
      <Basin x={W / 2} y={960} w={900} h={200} phase={frame / 9} />
    </Chapter>
  );
};

const SeicheWhat: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <Beat head="Push water at exactly its own rhythm" caption="and it starts sloshing like a bath">
      <Basin x={W / 2} y={700} w={1100} h={260} phase={frame / 8} />
    </Beat>
  );
};

const Seiche1755: Scene = () => (
  <Beat head="1755. An earthquake destroys Lisbon." push={0.06}>
    <Reveal from="none">
      <g transform="translate(560 660)">
        <circle cx={0} cy={0} r={26} fill={RED} />
        {[1, 2, 3, 4].map((i) => (
          <circle key={i} cx={0} cy={0} r={26 + i * 80} {...line(4, RED)} fill="none" opacity={0.55 - i * 0.1} />
        ))}
        <Note x={0} y={430} size={44} color={INK}>
          Lisbon
        </Note>
      </g>
    </Reveal>
  </Beat>
);

const SeicheLochs: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <Beat head="Two thousand kilometres away, in Scotland," caption="lakes nobody had felt shake stood up and started swinging">
      <Basin x={620} y={700} w={420} h={180} phase={frame / 8} />
      <Basin x={1300} y={700} w={420} h={180} phase={frame / 8 + 1.6} />
      <Note x={620} y={860} size={40} color={INK}>
        Loch Lomond
      </Note>
      <Note x={1300} y={860} size={40} color={INK}>
        Loch Ness
      </Note>
    </Beat>
  );
};

const SeicheTohoku: Scene = () => (
  <Beat head="2011. The same thing in reverse." caption="an earthquake off Japan">
    <Reveal from="none">
      <g transform="translate(1360 640)">
        <circle cx={0} cy={0} r={26} fill={RED} />
        {[1, 2, 3, 4].map((i) => (
          <circle key={i} cx={0} cy={0} r={26 + i * 76} {...line(4, RED)} fill="none" opacity={0.55 - i * 0.1} />
        ))}
        <Note x={0} y={420} size={44} color={INK}>
          Japan
        </Note>
      </g>
    </Reveal>
  </Beat>
);

const SeicheNorway: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <Beat head="Thirty minutes later, the fjords of Norway moved." push={0.03}>
      <DrawOn d="M 1320 620 C 1000 420 600 460 420 620" length={1000} width={6} color={FAINT} frames={40} dash="14 12" />
      <Basin x={420} y={820} w={520} h={220} phase={frame / 7} />
      <Note x={420} y={990} size={40} color={INK}>
        Norway
      </Note>
      <Note x={1320} y={560} size={40} color={GREY}>
        Japan
      </Note>
    </Beat>
  );
};

const SeicheAmp: Scene = () => (
  <SceneFade>
    <Paper />
    <Camera push={0.04}>
      <Reveal from="none">
        <Readout x={560} y={540} value="1.5 m" label="trough to peak, for hours" color={RED} size={130} />
      </Reveal>
      <Reveal delay={12} from="none">
        <Counter x={1360} y={540} to={8000} size={130} color={INK} delay={12} suffix=" km" />
        <Note x={1360} y={612} size={34} color={GREY}>
          from the epicentre
        </Note>
      </Reveal>
    </Camera>
  </SceneFade>
);

const SeicheVerdict: Scene = () => (
  <Verdict value="~30 minutes" note="if anyone thinks to tell you a distant quake is relevant to your harbour" />
);

// ── 5 · the sun ─────────────────────────────────────────────────────

const Five: Scene = () => (
  <Chapter n={5} word="THE SUN" bg="#12161f">
    <Sun x={W / 2} y={1020} r={200} />
  </Chapter>
);

const Carr1859: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Paper fill="#12161f" />
      <Camera push={0.05}>
        <Sun x={430} y={600} r={180} burst={Math.min(1, frame / 60)} />
      </Camera>
      <Reveal from="down">
        <Note x={W / 2} y={220} size={54} color="#e8e2d6">
          1 September 1859
        </Note>
      </Reveal>
      <Reveal delay={12} from="up">
        <Note x={1300} y={960} size={42} color="#b9b2a4">
          a cloud of magnetised plasma, aimed at us
        </Note>
      </Reveal>
    </SceneFade>
  );
};

const CarrAurora: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Paper fill="#12161f" />
      <Camera push={0.04}>
        {[...Array(5)].map((_, i) => (
          <path
            key={i}
            d={smooth([
              [-40, 380 + i * 42 + bob(frame + i * 12, 26, 22)],
              [560, 300 + i * 40 + bob(frame + i * 9, 20, 26)],
              [1300, 350 + i * 44 + bob(frame + i * 15, 24, 24)],
              [1960, 290 + i * 40],
            ])}
            {...line(26, i % 2 ? "#6fd0a8" : "#a8e0c4")}
            fill="none"
            opacity={0.35}
          />
        ))}
      </Camera>
      <Reveal from="down">
        <Note x={W / 2} y={200} size={50} color="#e8e2d6">
          auroras over Cuba and Hawaii
        </Note>
      </Reveal>
      <Reveal delay={14} from="up">
        <Note x={W / 2} y={900} size={42} color="#b9b2a4">
          bright enough to read a newspaper outdoors at one in the morning
        </Note>
      </Reveal>
    </SceneFade>
  );
};

const CarrTelegraph: Scene = () => (
  <Beat head="The telegraph network began behaving strangely." caption="the only electrical infrastructure on Earth at the time">
    <g transform="translate(960 700)">
      {[-400, 0, 400].map((x) => (
        <g key={x}>
          <path d={`M ${x} 160 l 0 -300`} {...line(16, "#7d6647")} />
          <path d={`M ${x - 80} -100 l 160 0`} {...line(10, "#7d6647")} />
        </g>
      ))}
      <DrawOn d="M -400 -100 L 0 -100 L 400 -100" length={800} width={5} color={AMBER} frames={30} />
    </g>
  </Beat>
);

const CarrBatteries: Scene = () => (
  <Beat head="Operators disconnected their batteries" caption="and kept sending on the current the storm was inducing">
    <g transform="translate(700 660)">
      <rect x={-160} y={-90} width={320} height={180} rx={10} {...line(STROKE)} fill="#b9a888" />
      <path d="M -60 0 l 120 0 M 0 -60 l 0 120" {...line(9, INK)} />
      <Note x={0} y={190} size={38} color={GREY}>
        battery
      </Note>
      <DrawOn d="M -200 -150 L 200 150" length={450} width={8} color={RED} delay={10} frames={14} />
    </g>
    <Reveal delay={20} from="right">
      <Note x={1400} y={640} size={52} color={AMBER}>
        still sending
      </Note>
    </Reveal>
  </Beat>
);

const CarrFire: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <Beat head="In some offices the paper caught fire." push={0.07}>
      <g transform="translate(960 720)">
        <rect x={-200} y={-160} width={400} height={300} rx={8} {...line(STROKE)} fill="#f4efe2" />
        {[...Array(10)].map((_, i) => (
          <circle
            key={i}
            cx={-140 + i * 32}
            cy={-140 + bob(frame + i * 7, 6, 26)}
            r={26 + (i % 3) * 12}
            fill={i % 2 ? "#e08b2c" : "#d1402f"}
            opacity={0.85}
          />
        ))}
      </g>
    </Beat>
  );
};

const CarrThen: Scene = () => (
  <Beat head="In 1859, that was the entire damage report." caption="scorched paper and a few burnt relay stations">
    <Reveal from="none">
      <Readout x={W / 2} y={620} value="1859" label="nothing else was electrified yet" color={INK} size={180} />
    </Reveal>
  </Beat>
);

const CarrNow: Scene = () => (
  <Beat head="The problem is what we have built since." push={0.06}>
    {[...Array(5)].map((_, i) => (
      <Reveal key={i} i={i} stagger={5} from="up" distance={30}>
        <Transformer x={340 + i * 320} y={820} scale={0.5} />
      </Reveal>
    ))}
  </Beat>
);

const CarrTransformers: Scene = () => {
  const frame = useCurrentFrame();
  const hot = Math.min(1, frame / 50);
  return (
    <Beat head="Direct current, into a grid built for alternating." caption="until the largest transformers cook themselves from inside">
      <Transformer x={W / 2} y={800} scale={1.25} hot={hot} />
    </Beat>
  );
};

const CarrLead: Scene = () => (
  <Beat head="They are custom-built." caption="there is no warehouse of spares">
    <Transformer x={620} y={780} scale={0.85} />
    <g transform="translate(1340 700)">
      <rect x={-220} y={-190} width={440} height={330} rx={10} {...line(STROKE)} fill="#d8d2c4" />
      <path d="M -220 -190 L 220 140 M 220 -190 L -220 140" {...line(6, FAINT)} />
      <Note x={0} y={210} size={40} color={GREY}>
        empty
      </Note>
    </g>
  </Beat>
);

const CarrNrc: Scene = () => (
  <SceneFade>
    <Paper />
    <Camera push={0.035}>
      <Reveal from="none">
        <Note x={W / 2} y={330} size={44} color={GREY}>
          the most cited assessment put recovery at
        </Note>
      </Reveal>
      <Reveal delay={10} from="none">
        <Note x={W / 2} y={560} size={170} color={RED}>
          4 to 10 years
        </Note>
      </Reveal>
      <Reveal delay={22} from="up">
        <Note x={W / 2} y={700} size={56} color={INK}>
          and the cost in trillions
        </Note>
      </Reveal>
    </Camera>
  </SceneFade>
);

const CarrVerdict: Scene = () => (
  <Verdict value="~17 hours" note="we would watch it leave the sun, and it would not help very much" />
);

// ── 6 · the one you have been told about ────────────────────────────

const Six: Scene = () => (
  <Chapter n={6} word="THE MYTH">
    <Volcano x={W / 2} y={1080} scale={0.7} flow={0.2} />
  </Chapter>
);

const TobaWhat: Scene = () => (
  <Beat head="74,000 years ago, Toba erupted in Sumatra." caption="one of the largest eruptions of the last two million years">
    <Volcano x={W / 2} y={980} scale={1.15} flow={0.5} fill="#8a8478" />
  </Beat>
);

const TobaScale: Scene = () => (
  <SceneFade>
    <Paper />
    <Camera push={0.04}>
      <Reveal from="none">
        <Counter x={W / 2} y={520} to={2500} size={200} color={RED} frames={30} />
      </Reveal>
      <Reveal delay={24} from="up">
        <Note x={W / 2} y={610} size={48} color={GREY}>
          cubic kilometres of material
        </Note>
      </Reveal>
      <Reveal delay={32} from="up">
        <Note x={W / 2} y={760} size={44} color={INK}>
          ash across South Asia, in places metres deep
        </Note>
      </Reveal>
    </Camera>
  </SceneFade>
);

const TobaStory: Scene = () => (
  <Beat head="And then the story you have heard." caption="that everyone alive descends from a few thousand survivors">
    <g transform="translate(960 660)">
      {[...Array(24)].map((_, i) => (
        <Reveal key={i} i={i} stagger={1} from="none">
          <Figure x={-600 + (i % 12) * 110} y={(i < 12 ? -60 : 180)} scale={0.5} fill={i % 12 < 2 ? "#8d97a3" : FAINT} />
        </Reveal>
      ))}
    </g>
  </Beat>
);

const TobaDoubt: Scene = () => (
  <Beat head="That part has quietly fallen apart." push={0.05} headColor={RED} />
);

const TobaGenomes: Scene = () => (
  <Beat head="Genomes can see population crashes." caption="they do not see one at seventy-four thousand years">
    <g transform="translate(200 760)">
      <path d="M 0 0 L 1520 0" {...line(5, INK)} />
      <path d="M 0 -40 l 0 80" {...line(5, INK)} />
      <DrawOn
        d="M 0 -180 C 260 -200 420 -150 620 -175 C 820 -200 1000 -160 1240 -185 C 1380 -198 1460 -170 1520 -180"
        length={1600}
        width={7}
        color={WATER}
        frames={40}
      />
      <path d="M 760 -40 l 0 -260" {...line(5, RED)} strokeDasharray="12 10" />
      <Note x={760} y={70} size={38} color={RED}>
        74,000 years ago
      </Note>
      <Note x={760} y={-330} size={40} color={RED}>
        no dip
      </Note>
    </g>
  </Beat>
);

const TobaSites: Scene = () => (
  <Beat head="And sites either side of the ash layer" caption="show people carrying on, apparently unbothered">
    <Strata
      y={560}
      layers={[
        { h: 120, fill: "#b9a888", label: "after" },
        { h: 70, fill: "#8d8478", label: "ash" },
        { h: 260, fill: "#c9bda4", label: "before" },
      ]}
    />
    <Figure x={520} y={560} scale={0.75} />
    <Figure x={1380} y={560} scale={0.75} />
    <Figure x={640} y={1000} scale={0.75} />
    <Figure x={1260} y={1000} scale={0.75} />
  </Beat>
);

const TobaStill: Scene = () => (
  <Beat head="Toba was still an enormous eruption." caption="it just does not appear to have nearly killed us" headColor={INK}>
    <Volcano x={W / 2} y={980} scale={1} flow={0.35} />
  </Beat>
);

const TobaYellow: Scene = () => (
  <Beat head="And the one everyone worries about now" caption="would be the least sudden death on this list">
    <Volcano x={W / 2} y={960} scale={1.05} />
    <Reveal delay={12} from="up">
      <g>
        <path d="M 620 900 l 0 -60 M 820 880 l 0 -70 M 1100 880 l 0 -70 M 1300 900 l 0 -60" {...line(7, RED)} />
        <Note x={960} y={780} size={42} color={RED}>
          ground lifting, earthquakes swarming
        </Note>
      </g>
    </Reveal>
  </Beat>
);

const TobaVerdict: Scene = () => (
  <Verdict value="months" note="possibly years, and nobody would be in any doubt" />
);

// ── 7 · the one from outside ────────────────────────────────────────

const Seven: Scene = () => (
  <Chapter n={7} word="FROM OUTSIDE" bg="#0d1119">
    <Burst x={W / 2} y={620} t={0.4} scale={1.4} />
  </Chapter>
);

const GrbWhat: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Paper fill="#0d1119" />
      <Camera push={0.05}>
        <Burst x={W / 2} y={560} t={Math.min(1, frame / 50)} scale={1.1} />
      </Camera>
      <Reveal from="down">
        <Note x={W / 2} y={200} size={52} color="#e8e2d6">
          a star collapses and fires two narrow beams
        </Note>
      </Reveal>
    </SceneFade>
  );
};

const GrbEnergy: Scene = () => (
  <SceneFade>
    <Paper fill="#0d1119" />
    <Camera push={0.04}>
      <Reveal from="none">
        <Note x={W / 2} y={440} size={56} color="#b9b2a4">
          in a few seconds, more energy than
        </Note>
        <Note x={W / 2} y={580} size={100} color="#f0b23c">
          our sun will make in its entire life
        </Note>
      </Reveal>
    </Camera>
  </SceneFade>
);

const GrbNarrow: Scene = () => (
  <SceneFade>
    <Paper fill="#0d1119" />
    <Camera push={0.03}>
      <Burst x={W / 2} y={560} t={1} scale={0.9} />
    </Camera>
    <Reveal delay={10} from="up">
      <Note x={W / 2} y={980} size={48} color="#e8e2d6">
        the beams are narrow, which is the only reassuring sentence here
      </Note>
    </Reveal>
  </SceneFade>
);

const GrbOzone: Scene = () => (
  <Beat head="The gamma rays would not reach the ground." caption="they would take the ozone layer apart instead" bg="#0d1119" headColor="#e8e2d6" capColor="#b9b2a4">
    <g transform="translate(960 760)">
      <path d="M -700 0 q 700 -220 1400 0" {...line(30, "#6fa8c9")} opacity={0.8} />
      <path d="M -700 90 q 700 -220 1400 0" {...line(70, "#3f5f7a")} opacity={0.6} />
      {[...Array(9)].map((_, i) => (
        <DrawOn key={i} d={`M ${-620 + i * 160} -320 l 0 300`} length={300} width={6} color="#dceefb" delay={i * 3} frames={18} />
      ))}
    </g>
  </Beat>
);

const GrbAfter: Scene = () => (
  <Beat head="Then ordinary sunlight does the rest." caption="over the following years, to everything at the bottom of the food chain">
    <Sun x={W / 2} y={480} r={140} />
    {[...Array(7)].map((_, i) => (
      <Reveal key={i} i={i} stagger={5} from="up" distance={24}>
        <path d={`M ${420 + i * 180} 900 q 20 -110 0 -170`} {...line(9, "#7d9a5c")} />
        <circle cx={420 + i * 180} cy={720} r={26} fill="#9ab87a" opacity={0.8} />
      </Reveal>
    ))}
  </Beat>
);

const Boat: Scene = () => (
  <SceneFade>
    <Paper fill="#0d1119" />
    <Camera push={0.05}>
      <Burst x={1420} y={520} t={1} scale={0.8} />
    </Camera>
    <Reveal from="down">
      <Note x={620} y={330} size={54} color="#e8e2d6">
        October 2022
      </Note>
    </Reveal>
    <Reveal delay={10} from="none">
      <Counter x={620} y={560} to={19} size={150} color="#f0b23c" delay={10} commas={false} />
      <Note x={620} y={640} size={40} color="#b9b2a4">
        hundred million light years away
      </Note>
    </Reveal>
  </SceneFade>
);

const BoatIono: Scene = () => (
  <Beat
    head="From that distance, it was still strong enough"
    caption="to measurably disturb the ionosphere of this planet"
    bg="#0d1119"
    headColor="#e8e2d6"
    capColor="#b9b2a4"
  >
    <g transform="translate(960 780)">
      <circle cx={0} cy={260} r={300} {...line(STROKE, "#6fa8c9")} fill="#1b2a3a" />
      <path d="M -420 -60 q 420 -180 840 0" {...line(22, "#6fd0a8")} opacity={0.7} />
      <path d="M -400 -130 q 400 -170 800 0" {...line(12, "#a8e0c4")} opacity={0.5} />
    </g>
  </Beat>
);

const BoatOdds: Scene = () => (
  <SceneFade>
    <Paper fill="#0d1119" />
    <Camera push={0.03}>
      <Reveal from="none">
        <Note x={W / 2} y={430} size={54} color="#b9b2a4">
          about one every
        </Note>
        <Counter x={W / 2} y={620} to={10000} size={190} color="#f0b23c" frames={32} />
        <Note x={W / 2} y={720} size={54} color="#b9b2a4">
          years
        </Note>
      </Reveal>
      <Reveal delay={30} from="up">
        <Note x={W / 2} y={880} size={46} color="#e8e2d6">
          it was not aimed at us. It was pointed somewhere near us.
        </Note>
      </Reveal>
    </Camera>
  </SceneFade>
);

const GrbVerdict: Scene = () => (
  <Verdict value="none" note="the burst travels at light speed — the warning arrives with it" bg="#0d1119" />
);

// ── the board ───────────────────────────────────────────────────────

const ROWS: [string, string, boolean][] = [
  ["Supervolcano", "months", false],
  ["Solar storm", "~17 hours", false],
  ["Seiche", "~30 minutes", false],
  ["Pyroclastic flow", "seconds", false],
  ["Limnic eruption", "nothing", true],
  ["Sinkhole", "nothing", true],
  ["Gamma-ray burst", "nothing", true],
];

const Board: Scene = () => (
  <SceneFade>
    <Paper />
    <Camera push={0.025}>
      <Note x={W / 2} y={190} size={62} color={INK}>
        how long you would have
      </Note>
      {ROWS.map(([what, warn, none], i) => (
        <Reveal key={what} i={i} stagger={4} from="left" distance={40}>
          <Note x={900} y={310 + i * 100} size={46} color={INK} anchor="end">
            {what}
          </Note>
          <Note x={960} y={310 + i * 100} size={46} color={none ? RED : GREY} anchor="start">
            {warn}
          </Note>
          <path d={`M 360 ${330 + i * 100} l 1200 0`} {...line(2, FAINT)} />
        </Reveal>
      ))}
    </Camera>
  </SceneFade>
);

const Close1: Scene = () => (
  <SceneFade>
    <Paper />
    <Camera push={0.04}>
      <Reveal from="none">
        <Counter x={W / 2} y={540} to={4} size={260} color={RED} commas={false} frames={16} />
      </Reveal>
      <Reveal delay={16} from="up">
        <Note x={W / 2} y={680} size={56} color={INK}>
          of the seven give you no useful notice at all
        </Note>
      </Reveal>
    </Camera>
  </SceneFade>
);

const Close2: Scene = () => (
  <Beat head="And the one that gives you the most" caption="is the one everybody is frightened of">
    <Volcano x={W / 2} y={940} scale={0.95} />
  </Beat>
);

const Signoff: Scene = () => (
  <SceneFade>
    <Paper />
    <Camera push={0.05}>
      <Reveal from="none">
        <Note x={W / 2} y={420} size={52} color={INK}>
          the ground is not solid,
        </Note>
        <Note x={W / 2} y={500} size={52} color={INK}>
          the air is not reliably breathable,
        </Note>
        <Note x={W / 2} y={580} size={52} color={INK}>
          and the sky is not empty.
        </Note>
      </Reveal>
      <Reveal delay={26} from="up">
        <Note x={W / 2} y={780} size={96} color={RED}>
          Sleep well.
        </Note>
      </Reveal>
    </Camera>
  </SceneFade>
);

// ── registry ────────────────────────────────────────────────────────

const SCENES: Record<string, Scene> = {
  "nyos-cold": NyosCold,
  "nyos-cold-2": NyosCold2,
  "nyos-cold-3": NyosCold3,
  title: Title,
  "warning-clock": WarningClock,
  one: One,
  "nyos-map": NyosMap,
  "nyos-charge": NyosCharge,
  "nyos-fizz": NyosFizz,
  "nyos-trigger": NyosTrigger,
  "nyos-release": NyosRelease,
  "nyos-column": NyosColumn,
  "nyos-heavy": NyosHeavy,
  "nyos-valleys": NyosValleys,
  "nyos-toll": NyosToll,
  "nyos-three": NyosThree,
  kivu: Kivu,
  "nyos-verdict": NyosVerdict,
  two: Two,
  "pyro-what": PyroWhat,
  "pyro-speed": PyroSpeed,
  "pyro-race": PyroRace,
  pelee: Pelee,
  "pelee-toll": PeleeToll,
  "pelee-cell": PeleeCell,
  "pelee-dug": PeleeDug,
  "pyro-hercu": PyroHercu,
  "pyro-temp": PyroTemp,
  "pyro-cloud": PyroCloud,
  "pyro-glass": PyroGlass,
  "pyro-vitrify": PyroVitrify,
  "pyro-only": PyroOnly,
  "pyro-verdict": PyroVerdict,
  three: Three,
  "sink-florida": SinkFlorida,
  "sink-void": SinkVoid,
  "sink-seffner": SinkSeffner,
  "sink-open": SinkOpen,
  "sink-brother": SinkBrother,
  "sink-never": SinkNever,
  "sink-reopen": SinkReopen,
  "sink-verdict": SinkVerdict,
  four: Four,
  "seiche-what": SeicheWhat,
  "seiche-1755": Seiche1755,
  "seiche-lochs": SeicheLochs,
  "seiche-tohoku": SeicheTohoku,
  "seiche-norway": SeicheNorway,
  "seiche-amp": SeicheAmp,
  "seiche-verdict": SeicheVerdict,
  five: Five,
  "carr-1859": Carr1859,
  "carr-aurora": CarrAurora,
  "carr-telegraph": CarrTelegraph,
  "carr-batteries": CarrBatteries,
  "carr-fire": CarrFire,
  "carr-then": CarrThen,
  "carr-now": CarrNow,
  "carr-transformers": CarrTransformers,
  "carr-lead": CarrLead,
  "carr-nrc": CarrNrc,
  "carr-verdict": CarrVerdict,
  six: Six,
  "toba-what": TobaWhat,
  "toba-scale": TobaScale,
  "toba-story": TobaStory,
  "toba-doubt": TobaDoubt,
  "toba-genomes": TobaGenomes,
  "toba-sites": TobaSites,
  "toba-still": TobaStill,
  "toba-yellow": TobaYellow,
  "toba-verdict": TobaVerdict,
  seven: Seven,
  "grb-what": GrbWhat,
  "grb-energy": GrbEnergy,
  "grb-narrow": GrbNarrow,
  "grb-ozone": GrbOzone,
  "grb-after": GrbAfter,
  boat: Boat,
  "boat-iono": BoatIono,
  "boat-odds": BoatOdds,
  "grb-verdict": GrbVerdict,
  board: Board,
  "close-1": Close1,
  "close-2": Close2,
  signoff: Signoff,
};

/** Scenes on a dark ground, which need the boxed chapter title. */
export const DARK_SCENES = new Set([
  "nyos-cold", "nyos-cold-2", "nyos-cold-3", "five", "carr-1859", "carr-aurora",
  "seven", "grb-what", "grb-energy", "grb-narrow", "grb-ozone", "boat",
  "boat-iono", "boat-odds", "grb-verdict",
]);

export { WARN, Progress };

export const renderScene = (scene: string) => {
  const C = SCENES[scene];
  return C ? <C /> : null;
};

export const SCENE_NAMES = Object.keys(SCENES);
