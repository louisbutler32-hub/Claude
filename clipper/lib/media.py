"""Finding the files a project needs, and saying something useful when they
are not there.

The configured filename is a hint, not a requirement. Whatever you name the
download, if it is the only video in `source/` the pipeline uses it — the point
of failure should never be a filename mismatch.
"""

import os

VIDEO_EXT = {".mp4", ".mkv", ".webm", ".mov", ".m4v", ".avi", ".ts", ".flv"}
AUDIO_EXT = {".wav", ".mp3", ".m4a", ".aac", ".flac", ".ogg", ".opus"}


def _candidates(folder, exts):
    if not os.path.isdir(folder):
        return []
    found = []
    for name in sorted(os.listdir(folder)):
        if name.startswith("."):
            continue
        if os.path.splitext(name)[1].lower() in exts:
            found.append(os.path.join(folder, name))
    return found


def _describe(folder):
    """What is actually sitting in the folder, for the error message."""
    if not os.path.isdir(folder):
        return "  (the folder does not exist)"
    names = [n for n in sorted(os.listdir(folder)) if not n.startswith(".")]
    if not names:
        return "  (the folder is empty)"
    return "\n".join(f"  - {n}" for n in names)


def find(kind, configured, folder, *, required=True, label=None, key=None):
    """Resolve one input file.

    Order: the configured path if it exists, else the only file of the right
    type in `folder`. Anything else raises with what to do about it.
    """
    exts = VIDEO_EXT if kind == "video" else AUDIO_EXT
    label = label or kind
    key = key or kind

    if configured and os.path.exists(configured):
        return configured

    found = _candidates(folder, exts)

    if len(found) == 1:
        if configured and os.path.basename(configured) != os.path.basename(found[0]):
            print(f"note: using {os.path.basename(found[0])} as the {label} "
                  f"(config says {os.path.basename(configured)})")
        return found[0]

    if not required and not found:
        return None

    rel = os.path.relpath(folder, os.getcwd())
    if len(found) > 1:
        listing = "\n".join(f"  - {os.path.basename(f)}" for f in found)
        raise SystemExit(
            f"more than one {label} file in {rel}/ — set \"{key}\" in the "
            f"config to the one you want:\n{listing}"
        )

    raise SystemExit(
        f"no {label} found.\n\n"
        f"Put the file in:  {rel}/\n"
        f"Any filename works — it just has to be the only "
        f"{'video' if kind == 'video' else 'audio'} file in there.\n\n"
        f"What is in that folder now:\n{_describe(folder)}"
    )
