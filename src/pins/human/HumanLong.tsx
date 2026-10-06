import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import {
  Actor, Arrow, Backdrop, Bubble, Cam, Chip, Current, Heart, Mark, Mood, Pop, Punch, Shot, ShotPlayer, Stage, Timing,
  WordCaption, Zzz, bell, cue, ease, hitsFromScript, lerp, loadPinsFonts, useT,
} from "../engine";
import { HeadLook, PhotoPerson } from "../people";
import { BODY } from "../bodies";
import { ASSETS as TALK } from "../talk/assets";
import { ASSETS as SLEEP } from "../sleep/assets";
import { ASSETS as ROB } from "../rob/assets";
import TIMING from "./timing.json";
import SCRIPT from "./script.json";

/**
 * A 16:9 long-form test in the Pins style: "animals that act like humans".
 * The same engine, cutouts and people as the Shorts, drawn into a 1920×1080
 * stage (Stage.Provider), with four new landscape backdrops. Hook: ding, the
 * riser peaking on "think", then Koshik's "ANNYEONG!" in the held beat.
 */

const T = TIMING as Timing;
export const HUMAN_FPS = 30;
export const HUMAN_FRAMES = Math.ceil(T.duration * HUMAN_FPS);
const SW = 1920, SH = 1080;

const c = (id: string, i = 0) => cue(T, id, i);
const OPEN: [number, Mood][] = [[-99, "open"]];
const SLEEPY: [number, Mood][] = [[-99, "closed"]];
const BG = {
  sea: "images/pins-human-ai/bg-sea-wide.jpg",
  temple: "images/pins-human-ai/bg-temple-wide.jpg",
  zoo: "images/pins-human-ai/bg-zoo-wide.jpg",
  village: "images/pins-human-ai/bg-village-wide.jpg",
};
const PAYOFF = c("hook", 9) + (T.lines[0].words[9][2] - T.lines[0].words[9][1]) + 0.03;

const HITS = [...hitsFromScript(T, SCRIPT as never, [["hook", 0], ["hook", 3], ["hook", 5], ["hook", 7], ["otter1", 0], ["monkey1", 0], ["koshik1", 2], ["guide1", 0]],
  ["whoosh", "riser", "tiptoe", "wings", "bees"]), PAYOFF].sort((a, b) => a - b);

const KEEPER: HeadLook = { hair: "cap", hat: "#2e6b45", skin: "#e2b08a", hairColor: "#2b1a10", beard: "stubble" };
const HUNTER: HeadLook = { hair: "short", skin: "#6e4329", hairColor: "#16100b", beard: "stubble" };
const WOMAN: HeadLook = { hair: "ponytail", skin: "#d9a07a", hairColor: "#1e1410" };

/** a $ meter that fills */
const Meter: React.FC<{ k: number }> = ({ k }) => (
  <div style={{ position: "absolute", left: -60, top: -220, width: 120, height: 440, borderRadius: 26, background: "#fff", border: "7px solid #111", overflow: "hidden", boxShadow: "0 10px 0 rgba(0,0,0,0.3)" }}>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${k * 100}%`, background: "linear-gradient(#5be36b, #1f9b33)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 14, textAlign: "center", fontFamily: "Anton", fontSize: 76, color: "#111" }}>$</div>
  </div>
);

/* ------------------------------------------------------------ the shots (world = 1920×1080) */

const shots: Shot[] = [
  /* HOOK under the riser: otters holding hands… */
  {
    at: 0,
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.35 - 0.15 * ease(u, 0, 1)} x={960} y={600}>
        <Backdrop src={BG.sea} t={t} />
        <Actor a={SLEEP.hold} t={t} x={960} y={700} w={1500} rot={-3} bob={8} bobRate={0.7} moods={SLEEPY} />
        <Pop t={t} at={0.35} x={1000} y={560}><Heart size={150} /></Pop>
      </Cam>
    ),
  },
  /* …a monkey takes a tourist's phone… */
  {
    at: c("hook", 3),
    transition: "whip",
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.15 + 0.08 * ease(u, 0, 0.4)}>
        <Backdrop src={BG.temple} t={t} />
        <Actor a={ROB.monkey} t={t} x={lerp(800, 620, ease(u, 0, 0.3))} y={720} w={560} flip bob={0} moods={OPEN} look={[0.6, 0]} />
        <PhotoPerson id="woman" t={t} poses={[[-99, BODY["woman-reach"]]]} x={1180} y={1180} h={1000} look={WOMAN} faces={[[-99, "shocked"]]} gaze={[-0.7, 0]} />
      </Cam>
    ),
  },
  /* …a bird answers a honey hunter… */
  {
    at: c("hook", 5),
    transition: "zoom",
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.12 + 0.06 * ease(u, 0, 0.6)}>
        <Backdrop src={BG.village} t={t} />
        <PhotoPerson id="hunter" t={t} poses={[[-99, BODY["hunter-call"]]]} x={700} y={1170} h={1000} look={HUNTER} faces={[[-99, "happy"]]} gaze={[0.6, -0.4]} talk={[[c("hook", 5), c("hook", 6) + 0.3]]} />
        <Actor a={TALK.honeyguide} t={t} x={1260} y={420} w={300} bob={10} bobRate={1.6} moods={OPEN} look={[-0.7, 0.2]} />
        <Pop t={t} at={c("hook", 5) + 0.05} x={330} y={200}><Bubble text="BRRR-HM!" size={58} tail={[150, 120]} /></Pop>
        <Pop t={t} at={c("hook", 6)} x={1300} y={200}><Bubble text="CHIRP!" size={54} tail={[0, 120]} /></Pop>
      </Cam>
    ),
  },
  /* …and an elephant, the riser climbing */
  {
    at: c("hook", 7),
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.2 + 0.35 * ease(u, 0, 0.75)} x={960} y={420} shake={12 * ease(u, 0.2, 0.75)}>
        <Backdrop src={BG.zoo} t={t} blur={2} />
        <Actor a={TALK.elephant} t={t} x={960} y={760} w={760} bob={4} moods={[[-99, "open"]]} look={[0, 0.2]} />
      </Cam>
    ),
  },
  /* PAYOFF in the held beat: Koshik says hello, the keeper can't believe it */
  {
    at: PAYOFF,
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.05 + 0.04 * ease(u, 0, 1.2)}>
        <Backdrop src={BG.zoo} t={t} />
        <Actor a={TALK.elephant} t={t} x={1250} y={680} w={700} bob={5} moods={OPEN} look={[-0.6, 0.1]} />
        <PhotoPerson id="keeper" t={t} poses={[[-99, BODY["keeper-shock"]]]} x={560} y={1190} h={1000} look={KEEPER} faces={[[-99, "shocked"]]} gaze={[0.6, -0.2]} />
        <Pop t={t} at={PAYOFF + 0.06} x={1260} y={150}><Bubble text="ANNYEONG!" sub="hello" size={78} tail={[-20, 150]} /></Pop>
        <Pop t={t} at={PAYOFF + 0.35} x={340} y={240}><Mark text="?!" size={150} /></Pop>
      </Cam>
    ),
  },

  /* TEASE: three panels, one per phrase */
  {
    at: c("tease", 0),
    transition: "whip",
    reframes: false,
    render: ({ t }) => {
      const panel = (i: number, at: number, child: React.ReactNode, label: string) => {
        const k = ease(t, at, at + 0.22);
        return (
          <div key={i} style={{ position: "absolute", left: (SW / 3) * i, top: 0, width: SW / 3, height: SH, overflow: "hidden", transform: `translateY(${(1 - k) * SH}px)` }}>
            <div style={{ position: "absolute", left: -(SW / 3) * i, top: 0, width: SW, height: SH }}>{child}</div>
            <div style={{ position: "absolute", left: SW / 6, top: 110 }}><Chip text={label} size={50} bg="#ffd400" /></div>
          </div>
        );
      };
      return (
        <AbsoluteFill style={{ background: "#111" }}>
          {panel(0, c("tease", 0), <><Backdrop src={BG.sea} t={t} /><Actor a={SLEEP.hold} t={t} x={320} y={620} w={760} bob={6} moods={SLEEPY} /></>, "HOLD HANDS")}
          {panel(1, c("tease", 3), <><Backdrop src={BG.temple} t={t} /><Actor a={ROB.monkeyGlasses} t={t} x={960} y={640} w={620} bob={4} /></>, "ROB TOURISTS")}
          {panel(2, c("tease", 6), <><Backdrop src={BG.zoo} t={t} /><Actor a={TALK.elephant} t={t} x={1600} y={640} w={480} bob={4} moods={OPEN} look={[0, 0.2]} /></>, "TALK")}
          {[1, 2].map((i) => <div key={i} style={{ position: "absolute", left: (SW / 3) * i - 6, top: 0, width: 12, height: SH, background: "#fff" }} />)}
        </AbsoluteFill>
      );
    },
  },

  /* #1 SEA OTTERS */
  {
    at: c("otter1", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.04 + 0.08 * ease(u, 0, 1.4)}>
        <Backdrop src={BG.sea} t={t} />
        <Actor a={SLEEP.otter} t={t} x={960} y={720} w={1100} rot={-3} bob={10} bobRate={0.7} enter={c("otter1", 0)} enterFrom={[1200, 0]} moods={OPEN} look={[-0.3, 0.2]} />
        <Pop t={t} at={c("otter1", 1)} x={960} y={160}><Chip text="SEA OTTERS" size={66} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "When they sleep, they hold hands," */
  {
    at: c("otter2", 0),
    render: ({ t, u }) => (
      <Cam t={t} z={1.1 + 0.15 * ease(u, 0, 2)} x={960} y={560}>
        <Backdrop src={BG.sea} t={t} flip />
        <Actor a={SLEEP.hold} t={t} x={960} y={700} w={1400} rot={-3} bob={9} bobRate={0.7} moods={[[-99, "open"], [c("otter2", 2), "closed"]]} />
        <Pop t={t} at={c("otter2", 5)} x={1000} y={520}><Heart size={160} /></Pop>
        <Zzz t={t} x={700} y={420} size={60} from={c("otter2", 2)} />
      </Cam>
    ),
  },
  /* "so the current can't pull them apart." */
  {
    at: c("otter2", 6),
    render: ({ t }) => (
      <Cam t={t} z={1.02}>
        <Backdrop src={BG.sea} t={t} />
        <Current t={t} x={200} y={900} w={1500} dir={1} />
        <Current t={t + 0.5} x={400} y={980} w={1200} dir={1} opacity={0.7} />
        <Actor a={SLEEP.hold} t={t} x={960 + Math.sin(t * 2) * 20} y={680} w={1200} rot={-3 + Math.sin(t * 2) * 2} bob={8} moods={SLEEPY} />
        <Pop t={t} at={c("otter2", 9)} x={960} y={200}><Chip text="NO DRIFTING" size={60} /></Pop>
      </Cam>
    ),
  },
  /* "Some even wrap themselves in kelp, like a blanket." */
  {
    at: c("otter3", 0),
    transition: "zoom",
    render: ({ t, u }) => (
      <Cam t={t} z={1.05 + 0.12 * ease(u, 0, 2.6)}>
        <Backdrop src={BG.sea} t={t} />
        <Actor a={SLEEP.otterKelp} t={t} x={960} y={700} w={1250} rot={-3} bob={9} bobRate={0.8} moods={SLEEPY} />
        <Pop t={t} at={c("otter3", 5)} x={1400} y={260}><Chip text="KELP BLANKET" size={56} bg="#9bd13a" /></Pop>
      </Cam>
    ),
  },
  /* "And the pups just nap on mom's belly." */
  {
    at: c("otter3", 9),
    render: ({ t, u }) => (
      <Cam t={t} z={1.05 + 0.1 * ease(u, 0, 1.6)}>
        <Backdrop src={BG.sea} t={t} flip />
        <Actor a={SLEEP.pup} t={t} x={960} y={680} w={1300} rot={-3} bob={9} bobRate={0.7} look={[0.4, 0.5]} />
        <Pop t={t} at={c("otter3", 16)} x={760} y={420}><Heart size={130} /></Pop>
      </Cam>
    ),
  },

  /* #2 THE MONKEYS */
  {
    at: c("monkey1", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.04 + 0.08 * ease(u, 0, 2)}>
        <Backdrop src={BG.temple} t={t} />
        <Actor a={ROB.monkey} t={t} x={960} y={700} w={760} enter={c("monkey1", 2)} enterFrom={[0, 700]} bob={4} moods={OPEN} look={[0, 0.2]} />
        <Pop t={t} at={c("monkey1", 7)} x={960} y={150}><Chip text="BALI" size={72} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "They snatch phones, glasses and hats right out of tourists' hands." */
  {
    at: c("monkey2", 0),
    render: ({ t }) => {
      const grab = c("monkey2", 2);
      return (
        <Cam t={t} z={1.04}>
          <Backdrop src={BG.temple} t={t} flip />
          <PhotoPerson id="woman" t={t} poses={[[-99, BODY["woman-phone"]], [grab, BODY["woman-shock"]]]} x={620} y={1180} h={1000} look={WOMAN}
            faces={[[-99, "happy"], [grab, "shocked"]]} gaze={[0.6, -0.1]} />
          <Actor a={ROB.monkey} t={t} x={lerp(1900, 1300, ease(t, c("monkey2", 0), grab))} y={760} w={520} bob={0} moods={OPEN} look={[-0.6, 0]} />
        </Cam>
      );
    },
  },
  {
    at: c("monkey2", 3),
    transition: "zoom",
    render: ({ t }) => (
      <Cam t={t} z={1.08}>
        <Backdrop src={BG.temple} t={t} />
        <Actor a={ROB.monkeyGlasses} t={t} x={960} y={640} w={780} bob={3} />
        <Pop t={t} at={c("monkey2", 3) + 0.05} x={1480} y={300}><Chip text="GLASSES" size={56} /></Pop>
        <Pop t={t} at={c("monkey2", 5)} x={1480} y={420}><Chip text="HATS" size={56} /></Pop>
        <Pop t={t} at={c("monkey2", 9)} x={1480} y={540}><Chip text="PHONES" size={56} /></Pop>
      </Cam>
    ),
  },
  /* "Then they wait, and only trade them back for food." */
  {
    at: c("monkey3", 0),
    transition: "whip",
    render: ({ t }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={BG.temple} t={t} flip />
        <Actor a={ROB.monkey} t={t} x={560} y={760} w={560} flip bob={3} moods={[[-99, "open"], [c("monkey3", 9), "wide"]]} look={[0.4, -0.3]} />
        <PhotoPerson id="woman" t={t} poses={[[-99, BODY["woman-reach"]]]} x={1250} y={1180} h={1000} look={WOMAN} faces={[[-99, "worried"]]} gaze={[-0.6, 0]} />
        <Pop t={t} at={c("monkey3", 8)} x={900} y={520}><Actor a={ROB.fruit} t={t} x={0} y={0} w={200} bob={0} /></Pop>
        <Pop t={t} at={c("monkey3", 9)} x={960} y={140}><Chip text="DEAL" size={72} bg="#5be36b" /></Pop>
      </Cam>
    ),
  },
  /* "And the more valuable the thing they took, the bigger the snack they hold out for." */
  {
    at: c("monkey4", 0),
    render: ({ t }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={BG.temple} t={t} />
        <Actor a={ROB.monkeyGlasses} t={t} x={760} y={620} w={760} bob={3} />
        <Pop t={t} at={c("monkey4", 2)} x={1450} y={560}><Meter k={ease(t, c("monkey4", 3), c("monkey4", 15)) * 0.95} /></Pop>
        {[0, 1, 2].map((i) => <Actor key={i} a={ROB.fruit} t={t} x={560 + i * 220} y={960} w={220} enter={c("monkey4", 9) + i * 0.2} bob={0} />)}
      </Cam>
    ),
  },

  /* #3 KOSHIK */
  {
    at: c("koshik1", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.04 + 0.06 * ease(u, 0, 2.5)}>
        <Backdrop src={BG.zoo} t={t} />
        <Actor a={TALK.elephant} t={t} x={960} y={620} w={760} enter={c("koshik1", 2)} bob={5} moods={OPEN} look={[0, 0.2]} />
        <Pop t={t} at={c("koshik1", 2) + 0.1} x={960} y={130}><Chip text="KOSHIK" size={72} bg="#ffd400" /></Pop>
        <Pop t={t} at={c("koshik1", 9)} x={1500} y={280}><Chip text="SOUTH KOREA" size={52} /></Pop>
      </Cam>
    ),
  },
  /* "He learned to say five Korean words," */
  {
    at: c("koshik2", 0),
    render: ({ t }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={BG.zoo} t={t} flip />
        <Actor a={TALK.elephant} t={t} x={1280} y={620} w={700} bob={5} moods={OPEN} look={[-0.6, 0.1]} />
        <PhotoPerson id="keeper" t={t} poses={[[-99, BODY["keeper-talk"]]]} x={560} y={1190} h={1000} look={KEEPER} faces={[[-99, "happy"]]} gaze={[0.6, -0.1]} />
        <Pop t={t} at={c("koshik2", 4)} x={960} y={130}><Chip text="5 KOREAN WORDS" size={60} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "like hello and no," */
  {
    at: c("koshik2", 7),
    transition: "zoom",
    render: ({ t }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={BG.zoo} t={t} />
        <Actor a={TALK.elephant} t={t} x={960} y={640} w={700} bob={5} moods={OPEN} look={[0, 0.2]} />
        <Pop t={t} at={c("koshik2", 8)} x={520} y={260}><Bubble text="ANNYEONG!" sub="hello" size={60} tail={[160, 130]} /></Pop>
        <Pop t={t} at={c("koshik2", 10)} x={1420} y={300}><Bubble text="ANIYA!" sub="no" size={60} tail={[-140, 120]} /></Pop>
      </Cam>
    ),
  },
  /* "by putting his trunk in his mouth." */
  {
    at: c("koshik2", 11),
    render: ({ t, u }) => (
      <Cam t={t} z={1.1 + 0.1 * ease(u, 0, 1.4)} y={520}>
        <Backdrop src={BG.zoo} t={t} blur={3} />
        <Actor a={TALK.elephantTrunk} t={t} x={960} y={600} w={760} bob={3} moods={OPEN} look={[-0.4, 0.3]} />
        <Pop t={t} at={c("koshik2", 14)} x={1300} y={640}><Arrow t={t} at={c("koshik2", 14)} rot={180} size={170} /></Pop>
      </Cam>
    ),
  },

  /* #4 THE HONEYGUIDE */
  {
    at: c("guide1", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.04 + 0.08 * ease(u, 0, 2)}>
        <Backdrop src={BG.village} t={t} />
        <Actor a={TALK.honeyguide} t={t} x={960} y={560} w={460} enter={c("guide1", 2)} enterFrom={[900, -400]} bob={10} bobRate={1.6} moods={OPEN} look={[0, 0.2]} />
        <Pop t={t} at={c("guide1", 2) + 0.1} x={960} y={130}><Chip text="HONEYGUIDE" size={66} bg="#ffd400" /></Pop>
        <Pop t={t} at={c("guide1", 7)} x={1500} y={280}><Chip text="MOZAMBIQUE" size={52} /></Pop>
      </Cam>
    ),
  },
  /* "When honey hunters call out to it, it answers," */
  {
    at: c("guide2", 0),
    render: ({ t }) => (
      <Cam t={t} z={1.06}>
        <Backdrop src={BG.village} t={t} flip />
        <PhotoPerson id="hunter" t={t} poses={[[-99, BODY["hunter-stand"]], [c("guide2", 3), BODY["hunter-call"]]]} x={640} y={1170} h={1000} look={HUNTER}
          faces={[[-99, "neutral"], [c("guide2", 3), "happy"]]} gaze={[0.6, -0.4]} talk={[[c("guide2", 3), c("guide2", 5)]]} />
        <Actor a={TALK.honeyguide} t={t} x={1350} y={420} w={320} bob={10} bobRate={1.6} moods={OPEN} look={[-0.7, 0.2]} />
        <Pop t={t} at={c("guide2", 3)} x={260} y={200}><Bubble text="BRRR-HM!" size={58} tail={[150, 120]} /></Pop>
        <Pop t={t} at={c("guide2", 8)} x={1380} y={180}><Bubble text="CHIRP!" size={54} tail={[0, 120]} /></Pop>
      </Cam>
    ),
  },
  /* "flies ahead, and leads them straight to a wild beehive." */
  {
    at: c("guide2", 9),
    transition: "whip",
    render: ({ t, u }) => {
      const k = ease(u, 0, 2.2);
      return (
        <Cam t={t} z={1.0}>
          <Backdrop src={BG.village} t={t} />
          <Actor a={TALK.honeyguideFly} t={t} x={lerp(700, 1500, k)} y={lerp(380, 300, k)} w={360} bob={14} bobRate={2.2} moods={OPEN} rot={Math.sin(t * 6) * 6} />
          <PhotoPerson id="hunter" t={t} poses={[[-99, BODY["hunter-walk"]]]} x={lerp(380, 860, k)} y={1150} h={940} look={HUNTER} faces={[[-99, "happy"]]} gaze={[0.6, -0.4]} walk={1.6} />
          <Pop t={t} at={c("guide2", 17)} x={1600} y={720}><Actor a={TALK.honeycomb} t={t} x={0} y={0} w={300} bob={0} /></Pop>
          <Pop t={t} at={c("guide2", 12)} x={1200} y={560}><Arrow t={t} at={c("guide2", 12)} rot={0} size={170} /></Pop>
        </Cam>
      );
    },
  },
  /* "The hunters take the honey, and the bird gets the wax." */
  {
    at: c("guide3", 0),
    render: ({ t }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={BG.village} t={t} flip />
        <PhotoPerson id="hunter" t={t} poses={[[-99, BODY["hunter-honey"]]]} x={700} y={1170} h={1000} look={HUNTER} faces={[[-99, "happy"]]} gaze={[0.6, -0.3]} />
        <Actor a={TALK.honeyguide} t={t} x={1350} y={560} w={320} bob={10} bobRate={1.6} moods={OPEN} look={[-0.5, 0.3]} />
        <Pop t={t} at={c("guide3", 4)} x={700} y={160}><Chip text="HONEY" size={56} bg="#ffd400" /></Pop>
        <Pop t={t} at={c("guide3", 10)} x={1350} y={300}><Chip text="WAX" size={56} /></Pop>
        <Pop t={t} at={c("guide3", 10) + 0.15} x={1100} y={420}><Heart size={120} /></Pop>
      </Cam>
    ),
  },
  /* "And that's not even the strangest one." */
  {
    at: c("outro", 0),
    transition: "zoom",
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.15 - 0.15 * ease(u, 0, 1.6)} shake={6 * bell(u, 1.2, 1.6)}>
        <Backdrop src={BG.zoo} t={t} blur={4} tone="rgba(0,0,0,0.35)" />
        <Actor a={SLEEP.hold} t={t} x={360} y={760} w={560} bob={6} moods={SLEEPY} />
        <Actor a={ROB.monkeyGlasses} t={t} x={820} y={720} w={460} bob={4} />
        <Actor a={TALK.elephant} t={t} x={1240} y={640} w={420} bob={4} moods={OPEN} look={[0, 0.2]} />
        <Actor a={TALK.honeyguide} t={t} x={1600} y={620} w={240} bob={8} moods={OPEN} look={[-0.3, 0.2]} />
        <Pop t={t} at={c("outro", 5)} x={960} y={220}><Mark text="?" size={220} /></Pop>
      </Cam>
    ),
  },
];

/* ------------------------------------------------------------ the video */

export const HumanLong: React.FC<{ audio?: string | null; captions?: boolean }> = ({ audio = "audio/pins-human-mix.mp3", captions = true }) => {
  loadPinsFonts();
  const t = useT();
  return (
    <Stage.Provider value={{ W: SW, H: SH }}>
      <AbsoluteFill style={{ background: "#0b2a4d" }}>
        <Punch t={t} hits={HITS} amount={0.07}><ShotPlayer shots={shots} t={t} total={T.duration} /></Punch>
        {captions && <WordCaption T={T} t={t} y={SH * 0.84} size={88} />}
        {audio && <Audio src={staticFile(audio)} />}
      </AbsoluteFill>
    </Stage.Provider>
  );
};
