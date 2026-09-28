import { CameraMotionBlur } from "@remotion/motion-blur";
import { noise2D } from "@remotion/noise";
import { evolvePath } from "@remotion/paths";
import React from "react";
import { AbsoluteFill, Audio, Freeze, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { H, PANEL_TOP, W } from "../minecraft/beats";
import { ease, FaceKind, Figure, limb, Pose, pose, POSE, Tint, TINT, Vignette, walkPose } from "../minecraft/figure";
import { loadMinecraftFonts } from "../minecraft/fonts";
import { DeadBush, Item, Poppy, Puff } from "../minecraft/pixels";
import B from "./beats.json";
import { Block, Caption, Chat, DeathScreen, Hearts, Hotbar, SlotItem, YReadout } from "./hud";

/**
 * "How to survive ANY fall in Minecraft" — 23 seconds.
 *
 * Three textbook clutches off the height limit, each landing on a real
 * mechanic: a water bucket, a hay bale after the bucket slips, and a slime
 * block that fires him straight back up. He survives all three on half a
 * heart, then steps off a 4-block ledge — exactly the drop that deals half a
 * heart — and dies. Respawn, and it loops back into the first jump.
 */

export const FALL_FRAMES = B.frames;

/* ------------------------------ physics ------------------------------ */

const { g: G, vmax: VMAX, v0: V0, slow: SLOW } = B.physics;
const TC = (VMAX + V0) / G;
/** feet displacement (down is +) after τ story-frames of a jump into free fall, capped at terminal velocity */
const fallDist = (t: number) => (t <= TC ? -V0 * t + 0.5 * G * t * t : -V0 * TC + 0.5 * G * TC * TC + VMAX * (t - TC));
const fallVel = (t: number) => Math.min(VMAX, -V0 + G * t);

const SCALE = 0.9;
const FEET_UP = 335 * SCALE;
const TRACK = 1000; // feet stay here on screen while the camera follows the fall
const LAND = 1300; // where the landing surface sits once the camera stops
const BLOCK = 170;

type Cfg = { start: number; slowStart: number; place: number; land: number; tau0: number; block: "water" | "hay" | "slime" };
const CFG: Record<"water" | "hay" | "slime", Cfg> = {
  water: { start: B.seg.water[0], ...B.water, tau0: B.physics.tau0.water, block: "water" },
  hay: { start: B.seg.hay[0], ...B.hay, tau0: B.physics.tau0.hay, block: "hay" },
  slime: { start: B.seg.slime[0], ...B.slime, tau0: B.physics.tau0.slime, block: "slime" },
};

/** story time: normal speed, a quarter speed through the clutch, snapping back to real time on impact */
const tauAt = (c: Cfg, l: number) => {
  const s = c.slowStart - c.start, L = c.land - c.start;
  if (l < s) return c.tau0 + l;
  if (l < L) return c.tau0 + s + (l - s) * SLOW;
  return c.tau0 + s + (L - s) * SLOW + (l - L);
};

const geometry = (c: Cfg) => {
  const tauLand = tauAt(c, c.land - c.start);
  const drop = fallDist(tauLand) - fallDist(c.tau0);
  const surface = TRACK + drop; // world y the feet land on
  const ground = c.block === "water" ? surface : surface + BLOCK;
  return { tauLand, drop, surface, ground };
};

const BN = B.bounce;
const ARCS = (() => {
  const out: { t0: number; T: number; v: number }[] = [];
  let v = BN.v, t0 = 0;
  while (v >= BN.minV) {
    const T = (2 * v) / BN.g;
    out.push({ t0, T, v });
    t0 += T;
    v *= BN.e;
  }
  return out;
})();
export const BOUNCE_CONTACTS = ARCS.map((a) => a.t0);
const bounce = (dl: number) => {
  for (let i = 0; i < ARCS.length; i++) {
    const a = ARCS[i];
    if (dl < a.t0 + a.T) {
      const t = dl - a.t0;
      return { h: a.v * t - 0.5 * BN.g * t * t, arc: i, t, T: a.T };
    }
  }
  return { h: 0, arc: -1, t: 0, T: 1 };
};

/** everything about a fall at local frame l — shared by the picture and the HUD */
export const fallState = (key: keyof typeof CFG, l: number) => {
  const c = CFG[key];
  const g = geometry(c);
  const tau = tauAt(c, l);
  const landed = l >= c.land - c.start;
  const dl = l - (c.land - c.start);
  let feetW = TRACK + fallDist(Math.min(tau, g.tauLand)) - fallDist(c.tau0);
  let lift = 0;
  if (key === "slime" && landed) lift = bounce(dl).h;
  feetW -= lift;
  const cam = Math.min(Math.max(0, (landed ? g.surface : feetW) - TRACK), g.ground - LAND);
  const perBlock = g.drop / 256;
  return { c, g, tau, landed, dl, feetW, cam, lift, vel: landed ? 0 : fallVel(tau), Y: 320 - (feetW - TRACK) / perBlock };
};

/* ------------------------------ poses -------------------------------- */

const LEAP = pose({ armL: limb(-110, -50, -130, -176), armR: limb(110, -50, 128, -176), legL: limb(-50, 228, -72, 320), legR: limb(50, 228, 76, 314) });
const fallPose = (t: number) =>
  pose({
    armL: limb(-120, -10 + Math.sin(t * 0.6) * 10, -175, -90 + Math.sin(t * 0.6) * 18),
    armR: limb(95, 100, 124, 186),
    legL: limb(-38, 236, -64, 322 + Math.sin(t * 0.5) * 8),
    legR: limb(42, 232, 70, 318 - Math.sin(t * 0.5) * 8),
  });
const REACH = pose({ armL: limb(-120, -10, -175, -90), armR: limb(70, 150, 62, 262), legL: limb(-40, 236, -66, 320), legR: limb(42, 232, 70, 318) });
const panicPose = (t: number) =>
  walkPose(t / 2.2, 90, pose({
    armL: limb(-120, -40 + 50 * Math.sin(t * 1.3), -150, -150 + 80 * Math.sin(t * 1.3)),
    armR: limb(120, -40 - 50 * Math.sin(t * 1.3), 150, -150 - 80 * Math.sin(t * 1.3)),
  }), false);
const SHRUG = pose({ armL: limb(-100, 90, -150, 20), armR: limb(100, 90, 150, 20) });

/* ------------------------------ scenery ------------------------------ */

const Sky: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="fallSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4f97f5" />
        <stop offset="100%" stopColor="#b9dcff" />
      </linearGradient>
    </defs>
    <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="url(#fallSky)" />
  </g>
);

const CLOUDS = Array.from({ length: 16 }, (_, i) => ({ x: random(`cx${i}`) * 1000 - 60, y: -900 + i * 420 + random(`cy${i}`) * 200, s: 0.7 + random(`cs${i}`) * 0.7 })).filter(
  // none beside the cliff edge in the opening frame, or he reads as standing on a cloud
  (c) => !(c.y + 800 > 760 && c.y + 800 < 1180 && c.x < 560)
);
const Clouds: React.FC<{ cam: number }> = ({ cam }) => (
  <g fill="#f2f6fb" stroke="#141414" strokeWidth={8} strokeLinejoin="round">
    {CLOUDS.map((c, i) => {
      const y = c.y - cam * 0.55 + 800;
      if (y < PANEL_TOP - 200 || y > H + 50) return null;
      return <path key={i} transform={`translate(${c.x} ${y}) scale(${c.s})`} d="M0,0 h90 v-30 h85 v30 h115 v60 h-75 v30 h-125 v-30 h-90 z" />;
    })}
  </g>
);

const SpeedLines: React.FC<{ cam: number; vel: number }> = ({ cam, vel }) => {
  const k = Math.max(0, vel / VMAX);
  if (k < 0.15) return null;
  return (
    <g stroke="#ffffff" strokeLinecap="round" opacity={0.55 * k}>
      {Array.from({ length: 24 }, (_, i) => {
        const x = 40 + random(`sl${i}`) * 1000;
        const span = H - PANEL_TOP + 400;
        const y = PANEL_TOP - 200 + ((random(`sy${i}`) * span - cam * 1.4) % span + span) % span;
        return <line key={i} x1={x} y1={y} x2={x} y2={y + 60 + vel * 2.4} strokeWidth={4 + (i % 3) * 2} />;
      })}
    </g>
  );
};

const WALL = 125;
/** the cliff he jumps from, streaming past on the left */
const Cliff: React.FC<{ top: number; bottom: number; cam: number; grassTop: boolean }> = ({ top, bottom, cam, grassTop }) => {
  const from = Math.max(top, Math.floor((cam + PANEL_TOP - WALL - top) / WALL) * WALL + top);
  const rows: number[] = [];
  for (let y = from; y < Math.min(bottom, cam + H); y += WALL) rows.push(y);
  return (
    <g>
      {rows.map((wy) =>
        [0, 1].map((col) => {
          const r = Math.round((wy - top) / WALL);
          const shade = ["#8c8c8c", "#7f7f7f", "#979797", "#868686"][Math.floor(random(`w${r}${col}`) * 4)];
          const isTop = grassTop && r === 0;
          return (
            <g key={`${wy}${col}`}>
              <rect x={col * WALL} y={wy - cam} width={WALL} height={WALL} fill={isTop ? "#8a6a45" : shade} stroke="#141414" strokeWidth={7} />
              {isTop && <rect x={col * WALL} y={wy - cam} width={WALL} height={30} fill="#6ba264" stroke="#141414" strokeWidth={7} />}
              {!isTop && <rect x={col * WALL + 20 + random(`p${r}${col}`) * 60} y={wy - cam + 30 + random(`q${r}${col}`) * 50} width={22} height={14} fill="#6e6e6e" />}
            </g>
          );
        })
      )}
    </g>
  );
};

const Ground: React.FC<{ y: number }> = ({ y }) =>
  y > H + 20 ? null : (
    <g>
      <rect x={0} y={y} width={W} height={H - y + 40} fill="#8a6a45" />
      <rect x={0} y={y} width={W} height={34} fill="#6ba264" />
      <path d={`M0,${y} H${W}`} stroke="#141414" strokeWidth={8} />
      <path d={`M0,${y + 34} H${W}`} stroke="#4d7a48" strokeWidth={6} />
      <Poppy x={330} y={y - 26} px={11} />
      <Poppy x={860} y={y - 26} px={11} />
      <DeadBush x={940} y={y - 6} scale={0.7} fill="#5d8d56" />
    </g>
  );

/* ------------------------------ figure ------------------------------- */

/** squash-and-stretch about the feet, the oldest trick in animation */
const Squash: React.FC<{ x: number; feet: number; sx: number; sy: number; rotate?: number; children: React.ReactNode }> = ({ x, feet, sx, sy, rotate = 0, children }) => (
  <g transform={`translate(${x} ${feet}) rotate(${rotate}) scale(${sx} ${sy}) translate(${-x} ${-feet})`}>{children}</g>
);

const impact = (dl: number, amt = 0.3) => (dl < 0 ? 0 : amt * Math.exp(-dl / 3.5) * Math.cos(dl * 0.9));

const Shake: React.FC<{ seed: string; t: number; amp: number; children: React.ReactNode }> = ({ seed, t, amp, children }) => (
  <g transform={`translate(${noise2D(seed, t * 0.45, 0) * amp} ${noise2D(seed, 0, t * 0.45) * amp})`}>{children}</g>
);

const Splash: React.FC<{ x: number; y: number; dl: number }> = ({ x, y, dl }) => {
  if (dl < 0 || dl > 26) return null;
  return (
    <g>
      {Array.from({ length: 18 }, (_, i) => {
        const a = -Math.PI / 2 + (random(`sa${i}`) - 0.5) * 2.2;
        const v = 14 + random(`sv${i}`) * 16;
        const px = x + Math.cos(a) * v * dl;
        const py = y + Math.sin(a) * v * dl + 0.9 * dl * dl;
        return <circle key={i} cx={px} cy={py} r={9 + random(`sr${i}`) * 9} fill="#7fb2ff" stroke="#1f4fae" strokeWidth={3} opacity={1 - dl / 26} />;
      })}
    </g>
  );
};

/* --------------------------- the three falls --------------------------- */

const FallShot: React.FC<{ which: "water" | "hay" | "slime" }> = ({ which }) => {
  const l = useCurrentFrame();
  const st = fallState(which, l);
  const { c, g, cam, landed, dl, tau } = st;
  const S = (y: number) => y - cam;
  const slowS = c.slowStart - c.start, placeL = c.place - c.start;
  const inSlow = l >= slowS && !landed;
  const x = which === "water" ? 175 + (540 - 175) * ease(tau, 0, 22) : 540;
  const feet = S(st.feetW);
  const placed = l >= placeL;
  const pop = ease(l, placeL, placeL + 3);
  const blockY = S(g.ground) - BLOCK;

  // who he is at this instant
  let p: Pose = fallPose(tau);
  let face: FaceKind = "sly";
  let item: "bucket" | "hay" | "slime" | null = null;
  let tint: Tint = TINT.normal;
  let rotate = 0;
  let look: readonly [number, number] = [0, 6];
  const stretch = Math.min(1, st.vel / VMAX) * 0.09;
  let sx = 1 - stretch * 0.6, sy = 1 + stretch;

  if (which === "water") {
    if (tau < 22) { p = LEAP; face = "joy"; look = [0, -6]; }
    if (inSlow) { p = REACH; face = "gritted"; look = [4, 12]; }
    item = !landed ? "bucket" : null;
    if (landed) { p = dl < 8 ? REACH : POSE.up; face = dl < 8 ? "gritted" : "grin"; }
  } else if (which === "hay") {
    const slip = B.hay.slip - c.start, select = B.hay.scramble[1] - c.start;
    item = l < slip ? "bucket" : l >= select && !placed ? "hay" : null;
    if (l >= slip) { p = panicPose(l); face = l < slip + 5 ? "shocked" : "scream"; look = [0, -10]; }
    if (l >= select) { p = fallPose(tau); face = "gritted"; }
    if (inSlow) { p = REACH; face = "gritted"; look = [4, 12]; }
    if (landed) {
      p = dl < 10 ? REACH : POSE.headHold;
      face = dl < 12 ? "hurt" : "meh";
      tint = dl < 8 ? TINT.hurt : TINT.normal;
      rotate = dl > 12 ? Math.sin(dl / 6) * 5 : 0;
    }
  } else {
    item = !placed ? "slime" : null;
    face = "gritted";
    if (inSlow) { p = REACH; look = [4, 12]; }
    if (landed) {
      const b = bounce(dl);
      if (b.arc === 0) { p = POSE.up; face = "scream"; rotate = 360 * (b.t / b.T); }
      else if (b.arc > 0) { p = POSE.spread; face = "shocked"; }
      else { p = POSE.chin; face = "meh"; rotate = Math.sin(dl / 5) * 6; look = [Math.sin(dl / 4) * 8, 0]; }
    }
  }

  // squash on every contact
  let sq = 0;
  if (landed) {
    if (which === "slime") {
      for (const t0 of BOUNCE_CONTACTS) sq += impact(dl - t0, 0.34 * (t0 === 0 ? 1 : 0.6));
    } else sq = impact(dl, which === "hay" ? 0.34 : 0.22);
    sx = 1 + sq * 0.7;
    sy = 1 - sq;
  }
  const blockSquash = which === "slime" ? Math.max(0, sq) * 0.6 : which === "hay" ? Math.max(0, impact(dl, 0.12)) : 0;

  const hand = (R: readonly [number, number]) => {
    if (item === "bucket") {
      const pour = which === "water" ? ease(l, placeL - 6, placeL) * 160 : 0;
      return <Item name="bucket" x={R[0] + 10} y={R[1] + 34} px={8} rotate={pour} />;
    }
    if (item === "hay" || item === "slime") return <Block kind={item} x={R[0] - 34} y={R[1] - 6} s={68} />;
    return null;
  };

  const shakeAmp = landed ? Math.max(0, 26 * Math.exp(-dl / 5)) * (which === "water" ? 0.5 : 1) : 0;
  const lx = 540;
  const blockX = lx - BLOCK / 2;

  return (
    <Shake seed={which} t={l} amp={shakeAmp}>
      <Sky />
      <Clouds cam={cam} />
      <Cliff top={which === "water" ? TRACK : TRACK - 30000} bottom={g.ground} cam={cam} grassTop={which === "water"} />
      <SpeedLines cam={cam} vel={st.vel} />
      <Ground y={S(g.ground)} />
      {placed && which !== "water" && (
        <g transform={`translate(${lx} ${blockY + BLOCK}) scale(${pop}) translate(${-lx} ${-(blockY + BLOCK)})`}>
          <Block kind={which} x={blockX} y={blockY} s={BLOCK} squash={blockSquash} />
        </g>
      )}
      <Squash x={x} feet={feet} sx={sx} sy={sy} rotate={rotate}>
        <Figure x={x} y={feet - FEET_UP} scale={SCALE} pose={p} face={face} tint={tint} look={look} shadow={landed && st.lift < 30} hands={({ R }) => hand(R)} />
      </Squash>
      {which === "hay" && l >= B.hay.slip - c.start && l < B.hay.slip - c.start + 30 && (
        // the bucket, out of reach
        <Item name="bucket" x={x + 110 + (l - (B.hay.slip - c.start)) * 4} y={feet - 260 - (l - (B.hay.slip - c.start)) * 34} px={9} rotate={(l - (B.hay.slip - c.start)) * 24} />
      )}
      {placed && which === "water" && (
        <g transform={`translate(${lx} ${S(g.ground)}) scale(${pop}) translate(${-lx} ${-S(g.ground)})`}>
          <Block kind="water" x={blockX} y={S(g.ground) - BLOCK} s={BLOCK} t={l} />
        </g>
      )}
      {which === "water" && <Splash x={lx} y={S(g.ground) - BLOCK} dl={dl} />}
      {which === "hay" && landed && dl < 18 && [0, 1, 2, 3].map((i) => (
        <Puff key={i} x={lx - 120 + i * 80} y={blockY - 10 - dl * 3} r={30 - i * 3} opacity={Math.max(0, 1 - dl / 18)} />
      ))}
      {which === "slime" && landed && BOUNCE_CONTACTS.map((t0, i) => {
        const d = dl - t0;
        if (d < 0 || d > 10) return null;
        return (
          <g key={i} fill="none" stroke="#3f7f2a" strokeWidth={7} strokeLinecap="round" opacity={1 - d / 10}>
            <path d={`M${lx - 150 - d * 6},${blockY + 20} q-30,-40 0,-80`} />
            <path d={`M${lx + 150 + d * 6},${blockY + 20} q30,-40 0,-80`} />
          </g>
        );
      })}
      {inSlow && <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#0b1b3a" opacity={0.12} />}
    </Shake>
  );
};

/* ------------------------------ the ledge ------------------------------ */

const UPPER = 880, BLK = 105, LOWER = UPPER + 4 * BLK, EDGE = 600, LS = 0.8;
const LedgeShot: React.FC = () => {
  const l = useCurrentFrame();
  const f = l + B.seg.ledge[0];
  const L = B.ledge;
  const walkT = ease(f, L.walk[0], L.walk[1]);
  const stepF = f - L.stepOff;
  const falling = stepF >= 0 && stepF < L.fallFrames;
  const landed = stepF >= L.fallFrames;
  const gF = (2 * (LOWER - UPPER)) / (L.fallFrames * L.fallFrames);
  let x = 150 + (548 - 150) * walkT;
  let feet = UPPER;
  if (stepF >= 0) {
    x = 548 + 130 * Math.min(1, stepF / L.fallFrames);
    feet = UPPER + 0.5 * gF * Math.min(stepF, L.fallFrames) ** 2;
  }
  const dl = stepF - L.fallFrames;
  let p: Pose = f < L.walk[1] ? walkPose((f - L.walk[0]) / L.stride, 55) : f < L.stepOff - 4 ? SHRUG : POSE.stand;
  let face: FaceKind = f < L.walk[1] ? "whistle" : f < L.stepOff ? "plain" : "plain";
  let look: readonly [number, number] = f >= L.measure[0] && f < L.stepOff ? [10, 14] : [0, 0];
  if (falling) { p = POSE.stand; face = "plain"; }
  const tip = ease(f, L.tip[0], L.tip[1]) * 90;
  if (landed) { p = dl < 6 ? POSE.stand : POSE.spread; face = dl < 4 ? "plain" : "shocked"; look = [0, 0]; }
  const sq = landed ? impact(dl, 0.18) : 0;
  const gone = f >= L.poof + 2;
  const measure = evolvePath(ease(f, L.measure[0], L.measure[1]), `M${EDGE + 40},${UPPER} H${EDGE + 70} V${LOWER} H${EDGE + 40}`);
  const shakeAmp = landed ? Math.max(0, 14 * Math.exp(-dl / 4)) : 0;

  return (
    <Shake seed="ledge" t={l} amp={shakeAmp}>
      <Sky />
      <g fill="#8fb98c" stroke="#141414" strokeWidth={7} strokeLinejoin="round" opacity={0.9}>
        <path d={`M0,${UPPER - 120} h160 v-60 h220 v40 h200 v-80 h260 v60 h240 V${UPPER} H0 z`} />
      </g>
      {/* the plateau he walks on, block by block so the 4 are countable */}
      {Array.from({ length: 6 }, (_, col) =>
        Array.from({ length: 10 }, (_, row) => (
          <Block key={`${col}-${row}`} kind={row === 0 ? "grass" : "dirt"} x={EDGE - (col + 1) * BLK} y={UPPER + row * BLK} s={BLK} />
        ))
      )}
      {Array.from({ length: 5 }, (_, col) =>
        Array.from({ length: 6 }, (_, row) => (
          <Block key={`lo${col}-${row}`} kind={row === 0 ? "grass" : "dirt"} x={EDGE + col * BLK} y={LOWER + row * BLK} s={BLK} />
        ))
      )}
      <Poppy x={250} y={UPPER - 26} px={10} />
      <path d={`M${EDGE + 40},${UPPER} H${EDGE + 70} V${LOWER} H${EDGE + 40}`} fill="none" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" strokeDasharray={measure.strokeDasharray} strokeDashoffset={measure.strokeDashoffset} />
      {[1, 2, 3].map((i) => (
        <line key={i} x1={EDGE + 55} y1={UPPER + i * BLK} x2={EDGE + 85} y2={UPPER + i * BLK} stroke="#ffffff" strokeWidth={6} opacity={ease(f, L.measure[0] + 5 * i, L.measure[0] + 5 * i + 4)} />
      ))}
      <g opacity={ease(f, L.measure[1] - 6, L.measure[1])} fontFamily="Silkscreen, monospace" fontSize={48}>
        <text x={EDGE + 100} y={(UPPER + LOWER) / 2 + 18} fill="#141414" stroke="#ffffff" strokeWidth={10} paintOrder="stroke">4 blocks</text>
      </g>
      {!gone && (
        <Squash x={x} feet={feet} sx={1 + sq * 0.7} sy={1 - sq} rotate={tip}>
          <Figure x={x} y={feet - 335 * LS} scale={LS} pose={p} face={face} look={look} tint={landed ? TINT.hurt : TINT.normal} shadow={!falling} />
        </Squash>
      )}
      {f >= L.poof && f < L.poof + 16 && [0, 1, 2, 3, 4].map((i) => (
        <Puff key={i} x={x + 40 + (i - 2) * 60} y={feet - 60 - (f - L.poof) * 5 - (i % 2) * 30} r={34 - i * 2} opacity={Math.max(0, 1 - (f - L.poof) / 16)} />
      ))}
    </Shake>
  );
};

/* --------------------------- respawn / loop ---------------------------- */

const RespawnShot: React.FC = () => {
  const l = useCurrentFrame();
  const f = l + B.seg.respawn[0];
  const crouch = ease(f, B.respawn.crouch, B.frames) * 0.16;
  const face: FaceKind = f < B.respawn.chat + 10 ? "sly" : "grin";
  return (
    <g>
      <Sky />
      <Clouds cam={0} />
      <Cliff top={TRACK} bottom={TRACK + 4000} cam={0} grassTop />
      <Squash x={175} feet={TRACK} sx={1 + crouch * 0.6} sy={1 - crouch}>
        <Figure x={175} y={TRACK - FEET_UP} scale={SCALE} pose={POSE.stand} face={face} look={f < B.respawn.chat + 10 ? [-8, 0] : [10, 10]}
          hands={({ R }) => <Item name="bucket" x={R[0] + 10} y={R[1] + 34} px={8} />} />
      </Squash>
      <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#ffffff" opacity={1 - ease(l, 0, 8)} />
    </g>
  );
};

/* ------------------------------- HUD --------------------------------- */

const ITEMS: SlotItem[] = ["bucket", "pickaxe", "bread", "cobble", "goldApple", "hay", "slime", "ironIngot", "redstone"];
const SCRAMBLE = [1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 4, 5];

const HudLayer: React.FC = () => {
  const f = useCurrentFrame();
  const S = B.seg;
  if (f >= S.dead[0] && f < S.dead[1]) return null;
  const ledgeLand = B.ledge.stepOff + B.ledge.fallFrames;
  let hp = 20;
  if (f >= B.hay.land && f < S.respawn[0]) hp = Math.max(1, 20 - Math.round(((f - B.hay.land) / 12) * 19));
  if (f >= ledgeLand && f < S.respawn[0]) hp = 0;
  const flash = (f >= B.hay.land && f < B.hay.land + 8) || (f >= ledgeLand && f < ledgeLand + 8);

  const items = ITEMS.map((it, i) => (i === 0 && f >= B.hay.slip && f < S.respawn[0] ? null : it));
  let sel = 0;
  if (f >= B.hay.scramble[0] && f < S.slime[0]) sel = f >= B.hay.scramble[1] ? 5 : SCRAMBLE[Math.min(SCRAMBLE.length - 1, Math.floor((f - B.hay.scramble[0]) / 1.8))];
  if (f >= S.slime[0] && f < S.respawn[0]) sel = 6;

  let Y = 320;
  if (f < S.hay[0]) Y = Math.min(320, fallState("water", f - S.water[0]).Y); // the jump peaks above 320, the build limit doesn't
  else if (f < S.slime[0]) Y = fallState("hay", f - S.hay[0]).Y;
  else if (f < S.ledge[0]) Y = Math.max(64, fallState("slime", f - S.slime[0]).Y);
  else if (f < S.respawn[0]) Y = f < B.ledge.stepOff ? 64 : 60;

  const chats: [number, string][] = [[B.water.chat, "<You> ez"], [B.hay.chat, "<You> still counts"], [B.slime.chat, "<You> meant to do that"], [B.respawn.chat, "<You> one more try"]];
  const chat = chats.filter(([at]) => f >= at).pop();
  // gone by the last frame, so the loop back to frame 0 has nothing to pop
  const chatOpacity = chat ? Math.min(1, (f - chat[0]) / 3) * (1 - ease(f, chat[0] + 54, chat[0] + 62)) * (1 - ease(f, B.frames - 12, B.frames - 2)) : 0;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <YReadout y={Y} />
      {chat && <Chat text={chat[1]} opacity={chatOpacity} y={1344} />}
      <Hearts x={60} y={1405} hp={hp} frame={f} flash={flash} />
      <Hotbar y={1450} items={items} selected={sel} />
    </svg>
  );
};

/* ------------------------------ assembly ------------------------------ */

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>{children}</svg>
  </AbsoluteFill>
);

const seq = (k: keyof typeof B.seg) => ({ from: B.seg[k][0], durationInFrames: B.seg[k][1] - B.seg[k][0], name: k });

export const FallShort: React.FC<{ audio?: string | null }> = ({ audio = null }) => {
  loadMinecraftFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#4f97f5" }}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      {(["water", "hay", "slime"] as const).map((k) => (
        <Sequence key={k} {...seq(k)}>
          {/* blur only the world: the HUD stays pin-sharp, as it would on a real screen */}
          <CameraMotionBlur shutterAngle={200} samples={6}>
            <Svg><FallShot which={k} /></Svg>
          </CameraMotionBlur>
        </Sequence>
      ))}
      <Sequence {...seq("ledge")}><Svg><LedgeShot /></Svg></Sequence>
      <Sequence {...seq("dead")}>
        <Svg><Freeze frame={B.seg.ledge[1] - B.seg.ledge[0] - 1}><LedgeShot /></Freeze></Svg>
        <DeadLayer />
      </Sequence>
      <Sequence {...seq("respawn")}><Svg><RespawnShot /></Svg></Sequence>
      <HudLayer />
      <Vignette w={W} h={H} />
      <Caption />
    </AbsoluteFill>
  );
};

const DeadLayer: React.FC = () => {
  const f = useCurrentFrame() + B.seg.dead[0];
  return (
    <Svg>
      <DeathScreen f={f} ev={B.dead} />
      <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#ffffff" opacity={ease(f, B.dead.flash, B.seg.dead[1])} />
    </Svg>
  );
};

/* ------------------------------ thumbnail ------------------------------ */

export const FallThumb: React.FC = () => {
  loadMinecraftFonts();
  const mid = 1150;
  return (
    <AbsoluteFill style={{ backgroundColor: "#4f97f5" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <Sky />
        <SpeedLines cam={900} vel={VMAX} />
        <Figure x={330} y={560} scale={0.72} pose={REACH} face="sly" look={[4, 12]} shadow={false} hands={({ R }) => <Item name="bucket" x={R[0] + 10} y={R[1] + 34} px={8} rotate={120} />} />
        <Block kind="water" x={255} y={mid - 150} s={150} />
        <text x={560} y={760} fontFamily="Silkscreen, monospace" fontSize={84} fill="#ffffff" stroke="#141414" strokeWidth={12} paintOrder="stroke">320</text>
        <text x={560} y={850} fontFamily="Silkscreen, monospace" fontSize={60} fill="#7CFC6A" stroke="#141414" strokeWidth={10} paintOrder="stroke">blocks: ok</text>
        <rect x={0} y={mid} width={W} height={H - mid} fill="#b9dcff" />
        <path d={`M0,${mid} H${W}`} stroke="#141414" strokeWidth={10} />
        {Array.from({ length: 4 }, (_, row) => [0, 1, 2].map((col) => (
          <Block key={`${row}${col}`} kind={row === 0 ? "grass" : "dirt"} x={420 - (col + 1) * 110} y={1250 + row * 110} s={110} />
        )))}
        {[0, 1, 2, 3, 4].map((col) => <Block key={`g${col}`} kind="grass" x={420 + col * 110} y={1690} s={110} />)}
        <g transform="rotate(90 560 1690)">
          <Figure x={560} y={1690 - 335 * 0.62} scale={0.62} pose={POSE.spread} face="shocked" tint={TINT.hurt} shadow={false} />
        </g>
        <text x={560} y={1360} fontFamily="Silkscreen, monospace" fontSize={84} fill="#ffffff" stroke="#141414" strokeWidth={12} paintOrder="stroke">4</text>
        <text x={560} y={1450} fontFamily="Silkscreen, monospace" fontSize={60} fill="#ff4a3d" stroke="#141414" strokeWidth={10} paintOrder="stroke">blocks: dead</text>
      </svg>
      <Vignette w={W} h={H} />
      <Caption />
    </AbsoluteFill>
  );
};
