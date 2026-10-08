import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import {
  Actor, Backdrop, BoldCaption, Bonk, Brand, Bubble, Cam, Chip, Mark, Mood, Pop, Punch, Shot, ShotPlayer, Timing, Zzz,
  bell, cue, ease, hitsFromScript, lerp, loadPinsFonts, useT,
} from "../engine";
import { HeadLook, PhotoPerson } from "../people";
import { BODY } from "../bodies";
import { ASSETS, BG } from "./assets";
import TIMING from "./timing.json";
import SCRIPT from "./script.json";

/**
 * "3 animals that actually get drunk": the chimps of Bossou, Guinea, drinking
 * fermented palm sap with leaf sponges, the moose stuck in a Swedish apple
 * tree, the waxwings in a Yukon "drunk tank". Hook: ding, riser under a cut-
 * per-beat montage peaking as "drunk." ends, then the chimp hiccups and flops.
 */

const T = TIMING as Timing;
export const DRUNK_FPS = 30;
export const DRUNK_FRAMES = Math.ceil(T.duration * DRUNK_FPS);

const A = ASSETS;
const c = (id: string, i = 0) => cue(T, id, i);
const OPEN: [number, Mood][] = [[-99, "open"]];
const DIZZY: [number, Mood][] = [[-99, "dead"]];
const PAYOFF = (T.lines[0] as unknown as { hold_at: number }).hold_at;

const HITS = [...hitsFromScript(T, SCRIPT as never, [["hook", 0], ["hook", 2], ["hook", 3], ["hook", 5], ["chimp1", 0], ["moose1", 0], ["wax1", 0]],
  ["whoosh", "riser", "tiptoe"]), PAYOFF, PAYOFF + 0.6].sort((a, b) => a - b);

const RANGER: HeadLook = { hair: "cap", hat: "#2e6b45", skin: "#e2b08a", hairColor: "#2b1a10", beard: "stubble" };

/** tipsy wobble, in degrees */
const wob = (t: number, k = 1) => Math.sin(t * 5) * 6 * k;

/** stars circling a dizzy head */
const Stars: React.FC<{ t: number; x: number; y: number; r?: number }> = ({ t, x, y, r = 80 }) => (
  <>
    {[0, 1, 2].map((i) => {
      const a = t * 5 + (i * Math.PI * 2) / 3;
      return <div key={i} style={{ position: "absolute", left: x + Math.cos(a) * r - 22, top: y + Math.sin(a) * r * 0.35 - 22, fontSize: 44, color: "#ffd400",
        WebkitTextStroke: "3px #111", fontFamily: "Anton" }}>★</div>;
    })}
  </>
);

/** a house window, cracked on impact */
const Window: React.FC<{ t: number; crack: number }> = ({ t, crack }) => (
  <svg viewBox="0 0 300 380" style={{ position: "absolute", left: -150, top: -190, width: 300, height: 380, overflow: "visible", filter: "drop-shadow(0 10px 6px rgba(0,0,0,0.35))" }}>
    <rect x={0} y={0} width={300} height={380} fill="#f4efe6" stroke="#111" strokeWidth={8} />
    <rect x={22} y={22} width={256} height={336} fill="#bfe4f7" stroke="#111" strokeWidth={6} />
    <path d="M 150 22 L 150 358 M 22 190 L 278 190" stroke="#f4efe6" strokeWidth={12} />
    {t > crack && <path d="M 110 120 L 80 70 M 110 120 L 160 95 M 110 120 L 70 160 M 110 120 L 140 175 L 175 210 M 110 120 L 120 60" stroke="#111" strokeWidth={4} fill="none" />}
  </svg>
);

/* ------------------------------------------------------------ the shots */

const shots: Shot[] = [
  /* HOOK under the riser: a chimp on the palm wine… */
  {
    at: 0,
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.35 - 0.15 * ease(u, 0, 0.9)}>
        <Backdrop src={BG.jungle} t={t} />
        <Actor a={A.chimpDrink} t={t} x={540} y={1180} w={760} rot={wob(t, 0.6)} bob={0} moods={[[-99, "closed"]]} />
      </Cam>
    ),
  },
  /* …a moose in a tree… */
  {
    at: c("hook", 2),
    transition: "whip",
    reframes: false,
    render: ({ t }) => (
      <Cam t={t} z={1.15} y={820}>
        <Actor a={A.mooseStuck} t={t} x={540} y={960} w={1080} bob={0} moods={[[-99, "wide"]]} look={[0, 0.2]} />
      </Cam>
    ),
  },
  /* …a waxwing, out cold… */
  {
    at: c("hook", 3),
    transition: "zoom",
    reframes: false,
    render: ({ t }) => (
      <Cam t={t} z={1.1}>
        <Backdrop src={BG.snow} t={t} blur={2} />
        <Actor a={A.waxwingDizzy} t={t} x={540} y={1100} w={680} bob={0} moods={DIZZY} />
        <Stars t={t} x={330} y={1060} />
      </Cam>
    ),
  },
  /* …"drunk": the chimp sways harder as the riser climbs */
  {
    at: c("hook", 5),
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.2 + 0.3 * ease(u, 0, 0.45)} y={820} shake={10 * ease(u, 0.1, 0.45)}>
        <Backdrop src={BG.jungle} t={t} blur={2} />
        <Actor a={A.chimp} t={t} x={540} y={1100} w={760} rot={wob(t, 1.6)} bob={0} moods={OPEN} look={[Math.sin(t * 6) * 0.8, 0]} />
      </Cam>
    ),
  },
  /* PAYOFF in the held beat: HIC! …and flop. */
  {
    at: PAYOFF,
    reframes: false,
    render: ({ t, u }) => {
      const flop = PAYOFF + 0.6;
      return (
        <Cam t={t} z={1.08}>
          <Backdrop src={BG.jungle} t={t} />
          {t < flop ? (
            <>
              <Actor a={A.chimp} t={t} x={540} y={1200} w={700} rot={wob(t, 2)} bob={0} moods={OPEN} look={[0, -0.3]} />
              <Pop t={t} at={PAYOFF + 0.05} x={780} y={560}><Bubble text="HIC!" size={90} tail={[-60, 150]} /></Pop>
            </>
          ) : (
            <>
              <Actor a={A.chimpSleep} t={t} x={540} y={1420 + 40 * (1 - ease(u, 0.6, 0.75))} w={900} bob={0} moods={[[-99, "closed"]]} />
              <Zzz t={t} x={700} y={1180} size={80} from={flop + 0.1} />
              <Stars t={t} x={740} y={1260} r={70} />
            </>
          )}
        </Cam>
      );
    },
  },

  /* #1 CHIMPANZEES */
  {
    at: c("chimp1", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.04 + 0.08 * ease(u, 0, 1.6)}>
        <Backdrop src={BG.jungle} t={t} />
        <Actor a={A.chimp} t={t} x={540} y={1200} w={720} enter={c("chimp1", 1)} enterFrom={[-900, 0]} bob={3} moods={OPEN} look={[0, 0.2]} />
        <Pop t={t} at={c("chimp1", 1) + 0.05} x={540} y={420}><Chip text="CHIMPANZEES" size={70} bg="#ffd400" /></Pop>
        <Pop t={t} at={c("chimp1", 3)} x={540} y={540}><Chip text="GUINEA" size={56} /></Pop>
      </Cam>
    ),
  },
  /* "Farmers tap palm trees and collect the sap," */
  {
    at: c("chimp1", 4),
    render: ({ t, u }) => {
      const drip = (u * 1.6) % 1;
      return (
        <Cam t={t} z={1.05}>
          <Backdrop src={BG.jungle} t={t} flip />
          <Actor a={A.jug} t={t} x={540} y={820} w={420} bob={0} rot={Math.sin(t * 2) * 3} />
          <div style={{ position: "absolute", left: 528, top: 1040 + drip * 300, width: 24, height: 34, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: "#fff6d8", opacity: 1 - drip }} />
          <Pop t={t} at={c("chimp1", 9)} x={540} y={420}><Chip text="PALM SAP" size={66} /></Pop>
        </Cam>
      );
    },
  },
  /* "which ferments into palm wine." */
  {
    at: c("chimp1", 12),
    transition: "zoom",
    render: ({ t, u }) => (
      <Cam t={t} z={1.1}>
        <Backdrop src={BG.jungle} t={t} />
        <Actor a={A.jug} t={t} x={540} y={900} w={480} bob={0} />
        {Array.from({ length: 8 }).map((_, i) => {
          const k = ((u * 0.8 + i / 8) % 1);
          return <div key={i} style={{ position: "absolute", left: 470 + (i % 4) * 40, top: 1000 - k * 360, width: 20, height: 20, borderRadius: "50%", border: "4px solid #fff", opacity: 1 - k }} />;
        })}
        <Pop t={t} at={c("chimp1", 15)} x={540} y={430}><Chip text="PALM WINE" size={70} bg="#ff9ecb" /></Pop>
        <Pop t={t} at={c("chimp1", 16)} x={540} y={1420}><Chip text="UP TO 7% ALCOHOL" size={52} /></Pop>
      </Cam>
    ),
  },
  /* "The chimps sneak in," */
  {
    at: c("chimp2", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={BG.jungle} t={t} flip />
        <Actor a={A.jug} t={t} x={800} y={780} w={300} bob={0} />
        <Actor a={A.chimp} t={t} x={lerp(-200, 380, ease(u, 0, 1.1))} y={1250} w={560} bob={10} bobRate={3} moods={OPEN} look={[0.8, -0.3]} />
      </Cam>
    ),
  },
  /* "soak it up with leaves, and drink it." */
  {
    at: c("chimp2", 4),
    render: ({ t }) => (
      <Cam t={t} z={1.08}>
        <Backdrop src={BG.jungle} t={t} />
        <Actor a={A.chimpDrink} t={t} x={540} y={1180} w={760} rot={wob(t, 0.4)} bob={0} moods={[[-99, "open"], [c("chimp2", 10), "closed"]]} />
        <Pop t={t} at={c("chimp2", 7)} x={300} y={600}><Chip text="LEAF SPONGE" size={52} bg="#9bd13a" /></Pop>
      </Cam>
    ),
  },
  /* "Some drank so much they had to lie down for a nap." */
  {
    at: c("chimp2", 12),
    transition: "zoom",
    render: ({ t }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.jungle} t={t} flip />
        {t < c("chimp2", 19) ? (
          <Actor a={A.chimpDrink} t={t} x={540} y={1180} w={700} rot={wob(t, 2)} bob={0} moods={[[-99, "closed"]]} />
        ) : (
          <>
            <Actor a={A.chimpSleep} t={t} x={540} y={1380} w={920} bob={2} moods={[[-99, "closed"]]} />
            <Zzz t={t} x={720} y={1140} size={80} from={c("chimp2", 19)} />
          </>
        )}
      </Cam>
    ),
  },

  /* #2 THE MOOSE */
  {
    at: c("moose1", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.04 + 0.06 * ease(u, 0, 1.6)}>
        <Backdrop src={BG.orchard} t={t} />
        <Actor a={A.moose} t={t} x={lerp(-500, 500, ease(u, 0, 1.2))} y={1250} w={900} bob={3} moods={OPEN} look={[0.4, 0]} />
        <Pop t={t} at={c("moose1", 4)} x={540} y={420}><Chip text="SWEDEN" size={72} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "It ate so many fermented apples," */
  {
    at: c("moose1", 5),
    render: ({ t }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.orchard} t={t} flip />
        <Actor a={A.moose} t={t} x={440} y={1180} w={860} rot={wob(t, t > c("moose1", 9) ? 1 : 0)} bob={0} moods={[[-99, "open"], [c("moose1", 9), "dead"]]} />
        <Actor a={A.apples} t={t} x={820} y={1480} w={400} enter={c("moose1", 8)} bob={0} />
        <Pop t={t} at={c("moose1", 10)} x={760} y={560}><Bubble text="HIC!" size={70} tail={[-20, 130]} /></Pop>
      </Cam>
    ),
  },
  /* "it got stuck in an apple tree." */
  {
    at: c("moose1", 11),
    transition: "zoom",
    render: ({ t, u }) => (
      <Cam t={t} z={1.1 + 0.08 * ease(u, 0, 1.4)} y={860}>
        <Actor a={A.mooseStuck} t={t} x={540} y={960} w={1080} bob={0} moods={[[-99, "open"], [c("moose1", 13), "wide"]]} look={[0, 0.2]} />
        <Pop t={t} at={c("moose1", 13)} x={540} y={300}><Chip text="STUCK" size={90} bg="#ff4d4d" color="#fff" /></Pop>
      </Cam>
    ),
  },
  /* "Rescuers had to come and cut it free." */
  {
    at: c("moose2", 0),
    render: ({ t }) => (
      <Cam t={t} z={1.08} y={900}>
        <Actor a={A.mooseStuck} t={t} x={540} y={960} w={1080} bob={0} moods={[[-99, "sad"]]} look={[-0.6, 0.2]} />
        <PhotoPerson id="ranger" t={t} poses={[[-99, BODY["keeper-point"]]]} x={220} y={1880} h={1050} look={RANGER} faces={[[-99, "shocked"]]} gaze={[0.7, -0.3]} enter={c("moose2", 0)} enterFrom={[-500, 0]} />
        <Pop t={t} at={c("moose2", 5)} x={640} y={420}><Chip text="RESCUED" size={72} bg="#5be36b" /></Pop>
      </Cam>
    ),
  },

  /* #3 BOHEMIAN WAXWINGS */
  {
    at: c("wax1", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.04 + 0.08 * ease(u, 0, 1.6)}>
        <Backdrop src={BG.snow} t={t} />
        <Actor a={A.waxwing} t={t} x={540} y={1150} w={620} enter={c("wax1", 1)} enterFrom={[800, -300]} bob={3} moods={OPEN} look={[-0.3, 0.2]} />
        <Pop t={t} at={c("wax1", 2)} x={540} y={420}><Chip text="WAXWINGS" size={76} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "These birds eat fermented berries" */
  {
    at: c("wax1", 3),
    render: ({ t }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.snow} t={t} flip />
        <Actor a={A.berries} t={t} x={300} y={900} w={420} bob={0} rot={-10} />
        <Actor a={A.waxwing} t={t} x={700} y={1200} w={560} rot={wob(t, t > c("wax1", 7) ? 1.4 : 0)} bob={0} moods={[[-99, "open"], [c("wax1", 7), "dead"]]} look={[-0.6, -0.2]} />
      </Cam>
    ),
  },
  /* "and crash into windows." */
  {
    at: c("wax1", 8),
    transition: "zoom",
    render: ({ t, u }) => {
      const hit = c("wax1", 11);
      const k = ease(t, c("wax1", 8), hit);
      return (
        <Cam t={t} z={1.08} shake={22 * bell(t, hit, hit + 0.4)}>
          <Backdrop src={BG.snow} t={t} />
          <div style={{ position: "absolute", left: 640, top: 860 }}><Window t={t} crack={hit} /></div>
          {t < hit ? (
            <Actor a={A.waxwing} t={t} x={lerp(100, 560, k)} y={lerp(1300, 900, k)} w={360} rot={-20} bob={0} moods={DIZZY} />
          ) : (
            <Actor a={A.waxwingDizzy} t={t} x={560} y={1300 + 80 * ease(t, hit, hit + 0.4)} w={420} bob={0} moods={DIZZY} />
          )}
          <Pop t={t} at={hit} until={hit + 0.7} x={600} y={860}><Bonk size={220} /></Pop>
        </Cam>
      );
    },
  },
  /* "In Canada, wildlife officers actually put the drunk birds in little cages until they sobered up." */
  {
    at: c("wax2", 0),
    transition: "whip",
    render: ({ t }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={BG.snow} t={t} flip />
        <PhotoPerson id="officer" t={t} poses={[[-99, BODY["keeper-stand"]]]} x={290} y={1880} h={1150} look={RANGER} faces={[[-99, "smirk"]]} gaze={[0.6, 0]} talk={[[c("wax2", 2), c("wax2", 4)]]} />
        <Actor a={A.waxwingDizzy} t={t} x={780} y={1270} w={260} bob={0} moods={DIZZY} />
        <Actor a={A.cage} t={t} x={780} y={1150} w={400} enter={c("wax2", 11)} bob={0} />
        <Pop t={t} at={c("wax2", 1)} x={540} y={420}><Chip text="CANADA" size={66} /></Pop>
      </Cam>
    ),
  },
  /* "A drunk tank. For birds." the last shot: it loops to the hook */
  {
    at: c("wax3", 0),
    render: ({ t, u }) => (
      <Cam t={t} z={1.3 + 0.12 * ease(u, 0, 1.6)} y={1000}>
        <Backdrop src={BG.snow} t={t} blur={2} />
        <Actor a={A.waxwingDizzy} t={t} x={540} y={1180} w={320} bob={0} moods={DIZZY} />
        <Actor a={A.cage} t={t} x={540} y={1040} w={480} bob={0} />
        <Zzz t={t} x={640} y={940} size={50} />
        <Pop t={t} at={c("wax3", 1)} x={540} y={600}><Chip text="DRUNK TANK" size={80} bg="#ff4d4d" color="#fff" /></Pop>
        <Pop t={t} at={c("wax3", 3)} x={760} y={760}><Mark text="!" size={120} /></Pop>
      </Cam>
    ),
  },
];

/* ------------------------------------------------------------ the short */

export const DrunkShort: React.FC<{ audio?: string | null; captions?: boolean; logo?: string; brand?: string }> = ({ audio = "audio/pins-drunk-mix.mp3", captions = true, logo, brand }) => {
  loadPinsFonts();
  const t = useT();
  return (
    <AbsoluteFill style={{ background: "#0b2a4d" }}>
      <Punch t={t} hits={HITS}><ShotPlayer shots={shots} t={t} total={T.duration} /></Punch>
      <Brand logo={logo} name={brand} />
      {captions && <BoldCaption T={T} t={t} />}
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ thumbnail (9:16) */

export const DrunkThumb: React.FC = () => {
  loadPinsFonts();
  const t = 1;
  return (
    <AbsoluteFill style={{ background: "#0b2a4d" }}>
      <Backdrop src={BG.jungle} t={0} />
      <Actor a={A.chimpDrink} t={t} x={560} y={1320} w={860} rot={-6} bob={0} moods={[[-99, "closed"]]} />
      <div style={{ position: "absolute", left: 820, top: 820 }}><Bubble text="HIC!" size={100} tail={[-80, 160]} /></div>
      <div style={{ position: "absolute", left: 50, right: 50, top: 170, textAlign: "center", fontFamily: "Anton", fontSize: 160, lineHeight: 1,
        color: "#ff7a14", WebkitTextStroke: "16px #1b0f05", paintOrder: "stroke fill", textTransform: "uppercase", filter: "drop-shadow(0 8px 2px rgba(0,0,0,0.55))" }}>
        Animals get<br /><span style={{ color: "#fff" }}>drunk?!</span>
      </div>
    </AbsoluteFill>
  );
};
