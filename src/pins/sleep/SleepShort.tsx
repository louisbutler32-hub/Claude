import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import {
  Actor, Asset, Backdrop, Bonk, Calendar, Cam, Captions, Chip, Clock, Current, Heart, H, Mark, Mood, PaintedDeep, Pop, Shot, ShotPlayer,
  SplitBrain, Timing, W, Zzz, bell, clamp01, cue, ease, lerp, loadPinsFonts, useT,
} from "../engine";
import TIMING from "./timing.json";

/**
 * "3 animals that sleep in the craziest ways" — the first Pins-format Short.
 * Sea otters holding hands, the frigatebird napping on the wing, sperm whales
 * hanging upright in the deep. Every shot keys off a word in timing.json, so
 * rebuilding the narration (scripts/build-pins-audio.py sleep) re-times the
 * picture with it.
 */

const T = TIMING as Timing;
export const SLEEP_FPS = 30;
export const SLEEP_FRAMES = Math.ceil(T.duration * SLEEP_FPS);

const IMG = "images/pins-sleep/";
const A: Record<string, Asset> = {
  otter: { src: IMG + "otter.png", w: 818, h: 598, eyes: [{ x: 0.77, y: 0.095, r: 0.03 }, { x: 0.865, y: 0.065, r: 0.03 }] },
  otterface: { src: IMG + "otterface.png", w: 976, h: 920, eyes: [{ x: 0.55, y: 0.1, r: 0.048 }, { x: 0.78, y: 0.13, r: 0.048 }] },
  hold: { src: IMG + "hold.png", w: 627, h: 310, eyes: [{ x: 0.1, y: 0.165, r: 0.024 }, { x: 0.155, y: 0.195, r: 0.024 }, { x: 0.075, y: 0.48, r: 0.024 }, { x: 0.125, y: 0.53, r: 0.024 }] },
  drifter: { src: IMG + "drifter.png", w: 736, h: 153, eyes: [{ x: 0.865, y: 0.3, r: 0.02 }, { x: 0.915, y: 0.22, r: 0.02 }] },
  frigate: { src: IMG + "frigate.png", w: 578, h: 486, eyes: [{ x: 0.125, y: 0.345, r: 0.036 }, { x: 0.168, y: 0.326, r: 0.03 }] },
  whale: { src: IMG + "whale.png", w: 764, h: 397, eyes: [{ x: 0.278, y: 0.465, r: 0.042 }] },
  boat: { src: IMG + "boat.png", w: 247, h: 161 },
};

/** the close-up on the frigatebird: near eye open and on watch, far eye shut */
const FRIGATE_HALF: Asset = { ...A.frigate, eyes: [{ ...A.frigate.eyes![0], mood: "open" }, { ...A.frigate.eyes![1], mood: "closed" }] };

const c = (id: string, i = 0) => cue(T, id, i);
const SLEEP: [number, Mood][] = [[-99, "closed"]];

/* ------------------------------------------------------------ the shots */

const shots: Shot[] = [
  /* HOOK — a sperm whale hanging upright in the blue, fast asleep */
  {
    at: 0,
    render: ({ t, u }) => (
      <Cam t={t} z={1.18 - 0.1 * ease(u, 0, 2.6)} y={980}>
        <PaintedDeep t={t} />
        <Actor a={A.whale} t={t} x={300} y={1150} w={620} rot={90} bob={10} bobRate={0.5} moods={SLEEP} opacity={0.55} tint="brightness(0.75) blur(2px)" />
        <Actor a={A.whale} t={t} x={580} y={960} w={900} rot={88} bob={14} bobRate={0.6} moods={SLEEP} />
        <Zzz t={t} x={640} y={420} size={90} from={c("hook", 3) - 0.1} />
      </Cam>
    ),
  },

  /* #1 SEA OTTERS — "First, sea otters." */
  {
    at: c("otter1", 0),
    render: ({ t, u }) => (
      <Cam t={t} z={1 + 0.08 * ease(u, 0, 1.4)}>
        <Backdrop src={IMG + "bg-sea.jpg"} t={t} />
        <Actor a={A.otterface} t={t} x={560} y={900} w={1040} enter={c("otter1", 0)} bob={10} look={[0, 0.2]} />
      </Cam>
    ),
  },
  /* "If one falls asleep alone," — eyes drop shut */
  {
    at: c("otter1", 3),
    render: ({ t }) => (
      <Cam t={t} z={1.15}>
        <Backdrop src={IMG + "bg-sea.jpg"} t={t} />
        <Actor a={A.otter} t={t} x={560} y={900} w={900} rot={-6} bob={12} bobRate={0.8} moods={[[-99, "open"], [c("otter1", 6), "closed"]]} />
        <Zzz t={t} x={760} y={640} size={80} from={c("otter1", 6) + 0.1} />
      </Cam>
    ),
  },
  /* "the current can carry it far out to sea." — pull back, it drifts off */
  {
    at: c("otter1", 8),
    render: ({ t, u, end }) => {
      const k = ease(u, 0, end - (c("otter1", 8)));
      return (
        <Cam t={t} z={1.15 - 0.15 * k}>
          <Backdrop src={IMG + "bg-sea.jpg"} t={t} />
          <Current t={t} x={120} y={980} dir={1} />
          <Actor a={A.otter} t={t} x={lerp(520, 900, k)} y={lerp(980, 640, k)} w={lerp(760, 240, k)} rot={-6 + 10 * k} bob={10} moods={SLEEP} />
          <Zzz t={t} x={lerp(700, 960, k)} y={lerp(760, 520, k)} size={lerp(70, 40, k)} />
        </Cam>
      );
    },
  },

  /* "So they hold hands while they sleep, so nobody drifts away." */
  {
    at: c("otter2", 0),
    render: ({ t, u }) => (
      <Cam t={t} z={1.05 + 0.12 * ease(u, 0, 2.8)} x={500} y={930}>
        <Backdrop src={IMG + "bg-sea.jpg"} t={t} flip />
        <Actor a={A.hold} t={t} x={540} y={960} w={1150} rot={-4} bob={9} bobRate={0.7} moods={SLEEP} />
        <Pop t={t} at={c("otter2", 2)} x={640} y={720}><Heart size={170} /></Pop>
        <Zzz t={t} x={240} y={840} size={70} />
        <Pop t={t} at={c("otter2", 8)} x={520} y={470}><Chip text="NO DRIFTING" size={60} /></Pop>
      </Cam>
    ),
  },

  /* "Some even wrap themselves in kelp, like a blanket" */
  {
    at: c("otter3", 0),
    render: ({ t }) => {
      const wrap = ease(t, c("otter3", 2), c("otter3", 5) + 0.3);
      return (
        <Cam t={t} z={1.1}>
          <Backdrop src={IMG + "bg-sea.jpg"} t={t} />
          <Actor a={A.otter} t={t} x={540} y={940} w={880} rot={-8} bob={10} bobRate={0.8} moods={SLEEP}>
            <svg viewBox="0 0 100 70" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
              <path d="M 38 46 C 30 70, 52 90, 40 130" fill="none" stroke="#5f8a1e" strokeWidth={4} strokeLinecap="round" strokeDasharray={120} strokeDashoffset={120 * (1 - wrap)} />
              {[[28, 56], [48, 43], [66, 31]].map(([cx, cy], i) => (
                <path key={i} d={`M ${cx - 13} ${cy - 15} C ${cx - 2} ${cy - 10}, ${cx + 6} ${cy + 2}, ${cx + 12} ${cy + 15}`} fill="none" stroke="#5f8a1e" strokeWidth={6.5} strokeLinecap="round"
                  strokeDasharray={60} strokeDashoffset={60 * (1 - clamp01(wrap * 3 - i))} style={{ filter: "drop-shadow(0 1px 0 #2d4a0a)" }} />
              ))}
            </svg>
          </Actor>
          <Zzz t={t} x={760} y={660} size={70} />
        </Cam>
      );
    },
  },
  /* "tied to the ocean floor." — the camera drops down the kelp stalk to the seabed */
  {
    at: c("otter3", 9),
    render: ({ t, u, end }) => {
      const k = ease(u, 0.05, end - c("otter3", 9) - 0.05);
      return (
        <Cam t={t} y={lerp(960, 960 + H, k)} z={1}>
          <Backdrop src={IMG + "bg-sea.jpg"} t={t} />
          <Backdrop src={IMG + "bg-kelp.jpg"} t={t} y={H} blur={1} />
          <svg viewBox={`0 0 ${W} ${H * 2}`} style={{ position: "absolute", left: 0, top: 0, width: W, height: H * 2, overflow: "visible" }}>
            <path d={`M 540 900 C 460 1400, 640 1900, 520 2400 S 600 3300, 560 ${H * 2}`} fill="none" stroke="#6e9a23" strokeWidth={34} strokeLinecap="round" />
            <path d={`M 540 900 C 460 1400, 640 1900, 520 2400 S 600 3300, 560 ${H * 2}`} fill="none" stroke="#a6cf4a" strokeWidth={10} strokeLinecap="round" opacity={0.7} />
          </svg>
          <Actor a={A.otter} t={t} x={540} y={820} w={760} rot={-8} bob={8} moods={SLEEP} />
          <Pop t={t} at={c("otter3", 12)} x={560} y={H + 560}><Chip text="⚓ ANCHORED" size={60} /></Pop>
        </Cam>
      );
    },
  },

  /* "And the babies? They just nap on mom's belly." */
  {
    at: c("otter4", 0),
    render: ({ t, u }) => (
      <Cam t={t} z={1.05 + 0.15 * ease(u, 0, 2.3)} y={900}>
        <Backdrop src={IMG + "bg-sea.jpg"} t={t} />
        <Actor a={A.otter} t={t} x={540} y={960} w={1000} rot={-8} bob={10} bobRate={0.7} moods={SLEEP} />
        <Actor a={A.otter} t={t} x={470} y={880} w={380} rot={-14} flip enter={c("otter4", 2)} bob={10} bobRate={0.7}
          moods={[[-99, "open"], [c("otter4", 5), "closed"]]} look={[0.2, 0.3]} />
        <Pop t={t} at={c("otter4", 7)} x={330} y={720}><Heart size={120} /></Pop>
        <Zzz t={t} x={560} y={700} size={56} from={c("otter4", 5)} />
      </Cam>
    ),
  },

  /* #2 FRIGATEBIRD — "Next, the frigatebird." */
  {
    at: c("frigate1", 0),
    render: ({ t, u }) => {
      const fly = ease(u, 0, 1.2);
      return (
        <Cam t={t} z={1.05}>
          <Backdrop src={IMG + "bg-sky.jpg"} t={t} blur={1} />
          <Actor a={A.frigate} t={t} x={lerp(1300, 560, fly)} y={lerp(700, 880, fly)} w={860} rot={-4 + Math.sin(t * 2) * 3} bob={20} bobRate={0.9} />
          <Pop t={t} at={c("frigate1", 10)} x={800} y={430}><Calendar n={Math.round(lerp(1, 60, ease(t, c("frigate1", 10), c("frigate1", 12) + 0.4)))} /></Pop>
          <Pop t={t} at={c("frigate1", 13)} x={300} y={1150}><Chip text="NO LANDING" size={52} bg="#ff4d4d" color="#fff" /></Pop>
        </Cam>
      );
    },
  },
  /* "So it sleeps while flying, in naps that last about twelve seconds," */
  {
    at: c("frigate2", 0),
    render: ({ t, u }) => {
      const nap = c("frigate2", 2);
      const secs = Math.min(12, Math.max(0, Math.round((t - c("frigate2", 9)) * 9)));
      return (
        <Cam t={t} z={1.15 + 0.1 * ease(u, 0, 3.5)} x={560 + u * 8}>
          <Backdrop src={IMG + "bg-sky.jpg"} t={t} blur={1.5} flip />
          <Actor a={A.frigate} t={t} x={560} y={860} w={820} rot={Math.sin(t * 1.6) * 4} bob={22} bobRate={0.8} moods={[[-99, "open"], [nap, "closed"]]} />
          <Zzz t={t} x={430} y={620} size={70} from={nap} />
          <Pop t={t} at={c("frigate2", 9)} x={760} y={1170}><Chip text={`⏱ ${secs} SEC`} size={66} /></Pop>
        </Cam>
      );
    },
  },
  /* "often with half of its brain still awake to watch where it's going." — one eye open */
  {
    at: c("frigate3", 0),
    render: ({ t, u }) => (
      <Cam t={t} z={2.4 + 0.25 * ease(u, 0, 3)} x={300} y={880}>
        <Backdrop src={IMG + "bg-sky.jpg"} t={t} blur={3} />
        <Actor a={FRIGATE_HALF} t={t} x={560} y={860} w={820} bob={6} bobRate={0.8} look={[Math.sin(t * 2.2) > 0 ? -0.8 : -0.2, 0.1]} />
        <Pop t={t} at={c("frigate3", 2)} x={300} y={690}><SplitBrain t={t} size={130} /></Pop>
      </Cam>
    ),
  },
  /* "Add it all up, and that's less than forty-five minutes of sleep a day." */
  {
    at: c("frigate4", 0),
    render: ({ t, u }) => {
      return (
        <Cam t={t} z={1.05}>
          <Backdrop src={IMG + "bg-sky.jpg"} t={t} blur={1} />
          <Actor a={A.frigate} t={t} x={lerp(820, 300, ease(u, 0, 3.2))} y={520} w={420} bob={16} bobRate={0.9} moods={[[-99, "closed"], [c("frigate4", 4), "sad"]]} />
          <Pop t={t} at={c("frigate4", 0) + 0.1} x={540} y={880}><Clock t={t} size={420} spin={0.6} fill={ease(t, c("frigate4", 6), c("frigate4", 9)) * 0.75} color="#6aa6ff" /></Pop>
          <Pop t={t} at={c("frigate4", 6)} x={540} y={1150}><Chip text="< 45 MIN / DAY" size={70} bg="#ffd400" /></Pop>
        </Cam>
      );
    },
  },

  /* #3 SPERM WHALES — "Finally, sperm whales." swims in, then tips upright */
  {
    at: c("whale1", 0),
    render: ({ t, u }) => {
      const tip = ease(t, c("whale1", 4), c("whale1", 7) + 0.2);
      const crowd = c("whale1", 13);
      return (
        <Cam t={t} z={1.05 - 0.1 * ease(t, crowd, crowd + 1.2)}>
          <PaintedDeep t={t} />
          {[[220, 1220, 520, 86], [860, 1180, 560, 92], [120, 760, 380, 89], [930, 700, 400, 87]].map(([x, y, w, r], i) => (
            <Actor key={i} a={A.whale} t={t} x={x} y={y} w={w} rot={r} enter={crowd + i * 0.18} bob={10} bobRate={0.5 + i * 0.07} moods={SLEEP}
              tint={i > 1 ? "brightness(0.8) blur(1.5px)" : undefined} opacity={i > 1 ? 0.8 : 1} />
          ))}
          <Actor a={A.whale} t={t} x={lerp(1400, 560, ease(u, 0, 1.1))} y={960} w={lerp(980, 900, tip)} rot={90 * tip} bob={12} bobRate={0.5}
            moods={[[-99, "open"], [c("whale1", 5), "closed"]]} />
          <Zzz t={t} x={620} y={420} size={80} from={c("whale1", 6)} />
        </Cam>
      );
    },
  },
  /* "The whole group goes completely still for up to fifteen minutes." */
  {
    at: c("whale2", 0),
    render: ({ t, u }) => (
      <Cam t={t} z={1 + 0.06 * ease(u, 0, 3)}>
        <PaintedDeep t={t} />
        {[[200, 1100, 560, 88], [540, 960, 760, 90], [880, 1060, 600, 92], [380, 640, 380, 89], [760, 600, 360, 91]].map(([x, y, w, r], i) => (
          <Actor key={i} a={A.whale} t={t} x={x} y={y} w={w} rot={r} bob={4} bobRate={0.3} moods={SLEEP} tint={i > 2 ? "brightness(0.8) blur(1.5px)" : undefined} />
        ))}
        <Zzz t={t} x={560} y={430} size={70} />
        <Zzz t={t + 0.6} x={240} y={640} size={50} />
        <Pop t={t} at={c("whale2", 9)} x={850} y={470}><div style={{ position: "absolute" }}><Clock t={t} size={260} spin={1.5} fill={ease(t, c("whale2", 9), c("whale2", 10) + 0.5) * 0.25} /></div></Pop>
      </Cam>
    ),
  },
  /* "When scientists drifted their boat right into a sleeping pod, the whales didn't even notice." */
  {
    at: c("whale3", 0),
    render: ({ t, u }) => {
      const drift = ease(u, 0, 3.6);
      return (
        <Cam t={t} z={1}>
          <PaintedDeep t={t} />
          {[[220, 1160, 520, 88], [560, 1080, 700, 90], [900, 1180, 540, 92]].map(([x, y, w, r], i) => (
            <Actor key={i} a={A.whale} t={t} x={x} y={y} w={w} rot={r} bob={4} bobRate={0.3} moods={SLEEP} />
          ))}
          {/* the boat on the surface, seen from just under it */}
          <Actor a={A.boat} t={t} x={lerp(-200, 620, drift)} y={150} w={460} bob={6} bobRate={1.1} rot={Math.sin(t * 2) * 2} />
          <Pop t={t} at={c("whale3", 10)} x={560} y={460}><Mark text="Zzz" size={110} color="#bfe3ff" /></Pop>
          <Pop t={t} at={c("whale3", 12)} x={820} y={330}><Mark text="?" size={150} /></Pop>
        </Cam>
      );
    },
  },
  /* "Until the boat bumped one, and the whole group woke up at once." */
  {
    at: c("whale4", 0),
    render: ({ t }) => {
      const bump = c("whale4", 3);
      const wake = c("whale4", 9);
      const shake = 26 * bell(t, bump, bump + 0.5) + 14 * bell(t, wake, wake + 0.6);
      const scatter = ease(t, wake + 0.25, wake + 1.4);
      return (
        <Cam t={t} z={1.1} shake={shake}>
          <PaintedDeep t={t} />
          {[[220, 1160, 520, 88, -1], [560, 1080, 700, 90, 0], [900, 1180, 540, 92, 1]].map(([x, y, w, r, d], i) => (
            <Actor key={i} a={A.whale} t={t} x={x + d * 500 * scatter} y={y + 260 * scatter} w={w} rot={r - d * 40 * scatter} bob={4} bobRate={0.3}
              moods={[[-99, "closed"], [i === 1 ? bump + 0.1 : wake, "wide"]]} />
          ))}
          <Actor a={A.boat} t={t} x={600} y={150 + 30 * bell(t, bump, bump + 0.3)} w={460} bob={6} bobRate={1.1} rot={Math.sin(t * 2) * 2 + 10 * bell(t, bump, bump + 0.4)} />
          <Pop t={t} at={bump} until={bump + 0.7} x={600} y={330}><Bonk size={240} /></Pop>
          <Pop t={t} at={wake} x={220} y={560}><Mark text="!" size={170} /></Pop>
          <Pop t={t} at={wake + 0.08} x={560} y={480}><Mark text="!" size={190} /></Pop>
          <Pop t={t} at={wake + 0.16} x={900} y={580}><Mark text="!" size={170} /></Pop>
        </Cam>
      );
    },
  },
];

/* ------------------------------------------------------------ the short */

export const SleepShort: React.FC<{ audio?: string | null; captions?: boolean }> = ({ audio = "audio/pins-sleep-mix.mp3", captions = true }) => {
  loadPinsFonts();
  const t = useT();
  return (
    <AbsoluteFill style={{ background: "#0b2a4d" }}>
      <ShotPlayer shots={shots} t={t} total={T.duration} />
      {captions && <Captions T={T} t={t} />}
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
        <Backdrop src={IMG + "bg-sea.jpg"} t={0} />
        <Actor a={A.hold} t={t} x={540} y={520} w={1150} rot={-4} bob={0} moods={SLEEP} />
        <div style={{ position: "absolute", left: 600, top: 300 }}><Heart size={170} /></div>
      </AbsoluteFill>
      <AbsoluteFill style={{ clipPath: "inset(50% 0 0 0)" }}>
        <PaintedDeep t={0} y={H / 2} h={H / 2} />
        <Actor a={A.whale} t={t} x={300} y={1480} w={640} rot={89} bob={0} moods={SLEEP} />
        <Actor a={A.whale} t={t} x={760} y={1420} w={760} rot={91} bob={0} moods={SLEEP} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: H / 2 - 8, height: 16, background: "#fff" }} />
      <div style={{ position: "absolute", left: 50, right: 50, top: H / 2 - 150, textAlign: "center", fontFamily: "PoppinsBlack", fontSize: 128, lineHeight: 1,
        color: "#ffd400", WebkitTextStroke: "16px #000", paintOrder: "stroke fill", textTransform: "uppercase", filter: "drop-shadow(0 8px 0 rgba(0,0,0,0.5))" }}>
        They sleep<br /><span style={{ color: "#fff" }}>like this?!</span>
      </div>
    </AbsoluteFill>
  );
};

