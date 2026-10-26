#!/bin/zsh
# Doppelklick = Seite prüfen und alles Neue veröffentlichen.
cd "$(dirname "$0")" || exit 1
pause() { echo; read -k 1 "?Taste drücken zum Schließen …"; }

echo "Bilder prüfen …"
./tools/bilder-verkleinern.sh Texte

echo "Texte aus Interviews schreiben …"
node tools/text-schreiben.mjs || { echo "\n✗ Beim Schreiben ging etwas schief, es wurde NICHTS veröffentlicht."; pause; exit 1; }

echo "Prüfe die Seite …"
if ! npm run build >/tmp/kestrel-build.log 2>&1; then
  echo "\n✗ Da stimmt noch etwas nicht, es wurde NICHTS veröffentlicht:\n"
  grep -iE "fehlt|invalid|expected|error|Could not|does not exist" /tmp/kestrel-build.log | head -12
  pause; exit 1
fi

git add -A
if git diff --cached --quiet; then
  echo "\nNichts Neues zum Veröffentlichen."; pause; exit 0
fi
git commit -q -m "Texte aktualisiert ($(date '+%d.%m.%Y %H:%M'))"
if git pull -q --rebase && git push -q; then
  echo "\n✓ Veröffentlicht. In 1–2 Minuten live: https://kestrel-2tf.pages.dev"
else
  echo "\n✗ Das Hochladen hat nicht geklappt. Bitte Claude Bescheid sagen."
fi
pause
