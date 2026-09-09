import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Astronaut, Habitat, Lander, Probe } from "./character";
import {
  Arrow,
  Band,
  DoodlePlanet,
  H,
  Note,
  PlanetPhoto,
  Rocks,
  SceneFade,
  Sky,
  SpeechBubble,
  Stamp,
  Stars,
  Sun,
  STROKE,
  Temp,
  Thermometer,
  W,
  blob,
  grey,
  ink,
  line,
  red,
  ridge,
  smooth,
  usePop,
} from "./kit";

// One component per narration line. Each is mounted inside its own
// Sequence, so useCurrentFrame() here is 0 at the start of the line.

type Scene = React.FC;

// ── shared backdrops ────────────────────────────────────────────────

const MercuryDay: Scene = () => (
  <>
    <rect x={0} y={0} width={W} height={H} fill="#fff" />
    <Sky from="#ffffff" to="#f6a86a" y={880} />
    <Band y={870} fill="#8e8a92" seed={11} amp={7} bow={46} />
    <Rocks y={905} fill="#7c7883" seed={12} count={5} />
  </>
);

const MercuryNight: Scene = () => (
  <>
    <rect x={0} y={0} width={W} height={H} fill="#0a0b14" />
    <Stars seed={21} h={860} />
    <Band y={870} fill="#4a4854" seed={11} amp={7} bow={46} stroke="#20202c" />
  </>
);

const VenusSurface: React.FC<{ dim?: boolean }> = ({ dim }) => (
  <>
    <rect x={0} y={0} width={W} height={H} fill="#fff" />
    <Sky from={dim ? "#e8bf5e" : "#f6dc8a"} to={dim ? "#d99a35" : "#e8b34a"} y={640} />
    <Band y={630} fill={dim ? "#d9ab45" : "#e0be5e"} seed={31} amp={14} bow={0} />
    <Rocks y={690} fill={dim ? "#c8962f" : "#d3ac48"} seed={32} count={5} />
    <Band y={790} fill={dim ? "#c98a2a" : "#cf9a3a"} seed={33} amp={9} />
    <Band y={900} fill={dim ? "#b3721f" : "#b97f27"} seed={34} amp={7} />
  </>
);

const MarsSurface: Scene = () => (
  <>
    <rect x={0} y={0} width={W} height={H} fill="#fff" />
    <Sky from="#ffffff" to="#f0c9a8" y={700} />
    <Band y={690} fill="#c9704a" seed={41} amp={13} bow={18} />
    <Rocks y={745} fill="#b45f3d" seed={42} count={6} />
    <Band y={840} fill="#b45f3d" seed={43} amp={9} />
    <Band y={950} fill="#9c4d31" seed={44} amp={7} />
  </>
);

// ── 1. the solar system line-up ─────────────────────────────────────

const ORDER = [
  { id: "mercury", name: "Mercury", r: 16, fill: "#9c9188" },
  { id: "venus", name: "Venus", r: 30, fill: "#d9a441" },
  { id: "earth", name: "Earth", r: 32, fill: "#4a86c8" },
  { id: "mars", name: "Mars", r: 22, fill: "#c1583a" },
  { id: "jupiter", name: "Jupiter", r: 76, fill: "#d3a679" },
  { id: "saturn", name: "Saturn", r: 64, fill: "#e0c48a" },
  { id: "uranus", name: "Uranus", r: 44, fill: "#a8d8dd" },
  { id: "neptune", name: "Neptune", r: 42, fill: "#5d7fd0" },
];

export const Lineup: React.FC<{ focus: string }> = ({ focus }) => {
  const frame = useCurrentFrame();
  const { scale } = usePop(2, 11);
  let x = 470;
  const items = ORDER.map((p) => {
    const gap = p.r + 62;
    x += gap;
    const at = x;
    x += p.r;
    const isFocus = p.id === focus;
    const grow = isFocus ? 1 + 1.5 * scale : 1;
    return (
      <g key={p.id} opacity={isFocus ? 1 : 0.45}>
        {p.id === "saturn" ? (
          <ellipse
            cx={at}
            cy={520}
            rx={p.r * 1.9 * grow}
            ry={p.r * 0.42 * grow}
            transform={`rotate(-14 ${at} 520)`}
            {...line(4, "#b39a63")}
          />
        ) : null}
        <DoodlePlanet x={at} y={520} r={p.r * grow} fill={p.fill} seed={p.r} craters={2} />
        {isFocus ? (
          <>
            <path d={`M ${at} ${520 + p.r * grow + 16} l 0 ${86 - p.r * grow * 0.4}`} {...line(4)} />
            <Note x={at} y={700} size={70} color={ink}>
              {p.name}
            </Note>
          </>
        ) : null}
      </g>
    );
  });
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#fff" />
      <Sun x={110} y={520} r={230} seed={5} rays={16} />
      <Note x={150} y={820} size={38} color={grey}>
        Sun
      </Note>
      <g transform={`translate(${interpolate(frame, [0, 40], [0, -14])} 0)`}>{items}</g>
    </SceneFade>
  );
};

// ── Mercury ─────────────────────────────────────────────────────────

const SunClose: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(24);
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#fff" />
      <Sun x={180} y={560} r={340} seed={9} rays={18} />
      <DoodlePlanet x={1080} y={560} r={62} fill="#9c9188" seed={17} craters={4} />
      <Note x={1080} y={690} size={40} color={grey}>
        Mercury
      </Note>
      <DoodlePlanet x={1620} y={560} r={92} fill="#4a86c8" seed={23} craters={3} crater="rgba(255,255,255,0.35)" />
      <Note x={1620} y={720} size={40} color={grey}>
        Earth
      </Note>
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M ${560 + i * 20} ${430 + i * 130} q 130 ${-30 + i * 26} 250 ${i * 8}`}
          {...line(5, "#eba31c")}
          strokeDasharray="18 16"
          strokeDashoffset={-frame * 2}
        />
      ))}
      <g opacity={opacity}>
        <Note x={1090} y={330} size={64} color={red} outline>
          7&#215; the sunlight
        </Note>
        <Arrow from={[1090, 360]} to={[1080, 470]} bend={-0.25} />
      </g>
    </SceneFade>
  );
};

const Exosphere: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(20);
  const r = 330 + Math.sin(frame / 26) * 6;
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#fff" />
      <circle cx={W / 2} cy={600} r={r} {...line(14, "#8ec6f0")} />
      <PlanetPhoto src="mercury" x={W / 2} y={600} r={215} />
      <g opacity={opacity}>
        <Note x={W / 2} y={288} size={66} color={red} outline>
          exosphere
        </Note>
        <Note x={1560} y={470} size={40} color={grey}>
          almost no air
        </Note>
        <Arrow from={[1520, 500]} to={[1290, 560]} bend={0.2} color={grey} />
      </g>
    </SceneFade>
  );
};

const DayNight: Scene = () => {
  const frame = useCurrentFrame();
  const split = interpolate(frame, [4, 22], [W, W / 2], { extrapolateRight: "clamp" });
  const cold = usePop(46);
  return (
    <SceneFade>
      <MercuryDay />
      <g clipPath="url(#nightclip)">
        <MercuryNight />
      </g>
      <clipPath id="nightclip">
        <rect x={split} y={0} width={W} height={H} />
      </clipPath>
      <path d={ridge(split, split, 0, 0, 2, 3)} />
      <path d={smooth([[split, -10], [split + 8, 300], [split - 6, 700], [split + 4, H + 10]])} {...line(6)} />
      <Sun x={330} y={300} r={120} seed={4} />
      <Temp x={470} y={620} c="430&#176;C" f="806&#176;F" hot />
      <g opacity={cold.opacity}>
        <Temp x={1450} y={620} c="&#8722;180&#176;C" f="&#8722;292&#176;F" />
      </g>
      <Note x={470} y={860} size={40} color="#8a5a2a">
        day
      </Note>
      <Note x={1450} y={860} size={40} color="#cfd6ee">
        night
      </Note>
    </SceneFade>
  );
};

const SuitLimit: Scene = () => {
  const frame = useCurrentFrame();
  const cross = usePop(60, 9);
  return (
    <SceneFade>
      <MercuryDay />
      <Sun x={260} y={250} r={110} seed={4} />
      <Astronaut x={780} y={950} scale={1.45} face="sweat" arms="out" />
      <Thermometer x={1420} y={790} fill={0.96} hot />
      <Note x={1420} y={470} size={56} color="#e8631b" outline>
        430&#176;C
      </Note>
      <Note x={1660} y={640} size={38} color={grey} anchor="middle">
        suit limit
      </Note>
      <Note x={1660} y={690} size={44} color={ink} anchor="middle">
        121&#176;C
      </Note>
      <Arrow from={[1620, 720]} to={[1478, 762]} bend={0.2} color={grey} />
      <g opacity={cross.opacity}>
        <path d="M 610 450 L 960 910 M 960 450 L 610 910" {...line(18, red)} />
      </g>
      <g opacity={interpolate(frame, [10, 26], [0, 1], { extrapolateRight: "clamp" })}>
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M ${740 + i * 120} 300 q 26 40 0 80 q -26 40 0 80`}
            {...line(5, "#e8631b")}
          />
        ))}
      </g>
    </SceneFade>
  );
};

const NightFreeze: Scene = () => {
  const { opacity } = usePop(34);
  return (
    <SceneFade>
      <MercuryNight />
      <Astronaut x={820} y={955} scale={1.45} face="cold" arms="down" />
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M ${1180 + i * 60} ${420 + (i % 2) * 60} l 0 60 M ${1150 + i * 60} ${450 + (i % 2) * 60} l 60 0 M ${1158 + i * 60} ${428 + (i % 2) * 60} l 44 44 M ${1202 + i * 60} ${428 + (i % 2) * 60} l -44 44`}
          {...line(4, "#9fd0f5")}
        />
      ))}
      <Temp x={480} y={520} c="&#8722;180&#176;C" f="&#8722;292&#176;F" />
      <g opacity={opacity}>
        <Note x={1500} y={760} size={38} color="#cfd6ee">
          suits stop at
        </Note>
        <Note x={1500} y={812} size={46} color="#ffffff">
          &#8722;157&#176;C
        </Note>
      </g>
    </SceneFade>
  );
};

const SlowSpin: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(28);
  const a = frame / 40;
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#fff" />
      <Sun x={210} y={560} r={150} seed={4} />
      <PlanetPhoto src="mercury" x={1080} y={560} r={230} />
      <circle
        cx={1080 + Math.cos(a) * 232}
        cy={560 + Math.sin(a) * 232 * 0.28}
        r={16}
        fill={red}
        opacity={Math.sin(a) > 0 ? 1 : 0.25}
      />
      <Arrow from={[1080 - 300, 300]} to={[1080 + 300, 300]} bend={-0.3} color={grey} width={5} />
      <g opacity={opacity}>
        <Note x={1560} y={790} size={42} color={grey}>
          one day + night
        </Note>
        <Note x={1560} y={856} size={64} color={ink}>
          176 Earth days
        </Note>
        <Arrow from={[1490, 760]} to={[1290, 660]} bend={0.2} color={grey} />
      </g>
    </SceneFade>
  );
};

const Terminator: Scene = () => {
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#fff" />
      <PlanetPhoto src="mercury" x={W / 2} y={580} r={280} />
      <g clipPath="url(#halfclip)">
        <circle cx={W / 2} cy={580} r={280} fill="#0a0b14" opacity={0.82} />
      </g>
      <clipPath id="halfclip">
        <rect x={W / 2 + 26} y={0} width={W} height={H} />
      </clipPath>
      <path d={`M ${W / 2 + 8} 302 q 26 278 0 556`} {...line(26, "#7ed07e")} strokeOpacity={0.75} />
      <circle cx={W / 2} cy={580} r={280} {...line(STROKE - 1)} />
      <g opacity={opacity}>
        <Note x={1420} y={318} size={54} color={red} outline anchor="start">
          terminator zone
        </Note>
        <Arrow from={[1420, 350]} to={[1010, 470]} bend={0.16} />
        <Note x={520} y={900} size={40} color={grey}>
          day
        </Note>
        <Note x={1400} y={900} size={40} color={grey}>
          night
        </Note>
      </g>
      <Thermometer x={330} y={760} fill={0.5} hot={false} h={180} />
    </SceneFade>
  );
};

const MercVerdict: Scene = () => (
  <SceneFade>
    <rect x={0} y={0} width={W} height={H} fill="#fff" />
    <Sky from="#ffffff" to="#a9b4d8" y={880} />
    <Band y={870} fill="#7a7684" seed={11} amp={7} bow={46} />
    <Rocks y={905} fill="#6a6674" seed={12} count={4} />
    <Astronaut x={520} y={950} scale={1.4} face="calm" arms="down" />
    <g>
      <rect x={690} y={470} width={210} height={64} rx={12} {...line(STROKE - 1)} fill="#fff" />
      <rect x={698} y={478} width={130} height={48} rx={8} fill="#7ed07e" />
      <Note x={795} y={444} size={34} color={grey}>
        oxygen
      </Note>
    </g>
    <Stamp x={1370} y={560} label="IN A SUIT, TWILIGHT ZONE" value="A FEW HOURS" delay={14} />
  </SceneFade>
);

const MercVacuum: Scene = () => {
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <MercuryNight />
      <Astronaut x={520} y={950} scale={1.4} face="dead" helmet={false} arms="out" />
      <g opacity={opacity}>
        <Note x={520} y={410} size={40} color="#cfd6ee">
          15 s &#8594; unconscious
        </Note>
      </g>
      <Stamp x={1330} y={560} label="NO SUIT" value="~90 SECONDS" delay={16} />
    </SceneFade>
  );
};

// ── Venus ───────────────────────────────────────────────────────────

const VenusTwin: Scene = () => {
  const { opacity } = usePop(26);
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#fff" />
      <PlanetPhoto src="venus" x={640} y={560} r={220} />
      <PlanetPhoto src="earth" x={1360} y={560} r={232} />
      <Note x={W / 2} y={600} size={110} color={grey}>
        &#8776;
      </Note>
      <Note x={640} y={850} size={44} color={ink}>
        Venus
      </Note>
      <Note x={1360} y={850} size={44} color={ink}>
        Earth
      </Note>
      <g opacity={opacity}>
        <Note x={W / 2} y={950} size={40} color={grey}>
          95% the size &#183; 0.9 g
        </Note>
        <Note x={W / 2} y={250} size={44} color={grey}>
          our closest neighbour
        </Note>
      </g>
    </SceneFade>
  );
};

const VenusHostile: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(12);
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#fff" />
      {[...Array(12)].map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const r0 = 300 + Math.sin(frame / 9 + i) * 8;
        return (
          <path
            key={i}
            d={`M ${W / 2 + Math.cos(a) * r0} ${560 + Math.sin(a) * r0} l ${Math.cos(a) * 90} ${
              Math.sin(a) * 90
            }`}
            {...line(7, "#e8631b")}
          />
        );
      })}
      <PlanetPhoto src="venus" x={W / 2} y={560} r={260} />
      <g opacity={opacity}>
        <Note x={W / 2} y={960} size={58} color={red} outline>
          the hottest surface in the solar system
        </Note>
      </g>
    </SceneFade>
  );
};

const AcidClouds: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(30);
  const clouds = [...Array(9)].map((_, i) => {
    const y = 300 + (i % 3) * 190;
    const x = ((i * 337 + frame * 0.5) % (W + 600)) - 300;
    const s = 0.8 + (i % 3) * 0.35;
    return (
      <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={0.95}>
        <path d={blob(0, 0, 120, i + 3, 0.16)} fill="#e8de74" />
        <path d={blob(0, 0, 120, i + 3, 0.16)} {...line(4, "#c7bb45")} />
      </g>
    );
  });
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#fff" />
      <Sky from="#fdf6c9" to="#e8c85a" y={H} />
      <Sun x={300} y={190} r={95} seed={4} />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M ${360 + i * 60} 300 l ${60 + i * 20} 190`}
          {...line(5, "#eba31c")}
          strokeDasharray="16 18"
          strokeDashoffset={-frame * 2}
        />
      ))}
      {clouds}
      <Lander x={1180} y={interpolate(frame, [0, 220], [330, 620])} scale={0.85} />
      <g opacity={opacity}>
        <Note x={1500} y={300} size={58} color={red} outline>
          sulfuric acid
        </Note>
        <Arrow from={[1500, 335]} to={[1330, 420]} bend={0.18} />
        <Note x={560} y={930} size={44} color="#7a5a10">
          only 10% of the sunlight gets through
        </Note>
      </g>
    </SceneFade>
  );
};

const VenusHeat: Scene = () => {
  const { opacity } = usePop(34);
  return (
    <SceneFade>
      <VenusSurface dim />
      <Astronaut x={600} y={965} scale={1.45} face="shock" arms="out" />
      <Thermometer x={1180} y={800} fill={1} hot />
      <Temp x={1520} y={560} c="465&#176;C" f="869&#176;F" hot />
      <g opacity={opacity}>
        <Note x={1520} y={806} size={42} color="#7a4a08" outline>
          hot enough to
        </Note>
        <Note x={1520} y={860} size={42} color="#7a4a08" outline>
          melt lead
        </Note>
      </g>
    </SceneFade>
  );
};

const VenusPress: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <VenusSurface dim />
      <Astronaut x={700} y={965} scale={1.4} face="shock" arms="out" squash={interpolate(frame, [20, 120], [1, 0.94], { extrapolateRight: "clamp" })} />
      {[-1, 0, 1].map((i) => (
        <Arrow
          key={i}
          from={[700 + i * 170, 300 + Math.sin(frame / 8 + i) * 10]}
          to={[700 + i * 170, 470 + Math.sin(frame / 8 + i) * 10]}
          bend={0}
          color={red}
          width={9}
          head={26}
        />
      ))}
      <Note x={700} y={252} size={64} color={red} outline>
        92 bar
      </Note>
      <g opacity={opacity}>
        <Note x={1450} y={520} size={40} color="#7a4a08" outline>
          same as
        </Note>
        <Note x={1450} y={578} size={52} color="#5c3d0a" outline>
          900 m under the sea
        </Note>
        <Arrow from={[1450, 610]} to={[1010, 700]} bend={0.14} color="#7a5510" />
      </g>
    </SceneFade>
  );
};

const Venera: Scene = () => (
  <SceneFade>
    <VenusSurface dim />
    <Probe x={560} y={880} scale={1.75} />
    <Note x={560} y={968} size={40} color="#5c3d0a" outline>
      Venera 13, 1982
    </Note>
    <Stamp x={1330} y={520} label="TOUGHEST MACHINE WE BUILT" value="127 MINUTES" delay={26} />
  </SceneFade>
);

const VenusSuit: Scene = () => {
  const frame = useCurrentFrame();
  const crush = interpolate(frame, [10, 90], [1, 0.8], { extrapolateRight: "clamp" });
  return (
    <SceneFade>
      <VenusSurface dim />
      <Astronaut x={620} y={965} scale={1.45} face="shock" arms="down" squash={crush} />
      <g opacity={interpolate(frame, [60, 80], [0, 1], { extrapolateRight: "clamp" })}>
        <path d="M 590 700 l 40 -60 l -18 62 l 46 -30" {...line(6, ink)} />
        <path d="M 660 780 l 44 -34 l -20 54" {...line(6, ink)} />
      </g>
      <Stamp x={1330} y={520} label="BEST SUIT EVER BUILT" value="A FEW SECONDS" delay={20} />
    </SceneFade>
  );
};

const VenusVerdict: Scene = () => {
  const frame = useCurrentFrame();
  const flash = interpolate(frame, [0, 6, 16], [0.85, 0.35, 0], { extrapolateRight: "clamp" });
  return (
    <SceneFade frames={2}>
      <VenusSurface dim />
      <Astronaut x={620} y={965} scale={1.45} face="dead" helmet={false} arms="down" squash={0.86} />
      <Stamp x={1330} y={520} label="NO SUIT" value="UNDER 1 SECOND" delay={8} />
      <rect x={0} y={0} width={W} height={H} fill={red} opacity={flash} />
    </SceneFade>
  );
};

// ── Mars ────────────────────────────────────────────────────────────

const MarsFriendly: Scene = () => {
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <MarsSurface />
      <Astronaut x={700} y={960} scale={1.45} face="happy" arms="wave" />
      <g opacity={opacity}>
        <SpeechBubble x={1010} y={470} text="not bad" tail={[-50, 86]} />
        <Note x={1560} y={880} size={40} color="#8a4530" outline>
          the friendliest one
        </Note>
      </g>
    </SceneFade>
  );
};

const MarsTemp: Scene = () => {
  const frame = useCurrentFrame();
  const split = interpolate(frame, [4, 20], [W, W / 2], { extrapolateRight: "clamp" });
  const cold = usePop(40);
  return (
    <SceneFade>
      <MarsSurface />
      <g clipPath="url(#marsnight)">
        <rect x={0} y={0} width={W} height={H} fill="#160f14" />
        <Stars seed={55} h={700} />
        <Band y={690} fill="#5b3327" seed={41} amp={13} bow={18} stroke="#2a1a14" />
        <Band y={840} fill="#4a2a20" seed={43} amp={9} stroke="#2a1a14" />
        <Band y={950} fill="#3a2018" seed={44} amp={7} stroke="#2a1a14" />
      </g>
      <clipPath id="marsnight">
        <rect x={split} y={0} width={W} height={H} />
      </clipPath>
      <path d={smooth([[split, -10], [split + 8, 300], [split - 6, 700], [split + 4, H + 10]])} {...line(6)} />
      <Sun x={330} y={280} r={100} seed={4} />
      <Temp x={470} y={560} c="20&#176;C" f="68&#176;F" hot />
      <g opacity={cold.opacity}>
        <Temp x={1450} y={560} c="&#8722;73&#176;C" f="&#8722;99&#176;F" />
      </g>
      <Note x={470} y={880} size={40} color="#8a4530">
        summer noon
      </Note>
      <Note x={1450} y={880} size={40} color="#cfd6ee">
        that night
      </Note>
    </SceneFade>
  );
};

const MarsAir: Scene = () => {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [6, 40], [0, 1000], { extrapolateRight: "clamp" });
  const { opacity } = usePop(48);
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#fff" />
      <Note x={W / 2} y={300} size={46} color={grey}>
        what you would be breathing
      </Note>
      <rect x={460} y={370} width={w} height={130} {...line(STROKE - 1)} fill="#c9704a" />
      <Note x={460 + Math.min(w, 1000) / 2} y={455} size={54} color="#fff">
        95% carbon dioxide
      </Note>
      <g opacity={opacity}>
        <rect x={1460} y={370} width={22} height={130} {...line(4)} fill="#7ed07e" />
        <Note x={1560} y={330} size={38} color={grey} anchor="start">
          0.1% oxygen
        </Note>
        <Arrow from={[1560, 350]} to={[1490, 420]} bend={0.2} color={grey} head={16} />
        <Note x={W / 2} y={700} size={44} color={grey}>
          and there is almost none of it
        </Note>
        <Note x={W / 2} y={800} size={72} color={red} outline>
          0.6% of Earth&#8217;s pressure
        </Note>
      </g>
    </SceneFade>
  );
};

const Armstrong: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(50);
  const bubbles = [...Array(7)].map((_, i) => {
    const t = ((frame * 1.6 + i * 24) % 150) / 150;
    return (
      <circle
        key={i}
        cx={1630 + Math.sin(i * 2 + t * 4) * 34}
        cy={610 - t * 260}
        r={7 + (i % 3) * 5}
        {...line(3, "#3aa0e6")}
        fill="none"
      />
    );
  });
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#fff" />
      {/* pressure scale */}
      <path d="M 520 300 l 0 560" {...line(6)} />
      <path d="M 500 300 l 40 0 M 500 860 l 40 0" {...line(5)} />
      <Note x={430} y={318} size={38} color={grey} anchor="end">
        Earth
      </Note>
      <Note x={430} y={874} size={38} color={grey} anchor="end">
        vacuum
      </Note>
      <path d="M 400 782 l 500 0" {...line(6, red)} strokeDasharray="20 16" />
      <Note x={880} y={756} size={44} color={red} anchor="start">
        Armstrong limit &#8212; 6%
      </Note>
      <Note x={880} y={812} size={34} color={grey} anchor="start">
        below this, water boils at body heat
      </Note>
      <circle cx={520} cy={853} r={17} {...line(4)} fill={red} />
      <Note x={560} y={905} size={44} color={ink} anchor="start">
        Mars &#8212; 0.6%
      </Note>
      <g opacity={opacity}>
        <path d="M 1580 620 q -30 -120 50 -190 q 80 70 50 190 Z" {...line(STROKE - 1)} fill="#cfe8fb" />
        {bubbles}
        <Note x={1630} y={730} size={40} color={grey}>
          your own blood
        </Note>
        <Note x={1630} y={782} size={40} color={grey}>
          starts to boil
        </Note>
      </g>
    </SceneFade>
  );
};

const MarsVacuum: Scene = () => {
  const { opacity } = usePop(26);
  return (
    <SceneFade>
      <MarsSurface />
      <Astronaut x={560} y={960} scale={1.4} face="dead" helmet={false} arms="out" />
      <g opacity={opacity}>
        <Note x={560} y={410} size={40} color="#8a4530" outline>
          15 s &#8594; unconscious
        </Note>
      </g>
      <Stamp x={1340} y={520} label="NO SUIT" value="~2 MINUTES" delay={14} />
    </SceneFade>
  );
};

const MarsRad: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(28);
  return (
    <SceneFade>
      <MarsSurface />
      <Astronaut x={700} y={960} scale={1.4} face="calm" arms="down" />
      {[...Array(7)].map((_, i) => (
        <path
          key={i}
          d={`M ${300 + i * 230} 120 q 26 60 0 120 q -26 60 0 120`}
          {...line(6, "#7ed07e")}
          opacity={0.7 + Math.sin(frame / 8 + i) * 0.3}
        />
      ))}
      <g transform="translate(1500 400)">
        <circle cx={0} cy={0} r={96} {...line(STROKE - 1)} fill="#ffe45c" />
        {[0, 1, 2].map((i) => {
          const a0 = ((i * 120 - 30 - 90) * Math.PI) / 180;
          const a1 = ((i * 120 + 30 - 90) * Math.PI) / 180;
          const R = 78;
          const r0 = 22;
          return (
            <path
              key={i}
              d={`M ${r0 * Math.cos(a0)} ${r0 * Math.sin(a0)} L ${R * Math.cos(a0)} ${R * Math.sin(a0)} A ${R} ${R} 0 0 1 ${R * Math.cos(a1)} ${R * Math.sin(a1)} L ${r0 * Math.cos(a1)} ${r0 * Math.sin(a1)} A ${r0} ${r0} 0 0 0 ${r0 * Math.cos(a0)} ${r0 * Math.sin(a0)} Z`}
              fill={ink}
            />
          );
        })}
        <circle cx={0} cy={0} r={16} fill={ink} />
      </g>
      <g opacity={opacity}>
        <Note x={1500} y={590} size={64} color={red} outline>
          50&#215; Earth&#8217;s dose
        </Note>
        <Note x={1500} y={656} size={38} color="#8a4530">
          and it never stops
        </Note>
      </g>
    </SceneFade>
  );
};

const DustStorm: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(40);
  return (
    <SceneFade>
      <MarsSurface />
      <rect x={0} y={0} width={W} height={H} fill="#d99a6c" opacity={0.4} />
      {[...Array(16)].map((_, i) => {
        const y = 180 + ((i * 97) % 800);
        const x = ((i * 421 + frame * 26) % (W + 700)) - 350;
        return (
          <path
            key={i}
            d={`M ${x} ${y} q 90 ${(i % 2 ? -1 : 1) * 26} 200 0`}
            {...line(5, "#a9683f")}
            opacity={0.75}
          />
        );
      })}
      <Astronaut x={700} y={960} scale={1.4} face="calm" arms="down" />
      <g>
        <path d="M 1300 900 l 0 -300" {...line(6)} />
        <path
          d={`M 1300 610 q 60 ${8 + Math.sin(frame / 6) * 6} 116 0 l 0 70 q -56 ${
            10 + Math.sin(frame / 6) * 6
          } -116 0 Z`}
          {...line(4)}
          fill="#fff"
        />
      </g>
      <Note x={480} y={300} size={64} color={red} outline>
        100 km/h
      </Note>
      <g opacity={opacity}>
        <Note x={1400} y={330} size={44} color="#5a2f20">
          &#8230; but the air is so thin
        </Note>
        <Note x={1400} y={386} size={44} color="#5a2f20">
          it feels like a breeze
        </Note>
      </g>
    </SceneFade>
  );
};

const MarsVerdict: Scene = () => (
  <SceneFade>
    <MarsSurface />
    <Habitat x={560} y={880} scale={1.0} />
    <Astronaut x={1030} y={905} scale={0.95} face="happy" arms="down" />
    <Stamp x={1330} y={430} label="SEALED, SHIELDED HABITAT" value="AS LONG AS SUPPLIES LAST" delay={18} />
  </SceneFade>
);

// ── registry ────────────────────────────────────────────────────────

const SCENES: Record<string, Scene> = {
  "sun-close": SunClose,
  exosphere: Exosphere,
  "day-night": DayNight,
  "suit-limit": SuitLimit,
  "night-freeze": NightFreeze,
  "slow-spin": SlowSpin,
  terminator: Terminator,
  "merc-verdict": MercVerdict,
  "merc-vacuum": MercVacuum,
  "venus-twin": VenusTwin,
  "venus-hostile": VenusHostile,
  "acid-clouds": AcidClouds,
  "venus-heat": VenusHeat,
  "venus-press": VenusPress,
  venera: Venera,
  "venus-suit": VenusSuit,
  "venus-verdict": VenusVerdict,
  "mars-friendly": MarsFriendly,
  "mars-temp": MarsTemp,
  "mars-air": MarsAir,
  armstrong: Armstrong,
  "mars-vacuum": MarsVacuum,
  "mars-rad": MarsRad,
  "dust-storm": DustStorm,
  "mars-verdict": MarsVerdict,
};

/** Scenes drawn on a dark background need the boxed chapter title. */
export const DARK_SCENES = new Set(["night-freeze", "merc-vacuum"]);

export const renderScene = (scene: string, id: string) => {
  if (scene === "lineup") {
    const focus = id[0] === "m" ? "mercury" : id[0] === "v" ? "venus" : "mars";
    return <Lineup focus={focus} />;
  }
  const C = SCENES[scene];
  return C ? <C /> : null;
};
