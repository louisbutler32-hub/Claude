import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { INK } from "../common";
import { HandDrawn } from "../../minecraft/handdrawn";
import { Boss, Characters, POSES, pose, Pose, runCycle, SpeechBubble, Smear } from "../kit2";
import { Mira, MIRA_BUILD, Ronan, RONAN_BUILD, bodyToWorld, worldToBody } from "../kit3";
import B from "./beats.json";
import { Cam, CamSpec, clamp, Coin, Droplets, DustPuff, fmt, GPouch, kick, lerp, Lighthouse, PaperStream, Quay, Ripple, SpeedLines, StallCounter, sstep, toScreen, W, H } from "./parts";
import { DRAGGED_FLAT, FOLDED_L, PANT, TREMBLE, WAIT } from "./poses";
import { mouthAt, S, Stage, Z } from "./shots1";
import { Drawn } from "./parts";
import type { P } from "../kit2";

/* 6 - the receipt */
const COUNT_TO = 300_000_000;
const spinNumber = (f: number) => {
  const [a, b] = B.tick as [number, number];
  const k = clamp((f - a + 1) / (b - a));
  if (k >= 1) return fmt(COUNT_TO);
  const v = Math.floor(COUNT_TO * Math.pow(k, 1.4));
  const d = String(v).padStart(9, "0").split("");
  return fmt(Number(d.map((c, i) => (i < 4 ? c : String(Math.floor(((Math.sin((i + f * 3.1) * 12.9898) * 43758.5453) % 1 + 1) % 1 * 10)))).join("")));
};
export const Shot6a: React.FC = () => {
  const f = useCurrentFrame();
  const t = f - S.receipt[0];
  const num = spinNumber(f);
  const lines: [string, string][] = [["SWORD REPAIRS", "50,000,000"], ["MEALS (x400)", "90,000,000"], ["GOT LOST (RESCUE)", "80,000,000"], ["INTEREST", "80,000,000"]];
  const st = sstep(t, 6, 8);
  return (
    <AbsoluteFill style={{ background: "#2b1620" }}>
      <SpeedLines f={f} n={20} o={0.35} color="#5a2a3a" />
      <Cam z={1 + t * 0.01} at={[540, 960]} rot={-4} shake={kick(f, B.stamp, 8, 14) + (t > 1 ? 2 : 0)} f={f}>
        <svg width={W} height={H}>
          <path d={`M110,200 L970,200 L970,1760 ${Array.from({ length: 14 }, (_, i) => `L${970 - (i + 1) * 61.4},${i % 2 ? 1760 : 1810}`).join(" ")} L110,1760Z`} fill="#fffdf0" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
          <text x={540} y={340} textAnchor="middle" fontFamily="Poppins Black" fontSize={62} fill={INK}>RONAN'S DEBT</text>
          <path d="M170,380 H910" stroke={INK} strokeWidth={6} strokeDasharray="22 14" />
          {lines.map(([a, b], i) => (
            <g key={a}>
              <text x={170} y={500 + i * 118} fontFamily="Poppins Black" fontSize={42} fill="#4a4a58">{a}</text>
              <text x={910} y={500 + i * 118} textAnchor="end" fontFamily="Poppins Black" fontSize={42} fill="#4a4a58">{b}</text>
              <path d={`M170,${520 + i * 118} H910`} stroke="#c8c8d0" strokeWidth={4} />
            </g>
          ))}
          <path d="M170,1010 H910" stroke={INK} strokeWidth={6} strokeDasharray="22 14" />
          <text x={540} y={1130} textAnchor="middle" fontFamily="Poppins Black" fontSize={70} fill="#d02828">TOTAL OWED:</text>
          <rect x={120} y={1190} width={840} height={250} rx={20} fill="#10141a" stroke={INK} strokeWidth={8} />
          <text x={500} y={1360} textAnchor="middle" fontFamily="Poppins Black" fontSize={num.length > 10 ? 104 : 112} fill="#ffe66a" stroke="#a06a08" strokeWidth={3}>{num}</text>
          <text x={910} y={1420} textAnchor="end" fontFamily="Poppins Black" fontSize={60} fill="#ffe66a">G</text>
          {st > 0 && (
            <g transform={`translate(790,1620) rotate(-14) scale(${lerp(2.6, 1, st)})`} opacity={st}>
              <rect x={-190} y={-56} width={380} height={112} rx={14} fill="rgba(255,255,255,0.6)" stroke="#d02828" strokeWidth={10} />
              <text x={0} y={24} textAnchor="middle" fontFamily="Poppins Black" fontSize={76} fill="#d02828">UNPAID</text>
            </g>
          )}
        </svg>
      </Cam>
    </AbsoluteFill>
  );
};

/** drained to grey line art, light wash behind; Mira (in colour) replies */
export const Shot6b: React.FC = () => {
  const f = useCurrentFrame();
  const t = f - S.drain[0];
  const shrink = sstep(t, 0, 4);
  const rs = 1.9;
  const p = pose({ ...TREMBLE, tilt: 4 + Math.sin(f * 2.2) * 2 });
  const at = { x: 400, y: 780 + 880 * 1.06 * rs * 1.04 + 60, s: rs };
  const ms = 0.95, mat = { x: 830, y: 1800, s: ms };
  const mp = pose({ ...WAIT, turn: -0.5 });
  const mm = mouthAt(mp, MIRA_BUILD, mat, 1.42);
  const rm = mouthAt(p, RONAN_BUILD, at, 1.22);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 40% 40%, #f2f5f9 0%, #cfd6e0 70%, #aab3c2 100%)" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${30 + i * 92},0 L${30 + i * 92 + (i % 3 - 1) * 24},${380 + ((i * 97) % 500)}`} stroke="#9aa4b6" strokeWidth={16 + (i % 4) * 8} strokeLinecap="round" opacity={0.55} />)}
      </svg>
      <Cam z={1 + t * 0.004} at={[540, 960]} f={f}>
        <HandDrawn hold={2} grain={0.4} boil={0.7}>
          <Drawn>
            {() => [
              <Z key="r" z={3}><Ronan pose={p} face="drained" drained x={at.x} y={at.y} s={at.s} lw={2.2} t={f / 24} wind={0.2} bellAmp={12} shadow={false} /></Z>,
              <Z key="m" z={5}><Mira pose={mp} face="cold" x={mat.x} y={mat.y} s={mat.s} lw={3} /></Z>,
            ]}
          </Drawn>
        </HandDrawn>
      </Cam>
      <Characters>
        <SpeechBubble x={560} y={330} tail={[rm[0] - 20, rm[1] - 10]} text="…Interest?" at={B.bubbles[2]} variant="think" />
        <SpeechBubble x={700} y={1040} tail={[mm[0], mm[1]]} text="Interest." at={B.bubbles[3]} />
      </Characters>
    </AbsoluteFill>
  );
};

/* 7 - the chase */
const RUN_P = 10;
const runP = (g: number, o = 0) => runCycle(g / RUN_P + o);

export const Shot7run: React.FC = () => {
  const f = useCurrentFrame();
  const t = f - S.run[0];
  return (
    <Stage plate="harbour2" fit={{ zoom: 1.4, x: lerp(300, -500, t / 12) }} light="noon" dof={0.5} cam={{ f, shake: 3 }}
      over={<SpeedLines f={f} n={10} o={0.45} dir={-1} />}>
      {(g) => [
        <Z key="q" z={0}><Quay y={1640} /></Z>,
        <Z key="p" z={1}><PaperStream from={[330, 1360]} t={g} dir={-1} len={380} w={26} /></Z>,
        <Z key="m" z={2}><Mira pose={runP(g, 0.2)} face="furious" x={230} y={1700} s={0.78} rattle={g % 2} /></Z>,
        <Z key="r" z={4}><Ronan pose={runP(g)} face="terror" x={680} y={1720} s={0.82} t={g / 24} wind={2.2} bellAmp={26} /></Z>,
        <Z key="d" z={5}><DustPuff x={560} y={1730} t={(g % 6) / 6} dir={1} /></Z>,
      ]}
    </Stage>
  );
};

export const Shot7water: React.FC = () => {
  const f = useCurrentFrame();
  const t = f - S.water[0];
  return (
    <Stage plate="sunsetdock" fit={{ zoom: 1.4, x: lerp(-200, 500, t / 12) }} light="sunset" dof={0.5} cam={{ f, shake: 3 }}
      over={<SpeedLines f={f} n={10} o={0.4} dir={-1} />}>
      {(g) => [
        <Z key="rp" z={1}>{[0, 1, 2, 3].map((i) => <Ripple key={i} x={620 - i * 90} y={1500 + (i % 2) * 10} t={clamp(((g + i * 2) % 8) / 8)} r={110} />)}</Z>,
        <Z key="m" z={2}><Mira pose={runP(g, 0.3)} face="furious" x={230} y={1520} s={0.78} rattle={g % 2} /></Z>,
        <Z key="r" z={4}><Ronan pose={runP(g)} face="terror" x={690} y={1540} s={0.82} t={g / 24} wind={2.2} bellAmp={26} /></Z>,
        <Z key="rr" z={5}><Ripple x={600} y={1545} t={(g % 6) / 6} r={120} /></Z>,
      ]}
    </Stage>
  );
};

/** the same lighthouse, twice */
const LH = { x: 780, y: 1500, s: 0.9 };
export const Shot7lh1: React.FC = () => {
  const f = useCurrentFrame();
  const t = f - S.lh1[0];
  const rx = lerp(-200, 1250, t / 10);
  return (
    <Stage plate="sunsetpier" fit={{ zoom: 1.3, x: 0 }} light="sunset" dof={0.5} cam={{ f }}>
      {(g) => [
        <Z key="q" z={0}><Quay y={1560} /></Z>,
        <Z key="lh" z={1}><Lighthouse x={LH.x} y={LH.y} s={LH.s} f={g} /></Z>,
        <Z key="m" z={2}><Mira pose={runP(g, 0.2)} face="furious" x={rx - 520} y={1660} s={0.78} rattle={g % 2} /></Z>,
        <Z key="r" z={4}><Ronan pose={runP(g)} face="terror" x={rx} y={1690} s={0.82} t={g / 24} wind={2.2} bellAmp={26} /></Z>,
      ]}
    </Stage>
  );
};
export const Shot7lh2: React.FC = () => {
  const f = useCurrentFrame();
  const t = f - S.lh2[0];
  const arrive = sstep(t, 0, 6);
  const rx = lerp(-150, 420, arrive);
  const skid = t >= 6;
  const turnBack = t >= 10;
  const cam: CamSpec = { f, shake: kick(f, S.lh2[0] + 6, 4, 6) };
  const mp = pose({ ...WAIT, turn: -0.6, elR: [-120, -700], haR: [-230, -700], hR: "point", shR: [100, -784] });
  const mat = { x: 900, y: 1660, s: 0.8 };
  const mm = mouthAt(mp, MIRA_BUILD, mat, 1.42);
  return (
    <Stage plate="sunsetpier" fit={{ zoom: 1.3, x: 0 }} light="sunset" dof={0.5} cam={cam}
      bubbles={[<SpeechBubble key="w" x={640} y={560} tail={[mm[0] - 20, mm[1] - 10]} text="Wrong way." at={B.bubbles[4]} />]}>
      {(g) => [
        <Z key="q" z={0}><Quay y={1560} /></Z>,
        <Z key="lh" z={1}><Lighthouse x={LH.x} y={LH.y} s={LH.s} f={g} gullLook /></Z>,
        <Z key="m" z={3}><Mira pose={t > 3 ? mp : WAIT} face="cold" x={mat.x} y={mat.y} s={mat.s} /></Z>,
        <Z key="r" z={4}><Ronan pose={skid ? POSES.cower : runP(g)} face={skid ? "terror" : "terror"} x={turnBack ? rx - (t - 10) * 70 : rx} y={1690} s={0.82} t={g / 24} wind={skid ? 0.3 : 2.2} bellAmp={skid ? 30 : 26} /></Z>,
        <Z key="d" z={5}>{skid && !turnBack && <DustPuff x={rx + 40} y={1700} t={clamp((t - 6) / 4)} dir={-1} r={50} />}</Z>,
      ]}
    </Stage>
  );
};

/** into the market: Ronan skids in and hides behind the Boss */
const MK = 1690;
export const Shot7mkt: React.FC = () => {
  const f = useCurrentFrame();
  const t = f - S.mkt[0];
  const rx = lerp(-150, 330, sstep(t, 0, 6));
  return (
    <Stage plate="market2" fit={{ zoom: 1.4, x: 200 }} light="noon" dof={0.5} cam={{ f, shake: kick(f, S.mkt[0] + 6, 3, 6) }}>
      {(g) => [
        <Z key="q" z={0}><Quay y={MK - 40} kind="street" /></Z>,
        <Z key="b" z={3}><Boss pose={pose({ ...POSES.stand, turn: 0.5 })} face="blank" x={600} y={MK} s={0.88} /></Z>,
        <Z key="r" z={2}><Ronan pose={t < 6 ? runP(g) : POSES.cower} face="terror" x={rx} y={MK + 10} s={0.82} t={g / 24} wind={t < 6 ? 2 : 0.2} /></Z>,
      ]}
    </Stage>
  );
};

/** the Boss's market corner, shared by the hide / look / point / thumb / grab / drag shots */
const BX = 560, BS = 0.88;
export const MarketWorld = (g: number, o: { boss: { pose: Pose; face: string; flip?: boolean }; ronan: { pose: Pose; face: string; x: number; flat?: boolean; scarfTo?: P; flip?: boolean; y?: number; drained?: boolean }; mira: { pose: Pose; face: string; x: number; flip?: boolean; extra?: React.ReactNode } }): React.ReactNode[] => [
  <Z key="q" z={0}><Quay y={MK - 40} kind="street" /></Z>,
  <Z key="r" z={2}><Ronan pose={o.ronan.pose} face={o.ronan.face} x={o.ronan.x} y={o.ronan.y ?? MK + 10} s={0.8} flipX={o.ronan.flip} t={g / 24} wind={0.2} scarfTo={o.ronan.scarfTo} drained={o.ronan.drained} bellAmp={o.ronan.flat ? 20 : 12} /></Z>,
  <Z key="b" z={3}><Boss pose={o.boss.pose} face={o.boss.face} x={BX} y={MK} s={BS} flipX={o.boss.flip} /></Z>,
  <Z key="m" z={4}><Mira pose={o.mira.pose} face={o.mira.face} x={o.mira.x} y={MK + 20} s={0.85} flipX={o.mira.flip} /></Z>,
];

export const Shot7hide: React.FC = () => {
  const f = useCurrentFrame();
  const t = f - S.hide[0];
  const mx = lerp(1250, 900, sstep(t, 0, 4));
  return (
    <Stage plate="market2" fit={{ zoom: 1.4, x: 200 }} light="noon" dof={0.5} cam={{ f }}>
      {(g) => MarketWorld(g, { boss: { pose: pose({ ...POSES.stand, turn: 0.5 }), face: "blank" }, ronan: { pose: POSES.cower, face: "terror", x: 400 }, mira: { pose: t < 4 ? runP(g, 0.1) : PANT, face: "pant", x: mx, flip: true } })}
    </Stage>
  );
};

/* 8 - the betrayal */
const MX0 = 900;
export const Shot8: React.FC = () => {
  const f = useCurrentFrame();
  const t = f - S.look[0];
  const cam: CamSpec = { z: lerp(1.0, 1.12, clamp(t / 48)), at: [540, 1300], f, shake: kick(f, B.pointHit, 5, 8) };
  const shake = Math.sin(f * 2.4) * 3;
  // phases
  const lookM = f < 221, lookR = f >= 221 && f < 226, pointing = f >= 226 && f < 234, thumbing = f >= 234 && f < 242, grabbing = f >= 242;
  const bossPose = pointing ? pose({ ...POSES.point, turn: 0.8 }) : thumbing ? pose({ ...POSES.stand, turn: 0.7, elR: [190, -700], haR: [260, -820], hR: "thumb" }) : grabbing ? pose({ ...POSES.stand, turn: 0.7, elR: [190, -700], haR: [260, -820], hR: "thumb" }) : pose({ ...POSES.stand, turn: 0.5 });
  const bossFlip = lookR || pointing;
  const bossFace = lookM ? "blank" : lookR ? "shock" : pointing ? "yell" : "smug";
  const mirax = f < 238 ? MX0 : lerp(MX0, 430, sstep(f, 238, 244));
  const running = f >= 238 && f < 244;
  const mp = running ? runCycle(f / 5) : thumbing ? pose({ ...WAIT, turn: -0.4 }) : f < 226 ? PANT : WAIT;
  const mface = running ? "furious" : thumbing ? "sweet" : pointing ? "smug" : lookM ? "pant" : "cold";
  const bm = mouthAt(bossPose, { s: 1, kx: 1, ky: 1 }, { x: BX, y: MK, s: BS, flipX: bossFlip }, 1.28);
  return (
    <Stage plate="market2" fit={{ zoom: 1.4, x: 200 }} light="noon" dof={0.5} cam={cam}
      bubbles={[<SpeechBubble key="!" x={760} y={620} tail={[...toScreen([bm[0], bm[1]], cam)] as P} text="!!" variant="shout" at={B.bubbles[5]} until={242} size={120} fill="#fff3a0" />]}>
      {(g) => MarketWorld(g, {
        boss: { pose: bossPose, face: bossFace, flip: bossFlip },
        ronan: { pose: pointing || thumbing ? TREMBLE : POSES.cower, face: "terror", x: 400 + (pointing || thumbing ? shake : 0), drained: thumbing },
        mira: { pose: mp, face: mface, x: mirax, flip: true },
      })}
    </Stage>
  );
};

/** the drag: Mira hauls Ronan flat by the scarf, to the right */
export const Shot8drag: React.FC = () => {
  const f = useCurrentFrame();
  const t = f - S.grab[0];
  const dragging = f >= S.drag[0];
  const k = f < S.drag[0] ? 0 : (f - S.drag[0]) / 14;
  const rx0 = dragging ? 100 + k * 480 : 340;
  const mx = f < S.drag[0] ? 430 + (f - 244) * 6 : rx0 + 540;
  const rp = dragging ? DRAGGED_FLAT : POSES.cower;
  const rat = { x: rx0, y: MK + 10, s: 0.8, flipX: dragging };
  const mp = dragging ? pose({ ...runCycle(f / 6), turn: 0.9 }) : pose({ ...WAIT, turn: 0.7, elR: [180, -640], haR: [-30, -540], hR: "hold" });
  const scarfTo: P | undefined = dragging ? worldToBody([mx - 40, MK - 330], rat, RONAN_BUILD) : undefined;
  return (
    <Stage plate="market2" fit={{ zoom: 1.4, x: 200 }} light="noon" dof={0.5} cam={{ f, shake: kick(f, B.grabHit, 6, 10) }}
      over={dragging ? <SpeedLines f={f} n={6} o={0.25} /> : undefined}>
      {(g) => [
        <Z key="q" z={0}><Quay y={MK - 40} kind="street" /></Z>,
        <Z key="b" z={1}><Boss pose={pose({ ...POSES.stand, turn: 0.7, elR: [190, -700], haR: [260, -820], hR: "thumb" })} face="smug" x={BX} y={MK} s={BS} /></Z>,
        <Z key="r" z={2}><Ronan pose={rp} face="drained" drained x={rat.x} y={rat.y} s={0.8} flipX={rat.flipX} t={g / 12} wind={0.6} scarfTo={scarfTo} bellAmp={30} /></Z>,
        <Z key="m" z={4}><Mira pose={mp} face="furious" x={mx} y={MK + 20} s={0.85} /></Z>,
        <Z key="d" z={5}>{dragging && <DustPuff x={rx0 - 260} y={MK + 20} t={(g % 6) / 6} dir={-1} r={40} />}</Z>,
      ]}
    </Stage>
  );
};

/* 9 - ten percent, and the turn to camera */
export const BOSS9 = { x: 380, y: 1700, s: 0.95 };
export const Shot9: React.FC = () => {
  const f = useCurrentFrame();
  const frozen = f >= B.yourTurn - 4;
  const turn = sstep(f, 300, 306);
  const hand = sstep(f, 264, 272);
  const mx = f < 264 ? 1250 - (f - S.pouch[0] + 8) * 0 : lerp(1000, 800, sstep(f, 264, 272));
  const mxx = f < 300 ? mx : lerp(800, 640, turn);
  const mp = f < 300 ? pose({ ...WAIT, turn: -0.8, elL: [-200, -700], haL: [-300, -690], hL: "open" }) : pose({ ...POSES.stand, tilt: 0, turn: 0, elL: [-130, -620], haL: [-120, -470], hL: "fist" });
  const ms = f < 300 ? 0.9 : lerp(0.9, 1.15, turn);
  const bossP = f < 272 ? pose({ ...POSES.stand, turn: 0.6, elR: [210, -700], haR: [330, -640], hR: "open" }) : pose({ ...POSES.stand, turn: 0.4, elL: [-130, -700], haL: [-30, -640], hL: "open", elR: [130, -700], haR: [30, -640], hR: "open" });
  const bossFace = f < 272 ? "grin" : frozen ? "shock" : "smug";
  const cam: CamSpec = { z: lerp(1.0, 1.1, sstep(f, 300, 330)), at: [540, 1300], f };
  const coinT = frozen ? (B.yourTurn - 4 - 272) : f - 272;
  const bm = mouthAt(bossP, { s: 1, kx: 1, ky: 1 }, BOSS9, 1.28);
  const mm = mouthAt(mp, MIRA_BUILD, { x: mxx, y: 1720, s: ms }, 1.42);
  return (
    <Stage plate="market2" fit={{ zoom: 1.4, x: 200 }} light="noon" dof={0.5} cam={cam}
      bubbles={[
        <SpeechBubble key="p" x={760} y={900} tail={[...toScreen(mm, cam)] as P} text="10%." at={B.bubbles[6]} until={290} />,
        <SpeechBubble key="y" x={780} y={860} tail={[...toScreen(mm, cam)] as P} text="Your turn." at={B.bubbles[7]} until={348} />,
        <SpeechBubble key="bz" x={290} y={560} tail={[...toScreen([bm[0], bm[1] - 20], cam)] as P} text="…Business?" variant="think" at={B.bubbles[8]} until={348} />,
      ]}>
      {(g) => {
        const ct = coinT;
        const coins = [0, 1, 2, 3, 4].map((i) => {
          const u = ((ct * 0.12 + i * 0.2) % 1);
          const x = BOSS9.x + 80 + Math.sin(u * Math.PI * 2) * 60 + i * 6, y = 1360 - Math.abs(Math.sin(u * Math.PI)) * 190;
          return <Coin key={i} x={x} y={y} r={26} sq={0.4 + 0.6 * Math.abs(Math.cos(u * Math.PI * 4))} rot={u * 40} />;
        });
        return [
          <Z key="q" z={0}><Quay y={1650} kind="street" /></Z>,
          <Z key="b" z={3}><Boss pose={bossP} face={bossFace} x={BOSS9.x} y={BOSS9.y} s={BOSS9.s} /></Z>,
          <Z key="c" z={5}>{g >= 272 && <g>{coins}</g>}</Z>,
          <Z key="po" z={5}>{g < 272 && <GPouch x={lerp(mxx - 130, BOSS9.x + 200, hand)} y={lerp(1450, 1430, hand)} s={0.6} rot={-10} />}</Z>,
          <Z key="m" z={4}><Mira pose={mp} face={f < 300 ? "cold" : "cold"} x={mxx} y={1720} s={ms} /></Z>,
        ];
      }}
    </Stage>
  );
};

export const _s2 = { Smear, Droplets, StallCounter, Lighthouse, bodyToWorld, FOLDED_L, Cam };
