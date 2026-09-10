import React from "react";
import { useCurrentFrame } from "remotion";
import {
  Arrow,
  Band,
  H,
  Note,
  SceneFade,
  STROKE,
  Stamp,
  Sun,
  W,
  blob,
  grey,
  ink,
  line,
  red,
  rng,
  smooth,
  usePop,
} from "../planets/kit";
import {
  BONE,
  Bell,
  Chamber,
  Grains,
  Jar,
  LINEN,
  NATRON,
  Person,
  SALT,
  SKIN_BOG,
  SKIN_DRY,
  Strata,
  Tank,
  scatter,
} from "./art";

type Scene = React.FC;

const Paper: Scene = () => <rect x={0} y={0} width={W} height={H} fill="#ffffff" />;

const Tint: React.FC<{ fill: string }> = ({ fill }) => (
  <rect x={0} y={0} width={W} height={H} fill={fill} />
);

// The chapter title along the top already carries the word ("ICE", "BOG"),
// so the opener only has to carry the numeral.
const Opener: React.FC<{ n: string; tint?: string; children?: React.ReactNode }> = ({
  n,
  tint = "#ffffff",
  children,
}) => {
  const { scale, opacity } = usePop(3, 10);
  return (
    <SceneFade>
      <Tint fill={tint} />
      {children}
      <g opacity={opacity} transform={`translate(400 760) scale(${0.86 + scale * 0.14})`}>
        <Note x={0} y={0} size={360} color={ink} outline>
          {n}
        </Note>
      </g>
    </SceneFade>
  );
};

const Clock: React.FC<{ x: number; y: number; r: number; t: number }> = ({ x, y, r, t }) => {
  const ha = t * Math.PI * 2;
  const ma = t * 12 * Math.PI * 2;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx={0} cy={0} r={r} {...line(STROKE)} fill="#ffffff" />
      <circle cx={0} cy={0} r={r - 18} {...line(3, "rgba(0,0,0,0.22)")} fill="none" />
      {[...Array(12)].map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <path
            key={i}
            d={`M ${Math.sin(a) * (r - 36)} ${-Math.cos(a) * (r - 36)} L ${Math.sin(a) * (r - 58)} ${
              -Math.cos(a) * (r - 58)
            }`}
            {...line(4)}
          />
        );
      })}
      <path d={`M 0 0 L ${Math.sin(ha) * r * 0.55} ${-Math.cos(ha) * r * 0.55}`} {...line(9)} />
      <path d={`M 0 0 L ${Math.sin(ma) * r * 0.78} ${-Math.cos(ma) * r * 0.78}`} {...line(5)} />
      <circle cx={0} cy={0} r={11} fill={ink} />
    </g>
  );
};

/** A soft alpine range. */
const Peaks: React.FC<{ y: number; seed: number; fill?: string }> = ({ y, seed, fill = "#cfdded" }) => {
  const r = rng(seed);
  const pts: [number, number][] = [[-40, y]];
  for (let x = 60; x < W; x += 200) pts.push([x, y - 130 - r() * 250]);
  pts.push([W + 40, y]);
  const d = smooth(pts);
  return (
    <g>
      <path d={`${d} L ${W + 40} ${H} L -40 ${H} Z`} fill={fill} />
      <path d={d} {...line(STROKE)} />
    </g>
  );
};

/** Falling snow, drifting on the frame number. */
const Snow: React.FC<{ seed?: number; n?: number }> = ({ seed = 12, n = 70 }) => {
  const frame = useCurrentFrame();
  const r = rng(seed);
  return (
    <>
      {[...Array(n)].map((_, i) => {
        const x = r() * W;
        const speed = 0.6 + r() * 1.4;
        const y = ((r() * H + frame * speed) % (H + 40)) - 20;
        return <circle key={i} cx={x + Math.sin((frame + i * 20) / 40) * 12} cy={y} r={2 + r() * 3} fill="#ffffff" />;
      })}
    </>
  );
};

/** Bubbles rising, for the bog and the vacuum chamber. */
const Bubbles: React.FC<{ x0: number; y0: number; x1: number; y1: number; seed: number; n?: number; fill?: string }> = ({
  x0,
  y0,
  x1,
  y1,
  seed,
  n = 16,
  fill = "rgba(255,255,255,0.5)",
}) => {
  const frame = useCurrentFrame();
  const r = rng(seed);
  return (
    <>
      {[...Array(n)].map((_, i) => {
        const x = x0 + r() * (x1 - x0);
        const span = y1 - y0;
        const y = y1 - ((frame * (0.9 + r() * 1.6) + r() * span) % span);
        return <circle key={i} cx={x} cy={y} r={5 + r() * 11} {...line(3, "rgba(0,0,0,0.2)")} fill={fill} />;
      })}
    </>
  );
};

/** A hand-drawn tick / cross pair, for the "this works / this does not" beats. */
const Tick: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = "#2f9e44" }) => (
  <path d={`M ${x - 26 * s} ${y} l ${20 * s} ${24 * s} l ${38 * s} ${-52 * s}`} {...line(9 * s, color)} fill="none" />
);

const Cross: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = red }) => (
  <path
    d={`M ${x - 26 * s} ${y - 26 * s} l ${52 * s} ${52 * s} M ${x + 26 * s} ${y - 26 * s} l ${-52 * s} ${52 * s}`}
    {...line(9 * s, color)}
  />
);

// ── intro ───────────────────────────────────────────────────────────

const Fresh: Scene = () => {
  const { opacity } = usePop(16);
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Paper />
      <Band y={900} fill="#f1efe8" seed={3} />
      <Person x={660} y={900} scale={1.75} state="fresh" />
      <Clock x={1420} y={520} r={215} t={0.2 + frame / 240} />
      <g opacity={opacity}>
        <Note x={1420} y={840} size={108} color={red} outline>
          72 hours
        </Note>
        <Note x={1420} y={906} size={42} color={grey} outline>
          before anybody notices
        </Note>
      </g>
    </SceneFade>
  );
};

const Autolysis: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(26);
  return (
    <SceneFade>
      <Tint fill="#fdf2ec" />
      <Person x={800} y={740} scale={1.6} state="fresh" rotate={-90} />
      {/* the magnified gut */}
      <circle cx={1380} cy={520} r={300} {...line(STROKE)} fill="#fbe3d5" />
      <g clipPath="url(#mummy-gut)">
        <defs>
          <clipPath id="mummy-gut">
            <circle cx={1380} cy={520} r={296} />
          </clipPath>
        </defs>
        {scatter(21, 44, 1090, 230, 1670, 810).map((p, i) => {
          const grow = Math.min(1, Math.max(0, (frame - i * 1.6) / 26));
          return (
            <ellipse
              key={i}
              cx={p.x}
              cy={p.y}
              rx={13 * p.s * grow}
              ry={8 * p.s * grow}
              transform={`rotate(${p.a} ${p.x} ${p.y})`}
              {...line(3)}
              fill="#8fc98f"
            />
          );
        })}
      </g>
      <circle cx={1380} cy={520} r={300} {...line(STROKE)} fill="none" />
      <path d="M 856 680 q 150 -100 260 -110" {...line(4, grey)} strokeDasharray="14 12" />
      <g opacity={opacity}>
        <Note x={1380} y={900} size={54} color={red} outline>
          it starts from the inside
        </Note>
        <Note x={1380} y={960} size={38} color={grey}>
          your own enzymes go first, then your gut bacteria
        </Note>
      </g>
    </SceneFade>
  );
};

const DecayClock: Scene = () => {
  const { opacity } = usePop(22);
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Paper />
      <Band y={880} fill="#efece2" seed={8} />
      <Person x={520} y={880} scale={1.5} state="fresh" />
      <Person x={1080} y={880} scale={1.5} state="skeleton" />
      <g opacity={Math.min(1, frame / 40)}>
        <Person x={1620} y={880} scale={1.5} state="skeleton" />
        <rect x={1440} y={520} width={360} height={370} fill="#ffffff" opacity={0.72} />
      </g>
      <Arrow from={[700, 700]} to={[900, 700]} bend={-0.2} />
      <Arrow from={[1260, 700]} to={[1450, 700]} bend={-0.2} />
      <g opacity={opacity}>
        <Note x={800} y={640} size={40} color={red} outline>
          ~10 years
        </Note>
        <Note x={1360} y={640} size={40} color={red} outline>
          then that goes too
        </Note>
        <Note x={W / 2} y={1010} size={44} color={grey}>
          ordinary ground, left alone
        </Note>
      </g>
    </SceneFade>
  );
};

const SevenWays: Scene = () => {
  const icons = ["ICE", "BOG", "SAND", "SALT", "NATRON", "MONK", "PLASTIC"];
  const tints = ["#dceaf5", "#7d5a34", "#f2dfae", "#eef2f6", "#f0e6c8", "#dfeadd", "#e6d3d3"];
  return (
    <SceneFade>
      <Paper />
      <Note x={W / 2} y={330} size={78} color={ink}>
        seven ways to still be here in 4,000 years
      </Note>
      {icons.map((label, i) => {
        const x = 200 + i * 255;
        const { scale, opacity } = usePop(8 + i * 5, 10);
        return (
          <g key={label} opacity={opacity} transform={`translate(${x} 660) scale(${0.8 + scale * 0.2})`}>
            <path d={blob(0, 0, 96, i + 4, 0.12)} {...line(STROKE)} fill={tints[i]} />
            <Note x={0} y={16} size={i === 4 || i === 6 ? 30 : 38} color={i === 1 ? "#ffffff" : ink}>
              {label}
            </Note>
            <Note x={0} y={168} size={54} color={red}>
              {i + 1}
            </Note>
          </g>
        );
      })}
      <Note x={W / 2} y={950} size={42} color={grey}>
        roughly in order of how much work you have to do yourself
      </Note>
    </SceneFade>
  );
};

// ── one: ice ────────────────────────────────────────────────────────

const IceOpen: Scene = () => (
  <Opener n="1" tint="#eaf3fa">
    <Peaks y={700} seed={4} />
    <Band y={880} fill="#fbfeff" seed={6} />
    <Snow />
    <Person x={1430} y={880} scale={1.5} state="frozen" />
  </Opener>
);

const Otzi: Scene = () => {
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <Tint fill="#e3eff8" />
      <Peaks y={640} seed={9} />
      <Band y={820} fill="#fbfeff" seed={2} />
      {/* the body, face down in a melt hollow */}
      <ellipse cx={900} cy={946} rx={360} ry={96} {...line(STROKE, "#9fc4dd")} fill="#dcecf7" />
      <Person x={900} y={946} scale={1.05} state="frozen" rotate={-90} />
      {/* two hikers, up on the snowfield */}
      <g>
        <Person x={1520} y={826} scale={0.66} state="fresh" />
        <Person x={1650} y={832} scale={0.66} state="fresh" />
        <path d="M 1476 826 l -6 -128" {...line(6, "#8a6a3a")} />
      </g>
      <g opacity={opacity}>
        <Note x={200} y={300} size={110} color={ink} anchor="start" outline>
          1991
        </Note>
        <Note x={200} y={372} size={44} color={grey} anchor="start" outline>
          the Alps, on the Italian border
        </Note>
        <Note x={1580} y={620} size={40} color={red} outline>
          &quot;probably a climber&quot;
        </Note>
      </g>
    </SceneFade>
  );
};

const OtziAge: Scene = () => (
  <SceneFade>
    <Tint fill="#e3eff8" />
    <Peaks y={700} seed={9} />
    <Band y={860} fill="#fbfeff" seed={2} />
    <Snow n={40} />
    <Person x={W / 2} y={820} scale={1.15} state="frozen" rotate={-90} />
    <Stamp x={W / 2} y={330} label="he had been there for" value="5,300 years" delay={6} />
  </SceneFade>
);

const FreezeDry: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(34);
  return (
    <SceneFade>
      <Tint fill="#eef6fc" />
      <Person x={560} y={820} scale={1.6} state="frozen" />
      {/* water leaving, as little droplets on the wind */}
      {scatter(31, 20, 640, 300, 1160, 780).map((p, i) => {
        const t = ((frame * 3 + i * 24) % 260) / 260;
        return (
          <g key={i} opacity={1 - t} transform={`translate(${p.x + t * 260} ${p.y - t * 90})`}>
            <path d="M 0 -14 q 12 14 0 22 q -12 -8 0 -22 Z" {...line(3)} fill="#bcdcf2" />
          </g>
        );
      })}
      {/* a coffee jar */}
      <g transform="translate(1520 760)">
        <rect x={-120} y={-260} width={240} height={260} rx={18} {...line(STROKE)} fill="#d9a15c" />
        <rect x={-132} y={-302} width={264} height={46} rx={12} {...line(STROKE)} fill="#7c4a1e" />
        <rect x={-104} y={-190} width={208} height={104} rx={8} {...line(STROKE - 1)} fill="#fff8ec" />
        <Note x={0} y={-122} size={32} color={ink}>
          INSTANT
        </Note>
      </g>
      <g opacity={opacity}>
        <Note x={1080} y={300} size={64} color={red} outline>
          freeze-dried
        </Note>
        <Note x={1080} y={368} size={40} color={grey} outline>
          thin, dry air pulls the water
        </Note>
        <Note x={1080} y={418} size={40} color={grey} outline>
          straight out of him
        </Note>
        <Note x={1520} y={900} size={38} color={grey}>
          exactly like this
        </Note>
      </g>
    </SceneFade>
  );
};

const OtziDetail: Scene = () => {
  const r = rng(77);
  return (
    <SceneFade>
      <Tint fill="#f3f8fc" />
      <Person x={760} y={960} scale={2.1} state="dried" />
      {/* tattoos: short parallel bars over the joints */}
      <g {...line(5, "#2b2b2b")}>
        {[...Array(14)].map((_, i) => {
          // below the head — the tattoos sit over joints, not on his face
          const x = 640 + r() * 250;
          const y = 520 + r() * 380;
          return <path key={i} d={`M ${x} ${y} l 30 0 M ${x} ${y + 12} l 30 0`} />;
        })}
      </g>
      {[
        ["skin", 430, 300, 700, 400],
        ["stomach contents", 430, 560, 720, 620],
        ["his clothes", 430, 780, 700, 800],
      ].map(([label, lx, ly, tx, ty]) => (
        <g key={label as string}>
          <Note x={lx as number} y={ly as number} size={40} color={ink} anchor="end">
            {label as string}
          </Note>
          <Arrow from={[(lx as number) + 22, (ly as number) - 12]} to={[tx as number, ty as number]} bend={0.12} width={4} />
        </g>
      ))}
      <Note x={1330} y={460} size={78} color={red} outline anchor="start">
        61 tattoos
      </Note>
      <Note x={1330} y={528} size={38} color={grey} anchor="start">
        almost all of them sitting
      </Note>
      <Note x={1300} y={576} size={36} color={grey} anchor="start">
        directly over worn-out joints
      </Note>
      <Arrow from={[1310, 560]} to={[960, 620]} bend={0.2} width={4} />
    </SceneFade>
  );
};

const ArrowScene: Scene = () => {
  const { opacity } = usePop(24);
  return (
    <SceneFade>
      <Tint fill="#f6f1ec" />
      {/* him, close in: the shoulder fills the left of the frame */}
      <Person x={700} y={1560} scale={3.4} state="dried" />
      {/* the flint point, still in the left shoulder */}
      <g transform="translate(516 880) rotate(28)">
        <path d="M 0 0 l 38 -10 l -10 66 Z" {...line(5)} fill="#6f6f6f" />
      </g>
      <circle cx={534} cy={900} r={72} {...line(6, red)} fill="none" />
      <Arrow from={[1180, 470]} to={[622, 852]} bend={0.22} />
      <g opacity={opacity}>
        <Note x={1200} y={440} size={62} color={red} anchor="start" outline>
          arrowhead
        </Note>
        <Note x={1200} y={514} size={44} color={ink} anchor="start">
          fired from behind
        </Note>
        <Note x={1200} y={660} size={44} color={grey} anchor="start">
          a murder investigation with a
        </Note>
        <Note x={1200} y={714} size={44} color={grey} anchor="start">
          five-thousand-year-old suspect
        </Note>
      </g>
    </SceneFade>
  );
};

const IceVerdict: Scene = () => (
  <SceneFade>
    <Tint fill="#e8f2fa" />
    <Peaks y={700} seed={14} />
    <Band y={880} fill="#fbfeff" seed={5} />
    <Snow n={50} />
    <Person x={470} y={880} scale={1.35} state="frozen" />
    <Stamp x={1290} y={430} label="ICE — you do not get to choose it" value="5,300 years" delay={8} />
    <Note x={1290} y={640} size={40} color={grey}>
      you have to die very high, very cold,
    </Note>
    <Note x={1290} y={694} size={40} color={grey}>
      and stay buried until the glacier hands you back
    </Note>
  </SceneFade>
);

// ── two: bog ────────────────────────────────────────────────────────

const BOG_LAYERS = [
  { h: 90, fill: "#4f6b3a", label: "moss" },
  { h: 120, fill: "#5d4526", label: "peat" },
  { h: 200, fill: "#3f2d18", label: "older peat" },
];

const BogOpen: Scene = () => (
  <Opener n="2" tint="#cddcc4">
    <Strata y={640} layers={BOG_LAYERS}>
      <Person x={1400} y={900} scale={1.35} state="bog" rotate={-90} />
      <Bubbles x0={1100} y0={700} x1={1780} y1={1040} seed={3} n={12} fill="rgba(120,90,50,0.45)" />
    </Strata>
  </Opener>
);

const Tollund: Scene = () => {
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <Tint fill="#cddcc4" />
      <Strata y={620} layers={BOG_LAYERS} seed={11}>
        <Person x={900} y={880} scale={1.2} state="bog" rotate={-90} />
        {/* the rope */}
        <path d="M 646 862 q -34 -34 -74 4" {...line(9, "#c8a86a")} />
      </Strata>
      {/* two diggers with spades */}
      <g>
        <Person x={380} y={612} scale={0.78} state="fresh" />
        {/* a spade: handle up, blade in the peat */}
        <path d="M 470 400 l 0 190" {...line(7, "#7a5a2e")} />
        <path d="M 452 396 l 36 0" {...line(7, "#7a5a2e")} />
        <path d="M 452 590 l 36 0 l -6 62 l -24 0 Z" {...line(4)} fill="#b9b9b9" />
        <Person x={560} y={616} scale={0.78} state="fresh" />
      </g>
      <g opacity={opacity}>
        <Note x={1420} y={320} size={92} color={ink}>
          1950
        </Note>
        <Note x={1420} y={386} size={40} color={grey}>
          a peat bog in Denmark
        </Note>
        <Note x={1420} y={520} size={50} color={red} outline>
          they called the police
        </Note>
        <Note x={1420} y={580} size={38} color={grey}>
          he looked like he had died that week
        </Note>
      </g>
    </SceneFade>
  );
};

const TollundAge: Scene = () => (
  <SceneFade>
    <Tint fill="#cddcc4" />
    <Strata y={640} layers={BOG_LAYERS} seed={11}>
      <Person x={W / 2} y={900} scale={1.3} state="bog" rotate={-90} />
      <path d="M 706 878 q -38 -36 -82 4" {...line(10, "#c8a86a")} />
    </Strata>
    <Stamp x={W / 2} y={300} label="in the peat for" value="2,400 years" delay={6} />
    <Note x={W / 2} y={470} size={40} color={ink}>
      with the rope still around his neck
    </Note>
  </SceneFade>
);

const BogChem: Scene = () => {
  const panels = [
    { title: "COLD", sub: "barely above freezing", tint: "#dff0f8" },
    { title: "NO OXYGEN", sub: "waterlogged, sealed", tint: "#e0e7d6" },
    { title: "ACIDIC", sub: "about as sour as vinegar", tint: "#f4e6cf" },
  ];
  return (
    <SceneFade>
      <Tint fill="#f6f4ec" />
      {panels.map((p, i) => {
        const { scale, opacity } = usePop(8 + i * 12, 11);
        const x = 340 + i * 620;
        return (
          <g key={p.title} opacity={opacity} transform={`translate(${x} 520) scale(${0.86 + scale * 0.14})`}>
            <path d={blob(0, 0, 240, i + 5, 0.1)} {...line(STROKE)} fill={p.tint} />
            {i === 0 ? (
              <g {...line(8, "#3aa0e6")}>
                <path d="M 0 -110 l 0 220 M -95 -55 l 190 110 M -95 55 l 190 -110" />
              </g>
            ) : null}
            {i === 1 ? (
              <g>
                <Note x={0} y={40} size={150} color="#6b8f4a">
                  O₂
                </Note>
                <Cross x={0} y={-6} s={2.2} />
              </g>
            ) : null}
            {i === 2 ? (
              <g>
                <rect x={-46} y={-120} width={92} height={240} rx={10} {...line(STROKE - 1)} fill="#fffaf0" />
                {["#e0341f", "#e8631b", "#f0a11e"].map((c, k) => (
                  <rect key={c} x={-38} y={-108 + k * 78} width={76} height={70} fill={c} />
                ))}
                <Note x={0} y={168} size={44} color={red}>
                  pH 4
                </Note>
              </g>
            ) : null}
            <Note x={0} y={318} size={54} color={ink}>
              {p.title}
            </Note>
            <Note x={0} y={368} size={34} color={grey}>
              {p.sub}
            </Note>
          </g>
        );
      })}
      <Note x={W / 2} y={1010} size={46} color={red} outline>
        nothing that normally rots you can work in there
      </Note>
    </SceneFade>
  );
};

const Sphagnan: Scene = () => {
  const { opacity } = usePop(30);
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Tint fill="#e6eede" />
      {/* sphagnum moss sprigs */}
      <g>
        {scatter(41, 22, 80, 700, 780, 1020).map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y}) scale(${p.s})`}>
            <path d="M 0 0 l 0 -90" {...line(6, "#5f8a3e")} />
            {[0, 1, 2, 3].map((k) => (
              <path
                key={k}
                d={`M 0 ${-20 - k * 22} q -34 -10 -44 -30 M 0 ${-20 - k * 22} q 34 -10 44 -30`}
                {...line(4, "#7aa851")}
              />
            ))}
          </g>
        ))}
      </g>
      {/* the compound, as a doodle molecule */}
      <g transform="translate(900 400)">
        <path d={blob(0, 0, 150, 6, 0.08)} {...line(STROKE)} fill="#fffaf0" />
        <Note x={0} y={18} size={52} color={ink}>
          sphagnan
        </Note>
      </g>
      <Arrow from={[900, 560]} to={[720, 760]} bend={0.2} />
      <Arrow from={[1060, 470]} to={[1330, 500]} bend={-0.2} />
      <g opacity={opacity}>
        <Note x={1370} y={430} size={40} color={ink} anchor="start">
          locks up the nitrogen
        </Note>
        <Note x={1370} y={480} size={40} color={ink} anchor="start">
          bacteria need to grow
        </Note>
      </g>
      {/* skin, tanning */}
      <g transform="translate(1460 780)">
        <rect x={-190} y={-110} width={380} height={220} rx={16} {...line(STROKE)} fill={SKIN_DRY} />
        <rect
          x={-190}
          y={-110}
          width={Math.min(380, (frame / 60) * 380)}
          height={220}
          rx={16}
          fill={SKIN_BOG}
        />
        <rect x={-190} y={-110} width={380} height={220} rx={16} {...line(STROKE)} fill="none" />
        <rect
          x={-166}
          y={-86}
          width={332}
          height={172}
          rx={10}
          {...line(3, "rgba(0,0,0,0.35)")}
          fill="none"
          strokeDasharray="16 12"
        />
        <Note x={0} y={-150} size={42} color={ink}>
          your skin
        </Note>
        <Note x={0} y={170} size={40} color={grey}>
          you come out the colour of a saddle
        </Note>
      </g>
    </SceneFade>
  );
};

const NoBones: Scene = () => {
  const frame = useCurrentFrame();
  const gone = Math.min(1, frame / 150);
  return (
    <SceneFade>
      <Tint fill="#e9e2d2" />
      <Note x={W / 2} y={220} size={72} color={ink}>
        the same acid that saves your skin
      </Note>
      {/* a femur, dissolving */}
      <g transform="translate(760 620)">
        <g opacity={1 - gone * 0.92}>
          <path
            d="M -260 -40 q -60 -60 10 -80 q 60 -16 74 34 q 120 30 240 4 q 20 -50 78 -34 q 70 20 10 80 q 56 46 -6 82 q -66 34 -84 -20 q -118 -26 -236 2 q -14 54 -82 22 q -60 -34 -4 -90 Z"
            {...line(STROKE)}
            fill={BONE}
          />
        </g>
        {/* fizzing */}
        {scatter(52, 26, -280, -90, 300, 90).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y + Math.sin((frame + i * 9) / 12) * 10} r={4 + p.s * 8} fill="rgba(120,80,30,0.35)" />
        ))}
      </g>
      <Note x={1520} y={560} size={62} color={red} outline>
        dissolves
      </Note>
      <Note x={1520} y={628} size={62} color={red} outline>
        your skeleton
      </Note>
      <Arrow from={[1400, 600]} to={[1060, 620]} bend={0.16} />
      <Note x={W / 2} y={1000} size={44} color={grey}>
        skin: kept. bones: gone.
      </Note>
    </SceneFade>
  );
};

const BogVerdict: Scene = () => (
  <SceneFade>
    <Tint fill="#cddcc4" />
    <Strata y={660} layers={BOG_LAYERS} seed={17}>
      <Person x={520} y={920} scale={1.3} state="bog" rotate={-90} />
    </Strata>
    <Stamp x={1300} y={400} label="BOG — face yes, skeleton no" value="2,400 years" delay={8} />
    <Note x={1300} y={600} size={46} color={ink} outline>
      you keep your face for two and a half
    </Note>
    <Note x={1300} y={654} size={46} color={ink} outline>
      thousand years. you are also,
    </Note>
    <Note x={1300} y={716} size={54} color={red} outline>
      structurally, a bag.
    </Note>
  </SceneFade>
);

// ── three: desert ───────────────────────────────────────────────────

const DesertOpen: Scene = () => (
  <Opener n="3" tint="#fbe9c0">
    <Sun x={1560} y={220} r={120} rays={16} />
    <Band y={800} fill="#f0d79b" seed={7} amp={14} />
    <Band y={900} fill="#e5c684" seed={12} amp={10} />
    <Person x={1300} y={900} scale={1.4} state="dried" />
  </Opener>
);

const DryOut: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <Tint fill="#fdf0d2" />
      <Sun x={300} y={230} r={130} rays={16} />
      <Band y={880} fill="#f0d79b" seed={4} amp={12} />
      <Person x={860} y={880} scale={1.7} state="dried" />
      {/* water leaving, downward into the sand */}
      {scatter(61, 18, 760, 460, 980, 820).map((p, i) => {
        const t = ((frame * 2.4 + i * 30) % 200) / 200;
        return (
          <g key={i} opacity={1 - t} transform={`translate(${p.x} ${p.y + t * 190})`}>
            <path d="M 0 -12 q 11 12 0 20 q -11 -8 0 -20 Z" {...line(3)} fill="#6fb7e0" />
          </g>
        );
      })}
      {/* bacteria, out of business */}
      <g transform="translate(1500 560)">
        <path d={blob(0, 0, 230, 9, 0.1)} {...line(STROKE)} fill="#ffffff" />
        {scatter(62, 9, -150, -140, 150, 140).map((p, i) => (
          <ellipse key={i} cx={p.x} cy={p.y} rx={16 * p.s} ry={10 * p.s} transform={`rotate(${p.a} ${p.x} ${p.y})`} {...line(3)} fill="#c9d6b8" />
        ))}
        <Cross x={0} y={0} s={2.6} />
      </g>
      <g opacity={opacity}>
        <Note x={1500} y={860} size={38} color={red} outline>
          bacteria cannot work without water
        </Note>
        <Note x={860} y={310} size={44} color={grey}>
          the sand wins the race
        </Note>
      </g>
    </SceneFade>
  );
};

const Chinchorro: Scene = () => {
  const { opacity } = usePop(28);
  // the coast of northern Chile, sketched: the ocean is everything left of
  // the coastline, so the fill is that curve closed back along the frame edge
  const coast: [number, number][] = [
    [470, -30],
    [524, 250],
    [486, 450],
    [534, 640],
    [498, 830],
    [546, 1110],
  ];
  const coastD = smooth(coast);
  const oceanD = `M 0 -30 L 470 -30 ${coastD.replace(/^M [-\d.]+ [-\d.]+/, "")} L 0 1110 Z`;
  return (
    <SceneFade>
      <Tint fill="#fdf3e0" />
      <path d={oceanD} fill="#cfe6f2" />
      <path d={coastD} {...line(STROKE)} />
      <Note x={210} y={420} size={44} color="#3f7fa8">
        Pacific
      </Note>
      <Note x={700} y={300} size={52} color={ink} anchor="start">
        Chile
      </Note>
      <circle cx={505} cy={470} r={15} fill={red} />
      <Note x={560} y={482} size={38} color={red} anchor="start">
        Chinchorro
      </Note>
      {/* the timeline */}
      <g transform="translate(1250 720)">
        <path d="M -420 0 L 470 0" {...line(6)} />
        {([
          [-380, "7,000 yrs ago", "Chinchorro"],
          [90, "5,000 yrs ago", "Egypt starts"],
          [440, "today", ""],
        ] as [number, string, string][]).map(([x, top, bottom]) => (
          <g key={top}>
            <path d={`M ${x} -22 l 0 44`} {...line(6)} />
            <Note x={x} y={-46} size={34} color={ink}>
              {top}
            </Note>
            <Note x={x} y={84} size={34} color={red}>
              {bottom}
            </Note>
          </g>
        ))}
        <g opacity={opacity}>
          <path d="M -380 -140 l 0 -34 l 470 0 l 0 34" {...line(5, red)} fill="none" />
          <Note x={-145} y={-198} size={52} color={red}>
            2,000 years earlier
          </Note>
        </g>
      </g>
      <Note x={1250} y={1010} size={44} color={grey}>
        the oldest deliberate mummies anybody has found
      </Note>
    </SceneFade>
  );
};

const Arsenic: Scene = () => {
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <Tint fill="#f6ead4" />
      {/* meltwater coming off the mountains */}
      <Peaks y={560} seed={21} fill="#c8b58f" />
      <path
        d={smooth([
          [260, 480],
          [520, 620],
          [820, 740],
          [1140, 870],
        ])}
        {...line(24, "#8fbcd8")}
        fill="none"
      />
      <Band y={880} fill="#eadfc0" seed={9} />
      {/* a cup of it */}
      <g transform="translate(1420 700)">
        <path d="M -110 -110 q -16 200 20 236 q 90 26 180 0 q 36 -36 20 -236 Z" {...line(STROKE)} fill="#e8ddc4" />
        <path d="M -120 -110 l 240 0" {...line(STROKE)} />
        <ellipse cx={0} cy={-110} rx={120} ry={34} {...line(STROKE - 1)} fill="#9fc9e0" />
        <g transform="translate(0 60)">
          <circle cx={0} cy={-14} r={40} {...line(5)} fill="#fff" />
          <circle cx={-14} cy={-22} r={7} fill={ink} />
          <circle cx={14} cy={-22} r={7} fill={ink} />
          <path d="M -18 6 l 36 0 M -8 6 l 0 16 M 8 6 l 0 16" {...line(5)} />
        </g>
        <Note x={0} y={230} size={48} color={red}>
          arsenic
        </Note>
      </g>
      <g opacity={opacity}>
        <Note x={700} y={250} size={46} color={ink} outline>
          the water came out of the mountains
        </Note>
        <Note x={700} y={306} size={46} color={ink} outline>
          carrying arsenic
        </Note>
        <Note x={860} y={1010} size={46} color={red} outline>
          the first Chinchorro mummies are infants
        </Note>
      </g>
    </SceneFade>
  );
};

const Rebuild: Scene = () => {
  const steps = [
    "take it apart",
    "peel the skin off",
    "dry every piece",
    "rebuild on poles",
    "pack with fibre + ash",
    "put the skin back on",
    "paint it",
  ];
  // four across, then three centred underneath
  const place = (i: number): [number, number] =>
    i < 4 ? [300 + i * 440, 440] : [520 + (i - 4) * 440, 800];
  return (
    <SceneFade>
      <Tint fill="#fdf4e4" />
      <Note x={W / 2} y={250} size={64} color={ink}>
        and they were not subtle
      </Note>
      {steps.map((s, i) => {
        const { opacity } = usePop(6 + i * 7, 12);
        const [x, y] = place(i);
        return (
          <g key={s} opacity={opacity}>
            <circle cx={x} cy={y} r={54} {...line(STROKE)} fill="#f2dfae" />
            <Note x={x} y={y + 18} size={50} color={red}>
              {i + 1}
            </Note>
            <Note x={x} y={y + 120} size={34} color={ink}>
              {s}
            </Note>
          </g>
        );
      })}
    </SceneFade>
  );
};

const DesertVerdict: Scene = () => (
  <SceneFade>
    <Tint fill="#fbe9c0" />
    <Sun x={200} y={200} r={110} rays={14} />
    <Band y={920} fill="#f0d79b" seed={13} amp={12} />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <Person x={330 + i * 240} y={920} scale={1.25} state="dried" />
        {/* the painted mask */}
        <rect x={330 + i * 240 - 44} y={920 - 340} width={88} height={92} rx={10} {...line(4)} fill="#2b2b2b" opacity={0.75} />
      </g>
    ))}
    <Stamp x={1370} y={400} label="DESERT — still standing up" value="7,000 years" delay={8} />
    <Note x={1370} y={620} size={42} color={grey}>
      less a preserved person than
    </Note>
    <Note x={1370} y={674} size={42} color={grey}>
      a portrait with a person inside it
    </Note>
  </SceneFade>
);

// ── four: salt ──────────────────────────────────────────────────────

const SaltOpen: Scene = () => (
  <Opener n="4" tint="#eef2f6">
    <rect x={0} y={0} width={W} height={H} fill="#e7ecf1" />
    <Grains x0={0} y0={0} x1={W} y1={H} seed={71} n={140} fill={SALT} />
    <Person x={1360} y={880} scale={1.45} state="dried" />
  </Opener>
);

const Saltmen: Scene = () => {
  const frame = useCurrentFrame();
  const drop = Math.min(1, frame / 34);
  const { opacity } = usePop(40);
  return (
    <SceneFade>
      <Tint fill="#2f3338" />
      {/* the cut face of the mine */}
      <path d="M 0 0 L 1060 0 L 1000 1080 L 0 1080 Z" {...line(STROKE, "#cfd6dd")} fill="#dfe6ec" />
      <Grains x0={20} y0={20} x1={990} y1={1050} seed={81} n={70} fill="#f7fafc" size={20} />
      {/* the head, falling out of the cut face */}
      <g transform={`translate(${960 + drop * 300} ${280 + drop * 470}) rotate(${drop * 26})`}>
        <circle cx={0} cy={0} r={104} {...line(STROKE)} fill={SKIN_DRY} />
        {/* the beard, under the chin */}
        <path d="M -76 20 q 76 46 152 0 q -6 130 -76 138 q -70 -8 -76 -138 Z" {...line(STROKE - 1)} fill="#f2f2f2" />
        <path d="M -44 6 q 44 26 88 0" {...line(STROKE - 1, "#f2f2f2")} />
        <path d="M -48 -34 l 30 30 M -18 -34 l -30 30 M 48 -34 l -30 30 M 18 -34 l 30 30" {...line(5)} />
        <circle cx={-96} cy={22} r={16} {...line(4)} fill="#e0b23c" />
      </g>
      <g opacity={opacity}>
        <Note x={1500} y={280} size={92} color="#ffffff">
          1993
        </Note>
        <Note x={1500} y={350} size={40} color="#c9d3dc">
          a salt mine in northwestern Iran
        </Note>
        {["white beard", "one gold earring", "one eye still in place"].map((t, i) => (
          <Note key={t} x={1500} y={520 + i * 66} size={46} color="#ffd36b">
            {t}
          </Note>
        ))}
      </g>
    </SceneFade>
  );
};

const SaltHow: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Tint fill="#f4f7fa" />
      <Note x={W / 2} y={200} size={64} color={ink}>
        salt does what the desert does, but faster
      </Note>
      {/* two cells, side by side: yours, and the thing that wanted to eat you */}
      {[
        { x: 560, label: "your cells", fill: "#f6d9bd" },
        { x: 1380, label: "everything planning to eat you", fill: "#cfe0bd" },
      ].map((c, i) => {
        const shrink = 1 - Math.min(0.38, frame / 150);
        return (
          <g key={c.label} transform={`translate(${c.x} 620)`}>
            <path d={blob(0, 0, 250 * (i === 0 ? shrink : shrink), i + 3, 0.08)} {...line(STROKE)} fill={c.fill} />
            {scatter(90 + i, 7, -120, -120, 120, 120).map((p, k) => (
              <circle key={k} cx={p.x * shrink} cy={p.y * shrink} r={9 * p.s} fill="rgba(0,0,0,0.2)" />
            ))}
            <Note x={0} y={330} size={40} color={ink}>
              {c.label}
            </Note>
          </g>
        );
      })}
      {/* salt crystals pulling water out */}
      <Grains x0={120} y0={790} x1={1800} y1={960} seed={91} n={34} fill={SALT} size={18} />
      {scatter(93, 14, 300, 560, 1600, 700).map((p, i) => {
        const t = ((frame * 2.6 + i * 26) % 180) / 180;
        return (
          <g key={i} opacity={1 - t} transform={`translate(${p.x} ${p.y + t * 200})`}>
            <path d="M 0 -12 q 11 12 0 20 q -11 -8 0 -20 Z" {...line(3)} fill="#6fb7e0" />
          </g>
        );
      })}
      <Note x={W / 2} y={1030} size={42} color={red} outline>
        it drags the water out of every cell it touches
      </Note>
    </SceneFade>
  );
};

const SaltDetail: Scene = () => {
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <Tint fill="#eef2f6" />
      <Note x={W / 2} y={230} size={62} color={ink}>
        at least six of them have come out
      </Note>
      {/* the boot, with the leg still in it */}
      <g transform="translate(520 700) scale(1.05)">
        {/* the leg, dried, going down into the boot */}
        <path d="M -48 -400 l 96 0 l 0 190 l -96 0 Z" {...line(STROKE)} fill={SKIN_DRY} />
        <path d="M -40 -350 q 40 14 80 0 M -40 -290 q 40 14 80 0" {...line(3, "rgba(0,0,0,0.28)")} />
        <path d="M -60 -220 l 120 0 l 20 210 l 90 20 l 6 60 l -260 0 l 24 -290 Z" {...line(STROKE)} fill="#8a5c33" />
        <path d="M -84 60 l 260 0" {...line(STROKE - 1)} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M -50 ${-180 + i * 56} l 100 0`} {...line(4, "#5f3f22")} />
        ))}
        <path d="M -46 -220 q 46 -20 92 0" {...line(4)} fill="none" />
        <Note x={0} y={190} size={40} color={ink}>
          his leg, still in the boot
        </Note>
      </g>
      {/* the stomach, with the bread in it */}
      <g transform="translate(1360 620)">
        <path d={blob(0, 0, 230, 8, 0.1)} {...line(STROKE)} fill="#f6ddc4" />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${-70 + i * 70} ${-20 + (i % 2) * 60})`}>
            <path d="M -52 20 q 6 -70 52 -70 q 46 0 52 70 Z" {...line(4)} fill="#d7a45c" />
            <path d="M -30 -18 l 60 0" {...line(3, "#a97a34")} />
          </g>
        ))}
        <g opacity={opacity}>
          <Note x={0} y={320} size={40} color={ink}>
            his last meal, intact
          </Note>
          <Note x={0} y={374} size={40} color={red}>
            mostly bread
          </Note>
        </g>
      </g>
    </SceneFade>
  );
};

const MineClosed: Scene = () => (
  <SceneFade>
    <Tint fill="#dfe6ec" />
    <Band y={880} fill="#c9d3dc" seed={6} />
    {/* the adit */}
    <g transform="translate(760 880)">
      <path d="M -260 0 q 0 -330 260 -330 q 260 0 260 330 Z" {...line(STROKE)} fill="#3a4045" />
      <path d="M -300 0 q 0 -380 300 -380 q 300 0 300 380" {...line(STROKE)} fill="none" />
      <path d="M -200 0 l 400 0" {...line(8, "#7a6a52")} />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M ${-190 + i * 95} -14 l 0 28`} {...line(8, "#7a6a52")} />
      ))}
    </g>
    <g transform="translate(1520 620) rotate(-4)">
      <rect x={-230} y={-120} width={460} height={210} rx={10} {...line(STROKE)} fill="#ffffff" />
      <Note x={0} y={-50} size={40} color={ink}>
        ARCHAEOLOGICAL
      </Note>
      <Note x={0} y={2} size={40} color={ink}>
        SITE
      </Note>
      <Note x={0} y={62} size={34} color={red}>
        (no longer a mine)
      </Note>
      <path d="M 0 90 l 0 260" {...line(12, "#8a7f6a")} />
    </g>
    <Note x={W / 2} y={1030} size={44} color={grey}>
      they are still turning up
    </Note>
  </SceneFade>
);

const SaltVerdict: Scene = () => (
  <SceneFade>
    <Tint fill="#eef2f6" />
    <Grains x0={0} y0={0} x1={W} y1={H} seed={95} n={110} fill={SALT} />
    <Person x={470} y={900} scale={1.4} state="dried" />
    <Stamp x={1290} y={400} label="SALT — the entry requirement" value="2,500 years" delay={8} />
    <Note x={1290} y={620} size={44} color={ink}>
      you have to be standing inside a salt mine
    </Note>
    <Note x={1290} y={676} size={44} color={ink}>
      at the exact moment it collapses on you
    </Note>
    <Note x={1290} y={760} size={40} color={red}>
      inconvenient
    </Note>
  </SceneFade>
);

// ── five: natron ────────────────────────────────────────────────────

const NatronOpen: Scene = () => (
  <Opener n="5" tint="#f6ecd2">
    <Band y={900} fill="#e8d6a8" seed={5} amp={10} />
    <Person x={1330} y={900} scale={1.45} state="wrapped" wrap={1} />
    {[0, 1, 2, 3].map((i) => (
      <Jar key={i} x={1530 + (i % 2) * 170} y={680 + Math.floor(i / 2) * 200} scale={0.8} kind={i} />
    ))}
  </Opener>
);

const EgyptIntro: Scene = () => {
  const frame = useCurrentFrame();
  const filled = Math.min(70, Math.floor(frame / 1.2));
  return (
    <SceneFade>
      <Tint fill="#fbf3e0" />
      <Note x={W / 2} y={230} size={62} color={ink}>
        the first one on the list that is an actual procedure
      </Note>
      {/* seventy days, as a grid of ticks */}
      <g transform="translate(380 320)">
        {[...Array(70)].map((_, i) => {
          const x = (i % 10) * 116;
          const y = Math.floor(i / 10) * 88;
          return (
            <g key={i}>
              <rect x={x} y={y} width={96} height={70} rx={8} {...line(3, "#c9b98d")} fill="#fffaf0" />
              {i < filled ? <Tick x={x + 48} y={y + 34} s={0.55} color="#b8892f" /> : null}
            </g>
          );
        })}
      </g>
      <Note x={W / 2} y={1010} size={58} color={red} outline>
        70 days, by people who did it for a living
      </Note>
    </SceneFade>
  );
};

const WhyEgypt: Scene = () => {
  const frame = useCurrentFrame();
  const t = Math.min(1, frame / 70);
  return (
    <SceneFade>
      <Tint fill="#f4ead4" />
      <Person x={640} y={860} scale={1.6} state="wrapped" wrap={1} rotate={0} />
      {/* the ba, a bird with a human head, coming back to the body */}
      <g transform={`translate(${1420 - t * 560} ${330 + t * 210})`}>
        <path d="M -120 0 q 120 -78 240 0 q -120 58 -240 0 Z" {...line(STROKE)} fill="#e0b23c" />
        <path d={`M -86 -10 q -86 ${-68 - Math.sin(frame / 6) * 34} -162 -18`} {...line(16, "#e0b23c")} />
        <path d={`M 86 -10 q 86 ${-68 - Math.sin(frame / 6) * 34} 162 -18`} {...line(16, "#e0b23c")} />
        <circle cx={0} cy={-78} r={50} {...line(STROKE)} fill={SKIN_DRY} />
        <circle cx={-15} cy={-84} r={7} fill={ink} />
        <circle cx={15} cy={-84} r={7} fill={ink} />
        <path d="M -30 -128 q 30 -22 60 0 q -30 12 -60 0 Z" {...line(4)} fill="#2f4f7f" />
      </g>
      <Note x={1400} y={620} size={46} color={ink}>
        the parts of you that survive death
      </Note>
      <Note x={1400} y={676} size={46} color={ink}>
        need the body to come back to
      </Note>
      <Note x={1400} y={780} size={50} color={red} outline>
        if the body goes, so do you
      </Note>
    </SceneFade>
  );
};

const Brain: Scene = () => {
  const frame = useCurrentFrame();
  const push = Math.min(1, frame / 50);
  return (
    <SceneFade>
      <Tint fill="#f8f0e0" />
      {/* a head in profile, facing left */}
      <g transform="translate(820 600) scale(1.5)">
        <path
          d="M 140 -120 C 130 -230 40 -272 -40 -240 C -110 -214 -132 -160 -134 -120
             L -140 -70 L -200 -20 L -146 -6 C -170 8 -166 16 -146 26
             C -166 40 -160 66 -134 84 C -80 120 0 130 60 120
             L 70 230 L 176 230 C 180 120 170 20 156 -40 C 152 -80 146 -100 140 -120 Z"
          {...line(STROKE)}
          fill={SKIN_DRY}
        />
        {/* the brain, in the top of the skull */}
        <path
          d="M -108 -108 C -100 -190 -20 -226 40 -206 C 100 -188 116 -140 112 -104 C 40 -78 -40 -78 -108 -108 Z"
          {...line(4, "#b07f7f")}
          fill="#e0b6b6"
        />
        <path d="M -70 -190 q 30 40 0 84 M 10 -206 q 26 46 -4 96 M 76 -190 q 22 38 0 82" {...line(3, "#b07f7f")} />
        {/* eye, brow, nostril, ear */}
        <circle cx={-98} cy={-58} r={7} fill={ink} />
        <path d="M -126 -78 q 26 -12 44 -4" {...line(4)} />
        <path d="M -166 -22 q 16 -8 22 4" {...line(4)} />
        <path d="M 20 -20 q 36 -30 44 6 q 4 34 -32 34" {...line(4)} fill="none" />
        {/* the hooked rod, going in through the nostril */}
        <path
          d={`M ${-560 + push * 330} -22 L -150 -22 C -100 -22 -60 -40 -50 -90`}
          {...line(9, "#8a8a8a")}
          fill="none"
        />
      </g>
      <Note x={1560} y={300} size={52} color={ink}>
        out through the nose,
      </Note>
      <Note x={1560} y={360} size={52} color={ink}>
        with a hooked rod
      </Note>
      {/* the bin */}
      <g transform="translate(1560 760)">
        <path d="M -110 -70 l 220 0 l -24 220 l -172 0 Z" {...line(STROKE)} fill="#c9c2b0" />
        <path d="M -126 -70 l 252 0" {...line(STROKE)} />
        <path d={blob(0, -118, 66, 5, 0.14)} {...line(4, "#b07f7f")} fill="#e0b6b6" />
      </g>
      <Note x={1450} y={1000} size={44} color={red} outline>
        they did not think it did anything
      </Note>
    </SceneFade>
  );
};

const Organs: Scene = () => {
  const { opacity } = usePop(34);
  return (
    <SceneFade>
      <Tint fill="#fbf3e0" />
      <Person x={520} y={880} scale={1.7} state="dried" />
      {/* the incision */}
      <path d="M 430 560 l 0 130" {...line(7, red)} />
      <Note x={330} y={630} size={34} color={red} anchor="end">
        a cut on the left
      </Note>
      {/* the four jars */}
      {["lungs", "liver", "stomach", "intestines"].map((label, i) => (
        <g key={label}>
          <Jar x={900 + i * 210} y={700} scale={0.92} kind={i} />
          <Note x={900 + i * 210} y={890} size={34} color={ink}>
            {label}
          </Note>
        </g>
      ))}
      {/* the heart, staying put */}
      <g opacity={opacity} transform="translate(1660 400)">
        <path
          d="M 0 60 q -90 -60 -70 -110 q 16 -40 70 -8 q 54 -32 70 8 q 20 50 -70 110 Z"
          {...line(STROKE)}
          fill="#d94b4b"
        />
        <Note x={0} y={130} size={38} color={ink}>
          the heart stays
        </Note>
        <Note x={0} y={180} size={32} color={grey}>
          you will need it weighed
        </Note>
      </g>
      <Arrow from={[560, 560]} to={[830, 640]} bend={-0.16} />
    </SceneFade>
  );
};

const NatronPack: Scene = () => {
  const frame = useCurrentFrame();
  const bury = Math.min(1, frame / 60);
  return (
    <SceneFade>
      <Tint fill="#f6efdd" />
      {/* the embalming table */}
      <g transform="translate(960 700)">
        <rect x={-560} y={-40} width={1120} height={110} rx={14} {...line(STROKE)} fill="#c8a06a" />
        <path d="M -480 70 l -30 250 M 480 70 l 30 250" {...line(16, "#8a6a3a")} />
      </g>
      {/* the body on it, head to the left */}
      <Person x={1180} y={560} scale={1.7} state="dried" rotate={-90} />
      {/* natron heaped over the middle of him */}
      <g opacity={bury}>
        <path d="M 760 662 q 50 -156 270 -156 q 220 0 270 156 Z" {...line(STROKE)} fill={NATRON} />
        <Grains x0={790} y0={540} x1={1270} y1={650} seed={101} n={40} fill="#ffffff" size={9} />
      </g>
      <Note x={380} y={320} size={92} color={red} outline>
        40 days
      </Note>
      <Note x={380} y={390} size={40} color={grey}>
        packed inside and out
      </Note>
      <Note x={1540} y={300} size={42} color={ink}>
        natron — a salt that dries
      </Note>
      <Note x={1540} y={356} size={42} color={ink}>
        out of the lake beds
      </Note>
      <Note x={1540} y={412} size={42} color={ink}>
        west of the Nile
      </Note>
      <Note x={960} y={1000} size={42} color={grey}>
        it takes the water and the fat out together
      </Note>
    </SceneFade>
  );
};

const Wrapping: Scene = () => {
  const frame = useCurrentFrame();
  const wrap = Math.min(1, frame / 90);
  return (
    <SceneFade>
      <Tint fill="#f8f1df" />
      <Person x={760} y={940} scale={1.9} state="dried" wrap={wrap} />
      {/* amulets tucked between the layers */}
      {[
        [700, 560],
        [830, 680],
        [720, 790],
      ].map(([x, y], i) => (
        <g key={i} opacity={wrap > 0.4 ? 1 : 0} transform={`translate(${x} ${y}) rotate(${-10 + i * 12})`}>
          <path d="M -30 0 q 30 -40 60 0 q -30 40 -60 0 Z" {...line(4)} fill="#3f9fc0" />
          <circle cx={0} cy={0} r={9} fill={ink} />
        </g>
      ))}
      {/* the resin pot */}
      <g transform="translate(1520 660)">
        <g transform="rotate(-34)">
          <path d="M -90 -60 q -20 170 16 200 q 74 22 148 0 q 36 -30 16 -200 Z" {...line(STROKE)} fill="#8a6a3a" />
          <path d="M -104 -60 l 208 0" {...line(STROKE)} />
          {/* the stream, leaving the lip */}
          <path
            d={`M -104 -56 q -80 ${60 + Math.sin(frame / 8) * 8} -120 220`}
            {...line(14, "#b8862f")}
            fill="none"
          />
        </g>
        <Note x={0} y={330} size={40} color={ink}>
          warm resin, poured over
        </Note>
      </g>
      <Note x={330} y={330} size={72} color={red} outline>
        20 layers
      </Note>
      <Note x={330} y={400} size={40} color={grey}>
        of linen
      </Note>
    </SceneFade>
  );
};

const NatronVerdict: Scene = () => (
  <SceneFade>
    <Tint fill="#f6ecd2" />
    {/* a scanner: the gantry ring, the bed, and him going through it */}
    <g transform="translate(760 640)">
      <rect x={-300} y={-330} width={600} height={430} rx={40} {...line(STROKE)} fill="#dfe6ee" />
      <rect x={-180} y={-230} width={360} height={330} rx={28} {...line(STROKE)} fill="#f6ecd2" />
    </g>
    <Person x={960} y={600} scale={1.05} state="wrapped" wrap={1} rotate={-90} />
    <rect x={200} y={690} width={1120} height={36} rx={12} {...line(STROKE)} fill="#c9d3dc" />
    <Stamp x={1420} y={330} label="NATRON — the most reliable" value="4,000 years" delay={8} />
    <Note x={1420} y={540} size={42} color={grey}>
      intact enough to put through a scanner
    </Note>
    <Note x={1420} y={594} size={42} color={grey}>
      and argue about
    </Note>
  </SceneFade>
);

// ── six: do it yourself ─────────────────────────────────────────────

const MonkOpen: Scene = () => (
  <Opener n="6" tint="#e2ead9">
    <Band y={900} fill="#cdddc2" seed={9} />
    <Person x={1360} y={900} scale={1.7} state="dried" pose="lotus" />
    <Bell x={1620} y={640} scale={0.9} />
  </Opener>
);

const Sokushin: Scene = () => {
  const { opacity } = usePop(34);
  return (
    <SceneFade>
      <Tint fill="#eef3e8" />
      <Person x={560} y={780} scale={2} state="fresh" pose="lotus" />
      <Note x={1330} y={280} size={62} color={ink}>
        sokushinbutsu
      </Note>
      <Note x={1330} y={350} size={40} color={grey}>
        northern Japan
      </Note>
      {/* the nine-year bar */}
      <g transform="translate(1330 560)">
        <rect x={-420} y={-40} width={840} height={80} rx={16} {...line(STROKE)} fill="#ffffff" />
        <rect x={-420} y={-40} width={560} height={80} rx={16} fill="#d94b4b" opacity={0.7} />
        <rect x={-420} y={-40} width={840} height={80} rx={16} {...line(STROKE)} fill="none" />
        <Note x={-140} y={14} size={40} color="#ffffff">
          alive for this part
        </Note>
        <Note x={280} y={14} size={40} color={ink}>
          not
        </Note>
        <Note x={0} y={110} size={54} color={red}>
          about nine years
        </Note>
      </g>
      <g opacity={opacity}>
        <Note x={1330} y={800} size={44} color={ink}>
          it is the only method on this list
        </Note>
        <Note x={1330} y={856} size={44} color={red} outline>
          you carry out on yourself
        </Note>
      </g>
    </SceneFade>
  );
};

const TreeDiet: Scene = () => {
  const frame = useCurrentFrame();
  const fat = Math.max(0.06, 1 - frame / 90);
  return (
    <SceneFade>
      <Tint fill="#f2f6ec" />
      <Note x={W / 2} y={240} size={62} color={ink}>
        1,000 days eating only what grows on a tree
      </Note>
      {/* the plate */}
      <g transform="translate(620 600)">
        <ellipse cx={0} cy={0} rx={280} ry={210} {...line(STROKE)} fill="#ffffff" />
        <ellipse cx={0} cy={0} rx={230} ry={166} {...line(3, "rgba(0,0,0,0.2)")} fill="none" />
        {/* nuts */}
        {[[-120, -50], [-40, -80], [40, -40]].map(([x, y], i) => (
          <path key={i} d={blob(x, y, 34, i + 3, 0.1)} {...line(4)} fill="#b8862f" />
        ))}
        {/* bark */}
        <path d="M -140 60 l 190 -10 l 8 46 l -190 12 Z" {...line(4)} fill="#8a6a3a" />
        {/* pine needles */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M ${90 + i * 12} 20 l ${16 - i * 3} 70`} {...line(5, "#4f8a3e")} />
        ))}
      </g>
      {["nuts", "seeds", "bark", "pine needles"].map((t, i) => (
        <Note key={t} x={1000} y={470 + i * 62} size={40} color={grey} anchor="start">
          {t}
        </Note>
      ))}
      {/* the fat gauge */}
      <g transform="translate(1560 620)">
        <rect x={-90} y={-280} width={180} height={560} rx={26} {...line(STROKE)} fill="#ffffff" />
        <rect x={-74} y={280 - 552 * fat} width={148} height={552 * fat} rx={20} fill="#f0c46b" />
        <rect x={-90} y={-280} width={180} height={560} rx={26} {...line(STROKE)} fill="none" />
        <Note x={0} y={-330} size={48} color={ink}>
          body fat
        </Note>
        <Note x={0} y={350} size={44} color={red} outline>
          fat is the part that rots
        </Note>
      </g>
    </SceneFade>
  );
};

const Lacquer: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(38);
  return (
    <SceneFade>
      <Tint fill="#edf2e6" />
      {/* the lacquer tree, tapped */}
      <g transform="translate(480 900)">
        <path d="M 0 0 l -14 -420" {...line(46, "#7a5a34")} />
        <path d="M -14 -300 q -120 -60 -170 -170 M -14 -250 q 130 -50 180 -170" {...line(22, "#7a5a34")} />
        {scatter(111, 16, -260, -640, 260, -300).map((p, i) => (
          <path key={i} d={blob(p.x, p.y, 60 * p.s, i + 4, 0.14)} fill="#5f8a3e" opacity={0.9} />
        ))}
        {/* the tap and cup */}
        <path d="M -6 -180 l 70 20" {...line(9, "#8a8a8a")} />
        <path d="M 40 -170 l 60 0 l -8 70 l -44 0 Z" {...line(4)} fill="#d9cfae" />
        <path d={`M 64 -158 l 0 ${18 + (frame % 30)}`} {...line(5, "#6b4a1e")} />
      </g>
      {/* the cup of tea, with a skull on it */}
      <g transform="translate(1360 560)">
        <path d="M -110 -70 q -14 190 20 220 q 86 24 172 0 q 34 -30 20 -220 Z" {...line(STROKE)} fill="#efe7d2" />
        <ellipse cx={0} cy={-70} rx={112} ry={32} {...line(STROKE - 1)} fill="#6b4a1e" />
        <path d="M 106 -20 q 80 20 0 90" {...line(12, "#efe7d2")} fill="none" />
        <g transform="translate(0 60)">
          <path d="M -40 20 q -14 -76 40 -76 q 54 0 40 76 Z" {...line(4)} fill="#ffffff" />
          <circle cx={-14} cy={-14} r={9} fill={ink} />
          <circle cx={14} cy={-14} r={9} fill={ink} />
          <path d="M -20 20 l 40 0 M -8 20 l 0 12 M 8 20 l 0 12" {...line(4)} />
        </g>
      </g>
      <g opacity={opacity}>
        <Note x={1360} y={840} size={48} color={red} outline>
          it is poisonous
        </Note>
        <Note x={1330} y={906} size={38} color={ink}>
          you vomit up whatever water you have left,
        </Note>
        <Note x={1330} y={958} size={38} color={ink}>
          and your body goes toxic to eat
        </Note>
      </g>
    </SceneFade>
  );
};

const SealedIn: Scene = () => {
  const frame = useCurrentFrame();
  const swing = Math.sin(frame / 7) * 14;
  return (
    <SceneFade>
      <Tint fill="#e0e6da" />
      <Band y={520} fill="#b9c4ac" seed={4} />
      {/* the chamber, underground */}
      <g transform="translate(760 900)">
        <Chamber x={0} y={0} scale={1.25} />
      </g>
      <Person x={740} y={888} scale={0.85} state="fresh" pose="lotus" />
      {/* the breathing tube, out through the lid */}
      <path d="M 772 672 l 0 -372" {...line(16, "#8a7f6a")} />
      <path d="M 772 300 q 0 -40 40 -40" {...line(16, "#8a7f6a")} fill="none" />
      {/* the bell, above ground, on its rope */}
      <path d={`M 1420 340 l ${swing * 0.6} 130`} {...line(5, "#7a6a4a")} />
      <Bell x={1420 + swing * 0.6} y={490} scale={1} swing={swing} />
      <Note x={1420} y={720} size={44} color={ink}>
        one ring a day
      </Note>
      <Note x={1420} y={776} size={38} color={grey}>
        to say he is still going
      </Note>
      <Note x={430} y={300} size={46} color={ink} anchor="start">
        lowered into a stone chamber
      </Note>
      <Note x={430} y={356} size={46} color={ink} anchor="start">
        in the lotus position
      </Note>
    </SceneFade>
  );
};

const BellStops: Scene = () => {
  const { opacity } = usePop(20);
  return (
    <SceneFade>
      <Tint fill="#d7ded0" />
      <Band y={520} fill="#b0bba4" seed={14} />
      <g transform="translate(760 900)">
        <Chamber x={0} y={0} scale={1.25} sealed />
      </g>
      <Person x={740} y={888} scale={0.85} state="dried" pose="lotus" />
      <Bell x={1420} y={490} scale={1} swing={0} />
      <Cross x={1420} y={480} s={2.6} />
      <g opacity={opacity}>
        <Note x={1420} y={700} size={54} color={red} outline>
          the bell stops
        </Note>
        <Note x={1420} y={766} size={38} color={ink}>
          they pull the tube and seal the tomb
        </Note>
        <Note x={430} y={300} size={74} color={ink} anchor="start">
          +1,000 days
        </Note>
        <Note x={430} y={366} size={40} color={grey} anchor="start">
          then they open it again to find out
        </Note>
        <Note x={430} y={416} size={40} color={grey} anchor="start">
          whether it worked
        </Note>
      </g>
    </SceneFade>
  );
};

const MonkVerdict: Scene = () => (
  <SceneFade>
    <Tint fill="#eef3e8" />
    <Note x={W / 2} y={240} size={58} color={ink}>
      several hundred are thought to have tried
    </Note>
    {/* the tally: little seated figures, nearly all of them crossed out */}
    {[...Array(36)].map((_, i) => {
      const x = 220 + (i % 12) * 130;
      const y = 400 + Math.floor(i / 12) * 140;
      const worked = i % 12 === 3 && i < 24;
      return (
        <g key={i} opacity={worked ? 1 : 0.5}>
          <Person x={x} y={y} scale={0.26} state={worked ? "dried" : "skeleton"} pose="lotus" />
          {!worked ? <Cross x={x} y={y - 34} s={0.7} color="rgba(190,40,40,0.75)" /> : null}
        </g>
      );
    })}
    <Note x={W / 2} y={840} size={64} color={red} outline>
      fewer than thirty worked
    </Note>
    <Note x={W / 2} y={930} size={44} color={ink}>
      those ones are still sitting in their temples, in robes
    </Note>
    <Note x={W / 2} y={990} size={42} color={grey}>
      everybody else simply rotted — the one thing they were avoiding
    </Note>
  </SceneFade>
);

// ── seven: plastic ──────────────────────────────────────────────────

const PlastOpen: Scene = () => (
  <Opener n="7" tint="#e6f1f9">
    <Band y={920} fill="#d5e5f0" seed={3} />
    <Tank x={1400} y={880} scale={0.9}>
      <Person x={0} y={20} scale={0.85} state="plastic" />
    </Tank>
  </Opener>
);

const VonHagens: Scene = () => {
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <Tint fill="#f2f7fb" />
      {/* a lab bench */}
      <g transform="translate(760 780)">
        <rect x={-520} y={0} width={1040} height={40} rx={10} {...line(STROKE)} fill="#c9d3dc" />
        <path d="M -440 40 l 0 200 M 440 40 l 0 200" {...line(18, "#9fb0c4")} />
        {/* flasks */}
        <g transform="translate(-300 0)">
          <path d="M -30 -160 l 0 90 l -60 70 l 180 0 l -60 -70 l 0 -90 Z" {...line(STROKE - 1)} fill="#dff0fb" />
          <path d="M -70 -30 l 140 0 l 30 30 l -200 0 Z" fill="#8fd0ef" />
        </g>
        <g transform="translate(-40 0)">
          <rect x={-60} y={-190} width={120} height={190} rx={12} {...line(STROKE - 1)} fill="#dff0fb" />
          <rect x={-52} y={-90} width={104} height={90} rx={8} fill="#c9a7e0" />
        </g>
        <g transform="translate(240 0)">
          <path d="M -76 -40 q -10 -120 76 -120 q 86 0 76 120 Z" {...line(STROKE - 1)} fill="#dff0fb" />
          <rect x={-18} y={-208} width={36} height={52} {...line(STROKE - 1)} fill="#dff0fb" />
          <path d="M -60 -40 l 120 0" {...line(3)} />
          <path d="M -60 -70 q 60 18 120 0 l 0 30 l -120 0 Z" fill="#8fd0ef" />
        </g>
      </g>
      <g opacity={opacity}>
        <Note x={1430} y={330} size={110} color={ink}>
          1977
        </Note>
        <Note x={1430} y={430} size={54} color={red} outline>
          plastination
        </Note>
        <Note x={1430} y={520} size={40} color={grey}>
          take every drop of water out of you
        </Note>
        <Note x={1430} y={572} size={40} color={grey}>
          and leave polymer in its place
        </Note>
      </g>
    </SceneFade>
  );
};

const Acetone: Scene = () => {
  const frame = useCurrentFrame();
  const swap = Math.min(1, frame / 80);
  return (
    <SceneFade>
      <Tint fill="#eef6fc" />
      {/* step one: cold acetone */}
      <g transform="translate(500 560)">
        <rect x={-260} y={-240} width={520} height={480} rx={20} {...line(STROKE)} fill="#dff0fb" />
        <rect x={-244} y={-140} width={488} height={370} rx={12} fill="#bfe3f7" />
        <Person x={0} y={190} scale={0.95} state="fresh" />
        <Bubbles x0={-220} y0={-120} x1={220} y1={210} seed={8} n={10} />
        <rect x={-260} y={-240} width={520} height={480} rx={20} {...line(STROKE)} fill="none" />
        <Note x={0} y={320} size={46} color={ink}>
          1. cold acetone
        </Note>
        <Note x={0} y={372} size={34} color={grey}>
          it swaps itself for the water in your cells
        </Note>
      </g>
      <Arrow from={[810, 540]} to={[1000, 540]} bend={-0.2} />
      {/* step two: the vacuum chamber */}
      <g transform="translate(1430 560)">
        <Tank x={0} y={200} scale={0.95}>
          <Person x={0} y={20} scale={0.85} state="plastic" />
        </Tank>
        <Note x={0} y={380} size={46} color={ink}>
          2. vacuum + liquid plastic
        </Note>
        <Note x={0} y={432} size={34} color={grey}>
          the acetone boils out, the plastic gets pulled in
        </Note>
      </g>
      {/* a single cell, changing hands, in the gap between the two tanks */}
      <g transform="translate(960 740)">
        <circle cx={0} cy={0} r={66} {...line(STROKE)} fill="#ffffff" />
        <circle cx={0} cy={0} r={58} fill="#6fb7e0" opacity={1 - swap} />
        <circle cx={0} cy={0} r={58} fill="#c9a7e0" opacity={swap} />
        <circle cx={0} cy={0} r={66} {...line(STROKE)} fill="none" />
        <Note x={0} y={-96} size={34} color="#3f8fb8">
          water
        </Note>
        <Note x={0} y={124} size={34} color="#8a5fb0">
          polymer
        </Note>
      </g>
    </SceneFade>
  );
};

const HowLong: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Tint fill="#f2f7fb" />
      <Clock x={640} y={540} r={250} t={frame / 40} />
      <Note x={640} y={880} size={96} color={red} outline>
        1,500 hours
      </Note>
      <Note x={640} y={950} size={40} color={grey}>
        of work, per body
      </Note>
      {/* the year, as twelve boxes with most of them filled */}
      <g transform="translate(1420 500)">
        {[...Array(12)].map((_, i) => {
          const x = (i % 4) * 150 - 225;
          const y = Math.floor(i / 4) * 150 - 150;
          const on = i < 10;
          return (
            <g key={i}>
              <rect x={x - 60} y={y - 60} width={120} height={120} rx={14} {...line(STROKE - 1)} fill={on ? "#8fd0ef" : "#ffffff"} />
            </g>
          );
        })}
        <Note x={0} y={330} size={54} color={ink}>
          which is most of a year
        </Note>
      </g>
    </SceneFade>
  );
};

const Posed: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Tint fill="#f6f9fc" />
      <Band y={900} fill="#e2eaf1" seed={2} />
      {/* playing chess */}
      <g>
        <Person x={470} y={890} scale={1.2} state="plastic" rotate={-5} />
        <Person x={900} y={890} scale={1.2} state="plastic" rotate={5} />
        {/* table */}
        <rect x={590} y={700} width={190} height={22} rx={6} {...line(STROKE - 1)} fill="#c9a06a" />
        <path d="M 620 722 l -14 168 M 750 722 l 14 168" {...line(12, "#8a6a3a")} />
        {/* board */}
        <g transform="translate(590 662)">
          {[...Array(24)].map((_, i) => (
            <rect
              key={i}
              x={(i % 8) * 24}
              y={Math.floor(i / 8) * 12}
              width={24}
              height={12}
              fill={(i + Math.floor(i / 8)) % 2 ? "#3a3a3a" : "#efe7d2"}
            />
          ))}
          <rect x={0} y={0} width={192} height={36} {...line(3)} fill="none" />
          <path d="M 40 0 l 0 -40 l 16 0 l 0 40 Z" {...line(3)} fill="#ffffff" />
          <path d="M 132 0 l 0 -48 l 16 0 l 0 48 Z" {...line(3)} fill="#2b2b2b" />
        </g>
      </g>
      {/* riding a horse — the rider goes down first, so the horse's barrel
          covers his legs and he reads as sitting astride */}
      <g transform="translate(1450 890)">
        <Person x={-10} y={-112} scale={0.9} state="plastic" />
        <path
          d="M -190 -120 q 0 -84 70 -88 q 110 -8 210 0 q 70 4 70 88 q 0 66 -70 74 q -110 10 -210 0 q -70 -8 -70 -74 Z"
          {...line(STROKE)}
          fill="#b98a4e"
        />
        {/* legs */}
        <path d="M -150 -60 l -10 60 M -96 -56 l -4 56 M 96 -56 l 6 56 M 148 -60 l 12 60" {...line(22, "#b98a4e")} />
        {/* neck and head */}
        <path d="M 130 -170 q 60 -30 92 -96" {...line(48, "#b98a4e")} />
        <path d="M 196 -262 q 48 -20 66 22 q 16 34 -30 60 q -44 22 -66 -22 Z" {...line(STROKE)} fill="#b98a4e" />
        <circle cx={232} cy={-256} r={6} fill={ink} />
        <path d="M 196 -286 l 10 -34 l 22 26 Z" {...line(4)} fill="#b98a4e" />
        {/* tail */}
        <path d={`M -190 -150 q -64 ${30 + Math.sin(frame / 8) * 14} -74 96`} {...line(14, "#8a6a3a")} />
      </g>
      <Note x={W / 2} y={250} size={58} color={red} outline>
        it has not set yet, so you can be arranged
      </Note>
      <Note x={W / 2} y={1030} size={40} color={grey}>
        which is why the touring exhibitions look like that
      </Note>
    </SceneFade>
  );
};

const PlastVerdict: Scene = () => {
  const { opacity } = usePop(26);
  return (
    <SceneFade>
      <Tint fill="#eef6fc" />
      {/* the consent form */}
      <g transform="translate(620 580) rotate(-3)">
        <rect x={-300} y={-330} width={600} height={700} rx={12} {...line(STROKE)} fill="#ffffff" />
        <Note x={0} y={-250} size={44} color={ink}>
          BODY DONOR FORM
        </Note>
        {[...Array(7)].map((_, i) => (
          <path key={i} d={`M -230 ${-160 + i * 62} l 460 0`} {...line(4, "#c9d3dc")} />
        ))}
        <path d="M -230 300 l 300 0" {...line(4, "#c9d3dc")} />
        <path d="M -210 300 q 40 -50 80 -6 q 30 34 70 -30 q 30 -40 66 20" {...line(5, "#2f5fa8")} fill="none" />
        <Tick x={210} y={-160} s={1.2} />
      </g>
      <g opacity={opacity}>
        <Note x={1400} y={420} size={54} color={ink}>
          the only one on this list
        </Note>
        <Note x={1400} y={484} size={54} color={red} outline>
          you can volunteer for
        </Note>
        <Note x={1400} y={640} size={92} color={ink}>
          tens of thousands
        </Note>
        <Note x={1400} y={710} size={42} color={grey}>
          have already filled in the form
        </Note>
      </g>
    </SceneFade>
  );
};

// ── the board ───────────────────────────────────────────────────────

const RANK: { name: string; years: number; label: string; fill: string; note?: string }[] = [
  { name: "DESERT", years: 7000, label: "7,000 years", fill: "#f0d79b" },
  { name: "ICE", years: 5300, label: "5,300 years", fill: "#cfe6f5" },
  { name: "NATRON", years: 4000, label: "4,000 years", fill: "#e8d6a8" },
  { name: "SALT", years: 2500, label: "2,500 years", fill: "#e2e8ee" },
  { name: "BOG", years: 2400, label: "2,400 years", fill: "#8a6a44", note: "keeps no skeleton" },
  { name: "MONKS", years: 900, label: "900 years", fill: "#cdddc2" },
  { name: "PLASTIC", years: 300, label: "since the 1970s", fill: "#e6d3d3", note: "nobody knows yet" },
];

const Board: Scene = () => (
  <SceneFade>
    <Paper />
    <Note x={W / 2} y={150} size={66} color={ink}>
      ranked by how long it has actually been shown to work
    </Note>
    {RANK.map((row, i) => {
      const { opacity } = usePop(4 + i * 6, 12);
      const y = 250 + i * 108;
      const w = (row.years / 7000) * 1050;
      return (
        <g key={row.name} opacity={opacity}>
          <Note x={370} y={y + 40} size={46} color={ink} anchor="end">
            {row.name}
          </Note>
          <rect x={400} y={y} width={w} height={62} rx={10} {...line(STROKE - 1)} fill={row.fill} />
          <Note x={410 + w + 20} y={y + 46} size={40} color={red} anchor="start">
            {row.label}
          </Note>
          {row.note ? (
            <Note x={430 + w + row.label.length * 24 + 30} y={y + 46} size={30} color={grey} anchor="start">
              ({row.note})
            </Note>
          ) : null}
        </g>
      );
    })}
    <Note x={W / 2} y={1030} size={38} color={grey}>
      the bog keeps your face and loses your bones
    </Note>
  </SceneFade>
);

const Signoff: Scene = () => {
  const { opacity } = usePop(18);
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Paper />
      <Band y={880} fill="#f1efe8" seed={5} />
      {(["dried", "bog", "frozen", "wrapped", "dried", "dried", "plastic"] as const).map((s, i) => (
        <Person
          key={i}
          x={280 + i * 230}
          y={880}
          scale={1.05}
          state={s}
          pose={i === 5 ? "lotus" : "stand"}
          wrap={s === "wrapped" ? 1 : 0}
        />
      ))}
      <g opacity={Math.min(1, frame / 30)}>
        <Note x={1890} y={640} size={190} color={red} anchor="end" outline>
          ?
        </Note>
      </g>
      <g opacity={opacity}>
        <Note x={W / 2} y={968} size={52} color={ink}>
          plastic has only existed since the seventies
        </Note>
        <Note x={W / 2} y={1026} size={44} color={grey}>
          so honestly, nobody knows yet
        </Note>
      </g>
    </SceneFade>
  );
};

// ── registry ────────────────────────────────────────────────────────

const SCENES: Record<string, Scene> = {
  fresh: Fresh,
  autolysis: Autolysis,
  "decay-clock": DecayClock,
  "seven-ways": SevenWays,
  "ice-open": IceOpen,
  otzi: Otzi,
  "otzi-age": OtziAge,
  "freeze-dry": FreezeDry,
  "otzi-detail": OtziDetail,
  arrow: ArrowScene,
  "ice-verdict": IceVerdict,
  "bog-open": BogOpen,
  tollund: Tollund,
  "tollund-age": TollundAge,
  "bog-chem": BogChem,
  sphagnan: Sphagnan,
  "no-bones": NoBones,
  "bog-verdict": BogVerdict,
  "desert-open": DesertOpen,
  "dry-out": DryOut,
  chinchorro: Chinchorro,
  arsenic: Arsenic,
  rebuild: Rebuild,
  "desert-verdict": DesertVerdict,
  "salt-open": SaltOpen,
  saltmen: Saltmen,
  "salt-how": SaltHow,
  "salt-detail": SaltDetail,
  "mine-closed": MineClosed,
  "salt-verdict": SaltVerdict,
  "natron-open": NatronOpen,
  "egypt-intro": EgyptIntro,
  "why-egypt": WhyEgypt,
  brain: Brain,
  organs: Organs,
  "natron-pack": NatronPack,
  wrapping: Wrapping,
  "natron-verdict": NatronVerdict,
  "monk-open": MonkOpen,
  sokushin: Sokushin,
  "tree-diet": TreeDiet,
  lacquer: Lacquer,
  "sealed-in": SealedIn,
  "bell-stops": BellStops,
  "monk-verdict": MonkVerdict,
  "plast-open": PlastOpen,
  vonhagens: VonHagens,
  acetone: Acetone,
  "how-long": HowLong,
  posed: Posed,
  "plast-verdict": PlastVerdict,
  board: Board,
  signoff: Signoff,
};

/** Scenes on a dark ground, which need the boxed chapter title. */
export const DARK_SCENES = new Set(["saltmen"]);

export const renderScene = (scene: string) => {
  const C = SCENES[scene];
  return C ? <C /> : null;
};

export const SCENE_NAMES = Object.keys(SCENES);
