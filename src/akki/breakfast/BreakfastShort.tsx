import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { HandDrawn } from "../../minecraft/handdrawn";
import { Hand, Luffy, pose, Pose, Regular, RubberArm } from "../bowling/characters";
import { RegularWrinkled } from "../bowling/closeups";
import { BrushBlue } from "../bowling/sets";
import { ease, H, INK, lerp, loadAkkiFonts, TitleText, W } from "../common";
import { Admiral, AkainuHead, KizaruHead, KuzanHead } from "./cast";
import { Beam, Boom, Frost, FxDefs, IceBlock, IceSpikes, ImpactFlash, Magma, Smoke, Sparkle } from "./fx";
import { Canteen, HakiStage, Plate, Table, Toast, Toaster } from "./sets";
import B from "./beats.json";

/**
 * "Admirals make breakfast" — 15.5 seconds, AKKI TALKS house style.
 *
 * Our guy (the channel owner, src/akki/guest.tsx) orders toast at the Marine
 * HQ canteen. Akainu makes it with a magma fist: ash. Kuzan makes it with
 * Ice Age: frozen, and so is he. Kizaru makes it at the speed of light: the
 * toaster explodes — but one perfect golden slice floats down onto his
 * plate. He lifts it to his mouth... and a rubber arm takes it. Three
 * admirals, one Luffy, one canteen. Last shot: him in the crater, plate in
 * hand.
 *
 * Built like the channel's shorts: a cut every ~1s, extreme angles for each
 * attempt, a white-on-black impact frame on every big hit, the bystander's
 * reaction drawn in a different style each time, sound on every action.
 */

export const BREAKFAST_FRAMES = B.frames;
const S = B.shots;
type P = [number, number];

const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
    <FxDefs />
    {children}
  </svg>
);
const Cam: React.FC<{ z?: number; cx?: number; cy?: number; tx?: number; ty?: number; shake?: number; f?: number; children: React.ReactNode }> = ({ z = 1, cx = 540, cy = 960, tx = 0, ty = 0, shake = 0, f = 0, children }) => {
  const sx = shake ? Math.sin(f * 2.7) * shake : 0, sy = shake ? Math.cos(f * 3.3) * shake : 0;
  return <g transform={`translate(${cx + tx + sx},${cy + ty + sy}) scale(${z}) translate(${-cx},${-cy})`}>{children}</g>;
};
const kick = (f: number, at: number, amt = 26, decay = 4) => (f >= at ? amt * Math.exp(-(f - at) / decay) : 0);

/* ---------------------------------- poses ---------------------------------- */

const BEHIND: Pose = pose({ elL: [-150, -640], haL: [-40, -560], hL: "fist", elR: [150, -640], haR: [40, -560], hR: "fist" });
const POINT: Pose = pose({ turn: 0.4, elR: [260, -790], haR: [420, -820], hR: "point", elL: [-120, -620], haL: [-110, -470] });
const GUEST_SIT: Pose = pose({ elL: [-150, -640], haL: [-170, -520], hL: "relax", elR: [150, -640], haR: [170, -520], hR: "relax" });
const GUEST_LIFT: Pose = pose({ elL: [-150, -640], haL: [-170, -520], elR: [190, -720], haR: [70, -860], hR: "hold" });

/* -------------------------------- the guest -------------------------------- */

/** our guy at the table, seen from the front: the table hides him from the waist down */
const GuestAtTable: React.FC<{ face?: "grin" | "blank" | "shock"; p?: Pose; s?: number; x?: number; y?: number; frizz?: boolean }> = ({ face = "grin", p = GUEST_SIT, s = 1, x = 540, y = 2150, frizz }) => (
  <g>
    <Regular p={p} x={x} y={y} s={s} face={face} lw={4} />
    {frizz && Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${x - 70 * s + i * 28 * s},${y - 1020 * s} q${10 * s},${-30 * s} ${-4 * s},${-60 * s}`} stroke="#6a6870" strokeWidth={10} fill="none" opacity={0.7} strokeLinecap="round" />)}
  </g>
);

/* ---------------------------------- shots ---------------------------------- */

const ShotOrder: React.FC<{ t: number }> = ({ t }) => (
  <Cam z={1 + t * 0.002} f={t}>
    <Canteen />
    <defs><clipPath id="aboveCounter"><rect x={0} y={0} width={W} height={985} /></clipPath></defs>
    <g clipPath="url(#aboveCounter)">
      <Admiral who="akainu" p={BEHIND} x={210} y={1660} s={1.14} face="stern" />
      <Admiral who="kuzan" p={BEHIND} x={870} y={1680} s={1.18} face="sleepy" />
      <Admiral who="kizaru" p={BEHIND} x={540} y={1640} s={1.14} face="smirk" />
    </g>
    <Toaster x={540} y={975} s={0.7} />
    <GuestAtTable face="grin" s={1.05} y={2280} />
    <Table y={1620} />
    <Plate x={540} y={1610} s={1.1} />
  </Cam>
);

/** Akainu, low and close: the fist goes molten */
const ShotMagmaFist: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, B.ignite - S.magmaFist[0], 18);
  return (
    <>
      <rect width={W} height={H} fill="#2a0a06" />
      <circle cx={760} cy={1150} r={600 * k} fill="#ff5a1a" opacity={0.25} filter="url(#glowSoft)" />
      <Cam z={1 + t * 0.006} cy={900} f={t}>
        {/* shoulders and coat */}
        <path d="M-40,1500 Q200,1240 420,1220 L700,1220 Q900,1260 1120,1500 L1120,1920 L-40,1920Z" fill="#f6f6f2" stroke={INK} strokeWidth={8} />
        <path d="M260,1300 Q540,1250 820,1300 L860,1920 L220,1920Z" fill="#8c1c22" stroke={INK} strokeWidth={8} />
        <path d="M440,1240 L540,1460 L640,1240Z" fill="#c2303a" stroke={INK} strokeWidth={6} />
        <g transform="translate(470,860) scale(4.6)"><AkainuHead face="angry" turn={-0.3} lw={1.2} /></g>
        {/* the raised fist */}
        <path d="M820,1700 Q860,1450 820,1240" stroke="#8c1c22" strokeWidth={150} fill="none" />
        <path d="M820,1700 Q860,1450 820,1240" stroke={INK} strokeWidth={150} fill="none" opacity={0} />
        <Hand at={[800, 1210]} dir={-90} kind="fist" s={6.2} skin="#e9b080" shade="#c27d52" lw={4} />
        {k > 0 && <Magma x={810} y={1150} r={60 + 170 * k} t={t / 24} seed={3} drips={k > 0.5 ? 5 : 2} />}
      </Cam>
    </>
  );
};

/** the punch: magma fist into the toast on the counter */
const ShotMagmaPunch: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  if (f >= B.flash1[0] && f < B.flash1[1]) return <ImpactFlash x={540} y={1100} seed={2} />;
  const hit = B.punch - S.magmaPunch[0];
  const drop = ease(t, 0, hit);
  const after = Math.max(0, t - hit) / 20;
  return (
    <Cam z={1.5} cy={1000} shake={kick(f, B.punch, 30, 4)} f={f}>
      <Canteen />
      <Toast x={540} y={940} s={1.3} burnt={after > 0.2 ? 1 : 0} />
      <Magma x={540} y={lerp(200, 880, drop)} r={190} t={t / 24} seed={5} drips={5} />
      {t >= hit && <Boom x={540} y={940} r={420} t={Math.min(1, after)} seed={4} />}
    </Cam>
  );
};

const ShotAsh: React.FC<{ t: number }> = ({ t }) => (
  <Cam z={1.9 + t * 0.004} cy={1560} f={t}>
    <Canteen wreck={0.3} />
    <Table y={1620} />
    <Plate x={540} y={1610} s={1.1} />
    <Toast x={540} y={1560 + t * 0.6} s={0.75} burnt={1} rot={-4} />
    {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={480 + i * 18} cy={1600 + ((t * 3 + i * 7) % 30)} r={5} fill="#1a1412" />)}
    <Smoke x={540} y={1480} r={90} t={t / 24} c="#5a5660" />
  </Cam>
);

const ShotReact1: React.FC<{ t: number }> = ({ t }) => (
  <>
    <BrushBlue seed={3} />
    <Cam z={1 + t * 0.004} cy={900} f={t}><RegularWrinkled /></Cam>
  </>
);

/** Kuzan: one slow breath and the canteen freezes */
const ShotIceAge: React.FC<{ t: number }> = ({ t }) => {
  const b = ease(t, B.breath - S.iceAge[0], B.freeze - S.iceAge[0]);
  const fr = ease(t, B.freeze - S.iceAge[0], S.iceAge[1] - S.iceAge[0]);
  return (
    <>
      <Canteen frost={fr} />
      <Cam z={1.25} cy={800} f={t}>
        <g transform="translate(540,940) scale(3.6)"><KuzanHead face={b > 0.05 ? "blow" : "sleepy"} turn={-0.2} lw={1.4} /></g>
        <path d="M120,1920 Q300,1250 540,1210 Q780,1250 960,1920Z" fill="#eef0f4" stroke={INK} strokeWidth={8} />
        <path d="M470,1225 L540,1400 L610,1225Z" fill="#4f7fd0" stroke={INK} strokeWidth={6} />
        <path d="M470,1225 L540,1400 M610,1225 L540,1400" stroke={INK} strokeWidth={6} />
        {/* the breath: a cone of frost from his mouth, out toward the lens */}
        {b > 0 && <path d={`M545,1120 L${545 - 520 * b},${1120 + 700 * b} L${545 + 520 * b},${1120 + 700 * b}Z`} fill="#dff4ff" opacity={0.4} filter="url(#glowSoft)" />}
        {b > 0 && Array.from({ length: 10 }, (_, i) => <circle key={i} cx={545 + (i - 4.5) * 50 * b} cy={1120 + (300 + (i % 3) * 120) * b} r={10 + (i % 3) * 6} fill="#ffffff" opacity={0.8} />)}
      </Cam>
      <IceSpikes y={1920} t={fr} hMax={520} />
      <Frost t={fr} />
    </>
  );
};

const ShotFrozen: React.FC<{ t: number }> = ({ t }) => (
  <Cam z={1.15} cy={1300} shake={t < 6 ? 6 : 0} f={t}>
    <Canteen frost={1} />
    <IceSpikes y={1000} t={1} hMax={260} seed={7} />
    <GuestAtTable face="shock" s={1.05} y={2280} />
    <IceBlock x={280} y={1080} w={520} h={560} />
    <Table y={1620} />
    <Plate x={540} y={1610} s={1.1} />
    <Toast x={540} y={1560} s={0.75} frozen />
    <Frost t={1} />
  </Cam>
);

/** Kizaru: the shades glint, a fingertip lights up */
const ShotKizaru: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const glint = ease(f, B.glint, B.glint + 6) * (1 - ease(f, B.glint + 10, B.glint + 16));
  const ch = ease(f, B.charge, S.kizaru[1]);
  return (
    <>
      <rect width={W} height={H} fill="#2a2008" />
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2 + t * 0.02;
        return <path key={i} d={`M540,900 L${540 + Math.cos(a) * 1600},${900 + Math.sin(a) * 1600} L${540 + Math.cos(a + 0.12) * 1600},${900 + Math.sin(a + 0.12) * 1600}Z`} fill="#f2c62e" opacity={0.18} />;
      })}
      <Cam z={1 + t * 0.005} cy={900} f={t}>
        <path d="M60,1920 Q240,1300 540,1260 Q840,1300 1020,1920Z" fill="#f2c62e" stroke={INK} strokeWidth={8} />
        {[260, 400, 540, 680, 820].map((x) => <path key={x} d={`M${x},1300 L${x + (x - 540) * 0.3},1920`} stroke="#c9921a" strokeWidth={5} />)}
        <path d="M440,1270 L540,1520 L640,1270Z" fill="#7a3aa8" stroke={INK} strokeWidth={6} />
        <g transform="translate(520,880) scale(4.4)"><KizaruHead face="oh" turn={0.2} lw={1.3} glint={glint} /></g>
        {/* finger up beside his face */}
        <path d="M900,1920 L880,1400" stroke="#f2c62e" strokeWidth={170} />
        <Hand at={[870, 1300]} dir={-90} kind="point" s={4.2} skin="#f4cfaa" shade="#d9a27e" lw={4} />
        {ch > 0 && <><circle cx={870} cy={1040} r={160 * ch} fill="#fff6c0" opacity={0.6} filter="url(#glowSoft)" /><Sparkle x={870} y={1040} r={30 + 120 * ch} /></>}
      </Cam>
    </>
  );
};

/** the beam: finger to toaster, toaster to kingdom come */
const ShotBeam: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  if (f >= B.flash2[0] && f < B.flash2[1]) return <ImpactFlash x={760} y={940} seed={5} />;
  const fire = f >= B.fire;
  const boom = f >= B.boom;
  const hand: P = [360, 830];
  return (
    <Cam z={1.1} cy={950} shake={kick(f, B.boom, 34, 5)} f={f}>
      <Canteen wreck={boom ? 0.5 : 0} />
      <Admiral who="kizaru" p={POINT} x={200} y={1700} s={1.05} face="smirk" />
      {!boom && <Toaster x={760} y={975} s={0.9} glow={fire ? 1 : 0} />}
      {boom && <Toaster x={760} y={975} s={0.9} wreck />}
      {fire && !boom && <Beam a={hand} b={[760, 900]} w={34} t={t / 24} />}
      {boom && <Boom x={760} y={900} r={520} t={(f - B.boom) / 12} seed={8} />}
      {boom && <Smoke x={760} y={800} r={200} t={(f - B.boom) / 14} />}
    </Cam>
  );
};

/** in the smoke: one perfect golden slice floats down onto his plate */
const ShotGolden: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const k = ease(f, S.golden[0], B.land);
  return (
    <Cam z={1.35} cy={1350} f={t}>
      <Canteen wreck={1} />
      <Smoke x={300} y={900} r={260} t={0.4 + t / 60} />
      <Smoke x={800} y={1000} r={240} t={0.5 + t / 60} seed={9} />
      <GuestAtTable face="grin" s={1.05} y={2280} frizz />
      <Table y={1620} />
      <Plate x={540} y={1610} s={1.1} />
      <Toast x={540 + Math.sin(t * 0.35) * 70 * (1 - k)} y={lerp(700, 1560, k)} s={0.75} golden rot={Math.sin(t * 0.3) * 18 * (1 - k)} />
      {Array.from({ length: 6 }, (_, i) => <Sparkle key={i} x={540 + Math.cos(i + t * 0.2) * 150} y={lerp(700, 1560, k) + Math.sin(i * 2 + t * 0.3) * 110} r={18 + (i % 3) * 8} c="#fff3b0" />)}
    </Cam>
  );
};

/** he lifts it... a rubber arm takes it */
const ShotSnatch: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const lift = ease(t, 0, 8);
  const reach = ease(f, B.grab - 5, B.grab);
  const back = ease(f, B.grab + 2, B.grab + 10);
  const p = lift < 1 ? GUEST_SIT : GUEST_LIFT;
  const s = 1.6, gx = 540, gy = 2900;
  const handAt: P = [gx + GUEST_LIFT.haR[0] * s, gy + GUEST_LIFT.haR[1] * s];
  const tip: P = [lerp(1240, handAt[0] + 20, reach) + back * 900, handAt[1] - 30];
  const grabbed = f >= B.grab;
  const bit = f >= B.grab + 8;
  return (
    <Cam z={1} cy={1100} f={t}>
      <Canteen wreck={1} />
      <Regular p={p} x={gx} y={gy} s={s} face={bit ? "shock" : "grin"} lw={4} />
      <Table y={1760} />
      {!grabbed && lift >= 1 && <Toast x={handAt[0] + 10} y={handAt[1] - 40} s={0.65} golden />}
      {reach > 0 && (
        <>
          <RubberArm from={[1200, tip[1] + 40]} to={tip} w={34} lw={4} hand={grabbed ? "hold" : "open"} />
          {grabbed && <Toast x={tip[0] + 30} y={tip[1] - 30} s={0.65} golden />}
        </>
      )}
      {bit && <text x={300} y={760} fontFamily="Poppins Black" fontSize={110} fill="#fff" stroke={INK} strokeWidth={18} paintOrder="stroke">CHOMP</text>}
    </Cam>
  );
};

/** three admirals turn round. Luffy, cheeks full, grins back. */
const ShotGlare: React.FC<{ t: number; f: number }> = ({ t, f }) => (
  <>
    <HakiStage t={t / 24} />
    <Cam z={1 + t * 0.004} cy={900} shake={4 + kick(f, B.rumble, 10, 10)} f={f}>
      <g transform="translate(200,620) scale(2.5)"><AkainuHead face="angry" lw={1.8} /></g>
      <g transform="translate(540,520) scale(2.7)"><KizaruHead face="oh" lw={1.8} /></g>
      <g transform="translate(880,620) scale(2.5)"><KuzanHead face="stern" lw={1.8} /></g>
      <Luffy p={pose({ elR: [150, -700], haR: [120, -860], hR: "hold" })} x={540} y={2300} s={1.25} face="grin" />
      {/* stuffed cheeks + the toast */}
      <ellipse cx={540 - 60} cy={2300 - 905 * 1.25 + 60} rx={40} ry={34} fill="#f6c9a0" stroke={INK} strokeWidth={4} />
      <ellipse cx={540 + 60} cy={2300 - 905 * 1.25 + 60} rx={40} ry={34} fill="#f6c9a0" stroke={INK} strokeWidth={4} />
      <Toast x={540 + 120 * 1.25} y={2300 - 860 * 1.25 - 40} s={0.6} golden rot={20} />
    </Cam>
  </>
);

/** all three at once */
const ShotTriple: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  if (f >= B.flash3[0] && f < B.flash3[1]) return <ImpactFlash x={540} y={1150} seed={(f % 2) + 7} />;
  const go = ease(f, B.attack, B.flash3[0]);
  const after = f >= B.flash3[1];
  return (
    <Cam z={1} cy={1000} shake={6 + kick(f, B.flash3[1], 40, 5)} f={f}>
      <Canteen wreck={after ? 1 : 0.6} />
      {!after && <Luffy p={pose({ elL: [-200, -700], haL: [-250, -850], hL: "open", elR: [200, -700], haR: [250, -850], hR: "open" })} x={540} y={1900} s={0.95} face="shock" />}
      {go > 0 && !after && (
        <>
          <Magma x={lerp(-200, 380, go)} y={lerp(1600, 1300, go)} r={190} t={t / 24} seed={11} drips={3} />
          <IceSpikes y={1920} t={go} x0={1080} x1={560} hMax={600} seed={12} />
          <Beam a={[540, -100]} b={[540, lerp(0, 1150, go)]} w={60} t={t / 24} />
        </>
      )}
      {after && <Boom x={540} y={1150} r={900} t={(f - B.flash3[1]) / 10} seed={13} />}
    </Cam>
  );
};

/** the crater: him, alone, holding the empty plate */
const ShotCrater: React.FC<{ t: number }> = ({ t }) => (
  <Cam z={1.25 + t * 0.003} cy={1300} f={t}>
    <Canteen wreck={1} />
    <path d="M-100,1500 Q540,1380 1180,1500 L1180,1920 L-100,1920Z" fill="#4a3a30" stroke={INK} strokeWidth={8} />
    <path d="M100,1560 Q540,1470 980,1560" stroke="#2a201a" strokeWidth={10} fill="none" />
    <Smoke x={200} y={1300} r={200} t={0.6 + t / 80} c="#6a6670" />
    <Smoke x={900} y={1250} r={220} t={0.6 + t / 80} c="#6a6670" seed={3} />
    <GuestAtTable face="blank" s={1.05} y={2280} frizz p={pose({ elL: [-140, -650], haL: [-60, -600], hL: "hold", elR: [140, -650], haR: [60, -600], hR: "hold" })} />
    <Plate x={540} y={2280 - 600 * 1.05 - 10} s={0.9} />
    {/* a single crumb of ash drifting down */}
    <circle cx={540 + Math.sin(t * 0.3) * 40} cy={900 + t * 12} r={8} fill="#2a2220" />
  </Cam>
);

/* ---------------------------------- the edit ---------------------------------- */

const World: React.FC<{ f: number }> = ({ f }) => {
  const at = (k: keyof typeof S) => { const s = S[k] as number[]; return f >= s[0] && f < s[1] ? f - s[0] : -1; };
  let t: number;
  if ((t = at("order")) >= 0) return <ShotOrder t={t} />;
  if ((t = at("magmaFist")) >= 0) return <ShotMagmaFist t={t} />;
  if ((t = at("magmaPunch")) >= 0) return <ShotMagmaPunch t={t} f={f} />;
  if ((t = at("ash")) >= 0) return <ShotAsh t={t} />;
  if ((t = at("react1")) >= 0) return <ShotReact1 t={t} />;
  if ((t = at("iceAge")) >= 0) return <ShotIceAge t={t} />;
  if ((t = at("frozen")) >= 0) return <ShotFrozen t={t} />;
  if ((t = at("kizaru")) >= 0) return <ShotKizaru t={t} f={f} />;
  if ((t = at("beam")) >= 0) return <ShotBeam t={t} f={f} />;
  if ((t = at("golden")) >= 0) return <ShotGolden t={t} f={f} />;
  if ((t = at("snatch")) >= 0) return <ShotSnatch t={t} f={f} />;
  if ((t = at("glare")) >= 0) return <ShotGlare t={t} f={f} />;
  if ((t = at("triple")) >= 0) return <ShotTriple t={t} f={f} />;
  return <ShotCrater t={f - S.crater[0]} />;
};

const WorldAt: React.FC = () => {
  const f = useCurrentFrame();
  return <Frame><World f={f} /></Frame>;
};

export const BreakfastShort: React.FC<{ audio?: string | null }> = ({ audio = null }) => {
  loadAkkiFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <HandDrawn hold={2} grain={0.4} boil={0.7}>
        <WorldAt />
      </HandDrawn>
      {f < 48 && <TitleText text="ADMIRALS MAKE BREAKFAST" y={243} size={50} />}
    </AbsoluteFill>
  );
};

/* --------------------------------- thumbnail --------------------------------- */

export const BreakfastThumb: React.FC = () => {
  loadAkkiFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Frame><ShotGlare t={6} f={B.rumble + 6} /></Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {[["WHO TOOK", "#ffffff", 1600], ["MY TOAST?!", "#ffd400", 1760]].map(([s, c, y]) => (
          <text key={s as string} x={540} y={y as number} textAnchor="middle" fontFamily="Poppins Black" fontSize={140} fill={c as string} stroke={INK} strokeWidth={26} paintOrder="stroke" strokeLinejoin="round">{s}</text>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

