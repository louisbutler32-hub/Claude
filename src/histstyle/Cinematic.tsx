import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import {
  FONT,
  Grain,
  MAP,
  NAP,
  Ranks,
  SHOT2,
  arrowD,
  arrowTip,
  captionAt,
  hash,
  lerp,
  prog,
  smokePuffs,
  useHistFonts,
} from "./shared";

// ── Style C · Cinematic Dusk ──────────────────────────────────────────
//
// Modern documentary motion design: flat vector shapes, but lit like a
// film. The sun sits on Wellington's ridge, so everything between it and
// the camera is a silhouette in aerial perspective, each layer a step
// darker and less hazy, and Napoleon carries a rim of orange light. Motion
// is smooth and eased; the colour does the storytelling.

const C = {
  skyTop: "#18223f",
  skyMid: "#5b3f68",
  horizon: "#ef8a4c",
  sun: "#fff3cf",
  hill1: "#d27a5c",
  hill2: "#9c4f5a",
  hill3: "#5e3350",
  near: "#22172a",
  figure: "#120c18",
  rim: "#ffa25c",
  red: "#ff5a4a",
  blue: "#4f8dff",
  white: "#f5f1ea",
};

const ridgeD = (fn: (x: number) => number, bottom = 2600) => {
  let d = `M-80,${fn(-80)}`;
  for (let x = -60; x <= 1160; x += 16) d += ` L${x},${fn(x).toFixed(1)}`;
  return `${d} L1160,${bottom} L-80,${bottom} Z`;
};

const h1 = (x: number) => 860 - x * 0.03 + Math.sin(x / 130) * 18;
const h2 = (x: number) => 930 + Math.sin(x / 110 + 2) * 16 + x * 0.02;
const h3 = (x: number) => 1040 + Math.sin(x / 160 + 4) * 20;
const nearTop = (x: number) => 1225 + Math.pow(Math.max(0, x) / 1080, 1.7) * 110 - Math.sin(x / 150) * 16;

const HIGHLIGHT: Record<string, string> = {
  "How did Napoleon lose": "Napoleon",
  "everything in one afternoon?": "one afternoon?",
  "He thought he faced one army.": "one army.",
  "Then the Prussians arrived.": "Prussians",
};

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const push = prog(f, 0, SHOT2 + 12, Easing.bezier(0.3, 0, 0.6, 1));
  const L = (z: number) =>
    `translate(${-push * 50 * z},${-push * 10 * z}) translate(540,1000) scale(${1 + push * 0.08 * z}) translate(-540,-1000)`;
  const sunX = 650;
  const sunY = 835;

  const flag = (x: number, y: number, color: string, k: number, s = 1, pole = 90) => {
    let top = "";
    let bot = "";
    for (let i = 0; i <= 6; i++) {
      const u = i / 6;
      const wy = Math.sin(u * 4 - f / 4 + k) * 4 * u * s;
      top += `${i ? "L" : "M"}${(x + u * 46 * s).toFixed(1)},${(y + wy).toFixed(1)} `;
      bot = `L${(x + u * 46 * s).toFixed(1)},${(y + 30 * s + wy).toFixed(1)} ` + bot;
    }
    return (
      <g key={`${x}${y}`}>
        <rect x={x - 2 * s} y={y} width={3 * s} height={pole * s} fill={C.figure} />
        <path d={`${top} ${bot} Z`} fill={color} />
      </g>
    );
  };

  return (
    <g>
      <defs>
        <linearGradient id="cn-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.skyTop} />
          <stop offset="0.3" stopColor={C.skyMid} />
          <stop offset="0.47" stopColor={C.horizon} />
          <stop offset="0.6" stopColor="#ffc07a" />
        </linearGradient>
        <radialGradient id="cn-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff2c8" stopOpacity="0.95" />
          <stop offset="0.25" stopColor="#ffc37a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ff8a4c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cn-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb27a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffb27a" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="cn-smoke" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd9b8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffd9b8" stopOpacity="0" />
        </radialGradient>
        <filter id="cn-soft">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <rect x={-100} y={-100} width={1300} height={2200} fill="url(#cn-sky)" />

      {/* sun, rays, high cloud */}
      <g transform={L(0.08)}>
        <g opacity={0.09} style={{ mixBlendMode: "screen" }}>
          {Array.from({ length: 9 }, (_, i) => {
            const a = -170 + i * 20 + Math.sin(f / 60 + i) * 2;
            return (
              <path
                key={i}
                d={`M${sunX},${sunY} L${sunX + Math.cos(((a - 3) * Math.PI) / 180) * 1600},${sunY + Math.sin(((a - 3) * Math.PI) / 180) * 1600} L${sunX + Math.cos(((a + 3) * Math.PI) / 180) * 1600},${sunY + Math.sin(((a + 3) * Math.PI) / 180) * 1600} Z`}
                fill="#ffe2b0"
              />
            );
          })}
        </g>
        <circle cx={sunX} cy={sunY} r={420} fill="url(#cn-glow)" />
        <circle cx={sunX} cy={sunY} r={84} fill={C.sun} />
        {[
          { x: 200, y: 560, w: 520, h: 18 },
          { x: 760, y: 610, w: 420, h: 14 },
          { x: 420, y: 690, w: 360, h: 10 },
        ].map((c, i) => (
          <rect key={i} x={c.x - c.w / 2 - push * 40 * (i + 1)} y={c.y} width={c.w} height={c.h} rx={c.h / 2} fill="#ffcf9a" opacity={0.55} />
        ))}
      </g>

      {/* Wellington's ridge against the sun */}
      <g transform={L(0.3)}>
        <path d={ridgeD(h1)} fill={C.hill1} />
        {[140, 320, 500, 720, 900].map((x) => (
          <Ranks key={x} x={x} y={h1(x) + 3} cols={9} rows={1} dx={11} dy={0} s={0.4} fill={C.hill2} />
        ))}
        {[180, 540, 940].map((x, i) => flag(x, h1(x) - 86, C.red, i, 0.8))}
        <g transform={`translate(600,${h1(600) + 4})`}>
          <path d="M-46,0 V-26 L-30,-42 H22 L36,-26 V0 Z" fill={C.hill2} />
          <rect x={36} y={-16} width={30} height={16} fill={C.hill2} />
        </g>
        {[90, 430, 452, 1000].map((x, i) => (
          <ellipse key={x} cx={x} cy={h1(x) - 30 - i * 3} rx={10} ry={34 + i * 3} fill={C.hill2} />
        ))}
        <rect x={-100} y={760} width={1300} height={200} fill="url(#cn-haze)" />
      </g>

      {/* gunsmoke, lit from behind */}
      <g transform={L(0.4)} style={{ mixBlendMode: "screen" }}>
        {[
          { x: 220, y: 860, t0: -50, s: 50 },
          { x: 560, y: 840, t0: -10, s: 60 },
          { x: 880, y: 830, t0: 40, s: 46 },
          { x: 380, y: 950, t0: 70, s: 54 },
        ].map((c, i) =>
          f >= c.t0
            ? smokePuffs(i + 5, f - c.t0 + 20, c.s).map((p, j) => (
                <ellipse key={`${i}-${j}`} cx={c.x + p.x * 1.6} cy={c.y + p.y * 0.8} rx={p.r * 1.9} ry={p.r * 1.1} fill="url(#cn-smoke)" />
              ))
            : null,
        )}
      </g>

      {/* the valley, two steps nearer */}
      <g transform={L(0.5)}>
        <path d={ridgeD(h2)} fill={C.hill2} />
        <rect x={-100} y={900} width={1300} height={160} fill="url(#cn-haze)" opacity={0.6} />
      </g>
      <g transform={L(0.65)}>
        <path d={ridgeD(h3)} fill={C.hill3} />
        {[
          { x: 90, y: 1000, s: 0.62, cols: 9 },
          { x: 600, y: 1020, s: 0.68, cols: 8 },
        ].map((b, i) => (
          <g key={i} transform={`translate(${f * 0.22},${-f * 0.1})`}>
            <Ranks x={b.x} y={b.y} cols={b.cols} rows={3} dx={17 * b.s} dy={10 * b.s} s={b.s} fill={C.hill3} march={f} shear={-3} outline={C.hill2} />
            {flag(b.x + b.cols * 8 * b.s, b.y - 130 * b.s, C.blue, i + 3, b.s * 1.1)}
          </g>
        ))}
        <g transform={`translate(${f * 0.26},${-f * 0.08})`}>
          <Ranks x={180} y={1130} cols={9} rows={3} dx={15} dy={9} s={0.88} fill={C.near} march={f} shear={-3} outline={C.hill3} />
          {flag(250, 1015, C.blue, 7, 1)}
        </g>
      </g>

      {/* the near ridge and Napoleon, rim-lit */}
      <g transform={L(0.85)}>
        <path d={ridgeD(nearTop)} fill={C.near} />
        <path d={ridgeD(nearTop)} fill="none" stroke={C.rim} strokeWidth={3} opacity={0.5} />
        {flag(450, 900, C.blue, 9, 1.9, 186)}
        <g transform="translate(770,1300) scale(0.8) translate(-150,-700)">
          {/* the rim: the silhouette, nudged toward the sun, under the figure */}
          <g transform="translate(-5,-3)" filter="url(#cn-soft)" opacity={0.7}>
            {(["legs", "coat", "collar", "head", "hat"] as const).map((k) => (
              <path key={k} d={NAP[k]} fill={C.rim} />
            ))}
          </g>
          <g transform="translate(-4,-2)">
            {(["legs", "coat", "collar", "head", "hat"] as const).map((k) => (
              <path key={k} d={NAP[k]} fill={C.rim} />
            ))}
          </g>
          {(["legs", "coat", "collar", "head", "hat"] as const).map((k) => (
            <path key={k} d={NAP[k]} fill={C.figure} />
          ))}
          {NAP.seams.slice(1).map((d, i) => (
            <path key={i} d={d} fill="none" stroke="#2c2132" strokeWidth={4} strokeLinecap="round" />
          ))}
        </g>
      </g>

      {/* drifting embers */}
      {Array.from({ length: 26 }, (_, i) => {
        const x = (hash(i) * 1200 + f * (0.6 + hash(i + 2) * 1.2)) % 1200 - 60;
        const y = 600 + hash(i + 5) * 900 - f * (0.3 + hash(i + 7) * 0.5);
        const r = 1.5 + hash(i + 9) * 3;
        return <circle key={i} cx={x} cy={y} r={r} fill="#ffd6a0" opacity={0.25 + 0.5 * Math.abs(Math.sin(f / 14 + i))} />;
      })}
    </g>
  );
};

const MapView: React.FC<{ f: number }> = ({ f }) => {
  const p = prog(f, SHOT2 - 10, 300, Easing.bezier(0.25, 0.1, 0.25, 1));
  const unit = (u: [number, number, number, number], color: string, appear: number, k: string) => {
    const q = prog(f, appear, appear + 12, Easing.out(Easing.back(1.5)));
    const [x, y, w, h] = u;
    return (
      <g key={k} opacity={Math.min(1, q * 1.5)} transform={`translate(${x + w / 2},${y + h / 2}) scale(${q},${q}) translate(${-x - w / 2},${-y - h / 2})`}>
        <rect x={x - 4} y={y - 4} width={w + 8} height={h + 8} rx={h / 2 + 4} fill={color} opacity={0.25} filter="url(#cn-mglow)" />
        <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={color} />
      </g>
    );
  };
  const chip = (x: number, y: number, text: string, sub: string, color: string, appear: number) => {
    const q = prog(f, appear, appear + 14, Easing.out(Easing.cubic));
    const w = Math.max(text.length * 26, sub.length * 15) + 60;
    return (
      <g opacity={q} transform={`translate(${x},${y + (1 - q) * 20})`}>
        <rect x={-w / 2} y={-44} width={w} height={sub ? 88 : 60} rx={14} fill="#0b1020" opacity={0.85} stroke={color} strokeWidth={2.5} />
        <circle cx={-w / 2 + 26} cy={-14} r={8} fill={color} />
        <text x={-w / 2 + 46} y={-3} fontFamily={FONT.montserrat} fontWeight={800} fontSize={32} letterSpacing={3} fill={C.white}>
          {text}
        </text>
        {sub && (
          <text x={-w / 2 + 46} y={32} fontFamily={FONT.montserrat} fontWeight={600} fontSize={24} fill="#aab4cf">
            {sub}
          </text>
        )}
      </g>
    );
  };

  const arrows = MAP.prussians.map((b, i) => {
    const t = prog(f, 212 + i * 20, 262 + i * 20, Easing.inOut(Easing.cubic));
    return { d: arrowD(b, t, 26, 26, 50, 70), tip: arrowTip(b, t), t };
  });

  return (
    <div style={{ position: "absolute", inset: 0, perspective: 1700, background: "#0d1326" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "50% 60%",
          transform: `rotateX(${lerp(40, 26, p)}deg) scale(${lerp(1.28, 1.17, p)}) translateY(${lerp(10, -30, p)}px)`,
        }}
      >
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ overflow: "visible" }}>
          <defs>
            <filter id="cn-mglow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
            <radialGradient id="cn-mapfade" cx="0.5" cy="0.5" r="0.6">
              <stop offset="0.6" stopColor="#0d1326" stopOpacity="0" />
              <stop offset="1" stopColor="#0d1326" stopOpacity="1" />
            </radialGradient>
            <pattern id="cn-trees" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx={7} cy={7} r={4.5} fill="#2c6b5c" />
            </pattern>
            <pattern id="cn-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M60,0 V60 H0" fill="none" stroke="#1b2442" strokeWidth={1.5} />
            </pattern>
          </defs>
          <rect x={-600} y={-600} width={2280} height={3120} fill="#121a33" />
          <rect x={-600} y={-600} width={2280} height={3120} fill="url(#cn-grid)" />
          <g transform="translate(540,960) scale(1.02) translate(-540,-480)">
            <path d={MAP.river} stroke="#2f5d8a" strokeWidth={12} fill="none" strokeLinecap="round" />
            <path d={MAP.allyRidge} fill="#1d2848" />
            <path d={MAP.frenchRidge} fill="#1d2848" />
            {[0, 1, 2].map((i) => (
              <g key={i} fill="none" stroke="#2c3a66" strokeWidth={1.6}>
                <path d={`M80,${300 - i * 14} C300,${314 - i * 14} 680,${306 - i * 14} 940,${272 - i * 14}`} />
                <path d={`M120,${656 + i * 14} C340,${672 + i * 14} 660,${678 + i * 14} 920,${646 + i * 14}`} />
              </g>
            ))}
            {MAP.woods.map((w, i) => (
              <g key={i}>
                <ellipse cx={w.x} cy={w.y} rx={w.rx} ry={w.ry} fill="#143430" />
                <ellipse cx={w.x} cy={w.y} rx={w.rx - 6} ry={w.ry - 6} fill="url(#cn-trees)" />
              </g>
            ))}
            {MAP.roads.map((d, i) => (
              <path key={i} d={d} stroke="#53638f" strokeWidth={4} fill="none" strokeLinecap="round" />
            ))}
            {MAP.places.map((pl) => (
              <g key={pl.name} opacity={prog(f, 166, 182)}>
                <circle cx={pl.x} cy={pl.y - 30} r={7} fill={C.white} />
                <text x={pl.x} y={pl.name === "Hougoumont" ? pl.y - 50 : pl.y + 8} textAnchor="middle" fontFamily={FONT.montserrat} fontWeight={600} fontSize={24} fill="#b9c3dd">
                  {pl.name}
                </text>
              </g>
            ))}
            {MAP.allies.map((u, i) => unit(u, C.red, 158 + i * 3, `a${i}`))}
            {MAP.french.map((u, i) => unit(u, C.blue, 166 + i * 3, `f${i}`))}
            {arrows.map((a, i) => (
              <g key={i}>
                <path d={a.d} fill="#e9ecf5" opacity={0.35} filter="url(#cn-mglow)" />
                <path d={a.d} fill="#e9ecf5" />
                {a.t > 0 && a.t < 1 && <circle cx={a.tip[0]} cy={a.tip[1]} r={22} fill="#fff" opacity={0.5} filter="url(#cn-mglow)" />}
              </g>
            ))}
          </g>
          <rect x={-600} y={-600} width={2280} height={3120} fill="url(#cn-mapfade)" />
        </svg>
      </div>
      {/* chips stay upright, over the tilted board */}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        {chip(330, 470, "WELLINGTON", "68,000 men", C.red, 178)}
        {chip(330, 1330, "NAPOLEON", "73,000 men", C.blue, 188)}
        {chip(780, 330, "BLÜCHER", "+50,000 Prussians", "#e9ecf5", 238)}
      </svg>
    </div>
  );
};

export const CinematicStyle: React.FC = () => {
  useHistFonts();
  const f = useCurrentFrame();
  const x = prog(f, SHOT2 - 12, SHOT2 + 6, Easing.inOut(Easing.cubic));
  const cap = captionAt(f);
  const letters = "WATERLOO".split("");

  return (
    <AbsoluteFill style={{ background: C.skyTop, overflow: "hidden" }}>
      {x < 1 && (
        <AbsoluteFill style={{ transform: `scale(${1 + x * 0.25})`, filter: `blur(${x * 14}px)`, opacity: 1 - x }}>
          <svg width={1080} height={1920} viewBox="0 0 1080 1920">
            <Scene f={f} />
          </svg>
        </AbsoluteFill>
      )}
      {x > 0 && (
        <AbsoluteFill style={{ opacity: x, transform: `scale(${lerp(0.92, 1, x)})` }}>
          <MapView f={f} />
        </AbsoluteFill>
      )}

      {/* title, letter by letter */}
      {f < SHOT2 && (
        <div style={{ position: "absolute", top: 250, width: "100%", textAlign: "center", opacity: 1 - x }}>
          <div
            style={{
              fontFamily: FONT.montserrat,
              fontWeight: 700,
              fontSize: 34,
              letterSpacing: 14,
              color: C.rim,
              opacity: prog(f, 4, 18),
              transform: `translateY(${(1 - prog(f, 4, 18)) * 12}px)`,
            }}
          >
            18 · JUNE · 1815
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
            {letters.map((l, i) => {
              const q = prog(f, 8 + i * 2.5, 26 + i * 2.5, Easing.out(Easing.cubic));
              return (
                <span
                  key={i}
                  style={{
                    fontFamily: FONT.montserrat,
                    fontWeight: 900,
                    fontSize: 128,
                    letterSpacing: 6,
                    color: C.white,
                    opacity: q,
                    transform: `translateY(${(1 - q) * 40}px)`,
                    display: "inline-block",
                    textShadow: "0 6px 30px rgba(20,10,40,0.45)",
                  }}
                >
                  {l}
                </span>
              );
            })}
          </div>
          <div style={{ width: lerp(0, 520, prog(f, 20, 44)), height: 3, background: C.rim, margin: "18px auto 0" }} />
        </div>
      )}

      {/* captions, with the key words lit */}
      {cap && (() => {
        const q = Math.min(prog(f, cap.from, cap.from + 7), 1 - prog(f, cap.to - 5, cap.to));
        const hl = HIGHLIGHT[cap.text] ?? "";
        const i = cap.text.indexOf(hl);
        const before = i >= 0 ? cap.text.slice(0, i) : cap.text;
        const after = i >= 0 ? cap.text.slice(i + hl.length) : "";
        return (
          <div
            style={{
              position: "absolute",
              top: 1470,
              width: "100%",
              textAlign: "center",
              fontFamily: FONT.montserrat,
              fontWeight: 800,
              fontSize: 56,
              color: C.white,
              opacity: q,
              transform: `translateY(${(1 - q) * 14}px)`,
              textShadow: "0 4px 18px rgba(0,0,0,0.55)",
              padding: "0 60px",
            }}
          >
            {before}
            {i >= 0 && <span style={{ color: f >= SHOT2 ? "#e9ecf5" : C.rim, textDecoration: f >= SHOT2 ? "underline" : "none", textUnderlineOffset: 10 }}>{hl}</span>}
            {after}
          </div>
        );
      })()}

      <Grain id="cn-grain" frame={f} opacity={0.12} every={1} freq={0.95} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 85% 70% at 50% 45%, rgba(0,0,0,0) 60%, rgba(5,5,20,0.5) 100%)" }} />
    </AbsoluteFill>
  );
};
