#!/bin/zsh
# Verkleinert schwere Bilder in Texte/** auf max. 1600 px (lange Seite) und gute JPEG-Qualität.
# Große PNGs (> 600 KB) werden zu JPG; die Verweise in den .md-Dateien ziehen automatisch mit.
root="${1:-Texte}"
setopt null_glob extended_glob
find "$root" -type f -not -path '*/.obsidian/*' \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.heic' \) | while read -r f; do
  kb=$(( $(stat -f%z "$f") / 1024 ))
  w=$(sips -g pixelWidth "$f" | awk '/pixelWidth/{print $2}'); h=$(sips -g pixelHeight "$f" | awk '/pixelHeight/{print $2}')
  lang=$(( w > h ? w : h ))
  ext="${f:e:l}"
  if [[ $ext == png && $kb -gt 600 ]] || [[ $ext == heic ]]; then
    neu="${f:r}.jpg"
    sips -s format jpeg -s formatOptions 80 -Z 1600 "$f" --out "$neu" >/dev/null && rm "$f"
    for md in "$root"/**/*.md; do
      sed -i '' -e "s#$(basename "$f")#$(basename "$neu")#g" -e "s#${$(basename "$f"):gs/ /%20/}#${$(basename "$neu"):gs/ /%20/}#g" "$md"
    done
    echo "  Bild verkleinert: $(basename "$f") → $(basename "$neu") ($kb KB → $(( $(stat -f%z "$neu") / 1024 )) KB)"
  elif [[ $ext == jpg || $ext == jpeg ]] && { [[ $kb -gt 600 ]] || [[ $lang -gt 1600 ]]; }; then
    sips -s formatOptions 80 -Z 1600 "$f" >/dev/null
    echo "  Bild verkleinert: $(basename "$f") ($kb KB → $(( $(stat -f%z "$f") / 1024 )) KB)"
  fi
done
