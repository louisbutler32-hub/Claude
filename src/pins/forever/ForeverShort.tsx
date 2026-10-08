import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import {
  Actor, Arrow, Backdrop, Brand, Bubble, Calendar, Cam, Chip, Clock, Mark, Mood, Pop, Punch, RedX, Shot, ShotPlayer, Timing,
  WordCaption, Zzz, bell, cue, ease, hitsFromScript, lerp, loadPinsFonts, useT,
} from "../engine";
import { HeadLook, PhotoPerson } from "../people";
import { BODY } from "../bodies";
import { ASSETS, BG } from "./assets";
import TIMING from "./timing.json";
import SCRIPT from "./script.json";

/**
 * "3 animals that live forever": the immortal jellyfish that turns back into
 * a baby, the ~400-year-old Greenland shark, and Jonathan the ~190-year-old
 * tortoise. Hook: ding, a riser under a cut-per-beat montage peaking as
 * "forever." ends, then the payoff in the held beat: the Grim Reaper comes for
 * the tortoise, waits, checks the clock and gives up.
 */

const T = TIMING as Timing;
export const FOREVER_FPS = 30;
export const FOREVER_FRAMES = Math.ceil(T.duration * FOREVER_FPS);

const A = ASSETS;
const c = (id: string, i = 0) => cue(T, id, i);
const OPEN: [number, Mood][] = [[-99, "open"]];
/** the hook's true end, where the held silence starts: the riser peaks here and the payoff lands */
const PAYOFF = (T.lines[0] as unknown as { hold_at: number }).hold_at;

const HITS = [...hitsFromScript(T, SCRIPT as never, [["hook", 0], ["hook", 2], ["hook", 3], ["hook", 4], ["jelly1", 0], ["shark1", 0], ["tort1", 0]],
  ["whoosh", "riser", "clock", "dundun"]), PAYOFF, PAYOFF + 1.05].sort((a, b) => a - b);

const SCI: HeadLook = { hair: "ponytail", skin: "#c68a63", hairColor: "#2a1a10", glasses: true };

/** VHS-style rewind: ◀◀ and scanlines over the frame */
const Rewind: React.FC<{ t: number; on: boolean }> = ({ t, on }) => {
  if (!on) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0 3px, rgba(0,0,0,0.08) 3px 7px)", transform: `translateY(${(t * 900) % 14}px)` }} />
      <svg viewBox="0 0 120 60" style={{ position: "absolute", left: 60, top: 120, width: 220, height: 110, filter: "drop-shadow(0 4px 3px rgba(0,0,0,0.6))" }}>
        <path d="M 58 5 L 10 30 L 58 55 Z M 110 5 L 62 30 L 110 55 Z" fill="#fff" stroke="#111" strokeWidth={4} strokeLinejoin="round" />
      </svg>
    </AbsoluteFill>
  );
};

/** a tape measure strip, in cm, that grows */
const Ruler: React.FC<{ k: number }> = ({ k }) => (
  <div style={{ position: "absolute", left: -260, top: -40, width: 520 * Math.max(0.05, k), height: 80, background: "#ffd400", border: "6px solid #111", borderRadius: 8, overflow: "hidden" }}>
    {Array.from({ length: 26 }).map((_, i) => (
      <div key={i} style={{ position: "absolute", left: i * 20, top: 0, width: 4, height: i % 5 === 0 ? 40 : 22, background: "#111" }} />
    ))}
  </div>
);

/* ------------------------------------------------------------ the shots */

const shots: Shot[] = [
  /* HOOK under the riser: the jellyfish rewinds into a baby… */
  {
    at: 0,
    reframes: false,
    render: ({ t, u }) => {
      const baby = u > 0.55;
      return (
        <>
          <Cam t={t} z={1.3 - 0.15 * ease(u, 0, 0.8)}>
            <Backdrop src={BG.deep} t={t} />
            {!baby && <Actor a={A.jelly} t={t} x={540} y={900} w={lerp(760, 420, ease(u, 0.1, 0.55))} rot={-u * 420} bob={0} moods={OPEN} look={[0, 0]} />}
            {baby && <Actor a={A.polyp} t={t} x={540} y={960} w={560} enter={0.55} bob={4} moods={OPEN} look={[0, -0.2]} />}
          </Cam>
          <Rewind t={t} on={u > 0.1 && u < 0.55} />
        </>
      );
    },
  },
  /* …a shark older than the USA… */
  {
    at: c("hook", 2),
    transition: "whip",
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.15 + 0.05 * ease(u, 0, 0.3)}>
        <Backdrop src={BG.arctic} t={t} />
        <Actor a={A.shark} t={t} x={lerp(700, 540, ease(u, 0, 0.3))} y={1100} w={1100} bob={8} bobRate={0.5} moods={OPEN} look={[-0.4, 0]} />
        <Pop t={t} at={c("hook", 2) + 0.03} x={540} y={540}><Calendar n={Math.round(lerp(1620, 2026, ease(u, 0, 0.25)))} label="YEAR" /></Pop>
      </Cam>
    ),
  },
  /* …a tortoise with a LOT of candles… */
  {
    at: c("hook", 3),
    transition: "zoom",
    reframes: false,
    render: ({ t }) => (
      <Cam t={t} z={1.12}>
        <Backdrop src={BG.island} t={t} />
        <Actor a={A.tortoise} t={t} x={430} y={1250} w={820} bob={2} moods={OPEN} look={[0.6, 0]} />
        <Actor a={A.cake} t={t} x={820} y={980} w={420} enter={c("hook", 3) + 0.02} bob={0} />
      </Cam>
    ),
  },
  /* …"forever": push into his face as the riser climbs */
  {
    at: c("hook", 4),
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.1 + 0.5 * ease(u, 0, 0.6)} y={900} shake={14 * ease(u, 0.15, 0.6)}>
        <Backdrop src={BG.island} t={t} blur={3} />
        <Actor a={A.tortoiseFace} t={t} x={540} y={900} w={820} bob={0} moods={OPEN} look={[0, 0]} />
      </Cam>
    ),
  },
  /* PAYOFF, in the held beat: the Reaper comes for the tortoise… who blinks at him. He checks the clock, gives up. */
  {
    at: PAYOFF,
    reframes: false,
    render: ({ t, u }) => {
      const inK = ease(u, 0, 0.3), outK = ease(u, 1.15, 1.45);
      return (
        <Cam t={t} z={1.1}>
          <Backdrop src={BG.island} t={t} />
          <Actor a={A.tortoise} t={t} x={360} y={1340} w={680} bob={1} moods={[[-99, "open"], [PAYOFF + 0.55, "closed"], [PAYOFF + 0.8, "open"]]} look={[0.7, -0.3]} />
          <Actor a={A.reaper} t={t} x={lerp(1300, 790, inK) + outK * 700} y={1020} w={lerp(480, 480, 0)} flip={u > 1.15} bob={2}
            moods={[[-99, "angry"], [PAYOFF + 0.95, "sad"]]} look={[-0.7, 0.4]} />
          <Pop t={t} at={PAYOFF + 0.85} until={PAYOFF + 1.2} x={940} y={780}><Clock t={t} size={170} spin={6} fill={0.9} color="#e8171b" /></Pop>
          <Pop t={t} at={PAYOFF + 0.12} until={PAYOFF + 0.85} x={700} y={420}><Bubble text="IT'S TIME." size={70} tail={[90, 170]} /></Pop>
          <Pop t={t} at={PAYOFF + 0.95} x={640} y={420}><Bubble text="...NEXT YEAR." size={62} tail={[140, 170]} /></Pop>
          <Pop t={t} at={PAYOFF + 0.6} until={PAYOFF + 1.1} x={420} y={1080}><Mark text="?" size={100} color="#fff" /></Pop>
        </Cam>
      );
    },
  },

  /* #1 THE IMMORTAL JELLYFISH */
  {
    at: c("jelly1", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.05 + 0.1 * ease(u, 0, 1.6)}>
        <Backdrop src={BG.deep} t={t} />
        <Actor a={A.jelly} t={t} x={540} y={900} w={700} enter={c("jelly1", 0)} enterFrom={[0, 900]} bob={20} bobRate={0.6} moods={OPEN} look={[0, 0.2]} />
        <Pop t={t} at={c("jelly1", 2)} x={540} y={420}><Chip text="IMMORTAL JELLYFISH" size={58} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "It's smaller than your fingernail." */
  {
    at: c("jelly1", 4),
    transition: "zoom",
    render: ({ t }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.deep} t={t} blur={2} />
        <Actor a={A.finger} t={t} x={560} y={1400} w={560} bob={0} />
        <Actor a={A.jelly} t={t} x={600} y={720} w={110} enter={c("jelly1", 7)} bob={6} bobRate={1} moods={OPEN} look={[0, 0.3]} />
        <Pop t={t} at={c("jelly1", 8)} x={820} y={620}><Chip text="4.5 MM" size={60} /></Pop>
      </Cam>
    ),
  },
  /* "But when it gets old or hurt, it doesn't die." */
  {
    at: c("jelly2", 0),
    render: ({ t }) => (
      <Cam t={t} z={1.08}>
        <Backdrop src={BG.deep} t={t} />
        <Actor a={A.jelly} t={t} x={540} y={900} w={620} bob={6} bobRate={0.4} moods={[[-99, "open"], [c("jelly2", 4), "sad"]]} look={[0, 0.4]} tint={t > c("jelly2", 4) ? "saturate(0.5) brightness(0.85)" : undefined} />
        <Pop t={t} at={c("jelly2", 9)} x={540} y={900}><RedX t={t} at={c("jelly2", 9)} size={460} /></Pop>
      </Cam>
    ),
  },
  /* "It turns back into a baby" */
  {
    at: c("jelly2", 10),
    transition: "zoom",
    render: ({ t }) => {
      const baby = c("jelly2", 15);
      const k = ease(t, c("jelly2", 11), baby);
      return (
        <>
          <Cam t={t} z={1.1}>
            <Backdrop src={BG.deep} t={t} />
            {t < baby && <Actor a={A.jelly} t={t} x={540} y={900} w={lerp(620, 260, k)} rot={-k * 540} bob={0} moods={OPEN} look={[0, 0]} />}
            {t >= baby && <Actor a={A.polyp} t={t} x={540} y={980} w={520} enter={baby} bob={4} moods={OPEN} look={[0, -0.3]} />}
            <Pop t={t} at={baby + 0.05} x={540} y={430}><Chip text="BABY AGAIN" size={64} bg="#ff9ecb" /></Pop>
          </Cam>
          <Rewind t={t} on={t > c("jelly2", 11) && t < baby} />
        </>
      );
    },
  },
  /* "and starts its whole life over." the baby grows back up */
  {
    at: c("jelly2", 16),
    render: ({ t, u }) => {
      const grow = c("jelly2", 20);
      return (
        <Cam t={t} z={1.05}>
          <Backdrop src={BG.deep} t={t} flip />
          {t < grow && <Actor a={A.polyp} t={t} x={540} y={980} w={lerp(520, 600, ease(u, 0, 0.6))} bob={4} moods={OPEN} look={[0, -0.3]} />}
          {t >= grow && <Actor a={A.jelly} t={t} x={540} y={880} w={640} enter={grow} bob={14} bobRate={0.6} moods={OPEN} look={[0, 0.2]} />}
        </Cam>
      );
    },
  },
  /* "And then it can do it again. And again." */
  {
    at: c("jelly3", 0),
    transition: "whip",
    render: ({ t }) => {
      const flips = [c("jelly3", 4), c("jelly3", 8)];
      const n = flips.filter((f) => t >= f).length;
      const baby = n === 1;
      return (
        <>
          <Cam t={t} z={1.05 + 0.04 * n}>
            <Backdrop src={BG.deep} t={t} />
            {baby ? <Actor a={A.polyp} t={t} x={540} y={980} w={520} enter={flips[0]} bob={4} moods={OPEN} look={[0, -0.3]} />
              : <Actor a={A.jelly} t={t} x={540} y={900} w={620} enter={n ? flips[1] : undefined} bob={12} bobRate={0.6} moods={OPEN} look={[0, 0.2]} />}
            {n > 0 && <Pop t={t} at={flips[n - 1]} x={540} y={420}><Chip text={`LIFE #${n + 1}`} size={66} bg="#ffd400" /></Pop>}
          </Cam>
          <Rewind t={t} on={flips.some((f) => t > f - 0.35 && t < f)} />
        </>
      );
    },
  },

  /* #2 THE GREENLAND SHARK */
  {
    at: c("shark1", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.05 + 0.06 * ease(u, 0, 1.4)}>
        <Backdrop src={BG.arctic} t={t} />
        <Actor a={A.shark} t={t} x={lerp(1500, 540, ease(u, 0, 1.2))} y={1000} w={1100} bob={10} bobRate={0.4} moods={OPEN} look={[-0.4, 0]} />
        <Pop t={t} at={c("shark1", 2)} x={540} y={420}><Chip text="GREENLAND SHARK" size={62} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "Scientists dated one at around 400 years old." */
  {
    at: c("shark2", 0),
    render: ({ t }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={BG.arctic} t={t} flip />
        <PhotoPerson id="sci" t={t} poses={[[-99, BODY["sci-clipboard"]]]} x={290} y={1880} h={1150} look={SCI} faces={[[-99, "curious"], [c("shark2", 5), "shocked"]]} gaze={[0.6, -0.2]} shadow={false} />
        <Actor a={A.sharkHead} t={t} x={760} y={1060} w={620} bob={6} bobRate={0.4} moods={OPEN} look={[-0.5, 0]} />
        <Pop t={t} at={c("shark2", 4)} x={760} y={520}><Calendar n={Math.round(lerp(1, 400, ease(t, c("shark2", 5), c("shark2", 7))))} label="YEARS" /></Pop>
      </Cam>
    ),
  },
  /* "It was probably alive before the United States even existed." */
  {
    at: c("shark2", 8),
    transition: "zoom",
    render: ({ t }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={BG.arctic} t={t} />
        <Actor a={A.shark} t={t} x={540} y={1250} w={1000} bob={8} bobRate={0.4} moods={[[-99, "open"]]} look={[-0.2, -0.3]} />
        <Pop t={t} at={c("shark2", 11)} x={300} y={520}><Chip text="BORN ~1620" size={58} bg="#ffd400" /></Pop>
        <Pop t={t} at={c("shark2", 15)} x={760} y={720}><Chip text="USA: 1776" size={58} /></Pop>
        <Pop t={t} at={c("shark2", 15) + 0.1} x={520} y={620}><Arrow t={t} at={c("shark2", 15) + 0.1} rot={20} size={130} /></Pop>
      </Cam>
    ),
  },
  /* "It grows about one centimeter a year," */
  {
    at: c("shark3", 0),
    render: ({ t }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={BG.arctic} t={t} flip />
        <Actor a={A.shark} t={t} x={540} y={1000} w={1000} bob={6} bobRate={0.3} moods={[[-99, "closed"]]} />
        <Zzz t={t} x={360} y={820} size={60} />
        <Pop t={t} at={c("shark3", 3)} x={540} y={1450}><Ruler k={ease(t, c("shark3", 3), c("shark3", 7)) * 0.08} /></Pop>
        <Pop t={t} at={c("shark3", 4)} x={540} y={560}><Chip text="1 CM / YEAR" size={62} /></Pop>
      </Cam>
    ),
  },
  /* "and it isn't even an adult until it's around 150." */
  {
    at: c("shark3", 7),
    transition: "whip",
    render: ({ t }) => (
      <Cam t={t} z={1.06}>
        <Backdrop src={BG.arctic} t={t} />
        <Actor a={A.sharkHead} t={t} x={540} y={1000} w={760} bob={6} bobRate={0.4} moods={OPEN} look={[0, 0.1]} />
        <Pop t={t} at={c("shark3", 12)} x={540} y={470}><Chip text="ADULT AT..." size={62} /></Pop>
        <Pop t={t} at={c("shark3", 16)} x={540} y={1600}><Calendar n={150} label="YEARS" /></Pop>
      </Cam>
    ),
  },

  /* #3 JONATHAN THE TORTOISE */
  {
    at: c("tort1", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.04 + 0.06 * ease(u, 0, 1.8)}>
        <Backdrop src={BG.island} t={t} />
        <Actor a={A.tortoise} t={t} x={lerp(-300, 540, ease(u, 0, 1.6))} y={1250} w={900} bob={3} bobRate={0.8} moods={OPEN} look={[0.6, 0]} />
        <Pop t={t} at={c("tort1", 1) + 0.05} x={540} y={420}><Chip text="JONATHAN" size={72} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "He hatched around 1832," */
  {
    at: c("tort2", 0),
    render: ({ t }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.island} t={t} flip />
        <Actor a={A.tortoise} t={t} x={540} y={1300} w={880} bob={2} moods={OPEN} look={[0.4, -0.2]} />
        <Pop t={t} at={c("tort2", 2)} x={540} y={600}><Calendar n={Math.round(lerp(2026, 1832, ease(t, c("tort2", 3), c("tort2", 3) + 0.6)))} label="HATCHED" /></Pop>
      </Cam>
    ),
  },
  /* "before anyone had ever taken a photo of a person." */
  {
    at: c("tort2", 4),
    transition: "zoom",
    render: ({ t }) => {
      const flash = bell(t, c("tort2", 8), c("tort2", 8) + 0.25);
      return (
        <>
          <Cam t={t} z={1.04}>
            <Backdrop src={BG.island} t={t} />
            <Actor a={A.camera} t={t} x={300} y={1150} w={380} bob={0} />
            <Actor a={A.tortoise} t={t} x={720} y={1350} w={620} bob={2} moods={OPEN} look={[-0.6, -0.2]} />
            <Pop t={t} at={c("tort2", 10)} x={300} y={1050}><RedX t={t} at={c("tort2", 10)} size={360} /></Pop>
            <Pop t={t} at={c("tort2", 10) + 0.1} x={720} y={560}><Chip text="NO PHOTOS YET" size={56} /></Pop>
          </Cam>
          <AbsoluteFill style={{ background: "#fff", opacity: 0.8 * flash }} />
        </>
      );
    },
  },
  /* "He's about 190 years old now," the cake */
  {
    at: c("tort3", 0),
    transition: "whip",
    render: ({ t }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.island} t={t} flip />
        <Actor a={A.cake} t={t} x={720} y={1180} w={520} enter={c("tort3", 1)} bob={0} />
        <Actor a={A.tortoise} t={t} x={330} y={1380} w={640} bob={2} moods={[[-99, "open"], [c("tort3", 2), "wide"]]} look={[0.7, -0.2]} />
        <Pop t={t} at={c("tort3", 2)} x={720} y={560}><Chip text="190!" size={96} bg="#ff9ecb" /></Pop>
      </Cam>
    ),
  },
  /* "the oldest known land animal alive." */
  {
    at: c("tort3", 6),
    render: ({ t, u }) => (
      <Cam t={t} z={1.6 + 0.15 * ease(u, 0, 1.4)} y={860}>
        <Backdrop src={BG.island} t={t} blur={3} />
        <Actor a={A.tortoiseFace} t={t} x={540} y={960} w={760} bob={0} moods={OPEN} look={[0, 0]} />
        <Pop t={t} at={c("tort3", 8)} x={540} y={560}><Chip text="OLDEST ON LAND" size={44} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "And he's still going." the Reaper, still waiting; it loops to the hook */
  {
    at: c("tort3", 12),
    transition: "zoom",
    render: ({ t, u }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.island} t={t} />
        <Actor a={A.reaper} t={t} x={780} y={1040} w={420} bob={2} moods={[[-99, "sad"]]} look={[-0.6, 0.4]} />
        <Actor a={A.tortoise} t={t} x={lerp(420, 520, ease(u, 0, 1.4))} y={1350} w={620} bob={3} bobRate={0.8} moods={OPEN} look={[0.6, 0]} />
        <Pop t={t} at={c("tort3", 14)} x={780} y={560}><Clock t={t} size={200} spin={3} fill={0.95} /></Pop>
      </Cam>
    ),
  },
];

/* ------------------------------------------------------------ the short */

export const ForeverShort: React.FC<{ audio?: string | null; captions?: boolean; logo?: string; brand?: string }> = ({ audio = "audio/pins-forever-mix.mp3", captions = true, logo, brand }) => {
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

export const ForeverThumb: React.FC = () => {
  loadPinsFonts();
  const t = 1;
  return (
    <AbsoluteFill style={{ background: "#0b2a4d" }}>
      <Backdrop src={BG.island} t={0} />
      <Actor a={A.reaper} t={t} x={820} y={1150} w={460} bob={0} moods={[[-99, "sad"]]} look={[-0.6, 0.4]} />
      <Actor a={A.cake} t={t} x={300} y={1250} w={420} bob={0} />
      <Actor a={A.tortoise} t={t} x={480} y={1560} w={760} bob={0} moods={OPEN} look={[0.6, -0.2]} />
      <div style={{ position: "absolute", left: 50, right: 50, top: 170, textAlign: "center", fontFamily: "Anton", fontSize: 160, lineHeight: 1,
        color: "#ff7a14", WebkitTextStroke: "16px #1b0f05", paintOrder: "stroke fill", textTransform: "uppercase", filter: "drop-shadow(0 8px 2px rgba(0,0,0,0.55))" }}>
        They don't<br /><span style={{ color: "#fff" }}>die?!</span>
      </div>
    </AbsoluteFill>
  );
};
