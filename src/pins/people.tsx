import React from "react";
import { over } from "./engine";

/**
 * Cartoon-headed people, as the reference drops them into its scenes
 * whenever the narration mentions humans (scientists, owners, hunters).
 * Their look: a believable body in real clothes, topped with a flat comic
 * head (outlined face, big whites with small pupils, heavy brows, a simple
 * nose line, a mouth that does the acting). The body here is drawn, but
 * shaded (gradient folds, seams) so it sits closer to the photos than the
 * flat head does: that contrast is the gag.
 *
 * The figure is head-to-waist (most of the time a boat, a desk or the frame
 * edge hides the legs), in a 200 × 300 box anchored at its bottom centre.
 */

export type Face = "neutral" | "happy" | "curious" | "shocked" | "worried" | "smirk";

export type PersonLook = {
  skin?: string;
  hair?: "cap" | "beanie" | "short" | "bald";
  hat?: string;         // cap / beanie colour
  hairColor?: string;
  jacket?: string;      // jacket colour (shaded automatically)
  shirt?: string;       // collar / undershirt
  beard?: boolean;
  glasses?: boolean;
  prop?: "binoculars" | "clipboard" | "point" | "none";
  mask?: boolean;       // a diving mask pushed up on the forehead (wetsuit: pass a black jacket and shirt)
};

const LINE = "#2a1a10";

const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${f(n >> 16)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
};

export const faceAt = (tl: [number, Face][], t: number) => {
  let f: Face = tl[0]?.[1] ?? "neutral", since = -99;
  for (const [at, ff] of tl) if (t >= at) { f = ff; since = at; }
  return { face: f, since };
};

export const Person: React.FC<{
  t: number;
  x: number; y: number;         // world position of the figure's bottom centre (waist)
  h: number;                    // drawn height in px (head-to-waist)
  look?: PersonLook;
  faces?: [number, Face][];
  gaze?: [number, number];      // -1..1 pupil direction
  talk?: [number, number][];    // windows [from, to] when the mouth flaps
  flip?: boolean;
  bob?: number;
  rot?: number;
  id?: string;                  // unique per figure on screen (svg gradient ids)
}> = ({ t, x, y, h, look = {}, faces = [[-99, "neutral"]], gaze = [0, 0], talk = [], flip, bob = 0, rot = 0, id = "p" }) => {
  const {
    skin = "#e7b48f", hair = "cap", hat = "#3d6b8f", hairColor = "#3b2516", jacket = "#5b6b3a", shirt = "#d9d2c0",
    beard = false, glasses = false, prop = "none", mask = false,
  } = look;
  const w = (h * 200) / 300;
  const { face, since } = faceAt(faces, t);
  const pop = over(t, since, since + 0.22);
  const by = Math.sin(t * 2.1 + x * 0.01) * bob;
  // blink
  const ph = (t + x * 0.003) % 3.1;
  const blink = face !== "shocked" && ph < 0.11 ? 0.1 : 1;
  const talking = talk.some(([a, b]) => t >= a && t <= b);
  const flap = talking ? (Math.sin(t * 26) > 0 ? 1 : 0.25) : 0;
  const shocked = face === "shocked";
  const eyeR = shocked ? 13 : 11;
  const pr = shocked ? 3.2 : 4.6;
  const gx = gaze[0] * 4, gy = gaze[1] * 4;

  // brows per face: [left inner y, left outer y]; right mirrors (inner = towards the nose)
  const brow: Record<Face, [number, number]> = {
    neutral: [49, 49], happy: [47, 48], curious: [44, 50], shocked: [38, 41], worried: [43, 51], smirk: [50, 47],
  };
  const [bi, bo] = brow[face];
  const rb: [number, number] = face === "curious" ? [50, 48] : face === "smirk" ? [44, 41] : [bi, bo];

  const mouth = (() => {
    if (shocked) return <ellipse cx={100} cy={101 + 0} rx={9 + 2 * pop} ry={11 + 3 * pop} fill="#4a1c14" stroke={LINE} strokeWidth={3} />;
    if (flap > 0) return <ellipse cx={100} cy={100} rx={10} ry={3 + 7 * flap} fill="#4a1c14" stroke={LINE} strokeWidth={3} />;
    if (face === "happy") return <path d="M 86 97 Q 100 110 114 97" fill="none" stroke={LINE} strokeWidth={3.5} strokeLinecap="round" />;
    if (face === "worried") return <path d="M 87 102 q 4 -4 8 0 t 8 0 t 8 0" fill="none" stroke={LINE} strokeWidth={3.2} strokeLinecap="round" />;
    if (face === "smirk") return <path d="M 88 101 Q 102 104 114 95" fill="none" stroke={LINE} strokeWidth={3.5} strokeLinecap="round" />;
    if (face === "curious") return <ellipse cx={102} cy={101} rx={4} ry={3.5} fill="#4a1c14" stroke={LINE} strokeWidth={2.5} />;
    return <path d="M 89 100 L 111 100" stroke={LINE} strokeWidth={3.5} strokeLinecap="round" />;
  })();

  const J = `${id}-jacket`, S = `${id}-skin`;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h + by, width: w, height: h, transform: `rotate(${rot}deg) ${flip ? "scaleX(-1)" : ""}`, transformOrigin: "50% 100%" }}>
      <svg viewBox="0 0 200 300" style={{ width: "100%", height: "100%", overflow: "visible", filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.3))" }}>
        <defs>
          <linearGradient id={J} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor={shade(jacket, 0.62)} />
            <stop offset="0.35" stopColor={shade(jacket, 1.05)} />
            <stop offset="0.7" stopColor={shade(jacket, 0.95)} />
            <stop offset="1" stopColor={shade(jacket, 0.58)} />
          </linearGradient>
          <radialGradient id={S} cx="0.45" cy="0.4" r="0.7">
            <stop offset="0.6" stopColor={skin} />
            <stop offset="1" stopColor={shade(skin, 0.86)} />
          </radialGradient>
        </defs>

        {/* body */}
        <path d="M 14 300 L 20 186 Q 26 140 70 128 L 130 128 Q 174 140 180 186 L 186 300 Z" fill={`url(#${J})`} stroke={LINE} strokeWidth={3} />
        <path d="M 46 300 L 50 200 M 154 300 L 150 200" stroke={shade(jacket, 0.5)} strokeWidth={3} opacity={0.6} />
        <path d="M 100 160 L 100 300" stroke={shade(jacket, 0.55)} strokeWidth={2.5} />
        {[178, 214, 250].map((yy) => <circle key={yy} cx={106} cy={yy} r={3.2} fill={shade(jacket, 0.45)} />)}
        <path d="M 60 222 h 26 v 22 h -26 Z M 114 222 h 26 v 22 h -26 Z" fill="none" stroke={shade(jacket, 0.5)} strokeWidth={2.5} />
        <path d="M 78 128 L 100 168 L 122 128 Z" fill={shirt} stroke={LINE} strokeWidth={2.5} />
        <path d="M 70 128 L 100 172 L 80 132 Z M 130 128 L 100 172 L 120 132 Z" fill={shade(jacket, 0.8)} stroke={LINE} strokeWidth={2} />

        {/* neck */}
        <path d="M 86 106 L 86 132 Q 100 140 114 132 L 114 106 Z" fill={shade(skin, 0.82)} stroke={LINE} strokeWidth={2.5} />

        {/* arms / props */}
        {prop === "point" && (
          <g>
            <path d="M 168 176 Q 196 150 206 108" fill="none" stroke={shade(jacket, 0.85)} strokeWidth={26} strokeLinecap="round" />
            <circle cx={208} cy={98} r={11} fill={skin} stroke={LINE} strokeWidth={2.5} />
            <path d="M 210 90 L 216 66" stroke={skin} strokeWidth={7} strokeLinecap="round" />
          </g>
        )}
        {prop === "clipboard" && (
          <g transform="rotate(-8 70 220)">
            <rect x={44} y={176} width={62} height={82} rx={5} fill="#a8774a" stroke={LINE} strokeWidth={3} />
            <rect x={50} y={186} width={50} height={66} fill="#fbfaf4" />
            {[198, 210, 222, 234].map((yy) => <line key={yy} x1={56} x2={94} y1={yy} y2={yy} stroke="#7b8fa8" strokeWidth={2} />)}
            <rect x={64} y={172} width={22} height={10} rx={3} fill="#b9bcc2" stroke={LINE} strokeWidth={2} />
            <circle cx={108} cy={226} r={11} fill={skin} stroke={LINE} strokeWidth={2.5} />
          </g>
        )}
        {prop === "binoculars" && (
          <g>
            <path d="M 80 132 Q 100 176 120 132" fill="none" stroke="#222" strokeWidth={3} />
            <rect x={78} y={168} width={18} height={30} rx={6} fill="#2b2b2b" stroke={LINE} strokeWidth={2.5} />
            <rect x={104} y={168} width={18} height={30} rx={6} fill="#2b2b2b" stroke={LINE} strokeWidth={2.5} />
            <rect x={94} y={176} width={12} height={10} fill="#3a3a3a" />
            <circle cx={87} cy={196} r={6} fill="#5e86a8" />
            <circle cx={113} cy={196} r={6} fill="#5e86a8" />
          </g>
        )}

        {/* head */}
        <ellipse cx={58} cy={74} rx={8} ry={12} fill={shade(skin, 0.9)} stroke={LINE} strokeWidth={3} />
        <ellipse cx={142} cy={74} rx={8} ry={12} fill={shade(skin, 0.9)} stroke={LINE} strokeWidth={3} />
        <path d="M 60 50 Q 60 16 100 15 Q 140 16 140 50 L 140 86 Q 138 118 100 121 Q 62 118 60 86 Z" fill={`url(#${S})`} stroke={LINE} strokeWidth={3.5} />
        {beard && <path d="M 61 84 Q 64 120 100 122 Q 136 120 139 84 Q 132 100 124 96 Q 112 92 100 94 Q 88 92 76 96 Q 68 100 61 84 Z" fill={hairColor} stroke={LINE} strokeWidth={2.5} opacity={0.92} />}
        {/* cheeks */}
        <ellipse cx={74} cy={88} rx={8} ry={5} fill="#e88a7a" opacity={0.35} />
        <ellipse cx={126} cy={88} rx={8} ry={5} fill="#e88a7a" opacity={0.35} />

        {/* hair / hat */}
        {hair === "cap" && (
          <g>
            <path d="M 58 40 Q 58 2 100 1 Q 142 2 142 40 Q 100 30 58 40 Z" fill={hat} stroke={LINE} strokeWidth={3} />
            <path d="M 120 34 Q 160 30 176 42 Q 150 46 128 42 Z" fill={shade(hat, 0.8)} stroke={LINE} strokeWidth={3} />
            <circle cx={100} cy={3} r={4} fill={shade(hat, 0.8)} stroke={LINE} strokeWidth={2} />
          </g>
        )}
        {hair === "beanie" && (
          <g>
            <path d="M 57 40 Q 57 -8 100 -8 Q 143 -8 143 40 Z" fill={hat} stroke={LINE} strokeWidth={3} />
            <path d="M 55 28 L 145 28 L 145 40 L 55 40 Z" fill={shade(hat, 0.85)} stroke={LINE} strokeWidth={3} />
            {[64, 76, 88, 100, 112, 124, 136].map((xx) => <line key={xx} x1={xx} x2={xx} y1={30} y2={38} stroke={shade(hat, 0.65)} strokeWidth={2} />)}
          </g>
        )}
        {hair === "short" && <path d="M 58 60 Q 54 12 100 12 Q 146 12 142 60 Q 136 34 100 32 Q 64 34 58 60 Z" fill={hairColor} stroke={LINE} strokeWidth={3} />}
        {mask && (
          <g>
            <path d="M 56 34 Q 100 26 144 34" fill="none" stroke="#1b1b1b" strokeWidth={7} />
            <rect x={70} y={14} width={60} height={28} rx={11} fill="#9fd8f5" stroke="#1b1b1b" strokeWidth={5} />
            <path d="M 78 20 L 88 20" stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={0.8} />
            <path d="M 100 14 L 100 42" stroke="#1b1b1b" strokeWidth={4} />
          </g>
        )}

        {/* eyes */}
        <g transform={`translate(0 ${66}) scale(1 ${blink}) translate(0 ${-66})`}>
          <ellipse cx={84} cy={66} rx={eyeR} ry={eyeR + 1.5} fill="#fff" stroke={LINE} strokeWidth={3} />
          <ellipse cx={116} cy={66} rx={eyeR} ry={eyeR + 1.5} fill="#fff" stroke={LINE} strokeWidth={3} />
          <circle cx={84 + gx} cy={66 + gy} r={pr} fill={LINE} />
          <circle cx={116 + gx} cy={66 + gy} r={pr} fill={LINE} />
        </g>
        {glasses && (
          <g fill="none" stroke={LINE} strokeWidth={3}>
            <circle cx={84} cy={66} r={16} />
            <circle cx={116} cy={66} r={16} />
            <path d="M 100 64 L 100 64" />
            <path d="M 68 64 L 60 62 M 132 64 L 140 62" />
          </g>
        )}
        {/* brows */}
        <path d={`M 94 ${bi} L 72 ${bo}`} stroke={hairColor} strokeWidth={6.5} strokeLinecap="round" />
        <path d={`M 106 ${rb[0]} L 128 ${rb[1]}`} stroke={hairColor} strokeWidth={6.5} strokeLinecap="round" />
        {/* nose */}
        <path d="M 101 70 Q 94 84 100 88 Q 104 89 107 86" fill="none" stroke={LINE} strokeWidth={2.8} strokeLinecap="round" />
        {mouth}
        {shocked && (
          <path d={`M 150 ${30 + ((t * 1.3) % 1) * 14} q -7 11 0 15 q 7 -4 0 -15 Z`} fill="#8fd3ff" stroke="#1d5f9c" strokeWidth={2} />
        )}
      </svg>
    </div>
  );
};

/** draws its children only above world line y (a waterline, a boat's gunwale) */
export const AboveLine: React.FC<{ y: number; children: React.ReactNode }> = ({ y, children }) => (
  <div style={{ position: "absolute", left: -2000, top: -2000, width: 6000, height: y + 2000, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 2000, top: 2000, width: 0, height: 0 }}>{children}</div>
  </div>
);

/** every face and outfit side by side, for checking the look (Pins-People-Sheet) */
export const PeopleSheet: React.FC = () => {
  const faces: Face[] = ["neutral", "happy", "curious", "shocked", "worried", "smirk"];
  const looks: PersonLook[] = [
    { hair: "cap", beard: true, prop: "binoculars" },
    { hair: "beanie", hat: "#c0392b", jacket: "#2f4f6f", glasses: true, prop: "clipboard", skin: "#c68a63" },
    { hair: "short", jacket: "#8a6a3a", prop: "point", skin: "#8d5a3b", hairColor: "#1a120c" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, background: "#7fb3d5" }}>
      {looks.map((l, r) => faces.map((f, i) => (
        <Person key={`${r}-${i}`} id={`s${r}${i}`} t={1} x={100 + i * 175} y={420 + r * 560} h={420} look={l} faces={[[-99, f]]} gaze={[0.3, 0.2]} />
      )))}
    </div>
  );
};
