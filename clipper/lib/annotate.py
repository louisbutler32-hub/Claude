"""Hand-drawn style arrows and circles.

The reference uses 4-6 of these per video: a thick red arrow, a rough red
ellipse around apparatus, a white double-ring around a held object. They appear
for about a second on the beat the voiceover names the thing. Their job is to
make a cluttered lab frame legible at phone size.

Drawn as transparent PNGs and overlaid, with a slight wobble so they read as
drawn rather than generated.
"""

import math
import os
import random

from PIL import Image, ImageDraw

from . import spec


def _rgba(hex_colour, alpha=255):
    h = hex_colour.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), alpha)


def _wobble(points, amount, rng):
    return [(x + rng.uniform(-amount, amount), y + rng.uniform(-amount, amount))
            for x, y in points]


def draw_arrow(size=(520, 520), colour=spec.ANNOTATION_RED, angle=45,
               width=34, seed=0):
    """Thick angled arrow, pointing toward the lower-left by default."""
    rng = random.Random(seed)
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    w, h = size
    cx, cy = w / 2, h / 2
    a = math.radians(angle)
    length = min(w, h) * 0.36
    tail = (cx + math.cos(a) * length, cy - math.sin(a) * length)
    head = (cx - math.cos(a) * length, cy + math.sin(a) * length)

    shaft = _wobble([tail, head], 4, rng)
    d.line(shaft, fill=_rgba(colour), width=width, joint="curve")

    # arrowhead
    barb = math.radians(30)
    hl = length * 0.62
    for s in (+1, -1):
        b = a + math.pi + s * barb
        tip = (head[0] + math.cos(b) * hl * -1, head[1] - math.sin(b) * hl * -1)
        d.line(_wobble([head, tip], 3, rng), fill=_rgba(colour), width=width,
               joint="curve")
    return img


def draw_circle(size=(560, 460), colour=spec.ANNOTATION_RED, width=26,
                rings=1, seed=0):
    """Rough hand-drawn ellipse. rings=2 gives the white double-ring look."""
    rng = random.Random(seed)
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    w, h = size
    for r in range(rings):
        inset = width * 1.6 * r + width
        pts = []
        steps = 72
        # start at a random angle and overshoot, the way a drawn loop closes
        start = rng.uniform(0, math.tau)
        for i in range(steps + 8):
            t = start + (i / steps) * math.tau
            rx = (w - inset * 2) / 2 * rng.uniform(0.985, 1.015)
            ry = (h - inset * 2) / 2 * rng.uniform(0.985, 1.015)
            pts.append((w / 2 + math.cos(t) * rx, h / 2 + math.sin(t) * ry))
        d.line(pts, fill=_rgba(colour), width=width, joint="curve")
    return img


def render_annotation_assets(annotations, workdir):
    """Rasterise each annotation to a PNG. Returns [(path, spec), ...]."""
    os.makedirs(workdir, exist_ok=True)
    out = []
    for i, a in enumerate(annotations):
        kind = a.get("type", "arrow")
        colour = a.get("colour", spec.ANNOTATION_RED)
        if kind == "arrow":
            img = draw_arrow(colour=colour, angle=a.get("angle", 45), seed=i)
        elif kind == "circle":
            img = draw_circle(colour=colour, rings=a.get("rings", 1), seed=i)
        elif kind == "double-circle":
            img = draw_circle(colour=a.get("colour", spec.ANNOTATION_WHITE),
                              rings=2, seed=i)
        else:
            raise ValueError(f"unknown annotation type {kind!r}")
        scale = a.get("scale", 1.0)
        if scale != 1.0:
            img = img.resize((int(img.width * scale), int(img.height * scale)),
                             Image.LANCZOS)
        path = os.path.join(workdir, f"anno_{i:02d}.png")
        img.save(path)
        out.append((path, a))
    return out


def overlay_filter(assets, video_label, first_input_index):
    """Chain overlays onto the burned video, each gated to its own window.

    Returns (final_label, ffmpeg_input_args, filter_parts). Annotation PNGs
    occupy ffmpeg inputs starting at `first_input_index`.
    """
    if not assets:
        return video_label, [], []
    inputs, parts = [], []
    cur = video_label
    for i, (path, a) in enumerate(assets):
        # Loop the still so it becomes a stream with advancing timestamps —
        # a single frame sits at t=0 forever and the fade below never fires.
        inputs += ["-loop", "1", "-framerate", str(spec.FPS), "-i", path]
        t = float(a["t"])
        dur = float(a.get("dur", spec.ANNOTATION_DEFAULT_DUR))
        fade = min(0.12, dur / 4)
        # position is 0..1 of the frame and refers to the asset's centre
        x = f"{a.get('x', 0.5)}*W-w/2"
        y = f"{a.get('y', 0.5)}*H-h/2"
        src = f"a{i}"
        nxt = f"ov{i}"
        parts.append(
            f"[{first_input_index + i}:v]format=rgba,"
            f"fade=t=in:st={t:.3f}:d={fade:.3f}:alpha=1,"
            f"fade=t=out:st={t + dur - fade:.3f}:d={fade:.3f}:alpha=1[{src}]"
        )
        parts.append(
            f"[{cur}][{src}]overlay={x}:{y}:"
            f"enable='between(t,{t:.3f},{t + dur:.3f})'[{nxt}]"
        )
        cur = nxt
    return cur, inputs, parts
