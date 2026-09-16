import React from "react";
import { FONT_CAPTION, FONT_SANS } from "./fonts";
import { useGeo } from "./GeoCanvas";
import { Overlay } from "./hud";
import { Icon } from "./icons";
import { alive, beat, easeInOut, easeOut, overshoot } from "./motion";

// ── Diagrams ──────────────────────────────────────────────────────────
// The flat illustrated cut-away the reference channel drops to when the map
// can't show the point: a strait in section, with the sea floor, a depth
// mark, and whatever the narration is comparing it to. Drawn at 1080×1920.
// A panel lays itself out for whatever width it is given, so when the
// comparison slides in and the main panel narrows to half the frame the
// type stays the right shape.

const W = 1080;
const H = 1920;

export const PAPER = "#f4f4f1";
export const NAVY = "#14283c";
export const NAVY_DEEP = "#0b1a2a";
export const ORANGE = "#f39c2b";
const WATER_TOP = "#2f86b8";
const WATER_DEEP = "#0d2f4d";

/** A cliff edge from above the waterline down, jagged, in silhouette. */
const cliff = (side: "left" | "right", inner: number, waterline: number, seed: number, pw: number): string => {
  const pts: string[] = [];
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const y = waterline - 120 + ((H - waterline + 120) * i) / steps;
    const jag = Math.sin(i * 1.7 + seed) * 22 + Math.cos(i * 0.9 + seed * 2) * 14;
    pts.push(`${(inner + (side === "left" ? jag : -jag)).toFixed(1)} ${y.toFixed(1)}`);
  }
  const outer = side === "left" ? -20 : pw + 20;
  return `M${outer} ${waterline - 120} L${pts.join(" L")} L${outer} ${H + 20} Z`;
};

const Sun: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <>
    <circle cx={x} cy={y} r={150} fill="#f7d774" opacity={0.28} />
    <circle cx={x} cy={y} r={95} fill="#f7d774" opacity={0.55} />
    <circle cx={x} cy={y} r={60} fill="#fbe7a1" />
  </>
);

const Rocks: React.FC<{ y: number; pw: number }> = ({ y, pw }) => (
  <g>
    <rect x={0} y={y} width={pw} height={H - y} fill={NAVY_DEEP} />
    {Array.from({ length: 40 }, (_, i) => {
      const rx = (i * 97) % pw;
      const ry = y + 20 + ((i * 53) % 220);
      const r = 10 + ((i * 7) % 16);
      return <ellipse key={i} cx={rx} cy={ry} rx={r * 1.4} ry={r} fill="#1e3448" opacity={0.7} />;
    })}
  </g>
);

const DepthMark: React.FC<{ x: number; y0: number; y1: number; text: string; sub?: string; p: number; side?: "left" | "right" }> = ({
  x,
  y0,
  y1,
  text,
  sub,
  p,
  side = "right",
}) => {
  const yEnd = y0 + (y1 - y0) * p;
  const pop = overshoot(Math.max(0, (p - 0.6) / 0.4));
  return (
    <g>
      <line x1={x} y1={y0} x2={x} y2={yEnd} stroke="#ffffff" strokeWidth={4} strokeDasharray="14 12" />
      {pop > 0 ? (
        <g transform={`translate(${x + (side === "right" ? 26 : -26)} ${(y0 + y1) / 2}) scale(${0.6 + 0.4 * pop})`} opacity={pop}>
          <text
            fontFamily={FONT_SANS}
            fontSize={56}
            fontWeight={800}
            fill="#ffffff"
            textAnchor={side === "right" ? "start" : "end"}
            dominantBaseline="central"
            style={{ filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.6))" }}
          >
            {text}
          </text>
          {sub ? (
            <text y={46} fontFamily={FONT_CAPTION} fontSize={30} fontWeight={600} fill="#dbe7f0" textAnchor={side === "right" ? "start" : "end"} dominantBaseline="central">
              {sub}
            </text>
          ) : null}
        </g>
      ) : null}
    </g>
  );
};

/** An ice floe: a rounded white slab with a lighter top. */
const Floe: React.FC<{ x: number; y: number; w: number; tilt: number }> = ({ x, y, w, tilt }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
    <path
      d={`M${-w / 2} 0 l${w * 0.12} -26 l${w * 0.3} -10 l${w * 0.25} 8 l${w * 0.33} -16 l${w * 0.1} 34 l${-w * 0.05} 30 l${-w * 0.9} 4 z`}
      fill="#eaf3f8"
      stroke="#b9d3e2"
      strokeWidth={3}
      strokeLinejoin="round"
    />
    <path d={`M${-w / 2} 0 l${w * 0.12} -26 l${w * 0.3} -10 l${w * 0.25} 8 l${w * 0.33} -16 l${w * 0.1} 34 z`} fill="#ffffff" opacity={0.8} />
  </g>
);

type PanelSpec = {
  pw: number;
  left?: string;
  right?: string;
  title?: string;
  waterM: number;
  waterline: number;
  pxPerM: number;
  depth?: { text: string; sub?: string; toM: number; p: number; x: number };
  tunnelM?: number;
  bridge?: boolean;
  ice?: { since: number; t: number; amount: number };
  rise: number;
  sunX: number;
  cliffInset: number;
};

const Panel: React.FC<PanelSpec> = ({ pw, left, right, title, waterM, waterline, pxPerM, depth, tunnelM, bridge, ice, rise, sunX, cliffInset }) => {
  const floor = waterline + waterM * pxPerM;
  const innerL = cliffInset;
  const innerR = pw - cliffInset;
  const tunnelY = tunnelM !== undefined ? waterline + tunnelM * pxPerM : 0;
  // the cliff-top names shrink with the panel so they never run into the seam
  const labelSize = Math.max(30, Math.min(50, (50 * pw) / W));
  const wave = Array.from({ length: Math.ceil(pw / 120) + 1 }, () => "t120 0").join(" ");
  return (
    <svg width={pw} height={H} viewBox={`0 0 ${pw} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="sec-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={WATER_TOP} />
          <stop offset="1" stopColor={WATER_DEEP} />
        </linearGradient>
      </defs>
      <rect width={pw} height={H} fill={PAPER} />
      <Sun x={sunX} y={160} />
      <rect x={0} y={waterline + (1 - rise) * 200} width={pw} height={H} fill="url(#sec-water)" />
      <path d={`M0 ${waterline} q60 -18 120 0 ${wave} v40 H0 z`} fill="#5fa8d3" opacity={0.55} />
      <Rocks y={floor} pw={pw} />
      {tunnelM !== undefined ? (
        <g>
          <rect x={0} y={tunnelY - 34} width={pw} height={68} rx={34} fill="#3b5266" stroke="#6d8aa3" strokeWidth={4} />
          <rect x={0} y={tunnelY - 22} width={pw} height={44} rx={22} fill="#1a2b3b" />
          {Array.from({ length: Math.ceil(pw / 80) }, (_, i) => (
            <rect key={i} x={i * 80 + 20} y={tunnelY - 8} width={40} height={16} rx={4} fill="#ffe27a" opacity={0.9} />
          ))}
        </g>
      ) : null}
      <path d={cliff("left", innerL, waterline, 1, pw)} fill={NAVY} />
      <path d={cliff("right", innerR, waterline, 4, pw)} fill={NAVY} />
      {bridge ? (
        <g opacity={0.85}>
          <rect x={innerL - 40} y={waterline - 150} width={innerR - innerL + 80} height={16} fill="none" stroke={NAVY} strokeWidth={4} strokeDasharray="14 10" />
          {[0.25, 0.5, 0.75].map((f) => (
            <rect key={f} x={innerL + (innerR - innerL) * f - 16} y={waterline - 134} width={32} height={floor - waterline + 134} fill="none" stroke={NAVY} strokeWidth={4} strokeDasharray="14 10" />
          ))}
        </g>
      ) : null}
      {depth ? <DepthMark x={depth.x} y0={waterline} y1={waterline + depth.toM * pxPerM} text={depth.text} sub={depth.sub} p={depth.p} /> : null}
      {ice && ice.amount > 0
        ? Array.from({ length: 7 }, (_, i) => {
            const speed = 70 + (i % 3) * 30;
            const x = ((i * 190 + (ice.t - ice.since) * speed) % (pw + 300)) - 150;
            return <Floe key={i} x={x} y={waterline + 6} w={(120 + (i % 4) * 40) * ice.amount} tilt={((i * 37) % 9) - 4} />;
          })
        : null}
      {ice && ice.amount > 0 ? (
        <g opacity={ice.amount}>
          {Array.from({ length: 70 }, (_, i) => {
            const x = (i * 173) % pw;
            const y = (i * 97 + (ice.t - ice.since) * 60 * (1 + (i % 3) * 0.3)) % waterline;
            return <circle key={i} cx={x} cy={y} r={3 + (i % 3)} fill="#ffffff" opacity={0.9} />;
          })}
        </g>
      ) : null}
      {left ? (
        <text x={innerL / 2} y={waterline - 250} fontFamily={FONT_SANS} fontSize={labelSize} fontWeight={900} fill={ORANGE} textAnchor="middle" letterSpacing="0.06em">
          {left}
        </text>
      ) : null}
      {right ? (
        <text x={innerR + (pw - innerR) / 2} y={waterline - 250} fontFamily={FONT_SANS} fontSize={labelSize} fontWeight={900} fill={ORANGE} textAnchor="middle" letterSpacing="0.06em">
          {right}
        </text>
      ) : null}
      {title ? (
        <text x={pw / 2} y={waterline - 250} fontFamily={FONT_SANS} fontSize={44} fontWeight={900} fill={ORANGE} textAnchor="middle" letterSpacing="0.05em">
          {title}
        </text>
      ) : null}
    </svg>
  );
};

export type SectionProps = {
  in: number;
  until: number;
  left: string;
  right: string;
  /** water depth, metres, and how it is labelled */
  depthM: number;
  depthText: string;
  depthSub?: string;
  /** px per metre — the same across panels so depths compare honestly */
  pxPerM?: number;
  /** a second panel that slides in beside: the thing being compared */
  compare?: {
    at: number;
    title: string;
    waterM: number;
    tunnelM?: number;
    tunnelText?: string;
    tunnelSub?: string;
  };
  /** ice floes on the surface, from this time */
  iceAt?: number;
  /** a thermometer callout, from this time */
  thermo?: { at: number; text: string };
  /** a planned bridge, ghosted, with piers the floes grind past */
  bridge?: boolean;
};

export const StraitSection: React.FC<SectionProps> = ({
  in: from,
  until,
  left,
  right,
  depthM,
  depthText,
  depthSub,
  pxPerM = 8,
  compare,
  iceAt,
  thermo,
  bridge,
}) => {
  const { t } = useGeo();
  const vis = alive(t, from, until, 0.45);
  if (vis <= 0.001) return null;
  const waterline = 700;
  const rise = easeOut(beat(t, from, 0.9));
  const split = compare ? easeInOut(beat(t, compare.at, 0.7)) : 0;
  const ice = iceAt !== undefined ? easeOut(beat(t, iceAt, 0.8)) : 0;
  const thermoPop = thermo ? overshoot(beat(t, thermo.at, 0.5)) : 0;
  const mainW = W - (W / 2) * split;
  const cmpLeft = W / 2 + (1 - split) * W;

  return (
    <Overlay in={from} until={until} fade={0.45}>
      <div style={{ position: "absolute", inset: 0, background: PAPER }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: mainW, height: H, overflow: "hidden" }}>
        <Panel
          pw={mainW}
          left={left}
          right={right}
          waterM={depthM}
          waterline={waterline}
          pxPerM={pxPerM}
          depth={{ text: depthText, sub: depthSub, toM: depthM, p: easeOut(beat(t, from + 0.7, 1.0)), x: mainW / 2 + (bridge ? 60 : 0) }}
          bridge={bridge}
          ice={iceAt !== undefined ? { since: iceAt, t, amount: ice } : undefined}
          rise={rise}
          sunX={150}
          cliffInset={mainW * 0.21}
        />
      </div>
      {compare && split > 0 ? (
        <div style={{ position: "absolute", left: cmpLeft, top: 0, width: W / 2, height: H, overflow: "hidden", borderLeft: "10px solid #f2b632", boxSizing: "border-box" }}>
          <Panel
            pw={W / 2}
            title={compare.title}
            waterM={compare.waterM}
            waterline={waterline}
            pxPerM={pxPerM}
            tunnelM={compare.tunnelM}
            depth={
              compare.tunnelText
                ? { text: compare.tunnelText, sub: compare.tunnelSub, toM: compare.tunnelM ?? compare.waterM, p: easeOut(beat(t, compare.at + 0.6, 1.0)), x: W / 4 - 60 }
                : undefined
            }
            rise={1}
            sunX={W / 2 - 110}
            cliffInset={80}
          />
        </div>
      ) : null}
      {thermo && thermoPop > 0 ? (
        <div
          style={{
            position: "absolute",
            right: 70,
            top: 330,
            transform: `scale(${0.5 + 0.5 * thermoPop})`,
            transformOrigin: "right center",
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontFamily: FONT_SANS,
            fontWeight: 900,
            fontSize: 84,
            color: NAVY,
          }}
        >
          <Icon icon="thermo" size={110} color={NAVY} />
          <span>{thermo.text}</span>
        </div>
      ) : null}
    </Overlay>
  );
};
