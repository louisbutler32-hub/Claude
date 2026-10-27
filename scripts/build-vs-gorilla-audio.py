#!/usr/bin/env python3
"""Build the voiceover, the sound effects and the mix for "LeBron vs a gorilla".

    python3 scripts/build-vs-gorilla-audio.py

Everything it uses is free to ship:
- the voice is Kokoro-82M (Apache-2.0) run through kokoro-onnx, voice am_fenrir
- the sound effects are CC0: Kenney's Impact and Interface packs (kenney.nl),
  and from OpenGameArt "Gorilla Sounds" (antumdeluge), "Crowd Shouting/Speaking
  Ambience" (starninjas), "Applause in a large hall" (expl0it3r), "OoOoOo"
  (nocturnalvanguard), "Swishes Sound Pack" (artisticdude), "Air whoosh"
  (pyranostudios); the whistle, buzzer and sniffs are synthesised here
All of it is downloaded on the first run into ~/.cache/vs-audio (about 340 MB,
most of it the voice model).

Reads  src/vs/gorilla/script.json  (the lines, when each starts, its caption chunks)
Writes public/audio/vs-gorilla-vo.wav, -sfx.wav, -mix.mp3  (gitignored)
       src/vs/gorilla/timing.json  (caption chunk times, taken from the voice with Whisper)

Each line is spoken from its slot's start; if it would run past the next line
the read is sped up until it fits. Captions then follow the words as spoken.

Needs:  pip install kokoro-onnx faster-whisper soundfile numpy   (plus ffmpeg on PATH)
"""
import json
import os
import subprocess
import sys
import urllib.request
import zipfile

import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EP = os.path.join(ROOT, "src", "vs", "gorilla")
OUT = os.path.join(ROOT, "public", "audio")
CACHE = os.path.expanduser(os.environ.get("VS_AUDIO_CACHE", "~/.cache/vs-audio"))
SR = 44100
FPS = 30

HF = "https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main"
OGA = "https://opengameart.org/sites/default/files"
DOWNLOADS = {
    "kokoro/model.onnx": f"{HF}/onnx/model.onnx",
    "kokoro/am_fenrir.bin": f"{HF}/voices/am_fenrir.bin",
    "kokoro/am_puck.bin": f"{HF}/voices/am_puck.bin",
    "sfx/kenney_impact.zip": "https://kenney.nl/media/pages/assets/impact-sounds/87b4ddecda-1677589768/kenney_impact-sounds.zip",
    "sfx/kenney_interface.zip": "https://kenney.nl/media/pages/assets/interface-sounds/fa43c1dd4d-1677589452/kenney_interface-sounds.zip",
    "sfx/gorilla.zip": f"{OGA}/gorilla.zip",
    "sfx/swishes.zip": f"{OGA}/swishes.zip",
    "sfx/crowd_shouting.ogg": f"{OGA}/crowd_shouting_0.ogg",
    "sfx/applause.wav": f"{OGA}/applause-clapping-church-crowd-immersive.wav",
    "sfx/ooo.ogg": f"{OGA}/oooooooooo.ogg",
    "sfx/whoosh.wav": f"{OGA}/whoosh2_0.wav",
}


def fetch():
    for rel, url in DOWNLOADS.items():
        dst = os.path.join(CACHE, rel)
        if os.path.exists(dst):
            continue
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        print("downloading", url)
        urllib.request.urlretrieve(url, dst + ".part")
        os.replace(dst + ".part", dst)
        if dst.endswith(".zip"):
            with zipfile.ZipFile(dst) as z:
                z.extractall(dst[:-4])
    vz = os.path.join(CACHE, "kokoro", "voices.npz")
    if not os.path.exists(vz):
        voices = {n: np.fromfile(os.path.join(CACHE, "kokoro", f"{n}.bin"), dtype=np.float32).reshape(-1, 1, 256) for n in ("am_fenrir", "am_puck")}
        np.savez(vz, **voices)


def find(name):
    """a sound file in the cache by base name, e.g. 'impactPunch_heavy_002' or 'gorilla_roar'"""
    for d, _, files in os.walk(os.path.join(CACHE, "sfx")):
        for f in files:
            if os.path.splitext(f)[0] == name and f.endswith((".ogg", ".wav")):
                return os.path.join(d, f)
    flat = os.path.join(CACHE, "sfx", name)
    for ext in (".ogg", ".wav"):
        if os.path.exists(flat + ext):
            return flat + ext
    raise FileNotFoundError(name)


_cache = {}


def load(path, sr=SR):
    if path not in _cache:
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True, check=True).stdout
        _cache[path] = np.frombuffer(raw, np.float32).copy()
    return _cache[path]


def db(x):
    return 10 ** (x / 20)


# ------------------------------------------------------------------ synthesised cues

def env(n, attack=0.005, release=0.1):
    e = np.ones(n)
    a, r = int(attack * SR), int(release * SR)
    e[:a] = np.linspace(0, 1, a)
    e[n - r:] = np.linspace(1, 0, r)
    return e


def whistle():
    n = int(0.55 * SR)
    t = np.arange(n) / SR
    trill = 1 + 0.5 * (np.sin(2 * np.pi * 28 * t) > 0)
    s = 0.5 * np.sin(2 * np.pi * 2950 * t) * trill / 1.5 + 0.12 * np.random.default_rng(1).normal(size=n) * trill / 1.5
    return (s * env(n, 0.01, 0.06)).astype(np.float32)


def buzzer():
    n = int(1.1 * SR)
    t = np.arange(n) / SR
    s = sum(np.sign(np.sin(2 * np.pi * f * t)) * w for f, w in ((196, 0.5), (233, 0.35), (392, 0.15)))
    return (0.35 * s * env(n, 0.005, 0.05)).astype(np.float32)


def sniff():
    n = int(0.2 * SR)
    noise = np.random.default_rng(len(_cache)).normal(size=n)
    # crude band-pass: difference of two moving averages
    k1, k2 = 3, 18
    hp = np.convolve(noise, np.ones(k1) / k1, "same") - np.convolve(noise, np.ones(k2) / k2, "same")
    shape = np.sin(np.linspace(0, np.pi, n)) ** 1.5
    return (0.6 * hp * shape).astype(np.float32)


# ------------------------------------------------------------------ the cue sheet

def sm_frames(t, a, b):
    u = min(1, max(0, (t - a) / (b - a)))
    return u * u * (3 - 2 * u)


def dribble_hits(start, n, speed_at):
    """frames where the ball meets the floor, from the same phase maths as poses.ts dribble()"""
    out, prev = [], None
    for t in range(n):
        ph = ((t * speed_at(t)) % 16) / 16
        if prev is not None and prev < 0.5 <= ph:
            out.append(start + t / FPS)
        prev = ph
    return out


def every(start, end, step):
    out, t = [], start
    while t < end:
        out.append(t)
        t += step
    return out


def chest_hits(shot_start, t_off, t0, t1):
    """chestBeat(t): a fist lands each time sin(0.85 t) reaches ±1"""
    out = []
    for k in range(0, 200):
        t = (np.pi / 2 + k * np.pi) / 0.85 - t_off
        if t0 <= t < t1:
            out.append(shot_start + t / FPS)
    return out


def cues():
    C = []  # (time s, sound, gain dB, options)

    def add(t, name, g=0.0, **o):
        C.append((t, name, g, o))

    # chest beats: the hook, the close-up, the jungle, "ten times stronger"
    for i, t in enumerate(chest_hits(0.0, 0, 0, 45) + chest_hits(1.5, 20, 0, 36) + chest_hits(10.0, -14, 14, 54) + chest_hits(13.6, 0, 0, 48)):
        add(t, f"impactPunch_medium_00{i % 5}", -13)
    add(1.5, "gorilla_roar", -4)
    add(9.1, "gorilla_grunt", -10, dur=1.3)
    add(10.45, "gorilla_snarl_03", -6)
    add(13.62, "gorilla_roar", -3)

    # name, pixel labels and stat cards pop on
    add(2.7, "maximize_004", -8)
    for t in (3.43, 4.6, 5.8, 7.0, 10.2, 12.07, 13.93, 33.0, 43.13, 47.33):
        add(t, "impactSoft_heavy_001", -12)
        add(t, "maximize_006", -10)
    add(8.53, "select_003", -8)
    add(12.13, "swish-3", -14)
    add(15.3, "question_002", -10)
    add(16.4, "bong_001", -6)

    # dribbles and footsteps
    for t in dribble_hits(0.0, 45, lambda t: 1) + dribble_hits(30.4, 36, lambda t: 1) + dribble_hits(32.8, 48, lambda t: 0.8) + dribble_hits(38.4, 42, lambda t: 0.7):
        add(t, "impactPlate_light_002", -9)
    for t in dribble_hits(18.2, 42, lambda t: 1.5 if sm_frames(t, 12, 42) > 0.02 else 1):
        add(t, "impactPlate_light_002", -9)
    for i, t in enumerate(every(18.2 + 14 / FPS, 19.6 + 22 / FPS, (np.pi / 0.6) / FPS)):
        add(t, f"footstep_wood_00{i % 5}", -14)
    for i, t in enumerate(every(38.4, 39.8, (np.pi / 0.32) / FPS)):
        add(t, f"footstep_wood_00{i % 5}", -16)
    for i, t in enumerate(every(8.4, 10.0, (np.pi / 0.32) / FPS)):
        add(t, f"footstep_grass_00{i % 5}", -10)

    # the layup and the block
    add(19.6 + 22 / FPS, "swish-5", -12)
    add(20.8 + 10 / FPS, "impactPunch_heavy_002", -2)
    add(20.8 + 10 / FPS, "swish-9", -6)
    add(21.25, "ooo", -12)
    add(21.4, "whoosh", -12, dur=1.0)
    add(22.47, "impactSoft_medium_002", -8)
    add(22.5, "applause", -18, dur=2.0, src=8.0)

    # gorilla's ball
    add(23.8, "impactSoft_medium_003", -6)
    for t in (24.72, 25.05, 25.38):
        add(t, "@sniff", -4)
    for t in (25.8 + 5 / FPS, 25.8 + 14 / FPS, 25.8 + 28 / FPS):
        add(t, "impactSoft_heavy_003", -6)
        add(t, "footstep_snow_002", -10)
    add(26.07, "error_004", -8)
    add(27.3, "scratch_001", -6)
    add(27.9, "scratch_003", -6)
    add(27.35, "impactSoft_medium_000", -14)
    for i, t in enumerate(every(28.6, 30.4, (np.pi / 0.36) / FPS)):
        add(t, f"impactSoft_heavy_00{i % 5}", -16)
    add(29.0, "@whistle", -8)

    # the charge
    add(31.62, "gorilla_snarl_02", -2)
    for i, t in enumerate(every(31.6, 34.4 + 20 / FPS, (np.pi / 0.85) / FPS)):
        add(t, f"impactSoft_heavy_00{i % 5}", -11)
    add(31.6, "whoosh", -14, dur=1.2)
    add(34.4 + 4 / FPS, "swish-7", -6)
    add(34.4 + 20 / FPS, "gorilla_snarl_04", -4)
    add(35.6, "whoosh", -8, dur=1.4, src=0.5)
    add(37.0 + 22 / FPS, "impactPlank_medium_002", 0)
    add(37.0 + 22 / FPS, "impactWood_heavy_001", -3)
    add(37.0 + 22 / FPS, "impactMetal_heavy_003", -8)
    add(37.0 + 26 / FPS, "impactGlass_light_001", -12)
    add(37.0 + 32 / FPS, "impactGlass_light_003", -14)
    add(37.85, "ooo", -14)

    # the dunk
    add(39.8 + 6 / FPS, "swish-11", -10)
    add(39.8 + 22 / FPS, "impactMetal_heavy_000", -1)
    add(39.8 + 22 / FPS, "impactPunch_heavy_004", -4)
    add(39.8 + 24 / FPS, "swish-2", -8)
    add(39.8 + 34 / FPS, "impactPlate_light_001", -9)
    add(40.6, "applause", -13, dur=5.0, src=12.0)
    add(41.6, "@buzzer", -9)

    # the stands
    for i, t in enumerate(every(45.1, 47.0, 0.45)):
        add(t, f"glass_00{1 + i % 6}", -16)
    for t in every(47.0, 50.0, 0.4):
        add(t, "footstep_snow_001", -14)
    add(48.4, "gorilla_grunt", -12, dur=1.4)
    return C


def bed_gain(t):
    """the crowd: quiet under the game, out for the stat intros and the gorilla's possession, up for the charge and the dunk"""
    if 2.6 <= t < 16.4 or 23.3 <= t < 30.4:
        return -80.0
    g = -32.0
    if 31.6 <= t < 38.4:
        g = -26.0
    if 40.5 <= t < 45.0:
        g = -22.0
    return g


# ------------------------------------------------------------------ voice

def build_voice(script, end):
    from kokoro_onnx import Kokoro
    k = Kokoro(os.path.join(CACHE, "kokoro", "model.onnx"), os.path.join(CACHE, "kokoro", "voices.npz"))
    from faster_whisper import WhisperModel
    asr = WhisperModel("base.en", device="cpu", compute_type="int8", download_root=os.path.join(CACHE, "whisper"))

    lines = script["lines"]
    vo = np.zeros(int(end * SR) + SR, np.float32)
    caps, report = [], []
    for i, ln in enumerate(lines):
        window = (lines[i + 1]["at"] if i + 1 < len(lines) else end) - ln["at"]
        speed = script["speed"]
        while True:
            a24, sr = k.create(ln["say"], voice=script["voice"], speed=speed, lang="en-us")
            # trim the model's leading/trailing silence
            nz = np.where(np.abs(a24) > 0.01)[0]
            a24 = a24[max(0, nz[0] - int(0.02 * sr)): nz[-1] + int(0.06 * sr)] if len(nz) else a24
            dur = len(a24) / sr
            if dur <= window - 0.1 or speed >= 1.45:
                break
            speed = round(speed + 0.05, 2)
        tmp = os.path.join(CACHE, "line.wav")
        sf.write(tmp, a24, sr)
        a = load(tmp)
        _cache.pop(tmp, None)
        start = ln["at"] + 0.03
        s0 = int(start * SR)
        vo[s0:s0 + len(a)] += a[: len(vo) - s0]
        report.append((ln["at"], dur, window, speed))

        # caption chunks start on their first word, as Whisper hears it
        a16 = load(tmp, 16000)
        _cache.pop(tmp, None)
        segs, _ = asr.transcribe(a16, word_timestamps=True, language="en")
        words = [w for s in segs for w in s.words]
        tokens = ln["say"].split()
        first_tok, n = [], 0
        for c in ln["chunks"]:
            first_tok.append(n)
            n += len(c.split())
        assert n == len(tokens), f"chunks don't cover the line: {ln['say']}"
        for c, ft in zip(ln["chunks"], first_tok):
            if len(words) == len(tokens):
                off = words[ft].start
            else:  # Whisper merged or split words: fall back to the share of characters
                off = dur * len(" ".join(tokens[:ft])) / max(1, len(ln["say"]))
            caps.append([round(start + off if ft else ln["at"], 2), c])
    return vo, caps, report


# ------------------------------------------------------------------ mix

def place(track, t, a, gain_db):
    s0 = int(t * SR)
    if s0 >= len(track):
        return
    n = min(len(a), len(track) - s0)
    track[s0:s0 + n] += a[:n] * db(gain_db)


def build_sfx(end):
    sfx = np.zeros(int(end * SR) + SR, np.float32)
    synth = {"@whistle": whistle, "@buzzer": buzzer, "@sniff": sniff}
    for t, name, g, o in cues():
        if name.startswith("@"):
            a = synth[name]()
        else:
            a = load(find(name))
            src = int(o.get("src", 0) * SR)
            a = a[src:]
            if "dur" in o:
                n = int(o["dur"] * SR)
                a = a[:n].copy()
                fade = min(n, int(0.25 * SR))
                a[-fade:] *= np.linspace(1, 0, fade)
        place(sfx, t, a, g)
    # crowd bed, looped, with its level following bed_gain
    crowd = load(find("crowd_shouting"))
    bed = np.tile(crowd, int(np.ceil(len(sfx) / len(crowd))))[: len(sfx)]
    gains = np.array([db(bed_gain(i / SR)) for i in range(0, len(sfx), 441)])
    smooth = np.convolve(gains, np.ones(30) / 30, "same")  # 0.3 s ramps
    sfx += bed * np.repeat(smooth, 441)[: len(sfx)]
    return sfx


def main():
    script = json.load(open(os.path.join(EP, "script.json")))
    end = script["end"]
    fetch()
    os.makedirs(OUT, exist_ok=True)
    vo, caps, report = build_voice(script, end)
    for at, dur, window, speed in report:
        flag = "  <-- tight" if dur > window - 0.1 else ""
        print(f"{at:5.1f}s  {dur:4.2f}s of {window:4.2f}s  speed {speed}{flag}")
    sfx = build_sfx(end)
    n = int(end * SR)
    vo, sfx = vo[:n], sfx[:n]
    vo *= db(-1) / max(1e-6, np.abs(vo).max())
    # duck the effects a little under the voice
    venv = np.convolve(np.abs(vo), np.ones(2205) / 2205, "same")
    duck = 1 - 0.35 * np.clip(venv / (venv.max() * 0.3), 0, 1)
    mix = vo + sfx * duck
    sf.write(os.path.join(OUT, "vs-gorilla-vo.wav"), vo, SR)
    sf.write(os.path.join(OUT, "vs-gorilla-sfx.wav"), sfx, SR)
    raw = os.path.join(CACHE, "mix.wav")
    sf.write(raw, mix / max(1.0, np.abs(mix).max()), SR)
    # two-pass loudness: measure, then normalise linearly to -14 LUFS for Shorts
    # a gentle compressor and limiter first, so the hits don't hold the level down
    pre = "acompressor=threshold=-20dB:ratio=3:attack=5:release=150:makeup=2,alimiter=limit=0.8:level=false"
    probe = subprocess.run(["ffmpeg", "-v", "info", "-i", raw, "-af", pre + ",loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    m = json.loads(probe[probe.rindex("{"): probe.rindex("}") + 1])
    ln = f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", pre + "," + ln, "-ac", "2", "-ar", str(SR), "-b:a", "192k", os.path.join(OUT, "vs-gorilla-mix.mp3")], check=True)
    json.dump({"caps": caps}, open(os.path.join(EP, "timing.json"), "w"), indent=1)
    print("wrote public/audio/vs-gorilla-mix.mp3 and src/vs/gorilla/timing.json")


if __name__ == "__main__":
    sys.exit(main())
