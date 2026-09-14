import React from "react";
import { continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { H, STROKE, W, blob, ink, line, rng } from "../planets/kit";
import credits from "../../public/assets/img/earth/credits.json";

// Real photographs, sitting inside a hand-drawn world.
//
// The rule from docs/format-v2.md: the drawing does the explaining, the
// photograph is the evidence. So a photo never arrives as a clean rectangle
// dropped on the page — it comes in through a torn, wobbly hole in the paper,
// the same wobble the rest of the art is drawn with. That keeps the channel's
// identity while still showing the viewer the real thing.

type Credit = {
  slug: string; file: string; title: string;
  licence: string; credit: string; page: string; size: number[];
};

export const CREDITS = credits as Credit[];
const bySlug = new Map(CREDITS.map((c) => [c.slug, c]));

export const hasPhoto = (slug: string) => bySlug.has(slug);

/** Preload every photo so no frame renders against a half-decoded image. */
export const usePhotos = () => {
  const [handle] = React.useState(() => delayRender("earth-photos"));
  React.useEffect(() => {
    Promise.all(
      CREDITS.map(
        (c) =>
          new Promise((done) => {
            const img = new Image();
            img.onload = done;
            img.onerror = done;
            img.src = staticFile(`assets/${c.file}`);
          })
      )
    ).then(() => continueRender(handle));
  }, [handle]);
};

/**
 * A photograph shown through a torn hole in the paper.
 *
 * `push` is the Ken Burns amount over the life of the shot — kept small,
 * because the movement that matters is what happens *on top* of the photo,
 * not the photo drifting about underneath.
 */
export const Photo: React.FC<{
  slug: string;
  x?: number; y?: number; w?: number; h?: number;
  push?: number;
  seed?: number;
  credit?: boolean;
  opacity?: number;
}> = ({
  slug, x = 0, y = 0, w = W, h = H,
  push = 0.06, seed = 7, credit = true, opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const c = bySlug.get(slug);
  if (!c) return null;

  const t = durationInFrames > 1 ? Math.min(1, frame / durationInFrames) : 0;
  const s = 1 + push * t;
  const id = `tear-${slug}-${Math.round(x)}-${Math.round(y)}`;

  // The torn edge: one wobbly closed ring, same generator as every other
  // hand-drawn shape in the kit, so it sits in the same world.
  const cx = x + w / 2;
  const cy = y + h / 2;
  const r = Math.max(w, h) * 0.52;
  const hole = blob(cx, cy, r, seed, 0.035);

  // Cover-fit: fill the hole without distorting the photograph.
  const [iw, ih] = c.size;
  const scale = Math.max(w / iw, h / ih) * s;
  const dw = iw * scale;
  const dh = ih * scale;

  return (
    <g opacity={opacity}>
      <defs>
        <clipPath id={id}>
          <path d={hole} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <image
          href={staticFile(`assets/${c.file}`)}
          x={cx - dw / 2}
          y={cy - dh / 2}
          width={dw}
          height={dh}
          preserveAspectRatio="xMidYMid slice"
        />
      </g>
      <path d={hole} {...line(STROKE - 1)} fill="none" />
      {credit ? (
        <text
          x={x + 14}
          y={y + h - 12}
          fontSize={17}
          fill="#ffffff"
          opacity={0.62}
          style={{ fontFamily: "'ComicRelief', 'Comic Sans MS', cursive" }}
        >
          {c.credit}
        </text>
      ) : null}
    </g>
  );
};

/** Full-bleed photograph, for the beats where the real thing is the scene. */
export const PhotoFull: React.FC<{ slug: string; push?: number; seed?: number }> = ({
  slug, push = 0.07, seed = 3,
}) => <Photo slug={slug} x={-40} y={-40} w={W + 80} h={H + 80} push={push} seed={seed} />;
