import React from "react";
import { AbsoluteFill, Audio, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { H, PANEL_TOP, W } from "../minecraft/beats";
import { ease, FaceKind, lerpPose, limb, POSE, pose, walkPose } from "../minecraft/figure";
import { loadMinecraftFonts } from "../minecraft/fonts";
import { Pebblo, PEBBLO_TINT } from "../minecraft/pebblo";
import { Item, Pixels, Puff } from "../minecraft/pixels";
import { CaveWide, LavaLake, Overworld, OverworldProps, Streaks } from "../minecraft/worlds";
import { cave as C, lava as L } from "../minecraft/palette";

/**
 * "Minecrafters who dig straight down:" — 14 seconds.
 *
 * Pebblo mines a hole at his feet, the shaft scrolls past coal, iron and
 * gold, a diamond glints, a warm glow comes up from below, the block cracks,
 * lava. Respawn on the grass, deadpan, and he starts digging down again.
 */

export const DIG_FRAMES = 420;
export const DIG_CAPTION = ["Minecrafters who dig", "straight down:"];

/** cuts */
const SHOT = { cave: [0, 90], shaft: [90, 270], lava: [270, 345], grass: [345, 420] } as const;
const EV = { swing: 12, sink: [30, 50, 70], diamond: 200, glow: 236, notice: 248, crack: 258, splash: 284, sunk: 322, respawn: 350, meh: 368, pickOut: 385, digAgain: 400 };

const pickIn = (R: readonly [number, number], up: boolean) => (
  <Item name="pickaxe" x={R[0] + (up ? 50 : 40)} y={R[1] - (up ? 40 : 10)} px={9} rotate={up ? -10 : 70} />
);

/** the pickaxe swing: up for 5 frames, down for 5, hold 2 */
const swingPose = (f: number, period = EV.swing) => {
  const t = (f % period) / period;
  const up = t < 0.4 ? t / 0.4 : t < 0.8 ? 1 - (t - 0.4) / 0.4 : 0;
  const raised = pose({ armR: limb(80, -20, 40, -120), armL: limb(-70, 60, -80, 120) });
  const down = pose({ armR: limb(70, 60, 60, 120), armL: limb(-70, 60, -80, 120) });
  return { pose: lerpPose(down, raised, up), up: up > 0.5, hit: t >= 0.8 && t < 0.87 };
};

/* ---------------------------------------------------------------- */

const CaveShot: React.FC = () => {
  const f = useCurrentFrame();
  const sunk = EV.sink.filter((s) => f >= s).length;
  const y = 1130 + sunk * 90;
  const sw = swingPose(f);
  const holeH = sunk * 90 + (f > EV.sink[0] - 8 ? 30 : 0);
  const face: FaceKind = f < 24 ? "sly" : "scheming";
  return (
    <g>
      <CaveWide />
      {holeH > 0 && <rect x={560} y={1200} width={200} height={holeH + 40} fill="#1c1c1c" />}
      {holeH > 0 && <path d={`M560,1200 v${holeH + 40} h200 v${-(holeH + 40)}`} fill="none" stroke="#000" strokeWidth={12} strokeLinejoin="round" />}
      <g clipPath="url(#digFloor)">
        <Pebblo x={660} y={y} pose={sw.pose} face={face} look={[0, 6]} hands={({ R }) => pickIn(R, sw.up)} />
      </g>
      {sw.hit && (
        <g fill="#8a8a8a">
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={620 + i * 34 + random(`c${f}${i}`) * 20} y={y + 150 - random(`d${f}${i}`) * 60} width={14} height={14} />
          ))}
        </g>
      )}
      <clipPath id="digFloor">
        <rect x={0} y={PANEL_TOP} width={W} height={1200 - PANEL_TOP + 40 + holeH} />
      </clipPath>
    </g>
  );
};

/* ---------------------------------------------------------------- */

type Ore = { y: number; side: "L" | "R"; kind: "coal" | "iron" | "gold" | "diamond" };
const ORES: Ore[] = [
  { y: 900, side: "L", kind: "coal" },
  { y: 1500, side: "R", kind: "coal" },
  { y: 2300, side: "L", kind: "iron" },
  { y: 2900, side: "R", kind: "iron" },
  { y: 3700, side: "L", kind: "gold" },
  { y: 4500, side: "R", kind: "diamond" },
];
const ORE_COL = { coal: ["#1b1b1b", "#2c2c2c"], iron: ["#d8b79a", "#c19a78"], gold: ["#f2c73a", "#c99a1a"], diamond: ["#5fe6e0", "#2fb8c4"] };

const OreBlock: React.FC<{ x: number; y: number; kind: Ore["kind"] }> = ({ x, y, kind }) => (
  <g transform={`translate(${x} ${y})`}>
    {[[20, 24], [70, 40], [118, 20], [40, 84], [96, 92], [140, 70], [60, 130], [120, 140]].map(([ox, oy], i) => (
      <rect key={i} x={ox} y={oy} width={22} height={16} fill={ORE_COL[kind][i % 2]} />
    ))}
  </g>
);

const ShaftShot: React.FC = () => {
  const f = useCurrentFrame();
  // depth in pixels: constant descent, slowing when the diamond passes
  const speed = 26;
  const depth = f * speed;
  const scroll = -(depth % 180);
  const sw = swingPose(f);
  const glow = interpolate(f, [EV.glow - 90, EV.crack - 90 + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const abs = f + SHOT.shaft[0];
  const diamondNear = Math.abs(ORES[5].y - depth - 1250) < 400;
  const face: FaceKind = abs >= EV.crack ? "shocked" : abs >= EV.notice ? "worried" : diamondNear ? "joy" : "smile";
  const look: readonly [number, number] = abs >= EV.notice ? [0, 10] : diamondNear ? [-10, 0] : [0, 4];
  const crack = abs >= EV.crack;
  return (
    <g>
      <defs>
        <linearGradient id="digGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff8a1e" stopOpacity={0} />
          <stop offset="100%" stopColor="#ff9a2a" stopOpacity={0.95} />
        </linearGradient>
      </defs>
      <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill={C.light} />
      {/* block rows on the walls, scrolling up */}
      <g stroke="#000" strokeWidth={10} strokeLinejoin="round" fill="none">
        {Array.from({ length: 12 }, (_, i) => {
          const yy = PANEL_TOP - 200 + i * 180 + scroll;
          return (
            <g key={i}>
              <path d={`M0,${yy} H330 M750,${yy} H1080`} />
              <path d={`M${i % 2 ? 160 : 90},${yy} v180 M${i % 2 ? 900 : 980},${yy} v180`} opacity={0.6} />
            </g>
          );
        })}
      </g>
      <Streaks x={10} y={PANEL_TOP} w={310} h={H - PANEL_TOP} n={16} seed="shl" light={C.streakLight} dark={C.streakDark} len={80} />
      <Streaks x={760} y={PANEL_TOP} w={310} h={H - PANEL_TOP} n={16} seed="shr" light={C.streakLight} dark={C.streakDark} len={80} />
      {/* ores pass by */}
      {ORES.map((o, i) => {
        const yy = o.y - depth + 1250 - 80;
        if (yy < PANEL_TOP - 200 || yy > H) return null;
        return <OreBlock key={i} x={o.side === "L" ? 150 : 780} y={yy} kind={o.kind} />;
      })}
      {/* the shaft itself */}
      <rect x={330} y={PANEL_TOP} width={420} height={H - PANEL_TOP} fill="#2a2a2a" />
      <path d={`M330,${PANEL_TOP} V${H} M750,${PANEL_TOP} V${H}`} stroke="#000" strokeWidth={14} fill="none" />
      <Streaks x={340} y={PANEL_TOP} w={400} h={H - PANEL_TOP} n={10} seed="shaft" light="#343434" dark="#202020" len={60} />
      {/* the floor block he stands on */}
      <rect x={330} y={1310} width={420} height={H - 1310} fill={C.floor} />
      <path d="M330,1310 H750" stroke="#000" strokeWidth={12} fill="none" />
      {crack && (
        <path d="M420,1330 l40,60 l-30,50 l50,40 M560,1320 l-20,70 l40,30 l-10,60 M680,1330 l-30,50 l20,60" stroke="#000" strokeWidth={8} fill="none" strokeLinecap="round" />
      )}
      {/* lava glow from below */}
      <rect x={330} y={1310} width={420} height={H - 1310} fill="url(#digGlow)" opacity={glow} />
      <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="#ff8a1e" opacity={glow * 0.12} />
      <Pebblo
        x={540}
        y={1180 + (crack ? Math.sin(f * 2.5) * 4 : 0)}
        pose={abs >= EV.notice ? pose({ armR: limb(70, 60, 60, 120), armL: limb(-70, 60, -80, 120) }) : sw.pose}
        face={face}
        look={look}
        tint={glow > 0.4 ? PEBBLO_TINT.lava : PEBBLO_TINT.normal}
        hands={({ R }) => pickIn(R, abs < EV.notice && sw.up)}
      />
      {sw.hit && abs < EV.notice && (
        <g fill="#8a8a8a">
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={460 + i * 40 + random(`s${f}${i}`) * 20} y={1290 - random(`t${f}${i}`) * 60} width={14} height={14} />
          ))}
        </g>
      )}
    </g>
  );
};

/* ---------------------------------------------------------------- */

const LavaShot: React.FC = () => {
  const f = useCurrentFrame();
  const abs = f + SHOT.lava[0];
  const fall = ease(abs, SHOT.lava[0], EV.splash);
  const sink = ease(abs, EV.splash, EV.sunk);
  const y = interpolate(fall, [0, 1], [PANEL_TOP - 200, 1230]) + sink * 260;
  const hurt = abs >= EV.splash;
  const splash = abs >= EV.splash && abs < EV.splash + 10;
  return (
    <g>
      <LavaLake t={f} />
      <g clipPath="url(#lavaLine)">
        <Pebblo
          x={540}
          y={y}
          scale={1.3}
          pose={hurt ? POSE.spread : POSE.up}
          face={hurt ? "hurt" : "scream"}
          tint={hurt ? PEBBLO_TINT.hurt : PEBBLO_TINT.lava}
          tilt={hurt ? 0 : Math.sin(f) * 4}
        />
      </g>
      <clipPath id="lavaLine">
        <rect x={0} y={PANEL_TOP} width={W} height={1330 - PANEL_TOP} />
      </clipPath>
      {splash &&
        [[380, 1300, 36], [700, 1290, 40], [540, 1250, 50], [460, 1320, 26], [640, 1330, 30]].map(([x, yy, r], i) => {
          const t = (abs - EV.splash) / 10;
          return <ellipse key={i} cx={x} cy={yy - t * 160 - i * 10} rx={r * (1 - t * 0.5)} ry={r * 0.6} fill={L.blobLight} />;
        })}
      {hurt && (
        <>
          <Item name="pickaxe" x={420 + Math.sin(f / 4) * 6} y={1310 + Math.sin(f / 3) * 4} px={9} rotate={40} opacity={1 - sink} />
          <Pixels rows={["..DD..", ".DddD.", "DddddD", ".DddD.", "..DD.."]} colors={{ D: "#2fb8c4", d: "#9ff3ee" }} px={11} x={650 + Math.sin(f / 5) * 6} y={1300} opacity={1 - sink} />
        </>
      )}
      {abs >= EV.sunk && [0, 1, 2].map((i) => <Puff key={i} x={480 + i * 60} y={1290 - (abs - EV.sunk) * 6 - i * 20} r={18} opacity={Math.max(0, 1 - (abs - EV.sunk) / 20)} />)}
    </g>
  );
};

/* ---------------------------------------------------------------- */

const GrassShot: React.FC = () => {
  const f = useCurrentFrame();
  const abs = f + SHOT.grass[0];
  const pop = interpolate(abs, [EV.respawn, EV.respawn + 3], [0.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const face: FaceKind = abs < EV.meh ? "worried" : abs < EV.digAgain ? "meh" : "plain";
  const sw = swingPose(abs - EV.digAgain, 14);
  const p = abs < EV.pickOut ? POSE.spread : abs < EV.digAgain ? lerpPose(POSE.spread, pose({ armR: limb(80, -20, 40, -120) }), ease(abs, EV.pickOut, EV.pickOut + 6)) : sw.pose;
  return (
    <g>
      <Overworld />
      <OverworldProps />
      {abs >= EV.respawn && (
        <Pebblo x={540} y={1240} scale={1.5 * pop} pose={p} face={face} look={abs < EV.meh ? [0, 0] : [0, 8]} hands={({ R }) => (abs >= EV.pickOut ? pickIn(R, abs < EV.digAgain || sw.up) : null)} />
      )}
      {abs >= EV.digAgain && sw.hit && (
        <g fill="#5a4a34">
          {[0, 1, 2].map((i) => (
            <rect key={i} x={500 + i * 40 + random(`g${abs}${i}`) * 20} y={1360 - random(`h${abs}${i}`) * 50} width={14} height={14} />
          ))}
        </g>
      )}
    </g>
  );
};

/* ---------------------------------------------------------------- */

const Caption: React.FC = () => (
  <div style={{ position: "absolute", left: 0, top: 0, width: W, height: PANEL_TOP, background: "#ffffff" }}>
    <div style={{ position: "absolute", left: 80, top: 111, fontFamily: "Selawik, 'Segoe UI', sans-serif", fontSize: 88, lineHeight: "118px", color: "#000", whiteSpace: "pre" }}>
      {DIG_CAPTION.join("\n")}
    </div>
  </div>
);

export const DigShort: React.FC<{ audio?: string | null }> = ({ audio = null }) => {
  loadMinecraftFonts();
  const shots: { name: keyof typeof SHOT; el: React.ReactNode }[] = [
    { name: "cave", el: <CaveShot /> },
    { name: "shaft", el: <ShaftShot /> },
    { name: "lava", el: <LavaShot /> },
    { name: "grass", el: <GrassShot /> },
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff" }}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      {shots.map(({ name, el }) => (
        <Sequence key={name} from={SHOT[name][0]} durationInFrames={SHOT[name][1] - SHOT[name][0]} name={name}>
          <AbsoluteFill>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
              <defs>
                <clipPath id="digPanel">
                  <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} />
                </clipPath>
              </defs>
              <g clipPath="url(#digPanel)">{el}</g>
            </svg>
          </AbsoluteFill>
        </Sequence>
      ))}
      <Caption />
    </AbsoluteFill>
  );
};

/** 9:16 thumbnail: the diamond moment, glow rising. */
export const DigThumb: React.FC = () => {
  loadMinecraftFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="digPanelT">
            <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} />
          </clipPath>
          <linearGradient id="digGlowT" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff8a1e" stopOpacity={0} />
            <stop offset="100%" stopColor="#ff9a2a" stopOpacity={0.95} />
          </linearGradient>
        </defs>
        <g clipPath="url(#digPanelT)">
          <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill={C.light} />
          <g stroke="#000" strokeWidth={10} fill="none">
            {Array.from({ length: 10 }, (_, i) => (
              <path key={i} d={`M0,${PANEL_TOP + i * 180} H330 M750,${PANEL_TOP + i * 180} H1080`} />
            ))}
          </g>
          <OreBlock x={150} y={760} kind="diamond" />
          <OreBlock x={780} y={1500} kind="gold" />
          <rect x={330} y={PANEL_TOP} width={420} height={H - PANEL_TOP} fill="#2a2a2a" />
          <path d={`M330,${PANEL_TOP} V${H} M750,${PANEL_TOP} V${H}`} stroke="#000" strokeWidth={14} fill="none" />
          <rect x={330} y={1310} width={420} height={H - 1310} fill={C.floor} />
          <path d="M330,1310 H750" stroke="#000" strokeWidth={12} fill="none" />
          <path d="M420,1330 l40,60 l-30,50 l50,40 M560,1320 l-20,70 l40,30 l-10,60" stroke="#000" strokeWidth={8} fill="none" strokeLinecap="round" />
          <rect x={330} y={1310} width={420} height={H - 1310} fill="url(#digGlowT)" />
          <Pebblo x={540} y={1180} scale={1.15} pose={pose({ armR: limb(70, 60, 60, 120), armL: limb(-70, 60, -80, 120) })} face="worried" look={[0, 10]} tint={PEBBLO_TINT.lava} hands={({ R }) => pickIn(R, false)} />
        </g>
      </svg>
      <Caption />
    </AbsoluteFill>
  );
};
