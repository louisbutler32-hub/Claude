import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { PerspectiveTitle, makeTitle } from "./PerspectiveTitle";
import { TitleScene } from "./TitleScene";
import {
  CARD_LABEL,
  CARD_LABEL_VERTICAL,
  CARD_MAIN,
  CARD_MAIN_VERTICAL,
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

export const KateSplitCardsVertical: React.FC = () => (
  <TitleScene
    config={CARD_MAIN_VERTICAL}
    secondConfig={makeTitle(CARD_LABEL_VERTICAL, { startDelay: 0.28 })}
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

/** Both cards in one file, staggered — handy for checking they line up. */
export const KateOverlaySplit: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "transparent" }}>
    <PerspectiveTitle config={makeTitle(CARD_MAIN, { exitStart: 4.3 })} />
    <Sequence from={8}>
      <PerspectiveTitle config={makeTitle(CARD_LABEL, { exitStart: 4.0 })} />
    </Sequence>
  </AbsoluteFill>
);

// ── One line per file ──────────────────────────────────────────────────
// Two genuinely separate overlays: the name and the label each render to
// their own transparent file, so they can be placed, timed and moved
// independently on a timeline. Their default positions are the reference
// layout, so dropping both in unchanged stacks them correctly.

export const NameOverlay: React.FC = () => (
  <Overlay config={makeTitle(CARD_MAIN, { exitStart: 4.3 })} />
);

export const LabelOverlay: React.FC = () => (
  <Overlay config={makeTitle(CARD_LABEL, { exitStart: 4.3 })} />
);

export const NameOverlayVertical: React.FC = () => (
  <Overlay config={makeTitle(CARD_MAIN_VERTICAL, { exitStart: 4.3 })} />
);

export const LabelOverlayVertical: React.FC = () => (
  <Overlay config={makeTitle(CARD_LABEL_VERTICAL, { exitStart: 4.3 })} />
);
