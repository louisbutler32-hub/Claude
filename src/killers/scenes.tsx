import React from "react";
import { useCurrentFrame } from "remotion";
import { Arrow, H, Note, SceneFade, STROKE, W, line, usePop } from "../planets/kit";
import {
  ACCENT,
  BLUE,
  Bar,
  Beetle,
  Cassette,
  Crowd,
  Door,
  Envelope,
  FAINT,
  FamilyTree,
  Fingerprint,
  Floppy,
  GREY,
  INK,
  Notebook,
  OCHRE,
  PAPER,
  Paper,
  Plaque,
  Plate,
  Receipt,
  Rule,
  SLATE,
  Silhouette,
  SwabBox,
  Timeline,
  Tube,
  Will,
  Year,
} from "./art";

type Scene = React.FC;

/** The headline that sits under the chapter title. */
const Head: React.FC<{ children: React.ReactNode; y?: number; size?: number; color?: string }> = ({
  children,
  y = 250,
  size = 56,
  color = INK,
}) => (
  <Note x={W / 2} y={y} size={size} color={color}>
    {children}
  </Note>
);

const Caption: React.FC<{ children: React.ReactNode; y?: number; size?: number; color?: string }> = ({
  children,
  y = 1010,
  size = 40,
  color = GREY,
}) => (
  <Note x={W / 2} y={y} size={size} color={color}>
    {children}
  </Note>
);

/** How every case opens: the year it ended, the name, and a figure. */
const CaseOpen: React.FC<{ year: string; place: string; n: number }> = ({ year, place, n }) => {
  const { opacity } = usePop(4, 12);
  return (
    <SceneFade>
      <Paper />
      <g opacity={opacity}>
        <Year x={180} y={620} text={year} size={190} />
        <Note x={180} y={710} size={48} color={GREY} anchor="start">
          {place}
        </Note>
        <Rule x={180} y={760} w={520} />
        <Note x={180} y={840} size={36} color={FAINT} anchor="start">
          {n} of 10
        </Note>
      </g>
      <Silhouette x={1500} y={880} scale={2.1} />
    </SceneFade>
  );
};

/** The verdict card, with the figure fading out behind it. */
const Verdict: React.FC<{ value: string; note?: string }> = ({ value, note }) => {
  const { opacity } = usePop(6, 11);
  return (
    <SceneFade>
      <Paper />
      <g opacity={0.25}>
        <Silhouette x={W / 2} y={880} scale={2.4} fill={FAINT} outline={false} />
      </g>
      <g opacity={opacity}>
        <Plaque x={W / 2} y={480} value={value} />
      </g>
      {note ? <Caption y={700}>{note}</Caption> : null}
    </SceneFade>
  );
};

/** One big number with a line under it. */
const Stat: React.FC<{ big: string; sub: string; sub2?: string; color?: string }> = ({
  big,
  sub,
  sub2,
  color = INK,
}) => {
  const { opacity } = usePop(4, 12);
  return (
    <SceneFade>
      <Paper />
      <g opacity={opacity}>
        <Note x={W / 2} y={540} size={210} color={color}>
          {big}
        </Note>
        <Note x={W / 2} y={650} size={48} color={GREY}>
          {sub}
        </Note>
        {sub2 ? (
          <Note x={W / 2} y={720} size={40} color={GREY}>
            {sub2}
          </Note>
        ) : null}
      </g>
    </SceneFade>
  );
};

// ── intro ───────────────────────────────────────────────────────────

const Open: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Paper />
      {[...Array(10)].map((_, i) => (
        <g key={i} opacity={Math.min(1, Math.max(0, (frame - i * 4) / 12))}>
          <Silhouette x={200 + i * 169} y={760} scale={1.15} />
        </g>
      ))}
      <Head y={260} size={64}>
        Ten men.
      </Head>
      <Caption y={900} size={44}>
        Between them, more than four hundred people.
      </Caption>
    </SceneFade>
  );
};

const Question: Scene = () => (
  <SceneFade>
    <Paper />
    <Note x={W / 2} y={420} size={92} color={FAINT}>
      why?
    </Note>
    <path d="M 700 470 L 1220 470" {...line(6, ACCENT)} />
    <Caption y={620} size={44}>
      nobody has ever settled that
    </Caption>
    <Caption y={760} size={50} color={INK}>
      this is the other question
    </Caption>
  </SceneFade>
);

const WhatStopped: Scene = () => {
  const { opacity } = usePop(2, 12);
  return (
    <SceneFade>
      <Paper />
      <g opacity={opacity}>
        <Note x={W / 2} y={560} size={104} color={INK}>
          What actually stopped
        </Note>
        <Note x={W / 2} y={680} size={104} color={INK}>
          each one.
        </Note>
      </g>
    </SceneFade>
  );
};

const NotDetectives: Scene = () => {
  const items = ["traffic police", "paperwork", "a receipt", "a relative"];
  return (
    <SceneFade>
      <Paper />
      <Head y={260}>Not, in nine cases out of ten, a detective.</Head>
      {items.map((t, i) => {
        const { opacity } = usePop(8 + i * 8, 12);
        return (
          <g key={t} opacity={opacity}>
            <rect x={240 + i * 380} y={480} width={320} height={190} rx={8} {...line(4, FAINT)} fill="#ffffff" />
            <Note x={400 + i * 380} y={598} size={40} color={INK}>
              {t}
            </Note>
          </g>
        );
      })}
      <Caption>in order of the year each one ran out</Caption>
    </SceneFade>
  );
};

// ── 1888 · never caught ─────────────────────────────────────────────

const RipperOpen: Scene = () => <CaseOpen year="1888" place="Whitechapel, east London" n={1} />;

const RipperTenWeeks: Scene = () => {
  const cards: [string, string][] = [
    ["5", "women"],
    ["10", "weeks"],
    ["1", "square mile"],
    ["80,000", "people living in it"],
  ];
  return (
    <SceneFade>
      <Paper />
      <Head>Autumn 1888, in one district of east London.</Head>
      {cards.map(([big, sub], i) => {
        const { opacity } = usePop(6 + i * 9, 12);
        return (
          <g key={sub} opacity={opacity}>
            <rect x={190 + i * 390} y={420} width={340} height={320} rx={10} {...line(4, FAINT)} fill="#ffffff" />
            <Note x={360 + i * 390} y={580} size={i === 3 ? 76 : 108} color={i === 0 ? ACCENT : INK}>
              {big}
            </Note>
            <Note x={360 + i * 390} y={660} size={34} color={GREY}>
              {sub}
            </Note>
          </g>
        );
      })}
      <Caption>the five are the ones now counted as his</Caption>
    </SceneFade>
  );
};

const NoForensics: Scene = () => {
  const items = [
    { label: "fingerprints", year: "not used until 1901" },
    { label: "human vs animal blood", year: "not possible until 1901" },
    { label: "anything else", year: "no" },
  ];
  return (
    <SceneFade>
      <Paper />
      <Head>There was nothing to investigate with.</Head>
      <Fingerprint x={430} y={640} scale={1.5} color={FAINT} />
      {items.map((it, i) => {
        const { opacity } = usePop(10 + i * 10, 12);
        return (
          <g key={it.label} opacity={opacity}>
            <Note x={720} y={480 + i * 130} size={46} color={INK} anchor="start">
              {it.label}
            </Note>
            <Note x={720} y={530 + i * 130} size={34} color={ACCENT} anchor="start">
              {it.year}
            </Note>
          </g>
        );
      })}
    </SceneFade>
  );
};

const RipperStops: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>Then it stopped.</Head>
    <Timeline
      x={300}
      y={560}
      w={1320}
      marks={[
        { at: 0, top: "Aug 1888", bottom: "first" },
        { at: 0.22, top: "Nov 1888", bottom: "last", accent: true },
        { at: 1, top: "today", bottom: "still unidentified" },
      ]}
    />
    <Caption y={860} size={42}>
      he may have died, been jailed for something else,
    </Caption>
    <Caption y={916} size={42}>
      or simply moved away
    </Caption>
  </SceneFade>
);

const RipperVerdict: Scene = () => (
  <Verdict value="nothing at all" note="the baseline everything after this improves on" />
);

// ── 1978 · Ted Bundy ────────────────────────────────────────────────

const BundyOpen: Scene = () => <CaseOpen year="1978" place="Washington to Florida" n={2} />;

const BundyStates: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>Four states. Four years.</Head>
    <Note x={W / 2} y={620} size={190} color={INK}>
      30
    </Note>
    <Note x={W / 2} y={700} size={44} color={GREY}>
      the number he admitted to
    </Note>
    <Note x={W / 2} y={810} size={44} color={ACCENT}>
      the real number is unknown, and he enjoyed that
    </Note>
  </SceneFade>
);

const BundyStop: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Paper fill="#20242a" />
      <Note x={W / 2} y={250} size={52} color="#e8e4da">
        2 a.m., August 1975. Granger, Utah.
      </Note>
      <path d={`M -100 900 L ${W + 100} 900`} {...line(5, "#3c4149")} />
      <g transform={`translate(${((frame * 7) % 2400) - 400} 0)`}>
        <Beetle x={0} y={880} scale={0.95} fill="#8a7a5e" />
      </g>
      <Note x={W / 2} y={1010} size={40} color="#b8b2a4">
        headlights off
      </Note>
    </SceneFade>
  );
};

const BundyKit: Scene = () => {
  const items = ["handcuffs", "an ice pick", "a crowbar", "a stocking, two holes cut in it"];
  return (
    <SceneFade>
      <Paper />
      <Head>The passenger seat had been removed.</Head>
      {items.map((t, i) => {
        const { opacity } = usePop(10 + i * 9, 12);
        return (
          <g key={t} opacity={opacity}>
            <rect x={420} y={370 + i * 130} width={1080} height={104} rx={6} {...line(4, FAINT)} fill="#ffffff" />
            <Note x={470} y={438 + i * 130} size={44} color={INK} anchor="start">
              {t}
            </Note>
          </g>
        );
      })}
      <Caption>found on the floor of the car</Caption>
    </SceneFade>
  );
};

const BundyLineup: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>Burglary, not murder — but it put him in a lineup.</Head>
    <rect x={360} y={420} width={1200} height={420} {...line(5, INK)} fill="#ffffff" />
    {[0, 1, 2, 3, 4].map((i) => (
      <Silhouette key={i} x={480 + i * 240} y={800} scale={1.25} fill={i === 2 ? ACCENT : SLATE} />
    ))}
    <Caption>a woman who had escaped his car a year earlier picked him out</Caption>
  </SceneFade>
);

const BundyEscape: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>He escaped custody in Colorado. Twice.</Head>
    <Beetle x={W / 2} y={700} scale={1.25} fill="#c98a3c" />
    <g transform="translate(1430 470) rotate(-6)">
      <Plate x={0} y={0} scale={0.66} text="STOLEN" wrong />
    </g>
    <Caption>three years on, an officer ran the plates on an orange Volkswagen</Caption>
  </SceneFade>
);

const BundyVerdict: Scene = () => <Verdict value="a car — both times" />;

// ── 1978 · John Wayne Gacy ──────────────────────────────────────────

const GacyOpen: Scene = () => <CaseOpen year="1978" place="Norwood Park, Illinois" n={3} />;

const GacyCount: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>Thirty-three young men and boys.</Head>
    <Crowd n={33} x={470} y={480} cols={11} gap={82} scale={0.42} lit={26} litFill={OCHRE} />
    <Note x={W / 2} y={860} size={44} color={OCHRE}>
      twenty-six of them were under the floor of his own house
    </Note>
  </SceneFade>
);

const GacyPiest: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>11 December. A fifteen-year-old leaves work.</Head>
    <Silhouette x={700} y={840} scale={1.5} />
    <Arrow from={[880, 700]} to={[1180, 700]} bend={-0.1} color={FAINT} width={4} />
    <rect x={1220} y={520} width={420} height={320} rx={8} {...line(5, INK)} fill="#ffffff" />
    <Note x={1430} y={640} size={40} color={INK}>
      &quot;seeing a contractor
    </Note>
    <Note x={1430} y={700} size={40} color={INK}>
      about a summer job&quot;
    </Note>
    <Caption>Robert Piest, who worked at the chemist&apos;s on the corner</Caption>
  </SceneFade>
);

const GacyReceipt: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>Police searched the contractor&apos;s house.</Head>
    <Receipt x={W / 2} y={620} scale={1.35} rotate={-4} />
    <Caption y={960}>among what they took: a photograph receipt</Caption>
    <Caption y={1016} size={36}>
      belonging to a girl who worked behind that same counter
    </Caption>
  </SceneFade>
);

const GacyProof: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>She had handed it to Piest to hold.</Head>
    <Receipt x={520} y={640} scale={1} rotate={-6} />
    <Arrow from={[700, 620]} to={[1120, 620]} bend={-0.12} color={ACCENT} />
    <rect x={1160} y={470} width={480} height={300} rx={8} {...line(5, ACCENT)} fill="#ffffff" />
    <Note x={1400} y={600} size={44} color={ACCENT}>
      the boy was
    </Note>
    <Note x={1400} y={660} size={44} color={ACCENT}>
      inside the house
    </Note>
    <Caption>it was in his pocket when he walked out</Caption>
  </SceneFade>
);

const GacyVerdict: Scene = () => (
  <Verdict value="a slip of paper from a chemist's counter" />
);

// ── 1981 · Peter Sutcliffe ──────────────────────────────────────────

const SutcliffeOpen: Scene = () => <CaseOpen year="1981" place="West Yorkshire" n={4} />;

const SutcliffeScale: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>Thirteen murdered. Seven survived.</Head>
    <Crowd n={13} x={520} y={520} cols={13} gap={70} scale={0.38} lit={13} litFill={SLATE} />
    <Crowd n={7} x={520} y={740} cols={13} gap={70} scale={0.38} lit={7} litFill={BLUE} />
    <Note x={440} y={500} size={34} color={GREY} anchor="end">
      killed
    </Note>
    <Note x={440} y={720} size={34} color={BLUE} anchor="end">
      survived
    </Note>
    <Caption>the largest manhunt Britain had ever run</Caption>
  </SceneFade>
);

const SutcliffeNine: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Paper />
      <Head>That manhunt interviewed him nine times.</Head>
      {[...Array(9)].map((_, i) => (
        <g key={i} opacity={Math.min(1, Math.max(0, (frame - i * 6) / 10))}>
          <rect x={300 + (i % 5) * 270} y={400 + Math.floor(i / 5) * 210} width={230} height={160} rx={8} {...line(4, FAINT)} fill="#ffffff" />
          <Note x={415 + (i % 5) * 270} y={470 + Math.floor(i / 5) * 210} size={34} color={GREY}>
            interview {i + 1}
          </Note>
          <Note x={415 + (i % 5) * 270} y={525 + Math.floor(i / 5) * 210} size={36} color={ACCENT}>
            released
          </Note>
        </g>
      ))}
      <Caption>and released him nine times</Caption>
    </SceneFade>
  );
};

const HoaxTape: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>1979: a tape arrives, in a Sunderland accent.</Head>
    <Cassette x={700} y={620} scale={1.15} />
    <Envelope x={1360} y={560} scale={0.9} rotate={-5} />
    <Caption y={950}>senior officers believed it</Caption>
    <Caption y={1010} size={36}>
      and told the public to listen for that voice
    </Caption>
  </SceneFade>
);

const WrongVoice: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>Sutcliffe was from Bradford.</Head>
    <g>
      <rect x={300} y={420} width={560} height={300} rx={10} {...line(5, FAINT)} fill="#ffffff" />
      <Note x={580} y={540} size={44} color={GREY}>
        the voice on the tape
      </Note>
      <Note x={580} y={614} size={52} color={INK}>
        Sunderland
      </Note>
    </g>
    <g>
      <rect x={1060} y={420} width={560} height={300} rx={10} {...line(5, ACCENT)} fill="#ffffff" />
      <Note x={1340} y={540} size={44} color={GREY}>
        the man they wanted
      </Note>
      <Note x={1340} y={614} size={52} color={ACCENT}>
        Bradford
      </Note>
    </g>
    <Caption y={860} size={44}>
      the accent ruled him out. the tape was a hoax.
    </Caption>
    <Caption y={930} size={34}>
      its author was identified by DNA twenty-six years later
    </Caption>
  </SceneFade>
);

const Plates: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>2 January 1981. Sheffield. A routine check.</Head>
    <Plate x={W / 2} y={560} scale={1.3} text="FHY 400K" wrong />
    <Caption y={820} size={46} color={ACCENT}>
      the plates did not belong to the car
    </Caption>
  </SceneFade>
);

const SutcliffeVerdict: Scene = () => (
  <Verdict value="a routine licence check" note="by a force that was not looking for him" />
);

// ── 1990 · Andrei Chikatilo ─────────────────────────────────────────

const ChikOpen: Scene = () => <CaseOpen year="1990" place="Rostov, southern Russia" n={5} />;

const ChikCount: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Paper />
      <Head>Fifty-two, over twelve years.</Head>
      {/* a tally along a railway line: one mark per case */}
      {[...Array(52)].map((_, i) => (
        <path
          key={i}
          d={`M ${250 + i * 27} 620 l 0 ${-46 - (i % 3) * 8}`}
          {...line(5, SLATE)}
          opacity={Math.min(1, Math.max(0, (frame - i * 1.1) / 8))}
        />
      ))}
      <g>
        <path d="M 180 660 L 1740 660" {...line(7, INK)} />
        <path d="M 180 700 L 1740 700" {...line(7, INK)} />
        {[...Array(40)].map((_, i) => (
          <path key={i} d={`M ${196 + i * 39} 648 l 0 64`} {...line(4, FAINT)} />
        ))}
      </g>
      <Caption y={840} size={44}>
        most of them close to railway lines
      </Caption>
    </SceneFade>
  );
};

const Chik1984: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>1984: arrested at a station. A genuine suspect.</Head>
    <Silhouette x={W / 2} y={820} scale={2} />
    <rect x={1160} y={420} width={440} height={170} rx={8} {...line(5, ACCENT)} fill="#ffffff" />
    <Note x={1380} y={525} size={46} color={ACCENT}>
      in custody
    </Note>
  </SceneFade>
);

const BloodTest: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>A blood test let him go.</Head>
    <g>
      <rect x={300} y={400} width={560} height={340} rx={10} {...line(5, INK)} fill="#ffffff" />
      <Note x={580} y={510} size={40} color={GREY}>
        his blood
      </Note>
      <Note x={580} y={620} size={96} color={INK}>
        A
      </Note>
    </g>
    <g>
      <rect x={1060} y={400} width={560} height={340} rx={10} {...line(5, INK)} fill="#ffffff" />
      <Note x={1340} y={510} size={40} color={GREY}>
        the samples
      </Note>
      <Note x={1340} y={620} size={96} color={INK}>
        AB
      </Note>
    </g>
    <Caption y={880} size={46}>
      on the science of the day, that cleared him
    </Caption>
  </SceneFade>
);

const Secretor: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>A rare mismatch between blood and other fluids.</Head>
    <Crowd n={60} x={430} y={520} cols={20} gap={54} scale={0.24} lit={1} litFill={ACCENT} />
    <Note x={W / 2} y={760} size={44} color={ACCENT}>
      a small number of people report differently
    </Note>
    <Caption y={900} size={48} color={INK}>
      it bought him six more years
    </Caption>
  </SceneFade>
);

const Stakeout: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>1990: the quiet halts were watched.</Head>
    {/* the platform they are standing on, not a line they hang from */}
    <path d={`M 140 880 L ${W - 140} 880`} {...line(8, INK)} />
    <path d={`M 140 916 L ${W - 140} 916`} {...line(4, FAINT)} />
    {[
      { x: 400, busy: true },
      { x: 760, busy: false },
      { x: 1160, busy: false },
      { x: 1520, busy: true },
    ].map((st, i) => (
      <g key={i}>
        <Silhouette x={st.x} y={880} scale={1.35} fill={st.busy ? INK : ACCENT} />
        <Note x={st.x} y={480} size={38} color={st.busy ? INK : ACCENT}>
          {st.busy ? "uniformed" : "watched"}
        </Note>
        <Note x={st.x} y={532} size={30} color={GREY}>
          {st.busy ? "busy station" : "quiet halt"}
        </Note>
      </g>
    ))}
    <Caption>officers were put at the busy stations deliberately, to push him to the others</Caption>
  </SceneFade>
);

const ChikVerdict: Scene = () => (
  <SceneFade>
    <Paper />
    <Notebook x={560} y={560} scale={1} name="Chikatilo" />
    <g>
      <Plaque x={1270} y={480} value="an operation built to catch him" />
    </g>
    <Caption y={880} size={44} color={ACCENT}>
      the only one of the ten of whom that is true
    </Caption>
  </SceneFade>
);

// ── 1991 · Jeffrey Dahmer ───────────────────────────────────────────

const DahmerOpen: Scene = () => <CaseOpen year="1991" place="Milwaukee, Wisconsin" n={6} />;

const DahmerCount: Scene = () => (
  <Stat big="17" sub="men and boys, over thirteen years" />
);

const Escape: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>July 1991. A man walks out of the apartment.</Head>
    <Door x={620} y={880} scale={1.05} open={0.6} />
    <Silhouette x={1120} y={860} scale={1.5} fill={ACCENT} />
    <Arrow from={[820, 700]} to={[1030, 720]} bend={-0.12} color={ACCENT} width={4} />
    <Caption>one handcuff still on his wrist, he flagged down a patrol car</Caption>
  </SceneFade>
);

const Drawer: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>The officers went back with him for the key.</Head>
    <g transform="translate(960 620)">
      <rect x={-360} y={-160} width={720} height={320} rx={10} {...line(STROKE, INK)} fill="#c9b08a" />
      <rect x={-300} y={-100} width={600} height={200} rx={6} {...line(4, "#9c8560")} fill="#d9c5a3" />
      <circle cx={0} cy={0} r={26} {...line(4, INK)} fill="#8d7550" />
    </g>
    <Caption y={900} size={46}>
      in a drawer they found photographs
    </Caption>
    <Caption y={960} size={40}>
      that ended the conversation
    </Caption>
  </SceneFade>
);

const Earlier: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>Two months earlier, at the same building.</Head>
    <Door x={560} y={840} scale={0.85} open={0.55} />
    <Silhouette x={950} y={820} scale={1.1} fill={BLUE} />
    <Arrow from={[1010, 700]} to={[760, 700]} bend={0.14} color={ACCENT} width={4} />
    <rect x={1200} y={470} width={520} height={280} rx={8} {...line(4, FAINT)} fill="#ffffff" />
    <Note x={1460} y={570} size={38} color={GREY}>
      &quot;a domestic argument&quot;
    </Note>
    <Note x={1460} y={650} size={38} color={ACCENT}>
      they walked him back inside
    </Note>
    <Caption>a fourteen-year-old boy had got out into the street</Caption>
  </SceneFade>
);

const Konerak: Scene = () => {
  const { opacity } = usePop(6, 12);
  return (
    <SceneFade>
      <Paper />
      <g opacity={opacity}>
        <Note x={W / 2} y={480} size={40} color={GREY}>
          his name was
        </Note>
        <Note x={W / 2} y={590} size={86} color={INK}>
          Konerak Sinthasomphone
        </Note>
        <Rule x={560} y={650} w={800} />
        <Note x={W / 2} y={740} size={44} color={GREY}>
          he was killed that night
        </Note>
        <Note x={W / 2} y={820} size={40} color={ACCENT}>
          the officers were later dismissed
        </Note>
      </g>
    </SceneFade>
  );
};

const DahmerVerdict: Scene = () => (
  <Verdict value="a victim who got out of the door" note="and was believed the second time" />
);

// ── 1998 · Harold Shipman ───────────────────────────────────────────

const ShipmanOpen: Scene = () => <CaseOpen year="1998" place="Hyde, Greater Manchester" n={7} />;

const ShipmanGp: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>A family doctor.</Head>
    <Bar x={620} y={430} w={760} label="convicted of" value="15" frac={15 / 215} fill={SLATE} />
    <Bar x={620} y={570} w={760} label="inquiry found" value="around 215" frac={1} fill={ACCENT} />
    <Caption y={800} size={42}>
      the public inquiry reported after he was convicted
    </Caption>
  </SceneFade>
);

const Pattern: Scene = () => {
  const rows = [
    "almost all elderly",
    "almost all at home",
    "almost all in the afternoon",
    "almost all certified natural",
  ];
  return (
    <SceneFade>
      <Paper />
      <Head>The pattern nobody looked at.</Head>
      {rows.map((t, i) => {
        const { opacity } = usePop(8 + i * 9, 12);
        return (
          <g key={t} opacity={opacity}>
            <Note x={W / 2} y={430 + i * 120} size={52} color={i === 3 ? ACCENT : INK}>
              {t}
            </Note>
          </g>
        );
      })}
      <Caption>by the man who had just killed them</Caption>
    </SceneFade>
  );
};

const Grundy: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>June 1998. A will appears.</Head>
    <Will x={640} y={620} scale={1} rotate={-4} />
    <Note x={1180} y={520} size={44} color={INK} anchor="start">
      Kathleen Grundy, 81
    </Note>
    <Note x={1180} y={586} size={38} color={GREY} anchor="start">
      died hours after he visited
    </Note>
    <Note x={1180} y={686} size={38} color={ACCENT} anchor="start">
      the estate left to him
    </Note>
    <Note x={1180} y={746} size={38} color={ACCENT} anchor="start">
      typed on a machine he owned
    </Note>
  </SceneFade>
);

const Solicitor: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>Her daughter was a solicitor.</Head>
    <Silhouette x={W / 2} y={800} scale={2.1} fill={BLUE} />
    <Caption y={920} size={52} color={INK}>
      she went to the police
    </Caption>
  </SceneFade>
);

const AuditTrail: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>Then the records.</Head>
    <g transform="translate(960 620)">
      <rect x={-560} y={-220} width={1120} height={440} rx={10} {...line(5, INK)} fill="#ffffff" />
      {[
        ["chest pain", "added"],
        ["breathlessness", "added"],
        ["declining for months", "added"],
      ].map(([a, b], i) => (
        <g key={a}>
          <Note x={-500} y={-110 + i * 120} size={40} color={INK} anchor="start">
            {a}
          </Note>
          <Note x={500} y={-110 + i * 120} size={38} color={ACCENT} anchor="end">
            {b}
          </Note>
          <path d={`M -500 ${-80 + i * 120} l 1000 0`} {...line(3, FAINT)} />
        </g>
      ))}
    </g>
    <Caption>symptoms put into his patients&apos; files, so the deaths would look expected</Caption>
  </SceneFade>
);

const ShipmanVerdict: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Paper />
      <Head>The software stamped every edit.</Head>
      <g transform="translate(960 560)">
        <rect x={-600} y={-140} width={1200} height={300} rx={10} {...line(5, INK)} fill="#ffffff" />
        <Note x={-560} y={-70} size={36} color={GREY} anchor="start">
          entry says
        </Note>
        <Note x={-560} y={-10} size={46} color={INK} anchor="start">
          1 June, 10:04
        </Note>
        <Note x={-560} y={80} size={36} color={GREY} anchor="start">
          actually written
        </Note>
        <g opacity={Math.min(1, Math.max(0, (frame - 24) / 14))}>
          <Note x={-560} y={140} size={46} color={ACCENT} anchor="start">
            24 June, 15:12 — after she died
          </Note>
        </g>
      </g>
      <Caption y={880} size={46} color={ACCENT}>
        greed, and an audit trail he did not know existed
      </Caption>
    </SceneFade>
  );
};

// ── 2001 · Gary Ridgway ─────────────────────────────────────────────

const RidgwayOpen: Scene = () => <CaseOpen year="2001" place="Green River, Washington" n={8} />;

const RidgwayCount: Scene = () => (
  <Stat big="49" sub="murders he eventually pleaded guilty to" sub2="most of the women were killed in the early eighties" />
);

const Swab: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>1987: a saliva sample, on a square of gauze.</Head>
    <SwabBox x={W / 2} y={620} scale={1.15} label="1987" />
    <Caption y={900} size={44}>
      the science of the time could do nothing with it
    </Caption>
    <Caption y={960} size={40} color={ACCENT}>
      it went into a box, and stayed there fourteen years
    </Caption>
  </SceneFade>
);

const Match: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>2001: the method finally existed.</Head>
    <Timeline
      x={280}
      y={560}
      w={1360}
      marks={[
        { at: 0, top: "1987", bottom: "sample taken" },
        { at: 1, top: "2001", bottom: "sample read", accent: true },
      ]}
    />
    <Caption y={820} size={46}>
      it matched three of the earliest victims
    </Caption>
  </SceneFade>
);

const RidgwayVerdict: Scene = () => (
  <Verdict value="a piece of gauze, and the patience to keep it" />
);

// ── 2005 · Dennis Rader ─────────────────────────────────────────────

const BtkOpen: Scene = () => <CaseOpen year="2005" place="Wichita, Kansas" n={9} />;

const BtkCount: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>Ten people. Then he stopped.</Head>
    <Timeline
      x={280}
      y={560}
      w={1360}
      marks={[
        { at: 0, top: "1974", bottom: "first" },
        { at: 0.42, top: "1991", bottom: "last" },
        { at: 1, top: "2004", bottom: "starts writing again", accent: true },
      ]}
    />
    <Caption y={840} size={44}>
      thirteen years of nothing, with nobody pursuing him
    </Caption>
  </SceneFade>
);

const Resumes: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>In 2004, he started writing again.</Head>
    {[0, 1, 2, 3].map((i) => {
      const { opacity } = usePop(8 + i * 10, 12);
      return (
        <g key={i} opacity={opacity}>
          <Envelope x={470 + i * 340} y={620} scale={0.8} rotate={-8 + i * 5} />
        </g>
      );
    })}
    <Caption>nobody asked him to</Caption>
  </SceneFade>
);

const QuestionAsked: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>He asked the police a technical question.</Head>
    <g transform="translate(620 600)">
      <rect x={-300} y={-150} width={600} height={300} rx={10} {...line(5, INK)} fill="#ffffff" />
      <Note x={0} y={-50} size={40} color={INK}>
        can a floppy disk
      </Note>
      <Note x={0} y={10} size={40} color={INK}>
        be traced back
      </Note>
      <Note x={0} y={70} size={40} color={INK}>
        to me?
      </Note>
    </g>
    <Arrow from={[960, 600]} to={[1180, 600]} bend={0} color={FAINT} width={4} />
    <g transform="translate(1450 600)">
      <rect x={-240} y={-150} width={480} height={300} rx={10} {...line(5, ACCENT)} fill="#ffffff" />
      <Note x={0} y={-20} size={48} color={ACCENT}>
        &quot;no&quot;
      </Note>
      <Note x={0} y={70} size={34} color={GREY}>
        answered by newspaper notice
      </Note>
    </g>
    <Caption y={920} size={48} color={ACCENT}>
      that was untrue
    </Caption>
  </SceneFade>
);

const Metadata: Scene = () => {
  const { opacity } = usePop(14, 12);
  return (
    <SceneFade>
      <Paper />
      <Head>He sent the disk.</Head>
      <Floppy x={560} y={600} scale={1.15} />
      <g opacity={opacity}>
        <rect x={900} y={430} width={780} height={340} rx={10} {...line(5, ACCENT)} fill="#ffffff" />
        <Note x={940} y={510} size={34} color={GREY} anchor="start">
          Last modified by
        </Note>
        <Note x={940} y={570} size={52} color={ACCENT} anchor="start">
          Dennis
        </Note>
        <Note x={940} y={650} size={34} color={GREY} anchor="start">
          Organisation
        </Note>
        <Note x={940} y={710} size={44} color={ACCENT} anchor="start">
          Christ Lutheran Church
        </Note>
      </g>
      <Caption>what every word processor saves without being asked</Caption>
    </SceneFade>
  );
};

const Church: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>The church website listed its council.</Head>
    <g transform="translate(960 620)">
      <rect x={-520} y={-200} width={1040} height={400} rx={10} {...line(5, INK)} fill="#ffffff" />
      <path d="M -520 -120 l 1040 0" {...line(3, FAINT)} />
      <Note x={-470} y={-140} size={34} color={GREY} anchor="start">
        Christ Lutheran Church — council
      </Note>
      <Note x={-470} y={-40} size={40} color={GREY} anchor="start">
        President
      </Note>
      <Note x={470} y={-40} size={48} color={ACCENT} anchor="end">
        Dennis Rader
      </Note>
      <Note x={-470} y={60} size={40} color={FAINT} anchor="start">
        Secretary
      </Note>
      <Note x={-470} y={150} size={40} color={FAINT} anchor="start">
        Treasurer
      </Note>
    </g>
  </SceneFade>
);

const BtkVerdict: Scene = () => (
  <SceneFade>
    <Paper />
    <Bar x={640} y={400} w={800} label="investigation" value="31 years" frac={1} fill={SLATE} />
    <Bar x={640} y={520} w={800} label="disk to handcuffs" value="about 10 days" frac={0.012} fill={ACCENT} />
    <Plaque x={W / 2} y={790} value="asking the police a question" w={840} />
  </SceneFade>
);

// ── 2018 · Joseph DeAngelo ──────────────────────────────────────────

const GskOpen: Scene = () => <CaseOpen year="2018" place="California" n={10} />;

const GskCount: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>Thirteen murders. More than fifty rapes.</Head>
    <Timeline
      x={280}
      y={540}
      w={1360}
      marks={[
        { at: 0, top: "1974", bottom: "first" },
        { at: 0.28, top: "1986", bottom: "last" },
        { at: 1, top: "2018", bottom: "arrested", accent: true },
      ]}
    />
    <Caption y={840} size={46} color={ACCENT}>
      for part of that time he was a serving police officer
    </Caption>
  </SceneFade>
);

const NoMatch: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>His DNA matched nothing, for decades.</Head>
    <g transform="translate(960 620)">
      <rect x={-520} y={-180} width={1040} height={360} rx={10} {...line(5, INK)} fill="#ffffff" />
      <Note x={0} y={-80} size={44} color={INK}>
        the criminal database holds
      </Note>
      <Note x={0} y={-10} size={44} color={INK}>
        people who have been arrested
      </Note>
      <Note x={0} y={110} size={50} color={ACCENT}>
        he never had been
      </Note>
    </g>
  </SceneFade>
);

const Gedmatch: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>So they uploaded him to a genealogy site.</Head>
    <g transform="translate(960 620)">
      <rect x={-460} y={-180} width={920} height={360} rx={12} {...line(5, INK)} fill="#ffffff" />
      <path d="M -460 -100 l 920 0" {...line(3, FAINT)} />
      <Note x={-410} y={-124} size={32} color={GREY} anchor="start">
        find relatives
      </Note>
      <Note x={0} y={0} size={44} color={GREY}>
        upload your DNA file
      </Note>
      <rect x={-180} y={50} width={360} height={90} rx={8} {...line(4, ACCENT)} fill="#ffffff" />
      <Note x={0} y={112} size={40} color={ACCENT}>
        crime scene profile
      </Note>
    </g>
    <Caption>as though it were an ordinary customer</Caption>
  </SceneFade>
);

const Cousins: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>The matches were third and fourth cousins.</Head>
    <FamilyTree x={W / 2} y={600} scale={1.15} />
    <Caption>trees built forward until the branches crossed at one man</Caption>
  </SceneFade>
);

const Bin: Scene = () => (
  <SceneFade>
    <Paper />
    <Head>They confirmed it from his kerbside bin.</Head>
    <g transform="translate(760 700)">
      <path d="M -170 -180 l 340 0 l -34 360 l -272 0 Z" {...line(STROKE, INK)} fill="#5d6b57" />
      <path d="M -196 -180 l 392 0 l 0 -50 l -392 0 Z" {...line(STROKE, INK)} fill="#4c5847" />
      <path d="M -60 -230 l 120 0 l 0 -30 l -120 0 Z" {...line(4, INK)} fill="#4c5847" />
    </g>
    <Silhouette x={1320} y={880} scale={1.7} fill={ACCENT} />
    <Caption>arrested in his own driveway, at seventy-two</Caption>
  </SceneFade>
);

const GskVerdict: Scene = () => (
  <Verdict value="his relatives' curiosity about their own ancestry" />
);

// ── the board ───────────────────────────────────────────────────────

const ROWS: [string, string][] = [
  ["1888", "nothing"],
  ["1978", "a stolen car"],
  ["1978", "a photograph receipt"],
  ["1981", "a number plate"],
  ["1990", "a notebook"],
  ["1991", "a man who got out of a door"],
  ["1998", "a forged will"],
  ["2001", "a square of gauze"],
  ["2005", "a floppy disk"],
  ["2018", "a cousin"],
];

const Board: Scene = () => (
  <SceneFade>
    <Paper />
    <Note x={W / 2} y={180} size={62} color={INK}>
      what actually stopped them
    </Note>
    {ROWS.map(([year, what], i) => {
      const { opacity } = usePop(2 + i * 3, 12);
      const y = 270 + i * 76;
      return (
        <g key={year + what} opacity={opacity}>
          <Note x={640} y={y + 46} size={42} color={GREY} anchor="end">
            {year}
          </Note>
          <Note x={700} y={y + 46} size={46} color={i === 4 ? ACCENT : INK} anchor="start">
            {what}
          </Note>
          <path d={`M 640 ${y + 62} l 620 0`} {...line(2, FAINT)} />
        </g>
      );
    })}
  </SceneFade>
);

const PatternClose: Scene = () => (
  <SceneFade>
    <Paper />
    <Head y={300} size={52}>
      One was stopped by an operation designed to stop him.
    </Head>
    <Crowd n={10} x={560} y={640} cols={10} gap={92} scale={0.5} lit={1} litFill={ACCENT} />
    <Caption y={820} size={48} color={INK}>
      the rest were ended by something small and unrelated
    </Caption>
    <Caption y={890} size={42}>
      usually by a mistake of their own
    </Caption>
  </SceneFade>
);

const GoingBack: Scene = () => (
  <SceneFade>
    <Paper />
    <Head y={280} size={54}>
      And the newest method is now running backwards.
    </Head>
    <FamilyTree x={W / 2} y={600} scale={0.8} />
    <Caption y={900} size={44} color={ACCENT}>
      since 2018, genetic genealogy has named suspects
    </Caption>
    <Caption y={958} size={44} color={ACCENT}>
      in hundreds of cases that had been cold for decades
    </Caption>
  </SceneFade>
);

const Signoff: Scene = () => {
  const { opacity } = usePop(16, 12);
  return (
    <SceneFade>
      <Paper />
      <Note x={W / 2} y={330} size={52} color={INK}>
        the thing that catches the next one
      </Note>
      <Note x={W / 2} y={400} size={52} color={INK}>
        has probably already been invented
      </Note>
      <Tube x={W / 2} y={720} scale={1.15} />
      <g opacity={opacity}>
        <Note x={W / 2} y={900} size={44} color={GREY}>
          and the thing that catches the last of the old ones
        </Note>
        <Note x={W / 2} y={960} size={44} color={GREY}>
          is a stranger, somewhere, spitting into a tube
        </Note>
      </g>
    </SceneFade>
  );
};

// ── registry ────────────────────────────────────────────────────────

const SCENES: Record<string, Scene> = {
  open: Open,
  question: Question,
  "what-stopped": WhatStopped,
  "not-detectives": NotDetectives,
  "ripper-open": RipperOpen,
  "ripper-ten-weeks": RipperTenWeeks,
  "no-forensics": NoForensics,
  "ripper-stops": RipperStops,
  "ripper-verdict": RipperVerdict,
  "bundy-open": BundyOpen,
  "bundy-states": BundyStates,
  "bundy-stop": BundyStop,
  "bundy-kit": BundyKit,
  "bundy-lineup": BundyLineup,
  "bundy-escape": BundyEscape,
  "bundy-verdict": BundyVerdict,
  "gacy-open": GacyOpen,
  "gacy-count": GacyCount,
  "gacy-piest": GacyPiest,
  "gacy-receipt": GacyReceipt,
  "gacy-proof": GacyProof,
  "gacy-verdict": GacyVerdict,
  "sutcliffe-open": SutcliffeOpen,
  "sutcliffe-scale": SutcliffeScale,
  "sutcliffe-nine": SutcliffeNine,
  "hoax-tape": HoaxTape,
  "wrong-voice": WrongVoice,
  plates: Plates,
  "sutcliffe-verdict": SutcliffeVerdict,
  "chik-open": ChikOpen,
  "chik-count": ChikCount,
  "chik-1984": Chik1984,
  "blood-test": BloodTest,
  secretor: Secretor,
  stakeout: Stakeout,
  "chik-verdict": ChikVerdict,
  "dahmer-open": DahmerOpen,
  "dahmer-count": DahmerCount,
  escape: Escape,
  drawer: Drawer,
  earlier: Earlier,
  konerak: Konerak,
  "dahmer-verdict": DahmerVerdict,
  "shipman-open": ShipmanOpen,
  "shipman-gp": ShipmanGp,
  pattern: Pattern,
  grundy: Grundy,
  solicitor: Solicitor,
  "audit-trail": AuditTrail,
  "shipman-verdict": ShipmanVerdict,
  "ridgway-open": RidgwayOpen,
  "ridgway-count": RidgwayCount,
  swab: Swab,
  match: Match,
  "ridgway-verdict": RidgwayVerdict,
  "btk-open": BtkOpen,
  "btk-count": BtkCount,
  resumes: Resumes,
  "question-asked": QuestionAsked,
  metadata: Metadata,
  church: Church,
  "btk-verdict": BtkVerdict,
  "gsk-open": GskOpen,
  "gsk-count": GskCount,
  "no-match": NoMatch,
  gedmatch: Gedmatch,
  cousins: Cousins,
  bin: Bin,
  "gsk-verdict": GskVerdict,
  board: Board,
  "pattern-close": PatternClose,
  "going-back": GoingBack,
  signoff: Signoff,
};

/** Scenes on a dark ground, which need the boxed chapter title. */
export const DARK_SCENES = new Set(["bundy-stop"]);

export const renderScene = (scene: string) => {
  const C = SCENES[scene];
  return C ? <C /> : null;
};

export const SCENE_NAMES = Object.keys(SCENES);
