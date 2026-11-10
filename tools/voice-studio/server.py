#!/usr/bin/env python3
"""Voice Studio: a small web page for making voice-overs.

    python3 tools/voice-studio/server.py            # http://localhost:8765
    python3 tools/voice-studio/server.py --port 9000

Two engines:

  * Kokoro (kokoro-onnx): 41 stock voices, fast on CPU. Needs the two model
    files in .tts/ (kokoro-v1.0.onnx, voices-v1.0.bin), the same ones
    scripts/make-vo.py uses.
  * Chatterbox (chatterbox-tts, optional): clones a voice from a short clean
    sample. CPU only here, so it takes roughly 6 s per second of audio. If it
    isn't installed, the page just hides cloning.

Setup (one venv, Python 3.13):
    python3 -m venv ~/vc-venv && . ~/vc-venv/bin/activate
    pip install torch==2.6.0 torchaudio==2.6.0 --index-url https://download.pytorch.org/whl/cpu
    pip install chatterbox-tts kokoro-onnx soundfile

Paste a script, pick a voice, render one MP3. Each line becomes one take with
a pause between takes. Renders and cloned-voice samples live in
out/voice-studio/ (gitignored). Only clone your own voice or one you have the
speaker's permission to use.
"""
import argparse
import importlib.util
import io
import json
import os
import re
import subprocess
import tempfile
import threading
import time
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TTS = os.path.join(ROOT, ".tts")
OUT = os.path.join(ROOT, "out", "voice-studio")
VOICES = os.path.join(OUT, "voices")
HERE = os.path.dirname(os.path.abspath(__file__))
SR = 24000
CLONE_AVAILABLE = importlib.util.find_spec("chatterbox") is not None

LANGS = {"a": ("en-us", "American English"), "b": ("en-gb", "British English"),
         "e": ("es", "Spanish"), "f": ("fr-fr", "French"), "h": ("hi", "Hindi"),
         "i": ("it", "Italian"), "p": ("pt-br", "Portuguese (BR)")}

kokoro = Kokoro(os.path.join(TTS, "kokoro-v1.0.onnx"), os.path.join(TTS, "voices-v1.0.bin"))
engine_lock = threading.Lock()   # one synthesis at a time: the CPU is the bottleneck
_cb = None


def chatterbox():
    global _cb
    if _cb is None:
        import torch
        from chatterbox.tts import ChatterboxTTS
        torch.set_num_threads(os.cpu_count() or 4)
        _cb = ChatterboxTTS.from_pretrained(device="cpu")
    return _cb


_asr = None
BANDS = [100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500,
         3150, 4000, 5000, 6300, 8000, 10000]


def whisper():
    global _asr
    if _asr is None:
        from faster_whisper import WhisperModel
        _asr = WhisperModel("base.en", device="cpu", compute_type="int8")
    return _asr


def ltas(y, sr=SR):
    """Long-term average spectrum of the voiced frames, in dB per 1/3-octave band."""
    import librosa
    st = np.abs(librosa.stft(y, n_fft=2048, hop_length=512)) ** 2
    e = st.sum(0)
    st = st[:, e > np.percentile(e, 40)]
    f = librosa.fft_frequencies(sr=sr, n_fft=2048)
    return [float(10 * np.log10(st[(f >= b / 2 ** (1 / 6)) & (f < b * 2 ** (1 / 6))].mean() + 1e-12)) for b in BANDS]


def speaker_embedding(y, sr=SR):
    import librosa
    y16 = librosa.resample(y, orig_sr=sr, target_sr=16000) if sr != 16000 else y
    e = chatterbox().ve.embeds_from_wavs([y16.astype(np.float32)], sample_rate=16000, as_spk=True)
    return e / np.linalg.norm(e)


def voice_profile(vid):
    """Tone curve + speaker embedding of the whole uploaded sample, cached next to it."""
    meta_p = os.path.join(VOICES, vid + ".json")
    meta = json.load(open(meta_p))
    emb_p = os.path.join(VOICES, vid + ".npy")
    full_p = os.path.join(VOICES, vid + ".full.wav")
    src = full_p if os.path.exists(full_p) else os.path.join(VOICES, vid + ".wav")
    if "ltas" not in meta or not os.path.exists(emb_p):
        y, _ = sf.read(src, dtype="float32")
        meta["ltas"] = ltas(y)
        json.dump(meta, open(meta_p, "w"))
        with engine_lock:
            np.save(emb_p, speaker_embedding(y))
    return meta["ltas"], np.load(emb_p)


def words(t):
    return re.sub(r"[^a-z0-9 ]", " ", t.lower().replace("'", "")).split()


def word_error(ref, hyp):
    r, h = words(ref), words(hyp)
    d = list(range(len(h) + 1))
    for i, rw in enumerate(r, 1):
        prev, d[0] = d[:], i
        for j, hw in enumerate(h, 1):
            d[j] = min(prev[j] + 1, d[j - 1] + 1, prev[j - 1] + (rw != hw))
    return d[len(h)] / max(1, len(r))


def master(audio, match=None):
    """EQ-match to the reference (clones), clean up, compress, level to -16 LUFS, 48 kHz."""
    chain = ["highpass=f=80"]
    if match is not None:
        ref, got = np.array(match[0]), np.array(ltas(audio))
        i1k = BANDS.index(1000)
        diff = (ref - ref[i1k]) - (got - got[i1k])
        diff = np.convolve(diff, [0.25, 0.5, 0.25], mode="same")   # smooth neighbouring bands
        diff = np.clip(diff * 0.8, -6, 6)                           # stay gentle
        chain.append("firequalizer=gain_entry='%s'" % ";".join("entry(%d,%.1f)" % (b, g) for b, g in zip(BANDS, diff)))
    chain += ["deesser=i=0.3", "acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=1.5",
              "loudnorm=I=-16:TP=-1.5:LRA=9", "aresample=48000"]
    return ",".join(chain)


# ---------- voices ----------
def slugify(s, n=32):
    return re.sub(r"[^a-z0-9]+", "-", s.lower())[:n].strip("-")


def cloned_voices():
    if not os.path.isdir(VOICES):
        return []
    out = []
    for f in sorted(os.listdir(VOICES)):
        if f.endswith(".json"):
            meta = json.load(open(os.path.join(VOICES, f)))
            out.append({"id": "clone:" + f[:-5], "name": meta["name"], "lang": "Your cloned voices",
                        "gender": "cloned", "seconds": meta.get("seconds")})
    return out


def voices():
    out = cloned_voices() if CLONE_AVAILABLE else []
    for v in sorted(kokoro.get_voices()):
        lang = LANGS.get(v[0])
        if not lang:
            continue  # Japanese / Mandarin voices need extra phonemiser packages
        out.append({"id": v, "name": v.split("_", 1)[1].title(), "lang": lang[1],
                    "gender": "Female" if v[1:2] == "f" else "Male"})
    return out


def add_cloned_voice(name, data):
    """Store a reference sample: mono 24 kHz WAV, leading silence cut, max 20 s."""
    name = name.strip()[:40] or "My voice"
    vid = slugify(name) or "voice"
    os.makedirs(VOICES, exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix=".bin", delete=False) as t:
        t.write(data)
        src = t.name
    try:
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src,
                        "-af", "silenceremove=start_periods=1:start_threshold=-45dB,loudnorm=I=-20:TP=-2",
                        "-t", "20", "-ac", "1", "-ar", str(SR), os.path.join(VOICES, vid + ".wav")], check=True)
    except subprocess.CalledProcessError:
        raise ValueError("Couldn't read that audio file. Try an MP3, WAV or M4A.")
    finally:
        os.unlink(src)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "pipe:0", "-t", "90", "-ac", "1", "-ar", str(SR),
                    os.path.join(VOICES, vid + ".full.wav")], input=data, check=True)
    for stale in (vid + ".npy",):
        if os.path.exists(os.path.join(VOICES, stale)):
            os.unlink(os.path.join(VOICES, stale))
    secs = sf.info(os.path.join(VOICES, vid + ".wav")).duration
    if secs < 5:
        os.unlink(os.path.join(VOICES, vid + ".wav"))
        raise ValueError("That sample is under 5 seconds of speech. Use 10–20 seconds of clean talking.")
    json.dump({"name": name, "seconds": round(secs, 1), "created": time.strftime("%Y-%m-%d %H:%M")},
              open(os.path.join(VOICES, vid + ".json"), "w"))
    return {"id": "clone:" + vid, "name": name, "seconds": round(secs, 1)}


def delete_cloned_voice(voice_id):
    vid = os.path.basename(voice_id.split(":", 1)[-1])
    for ext in (".wav", ".json", ".full.wav", ".npy"):
        p = os.path.join(VOICES, vid + ext)
        if os.path.exists(p):
            os.unlink(p)


# ---------- synthesis ----------
def trim(x, thresh=0.008, pad=0.04):
    loud = np.where(np.abs(x) > thresh)[0]
    if len(loud) == 0:
        return x
    p = int(pad * SR)
    return x[max(0, loud[0] - p):min(len(x), loud[-1] + p)]


def chunks(text, limit=260):
    """Chatterbox drifts on long inputs: feed it sentence groups under ~260 characters."""
    sents = re.split(r"(?<=[.!?…])\s+", text.strip())
    out, cur = [], ""
    for s in sents:
        if cur and len(cur) + len(s) + 1 > limit:
            out.append(cur)
            cur = s
        else:
            cur = (cur + " " + s).strip()
    if cur:
        out.append(cur)
    return out


def best_take(c, ref, emb, takes, exaggeration, cfg):
    """Generate `takes` versions of one chunk; keep the one that reads the words right
    and sounds most like the reference speaker."""
    import librosa
    scored = []
    for k in range(takes):
        with engine_lock:
            wav = chatterbox().generate(c, audio_prompt_path=ref, exaggeration=exaggeration,
                                        cfg_weight=cfg, temperature=0.75)
            a = trim(wav.squeeze(0).numpy().astype(np.float32))
            if takes == 1:
                return a
            sim = float(np.dot(speaker_embedding(a), emb))
            hyp = " ".join(s.text for s in whisper().transcribe(
                librosa.resample(a, orig_sr=SR, target_sr=16000), beam_size=1, language="en")[0])
        scored.append((word_error(c, hyp) > 0.12, -sim, k, a))
    return min(scored, key=lambda x: x[:3])[3]


def synth(text, voice, speed=1.0, exaggeration=0.5, cfg=0.5, takes=1):
    if voice.startswith("clone:"):
        vid = os.path.basename(voice[6:])
        ref = os.path.join(VOICES, vid + ".wav")
        if not os.path.exists(ref):
            raise ValueError("That cloned voice no longer exists.")
        emb = voice_profile(vid)[1] if takes > 1 else None
        parts = []
        for c in chunks(text):
            parts.append(best_take(c, ref, emb, takes, exaggeration, cfg))
            parts.append(np.zeros(int(0.12 * SR), dtype=np.float32))
        return np.concatenate(parts[:-1])
    lang = LANGS.get(voice[0], ("en-us",))[0]
    with engine_lock:
        samples, sr = kokoro.create(text, voice=voice, speed=speed, lang=lang)
    return trim(np.asarray(samples, dtype=np.float32))


def to_mp3(audio, path, af=None):
    buf = io.BytesIO()
    sf.write(buf, audio, SR, format="WAV")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "wav", "-i", "pipe:0"] + (["-af", af] if af else []) +
                   ["-codec:a", "libmp3lame", "-b:a", "192k", path], input=buf.getvalue(), check=True)


# ---------- render jobs ----------
jobs = {}


def run_job(job, opts):
    try:
        paras = [p.strip() for p in opts["script"].splitlines() if p.strip()]
        voice, gap = opts["voice"], float(opts.get("gap", 0.35))
        job["total"] = len(paras)
        pieces, timing, cursor = [], [], 0.0
        silence = np.zeros(int(gap * SR), dtype=np.float32)
        for i, p in enumerate(paras):
            job["done"] = i
            a = synth(p, voice, float(opts.get("speed", 1.0)), float(opts.get("exaggeration", 0.5)),
                      float(opts.get("cfg", 0.5)), max(1, min(3, int(opts.get("takes", 1)))))
            if i:
                pieces.append(silence)
                cursor += gap
            pieces.append(a)
            timing.append({"line": i + 1, "text": p, "start": round(cursor, 3), "end": round(cursor + len(a) / SR, 3)})
            cursor += len(a) / SR
        pieces.append(np.zeros(int(0.3 * SR), dtype=np.float32))
        audio = np.concatenate(pieces)
        os.makedirs(OUT, exist_ok=True)
        tag = voice.replace("clone:", "clone-")
        base = os.path.join(OUT, "%s-%s-%s" % (time.strftime("%Y%m%d-%H%M%S"), tag, slugify(paras[0]) or "vo"))
        af = None
        if opts.get("master", True):
            job["stage"] = "mastering"
            match = voice_profile(os.path.basename(voice[6:])) if voice.startswith("clone:") else None
            af = master(audio, match)
        to_mp3(audio, base + ".mp3", af)
        json.dump({"voice": voice, "gap": gap, "lines": timing}, open(base + ".json", "w"), indent=1)
        job.update(state="done", done=len(paras),
                   result={"file": os.path.basename(base) + ".mp3", "seconds": round(len(audio) / SR, 2), "lines": timing})
    except Exception as e:
        job.update(state="error", error=str(e) if isinstance(e, ValueError) else "Render failed: %s" % e)


def start_job(opts):
    if not any(p.strip() for p in opts.get("script", "").splitlines()):
        raise ValueError("The script is empty.")
    if opts.get("voice", "").startswith("clone:") and not CLONE_AVAILABLE:
        raise ValueError("Voice cloning isn't installed on this machine.")
    jid = uuid.uuid4().hex[:10]
    jobs[jid] = {"id": jid, "state": "running", "done": 0, "total": 0, "started": time.time()}
    threading.Thread(target=run_job, args=(jobs[jid], opts), daemon=True).start()
    return jid


def history():
    if not os.path.isdir(OUT):
        return []
    files = sorted((f for f in os.listdir(OUT) if f.endswith(".mp3")), reverse=True)[:30]
    return [{"file": f, "kb": os.path.getsize(os.path.join(OUT, f)) // 1024} for f in files]


class Handler(BaseHTTPRequestHandler):
    def send(self, code, body, ctype="application/json", extra=None):
        if isinstance(body, (dict, list)):
            body = json.dumps(body).encode()
        elif isinstance(body, str):
            body = body.encode()
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        for k, v in (extra or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def file(self, path, ctype, name=None):
        if not os.path.isfile(path):
            return self.send(404, {"error": "not found"})
        extra = {"Content-Disposition": 'attachment; filename="%s"' % name} if name else {}
        self.send(200, open(path, "rb").read(), ctype, extra)

    def do_GET(self):
        u = urlparse(self.path)
        q = parse_qs(u.query)
        if u.path in ("/", "/index.html"):
            return self.send(200, open(os.path.join(HERE, "index.html"), "rb").read(), "text/html; charset=utf-8")
        if u.path == "/api/voices":
            return self.send(200, {"voices": voices(), "clone": CLONE_AVAILABLE})
        if u.path == "/api/history":
            return self.send(200, history())
        if u.path == "/api/job":
            job = jobs.get(q.get("id", [""])[0])
            return self.send(200, job) if job else self.send(404, {"error": "No such render."})
        if u.path == "/api/preview":
            v = q.get("voice", ["am_liam"])[0]
            if v.startswith("clone:"):  # cloned voices preview their own sample: instant
                return self.file(os.path.join(VOICES, os.path.basename(v[6:]) + ".wav"), "audio/wav")
            text = q.get("text", ["This is how I sound. Ready when you are."])[0][:300] or "This is how I sound."
            a = synth(text, v, float(q.get("speed", ["1"])[0]))
            buf = io.BytesIO()
            sf.write(buf, a, SR, format="WAV")
            return self.send(200, buf.getvalue(), "audio/wav")
        if u.path.startswith("/files/"):
            name = os.path.basename(u.path[7:])
            if not name.endswith(".mp3"):
                return self.send(404, {"error": "not found"})
            return self.file(os.path.join(OUT, name), "audio/mpeg", name if q.get("download") else None)
        self.send(404, {"error": "not found"})

    def do_POST(self):
        u = urlparse(self.path)
        q = parse_qs(u.query)
        data = self.rfile.read(int(self.headers.get("Content-Length", 0)))
        try:
            if u.path == "/api/render":
                return self.send(200, {"job": start_job(json.loads(data or b"{}"))})
            if u.path == "/api/voice-upload":
                if not CLONE_AVAILABLE:
                    raise ValueError("Voice cloning isn't installed on this machine.")
                if q.get("consent", [""])[0] != "1":
                    raise ValueError("Confirm this is your voice, or that you have permission to use it.")
                if len(data) > 40 * 1024 * 1024:
                    raise ValueError("That file is over 40 MB. Trim it to under a minute.")
                return self.send(200, add_cloned_voice(q.get("name", [""])[0], data))
            if u.path == "/api/voice-delete":
                delete_cloned_voice(q.get("id", [""])[0])
                return self.send(200, {"ok": True})
            self.send(404, {"error": "not found"})
        except ValueError as e:
            self.send(400, {"error": str(e)})
        except Exception as e:
            self.send(500, {"error": "Something broke: %s" % e})

    def log_message(self, fmt, *args):
        pass


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8765)
    ap.add_argument("--host", default="0.0.0.0")
    a = ap.parse_args()
    print("Voice Studio on http://localhost:%d  (%d voices, cloning %s)"
          % (a.port, len(voices()), "on" if CLONE_AVAILABLE else "off"), flush=True)
    if CLONE_AVAILABLE:  # warm the cloning model up so the first render isn't 30 s slower
        threading.Thread(target=lambda: (engine_lock.acquire(), chatterbox(), engine_lock.release()), daemon=True).start()
    ThreadingHTTPServer((a.host, a.port), Handler).serve_forever()
