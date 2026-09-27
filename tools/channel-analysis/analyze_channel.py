#!/usr/bin/env python3
"""
Analyse every Short on a YouTube channel, writing one JSON per video.

    python analyze_channel.py https://www.youtube.com/@GarrettTheCarrot/shorts
    python summarize.py

For each Short: download it at <=360p into out/.work/<id>/, find the cuts
with PySceneDetect's ContentDetector, pull one frame from the middle of each
shot with ffmpeg, tile the frames into out/<id>.contact.jpg (8 columns, cut
time burned into each tile), OCR every frame with EasyOCR, transcribe the
audio with faster-whisper (word timestamps), write out/<id>.json, then
delete the video.

Resumable: any Short that already has out/<id>.json is skipped, so Ctrl-C
whenever and re-run the same command. A Short that fails gets
out/<id>.error.json instead and is skipped on later runs unless you pass
--retry-errors. Five failures in a row stops the run, since that almost
always means YouTube has started refusing requests rather than five
individually broken videos.

YouTube refuses media downloads from most cloud/datacenter IPs, so run this
on your own machine. If downloads still fail with 403 or "confirm you're not
a bot", add --cookies-from-browser firefox (or chrome, edge, safari...).
yt-dlp also needs a JavaScript runtime for YouTube (deno, or node — node is
picked up automatically if it's on PATH).

ffmpeg comes from $FFMPEG, then PATH, then the imageio-ffmpeg wheel.
"""
import argparse
import importlib.util
import json
import math
import os
import re
import shutil
import subprocess
import sys
import time
import traceback
import warnings
from datetime import datetime, timezone
from pathlib import Path

# EasyOCR on CPU makes torch warn about pinned memory on every single frame
warnings.filterwarnings("ignore", module=r"torch\.")

HERE = Path(__file__).resolve().parent
TILE_W = 180
COLS = 8


def now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def write_json(path, data):
    """Write via a temp file + rename, so a Ctrl-C never leaves half a JSON behind."""
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(json.dumps(data, indent=1, ensure_ascii=False))
    os.replace(tmp, path)


def run(cmd):
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f"{Path(cmd[0]).name} failed ({proc.returncode}):\n{proc.stderr.strip()[-1500:]}")
    return proc


def check_dependencies():
    missing = [pkg for mod, pkg in [
        ("yt_dlp", "yt-dlp[default]"), ("scenedetect", "scenedetect"), ("cv2", "opencv-python-headless"),
        ("easyocr", "easyocr"), ("faster_whisper", "faster-whisper"), ("PIL", "Pillow"),
    ] if importlib.util.find_spec(mod) is None]
    if missing:
        sys.exit("missing Python packages — pip install -r requirements.txt\n  (" + ", ".join(missing) + ")")


def find_ffmpeg():
    found = os.environ.get("FFMPEG") or shutil.which("ffmpeg")
    if found:
        return found
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        sys.exit("no ffmpeg: install it, pip install imageio-ffmpeg, or set FFMPEG=/path/to/ffmpeg")


def ytdlp_base(args):
    cmd = [sys.executable, "-m", "yt_dlp", "--no-warnings"]
    # yt-dlp only enables deno by default; node is what most machines already have
    if not shutil.which("deno") and shutil.which("node"):
        cmd += ["--js-runtimes", f"node:{shutil.which('node')}"]
    if args.cookies:
        cmd += ["--cookies", args.cookies]
    if args.cookies_from_browser:
        cmd += ["--cookies-from-browser", args.cookies_from_browser]
    return cmd


def shorts_url(url):
    """A bare channel URL lists the channel's tabs, not videos — point it at the Shorts tab."""
    url = url.rstrip("/")
    if re.search(r"youtube\.com/(@[^/?]+|channel/[^/?]+|c/[^/?]+|user/[^/?]+)$", url):
        return url + "/shorts"
    return url


# --------------------------------------------------------------------------
# listing and download
# --------------------------------------------------------------------------

def list_shorts(url, args):
    """Re-list every run so new uploads get picked up; fall back to the last listing if that fails."""
    cache = args.out / "_listing.json"
    proc = subprocess.run([*ytdlp_base(args), "--flat-playlist", "-J", url], capture_output=True, text=True)
    if proc.returncode == 0:
        data = json.loads(proc.stdout)
        entries = [
            {k: e.get(k) for k in ("id", "title", "url", "view_count", "duration")}
            for e in data.get("entries") or [] if e.get("id")
        ]
        write_json(cache, {"url": url, "channel": data.get("channel"), "listed_at": now(), "entries": entries})
        return entries
    if cache.exists():
        cached = json.loads(cache.read_text())
        if cached.get("url") == url:
            print(f"listing failed, using the one from {cached['listed_at']}:\n  {proc.stderr.strip()[-300:]}")
            return cached["entries"]
    sys.exit(f"yt-dlp could not list {url}:\n{proc.stderr.strip()[-1500:]}")


def download(entry, work, args, ffmpeg):
    """Returns (video path, yt-dlp info dict). A half-finished download in `work` is resumed."""
    url = entry.get("url") or f"https://www.youtube.com/shorts/{entry['id']}"
    run([
        *ytdlp_base(args), "--no-playlist", "--no-progress",
        # res is the smaller dimension, so this is the 360x640 rendition of a vertical Short
        "-f", "bv*+ba/b", "-S", f"res:{args.max_res},codec:h264",
        "--merge-output-format", "mp4", "--ffmpeg-location", ffmpeg,
        "--write-info-json", "-o", str(work / "video.%(ext)s"), url,
    ])
    info = json.loads((work / "video.info.json").read_text())
    video = next(p for p in work.glob("video.*") if p.suffix not in (".json", ".part", ".ytdl"))
    return video, info


# --------------------------------------------------------------------------
# per-video analysis
# --------------------------------------------------------------------------

def detect_shots(video_path, threshold, min_shot):
    from scenedetect import ContentDetector, SceneManager, open_video

    video = open_video(str(video_path))
    fps = float(video.frame_rate)
    manager = SceneManager()
    manager.add_detector(ContentDetector(threshold=threshold, min_scene_len=max(1, round(min_shot * fps))))
    manager.detect_scenes(video)
    shots = []
    for i, (start, end) in enumerate(manager.get_scene_list(start_in_scene=True)):
        s, e = start.get_seconds(), end.get_seconds()
        shots.append({
            "index": i, "start": round(s, 3), "end": round(e, 3), "duration": round(e - s, 3),
            "start_frame": start.get_frames(), "end_frame": end.get_frames(),
        })
    if not shots:
        raise RuntimeError("PySceneDetect decoded no frames")
    width, height = video.frame_size
    return shots, {"fps": round(fps, 3), "width": width, "height": height, "frames": video.duration.get_frames()}


def grab_frame(ffmpeg, video, t, dst):
    run([ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{t:.3f}", "-i", str(video),
         "-frames:v", "1", "-q:v", "2", str(dst)])
    if not dst.exists():
        raise RuntimeError(f"ffmpeg produced no frame at {t:.3f}s")


def load_font(size):
    from PIL import ImageFont
    for name in ("DejaVuSans-Bold.ttf", "Arial Bold.ttf", "arialbd.ttf", "Helvetica.ttc"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            pass
    try:
        return ImageFont.load_default(size=size)
    except TypeError:  # Pillow < 10.1
        return ImageFont.load_default()


def clock(t):
    return f"{int(t // 60)}:{t % 60:04.1f}"


def contact_sheet(frames, shots, dst, heading):
    from PIL import Image, ImageDraw

    with Image.open(frames[0]) as first:
        tile_h = round(TILE_W * first.height / first.width)
    head_h, label_h = 30, 20
    rows = math.ceil(len(frames) / COLS)
    sheet = Image.new("RGB", (COLS * TILE_W, head_h + rows * tile_h), (17, 17, 17))
    draw = ImageDraw.Draw(sheet)
    draw.text((8, 7), heading, fill=(235, 235, 235), font=load_font(15))
    font = load_font(13)
    for i, (frame, shot) in enumerate(zip(frames, shots)):
        x, y = (i % COLS) * TILE_W, head_h + (i // COLS) * tile_h
        with Image.open(frame) as im:
            sheet.paste(im.convert("RGB").resize((TILE_W, tile_h), Image.LANCZOS), (x, y))
        draw.rectangle([x, y + tile_h - label_h, x + TILE_W - 1, y + tile_h - 1], fill=(0, 0, 0))
        draw.text((x + 5, y + tile_h - label_h + 3), f"{i + 1:02d}  {clock(shot['start'])}  {shot['duration']:.1f}s",
                  fill=(255, 255, 255), font=font)
        draw.rectangle([x, y, x + TILE_W - 1, y + tile_h - 1], outline=(17, 17, 17))
    sheet.save(dst, quality=88)


def palette(frame, n=6):
    """The frame's n main colours (median cut on a thumbnail) with their share of the pixels."""
    from PIL import Image

    with Image.open(frame) as im:
        small = im.convert("RGB")
        small.thumbnail((96, 96))
    q = small.quantize(colors=n, method=Image.Quantize.MEDIANCUT)
    pal = q.getpalette()
    counts = sorted(q.getcolors(), reverse=True)
    total = sum(c for c, _ in counts)
    return [{"hex": "#{:02x}{:02x}{:02x}".format(*pal[3 * i:3 * i + 3]), "share": round(c / total, 3)} for c, i in counts]


def ocr(reader, frame, width, height, min_conf):
    hits = []
    for box, text, conf in reader.readtext(str(frame)):
        xs, ys = [float(p[0]) for p in box], [float(p[1]) for p in box]
        hits.append({
            "text": text, "conf": round(float(conf), 3),
            # normalised [x0, y0, x1, y1], so position reads the same at any resolution
            "box": [round(min(xs) / width, 4), round(min(ys) / height, 4), round(max(xs) / width, 4), round(max(ys) / height, 4)],
        })
    hits.sort(key=lambda h: (round(h["box"][1] * 25), h["box"][0]))  # reading order: rows, then left to right
    return hits, " ".join(h["text"] for h in hits if h["conf"] >= min_conf)


def transcribe(model, video, language):
    segments, info = model.transcribe(str(video), word_timestamps=True, vad_filter=True, language=language)
    segs = [{
        "start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip(),
        "avg_logprob": round(s.avg_logprob, 3), "no_speech_prob": round(s.no_speech_prob, 3),
        "words": [{"start": round(w.start, 2), "end": round(w.end, 2), "word": w.word.strip(), "prob": round(w.probability, 3)}
                  for w in (s.words or [])],
    } for s in segments]
    return {
        "language": info.language, "language_probability": round(info.language_probability, 3),
        "text": " ".join(s["text"] for s in segs), "segments": segs,
    }


class Models:
    """EasyOCR and Whisper take a while to load, so load each once, and only if there's work."""

    def __init__(self, whisper_size):
        self.whisper_size = whisper_size
        self._ocr = self._whisper = None

    def ocr(self):
        if self._ocr is None:
            import easyocr
            self._ocr = easyocr.Reader(["en"], gpu=True, verbose=False)  # falls back to CPU by itself
        return self._ocr

    def whisper(self):
        if self._whisper is None:
            import ctranslate2
            from faster_whisper import WhisperModel
            if ctranslate2.get_cuda_device_count() > 0:
                self._whisper = WhisperModel(self.whisper_size, device="cuda", compute_type="float16")
            else:
                self._whisper = WhisperModel(self.whisper_size, device="cpu", compute_type="int8")
        return self._whisper


def versions():
    import easyocr
    import faster_whisper
    import scenedetect
    import yt_dlp.version
    return {"yt_dlp": yt_dlp.version.__version__, "scenedetect": scenedetect.__version__,
            "easyocr": easyocr.__version__, "faster_whisper": faster_whisper.__version__}


def process(entry, args, models, ffmpeg):
    vid = entry["id"]
    work = args.out / ".work" / vid
    work.mkdir(parents=True, exist_ok=True)

    video, info = download(entry, work, args, ffmpeg)
    shots, stream = detect_shots(video, args.threshold, args.min_shot)

    frames = []
    for shot in shots:
        t = shot["start"] + shot["duration"] / 2  # mid-shot: clear of any transition at the cut
        if shot["index"] == 0:
            t = min(t, 1.0)  # but the opening is what viewers see first — the hook, not 6s into a long shot
        frame = work / f"shot{shot['index']:03d}.jpg"
        grab_frame(ffmpeg, video, t, frame)
        shot["frame_time"] = round(t, 3)
        frames.append(frame)

    sheet = args.out / f"{vid}.contact.jpg"
    contact_sheet(frames, shots, sheet,
                  f"{vid}  ·  {info.get('title', '')[:80]}  ·  {len(shots)} shots  ·  {clock(info.get('duration') or 0)}")

    reader = models.ocr()
    for shot, frame in zip(shots, frames):
        shot["ocr"], shot["text"] = ocr(reader, frame, stream["width"], stream["height"], args.ocr_min_conf)
        shot["colors"] = palette(frame)

    has_audio = info.get("acodec") not in (None, "none")
    transcript = transcribe(models.whisper(), video, args.language) if has_audio else None

    doc = {
        "video": {
            "id": vid, "url": info.get("webpage_url") or entry.get("url"),
            **{k: info.get(k) for k in ("title", "description", "upload_date", "duration", "view_count",
                                        "like_count", "comment_count", "tags", "channel", "channel_id", "uploader_id")},
        },
        "source": {**{k: info.get(k) for k in ("format_id", "vcodec", "acodec")}, **stream},
        "analysis": {
            "analyzed_at": now(), "scene_threshold": args.threshold, "min_shot_seconds": args.min_shot,
            "frame": "mid-shot (first shot: min(mid, 1.0s))", "ocr_min_conf": args.ocr_min_conf, "whisper_model": args.whisper_model,
            "versions": versions(),
        },
        "contact_sheet": sheet.name,
        "shot_count": len(shots),
        "shots": shots,
        "transcript": transcript,
    }
    write_json(args.out / f"{vid}.json", doc)
    shutil.rmtree(work)
    return doc


# --------------------------------------------------------------------------

def parse_args(argv):
    ap = argparse.ArgumentParser(description=__doc__.strip().splitlines()[0])
    ap.add_argument("channel", help="channel or Shorts-tab URL, e.g. https://www.youtube.com/@GarrettTheCarrot/shorts")
    ap.add_argument("--out", type=Path, default=HERE / "out", help="output folder (default: out/ next to this script)")
    ap.add_argument("--limit", type=int, help="process at most N not-yet-done Shorts this run")
    ap.add_argument("--retry-errors", action="store_true", help="retry Shorts that failed on an earlier run")
    ap.add_argument("--max-res", type=int, default=360, help="download resolution cap, smaller side (default 360)")
    ap.add_argument("--threshold", type=float, default=27.0, help="ContentDetector threshold (default 27, lower = more cuts)")
    ap.add_argument("--min-shot", type=float, default=0.2,
                    help="shortest shot in seconds (default 0.2; PySceneDetect's own 0.5s default would hide fast cutting)")
    ap.add_argument("--ocr-min-conf", type=float, default=0.3,
                    help="confidence floor for each shot's joined `text` (raw detections keep everything)")
    ap.add_argument("--whisper-model", default="small")
    ap.add_argument("--language", help="force a transcription language, e.g. en (default: auto-detect)")
    ap.add_argument("--sleep", type=float, default=2.0, help="seconds between downloads, to stay under rate limits")
    ap.add_argument("--cookies", help="Netscape cookies.txt passed to yt-dlp")
    ap.add_argument("--cookies-from-browser", help="e.g. firefox, chrome — passed to yt-dlp")
    return ap.parse_args(argv)


def main(argv=None):
    args = parse_args(argv)
    check_dependencies()
    ffmpeg = find_ffmpeg()
    args.out.mkdir(parents=True, exist_ok=True)

    url = shorts_url(args.channel)
    entries = list_shorts(url, args)
    done = {p.name[:-5] for p in args.out.glob("*.json")}
    failed = {p.name[:-11] for p in args.out.glob("*.error.json")}
    todo = [e for e in entries if e["id"] not in done and (args.retry_errors or e["id"] not in failed)]
    skipped_errors = sum(1 for e in entries if e["id"] in failed and e["id"] not in done) if not args.retry_errors else 0
    print(f"{len(entries)} Shorts listed · {len(entries) - len(todo) - skipped_errors} already done"
          + (f" · {skipped_errors} failed earlier (--retry-errors to retry)" if skipped_errors else "")
          + f" · {len(todo)} to go")
    if args.limit is not None:
        todo = todo[:args.limit]

    models = Models(args.whisper_model)
    streak = 0
    for n, entry in enumerate(todo, 1):
        vid = entry["id"]
        started = time.time()
        label = f"[{n}/{len(todo)}] {vid} {(entry.get('title') or '')[:50]!r}"
        try:
            doc = process(entry, args, models, ffmpeg)
        except Exception as exc:  # one broken Short shouldn't stop the other 200
            streak += 1
            write_json(args.out / f"{vid}.error.json",
                       {"id": vid, "failed_at": now(), "error": str(exc)[-2000:], "traceback": traceback.format_exc()[-4000:]})
            shutil.rmtree(args.out / ".work" / vid, ignore_errors=True)
            print(f"{label}  FAILED: {str(exc).strip().splitlines()[-1][:160]}")
            if streak >= 5:
                sys.exit("5 failures in a row — YouTube is probably refusing requests. Try --cookies-from-browser, "
                         "wait a while, then re-run with --retry-errors.")
        else:
            streak = 0
            spoken = len((doc["transcript"] or {}).get("segments", []))
            texted = sum(1 for s in doc["shots"] if s["text"])
            print(f"{label}  {doc['shot_count']} shots · text on {texted} · {spoken} speech segments · {time.time() - started:.0f}s")
        if n < len(todo) and args.sleep:
            time.sleep(args.sleep)
    print(f"done → {args.out}  (next: python {Path(__file__).with_name('summarize.py').name})")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        # the unfinished Short's download stays in out/.work and resumes next run
        sys.exit("\nstopped — run the same command again to pick up where it left off")
