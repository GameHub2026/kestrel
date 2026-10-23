#!/bin/zsh
# Überträgt die Schlüssel für die Merkliste aus api-keys.txt (Spiele-Bibliothek) als geheime
# Einstellungen ins Cloudflare-Pages-Projekt "kestrel". Gibt keine Werte aus.
cd "$(dirname "$0")/.." || exit 1
KEYS="../Claude - Spiele-Bibliothek/api-keys.txt"
wert() { grep -m1 "^$1:" "$KEYS" | sed "s/^$1:[[:space:]]*//" | tr -d '\r'; }
setze() { [[ -n "$2" ]] || { echo "  $1: kein Wert in api-keys.txt, übersprungen"; return; }
  print -rn -- "$2" | npx --no-install wrangler pages secret put "$1" --project-name kestrel >/dev/null 2>&1 && echo "  $1: gesetzt" || echo "  $1: FEHLER"; }
setze IGDB_CLIENT_ID "$(wert 'IGDB Client ID')"
setze IGDB_CLIENT_SECRET "$(wert 'IGDB Client Secret')"
setze TMDB_KEY "$(wert 'TMDB API Key')"
setze MERK_TOKEN "$(wert 'Kestrel Merkliste Schlüssel')"
