#!/bin/bash
# Generate grid-sized derivatives for the photo gallery.
#
# The gallery columns are 350px wide (see .photo-grid in _sass/_photos.scss), so
# 700px covers a 2x display. Originals stay untouched and are what the lightbox
# opens; only the grid thumbnails are served on page load.
#
# Re-run after adding photos:  ./scripts/make-thumbs.sh

set -euo pipefail

SRC="assets/images/photos"
THUMBS="$SRC/thumbs"
WIDTH=700
QUALITY=70

cd "$(dirname "$0")/.."

find "$SRC" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) \
  -not -path "$THUMBS/*" | while read -r src; do
  rel="${src#"$SRC"/}"
  out="$THUMBS/$rel"

  # Skip if the thumbnail is already newer than its source.
  if [ -f "$out" ] && [ "$out" -nt "$src" ]; then
    continue
  fi

  mkdir -p "$(dirname "$out")"
  sips --resampleWidth "$WIDTH" \
       -s format jpeg -s formatOptions "$QUALITY" \
       "$src" --out "$out" >/dev/null
  printf '%-58s %6s -> %s\n' "$rel" \
    "$(du -h "$src" | cut -f1 | tr -d ' ')" \
    "$(du -h "$out" | cut -f1 | tr -d ' ')"
done

echo
total() { find "$1" -type f ${2:+-not -path "$2"} -exec ls -l {} \; | awk '{s+=$5} END {printf "%.1f MB", s/1048576}'; }
echo "originals: $(total "$SRC" "$THUMBS/*")"
echo "thumbs:    $(total "$THUMBS")"
