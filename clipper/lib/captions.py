"""Word-by-word burned captions, in the reference style.

Emitted as ASS because libass gives us a rounded-join outline and per-word
scale animation, which drawtext cannot do. The rounded join on a thick stroke
is what produces the signature blob silhouette — a mitred stroke of the same
width reads as a different format immediately.
"""

from . import spec


def _ass_colour(hex_colour: str, alpha: str = "00") -> str:
    """#RRGGBB -> &HAABBGGRR& (ASS is BGR with a leading alpha byte)."""
    h = hex_colour.lstrip("#")
    if len(h) != 6:
        raise ValueError(f"expected #RRGGBB, got {hex_colour!r}")
    r, g, b = h[0:2], h[2:4], h[4:6]
    return f"&H{alpha}{b}{g}{r}".upper() + "&"


def _centiseconds(t: float) -> str:
    if t < 0:
        t = 0.0
    cs = int(round(t * 100))
    h, rem = divmod(cs, 360000)
    m, rem = divmod(rem, 6000)
    s, cs = divmod(rem, 100)
    return f"{h:d}:{m:02d}:{s:02d}.{cs:02d}"


def build_ass(words, keywords=None, *, font=None, size=None, stroke=None):
    """Render a word list to an ASS subtitle document.

    words:    [{"w": str, "s": float, "e": float}, ...] — one entry per word,
              start/end in seconds, as produced by transcribe.py.
    keywords: {"redbull": "#E8202A", ...} — lowercase word -> fill colour.
              Matched on the word with punctuation stripped. Used sparingly in
              the reference: roughly one coloured word every 10-15s.
    """
    keywords = {k.lower(): v for k, v in (keywords or {}).items()}
    font = font or spec.CAPTION_FONT
    size = size or spec.CAPTION_SIZE
    stroke = spec.CAPTION_STROKE if stroke is None else stroke

    # MarginV positions the line box, not the glyph centre. The 0.572 factor is
    # measured for Poppins Black in libass and puts the word's optical centre
    # on CAPTION_CENTRE_Y.
    margin_v = int(round(spec.HEIGHT * (1.0 - spec.CAPTION_CENTRE_Y) - size * 0.572))

    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {spec.WIDTH}
PlayResY: {spec.HEIGHT}
WrapStyle: 2
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Word,{font},{size},{_ass_colour(spec.CAPTION_COLOR)},{_ass_colour(spec.CAPTION_COLOR)},{_ass_colour(spec.CAPTION_STROKE_COLOR)},{_ass_colour("#000000", "80")},0,0,0,0,100,100,0,0,1,{stroke},0,2,40,40,{margin_v},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

    lines = []
    for i, w in enumerate(words):
        text = str(w["w"]).strip()
        if not text:
            continue
        start = float(w["s"])
        # Hold each word until the next one starts so there is never a gap;
        # the reference never shows an empty caption slot mid-sentence.
        if i + 1 < len(words):
            end = max(float(words[i + 1]["s"]), start + 0.05)
        else:
            end = max(float(w["e"]), start + 0.20)

        key = text.lower().strip(".,!?\"'():;-—")
        colour = keywords.get(key)

        # Fast scale pop on entry, settling within CAPTION_POP_MS.
        tags = (
            f"\\fscx{spec.CAPTION_POP_SCALE}\\fscy{spec.CAPTION_POP_SCALE}"
            f"\\t(0,{spec.CAPTION_POP_MS},\\fscx100\\fscy100)"
        )
        if colour:
            tags += f"\\c{_ass_colour(colour)}"

        body = text.replace("\\", "\\\\").replace("{", "\\{").replace("}", "\\}")
        lines.append(
            f"Dialogue: 0,{_centiseconds(start)},{_centiseconds(end)},Word,,0,0,0,,"
            f"{{{tags}}}{body.lower()}"
        )

    return head + "\n".join(lines) + "\n"


def write_ass(path, words, keywords=None, **kw):
    doc = build_ass(words, keywords, **kw)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(doc)
    return path
