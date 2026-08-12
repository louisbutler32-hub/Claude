import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { PerspectiveTitle, makeTitle } from "./PerspectiveTitle";
import { TitleScene } from "./TitleScene";
import {
  CARD_LABEL,
  CARD_MAIN,
  NAKAJIMA_KATE,
  NAKAJIMA_KATE_PINNED,
  NAKAJIMA_KATE_VERTICAL,
} from "./presets";

export const TITLE_DURATION_IN_FRAMES = 150; // 5s @ 30fps

// ── In-scene demos ─────────────────────────────────────────────────────
// Drop your own plate in by passing `backgroundSrc` (and `occluderSrc` or
// `occluderPolygon` for the foreground subject).

export const KateScene: React.FC = () => (
  <TitleScene config={NAKAJIMA_KATE} demoOccluder />
);

export const KateSceneVertical: React.FC = () => (
  <TitleScene config={NAKAJIMA_KATE_VERTICAL} demoOccluder />
);

/** Corner-pinned variant: the plane is warped into four traced points. */
export const KateScenePinned: React.FC = () => (
  <TitleScene config={NAKAJIMA_KATE_PINNED} demoOccluder />
);

/** The two lines as fully independent cards, landing on separate beats. */
export const KateSplitCards: React.FC = () => (
  <TitleScene
    config={CARD_MAIN}
    secondConfig={makeTitle(CARD_LABEL, { startDelay: 0.28 })}
    demoOccluder
  />
);

// ── Transparent overlays ───────────────────────────────────────────────
// Render these with an alpha codec and drop the file straight onto your
// timeline in Premiere / Resolve / CapCut. See `npm run title:alpha`.

const Overlay: React.FC<{ config: Parameters<typeof PerspectiveTitle>[0]["config"] }> = ({
  config,
}) => (
  <AbsoluteFill style={{ backgroundColor: "transparent" }}>
    <PerspectiveTitle config={config} />
  </AbsoluteFill>
);

export const KateOverlay: React.FC = () => (
  <Overlay config={makeTitle(NAKAJIMA_KATE, { exitStart: 4.3 })} />
);

export const KateOverlayVertical: React.FC = () => (
  <Overlay config={makeTitle(NAKAJIMA_KATE_VERTICAL, { exitStart: 4.3 })} />
);

/** Same overlay, but showing how to stagger two separate cards. */
export const KateOverlaySplit: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "transparent" }}>
    <PerspectiveTitle config={makeTitle(CARD_MAIN, { exitStart: 4.3 })} />
    <Sequence from={8}>
      <PerspectiveTitle config={makeTitle(CARD_LABEL, { exitStart: 4.0 })} />
    </Sequence>
  </AbsoluteFill>
);
