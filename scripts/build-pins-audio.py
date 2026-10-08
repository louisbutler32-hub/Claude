#!/usr/bin/env python3
"""Narration, music bed and SFX for a Pins-format Short (src/pins/<episode>/).

    python3 scripts/build-pins-audio.py sleep                      # placeholder voice (edge-tts)
    python3 scripts/build-pins-audio.py sleep --vo take1.mp3 [take2.mp3 ...]   # a real recording
    python3 scripts/build-pins-audio.py sleep --vo take1.mp3 --check            # just report coverage
    python3 scripts/build-pins-audio.py sleep --vo take1.mp3 --max-pause 0      # keep the read's own pauses

Pauses in a recording longer than max_pause (script.json, default 0.3 s) are
cut down to it: the reference runs with no dead air.

With --vo, the recording(s) are joined in order into
public/audio/pins-<episode>-vo.wav (gitignored: the read is licensed to the
channel, not the repo) and every later build uses it until --tts is passed.
faster-whisper hears the words, they're lined up against script.json, and the
captions and every shot get the recording's real timing; words the model
missed are interpolated between their timed neighbours. Without a recording,
every line is voiced with edge-tts (word boundaries on), laid end to end with
a short gap. Either way it puts a light plucked bed under the voice and the
cartoon SFX cues on top, and writes:

    public/audio/pins-<episode>-mix.mp3     the drop-in track (gitignored —
                                            edge-tts output is for timing the
                                            edit, not for shipping)
    src/pins/<episode>/timing.json          line + word times; tracked, since
                                            the video's shots key off it

A line may carry "sfx": [[name, word_index], ...] to drop an effect on the
start of that word (sfx.py's names, plus "zzz" and "tick" built here). Every
line also gets a soft whoosh on its first word if it opens a new section
("First", "Next", "Finally") — the reference cuts hard on exactly those.

Music: script.json "music" names a track (a local, gitignored file such as
.music/<name>.wav); it plays from "music_start" seconds into the track, sits
"music_db" below the voice (default 17 dB) and dips a further "duck_db"
(default 4 dB) while the voice is speaking (slow release, so the bed doesn't
pump up in the short pauses between sentences), then fades out at the end.
Without one, the bed is synthesised (numpy, nothing to license): a plucked
I–V–vi–IV at 112 bpm with a soft kick. "sfx": false in script.json drops
every effect, the section whooshes included.

SFX: a line's "sfx": [[name, word_index, offset_s], ...] drops an effect on
that word (offset optional). "sfx_files" maps names to the channel's own
files (gitignored under .sfx/), or to {"path", "start", "dur", "fade_out"} to
cut one sound out of a pack (or shorten a long one with a fade), each peak-normalised then scaled by
"sfx_gain"[name] (voice peak = 1); names without a file fall back to the
synthesised ones. "start_sfx": [[name, seconds]] places effects at absolute
times (the opening ding).
"""
import asyncio
import hashlib
import json
import os
import subprocess
import sys

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import sfx as sfxlib  # noqa: E402

SR = 44100
FF = "ffmpeg"
SECTION_WORDS = ("first", "next", "finally")


# ---------------------------------------------------------------- narration

async def _tts(text, voice, rate, pitch):
    import edge_tts
    # edge-tts pins certifi's bundle; on a box behind a TLS-terminating proxy
    # the trusted bundle is whatever SSL_CERT_FILE names, so hand it that.
    if os.environ.get("SSL_CERT_FILE"):
        import ssl
        import edge_tts.communicate as etc
        etc._SSL_CTX = ssl.create_default_context(cafile=os.environ["SSL_CERT_FILE"])
    com = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
    audio, words = bytearray(), []
    async for chunk in com.stream():
        if chunk["type"] == "audio":
            audio.extend(chunk["data"])
        elif chunk["type"] == "WordBoundary":
            s = chunk["offset"] / 1e7
            words.append([chunk["text"], round(s, 3), round(s + chunk["duration"] / 1e7, 3)])
    return bytes(audio), words


def voice_line(line, spec, cache):
    key = hashlib.sha1(json.dumps([line["text"], spec["voice"], spec["rate"], spec["pitch"]]).encode()).hexdigest()[:12]
    mp3 = os.path.join(cache, f"{line['id']}-{key}.mp3")
    meta = mp3[:-4] + ".json"
    if not (os.path.exists(mp3) and os.path.exists(meta)):
        audio, words = asyncio.run(_tts(line.get("say", line["text"]), spec["voice"], spec["rate"], spec["pitch"]))
        open(mp3, "wb").write(audio)
        json.dump(words, open(meta, "w"))
    return mp3, json.load(open(meta))


def decode(path):
    raw = subprocess.run([FF, "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def trim(clip, words):
    """Cut edge-tts's lead-in/tail silence, keeping a hair either side of the words."""
    lead = max(0.0, words[0][1] - 0.04) if words else 0.0
    tail = (words[-1][2] + 0.18) if words else len(clip) / SR
    a, b = int(lead * SR), min(len(clip), int(tail * SR))
    return clip[a:b], lead


# ---------------------------------------------------------------- synthesis

def N(d):
    return int(round(d * SR))


def pluck(freq, dur, bright=0.5, seed=0):
    """Karplus-Strong string."""
    n, p = N(dur), max(2, int(SR / freq))
    buf = np.random.default_rng(seed).uniform(-1, 1, p).astype(np.float32)
    out = np.zeros(n, np.float32)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * (0.994 + 0.004 * bright)
    return out


def kick(dur=0.22):
    t = np.arange(N(dur)) / SR
    f = 110 * np.exp(-t * 22) + 45
    return (np.sin(np.cumsum(2 * np.pi * f / SR)) * np.exp(-t * 14)).astype(np.float32)


def music(total):
    bpm = 112
    eighth = 60 / bpm / 2
    # I–V–vi–IV in C, one bar each, arpeggio root-5th-octave-3rd
    chords = [(261.63, 392.0, 523.25, 329.63), (196.0, 293.66, 392.0, 246.94),
              (220.0, 329.63, 440.0, 261.63), (174.61, 261.63, 349.23, 220.0)]
    bed = np.zeros(N(total) + SR, np.float32)
    cache = {}
    step = 0
    t = 0.0
    while t < total:
        bar, beat8 = divmod(step, 8)
        ch = chords[bar % 4]
        f = ch[[0, 1, 2, 3, 2, 1, 2, 3][beat8]]
        if f not in cache:
            cache[f] = pluck(f, eighth * 3, seed=int(f))
        c = cache[f]
        i = N(t)
        bed[i:i + len(c)] += c[:len(bed) - i] * (0.55 if beat8 % 2 else 0.7)
        if beat8 == 0:  # bass on the downbeat
            b = pluck(ch[0] / 2, eighth * 8, bright=0.1, seed=7)
            bed[i:i + len(b)] += b[:len(bed) - i] * 0.6
        if beat8 in (0, 4):
            k = kick()
            bed[i:i + len(k)] += k[:len(bed) - i] * 0.5
        step += 1
        t += eighth
    bed = bed[:N(total)]
    bed /= np.max(np.abs(bed)) + 1e-9
    fade = N(0.4)
    bed[:fade] *= np.linspace(0, 1, fade)
    bed[-fade:] *= np.linspace(1, 0, fade)
    return bed


SFX_FILES = {}   # name -> path, from script.json "sfx_files" (the channel's own effects, gitignored)


def fx(name):
    if name in SFX_FILES:
        f = SFX_FILES[name]
        # a plain path, or {"path", "start", "dur"} to cut one sound out of a pack
        f = f if isinstance(f, dict) else {"path": f}
        clip = decode(os.path.join(ROOT, f["path"]))
        a = N(f.get("start", 0))
        clip = clip[a:a + N(f["dur"])] if "dur" in f else clip[a:]
        fade = min(len(clip) // 2, N(f.get("fade_out", 0.02)))
        if fade:
            clip[-fade:] *= np.linspace(1, 0, fade)
        return clip / (np.max(np.abs(clip)) + 1e-9)
    if name == "zzz":
        t = np.arange(N(0.9)) / SR
        f = 180 + 30 * np.sin(2 * np.pi * 3 * t)
        s = np.sign(np.sin(np.cumsum(2 * np.pi * f / SR))) * 0.3
        env = np.sin(np.pi * t / t[-1]) ** 2
        return (s * env).astype(np.float32)
    if name == "tick":
        out = np.zeros(N(1.0), np.float32)
        for k in range(4):
            i = N(k * 0.25)
            c = (np.random.default_rng(k).standard_normal(N(0.012)) * np.exp(-np.arange(N(0.012)) / 60)).astype(np.float32)
            out[i:i + len(c)] += c * (0.9 if k % 2 == 0 else 0.6)
        return out
    clip = sfxlib.render(name).astype(np.float32)
    # sfx.py renders at its own rate; bring it up to ours
    x_old = np.linspace(0, 1, len(clip))
    x_new = np.linspace(0, 1, int(len(clip) * SR / sfxlib.SR))
    return np.interp(x_new, x_old, clip).astype(np.float32)


def track_bed(path, start, total):
    """the named music track from `start` seconds in, cut to the short's length, peak-normalised"""
    raw = subprocess.run([FF, "-v", "error", "-ss", str(start), "-t", str(total + 0.5), "-i", path,
                          "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], check=True, capture_output=True).stdout
    bed = np.frombuffer(raw, dtype=np.float32).copy()[:N(total)]
    if len(bed) < N(total):
        bed = np.pad(bed, (0, N(total) - len(bed)))
    return bed


def rms_db(x):
    return 20 * np.log10(np.sqrt(np.mean(x.astype(np.float64) ** 2)) + 1e-12)


def duck_env(voice, hop=0.01, attack=0.06, release=1.2):
    """0..1, how much the voice is speaking: frame RMS gated, then smoothed (fast in, slow out)"""
    n = int(hop * SR)
    frames = len(voice) // n
    r = np.sqrt(np.mean(voice[:frames * n].reshape(frames, n) ** 2, axis=1))
    on = (20 * np.log10(r + 1e-12) > -40).astype(np.float32)
    env = np.zeros_like(on)
    a, b = np.exp(-hop / attack), np.exp(-hop / release)
    v = 0.0
    for i, x in enumerate(on):
        v = (a * v + (1 - a) * x) if x > v else (b * v + (1 - b) * x)
        env[i] = v
    return np.repeat(env, n)[:len(voice)] if len(env) else np.zeros(len(voice), np.float32)


def place(mix, clip, t, gain):
    i = N(t)
    n = min(len(clip), len(mix) - i)
    if n > 0:
        mix[i:i + n] += clip[:n] * gain


# ---------------------------------------------------------------- a real recording

def norm(w):
    import re
    return re.sub(r"[^a-z0-9]", "", w.lower())


def tighten(x, max_pause, floor_db=-45.0, hop=0.01):
    """cut every silence longer than max_pause down to max_pause, half kept at each edge
    so word tails and breaths in are never clipped"""
    n = int(hop * SR)
    frames = len(x) // n
    rms = np.sqrt(np.mean(x[:frames * n].reshape(frames, n) ** 2, axis=1) + 1e-12)
    quiet = 20 * np.log10(rms) < floor_db
    keep = np.ones(len(x), bool)
    i = 0
    while i < frames:
        if not quiet[i]:
            i += 1
            continue
        j = i
        while j < frames and quiet[j]:
            j += 1
        if (j - i) * hop > max_pause and i > 0 and j < frames:
            half = int(max_pause / 2 / hop)
            keep[(i + half) * n:(j - half) * n] = False
        i = j
    return x[keep]


def join_takes(paths, out, gap=0.25, max_pause=None):
    """join the takes in order; with max_pause, every pause longer than that is cut down to it
    (the reference runs with no dead air: a breath between sentences, never a full second)"""
    clips = [decode(p) for p in paths]
    pad = np.zeros(N(gap), np.float32)
    joined = np.concatenate([x for c in clips for x in (c, pad)][:-1]) if clips else np.zeros(0, np.float32)
    if max_pause:
        joined = tighten(joined, max_pause)
    tmp = out + ".f32"
    joined.astype(np.float32).tofile(tmp)
    subprocess.run([FF, "-v", "error", "-y", "-f", "f32le", "-ac", "1", "-ar", str(SR), "-i", tmp, out], check=True)
    os.remove(tmp)


def align_recording(path, lines):
    """word times for every script line, from what faster-whisper hears in the recording"""
    from faster_whisper import WhisperModel
    model = WhisperModel("small", device="cpu", compute_type="int8")
    segs, _ = model.transcribe(path, word_timestamps=True, language="en", beam_size=3)
    heard = [(norm(w.word), float(w.start), float(w.end)) for sg in segs for w in sg.words if norm(w.word)]
    script = [(li, w) for li, l in enumerate(lines) for w in l["text"].split()]
    sm = __import__("difflib").SequenceMatcher(a=[norm(w) for _, w in script], b=[h[0] for h in heard], autojunk=False)
    times = [None] * len(script)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal" or (tag == "replace" and i2 - i1 == j2 - j1):
            for k in range(i2 - i1):
                times[i1 + k] = [heard[j1 + k][1], heard[j1 + k][2]]
    matched = sum(1 for x in times if x)
    # the recording may stop early: everything after the last heard word is "not covered"
    last = max((i for i, x in enumerate(times) if x), default=-1)
    covered = last + 1
    i = 0
    while i < covered:
        if times[i]:
            i += 1
            continue
        j = i
        while not times[j]:
            j += 1
        t0 = times[i - 1][1] if i else 0.0
        t1 = times[j][0]
        weights = [max(2, len(norm(w))) for _, w in script[i:j]]
        span = max(t1 - t0, 0.05 * len(weights))
        acc = t0
        for k, wt in enumerate(weights):
            d = span * wt / sum(weights)
            times[i + k] = [acc, acc + d]
            acc += d
        i = j
    out = [[] for _ in lines]
    for k in range(covered):
        li, w = script[k]
        out[li].append([w, times[k][0], times[k][1]])
    return out, matched, len(script), covered


# ---------------------------------------------------------------- main

def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    ep = sys.argv[1]
    ep_dir = os.path.join(ROOT, "src", "pins", ep)
    spec = json.load(open(os.path.join(ep_dir, "script.json")))
    spec.setdefault("pitch", "+0Hz")
    SFX_FILES.update(spec.get("sfx_files", {}))
    cache = os.path.join(ROOT, ".tts", f"pins-{ep}")
    os.makedirs(cache, exist_ok=True)

    lead_in = spec.get("lead_in", 0.15)
    gap = spec.get("gap", 0.12)
    args = sys.argv[2:]
    vo_path = os.path.join(ROOT, "public", "audio", f"pins-{ep}-vo.wav")
    if "--vo" in args:
        takes = []
        for a in args[args.index("--vo") + 1:]:
            if a.startswith("--"):
                break
            takes.append(a)
        max_pause = float(args[args.index("--max-pause") + 1]) if "--max-pause" in args else spec.get("max_pause", 0.3)
        os.makedirs(os.path.dirname(vo_path), exist_ok=True)
        join_takes(takes, vo_path, max_pause=max_pause or None)
    recorded = os.path.exists(vo_path) and "--tts" not in args

    t = lead_in
    voice_parts, lines_out, cues = [], [], []
    if recorded:
        words_by_line, matched, total_words, covered = align_recording(vo_path, spec["lines"])
        print(f"recording: {matched}/{total_words} script words heard, {covered}/{total_words} covered")
        missing = [l["id"] for l, ws in zip(spec["lines"], words_by_line) if len(ws) < len(l["text"].split())]
        if missing:
            print("  not in the recording yet: " + ", ".join(missing))
            for l, ws in zip(spec["lines"], words_by_line):
                if l["id"] in missing:
                    print(f"    {l['id']}: {l['text']}")
        if "--check" in args:
            return
        if missing:
            sys.exit("the recording doesn't cover the whole script; add the missing takes with --vo a.mp3 b.mp3 ...")
        clip = decode(vo_path)
        # "hold_after": seconds of silence spliced in after a line (room for a gag
        # the picture plays out, like the hook's payoff); later words shift with it
        shift, held, hold_at = 0.0, [], {}
        for line, ws in zip(spec["lines"], words_by_line):
            ws = [[w, s + shift, e + shift] for w, s, e in ws]
            held.append(ws)
            hold = float(line.get("hold_after", 0))
            if hold > 0:
                # splice at the quietest 20 ms after the line's last word (the aligner
                # can end a word before its tail fades, and start the next one early), not mid-syllable
                lo, hi = N(ws[-1][2] - 0.02), N(ws[-1][2] + 0.45)
                win = N(0.02)
                cands = range(lo, max(lo + 1, hi - win), N(0.005))
                at = min(cands, key=lambda i: float(np.mean(clip[i:i + win] ** 2))) + win // 2
                clip = np.concatenate([clip[:at], np.zeros(N(hold), clip.dtype), clip[at:]])
                hold_at[line["id"]] = round(lead_in + at / SR, 3)
                shift += hold
        words_by_line = held
        voice_parts.append((lead_in, clip))
        for line, ws in zip(spec["lines"], words_by_line):
            abs_words = [[w, round(lead_in + s, 3), round(lead_in + e, 3)] for w, s, e in ws]
            lines_out.append({"id": line["id"], "text": line["text"], "start": abs_words[0][1], "end": abs_words[-1][2], "words": abs_words})
            if line["id"] in hold_at:
                lines_out[-1]["hold_at"] = hold_at[line["id"]]   # where the held silence starts (the line's true end)
            if abs_words[0][0].lower().strip(",.") in SECTION_WORDS:
                cues.append(("whoosh", abs_words[0][1] - 0.12, 0.35))
            for cue_ in line.get("sfx", []):
                name, wi, off = (list(cue_) + [0.0])[:3]
                cues.append((name, abs_words[min(wi, len(abs_words) - 1)][1] + off, None))
        t = lead_in + len(clip) / SR + gap
    for line in ([] if recorded else spec["lines"]):
        mp3, words = voice_line(line, spec, cache)
        clip, cut = trim(decode(mp3), words)
        abs_words = [[w, round(t + s - cut, 3), round(t + e - cut, 3)] for w, s, e in words]
        voice_parts.append((t, clip))
        lines_out.append({"id": line["id"], "text": line["text"], "start": round(t, 3),
                          "end": round(t + len(clip) / SR, 3), "words": abs_words})
        if abs_words and abs_words[0][0].lower().strip(",.") in SECTION_WORDS:
            cues.append(("whoosh", abs_words[0][1] - 0.12, 0.35))
        for cue_ in line.get("sfx", []):
            name, wi, off = (list(cue_) + [0.0])[:3]
            cues.append((name, abs_words[min(wi, len(abs_words) - 1)][1] + off, None))
        t += len(clip) / SR + gap + float(line.get("hold_after", 0))
    total = round(t - gap + spec.get("tail", 0.35), 3)
    # "end_after": [line_id, word_index] ends the Short on that word (the read runs on
    # past it): the mix stops, with the music's fade, a tail after it, and later words go
    if spec.get("end_after"):
        eid, ewi = spec["end_after"]
        k = next(i for i, l in enumerate(lines_out) if l["id"] == eid)
        lines_out = lines_out[:k + 1]
        lines_out[k]["words"] = lines_out[k]["words"][:ewi + 1]
        lines_out[k]["end"] = lines_out[k]["words"][-1][2]
        end_word = lines_out[k]["end"]
        total = round(end_word + spec.get("tail", 0.35), 3)
        cues = [cu for cu in cues if cu[1] < total]

    mix = np.zeros(N(total) + SR, np.float32)
    voice = np.zeros_like(mix)
    for start, clip in voice_parts:
        place(voice, clip, start, 1.0)
    if spec.get("end_after"):
        # silence the read from the quietest 20 ms just after the last kept word, so
        # none of the next word leaks into the tail
        win = N(0.02)
        cands = range(N(end_word - 0.02), N(end_word + 0.4), N(0.005))
        cut = min(cands, key=lambda i: float(np.mean(voice[i:i + win] ** 2))) + win // 2
        f = N(0.02)
        voice[cut:cut + f] *= np.linspace(1, 0, f)
        voice[cut + f:] = 0
        total = round(cut / SR + spec.get("tail", 0.35), 3)
        mix = mix[:N(total) + SR]
        voice = voice[:N(total) + SR]
    voice /= np.max(np.abs(voice)) + 1e-9
    mix += voice
    if spec.get("music"):
        bed = track_bed(os.path.join(ROOT, spec["music"]), spec.get("music_start", 0), total)
        # level the bed against the voice where it's speaking, then duck it a little more under the words
        env = duck_env(voice[:N(total)])
        env = np.pad(env, (0, N(total) - len(env)))
        speaking = voice[:N(total)][env > 0.5]
        target = (rms_db(speaking) if len(speaking) else -20) - spec.get("music_db", 17)
        gain_db = target - rms_db(bed) - spec.get("duck_db", 4) * env
        bed = bed * (10 ** (gain_db / 20))
        under, free = bed[env > 0.5], bed[env < 0.2]
        print(f"  voice {rms_db(speaking):.1f} dB RMS while speaking; music {rms_db(under):.1f} under it "
              f"({rms_db(speaking) - rms_db(under):.1f} dB down)" + (f", {rms_db(free):.1f} in the clear" if len(free) else ""))
        fo = N(spec.get("music_fade", 0.6))
        bed[-fo:] *= np.linspace(1, 0, fo)
        mix[:N(total)] += bed.astype(np.float32)
    else:
        mix += np.pad(music(total), (0, len(mix) - N(total))) * 0.13
    if spec.get("sfx", True) is False:
        cues = []
    for name, at in spec.get("start_sfx", []):
        cues.append((name, at, None))
    gains = {"whoosh": 0.35, **spec.get("sfx_gain", {})}
    for name, at, gain in cues:
        place(mix, fx(name), max(0.0, at), gains.get(name, 0.45) if gain is None else gain)
    mix = mix[:N(total)]

    out_dir = os.path.join(ROOT, "public", "audio")
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, f"pins-{ep}-mix.mp3")
    tmp = out + ".f32"
    (mix / max(1.0, float(np.max(np.abs(mix))) / 0.98)).astype(np.float32).tofile(tmp)
    # two-pass loudnorm, linear: one fixed gain for the whole mix. (Single-pass loudnorm rides the
    # level like an AGC and pulls the music back up in every pause, undoing the voice/music balance.)
    probe = subprocess.run([FF, "-hide_banner", "-f", "f32le", "-ac", "1", "-ar", str(SR), "-i", tmp,
                            "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                           capture_output=True, text=True).stderr
    m = json.loads(probe[probe.rindex("{"):probe.rindex("}") + 1])
    ln = (f"loudnorm=I=-14:TP=-1.5:LRA=11:linear=true:measured_I={m['input_i']}:measured_TP={m['input_tp']}"
          f":measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}")
    subprocess.run([FF, "-v", "error", "-y", "-f", "f32le", "-ac", "1", "-ar", str(SR), "-i", tmp,
                    "-af", ln, "-ar", str(SR), "-ac", "2", "-c:a", "libmp3lame", "-b:a", "192k", out],
                   check=True)
    os.remove(tmp)

    json.dump({"duration": total, "lines": lines_out}, open(os.path.join(ep_dir, "timing.json"), "w"), indent=1)
    print(f"{out}  ({total:.2f}s, {len(lines_out)} lines, {len(cues)} sfx cues)")


if __name__ == "__main__":
    main()
