#!/bin/zsh
# Doppelklick = neuen Text anlegen: eigener Ordner (für die Bilder) + Notiz aus der Vorlage, öffnet sich in Obsidian.
cd "$(dirname "$0")" || exit 1
medium=$(osascript -e 'choose from list {"Spiel", "Film", "Serie"} with prompt "Worüber schreibst du?" default items {"Spiel"}' 2>/dev/null)
[[ "$medium" == "false" || -z "$medium" ]] && exit 0
case "$medium" in Spiel) ordner=Spiele;; Film) ordner=Filme;; Serie) ordner=Serien;; esac
titel=$(osascript -e 'text returned of (display dialog "Titel (so wie er offiziell heißt):" default answer "" buttons {"Abbrechen", "Anlegen"} default button "Anlegen")' 2>/dev/null)
[[ -z "$titel" ]] && exit 0
name=$(print -r -- "$titel" | sed 's#[/:\\?*"<>|]# #g; s/  */ /g; s/^ //; s/ $//')
ziel="Texte/$ordner/$name"
if [[ -e "$ziel/$name.md" ]]; then
  osascript -e "display dialog \"Den Text „$name“ gibt es schon. Ich öffne ihn.\" buttons {\"OK\"} default button \"OK\"" >/dev/null
else
  mkdir -p "$ziel"
  heute=$(date +%Y-%m-%d)
  sed -e "s|^titel: .*|titel: \"$(print -r -- "$titel" | sed 's/"/\\"/g; s/[&|]/\\&/g')\"|" -e "s|^datum: .*|datum: $heute|" "Texte/$ordner/_Vorlage.md" > "$ziel/$name.md"
fi
pfad=$(python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$ordner/$name/$name")
open "obsidian://open?vault=Texte&file=$pfad"
