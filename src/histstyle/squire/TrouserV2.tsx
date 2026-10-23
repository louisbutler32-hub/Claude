import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT, hash, lerp, prog, smokePuffs, useHistFonts } from "../shared";
import { Figure, KITS, Lebel, MusketH } from "./Figure";
import { Blur, Countryside, H, W } from "./sets";
import timing from "./timing.json";

// ── Style F v2 · the storybook explainer, rebuilt to production finish ──
//
// Same original script and narration as v1, rebuilt on the shot grammar of
// a produced 2D explainer: actors big in frame (waist-up, two-shots), the
// world behind them layered and blurred by depth, thick clean outlines,
// shaded costumes with real kit, and cutaways (stage, year banner,
// blueprint). Every cut and reveal is keyed to the narration timings.

type Line = { id: string; start: number; end: number; text: string };
const LINES = timing as Line[];
export const SQ2_FRAMES = Math.ceil((LINES[LINES.length - 1].end + 0.45) * 30);
const at = (id: string) => Math.round(LINES.find((l) => l.id === id)!.start * 30);
const wordAt = (id: string, word: string) => {
  const l = LINES.find((x) => x.id === id)!;
  const i = l.text.indexOf(word);
  return Math.round((l.start + ((l.end - l.start) * Math.max(0, i)) / l.text.length) * 30);
};
const LN = "#1d1818";

const Cam: React.FC<{ lf: number; dur: number; from?: [number, number, number]; to?: [number, number, number]; children: React.ReactNode }> = ({
  lf, dur, from = [W / 2, H / 2, 1], to = [W / 2, H / 2, 1.05], children,
}) => {
  const p = interpolate(lf, [0, dur], [0, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.33, 0, 0.67, 1) });
  const cx = lerp(from[0], to[0], p), cy = lerp(from[1], to[1], p), z = lerp(from[2], to[2], p);
  return <g transform={`translate(${W / 2},${H / 2}) scale(${z}) translate(${-cx},${-cy})`}>{children}</g>;
};

const Smoke: React.FC<{ x: number; y: number; age: number; size: number; seed: number; dir?: number }> = ({ x, y, age, size, seed, dir = 1 }) => (
  <g>
    {smokePuffs(seed, age, size).map((p, j) => (
      <g key={j}>
        <circle cx={x + dir * p.x * 1.4} cy={y + p.y} r={p.r * 1.3} fill="#f5f2ec" stroke="#b9b0a2" strokeWidth={3} />
        <path d={`M${x + dir * p.x * 1.4 - p.r * 1.2},${y + p.y + p.r * 0.3} A${p.r * 1.3},${p.r * 1.3} 0 0 0 ${x + dir * p.x * 1.4 + p.r * 1.2},${y + p.y + p.r * 0.3}`} fill="#ddd6ca" />
      </g>
    ))}
  </g>
);

const Tag: React.FC<{ x: number; y: number; text: string; p: number; tx: number; ty: number; color?: string }> = ({ x, y, text, p, tx, ty, color = "#b5261d" }) => {
  if (p <= 0) return null;
  const s = Easing.out(Easing.back(1.8))(Math.min(1, p));
  const w = text.length * 25 + 60;
  return (
    <g>
      <path d={`M${x},${y + 36} Q${(x + tx) / 2 + 60},${(y + ty) / 2} ${tx},${ty}`} stroke={LN} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray={`${600 * Math.min(1, p)} 600`} />
      <circle cx={tx} cy={ty} r={9 * s} fill={LN} />
      <g transform={`translate(${x},${y}) scale(${s}) rotate(-3)`}>
        <rect x={-w / 2} y={-38} width={w} height={76} rx={10} fill="#fbf1dc" stroke={LN} strokeWidth={6} />
        <text y={14} textAnchor="middle" fontFamily={FONT.oswald} fontWeight={700} fontSize={42} letterSpacing={3} fill={color}>
          {text}
        </text>
      </g>
    </g>
  );
};

// ── 1 · August 1914: tilt down to the trousers ────────────────────────

const S1: React.FC<{ lf: number; dur: number }> = ({ lf, dur }) => {
  const tReveal = wordAt("l0", "bright red") - at("l0") - 18;
  const tilt = prog(lf, tReveal, tReveal + 22, Easing.inOut(Easing.cubic));
  const tag = prog(lf, tReveal + 22, tReveal + 34);
  const push = prog(lf, 0, dur, Easing.linear);
  return (
    <g transform={`translate(0,${-tilt * 430}) translate(960,540) scale(${1 + push * 0.04}) translate(-960,-540)`}>
      <g transform="translate(0,-40) scale(1.12) translate(-100,-40)">
        <Countryside f={lf} id="s1" blur={{ far: 7, mid: 5, near: 3 }} horizon={520} road={false} />
      </g>
      <Blur id="s1-col" px={3}>
        {Array.from({ length: 7 }, (_, i) => (
          <Figure key={i} id={`c1${i}`} x={((i * 240 + lf * 3) % 2100) - 100} y={760} s={0.62} f={lf} kit={KITS.fr1914} hat="kepi" pose="rifle" walk={lf + i * 9} hold={<Lebel />} look={0.8} />
        ))}
      </Blur>
      <Figure id="hero1" x={820} y={1250} s={3.0} f={lf} kit={KITS.fr1914} hat="kepi" pose="rifle" hold={<Lebel />} expr={tilt > 0.5 ? "worried" : "neutral"} look={tilt > 0.5 ? -0.2 : 0.35} walk={tilt > 0.1 ? undefined : lf} />
      <Tag x={1400} y={880} text="PANTALON ROUGE" p={tag} tx={905} ty={1075} />
    </g>
  );
};

// ── 2 · across the field, grey in the hedge ───────────────────────────

const S2: React.FC<{ lf: number; dur: number; f: number }> = ({ lf, dur, f }) => {
  const q = prog(f, wordAt("l1", "You can barely"), wordAt("l1", "You can barely") + 10, Easing.out(Easing.back(2)));
  return (
    <Cam lf={lf} dur={dur} from={[700, 560, 1.05]} to={[1300, 560, 1.12]}>
      <Countryside f={lf} id="s2" blur={{ far: 2, mid: 0, near: 0 }} horizon={500} road={false} />
      {/* the grey line in the far hedge: nearly the same colour as it */}
      <g>
        {Array.from({ length: 8 }, (_, i) => (
          <Figure key={i} id={`de${i}`} x={1240 + i * 90} y={640} s={0.42} f={lf} kit={KITS.de1914} hat="pickelhaube" pose="down" skin="#d9c6b0" expr="determined" look={-0.7} tint={0.45} air="#8fae78" shadow={false} />
        ))}
        {Array.from({ length: 14 }, (_, i) => (
          <ellipse key={i} cx={1200 + i * 60} cy={626 + (i % 2) * 6} rx={46} ry={26} fill="#748a5c" stroke="#4f6440" strokeWidth={3} />
        ))}
      </g>
      {/* the French, bright in the open */}
      {Array.from({ length: 6 }, (_, i) => (
        <Figure key={i} id={`fr${i}`} x={220 + i * 150} y={980 - (i % 2) * 40} s={1.05} f={lf} kit={KITS.fr1914} hat="kepi" pose="rifle" hold={<Lebel />} walk={lf + i * 7} look={0.8} />
      ))}
      {q > 0 && (
        <g transform={`translate(1560,520) scale(${q})`}>
          <circle r={50} fill="#fbf1dc" stroke={LN} strokeWidth={6} />
          <text y={22} textAnchor="middle" fontFamily={FONT.anton} fontSize={66} fill={LN}>
            ?
          </text>
        </g>
      )}
    </Cam>
  );
};

// ── 3 · their field glasses ───────────────────────────────────────────

const S3: React.FC<{ lf: number; dur: number }> = ({ lf, dur }) => {
  const sway = Math.sin(lf / 9) * 12;
  return (
    <g>
      <defs>
        <mask id="s3-bino">
          <rect width={W} height={H} fill="#000" />
          <circle cx={W / 2 - 240 + sway} cy={H / 2} r={430} fill="#fff" />
          <circle cx={W / 2 + 240 + sway} cy={H / 2} r={430} fill="#fff" />
        </mask>
      </defs>
      <rect width={W} height={H} fill="#0c0b0a" />
      <g mask="url(#s3-bino)">
        <Cam lf={lf} dur={dur} from={[960, 520, 1.0]} to={[960, 520, 1.06]}>
          <Countryside f={lf} id="s3" blur={{ far: 8, mid: 6, near: 4 }} horizon={460} road={false} />
          <Figure id="pov" x={960} y={1190} s={2.6} f={lf} kit={KITS.fr1914} hat="kepi" pose="wave" expr="happy" look={0.1} />
        </Cam>
        <circle cx={W / 2 - 240 + sway} cy={H / 2} r={430} fill="none" stroke="#000" strokeWidth={70} opacity={0.35} />
        <circle cx={W / 2 + 240 + sway} cy={H / 2} r={430} fill="none" stroke="#000" strokeWidth={70} opacity={0.35} />
      </g>
    </g>
  );
};

// ── 4 · the stage: dressed like a target ──────────────────────────────

const S4: React.FC<{ lf: number; dur: number; f: number }> = ({ lf, dur, f }) => {
  const t = prog(f, wordAt("l3", "targets") - 4, wordAt("l3", "targets") + 10, Easing.out(Easing.back(1.6)));
  return (
    <Cam lf={lf} dur={dur} from={[960, 560, 1]} to={[960, 560, 1.07]}>
      <defs>
        <radialGradient id="s4-spot" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe9b8" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffe9b8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="s4-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a1d1a" />
          <stop offset="1" stopColor="#3d2a22" />
        </linearGradient>
      </defs>
      <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="url(#s4-wall)" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M${i * 240 - 40},-100 C${i * 240 - 10},300 ${i * 240 - 50},600 ${i * 240 - 20},860`} stroke="#22170f" strokeWidth={22} fill="none" opacity={0.6} />
      ))}
      <rect x={-100} y={850} width={W + 200} height={300} fill="#5a3d28" stroke={LN} strokeWidth={6} />
      {Array.from({ length: 14 }, (_, i) => (
        <line key={i} x1={i * 150} y1={856} x2={i * 150 - 140} y2={H + 100} stroke="#3f2a1b" strokeWidth={5} />
      ))}
      <path d="M840,-100 L1080,-100 L1400,920 L520,920 Z" fill="#fff0c8" opacity={0.14} />
      <ellipse cx={960} cy={930} rx={420} ry={74} fill="url(#s4-spot)" />
      {t > 0 && (
        <g transform={`translate(960,520) scale(${t})`}>
          {[330, 264, 198, 132, 66].map((r, i) => (
            <circle key={r} r={r} fill={i % 2 ? "#fbf1dc" : "#cf3b2e"} stroke={LN} strokeWidth={7} />
          ))}
        </g>
      )}
      <Figure id="stage" x={960} y={950} s={2.2} f={lf} kit={KITS.fr1914} hat="kepi" pose={t > 0.5 ? "shrug" : "down"} expr={t > 0.5 ? "worried" : "neutral"} sweat={t > 0.5} look={0} />
    </Cam>
  );
};

// ── 5 · back a hundred years: muskets and smoke ───────────────────────

const S5: React.FC<{ lf: number; dur: number }> = ({ lf, dur }) => {
  const cut = 46;
  if (lf < cut) {
    const p = prog(lf, 4, cut - 10, Easing.inOut(Easing.cubic));
    const year = Math.round(lerp(1914, 1815, p));
    return (
      <g>
        <rect width={W} height={H} fill="#6b4a32" />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={0} y1={i * 95 + 20} x2={W} y2={i * 95} stroke="#5a3d28" strokeWidth={8} />
        ))}
        <g transform="translate(960,540) rotate(-2)">
          <path d="M-520,-170 L520,-170 C500,-100 500,100 520,170 L-520,170 C-500,100 -500,-100 -520,-170 Z" fill="#f2e2bd" stroke={LN} strokeWidth={8} />
          <path d="M-490,-140 L490,-140 M-490,140 L490,140" stroke="#c9a96e" strokeWidth={4} />
          <text y={80} textAnchor="middle" fontFamily={FONT.playfair} fontWeight={900} fontSize={250} fill={LN}>
            {year}
          </text>
        </g>
      </g>
    );
  }
  const b = lf - cut;
  const fill = prog(b, 50, dur - cut, Easing.in(Easing.quad));
  const shooters = Array.from({ length: 5 }, (_, i) => i);
  return (
    <Cam lf={b} dur={dur - cut} from={[960, 600, 1.02]} to={[960, 600, 1.1]}>
      <Countryside f={lf} id="s5" blur={{ far: 3, mid: 1, near: 0 }} horizon={500} road={false} poppies={false} />
      {shooters.map((i) => (
        <Figure key={`r${i}`} id={`rc${i}`} x={220 + i * 110} y={900 + i * 18} s={0.95} f={b} kit={KITS.redcoat} hat="shako" pose="aim" hold={<MusketH />} expr="determined" look={0.9} />
      ))}
      {shooters.map((i) => (
        <Figure key={`b${i}`} id={`bc${i}`} x={1700 - i * 110} y={900 + i * 18} s={0.95} f={b} kit={KITS.bluecoat} hat="shakoFr" pose="aim" hold={<MusketH />} expr="determined" look={0.9} flip />
      ))}
      {shooters.map((i) => {
        const ageR = b - (10 + i * 4);
        const ageB = b - (26 + i * 4);
        const yR = 900 + i * 18 - 0.95 * 170;
        return (
          <g key={`s${i}`}>
            {ageR >= 0 && ageR < 4 && <path d={`M${220 + i * 110 + 330},${yR} l40,-14 l-10,14 l44,10 l-44,6 l6,16 Z`} fill="#ffd34a" stroke={LN} strokeWidth={3} />}
            {ageR >= 0 && <Smoke x={220 + i * 110 + 360} y={yR} age={ageR + 8} size={48} seed={i + 3} />}
            {ageB >= 0 && ageB < 4 && <path d={`M${1700 - i * 110 - 330},${yR} l-40,-14 l10,14 l-44,10 l44,6 l-6,16 Z`} fill="#ffd34a" stroke={LN} strokeWidth={3} />}
            {ageB >= 0 && <Smoke x={1700 - i * 110 - 360} y={yR} age={ageB + 8} size={48} seed={i + 11} dir={-1} />}
          </g>
        );
      })}
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#eeebe4" opacity={fill * 0.92} />
    </Cam>
  );
};

// ── 6 · lost in the smoke ─────────────────────────────────────────────

const S6: React.FC<{ lf: number; dur: number; f: number }> = ({ lf, dur, f }) => {
  const meetAt = dur * 0.4;
  const meet = Math.min(1, lf / meetAt);
  const bumped = lf > meetAt;
  const bang = prog(lf, meetAt, meetAt + 8, Easing.out(Easing.back(2.2)));
  const recog = prog(f, wordAt("l5", "bright colours") - 2, wordAt("l5", "bright colours") + 10);
  const xr = lerp(220, 700, Easing.out(Easing.quad)(meet)) - (bumped ? 40 * bang : 0);
  const xb = lerp(1700, 1220, Easing.out(Easing.quad)(meet)) + (bumped ? 40 * bang : 0);
  return (
    <Cam lf={lf} dur={dur} from={[960, 560, 1]} to={[960, 560, 1.06]}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#e7e3db" />
      <Blur id="s6-ghosts" px={6}>
        {Array.from({ length: 10 }, (_, i) => (
          <Figure key={i} id={`gh${i}`} x={hash(i) * W} y={720 + hash(i + 2) * 120} s={0.6 + hash(i + 4) * 0.3} f={lf} kit={i % 2 ? KITS.redcoat : KITS.bluecoat} hat={i % 2 ? "shako" : "shakoFr"} tint={0.75} air="#e7e3db" shadow={false} pose="aim" hold={<MusketH />} flip={i % 2 === 0} />
        ))}
      </Blur>
      <path d={`M-200,900 C400,880 1300,910 ${W + 200},890 L${W + 200},${H + 200} L-200,${H + 200} Z`} fill="#d5cfc3" />
      <Figure id="lostR" x={xr} y={1150} s={1.9} f={lf} kit={KITS.redcoat} hat="shako" pose="forward" walk={bumped ? undefined : lf} expr={bumped ? "shocked" : "worried"} look={bumped ? 0.7 : 0.3} />
      <Figure id="lostB" x={xb} y={1150} s={1.9} f={lf} kit={KITS.bluecoat} hat="shakoFr" pose="forward" walk={bumped ? undefined : lf + 9} expr={bumped ? "shocked" : "worried"} look={bumped ? 0.7 : 0.3} flip />
      {bumped &&
        [-1, 1].map((sd) => (
          <g key={sd} transform={`translate(${960 + sd * 260},${250}) scale(${bang})`}>
            <path d="M-16,-70 L16,-70 L9,12 L-9,12 Z" fill="#cf3b2e" stroke={LN} strokeWidth={6} />
            <circle cy={40} r={12} fill="#cf3b2e" stroke={LN} strokeWidth={6} />
          </g>
        ))}
      {recog > 0 && (
        <g opacity={Math.min(1, recog)}>
          <Tag x={xr - 330} y={330} text="RED = BRITISH" p={recog} tx={xr - 40} ty={900} />
          <Tag x={xb + 330} y={330} text="BLUE = FRENCH" p={recog} tx={xb + 40} ty={900} color="#2f529e" />
        </g>
      )}
      <Blur id="s6-front" px={10}>
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse key={i} cx={((hash(i) * 2600 + lf * (1.4 + hash(i + 1))) % 2600) - 340} cy={400 + hash(i + 2) * 700} rx={300} ry={110} fill="#f8f6f1" opacity={0.6} />
        ))}
      </Blur>
    </Cam>
  );
};

// ── 7 · smokeless powder, then the bullseye ───────────────────────────

const S7: React.FC<{ lf: number; dur: number; split: number }> = ({ lf, dur, split }) => {
  if (lf < split) {
    const draw = prog(lf, 0, split * 0.55, Easing.inOut(Easing.quad));
    return (
      <Cam lf={lf} dur={split} from={[960, 540, 1]} to={[960, 540, 1.04]}>
        <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#1d4b82" />
        {Array.from({ length: 34 }, (_, i) => (
          <line key={`v${i}`} x1={i * 60} y1={-100} x2={i * 60} y2={H + 100} stroke="#36679f" strokeWidth={i % 4 ? 1 : 2.5} />
        ))}
        {Array.from({ length: 20 }, (_, i) => (
          <line key={`h${i}`} x1={-100} y1={i * 60} x2={W + 100} y2={i * 60} stroke="#36679f" strokeWidth={i % 4 ? 1 : 2.5} />
        ))}
        <g transform="translate(960,520) scale(1.4) translate(-1000,-540)" fill="none" stroke="#eaf3ff" strokeWidth={4.5} strokeLinejoin="round">
          <path pathLength={1} strokeDasharray={`${draw} 1`} d="M560,460 L1180,460 L1180,620 L560,620 Z" />
          <path pathLength={1} strokeDasharray={`${draw} 1`} d="M1180,470 L1300,470 C1380,470 1420,510 1440,540 C1420,570 1380,610 1300,610 L1180,610" />
          <path pathLength={1} strokeDasharray={`${draw} 1`} d="M600,460 L600,620 M540,480 L560,480 M540,600 L560,600" />
          {Array.from({ length: 70 }, (_, i) => (
            <rect key={i} x={620 + hash(i) * 540} y={480 + hash(i + 9) * 120} width={10} height={4} fill="#eaf3ff" stroke="none" opacity={draw > hash(i + 3) ? 0.8 : 0} transform={`rotate(${hash(i) * 180},${620 + hash(i) * 540},${480 + hash(i + 9) * 120})`} />
          ))}
        </g>
        <g opacity={prog(lf, 10, 22)}>
          <path d="M400,800 L1630,800 M400,786 L400,814 M1630,786 L1630,814" stroke="#eaf3ff" strokeWidth={3} />
          <text x={960} y={890} textAnchor="middle" fontFamily={FONT.oswald} fontWeight={600} fontSize={60} letterSpacing={8} fill="#eaf3ff">
            SMOKELESS POWDER · 1884
          </text>
          <text x={960} y={230} textAnchor="middle" fontFamily={FONT.oswald} fontWeight={500} fontSize={40} letterSpacing={6} fill="#a9c6e8">
            NO CLOUD · LONGER RANGE
          </text>
        </g>
      </Cam>
    );
  }
  const b = lf - split;
  const ring = prog(b, 4, 20, Easing.out(Easing.cubic));
  return (
    <Cam lf={b} dur={dur - split} from={[960, 560, 1]} to={[960, 640, 1.12]}>
      <g transform="translate(0,-40) scale(1.12) translate(-100,-40)">
        <Countryside f={lf} id="s7" blur={{ far: 7, mid: 5, near: 3 }} horizon={520} road={false} />
      </g>
      <Figure id="last" x={960} y={1250} s={3.0} f={b} kit={KITS.fr1914} hat="kepi" pose="down" expr={ring > 0.5 ? "shocked" : "worried"} sweat look={0} />
      <g transform={`translate(960,1000) scale(${lerp(4, 1, ring)})`} opacity={ring}>
        <circle r={130} fill="none" stroke="#cf3b2e" strokeWidth={12} />
        <circle r={70} fill="none" stroke="#cf3b2e" strokeWidth={10} />
        <path d="M-190,0 L-50,0 M50,0 L190,0 M0,-190 L0,-50 M0,50 L0,190" stroke="#cf3b2e" strokeWidth={10} />
      </g>
    </Cam>
  );
};

const SHOTS = [
  { from: 0, C: S1 },
  { from: at("l1") - 4, C: S2 },
  { from: at("l2") - 4, C: S3 },
  { from: at("l3") - 6, C: S4 },
  { from: at("l4") - 8, C: S5 },
  { from: at("l5") - 4, C: S6 },
  { from: at("l6") - 4, C: S7 },
];

export const TrouserV2: React.FC<{ narration?: string | null }> = ({ narration = "assets/vo/histstyle-trousers.mp3" }) => {
  useHistFonts();
  const f = useCurrentFrame();
  let si = 0;
  for (let i = 0; i < SHOTS.length; i++) if (f >= SHOTS[i].from) si = i;
  const shot = SHOTS[si];
  const next = SHOTS[si + 1]?.from ?? SQ2_FRAMES;
  const lf = f - shot.from;
  const dur = next - shot.from;
  const split = wordAt("l6", "and those") - shot.from;
  const Scene = shot.C as React.FC<{ lf: number; dur: number; f: number; split: number }>;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {narration && <Audio src={staticFile(narration)} />}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <Scene lf={lf} dur={dur} f={f} split={split} />
      </svg>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: 0.08 }}>
        <filter id="v2-paper">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={2} seed={4} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter="url(#v2-paper)" />
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 80% at 50% 50%, rgba(30,15,10,0) 70%, rgba(30,15,10,0.22) 100%)" }} />
    </AbsoluteFill>
  );
};
