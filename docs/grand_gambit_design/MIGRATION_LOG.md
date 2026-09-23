# Migrations-Logbuch

## Checkpoint 1 — Sicherung + Audit
Backup-Branch `backup/pre-design-system-v1-20260729-0724`, Feature-Branch `feature/design-system-v1`, Baseline dokumentiert, 24 Vorher-Fotos + Live-Foto, Asset-Register (368 Assets) generiert.

### Entscheidungen
1. **Kein Push auf main, kein Deploy** — Auftrag §8.3/§29. Cloudflare baut nur main; der Feature-Branch wird gepusht (Sicherung), deployt aber nichts.
2. **Browser-Werkzeug:** Playwright im Sandkasten statt der Chrome-Integration — erreicht gambitrise.com direkt (Live-Baseline liegt bei), liefert deterministische Multi-Viewport-Fotos und blockiert nicht auf eine Desktop-Bestätigung, während der Besitzer mobil ist.
3. **Livree-Gesetz bleibt:** Gestaltungsänderungen zielen auf die aktive CARVED-Livree und gemeinsame Komponenten; der CLASSIC-Tokensatz behält seine Werte (Zusage aus design/UEBERGABE). Semantische Ergänzungen (Auswahl, Status, Motion) bekommen in beiden Livreen sinnvolle Werte.
4. **Figuren, Karten, Wappen, Login-Artwork: unantastbar** (Auftrag §3) — nur Einbettung/Umfeld ändern.
5. **Version bleibt 0.41.2** auf dem Feature-Branch; der Sprung passiert erst beim Merge.

## Checkpoint 3 — Kernkomponenten + Musterkammer
Segmented und MapChip: Auswahl = Violett (T.sel/selLine/selInk), lange Namen brechen um, Beruehrziele >=36-44 px, aria-pressed. Button: minHeight T.touch, disabled einheitlich (disOpacity, kein Schein). Alle Glanzlaeufe linear (v0.31.1-Lehre). Tastaturfokus sichtbar violett. GalerieScreen (?galerie): 10 Abschnitte, scrollt nachweislich (scrollHeight 1867 / sichtbar 844 / gescrollt 1023), Cinzel+Cormorant laden nachweislich (document.fonts).

### Ehrliche Korrektur
Audit-Irrtum in Checkpoint 2 behoben: IM Fell English war KEINE Attrappe, sondern real via @fontsource gebuendelt. Der Tausch auf Cormorant bleibt (Auftrag §13: schwer lesbare Antiqua darf ersetzt werden); die Fontsource-Importe sind entfernt (keine doppelte Schriftlast). Spectral 700 (Brettzahlen) unangetastet.

### Umgebungsnotiz
Die Bildansicht ist mitten in der Sitzung ausgefallen (bekanntes Muster, Uebergabe §0a). Ab hier werden visuelle Behauptungen ausschliesslich mit Zahlen belegt: DOM-Messungen, PIL-Pixelanalyse, Messwerkzeuge. Keine Geschmacksarbeit an Figuren.

## Checkpoint 4 — Screens (Phasen 6, 7, 12, 8, 10, 13)
Alle Zahlen in VISUAL_AUDIT.md. Entscheidungen: (a) Match-Umbau als HÖHENDECKEL statt Oben-Ausrichtung — hält transformOrigin/Kamera-Anflug intakt und zieht die Spielerzeile unters Brett; auf breiten Schirmen greift der Deckel nie. (b) Hub-Glanz nur auf der Kampagne (Hauptweg). (c) Schatzkammer-Wächter test_ui.jsx auf neue Polster nachgezogen (Absicht bleibt geprüft). (d) Dock bereits §18-konform — unangetastet. (e) Phasen 5/9/11 nach Prüfung zurückgestellt: Login erfüllt §19.1 strukturell, Figurendetail erbt Tokens, Kampagnen-Pergament ist die gewollte Ausnahme (in Kontrastsuite verdrahtet); Phase 14 ohne Bedarf (Manifest).

## Checkpoint 5 — Abschluss
FINAL_REPORT.md geschrieben; Reinraum auf dem Feature-Branch komplett grün (ci → 791/0/19 → build → single → boot 3/3 → drive3). Push von Feature- und Backup-Branch; main bleibt lokal wie remote auf 1aaa021.

## Checkpoint 6 — Die Vorlagen des Besitzers (v0.43.0)
Zwei GPT-Blaetter nachgereicht (design/vorlagen). Entscheidungen: (a) VORLAGE SCHLAEGT AUFTRAGSTEXT bei der Auswahlfarbe - aktive Reiter/Segmente in flachem Gold (ihr Grundsatzblock sagt "Gold = Aktionen, Violett = Magie/Highlights"); Hierarchie haelt, weil nur der CTA Verlauf+Glanz traegt. sel-Tokens bleiben fuer Fokus/Auren. (b) Palette der Vorlage in CARVED uebernommen, Kontrastsuite blieb der Torwaechter (30/30). (c) NICHT umgesetzt und als Frage offen: das dunkle Stations-Panel der Vorlage (Koenigsgallee) widersprich dem Pergament-Panel des Auftrags §19.7 - Rueckfrage an den Besitzer statt Umbau. Der blaue Punkt auf "Partie starten" in der Vorlage wurde als Generierungs-Beifang gewertet (Tintenmarke bleibt). (d) Lehre wiederholt sich: ein Text-Replace traf den ERSTEN Fundort (ChroniclePanel) statt der Kachel - die ui-Suite fing es; Einschub sitzt jetzt in Tile selbst.

## Checkpoint 7 — Rueckmeldung des Besitzers (v0.44.0)
Auswahl endgueltig violett (Chronik: v0.42 violett -> v0.43 gold per Vorlage -> v0.44 violett nach Live-Sicht). Sofort-spielen-Griff im Hub (persistierte letzte Einstellungen). Online: Modus ganz oben, Einstellungen ans Ende. NEU pruefe-textfluss.mjs als 320-px-Torwaechter: 20 Funde, alle behoben (Silbentrennung; gg-fit-svg mit bestimmten Spuren - Lehrstueck: percent-max-height gegen auto-Grid-Zeilen ist unbestimmt). Hofstaat: eine Handschrift fuer Hof und Meister, Stufen auch an Verbuendeten. Hinweis: im Hub laufen jetzt ZWEI gestaffelte Glanzlaeufe (Kampagne + Sofort spielen) - bewusste Ausnahme von der Ein-Glanz-Regel zugunsten des Sofortstarts; die Staffelung (useShineDelay) verhindert den Chor.

## v0.49.0 - Sonderzuege
Kettensoll: **810 gruen / 20 Suiten** (vorher 791/19; neu: test_sonderzuege.mjs).
Rochade + En passant in Engine (moves.js, transitions.js), Kreuzfeld-Wache in
legalMoves, lastMove traegt double/epCapture/rookFrom/rookTo.
