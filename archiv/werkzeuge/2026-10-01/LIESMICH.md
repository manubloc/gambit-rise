# Werkzeuge aus der Wurzel, ausgelagert am 1.10.2026 (v1.90.18, Audit A68)

Der Audit zählte 81 lose Skripte in der Wurzel des Repos. Diese 33 hatten beim
Referenzscan **keinen einzigen Verweis** — nicht in `package.json`, nicht in
anderem Code, nicht in der CI, nicht in `CLAUDE.md` oder einer Anleitung.
Erwähnungen in `CHANGELOG.md`, `design/` und `archiv/` zählten nicht mit (dort
steht Geschichte, keine Benutzung).

Scan (in der Wurzel ausgeführt):

    for f in $(git ls-files | grep -v "/" | grep -E "\.(mjs|jsx|js|html|py|cjs)$"); do
      n=$(git grep -l -F "$f" -- . ':!CHANGELOG.md' ':!design/*' ':!archiv/*' ':!'"$f" | wc -l)
      [ "$n" = "0" ] && echo "$f"
    done

Beleg, dass nichts fehlt: die volle eiserne Kette (npm test, alle drei Bauten,
Boot-Proben, Fahrprobe, Figurenmaß, Navigationsprobe) lief danach grün.

Gelöscht ist nichts — wer eines braucht, holt es mit `git mv` zurück. Drei
davon (`hole_fal.mjs`, `lade_fal.mjs`, `baue_falmx.mjs`) sprechen die Bild-API
fal.ai an und lesen den Schlüssel aus `FAL_KEY` — nach CLAUDE.md nur mit
ausdrücklicher Freigabe des Besitzers aufrufen.
