import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  Arrow,
  H,
  Note,
  SceneFade,
  Stamp,
  Stars,
  STROKE,
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
  Cocci,
  Face,
  Magnifier,
  Mite,
  Phage,
  PhStrip,
  Rod,
  SkinSection,
  Yeast,
  miteBody,
  scatter,
  sebum,
  skinDeep,
  skinMid,
  skinTop,
} from "./art";

type Scene = React.FC;

const Paper: Scene = () => <rect x={0} y={0} width={W} height={H} fill="#ffffff" />;

/** The warm out-of-focus field every close-up sits in. */
const Micro: React.FC<{ tint?: string }> = ({ tint = "#fdf1e6" }) => (
  <>
    <rect x={0} y={0} width={W} height={H} fill={tint} />
    {scatter(9, 26, -60, -60, W + 60, H + 60).map((p, i) => (
      <path key={i} d={blob(p.x, p.y, 60 + p.s * 90, i + 3, 0.2)} fill="#f6e2d0" opacity={0.55} />
    ))}
  </>
);

// ── mites ───────────────────────────────────────────────────────────

const FaceOpen: Scene = () => (
  <SceneFade>
    <Paper />
    <Face x={W / 2} y={560} scale={1.35} />
  </SceneFade>
);

const FaceZoom: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <Paper />
      <Face x={640} y={560} scale={1.05} />
      <Magnifier id="fz" x={1400} y={520} r={290} fill="#fdf1e6">
        <Micro />
        {scatter(4, 5, 1180, 330, 1620, 700).map((p, i) => (
          <Mite key={i} x={p.x} y={p.y} scale={0.5} rotate={p.a} wiggle={Math.sin(frame / 9 + i) * 3} />
        ))}
      </Magnifier>
      <path d="M 800 420 q 180 -60 320 40" {...line(4, grey)} strokeDasharray="14 12" />
      <g opacity={opacity}>
        <Note x={1400} y={890} size={58} color={red} outline>
          they are already there
        </Note>
      </g>
    </SceneFade>
  );
};

const Discovered: Scene = () => {
  const { opacity } = usePop(26);
  return (
    <SceneFade>
      <Paper />
      {/* an old brass microscope */}
      <g transform="translate(680 700) scale(1.55)">
        {/* foot */}
        <path d="M -130 150 q 130 34 260 0 l 0 30 q -130 30 -260 0 Z" {...line(STROKE - 1)} fill="#c9a24a" />
        {/* the C-shaped arm */}
        <path d="M 60 150 q 96 -60 40 -150 q -40 -64 -30 -130" {...line(26, "#c9a24a")} />
        {/* stage, with a slide on it */}
        <rect x={-118} y={26} width={190} height={20} rx={6} {...line(STROKE - 1)} fill="#b08c33" />
        <rect x={-92} y={12} width={104} height={16} rx={3} {...line(3)} fill="#ffffff" />
        {/* focus knob */}
        <circle cx={92} cy={44} r={28} {...line(STROKE - 1)} fill="#b08c33" />
        <circle cx={92} cy={44} r={11} fill="#8a6c22" />
        {/* body tube and eyepiece */}
        <rect x={-56} y={-190} width={68} height={190} rx={12} {...line(STROKE - 1)} fill="#d9b45c" />
        <rect x={-64} y={-236} width={84} height={54} rx={12} {...line(STROKE - 1)} fill="#c9a24a" />
        <ellipse cx={-22} cy={-236} rx={42} ry={13} {...line(STROKE - 1)} fill="#efe7cf" />
        {/* objective lens */}
        <path d="M -44 0 l 12 30 l 32 0 l 12 -30 Z" {...line(STROKE - 1)} fill="#b08c33" />
      </g>
      <g opacity={opacity}>
        <Note x={1380} y={470} size={92} color={ink}>
          1842
        </Note>
        <Note x={1380} y={560} size={40} color={grey}>
          the first time anyone
        </Note>
        <Note x={1380} y={610} size={40} color={grey}>
          looked closely enough
        </Note>
      </g>
    </SceneFade>
  );
};

const Oiliest: Scene = () => {
  const { opacity } = usePop(28);
  return (
    <SceneFade>
      <Paper />
      <Face x={700} y={560} scale={1.15} />
      {scatter(21, 16, 560, 420, 850, 720).map((p, i) => (
        <ellipse key={i} cx={p.x} cy={p.y} rx={9 * p.s} ry={12 * p.s} {...line(3, "#c9a13a")} fill={sebum} />
      ))}
      <g opacity={opacity}>
        <Note x={1420} y={470} size={62} color={red} outline>
          the oiliest skin
        </Note>
        <Note x={1420} y={540} size={62} color={red} outline>
          you have
        </Note>
        <Note x={1420} y={640} size={40} color={grey}>
          and oil is the whole
        </Note>
        <Note x={1420} y={690} size={40} color={grey}>
          economy up there
        </Note>
        <Arrow from={[1180, 560]} to={[900, 560]} bend={0.12} color={grey} />
      </g>
    </SceneFade>
  );
};

const TwoSpecies: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Micro />
      <Mite x={560} y={420} scale={1.5} wiggle={Math.sin(frame / 10) * 4} />
      <Note x={560} y={620} size={44} color={ink}>
        Demodex folliculorum
      </Note>
      <Note x={560} y={676} size={36} color={grey}>
        in the hair follicle
      </Note>
      <Mite x={1360} y={800} scale={1.05} wiggle={Math.sin(frame / 10 + 2) * 4} />
      <Note x={1360} y={960} size={44} color={ink}>
        Demodex brevis
      </Note>
      <Note x={1360} y={1016} size={36} color={grey}>
        deeper, in the oil gland
      </Note>
    </SceneFade>
  );
};

const MiteSize: Scene = () => {
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <Paper />
      <path d="M 300 520 l 620 0" {...line(14, "#4a3526")} />
      <Note x={610} y={470} size={38} color={grey}>
        one human hair, side on
      </Note>
      <Mite x={1330} y={520} scale={1.9} />
      <path d="M 1140 640 l 380 0 M 1140 620 l 0 40 M 1520 620 l 0 40" {...line(4, red)} />
      <Note x={1330} y={720} size={44} color={red}>
        0.3 mm
      </Note>
      <g opacity={opacity}>
        <Note x={W / 2} y={900} size={54} color={ink}>
          about three hair-widths, end to end
        </Note>
      </g>
    </SceneFade>
  );
};

const MiteBody: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(34);
  return (
    <SceneFade>
      <Micro />
      <Mite x={860} y={540} scale={2.6} wiggle={Math.sin(frame / 11) * 4} />
      <g opacity={opacity}>
        <Note x={470} y={330} size={44} color={red}>
          eight stubby legs
        </Note>
        <Arrow from={[500, 360]} to={[640, 470]} bend={0.15} />
        <Note x={1400} y={830} size={44} color={red}>
          and a long bare tail
        </Note>
        <Arrow from={[1370, 800]} to={[1160, 640]} bend={0.15} />
      </g>
    </SceneFade>
  );
};

const Mouthparts: Scene = () => {
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <Micro />
      <Mite x={900} y={560} scale={2.9} />
      <g opacity={opacity}>
        <Note x={380} y={300} size={40} color={grey}>
          needles, for piercing cells
        </Note>
        <Arrow from={[430, 335]} to={[600, 500]} bend={0.15} color={grey} />
        <Note x={1470} y={330} size={40} color={grey}>
          legs run on muscles
        </Note>
        <Note x={1470} y={380} size={40} color={grey}>
          made of one cell each
        </Note>
        <Note x={W / 2} y={940} size={56} color={red} outline>
          stripped down to almost nothing
        </Note>
      </g>
    </SceneFade>
  );
};

const Follicle: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#fdf1e6" />
      <SkinSection y={300} follicleX={820}>
        {[0, 1].map((i) => (
          <Mite
            key={i}
            x={806 + i * 26}
            y={430 + i * 120}
            scale={0.78}
            rotate={96 + i * 4}
            wiggle={Math.sin(frame / 12 + i) * 3}
          />
        ))}
      </SkinSection>
      <Note x={1420} y={470} size={48} color={ink}>
        head down, tail up
      </Note>
      <Note x={1420} y={530} size={40} color={grey}>
        eating the oil, all day
      </Note>
      <Arrow from={[1300, 500]} to={[930, 520]} bend={0.1} color={grey} />
    </SceneFade>
  );
};

const HotSpots: Scene = () => {
  const { opacity } = usePop(26);
  const spots: [number, number, string][] = [
    [860, 500, "nose"],
    [960, 330, "forehead"],
    [960, 700, "chin"],
    [820, 420, "brows"],
    [1060, 470, "lashes"],
  ];
  return (
    <SceneFade>
      <Paper />
      <Face x={960} y={520} scale={1.25} />
      <g opacity={opacity}>
        {scatter(31, 60, 790, 330, 1130, 700).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={5} fill={red} opacity={0.75} />
        ))}
        {spots.map(([x, y, label], i) => (
          <g key={label}>
            <Note x={i % 2 ? 1500 : 430} y={330 + i * 96} size={42} color={red}>
              {label}
            </Note>
            <Arrow
              from={[i % 2 ? 1400 : 530, 320 + i * 96]}
              to={[x, y]}
              bend={0.1}
              color={red}
              width={4}
              head={14}
            />
          </g>
        ))}
      </g>
    </SceneFade>
  );
};

const PackedIn: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#fdf1e6" />
      <SkinSection y={300} follicleX={880}>
        {[0, 1, 2, 3].map((i) => (
          <Mite
            key={i}
            x={846 + (i % 2) * 62}
            y={400 + i * 78}
            scale={0.66}
            rotate={92 + (i % 2 ? 8 : -6)}
            wiggle={Math.sin(frame / 12 + i) * 3}
          />
        ))}
      </SkinSection>
      <Note x={1450} y={520} size={52} color={red} outline>
        several to a pore
      </Note>
      <Note x={1450} y={584} size={38} color={grey}>
        all facing the same way
      </Note>
    </SceneFade>
  );
};

const Eyelashes: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <Micro tint="#fdf1e6" />
      {/* a lash line seen close up */}
      <path d="M -20 700 q 500 -80 1960 0" {...line(STROKE)} fill={skinTop} />
      <path d="M -20 700 q 500 -80 1960 0 L 1960 1120 L -20 1120 Z" fill={skinTop} />
      {[...Array(9)].map((_, i) => {
        const x = 140 + i * 200;
        return <path key={i} d={`M ${x} 690 q -30 -190 -70 -300`} {...line(15, "#4a3526")} />;
      })}
      {[...Array(9)].map((_, i) => {
        const x = 140 + i * 200;
        return (
          <Mite
            key={i}
            x={x - 18}
            y={640}
            scale={0.5}
            rotate={250 + (i % 3) * 6}
            wiggle={Math.sin(frame / 10 + i) * 3}
          />
        );
      })}
      <g opacity={opacity}>
        <Note x={W / 2} y={930} size={62} color={red} outline>
          the roots of your eyelashes
        </Note>
        <Note x={W / 2} y={1000} size={40} color="#7a4a2a">
          the most reliable place to find them
        </Note>
      </g>
    </SceneFade>
  );
};

const NightCrawl: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(40);
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#0d1020" />
      <Stars seed={51} h={H} count={40} />
      <Face x={860} y={620} scale={1.25} eyesShut />
      {scatter(61, 7, 700, 430, 1030, 760).map((p, i) => (
        <Mite
          key={i}
          x={p.x + Math.sin(frame / 40 + i) * 26}
          y={p.y + Math.cos(frame / 46 + i) * 14}
          scale={0.42}
          rotate={p.a}
          wiggle={Math.sin(frame / 8 + i) * 4}
        />
      ))}
      <g opacity={opacity}>
        <Note x={1520} y={440} size={54} color="#ffffff">
          only in the dark
        </Note>
        <Note x={1520} y={520} size={44} color="#9fd0f5">
          about a centimetre
        </Note>
        <Note x={1520} y={572} size={44} color="#9fd0f5">
          an hour
        </Note>
      </g>
    </SceneFade>
  );
};

const Eggs: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#fdf1e6" />
      <SkinSection y={300} follicleX={800}>
        <Mite x={790} y={430} scale={0.72} rotate={94} wiggle={Math.sin(frame / 12) * 3} />
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse
            key={i}
            cx={770 + (i % 2) * 46}
            cy={560 + i * 34}
            rx={17}
            ry={11}
            {...line(3)}
            fill="#fff6de"
          />
        ))}
      </SkinSection>
      <Note x={1440} y={520} size={48} color={ink}>
        eggs, before morning
      </Note>
      <Stamp x={1400} y={800} label="THE WHOLE LIFE" value="TWO WEEKS" delay={30} />
    </SceneFade>
  );
};

const Mating: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(36);
  return (
    <SceneFade>
      <Micro />
      <path d="M 960 -20 l 0 1120" {...line(30, "#4a3526")} />
      <Mite x={830} y={470} scale={1.15} rotate={-84} wiggle={Math.sin(frame / 11) * 3} />
      <Mite x={830} y={690} scale={1.15} rotate={-84} wiggle={Math.sin(frame / 11 + 1) * 3} />
      <g opacity={opacity}>
        <Note x={1420} y={430} size={44} color={red}>
          his genitals point
        </Note>
        <Note x={1420} y={482} size={44} color={red}>
          up, out of his back
        </Note>
        <Note x={1420} y={580} size={38} color={grey}>
          so this has to happen
        </Note>
        <Note x={1420} y={628} size={38} color={grey}>
          on the side of a hair
        </Note>
      </g>
    </SceneFade>
  );
};

const AnusMyth: Scene = () => {
  const frame = useCurrentFrame();
  const cross = usePop(46, 9);
  const { opacity } = usePop(70);
  return (
    <SceneFade>
      <Paper />
      <Note x={W / 2} y={280} size={62} color={grey}>
        &#8220;they have no anus and eventually burst&#8221;
      </Note>
      <Mite x={W / 2} y={620} scale={2.4} wiggle={Math.sin(frame / 11) * 4} />
      <g opacity={cross.opacity}>
        <path d="M 560 200 L 1360 340 M 1360 200 L 560 340" {...line(16, red)} />
      </g>
      <g opacity={opacity}>
        <Note x={W / 2} y={950} size={64} color={red} outline>
          sequenced in 2022 &#8212; they have one
        </Note>
      </g>
    </SceneFade>
  );
};

const LosingGenes: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(34);
  const gone = Math.min(9, Math.floor(frame / 9));
  return (
    <SceneFade>
      <Paper />
      <Note x={W / 2} y={280} size={48} color={grey}>
        genes, over evolutionary time
      </Note>
      {[...Array(18)].map((_, i) => (
        <rect
          key={i}
          x={330 + (i % 9) * 140}
          y={380 + Math.floor(i / 9) * 120}
          width={108}
          height={84}
          rx={10}
          {...line(4)}
          fill={i < gone ? "#eeeeee" : "#8fbf7a"}
          opacity={i < gone ? 0.5 : 1}
        />
      ))}
      <g opacity={opacity}>
        <Note x={W / 2} y={720} size={52} color={red} outline>
          fewer than almost any related animal
        </Note>
        <Note x={W / 2} y={860} size={44} color={grey}>
          they cannot even wake themselves up &#8212; they run on
        </Note>
        <Note x={W / 2} y={914} size={44} color={grey}>
          the melatonin your skin puts out at dusk
        </Note>
      </g>
    </SceneFade>
  );
};

const Rosacea: Scene = () => {
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <Paper />
      <Face x={620} y={560} scale={1.1} />
      <g opacity={0.5}>
        {scatter(71, 40, 470, 470, 780, 700).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={12 * p.s} fill="#e06a5a" />
        ))}
      </g>
      <Note x={620} y={950} size={44} color={grey}>
        rosacea
      </Note>
      <g opacity={opacity}>
        <Note x={1420} y={470} size={56} color={red} outline>
          far higher mite counts
        </Note>
        <Note x={1420} y={590} size={40} color={grey}>
          still being argued about:
        </Note>
        <Note x={1420} y={642} size={40} color={grey}>
          cause, or just good conditions?
        </Note>
      </g>
    </SceneFade>
  );
};

const BecomingUs: Scene = () => {
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <Micro />
      <Mite x={700} y={560} scale={2.1} />
      <Arrow from={[1020, 560]} to={[1300, 560]} bend={0} color={grey} width={7} head={26} />
      <Face x={1560} y={560} scale={0.72} />
      <g opacity={opacity}>
        <Note x={W / 2} y={930} size={58} color={red} outline>
          on their way to becoming part of us
        </Note>
      </g>
    </SceneFade>
  );
};

const Inherited: Scene = () => (
  <SceneFade>
    <Paper />
    <Face x={640} y={520} scale={1.15} />
    <Face x={1330} y={700} scale={0.6} />
    <Arrow from={[860, 620]} to={[1180, 690]} bend={0.14} color={red} width={7} head={24} />
    <Note x={1020} y={880} size={52} color={ink}>
      you were given them
    </Note>
    <Note x={1020} y={940} size={40} color={grey}>
      in your first days, off whoever held you
    </Note>
  </SceneFade>
);

const HowMany: Scene = () => (
  <SceneFade>
    <Paper />
    <Face x={640} y={560} scale={1.15} />
    <Stamp x={1370} y={540} label="ON AN ADULT FACE" value="HUNDREDS" delay={16} />
  </SceneFade>
);

// ── bacteria ────────────────────────────────────────────────────────

const BactOpen: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Micro tint="#f2f8ee" />
      {scatter(81, 16, 200, 220, 1720, 900).map((p, i) => (
        <Rod key={i} x={p.x} y={p.y} scale={p.s} rotate={p.a + Math.sin(frame / 20 + i) * 6} />
      ))}
    </SceneFade>
  );
};

const SkinOrgan: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(34);
  return (
    <SceneFade>
      <Paper />
      <Face x={620} y={540} scale={1.1} />
      {scatter(91, 22, 430, 300, 830, 780).map((p, i) => {
        const t = ((frame * 2 + i * 40) % 260) / 260;
        return (
          <rect
            key={i}
            x={p.x + t * 240}
            y={p.y + t * 120}
            width={16}
            height={12}
            rx={3}
            fill="#e8cdb8"
            opacity={1 - t}
            transform={`rotate(${p.a} ${p.x} ${p.y})`}
          />
        );
      })}
      <g opacity={opacity}>
        <Note x={1420} y={430} size={74} color={ink}>
          30,000+
        </Note>
        <Note x={1420} y={500} size={44} color={grey}>
          dead skin cells leave you
        </Note>
        <Note x={1420} y={552} size={44} color={grey}>
          every hour
        </Note>
        <Note x={1420} y={680} size={40} color={grey}>
          two square metres of skin,
        </Note>
        <Note x={1420} y={730} size={40} color={grey}>
          replaced continuously
        </Note>
      </g>
    </SceneFade>
  );
};

const PerCm: Scene = () => {
  const frame = useCurrentFrame();
  const shown = Math.min(240, Math.floor(frame * 5));
  return (
    <SceneFade>
      <Paper />
      <rect x={200} y={280} width={620} height={620} {...line(STROKE)} fill="#f2f8ee" />
      <Note x={510} y={960} size={40} color={grey}>
        one square centimetre
      </Note>
      {scatter(101, 240, 220, 300, 800, 880)
        .slice(0, shown)
        .map((p, i) => (
          <Rod key={i} x={p.x} y={p.y} scale={0.22} rotate={p.a} />
        ))}
      <Note x={1400} y={430} size={84} color={red} outline>
        ~1,000,000
      </Note>
      <Note x={1400} y={500} size={42} color={grey}>
        bacteria, on that square
      </Note>
      <Note x={1400} y={660} size={66} color={ink}>
        ~100,000,000,000
      </Note>
      <Note x={1400} y={720} size={42} color={grey}>
        on all of your skin
      </Note>
    </SceneFade>
  );
};

const Hostile: Scene = () => {
  const { opacity } = usePop(20);
  const items = ["dry", "salty", "acidic", "cool", "nothing to eat"];
  return (
    <SceneFade>
      <Paper />
      <Note x={W / 2} y={270} size={54} color={grey}>
        skin is a bad place to live
      </Note>
      {items.map((t, i) => (
        <g key={t} opacity={Math.min(1, Math.max(0, opacity * 2 - i * 0.35))}>
          <Note x={W / 2} y={420 + i * 108} size={68} color={i === 4 ? red : ink}>
            {t}
          </Note>
        </g>
      ))}
      <Note x={W / 2} y={1010} size={40} color={grey}>
        &#8230; unless you happen to like grease
      </Note>
    </SceneFade>
  );
};

const Acnes: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <Micro tint="#f2f8ee" />
      {scatter(111, 13, 260, 300, 1660, 860).map((p, i) => (
        <Rod key={i} x={p.x} y={p.y} scale={p.s * 1.2} rotate={p.a + Math.sin(frame / 18 + i) * 5} />
      ))}
      <g opacity={opacity}>
        <Note x={W / 2} y={210} size={64} color={ink}>
          Cutibacterium acnes
        </Note>
        <Note x={W / 2} y={990} size={48} color={red} outline>
          on essentially everyone, mostly doing nothing
        </Note>
      </g>
    </SceneFade>
  );
};

const Species: Scene = () => {
  const { opacity } = usePop(30);
  const sites: [number, number, string][] = [
    [560, 520, "scalp"],
    [560, 810, "face"],
    [1360, 520, "forearm"],
    [1360, 810, "back"],
  ];
  return (
    <SceneFade>
      <Paper />
      <Note x={W / 2} y={230} size={78} color={ink}>
        ~1,000 species
      </Note>
      <Note x={W / 2} y={300} size={40} color={grey}>
        and a different mix everywhere you sample
      </Note>
      {sites.map(([x, y, name], i) => (
        <g key={name} opacity={Math.min(1, opacity * 2 - i * 0.3)}>
          <circle cx={x} cy={y} r={112} {...line(STROKE - 1)} fill="#f2f8ee" />
          {scatter(120 + i, 9, x - 72, y - 72, x + 72, y + 72).map((p, j) =>
            j % 3 === 0 ? (
              <Cocci key={j} x={p.x} y={p.y} scale={0.24} seed={j + i} />
            ) : (
              <Rod key={j} x={p.x} y={p.y} scale={0.3} rotate={p.a} />
            )
          )}
          <Note x={x} y={y + 158} size={40} color={grey}>
            {name}
          </Note>
        </g>
      ))}
    </SceneFade>
  );
};

const EatsOil: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Micro tint="#fdf6e6" />
      <path d={blob(700, 560, 250, 13, 0.1)} {...line(STROKE - 1)} fill={sebum} />
      <Note x={700} y={575} size={48} color="#7a5510">
        sebum
      </Note>
      {[0, 1, 2].map((i) => (
        <Rod key={i} x={1060 + i * 40} y={430 + i * 140} scale={1.1} rotate={-10 + i * 12} />
      ))}
      {[...Array(7)].map((_, i) => {
        const t = ((frame * 3 + i * 30) % 220) / 220;
        return (
          <circle
            key={i}
            cx={1180 + t * 380}
            cy={430 + (i % 3) * 140 + Math.sin(t * 6 + i) * 20}
            r={11}
            {...line(3, "#c9a13a")}
            fill="#ffe9a8"
            opacity={1 - t * 0.6}
          />
        );
      })}
      <Note x={1600} y={880} size={44} color="#7a5510">
        free fatty acids
      </Note>
    </SceneFade>
  );
};

const AcidMantle: Scene = () => {
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <Paper />
      <Note x={W / 2} y={250} size={52} color={grey}>
        that waste is the point
      </Note>
      <PhStrip x={130} y={470} mark={5} />
      <g opacity={opacity}>
        <Note x={W / 2} y={800} size={64} color={red} outline>
          your skin sits at about pH 5
        </Note>
        <Note x={W / 2} y={900} size={44} color={grey}>
          and most of what would hurt you
        </Note>
        <Note x={W / 2} y={950} size={44} color={grey}>
          cannot get established in that
        </Note>
      </g>
    </SceneFade>
  );
};

const StaphWar: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(40);
  return (
    <SceneFade>
      <Micro tint="#f7f4ee" />
      <Cocci x={620} y={540} scale={1.5} seed={7} />
      <Note x={620} y={790} size={40} color={ink}>
        S. epidermidis
      </Note>
      <Note x={620} y={840} size={34} color="#3f8f3f">
        yours
      </Note>
      <Cocci x={1360} y={540} scale={1.5} seed={11} fill="#e07a6a" />
      <Note x={1360} y={790} size={40} color={ink}>
        S. aureus
      </Note>
      <Note x={1360} y={840} size={34} color={red}>
        not yours
      </Note>
      {[...Array(5)].map((_, i) => {
        const t = ((frame * 4 + i * 26) % 130) / 130;
        return <circle key={i} cx={780 + t * 470} cy={520 + Math.sin(t * 8 + i) * 40} r={9} fill="#3f8f3f" />;
      })}
      <g opacity={opacity}>
        <path d="M 1230 420 L 1500 660 M 1500 420 L 1230 660" {...line(14, red)} />
        <Note x={W / 2} y={990} size={48} color={ink}>
          it makes compounds that kill the other one
        </Note>
      </g>
    </SceneFade>
  );
};

const Fingerprint: Scene = () => {
  const { opacity } = usePop(28);
  return (
    <SceneFade>
      <Paper />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle cx={430 + i * 530} cy={520} r={150} {...line(STROKE - 1)} fill="#f2f8ee" />
          {scatter(140 + i, 12, 330 + i * 530, 420, 530 + i * 530, 620).map((p, j) =>
            j % 4 === 0 ? (
              <Cocci key={j} x={p.x} y={p.y} scale={0.3} seed={j * (i + 2)} />
            ) : (
              <Rod key={j} x={p.x} y={p.y} scale={0.34} rotate={p.a} />
            )
          )}
          <Note x={430 + i * 530} y={730} size={38} color={grey}>
            {["you", "someone else", "you, a year later"][i]}
          </Note>
        </g>
      ))}
      <g opacity={opacity}>
        <Note x={W / 2} y={900} size={54} color={red} outline>
          close to unique, and it stays put
        </Note>
      </g>
    </SceneFade>
  );
};

const HeldLine: Scene = () => (
  <SceneFade>
    <Paper />
    <Face x={700} y={560} scale={1.2} />
    {scatter(151, 44, 520, 340, 880, 760).map((p, i) =>
      i % 3 === 0 ? (
        <Cocci key={i} x={p.x} y={p.y} scale={0.16} seed={i} />
      ) : (
        <Rod key={i} x={p.x} y={p.y} scale={0.2} rotate={p.a} />
      )
    )}
    <Note x={1440} y={470} size={62} color={red} outline>
      not clean
    </Note>
    <Note x={1440} y={560} size={62} color={ink}>
      occupied
    </Note>
    <Note x={1440} y={680} size={40} color={grey}>
      and that is what is
    </Note>
    <Note x={1440} y={730} size={40} color={grey}>
      protecting it
    </Note>
  </SceneFade>
);

const YouShed: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Paper />
      {/* a hand leaving a print */}
      <path
        d="M 700 880 q -30 -160 10 -300 q 20 -50 44 4 l 14 150 l 10 -230 q 16 -54 40 0 l 8 226 l 22 -206 q 18 -50 40 2 l 6 208 l 30 -150 q 22 -44 40 8 q 10 130 -14 288 Z"
        {...line(STROKE - 1)}
        fill={skinTop}
      />
      {scatter(161, 30, 700, 620, 950, 880).map((p, i) => (
        <Rod key={i} x={p.x} y={p.y} scale={0.22} rotate={p.a} fill={i % 3 ? "#8fbf7a" : "#e6b84f"} />
      ))}
      {[...Array(4)].map((_, i) => {
        const t = ((frame * 3 + i * 40) % 160) / 160;
        return (
          <circle key={i} cx={1080 + t * 300} cy={700 + Math.sin(t * 7 + i) * 60} r={10} fill="#8fbf7a" opacity={1 - t} />
        );
      })}
      <Note x={1460} y={470} size={52} color={ink}>
        every surface you touch
      </Note>
      <Note x={1460} y={540} size={40} color={grey}>
        you leave a smear of it behind
      </Note>
    </SceneFade>
  );
};

const DustMyth: Scene = () => {
  const cross = usePop(26, 9);
  const { opacity } = usePop(50);
  return (
    <SceneFade>
      <Paper />
      <Note x={W / 2} y={300} size={60} color={grey}>
        &#8220;house dust is mostly your dead skin&#8221;
      </Note>
      <g opacity={cross.opacity}>
        <path d="M 430 230 L 1490 360 M 1490 230 L 430 360" {...line(16, red)} />
      </g>
      <g opacity={opacity}>
        {/* a shoe tracking it in */}
        <path d="M 620 720 q -20 -90 40 -110 q 90 -26 190 30 q 60 34 44 80 q -140 40 -274 0 Z" {...line(STROKE - 1)} fill="#6b6b6b" />
        <Note x={W / 2} y={900} size={58} color={red} outline>
          most of it walks in on your shoes
        </Note>
      </g>
    </SceneFade>
  );
};

// ── fungus ──────────────────────────────────────────────────────────

const FungOpen: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Micro tint="#f7f0f8" />
      {scatter(171, 15, 220, 260, 1700, 880).map((p, i) => (
        <Yeast key={i} x={p.x} y={p.y} scale={p.s * 1.3} rotate={p.a + Math.sin(frame / 22 + i) * 5} />
      ))}
    </SceneFade>
  );
};

const Malassezia: Scene = () => {
  const { opacity } = usePop(28);
  return (
    <SceneFade>
      <Paper />
      {/* a simple share bar */}
      <rect x={230} y={430} width={1120} height={150} {...line(STROKE - 1)} fill="#d9b7e0" />
      <rect x={1350} y={430} width={340} height={150} {...line(STROKE - 1)} fill="#eeeeee" />
      <Note x={790} y={525} size={62} color="#5c2f66">
        Malassezia
      </Note>
      <Note x={1520} y={525} size={40} color={grey}>
        everything else
      </Note>
      <g opacity={opacity}>
        <Note x={W / 2} y={760} size={72} color={red} outline>
          over 80% of the fungus on you
        </Note>
      </g>
    </SceneFade>
  );
};

const FEveryone: Scene = () => (
  <SceneFade>
    <Paper />
    {[...Array(18)].map((_, i) => (
      <Face key={i} x={280 + (i % 6) * 270} y={400 + Math.floor(i / 6) * 300} scale={0.34} />
    ))}
    <Note x={W / 2} y={1030} size={52} color={red} outline>
      about 18 species, and virtually everybody
    </Note>
  </SceneFade>
);

const CantMake: Scene = () => {
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <Micro tint="#f7f0f8" />
      <Yeast x={640} y={540} scale={3.2} />
      <path d="M 470 380 L 830 700 M 830 380 L 470 700" {...line(12, red)} opacity={0.65} />
      <g opacity={opacity}>
        <Note x={1380} y={420} size={50} color={ink}>
          cannot make its own
        </Note>
        <Note x={1380} y={478} size={50} color={ink}>
          fatty acids
        </Note>
        <Note x={1380} y={590} size={44} color={red}>
          so it has to live
        </Note>
        <Note x={1380} y={644} size={44} color={red}>
          where the oil is
        </Note>
        <Note x={1380} y={780} size={38} color={grey}>
          face, scalp, chest &#8212;
        </Note>
        <Note x={1380} y={828} size={38} color={grey}>
          and almost nowhere dry
        </Note>
      </g>
    </SceneFade>
  );
};

const Dandruff: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(34);
  return (
    <SceneFade>
      <Paper />
      <Face x={700} y={520} scale={1.15} />
      {scatter(181, 26, 520, 320, 890, 500).map((p, i) => {
        const t = ((frame * 2 + i * 30) % 300) / 300;
        return (
          <rect
            key={i}
            x={p.x}
            y={p.y + t * 460}
            width={16}
            height={12}
            rx={3}
            {...line(2)}
            fill="#ffffff"
            opacity={1 - t * 0.5}
          />
        );
      })}
      <g opacity={opacity}>
        <Note x={1440} y={460} size={62} color={ink}>
          dandruff
        </Note>
        <Note x={1440} y={580} size={44} color={red}>
          anti-dandruff shampoo
        </Note>
        <Note x={1440} y={634} size={44} color={red}>
          is not a soap
        </Note>
        <Note x={1440} y={700} size={44} color={ink}>
          it is an antifungal
        </Note>
      </g>
    </SceneFade>
  );
};

const SebDerm: Scene = () => {
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <Paper />
      <Face x={620} y={540} scale={1.3} />
      {scatter(191, 16, 560, 560, 640, 700).map((p, i) => (
        <rect key={i} x={p.x} y={p.y} width={14} height={10} rx={3} {...line(2)} fill="#ffffff" />
      ))}
      <Arrow from={[1080, 520]} to={[700, 620]} bend={0.14} color={red} />
      <g opacity={opacity}>
        <Note x={1420} y={480} size={50} color={ink}>
          everyone reads this
        </Note>
        <Note x={1420} y={534} size={50} color={ink}>
          as dry skin
        </Note>
        <Note x={1420} y={650} size={58} color={red} outline>
          it is the opposite
        </Note>
        <Note x={1420} y={740} size={40} color={grey}>
          too much oil, and
        </Note>
        <Note x={1420} y={790} size={40} color={grey}>
          something eating it
        </Note>
      </g>
    </SceneFade>
  );
};

const FungQuiet: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Micro tint="#f7f0f8" />
      <path d={blob(960, 620, 300, 23, 0.08)} {...line(STROKE - 1)} fill={sebum} opacity={0.75} />
      {scatter(201, 8, 780, 480, 1140, 760).map((p, i) => (
        <Yeast key={i} x={p.x} y={p.y} scale={p.s * 1.1} rotate={p.a + Math.sin(frame / 30 + i) * 3} />
      ))}
      <Note x={960} y={280} size={54} color={grey}>
        the rest of the time it just sits there
      </Note>
    </SceneFade>
  );
};

// ── viruses ─────────────────────────────────────────────────────────

const VirusOpen: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Micro tint="#eef3fb" />
      {scatter(211, 11, 240, 260, 1680, 820).map((p, i) => (
        <Phage key={i} x={p.x} y={p.y} scale={p.s * 0.9} rotate={p.a * 0.2 + Math.sin(frame / 20 + i) * 6} />
      ))}
    </SceneFade>
  );
};

const PhageIntro: Scene = () => {
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <Micro tint="#eef3fb" />
      <Phage x={640} y={480} scale={1.5} />
      <Rod x={1180} y={720} scale={1.8} rotate={-8} />
      <Arrow from={[790, 620]} to={[1030, 690]} bend={0.16} color={red} width={7} head={24} />
      <g opacity={opacity}>
        <Note x={W / 2} y={980} size={58} color={red} outline>
          they are not hunting you
        </Note>
        <Note x={1420} y={430} size={44} color={grey}>
          they are hunting
        </Note>
        <Note x={1420} y={484} size={44} color={grey}>
          the bacteria
        </Note>
      </g>
    </SceneFade>
  );
};

/** Bare capsid, no tail — the viruses that do live on you directly. */
const Capsid: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M 0 -46 L 40 -23 L 40 23 L 0 46 L -40 23 L -40 -23 Z" {...line(4)} fill="#c9b7e8" />
    <path d="M -40 -23 L 0 0 L 40 -23 M 0 0 L 0 46" {...line(3, "#8a76b8")} />
  </g>
);

const Hpv: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <Paper />
      <Face x={680} y={540} scale={1.15} />
      {scatter(261, 14, 500, 330, 870, 760).map((p, i) => (
        <Capsid key={i} x={p.x} y={p.y + Math.sin(frame / 18 + i) * 6} scale={0.42 * p.s + 0.12} />
      ))}
      <g opacity={opacity}>
        <Note x={1430} y={430} size={52} color={ink}>
          a few do live on you
        </Note>
        <Note x={1430} y={540} size={44} color={grey}>
          most people carry several types
        </Note>
        <Note x={1430} y={592} size={44} color={grey}>
          of HPV on normal skin
        </Note>
        <Note x={1430} y={710} size={56} color={red} outline>
          permanently, and quietly
        </Note>
      </g>
    </SceneFade>
  );
};

const PhageBody: Scene = () => {
  const { opacity } = usePop(28);
  return (
    <SceneFade>
      <Micro tint="#eef3fb" />
      <Phage x={760} y={470} scale={3.1} />
      <g opacity={opacity}>
        <Note x={1370} y={330} size={40} color={grey} anchor="start">
          a head full of DNA
        </Note>
        <Arrow from={[1350, 340]} to={[1000, 330]} bend={0.12} color={grey} head={16} />
        <Note x={1370} y={560} size={40} color={grey} anchor="start">
          a shaft
        </Note>
        <Arrow from={[1350, 570]} to={[830, 620]} bend={0.1} color={grey} head={16} />
        <Note x={1370} y={790} size={40} color={grey} anchor="start">
          and legs, to land with
        </Note>
        <Arrow from={[1350, 800]} to={[900, 840]} bend={0.1} color={grey} head={16} />
        <Note x={520} y={960} size={56} color={red} outline>
          it does not look evolved
        </Note>
      </g>
    </SceneFade>
  );
};

const PhageAttack: Scene = () => {
  const frame = useCurrentFrame();
  const land = interpolate(frame, [0, 60], [280, 560], { extrapolateRight: "clamp" });
  const burst = frame > 150;
  const t = Math.max(0, Math.min(1, (frame - 150) / 40));
  return (
    <SceneFade>
      <Micro tint="#eef3fb" />
      <g opacity={burst ? 1 - t : 1}>
        <Rod x={760} y={700} scale={3.4} rotate={-6} />
      </g>
      {!burst ? <Phage x={760} y={land} scale={1.3} /> : null}
      {burst
        ? scatter(221, 12, 560, 500, 960, 900).map((p, i) => (
            <Phage
              key={i}
              x={760 + (p.x - 760) * (1 + t * 2)}
              y={700 + (p.y - 700) * (1 + t * 2)}
              scale={0.55}
              rotate={p.a}
            />
          ))
        : null}
      <Note x={1440} y={430} size={44} color={grey}>
        lands, punches through,
      </Note>
      <Note x={1440} y={484} size={44} color={grey}>
        injects its genome
      </Note>
      <Note x={1440} y={620} size={56} color={red} outline>
        twenty minutes later
      </Note>
      <Note x={1440} y={700} size={44} color={ink}>
        the cell bursts
      </Note>
    </SceneFade>
  );
};

const PhageCount: Scene = () => {
  const { opacity } = usePop(24);
  return (
    <SceneFade>
      <Paper />
      <Note x={W / 2} y={380} size={92} color={ink}>
        the most numerous
      </Note>
      <Note x={W / 2} y={490} size={92} color={ink}>
        thing alive
      </Note>
      <g opacity={opacity}>
        <Note x={W / 2} y={620} size={52} color={grey}>
          anywhere on Earth
        </Note>
        <Note x={W / 2} y={780} size={62} color={red} outline>
          and plenty of them are on you
        </Note>
      </g>
    </SceneFade>
  );
};

const PhageBalance: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Micro tint="#eef3fb" />
      {scatter(231, 9, 260, 300, 900, 860).map((p, i) => (
        <Rod key={i} x={p.x} y={p.y} scale={p.s} rotate={p.a} />
      ))}
      {scatter(241, 7, 1050, 300, 1680, 860).map((p, i) => (
        <Phage key={i} x={p.x} y={p.y} scale={p.s * 0.8} rotate={Math.sin(frame / 18 + i) * 8} />
      ))}
      <path d="M 970 240 l 0 640" {...line(6)} strokeDasharray="18 16" />
      <Note x={W / 2} y={180} size={50} color={ink}>
        it never stops
      </Note>
    </SceneFade>
  );
};

// ── washing ─────────────────────────────────────────────────────────

const WashOpen: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Paper />
      <Face x={860} y={560} scale={1.2} />
      {scatter(251, 22, 640, 320, 1080, 760).map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y + Math.sin(frame / 14 + i) * 8}
          r={22 * p.s}
          {...line(3, "#8ec6f0")}
          fill="#e8f4ff"
          opacity={0.8}
        />
      ))}
    </SceneFade>
  );
};

const WashFail: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#fdf1e6" />
      <SkinSection y={340} follicleX={860}>
        <Mite x={846} y={470} scale={0.72} rotate={94} wiggle={Math.sin(frame / 12) * 3} />
        <Mite x={874} y={590} scale={0.72} rotate={92} wiggle={Math.sin(frame / 12 + 1) * 3} />
      </SkinSection>
      {[...Array(9)].map((_, i) => {
        const t = ((frame * 5 + i * 24) % 200) / 200;
        return (
          <circle key={i} cx={200 + i * 190} cy={200 + t * 130} r={20} {...line(3, "#8ec6f0")} fill="#e8f4ff" />
        );
      })}
      <Note x={1440} y={470} size={54} color={red} outline>
        the soap never
      </Note>
      <Note x={1440} y={534} size={54} color={red} outline>
        gets down here
      </Note>
      <Arrow from={[1310, 560]} to={[960, 620]} bend={0.12} color={red} />
    </SceneFade>
  );
};

const Hours: Scene = () => {
  const frame = useCurrentFrame();
  const back = Math.min(1, frame / 90);
  return (
    <SceneFade>
      <Paper />
      <Note x={W / 2} y={250} size={50} color={grey}>
        population, after washing
      </Note>
      <path d="M 320 820 l 1280 0 M 320 820 l 0 -440" {...line(6)} />
      <path
        d={smooth([
          [320, 760],
          [520, 420],
          [760, 470],
          [1040, 430],
          [1360, 420],
          [1600, 425],
        ])}
        {...line(9, "#8fbf7a")}
        strokeDasharray={2000}
        strokeDashoffset={2000 * (1 - back)}
      />
      <circle cx={320} cy={760} r={13} fill={red} />
      <Note x={320} y={880} size={36} color={grey}>
        washed
      </Note>
      <Note x={1000} y={880} size={36} color={grey}>
        a few hours later
      </Note>
      <Note x={1600} y={880} size={36} color={grey}>
        back
      </Note>
      <Note x={1180} y={330} size={52} color={red} outline>
        rebuilt from the follicles
      </Note>
    </SceneFade>
  );
};

const WashHarm: Scene = () => {
  const { opacity } = usePop(34);
  return (
    <SceneFade>
      <Paper />
      <PhStrip x={130} y={300} mark={5} />
      <Arrow from={[720, 250]} to={[1180, 250]} bend={0} color={red} width={8} head={26} />
      <Note x={950} y={210} size={40} color={red}>
        scrub
      </Note>
      <g opacity={opacity}>
        <Note x={W / 2} y={700} size={58} color={ink}>
          strip the oil, break the acid layer,
        </Note>
        <Note x={W / 2} y={770} size={58} color={ink}>
          and the barrier goes with it
        </Note>
        <Note x={W / 2} y={900} size={54} color={red} outline>
          the things that actually make you ill
        </Note>
        <Note x={W / 2} y={965} size={54} color={red} outline>
          get their opening
        </Note>
      </g>
    </SceneFade>
  );
};

const Antibac: Scene = () => {
  const cross = usePop(40, 9);
  return (
    <SceneFade>
      <Paper />
      {/* a pump bottle */}
      <g transform="translate(620 620) scale(1.35)">
        <rect x={-100} y={-120} width={200} height={280} rx={22} {...line(STROKE - 1)} fill="#dff0fb" />
        <rect x={-70} y={-60} width={140} height={110} rx={8} {...line(3)} fill="#ffffff" />
        <rect x={-26} y={-180} width={52} height={62} rx={8} {...line(STROKE - 1)} fill="#c9d9ee" />
        <path d="M -26 -170 l -54 0 l 0 26" {...line(STROKE - 1)} />
        <Note x={0} y={10} size={30} color={grey}>
          ANTIBACTERIAL
        </Note>
      </g>
      <g opacity={cross.opacity}>
        <path d="M 470 400 L 790 860 M 790 400 L 470 860" {...line(16, red)} />
      </g>
      <Note x={1400} y={420} size={78} color={ink}>
        2016
      </Note>
      <Note x={1400} y={510} size={42} color={grey}>
        regulators ruled it had never
      </Note>
      <Note x={1400} y={562} size={42} color={grey}>
        been shown to beat plain soap
      </Note>
      <Note x={1400} y={680} size={54} color={red} outline>
        19 ingredients banned
      </Note>
    </SceneFade>
  );
};

const WashVerdict: Scene = () => (
  <SceneFade>
    <Paper />
    <Face x={760} y={560} scale={1.3} />
    <Stamp x={1400} y={540} label="THE CLEAN FACE" value="IS THE OCCUPIED ONE" delay={14} />
  </SceneFade>
);

// ── the board ───────────────────────────────────────────────────────

const ROWS: [string, string, React.FC<{ x: number; y: number }>][] = [
  ["Bacteria", "~100 billion", ({ x, y }) => <Rod x={x} y={y} scale={0.45} rotate={-12} />],
  ["Fungal cells", "millions", ({ x, y }) => <Yeast x={x} y={y} scale={0.6} />],
  ["Viruses", "more than that", ({ x, y }) => <Phage x={x} y={y - 8} scale={0.34} />],
  ["Mites", "hundreds", ({ x, y }) => <Mite x={x} y={y} scale={0.32} />],
];

const Board: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <Paper />
      <Note x={W / 2} y={250} size={54} color={grey}>
        on the face you are reading this with
      </Note>
      {ROWS.map(([name, count, Icon], i) => {
        const at = 12 + i * 22;
        if (frame < at) return null;
        const y = 420 + i * 130;
        return (
          <g key={name} opacity={Math.min(1, (frame - at) / 7)}>
            <Icon x={470} y={y} />
            <Note x={600} y={y + 18} size={52} color={ink} anchor="start">
              {name}
            </Note>
            <path d={`M 1010 ${y + 8} l 260 0`} {...line(3, "#d6cbb2")} strokeDasharray="6 10" />
            <Note x={1310} y={y + 18} size={52} color={red} anchor="start">
              {count}
            </Note>
          </g>
        );
      })}
    </SceneFade>
  );
};

const Signoff: Scene = () => {
  const { opacity } = usePop(16);
  return (
    <SceneFade>
      <Paper />
      <Face x={W / 2} y={520} scale={1.35} />
      <g opacity={opacity}>
        <Note x={W / 2} y={930} size={58} color={ink}>
          none of which you can feel
        </Note>
        <Note x={W / 2} y={1000} size={46} color={grey}>
          and all of which were there before you were
        </Note>
      </g>
    </SceneFade>
  );
};

// ── registry ────────────────────────────────────────────────────────

const SCENES: Record<string, Scene> = {
  "face-open": FaceOpen,
  "face-zoom": FaceZoom,
  discovered: Discovered,
  oiliest: Oiliest,
  "two-species": TwoSpecies,
  "mite-size": MiteSize,
  "mite-body": MiteBody,
  mouthparts: Mouthparts,
  follicle: Follicle,
  "hot-spots": HotSpots,
  "packed-in": PackedIn,
  eyelashes: Eyelashes,
  "night-crawl": NightCrawl,
  eggs: Eggs,
  mating: Mating,
  "anus-myth": AnusMyth,
  "losing-genes": LosingGenes,
  rosacea: Rosacea,
  "becoming-us": BecomingUs,
  inherited: Inherited,
  "how-many": HowMany,
  "bact-open": BactOpen,
  "skin-organ": SkinOrgan,
  "per-cm": PerCm,
  hostile: Hostile,
  acnes: Acnes,
  species: Species,
  "eats-oil": EatsOil,
  "acid-mantle": AcidMantle,
  "staph-war": StaphWar,
  fingerprint: Fingerprint,
  "held-line": HeldLine,
  "you-shed": YouShed,
  "dust-myth": DustMyth,
  "fung-open": FungOpen,
  malassezia: Malassezia,
  "f-everyone": FEveryone,
  "cant-make": CantMake,
  dandruff: Dandruff,
  "seb-derm": SebDerm,
  "fung-quiet": FungQuiet,
  "virus-open": VirusOpen,
  "phage-intro": PhageIntro,
  hpv: Hpv,
  "phage-body": PhageBody,
  "phage-attack": PhageAttack,
  "phage-count": PhageCount,
  "phage-balance": PhageBalance,
  "wash-open": WashOpen,
  "wash-fail": WashFail,
  hours: Hours,
  "wash-harm": WashHarm,
  antibac: Antibac,
  "wash-verdict": WashVerdict,
  board: Board,
  signoff: Signoff,
};

/** Scenes on a dark ground, which need the boxed chapter title. */
export const DARK_SCENES = new Set(["night-crawl"]);

export const renderScene = (scene: string) => {
  const C = SCENES[scene];
  return C ? <C /> : null;
};

export const SCENE_NAMES = Object.keys(SCENES);
