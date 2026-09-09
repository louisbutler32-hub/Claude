#!/usr/bin/env python3
"""
Builds the full soundtrack for one episode of the guess format.

Three layers, all placed on the same frame grid the animation uses
(30 fps, 120-frame intro, 1560-frame rounds — see src/veggies/rounds.ts):

  voice   38 lines read by the edge-tts "Ana" child voice
  sfx     synthesised here, so there is nothing to license
  music   a soft marimba bed, ducked under the voice

Output: public/audio/<subject>-mix.mp3

Usage:  python3 scripts/build-audio.py [veggies|animals]
Needs:  pip install numpy edge-tts   (plus ffmpeg on PATH)
"""

import os, subprocess, shutil, sys, math, wave, struct
import numpy as np

SR = 44100
FPS = 30
INTRO_LEN = 120
ROUND_LEN = 1560

# Two readers: a child who plays the guessing game, and a narrator who
# explains what is on screen and asks the viewer the questions.
VOICES = {
    "ana":  ("en-US-AnaNeural",  "-5%"),   # the kid
    "emma": ("en-US-EmmaNeural", "-12%"),  # the narrator
    # counting twelve things inside one beat needs a brisker read than
    # Ana's normal pace, or the numbers slur into each other
    "ana_fast": ("en-US-AnaNeural", "+22%"),
}

SUBJECT = (sys.argv[1] if len(sys.argv) > 1 else "veggies").lower()

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORK = os.path.join(ROOT, ".audio-build", SUBJECT)
OUT_DIR = os.path.join(ROOT, "public", "audio")
OUT = os.path.join(OUT_DIR, f"{SUBJECT}-mix.mp3")

FFMPEG = os.environ.get("FFMPEG", "ffmpeg")

# ── beats, mirroring BEAT in src/veggies/rounds.ts ────────────────────
B_HOP_IN, B_HOP_OUT = 130, 320
B_SIL_RISE = 350
B_QUESTION = 382
B_FLASH = 518
B_NAME = 546
B_DESC = 668
B_PEEK = 150          # narrator: something is hiding
B_WHERE = 806         # narrator: let's see where it grows
B_FACT = 890          # narrator: how it actually grows
B_CROC = 1046         # narrator: here comes the crocodile
B_SOUND_Q = 1042      # narrator: listen, what does it say?
B_SOUND = 1146        # the animal itself
B_CHOMP = 1104
B_ASK = 1225          # narrator: where does it go on the board?
                      # (animals run later — the doubled noises are long)
B_COUNT = 1418        # narrator: praise + running count
B_BOARD_RISE = 1212
B_BOARD_POP = 1256
B_LAND = 1382
B_CELEBRATE = 1386

# ── the script ────────────────────────────────────────────────────────
# Each entry: (id, Ana names it, Ana describes it, Emma says where/how)
VEGGIE_ROUNDS = [
    ("carrot",   "It's a carrot! Carrot.",      "A crunchy orange carrot.",
     "Carrots grow under the ground. Only their tops peek out!"),
    ("corn",     "It's corn! Corn.",            "Sweet yellow corn.",
     "Corn grows on tall stalks, way up high."),
    ("tomato",   "It's a tomato! Tomato.",      "A round red tomato.",
     "Tomatoes grow on a vine, and turn from green to red."),
    ("pumpkin",  "It's a pumpkin! Pumpkin.",    "A big orange pumpkin.",
     "Pumpkins grow on the ground, on a long curly vine."),
    ("pepper",   "It's a bell pepper! Pepper.", "A shiny red pepper.",
     "Peppers grow on a little bush, hanging down like bells."),
    ("cucumber", "It's a cucumber! Cucumber.",  "A long green cucumber.",
     "Cucumbers climb up a trellis, on curly green vines."),
    ("potato",   "It's a potato! Potato.",      "A lumpy brown potato.",
     "Potatoes grow under the ground, hiding in the soil."),
    ("onion",    "It's an onion! Onion.",       "A purple papery onion.",
     "Onions grow under the ground, with green shoots on top."),
    ("eggplant", "It's an eggplant! Eggplant.", "A shiny purple eggplant.",
     "Eggplants hang down from a bush, like purple teardrops."),
    ("peas",     "It's peas! Peas.",            "Little green peas in a pod.",
     "Peas grow inside a pod, all lined up in a row."),
    ("broccoli", "It's broccoli! Broccoli.",    "Big bushy green broccoli.",
     "Broccoli grows on a thick stalk, like a little green tree!"),
    ("mushroom", "It's a mushroom! Mushroom.",  "A cute little mushroom.",
     "Mushrooms grow in the shade, near old logs and trees."),
]

# Animals carry a fifth field: the noise Ana makes on the sound beat.
ANIMAL_ROUNDS = [
    ("cow",      "It's a cow! Cow.",           "A big black and white cow.",
     "Cows live on a farm, out in the green fields.", "Moo! Moooo!"),
    ("lion",     "It's a lion! Lion.",         "A fluffy golden lion.",
     "Lions live where it's hot and dry, and nap on warm rocks.", "Roar!"),
    ("duck",     "It's a duck! Duck.",         "A yellow duck.",
     "Ducks live on a pond, and paddle about all day.", "Quack! Quack!"),
    ("frog",     "It's a frog! Frog.",         "A little green frog.",
     "Frogs live by the pond, and hop on the lily pads.", "Ribbit! Ribbit!"),
    ("pig",      "It's a pig! Pig.",           "A round pink pig.",
     "Pigs live on the farm, and love a good muddy puddle.", "Oink! Oink!"),
    ("penguin",  "It's a penguin! Penguin.",   "A little black and white penguin.",
     "Penguins live where it's icy and cold, and swim in the sea.", "Squawk!"),
    ("owl",      "It's an owl! Owl.",          "A brown owl with big round eyes.",
     "Owls live in a hole in a tree, and stay awake at night.", "Hoo! Hoo!"),
    ("elephant", "It's an elephant! Elephant.", "A big grey elephant.",
     "Elephants live where it's hot, and rest under the shady trees.", "Tooooot!"),
    ("sheep",    "It's a sheep! Sheep.",       "A fluffy white sheep.",
     "Sheep live on the farm, in a field behind the fence.", "Baa! Baa!"),
    ("fish",     "It's a fish! Fish.",         "An orange fish.",
     "Fish live in the water, and swim about all day.", "Blub, blub!"),
    ("cat",      "It's a cat! Cat.",           "A soft little cat.",
     "Cats live in a house, with us!", "Meow! Meow!"),
    ("dog",      "It's a dog! Dog.",           "A happy brown dog.",
     "Dogs live with us too, in a house or a cosy kennel.", "Woof! Woof!"),
]

# Numbers: (id, Ana names it, Ana describes it, Emma leads the count, plural)
NUMBER_ROUNDS = [
    ("1",  "It's number one! One.",       "The number one.",
     "Let's count to one!",    "carrot"),
    ("2",  "It's number two! Two.",       "The number two.",
     "Let's count to two!",    "tomatoes"),
    ("3",  "It's number three! Three.",   "The number three.",
     "Let's count to three!",  "ducks"),
    ("4",  "It's number four! Four.",     "The number four.",
     "Let's count to four!",   "broccolis"),
    ("5",  "It's number five! Five.",     "The number five.",
     "Let's count to five!",   "fish"),
    ("6",  "It's number six! Six.",       "The number six.",
     "Let's count to six!",    "pumpkins"),
    ("7",  "It's number seven! Seven.",   "The number seven.",
     "Let's count to seven!",  "frogs"),
    ("8",  "It's number eight! Eight.",   "The number eight.",
     "Let's count to eight!",  "corn cobs"),
    ("9",  "It's number nine! Nine.",     "The number nine.",
     "Let's count to nine!",   "mushrooms"),
    ("10", "It's number ten! Ten.",       "The number ten.",
     "Let's count to ten!",    "pea pods"),
    ("11", "It's number eleven! Eleven.", "The number eleven.",
     "Let's count to eleven!", "tomatoes"),
    ("12", "It's number twelve! Twelve.", "The number twelve.",
     "Let's count to twelve!", "carrots"),
]

# The counting Short: 30 seconds, one straight run from one to ten.
# Mirrors src/numbers/CountingShort.tsx.
SHORT_HOOK = 60
SHORT_STEP = 60
SHORT_N = 10
SHORT_FRAMES = SHORT_HOOK + SHORT_N * SHORT_STEP + 240

SUBJECTS = {
    "short": dict(rounds=[], kind="short", word="number",
                  frames=SHORT_FRAMES),
    "veggies": dict(rounds=VEGGIE_ROUNDS, kind="grow", word="vegetable"),
    "animals": dict(rounds=ANIMAL_ROUNDS, kind="live", word="animal"),
    "numbers": dict(rounds=NUMBER_ROUNDS, kind="count", word="number"),
}
if SUBJECT not in SUBJECTS:
    sys.exit(f"unknown subject {SUBJECT!r}; try {', '.join(SUBJECTS)}")
CONF = SUBJECTS[SUBJECT]
ROUNDS = CONF["rounds"]
N_ROUNDS = len(ROUNDS)
TOTAL_FRAMES = CONF.get("frames") or INTRO_LEN + N_ROUNDS * ROUND_LEN
TOTAL_SEC = TOTAL_FRAMES / FPS

# the word Emma uses in her questions
ARTICLE = {
    "carrot": "the carrot", "corn": "the corn", "tomato": "the tomato",
    "pumpkin": "the pumpkin", "pepper": "the pepper", "cucumber": "the cucumber",
    "potato": "the potato", "onion": "the onion", "eggplant": "the eggplant",
    "peas": "the peas", "broccoli": "the broccoli", "mushroom": "the mushroom",
    "cow": "the cow", "lion": "the lion", "duck": "the duck", "frog": "the frog",
    "pig": "the pig", "penguin": "the penguin", "owl": "the owl",
    "elephant": "the elephant", "sheep": "the sheep", "fish": "the fish",
    "cat": "the cat", "dog": "the dog",
    "1": "number one", "2": "number two", "3": "number three",
    "4": "number four", "5": "number five", "6": "number six",
    "7": "number seven", "8": "number eight", "9": "number nine",
    "10": "number ten", "11": "number eleven", "12": "number twelve",
}

# a little variety so twelve rounds don't read identically
QUESTIONS = [
    "What is that?", "Ooh, what is that?", "What is that?",
    "Hmm, what is that?", "What is that?", "Ooh, what could that be?",
    "What is that?", "Hmm, what is that?", "What is that?",
    "Ooh, what is that?", "What is that?", "What is that?",
]
PEEKS_GROW = [
    "Let's go and find some vegetables! Ooh, something is hiding in the bushes.",
    "Look! Something else is hiding.",
    "Ooh! Who is hiding in the bushes now?",
    "Here comes another one. Can you see it?",
    "Look! Something is peeking out.",
    "Ooh! Something is hiding again.",
    "Who's that behind the bushes?",
    "Look, something is hopping along!",
    "Here comes another vegetable. What could it be?",
    "Ooh! Something is hiding in the bushes.",
    "Look! Can you see what's peeking out?",
    "One more is hiding. Can you find it?",
]
PEEKS_LIVE = [
    "Let's go and find some animals! Ooh, something is hiding in the bushes.",
    "Look! Something else is hiding.",
    "Ooh! Who is hiding in the bushes now?",
    "Here comes another one. Can you see it?",
    "Look! Something is peeking out.",
    "Ooh! Something is hiding again.",
    "Who's that behind the bushes?",
    "Look, something is moving!",
    "Here comes another animal. What could it be?",
    "Ooh! Something is hiding in the bushes.",
    "Look! Can you see what's peeking out?",
    "One more is hiding. Can you find it?",
]
PEEKS_COUNT = [
    "Let's find some numbers! Ooh, something is hiding in the bushes.",
    "Look! Another number is hiding.",
    "Ooh! What number is hiding now?",
    "Here comes another one. Can you see it?",
    "Look! A number is peeking out.",
    "Ooh! Something is hiding again.",
    "What's that behind the bushes?",
    "Look, a number is hopping along!",
    "Here comes another number. What could it be?",
    "Ooh! Something is hiding in the bushes.",
    "Look! Can you see what's peeking out?",
    "One more is hiding. Can you find it?",
]
PEEKS = {"grow": PEEKS_GROW, "live": PEEKS_LIVE, "count": PEEKS_COUNT}.get(
    CONF["kind"], PEEKS_GROW  # the Short has no peek beat
)

# ── counting layout, mirrored from src/numbers/numbers.ts ─────────────
COUNT_START = 812


def count_stagger(n):
    return max(32, min(64, round(360 / n)))

NUMBERS = ["one", "two", "three", "four", "five", "six",
           "seven", "eight", "nine", "ten", "eleven", "twelve"]


def round_base(n):
    return INTRO_LEN + n * ROUND_LEN


def short_schedule():
    """The Short: a hook, ten numbers, a payoff."""
    lines = [(4, "Can you count to ten?", "emma", "s-hook")]
    for k in range(SHORT_N):
        lines.append((SHORT_HOOK + k * SHORT_STEP,
                      f"{NUMBERS[k].capitalize()}!", "ana", f"count-{k + 1}"))
    end = SHORT_HOOK + SHORT_N * SHORT_STEP
    lines.append((end + 8, "Ten carrots! You did it!", "emma", "s-payoff"))
    lines.append((end + 132, "Count them again with me!", "emma", "s-outro"))
    return lines


def vo_schedule():
    """[(frame, text, voice, tag)] for every spoken line."""
    if CONF["kind"] == "short":
        return short_schedule()
    opener = {
        "grow": "Chomp chomp! Veggies!",
        "live": "Chomp chomp! Animals!",
        "count": "Chomp chomp! Numbers!",
    }[CONF["kind"]]
    lines = [(18, opener, "ana", "intro")]

    for n, row in enumerate(ROUNDS):
        vid, name_line, desc_line, mid_line = row[:4]
        b = round_base(n)
        the = ARTICLE[vid]

        # narrator sets the beat up, the kid plays the guessing game
        lines.append((b + B_PEEK, PEEKS[n], "emma", f"{n:02d}-{vid}-peek"))
        lines.append((b + B_QUESTION, QUESTIONS[n], "ana", f"{n:02d}-{vid}-q"))
        lines.append((b + B_NAME, name_line, "ana", f"{n:02d}-{vid}-name"))
        lines.append((b + B_DESC, desc_line, "ana", f"{n:02d}-{vid}-desc"))

        ask_at = B_ASK

        if CONF["kind"] == "count":
            # the narrator leads, then the kid counts each thing onto the
            # exact frame it lands on screen
            value = int(vid)
            stag = count_stagger(value)
            lines.append((b + 744, "Let's count them!", "emma",
                          f"{n:02d}-{vid}-lead"))
            for k in range(value):
                lines.append((b + COUNT_START + k * stag,
                              f"{NUMBERS[k].capitalize()}!", "ana_fast",
                              f"count-{k + 1}"))
            total_at = COUNT_START + (value - 1) * stag + 46
            lines.append((b + total_at,
                          f"{NUMBERS[value - 1].capitalize()} {row[4]}! "
                          f"There are {NUMBERS[value - 1]}.",
                          "emma", f"{n:02d}-{vid}-total"))
            ask_at = max(1258, total_at + 120)
            lines.append((b + ask_at,
                          f"Can you find {the} on the board?",
                          "emma", f"{n:02d}-{vid}-ask"))
            praise = (f"You found it! That's {NUMBERS[n]}."
                      if n < N_ROUNDS - 1 else
                      "That's all twelve! You found every number. Hooray!")
            lines.append((b + B_COUNT, praise, "emma", f"{n:02d}-{vid}-count"))
            continue

        # the middle of the round: where it grows, or where it lives
        verb = "grow" if CONF["kind"] == "grow" else "live"
        lines.append((b + B_WHERE, f"Now, where does {the} {verb}?",
                      "emma", f"{n:02d}-{vid}-where"))
        lines.append((b + B_FACT, mid_line, "emma", f"{n:02d}-{vid}-fact"))

        if CONF["kind"] == "grow":
            lines.append((b + B_CROC, "Uh oh! Here comes the crocodile.",
                          "emma", f"{n:02d}-{vid}-croc"))
        else:
            lines.append((b + B_SOUND_Q, f"Listen! What does {the} say?",
                          "emma", f"{n:02d}-{vid}-soundq"))
            lines.append((b + B_SOUND, row[4], "ana", f"{n:02d}-{vid}-sound"))

        # narrator turns the board into a question
        ask_at = B_ASK if CONF["kind"] == "grow" else 1252
        lines.append((b + ask_at,
                      f"Here's our board. Can you find where {the} goes?",
                      "emma", f"{n:02d}-{vid}-ask"))

        if n < N_ROUNDS - 1:
            praise = f"You found it! That's {NUMBERS[n]}."
        else:
            praise = (f"That's all twelve! You found every {CONF['word']}. "
                      "Hooray!")
        lines.append((b + B_COUNT, praise, "emma", f"{n:02d}-{vid}-count"))

    return lines


# ── tts ───────────────────────────────────────────────────────────────
def generate_voice(lines):
    os.makedirs(WORK, exist_ok=True)
    jobs = []
    for frame, text, voice, tag in lines:
        mp3 = os.path.join(WORK, f"vo-{tag}.mp3")
        if not os.path.exists(mp3) or os.path.getsize(mp3) == 0:
            jobs.append((text, voice, mp3))
    print(f"  {len(jobs)} lines to synthesise ({len(lines) - len(jobs)} cached)")
    running = []
    for text, voice, mp3 in jobs:
        name, rate = VOICES[voice]
        running.append(subprocess.Popen(
            # --rate must be one argv token: a bare "-5%" reads as a flag
            ["edge-tts", "--voice", name, f"--rate={rate}",
             "--text", text, "--write-media", mp3],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL))
        if len(running) >= 6:
            for p in running:
                p.wait()
            running = []
    for p in running:
        p.wait()
    missing = [m for _, _, m in jobs if not os.path.exists(m) or os.path.getsize(m) == 0]
    if missing:
        sys.exit(f"tts failed for {len(missing)} lines, e.g. {missing[0]}")


def load_mp3(path):
    """Decode to mono float32 at SR."""
    wav = path + ".wav"
    subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y",
                    "-i", path, "-ac", "1", "-ar", str(SR), wav],
                   check=True)
    with wave.open(wav) as w:
        n = w.getnframes()
        raw = w.readframes(n)
    os.remove(wav)
    return np.frombuffer(raw, dtype="<i2").astype(np.float32) / 32768.0


# ── sfx synthesis ─────────────────────────────────────────────────────
def t_arr(dur):
    return np.arange(int(dur * SR), dtype=np.float32) / SR


def sweep(f0, f1, dur, curve=1.0):
    t = t_arr(dur)
    k = (t / dur) ** curve
    f = f0 + (f1 - f0) * k
    return np.sin(2 * np.pi * np.cumsum(f) / SR).astype(np.float32), t


def norm(x, peak=0.9):
    m = np.max(np.abs(x)) or 1.0
    return (x / m * peak).astype(np.float32)


def sfx_pop():
    """The reveal — a bright rubbery bloop."""
    sig, t = sweep(1150, 260, 0.2, curve=0.45)
    sig = sig + 0.35 * np.sin(4 * np.pi * np.cumsum(np.linspace(1150, 260, len(t))) / SR)
    return norm(sig * np.exp(-t * 15), 0.85)


def sfx_rise():
    """Silhouette lifting out of the bushes — slide whistle plus air."""
    sig, t = sweep(240, 1150, 1.15, curve=1.5)
    vib = 1 + 0.03 * np.sin(2 * np.pi * 5.5 * t)
    sig = sig * vib
    air = np.random.default_rng(3).standard_normal(len(t)).astype(np.float32)
    for _ in range(3):  # crude lowpass
        air = np.convolve(air, np.ones(24, np.float32) / 24, mode="same")
    env = np.sin(np.pi * np.linspace(0, 1, len(t))) ** 1.3
    return norm((0.8 * sig + 2.2 * air) * env, 0.55)


def sfx_chomp():
    """Two crunches — the crocodile getting its vegetable."""
    rng = np.random.default_rng(11)
    out = np.zeros(int(0.5 * SR), np.float32)
    for i, (off, pitch) in enumerate(((0.0, 1.0), (0.17, 0.82))):
        t = t_arr(0.16)
        n = rng.standard_normal(len(t)).astype(np.float32)
        n = np.convolve(n, np.ones(10, np.float32) / 10, mode="same")
        thud = np.sin(2 * np.pi * 120 * pitch * t) * np.exp(-t * 26)
        crunch = (n * np.exp(-t * 30) * 1.4 + thud * 0.7)
        s = int(off * SR)
        out[s:s + len(t)] += crunch
    return norm(out, 0.8)


def sfx_sparkle():
    """Slot filled in — an ascending twinkle."""
    freqs = [1568, 2093, 2637, 3136, 4186]
    out = np.zeros(int(0.85 * SR), np.float32)
    for i, f in enumerate(freqs):
        t = t_arr(0.4)
        tone = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)
        s = int(i * 0.055 * SR)
        seg = tone * np.exp(-t * 13)
        out[s:s + len(seg)] += seg
    return norm(out, 0.5)


def sfx_tada():
    """Celebration — a bell arpeggio landing on a chord."""
    notes = [523.25, 659.25, 783.99, 1046.5]
    out = np.zeros(int(1.9 * SR), np.float32)
    for i, f in enumerate(notes):
        t = t_arr(1.5)
        tone = (np.sin(2 * np.pi * f * t)
                + 0.45 * np.sin(4 * np.pi * f * t)
                + 0.18 * np.sin(6 * np.pi * f * t))
        s = int(i * 0.1 * SR)
        seg = tone * np.exp(-t * 3.0)
        out[s:s + len(seg)] += seg
    return norm(out, 0.6)


def sfx_whoosh():
    """The board sliding up into frame."""
    t = t_arr(0.75)
    rng = np.random.default_rng(7)
    n = rng.standard_normal(len(t)).astype(np.float32)
    for _ in range(2):
        n = np.convolve(n, np.ones(14, np.float32) / 14, mode="same")
    tone, _ = sweep(220, 760, 0.75, curve=1.3)
    env = np.sin(np.pi * np.linspace(0, 1, len(t))) ** 1.6
    return norm((2.6 * n + 0.5 * tone) * env, 0.5)


def sfx_blip():
    """One board slot popping in."""
    sig, t = sweep(1400, 780, 0.08, curve=0.6)
    return norm(sig * np.exp(-t * 38), 0.35)


def sfx_hop():
    """The little vegetable bouncing along the bush line."""
    sig, t = sweep(620, 210, 0.15, curve=0.5)
    return norm(sig * np.exp(-t * 14), 0.3)


# ── music bed ─────────────────────────────────────────────────────────
def marimba(freq, dur):
    t = t_arr(dur)
    body = np.sin(2 * np.pi * freq * t) * np.exp(-t * 6.5)
    bright = 0.32 * np.sin(2 * np.pi * freq * 4 * t) * np.exp(-t * 15)
    return (body + bright).astype(np.float32)


def music_bed(total_samples):
    """A soft four-chord marimba loop, rotated so it doesn't lock in place."""
    bpm = 88.0
    beat = 60.0 / bpm
    bar = beat * 4
    chords = [
        [261.63, 329.63, 392.00, 523.25],   # C
        [349.23, 440.00, 523.25, 698.46],   # F
        [392.00, 493.88, 587.33, 783.99],   # G
        [261.63, 329.63, 392.00, 523.25],   # C
        [220.00, 261.63, 329.63, 440.00],   # Am
        [349.23, 440.00, 523.25, 698.46],   # F
        [392.00, 493.88, 587.33, 783.99],   # G
        [261.63, 329.63, 392.00, 523.25],   # C
    ]
    patterns = [[0, 1, 2, 3, 2, 1], [0, 2, 1, 3, 1, 2], [0, 1, 3, 2, 3, 1]]
    out = np.zeros(total_samples + SR * 4, np.float32)
    rng = np.random.default_rng(21)
    bar_i = 0
    pos = 0.0
    while pos * SR < total_samples:
        chord = chords[bar_i % len(chords)]
        pat = patterns[(bar_i // 4) % len(patterns)]
        for step in range(6):
            note = chord[pat[step % len(pat)]]
            s = int((pos + step * (bar / 6)) * SR)
            seg = marimba(note, 0.9) * 0.5
            out[s:s + len(seg)] += seg
        # root underneath
        s = int(pos * SR)
        bass = marimba(chord[0] / 2, 1.6) * 0.42
        out[s:s + len(bass)] += bass
        # a soft shaker on the offbeats
        for k in (1, 3):
            s = int((pos + k * beat) * SR)
            t = t_arr(0.08)
            sh = rng.standard_normal(len(t)).astype(np.float32)
            sh = sh - np.convolve(sh, np.ones(8, np.float32) / 8, mode="same")
            seg = sh * np.exp(-t * 45) * 0.16
            out[s:s + len(seg)] += seg
        pos += bar
        bar_i += 1
    return out[:total_samples]


# ── mix ───────────────────────────────────────────────────────────────
def place(track, clip, frame, gain=1.0):
    s = int(frame / FPS * SR)
    e = min(s + len(clip), len(track))
    if s >= len(track):
        return
    track[s:e] += clip[:e - s] * gain


def smooth_env(x, ms=140):
    win = int(SR * ms / 1000)
    k = np.ones(win, np.float32) / win
    return np.convolve(np.abs(x), k, mode="same")


def main():
    if not shutil.which("edge-tts"):
        sys.exit("edge-tts not found — pip install edge-tts")
    if not shutil.which(FFMPEG):
        sys.exit("ffmpeg not found — set FFMPEG=/path/to/ffmpeg")

    lines = vo_schedule()
    n_ana = sum(1 for l in lines if l[2] == "ana")
    print(f"voice: {len(lines)} lines — {n_ana} Ana, {len(lines)-n_ana} Emma")
    generate_voice(lines)

    total = int(TOTAL_SEC * SR)
    voice = np.zeros(total, np.float32)
    sfx = np.zeros(total, np.float32)

    print("placing voice…")
    clips = []
    for frame, text, vkey, tag in lines:
        clip = load_mp3(os.path.join(WORK, f"vo-{tag}.mp3"))
        # the narrator sits a touch under the kid so the reveal stays the peak
        gain = 0.82 if vkey.startswith("ana") else 0.74
        place(voice, norm(clip, gain), frame)
        clips.append((frame, len(clip) / SR * FPS, vkey, tag))

    # two readers on one timeline — flag anything that runs into the next line
    clashes = 0
    for (f0, d0, v0, t0), (f1, _, v1, t1) in zip(clips, clips[1:]):
        gap = f1 - (f0 + d0)
        if gap < 0:
            clashes += 1
            print(f"  ! {t0} ({v0}) overruns {t1} ({v1}) by {-gap:.0f}f")
    print(f"  {clashes} overlap(s)" if clashes else "  no overlaps")

    print("synthesising sfx…")
    POP, RISE, CHOMP, SPARK, TADA, WHOOSH, BLIP, HOP = (
        sfx_pop(), sfx_rise(), sfx_chomp(), sfx_sparkle(),
        sfx_tada(), sfx_whoosh(), sfx_blip(), sfx_hop())

    if CONF["kind"] == "short":
        for k in range(SHORT_N):
            place(sfx, POP, SHORT_HOOK + k * SHORT_STEP - 4, 0.7)
        end = SHORT_HOOK + SHORT_N * SHORT_STEP
        place(sfx, SPARK, end, 0.8)
        place(sfx, TADA, end + 4, 0.7)
        place(sfx, SPARK, end + 120, 0.6)
    else:
        place(sfx, TADA, 30, 0.5)      # title card
        place(sfx, SPARK, 46, 0.4)

    for n in range(0 if CONF["kind"] != "short" else 0, N_ROUNDS):
        b = round_base(n)
        for k in range(6):             # the peek-a-boo hops
            place(sfx, HOP, b + B_HOP_IN + k * 27, 0.5)
        place(sfx, RISE, b + B_SIL_RISE - 6, 0.75)
        place(sfx, POP, b + B_FLASH, 0.9)
        place(sfx, CHOMP, b + B_CHOMP - 4, 0.85)
        place(sfx, WHOOSH, b + B_BOARD_RISE - 4, 0.7)
        for i in range(12):            # slots popping in
            place(sfx, BLIP, b + B_BOARD_POP + i * 2.2, 0.55)
        place(sfx, SPARK, b + B_LAND, 0.7)
        place(sfx, TADA, b + B_CELEBRATE, 0.55)

    print("music bed…")
    music = music_bed(total)

    # duck the bed under anything spoken
    duck_src = smooth_env(voice) + 0.6 * smooth_env(sfx)
    duck = 1.0 - 0.62 * np.clip(duck_src / 0.16, 0, 1)
    music = music * duck

    mix = 0.98 * voice + 0.62 * sfx + 0.20 * music

    # soft-clip anything left over, then normalise to -1 dBFS
    mix = np.tanh(mix * 1.06)
    mix = norm(mix, 0.891)

    stereo = np.stack([mix, mix], axis=1)
    pcm = (stereo * 32767).astype("<i2").tobytes()

    os.makedirs(OUT_DIR, exist_ok=True)
    raw = os.path.join(WORK, "mix.wav")
    with wave.open(raw, "w") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm)

    subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y",
                    "-i", raw, "-c:a", "libmp3lame", "-b:a", "128k", OUT],
                   check=True)
    os.remove(raw)
    print(f"wrote {OUT}  ({os.path.getsize(OUT)//1024} KB, {TOTAL_SEC:.1f}s)")


if __name__ == "__main__":
    main()
