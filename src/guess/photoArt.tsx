import React from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { Body } from "./art";
import type { GuessArt } from "./types";

/**
 * Real-photo cutouts as art, for the episodes that use them instead of
 * hand-drawn vector characters.
 *
 * The silhouette trick still works unchanged: `Body` just wraps its
 * children in a `<g>` with a CSS filter, and an SVG `<image>` responds to
 * that filter exactly like a `<path>` does. So a photo cutout is a drop-in
 * `GuessArt` — Board.tsx, GuessVideo.tsx and every thumbnail stay untouched.
 *
 * Every cutout is pre-trimmed to its own alpha bounding box (see
 * scripts/finalize-photo-cutouts.py), so `width`/`height` in the credit is
 * the subject's real footprint, not the padded source photo — that's what
 * makes `Math.min(BOX / w, BOX / h)` a fair fit against the hand-drawn
 * cast's roughly-200-unit characters.
 */

export type PhotoCredit = {
  id: string;
  file: string;
  width: number;
  height: number;
  title: string;
  license: string;
  creator: string;
  page: string;
};

const BOX = 210;

export function photoArt(
  episode: string,
  credits: PhotoCredit[]
): Record<string, GuessArt> {
  const out: Record<string, GuessArt> = {};
  for (const c of credits) {
    const scale = Math.min(BOX / c.width, BOX / c.height);
    const w = c.width * scale;
    const h = c.height * scale;
    const src = staticFile(`images/${episode}/${c.file}`);
    out[c.id] = ({ sil }) => (
      <Body sil={sil}>
        <image href={src} x={-w / 2} y={-h / 2} width={w} height={h} />
      </Body>
    );
  }
  return out;
}

/** Preload every photo so no frame is captured before it's decoded —
 *  Remotion's frame server needs the delayRender/continueRender pair or a
 *  still can land mid-decode. Call once per composition that uses these. */
export function usePhotoArt(episode: string, credits: PhotoCredit[]) {
  const [handle] = React.useState(() => delayRender(`${episode}-photos`));
  React.useEffect(() => {
    Promise.all(
      credits.map(
        (c) =>
          new Promise<void>((done) => {
            const img = new window.Image();
            img.onload = () => done();
            img.onerror = () => done();
            img.src = staticFile(`images/${episode}/${c.file}`);
          })
      )
    ).then(() => continueRender(handle));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);
}
