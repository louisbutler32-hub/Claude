import React from "react";
import { random } from "remotion";
import { H, PANEL_TOP, W } from "../minecraft/beats";
import { Item, ItemName, Pixels } from "../minecraft/pixels";

/**
 * The game's own UI, redrawn: hearts, hotbar, the F3 Y readout, chat, and
 * the death screen. Minecraft players read these instantly, so they carry
 * the story without a word of narration.
 */

const PIX = "Silkscreen, monospace";

/* ---------------------------- blocks ---------------------------- */

/** One placed block, drawn flat with a thick outline like the rest of the world. */
export const Block: React.FC<{ kind: "water" | "hay" | "slime" | "dirt" | "grass" | "stone"; x: number; y: number; s: number; t?: number; squash?: number }> = ({
  kind, x, y, s, t = 0, squash = 0,
}) => {
  const h = s * (1 - squash);
  const top = y + (s - h);
  const o = { stroke: "#141414", strokeWidth: 8, strokeLinejoin: "round" as const };
  if (kind === "water") {
    const wave = (k: number) => `M${x + 8},${top + 22 + k * 40} q${s / 8},${-10 + Math.sin(t / 5 + k) * 4} ${s / 4},0 t${s / 4},0 t${s / 4},0 t${s / 4 - 16},0`;
    return (
      <g>
        <rect x={x} y={top} width={s} height={h} fill="#3f76e4" opacity={0.78} {...o} />
        <path d={wave(0)} fill="none" stroke="#9cc2ff" strokeWidth={6} strokeLinecap="round" />
        <path d={wave(1.6)} fill="none" stroke="#6d9df5" strokeWidth={5} strokeLinecap="round" opacity={0.8} />
      </g>
    );
  }
  if (kind === "hay") {
    return (
      <g>
        <rect x={x} y={top} width={s} height={h} fill="#d9b53a" {...o} />
        {[0.22, 0.72].map((k) => <rect key={k} x={x + 4} y={top + h * k} width={s - 8} height={h * 0.1} fill="#a2231d" />)}
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={x + 14 + i * (s - 28) / 6} y1={top + 10} x2={x + 10 + i * (s - 28) / 6} y2={top + h - 10} stroke="#b8932a" strokeWidth={4} />
        ))}
        <rect x={x} y={top} width={s} height={h} fill="none" {...o} />
      </g>
    );
  }
  if (kind === "slime") {
    const m = s * 0.2;
    return (
      <g>
        <rect x={x} y={top} width={s} height={h} fill="#7ccf5a" opacity={0.72} {...o} />
        <rect x={x + m} y={top + m * (h / s)} width={s - 2 * m} height={h - 2 * m * (h / s)} fill="#5fae42" opacity={0.85} stroke="#3f7f2a" strokeWidth={5} />
        <rect x={x + m * 0.6} y={top + 8} width={s * 0.18} height={h * 0.1} fill="#c9f7b0" opacity={0.8} />
      </g>
    );
  }
  if (kind === "stone") {
    return (
      <g>
        <rect x={x} y={top} width={s} height={h} fill="#8c8c8c" {...o} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={x + 12 + random(`s${x}${y}${i}`) * (s - 36)} y={top + 14 + random(`t${x}${y}${i}`) * (h - 34)} width={16} height={10} fill={i % 2 ? "#6f6f6f" : "#a3a3a3"} />
        ))}
      </g>
    );
  }
  const dirt = (
    <g>
      <rect x={x} y={top} width={s} height={h} fill="#8a6a45" {...o} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={x + 10 + random(`d${x}${y}${i}`) * (s - 30)} y={top + 14 + random(`e${x}${y}${i}`) * (h - 30)} width={12} height={10} fill="#6d5236" />
      ))}
    </g>
  );
  if (kind === "dirt") return dirt;
  return (
    <g>
      {dirt}
      <rect x={x} y={top} width={s} height={h * 0.22} fill="#6ba264" stroke="#141414" strokeWidth={8} />
    </g>
  );
};

/* ---------------------------- hearts ---------------------------- */

const HEART = ["..KK.KK..", ".KRRKRRK.", "KRWRRRRRK", "KRRRRRRRK", ".KRRRRRK.", "..KRRRK..", "...KRK...", "....K...."];
const heartRows = (fill: "full" | "half" | "empty") =>
  HEART.map((row) => row.split("").map((c, i) => (c === "K" ? c : fill === "full" || (fill === "half" && i <= 4) ? c : "E")).join(""));

/** 10 hearts, `hp` in half-hearts (0-20). At 4 or less they shake, as in the game. */
export const Hearts: React.FC<{ x: number; y: number; hp: number; frame: number; flash?: boolean }> = ({ x, y, hp, frame, flash = false }) => (
  <g>
    {Array.from({ length: 10 }, (_, i) => {
      const fill = hp >= (i + 1) * 2 ? "full" : hp === i * 2 + 1 ? "half" : "empty";
      const jiggle = hp <= 4 ? Math.round((random(`hj${i}${Math.floor(frame / 2)}`) - 0.5) * 12) : 0;
      return (
        <Pixels key={i} rows={heartRows(fill)} px={6} x={x + 27 + i * 60} y={y + jiggle}
          colors={{ K: flash ? "#ffffff" : "#1a0505", R: "#e5231d", W: "#ffb3ae", E: flash ? "#6b2a2a" : "#3a1414" }} />
      );
    })}
  </g>
);

/* ---------------------------- hotbar ----------------------------- */

export type SlotItem = ItemName | "hay" | "slime" | null;

const MiniBlock: React.FC<{ kind: "hay" | "slime"; x: number; y: number }> = ({ kind, x, y }) => (
  <Block kind={kind} x={x - 30} y={y - 30} s={60} />
);

export const Hotbar: React.FC<{ y: number; items: SlotItem[]; selected: number }> = ({ y, items, selected }) => {
  const size = 86;
  const x0 = (W - size * 9) / 2;
  return (
    <g>
      <rect x={x0} y={y} width={size * 9} height={size} fill="#141414" opacity={0.55} />
      {items.map((it, i) => {
        const cx = x0 + i * size + size / 2;
        return (
          <g key={i}>
            <rect x={x0 + i * size + 3} y={y + 3} width={size - 6} height={size - 6} fill="none" stroke="#8b8b8b" strokeWidth={4} />
            {it === "hay" || it === "slime" ? <MiniBlock kind={it} x={cx} y={y + size / 2} /> : it ? <Item name={it} x={cx} y={y + size / 2} px={6} /> : null}
          </g>
        );
      })}
      <rect x={x0 + selected * size - 5} y={y - 5} width={size + 10} height={size + 10} fill="none" stroke="#ffffff" strokeWidth={9} />
    </g>
  );
};

/* ------------------------ F3 and chat ---------------------------- */

export const YReadout: React.FC<{ y: number }> = ({ y }) => (
  <g>
    <rect x={32} y={PANEL_TOP + 28} width={250} height={64} fill="#000" opacity={0.42} />
    <text x={48} y={PANEL_TOP + 76} fontFamily={PIX} fontSize={42} fill="#ffffff">Y: {Math.round(y)}</text>
  </g>
);

export const Chat: React.FC<{ text: string; opacity: number; y?: number }> = ({ text, opacity, y = 1480 }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity}>
      <rect x={24} y={y - 50} width={text.length * 27 + 40} height={66} fill="#000" opacity={0.5} />
      <text x={44} y={y} fontFamily={PIX} fontSize={38} fill="#3a3a3a">{text}</text>
      <text x={40} y={y - 4} fontFamily={PIX} fontSize={38} fill="#ffffff">{text}</text>
    </g>
  );

/* -------------------------- death screen -------------------------- */

const ShadowText: React.FC<{ x: number; y: number; size: number; children: React.ReactNode; fill?: string }> = ({ x, y, size, children, fill = "#ffffff" }) => (
  <g fontFamily={PIX} fontSize={size} textAnchor="middle">
    <text x={x + size * 0.08} y={y + size * 0.08} fill="#3f3f3f">{children}</text>
    <text x={x} y={y} fill={fill}>{children}</text>
  </g>
);

const Button: React.FC<{ y: number; label: string; hover: boolean; pressed: boolean }> = ({ y, label, hover, pressed }) => (
  <g>
    <rect x={220} y={y} width={640} height={96} fill={pressed ? "#4f4f4f" : hover ? "#8d8d8d" : "#6d6d6d"} stroke={hover ? "#ffffff" : "#141414"} strokeWidth={hover ? 7 : 5} />
    <path d={`M226,${y + 88} V${y + 6} H854`} fill="none" stroke={pressed ? "#3a3a3a" : "#a8a8a8"} strokeWidth={5} />
    <ShadowText x={540} y={y + 64} size={40}>{label}</ShadowText>
  </g>
);

export const DeathScreen: React.FC<{ f: number; ev: { youDied: number; subtitle: number; score: number; buttons: number; cursor: number[]; click: number } }> = ({ f, ev }) => {
  const shown = (at: number) => Math.min(1, Math.max(0, (f - at) / 4));
  const pop = (at: number) => 0.7 + 0.3 * Math.min(1, Math.max(0, (f - at) / 6));
  const t = Math.min(1, Math.max(0, (f - ev.cursor[0]) / (ev.cursor[1] - ev.cursor[0])));
  const e = t * t * (3 - 2 * t);
  const cx = 930 + (720 - 930) * e, cy = 1720 + (1236 - 1720) * e;
  const hover = f >= ev.cursor[1] - 2;
  const pressed = f >= ev.click && f < ev.click + 5;
  return (
    <g>
      <defs>
        <linearGradient id="deathRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8c0000" stopOpacity={0.62} />
          <stop offset="100%" stopColor="#3a0000" stopOpacity={0.8} />
        </linearGradient>
      </defs>
      <rect x={0} y={PANEL_TOP} width={W} height={H - PANEL_TOP} fill="url(#deathRed)" />
      <g opacity={shown(ev.youDied)} transform={`translate(540 800) scale(${pop(ev.youDied)}) translate(-540 -800)`}>
        <ShadowText x={540} y={800} size={112}>You died!</ShadowText>
      </g>
      <g opacity={shown(ev.subtitle)}><ShadowText x={540} y={920} size={38}>You hit the ground too hard</ShadowText></g>
      <g opacity={shown(ev.score)}>
        <ShadowText x={500} y={1010} size={42}>Score:</ShadowText>
        <ShadowText x={655} y={1010} size={42} fill="#ffff55">0</ShadowText>
      </g>
      <g opacity={shown(ev.buttons)}>
        <Button y={1180} label="Respawn" hover={hover} pressed={pressed} />
        <Button y={1310} label="Title Screen" hover={false} pressed={false} />
      </g>
      {f >= ev.cursor[0] && (
        <path d={`M${cx},${cy} l0,58 l14,-13 l12,27 l12,-5 l-12,-27 l19,0 z`} fill="#ffffff" stroke="#141414" strokeWidth={4} strokeLinejoin="round" />
      )}
    </g>
  );
};

/* ---------------------------- caption ----------------------------- */

export const CAPTION = ["How to survive ANY", "fall in Minecraft:"];

export const Caption: React.FC<{ lines?: string[] }> = ({ lines = CAPTION }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: W, height: PANEL_TOP, background: "#ffffff" }}>
    <div style={{ position: "absolute", left: 80, top: 111, fontFamily: "Selawik, 'Segoe UI', sans-serif", fontSize: 88, lineHeight: "118px", color: "#000", whiteSpace: "pre" }}>
      {lines.join("\n")}
    </div>
  </div>
);
