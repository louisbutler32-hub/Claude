import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { HandDrawn } from "../../minecraft/handdrawn";
import { INK } from "../common";
import { Characters, POSES, pose, Pose, runCycle, Scene, SeaKing, SpeechBubble, walkCycle, Fit, Light } from "../kit2";
import { bodyToWorld, Build, Duelist, Guard, GUARD_BUILD, MIRA_BUILD, Mira, Ronan, RONAN_BUILD } from "../kit3";
import B from "./beats.json";
import { Bolt, Cam, CamSpec, clamp, Drawn, Droplets, DustPuff, H, kick, lerp, LightningFlash, Lighthouse, Quay, Rain, Rock, ShipDeck, SlashArc, SweatDrop, sstep, toScreen, W } from "./parts";
import { FOLDED_L, HANDS_HEAD, SHEATHE, YAWN } from "./poses";
import type { P } from "../kit2";

export const S = B.shots as unknown as Record<string, [number, number]>;

/** keeps z on an element so <Characters> can sort it */
export const Z: React.FC<{ z?: number; children?: React.ReactNode }> = ({ children }) => <>{children}</>;

/** where the mouth of a figure is, in frame coordinates */
export const mouthAt = (p: Pose, b: Build, at: { x: number; y: number; s: number; flipX?: boolean }, hs: number, dy = 48): P => {
  const w = bodyToWorld(p.head, at, b);
  return [w[0], w[1] + dy * hs * at.s * b.s];
};

type StageProps = { plate: string; fit?: Fit; light?: Light; dof?: number; vignette?: number; cam?: CamSpec; hold?: number; children: (f: number) => React.ReactNode[]; over?: React.ReactNode; bubbles?: React.ReactNode; under?: React.ReactNode };
/** one shot: plate + hand-drawn characters under a camera, crisp overlays and bubbles on top */
export const Stage: React.FC<StageProps> = ({ plate, fit, light = "warm", dof = 0.6, vignette = 0.5, cam, children, over, bubbles, under, hold = 2 }) => (
  <>
    <Cam {...cam}>
      <Scene plate={plate} fit={fit} light={light} dof={dof} vignette={vignette}>
        {under}
        <HandDrawn hold={hold} grain={0.4} boil={0.7}><Drawn>{children}</Drawn></HandDrawn>
        {over}
      </Scene>
    </Cam>
    {bubbles && <Characters>{bubbles}</Characters>}
  </>
);

/* ------------------------------------------------------------------------------ */
/* 1 - the storm: the Sea King, the ship, Ronan unimpressed                        */

const lightning = (f: number) => (f === 4 || f === 5 || f === 29 || f === 30 ? 1 : f === 16 ? 0.6 : 0);
const KING = { x: 880, y: 1440, s: 1.05 };
const RX = 310, RY = 1620, RS = 0.8;
const stormFit: Fit = { zoom: 1.02, x: 0 };

const SeaFloor: React.FC = () => <rect x={-100} y={1400} width={W + 200} height={H} fill="#0f2a33" opacity={0.0} />;

const Sea: (f: number, king: React.ReactNode, ronan: React.ReactNode) => React.ReactNode[] = (f, king, ronan) => [
  <Z key="k" z={1}>{king}</Z>,
  <Z key="d" z={2}><ShipDeck f={f} /></Z>,
  <Z key="r" z={4}>{ronan}</Z>,
];

export const Shot1a: React.FC = () => {
  const f = useCurrentFrame();
  const rise = sstep(f, 0, 10);
  return (
    <Stage plate="stormsea" fit={stormFit} light="cool" dof={0.35} cam={{ z: lerp(1.0, 1.05, f / 18), at: [540, 1050], shake: kick(f, 4, 6, 6), f }}
      over={<><Bolt x={300} k={lightning(f) > 0.9 ? 1 : 0} /><LightningFlash k={lightning(f)} /><Rain f={f} /></>}>
      {(g) => Sea(g,
        <SeaKing x={KING.x} y={KING.y} s={KING.s} rise={lerp(0.55, 1, rise)} jaw={lerp(8, 46, rise)} wob={g * 0.35} />,
        <Ronan pose={POSES.armsFolded} face="calm" x={RX} y={RY + Math.sin(g * 0.3) * 2} s={RS} t={g / 24} wind={1.3} />)}
    </Stage>
  );
};

export const Shot1b: React.FC = () => {
  const f = useCurrentFrame();
  const t = f - S.sea2[0];
  const cam: CamSpec = { z: lerp(1.45, 1.6, t / 18), at: [470, 1080], rot: lerp(4, 2.5, t / 18), shake: kick(f, 29, 6, 7), f };
  const mouth = toScreen(mouthAt(POSES.armsFolded, RONAN_BUILD, { x: RX, y: RY, s: RS }, 1.22), cam);
  return (
    <Stage plate="stormsea" fit={stormFit} light="cool" dof={0.35} cam={cam}
      over={<><Bolt x={300} k={lightning(f) > 0.9 ? 1 : 0} /><LightningFlash k={lightning(f)} /><Rain f={f} /></>}
      bubbles={[<SpeechBubble key="b" x={790} y={640} tail={[mouth[0] + 10, mouth[1] - 20]} text="…Again?" at={B.bubbles[0]} variant="speech" />]}>
      {(g) => Sea(g,
        <SeaKing x={KING.x} y={KING.y} s={KING.s} rise={1} jaw={lerp(56, 62, Math.sin(g * 0.5) * 0.5 + 0.5)} wob={g * 0.35} />,
        <Ronan pose={pose({ ...POSES.armsFolded, head: [0, -894 + Math.sin(g * 0.4) * 3] })} face={g > 22 ? "narrow" : "calm"} x={RX} y={RY} s={RS} t={g / 24} wind={1.3} />)}
    </Stage>
  );
};

/* 2 - one slash */

const A_CUT: P = [-100, 1170], B_CUT: P = [1180, 640];
const above = `M${A_CUT[0]},${A_CUT[1]}L${B_CUT[0]},${B_CUT[1]}L${B_CUT[0]},-600L${A_CUT[0]},-600Z`;
const below = `M${A_CUT[0]},${A_CUT[1]}L${B_CUT[0]},${B_CUT[1]}L${B_CUT[0]},2400L${A_CUT[0]},2400Z`;

export const Shot2draw: React.FC = () => {
  const f = useCurrentFrame();
  const t = f - S.draw[0];
  const lunge = sstep(t, 2, 5);
  const p = pose({ ...POSES.lunge, head: [lerp(0, 150, lunge), -820 - 20 * lunge] });
  return (
    <Stage plate="stormsea" fit={stormFit} light="cool" dof={0.3} cam={{ z: lerp(1.2, 1.5, lunge), at: [560, 1250], rot: lerp(-2, -7, lunge), shake: t > 3 ? 8 : 0, f }}
      over={<Rain f={f} />}>
      {(g) => [
        <Z key="k" z={1}><SeaKing x={KING.x} y={KING.y} s={KING.s} rise={1} jaw={70} wob={g * 0.3} /></Z>,
        <Z key="d" z={2}><ShipDeck f={g} /></Z>,
        <Z key="r" z={4}><Ronan pose={p} face="narrow" x={RX + 120 * lunge} y={RY} s={RS} sword="hand" swordRot={lerp(-70, 4, lunge)} t={g / 24} wind={2} /></Z>,
        <Z key="s" z={6}><SlashArc a={[120, 1420]} b={[1000, 640]} bend={-90} k={sstep(t, 4, 6)} w={46} /></Z>,
      ]}
    </Stage>
  );
};

export const Shot2split: React.FC = () => {
  const f = useCurrentFrame();
  const t = f - S.split[0];
  const k = sstep(t, 0, 11);
  const pivot: P = [930, 850];
  const sheathe = sstep(t, 5, 10);
  const swordRot = lerp(4, -75, sstep(t, 3, 8));
  const swordMode: "hand" | "back" = t < 9 ? "hand" : "back";
  const p = t < 5 ? pose({ ...POSES.lunge, head: [150, -840] }) : SHEATHE;
  const ronan = <Ronan pose={p} face="calm" x={t < 5 ? RX + 120 : RX + 160} y={RY} s={RS} sword={swordMode} swordRot={swordRot} t={f / 24} wind={1.4} />;
  const king = (jaw: number) => <SeaKing x={KING.x} y={KING.y} s={KING.s} rise={1} jaw={jaw} wob={0} />;
  return (
    <Stage plate="stormsea" fit={stormFit} light="cool" dof={0.3} cam={{ z: lerp(1.25, 1.1, k), at: [560, 1180], rot: lerp(-5, -1, k), shake: kick(f, S.split[0], 6, 9), f }}
      over={<><Rain f={f} /><LightningFlash k={t < 2 ? 0.8 : 0} /></>}>
      {(g) => {
        const tt = g - S.split[0];
        return [
          <Z key="lo" z={1}><defs><clipPath id="cutLow"><path d={below} /></clipPath><clipPath id="cutUp"><path d={above} /></clipPath></defs><g clipPath="url(#cutLow)">{king(30)}</g></Z>,
          <Z key="up" z={1}><g clipPath="url(#cutUp)"><g transform={`translate(${-190 * k},${50 * k + 520 * k * k}) rotate(${-32 * k} ${pivot[0]} ${pivot[1]})`}>{king(70)}</g></g></Z>,
          <Z key="d" z={2}><ShipDeck f={g} /></Z>,
          <Z key="cut" z={3}><path d={`M${A_CUT.join(",")}L${B_CUT.join(",")}`} stroke="#fff" strokeWidth={lerp(26, 0, sstep(tt, 0, 6))} strokeLinecap="round" /></Z>,
          <Z key="r" z={4}>{ronan}</Z>,
          <Z key="spray" z={6}><Droplets x={930} y={880} t={clamp(tt / 14)} n={18} r={520} seed={4} /></Z>,
          <Z key="spray2" z={6}><Droplets x={600} y={1480} t={clamp((tt - 5) / 12)} n={12} r={420} seed={9} /></Z>,
        ];
      }}
    </Stage>
  );
};

/* 3 - the Harbour Guards charge, Ronan strolls through, they fall like dominoes */

const GROUND3 = 1640;
const GUARDS: { row: 0 | 1; x0: number; i: number }[] = [
  ...[0, 1, 2, 3, 4].map((i) => ({ row: 0 as const, x0: 700 + i * 125, i })),
  ...[0, 1, 2, 3].map((i) => ({ row: 1 as const, x0: 760 + i * 125, i: i + 5 })),
];
const rx3 = (g: number) => 140 + (g - S.walk[0]) * 14;
const GS = 24;
const guardX = (gd: { x0: number }, g: number) => gd.x0 - (g - S.walk[0]) * GS;
const fallFrame = (gd: { x0: number }) => {
  // the frame its x crosses Ronan's reach
  for (let g = S.walk[0]; g < 120; g += 0.25) if (guardX(gd, g) < rx3(g) + 190) return g + 3;
  return 999;
};

const World3 = (g: number): React.ReactNode[] => {
  const rt = (g - S.walk[0]) / 20;
  const yawn = g >= B.yawn;
  const p = yawn ? YAWN : walkCycle(rt);
  const out: React.ReactNode[] = [<Z key="q" z={0}><Quay y={GROUND3 - 40} /></Z>];
  GUARDS.forEach((gd) => {
    const ff = fallFrame(gd);
    const fk = clamp((g - ff) / 4);
    const falling = fk > 0;
    const y = GROUND3 + (gd.row ? -40 : 10), s = gd.row ? 0.6 : 0.7;
    const x = guardX(gd, Math.min(g, ff)) + (falling ? 60 * sstep(g, ff, ff + 4) : 0);
    const run = runCycle(g / 9 + gd.i * 0.27);
    const lift = falling ? -70 * Math.sin(Math.PI * fk) : 0;
    out.push(
      <Z key={`g${gd.i}`} z={gd.row ? 1 : 3}>
        <g transform={`rotate(${falling ? 94 * sstep(fk, 0, 1) : 0} ${x} ${y})`}>
          <Guard pose={run} face={falling ? (fk >= 1 ? "dizzy" : "shock") : "yell"} x={x} y={y + lift} s={s} flipX shadow={!falling} />
        </g>
      </Z>,
    );
  });
  out.push(<Z key="r" z={6}><Ronan pose={p} face={yawn ? "yawn" : "calm"} x={rx3(g)} y={GROUND3 + 50} s={0.8} t={g / 24} wind={0.8} bellAmp={yawn ? 3 : 14} /></Z>);
  return out;
};

export const Shot3a: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage plate="harbour" fit={{ zoom: 1.1, x: -120 }} light="cool" dof={0.5} cam={{ z: 1.0, at: [540, 1150], shake: 0, f }}>
      {World3}
    </Stage>
  );
};
export const Shot3b: React.FC = () => {
  const f = useCurrentFrame();
  const t = f - S.fall[0];
  const kk = Math.max(kick(f, 78, 4, 8), kick(f, 81, 4, 6));
  return (
    <Stage plate="harbour" fit={{ zoom: 1.1, x: -120 }} light="cool" dof={0.5} cam={{ z: lerp(1.35, 1.5, t / 12), at: [lerp(520, 640, t / 12), 1330], rot: lerp(2, -1, t / 12), shake: kk, f }}>
      {World3}
    </Stage>
  );
};

/* 4 - the duelist on a rock; Ronan's smirk, one eye closed */

const ROCK = { x: 800, y: 1560 };
const Shot4World = (g: number, bold: boolean): React.ReactNode[] => {
  const tt = g / 24;
  const rp = pose({ ...POSES.stand, turn: -0.6, head: [-10, -896], neck: [-6, -812], shR: [100, -784], elR: [-60, -700], haR: [-190, -690], hR: "hold", elL: [-130, -610], haL: [-120, -470], hL: "fist" });
  return [
    <Z key="q" z={0}><Quay y={1650} /></Z>,
    <Z key="rock" z={1}><Rock x={ROCK.x} y={ROCK.y} w={700} h={620} /></Z>,
    <Z key="d" z={2}><Duelist pose={rp} face={g >= B.shots.duel[0] + 4 ? "glare" : "cold"} rapierRot={158} x={ROCK.x - 40} y={ROCK.y - 560} s={0.72} t={tt} /></Z>,
    <Z key="r" z={4}><Ronan pose={POSES.stand} face="smirk" x={250} y={1700} s={0.8} t={tt} wind={1.8} bellAmp={4} /></Z>,
    bold ? null : null,
  ];
};
export const Shot4a: React.FC = () => {
  const f = useCurrentFrame();
  const t = f - S.duel[0];
  return (
    <Stage plate="nightsea" fit={{ zoom: 1.05, x: -60 }} light="night" dof={0.5} cam={{ z: lerp(1.0, 1.12, t / 12), at: [lerp(560, 640, t / 12), lerp(1250, 1180, t / 12)], f }}>
      {(g) => Shot4World(g, false)}
    </Stage>
  );
};

/** the close-up: Ronan fills the frame, one eye closed, a glint */
export const Shot4b: React.FC = () => {
  const f = useCurrentFrame();
  const t = f - S.face[0];
  const sc = 2.6;
  const p = pose({ ...POSES.stand, turn: 0.25, tilt: -5, head: [0, -896], neck: [0, -812] });
  const at = { x: 540, y: 980 + 896 * 1.06 * sc * 1.04 + 70, s: sc };
  return (
    <Stage plate="nightsea" fit={{ zoom: 1.4, x: 0 }} light="night" dof={1} cam={{ z: lerp(1.0, 1.08, t / 12), at: [540, 980], f }}
      over={<AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.5) 100%)" }} />}>
      {(g) => [
        <Z key="r" z={4}><Ronan pose={p} face="wink" x={at.x} y={at.y} s={at.s} lw={1.7} t={g / 24} wind={1.6} shadow={false} /></Z>,
        <Z key="glint" z={8}>{(g - S.face[0]) % 12 > 4 && <g transform="translate(578,972)"><path d="M0,-30 L6,-6 L30,0 L6,6 L0,30 L-6,6 L-30,0 L-6,-6Z" fill="#fff" stroke={INK} strokeWidth={3} /></g>}</Z>,
      ]}
    </Stage>
  );
};

/* 5 - the turn: sunny harbour, tiny Mira with the long receipt; push in on the twitching eye */

const GROUND5 = 1640;
export const Shot5a: React.FC = () => {
  const f = useCurrentFrame();
  const t = f - S.calm[0];
  const unroll = sstep(t, 1, 11);
  const sx = 850, sy = 1360;
  return (
    <Stage plate="harbour2" fit={{ zoom: 1.3, x: -150 }} light="noon" dof={0.5} cam={{ z: 1.0, at: [540, 960], f }}
      bubbles={[]}>
      {(g) => {
        const tt = g / 24;
        // the receipt unrolls from Mira's hands, over the ground toward Ronan
        const len = 60 + unroll * 640;
        const path: P[] = [[sx - 30, sy - 40], [sx - 50, sy + 20], [sx - 130, sy + 70], [sx - 260, sy + 90], [sx - 420, sy + 120], [sx - 600, sy + 150]];
        const n = Math.min(path.length, 2 + Math.floor((len / 700) * (path.length - 2)));
        const pts = path.slice(0, n);
        return [
          <Z key="q" z={0}><Quay y={GROUND5 - 40} /></Z>,
          <Z key="recd" z={2}>
            <path d={`M${pts.map((p) => p.join(",")).join("L")}`} stroke={INK} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d={`M${pts.map((p) => p.join(",")).join("L")}`} stroke="#fffdf0" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Z>,
          <Z key="m" z={2}><Mira pose={pose({ ...POSES.stand, turn: -0.4, elL: [-100, -640], haL: [-40, -600], hL: "hold", elR: [120, -640], haR: [30, -600], hR: "hold" })} face="cold" x={sx} y={sy + 20} s={0.3} lw={4} rattle={Math.sin(tt * 12) * 0.5 + 0.5} /></Z>,
          <Z key="r" z={4}><Ronan pose={HANDS_HEAD} face="proud" x={330} y={GROUND5 + 40} s={0.8} t={tt} wind={0.4} bellAmp={3} /></Z>,
        ];
      }}
    </Stage>
  );
};

/** push in on his twitching eye */
export const Shot5b: React.FC = () => {
  const f = useCurrentFrame();
  const t = f - S.push[0];
  const sc = 3.4;
  const tw = t > 2 && Math.floor(t / 2) % 2 === 0;
  const p = pose({ ...POSES.stand, head: [0, -896], neck: [0, -812], tilt: tw ? -1.5 : 0 });
  const at = { x: 540, y: 880 + 896 * 1.06 * sc * 1.04 + 40, s: sc };
  const dropT = clamp((t - 4) / 8);
  const cam: CamSpec = { z: lerp(1.0, 1.55, sstep(t, 0, 12)), at: [lerp(540, 600, sstep(t, 0, 12)), lerp(900, 840, sstep(t, 0, 12))], shake: tw ? 2.5 : 0, f };
  return (
    <Stage plate="harbour2" fit={{ zoom: 1.3, x: -150 }} light="noon" dof={1} cam={cam}
      over={<AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, rgba(255,255,255,0) 35%, rgba(0,0,0,0.55) 100%)" }} />}
      bubbles={[<SpeechBubble key="no" x={800} y={520} tail={[690, 760]} text="No." at={B.bubbles[1]} variant="speech" size={110} />]}>
      {(g) => [
        <Z key="r" z={4}><Ronan pose={p} face={tw ? "twitch" : "calm"} x={at.x} y={at.y} s={at.s} lw={1.5} t={g / 24} wind={0.3} shadow={false} bellAmp={0} /></Z>,
        <Z key="sw" z={8}>{dropT > 0 && <SweatDrop x={700} y={620 + dropT * 220} s={2.4} />}</Z>,
        <Z key="tw" z={8}>{tw && <path d="M330,740 l-60,-30 M340,800 l-80,0 M335,860 l-60,30" stroke={INK} strokeWidth={9} strokeLinecap="round" />}</Z>,
      ]}
    </Stage>
  );
};

export const _s1 = { DustPuff, Lighthouse, H, FOLDED_L, MIRA_BUILD, Mira, GUARD_BUILD, SeaFloor };
