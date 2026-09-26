import React from "react";
import { AbsoluteFill, Audio, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { H, PANEL_TOP, W } from "../minecraft/beats";
import { ease, lerpPose, limb, POSE, pose, walkPose } from "../minecraft/figure";
import { loadMinecraftFonts } from "../minecraft/fonts";
import { Fireball, Ghast } from "../minecraft/mobs";
import { NetherPortal, NetherWorld, PortalBuildProgress } from "../minecraft/nether";
import { Item, Puff } from "../minecraft/pixels";
import { Steve, SteveMood } from "../minecraft/steve";
import { Overworld, OverworldProps } from "../minecraft/worlds";

/**
 * "First time going through a Nether portal" — 24 seconds, five scenes.
 *
 * Longer and more varied than the earlier Shorts on purpose: a different
 * setting (the Nether gets its own palette, its own light source, its own
 * mob), a real scene count instead of two labelled halves, and — like the
 * creeper Short — a POV band up top, the same white-band, three-line,
 * Selawik-set device measured off the reference. The small corner scene
 * tag stays underneath it as a documentary label for each of the five
 * scenes, since the POV line alone doesn't say which scene is which.
 */

export const NETHER_FRAMES = 720;
export const POV = ["POV: You built", "a Nether portal", "(it did not go well)"];
const BAND = 450;

/** the reference's POV band: white, top of frame, three centred lines. */
const PovBand: React.FC = () => (
  <div style={{ position: "absolute", left: 0, top: 0, width: W, height: BAND, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: "Selawik, 'Segoe UI', sans-serif", fontSize: 100, lineHeight: "104px", color: "#000", textAlign: "center", whiteSpace: "pre" }}>{POV.join("\n")}</div>
  </div>
);
const SHOT = {
  build: [0, 180],
  cross: [180, 210],
  arrive: [210, 420],
  chase: [420, 570],
  home: [570, 720],
} as const;

const useAbs = (shot: keyof typeof SHOT) => useCurrentFrame() + SHOT[shot][0];

/** the small corner caption every scene carries, low-key and documentary. */
const SceneTag: React.FC<{ text: string; sub?: string }> = ({ text, sub }) => (
  <div style={{ position: "absolute", left: 48, bottom: 64, display: "flex", flexDirection: "column", gap: 4 }}>
    <div style={{ background: "#141414", color: "#fff", fontFamily: "Selawik, sans-serif", fontSize: 34, fontWeight: 700, padding: "8px 22px", borderRadius: 999, letterSpacing: 1 }}>
      {text}
    </div>
    {sub && <div style={{ color: "#fff", fontFamily: "Selawik, sans-serif", fontSize: 24, textShadow: "0 2px 6px rgba(0,0,0,.6)", marginLeft: 8 }}>{sub}</div>}
  </div>
);

const GROUND = 1500;

/* ------------------------------------------------------------------ */
/* 1. build the portal, overworld, day                                 */
/* ------------------------------------------------------------------ */

const BuildShot: React.FC = () => {
  const f = useAbs("build");
  const blockAt = [10, 24, 38, 52, 66, 80, 96, 112, 128, 144];
  const count = blockAt.filter((b) => f >= b).length;
  const lit = interpolate(f, [150, 165], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const swing = (f % 14) / 14;
  const mining = f < 148;
  const armSwing = mining ? lerpPose(POSE.stand, pose({ armR: limb(80, -10, 30, -140) }), Math.sin(swing * Math.PI)) : POSE.chin;
  const mood: SteveMood = f >= 165 ? "joy" : f >= 148 ? "focus" : "plain";
  return (
    <g>
      <Overworld />
      <OverworldProps />
      <PortalBuildProgress x={760} y={GROUND} scale={0.95} count={count} />
      {count >= 10 && <NetherPortal x={760} y={GROUND} scale={0.95} lit={lit} t={f} />}
      <Steve x={520} y={GROUND - 250} scale={1.35} pose={armSwing} mood={mood} armsOverHead={mood === "joy"} hands={({ R }) => (mining ? <Item name="pickaxe" x={R[0] + 40} y={R[1] - 30} px={9} rotate={-20} /> : null)} />
      {mining && f % 14 > 9 && f % 14 < 12 && (
        <g fill="#3a2a24">
          {[0, 1, 2].map((i) => <rect key={i} x={700 + i * 20} y={GROUND - 320 + random(`bd${f}${i}`) * -40} width={12} height={12} />)}
        </g>
      )}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 2. stepping through: a hard flash cut                               */
/* ------------------------------------------------------------------ */

const CrossShot: React.FC = () => {
  const f = useAbs("cross");
  const t = (f - SHOT.cross[0]) / (SHOT.cross[1] - SHOT.cross[0]);
  const flash = t < 0.5 ? ease(f, SHOT.cross[0], SHOT.cross[0] + 15) : 1 - ease(f, SHOT.cross[0] + 15, SHOT.cross[1]);
  return (
    <g>
      {t < 0.5 ? (
        <>
          <Overworld />
          <OverworldProps />
          <NetherPortal x={760} y={GROUND} scale={0.95} lit={1} t={f + 165} />
          <Steve x={640} y={GROUND - 250} scale={1.35} pose={POSE.stand} mood="joy" />
        </>
      ) : (
        <NetherWorld t={f} />
      )}
      <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#e0c8ff" opacity={Math.max(0, flash)} />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 3. arrival: awe, then notices the ghast                             */
/* ------------------------------------------------------------------ */

const ArriveShot: React.FC = () => {
  const f = useAbs("arrive");
  const l = f - SHOT.arrive[0];
  const noticed = l >= 130;
  const mood: SteveMood = l < 40 ? "shocked" : l < 130 ? "happy" : "scream";
  const p = noticed ? POSE.headHold : l < 40 ? POSE.spread : POSE.chin;
  const ghastX = interpolate(l, [90, 200], [1300, 880], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bob = l / 12;
  return (
    <g>
      <NetherWorld t={f} pan={interpolate(l, [0, 210], [0, -70], { extrapolateRight: "clamp" })} />
      <Steve x={480} y={GROUND - 250} scale={1.3} pose={p} mood={mood} armsOverHead={l >= 40 && l < 130} tint={undefined} />
      {l >= 90 && <Ghast x={ghastX} y={720} scale={0.8} bob={bob} angry={noticed} />}
      {noticed && <text x={480 + 170} y={GROUND - 570} fontFamily="Silkscreen, monospace" fontSize={64} fill="#ffe08a" stroke="#141414" strokeWidth={6} paintOrder="stroke">!</text>}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 4. the chase                                                        */
/* ------------------------------------------------------------------ */

const ChaseShot: React.FC = () => {
  const f = useAbs("chase");
  const l = f - SHOT.chase[0];
  const charging = l < 40;
  const fired = l >= 40;
  const ballT = fired ? Math.min(1, (l - 40) / 22) : 0;
  const hit = ballT >= 0.95 && l < 66;
  const dodged = l >= 66;
  const running = dodged;
  const pixX = running ? 620 - (l - 66) * 5 : 620;
  const p = running ? walkPose(l / 5, 110, pose({ armL: limb(-90, 40, -140, -20), armR: limb(90, 40, 140, -20) }), false) : POSE.headHold;
  const mood: SteveMood = hit ? "hurt" : dodged ? "scream" : "shocked";
  const explosion = l >= 62 && l < 80;
  return (
    <g transform={`translate(${explosion ? (random(`shx${f}`) - 0.5) * 16 : 0} 0)`}>
      <NetherWorld t={f + 420} pan={-70 - Math.sin(l / 25) * 15} />
      <Ghast x={950} y={700} scale={0.85} bob={l / 12} angry charging={charging} />
      {fired && ballT < 1 && <Fireball x0={860} y0={720} x1={pixX + 40} y1={GROUND - 260} t={ballT} />}
      <g transform={running ? `rotate(-12 ${pixX} ${GROUND - 180})` : ""}>
        <Steve x={pixX} y={GROUND - 250} scale={1.3} pose={p} mood={mood} flip={running} />
      </g>
      {explosion && (
        <g>
          {[0, 1, 2, 3, 4].map((i) => <Puff key={i} x={pixX + 60 - i * 20 + random(`ex${f}${i}`) * 40} y={GROUND - 200 - (l - 62) * 14 - i * 10} r={40 - i * 4} opacity={Math.max(0, 1 - (l - 62) / 18)} />)}
          <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#ff8a2a" opacity={Math.max(0, 0.5 - (l - 62) / 18 * 0.5)} />
        </g>
      )}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* 5. home, dusk, relief                                                */
/* ------------------------------------------------------------------ */

const HomeShot: React.FC = () => {
  const f = useAbs("home");
  const l = f - SHOT.home[0];
  const stumble = l < 20;
  const p = stumble ? pose({ legL: limb(-70, 220, -40, 330), legR: limb(50, 210, 90, 330) }) : l < 60 ? POSE.headHold : POSE.cheeks;
  const mood: SteveMood = l < 20 ? "shocked" : l < 60 ? "worried" : "happy";
  return (
    <g>
      <Overworld />
      <OverworldProps />
      <NetherPortal x={760} y={GROUND} scale={0.95} lit={1} t={f + 720} />
      <g transform={stumble ? `rotate(8 640 ${GROUND - 180})` : ""}>
        <Steve x={640} y={GROUND - 250} scale={1.35} pose={p} mood={mood} armsOverHead={l >= 60} />
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ */

export const NetherShort: React.FC<{ audio?: string | null }> = ({ audio = null }) => {
  loadMinecraftFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#7fb7ff" }}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <Sequence from={SHOT.build[0]} durationInFrames={SHOT.build[1] - SHOT.build[0]} name="build">
        <AbsoluteFill>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
            <BuildShot />
          </svg>
          <SceneTag text="DAY 12" sub="finally enough obsidian" />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={SHOT.cross[0]} durationInFrames={SHOT.cross[1] - SHOT.cross[0]} name="cross">
        <AbsoluteFill>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
            <CrossShot />
          </svg>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={SHOT.arrive[0]} durationInFrames={SHOT.arrive[1] - SHOT.arrive[0]} name="arrive">
        <AbsoluteFill>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
            <ArriveShot />
          </svg>
          <SceneTag text="THE NETHER" sub="first time" />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={SHOT.chase[0]} durationInFrames={SHOT.chase[1] - SHOT.chase[0]} name="chase">
        <AbsoluteFill>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
            <ChaseShot />
          </svg>
          <SceneTag text="3 SECONDS LATER" />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={SHOT.home[0]} durationInFrames={SHOT.home[1] - SHOT.home[0]} name="home">
        <AbsoluteFill>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
            <HomeShot />
          </svg>
          <SceneTag text="HOME" sub="never going back. (going back tomorrow.)" />
        </AbsoluteFill>
      </Sequence>
      <PovBand />
    </AbsoluteFill>
  );
};

export const NetherThumb: React.FC = () => {
  loadMinecraftFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#2a1512" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <NetherWorld t={40} />
        <Ghast x={780} y={620} scale={0.95} bob={2} angry charging />
        <Steve x={340} y={GROUND - 280} scale={1.6} pose={POSE.headHold} mood="shocked" />
        <text x={540} y={220} textAnchor="middle" fontFamily="Silkscreen, monospace" fontSize={92} fill="#ffffff" stroke="#141414" strokeWidth={9} paintOrder="stroke">
          FIRST TIME
        </text>
        <text x={540} y={320} textAnchor="middle" fontFamily="Silkscreen, monospace" fontSize={92} fill="#ffe08a" stroke="#141414" strokeWidth={9} paintOrder="stroke">
          IN THE NETHER
        </text>
      </svg>
    </AbsoluteFill>
  );
};
