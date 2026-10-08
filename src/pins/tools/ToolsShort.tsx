import React from "react";
import { AbsoluteFill, Audio, Img, staticFile } from "remotion";
import {
  Actor, Backdrop, BoldCaption, Brand, Bubble, Calendar, Cam, Chip, Heart, Mark, Mood, Pop, Punch, RedX, Shot, ShotPlayer, Timing,
  bell, cue, ease, hitsFromScript, lerp, loadPinsFonts, useT,
} from "../engine";
import { HeadLook, PhotoPerson } from "../people";
import { BODY } from "../bodies";
import { ASSETS, BG } from "./assets";
import TIMING from "./timing.json";
import SCRIPT from "./script.json";

/**
 * "3 animals that use tools like us": the veined octopus that carries its
 * coconut-shell armour, Betty the New Caledonian crow who bent wire into a
 * hook, and Goodall's termite-fishing chimps. Hook: ding, riser under a
 * cut-per-beat montage peaking as "us." ends, then a crow in a graduation cap
 * ("TOO EASY.") next to a baffled human.
 */

const T = TIMING as Timing;
export const TOOLS_FPS = 30;
export const TOOLS_FRAMES = Math.ceil(T.duration * TOOLS_FPS);

const A = ASSETS;
const c = (id: string, i = 0) => cue(T, id, i);
const OPEN: [number, Mood][] = [[-99, "open"]];
const PAYOFF = (T.lines[0] as unknown as { hold_at: number }).hold_at;

const HITS = [...hitsFromScript(T, SCRIPT as never, [["hook", 0], ["hook", 2], ["hook", 4], ["hook", 6], ["octo1", 0], ["crow1", 0], ["chimp1", 0]],
  ["whoosh", "riser"]), PAYOFF, PAYOFF + 0.4].sort((a, b) => a - b);

const MAN: HeadLook = { hair: "short", skin: "#e8b694", hairColor: "#5a3a1e", beard: "stubble" };
const SCI_B: HeadLook = { hair: "ponytail", skin: "#e8c0a0", hairColor: "#d8b46a" };

/** a graduation cap */
const GradCap: React.FC<{ w?: number }> = ({ w = 240 }) => (
  <svg viewBox="0 0 100 60" style={{ position: "absolute", left: -w / 2, top: -w * 0.3, width: w, height: w * 0.6, overflow: "visible", filter: "drop-shadow(0 6px 3px rgba(0,0,0,0.4))" }}>
    <path d="M 26 30 L 26 46 Q 50 56 74 46 L 74 30 Z" fill="#1b1b1b" />
    <path d="M 50 8 L 98 26 L 50 44 L 2 26 Z" fill="#262626" stroke="#000" strokeWidth={2} />
    <path d="M 50 26 L 86 32 L 88 50" stroke="#ffd400" strokeWidth={3} fill="none" />
    <circle cx={88} cy={52} r={4} fill="#ffd400" />
  </svg>
);

/** the wire, straight then bent into a hook */
const Wire: React.FC<{ k: number; len?: number }> = ({ k, len = 420 }) => {
  const hx = 30 * k, hy = 40 * k;
  return (
    <svg viewBox="-20 -60 260 120" style={{ position: "absolute", left: -len / 2, top: -len * 0.23, width: len, height: len * 0.46, overflow: "visible" }}>
      <path d={`M 0 0 L 200 0 Q ${200 + hx} ${-hy * 0.2}, ${200 + hx} ${-hy * 0.6} Q ${200 + hx * 0.4} ${-hy}, ${200 - hx * 0.2} ${-hy * 0.7}`} fill="none" stroke="#111" strokeWidth={12} strokeLinecap="round" />
      <path d={`M 0 0 L 200 0 Q ${200 + hx} ${-hy * 0.2}, ${200 + hx} ${-hy * 0.6} Q ${200 + hx * 0.4} ${-hy}, ${200 - hx * 0.2} ${-hy * 0.7}`} fill="none" stroke="#c9ced4" strokeWidth={5} strokeLinecap="round" />
    </svg>
  );
};

/** the clear tube with a little bucket of food that rides up on the hook */
const Tube: React.FC<{ lift: number }> = ({ lift }) => (
  <div style={{ position: "absolute", left: -90, top: -340, width: 180, height: 680 }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: 22, border: "8px solid #2b3a4a", background: "rgba(120,180,230,0.35)", boxShadow: "inset 18px 0 0 rgba(255,255,255,0.35)" }} />
    <div style={{ position: "absolute", left: 40, top: 560 - lift * 600, width: 100, height: 90 }}>
      <svg viewBox="0 0 100 90" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <path d="M 20 30 Q 50 -20 80 30" fill="none" stroke="#5c6168" strokeWidth={5} />
        <path d="M 10 30 L 90 30 L 80 88 L 20 88 Z" fill="#c9cfd6" stroke="#111" strokeWidth={4} />
        <circle cx={40} cy={30} r={11} fill="#d9922e" /><circle cx={58} cy={28} r={10} fill="#b8682a" />
      </svg>
    </div>
  </div>
);

/* ------------------------------------------------------------ the shots */

const shots: Shot[] = [
  /* HOOK under the riser: an octopus walking with its shells… */
  {
    at: 0,
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.3 - 0.12 * ease(u, 0, 0.9)}>
        <Backdrop src={BG.sea} t={t} />
        <Actor a={A.octopus} t={t} x={lerp(420, 640, ease(u, 0, 0.95))} y={1100} w={820} bob={14} bobRate={2.4} moods={OPEN} look={[0.4, 0.2]} />
      </Cam>
    ),
  },
  /* …a crow with a hook… */
  {
    at: c("hook", 2),
    transition: "whip",
    reframes: false,
    render: ({ t }) => (
      <Cam t={t} z={1.15}>
        <Backdrop src={BG.lab} t={t} />
        <Actor a={A.crow} t={t} x={720} y={1150} w={500} bob={2} moods={OPEN} look={[-0.6, 0.2]} />
        <div style={{ position: "absolute", left: 360, top: 960 }}><Wire k={1} len={360} /></div>
      </Cam>
    ),
  },
  /* …a chimp fishing for termites… */
  {
    at: c("hook", 4),
    transition: "zoom",
    reframes: false,
    render: ({ t }) => (
      <Cam t={t} z={1.15}>
        <Backdrop src={BG.gombe} t={t} />
        <Actor a={A.chimpFish} t={t} x={560} y={1220} w={640} bob={0} moods={OPEN} look={[0.2, 0.7]} />
      </Cam>
    ),
  },
  /* …"us.": a baffled human as the riser climbs */
  {
    at: c("hook", 6),
    reframes: false,
    render: ({ t, u }) => (
      <Cam t={t} z={1.1 + 0.3 * ease(u, 0, 0.6)} y={760} shake={10 * ease(u, 0.1, 0.6)}>
        <Backdrop src={BG.lab} t={t} blur={2} />
        <PhotoPerson id="man" t={t} poses={[[-99, BODY["man-shock"]]]} x={540} y={1950} h={1300} look={MAN} faces={[[-99, "shocked"]]} gaze={[0, -0.2]} />
      </Cam>
    ),
  },
  /* PAYOFF in the held beat: the crow graduates. The human doesn't. */
  {
    at: PAYOFF,
    reframes: false,
    render: ({ t }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.lab} t={t} />
        <PhotoPerson id="man" t={t} poses={[[-99, BODY["man-shock"]]]} x={290} y={1880} h={1150} look={MAN} faces={[[-99, "worried"]]} gaze={[0.6, -0.1]} />
        <Actor a={A.crow} t={t} x={790} y={1180} w={420} bob={2} moods={OPEN} look={[-0.6, 0.2]} />
        <Pop t={t} at={PAYOFF + 0.05} x={850} y={830}><GradCap w={220} /></Pop>
        <Pop t={t} at={PAYOFF + 0.3} x={780} y={560}><Bubble text="TOO EASY." size={70} tail={[20, 150]} /></Pop>
        <Pop t={t} at={PAYOFF + 0.6} x={290} y={560}><Mark text="?" size={140} /></Pop>
      </Cam>
    ),
  },

  /* #1 THE VEINED OCTOPUS */
  {
    at: c("octo1", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.04 + 0.08 * ease(u, 0, 1.6)}>
        <Backdrop src={BG.sea} t={t} />
        <Actor a={A.octopus} t={t} x={540} y={1100} w={820} enter={c("octo1", 2)} enterFrom={[0, 800]} bob={12} bobRate={1.2} moods={OPEN} look={[0, 0.2]} />
        <Pop t={t} at={c("octo1", 3)} x={540} y={420}><Chip text="VEINED OCTOPUS" size={66} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "It collects coconut shells," */
  {
    at: c("octo1", 4),
    render: ({ t }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.sea} t={t} flip />
        <Actor a={A.shells} t={t} x={540} y={1300} w={760} enter={c("octo1", 6)} bob={0} />
        <Actor a={A.octopus} t={t} x={540} y={820} w={560} bob={10} bobRate={1.2} moods={OPEN} look={[0, 0.7]} />
        <Pop t={t} at={c("octo1", 7)} x={540} y={430}><Chip text="COCONUT SHELLS" size={60} /></Pop>
      </Cam>
    ),
  },
  /* "carries them under its body, and walks on its arm tips." */
  {
    at: c("octo1", 8),
    transition: "zoom",
    render: ({ t, u }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={BG.sea} t={t} />
        <Actor a={A.octopus} t={t} x={lerp(160, 900, ease(u, 0, 2.6))} y={1150 - Math.abs(Math.sin(t * 7)) * 30} w={700} rot={Math.sin(t * 7) * 5} bob={0} moods={OPEN} look={[0.6, 0]} />
        <Pop t={t} at={c("octo1", 14)} x={540} y={430}><Chip text="WALKS ON 2 ARMS" size={56} bg="#ff9ecb" /></Pop>
      </Cam>
    ),
  },
  /* "When danger comes," */
  {
    at: c("octo2", 0),
    render: ({ t, u }) => (
      <Cam t={t} z={1.05} shake={6 * bell(u, 0.4, 1.2)}>
        <Backdrop src={BG.sea} t={t} flip tone="rgba(120,0,0,0.18)" />
        <Actor a={A.shark} t={t} x={lerp(1300, 820, ease(u, 0, 0.8))} y={620} w={620} bob={6} bobRate={0.6} moods={[[-99, "angry"]]} look={[-0.6, 0.2]} />
        <Actor a={A.octopus} t={t} x={360} y={1300} w={520} bob={6} bobRate={3} moods={[[-99, "wide"]]} look={[0.7, -0.4]} />
        <Pop t={t} at={c("octo2", 1)} x={360} y={980}><Mark text="!" size={150} /></Pop>
      </Cam>
    ),
  },
  /* "it climbs inside and pulls the shell shut." */
  {
    at: c("octo2", 3),
    transition: "zoom",
    render: ({ t }) => {
      const shut = ease(t, c("octo2", 7), c("octo2", 10));
      const inside = ease(t, c("octo2", 4), c("octo2", 6));
      const sw = 760, sh = (sw * A.shells.h) / A.shells.w;
      const half = (side: "l" | "r") => (
        <div style={{ position: "absolute", left: 540 - sw / 2 + (side === "l" ? 1 : -1) * shut * sw * 0.18, top: 1200 - sh / 2, width: sw, height: sh,
          clipPath: side === "l" ? "inset(0 50% 0 0)" : "inset(0 0 0 50%)", transform: `rotate(${(side === "l" ? 1 : -1) * shut * 8}deg)` }}>
          <Img src={staticFile(A.shells.src)} style={{ width: "100%", height: "100%" }} />
        </div>
      );
      return (
        <Cam t={t} z={1.1}>
          <Backdrop src={BG.sea} t={t} />
          <Actor a={A.octopus} t={t} x={540} y={lerp(900, 1200, inside)} w={lerp(560, 160, inside)} bob={0} moods={OPEN} look={[0, 0.3]} opacity={1 - shut} />
          {half("l")}{half("r")}
          <Pop t={t} at={c("octo2", 10)} x={540} y={760}><Chip text="SHUT!" size={84} bg="#ffd400" /></Pop>
        </Cam>
      );
    },
  },

  /* #2 BETTY THE NEW CALEDONIAN CROW */
  {
    at: c("crow1", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.04 + 0.08 * ease(u, 0, 1.6)}>
        <Backdrop src={BG.lab} t={t} />
        <Actor a={A.crow} t={t} x={540} y={1150} w={560} enter={c("crow1", 1)} enterFrom={[800, -300]} bob={3} moods={OPEN} look={[-0.2, 0.2]} />
        <Pop t={t} at={c("crow1", 3)} x={540} y={420}><Chip text="NEW CALEDONIAN CROW" size={52} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "Scientists gave a crow named Betty a straight piece of wire." */
  {
    at: c("crow1", 5),
    render: ({ t }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={BG.lab} t={t} flip />
        <PhotoPerson id="sci" t={t} poses={[[-99, BODY["sci-clipboard"]]]} x={280} y={1880} h={1150} look={SCI_B} faces={[[-99, "happy"]]} gaze={[0.6, 0]} talk={[[c("crow1", 5), c("crow1", 7)]]} />
        <Actor a={A.crow} t={t} x={790} y={1220} w={420} bob={3} moods={OPEN} look={[-0.6, 0.3]} />
        <Pop t={t} at={c("crow1", 10)} x={790} y={820}><Chip text="BETTY" size={64} bg="#ff9ecb" /></Pop>
        <Pop t={t} at={c("crow1", 13)} x={600} y={1520}><Wire k={0} len={380} /></Pop>
      </Cam>
    ),
  },
  /* "She bent it into a hook," */
  {
    at: c("crow2", 0),
    transition: "zoom",
    render: ({ t }) => (
      <Cam t={t} z={1.15}>
        <Backdrop src={BG.lab} t={t} blur={2} />
        <Actor a={A.crow} t={t} x={760} y={1000} w={480} bob={2} moods={[[-99, "open"], [c("crow2", 5), "wide"]]} look={[-0.6, 0.6]} />
        <div style={{ position: "absolute", left: 520, top: 1560 }}><Wire k={ease(t, c("crow2", 1), c("crow2", 5))} len={720} /></div>
        <Pop t={t} at={c("crow2", 5)} x={420} y={1020}><Chip text="HOOK!" size={64} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "and used it to pull a bucket of food out of a tube." */
  {
    at: c("crow2", 6),
    render: ({ t }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.lab} t={t} flip />
        <div style={{ position: "absolute", left: 420, top: 1150 }}><Tube lift={ease(t, c("crow2", 10), c("crow2", 18))} /></div>
        <Actor a={A.crow} t={t} x={780} y={900} w={420} bob={2} moods={OPEN} look={[-0.7, 0.4]} />
        <Pop t={t} at={c("crow2", 18)} x={760} y={560}><Heart size={130} /></Pop>
      </Cam>
    ),
  },

  /* #3 CHIMPANZEES */
  {
    at: c("chimp1", 0),
    transition: "whip",
    render: ({ t, u }) => (
      <Cam t={t} z={1.04 + 0.08 * ease(u, 0, 1.4)}>
        <Backdrop src={BG.gombe} t={t} />
        <Actor a={A.chimp} t={t} x={540} y={1200} w={700} enter={c("chimp1", 1)} enterFrom={[-900, 0]} bob={3} moods={OPEN} look={[0, 0.2]} />
        <Pop t={t} at={c("chimp1", 1) + 0.05} x={540} y={420}><Chip text="CHIMPANZEES" size={70} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "They strip the leaves off a twig, poke it into a termite mound," */
  {
    at: c("chimp1", 2),
    render: ({ t }) => (
      <Cam t={t} z={1.1}>
        <Backdrop src={BG.gombe} t={t} />
        <Actor a={A.chimpFish} t={t} x={520} y={1250} w={700} bob={0} moods={OPEN} look={[0.2, 0.7]} />
        <Pop t={t} at={c("chimp1", 13)} x={540} y={420}><Chip text="TERMITE MOUND" size={60} /></Pop>
      </Cam>
    ),
  },
  /* "and pull it out covered in termites." */
  {
    at: c("chimp1", 15),
    transition: "zoom",
    render: ({ t }) => (
      <Cam t={t} z={1.05}>
        <Backdrop src={BG.gombe} t={t} flip />
        <Actor a={A.chimp} t={t} x={540} y={1250} w={640} bob={2} moods={[[-99, "open"], [c("chimp1", 21), "wide"]]} look={[0.3, -0.4]} />
        <Pop t={t} at={c("chimp1", 17)} x={540} y={860}><Actor a={A.twig} t={t} x={0} y={0} w={860} rot={-8} bob={0} /></Pop>
        <Pop t={t} at={c("chimp1", 21)} x={540} y={480}><Chip text="SNACK TIME" size={62} bg="#ffd400" /></Pop>
      </Cam>
    ),
  },
  /* "When Jane Goodall saw this in 1960, it changed science." */
  {
    at: c("chimp2", 0),
    render: ({ t }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={BG.gombe} t={t} />
        <PhotoPerson id="researcher" t={t} poses={[[-99, BODY["sci-clipboard"]]]} x={280} y={1880} h={1150} look={SCI_B} faces={[[-99, "curious"], [c("chimp2", 8), "shocked"]]} gaze={[0.6, 0]} />
        <Actor a={A.chimpFish} t={t} x={780} y={1320} w={480} bob={0} moods={OPEN} look={[-0.2, 0.6]} />
        <Pop t={t} at={c("chimp2", 5)} x={780} y={560}><Calendar n={1960} label="YEAR" /></Pop>
      </Cam>
    ),
  },
  /* "Because until then, only humans were supposed to make tools." the last shot: it loops to the hook */
  {
    at: c("chimp3", 0),
    transition: "whip",
    render: ({ t }) => (
      <Cam t={t} z={1.04}>
        <Backdrop src={BG.gombe} t={t} flip />
        <PhotoPerson id="man" t={t} poses={[[-99, BODY["man-shock"]]]} x={300} y={1880} h={1150} look={MAN} faces={[[-99, "shocked"]]} gaze={[0.6, -0.1]} />
        <Actor a={A.chimp} t={t} x={790} y={1300} w={460} bob={2} moods={[[-99, "angry"]]} look={[-0.6, 0]} />
        <Pop t={t} at={c("chimp3", 3)} x={540} y={430}><Chip text="HUMANS ONLY" size={70} /></Pop>
        <Pop t={t} at={c("chimp3", 8)} x={540} y={430}><RedX t={t} at={c("chimp3", 8)} size={360} /></Pop>
      </Cam>
    ),
  },
];

/* ------------------------------------------------------------ the short */

export const ToolsShort: React.FC<{ audio?: string | null; captions?: boolean; logo?: string; brand?: string }> = ({ audio = "audio/pins-tools-mix.mp3", captions = true, logo, brand }) => {
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

export const ToolsThumb: React.FC = () => {
  loadPinsFonts();
  const t = 1;
  return (
    <AbsoluteFill style={{ background: "#0b2a4d" }}>
      <Backdrop src={BG.lab} t={0} />
      <Actor a={A.crow} t={t} x={560} y={1400} w={720} bob={0} moods={OPEN} look={[-0.2, 0.2]} />
      <div style={{ position: "absolute", left: 700, top: 800 }}><GradCap w={300} /></div>
      <div style={{ position: "absolute", left: 50, right: 50, top: 170, textAlign: "center", fontFamily: "Anton", fontSize: 150, lineHeight: 1,
        color: "#ff7a14", WebkitTextStroke: "16px #1b0f05", paintOrder: "stroke fill", textTransform: "uppercase", filter: "drop-shadow(0 8px 2px rgba(0,0,0,0.55))" }}>
        Smarter<br /><span style={{ color: "#fff" }}>than us?!</span>
      </div>
    </AbsoluteFill>
  );
};
