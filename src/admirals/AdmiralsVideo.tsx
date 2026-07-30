import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  AssetSlot,
  Embers,
  Grain,
  HakiAura,
  KenBurnsBg,
  NarratorScene,
  SpeechBubble,
} from "../whatif/components";
import {
  ChapterCard,
  ClipSlot,
  Crosshairs,
  CutoutFull,
  ImpactWord,
  NewspaperSpin,
  StatGauge,
  SynergyTriangle,
  TextPin,
} from "./parts";
import { ABILITY_EFFECTS, MagmaBurst, IceSpread, LightDash } from "./effects";
import {
  TargetHeader,
  TargetMap,
  TripleAssault,
  EnemyShatter,
  QuakeCracks,
  BlackbeardVortex,
  VictorySilhouette,
  FinaleCard,
  Enemy,
} from "./part2";

// "What if the 3 Admirals became pirates?" — full 0:00–3:20 per blueprint.
// Style toolkit: fast cuts, saturation boost on hype shots, colored
// flash frames per admiral (red/cyan/yellow), cutouts always slide in
// over a background, never sit on plain black.
//
// FOOTAGE: every place a licensed anime clip belongs is a ClipSlot. Drop a
// file into public/assets/clips/<id>.mp4 and register it in CLIPS below;
// until then the slot shows a labeled marker. Nothing here bakes in footage
// the editor hasn't supplied.

export const ADMIRALS_DURATION_IN_FRAMES = 420 * 30; // 7:00

// Editor fills these in as clips are cut: id -> "clips/<file>.mp4".
// Reuses the three ability files across each admiral's scenes. Files live
// in public/assets/clips/ (git-ignored) and are supplied by the editor;
// slots with no matching file fall back to the animated effect or marker.
export const CLIPS: Record<string, string> = {
  "montage-akainu": "clips/akainu.mp4",
  "akainu-hat": "clips/akainu.mp4",
  "akainu-meigo": "clips/akainu.mp4",
  "synergy-akainu": "clips/akainu.mp4",
  "montage-kuzan": "clips/kuzan.mp4",
  "kuzan-snap": "clips/kuzan.mp4",
  "kuzan-iceage": "clips/kuzan.mp4",
  "kuzan-statues": "clips/kuzan.mp4",
  "synergy-kuzan": "clips/kuzan.mp4",
  "montage-kizaru": "clips/kizaru.mp4",
  "kizaru-shades": "clips/kizaru.mp4",
  "kizaru-teleport": "clips/kizaru.mp4",
  "kizaru-magatama": "clips/kizaru.mp4",
  "synergy-kizaru": "clips/kizaru.mp4",
};

const FONT = "'Arial Black', 'Helvetica Neue', Arial, sans-serif";
const HYPE_FILTER = "saturate(1.2) contrast(1.1)";

const ADMIRALS = [
  { id: "akainu", name: "AKAINU", color: "#e6231a", glow: "rgba(230,35,26,0.75)", bg: "assets/backgrounds/marine-base.jpg", slide: "left" as const },
  { id: "kuzan", name: "KUZAN", color: "#5ad8ff", glow: "rgba(90,216,255,0.75)", bg: "assets/backgrounds/beach.jpg", slide: "bottom" as const },
  { id: "kizaru", name: "KIZARU", color: "#ffd93c", glow: "rgba(255,217,60,0.75)", bg: "assets/backgrounds/sabaody-2.jpg", slide: "right" as const },
];

// ── 0:00–0:03 glitchy text pops ─────────────────────────────────────────
const GlitchPop: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const jx = frame < 6 ? ((frame * 17) % 9) - 4 : 0;
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 160,
          color: "#fff",
          letterSpacing: 5,
          transform: `translateX(${jx}px) scale(${interpolate(frame, [0, 3], [1.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
          textShadow: frame < 8 ? "4px 0 0 rgba(255,0,90,0.8), -4px 0 0 rgba(0,255,230,0.8)" : "none",
          textAlign: "center",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

// ── Generic waving black pirate flag backdrop (original, stylized) ─────
const FlagBackdrop: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const wave = Math.sin(frame / 9) * 8;
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", background: "#101014" }}>
      <div
        style={{
          width: "88%",
          height: "80%",
          background: "#08080b",
          borderRadius: 18,
          transform: `skewY(${wave / 10}deg)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "inset 0 0 80px rgba(0,0,0,0.9)",
        }}
      >
        {/* stylized skull + crossbones */}
        <div style={{ position: "relative", width: 260, height: 260, transform: `translateY(${wave}px)` }}>
          <div style={{ position: "absolute", left: 55, top: 30, width: 150, height: 130, background: "#e8e4da", borderRadius: "50% 50% 42% 42%" }} />
          <div style={{ position: "absolute", left: 95, top: 150, width: 70, height: 40, background: "#e8e4da", borderRadius: "0 0 12px 12px" }} />
          <div style={{ position: "absolute", left: 85, top: 70, width: 34, height: 40, background: "#08080b", borderRadius: "50%" }} />
          <div style={{ position: "absolute", left: 141, top: 70, width: 34, height: 40, background: "#08080b", borderRadius: "50%" }} />
          {[45, -45].map((r) => (
            <div key={r} style={{ position: "absolute", left: 10, top: 195, width: 240, height: 26, background: "#e8e4da", borderRadius: 13, transform: `rotate(${r}deg)` }} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── 0:03–0:08 three-way split reveal ───────────────────────────────────
const SplitReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const burn = interpolate(frame, [85, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ filter: HYPE_FILTER, flexDirection: "row" }}>
      {ADMIRALS.map((a, i) => (
        <div key={a.id} style={{ flex: 1, position: "relative", overflow: "hidden", borderRight: i < 2 ? "6px solid #000" : "none" }}>
          <KenBurnsBg src={a.bg} durationInFrames={150} darken={0.3} />
          <FlagBackdrop opacity={burn} />
          <Sequence from={8 + i * 7} layout="none">
            <AbsoluteFill style={{ padding: "60px 30px 90px" }}>
              <div style={{ width: "100%", height: "100%", filter: `drop-shadow(0 0 34px ${a.glow})` }}>
                <AssetSlot slot={{ id: a.id, label: a.name, src: `assets/${a.id}.png` }} slideFrom={a.slide} />
              </div>
            </AbsoluteFill>
          </Sequence>
          {/* colored ground glow */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 180, background: `linear-gradient(0deg, ${a.glow}, transparent)` }} />
          <div
            style={{
              position: "absolute",
              bottom: 24,
              width: "100%",
              textAlign: "center",
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 44,
              color: "#fff",
              textShadow: `0 0 18px ${a.glow}, 0 3px 0 #000`,
            }}
          >
            {a.name}
          </div>
          {/* burn flash */}
          {burn > 0 && burn < 1 && (
            <AbsoluteFill style={{ background: `rgba(255,120,20,${0.5 * Math.sin(burn * Math.PI)})` }} />
          )}
        </div>
      ))}
      {burn > 0.2 && <Embers />}
    </AbsoluteFill>
  );
};

// ── 0:08–0:14 ability montage + Sengoku "?" ────────────────────────────
const MontageBeat: React.FC<{
  admiral: (typeof ADMIRALS)[number];
  clipNote: string;
}> = ({ admiral: a, clipNote }) => {
  const frame = useCurrentFrame();
  const flash = interpolate(frame, [0, 5], [0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shake = frame < 10 ? Math.sin(frame * 2.8) * 6 : 0;
  const clip = CLIPS[`montage-${a.id}`];
  const Effect = ABILITY_EFFECTS[a.id];
  return (
    <AbsoluteFill style={{ filter: HYPE_FILTER, transform: `translateX(${shake}px)` }}>
      {clip ? (
        <ClipSlot id={`montage-${a.id}`} label={clipNote} src={clip} tint={`${a.color}22`} />
      ) : (
        <Effect />
      )}
      <AbsoluteFill style={{ background: a.color, opacity: flash }} />
    </AbsoluteFill>
  );
};

const SengokuBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = interpolate(frame, [6, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shake = frame > 6 && frame < 18 ? Math.sin(frame * 3) * 7 : 0;
  return (
    <AbsoluteFill style={{ filter: HYPE_FILTER, transform: `translateX(${shake}px)` }}>
      <KenBurnsBg src="assets/backgrounds/marine-base.jpg" durationInFrames={45} darken={0.2} />
      <AbsoluteFill style={{ padding: "60px 560px 100px" }}>
        <AssetSlot slot={{ id: "sengoku", label: "SENGOKU", src: "assets/sengoku.png" }} slideFrom="bottom" />
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 100,
          right: 480,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 300,
          color: "#e6231a",
          transform: `scale(${pop}) rotate(12deg)`,
          textShadow: "0 6px 0 rgba(0,0,0,0.6)",
        }}
      >
        ?
      </div>
    </AbsoluteFill>
  );
};

// ── 0:14–0:20 scale balance shatter ────────────────────────────────────
const ScaleBalance: React.FC = () => {
  const frame = useCurrentFrame();
  const drop = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tilt = drop * 14;
  const shatter = interpolate(frame, [95, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shardT = interpolate(frame, [95, 175], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const shards = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
    const ang = (i / 8) * Math.PI - Math.PI / 2;
    return {
      x: 480 + Math.cos(ang) * 500 * shardT,
      y: 480 + Math.sin(ang) * 380 * shardT + 500 * shardT * shardT,
      r: i * 47 + shardT * 260,
      s: 30 + (i % 3) * 22,
    };
  });

  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 35%, #16203a 0%, #090c16 70%)" }}>
      <Grain />
      <div
        style={{
          position: "absolute",
          top: 90,
          width: "100%",
          textAlign: "center",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 64,
          color: "#fff",
          letterSpacing: 3,
        }}
      >
        THE BALANCE OF POWER
      </div>
      {/* fulcrum */}
      <div style={{ position: "absolute", left: 910, top: 640, width: 100, height: 260, background: "#3a4258", clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }} />
      {/* beam + pans */}
      <div style={{ position: "absolute", left: 260, top: 600, width: 1400, height: 26, backgroundColor: "#5a6480", borderRadius: 13, transform: `rotate(${tilt}deg)`, transformOrigin: "center" }} />
      <div style={{ position: "absolute", left: 330, top: 620, transform: `translateY(${-tilt * 8}px)` }}>
        {/* marine side */}
        <div style={{ width: 320, height: 200, border: "5px solid #5a6480", borderTop: "none", borderRadius: "0 0 160px 160px", display: "flex", alignItems: "center", justifyContent: "center", opacity: 1 - shatter }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 44, color: "#7fa8e0" }}>⚓ NAVY</div>
        </div>
      </div>
      <div style={{ position: "absolute", right: 330, top: 620, transform: `translateY(${tilt * 8}px)` }}>
        {/* pirate side: the three admirals hop in */}
        <div style={{ width: 320, height: 210, border: "5px solid #5a6480", borderTop: "none", borderRadius: "0 0 160px 160px", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 6, padding: 10 }}>
          {ADMIRALS.map((a, i) => (
            <div key={a.id} style={{ width: 90, height: 170, opacity: drop, transform: `translateY(${(1 - drop) * -160}px)`, filter: `drop-shadow(0 0 12px ${a.glow})` }}>
              <Img src={staticFile(`assets/${a.id}.png`)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          ))}
        </div>
      </div>
      {/* glass shards */}
      {shatter > 0 &&
        shards.map((sh, i) => (
          <div key={i} style={{ position: "absolute", left: sh.x, top: sh.y, width: sh.s, height: sh.s, background: "rgba(160,200,255,0.5)", clipPath: "polygon(50% 0, 100% 100%, 0 80%)", transform: `rotate(${sh.r}deg)`, opacity: 1 - shardT }} />
        ))}
      {shatter > 0 && shardT < 0.2 && <AbsoluteFill style={{ background: `rgba(200,225,255,${0.5 * (1 - shardT * 5)})` }} />}
    </AbsoluteFill>
  );
};

// ── 0:20–0:26 world map, red X, New World floods red ───────────────────
const WorldMap: React.FC = () => {
  const frame = useCurrentFrame();
  const xIn = interpolate(frame, [25, 33], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flood = interpolate(frame, [50, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = 0.5 + 0.5 * Math.sin(frame / 5);

  const islands = [
    [200, 300, 130, 60], [420, 480, 90, 90], [650, 260, 160, 70], [900, 520, 110, 55],
    [1150, 330, 140, 80], [1400, 560, 100, 100], [1620, 280, 150, 65], [780, 720, 130, 60],
    [300, 750, 90, 70], [1300, 800, 150, 60], [1680, 720, 110, 80], [1000, 150, 90, 50],
  ];

  return (
    <AbsoluteFill style={{ background: "#0e2438" }}>
      {/* grand line band */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 420, height: 240, background: "rgba(255,255,255,0.07)", transform: "rotate(-6deg) scale(1.2)" }} />
      {islands.map(([x, y, w, h], i) => (
        <div key={i} style={{ position: "absolute", left: x, top: y, width: w, height: h, background: "#3f7350", borderRadius: "45% 55% 50% 50%", boxShadow: "inset 0 -8px 0 rgba(0,0,0,0.3)" }} />
      ))}
      {/* red flood over the New World (right half) */}
      <AbsoluteFill style={{ background: "linear-gradient(90deg, transparent 45%, rgba(190,10,10,0.55) 60%)", opacity: flood }} />
      {/* marineford marker + red X */}
      <div style={{ position: "absolute", left: 830, top: 480 }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 34, color: "#fff", background: "#22456a", padding: "10px 24px", borderRadius: 8, border: "3px solid #fff" }}>
          ⚓ MARINEFORD
        </div>
        <div style={{ position: "absolute", inset: -22, opacity: xIn }}>
          <div style={{ position: "absolute", left: "50%", top: "50%", width: 360, height: 34, background: "#e6231a", borderRadius: 8, transform: `translate(-50%,-50%) rotate(30deg) scaleX(${xIn})` }} />
          <div style={{ position: "absolute", left: "50%", top: "50%", width: 360, height: 34, background: "#e6231a", borderRadius: 8, transform: `translate(-50%,-50%) rotate(-30deg) scaleX(${xIn})` }} />
        </div>
      </div>
      {/* siren vignette */}
      <AbsoluteFill style={{ boxShadow: `inset 0 0 ${140 + pulse * 100}px rgba(200,20,20,${0.35 + flood * 0.3})` }} />
    </AbsoluteFill>
  );
};

// ── 0:26–0:30 narrator + sweating Yonko ────────────────────────────────
const NarratorSweat: React.FC = () => {
  const frame = useCurrentFrame();
  const drops = [0, 1, 2];
  return (
    <AbsoluteFill>
      <NarratorScene icons={["Kaido (sweating)", "Big Mom (sweating)", "Shanks (sweating)"]} />
      {drops.map((i) => {
        const left = i % 2 === 0 ? 330 : undefined;
        const right = i % 2 === 1 ? 150 : undefined;
        const top = 300 + Math.floor(i / 2) * 270 + ((frame * 3 + i * 37) % 60);
        return (
          <div key={i} style={{ position: "absolute", left, right, top, width: 34, height: 46, background: "#6db9f2", borderRadius: "50% 50% 55% 55%", clipPath: "polygon(50% 0, 100% 60%, 80% 100%, 20% 100%, 0 60%)", opacity: 0.9 }} />
        );
      })}
    </AbsoluteFill>
  );
};

// ── 0:30–0:35 title + Akainu haki zoom ─────────────────────────────────
const AkainuZoom: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 70], [1.05, 2.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shake = frame > 40 ? Math.sin(frame * 2.4) * 5 : 0;
  return (
    <AbsoluteFill style={{ filter: HYPE_FILTER, overflow: "hidden" }}>
      <KenBurnsBg src="assets/backgrounds/marine-base.jpg" durationInFrames={75} darken={0.35} />
      <AbsoluteFill style={{ padding: "40px 560px 80px", transform: `scale(${zoom}) translateX(${shake}px)`, transformOrigin: "50% 6%" }}>
        <div style={{ width: "100%", height: "100%", filter: "drop-shadow(0 0 40px rgba(230,35,26,0.8))" }}>
          <AssetSlot slot={{ id: "akainu", label: "AKAINU", src: "assets/akainu.png" }} slideFrom="none" />
        </div>
      </AbsoluteFill>
      <HakiAura />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 22%, rgba(230,35,26,${interpolate(frame, [40, 75], [0, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}) 0%, transparent 60%)` }} />
    </AbsoluteFill>
  );
};

// ── 0:38–0:48 B&W atrocity flashback beat ──────────────────────────────
const FlashbackBeat: React.FC<{ clipId: string; note: string }> = ({ clipId, note }) => {
  const frame = useCurrentFrame();
  const shake = frame < 8 ? Math.sin(frame * 2.6) * 4 : 0;
  return (
    <AbsoluteFill style={{ filter: "grayscale(1) contrast(1.3)", transform: `translateX(${shake}px)` }}>
      <ClipSlot id={clipId} label={note} src={CLIPS[clipId]} />
      <Grain />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.8) 100%)" }} />
    </AbsoluteFill>
  );
};

// Profile scene: pin + cutout (or footage) + optional speech bubble + gauge.
const ProfileScene: React.FC<{
  admiral: (typeof ADMIRALS)[number];
  pin: string;
  bubble?: string;
  gaugeLabel?: string;
  gauge?: number;
  clipId?: string;
  clipNote?: string;
  impacts?: boolean;
  ability?: boolean; // show the animated ability effect when no footage
}> = ({ admiral: a, pin, bubble, gaugeLabel, gauge, clipId, clipNote, impacts, ability }) => {
  const frame = useCurrentFrame();
  const shake = impacts && frame % 20 < 4 ? Math.sin(frame * 3) * 8 : 0;
  const flash = impacts ? Math.max(0, 0.6 - (frame % 20) * 0.15) : 0;
  const clip = clipId ? CLIPS[clipId] : undefined;
  const Effect = ABILITY_EFFECTS[a.id];
  return (
    <AbsoluteFill style={{ filter: HYPE_FILTER, transform: `translateX(${shake}px)` }}>
      {clip ? (
        <ClipSlot id={clipId!} label={clipNote ?? a.name} src={clip} tint={`${a.color}22`} />
      ) : ability ? (
        <Effect />
      ) : (
        <>
          <KenBurnsBg src={a.bg} durationInFrames={300} darken={0.28} />
          <CutoutFull id={a.id} slideFrom={a.slide} glow={a.glow} />
        </>
      )}
      <TextPin text={pin} />
      {bubble && <SpeechBubble text={bubble} />}
      {gauge !== undefined && gaugeLabel && <StatGauge label={gaugeLabel} value={gauge} color={a.color} startFrame={10} />}
      {impacts && <AbsoluteFill style={{ background: a.color, opacity: flash }} />}
    </AbsoluteFill>
  );
};

// Desk-slam → jolly roger reveal (0:48–1:05)
const DeskSlam: React.FC = () => {
  const frame = useCurrentFrame();
  const glitch = frame > 150 && frame < 175;
  const reveal = interpolate(frame, [175, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shake = frame % 24 < 5 && frame < 150 ? Math.sin(frame * 3.4) * 9 : 0;
  if (frame >= 175 || glitch) {
    return (
      <AbsoluteFill style={{ background: "#08060c", alignItems: "center", justifyContent: "center" }}>
        {glitch && (
          <AbsoluteFill style={{ opacity: 0.4, backgroundImage: "repeating-linear-gradient(0deg, transparent 0 5px, rgba(0,255,230,0.5) 6px, rgba(255,0,90,0.5) 7px)", backgroundPosition: `0 ${(frame * 31) % 40}px` }} />
        )}
        <div style={{ transform: `scale(${0.6 + reveal * 0.4})`, opacity: reveal, textAlign: "center" }}>
          <div style={{ fontSize: 260 }}>🏴‍☠️</div>
          <div style={{ display: "flex", gap: 30, justifyContent: "center", fontSize: 90 }}>
            <span>🌋</span><span>❄️</span><span>⚡</span>
          </div>
          <div style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: 900, fontSize: 54, color: "#fff", marginTop: 20, letterSpacing: 3 }}>A NEW FLAG RISES</div>
        </div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ filter: HYPE_FILTER, transform: `translateX(${shake}px)` }}>
      <ClipSlot id="desk-slam" label="Three Admirals slam the marine desk in half" src={CLIPS["desk-slam"]} />
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.3)" }} />
    </AbsoluteFill>
  );
};

// News Coo newspaper barrage (3:10–3:20)
const NewsBarrage: React.FC = () => {
  const frame = useCurrentFrame();
  const gull = interpolate(frame, [0, 60], [-300, 2200]);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #1a2a44, #070b14)" }}>
      <div style={{ position: "absolute", top: 120, left: gull, fontSize: 90 }}>🕊️</div>
      <NewspaperSpin headline="ADMIRALS DEFECT!" startFrame={20} />
      <NewspaperSpin headline="NEW PIRATE CREW FORMED!" startFrame={110} />
      <NewspaperSpin headline="WORLD GOVERNMENT IN PANIC!" startFrame={200} />
    </AbsoluteFill>
  );
};

const ToBeContinued: React.FC = () => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", opacity: op }}>
      <Embers />
      <div style={{ fontFamily: "'Arial Black',sans-serif", fontWeight: 900, fontSize: 96, color: "#ffd75e", textShadow: "0 0 40px rgba(255,120,30,0.6)" }}>TO BE CONTINUED</div>
      <div style={{ fontFamily: "'Courier New',monospace", fontSize: 30, color: "#9aa0ae", marginTop: 20 }}>Part 2 →</div>
    </AbsoluteFill>
  );
};

export const AdmiralsVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence from={0} durationInFrames={30}><GlitchPop text="WHAT IF" /></Sequence>
      <Sequence from={30} durationInFrames={30}><GlitchPop text="3 ADMIRALS" /></Sequence>
      <Sequence from={60} durationInFrames={30}><GlitchPop text="BECAME PIRATES" /></Sequence>
      <Sequence from={90} durationInFrames={150}><SplitReveal /></Sequence>
      <Sequence from={240} durationInFrames={45}><MontageBeat admiral={ADMIRALS[0]} clipNote="Akainu magma fist at Marineford" /></Sequence>
      <Sequence from={285} durationInFrames={45}><MontageBeat admiral={ADMIRALS[1]} clipNote="Kuzan freezing the ocean" /></Sequence>
      <Sequence from={330} durationInFrames={45}><MontageBeat admiral={ADMIRALS[2]} clipNote="Kizaru kicking Hawkins at light speed" /></Sequence>
      <Sequence from={375} durationInFrames={45}><SengokuBeat /></Sequence>
      <Sequence from={420} durationInFrames={180}><ScaleBalance /></Sequence>
      <Sequence from={600} durationInFrames={180}><WorldMap /></Sequence>
      <Sequence from={780} durationInFrames={120}><NarratorSweat /></Sequence>
      <Sequence from={900} durationInFrames={38}>
        <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center" }}>
          <Embers />
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 140, color: "#fff", textShadow: "0 0 40px rgba(255,120,30,0.6)" }}>COULD ANYONE</div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={938} durationInFrames={37}>
        <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center" }}>
          <Embers />
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 170, color: "#e6231a", textShadow: "0 0 50px rgba(230,35,26,0.8)" }}>STOP THEM?</div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={975} durationInFrames={75}><AkainuZoom /></Sequence>

      {/* ── 0:35–1:05 CHAPTER 1: THE ULTIMATE BETRAYAL ── */}
      <Sequence from={1050} durationInFrames={90}><ChapterCard chapter="CHAPTER 1" title="THE ULTIMATE BETRAYAL" /></Sequence>
      <Sequence from={1140} durationInFrames={90}><FlashbackBeat clipId="atrocity-celestial" note="Celestial Dragon walking on a slave" /></Sequence>
      <Sequence from={1230} durationInFrames={120}><FlashbackBeat clipId="atrocity-ohara" note="Ohara incinerated by the Buster Call" /></Sequence>
      <Sequence from={1350} durationInFrames={90}><FlashbackBeat clipId="atrocity-admirals-grim" note="Akainu, Kuzan, Kizaru grim under dark shadows" /></Sequence>
      <Sequence from={1440} durationInFrames={510}><DeskSlam /></Sequence>

      {/* ── 1:05–1:40 CAPTAIN: AKAINU (OFFENSE) ── */}
      <Sequence from={1950} durationInFrames={210}>
        <ProfileScene admiral={ADMIRALS[0]} pin="CAPTAIN: SAKAZUKI" clipId="akainu-hat" clipNote="Akainu putting on the captain's hat" />
      </Sequence>
      <Sequence from={2160} durationInFrames={390}>
        <ProfileScene admiral={ADMIRALS[0]} pin="CAPTAIN: SAKAZUKI" bubble="NO SURRENDER. COMPLETE DESTRUCTION." />
      </Sequence>
      <Sequence from={2550} durationInFrames={450}>
        <ProfileScene admiral={ADMIRALS[0]} pin="MEIGO — HELLHOUND" clipId="akainu-meigo" clipNote="Akainu's Meigo on Whitebeard" gaugeLabel="OFFENSE" gauge={100} impacts ability />
      </Sequence>

      {/* ── 1:40–2:15 STRATEGIST: AOKIJI (CONTROL) ── */}
      <Sequence from={3000} durationInFrames={240}>
        <ProfileScene admiral={ADMIRALS[1]} pin="STRATEGIST: KUZAN" clipId="kuzan-snap" clipNote="Kuzan snapping his fingers" />
      </Sequence>
      <Sequence from={3240} durationInFrames={360}>
        <ProfileScene admiral={ADMIRALS[1]} pin="ICE AGE" clipId="kuzan-iceage" clipNote="Kuzan freezing the Marineford tsunami (Ice Age)" ability />
      </Sequence>
      <Sequence from={3600} durationInFrames={450}>
        <ProfileScene admiral={ADMIRALS[1]} pin="FIELD CONTROL" clipId="kuzan-statues" clipNote="Enemies frozen into statues" gaugeLabel="FIELD CONTROL" gauge={100} />
      </Sequence>

      {/* ── 2:15–2:45 VANGUARD: KIZARU (MOBILITY) ── */}
      <Sequence from={4050} durationInFrames={210}>
        <ProfileScene admiral={ADMIRALS[2]} pin="VANGUARD: BORSALINO" clipId="kizaru-shades" clipNote="Kizaru adjusting his sunglasses" />
      </Sequence>
      <Sequence from={4260} durationInFrames={390}>
        <ProfileScene admiral={ADMIRALS[2]} pin="LIGHT SPEED" bubble="Have you ever been kicked at the speed of light?" clipId="kizaru-teleport" clipNote="Kizaru teleporting behind the Supernovas" />
      </Sequence>
      <Sequence from={4650} durationInFrames={450}>
        <ProfileScene admiral={ADMIRALS[2]} pin="YASAKANI NO MAGATAMA" clipId="kizaru-magatama" clipNote="Light beads raining on the fleet" gaugeLabel="SPEED & MOBILITY" gauge={100} impacts ability />
      </Sequence>

      {/* ── 2:45–3:20 SYNERGY & NEW WORLD REACTION ── */}
      <Sequence from={4950} durationInFrames={450}><SynergyTriangle clips={CLIPS} /></Sequence>
      <Sequence from={5400} durationInFrames={300}>
        <AbsoluteFill style={{ filter: HYPE_FILTER }}>
          <ClipSlot id="terrified-captain" label="Enemy captain, terrified" src={CLIPS["terrified-captain"]} />
          <Crosshairs />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={5700} durationInFrames={270}><NewsBarrage /></Sequence>
      <Sequence from={5970} durationInFrames={30}><ToBeContinued /></Sequence>

      {/* ══ 3:20–4:00 TARGET 1: BIG MOM ══ */}
      <Sequence from={6000} durationInFrames={240}>
        <TargetHeader pin="TARGET 1: BIG MOM PIRATES" region="TOTTO LAND" enemyId="bigmom" enemyLabel="Big Mom (laughing on her throne)" />
      </Sequence>
      <Sequence from={6240} durationInFrames={240}>
        <AbsoluteFill style={{ filter: HYPE_FILTER }}>
          <IceSpread />
          <TextPin text="WHOLE CAKE — FROZEN" />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={6480} durationInFrames={360}>
        <AbsoluteFill style={{ filter: HYPE_FILTER }}>
          <LightDash />
          <SpeechBubble text="HE'S TOO FAST!" />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={6840} durationInFrames={360}>
        <TripleAssault enemyId="bigmom" enemyLabel="Big Mom" caption="3-ON-1 ASSAULT" />
      </Sequence>

      {/* ══ 4:00–4:45 TARGET 2: KAIDO ══ */}
      <Sequence from={7200} durationInFrames={240}>
        <TargetHeader pin="TARGET 2: KAIDO" region="WANO / ONIGASHIMA" enemyId="kaido" enemyLabel="Kaido roaring in dragon form" />
      </Sequence>
      <Sequence from={7440} durationInFrames={360}>
        <AbsoluteFill style={{ filter: HYPE_FILTER }}>
          <IceSpread />
          <Enemy id="kaido" label="Kaido charging" slideFrom="left" pad="120px 200px 120px" />
          <TextPin text="ICE WALLS" />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={7800} durationInFrames={300}>
        <AbsoluteFill style={{ filter: HYPE_FILTER }}>
          <MagmaBurst />
          <TextPin text="ARMAMENT HAKI CLASH" />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={8100} durationInFrames={300}>
        <AbsoluteFill style={{ filter: HYPE_FILTER }}>
          <EnemyShatter enemyId="kaido" enemyLabel="Kaido to his knees" startFrame={0} />
          <NewspaperSpin headline="2 YONKO DEFEATED!" startFrame={120} />
        </AbsoluteFill>
      </Sequence>

      {/* ══ 4:45–5:40 SECTION 3: SHANKS ══ */}
      <Sequence from={8400} durationInFrames={150}><ChapterCard chapter="SECTION 3" title="THE FINAL EMPERORS" /></Sequence>
      <Sequence from={8550} durationInFrames={300}>
        <TargetHeader pin="SHANKS — RED HAIR" region="" enemyId="shanks" enemyLabel="Shanks, Haki crackling" bg="assets/backgrounds/marine-base.jpg" />
      </Sequence>
      <Sequence from={8850} durationInFrames={450}>
        <ProfileScene admiral={ADMIRALS[2]} pin="RED HAIR COMMANDERS" clipId="shanks-commanders" clipNote="Kizaru vs Beckman, Kuzan vs Lucky Roux" />
      </Sequence>
      <Sequence from={9300} durationInFrames={540}>
        <AbsoluteFill style={{ filter: HYPE_FILTER }}>
          <MagmaBurst />
          <TextPin text="GRYPHON vs HELLHOUND" />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={9840} durationInFrames={360}>
        <TripleAssault enemyId="shanks" enemyLabel="Shanks pushed back" caption="3-ON-1 PRESSURE" />
      </Sequence>

      {/* ══ 5:40–6:40 BLACKBEARD ══ */}
      <Sequence from={10200} durationInFrames={360}><BlackbeardVortex /></Sequence>
      <Sequence from={10560} durationInFrames={300}>
        <ProfileScene admiral={ADMIRALS[0]} pin="BLIND-SPOT PUNCH" clipId="bb-blackhole" clipNote="Black Hole drags Kuzan; Akainu punches from the blind spot" />
      </Sequence>
      <Sequence from={10860} durationInFrames={300}><QuakeCracks bg="assets/backgrounds/sabaody-1.jpg" /></Sequence>
      <Sequence from={11160} durationInFrames={360}>
        <TripleAssault enemyId="blackbeard" enemyLabel="Blackbeard struck by all three" caption="ADMIRALS ADAPT" />
      </Sequence>

      {/* ══ 6:40–7:00 CONCLUSION ══ */}
      <Sequence from={11520} durationInFrames={480}><VictorySilhouette /></Sequence>
      <Sequence from={12000} durationInFrames={600}><FinaleCard /></Sequence>
    </AbsoluteFill>
  );
};
