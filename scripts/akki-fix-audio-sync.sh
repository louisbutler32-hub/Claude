#!/usr/bin/env bash
# Remotion's AAC encode leaves 2048 samples of encoder priming at the head of
# the track with no edit list to skip them, so the audio plays one frame
# (42.7ms) late against the picture. Trim them and re-encode with ffmpeg,
# which does write the edit list. Video stream is copied untouched.
#   bash scripts/akki-fix-audio-sync.sh out/akki/zoro-cursed-sword.mp4
set -euo pipefail
f="$1"; tmp="${f%.mp4}.sync.mp4"
ffmpeg -v error -y -i "$f" -c:v copy -af "atrim=start_sample=2048,asetpts=PTS-STARTPTS" -c:a aac -b:a 192k -movflags +faststart "$tmp"
mv "$tmp" "$f"
