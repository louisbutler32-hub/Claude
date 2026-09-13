"""Cut source footage and composite it into the reference's vertical frame.

The frame is: the same source frame scaled to cover 1080x1920 and heavily
blurred, with a sharp 1080x960 panel overlaid dead centre. The panel is fed by
scaling the source to 960 tall and cropping to 1080 wide — a ~63% horizontal
crop, which is why the format lives on close-ups and why `pan` exists.
"""

import os
import shlex
import subprocess

from . import spec


def run(cmd, **kw):
    """Run ffmpeg, raising with its stderr attached when it fails."""
    proc = subprocess.run(
        cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, **kw
    )
    if proc.returncode != 0:
        tail = "\n".join(proc.stderr.strip().splitlines()[-25:])
        raise RuntimeError(
            f"ffmpeg failed ({proc.returncode})\n"
            f"  cmd: {' '.join(shlex.quote(c) for c in cmd[:14])} ...\n{tail}"
        )
    return proc


def probe_duration(path):
    out = run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=nw=1:nk=1", path,
    ]).stdout.strip()
    return float(out)


def composite_filter(pan=0.0, zoom=1.0):
    """Filter graph turning one source stream into the 1080x1920 frame.

    pan:  -1..1, horizontal position of the panel crop within the source
          (0 = centre). Use it when the subject sits off to one side.
    zoom: >1 punches in on the panel content.
    """
    pan = max(-1.0, min(1.0, float(pan)))
    # Panel: scale to cover the panel box, then crop to it.
    panel_w = int(round(spec.WIDTH * zoom))
    panel_h = int(round(spec.PANEL_H * zoom))
    # crop x expressed against the scaled width, shifted by pan
    crop_x = f"(iw-{spec.WIDTH})/2+{pan}*(iw-{spec.WIDTH})/2"

    return (
        f"[0:v]split=2[bg][fg];"
        # blurred bed covering the whole frame
        f"[bg]scale={spec.WIDTH}:{spec.HEIGHT}:force_original_aspect_ratio=increase,"
        f"crop={spec.WIDTH}:{spec.HEIGHT},"
        f"gblur=sigma={spec.BAND_BLUR_SIGMA},"
        f"eq=brightness=-0.06[bgb];"
        # sharp centre panel
        f"[fg]scale={panel_w}:{panel_h}:force_original_aspect_ratio=increase,"
        f"crop={spec.WIDTH}:{spec.PANEL_H}:{crop_x}:(ih-{spec.PANEL_H})/2[fgs];"
        f"[bgb][fgs]overlay=0:{spec.PANEL_Y}:format=auto,"
        f"fps={spec.FPS},setsar=1[v]"
    )


def cut_clip(source, start, end, out_path, pan=0.0, zoom=1.0, crf=16):
    """Extract one shot and composite it. Input-level seek keeps this fast."""
    dur = float(end) - float(start)
    if dur <= 0:
        raise ValueError(f"clip has non-positive duration: {start} -> {end}")
    cmd = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-ss", f"{float(start):.3f}", "-t", f"{dur:.3f}", "-i", source,
        "-filter_complex", composite_filter(pan, zoom),
        "-map", "[v]", "-an",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", str(crf),
        "-pix_fmt", "yuv420p", out_path,
    ]
    run(cmd)
    return out_path


def cut_all(source, clips, workdir, on_progress=None):
    """Cut every shot in the edit list. Returns the intermediate paths."""
    os.makedirs(workdir, exist_ok=True)
    paths = []
    for i, c in enumerate(clips):
        out = os.path.join(workdir, f"shot_{i:03d}.mp4")
        cut_clip(
            source, c["in"], c["out"], out,
            pan=c.get("pan", 0.0), zoom=c.get("zoom", 1.0),
        )
        paths.append(out)
        if on_progress:
            on_progress(i + 1, len(clips))
    return paths


def concat(paths, out_path, workdir):
    """Stream-concat the shots. All were encoded identically, so this is a copy."""
    listing = os.path.join(workdir, "concat.txt")
    with open(listing, "w") as fh:
        for p in paths:
            fh.write(f"file '{os.path.abspath(p)}'\n")
    run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-f", "concat", "-safe", "0", "-i", listing,
        "-c", "copy", out_path,
    ])
    return out_path
