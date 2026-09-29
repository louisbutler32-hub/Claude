import { noise2D } from "@remotion/noise";
import React from "react";
import { AbsoluteFill, Audio, random, staticFile, useCurrentFrame } from "remotion";
import { H, PANEL_TOP, W } from "../minecraft/beats";
import { ease, FaceKind, lerpPose, limb, Pose, pose, POSE, Pt, walkPose } from "../minecraft/figure";
import { loadMinecraftFonts } from "../minecraft/fonts";
import { HandDrawn } from "../minecraft/handdrawn";
import { Sword, Zombie } from "../minecraft/mobs";
import { Oofy, OofyTint, OOFY_TINT } from "../minecraft/oofy";
import { Caption, Hearts, Hotbar } from "../minecraft-fall/hud";
import B from "./beats.json";

/**
 * "Minecraft sleeping makes no sense" — 17 seconds, starring Oofy.
 *
 * Oofy is dead on his feet, climbs to his bed and right-clicks it:
 * "You may not rest now, there are monsters nearby." Out of the window, far
 * off, one zombie stands in a fenced pen. So he runs out into the night — a
 * long way, the camera pulling in as he closes on it — and beats it up. Back
 * home, he clicks the bed again. Same message. The camera tilts up: a spider
 * has been hanging over the bed the whole time.
 *
 * (Nothing far away stops you sleeping. The check is 8 blocks across and 5
 * up, which is what makes it so easy to miss what's on the ceiling.)
 */

export const SLEEP_FRAMES = B.frames;
export const SLEEP_CAPTION = ["When you try to sleep", "in Minecraft:"];

const LINE = "#2a1b3d";
const NIGHT: OofyTint = { ...OOFY_TINT.normal, skin: "#e9ecf9", hoodie: "#7550d8", pants: "#282f4a", shoe: "#dcdde8" };
const FLOOR = 1500;
const S = 1.0; // Oofy indoors
const MSG = "You may not rest now,|there are monsters nearby";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/* ------------------------------ poses ------------------------------ */

const TIRED = pose({ head: [12, -84], armL: limb(-72, 120, -60, 208), armR: limb(72, 120, 62, 208) });
const POINT = pose({ head: [6, -90], armR: limb(112, 50, 200, 76) });
const POINT_UP = pose({ head: [10, -92], armR: limb(112, 10, 196, -80) });
const RAISED = pose({ armR: limb(110, -34, 150, -150) });
const STRIKE = pose({ head: [22, -84], armR: limb(126, 70, 236, 116) });
const SLUMP = pose({ head: [4, -70], armL: limb(-64, 124, -54, 216), armR: limb(64, 124, 56, 216) });
const PROUD = pose({ armR: limb(110, -30, 156, -146), armL: limb(-70, 60, -100, 120) });

/* ----------------------------- the room ----------------------------- */

const Planks: React.FC<{ x: number; y: number; w: number; h: number; a: string; b: string; row?: number }> = ({ x, y, w, h, a, b, row = 110 }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={a} />
    {Array.from({ length: Math.ceil(h / row) }, (_, r) => (
      <g key={r}>
        <rect x={x} y={y + r * row} width={w} height={row - 6} fill={r % 2 ? a : b} opacity={0.55} />
        <path d={`M${x},${y + r * row + row - 3}H${x + w}`} stroke="#00000033" strokeWidth={6} />
        {Array.from({ length: Math.ceil(w / 300) }, (_, c) => (
          <path key={c} d={`M${x + ((c * 300 + (r % 2) * 150 + 90) % w)},${y + r * row}v${row - 6}`} stroke="#00000022" strokeWidth={5} />
        ))}
      </g>
    ))}
  </g>
);

const Stars: React.FC<{ x: number; y: number; w: number; h: number; seed: string; n?: number }> = ({ x, y, w, h, seed, n = 40 }) => (
  <g fill="#ffffff">
    {Array.from({ length: n }, (_, i) => (
      <rect key={i} x={x + random(`${seed}x${i}`) * w} y={y + random(`${seed}y${i}`) * h} width={6 + random(`${seed}s${i}`) * 6} height={6 + random(`${seed}s${i}`) * 6} opacity={0.4 + random(`${seed}o${i}`) * 0.5} />
    ))}
  </g>
);

const Fence: React.FC<{ x: number; y: number; n: number; gap: number; s: number }> = ({ x, y, n, gap, s }) => (
  <g stroke={LINE} strokeWidth={Math.max(2, 6 * s)} strokeLinejoin="round">
    <rect x={x} y={y - 50 * s} width={gap * (n - 1)} height={10 * s} fill="#8a6a3f" />
    <rect x={x} y={y - 26 * s} width={gap * (n - 1)} height={10 * s} fill="#8a6a3f" />
    {Array.from({ length: n }, (_, i) => (
      <rect key={i} x={x + i * gap - 8 * s} y={y - 66 * s} width={16 * s} height={66 * s} fill="#9c7a4a" />
    ))}
  </g>
);

const Room: React.FC<{ f: number; doorOpen: number; sun?: number }> = ({ f, doorOpen }) => (
  <g>
    <Planks x={-40} y={-1400} w={1160} h={2900} a="#5d4632" b="#54402d" />
    {/* the ceiling beam, and dark attic above it */}
    <rect x={-40} y={-1400} width={1160} height={1290} fill="#241b14" />
    <rect x={-40} y={-140} width={1160} height={44} fill="#3d2d20" stroke={LINE} strokeWidth={8} />
    {/* window onto the night: a zombie, far off, in his fenced pen */}
    <rect x={590} y={620} width={370} height={410} fill="#3b2a1d" stroke={LINE} strokeWidth={10} />
    <clipPath id="sleepWin"><rect x={614} y={644} width={322} height={362} /></clipPath>
    <g clipPath="url(#sleepWin)">
      <rect x={614} y={644} width={322} height={362} fill="#14265a" />
      <Stars x={614} y={644} w={322} h={230} seed="win" n={22} />
      <rect x={846} y={690} width={56} height={56} fill="#fff6d0" />
      <path d="M614,940 L690,918 L740,930 L800,910 L936,930 V1006 H614 Z" fill="#1f4128" />
      <rect x={614} y={968} width={322} height={38} fill="#26502f" />
      <Fence x={732} y={980} n={5} gap={18} s={0.3} />
      <Zombie x={772} y={936} scale={0.12} />
    </g>
    <path d="M775,620 V1030 M590,825 H960" stroke={LINE} strokeWidth={10} />
    {/* a lantern */}
    <circle cx={400} cy={830} r={190} fill="#ffb24a" opacity={0.10} />
    <circle cx={400} cy={830} r={110} fill="#ffb24a" opacity={0.14} />
    <path d="M400,600 V760" stroke={LINE} strokeWidth={7} />
    <rect x={368} y={760} width={64} height={80} rx={8} fill="#ffcf5a" stroke={LINE} strokeWidth={8} />
    {/* the floor */}
    <Planks x={-40} y={FLOOR} w={1160} h={500} a="#3c2d20" b="#34271b" row={90} />
    <path d={`M-40,${FLOOR}H1120`} stroke={LINE} strokeWidth={8} />
    {/* the door */}
    <rect x={56} y={1080} width={210} height={FLOOR - 1080} fill="#20160f" stroke={LINE} strokeWidth={10} />
    {doorOpen > 0.02 ? (
      <g>
        <rect x={74} y={1098} width={174} height={FLOOR - 1098} fill="#0d1a3d" />
        <Stars x={74} y={1098} w={174} h={200} seed="dr" n={6} />
        <rect x={74} y={1098} width={lerp(174, 26, doorOpen)} height={FLOOR - 1098} fill="#6b4a2a" stroke={LINE} strokeWidth={8} />
      </g>
    ) : (
      <g>
        <rect x={74} y={1098} width={174} height={FLOOR - 1098} fill="#6b4a2a" stroke={LINE} strokeWidth={8} />
        {[1230, 1360].map((y) => <path key={y} d={`M74,${y}H248`} stroke="#00000044" strokeWidth={6} />)}
        <circle cx={222} cy={1300} r={11} fill="#d9b25a" stroke={LINE} strokeWidth={5} />
      </g>
    )}
    {/* the bed */}
    <g stroke={LINE} strokeWidth={8} strokeLinejoin="round">
      <rect x={572} y={1466} width={34} height={40} fill="#6e4726" />
      <rect x={976} y={1466} width={34} height={40} fill="#6e4726" />
      <rect x={560} y={1398} width={450} height={78} fill="#8a5a34" />
      <rect x={545} y={1372} width={32} height={128} fill="#7a4d2b" />
      <rect x={994} y={1282} width={40} height={218} fill="#7a4d2b" />
      <rect x={572} y={1338} width={430} height={66} fill="#e9e3d8" />
      <rect x={572} y={1338} width={330} height={66} fill="#c93a36" />
      <path d="M600,1350 h250 M600,1376 h250" stroke="#a02b29" strokeWidth={6} />
      <rect x={898} y={1300} width={96} height={52} rx={10} fill="#f5f1e8" />
    </g>
  </g>
);

/* ------------------------------- the spider ------------------------------- */

const Spider: React.FC<{ f: number; look: Pt }> = ({ f, look }) => {
  const wave = f >= B.wave ? Math.sin((f - B.wave) * 0.9) * 26 : 0;
  // after the reveal he lowers himself down toward Oofy, on his thread
  const bob = Math.sin(f * 0.13) * 6 + ease(f, B.tilt[1] - 4, B.tilt[1] + 26) * 190;
  const leg = (sd: number, i: number) => {
    const y0 = -6 + i * 12, reach = 84 + i * 12, lift = (i === 0 && sd === 1 ? wave : 0);
    return <path key={`${sd}${i}`} d={`M${sd * 50},${y0} q${sd * (reach * 0.55)},${-44 - i * 6 - lift} ${sd * reach},${28 + i * 18 - lift * 2} l${sd * 8},${52 - lift}`} fill="none" stroke={LINE} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />;
  };
  return (
    <g transform={`translate(760 ${290 + bob})`}>
      <path d={`M0,${-410 - bob} V-30`} stroke="#ffffffaa" strokeWidth={4} transform={`translate(0 0)`} />
      {[-1, 1].map((sd) => [0, 1, 2, 3].map((i) => leg(sd, i)))}
      <ellipse rx={74} ry={56} fill="#33313b" stroke={LINE} strokeWidth={9} />
      <ellipse cx={0} cy={44} rx={52} ry={42} fill="#3e3b48" stroke={LINE} strokeWidth={9} />
      {[-22, 22].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={38} rx={17} ry={20} fill="#fff" stroke={LINE} strokeWidth={5} />
          <circle cx={x + look[0]} cy={42 + look[1]} r={9} fill="#d3212b" />
        </g>
      ))}
      {[-42, -30, 30, 42].map((x, i) => <circle key={i} cx={x} cy={14 + (i % 2) * 6} r={5} fill="#d3212b" />)}
      <path d="M-14,68 q14,10 28,0" stroke={LINE} strokeWidth={6} fill="none" strokeLinecap="round" />
    </g>
  );
};

/* ------------------------------- the outdoors ------------------------------- */

const PIVOT: Pt = [760, FLOOR];
const zoomAt = (f: number) => lerp(0.42, 1, ease(f, B.outdoor[0], B.runEnd));
const runX = (f: number) => lerp(-900, 330, ease(f, B.outdoor[0], B.runEnd));

const Outdoors: React.FC<{ f: number; hitPulse: number; zombieGone: boolean; hurt: number }> = ({ f, hitPulse, zombieGone, hurt }) => {
  const z = zoomAt(f);
  const t = f - B.poof;
  return (
    <g>
      <rect width={W} height={H} fill="#0e2050" />
      <rect y={PANEL_TOP} width={W} height={H} fill="#12296a" />
      <Stars x={0} y={PANEL_TOP} w={W} h={900} seed="out" n={60} />
      <rect x={130} y={520} width={70} height={70} fill="#fff6d0" />
      <g transform={`translate(${PIVOT[0]} ${PIVOT[1]}) scale(${z}) translate(${-PIVOT[0]} ${-PIVOT[1]})`}>
        {/* stepped hills */}
        <path d={`M-3000,${FLOOR - 150} H-1500 V${FLOOR - 250} H-800 V${FLOOR - 180} H0 V${FLOOR - 340} H700 V${FLOOR - 220} H1500 V${FLOOR - 300} H3000 V${FLOOR} H-3000 Z`} fill="#1c3f2e" />
        {[-1500, -700, 100, 1500].map((x) => (
          <g key={x}>
            <rect x={x} y={FLOOR - 460} width={40} height={140} fill="#4a3624" stroke={LINE} strokeWidth={6} />
            <rect x={x - 80} y={FLOOR - 620} width={200} height={170} fill="#245a30" stroke={LINE} strokeWidth={6} />
          </g>
        ))}
        <rect x={-3000} y={FLOOR} width={6000} height={90} fill="#2f6a3b" />
        <path d={`M-3000,${FLOOR}H3000`} stroke={LINE} strokeWidth={10} />
        <rect x={-3000} y={FLOOR + 90} width={6000} height={800} fill="#4a3624" />
        {/* the pen */}
        <Fence x={620} y={FLOOR} n={7} gap={44} s={1.1} />
        {!zombieGone && <Zombie x={760 + hitPulse * 16} y={FLOOR - 296} scale={1.3} flash={hurt > 0} />}
        {zombieGone && t < 14 && [0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={760 + Math.cos(i * 1.1) * t * 16 - 20} y={FLOOR - 220 + Math.sin(i * 1.7) * t * 12 - t * 6 - 20} width={40 * (1 - t / 16)} height={40 * (1 - t / 16)} fill="#ffffff" opacity={1 - t / 16} />
        ))}
      </g>
    </g>
  );
};

/* ------------------------------ assembly ------------------------------ */

/** the swing: 0 = at his side, 1 = sword raised, 2 = brought down */
const swing = (f: number) => {
  let a = 0;
  for (const h of B.hits) {
    const t = f - h;
    if (t >= -8 && t < -2) a = Math.max(a, ease(f, h - 8, h - 2));
    else if (t >= -2 && t < 0) a = Math.max(a, 1);
    else if (t >= 0 && t < 3) a = Math.max(a, 1 + ease(f, h, h + 3));
    else if (t >= 3 && t < 10) a = Math.max(a, 2 * (1 - ease(f, h + 3, h + 10)));
  }
  return a;
};

const ActionBar: React.FC<{ text: string; opacity: number }> = ({ text, opacity }) =>
  opacity <= 0.01 ? null : (
    <g opacity={opacity} fontFamily="Monocraft, monospace" fontSize={46} textAnchor="middle">
      {text.split("|").map((line, i) => (
        <g key={i}>
          <text x={544} y={1612 + i * 58} fill="#3a3a3a">{line}</text>
          <text x={540} y={1608 + i * 58} fill="#ffffff">{line}</text>
        </g>
      ))}
    </g>
  );

const fadeIn = (f: number, a: number, b: number) => clamp01(Math.min((f - a) / 3, (b - f) / 5));

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const { walkIn, click1, msgA, look, toDoor, outdoor, runEnd, hits, poof, room2, click2, msgB, slump, tilt } = B;
  const bounce = (a: number, b: number) => (f >= a && f < b ? Math.abs(Math.sin(f * 0.9)) * 6 : 0);
  // ------------ outdoors ------------
  if (f >= outdoor[0] && f < room2) {
    const z = zoomAt(f);
    const x = f < runEnd ? runX(f) : 330;
    const sw = swing(f);
    const hurt = hits.some((h) => f >= h && f < h + 3) ? 1 : 0;
    const hitPulse = hits.reduce((m, h) => (f >= h && f < h + 6 ? Math.max(m, Math.exp(-(f - h) / 2)) : m), 0);
    const running = f < runEnd;
    let p: Pose = running ? walkPose(x / 110, 84, RAISED, false) : lerpPose(TIRED, RAISED, 0);
    if (!running) p = sw <= 1 ? lerpPose(TIRED, RAISED, sw) : lerpPose(RAISED, STRIKE, sw - 1);
    if (f >= poof + 4) p = lerpPose(TIRED, PROUD, ease(f, poof + 4, poof + 9));
    const face: FaceKind = f >= poof + 4 ? "joy" : running ? "gritted" : "gritted";
    const s = 1;
    const sx = PIVOT[0] + (x - PIVOT[0]) * z, sy = PIVOT[1];
    return (
      <g>
        <Outdoors f={f} hitPulse={hitPulse} zombieGone={f >= poof} hurt={hurt} />
        <Oofy
          x={sx} y={sy - 335 * s * z + (running ? -Math.abs(Math.sin(x / 55)) * 16 * z : 0)} scale={s * z} pose={p} face={face} tint={NIGHT} shadow={false}
          look={[6, 0]}
          hands={({ R }) => (f < poof + 4 ? <Sword x={R[0] + 20} y={R[1] - 74} px={11} rotate={lerp(4, -46, Math.min(sw, 1)) + Math.max(0, sw - 1) * 130} /> : null)}
        />
      </g>
    );
  }
  // ------------ indoors ------------
  const doorOpen = f >= toDoor[0] + 8 && f < outdoor[0] ? 1 : 0;
  const panY = f >= tilt[0] ? lerp(0, 440, ease(f, tilt[0], tilt[1])) : 0;
  let x = 430, p: Pose = POSE.stand, face: FaceKind = "meh", flip = false, gaze: Pt = [0, 4];
  if (f < walkIn[1]) {
    x = lerp(-140, 430, f / walkIn[1]);
    p = walkPose(x / 120, 36, TIRED, true);
    p = { ...p, head: [p.head[0] + 6, p.head[1] + 12] };
    face = f >= B.yawn[0] && f < B.yawn[1] ? "scream" : "meh";
    gaze = [8, 12];
  } else if (f < look[0]) {
    p = TIRED;
    if (f >= click1 - 4) p = lerpPose(TIRED, POINT, ease(f, click1 - 4, click1));
    if (f >= click1 + 10) p = lerpPose(POINT, TIRED, ease(f, click1 + 10, click1 + 16));
    face = f >= click1 ? "shocked" : "meh";
    gaze = [16, 10];
  } else if (f < toDoor[0]) {
    p = lerpPose(TIRED, POINT_UP, ease(f, look[0] + 8, look[0] + 14));
    face = "worried";
    gaze = [22, -14];
  } else if (f < outdoor[0]) {
    const t = clamp01((f - toDoor[0]) / (toDoor[1] - toDoor[0]));
    x = lerp(430, 150, t);
    flip = true;
    p = walkPose(f * 0.11, 70, TIRED, false);
    face = "gritted";
    gaze = [-8, 0];
  } else {
    // back at the bed
    x = 430;
    face = f < click2 - 20 ? "joy" : f < click2 ? "smile" : f < slump ? "shocked" : f < tilt[0] + 14 ? "hurt" : "shocked";
    p = f < click2 - 20 ? PROUD : TIRED;
    if (f >= click2 - 20 && f < click2 - 4) p = lerpPose(PROUD, TIRED, ease(f, click2 - 20, click2 - 10));
    if (f >= click2 - 4) p = lerpPose(TIRED, POINT, ease(f, click2 - 4, click2));
    if (f >= click2 + 10) p = lerpPose(POINT, SLUMP, ease(f, click2 + 10, slump + 8));
    gaze = f >= tilt[0] + 20 ? [0, -26] : [16, 8];
  }
  const msg = Math.max(fadeIn(f, msgA[0], msgA[1]), fadeIn(f, msgB[0], msgB[1]));
  const walking = (f < walkIn[1] && f > 0) || (f >= toDoor[0] && f < outdoor[0]);
  return (
    <g>
      <g transform={`translate(0 ${panY})`}>
        <Room f={f} doorOpen={doorOpen} />
        <Spider f={f} look={[0, 6]} />
        {x > -60 && (
          <Oofy
            x={x} y={FLOOR - 335 * S - (walking ? bounce(0, 999) : 0)} scale={S} pose={p} face={face} tint={NIGHT} shadow={false} flip={flip}
            faceOffset={gaze} look={[gaze[0] * 0.15, gaze[1] * 0.15]}
          />
        )}
      </g>
      <ActionBarHost msg={msg} />
    </g>
  );
};

/** the action bar belongs to the game UI, so it is drawn outside the wobbling world (see SleepShort) */
const ActionBarHost: React.FC<{ msg: number }> = () => null;

export const SleepShort: React.FC<{ audio?: string | null; drawn?: boolean }> = ({ audio = null, drawn = true }) => {
  loadMinecraftFonts();
  const f = useCurrentFrame();
  const msg = Math.max(fadeIn(f, B.msgA[0], B.msgA[1]), fadeIn(f, B.msgB[0], B.msgB[1]));
  return (
    <AbsoluteFill style={{ backgroundColor: "#0e2050" }}>
      <HandDrawn enabled={drawn} hold={1} boilEvery={2} boil={0.75} grain={0.3}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <clipPath id="sleepPanel"><rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} /></clipPath>
          </defs>
          <g clipPath="url(#sleepPanel)"><Scene f={f} /></g>
        </svg>
      </HandDrawn>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <ActionBar text={MSG} opacity={msg} />
        <Hearts x={126} y={1738} hp={20} frame={f} />
        <Hotbar y={1806} items={["pickaxe", "bread", null, null, null, null, null, null, null]} selected={0} />
      </svg>
      <Caption lines={SLEEP_CAPTION} />
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

export const SleepThumb: React.FC = () => {
  loadMinecraftFonts();
  const f = B.tilt[1] - 8; // the reveal: Oofy looking up at the spider, message still on screen
  return (
    <AbsoluteFill style={{ backgroundColor: "#0e2050" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="sleepPanelT"><rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} /></clipPath>
        </defs>
        <g clipPath="url(#sleepPanelT)"><Scene f={f} /></g>
        <Hearts x={126} y={1738} hp={20} frame={f} />
        <Hotbar y={1806} items={["pickaxe", "bread", null, null, null, null, null, null, null]} selected={0} />
      </svg>
      <Caption lines={SLEEP_CAPTION} />
    </AbsoluteFill>
  );
};
