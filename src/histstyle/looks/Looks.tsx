import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { FONT, hash, lerp, onN, prog, useHistFonts } from "../shared";
import { Bean, InkCtx, Musket, OUTFITS } from "../bean/Bean";

// ── Ten looks for the storybook explainer ────────────────────────────
//
// One scene — the 1914 soldier in red trousers marching with his column
// through the countryside — drawn ten ways, so a look can be picked for the
// series. A look sets the palette, the outline (colour, weight, or none),
// the face ink, and an optional treatment: an SVG filter over the whole
// picture (paint, chalk, print, clay, pixels) and a texture laid on top.

export type Look = {
  key: string;
  name: string;
  line: string;
  lw: number;
  face: string;
  sky: [string, string];
  sun?: string;
  cloud: string;
  cloudShade: string;
  far: string;
  mid: string;
  field: string;
  road: string;
  grass: string;
  tree: string;
  treeShade: string;
  bush: string;
  house: string;
  roof: string;
  label: string;
  labelInk: string;
  filter?: string; // id of a filter in <LookFilters>
  texture?: "paper" | "watercolour" | "grain" | "halftone" | "hatch" | "none";
  steps?: number; // animate on 1s, 2s or 3s
};

export const LOOKS: Look[] = [
  {
    key: "storybook", name: "Storybook", line: "#2b2320", lw: 6, face: "#2b2320",
    sky: ["#9ccbe2", "#f3dcc4"], cloud: "#f6d9c8", cloudShade: "#e9bfae", far: "#a9c98a", mid: "#7fb257", field: "#8fbf5c",
    road: "#d9bf8c", grass: "#5e8f3b", tree: "#86b864", treeShade: "#6d9f4f", bush: "#5f9444", house: "#efe2c6", roof: "#b5543c",
    label: "#f7ecd2", labelInk: "#b02a22", texture: "paper",
  },
  {
    key: "comic", name: "Bold Comic", line: "#0d0d0d", lw: 11, face: "#0d0d0d",
    sky: ["#3fa9f5", "#bfe8ff"], cloud: "#ffffff", cloudShade: "#cfe4f2", far: "#5fd068", mid: "#2fb34a", field: "#46c35a",
    road: "#ffcc4d", grass: "#1b7a2e", tree: "#33c24d", treeShade: "#1d8f35", bush: "#1d8f35", house: "#fff4d6", roof: "#ff4b3a",
    label: "#ffe14d", labelInk: "#0d0d0d", filter: "lk-comic", texture: "halftone",
  },
  {
    key: "watercolour", name: "Watercolour", line: "rgba(90,70,56,0.55)", lw: 2.5, face: "#3b2c22",
    sky: ["#b9d6e6", "#fbefe0"], cloud: "#fbf3ea", cloudShade: "#efdcd0", far: "#bcd3a4", mid: "#9cc27e", field: "#acd08a",
    road: "#e8d2a8", grass: "#7aa35c", tree: "#97c27a", treeShade: "#7aa862", bush: "#86b06a", house: "#f6ead6", roof: "#cf7b62",
    label: "#fbf3ea", labelInk: "#a8423a", filter: "lk-water", texture: "watercolour", steps: 2,
  },
  {
    key: "sepia", name: "Ink & Sepia", line: "#3a2616", lw: 5, face: "#3a2616",
    sky: ["#d9c39b", "#efe0c0"], cloud: "#f3e6c9", cloudShade: "#d9c29a", far: "#c8b083", mid: "#b79c6c", field: "#c4aa78",
    road: "#e5d2a8", grass: "#7e6440", tree: "#a88f60", treeShade: "#8c744a", bush: "#8c744a", house: "#efe0c0", roof: "#9b6a44",
    label: "#efe0c0", labelInk: "#7a2a1a", filter: "lk-sepia", texture: "hatch", steps: 3,
  },
  {
    key: "chalk", name: "Chalkboard", line: "#2b2320", lw: 6, face: "#2b2320",
    sky: ["#9ccbe2", "#f3dcc4"], cloud: "#f6d9c8", cloudShade: "#e9bfae", far: "#a9c98a", mid: "#7fb257", field: "#8fbf5c",
    road: "#d9bf8c", grass: "#5e8f3b", tree: "#86b864", treeShade: "#6d9f4f", bush: "#5f9444", house: "#efe2c6", roof: "#b5543c",
    label: "#f7ecd2", labelInk: "#b02a22", filter: "lk-chalk", texture: "none", steps: 2,
  },
  {
    key: "dusk", name: "Dusk", line: "#1b1020", lw: 6, face: "#1b1020",
    sky: ["#2b2350", "#f08a5a"], sun: "#ffd28a", cloud: "#f2a07e", cloudShade: "#c86a6a", far: "#7a4a6e", mid: "#553656", field: "#47304a",
    road: "#9a6a6a", grass: "#2e1f34", tree: "#5e3c5e", treeShade: "#4a2e4c", bush: "#3e2842", house: "#e8b08a", roof: "#8a3a3a",
    label: "#ffd9a8", labelInk: "#8a2a2a", texture: "grain",
  },
  {
    key: "pastel", name: "Soft Pastel", line: "rgba(60,40,60,0.18)", lw: 4, face: "#4a3a4a",
    sky: ["#cfe6f5", "#fde8e4"], cloud: "#ffffff", cloudShade: "#f4e2ea", far: "#cfe8c8", mid: "#b5dcae", field: "#c5e6b9",
    road: "#f6e2c8", grass: "#9fcf96", tree: "#b2dca4", treeShade: "#9cce90", bush: "#a6d49a", house: "#fff6ea", roof: "#f2a4a0",
    label: "#ffffff", labelInk: "#d0605a", texture: "grain",
  },
  {
    key: "riso", name: "Riso Print", line: "#1f2a6e", lw: 6, face: "#1f2a6e",
    sky: ["#9ccbe2", "#f3dcc4"], cloud: "#f6d9c8", cloudShade: "#e9bfae", far: "#a9c98a", mid: "#7fb257", field: "#8fbf5c",
    road: "#d9bf8c", grass: "#5e8f3b", tree: "#86b864", treeShade: "#6d9f4f", bush: "#5f9444", house: "#efe2c6", roof: "#b5543c",
    label: "#f7ecd2", labelInk: "#b02a22", filter: "lk-riso", texture: "grain", steps: 2,
  },
  {
    key: "clay", name: "Clay", line: "rgba(50,30,20,0.35)", lw: 4, face: "#2b1d16",
    sky: ["#a8d4ec", "#f6e2cc"], cloud: "#fff3e8", cloudShade: "#efd8c6", far: "#9fd07a", mid: "#78c050", field: "#86c85c",
    road: "#e2bf86", grass: "#5a9a36", tree: "#7cc455", treeShade: "#5ea83c", bush: "#5ea83c", house: "#f4e4c8", roof: "#d0583a",
    label: "#fff3e0", labelInk: "#b8322a", filter: "lk-clay", texture: "none", steps: 2,
  },
  {
    key: "pixel", name: "Pixel Art", line: "#1a1420", lw: 6, face: "#1a1420",
    sky: ["#5fb8f0", "#c8ecff"], cloud: "#ffffff", cloudShade: "#d4e8f5", far: "#6cc85a", mid: "#3fa646", field: "#52b84a",
    road: "#e0b060", grass: "#2a7a34", tree: "#3fa646", treeShade: "#2a7a34", bush: "#2a7a34", house: "#f0e0c0", roof: "#d04030",
    label: "#ffe060", labelInk: "#1a1420", filter: "lk-pixel", texture: "none", steps: 2,
  },
];

/** The treatments, as SVG filters over the whole picture. */
const LookFilters: React.FC<{ f: number }> = ({ f }) => (
  <defs>
    {/* comic: punchier colour, posterised into flat bands */}
    <filter id="lk-comic" colorInterpolationFilters="sRGB">
      <feColorMatrix type="saturate" values="1.35" />
      <feComponentTransfer>
        <feFuncR type="discrete" tableValues="0 0.3 0.55 0.8 1" />
        <feFuncG type="discrete" tableValues="0 0.3 0.55 0.8 1" />
        <feFuncB type="discrete" tableValues="0 0.3 0.55 0.8 1" />
      </feComponentTransfer>
    </filter>
    {/* watercolour: wobbly edges, colour that pools and softens, re-wet on twos */}
    <filter id="lk-water" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={3} seed={onN(f, 2) % 3} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" result="d" />
      <feGaussianBlur in="d" stdDeviation="2.2" result="b" />
      <feMorphology in="b" operator="erode" radius="3" result="e" />
      <feComposite in="b" in2="e" operator="arithmetic" k1="0" k2="1.7" k3="-0.7" k4="0" result="pooled" />
      <feComponentTransfer in="pooled">
        <feFuncR type="gamma" exponent="0.85" />
        <feFuncG type="gamma" exponent="0.85" />
        <feFuncB type="gamma" exponent="0.85" />
      </feComponentTransfer>
    </filter>
    {/* sepia: one brown ink, a little crushed */}
    <filter id="lk-sepia" colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values="0.42 0.72 0.18 0 0  0.34 0.64 0.16 0 0  0.25 0.48 0.12 0 0  0 0 0 1 0" />
      <feComponentTransfer>
        <feFuncR type="linear" slope="1.12" intercept="-0.04" />
        <feFuncG type="linear" slope="1.12" intercept="-0.04" />
        <feFuncB type="linear" slope="1.12" intercept="-0.04" />
      </feComponentTransfer>
    </filter>
    {/* chalk: the drawing's edges in broken white chalk, a ghost of colour, on a green board */}
    <filter id="lk-chalk" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feColorMatrix in="SourceGraphic" type="luminanceToAlpha" result="lum" />
      <feConvolveMatrix in="lum" order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" preserveAlpha="false" result="edge" />
      <feComponentTransfer in="edge" result="edgeA">
        <feFuncA type="linear" slope="16" intercept="0" />
      </feComponentTransfer>
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={onN(f, 2) % 4} result="dust" />
      <feColorMatrix in="dust" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -2.2 2.2" result="dustA" />
      <feMorphology in="edgeA" operator="dilate" radius="1" result="edgeThick" />
      <feComposite in="edgeThick" in2="dustA" operator="in" result="broken" />
      <feFlood floodColor="#f4f1e6" />
      <feComposite in2="broken" operator="in" result="chalk" />
      <feFlood floodColor="#24453a" result="board" />
      <feComponentTransfer in="SourceGraphic" result="ghost">
        <feFuncA type="linear" slope="0.12" />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode in="board" />
        <feMergeNode in="ghost" />
        <feMergeNode in="chalk" />
      </feMerge>
    </filter>
    {/* riso: three inks — blue, fluorescent pink, yellow — on cream stock */}
    <filter id="lk-riso" colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" />
      <feComponentTransfer result="mapped">
        <feFuncR type="table" tableValues="0.13 0.25 1 1 0.97" />
        <feFuncG type="table" tableValues="0.16 0.3 0.29 0.89 0.94" />
        <feFuncB type="table" tableValues="0.43 0.62 0.69 0.2 0.88" />
      </feComponentTransfer>
      <feOffset in="mapped" dx="4" dy="-3" result="off" />
      <feBlend in="mapped" in2="off" mode="multiply" result="reg" />
      <feComposite in="reg" in2="mapped" operator="arithmetic" k1="0" k2="0.65" k3="0.35" k4="0" />
    </filter>
    {/* clay: the picture's own light and dark used as a surface, lit from the top left */}
    <filter id="lk-clay" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feColorMatrix in="SourceGraphic" type="luminanceToAlpha" result="h" />
      <feGaussianBlur in="h" stdDeviation="5" result="hb" />
      <feDiffuseLighting in="hb" surfaceScale="-11" diffuseConstant="1.05" lightingColor="#fff6ea" result="diff">
        <feDistantLight azimuth="225" elevation="52" />
      </feDiffuseLighting>
      <feSpecularLighting in="hb" surfaceScale="-11" specularConstant="0.85" specularExponent="22" lightingColor="#ffffff" result="spec">
        <feDistantLight azimuth="225" elevation="52" />
      </feSpecularLighting>
      <feComposite in="SourceGraphic" in2="diff" operator="arithmetic" k1="1.15" k2="0" k3="0" k4="0" result="lit" />
      <feComposite in="lit" in2="spec" operator="arithmetic" k1="0" k2="1" k3="0.35" k4="0" />
    </filter>
    {/* pixel: 10 px blocks, a short palette */}
    <filter id="lk-pixel" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feFlood x="4" y="4" width="2" height="2" />
      <feComposite width="10" height="10" />
      <feTile result="grid" />
      <feComposite in="SourceGraphic" in2="grid" operator="in" />
      <feMorphology operator="dilate" radius="5" result="px" />
      <feComponentTransfer in="px">
        <feFuncR type="discrete" tableValues="0.1 0.35 0.6 0.85 1" />
        <feFuncG type="discrete" tableValues="0.1 0.35 0.6 0.85 1" />
        <feFuncB type="discrete" tableValues="0.1 0.35 0.6 0.85 1" />
      </feComponentTransfer>
    </filter>
  </defs>
);

const Texture: React.FC<{ kind: Look["texture"]; f: number; id: string }> = ({ kind, f, id }) => {
  if (!kind || kind === "none") return null;
  if (kind === "halftone")
    return (
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: 0.22 }}>
        <pattern id={`${id}-ht`} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
          <circle cx="6" cy="6" r="2.6" fill="#000" />
        </pattern>
        <rect width={1920} height={1080} fill={`url(#${id}-ht)`} />
      </svg>
    );
  if (kind === "hatch")
    return (
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: 0.16 }}>
        <pattern id={`${id}-hh`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <path d="M0,4.5 H9" stroke="#3a2616" strokeWidth="1.4" />
        </pattern>
        <rect width={1920} height={1080} fill={`url(#${id}-hh)`} />
      </svg>
    );
  const paper = kind === "paper" || kind === "watercolour";
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: kind === "watercolour" ? 0.32 : paper ? 0.16 : 0.1 }}>
      <filter id={`${id}-n`}>
        <feTurbulence type="fractalNoise" baseFrequency={paper ? "0.65 0.12" : "0.95"} numOctaves={2} seed={paper ? 4 : onN(f, 2)} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={1920} height={1080} filter={`url(#${id}-n)`} />
    </svg>
  );
};

// ── the scene ─────────────────────────────────────────────────────────

const LookScene: React.FC<{ L: Look; lf: number }> = ({ L, lf }) => {
  const W = 1920, H = 1080;
  const o = { stroke: L.line, strokeWidth: L.lw * 0.7 };
  const step = (k: number) => Math.abs(Math.sin((lf + k * 7) / 5)) * -10;
  const push = interpolate(lf, [0, 90], [1, 1.05], { extrapolateRight: "clamp" });
  const labelP = prog(lf, 22, 34, Easing.out(Easing.back(1.8)));
  const tree = (x: number, y: number, s: number) => (
    <g transform={`translate(${x},${y}) scale(${s})`} key={`${x}`}>
      <path d="M-10,0 L-8,-90 L8,-90 L10,0 Z" fill="#7a5233" stroke={L.line} strokeWidth={L.lw * 0.7} strokeLinejoin="round" />
      {[[0, -150, 62], [-46, -112, 48], [46, -110, 50], [0, -96, 52]].map(([bx, by, r], i) => (
        <circle key={`o${i}`} cx={bx} cy={by} r={r} fill="none" stroke={L.line} strokeWidth={L.lw * 1.4} />
      ))}
      {[[0, -150, 62], [-46, -112, 48], [46, -110, 50], [0, -96, 52]].map(([bx, by, r], i) => (
        <circle key={`f${i}`} cx={bx} cy={by} r={r} fill={L.tree} />
      ))}
      <path d="M-40,-90 C-20,-70 30,-70 60,-96 C50,-60 -30,-58 -40,-90 Z" fill={L.treeShade} />
    </g>
  );
  const cloud = (x: number, y: number, s: number) => (
    <g transform={`translate(${x},${y}) scale(${s})`} key={`c${x}`}>
      <path d="M-120,20 C-130,-10 -100,-30 -74,-20 C-66,-52 -20,-60 0,-36 C16,-66 70,-62 76,-24 C108,-30 130,-4 118,20 Z" fill={L.cloud} />
      <path d="M-120,20 C-90,8 90,8 118,20 Z" fill={L.cloudShade} />
    </g>
  );
  return (
    <g transform={`translate(960,800) scale(${push}) translate(-960,-800)`}>
      <defs>
        <linearGradient id={`lk-sky-${L.key}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={L.sky[0]} />
          <stop offset="1" stopColor={L.sky[1]} />
        </linearGradient>
      </defs>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={`url(#lk-sky-${L.key})`} />
      {L.sun && <circle cx={1500} cy={470} r={110} fill={L.sun} />}
      {cloud(300 + lf * 0.4, 170, 1.7)}
      {cloud(1300 + lf * 0.3, 110, 1.3)}
      {cloud(860 + lf * 0.5, 320, 0.8)}
      <path d={`M-200,560 C200,500 560,540 900,510 C1240,480 1600,520 ${W + 200},500 L${W + 200},${H + 200} L-200,${H + 200} Z`} fill={L.far} {...o} />
      {[140, 520, 1500, 1760].map((x, i) => tree(x, 540 - (i % 2) * 14, 0.5))}
      <g transform="translate(1080,520)">
        {[[-60, 0, 70, 46], [20, 4, 90, 54], [120, 2, 60, 40]].map(([x, y, w, h], i) => (
          <g key={i}>
            <rect x={x} y={y - h} width={w} height={h} fill={L.house} {...o} />
            <path d={`M${x - 8},${y - h} L${x + w / 2},${y - h - 30} L${x + w + 8},${y - h} Z`} fill={L.roof} {...o} strokeLinejoin="round" />
          </g>
        ))}
        <rect x={210} y={-110} width={34} height={110} fill={L.house} {...o} />
        <path d="M204,-110 L227,-170 L250,-110 Z" fill={L.roof} {...o} strokeLinejoin="round" />
      </g>
      <path d={`M-200,660 C300,610 800,650 1200,620 C1500,600 1750,630 ${W + 200},610 L${W + 200},${H + 200} L-200,${H + 200} Z`} fill={L.mid} {...o} />
      {[80, 380, 1240, 1620].map((x) => (
        <ellipse key={x} cx={x} cy={668} rx={70} ry={34} fill={L.bush} {...o} />
      ))}
      <path d={`M-200,780 C400,740 1100,770 ${W + 200},740 L${W + 200},${H + 200} L-200,${H + 200} Z`} fill={L.field} {...o} />
      <path d="M1180,752 C1150,820 1000,880 1060,960 C1110,1020 1300,1060 1360,1100 L1560,1100 C1440,1040 1240,1000 1220,950 C1190,880 1290,820 1250,750 Z" fill={L.road} {...o} />
      {Array.from({ length: 50 }, (_, i) => {
        const x = hash(i) * W;
        const y = 800 + hash(i + 7) * 260;
        return <path key={i} d={`M${x},${y} l6,-14 M${x + 8},${y} l2,-16 M${x + 16},${y} l-4,-12`} stroke={L.grass} strokeWidth={3} strokeLinecap="round" />;
      })}
      {Array.from({ length: 9 }, (_, i) => (
        <Bean key={i} id={`lk${i}`} x={((i * 150 + lf * 2.2) % 1500) + 200} y={735 + step(i) * 0.5} s={0.5} f={lf} outfit={OUTFITS.fr1914} hat="kepi" expr="neutral" look={0.8} hands={{ l: [-50, -80], r: [40, -150] }} holding={{ r: <Musket angle={-80} /> }} />
      ))}
      <Bean id="lkhero" x={700} y={990 + step(0)} s={1.25} f={lf} outfit={OUTFITS.fr1914} hat="kepi" expr={labelP > 0.5 ? "worried" : "neutral"} look={labelP > 0.5 ? 0 : 0.6} hands={{ l: [-60, -76], r: [52, -150] }} holding={{ r: <Musket angle={-80} /> }} />
      <g opacity={labelP > 0 ? 1 : 0}>
        <path d={`M1100,750 Q980,860 770,950`} stroke={L.line} strokeWidth={Math.max(3, L.lw * 0.8)} fill="none" />
        <g transform={`translate(1140,720) scale(${labelP}) rotate(-3)`}>
          <rect x={-180} y={-30} width={360} height={60} rx={6} fill={L.label} stroke={L.line} strokeWidth={Math.max(3, L.lw * 0.8)} />
          <text y={12} textAnchor="middle" fontFamily={FONT.oswald} fontWeight={700} fontSize={34} letterSpacing={3} fill={L.labelInk}>
            PANTALON ROUGE
          </text>
        </g>
      </g>
    </g>
  );
};

/** One look, full frame. */
export const LookFrame: React.FC<{ L: Look; lf: number; f: number; tag?: string }> = ({ L, lf, f, tag }) => {
  const t = L.steps ? onN(lf, L.steps) : lf;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <LookFilters f={f} />
        <InkCtx.Provider value={{ line: L.line, lw: L.lw, face: L.face }}>
          <g filter={L.filter ? `url(#${L.filter})` : undefined}>
            <LookScene L={L} lf={t} />
          </g>
        </InkCtx.Provider>
      </svg>
      <Texture kind={L.texture} f={f} id={`tx-${L.key}`} />
      {L.key === "dusk" && <AbsoluteFill style={{ background: "radial-gradient(circle at 78% 44%, rgba(255,190,120,0.35), rgba(255,190,120,0) 40%)", mixBlendMode: "screen" }} />}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 75% at 50% 50%, rgba(30,15,10,0) 65%, rgba(30,15,10,0.25) 100%)" }} />
      {tag && (
        <div style={{ position: "absolute", left: 36, top: 30, padding: "10px 22px", borderRadius: 12, background: "rgba(0,0,0,0.72)", color: "#fff", fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 40 }}>
          {tag}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const LOOK_SECONDS = 3;

/** The reel: every look for three seconds, labelled. */
export const LooksReel: React.FC = () => {
  useHistFonts();
  const f = useCurrentFrame();
  const per = LOOK_SECONDS * 30;
  const i = Math.min(LOOKS.length - 1, Math.floor(f / per));
  const lf = f - i * per;
  const L = LOOKS[i];
  return <LookFrame L={L} lf={lf + 20} f={f} tag={`${String(i + 1).padStart(2, "0")} · ${L.name}`} />;
};

export const LOOKS_FRAMES = LOOKS.length * LOOK_SECONDS * 30;
void lerp;
