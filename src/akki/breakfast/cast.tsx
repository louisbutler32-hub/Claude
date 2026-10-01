import React from "react";
import { INK } from "../common";
import {
  add, armDir, footShape, Hand, HandKind, HeadBase, mix, P, Part, Pose, SKIN_TAN, smooth, torsoPts, tube, Wrap,
} from "../bowling/characters";
import { curlyMop } from "../guest";

/**
 * The three admirals, drawn on the shared figure kit (feet at y=0, ~1000
 * tall — they're drawn a head taller than everyone else via `s`).
 *
 *  - Akainu: dark crimson suit over a red rose-print shirt, Marine cap, a
 *    hard square jaw that has never smiled.
 *  - Kuzan: white suit, blue shirt, a black curly afro with a sleep mask
 *    pushed up on it, permanently half asleep.
 *  - Kizaru: yellow pinstripe suit, purple shirt, orange shades, slicked-back
 *    hair and a long, lazy face.
 *
 * All three wear the white Justice coat over their shoulders like a cape.
 */

const fx = (p: P): string => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
const SKIN = SKIN_TAN;
const PALE = { base: "#f4cfaa", shade: "#d9a27e" };

export type AdmiralKey = "akainu" | "kuzan" | "kizaru";
export type AFace = "stern" | "angry" | "sleepy" | "smirk" | "blow" | "oh";

type Look = { suit: string; suitS: string; shirt: string; shirtS: string; shoe: string; skin: typeof SKIN; stripe?: string };
export const LOOK: Record<AdmiralKey, Look> = {
  akainu: { suit: "#8c1c22", suitS: "#5c0e14", shirt: "#c2303a", shirtS: "#8a1a24", shoe: "#2a1414", skin: SKIN },
  kuzan: { suit: "#eef0f4", suitS: "#b8bfcc", shirt: "#4f7fd0", shirtS: "#335aa0", shoe: "#3a3a40", skin: SKIN },
  kizaru: { suit: "#f2c62e", suitS: "#c6961a", shirt: "#7a3aa8", shirtS: "#52207a", shoe: "#f0e6d0", skin: PALE, stripe: "#c9921a" },
};

/* ---------------------------------- heads ---------------------------------- */

export const AkainuHead: React.FC<{ face?: AFace; turn?: number; lw: number }> = ({ face = "stern", turn = 0, lw }) => {
  const sx = turn * 12;
  const angry = face === "angry";
  return (
    <g>
      <HeadBase turn={turn} skin={SKIN} lw={lw} jaw={1.18} neckW={22} />
      {/* short black sideburns under the cap */}
      <Part d={[smooth([[-54 + sx * 0.5, -40], [-60, -10], [-54, 14], [-46, -20]]), smooth([[54 + sx * 0.5, -40], [60, -10], [54, 14], [46, -20]])]} fill="#1a1416" lw={lw} />
      {/* heavy brows, narrow eyes */}
      <path d={`M${-38 + sx},${angry ? -20 : -14} L${-6 + sx},${angry ? -6 : -8} L${-8 + sx},-1 L${-38 + sx},-6Z M${38 + sx},${angry ? -20 : -14} L${6 + sx},${angry ? -6 : -8} L${8 + sx},-1 L${38 + sx},-6Z`} fill="#1a1416" stroke={INK} strokeWidth={1.4} />
      {[-21, 21].map((ex) => (
        <g key={ex}>
          <path d={`M${ex - 12 + sx},4 L${ex + 12 + sx},4 Q${ex + sx},10 ${ex - 12 + sx},4Z`} fill="#fff" stroke={INK} strokeWidth={1.8} />
          <circle cx={ex + sx} cy={6} r={3} fill={INK} />
          <path d={`M${ex - 14 + sx},3 L${ex + 14 + sx},3`} stroke={INK} strokeWidth={3.6} strokeLinecap="round" />
        </g>
      ))}
      {/* nose, cheek lines, hard mouth */}
      <path d={`M${sx + 2},10 L${sx + 6},28 L${sx - 2},31`} stroke={INK} strokeWidth={2.2} fill="none" />
      <path d={`M${-30 + sx},26 Q${-34 + sx},44 ${-26 + sx},58 M${30 + sx},26 Q${34 + sx},44 ${26 + sx},58`} stroke={INK} strokeWidth={1.8} fill="none" />
      {angry ? (
        <g>
          <path d={`M${sx - 20},44 L${sx + 20},44 L${sx + 16},58 L${sx - 16},58Z`} fill="#fff" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
          <path d={`M${sx - 18},51 L${sx + 18},51`} stroke={INK} strokeWidth={1.4} />
        </g>
      ) : (
        <path d={`M${sx - 16},50 Q${sx},46 ${sx + 16},50`} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
      )}
      {/* chin cleft */}
      <path d={`M${sx},70 l0,6`} stroke={INK} strokeWidth={1.6} />
      {/* the cap: white crown, navy band, black visor */}
      <Part d={smooth([[-62, -40], [-66, -86], [-30, -112], [30, -112], [66, -86], [62, -40]], true, 0.6)} fill="#f4f4f0" shade="#c8ccd4" lw={lw} />
      <Part d={`M-63,-58 L63,-58 L62,-40 L-62,-40Z`} fill="#24305a" lw={lw * 0.8} />
      <Part d={smooth([[-60, -40], [0, -30], [60, -40], [56, -30], [0, -18], [-56, -30]], true, 0.6)} fill="#18181c" lw={lw * 0.8} />
      <text x={0} y={-75} textAnchor="middle" fontFamily="Poppins Black" fontSize={15} fill="#24305a">MARINE</text>
    </g>
  );
};

export const KuzanHead: React.FC<{ face?: AFace; turn?: number; lw: number }> = ({ face = "sleepy", turn = 0, lw }) => {
  const sx = turn * 12;
  const afro = curlyMop(sx * 0.3, -66, 74, 70, -56, -12, 17, 21);
  const blow = face === "blow";
  return (
    <g>
      <HeadBase turn={turn} skin={SKIN} lw={lw} jaw={1.1} neckW={20} />
      {/* stubble */}
      <path d={`M${-40 + sx},36 Q${sx},86 ${40 + sx},36`} stroke="#6a5a50" strokeWidth={6} fill="none" strokeDasharray="2 4" opacity={0.6} />
      {/* droopy brows and heavy-lidded eyes */}
      <path d={`M${-36 + sx},-12 Q${-22 + sx},-18 ${-8 + sx},-10 M${8 + sx},-10 Q${22 + sx},-18 ${36 + sx},-12`} stroke="#1a1416" strokeWidth={5} fill="none" strokeLinecap="round" />
      {[-21, 21].map((ex) => (
        <g key={ex}>
          <path d={`M${ex - 12 + sx},4 Q${ex + sx},2 ${ex + 12 + sx},4 Q${ex + sx},11 ${ex - 12 + sx},4Z`} fill="#fff" stroke={INK} strokeWidth={1.6} />
          <circle cx={ex + sx} cy={6} r={3.2} fill={INK} />
          <path d={`M${ex - 13 + sx},3 Q${ex + sx},0 ${ex + 13 + sx},3`} stroke={INK} strokeWidth={4.4} fill="none" strokeLinecap="round" />
        </g>
      ))}
      <path d={`M${sx + 2},10 L${sx + 6},28 L${sx - 2},30`} stroke={INK} strokeWidth={2} fill="none" />
      {blow ? (
        <ellipse cx={sx + 2} cy={50} rx={8} ry={9} fill="#3a1418" stroke={INK} strokeWidth={2.4} />
      ) : (
        <path d={`M${sx - 14},48 Q${sx},52 ${sx + 14},47`} stroke={INK} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      )}
      {/* the afro */}
      <Part d={afro.blobs} fill="#1a1618" shade="#0c0a0c" lw={lw}>
        <path d={afro.marks.join("")} stroke="#3a3238" strokeWidth={2.2} fill="none" />
      </Part>
      {/* sleep mask on the forehead: pale blue band, cartoon eyes */}
      <Part d={`M-66,-50 Q0,-62 66,-50 L64,-30 Q0,-42 -64,-30Z`} fill="#9cc8f0" shade="#6a9ad0" lw={lw * 0.8} />
      {[-24, 24].map((ex) => <g key={ex}><ellipse cx={ex} cy={-42} rx={12} ry={7} fill="#fff" stroke={INK} strokeWidth={1.6} /><circle cx={ex} cy={-42} r={3.5} fill={INK} /></g>)}
    </g>
  );
};

export const KizaruHead: React.FC<{ face?: AFace; turn?: number; lw: number; glint?: number }> = ({ face = "smirk", turn = 0, lw, glint = 0 }) => {
  const sx = turn * 12;
  return (
    <g>
      <HeadBase turn={turn} skin={PALE} lw={lw} jaw={1.2} neckW={17} />
      {/* slicked-back hair, a little wave at the back */}
      <Part d={smooth([[-56, -6], [-60, -54], [-36, -88], [10, -96], [52, -82], [60, -46], [56, -6], [50, -44], [20, -66], [-20, -66], [-50, -40]])} fill="#2a2220" shade="#140e0c" lw={lw}>
        <path d="M-40,-70 Q0,-84 44,-66 M-46,-56 Q0,-72 50,-52" stroke="#4a3a34" strokeWidth={2.4} fill="none" />
      </Part>
      {/* thin brows over orange shades */}
      <path d={`M${-36 + sx},-20 Q${-22 + sx},-26 ${-8 + sx},-20 M${8 + sx},-20 Q${22 + sx},-26 ${36 + sx},-20`} stroke="#2a2220" strokeWidth={3.4} fill="none" strokeLinecap="round" />
      {[-21, 21].map((ex) => (
        <path key={ex} d={`M${ex - 16 + sx},-8 L${ex + 16 + sx},-8 L${ex + 14 + sx},6 Q${ex + sx},14 ${ex - 14 + sx},6Z`} fill="#f08a2a" stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />
      ))}
      <path d={`M${-5 + sx},-6 L${5 + sx},-6 M${-37 + sx},-6 L${-48 + sx},-12 M${37 + sx},-6 L${48 + sx},-12`} stroke={INK} strokeWidth={2.6} />
      {glint > 0 && <path d={`M${14 + sx},-4 l6,-10 l2,8 l10,2 l-10,3 l-2,9 l-4,-8 l-10,-3Z`} fill="#fff" opacity={glint} transform={`scale(${0.8 + glint * 0.6})`} style={{ transformOrigin: `${20 + sx}px -2px` }} />}
      <path d={`M${sx + 2},14 L${sx + 7},34 L${sx - 1},37`} stroke={INK} strokeWidth={2} fill="none" />
      {/* the long lazy mouth: "ohhh?" */}
      {face === "oh" ? (
        <ellipse cx={sx} cy={56} rx={10} ry={8} fill="#5a1418" stroke={INK} strokeWidth={2.4} />
      ) : (
        <path d={`M${sx - 18},54 Q${sx},60 ${sx + 20},52`} stroke={INK} strokeWidth={2.8} fill="none" strokeLinecap="round" />
      )}
      <path d={`M${sx - 4},70 q4,6 8,0`} stroke={INK} strokeWidth={1.8} fill="none" />
    </g>
  );
};

/* ---------------------------------- bodies ---------------------------------- */

type AProps = { who: AdmiralKey; p: Pose; lw?: number; face?: AFace; x?: number; y?: number; s?: number; flipX?: boolean; glint?: number; coat?: boolean; children?: React.ReactNode };

export const Admiral: React.FC<AProps> = ({ who, p, lw = 4, face, x = 0, y = 0, s = 1, flipX, glint = 0, coat = true, children }) => {
  const L = LOOK[who];
  const T = torsoPts(p, 0.1, 24);
  const waistL = T[8], waistR = T[5];
  const midS = mix(p.shL, p.shR, 0.5), midH = mix(p.hipL, p.hipR, 0.5);
  const vBot = mix(midS, midH, 0.42);
  const leg = (hip: P, kn: P, ft: P, fd = 0, key: string) => (
    <g key={key}>
      <Part d={tube([hip, kn, ft], [27, 24, 21])} fill={L.suit} shade={L.suitS} lw={lw}>
        {L.stripe && [-14, 0, 14].map((o) => <path key={o} d={`M${fx(add(hip, [o, 0]))}L${fx(add(kn, [o * 0.9, 0]))}L${fx(add(ft, [o * 0.8, -20]))}`} stroke={L.stripe} strokeWidth={2} fill="none" />)}
      </Part>
      <g transform={`translate(${ft[0]},${ft[1] + 4})`}><Part d={footShape(fd, 1.1)} fill={L.shoe} lw={lw} /></g>
    </g>
  );
  const arm = (sh: P, el: P, ha: P, hk: HandKind, side: number, key: string) => (
    <g key={key}>
      <Hand at={ha} dir={armDir(el, ha)} kind={hk} skin={L.skin.base} shade={L.skin.shade} lw={lw} s={1.1} flip={side < 0} />
      <Part d={tube([sh, el, mix(el, ha, 0.9)], [24, 21, 19])} fill={L.suit} shade={L.suitS} lw={lw}>
        {L.stripe && <path d={`M${fx(sh)}L${fx(el)}L${fx(mix(el, ha, 0.9))}`} stroke={L.stripe} strokeWidth={2} fill="none" />}
      </Part>
    </g>
  );
  // the Justice coat: hangs from the shoulders, wider than him, sleeves empty
  const coatD = smooth([add(p.shL, [-30, -6]), add(p.neck, [0, -10]), add(p.shR, [30, -6]), add(p.shR, [80, 200]), add(p.hipR, [90, 230]), add(midH, [0, 300]), add(p.hipL, [-90, 230]), add(p.shL, [-80, 200])], true, 0.7);
  const Head = who === "akainu" ? AkainuHead : who === "kuzan" ? KuzanHead : KizaruHead;
  return (
    <Wrap x={x} y={y} s={s} flipX={flipX}>
      {coat && <Part d={coatD} fill="#f6f6f2" shade="#c4c8d2" lw={lw} sh={[-10, -4]} />}
      {p.backL && arm(p.shL, p.elL, p.haL, p.hL ?? "relax", -1, "aL")}
      {p.backR && arm(p.shR, p.elR, p.haR, p.hR ?? "relax", 1, "aR")}
      {leg(p.hipL, p.knL, p.ftL, p.fdL, "lL")}
      {leg(p.hipR, p.knR, p.ftR, p.fdR, "lR")}
      {/* jacket */}
      <Part d={smooth([...T.slice(0, 6), add(p.hipR, [28, 60]), add(midH, [0, 74]), add(p.hipL, [-28, 60]), ...T.slice(8)])} fill={L.suit} shade={L.suitS} lw={lw}>
        {L.stripe && [-60, -30, 0, 30, 60].map((o) => <path key={o} d={`M${fx(add(midS, [o, -20]))}L${fx(add(midH, [o * 1.2, 80]))}`} stroke={L.stripe} strokeWidth={2} />)}
        {[0, 1].map((i) => <circle key={i} cx={vBot[0] + 10} cy={vBot[1] + 60 + i * 60} r={6} fill="#e8d8a0" stroke={INK} strokeWidth={1.4} />)}
      </Part>
      {/* shirt V */}
      <Part d={smooth([mix(p.neck, p.shL, 0.3), mix(p.neck, p.shR, 0.3), vBot], true, 0.3)} fill={L.shirt} shade={L.shirtS} lw={lw * 0.8}>
        {who === "akainu" && [[-14, 20], [10, 36], [-4, 56], [16, 70]].map(([dx, dy], i) => <circle key={i} cx={p.neck[0] + dx} cy={p.neck[1] + dy} r={6} fill="#e85a64" stroke="#5c0e14" strokeWidth={1.4} />)}
      </Part>
      <path d={`M${fx(mix(p.neck, p.shL, 0.32))}L${fx(add(vBot, [-4, 8]))}M${fx(mix(p.neck, p.shR, 0.32))}L${fx(add(vBot, [4, 8]))}`} stroke={INK} strokeWidth={3} />
      {/* coat epaulette edges over the shoulders */}
      {coat && <path d={`M${fx(add(p.shL, [-30, -6]))}Q${fx(add(p.shL, [-6, -26]))} ${fx(add(p.neck, [-30, -14]))} M${fx(add(p.shR, [30, -6]))}Q${fx(add(p.shR, [6, -26]))} ${fx(add(p.neck, [30, -14]))}`} stroke={INK} strokeWidth={lw} fill="none" />}
      {!p.backL && arm(p.shL, p.elL, p.haL, p.hL ?? "relax", -1, "aL")}
      {!p.backR && arm(p.shR, p.elR, p.haR, p.hR ?? "relax", 1, "aR")}
      <g transform={`translate(${p.head[0]},${p.head[1]}) rotate(${p.tilt}) scale(1.1)`}>
        {who === "kizaru" ? <KizaruHead face={face} turn={p.turn} lw={lw} glint={glint} /> : <Head face={face} turn={p.turn} lw={lw} />}
      </g>
      {children}
    </Wrap>
  );
};
