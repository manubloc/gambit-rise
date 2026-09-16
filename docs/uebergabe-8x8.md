# Übergabe: Der 8×8-Umbau (Stand v1.23.2, 16.09.2026, 21:45)

Der Besitzer hat entschieden. Diese Datei hält fest, was, warum und in
welcher Reihenfolge — damit jede Sitzung, die es anfasst, dasselbe baut.

## Die Entscheidungen (Besitzer, 16.09.)

1. **Arena (10×10) und Scharmützel (6×6) fliegen komplett raus** — aus der
   Kampagne, dem Schnellen Spiel und dem Online-Spiel. Es gibt nur noch
   8×8: Klassik, Hof, Schneise. Grund: auf dem Handy werden die Figuren
   auf 10×10 zu klein zum Bedienen; und die Aufstellung wird dadurch EIN
   Ding.
2. **Aufstellung hat 8 Plätze, überall.** Keine Kartenwahl mehr im Editor —
   nur die drei Fächer (Aufstellung I–III).
3. **Pflicht ist nur der König.** Der Platz der Dame hält die Dame oder
   einen gewonnenen Meister, sonst nichts (erledigt in v1.23.1).
4. **Jede gesammelte Figur einmal; Läufer, Springer, Turm zweimal.** Mit
   8 Plätzen geht das ohne Ausnahme auf: Turm, Springer, Läufer je zwei,
   Dame, König.
5. **Der Drache** bleibt am Rand mit leerem Flügel — zwei von acht Plätzen
   für 48 Punkte (Vorschlag der Sitzung, unwidersprochen).
6. **Editor-Bedienung:** pro Platz nur zeigen, was dort stehen darf; der
   Slider auch für Meister auf dem Damenplatz; eine Figur, die schon
   woanders steht, wird angeboten — mit Rückfrage „von Platz X hierher
   holen?"; antippen setzt, ziehen (Drag & Drop) geht dazu.

## Gemessene Reichweite (git HEAD 8243f63 / v1.23.2)

- Stationen der Kampagne: 145 Klassik, 147 Hof, 133 Schneise, **67
  Scharmützel, 37 Arena** (Arena ab Kapitel VII, darunter Kapitelfinale).
- `src/content/campaign12.gen.js` ist GENERIERT (11 164 Zeilen) — die
  Umverteilung gehört in den Generator, nicht in die Datei.
- `DEFAULT_BACK_RANK` hat 10 Einträge (4 Springer); `formationKey`,
  `decks.js`, `profile.js` (`formations.arena`), `leveling.js` (`ARENA()`,
  `crownSlots`, `formationLegalOn` mit Flügel), `campaign.js:392`
  (Karten-Freigabe je Kapitel), `timeModes.js`, `mapArt.jsx`, `strings.js`.
- Probendateien mit Arena/Skirmish: 16. Die Projektregel „das Brett ist
  10×10" (Übergabe vom 15.09.) wird damit hinfällig.
- Vorschlag für die Umverteilung: Arena-Stationen und -Finale → Schneise,
  Scharmützel → Hof. Der Besitzer hat keine eigene Verteilung genannt.

## Reihenfolge

1. Generator: Arena → Schneise, Scharmützel → Hof; `MAPS` auf drei Karten;
   Karten-Freigabe je Kapitel anpassen (II: Hof, III: Schneise).
2. `DEFAULT_BACK_RANK` auf 8 (R N B Q K B N R); `formationLegalOn` ohne
   Größenweiche, Zweier-Grenze für R/N/B, Rekrutierte einmal; Flügel bleibt.
3. Profil-Migration: gespeicherte 10er-Aufstellungen beim Laden einmal auf
   8 umrechnen (die Umleitung 10→8 existiert in `buildArmyFromFormation`).
   Deck-Fächer je Regelwerk (chess/hp), nicht mehr je Karte.
4. Editor ohne Kartenwahl; Bedienung nach Punkt 6.
5. Proben nachziehen (16 Dateien), `drive3.mjs` prüft dann 8×8.
6. Kette, Push, Live-Gegenprobe. Erst DANACH: Brett-Skalierung (gleiche
   Größe, exakte Höhe, mit derselben Messung wie im Hofstaat), Brett-
   Animationen (Schneise groß/klein), Mauer/Zaun-Höhe, KI-Block.

## Was im Hofstaat inzwischen steht (v1.13.4 → v1.23.2)

Kulissen (29, alle sichtbar), Sockelband, Stufen-Abzeichen (Form/Farbe/
Metall), Bundtafel, Vollbild mit Kulisse, gleiche Tellerbreite, Bauernhöhe,
Zentrierung, Eckverzierung. Messwerkzeuge: `messe_kulissen.mjs` (43
Proben), `messe_rohr.mjs`, `scripts/messe_sockel.py`, `scripts/messe_farbe.py`.

## Offen nach dem Umbau

Belohnungsschirm ans Kapitelende · Fähigkeiten-Symbole als SVG (sanfter
Verlauf, eigener Ton je Fähigkeit) · Sortieren per langem Druck →
Reihenfolge in der Aufstellung · KI-Bewertung an die Profile, Schwierigkeit,
„Sehr schwer", Drache als Mauer (messen) · Google-Anmeldung · Play Store.
