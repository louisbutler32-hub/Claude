import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import {
  Actor, Arrow, Backdrop, Brand, Bubble, Cam, Chip, Clock, Heart, Mark, Mood, Pop, Punch, RedX, Shot, ShotPlayer, Timing,
  WordCaption, bell, cue, ease, hitsFromScript, lerp, loadPinsFonts, useT,
} from "../engine";
import { HeadLook, PhotoPerson } from "../people";
import { BODY } from "../bodies";
import { ASSETS, BG } from "./assets";
import TIMING from "./timing.json";
import SCRIPT from "./script.json";

/**
 * "3 animals that actually rob humans": gulls that go for the food you've
 * touched, the kea that strips cars, and the Uluwatu monkeys that hold your
 * phone to ransom. The hook is a montage under a riser that peaks as the line
 * ends, then a payoff gag in the beat the VO holds open (hold_after in
 * script.json). Every shot keys off a word in timing.json.
 */

const T = TIMING as Timing;
export const ROB_FPS = 30;
export const ROB_FRAMES = Math.ceil(T.duration * ROB_FPS);

const A = ASSETS;
const c = (id: string, i = 0) => cue(T, id, i);
const OPEN: [number, Mood][] = [[-99, "open"]];
/** the hook's payoff lands on the riser's peak, just after "humans." */
const PAYOFF = c("hook", 5) + 0.51;
const FINGER = c("hook", 5) + 0.85;

const HITS = [
  ...hitsFromScript(T, SCRIPT as never, [["hook", 0], ["hook", 2], ["hook", 4], ["kea2", 1], ["gull1", 1], ["kea1", 2], ["monkey1", 2], ["monkey3", 7]],
    ["whoosh", "riser", "rip", "tiptoe"]),
  PAYOFF, FINGER,
].sort((a, b) => a - b);

const MAN: HeadLook = { hair: "short", skin: "#e8b694", hairColor: "#5a3a1e", beard: "stubble" };
const WOMAN: HeadLook = { hair: "ponytail", skin: "#d9a07a", hairColor: "#1e1410" };
const SCI_A: HeadLook = { hair: "cap", hat: "#2f6d9a", skin: "#e2b08a", hairColor: "#3a2414", beard: "full" };
const SCI_B: HeadLook = { hair: "ponytail", skin: "#c68a63", hairColor: "#2a1a10", glasses: true };

/**
 * The payoff: the monkey snaps from sitting to its own arm thrown up, and its
 * fist is pixelated like a TV censor, the box running on up past the knuckles
 * where the finger would be. Flipped, so the arm rises on the right.
 */
const FIST = { x: 0.168, y: 0.058, w: 0.21 };   // fist centre and censor width, 0–1 of monkey-arm.png
const FlipOff: React.FC<{ t: number; at: number; x: number; y: number; w: number; sit?: { x: number; y: number; w: number } }> = ({ t, at, x, y, w, sit }) => {
  if (t < at) return sit ? <Actor a={A.monkeyGlasses} t={t} x={sit.x} y={sit.y} w={sit.w} flip bob={4} bobRate={0.8} /> : null;
  const a = A.monkeyArm, h = (w * a.h) / a.w;
  const by = Math.sin(t * 0.8 * Math.PI) * 4;
  const cw = FIST.w * w, ch = cw * 1.75;
  const fx = x + (0.5 - FIST.x) * w, fy = y + (FIST.y - 0.5) * h + by;
  const jig = Math.floor(t * 15);
  const cells = [];
  for (let gy = 0; gy < 7; gy++) for (let gx = 0; gx < 4; gx++) {
    const n = Math.abs(Math.sin((gx * 7 + gy * 13 + jig) * 12.9898) * 43758.5453) % 1;
    cells.push(<div key={`${gx}-${gy}`} style={{ position: "absolute", left: `${gx * 25}%`, top: `${(gy * 100) / 7}%`, width: "25.5%", height: `${100 / 7 + 0.5}%`,
      background: ["#c99a7a", "#b07e62", "#e0b8a0", "#8f5f48", "#d8a98c", "#a8846c"][Math.floor(n * 6)] }} />);
  }
  return (
    <>
      <Actor a={a} t={t} x={x} y={y} w={w} flip bob={4} bobRate={0.8} />
      <div style={{ position: "absolute", left: fx - cw / 2, top: fy + cw * 0.42 - ch, width: cw, height: ch, borderRadius: cw * 0.08, overflow: "hidden" }}>{cells}</div>
    </>
  );
};

/** a straw sun hat, dropped on a head */
const SunHat: React.FC<{ w?: number }> = ({ w = 300 }) => (
  <svg viewBox="0 0 100 50" style={{ position: "absolute", left: -w / 2, top: -w / 4, width: w, height: w / 2, overflow: "visible", filter: "drop-shadow(0 6px 3px rgba(0,0,0,0.35))" }}>
    <ellipse cx={50} cy={36} rx={48} ry={11} fill="#e9cf8a" stroke="#5a4520" strokeWidth={2} />
    <path d="M 28 36 Q 30 6 50 6 Q 70 6 72 36 Z" fill="#f0d996" stroke="#5a4520" strokeWidth={2} />
    <path d="M 29 30 Q 50 36 71 30 L 71.5 34 Q 50 40 28.5 34 Z" fill="#d8443a" />
  </svg>
);

/** a windscreen wiper, flung */
const Wiper: React.FC<{ len?: number }> = ({ len = 520 }) => (
  <svg viewBox="0 0 100 10" style={{ position: "absolute", left: -len / 2, top: -len / 20, width: len, height: len / 10, overflow: "visible" }}>
    <rect x={0} y={1} width={100} height={6} rx={3} fill="#1c1c1c" stroke="#fff" strokeWidth={0.6} />
    <rect x={6} y={5} width={88} height={5} rx={2} fill="#3a3a3a" stroke="#fff" strokeWidth={0.6} />
  </svg>
);

/** a dollar meter that fills */
const Meter: React.FC<{ k: number }> = ({ k }) => (
  <div style={{ position: "absolute", left: -70, top: -260, width: 140, height: 520, borderRadius: 30, background: "#fff", border: "8px solid #111", overflow: "hidden", boxShadow: "0 10px 0 rgba(0,0,0,0.3)" }}>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${k * 100}%`, background: "linear-gradient(#5be36b, #1f9b33)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 18, textAlign: "center", fontFamily: "Anton", fontSize: 90, color: "#111" }}>$</div>
  </div>
);

/* ------------------------------------------------------------ the shots */

const shots: Shot[] = [
  /* HOOK, under the riser. A gull swipes a man's chips… */
  {
    at: 0,
    reframes: false,
    render: ({ t, u }) => {
      const swoop = ease(u, 0.25, 0.7);
      const grabbed = u > 0.62;
      return (
        <Cam t={t} z={1.25 - 0.12 * ease(u, 0, 0.9)} y={980}>
          <Backdrop src={BG.beach} t={t} />
          <PhotoPerson id="man" t={t} poses={[[-99, BODY["man-chips"]], [0.62, BODY["man-shock"]]]} x={380} y={1880} h={1250} look={MAN}
            faces={[[-99, "happy"], [0.62, "shocked"]]} gaze={[0.6, -0.3]} />
          <Actor a={A.gullFly} t={t} x={lerp(1500, 520, swoop) - (grabbed ? (u - 0.62) * 1400 : 0)} y={lerp(250, 1000, swoop) - (grabbed ? (u - 0.62) * 900 : 0)} w={980}
            rot={-10} bob={0} moods={[[-99, "angry"]]} look={[-0.6, 0.4]} />
          {grabbed && <Actor a={A.chips} t={t} x={520 - (u - 0.62) * 1400} y={1080 - (u - 0.62) * 900} w={170} rot={-20} bob={0} />}
        </Cam>
      );
    },
  },
  /* …a kea strips a car… */
  {
    at: c("hook", 2),
    transition: "whip",
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.3 + 0.1 * ease(u, 0, 0.8)} x={560} y={900} shake={10 * bell(u, 0.15, 0.6)}>
        <Backdrop src={BG.carClose} t={t} />
        <Actor a={A.keaTug} t={t} x={540} y={1050} w={1250} rot={-4 + 6 * Math.sin(t * 14)} bob={0} moods={[[-99, "angry"]]} look={[0.3, 0.2]} />
      </Cam>
    ),
  },
  /* …a monkey makes off with a tourist's phone… */
  {
    at: c("hook", 4),
    transition: "zoom",
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.15 + 0.08 * ease(u, 0, 0.45)} y={980}>
        <Backdrop src={BG.templePath} t={t} />
        <Actor a={A.monkey} t={t} x={lerp(520, 330, ease(u, 0, 0.3))} y={1180} w={620} flip bob={0} moods={OPEN} look={[0.6, 0]} />
        <PhotoPerson id="woman" t={t} poses={[[-99, BODY["woman-reach"]]]} x={640} y={1880} h={1250} look={WOMAN} faces={[[-99, "shocked"]]} gaze={[-0.7, 0]} />
      </Cam>
    ),
  },
  /* …"humans." the victims, the riser still climbing */
  {
    at: c("hook", 5),
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.05 + 0.22 * ease(u, 0, 0.5)} y={760} shake={14 * ease(u, 0.1, 0.5)}>
        <Backdrop src={BG.beach} t={t} blur={2} />
        <PhotoPerson id="man" t={t} poses={[[-99, BODY["man-shock"]]]} x={300} y={1820} h={1250} look={MAN} faces={[[-99, "shocked"]]} gaze={[0.3, -0.2]} />
        <PhotoPerson id="woman" t={t} poses={[[-99, BODY["woman-shock"]]]} x={780} y={1840} h={1200} look={WOMAN} faces={[[-99, "shocked"]]} gaze={[-0.3, -0.2]} />
        <Pop t={t} at={c("hook", 5) + 0.05} x={540} y={300}><Mark text="!" size={170} /></Pop>
      </Cam>
    ),
  },
  /* PAYOFF on the riser's peak: the monkey in her stolen shades flips her off */
  {
    at: PAYOFF,
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.1 + 0.04 * ease(u, 0, 1.2)} y={980}>
        <Backdrop src={BG.temple} t={t} />
        <FlipOff t={t} at={FINGER - 0.1} x={520} y={1100} w={900} sit={{ x: 560, y: 1110, w: 860 }} />
        <PhotoPerson id="woman" t={t} poses={[[-99, BODY["woman-shock"]]]} x={150} y={2080} h={1150} look={WOMAN} faces={[[-99, "shocked"]]} gaze={[0.6, -0.3]} />
        <Pop t={t} at={PAYOFF + 0.08} x={270} y={620}><Bubble text="HEY!" size={80} tail={[-30, 160]} /></Pop>
      </Cam>
    ),
  },

  /* #1 GULLS: "First, seagulls." */
  {
    at: c("gull1", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.06 + 0.1 * ease(u, 0, 1.5)} y={1000}>
        <Backdrop src={BG.beach} t={t} />
        <Actor a={A.gull} t={t} x={560} y={1150} w={560} enter={c("gull1", 0)} enterFrom={[0, 700]} bob={4} moods={OPEN} look={[-0.4, 0.1]} />
      </Cam>
    ),
  },
  /* "They don't just grab any food." */
  {
    at: c("gull1", 2),
    render: ({ t, u }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.beach} t={t} flip />
        <Actor a={A.chips} t={t} x={300} y={1300} w={220} rot={-8} bob={4} />
        <Actor a={A.fruit} t={t} x={760} y={1320} w={260} bob={4} />
        <Actor a={A.gullFly} t={t} x={lerp(1300, 540, ease(u, 0, 0.6))} y={lerp(380, 640, ease(u, 0, 0.6))} w={760} rot={-6} bob={10} moods={OPEN} look={[0, 0.6]} />
        <Pop t={t} at={c("gull1", 6)} x={540} y={980}><Mark text="?" size={140} /></Pop>
      </Cam>
    ),
  },
  /* "In one experiment," */
  {
    at: c("gull2", 0),
    transition: "zoom",
    render: ({ t }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.beach} t={t} />
        <PhotoPerson id="sciB" t={t} poses={[[-99, BODY["sci-clipboard"]]]} x={320} y={1840} h={1180} look={SCI_B} faces={[[-99, "curious"]]} gaze={[0.6, 0]} />
        <Actor a={A.gull} t={t} x={780} y={1300} w={420} bob={4} moods={OPEN} look={[-0.6, 0]} />
        <Pop t={t} at={c("gull2", 2)} x={540} y={420}><Chip text="EXPERIMENT" size={68} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "gulls watched a person pick up one of two snacks," */
  {
    at: c("gull2", 3),
    render: ({ t }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.beach} t={t} flip />
        <PhotoPerson id="man" t={t} poses={[[-99, BODY["man-chips"]]]} x={300} y={1860} h={1200} look={MAN} faces={[[-99, "happy"]]} gaze={[0.2, 0.2]} />
        <Actor a={A.chips} t={t} x={660} y={1640} w={170} bob={0} />
        <Actor a={A.gull} t={t} x={880} y={1420} w={360} bob={4} moods={[[-99, "open"], [c("gull2", 7), "wide"]]} look={[-0.9, 0.2]} />
        <Pop t={t} at={c("gull2", 7)} x={460} y={760}><Arrow t={t} at={c("gull2", 7)} rot={200} size={150} /></Pop>
        <Pop t={t} at={c("gull2", 11)} x={760} y={1000}><Chip text="2 SNACKS" size={56} /></Pop>
      </Cam>
    ),
  },
  /* "and they went straight for the one the human had touched." */
  {
    at: c("gull2", 13),
    transition: "whip",
    render: ({ t, u }) => {
      const k = ease(u, 0.1, 0.8);
      return (
        <Cam t={t} z={1.1}>
          <Backdrop src={BG.beach} t={t} />
          <Actor a={A.chips} t={t} x={320} y={1350} w={240} bob={0} />
          <Actor a={A.chips} t={t} x={780} y={1350} w={240} bob={0} />
          <Actor a={A.gullFly} t={t} x={lerp(1200, 360, k)} y={lerp(300, 1050, k)} w={700} rot={lerp(-20, 10, k)} bob={0} moods={[[-99, "angry"]]} look={[-0.5, 0.6]} />
          <Pop t={t} at={c("gull2", 21)} x={320} y={1080}><Chip text="TOUCHED" size={56} bg="#ffd400" /></Pop>
          <Pop t={t} at={c("gull2", 23)} x={780} y={1350}><RedX t={t} at={c("gull2", 23)} size={260} /></Pop>
        </Cam>
      );
    },
  },
  /* "They watch what you eat, and they want that." the stare */
  {
    at: c("gull3", 0),
    render: ({ t, u }) => (
      <Cam t={t} z={2.2 + 0.25 * ease(u, 0, 1.8)} x={460} y={600}>
        <Backdrop src={BG.beach} t={t} blur={3} />
        <Actor a={A.gull} t={t} x={560} y={1300} w={900} bob={3} moods={[[-99, "open"], [c("gull3", 7), "angry"]]} look={[-0.9, 0.3]} />
      </Cam>
    ),
  },

  /* #2 KEA: "Next, the kea," */
  {
    at: c("kea1", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.05 + 0.08 * ease(u, 0, 1.2)} y={1000}>
        <Backdrop src={BG.carpark} t={t} />
        <Actor a={A.kea} t={t} x={560} y={1220} w={720} enter={c("kea1", 0)} enterFrom={[-800, 0]} bob={4} moods={OPEN} look={[0.4, 0.2]} />
        <Pop t={t} at={c("kea1", 2) + 0.05} x={560} y={430}><Chip text="KEA" size={80} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "a parrot from New Zealand." */
  {
    at: c("kea1", 3),
    render: ({ t }) => (
      <Cam t={t} z={1.02}>
        <Backdrop src={BG.carpark} t={t} flip />
        <Actor a={A.car} t={t} x={560} y={1500} w={900} flip bob={0} />
        <Actor a={A.kea} t={t} x={420} y={1240} w={300} bob={6} moods={OPEN} look={[0.6, 0]} />
        <Pop t={t} at={c("kea1", 6)} x={540} y={430}><Chip text="NEW ZEALAND" size={66} /></Pop>
      </Cam>
    ),
  },
  /* "It rips the rubber off car windows," */
  {
    at: c("kea2", 0),
    render: ({ t }) => {
      const rip = c("kea2", 1);
      return (
        <Cam t={t} z={1.2} shake={22 * bell(t, rip, rip + 0.4)}>
          <Backdrop src={BG.carClose} t={t} />
          <Actor a={A.keaTug} t={t} x={540} y={1080} w={1200} rot={-10 * bell(t, rip, rip + 0.35)} bob={0} moods={[[-99, "angry"]]} look={[0.2, 0.2]} />
        </Cam>
      );
    },
  },
  /* "pulls off windshield wipers," */
  {
    at: c("kea2", 7),
    render: ({ t, u }) => {
      const fling = ease(t, c("kea2", 8), c("kea2", 8) + 0.6);
      return (
        <Cam t={t} z={1.08}>
          <Backdrop src={BG.carClose} t={t} flip />
          <Actor a={A.kea} t={t} x={420} y={1120} w={520} bob={4} moods={[[-99, "angry"]]} look={[0.6, -0.3]} />
          <div style={{ position: "absolute", left: lerp(560, 900, fling), top: lerp(900, 380, fling), transform: `rotate(${-30 + 400 * fling}deg)` }}><Wiper /></div>
        </Cam>
      );
    },
  },
  /* "and unzips backpacks to see what's inside." */
  {
    at: c("kea2", 11),
    transition: "zoom",
    render: ({ t }) => {
      const out = (d: number) => ease(t, c("kea2", 15) + d, c("kea2", 15) + d + 0.5);
      return (
        <Cam t={t} z={1.05}>
          <Backdrop src={BG.carpark} t={t} />
          <Actor a={A.backpack} t={t} x={600} y={1400} w={520} bob={0} rot={4 * Math.sin(t * 9)} />
          <Actor a={A.kea} t={t} x={300} y={1300} w={480} bob={5} bobRate={3} moods={OPEN} look={[0.8, 0.3]} />
          <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${lerp(600, 840, out(0))}px, ${lerp(1300, 760, out(0))}px) rotate(${200 * out(0)}deg)` }}><Actor a={A.chips} t={t} x={0} y={0} w={170} bob={0} /></div>
          <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${lerp(600, 360, out(0.15))}px, ${lerp(1300, 700, out(0.15))}px) rotate(${-160 * out(0.15)}deg)` }}><Actor a={A.fruit} t={t} x={0} y={0} w={200} bob={0} /></div>
        </Cam>
      );
    },
  },
  /* "It got so bad that people built them a playground," */
  {
    at: c("kea3", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.04 + 0.08 * ease(u, 0, 2.2)} y={1000}>
        <Backdrop src={BG.playground} t={t} />
        <Actor a={A.kea} t={t} x={lerp(400, 560, ease(u, 0, 2))} y={1350} w={420} rot={8 * Math.sin(t * 3)} bob={10} bobRate={1.2} moods={OPEN} look={[0.2, -0.3]} />
        <Pop t={t} at={c("kea3", 9)} x={760} y={900}><Heart size={140} /></Pop>
      </Cam>
    ),
  },
  /* "just to keep them away from the cars." */
  {
    at: c("kea3", 10),
    render: ({ t }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={BG.carpark} t={t} flip />
        <Actor a={A.car} t={t} x={680} y={1450} w={760} bob={0} />
        <Actor a={A.kea} t={t} x={230} y={1300} w={360} flip bob={6} moods={[[-99, "sad"]]} look={[0.7, 0]} />
        <Pop t={t} at={c("kea3", 14)} x={680} y={1420}><RedX t={t} at={c("kea3", 14)} size={340} /></Pop>
      </Cam>
    ),
  },

  /* #3 THE MONKEYS: "Finally, the monkeys at Uluwatu Temple in Bali." */
  {
    at: c("monkey1", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.04 + 0.1 * ease(u, 0, 2.5)} y={980}>
        <Backdrop src={BG.temple} t={t} />
        <Actor a={A.monkey} t={t} x={560} y={1250} w={760} enter={c("monkey1", 2)} enterFrom={[0, 800]} bob={4} moods={OPEN} look={[0, 0.2]} />
        <Pop t={t} at={c("monkey1", 7)} x={560} y={420}><Chip text="BALI" size={80} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "They snatch tourists' phones," */
  {
    at: c("monkey2", 0),
    render: ({ t }) => {
      const grab = c("monkey2", 3);
      return (
        <Cam t={t} z={1.04}>
          <Backdrop src={BG.templePath} t={t} />
          <PhotoPerson id="woman" t={t} poses={[[-99, BODY["woman-phone"]], [grab, BODY["woman-shock"]]]} x={360} y={1860} h={1220} look={WOMAN}
            faces={[[-99, "happy"], [grab, "shocked"]]} gaze={[0.6, -0.1]} />
          <Actor a={A.monkey} t={t} x={lerp(1300, 820, ease(t, c("monkey2", 1), grab))} y={1350} w={560} bob={0} moods={OPEN} look={[-0.6, 0]} />
        </Cam>
      );
    },
  },
  /* "glasses and hats," the loot, worn */
  {
    at: c("monkey2", 4),
    transition: "zoom",
    render: ({ t }) => (
      <Cam t={t} z={1.15} y={900}>
        <Backdrop src={BG.temple} t={t} flip />
        <Actor a={A.monkeyGlasses} t={t} x={560} y={1150} w={980} bob={3} />
        <Pop t={t} at={c("monkey2", 6)} x={430} y={760}><SunHat w={330} /></Pop>
      </Cam>
    ),
  },
  /* "and then they wait." */
  {
    at: c("monkey2", 7),
    render: ({ t }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.temple} t={t} />
        <Actor a={A.monkey} t={t} x={680} y={1250} w={620} bob={2} moods={OPEN} look={[-0.6, 0.1]} />
        <PhotoPerson id="woman" t={t} poses={[[-99, BODY["woman-shock"]]]} x={240} y={1880} h={1150} look={WOMAN} faces={[[-99, "worried"]]} gaze={[0.6, 0]} />
        <Pop t={t} at={c("monkey2", 9)} x={800} y={560}><Clock t={t} size={220} spin={2} fill={0.3} /></Pop>
      </Cam>
    ),
  },
  /* "Because they'll only give it back for food." the trade */
  {
    at: c("monkey3", 0),
    transition: "whip",
    render: ({ t }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.templePath} t={t} flip />
        <PhotoPerson id="woman" t={t} poses={[[-99, BODY["woman-reach"]]]} x={640} y={1880} h={1200} look={WOMAN} faces={[[-99, "worried"]]} gaze={[-0.6, 0]} />
        <Pop t={t} at={c("monkey3", 6)} x={330} y={830}><Actor a={A.fruit} t={t} x={0} y={0} w={220} bob={0} /></Pop>
        <Actor a={A.monkey} t={t} x={300} y={1380} w={520} flip bob={3} moods={[[-99, "open"], [c("monkey3", 7), "wide"]]} look={[0.2, -0.6]} />
        <Pop t={t} at={c("monkey3", 7)} x={560} y={480}><Chip text="DEAL" size={80} bg="#5be36b" /></Pop>
      </Cam>
    ),
  },
  /* "And scientists found" */
  {
    at: c("monkey4", 0),
    render: ({ t }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={BG.templePath} t={t} />
        <PhotoPerson id="sciA" t={t} poses={[[-99, BODY["sci-point"]]]} x={300} y={1860} h={1180} look={SCI_A} faces={[[-99, "curious"]]} gaze={[0.6, 0]} talk={[[c("monkey4", 1), c("monkey4", 2) + 0.3]]} />
        <PhotoPerson id="sciB" t={t} poses={[[-99, BODY["sci-clipboard"]]]} x={760} y={1860} h={1140} look={SCI_B} faces={[[-99, "happy"]]} gaze={[-0.5, 0]} />
      </Cam>
    ),
  },
  /* "the more valuable the thing they steal," the meter climbs */
  {
    at: c("monkey4", 3),
    transition: "zoom",
    render: ({ t }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.temple} t={t} flip />
        <Actor a={A.monkey} t={t} x={420} y={1250} w={700} bob={2} moods={OPEN} look={[0.6, 0]} />
        <Pop t={t} at={c("monkey4", 4)} x={880} y={1000}><Meter k={ease(t, c("monkey4", 5), c("monkey4", 9) + 0.3) * 0.95} /></Pop>
      </Cam>
    ),
  },
  /* "the more food they hold out for." the pile grows; it loops to the hook */
  {
    at: c("monkey4", 10),
    render: ({ t }) => (
      <Cam t={t} z={1.08}>
        <Backdrop src={BG.temple} t={t} />
        <Actor a={A.monkeyGlasses} t={t} x={600} y={1080} w={900} bob={3} />
        {[0, 1, 2].map((i) => <Actor key={i} a={A.fruit} t={t} x={300 + i * 230} y={1550 - (i % 2) * 40} w={260} enter={c("monkey4", 11) + i * 0.18} bob={0} />)}
      </Cam>
    ),
  },
];

/* ------------------------------------------------------------ the short */

export const RobShort: React.FC<{ audio?: string | null; captions?: boolean; logo?: string; brand?: string }> = ({ audio = "audio/pins-rob-mix.mp3", captions = true, logo, brand }) => {
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

export const RobThumb: React.FC = () => {
  loadPinsFonts();
  const t = 1;
  return (
    <AbsoluteFill style={{ background: "#0b2a4d" }}>
      <Backdrop src={BG.temple} t={0} />
      <FlipOff t={t} at={0} x={460} y={1250} w={1000} />
      <div style={{ position: "absolute", left: 50, right: 50, top: 170, textAlign: "center", fontFamily: "Anton", fontSize: 150, lineHeight: 1,
        color: "#ff7a14", WebkitTextStroke: "16px #1b0f05", paintOrder: "stroke fill", textTransform: "uppercase", filter: "drop-shadow(0 8px 2px rgba(0,0,0,0.55))" }}>
        They rob<br /><span style={{ color: "#fff" }}>humans?!</span>
      </div>
    </AbsoluteFill>
  );
};

