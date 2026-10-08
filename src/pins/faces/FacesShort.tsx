import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import {
  Actor, Backdrop, BoldCaption, Brand, Bubble, Calendar, Cam, Chip, Mark, Mood, Pop, Punch, Shot, ShotPlayer, Timing,
  cue, ease, hitsFromScript, lerp, loadPinsFonts, useT,
} from "../engine";
import { CartoonHead, HeadLook, PhotoPerson } from "../people";
import { BODY } from "../bodies";
import { ASSETS, BG } from "./assets";
import TIMING from "./timing.json";
import SCRIPT from "./script.json";

/**
 * "3 animals that never forget your face": the crows that mobbed a scary mask
 * for years, the sheep that learned celebrities from photos, the bees that
 * remember a face. Hook: ding, riser under a cut-per-beat montage peaking as
 * "face." ends, then a crow narrows its eyes at you: "I REMEMBER YOU", and a
 * WANTED poster with the channel's face slams in.
 */

const T = TIMING as Timing;
export const FACES_FPS = 30;
export const FACES_FRAMES = Math.ceil(T.duration * FACES_FPS);

const A = ASSETS;
const c = (id: string, i = 0) => cue(T, id, i);
const OPEN: [number, Mood][] = [[-99, "open"]];
const ANGRY: [number, Mood][] = [[-99, "angry"]];
const PAYOFF = (T.lines[0] as unknown as { hold_at: number }).hold_at;

const HITS = [...hitsFromScript(T, SCRIPT as never, [["hook", 0], ["hook", 2], ["hook", 4], ["hook", 6], ["crow1", 0], ["sheep1", 0], ["bee1", 0]],
  ["whoosh", "riser"]), PAYOFF, PAYOFF + 0.55].sort((a, b) => a - b);

const MAN: HeadLook = { hair: "short", skin: "#e8b694", hairColor: "#5a3a1e", beard: "stubble" };
const SCI_A: HeadLook = { hair: "cap", hat: "#2f6d9a", skin: "#e2b08a", hairColor: "#3a2414", beard: "full" };
const SCI_B: HeadLook = { hair: "ponytail", skin: "#c68a63", hairColor: "#2a1a10", glasses: true };

/** the scientist in the scary mask: the photo body, the rubber mask over the head */
const Masked: React.FC<{ t: number; x: number; y: number; h: number; flip?: boolean }> = ({ t, x, y, h, flip }) => {
  const p = BODY["sci-point"];
  const w = (h * p.w) / p.h;
  const nx = x + (flip ? -1 : 1) * (p.neck[0] - 0.5) * w, ny = y - h + p.neck[1] * h;
  const hw = p.headW * w * 1.45, hh = hw * 1.25;
  return (
    <>
      <PhotoPerson id="masked" t={t} poses={[[-99, p]]} x={x} y={y} h={h} look={SCI_A} faces={[[-99, "neutral"]]} sway={0} nod={0} flip={flip} shadow={false} />
      <Actor a={A.mask} t={t} x={nx} y={ny - hh * 0.4} w={hw * 1.25} bob={0} />
    </>
  );
};

/** a face in a frame: a grey silhouette (no likeness of anyone real) or the channel's comic face */
const Framed: React.FC<{ t: number; x: number; y: number; w: number; face?: boolean; name?: string }> = ({ t, x, y, w, face, name }) => {
  const h = (w * A.frame.h) / A.frame.w;
  return (
    <>
      <div style={{ position: "absolute", left: x - w * 0.36, top: y - h * 0.38, width: w * 0.72, height: h * 0.76, background: "#f2efe8", overflow: "hidden" }}>
        {face ? (
          <div style={{ position: "absolute", left: w * 0.06, top: h * 0.06, width: w * 0.6, height: w * 0.75 }}>
            <CartoonHead t={t} id="framed" look={MAN} face="happy" since={-99} neck />
          </div>
        ) : (
          <svg viewBox="0 0 100 120" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <circle cx={50} cy={48} r={22} fill="#7d8790" />
            <path d="M 12 120 Q 14 78 50 76 Q 86 78 88 120 Z" fill="#7d8790" />
          </svg>
        )}
      </div>
      <Actor a={A.frame} t={t} x={x} y={y} w={w} bob={0} />
      {name && <div style={{ position: "absolute", left: x, top: y + h * 0.56 }}><Chip text={name} size={44} bg="#ffd400" /></div>}
    </>
  );
};

/** the WANTED poster: the channel's comic face on old paper */
const Wanted: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", left: -230, top: -310, width: 460, height: 620, background: "linear-gradient(#f3e2b8, #e2c98f)", border: "8px solid #5a3f1c",
    boxShadow: "0 18px 0 rgba(0,0,0,0.35)", transform: "rotate(-4deg)" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 18, textAlign: "center", fontFamily: "Anton", fontSize: 96, color: "#3b2410" }}>WANTED</div>
    <div style={{ position: "absolute", left: 95, top: 140, width: 270, height: 337 }}><CartoonHead t={t} id="wanted" look={MAN} face="worried" since={-99} neck /></div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 22, textAlign: "center", fontFamily: "Anton", fontSize: 44, color: "#3b2410" }}>BY EVERY CROW</div>
  </div>
);

/** ten marks: eight ticks, two crosses */
const Tally: React.FC<{ t: number; at: number }> = ({ t, at }) => (
  <div style={{ position: "absolute", left: -470, top: -60, width: 940, display: "flex", gap: 14, justifyContent: "center" }}>
    {Array.from({ length: 10 }).map((_, i) => {
      const k = ease(t, at + i * 0.07, at + i * 0.07 + 0.12);
      const ok = i < 8;
      return (
        <div key={i} style={{ width: 78, height: 78, borderRadius: 18, border: "6px solid #111", background: ok ? "#5be36b" : "#ff4d4d", transform: `scale(${k})`,
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Anton", fontSize: 56, color: "#fff", WebkitTextStroke: "3px #111" }}>{ok ? "✓" : "✗"}</div>
      );
    })}
  </div>
);

/* ------------------------------------------------------------ the shots */

const shots: Shot[] = [
  /* HOOK under the riser: a crow staring right at you… */
  {
    at: 0,
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.8 - 0.3 * ease(u, 0, 0.9)} x={600} y={760}>
        <Backdrop src={BG.campus} t={t} blur={2} />
        <Actor a={A.crow} t={t} x={540} y={1150} w={620} bob={0} moods={OPEN} look={[-0.2, 0.2]} />
      </Cam>
    ),
  },
  /* …a sheep studying a photo… */
  {
    at: c("hook", 2),
    transition: "whip",
    reframes: false,
    render: ({ t }) => (
      <Cam t={t} z={1.15}>
        <Backdrop src={BG.field} t={t} />
        <Framed t={t} x={330} y={700} w={420} face />
        <Actor a={A.sheep} t={t} x={760} y={1250} w={520} bob={0} moods={OPEN} look={[-0.7, -0.2]} />
      </Cam>
    ),
  },
  /* …a bee, face to face… */
  {
    at: c("hook", 4),
    transition: "zoom",
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.3 + 0.2 * ease(u, 0, 0.5)} y={760}>
        <Backdrop src={BG.flowers} t={t} blur={3} />
        <Actor a={A.bee} t={t} x={540} y={980} w={760} bob={6} bobRate={3} moods={OPEN} look={[0, 0]} />
      </Cam>
    ),
  },
  /* …"face": crows mob the mask, the riser climbing */
  {
    at: c("hook", 6),
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.05 + 0.25 * ease(u, 0, 0.6)} y={900} shake={14 * ease(u, 0.1, 0.6)}>
        <Backdrop src={BG.campus} t={t} />
        <Masked t={t} x={540} y={1900} h={1200} />
        <Actor a={A.crowAngry} t={t} x={200} y={700} w={330} enter={c("hook", 6)} bob={8} bobRate={3} moods={ANGRY} look={[0.6, 0]} flip />
        <Actor a={A.crowAngry} t={t} x={880} y={640} w={330} enter={c("hook", 6) + 0.08} bob={8} bobRate={3.4} moods={ANGRY} look={[-0.6, 0]} />
      </Cam>
    ),
  },
  /* PAYOFF in the held beat: the crow turns to YOU. Then the poster. */
  {
    at: PAYOFF,
    reframes: false,
    render: ({ t, u }) => (
      <>
        <Cam t={t} z={1.5 - 0.2 * ease(u, 0.45, 0.75)} y={820}>
          <Backdrop src={BG.campus} t={t} blur={2} />
          <Actor a={A.crow} t={t} x={560} y={1180} w={640} bob={0} moods={[[-99, "open"], [PAYOFF + 0.1, "angry"]]} look={[0, 0.2]} />
        </Cam>
        <Pop t={t} at={PAYOFF + 0.08} until={PAYOFF + 0.55} x={560} y={330}><Bubble text="I REMEMBER YOU." size={62} tail={[40, 150]} /></Pop>
        <Pop t={t} at={PAYOFF + 0.55} x={560} y={900}><Wanted t={t} /></Pop>
      </>
    ),
  },

  /* #1 CROWS */
  {
    at: c("crow1", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.04 + 0.08 * ease(u, 0, 1.4)}>
        <Backdrop src={BG.campus} t={t} />
        <Actor a={A.crow} t={t} x={540} y={1150} w={600} enter={c("crow1", 0)} enterFrom={[900, -200]} bob={4} moods={OPEN} look={[-0.2, 0.2]} />
        <Pop t={t} at={c("crow1", 1)} x={540} y={420}><Chip text="CROWS" size={80} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "Scientists in Seattle caught some crows while wearing a scary mask." */
  {
    at: c("crow1", 2),
    render: ({ t }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={BG.campus} t={t} flip />
        {t < c("crow1", 11) ? (
          <PhotoPerson id="sci" t={t} poses={[[-99, BODY["sci-point"]]]} x={420} y={1880} h={1150} look={SCI_A} faces={[[-99, "smirk"]]} gaze={[0.6, 0]} talk={[[c("crow1", 2), c("crow1", 5)]]} />
        ) : (
          <Masked t={t} x={420} y={1880} h={1150} />
        )}
        <Actor a={A.crow} t={t} x={850} y={1150} w={340} bob={4} moods={[[-99, "open"], [c("crow1", 11), "wide"]]} look={[-0.7, 0]} />
        <Pop t={t} at={c("crow1", 4)} x={540} y={380}><Chip text="SEATTLE" size={66} /></Pop>
      </Cam>
    ),
  },
  /* "For years afterwards," */
  {
    at: c("crow2", 0),
    transition: "zoom",
    render: ({ t }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.campus} t={t} />
        <Actor a={A.crow} t={t} x={540} y={1250} w={520} bob={3} moods={[[-99, "angry"]]} look={[0, 0.2]} />
        <Pop t={t} at={c("crow2", 0) + 0.05} x={540} y={560}><Calendar n={Math.round(lerp(1, 7, ease(t, c("crow2", 1), c("crow2", 3))))} label="YEARS" /></Pop>
      </Cam>
    ),
  },
  /* "the crows screamed at anyone wearing that mask." */
  {
    at: c("crow2", 3),
    render: ({ t }) => (
      <Cam t={t} z={1.04} shake={8}>
        <Backdrop src={BG.campus} t={t} flip />
        <Masked t={t} x={540} y={1900} h={1150} />
        {[[180, 760, 1], [900, 700, 0], [220, 1180, 1], [880, 1150, 0]].map(([x, y, f], i) => (
          <Actor key={i} a={A.crowAngry} t={t} x={x} y={y} w={300} flip={!!f} enter={c("crow2", 5) + i * 0.08} bob={10} bobRate={3 + i * 0.3} moods={ANGRY} look={[f ? 0.6 : -0.6, 0]} />
        ))}
        <Pop t={t} at={c("crow2", 5)} x={240} y={480}><Bubble text="CAW!" size={56} tail={[0, 110]} /></Pop>
        <Pop t={t} at={c("crow2", 5) + 0.2} x={840} y={430}><Bubble text="CAW!!" size={56} tail={[0, 110]} /></Pop>
      </Cam>
    ),
  },
  /* "Even crows that were never caught joined in," */
  {
    at: c("crow3", 0),
    transition: "whip",
    render: ({ t }) => (
      <Cam t={t} z={1.02}>
        <Backdrop src={BG.campus} t={t} />
        {Array.from({ length: 7 }).map((_, i) => (
          <Actor key={i} a={i % 2 ? A.crowAngry : A.crow} t={t} x={140 + (i % 4) * 270} y={760 + Math.floor(i / 4) * 470} w={280} flip={i % 3 === 0}
            enter={c("crow3", 1) + i * 0.1} bob={8} bobRate={2.5 + i * 0.2} moods={ANGRY} look={[0, 0.2]} />
        ))}
        <Pop t={t} at={c("crow3", 6)} x={540} y={420}><Chip text="NEVER EVEN CAUGHT" size={56} /></Pop>
      </Cam>
    ),
  },
  /* "and they taught their chicks to do it too." */
  {
    at: c("crow3", 8),
    render: ({ t }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.campus} t={t} flip />
        <Actor a={A.crowAngry} t={t} x={360} y={1060} w={520} bob={6} bobRate={2.5} moods={ANGRY} look={[0.5, 0]} flip />
        <Actor a={A.chick} t={t} x={730} y={1180} w={430} enter={c("crow3", 12)} bob={8} bobRate={3} moods={ANGRY} look={[-0.5, 0]} />
        <Pop t={t} at={c("crow3", 13)} x={760} y={760}><Bubble text="caw!" size={48} tail={[0, 100]} /></Pop>
      </Cam>
    ),
  },

  /* #2 SHEEP */
  {
    at: c("sheep1", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.04 + 0.08 * ease(u, 0, 1.4)}>
        <Backdrop src={BG.field} t={t} />
        <Actor a={A.sheep} t={t} x={540} y={1200} w={620} enter={c("sheep1", 1)} bob={3} moods={OPEN} look={[0, 0.2]} />
        <Pop t={t} at={c("sheep1", 1) + 0.05} x={540} y={420}><Chip text="SHEEP" size={80} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "Scientists at Cambridge taught sheep to recognize celebrities," */
  {
    at: c("sheep1", 2),
    render: ({ t }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={BG.field} t={t} flip />
        <PhotoPerson id="sciB" t={t} poses={[[-99, BODY["sci-clipboard"]]]} x={300} y={1880} h={1150} look={SCI_B} faces={[[-99, "happy"]]} gaze={[0.6, 0]} talk={[[c("sheep1", 2), c("sheep1", 5)]]} />
        <Actor a={A.sheep} t={t} x={780} y={1300} w={480} bob={3} moods={OPEN} look={[-0.6, 0]} />
        <Pop t={t} at={c("sheep1", 4)} x={540} y={380}><Chip text="CAMBRIDGE" size={66} /></Pop>
        <Pop t={t} at={c("sheep1", 9)} x={780} y={820}><Mark text="★" size={130} /></Pop>
      </Cam>
    ),
  },
  /* "like Barack Obama and Emma Watson, just from photos." */
  {
    at: c("sheep1", 10),
    transition: "zoom",
    render: ({ t }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={BG.field} t={t} />
        {t >= c("sheep1", 11) && <Framed t={t} x={290} y={620} w={380} name="OBAMA" />}
        {t >= c("sheep1", 14) && <Framed t={t} x={790} y={620} w={380} name="EMMA WATSON" />}
        <Actor a={A.sheep} t={t} x={540} y={1350} w={480} bob={3} moods={OPEN} look={[t < c("sheep1", 14) ? -0.6 : 0.6, -0.4]} />
      </Cam>
    ),
  },
  /* "They got it right about eight times out of ten." */
  {
    at: c("sheep2", 0),
    render: ({ t }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={BG.field} t={t} flip />
        <Actor a={A.sheep} t={t} x={540} y={1250} w={560} bob={3} moods={[[-99, "open"], [c("sheep2", 5), "wide"]]} look={[0, 0.1]} />
        <Pop t={t} at={c("sheep2", 3)} x={540} y={520}><Tally t={t} at={c("sheep2", 3)} /></Pop>
        <Pop t={t} at={c("sheep2", 5)} x={540} y={350}><Chip text="8 / 10" size={90} bg="#5be36b" /></Pop>
      </Cam>
    ),
  },

  /* #3 HONEYBEES */
  {
    at: c("bee1", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.04 + 0.08 * ease(u, 0, 1.6)}>
        <Backdrop src={BG.flowers} t={t} />
        <Actor a={A.beeFly} t={t} x={lerp(1300, 560, ease(u, 0, 1))} y={lerp(500, 900, ease(u, 0, 1))} w={620} bob={12} bobRate={4} moods={OPEN} look={[-0.4, 0]} />
        <Pop t={t} at={c("bee1", 1)} x={540} y={420}><Chip text="HONEYBEES" size={72} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "Bees can learn to recognize a human face in a photo," */
  {
    at: c("bee1", 2),
    render: ({ t }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={BG.flowers} t={t} flip />
        <Framed t={t} x={540} y={700} w={520} face />
        <Actor a={A.beeFly} t={t} x={720 + Math.sin(t * 3) * 60} y={1250 + Math.cos(t * 4) * 30} w={360} flip bob={6} bobRate={4} moods={OPEN} look={[-0.4, -0.6]} />
      </Cam>
    ),
  },
  /* "and still remember it two days later." */
  {
    at: c("bee1", 13),
    transition: "zoom",
    render: ({ t }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={BG.flowers} t={t} />
        <Actor a={A.bee} t={t} x={540} y={1200} w={560} bob={6} bobRate={3} moods={OPEN} look={[0, -0.3]} />
        <Pop t={t} at={c("bee1", 16)} x={540} y={500}><Calendar n={2} label="DAYS LATER" /></Pop>
      </Cam>
    ),
  },
  /* "With a brain smaller than a grain of rice." the last shot: it loops to the hook */
  {
    at: c("bee2", 0),
    render: ({ t, u }) => (
      <Cam t={t} z={1.5 + 0.2 * ease(u, 0, 1.6)} y={820}>
        <Backdrop src={BG.flowers} t={t} blur={3} />
        <Actor a={A.bee} t={t} x={540} y={1000} w={820} bob={4} bobRate={3} moods={OPEN} look={[0, 0]} />
        <Pop t={t} at={c("bee2", 6)} x={540} y={560}>
          <svg viewBox="-60 -30 120 60" style={{ position: "absolute", left: -150, top: -75, width: 300, height: 150, overflow: "visible" }}>
            <ellipse cx={0} cy={0} rx={52} ry={20} fill="#f8f4e8" stroke="#111" strokeWidth={4} transform="rotate(-12)" />
          </svg>
        </Pop>
        <Pop t={t} at={c("bee2", 6) + 0.05} x={540} y={420}><Chip text="BRAIN < RICE" size={62} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
];

/* ------------------------------------------------------------ the short */

export const FacesShort: React.FC<{ audio?: string | null; captions?: boolean; logo?: string; brand?: string }> = ({ audio = "audio/pins-faces-mix.mp3", captions = true, logo, brand }) => {
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

export const FacesThumb: React.FC = () => {
  loadPinsFonts();
  const t = 1;
  return (
    <AbsoluteFill style={{ background: "#0b2a4d" }}>
      <Backdrop src={BG.campus} t={0} />
      <Actor a={A.crowAngry} t={t} x={560} y={1300} w={760} bob={0} moods={ANGRY} look={[-0.3, 0.2]} />
      <div style={{ position: "absolute", left: 250, top: 800, transform: "rotate(-8deg)" }}><Wanted t={t} /></div>
      <div style={{ position: "absolute", left: 50, right: 50, top: 170, textAlign: "center", fontFamily: "Anton", fontSize: 150, lineHeight: 1,
        color: "#ff7a14", WebkitTextStroke: "16px #1b0f05", paintOrder: "stroke fill", textTransform: "uppercase", filter: "drop-shadow(0 8px 2px rgba(0,0,0,0.55))" }}>
        They never<br /><span style={{ color: "#fff" }}>forget you</span>
      </div>
    </AbsoluteFill>
  );
};
