#!/usr/bin/env python3
"""
Builds the full soundtrack for the "Chomp Chomp VEGGIES" video.

Three layers, all placed on the same frame grid the animation uses
(30 fps, 120-frame intro, 1560-frame rounds — see src/veggies/rounds.ts):

  voice   38 lines read by the edge-tts "Ana" child voice
  sfx     synthesised here, so there is nothing to license
  music   a soft marimba bed, ducked under the voice

Output: public/audio/veggies-mix.mp3

Usage:  python3 scripts/build-veggie-audio.py
Needs:  pip install numpy edge-tts   (plus ffmpeg on PATH)
"""

import os, subprocess, shutil, sys, math, wave, struct, tempfile
import numpy as np

SR = 44100
FPS = 30
INTRO_LEN = 120
ROUND_LEN = 1560
N_ROUNDS = 12
TOTAL_FRAMES = INTRO_LEN + N_ROUNDS * ROUND_LEN
TOTAL_SEC = TOTAL_FRAMES / FPS

VOICE = "en-US-AnaNeural"
RATE = "-5%"

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORK = os.path.join(ROOT, ".audio-build")
OUT_DIR = os.path.join(ROOT, "public", "audio")
OUT = os.path.join(OUT_DIR, "veggies-mix.mp3")

FFMPEG = os.environ.get("FFMPEG", "ffmpeg")

# ── beats, mirroring BEAT in src/veggies/rounds.ts ────────────────────
B_HOP_IN, B_HOP_OUT = 130, 320
B_SIL_RISE = 350
B_QUESTION = 382
B_FLASH = 518
B_NAME = 546
B_DESC = 668
B_CHOMP = 1104
B_BOARD_RISE = 1212
B_BOARD_POP = 1256
B_LAND = 1382
B_CELEBRATE = 1386

# ── the script ────────────────────────────────────────────────────────
ROUNDS = [
    ("carrot",   "It's a carrot! Carrot.",         "A crunchy orange carrot."),
    ("corn",     "It's corn! Corn.",               "Sweet yellow corn."),
    ("tomato",   "It's a tomato! Tomato.",         "A round red tomato."),
    ("pumpkin",  "It's a pumpkin! Pumpkin.",       "A big orange pumpkin."),
    ("pepper",   "It's a bell pepper! Pepper.",    "A shiny red pepper."),
    ("cucumber", "It's a cucumber! Cucumber.",     "A long green cucumber."),
    ("potato",   "It's a potato! Potato.",         "A lumpy brown potato."),
    ("onion",    "It's an onion! Onion.",          "A purple papery onion."),
    ("eggplant", "It's an eggplant! Eggplant.",    "A shiny purple eggplant."),
    ("peas",     "It's peas! Peas.",               "Little green peas in a pod."),
    ("broccoli", "It's broccoli! Broccoli.",       "Big bushy green broccoli."),
    ("mushroom", "It's a mushroom! Mushroom.",     "A cute little mushroom."),
]
# a little variety on the question so twelve rounds don't read identically
QUESTIONS = [
    "What is that?", "Ooh, what is that?", "What is that?",
    "Hmm, what is that?", "What is that?", "Ooh, what could that be?",
    "What is that?", "Hmm, what is that?", "What is that?",
    "Ooh, what is that?", "What is that?", "What is that?",
]


def round_base(n):
    return INTRO_LEN + n * ROUND_LEN


def vo_schedule():
    """[(frame, text, tag)] for every spoken line."""
    lines = [(18, "Chomp chomp! Veggies!", "intro")]
    for n, (vid, name_line, desc_line) in enumerate(ROUNDS):
        b = round_base(n)
        lines.append((b + B_QUESTION, QUESTIONS[n], f"{n:02d}-{vid}-q"))
        lines.append((b + B_NAME, name_line, f"{n:02d}-{vid}-name"))
        lines.append((b + B_DESC, desc_line, f"{n:02d}-{vid}-desc"))
    lines.append((round_base(N_ROUNDS - 1) + 1452, "We found them all! Yay!", "outro"))
    return lines


# ── tts ───────────────────────────────────────────────────────────────
def generate_voice(lines):
    os.makedirs(WORK, exist_ok=True)
    jobs = []
    for frame, text, tag in lines:
        mp3 = os.path.join(WORK, f"vo-{tag}.mp3")
        if not os.path.exists(mp3) or os.path.getsize(mp3) == 0:
            jobs.append((text, mp3))
    print(f"  {len(jobs)} lines to synthesise ({len(lines) - len(jobs)} cached)")
    running = []
    for text, mp3 in jobs:
        running.append(subprocess.Popen(
            # --rate must be one argv token: a bare "-5%" reads as a flag
            ["edge-tts", "--voice", VOICE, f"--rate={RATE}",
             "--text", text, "--write-media", mp3],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL))
        if len(running) >= 6:
            for p in running:
                p.wait()
            running = []
    for p in running:
        p.wait()
    missing = [m for _, m in jobs if not os.path.exists(m) or os.path.getsize(m) == 0]
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
    print(f"voice: {len(lines)} lines with {VOICE}")
    generate_voice(lines)

    total = int(TOTAL_SEC * SR)
    voice = np.zeros(total, np.float32)
    sfx = np.zeros(total, np.float32)

    print("placing voice…")
    for frame, text, tag in lines:
        clip = load_mp3(os.path.join(WORK, f"vo-{tag}.mp3"))
        place(voice, norm(clip, 0.82), frame)

    print("synthesising sfx…")
    POP, RISE, CHOMP, SPARK, TADA, WHOOSH, BLIP, HOP = (
        sfx_pop(), sfx_rise(), sfx_chomp(), sfx_sparkle(),
        sfx_tada(), sfx_whoosh(), sfx_blip(), sfx_hop())

    place(sfx, TADA, 30, 0.5)          # title card
    place(sfx, SPARK, 46, 0.4)

    for n in range(N_ROUNDS):
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
