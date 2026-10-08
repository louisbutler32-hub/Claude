import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import {
  Actor, Backdrop, BoldCaption, Brand, Bubble, Calendar, Cam, Chip, Heart, Mark, Mood, Pop, Punch, Shot, ShotPlayer, Timing,
  bell, cue, ease, hitsFromScript, lerp, loadPinsFonts, useT,
} from "../engine";
import { HeadLook, PhotoPerson } from "../people";
import { BODY } from "../bodies";
import { ASSETS, BG } from "./assets";
import TIMING from "./timing.json";
import SCRIPT from "./script.json";

/**
 * "3 animals that went to space before us": the fruit flies on the 1947 V-2
 * from White Sands, Laika on Sputnik 2 (1957), and Ham the chimp on
 * Mercury-Redstone 2 (1961). Hook: ding, riser under a cut-per-beat montage
 * peaking as "us." ends, then Ham floating in orbit going "FIRST!" as the
 * human astronaut drifts in late. The last line ("the first American followed
 * him") ends on the same pair, so it loops into the hook.
 */

const T = TIMING as Timing;
export const SPACE_FPS = 30;
export const SPACE_FRAMES = Math.ceil(T.duration * SPACE_FPS);

const A = ASSETS;
const c = (id: string, i = 0) => cue(T, id, i);
const OPEN: [number, Mood][] = [[-99, "open"]];
const PAYOFF = (T.lines[0] as unknown as { hold_at: number }).hold_at;

const HITS = [...hitsFromScript(T, SCRIPT as never, [["hook", 0], ["hook", 3], ["hook", 5], ["hook", 7], ["fly1", 0], ["laika1", 0], ["ham1", 0]],
  ["whoosh", "riser"]), PAYOFF, PAYOFF + 0.4].sort((a, b) => a - b);

const MAN: HeadLook = { hair: "short", skin: "#e8b694", hairColor: "#5a3a1e", beard: "stubble" };
const SCI: HeadLook = { hair: "short", skin: "#f0c9a8", hairColor: "#2b2b2b" };

/** rocket exhaust, flickering; drawn downward from the origin */
const Flame: React.FC<{ t: number; w?: number }> = ({ t, w = 150 }) => {
  const f = 1 + 0.18 * Math.sin(t * 47) + 0.08 * Math.sin(t * 83);
  return (
    <svg viewBox="-50 0 100 220" style={{ position: "absolute", left: -w / 2, top: -6, width: w, height: w * 2.2, overflow: "visible", transform: `scaleY(${f})`, transformOrigin: "50% 0%" }}>
      <path d="M -42 0 Q -34 110 0 215 Q 34 110 42 0 Z" fill="#ff6a14" opacity={0.92} />
      <path d="M -26 0 Q -18 80 0 150 Q 18 80 26 0 Z" fill="#ffd23a" />
      <path d="M -12 0 Q -8 40 0 80 Q 8 40 12 0 Z" fill="#fff8d0" />
    </svg>
  );
};

/** a puff of launch smoke that grows from the origin */
const Smoke: React.FC<{ k: number }> = ({ k }) => (
  <>
    {[-1, -0.4, 0.3, 1].map((d, i) => (
      <div key={i} style={{ position: "absolute", left: d * 220 * k - 130 * k, top: -90 * k - (i % 2) * 40 * k, width: 260 * k, height: 180 * k, borderRadius: "50%",
        background: "radial-gradient(circle at 40% 40%, #ffffff, #d9d4cc 70%)", opacity: 0.9 * Math.min(1, k * 3) }} />
    ))}
  </>
);

/** the V-2, standing then lifting off; (x, y) is where its base sits on the pad */
const Rocket: React.FC<{ t: number; x: number; y: number; w: number; lift: number; burn: boolean; smoke?: number; rider?: boolean }> = ({ t, x, y, w, lift, burn, smoke = 0, rider }) => {
  const h = (w * A.rocket.h) / A.rocket.w;
  const shake = burn ? Math.sin(t * 90) * 3 : 0;
  return (
    <>
      {smoke > 0 && <div style={{ position: "absolute", left: x, top: y + 30 }}><Smoke k={smoke} /></div>}
      {burn && <div style={{ position: "absolute", left: x + shake, top: y - lift - h * 0.02 }}><Flame t={t} w={w * 0.62} /></div>}
      <Actor a={A.rocket} t={t} x={x + shake} y={y - lift - h / 2} w={w} bob={0} />
      {rider && <Actor a={A.fly} t={t} x={x + shake + w * 0.45} y={y - lift - h * 0.9} w={w * 0.75} bob={3} bobRate={3} moods={OPEN} look={[-0.5, 0.3]} />}
    </>
  );
};

/** a little parachute canopy over the origin */
const Chute: React.FC<{ w?: number }> = ({ w = 300 }) => (
  <svg viewBox="-60 -60 120 110" style={{ position: "absolute", left: -w / 2, top: -w * 0.5, width: w, height: w * 0.92, overflow: "visible" }}>
    <path d="M -55 0 Q 0 -75 55 0 Q 37 -10 18 0 Q 0 -10 -18 0 Q -37 -10 -55 0 Z" fill="#ff4d4d" stroke="#111" strokeWidth={4} />
    <path d="M -18 0 Q 0 -10 18 0 Q 9 -40 0 -52 Q -9 -40 -18 0 Z" fill="#fff" stroke="#111" strokeWidth={3} />
    {[-55, -18, 18, 55].map((sx) => <line key={sx} x1={sx} y1={0} x2={0} y2={48} stroke="#111" strokeWidth={2.5} />)}
  </svg>
);

/** a gold "#1" medal */
const Medal: React.FC<{ size?: number }> = ({ size = 230 }) => (
  <svg viewBox="-50 -80 100 130" style={{ position: "absolute", left: -size / 2, top: -size * 0.8, width: size, height: size * 1.3, overflow: "visible", filter: "drop-shadow(0 8px 4px rgba(0,0,0,0.4))" }}>
    <path d="M -28 -80 L -8 -20 L 8 -20 L 28 -80 L 10 -80 L 0 -48 L -10 -80 Z" fill="#2d6cdf" stroke="#111" strokeWidth={3} />
    <circle r={38} fill="#ffc21a" stroke="#111" strokeWidth={5} />
    <circle r={28} fill="none" stroke="#c98a00" strokeWidth={4} />
    <text y={15} textAnchor="middle" fontFamily="Anton" fontSize={44} fill="#111">1</text>
  </svg>
);

/** a round porthole showing the top of an actor (Laika in Sputnik) */
const Porthole: React.FC<{ t: number; size?: number; children: React.ReactNode }> = ({ size = 360, children }) => (
  <div style={{ position: "absolute", left: -size / 2, top: -size / 2, width: size, height: size, borderRadius: "50%", overflow: "hidden",
    border: "16px solid #b9c0c8", boxShadow: "0 0 0 8px #111, 0 14px 28px rgba(0,0,0,0.5)", background: "#1d2a3a" }}>
    <div style={{ position: "absolute", left: size / 2, top: size / 2 }}>{children}</div>
  </div>
);

/** Ham's console: three lights that flash in turn and a lever he pulls */
const Panel: React.FC<{ t: number; pulls: number[]; flash: [number, number] }> = ({ t, pulls, flash }) => {
  const pulled = pulls.some((p) => bell(t, p, p + 0.45) > 0.05);
  const on = t > flash[0] && t < flash[1] + 0.8 ? Math.floor((t - flash[0]) * 6) % 3 : -1;
  return (
    <div style={{ position: "absolute", left: -260, top: -170, width: 520, height: 340, background: "#8d969e", border: "8px solid #222", borderRadius: 24, boxShadow: "0 16px 30px rgba(0,0,0,0.45)" }}>
      {["#ff3b3b", "#ffd400", "#39d353"].map((col, i) => (
        <div key={i} style={{ position: "absolute", left: 50 + i * 110, top: 50, width: 80, height: 80, borderRadius: "50%", border: "6px solid #222",
          background: on === i ? col : "#3a3f45", boxShadow: on === i ? `0 0 40px 12px ${col}` : "none" }} />
      ))}
      <div style={{ position: "absolute", left: 400, top: 40, width: 70, height: 260, background: "#3a3f45", borderRadius: 35, border: "6px solid #222" }} />
      <div style={{ position: "absolute", left: 424, top: pulled ? 200 : 70, width: 22, height: 90, background: "#d9dde1", border: "4px solid #222", borderRadius: 10 }} />
      <div style={{ position: "absolute", left: 405, top: pulled ? 170 : 40, width: 60, height: 60, borderRadius: "50%", background: "#ff3b3b", border: "6px solid #222" }} />
      <div style={{ position: "absolute", left: 50, top: 190, width: 300, height: 100, background: "#2b3136", borderRadius: 12, border: "5px solid #222" }}>
        {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{ position: "absolute", left: 18 + i * 56, top: 30, width: 34, height: 34, borderRadius: 8, background: "#5c656d" }} />)}
      </div>
    </div>
  );
};

/** rings of white water where something hit the sea */
const Splash: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  if (t < at) return null;
  const k = ease(t, at, at + 0.9);
  return (
    <>
      {[0, 0.25].map((d, i) => {
        const kk = Math.max(0, ease(t, at + d, at + d + 0.9));
        return <div key={i} style={{ position: "absolute", left: -380 * kk, top: -90 * kk, width: 760 * kk, height: 180 * kk, borderRadius: "50%", border: `${14 - i * 4}px solid rgba(255,255,255,${0.9 * (1 - kk)})` }} />;
      })}
      {[-3, -2, -1, 0, 1, 2, 3].map((i) => (
        <div key={i} style={{ position: "absolute", left: i * 60 - 22, top: -40 - Math.sin(k * Math.PI) * (260 - Math.abs(i) * 40), width: 44, height: 44, borderRadius: "50%", background: "#fff", opacity: 1 - k }} />
      ))}
    </>
  );
};

/* ------------------------------------------------------------ the shots */

const shots: Shot[] = [
  /* HOOK under the riser: a fruit fly in front of the Earth… */
  {
    at: 0,
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.3 - 0.12 * ease(u, 0, 0.9)}>
        <Backdrop src={BG.space} t={t} />
        <Actor a={A.fly} t={t} x={lerp(420, 600, ease(u, 0, 0.95))} y={950} w={820} rot={Math.sin(t * 9) * 4} bob={16} bobRate={3} moods={OPEN} look={[-0.6, 0.2]} />
      </Cam>
    ),
  },
  /* …a dog in Sputnik's porthole… */
  {
    at: c("hook", 3),
    transition: "whip",
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.15 + 0.1 * ease(u, 0, 0.5)}>
        <Backdrop src={BG.space} t={t} flip />
        <Actor a={A.sputnik} t={t} x={lerp(860, 700, ease(u, 0, 0.6))} y={620} w={420} rot={t * 20} bob={0} />
        <div style={{ position: "absolute", left: 540, top: 1150 }}>
          <Porthole t={t} size={560}><Actor a={A.laika} t={t} x={0} y={260} w={760} bob={4} moods={[[-99, "wide"]]} look={[0.2, -0.3]} /></Porthole>
        </div>
      </Cam>
    ),
  },
  /* …a chimp in a spacesuit… */
  {
    at: c("hook", 5),
    transition: "zoom",
    reframes: false,
    render: ({ t }) => (
      <Cam t={t} z={1.15}>
        <Backdrop src={BG.space} t={t} />
        <Actor a={A.ham} t={t} x={540} y={1000} w={720} rot={Math.sin(t * 3) * 8} bob={18} bobRate={1.6} moods={OPEN} look={[0, 0.1]} />
      </Cam>
    ),
  },
  /* …"us.": a human on the ground staring up as the riser climbs */
  {
    at: c("hook", 7),
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.1 + 0.3 * ease(u, 0, 0.6)} y={760} shake={10 * ease(u, 0.1, 0.6)}>
        <Backdrop src={BG.desert} t={t} />
        <PhotoPerson id="man" t={t} poses={[[-99, BODY["man-shock"]]]} x={540} y={1950} h={1300} look={MAN} faces={[[-99, "shocked"]]} gaze={[0, -0.6]} />
      </Cam>
    ),
  },
  /* PAYOFF in the held beat: Ham got there first. The human floats in late. */
  {
    at: PAYOFF,
    reframes: false,
    render: ({ t }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.space} t={t} />
        <Actor a={A.astronaut} t={t} x={260} y={1180} w={420} rot={-12 + Math.sin(t * 2) * 4} enter={PAYOFF + 0.15} enterFrom={[-600, 200]} bob={10} bobRate={1} />
        <Actor a={A.ham} t={t} x={760} y={960} w={560} rot={Math.sin(t * 2.4) * 6} bob={14} bobRate={1.4} moods={OPEN} look={[-0.7, 0.2]} />
        <Pop t={t} at={PAYOFF + 0.1} x={780} y={470}><Bubble text="FIRST!" size={92} tail={[-20, 150]} /></Pop>
        <Pop t={t} at={PAYOFF + 0.7} x={250} y={760}><Mark text="?" size={140} /></Pop>
      </Cam>
    ),
  },

  /* #1 FRUIT FLIES */
  {
    at: c("fly1", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.04 + 0.08 * ease(u, 0, 1.6)}>
        <Backdrop src={BG.desert} t={t} />
        <Actor a={A.fly} t={t} x={540} y={1050} w={700} enter={c("fly1", 1)} enterFrom={[800, -300]} rot={Math.sin(t * 9) * 3} bob={14} bobRate={3} moods={OPEN} look={[-0.5, 0.2]} />
        {[0, 1].map((i) => (
          <Actor key={i} a={A.fly} t={t} x={540 + Math.cos(t * 4 + i * 3) * 360} y={1180 + Math.sin(t * 5 + i * 3) * 260} w={170} flip={Math.sin(t * 4 + i * 3) > 0} bob={0} moods={OPEN} />
        ))}
        <Pop t={t} at={c("fly1", 1) + 0.05} x={540} y={420}><Chip text="FRUIT FLIES" size={70} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "In 1947," */
  {
    at: c("fly1", 3),
    render: ({ t }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.desert} t={t} flip />
        <Actor a={A.fly} t={t} x={540} y={1300} w={520} rot={Math.sin(t * 9) * 3} bob={10} bobRate={3} moods={OPEN} look={[0, -0.6]} />
        <Pop t={t} at={c("fly1", 4)} x={540} y={720}><Calendar n={1947} label="YEAR" size={300} /></Pop>
      </Cam>
    ),
  },
  /* "scientists launched them on a rocket over New Mexico." */
  {
    at: c("fly1", 5),
    transition: "zoom",
    reframes: false,
    render: ({ t }) => {
      const go = ease(t, c("fly1", 7), c("fly1", 13) + 0.8);
      return (
        <Cam t={t} z={1.04} shake={8 * ease(t, c("fly1", 7), c("fly1", 8))}>
          <Backdrop src={BG.desert} t={t} />
          <Rocket t={t} x={780} y={1640} w={250} lift={1700 * go * go} burn={t > c("fly1", 6)} smoke={ease(t, c("fly1", 6), c("fly1", 9))} rider />
          <Pop t={t} at={c("fly1", 12)} x={540} y={420}><Chip text="NEW MEXICO" size={66} /></Pop>
        </Cam>
      );
    },
  },
  /* "They flew more than 100 kilometers up," */
  {
    at: c("fly2", 0),
    transition: "whip",
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={BG.space} t={t} />
        <Rocket t={t} x={lerp(700, 760, u / 2)} y={lerp(2300, 1250, ease(u, 0, 1.3))} w={200} lift={0} burn rider />
        <Pop t={t} at={c("fly2", 1)} x={290} y={640}><Calendar n={Math.round(lerp(0, 100, ease(t, c("fly2", 1), c("fly2", 5))))} label="KM UP" size={300} /></Pop>
      </Cam>
    ),
  },
  /* "and came back alive." */
  {
    at: c("fly2", 7),
    render: ({ t }) => {
      const down = ease(t, c("fly2", 7), c("fly2", 10));
      return (
        <Cam t={t} z={1.06}>
          <Backdrop src={BG.desert} t={t} flip />
          <div style={{ position: "absolute", left: 540 + Math.sin(t * 3) * 30, top: lerp(500, 980, down) }}><Chute w={360} /></div>
          <Actor a={A.fly} t={t} x={540 + Math.sin(t * 3) * 30} y={lerp(720, 1200, down)} w={420} rot={Math.sin(t * 3) * 6} bob={0} moods={[[-99, "wide"], [c("fly2", 10), "open"]]} look={[0, 0.5]} />
          <Pop t={t} at={c("fly2", 10)} x={540} y={430}><Chip text="ALIVE!" size={84} bg="#39d353" /></Pop>
        </Cam>
      );
    },
  },
  /* "The first animals ever in space." */
  {
    at: c("fly2", 11),
    transition: "zoom",
    render: ({ t }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.space} t={t} flip />
        <Actor a={A.fly} t={t} x={540} y={1050} w={720} rot={Math.sin(t * 9) * 3} bob={14} bobRate={2} moods={OPEN} look={[-0.3, -0.2]} />
        <Pop t={t} at={c("fly2", 12)} x={820} y={1180}><Medal size={250} /></Pop>
        <Pop t={t} at={c("fly2", 14)} x={540} y={430}><Chip text="FIRST IN SPACE" size={66} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },

  /* #2 LAIKA */
  {
    at: c("laika1", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.04 + 0.08 * ease(u, 0, 1.4)}>
        <Backdrop src={BG.moscow} t={t} />
        <Actor a={A.laika} t={t} x={540} y={1250} w={600} enter={c("laika1", 1)} enterFrom={[0, 900]} bob={3} moods={OPEN} look={[0, 0.2]} />
        <Pop t={t} at={c("laika1", 1) + 0.05} x={540} y={420}><Chip text="LAIKA" size={84} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "In 1957," */
  {
    at: c("laika1", 2),
    render: ({ t }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.moscow} t={t} flip />
        <Actor a={A.laika} t={t} x={540} y={1380} w={480} bob={3} moods={OPEN} look={[0, -0.6]} />
        <Pop t={t} at={c("laika1", 3)} x={540} y={720}><Calendar n={1957} label="YEAR" size={300} /></Pop>
      </Cam>
    ),
  },
  /* "this street dog from Moscow" */
  {
    at: c("laika1", 4),
    transition: "zoom",
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.08}>
        <Backdrop src={BG.moscow} t={t} />
        <Actor a={A.laika} t={t} x={lerp(380, 700, ease(u, 0, 1.2))} y={1320 - Math.abs(Math.sin(t * 8)) * 20} w={560} bob={0} moods={OPEN} look={[0.5, 0]} />
        <Pop t={t} at={c("laika1", 5)} until={c("laika1", 8)} x={540} y={430}><Chip text="STREET DOG" size={70} /></Pop>
        <Pop t={t} at={c("laika1", 8)} x={540} y={430}><Chip text="MOSCOW" size={78} bg="#ff4d4d" color="#fff" /></Pop>
      </Cam>
    ),
  },
  /* "became the first animal to orbit the Earth." */
  {
    at: c("laika1", 9),
    transition: "whip",
    reframes: false,
    render: ({ t }) => {
      const a = (t - c("laika1", 9)) * 1.6 - 0.6;
      const sx = 540 + Math.cos(a) * 430, sy = 1050 + Math.sin(a) * 170;
      return (
        <Cam t={t} z={1.04}>
          <Backdrop src={BG.space} t={t} />
          <svg style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, overflow: "visible" }}>
            <ellipse cx={540} cy={1050} rx={430} ry={170} fill="none" stroke="#fff" strokeWidth={6} strokeDasharray="18 18" opacity={0.75} />
          </svg>
          <Actor a={A.sputnik} t={t} x={sx} y={sy} w={lerp(170, 300, (Math.sin(a) + 1) / 2)} rot={t * 30} bob={0} />
          <div style={{ position: "absolute", left: 540, top: 1640 }}>
            <Porthole t={t} size={340}><Actor a={A.laika} t={t} x={0} y={170} w={520} bob={3} moods={OPEN} look={[0, -0.4]} /></Porthole>
          </div>
          <Pop t={t} at={c("laika1", 11)} x={540} y={430}><Chip text="FIRST TO ORBIT" size={66} bg="#ffd400" /></Pop>
        </Cam>
      );
    },
  },
  /* "But there was no way to bring her back. She never came home." quiet, no gags */
  {
    at: c("laika2", 0),
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.04 + 0.1 * ease(u, 0, 2.4)}>
        <Backdrop src={BG.space} t={t} flip tone="rgba(0,10,40,0.45)" />
        <Actor a={A.sputnik} t={t} x={lerp(780, 900, u / 2.4)} y={lerp(560, 420, u / 2.4)} w={lerp(220, 120, ease(u, 0, 2.4))} rot={t * 8} bob={0} opacity={0.9} />
        <Actor a={A.laika} t={t} x={540} y={1300} w={560} bob={2} bobRate={0.6} moods={[[-99, "open"], [c("laika2", 9), "sad"]]} look={[0.4, -0.5]} />
      </Cam>
    ),
  },

  /* #3 HAM THE CHIMP */
  {
    at: c("ham1", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.04 + 0.08 * ease(u, 0, 1.4)}>
        <Backdrop src={BG.control} t={t} />
        <Actor a={A.ham} t={t} x={540} y={1250} w={660} enter={c("ham1", 1)} enterFrom={[-900, 0]} bob={3} moods={OPEN} look={[0, 0.2]} />
        <Pop t={t} at={c("ham1", 1) + 0.05} x={540} y={420}><Chip text="HAM THE CHIMP" size={70} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "In 1961," */
  {
    at: c("ham1", 4),
    render: ({ t }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.control} t={t} flip />
        <Actor a={A.ham} t={t} x={540} y={1380} w={520} bob={3} moods={OPEN} look={[0, -0.6]} />
        <Pop t={t} at={c("ham1", 5)} x={540} y={720}><Calendar n={1961} label="YEAR" size={300} /></Pop>
      </Cam>
    ),
  },
  /* "he flew into space" */
  {
    at: c("ham1", 6),
    transition: "zoom",
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.04} shake={6}>
        <Backdrop src={BG.space} t={t} />
        <div style={{ position: "absolute", left: lerp(200, 900, ease(u, 0, 0.9)), top: lerp(1700, 500, ease(u, 0, 0.9)), transform: "rotate(40deg)" }}>
          <div style={{ position: "absolute", left: 0, top: 150 }}><Flame t={t} w={150} /></div>
          <Actor a={A.capsule} t={t} x={0} y={0} w={360} rot={-35} bob={0} />
        </div>
        <div style={{ position: "absolute", left: 760, top: 1620 }}>
          <Porthole t={t} size={340}><Actor a={A.ham} t={t} x={0} y={160} w={480} bob={2} moods={[[-99, "wide"]]} look={[0.3, -0.3]} /></Porthole>
        </div>
      </Cam>
    ),
  },
  /* "and pulled levers when lights flashed," */
  {
    at: c("ham1", 10),
    render: ({ t }) => (
      <Cam t={t} z={1.06}>
        <Backdrop src={BG.control} t={t} blur={3} />
        <div style={{ position: "absolute", left: 360, top: 1000 }}><Panel t={t} pulls={[c("ham1", 11), c("ham1", 15)]} flash={[c("ham1", 14), c("ham1", 15)]} /></div>
        <Actor a={A.ham} t={t} x={820} y={1330} w={480} bob={3} moods={[[-99, "open"], [c("ham1", 14), "wide"]]} look={[-0.7, 0.2]} />
      </Cam>
    ),
  },
  /* "to prove a person could work up there." */
  {
    at: c("ham1", 16),
    transition: "whip",
    render: ({ t }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={BG.control} t={t} />
        <PhotoPerson id="sci" t={t} poses={[[-99, BODY["sci-point"]]]} x={280} y={1880} h={1150} look={SCI} faces={[[-99, "curious"], [c("ham1", 21), "happy"]]} gaze={[0.6, 0]} talk={[[c("ham1", 16), c("ham1", 23)]]} />
        <Actor a={A.ham} t={t} x={800} y={1300} w={440} bob={3} moods={OPEN} look={[-0.6, 0]} />
        <Pop t={t} at={c("ham1", 19)} x={540} y={430}><Chip text="HUMANS NEXT" size={70} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "He splashed down safe," */
  {
    at: c("ham2", 0),
    transition: "zoom",
    reframes: false,
    render: ({ t }) => {
      const hit = c("ham2", 1) + 0.05;
      const fall = ease(t, c("ham2", 0) - 0.15, hit);
      return (
        <Cam t={t} z={1.04} shake={12 * bell(t, hit, hit + 0.4)}>
          <Backdrop src={BG.ocean} t={t} />
          <div style={{ position: "absolute", left: 540, top: lerp(-300, 1060, fall) + (t > hit ? Math.sin(t * 4) * 12 : 0) }}>
            {t < hit && <div style={{ position: "absolute", left: 0, top: -360 }}><Chute w={420} /></div>}
            <Actor a={A.capsule} t={t} x={0} y={0} w={400} rot={40 + Math.sin(t * 3) * 6} bob={0} />
          </div>
          <div style={{ position: "absolute", left: 540, top: 1190 }}><Splash t={t} at={hit} /></div>
          <Pop t={t} at={c("ham2", 3)} x={540} y={430}><Chip text="SPLASHDOWN" size={70} bg="#2d9cff" color="#fff" /></Pop>
        </Cam>
      );
    },
  },
  /* "and got an apple as a reward." */
  {
    at: c("ham2", 4),
    render: ({ t }) => (
      <Cam t={t} z={1.08}>
        <Backdrop src={BG.ocean} t={t} flip />
        <Actor a={A.ham} t={t} x={540} y={1250} w={640} bob={3} moods={[[-99, "open"], [c("ham2", 7), "wide"]]} look={[0.4, 0.4]} />
        <Pop t={t} at={c("ham2", 7)} x={760} y={1450}><Actor a={A.apple} t={t} x={0} y={0} w={240} bob={0} /></Pop>
        <Pop t={t} at={c("ham2", 10)} x={760} y={780}><Heart size={140} /></Pop>
      </Cam>
    ),
  },
  /* "Three months later," */
  {
    at: c("ham3", 0),
    transition: "whip",
    render: ({ t }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.space} t={t} flip />
        <Actor a={A.ham} t={t} x={720} y={1250} w={480} rot={Math.sin(t * 2.4) * 6} bob={12} bobRate={1.2} moods={OPEN} look={[-0.6, -0.3]} />
        <Pop t={t} at={c("ham3", 1)} x={330} y={760}><Calendar n={3} label="MONTHS" size={300} /></Pop>
      </Cam>
    ),
  },
  /* "the first American followed him." the last shot: it loops to the hook */
  {
    at: c("ham3", 3),
    transition: "zoom",
    render: ({ t }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.space} t={t} />
        <Actor a={A.astronaut} t={t} x={280} y={1220} w={420} rot={-12 + Math.sin(t * 2) * 4} enter={c("ham3", 4)} enterFrom={[-600, 200]} bob={10} bobRate={1} />
        <Actor a={A.ham} t={t} x={760} y={1000} w={520} rot={Math.sin(t * 2.4) * 6} bob={14} bobRate={1.4} moods={OPEN} look={[-0.7, 0.2]} />
        <Pop t={t} at={c("ham3", 5)} x={540} y={330}><Chip text="FIRST AMERICAN" size={66} /></Pop>
        <Pop t={t} at={c("ham3", 7)} x={770} y={560}><Bubble text="FINALLY." size={78} tail={[-20, 150]} /></Pop>
      </Cam>
    ),
  },
];

/* ------------------------------------------------------------ the short */

export const SpaceShort: React.FC<{ audio?: string | null; captions?: boolean; logo?: string; brand?: string }> = ({ audio = "audio/pins-space-mix.mp3", captions = true, logo, brand }) => {
  loadPinsFonts();
  const t = useT();
  return (
    <AbsoluteFill style={{ background: "#050b1a" }}>
      <Punch t={t} hits={HITS}><ShotPlayer shots={shots} t={t} total={T.duration} /></Punch>
      <Brand logo={logo} name={brand} />
      {captions && <BoldCaption T={T} t={t} />}
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ thumbnail (9:16) */

export const SpaceThumb: React.FC = () => {
  loadPinsFonts();
  const t = 1;
  return (
    <AbsoluteFill style={{ background: "#050b1a" }}>
      <Backdrop src={BG.space} t={0} />
      <Actor a={A.ham} t={t} x={560} y={1330} w={820} rot={-6} bob={0} moods={[[-99, "wide"]]} look={[0, 0.2]} />
      <div style={{ position: "absolute", left: 50, right: 50, top: 170, textAlign: "center", fontFamily: "Anton", fontSize: 150, lineHeight: 1,
        color: "#ff7a14", WebkitTextStroke: "16px #1b0f05", paintOrder: "stroke fill", textTransform: "uppercase", filter: "drop-shadow(0 8px 2px rgba(0,0,0,0.55))" }}>
        They sent<br /><span style={{ color: "#fff" }}>what?!</span>
      </div>
    </AbsoluteFill>
  );
};
