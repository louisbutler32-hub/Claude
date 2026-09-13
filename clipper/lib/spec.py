"""Every number here was measured off the reference video.

Reference: "He Compressed 100 RedBulls into 1 Drink" (Tested And Proved, 15.4M).
See FORMAT.md for how each figure was derived. Change these and you are no
longer making the same format.
"""

# ---------------------------------------------------------------- canvas
WIDTH = 1080
HEIGHT = 1920
FPS = 60

# The main content panel is exactly half the frame height, dead centre.
PANEL_H = 960
PANEL_Y = (HEIGHT - PANEL_H) // 2          # 480

# Source 16:9 is centre-cropped to this aspect before filling the panel,
# so the action keeps its full width instead of being cropped into.
SOURCE_CROP_ASPECT = 1.125

# Top/bottom bands: same frame, scaled up and blurred to near-mush.
# Measured sharpness: panel 222.3, bands 3.9 / 0.5.
BAND_BLUR_SIGMA = 40
BAND_ZOOM = 2.2

# ---------------------------------------------------------------- captions
CAPTION_FONT = "Poppins Black"
CAPTION_FONT_FILE = "Poppins-Black.ttf"
CAPTION_SIZE = 138                         # fitted so "cans" fill box = 217x51, as measured
CAPTION_STROKE = 15                        # measured outward stroke, rounded join
CAPTION_COLOR = "#FFFFFF"
CAPTION_STROKE_COLOR = "#000000"
CAPTION_CENTRE_Y = 0.711                   # 1364 / 1920
CAPTION_POP_SCALE = 112                    # % on word entry
CAPTION_POP_MS = 70                        # settle time back to 100%

# ---------------------------------------------------------------- pacing
# Targets the checklist in FORMAT.md validates against.
TARGET_WPM = 194
HOOK_WPM_MIN = 240
HOOK_MAX_S = 3.5
SHOT_MAX_S = 1.5                           # except either side of the turn
SHOT_MEDIAN_S = 0.98
TURN_POSITION = (0.55, 0.62)               # fraction of runtime
MAX_SENTENCE_GAP_S = 0.4
NUMBER_EVERY_S = 8

# ---------------------------------------------------------------- audio
LUFS_TARGET = -17.3
LRA_TARGET = 3.2                           # extremely flat; Shorts mastering
TRUE_PEAK = -0.1                           # ref clips at +1.2; we stop at -0.1
MUSIC_DUCK_DB = -11                        # bed sits this far under the VO

# ---------------------------------------------------------------- annotations
ANNOTATION_RED = "#E8202A"
ANNOTATION_WHITE = "#FFFFFF"
ANNOTATION_DEFAULT_DUR = 1.0
