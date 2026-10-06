import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import {
  Actor, Arrow, Backdrop, Brand, Bubble, Cam, Chip, Heart, Mark, Mood, PaintedDeep, Pop, RedX, Shot, ShotPlayer, Timing,
  WordCaption, cue, ease, lerp, loadPinsFonts, useT,
} from "../engine";
import { AboveLine, Person, PersonLook } from "../people";
import { ASSETS } from "./assets";
import TIMING from "./timing.json";

/**
 * "3 animals that can actually talk to humans": Koshik the elephant who
 * says five Korean words, the honeyguide that answers the honey hunters'
 * call, and Noc the beluga who told a diver to get out. Every shot keys off
 * a word in timing.json (built from the channel's read by
 * scripts/build-pins-audio.py talk).
 */

const T = TIMING as Timing;
export const TALK_FPS = 30;
export const TALK_FRAMES = Math.ceil(T.duration * TALK_FPS);

const IMG = "images/pins-talk/";
const A = ASSETS;
const c = (id: string, i = 0) => cue(T, id, i);
const OPEN: [number, Mood][] = [[-99, "open"]];

/* the cast */
const KEEPER: PersonLook = { hair: "cap", hat: "#2e7d4f", jacket: "#3f6e4a", shirt: "#e9e2cf", skin: "#e2b08a", hairColor: "#2b1a10", prop: "none" };
const HUNTER: PersonLook = { hair: "short", jacket: "#9a6b3c", shirt: "#e9dcc0", skin: "#7a4a2c", hairColor: "#16100b", prop: "point" };
const DIVER_A: PersonLook = { hair: "short", jacket: "#1d2228", shirt: "#1d2228", skin: "#e8b694", hairColor: "#5a3a1e", mask: true };
const DIVER_B: PersonLook = { hair: "bald", jacket: "#1d2228", shirt: "#1d2228", skin: "#a8714b", hairColor: "#1a120c", mask: true, beard: true };

/** gibberish talk drifting through the water: what the divers kept hearing */
const Murmur: React.FC<{ t: number; at: number }> = ({ t, at }) => (
  <>
    {[[300, 520, "blah blah…", 0], [780, 640, "…mmh wah?", 0.25], [420, 860, "…out…", 0.5]].map(([x, y, txt, d], i) => (
      <Pop key={i} t={t} at={at + (d as number)} x={x as number} y={y as number}>
        <div style={{ opacity: 0.85 }}><Bubble text={txt as string} size={44} tail={[i % 2 ? 60 : -60, 90]} t={t} jitter={4} color="#335" /></div>
      </Pop>
    ))}
  </>
);

/* ------------------------------------------------------------ the shots */

const shots: Shot[] = [
  /* HOOK: the elephant, saying hello */
  {
    at: 0,
    render: ({ t, u }) => (
      <Cam t={t} z={1.12 - 0.08 * ease(u, 0, 2.6)}>
        <Backdrop src={IMG + "bg-zoo.jpg"} t={t} blur={7} tone="rgba(20,30,10,0.12)" />
        <Actor a={A.elephant} t={t} x={340} y={1040} w={1100} bob={6} bobRate={0.6} moods={OPEN} look={[0.2, 0.2]} />
        <Pop t={t} at={c("hook", 4)} x={640} y={400}><Bubble text="HELLO!" size={84} tail={[60, 170]} /></Pop>
      </Cam>
    ),
  },

  /* #1 KOSHIK: "First, Koshik the elephant." */
  {
    at: c("koshik1", 0),
    render: ({ t, u }) => (
      <Cam t={t} z={1 + 0.08 * ease(u, 0, 1.6)}>
        <Backdrop src={IMG + "bg-zoo.jpg"} t={t} flip blur={7} tone="rgba(20,30,10,0.12)" />
        <Actor a={A.elephant} t={t} x={360} y={1060} w={1040} enter={c("koshik1", 0)} bob={6} bobRate={0.6} moods={OPEN} />
        <Pop t={t} at={c("koshik1", 1) + 0.1} x={540} y={420}><Chip text="KOSHIK" size={72} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "For years, his only friends at a South Korean zoo" — alone in the enclosure */
  {
    at: c("koshik1", 4),
    render: ({ t, u }) => (
      <Cam t={t} z={1.05 - 0.05 * ease(u, 0, 2.5)}>
        <Backdrop src={IMG + "bg-zoo-lonely.jpg"} t={t} />
        <Actor a={A.elephant} t={t} x={560} y={1120} w={640} bob={4} bobRate={0.4} moods={[[-99, "sad"]]} look={[-0.3, 0.3]} />
        <Pop t={t} at={c("koshik1", 11)} x={540} y={430}><Chip text="SOUTH KOREA" size={64} /></Pop>
      </Cam>
    ),
  },
  /* "were humans." — Koshik and his keeper */
  {
    at: c("koshik1", 14),
    render: ({ t, u }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={IMG + "bg-zoo.jpg"} t={t} flip blur={7} tone="rgba(20,30,10,0.12)" />
        <Actor a={A.elephant} t={t} x={580} y={1040} w={760} bob={5} bobRate={0.6} moods={[[-99, "open"]]} look={[-0.6, 0.1]} />
        <Person id="keeper" t={t} x={260} y={1500} h={760} look={KEEPER} faces={[[-99, "happy"]]} gaze={[0.6, 0]} />
        <Pop t={t} at={c("koshik1", 15)} x={470} y={560}><Heart size={150} /></Pop>
      </Cam>
    ),
  },
  /* "So he learned to speak their language." — the keeper talks, Koshik listens */
  {
    at: c("koshik2", 0),
    render: ({ t }) => (
      <Cam t={t} z={1.12} x={500}>
        <Backdrop src={IMG + "bg-zoo.jpg"} t={t} blur={7} tone="rgba(20,30,10,0.12)" />
        <Person id="keeper" t={t} x={250} y={1500} h={800} look={KEEPER} faces={[[-99, "happy"]]} gaze={[0.7, -0.1]} talk={[[c("koshik2", 0), c("koshik2", 6) + 0.3]]} />
        <Actor a={A.elephant} t={t} x={600} y={1030} w={780} bob={5} bobRate={0.6} moods={OPEN} look={[-0.7, 0]} />
        <Pop t={t} at={c("koshik2", 3)} x={330} y={520}><Bubble text="ANJA!" sub="sit down" size={70} tail={[-40, 150]} /></Pop>
      </Cam>
    ),
  },
  /* "By sticking his trunk in his mouth," — close on the trick */
  {
    at: c("koshik3", 0),
    render: ({ t, u }) => (
      <Cam t={t} z={1.55 + 0.1 * ease(u, 0, 2.5)} x={A.elephantMouth[0]} y={A.elephantMouth[1]}>
        <Backdrop src={IMG + "bg-zoo.jpg"} t={t} blur={7} tone="rgba(20,30,10,0.12)" />
        <Actor a={A.elephant} t={t} x={540} y={1060} w={1040} bob={3} bobRate={0.6} moods={OPEN} look={[0, 0.3]} />
        <Pop t={t} at={c("koshik3", 3)} x={A.elephantMouth[0] + 230} y={A.elephantMouth[1] - 40}><Arrow t={t} at={c("koshik3", 3)} rot={180} size={170} /></Pop>
      </Cam>
    ),
  },
  /* "he can say five Korean words," */
  {
    at: c("koshik3", 7),
    render: ({ t }) => (
      <Cam t={t} z={1.06}>
        <Backdrop src={IMG + "bg-zoo.jpg"} t={t} flip blur={7} tone="rgba(20,30,10,0.12)" />
        <Actor a={A.elephant} t={t} x={380} y={1080} w={980} bob={5} bobRate={0.6} moods={[[-99, "open"]]} look={[0.1, 0.2]} />
        <Pop t={t} at={c("koshik3", 10)} x={540} y={420}><Chip text="5 KOREAN WORDS" size={66} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "like hello, sit down, and no." — the words, in bubbles; the keeper can't believe it */
  {
    at: c("koshik3", 13),
    render: ({ t }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={IMG + "bg-zoo.jpg"} t={t} blur={7} tone="rgba(20,30,10,0.12)" />
        <Actor a={A.elephant} t={t} x={590} y={1060} w={760} bob={5} bobRate={0.6} moods={OPEN} look={[-0.4, 0.1]} />
        <Person id="keeper" t={t} x={230} y={1500} h={720} look={KEEPER} faces={[[-99, "happy"], [c("koshik3", 15), "shocked"]]} gaze={[0.7, -0.2]} />
        <Pop t={t} at={c("koshik3", 14)} x={700} y={360}><Bubble text="ANNYEONG!" sub="hello" size={62} tail={[60, 170]} /></Pop>
        <Pop t={t} at={c("koshik3", 15)} x={320} y={560}><Bubble text="ANJA!" sub="sit down" size={62} tail={[260, 120]} /></Pop>
        <Pop t={t} at={c("koshik3", 18)} x={760} y={650}><Bubble text="ANIYA!" sub="no" size={62} tail={[-40, 140]} /></Pop>
      </Cam>
    ),
  },

  /* #2 THE HONEYGUIDE: "Next, the honeyguide." */
  {
    at: c("guide1", 0),
    render: ({ t, u }) => (
      <Cam t={t} z={1.1 + 0.06 * ease(u, 0, 1.6)}>
        <Backdrop src={IMG + "bg-savanna.jpg"} t={t} />
        <Actor a={A.honeyguide} t={t} x={540} y={980} w={760} enter={c("guide1", 0)} bob={6} bobRate={1.4} moods={OPEN} />
        <Pop t={t} at={c("guide1", 2)} x={540} y={420}><Chip text="HONEYGUIDE" size={70} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "This bird teams up with humans to find honey." */
  {
    at: c("guide1", 3),
    render: ({ t }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={IMG + "bg-savanna.jpg"} t={t} flip />
        <Person id="hunter" t={t} x={300} y={1500} h={800} look={{ ...HUNTER, prop: "none" }} faces={[[-99, "happy"]]} gaze={[0.6, -0.3]} />
        <Actor a={A.honeyguide} t={t} x={760} y={760} w={420} bob={10} bobRate={1.6} moods={OPEN} look={[-0.6, 0.2]} />
        <Pop t={t} at={c("guide1", 5)} x={560} y={560}><Heart size={120} /></Pop>
        <Pop t={t} at={c("guide1", 11)} x={760} y={1110}><Actor a={A.honeycomb} t={t} x={0} y={0} w={300} bob={0} /></Pop>
      </Cam>
    ),
  },
  /* "When honey hunters in Africa call out brrr-hm," — the call */
  {
    at: c("guide2", 0),
    render: ({ t, u }) => (
      <Cam t={t} z={1.18 + 0.06 * ease(u, 0, 2.5)} x={430} y={980}>
        <Backdrop src={IMG + "bg-savanna.jpg"} t={t} />
        <Person id="hunter" t={t} x={420} y={1520} h={900} look={{ ...HUNTER, prop: "none" }} faces={[[-99, "neutral"], [c("guide2", 7), "happy"]]} gaze={[0.4, -0.5]}
          talk={[[c("guide2", 7), c("guide2", 7) + 0.6]]} />
        <Pop t={t} at={c("guide2", 4)} x={420} y={430}><Chip text="AFRICA" size={60} /></Pop>
        <Pop t={t} at={c("guide2", 7)} x={680} y={560}><Bubble text="BRRR-HM!" size={78} tail={[-170, 150]} /></Pop>
      </Cam>
    ),
  },
  /* "it flies over and leads them" — the bird answers and goes; the hunter follows */
  {
    at: c("guide2", 8),
    render: ({ t, u }) => {
      const k = ease(u, 0.1, 2.0);
      return (
        <Cam t={t} z={1.0}>
          <Backdrop src={IMG + "bg-savanna.jpg"} t={t} flip />
          <Actor a={A.honeyguide} t={t} x={lerp(980, 380, k)} y={lerp(520, 640, k)} w={360} bob={18} bobRate={2.2} moods={OPEN} rot={Math.sin(t * 6) * 6} />
          <Person id="hunter" t={t} x={lerp(860, 640, k)} y={1560} h={720} look={HUNTER} faces={[[-99, "happy"]]} gaze={[-0.6, -0.4]} bob={6} flip />
          <Pop t={t} at={c("guide2", 12)} x={230} y={760}><Arrow t={t} at={c("guide2", 12)} rot={180} size={170} /></Pop>
        </Cam>
      );
    },
  },
  /* "straight to a wild beehive." */
  {
    at: c("guide2", 15),
    render: ({ t, u }) => (
      <Cam t={t} z={1.05 + 0.12 * ease(u, 0, 2)} y={900}>
        <Backdrop src={IMG + "bg-tree.jpg"} t={t} />
        <Actor a={A.beehive} t={t} x={540} y={920} w={760} bob={0} enter={c("guide2", 15)} />
        <Bees t={t} x={540} y={820} />
        <Actor a={A.honeyguide} t={t} x={860} y={560} w={300} bob={8} bobRate={1.8} moods={OPEN} look={[-0.6, 0.4]} />
      </Cam>
    ),
  },
  /* "That call more than triples their chances of finding one." — 17% → 54% */
  {
    at: c("guide3", 0),
    render: ({ t }) => {
      const k = ease(t, c("guide3", 4), c("guide3", 4) + 1.2);
      return (
        <Cam t={t} z={1.0}>
          <Backdrop src={IMG + "bg-savanna.jpg"} t={t} flip blur={3} />
          <Pop t={t} at={c("guide3", 0) + 0.05} x={540} y={760}>
            <div style={{ position: "absolute", transform: "translate(-50%, -50%)", width: 760, padding: "34px 40px", background: "rgba(255,255,255,0.94)", border: "8px solid #111", borderRadius: 40,
              boxShadow: "0 12px 30px rgba(0,0,0,0.4)", fontFamily: "PoppinsBlack", color: "#111" }}>
              {[["NO CALL", 17, "#9aa3ad"], ["BRRR-HM!", Math.round(lerp(17, 54, k)), "#ff7a14"]].map(([label, v, col], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, margin: "18px 0" }}>
                  <div style={{ width: 250, fontSize: 40 }}>{label}</div>
                  <div style={{ flex: 1, height: 70, background: "#eee", borderRadius: 20, overflow: "hidden", border: "5px solid #111" }}>
                    <div style={{ width: `${v}%`, height: "100%", background: col as string }} />
                  </div>
                  <div style={{ width: 120, fontSize: 52, textAlign: "right" }}>{v}%</div>
                </div>
              ))}
            </div>
          </Pop>
          <Pop t={t} at={c("guide3", 4) + 1.0} x={540} y={420}><Chip text="3× MORE HONEY" size={66} bg="#ffd400" /></Pop>
        </Cam>
      );
    },
  },
  /* "The humans take the honey," */
  {
    at: c("guide4", 0),
    render: ({ t }) => (
      <Cam t={t} z={1.06}>
        <Backdrop src={IMG + "bg-savanna.jpg"} t={t} />
        <Person id="hunter" t={t} x={420} y={1520} h={860} look={{ ...HUNTER, prop: "none" }} faces={[[-99, "happy"]]} gaze={[0.5, 0.3]} />
        <Pop t={t} at={c("guide4", 2)} x={700} y={1060}><Actor a={A.honeycomb} t={t} x={0} y={0} w={420} bob={4} /></Pop>
      </Cam>
    ),
  },
  /* "and the bird gets the wax." */
  {
    at: c("guide4", 5),
    render: ({ t }) => (
      <Cam t={t} z={1.1}>
        <Backdrop src={IMG + "bg-savanna.jpg"} t={t} flip />
        <Actor a={A.honeycomb} t={t} x={540} y={1120} w={520} bob={0} />
        <Actor a={A.honeyguide} t={t} x={560} y={820} w={520} bob={10} bobRate={2.5} moods={[[-99, "open"]]} look={[0, 0.8]} rot={Math.sin(t * 9) * 4} />
        <Pop t={t} at={c("guide4", 10)} x={820} y={560}><Heart size={140} /></Pop>
      </Cam>
    ),
  },

  /* #3 NOC: "Finally, Noc the beluga whale." */
  {
    at: c("noc1", 0),
    render: ({ t, u }) => (
      <Cam t={t} z={1.05 + 0.06 * ease(u, 0, 1.8)}>
        <PaintedDeep t={t} />
        <Actor a={A.beluga} t={t} x={540} y={960} w={1000} enter={c("noc1", 0)} bob={14} bobRate={0.6} moods={OPEN} />
        <Pop t={t} at={c("noc1", 1) + 0.1} x={540} y={430}><Chip text="NOC" size={76} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "In 1984, Navy divers kept hearing what sounded like people talking underwater." */
  {
    at: c("noc1", 5),
    render: ({ t, u }) => (
      <Cam t={t} z={1.02 + 0.05 * ease(u, 0, 4)}>
        <PaintedDeep t={t} />
        <Actor a={A.beluga} t={t} x={820} y={1260} w={520} bob={10} bobRate={0.5} moods={OPEN} look={[-0.6, -0.2]} tint="brightness(0.85) blur(1px)" />
        <Person id="divA" t={t} x={330} y={1250} h={620} look={DIVER_A} faces={[[-99, "neutral"], [c("noc1", 10), "curious"]]} gaze={[0.5, -0.3]} bob={10} rot={-6} />
        <Person id="divB" t={t} x={700} y={980} h={520} look={DIVER_B} faces={[[-99, "neutral"], [c("noc1", 12), "worried"]]} gaze={[-0.5, -0.2]} bob={12} rot={8} />
        <Pop t={t} at={c("noc1", 6)} x={540} y={300}><Chip text="1984 · US NAVY" size={58} /></Pop>
        <Murmur t={t} at={c("noc1", 13)} />
      </Cam>
    ),
  },
  /* "Then one diver came up and asked, who told me to get out?" */
  {
    at: c("noc2", 0),
    render: ({ t, u }) => {
      const rise = ease(u, 0, 0.6);
      return (
        <Cam t={t} z={1.15} y={1000}>
          <Backdrop src={IMG + "bg-bay.jpg"} t={t} />
          <AboveLine y={1250}>
            <Person id="divA" t={t} x={520} y={lerp(1700, 1420, rise)} h={760} look={DIVER_A} faces={[[-99, "curious"], [c("noc2", 7), "worried"]]} gaze={[0.4, -0.2]}
              talk={[[c("noc2", 7), c("noc2", 12) + 0.3]]} bob={8} />
          </AboveLine>
          <div style={{ position: "absolute", left: 300, top: 1232, width: 440, height: 40, borderRadius: "50%", border: "6px solid rgba(255,255,255,0.8)" }} />
          <Pop t={t} at={c("noc2", 7)} x={560} y={420}><Bubble text="WHO TOLD ME" sub="TO GET OUT?" size={66} tail={[-60, 200]} /></Pop>
        </Cam>
      );
    },
  },
  /* "Nobody had." */
  {
    at: c("noc3", 0),
    render: ({ t }) => (
      <Cam t={t} z={1.1} y={1000}>
        <Backdrop src={IMG + "bg-bay.jpg"} t={t} flip />
        <AboveLine y={1250}>
          <Person id="divB" t={t} x={330} y={1420} h={660} look={DIVER_B} faces={[[-99, "worried"]]} gaze={[0.5, 0]} bob={8} />
          <Person id="divA" t={t} x={730} y={1430} h={700} look={DIVER_A} faces={[[-99, "worried"]]} gaze={[-0.5, 0]} bob={8} />
        </AboveLine>
        <Pop t={t} at={c("noc3", 0)} x={540} y={760}><RedX t={t} at={c("noc3", 0)} size={420} /></Pop>
      </Cam>
    ),
  },
  /* "It was Noc, copying human voices." — the culprit surfaces */
  {
    at: c("noc3", 2),
    render: ({ t }) => (
      <Cam t={t} z={1.1} y={1000}>
        <Backdrop src={IMG + "bg-bay.jpg"} t={t} />
        <AboveLine y={1250}>
          <Person id="divA" t={t} x={300} y={1430} h={680} look={DIVER_A} faces={[[-99, "worried"], [c("noc3", 4), "shocked"]]} gaze={[0.7, 0]} bob={8} />
          <Actor a={A.belugahead} t={t} x={770} y={lerp(1480, 1150, ease(t, c("noc3", 3), c("noc3", 4) + 0.2))} w={600} flip bob={6} bobRate={0.7} moods={OPEN} look={[-0.6, 0]} />
        </AboveLine>
        <div style={{ position: "absolute", left: 600, top: 1230, width: 360, height: 40, borderRadius: "50%", border: "6px solid rgba(255,255,255,0.8)" }} />
        <Pop t={t} at={c("noc3", 4) + 0.15} x={800} y={600}><Bubble text="GET OUT!" size={80} tail={[-20, 220]} /></Pop>
        <Pop t={t} at={c("noc3", 5)} x={300} y={600}><Mark text="!" size={160} /></Pop>
      </Cam>
    ),
  },
];

/** a little cloud of bees buzzing round a point */
const Bees: React.FC<{ t: number; x: number; y: number }> = ({ t, x, y }) => (
  <>
    {Array.from({ length: 14 }).map((_, i) => {
      const a = t * (2 + (i % 4) * 0.6) + i * 1.7, r = 90 + (i % 5) * 40;
      return (
        <div key={i} style={{ position: "absolute", left: x + Math.cos(a) * r, top: y + Math.sin(a * 1.3) * r * 0.6, width: 22, height: 16, borderRadius: 10,
          background: "repeating-linear-gradient(90deg, #f5c518 0 6px, #1a1a1a 6px 10px)", border: "2px solid #111", transform: `rotate(${Math.cos(a) * 40}deg)` }}>
          <div style={{ position: "absolute", left: 4, top: -10, width: 12, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.75)" }} />
        </div>
      );
    })}
  </>
);

/* ------------------------------------------------------------ the short */

export const TalkShort: React.FC<{ audio?: string | null; captions?: boolean; logo?: string; brand?: string }> = ({ audio = "audio/pins-talk-mix.mp3", captions = true, logo, brand }) => {
  loadPinsFonts();
  const t = useT();
  return (
    <AbsoluteFill style={{ background: "#0b2a4d" }}>
      <ShotPlayer shots={shots} t={t} total={T.duration} />
      <Brand logo={logo} name={brand} />
      {captions && <WordCaption T={T} t={t} />}
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ thumbnail (9:16) */

export const TalkThumb: React.FC = () => {
  loadPinsFonts();
  const t = 1;
  return (
    <AbsoluteFill style={{ background: "#0b2a4d" }}>
      <Backdrop src={IMG + "bg-zoo.jpg"} t={0} />
      <Actor a={A.elephant} t={t} x={540} y={1180} w={1080} bob={0} moods={OPEN} look={[0, 0.2]} />
      <div style={{ position: "absolute", left: 640, top: 600 }}><Bubble text="ANNYEONG!" sub="hello" size={80} tail={[-150, 180]} /></div>
      <div style={{ position: "absolute", left: 50, right: 50, top: 170, textAlign: "center", fontFamily: "Anton", fontSize: 150, lineHeight: 1,
        color: "#ff7a14", WebkitTextStroke: "16px #1b0f05", paintOrder: "stroke fill", textTransform: "uppercase", filter: "drop-shadow(0 8px 2px rgba(0,0,0,0.55))" }}>
        It can<br /><span style={{ color: "#fff" }}>talk?!</span>
      </div>
    </AbsoluteFill>
  );
};

