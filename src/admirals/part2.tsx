import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { AssetSlot, Embers, Grain, KenBurnsBg } from "../whatif/components";
import { ClipSlot, TextPin } from "./parts";
import { MagmaBurst, IceSpread, LightDash } from "./effects";

const FONT = "'Arial Black', 'Helvetica Neue', Arial, sans-serif";

// Enemy cutouts you have as PNGs in public/assets/. Add an id here once you
// drop the file (e.g. "bigmom") and it renders; otherwise a labeled
// placeholder shows and the render never breaks on a missing image.
export const ENEMY_CUTOUTS = new Set<string>([]);

// Enemy cutout: real PNG if registered in ENEMY_CUTOUTS, else placeholder.
export const Enemy: React.FC<{ id: string; label: string; slideFrom?: "left" | "right" | "bottom" | "none"; pad?: string; glow?: string }> = ({
  id,
  label,
  slideFrom = "bottom",
  pad = "70px 560px 90px",
  glow,
}) => (
  <AbsoluteFill style={{ padding: pad }}>
    <div style={{ width: "100%", height: "100%", filter: glow ? `drop-shadow(0 0 34px ${glow})` : undefined }}>
      <AssetSlot slot={{ id, label, src: ENEMY_CUTOUTS.has(id) ? `assets/${id}.png` : undefined }} slideFrom={slideFrom} />
    </div>
  </AbsoluteFill>
);

// Stylized red-flashing region map with a location label.
export const TargetMap: React.FC<{ region: string }> = ({ region }) => {
  const frame = useCurrentFrame();
  const flash = 0.3 + 0.4 * Math.abs(Math.sin(frame / 6));
  const islands = [
    [360, 300, 150, 80], [700, 480, 120, 120], [1100, 320, 160, 90],
    [1450, 540, 130, 130], [560, 720, 110, 80], [1250, 760, 150, 70],
  ];
  return (
    <AbsoluteFill style={{ background: "#0e1f30" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 50%, rgba(200,20,20,${flash * 0.5}) 0%, transparent 70%)` }} />
      {islands.map(([x, y, w, h], i) => (
        <div key={i} style={{ position: "absolute", left: x, top: y, width: w, height: h, background: "#b53a30", borderRadius: "45% 55% 50% 50%", boxShadow: `0 0 ${20 * flash}px rgba(230,40,30,0.8)`, opacity: 0.85 }} />
      ))}
      <div style={{ position: "absolute", bottom: 70, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 48, color: "#fff", letterSpacing: 3, textShadow: "0 0 20px rgba(230,40,30,0.9)" }}>{region}</div>
      <AbsoluteFill style={{ boxShadow: `inset 0 0 200px rgba(200,20,20,${flash})`, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

// Target section header: red map, pin, enemy cutout.
export const TargetHeader: React.FC<{ pin: string; region: string; enemyId: string; enemyLabel: string; bg?: string }> = ({ pin, region, enemyId, enemyLabel, bg }) => (
  <AbsoluteFill style={{ background: "#0e1f30", filter: "saturate(1.15) contrast(1.1)" }}>
    {bg ? <KenBurnsBg src={bg} durationInFrames={240} darken={0.35} /> : <TargetMap region={region} />}
    <Enemy id={enemyId} label={enemyLabel} glow="rgba(230,40,30,0.6)" />
    <TextPin text={pin} />
  </AbsoluteFill>
);

// Grey shatter overlay — enemy PNG breaking into pieces.
export const EnemyShatter: React.FC<{ enemyId: string; enemyLabel: string; startFrame: number }> = ({ enemyId, enemyLabel, startFrame }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [startFrame, startFrame + 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shards = Array.from({ length: 24 }, (_, i) => {
    const ang = (i / 24) * Math.PI * 2 + random(`s${i}`) * 0.5;
    return { x: 960 + Math.cos(ang) * 520 * t, y: 500 + Math.sin(ang) * 380 * t + 500 * t * t, r: i * 33 + t * 300, s: 40 + random(`sz${i}`) * 60 };
  });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: `grayscale(${t}) brightness(${1 - t * 0.5})`, opacity: 1 - t }}>
        <Enemy id={enemyId} label={enemyLabel} slideFrom="none" />
      </AbsoluteFill>
      {t > 0 && shards.map((sh, i) => (
        <div key={i} style={{ position: "absolute", left: sh.x, top: sh.y, width: sh.s, height: sh.s, background: "rgba(150,150,155,0.7)", clipPath: "polygon(50% 0, 100% 70%, 20% 100%)", transform: `rotate(${sh.r}deg)`, opacity: 1 - t }} />
      ))}
    </AbsoluteFill>
  );
};

// 3-on-1 assault: three admiral cutouts converge on the target with their
// effect glows, then the enemy shatters.
export const TripleAssault: React.FC<{ enemyId: string; enemyLabel: string; caption?: string }> = ({ enemyId, enemyLabel, caption }) => {
  const frame = useCurrentFrame();
  const shake = frame % 16 < 5 ? Math.sin(frame * 3.2) * 9 : 0;
  const flashCol = ["#e6231a", "#5ad8ff", "#ffd93c"][Math.floor(frame / 6) % 3];
  const flash = Math.max(0, 0.5 - (frame % 6) * 0.09);
  const admirals = [
    { id: "akainu", x: -1, glow: "rgba(230,35,26,0.85)" },
    { id: "kizaru", x: 1, glow: "rgba(255,217,60,0.85)" },
  ];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, #2a0a0a, #080608)", filter: "saturate(1.2) contrast(1.12)", transform: `translateX(${shake}px)`, overflow: "hidden" }}>
      {/* enemy shattering in the center */}
      <EnemyShatter enemyId={enemyId} enemyLabel={enemyLabel} startFrame={40} />
      {/* admirals flanking */}
      {admirals.map((a) => (
        <div key={a.id} style={{ position: "absolute", top: 120, bottom: 120, width: 360, [a.x < 0 ? "left" : "right"]: 40, filter: `drop-shadow(0 0 30px ${a.glow})` }}>
          <Img src={staticFile(`assets/${a.id}.png`)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
      ))}
      {/* kuzan freezing from below */}
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 300, height: 340, filter: "drop-shadow(0 0 30px rgba(90,216,255,0.85))" }}>
        <Img src={staticFile("assets/kuzan.png")} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
      {caption && <div style={{ position: "absolute", top: 70, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 52, color: "#fff", textShadow: "0 3px 0 #000" }}>{caption}</div>}
      <AbsoluteFill style={{ background: flashCol, opacity: flash }} />
    </AbsoluteFill>
  );
};

// Quake: cracks tear across the atmosphere and the background breaks apart.
export const QuakeCracks: React.FC<{ bg?: string }> = ({ bg }) => {
  const frame = useCurrentFrame();
  const crack = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const split = interpolate(frame, [40, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shake = Math.sin(frame * 3.6) * (4 + crack * 8);
  return (
    <AbsoluteFill style={{ background: "#0a0810", overflow: "hidden", transform: `translate(${shake}px, ${shake * 0.5}px)` }}>
      {bg && <KenBurnsBg src={bg} durationInFrames={100} darken={0.3} />}
      {/* two halves splitting apart */}
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${-split * 300}px) rotate(${-split * 4}deg)`, clipPath: "polygon(0 0, 48% 0, 42% 100%, 0 100%)", background: "rgba(0,0,0,0.4)" }} />
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${split * 300}px) rotate(${split * 4}deg)`, clipPath: "polygon(52% 0, 100% 0, 100% 100%, 46% 100%)", background: "rgba(0,0,0,0.4)" }} />
      {/* jagged white crack */}
      <svg width="1920" height="1080" style={{ position: "absolute" }}>
        <path d="M 960 0 L 900 300 L 1010 520 L 920 760 L 980 1080" stroke="#fff" strokeWidth={4 + crack * 8} fill="none" opacity={crack} style={{ filter: "drop-shadow(0 0 12px rgba(200,180,255,0.9))" }} />
      </svg>
      <AbsoluteFill style={{ background: "#fff", opacity: crack < 0.3 ? crack : 0 }} />
    </AbsoluteFill>
  );
};

// Blackbeard vortex intro — dark purple pulling swirls.
export const BlackbeardVortex: React.FC = () => {
  const frame = useCurrentFrame();
  const swirls = Array.from({ length: 5 }, (_, i) => i);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #1a0a26, #060409)", overflow: "hidden", filter: "saturate(1.15) contrast(1.1)" }}>
      {swirls.map((i) => {
        const r = 200 + i * 160;
        return <div key={i} style={{ position: "absolute", left: "50%", top: "50%", width: r, height: r, marginLeft: -r / 2, marginTop: -r / 2, borderRadius: "50%", border: `3px solid rgba(150,60,220,${0.5 - i * 0.08})`, transform: `rotate(${frame * (2 + i) * 0.6}deg) scale(${1 + 0.1 * Math.sin(frame / 8 + i)})` }} />;
      })}
      <Enemy id="blackbeard" label="Blackbeard" glow="rgba(150,60,220,0.7)" />
      <TextPin text="FINAL TARGET: BLACKBEARD" />
    </AbsoluteFill>
  );
};

// Victory silhouette over crossed Yonko flags.
export const VictorySilhouette: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [0, 25], [60, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #201008 0%, #08060a 100%)" }}>
      <Embers />
      {/* crossed-out yonko flags row */}
      <div style={{ position: "absolute", top: 90, width: "100%", display: "flex", justifyContent: "center", gap: 40 }}>
        {["BIG MOM", "KAIDO", "SHANKS", "BLACKBEARD"].map((n) => (
          <div key={n} style={{ position: "relative", padding: "10px 20px", border: "2px solid #555", borderRadius: 6, fontFamily: FONT, fontWeight: 900, fontSize: 24, color: "#888" }}>
            {n}
            <div style={{ position: "absolute", left: 0, top: "50%", width: "100%", height: 4, background: "#e6231a", transform: "rotate(-8deg)" }} />
          </div>
        ))}
      </div>
      {/* three admiral silhouettes standing */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 620, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 30, transform: `translateY(${rise}px)` }}>
        {["kuzan", "akainu", "kizaru"].map((id, i) => (
          <div key={id} style={{ width: 300, height: 520 + (i === 1 ? 60 : 0), filter: "brightness(0.05)" }}>
            <Img src={staticFile(`assets/${id}.png`)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        ))}
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, rgba(255,150,60,0.15), transparent 60%)" }} />
    </AbsoluteFill>
  );
};

// Final jolly-roger zoom-out + impact text.
export const FinaleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 200], [1.4, 0.85], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const line1 = frame > 60 && frame < 150;
  const line2 = frame >= 150 && frame < 260;
  const fade = interpolate(frame, [280, 320], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #12233a, #05070d)", alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${zoom})`, textAlign: "center", opacity: 0.9 }}>
        <div style={{ fontSize: 300 }}>🏴‍☠️</div>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", fontSize: 70 }}><span>🌋</span><span>❄️</span><span>⚡</span></div>
      </div>
      {line1 && <div style={{ position: "absolute", fontFamily: FONT, fontWeight: 900, fontSize: 130, color: "#fff", textShadow: "0 0 40px rgba(0,0,0,0.8)" }}>NO YONKO LEFT</div>}
      {line2 && <div style={{ position: "absolute", fontFamily: FONT, fontWeight: 900, fontSize: 120, color: "#ffd75e", textShadow: "0 0 50px rgba(255,150,40,0.7)" }}>ONLY THE ADMIRALS</div>}
      <AbsoluteFill style={{ background: "#000", opacity: fade }} />
    </AbsoluteFill>
  );
};

export { MagmaBurst, IceSpread, LightDash };
