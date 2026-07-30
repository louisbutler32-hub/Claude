import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
} from "remotion";

// Animated ability effects built entirely from original shapes + the user's
// own cutouts. No footage. Each effect is a full-screen scene that animates
// the admiral cutout through their signature power with real motion.

const ease = (t: number) => t * t * (3 - 2 * t);

// deterministic particle field helper
const particles = (n: number, seed: string) =>
  Array.from({ length: n }, (_, i) => ({
    x: random(`${seed}-x-${i}`),
    y: random(`${seed}-y-${i}`),
    s: random(`${seed}-s-${i}`),
    r: random(`${seed}-r-${i}`),
  }));

const CutoutLayer: React.FC<{
  id: string;
  transform?: string;
  glow: string;
  opacity?: number;
}> = ({ id, transform, glow, opacity = 1 }) => (
  <AbsoluteFill style={{ padding: "50px 540px 70px", transform, opacity }}>
    <Img
      src={staticFile(`assets/${id}.png`)}
      style={{ width: "100%", height: "100%", objectFit: "contain", filter: `drop-shadow(0 0 40px ${glow})` }}
    />
  </AbsoluteFill>
);

// ── AKAINU — magma burst + forward lunge ───────────────────────────────
export const MagmaBurst: React.FC = () => {
  const frame = useCurrentFrame();
  const lungeT = ease(interpolate(frame, [8, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const lungeX = interpolate(lungeT, [0, 1], [-90, 30]);
  const scale = interpolate(lungeT, [0, 1], [0.9, 1.08]);
  const shake = frame > 22 && frame < 40 ? Math.sin(frame * 3.2) * 7 : 0;
  const burst = interpolate(frame, [22, 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash = frame >= 22 && frame < 30 ? interpolate(frame, [22, 30], [0.7, 0]) : 0;

  const embers = particles(46, "magma");

  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 60%, #4a0d06 0%, #140402 70%)", overflow: "hidden" }}>
      {/* heat haze radial pushing outward */}
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, rgba(255,90,20,${0.35 * burst}) 0%, transparent ${20 + burst * 45}%)` }} />
      {/* magma cracks */}
      <svg width="1920" height="1080" style={{ position: "absolute", opacity: 0.5 + burst * 0.5 }}>
        {[300, 700, 1100, 1500].map((x, i) => (
          <path
            key={i}
            d={`M ${x} 1080 L ${x + 40 - i * 20} ${760 - burst * 120} L ${x - 30 + i * 15} ${540 - burst * 160}`}
            stroke="#ff5a1e"
            strokeWidth={4 + burst * 4}
            fill="none"
            opacity={burst}
          />
        ))}
      </svg>
      <CutoutLayer id="akainu" transform={`translateX(${lungeX + shake}px) scale(${scale})`} glow="rgba(230,60,20,0.9)" />
      {/* rising embers */}
      {embers.map((p, i) => {
        const life = (frame * (0.9 + p.s) + p.r * 60) % 90;
        const y = 100 - (life / 90) * 120;
        const op = burst * (1 - life / 90);
        return (
          <div key={i} style={{ position: "absolute", left: `${p.x * 100}%`, top: `${y}%`, width: 4 + p.s * 8, height: 4 + p.s * 8, borderRadius: "50%", background: i % 2 ? "#ffb347" : "#ff5a1e", boxShadow: "0 0 14px rgba(255,90,20,0.9)", opacity: op }} />
        );
      })}
      {/* impact flash */}
      <AbsoluteFill style={{ background: "#ff7a2e", opacity: flash }} />
      {/* forward shockwave ring */}
      {burst > 0 && (
        <div style={{ position: "absolute", left: "50%", top: "58%", width: 40, height: 40, borderRadius: "50%", border: "6px solid rgba(255,140,60,0.8)", transform: `translate(-50%,-50%) scale(${1 + burst * 22})`, opacity: 1 - burst }} />
      )}
    </AbsoluteFill>
  );
};

// ── KUZAN — ice spreads across the frame, freezes it ───────────────────
export const IceSpread: React.FC = () => {
  const frame = useCurrentFrame();
  const snap = interpolate(frame, [10, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const spread = ease(interpolate(frame, [16, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const flash = frame >= 14 && frame < 22 ? interpolate(frame, [14, 22], [0.6, 0]) : 0;
  const frost = interpolate(frame, [30, 70], [0, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const crystals = particles(26, "ice");

  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #113047 0%, #05131f 72%)", overflow: "hidden" }}>
      {/* expanding frozen disc from center */}
      <div style={{ position: "absolute", left: "50%", top: "55%", width: 2400, height: 2400, borderRadius: "50%", background: "radial-gradient(circle, rgba(150,225,255,0.25) 0%, rgba(90,180,230,0.12) 45%, transparent 70%)", transform: `translate(-50%,-50%) scale(${spread})` }} />
      <CutoutLayer id="kuzan" transform={`scale(${0.95 + snap * 0.05})`} glow="rgba(90,216,255,0.9)" />
      {/* ice shards shooting outward */}
      <svg width="1920" height="1080" style={{ position: "absolute" }}>
        {crystals.map((p, i) => {
          const ang = (i / crystals.length) * Math.PI * 2;
          const dist = spread * (500 + p.s * 400);
          const x = 960 + Math.cos(ang) * dist;
          const y = 560 + Math.sin(ang) * dist;
          const len = 30 + p.s * 60;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${(ang * 180) / Math.PI})`} opacity={spread * (1 - spread * 0.4)}>
              <polygon points={`0,-6 ${len},0 0,6`} fill="rgba(200,240,255,0.85)" />
            </g>
          );
        })}
      </svg>
      {/* frost creeping in from edges */}
      <AbsoluteFill style={{ boxShadow: `inset 0 0 ${180 * frost}px ${120 * frost}px rgba(200,240,255,${frost})`, pointerEvents: "none" }} />
      {/* frozen crackle at corners */}
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, transparent 40%, rgba(180,230,255,${frost * 0.5}) 100%)` }} />
      <AbsoluteFill style={{ background: "#bfe9ff", opacity: flash }} />
    </AbsoluteFill>
  );
};

// ── KIZARU — light-speed dash + magatama beads ─────────────────────────
export const LightDash: React.FC = () => {
  const frame = useCurrentFrame();
  // cutout streaks in from the right on a light trail, then snaps to center
  const dashT = ease(interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const x = interpolate(dashT, [0, 1], [700, 0]);
  const streakOpacity = interpolate(frame, [0, 10, 16], [0.9, 0.7, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash = frame < 6 ? interpolate(frame, [0, 6], [0.85, 0]) : 0;
  const beads = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const rays = Array.from({ length: 14 }, (_, i) => i);
  const magatama = particles(30, "light");

  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #3a3410 0%, #0c0b04 72%)", overflow: "hidden" }}>
      {/* radiating light rays behind */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: `rotate(${frame * 0.6}deg)` }}>
          {rays.map((i) => (
            <div key={i} style={{ position: "absolute", left: -4, top: -1000, width: 8, height: 2000, background: `linear-gradient(rgba(255,225,90,0) 0%, rgba(255,225,90,${0.12 + beads * 0.1}) 50%, rgba(255,225,90,0) 100%)`, transform: `rotate(${(i / rays.length) * 360}deg)`, transformOrigin: "center" }} />
          ))}
        </div>
      </AbsoluteFill>
      {/* horizontal speed streaks during the dash */}
      <AbsoluteFill style={{ opacity: streakOpacity, backgroundImage: "repeating-linear-gradient(90deg, transparent 0 60px, rgba(255,235,120,0.9) 61px, transparent 64px)", maskImage: "linear-gradient(90deg, transparent, #000 40%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 40%, transparent)" }} />
      <CutoutLayer id="kizaru" transform={`translateX(${x}px)`} glow="rgba(255,220,80,0.95)" />
      {/* magatama beads raining */}
      <svg width="1920" height="1080" style={{ position: "absolute" }}>
        {magatama.map((p, i) => {
          const t = (beads + p.r) % 1;
          const bx = p.x * 1920;
          const by = t * 1200 - 100;
          return <circle key={i} cx={bx} cy={by} r={5 + p.s * 6} fill="#ffe86a" opacity={beads * 0.9} style={{ filter: "drop-shadow(0 0 8px rgba(255,220,80,0.9))" }} />;
        })}
      </svg>
      <AbsoluteFill style={{ background: "#fff6cc", opacity: flash }} />
    </AbsoluteFill>
  );
};

export const ABILITY_EFFECTS: Record<string, React.FC> = {
  akainu: MagmaBurst,
  kuzan: IceSpread,
  kizaru: LightDash,
};
