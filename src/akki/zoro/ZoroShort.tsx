import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { HandDrawn } from "../../minecraft/handdrawn";
import { Hand, Part, pose, Pose, SKIN_TAN, smooth, tube, lerpPose } from "../bowling/characters";
import { AkkiHeader, ease, H, INK, lerp, loadAkkiFonts, TitleText, W } from "../common";
import { BLOOD, BLOOD_D, BOOT, BOOT_S, Clerk, HARA, HARA_S, Katana, LooseArm, PANTS, PANTS_S, SHIRT, SHIRT_S, Spray, ZHAIR, ZHAIR_S, ZoroPre, ZoroPreHead } from "./cast";
import { BlueVoid, CeilingLow, CeilingUp, DarkVoid, FloorClose, Shop, Spotlight } from "./sets";
import B from "./beats.json";

/**
 * "Zoro vs the cursed sword" — 13.9 seconds, every frame drawn here.
 *
 * Zoro is buying a sword. The shopkeeper warns him it's cursed; Zoro does
 * what he does in the source — throws it in the air and holds his arm out
 * under it to let fate decide. This time fate decides. The sword drops past
 * him, sticks in the floor by his boot, and a forearm lands next to it.
 * He winces, then goes straight to denial: a goofy noodle-legged dance.
 * Last shot, under a spotlight: three-sword style, one arm down — one in
 * the hand, one in the teeth, one clenched in his backside.
 *
 * Shot cuts are the original's own (src/akki/zoro/beats.json), so the audio
 * script and the edit can't drift apart.
 */

export const ZORO_FRAMES = B.frames;
const S = B.shots;
type P = [number, number];

/* ------------------------------- shared bits ------------------------------- */

const Frame: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, background: bg }}>{children}</svg>
);

/** a camera: zoom about a point, plus translation and a decaying shake */
const Cam: React.FC<{ z?: number; cx?: number; cy?: number; tx?: number; ty?: number; shake?: number; f?: number; children: React.ReactNode }> = ({ z = 1, cx = 540, cy = 960, tx = 0, ty = 0, shake = 0, f = 0, children }) => {
  const sx = shake ? Math.sin(f * 2.7) * shake : 0, sy = shake ? Math.cos(f * 3.3) * shake : 0;
  return <g transform={`translate(${cx + tx + sx},${cy + ty + sy}) scale(${z}) translate(${-cx},${-cy})`}>{children}</g>;
};
const kick = (f: number, at: number, amt = 26, decay = 4) => (f >= at ? amt * Math.exp(-(f - at) / decay) : 0);

/* ---------------------------------- poses ---------------------------------- */

/** holding the sword out, upright, to the clerk */
const OFFER: Pose = pose({
  head: [16, -905], turn: 0.75, tilt: 4,
  elR: [210, -700], haR: [320, -650], hR: "fist",
  elL: [-80, -620], haL: [-60, -470], backL: true,
  ftL: [-70, -14], ftR: [60, -14], fdL: 1, fdR: 1,
});
/** the toss: arm flung up and out, palm open */
const TOSS: Pose = pose({
  head: [24, -900], turn: 0.75, tilt: -6,
  elR: [230, -880], haR: [330, -1060], hR: "open",
  elL: [-80, -620], haL: [-60, -470], backL: true,
  ftL: [-70, -14], ftR: [60, -14], fdL: 1, fdR: 1,
});
/** front on, wincing, the stump held out sideways over the clerk */
const WINCE: Pose = pose({
  head: [-6, -905], tilt: -6, turn: 0.1,
  shR: [96, -800], elR: [330, -800], haR: [440, -800],
  elL: [-130, -620], haL: [-150, -470], hL: "fist",
  ftL: [-70, -14], ftR: [70, -14],
});
const DANCE_A: Pose = pose({
  head: [-30, -950], tilt: -14, turn: 0.2,
  shL: [-100, -840], elL: [-210, -1000], haL: [-150, -1160], hL: "spread",
  shR: [92, -840], elR: [220, -960], haR: [280, -1040],
  hipL: [-50, -520], knL: [-220, -330], ftL: [-60, -40],
  hipR: [50, -520], knR: [240, -300], ftR: [60, -14],
});
const DANCE_B: Pose = pose({
  head: [40, -890], tilt: 12, turn: 0.3,
  shL: [-80, -800], elL: [-240, -900], haL: [-380, -980], hL: "spread",
  shR: [110, -790], elR: [230, -880], haR: [300, -960],
  hipL: [-50, -470], knL: [-280, -440], ftL: [-520, -420], fdL: -1,
  hipR: [50, -480], knR: [80, -250], ftR: [70, -14], fdR: 1,
});
const CLERK_STAND: Pose = pose({ turn: -0.35, head: [-6, -905] });
const CLERK_HANDS_UP: Pose = pose({
  turn: -0.2, head: [-10, -900], tilt: -6,
  elL: [-190, -640], haL: [-230, -760], hL: "spread",
  elR: [190, -640], haR: [240, -760], hR: "spread",
});

/* ---------------------------------- shots ---------------------------------- */

const ShotShop: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, B.toss - 2, B.toss + 3);
  const p = lerpPose(OFFER, TOSS, k);
  // sword: upright in his fist, then flung up and out of the top of frame, turning
  const zx = 250, zy = 2120, zs = 1.7;
  const hand: P = [zx + p.haR[0] * zs, zy + p.haR[1] * zs];
  const fly = Math.max(0, t - B.toss) / (24 - B.toss);
  const sx = lerp(hand[0] + 4, 1010, Math.min(1, fly * 1.2));
  const sy = lerp(hand[1] - 20, -380, Math.min(1, fly * 1.25));
  const sa = lerp(-80, -30, k) + fly * 160;
  return (
    <Cam z={1 + t * 0.002} f={t}>
      <Shop />
      <Clerk p={CLERK_STAND} x={790} y={1740} s={1.14} face="yell" />
      {t < B.toss ? <Katana x={hand[0] - 2} y={hand[1] + 18} a={-82} len={560} w={13} /> : null}
      <ZoroPre p={p} x={zx} y={zy} s={zs} face="smirk" />
      {t >= B.toss ? <Katana x={sx} y={sy} a={sa} len={560} w={13} /> : null}
    </Cam>
  );
};

const ShotCeiling: React.FC<{ t: number }> = ({ t }) => (
  <>
    <CeilingUp t={t / 24} />
    <Katana x={640 - t * 2} y={760 + t * 3} a={122 + t * 0.9} len={430} w={12} lw={3.4} />
  </>
);

/** worm's-eye: legs like towers, arms spread, the sword turning high above */
const ShotBelow: React.FC<{ t: number }> = ({ t }) => {
  const tilt = (1 - ease(t, 0, 10)) * 620; // camera tilts down from the ceiling onto him
  const lw = 5;
  const sk = SKIN_TAN;
  const sword = ease(t, 0, 36);
  return (
    <g transform={`translate(0,${-tilt})`}>
      <CeilingLow />
      <Katana x={760 - sword * 30} y={260 + sword * 120} a={100 + t * 1.5} len={360} w={11} lw={3.4} />
      <g transform={`translate(0,${tilt * 1.15})`}>
        {/* the left arm, flung up and out, fist */}
        <Part d={tube([[400, 960], [210, 900], [70, 860]], [44, 38, 34])} fill={sk.base} shade={sk.shade} lw={lw} />
        <Part d={tube([[400, 960], [300, 930]], [58, 54])} fill={SHIRT} shade={SHIRT_S} lw={lw} />
        <Hand at={[60, 856]} dir={196} kind="fist" s={2.2} skin={sk.base} shade={sk.shade} lw={lw} />
        {/* the right arm, out to the side and down toward camera */}
        <Part d={tube([[780, 1000], [930, 1110], [1030, 1250]], [46, 42, 40])} fill={sk.base} shade={sk.shade} lw={lw} />
        <Part d={tube([[780, 1000], [880, 1070]], [62, 58])} fill={SHIRT} shade={SHIRT_S} lw={lw} />
        <Part d={tube([[870, 1060], [940, 1120]], [50, 48])} fill="#22262a" shade="#0e1012" lw={lw} />
        <Hand at={[1040, 1270]} dir={56} kind="fist" s={2.6} skin={sk.base} shade={sk.shade} lw={lw} />
        {/* sheathed swords sticking up past his hip */}
        {[0, 1, 2].map((i) => <Katana key={i} x={330 + i * 16} y={1260 - i * 6} a={-118 + i * 5} len={520} w={16} lw={4} sheathed wrap={["#f0eee6", "#2a2430", "#c43030"][i]} />)}
        {/* torso, seen from below: haramaki big, shirt small */}
        <Part d={smooth([[380, 940], [560, 900], [790, 990], [760, 1120], [560, 1150], [400, 1100]])} fill={SHIRT} shade={SHIRT_S} lw={lw} />
        <Part d={smooth([[360, 1090], [580, 1130], [800, 1110], [820, 1260], [580, 1310], [340, 1250]])} fill={HARA} shade={HARA_S} lw={lw} />
        {/* head: chin up, small */}
        <g transform="translate(600,800) rotate(-12) scale(1.45)"><ZoroPreHead face="narrow" turn={0.3} lw={3.4} /></g>
        {/* the legs: huge, converging away from us */}
        <Part d={tube([[470, 1260], [300, 1600], [140, 2000]], [86, 120, 170])} fill={PANTS} shade={PANTS_S} lw={lw}>
          <path d="M440,1300 Q330,1600 230,1990" stroke="#2f5a32" strokeWidth={10} fill="none" />
        </Part>
        <Part d={tube([[700, 1260], [820, 1600], [960, 2000]], [86, 120, 170])} fill={PANTS} shade={PANTS_S} lw={lw}>
          <path d="M740,1300 Q850,1600 900,1990" stroke="#2f5a32" strokeWidth={10} fill="none" />
        </Part>
      </g>
    </g>
  );
};

/** close on his face: eyes narrowed, weighing it up */
const ShotFace: React.FC<{ t: number; black: boolean }> = ({ t, black }) => {
  const sk = SKIN_TAN;
  return (
    <>
      {black ? <DarkVoid c="#060608" /> : <CeilingUp t={0.4} />}
      <Cam z={1 + t * 0.004} cy={1000} f={t}>
        <g transform="translate(560,1000) rotate(4) scale(5.6)"><ZoroPreHead face="narrow" turn={0.55} lw={1.2} /></g>
        {/* shoulders + open henley, over the neck */}
        <Part d={smooth([[-80, 1620], [200, 1420], [430, 1390], [700, 1390], [960, 1440], [1180, 1600], [1180, 2000], [-80, 2000]])} fill={SHIRT} shade={SHIRT_S} lw={6} sh={[-30, -6]}>
          <path d="M150,1660 Q260,1720 330,1880 M930,1620 Q860,1720 830,1860" stroke={SHIRT_S} strokeWidth={8} fill="none" />
        </Part>
        <Part d={smooth([[470, 1392], [560, 1600], [650, 1392], [560, 1380]], true, 0.4)} fill={sk.base} shade={sk.shade} lw={5} />
        <path d="M460,1390 L560,1610 L660,1390 M560,1610 L560,1820 Q530,1880 530,1940" stroke={INK} strokeWidth={6} fill="none" strokeLinejoin="round" />
      </Cam>
    </>
  );
};

/** straight down on him from above: the sword falls past the lens, then turns beside his outstretched arm */
const ShotAbove: React.FC<{ t: number }> = ({ t }) => {
  const sk = SKIN_TAN;
  const near = t < 10;
  const z = 1 + t * 0.003;
  const spin = Math.max(0, t - 10);
  return (
    <>
      <BlueVoid />
      <Cam z={z} f={t}>
        {/* Zoro, foreshortened from above: hair, shoulders, one arm straight out */}
        <g transform="translate(560,900)">
          <Part d={tube([[-60, 40], [-200, 90], [-330, 130]], [24, 22, 20])} fill={sk.base} shade={sk.shade} lw={4} />
          <Hand at={[-340, 132]} dir={160} kind="fist" s={1.3} skin={sk.base} shade={sk.shade} lw={4} />
          <Part d={smooth([[-80, 20], [-30, -30], [60, -30], [110, 30], [80, 120], [-20, 130], [-80, 90]])} fill={SHIRT} shade={SHIRT_S} lw={4} />
          <Part d={smooth([[-50, 110], [70, 110], [80, 170], [-50, 170]], true, 0.4)} fill={HARA} shade={HARA_S} lw={4} />
          <Part d={tube([[90, 40], [130, 140]], [20, 18])} fill={sk.base} shade={sk.shade} lw={4} />
          <Part d={"M-50,10 L-40,-40 L-20,-20 L-10,-62 L10,-26 L30,-60 L42,-20 L66,-44 L60,6 L84,0 L50,40 L-20,50Z"} fill={ZHAIR} shade={ZHAIR_S} lw={4} />
        </g>
        {near ? (
          <Katana x={170 + t * 22} y={360 + t * 30} a={60} len={1500} w={44} lw={7} />
        ) : (
          <Katana x={520 + Math.sin(spin * 0.25) * 60} y={700 + spin * 9} a={70 + spin * 14} len={400} w={11} lw={3.4} />
        )}
      </Cam>
    </>
  );
};

/** low and close: the sword wheels down past his outstretched fist */
const ShotFist: React.FC<{ t: number }> = ({ t }) => {
  const rise = (1 - ease(t, 0, 7)) * 900;
  const sk = SKIN_TAN;
  const a = ease(t, 6, 22);
  const arc = (ang: number): P => [560 + Math.cos(ang) * 420, 760 + Math.sin(ang) * 520];
  const sp = arc(lerp(-2.5, 1.0, a));
  return (
    <>
      <DarkVoid c="#0c0d1c" />
      <g transform={`translate(0,${rise})`}>
        <ZoroPre p={pose({ head: [-10, -905], turn: -0.6, elR: [150, -760], haR: [180, -760], hR: "none" })} x={540} y={2350} s={1.9} face="narrow" />
        {/* the fist, foreshortened right at the lens */}
        <Part d={tube([[760, 960], [800, 930]], [80, 100])} fill={sk.base} shade={sk.shade} lw={5} />
        <Hand at={[640, 950]} dir={-8} kind="fist" s={7.5} skin={sk.base} shade={sk.shade} lw={4} />
      </g>
      {t >= 4 && <Katana x={sp[0]} y={sp[1]} a={lerp(-60, 120, a) + t * 4} len={560} w={13} />}
    </>
  );
};

/** his head bottom-left, arm straight up and out — the blade sweeps down right past it */
const ShotArmUp: React.FC<{ t: number }> = ({ t }) => {
  const sk = SKIN_TAN;
  const a = ease(t, 2, 14);
  return (
    <>
      <DarkVoid c="#08080c" />
      <Cam z={1.0 + t * 0.003} f={t}>
        <Part d={tube([[400, 1240], [700, 960], [1020, 660]], [62, 56, 50])} fill={sk.base} shade={sk.shade} lw={6} />
        <Part d={tube([[400, 1240], [520, 1130]], [86, 82])} fill={SHIRT} shade={SHIRT_S} lw={6} />
        <Part d={tube([[540, 1110], [640, 1020]], [70, 66])} fill="#22262a" shade="#0e1012" lw={6} />
        <Hand at={[1040, 640]} dir={-40} kind="fist" s={3.8} skin={sk.base} shade={sk.shade} lw={6} />
        <g transform="translate(250,1400) rotate(-6) scale(4.4)"><ZoroPreHead face="closed" turn={0.45} lw={1.3} /></g>
        <Part d={smooth([[-120, 1640], [120, 1720], [420, 1240], [560, 1400], [600, 2000], [-120, 2000]])} fill={SHIRT} shade={SHIRT_S} lw={6} sh={[-26, -4]}>
          <path d="M180,1720 L250,1840 L320,1700 M250,1840 L250,1960" stroke={INK} strokeWidth={6} fill="none" />
        </Part>
        {/* the sweep: blade swings down past the arm */}
        <g opacity={t > 1 ? 1 : 0}>
          <Katana x={lerp(300, 820, a)} y={lerp(-300, 380, a)} a={lerp(110, 70, a)} len={880} w={18} lw={5} />
          {a > 0.1 && a < 0.95 && <path d={`M${lerp(380, 800, a - 0.1)},${lerp(-200, 900, a - 0.1)} Q${lerp(500, 900, a)},${lerp(100, 700, a)} ${lerp(620, 1000, a)},${lerp(300, 1100, a)}`} stroke="#ffffff" strokeWidth={6} opacity={0.5} fill="none" />}
        </g>
      </Cam>
    </>
  );
};

/** floor level by his boot: the sword drops in and sticks */
const BootScene: React.FC<{ t: number; lit: boolean; arm?: number }> = ({ t, lit, arm = -1 }) => {
  const drop = ease(t, 0, 7);
  const stuck = t >= 7;
  const sy = lerp(-700, 0, Math.pow(drop, 2));
  return (
    <>
      {lit ? <FloorClose /> : <DarkVoid c="#050506" />}
      {/* the leg: trousers from the top, boot planted */}
      <Part d={tube([[690, -40], [700, 420], [690, 760]], [120, 110, 104])} fill={PANTS} shade={PANTS_S} lw={6}>
        <path d="M600,-40 Q620,400 610,760 M780,-40 Q790,400 772,760" stroke="#2f5a32" strokeWidth={12} fill="none" />
      </Part>
      <Part d={smooth([[580, 700], [800, 690], [820, 960], [880, 1060], [860, 1140], [560, 1150], [470, 1110], [520, 1020], [570, 960]])} fill={BOOT} shade={BOOT_S} lw={6} sh={[-26, -6]} />
      <path d="M580,800 Q690,830 800,790" stroke="#2a2a2e" strokeWidth={6} fill="none" />
      {/* the sword, point-first into the boards beside the boot */}
      <g transform={`translate(0,${sy})`}>
        <Katana x={505} y={300} a={74} len={1000} w={24} lw={6} />
      </g>
      {stuck && <path d="M760,1250 l-30,10 m50,0 l-10,-24 m40,26 l26,-8" stroke={lit ? "#7a4a20" : "#333"} strokeWidth={6} strokeLinecap="round" opacity={Math.max(0, 1 - (t - 7) / 8)} />}
      {arm >= 0 && <ArmDrop t={arm} />}
      {!lit && <rect width={W} height={H} fill="#000" opacity={0.55} />}
    </>
  );
};

const ArmDrop: React.FC<{ t: number }> = ({ t }) => {
  const land = B.armLand - S.arm[0];
  const k = ease(t, 0, land);
  const y = lerp(-500, 1330, Math.pow(k, 1.6));
  const pool = Math.min(1, Math.max(0, (t - land) / 14));
  return (
    <g>
      {pool > 0 && (
        <path d={smooth([[620, 1300], [760, 1270 - pool * 20], [880, 1290], [900, 1340 + pool * 10], [760, 1360 + pool * 20], [600, 1340]])} fill={BLOOD} opacity={0.92} transform={`translate(760,1320) scale(${0.4 + pool * 0.8}) translate(-760,-1320)`} />
      )}
      <g transform={`translate(0,${t < land ? 0 : -Math.max(0, 22 * Math.exp(-(t - land) / 2) * Math.abs(Math.sin((t - land) * 1.4)))})`}>
        <LooseArm x={700} y={y + 120} s={1.8} a={t < land ? lerp(260, 205, k) : 205} lw={4} />
      </g>
    </g>
  );
};

const ShotWince: React.FC<{ t: number }> = ({ t }) => (
  <Cam z={1.32} cx={560} cy={760} ty={140} shake={kick(t, 0, 16, 5)} f={t}>
    <Shop />
    <Clerk p={CLERK_HANDS_UP} x={800} y={1880} s={1.3} face="shock" />
    <ZoroPre p={WINCE} x={330} y={2140} s={1.62} face="wince" noArmR swords={false} />
    <Spray x={330 + WINCE.elR[0] * 1.62 + 30} y={2140 + WINCE.elR[1] * 1.62} a={-4 + Math.sin(t) * 6} s={1.6 + (t % 2) * 0.2} seed={t % 3} />
  </Cam>
);

const ShotDenial: React.FC<{ t: number }> = ({ t }) => {
  const beat = Math.floor(t / 5) % 2; // two drawings, swapped every five frames
  const p = beat ? DANCE_B : DANCE_A;
  const hop = beat ? 0 : -60;
  return (
    <Cam z={1.32} cx={560} cy={760} ty={140} f={t}>
      <Shop />
      <Clerk p={CLERK_HANDS_UP} x={800} y={1880} s={1.3} face="shock" />
      <ZoroPre p={p} x={330} y={2140 + hop} s={1.6} face="goofy" noArmR swords={false} noodle={beat ? 0 : 80} />
      {t % 6 < 3 && <Spray x={330 + p.elR[0] * 1.6 + 20} y={2140 + hop + p.elR[1] * 1.6} a={-60} s={0.9} seed={t} />}
    </Cam>
  );
};

/** from behind under a spotlight: one arm, three swords — hand, teeth, backside */
const ShotSpot: React.FC<{ t: number }> = ({ t }) => {
  const on = ease(t, 0, 4);
  const sk = SKIN_TAN;
  const step = Math.sin(t * 0.5) * 8;
  const lw = 5;
  const pants = "#2f6a34", pantsS = "#1c4420";
  return (
    <>
      <Spotlight on={on} />
      <Cam z={1 + t * 0.003} cy={1100} f={t}>
        <g transform={`translate(0,${step * 0.3})`}>
          {/* legs + boots, walking away */}
          <Part d={tube([[470, 1120], [440, 1420], [410, 1660]], [70, 60, 52])} fill={pants} shade={pantsS} lw={lw} />
          <Part d={tube([[640, 1120], [680, 1420], [690, 1660]], [70, 60, 52])} fill={pants} shade={pantsS} lw={lw} />
          <Part d={smooth([[350, 1600], [480, 1600], [490, 1760], [520, 1800], [340, 1810], [330, 1720]])} fill={BOOT} shade={BOOT_S} lw={lw} />
          <Part d={smooth([[620, 1600], [760, 1600], [770, 1740], [800, 1790], [630, 1800], [620, 1720]])} fill={BOOT} shade={BOOT_S} lw={lw} />
          {/* seat of the trousers */}
          <Part d={smooth([[400, 1000], [720, 1000], [750, 1130], [700, 1240], [580, 1250], [560, 1200], [540, 1250], [420, 1240], [380, 1130]])} fill={pants} shade={pantsS} lw={lw}>
            {/* two cheeks, clenched */}
            <path d="M560,1030 Q556,1130 562,1215" stroke={INK} strokeWidth={4} fill="none" />
            <path d="M420,1200 Q480,1238 548,1212 M576,1212 Q650,1240 720,1196" stroke={INK} strokeWidth={3.4} fill="none" />
            <path d="M610,1040 Q690,1060 720,1140" stroke="#5aa060" strokeWidth={10} fill="none" opacity={0.6} />
          </Part>
          {/* bare back */}
          <Part d={smooth([[380, 560], [520, 520], [700, 540], [770, 620], [730, 900], [690, 990], [430, 990], [400, 880], [360, 680]])} fill={sk.base} shade={sk.shade} lw={lw} sh={[18, -8]}>
            <path d="M560,570 Q552,760 560,980 M450,600 Q470,690 530,700 M680,600 Q650,690 592,700" stroke={INK} strokeWidth={3.4} fill="none" />
            <path d="M600,560 L780,980 L780,560Z" fill="#fff3c8" opacity={0.35} />
          </Part>
          {/* sword three: clenched in his backside, blade up past his shoulder */}
          <Katana x={566} y={1205} a={-80} len={840} w={15} lw={4} />
          {/* haramaki */}
          <Part d={smooth([[420, 940], [700, 940], [720, 1040], [400, 1040]], true, 0.4)} fill={HARA} shade={HARA_S} lw={lw}>
            <path d="M410,980 L710,980 M410,1010 L715,1010" stroke={HARA_S} strokeWidth={3} />
          </Part>
          {/* left shoulder: just a stump */}
          <Part d={smooth([[360, 600], [400, 560], [430, 640], [400, 690], [360, 680]])} fill={sk.base} shade={sk.shade} lw={lw} />
          <ellipse cx={370} cy={660} rx={14} ry={22} fill={BLOOD_D} stroke={INK} strokeWidth={3} />
          {/* right arm hanging, sword one in hand, pointing down and back */}
          <Part d={tube([[740, 610], [790, 820], [800, 1000]], [40, 34, 30])} fill={sk.base} shade={sk.shade} lw={lw} />
          <Hand at={[800, 1010]} dir={80} kind="fist" s={1.9} skin={sk.base} shade={sk.shade} lw={lw} />
          <Katana x={790} y={1020} a={150} len={640} w={14} lw={4} />
          {/* the back of his head, turned a little to his left; sword two in his teeth sticks out past his cheek */}
          <Part d={tube([[566, 540], [580, 470]], [46, 44])} fill={sk.base} shade={sk.shade} lw={lw} sh={[12, 0]} />
          <g transform="translate(590,380) scale(2.1)">
            <Katana x={-30} y={30} a={176} len={300} w={8} lw={2.2} />
            {/* sliver of cheek and jaw on the far side */}
            <Part d={smooth([[-44, -20], [-56, 10], [-50, 40], [-30, 56], [-10, 48], [-20, 0]])} fill={sk.base} shade={sk.shade} lw={2.4} />
            <path d="M-56,26 L-42,30" stroke={INK} strokeWidth={3} />
            {/* ear */}
            <Part d={smooth([[30, -6], [46, -12], [50, 10], [42, 28], [30, 24]])} fill={sk.base} shade={sk.shade} lw={2.4} />
            {[0, 1, 2].map((i) => <path key={i} d={`M${42 + i * 3},${28 + i * 2} l0,7 q-4,5 0,10 q4,-5 0,-10`} fill="#f2c230" stroke={INK} strokeWidth={1.2} />)}
            {/* hair, seen from behind: the whole round crop, nape cut short */}
            <Part d={"M-48,20 L-58,-12 L-60,-44 L-48,-70 L-26,-88 L0,-94 L24,-90 L46,-74 L58,-48 L58,-16 L48,10 L36,4 L30,24 L14,14 L0,30 L-14,14 L-30,26 L-36,8Z"} fill={ZHAIR} shade={ZHAIR_S} lw={2.4} sh={[4, -4]} />
            <path d="M-30,-70 l6,14 M0,-80 l2,16 M26,-72 l-4,14 M-40,-30 l8,8 M40,-30 l-8,10" stroke={ZHAIR_S} strokeWidth={2.2} />
          </g>
        </g>
      </Cam>
    </>
  );
};

/* ---------------------------------- the edit ---------------------------------- */

const World: React.FC<{ f: number }> = ({ f }) => {
  const at = (k: keyof typeof S) => { const s = S[k] as number[]; return f >= s[0] && f < s[1] ? f - s[0] : -1; };
  let t: number;
  if ((t = at("shop")) >= 0) return <Frame><ShotShop t={t} /></Frame>;
  if ((t = at("ceiling")) >= 0) return <Frame><ShotCeiling t={t} /></Frame>;
  if ((t = at("below")) >= 0) return <Frame><ShotBelow t={t} /></Frame>;
  if ((t = at("face")) >= 0) return <Frame><ShotFace t={t} black={f >= S.faceBlack} /></Frame>;
  if ((t = at("above")) >= 0) return <Frame><ShotAbove t={t} /></Frame>;
  if ((t = at("fist")) >= 0) return <Frame><ShotFist t={t} /></Frame>;
  if ((t = at("armUp")) >= 0) return <Frame><ShotArmUp t={t} /></Frame>;
  if ((t = at("bootDark")) >= 0) return <Frame><Cam shake={kick(f, B.stick, 18, 3)} f={f}><BootScene t={f - S.bootDark[0]} lit={false} /></Cam></Frame>;
  if ((t = at("bootLit")) >= 0) return <Frame><BootScene t={99} lit /></Frame>;
  if ((t = at("arm")) >= 0) return <Frame><Cam shake={kick(f, B.armLand, 14, 3)} f={f}><BootScene t={99} lit arm={t} /></Cam></Frame>;
  if ((t = at("wince")) >= 0) return <Frame><ShotWince t={t} /></Frame>;
  if ((t = at("denial")) >= 0) return <Frame><ShotDenial t={t} /></Frame>;
  t = f - S.spot[0];
  return <Frame><ShotSpot t={t} /></Frame>;
};

export const ZoroShort: React.FC<{ audio?: string | null }> = ({ audio = null }) => {
  loadAkkiFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <HandDrawn hold={2} grain={0.4} boil={0.8}>
        <WorldAt />
      </HandDrawn>
      {f < S.below[0] ? <TitleText text="ZORO VS CURSED SWORD" y={243} size={50} /> : <AkkiHeader y={157} />}
    </AbsoluteFill>
  );
};
const WorldAt: React.FC = () => <World f={useCurrentFrame()} />;

/* --------------------------------- thumbnail --------------------------------- */

export const ZoroThumb: React.FC = () => {
  loadAkkiFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Frame><ShotDenial t={0} /></Frame>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {[["CURSED", "#ffffff", 1290], ["SWORD TEST", "#ffd400", 1500]].map(([s, c, y]) => (
          <text key={s as string} x={540} y={y as number} textAnchor="middle" fontFamily="Poppins Black" fontSize={136} fill={c as string} stroke={INK} strokeWidth={26} paintOrder="stroke" strokeLinejoin="round">{s}</text>
        ))}
      </svg>
      <AkkiHeader y={157} />
    </AbsoluteFill>
  );
};
