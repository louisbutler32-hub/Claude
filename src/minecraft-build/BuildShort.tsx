import React from "react";
import { AbsoluteFill, Audio, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { H, PANEL_TOP, W } from "../minecraft/beats";
import { ease, FaceKind, Figure, lerpPose, limb, POSE, pose } from "../minecraft/figure";
import { loadMinecraftFonts } from "../minecraft/fonts";
import { CreeperMob } from "../minecraft/mobs";
import { Item, Puff } from "../minecraft/pixels";
import { Overworld, OverworldProps } from "../minecraft/worlds";

/**
 * "Building the perfect house" — 30 seconds, five scenes across four days.
 *
 * A documentary build saga rather than a joke with an escalation: DAY 1
 * clears the plot, DAY 2 raises the walls, DAY 3 the roof goes on and he's
 * proud of it, NIGHT 1 a creeper he never saw takes half of it, DAY 4 he
 * surveys the wreck and picks the pickaxe back up. A running day-counter
 * chip (top-left) is the on-screen device — different from the caption
 * band and the POV line used elsewhere on the channel.
 */

export const BUILD_FRAMES = 900;
const SHOT = {
  foundation: [0, 180],
  walls: [180, 360],
  roof: [360, 480],
  night: [480, 720],
  morning: [720, 900],
} as const;

const useAbs = (shot: keyof typeof SHOT) => useCurrentFrame() + SHOT[shot][0];
const GROUND = 1500;
const HX = 700, WALL_W = 440, WALL_H = 380;

/** the day counter, a persistent corner device instead of a caption band. */
const DayChip: React.FC<{ label: string; sub?: string }> = ({ label, sub }) => (
  <div style={{ position: "absolute", left: 44, top: 64, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
    <div style={{ background: "#fff", color: "#141414", fontFamily: "Silkscreen, monospace", fontSize: 40, padding: "10px 26px", border: "5px solid #141414", borderRadius: 14 }}>
      {label}
    </div>
    {sub && (
      <div style={{ background: "#141414", color: "#fff", fontFamily: "Selawik, sans-serif", fontSize: 22, padding: "5px 16px", borderRadius: 8 }}>
        {sub}
      </div>
    )}
  </div>
);

/** Night sky: dark tint over the same field, a moon and a scatter of stars. */
const NightSky: React.FC<{ flash?: number }> = ({ flash = 0 }) => (
  <g>
    <rect x={0} y={PANEL_TOP} width={W} height={1170 - PANEL_TOP} fill="#0e1330" opacity={0.82} />
    <circle cx={860} cy={620} r={70} fill="#f2eecb" stroke="#141414" strokeWidth={8} />
    <circle cx={840} cy={600} r={16} fill="#d8d3ae" />
    <circle cx={880} cy={650} r={10} fill="#d8d3ae" />
    {Array.from({ length: 24 }, (_, i) => (
      <circle key={i} cx={40 + random(`st${i}`) * 1000} cy={430 + random(`sy${i}`) * 500} r={2 + random(`sr${i}`) * 2.5} fill="#fff" opacity={0.7 + random(`so${i}`) * 0.3} />
    ))}
    <rect x={0} y={1170} width={W} height={H - 1170} fill="#22331f" opacity={0.55} />
    {flash > 0 && <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#ffffff" opacity={flash} />}
  </g>
);

/**
 * The house itself, drawn from progress fractions so every scene is the
 * same structure at a different stage. `wallT` 0-1, `roofT` 0-1, `lit`
 * true for the window glow at night, `damage` 0-1 for the blown-out wall.
 */
const House: React.FC<{ wallT: number; roofT: number; lit?: boolean; damage?: number }> = ({ wallT, roofT, lit = false, damage = 0 }) => {
  const wallY = GROUND - WALL_H * wallT;
  const plankLight = "#c9a15a", plankDark = "#a67f3f", trim = "#7a5a2e";
  const doorW = 130, winW = 90, winH = 90;
  const holeSide = damage > 0.05;
  return (
    <g>
      {/* floor slab, always present once foundation starts */}
      <rect x={HX - WALL_W / 2 - 20} y={GROUND - 6} width={WALL_W + 40} height={26} fill="#8a8a86" stroke="#141414" strokeWidth={8} />
      {/* left wall */}
      <rect x={HX - WALL_W / 2} y={wallY} width={WALL_W / 2 - doorW / 2} height={GROUND - wallY} fill={plankLight} stroke="#141414" strokeWidth={9} />
      {wallT > 0.3 && <rect x={HX - WALL_W / 2 + 24} y={wallY + (GROUND - wallY) * 0.28} width={winW * 0.7} height={winH * 0.7} fill={lit ? "#ffe27a" : "#7fb7ff"} stroke="#141414" strokeWidth={7} />}
      {/* right wall (this side takes the hit) */}
      {!(holeSide && damage > 0.4) ? (
        <rect x={HX + doorW / 2} y={wallY} width={WALL_W / 2 - doorW / 2} height={GROUND - wallY} fill={plankLight} stroke="#141414" strokeWidth={9} opacity={holeSide ? 1 - damage * 0.7 : 1} />
      ) : (
        <path
          d={`M${HX + doorW / 2},${wallY} L${HX + WALL_W / 2},${wallY} L${HX + WALL_W / 2},${GROUND} L${HX + doorW / 2 + 60},${GROUND} L${HX + doorW / 2 + 90},${GROUND - 90} L${HX + doorW / 2 + 30},${GROUND - 140} L${HX + doorW / 2 + 100},${GROUND - 210} L${HX + doorW / 2},${GROUND - 180} Z`}
          fill={plankDark}
          stroke="#141414"
          strokeWidth={9}
          strokeLinejoin="round"
        />
      )}
      {wallT > 0.3 && !holeSide && <rect x={HX + WALL_W / 2 - 24 - winW * 0.7} y={wallY + (GROUND - wallY) * 0.28} width={winW * 0.7} height={winH * 0.7} fill={lit ? "#ffe27a" : "#7fb7ff"} stroke="#141414" strokeWidth={7} />}
      {/* the door gap between the walls, dark inside */}
      <rect x={HX - doorW / 2} y={GROUND - doorW * 1.4} width={doorW} height={doorW * 1.4} fill="#241a10" opacity={wallT > 0.15 ? 1 : 0} />
      {/* corner trim posts */}
      <rect x={HX - WALL_W / 2 - 6} y={wallY} width={16} height={GROUND - wallY} fill={trim} opacity={wallT} />
      {!holeSide && <rect x={HX + WALL_W / 2 - 10} y={wallY} width={16} height={GROUND - wallY} fill={trim} opacity={wallT} />}
      {/* roof */}
      {roofT > 0 && (
        <g opacity={roofT} transform={damage > 0.4 ? `rotate(${-8 * damage} ${HX} ${GROUND - WALL_H - 30}) translate(${damage * 26} ${damage * 18})` : ""}>
          <path
            d={`M${HX - WALL_W / 2 - 40},${GROUND - WALL_H} L${HX},${GROUND - WALL_H - 170} L${HX + WALL_W / 2 + 40},${GROUND - WALL_H} Z`}
            fill="#8a3a2e"
            stroke="#141414"
            strokeWidth={10}
            strokeLinejoin="round"
          />
          <path d={`M${HX - WALL_W / 2 - 40},${GROUND - WALL_H} h${WALL_W + 80}`} stroke="#5c241a" strokeWidth={6} />
        </g>
      )}
      {damage > 0.5 && (
        <g fill="#3a2a1a">
          <rect x={HX + 120} y={GROUND - 30} width={40} height={30} transform={`rotate(18 ${HX + 140} ${GROUND - 15})`} />
          <rect x={HX + 200} y={GROUND - 20} width={30} height={20} transform={`rotate(-10 ${HX + 215} ${GROUND - 10})`} />
          <rect x={HX + 60} y={GROUND - 16} width={26} height={16} />
        </g>
      )}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 1. foundation, day 1                                                 */
/* ------------------------------------------------------------------ */

const FoundationShot: React.FC = () => {
  const f = useAbs("foundation");
  const swing = (f % 16) / 16;
  const p = lerpPose(POSE.stand, pose({ armR: limb(80, -10, 30, -140) }), Math.sin(swing * Math.PI));
  const cleared = interpolate(f, [20, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <g>
      <Overworld />
      <OverworldProps pan={0} />
      <rect x={HX - WALL_W / 2 - 20} y={GROUND - 6} width={(WALL_W + 40) * cleared} height={26} fill="#8a8a86" stroke="#141414" strokeWidth={8} />
      <Figure x={480} y={GROUND - 250} scale={1.35} pose={p} face="thinking" hands={({ R }) => <Item name="pickaxe" x={R[0] + 40} y={R[1] - 30} px={9} rotate={-20} />} />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 2. walls, day 2                                                      */
/* ------------------------------------------------------------------ */

const WallsShot: React.FC = () => {
  const f = useAbs("walls");
  const wallT = ease(f, 10, 160);
  const mood: FaceKind = "plain";
  const p = f % 30 < 15 ? POSE.stand : pose({ armR: limb(80, -10, 30, -140) });
  return (
    <g>
      <Overworld />
      <OverworldProps />
      <House wallT={wallT} roofT={0} />
      <Figure x={420} y={GROUND - 250} scale={1.25} pose={p} face={mood} hands={({ R }) => <Item name="cobble" x={R[0] + 30} y={R[1] - 10} px={8} />} />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 3. roof, proud, day 3                                                */
/* ------------------------------------------------------------------ */

const RoofShot: React.FC = () => {
  const f = useAbs("roof");
  const roofT = ease(f, 0, 70);
  const proud = f >= 80;
  const p = proud ? POSE.cheeks : POSE.chin;
  const mood: FaceKind = proud ? "joy" : "happy";
  return (
    <g>
      <Overworld />
      <OverworldProps />
      <House wallT={1} roofT={roofT} />
      <Figure x={420} y={GROUND - 250} scale={1.3} pose={p} face={mood} armsOverHead={proud} />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 4. night, the creeper                                                */
/* ------------------------------------------------------------------ */

const NightShot: React.FC = () => {
  const f = useAbs("night");
  const l = f - SHOT.night[0];
  const admiring = l < 90;
  const creeperX = interpolate(l, [40, 150], [1300, HX + 260], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const swell = interpolate(l, [150, 195], [0, 0.65], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const boom = l >= 195;
  const flash = boom ? interpolate(l, [195, 199, 220], [1, 0.9, 0], { extrapolateRight: "clamp" }) : 0;
  const shake = swell > 0 && !boom ? (random(`nb${f}`) - 0.5) * swell * 14 : 0;
  const mood: FaceKind = boom ? "shocked" : l > 150 ? "worried" : "joy";
  const p = boom ? POSE.headHold : admiring ? POSE.cheeks : POSE.headHold;
  return (
    <g transform={`translate(${shake} 0)`}>
      <Overworld />
      <OverworldProps />
      <NightSky flash={flash} />
      <House wallT={1} roofT={1} lit />
      {l < 195 && <CreeperMob x={creeperX} y={GROUND - 200} scale={1.05} face="normal" walk={l / 4} swell={swell} flip />}
      {boom && l < 230 && [0, 1, 2, 3].map((i) => <Puff key={i} x={HX + 180 + i * 30} y={GROUND - 260 - (l - 195) * 10 - i * 16} r={44 - i * 4} opacity={Math.max(0, 1 - (l - 195) / 26)} />)}
      <Figure x={420} y={GROUND - 250} scale={1.3} pose={p} face={mood} armsOverHead={admiring} flip={l >= 150 && !boom} />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 5. morning, the wreck, day 4                                         */
/* ------------------------------------------------------------------ */

const MorningShot: React.FC = () => {
  const f = useAbs("morning");
  const l = f - SHOT.morning[0];
  const mood: FaceKind = l < 60 ? "worried" : l < 120 ? "meh" : "thinking";
  const p = l < 60 ? POSE.stand : l < 120 ? pose({ armR: limb(96, 96, 34, -22) }) : lerpPose(POSE.stand, pose({ armR: limb(80, -10, 30, -140) }), ease(l, 120, 150));
  return (
    <g>
      <Overworld />
      <OverworldProps />
      <House wallT={1} roofT={1} damage={0.75} />
      <Figure x={420} y={GROUND - 250} scale={1.3} pose={p} face={mood} armsOverHead={l >= 60 && l < 120} hands={({ R }) => (l >= 150 ? <Item name="pickaxe" x={R[0] + 40} y={R[1] - 30} px={9} rotate={-20} /> : null)} />
    </g>
  );
};

/* ------------------------------------------------------------------ */

export const BuildShort: React.FC<{ audio?: string | null }> = ({ audio = null }) => {
  loadMinecraftFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#7fb7ff" }}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <Sequence from={SHOT.foundation[0]} durationInFrames={SHOT.foundation[1] - SHOT.foundation[0]} name="foundation">
        <AbsoluteFill>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
            <FoundationShot />
          </svg>
          <DayChip label="DAY 1" sub="clearing the plot" />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={SHOT.walls[0]} durationInFrames={SHOT.walls[1] - SHOT.walls[0]} name="walls">
        <AbsoluteFill>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
            <WallsShot />
          </svg>
          <DayChip label="DAY 2" sub="walls going up" />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={SHOT.roof[0]} durationInFrames={SHOT.roof[1] - SHOT.roof[0]} name="roof">
        <AbsoluteFill>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
            <RoofShot />
          </svg>
          <DayChip label="DAY 3" sub="the perfect house" />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={SHOT.night[0]} durationInFrames={SHOT.night[1] - SHOT.night[0]} name="night">
        <AbsoluteFill>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
            <NightShot />
          </svg>
          <DayChip label="NIGHT 1" sub="he never checked outside" />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={SHOT.morning[0]} durationInFrames={SHOT.morning[1] - SHOT.morning[0]} name="morning">
        <AbsoluteFill>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
            <MorningShot />
          </svg>
          <DayChip label="DAY 4" sub="again, then" />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

export const BuildThumb: React.FC = () => {
  loadMinecraftFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#7fb7ff" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <Overworld />
        <OverworldProps />
        <NightSky />
        <House wallT={1} roofT={1} damage={0.6} lit />
        <CreeperMob x={HX + 220} y={GROUND - 200} scale={1.1} face="happy" walk={2} flip />
        <Figure x={420} y={GROUND - 250} scale={1.5} pose={pose({ armR: limb(96, 96, 34, -22) })} face="worried" />
        <text x={540} y={230} textAnchor="middle" fontFamily="Silkscreen, monospace" fontSize={90} fill="#ffffff" stroke="#141414" strokeWidth={9} paintOrder="stroke">
          4 DAYS
        </text>
        <text x={540} y={330} textAnchor="middle" fontFamily="Silkscreen, monospace" fontSize={74} fill="#ffe27a" stroke="#141414" strokeWidth={9} paintOrder="stroke">
          1 CREEPER
        </text>
      </svg>
    </AbsoluteFill>
  );
};
