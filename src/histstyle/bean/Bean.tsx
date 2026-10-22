import React from "react";
import { hash, onN } from "../shared";

// ── The cast: pebble people ───────────────────────────────────────────
//
// The house character for the bean-format history Shorts. A pebble head
// (an egg, wider at the jaw) in a real skin tone with blush, big eyebrows
// that do all the acting, dot eyes with a glint, a little nose; a pawn-
// shaped body in uniform, tube arms with mitten hands, stub legs. Hats and
// coats say who everyone is. Thick warm-black outline, one cel shadow.
//
// Local space: feet on y = 0, about 330 units tall without a hat, facing
// the camera. `look` slides the face left/right to turn the head.

export type Expr = "neutral" | "worried" | "angry" | "shocked" | "smug" | "sad" | "determined";
export type Hat = "bicorne" | "shako" | "bearskin" | "cap" | "none";
export type Outfit = {
  coat: string;
  shade: string;
  trim?: string; // collar, cuffs
  belts?: boolean; // white crossbelts
  buttons?: string;
  epaulette?: string;
  trousers?: string;
  cloak?: string; // a cloak over everything, for the rain
};

export const OUTFITS: Record<string, Outfit> = {
  napoleon: { coat: "#80838a", shade: "#5e6168", trim: "#2f5a3a", buttons: "#d8b45a", trousers: "#ece6d6" },
  french: { coat: "#2c4f94", shade: "#1f3a70", trim: "#c23a2e", belts: true, buttons: "#e6e1d2", epaulette: "#c23a2e", trousers: "#ece6d6" },
  gunner: { coat: "#26375e", shade: "#1a2747", trim: "#c23a2e", buttons: "#d8b45a", epaulette: "#c23a2e", trousers: "#26375e" },
  prussian: { coat: "#1f2a44", shade: "#141c30", trim: "#c23a2e", belts: true, buttons: "#d8b45a", trousers: "#5b5f68" },
  blucher: { coat: "#1f2a44", shade: "#141c30", trim: "#c23a2e", buttons: "#d8b45a", epaulette: "#d8b45a", trousers: "#ece6d6" },
  officer: { coat: "#2c4f94", shade: "#1f3a70", trim: "#c23a2e", buttons: "#d8b45a", epaulette: "#d8b45a", trousers: "#ece6d6" },
  soggy: { coat: "#2c4f94", shade: "#1f3a70", cloak: "#6f6a62", trousers: "#ece6d6" },
};

const LINE = "#231815";
const LW = 6;

const BROWS: Record<Expr, [number, number, number, number]> = {
  // left inner y, left outer y, (mirrored for right): [outerY, innerY] for left; right uses the same
  neutral: [-240, -240, 0, 0],
  worried: [-236, -250, 0, 0],
  sad: [-236, -248, 0, 0],
  angry: [-250, -236, 0, 0],
  determined: [-246, -238, 0, 0],
  shocked: [-246, -258, 0, 0],
  smug: [-240, -240, 1, 0],
};

export type BeanProps = {
  id: string;
  x: number;
  y: number;
  s?: number;
  f: number;
  outfit: Outfit;
  hat?: Hat;
  hatColor?: string;
  skin?: string;
  expr?: Expr;
  look?: number; // -1 … 1
  talk?: boolean;
  hands?: { l?: [number, number]; r?: [number, number] }; // hand targets in local space
  holding?: { r?: React.ReactNode; l?: React.ReactNode }; // drawn at the hand
  mustache?: boolean;
  hair?: string;
  shiver?: number;
  bob?: number;
  rim?: string; // a scene's back-light colour along the left edge
  flip?: boolean;
  sweat?: boolean;
  drip?: boolean;
};

const HEAD =
  "M0,-286 C40,-286 66,-254 66,-214 C66,-174 40,-148 0,-148 C-40,-148 -66,-174 -66,-214 C-66,-254 -40,-286 0,-286 Z";
const BODY =
  "M-38,-160 C-44,-118 -66,-80 -64,-52 C-63,-40 -54,-34 -42,-34 L42,-34 C54,-34 63,-40 64,-52 C66,-80 44,-118 38,-160 Z";

const HatShape: React.FC<{ hat: Hat; color?: string; f: number; id: string }> = ({ hat, color, f, id }) => {
  if (hat === "bicorne")
    return (
      <g>
        <path d="M-104,-262 C-80,-300 -40,-322 0,-324 C40,-322 80,-300 104,-262 C70,-276 36,-280 0,-280 C-36,-280 -70,-276 -104,-262 Z" fill={color ?? "#1c1a1c"} stroke={LINE} strokeWidth={LW} strokeLinejoin="round" />
        <path d="M-96,-266 C-60,-282 60,-282 96,-266" fill="none" stroke="#3a3639" strokeWidth={3} />
        <circle cx={0} cy={-292} r={14} fill="#2c4f94" stroke={LINE} strokeWidth={3} />
        <circle cx={0} cy={-292} r={9} fill="#f2ede0" />
        <circle cx={0} cy={-292} r={4.5} fill="#c23a2e" />
      </g>
    );
  if (hat === "shako")
    return (
      <g>
        <path d="M-44,-268 L-50,-336 C-20,-342 20,-342 50,-336 L44,-268 C20,-262 -20,-262 -44,-268 Z" fill={color ?? "#1c1a1c"} stroke={LINE} strokeWidth={LW} strokeLinejoin="round" />
        <path d="M-46,-274 C-20,-266 20,-266 46,-274 L48,-262 C20,-254 -20,-254 -48,-262 Z" fill="#111" stroke={LINE} strokeWidth={3} />
        <path d="M-14,-318 L0,-330 L14,-318 L10,-296 L-10,-296 Z" fill="#d8b45a" stroke={LINE} strokeWidth={3} />
        <ellipse cx={0} cy={-352} rx={9} ry={16} fill="#c23a2e" stroke={LINE} strokeWidth={3} />
      </g>
    );
  if (hat === "bearskin") {
    const fur: string[] = [];
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI;
      fur.push(`${(Math.cos(a) * -58).toFixed(1)},${(-330 - Math.sin(a) * 74 + (i % 2 ? 7 : 0)).toFixed(1)}`);
    }
    return (
      <g>
        <path d={`M-58,-262 L${fur.join(" L")} L58,-262 Z`} fill={color ?? "#201b1c"} stroke={LINE} strokeWidth={LW} strokeLinejoin="round" />
        <path d="M-22,-300 L0,-318 L22,-300 L16,-276 L-16,-276 Z" fill="#d8b45a" stroke={LINE} strokeWidth={3} />
        <path d={`M40,-300 C66,-330 ${62 + Math.sin(f / 6) * 3},-380 46,-396`} stroke="#c23a2e" strokeWidth={12} fill="none" strokeLinecap="round" />
      </g>
    );
  }
  if (hat === "cap")
    return (
      <g>
        <path d="M-60,-262 C-62,-300 -40,-316 0,-316 C40,-316 62,-300 60,-262 Z" fill={color ?? "#1f2a44"} stroke={LINE} strokeWidth={LW} strokeLinejoin="round" />
        <rect x={-60} y={-276} width={120} height={14} fill="#c23a2e" stroke={LINE} strokeWidth={3} />
        <path d="M-56,-262 C-30,-246 30,-246 56,-262" fill="#111" stroke={LINE} strokeWidth={4} />
        <circle cx={0} cy={-286} r={7} fill="#e6e1d2" stroke={LINE} strokeWidth={2} />
      </g>
    );
  void id;
  return null;
};

export const Bean: React.FC<BeanProps> = (p) => {
  const {
    id, x, y, s = 1, f, outfit, hat = "none", hatColor, skin = "#f2cfae", expr = "neutral", look = 0, talk, hands,
    holding, mustache, hair, shiver = 0, bob = 0, rim, flip, sweat, drip,
  } = p;
  const lx = look * 16;
  // blink every couple of seconds, staggered per character
  const seed = id.length * 7 + id.charCodeAt(0);
  const bp = (f + seed * 13) % 88;
  const blink = bp < 3 && expr !== "shocked" ? 0.15 : 1;
  const sx = shiver ? (hash(onN(f, 2) + seed) - 0.5) * shiver : 0;
  const breathe = Math.sin((f + seed) / 18) * 2;

  const [bo, bi, smugUp] = BROWS[expr];
  const mouth = (() => {
    if (talk) {
      const o = [2, 9, 5, 12, 3, 8][Math.floor((f + seed) / 3) % 6];
      return <ellipse cx={lx} cy={-184} rx={10} ry={o} fill="#5a1d1d" stroke={LINE} strokeWidth={4} />;
    }
    switch (expr) {
      case "shocked":
        return <ellipse cx={lx} cy={-180} rx={11} ry={15} fill="#5a1d1d" stroke={LINE} strokeWidth={4} />;
      case "sad":
      case "worried":
        return <path d={`M${lx - 13},-178 Q${lx},-190 ${lx + 13},-178`} fill="none" stroke={LINE} strokeWidth={5} strokeLinecap="round" />;
      case "angry":
      case "determined":
        return <path d={`M${lx - 14},-182 L${lx + 14},-184`} fill="none" stroke={LINE} strokeWidth={5} strokeLinecap="round" />;
      case "smug":
        return <path d={`M${lx - 14},-186 Q${lx + 2},-176 ${lx + 16},-190`} fill="none" stroke={LINE} strokeWidth={5} strokeLinecap="round" />;
      default:
        return <path d={`M${lx - 12},-184 Q${lx},-178 ${lx + 12},-184`} fill="none" stroke={LINE} strokeWidth={5} strokeLinecap="round" />;
    }
  })();

  const shoulderL: [number, number] = [-36, -142];
  const shoulderR: [number, number] = [36, -142];
  const hl = hands?.l ?? [-64, -62];
  const hr = hands?.r ?? [64, -62];
  const arm = (sh: [number, number], h: [number, number], side: number) => {
    const mid: [number, number] = [(sh[0] + h[0]) / 2 + side * 18, (sh[1] + h[1]) / 2 + 6];
    const d = `M${sh[0]},${sh[1]} Q${mid[0]},${mid[1]} ${h[0]},${h[1]}`;
    const c = outfit.cloak ?? outfit.coat;
    return (
      <g>
        <path d={d} stroke={LINE} strokeWidth={30} fill="none" strokeLinecap="round" />
        <path d={d} stroke={c} strokeWidth={18} fill="none" strokeLinecap="round" />
        <circle cx={h[0]} cy={h[1]} r={13} fill={skin} stroke={LINE} strokeWidth={5} />
      </g>
    );
  };

  const shadeClip = `${id}-shade`;
  return (
    <g transform={`translate(${x + sx},${y + bob}) scale(${flip ? -s : s},${s})`}>
      <ellipse cx={0} cy={2} rx={70} ry={12} fill="#000" opacity={0.25} />
      {/* legs */}
      <g>
        <rect x={-30} y={-46} width={22} height={44} rx={8} fill={outfit.trousers ?? "#ece6d6"} stroke={LINE} strokeWidth={5} />
        <rect x={8} y={-46} width={22} height={44} rx={8} fill={outfit.trousers ?? "#ece6d6"} stroke={LINE} strokeWidth={5} />
        <path d="M-34,-18 h30 v14 a6,6 0 0 1 -6,6 h-26 a6,6 0 0 1 -6,-6 v-6 Z" fill="#1b1716" stroke={LINE} strokeWidth={4} />
        <path d="M4,-18 h30 v14 a6,6 0 0 1 -6,6 h-26 a6,6 0 0 1 -6,-6 v-6 Z" fill="#1b1716" stroke={LINE} strokeWidth={4} transform="translate(0,0)" />
      </g>
      <g transform={`translate(0,${breathe * 0.4})`}>
        {/* body */}
        {rim && <path d={BODY} fill={rim} transform="translate(-6,-3)" />}
        <path d={BODY} fill={outfit.cloak ?? outfit.coat} stroke={LINE} strokeWidth={LW} strokeLinejoin="round" />
        <clipPath id={shadeClip}>
          <path d={BODY} />
        </clipPath>
        <g clipPath={`url(#${shadeClip})`}>
          <path d="M14,-170 C30,-120 40,-80 36,-30 L80,-30 L80,-170 Z" fill={outfit.cloak ? "#000" : outfit.shade} opacity={outfit.cloak ? 0.2 : 1} />
          {!outfit.cloak && outfit.trim && <path d="M-38,-160 L-20,-128 L0,-150 L20,-128 L38,-160 Z" fill={outfit.trim} stroke={LINE} strokeWidth={3} />}
          {!outfit.cloak && outfit.belts && <path d="M-44,-140 L40,-48 M44,-140 L-40,-48" stroke="#ece6d6" strokeWidth={10} />}
          {!outfit.cloak && outfit.buttons && [-112, -92, -72, -52].map((yy) => <circle key={yy} cx={0} cy={yy} r={4} fill={outfit.buttons} stroke={LINE} strokeWidth={1.5} />)}
          {outfit.cloak && <path d="M-6,-150 C-10,-110 -14,-70 -12,-34 M22,-150 C30,-110 34,-70 34,-34" stroke="#00000033" strokeWidth={5} fill="none" />}
        </g>
        {!outfit.cloak && outfit.epaulette && (
          <g>
            <ellipse cx={-40} cy={-150} rx={18} ry={9} fill={outfit.epaulette} stroke={LINE} strokeWidth={3} />
            <ellipse cx={40} cy={-150} rx={18} ry={9} fill={outfit.epaulette} stroke={LINE} strokeWidth={3} />
          </g>
        )}
        {arm(shoulderL, hl, -1)}
        {arm(shoulderR, hr, 1)}
        {holding?.l && <g transform={`translate(${hl[0]},${hl[1]})`}>{holding.l}</g>}
        {holding?.r && <g transform={`translate(${hr[0]},${hr[1]})`}>{holding.r}</g>}

        {/* head */}
        <g transform={`translate(0,${breathe * 0.6})`}>
          {rim && <path d={HEAD} fill={rim} transform="translate(-6,-4)" />}
          <path d={HEAD} fill={skin} stroke={LINE} strokeWidth={LW} />
          <path d="M30,-272 C58,-250 66,-210 52,-174 C44,-160 30,-152 14,-150 C40,-170 50,-216 30,-272 Z" fill="#000" opacity={0.07} />
          {hair && <path d={`M-62,-232 C-60,-272 -30,-288 0,-288 C30,-288 60,-272 62,-232 C50,-250 30,-262 0,-262 C-30,-262 -50,-250 -62,-232 Z`} fill={hair} stroke={LINE} strokeWidth={4} />}
          <circle cx={-36 + lx * 0.6} cy={-194} r={11} fill="#e8706a" opacity={0.35} />
          <circle cx={36 + lx * 0.6} cy={-194} r={11} fill="#e8706a" opacity={0.35} />
          {/* eyes */}
          {[-1, 1].map((sd) =>
            expr === "shocked" ? (
              <g key={sd}>
                <circle cx={sd * 23 + lx} cy={-220} r={16} fill="#fff" stroke={LINE} strokeWidth={4} />
                <circle cx={sd * 23 + lx} cy={-218} r={6} fill={LINE} />
              </g>
            ) : (
              <g key={sd}>
                <ellipse cx={sd * 21 + lx} cy={-218} rx={8} ry={11 * blink} fill={LINE} />
                {blink > 0.5 && <circle cx={sd * 21 + lx + 2.5} cy={-222} r={3} fill="#fff" />}
              </g>
            ),
          )}
          {/* brows */}
          <path d={`M${-36 + lx},${bo} L${-10 + lx},${bi}`} stroke={LINE} strokeWidth={8} strokeLinecap="round" />
          <path d={`M${36 + lx},${bo - smugUp * 10} L${10 + lx},${bi - smugUp * 10}`} stroke={LINE} strokeWidth={8} strokeLinecap="round" />
          <path d={`M${lx - 1},-209 q9,7 0,13`} fill="none" stroke={LINE} strokeWidth={4} strokeLinecap="round" />
          {mustache && (
            <path d={`M${lx},-196 C${lx - 18},-204 ${lx - 46},-196 ${lx - 58},-176 C${lx - 40},-186 ${lx - 18},-184 ${lx},-188 C${lx + 18},-184 ${lx + 40},-186 ${lx + 58},-176 C${lx + 46},-196 ${lx + 18},-204 ${lx},-196 Z`} fill="#f0ede6" stroke={LINE} strokeWidth={4} strokeLinejoin="round" />
          )}
          {!mustache && mouth}
          {mustache && talk && mouth}
          {sweat && <path d={`M58,-258 q8,14 0,20 q-8,-6 0,-20 Z`} fill="#bfe3ff" stroke={LINE} strokeWidth={3} transform={`translate(0,${(f % 30) * 0.6})`} />}
          {drip && <circle cx={-48} cy={-150 + ((f * 4 + seed) % 60)} r={4} fill="#9fc8ee" opacity={0.85} />}
          <HatShape hat={hat} color={hatColor} f={f} id={id} />
        </g>
      </g>
    </g>
  );
};

/** A pocket watch, the size of a hand. */
export const PocketWatch: React.FC<{ r?: number; t?: number }> = ({ r = 26, t = 0 }) => (
  <g>
    <circle r={r + 6} fill="#d8b45a" stroke={LINE} strokeWidth={4} />
    <circle r={r} fill="#f6f0dc" stroke={LINE} strokeWidth={2} />
    <line x1={0} y1={0} x2={Math.sin(t / 12) * r * 0.55} y2={-Math.cos(t / 12) * r * 0.55} stroke={LINE} strokeWidth={3} strokeLinecap="round" />
    <line x1={0} y1={0} x2={Math.sin(t) * r * 0.8} y2={-Math.cos(t) * r * 0.8} stroke={LINE} strokeWidth={2} strokeLinecap="round" />
    <rect x={-5} y={-r - 16} width={10} height={10} rx={3} fill="#d8b45a" stroke={LINE} strokeWidth={3} />
  </g>
);

/** A brass telescope, held from one end. */
export const Telescope: React.FC<{ angle?: number }> = ({ angle = -20 }) => (
  <g transform={`rotate(${angle})`}>
    <rect x={-10} y={-11} width={70} height={22} rx={4} fill="#b8894a" stroke={LINE} strokeWidth={4} />
    <rect x={56} y={-14} width={44} height={28} rx={4} fill="#d8b45a" stroke={LINE} strokeWidth={4} />
    <rect x={96} y={-17} width={14} height={34} rx={3} fill="#8a6a36" stroke={LINE} strokeWidth={4} />
  </g>
);
