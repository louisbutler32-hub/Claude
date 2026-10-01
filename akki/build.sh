#!/usr/bin/env bash
# Re-edit an AKKI TALKS short: zoom punch on the payoff beat + pop-in captions.
#   bash akki/build.sh                  # both
#   bash akki/build.sh zoro-cursed-sword
# Input:  akki/source/<name>.mp4  (the original render)
# Output: out/akki/<name>.mp4 and out/akki/thumbnail-<name>.jpg (1080x1920)
set -euo pipefail
cd "$(dirname "$0")/.."
FONTS=clipper/assets/fonts
mkdir -p out/akki

# name | punch-in window (s) | thumbnail frame (s)
SHORTS=(
  "zoro-cursed-sword|10.25|11.20|12.0"
  "bowling|11.00|11.70|9.25"
)

for row in "${SHORTS[@]}"; do
  IFS='|' read -r name p0 p1 thumb <<<"$row"
  [[ $# -gt 0 && " $* " != *" $name "* ]] && continue
  src=akki/source/$name.mp4
  # 12% zoom punch over the payoff, then snap back
  zoom="zoompan=z='if(between(in_time,$p0,$p1),1.12,1)':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1080x1920:fps=24"
  ffmpeg -v error -y -i "$src" \
    -vf "$zoom,subtitles=akki/$name/captions.ass:fontsdir=$FONTS" \
    -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -c:a copy -movflags +faststart \
    out/akki/$name.mp4
  ffmpeg -v error -y -ss "$thumb" -i "$src" -frames:v 1 \
    -vf "subtitles=akki/$name/thumb.ass:fontsdir=$FONTS" -q:v 2 \
    out/akki/thumbnail-$name.jpg
  echo "built out/akki/$name.mp4"
done
