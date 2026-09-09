import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Astronaut, Probe } from "./character";
import {
  H,
  Note,
  PlanetPhoto,
  SceneFade,
  Sky,
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
  usePop,
} from "./kit";

// Jupiter, Saturn, Uranus, Neptune and the closing board — the second half
// of the video. Same drawing kit as the inner planets; what changes is that
// none of these has a surface, so the scenes are falls and cross-sections
// rather than someone standing on the ground.

type Scene = React.FC;

// ── shared pieces for gas giants ────────────────────────────────────

/** Layered interior, drawn as nested rings with a label on each. */
const CrossSection: React.FC<{
  x: number;
  y: number;
  r: number;
  layers: { r: number; fill: string; label?: string }[];
  hot?: string;
}> = ({ x, y, r, layers, hot }) => (
  <g>
    {layers.map((l, i) => (
      <g key={i}>
        <circle cx={x} cy={y} r={r * l.r} {...line(STROKE - 1)} fill={l.fill} />
        {l.label ? (
          <>
            <path d={`M ${x + r * l.r * 0.72} ${y - r * l.r * 0.66} L ${x + r * 1.16} ${y - r * l.r * 0.96}`} {...line(3, grey)} />
            <Note x={x + r * 1.2} y={y - r * l.r * 0.96} size={30} color={grey} anchor="start">
              {l.label}
            </Note>
          </>
        ) : null}
      </g>
    ))}
    {hot ? (
      <Note x={x} y={y + 12} size={40} color="#ffffff">
        {hot}
      </Note>
    ) : null}
  </g>
);

/** Horizontal streaks — wind, or the sensation of falling fast. */
const Streaks: React.FC<{ frame: number; color?: string; n?: number; speed?: number; vertical?: boolean }> = ({
  frame,
  color = "#ffffff",
  n = 14,
  speed = 34,
  vertical,
}) => (
  <>
    {[...Array(n)].map((_, i) => {
      const span = vertical ? H + 400 : W + 700;
      const t = ((i * 397 + frame * speed) % span) - 200;
      return vertical ? (
        <path key={i} d={`M ${90 + ((i * 233) % (W - 180))} ${t} l 0 130`} {...line(6, color)} opacity={0.55} />
      ) : (
        <path key={i} d={`M ${t} ${120 + ((i * 131) % (H - 240))} l 220 0`} {...line(6, color)} opacity={0.55} />
      );
    })}
  </>
);

const Diamonds: React.FC<{ frame: number; n?: number }> = ({ frame, n = 14 }) => (
  <>
    {[...Array(n)].map((_, i) => {
      const y = ((i * 271 + frame * 7) % (H + 300)) - 150;
      const x = 120 + ((i * 337) % (W - 240));
      const s = 12 + (i % 4) * 7;
      return (
        <path
          key={i}
          d={`M ${x} ${y - s} L ${x + s * 0.8} ${y} L ${x} ${y + s * 1.2} L ${x - s * 0.8} ${y} Z`}
          {...line(3, "#ffffff")}
          fill="#bfe9ff"
        />
      );
    })}
  </>
);

const GasSky: React.FC<{ from: string; to: string }> = ({ from, to }) => (
  <>
    <rect x={0} y={0} width={W} height={H} fill="#fff" />
    <Sky from={from} to={to} y={H} />
  </>
);

// ── Jupiter ─────────────────────────────────────────────────────────

const JupScale: Scene = () => {
  const { opacity } = usePop(28);
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#fff" />
      <PlanetPhoto src="jupiter" x={660} y={580} r={330} />
      <PlanetPhoto src="earth" x={1330} y={700} r={29} />
      <Note x={1330} y={772} size={32} color={grey}>
        Earth
      </Note>
      <g opacity={opacity}>
        <Note x={1450} y={430} size={54} color={ink}>
          1,000+ Earths
        </Note>
        <Note x={1450} y={488} size={54} color={ink}>
          would fit inside
        </Note>
        <Note x={1440} y={880} size={62} color={red} outline>
          no surface anywhere
        </Note>
      </g>
    </SceneFade>
  );
};

const JupRadiation: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(34);
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#0a0b14" />
      <Stars seed={71} h={H} />
      {[1.35, 1.6, 1.85].map((k, i) => (
        <ellipse
          key={i}
          cx={620}
          cy={560}
          rx={230 * k}
          ry={230 * k * 0.42}
          {...line(9, "#7ed07e")}
          opacity={0.35 + 0.2 * Math.sin(frame / 14 + i)}
        />
      ))}
      <PlanetPhoto src="jupiter" x={620} y={560} r={220} />
      <circle cx={1090} cy={470} r={15} {...line(3)} fill="#dfe6f2" />
      <Note x={1090} y={430} size={30} color="#cfd6ee">
        Europa
      </Note>
      <g opacity={opacity}>
        <Note x={1480} y={640} size={62} color={red} outline>
          a lethal dose
        </Note>
        <Note x={1480} y={706} size={62} color={red} outline>
          in about a day
        </Note>
        <Note x={1480} y={780} size={34} color="#cfd6ee">
          670,000 km out, still
        </Note>
      </g>
    </SceneFade>
  );
};

const JupFall: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(26);
  return (
    <SceneFade>
      <GasSky from="#f0e0c8" to="#c08a5a" />
      <Streaks frame={frame} color="#ffffff" n={12} speed={26} vertical />
      <Astronaut
        x={760}
        y={620 + Math.sin(frame / 18) * 14}
        scale={1.3}
        face="shock"
        arms="up"
        suit="#f7ecd8"
        trim="#c9b291"
      />
      <g opacity={opacity}>
        <Note x={1420} y={430} size={56} color={red} outline>
          2.5 &#215; Earth&#8217;s gravity
        </Note>
        <Note x={1420} y={500} size={40} color="#6b4a24">
          you do not land
        </Note>
        <Note x={1420} y={556} size={40} color="#6b4a24">
          you just keep falling
        </Note>
      </g>
    </SceneFade>
  );
};

const JupClouds: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <GasSky from="#fbf3e6" to="#cfa06a" />
      {[0, 1, 2, 3, 4].map((i) => {
        const y = 250 + i * 150;
        const x = ((i * 421 + frame * 6) % (W + 700)) - 350;
        return (
          <g key={i} opacity={0.92}>
            <path d={blob(x, y, 150, i + 11, 0.2)} fill="#f6efe0" />
            <path d={blob(x, y, 150, i + 11, 0.2)} {...line(4, "#c9b291")} />
            <path d={blob(x + 320, y + 60, 110, i + 21, 0.2)} fill="#efe2cc" />
            <path d={blob(x + 320, y + 60, 110, i + 21, 0.2)} {...line(4, "#c9b291")} />
          </g>
        );
      })}
      <Streaks frame={frame} color="#ffffff" n={9} speed={40} />
      <Temp x={470} y={330} c="&#8722;145&#176;C" f="&#8722;229&#176;F" />
      <g opacity={opacity}>
        <Note x={1420} y={830} size={58} color={red} outline>
          400+ km/h
        </Note>
        <Note x={1420} y={890} size={36} color="#6b4a24">
          ammonia ice clouds
        </Note>
      </g>
    </SceneFade>
  );
};

const JupGalileo: Scene = () => {
  const frame = useCurrentFrame();
  const drop = interpolate(frame, [0, 260], [330, 640], { extrapolateRight: "clamp" });
  return (
    <SceneFade>
      <GasSky from="#f6ead6" to="#a9713f" />
      {/* depth scale */}
      <path d="M 1620 240 l 0 640" {...line(6)} />
      <path d="M 1600 240 l 40 0 M 1600 880 l 40 0" {...line(5)} />
      <Note x={1590} y={252} size={34} color={grey} anchor="end">
        cloud tops
      </Note>
      <Note x={1590} y={892} size={34} color={grey} anchor="end">
        156 km down
      </Note>
      <circle cx={1620} cy={240 + (drop - 330) * 2.06} r={15} fill={red} />
      {/* probe under a chute */}
      <g transform={`translate(640 ${drop}) scale(1.7)`}>
        <path d="M -96 -70 q 96 -128 192 0 Z" {...line(STROKE - 1)} fill="#f2efe6" />
        <path d="M -96 -70 l 96 46 l 96 -46" {...line(3)} />
        <path d="M -34 -24 l 34 -24 l 34 24" {...line(4)} />
        <Probe x={0} y={54} scale={0.62} />
      </g>
      <Stamp x={1120} y={960} label="NASA'S GALILEO PROBE, 1995" value="58 MINUTES" delay={40} />
    </SceneFade>
  );
};

const JupFluid: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <GasSky from="#c69a6a" to="#7d4b22" />
      {[...Array(9)].map((_, i) => (
        <path
          key={i}
          d={`M -50 ${180 + i * 100} q 240 ${34 * Math.sin(frame / 22 + i)} 500 0 t 500 0 t 500 0 t 500 0`}
          {...line(6, "#e8cfa8")}
          opacity={0.5}
        />
      ))}
      <Astronaut
        x={760}
        y={640 + Math.sin(frame / 16) * 18}
        scale={1.25}
        face="shock"
        arms="out"
        suit="#f2e3c8"
        trim="#c0a077"
      />
      <g opacity={opacity}>
        <Note x={1400} y={400} size={54} color={red} outline>
          supercritical fluid
        </Note>
        <Note x={1400} y={462} size={38} color="#ffe9c8">
          not quite gas,
        </Note>
        <Note x={1400} y={512} size={38} color="#ffe9c8">
          not quite liquid
        </Note>
        <Note x={760} y={880} size={40} color="#ffe9c8">
          you are swimming now
        </Note>
      </g>
    </SceneFade>
  );
};

const JupMetallic: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(28);
  return (
    <SceneFade>
      <GasSky from="#8a7f8f" to="#3d3646" />
      {[...Array(7)].map((_, i) => (
        <path
          key={i}
          d={`M -50 ${220 + i * 110} q 260 ${26 * Math.cos(frame / 18 + i)} 520 0 t 520 0 t 520 0 t 520 0`}
          {...line(8, "#d9d5e2")}
          opacity={0.6}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M ${420 + i * 470} 260 l 46 130 l -34 0 l 52 150 l -80 -120 l 36 0 Z`}
          {...line(4, "#fff59a")}
          fill="#ffe45c"
          opacity={0.4 + 0.6 * Math.abs(Math.sin(frame / 9 + i * 2))}
        />
      ))}
      <g opacity={opacity}>
        <Note x={W / 2} y={790} size={58} color="#ffffff">
          liquid metallic hydrogen
        </Note>
        <Note x={W / 2} y={856} size={38} color="#d9d5e2">
          it conducts &#8212; this is what makes the magnetic field
        </Note>
      </g>
    </SceneFade>
  );
};

const JupCore: Scene = () => {
  const { opacity } = usePop(34);
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#fff" />
      <CrossSection
        x={760}
        y={580}
        r={330}
        layers={[
          { r: 1.0, fill: "#e8cfa8", label: "clouds" },
          { r: 0.78, fill: "#c08a5a", label: "supercritical hydrogen" },
          { r: 0.52, fill: "#8a7f8f", label: "metallic hydrogen" },
          { r: 0.24, fill: "#e0341f", label: "core" },
        ]}
      />
      <g opacity={opacity}>
        <Note x={1430} y={640} size={66} color="#e8631b" outline>
          24,000&#176;C
        </Note>
        <Note x={1430} y={700} size={36} color={grey}>
          four times hotter than
        </Note>
        <Note x={1430} y={748} size={36} color={grey}>
          the surface of the Sun
        </Note>
        <Note x={1430} y={840} size={48} color={red} outline>
          40 million bar
        </Note>
      </g>
    </SceneFade>
  );
};

// ── Saturn ──────────────────────────────────────────────────────────

/** Saturn is drawn rather than photographed: the rings have to survive. */
const SaturnDoodle: React.FC<{ x: number; y: number; r: number; tilt?: number }> = ({
  x,
  y,
  r,
  tilt = -16,
}) => (
  <g>
    <ellipse cx={x} cy={y} rx={r * 2.05} ry={r * 0.46} transform={`rotate(${tilt} ${x} ${y})`} {...line(10, "#c9ae72")} />
    <ellipse cx={x} cy={y} rx={r * 1.72} ry={r * 0.38} transform={`rotate(${tilt} ${x} ${y})`} {...line(6, "#e0c48a")} />
    <path d={blob(x, y, r, 41, 0.015)} fill="#e8cf95" />
    <g clipPath={`url(#satclip${Math.round(r)})`}>
      <path d={`M ${x - r} ${y - r * 0.42} q ${r} ${r * 0.2} ${2 * r} 0`} {...line(14, "#d9b96f")} />
      <path d={`M ${x - r} ${y + r * 0.18} q ${r} ${r * 0.2} ${2 * r} 0`} {...line(18, "#d3ae5e")} />
    </g>
    <clipPath id={`satclip${Math.round(r)}`}>
      <path d={blob(x, y, r, 41, 0.015)} />
    </clipPath>
    <path d={blob(x, y, r, 41, 0.015)} {...line(STROKE - 1)} />
    <path
      d={`M ${x - r * 2.05 * Math.cos((tilt * Math.PI) / 180)} ${y - r * 2.05 * Math.sin((tilt * Math.PI) / 180)} a ${r * 2.05} ${r * 0.46} ${tilt} 0 0 ${2 * r * 2.05 * Math.cos((tilt * Math.PI) / 180)} ${2 * r * 2.05 * Math.sin((tilt * Math.PI) / 180)}`}
      {...line(10, "#c9ae72")}
    />
  </g>
);

const SatDensity: Scene = () => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / 24) * 10;
  const { opacity } = usePop(40);
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#fff" />
      {/* a tub of water, for the old joke that Saturn would float */}
      <path d="M 300 380 l 40 540 q 620 60 1240 0 l 40 -540" {...line(STROKE)} fill="#dff0fb" />
      <path d="M 316 560 q 620 70 1268 0" {...line(6, "#8ec6f0")} />
      <SaturnDoodle x={960} y={520 + bob} r={185} />
      <g opacity={opacity}>
        <Note x={W / 2} y={1000} size={54} color={ink}>
          less dense than water &#8212; it would float
        </Note>
      </g>
    </SceneFade>
  );
};

const SatMoons: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#0a0b14" />
      <Stars seed={81} h={H} />
      <SaturnDoodle x={820} y={560} r={175} />
      {[...Array(14)].map((_, i) => {
        const a = (i / 14) * Math.PI * 2 + frame / 90;
        const rx = 430 + (i % 3) * 90;
        return (
          <circle
            key={i}
            cx={820 + Math.cos(a) * rx}
            cy={560 + Math.sin(a) * rx * 0.36}
            r={7 + (i % 4) * 4}
            {...line(3)}
            fill="#dfe6f2"
          />
        );
      })}
      <g opacity={opacity}>
        <Note x={1520} y={880} size={78} color={red} outline>
          146 moons
        </Note>
        <Note x={1520} y={936} size={34} color="#cfd6ee">
          all of them in your way
        </Note>
      </g>
    </SceneFade>
  );
};

const SatRings: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(34);
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#0a0b14" />
      <Stars seed={91} h={H} />
      {[...Array(22)].map((_, i) => {
        const x = ((i * 271 + frame * 4) % (W + 400)) - 200;
        const y = 260 + ((i * 173) % 620);
        const s = 14 + (i % 5) * 22;
        return (
          <g key={i}>
            <path d={blob(x, y, s, i + 51, 0.22)} fill="#e8f4ff" />
            <path d={blob(x, y, s, i + 51, 0.22)} {...line(3, "#9fb6cc")} />
          </g>
        );
      })}
      <g opacity={opacity}>
        <Note x={470} y={260} size={44} color="#ffffff">
          grains of sand
        </Note>
        <Note x={1450} y={930} size={44} color="#ffffff">
          up to the size of a house
        </Note>
        <Note x={W / 2} y={600} size={58} color={red} outline>
          almost all water ice
        </Note>
      </g>
    </SceneFade>
  );
};

const SatWinds: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(32);
  return (
    <SceneFade>
      <GasSky from="#f6e7bd" to="#c9a04a" />
      <Streaks frame={frame} color="#ffffff" n={16} speed={56} />
      <Astronaut x={620} y={760} scale={1.1} face="shock" arms="out" suit="#f5e8c4" trim="#c4a45e" />
      <g opacity={opacity}>
        <Note x={1330} y={420} size={74} color={red} outline>
          1,800 km/h
        </Note>
        <Note x={1330} y={492} size={38} color="#6b4a10">
          five times the strongest
        </Note>
        <Note x={1330} y={540} size={38} color="#6b4a10">
          hurricane on Earth
        </Note>
      </g>
    </SceneFade>
  );
};

const SatHexagon: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(36);
  const pts = [...Array(6)].map((_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2 + frame / 260;
    return [760 + Math.cos(a) * 360, 560 + Math.sin(a) * 360] as [number, number];
  });
  // straight sides, or it reads as a lumpy circle rather than a hexagon
  const hex = pts.map(([px, py], i) => `${i ? "L" : "M"} ${px} ${py}`).join(" ") + " Z";
  return (
    <SceneFade>
      <GasSky from="#fbf1d8" to="#e8c877" />
      <path d={hex} {...line(14, "#7a4a08")} fill="#c9922f" />
      {[0, 1].map((i) => (
        <PlanetPhoto key={i} src="earth" x={640 + i * 250} y={560} r={110} />
      ))}
      <g opacity={opacity}>
        <Note x={1490} y={400} size={54} color={red} outline>
          a storm shaped
        </Note>
        <Note x={1490} y={462} size={54} color={red} outline>
          like a hexagon
        </Note>
        <Note x={760} y={1010} size={40} color="#6b4a10">
          two Earths fit inside it
        </Note>
      </g>
    </SceneFade>
  );
};

const SatCold: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <GasSky from="#f2e6c8" to="#b98f3c" />
      {[0, 1, 2].map((i) => {
        const x = ((i * 640 + frame * 5) % (W + 800)) - 400;
        return (
          <g key={i}>
            <path d={blob(x, 300 + i * 120, 190, i + 61, 0.18)} fill="#f8f1de" />
            <path d={blob(x, 300 + i * 120, 190, i + 61, 0.18)} {...line(4, "#c9ae72")} />
          </g>
        );
      })}
      <Thermometer x={1360} y={820} fill={0.12} hot={false} />
      <Temp x={620} y={640} c="&#8722;180&#176;C" f="&#8722;292&#176;F" />
      <Note x={620} y={800} size={38} color="#6b4a10">
        at the cloud tops
      </Note>
    </SceneFade>
  );
};

const SatCassini: Scene = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 200], [420, 1080], { extrapolateRight: "clamp" });
  const y = interpolate(frame, [0, 200], [300, 640], { extrapolateRight: "clamp" });
  return (
    <SceneFade>
      <GasSky from="#f6e7bd" to="#c9922f" />
      <g transform={`translate(${x} ${y}) rotate(28) scale(1.9)`}>
        <path d="M -120 0 q 70 -30 140 0 q -70 30 -140 0 Z" {...line(4, "#e0341f")} fill="#f5a623" opacity={0.85} />
        <rect x={-26} y={-40} width={52} height={80} rx={8} {...line(STROKE - 1)} fill="#efece3" />
        <path d="M -60 -46 q 60 -54 120 0 Z" {...line(STROKE - 1)} fill="#d9d5cb" />
        <path d="M 0 40 l 0 40" {...line(4)} />
      </g>
      <Stamp x={1340} y={300} label="CASSINI WENT IN ON PURPOSE, 2017" value="ABOUT A MINUTE" delay={44} />
      <Note x={470} y={930} size={38} color="#6b4a10" anchor="start">
        the only reading ever taken
      </Note>
      <Note x={470} y={982} size={38} color="#6b4a10" anchor="start">
        from inside Saturn
      </Note>
    </SceneFade>
  );
};

const SatCore: Scene = () => {
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#fff" />
      <CrossSection
        x={720}
        y={580}
        r={320}
        layers={[
          { r: 1.0, fill: "#e8cf95", label: "hydrogen and helium" },
          { r: 0.72, fill: "#c9a04a", label: "liquid hydrogen" },
          { r: 0.44, fill: "#8a7f8f", label: "metallic hydrogen" },
          { r: 0.2, fill: "#e0341f", label: "rocky core" },
        ]}
      />
      <g opacity={opacity}>
        <Note x={1440} y={660} size={66} color="#e8631b" outline>
          11,700&#176;C
        </Note>
        <Note x={1440} y={724} size={36} color={grey}>
          twice as hot as the
        </Note>
        <Note x={1440} y={772} size={36} color={grey}>
          surface of the Sun
        </Note>
      </g>
    </SceneFade>
  );
};

// ── Uranus ──────────────────────────────────────────────────────────

const UraTilt: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(34);
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#0a0b14" />
      <Stars seed={101} h={H} />
      <Sun x={150} y={560} r={110} seed={4} />
      <g transform={`rotate(98 900 560)`}>
        <path d="M 900 250 l 0 620" {...line(5, "#7ed07e")} strokeDasharray="18 14" />
        <path d={`M 620 560 a 280 100 0 0 1 560 0`} {...line(4, "#7ed07e")} strokeDashoffset={-frame} strokeDasharray="14 12" />
      </g>
      <PlanetPhoto src="uranus" x={900} y={560} r={215} />
      <g opacity={opacity}>
        <Note x={1470} y={330} size={62} color={red} outline>
          tipped 98&#176;
        </Note>
        <Note x={1470} y={392} size={38} color="#cfd6ee">
          it rolls instead of spinning
        </Note>
        <Note x={1470} y={840} size={40} color="#ffffff">
          42 years of daylight,
        </Note>
        <Note x={1470} y={890} size={40} color="#ffffff">
          then 42 years of night
        </Note>
      </g>
    </SceneFade>
  );
};

const UraIce: Scene = () => {
  const { opacity } = usePop(28);
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#fff" />
      <CrossSection
        x={700}
        y={580}
        r={310}
        layers={[
          { r: 1.0, fill: "#bfe4e8", label: "hydrogen, helium, methane" },
          { r: 0.74, fill: "#5aa8c4", label: "water, methane, ammonia" },
          { r: 0.3, fill: "#8a6a4a", label: "rocky core" },
        ]}
      />
      <g opacity={opacity}>
        <Note x={1420} y={800} size={52} color={red} outline>
          &#8220;ice giant&#8221; is misleading
        </Note>
        <Note x={1420} y={862} size={38} color={grey}>
          none of it is solid ice &#8212; it is
        </Note>
        <Note x={1420} y={910} size={38} color={grey}>
          hot fluid under crushing pressure
        </Note>
      </g>
    </SceneFade>
  );
};

const UraCold: Scene = () => {
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#0a0b14" />
      <Stars seed={111} h={H} />
      <PlanetPhoto src="uranus" x={640} y={560} r={250} />
      <PlanetPhoto src="neptune" x={1420} y={620} r={95} />
      <Note x={1420} y={760} size={34} color="#cfd6ee">
        Neptune, 1.5 billion km
      </Note>
      <Note x={1420} y={806} size={34} color="#cfd6ee">
        further out, and warmer
      </Note>
      <g opacity={opacity}>
        <Temp x={640} y={950} c="&#8722;224&#176;C" f="&#8722;371&#176;F" />
        <Note x={640} y={300} size={54} color="#9fd0f5">
          the coldest place we know of
        </Note>
      </g>
    </SceneFade>
  );
};

const UraDiamond: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(36);
  return (
    <SceneFade>
      <GasSky from="#3f7f96" to="#0d2a3c" />
      <Streaks frame={frame} color="#9fd0f5" n={10} speed={62} />
      <Diamonds frame={frame} />
      <g opacity={opacity}>
        <Note x={W / 2} y={520} size={80} color="#ffffff">
          it rains diamonds
        </Note>
        <Note x={W / 2} y={600} size={40} color="#bfe9ff">
          pressure squeezes the methane into carbon
        </Note>
        <Note x={430} y={900} size={58} color={red} outline>
          900 km/h
        </Note>
      </g>
    </SceneFade>
  );
};

const UraVerdict: Scene = () => (
  <SceneFade>
    <GasSky from="#2f6a80" to="#08202f" />
    <Astronaut x={560} y={900} scale={1.35} face="dead" helmet={false} arms="out" suit="#cfe4ea" trim="#8fa9b4" />
    <Stamp x={1300} y={520} label="NOTHING HAS EVER FLOWN IN" value="SECONDS" delay={18} />
  </SceneFade>
);

// ── Neptune ─────────────────────────────────────────────────────────

const NepFar: Scene = () => {
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#0a0b14" />
      <Stars seed={121} h={H} />
      <Sun x={130} y={560} r={54} seed={4} rays={12} />
      <PlanetPhoto src="earth" x={330} y={560} r={20} />
      <Note x={330} y={632} size={30} color="#cfd6ee">
        Earth
      </Note>
      <path d="M 380 560 l 1000 0" {...line(4, "#5a6480")} strokeDasharray="16 18" />
      <PlanetPhoto src="neptune" x={1480} y={560} r={175} />
      <g opacity={opacity}>
        <Note x={880} y={512} size={46} color="#cfd6ee">
          30 &#215; further from the Sun
        </Note>
        <Note x={880} y={880} size={44} color="#9fd0f5">
          noon out here looks like dusk
        </Note>
      </g>
    </SceneFade>
  );
};

const NepWinds: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#0a0b14" />
      <Stars seed={131} h={H} />
      <Streaks frame={frame} color="#8ec6f0" n={14} speed={78} />
      <PlanetPhoto src="neptune" x={720} y={560} r={250} />
      <g opacity={opacity}>
        <Note x={1420} y={480} size={76} color={red} outline>
          2,100 km/h
        </Note>
        <Note x={1420} y={550} size={44} color="#ffffff">
          supersonic
        </Note>
        <Note x={1420} y={640} size={36} color="#cfd6ee">
          the fastest winds anywhere
        </Note>
        <Note x={1420} y={688} size={36} color="#cfd6ee">
          in the solar system
        </Note>
      </g>
    </SceneFade>
  );
};

const NepCore: Scene = () => {
  const frame = useCurrentFrame();
  const { opacity } = usePop(30);
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#fff" />
      <CrossSection
        x={700}
        y={580}
        r={310}
        layers={[
          { r: 1.0, fill: "#9fc4ea", label: "hydrogen, helium, methane" },
          { r: 0.74, fill: "#3f63b8", label: "hot fluid ice" },
          { r: 0.3, fill: "#e0341f", label: "core" },
        ]}
      />
      <g clipPath="url(#nepmantle)">
        <Diamonds frame={frame} n={8} />
      </g>
      <clipPath id="nepmantle">
        <circle cx={700} cy={580} r={310 * 0.74} />
      </clipPath>
      <g opacity={opacity}>
        <Note x={1430} y={700} size={64} color="#e8631b" outline>
          5,000&#176;C
        </Note>
        <Note x={1430} y={766} size={38} color={grey}>
          diamond rain in the mantle,
        </Note>
        <Note x={1430} y={814} size={38} color={grey}>
          the same as Uranus
        </Note>
      </g>
    </SceneFade>
  );
};

const NepVerdict: Scene = () => (
  <SceneFade>
    <GasSky from="#3f63b8" to="#0b1636" />
    <Astronaut x={600} y={900} scale={1.35} face="dead" helmet={false} arms="down" suit="#cfd9f2" trim="#8f9ab4" />
    <Stamp x={1300} y={500} label="NO GROUND, NO SUIT THAT LASTS" value="SECONDS" delay={16} />
  </SceneFade>
);

// ── the pay-off board ───────────────────────────────────────────────

const ROWS = [
  { id: "venus", name: "Venus", time: "under 1 second" },
  { id: "uranus", name: "Uranus", time: "seconds" },
  { id: "neptune", name: "Neptune", time: "seconds" },
  { id: "saturn", name: "Saturn", time: "about a minute" },
  { id: "jupiter", name: "Jupiter", time: "58 minutes" },
  { id: "mercury", name: "Mercury", time: "90 seconds" },
  { id: "mars", name: "Mars", time: "2 minutes" },
  { id: "earth", name: "Earth", time: "about 80 years" },
];

const Board: Scene = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#fff" />
      <Note x={W / 2} y={250} size={54} color={grey}>
        how long you would last
      </Note>
      {ROWS.map((r, i) => {
        const shown = frame > 10 + i * 16;
        const last = i === ROWS.length - 1;
        if (!shown) return null;
        const y = 340 + i * 84;
        return (
          <g key={r.id} opacity={Math.min(1, (frame - (10 + i * 16)) / 6)}>
            {r.id === "saturn" ? (
              <SaturnDoodle x={520} y={y} r={26} tilt={-16} />
            ) : (
              <PlanetPhoto src={r.id} x={520} y={y} r={30} />
            )}
            <Note x={580} y={y + 16} size={44} color={ink} anchor="start">
              {r.name}
            </Note>
            <path d={`M 850 ${y + 6} l 380 0`} {...line(3, "#d6cbb2")} strokeDasharray="6 10" />
            <Note x={1270} y={y + 16} size={44} color={last ? "#2f8f2f" : red} anchor="start">
              {r.time}
            </Note>
          </g>
        );
      })}
    </SceneFade>
  );
};

const Signoff: Scene = () => {
  const { opacity } = usePop(14);
  return (
    <SceneFade>
      <rect x={0} y={0} width={W} height={H} fill="#fff" />
      <PlanetPhoto src="earth" x={W / 2} y={520} r={230} />
      <Note x={W / 2} y={860} size={78} color="#2f8f2f">
        about 80 years
      </Note>
      <g opacity={opacity}>
        <Note x={W / 2} y={950} size={44} color={grey}>
          the only sensible answer on the board
        </Note>
      </g>
    </SceneFade>
  );
};

// ── registry ────────────────────────────────────────────────────────

export const OUTER_SCENES: Record<string, Scene> = {
  "jup-scale": JupScale,
  "jup-radiation": JupRadiation,
  "jup-fall": JupFall,
  "jup-clouds": JupClouds,
  "jup-galileo": JupGalileo,
  "jup-fluid": JupFluid,
  "jup-metallic": JupMetallic,
  "jup-core": JupCore,
  "sat-density": SatDensity,
  "sat-moons": SatMoons,
  "sat-rings": SatRings,
  "sat-winds": SatWinds,
  "sat-hexagon": SatHexagon,
  "sat-cold": SatCold,
  "sat-cassini": SatCassini,
  "sat-core": SatCore,
  "ura-tilt": UraTilt,
  "ura-ice": UraIce,
  "ura-cold": UraCold,
  "ura-diamond": UraDiamond,
  "ura-verdict": UraVerdict,
  "nep-far": NepFar,
  "nep-winds": NepWinds,
  "nep-core": NepCore,
  "nep-verdict": NepVerdict,
  board: Board,
  signoff: Signoff,
};

/** Scenes drawn on a dark ground, which need the boxed chapter title. */
export const OUTER_DARK = new Set([
  "jup-radiation",
  "sat-moons",
  "sat-rings",
  "ura-tilt",
  "ura-cold",
  "ura-verdict",
  "nep-far",
  "nep-winds",
  "nep-verdict",
]);
