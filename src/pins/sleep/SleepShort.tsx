import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import {
  Actor, Arrow, Backdrop, Bonk, Brand, Calendar, Cam, Chip, Clock, Current, Heart, H, Mark, Mood, Pop, Punch, RedX, Shot, ShotPlayer,
  SplitBrain, Timing, W, WordCaption, Zzz, bell, clamp01, cue, ease, hitsFromScript, lerp, loadPinsFonts, useT,
} from "../engine";
import { AboveLine, Face, HeadLook, PhotoPerson } from "../people";
import { BODY } from "../bodies";
import { ASSETS, BG, whaleAt } from "./assets";
import TIMING from "./timing.json";
import SCRIPT from "./script.json";

/**
 * "3 animals that sleep in the craziest ways": sea otters holding hands, the
 * frigatebird napping on the wing, sperm whales hanging upright in the deep.
 * Every shot keys off a word in timing.json, so rebuilding the narration
 * (scripts/build-pins-audio.py sleep) re-times the picture with it.
 */

const T = TIMING as Timing;
export const SLEEP_FPS = 30;
export const SLEEP_FRAMES = Math.ceil(T.duration * SLEEP_FPS);

const A = ASSETS;
const c = (id: string, i = 0) => cue(T, id, i);
const SLEEP: [number, Mood][] = [[-99, "closed"]];
const UP = whaleAt(90);

/** snap zooms: every SFX cue, plus the words the line leans on */
const HITS = hitsFromScript(T, SCRIPT as never, [
  ["hook", 0], ["hook", 2], ["hook", 6], ["hook", 7], ["otter1", 6], ["otter2", 3], ["otter3", 5], ["frigate1", 12], ["frigate2", 2], ["frigate3", 7],
  ["whale1", 6], ["whale1", 15], ["whale3", 4], ["whale3", 13],
]);

/** a sperm whale hanging upright, only its head out of the water, a ripple ring at the waterline */
const WhaleHead: React.FC<{ t: number; x: number; water: number; w: number; out?: number; moods: [number, Mood][]; rock?: number }> = ({ t, x, water, w, out = 0.4, moods, rock = 0 }) => {
  const cy = water - w * out + w / 2;
  const ring = (t * 0.5 + x * 0.001) % 1;
  const hh = (w * A.whale.h) / A.whale.w;
  return (
    <>
      <AboveLine y={water}>
        <Actor a={whaleAt(90 + rock)} t={t} x={x} y={cy} w={w} rot={90 + rock} bob={5} bobRate={0.35} moods={moods} />
      </AboveLine>
      <div style={{ position: "absolute", left: x - hh * 0.75 * (1 + ring), top: water - hh * 0.12 * (1 + ring), width: hh * 1.5 * (1 + ring), height: hh * 0.24 * (1 + ring),
        borderRadius: "50%", border: `${Math.max(3, w * 0.008)}px solid rgba(255,255,255,${0.75 * (1 - ring)})` }} />
      <div style={{ position: "absolute", left: x - hh * 0.6, top: water - hh * 0.08, width: hh * 1.2, height: hh * 0.16, borderRadius: "50%", border: `${Math.max(3, w * 0.01)}px solid rgba(255,255,255,0.85)` }} />
    </>
  );
};

/** the research boat, two cartoon-headed scientists standing in it (cut off at the gunwale) */
const SCI_A: HeadLook = { hair: "cap", hat: "#2f6d9a", skin: "#e2b08a", hairColor: "#3a2414", beard: "full" };
const SCI_B: HeadLook = { hair: "ponytail", skin: "#c68a63", hairColor: "#2a1a10", glasses: true };
const ResearchBoat: React.FC<{ t: number; x: number; y: number; w: number; rot?: number; facesA: [number, Face][]; facesB: [number, Face][]; talkA?: [number, number][]; gaze?: [number, number] }> = ({ t, x, y, w, rot = 0, facesA, facesB, talkA = [], gaze = [0.6, 0.2] }) => {
  const h = (w * A.boat.h) / A.boat.w;
  const top = y - h / 2;
  const bob = Math.sin(t * 1.1 * Math.PI) * 6;
  return (
    <div style={{ position: "absolute", left: 0, top: bob, width: 0, height: 0, transform: `rotate(${rot}deg)`, transformOrigin: `${x}px ${y}px` }}>
      <AboveLine y={top + h * 0.5}>
        <PhotoPerson id="sciB" t={t} poses={[[-99, BODY["sci-clipboard"]]]} x={x + w * 0.0} y={top + h * 1.15} h={w * 0.6} look={SCI_B} faces={facesB} gaze={gaze} shadow={false} />
        <PhotoPerson id="sciA" t={t} poses={[[-99, BODY["sci-point"]]]} x={x + w * 0.25} y={top + h * 1.2} h={w * 0.64} look={SCI_A} faces={facesA} gaze={gaze} talk={talkA} shadow={false} />
      </AboveLine>
      <Actor a={A.boat} t={t} x={x} y={y} w={w} bob={0} />
    </div>
  );
};

/** a kelp stalk running down from the surface to the floor */
const KelpStalk: React.FC<{ x: number; y0: number; y1: number }> = ({ x, y0, y1 }) => {
  const d = `M ${x} ${y0} C ${x - 80} ${y0 + (y1 - y0) * 0.25}, ${x + 100} ${y0 + (y1 - y0) * 0.5}, ${x - 20} ${y0 + (y1 - y0) * 0.7} S ${x + 40} ${y1 - 200}, ${x + 20} ${y1}`;
  return (
    <svg viewBox={`0 0 ${W} ${y1}`} style={{ position: "absolute", left: 0, top: 0, width: W, height: y1, overflow: "visible" }}>
      <path d={d} fill="none" stroke="#5e7d18" strokeWidth={34} strokeLinecap="round" />
      <path d={d} fill="none" stroke="#a9c94a" strokeWidth={10} strokeLinecap="round" opacity={0.7} />
    </svg>
  );
};

/* ------------------------------------------------------------ the shots */

const shots: Shot[] = [
  /* HOOK: a rapid montage, one sleeper per beat. A sperm whale hanging upright… */
  {
    at: 0,
    render: ({ t, u }) => (
      <Cam t={t} z={1.5 - 0.3 * ease(u, 0, 0.7)} y={900}>
        <Backdrop src={BG.deep} t={t} />
        <Actor a={UP} t={t} x={560} y={1000} w={1100} rot={90} bob={14} bobRate={0.6} moods={SLEEP} />
        <Zzz t={t} x={700} y={430} size={96} from={0.1} />
      </Cam>
    ),
  },
  /* …otters holding hands… */
  {
    at: c("hook", 2),
    transition: "whip",
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.6 + 0.25 * ease(u, 0, 0.8)} x={560} y={960}>
        <Backdrop src={BG.sea} t={t} />
        <Actor a={A.hold} t={t} x={540} y={1140} w={1250} rot={-3} bob={9} bobRate={0.7} moods={SLEEP} />
        <Pop t={t} at={c("hook", 3)} x={580} y={980}><Heart size={150} /></Pop>
      </Cam>
    ),
  },
  /* …a frigatebird asleep on the wing… */
  {
    at: c("hook", 6),
    transition: "zoom",
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.3 + 0.15 * ease(u, 0, 0.5)}>
        <Backdrop src={BG.sky} t={t} blur={1.5} />
        <Actor a={A.frigate} t={t} x={lerp(760, 520, ease(u, 0, 0.6))} y={860} w={900} rot={Math.sin(t * 2) * 4} bob={18} bobRate={0.9} moods={SLEEP} />
        <Zzz t={t} x={360} y={640} size={70} from={c("hook", 6)} />
      </Cam>
    ),
  },
  /* …and the whole pod, standing in the deep */
  {
    at: c("hook", 7),
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.0 + 0.1 * ease(u, 0, 0.9)}>
        <Backdrop src={BG.deep} t={t} />
        {[[200, 1180, 560], [880, 1160, 600], [540, 960, 860]].map(([x, y, w], i) => (
          <Actor key={i} a={UP} t={t} x={x} y={y} w={w} rot={90} enter={c("hook", 7) + i * 0.08} bob={10} bobRate={0.5 + i * 0.07} moods={SLEEP} />
        ))}
        <Pop t={t} at={c("hook", 7) + 0.25} x={540} y={420}><Mark text="?!" size={170} /></Pop>
      </Cam>
    ),
  },

  /* #1 SEA OTTERS: "First, sea otters." */
  {
    at: c("otter1", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.04 + 0.1 * ease(u, 0, 1.8)} y={1000}>
        <Backdrop src={BG.sea} t={t} />
        <Actor a={A.otter} t={t} x={560} y={1150} w={1000} rot={-4} bob={12} bobRate={0.7} enter={c("otter1", 0)} enterFrom={[700, 0]} moods={[[-99, "open"]]} look={[-0.3, 0.2]} />
      </Cam>
    ),
  },
  /* "If one falls asleep alone," eyes drop shut */
  {
    at: c("otter1", 3),
    render: ({ t, u }) => (
      <Cam t={t} z={1.9 + 0.15 * ease(u, 0, 1.8)} x={300} y={1060}>
        <Backdrop src={BG.sea} t={t} blur={1.5} />
        <Actor a={A.otter} t={t} x={560} y={1120} w={1000} rot={-4} bob={10} bobRate={0.8} moods={[[-99, "open"], [c("otter1", 6), "closed"]]} look={[-0.2, 0.3]} />
        <Zzz t={t} x={360} y={880} size={60} from={c("otter1", 6) + 0.1} />
      </Cam>
    ),
  },
  /* "the current can carry it far out to sea." pull back, it drifts off toward the horizon */
  {
    at: c("otter1", 8),
    render: ({ t, u, end }) => {
      const k = ease(u, 0, end - c("otter1", 8));
      return (
        <Cam t={t} z={1.12 - 0.12 * k}>
          <Backdrop src={BG.sea} t={t} />
          <Current t={t} x={140} y={1180} dir={1} />
          <Current t={t + 0.4} x={260} y={1400} w={600} dir={1} opacity={0.7} />
          <Actor a={A.otter} t={t} x={lerp(500, 820, k)} y={lerp(1180, 760, k)} w={lerp(820, 200, k)} rot={-4 + 8 * k} bob={10} moods={SLEEP} />
          <Zzz t={t} x={lerp(380, 760, k)} y={lerp(980, 680, k)} size={lerp(66, 30, k)} />
        </Cam>
      );
    },
  },

  /* "So they hold hands while they sleep," */
  {
    at: c("otter2", 0),
    transition: "zoom",
    render: ({ t, u }) => (
      <Cam t={t} z={1.05 + 0.14 * ease(u, 0, 2.1)} y={1000}>
        <Backdrop src={BG.sea} t={t} flip />
        <Actor a={A.hold} t={t} x={540} y={1140} w={1250} rot={-3} bob={9} bobRate={0.7} moods={SLEEP} />
        <Pop t={t} at={c("otter2", 2)} x={580} y={1000}><Heart size={170} /></Pop>
        <Zzz t={t} x={420} y={880} size={56} />
        <Zzz t={t + 0.7} x={760} y={900} size={50} />
      </Cam>
    ),
  },
  /* "so nobody drifts away." the pair stays put; a lone one drifting off is struck out */
  {
    at: c("otter2", 7),
    render: ({ t, u }) => (
      <Cam t={t} z={1.0 + 0.05 * ease(u, 0, 1.5)}>
        <Backdrop src={BG.sea} t={t} flip />
        <Current t={t} x={60} y={1500} w={960} dir={1} />
        <Actor a={A.otter} t={t} x={lerp(700, 880, ease(u, 0, 1.6))} y={800} w={340} rot={2} bob={6} moods={SLEEP} opacity={0.9} />
        <Pop t={t} at={c("otter2", 9)} x={800} y={780}><RedX t={t} at={c("otter2", 9)} size={280} /></Pop>
        <Actor a={A.hold} t={t} x={480} y={1240} w={900} rot={-3} bob={8} bobRate={0.7} moods={SLEEP} />
      </Cam>
    ),
  },

  /* "Some even wrap themselves in kelp, like a blanket" */
  {
    at: c("otter3", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.05 + 0.18 * ease(u, 0, 2.6)} x={480} y={1080}>
        <Backdrop src={BG.sea} t={t} />
        <Actor a={A.otterKelp} t={t} x={560} y={1150} w={1050} rot={-3} bob={10} bobRate={0.8} enter={c("otter3", 2)} moods={SLEEP} />
        <Actor a={A.otter} t={t} x={560} y={1150} w={1000} rot={-4} bob={10} bobRate={0.8} exit={c("otter3", 2)} moods={SLEEP} />
        <Pop t={t} at={c("otter3", 5)} x={640} y={820}><Chip text="KELP" size={70} bg="#9bd13a" /></Pop>
        <Pop t={t} at={c("otter3", 8)} x={430} y={1420}><Chip text="= BLANKET" size={62} /></Pop>
      </Cam>
    ),
  },
  /* "tied to the ocean floor." the camera drops down the kelp stalk to the seabed */
  {
    at: c("otter3", 9),
    render: ({ t, u, end }) => {
      const k = ease(u, 0.05, end - c("otter3", 9) - 0.05);
      return (
        <>
        <Cam t={t} y={lerp(960, 960 + H, k)} z={1}>
          <Backdrop src={BG.sea} t={t} y={-H * 0.25} h={H * 1.5} />
          <div style={{ position: "absolute", left: 0, top: H * 0.85, width: W, height: H * 1.5, WebkitMaskImage: "linear-gradient(transparent 0, #000 22%)", maskImage: "linear-gradient(transparent 0, #000 22%)" }}>
            <Backdrop src={BG.kelp} t={t} x={-W * 0.2} y={0} h={H * 1.5} blur={1} />
          </div>
          <KelpStalk x={560} y0={1080} y1={H * 2.2} />
          <Actor a={A.otterKelp} t={t} x={560} y={1000} w={820} rot={-3} bob={8} moods={SLEEP} />
        </Cam>
        <Pop t={t} at={c("otter3", 12)} x={540} y={560}><Chip text="ANCHORED" size={66} bg="#ffd400" /></Pop>
        </>
      );
    },
  },

  /* "And the babies?" */
  {
    at: c("otter4", 0),
    transition: "zoom",
    render: ({ t, u }) => (
      <Cam t={t} z={2.0 + 0.2 * ease(u, 0, 1.2)} x={600} y={1020}>
        <Backdrop src={BG.sea} t={t} blur={2} />
        <Actor a={A.pup} t={t} x={680} y={900} w={1100} rot={-3} bob={8} bobRate={0.7} look={[0.4, 0.5]} />
        <Pop t={t} at={c("otter4", 2)} x={760} y={830}><Mark text="?" size={110} /></Pop>
      </Cam>
    ),
  },
  /* "They just nap on mom's belly." */
  {
    at: c("otter4", 3),
    render: ({ t, u }) => (
      <Cam t={t} z={1.04 + 0.12 * ease(u, 0, 1.8)} y={980}>
        <Backdrop src={BG.sea} t={t} />
        <Actor a={A.pup} t={t} x={560} y={1120} w={1080} rot={-3} bob={9} bobRate={0.7} look={[0.4, 0.5]} />
        <Zzz t={t} x={700} y={960} size={56} from={c("otter4", 5)} />
        <Pop t={t} at={c("otter4", 7)} x={330} y={900}><Heart size={130} /></Pop>
      </Cam>
    ),
  },

  /* #2 FRIGATEBIRD: "Next, the frigatebird." */
  {
    at: c("frigate1", 0),
    transition: "whip",
    render: ({ t, u }) => {
      const fly = ease(u, 0, 1.1);
      return (
        <Cam t={t} z={1.05 + 0.05 * ease(u, 0, 1.8)}>
          <Backdrop src={BG.sky} t={t} blur={1} />
          <Actor a={A.frigate} t={t} x={lerp(1350, 560, fly)} y={lerp(640, 860, fly)} w={900} rot={-4 + Math.sin(t * 2) * 3} bob={20} bobRate={0.9} />
        </Cam>
      );
    },
  },
  /* "It can stay in the air for two whole months" the days ticking over */
  {
    at: c("frigate1", 3),
    render: ({ t, u }) => (
      <Cam t={t} z={1.02 + 0.06 * ease(u, 0, 2)}>
        <Backdrop src={BG.sky} t={t} blur={0.8} flip />
        <Actor a={A.frigate} t={t} x={lerp(860, 330, ease(u, 0, 2.2))} y={900} w={560} rot={-3 + Math.sin(t * 2) * 3} bob={18} bobRate={0.9} />
        <Pop t={t} at={c("frigate1", 9)} x={760} y={470}><Calendar n={Math.round(lerp(1, 60, ease(t, c("frigate1", 10), c("frigate1", 12) + 0.4)))} /></Pop>
      </Cam>
    ),
  },
  /* "without landing." high over open sea, landing struck out */
  {
    at: c("frigate1", 13),
    render: ({ t, u }) => (
      <Cam t={t} z={1.05 + 0.08 * ease(u, 0, 0.8)}>
        <Backdrop src={BG.openSea} t={t} />
        <Actor a={A.frigate} t={t} x={lerp(700, 460, ease(u, 0, 1))} y={460} w={460} rot={Math.sin(t * 2) * 3} bob={12} bobRate={0.9} />
        <Pop t={t} at={c("frigate1", 13) + 0.05} x={560} y={780}><Arrow t={t} at={c("frigate1", 13) + 0.05} rot={90} size={170} /></Pop>
        <Pop t={t} at={c("frigate1", 14)} x={560} y={1060}><RedX t={t} at={c("frigate1", 14)} size={320} /></Pop>
      </Cam>
    ),
  },
  /* "So it sleeps while flying," */
  {
    at: c("frigate2", 0),
    transition: "zoom",
    render: ({ t, u }) => {
      const nap = c("frigate2", 2);
      return (
        <Cam t={t} z={1.5 + 0.15 * ease(u, 0, 2.2)} x={420} y={820}>
          <Backdrop src={BG.sky} t={t} blur={1.5} flip />
          <Actor a={A.frigate} t={t} x={560} y={860} w={900} rot={Math.sin(t * 1.6) * 4} bob={18} bobRate={0.8} moods={[[-99, "open"], [nap, "closed"]]} />
          <Zzz t={t} x={360} y={640} size={60} from={nap} />
        </Cam>
      );
    },
  },
  /* "in naps that last about twelve seconds," the stopwatch runs to 12 */
  {
    at: c("frigate2", 5),
    render: ({ t, u }) => {
      const secs = Math.min(12, Math.max(0, Math.round((t - c("frigate2", 9)) * 9)));
      return (
        <Cam t={t} z={1.05} x={540 - u * 10}>
          <Backdrop src={BG.sky} t={t} blur={0.8} />
          <Actor a={A.frigate} t={t} x={560} y={560} w={620} rot={Math.sin(t * 1.6) * 4} bob={16} bobRate={0.8} moods={[[-99, "closed"], [c("frigate2", 11) + 0.3, "open"]]} />
          <Zzz t={t} x={400} y={400} size={56} until={c("frigate2", 11) + 0.3} />
          <Pop t={t} at={c("frigate2", 5) + 0.1} x={540} y={1000}><Clock t={t} size={300} spin={1} fill={clamp01(secs / 60)} color="#ff7a14" /></Pop>
          <Pop t={t} at={c("frigate2", 9)} x={540} y={1190}><Chip text={`${secs} SEC`} size={62} /></Pop>
        </Cam>
      );
    },
  },
  /* "often with half of its brain still awake" the close-up: the eye stays open, on watch */
  {
    at: c("frigate3", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.2 + 0.15 * ease(u, 0, 2.2)} x={560} y={760}>
        <Backdrop src={BG.sky} t={t} blur={3} />
        <Actor a={A.frigateHead} t={t} x={520} y={1100} w={1250} bob={6} bobRate={0.8} look={[Math.sin(t * 2.4) > 0 ? -0.8 : 0.1, 0.1]} />
        <Pop t={t} at={c("frigate3", 2)} x={780} y={470}><SplitBrain t={t} size={200} /></Pop>
      </Cam>
    ),
  },
  /* "to watch where it's going." flying on, one eye on the way ahead */
  {
    at: c("frigate3", 8),
    render: ({ t, u }) => (
      <Cam t={t} z={1.1 - 0.05 * ease(u, 0, 1.2)}>
        <Backdrop src={BG.sky} t={t} blur={1} flip />
        <Actor a={A.frigate} t={t} x={lerp(720, 620, ease(u, 0, 1.2))} y={880} w={760} rot={Math.sin(t * 1.6) * 4} bob={16} bobRate={0.8}
          moods={[[-99, "open"]]} look={[-0.9, 0]} />
        <Pop t={t} at={c("frigate3", 9)} x={200} y={760}><Arrow t={t} at={c("frigate3", 9)} rot={180} size={150} color="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "Add it all up, and that's less than forty-five minutes of sleep a day." */
  {
    at: c("frigate4", 0),
    render: ({ t, u }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.sky} t={t} blur={1} />
        <Actor a={A.frigate} t={t} x={lerp(820, 300, ease(u, 0, 3.2))} y={520} w={420} bob={16} bobRate={0.9} moods={[[-99, "closed"], [c("frigate4", 4), "sad"]]} />
        <Pop t={t} at={c("frigate4", 0) + 0.1} x={540} y={900}><Clock t={t} size={420} spin={0.6} fill={ease(t, c("frigate4", 6), c("frigate4", 9)) * 0.75} color="#6aa6ff" /></Pop>
        <Pop t={t} at={c("frigate4", 6)} x={540} y={1180}><Chip text="< 45 MIN / DAY" size={70} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },

  /* #3 SPERM WHALES: "Finally, sperm whales." swims in */
  {
    at: c("whale1", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.05 + 0.06 * ease(u, 0, 2)}>
        <Backdrop src={BG.deep} t={t} />
        <Actor a={A.whale} t={t} x={lerp(1500, 560, ease(u, 0, 1.2))} y={1000} w={1100} rot={-4} bob={14} bobRate={0.5} />
      </Cam>
    ),
  },
  /* "They sleep standing straight up," it tips upright */
  {
    at: c("whale1", 3),
    render: ({ t, u }) => {
      const tip = ease(t, c("whale1", 4), c("whale1", 7) + 0.2);
      const rot = -4 + 94 * tip;
      return (
        <Cam t={t} z={1.15 - 0.08 * ease(u, 0, 1.6)} y={940}>
          <Backdrop src={BG.deep} t={t} />
          <Actor a={whaleAt(rot)} t={t} x={540} y={lerp(1000, 960, tip)} w={1000} rot={rot} bob={12} bobRate={0.5}
            moods={[[-99, "open"], [c("whale1", 5), "closed"]]} />
          <Zzz t={t} x={660} y={360} size={80} from={c("whale1", 6)} />
        </Cam>
      );
    },
  },
  /* "hanging just below the surface" up at the light, the head just under the waves */
  {
    at: c("whale1", 8),
    render: ({ t, u }) => (
      <Cam t={t} z={1.25 - 0.1 * ease(u, 0, 1.6)} y={700}>
        <Backdrop src={BG.deep} t={t} y={-H * 0.05} />
        <Actor a={UP} t={t} x={560} y={1050} w={1100} rot={90} bob={8} bobRate={0.4} moods={SLEEP} />
        <Pop t={t} at={c("whale1", 10)} x={880} y={420}><Arrow t={t} at={c("whale1", 10)} rot={-90} size={150} color="#fff" /></Pop>
      </Cam>
    ),
  },
  /* "like giant tree trunks." the whole pod, upright, a trunk beside them for scale */
  {
    at: c("whale1", 13),
    transition: "zoom",
    render: ({ t, u }) => (
      <Cam t={t} z={1.06 - 0.06 * ease(u, 0, 1.5)}>
        <Backdrop src={BG.deep} t={t} />
        {[[160, 760, 380], [930, 720, 400]].map(([x, y, w], i) => (
          <Actor key={i} a={UP} t={t} x={x} y={y} w={w} rot={90} enter={c("whale1", 13) + i * 0.12} bob={10} bobRate={0.5 + i * 0.07} moods={SLEEP}
            tint="brightness(0.75) blur(2px)" opacity={0.8} />
        ))}
        {[[220, 1240, 560], [880, 1220, 600]].map(([x, y, w], i) => (
          <Actor key={i} a={UP} t={t} x={x} y={y} w={w} rot={90} enter={c("whale1", 13) + 0.24 + i * 0.12} bob={10} bobRate={0.55 + i * 0.07} moods={SLEEP} />
        ))}
        <Actor a={UP} t={t} x={540} y={1000} w={900} rot={90} bob={12} bobRate={0.5} moods={SLEEP} />
        <Pop t={t} at={c("whale1", 15)} x={800} y={880}>
          <svg viewBox="-30 -120 60 240" style={{ position: "absolute", left: -60, top: -240, width: 120, height: 480, overflow: "visible" }}>
            <path d="M -18 120 L -14 -110 Q 0 -122 14 -110 L 18 120 Z" fill="#7a5132" stroke="#111" strokeWidth={4} />
            <path d="M -6 100 L -4 40 M 6 60 L 5 -20 M -5 0 L -3 -70 M 4 -50 L 3 -100" stroke="#4a2f1c" strokeWidth={3} strokeLinecap="round" />
          </svg>
        </Pop>
      </Cam>
    ),
  },
  /* "The whole group goes completely still for up to fifteen minutes." */
  {
    at: c("whale2", 0),
    render: ({ t, u }) => (
      <Cam t={t} z={1 + 0.08 * ease(u, 0, 2.8)}>
        <Backdrop src={BG.deep} t={t} />
        {[[360, 700, 400], [780, 660, 380]].map(([x, y, w], i) => (
          <Actor key={i} a={UP} t={t} x={x} y={y} w={w} rot={90} bob={3} bobRate={0.3} moods={SLEEP} tint="brightness(0.75) blur(2px)" opacity={0.85} />
        ))}
        {[[190, 1180, 600], [540, 1040, 820], [890, 1160, 640]].map(([x, y, w], i) => (
          <Actor key={i} a={UP} t={t} x={x} y={y} w={w} rot={90} bob={3} bobRate={0.3} moods={SLEEP} />
        ))}
        <Zzz t={t} x={600} y={500} size={70} />
        <Zzz t={t + 0.6} x={260} y={760} size={50} />
        <Pop t={t} at={c("whale2", 9)} x={830} y={420}><div style={{ position: "absolute" }}><Clock t={t} size={260} spin={1.5} fill={ease(t, c("whale2", 9), c("whale2", 10) + 0.5) * 0.25} /></div></Pop>
        <Pop t={t} at={c("whale2", 9) + 0.1} x={830} y={600}><Chip text="15 MIN" size={56} /></Pop>
      </Cam>
    ),
  },
  /* "When scientists drifted their boat right into a sleeping pod," above the surface:
     the pod's heads bobbing upright, the research boat drifting in among them */
  {
    at: c("whale3", 0),
    transition: "whip",
    render: ({ t, u }) => {
      const drift = ease(u, 0, 2.6);
      return (
        <Cam t={t} z={1.1 + 0.06 * ease(u, 0, 3.5)} x={540} y={1250}>
          <Backdrop src={BG.surface} t={t} />
          <WhaleHead t={t} x={790} water={1250} w={480} moods={SLEEP} />
          <WhaleHead t={t} x={610} water={1300} w={540} moods={SLEEP} />
          <Zzz t={t} x={760} y={1020} size={56} />
          <WhaleHead t={t} x={750} water={1480} w={720} moods={SLEEP} />
          <ResearchBoat t={t} x={lerp(40, 230, drift)} y={1520} w={580} rot={Math.sin(t * 1.6) * 2}
            facesA={[[-99, "curious"], [c("whale3", 8), "smirk"]]} facesB={[[-99, "neutral"], [c("whale3", 6), "curious"]]}
            talkA={[[c("whale3", 5), c("whale3", 9) + 0.2]]} />
        </Cam>
      );
    },
  },
  /* "the whales didn't even notice." tight on a sleeping face */
  {
    at: c("whale3", 10),
    transition: "zoom",
    render: ({ t, u }) => (
      <>
        <Cam t={t} z={2.1 + 0.15 * ease(u, 0, 1.5)} x={640} y={760}>
          <Backdrop src={BG.deep} t={t} blur={2} />
          <Actor a={UP} t={t} x={540} y={1100} w={900} rot={90} bob={4} bobRate={0.3} moods={SLEEP} />
          <Zzz t={t} x={560} y={600} size={40} />
        </Cam>
        <Pop t={t} at={c("whale3", 12)} x={300} y={520}><Mark text="?" size={170} /></Pop>
      </>
    ),
  },
  /* "Until the boat bumped one," the hull from below, knocking a head */
  {
    at: c("whale4", 0),
    render: ({ t }) => {
      const bump = c("whale4", 3);
      return (
        <Cam t={t} z={1.4} y={760} shake={28 * bell(t, bump, bump + 0.5)}>
          <Backdrop src={BG.deep} t={t} />
          <Actor a={UP} t={t} x={600} y={1180} w={900} rot={90} bob={4} bobRate={0.3} moods={[[-99, "closed"], [bump + 0.08, "wide"]]} />
          <Actor a={A.boat} t={t} x={lerp(300, 560, ease(t, c("whale4", 0), bump))} y={250 + 30 * bell(t, bump, bump + 0.3)} w={640} bob={6} bobRate={1.1}
            rot={Math.sin(t * 2) * 2 + 8 * bell(t, bump, bump + 0.4)} tint="brightness(0.8)" />
          <Pop t={t} at={bump} until={bump + 0.8} x={640} y={500}><Bonk size={240} /></Pop>
        </Cam>
      );
    },
  },
  /* "and the whole group woke up at once." above the surface: every head's eyes snap open,
     the boat rocks, the scientists' faces drop */
  {
    at: c("whale4", 5),
    transition: "whip",
    render: ({ t }) => {
      const wake = c("whale4", 9);
      const jolt = bell(t, wake, wake + 0.7);
      const WAKE: [number, Mood][] = [[-99, "closed"], [wake, "wide"]];
      return (
        <Cam t={t} z={1.15} x={540} y={1250} shake={18 * jolt}>
          <Backdrop src={BG.surface} t={t} />
          <WhaleHead t={t} x={790} water={1250} w={480} moods={WAKE} rock={-14 * jolt} />
          <WhaleHead t={t} x={610} water={1300} w={540} moods={[[-99, "wide"]]} rock={10 * jolt} />
          <WhaleHead t={t} x={750} water={1480} w={720} moods={WAKE} rock={8 * jolt} />
          <ResearchBoat t={t} x={230} y={1520} w={580} rot={Math.sin(t * 9) * 5 * jolt + Math.sin(t * 1.6) * 2}
            facesA={[[-99, "worried"], [wake, "shocked"]]} facesB={[[-99, "worried"], [wake + 0.1, "shocked"]]} gaze={[0.7, 0.1]} />
          <Pop t={t} at={wake} x={870} y={980}><Mark text="!" size={110} /></Pop>
          <Pop t={t} at={wake + 0.08} x={660} y={1040}><Mark text="!" size={120} /></Pop>
          <Pop t={t} at={wake + 0.16} x={260} y={1060}><Mark text="!" size={110} color="#fff" /></Pop>
        </Cam>
      );
    },
  },
];

/* ------------------------------------------------------------ the short */

export const SleepShort: React.FC<{ audio?: string | null; captions?: boolean; logo?: string; brand?: string }> = ({ audio = "audio/pins-sleep-mix.mp3", captions = true, logo, brand }) => {
  loadPinsFonts();
  const t = useT();
  return (
    <AbsoluteFill style={{ background: "#0b2a4d" }}>
      <Punch t={t} hits={HITS}><ShotPlayer shots={shots} t={t} total={T.duration} /></Punch>
      <Brand logo={logo} name={brand} />
      {captions && <WordCaption T={T} t={t} />}
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ thumbnail (9:16) */

export const SleepThumb: React.FC = () => {
  loadPinsFonts();
  const t = 3.2;
  return (
    <AbsoluteFill style={{ background: "#0b2a4d" }}>
      <AbsoluteFill style={{ clipPath: "inset(0 0 50% 0)" }}>
        <Backdrop src={BG.sea} t={0} y={-H * 0.12} />
        <Actor a={A.hold} t={t} x={540} y={640} w={1250} rot={-3} bob={0} moods={SLEEP} />
        <div style={{ position: "absolute", left: 590, top: 420 }}><Heart size={170} /></div>
      </AbsoluteFill>
      <AbsoluteFill style={{ clipPath: "inset(50% 0 0 0)" }}>
        <Backdrop src={BG.deep} t={0} y={H / 2 - H * 0.1} h={H * 0.7} />
        <Actor a={UP} t={t} x={280} y={1500} w={680} rot={90} bob={0} moods={SLEEP} />
        <Actor a={UP} t={t} x={780} y={1440} w={780} rot={90} bob={0} moods={SLEEP} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: H / 2 - 8, height: 16, background: "#fff" }} />
      <div style={{ position: "absolute", left: 50, right: 50, top: H / 2 - 170, textAlign: "center", fontFamily: "Anton", fontSize: 170, lineHeight: 1,
        color: "#ff7a14", WebkitTextStroke: "16px #1b0f05", paintOrder: "stroke fill", textTransform: "uppercase", filter: "drop-shadow(0 8px 2px rgba(0,0,0,0.55))" }}>
        They sleep<br /><span style={{ color: "#fff" }}>like this?!</span>
      </div>
    </AbsoluteFill>
  );
};
