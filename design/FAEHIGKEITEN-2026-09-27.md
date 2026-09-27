# Die Fähigkeiten — Export, Prüfung, Ideen (27.9.2026)

> Besitzer: *„Kannst du mir alle Fähigkeiten nochmal exportieren. Ich fände es
> auch total spannend, komplett neue Fähigkeiten zu erfinden — wir haben über
> 50 Figuren, aber nur um die 30 Fähigkeiten. Mehr Varianz. Und wichtig: dass
> die Zugvarianten, die daraus entstehen, sauber dargestellt sind und stimmen —
> da hatten wir schon Fehler."*
>
> Quelle ist der Code, nicht die Erinnerung: `src/content/abilities.js`
> (Katalog, Stufen, Sperrgründe), `src/content/characters.js` (Leitern),
> `src/content/bosses.js` (Monster), `src/core/rules/moves.js` (was ein Zug
> wirklich darf). Stand v1.89.0.

## 1. Der Katalog — 32 Fähigkeiten

**Legende.** *Art* = Farbe und Marke (Bewegung blau, Fernkampf orange,
Sprung violett, Zähigkeit grün, Fläche orangerot, Kontrolle rosa, Beute gold,
Zehrung grün, Krönung gelb, List sand). *Wie oft* = „1×" heißt ein Zauber
(je Stufe einmal mehr je Partie: Stufe I 1×, II 2×, III 3×), „dauernd" heißt
passiv und wächst in der Stärke. *Sichtbar* = wirkt sofort / verriegelt im
reinen Schach (Schloss mit Grund) / verborgen bis zum Erwachen der
Lebenspunkte.

### Gangarten (Bewegung) — wirken sofort, auch im reinen Schach

| # | Fähigkeit | Zeichen | Wer | Wie oft | Wirkung |
|---|---|---|---|---|---|
| 1 | Ausweichen `pawn_sidestep` | ↔ | Bauer (St. 3), Gambit (3) | 1× (bis III) | ein Feld zur Seite, ohne zu schlagen |
| 2 | Stoßschlag `pawn_forward_capture` | ⤒ | Bauer (6), Gambit (2) | 1× (bis III) | gerade nach vorn schlagen |
| 3 | Sturmlauf `pawn_charge` | ⇈ | Bauer (5), Gambit (1) | dauernd, Stärke I–III | zwei/drei/vier Felder geradeaus, Weg frei |
| 4 | Rückzug `pawn_backstep` | ⇩ | *(keine Leiter trägt ihn — siehe Lücken)* | 1× (bis III) | ein Feld zurück |
| 5 | Frühe Krönung `pawn_early_promo` | ★ | Bauer (8), Gambit (9) | dauernd, I–II | wandelt eine/zwei Reihen früher um |
| 6 | Weitsprung `knight_longleap` | ⤢ | Springer (3) | dauernd | acht weitere Sprünge (3,1) |
| 7 | Vorreiter `knight_outrider` | ◆ | Springer (6) | dauernd | vier Sprünge (2,2) |
| 8 | Phase `bishop_hop` | ⟿ | Läufer (3), Erzbischof (3) | 1× (bis II) | über eine angrenzende Figur springen |
| 9 | Wachschritt `bishop_ortho_step` | ✜ | Läufer (6), Erzbischof (6) | 1× (bis III) | ein Feld gerade |
| 10 | Sturmschritt `rook_diag_step` | ✛ | Turm (3), Kanzler (3) | dauernd | zusätzlich ein Feld schräg |
| 11 | Durchbruch `rook_breach` | ⊕ | Turm (6), Kanzler (6) | 1× (bis II) | über eine angrenzende Figur springen |
| 12 | Hofsprung `queen_knightleap` | ✦ | Dame (3) | 1× (bis II) | einmal wie ein Springer |
| 13 | Königsflucht `king_dash` | » | König (2) | 1× (bis III) | zwei Felder gerade, Zwischenfeld frei |
| 14 | Fliegen `dragon_flight` | 🜁 | Drache (3) | 1×, Stärke I–III | der 2×2-Block springt zwei/drei/vier Felder; trifft jedes bedeckte Feld |

### Reichweite, Sprung, List

| # | Fähigkeit | Zeichen | Wer | Wie oft | Sichtbar | Wirkung |
|---|---|---|---|---|---|---|
| 15 | Scharfschuss `ranged_shot` | ➶ | Dame (4), Späher (6), Amazone (3), Kapitän (3), Attentäter (7), Magier (3), Hexerin (6), Seherin (6), Alchemist (9), Warlock (5), Inquisitor (3), Techniker (3), Stratege (6) | 1× (bis III) | verriegelt im reinen Schach | trifft eine Figur in Sichtlinie aus der Ferne, man bleibt stehen |
| 16 | Blinzeln `teleport` | ✸ | Dame (5), König (3), Späher (3), Amazone (6), Attentäter (3), Schildträger (9), Magier (5), Hexerin (3), Seherin (3), Warlock (7), Paladin (9), Barde (9), Techniker (9), Flaggenträger (7), Stratege (3), Kundschafter (6) | 1× (bis II) | sofort | auf ein freies Feld in der Nähe |
| 17 | Maskerade `gambit_masquerade` | 🎭 | Gambit (8) | dauernd | sofort | der Gambit trägt kein Wappen — vom Bauern nicht zu unterscheiden |

### Zähigkeit und Fläche — brauchen Lebenspunkte (verborgen bis zum Erwachen)

| # | Fähigkeit | Zeichen | Wer | Wie oft | Wirkung |
|---|---|---|---|---|---|
| 18 | Lebensraub `lifesteal` | ❦ | Attentäter (5), Schildträger (7), Magier (9), Hexerin (9), Alchemist (5), Warlock (3), Paladin (7), Inquisitor (7), Flaggenträger (9) | dauernd, I–III | heilt ¼ / ½ / ¾ des zugefügten Schadens |
| 19 | Regeneration `regen` | ✚ | König (5), Schildträger (5), Alchemist (3), Paladin (5), Barde (3), Flaggenträger (5), Kundschafter (3) | dauernd, I–III | 1 Leben je zweitem Zug / je Zug / 2 je Zug |
| 20 | Bollwerk `bulwark` | ⛨ | König (4), Kapitän (9), Schildträger (3), Alchemist (7), Paladin (3), Inquisitor (5), Barde (6), Techniker (5), Flaggenträger (3), Stratege (9), Kundschafter (9) | dauernd, I–II | 1 / 2 Schaden weniger je Treffer |
| 21 | Schockwelle `blast` | ✺ | Kapitän (6), Attentäter (9), Magier (7), Warlock (9), Inquisitor (9), Techniker (7) | 1× (bis II) | der erste Nahkampfschlag trifft auch alle Gegner ringsum |
| 22 | Kettenblitz `chain` | ↯ | — | 1× | **noch nicht gebaut** (`live: false`) — Schaden springt auf einen weiteren nahen Gegner |
| 23 | Enterhaken `pull` | ⇲ | — | 1× | **noch nicht gebaut** (`live: false`) — zieht einen Gegner in Sichtlinie heran |

### Die Fähigkeiten der Monster (nur Bestien; Besitzerentscheid v1.25.2)

| # | Fähigkeit | Zeichen | Art | Wie oft | Wirkung |
|---|---|---|---|---|---|
| 24 | Gift `gift` | ☣ | Zehrung | dauernd, I–III | ein Treffer vergiftet: 1/2/3 Leben je Zug, drei Runden |
| 25 | Blenden `blenden` | ◍ | Kontrolle | 1× (bis II), löst von selbst aus | Gegner im Umkreis verlieren die Sicht |
| 26 | Aderlass `aderlass` | 🜄 | Zehrung | dauernd, I–II | jeder Treffer nimmt 1/2 Höchstleben |
| 27 | Schrecken `schrecken` | ◬ | Kontrolle | dauernd, I–II | das verlassene Feld bleibt eine/zwei Runden zu |
| 28 | Wegelagerei `wegelagerei` | ⛃ | Beute | dauernd, I–III | 2/4/6 Gold je Treffer |
| 29 | Steinhaut `steinhaut` | ⬢ | Zähigkeit | dauernd, I–II | die ersten ein/zwei Treffer prallen ab |
| 30 | Widerhall `widerhall` | ↺ | Zähigkeit | dauernd, I–II | ein Viertel / die Hälfte des Schadens kommt zurück |
| 31 | Unsterblich `unsterblich` | ✦ | Zähigkeit | dauernd, I–II | steht einmal je Partie wieder auf, mit ¼ / ½ Leben |
| 32 | Geistwandel `geistwandel` | ☁ | Zähigkeit | 1× | fällt das Monster, kehrt es als Geist zurück |

Von den 25 Bestien tragen alle eine Auswahl aus diesen neun (`bosses.js`);
Schrecken und Widerhall sind fast überall dabei, Geistwandel nur einmal.

## 2. Was auffällt — die Lücken

Gezählt, nicht geschätzt:

1. **Die 27 Helden teilen sich sechs Fähigkeiten.** Alle 18 Helden ohne
   Schachgangart bauen ihre Leiter aus derselben Handvoll: Blinzeln (16
   Träger), Scharfschuss (13), Bollwerk (11), Lebensraub (9), Regeneration
   (7), Schockwelle (6). Ein Barde, ein Alchemist und ein Flaggenträger
   unterscheiden sich damit nur in der Reihenfolge — genau das „wenig
   Varianz", das der Besitzer meint.
2. **Rückzug (`pawn_backstep`) trägt niemand.** Die Fähigkeit existiert,
   hat Stufen und ein Zugbild, steht aber in keiner Leiter.
3. **Kettenblitz und Enterhaken sind Attrappen** (`live: false`): sie stehen
   im Katalog, damit Akademie und Karte einen Text haben, wirken aber nicht.
   Wer sie sieht, erwartet etwas.
4. **Keine einzige Held-Fähigkeit ist an die Figur gebunden.** Ausnahmen sind
   nur die Schachfiguren (Springer, Läufer, Turm, Dame, König, Bauer) und
   Gambit/Drache. Ein Barde singt nicht, ein Techniker baut nicht, ein
   Stratege plant nicht — ihre Namen versprechen etwas, das die Leiter nicht
   einlöst.
5. **Die Monster haben es besser:** neun eigene Fähigkeiten mit eigener
   Sprache (Zehrung, Beute, Schrecken). Dasselbe Prinzip fehlt den Helden.

## 3. Zugbilder gegen den Kern — gemessen, nicht gelesen

Die Prüfung ist seit v1.89.1 die 28. Suite der Kette: `test_zugbilder.mjs`
(43 Prüfungen). Sie stellt jede Figur auf d4 eines 8×8-Bretts, einmal auf
leerem Brett und einmal von acht Gegnern umringt, im Gefecht und im reinen
Schach, in Stufe I bis III, und legt die Züge des Kerns (`rules/moves.js`)
Feld für Feld gegen das Zugbild (`ABILITY_MOVE`, seit v1.89.1 in
`src/content/zugbilder.js`, vorher unexportiert in `ArmyScreen.jsx`).
Zusätzlich hat ein Kundschafter die Raster am lebenden DOM vermessen
(Zellen 18,7–19,3 px, Raster 150/154 px; Hofstaat-Leiter und Chronik).

### 3.1 Die 13 Zugbilder stimmen — für Stufe I

| Fähigkeit | Zugbild | Kern Stufe I | Befund |
|---|---|---|---|
| Weitsprung `knight_longleap` | 8 Felder (±1,±3 / ±3,±1) | dieselben 8 | gleich |
| Vorreiter `knight_outrider` | ±2,±2 | dieselben 4 | gleich; das Symbol steht in der Familie „Schritt" (grün), obwohl es ein Sprung ist |
| Phase `bishop_hop` | ±2,±2 | dieselben 4 | gleich, aber **nur über eine besetzte Nachbarfigur** (leer: 0 Züge, umringt: 4) |
| Wachschritt `bishop_ortho_step` | ±1,0 / 0,±1 | dieselben 4 | gleich |
| Sturmschritt `rook_diag_step` | ±1,±1 | dieselben 4 | gleich |
| Durchbruch `rook_breach` | ±2,0 / 0,±2 | dieselben 4 | gleich, aber **nur über eine besetzte Nachbarfigur** |
| Hofsprung `queen_knightleap` | 8 Springerfelder | dieselben 8 | gleich |
| Königsflucht `king_dash` | ±2,0 / 0,±2 | dieselben 4 | gleich, aber **nur bei freiem Zwischenfeld** (leer: 4, umringt: 0) |
| Ausweichen `pawn_sidestep` | ±1,0 | dieselben 2 | gleich |
| Stoßschlag `pawn_forward_capture` | 0,1 | 0,1 | gleich, aber das Feld ist der **Grundschritt** — die Fähigkeit macht daraus einen Schlag (leer: 0, Gegner davor: 1) |
| Sturmlauf `pawn_charge` | 0,2 | 0,2 | gleich für Stufe I; **Stufe II ergänzt 0,3, Stufe III 0,4**; der Weg muss frei sein, es wird nie geschlagen; von der Grundreihe zählt +2 als Doppelschritt |
| Rückzug `pawn_backstep` | 0,−1 | 0,−1 | gleich — trägt aber niemand |
| Fliegen `dragon_flight` | 24 Felder Umkreis 2 | Reichweite 2 | gleich für Stufe I; **Stufe II Reichweite 3, Stufe III Reichweite 4** (auf 10×10 gemessen: 24 / 48 / 79 Ankerziele) |

Ohne Zugbild, mit Absicht: **Blinzeln** (24 leere Felder im Umkreis 2 —
ein Umkreis, kein Muster; 16 Figuren tragen es) und **Scharfschuss**
(Distanz 2–3 in Sichtlinie, die Figur bleibt stehen — kein Zug). Beide
werden im Kern trotzdem geprüft.

### 3.2 Was die Prüfung gefunden hat

1. **Der Scharfschuss der Sonderfiguren feuerte nie** (behoben in v1.89.1).
   Zehn Helden mit eigener Gangart (`moveSpec`: Kapitän, Attentäter, Magier,
   Hexerin, Vesna, Alchemist, Warlock, Inquisitor, Techniker, Stratege)
   tragen `ranged_shot` auf der Leiter. `moves.js` kehrte für Figuren mit
   `moveSpec` früh zurück, bevor der Schuss-Block erreicht war; ein Notnagel
   aus v0.38 hatte nur das Blinzeln in diesen Block kopiert. Messung:
   Kapitän mit Gegner auf Distanz 2 → 0 Schüsse; derselbe Kapitän ohne
   `moveSpec`-Feld → 1 Schuss. Keine bestehende Suite fing das, weil alle
   Schuss-Proben mit Bauer, Läufer oder Turm arbeiteten. Seit dem Fix
   prüft Abschnitt 5 der Suite alle 22 Paare Figur/Fähigkeit.
   **Folge für die Balance:** diese zehn Figuren sind im Gefecht erstmals
   so stark, wie ihre Leiter verspricht — Kampagne, Schnelles Spiel und
   Online-Duell (Worker und App teilen den Kern; beide Seiten müssen
   dieselbe Fassung fahren). Kein Boss trägt den Schuss.
2. **Die Legende log** (behoben in v1.89.1). „Grün: neue Felder durch diese
   Fähigkeit" stimmte bei Phase, Durchbruch, Königsflucht, Stoßschlag,
   Sturmlauf und Fliegen nicht — die grünen Felder sind auf leerem Brett
   längst Gleit- oder Grundschritt-Felder, und der Kern erlaubt sie nur
   unter Bedingungen, die kein Bild zeigen kann. Diese sechs tragen jetzt
   einen `hinweis` unter dem Raster (Hofstaat-Leiter und Chronik), und die
   Suite verlangt ihn.
3. **Nur festgehalten, nicht geändert** (Besitzerentscheid):
   - Das Grundraster des Bauern zeigt nur den Schritt 0,1 — weder
     Doppelschritt noch Schrägschlag (`specForKind` in `ArmyScreen.jsx`,
     Fall „P"). In der Chronik übermalt der Stoßschlag das Feld 0,1 rot,
     weil das zuletzt eingetragene Talent gewinnt.
   - Blinzeln könnte ein Zugbild bekommen (24 Felder). Nebenwirkung: die
     Grundraster von 16 Figuren würden in der Chronik violett übermalt —
     nur mit Filter in der Talente-Schleife sinnvoll, Bilder vorher zeigen.
   - `knight_outrider` steht in der Zeichen-Familie „Schritt" statt
     „Sprung"; `dragon_flight` hat den Tag `wing`, der in `TAGS` fehlt; die
     neun Monster-Fähigkeiten haben kein Zeichen in `AbilityIcons.jsx`
     (zeigen „?"); Unsterblich und Hofsprung teilen das Text-Glyph ✦.

## 4. Ideen für neue Fähigkeiten

Regeln, die alle Vorschläge einhalten: keine Figur bekommt starke Fähigkeiten
dauerhaft (Besitzer, v1.28.0); jede Held-Fähigkeit gehört zur Figur, nicht
zum Pool; was am Brett sichtbar ist (Gangarten), bekommt ein Zugbild; was
Lebenspunkte braucht, bleibt bis zum Erwachen verborgen. Aufwand: **S** =
nur Zugregel in `moves.js` + Zugbild, **M** = Kampfwirkung in
`sim/transitions.js`, **L** = neuer Zustand am Brett (wie Sperren/Fallen).

### Gangarten — sichtbar, prüfbar, auch im reinen Schach

| Fähigkeit | Wer | Wie oft | Wirkung | Aufwand |
|---|---|---|---|---|
| **Flankengang** | Kapitän | 1× (bis II) | zieht einmal wie ein Läufer über die ganze Diagonale — der Segler kreuzt | S |
| **Kanzlerwende** | Kanzler | 1× | tauscht den Platz mit einem eigenen Turm oder einer eigenen Figur in gerader Sichtlinie | S |
| **Amazonensturm** | Amazone | 1× | ein Springersprung mit anschließendem Damenzug in derselben Runde (zwei Züge, ein Schlag) | M |
| **Bischofsweg** | Erzbischof | dauernd | darf auf der Diagonale eine eigene Figur überspringen (nicht schlagen) | S |
| **Schildwall** | Schildträger | dauernd | angrenzende eigene Figuren dürfen nicht aus der Ferne getroffen werden (Scharfschuss prallt ab) | M |
| **Vorhut** | Kundschafter | dauernd | zieht wie ein Springer PLUS ein Feld gerade — und darf als einzige Figur rückwärts über die eigene Reihe hinaus | S |
| **Rückzug** | Bauer/Gambit | 1× | existiert schon — in die Leiter des Bauern setzen (Stufe 4 oder 7) | S |
| **Seitenwechsel** | Turm/Kanzler | 1× | Rochade mit jeder eigenen Figur auf der Grundreihe, nicht nur mit dem König | S |

### Fernkampf und Kontrolle — brauchen Lebenspunkte

| Fähigkeit | Wer | Wie oft | Wirkung | Aufwand |
|---|---|---|---|---|
| **Feuerball** | Magier | 1× (bis II) | trifft ein Feld in Sichtlinie und alle vier Nachbarn gerade davon — Fläche aus der Ferne | M |
| **Fluch** | Hexerin | 1× | eine Gegnerfigur verliert für drei Runden ihre Fähigkeiten (Zauber schweigen) | M |
| **Bannspruch** | Inquisitor | 1× | ein Monster im Umkreis von zwei Feldern darf eine Runde nicht ziehen | M |
| **Enterkommando** | Kapitän | 1× | ersetzt den Enterhaken: zieht einen Gegner in gerader Sichtlinie ein Feld heran und schlägt ihn, wenn er dann angrenzt | M |
| **Kettenblitz** | Warlock | 1× | den vorhandenen Eintrag endlich bauen: Schaden springt auf den nächsten Gegner im Umkreis, halbiert | M |
| **Hinterhalt** | Attentäter | 1× | ein Schlag aus der Deckung (angrenzend an eine eigene Figur) zählt doppelt | M |
| **Spähblick** | Späher/Seherin | dauernd | zeigt die Fähigkeiten und den nächsten Zug der Gegnerfigur, die man antippt (Information statt Schaden) | S (nur UI) |

### Zähigkeit, Beute, Lieder — Figuren mit eigener Sprache

| Fähigkeit | Wer | Wie oft | Wirkung | Aufwand |
|---|---|---|---|---|
| **Marschlied** | Barde | dauernd, I–II | eigene Figuren im Umkreis von einem/zwei Feldern heilen 1 Leben je Zug | M |
| **Standarte** | Flaggenträger | dauernd | angrenzende eigene Figuren nehmen 1 Schaden weniger — Bollwerk für die Nachbarn statt für sich | M |
| **Elixier** | Alchemist | 1× (bis II) | heilt eine angrenzende eigene Figur voll; auf Stufe II auch sich selbst | M |
| **Schanze** | Techniker | 1× | setzt eine Sperre (aus `core/rules/sperren.js`) auf ein angrenzendes leeres Feld — ohne Händler | L (Sperren gibt es schon) |
| **Fallensteller** | Techniker | 1× | stellt eine Spitzgrube oder Bärenfalle aus dem Vorrat des Händlers, ohne Zug zu verlieren | L |
| **Segen** | Paladin | 1× | eine angrenzende eigene Figur bekommt Bollwerk I für drei Runden | M |
| **Kriegsplan** | Stratege | 1× | zwei eigene Figuren tauschen die Plätze (nicht der König) | S |
| **Opfergabe** | Warlock | 1× | opfert eine eigene angrenzende Figur und heilt sich um deren Leben | M |
| **Beutezug** | Kapitän/Attentäter | dauernd | wie Wegelagerei, aber für Helden: 1 Gold je Schlag — Gold gibt es bisher nur vom Händler-Sieg | M |

### Für Monster, damit die Nächte gruseliger werden

| Fähigkeit | Wirkung | Aufwand |
|---|---|---|
| **Brut** | fällt das Monster, erscheint auf seinem Feld ein Bauer der Gegnerseite | M |
| **Schatten** | das Monster ist unsichtbar, bis es angrenzt (gab es als Schatten-Mechanik: `schattenVerbirgt`) — als Fähigkeit statt als Sonderfall | S |
| **Hunger** | jede Runde ohne Schlag verliert das Monster 1 Leben — es MUSS jagen | M |

**Empfehlung für den Einstieg:** die drei Gangarten Flankengang, Kanzlerwende
und Kriegsplan (alle S, alle mit Zugbild, alle im reinen Schach spielbar),
den Rückzug in die Bauernleiter, und Marschlied + Standarte als erste
Figur-gebundene Zähigkeit — damit unterscheiden sich Barde und Flaggenträger
zum ersten Mal von allen anderen. Kettenblitz und Enterhaken entweder bauen
oder aus dem Katalog nehmen; als Attrappen schaden sie.
