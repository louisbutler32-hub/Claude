"""Mix and master the audio bed.

Reference measured at -17.3 LUFS integrated with a loudness range of 3.2 LU —
that is nearly flat. Every word sits at the same level so the video survives a
phone speaker in a noisy room. We compress hard, then normalise, and stop at
-0.1 dBTP rather than clipping the way the reference does at +1.2.
"""

import os

from . import spec
from .video import run


def _duck_chain(music_in, vo_ref, out_label):
    """Sidechain the bed under the VO so words always cut through."""
    return (
        f"[{music_in}][{vo_ref}]sidechaincompress="
        f"threshold=0.03:ratio=8:attack=5:release=300:makeup=1[{out_label}]"
    )


def build_mix(
    out_path,
    duration,
    vo=None,
    music=None,
    source_video=None,
    source_windows=None,
    music_gain_db=None,
):
    """Produce the finished audio track.

    vo:             narration wav/mp3, laid at full level from t=0
    music:          bed, trimmed/looped to `duration`, ducked under the VO
    source_video:   the cut video, for passing original audio through
    source_windows: [[start, end], ...] where source audio is heard — the
                    reference uses this once, for the creator's own reaction
                    in the final beat
    """
    music_gain_db = spec.MUSIC_DUCK_DB if music_gain_db is None else music_gain_db
    source_windows = source_windows or []

    inputs, filters, mix_labels = [], [], []
    idx = 0

    if vo:
        inputs += ["-i", vo]
        filters.append(f"[{idx}:a]aformat=sample_fmts=fltp:sample_rates=48000:"
                       f"channel_layouts=stereo,apad,atrim=0:{duration:.3f}[vo]")
        mix_labels.append("vo")
        vo_idx = idx
        idx += 1
    else:
        vo_idx = None

    if music:
        inputs += ["-stream_loop", "-1", "-i", music]
        filters.append(
            f"[{idx}:a]aformat=sample_fmts=fltp:sample_rates=48000:"
            f"channel_layouts=stereo,atrim=0:{duration:.3f},"
            f"volume={music_gain_db}dB,"
            f"afade=t=out:st={max(0.0, duration - 1.5):.3f}:d=1.5[musicraw]"
        )
        if vo_idx is not None:
            # duplicate the VO to use as the sidechain key
            filters.append("[vo]asplit=2[vo_out][vo_key]")
            filters.append(_duck_chain("musicraw", "vo_key", "music"))
            mix_labels = ["vo_out", "music"]
        else:
            filters.append("[musicraw]anull[music]")
            mix_labels.append("music")
        idx += 1

    if source_video and source_windows:
        inputs += ["-i", source_video]
        gates = "+".join(
            f"between(t,{float(a):.3f},{float(b):.3f})" for a, b in source_windows
        )
        filters.append(
            f"[{idx}:a]aformat=sample_fmts=fltp:sample_rates=48000:"
            f"channel_layouts=stereo,volume='{gates}':eval=frame[src]"
        )
        mix_labels.append("src")
        idx += 1

    if not mix_labels:
        raise ValueError("nothing to mix: provide vo, music or source audio")

    joined = "".join(f"[{m}]" for m in mix_labels)
    filters.append(
        f"{joined}amix=inputs={len(mix_labels)}:duration=first:"
        f"dropout_transition=0:normalize=0[mixed]"
    )
    # Flatten first, then normalise — loudnorm alone will not reach LRA 3.2.
    filters.append(
        "[mixed]acompressor=threshold=-18dB:ratio=4:attack=5:release=120:makeup=2,"
        "alimiter=limit=0.97,"
        f"loudnorm=I={spec.LUFS_TARGET}:LRA={spec.LRA_TARGET}:TP={spec.TRUE_PEAK}"
        "[out]"
    )

    cmd = (
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y"]
        + inputs
        + ["-filter_complex", ";".join(filters),
           "-map", "[out]", "-t", f"{duration:.3f}",
           "-c:a", "pcm_s16le", "-ar", "48000", "-ac", "2", out_path]
    )
    run(cmd)
    return out_path


def measure(path):
    """Report integrated loudness / LRA / peak so a render can be checked."""
    proc = run(["ffmpeg", "-hide_banner", "-i", path, "-af", "ebur128=peak=true",
                "-f", "null", "-"])
    stats = {}
    for line in proc.stderr.splitlines():
        line = line.strip()
        for key, label in (("I:", "lufs"), ("LRA:", "lra"), ("Peak:", "peak")):
            if line.startswith(key):
                try:
                    stats[label] = float(line.split()[1])
                except (IndexError, ValueError):
                    pass
    return stats
