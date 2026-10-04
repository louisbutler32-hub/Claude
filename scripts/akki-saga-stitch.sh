#!/usr/bin/env bash
# Join the four saga acts into the finished story: out/akki/zoro-24-hours.mp4
# Re-encodes (acts are separately encoded), audio at 192k AAC.
set -euo pipefail
cd "$(dirname "$0")/.."
for n in 1 2 3 4; do [[ -f out/akki/saga-act$n.mp4 ]] || { echo "missing out/akki/saga-act$n.mp4" >&2; exit 1; }; done
ffmpeg -v error -y -i out/akki/saga-act1.mp4 -i out/akki/saga-act2.mp4 -i out/akki/saga-act3.mp4 -i out/akki/saga-act4.mp4 \
  -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a][3:v][3:a]concat=n=4:v=1:a=1[v][a]" -map "[v]" -map "[a]" \
  -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart out/akki/zoro-24-hours.mp4
echo "built out/akki/zoro-24-hours.mp4"
