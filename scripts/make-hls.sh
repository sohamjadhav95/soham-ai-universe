#!/usr/bin/env bash
# Turn MP4s in public/videos into HLS streams: a playlist plus small
# ~4-second pieces, in public/videos/<name>/.
#
# Why: the site's host (Cloudflare Pages) can't send part of a file (no HTTP
# range requests), so a browser can't jump into the middle of one big MP4 and
# restarts it instead. With HLS every piece is its own small file, so a jump
# just loads the right piece. This works on any static host.
#
# Usage: scripts/make-hls.sh                 # every MP4 in public/videos
#        scripts/make-hls.sh public/videos/new-demo.mp4
# Needs ffmpeg. Video and audio are copied as they are (no quality loss).
set -euo pipefail
cd "$(dirname "$0")/.."

if [ "$#" -gt 0 ]; then files=("$@"); else files=(public/videos/*.mp4); fi

for f in "${files[@]}"; do
  name=$(basename "$f" .mp4)
  out="public/videos/$name"
  mkdir -p "$out"
  rm -f "$out"/*.m4s "$out/init.mp4" "$out/index.m3u8"
  ffmpeg -v error -y -i "$f" -c copy -f hls \
    -hls_time 4 -hls_playlist_type vod -hls_segment_type fmp4 \
    -hls_fmp4_init_filename init.mp4 -hls_segment_filename "$out/%03d.m4s" \
    "$out/index.m3u8"
  echo "$f -> $out/index.m3u8 ($(find "$out" -name '*.m4s' | wc -l) pieces, $(du -sh "$out" | cut -f1))"
done
