import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { Bear, Bunny, Cat, Dog, type CharId, type Pose } from "./chars";
import { Countdown, Headline, loadPlayFonts, Payoff } from "./text";
import { backOut, clamp01, FPS, H, lerp, ramp, rnd, smooth, W } from "./finger-kit";

/**
 * "Swimming race!" — choose your champion, in a pool.
 *
 * Four lanes, four swimmers: Poppy, Mimi, Bruno, Biscuit. A countdown, a
 * dive, and a camera that tracks the race down the pool. Then the chaos
 * the format runs on: Mimi reaches over the rope and hauls Bruno back,
 * Poppy grows a shark fin and chomps Mimi clear off the screen, Mimi comes
 * back for revenge, and in the last stretch everyone crashes into Bruno in
 * a swirl of limbs. Bruno is launched onto the finish deck, crowned, and
 * WINNER pops up over the cheering pool.
 *
 * The camera keeps moving, so every swimmer's screen position is keyframed
 * (who is ahead, who is dragged back, who is flung off) while the water and
 * the rope beads scroll underneath at the camera's speed.
 */

export const SWIM_FRAMES = 28 * FPS;

const LANE_Y = [350, 730, 1110, 1490];
const ROPE_Y = [160, 540, 920, 1300, 1680];
const CAM_END = 3000;
const FIN = 3820; // world x where the finish deck starts
const T_GO = 2.0;
const T_CAM0 = 2.4;
const T_CAM1 = 24.5;

type Key = [number, number];
/** smooth interpolation through keyframes [time, value] */
const kf = (keys: Key[], t: number) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      return lerp(v0, v1, smooth((t - t0) / (t1 - t0)));
    }
  }
  return keys[keys.length - 1][1];
};

const camX = (t: number) => CAM_END * smooth((t - T_CAM0) / (T_CAM1 - T_CAM0)) ** 1;

type Skin = { fill: string; light: string; line: string; inner: string; nose: string };
const SKIN: Record<CharId, Skin> = {
  bunny: { fill: "#f8cfdc", light: "#fde8ef", line: "#b0647f", inner: "#f4a0b9", nose: "#ef7e9b" },
  cat: { fill: "#f7b26a", light: "#fcd19e", line: "#a15c2a", inner: "#f6a8a6", nose: "#ef7f89" },
  bear: { fill: "#c89063", light: "#dcad82", line: "#6c4529", inner: "#eab98c", nose: "#3d2a22" },
  dog: { fill: "#fbf1e3", light: "#ffffff", line: "#9b7355", inner: "#d9a066", nose: "#4a3430" },
};

type Face = "happy" | "angry" | "shout" | "shock" | "dizzy" | "cheer" | "open";

/** a swimmer seen from the side, facing right, half in the water */
const Swimmer: React.FC<{
  id: CharId;
  x: number;
  y: number;
  t: number;
  face?: Face;
  fin?: boolean;
  bite?: number;
  rot?: number;
  scale?: number;
  cheer?: boolean;
  phase?: number;
  stroke?: number;
}> = ({ id, x, y, t, face = "happy", fin = false, bite = 0, rot = 0, scale = 1, cheer = false, phase = 0, stroke = 1 }) => {
  const k = SKIN[id];
  const sw = Math.sin(t * 11 + phase) * stroke;
  const bob = Math.sin(t * 5 + phase) * 4;
  const armsUp = cheer;
  return (
    <g transform={`translate(${x} ${y + bob}) rotate(${rot}) scale(${scale})`}>
      {/* wake */}
      <path d="M -70 -4 Q -190 -40 -300 -64 M -70 4 Q -190 40 -300 64 M -90 0 Q -200 0 -330 0" fill="none" stroke="#ffffff" strokeWidth={9} strokeLinecap="round" opacity={0.7} />
      {/* the body under the surface */}
      <ellipse cx={-92} cy={6} rx={104} ry={52} fill={k.fill} opacity={0.62} stroke={k.line} strokeWidth={5} />
      {fin ? (
        <path d="M -140 -34 L -92 -150 L -40 -34 Z" fill="#6e86a8" stroke="#3d516e" strokeWidth={6} strokeLinejoin="round" />
      ) : null}
      {/* kicking feet */}
      {[-1, 1].map((s) => (
        <circle key={s} cx={-206 - s * 6} cy={s * 24} r={20 + Math.abs(Math.sin(t * 14 + s)) * 8} fill="#ffffff" opacity={0.75} />
      ))}
      {/* the arm that is reaching */}
      {!armsUp ? (
        <g transform={`translate(${-6 + sw * 20} ${-50 - Math.max(0, sw) * 18})`}>
          <ellipse rx={32} ry={20} fill={k.fill} stroke={k.line} strokeWidth={5} transform={`rotate(${-20 + sw * 25})`} />
        </g>
      ) : (
        <g stroke={k.line} strokeWidth={5} strokeLinecap="round">
          <line x1={-30} y1={-30} x2={-56} y2={-112} stroke={k.line} strokeWidth={30} />
          <line x1={-30} y1={-30} x2={-56} y2={-112} stroke={k.fill} strokeWidth={20} />
          <line x1={28} y1={-34} x2={52} y2={-114} stroke={k.line} strokeWidth={30} />
          <line x1={28} y1={-34} x2={52} y2={-114} stroke={k.fill} strokeWidth={20} />
          <circle cx={-58} cy={-120} r={19} fill={k.fill} />
          <circle cx={54} cy={-122} r={19} fill={k.fill} />
        </g>
      )}
      {/* ears, behind the head */}
      {id === "bunny" ? (
        <g fill={k.fill} stroke={k.line} strokeWidth={5} strokeLinejoin="round">
          <path d="M -6 -50 C -70 -76 -150 -76 -190 -52 C -150 -34 -70 -30 -10 -30 Z" />
          <path d="M -90 -58 C -130 -66 -160 -62 -176 -52 C -150 -44 -110 -42 -84 -46 Z" fill={k.inner} stroke="none" />
          <path d="M -20 -44 C -60 -96 -120 -118 -170 -108 C -140 -86 -80 -54 -30 -26 Z" />
        </g>
      ) : null}
      {id === "cat" ? <path d="M -30 -48 L -14 -112 L 22 -58 Z" fill={k.fill} stroke={k.line} strokeWidth={5} strokeLinejoin="round" /> : null}
      {id === "bear" ? <circle cx={-26} cy={-50} r={24} fill={k.fill} stroke={k.line} strokeWidth={5} /> : null}
      {/* the head */}
      <circle r={66} fill={k.fill} stroke={k.line} strokeWidth={6} />
      <ellipse cx={-22} cy={-34} rx={22} ry={11} fill="#ffffff" opacity={0.45} transform="rotate(-24 -22 -34)" />
      {id === "dog" ? <path d="M -30 -28 C -56 -24 -60 24 -34 44 C -14 36 -10 -4 -30 -28 Z" fill={k.inner} stroke={k.line} strokeWidth={5} strokeLinejoin="round" /> : null}
      {id === "dog" ? <ellipse cx={26} cy={-22} rx={22} ry={20} fill={k.inner} opacity={0.85} /> : null}
      {id === "cat" ? <path d="M 0 -64 l 0 14 M -16 -62 l 4 12 M 16 -62 l -4 12" stroke={k.line} strokeWidth={5} strokeLinecap="round" /> : null}
      {id === "bear" ? <ellipse cx={42} cy={14} rx={26} ry={20} fill="#f1d4b0" /> : null}
      {id === "bunny" || id === "cat" ? <ellipse cx={40} cy={16} rx={22} ry={16} fill="#ffffff" opacity={0.7} /> : null}
      {/* face */}
      <ellipse cx={8} cy={26} rx={16} ry={9} fill="#ff8aa1" opacity={0.5} />
      <g>
        {face === "angry" ? (
          <g>
            <circle cx={24} cy={-12} r={9} fill="#21182b" />
            <path d="M 8 -34 L 40 -20" stroke="#21182b" strokeWidth={7} strokeLinecap="round" />
          </g>
        ) : face === "happy" || face === "cheer" ? (
          <path d="M 12 -8 q 12 -16 24 0" stroke="#21182b" strokeWidth={6} fill="none" strokeLinecap="round" />
        ) : face === "dizzy" ? (
          <path d="M 24 -12 m -10 0 a 10 10 0 1 1 20 0 a 6 6 0 1 1 -10 0" stroke="#21182b" strokeWidth={4} fill="none" />
        ) : (
          <g>
            <ellipse cx={24} cy={-12} rx={face === "shock" ? 15 : 9} ry={face === "shock" ? 17 : 12} fill={face === "shock" ? "#ffffff" : "#21182b"} stroke="#21182b" strokeWidth={face === "shock" ? 4 : 0} />
            {face === "shock" ? <circle cx={26} cy={-10} r={5} fill="#21182b" /> : <circle cx={27} cy={-16} r={3.5} fill="#ffffff" />}
          </g>
        )}
        <ellipse cx={58} cy={6} rx={8} ry={6} fill={k.nose} />
        {bite > 0.05 ? (
          <g transform={`translate(52 24)`}>
            <path d={`M -4 0 L 40 ${-10 - bite * 22} L 40 ${14 + bite * 30} Z`} fill="#6b1a22" stroke="#21182b" strokeWidth={4} strokeLinejoin="round" />
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M ${6 + i * 10} ${-3 - bite * 3} l 5 ${8 + bite * 6} l 5 ${-8 - bite * 6} Z`} fill="#ffffff" />
            ))}
          </g>
        ) : face === "shout" || face === "open" || face === "cheer" ? (
          <path d="M 40 22 q 8 20 22 6 q -8 -10 -22 -6 Z" fill="#6b1a22" stroke="#21182b" strokeWidth={3.5} />
        ) : (
          <path d="M 40 24 q 10 10 22 0" stroke="#21182b" strokeWidth={4} fill="none" strokeLinecap="round" />
        )}
      </g>
      {/* ripple ring where the head meets the water */}
      <ellipse cx={0} cy={0} rx={82} ry={78} fill="none" stroke="#ffffff" strokeWidth={5} opacity={0.5} />
    </g>
  );
};

/* ------------------------------------------------------------------ */

const Pool: React.FC<{ cam: number; t: number }> = ({ cam, t }) => {
  const ripples = Array.from({ length: 70 }, (_, i) => {
    const wx = rnd(i, 1) * 5200 - 200;
    const sx = wx - cam;
    if (sx < -120 || sx > W + 120) return null;
    const sy = 120 + rnd(i, 2) * 1700;
    const w = 40 + rnd(i, 3) * 70;
    const shimmer = 0.45 + 0.35 * Math.sin(t * 3 + i);
    return <path key={i} d={`M ${sx} ${sy} q ${w * 0.25} -12 ${w * 0.5} 0 t ${w * 0.5} 0`} stroke="#ffffff" strokeWidth={5} fill="none" strokeLinecap="round" opacity={shimmer * 0.7} />;
  });
  const finishX = FIN - cam;
  return (
    <g>
      <rect width={W} height={H} fill="#a8dcf8" />
      <rect y={ROPE_Y[0]} width={W} height={ROPE_Y[4] - ROPE_Y[0]} fill="#9cd5f5" />
      {ripples}
      {/* distance flags, every 600 px, so the motion reads */}
      {Array.from({ length: 8 }, (_, i) => {
        const fx = 900 + i * 380 - cam;
        if (fx < -60 || fx > W + 60) return null;
        return <rect key={i} x={fx} y={ROPE_Y[0]} width={10} height={ROPE_Y[4] - ROPE_Y[0]} fill="#ffffff" opacity={0.22} />;
      })}
      {ROPE_Y.map((ry, i) => {
        const dots: React.ReactNode[] = [];
        const first = Math.floor((cam - 40) / 46);
        for (let n = first; n < first + Math.ceil(W / 46) + 3; n++) {
          const bx = n * 46 - cam + 20;
          dots.push(<circle key={n} cx={bx} cy={ry} r={17} fill={n % 6 === 0 ? "#ffffff" : "#e8394a"} stroke="#a8202e" strokeWidth={3} />);
        }
        return <g key={i}>{dots}</g>;
      })}
      {/* start deck */}
      {300 - cam > -10 ? (
        <g>
          <rect x={-60 - cam} y={0} width={360} height={H} fill="#d9dbe3" />
          <rect x={300 - cam - 24} y={0} width={24} height={H} fill="#b7bac8" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={40 - cam} y={ROPE_Y[i] + 22} width={200} height={336} rx={10} fill="#c6c9d6" />
          ))}
        </g>
      ) : null}
      {/* finish deck */}
      {finishX < W + 20 ? (
        <g>
          <rect x={finishX} y={0} width={W} height={H} fill="#d9dbe3" />
          <rect x={finishX} y={0} width={24} height={H} fill="#b7bac8" />
          {Array.from({ length: 14 }, (_, i) => (
            <rect key={i} x={finishX + 60} y={i * 140} width={70} height={70} fill={i % 2 ? "#26202c" : "#ffffff"} opacity={0.9} />
          ))}
          {Array.from({ length: 14 }, (_, i) => (
            <rect key={`b${i}`} x={finishX + 130} y={i * 140 + 70} width={70} height={70} fill={i % 2 ? "#26202c" : "#ffffff"} opacity={0.9} />
          ))}
        </g>
      ) : null}
    </g>
  );
};

/** the swirl of limbs where everybody crashes into Bruno */
const Pileup: React.FC<{ t: number; cx: number; cy: number }> = ({ t, cx, cy }) => {
  const a = ramp(t, 23.55, 23.75) * (1 - ramp(t, 25.05, 25.25));
  if (a <= 0) return null;
  const f = Math.floor(t * 15);
  const limbs = Array.from({ length: 11 }, (_, i) => {
    const ang = rnd(i + f * 3, 11) * Math.PI * 2;
    const r = 150 + rnd(i + f, 12) * 80;
    const kind = i % 4;
    const col = [SKIN.bunny, SKIN.cat, SKIN.bear][i % 3];
    const x = cx + Math.cos(ang) * r;
    const y = cy + Math.sin(ang) * r * 0.85;
    return kind === 3 ? (
      <path key={i} d={`M ${cx + Math.cos(ang) * 110} ${cy + Math.sin(ang) * 95} L ${x + Math.cos(ang) * 40} ${y + Math.sin(ang) * 40}`} stroke={col.fill} strokeWidth={30} strokeLinecap="round" />
    ) : (
      <ellipse key={i} cx={x} cy={y} rx={kind === 0 ? 40 : 28} ry={kind === 0 ? 24 : 28} fill={col.fill} stroke={col.line} strokeWidth={5} transform={`rotate(${ang * 57} ${x} ${y})`} />
    );
  });
  const puffs = Array.from({ length: 9 }, (_, i) => {
    const ang = (i / 9) * Math.PI * 2 + t * 4;
    const r = 70 + Math.sin(t * 17 + i) * 18;
    return <circle key={i} cx={cx + Math.cos(ang) * r} cy={cy + Math.sin(ang) * r * 0.8} r={78 + Math.sin(t * 13 + i * 2) * 14} fill="#ffffff" stroke="#cfd6e4" strokeWidth={5} />;
  });
  const stars = Array.from({ length: 6 }, (_, i) => {
    const ang = rnd(i + f, 14) * Math.PI * 2;
    const r = 130 + rnd(i + f * 2, 15) * 150;
    return <path key={i} d="M 0 -20 L 6 -6 L 20 -4 L 9 5 L 12 20 L 0 12 L -12 20 L -9 5 L -20 -4 L -6 -6 Z" transform={`translate(${cx + Math.cos(ang) * r} ${cy + Math.sin(ang) * r * 0.8}) rotate(${i * 40 + f * 30})`} fill={["#ffd23a", "#ff6b81", "#7bd96a"][i % 3]} stroke="#26202c" strokeWidth={3} />;
  });
  return (
    <g opacity={a}>
      {limbs}
      {puffs}
      <circle cx={cx} cy={cy} r={60} fill="#e9eef7" />
      {stars}
    </g>
  );
};

const Confetti: React.FC<{ t: number }> = ({ t }) => {
  const dt = t - 26.0;
  if (dt < 0) return null;
  return (
    <g>
      {Array.from({ length: 50 }, (_, i) => {
        const x = 220 + rnd(i, 21) * 840;
        const y = -80 + dt * (380 + rnd(i, 22) * 380) + Math.sin(dt * 5 + i) * 30;
        return <rect key={i} x={x} y={y % (H + 100)} width={16} height={26} fill={["#ff6b81", "#ffd23a", "#5fd3c5", "#9b7bff", "#7bd96a"][i % 5]} transform={`rotate(${i * 37 + dt * 300} ${x} ${y})`} />;
      })}
    </g>
  );
};

/* ------------------------------------------------------------------ */

export const SwimShort: React.FC<{ audio?: string | null }> = ({ audio = "audio/play-swim-mix.mp3" }) => {
  loadPlayFonts();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cam = camX(t);

  /* screen positions through the race */
  const poppyX = kf(
    [[T_GO + 0.6, 330], [4, 470], [7, 640], [8.0, 700], [8.45, 745], [9.4, 700], [10.4, 420], [11.8, -230], [13.2, -240], [14.3, -110], [15.3, 520], [16.6, 620], [17.4, 640], [18.4, 380], [20, 80], [21.6, -230], [22.6, -240], [23.3, 540], [23.8, 770], [25.2, 770], [26, 640]],
    t,
  );
  const poppyY = kf([[0, LANE_Y[0]], [7.9, LANE_Y[0]], [8.5, LANE_Y[1] - 130], [9.3, LANE_Y[0]], [16.5, LANE_Y[0]], [17.4, LANE_Y[0] + 90], [18.4, LANE_Y[0]], [23.0, LANE_Y[0]], [23.8, 960], [25.2, 960], [26, 620]], t);
  const mimiX = kf(
    [[T_GO + 0.6, 330], [4, 470], [5, 640], [6, 645], [6.8, 600], [7.8, 650], [8.5, 735], [9.6, 220], [10.5, -330], [14.3, -330], [15.4, 500], [16.3, 650], [17.4, 650], [18.4, 380], [20, 80], [21.6, -260], [22.4, -260], [23.3, 500], [23.9, 790], [25.2, 790], [26, 560]],
    t,
  );
  const mimiY = kf([[0, LANE_Y[1]], [8.3, LANE_Y[1]], [9.6, LANE_Y[1] - 60], [10.5, LANE_Y[1]], [16.5, LANE_Y[1]], [17.3, LANE_Y[1] - 70], [18.4, LANE_Y[1]], [23.2, LANE_Y[1]], [23.9, 1030], [25.2, 1030], [26, 880]], t);
  const brunoX = kf(
    [[T_GO + 0.6, 330], [4, 500], [5, 540], [6, 560], [6.6, 380], [7.4, 385], [8.4, 560], [12, 640], [16, 690], [21, 730], [23, 760], [23.6, 770], [24.9, 780]],
    t,
  );
  const brunoY = LANE_Y[2];
  const biscuitX = kf([[T_GO + 0.6, 330], [4, 440], [8, 540], [12, 600], [16, 650], [21, 720], [23, 760], [24.5, 800], [26, 820]], t);

  const dive = (id: number) => ({ t0: T_GO + 0.02 * id, t1: T_GO + 0.62 });
  const standing = t < T_GO;
  const diving = t >= T_GO && t < T_GO + 0.6;

  /* the deck, then the water */
  const deckChars: [CharId, number, number][] = [["bunny", 0, 0], ["cat", 1, 1], ["bear", 2, 2], ["dog", 3, 3]];
  const Comp: Record<CharId, React.FC<Pose>> = { bunny: Bunny, cat: Cat, bear: Bear, dog: Dog };
  const hopPhase = Math.abs(Math.sin(Math.PI * t * 1.6));
  const standPose: Pose = { eyes: "happy", mouth: "open", armL: [-52, -72], armR: [52, -72], squash: 1 + 0.04 * hopPhase };

  const swimmerAt = (id: CharId, lane: number, x: number, y: number, extra: Partial<React.ComponentProps<typeof Swimmer>> = {}) => (
    <Swimmer key={id} id={id} x={x} y={y} t={t} phase={lane * 1.7} {...extra} />
  );

  const inWater = t >= T_GO + 0.6;
  const pile = t >= 23.55 && t < 25.2;
  const launched = t >= 25.0;
  const launchK = clamp01((t - 25.0) / 0.9);
  const landed = t >= 25.9;
  const finishDeckX = FIN - cam + 130;

  /* Mimi's reach for Bruno (4.9 - 6.6 s), Poppy's chomp (8.0 - 8.7 s) */
  const reach = ramp(t, 4.9, 5.4) * (1 - ramp(t, 6.2, 6.7));
  const chompK = ramp(t, 8.0, 8.3) * (1 - ramp(t, 8.55, 8.9));
  const sharkOn = t >= 7.2 && t < 10.6;
  const mimiFlung = t >= 8.5 && t < 10.6;
  const mimiBack = t >= 15.3 && t < 17.8;

  return (
    <AbsoluteFill style={{ backgroundColor: "#a8dcf8" }}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <Pool cam={cam} t={t} />
        {/* the swimmers, back to front: lane 1 to lane 4, with whoever is in the air on top */}
        {inWater && t < 25.2 ? (
          <g>
            {!pile ? (
              <g>
            {/* Mimi's long reach over the rope, to Bruno's head */}
            {reach > 0.02 ? (
              <path
                d={`M ${mimiX} ${mimiY + 20} Q ${(mimiX + brunoX) / 2 + 30} ${(mimiY + brunoY) / 2} ${lerp(mimiX, brunoX + 30, reach)} ${lerp(mimiY, brunoY - 44, reach)}`}
                stroke={SKIN.cat.fill}
                strokeWidth={34}
                strokeLinecap="round"
                fill="none"
              />
            ) : null}
            {swimmerAt("bunny", 0, poppyX, poppyY, { fin: sharkOn, bite: chompK, face: sharkOn ? "angry" : t >= 11 && t < 14.4 ? "dizzy" : "happy", stroke: 1 })}
            {swimmerAt("cat", 1, mimiX, mimiY, {
              face: mimiFlung ? "shock" : reach > 0.2 ? "angry" : mimiBack ? "angry" : "happy",
              rot: mimiFlung ? (t - 8.5) * 540 : 0,
              scale: mimiFlung ? 1 - 0.2 * ramp(t, 8.6, 9.6) : 1,
            })}
            {swimmerAt("bear", 2, brunoX, brunoY, { face: t >= 5.4 && t < 7.2 ? "shock" : "happy" })}
            {reach > 0.7 ? (
              <g transform={`translate(${brunoX + 60} ${brunoY - 110})`}>
                <path d="M -50 0 l 20 -30 M 0 -20 l 0 -40 M 50 0 l -20 -30" stroke="#ffffff" strokeWidth={9} strokeLinecap="round" />
              </g>
            ) : null}
              </g>
            ) : null}
            {swimmerAt("dog", 3, biscuitX, LANE_Y[3], { face: "happy" })}
          </g>
        ) : null}
        {/* the starting deck */}
        {standing || diving
          ? deckChars.map(([id, lane]) => {
              const C = Comp[id];
              const k = diving ? clamp01((t - dive(lane).t0) / (dive(lane).t1 - dive(lane).t0)) : 0;
              const x = lerp(150, 345, k);
              const y = LANE_Y[lane] + 100 - 260 * 4 * k * (1 - k) - (standing ? hopPhase * 40 : 0);
              return (
                <g key={id} transform={`translate(${x} ${y}) scale(0.9)`}>
                  <C {...(diving ? { ...standPose, armL: [-60, -90], armR: [60, -90], squash: 1.1 } : standPose)} />
                </g>
              );
            })
          : null}
        {/* the splash as they hit the water */}
        {diving && t > T_GO + 0.42
          ? [0, 1, 2, 3].map((l) => (
              <g key={l} opacity={1 - clamp01((t - T_GO - 0.42) / 0.5)}>
                <circle cx={345} cy={LANE_Y[l]} r={40 + (t - T_GO - 0.42) * 260} fill="none" stroke="#ffffff" strokeWidth={9} />
              </g>
            ))
          : null}
        <Pileup t={t} cx={780} cy={1000} />
        {/* Bruno, launched onto the deck */}
        {launched ? (
          <g transform={`translate(${lerp(780, finishDeckX, smooth(launchK))} ${lerp(1050, LANE_Y[2] + 120, launchK) - 440 * 4 * launchK * (1 - launchK)}) scale(1) `}>
            <g transform={`scale(${landed ? 1.0 : 0.9})`}>
              {landed ? (
                <g transform={`scale(1.15)`}>
                  <Bear eyes="sparkle" mouth="grin" armL={[-70, -100]} armR={[70, -100]} squash={1 + 0.05 * Math.exp(-(t - 25.9) * 5) * Math.sin((t - 25.9) * 20)} />
                </g>
              ) : (
                <g transform={`rotate(${launchK * 360}) scale(1.1)`}>
                  <Bear eyes="shock" mouth="o" armL={[-60, -70]} armR={[60, -70]} />
                </g>
              )}
            </g>
          </g>
        ) : null}
        {/* the rest of the pool, cheering */}
        {t >= 25.2 ? (
          <g>
            <Swimmer id="bunny" x={640} y={640} t={t} face="cheer" cheer scale={0.9} stroke={0} />
            <Swimmer id="cat" x={600} y={900} t={t} face="cheer" cheer scale={0.9} stroke={0} phase={1} />
            <Swimmer id="dog" x={820} y={1500} t={t} face="cheer" cheer scale={0.95} stroke={0} phase={2} />
          </g>
        ) : null}
        {/* the crown */}
        {landed ? (
          <g transform={`translate(${finishDeckX} ${LANE_Y[2] + 120 - 252 * 1.15 - 70 - (1 - backOut((t - 25.9) / 0.4)) * 300})`}>
            <path d="M -52 20 L -60 -34 L -26 -6 L 0 -46 L 26 -6 L 60 -34 L 52 20 Z" fill="#ffcf3a" stroke="#a87a10" strokeWidth={7} strokeLinejoin="round" />
            {[-60, 0, 60].map((x) => (
              <circle key={x} cx={x} cy={x === 0 ? -48 : -36} r={8} fill="#ff6b81" stroke="#a87a10" strokeWidth={3} />
            ))}
          </g>
        ) : null}
        <Confetti t={t} />
      </svg>
      <Headline text="choose your champion!" from={0} until={T_GO * FPS + 6} y={78} size={68} />
      <Countdown marks={[[0, "3"], [20, "2"], [40, "1"], [60, "GO!"]]} end={T_GO * FPS + 16} gap={2} y={960} size={260} />
      <Payoff text="WINNER" from={Math.round(26.0 * FPS)} y={520} size={150} emoji="👑" />
    </AbsoluteFill>
  );
};
