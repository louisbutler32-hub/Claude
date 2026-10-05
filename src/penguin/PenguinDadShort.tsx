import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { FONT_SANS, useGeoFonts } from "../geo/fonts";
import {
  Bang,
  Cutout,
  Egg,
  FlashFill,
  Fish,
  H,
  PhotoBg,
  Reticle,
  Snow,
  Svg,
  Tag,
  Thought,
  Vignette,
  W,
  ease,
  pop,
  ramp,
  shake,
} from "./puppet";
import timing from "./timing.json";

/**
 * "Why you couldn't survive being an emperor penguin dad" — a PinsGuy-format
 * Short: real photo cutouts with cartoon eyes on real Antarctic photos, a new
 * visual beat every 2–3 s, word-synced captions, hard stop on the last fact.
 *
 * Narration: scripts-vo/penguin-dad.json → `npm run penguin:vo`, word timings
 * via `python3 scripts/align-words.py penguin-dad`. Scenes below key off the
 * `scene` of each line in timing.json, so re-recording re-times everything.
 */

export const PENGUIN_FPS = 30;
type Line = { scene: string; start: number; end: number; words: [string, number, number][] };
const LINES = timing as unknown as Line[];
const LAST = LINES[LINES.length - 1];
export const PENGUIN_FRAMES = Math.ceil((LAST.end + 0.45) * PENGUIN_FPS);

/** scene window: from its line's start to the next line's start */
const windows = LINES.map((l, i) => ({
  scene: l.scene,
  start: i === 0 ? 0 : l.start,
  end: LINES[i + 1] ? LINES[i + 1].start : PENGUIN_FRAMES / PENGUIN_FPS,
  words: l.words,
}));
/** time a word starts, relative to its scene: w("egg", "leaves") */
const w = (scene: string, word: string) => {
  const win = windows.find((x) => x.scene === scene)!;
  const hit = win.words.find((x) => x[0].toLowerCase().replace(/[^a-z0-9']/g, "") === word);
  return hit ? hit[1] - win.start : 0;
};

type S = { t: number };

// 0:00 hook — snow-blasted penguins, then the lone dad
const Hook: React.FC<S> = ({ t }) =>
  t < 1.5 ? (
    <>
      <PhotoBg id="bg-storm" t={t} zoom={[1.15, 0.12]} focus={[0.45, 0.55]} />
      <Snow t={t} n={140} speed={420} slant={0.9} streak />
      <Vignette />
    </>
  ) : (
    <>
      <PhotoBg id="bg-plain" t={t} zoom={[1.1, 0.05]} blur={3} />
      <Cutout id="front" t={t} x={540} y={1640} h={1250} mood="sad" look={[0, 0.4]} bob={4} />
      <Snow t={t} n={90} speed={260} />
      <Vignette />
    </>
  );

// the 70-mile walk
const Walk: React.FC<S> = ({ t }) => {
  const cut = w("walk", "ice") - 0.4;
  if (t < cut) {
    return (
      <>
        <PhotoBg id="bg-colony" t={t} zoom={[1.05, 0.02]} focus={[0.35, 0.5]} pan={28} />
        <Cutout id="dad" t={t} x={170 + t * 150} y={1500} h={760} waddle={5} mood="squint" seed={2} />
        <Tag x={540} y={560} text="70 MILES" s={pop(t, w("walk", "seventy"))} rot={-3} />
        <Vignette k={0.35} />
      </>
    );
  }
  const lt = t - cut;
  return (
    <>
      <PhotoBg id="bg-plain" t={lt} zoom={[1.2, 0.04]} blur={2} />
      <Cutout id="dad" t={lt} x={540} y={1700} h={1350} waddle={4} mood="squint" look={[0.6, 0]} seed={3} />
      <Svg>
        <g transform={`translate(760 ${360 + (lt * 120) % 80}) scale(${pop(lt, 0.1)})`}>
          <path d="M 0 -40 C 26 -6 26 22 0 26 C -26 22 -26 -6 0 -40 Z" fill="#8fd8ff" stroke="#1d5a86" strokeWidth={5} />
        </g>
      </Svg>
      <Snow t={lt} n={60} speed={200} />
    </>
  );
};

// she lays one egg, hands it over, leaves for two months
const EggScene: React.FC<S> = ({ t }) => {
  const hand = w("egg", "hands");
  const leave = w("egg", "leaves");
  const roll = ease(ramp(t, hand, hand + 0.6));
  const go = ease(ramp(t, leave, leave + 1.1));
  return (
    <>
      <PhotoBg id="bg-reflect" t={t} zoom={[1.15, 0.03]} focus={[0.45, 0.35]} />
      <Cutout id="pair" t={t} x={330 - go * 700} y={1560} h={1000} mood={go > 0 ? "sad" : "happy"} look={[0.7, 0.6]} seed={4} />
      <Cutout id="dad" t={t} x={800} y={1580} h={1030} flip mood={go > 0 ? "shock" : "happy"} look={[-0.6, 0.6]} seed={5} />
      <Svg>
        <Egg x={470 + roll * 230} y={1560} s={1.25} rot={roll * 360} />
        {/* heart pops when the egg lands */}
        <g transform={`translate(560 720) scale(${pop(t, w("egg", "one")) * (go > 0 ? 0 : 1)})`}>
          <path d="M 0 30 C -60 -10 -50 -70 0 -40 C 50 -70 60 -10 0 30 Z" fill="#ff4d6d" stroke="#111" strokeWidth={6} />
        </g>
      </Svg>
      <Tag x={540} y={560} text="2 MONTHS" s={pop(t, w("egg", "two"))} color="#ffd23f" rot={2} />
    </>
  );
};

// balance it on your feet… it freezes
const Feet: React.FC<S> = ({ t }) => {
  const slip = w("feet", "touches");
  const freeze = w("feet", "freezes") - 0.25;
  const fall = ease(ramp(t, slip, slip + 0.35));
  const frozen = ramp(t, freeze, freeze + 0.35);
  const wob = t < slip ? Math.sin(t * 7) * 7 : 0;
  const sh = shake(t, slip + 0.35, 22);
  return (
    <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px)` }}>
      <PhotoBg id="bg-plain" t={t} zoom={[1.3, 0.04]} focus={[0.5, 0.75]} blur={2} />
      {/* close on the feet: the cutout runs off the top of frame */}
      <Cutout id="front" t={t} x={560} y={1760} h={2500} eyes={false} bob={3} />
      <Svg>
        <Egg x={545 + fall * 260} y={1712 + fall * 120} s={1.9} rot={wob + fall * 75} frozen={frozen} />
        <Bang x={860} y={1240} s={pop(t, slip + 0.3)} />
      </Svg>
      <Tag x={540} y={560} text="MINUTES" s={pop(t, w("feet", "few"))} color="#ffd23f" rot={-2} />
      <FlashFill t={t} at={freeze} color="#9fe6ff" len={0.4} />
      {frozen > 0 ? <Vignette k={0.55 * frozen} rgb="110,200,255" /> : null}
    </AbsoluteFill>
  );
};

// -40, 100 mph winds
const Storm: React.FC<S> = ({ t }) => {
  const sh = shake(t, w("storm", "winds"), 14, 1.6);
  const temp = Math.round(-5 - 35 * ease(ramp(t, 0, w("storm", "forty") + 0.2)));
  return (
    <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px)` }}>
      <PhotoBg id="bg-storm" t={t} zoom={[1.25, 0.05]} focus={[0.55, 0.5]} grade="hue-rotate(-8deg) brightness(0.92)" />
      <Snow t={t} n={170} speed={600} slant={1.3} streak />
      <Svg>
        <g transform="translate(150 760)">
          <rect x={-36} y={0} width={72} height={560} rx={36} fill="#fff" stroke="#111" strokeWidth={8} />
          <circle cx={0} cy={600} r={66} fill="#3aa0ff" stroke="#111" strokeWidth={8} />
          <rect x={-18} y={30 + (1 - (temp + 45) / 50) * 500} width={36} height={((temp + 45) / 50) * 500 + 60} fill="#3aa0ff" />
        </g>
      </Svg>
      <Tag x={600} y={560} text={`${temp}°`} s={pop(t, w("storm", "minus"))} color="#9fe6ff" />
      <Tag x={600} y={760} text="100 MPH" s={pop(t, w("storm", "hundred"))} color="#ffffff" rot={-3} />
      <Vignette k={0.6} rgb="10,30,60" />
    </AbsoluteFill>
  );
};

// huddle, taking turns on the freezing edge
const Huddle: React.FC<S> = ({ t }) => {
  const cut = w("huddle", "taking") - 0.1;
  if (t < cut) {
    return (
      <>
        <PhotoBg id="bg-plain" t={t} zoom={[1.15, 0.03]} blur={3} />
        <Cutout id="group" t={t} x={540} y={1180} h={460} mood="squint" bob={2} seed={6} />
        <Cutout id="huddle" t={t} x={540 + Math.sin(t * 2.5) * 25} y={1720} h={980} mood="squint" bob={3} seed={7} />
        <Tag x={540} y={540} text="THOUSANDS" s={pop(t, w("huddle", "thousands"))} rot={-2} />
        <Snow t={t} n={120} speed={420} slant={1} />
      </>
    );
  }
  const lt = t - cut;
  return (
    <>
      <PhotoBg id="bg-storm" t={lt} zoom={[1.5, 0.06]} focus={[0.8, 0.55]} blur={2} />
      <Cutout id="edge" t={lt} x={560} y={1800} h={1350} rot={Math.sin(lt * 40) * 1.5} mood="sad" tears look={[-0.5, 0.2]} seed={8} />
      <Snow t={lt} n={150} speed={520} slant={1.2} streak />
      <Vignette k={0.55} rgb="20,60,110" />
    </>
  );
};

// four months, no food, half the body weight
const Starve: React.FC<S> = ({ t }) => {
  const shrink = ease(ramp(t, w("starve", "lose"), w("starve", "weight") + 0.3));
  return (
    <>
      <PhotoBg id="bg-reflect" t={t} zoom={[1.2, 0.03]} focus={[0.3, 0.4]} blur={2} />
      <Cutout id="dad" t={t} x={470} y={1720} h={1280} squashX={1 - shrink * 0.4} mood="sad" look={[0.5, -0.3]} seed={9} />
      <Svg>
        <Thought x={760} y={560} s={pop(t, w("starve", "eat"))} crossed={ramp(t, w("starve", "eat") + 0.2, w("starve", "eat") + 0.4)}>
          <Fish />
        </Thought>
      </Svg>
      <Tag x={540} y={930} text="4 MONTHS" s={pop(t, w("starve", "four"))} color="#ffd23f" rot={-3} />
      <Tag x={800} y={1180} text={`-${Math.round(shrink * 45)}%`} s={pop(t, w("starve", "half"))} color="#ff6b6b" rot={4} />
    </>
  );
};

// the egg hatches; milk from your own throat
const Milk: React.FC<S> = ({ t }) => {
  const crack = ramp(t, 0.05, w("milk", "hatches") + 0.3);
  return (
    <>
      <PhotoBg id="bg-plain" t={t} zoom={[1.25, 0.04]} blur={3} />
      <Cutout id="pair" t={t} x={420} y={1700} h={1300} rot={8} mood="happy" look={[0.8, 0.9]} seed={10} />
      <Svg>
        <Egg x={790} y={1700} s={1.6} rot={Math.sin(t * 12) * 6 * crack} crack={crack} />
        <g transform={`translate(790 1380) scale(${pop(t, w("milk", "hatches") + 0.2)})`}>
          <rect x={-130} y={-60} width={260} height={110} rx={30} fill="#fff" stroke="#111" strokeWidth={7} />
          <text x={0} y={20} textAnchor="middle" fontFamily={FONT_SANS} fontWeight={900} fontSize={64} fill="#111">
            peep!
          </text>
        </g>
        {t > w("milk", "milk") &&
          [0, 1, 2].map((i) => {
            const k = ((t - w("milk", "milk")) * 1.4 + i / 3) % 1;
            return <ellipse key={i} cx={640 + k * 120} cy={560 + k * 1000} rx={14} ry={19} fill="#fffbe8" stroke="#bbb08a" strokeWidth={3} />;
          })}
      </Svg>
    </>
  );
};

// "but that's not even the worst part" — snap zoom on the face
const Worst: React.FC<S> = ({ t }) => {
  const z = 1 + 0.9 * ease(ramp(t, w("worst", "worst") - 0.15, w("worst", "worst") + 0.05));
  return (
    <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "60% 22%" }}>
      <PhotoBg id="bg-plain" t={t} zoom={[1.2, 0.04]} blur={4} />
      <Cutout id="dad" t={t} x={540} y={2100} h={1900} mood="shock" seed={11} />
      <Svg>
        <Bang x={850} y={420} s={pop(t, w("worst", "worst"))} />
      </Svg>
    </AbsoluteFill>
  );
};

// giant petrels circling the weak
const Petrel: React.FC<S> = ({ t }) => {
  const a = t * 1.2;
  const px = 560 + Math.cos(a) * 160;
  const py = 760 + Math.sin(a) * 110;
  return (
    <>
      <PhotoBg id="bg-colony" t={t} zoom={[1.15, 0.03]} focus={[0.55, 0.6]} grade="brightness(0.85)" />
      <Cutout id="group" t={t} x={540} y={1600} h={560} mood="scared" look={[0, -1]} bob={2} seed={12} />
      <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${px - 540}px, ${py - 820}px) rotate(${Math.sin(a) * 8}deg)` }}>
        <Cutout id="petrel" t={t} x={540} y={1150} h={640} flip={Math.sin(a) > 0} mood="angry" bob={0} seed={13} />
      </div>
      <Svg>
        <Reticle x={300} y={1420} s={pop(t, w("petrel", "weak"))} t={t} />
      </Svg>
      <Vignette k={0.6} rgb="40,0,10" />
    </>
  );
};

// the leopard seal waiting at the ice edge
const Seal: React.FC<S> = ({ t }) => {
  const cut = w("seal", "leopard") - 0.15;
  if (t < cut) {
    return (
      <>
        <PhotoBg id="bg-edge" t={t} zoom={[1.1, 0.04]} focus={[0.62, 0.5]} />
        <Cutout id="wave" t={t} x={520} y={1250} h={760} mood="happy" look={[-0.3, 0.6]} seed={14} />
        <Svg>
          <g transform={`translate(800 600) scale(${pop(t, w("seal", "eat"))})`}>
            <Thought x={0} y={0} s={0.8}>
              <Fish />
            </Thought>
          </g>
        </Svg>
      </>
    );
  }
  const lt = t - cut;
  const rise = ease(ramp(lt, 0, 0.35));
  const sh = shake(lt, 0.3, 30);
  return (
    <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px)` }}>
      <PhotoBg id="bg-sealface" t={lt} zoom={[1.1, 0.05]} focus={[0.5, 0.6]} blur={6} grade="brightness(0.7)" />
      <Cutout id="seal" t={lt} x={1000} y={2300 - rise * 400} h={1200} mood="angry" bob={0} seed={15} />
      <FlashFill t={lt} at={0.3} color="#ff2a2a" len={0.35} />
      <Vignette k={0.65} rgb="40,0,0" />
    </AbsoluteFill>
  );
};

// "your absolute worst nightmare" — dark, red, slow push
const Nightmare: React.FC<S> = ({ t }) => (
  <AbsoluteFill style={{ transform: `scale(${1.05 + t * 0.06})` }}>
    <PhotoBg id="bg-floe" t={t} zoom={[1.2, 0.02]} grade="grayscale(0.5) brightness(0.55) sepia(0.4) hue-rotate(-30deg) saturate(2.2)" />
    <Cutout id="juvsad" t={t} x={540} y={1650} h={1000} mood="scared" look={[-0.3, 0.3]} seed={16} grade="brightness(0.85)" />
    <Vignette k={0.8} rgb="30,0,0" />
  </AbsoluteFill>
);

// the sea ice breaks; the chick goes into the ocean
const Ice: React.FC<S> = ({ t }) => {
  const crackAt = w("ice", "breaks");
  const split = w("ice", "falls") - 0.1;
  const crack = ramp(t, crackAt, crackAt + 0.5);
  const drift = ease(ramp(t, split, split + 1.4));
  const sink = ease(ramp(t, split + 0.3, split + 2.6));
  const sh = shake(t, crackAt + 0.1, 20, 0.6);
  return (
    <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px)` }}>
      <PhotoBg id="bg-floe" t={t} zoom={[1.15, 0.03]} focus={[0.45, 0.55]} />
      <Cutout id="dad" t={t} x={260} y={1300} h={700} flip mood={drift > 0 ? "sad" : "happy"} tears={drift > 0.3} look={[0.6, 0.4]} seed={17} />
      <div style={{ position: "absolute", inset: 0, transform: `translate(${drift * 160}px, ${sink * 420}px) rotate(${drift * 14}deg)`, opacity: 1 - sink * 0.7 }}>
        <Cutout id="juv" t={t} x={760} y={1340} h={620} mood={drift > 0 ? "scared" : "happy"} look={[-0.6, 0]} seed={18} />
      </div>
      <Svg>
        <path
          d="M 560 1050 L 540 1150 L 590 1240 L 550 1330 L 600 1460 L 570 1600"
          stroke="#0d2b45"
          strokeWidth={12}
          fill="none"
          strokeDasharray={700}
          strokeDashoffset={700 * (1 - crack)}
        />
        {/* splash rings where the chick goes in */}
        {sink > 0.15 &&
          [0, 1, 2].map((i) => {
            const k = (sink * 2 + i / 3) % 1;
            return <ellipse key={i} cx={900} cy={1520} rx={60 + k * 200} ry={18 + k * 50} fill="none" stroke="#fff" strokeWidth={6} opacity={1 - k} />;
          })}
      </Svg>
      <Tag x={540} y={560} text="NO WATERPROOF FEATHERS" s={pop(t, w("ice", "waterproof")) * 0.75} color="#ffd23f" />
      <Vignette k={0.5 + sink * 0.3} rgb="0,10,30" />
    </AbsoluteFill>
  );
};

// 2022: four colonies, almost every chick lost
const Lost: React.FC<S> = ({ t }) => {
  const dots = [0, 1, 2, 3, 4];
  const cut = w("lost", "almost") - 0.1;
  return (
    <>
      <PhotoBg id="bg-colony" t={t} zoom={[1.1, 0.02]} focus={[0.5, 0.55]} grade={`grayscale(${0.3 + 0.6 * ramp(t, cut, cut + 1)}) brightness(0.8)`} />
      <Tag x={540} y={520} text="2022" s={pop(t, w("lost", "2022"))} color="#ffffff" />
      <Svg>
        {dots.map((i) => {
          const x = 180 + i * 180;
          const failAt = w("lost", "four") + i * 0.18;
          const failed = i < 4 && t >= failAt;
          return (
            <g key={i} transform={`translate(${x} 860) scale(${pop(t, w("lost", "colonies") - 0.6 + i * 0.08)})`}>
              <circle r={58} fill={failed ? "#e5262f" : "#ffffff"} stroke="#111" strokeWidth={8} />
              {failed && <path d="M -28 -28 L 28 28 M 28 -28 L -28 28" stroke="#fff" strokeWidth={13} strokeLinecap="round" />}
            </g>
          );
        })}
        {/* halos drifting up off the colony — soft death, never gore */}
        {t > cut &&
          [0, 1, 2, 3, 4, 5].map((i) => {
            const k = ((t - cut) * 0.5 + i / 6) % 1;
            return (
              <ellipse key={i} cx={150 + i * 155} cy={1500 - k * 600} rx={46} ry={14} fill="none" stroke="#ffe27a" strokeWidth={8} opacity={(1 - k) * 0.9} />
            );
          })}
      </Svg>
      <Vignette k={0.6} />
    </>
  );
};

const SCENES: Record<string, React.FC<S>> = {
  hook: Hook,
  walk: Walk,
  egg: EggScene,
  feet: Feet,
  storm: Storm,
  huddle: Huddle,
  starve: Starve,
  milk: Milk,
  worst: Worst,
  petrel: Petrel,
  seal: Seal,
  nightmare: Nightmare,
  ice: Ice,
  lost: Lost,
};

// ── word-synced captions, lower-middle third ───────────────────────────
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const all = LINES.flatMap((l) => l.words);
  let i = -1;
  for (let k = 0; k < all.length; k++) if (all[k][1] <= t) i = k;
  if (i < 0 || t > LAST.end + 0.3) return null;
  // show the active word with up to one neighbour each side, as one chunk of ≤3
  const chunkStart = Math.floor(i / 3) * 3;
  const chunk = all.slice(chunkStart, chunkStart + 3).filter((x) => x[1] <= t + 0.6);
  const active = all[i];
  const s = 0.86 + 0.14 * pop(t, active[1], 0.14);
  return (
    <div
      style={{
        position: "absolute",
        left: 50,
        right: 50,
        top: H * 0.665,
        textAlign: "center",
        fontFamily: FONT_SANS,
        fontWeight: 900,
        fontSize: 92,
        lineHeight: 1.05,
        textTransform: "uppercase",
        letterSpacing: "0.01em",
        WebkitTextStroke: "16px #000",
        paintOrder: "stroke fill",
        textShadow: "0 8px 14px rgba(0,0,0,0.6)",
      }}
    >
      {chunk.map((x, k) => {
        const on = x === active;
        return (
          <span
            key={k}
            style={{
              color: on ? "#ffc21a" : "#ffffff",
              display: "inline-block",
              margin: "0 12px",
              transform: on ? `scale(${s})` : undefined,
            }}
          >
            {x[0].replace(/[.,;:!?]+$/g, "")}
          </span>
        );
      })}
    </div>
  );
};

export const PenguinDadShort: React.FC<{ narration: string | null; music: string | null }> = ({ narration, music }) => {
  useGeoFonts();
  const frame = useCurrentFrame();
  const t = frame / PENGUIN_FPS;
  const win = windows.find((x) => t >= x.start && t < x.end) ?? windows[windows.length - 1];
  const Scene = SCENES[win.scene];
  return (
    <AbsoluteFill style={{ background: "#000", width: W, height: H }}>
      <Scene t={t - win.start} />
      <Captions t={t} />
      {narration ? <Audio src={staticFile(narration)} /> : null}
      {music ? <Audio src={staticFile(music)} volume={0.16} /> : null}
    </AbsoluteFill>
  );
};
