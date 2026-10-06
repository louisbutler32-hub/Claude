import React from "react";
import { Img, staticFile } from "remotion";
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

/* ======================================================================
 * Photo-bodied people: the reference's real look. A real photo of a body
 * (CC0 / CC BY cutout, its own head cut away) with a comic head mounted at
 * the neck. The head is proportioned like a real one (about a seventh of the
 * height), turns three-quarters to match the body, nods and tilts on its own;
 * the body sways, steps, and swaps poses on cue words.
 * ==================================================================== */

export type HeadLook = {
  skin?: string;
  hair?: "short" | "cap" | "beanie" | "bald" | "side";
  hairColor?: string;
  hat?: string;
  beard?: "none" | "stubble" | "full";
  glasses?: boolean;
  mask?: boolean;
};

/**
 * The comic head alone, in a 120 × 150 box; the chin sits at (60, 132) and a
 * neck stub runs on below it to the box's bottom edge, to hide the seam with
 * the photo's neck. `turn` (-1..1) slides the features for a three-quarter
 * view (the far ear hides).
 */
export const CartoonHead: React.FC<{ t: number; look?: HeadLook; face?: Face; since?: number; turn?: number; gaze?: [number, number]; talking?: boolean; id: string; neck?: boolean }> = ({
  t, look = {}, face = "neutral", since = -99, turn = 0, gaze = [0, 0], talking = false, id, neck = true,
}) => {
  const { skin = "#e3b38f", hair = "short", hairColor = "#3a2414", hat = "#3d6b8f", beard = "stubble", glasses = false, mask = false } = look;
  const L = "#2a1a10";
  const fx = turn * 9;                 // features slide
  const ph = (t + id.length * 0.7) % 3.3;
  const blink = face !== "shocked" && ph < 0.1 ? 0.12 : 1;
  const shocked = face === "shocked";
  const pop = over(t, since, since + 0.2);
  const flap = talking ? (Math.sin(t * 26) > 0 ? 1 : 0.2) : 0;
  // brow heights [inner, outer] per face, left brow; the right mirrors
  const B: Record<Face, [number, number, number, number]> = {
    neutral: [58, 57, 58, 57], happy: [56, 57, 56, 57], curious: [53, 58, 58, 55], shocked: [49, 51, 49, 51], worried: [52, 60, 52, 60], smirk: [59, 56, 52, 50],
  };
  const [li, lo, ri, ro] = B[face];
  const eyeY = 70;
  const ew = shocked ? 10 : 9, eh = shocked ? 9 : 6.2;
  const pr = shocked ? 2.4 : 3.2;
  const gx = gaze[0] * 3 + turn * 2.5, gy = gaze[1] * 2;
  const SK = `${id}-sk`;
  const mouth = (() => {
    const mx = 60 + fx;
    if (shocked) return <ellipse cx={mx} cy={112} rx={6 + 2 * pop} ry={8 + 3 * pop} fill="#4a1c14" stroke={L} strokeWidth={2.4} />;
    if (flap > 0) return <ellipse cx={mx} cy={111} rx={8} ry={2 + 6 * flap} fill="#4a1c14" stroke={L} strokeWidth={2.4} />;
    if (face === "happy") return <path d={`M ${mx - 11} 108 Q ${mx} 118 ${mx + 11} 108`} fill="none" stroke={L} strokeWidth={2.8} strokeLinecap="round" />;
    if (face === "worried") return <path d={`M ${mx - 10} 113 q 3.3 -3 6.6 0 t 6.6 0 t 6.6 0`} fill="none" stroke={L} strokeWidth={2.6} strokeLinecap="round" />;
    if (face === "smirk") return <path d={`M ${mx - 9} 112 Q ${mx + 2} 114 ${mx + 11} 106`} fill="none" stroke={L} strokeWidth={2.8} strokeLinecap="round" />;
    if (face === "curious") return <ellipse cx={mx + 1} cy={112} rx={3.5} ry={3} fill="#4a1c14" stroke={L} strokeWidth={2} />;
    return <path d={`M ${mx - 8} 111 Q ${mx} 112.5 ${mx + 8} 111`} fill="none" stroke={L} strokeWidth={2.8} strokeLinecap="round" />;
  })();
  const shade = (hex: string, k: number) => {
    const n = parseInt(hex.slice(1), 16);
    const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
    return `rgb(${f(n >> 16)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
  };
  return (
    <svg viewBox="0 0 120 150" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <defs>
        <radialGradient id={SK} cx={0.45 + turn * 0.12} cy="0.38" r="0.75">
          <stop offset="0.55" stopColor={skin} />
          <stop offset="1" stopColor={shade(skin, 0.8)} />
        </radialGradient>
      </defs>
      {/* neck stub: runs under the photo collar */}
      {neck && <path d="M 44 112 L 42 150 L 78 150 L 76 112 Z" fill={shade(skin, 0.82)} stroke={L} strokeWidth={2.2} />}
      {/* ears (the far one hides as the head turns) */}
      {turn < 0.55 && <ellipse cx={17 + fx * 0.4} cy={78} rx={6} ry={10} fill={shade(skin, 0.9)} stroke={L} strokeWidth={2.4} />}
      {turn > -0.55 && <ellipse cx={103 + fx * 0.4} cy={78} rx={6} ry={10} fill={shade(skin, 0.9)} stroke={L} strokeWidth={2.4} />}
      {/* face */}
      <path d={`M 20 60 Q 20 18 60 16 Q 100 18 100 60 L 99 92 Q 96 128 60 134 Q 24 128 21 92 Z`} fill={`url(#${SK})`} stroke={L} strokeWidth={2.8} />
      {beard === "stubble" && <path d="M 23 94 Q 28 128 60 133 Q 92 128 97 94 Q 90 104 82 103 Q 70 100 60 101 Q 50 100 38 103 Q 30 104 23 94 Z" fill={shade(skin, 0.62)} opacity={0.45} />}
      {beard === "full" && <path d="M 22 88 Q 26 132 60 136 Q 94 132 98 88 Q 92 104 80 102 Q 70 99 60 100 Q 50 99 40 102 Q 28 104 22 88 Z" fill={hairColor} stroke={L} strokeWidth={2} />}
      {/* hair / hats */}
      {hair === "short" && <path d="M 19 64 Q 14 14 60 12 Q 106 14 101 64 Q 98 40 84 34 Q 62 40 36 34 Q 22 42 19 64 Z" fill={hairColor} stroke={L} strokeWidth={2.4} />}
      {hair === "side" && <path d="M 19 66 Q 12 12 62 10 Q 108 14 101 62 Q 96 36 70 30 Q 48 44 30 40 Q 22 48 19 66 Z" fill={hairColor} stroke={L} strokeWidth={2.4} />}
      {hair === "cap" && (
        <g>
          <path d="M 18 50 Q 18 8 60 6 Q 102 8 102 50 Q 60 40 18 50 Z" fill={hat} stroke={L} strokeWidth={2.6} />
          <path d={`M ${70 + fx} 44 Q ${104 + fx} 40 ${118 + fx} 50 Q ${96 + fx} 55 ${76 + fx} 51 Z`} fill={shade(hat, 0.8)} stroke={L} strokeWidth={2.6} />
        </g>
      )}
      {hair === "beanie" && (
        <g>
          <path d="M 17 52 Q 17 0 60 0 Q 103 0 103 52 Z" fill={hat} stroke={L} strokeWidth={2.6} />
          <path d="M 15 40 L 105 40 L 105 53 L 15 53 Z" fill={shade(hat, 0.85)} stroke={L} strokeWidth={2.6} />
        </g>
      )}
      {mask && (
        <g>
          <path d="M 18 42 Q 60 34 102 42" fill="none" stroke="#1b1b1b" strokeWidth={6} />
          <rect x={34} y={24} width={52} height={24} rx={9} fill="#9fd8f5" stroke="#1b1b1b" strokeWidth={4} />
          <path d="M 60 24 L 60 48" stroke="#1b1b1b" strokeWidth={3} />
        </g>
      )}
      {/* eyes: almond whites, small pupils, a heavy upper lid line */}
      <g transform={`translate(0 ${eyeY}) scale(1 ${blink}) translate(0 ${-eyeY})`}>
        {[-1, 1].map((sd) => {
          const cx = 60 + sd * 19 + fx;
          const squash = turn * sd > 0.3 ? 0.8 : 1;
          return (
            <g key={sd}>
              <ellipse cx={cx} cy={eyeY} rx={ew * squash} ry={eh} fill="#fff" stroke={L} strokeWidth={2} />
              <circle cx={cx + gx} cy={eyeY + gy} r={pr} fill={L} />
              <path d={`M ${cx - ew * squash - 1} ${eyeY - 1} Q ${cx} ${eyeY - eh - 3} ${cx + ew * squash + 1} ${eyeY - 1}`} fill="none" stroke={L} strokeWidth={3} strokeLinecap="round" />
            </g>
          );
        })}
      </g>
      {glasses && <g fill="none" stroke={L} strokeWidth={2.4}><circle cx={41 + fx} cy={eyeY} r={13} /><circle cx={79 + fx} cy={eyeY} r={13} /><path d={`M ${54 + fx} ${eyeY - 1} L ${66 + fx} ${eyeY - 1}`} /></g>}
      {/* brows */}
      <path d={`M ${52 + fx} ${li} L ${30 + fx} ${lo}`} stroke={hairColor} strokeWidth={5} strokeLinecap="round" />
      <path d={`M ${68 + fx} ${ri} L ${90 + fx} ${ro}`} stroke={hairColor} strokeWidth={5} strokeLinecap="round" />
      {/* nose: a side line and a nostril */}
      <path d={`M ${62 + fx * 1.3} 74 Q ${55 + fx * 1.3} 92 ${60 + fx * 1.3} 96 Q ${65 + fx * 1.3} 98 ${68 + fx * 1.3} 94`} fill="none" stroke={L} strokeWidth={2.4} strokeLinecap="round" />
      {mouth}
      {shocked && <path d={`M 104 ${40 + ((t * 1.3) % 1) * 12} q -6 9 0 13 q 6 -4 0 -13 Z`} fill="#8fd3ff" stroke="#1d5f9c" strokeWidth={1.6} />}
    </svg>
  );
};

/** one photo of a body, its head already cut away; where its neck is (0–1 of the image) and how wide its head was */
export type BodyPose = {
  src: string;
  w: number; h: number;
  neck: [number, number];   // the top of the neck, where the chin goes
  headW: number;            // the real head's width, 0–1 of the image width
  tilt?: number;            // the body's own head angle, degrees
  turn?: number;            // which way the body faces, -1..1 (for the face's three-quarter view)
};

export const PhotoPerson: React.FC<{
  t: number;
  id: string;
  poses: [number, BodyPose][];   // pose timeline (global seconds)
  x: number; y: number;          // world point of the feet (bottom centre of the photo)
  h: number;                     // drawn height
  look?: HeadLook;
  faces?: [number, Face][];
  gaze?: [number, number];
  talk?: [number, number][];
  flip?: boolean;
  sway?: number;                 // degrees of idle sway
  bob?: number;                  // px of idle bob
  walk?: number;                 // > 0: a walking bounce at this many steps / s
  nod?: number;                  // degrees of idle head nod
  headScale?: number;            // the comic head runs bigger than the real one, as the reference does (default 1.45)
  shadow?: boolean;
}> = ({ t, id, poses, x, y, h, look, faces = [[-99, "neutral"]], gaze = [0, 0], talk = [], flip, sway = 1.2, bob = 0, walk = 0, nod = 2, headScale = 1.45, shadow = true }) => {
  let pose = poses[0][1], since = -99;
  for (const [at, p] of poses) if (t >= at) { pose = p; since = at; }
  const w = (h * pose.w) / pose.h;
  const swap = over(t, since, since + 0.25);
  const step = walk ? Math.abs(Math.sin(t * Math.PI * walk)) : 0;
  const by = -step * h * 0.02 + Math.sin(t * 1.7 + id.length) * bob;
  const sw = Math.sin(t * 1.3 + id.length) * sway + (walk ? Math.sin(t * Math.PI * walk) * 2 : 0);
  const { face, since: fs } = faceAt(faces, t);
  const talking = talk.some(([a, b]) => t >= a && t <= b);
  const hw = pose.headW * w * headScale;     // head box width
  const hh = hw * 150 / 120;
  const nx = pose.neck[0] * w, ny = pose.neck[1] * h;
  const neckShade = (() => { const n = parseInt((look?.skin ?? "#e3b38f").slice(1), 16); const f = (v: number) => Math.round(v * 0.72); return `rgb(${f(n >> 16)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`; })();
  const headRot = (pose.tilt ?? 0) + Math.sin(t * 1.9 + id.length * 0.5) * nod + (talking ? Math.sin(t * 7) * 2 : 0);
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h + by, width: w, height: h, transform: `rotate(${sw}deg) ${flip ? "scaleX(-1)" : ""} scale(${0.94 + 0.06 * swap})`, transformOrigin: "50% 100%" }}>
      {shadow && <div style={{ position: "absolute", left: w * 0.12, top: h * 0.975, width: w * 0.76, height: h * 0.045, borderRadius: "50%", background: "radial-gradient(rgba(0,0,0,0.38), rgba(0,0,0,0))" }} />}
      {/* the neck sits behind the photo: the real collar overlaps it, so there's no seam */}
      <div style={{ position: "absolute", left: nx - hw * 0.17, top: ny - hh * 0.22, width: hw * 0.34, height: hh * 0.4, borderRadius: hw * 0.08,
        background: `linear-gradient(90deg, ${neckShade}, ${look?.skin ?? "#e3b38f"} 45%, ${neckShade})`, transform: `rotate(${(pose.tilt ?? 0) * 0.5}deg)`, transformOrigin: "50% 0%" }} />
      <Img src={staticFile(pose.src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.25))" }} />
      {/* the head: chin (60,132 of 120×150) on the neck point */}
      <div style={{ position: "absolute", left: nx - hw / 2, top: ny - hh * (132 / 150), width: hw, height: hh, transform: `rotate(${headRot}deg) ${flip ? "scaleX(-1)" : ""}`, transformOrigin: "50% 88%" }}>
        <CartoonHead t={t} id={id} look={look} face={face} since={fs} turn={pose.turn ?? 0} gaze={gaze} talking={talking} neck={false} />
      </div>
    </div>
  );
};
