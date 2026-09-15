import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { EV, SHOT } from "./beats";
import { ease, FaceKind, Figure, lerpPose, limb, Pose, POSE, pose, TINT, walkPose, withLegs } from "./figure";
import { Creeper, Item, ItemName, Puff, SpiderEyes, Torch } from "./pixels";
import {
  Aerial,
  CaveCloseup,
  CaveWide,
  DarkRoom,
  House,
  LavaLake,
  ObsidianSlab,
  Overworld,
  OverworldProps,
  TorchCave,
  Tunnel,
} from "./worlds";

/**
 * One component per shot. Each runs inside a Sequence, so the local frame
 * starts at 0; `abs` is the frame number in the whole video, which is what
 * the event sheet in beats.ts is written in.
 */

const useAbs = (shot: keyof typeof SHOT) => useCurrentFrame() + SHOT[shot][0];

/** where the stuff lands in the death shot */
const DEATH_PILE: { name: ItemName; x: number; y: number; rot: number }[] = [
  { name: "cobble", x: 275, y: 1185, rot: 0 },
  { name: "pickaxe", x: 270, y: 1460, rot: 10 },
  { name: "goldIngot", x: 440, y: 1425, rot: -8 },
  { name: "goldApple", x: 540, y: 1250, rot: 0 },
  { name: "bread", x: 630, y: 1445, rot: -20 },
  { name: "bucket", x: 705, y: 1370, rot: 0 },
  { name: "redstone", x: 780, y: 1125, rot: 0 },
  { name: "ironIngot", x: 895, y: 1470, rot: -12 },
];

/** where it lies in the finale */
const FINALE_PILE: { name: ItemName; x: number; y: number; rot: number }[] = [
  { name: "cobble", x: 135, y: 1445, rot: 0 },
  { name: "pickaxe", x: 240, y: 1545, rot: 8 },
  { name: "goldIngot", x: 400, y: 1490, rot: -8 },
  { name: "goldApple", x: 500, y: 1410, rot: 0 },
  { name: "bread", x: 570, y: 1530, rot: -22 },
  { name: "bucket", x: 685, y: 1395, rot: 0 },
  { name: "redstone", x: 840, y: 1425, rot: 0 },
  { name: "ironIngot", x: 940, y: 1515, rot: -12 },
];

/* ------------------------------------------------------------------ */
/* 1. the creeper                                                      */
/* ------------------------------------------------------------------ */

export const DeathShot: React.FC = () => {
  const f = useAbs("death");
  const boom = f >= EV.explosion;
  // the body: mining, then flung to the left and down, then gone
  const fly = ease(f, EV.explosion, EV.explosion + 3);
  const nx = interpolate(fly, [0, 1], [610, 70]);
  const ny = interpolate(fly, [0, 1], [958, 1330]) - Math.sin(fly * Math.PI) * 140;
  const rot = interpolate(fly, [0, 1], [0, -86]);
  const bodyPose = boom ? lerpPose(POSE.mine, POSE.spread, fly) : POSE.mine;
  const creeperX = interpolate(f, [0, EV.creeperIn], [1000, 795], { extrapolateRight: "clamp" });
  return (
    <g>
      <CaveWide />
      <Creeper x={creeperX} y={1064} />
      {boom &&
        DEATH_PILE.map((it, i) => {
          const t = ease(f, EV.explosion, EV.landed - 2 - (i % 3));
          const x = interpolate(t, [0, 1], [610, it.x]);
          const y = interpolate(t, [0, 1], [1100, it.y]) - Math.sin(t * Math.PI) * (70 + (i % 4) * 25);
          return <Item key={it.name} name={it.name} x={x} y={y} px={11} rotate={it.rot + (1 - t) * 40 * (i % 2 ? 1 : -1)} />;
        })}
      {f < EV.bodyGone && (
        <g transform={`rotate(${rot} ${nx} ${ny})`}>
          <Figure
            x={nx}
            y={ny}
            pose={bodyPose}
            face={boom ? "hurt" : "plain"}
            tint={boom ? TINT.hurt : TINT.normal}
            hands={({ R }) =>
              !boom ? <Item name="pickaxe" x={R[0] + 56} y={R[1] - 44} px={10} rotate={-10} /> : null
            }
          />
        </g>
      )}
      {/* the explosion's own smoke */}
      {boom &&
        [
          [700, 1000, 60],
          [640, 1120, 44],
          [760, 1140, 50],
        ].map(([x, y, r], i) => {
          const t = interpolate(f, [EV.explosion, EV.explosion + 6], [0, 1], { extrapolateRight: "clamp" });
          return <Puff key={i} x={x - t * 60 * (i - 1)} y={y - t * 120} r={r * (1 - t)} opacity={1 - t} />;
        })}
      {/* the body despawns into puffs */}
      {f >= EV.bodyGone &&
        [
          [140, 920, 26],
          [210, 905, 28],
          [200, 1030, 30],
          [150, 1090, 26],
          [420, 1080, 28],
          [300, 1150, 34],
          [370, 1160, 52],
          [240, 1220, 30],
        ].map(([x, y, r], i) => {
          const t = interpolate(f, [EV.bodyGone, EV.bodyGone + 6], [0, 1], { extrapolateRight: "clamp" });
          return <Puff key={i} x={x} y={y - t * 90 - i * 4} r={r * (1 - t * 0.6)} opacity={1 - t * 0.9} />;
        })}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 2. respawn                                                          */
/* ------------------------------------------------------------------ */

type Beat = { at: number; face: FaceKind; arms?: "spread" | "down" | "chin" | "chinL" | "open"; walk?: boolean; look?: readonly [number, number] };

/** what the face and arms do, by absolute frame */
const OVERWORLD_BEATS: Beat[] = [
  { at: 19, face: "worried", arms: "spread" },
  { at: 28, face: "gritted", arms: "spread" },
  { at: 34, face: "content", arms: "chin", walk: true },
  { at: 41, face: "smile", arms: "down", walk: true },
  { at: 46, face: "joy", arms: "open", walk: true },
  { at: 58, face: "happy", arms: "down", walk: true },
  { at: 65, face: "whistle", arms: "down", walk: true, look: [0, -6] },
  { at: 70, face: "joy", arms: "chin" },
  { at: 80, face: "joy", arms: "open", walk: true },
  { at: 90, face: "sly", arms: "open", walk: true },
  { at: 95, face: "whistle", arms: "down", walk: true, look: [4, -6] },
  { at: 103, face: "sly", arms: "down", walk: true },
  { at: 109, face: "whistle", arms: "down", walk: true, look: [-4, -6] },
  { at: 114, face: "sly", arms: "chin" },
  { at: 122, face: "surprised", arms: "down", look: [0, -8] },
  { at: 126, face: "worried", arms: "down" },
  { at: 130, face: "worried", arms: "chinL" },
  { at: 138, face: "gritted", arms: "down" },
];

const beatAt = (f: number) => {
  let cur = OVERWORLD_BEATS[0];
  for (const b of OVERWORLD_BEATS) if (f >= b.at) cur = b;
  return cur;
};

const armsFor = (kind: Beat["arms"]): Pose => {
  switch (kind) {
    case "spread":
      return POSE.spread;
    case "chin":
      return POSE.chin;
    case "chinL":
      return POSE.chinL;
    case "open":
      return pose({ armL: limb(-130, 60, -200, 110), armR: limb(130, 60, 200, 110) });
    default:
      return POSE.stand;
  }
};

export const OverworldShot: React.FC = () => {
  const f = useAbs("overworld");
  const b = beatAt(f);
  // how far he has walked: the ground pans by this much
  let walked = 0;
  for (let k = EV.respawn; k < f; k++) if (beatAt(k).walk) walked += 6;
  const pan = -walked;
  const phase = walked / 110;
  const base = armsFor(b.arms);
  const walking = b.walk === true;
  const p = withLegs(walking ? walkPose(phase, 90, base, b.arms === "down") : base, 0.82);
  const x = interpolate(f, [19, 45, 70, 100, 120, 146], [560, 620, 500, 640, 560, 560], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(f, [19, 60, 85, 110, 146], [1.8, 1.7, 2.1, 1.8, 1.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bob = walking ? Math.abs(Math.sin(phase * Math.PI * 2)) * 14 : 0;
  const y = 1105 - bob * scale;
  const pop = interpolate(f, [EV.respawn, EV.respawn + 3], [0.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <g>
      <Overworld pan={pan} />
      <OverworldProps pan={pan} />
      {f >= EV.respawn && (
        <Figure x={x} y={y} scale={scale * pop} pose={p} face={b.face} look={b.look ?? [0, 0]} armsOverHead={b.arms === "chin" || b.arms === "chinL"} tilt={walking ? Math.sin(phase * Math.PI * 2) * 3 : 0} />
      )}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 3. the map                                                          */
/* ------------------------------------------------------------------ */

export const AerialShot: React.FC = () => {
  const f = useAbs("aerial");
  const l = f - SHOT.aerial[0];
  const x = 600 + l * 1.4;
  const y = 1180 - l * 0.9;
  return (
    <g>
      <Aerial />
      <Figure x={x} y={y} scale={0.3} pose={walkPose(l / 9, 70, POSE.scratch, false)} face="back" lineWidth={2.3} />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 4. the cave mouth                                                   */
/* ------------------------------------------------------------------ */

const TunnelFloor: React.FC = () => (
  <g>
    <path d="M100,1330 H1010 L880,1470 H250 Z" fill="#6d6d6d" />
    <path d="M250,1470 H880 L1080,1620 V1920 H0 V1620 Z" fill="#454545" />
    <g fill="none" stroke="#000" strokeWidth={10} strokeLinejoin="round" strokeLinecap="round">
      <path d="M100,1330 H1010" />
      <path d="M250,1470 H880 L1080,1620 M250,1470 L0,1620" />
      <path d="M0,1780 L250,1700 M1080,1780 L880,1700" opacity={0.5} />
    </g>
  </g>
);

export const TunnelShot: React.FC = () => {
  const f = useAbs("tunnel");
  const l = f - SHOT.tunnel[0];
  const step = ease(f, SHOT.tunnel[0] + 8, SHOT.tunnel[1]);
  return (
    <g>
      <Tunnel />
      <Figure
        x={185 + step * 40}
        y={1288 + Math.abs(Math.sin(l / 3)) * step * 6}
        scale={0.76}
        pose={step > 0 ? walkPose(l / 10, 50, POSE.stand, false) : POSE.stand}
        face={l < 12 ? "worried" : "plain"}
        tint={TINT.shade}
        look={[4, 0]}
      />
      <TunnelFloor />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 5. the dark room                                                    */
/* ------------------------------------------------------------------ */

export const DarkRoomShot: React.FC<{ signText: string }> = ({ signText }) => {
  const f = useAbs("darkRoom");
  const l = f - SHOT.darkRoom[0];
  const tap = Math.sin(l / 2.2) * 5;
  const p = pose({ armR: limb(96, 96, 34, -22 + tap) });
  return (
    <g>
      <DarkRoom signText={signText} />
      <Figure x={675} y={1110 + Math.sin(l / 9) * 3} scale={0.92} pose={p} face="worried" tint={TINT.dim} look={[-4 + Math.sin(l / 7) * 4, 0]} armsOverHead tilt={-4} />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 6. lava                                                             */
/* ------------------------------------------------------------------ */

export const LavaShot: React.FC = () => {
  const f = useAbs("lava");
  const l = f - SHOT.lava[0];
  const drift = l * 1.1;
  const bobY = Math.sin(l / 6) * 5;
  const crouch = pose({
    head: [0, -96],
    legL: limb(-118, 34, -78, 84),
    legR: limb(118, 34, 78, 84),
    armL: limb(-136, 54, -122, 36),
    armR: limb(28, 96, -104, 44),
  });
  const look: readonly [number, number] = [Math.sin(l / 5) * 6, 0];
  return (
    <g>
      <LavaLake t={l} />
      <ObsidianSlab x={270 + drift} y={1190 + bobY} />
      <Figure
        x={640 + drift}
        y={1120 + bobY}
        scale={1.5}
        pose={crouch}
        face="scheming"
        tint={TINT.lava}
        look={look}
        hands={() => (
          <g fill="none" stroke="#000" strokeWidth={9} strokeLinecap="round">
            <path d="M-122,36 l-22,-14 M-118,42 l-26,-2 M-114,50 l-22,12 M-104,44 l-4,-24" />
          </g>
        )}
      />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 7. torchlight                                                       */
/* ------------------------------------------------------------------ */

const EYES: { x: number; y: number; at: number; rot: number }[] = [
  { x: 235, y: 640, at: EV.eyesA, rot: -8 },
  { x: 560, y: 540, at: EV.eyesB, rot: 6 },
  { x: 880, y: 620, at: EV.eyesC, rot: -5 },
  { x: 540, y: 730, at: EV.eyesD, rot: 4 },
];

export const TorchShot: React.FC = () => {
  const f = useAbs("torch");
  const l = f - SHOT.torch[0];
  const leave = Math.max(0, f - EV.leaveTorch);
  const nx = 920 + leave * leave * 80;
  const light = interpolate(f, [EV.torchOut, EV.torchOut + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const armL = limb(-110, 40 + Math.sin(l / 4) * 2, -150, -17 + Math.sin(l / 4) * 3);
  const p = pose({ armL });
  const hand: readonly [number, number] = [Math.min(nx, 920) + armL[1][0] * 3.8 + leave * 120, 1685 + armL[1][1] * 3.8];
  return (
    <g>
      <TorchCave light={light} lx={hand[0] - 30} ly={hand[1] - 330} />
      {EYES.map((e, i) => {
        const o = interpolate(f, [e.at, e.at + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return o > 0 ? <SpiderEyes key={i} x={e.x} y={e.y} px={21} rotate={e.rot} opacity={o} /> : null;
      })}
      {nx < 1600 && (
        <Figure x={nx} y={1685} scale={3.8} pose={p} face="crying" tint={TINT.warm} tilt={-4} lineWidth={0.8} faceOffset={[-38, -6]} />
      )}
      {hand[0] < 1300 && (
        <>
          <path d={`M${Math.min(nx, 920) - 170},1750 L${hand[0] + 40},${hand[1] + 40}`} stroke="#000" strokeWidth={66} strokeLinecap="round" opacity={nx > 920 ? 1 : 0} />
          <Torch x={hand[0] - 30} y={hand[1] - 170} scale={1.25} tilt={-12} />
        </>
      )}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 8. home                                                             */
/* ------------------------------------------------------------------ */

export const HouseShot: React.FC<{ signText: string }> = ({ signText }) => {
  const f = useAbs("house");
  const l = f - SHOT.house[0];
  const face: FaceKind = f < EV.houseGrin ? "surprised" : f < EV.houseMeh ? "grin" : "meh";
  const lift = f >= EV.houseGrin && f < EV.houseMeh ? Math.sin((f - EV.houseGrin) / 2.5) * 6 : 0;
  const p = pose({ armL: limb(-120, 70 - lift, -139, -lift), armR: limb(112, 84 - lift, 136, 36 - lift) });
  return (
    <g>
      <House signText={signText} />
      <Figure
        x={420}
        y={1150 + Math.sin(l / 8) * 2}
        scale={1.4}
        pose={p}
        face={face}
        tint={TINT.house}
        look={face === "surprised" ? [-4, -4] : [0, 0]}
        hands={({ L, R }) => (
          <>
            <Item name="goldApple" x={L[0] - 8} y={L[1] - 8} px={9} />
            <Item name="ironIngot" x={R[0] + 10} y={R[1] - 4} px={8} rotate={-12} />
          </>
        )}
      />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 9. the close-up                                                     */
/* ------------------------------------------------------------------ */

export const CloseupShot: React.FC = () => {
  const f = useAbs("closeup");
  const l = f - SHOT.closeup[0];
  const p = pose({ armR: limb(110, 60, 39, -34 + Math.sin(l / 3) * 2) });
  return (
    <g>
      <CaveCloseup />
      <Figure
        x={575}
        y={1685 + Math.sin(l / 7) * 4}
        scale={3.7}
        pose={p}
        face="thinking"
        look={[-2 + Math.sin(l / 6) * 3, 0]}
        armsOverHead
        lineWidth={0.85}
        hands={({ R }) => (
          <g fill="none" stroke="#000" strokeWidth={16} strokeLinecap="round" transform={`translate(${R[0]} ${R[1]})`}>
            <path d="M0,0 l26,-8 M4,8 l30,2 M2,16 l24,12" />
          </g>
        )}
      />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 10. it's all still there                                            */
/* ------------------------------------------------------------------ */

export const FinaleShot: React.FC = () => {
  const f = useAbs("finale");
  const l = f - SHOT.finale[0];
  // camera pulls back from the close framing to the wide one
  const t = ease(f, SHOT.finale[0], EV.pullBackEnd);
  const s = interpolate(t, [0, 1], [1.75, 1]);
  const ax = interpolate(t, [0, 1], [480, 715]);
  const ay = interpolate(t, [0, 1], [1130, 1030]);

  let p: Pose = POSE.chin;
  let face: FaceKind = "side";
  let armsOverHead = false;
  let dx = 0;
  let dy = 0;
  let tilt = 0;
  let nx = 715;
  let pick: "none" | "floor" | "hand" = f < EV.despawn ? "floor" : "none";

  if (f < EV.joyFace) {
    p = POSE.chin;
    face = "side";
    armsOverHead = true;
  } else if (f < EV.wiggleEnd) {
    const k = ease(f, EV.joyFace, EV.joyFace + 3);
    p = lerpPose(POSE.chin, POSE.cheeks, k);
    face = "joy";
    armsOverHead = true;
    tilt = Math.sin(l * 0.9) * 7 * k;
    dx = Math.sin(l * 0.9) * 8 * k;
  } else if (f < EV.danceStart) {
    p = POSE.cheeks;
    face = "happy";
    armsOverHead = true;
  } else if (f < EV.despawn) {
    const d = f - EV.danceStart;
    const beat = Math.floor(d / 6) % 4;
    const target = beat === 0 ? POSE.up : beat === 1 ? POSE.upR : beat === 2 ? POSE.up : POSE.upL;
    const prev = beat === 0 ? POSE.upL : beat === 1 ? POSE.up : beat === 2 ? POSE.upR : POSE.up;
    p = lerpPose(prev, target, ease(d % 6, 0, 4));
    dy = -Math.abs(Math.sin((d / 6) * Math.PI)) * 44;
    face = beat % 2 === 0 ? "back" : "sideOpen";
    tilt = beat % 2 === 0 ? -6 : 8;
  } else if (f < EV.scratch) {
    p = POSE.stand;
    face = "side";
  } else if (f < EV.gasp) {
    p = lerpPose(POSE.stand, POSE.scratch, ease(f, EV.scratch, EV.scratch + 2));
    face = "side";
  } else if (f < EV.handsOnHead) {
    p = lerpPose(POSE.scratch, POSE.headHold, ease(f, EV.gasp, EV.gasp + 6));
    face = "sideOpen";
    tilt = -8;
  } else if (f < EV.scream) {
    p = POSE.headHold;
    face = "shocked";
    dx = Math.sin(l * 2.1) * 3;
  } else if (f < EV.frown) {
    const k = ease(f, EV.scream, EV.scream + 3);
    p = lerpPose(POSE.headHold, POSE.out, k);
    face = "scream";
    dx = Math.sin(l * 2.6) * 7 * k;
    dy = Math.sin(l * 1.9) * 5 * k;
    tilt = Math.sin(l * 1.3) * 5 * k;
  } else if (f < EV.deadpan) {
    p = lerpPose(POSE.out, POSE.stand, ease(f, EV.frown, EV.frown + 3));
    face = "meh";
  } else if (f < EV.pickHeld) {
    const k = ease(f, EV.pickUp, EV.pickUp + 2);
    const back = ease(f, EV.pickHeld - 3, EV.pickHeld);
    p = lerpPose(lerpPose(POSE.stand, POSE.reach, k), POSE.holdPick, back);
    face = "meh";
    nx = 715 - 75 * k;
    pick = f >= EV.pickUp + 1 ? "hand" : "none";
  } else if (f < EV.pickRaised) {
    p = POSE.holdPick;
    face = "meh";
    nx = 640;
    pick = "hand";
  } else {
    const k = ease(f, EV.pickRaised, EV.pickRaised + 5);
    p = lerpPose(POSE.holdPick, POSE.mine, k);
    face = f > EV.pickRaised + 5 ? "plain" : "meh";
    nx = 640;
    pick = "hand";
  }

  return (
    <g transform={`translate(${ax - 715 * s} ${ay - 1030 * s}) scale(${s})`}>
      <CaveWide />
      {pick === "floor" && FINALE_PILE.map((it) => <Item key={it.name} name={it.name} x={it.x} y={it.y} px={11} rotate={it.rot} />)}
      <Figure
        x={nx + dx}
        y={1030 + dy}
        pose={p}
        face={face}
        armsOverHead={armsOverHead}
        tilt={tilt}
        look={face === "shocked" ? [0, 4] : [0, 0]}
        hands={({ R }) => (pick === "hand" ? <Item name="pickaxe" x={R[0] + 56} y={R[1] - 44} px={10} rotate={-10} /> : null)}
      />
    </g>
  );
};
