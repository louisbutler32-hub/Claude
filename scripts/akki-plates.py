#!/usr/bin/env python3
"""Background plates for the AKKI saga: free Pexels stock clips (credits in
akki/saga/plates.json — attribution goes in the upload description), turned into
  public/plates/<key>.jpg        a clean 1920x1080 still
  public/plates/<key>-paint.jpg  the same, softened + saturated + vignetted so
                                 flat cel characters sit on it (the house look)
  public/plates/<key>.mp4        an 8 s 24fps 1920x1080 loop, no audio (live plates)
  public/plates/CREDITS.md       the attribution block
public/plates is gitignored: run this on a fresh clone.
"""
import json, os, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = json.load(open(os.path.join(ROOT, "akki", "saga", "plates.json")))
SRC = os.path.join(ROOT, ".sfx", "plates", "src"); OUT = os.path.join(ROOT, "public", "plates")
os.makedirs(SRC, exist_ok=True); os.makedirs(OUT, exist_ok=True)
STILL_AT = {"tavern2": 1.0, "sunsetdock": 20.0, "sunsetpier": 5.0, "jungle": 3.0}
FIT = "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080"
PAINT = FIT + ",gblur=sigma=1.6,eq=saturation=1.18:contrast=1.06,vignette=PI/5,unsharp=5:5:0.6"
lines = ["# Background plates — stock footage credits (Pexels)", ""]
for k, m in P.items():
    src = os.path.join(SRC, k + ".mp4")
    if not os.path.exists(src):
        subprocess.run(["curl", "-sS", "-L", "-o", src, m["url"]], check=True)
    t = STILL_AT.get(k, 2.0)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", src, "-frames:v", "1", "-vf", FIT, "-q:v", "2", os.path.join(OUT, k + ".jpg")], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", src, "-frames:v", "1", "-vf", PAINT, "-q:v", "2", os.path.join(OUT, k + "-paint.jpg")], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(max(0, t - 1)), "-i", src, "-t", "8", "-an", "-vf", FIT + ",fps=24", "-c:v", "libx264", "-crf", "20", "-preset", "fast", "-pix_fmt", "yuv420p", "-movflags", "+faststart", os.path.join(OUT, k + ".mp4")], check=True)
    lines.append(f"- {k}: video by {m['by']} — {m['page']}")
open(os.path.join(OUT, "CREDITS.md"), "w").write("\n".join(lines) + "\n")
print("wrote", len(P), "plates to public/plates/")
