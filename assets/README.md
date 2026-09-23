# GAMBIT — Grafik-Assets bearbeiten

Alle Spielgrafiken liegen hier als normale SVG-Dateien und lassen sich mit
Inkscape, Illustrator oder jedem Texteditor bearbeiten und austauschen.

## Der Workflow (3 Schritte)

1. SVG in `assets/pieces/` oder `assets/scenery/` bearbeiten (oder ersetzen).
2. `npm run art` ausführen — schreibt die Grafiken ins Spiel.
   (Läuft automatisch bei `npm run dev`, `build`, `build:single` und `test`.)
3. Fertig. Kein weiterer Schritt.

## Die Verknüpfung: `data-gg`

Das Spiel findet eine Grafik NICHT über den Dateinamen, sondern über das
Attribut am `<svg>`-Wurzelelement:

```
<svg ... data-gg="piece:P">      ← der Bauer
<svg ... data-gg="piece:V">      ← der Kapitän
<svg ... data-gg="boss:beast">   ← Boss-Silhouette „Bestie"
<svg ... data-gg="crest">        ← das Wappen des Gambit
<svg ... data-gg="scenery:pine"> ← Nadelbaum der Karte
```

Dateinamen darfst du also frei ändern — das `data-gg` muss erhalten bleiben.
(Inkscape behält unbekannte Attribute beim Speichern bei.)

## Farben: CSS-Variablen

Das Spiel färbt die Figuren zur Laufzeit (Spieler = Gold, Gegner = Navy).
Dafür stehen in den Dateien Einträge wie:

```
style="fill:var(--fill, #c9a45c);stroke:var(--rim, none)"
```

| Variable    | Bedeutung                                    |
|-------------|----------------------------------------------|
| `--fill`    | Grundfarbe der Silhouette (Gold/Navy)         |
| `--rim`     | Kantenlinie; nur der Gegner bekommt eine      |
| `--detail`  | dunkle Akzente (z. B. Wappen-Kontur)          |
| `--accent`  | Leucht-Akzente der Bosse (Augen, Marken)      |
| `--c1/2/3`  | Nadelbaum: dunkel / mittel / hell (je Jahreszeit) |
| `--crown` `--hi` | Laubbaum-Krone + Highlight               |
| `--caps`    | Ridge: `display` der Schneekappen             |

Regeln:
- **`var(--…)` beibehalten** = das Spiel färbt weiter automatisch um.
- **Feste Farbe eintragen** (z. B. `fill:#ff0000`) = dieses Element behält
  deine Farbe auf beiden Seiten. Beides ist erlaubt und mischbar.
- Wichtig: `var()` funktioniert nur in `style="…"`, nicht als Attribut
  (`fill="var(--fill)"` wäre ungültig).

## Zeichenregeln

- Figuren: Koordinatenraum **0–48**, Boden bei y≈40 (dort sitzt der Sockel).
  Der Level-Sockel (Kerben, Stufen, Goldband) wird vom Spiel gezeichnet —
  male keinen eigenen Boden unter y=40.
- Landschaft: um den **Ursprung (0,0)** zeichnen; Position/Größe setzt das
  Spiel per transform. Die viewBox ist nur deine Zeichenfläche.
- Sonderfälle: `pine-snow.svg` ist die Schnee-Auflage, die im Winter ÜBER
  `pine.svg` gelegt wird. In `ridge.svg` tragen die Schneekappen
  `display:var(--caps, inline)` — bitte beibehalten, sonst schneit es
  auch in der Wüste.
- Inkscape-Extras (metadata, sodipodi) werden beim Import automatisch
  entfernt; Gradients/`<defs>` funktionieren.

## Die Kampagnen-Karte

Die Karte wird **prozedural** aus den Bausteinen in `assets/scenery/`
zusammengesetzt (jede Liga eigenes Klima, Streuung per Seed). Karte
verbessern heißt also: **die Bausteine verbessern** — ein schönerer Baum
verschönert alle zehn Welten auf einmal.

Zusätzlich gibt es einen Poster-Export der fertigen Karte:

```
npm run map:svg                 # Ligen 1,4,9,10 → assets/map-export/
LEAGUES=3 npm run map:svg       # nur Liga 3
```

Diese Dateien sind Schnappschüsse zum Anschauen/Bearbeiten außerhalb des
Spiels (Poster, Trailer, Store-Grafiken) — Änderungen darin fließen NICHT
zurück ins Spiel.

## Neue Grafiken hinzufügen

- Neue Boss-Silhouette: Datei mit `data-gg="boss:<name>"` ablegen und den
  Namen in `src/content/bosses.js` als `art` verwenden.
- Neuer Landschafts-Baustein: `data-gg="scenery:<name>"` + kleiner Wrapper
  in `src/app/ui/mapArt.jsx` (eine Zeile, Muster siehe Dateiende dort).
