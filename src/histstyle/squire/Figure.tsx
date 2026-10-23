import React from "react";
import { hash, onN } from "../shared";

// ── Figure: the long-form cast, rig v2 ────────────────────────────────
//
// Built to the finish of a professional 2D explainer: a big round head on
// a small body, thin even outlines in a warm dark brown, every part shaded
// with a soft gradient (lit from the upper left) and a cel shadow, real
// two-segment arms with mitten hands and thumbs, legs with boots, and the
// kit drawn properly — belts, pouches, packs, piping, buttons. Arms take
// poses rather than raw coordinates; walking lifts the feet in turn.
//
// Local space: feet on y = 0, head centre at y = -262, about 340 tall
// without a hat at s = 1. Faces the camera; `look` turns the face.

const LN = "#1d1818";
const LW = 5.5;

export type FigExpr = "neutral" | "happy" | "worried" | "sad" | "angry" | "shocked" | "smug" | "determined";
export type FigHat = "kepi" | "pickelhaube" | "shako" | "shakoFr" | "none";
export type Pose = "down" | "rifle" | "wave" | "aim" | "forward" | "shrug" | "hips";

export type Kit = {
  coat: string;
  coatShade: string;
  facing?: string; // collar, cuffs, lapels
  lapels?: boolean;
  crossbelts?: boolean;
  belt?: string;
  pouches?: boolean;
  pack?: string;
  buttons?: string;
  trousers: string;
  trousersShade: string;
  boots?: string;
  gaiters?: string;
  skirt?: boolean; // greatcoat skirts with the corners buttoned back
};

export const KITS: Record<string, Kit> = {
  fr1914: {
    coat: "#64799f", coatShade: "#4b5c80", facing: "#3a4a74", belt: "#4a3426", pouches: true, pack: "#6e5c45",
    buttons: "#e1bf63", trousers: "#cf3b2e", trousersShade: "#a82c23", boots: "#2d2420", gaiters: "#6b4a33", skirt: true,
  },
  de1914: {
    coat: "#8a8f77", coatShade: "#70755f", facing: "#7a7f68", belt: "#2a2622", pouches: true, pack: "#6a6250",
    buttons: "#c8c6aa", trousers: "#80856e", trousersShade: "#686d58", boots: "#22201d",
  },
  redcoat: {
    coat: "#c8402f", coatShade: "#9c3024", facing: "#27386e", crossbelts: true, buttons: "#f1ebdc",
    trousers: "#5f6574", trousersShade: "#4b505d", boots: "#24201d", pack: "#2d2a2a",
  },
  bluecoat: {
    coat: "#2f529e", coatShade: "#233f7d", facing: "#efe9dc", lapels: true, crossbelts: true, buttons: "#e1bf63",
    trousers: "#efe9dc", trousersShade: "#cfc8b8", boots: "#24201d", pack: "#5a4430",
  },
};

const BROWS: Record<FigExpr, { o: number; i: number; curve: number }> = {
  neutral: { o: -292, i: -292, curve: -3 },
  happy: { o: -296, i: -296, curve: -6 },
  worried: { o: -288, i: -300, curve: 0 },
  sad: { o: -288, i: -298, curve: 0 },
  angry: { o: -300, i: -286, curve: 0 },
  determined: { o: -297, i: -289, curve: -1 },
  shocked: { o: -306, i: -306, curve: -6 },
  smug: { o: -292, i: -292, curve: -3 },
};

// arm angles: 0 = hanging down, 90 = straight out to the side, 180 = up;
// negative swings the arm across the body. [upper, forearm] per arm.
const POSES: Record<Pose, { l: [number, number]; r: [number, number] }> = {
  down: { l: [8, 4], r: [8, 4] },
  rifle: { l: [10, 6], r: [16, -152] },
  wave: { l: [8, 4], r: [128, 168] },
  aim: { l: [-48, -84], r: [68, 86] },
  forward: { l: [74, 92], r: [74, 92] },
  shrug: { l: [42, 140], r: [42, 140] },
  hips: { l: [38, -40], r: [38, -40] },
};

const U = 54; // upper arm
const F = 50; // forearm

const Grad: React.FC<{ id: string; a: string; b: string; v?: boolean }> = ({ id, a, b, v }) => (
  <linearGradient id={id} x1="0" y1="0" x2={v ? 0 : 1} y2={v ? 1 : 0}>
    <stop offset="0.35" stopColor={a} />
    <stop offset="1" stopColor={b} />
  </linearGradient>
);

export const Lebel: React.FC<{ bayonet?: boolean }> = ({ bayonet = true }) => (
  // a long rifle held upright at the hand: butt below, muzzle up
  <g>
    <path d="M-7,70 L-9,26 L-5,-10 L-3,-150 L3,-150 L5,-10 L9,26 L7,70 Z" fill="#8a5a34" stroke={LN} strokeWidth={LW} strokeLinejoin="round" />
    <rect x={-2.5} y={-196} width={5} height={70} fill="#7d838a" stroke={LN} strokeWidth={2.4} />
    {bayonet && <path d="M-1.5,-196 L0,-258 L1.5,-196 Z" fill="#c9cfd5" stroke={LN} strokeWidth={2} />}
    <rect x={-6} y={-30} width={12} height={8} fill="#5d4a36" stroke={LN} strokeWidth={2} />
  </g>
);

export const MusketH: React.FC = () => (
  // a musket held level at the right hand, muzzle forward
  <g>
    <path d="M-78,-4 L-46,-9 L56,-7 L56,7 L-46,7 L-82,15 Z" fill="#8a5a34" stroke={LN} strokeWidth={LW} strokeLinejoin="round" />
    <rect x={36} y={-8} width={150} height={7} rx={2} fill="#8d939a" stroke={LN} strokeWidth={2.6} />
    <path d="M184,-7 L220,-5 L184,-2 Z" fill="#d3d8dd" stroke={LN} strokeWidth={2} />
    <rect x={-10} y={-12} width={12} height={8} fill="#d8b45a" stroke={LN} strokeWidth={2} />
  </g>
);

export const Figure: React.FC<{
  id: string;
  x: number;
  y: number;
  s?: number;
  f: number;
  kit: Kit;
  hat?: FigHat;
  skin?: string;
  expr?: FigExpr;
  look?: number;
  talk?: boolean;
  pose?: Pose;
  walk?: number; // phase in frames, or undefined to stand
  hold?: React.ReactNode; // at the right hand
  flip?: boolean;
  sweat?: boolean;
  mustache?: string;
  shadow?: boolean;
  tint?: number; // 0..1 fade toward the air, for figures far off
  air?: string;
}> = (p) => {
  const {
    id, x, y, s = 1, f, kit, hat = "none", skin = "#f8e3cf", expr = "neutral", look = 0, talk, pose = "down", walk,
    hold, flip, sweat, mustache, shadow = true, tint = 0, air = "#cfe0ea",
  } = p;
  const g = (k: string) => `${id}-${k}`;
  const lx = look * 15;
  const seed = id.length * 7 + id.charCodeAt(id.length - 1);
  const blink = (f + seed * 11) % 96 < 3 && expr !== "shocked" ? 0.12 : 1;
  const ph = walk === undefined ? 0 : walk / 4.2;
  const bob = walk === undefined ? Math.sin((f + seed) / 22) * 1.2 : -Math.abs(Math.sin(ph)) * 7;
  const liftL = walk === undefined ? 0 : Math.max(0, Math.sin(ph)) * 12;
  const liftR = walk === undefined ? 0 : Math.max(0, -Math.sin(ph)) * 12;
  const swing = walk === undefined ? 0 : Math.sin(ph) * 14;

  const P = POSES[pose];
  const arm = (side: -1 | 1, ang: [number, number]) => {
    const extra = side === -1 && pose === "rifle" ? swing : pose === "down" ? side * swing : 0;
    const a = ((ang[0] + extra) * Math.PI) / 180;
    const b = ((ang[1] + extra) * Math.PI) / 180;
    const sh: [number, number] = [side * 40, -190];
    const el: [number, number] = [sh[0] + side * Math.sin(a) * U, sh[1] + Math.cos(a) * U];
    const ha: [number, number] = [el[0] + side * Math.sin(b) * F, el[1] + Math.cos(b) * F];
    const d = `M${sh[0]},${sh[1]} L${el[0].toFixed(1)},${el[1].toFixed(1)} L${ha[0].toFixed(1)},${ha[1].toFixed(1)}`;
    return { d, ha, el };
  };
  const L = arm(-1, P.l);
  const R = arm(1, P.r);
  const sleeve = (d: string) => (
    <g>
      <path d={d} stroke={LN} strokeWidth={27 + LW * 2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={`url(#${g("coat")})`} strokeWidth={27} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
  const hand = (h: [number, number], side: number) => (
    <g>
      <circle cx={h[0]} cy={h[1]} r={12} fill={skin} stroke={LN} strokeWidth={LW} />
      <ellipse cx={h[0] - side * 9} cy={h[1] - 5} rx={5} ry={7} fill={skin} stroke={LN} strokeWidth={2.6} transform={`rotate(${side * 30},${h[0] - side * 9},${h[1] - 5})`} />
    </g>
  );

  const [bo, bi] = [BROWS[expr].o, BROWS[expr].i];
  const mouth = (() => {
    const mx = lx;
    if (talk) {
      const o = [3, 10, 6, 13, 4, 9][Math.floor((f + seed) / 3) % 6];
      return <path d={`M${mx - 12},-226 Q${mx},${-226 + o * 1.6} ${mx + 12},-226 Z`} fill="#6b2a26" stroke={LN} strokeWidth={3} strokeLinejoin="round" />;
    }
    switch (expr) {
      case "shocked":
        return <ellipse cx={mx} cy={-222} rx={10} ry={13} fill="#6b2a26" stroke={LN} strokeWidth={3} />;
      case "happy":
        return <path d={`M${mx - 14},-230 Q${mx},-210 ${mx + 14},-230 Z`} fill="#6b2a26" stroke={LN} strokeWidth={3} strokeLinejoin="round" />;
      case "worried":
      case "sad":
        return <path d={`M${mx - 11},-220 Q${mx},-230 ${mx + 11},-220`} fill="none" stroke={LN} strokeWidth={3.4} strokeLinecap="round" />;
      case "angry":
      case "determined":
        return <path d={`M${mx - 11},-224 L${mx + 11},-225`} fill="none" stroke={LN} strokeWidth={3.4} strokeLinecap="round" />;
      case "smug":
        return <path d={`M${mx - 10},-226 Q${mx + 2},-218 ${mx + 13},-230`} fill="none" stroke={LN} strokeWidth={3.4} strokeLinecap="round" />;
      default:
        return <path d={`M${mx - 9},-226 Q${mx},-220 ${mx + 9},-226`} fill="none" stroke={LN} strokeWidth={3.4} strokeLinecap="round" />;
    }
  })();

  const coatPath = kit.skirt
    ? "M-42,-200 C-50,-160 -54,-120 -58,-62 L-30,-58 L0,-66 L30,-58 L58,-62 C54,-120 50,-160 42,-200 C20,-208 -20,-208 -42,-200 Z"
    : "M-42,-200 C-48,-160 -50,-120 -50,-90 L50,-90 C50,-120 48,-160 42,-200 C20,-208 -20,-208 -42,-200 Z";

  const hatEl = (() => {
    switch (hat) {
      case "kepi":
        return (
          <g>
            <path d="M-44,-318 L-38,-372 C-10,-382 26,-380 46,-374 L50,-320 C20,-312 -16,-312 -44,-318 Z" fill={`url(#${g("red")})`} stroke={LN} strokeWidth={LW} strokeLinejoin="round" />
            <path d="M-46,-300 L-44,-320 C-14,-314 20,-314 50,-322 L52,-302 C20,-294 -16,-294 -46,-300 Z" fill="#2f3f6a" stroke={LN} strokeWidth={LW} strokeLinejoin="round" />
            <path d="M-40,-300 C-10,-282 30,-282 56,-302 C30,-292 -10,-292 -40,-300 Z" fill="#1d1a1a" stroke={LN} strokeWidth={LW} strokeLinejoin="round" />
            <path d="M-44,-306 C-14,-298 22,-298 50,-308" stroke="#e1bf63" strokeWidth={2.6} fill="none" />
            <circle cx={-40} cy={-304} r={3.6} fill="#e1bf63" stroke={LN} strokeWidth={1.6} />
            <circle cx={46} cy={-306} r={3.6} fill="#e1bf63" stroke={LN} strokeWidth={1.6} />
            <path d="M-30,-366 C-10,-372 14,-372 30,-368" stroke="#ff8a7a" strokeWidth={4} opacity={0.6} fill="none" strokeLinecap="round" />
          </g>
        );
      case "pickelhaube":
        return (
          <g>
            <path d="M-58,-306 C-62,-360 -30,-380 0,-380 C30,-380 62,-360 58,-306 Z" fill={`url(#${g("helm")})`} stroke={LN} strokeWidth={LW} strokeLinejoin="round" />
            <path d="M-9,-378 L-6,-410 L6,-410 L9,-378 Z" fill="#8f9278" stroke={LN} strokeWidth={LW} strokeLinejoin="round" />
            <path d="M-56,-306 C-24,-290 30,-290 62,-308 C30,-298 -24,-298 -56,-306 Z" fill="#22201d" stroke={LN} strokeWidth={LW} />
            <text x={0} y={-332} textAnchor="middle" fontFamily="Oswald, sans-serif" fontWeight={700} fontSize={22} fill="#b8352a">
              {"16"}
            </text>
          </g>
        );
      case "shako":
      case "shakoFr":
        return (
          <g>
            <path d="M-40,-312 L-46,-380 C-16,-388 18,-388 46,-380 L40,-312 C16,-306 -16,-306 -40,-312 Z" fill="#1f1c1d" stroke={LN} strokeWidth={LW} strokeLinejoin="round" />
            <path d="M-42,-318 C-16,-310 18,-310 42,-318 L44,-306 C16,-298 -16,-298 -44,-306 Z" fill="#111" stroke={LN} strokeWidth={2.6} />
            <path d="M-12,-358 L0,-370 L12,-358 L9,-336 L-9,-336 Z" fill="#e1bf63" stroke={LN} strokeWidth={2.4} />
            {hat === "shako" ? (
              <path d="M0,-386 C-10,-404 -6,-426 0,-434 C6,-426 10,-404 0,-386 Z" fill="#f4f0e6" stroke={LN} strokeWidth={2.4} />
            ) : (
              <circle cx={0} cy={-392} r={10} fill="#c8402f" stroke={LN} strokeWidth={2.4} />
            )}
          </g>
        );
      default:
        return null;
    }
  })();

  const mix = (c: string) => c; // colours stay; distance haze is laid over below

  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      <defs>
        <Grad id={g("coat")} a={mix(kit.coat)} b={mix(kit.coatShade)} />
        <Grad id={g("trou")} a={mix(kit.trousers)} b={mix(kit.trousersShade)} />
        <Grad id={g("red")} a="#d8463a" b="#a92e25" />
        <Grad id={g("helm")} a="#9a9d84" b="#7c7f69" />
        <radialGradient id={g("skin")} cx="0.38" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#fff3e6" />
          <stop offset="0.55" stopColor={skin} />
          <stop offset="1" stopColor="#e8c3a5" />
        </radialGradient>
        <clipPath id={g("headclip")}>
          <circle cx={0} cy={-262} r={70} />
        </clipPath>
      </defs>
      {shadow && <ellipse cx={6} cy={2} rx={58} ry={10} fill="#1d2410" opacity={0.22} />}

      <g transform={`translate(0,${bob})`}>
        {/* pack behind the shoulders */}
        {kit.pack && <rect x={-50} y={-196} width={100} height={92} rx={12} fill={kit.pack} stroke={LN} strokeWidth={LW} />}

        {/* legs */}
        <g>
          <path d={`M-30,-92 L-28,${-26 - liftL} L-6,${-26 - liftL} L-4,-92 Z`} fill={`url(#${g("trou")})`} stroke={LN} strokeWidth={LW} strokeLinejoin="round" />
          <path d={`M4,-92 L6,${-26 - liftR} L28,${-26 - liftR} L30,-92 Z`} fill={`url(#${g("trou")})`} stroke={LN} strokeWidth={LW} strokeLinejoin="round" />
          {kit.gaiters && (
            <g>
              <rect x={-30} y={-40 - liftL} width={26} height={22} rx={3} fill={kit.gaiters} stroke={LN} strokeWidth={LW} />
              <rect x={4} y={-40 - liftR} width={26} height={22} rx={3} fill={kit.gaiters} stroke={LN} strokeWidth={LW} />
            </g>
          )}
          <path d={`M-34,${-22 - liftL} L-4,${-22 - liftL} L-2,${-4 - liftL} C-2,${0 - liftL} -6,${2 - liftL} -10,${2 - liftL} L-38,${2 - liftL} C-42,${2 - liftL} -42,${-6 - liftL} -38,${-10 - liftL} Z`} fill={kit.boots ?? "#2a2420"} stroke={LN} strokeWidth={LW} strokeLinejoin="round" />
          <path d={`M4,${-22 - liftR} L34,${-22 - liftR} L38,${-10 - liftR} C42,${-6 - liftR} 42,${2 - liftR} 38,${2 - liftR} L10,${2 - liftR} C6,${2 - liftR} 2,${0 - liftR} 2,${-4 - liftR} Z`} fill={kit.boots ?? "#2a2420"} stroke={LN} strokeWidth={LW} strokeLinejoin="round" />
        </g>

        {/* coat, with the light from the upper left */}
        <path d={coatPath} fill={`url(#${g("coat")})`} stroke={LN} strokeWidth={LW} strokeLinejoin="round" />
        {kit.skirt && (
          <g>
            <path d="M-30,-58 L-44,-62 L-34,-100 Z" fill={kit.facing} stroke={LN} strokeWidth={2.6} strokeLinejoin="round" />
            <path d="M30,-58 L44,-62 L34,-100 Z" fill={kit.facing} stroke={LN} strokeWidth={2.6} strokeLinejoin="round" />
            <path d="M0,-66 L0,-200" stroke={LN} strokeWidth={2.6} />
          </g>
        )}
        {kit.lapels && <path d="M-26,-200 L-8,-200 L-6,-120 L-22,-130 Z M26,-200 L8,-200 L6,-120 L22,-130 Z" fill={kit.facing} stroke={LN} strokeWidth={2.6} strokeLinejoin="round" />}
        {kit.crossbelts && <path d="M-40,-196 L36,-100 M40,-196 L-36,-100" stroke="#f1ebdc" strokeWidth={9} />}
        {kit.crossbelts && <path d="M-40,-196 L36,-100 M40,-196 L-36,-100" stroke={LN} strokeWidth={1.4} opacity={0.5} />}
        {kit.buttons &&
          [-180, -160, -140, -120, -100].map((yy) => (
            <g key={yy}>
              <circle cx={-12} cy={yy} r={3.4} fill={kit.buttons} stroke={LN} strokeWidth={1.4} />
              <circle cx={12} cy={yy} r={3.4} fill={kit.buttons} stroke={LN} strokeWidth={1.4} />
            </g>
          ))}
        {kit.belt && (
          <g>
            <path d="M-50,-122 C-20,-116 20,-116 50,-122 L51,-110 C20,-104 -20,-104 -51,-110 Z" fill={kit.belt} stroke={LN} strokeWidth={2.6} />
            <rect x={-8} y={-122} width={16} height={14} rx={2} fill="#e1bf63" stroke={LN} strokeWidth={2} />
            {kit.pouches &&
              [-34, 22].map((px) => <rect key={px} x={px} y={-124} width={14} height={20} rx={3} fill={kit.belt} stroke={LN} strokeWidth={2.4} />)}
          </g>
        )}
        <path d="M42,-198 C50,-160 54,-110 52,-70" stroke="#000" strokeOpacity={0.1} strokeWidth={10} fill="none" />
        {kit.facing && !kit.lapels && <path d="M-28,-206 L28,-206 L24,-190 L-24,-190 Z" fill={kit.facing} stroke={LN} strokeWidth={2.6} strokeLinejoin="round" />}

        {/* arms */}
        {sleeve(L.d)}
        {hand(L.ha, -1)}
        {sleeve(R.d)}
        {hold && <g transform={`translate(${R.ha[0]},${R.ha[1]})`}>{hold}</g>}
        {hand(R.ha, 1)}

        {/* head */}
        <g transform={`translate(0,${bob * 0.2})`}>
          <circle cx={0} cy={-262} r={70} fill={`url(#${g("skin")})`} stroke={LN} strokeWidth={LW} />
          <g clipPath={`url(#${g("headclip")})`}>
            <circle cx={22} cy={-252} r={70} fill="#d9a888" opacity={0.18} />
          </g>
          <circle cx={-30 + lx * 0.6} cy={-238} r={10} fill="#f2958a" opacity={0.35} />
          <circle cx={30 + lx * 0.6} cy={-238} r={10} fill="#f2958a" opacity={0.35} />
          {[-1, 1].map((sd) =>
            expr === "shocked" ? (
              <g key={sd}>
                <circle cx={sd * 22 + lx} cy={-266} r={14} fill="#fff" stroke={LN} strokeWidth={3} />
                <circle cx={sd * 22 + lx} cy={-264} r={5.5} fill={LN} />
              </g>
            ) : (
              <g key={sd}>
                <ellipse cx={sd * 21 + lx} cy={-264} rx={6.5} ry={9 * blink} fill={LN} />
                {blink > 0.5 && <circle cx={sd * 21 + lx + 2} cy={-268} r={2.4} fill="#fff" />}
              </g>
            ),
          )}
          <path d={`M${-34 + lx},${bo} Q${-22 + lx},${(bo + bi) / 2 + BROWS[expr].curve} ${-10 + lx},${bi}`} stroke={LN} strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d={`M${34 + lx},${expr === "smug" ? bo - 8 : bo} Q${22 + lx},${(bo + bi) / 2 + BROWS[expr].curve - (expr === "smug" ? 8 : 0)} ${10 + lx},${expr === "smug" ? bi - 8 : bi}`} stroke={LN} strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d={`M${lx + 1},-252 q6,5 0,10`} fill="none" stroke={LN} strokeWidth={2.6} strokeLinecap="round" opacity={0.75} />
          {mustache && <path d={`M${lx},-238 C${lx - 10},-246 ${lx - 30},-242 ${lx - 36},-230 C${lx - 24},-236 ${lx - 10},-234 ${lx},-234 C${lx + 10},-234 ${lx + 24},-236 ${lx + 36},-230 C${lx + 30},-242 ${lx + 10},-246 ${lx},-238 Z`} fill={mustache} stroke={LN} strokeWidth={2.4} />}
          {mouth}
          {sweat && <path d="M60,-300 q7,12 0,18 q-7,-6 0,-18 Z" fill="#cfe9ff" stroke={LN} strokeWidth={2.4} transform={`translate(0,${(f % 30) * 0.5})`} />}
          {hatEl}
        </g>
      </g>
      {tint > 0 && (
        <g opacity={tint} style={{ mixBlendMode: "normal" }}>
          <circle cx={0} cy={-262 + bob} r={72} fill={air} />
          <path d={coatPath} fill={air} transform={`translate(0,${bob})`} />
          <rect x={-34} y={-92 + bob} width={68} height={94} fill={air} />
        </g>
      )}
      {void hash}
      {void onN}
    </g>
  );
};
