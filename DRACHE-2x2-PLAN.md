# DER DRACHE (2×2) — Umbauplan

> **STATUS: UMGESETZT in v0.21.63** (Pakete 1+2 komplett, Paket 3 via test_dragon.mjs + KI-Vollpartie abgedeckt). Offene Autor-Punkte unten sind entschieden: Flug L3: 2 / L6: 3 / L9: 4 Felder; Mehrfeld-Attacke AUTOMATISCH (Gewichts-Aura ceil(atk/2) auf alle angrenzenden Feinde nach jedem Setzen).

Der Drache wird die erste GROSSE Figur des Spiels: er belegt dauerhaft 2×2
Felder. Das greift in fast jede Schicht der Engine — dieser Plan hält die vom
Autor festgelegte Spezifikation fest und staffelt die Umsetzung.

## Spielregeln (festgelegt)

1. **Platz**: Der Drache belegt immer genau 4 Felder (2×2).
2. **Aufstellung**: Nur ganz außen (linke oder rechte Flanke). Das Aufstellen
   VERBRAUCHT vier Slots: seine Grundlinien-Spalte + Nachbarspalte, jeweils
   Grundlinie und Bauernreihe — d. h. die beiden Bauern davor und die Figur
   daneben entfallen.
3. **Bestätigung**: Beim Auswählen des Drachen in der Aufstellung fragt das
   Spiel nach: "Diese Figuren weichen dem Drachen: … — fortfahren?"
4. **Gambit-Schutz**: Steht der Gambit auf einem der betroffenen Slots,
   wird er automatisch einen Platz nach links verschoben (bzw. nach rechts,
   wenn links kein legaler Slot frei ist). Er geht NIE verloren.
5. **Zu Fuß**: sehr langsam (1 Feld pro Zug, der ganze 2×2-Block verschiebt
   sich orthogonal), dafür sehr stark: er greift mehrere Felder gleichzeitig
   an — alle Felder, die an seinen Block angrenzen.
6. **Fliegen** (je Level freigeschaltet, Reichweite steigt mit Level,
   **einmal pro Partie**): Der Drache springt als Block auf ein Zielgebiet.
   Landet er auf Figuren, ist das ein Direktangriff auf alle bedeckten
   Felder. **Sterben nicht alle bedeckten Figuren, fällt er auf sein
   Ursprungsfeld zurück** (der Angriff wirkt trotzdem). Diese Rückfall-Regel
   MUSS in der Fähigkeitsbeschreibung "Fliegen" ausdrücklich erklärt werden.
7. **Verfügbarkeit**: Der Drache "kommt erst später" — Rekrutierung bleibt
   spät in Liga I (3 Siege), die 2×2-Form ersetzt seine bisherige 1-Feld-Form.

## Technische Staffelung

### Paket 1 — Kern (Board & Regeln)
- Belegungsmodell: Drache als EINE Figur mit Anker-Index + `big: true`;
  die 3 Partnerfelder tragen Marker `{ ref: ankerIndex }`.
- moves.js: Block-Zug (1 Feld orthogonal, alle 4 Zielzellen frei/Marker),
  Angriffs-Aura (angrenzende Felder), Flug-Zug (Blocksprung, Reichweite
  nach Level, once-per-game-Flag in `used`).
- transitions.js: Schaden an Marker leitet auf den Anker um; stirbt der
  Drache, räumen alle 4 Zellen; Flug-Rückfall-Logik.
- Matt-/Schach-Prüfung: Marker blocken Linien wie Figuren.
- Serialisierung/Hash (online): Marker deterministisch kodieren.

### Paket 2 — Aufstellung & UI
- Formation: Außen-Slot-Regel, 4-Slot-Verbrauch, Bestätigungsdialog,
  Gambit-Auto-Shift.
- BoardView: Drache rendert über 2×2 (Sprite skaliert ~1.9×, Anker unten
  links), Auswahl/Legalfelder für Blockzüge, HP-Ring am Block.
- Fähigkeitstext "Fliegen" inkl. Rückfall-Erklärung (de+en).

### Paket 3 — KI & Balance
- Bewertung: Blockwert, Auren-Druck, Flug-Timing.
- test_balance-Szenarien mit Drache beidseitig; Tuning von HP/ATK.

### Offene Autor-Entscheidungen
- Flug-Reichweite pro Level (Vorschlag: L3: 2 Felder, L6: 3, L9: 4).
- Greift die Aura automatisch jede Runde oder als aktiver Zug?
  (Vorschlag: aktiver "Stampf"-Zug — greift alle angrenzenden Felder an,
  Drache bleibt stehen.)
