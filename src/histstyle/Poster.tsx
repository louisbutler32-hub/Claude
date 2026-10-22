import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import {
  FONT,
  Grain,
  MAP,
  NAP,
  Ranks,
  SHOT2,
  arrowD,
  captionAt,
  hash,
  onN,
  prog,
  smokePuffs,
  useHistFonts,
} from "./shared";

// ── Style D · Two-Ink Print ───────────────────────────────────────────
//
// A screen-printed poster: one black, one red, on cream stock. Shade is
// halftone dots, the red plate sits a hair out of register and creeps on
// threes, and the ink drops out in specks where the screen didn't fill.
// The framing is heroic and graphic — Napoleon black against a red sun —
// and the cuts are hard.

const PAPER = "#efe5cf";
const BLACK = "#171412";
const RED = "#c9302a";

const Defs: React.FC<{ f: number }> = ({ f }) => (
  <defs>
    {[3.2, 2.4, 1.6, 1].map((r, i) => (
      <pattern key={`r${i}`} id={`ps-rdot${i}`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
        <circle cx={4.5} cy={4.5} r={r} fill={RED} />
      </pattern>
    ))}
    {[3, 2.2, 1.4].map((r, i) => (
      <pattern key={`k${i}`} id={`ps-kdot${i}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <circle cx={4} cy={4} r={r} fill={BLACK} />
      </pattern>
    ))}
    <pattern id="ps-stripe" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
      <rect width="7" height="14" fill={BLACK} />
    </pattern>
    {/* ink that didn't fully take: specks of paper through the solids, re-pulled on threes */}
    <filter id="ps-ink" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={2} seed={onN(f, 3)} result="e" />
      <feDisplacementMap in="SourceGraphic" in2="e" scale="2.5" xChannelSelector="R" yChannelSelector="G" result="g" />
      <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves={2} seed={onN(f, 3) + 99} result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -16 11.6" result="m" />
      <feComposite in="g" in2="m" operator="in" />
    </filter>
  </defs>
);

const farTop = (x: number) => 1010 + Math.sin(x / 120) * 10 - x * 0.02;
const nearTop = (x: number) => 1420 - Math.sin(Math.max(0, x) / 340) * 70;

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const t = onN(f, 2);
  const push = prog(t, 0, SHOT2 + 10, Easing.linear);
  const reg = [(hash(onN(f, 3)) - 0.5) * 3 + 3, (hash(onN(f, 3) + 5) - 0.5) * 3 - 2];
  const cam = (z: number) => `translate(540,1000) scale(${1 + push * 0.06 * z}) translate(-540,-1000) translate(0,${-push * 14 * z})`;
  const sun = { x: 540, y: 860, r: 300 };

  const rays: React.ReactNode[] = [];
  for (let i = 0; i < 24; i++) {
    const a0 = ((i * 15 + t * 0.12) * Math.PI) / 180;
    const a1 = a0 + (7 * Math.PI) / 180;
    rays.push(
      <path
        key={i}
        d={`M${sun.x},${sun.y} L${sun.x + Math.cos(a0) * 1600},${sun.y + Math.sin(a0) * 1600} L${sun.x + Math.cos(a1) * 1600},${sun.y + Math.sin(a1) * 1600} Z`}
      />,
    );
  }

  const ground = (fn: (x: number) => number) => {
    let d = `M-60,${fn(-60)}`;
    for (let x = -40; x <= 1140; x += 20) d += ` L${x},${fn(x).toFixed(1)}`;
    return `${d} L1140,2400 L-60,2400 Z`;
  };

  return (
    <g>
      {/* red plate */}
      <g transform={`translate(${reg[0]},${reg[1]})`} filter="url(#ps-ink)" style={{ mixBlendMode: "multiply" }}>
        <g transform={cam(0.3)}>
          <g fill="url(#ps-rdot1)">{rays}</g>
          <circle cx={sun.x} cy={sun.y} r={sun.r + 120} fill="url(#ps-rdot2)" />
          <circle cx={sun.x} cy={sun.y} r={sun.r + 64} fill="url(#ps-rdot1)" />
          <circle cx={sun.x} cy={sun.y} r={sun.r + 26} fill="url(#ps-rdot0)" />
          <circle cx={sun.x} cy={sun.y} r={sun.r} fill={RED} />
        </g>
        <g transform={cam(0.5)}>
          <path d={ground(farTop)} fill={RED} />
          <rect x={-60} y={1060} width={1200} height={120} fill="url(#ps-rdot0)" />
          <rect x={-60} y={1180} width={1200} height={110} fill="url(#ps-rdot1)" />
          <rect x={-60} y={1290} width={1200} height={120} fill="url(#ps-rdot2)" />
        </g>
      </g>

      {/* black plate */}
      <g filter="url(#ps-ink)" style={{ mixBlendMode: "multiply" }}>
        <g transform={cam(0.5)}>
          {/* gunsmoke in halftone, rising off the ridge */}
          {[
            { x: 160, y: 1000, t0: -60, s: 60 },
            { x: 900, y: 990, t0: -20, s: 66 },
            { x: 520, y: 1010, t0: 40, s: 52 },
          ].map((c, i) =>
            t >= c.t0
              ? smokePuffs(i + 2, t - c.t0 + 30, c.s).map((p, j) => (
                  <ellipse key={`${i}-${j}`} cx={c.x + p.x * 1.6} cy={c.y + p.y * 0.9} rx={p.r * 1.6} ry={p.r} fill={`url(#ps-kdot${j % 3})`} />
                ))
              : null,
          )}
          {[60, 320, 600, 860].map((x) => (
            <Ranks key={x} x={x} y={farTop(x) + 4} cols={12} rows={1} dx={14} dy={0} s={0.48} fill={BLACK} />
          ))}
        </g>
        <g transform={cam(0.8)}>
          {[
            { x: 40, y: 1250, s: 1.0, cols: 8 },
            { x: 760, y: 1230, s: 0.92, cols: 8 },
          ].map((b, i) => (
            <g key={i} transform={`translate(${t * 0.22},${-t * 0.1})`}>
              <Ranks x={b.x} y={b.y} cols={b.cols} rows={3} dx={17 * b.s} dy={10 * b.s} s={b.s} fill={BLACK} march={t} shear={-3} outline={PAPER} />
            </g>
          ))}
        </g>
        <g transform={cam(1.1)}>
          <path d={ground(nearTop)} fill={BLACK} />
          <g transform="translate(540,1440) scale(1.08) translate(-150,-700)">
            {(["legs", "coat", "collar", "head", "hat"] as const).map((k) => (
              <path key={k} d={NAP[k]} fill={BLACK} />
            ))}
            {NAP.seams.map((d, i) => (
              <path key={i} d={d} fill="none" stroke={PAPER} strokeWidth={3.5} strokeLinecap="round" opacity={0.85} />
            ))}
            <path d="M58,96 C72,72 98,58 128,50" stroke={PAPER} strokeWidth={3.5} fill="none" strokeLinecap="round" />
          </g>
        </g>
      </g>
    </g>
  );
};

const MapPrint: React.FC<{ f: number }> = ({ f }) => {
  const t = onN(f, 2);
  const reg = [(hash(onN(f, 3)) - 0.5) * 3 + 3, (hash(onN(f, 3) + 5) - 0.5) * 3 - 2];
  const stamp = (appear: number) => {
    const p = prog(t, appear, appear + 6, Easing.out(Easing.cubic));
    return { o: p > 0 ? 1 : 0, s: 1.6 - 0.6 * p };
  };
  const block = (u: [number, number, number, number], fill: string, appear: number, k: string) => {
    const { o, s } = stamp(appear);
    const [x, y, w, h] = u;
    return <rect key={k} x={x} y={y} width={w} height={h} fill={fill} opacity={o} transform={`translate(${x + w / 2},${y + h / 2}) scale(${s}) translate(${-x - w / 2},${-y - h / 2})`} />;
  };
  const arrows = MAP.prussians.map((b, i) => arrowD(b, prog(t, 212 + i * 20, 258 + i * 20, Easing.inOut(Easing.cubic)), 40, 34, 60, 96));
  const st = stamp(236);
  const MT = "translate(540,930) scale(1.0) translate(-550,-480)";

  return (
    <g>
      <g transform={`translate(${reg[0]},${reg[1]})`} filter="url(#ps-ink)" style={{ mixBlendMode: "multiply" }}>
        <g transform={MT}>
          <path d={MAP.allyRidge} fill="url(#ps-rdot2)" />
          <path d={MAP.frenchRidge} fill="url(#ps-rdot2)" />
          {MAP.allies.map((u, i) => block(u, RED, 160 + i * 3, `a${i}`))}
        </g>
        <text x={540} y={300} textAnchor="middle" fontFamily={FONT.bebas} fontSize={64} letterSpacing={10} fill={RED}>
          18 · VI · 1815 · 4 P.M.
        </text>
        <g opacity={st.o} transform={`translate(800,1372) rotate(-6) scale(${st.s})`}>
          <rect x={-190} y={-62} width={380} height={124} fill={RED} />
        </g>
      </g>
      <g filter="url(#ps-ink)" style={{ mixBlendMode: "multiply" }}>
        <text x={540} y={230} textAnchor="middle" fontFamily={FONT.bebas} fontSize={120} letterSpacing={4} fill={BLACK}>
          THE FIELD
        </text>
        <rect x={120} y={330} width={840} height={8} fill={BLACK} />
        <g transform={MT}>
          {MAP.woods.map((w, i) => (
            <ellipse key={i} cx={w.x} cy={w.y} rx={w.rx} ry={w.ry} fill="url(#ps-kdot0)" />
          ))}
          <path d={MAP.river} stroke={BLACK} strokeWidth={6} fill="none" strokeDasharray="18 8" />
          {MAP.roads.map((d, i) => (
            <path key={i} d={d} stroke={BLACK} strokeWidth={6} fill="none" />
          ))}
          {MAP.places.map((p) => (
            <g key={p.name}>
              <rect x={p.x - 10} y={p.y - 42} width={20} height={20} fill={BLACK} />
              <text x={p.x} y={p.name === "Hougoumont" ? p.y - 54 : p.y + 6} textAnchor="middle" fontFamily={FONT.bebas} fontSize={34} letterSpacing={2} fill={BLACK}>
                {p.name.toUpperCase()}
              </text>
            </g>
          ))}
          {MAP.french.map((u, i) => block(u, BLACK, 170 + i * 3, `f${i}`))}
          {arrows.map((d, i) => (
            <g key={i}>
              <path d={d} fill={PAPER} />
              <path d={d} fill="url(#ps-stripe)" />
              <path d={d} fill="none" stroke={BLACK} strokeWidth={7} strokeLinejoin="round" />
            </g>
          ))}
          <g opacity={stamp(180).o}>
            <text x={380} y={196} textAnchor="middle" fontFamily={FONT.bebas} fontSize={76} letterSpacing={6} fill={BLACK}>
              WELLINGTON
            </text>
          </g>
          <g opacity={stamp(190).o}>
            <text x={380} y={812} textAnchor="middle" fontFamily={FONT.bebas} fontSize={76} letterSpacing={6} fill={BLACK}>
              NAPOLEON
            </text>
          </g>
        </g>
        <g opacity={st.o} transform={`translate(800,1372) rotate(-6) scale(${st.s})`}>
          <text x={0} y={-6} textAnchor="middle" fontFamily={FONT.bebas} fontSize={86} fill={BLACK}>
            50,000
          </text>
          <text x={0} y={42} textAnchor="middle" fontFamily={FONT.bebas} fontSize={40} letterSpacing={8} fill={BLACK}>
            PRUSSIANS
          </text>
        </g>
      </g>
    </g>
  );
};

export const PosterStyle: React.FC = () => {
  useHistFonts();
  const f = useCurrentFrame();
  const t = onN(f, 2);
  const cap = captionAt(f);
  // the cut: a red ink sweep for four frames, then the map
  const wipe = f >= SHOT2 - 4 && f < SHOT2 + 2;
  const titleIn = prog(t, 4, 12, Easing.out(Easing.cubic));
  const shake = (k: number, a: number) => (f - a < 6 && f >= a ? (hash(f + k) - 0.5) * 14 * (1 - (f - a) / 6) : 0);

  return (
    <AbsoluteFill style={{ background: PAPER, overflow: "hidden" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <Defs f={f} />
        {f < SHOT2 ? <Scene f={f} /> : <MapPrint f={f} />}

        {f < SHOT2 && (
          <g filter="url(#ps-ink)" style={{ mixBlendMode: "multiply" }} opacity={titleIn > 0 ? 1 : 0} transform={`translate(${shake(1, 4)},${shake(2, 4)}) translate(540,330) scale(${1.25 - titleIn * 0.25}) translate(-540,-330)`}>
            <text x={540} y={190} textAnchor="middle" fontFamily={FONT.bebas} fontSize={58} letterSpacing={18} fill={RED}>
              18 · VI · 1815
            </text>
            <text x={540} y={430} textAnchor="middle" fontFamily={FONT.bebas} fontSize={290} letterSpacing={4} fill={BLACK}>
              WATERLOO
            </text>
          </g>
        )}

        {cap && (
          <g
            filter="url(#ps-ink)"
            transform={`translate(${shake(3, cap.from)},${shake(4, cap.from)}) translate(540,1600) scale(${f - cap.from < 3 ? 1.12 : 1}) translate(-540,-1600)`}
          >
            <rect x={50} y={1540} width={980} height={112} fill={f >= SHOT2 ? BLACK : RED} />
            <text x={540} y={1622} textAnchor="middle" fontFamily={FONT.bebas} fontSize={80} letterSpacing={2} fill={PAPER}>
              {cap.text.toUpperCase()}
            </text>
          </g>
        )}

        {wipe && (
          <g filter="url(#ps-ink)">
            <path d={`M${-1400 + (f - (SHOT2 - 4)) * 600},0 L${-200 + (f - (SHOT2 - 4)) * 600},0 L${-1000 + (f - (SHOT2 - 4)) * 600},1920 L${-2200 + (f - (SHOT2 - 4)) * 600},1920 Z`} fill={RED} />
          </g>
        )}
      </svg>
      <Grain id="ps-grain" frame={f} opacity={0.2} every={3} freq={0.8} blend="multiply" />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 75% at 50% 45%, rgba(60,40,20,0) 65%, rgba(60,40,20,0.25) 100%)" }} />
    </AbsoluteFill>
  );
};
