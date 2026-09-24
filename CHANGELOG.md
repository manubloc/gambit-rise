# Changelog - Gambit Rise

## 1.53.0 - die Landingpage zeigt das echte Spiel
- DER GEWAEHLTE PLATZ IM AUFSTELLUNGSRASTER leuchtet golden wie die gewaehlte
  Karte darunter, statt vollflaechig gelb zu sein (Besitzer: "stell gerne auf
  das neue Design um").
- LANDINGPAGE (Besitzer: "die Karten eins zu eins, wie sie im Hofstaat oder
  in der Aufstellung sind, mit grauem Sockel ... mit dem Hintergrund der
  jeweiligen Figur mit dieser Faerbung"): alle Figurenbilder sind jetzt
  ECHTE AUFNAHMEN AUS DEM SPIEL, gemacht vor dem Erwachen der Lebenspunkte
  (grauer Sockel, keine Werte):
    * sechs Hofstaat-Kacheln: Koenig, Dame, Gambit, Amazone, Waechter,
      Brutmutter - mit Kulisse, Farbschleier und Stufenabzeichen
    * vier Aufstellungskarten mit Zugbild und Faehigkeiten: Springer,
      Laeufer, Amazone, Magier. Sie ersetzen die handgebauten Zugbilder der
      alten Chronik-Blaetter, die teils versetzt waren.
- NEU: "Stell dein eigenes Heer auf" - ein Gefecht mit gemischter Aufstellung
  (Kapitaen, Spaeher, Magier, Dame, Koenig, Paladin, Waechter, Turm) auf dem
  Brett von Kapitel I.
- NEU: unter der Weltkarte die Karte eines Kapitels mit ihren Stationen.
- Veraltete Saetze gerichtet: "kein Download, der erste Zug ist einen
  Fingertipp entfernt" und "Zum Startbildschirm hinzufuegen" - das Spiel
  kommt ueber den Play Store.

## 1.52.0 - eine Aufstellung fuer beide Regelwerke
- Besitzer: "Aufstellung ueber diesem Hin- und Herschalter Schach und HP-
  Gefecht weglassen. Ausserdem braucht man den Unterschied zwischen HP-
  Gefecht und Schach nicht. ... die Flaeche nutzen, dass du es noch nach oben
  ruecken kannst, und die Figuren unten zum seitlichen Durchwischen ein
  bisschen groesser."
- EINE AUFSTELLUNG JE BRETT: formationKey ist fuer beide Regelwerke der
  Kartenname. Alte Schach-Plaene unter "<karte>#chess" liest
  gespeicherteAufstellung weiter, solange es keinen gemeinsamen gibt - niemand
  verliert seinen Plan (eigene Probe).
- Ueberschrift "Aufstellung" und der Schalter Schach/HP-Gefecht sind fort;
  der Reiter oben sagt schon "Aufstellung". Brett und Karten ruecken nach oben.
- Die Karten sind groesser (146-184 px statt 124-156), das Zugbild waechst
  mit - jetzt stehen zwei Karten ganz nebeneinander.

## 1.51.0 - die Aufstellung traegt die Karten des Hofstaats
- Besitzer: "nimm einfach die Karten, die wir jetzt unter den Figuren im
  Hofstaat haben, mit dem Hintergrund, mit komplett diesen Designs, aber
  unten drunter diese Liste, wie die Zuege sind, und darunter noch die
  Faehigkeiten ... die Karte muss halt einfach laenglicher werden."
- DIE KACHEL IST EIN BAUTEIL: bis hierher lebte sie als inneres Teil des
  Hofstaats. Jetzt steht sie als HofKachel auf Modulebene, und Hofstaat UND
  Aufstellung rufen DIESELBE auf - Kulisse, Farbschleier, Eckverzierung,
  Stufenabzeichen, Lebensrohr. Nichts nachgebaut; die Vermessung der
  Hofstaat-Kacheln (messe_kulissen) ist unveraendert gruen.
- Zwei neue Angaben: `unten` (in der Aufstellung: Zugbild und Faehigkeiten
  aus der Leiter, hoechstens vier Zeichen, darueber "+N") und `gewaehlt`.
- AUSWAHL: im Hofstaat tragen alle eigenen Karten den Goldrand - in der
  Aufstellung leuchtet NUR die gewaehlte golden, die uebrigen tragen den
  violetten Rand. Die alte vollflaechig gelbe Karte ist fort.
- Auch die Werte der Kachel (kachelWerteFuer) stehen auf Modulebene, damit
  beide Stellen dieselben Zahlen zeigen wie das Gefecht.
- Im Browser geprueft.

## 1.50.0 - fremde Monster zeigen ihre Leiter
- Offener Besitzerpunkt "schreibgeschuetzte Leiter bei fremden Monstern":
  ein Monster, das einem nicht gehoert, zeigte seit v1.26.7 nur seine Buehne -
  wer wissen wollte, was es lernen kann, sah nichts.
- Der Aufstiegsplan - dasselbe Bauteil fuer Figuren und Monster - kennt jetzt
  einen Nur-Lesen-Modus: ALLE Sprossen sichtbar, auch die sonst verhuellten,
  aber kein Erlernen, kein Aufstufen, kein Vergessen. Eine Zeile sagt warum:
  "Was es lernen kann - erst, wenn es dir dient."
- Im Browser geprueft am Waechter: Steinhaut, Schrecken, Widerhall stehen da,
  kein Erlernen-Knopf.

## 1.49.0 - das Stationsfenster ist dunkel
- Offener Besitzerpunkt "dunkles Stationsfenster": das Fenster einer Station
  auf der Kapitelkarte war helles Pergament - das einzige helle Blatt in
  einem sonst dunklen Spiel. Jetzt dieselbe Nachtglas-Sprache wie Kampfleiste,
  Figurenblatt und Tafeln: fast schwarzer, durchscheinender Grund, zarte
  Goldkontur, helle Schrift, dunkle Chips (XP gruen, Gold bleibt golden).
- Der Hauptknopf traegt das kraeftige Gold der uebrigen Hauptknoepfe; das
  matte, halbdurchsichtige Gold war fuers Pergament gedacht.
- GEFUNDEN beim Umfaerben: geschaffte und gesperrte Stationen hatten einen
  hellen Pergamentknopf (#dcd3ba) - mit der neuen hellen Schrift waere er
  unlesbar geworden. Jetzt ein stiller dunkler Knopf.
- Die Figurenkunst im Fenster bleibt unveraendert. Im Browser geprueft.

## 1.48.0 - die vierte Stufe: sehr schwer
- Offener Besitzerwunsch: eine vierte Schwierigkeit "sehr schwer".
  Eine Suchtiefe mehr als "schwer" (3 statt 2) und hoeher gestufte Figuren
  (Bauer 7, Offiziere 6, Koenig 3, Erzbischof und Kanzler 5).
- GEMESSEN vor dem Einbau: Tiefe 3 braucht auf der Sandbox im Schnitt
  ~200 ms je Zug, hoechstens ~0,4 s (Schach; HP-Gefecht deutlich weniger).
  Auf dem Handy rund eine Sekunde - man sieht die KI nachdenken, fuer diese
  Stufe passt das.
- Angeboten im Schnellspiel und im Einrichtungsschirm; zahlt 15 Gold (schwer
  11); KI-Aufschlag 3. Die Kampagne bleibt bei ihren drei Stufen.

## 1.47.0 - die Schranke: gratis bis Kapitel III
- Besitzerentscheid 22.9.: "gratis bis Kapitel III". Und 23.9.: zwei
  Fassungen im Play Store - kostenlos bis Kapitel III, daneben die Vollfassung.
- src/meta/schranke.js haelt die Grenze an EINER Stelle (GRATIS_BIS_LIGA = 3)
  und liest allein profile.voll. WIE ein Stand zur Vollfassung wird (Bezahl-
  App mit eigener Paketkennung oder Kauf in der App), entscheidet der Kern
  nicht - so bleibt er frei von Store-Wissen.
- advanceLeague haelt nach dem Finale von Kapitel III an: der Stand bleibt
  unveraendert, das Finale bleibt geschafft, man steht nur vor dem Tor.
- Statt des Torknopfes steht dann eine Tafel: "Kapitel IV braucht die
  Vollversion" - ein Knopf, der nichts tut, waere die schlechteste Antwort.
- Der Gast bleibt unberuehrt, er hat seine eigene, engere Grenze.
- Eine alte Probe (Kapitel XI nach XII) prueft die Kampagne, nicht die
  Schranke - sie traegt jetzt die Vollfassung.

## 1.46.0 - der Gastzugang, eingefroren
- Besitzerentscheid 23.9.: "Machen wir es mit Gastzugang, aber der sollte
  einen gefreezten Stand haben ohne Online und lokale Spiele. Einfach
  Kapitel 1 mit 3 extra Figuren und 4 spielbaren Leveln."
  ANLASS: Google lehnt Anmeldedaten ab, mit denen Pruefer sich erst ein Konto
  anlegen muessten - "Pruefer koennen keine Konten erstellen". Mit dem
  Gastweg braucht die Pruefung weder Konto noch Passwort.
- src/meta/gast.js haelt den Schaustand an EINER Stelle: Kapitel I, die vier
  Stationen L01s00/s01/s03/s04, die drei Sonderfiguren Spaeher, Kapitaen und
  Magier, 6 Siegelpunkte. Die hintere Reihe steht dem Gast sofort offen -
  ohne sie koennte er seine drei Figuren gar nicht aufstellen.
- Die uebrigen Stationen bleiben SICHTBAR und verschlossen: man sieht, dass
  es weitergeht, und weiss, wofuer sich ein Konto lohnt.
- Schnelles Spiel und Online-Duell fehlen dem Gast ganz (beides haengt am
  Konto). Der Anmeldeschirm bietet "Als Gast spielen" an und sagt in einem
  Satz, was fehlt: kein Online, und der Fortschritt bleibt nicht.
- EINGEFROREN: loginGuest raeumte schon bisher den alten Gast-Stand ab; jeder
  Einstieg beginnt also wieder hier.
- GEFUNDEN: loginGuest gab es laengst im Kern, aber KEIN Knopf rief es auf -
  der Weg lag brach.

## 1.45.0 - ein Symbol fuer alles
- Besitzer: "verwende bitte dieses Icon fuer alles, wo man eins braucht ...
  in der App kannst du das runde mit goldenem Rand lassen, aber als Favicon
  und als App-Symbol im Play Store ueberall dieses Symbol."
  Aus dem gelieferten Bild (512x512, die Gestalt vor dem lila Riss) ist der
  ganze Satz gebaut - in ZWEI Fassungen, weil Android und der Play Store
  eine eigene Maske darueberlegen:
    * GERUNDET (wie geliefert, auf schwarzem Grund): favicon.ico (16/32/48),
      favicon.svg, favicon-16/-32, suche-48/-96/-144/-192, icon-192,
      icon-512, apple-touch-icon.
    * RANDLOS (Bild 1,16x vergroessert und beschnitten, damit die Ecken
      gefuellt sind und die Gestalt in der sicheren Mitte bleibt):
      maskable-512 und design/playstore-icon-512.png fuer den Store.
  Das Original liegt in archiv/bilder/app-symbol-512.png.
- Der runde Goldring bleibt IM Spiel (Ladeschirm, boot-riss) - so gewuenscht.

## 1.44.0 - das Spiel heisst ueberall Gambit Rise
- Besitzer: "das Spiel muss in Metatexten etc. ueberall Gambit Rise heissen,
  nur die Figur selbst im Spiel ist DER GAMBIT."
  Umgestellt, wo der SPIELNAME steht: Titel und Beschreibung, Schluesselwoerter,
  Open Graph und Twitter, Manifest (name und short_name), die Landingpage
  samt Fusszeile und Datenschutzkasten, Nutzungsbedingungen und
  Datenschutzerklaerung (beide Sprachen), die Store-Unterlagen, README und
  CLAUDE.md sowie die Stellen in der App, die vom Spiel sprechen
  ("Willkommen bei Gambit Rise", "startet wie eine echte App", der Hinweis
  auf eine ungueltige Sicherung).
- UNANGETASTET bleibt die FIGUR: sie heisst weiter "der Gambit" - in der
  Chronik, in den Lehrtexten, auf der Landingpage und ueberall im Spiel.
- robots.txt sperrt /spielen/ fuer Suchmaschinen (die Seite hat einen Riegel
  und der Weg ins Spiel fuehrt ueber den Play Store); die Sitemap fuehrt
  Startseite, Nutzungsbedingungen und Datenschutz.

## 1.43.0 - die Wortmarke GAMBIT Rise
- Besitzer: "das Gambit die Buchstaben naeher zusammen, das Rise in dem
  leuchtenden Lila, groesser, wie ein Logo, schon unter Gambit, darf minimal
  von unten drueberlappen; das Gambit etwas mehr glaenzen und erhaben; das
  Rise von sehr hell leuchtend lila bis fast dunkel - und beim Ladescreen
  gezeichnet, als waere es Handschrift."
  Ein SVG (src/app/ui/WortmarkeRise.jsx) traegt beides:
    * GAMBIT in Cinzel, eng gesperrt (2 px statt .13em), Goldverlauf, darueber
      ein Glanzstreifen und darunter eine dunkle Fusslinie - das gibt die
      erhabene, gepraegte Wirkung.
    * Rise in Cormorant kursiv, deutlich groesser, Verlauf von sehr hellem
      Lila ueber Violett bis fast Schwarz, mit lila Schein DAHINTER (ein
      erster Anlauf legte den Schein darueber und wusch den Verlauf aus).
      Es sitzt unter dem Wort und ragt mit den Oberlaengen hinein.
  ZEICHNEN auf beiden Ladeschirmen: eine Linie faehrt die Buchstaben ab,
  danach laeuft die Fuellung nach.
- Dieselbe Marke an drei Stellen: Anmeldeschirm, Vorlader und der feste
  Ladeschirm in index.html (der laedt Cinzel und Cormorant jetzt selbst).
  Eine Probe haelt die drei zusammen, damit keine ausschert.

## 1.42.0 - Gambit Rise, und die Seite bekommt ein Schaufenster
- DER ERSTE SCHIRM SAGT "GAMBIT Rise" (Besitzer: "gerne das Rise in einer
  anderen Schrift, dass es mehr nach einem Logo aussieht"): GAMBIT in der
  Wortmarkenschrift, Rise daneben in der Erzaehlschrift, kursiv und kleiner -
  derselbe Goldverlauf traegt beide, damit es EIN Zeichen bleibt.
- DIE SEITE IST UMGEBAUT (Besitzer: "spaeter nur noch ueber den Play Store,
  das Browsergame verstecken wir erstmal, evtl. mit Passwort"):
    * /          das Schaufenster (Landingpage) mit Verweis auf den Play Store
    * /spielen/  die App, hinter einem Riegel (Passwort, per GAMBIT_ZUGANG
                 beim Bau setzbar; Vorgabe rise2026)
    * /landing   bleibt als alte Adresse bestehen
  Umgezogen statt umgeschrieben: der Build nutzt relative Pfade, deshalb
  laeuft die App in jedem Ordner, solange sie vollstaendig dort liegt - und
  ihr Dienstarbeiter bekommt damit den Bereich /spielen/ und kann dem
  Schaufenster nicht mehr dazwischenfunken. An der Wurzel liegt ein sw.js,
  das den ALTEN Dienstarbeiter abmeldet und seine Zwischenspeicher raeumt.
  DER RIEGEL IST KEIN SCHLOSS: wer die Seite liest, kommt daran vorbei. Er
  haelt Neugierige ab, mehr soll er nicht.
- GEFUNDEN: die App ist im Play Store NOCH NICHT veroeffentlicht (die
  Store-Adresse gibt es nicht). Damit ist die Paketkennung NICHT festgelegt -
  sie heisst jetzt com.gambitrise.app statt win.grandgambit.app. TWA-Vorlage
  und assetlinks.json sind darauf umgestellt; die Fingerabdruecke kommen mit
  dem ersten Build.
- npm run build baut jetzt Schaufenster + App; npm run build:app ist der
  reine App-Bau fuer Proben und Fahrproben.

## 1.41.0 - der Umzug auf gambitrise.com
- In Cloudflare eingerichtet (ueber den Browser, mit Freigabe des Besitzers):
    * gambitrise.com haengt als eigene Domain am Pages-Projekt - Status aktiv,
      Zertifikat ausgestellt.
    * Der Worker gg-hall hat die Adresse duell.gambitrise.com; die alte
      duell.grandgambit.win bleibt vorerst DANEBEN bestehen.
  Beide Domains zeigen also auf dieselbe Seite und denselben Spielserver -
  der Umzug faellt fuer niemanden aus.
- Im Code umgestellt: 42 Stellen in 22 Dateien (tools/domain-umstellen.mjs),
  darunter canonical, Open Graph, Manifest, Landingpage, Rechtstexte, TWA,
  der Worker und SERVER_URL (wss://duell.gambitrise.com/ws).

## 1.40.0
- DIE FELDER TRAGEN WIEDER IHREN EIGENRAND (Besitzer: "die Schachfelder haben
  doch ganz sanfte Rundungen - hast du die weggeschnitten? das waere
  unschoen"). JA, und das war falsch: v1.39.1 hatte den gemalten Rand
  abgeschnitten, den der Besitzer in v0.71.4 ausdruecklich behalten wollte.
  DIE ECHTE URSACHE: jede Zelle skaliert ihre Kachel auf Zellenbreite - bei
  Kapitel I ist die Haelfte quadratisch (640x640) und passt, bei allen anderen
  ist sie 640x720 und wurde oben und unten beschnitten: Rand und Rundung
  fielen weg. Jetzt wird NICHTS geschnitten, jede Haelfte nur auf 640x640
  gestaucht (8-11 %, im Stein unsichtbar) - Fuge, Eigenrand und Rundung
  bleiben vollstaendig, in allen 16 Streifen.
- DIE ZUGMELDUNG STEHT OBEN IN DER MITTE, zwischen Zurueck und Aufgeben
  (Besitzer). Unter dem Brett ist sie fort - sie stand dort doppelt so weit
  vom Blick entfernt. Sie verdraengt den Hinweis auf Gegner und Schwierigkeit,
  solange sie etwas zu sagen hat.
- DER HOFWERT OHNE KNOPFKLEID (Besitzer: "ohne diese Button-Geschichte und
  minimal noch naeher ans Schachfeld"): nur die Zahl mit ihrem Woertchen,
  frei auf dem Grund, mit Schatten fuer die Lesbarkeit; die Leiste rueckt
  naeher ans Brett (minHeight 26 -> 20, Abstand -6 -> -10).
- GLEICHE BRETTHOEHE IN ALLEN KAPITELN (Besitzer: "bei Kapitel 1 und 2 sollte
  das Schachbrett auf der gleichen Hoehe sein wie in den anderen"): im reinen
  Schach stand der Brettblock in einem eigenen, mittig setzenden Rahmen und
  rutschte dadurch nach unten (gemessen: Oberkante 259 px statt 154 px). Ein
  Aufbau fuer beide Regeln. Dazu laeuft die Kampfleiste jetzt IMMER - im
  Schach zeigt sie Rochade und En passant.
- ALLES HEISST JETZT GAMBIT (Besitzer: "wir nennen ihn nur noch Gambit,
  ueberall - das Spiel selbst und auch die Inhalte"). 177 Stellen in 68
  Dateien: Wortmarke, Titel, Manifest, Landingpage, Rechtstexte, Lehrtexte,
  Geschichten, Serverantworten - und die Heldenfigur selbst (Besitzerentscheid
  23.9.: Spiel und Figur heissen gleich). CHANGELOG und die Entwuerfe unter
  design/ bleiben unangetastet: sie sind die Geschichte des Projekts, und eine
  nachtraeglich umgeschriebene Geschichte hilft niemandem.
- DER UMZUG AUF gambitrise.com ist vorbereitet, aber noch NICHT vollzogen:
  tools/domain-umstellen.mjs stellt alle 42 Stellen in 22 Dateien in einem Zug
  um (Trockenlauf ohne --machen). Er darf erst laufen, wenn die Pages-Domain
  und die Worker-Route duell.gambitrise.com in Cloudflare stehen - sonst
  liefe das Online-Duell ins Leere. Plan: design/UMBENENNUNG-GAMBIT.md.


## 1.39.2
- BERICHTIGT (Besitzer: "die Schachfelder hatten doch ganz sanfte Rundungen -
  hast du die weggeschnitten? das waere unschoen"). Ja, und das war falsch:
  v0.71.4 haelt ausdruecklich fest, dass jedes Feld die GANZE Kachel samt
  ihrem Eigenrand zeigt. v1.39.1 hatte den Rand freigeschnitten.
  DIE ECHTE URSACHE des schiefen Eindrucks: die Haelften der Streifen waren
  640x720 statt quadratisch. Das Brett legt die Kachel auf ein quadratisches
  Feld - oben und unten fielen je ~6 % weg, also genau die runden Ecken dort,
  waehrend die seitlichen blieben. Jetzt sind alle 16 Streifen aus den
  Originalen neu gebaut: die GANZE Haelfte quadratisch eingepasst (12,5 %
  Stauchung in der Hoehe, bei Stein unsichtbar) - Rand und alle vier
  Rundungen vollstaendig, in jedem Kapitel gleich.
- Offene Punkte stehen ab jetzt gesammelt in design/OFFENE-PUNKTE.md.

## 1.39.1
- DIE SCHACHFELDER SEHEN IN JEDEM KAPITEL AUS WIE IN KAPITEL I (Besitzer:
  "die Schachfelder sind irgendwie so ein bisschen verrueckt ... ich habe das
  Gefuehl, du hast die in den anderen Kapiteln nicht so sauber zugeschnitten
  wie im ersten"). GEFUNDEN: jedes Kapitel hat EIN Streifenbild - links das
  helle Feld, rechts das dunkle -, aus dem sich jede Zelle per Hash ein
  Fenster schneidet. Die Streifen zeigten aber GEMALTE KACHELN MIT RAHMEN und
  abgerundeten Ecken, und nur Kapitel I hatte quadratische Haelften (1280x640,
  alle anderen 1280x720). Traf ein Fenster den Rahmen, sass ein dunkler Balken
  mitten im Feld.
  Alle 16 Streifen (12 Kapitel, 3 klassische, das Finale) sind jetzt
  freigeschnitten: der Rahmen ist weg, aus jeder Haelfte das groesste
  QUADRAT aus der Mitte (kein Verzerren), zusammengesetzt zu 1280x640 wie in
  Kapitel I. Die Originale liegen in archiv/bilder/felder-original/.
- Im Browser nachgesehen (Kapitel III): durchgehend ruhiger Stein, keine
  Rahmenstuecke mehr im Feld.

## 1.39.0
- DASSELBE LEISE KLEID FUER ALLES UM DAS BRETT (Besitzer: "wie du oben
  Zurueck und Aufgeben gemacht hast, von der Farbgebung super - alle anderen
  Sachen wie Hofwert oder Du bist am Zug genau gleich"): HOFWERT und die
  Zugmeldung tragen jetzt denselben fast durchsichtigen Grund, dieselbe zarte
  Kontur und dieselbe gedaempfte Schrift wie die beiden Knoepfe. SCHACH bleibt
  die Ausnahme und leuchtet weiter - die eine Meldung, die man nicht
  uebersehen darf.
- PLATZ FUER DEN HOFWERT DES GEGNERS (Besitzer: "der Hofwert wird von den
  Figuren verdeckt"): der Vorrat ueber dem Brett war 0,62 Zellen, die Koepfe
  der hinteren Reihe ragen aber fast eine ganze Zelle hinaus. Jetzt 1,0
  Zellen Vorrat und 0,8 Zellen Polster. Im Browser nachgemessen: die Plakette
  endet bei 69 px, die oberste Figur beginnt bei 82 px - sie steht frei.

## 1.38.0
- DIE FAEHIGKEITEN STEHEN NUR NOCH EINMAL (Besitzer: "die Faehigkeiten stehen
  doppelt - Pillen im Talentband und der Slider darunter; die Auswahl am
  Slider greift nicht sauber"). Die Pillen unter dem Brett sind fort; die
  Karten der Kampfleiste tragen alles. Bleibt eine Figur ohne Talente, steht
  dort weiter die Zeile, warum nichts da ist.
- UND DIE KARTEN SCHALTEN JETZT SELBST: ein Tipp auf einen Zauber der eigenen
  Figur am Zug schaltet ihn scharf UND erklaert ihn, ein zweiter entschaerft.
  Die scharfe Karte leuchtet violett - dieselbe Farbe, die das Brett fuer die
  Zauberfelder nimmt -, darunter steht "bereit - tippe ein ✦-Feld".
  GRUND fuers "greift nicht sauber": der Merker, WELCHER Zauber scharf ist,
  lag allein im Brett; die Leiste hatte gar keinen Rueckkanal. Er lebt jetzt
  im Gefechtsschirm, Brett und Leiste teilen ihn.
- Die Karten tragen die Fusszeile der Pillen (dauerhaft / antippen / bereit /
  eingesetzt) und den Satz "Das Buch ist geschlossen", wenn der eine Zauber
  der Partie verbraucht ist.
- DER SCHILD-CHIP IST FORT: die Schildsprossen sind laengst aus allen
  Aufstiegsplaenen entfernt - gemessen traegt keine Figur und kein Monster
  einen Schild, der Chip konnte also nie erscheinen.
- Im Browser nachgesehen: Laeufer gewaehlt, Karte "Phase" angetippt, sie
  leuchtet, die Beschreibung erscheint, der Hinweis steht unter der Reihe
  (er sass zuerst IN der scrollenden Reihe und wurde abgeschnitten).

## 1.37.0
- DIE DAUERFAEHIGKEITEN WACHSEN IN DER STAERKE (Besitzerliste):
    * LEBENSRAUB heilt ein Viertel des Schadens, auf II die Haelfte, auf III
      drei Viertel (vorher immer die Haelfte).
    * REGENERATION heilt 1 Leben je ZWEITEM eigenen Zug, auf II 1 je Zug, auf
      III 2 je Zug (vorher immer 1 je Zug). Der Takt haengt an der Figur.
    * BOLLWERK schluckt 1 Schaden, auf II 2 (zwei Stufen).
    * FRUEHE KROENUNG wandelt eine Reihe frueher um, auf II zwei.
  Stufe I ist damit schwaecher als das alte Pauschalmass, Stufe III staerker.
  Gemessen (npm run balance): alles im Rahmen - Paladin 56 %, Laeufer 58 %,
  Attentaeter 36 % bei doppelter Partiezahl; im Schnelllauf sah der Paladin
  mit 61 % aus wie ein Ausreisser, das war Streuung einzelner Keime.
- FLIEGEN IST EINE FAEHIGKEIT MIT STUFEN: die drei Sprossen des Drachen
  (Fliegen, +1 Feld, +1 Feld) sind zu einer geworden - zwei Felder, auf II
  drei, auf III vier. Wer die alten Sprossen gelernt hatte, bekommt die
  entsprechende STUFE gutgeschrieben (bezahlt bleibt bezahlt).
- DAUERFEUER IST GANZ FORT: seit v1.28.1 traegt es keine Figur mehr, im Kern,
  in der Liste der Faehigkeiten und in den Zeichen lag es noch herum.
- Scharfschuss hatte seine drei Stufen (1x, 2x, 3x je Partie) schon - der
  offene Punkt war bereits erledigt.

## 1.36.0 - Kampagnenumbau, Schritt C: die Lebenspunkte kommen frueh
- Besitzerentscheid 22.9. (loest v1.2.2 "ab 5" ab): "Wir hatten doch mal
  gesagt, dass man auch in der kostenlosen Version schon HP-Gefechte testen
  kann - ansonsten hat man ja gar keinen Mehrwert, die Figuren zu leveln."
  Gratis ist bis Kapitel III.
    * KAPITEL I bleibt reines Schach - alles dreht sich um die Figuren.
    * KAPITEL II: die alte Magie erwacht frueh im Hauptstrang (L02s07,
      Reihe 3 - der erste Kampf mit Blut, gegen den Waechter); danach
      kaempft der Hauptstrang mit Lebenspunkten, die Seitenwege bleiben
      Schach. Faehigkeiten und Leveln ruecken Schritt fuer Schritt nach vorn.
    * AB KAPITEL III: Hauptstrang Lebenspunkte, die Seitenwege wechseln sich
      ab - ganze Wege, nicht Station fuer Station. Schach bleibt bis zum
      Ende als Abwechslung.
  Zusammen 370 von 529 Stationen mit Lebenspunkten (70 %; vorher 62 %, aber
  erst ab Liga 5). Nur die Regeln, das Erwachen und sein Monster haben sich
  verschoben - Stationen, Wege, Karten und Belohnungen sind dieselben.
- Proben auf den neuen Entscheid umgezogen (Erwachen frueh in Kapitel II,
  Seitenwege dort Schach, ab III Hauptstrang HP, Schach als Seitenweg bis zum
  Ende, Lebenspunkte innerhalb der Gratisstrecke).

## 1.35.0 - Kampagnenumbau, Schritt B: die Gegnerbesetzung
- AB KAPITEL III rueckt auf die freien Plaetze des Gegners (Turm, Laeufer,
  Springer), wer dir schon BEGEGNET ist und dir NICHT GEHOERT - Sonderfiguren
  und gewoehnliche Monster, nie ein Kapitelmeister, jeder nur einmal. Nicht
  an jeder Station: von 19 % der Stationen in Kapitel III bis gut die Haelfte
  ab Kapitel IX, ein bis drei Plaetze. Boss-, Final- und Torstationen bleiben,
  wie sie sind.
- FEST: die Besetzung wird beim Betreten festgehalten, je Platz. Sie aendert
  sich nur, wenn sich dein BESITZ aendert (wer dir jetzt gehoert, geht, der
  Naechste derselben Klasse rueckt nach) - nie durch Verlust oder Neustart,
  und auch nicht durch Begegnungen anderswo.
- WECHSELNDE AUFSTELLUNG (Label mit gekreuzten Pfeilen im Stationsfenster):
  an etwa jeder vierten Station ab Kapitel III stehen dieselben Figuren bei
  jedem Versuch auf anderen freien Plaetzen. Koenig und Dame fest.
- DIE STAERKEKLASSE: jeder Ersatz kommt aus der Klasse der Figur, deren Platz
  er nimmt (hoechstens 6 Punkte daneben, Werte aus npm run balance), und erbt
  ihre Stufe. Gemessen (npm run besetzung, besetztes gegen klassisches Heer
  derselben Station): 1 Platz 47 %, 2 Plaetze 50 %, 3 Plaetze 42 %, Partien
  45-58 Halbzuege. Ohne beides waren es 25-43 % - ein Ersatz stand auf Stufe
  1 neben einem Springer auf Stufe 3.
- Monster auf freien Plaetzen wachsen in ihren Faehigkeiten mit der Liga wie
  der Stationsboss (I in 1-4, II in 5-8, III ab 9).

## 1.34.0 - Kampagnenumbau, Schritt A: der Anfang
- REIHE 1 OHNE GAMBIT (Besitzer): die erste Station spielt mit einem
  gewoehnlichen Bauern an seiner Stelle; nach dem ersten Sieg erwacht er
  (GAMBIT_ERWACHT_AB = 1, loest v1.0.49 ab). Vor dem Erwachen fehlt er auch
  im Hofstaat und in der Chronik (ausser fuer den Admin).
- STURMLAUF IST DAS GESCHENK DES ERWACHENS: er bekommt ihn sofort, ohne
  Punkte - Stufe I bis zu zwei Felder vor, II drei, III vier (Staerkestufe im
  Kern, Weg frei, kein Schlag). Die Sprosse ist GESCHENKT: gilt ohne Lernen,
  laesst sich nicht lernen oder vergessen, aber aufstufen (II ab Stufe 3,
  III ab 5). Die Leiter zeigt "Geschenk des Erwachens". Wer Sturmlauf frueher
  auf Stufe 5 fuer Punkte gelernt hat, bekommt den Lernpreis zurueck -
  einmal, die Aufstufung bleibt. Der Erwachenstext nennt ihn.
- BEHOBEN: ein Sturmlauf auf die letzte Reihe wandelte sich nicht um - ein
  Bauer blieb auf der gegnerischen Grundreihe stehen.
- Der Gambit traegt seine FAEHIGKEITSSTUFEN jetzt auch im reinen Schach
  (Liga 1-4) - vorher war eine bezahlte Aufstufung dort ohne Wirkung.
- DIE FREIE AUFSTELLUNG IST DIE BELOHNUNG VON LIGA 1, REIHE 5 DES
  HAUPTSTRANGS: der Sieg an irgendeiner der drei Stationen (L01s17, L01s20,
  L01s22) oeffnet die hintere Reihe fuer den Rest des Spiels (vorher: die
  erste beigetretene Figur). Die Stationen kommen aus den Kampagnendaten.
- Bauplan fuer den ganzen Umbau: design/KAMPAGNE-BAUPLAN-2026-09-22.md
  (Schritt B Gegnerbesetzung ab Kapitel III, Schritt C Lebenspunkte halb/halb).
- Im Browser nachgesehen: vor dem ersten Sieg ohne Gambit, das Erwachen,
  seine Leiter.

## 1.33.2
- DIE KAPITELMEISTER IM HOFSTAAT IN KAPITELFOLGE: jeder gewonnene Meister
  steht hinter den Figuren - Richter, Doppelritter, Seuchenkoenig ... -,
  danach die gekauften Monster. (ownedBossSet fuehrt auch die gekauften;
  ein erster Anlauf trennte falsch und liess sie fallen - die Kulissenprobe
  hat ihn gefangen.)
- ALTE BOSSBILDER GELOESCHT (Besitzer): die fuenf Familienbilder (Golem,
  Bestie, Schlange, Schemen, Tyrann) und der alte Ligameister, je gross und
  klein, samt Farb- und Sockeleintraegen und jedem Rueckfallweg - jedes der
  25 Monster hat sein eigenes Gemaelde und seine eigene Sockelmessung.
  Der Messeintrag "gambit-t1" BLEIBT: die Hoehe des Gambits der ersten
  Rangstufe wird daraus gerechnet (eine Probe hat das gezeigt).
- KEINE FIGUR UEBER IHRER HOECHSTSTUFE: alte Spielstaende mit einem Gambit
  ueber 20 (frueher gab es drei Rangstufen zu je zehn) werden beim Laden
  gekappt - auf beiden Ladewegen, ohne Erstattung.
- Kettenblitz und Enterhaken (tot) stehen auf keiner Leiter mehr - das hatte
  der Umbau nach Beweglichkeit (v1.29.0) schon erledigt.

## 1.33.1
- DIE LEISTE UNTER DEM BRETT IST LESBAR (Besitzer: "kann man fast nicht
  lesen"). Gemessen: nicht die Farbe war schuld - der BRETTSCHATTEN fiel
  ueber die Leiste (das Brett ist positioniert und wird nach ihr gemalt); die
  erste Zeile war dunkler als die zweite, selbst reines Weiss kam auf 192.
  Beide Fassungen der Leiste liegen jetzt darueber; die Schrift ist
  kraeftiger, etwas groesser, fast weiss.
- ZURUECK UND AUFGEBEN SIND LEISE: fast durchsichtiger Grund, zarte Kontur,
  gedaempfte Schrift, kein Gluehen. Der Bestaetigungsdialog bleibt.
- VOR DEM ERWACHEN DER LEBENSPUNKTE tragen Hofstaat-Kacheln, Monsterkacheln
  und das Figurenblatt den weissgrauen Sockel ohne Werte - wie die eigene
  Figur auf dem Brett im reinen Schach.
- DAS FIGURENBLATT: der Gambit wie jede Figur - EIN Satz unter dem Namen,
  Verbessern ueber die volle Breite, kein "Stufe I" daneben (in beiden
  Fassungen des Blatts), kein langer Erklaertext. Die Stufenleiste unter der
  Bundtafel ist fort - die Stufe steht oben auf der Buehne.
- IM POP-UP WISCHEN: nach links die naechste Karte, nach rechts die vorige,
  in der Reihenfolge der Uebersicht; nur Karten, die sich auch per Tippen
  oeffnen. Nur ein klarer waagrechter Wisch blaettert, Scrollen bleibt
  Scrollen. Die neue Karte gleitet aus der Wischrichtung herein.
- BEHOBEN: ein GEWONNENER Kapitelmeister stand nirgends in der Uebersicht -
  die Halle der Meister nahm ihn heraus, die Verbuendeten zeigten nur
  gekaufte Monster. Jetzt steht er bei den Verbuendeten.
- Im Browser nachgesehen: Leiste, leise Knoepfe, grauer Sockel, Gambit-Blatt;
  Wischen Gambit -> Bauer -> Springer und zurueck.

## 1.33.0
- MONSTER AUF FREIEN PLAETZEN (Besitzer): die gewoehnlichen Monster stehen
  anstelle von Turm, Laeufer oder Springer - nie auf dem Platz von Koenig
  oder Dame. Die Kapitelmeister stehen weiter nur anstelle der Dame. Jedes
  Monster hoechstens einmal im Heer; zwei verschiedene zugleich gehen.
  Die Auswahl: am Damenplatz die eigenen Meister, an jedem freien Platz die
  eigenen gewoehnlichen Monster ("Monster - auf freiem Platz").
- Die Zaehler unter der Aufstellung zaehlen wie die Regel: ein Meister als
  Dame, ein Monster als freier Platz. Vorher stand der Dame-Chip bei einem
  Meister rot auf 0 von 1, obwohl die Aufstellung gueltig war.
- BEHOBEN: Kapitel III gehoert dem SEUCHENKOENIG. Die Liste, die entscheidet,
  wem ein Meister nach einem gewonnenen Kapitel gehoert (dazu Grossmeister-
  Rahmen, Bundtafel, Kulisse), fuehrte noch den Hetzer - v1.28.4 hatte nur die
  Kampagne umgestellt. Eine Probe haelt beide Listen jetzt aneinander. Die
  Kulisse von Kapitel III (Marktplatz mit Galgen) geht an den Seuchenkoenig,
  der Hetzer steht bei den Bestien.
- Die Gegnerseite folgt mit dem Kampagnenumbau (Besetzung je Station);
  Regel und Heeraufbau tragen Monster auf jedem Platz schon.

## 1.32.0
- DIE MONSTER TRAGEN IHREN EIGENEN SATZ (Besitzer, nach Tabelle): nur noch
  die neun Monsterfaehigkeiten; Bollwerk, Regeneration, Lebensraub und
  Blinzeln bleiben den Figuren. Wie viele, folgt der Beweglichkeit:
    * Kapitelmeister I-IV drei, V-VIII vier, IX-XII fuenf (Auren bleiben)
    * gewoehnliche Monster: 16 Felder eine, 12-14 zwei, 8 drei, Bollwerk vier
      (wer Brut legt, eine Stufe tiefer)
  Die Leiter verteilt sie ueber die fuenf Monsterstufen (1: Stufe 2 |
  2: 2, 4 | 3: 2, 3, 4 | 4: 2-5 | 5: 1-5).
- BRUT (Besitzer: "5 Bauern ist zuviel"): Seuchenkoenig 3, Brutmutter 2,
  Fluesterin 1, Wandlerin 2 - gestaffelt, damit jedes Monster seinen eigenen
  Zug behaelt.
- GEMESSEN UND NACHGESTELLT (npm run balance misst jetzt auch die 13
  gewoehnlichen Monster): mit der Tabelle lagen Geist, Wandlerin, Sturmklaue
  bei 72-73 %. Geistwandel war bei den schnellsten Springern ein zweiter
  Koerper zu viel (ohne ihn ~50 %). Geist -> Blenden, Wandlerin -> Schrecken,
  Sturmklaue Widerhall -> Wegelagerei. Danach noch drei Springer mit 17-20
  Angriff ueber 60 % - WER SPRINGT, SCHLAEGT SCHWACH, wie bei den Figuren nur
  wo noetig: Hetzer 18/6, Sturmklaue 17/7, Geist 16/8 (24 Punkte bleiben).
  Endstand: alle 13 zwischen 36 und 59 %, Partien 55-70 Halbzuege.
  Bericht: design/MONSTER-FAEHIGKEITEN-2026-09-21.md
- BEHOBEN: wurde eine Faehigkeit gestrichen, kam nur ihr Lernpreis zurueck -
  die Punkte fuer eine AUFSTUFUNG gingen verloren (etwa Blinzeln II beim
  Springer). Jetzt kommt beides zurueck, bei Figuren und Monstern, und nur
  einmal.
- KI: ein Geist zaehlt nach seinem Leben VOR dem Fall - mit 3 von 3 galt er
  als heil, und ihn zu schlagen sah wertlos aus.
- Die Zahlen des Geistes (3 Leben, doppelter Angriff) stehen an EINER Stelle
  (GEIST in transitions.js).

## 1.31.0
- DIE FUENF UEBRIGEN MONSTERFAEHIGKEITEN WIRKEN - damit alle neun:
    * GIFT: ein Treffer vergiftet; die Figur verliert nach jedem eigenen Zug
      1, 2 oder 3 Leben, drei Runden lang. Gift toetet nie, es laesst
      mindestens ein Leben.
    * ADERLASS: jeder Treffer nimmt 1 (II: 2) Hoechstleben bis zum Ende der
      Partie.
    * SCHRECKEN: das Feld, das das Monster verlaesst, darf kein Gegner betreten
      - eine Runde, auf Stufe II zwei. Vorbeiziehen geht.
    * BLENDEN: zieht das Monster so, dass Gegner im Umkreis von zwei Feldern
      stehen, duerfen sie ihren naechsten Zug nicht ziehen - einmal je Partie,
      auf II zweimal. Den Koenig blendet es nie. Bliebe durch Blindheit oder
      Schreckfeld GAR kein Zug, gilt die Sperre nicht - keine Faehigkeit darf
      ein Remis durch Zugnot erzwingen. Brett und KI teilen denselben Filter.
    * GEISTWANDEL: faellt das Monster, kehrt es einmal je Partie als Geist
      zurueck - 3 Leben, doppelter Angriff, bleich und durchscheinend im Bild,
      das Band behaelt seine Farben. Unsterblich greift vor dem Geist.
- AM BRETT SICHTBAR, solange es anhaelt: Gift, Blindheit und das Schreckfeld
  tragen ein Zeichen; jede Wirkung steigt im Moment ueber dem Feld auf.
- DIE ERSTE BEGEGNUNG ERKLAERT SICH (Besitzer: "was passiert und darstellbar
  ist, gerne grundsaetzlich mehr andeuten"): wirkt eine der neun Monster-
  faehigkeiten zum allerersten Mal im Spiel, erklaert ein Hinweis ueber dem
  Brett in einem Satz, was geschah - nicht blockierend, verschwindet nach neun
  Sekunden oder auf Tippen, danach nie wieder.
- Proben: die Wirkung jeder Faehigkeit (nicht nur ihr Merker - der Geblendete
  zieht nicht, das Schreckfeld ist zu, nach einer Runde frei), die Anzeige,
  die Erstbegegnung.

## 1.30.0
- VIER MONSTERFAEHIGKEITEN WIRKEN IM SPIEL (bisher angekuendigt, ohne Wirkung):
    * STEINHAUT: die ersten Treffer einer Partie prallen ab - einer auf Stufe
      I, zwei auf Stufe II.
    * WIDERHALL: wer das Monster trifft, bekommt ein Viertel (II: die Haelfte)
      des Schadens sofort zurueck - das kann den Angreifer faellen, auch den
      Koenig.
    * UNSTERBLICH: einmal je Partie steht das Monster wieder auf, mit einem
      Viertel (II: der Haelfte) seines Lebens.
    * WEGELAGEREI: jeder Treffer raubt 2, 4 oder 6 Gold; nach der Partie
      verrechnet, nie unter 0. Wer aufgibt, verliert die eigene Beute; das ihm
      Geraubte bleibt fort. Das Ergebnisbanner zeigt Beute oder Raub.
  Alle vier wirken an JEDEM Treffer - am Hauptziel, an der Schockwelle, am
  Paladin, der einspringt -, damit eine Regel nie vom Weg des Schadens abhaengt.
- STAERKE-STUFEN: was von selbst wirkt, waechst in seiner Staerke, nicht in
  der Haeufigkeit. Die Leiter zeigt je Stufe ihren Text ("die ersten zwei
  Treffer prallen ab") statt "2x je Partie" (STAERKE_STUFEN, stufenText).
- GEGNERISCHE MONSTER WACHSEN MIT: ihre eigenen Faehigkeiten stehen in Liga
  1-4 auf Stufe I, in 5-8 auf II, ab 9 auf III (soweit es sie gibt); eigene
  Monster je nach ihrer Stufe. Allgemeine Faehigkeiten (Blinzeln, Bollwerk)
  bleiben bei gegnerischen Monstern auf I, damit bestehende Gegner sich nicht
  still veraendern.
- AM BRETT SICHTBAR: ueber dem Feld steigt kurz auf, was geschah - "prallt
  ab", "steht wieder auf", der Rueckschlag des Widerhalls als Zahl. Ohne das
  saehe ein abgeprallter Treffer aus wie ein Fehler. Die Merker gelten nur fuer
  den einen Zug.
- Neunzehn Proben in test_combat, zwei in test_zauber.

## 1.29.1
- NACH DER ANMELDUNG IST MAN IM SPIEL (Besitzer: "In dem Moment, wo ich mich
  eingeloggt habe, bin ich einfach im Spiel"). Es gibt nur einen Spielstand,
  also keinen Schirm mehr, der ihn zeigt oder wechseln laesst: der eine Stand
  wird nach der Anmeldung geoeffnet oder, beim allerersten Mal, angelegt.
  Gesichert wird immer von selbst. Unter Profil kann man sich nur noch
  abmelden; "Spielstand wechseln" ist fort, ebenso der Rueckweg aus der
  PIN-Sperre in die Spielstandliste (er meldet jetzt ab).
- Der Gast-Hinweis ("Es wird nichts gesichert") stand in diesem Schirm und
  wohnt jetzt im Profil.
- SavesScreen.jsx und ein altes Layout-Gestell dafuer sind geloescht; die
  Rauchprobe und drei Pruefwerkzeuge, die den Schirm lasen, sind umgestellt.
  Vier Proben in test_saves.

## 1.29.0
- FAEHIGKEITEN UND ANGRIFF NACH BEWEGLICHKEIT (Besitzer, freigegeben nach
  Tabelle: design/FIGUREN-BEWEGLICHKEIT-2026-09-21.md). Wer springt, schlaegt
  schwach: Springer 11/13 -> 16/8, Kanzler 12/12 -> 15/9, Spaeher 9/15 ->
  15/9, Amazone 9/15 -> 18/6, Erzbischof und Vesna 15/9 -> 17/7 - die Summe
  bleibt 24. Wer stark zieht, traegt wenig: sehr bewegliche Figuren 2
  Faehigkeiten, mittlere 3, traege 4 (Techniker hatte eine, Magier, Warlock,
  Paladin ... zwei). Dame und Kapitelmeister sind ausgenommen.
- ZWEI TOTE FAEHIGKEITEN ENTFERNT: Vorreiter beim Spaeher wirkte nur bei
  Springern, Hofsprung bei der Amazone nur bei der Dame (moves.js bindet die
  Bewegungsfaehigkeiten an die Art). Beide waren gelernt worden, ohne je
  etwas zu tun.
- SPIELSTAND: gestrichene Faehigkeiten verschwinden samt Stufe, die
  Skillpunkte kommen ueber den geprueften Dauerfeuer-Weg zurueck (eine
  Tabelle GESTRICHEN in profile.js). Zwei neue Proben in test_saves.
- DER MASSGEBLICHE TEST SIND REIFE HEERE: npm run balance misst jetzt mit dem
  Rest beider Heere auf Hoechststufe (das echte Spaetspiel). Ergebnis: 21 von
  22 Figuren zwischen 36 und 60 %, jede Partie 49-67 Halbzuege bei einer
  Grundlinie von 56 - ein Spiel wie beim Schach. Der Stufe-1-Lauf misst das
  Fruehspiel und bleibt als "gruppen"/"lauf" erhalten.
- VESNA BLEIBT BEI 75 % (Besitzer: so lassen). Ihre Staerke ist der Zug - acht
  Richtungen, zwei Felder, nie blockiert; Partielaenge 53, kein Ueberrennen.
  Sie ist die letzte Belohnung des Spiels.

## 1.28.5
- KOENIG UND DAME STEHEN IMMER FEST - UND MAN SIEHT ES (Besitzer). In der
  Aufstellung traegt der Koenig keine Kontur und einen gedaempften Grund: er
  ist nicht anklickbar. Der Damenplatz traegt die laufende lila Kontur der
  Grossmeister: hier steht die Dame oder ihr Ersatz, ein Kapitelmeister -
  nirgends sonst. Beide Plaetze erklaeren sich beim Beruehren.
- DIE ENTSCHEIDUNGEN ZUR KAMPAGNE liegen jetzt im Repo
  (design/KAMPAGNE-AUFSTELLUNG.md): feste Krone; zwoelf Kapitelmeister als
  Grossmeister, die 13 anderen Monster auf den freien Plaetzen; jede Figur
  ausser Turm, Laeufer, Springer nur einmal je Aufstellung; Reihe 1 ohne
  Gambit, Sturmlauf beim Erwachen (2/3/4 Felder ueber drei Stufen);
  eigene Aufstellung ab Liga 1 Reihe 5; der Gegner wechselt seine
  Aufstellung erst ab Kapitel 3 und nicht ueberall, mit Label; bei Verlust
  oder Neustart nie neue Figuren, nur andere Plaetze. Gebaut ist davon nur
  die Krone.

## 1.28.4
- DIE ZWOELF KAPITELMEISTER SIND DIE GROSSMEISTER (Besitzer): jede Liga endet
  mit einem Monster, und wer es besiegt, erhaelt es als Damenersatz - eine
  neue je Kapitel. Nur diese zwoelf gelten als Grossmeister (nur auf dem
  Damenplatz, 3-5 Faehigkeiten, duerfen verschieden stark sein); die 13
  Monster unterwegs sind gewoehnliche Monster. Im Inhalt: KAPITELMEISTER und
  istKapitelmeister (campaign.js), abgeleitet aus den Finalstationen.
- SEUCHENKOENIG STATT HETZER als Meister von Kapitel III (Besitzer: "vom
  Begriff her passend"). Der Hetzer steht jetzt in Kapitel III und X
  unterwegs. Asra war schon Meisterin von Kapitel XI - meine Auflistung in
  v1.28.3 hatte das falsch wiedergegeben, weil sie nach der hoechsten Reihe
  statt nach der Finalstation gesucht hatte.
- Die Kampagne ist neu erzeugt (tools/build-campaign12.mjs); nur die zwei
  Monster haben gewechselt, 529 Stationen wie zuvor. Fuenf Proben in
  test_campaign_smoke.

## 1.28.3
- BALANCE-DURCHLAUF IN ZWEI GRUPPEN (Besitzer: "der 1:1-Vergleich hinkt, es
  darf alles geben - wichtig ist nur, dass man mit einer Figur den Koenig
  nicht ohne weiteres plattmacht; die 24 Punkte bleiben"). Grossmeister (Dame
  und die 25 Monster auf dem Damenplatz) und alle anderen Figuren unter sich,
  dazu die PARTIELAENGE als Mass fuer "ein Spiel wie beim Schach".
- GRUNDLINIE: zwei Heere auf Stufe 1 spielen 56 Halbzuege. Grossmeister-
  Duelle dauern 31-67 - im Bereich der Grundlinie, kein Grossmeister macht
  den Koenig ohne Spiel platt; ihre Staerken streuen von 17 % (Bollwerk) bis
  81 % (Osric), wie gewuenscht verschieden.
- DAS PROBLEM LIEGT BEI DEN ANDEREN: Springer (86 %), Amazone (70 %) und Turm
  (74 %) entscheiden Partien nach 18-23 Halbzuegen - weniger als die Haelfte
  der Grundlinie. Die schwachen Figuren spielen 40er-Partien.
- VORGELEGT, NICHT UMGESETZT (design/BALANCE-2026-09-21.md): der Hebel des
  Besitzers - Beweglichkeit gegen Faehigkeiten. Sehr bewegliche Figuren 2
  Faehigkeiten, mittlere 3, traege 4-5; Grossmeister ausgenommen. Die Punkte
  bleiben ueberall 24.
- BERICHTIGT: der Lauf "eine Figur allein" misst gegen die Dame auf
  Hoechststufe, nicht gegen Stufe 1 - heer() hebt die Figur auf dem
  Damenplatz immer an. Beschriftung im Werkzeug berichtigt.
- Am Spiel nichts geaendert.

## 1.28.2
- DER BALANCE-DURCHLAUF GIBT ES JETZT (Besitzer: "keine Figur darf mehr als
  60 % ihrer Duelle gewinnen"). tools/balance.mjs, npm run balance: jede Figur
  auf Hoechststufe gegen jede andere, in sonst gleichen Heeren, KI gegen KI,
  Farben abwechselnd, feste Keime - 2024 Partien in 13 Sekunden.
- ERGEBNIS (design/BALANCE-2026-09-21.md): acht Figuren liegen ueber 60 % -
  Springer 84, Laeufer 83, Amazone 76, Kanzler 76, Turm 71, Dame 71,
  Erzbischof 70, Vesna 64. Unten die Sonderfiguren: Schildtraeger 18,
  Attentaeter 25, Flaggentraeger 27. Gegenprobe mit doppelter Rechentiefe:
  dieselbe Richtung.
- DIE ZAUBERSTUFEN AUS v1.28.0 SIND NICHT DIE URSACHE: derselbe Lauf mit allen
  Zaubern auf Stufe I verschiebt die Quoten nur um -7 bis +10, meist im
  Rauschen. Die starken Figuren waren es auf Stufe I schon.
- DIE URSACHE: alle Figuren tragen dieselben 24 Punkte, aber ihre Zuege sind
  verschieden stark - mit gleichen Punkten gewinnt die Beweglichkeit. Der
  Ausgleich (Punkte je Figur nach Beweglichkeit) aendert den Entscheid "alle
  24" und ist deshalb nicht umgesetzt, sondern dem Besitzer vorgelegt.
- Nichts am Spiel geaendert.

## 1.28.1
- DAUERFEUER IST AUS ALLEN AUFSTIEGSPLAENEN (Besitzer: "keine Figur darf
  starke Faehigkeiten dauerhaft haben"). Es war ein dauerhafter Fernschuss
  und steckte bei Kapitaen, Magier, Warlock und Techniker. Der Kapitaen, der
  keinen anderen Fernschuss hatte, bekommt an derselben Stelle Scharfschuss;
  die drei anderen haben ihn ohnehin. Ueber die Stufen II und III des
  Scharfschusses schiessen sie jetzt zwei- oder dreimal je Partie.
- WER DAUERFEUER GELERNT HATTE, VERLIERT NICHTS: der Kapitaen bekommt den
  Scharfschuss dafuer, Magier, Warlock und Techniker ihre Skillpunkte zurueck.
  Das gilt beim normalen Laden ebenso wie beim Wiederherstellen.
- DATENVERLUST BEIM WIEDERHERSTELLEN BEHOBEN - gefunden beim Pruefen der
  Umstellung: seit v0.2.0 baute die Migration das Figurenfach nur aus den
  Stufen neu. Wer eine Sicherung aus einer Datei oder aus dem Online-Tresor
  zurueckspielte, bekam seine Figuren OHNE ihre gelernten Faehigkeiten zurueck
  - und ohne Monster- und Faehigkeitsstufen. Das normale Laden war nicht
  betroffen. Jetzt bleibt das Figurenfach ganz.
- PHASE UND DURCHBRUCH bleiben getrennt: im Code sind sie nicht dieselbe
  Regel - Phase springt diagonal (Laeufer, Erzbischof), Durchbruch gerade
  (Turm, Kanzler). Gleiche Idee, andere Richtung.
- Sechs Proben in test_saves.

## 1.28.0
- ZAUBER HABEN STUFEN (Besitzerentscheid, design/FAEHIGKEITEN-STUFEN.md).
  Stufe I: einmal je Partie, II: zweimal, III: dreimal. KEIN Zauber wird
  dauerhaft - bei keiner Figur. Maechtige Zauber (Blinzeln, Hofsprung,
  Schockwelle, Durchbruch) enden bei II; bauern- und koenigshafte Zuege und
  der Fernschuss gehen bis III.
- DAS BUCH BLEIBT EIN BUCH: sobald eine Figur einen ANDEREN Zauber gewirkt
  hat, ist es fuer alle uebrigen zu - wie bisher. Neu ist nur, dass derselbe
  Zauber so oft wirkt, wie seine Stufe erlaubt. Das Buch zaehlt dafuer jetzt
  Einsaetze statt "benutzt"; alte Staende (true) zaehlen als einer.
- DER GANZE WEG IST GEBAUT: Profil (pieces.stufen) -> Heer (buildArmy fuer
  Figuren, Bauern, Gambit und eigene Monster) -> Figur (makePiece) -> Zuege
  (hasAbility) -> Verbuchen (transitions). Nachweis in einer ECHTEN Partie im
  Kern: derselbe Bauer weicht mit Ausweichen I einmal aus, mit Ausweichen II
  zweimal.
- IN DER TRAININGSLEITER steht unter jeder gelernten Faehigkeit ihre Stufe
  ("Stufe II von III - 2x je Partie") und der Knopf fuer die naechste. Die
  naechste Stufe verlangt eine hoehere Figurenstufe (Figur: zwei weiter,
  Monster: eine) und kostet Skillpunkte. Weil Figur und Monster dieselbe Leiter
  benutzen, gilt es fuer beide.
- AM BRETT ist ein Zauberzeichen erst verbraucht, wenn ALLE seine Einsaetze
  weg sind.
- NOCH NICHT GEBAUT: die Staerke-Stufen der Dauerfaehigkeiten (Lebensraub,
  Regeneration, Bollwerk, Sturmlauf ...), das Zusammenlegen (Phase ->
  Durchbruch, Fliegen I-III, Scharfschuss I-III), die Monsterfaehigkeiten und
  der Balance-Durchlauf.
- GEFUNDEN BEIM BAUEN: zwei gleichlautende Zeilen in leveling.js; die erste
  Ersetzung traf die in buildArmyFrom, wo stufenOf gar nicht existiert - ein
  Absturz beim Aufruf. Bemerkt, weil die Stufe im Heer fehlte; korrigiert.
- Zwoelf neue Proben in test_zauber, zwei alte in test_combat nachgezogen
  (sie erwarteten true im Buch, jetzt steht dort die Zahl der Einsaetze).

## 1.27.3
- KEIN ZAUBER WIRD DAUERHAFT - BEI KEINER FIGUR (Besitzer: "Keine Figur, auch
  Gambit und Koenig, darf starke Faehigkeiten dauerhaft haben - das ist zu
  stark"). Die Heldenausnahme aus v1.26.5 ist zurueckgenommen: auch der
  Gambit darf Stossschlag und Ausweichen nur einmal je Partie, und der Text
  sagt fuer ihn wieder "1x". Im Kern ist die Ausnahme vollstaendig entfernt
  (hasAbility, das Verbuchen beim Einsatz); die Proben pruefen jetzt das
  Gegenteil.
- DER ENTWURF "FAEHIGKEITEN MIT STUFEN" liegt jetzt im Repo
  (design/FAEHIGKEITEN-STUFEN.md), mit der Regel des Besitzers eingearbeitet:
  Zauber wachsen auf 1x, 2x, 3x je Partie; was von Natur aus immer wirkt,
  waechst in seiner Staerke. Gebaut ist daraus noch nichts.
- RICHTIGGESTELLT: der Spielserver gg-hall wird NICHT von Hand ausgerollt,
  wie der Changelog zu v1.27.2 behauptete. Er ist in Cloudflare mit dem Repo
  verbunden, jeder Push rollt ihn aus (im Dashboard nachgesehen, /name-frei
  antwortete live). DEPLOY-WORKER.md ist entsprechend ergaenzt.

## 1.27.2
- DER NAME IST ONLINE EINDEUTIG - DER SERVER PRUEFT (Besitzer: "Auf jeden
  Fall muss der Server pruefen, denn er muss online eindeutig sein").
  GEFUNDEN: der Spielserver nahm bei hello und set jeden Namen ungeprueft
  an - zwei Spieler konnten gleich heissen. Jetzt prueft er gegen ALLE
  Spieler, die er kennt, mit derselben Regel wie das Geraet (Gross-/
  Kleinschreibung und doppelte Leerzeichen zaehlen nicht).
    * set mit vergebenem Namen: abgelehnt, der Spieler bekommt nameVergeben.
    * hello mit vergebenem Namen: der Server kann ihn nicht abweisen (er
      saesse ausgesperrt) und gibt ihm eine freie Abwandlung ("Name 2");
      das welcome meldet es, und das Geraet uebernimmt den Servernamen.
    * GET /name-frei: das Profil fragt hier VOR dem Speichern. Verraten
      wird nur frei oder nicht, nie wem ein Name gehoert.
- DAS PROFIL SPEICHERT NICHT OHNE DEN SERVER: ist er nicht erreichbar oder
  kennt er die Abfrage noch nicht, bleibt der alte Name und die Meldung sagt
  warum. Sonst waere die Eindeutigkeit wieder nur eine Hoffnung.
- WICHTIG: der Spielserver (Cloudflare Worker gg-hall) wird NICHT ueber
  GitHub ausgerollt, sondern von Hand: cd worker && npx wrangler deploy.
  Bis das geschieht, meldet das Profil beim Umbenennen "Der Server prueft
  Namen noch nicht - er muss neu ausgerollt werden".
- Sieben Proben in test_worker (Server), drei in test_saves (Profil).

## 1.27.1
- DER GAMBIT SITZT IM BOOT (Besitzer: "das Schiff im letzten Kapitel - der
  Gambit sitzt nicht im Schiff, sondern daneben. Er muss in jeder Stufe drin
  sitzen"). GEFUNDEN: das Boot wurde mit transform: translateX(-50%) mittig
  gesetzt - dieselbe Falle wie bei den Brettfiguren in v1.24.5c. Eine laufende
  Animation auf transform ueberschreibt die Inline-Verschiebung; dann steht die
  LINKE Kante des Boots in der Mitte, es rutscht um seine halbe Breite nach
  rechts, und der Gambit steht an seinem Ende. Das Bild selbst ist mittig
  (Versatz 0,1 %). Jetzt wird ueber left gerechnet, ohne transform. Weil die
  Bootsbreite am selben Tiefenfaktor haengt wie der Gambit, gilt das fuer
  jede Stufe gleich.
- GROSSMEISTER-KACHELN TRAGEN DIE LAUFENDE KONTUR des Verbessern-Knopfs
  (Besitzer). Innen gezeichnet: die Kachel schneidet mit overflow hidden
  alles ab, was ueber ihren Rand ragt, und die Knopffassung sitzt genau dort.

## 1.27.0
- DER SPIELERNAME IST AENDERBAR (Besitzer: "Ich faende es gut und wichtig,
  dass ich meinen Spielernamen anpassen kann"). In v1.0.8 war er FEST, weil
  er "kuenftig auch der Anmeldename" werden sollte. Das ist nie geschehen:
  angemeldet wird mit E-Mail oder Google, der Name ist nur Anzeige. Der Grund
  fuer das Festschreiben ist damit weg.
- EINDEUTIG BLEIBT ER: vor dem Speichern prueft das Konto, dass kein anderes
  denselben Namen traegt - Gross- und Kleinschreibung und doppelte
  Leerzeichen zaehlen nicht. 2 bis 24 Zeichen. Gespeichert wird erst am Konto
  und nur wenn das gelingt im Profil, damit beide nie auseinanderlaufen.
- Im Profil steht jetzt ein Feld mit Speichern-Knopf statt des festen Namens;
  der Hinweis "Dein Name ist fest ... kuenftig Anmeldename" ist weg.
- Gegenprobe im Browser: "Eherner Leuchtturm" -> "Der Graue Probant",
  gespeichert. Fuenf Proben fuer die Regeln (zu kurz, zu lang, vergeben auch
  in anderer Schreibweise, eigener Name darf bleiben, freier Name geht).

## 1.26.9
- DIE GOOGLE-ANMELDUNG DES BESITZERS IST ADMIN (Besitzer: "wenn du mein
  Googlelogin frey.manu einfach als Admin machst, passt das fuer mich"). Die
  Mechanik gab es schon (ADMIN_EMAILS in config.js, ausgewertet in
  cloudAuth.js) - die Liste war nur leer. Eingetragen sind beide Schreibweisen
  desselben Kontos, @gmail.com und @googlemail.com.
- NUR EIN SPIELSTAND (Besitzer: "Ich moechte nur einen Spielstand haben. Man
  sollte nicht mehrere erschaffen koennen. Loeschen ist ok - aber unter Profil,
  am besten ueber Konto loeschen"). Der Knopf fuer einen neuen Stand erscheint
  nur noch, solange es keinen gibt; der Loeschknopf im Spielstandschirm ist
  weg. Geloescht wird ueber "Konto loeschen" im Profil.
- DER KNOPF "KONTO LOESCHEN" IST GLATTGEZOGEN (Besitzer: "die Schrift hat so
  eine seltsame Farbe"). v1.4.3 hatte nur den zweiten, endgueltigen Knopf auf
  gedaempftes Rot gebracht; der erste, der das Loeschen oeffnet, trug weiter
  das Violett der Riss-Magie. Jetzt tragen beide dasselbe Rot.
- Vier Proben in test_saves.

## 1.26.8
- DIE ANMELDUNG RECHNET AUCH OHNE HTTPS (Besitzer: "Ich kann mich am Computer
  nicht als Admin anmelden und verstehe ueberhaupt nicht wieso"). Das Passwort
  wird mit crypto.subtle zu einem Pruefwert gerechnet - und crypto.subtle gibt
  es im Browser NUR in einem sicheren Kontext: https:// oder localhost. Ueber
  http://, eine Adresse im Heimnetz oder als Datei geoeffnet, ist es
  undefiniert; hashPass warf, und die Anmeldung meldete nur "Das hat nicht
  geklappt". Jetzt rechnet eine eigene SHA-256-Umsetzung, wenn der Browser
  keine liefert - bitgenau derselbe Pruefwert (Probe gegen die Rechnung des
  Browsers, bei kurzen und langen Eingaben).
- EIN UNERWARTETER FEHLER NENNT SEINEN GRUND. Alles ausser "falsches
  Passwort" und "kein Konto" kam bisher als "Das hat nicht geklappt" ohne
  Hinweis an. Jetzt steht die Ursache in Klammern dahinter.
- OFFEN: ob das wirklich die Ursache am Computer des Besitzers war, ist nicht
  bewiesen - moeglich ist auch ein altes, im Browser gespeichertes Passwort,
  das die Passwortverwaltung beim Anmelden einsetzt. Die neue Fehlermeldung
  zeigt beim naechsten Versuch, welches von beiden es ist.

## 1.26.7
- FIGURENBLATT UND MONSTERFENSTER SIND EIN UND DASSELBE DESIGN (Besitzer:
  "Mach es wirklich so, dass es global der gleiche Designblock ist. Wenn ich in
  Zukunft etwas aendere, will ich nicht pruefen muessen, ob du es bei den
  Monstern und bei den Figuren gemacht hast"). Beide Fenster bauen sich jetzt
  aus DENSELBEN drei Bauteilen:
    BlattBuehne     - Kulisse, Figur, Band, Zugbild, Zeichen, Werte (v1.25.9)
    Aufstiegsplan   - die Trainingsleiter mit Freischalten (neu)
    VerbessernKnopf - der Knopf ueber die ganze Breite (neu)
  Es gibt jedes Bauteil genau einmal; eine Probe prueft das und dass beide
  Fenster sie aufrufen. Wer eines davon aendert, aendert beide Fenster.
- MONSTER LERNEN IHRE FAEHIGKEITEN WIE FIGUREN (Besitzer: "auch die Monster
  muessen Faehigkeiten freischalten und erlernen"). Im Kern teilen sich
  Figuren und Monster jetzt dieselbe Freischaltlogik (leiterVon,
  canUnlockAbility, unlockAbility); ein Monster wird unter "X:<id>" gefuehrt,
  wie sein Rang. Stufe, Kosten, Skillpunkte und die Sperre bis zum Erwachen
  der alten Magie gelten wie bei jeder Figur.
- IM GEFECHT TRAEGT EIN EIGENES MONSTER NUR, WAS ES GELERNT HAT. Wichtig fuer
  bestehende Spielstaende: wer schon Monster besitzt, sieht deren Faehigkeiten
  jetzt erst nach dem Lernen - bisher hatten sie alle von Anfang an.
- Das alte Raenge-Verzeichnis im Monsterfenster ist durch die Leiter ersetzt.
## 1.26.6
- DIE FELDER IM ZUGBILD TRAGEN DIE FARBE IHRES SYMBOLS (Besitzer: "wenn ich
  Faehigkeiten erlerne, werden die oben in der Felduebersicht angezeigt - da
  bitte die Felder gemaess dem Icon faerben"). GEFUNDEN, warum sie nicht
  passten: das Symbol nahm seine Farbe aus der Familienpalette in
  AbilityIcons.jsx, das Zugbild aber talentFarbe() aus abilities.js - zwei
  Quellen, zwei Farben fuer dieselbe Faehigkeit. Jetzt fragt das Zugbild beim
  Symbol nach (iconFarbe: die leuchtende Ringkante des Zeichens).
- BEIM GAMBIT SAGT DER TEXT "JEDERZEIT": seit v1.26.5 darf er Stossschlag und
  Ausweichen beliebig oft, der gemeinsame Text lautete aber "Darf 1x ...".
  Im Blatt und in der Freischalt-Feier steht fuer ihn jetzt "jederzeit"; fuer
  jede andere Figur bleibt es "1x".
- Vier neue Proben, zwei aeltere nachgezogen (sie verlangten die alte
  Farbquelle und den alten Textausdruck).

## 1.26.5
- DER GAMBIT HAT FUENF FAEHIGKEITEN, NICHT SECHS (Besitzer: "mach beim Gambit
  auch nur 5, grundsaetzlich nicht mehr als 5"). Blinzeln faellt: es ist die
  staerkste der sechs und steckt ohnehin bei 15 anderen Figuren.
- ZWEI SEINER ZUEGE WIRKEN BEI IHM DAUERHAFT (Besitzer: "beim Gambit, aber nur
  beim Gambit, Faehigkeiten, die ihm dauerhaft andere Zuege erlauben - nicht
  zu krass, aber mehr als einmal einsetzbar"). Stossschlag (gerade vorwaerts
  schlagen) und Ausweichen (ein Feld seitlich) darf er jederzeit, und ihr
  Einsatz schliesst sein Buch nicht. Fuer jede andere Figur bleiben beide ein
  Zauber je Partie. Beides bleibt bauernhaft - er gewinnt Beweglichkeit,
  keine neue Reichweite.
- Damit hat der Held vier dauerhafte Faehigkeiten (Stossschlag, Ausweichen,
  Sturmlauf, Maskerade, dazu Fruehe Kroenung) und keinen Zauber je Partie
  mehr. Vier Proben in test_zauber sichern es, darunter die Gegenprobe, dass
  jede andere Figur weiterhin nur einmal darf.

## 1.26.4
- DER GAMBIT SPRANG ZURUECK (Besitzer: "das Angriff und Leben springt
  teilweise zurueck und verhaelt sich gar nicht wie es sollte" - und "nur in
  der letzten Stufe duerfen Rot und Blau sich beruehren"). GEMESSEN: der Kern
  rechnet das Heldenbudget schon ein (2/1 auf Stufe 1 bis 26/10 auf Stufe 20).
  Blatt, Kachel und Zuwachsanzeige skalierten AUF JEDER STUFE noch einmal auf
  36 hoch, von der jeweiligen Stufe aus. Das Blatt zeigte 24/12 auf Stufe 1,
  27/9 auf Stufe 2 und 25/11 auf Stufe 5 - immer volle 36, dazwischen
  rueckwaerts, und der Ring war auf jeder Stufe voll. Jetzt gilt der Kern
  unveraendert, an allen drei Stellen.
- DIE ALTE STAFFEL IST WEG: an der Verbessern-Zeile stand noch hpAt = BASE_HP
  + (l-1) und atkAt = BASE_ATK + floor((l-1)/2) - das "+1 Angriff alle zwei
  Stufen" von vor v1.22.0. Was diese Zeile als Zuwachs nannte, war deshalb ein
  anderer Wert als der, den die Figur beim Klick bekam.
- DIE VERBESSERN-ZEILE (Besitzer: "Stufe 1 zu 2 weglassen und den Knopf
  mittig ueber die gesamte Breite"): kein Stufentext mehr, der Knopf ueber die
  volle Breite. Was man bekommt, steht nur noch einmal - in den Wertkaesten.
- ZWEI PROBEN, AN ALLEN FIGUREN: Leben und Angriff steigen nur und sinken nie,
  und Rot und Blau beruehren sich erst auf der Hoechststufe.
- EIGENER FEHLER IN DER KETTE, und er muss hier stehen: eine Probe in
  test_anim ("das Rueckblickfenster zeigt Bild, Namen und Werte") verlangte
  noch die Perlen und FIEL SEIT v1.25.4. Sie schreibt "not ok" statt "FAIL",
  und ich habe die Ergebnisse nach "FAIL" durchsucht statt den Rueckgabecode
  von npm test zu pruefen. Die Meldungen "27 Suiten gruen" fuer v1.25.4 bis
  v1.26.3 waren deshalb falsch. Die Probe prueft jetzt die Werte in den
  Bandfarben; npm test endet mit Rueckgabecode 0.

## 1.26.3
- DER VERBESSERN-KNOPF STEHT IN DER BUEHNE (Besitzer: "nicht unterhalb von dem
  Bund, sondern ganz oben im oberen Fenster, unterhalb von Angriff und Leben -
  dort sieht man ja, was man bekommt"). Die Zeile "Stufe 1 -> 2 / Verbessern"
  wird jetzt als Eigenschaft an die Buehne gereicht und unter den
  Wertkaesten gezeichnet; unten steht sie nur noch in der kleinen Fassung.
  Weil Figurenblatt und Monsterfenster dasselbe Bauteil benutzen, gilt das
  fuer beide.
- DIE BUEHNE TRAEGT DEN FARBTON DER FIGUR (Besitzer: "die Farbgebung, die du
  auf der Uebersicht jeder Figur gibst, tust du im Fenster nicht auf den
  Hintergrund beziehen"). Dieselbe Schicht wie auf der Kachel: der Ton der
  Figur im Mischmodus color, Figuren 30 %, Monster 45 %.

## 1.26.2
- DIE LAUTSTAERKE BLEIBT (Besitzer: "Merk dir endlich mal pro Profil die
  Sound- und Musiklautstaerke"). GEMESSEN, warum sie verloren ging: der
  Regler schrieb musikLaut und klangLaut korrekt ins Profil, Musik und Klang
  lasen sie korrekt. Aber ein Profil liegt an ZWEI Orten - als `profile` und
  im Spielstand unter `save:<Konto>:<Stand>`. Beim Laden und Wechseln schreibt
  der Spielstand sein eigenes Profil zurueck, und dort standen die
  Lautstaerken nie. Gesetzt 35 % Musik und 60 % Klang, neu geladen: beide weg.
- Die Lautstaerke gehoert nicht zum Spielstand - man will sie einmal fuer
  sich, nicht je Stand. Sie liegt jetzt in einem eigenen Eintrag
  (gambit:laut:v1), den kein Spielstandwechsel ueberschreibt. Gegenprobe:
  gesetzt, neu geladen, Spielstand gewechselt - 35 % und 60 % stehen noch.
  Das Profilfeld bleibt als Rueckfall fuer alte Staende.
- Steht ein Regler auf 0, ist die Klangart jetzt auch wirklich aus - vorher
  hing das an einem zweiten Schalterfeld, das beim Laden ebenso verloren ging.

## 1.26.1
- DAS MONSTER WAECHST IN SEINE WERTE HINEIN (Besitzer: "Warum haben die
  Monster schon von Beginn an so viel Leben? Das macht keinen Sinn").
  GEFUNDEN: bossSpecLeveled ADDIERTE auf die Werte aus bosses.js - die sind
  aber seit v1.25.5 die Werte der HOECHSTSTUFE (24 Punkte wie jede eigene
  Figur). Ein Monster stand auf Stufe 1 also schon voll da und wuchs darueber
  hinaus. Bei einer eigenen Figur ist es umgekehrt: werteBeiStufe rechnet vom
  Verhaeltnis Stufe zu Hoechststufe herunter.
  JETZT GENAUSO: Stufe 1 traegt 40 % des Budgets, Stufe 5 die vollen 24.
  Gemessen, Waechter: 8/2 · 10/3 · 13/4 · 16/4 · 19/5. Der Geist, gleich
  stark aber anders verteilt: 2/8 · 2/11 · 3/14 · 3/17 · 4/20.
- Gerundet wird erst das Leben, dann der Angriff als Rest - sonst ergeben zwei
  Aufrundungen 25 statt der beschlossenen 24.

## 1.26.0
- JEDES MONSTER HAT EINEN AUFSTIEGSPLAN (Besitzer: "Ich moechte die Bedienung
  des Monsterfensters genau gleich - dementsprechend musst du diese zwei
  Faehigkeiten auf die fuenf Stufen verteilen"). Bisher standen die
  Faehigkeiten eines Monsters fest und waren von Anfang an da. Jetzt traegt
  jedes Monster denselben Plan wie eine eigene Figur, nur kuerzer: fuenf
  Stufen, die erste Faehigkeit auf Stufe 2, die zweite auf Stufe 4. 24 von 25
  haben eine Sprosse (b14 hat heute keine Faehigkeit); die zweite Sprosse
  steht leer, bis die neun Monstertalente im Kern wirken.
- NOCH OFFEN, und der eigentliche Rest der "gleichen Bedienung": das
  Monsterfenster muss diesen Plan auch ZEIGEN und BEDIENEN - Trainingsleiter
  und Freischalten wie im Figurenblatt statt der alten Range- und
  Verbessern-Zeile. Die Daten dafuer stehen jetzt.

## 1.25.9
- DAS MONSTERFENSTER TRAEGT DIESELBE BUEHNE WIE DAS FIGURENBLATT (Besitzer:
  "Ich wollte doch bei allen Monstern genau das gleiche Design wie bei meinen
  Figuren"). Kulisse, Eckverzierungen, Figur mit Sockelband, Name und Haus
  darunter, rechts das Zugbild und die Faehigkeitszeichen, Stufenanzeige mit
  Emblem, der Satz mittig, die Wertkaesten. Es ist DASSELBE Bauteil, nichts
  nachgebaut.
- DAFUER IST DIE BUEHNE EIN EIGENES BAUTEIL GEWORDEN (BlattBuehne). Bisher war
  sie in das Figurenblatt eingebacken und las dessen lokale Groessen; jetzt
  hat sie Eigenschaften, und Figurenblatt und Monsterfenster rufen sie beide
  auf. Was ein Monster nicht hat - Bund, Leiter zum Waehlen - laesst es weg.
- Das alte Monsterfenster (Bild links, Text rechts, Zugbild und
  Faehigkeitenliste weiter unten) ist damit ersetzt. Die Range- und
  Verbessern-Zeile darunter bleibt vorerst, bis die Bedienung ueber den
  Aufstiegsplan eins zu eins nachgezogen ist.
- Eine Probe, die die Bundtafel im Monsterfenster verlangte, prueft jetzt das
  Gegenteil: Monster haben keinen Bund (Besitzerentscheid), dafuer dieselbe
  Buehne.
- GEFUNDEN: die package-lock stand seit v1.25.6 auf einer alten Versionsnummer
  und liess eine Probe fallen - nachgezogen.

## 1.25.8
- HARTE KANTE AM LILA-FELD (Besitzer: "bitte Lila noch mit einem Verlauf
  ausstatten mit harter Kante ins Schwarze am Rand von dem Feld"): innen ein
  weicher Verlauf, aussen ein klarer Schnitt an der Feldkante statt des
  Auslaufens ins Nichts.
- MEHR LUFT UNTER ALLEN BRETTFIGUREN: die gemeinsame Hebung von 4 auf 5,2 %.
  Gemessen danach: Bauer 9,7 px zur Feldkante (vorher 8,7), Gambit 10,9.
- DIE OFFIZIERSREIHE BLEIBT rund 3,5 px tiefer als Bauer und Gambit - und die
  URSACHE IST JETZT GEMESSEN statt vermutet: das Band haengt um
  (Bandhoehe - Standflaeche) unter die Bodenkante, und dieser Ueberhang ist
  bei jeder Figur anders. Bauer 0 px (Band 44, Standflaeche 49), Springer
  10 px (44 gegen 34), Koenig 7, Laeufer 6, Turm 3, Dame 3. Zwei Versuche, das
  herauszurechnen, haben NICHTS bewegt: der Versatz wird als Prozent der
  Elementhoehe gesetzt, und die Umrechnung von Bildpixeln dorthin stimmt noch
  nicht - die Figur wird groesser gezeichnet als ihre Zelle (121 bis 143 %),
  der Teiler ist also nicht die Bildhoehe. Das gehoert an EINER Figur sauber
  ausgemessen, nicht mit einer dritten Formel geraten.

## 1.25.6
- DIE SCHILDE SIND RAUS (Besitzer: "Schild ist also immer Leben. Aber das gibt
  es doch mit jeder Stufe. Ich glaub Schild ist unnoetig und doppelt").
  62 Schildsprossen aus allen Aufstiegsplaenen entfernt. GEMESSEN danach:
  alle 25 normalen Figuren haben dieselbe Punktsumme - 24. Die Grundwerte aus
  den Stufen ergeben sie von sich aus; die frueheren 28 kamen nur daher, dass
  fast jede Figur zwei Schildsprossen hatte, die je +2 Leben oben drauflegten.
- WEIL `shield` damit ueberall 0 IST, verschwinden die Schilde von selbst aus
  Anzeige, Lehrtexten, Bannern und aus der KI-Bewertung (evaluate.js wichtete
  sie beim Zugsuchen) - ohne dass an vierzehn Stellen einzeln gerechnet werden
  musste.
- DER KOENIG IST KEIN SONDERFALL MEHR. Er war die EINZIGE Figur ohne Schilde
  und landete deshalb bei 24 statt 28 - daher sein unsichtbarer blauer Balken
  aus v1.25.3. Jetzt stimmt er mit allen ueberein.
- DER DRACHE STEHT BEI 48, genau da, wo der Besitzer ihn haben wollte.
- NOCH OFFEN: der Gambit. Sein Vorsprung steckte in NEUN Schildsprossen
  (35 Leben statt 17); ohne sie faellt er auf 24 wie jede andere Figur. Sein
  Budget 36 muss als ZAHL gesetzt werden, nicht ueber versteckte Sprossen.
- Vier Proben nachgezogen, keine abgeschwaecht.

## 1.25.5
- DIE NORM IST 24, NICHT 28 (Besitzerentscheid "alle 24, Gambit 36, Drache
  48" - nach seiner Beobachtung, die Schilde seien doppelt). GEMESSEN, dass er
  recht hat: OHNE Schilde landet jede eigene Figur auf genau 24 Punkten -
  Alchemist 18+6, Amazone 9+15, Attentaeter 4+20, Bauer 17+7, Springer 11+13.
  Die Grundwerte aus den Stufen ergeben die Summe von sich aus; die 28
  entstanden nur, weil fast jede Figur ZWEI Schildsprossen hat, die je
  +2 Leben obendrauf legten. Die Schilde tun also nichts, was die Stufen nicht
  schon tun.
- ALLE 25 MONSTER STEHEN JETZT AUF 24 (vorher 28 aus v1.25.1) - mit 28 lagen
  sie ueber den Figuren. Die Verteilung bleibt: Waechter 20/4, Hetzer 17/7,
  Brutmutter 21/3.
- NOCH OFFEN aus demselben Entscheid: die Schilde selbst muessen aus Werten
  und Aufstiegsplan verschwinden, der Gambit braucht dann sein eigenes Budget
  36 (heute stecken seine 35 Leben in NEUN Schildsprossen statt zwei), der
  Drache 48 (er steht ohne Schilde schon dort). Danach ist der Koenig kein
  Sonderfall mehr - er ist heute die einzige Figur ohne Schilde und landet
  deshalb bei 24 statt 28, was seinen unsichtbaren blauen Balken erklaerte.

## 1.25.4
- DIE PERLEN SIND UEBERALL WEG (Besitzer, mehrfach: "Die Bubbles Angriff und
  Leben will ich nicht sehen - egal wo, auch in der Akademie und ueberall").
  Brett, Grossansicht, Kampfleiste, Kampagnenschirm, Galerie, Tutorial und
  Hofstaat: die Zahlen stehen jetzt schlicht in den Farben des Sockelbandes,
  Rot fuer Leben, Blau fuer Staerke. StatOrbBadge wird nirgends mehr
  aufgerufen.
- DABEI EINEN ABSTURZ GEFUNDEN UND BEHOBEN: der Import der Perle war im
  Hofstaat schon entfernt, ACHT Stellen benutzten sie aber weiter - das
  Figurenblatt brach beim Oeffnen ab ("Da ist etwas schiefgelaufen").
  Gefangen hat das die Messprobe, die den Schimmer am GEOEFFNETEN Blatt sucht
  und nichts mehr fand; sie meldet jetzt wieder drei verschiedene Farben.
- EINE RANGFORMEL FUER DEN GAMBIT, NICHT ZWEI (Besitzer: "Gambit hat in der
  Uebersicht bei Stufe 10 ein anderes Bild als im offenen Pop-up"). In
  paintedArt stand noch die alte Zehnerblock-Rechnung, das Blatt rechnet seit
  v1.24.0 mit den zwanzig Stufen. Bei Stufe 10 ergab das Rang 1 gegen Rang 3,
  bei Stufe 20 Rang 2 gegen Rang 6 - zwei Formeln, zwei Gemaelde. Eine neue
  Probe vergleicht beide Formeln ueber alle zwanzig Stufen.
- MEHR LUFT UNTER DER ZWEITEN ZEICHENREIHE im Figurenblatt (Besitzer: "das
  wirkt zu gedrungen").

## 1.25.3
- AUF DER HOECHSTSTUFE BERUEHREN SICH ROT UND BLAU (Besitzer: "In der letzten
  Stufe sollten sich der blaue und der rote Balken immer beruehren, bei jeder
  Figur"). GEMESSEN, warum das mit dem festen Budget 28 nicht ging: nicht jede
  Figur kommt auf 28. Der Koenig bekommt als einziger KEINE Schilde und landet
  bei 21+3 = 24 - sein Ring fuellte nur 86 %, Blau blieb ein Splitter von
  10,7 %, praktisch unsichtbar. Der Gambit kommt auf 42, der Drache auf 54.
  Das Budget ist deshalb keine feste Zahl mehr, sondern das EIGENE Gesamtmass
  der Figur auf ihrer Hoechststufe; der Aufrufer kennt es und reicht es
  herein. Gemessen danach: Koenig 88/13, Springer 54/46, Drache 87/13 - alle
  genau 100 %.
- DER FLAGGENTRAEGER BEKOMMT SEIN BAND. Er stand unter "ohne Band", weil seine
  Kennung "standard" nach Kulisse klingt - er ist aber eine Figur wie jede
  andere. Ohne Band bleiben nur Schatzkammer und Haendler, die wirklich keine
  Figuren sind.
- Vier Proben sichern die Beruehrung bei 21/3, 15/13, 47/7 und 35/7.

## 1.25.2
- DIE NEUN MONSTERFAEHIGKEITEN SIND ANGELEGT (Besitzer: "Die Faehigkeiten,
  die die Monster haben, sollte grundsaetzlich keine der anderen Figuren
  haben"): Gift (waechst mit der Stufe), Blenden (alle Gegner im Umkreis von
  zwei Feldern setzen eine Runde aus), Aderlass (nimmt Hoechstleben bis zum
  Ende der Partie), Schrecken, Wegelagerei (stiehlt Gold, waechst mit der
  Stufe), Steinhaut, Widerhall, Unsterblich, Geistwandel.
  GEMESSEN, warum es neue braucht: die vier, die Monster bisher tragen,
  gehoeren alle auch Figuren - Blinzeln bei 15 von 27, Bollwerk bei 12,
  Regeneration bei 11, Lebensraub bei 9. Sie den Figuren wegzunehmen waere
  kein Umbau, sondern eine andere Leiter fuer das halbe Spiel.
- SIE TRAGEN live: false - angekuendigt, im Kern noch nicht gebaut. Der
  Eintrag steht, damit Blatt, Akademie und Karte denselben Text zeigen; die
  Zuordnung zu den 25 Monstern folgt, sobald die Wirkung steht. Sonst nimmt
  man ihnen ihre heutigen, funktionierenden Faehigkeiten und tauscht tote ein.
- EINE NEUE PROBE sichert genau das: kein angekuendigtes Monstertalent darf
  schon an einer Figur haengen. Sie hat dabei einen Altbestand gefunden -
  chain und pull sind seit laengerem angekuendigt UND vergeben; das gehoert
  getrennt angesehen.
- ZWEI NEUE MARKEN, Beute und Zehrung, mit eigenen Farben. Ohne sie fiel die
  Farbe der Goldfaehigkeit zufaellig mit dragon_flight2 zusammen - gefangen
  von der Probe "alle Talente haben eine eigene Farbe".

## 1.25.1
- ALLE 25 MONSTER TRAGEN DAS PUNKTEBUDGET DER FIGUREN (Besitzer: "Hauptsache
  wir haben am Ende die gleiche Logik wie bei den Figuren"). GEMESSEN, warum
  das noetig war: jede eigene Figur kommt auf ihrer Hoechststufe auf 28 Punkte
  (Bauer 21+7, Turm 22+6, Springer 15+13, Dame 18+10, Koenig 25+3), die
  Monster lagen zwischen 8 und 23 - Median 13, also im Schnitt halb so stark
  wie ein Bauer, und zwar ohne dass das je entschieden worden waere. Jetzt
  ueberall 28, bei unveraenderter VERTEILUNG: der Koloss 24/4, der Geist
  17/11, der Brandstifter 16/12. Alle 25 werden staerker, keines schwaecher.
  Gegengewicht bleibt, was der Besitzer dafuer vorgesehen hat: fuenf Stufen
  statt zehn, keine Leiter zum Waehlen, kein Bund - dafuer kauft man sie.
- Eine Probe stand auf den alten Werten des Bollwerks (11/2) und steht jetzt
  auf 24/4.

## 1.25.0
- DIE NAECHSTE STUFE ZEIGT, WAS SIE WIRKLICH BRINGT (Besitzer: "Da steht
  naechste +1, aber das stimmt teilweise gar nicht. Bei der einen geht es bei
  der naechsten Stufe plus 3 Angriff, bei der anderen plus 2 Leben"). Das "+1"
  war fest hingeschrieben. Die Werte wachsen aber am Verhaeltnis Stufe zu
  Hoechststufe, und die Schilde kommen sprungweise auf ihren eigenen Sprossen
  dazu - der Zuwachs ist bei jeder Figur und auf jeder Stufe ein anderer.
  GEMESSEN, Bauer: 1->2 bringt +1 Angriff und +4 Leben, 2->3 nur +1 Leben,
  3->4 wieder +1 und +4. Springer 3->4: +2 Angriff. Jetzt wird die naechste
  Stufe durch dieselbe Kernrechnung geschickt und die Differenz angezeigt -
  auf der Hoechststufe steht nichts mehr da.

## 1.24.9
- DER SCHADENSBLITZ (Besitzer: "Wenn eine Figur angreift, sieht man ganz kurz
  in Gelb, um wie viel dieser Angriff mich bei der Figur Leben gekostet hat" -
  dazu "eine zoomartige Zahl in der gleichen Farbe, die wirklich gross wird
  und beim Grosswerden verblasst"). Im Sockelband glimmt das Stueck gelb aus,
  das das Rot eben verloren hat, genau dort, wo es stand; darueber waechst die
  Zahl des Verlusts aus dem Feld heraus und vergeht dabei. 620 ms, beide
  Keyframes nur mit opacity und transform.
- DAFUER MUSSTE DIE ANZEIGE EIN GEDAECHTNIS BEKOMMEN: der Spielzustand kennt
  nur das Jetzt, nicht das Vorher. Die Figur merkt sich ihren letzten
  Lebenswert selbst und haelt die Differenz fuer die Dauer der Animation.
- ERST JETZT MOEGLICH: bis v1.24.6 war Rot ein Verhaeltnis, kein Lebensstand -
  ein Blitz haette einen Betrag gezeigt, der mit dem Schaden nichts zu tun
  hat. Seit das Band in Punkten rechnet, ist der verlorene Anteil genau der
  Schaden.
- Vier Proben in test_ui sichern das, darunter eine, die prueft, dass die
  neuen Keyframes ausschliesslich opacity und transform animieren.

## 1.24.8
- DIE KACHEL ZAEHLT DIE SCHILDE MIT (Besitzer, zum zweiten Mal gemeldet: "Im
  Pop-up, wo ich trainieren kann, ist der Lebensbalken immer noch anders vom
  Visuellen als in der Uebersicht - ein paar Figuren verhalten sich anders").
  GEFUNDEN: das Blatt rechnet maxHp = werteBeiStufe(...).hp + shield *
  SHIELD_HP, die Kachel rechnete nur werteBeiStufe(...) - OHNE Schilde. Beim
  Springer auf Stufe 10 mit drei Schilden sind das 11 gegen 17 Lebenspunkte:
  Rot 39 % gegen 57 % im Ring. Deshalb fielen genau die Figuren MIT
  Schildsprossen auf und die anderen nicht. Richtig ist die Fassung mit
  Schilden - sie sind dauerhaftes Leben und zaehlen im Gefecht mit; die
  Kachel zieht nach. Der Koenig hat keine Schildsprossen, bei ihm aendert
  sich nichts.
- DIE ORIGINALE AUS DER FAL-HISTORIE SIND GESICHERT: 268 Auftraege, 186
  Bildadressen, 185 geladen (279 Dateien mit den fruehen Rettungen). Sie
  liegen NICHT freigestellt vor, sondern mit gruenem Hintergrund - daraus
  laesst sich sauber neu freistellen. Genau hier lag der Fehler der alten
  Fassungen: beim Entfernen des Gruens wurde an Umhaengen und duennen
  Gliedmassen zu viel mitgenommen (boss-b22, boss-b25, boss-b14).

## 1.24.7
- KEINE BLASEN MEHR IM GEFECHT, SONDERN DER HOFWERT (Besitzer: "Die Bubbles
  Angriff und Leben will ich nicht sehen. Dafuer in klein den Hofwert"). Die
  zwei 38-px-Juwelen sassen ueber dem Brett und ueberdeckten im Hochformat die
  obere Figurenreihe. Leben und Angriff stehen ohnehin an jeder Figur im
  Sockelband - die Summe daneben war eine dritte Anzeige derselben Sache. An
  ihrer Stelle steht klein der Hofwert der Seite.
- MEHR ABSTAND NACH OBEN (Besitzer: "das Schachbrett ist zu nah an den oberen
  Buttons"). Die obere Figurenreihe ragt gemessen 49 px ueber die Brettkante
  und stiess an Zurueck und Aufgeben - 12 px Luft, ohne die Brettgroesse
  anzutasten.
- NOCH OFFEN, vom Besitzer gemeldet: die Faehigkeiten stehen DOPPELT (Pillen
  im Talentband und der Zeichen-Slider darunter); die Auswahl am Slider
  greift nicht sauber; die Schachfelder sind nicht perfekt ausgerichtet und
  in Welt 1 runder; die Freistellung von boss-b22, boss-b25 und boss-b14 ist
  im HQ-Original schon ausgefranst.
- GEFUNDEN: die fal-Auftragshistorie ist noch erreichbar (268 Auftraege, 186
  Bildadressen). Der Zugriff braucht rest.alpha.fal.ai/requests/ mit
  start_time und end_time, page ab 1 und den Parameter size statt limit.

## 1.24.6
- DAS BAND RECHNET IN PUNKTEN, NICHT IN PROZENTEN (Besitzer: "Es gibt bei
  jeder Figur immer irgendwie 100 Punkte ... wenn ich 80 Lebenspunkte habe und
  eine andere greift mit 20 an, hat die Figur danach noch 60. Einfach nur
  Subtraktion. Der blaue Balken bleibt immer fest."). Die Ringbreite IST das
  Punktebudget: Rot ist das Leben in Punkten, Blau die Staerke in Punkten, am
  selben Massstab. Schaden nimmt Rot Punkt fuer Punkt weg, Blau bleibt
  unberuehrt. GEMESSEN ist das Budget: jede normale Figur hat auf
  Hoechststufe 28 Punkte (Bauer 21+7, Turm 22+6, Springer 15+13, Dame 18+10,
  Koenig 25+3); Gambit 42, Drache 54. Deshalb max(28, maxHp + atk) - auf
  Hoechststufe die eigene Summe, darunter der Normmassstab, sodass eine Figur
  auf halbem Weg den Ring nur halb fuellt (gemessen 46 %).
- DAS KRAFT_GEWICHT VON 1,6 FAELLT WEG: Blau zaehlte 1,6-fach, damit stimmte
  keine Subtraktion. Ein Punkt ist ein Punkt.
- Fuenf Proben, die auf der alten Stufenfuellung standen, sind durch Proben in
  Punkten ersetzt: sechs Schaden nehmen genau sechs Punkte Rot (22 -> 16 von
  28), Blau ruehrt sich nicht, bei 0 Leben bleibt nur Blau.

## 1.24.5
- ROT IST EINE LEBENSANZEIGE, KEIN VERHAELTNIS (Besitzer: "Wenn der Balken
  10 mm breit waere und die Figur greift an, dann muss das Leben um
  entsprechend 10 sinken - und das tut es nicht"). GEMESSEN, warum nicht: Rot
  und Blau wurden aus dem AKTUELLEN Leben als Anteil an Leben + Kraft
  gerechnet. Sank das Leben von 20 auf 10, fiel Rot nur von 60 auf 43 % - und
  Blau WUCHS von 40 auf 57 %, obwohl die Kraft gleich blieb; bei 0 Leben war
  der Ring ganz blau. Das Band zeigte das Verhaeltnis, nicht den Schaden.
  Jetzt teilt sich der Ring nach dem VOLLEN Leben (das Profil der Figur, wie
  in der Uebersicht), und Rot schrumpft danach linear: halbes Leben, halbes
  Rot (68 -> 34 %), Blau bleibt (32 -> 32 %), bei 0 Leben ist das Rot weg.
  Drei Proben dazu in test_ui.

## 1.24.4
- WARUM DIE FIGUREN AUF DEM BRETT NIE ANGEPASST WURDEN - und jetzt sind. Das
  Element, das die Figur setzt, traegt die Atmen-Animation ggAtmen, und die
  animiert `transform`. Eine laufende Animation auf `transform` ueberschreibt
  die Inline-Eigenschaft `transform` vollstaendig, solange sie laeuft - sie
  laeuft endlos. Deshalb war jede Skalierung und jeder Versatz dort seit jeher
  wirkungslos: die Handtabelle PAINTED_FIT, die Seitwaertskorrektur der Dame,
  jede Hebung. Bewiesen mit einem fest eingetragenen Hebebetrag, der keinen
  Pixel bewegte. Loesung: die einzelnen Eigenschaften `translate` und `scale`
  statt `transform` - eine Animation auf `transform` laesst sie unangetastet,
  der Browser setzt beides zusammen. Danach bewegten sich die Figuren zum
  ersten Mal: Turm 88 -> 84 px, Bauer 75 -> 79 px.
- EIN MASS FUER ALLES: das Brett rechnet die gemessene Skalierung aus
  sockelband.json wie Hofstaat und Figurenblatt (Teller auf 136, Figur auf
  Bauernhoehe, Ausrichtung auf den Teller). Die Handtabelle bleibt im Code;
  FIT_GEMESSEN = false holt sie zurueck. Der Versatz in Prozent der
  Figurenhoehe, nicht in em - Einheiten sauber getrennt.
- DER RING STEHT IMMER, auch ohne Werte: eigene Figuren weissgrau, Gegner
  schwarz. Vorher 0 Baender auf dem Brett, jetzt 32.
- GEGNERFELDER VIOLETT GETOENT statt Kontur - die Kontur bleibt dem
  Anwaehlen vorbehalten. Abgeschwaecht und zum Rand auslaufend.
- EINE WERTEQUELLE FUER KACHEL UND BLATT: das Blatt las leben=1 und
  kraft=atk/12 (meine Erfindung), die Kachel rohrAnteile(). Jetzt beide
  rohrAnteile().
- DAS BAND IM FIGURENBLATT SITZT WIE AUF DER KACHEL: Bild und Band in EINEM
  Kasten, der die Verwandlung traegt. Gemessen 0/0/0/0 px Abweichung.
- OFFEN, gemessen: die Offiziersreihe sitzt noch rund 4 px tiefer als Bauer
  und Gambit (Luft 4,7-6,1 gegen 8,7-9,9 px); die obersten 8 px der
  hoechsten Koepfe der gegnerischen Reihe schneidet ein Rahmen mit
  overflow hidden ab; die harte Kante des Lilas am Feldrand fehlt.
- Fuenf Proben in test_ui standen auf "gleiches y" fuer Bauer und Gambit-
  Raenge; mit der gemessenen Anpassung ist die BODENLINIE das Mass, nicht die
  Zahl - sie pruefen jetzt, wo die Bodenkante landet.

## 1.24.3
- DER 8x8-UMBAU IST DRIN (Besitzerentscheid "Tabula Rasa" vom 16.9.). Arena
  (10x10) und Scharmuetzel (6x6) sind gestrichen; es bleiben Klassik, Hof und
  Schneise, alle 8x8. FILES/RANKS von 10 auf 8, die Grundreihe auf die
  Schachreihe R N B Q K B N R, die Flankenplaetze von [2,7] auf [1,6].
  Gemessen: Brett 160 Felder mit 64 Figuren, Stationen 210 Klassik / 181 Hof /
  138 Schneise, in Summe 529.
- DIE ZWEIER-GRENZE: Laeufer, Springer und Turm duerfen zweimal aufgestellt
  werden, alles andere einmal. Sie war vorher nicht vergessen, sondern
  unmoeglich - die alte Arena-Grundstellung war zehn Felder breit und trug
  VIER Springer; eine Zweier-Grenze haette die eigene Startaufstellung
  verboten.
- WIEDERGEFUNDEN: dieser Umbau war am 16.9. gebaut und dann verschwunden. Er
  lag nicht auf dem Zweig umbau-8x8 (dort steckte die Eckverzierung unter
  falschem Namen), sondern in stash@{1}. Von dort sind Karten, Kern,
  Generator, Kampagnenstaffelung, Profil-Migration und sieben Probendateien
  uebernommen - leveling.js NICHT, weil der Stash acht Fassungen alt ist und
  die Gambit-Kuerzung zurueckgedreht haette; seine drei Aenderungen sind
  einzeln portiert.
- Eine Probe stand noch auf der Arena-Zehnerreihe mit vier Springern und
  steht jetzt auf der Schachreihe mit acht Plaetzen.

## 1.24.2
- DAS BAND IM FIGURENBLATT SITZT JETZT WIE AUF DER KACHEL (Besitzer: "auch
  dort hast du dieses Band anders, teilweise bei der gleichen Figur"). Mein
  Fehler, gemessen: im ersten Bau trug das BILD die Skalierung, das Band
  daneben aber nicht - es lag unskaliert ueber einem skalierten Bild. Auf der
  Kachel stehen Bild und Band in EINEM Kasten, und der Kasten traegt die
  Verwandlung; genau so jetzt auch im Blatt. Gemessen, Band gegen Bild: Kachel
  0/0/0/0, Blatt 0/0/0/0 px. Der Schimmer sitzt auf dem Kasten, damit das Band
  mitleuchtet; die Messprobe folgt ihm dorthin.

## 1.24.1
- DER GAMBIT BLEIBT UNTER DEM DOPPELTEN (Besitzer: "Er darf nicht doppelt so
  viel haben ... ein bisschen weniger als der Drache"). Gemessen auf
  Hoechststufe: Drache hp 47, Gambit mit elf Schilden hp 39 - unter dem
  Drachen, aber mehr als das Doppelte der Dame (16) und des Mittelwerts aller
  Figuren (18). Zwei Schilde weniger (Stufe 11 und 16) bringen ihn auf hp 35:
  unter dem Doppelten des Mittels, 1,5-mal der Bauer, deutlich unter dem
  Drachen. Neun Schilde statt elf.

## 1.24.0
- DAS FIGURENBLATT NACH ENTWURF 8 GEBAUT. Acht Runden Entwurf mit dem
  Besitzer, jede an gerenderten Blaettern entschieden: EINE Buehne mit der
  Kulisse und den Eckverzierungen traegt alles; die Figur links, ihr Name
  darunter; rechts das Zugbild und darunter die Faehigkeitszeichen als
  abgerundete Vierecke, fuenf je Reihe, leere Plaetze als gestricheltes
  Viereck; die Stufenanzeige oben rechts mit dem Emblem an ihrem Ende; der
  Satz mittig unter beiden Spalten; Angriff und Leben im Rot und Blau des
  Sockelbandes mit dem Zuwachs klein und violett im selben Kasten. Das
  Zugbild stand vorher ZWEIMAL auf dem Blatt - der eigene Abschnitt weiter
  unten faellt im grossen Blatt weg.
- DER GRAND GAMBIT HAT ZWANZIG STUFEN, NICHT SECHZIG (Besitzer, mehrfach:
  "Ein Gambit soll keine 60 Stufen haben, es duerfen maximal 20 sein").
  GEMESSEN, warum das keine Kosmetik war: die Werte skalieren am Verhaeltnis
  Stufe/Hoechststufe, also stand er auf Stufe 60 bei hp 17 / atk 7 - genau da,
  wo ein Bauer auf Stufe 10 steht. Der Weg kostete ihn 328 Fertigkeitspunkte
  gegen 9 beim Bauern, Faktor 36 fuer dasselbe Ziel. Sechzig Stufen waren kein
  Vorteil, sondern eine Strafe. Jetzt 59 SP fuer alle neunzehn Schritte, rund
  das Sechsfache eines Bauern.
- DIE SECHS RAENGE BLEIBEN ALLE ERREICHBAR: sie haengen nicht mehr an
  Zehnerbloecken, sondern verteilen sich auf die zwanzig Stufen (I 1-3,
  II 4-6, III 7-10, IV 11-13, V 14-16, VI 17-20). Ohne das waeren vier der
  sechs Gemaelde nie zu sehen gewesen.
- DIE SCHILDE lagen auf Stufe 12 bis 58 - neun davon waren nach der Kuerzung
  unerreichbar. Sie sind im gleichen Abstand auf 10 bis 20 umgerechnet; der
  Held traegt dieselben elf Schilde wie vorher, nur in zwanzig Stufen.
- GEWICHTUNG NACHGERECHNET, wie der Besitzer es verlangt hat. Auf
  Hoechststufe: Gambit hp 39 / atk 7 (11 Schilde), Bauer hp 23 / atk 7,
  Turm hp 22 / atk 6, Springer hp 17 / atk 13, Dame hp 16 / atk 10. Der Held
  ist also die Mauer, Springer und Dame sind die Klingen - das liest sich
  stimmig. Offen bleibt, ob seine elf Schilde gegen die Dame mit einem zu
  viel sind; das ist eine Entscheidung, keine Messung.

## 1.23.9
- DER SOCKEL WIRD NACH UNTEN VERLAENGERT (Besitzer: "Du nimmst als Mass immer
  die Oberkante ... und nach unten tust du nichts aus dem Bild ablesen, sondern
  machst einfach eine feste Pixelanzahl, sodass jeder gleich hoch ist. Ich
  moechte nicht, dass du die Unterkante des Sockels in irgendeiner Weise zu
  lesen versuchst, sondern eine saubere Parallelverschiebung von der oberen
  gemessenen Kontur nach unten."). Genau so gebaut: die untere Kontur ist
  dieselbe Ellipse wie die obere, nur tiefer. Die gemalte Unterkante wird nicht
  mehr gelesen; das Band haengt ruhig darunter hinaus.
- DIE HOEHE IST EIN BILDSCHIRMMASS, kein Bildmass: 46 px, geteilt durch
  sockelSkalierung und figurStreckung. Ohne diese Division waere das Band beim
  Hetzer (rx 249) halb so hoch wie beim Springer - gemessen lagen die Hoehen
  zwischen 17,2 und 24,8 px, jetzt zwischen 17,7 und 21,8 (Spanne 7,6 -> 4,1).
  Der Rest kommt aus der Rundung auf ganze Bildpixel und der Kappung von
  sockelSkalierung bei 0,55; die Probe laesst deshalb 4,5 px zu, nicht 0.
- DIE BODENLINIENPROBE MISST JETZT DIE BODENLINIE, nicht den untersten Punkt
  des Bandes. Der haengt seit der Verlaengerung bei jeder Figur anders tief
  (Besitzer: "man sieht die Unterkante des Sockels nie"). Das Band bringt die
  gemalte Bodenlinie als data-bodenlinie mit; gemessen stehen jetzt alle 32
  Figuren auf 28,4 px ueber der Kachelkante - Spanne 0,0.
- EIGENER IRRWEG, dem Besitzer zuerst als Frage gezeigt: ich hatte zwei
  Lesarten von "gleich hoch" gebaut - gleiche Hoehe mit unterschiedlich tiefen
  Unterkanten, und gemeinsame Unterkante mit unterschiedlichen Hoehen. Die
  zweite las die gemalte Unterkante und machte boss-b22 zu duenn. Richtig ist
  die erste.

## 1.23.8
- DAS SOCKELBAND SITZT AUF DER GEMESSENEN STANDFLAECHE (Besitzer: "Mir geht es
  darum, dass die Rundung sauber tangential an der Hinterseite uebereinstimmt -
  gerne nochmal fuer alle pruefen"). Bis hierher war die Bandhoehe 17 % der
  TELLERBREITE, eine Zahl, die mit dem gemalten Teller nichts zu tun hat.
  GEMESSEN: sie stand im Mittel 20 px ueber dem gemalten Ring - beim Engineer
  11, bei boss-b01 48, bei der Schatzkammer 84. Genau das war die Kante, die
  oben nicht ueberlief.
- NEU GEMESSEN FUER ALLE 69 GEMAELDE (scripts/messe_tellerkante.py). Der alte
  Hilfswert `ring` taugte nicht: er sucht ueber die FARBSAETTIGUNG einer
  einzigen Spalte und faellt auf grauem Stein auf seinen Notnagel 8 zurueck -
  bei 29 der 69 Figuren. Jetzt zaehlt der KNICK im Breitenverlauf: der Teller
  ist leicht konisch und verliert nach oben langsam an Breite (Gambit-t2 noch
  97 % nach 42 px), erst wo der Koerper beginnt, faellt sie steil ab. Median
  der Tellerhoehen 43 px statt 16.
- DREI IRRWEGE, die es bis hierher gebraucht hat: (1) staerkster Helligkeits-
  sprung entlang der Ellipse - er fand bei vielen das untere Zierband statt
  des grauen Abschlusses oben; (2) Tellerfarbe ablesen und nach oben laufen -
  die Probestelle liegt im Schatten des Tellerbogens, Warlock kam mit 7 px
  statt 50; (3) eine feste Breitenschwelle - sie traf die untere Stufe. Dazu
  ein eigener Rechenfehler: auf die gefundene Zeile hatte ich noch ry addiert,
  obwohl die Silhouette genau zwischen den MITTEN beider Ellipsen am breitesten
  ist. Der Alchemist kam damit auf 4 px statt 37.
- ZWEI HANDWERTE, als solche markiert (`tellerVonHand`): boss-b02 auf 75 - sein
  Sockel faellt in zwei Stufen, der Automat nahm die erste; der Besitzer hat an
  einer Kandidatenleiter 75 bestaetigt. gambit-t2 auf 45, wie bei gambit-t3
  gemessen (deckungsgleiches Breitenprofil, der Automat fand einen Scheinknick
  bei 14).
- SCHATZKAMMER, HAENDLER UND STANDARTE TRAGEN KEIN BAND MEHR (Besitzer: "das
  sind ja keine Figuren").

## 1.23.7
- DER RISSBODEN STEHT WIEDER IM MENUE (Besitzer: "Mach mal den beigen
  Hintergrund weg. Dahinter sieht man den Hintergrund, der es sein sollte,
  sowie die anderen, die abhaengig davon kommen, wo man in der Kampagne ist").
  GEFUNDEN: die gesuchten Bilder heissen riss-01 bis riss-10 - Schachbrett
  unten, oben Schwarz, und der Riss waechst von einem Glimmen bis zur
  klaffenden Spalte. Sie liegen seit jeher im Baum und werden vom Vorlader bei
  JEDEM Start geladen - gezeigt hat sie nie jemand. Das Menue trug seit v1.9.1
  stattdessen ground-01..12, und das sind Gelaendekacheln der Weltkarte:
  Wiese, Acker, Wald, Sand. Genau daher das Beige. Jetzt waehlt rissBoden()
  nach Kapitel; die letzten drei Kapitel teilen sich den weitesten Riss.
  Gegengeprueft im Chromium: das Menue laedt jetzt riss-01 statt
  ground-01.carved.

## 1.23.6
- HOECHSTENS VIER ZEICHEN AUF DER KACHEL, der Rest als stille Ziffer
  (Besitzer: "wenn man es wissen will, muss man halt auf die Karte druecken,
  fertig" - und nach dem Bildblatt: "machen wir max. 4 + 6"). GEMESSEN an der
  gebauten Fassung: Kachel 119x179, die Spalte beginnt 7 px unter der Kante,
  der Name steht bei 153,1 - 146 px frei. Bei 19 px Zeichen passen sechs
  hinein, bei 21 px ebenfalls sechs; kleiner zu werden gewinnt kein einziges
  Zeichen dazu. Sechs klebt mit 5 px am Namen, vier laesst 65 px Luft.
  Nachgemessen nach dem Umstellen: tiefste Unterkante 114,0 px, der Name
  beginnt bei 153,1 - die Spalte kommt ihm nicht mehr nahe. Die Dame hat zehn
  Faehigkeiten, die Amazone neun - sie tragen jetzt vier Zeichen und "+6"
  bzw. "+5". Das Antippen der Ziffer oeffnet dasselbe Blatt wie das Antippen
  der Kachel.
- DER SCHIMMER HINTER DER FIGUR TRAEGT IHRE FARBE (Besitzer: "nimm dafuer
  bitte auch die Farbe, die du fuer das Emblem holst"). Bisher schien hinter
  JEDER Figur dasselbe Riss-Violett. Gemessen am geoeffneten Blatt: Springer
  rgba(158,29,5), Koenig rgba(5,71,158), Dame rgba(158,46,49). Gegenprobe mit
  der alten Zeile: dreimal dasselbe rgba(122,60,255) - die Probe faellt.
  Monster nehmen den Akzent ihres Meisters; wo keine Farbe bekannt ist,
  bleibt es beim Riss.

## 1.23.5
- DER HINTERGRUND IST WIEDER DA - Kapitelbild UND Rissboden. Besitzerbefund,
  mehrfach und zu Recht: "Du hast es immer noch nicht geschafft, diesen
  Hintergrund im Hauptmenue sichtbar zu machen." GEMESSEN statt vermutet:
  beide Ebenen lagen im Baum, ihre Bilder waren geladen, Deckung 1 - und sie
  malten NULL Pixel (dasselbe Band zweimal fotografiert, mit und ohne die
  Ebene: groesster Unterschied 0). Ursache ist eine Malregel: der Grund des
  body wandert nur dann unter alles, wenn das HTML-Element keinen eigenen
  hat. index.html setzte Schwarz auf BEIDE - damit blieb der Grund des body
  sein eigener Kasten, und der wird NACH allen Ebenen mit negativem z-index
  gemalt. Beide Hintergruende liegen auf z -1, wurden also gemalt und sofort
  zugedeckt. Jetzt traegt das HTML den Grund, der body keinen.
- EINE PROBE, DIE DAS NIE WIEDER DURCHLAESST. Alle bisherigen Proben haben
  gefragt, ob die Ebene im Baum liegt - das stimmte jedes Mal. Die neue Probe
  fotografiert denselben Schirmausschnitt mit und ohne die Ebene und
  vergleicht die Pixel (Pillow). Gemessen: Kapitelbild 93.603 Pixel,
  Rissboden 56.803. Gegenprobe mit der alten Regel: beide null.
- DIE ECKVERZIERUNG KLEINER UND TIEFER IN DER ECKE (Besitzer), 10 px statt 14
  bei Abstand 1 statt 3 - damit Stufen-Abzeichen und Talente selbst weiter
  nach aussen ruecken koennen: beide jetzt auf 7/7 statt 10/10.
- ALLE FAEHIGKEITEN AUF DER KACHEL (Besitzer: "ich habe beim Kanzler alle
  aktiviert, es werden aber nicht alle angezeigt; die muessten die ganze Karte
  links runter fuellen"). Die Spalte zeigte stur die ersten zwei. Jetzt alle,
  etwas schmaler (19 px statt 21), damit der Figur mehr Bahn bleibt.

## 1.23.4
- DIE ECKVERZIERUNG WIEDER IN ALLEN VIER ECKEN - mit gerechnetem Abstand
  (Besitzer: "es muss auf jeden Fall sichergestellt werden, dass wir nie dieses
  Emblem mit der Stufe oder auch die Faehigkeiten damit ueberschneiden ... und
  immer ein symmetrischer Abstand dazu"). Gemessen, warum es vorher nicht ging:
  das Stufen-Abzeichen sass 4/4 px in der Ecke und ist 36x36 gross - es besetzte
  die rechte obere Ecke ganz; die Talentspalte sass 11 oben / 8 links, also nicht
  einmal zu sich selbst symmetrisch. Jetzt stehen beide auf 10/10, die Verzierung
  rueckt auf 4 px in den Rand. Gegenprobe: mit dem Abzeichen zurueck auf 4/4
  meldet die Probe 128 echte Ueberschneidungen, mit 10/10 null.
- DER WINKEL IN DREI STUECKEN statt einem. Gezeichnet aendert sich nichts -
  aber ein L hat als Kasten ein Quadrat, und ein Kastenvergleich meldete
  Ueberschneidungen, wo gar keine Tinte lag. Zerlegt in Arm, Bogen, Arm ist
  jeder Kasten so duenn wie der Strich, und der Abstand ist messbar statt
  behauptet.
- EIN HAUCH DER FIGURENFARBE IN DER ZIFFER (Besitzer: "dass die Zahlen immer
  angepasste Farben zu dem Emblem haben, nur ganz duenn und ein Hauch von, aber
  auf jeden Fall ein bisschen"). 18 % der Figurenfarbe ins Metall gemischt, und
  danach die Helligkeit wieder genau auf die des Metalls gezogen: es aendert
  sich der Ton, nicht die Lesbarkeit. Gemessen 19 verschiedene Ziffernfarben,
  vorher vier. Fremdes bleibt grau.

## 1.23.3
- DIE ECKVERZIERUNG NUR NOCH UNTEN, UND SYMMETRISCH (Besitzer mit Screenshot:
  "manche zeigen nach innen, manche nach aussen"). GEMESSEN: zwei der vier
  Ecken waren falsch gedreht - unten links stand auf 90 statt 270, oben rechts
  auf 270 statt 90; die beiden Eintraege der Liste waren vertauscht. Oben
  sassen ausserdem Stufen-Abzeichen und Talentspalte im selben Raum, sie haetten
  weichen muessen ("der Umbau ist zu wild"). Jetzt stehen die Winkel nur unten,
  wo der Platz frei ist - gemessen 104 Stueck auf 52 Kacheln, links wie rechts
  0,0 px Unterschied zum Rand.
- FEINER UND RUNDER IM ECK (Besitzer: "die Ecke ist ein bisschen dicker").
  Gemessen: der Hauptwinkel stand auf 1,3 px, die kleinen Striche desselben
  Zeichens auf 1,0. Jetzt 0,85 - eine Spur feiner als die Striche - und der
  Eckradius 3,5 statt 0,6, damit die Kontur der Kachelrundung (11) folgt.
- HINTER ALLEN ELEMENTEN (Besitzer): die Verzierung lag auf z 1 und damit ueber
  der Figur; sie liegt jetzt auf z -1, direkt ueber der Kulisse. Gemessen.

## 1.23.2
- DIE FIGUREN AUF BAUERNHOEHE, DER TELLER BLEIBT (Besitzer mit Screenshot):
  gemessen nach der Tellerskalierung Turm 461 px hoch, Bauer 561, Laeufer
  601, Gambit 603 - und die Dame mit ihrem Teller 39,5 px rechts der
  Bildmitte. Jede Figur wird jetzt senkrecht auf die Hoehe des Bauern
  gezogen (bis +-20 %) und auf ihren Teller zentriert; Teller und Band
  bleiben, wo sie sind. Bodenlinie und Tellerbreite weiter gemessen 0,0/0,3.
- DIE ZIFFER DEUTLICH IM METALLTON: Kupfer auf Bronze, Silber, Gold.
- DIE ECKVERZIERUNG (aus der Vorlage): vier Goldwinkel mit Punkt in jeder
  Kachelecke, violett beim Grossmeister, matt bei Fremdem. 208 gemessen.

## 1.23.1
- PFLICHT IST NUR DER KOENIG (Besitzerentscheid): der Laeufer ist keine
  Pflichtfigur mehr und frei besetzbar wie Turm und Springer; jeder freie
  Platz nimmt, was man gesammelt hat. Der Platz der Dame haelt weiter die
  Dame oder einen gewonnenen Meister - sonst nichts. Auf allen fuenf Karten.
  Vier Proben. Die Zweier-Grenze fuer Laeufer, Springer, Turm steht noch aus:
  die Grundstellung der Arena traegt vier Springer, und ein frischer
  Klassiksatz kann zehn Plaetze anders nicht fuellen - Entscheidung offen.

## 1.23.0
- DIE MONSTER SIND GENAUSO GESPREIZT WIE DIE FIGUREN (Besitzer: "alle Figuren,
  die man spielen kann und die gegen einen spielen, sollten in maximalster Form
  alle Sachen abdecken"). Gemessen vorher: 25 Monster zwischen 19 und 39 %
  Blau, Budgets 14 bis 29. Jetzt dasselbe Budget wie jede Figur (24 auf ihrer
  Hoechststufe 5), von Koloss 21/3 (13 %) bis Geist 4/20 (83 %). 24 von 25
  Monstern tragen je eine Faehigkeit; nur der Koloss keine.
- ALLE FIGUREN GLEICH GROSS, DER TELLER IST DAS MASS (Besitzer): jede Figur
  wird auf dieselbe Tellerbreite skaliert, um den Fuss herum; das Band
  wandert mit. Der Hetzer (Teller fast doppelt so breit wie ein Springer)
  steht jetzt in Reihe. Drache ausgenommen. Gemessen: 32 Teller 57,2-57,5 px
  (Spanne 0,3; vorher 40-65), Bodenlinie weiter 0,0 px.
- DAS ABZEICHEN mit gleichem Abstand nach oben und rechts (4/4 px, vorher
  7/4); die Ziffer in der Farbwelt ihres Metalls - Bronze warm, Silber kuehl,
  Gold gelblich.
- GROSSMEISTER tragen einen leuchtenden violetten Rahmen im Hofstaat.
- Die Kulisse der Figuren traegt den Farbschleier etwas staerker (30 statt 22 %).

## 1.22.2
- JEDE FIGUR HAT DASSELBE BUDGET (Besitzer-Klarstellung): 24 Punkte Leben +
  Angriff auf der Hoechststufe fuer alle, nur der Drache 48 - er nimmt vier
  Felder ein und ist langsam, eine Mauer. Die Verhaeltnisse aus v1.22.0
  bleiben (Koenig 12 % Blau bis Attentaeter 83 %), die Budgets sind
  angeglichen; vorher streuten sie von 10 (Bauer) bis 46 (Koenig). Eine Probe
  haelt das Budget fest.
- DIE GEGENSEITE HAT WIEDER FARBE (Besitzer: "nur ein Hauch von Graustufen,
  man muss sie klar sehen"): ein Fuenftel Grau statt halb, kaum noch dunkler.

## 1.22.1
- DIE VOLLBILD-ANSICHT TRAEGT DIE KULISSE DER FIGUR (Besitzer: "mega cool,
  wenn wir hier den Hintergrund mit reinnehmen"): in voller Groesse hinter
  der Figur, oben und unten abgedunkelt. Der Satz unten war abgeschnitten und
  zu klein - jetzt 16 px auf der dunklen Platte, mit Luft zur Leiste. Und die
  Ansicht kennt jetzt einen Titel und Aktionen: das wird der Moment, in dem
  man eine Figur gewinnt ("hat sich dir angeschlossen", "Zurueck zur Karte",
  "Zum Hofstaat"); die Verdrahtung ans Kapitelende folgt.
- DAS BUNDFENSTER: Geschichte 14,5 statt 12,5 px (Besitzer: "minimal zu
  klein"), Kulisse 60 statt 42 %, Figuren 20 % groesser.

## 1.22.0
- JEDE FIGUR EIN INDIVIDUUM - DIE PROFILE SIND GESPREIZT (Besitzerentscheid:
  "die sind alle viel zu nah beieinander; es darf welche geben mit ganz viel
  Leben und welche mit ganz viel Angriff, die auf einen Schlag kaputt sind").
  Jede Art hat jetzt ein ZIELPROFIL [Leben, Angriff] auf der Hoechststufe
  (ZIEL_PROFIL in constants.js), das Wachstum laeuft linear vom Grundwert
  dorthin. Blauanteil vorher 16-55 %, jetzt 13-82 %: Koenig 40/6, Drache 36/6,
  Schildtraeger 22/4 (Bollwerke) - Bauer 7/3, Turm 17/6, Erzbischof 14/9
  (standhaft) - Dame 18/14, Kanzler 15/14, Springer 8/9 (ausgewogen) -
  Amazone 14/24, Magier 6/13, Warlock 5/18, Attentaeter 4/18 (Klingen). Das
  mittlere Budget bleibt beim alten Niveau (21,6 Punkte).
- EINE RECHNUNG FUER ALLE (werteBeiStufe): Kern, Hofstaat-Kachel und
  Figurenblatt rechneten Leben und Angriff bisher DREI verschieden - die
  Kachel zeigte +1/+1/3, das Blatt +1/+1/2, der Kern relativ. Jetzt eine
  Funktion; sieben Proben in test_balance halten Spreizung, Ziel, Grundwerte
  und Budget fest.
- Sockelband: unten weniger Verlauf ins Dunkle (Besitzer).

## 1.21.2
- ABZEICHEN GROESSER UND KRAEFTIGER (Besitzer): 36 px statt 30 auf der Kachel;
  die Figurenfarbe im Feld satter und heller gestellt (Saettigung x1,3,
  Helligkeit 0,50), Beize und Randschatten leiser, damit sie durchkommt.

## 1.21.1
- ABZEICHEN NACHGEZOGEN (Besitzerabnahme): die Lorbeerblaetter zeigen nach
  oben, entlang des Zweigs; der Lorbeer waechst auf der Hoechststufe um JEDE
  Form, nicht nur ums Medaillon. Das Siegel ist ein regelmaessiger
  Zackenstern (12 Spitzen, berechnet statt gezeichnet). Die bunten Steine
  sind fort - "laecherlich" -, Filigran und Funken bleiben.
- DAS INNENFELD TRAEGT WIEDER DIE FIGURENFARBE: im Spiel fehlte die
  CSS-Regel aus dem Vorschlag (class="ton"), die Felder waren schwarz. Die
  Farbe steht jetzt direkt am Element; eine Probe wacht darueber.

## 1.21.0
- DAS STUFEN-ABZEICHEN (Besitzerentscheid nach sechs Entwuerfen): drei Ebenen
  in einem Zeichen. FORM nach Bund - Medaillon (Krone, Nachtwache, Bauer,
  Gambit, Grossmeister), Schild (Geleit, Schildwacht, Sturm, Gemaeuer), Banner
  (Konzil, Faehrte, Gezeiten, Gesindel), Siegel (Schatten, Bannkreis, Drache,
  Brut, Untot). FARBE der Figur im gebeizten Innenfeld. METALL nach Stufe -
  Bronze 1-3, Silber 4-6, Gold 7-9, Gold mit Lorbeer auf der Hoechststufe;
  je Metall ein Zierat (Hammerschlag, Gravur, Filigran mit Steinen). Matte
  Fassung mit Lichtband, Kordelrand, Patina, gemeisselte Elfenbeinziffer mit
  dunkler Kontur. Fremdes grau ohne Metall. Gemessen: 32 Abzeichen, alle vier
  Formen, alle Metalle.

## 1.20.2
- STRATEGE UND KAPITAEN SASSEN ZU HOCH (Besitzerbefund) - genauer: die
  Amazone daneben sass zu tief. Ihre Talentspalte links wuchs mit zwei
  Zeichen auf 45 px und drueckte Figur und Namen ihrer Kachel um 24 px nach
  unten; die Reihe wurde hoeher, die Nachbarn ohne Talente blieben oben.
  Die Kopfzeile hat jetzt eine feste Hoehe, die Talente haengen als eigene
  Spalte ueber dem Bild. Gemessen: Namenszeile vorher 153/177 px unter der
  Kante, jetzt 153 in allen 52 Kacheln.

## 1.20.1
- ALLE FIGUREN STEHEN AUF DERSELBEN BODENLINIE (Besitzerbefund: "die Koenigin
  sitzt im Verhaeltnis zu den anderen nicht richtig"). Die Gemaelde haben
  nicht denselben unteren Rand: die Dame steht mit dem Boden bei y=567,
  Koenig, Turm, Laeufer bei 555-557. Jede Kachel schiebt ihr Bild jetzt um
  den gemessenen Unterschied auf die gemeinsame Linie 555 (sockelband.json).
  Gemessen im Chromium: vorher 8,9 px Spanne zwischen den Figuren, jetzt 0,0.

## 1.20.0
- DAS TALENT-FREISCHALTFENSTER (Uebergabe, Punkt 4): wie das Bundfenster -
  Figur links vor ihrer Kulisse, Zugdiagramm rechts, wo das Talent einen Zug
  hat (sonst sein Zeichen, gross); darunter Name und Wirkung. Jede
  freigeschaltete Faehigkeit stellt sich so vor. Vier gerenderte Proben,
  im Chromium ausgeloest (Springer lernt Weitsprung).

## 1.19.0
- DAS MEDAILLON (Besitzerwunsch): der Stufenkreis oben rechts traegt die
  Farbe der Figur - Koenig blau, Springer rot, Magier violett, Drache gruen;
  Monster den Akzent ihres Bosses. Mit Struktur (Speichen aus einem konischen
  Verlauf), Glanz oben, Schatten unten, Rand im helleren Ton. Grau fuer
  Fremdes. Die Farbe ist GEMESSEN (scripts/messe_farbe.py -> figurfarbe.json):
  der volleste Farbtonsektor der gesaettigten Pixel oberhalb des Sockels,
  ohne Hauttoene - beim Magier gewann anfangs die Haut, weil die Robe zu
  gedeckt fuer die Spannenregel war; die HSV-Saettigung entscheidet jetzt.
- FARBANGLEICH FUER ALLE KACHELN, leise: die Kulisse der Figuren bekommt
  denselben Farbschleier wie die der Monster, mit 22 % statt 45 % - die
  Figuren tragen mehrere Farben.
- docs/backlog.md um die erledigten Punkte gekuerzt.

## 1.18.0
- DAS SOCKELBAND AUF DEM BRETT (Besitzerabnahme: "grundsaetzlich super"):
  dieselbe Anzeige wie im Hofstaat, im Teller der Figur. Der Schnitt an der
  Sockelkante aus v1.14.1 entfaellt, wo ein Band ist - der Teller traegt jetzt
  die Anzeige. 40 Baender gemessen, 0,00 px Abweichung, kein Rohr mehr.
- BAND-FEINSCHLIFF nach Vorlage: eingelassen (Schatten von beiden Fassungen
  ins Band, als saesse es in einer Nut), keine Stege mehr zwischen Rot,
  Schwarz und Blau - die Farben stossen stumpf aneinander.
- AUF STUFE 1 IST ETWAS ZU SEHEN: die Fuellung beginnt bei 28 % statt bei
  10 % und laeuft bis 100 % auf der Hoechststufe. Gilt fuer Band und Rohr.
- DER DRACHE IST EIN KOLOSS (Besitzer): Leben 6 -> 10, Angriff 4 -> 2 -
  "er greift ja eh schon flaechig an".

## 1.17.0
- DAS BAND IM SOCKEL (Besitzervorlage "Integrated Status Display"): im
  Hofstaat sitzt Leben/Staerke jetzt als Ring auf der Vorderseite des
  Tellers - rot links, dunkel in der Mitte, blau rechts, in Gold gefasst,
  mit Glanz oben und Rundungsschatten an den Enden. Jeder der 69 Sockel ist
  einzeln vermessen (scripts/messe_sockel.py -> sockelband.json: Ellipse der
  Bodenkante, Tellerbreite, gemalter Farbring), das Band wird in Bildpixeln
  auf derselben Ellipse gezeichnet; der SVG liegt deckungsgleich auf dem
  Bild (gemessen 0,00 px). Das Rohr in der Kopfzeile entfaellt, wo ein Band
  ist. Bandhoehe 17 % der Tellerbreite. Das Brett folgt nach der Abnahme.
- docs/backlog.md: Stufen-Medaillon in der Figurenfarbe, Farbangleich fuer
  alle Kacheln, Sockelband auf dem Brett, Geleit-Kulisse.

## 1.16.0
- DIE BUNDTAFEL AUF DEM BLATT: was die Kachel nicht mehr traegt, steht beim
  Antippen - Bund mit Regel, Mitgliedern samt Stufe und Stand (x von n auf
  Hoechststufe / erwacht), Geschichte; bei Grossmeistern das Kapitel, bei
  Monstern die Gruppe, dazu die Herkunft (Im Hof, Verbuendet, Begegnet,
  Gesichtet). Bauer, Gambit und Drache: "Ohne Bund", mit eigener Kulisse. Die
  Tafel spricht die Sprache der Kachel: Kulissenstreifen, Kapitaelchen,
  Serife, Stufenkreise. In voller Breite unter dem Kopf des Blatts.
- RICHTLINIEN festgehalten in docs/richtlinien-hofstaat.md (Besitzer: "daraus
  Guidelines ableiten") - sechs Regeln fuer Kachel, Blatt, Kulisse, Farbe,
  Schrift und Messen.

## 1.15.1
- EINE KACHEL FUER ALLE (Besitzervorlage): oben links die Talente, in der
  Mitte das Lebensrohr, rechts die Stufe; darunter die Figur, unten nur der
  Name. "Verbuendet", "Meister & Grossmeister" und Co. stehen nicht mehr auf
  der Kachel. Monster tragen dieselbe Kopfzeile mit Rohr aus ihren Bosswerten.
- DIE STUFENZIFFER SITZT JETZT MITTIG (Besitzerbefund): Flex-Kind mit fester
  Zeilenhoehe statt SVG-Text, gemessen 0,0 px Versatz auf 32 Kreisen. Das Rohr
  liegt auf der Mitte der Stufe (gemessen 0,0 px; der SVG-Kasten reserviert
  oben Platz fuer die Perle und sass 3,4 px zu tief).
- WAS NOCH NICHT ZU EINEM GEHOERT, STEHT IN GRAUSTUFEN - Kulisse wie Figur.
  Dunkle Kacheln hatten vorher gar keine Kulisse, gedaempfte eine farbige.
- MONSTER-KULISSEN IM TON DER FIGUR: ein Farbschleier (mix-blend-mode: color)
  in der Akzentfarbe des Bosses gleicht Hintergrund und Figur an.

## 1.15.0
- DECKS: DREI AUFSTELLUNGEN JE BRETT UND REGELWERK (Uebergabe, Punkt 3).
  Im Aufstellungs-Editor stehen drei Faecher, "Aufstellung I-III"; tippen
  wechselt, das aktive noch einmal tippen benennt es um (leer = zurueck zum
  Standardnamen). Der Kern (decks.js) spiegelt das aktive Fach nach
  formations[key], sodass Armee bauen, Vorausschau und Editor weiter dieselbe
  Stelle lesen; alte Spielstaende werden ohne Umschreiben zu Fach I. Die
  Faecher ueberleben das Laden (profile.js setzte loadout neu zusammen und
  haette sie verworfen). 24 Proben im Kern (test_decks.mjs, in npm test),
  8 im Editor - zuerst geschrieben, dann gebaut.
- DIE KARTENWAHL ERSCHEINT ERST AB KAPITEL 5: bis dahin ist jede Station
  8x8, eine Auswahl mit nur einer Wahl ist keine.

## 1.14.2
- DIE KULISSEN SIND JETZT ZU SEHEN (Besitzerbefund: "man erkennt sie nicht").
  Sie lagen mit 42 % Deckung unter einem dunklen Verlauf ueber die ganze
  Hoehe - die Werte des Bundfensters, wo ein langer Text darueber lesbar sein
  muss. Auf der Kachel steht kein Text. Jetzt 92 % Deckung, der Verlauf nur
  noch im unteren Drittel unter dem Namen; Himmel, Burg und Laterne im oberen
  Teil bleiben frei. Begegnete (noch nicht eigene) Figuren 60 %.
- BAUER UND GAMBIT TRAGEN EIGENE KULISSEN: der Besitzer hat sie nachgeliefert
  (Acker mit Feldrain, Wegkreuz mit Laterne). Damit hat jede Figur im
  Hofstaat ein Bild - 29 Kulissen, alle mit HQ-Original im Archiv.

## 1.14.1
- DER SOCKEL IST FORT, DIE FIGUR STEHT IM ROHR (Besitzerwunsch seit v1.5.1:
  "ich will den Sockel nicht mehr sehen"). Gemessen mit messe_rohr.mjs: der
  Sockel ist 0,3 bis 0,4 Zellen hoch, das Rohr 0,155 - es schauten bei jeder
  Figur 5 bis 10 px heraus, und ein Rohr, das ihn verschluckt, waere ein Fass.
  Jetzt endet das Bild an der GEMESSENEN Sockelkante jeder Figur (clip-path),
  und das Rohr sitzt mit seiner Mitte genau auf dieser Linie. Rohr und Schnitt
  rechnen aus derselben Funktion (sockelLinieEm). Nachgemessen: 40 von 40
  Figuren gedeckt. Nur im HP-Gefecht - in Klassik steht der Teller weiter.
- Der Lebensrohr-Patch aus der Parallelsitzung ist mit drin: zwei tote
  Konstanten beseitigt, data-gg="rohr" zum Messen, messe_rohr.mjs.

## 1.14.0
- JEDE KACHEL IM HOFSTAAT TRAEGT IHRE KULISSE - so, wie es in der Bundsitzung
  abgemacht war: jede Figur das Bild ihres Bundes, jeder der zwoelf
  Grossmeister sein eigenes, die dreizehn uebrigen Monster in vier Gruppen
  (Brut, Untot, Gesindel, Gemaeuer), der Drache allein. Bauer und Gambit haben
  keinen Bund und behalten den Verlauf. Zuordnung in kulissen.js (reine
  Daten, in node pruefbar), Bilder in KulissenBilder.jsx.
- DIE ZEHN BUENDE, JEDER FUER SICH, TESTGETRIEBEN (Besitzerwunsch): neue
  Suite test_buende.mjs mit demselben Vierklang je Bund - Erwachen nur bei
  Hoechststufe aller Figuren, Wirkung im Gefecht, Gegenprobe ohne Bund,
  Kulisse auf der Kachel. 77 Proben; die zwoelf Kulissenproben standen beim
  ersten Lauf rot, danach kam der Code.
- GEMESSEN IM LEBENDEN HOFSTAAT (messe_kulissen.mjs, echtes Chromium): alle 50
  Kacheln tragen ihr Bild, geladen und sichtbar. Dabei ein Befund, den kein
  Quelltextvergleich gefunden haette: die Deckung lag bei 100 % statt 42 %.
  Die globale Einblendregel (animation ... both) haelt jede Bilddeckung nach
  dem Einblenden auf 1 fest - das traf auch die Kulisse im Bundfenster, die
  nie gedaempft war. Bilder mit eigener Deckung nehmen sich jetzt mit
  data-gg-still heraus; nachgemessen 0.42.

## 1.13.4
- JEDER BUND HAT JETZT SEINE EIGENE KULISSE: bis hierher teilten sich die zehn
  Buende vier Stimmungsbilder (Hof, Wildnis, Riss, Schmiede) - drei Buende
  sahen damit aus wie ihre Nachbarn. Der Besitzer hat zehn eigene Hintergruende
  geliefert; das Bundfenster greift jetzt nach der Bund-Id statt nach der
  Stimmung. Der Farbverlauf bleibt als Rueckfall darunter.
- DER GANZE KULISSENSATZ LIEGT EIN: 27 Bilder (10 Buende, 12 Grossmeister,
  4 Monstergruppen, 1 Drache), aus den 1024x1536-Originalen auf 512x768 WebP
  q82 gebracht - dasselbe Mass wie die bestehenden Kartenkulissen. Die
  Originale liegen in hoher Qualitaet unter archiv/bilder/kulissen-hq, und eine
  Probe haelt fest, dass keine Kulisse ohne HQ-Fassung dazukommt. Verdrahtet
  sind bisher nur die zehn Bundkulissen; die 17 uebrigen warten darauf, dass
  entschieden ist, wo sie erscheinen sollen.

## 1.13.3
- DIE CI SCHEITERTE SEIT DREI TAGEN, LOKAL WAR ALLES GRUEN: test_zauber misst
  die Sockelfarbe des Drachen mit python3 + Pillow. Auf dieser Maschine liegt
  Pillow herum, auf dem GitHub-Runner nicht - seit v1.1.9 ist npm test dort an
  der vorletzten Suite gestorben, 52 Laeufe lang. Aufgefallen ist es nie, weil
  execSync ohne encoding sein stderr als rohes Byte-Array ins Log kippt: die
  Meldung "ModuleNotFoundError: No module named 'PIL'" stand als Zahlenliste
  da. Die CI installiert Pillow jetzt, die Probe meldet den Grund im Klartext,
  und eine neue Probe haelt fest: was hier python3 ruft, muss die CI mitbringen.

## 1.13.2
- DIE PROBE PRUEFTE GLEICHHEIT, NICHT FORTSCHRITT: der Commit, der das
  vergessene Hochzaehlen behob, hat selbst nicht hochgezaehlt. Er zog
  package.json auf den obersten CHANGELOG-Eintrag (1.13.1) - beide gleich,
  Probe gruen, und trotzdem ging ein zweites Bundle unter derselben Nummer
  live. Die Anzeige im Profil vergleicht Server- und Geraeteversion; zwei
  verschiedene Builds mit einer Nummer kann sie nicht unterscheiden.
  Jetzt: 1.13.2, die Eintraege muessen streng absteigend und doppelfrei
  sein, und ein Torwaechter (scripts/pruefe-version-fortschritt.mjs) laesst
  keinen Push zu, dessen Version nicht groesser ist als die auf origin/main.

## 1.13.1
- DAS BUNDFENSTER TRAEGT DIE FARBE SEINER FAEHIGKEIT: das Symbol sitzt in der
  Regelbox statt ueber dem Namen, die Box uebernimmt den Grundton des
  Symbolhintergrunds. Wer das Zeichen spaeter auf einer Karte wiedersieht,
  erkennt die Farbe. Fenster und Knopf tragen die leuchtende Kontur
  (ggUpPulse).

## 1.13.0
- DIE KARTEN KOMMEN NACH UND NACH: bis Kapitel 4 nur 8x8 (Klassik, Hof,
  Schneise - sie unterscheiden sich in Loechern, nicht im Mass). Das
  Scharmuetzel fuehrt der Endboss von Kapitel 5 ein, die Arena der von
  Kapitel 7. Vorher liefen alle fuenf Karten ab Kapitel 1 reihum.

## 1.12.1
- DER GELEIT-KNOPF im Gefecht: zwei der drei Figuren waehlen, sie tauschen.

## 1.12.0
- DAS ERWACHEN-FENSTER (Besitzerwunsch): erreicht die letzte Figur eines
  Bundes die Hoechststufe, geht ein Fenster auf und stellt ihn vor. Es
  beantwortet drei Fragen - WER hat sich verbunden (die Figuren mit Namen),
  WAS bewirkt das (die Regel, hervorgehoben), WARUM (die Geschichte, kursiv
  und stiller).
- Es traegt die KULISSE seines Bundes, erscheint genau EINMAL je Bund
  (gemerkt in profile.notices) und geht VOR den Lehrstunden - es ist der
  seltenere Moment und der, auf den man hingearbeitet hat.
- Geprueft wird beim Aufbau der Oberflaeche, nicht beim Aufsteigen selbst: so
  faellt auch der Fall auf, dass jemand mit einem alten Spielstand kommt, bei
  dem der Bund laengst erwacht waere.

## 1.11.2
- DER STURM HAT JETZT EINEN PREIS (Besitzeridee): die Amazone kehrt IMMER
  zurueck, aber der hinterste eigene Bauer faellt dafuer und macht ihr Platz.
  Ist kein Bauer mehr da, faellt sie. Das ersetzt die fruehere Bedingung
  "Startfeld frei" - die hing vom Zufall ab, weil dort zu Partiebeginn oft
  eine eigene Figur steht. Eine Regel, die man nicht steuern kann, ist keine
  Regel, sondern Glueck.
- DER HINTERSTE Bauer, weil er am wenigsten Stellung kostet; einer kurz vor
  der Wandlung waere ein bitterer Preis.
- DAS GELEIT HAT SEINEN KNOPF: ein eigener Befehl, kein Zug. Der Spieler
  waehlt zwei der drei, sie tauschen, der Zug ist verbraucht. Streng geprueft
  - wer den Befehl von aussen schickt, kann nichts erzwingen, was die Anzeige
  nicht anbietet.

## 1.11.1
- ALLE ZEHN BUENDE WIRKEN. Der Sturm war der letzte: wird die Amazone
  geschlagen, kehrt sie einmal je Partie auf ihr STARTFELD zurueck, mit
  halber Kraft.
- SIE KEHRT NICHT DORTHIN ZURUECK, WO SIE FIEL - das waere blosse
  Unverwundbarkeit. Der Weg zurueck an die Front kostet Zuege, und das ist
  der Preis.
- IST IHR STARTFELD BESETZT, FAELLT SIE DOCH. Ein Rueckruf ins Nichts waere
  Willkuer; so kann der Gegner das Feld bewusst blockieren - eine Gegenwehr,
  die man planen kann.
- Jede Figur merkt sich jetzt ihr Startfeld. Gebraucht wird es bisher nur
  hier, aber es beantwortet eine Frage, die sonst niemand mehr beantworten
  kann.

## 1.11.0
- BANNKREIS, KONZIL UND GELEIT wirken - damit stehen neun von zehn Buenden im
  Gefecht. Es fehlt nur noch der Sturm (Rueckkehr der Amazone).
- DER BANNKREIS brauchte den ORT: talentWirkt() nimmt jetzt Spielstand und
  Feld entgegen, beide freiwillig, damit alle bestehenden Aufrufe gueltig
  bleiben. Stehen Seherin oder Inquisitor des Gegners im Umkreis von zwei
  Feldern, schweigt das Talent.
- DAS KONZIL WIRKT AUTOMATISCH beim ersten toedlichen Treffer, nicht auf
  Knopfdruck - ein Bund, den man selbst ausloesen muss, braucht eine
  Bedienung, und wer sie vergisst, verliert. Der Rat faellt dem Koenig in den
  Arm, wenn es noetig ist.
- BEIM GELEIT ist ein Knopf dagegen richtig: der Tausch ist ein ZUG, kein
  Ereignis. Der Spieler waehlt, wann und welche zwei.

## 1.10.6
- FAEHRTE: zieht Späher oder Kundschafter, rückt der andere ein Feld in
  DIESELBE Richtung nach. Der Nachzug faellt aus, wenn das Feld besetzt ist,
  und schlaegt nie - ein Nachruecken, das nebenbei eine Figur nimmt, waere ein
  zweiter Zug in einem.
- SCHATTEN: der verborgene Attentaeter faellt aus der KI-Bewertung. Gemessen:
  1164 auf 457. "Unsichtbar" muss fuer den GEGNER gelten, nicht nur fuer die
  Anzeige - sonst waere es ein Trick, der allein den Menschen taeuscht und
  gegen die KI wirkungslos bliebe. Treffen kann sie ihn weiterhin, wenn ein
  Zug ohnehin auf sein Feld fuehrt: Tarnung ist keine Unverwundbarkeit.
- Sechs von zehn Buenden wirken jetzt im Gefecht.

## 1.10.1
- DIE ERSTEN ZWEI BUENDE WIRKEN IM GEFECHT. Der Paladin faengt Treffer fuer
  den Koenig ab (nur von nebenan), die Schildwacht deckt ihre gemeinsame
  Reihe. Gemessen an einer echten Stellung: der Koenig bleibt bei 20/20, der
  Paladin faellt von 18 auf 11.
- DIE ERWACHTEN BUENDE STEHEN IM SPIELSTAND und werden genau einmal gesetzt,
  beim Aufbau der Partie. Stufen aendern sich waehrend einer Partie nicht -
  die Frage in jedem Zug neu zu beantworten waere Arbeit ohne Ertrag, und sie
  wuerde den Kern zwingen, das Profil zu kennen, das ihn nichts angeht.
- MIT GEGENPROBE: ohne erwachten Bund trifft es den Koenig selbst. Ohne sie
  waere die erste Probe wertlos.

## 1.10.0
- DIE WIRKUNG DER BUENDE steht als eigene Regelschicht (core/rules/buende.js):
  acht Funktionen, die der Kern an wenigen Stellen befragt, statt dass Buende
  quer durch das Regelwerk greifen.
- DIE ORTSBEDINGUNGEN sind drin, beide vom Besitzer ausdruecklich verlangt:
  der Paladin deckt den Koenig NUR von einem Nachbarfeld aus, Techniker und
  Schildtraeger wirken NUR, wenn sie sich eine Reihe oder Linie teilen.
- DER ATTENTAETER verbirgt sich nur, solange Hexerin und Magier STILLSTEHEN -
  wer sie zieht, verraet ihn fuer einen Zug. Aus einer Faehigkeit, die einfach
  laeuft, wird damit eine Entscheidung in jedem Zug.
- 18 Proben, die auch die Gegenfaelle festhalten: ein gefallener Paladin
  deckt nicht mehr, ein Kapitaen ohne Lotsen laeuft auf Grund, der Sturm wirkt
  nur einmal je Partie.

## 1.9.1
- DER MENUEHINTERGRUND FOLGT ENDLICH DEM KAPITEL. Besitzerbefund, mehrfach
  vorgetragen: "Du hast es immer noch nicht geschafft, die Hintergruende in
  den Menues wiederherzubringen." GEFUNDEN: die zwoelf Kapitelbilder
  (ground-01 bis ground-12) gibt es laengst und sie werden geladen - aber NUR
  am Brett. Das Menue zeigte immer dieselbe Halle, nur der Farbhauch wechselte
  je Liga. Jetzt nimmt es das Bild des Kapitels, in dem man steht.
- DIE VIER KARTENHINTERGRUENDE sind eingebaut: Hof, Wildnis, Riss, Schmiede.
  Jeder Bund traegt eine davon, jede Figur erbt sie von ihrem Bund - damit
  wird die Zugehoerigkeit sichtbar, ohne ein Zeichen lesen zu muessen.
  156 KB fuer alle vier, Originale im Archiv.

## 1.9.0
- DIE ZEHN BUENDE stehen als Datengrundlage: Krone, Konzil, Geleit, Fährte,
  Schatten, Schildwacht, Gezeiten, Bannkreis, Sturm, Trinklied. 24 Figuren,
  jede genau einmal; draussen bleiben nur Bauer, Grand Gambit und der Drache.
- JEDER BUND WIRKT ERST, WENN ALLE SEINE FIGUREN AUF HOECHSTSTUFE STEHEN -
  ein Bund ist kein Geschenk fuer die Aufstellung, sondern der Lohn dafuer,
  zwei oder drei Figuren ganz ausgebaut zu haben.
- JEDE REGEL IST EIN SATZ (Besitzervorgabe: "Es sollen immer einfache Dinge
  sein"). Eine Probe haelt das fest und schlaegt an, sobald eine Regel laenger
  wird als 110 Zeichen.
- Zwei Fehler beim Entwerfen, beide von Proben abgefangen: ein erfundener
  "Habicht" (das Bild des Kundschafters traegt einen Vogel - daraus wurde in
  meinem Kopf eine Figur) und die vergessene Dame, die als einzige uebrig
  geblieben waere.

## 1.7.0
- JEDE FIGUR WAECHST JETZT NACH IHRER EIGENEN ANLAGE (Besitzerentscheid nach
  einer Messung). GEMESSEN ueber alle 27 Figuren: auf Stufe 1 lagen ihre
  Profile 36 Prozentpunkte auseinander, auf Hoechststufe nur noch 15 - die
  Figuren glichen sich beim Aufsteigen AN, statt ausgepraegter zu werden.
- URSACHE WAR DIE FESTE STAFFELUNG: +1 Leben je Stufe fuer alle. Bei einem
  Bauern mit 2 Grundleben wiegt das schwer, bei einem Koenig mit 10 kaum.
  Jetzt waechst jede Figur anteilig zu ihrer Anlage - wer viel Leben hat,
  gewinnt mehr Leben; wer stark angreift, mehr Angriff.
- ERGEBNIS: die Spanne waechst von 15 auf 43 Prozentpunkte. Der Attentaeter
  steht bei 27 % Leben zu 73 % Angriff, der Koenig bei 70/30 - beide sind
  jetzt erkennbar das, was sie sein sollen.
- DAS NIVEAU BLEIBT. Ein erster Anlauf mit 0,16 liess das mittlere Leben von
  13,9 auf 11,3 fallen - die Gefechte waeren spuerbar schneller geworden, ohne
  dass das jemand entschieden haette. Mit 0,22/0,20 liegt es bei 14,0. Es
  verschiebt sich die VERTEILUNG, nicht das Niveau.

## 1.6.0
- MANCHE FIGUREN HATTEN KEINEN LEBENSBALKEN (Besitzerbefund am Screenshot).
  Die Werte kamen aus einer STANDARDAUFSTELLUNG - und die kennt nur die sechs
  Grundarten. Magier, Barde, Paladin, Schildtraeger und Spaeher haben eigene
  Arten, standen in keiner Aufstellung und fielen durch. Jetzt wird direkt aus
  BASE_HP/BASE_ATK gerechnet, so wie das Spiel selbst es tut.
- AUF DER HOECHSTEN STUFE IST DAS ROHR VOLL (Besitzerentscheid): "In der
  letzten Stufe sollte jede Figur kein Schwarz mehr haben." Vorher lief die
  Fuellung gegen 94 %, und bei Figuren mit niedrigerer Hoechststufe blieb noch
  mehr uebrig. Jetzt gilt die EIGENE Hoechststufe als Massstab - wer ausgereizt
  ist, ist voll, ob das bei 10 oder bei 20 liegt. Gemessen: 100 %.
- DER STUFENKREIS TRAEGT LILA (Besitzerentscheid: "gehen wir doch auf das lila
  Design"): dunkler Grund, leuchtende Riss-Kontur, helle Ziffer. Kein Gold
  mehr.
- DER ERFAHRUNGSBALKEN IST FORT. Besitzer: "Es macht gar keinen Sinn - die
  Schritte sind zu klein, ich kann fast schon mit einem Schritt aufleveln." Er
  hat recht, und es war mein Denkfehler: Stufen kosten Skillpunkte aus einem
  gemeinsamen Vorrat, da gibt es keinen Fortschritt, nur "reicht" oder "reicht
  nicht".
- Das Rohr auf der Kachel ist groesser und rechnet in em, waechst also mit.

## 1.5.1
- DIE LEBENSROHRE WAREN VIEL ZU KLEIN (Besitzerbefund mit Screenshot). Die
  Aufrufstelle uebergab FESTE Pixel, gerechnet mit EM_PX = 40 - also 23 px
  Breite, immer, egal wie gross die Zelle ist. Auf einem Brett mit
  128-px-Zellen sind das 18 % statt der vereinbarten 58 %; das Rohr haette
  2,6-mal so breit sein muessen.
- DER FEHLER WAR DIE EINHEIT. Das SVG rechnet intern weiter in eigenen
  Koordinaten, aber die Aussengroesse steht jetzt in em - und 1 em ist am
  Brett genau die Zellbreite. So passt es auf jedem Geraet und in jeder
  Brettgroesse, ohne dass jemand eine Zahl nachfuehrt. Dazu breiter (68 %
  statt 52 % des Sockelmasses) und hoeher.

## 1.5.0
- JEDES TALENT FAERBT SEINE ZUSATZFELDER IM ZUGDIAGRAMM (Besitzerwunsch, "das
  waere das i-Tuepfelchen"). Vorher trugen ALLE Zusatzfelder dasselbe Gruen -
  man sah, DASS ein Talent etwas hinzufuegt, nicht WELCHES. Jetzt bekommt
  jedes seine Farbe aus talentFarbe(), und das Feld merkt sich, von wem es
  stammt. Der Springer zeigt damit fuenf Talente in fuenf Farben.
- Ueberschneiden sich zwei Talente auf einem Feld, gewinnt das zuletzt
  eingetragene - Mischfarben wuerden zu keinem Zeichen unter der Karte
  passen.

## 1.4.9
- DER VERSATZ BEIM ZIEHEN IST WEG - nach vier Messungen. Der Besitzer sah
  "beim Ziehen einen kurzen Versatz, manchmal". Gemessen war es KEIN Versatz
  der Position (0,1 px, unsichtbar), sondern ein Sprung der GROESSE: die
  ankommende Figur startete bei scale(.6) und wuchs auf 1 - die
  Erscheinungsanimation "pop", die dort nicht hingehoert.
- BEWIESEN IN DER TRANSFORM-KETTE: vorher [pop]: matrix(0.787...), jetzt
  [ggSanft]: matrix(1, 0, 0, 1, 0, 0.47) - kein Skalierungsfaktor mehr, nur
  ein halber Pixel Hoehenversatz beim Einblenden.
- AUF DEM BRETT gilt jetzt ggSanft: nur Deckkraft und ein Hauch Hoehe.
  Ausserhalb (Hofstaat, Aufstellung) bleibt pop - dort erscheinen Figuren
  wirklich neu, und der Sprung ist gewollt.

## 1.4.4
- DIE KANTE OBEN IST WEG (Besitzerbefund: "Der schwarze Verlauf zur Leiste
  nach oben fehlt immer noch, da ist immer so eine komische Kante, das sieht
  super haesslich aus"). GEFUNDEN: es gibt ZWEI Kopfleisten in der App. Die
  eine - das Hauptmenue - hatte ihren Verlauf seit je; die andere, unter der
  jeder Bildschirm haengt, hatte nie einen. Der Inhalt scrollte dort mit
  harter Kante dahinter durch, waehrend er unten sauber ins Schwarze lief.
  Jetzt derselbe Verlauf an beiden Stellen, und eine Probe zaehlt sie.

## 1.4.3
- DER SPIELERNAME IST JETZT EINMALIG. Besitzerfrage: "Machst du da wirklich
  einen Datenbankabgleich?" Die ehrliche Antwort war NEIN - geprueft wurde nur
  die E-Mail, zwei Spieler konnten denselben Namen tragen. Beim Hofwert-
  Vergleich und spaeter online waere das ein echtes Problem, weil man Gegner am
  Namen erkennt. Verglichen wird ohne Ruecksicht auf Gross-/Kleinschreibung
  und Leerraum ("Corvin" und "  corvin " sind derselbe Name).
- WER UEBER GOOGLE KOMMT, bekommt bei Kollision einen freien Namen mit Zahl
  statt einer abgelehnten Anmeldung - er bringt seinen Klarnamen mit und kann
  nichts dafuer, dass es "Michael Schmidt" mehrfach gibt.
- DER LOESCH-KNOPF WARNT JETZT (Besitzerbefund: "Warum ist der Knopf so
  komisch von der Farbgebung?"). Er trug VIOLETT - die Farbe der Riss-Magie,
  die im ganzen Spiel fuer Zauber und Fortschritt steht. Ausgerechnet der
  Knopf, der alles ungeschehen macht, sah aus wie eine Belohnung. Jetzt
  gedaempftes Rot: erkennbar, aber nicht anziehend.

## 1.4.2
- DIE HOFSTAAT-KACHEL IST FERTIG: Stufenkreis oben rechts (Gold, geprägt, mit
  geometrisch zentrierter Ziffer), Lebensrohr unter der Figur, Name,
  Fortschrittsbalken mit den Kosten der naechsten Stufe.
- DER STUFENKREIS ERSCHIEN NIE, und der Grund lag tiefer als vermutet: die
  Bedingung fragte unlocked.has(cid) - aber die GRUNDFIGUREN des Hofstaats
  (Koenig, Dame, Turm, Laeufer, Springer, Bauer, Gambit) sind von Anfang an da
  und stehen NIE in unlocked. Sie hatten damit immer null. Dass es erst jetzt
  auffiel, liegt an der Darstellung: als unauffaellige Textzeile unter dem
  Namen fehlte sie unbemerkt, im goldenen Kreis sofort. Jetzt deckt `own`
  beides ab: freigeschaltet ODER von Haus aus dabei.

## 1.4.1
- SECHZEHN HQ-FASSUNGEN EINGEORDNET (vom Besitzer nachgeliefert): die sechs
  Gambit-Stufen und alle neun Sperren-Zustaende (Zaun, Mauer, Bergfried, je
  heil bis Schutt). Die Luecke faellt von 17 auf 10.
- DIE ZUORDNUNG LIEF UEBER BILDVERGLEICH, nicht ueber Vermutung: jedes
  hochgeladene Bild wurde gegen alle 69 Live-Fassungen gemessen. Fuenfzehn von
  sechzehn waren eindeutig - der Abstand zum zweitbesten Treffer lag bei
  mindestens 0,02, meist deutlich darueber (zaun-schutt 0,067 gegen 0,144).
  Das sechzehnte (eine Gambit-Variante mit orangem Helmband) liegt als
  gambit-t4-variante bei, weil t4 bereits eindeutig belegt war.
- Offen bleiben zehn: sieben Boss-Bilder, der Haendler und zwei Bauernstufen.

## 1.4.0
- JEDES TALENT HAT EINE EIGENE FARBE (Besitzerwunsch, "das i-Tuepfelchen").
  Die Artfarbe allein reichte nicht: der Springer traegt drei Bewegungstalente,
  die haetten alle dasselbe Blau. Jetzt bekommt jedes Talent eine eigene Stufe
  SEINER Artfarbe, gerechnet aus Farbton und Helligkeit. Zwei Anlaeufe waren
  noetig: 60 Grad Spreizung machten aus Orange ein Rot und ein Gelb - die Art
  war nicht mehr erkennbar. Jetzt haengt die Spreizung an der ANZAHL der
  Geschwister.
- DIE HOFSTAAT-KACHEL TRAEGT DAS LEBENSROHR, gerade und duenn, dazu einen
  Fortschrittsbalken. Der zeigt, wie viel von den Kosten der naechsten Stufe
  beisammen ist ("0/3 SP") - es gibt keine Erfahrungspunkte je Figur, Stufen
  kosten Skillpunkte aus einem gemeinsamen Vorrat, und das ist die einzige
  ehrliche Lesart.
- NEUE PROBE: JEDES LIVE-BILD BRAUCHT EINE HQ-FASSUNG. Besitzerregel, laenger
  bestehend. Gemessen: 17 von 69 Live-Bildern hatten keine - darunter ALLE
  SECHS Gambit-Stufen. Die Rohentwuerfe liegen im Archiv, aber die verwendete
  Fassung wurde nachbearbeitet und nie zurueckgesichert; aus 576-px-
  Freistellungen laesst sich keine HQ zurueckgewinnen. Die Schatzkammer ist
  nachgetragen (1106 px war vorhanden, nur am falschen Ort), die 28
  Gambit-Rohentwuerfe sind in der Werkstatt gesichert.

## 1.3.1
- GERADE IST DIE REGEL, GEKRUEMMT DIE AUSNAHME (Besitzerentscheid): "Bitte die
  Roehrchen immer das gerade nehmen im normalen Menue. Nur im Spiel selbst das
  gekruemmte." Technisch ist das auch die richtige Voreinstellung - die
  Kruemmung hat genau EINEN Grund: sie nimmt die Woelbung des Figurensockels
  auf, und den gibt es nur am Brett. Jede neue Verwendungsstelle bekommt jetzt
  die schlichte Fassung, ohne dass jemand daran denken muss.
- DIE ZEICHENFLAECHE IST IMMER GLEICH HOCH, und das war ein echter Fehler mit
  Reichweite: die Perle braucht Platz UEBER dem Rohr, also war das SVG bei
  einer Figur MIT Talent hoeher als bei einer ohne. Weil beide unten buendig
  sitzen, rutschte das Rohr ohne Perle nach oben - zwei Figuren nebeneinander
  haetten ihr Rohr auf verschiedener Hoehe getragen, ein Zittern ueber die
  ganze Reihe. Der Besitzer hat es im Trainieren-Entwurf gesehen, wo dieselbe
  Figur zweimal nebeneinander steht.

## 1.3.0
- DAS LEBENSROHR ERSETZT DIE ZAHLENPERLEN. Besitzerbefund mit Screenshot:
  "Ein Screen wie hier ist schon ueberladen." Gezaehlt: rund siebzig Perlen
  auf einem Brett, bevor ueberhaupt etwas passiert ist - zwei je Figur, und in
  der Grundstellung sagen sie achtmal dasselbe.
- EIN BAUTEIL, ZWEI WERTE, DREI AUSKUENFTE (Besitzeridee): Rot waechst von
  links (Leben), Blau von rechts (Staerke), dazwischen bleibt dunkles Glas.
  Das VERHAELTNIS zeigt das Profil der Figur, die GESAMTFUELLUNG ihre Stufe.
  Ein Koenig traegt 67 % Rot zu 27 % Blau, ein Attentaeter 38 zu 56.
- GEMESSEN STATT GERATEN, an mehreren Stellen: das Kraftgewicht stand zuerst
  auf 3,2 und liess den Koenig bei 52/42 fast ausgeglichen aussehen - bei 1,6
  treten die Profile hervor. Die Rohrhoehe aus der Bildstrecke (9,2 % der
  Zelle) waere auf dem Telefon nur 3,5-4,4 px gewesen; 17 % ergibt 6,5-8,2 px,
  darunter traegt die Glasoptik nicht. Der Reif stand auf 11 % wie in den
  Bildern, wirkte im SVG aber doppelt so dick (dort weichgezeichnet, hier
  scharf) - 6 % trifft die Wirkung.
- ALS SVG, weil das Rohr GEKRUEMMT ist: es nimmt die Woelbung des Sockels auf,
  und ein div mit border-radius kann sich nicht biegen. Glanz und Bodenreflex
  folgen derselben Kurve - ein gerader Streifen ueber einem gebogenen Rohr sah
  aus wie aufgeklebt.
- DIE PERLENFASSUNG BLEIBT als Rueckfall (ROHR_STATT_PERLEN), und ihre zehn
  Proben bleiben mit ihr - sie laufen, wenn der Schalter umgelegt wird.

## 1.2.3
- DIE SPERREN SITZEN VERTIKAL MITTIG (Besitzer: "Mauer und Zaun und Bollwerk
  bitte vertikal mittig ausrichten, sauber ausrichten"). Sie standen am
  unteren Feldrand (bottom 2 %), waehrend die Figuren ihre eigene Mitte haben
  - nebeneinander sah das aus, als wuerden sie rutschen. Der alte Wert dient
  jetzt nur noch als feine Verschiebung aus der Mitte heraus.
- DAS TALENTBAND IST PRAESENTER (Besitzer: "die Faehigkeiten unten bitte immer
  etwas praesenter machen und besser darstellen"): groessere Schrift (11,5 ->
  12,5 px), groessere Chips (Polster 3x8 -> 5x11 px), sichtbare Kontur und ein
  Schatten, der es vom Grund hebt. Es ist die Schaltflaeche fuer jeden Zauber,
  nicht eine Fussnote. Auch die leere Zeile traegt jetzt das volle Band -
  vorher war sie blasser und duenner, und das Auge las sie als Fehler statt
  als Auskunft.
- DIE SUMMEN RUECKEN ANS BRETT (Besitzer: "die Bubbles mit Summen gerne
  entsprechend die unteren wie auch die oberen ganz nah an Brett"): beide
  Leisten verlieren ihren Rand zum Bildschirm. Die Zahlen gehoeren zum Brett.

## 1.2.2
- VIER KAPITEL REINES SCHACH (Besitzerentscheid "Ab 5"). Der erste Schaden
  fiel bisher auf halbem Weg durch Kapitel II - gemessen waren damit 100 der
  ersten 161 Stationen HP-Gefechte, und wer die Grundzuege noch lernte,
  rechnete schon mit Trefferpunkten. Jetzt beginnt der Schaden in der Mitte
  von Kapitel V: 173 Stationen reines Schach, in denen Figuren, Gangarten und
  Talente wachsen.
- DER SCHALTER IST EINE ZAHL: HP_AB_LIGA in tools/build-campaign12.mjs von 2
  auf 5, Kampagne neu gebaut (529 Stationen). Kein Eingriff in einzelne
  Stationen - die Verteilung faellt aus der Regel.
- DIE LEBENSTALENTE FOLGEN AUTOMATISCH. Lebensraub, Regeneration und Bollwerk
  tragen seit je die Sperre "verborgen" und erwachen ueber hpWach, das der
  Kampagne folgt. Mit der Verschiebung erwachen sie jetzt in Kapitel V - ohne
  eine einzige neue Regel. Gemessen: nach Kapitel 4 alle drei verborgen, nach
  Kapitel 5 alle drei wirksam.
- SIEBEN PROBEN MUSSTEN NACHZIEHEN, und jede hielt die alte Schwelle fest
  ("Schach gibt es nur in den ersten beiden Kapiteln", "ab Kapitel III blutet
  jede Station", "die Schachhaelfte reicht bis zur Mitte von Kapitel II").
  Zwei weitere suchten HP-Stationen in Kapitel 2 bzw. 3 und fanden keine mehr.

## 1.2.1
- ALLES PASST JETZT AUF DIE KARTE (Besitzer: "mach es so, dass schon alles von
  der Karte drauf passt, und skaliere die Karte einfach entsprechend
  Bildschirmgroesse"). Vorher schnitt die Reihe die Gangart unten ab.
  Nachgerechnet bei 412 px Schirm: die Karte ist von ~305 auf 223 px
  geschrumpft - Figur 108 -> 70 px, Diagramm 96 -> 82, und der Spruch ist
  fort. Breite, Figur und Diagramm wachsen jetzt mit dem Schirm (clamp),
  statt fest zu stehen.
- DER SPRUCH IST FORT: er kostete zwei Zeilen und verdraengte genau die
  Gangart, die der Besitzer sehen wollte. Er steht vollstaendig in der
  Chronik, wo man ihn liest - beim Aufstellen braucht man Zugbild und
  Talente.
- DER ERKLAERTEXT UEBER DEN PLAENEN IST FORT (Besitzer: "der Erklaertext ist
  denke ich nicht noetig"). Die Knoepfe heissen Schach und HP-Gefecht; mehr
  muss dazu nicht stehen, und der Platz gehoert der Wischreihe.

## 1.2.0
- DER KOENIG IST IMMUN GEGEN FERNKAMPF (Besitzerentscheid): "Es ist
  superwichtig, dass wir grundsaetzlich sagen: der Koenig ist immun gegen
  Fernkampf. Das bedeutet, ein Fernkampf hilft einem nicht, den Koenig
  schachmatt zu setzen oder ihm zu schaden. Dann kann man das klassische
  Schachspiel wirklich laenger im Spiel tragen." Gilt fuer Scharfschuss UND
  Salve; alle anderen Figuren bleiben Ziel. Der Schuss bricht trotzdem am
  Koenig, damit er weiter deckt, was hinter ihm steht.
- DIE LEBENSTALENTE SCHWEIGEN IM KLASSISCHEN SCHACH. Es sind genau drei, alle
  mit der Art "Zaehigkeit": Lebensraub, Regeneration, Bollwerk. In einer
  klassischen Partie gibt es weder Schaden noch Leben - sie wuerden entweder
  nichts tun oder auf undefinierten Werten rechnen. Neu: NUR_MIT_LEBEN und
  talentWirkt(id, rules) im Kern, an allen drei Wirkstellen geprueft.
- ZUGTALENTE BLEIBEN IN KLASSIK ERLAUBT (ausdruecklicher Besitzerwunsch): ein
  Sonderzug funktioniert auch ohne Lebenspunkte. Nur der Lebensgewinn faellt
  weg.
- Gemessen, nicht nur gelistet: im HP-Gefecht heilt der Lebensraub eine Figur
  von 4 auf 6 HP, in Klassik bleibt sie bei 4.

## 1.1.17
- DIE WISCHREIHE IST GEHAERTET (Besitzer: "der Slider in Aufstellung geht
  auch noch nicht, funktioniert gar nicht mehr"). Drei Eingriffe:
  touchAction "pan-x" sagt dem Browser ausdruecklich, dass hier waagerecht
  gewischt wird - ohne das schluckt die senkrechte Seitenbewegung die Geste
  und die Reihe fuehlt sich fest an; minWidth haelt die Karten auf Mass
  (flex-Kinder schrumpfen sonst unter ihre Breite); eine Mindesthoehe
  verhindert, dass die Reihe auf null faellt, solange Bilder laden.
- DIE GANGART STEHT JETZT IN DER KARTE (Besitzer: "du musst wie bei der
  Chronik, wie die Zuege dargestellt werden, das auch bei den Figuren
  reinbringen - sonst weiss man ja nicht, wie wo was"). Dasselbe Diagramm wie
  in der Chronik, klein (96 px). MoveDiagram nimmt dafuer eine Breite
  entgegen; seine feste Breite von min(150px, 52vw) haette die 132-px-Karte
  gesprengt.
- DAS FUNKTIONSLOSE "MEHR" IST FORT, und ich habe es selbst verursacht: die
  Vorrede war auf zwei Zeilen beschnitten, "… Mehr" klappte den Rest auf.
  Seit der Textkuerzung in v1.1.11 (244 -> 127 Zeichen) passt der Text in die
  zwei Zeilen - das Antippen tat sichtbar nichts mehr.

## 1.1.16
- MEIN KOMMENTAR STAND AUF DEM BRETT. Der Besitzer mit Screenshot: das halbe
  Spielfeld war von Text ueberdeckt - "Punkte", "1,42em (minimal kleiner)",
  "Stueck nach oben. */". URSACHE: ein JSX-Kommentar OHNE geschweifte
  Klammern. Zwischen JSX-Kindern ist ein Blockkommentar KEIN Kommentar,
  sondern TEXT, und React zeigt ihn brav an. Eingeschleppt in v1.1.9, eine
  Zeile unter einem richtig geklammerten Kommentar.
- WARUM ES DURCHRUTSCHTE, und das ist die eigentliche Lehre: esbuild meldet
  nichts (die Syntax ist gueltig), die Proben lesen QUELLTEXT und fanden
  ihren Suchbegriff, der Bau lief, und die Fahrprobe zaehlte Felder und
  Zuege - alles gruen, waehrend das Brett unter Text verschwand. Keine Probe
  hat je gelesen, was auf dem SCHIRM steht.
- NEUE PROBE, und sie steht VOR allen anderen: drive3 liest jetzt den
  sichtbaren Text und schlaegt bei Code-Resten Alarm (/*, */, style={{, =>,
  "v1.", "Besitzer:"). Im Gegentest mit wieder eingebautem Fehler meldet sie
  ihn samt Fundstelle.
- Der ganze Baum wurde auf denselben Fehler geprueft: eine weitere Stelle
  gefunden und als harmlos bestaetigt (sie steht in einem JS-Ausdruck, nicht
  zwischen JSX-Kindern).

## 1.1.15
- DIE FIGURENWAHL IN DER AUFSTELLUNG IST EINE WISCHREIHE (Besitzerwunsch):
  "Wenn man auf eine Figur drueckt, dass man dann unten in gross nach rechts
  oder links sliden kann und die Figuren dort zieht, die man hinzufuegen kann.
  Dann sieht man die Figuren in gross - und was sie potenziell fuer
  Faehigkeiten haben." Vorher war es eine senkrechte Liste mit 52-px-Bildern:
  viel Scrollen, kleine Figuren, und die Talente standen gar nicht da.
- JETZT 108-PX-GEMAELDE in einer waagerechten Reihe, die auf die Karten
  einrastet (scroll-snap), damit das Wischen aufhoert, wo eine Figur steht.
- UND DIE TALENTE STEHEN DABEI - die ersten vier, in ihrer Artfarbe
  (dieselbe wie im Talentband und in der Zugspur). Gefunden habe ich sie
  nicht an der Figur, sondern in ihrer STUFENLEITER: c.ladder fuehrt, was auf
  welcher Stufe erlernt wird. Eine Probe haelt fest, dass jede Figur dort
  Talente hat - sonst waere die Reihe still leer geblieben.

## 1.1.14
- DIE SPUR DES LETZTEN ZUGES SAGT JETZT, WER ZOG UND WAS ER TAT
  (Besitzeridee): "Wenn ich einen Zug ziehe, so leicht gelblich darstellen,
  beim Gegner immer so leicht lila. Und wenn eine Faehigkeit kommt, dann die
  Farbe, was es fuer eine Faehigkeit war - auch angedeutet in dem Schweif."
  Bisher lag ueber jedem letzten Zug dieselbe goldene Spur, egal ob ich zog
  oder der Gegner, egal ob ein Talent wirkte. Jetzt drei Auskuenfte in einer
  Farbe: GOLD fuer eigene Zuege, RISS-VIOLETT fuer die des Gegners - und wenn
  der Zug ein Talent verbraucht hat, dessen ARTFARBE aus der Chronik
  (Bewegung blau, Fernkampf orange, Sprung violett, Zaehigkeit gruen ...),
  dieselbe, die der Chip im Talentband traegt (v1.0.92). So erkennt man am
  Brett, was eben geschah, ohne die Meldung gelesen zu haben.
- Der Kern liefert beides schon: lastMove.color sagt, wer zog, lastMove.consumes,
  welches Talent wirkte. Es musste nichts nachgezogen werden - die Auskunft
  lag da und wurde nur nicht gezeigt.

## 1.1.13
- DIE FAHRPROBE SPIELT JETZT WIRKLICH. Bis v1.1.12 endete sie an der
  Anmeldemaske und meldete trotzdem "KEINE FEHLER" - das war schlimmer als
  keine Probe: dreimal hat sie eine Messung als "nicht sichtbar" gemeldet,
  weil gar kein Brett da war, und einmal habe ich das faelschlich mit einer
  Spielregel erklaert (v1.0.92, aufgedeckt in v1.0.96). Eine Probe, die nur
  den Vorhof sieht, macht blind statt sicher.
- Sie legt jetzt Konto und Spielstand an, klickt den Willkommensschirm durch,
  startet ein schnelles Spiel und misst DORT: steht das Brett (160 Felder, 64
  mit Figur), laesst sich ein Zug spielen und antwortet der Gegner, und liegt
  das Talentband unter dem Brett (gemessen 6 px).
- ZWEI SCHRANKEN statt einer beim Talentband. Beim Schaerfen habe ich der
  Probe absichtlich einen Fehler untergeschoben - sie meldete brav "263 px
  unter dem Brett" und liess es durch. Ein Band, das sich unten verliert, ist
  genauso falsch wie eines dahinter; jetzt gilt beides.
- UND SIE MISST ZWEIMAL. Ein Lauf meldete 220 px, zwei andere 6 - der
  Ausreisser fiel mitten in die Antwort des Gegners, wo Brett und Band in
  Bewegung sind. Eine Probe, die bei jedem dritten Lauf grundlos Alarm
  schlaegt, wird ignoriert und ist dann wertlos. Bei einem schlechten Wert
  laesst sie die Animation auslaufen und misst noch einmal.

## 1.1.12
- DIE DOPPELTE BILDLAST IST FORT: 37 MB -> 33 MB im Buendel (gemessen).
  Seit v1.1.0 traegt das Haus eine Livree, aber die klassischen Fassungen
  wurden weiter IMPORTIERT - und was importiert wird, landet im Buendel, ob es
  jemand zeigt oder nicht. Zwei Quellen: livery.js hielt jedes Bild doppelt
  (pick(c, k) mit 21 klassischen Importen, 3,6 MB) und der Vorlader lud 48
  ueberholte Dateien vor (3,9 MB), weil er ALLES vorlaedt.
- pick() ist aufgeloest: wo zwei Fassungen standen, steht jetzt die
  geschnitzte, und die Funktion selbst ist weg. Alle zwoelf klassischen
  Bodenbilder sind aus dem Buendel verschwunden (nachgezaehlt: 0 klassische,
  12 geschnitzte).
- NICHT angetastet: die GEMALTEN Fassungen in paintedArt (154 Bilder, 5,5 MB).
  Sie heissen ohne .carved, sind aber keine Altlast - Hofstaat und Bosse
  behalten in der geschnitzten Livree ihre gemalten Bilder. Der Unterschied
  liegt darin, ob eine geschnitzte Schwesterdatei existiert; genau darauf
  prueft die neue Probe.

## 1.1.11
- DIE ERKLAERTEXTE SIND KUERZER, in beiden Sprachen (Besitzerauftrag: "Ich
  wuerde bei allen Texten und Erklaertexten die Texte noch ein bisschen
  reduzieren - dass es nicht ganz so viel blabla ist, und in dem Zuge
  Englisch und Deutsch sauber glattziehen"). Dreizehn Texte gekuerzt, die
  laengsten von 338 auf 101 Zeichen. Betroffen sind die, die man im Spiel
  liest: Lehrfenster der Erstbegegnungen, Chronik, Stationshinweis,
  Figurenstil, Aufstellungsplan, HP-Regel.
- ZWOELF ALTLAST-EINTRAEGE GELOESCHT, und das war der eigentliche Fund: die
  Probe stiess auf profile.designHint ("Der Knopf schreibt die Wahl in die
  Halle...") und profile.gegnerHint ("Zwei Fassungen: farbig oder ohne
  Farbe...") - beide beschreiben Einstellungen, die es seit v1.1.0 bzw.
  v1.0.83 NICHT MEHR GIBT, und beide wurden von keinem Bildschirm mehr
  aufgerufen. Text, der nichts mehr beschreibt, ist schlimmer als zu langer
  Text: er widerspricht dem Spiel.
- NEUE PROBE mit drei Schranken: kein Erklaertext ueber 175 Zeichen, kein
  LEHRtext ueber 150, und keine Sprache darf mehr als das 1,9-fache der
  anderen brauchen (das war der "glattziehen"-Teil - profile.pinHint stand
  bei 100 gegen 37). Vier Texte sind mit Begruendung ausgenommen:
  Loeschwarnung (rechtlich), Installationsanleitung (jeder Schritt zaehlt),
  Datenschutz (muss praezise sein) und zwei Admin-Hinweise.

## 1.1.10
- DER MUND DES KOLOSSES IST GESCHLOSSEN, und diesmal richtig. Der erste
  Versuch (v1.0.95) fuellte die Luecke SCHWARZ, weil die Farbmittelung
  transparente Pixel mitlas; der zweite ergab eine flache Flaeche. Jetzt
  wandert die NACHBARTEXTUR nach innen (Diffusion in 80 Schritten, nur aus
  deckenden Pixeln) - der Mund traegt dieselbe Steinstruktur wie das Gesicht.
  Die Luecken zwischen Armen und Koerper und der Durchblick zwischen den
  Beinen bleiben offen: das sind echte Zwischenraeume, keine Fehler.
  Original in archiv/bilder/painted, klein-Fassung nachgezogen.
- FREIE FASSUNG ODER VOLLE: EIN WERT, KEINE VERZWEIGUNG (Besitzerauftrag,
  "dass das von der Architektur weiterhin geht"). Neu in config.js:
  MAX_KAPITEL (12, per VITE_MAX_KAPITEL auf 3 setzbar) und istFreieFassung().
  Das Haus fragt nirgends "bin ich die freie Fassung?", sondern nur "wie weit
  reicht die Reise?" - so bleibt die Trennung eine Zahl. Zum Ausliefern der
  freien Fassung genuegt VITE_MAX_KAPITEL=3: kein zweiter Zweig, kein zweiter
  Baum. Die Werkbank haelt sich an den Deckel, und eine Probe haelt fest, dass
  istFreieFassung NUR in der Konfiguration vorkommt - sonst zieht sich die
  Trennung durch den Code und man pflegt zwei Spiele.

## 1.1.9
- DIE STATIONSWESEN AUF DEN KARTEN SIND FAST SO GROSS WIE DER GAMBIT
  (Besitzer: "die sind zu klein, die sollten schon auch die Groesse haben wie
  der Grand Gambit, und im besten Falle das Element, auf dem sie stehen,
  ueberdecken"). GEMESSEN war es die halbe Groesse: der Wanderer misst 96 px
  (mal Kartentiefe), die Wesen standen auf 46 - ein Meister sah aus wie eine
  Spielfigur am Wegrand. Jetzt 84, das Finale 104, und sie haengen am SELBEN
  Tiefenfaktor wie der Wanderer, damit vorn und hinten stimmig bleibt.
- UND SIE STEHEN AUF IHRER MARKE, nicht dahinter: zIndex 0 -> 4 (unter dem
  Wanderer mit 5), bottom 12 -> 2. Vorher lagen sie HINTER dem Medaillon.
- DER DRACHENSOCKEL IST STEINGRAU statt goldbraun (gemessen 139/139/138 statt
  157/119/47). Die Sockelfaerbung im Code deckt nur 12 % der Bildhoehe, der
  Sockel des sitzenden Drachen reicht aber 22,4 % hoch - deshalb blieb Gold
  stehen. Jetzt im Bild entsaettigt, mit gemessener Kante und weichem
  Uebergang; Original in archiv/bilder/painted. Die klein-Fassung ist
  nachgezogen.
- Dazu die zwei anderen Punkte des Besitzers: der grosse Drache ist minimal
  kleiner (1,48 -> 1,42 em) und sitzt hoeher (marginTop -0,09 em statt 0).

## 1.1.8
- DIE GEGNER FEHLTEN IM RUECKBLICKFENSTER - und zwar von Anfang an, nicht
  durch meine Umbauten. Besitzerbefund: "Hast du jetzt alle Popups bei den
  Maps ueberarbeitet, dass ich die Gegner, wenn neue Figuren, gar nicht mehr
  im Popup sehe? Das ist nicht gewollt." GEFUNDEN: es gibt ZWEI
  Stationsfenster. Das gewoehnliche zeigt Bild, Werte und Geschichte; das
  schlichte fuer den RUECKBLICK - es erscheint, sobald man ueber die Weltkarte
  in ein anderes Kapitel blaettert - kannte nur Ort, Karte und Startknopf.
  Wer also ueber die Weltkarte navigiert, und genau das tut der Besitzer, sah
  nie, was an der Station wartet. Jetzt stehen Bild, Name und die beiden Werte
  auch dort, im kleineren Mass (74 px), weil das Rueckblickfenster schmal
  bleiben soll.

## 1.1.8
- DIE FIGUR IM STATIONSFENSTER IST IMMER ZU SEHEN (Besitzerentscheid: "Ich
  moechte die auf jeden Fall sehen"). Die Karte hing an einer
  Geheimhaltungsregel: sie erschien nur bei einer geraeumten oder schon
  betretenen Station (cleared oder faced). Wer zum ersten Mal vor einem
  Meister stand, sah nichts - genau der Moment, in dem man wissen will, was
  dort wartet. Kein Fehler von mir, sondern eine alte Absicht; sie ist jetzt
  aufgehoben.
- WAS BLEIBT: die GESCHICHTE erzaehlt sich weiter erst nach der Begegnung
  (dieselbe Regel, eine Zeile darueber), und der Hinweis, dass sich diese
  Figur anwerben laesst, auch. Das Bild und die Werte stehen immer da.

## 1.1.7
- DAS SUCH-ICON IST WIEDER DAS ORIGINALWAPPEN (Besitzer: "Gold im Original ist
  aber viel besser"). Mein Anlauf in v1.1.6 hat den Goldring NACHGEZEICHNET,
  weil er bei 32 px nur zwei Pixel breit ist - der Besitzer hat den flachen
  Ersatz sofort erkannt. Nachgesehen bei 48/96/144 px: ab 96 traegt das
  Original vollstaendig, mit Tiefe, zwei Lichtkanten und Glanzpunkten, die
  sich nicht malen lassen. Das eigentliche Problem war also nicht die
  Feinheit, sondern die GROESSE - Google nahm das 32-px-Favicon. Jetzt liegen
  48/96/144/192 aus dem Original bereit, und auch favicon-16/32 kommen daraus.

## 1.1.7
- DAS SUCH-ICON IST WIEDER DAS ORIGINAL (Besitzer: "Gold im Original ist aber
  viel besser"). Mein Anlauf in v1.1.6 hatte den Goldring NACHGEBAUT, um ihn
  bei 48 px tragfaehig zu machen - kraeftiger schon, aber nicht mehr das Gold
  des Hauses. Jetzt wird das Originalwappen quadratisch gefasst und mit
  Lanczos herunterberechnet, bei 48 und 96 px eine Spur nachgeschaerft, damit
  die Ringkante hart bleibt. Nachgesehen: der Ring traegt auch bei 48 px.

## 1.1.6
- EINE JE REKRUTIERTE FIGUR (Besitzerentscheid): "Du hast mich immer falsch
  verstanden. Man darf das Pferd, den Turm und auch den Laeufer immer frei
  besetzen. Allerdings darf man jede Figur, die man neu dazubekommt, nur
  EINMAL einsetzen." Bisher gab es dafuer GAR KEINE Regel - die freien Plaetze
  zaehlten nur ihre Anzahl, nicht wer dort steht; man konnte vier Amazonen
  aufstellen. Jetzt bleiben Laeufer, Turm und Springer frei besetzbar, jede
  rekrutierte Figur genau einmal.
- GEMESSEN BEIM EINBAUEN: ein festes Limit von zwei waere falsch gewesen. Die
  Grundstellung der 10x10-Arena traegt VIER Springer - mit einem Zweier-Deckel
  haette das Haus seine eigene Grundstellung verboten. Eine Probe haelt die
  Arena-Grundstellung jetzt ausdruecklich fest.
- EIN EIGENES SUCH-ICON (Besitzer: "dieses Icon, was bei Google hinterlegt
  ist, sieht fuerchterlich aus"). Das feine Wappen taugt bei 32 px nicht: der
  Goldring ist dort zwei Pixel breit und die Kapuzengestalt verschwindet. Neue
  Fassung, absichtlich vergroebert - kraeftiger Ring, Motiv formatfuellend -
  in 48/96/144/192 px, weil Google mindestens 48 verlangt und Vielfache von 48
  bevorzugt.

## 1.1.5
- DER WERKBANK-FEHLER IST GEFUNDEN, und er lag in der OPTIK, nicht in den
  Regeln. Der Besitzer: "Ich wechsle es ueber die Weltkarte, bin auf der Map,
  waehle das erste Level aus - und dann erscheint beim Starten des Kampfes das
  Level aus dem Meer." GEMESSEN: buildStageMatch gab gar kein Feld `league`
  zurueck. Der Spielbildschirm fragt aber an vier Stellen danach
  (Feldfarben, Brettgrund, Abnutzung, Kapitelbild) und schreibt jedes Mal
  `match?.league || profile.campaign.league`. Ohne das Feld griff IMMER das
  Profil - wer ueber die Werkbank in Kapitel 12 stand, sah das Meer, egal
  welche Station er anklickte. Regeln und Gegner waren seit v1.1.2 richtig,
  nur die Optik log; deshalb "ist der Fehler nicht weg".
- ZWEI EINGRIFFE: der Kampf traegt sein Kapitel jetzt selbst
  (league: lgMap, also das Kapitel der Station), und die vier Stellen im
  Spielbildschirm fragen ueber eine gemeinsame Funktion kapitelVon(match,
  profile) - Kampf zuerst, Profil nur als Rueckfall fuer Schnellpartien und
  Duelle, die keine Station haben. Nur noch EINE Stelle im ganzen Bildschirm
  nennt das Profil: die Funktion selbst.

## 1.1.4
- DIE NAECHSTE BELOHNUNG STEHT IN DER KACHELECKE (Besitzer: "man muss auf
  jeden Fall sehen, pro Kachel, was man jetzt gewinnen kann - rechts oben,
  untereinander, Gold zuerst, dann Skillpunkte"). Vorher war sie nur in der
  GEOEFFNETEN Kachel zu sehen; geschlossen wusste man nicht, wofuer man
  sammelt. Gold golden, Skillpunkt lila wie in der Kopfleiste; bei fertiger
  Tat steht dort nichts mehr.
- UNTER DEM ZAEHLER STEHT, WAS NOCH FEHLT ("noch 2 bis zur naechsten Stufe")
  - die Auskunft, die man beim Sammeln braucht. Vorher stand dort nur 3 / 5.
- DER MUENZREGEN AN DER LEISTE (Besitzeridee): der Zaehler fuer faellige
  Belohnungen gab es schon, aber still. Jetzt poppt er auf, und drei Muenzen
  rasseln ueber die Leiste herunter. Der Regen laeuft EINMAL je neuer
  Belohnung (Schluessel am Zaehler), nicht endlos - Dauerregen waere nach
  einer Minute nur noch Unruhe. Neue Keyframes ggMuenzeFaellt und ggBeutelPop,
  beide nur transform und opacity; sie fragen animAn, ob Bewegung erlaubt ist.

## 1.1.3
- DER DRACHE ZIEHT WIE EIN KOENIG (Besitzerbefund): "Er darf immer in die
  Einfeldrichtung links, hoch ... also so wie der Koenig ziehen, bloss dass er
  halt immer zwei Felder belegt. Es sollte sich SYMMETRISCH verhalten."
  Vorher gingen nur VIER Richtungen (links, rechts, oben, unten) - die
  Diagonalen fehlten im Kern. Jetzt alle acht; der Unterschied zum Koenig ist
  allein, dass sein 2x2-Block mitwandert und darum zwei Felder bedroht.
  Gemessen: 8 Zuege, jeder mit seinem Gegenstueck.
- DAS ZUGDIAGRAMM IN DER CHRONIK WAR DOPPELT FALSCH. Es kannte dieselben vier
  Richtungen - und es malte sie fuer JEDES der vier Blockfelder einzeln.
  Daraus entstand das krumme Muster mit einzelnen Feldern an der Seite, das
  der Besitzer zu Recht nicht verstanden hat ("Ich weiss nicht, was du dir da
  gedacht hast"). Jetzt zeigt es, wo der BLOCK nach dem Schritt LIEGT: ein
  geschlossener Ring von zwoelf Feldern um den eigenen Block, symmetrisch.

## 1.1.2
- DAS KAPITEL GEHOERT DER STATION, NICHT DEM PROFIL - ein echter Fehler, den
  der Besitzer beim Testen fand: "Ich teste ueber die Werkbank Kapitel zwoelf,
  gehe zurueck in ein anderes Kapitel, starte dort ein Level - und er startet
  immer das Level vom Werkbank-Kapitel." Ursache: buildStageMatch nahm
  profile.campaign.league. Solange man vorwaerts spielt, stimmen Profil- und
  Stationskapitel ueberein und nichts faellt auf; weichen sie ab (Werkbank,
  oder Zurueckblaettern auf der Karte), wurde die Station mit den Werten des
  PROFILKAPITELS gebaut - falsche Karte, falsch skalierte Gegner, falscher
  Meister. Jede Station traegt ihr Kapitel selbst (node.league); sie ist
  jetzt die Quelle, das Profil nur noch Rueckfall. Der Rueckblick
  (leagueOverride) skaliert weiter wie gewollt. Probe: dieselbe Station baut
  sich identisch, egal welches Kapitel im Profil steht.
- DABEI GETRENNT, was vorher in einer Zahl steckte und sich widersprach: die
  KARTE und die SKALIERUNG folgen der Station, die BESTIEN folgen der
  Weltrunde. Die Monster rotieren mit jeder Runde um die Welt (Liga 13 ist
  Kapitel 1 der zweiten Runde) - das haengt zu Recht am Spielerstand. Die
  Runde faellt jetzt aus der Profilliga heraus und wird auf das
  Stationskapitel aufgeschlagen: eine Station aus Kapitel 3 in der zweiten
  Runde ist Liga 15 - Kapitel-3-Karte, aber das Monster der zweiten Runde.
  Zwei Proben musste ich umdrehen (Uhr, Monsterrotation); sie hielten das
  alte, falsche Verhalten fest.
- DIE ZAUBERPERLE LOEST SICH AUF (Besitzeridee): im Augenblick des Zaubers
  strahlt die Kugel auf, waechst und verglimmt - erst danach steht die matte
  Perle. Neuer Keyframe ggPerleLoest (nur transform und opacity). Dazu ein
  Ton, der SOFORT mit dem Aufstrahlen laeuft, nicht erst mit der Meldung: er
  gehoert zum Verglimmen. Ausgeloest wird er ueber lm.consumes - der Zug sagt
  selbst, ob er ein Talent verbraucht hat.

## 1.1.1
- DAS KRATZEN IM LAUTSPRECHER, GEMESSEN STATT GERATEN. Alle 46 Klaenge
  durchgemessen (ffmpeg, Spitze und letzte 5 ms): KEINER endet hart - das
  Knacken kam also nicht vom Sample-Ende. Aber FUENF waren voll ausgesteuert
  (Spitze 1.000: muenzregen, sperrsetzen, stoss, wucht, zerfall). Zwei davon
  gleichzeitig, oder einer plus Musik, und die Summe laeuft ueber 1,0.
  ZWEI EINGRIFFE: die fuenf Dateien tragen jetzt -3 dB Kopfraum (Originale in
  archiv/klang-original), und der Kompressor am Ausgang wird zum BEGRENZER -
  der alte griff mit 2 ms Attack zu spaet fuer einen Klick-Transienten, der in
  unter 1 ms auf Vollpegel steht. Jetzt 0,3 ms Attack, Schwelle -3 dB, 20:1,
  harte Kante, dazu ein Sicherheitsgurt von 0,9 am Ausgang.
- EIN SCHLAG KLINGT WIE EIN SCHLAG (Besitzerentscheid): jeder Nahkampf nimmt
  "stoss" - denselben Ton wie beim Bauern. Vorher trug jede Figurenart ihren
  eigenen (fuenf Toene), und weil ununterbrochen geschlagen wird, klang das
  Brett unruhig. Nur der Drache behaelt sein Feuer: das ist kein Schlag,
  sondern ein Atem.
- STEIN KLINGT ANDERS ALS HOLZ (Besitzerwunsch): zwei neue Klaenge mit
  ElevenLabs erzeugt - holzbruch (splitterndes Holz) fuer den Zaun,
  steinbruch (Quader und Schutt) fuer Mauer und Bollwerk. Welche Art gelitten
  hat, faellt aus dem Sperr-Vergleich heraus (der Eintrag traegt die Art
  mit) - kein zweiter Zustand, der veralten kann. Beide auf Hauspegel
  (0,77 / 0,72) mit Ausblendung.

## 1.1.0
- EINE LIVREE: GESCHNITZT HELL (Besitzerentscheid: "Ich moechte eigentlich nur
  das geschnitzt-helle Design. Das andere kannst du alles loeschen - ich
  moechte die App jetzt glattziehen, ich will sie demnaechst live bringen.").
  DESIGN ist jetzt eine Konstante in livery.js.
- UND DAS WAR AUCH DER FALSCHE HINTERGRUND. Vorher war die Livree an drei
  Stellen veraenderlich: APP_DESIGN gab den Grundton, ein Wert im
  Geraetespeicher (gg-house-design) durfte ihn ueberschreiben, und die Halle
  konnte ihn per Abfrage umstellen. Stand im Speicher noch "classic", lieferte
  bgHall() die dunkle Fassung - auf einem Geraet, das nie wieder umgestellt
  wurde, fuer immer. Genau das hat der Besitzer zweimal gemeldet. Der alte
  Speicherwert wird beim Start geloescht, fetchHouseDesign antwortet nur noch
  mit der einen Livree, und setLivery nimmt kein Argument mehr an.
  NACHGEMESSEN am fertigen Bau: die ausgelieferte Halle ist die geschnitzte
  Fassung (identische Pruefsumme mit bg-hall.carved.webp), es liegt nur EINE
  im Buendel.
- DIE DESIGN-WAHL IST AUS DEM PROFIL FORT, samt Knopf "Fuer alle Spieler
  uebernehmen" und Erklaertext. Was die Spieler weiter waehlen, ist
  Detailreich oder Simpel - das betrifft die Brettfiguren, nicht die Livree.
- Die klassischen Bilddateien bleiben vorerst im Baum: niemand importiert sie
  mehr, sie kosten im Buendel nichts, und ein eigener Durchgang kann sie in
  Ruhe raeumen. Was WEG ist, ist die Wahl.

## 1.0.99
- DAS BOOT HING AN EINER FESTEN BREITE (Besitzer: "an der falschen Stelle, und
  es duerfte groesser sein"). Der Wanderer-Container schrumpft mit der
  Kartentiefe (96 px mal tiefeWanderer), das Boot stand fest auf 128 px - je
  weiter hinten die Station lag, desto mehr sprengte es den Rahmen und sass
  neben der Figur statt unter ihr. Jetzt haengt es am SELBEN Tiefenfaktor und
  misst 1,55 Containerbreiten: es waechst und schrumpft mit dem Gambit.
- DIE ZAUBERPERLE SITZT ZWISCHEN ANGRIFF UND LEBEN (Besitzer: "mittig zwischen
  blauer und roter Bubble, in kleiner allerdings") und traegt zwei Drittel der
  Groesse. Hinten in voller Groesse machte sie das Trio breiter als das Feld.
- NEUE PROBE fuer den Besitzerbefund "es duerfen nur die Felder angezeigt
  werden, die die Figur ziehen kann": jede Grundfigur frei auf dem Brett,
  jeder Zug gegen die Gangart, in beiden Modi. 168 Zuege geprueft, kein
  einziger abseits. Der Kern ist damit entlastet - der Fehler muss in der
  Anzeige liegen.
- MEIN EIGENER MESSFEHLER, hier festgehalten: diese Probe meldete zuerst 15
  "Springerspruenge" der Dame. Ursache war die Probe selbst - sie rechnete
  mit acht Feldern Breite, das Brett hat aber ZEHN (createGame liefert 10x10).
  Die Breite kommt jetzt aus dem Spiel statt aus meiner Annahme.

## 1.0.98
- DER INFO-KNOPF STEHT HINTER DEM TITEL (Besitzer: "er ist nicht sauber mittig
  ausgerichtet - ich finde es besser, wenn du ihn hinter den Titel machst").
  Neben dem Kreuz konnte er nie mittig sitzen: die Kopfzeile richtet an
  flex-start aus, damit ein langer Ortsname oben buendig bleibt. Jetzt steht
  er in der Titelzeile, unmittelbar hinter dem Ortsnamen, und laeuft mit ihm
  um - die Info gehoert zur Station, also gehoert der Knopf zu ihrem Namen.
- DAS STATIONSFENSTER HAT EINE DRITTE LAGE: MITTE. Oben und unten bleiben,
  solange der Platz neben dem Wanderer wirklich reicht; sonst steht das
  Fenster zentriert und nimmt bis zu 86 % der Hoehe. Ein Bossfenster mit
  Gemaelde und Geschichte passte in die alten Lagen nie - es blieb ein
  Stummel mit Bildlauf, und man musste am Bild vorbeiscrollen (Besitzer:
  "ich moechte immer, dass das Popup komplett dargestellt wird"). Die
  Schwelle ist gerechnet: unter 300 px Platz kann keine Bosskarte (Bild 160 +
  Text + Knopf) stehen.
- GEMESSEN, ERSTMALS IM LAUFENDEN GEFECHT: das Talentband liegt 5,9 px UNTER
  dem Brett, keine Ueberlappung, 233 px Luft darunter. Der Befund des
  Besitzers ("verschwindet unter dem Brett") stammte vom Stand vor v1.0.92;
  die Korrektur greift. Die Messung steht jetzt in messe_animation.mjs - und
  sie konnte es erst pruefen, seit dieses Werkzeug wirklich ans Brett kommt.

## 1.0.97
- DIE WERKBANK KANNTE NUR ZEHN KAPITEL (Besitzer: "da fehlen die Stufen elf
  und zwoelf"). Die Kampagne hat aber ZWOELF - gemessen an campaign12.gen.js:
  529 Stationen, Ligen 1 bis 12. Wer die letzten beiden Kapitel testen
  wollte, kam gar nicht hin. Die Liste wird jetzt aus der Kampagne selbst
  abgeleitet statt abgeschrieben: eine feste Zahl waere am Tag des
  dreizehnten Kapitels wieder falsch, ohne dass es auffaellt.
- Der Werkbank-Hinweis nennt jetzt Kapitel 12 als Vollausbau, in beiden
  Sprachen (vorher stand dort 10 - passend zur alten Liste, aber falsch).
- Geprueft: withProgressPct rechnet das Kapitel modulo 12 und kann die neuen
  Stufen setzen; es musste nichts nachgezogen werden.

## 1.0.96
- DER SPRUNG BEIM SETZEN STAND IM ERSTEN KEYFRAME DER LANDUNG. ggLandung
  begann bei translateY(-7%): der Gleiter legt die Figur auf dem Zielfeld ab,
  im naechsten Rahmen erscheint die echte Figur SIEBEN PROZENT HOEHER und
  faellt herunter. Genau dieser Versatz liest sich als "nicht das gleiche
  Objekt" (Besitzer, mehrfach). Jetzt beginnt die Landung bei translateY(0) -
  dort, wo der Gleiter sie absetzte - und federt nur noch in der Breite aus.
  Die Federkurve verliert ihren Ueberschwinger (1.5 -> ruhiges ease-out); das
  Federn steckt allein in den Keyframes.
- NEUES WERKZEUG messe_animation.mjs: es zieht einen echten Zug und misst die
  Mitte der Figur im Flug gegen die gelandete. Endstand 0,3 px - kein
  Versatz. Es hat mich unterwegs zweimal selbst korrigiert: bei 170 und 470 ms
  stand der Bogen ggLeapArc noch bei scale 1.0625-1.18 und meldete 4-5 px
  "Sprung", der keiner war. Die Grenze steht im Kopf der Datei.
- BEFUND AM RANDE, gewichtig: die Fahrprobe drive3 kam NIE ins Spiel. Sie
  bleibt auf der Anmeldemaske - deshalb meldete meine Talentband-Messung aus
  v1.0.92 "nicht sichtbar", was ich faelschlich mit Klassik erklaert habe.
  Wer ans Brett will, muss Konto und Spielstand anlegen und den
  Willkommensschirm durchklicken (messe_animation zeigt den Weg).

## 1.0.95
- DER HINTERGRUND VOR DEM HAUS IST DER RISSBODEN, nicht die Halle. Mein
  Einbau in v1.0.94 nahm bg-hall (RiftFloor) - das falsche Bild, wie der
  Besitzer sofort sah. RECHERCHIERT in der Historie: der Rissboden kam in
  v0.46.0 ("der Rissboden des Besitzers zieht ein, 10 Bilder, unten fixiert,
  waechst mit Hofwert und Kampagne"), liegt seit je im Hauptmenue und hat
  ZEHN Stufen - nicht zwoelf, das sind die Kapitel-Toenungen des
  MysticBackground (LEAGUE_TINTS, I night&gold bis XII deep sea silver).
  Anmeldung und Spielstaende tragen ihn jetzt in Stufe 1: man hat dort ja
  noch nichts erreicht.
- Der Regelbefund des Besitzers ("die Dame zeigt Felder, die sie nicht
  ziehen kann") ist im KERN nicht reproduzierbar: in Klassik liefert er
  gemessen NULL Zauber-Zuege, die Dame in der Grundstellung null Zuege, der
  Bauer genau zwei. Der Fehler liegt also in der Anzeige - offen, siehe unten.

## 1.0.94
- DAS HINTERGRUNDBILD WAR NIE EINGEBAUT, nicht entfernt. Der Besitzer
  vermisste es im Hauptmenue und beim Anmelden; GEMESSEN am fertigen Bau lag
  auf dem Anmeldeschirm genau EIN Bild im DOM, bg-hall kam nicht vor. Die
  Komponente RiftFloor existiert seit je in MysticBackground - ihr eigener
  Kommentar sagt, sie sei fuer Anmeldung und Spielstaende gedacht -, aber
  NIEMAND hat sie verwendet (Suche im ganzen Baum: null Treffer). Jetzt liegt
  sie auf beiden Schirmen; nachgemessen: bg-hall 692 px breit, voll sichtbar.
- DIE REGLER ZEIGEN EINEN FUELLSTAND (Besitzer: "wenn ich ganz links bin,
  moechte ich nur eine Kontur sehen"). Die Schiene war immer voll violett,
  egal wo der Griff stand - bei 0 sah man einen vollen Balken. Jetzt kommt
  der Anteil aus --gg-fuell: links davon Farbe, rechts nur Kontur.
- DIE AEUSSERE KONTUR AM GRIFF IST FORT - der Besitzer wollte nur eine, nicht
  zwei uebereinander.
- DIE ZAHLEN IN DER SCHATZKAMMER: der Skillpunkt traegt seine Zahl in LILA
  wie oben in der Kopfleiste, nicht in Gold. Beide Zahlen gleich gross
  (vorher 34 gegen 29, jetzt 31), und mehr Luft zwischen Zeichen und Zahl
  (9 -> 13 px).

## 1.0.93
- DIE SCHATZKAMMER ZEIGTE IHR BILD ZWEIMAL. Mein Fehler aus v1.0.91: es gab
  schon einen Einbau (import kammerBild), ich habe einen zweiten ueber
  paintedById daruebergesetzt. Der Doppelgaenger ist fort.
- BILD OBEN, TITEL DARUNTER - mit Abstand (Besitzer: "da muss schon ein
  Abstand zum Bild sein, sie klebt ja direkt drauf"). Vorher stand der Titel
  DARUEBER und das Bild schob sich von unten an ihn heran; jetzt kommt erst
  das Gemaelde, dann 14 px Luft, dann "Deine Schatzkammer".
- DER SAUM UNTER DER KOPFLEISTE (Besitzer: "wenn man hinter der Menueleiste
  durchscrollt, ist rechts und links oben im Eck einfach so eine Kante").
  Die Leiste ist rund und durchscheinend; an ihren Ecken lief der Inhalt
  hart hinter sie. Jetzt blendet ein Verlauf darunter vom Seitenhintergrund
  nach transparent aus - ueber die VOLLE Breite, damit auch die Ecken
  gedeckt sind, und unter der Leiste (zIndex 6 gegen 7). Was durchscrollt,
  verschwindet weich statt an einer Kante zu enden.

## 1.0.92
- DAS TALENTBAND VERSCHWAND HINTER DEM BRETT. URSACHE: es lag mit dem Brett
  in EINEM Raster mit alignItems/justifyItems center - das Raster legte beide
  in die Mitte, also uebereinander. Jetzt stapelt eine Spalte sie sauber:
  Brett oben, Band darunter. Dazu rueckt das Brett hoeher (Kopfraum 0,95 ->
  0,45 Zellen, Fussraum 0,3 -> 0,2), damit unten Platz fuer das Band bleibt.
- DIE TALENT-ARTEN TRAGEN IHRE FARBE (Besitzer: "eine farbliche Kennzeichnung,
  ob passiv, aktiv, Fernkampf"). Die Chronik fuehrt seit je acht Arten mit
  eigener Farbe - Bewegung blau, Fernkampf orange, Sprung violett, Zaehigkeit
  gruen, Flaeche, Kontrolle, Kroenung, List. Das Band nutzt sie jetzt fuer
  Rand, Grund und Zeichen: man sieht die Art, bevor man den Namen liest.
- GEGNERZIELE SIND FELDFAERBUNG (Besitzer: "genau diese Faerbung wuensche ich
  mir auch beim Gegner, anstelle dieser Bubbles"): dieselbe Darstellung wie
  bei den eigenen Zuegen, nur in Riss-Violett statt Gold - so weiss man auf
  einen Blick, wessen Reichweite man sieht. Die Perle sass mitten im Feld und
  verdeckte die Figur darunter; sie ist fort.
- drive3 misst ab jetzt, ob das Band UNTER dem Brett liegt (Ueberlappung in
  px). In der Klassik-Fahrprobe erscheint es nicht (Stufe 1 = keine Talente),
  die Messung bleibt fuer Gambit-Partien scharf.

## 1.0.91
- DAS KARTENBOOT IST NEU (Besitzerbilder): geschnitzter Rumpf in Blaugruen mit
  Goldband, von der Seite, geschlossen - GESPIEGELT, damit es nach rechts
  faehrt. Der Wasserkranz war gemessen 28 Gruen- und 41 Blaustufen heller als
  das Kartenmeer; jetzt auf (55,73,84) gezogen gegen Kartenmeer (60,74,81) -
  in Montage gegen drei Abstufungen geprueft.
- DER GAMBIT STEHT IM BOOT, nicht darauf. Vorher hob ihn translateY(-9%)
  heraus, sein Sockel schwebte ueber der Bordwand. Jetzt keine Verschiebung:
  bei den echten Massen (Boot 128x37, Oberkante y=11; Figur 48 hoch, bottom
  -9) verdeckt der Rumpf von sich aus 35 % - Huefte bei 63 %, Sockel ab 75 %,
  die Kante liegt genau dazwischen. Meine erste Rechnung (22 %) haette 57 %
  verdeckt und ihn versinken lassen; die Montage hat es gezeigt.
- BOOT-LADENSYMBOL und DIE SCHATZKAMMER haben Gemaelde (Besitzerbilder): die
  Kammer im selben Format wie Corvo - geschnitzte Szene auf rundem
  Steinsockel -, damit die beiden Raeume des Lagers als Paar lesbar sind.
  Beide in beiden Livreen und als klein-Fassung.
- DER VERGESSENSTRANK hat sein Gemaelde: der letzte Gegenstand, der noch ein
  Emoji zeigte. Damit tragen ALLE Gegenstaende ihr eigenes Bild.
- DER STAND DER TATEN ist eine Zeile, keine Plakette mehr (Besitzer: "ohne in
  einem Button zu sein"). Nur das Einloesbare bleibt ein Chip - das ist ein
  Knopf-Versprechen.

## 1.0.91
- DAS BOOT FAEHRT NACH RECHTS UND DER GAMBIT STEHT DARIN. Neues Kartenboot
  (Besitzerbild): geschlossener Rumpf von der Seite, gespiegelt - der hohe
  Bug zeigte nach links, obwohl die Reise nach rechts geht. Der Wasserkranz
  war GEMESSEN 28/41 Stufen zu tuerkis; jetzt auf das Kartenmeer gezogen
  (55,73,84 gegen Ziel 60,74,81). Und die Figur wird nicht mehr um -9 %
  herausgehoben: bei den echten Massen verdeckt der Rumpf von sich aus 35 %,
  Huefte bei 63 %, Sockel ab 75 % - die Bordwandkante liegt genau dazwischen.
  Drei Tiefen montiert und gerechnet; 22 % hatten die Figur versinken lassen.
- BOOT-LADENSYMBOL und VERGESSENSTRANK eingebaut (Besitzerbilder) - damit
  zeigt KEIN Gegenstand mehr ein Emoji.
- DIE SCHATZKAMMER HAT EIN GESICHT: Gewoelbe mit offener Truhe und zwei
  Kerzen, auf demselben runden Steinsockel wie Corvos Kraemerstand - die
  beiden lesen sich jetzt als Paar.
- DIE TATEN STEHEN ZU ZWEIT NEBENEINANDER (Besitzer: "statt alle
  untereinander, weil das viel zu scrollen ist"): Raster mit zwei Spalten,
  Medaillon oben, darunter zentriert Name und Stufenrauten. Geoeffnet nimmt
  eine Kachel beide Spalten, damit die Zahlen Platz haben. Gemessen am
  lebenden DOM: 14 Kacheln, 181 px breit, 0 px Ueberlauf, gleiche Hoehe.
- DIE ZAHLEN IN DER STUFENLISTE SIND LESBAR (Besitzer: "kann man fast nicht
  lesen"): Mini-Zeichen 10 -> 15 px, Betraege fett und eine Stufe groesser,
  der Einloesen-Knopf 13 -> 16 px.
- NEUES WERKZEUG messe-kammer.mjs - und dabei zwei alte offene Punkte
  erledigt: die Chromium-Suche und der TESTZUGANG aus messe_hofstaat sind
  uebernommen, das Werkzeug legt sich selbst ein Konto an und patcht das
  Profil.

## 1.0.90
- DER STICKY-VERLAUF IM STATIONSFENSTER IST FORT (Besitzer: "der Button ist
  total daneben, die cremefarbene Flaeche geht gar nicht - lieber hart an das
  Design von davor halten"). Er legte sich ueber "Abgeschlossen" und brachte
  eine zweite Flaeche ins Fenster. Der Knopf steht wieder schlicht im Fluss.
- DER INFO-KNOPF STEHT OBEN, neben dem Schliesskreuz. Eingeklappt bleibt das
  Fenster kurz; angetippt waechst es um den Erklaertext - genau wie
  gewuenscht ("wenn man ihn klickt, schiebt man alles nach unten und das
  Popup wird groesser").
- SPERR-LIMITS 3 / 2 / 1 (Besitzerentscheid): drei Zaeune, zwei Mauern, EIN
  Bollwerk. Vorher 3/3/2 - die Mauer hatte so viele wie der Zaun. Jetzt ist
  das Bollwerk eine Entscheidung, keine Frage des Goldvorrats. KEIN
  Rueckschaden (ausdruecklich verworfen).
- DAS TALENTBAND ERKLAERT SICH, WENN ES LEER IST. Es gab es seit v1.0.85,
  aber der Besitzer sah es nie: er spielt Klassik, und dort ist jede Figur
  Stufe 1 und hat NULL Talente (gemessen: Stufe 1 = 0, Stufe 20 = 4). Das
  Band blieb zu Recht leer, nur wusste das niemand. Jetzt steht bei einer
  eigenen Figur ohne Talente eine Zeile, warum nichts da ist.
- ALLE 26 TALENTE EINZELN GEPRUEFT (Besitzerauftrag "jede der 26 Faehigkeiten
  einmal spielen lassen"): jedes hat Name, Zeichen und Wirkung in beiden
  Sprachen; jedes sagt, ob es ein Zauber ist; Kern und Chronik sind sich
  ueber alle 12 dauerhaften einig (in BEIDE Richtungen); und die 16 Talente,
  die der Kern ueber hasAbility abfragt, werden alle 16 tatsaechlich
  GESPIELT - Figur aufs Brett, Zuege abfragen, Verbrauch pruefen. Kein Code
  lesen, sondern ausfuehren. test_zauber jetzt 34 Zusicherungen.

## 1.0.89
- ZAUN UND BOLLWERK HABEN IHRE GEMAELDE (Besitzer, 11.9.2026): neun Bilder,
  geschnitzt im Hausstil und bereits freigestellt geliefert - Zaun (heil,
  Truemmer), Mauer (heil, angeschlagen, Truemmer, neu gezeichnet) und
  Bollwerk (heil, angeschlagen, schwer, Truemmer). Damit steht auf dem Brett
  keine Ersatzzeichnung mehr; SPERR_BILDER kennt kein null.
- DAS BOLLWERK ZEIGT JEDEN SCHLAG. Der Besitzer lieferte VIER Stufen, das
  Spiel kannte nur drei: bei drei Trefferpunkten sah hp 2 und hp 1 gleich
  aus. stadium() gibt jetzt bei dreipunktigen Sperren fuer hp 1 ein eigenes
  Stadium ("schwer") - Zaun und Mauer bleiben unberuehrt, dort gibt es das
  Stadium gar nicht.
- DIE LUECKENLISTE LEITET IHRE ZUSTAENDE AB (zustaendeVon): ein Zaun haelt
  einen Schlag und hat deshalb KEIN Schadensbild - eine feste Dreierliste
  haette den fertigen Zaun als unvollstaendig gemeldet.
- DIE SPERREN IM LADEN tragen ihr Gemaelde statt eines Emojis; das
  Ladensymbol ist aus dem heilen Zustand gerechnet (Besitzervorschlag).
- Zwei Auslieferungsstufen je Bild (210 px und @gross 420 px), Originale in
  archiv/bilder/sperren.
- Proben: test_sperren +12 (vier Stufen des Bollwerks, Mauer OHNE viertes
  Stadium, alle 18 Dateien vorhanden, kein null mehr).

## 1.0.88
- DAS APP-ICON IST JETZT DAS WAPPEN AUS DER KOPFLEISTE (Besitzerwunsch): die
  Kapuzengestalt vor dem violett gluehenden Riss, im goldenen Doppelring -
  dasselbe Zeichen, das im Spiel oben links steht. Es ist staerker als der
  bisherige Entwurf und braucht keinen Nachbau: das Original
  (emblem-riss.webp) liegt seit je im Haus.
- DER GOLDRING SITZT PERFEKT, WEIL ER RUND IST. Android und Play zeigen
  Symbole rund; das Wappen ist rund gezeichnet - Rand und Maske fallen damit
  zusammen. Die Ecken ausserhalb des Kreises tragen tiefes Schwarz (#08060f),
  damit Launcher ohne runde Maske keinen leeren Rand zeigen.
- ZWEI FASSUNGEN, wie gewuenscht: MIT Goldrand (App-Icons, Store-Symbol,
  Favicon, apple-touch) und OHNE Rand, weich ins Schwarze auslaufend (der
  Ring ist weggeschnitten, Motiv auf 78 % gezoomt) - fuer Stellen, an denen
  kein Rand gefordert ist. Beide liegen in 1024 px im Archiv.
- maskable-512 traegt das Wappen auf 82 % in der Sicherheitszone: Android
  beschneidet maskable je Launcher unterschiedlich, so ueberlebt der Ring.
- favicon.svg erneuert (Chrome bevorzugt SVG - ohne das waere im Tab das
  alte Zeichen geblieben), dazu favicon-16/32 und favicon.ico.

## 1.0.87
Sechs Besitzerbefunde (Screenshots 11.9.2026), alle gemessen oder mit Probe:
- HOFSTAAT-KACHELN NACH RECHTS VERSCHOBEN beim Wechsel Karte -> Figuren: das
  Muster war exakt margin-left 50 % OHNE translateX(-50 %) - ein Transform
  griff nach dem Neuaufbau spaeter als der Rand. Jetzt zentriert der Rand
  allein (118 % Breite, -9 % links), kein Transform mehr: die Fehlerklasse
  existiert nicht mehr.
- STATIONSFENSTER: der Startknopf klebt am unteren Rand (sticky); das
  Bossbild wird NIE mehr beschnitten (1,42-Zoom aus v0.71.14 entfernt, Box
  groesser, overflow visible); der Erklaertext liegt hinter einem (i)-Knopf,
  damit das Fenster sauber mit dem Knopf abschliesst; "Magier / Kronenfiguren"
  fluchten (ein leeres Element vor dem Trennpunkt rueckte die Zeile ein).
- GEFOLGE-HINWEIS ALS ERFOLG: statt gruener Schrift ein goldenes Band mit
  glaenzendem, atmendem Stern (ggErfolgStern, transform/opacity) - gleicher
  Platz wie vorher.
- AUFSTELLUNG, HINTERE REIHE: gemessen 1,8 px aus der Mitte, 2,6 px
  Ueberlauf (das SlotGlyph-Bild mass sich am span statt an der Zelle). Jetzt
  exakt die Bildzeile der Bauern: 16 Figuren, 0 px Versatz, 0 px Ueberlauf,
  gleiche Hoehe 40,9 px.
- KARTENWAHL: Raster statt Scrollstreifen, jede Karte mit echter Miniatur
  (Groesse, Farben, Loecher ausgespart).
- PREISKNOEPFE IM LAGER: dunkler Grund wie das Menue, goldene Kontur mit
  Glanz, Schrift in Gold - die Muenze steht wieder frei.
- messe_hofstaat 2f misst die Aufstellung waagerecht und senkrecht;
  test_anim +9 Strukturproben.

## 1.0.86
- DIE WELTKARTE ZEIGT DEN RANG DES GAMBIT. Sie kannte ihn laengst (gambitTier
  wurde ausgerechnet), nahm dann aber stur karteGambit - die Sonderfassung
  aus v1.0.52 mit dem auf die Marke gestauchten Sockel; ihr Kommentar sagte
  selbst "sobald die Rangbilder da sind, dasselbe fuer t2-t6 rechnen". Das
  ist jetzt geschehen: sechs Kartenfassungen (karte-gambit-t1..t6), je der
  Rangkoerper aus painted-gambit-tX auf dem ORIGINALSOCKEL aus v1.0.52 - so
  bleibt die Marke gedeckt und alle sechs stehen auf derselben Fusslinie.
  Werkzeug: Plateau-Regel aus sockelmass, in Python nachgebaut.
- Damit stimmen jetzt wirklich alle drei Orte: Figurenblatt (v1.0.83), Brett
  (v1.0.83) und Karte (jetzt). Probe: die Karte WAEHLT nach dem Rang, und
  alle sechs Dateien liegen vor.

## 1.0.85
- "ER IST NICHT GESTORBEN" - AUFGEKLAERT: kein Fehler, sondern der SCHILD.
  Der Gambit traegt ab Level 12 drei Schilde; im Schachmodus faengt jeder
  einen Schlag ab, der Angreifer prallt zurueck (per Probe nachgestellt:
  zwei Schilde, drei Schlaege, erst der dritte toetet). Unsichtbar wurde die
  Regel, als v1.0.77 die blauen Perlen vom Brett nahm - seitdem sah ein
  abgefangener Schlag aus wie ein Fehler. Jetzt: der Schild steht im
  Talentband in Worten ("Schild x3 - faengt drei Schlaege ab"), und das
  Statusband meldet jeden Abpraller ("Schild! Grand Gambit faengt den
  Schlag ab - noch 2").
- ZAUBER ERST AUF WUNSCH (Besitzer: "ich moechte die Faehigkeiten nicht am
  Anfang alle verbrauchen"): das Brett zeigt bei einer Figur nur noch normale
  und dauerhafte Zuege. Ein Zauber erscheint erst, wenn sein Chip im
  Talentband angetippt ist ("bereit - Feld waehlen"); nochmal antippen oder
  Auswahlwechsel entschaerft. Kein versehentlich verbrannter Zauber mehr
  durch einen Fingertipp aufs falsche Feld.
- test_zauber jetzt 28 Zusicherungen: Schildmechanik in drei Schlaegen,
  Scharfschalten, Entschaerfen, Schild im Band, Abprall-Meldung.

## 1.0.84
- REGELFEHLER, per Probe reproduziert: das geschlossene Buch ("ein Zauber je
  Partie") sperrte auch die PASSIVEN Talente. Der Gambit verlor nach seinem
  ersten Zauber den Sturmlauf, den die Chronik als "jederzeit" verspricht -
  und mit ihm Fruehumwandlung, Langsprung, Fernsalve, Fluegel-Erweiterungen,
  Lebensraub, Regeneration, Bollwerk. Ein passives Talent ist kein Zauber; es
  bleibt, egal was das Buch sagt. Neue Liste PASSIVE_TALENTE im Kern, die
  eine Probe gegen die once:false-Eintraege der Chronik abgleicht - der
  Abgleich fand sofort den ersten Fehler in der Liste (dragon_flight ist ein
  Zauber, seine Erweiterungen sind passiv).
- DAS TALENTBAND (Besitzer: "man sollte Faehigkeiten bewusst auswaehlen
  koennen"): bei jeder ausgewaehlten Figur steht unter dem Brett, welche
  Talente sie kennt - ZAUBER (violett, ✦, einer je Partie) getrennt von
  DAUERHAFTEN (gold, ◆) -, welcher schon eingesetzt ist, und ob das Buch zu
  ist. Die ✦-Zielfelder auf dem Brett tragen dasselbe Zeichen.
- Neue Suite test_zauber.mjs (17 Zusicherungen): Ausweichen einmal und nie
  wieder, in Schach- und HP-Modus; das Buch sperrt aktive Talente; passive
  ueberleben; Kern und Chronik einig; Talentband vorhanden.
- BEFUND OHNE REPRODUKTION: "der Gambit ist dreimal ausgewichen". Der Kern
  laesst das nicht zu (Probe an allen Ausgaengen, Klonen und Schnappschuss
  tragen used mit). Moegliche Ursachen ausserhalb des Kerns: Zeitenwender
  (Undo gibt den Zauber zurueck - korrekt), oder ein aelterer Build auf dem
  Geraet. Offen, bis ein Spielstand vorliegt.

## 1.0.83
- ENDLICH DIE ECHTE URSACHE: Der Grand Gambit zeigte NIRGENDS seinen Rang,
  weil in PieceGlyph ein RIEGEL stand - `piece.hero && white &&
  paintedById("gambit")` griff das Grundbild ab, bevor paintedForPiece
  ueberhaupt gefragt wurde. Ein Rest aus v1.0.49, als die Rangbilder noch
  stilfremd waren und absichtlich unterdrueckt wurden; seit v1.0.62 sind sie
  da, der Riegel blieb. Alle Korrekturen der letzten Fassungen (v1.0.74
  Kachel, v1.0.79 Portraet) waren richtig, konnten aber nichts ausrichten,
  solange dieser Zweig davor lag.
- EIN WEG ZUM BILDNIS: neue Hilfsfunktion bildnisVon(id, level) - jede
  Stelle, die frueher paintedById(id) einzeln aufrief (Hofstaat-Kachel,
  Zoom-Ansicht, Portraet), geht jetzt darueber und kennt damit den Rang.
- NUR NOCH SCHWARZ UND WEISS BEIM SOCKEL (Besitzerentscheid): die farbige
  Fassung (Gegner lila, eigene Seite gold) ist fort, samt ihrer Wahl im
  Profil - es gibt nichts mehr zu waehlen. Alte Profilwerte (farbig,
  getoent, grau) fallen alle auf schwarzweiss.

## 1.0.82
- DER ONLINE-BILDSCHIRM WAR IM ZUSTAND "GETRENNT" SCHLICHT LEER. Wer nicht
  verbunden war, aber weder lud noch einen Fehler hatte, sah nur die
  Kopfkarte und darunter nichts - kein Knopf, keine Erklaerung. Genau dort
  landet jeder, der "Beim Start verbinden: von Hand" gewaehlt hat oder dessen
  Verbindung still abriss. Daher die Frage des Besitzers, wofuer es diesen
  Bildschirm ueberhaupt braucht. Jetzt steht dort eine klare Zeile und der
  Verbinden-Knopf.
- DIE SCHIENEN SIND EINZEILIG. Bei "Anfragen von" und "Beim Start verbinden"
  stand das Etikett NEBEN der Schiene und nahm ihr die Breite - "Nur
  Freunden" brach dreizeilig um. Jetzt steht das Etikett darueber, die
  Schiene laeuft ueber die volle Breite.
- "Zufallsgegner suchen" heisst jetzt "Spiel starten" (en: "Start match") -
  kuerzer und naeher an dem, was der Knopf tut.

## 1.0.81
- DAS APP-ICON TRAEGT SEIN GOLD JETZT BIS AN DEN RAND (Besitzer: "Goldrand
  bitte bis zum Rand", und groesser). Bisher sass der Ring weit innen, mit
  schwarzem Saum davor - auf dem Startbildschirm wirkte das Zeichen dadurch
  klein und schwammig. Jetzt liegt der Ring auf dem aeussersten Kreis, die
  Figur fuellt 62 % der Hoehe.
- DIE FIGUR HEBT SICH AB, weil sie HINTERLEUCHTET ist: ein heller Kern in
  ihrer eigenen Form, vierfach ueberlagert und weich gestreut, dazu ein
  Strahlenkranz - davor steht sie als dunkle Silhouette. Der erste Anlauf
  hatte nur einen diffusen Grund und verschwand bei 72 px im Dunkeln.
- ZWEI FASSUNGEN, wie es die Plattformen verlangen: "any" (icon-192,
  icon-512, apple-touch) mit Ring bis zur Kante, und maskable-512 mit Ring
  auf 90 % Durchmesser und kleinerer Figur - Android beschneidet maskable
  je nach Launcher, ein randstaendiger Ring waere dort weggeschnitten
  worden.

## 1.0.80
- ALLE FUESSE AUF EINE LINIE (Besitzer: "die Figuren sind nicht perfekt
  ausgemittelt von der Hoehe, die muessen alle gleich hoch sein"). GEMESSEN:
  die Gemaelde tragen unterschiedlich viel Leerraum unter dem Sockel - er
  streut von 2,1 % (Barde) bis 6,8 % (Haendler) der Bildhoehe, ueber alle
  52 Bilder eine Spanne von 7,3 %. Da alle mit derselben Hoehe ins Feld
  gesetzt werden, schwebt der Haendler damit fast 5 % der Feldhoehe ueber
  der Linie des Barden - genau das sieht man auf dem Brett.
- Jede Figur misst jetzt ihren eigenen Leerraum (sockelmass.messeFusslinie,
  einmal je Bild, Cache wie bei der Sockelkante) und der Glyph zieht die
  Abweichung von der HAUSLINIE (3,1 %, der haeufigste gemessene Wert) ab -
  mit der Bildhoehe skaliert, weil der Leerraum mitwaechst.
- DIE GEPFLEGTEN GROESSEN BLEIBEN UNBERUEHRT: eine Dame darf groesser sein
  als ein Bauer, sie soll nur auf derselben Linie stehen. Ohne Messung
  (Bild noch nicht geladen) ist der Ausgleich null - also exakt der Stand
  von vorher, nie ein Sprung.
- Proben: test_ui +6 auf die pure Messfunktion (kein Leerraum, sieben
  Zeilen, leeres Bild, Hauslinie) und die Anbindung im Glyph.

## 1.0.79
- DAS PORTRAET IM FIGURENBLATT ZEIGTE WEITER RANG I. v1.0.74 hatte nur die
  KACHEL (TileArt) geheilt - das grosse Bild darunter nahm stur
  paintedById(char.id), also immer "gambit", und hat den Rang nie gelesen.
  Jetzt waehlt es das Rangbild. Aufstellung und Weltkarte rechneten ihn
  ohnehin schon selbst; damit stimmen alle drei Orte.
- DAS FEIER-BILD UEBERDECKTE DEN TEXT. maxHeight allein hielt es nicht: der
  Kasten hatte 132 px, aber das Bild wuchs waehrend der Feier auf scale(1.12)
  und ragte unten heraus, mitten in Titel und Geschichte. Jetzt fester
  Kasten mit overflow: hidden, Bild auf height 100 %, Vergroesserung vom FUSS
  aus (transformOrigin bottom) - es waechst nach oben in den freien Raum -,
  der Ueberschwung bleibt unter 1.0, und darunter steht ein fester Abstand.
- Proben: test_anim +5 (Rangbild an allen drei Orten, Kasten schneidet ab).

## 1.0.78
- DREI WEITERE KOMPOSITIONSPROBEN, motivierender als die erste Runde und in
  derselben Klangwelt: Ungarischer Tanz Nr. 5 (nach Brahms, 1869), Danse
  macabre (nach Saint-Saens, 1874), Leichte Kavallerie (nach Suppe, 1866).
  Die Viola da gamba und tiefe Celli bleiben das Rueckgrat - was der Besitzer
  an den bestehenden Stuecken erkannt hatte -, aber jedes Stueck ENTWICKELT
  sich jetzt: Tempowechsel, wachsende Kuehnheit, ein Anziehen zum Schluss.
  Weiterhin kein Schlagzeug, keine tiefen Baesse (klingt auf dem Handy doof).
- Das Musikverzeichnis fuehrt sie mit Originaltitel, Komponist samt Jahr,
  Version (v1.0.78 - so ist beim Hoeren klar, aus welcher Runde ein Stueck
  stammt) und Einsatzvorschlag. Jetzt sechs Proben in der Gruppe
  "Kompositionsproben".

## 1.0.77
- DIE BLAUEN PUNKTE UNTER DEM GAMBIT SIND FORT. Es waren keine Stufenpunkte,
  sondern die SCHILD-Perlen des Schach-Modus: eine blaue Kugel je Schildpunkt,
  unten rechts an der Figur. Weil der Gambit seine Schilde beim Aufsteigen
  bekommt, erschienen sie scheinbar "von den Stufen" - daher die Verwirrung.
  Der Schild geht nicht verloren: er wirkt unveraendert im Kampf und steht
  weiterhin im Figurenblatt und in der Nahansicht; nur das Brett bleibt ruhig.
  Der HP-Modus mit seinem Perlenpaar (Leben links, Kraft rechts) ist davon
  nicht beruehrt.
- Probe in test_ui (+2): die Perlen sind weg UND der Schild wirkt im Kern
  weiter - damit niemand spaeter "aufraeumt" und dabei die Regel mitnimmt.

## 1.0.76
- DER SPRUNG BEIM LANDEN WAR EIN CSS-KONFLIKT, kein Ruckeln. Am gerade
  gezogenen Stueck liefen ggLandung UND ggAtmen auf DEMSELBEN Element -
  beide animieren transform, und bei mehreren Animationen auf derselben
  Eigenschaft gewinnt die ZULETZT genannte. Das Atmen ueberschrieb also die
  Landung und sprang beim Aufsetzen sofort auf seine (per negativem Versatz
  zufaellige) Phase; am staerksten beim Springer, dessen Flug am laengsten
  dauert. Das Atmen liegt jetzt eine Ebene tiefer (am Bildkasten) und ruht
  im Zug nach der Landung - Landung, Blitz und Pop haben transform fuer sich.
- ZIELFELDER DEUTLICH KRAEFTIGER ("man erkennt es fast nicht"): Deckung
  verdoppelt (.24 -> .52 in der Feldmitte), Innenkontur auf 2,5 px bei
  voller Deckkraft plus zarter Aussenschein, und der Atem senkt die
  Deckkraft nur noch auf 82 % statt 62 %.
- DIE SOCKELFAERBUNG SITZT NOCH TIEFER ("bei manchen Figuren minimal zu
  hoch"): volle Deckung bis 42 % der gemessenen Kante (statt 55 %), Auslauf
  bei 85 % (statt 100 %) - sie bleibt jetzt auch bei flachen Tellern sicher
  darunter.
- DIE GEGENSEITE IST WIEDER ENTFAERBT UND DUNKLER. v1.0.66 hatte den alten
  Feindfilter ganz entfernt, weil die Trennung allein die Sockelglut tragen
  sollte - am Geraet reicht das nicht, beide Seiten zeigen ja dasselbe
  Gemaelde. Jetzt halbe Entfaerbung und spuerbar dunkler, aber kein
  Grauschleier: die Figur bleibt erkennbar, sie tritt nur zurueck. Die
  eigene Seite behaelt ihre Originalfarben.
- Proben: test_ui +2 (Gegenfilter vorhanden, Atmen NICHT mehr in derselben
  Animationsliste wie die Landung).

## 1.0.75
- DIE AUFSTIEGSFEIER. Ein Fenster, zwei Anlaesse - beide mit Strahlenkranz,
  aufsteigender Karte und aufspringendem Bild (nur transform/opacity):
  - RANG: wechselt der Gambit seine Stufe (alle zehn Level), zeigt die Feier
    sein NEUES Gemaelde gross, den Stufennamen und eine Zeile Geschichte aus
    GAMBIT_STUFEN (Der Bauer / Der Gepruefte / Der Getragene / Der
    Standhafte / Der Gezeichnete / Der Grand Gambit).
  - FAEHIGKEIT: jede frisch gekaufte Faehigkeit erklaert sich sofort selbst -
    Zeichen, Name und ihre WIRKUNG im Klartext aus ABILITIES.descDe, dazu ob
    sie einmal je Partie oder dauerhaft wirkt. Der Spieler soll nicht
    nachschlagen muessen, was er gerade gekauft hat.
- Die Stufentexte liegen in einer eigenen, IMPORTFREIEN Datei
  (board/gambitStufen.js): erst in paintedArt.js abgelegt, brachen dessen
  webp-Importe die Proben mit ERR_UNKNOWN_FILE_EXTENSION - Daten, die
  Proben lesen sollen, duerfen keine Bilder mitschleppen.
- Proben: test_anim +16 (sechs Stufen mit Text, jede Faehigkeit kann ihre
  Wirkung in beiden Sprachen erklaeren, Rangwechsel wird am TIER erkannt
  statt am Level, drei Keyframes, vier Texte zweisprachig).

## 1.0.74
- DAS FIGURENBLATT ZEIGTE DEN GAMBIT-RANG NIE (Besitzerbefund: "er hat nie
  eine neue Figur bekommen"). URSACHE: TileArt baute sein Stueck aus
  { kind, color, hero, level, bossId } - OHNE tier. paintedForPiece waehlt
  das Gemaelde aber ueber piece.tier, also blieb es seit v1.0.62 immer bei
  Rang I. Die sechs handgefuehrten Bilder existieren und sind verschieden
  (sechs Pruefsummen geprueft); allein der Weg dorthin fehlte. Brett (ueber
  buildArmy) und Karte (rechnet selbst) waren nie betroffen - ausgerechnet
  das Blatt, wo man den Aufstieg sucht, ging leer aus.
- ZIELFELDER STATT ZIELPUNKTE ("der Punkt wird manchmal von den Figuren
  verdeckt - extrem stoerend"). Das ganze Feld faerbt sich jetzt: getoente
  Flaeche mit Innenkontur, UNTER den Figuren (zIndex 1), atmet sehr ruhig
  (ggZielAtem, 2,4 s, nur opacity - kein Layout, kein Ruckeln), mit leichtem
  Phasenversatz je Feld. Gold fuer die eigene Seite, Riss-Violett beim Lesen
  fremder Zuege, Rot beim Schlag (dort bleibt zusaetzlich der Metallring, weil
  "hier hin" und "den da" unterscheidbar bleiben muessen).
- DER KOENIG BLEIBT LIEGEN ("dass er wirklich da liegt und umfaellt"). Bis
  v1.0.73 verblasste er am Ende auf opacity 0 - er loeste sich auf, statt zu
  liegen. Jetzt faellt er schwer (1,8 s, langsamer Beginn, Ueberkippen bei
  62 %, kleiner Rueckpraller wie echtes Holz) und BLEIBT bei 92 Grad liegen.
- Zwei weitere Musikproben, beide mit Steigerung und Kampfgeist:
  Radetzky-Marsch (nach J. Strauss I) und Hummelflug (nach Rimski-Korsakow).
  Das Musikverzeichnis fuehrt sie in neuer Gruppe "Kompositionsproben" mit
  ORIGINALTITEL, Komponist samt Jahr, Version und Einsatzvorschlag - die
  Werkstatt liest Gruppen dynamisch, sie erscheint also von selbst.

## 1.0.73
- DER GAMBIT IST ENDLICH IN JEDEM RANG SO GROSS WIE EIN BAUER. v1.0.66 hatte
  nur Stufe I geradegezogen - der Besitzer spielt laengst hoeher, und BEIDE
  Staffeln stiegen weiter: die Hoehe bis 1.1330 (+6,6 % ueber dem Bauern) und
  der y-Versatz bis -0.0950 (der Held wanderte zusaetzlich nach oben). Jetzt
  sind GAMBIT_TIER_H und GAMBIT_TIER_Y flach auf dem Bauernwert; der Aufstieg
  zeigt sich am Bild, am Goldschein, an der Kontur und am Rangstern - nicht
  mehr an der Koerpergroesse. Proben fuer alle sechs Raenge; die alte Probe
  "die Staffel steigt durchgehend" wurde bewusst umgedreht.
- DIE SOCKELFAERBUNG SITZT TIEFER ("man soll immer noch ein Stueckchen von
  der Farbe des Sockels sehen"). Bis v1.0.72 lief die volle Deckung bis knapp
  unter die gemessene Tellerkante - der ganze Teller war eingefaerbt. Jetzt
  endet sie bei 55 % der Kante, der Auslauf ist AN der Kante fertig: die
  obere Haelfte behaelt ihren Stein, die Faerbung sitzt darunter wie ein
  Schatten, aus dem die Figur waechst.
- ELF NEUE KLAENGE zu den Animationen aus v1.0.67-70, erzeugt nach
  design/KLANG-PROMPTS.md (Hof = Holz auf Holz, Riss = Kristall und
  Entladung, wuerdevoll statt niedlich), Vorlauf abgeschnitten, auf -18 LUFS
  normiert, Opus 96k mono: muenzregen, die vier Schlagarten stoss/klinge/
  wucht/bann, drachenfeuer, koenigsfall, faehigkeit, zerfall, sperrsetzen,
  glanz.
- KLANG UND BILD KOENNEN NICHT AUSEINANDERLAUFEN: die Schlagart kommt beim
  Klang aus DERSELBEN Quelle wie bei der Animation (schlagArt in anim.js).
  Muenzregen haengt am Gold des Banners, Koenigsfall am Matt, Zerfall NUR am
  sichtbaren Stadienwechsel (sonst knirschte es jeden Halbzug), und eine
  Faehigkeit klingt anders als eine blosse Stufe.
- Die Klangwerkstatt fuehrt sie als eigene Gruppe "Schlagarten & Animationen"
  vor - die vier Schlagarten hoert man am besten direkt hintereinander.
- Erste Musikprobe der Hausklangwelt in archiv/musik/probe-hof.mp3 (45 s,
  Kammermusik in Moll, -20 LUFS, 112 kbps mono wie die 36 bestehenden).
- Proben: 24 Suiten, 1244 Assertionen, 0 Fehler (test_anim 100: jede neue
  Datei liegt, ist registriert, hat einen Pegel und steht in der Werkstatt).

## 1.0.72
- DER SOCKEL WIRD JE FIGUR GEMESSEN, NICHT PAUSCHAL ANGENOMMEN (Besitzer:
  "jede Figur einzeln durchpruefen ... nicht die Fuesse oder der Rock der
  Koenigin mitfaerben"). Neues Modul sockelmass.js: beim ersten Zeichnen
  misst jede Figur ihr eigenes Gemaelde (Alpha-Zeilenprofil, einmal je Bild,
  ~3 ms, Cache) und traegt ihre EIGENE Kante - gemessen an 28 Bildern
  streuen sie von 14,6 % bis 21,9 %; der Drache haengt an der Klemme (24 %),
  der Barde ohne messbaren Teller faellt auf konservative 12 %.
- DIE MESSREGEL KOMMT AUS VIER ECHTEN PROFILEN, und der Weg dahin steht im
  Modul: eine naive "Breite faellt unter x %"-Suche feuert auf die
  ELLIPTISCHE Bodenrundung des Tellers (Kanten von 1-4 % - daher wirkte der
  Anstrich wie ein Balken am Boden), und die 72-%-Schwelle unterscheidet
  Teller und Koeniginnenrock (82 % Tellerbreite) NICht. Richtig ist: das
  PLATEAU betreten (>= 97 %), sein ENDE suchen (< 95 %), eine Zeile
  Rundungszuschlag, Klemme [6 %, 24 %]. Der Schlagschatten (Alpha 60-100)
  zaehlt nicht mehr als Zeichnung (Schwelle 130).
- ZWEI VERLAUFSFORMEN AUS EINER KANTE (gegnerstil.sockelVerlauf): farbig
  die Glut (dunkel unten, Gipfel unter der Kante), schwarz/weiss der
  ANSTRICH - voll deckend vom Boden ("der Sockel komplett schwarz"), dann
  vier Prozent weicher Auslauf ("mit einem ganz sanften Verlauf").
- messe_hofstaat 2c: misst die Kanten aller Aufstellungsbilder unabhaengig
  nach (zweite Quelle kontrolliert die erste). test_ui +9 auf die pure
  Messfunktion mit synthetischen Profilen. 24 Suiten, 1230 Assertionen.

## 1.0.71
- SCHWARZ/WEISS TRAEGT JETZT WIRKLICH NUR DEN SOCKEL. Der Besitzerbefund
  ("das Schwarz hat einen Fehler - nicht nur der Sockel ist gefaerbt, so
  ein komischer Verlauf") hatte zwei Ursachen: der radiale SCHEIN hinter
  dem Fuss (78 % Feldbreite) und der BODENSCHLEIER ueber die VOLLE
  Feldbreite (bei Schwarz 0,62 Deckung - ein dunkler Balken uebers Feld)
  liefen aus der farbigen Fassung mit. Beide stehen jetzt hinter dem
  nurSockel-Riegel: bei Schwarz/Weiss bleibt allein die auf die Figur
  maskierte Glutkopie. Die farbige Fassung ist unveraendert.
- Probe in test_ui (+2): der Riegel existiert, Schein und Schleier stehen
  dahinter. 24 Suiten, 1221 Assertionen, 0 Fehler.

## 1.0.70
- DER LEBENSTRANK LEUCHTET DURCH DIE FIGUR (Besitzerwunsch woertlich): beim
  Einsatz laeuft ein roter Heilglanz einmal von unten nach oben - MASKIERT
  auf das eigene Gemaelde (WebkitMaskImage = die Bilddatei selbst), nicht als
  Fleck ueber dem Feld. Der Glanz liegt im selben Wrapper wie das Bild und
  erbt dessen fit-Transform: Glanz und Figur sind deckungsgleich.
- DER ZEITENWENDER HAT EINEN ORT: verbrennt eine Sanduhr, pulst die Uhr
  dreimal golden auf.
- FAEHIGKEIT SICHTBAR ERLANGT: bringt die neue Stufe eine Faehigkeit,
  laeuft der Verbessern-Glanz VIOLETT statt gold und die frisch erwachte
  Sprosse pulst in der Leiter - der Unterschied zwischen "eine Stufe mehr"
  und "eine FAEHIGKEIT mehr" ist zu sehen, nicht nachzulesen. Die
  Lernzeilen im Siegesbanner treten jetzt gestaffelt auf.
- Register 10 -> 13 (trank, sanduhr, faehigkeit), Kammer fuehrt alle drei
  vor, drei neue Keyframes (weiter nur transform+opacity).
- URSACHE eines Kettenbruchs unterwegs: ein abgebrochener Patch-Lauf hatte
  die effekt-VERWENDUNG geschrieben, aber nicht die SIGNATUR - 529
  Kampagnenknoten fielen im Smoke. Der Reinraum haette es gefangen; der
  Smoke fing es frueher.
- Proben: 24 Suiten, 1219 Assertionen, 0 Fehler (test_anim jetzt 51).

## 1.0.69
- DER CI-LAUF SCHEITERTE AN 73 DATEINAMEN, nicht am Code: die Figurenbilder
  019 bis 091 hiessen woertlich "NNN_?.png". Unter Linux erlaubt, fuer NTFS
  und damit fuer GitHubs Artefaktspeicher verboten - der Fehler lag Monate
  unsichtbar im Baum, weil lokal alles lief; erst der Artefakt-Upload deckte
  ihn auf. Alle 73 (plus ihre 73 Vorschauen in public/bildarchiv-klein)
  heissen jetzt NNN_unbenannt.png.
- DAMIT ES NIE WIEDER PASSIERT: neue Waechterprobe
  tools/pruefe-dateinamen.mjs als Suite in der Kette. Sie prueft JEDEN
  Dateinamen, den git kennt, gegen die Verbotsliste des Artefaktspeichers
  (" : < > | * ? und Zeilenumbrueche) - mit NUL-getrennter Messung, damit
  auch ein Name MIT Zeilenumbruch die Pruefung nicht taeuscht.
- DIE NODE-20-WARNUNG IST BEHOBEN: checkout, setup-node und upload-artifact
  von @v4 auf @v7 gehoben - die Hauptversionen per GitHub-API gemessen, nicht
  geraten. Gilt fuer ci.yml und release-itch.yml.
- Proben: 24 Suiten (neu: pruefe-dateinamen), 1210 Assertionen, 0 Fehler.

## 1.0.68
- DIE ANIMATIONSKAMMER HAT IHRE TUER IN DER VERWALTUNG. Sie stand seit
  v1.0.67 nur als nackte Adresse im Hinweistext des Schalters - wer die
  Verwaltungsliste im Profil als DEN Zugang zu allen Werkbaenken kennt
  (Spielerbuch, Werkstatt, Klangwerkstatt, Musterkammer), haette sie dort
  nie gefunden. Jetzt steht sie in derselben Liste; der Hinweistext beim
  Schalter verweist auf die Tuer statt auf die Adresse. Probe in test_anim
  (42 Zusicherungen).

## 1.0.67
- DIE ANIMATIONEN DES SPIELS, in einem Zug und mit einer Liste. Neues Modul
  anim.js traegt das REGISTER aller zehn Bewegungen - was dort nicht steht,
  existiert nicht, und was dort steht, prueft test_anim.mjs (neue Suite, 41
  Zusicherungen) gegen Kammer, Theme und jede Einbaustelle.
- AUF DEM BRETT: der Zugschweif ist kraeftiger (mehr Gold, breiter, weisser
  Kern) und glueht am Ziel kurz auf. Jede Figurenart SCHLAEGT auf ihre Weise
  (Besitzerbild "der Schildtraeger schiebt"): stoss / klinge / wucht / bann,
  der Drache speit bei Distanzschlaegen eine Feuerzunge. Die Aufstellung LEBT:
  jede Figur atmet kaum merklich, phasenversetzt ueber negativen Start (kein
  synchrones Wippen, keine Wartezeit). Der bedrohte Koenig traegt einen roten
  SCHACHPULS; beim Matt KIPPT der geschlagene Koenig sichtbar durch das
  durchscheinende Banner. Steigt eine Figur mitten im Gefecht auf, birst ein
  Stufenstern ueber ihr.
- SIEG UND BELOHNUNG: das Banner tritt gestaffelt auf (Titel, Beute, Stufe
  nacheinander), ueber der Goldmarke fallen DREHENDE MUENZEN (rotateY) und
  der Betrag ZAEHLT in 0,9 s hoch - man sieht, dass man Geld verdient.
- IM FIGURENBLATT: jedes Verbessern schickt einen Lichtstreif uebers
  Portraet und einen Sternenstoss - auch wenn die Stufe kein neues Gemaelde
  bringt ("trotzdem so einen Schein").
- DER EINE SCHALTER: an/aus im Geraetespeicher (gg:anim), bedienbar im
  Admin-Profil und in der neuen ANIMATIONSKAMMER (?animkammer, hinter dem
  Torschloss) - sie liest das Register und fuehrt jede Bewegung auf einer
  Buehne mit den ECHTEN Keyframes vor. Wer im Betriebssystem "Bewegung
  reduzieren" waehlt, startet mit aus.
- DIE RUCKEL-LEHRE GILT: alle neuen Keyframes bewegen nur transform und
  opacity - kein width/height, kein box-shadow im Takt (v1.0.37/41). Eine
  eigene Probe haelt das blockgenau fest.
- Proben: 23 Suiten (neu: test_anim), 1206 Assertionen, 0 Fehler.

## 1.0.66
- DER BAUER IST JETZT WIRKLICH SO GROSS WIE DER GAMBIT - und v1.0.65 war es
  nicht, obwohl die Messung "gleich gross" sagte. Sie hat die KAESTEN
  verglichen (beide 121x121), gezeichnet wird die Figur aber vom Hoehenfaktor
  in paintedArt.js: Bauer 0.8977 gegen Gambit 1.0625, also 18 % hoeher. Kein
  Auge sieht den Kasten, jedes sieht die Figur. Beide Gemaelde messen 92,9 %
  Figurenhoehe und 3,5 % Fussabstand, der Gleichstand ist also echt. Die
  Raenge II-VI wachsen weiter.
- DIE SOCKELGLUT STEHT AUF DEM KOPF - im Sinne des Besitzers ("zu hell").
  Ihr Maximum lag ganz UNTEN (0,96 bei 5 %): der Fuss leuchtete greller als
  der Sockel darueber. Jetzt beginnt sie dunkel (0,18 am Boden), erreicht
  ihren Gipfel am Sockelrand (13 %) und endet unveraendert bei 19 % - nicht
  hoeher, nur anders verteilt. Darunter liegt ein schwarzer Schleier, damit
  die Glut aus dem Schatten aufsteigt statt im Hellen zu beginnen.
- DIE EIGENE SEITE GLUEHT MIT - in Gold. Bisher glomm nur der Gegner; jetzt
  dasselbe Bauwerk in zwei Toenen, "dann ist da eine klare Unterscheidung".
- ZWEI SEHWEISEN STATT DREI. Die Graustufen fallen weg ("die fallen jetzt eh
  weg") - ihr Platz traegt die zweite Glutfassung: farbig (Gegner lila, eigene
  Seite gold) oder ohne Farbe (Gegner schwarz, eigene weiss). Beide betreffen
  NUR die Glut; die Figur zeigt in beiden ihre Originalfarben. Die Wahl steht
  weiterhin allein in der Admin-Rubrik, alle Spieler sehen die farbige
  Fassung. Alte Profilwerte werden gelesen: farbig -> getoent, grau ->
  schwarzweiss, damit niemand stillschweigend etwas anderes sieht.
- DAS FAVICON ZEIGT DIE FIGUR, NICHT EIN WAPPEN. Die alte Zeichnung war bei
  16 px ein Fleck ("ist ein bisschen untergegangen"). Jetzt steht der Grand
  Gambit selbst auf 88 % der Hoehe - bei 32 px belegt er 28 Pixel -, auf
  dunklem Grund mit violettem Schein und dem goldenen Rand als Abschluss.
  Vier Fassungen erneuert: favicon.svg (in Chrome die massgebliche, sonst
  waere die alte Zeichnung stehen geblieben), favicon.ico, favicon-32,
  favicon-16. Beide Sammelfassungen sind dabei kleiner geworden.
- Proben: 22 Suiten, 1165 Assertionen (test_ui +15).

## 1.0.65
- DIE FIGUREN SASSEN NIE SCHIEF - DIE KACHEL TAT ES. Vierter Besitzerbefund
  zur Mitte, und diesmal gemessen statt geschlossen: am lebenden DOM sitzt
  JEDE Hofstaat-Figur exakt 9,2 px von 119 px rechts der Kachelmitte, alle
  gleich viel. Genau das verraet die Bauweise und nicht das Gemaelde. Ursache:
  `margin: 0 auto` zentriert nicht, wenn der Kasten breiter ist als sein Elter
  (die Kachelbilder stehen auf 118 %) - CSS verwirft bei ueberbestimmten
  Raendern den rechten und macht den linken zu null, das Bild haengt mit seiner
  ganzen Ueberbreite nach rechts. Jetzt linker Rand 50 % und das Bild um seine
  halbe eigene Breite zurueck; nachgemessen 0,0 % bei allen 14 Kacheln.
  Damit ist auch erklaert, warum v1.0.49 (x-Versatz), v1.0.52 (Sockel statt
  Silhouette) und v1.0.62 (Bilder gerichtet) das Problem nie loesten: sie haben
  die GEMAELDE vermessen, waehrend der Versatz aus dem RAND kam. Die Bilder
  selbst sind gut - nachgemessen mit enger Alphaschwelle: Hoehe 92,0-92,9 %,
  Sockelmitte innerhalb von 0,5 %.
- DER BAUER IST SO GROSS WIE DER GRAND GAMBIT und steht genauso hoch.
  v1.0.14 hatte dem Helden absichtlich eine Stufe mehr gegeben (10,5vw gegen
  9,4vw); auf 390 px sind das 41 gegen 37 px, und weil beide Bilder in ihrer
  Zelle mittig sitzen, lagen auch Ober- und Unterkante auseinander - eine
  Reihe, die nicht auf einer Linie steht. Jetzt ein Mass fuer alle acht
  (nachgemessen: 37x41, Oberkante 246, Unterkante 287, ausnahmslos). Kenntlich
  bleibt der Held durch goldenen Schein, goldene Kontur und den Stern - Zeichen,
  die keine Groesse brauchen. Im schlichten Stil ebenso.
- DAS FIGURENBLATT ZEIGT SEIN BILD FREI, wie das Monsterblatt es immer tat.
  Die gerahmte Platte ist fort: keine goldene Kontur, kein eigener Grund, kein
  overflow-hidden (das schnitt gross gezogene Figuren an). Statt dessen genau
  die Behandlung der Monsterkarte - 148x178, unten verankert, violetter Schein.
  Besitzerentscheid nach Vergleich beider Blaetter.
- ZUR FRAGE, warum Monster und Meister ueberhaupt anders aussahen: es sind zwei
  getrennte Bauwerke (CharCard fuer Figuren, der X:-Zweig fuer Meister), keine
  Zustandsfrage. Bestechen aendert die Blattform NICHT - es schaltet im selben
  Blatt nur die Verbessern-Steuerung frei.
- Neues Messwerkzeug messe_hofstaat.mjs: misst Kachelmitte gegen Bildmitte,
  Bauer gegen Held und den Kopf beider Blattformen. Haelt zwei Stolpersteine
  fest: der Dock-Knopf "Figuren" fuehrt in die AKADEMIE, der Hofstaat liegt
  unter "Lager"; und zwei Knoepfe tragen dieselbe Aufschrift - der Reiter steht
  im DOM zuerst.
- Proben: 22 Suiten, 1150 Assertionen (test_ui +7).

## 1.0.64
- DIE SCHAUKAMMER SAGT JETZT AUCH, WAS FEHLT. Sie zeigte bisher nur, was DA
  IST - und genau darum war die Luecke unsichtbar, die v1.0.63 aufgerissen
  hat: Zaun und Bollwerk sind seither kaufbar, ohne dass es ein Gemaelde zu
  ihnen gibt. Man sah das nur, wenn man im Spiel zufaellig einen Zaun setzte,
  nicht dort, wo die Bilder verwaltet werden. Neuer Reiter "Fehlt noch": sechs
  Kacheln (Zaun und Bollwerk, je heil/angeschlagen/Truemmer), jede mit der
  Ersatzzeichnung, die derzeit an ihrer Stelle steht, und dem Dateinamen, unter
  dem das Gemaelde erwartet wird.
- DIE LISTE IST NICHT ABGESCHRIEBEN, sie rechnet sich aus den Nullen in
  sperrenArt.js selbst aus (fehlendeSperrBilder()). Eine zweite, von Hand
  gepflegte Liste stuende am Tag des ersten neuen Gemaeldes falsch da, und
  niemandem fiele es auf - derselbe Fehler, der die Kammer schon einmal 382
  Bilder in den Sammelreiter schieben liess. Sobald ein Bild unter dem
  genannten Namen liegt, verschwindet seine Kachel von allein.
- Der Reiter steht bewusst NEBEN den Gruppen, nicht darin: die Bestandstafel
  rechnet je Gruppe sicher/gesamt und haette bei einer Gruppe ohne ein einziges
  vorhandenes Bild durch null geteilt.
- URSACHE, nicht Symptom: scripts/verify-boot.mjs meldete gruen und kam nie
  zurueck. jsdom haelt mit pretendToBeVisual einen Bildtaktgeber offen, und
  Node beendet sich nicht, solange ein Zeitgeber laeuft - das CI-Tor blieb
  haengen und jede Sitzung musste seinen Ausgang aus dem Text lesen statt am
  Rueckgabewert. window.close() nimmt jsdom die Taktgeber, exit(0) macht den
  Erfolg zur Zahl.
- Proben: 22 Suiten, 1143 Assertionen (test_ui +5: die Fehlliste nennt genau
  die Arten ohne Bild, und jede Luecke traegt wirklich eine Ersatzzeichnung).

## 1.0.63
- SPERREN LASSEN SICH ENDLICH KAUFEN UND SETZEN. Regelwerk (v0.90) und Bilder
  (v1.0.46) standen laengst - nur konnte niemand je eine Sperre besitzen. Zaun,
  Mauer und Bollwerk liegen jetzt im Buendel des Kraemers (40/110/240 Gold, ab
  4/6/9 gemeisterten Stationen); die Preise stehen weiterhin allein in
  core/rules/sperren.js, damit es sie nicht zweimal gibt.
- Gesetzt wird VOR dem ersten Zug, auf ein freies Feld der dritten oder vierten
  EIGENEN Reihe, hoechstens zwei je Seite. Nochmal antippen nimmt zurueck;
  verbraucht ist nur, was beim Start wirklich steht. Waehrend des Setzens ruhen
  Brett und Uhr.
- NICHTS HAELT EWIG: jede Sperre verliert alle sechs Zuege einen Punkt, ganz
  ohne Schlag. Zaun 6, Mauer 12, Bollwerk 18 Zuege - keine ueberdauert die 20
  Zuege, die der Besitzer als Grenze gezogen hat.
- URSACHE, nicht Symptom (drei Fehler, die erst jetzt schaden konnten, weil nie
  jemand eine Sperre auf ein echtes Brett bekam):
  * Der Schlag gegen eine Sperre legte den ZUG in die Historie, aus der undo()
    einen ZUSTAND zurueckgibt - der Zeitenwender haette ein Zugobjekt als Brett
    ausgeliefert. Jetzt legt auch dieser Zweig den vorigen Zustand ab.
  * Derselbe Zweig zaehlte in `ns.ply` weiter, ein Feld, das cloneState gar
    nicht mitkopiert und niemand liest. Der Schlag kostet den Zug, also dreht er
    jetzt moveCount - sonst alterte keine Sperre, waehrend man auf sie einschlug.
  * Der Doppelschritt des Bauern prueft nur das Brett, nicht die Sperren - und
    sein Ziel IST die dritte Reihe. Er waere mitten in die eigene Mauer gelaufen.
- Der Schnappschuss (encodeState) traegt Sperren und Fallen mit. Ohne das
  verlor eine pausierte Kampagnenpartie beim Fortsetzen jede bezahlte Mauer;
  fortgesetzte Partien rechnen ihre stehenden Sperren jetzt auch korrekt ab
  (vorher: pausieren, fortsetzen, Mauer geschenkt).
- Zaun und Bollwerk haben noch keine Gemaelde und wurden darum GAR NICHT
  gezeichnet ("lieber nichts als falsch" - richtig, solange niemand sie kaufen
  konnte, falsch ab dem ersten bezahlten Zaun). Bis die Bilder kommen, springt
  eine Zeichnung ein (sperrenVektor.jsx), auf dem Brett wie im Laden.
- Am lebenden DOM gemessen und danach geaendert: der Setzbalken hing im
  Brettkasten und verdeckte auf einem 390er Telefon 128 px des Bretts - zwei
  Drittel der dritten Reihe, also genau eines der Felder, die man antippen
  soll. Er sitzt jetzt darunter (verdeckt: 0). Ebenfalls gemessen: 20 leuchtende
  Felder, Setzen/Zuruecknehmen, und der Bauer vor der Sperre hat nur noch EIN
  Ziel - den Schlag gegen sie.
- Messwerkzeug messe_sperren.mjs (Konto anlegen, Vorrat fuellen, Setzphase am
  lebenden DOM vermessen). drive3.mjs duldet jetzt auch
  ERR_TUNNEL_CONNECTION_FAILED fuer die bekannt unerreichbare Halle - in einer
  Sandbox mit Netz-Vermittler meldet Chromium denselben Fehlschlag anders.

## 1.0.47
- Admin-Passwort gewechselt. Das vorherige stand seit v1.0.39 im Klartext in
  der (oeffentlichen) Commit-Historie; der Klartext des neuen hat das
  Programm, dieses Repo und den Chat nie beruehrt - nur Salz und
  SHA-256-Pruefwert liegen im Code, kein Rueckschluss auf das Wort moeglich.
  Das Salz ist jetzt reiner Hex-Text (0-9a-f), wie test_features.mjs es
  ohnehin schon verlangte - im ersten Anlauf hatte ich versehentlich das
  breitere Alphabet aus rid() verwendet und die eigene Probe damit rot
  laufen lassen.

## 1.0.46
- DIE SPERREN WERDEN GEZEICHNET. Die Regeln dazu gibt es seit v0.90 -
  sperren.js hing allein an transitions.js und kam in der Oberflaeche nie
  vor. Mauer jetzt in drei Zustaenden am Brett (heil, angeschlagen,
  Truemmer), aus stadium().
- Truemmer verblassen: zwei Sekunden voll sichtbar, dann ueber anderthalb
  Sekunden auf ein Fuenftel. Sie liegen unter der Figur (zIndex 0) und
  bleiben als Narbe stehen, statt ganz zu verschwinden.
- Zaun und Bollwerk stehen ausdruecklich als null im Bilderverzeichnis -
  eine Art ohne Bilder zeichnet nichts statt etwas Falsches.

## 1.0.45
- ZWEI VOELKER AM BRETT: eigene Bauern gruen (carved-pawn-light),
  gegnerische blau (painted-pawn). Freund und Feind unterscheiden sich jetzt
  am BILD, nicht nur am Farbfilter.
- Das erzwungene Stufe-II-Bild des Helden ist fort. Math.max(2, ...) zeigte
  ab dem ersten Atemzug den schwarz-goldenen Prunkritter - eine andere
  Bildwelt als die Holzfiguren, was auffiel, sobald die Stilweiche gefallen
  war. Der Rang folgt wieder der Stufe: Erwachter = Rang I = frueherer
  Gambit, Prunkritter ab Stufe 11.
- Mauer in drei Zustaenden eingelegt (heil, angeschlagen, Schutt), 192 px
  fuers Brett und 576 px fuers Blatt.

## 1.0.44
- Freigabe-Fenster: sagt, wenn sich etwas geoeffnet hat (Held, hintere Reihe,
  Lebenspunkte). Titel und Text liegen bei der Freigabe selbst, nicht in
  App.jsx. In BEIDEN Rueckgabezweigen. Merker teilt sich profile.notices mit
  den Lehrstunden, Praefix "frei:".
- Drei Sichtbarkeitsstufen angeschlossen: Akademie, Chronik, Kampfleiste.
  Verborgenes faellt weg, Verriegeltes bleibt mit seinem Grund. Die
  Kampfleiste bot bisher die im Zug verriegelten Reichweiten-Kuenste als
  spielbare Karten an.

## 1.0.43
- Die Freischalt-Ordnung (src/meta/freigaben.js): Kapitel I reines Schach →
  Erwachen bringt Stufe 2, erste Faehigkeit und die Heldenspalte → erste
  fremde Figur oeffnet die hintere Reihe → Schwelrain bringt HP.
- Gambit-Leiter gedreht: Sprosse 2 traegt den Vorwaertsschlag statt eines
  Schilds, damit der Erwachte sich nicht nur am Bild unterscheidet.

## 1.0.42
- Der Erwachte traegt seine Stufe wirklich (vorher nur das Bild).
- Drei Sichtbarkeitsstufen in den Daten (sperre: riegel/verborgen) statt
  hpOnly zu ueberladen. Kapitel I: 18 wirken, 2 verriegelt, 6 verborgen.
- Die violette Faehigkeitskugel ersetzt den goldenen Stern; verbraucht
  erlischt sie, statt zu verschwinden.

## 1.0.41
- RUCKELN GEFUNDEN: nicht die Bildgroesse, die Filterkette. Klassische
  Figuren trugen einen drop-shadow, alle anderen bis zu neun. Gemessen am
  Brett-Pruefstand: Median 1656 ms → 98 ms, Faktor 17.
- Ein Figurensatz statt zwei; der Zweitsatz hatte keine 192-px-Fassungen.
- Schaukammer: zuordnung.json neu gerechnet (64 → 205 sicher), 240 + 447
  Vorschauen neu gebaut, Reiter richtiggestellt.

## 1.0.40

- KEIN PASSWORT MEHR IM PROGRAMM. In v1.0.39 hatte ich das Admin-Wort im
  KLARTEXT nach accounts.js geschrieben - in ein Verzeichnis, das auf
  GitHub liegt. Das war falsch, und der Besitzer hat zu Recht
  widersprochen: ein Wort, das dort steht, ist kein Geheimnis mehr, ganz
  gleich wie gut es gewaehlt ist. Ich haette es gar nicht erst tun
  duerfen.
- Jetzt liegen dort nur SALZ und PRUEFWERT. Aus ihnen laesst sich das Wort
  nicht zurueckrechnen; das Admin-Konto wird damit angelegt, ohne dass der
  Klartext das Programm je beruehrt. Die Werkzeugtuer trug von Anfang an
  nur einen Pruefwert.
- Die Proben legen sich fuer ihre Zwecke ein EIGENES Testwort auf das
  Konto, statt das echte zu brauchen - drei Proben halten ausserdem fest,
  dass kein Klartext zurueckkehrt.
- ACHTUNG, VOM BESITZER ZU ERLEDIGEN: der Klartext steht weiterhin in der
  VERGANGENHEIT des Verzeichnisses (Commit d5497cf, bereits
  veroeffentlicht). Ihn dort zu entfernen erfordert ein Umschreiben der
  Historie; einfacher und sicherer ist es, ein anderes Wort zu waehlen.

## 1.0.39

- DIE FIGUREN IN HOHER QUALITAET SIND DA: 52 Originale in 1024x1024
  (94 MB) liegen im Archiv unter archiv/bilder/figuren-hq. Alle 52 Namen
  passten auf Anhieb zum Bestand - kein Zuordnen noetig.
- AUS IHNEN NEU GESCHNITTEN: jede Spielfassung stammt jetzt direkt aus dem
  1024er Original statt aus einer bereits verkleinerten Datei - ein
  Neuabtasten weniger, also schaerfer. 576 px fuer Hofstaat, Popup und
  Zoom, 192 px fuers Brett.
- NEUES HAUSWORT fuer das Admin-Konto (Besitzerwunsch).
- DIE WERKZEUGE SIND VERSCHLOSSEN: Schaukammer, Klangwerkstatt und
  Spielerbuch hingen allein an einem Adressanhaengsel - wer "?werkstatt"
  kannte, war drin. Jetzt fragt eine Tuer nach dem Wort des Hauses; einmal
  geoeffnet, bleibt sie es fuer diese Sitzung. Im Programm liegt dafuer nur
  ein Pruefwert (SHA-256), kein Klartext - eine Probe haelt das fest.
- WAS AUSSORTIERT IST, IST WEG (Besitzerwunsch): ein als "archivieren"
  oder "loeschen" markiertes Bild blieb bisher in der Uebersicht stehen und
  zaehlte oben weiter mit - man raeumte auf und sah davon nichts. Jetzt
  verschwindet es aus der Liste, aus der Zaehlleiste UND aus der
  Gruppentafel; stattdessen steht dort, wie viele beiseitegelegt wurden.
  Die Merkliste bleibt unangetastet, der Griff ist also umkehrbar.

## 1.0.38

- DAS RUCKELN - DER BESITZER HAT ES GEFUNDEN, NICHT ICH. Seine
  Beobachtung: klassisches Schach laeuft fluessig, mit den GEMALTEN
  Figuren ruckelt es. Ich hatte an vier Zeichenposten gemessen und lag mit
  allen daneben; er hat den Unterschied gesehen, an dem es wirklich haengt.
- NACHGEMESSEN, und der Befund ist eindeutig:
      klassische Figur   224x384 px  =  0,086 Megapixel
      gemalte Figur      576x576 px  =  0,332 Megapixel
  Auf einem 50-px-Feld ist das eine Verkleinerung um Faktor NEUN. Solange
  nichts passiert, haelt der Browser das Ergebnis fest; sobald sich der
  Massstab aendert - und genau das tut er beim ANTIPPEN, wo die Auswahl auf
  1,58 waechst - muss er alle 32 Figuren neu abtasten. Daher das Ruckeln
  beim Klicken, und daher nur bei den gemalten.
- Das Brett traegt jetzt 192-px-Fassungen: bei dreifacher Pixeldichte sind
  das 150 echte Pixel auf einem 50-px-Feld, also reichlich Reserve - aber
  ein NEUNTEL der Flaeche. In Zahlen: 65 Figuren, 4326 KB -> 762 KB.
- Die grossen Bilder bleiben, wo man sie wirklich gross sieht: Hofstaat,
  Popup, Zoom, Schaukammer. Fuenf Proben halten fest, dass jede gemalte
  Figur ihren kleinen Zwilling hat, dass es verschiedene Dateien sind und
  dass nur das Brett danach greift.

## 1.0.38

- DAS RUCKELN IST GEFUNDEN - vom Besitzer, nicht von mir. Sein Befund:
  mit den KLASSISCHEN Figuren laeuft alles fluessig, mit den gemalten
  nicht. Das schliesst mit einem Schlag alles aus, was bei beiden
  Saetzen gleich ist - Brett, Hintergrund, Uebergaenge, Masken, Schatten.
  Genau die vier Dinge, an denen ich gemessen und nichts gefunden hatte.
- DIE URSACHE LAG IN DEN DATEIEN: gemalte Figuren 1024x1024, klassische
  224x384. Dargestellt wird eine Figur auf dem Brett mit rund 70 px, im
  Popup mit 178 - bei dreifacher Pixeldichte also hoechstens ~534 px. Die
  gemalten Figuren waren also rund viermal zu gross in jeder Kante.
  Entscheidend ist nicht die Dateigroesse, sondern der BILDSPEICHER: eine
  dekodierte 1024er Figur belegt 4 MB, zwoelf davon auf einem Brett 48 MB.
  Der klassische Satz kam mit 3,9 MB aus - der Zwoelffache Unterschied,
  den der Besitzer gespuert hat.
- Alle 57 gemalten Figuren und 114 geschnitzte auf hoechstens 576 px
  gebracht (534 gebraucht, etwas Reserve). Ergebnis:
    Bildspeicher je Figur   4,00 MB -> 1,27 MB
    zwoelf Figuren             48 MB ->   15 MB
    Dateien gemalt          12,8 MB -> 4,3 MB
    Dateien geschnitzt       5,5 MB -> 2,7 MB
- QUALITAET NACHGEMESSEN, nicht behauptet: in der GROESSTEN Darstellung
  (Popup, 178 px) betraegt die Abweichung zum Original 3,2 bis 4,1 von
  255 - fuer das Auge nicht zu sehen.
- Ein Waechter im Test meldet kuenftig jede Figur, die wieder zu gross
  eingelagert wird.

## 1.0.37

- DER SPARMODUS: vier Zeichenposten, im Profil EINZELN abschaltbar -
  Landschaft hinter dem Brett, weiche Auswahl, Schatten unter den Figuren,
  weicher Brettrand. Die teuersten stehen oben, damit der erste Versuch
  der beste ist.
- WARUM ES IHN GIBT, statt dass ich einfach repariere: Ich habe das
  Ruckeln gemessen - mit vierfach gedrosselter Rechenleistung, mit Profil,
  mit A/B-Versuchen - und dabei zwei eigene Verdaechtige WIDERLEGT. Weder
  die Randmasken (1116 ms gegen 1133 ms) noch die Schlagschatten der
  Figuren (1116 gegen 1050) machten einen Unterschied. Das Profil zeigte:
  nur 30 ms entfallen auf ausgefuehrtes Programm, die Zeit geht ins
  ZEICHNEN - die Wahl der Technik ist also nicht der Flaschenhals.
- ENTSCHEIDEND ABER: Mein Messplatz ist ein Browser OHNE Grafikkern, der
  in Software zeichnet. Er ist kein Telefon, und seine Zahlen taugen nicht
  als Mass fuer eines. Weiterzuraten waere billig gewesen; ab jetzt misst
  das Geraet, auf dem es klemmt.
- Voreinstellung ist ALLES AN - niemand bekommt ein aermeres Spiel, weil
  er die Einstellungen nie geoeffnet hat. Neun Proben halten fest, dass
  jeder Schalter wirklich etwas bewegt: ein Schalter, der nur dasteht,
  waere schlimmer als keiner, weil er ein falsches Messergebnis liefert.

## 1.0.37

- DAS RUCKELN BEIM ANTIPPEN WAR MEINE EIGENE ARBEIT. In v1.0.34 bekam
  jedes der 28 Randfelder eine CSS-Maske, an den Ecken sogar zwei
  uebereinander - genau davor hatte ich in v1.0.25 selbst gewarnt: Masken
  sind auf Telefon-Grafikkernen teuer, weil der Browser fuer jede eine
  eigene Ebene aufbaut und bei jedem Neuzeichnen neu zusammensetzt. Bei
  jeder Auswahl geschah das 28-mal. Ein FARBVERLAUF leistet dasselbe und
  kostet fast nichts - sichtbar ist der Unterschied nicht, messbar schon.
- DIE 64 EINZELBLENDEN SIND EINE GEWORDEN. Die 1,8-s-Blende beim
  Partiestart sass auf JEDEM Feld - 64 gleichzeitig laufende Uebergaenge,
  die der Browser einzeln verwaltet. Sie sitzt jetzt am Brett-Rahmen: eine
  Ebene, die auf die Grafikkarte wandert, statt 64 Rechnungen.
- DIE AUSGEWAEHLTE FIGUR BEKOMMT IHRE EIGENE EBENE. Jede Figur traegt
  einen drop-shadow - einen echten Filter. Waehrend die Auswahl auf 1,58
  waechst, muesste er in jedem Bild neu berechnet werden; willChange legt
  Figur samt Schatten einmal auf eine Ebene und verschiebt sie danach nur
  noch. Bewusst NUR fuer die ausgewaehlte Figur - 32 Dauerebenen waeren
  auf schwachen Geraeten teurer als das Problem.
- EHRLICH ZUR MESSGRENZE: Ein CPU-Profil waehrend des Antippens zeigt zu
  99,7 % Leerlauf - gerechnet wird also fast nichts, das Ruckeln sitzt im
  ZEICHNEN. Das laesst sich in dieser Umgebung nicht messen (kein echter
  Grafikkern), nur an seinen bekannten Ursachen angehen. Ob es auf dem
  Geraet reicht, muss der Besitzer sagen.

## 1.0.36

- LEISTUNG GEMESSEN, EIN GROSSER HEBEL GEFUNDEN: Die Inline-Grenze des
  Baus lag bei 400 KB. Alles darunter wanderte als base64 ins JS-Buendel -
  gemessen 1,71 MB in 58 Dateien, also 61 % des Buendels, darunter drei
  JPEGs von zusammen 1 MB. Das kostet doppelt: base64 traegt ein Drittel
  Ballast, UND der Browser muss die ganze Fracht parsen, ehe die erste
  Zeile Programm laeuft.
- Jetzt 4 KB, die uebliche Grenze. Ergebnis, beide Male am laufenden
  Spiel gemessen:
    Buendel      2,79 MB -> 1,21 MB
    Startlast    3,4 MB  -> 1,7 MB
    Arbeitsspeicher 13 MB -> 7 MB
  Die grossen Kartenbilder (fuenf Landschaften zu je ~460 KB) liegen jetzt
  als eigene Dateien daneben und werden erst geholt, wenn die Karte sie
  braucht - beim Start faellt fast 1 MB weg, den niemand sieht.
- EHRLICH DAZU: Im lokalen Messaufbau wurde die reine LADEZEIT dabei
  leicht schlechter (4,6 s -> 5,2 s), weil dort 34 zusaetzliche Abrufe
  ueber einen einfachen Testserver ohne HTTP/2 laufen. Auf dem echten
  Weg ueber Cloudflare gilt das nicht: dort laufen Abrufe parallel, und
  halbe Fracht bleibt halbe Fracht. Die Zahl steht hier, damit sie nicht
  unter den Tisch faellt.
- Der Einzeldatei-Bau ist unberuehrt: er packt mit esbuild und eigener
  Grenze, nicht ueber diese Regel (nachgeprueft, 66481 KB wie zuvor).

## 1.0.36

- DER ERSTE START DAUERT EIN VIERTEL SO LANG. Gemessen im laufenden
  Spiel: der Vorlader brauchte 20,6 Sekunden, jetzt rund 5 (drei Laeufe:
  6,4 / 5,4 / 5,0). Der erste sichtbare Inhalt kommt nach 200-560 ms
  statt nach 2348 ms.
- URSACHE WAR NICHT DIE BANDBREITE, SONDERN DIE ANZAHL: der Vorlader holt
  rund 400 Dateien, zusammen keine 900 KB - aber mit nur acht Spuren sind
  das fuenfzig Runden, und jede Runde kostet ihren eigenen Aufschlag.
  Zwanzig Spuren teilen dieselbe Arbeit auf ein Viertel der Runden.
- DAS BOOTBILD WOG 297 KB - als PNG, und es ist das ALLERERSTE, was
  jemand von diesem Spiel sieht. Als WebP mit erhaltener Transparenz sind
  es 65 KB: 78 % weniger, ohne sichtbaren Unterschied.
- NACHGESEHEN UND FUER GUT BEFUNDEN: Das dist-Verzeichnis wiegt 479 MB,
  davon 338 MB Bildarchiv und 38 MB Klangarchiv. Beide gehoeren der
  Schaukammer (dem Werkzeug des Besitzers) und werden NICHT vorgeladen -
  sie kosten einen Spieler nichts.
- OFFEN UND BENANNT: 61 % des Buendels (1,7 von 2,8 MB) sind als base64
  eingebettete Bilder. Sie auszulagern waere der naechste grosse Hebel -
  aber ein Eingriff in jedes Bauskript, und dafuer ist kurz vor dem Test
  nicht der richtige Moment.

## 1.0.35

- FIGUREN GROESSER UND HOEHER - nachgemessen, nicht geschaetzt. Im
  laufenden Brett gemessen: der Bauer fuellte 122 % der Feldhoehe, jetzt
  133 %; der Turm 172 %, jetzt 187 %. Dass eine Figur ueber ihr Feld
  hinauswaechst, ist richtig - sie STEHT darauf, sie liegt nicht darin.
- SIE HINGEN ABER ZU TIEF. Der Besitzer sah sie "sehr weit unten am
  Rand"; die Messung gab ihm recht - die Figurenmitte sass nur 23 % ueber
  der Feldmitte. Vier Prozent mehr Hub ruecken sie naeher zur Mitte
  (jetzt 28 %), ohne dass der Fuss den Bezug zum Feld verliert.
- DIE KACHELN IM HOFSTAAT ebenso: das Bild fuellt 118 % statt 104 % der
  Kachelbreite - vorher blieb an den Seiten Luft, die die Kachel groesser
  wirken liess als ihr Bild.
- NACHGEPRUEFT UND VERWORFEN: Zuerst lag der Verdacht auf Leerraum in den
  Figurendateien. Gemessen: alle sechs klassischen Figuren fuellen ihre
  Datei zu 99 % - daran lag es nicht. Die Ursache sass allein im Hub.

## 1.0.34

- DIE KANTE AUF DEN FIGURENKOEPFEN - GEFUNDEN UND BEHOBEN. Der Besitzer
  sah am Kopf der hinteren Figuren die Brettkante liegen; der Grund lag in
  den Ebenen. Die Zellen tragen zIndex rr+3, die oberste Reihe also 3 -
  denselben Wert wie der Kantenverlauf, der im DOM SPAETER kommt und damit
  gewinnt. Die Koepfe der hinteren Reihe ragen ueber die Brettkante hinaus
  (so ist es gewollt) und liefen genau in diesen Schleier.
- DAS ZICKZACK IST FORT ("geht gar nicht"). An seine Stelle tritt echte
  Transparenz: JEDES Feld am Brettrand blendet SELBST nach aussen aus -
  oben die oberste Reihe nach oben, links die linke Spalte nach links, an
  den Ecken beides. Weil die Maske am FELD haengt und nicht an einer
  Schicht darueber, bleiben die Figuren unberuehrt.
- Erster Anlauf dabei war falsch: die Maske sass an der ZELLE und haette
  die Figur gleich mit ausgeblendet. Der Feldgrund liegt jetzt in eigener
  Schicht darunter - nur er wird maskiert.
- DER EINZUG WIRD LANGSAM: 0,6 s waren zu hastig, das Brett stand da, ehe
  das Auge das Land gesehen hatte - und der Aufbau aller 64 Felder in
  derselben halben Sekunde war zugleich die Stelle, an der es stockte.
  Jetzt 1,8 s mit einer halben Sekunde Vorlauf; langsamer heisst hier auch
  RUHIGER, weil sich die Last ueber mehr Bilder verteilt.
- KLASSIK, DRITTE RUNDE: der Bauer steht jetzt HOEHER als die uebrigen
  Figuren (1,46em gegen 1,08em) - er traegt die niedrigste Silhouette des
  Satzes und verlor sonst jedes Mal.

## 1.0.33

- SOLANGE NICHTS BLUTET, SPRICHT NIEMAND VON LEBENSPUNKTEN. Kapitel I ist
  seit v1.0.20 reines Schach - in den Menues standen aber weiterhin
  Angriffsstaerke und Lebenspunkte auf jeder Figurenkarte: zwei Zahlen,
  die nichts tun und nur Fragen aufwerfen. Sie erscheinen jetzt an dem
  Tag, an dem die alte Magie erwacht. Was bleibt, ist alles, was auch im
  Schach zaehlt - Stufe, Gangart, Herkunft, Erzaehlung.
- DIE AKADEMIE LEHRT NUR, WAS ES SCHON GIBT: der Lehrblock "Der HP-Modus"
  erklaerte Lebenspunkte und Schaden auch dann, wenn das Spiel noch reines
  Schach ist. Er beantwortete eine Frage, die sich in Kapitel I niemand
  stellen kann, und nahm dem Erwachen seine Ueberraschung. Er tritt erst
  danach hinzu; Ziel, Gangarten, Rochade und Matt bleiben von Anfang an
  lesbar.
- NACHGEMESSEN STATT VERMUTET: alle 34 Faehigkeiten durchgezaehlt - jede
  einzelne, die von Schaden, Lebenspunkten, Heilung oder Treffern
  spricht, traegt bereits die Marke hpOnly und ist vor dem Erwachen
  weder waehlbar noch sichtbar. Hier war nichts zu reparieren, und das
  ist auch ein Ergebnis.
- Vier Proben sichern es: frisches Profil hat nichts geweckt, die
  HP-Lehre existiert, jede Kampfkunst traegt hpOnly, und keine davon
  laesst sich vor dem Erwachen freischalten.

## 1.0.32

- DER ABGEWEHRTE SCHLAG SIEHT JETZT AUS WIE EINER. Wer im HP-Gefecht
  zuschlaegt und das Ziel nicht faellt, lief bisher symmetrisch hin und
  zurueck - weich, gleichmaessig, ohne Widerstand. Das sah aus wie ein
  Zug, der es sich anders ueberlegt hat, nicht wie ein Schlag, der
  abprallt.
- Die Bewegung hat jetzt drei Teile, die man einzeln spuert: ein
  SCHNELLER Vorstoss, der AUFPRALL (die Figur staucht sich an ihrem
  Ziel), und das ZURUECKSCHLEUDERN ueber den eigenen Stand hinaus -
  danach pendelt sie in zwei kleiner werdenden Schwingungen aus.
- DER FUNKE AM AUFPRALL: bisher blieb ein abgewehrter Schlag stumm. Jetzt
  sitzt am Beruehrungspunkt zwischen beiden Feldern ein kurzer heller
  Ring, genau fuer die Dauer des Aufpralls - er liegt zwischen den
  Figuren, nicht darueber, und faengt keine Klicks.
- Zusammen mit dem Wackeln des Getroffenen aus v1.0.14 ist der Angriff
  damit von beiden Seiten sichtbar: der Angreifer prallt ab, der
  Verteidiger schwankt und faellt nicht.

## 1.0.31

- DAS BRETT BRICHT INS LAND. Der Besitzer wollte, dass Brett und Gemaelde
  staerker zusammenwachsen, und schlug Risse vor - das passt hierher wie
  nichts sonst: durch diese Welt zieht ein Riss, da bleibt kein Stein
  heil. Der Rand endet jetzt gesprungen statt sauber geschnitten, in
  unregelmaessigen Zacken, die in die Landschaft auslaufen.
- Bauart: EIN svg ueber der Spielflaeche, das nur die aeussersten Prozente
  in der Farbe der Nacht fuellt. Die Zacken sind FEST gewaehlt, nicht
  gewuerfelt - ein Brett, das bei jedem Bild anders bricht, waere unruhig.
- ZWEI MASSE AM BILD KORRIGIERT: Der erste Anlauf sprang 3 % tief und
  schnitt damit die Randtuerme an - bei acht Feldern ist das fast ein
  Viertel Feldbreite. Jetzt hoechstens 1,4 %, und die Bruchkante liegt
  UNTER den Figuren, damit kein Kopf angeknabbert wird.
- Der Kantenverlauf greift weiter (7-9 % statt 4-5,5 %), sodass die harte
  Aussenkante auch dort ausfranst, wo kein Zacken sitzt.
- Drei Proben halten es fest: die Bruchkante existiert, kein Zackenpunkt
  reicht tiefer als 1,6 % ins Brett, und sie liegt unter den Figuren.

## 1.0.30

- BRETT UND GEMAELDE WACHSEN ZUSAMMEN (Besitzerwunsch). Drei Wege wurden
  am laufenden Bild ausprobiert und gemessen, zwei sind wieder geflogen:
  - Eine weiche Maske UEBER dem Brett schnitt die Eckfelder an und nahm
    den Steinplatten ihre Tiefe. Verworfen.
  - Felder auf 0.92 Deckkraft liessen den Grund durchschlagen: aus Stein
    wurde ein flaues Rautenmuster. Verworfen.
  Geblieben ist, was traegt: ein weiter, sehr weicher Schein nach aussen,
  der das Brett in die Landschaft bettet statt es davorzustellen - und
  ein Kantenverlauf DARUEBER, der nur die aeussersten Prozente beruehrt
  und der harten Aussenkante die Schaerfe nimmt. Die Spielflaeche selbst
  bleibt unangetastet: ein Brett, dessen Felder man raten muss, waere
  unspielbar.
- BEIM PRUEFEN GELERNT: der erste Screenshot des Kantenverlaufs sah
  schlechter aus - die Steintexturen waren schlicht noch nicht geladen.
  Nachgemessen mit laengerer Wartezeit steht die Struktur bei 0.35 und
  die Platten sind vollstaendig da. Ein Bild zu frueh aufgenommen ist
  kein Befund.

## 1.0.29

- DIE POPUP-MESSUNG SIEHT WIRKLICH ETWAS. Die Blattpruefung aus v1.0.28
  meldete "sauber" - und hatte in Wahrheit NULL Blaetter vor sich. Genau
  der Fehler, an dem das Werkzeug schon einmal blind war, nur eine Etage
  hoeher. Nachgezaehlt statt geglaubt: an jedem Blatt-Ort wird jetzt
  mitgeschrieben, wie viele Blaetter ueberhaupt dastanden.
- URSACHE: DER HEROLD STAND DAVOR. Beim ersten Betreten eines Menues legt
  sich das Willkommensblatt (zIndex 60) ueber alles; der Kachel-Klick lief
  dagegen und oeffnete nie ein Figuren-Blatt. Jetzt wird der Herold zuerst
  GEMESSEN - er ist selbst voller Fliesstext und genau die Sorte, die auf
  schmalen Schirmen bricht - und danach weggeraeumt.
- EINE LEERE MESSUNG IST KEIN ERFOLG: findet ein Blatt-Ort nichts, sagt
  der Lauf das ausdruecklich ("bei X stand kein Blatt"), statt die Stelle
  stillschweigend als sauber zu zaehlen. Diese Diagnose faerbt den Lauf
  nicht rot, verschweigt ihn aber auch nicht.
- Gemessen wird je Blatt dreierlei: Text, der aus seinem Kasten laeuft;
  Blaetter, die zum Scrollen zwingen; Blaetter, die ueber den Schirmrand
  ragen. Aktueller Stand auf allen drei Viewports: keine Funde.

## 1.0.28

- DIE POPUPS WERDEN MITGEMESSEN. Das Textfluss-Werkzeug sah bisher nur
  Knoepfe - ausgerechnet die Blaetter mit ihren Fliesstexten, die auf dem
  Telefon am ehesten brechen, blieben unbesehen. Jetzt prueft es an jedem
  Blatt dreierlei: laeuft Text aus seinem Kasten, MUSS man scrollen, und
  ragt das Blatt ueber den Schirmrand hinaus.
- UND ES FAND SOFORT ETWAS: Das Willkommensblatt musste auf 320 px
  Breite 51 Pixel weit gescrollt werden. Genau das wollte der Besitzer
  nicht - der Inhalt soll hineinpassen, statt scrollbar zu sein.
- BEHOBEN, indem der schon vorhandene Eng-Modus (unter 360 px) wirklich
  eng wurde: Zierleiste, Punkteabstaende, Innenpolster und Zeilenhoehen
  eine Spur knapper. Kein Text wurde gestrichen und nichts Bedienbares
  kleiner - es war reine Luft.
- Zwei Laeufe hintereinander bestaetigen: 320, 412 und 1280 px alle
  sauber, null Funde.

## 1.0.27

- DIE KAPITELGEMAELDE SIND ENDLICH ZU SEHEN. Der Besitzer meldete, dass
  hinter dem Brett immer noch nichts steht - zu Recht. Das Bild lag im
  DOM, in voller Groesse, mit Deckkraft 1, die Datei wurde vom Server
  geholt: alles sah richtig aus. Auf dem Schirm kam trotzdem NICHTS an,
  gemessen 0.004 Helligkeit statt der 0.22 des Gemaeldes.
- URSACHE: zIndex -1. Der Seitenkoerper traegt background:#000, und ein
  Kind mit NEGATIVEM zIndex wird hinter den Hintergrund seines
  Stapel-Vorfahren gemalt - also hinter dieses Schwarz. Deshalb war das
  Bild unsichtbar, obwohl jede einzelne Pruefung gruen war: Ich hatte in
  v1.0.24 die Datei live verifiziert und daraus geschlossen, das Bild sei
  zu sehen. Das war ein Fehlschluss - eine ausgelieferte Datei ist noch
  kein gemaltes Bild.
- Jetzt zIndex 0: das Gemaelde steht ueber dem Seitenschwarz, der Inhalt
  liegt weiterhin darueber. Nachgemessen im echten Kampf: 0.415 statt
  0.004 in der oberen Zone.
- Eine Probe verbietet den negativen zIndex fuer immer.

## 1.0.26

- DER KLASSISCHE SATZ WAECHST WEITER: 1.02em liess immer noch Luft am
  Feldrand. Jetzt 1.14em, und der Bauer 1.26em - seine Figur hat die
  niedrigste Silhouette des Spiels und blieb sonst verloren stehen.
- DAS NEUE LOGO IST DAS APP-SYMBOL. Es kam als volles Quadrat OHNE
  Rundung und ohne Transparenz - fuer Google Play genau richtig (Play
  rundet selbst und lehnt Transparenz ab). Fuer die App liegt es jetzt
  zweifach: icon-192/512 mit weicher Rundung (22,5 % Radius, vierfach
  ueberabgetastet), weil diese Symbole mancherorts UNMASKIERT erscheinen -
  und maskable-512 sowie apple-touch-icon als volles Quadrat, weil
  Android und iOS selbst maskieren und sonst zweimal gerundet wuerde.
- FAVICON UND MENUE BLEIBEN, WIE SIE WAREN (Besitzerwunsch). Dafuer war
  ein Eingriff noetig: index.html fuehrte icon-192 AUCH als Favicon - das
  neue Logo waere in jeden Browsertab gewandert. Der Tab behaelt jetzt
  favicon.svg, favicon-32 und favicon.ico; eine Probe haelt fest, dass
  kein App-Symbol wieder dorthin rutscht.
- BEIM MESSEN GEFUNDEN: "fliegt" stand als ZWEITER Funktionsparameter von
  PieceGlyph statt im Eigenschaften-Objekt. React reicht dort nichts
  hinein, die Fahne war also IMMER false - die Reparatur des
  Flug-Ruckelns aus v1.0.14 lief seither ins Leere, und die fliegende
  Figur poppte weiter. Jetzt kommt sie an, mit eigener Probe.

## 1.0.25

- DAS RUCKELN BEIM SPIELEN: DIE UNSICHTBARE EBENE. Im Kampf lief die
  Halle (MysticBackground) WEITER, obwohl das Kapitelgemaelde sie seit
  v1.0.24 vollstaendig verdeckt - dem einen Rueckgabezweig der App fehlte
  das inMatch-Gate, das der andere laengst hatte. Der Browser rechnete
  also in jedem Bild ein 168 % breites Bild MIT CSS-MASKE mit, das
  niemand sieht. Masken sind auf Telefon-Grafikkernen teuer, und beim
  Ziehen kommt die Zug-Animation obendrauf: genau da sass das Stocken.
- DER HINTERGRUND BEKOMMT SEINE EIGENE GRAFIKSCHICHT: ohne sie liegt das
  Gemaelde in derselben Ebene wie das Brett, und jede ziehende Figur
  zwingt den Browser, den ganzen Hintergrund neu zu zeichnen.
  translateZ(0) hebt ihn auf eine Schicht, die einmal gezeichnet und
  danach nur noch gehalten wird - das Bild bewegt sich ja nie.
- VIER PROBEN halten es fest: die Halle traegt ihre teure Maske, das
  Kapitelgemaelde traegt KEINE, es sitzt auf eigener Schicht, und JEDE
  Aufrufstelle der Halle haengt am inMatch-Schalter. Damit kann der
  Fehler nicht in einem dritten Zweig zurueckkehren.

## 1.0.24

- DAS LAND HINTER DEM BRETT: zwoelf Oelgemaelde des Besitzers, eines je
  Kapitel, liegen jetzt im Kampf hinter dem Schachbrett. Im Kampf tritt
  der Rissboden ab und das Kapitelbild nimmt seinen Platz; oben und unten
  laeuft es in Schwarz aus, damit Kopfzeile und Zugleiste ruhig bleiben.
  Die Kampagne zeigt das Kapitel der Station, Schnellspiel, Halle und
  Tagesraetsel den eigenen Kapitelstand.
- GEMESSEN STATT GEMUSTERT: alle zwoelf tragen exakt 1024x1536 und wurden
  gegen die zwei Kennzahlen des Katalogs geprueft. Ergebnis: die
  Mittelzone ist ueberall ruhig genug, und die untere Helligkeitsgrenze
  von 0.22 war MEIN Denkfehler - fuer einen Hintergrund ist dunkler
  besser, nicht schlechter. Das Endlose Meer steht bei 0.13 und ist genau
  richtig. Der Katalog ist entsprechend berichtigt.
- Als WebP q80 abgelegt: zusammen 1,2 MB fuer zwoelf Bilder, und zwar in
  public/ statt im Buendel - sichtbar ist immer nur eines.
- Eine Probe zaehlt nach, dass jedes Kapitel seinen Hintergrund besitzt.

## 1.0.23

- "FAEHIGKEITEN IN KAPITEL I BEWEGUNGSBASIERT"? HINFAELLIG - und zwar
  dreifach verriegelt statt nur zufaellig: (1) der Heeresbau leert im
  Schach jede Faehigkeitsliste (v1.0.20), (2) der Zugvollzug liest
  Faehigkeiten ueberhaupt nur im HP-Regelwerk, (3) NEU: auch die
  Zugerzeugung bietet den Fernschuss im Schach nicht mehr an - selbst
  einer absichtlich verseuchten Figur nicht. Der Backlog-Punkt ist
  gestrichen; die Sorge dahinter (Matt aus der Ferne) wird zur
  Leitplanken-Vorschrift fuer das spaetere Kapitel "Gangarten im Schach".
- DIE SORGE WAR KEIN GESPENST: ein Alt-Test bezeugte woertlich "das
  Talent bietet im Schach einen Schuss an" - und das Ziel FIEL, drei
  Felder weit, ohne dass eine Deckung half. Genau dieser einst gebaute
  Bestand ist jetzt umgedreht: der Test verlangt heute das Gegenteil,
  und die Wirkung des Schusses lebt in einem HP-Zwilling weiter (halbe
  Wucht aus der Ferne, Schuetze bleibt stehen, Schlag zaehlt).

## 1.0.22

- DAS GESETZ DES KLASSISCHEN: "Klassisch spielt man einfach immer nur das
  Schach ohne jegliche Extras" (Besitzer). Genau das war NICHT garantiert:
  auch das klassische Schnellspiel und die Klassisch-Halle lasen die
  gespeicherte Aufstellung - ein legal abweichender Plan waere mitgezogen,
  und die neue Plan-Schiene haette das erst richtig eingeladen. Jetzt
  erzwingt Klassisch auf BEIDEN Seiten die Werksaufstellung der Karte:
  Standardfiguren, Stufe 1, keine Plaene, keine Faehigkeiten, kein Seher.
- KLARE ZUSTAENDIGKEIT, im Hinweistext nachlesbar: der Schach-Plan gehoert
  den Schach-Stationen der KAMPAGNE (dort sind neue Figuren mit neuen
  Gangarten ausdruecklich erwuenscht), der HP-Plan jedem HP-Gefecht -
  auch in der Halle. Klassisch bleibt von beiden unberuehrt.
- Drei Proben halten das Gesetz fest: Klassisch ignoriert jeden
  gespeicherten Plan, feldet nur die Standardarten, und die Kampagne
  ehrt den Plan weiterhin.

## 1.0.21

- DIE SCHIENE SPRICHT KANON: der zweite Plan heisst "HP-Gefecht" (englisch
  "HP Battle") - derselbe Begriff, den die Stationskarten seit jeher
  tragen (mode.hp). Ein Ding, ein Name; das blosse "Gefecht" ist fort.
- UND SIE GILT NACHWEISLICH AUCH IN DER HALLE: der Heeresbau reicht das
  Regelwerk durch (buildArmy erhaelt rules aus pvp.rules), also liest ein
  Klassisch-Duell den Schach-Plan und ein HP-Duell den HP-Plan - ohne
  weiteres Zutun. Der Hinweistext sagt das jetzt dazu.

## 1.0.20

- KAPITEL I IST JETZT REINES SCHACH, von der ersten bis zur letzten
  Station. Bisher fiel der erste Schaden schon auf halber Strecke - also
  mitten in der Stunde, in der man ueberhaupt erst begreift, dass die
  Figuren anders ziehen als gewohnt. Zwei neue Sachen auf einmal sind
  eine zu viel. Kapitel I schenkt jetzt neue Figuren und neue Gangarten,
  sonst nichts; der Riss beisst erst auf halbem Weg durch Kapitel II
  (Station "Schwelrain") - und trifft dann auf jemanden, der das Brett
  schon liest.
- WO NICHTS BLUTET, BRAUCHT NIEMAND EINEN TRANK: der Lebenstrank bleibt
  darum durch ganz Kapitel I verborgen. Das ist keine Nebenwirkung,
  sondern der Sinn der Sache.
- ZWEI AUFSTELLUNGEN JE BRETT, eine fuer das Schach und eine fuer das
  Gefecht. Das sind wirklich zwei Plaene: im Schach zaehlt die Gangart,
  im Gefecht zaehlen Lebenspunkte, Reichweite und Faehigkeiten. Wer
  beides in denselben Speicher zwingt, baut nach jedem Wechsel neu. Der
  HP-Plan behaelt den bisherigen Schluessel - alle vorhandenen
  Spielstaende finden ihre Aufstellung unveraendert wieder -, und fehlt
  ein Plan, gilt der andere statt der Werkseinstellung.
- Die Schiene dafuer erscheint erst, wenn die alte Magie erwacht ist:
  solange es nur Schach gibt, waere eine zweite Wahl blosser Laerm.
- Beim Umbau kam heraus, dass das Erwachen spurlos verschwinden konnte,
  wenn auf seiner Station schon ein Figuren-Boss sass. Es weicht jetzt
  nach hinten aus, bis eine Station frei ist - und vier Tests, die es an
  Kapitel I festgenagelt hatten, erkennen es nun an seiner Erzaehlung
  statt an Kapitel oder Kennung.

## 1.0.19

- KAPITEL VIII HAT SEIN GEMAELDE. Es war das einzige der zwoelf ohne Bild;
  der Einstieg fiel dort stumm auf die Karte durch, ohne Fehler, ohne
  Hinweis. Manuels Gemaelde liegt jetzt als 08-aschgrund.webp.
- UND DER ASCHGRUND IST ROT. Der Name taeuscht: Es ist keine graue
  Aschewueste, sondern eine ROTE FELSSCHLUCHT - rostrote Waende,
  Ockerboden, warmes Abendlicht. Das Kartenbild heisst nicht ohne Grund
  "liga-canyon". Mein Prompt-Katalog sagte "ash-grey rock" und haette am
  Ort vorbeigemalt; die Stelle ist berichtigt und traegt jetzt das
  Gemaelde als Referenz.
- EINE PROBE ZAEHLT AB JETZT NACH, dass jedes der zwoelf Kapitel sein
  Bild besitzt. Ein fehlendes Gemaelde faellt kuenftig sofort auf, statt
  monatelang unbemerkt zu bleiben.

## 1.0.18

- DAS TEXTFLUSS-WERKZEUG SIEHT WIEDER. Es war seit v0.92 blind und meldete
  trotzdem "sauber" - der schlimmste Zustand, den ein Pruefwerkzeug haben
  kann. Vier Ursachen lagen uebereinander, alle jetzt behoben:
  (1) Es klickte "Als Gast spielen", einen Weg, den es nicht mehr gibt -
  jetzt legt es sich selbst ein Konto an.
  (2) Es klickte gegen den Vorlader, der mit zIndex 200 ueber allem liegt -
  jetzt wartet es auf sein Erscheinen UND sein Verschwinden, und zwar
  zweimal, weil die App nach dem Anlegen des Kontos neu startet.
  (3) Maus-Klicks kamen an den Knoepfen nicht an; ein JS-Klick auf dem
  Element traegt zuverlaessig.
  (4) Der Kern: es suchte "main button" - die App traegt aber kein <main>
  mehr. Der Selektor fand NIE einen Knopf, also war jede Messung leer und
  jede Meldung gruen.
- EINE LEBENDPROBE haelt das fuer immer fest: steht die App nicht wirklich
  (Fussleiste da, mehr als drei Knoepfe), sagt der Lauf "NICHT GEMESSEN"
  statt gruen zu leuchten.
- EIN OVERLAY DARF DECKEN: der erste ehrliche Lauf meldete "Simpel x
  Partie starten" - das Willkommensblatt lag ueber dem Hub, und das ist
  keine Panne, sondern der Sinn eines Blattes. Gemessen wird jetzt nur
  innerhalb einer Ebene.
- UND ES WACKELT NICHT MEHR: der erste ehrliche Lauf meldete 7 Funde, der
  naechste 0. Ursache: der Aufraeumer klickte, wenn er keinen bekannten
  Bestaetigungstext fand, einfach den LETZTEN Knopf eines Blattes - und
  traf so gelegentlich "Abmelden". Der Rest des Laufs mass dann den
  Anmeldeschirm. Jetzt gilt eine Sperrliste (Abmelden, Loeschen,
  Zuruecksetzen, Aufgeben), unbekannte Blaetter bleiben lieber stehen,
  die Lebendprobe laeuft VOR JEDER Messung, und faellt die App doch
  heraus, werden alle folgenden Funde als Phantome verworfen statt
  gemeldet. Der Einstieg bekommt drei Anlaeufe statt fester Wartezeiten.
- Als "npm run pruefe:fluss" verankert, damit es nicht wieder still
  einschlaeft.
- Der Herold bekommt die Sprache jetzt aus dem Profil statt aus einer
  Variablen, die an dieser Stelle noch gar nicht steht.

## 1.0.17

- ELF SCHLUESSEL FEHLTEN IM ENGLISCHEN: die ganze Passwort-Karte und zwei
  Weltkarten-Knoepfe fielen stumm auf Deutsch zurueck - im englischen
  Spiel stand also "Passwort aendern". Ergaenzt, und eine Probe zaehlt ab
  jetzt beide Bloecke gegeneinander, damit es nicht wieder auseinander
  laeuft.
- DER HEROLD WUERFELT IN DEINER SPRACHE: der Namensvorschlag stand fest
  auf Deutsch ("Eiserner Turm" im englischen Spiel), obwohl die
  Namenslisten laengst zweisprachig sind - gefragt wurde nur nie danach.
- DER ADMIN WAR AUSGESPERRT: die Karte "Passwort aendern" schloss
  ausgerechnet das Admin-Konto aus, das mit einem mitgelieferten
  Standardwort ausgeliefert wird. Es konnte sein Passwort also gar nicht
  aendern - deshalb stand der Punkt so lange offen. Jetzt darf es das,
  und solange das Standardwort steht, warnt die Karte deutlich.
- DAS TEXTFLUSS-WERKZEUG LUEGT NICHT MEHR: es klickte "Als Gast spielen",
  einen Weg, den es seit v0.92 nicht mehr gibt - blieb am Anmeldeschirm
  stehen und meldete trotzdem "sauber". Es legt sich jetzt selbst ein
  Konto an, wartet den Vorlader ab und PRUEFT, ob die App wirklich steht;
  tut sie es nicht, sagt es "NICHT GEMESSEN" statt gruen zu leuchten.
  Der Einstieg traegt noch nicht ganz - aber ein blindes Werkzeug, das
  gruen leuchtet, ist schlimmer als eins, das ehrlich rot bleibt.

## 1.0.16

- DER ABGESCHNITTENE KNOPF ("Abgeschlosse"): Knopf und Hinweistext lagen
  im selben REIHEN-Flex und teilten sich die Breite - der Knopf wurde zu
  schmal fuer sein eigenes Wort. Sie stehen jetzt untereinander, der
  Knopf nimmt die volle Breite.
- GLOBALE KNOPFREGEL, einmal statt an hundert Stellen: kein Knopf ist je
  schmaler als sein laengstes Wort samt Polster (min-content), Text
  bricht mit Silbentrennung statt zu verschwinden, und das seitliche
  Polster bleibt in jedem Fall stehen. Wichtig fuer Uebersetzungen -
  deutsche und englische Beschriftungen sind selten gleich lang. Fuenf
  Proben halten die Regel fest.
- SCHALTER NIE DREIZEILIG: die Schiene hatte zwei widersprechende
  Mindesthoehen; jetzt eine, und die Schrift schrumpft eine Spur, statt
  eine dritte Zeile aufzumachen.
- EINMAL ABGESCHLOSSEN REICHT: der Haken traegt den Zustand (groesser und
  deutlicher), der Knopf sagt, was man TUN kann - "Nochmal spielen".
- WAS EINE WIEDERHOLUNG WERT IST, steht jetzt da: Gold und Erfahrung sind
  eingesammelt, eine Station zahlt nicht zweimal - Ruhmestaten fuer die
  Schatzkammer zaehlen dagegen weiter (ein Schachmatt, ein Sonderzug, ein
  Kunststueck, das bisher nicht gelang).
- DIE FIGUR IM POPUP WAECHST: Bild und Text standen unten buendig, also
  blieb ueber dem Namen Luft. Jetzt spannt sich die Karte, der Text
  beginnt oben, die Figur nimmt die frei gewordene Hoehe - und ihre
  Spaltenbreite bleibt gleich, damit der Fliesstext nicht schmaler wird.

## 1.0.15

- DIE STATIONEN SPRECHEN ENGLISCH: alle 529 Ortsnamen der zwoelf Kapitel
  haben jetzt einen englischen Namen - bisher stand im englischen Spiel
  mitten im Satz "Wo die Sense ruht". Uebersetzt ist nach KLANG, nicht
  Wort fuer Wort: ein Ortsname muss auf einer Karte stehen koennen.
  "Zehntwacht" wird "Tithe Watch", nicht "Tenth Guard"; die
  "Windfluechter" werden "The Windshaped". Eigennamen der Chronik -
  Osric, Asra, Vesna - bleiben stehen.
- Gebaut als KARTE (deutscher Name -> englischer), nicht als zweite
  Namensliste: die Namen stehen fest im Kampagnen-Generat, eine parallele
  Liste muesste Zeile fuer Zeile in Deckung bleiben und wuerde beim
  ersten Verrutschen Stationen vertauschen, ohne dass es auffaellt.
- Fuenf Proben halten es fest: jede Station hat einen englischen Namen,
  keiner doppelt sich, keiner ist versehentlich deutsch geblieben,
  placeFor spricht beide Sprachen, und ein unbekannter Name bleibt
  stehen statt zu verschwinden.

## 1.0.14

- DER RUCKLER BEIM ZIEHEN IST FORT. Der Flug zeichnet eine zweite Figur
  ueber dem Brett, die Zelle blendet ihre eigene aus - und BEIDE spielten
  beim Erscheinen "pop" (Sprung von 60 auf 100 Prozent). Daher der
  Eindruck zweier Objekte: ein Stauch-Ruck beim Abflug, noch einer beim
  Ankommen. Jetzt poppt nur noch, was wirklich neu aufs Brett kommt.
- DAS SETZEN AUFS FELD: wer geflogen ist, LANDET - ein kurzes Stauchen
  und Zurueckfedern mit stehendem Fuss, die Bewegung einer Holzfigur.
- DER SPRINGER LANDET SICHTBAR: ein heller Ring faehrt aus dem Feld, auf
  dem er aufsetzt. Nur beim Sprung, damit nicht jedes Ziehen zum
  Ereignis wird.
- DER TREFFER WIRD SICHTBAR: bisher schuettelte ein LEERES Feld ueber der
  Zelle - eine Animation ohne Koerper, man sah nichts. Jetzt wackelt die
  getroffene Figur SELBST und faellt dabei nicht, dazu ein roter
  Aufschlag-Ring, der zeigt, wo der Schlag sass.
- KLASSIK WAECHST: die klassischen Figuren fuellen ihre Zelle (1.02em),
  der Bauer bekommt eine Extra-Stufe (1.1em) - er stand am verlorensten.
- HOFSTAAT GROESSER: Kachelbilder nehmen die voll Breite (104 %,
  schlichte Glyphen 98 %), das Popup-Bild waechst von 128x152 auf
  148x178 und nimmt die Luft oben.
- AUFSTELLUNG MITTIG UND GROESSER: die Figuren hingen an der Unterkante
  (objectPosition bottom) - jetzt zentriert und eine Stufe hoeher, der
  Grand Gambit als Held noch groesser.
- LUFT UNTER DEM TITEL: PanelTitle traegt 9 px Grundabstand, Titel und
  Infokasten kleben nicht mehr aneinander.

## 1.0.13

- DER HELDNAME IN DEN KAMPAGNENTEXTEN: Wo die Figuren nach dem Sieg bisher
  den namenlosen "Wanderer" ansprachen, sprechen sie jetzt DICH an - alle
  78 Anreden in den Stimmen der Champions und Meister tragen den Namen aus
  dem Profil. Jede Erzaehlstelle (Herolde auf Karte und Brett, Stations-
  geschichten) versteht ab jetzt den Platzhalter {held}; ohne Namen bleibt
  der alte Ehrentitel.

## 1.0.12

- DER VORLADER: der Boot-Riss bleibt als vollstaendiger Erstlade-Schirm
  stehen, bis ALLES im Haus ist - jedes Gemaelde, jede Schnitzerei, jede
  Klassik-Figur, alle Klaenge, Karten, Boeden und UI-Bilder (rund 400
  Quellen). Goldener Fortschrittsbalken und Zaehler am Riss; Sicherungen
  (10 s je Datei, 25 s gesamt) sorgen dafuer, dass ein kaputter Pfad das
  Spiel nie aufhaelt. Danach ruckelt der erste Gang durch Hofstaat,
  Karte und Brett nicht mehr, weil nichts mehr nachgeladen werden muss.

## 1.0.11

- VERGESSENSTRANK: Faehigkeiten zuruecksetzen kostet keinen Gold-Obolus
  mehr, sondern einen Trank vom Haendler - 15 Gold, und mit jedem Kauf
  verdoppelt sich sein Preis (Deckel 480), hoechstens drei im Vorrat.
  Jede ausgegebene Skillpunkt-Sonne kehrt beim Trinken vollstaendig
  zurueck.
- HOFSTAAT ENTRUEMPELT: das kleine Vektor-Zeichen ist aus dem Eck der
  Kacheln, dem Dossier und dem Popup-Kopf verschwunden - die Flaeche
  gehoert ganz der Figur. Als Sperr-Silhouette fuer Unbekanntes lebt die
  Form weiter, und die Chronik zeigt weiterhin beide Gesichter.
- POPUPS FLUCHTEN MIT DEM MENUE: alle Ueberlagerungen ruecken auf
  denselben 10-px-Seitenrand wie die Leisten darueber, statt mal breiter,
  mal schmaler zu stehen.
- LEUCHTEN AUF KOENIGS-MASS: jede Figur traegt jetzt den Schein, den
  bisher nur der Koenig hatte - eigene deutlich goldener, der Gegner
  heller und kraeftiger im Riss-Violett. Der Koenig behaelt sein Halo
  obenauf.
- KLICK KLINGT UEBERALL: Hofstaat-Kacheln und Schatzkammer-Kacheln
  spielten keinen Tipp-Klang, weil der Klangfaenger nur Knoepfe hoert -
  jetzt klingen sie selbst.
- GEGEN DAS KNACKEN: jeder Klang beginnt mit einer 4-ms-Rampe statt
  hartem Einsatz, und ein Kompressor vor dem Ausgang faengt Spitzen ab,
  wenn mehrere Klaenge zusammenfallen.

## 1.0.10

- WELTKARTE IM SELBEN RAHMEN: der Kasten der Weltkarte rundet jetzt mit
  derselben Formel wie die Kapitelkarte (Math.min(22, frameW/12)) statt
  mit einem harten 14er aus der Vollbild-Zeit.
- ZURUECK UND UEBERSICHT IN LILA: der Atlas-Knopf ueber der Kapitelkarte
  und der Zurueck-Knopf oben auf der Weltkarte tragen die Hub-Kontur
  (178,150,255) samt leisem Riss-Glow. Die goldenen Kapitel-Pfeile
  bleiben golden: Gold reist, Lila blickt.
- SCHLICHTER STIL AUCH IN DER AUFSTELLUNG: Gambit, Bauern, Meister und
  Drache griffen dort immer in die Gemaelde-Galerie, egal was im Profil
  stand. Jetzt fragt jede Kachel den Schlicht-Schalter und zeichnet
  schlicht, wenn schlicht gewaehlt ist.
- DECKEL GEGEN UEBERSTAND: die Figurenbilder der Aufstellung massen sich
  in vw am Schirm statt an der Zelle und ragten auf breiten Karten aus
  den Kacheln. max 100% in beiden Achsen beisst nur im Notfall.

## 1.0.2

- KARTE SASS NACH DEM EINSTIEG VERSETZT: solange der Einstieg oben liegt,
  gibt der Kampagnenschirm ihn STATT der Karte zurueck - die Messpunkte
  (Kartenbereich, Kamera, Rahmenhoehe) sind darum noch leer. Fiel der
  Einstieg weg, rendert die Karte mit diesen alten Werten und sass zu hoch,
  bis zur naechsten Messung. Jetzt wird nach dem Einstieg zweimal neu
  vermessen (naechstes Bild und 120 ms danach, weil der Browser die Masse
  erst dann kennt).
- EIN REGLER STATT SCHALTER UND REGLER: Lautstaerke und Ein/Aus sassen an
  verschiedenen Stellen und meinten dasselbe. Jetzt genuegt ein Regler je
  Klangart - ganz nach links heisst "aus", und der Schalter wird
  mitgefuehrt.
- Die Regler tragen die Hausfarbe: violette Bahn, violette Kugel mit
  Schimmer statt des goldenen Systemreglers.
- KAPITELTEXTE I-III EINFACHER: kurze Saetze, klare Worte, kein Verschachteln
  ueber drei Zeilen.

## 1.0.1

DIE OFFENEN KLEINIGKEITEN

- UNTERREITER (Händler/Schatzkammer, Hofstaat/Aufstellung): Zeichen und Wort
  standen an der Oberkante statt in der Mitte - den Knoepfen fehlte schlicht
  die senkrechte Ausrichtung. Jetzt mittig, mit fester Mindesthoehe.
- CORVO STEHT GROSS am Kopf seines Reiters, der Name darunter. Vorher stand
  er klein daneben und ging neben dem Spruch unter - er ist der Wirt dieses
  Raumes, also soll man ihn sehen.
- DAS ADMIN-PORTAL IST FORT: es war nur eine zweite Tuer zu denselben
  Werkbaenken, die im Profil ohnehin stehen.

WICHTIGER NEBENBEFUND: der Textfluss-Pruefer misst seit v0.92 NICHTS mehr -
er laeuft ueber den Gastzugang, den wir damals entfernt haben, und meldet
seither "0 Knoepfe" auf allen drei Viewports, ohne zu scheitern. Ein blindes
Pruefwerkzeug ist gefaehrlicher als keines; es muss auf den Kontoweg
umgestellt werden.

## 1.0.0

ALLE ZEICHEN AUS EINER QUELLE - UND MITTIG

- Das freigestellte Riss-Emblem ist jetzt die eine Quelle fuer Favicon, App-
  Zeichen und Startbild. Zuvor stammten sie aus verschiedenen Vorlagen, eine
  davon mit schwarzem Grund.
- GEMESSEN UND BEHOBEN: das Emblem selbst sass 6 px waagerecht und 12 px
  senkrecht ausser der Mitte - dieser Versatz pflanzte sich in jedes
  abgeleitete Zeichen fort. Jetzt wird der Inhalt zuerst freigestellt, dann
  mittig gesetzt, dann erst skaliert. Restversatz ueberall unter einem
  Pixel (vorher 6/12).
- Sechs Groessen neu gerechnet: 512, 192, 180 (Apple), maskable 512 mit 20 %
  Sicherheitsrand, 32 und 16 - dazu favicon.ico mit vier Aufloesungen.
  Durchsichtig, wo es durchsichtig sein soll; Flaeche nur dort, wo das
  Betriebssystem sie verlangt (Apple und maskable).

## 0.99.0

LAUTSTAERKE EINSTELLBAR, ZURUECK-GESTE VERLAESST DIE APP NICHT MEHR

- ZWEI REGLER im Profil, getrennt fuer Musik und Klaenge - viele wollen die
  Musik leise im Hintergrund, die Zuege aber deutlich hoeren. Der laufende
  Spieler zieht sofort nach, ohne Neustart. Bisher gab es nur an und aus.
- DIE ZURUECK-GESTE (Besitzerfrage "geht das?"): ja. Unsere Ansichten haben
  keinen Verlauf - alles ist EINE Seite, darum verliess die Wischgeste die
  App. Jetzt legt jeder Wechsel in eine tiefere Ansicht einen Eintrag in den
  Verlauf; die Geste nimmt ihn zurueck und wir fuehren dieselbe Bewegung im
  Spiel aus: erst die Partie verlassen, dann die Ansicht, dann der Reiter.
  Wer schon ganz oben steht, darf die App verlassen - alles andere waere
  ein Kaefig.

## 0.98.0

DIE KAPITEL BEKOMMEN IHREN EINSTIEG

- Zwoelf Landschaften des Besitzers eingebaut: wer ein Kapitel zum ERSTEN
  Mal betritt, sieht sein Land vollflaechig, mit Namen und Vorgeschichte;
  ein Druck fuehrt auf die Karte. Danach nie wieder - gemerkt in
  profile.gesehen.kapitelIntro, damit der Einstieg ein Ereignis bleibt und
  keine Huerde wird.
- KEN BURNS: das Bild wandert 24 s lang langsam und wird eine Spur groesser.
  Bei "Bewegung reduzieren" steht es still.
- DIE MUSIK KOMMT MIT: das Kapitelthema beginnt zugleich und blendet ueber
  neun Sekunden herauf; beim Weiterdruecken laeuft es nahtlos weiter.
- Die ersten 700 ms nimmt der Schirm keinen Druck an, damit ein Versehen
  den Einstieg nicht ueberspringt.
- BILDER NICHT EINGEBUNDEN: 3,9 MB Spielfassungen waeren mehr als das ganze
  Buendel (1,75 MB). Sie liegen unter public/kapitel und werden geholt, wenn
  sie gebraucht werden. Originale (1672x941, 31 MB) in archiv/bilder/kapitel.
- ES FEHLT KAPITEL VIII (Aschgrund, der rote Canyon) - dort greift der
  Einstieg noch nicht, das Spiel geht wie bisher direkt auf die Karte.
  Von Sonnenschlund liegen zwei Fassungen vor, eine als Reserve.

## 0.96.0

DIE SCHAUKAMMER LAEDT KLEIN UND LAESST AUSSORTIEREN

- VORSCHAUBILDER: die Kammer lud jedes Bild in voller Groesse, nur um es als
  116-px-Kachel zu zeigen - bei 382 Bildern und teils 2,5 MB je Stueck.
  Jetzt legt der Bau daneben eine Vorschau mit 200 px Kantenlaenge; das
  Original kommt erst beim Antippen. Gemessen: 43 MB werden zu 3,4 MB, ein
  Zwoelftel. Faellt eine Vorschau aus, springt das Original ein.
- AUSSORTIEREN: jede Kachel hat jetzt "Archiv" und "Loeschen". Die Kammer
  loescht NICHT selbst - eine Anzeigeseite im Browser sollte kein
  Schreibrecht am Bestand haben. Stattdessen fuehrt sie eine Merkliste, die
  sich als Datei ausgeben laesst; ausgefuehrt wird sie beim naechsten Bau.
  So bleibt jede Loeschung nachvollziehbar und umkehrbar, bis sie geschieht.
- Das hochgeladene ZIP enthielt nichts Neues - byte-identisch die 54 Bilder
  der ersten Rettung, alle bereits im Archiv (das inzwischen 93 fasst).

## 0.95.0

DIE BESTANDSAUFNAHME STEHT IN DER SCHAUKAMMER

- Auf die Frage des Besitzers, ob er das im Admin einsehen kann: ja, jetzt.
  Die Schaukammer (?werkstatt) zeigt oben, welche Spielfassung ihr Original
  hat und welche nicht - je Gruppe ein Balken, die Zahl daneben, fehlende
  rot. Gemessen, nicht geschaetzt: jede Datei per Bildvergleich gegen die
  93 geretteten Originale geprueft.
- Stand: geschnitzte Figuren 24/57, gemalte 21/71, Turnierfiguren 0/6,
  Ausruestung 2/27, Auszeichnungen 8/28, Bodentexturen 1/16 - zusammen
  149 fehlende Originale.
- Darunter steht, wo das Fehlende noch liegen koennte (Besitzer hat die
  Turnierfiguren noch; farbiger Satz bei aimlapi oder ChatGPT; die alten
  Portraits im ChatGPT-Verlauf).
- Die Daten kommen aus archiv/bilder/bestand.json und werden zur Laufzeit
  geholt - das Buendel bleibt unberuehrt.

## 0.94.0

DIE RETTUNG WAR UNVOLLSTAENDIG - JETZT 93 STATT 54

- MEIN FEHLER IN v0.93: die fal.ai-Historie liefert SEITENWEISE, 50 je
  Seite. Ich hatte genau 50 erhalten und das fuer alles gehalten - eine
  verdaechtig runde Zahl, der ich haette nachgehen muessen. Die Antwort
  traegt die Felder page und size; mit allen Seiten sind es 235 Auftraege
  statt 50 und 94 Bildadressen statt 54.
- Gerettet: 93 Bilder (eines nicht mehr abrufbar), 140 MB - 78 in
  1024x1024, 12 in 1024x1536, zwei in 2048x2048. Darunter jetzt auch die
  violetten Bosse, die goldenen Figuren, gemalte Portraits und
  Damen-Entwuerfe, die in der ersten Runde fehlten.
- ABER: ein Bildvergleich gegen die live verwendeten Figuren zeigt, dass
  nur BAUER und GAMBIT wiedergefunden sind (Abstand 0,075 bzw. 0,071).
  Springer, Laeufer, Turm, Dame und Koenig des farbigen geschnitzten
  Satzes liegen NICHT bei fal.ai - sie wurden ueber einen anderen Dienst
  erzeugt.

## 0.93.0

54 ORIGINALE AUS DER FAL.AI-HISTORIE GERETTET

- Der Besitzer fragte, ob die verlorenen Figuren-Originale noch irgendwo
  liegen. Drei Orte geprueft: die GIT-HISTORIE gibt nichts her (jede Datei
  nur EINMAL committet, bereits klein), die Sitzungsprotokolle reichen nicht
  weit genug zurueck - aber FAL.AI bewahrt die Auftragshistorie.
- Der Weg: rest.alpha.fal.ai/requests/ mit Zeitraum liefert jeden Auftrag
  samt json_output, und darin stehen die fal.media-Adressen der Ergebnisse.
  50 Auftraege im Juli 2026, 54 Bildadressen - und ALLE 54 werden noch
  ausgeliefert. Keine einzige verloren.
- Gerettet: 43 Bilder in 1024x1024 und 11 in 1024x1536, echtes RGBA,
  zusammen 91 MB - die geschnitzten Figurensaetze (cremeweiss und
  naturhell), die Gambit-Stufen und die Bestien.
- Sie liegen jetzt unter archiv/bilder/figuren mit Herkunftsverzeichnis und
  werden - wie Musik- und Schaukammer-Bestand - beim Bau NEBEN das Spiel
  gelegt (dist/bildarchiv), nie hineingebunden. Buendel unveraendert
  1,75 MB.

## 0.92.0

DER GASTZUGANG IST FORT - UND ALLES, WAS IHN VERSPRACH:

- Der Knopf "Als Gast spielen" ist aus der Anmeldung entfernt. Wer spielen
  will, legt ein Konto an; sonst haengt kein Fortschritt an einem Namen und
  beim naechsten Start ist alles verloren.
- DATENSCHUTZ UND NUTZUNGSBEDINGUNGEN NACHGEZOGEN - nicht bloss das Wort
  getauscht, sondern die Zusagen berichtigt: "Ein Konto ist optional" wurde
  zu "zum Spielen wird ein Konto benoetigt", die Ueberschrift "Nutzerkonto
  (optional)" heisst jetzt schlicht "Nutzerkonto", und die Stellen ueber
  Gastspiel als Alternative sind fort. Kein Rest des Wortes bleibt.
- LANDINGPAGE: die Modus-Kacheln zeigten nur einen 130-px-Streifen eines
  fast quadratischen Bildes (588x560) - man erkannte nicht, worum es geht.
  Jetzt steht jedes Bild in seinem eigenen Verhaeltnis.
- Die WELTKARTE verriet sich ganz, bevor man den ersten Zug getan hat.
  Jetzt zeigt die Seite nur das Kronland (das erste Drittel) mit dem
  Hinweis, dass elf Laender dahinterliegen.

NOCH OFFEN: das Loeschen fremder Konten - siehe Bericht.

## 0.91.0

DREIZEHN STUECKE MEHR - DIE HANDSCHRIFT VON KAPITEL II ALS MASSSTAB:

- KAPITEL I TRAEGT JETZT DAS GELOBTE STUECK: das bisherige Kapitel II
  (D-Dur, geduldiger Puls) ist ans erste Kapitel gerueckt; Kapitel II
  bekam eine neue Melodie in a-Moll.
- DER STIL WURDE GEMESSEN, NICHT GERATEN: Kapitel II liegt bei Grundton
  219 Hz (A3), 59 % der Energie unter 300 Hz, ein Anschlag alle 350 ms.
  Der Meister liegt bei 131 Hz (C3) und 74 %. Genau diese Zahlen stehen
  jetzt im Auftrag - tiefe gezupfte Saiten zwischen A2 und A3, Anschlag
  alle 350 ms, nichts ueber 300 Hz tragend.
- SIEBEN NEUE KAPITELSTUECKE, mehr Moll als Dur wie gewuenscht: Kornmark
  (a-Moll), Krummholz (d-Moll), Grauwacht (e-Moll), Wolkenjoch (F-Dur),
  Sattelweite (g-Moll), Aschgrund (c-Moll), Die Wunde (h-Moll).
- ZWEI WEITERE FUER DIE HALLE und ZWEI FUERS SCHNELLE SPIEL, damit dort
  nichts langweilig wird - dazu ein dritter Meister in f-Moll.
- Nachgemessen: alle zwoelf treffen die Lage (40-76 % unter 300 Hz), und
  keines ist grell - der hoechste Hoehenanteil liegt bei 4,2 %.
- Das Archiv in der Klangwerkstatt fasst jetzt 36 Stuecke: Menue 12,
  Weltkarte 3, Kapitel 9, Gefecht 3, Meister 3, Weitere 6.

## 0.90.0

MAUERN, ZAEUNE UND FALLEN - DIE MECHANIK STEHT (20 neue Pruefungen):

- EIN SCHLAG GEGEN EINE SPERRE KOSTET DEN ZUG, NICHT DIE FIGUR. Wer
  angreift, bleibt stehen; die Sperre verliert einen Punkt. Genau der
  Nachteil, den der Besitzer wollte: nicht Material, sondern Tempo.
- DREI SORTEN, gestaffelt nach Preis und Haerte: Zaun (1 Schlag, 40 Gold),
  Mauer (2 Schlaege, 110), Bollwerk (3 Schlaege, 240). Jede bricht sichtbar
  in Stadien - heil, angeschlagen, Truemmer.
- WER SPRINGT, KOMMT DARUEBER: der Springer setzt hinweg und landet nur
  nicht darauf; gleitende Figuren halten davor an wie an jeder Wand; der
  Bauer schlaegt geradeaus dagegen.
- ZWEI FALLEN: die Spitzgrube macht 2 Schaden, die Baerenfalle macht KEINEN
  Schaden, sondern laesst die Figur einen Zug aussetzen. Beide sieht nur,
  wer sie gelegt hat - danach liegen sie offen und schnappen nicht erneut.
- Beim Bauen gefunden und behoben: cloneState kopierte die Sperren nicht
  mit (Brettform ist unveraenderlich, Sperren sind es nicht) - eine Mauer
  verschwand darum schon beim ersten Schlag, statt zu broeckeln.
- Ohne Sperren im Zustand aendert sich am Spiel nichts - eigens geprueft.
- BILD-PROMPTS an die Mechanik angepasst: Tabelle mit Haerte, Preis und
  Stadien je Stueck, dazu vier neue Prompts (Bollwerk heil/angeschlagen,
  Baerenfalle verdeckt/zugeschnappt). Kopierseite auf 28 Karten.

NOCH NICHT GEBAUT: Kauf im Lager, Platzieren auf dem Brett, Darstellung.
Die Regeln stehen, die Oberflaeche fehlt.

## 0.89.0

DAS MUSIKARCHIV: JEDE FASSUNG, DIE JE ENTSTAND, IST WIEDER HOERBAR

- Die Klangwerkstatt (?klangwerkstatt) zeigt jetzt ALLE 25 Stuecke aus
  allen Runden, nach Gruppen sortiert und sprechend benannt: Menue A bis L,
  Weltkarte A bis C, Kapitel I bis III, Gefecht A bis C, Meister A und B,
  dazu Halle und Schnelles Spiel. Jedes mit seiner Herkunft (welche
  Fassung, welche Besetzung), und markiert, welches gerade im Spiel laeuft.
  Grund: der Besitzer suchte eine fruehere, "mystischere" Menuefassung, die
  im Spiel nicht mehr erreichbar war - jetzt liegen sie alle nebeneinander
  zum Vergleich.
- Das Archiv wird NICHT eingebunden: 26 MB im Buendel waeren unvertretbar.
  Wie schon bei der Schaukammer legt der Bau die Stuecke neben das Spiel
  (dist/klangarchiv) und die Werkstatt holt Liste und Klang zur Laufzeit.
  Buendel unveraendert bei 1,75 MB. Fuers Archiv genuegt Mono bei 112 kbit -
  es geht ums Vergleichen der Stimmung, nicht ums Stereobild.
- Die Stuecke liegen als Quelle unter archiv/musik mit verzeichnis.json;
  neue Fassungen dort abzulegen genuegt, der Bau nimmt sie mit.

## 0.88.0

ELF NEUE STUECKE IN EINER HANDSCHRIFT, DIE SCHAUKAMMER, KORRIGIERTE PROMPTS:

- MUSIK: zehn Stuecke neu, alle in derselben Sprache (tiefe GEZUPFTE Saiten,
  im Auftrag ausdruecklich ohne gestrichene Streicher, Blaeser, Chor,
  Glocken - nichts Grelles). Drei Menue-Abwandlungen, je ein Stueck fuer
  Halle und Schnelles Spiel, eigene Melodien fuer Kapitel I (G-Dur,
  freundlich), II (D-Dur, warm) und III (e-Moll, dunkler), ein
  zurueckhaltendes Gefecht (nur schneller, 104 BPM - kein Aufbau, kein
  Hoehepunkt) und ein Meister, der seine Zaehne NUR in den ersten Sekunden
  zeigt. Alle auf -23,5 dBFS gemischt, also leiser als zuvor: Hintergrund
  soll Hintergrund bleiben.
- Ein Stueck war zu grell (22 % Hoehenanteil ueber 3 kHz) - messbasiert um
  11 dB gedaempft, jetzt 6,9 %. Alle anderen lagen schon unter 4 %.
- DIE SPANNUNGSSTUFE IM GEFECHT IST STILLGELEGT: der Wechsel war "viel zu
  krass". Es gibt ein einziges, ruhiges Gefechtsthema.
- DRACHENFLUG laenger und lauter: 1,59 statt 1,19 s, -18,9 statt -20,9 dB.
- DIE SCHAUKAMMER (?werkstatt) ersetzt die Figurenwerkstatt: alle 382 Bilder
  des Hauses nach Gruppen, zum Scrollen, mit Titel und Dateiname, gross
  anzeigbar und einzeln als Original herunterladbar. Kein Auswahlfeld mehr.
  ZWEI FEHLVERSUCHE davor, beide gemessen: statische Importe bliesen das
  Buendel von 1,7 auf 2,82 MB (Bau brach ab), import.meta.glob warf im
  Rauchtest und liess die Einzeldatei auf 119 MB wachsen. Jetzt legt der
  Bau die Bilder als Kopie neben das Spiel und die Kammer holt sie zur
  Laufzeit - kein Buendler sieht sie je. Buendel wieder 1,75 MB.
- BILD-PROMPTS KORRIGIERT: die Landschaften folgen jetzt der Weltkarte.
  Kapitel I war strohig-golden beschrieben - das ist die Kornmark; Kronland
  ist gruen mit weisser Stadt. Sattelweite und Aschgrund waren vertauscht,
  und ein zwoelftes Kapitel "Osrics Halle" hatte ich erfunden: XI ist Die
  Kueste, XII das Endlose Meer. Dazu neue Prompts fuer Mauer, Falle und
  Zaun.

## 0.87.0

DIE KAMPAGNENFIGUREN SIND ZURUECK - MEIN FEHLER AUS v0.86:

- In v0.86 habe ich "reines Schach" an den REGELN erkannt und daran ALLES
  aufgehaengt, auch die Figurenoptik. Die fruehen Kampagnenstationen laufen
  aber nach Schachregeln - und so standen im Feldzug ploetzlich gewoehnliche
  Turnierfiguren statt der geschnitzten. Jetzt sind es ZWEI Begriffe:
  klassikOptik (nur echte klassische Betriebsart, NIE die Kampagne) fuer das
  Aussehen, schlichteRegeln (state.rules === "chess") fuer Leisten und
  Brettmitte. Sondenbeleg: 32 Bildfiguren auf dem Kampagnenbrett, 0 Vektor.
- KLASSISCHE FIGUREN NORMIERT: der helle Turm hatte 574 px Sockelbreite
  (kleinste im Satz: 389) und sass 32,5 px links aus der Mitte - genau was
  der Besitzer sah. Jetzt gibt eine gestaffelte Vorgabe den Sockel vor
  (Bauer 0,84 bis Koenig 1,0 von 430 px), alle exakt mittig und auf einer
  Fusslinie. Sockelstreuung von 185 px auf 69 px, Mittenabweichung von
  33,5 px auf 8 px.
- HELLIGKEITEN ANGEGLICHEN: bei Schwarz waren Laeufer (56) und Dame (61)
  deutlich dunkler als Koenig (81) und Turm (85). Der Besitzer bevorzugt
  das hellere Anthrazit - alle liegen jetzt bei 79-80. Bei Creme desgleichen
  auf 173-175, damit der Koenig nicht mehr heraussticht. Streuung von 28,6
  auf 0,8 (dunkel) und von 21,5 auf 2,0 (hell).
- KOPFZEILE WIEDER OBEN: in v0.86 hatte ich den ganzen Zweig zentriert, um
  das Brett mittig zu bekommen - dabei wanderte die Kopfzeile mit nach
  unten. Jetzt steht sie bei 10 px, und nur der Raum DARUNTER wird
  aufgeteilt. Ein erster Versuch mit zwei Abstandhaltern nahm dem Brett den
  Platz (es schrumpfte auf ein Viertel, von der Sonde gesehen); ein Rahmen
  loest es richtig - Zellen wieder 47 px.
- AUFSTELLUNG: die Figuren in den Kacheln waren kaum zu sehen. Die Deckel
  stammten aus der Zeit, als Glyphe UND Beschriftung in eine 35-px-Zelle
  mussten - die Beschriftung ist laengst fort. Deutlich angehoben
  (7vw auf 10vw, 9vw auf 12,5vw, 18vw auf 22vw).

## 0.86.0

REINES SCHACH IST REINES SCHACH - UND DIE FIGUREN STEHEN AUF EINER LINIE:

- SECHS KLAENGE NACH DEM HOERURTEIL NEU: Stufenaufstieg jetzt im Geist der
  gelobten Kroenung (dunkle Bronzeglocke, 537 statt 1440 Hz), Faehigkeit
  frei ebenso aber kuerzer (1,0 s), Drachenflug als WIND (142 Hz, kein
  Gebruell), Fernangriff als kurzes Pfeifen eines vorbeifliegenden Pfeils,
  Niederlage KUERZER (0,72 statt 0,92 s), Held rekrutiert neu und laenger
  (Hornruf, Harfe, ein Trommelschlag - 3,4 s).
- SCHNELLES SPIEL MIT SCHACHREGELN ZEIGTE FAELSCHLICH DIE KAMPFLEISTE UND
  DIE AUSRUESTUNGSZEILE: Ursache war, dass nur die BETRIEBSART gefragt
  wurde (classic / Tagesraetsel) - ein Schnelles Spiel mit Schachregeln
  fiel durchs Raster. Jetzt entscheidet die REGEL der laufenden Partie;
  die Zeile musste dafuer hinter den Zustand wandern, denn erst er kennt
  sie. Im reinen Schach schweigen beide Leisten - und das BRETT RUECKT IN
  DIE MITTE. Nachgemessen: 234 px Luft oben, 234 px unten.
- ALLE 114 GESCHNITZTEN FIGURENBILDER AUF EINE LINIE GEBRACHT: Der Turm
  war nur 458 px hoch (Bauer: 538) - weil alle Bilder auf dieselbe
  Kastenhoehe skaliert werden, erschien er dadurch rund 18 % breiter, samt
  Sockel. Genau das hat der Besitzer gesehen. Jetzt ist nicht mehr die
  Bildhoehe massgeblich, sondern die SOCKELBREITE: jede Figur wurde so
  skaliert, dass ihr Sockel 252 px misst, und alle stehen auf derselben
  Grundlinie (786). Streuung der Sockelbreiten von 46 px auf 25 px
  gefallen, alle Figuren zugleich etwas kleiner.
- Beim Normieren hat der Zeitausfall EINE Datei mitten im Schreiben
  zerrissen (carved-gambit-t5-dark.webp); sie wurde aus dem Bestand
  wiederhergestellt und einzeln nachgezogen - geprueft: alle 114 Dateien
  lesbar.

## 0.85.0

DIE MUSIK LIEGT JETZT AUCH IN DER WERKSTATT (Besitzerfrage, Antwort war
NEIN - bis jetzt):

- Die Klangwerkstatt (?klangwerkstatt) hat eine MUSIKABTEILUNG bekommen:
  alle fuenf Bereichsstuecke mit eigenem Spieler, eines nach dem anderen,
  erneutes Tippen haelt an. Der Abhoerregler gilt auch fuer sie.
- ANALYSE STATT RATEN: Der Besitzer mochte "den Anfang" des Menuestuecks,
  ohne benennen zu koennen, was dort spielt. Nachgemessen: in den ersten
  Sekunden liegen 90 % der Energie unter 300 Hz, der tragende Ton ist A3
  (221 Hz), und die Anschlaege kommen alle 0,72 s - exakt die 84 BPM des
  Auftrags. Es sind also TIEFE GEZUPFTE SAITEN (Cello-Pizzicato,
  Bassgambe) mit sehr wenigen Obertoenen; daher der dumpfe, fast
  tastenartige Eindruck.
- Drei neue Menuefassungen erzeugt, die NUR das spielen - im Auftrag
  ausdruecklich ohne gestrichene Streicher, ohne Geige, ohne Blaeser und
  Chor. Dazu eine helle, entspannte Kartenfassung mit gezupfter
  Nylonsaiten-Gitarre fuer das erste Kapitel. Alle vier liegen dem
  Besitzer zur Wahl vor, zusammen mit dem Vorbild-Ausschnitt.

## 0.84.0

DAS ZUBEHOER FOLGT DEM STIL, VIER SYMBOLE NEU GEZEICHNET:

- ItemIcon fragt jetzt den Stilschalter: im schlichten Stil weicht das
  gemalte Bild der Vektorzeichnung - Trank, Sanduhr, Fackel, Kompass und
  alles Uebrige. Entweder das eine oder das andere; ein Haus aus gemalten
  Truhen und schlichten Figuren war der Zwitter, den der Besitzer zu Recht
  bemaengelt hat.
- VIER SYMBOLE NEU: die KRIEGSAXT las sich als Pilz (vier Anlaeufe: Pilz,
  Fahne, Scheibe, endlich Axt - der Fehler war jedes Mal ein rundes statt
  eines geschnittenen Blattes; jetzt mit eingezogener Taille am Schaft und
  ausholender Schneide). Die MACHETE war ein schraeger Stab, jetzt eine
  gebogene Haumesserklinge mit Ruecken, Spitze und gewickeltem Griff. Die
  BRIEFTAUBE las sich als Blatt, jetzt Kopf, Schnabel, Fluegel, Schwanz
  und die Botschaft am Bein. Das BOOT hatte als einziges Symbol ein
  cremefarbenes Segel - vergoldet.
- design/BILD-PROMPTS-KAPITEL.md: zwoelf vollstaendige Prompts fuer die
  Kapitel-Einstiege (der Gambit von hinten, davor die Landschaft, unteres
  Viertel ruhig fuer den Text). Dazu eine Kopierseite mit einem Knopf je
  Bild - Markdown kann keine Knoepfe, darum liegt beides vor.

## 0.83.0

DIE WELTKARTE LIESS SICH NICHT BEDIENEN - JETZT SCHON:

- FEHLER GEFUNDEN: Das Kapitelblatt sass ABSOLUT IM KARTENBILD (left 50 % des
  Bildes) - und dieses Bild ist um ein Vielfaches breiter als der Schirm. Wer
  Kapitel I ganz links antippte, bekam sein Blatt weit rechts ausserhalb des
  Ausschnitts: es sah aus, als passiere gar nichts. Jetzt haengt es am
  SCHIRM, fest unten in der Mitte. Sondenbeleg: Blatt sichtbar auf 390x844
  und 360x640.
- DIE WELTKARTE BEKOMMT DEN GLEICHEN KASTEN WIE DIE KAPITELKARTE. Zuvor lag
  sie in einem eigenen Vollbild-Polster (18/104), waehrend ihre Hoehe aus
  frameH kam - einer Rechnung fuer einen ANDEREN Raum. Beides passte nur
  zufaellig zusammen; je nach Geraet stand die Welt zu hoch oder ragte ueber
  den oberen Rand. Jetzt misst sie die Lage des Kartenbereichs und belegt ihn
  exakt. Nachgemessen: Kapitelrahmen und Weltkasten sind PIXELGLEICH
  (12/12/366/740 bzw. 12/12/336/536).
- DER SCHLICHTE STIL GILT IM GANZEN HAUS (Besitzerentscheid): Wer im Profil
  "Simpel" waehlt, bekommt ihn nicht nur auf dem Brett, sondern auch im
  Hofstaat, in der Aufstellung und in jeder Figurenkarte - ein Schalter
  (setSchlicht/schlichtAn) ist die eine Wahrheit, alle Ansichten fragen ihn.
  Der Haendler bleibt gemalt: er ist ein Bild, keine Spielfigur.
- MUSIK: Menue- und Kartenthema sind GESCHWISTER geworden - dieselbe
  Besetzung (Cello, Gambe, Laute, Blockfloete), dieselbe Tonart (d-Moll),
  dasselbe Tempo (84); nur die Haltung wechselt von ruhend zu wandernd. Die
  Blende dauert jetzt NEUN Sekunden (aus 5 s, ein 7 s, Beginn nach 2 s). Ein
  harter Schnitt ist damit nicht mehr moeglich.
- ERKLAERTEXTE: das Wort LIGA ist getilgt (es gibt nur Kapitel), und der
  laengste Text (634 Zeichen Rechenliste) ist auf das Noetige gekuerzt -
  deutsch wie englisch.
- ABSTURZ VOR DEM PUSH GEFANGEN: der neue Stil-Hook las profile.pieceStyle,
  waehrend profile beim Start noch null ist - die Sonde fing es, nicht der
  Besitzer.

## 0.82.0

DAS OHR DES BESITZERS HAT ENTSCHIEDEN - DREIZEHN KLAENGE NEU, ALLES LEISER:

- ALLES EINE STUFE ZURUECK ("das muss viel weniger sein"): die Aufnahmen
  selbst sind leiser gemeistert (-22 bis -33 dBFS) UND die Pegeltafel ist
  durchgehend gesenkt. Zwei Bremsen statt einer.
- NEU ERZEUGT nach dem Hoerurteil: gesperrt (sanftes dumpfes Nein, 260 Hz),
  Rochade (zwei leise Tocks nacheinander), Sturmschritt (drei eilige
  Holzschritte statt Rauschen), Zeitenwender (fast unhoerbar statt
  stoerend), Sieg (warme wuerdevolle Aufloesung), Meister (Stein und Atem
  wie die gelobte Bestie, dazu ferne Glocke und Chor), Stufenaufstieg und
  Faehigkeit-frei (beide im Geist der gelobten Kroenung), Station antippen
  (fast nichts), Held rekrutiert, Fernangriff (OHNE das Pfeifen).
- UMBELEGT: das Talent des Risses klingt jetzt wie das Talent des Hofes -
  ein Haus, ein Zeichen; sein alter Charakter lebt im Stufenaufstieg
  weiter, wo der Besitzer ihn passender fand.
- DER HEROLD IST FORT: er klang nur beim allerersten Oeffnen eines
  Menue-Blattes - so selten, dass er sich nicht zuordnen liess.
- ZWEI NEUE KLAENGE DER WELTKARTE: der Gambit rueckt vor (Holz rutscht ueber
  Stein, leise, bei jedem Zug auf der Karte) und ein NEUES KAPITEL tut sich
  auf (Pergament rollt, ferner Hornruf) - letzteres nur, wenn der Weg
  wirklich ueber eine Kapitelgrenze fuehrt.
- PROFIL, UX: SPIELSTAND WECHSELN und ABMELDEN stehen jetzt OBEN beim
  Namen statt weit unten hinter Schwierigkeit und Figurenstil. Wer das
  Profil oeffnet, sucht meist genau das - und musste bisher scrollen.
- LADESCHIRM: der Komet lief 7 % AUSSERHALB der Kontur und zog einen 64 px
  langen Schweif - zusammen las sich das als starrer Strich. Jetzt laeuft
  er dicht an der Kontur (inset 3 %), der Schweif ist 34 px kurz und
  duenner, und statt vier fliegen SIEBEN Funken tangential weg.
- design/IDEEN-UND-OFFENES.md angelegt: die Kartenerzaehlung (Gegner tritt
  aus dem Dunkel in den Weg, Rueckkehr zur Karte nach dem Sieg), Mauern und
  Fallen als Ausruestung, Namenspflicht beim Anlegen, Ladeschirm auch ohne
  Ladevorgang - alles festgehalten, noch nicht gebaut.

## 0.81.0

DER HELD TRITT SPAETER AUF, DAS BRETT KLINGT HOELZERN, DIE MUSIK ATMET:

- EIN KLANG FUER BEIDE SEITEN (gemeldeter Fehler, Ursache gefunden): fuer
  den Zug lagen DREI Aufnahmen bereit, aus denen zufaellig gewaehlt wurde -
  und eine Regel erzwang, dass nie zweimal dieselbe kam. Eigener Zug und
  Antwort des Gegners folgen unmittelbar aufeinander, klangen also
  ZWANGSLAEUFIG verschieden. Jetzt: genau eine Aufnahme, beide Seiten.
- DER ZUG IST HOELZERN, NICHT METALLISCH: neu erzeugt und tiefpassgefiltert,
  Schwerpunkt 538 statt 1893 Hz, Pegel -23,5 statt -18 dBFS (leiser, damit
  er auf Dauer nicht nervt).
- WER SPRINGT, SCHLEIFT NICHT: Springer und jeder nicht-lineare Zug sind
  beim Abheben STILL und setzen nur mit einem leisen hoelzernen Tock auf
  (0,12 s, 707 Hz), getaktet auf das Ende der Flugzeit.
- DIE MUSIK BLENDET SANFT: 6 s statt 1,8 s, und NACHEINANDER statt
  gleichzeitig - erst sinkt das alte Stueck ueber 3,4 s, dann steigt das
  neue ueber 4,6 s, beides auf einer weichen Kosinuskurve statt einer
  Geraden. Kein Moment mehr, in dem zwei Melodien gegeneinander stehen.
- NEUES MENUESTUECK: das alte klang asiatisch; die Neufassung fuehrt ein
  TIEFES SOLO-CELLO und schliesst im Auftrag asiatische Instrumente und
  pentatonische Skalen ausdruecklich aus. Zwei weitere Fassungen (Hof,
  Froh) liegen dem Besitzer zur Wahl vor.
- DER GRAND GAMBIT TRITT SPAETER AUF (Besitzerentscheid): das Wappen aus
  v0.80 ist wieder fort. Stattdessen beginnt die Geschichte OHNE Helden -
  die ersten drei Gefechte sind schlichtes Schach, die Bauernreihe ist
  eine Bauernreihe, und im Hofstaat steht kein Gambit (kein Name, kein
  Bild, kein leerer Platz). Nach drei geschafften Stationen erwacht er:
  ab da fuehrt er wieder seine Linie und traegt IM BILD mindestens Stufe
  II - Kapuze, Stab und Klinge statt Bauernkutte. Nur die Darstellung,
  nicht die Kraft: Stufe, Faehigkeiten und Schilde bleiben unberuehrt.
  Sondenbeleg: Hofstaat vorher [Bauer..Koenig], nachher [Grand Gambit,
  Bauer..Koenig].
- POPUPS OBEN VERANKERT (Besitzervorschlag, richtig): zentriert wuchsen
  sie in BEIDE Richtungen und schoben ihren Kopf unter die Leiste. Jetzt
  beginnt jedes Popup auf DERSELBEN Hoehe und scrollt in sich. Gemessen am
  groessten (Turm): schmal 14 px, breit 118 px (Leiste endet ~100).
- Zwei Pruefungen mitgezogen: eine erwartete den Helden bedingungslos; die
  andere spielte den Bergfried (Station 44) mit einem Profil OHNE einen
  einzigen Sieg - eine Lage, die es im Spiel nicht gibt. Mit dem Weg, den
  der Ort voraussetzt, steht die Belagerung wieder bei 24 statt 14
  Halbzuegen.

## 0.80.0

DAS SPIEL BEKOMMT SEINE MUSIK, DER HELD SEIN WAPPEN, DER FERNANGRIFF SEIN
BILD - UND DIE POPUPS WEICHEN DEN LEISTEN AUS:

- BEREICHSMUSIK (Besitzerwunsch): fuenf eigens komponierte Stuecke
  (ElevenLabs-Musik, rein akustisch-mittelalterlich, keine Elektronik, als
  Endlosschleifen gebaut, alle auf -21,3 dBFS wie der alte Soundtrack):
  MENUE warm und einladend, KARTE hell-pastoral, KAMPF ruhig und
  konzentriert, KAMPF-SPANNUNG mit Trommeln und Draengen, MEISTER mit
  Glocke und Chor. Die Musikregie (musik.js) kennt den Bereich, der neue
  Soundtrack blendet mit zwei Spielern in 1,8 s weich ueber. Die Partie
  kippt nach KRAEFTEVERHAELTNIS in die Spannungsstufe (HP-Summe bzw.
  Figurenwert; hinein unter 0,72, heraus ueber 0,90 - Hysterese gegen
  Flattern), das Kapitelfinale traegt durchweg das Meisterthema.
- ZWEI-ZWEIGE-FALLE BEHOBEN: der breite Zweig der App hatte NIE Soundtrack
  oder Klang-Regie - der Schreibtisch spielt jetzt dasselbe Haus.
- REACT-#310-FALLE: der Musik-Hook der Huelle stand zuerst NACH den
  bedingten Rueckkehrstellen und stuerzte die App - die Sonde fing es vor
  dem Push; der Hook rechnet inMatch/mapView jetzt selbst und steht vor
  allen Rueckkehrstellen.
- DER GAMBIT TRAEGT SEIN WAPPEN: die Stufe-1-Schnitzerei ist mit Absicht
  ein Bauer unter Bauern - aber fuer den eigenen Blick sitzt jetzt ein
  kleiner Wappenschild (Gold auf Nachtblau, Stern) an seiner Schulter;
  beim Gegner-Helden violett. Er folgt showHero, verschwindet also mit der
  Maskerade aus dem Blick des Gegners, und sitzt in der Bildkiste, damit
  er Auswahl-Skalierung und Gleit-Animation mitmacht. Sondenfoto: ein
  einziges Wappen auf dem Brett, am Helden. (Der Simpel-Stil zeichnete den
  Helden schon immer eigen - gekroent, mit Sternschild.)
- DIE RISS-STERNE: ein Fernangriff zeigt sein Ziel - auf jedem getroffenen
  Feld birst ein violetter Stern auf und GLIMMT 2,5 s nach; die Felder der
  Schockwelle tragen dasselbe Zeichen, gestaffelt nach der Ankunft des
  Schlaegers (zugDauerMs), der Schuss mit dem Pfeil-Einschlag (160 ms).
- POPUP-FREIRAEUME: <main> traegt eine mask-image und bildet einen
  Stapelkontext - Menueleiste (breit, oben) und Dock (unten) liegen darum
  IMMER ueber jedem Popup in <main>, kein z-Index hilft. Die Huelle setzt
  jetzt --gg-popfrei-oben/-unten (breit 104px oben, schmal 92px+Sicherheit
  unten), die drei Hofstaat-Popups polstern damit und deckeln ihre
  Innenhoehe. Nachgemessen: breit beginnt die Karte bei 125px (Leiste
  endet ~100), schmal endet sie bei 729px (Dock ab ~735).
- WELTKARTE: minimal mehr Luft zu den Menues (schmal 8/10/84 statt
  0/6/72, breit 14/16 statt 10/10).
- Der Hofstaat- und der Karten-Klang aus v0.79 bleiben unveraendert; die
  fuenf Musikstuecke liegen zusaetzlich als mp3 beim Besitzer zur Abnahme.

## 0.79.0

DER GANZE KLANGKATALOG SPIELT, DIE ENGINE LERNT WELLE UND KURZE BOGEN,
DAS SPIEL BEKOMMT SEINE STIMME AN EINEM FESTEN ORT:

- TIMING (Besitzerwunsch): Treffer und Sturz klingen BEIM EINSCHLAG, nicht
  beim Loslassen. Die Dauerformel der Gleit-Animation ist als zugDauerMs
  aus dem Brett ausgefuehrt; Klang und Ereignismeldung warten exakt so
  lange. Das Schleifen beginnt sofort - es IST der Weg. Beide Seiten
  nutzen dieselben Klaenge (der KI-Zug lief schon immer durch dieselbe
  Stelle).
- DUMPFER: Sturz 851->622 Hz, Treffer 485->358 Hz (Tiefpass, nachgemessen)
  - Holz auf Holzplatte, kein Klingen.
- ALLE 29 KATALOGKLAENGE im Repo und verdrahtet: Rochade, Kroenung,
  PFEIL fuer den Fernangriff (2 Varianten: Sehne, Flug, hoelzerner
  Einschlag), Talente (gold fuer den Hof, violett fuer den Riss),
  Drachenflug, Trank, Zeitenwender, Zeitriss, BESTIE beim Monsterauftritt,
  MEISTER beim Kapitelfinale, Werbung und Kapitelende gestaffelt nach dem
  Siegesklang, Kartenstation, Herold beim Erstbesuchsblatt (in BEIDEN
  App-Zweigen), Menue-Tipp am Dock - bewusst der leiseste Klang im Haus
  (Pegel 0,28), nur beim Wechsel.
- ENGINE: Der FERNANGRIFF reicht 2-3 Felder statt 2-4 - kurz, wertig,
  ueber Koepfe hinweg, kein Ersatz fuer eine Laufbahn. Die SCHOCKWELLE
  ist scharf: einmal pro Partie trifft der erste Nahkampfschlag alle
  Gegner rings um das Ziel mit HALBEM Schaden; eigene Figuren bleiben
  heil, Drachenfluegel leiten auf den Drachen um, kein Uebertrag auf
  Schuesse. 16 neue Pruefungen.
- DIE MELDUNGSPLAKETTE: "Du bist am Zug" stand als nackte Schrift
  verloren im Raum - jetzt sitzt die Stimme des Spiels in EINER gefassten
  Kapsel mit Statuspunkt (gold = du, violett = Gegner, hellgold =
  Schach). Ein frisches Ereignis ("Bauer gefallen", "Treffer - Turm -3",
  "Rochade", "Kroenung!") verdraengt den Zugstand fuer ein paar Sekunden
  und erscheint MIT dem Einschlag. Sondenbeleg: Foto mit "Bauer gefallen".
- DIE KLANGWERKSTATT (?klangwerkstatt, in der Verwaltung verlinkt): alle
  Klaenge in fuenf Gruppen, abgespielt ueber die ECHTE klang()-Schicht
  mit denselben Pegeln und der +-4%-Streuung; eigener Abhoerregler, der
  das Profil nicht anfasst.
- WERKZEUGPFLEGE: messe-knoepfe kannte noch Hofstaat und Schatzkammer
  (heissen seit v0.72/74 Figuren und Lager) - nachgezogen, wieder gruen.

## 0.78.0

DAS HAENDLERBILD LEICHTER, DER KLANGKATALOG RICHTIGGESTELLT:

- HAENDLERBILD: dasselbe Original, nur VERLUSTFREI nach WebP umkodiert -
  2 276 039 B -> 1 513 750 B bei nachgemessen NULL Abweichung in RGB UND
  Alpha (groesste Abweichung je Kanal: 0). Es bleibt bei 1024x1024 und der
  vom Besitzer gelieferten Freistellung; kein Verkleinern, kein Weichzeichnen.
- KLANG-KATALOG (design/KLANG-PROMPTS.md) nach dem Hoerurteil des Besitzers
  umgeschrieben: Das Brett ist eine HOLZPLATTE, kein Stein. Ein Zug ist kein
  Anschlag, sondern ein SCHLEIFEN ueber das Brett. Schlag und Sturz sind
  Holz auf Holz - dumpf, hohl, ohne helles "Ding". Dazu die Pflichtzeile
  "One single sound, no repetitions" fest im Katalog vermerkt.
- DER GESAMTE RESTKATALOG erzeugt (Rochade, Kroenung, Talente, Trank,
  Zeitenwender, Zeitriss, Riss-Blitz, Bestie, Meister, Werbung, Kapitel,
  Menue und Karte) und je Klang die beste Aufnahme nach Messung gewaehlt.
  Sie liegen zum Hoeren bereit; die Wahl trifft der Besitzer.
- EINGEBAUT sind die drei Brettklaenge, an denen das Hoerurteil hing:
  ZIEHEN traegt jetzt drei SCHLEIF-Varianten (99-274 ms bis zur Spitze, nur
  1-6 % der Energie in den ersten 30 ms - der alte Anschlag hatte 4 ms und
  60 %), SCHLAG und STURZ je zwei Holz-auf-Holz-Aufnahmen bei 485/983 Hz
  bzw. 851/2063 Hz, ohne hellen Anteil. Anwaehlen bleibt, wie es war -
  der Besitzer hat es bestaetigt.

## 0.77.0

KAPITEL I WIRD ZUR SCHULE DES SCHACHS, DER HAENDLER BEKOMMT SEIN ORIGINAL,
SIEBEN NEUE KLAENGE:

- KAMPAGNE (Besitzerwunsch): Die erste HAELFTE von Kapitel I laeuft nach
  REINEN SCHACHREGELN - 22 Schachstationen statt zwei, elf davon auf dem
  Hauptast, elf in den Nebenaesten, auf allen fuenf Karten (classic,
  skirmish, courtyard, gauntlet, arena). Bei NEBELMOOR, der Mitte des
  Hauptastes, erwacht die alte Magie ("Figuren bluten, Figuren halten
  stand") - ab da HP. Nebenaeste folgen ihrem Ankerpunkt: ein Abstecher
  aus der Schachhaelfte bleibt Schach.
- Beide Werbungen von Kapitel I (Magier, Paladin) liegen jetzt HINTER dem
  Erwachen. Die Schachhaelfte kommt ohne neue Figuren aus; es geht nur um
  Zuege und die Zug-Faehigkeiten der Leiter.
- DER LEBENSTRANK ist vorher weder sichtbar noch kaeuflich (needsHp am
  Gegenstand, itemRevealed fragt hpUnlocked). Ein Trank ohne Lebenspunkte
  waere eine Luege im Laden.
- HP-TALENTE SCHLAFEN, bis die Magie erwacht: Lebensraub, Regeneration,
  Bollwerk, Schockwelle, Kettenblitz, Enterhaken tragen hpOnly und sind
  nicht kaeuflich, solange es keine Lebenspunkte gibt - sonst verbrennt
  man in der Schachhaelfte Sternenstaub fuer nichts. Die Karte sagt es an:
  "Schlaeft, bis die alte Magie erwacht."
- ENGINE: Der FERNSCHUSS haelt sein Versprechen jetzt auch unter
  Schachregeln - das Ziel faellt, der Schuetze BLEIBT STEHEN. Bisher zog er
  faelschlich auf das Zielfeld und damit bis zu vier Felder weit in jede
  Richtung.
- DER HAENDLER traegt sein Original: 1024x1024, byte-gleich wie geliefert
  (sha256 geprueft), bereits sauber freigestellt. Die alte Fassung war von
  mir auf 520 px verkleinert und auf dunklen Grund plattgerechnet worden -
  daher der matschige Eindruck. Neuer png-Loader in JEDEM esbuild-Skript,
  sonst faellt so ein Import still aus.
- KLANG: sieben neue Klaenge ueber die ElevenLabs-API nach
  design/KLANG-PROMPTS.md, geschnitten (Einsatz 0 ms) und auf -3 dBFS
  gebracht wie die vier davor. Endlich besetzt: der SETZ-KLANG. Dazu
  Schach, Sieg, Niederlage, Stufenaufstieg, Faehigkeit freigeschaltet und
  Gold - an ihren Stellen verdrahtet (Schach nur beim Wechsel, Remis
  bleibt still). Zwei weitere Setz-Varianten und der Riss-Blitz warten auf
  das Ohr des Besitzers und sind NICHT eingebaut.

## 0.76.0

DIE STILLSTANDSREGEL:

- HP-REMIS: Bleiben 120 Halbzuege (60 Zuege je Seite) ohne jeden Schaden,
  endet das Gefecht unentschieden. Zaehler ohneSchaden im Kern, durch
  cloneState und den Codec getragen; Banner nennt den Stillstand, das
  Statusband warnt die letzten zehn Zuege vorher. Nur HP-Regeln.
  Gemessen: KI-Selbstspiel erreicht hoechstens 88 schadenfreie Halbzuege -
  die Regel schneidet keine echte Partie ab.

## 0.75.2

DIE KLANGWAHL DES BESITZERS:

- Aus den elf zerlegten Takes hat der Besitzer VIER bestaetigt: Anwaehlen
  (tap-select-3), Treffer (hit-3), Sturz (capture-kill-2) und Gesperrt
  (denied-2). Die Klangschicht nutzt jetzt genau diese - die uebrigen
  sieben Aufnahmen sind aus dem Buendel entfernt.
- DER SETZ-KLANG BLEIBT STUMM: keiner der Takes hat dem Besitzer
  getaugt, und ein mittelmaessiger Klang, den man hundertmal je Partie
  hoert, ist schlimmer als gar keiner. Die Liste ist leer angelegt und
  der Abspieler faengt das ab (kein Leerlauf, kein Fehler) - sobald ein
  Take sitzt, ist es ein Einzeiler.

## 0.75.1

DER HAENDLER: DAS RICHTIGE BILD AN DER RICHTIGEN STELLE:

- Besitzer-Ruege, berechtigt: der Haendler hatte im Warenraum LAENGST ein
  Bildnis (painted-haendler). Ich hatte sein neues Bild zusaetzlich
  darueber gehaengt, statt das alte zu ERSETZEN. Jetzt ist es ersetzt -
  eine Datei, ein Auftritt, alle Aufrufer unveraendert; mein doppelter
  Block im Lager ist wieder fort.
- Der GOLDENE SCHIMMER um sein Bildnis faellt weg: freigestellt wie alle
  anderen Figuren, nur ein ehrlicher Schlagschatten. Dafuer steht er
  etwas groesser (116x130 statt 92x108).

## 0.75.0

DAS BRETT KLINGT - DIE ERSTEN FUENF KLAENGE:

- Aus den fuenf Aufnahmen des Besitzers (je ~62 s mit vielen Takes) wurden
  automatisch die BESTEN 11 Einzelanschlaege geschnitten: bewertet nach
  Rauschabstand, Anschlagschaerfe und Ausklang, dann auf -18 dBFS RMS
  normiert, Spitzen unter -3 dBFS, Einsatz in den ersten Millisekunden,
  weicher Ausklang. Als Opus/webm abgelegt - alle elf zusammen 76 KB.
- VARIANTEN gegen Ohrmuedigkeit: Setzen und Anwaehlen dreifach, Schlagen
  und Sturz doppelt; nie zweimal hintereinander dieselbe Aufnahme, dazu
  +-4 % Tonhoehenstreuung je Anschlag.
- KLANGSCHICHT (src/app/ui/klang.js): EIN AudioContext, Puffer einmal
  entschluesselt, je Anschlag eine frische Quelle - latenzarm, ueberlagert
  sauber, wuergt sich nicht ab. Wird beim Start vorgewaermt.
- DER KLANG FOLGT DEM ERGEBNIS, nicht der Absicht: erst nach dem Zug steht
  fest, ob gesetzt (zug), getroffen (treffer) oder gestuerzt wurde (fall) -
  gelesen aus lastMove.
- EIGENER SCHALTER im Profil ("Klänge"), getrennt von der Musik: wer das
  eine mag und das andere nicht, bekommt beides.
- esbuild-Falle erwischt: .webm brauchte in ZWEI Skripten einen eigenen
  Loader - ohne ihn fiel der Testlauf still von 20 auf 12 Suiten
  (812 -> 393). Behoben, wieder 812/0/20.

## 0.74.1

DER HAENDLER BEKOMMT EIN GESICHT, DIE RAEUME BEKOMMEN ZEICHEN:

- DAS HAENDLERBILD des Besitzers (geschnitzter Verkaufsstand mit
  Baldachin, Traenken, Sanduhr und Beutel) ist freigestellt (weisser
  Grund entfernt, weiche Kante) und steht im Lager ueber der Warenliste.
- VIER RAUM-ZEICHEN als Vektoren in den violetten Schienen-Knoepfen:
  Figuren (zwei Gestalten, die vordere gekroent), Aufstellung
  (Brettausschnitt mit besetzten Feldern), Schatzkammer (Truhe mit
  Beschlag), Haendler (Stand mit gezacktem Baldachin und Flaeschchen).
  Sie nehmen die Knopffarbe an - hell wenn gewaehlt, gedimmt sonst.
- HOFSTAAT HEISST JETZT FIGUREN (Menuewort und Tab; en: Pieces).
- VERWALTUNG IM PROFIL: wer als Admin angemeldet ist, findet unter
  Profil einen Block mit allen Tueren - Admin-Portal, Spielerbuch,
  Figurenwerkstatt, Musterkammer und die oeffentliche Landingpage.
  Fuer alle anderen existiert der Block nicht.
- Sondenbelege: Menue zeigt SPIELEN/FIGUREN/LAGER/PROFIL, alle vier
  Schienen-Knoepfe tragen ihr Zeichen, das Haendlerbild erscheint.

## 0.74.0

DER AUFTRITT: LANDINGPAGE, RECHTSTEXTE, ICONS - BEREIT FUER DIE WELT:

- LANDINGPAGE NEU (public/landing.html) mit echtem Bildmaterial aus dem
  Spiel: zusammengesetztes klassisches Brett in Startaufstellung (aus
  den Besitzer-Kacheln + Klassikfiguren gebaut), sechs Freisteller
  (Koenig, Dame, Gambit, Amazone, Waechter, Bestie), drei Chronik-
  Blaetter mit CSS-Zugdiagrammen (Springer, der 2x2-Drache, der
  Waechter), vier Modus-Karten (Kampagne, Schnell, Online, Klassisch
  pur) und die Weltkarte gross in lila Kontur. Struktur-Daten
  (schema.org VideoGame), OG/Twitter-Karten, Hinweis-Banner zur lokalen
  Speicherung (einmalig, "Verstanden").
- DATENSCHUTZ (Stand 3. Aug 2026): neuer Absatz "Grobe Herkunft &
  Geraete-Fingerabdruck" - Land/Region/Stadt via Cloudflare, IP NUR als
  nicht rueckrechenbarer Hash, Zweck/Rechtsgrundlage (Art. 6 I f),
  Spielerbuch als zugangsgeschuetzter Verwaltungsbereich, Widerspruch
  und Loeschung geregelt.
- NUTZUNGSBEDINGUNGEN (Stand 3. Aug 2026): Virtuelle Inhalte ohne
  Geldwert, App-Store-Absatz (Google Play), Fairness-Regeln.
- ICONS RING-ZENTRIERT NEU aus dem freigestellten Emblem: die
  Sternzacke zog die Mitte hoch, der Goldring sass zu hoch - jetzt ist
  der RING-Aequator exakt die Bildmitte (belegt: 255/256 bzw. 15/16
  Pixel). Alle Groessen neu (16/32/180/192/512/maskable), favicon.ico
  und favicon.svg aus derselben Quelle - App-Icons und Favicon teilen
  jetzt EIN Motiv.
- index.html-Metadaten auf Stand (zwoelf Kapitel, 27 Helden,
  klassisches Schach benannt); Admin-Portal-Tuer "Landingpage" fuehrt
  jetzt wirklich auf /landing.html (zeigte zuvor auf die App).

## 0.73.1

FUENF GRIFFE AUS DEM SPIEL:

- POPUP-KOPF: der groessere Titel (v0.71.12) brachte Zeilenluft ueber
  sich - jetzt oben so knapp wie unten (Polster 9 statt 12, Titelzeile
  eng gefasst, Kopfzeile flex-start). Beide Panels.
- DER ERLEDIGT-HAKEN auf der Karte leuchtet LILA statt gruen (Bosse:
  violettes Siegel mit Schein, Stationen: heller Haken mit Riss-Licht) -
  klarer Kontrast auf dem anthrazitfarbenen Grund.
- DAS BRETT SPRINGT NICHT MEHR: beim Anwaehlen wuchs die grosse Figur
  kurz in die Kastenmessung hinein und das ganze Brett skalierte mit.
  Der Kasten misst jetzt fest (contain: layout size) - was waechst,
  waechst UEBER ihn hinaus statt ihn zu dehnen.
- DAS WORT "AUSRUESTUNG" ist fort; stattdessen trennt eine feine
  violette Linie den Fuss - nur noch die Karten stehen dort.
- DER TRANK-HINWEIS war ein nackter Schluessel (game.potionPick hatte
  NIE einen Text!) - jetzt steht dort: "Waehle die Figur, die den Trank
  trinken soll".

## 0.73.0

DAS SPIELERBUCH - WER SPIELT, WIE WEIT, WOHER:

- Neue Admin-Seite ?spielerbuch: LISTE ALLER ANGEMELDETEN SPIELER mit
  Fortschritt (Kapitel, Gold, Partien, Siege, Punkte), wer gerade online
  ist, wann er zuletzt da war, Suche ueber Name/Kennung/Land/Stadt.
- ZAHLEN ueber das Spiel im Ganzen: Spielerzahl, gerade online, aktiv in
  24 h und 7 Tagen, wie viele Fortschritt haben, Kapitel im Schnitt,
  Partien gesamt - dazu eine Laenderverteilung als Chips.
- HERKUNFT DATENSPARSAM: Land, Region und Stadt liefert Cloudflares
  Kantennetz beim Verbindungsaufbau; die IP wird NIE im Klartext
  gespeichert, sondern nur als kurzer, nicht rueckrechenbarer
  Fingerabdruck (Geraete zaehlen statt Personen verfolgen). Ein
  Merkzettel auf der Seite erinnert an die Datenschutzerklaerung.
- Halle: neuer Endpunkt /spielerbuch (nur mit Admin-Wort), Herkunft wird
  beim hello am Spieler vermerkt.
- ADMIN-PORTAL: zwei neue Tueren - Das Spielerbuch und Die Landingpage
  (oeffnet grandgambit.win in neuem Tab).
- WICHTIG: der Endpunkt lebt im Worker - das Buch bleibt leer, bis
  Manuel `cd worker && npx wrangler deploy` gefahren hat.

## 0.72.3

DER GROSSE DRACHE STEHT ENDLICH RICHTIG IM BLATT:

- Besitzer-Befund (ein alter Fehler): das Zugdiagramm zeigte den Drachen
  als EINZELNES Feld mit 3x3-Umfeld - er deckt aber 2x2 und schiebt
  diesen Block. Jetzt zeigt das Blatt einen GOLDENEN VIERERBLOCK und die
  Felder, die der geschobene Block neu betritt (Ausdehnung 4x4, Ecken
  bleiben frei, weil er nur orthogonal schiebt - genau wie die Engine
  rechnet).
- Auch sein FLUG stimmt jetzt: er landet auf JEDEM Feld im Umkreis
  seiner Schwinge (Reichweite 2, mit den Schwingen-Faehigkeiten 3), nicht
  nur ueber Achsen und Diagonalen.
- Zwei neue Pruefungen sichern das ab (812 statt 810 Zusicherungen):
  vier goldene Felder, acht Schrittfelder ausserhalb des Blocks.

## 0.72.2

DAS LAGER: SCHATZKAMMER UND HAENDLER UNTER EINEM DACH:

- Die vierte Menuetuer heisst jetzt LAGER (en: Stores) und traegt zwei
  Raeume: SCHATZKAMMER (Taten, Beutel) und HAENDLER (en: Trader) - die
  fruehere Ausruestung, die aus dem Hofstaat umgezogen ist. Im HOFSTAAT
  bleiben Hof und Aufstellung. Sondenbeleg: Menuewort "LAGER", beide
  Raeume erreichbar, der Haendler oeffnet mit seiner Warenkunde; im
  Hofstaat kein Ausruestungswort mehr.
- Der Haendler-Zweig bleibt fuer DIREKTAUFRUFE erhalten (Blattverweise
  aus Taten und Popups nutzen initialTab="gear") - er steht nur nicht
  mehr in der Hofstaat-Tableiste. (Der Testlauf hatte den Wegfall
  bemerkt: 4 Fehler, sofort geheilt, wieder 810/0/20.)

## 0.72.1

DIE WELTKARTE AUF VOLLE HOEHE, DIE KUGELN UNTER DEN WAECHTER:

- Besitzer-Fund "nur halbe Hoehe": mein Deckel war eine eigene Formel
  (min(100dvh-190px, 78vw)) - auf hohen Handys biss die 78-vw-Bremse.
  Die Weltkarte nutzt jetzt EXAKT dieselbe frameH-Rechnung wie die
  Kapitelkarte; die Breite folgt daraus (Querformat, nur seitlich
  scrollbar).
- POPUP: Angriffs- und Lebenskugel wandern UNTER die Figur (kleiner
  Abstand zum Sockel) - Ueberschrift und Fliesstext stehen dadurch
  sauber untereinander und gewinnen ihre Zeilenbreite zurueck.

## 0.72.0

EINE KUNST FUER ALLE, RISS-BLITZE AM LETZTEN ZUG, WELT UND POPUP GERADEGERUECKT:

- DER LEUCHTSTIL IST FORT (Besitzer: "man erkennt sie nicht mehr sauber"):
  ueberall - Brett, Kampfleiste, Popup - stehen DIESELBEN Figuren wie die
  eigenen. Option, Modul und 57 Glow-Bilder entfernt (Buendel ~3,6 MB
  schlanker).
- ALLE FIGUREN HELLER UND KONTRASTREICHER: eigene brightness 1,10 /
  contrast 1,10, die Gegenseite dieselbe Kunst nur eine Spur dunkler
  (0,94 / 1,12). Die Zugehoerigkeit tragen weiterhin Goldschein und
  Riss-Violett.
- DER RISS ZUCKT: die Figur, die ZULETZT GEZOGEN hat, bekommt einen
  Blitz - ein greller weiss-violetter Schlag, ein zweites Zucken, dann
  langes Ausglimmen (2,6 s, einmalig). Gegner violett, eigene golden.
  Nur diese eine Figur, und bei offenem Dialog ruht sie.
- DIE LEUCHTENDE LILA KONTUR ist zurueck - um die Kapitelkarte UND um
  die Weltkarte (v0.71.7 hatte sie mit dem Nebelschein zusammen
  erschlagen).
- WELTKARTE: scrollt NUR noch quer (vertikal gesperrt), steht in
  derselben Groesse und Kontur wie die Kapitelkarte, Ueberschrift und
  Untertitel sind fort.
- POPUP: die Portraetbox wird wieder SCHMAL (bis 132 statt 196 px) - der
  Waechter wird stattdessen durch ZUSCHNITT gross (1,42-fach hinein-
  gezoomt, ueberstehendes gekappt). Der Text behaelt seine Spalte.
- Die Pfeilzeichen hinter den Menue-Knoepfen sind fort.

## 0.71.13

AUCH DIE KUGELN DUCKEN SICH UNTER DEN DIALOG:

- Besitzer-Fund: v0.71.1 hatte nur das Popup ueber die grosse Auswahl-
  Figur gehoben - deren WERTKUGELN standen aber auf einer eigenen,
  hoeheren Ebene und ragten weiter darueber.
- Jetzt kennt das Brett einen RUHIG-Zustand: steht ein Dialog offen
  (Aufgeben oder Sieg/Niederlage), faellt die Auswahl KOMPLETT in ihre
  Reihe zurueck - Figur und Kugeln gemeinsam. Messbeleg: bei offenem
  Popup existiert keine erhobene Ebene (40/41) mehr.

## 0.71.12

KUGELN UNTER DER FIGUR, GROSSER WAECHTER, WELTKARTE GEHEILT, STIL GILT GLOBAL:

- KAMPFLEISTE: die HP/Angriffs-Kugeln stehen jetzt wie auf dem Brett
  DIREKT UNTER der freigestellten Figur - im Massstab der grossen Figur
  (24 px); Name und Stufe stehen winzig darueber, der alte Kopf-Block
  oben links ist fort.
- POPUP: das Boss-Portraet fuellt seine Box (bis 196 px statt 148) und
  der Titel steht SCHWARZ und groesser. Bosse stehen auch AUF DEM BRETT
  groesser (1,14em - der Waechter war kaum zu erkennen; Asset-Messung
  zeigte: nicht das Bild war klein, die Buehne).
- WELTKARTE GEHEILT: v0.71.9 hatte sie mit zIndex 5 HINTER die
  Kapitelkarte gelegt ("sehe gar nichts") - jetzt Ebene 8 (ueber der
  Karte, unter dem Dock). Neu nach Besitzer-Wunsch: das Querbild klebt
  oben/unten/links an der Box in VOLLER HOEHE und wird nach RECHTS
  gescrollt, je mehr Welt sich oeffnet.
- DER BRETTSTIL GILT GLOBAL: steht das Profil auf Leuchtend, tragen
  auch das Popup-Portraet und die Gegnerfigur in der Kampfleiste die
  Leuchtkonturen; erst ein GOLDENER (angeworbener) Boss verliert sie.

## 0.71.11

DIE AUSRUESTUNG IN GLEICHEN QUADRATEN:

- Besitzer-Wunsch: die Knoepfe unten waren ungleich gross und trugen
  die Zahl daneben. Jetzt kommen alle drei (Trank, Zeitriss,
  Zeitenwender) aus DERSELBEN kasten()-Fabrik: exakt 52x56 px,
  annaehernd quadratisch, SCHWARZER Grund, LILA Kontur, das Icon gross
  und perfekt mittig, die ZAHL DARUNTER. Aktivierte Knoepfe (Trank
  scharf, Zeitriss gespannt) fuellen sich leicht violett mit Schein;
  der gespannte Zeitriss zeigt ein Haekchen statt der Zahl.

## 0.71.10

DER STARTKNOPF IST IMMER GOLDEN, DER FLIESSTEXT SCHWARZ:

- Besitzer-Fund "warum ploetzlich lila?": eine alte Regel faerbte den
  Startknopf violett, wenn an der Station ein pures Risswesen wartet -
  und verriet damit obendrein Geheimnis-Stationen. Der Zweig ist fort:
  der Knopf traegt IMMER Gold.
- Der kursive Fliesstext im Stations-Popup steht jetzt SCHWARZ
  (#171310 statt des blassen Graugolds #6f6752) - sauber lesbar auf dem
  hellen Pergamentgrund.

## 0.71.9

NAME UEBER DER FIGUR, SCHWARZER KARTENHIMMEL, DIE WELT IM KAPITELKLEID:

- Der Figurenname steht jetzt MITTIG UEBER der freigestellten Figur in
  der Kampfleiste (winzig, besondere Schrift, keine Pille); die kleinen
  Kugeln bleiben oben links.
- Der LILA SCHWEIF am Himmel der Kapitelkarte (violetter Radialverlauf)
  ist ersatzlos fort - einfach schwarz, wie gewuenscht.
- DIE WELTKARTE steht wie die Kapitelkarte: volle Breite, DIESELBE
  ruhige Kontur (dunkle Linie, gleicher Grund, gleiche Tiefe), und das
  Overlay liegt jetzt UNTER dem Menue-Dock (zIndex 5 statt 30) - die
  Menueleiste bleibt sichtbar.

## 0.71.8

DIE SCHWEBENDE PILL FAELLT - DIE LEISTE DIENT BEIDEN SEITEN:

- Das schwebende Namens-/Dossier-Schild ueber dem Brett ist FORT (es
  wurde von den Figuren verdeckt). Die Auskunft wohnt jetzt fuer BEIDE
  Seiten in der Kampfleiste: fremde Figuren erscheinen dort mit ihrer
  dunklen freigestellten Kunst und der NEBELREGEL - ein Talent bleibt
  "???" (mit eigener Nebel-Beschreibung), bis die Figur es im Gefecht
  gezeigt hat. Damit ist auch die Audit-Luecke der unsichtbaren
  Gegner-Talente geschlossen.
- Die freigestellte Figur waechst auf 108 px (Besitzer: "duerfen noch
  ein bisschen groesser"), und der KOPFZEILEN-BALKEN ist fort: der Name
  steht WINZIG in der besonderen Schrift oben links (absolut, kein
  Platzverbrauch, keine Pille), die Kugeln klein daneben.

## 0.71.7

SCHIMMER-DETEKTIVARBEIT UND DIE FREIE LEISTE:

- DER LILA "SCHIMMER" UM DIE KARTE war die violette RANDLINIE
  (rgba(167,139,250,.55)) - sie steht jetzt dunkel (rgba(22,18,34,.9)).
- DER GEKOEPFTE FIGUREN-SCHIMMER: das ruhende Zoom-Sichtfenster
  (overflow hidden, seit dem Fall der Lupe ohne Amt) endete 2 px ueber
  der Kopfzone der obersten Reihe und schnitt Schein und Koepfe. Es
  steht jetzt offen (hidden nur im - stummen - Zoom-Modus). Messbeleg:
  der enge Clipper (81-512 px) ist aus der Vorfahrenkette verschwunden.
- DIE KAMPFLEISTE STEHT FREI (Besitzer): keine Panel-Kachel mehr -
  links die gewaehlte Figur FREIGESTELLT (88 px, nur Schlagschatten),
  daneben Kopfzeile und die Faehigkeiten als freie Karten-Knoepfe.
  Auch die AUSRUESTUNG verliert ihre Kapsel: freie Knoepfe mit kleinem
  Wort. Sondenbeleg: Panelgrund fort, freigestellte Figur erscheint.

## 0.71.6

VOLLE BREITE, DER GOLDRAHMEN FAELLT BEI DEN BESITZER-FELDERN:

- Der Breiten-Sicherheitsteiler faellt GANZ (1,0 statt 1,018) und der
  Block-Hoehendeckel steigt auf 110 vw, damit die Kopf-Reserve der
  Grundreihe nicht laenger die Brettbreite frisst. Messbeleg: Brett
  376 px auf dem 390er-Schirm - nur der hauchduenne Schwarzsaum bleibt.
- Bei den Besitzer-Feldern FAELLT der Goldrahmen ganz: die Kacheln
  tragen ihren eigenen Rand, mehr braucht es nicht. (Marmor-Bretter
  ohne Besitzer-Felder behalten ihren Rahmen.) Damit verschwindet auch
  die zuletzt verdeckte Rahmenleiste am unteren Rand.

## 0.71.5

DAS GESAMTE BRETT WAECHST:

- Besitzer-Klarstellung: nicht die Kacheln, das GANZE Brett soll
  groesser. Zwei Schrauben: der Sicherheitsteiler der Breite schrumpft
  (1,018 statt 1,052, ~+3,3 %) und der Hoehen-Vorhalt wird schlanker
  (0,78 statt 1,25 Zellen Luft - die Grundreihen-Koepfe ragen weiter
  frei in den Himmel, overflow bleibt sichtbar). Messbeleg: Brett
  352 px auf dem 390er-Schirm, Raender weiterhin exakt 0.

## 0.71.4

VERSATZ GEHEILT, VERLAUFS-SCHWEIF, GANZE KACHEL ZURUECK, RAHMEN OHNE UEBERLAPPUNG:

- ANIMATIONS-VERSATZ + SCHWARZER STREIFEN rechts/unten: beides EIN
  Fehler von mir - bei gap 0 unter den Besitzer-Feldern rechneten
  Kastenmasse (bw/bh) weiter mit Fuge: der Rahmenkasten war 14 px zu
  gross (schwarzer Rest) und die Zug-Animation lief auf falschen
  Prozentkoordinaten. Jetzt teilt EIN effektiver Gap Layout, Kasten und
  Animation. Messbeleg: rechtsRest 0 px, untenRest 0 px.
- DER SCHWEIF ist kein Kreis-Punktezug mehr, sondern ein WEICHER
  VERLAUF: zwei Strahlen mit runden Kappen (breit zart + fein hell),
  beide von durchsichtig am Start zu Gold am Ziel.
- GANZE KACHEL ZURUECK (200 %, 0/100 %): der Eigenrand der Besitzer-
  Kacheln ist ihm wichtig und bleibt KOMPLETT sichtbar - der 215-%-Zoom
  aus v0.71.3 ist zurueckgenommen.
- DER GOLDRAHMEN rueckt bei Besitzer-Feldern GANZ nach aussen (-5,6 %):
  keine Leiste ueberlappt die Kacheln.

## 0.71.3

DIE KACHELN EINEN SCHRITT GROESSER:

- Besitzer: "schon besser, aber kann noch etwas groesser werden" - die
  Felder zoomen sanft in die Kachel (215 % statt 200 %, mittig auf der
  jeweiligen Haelfte verankert): der Stein fuellt mehr, der Eigenrand
  der Kachel bleibt als feine Kante. Sonde unveraendert sauber (64
  Zellen, zwei Positionen, Fuge 0).

## 0.71.2

GANZE KACHELN JE FELD, BODEN ENTLASTET, KOENIGE IN DER ONLINE-KACHEL:

- Besitzer-Korrektur: die Zellen zoomten per Hash-Fenster in die Kacheln
  hinein (~38-%-Ausschnitt, "wie beschnitten"). Jetzt zeigt JEDES FELD
  SEINE GANZE KACHEL: helle Haelfte links (0 %), dunkle rechts (100 %),
  senkrecht mittig, keine Fenster mehr. Sondenbeleg: 64 Zellen, exakt
  ZWEI Positionen. Die Finale-Kachel deckt als Ganzbild.
- Der GEMALTE BODEN wird nicht mehr unsichtbar unter den Besitzer-
  Feldern geladen und gemalt - er faellt ganz, wenn Felder anliegen.
- Die ONLINE-KACHEL traegt das neue Koenigsmotiv des Besitzers (zwei
  Koenige am Riss im Lichtschacht), Leuchtkern-Zuschnitt wie bei der
  Akademie.

## 0.71.1

KLASSIK-FEINSCHLIFF UND VIER GRIFFE:

- KLASSISCHE FIGUREN einen Hauch kleiner (0,9em statt 1,0em - Besitzer:
  "noch etwas zu gross").
- GOLDRAHMEN RUECKT NACH AUSSEN, sobald Koordinaten am Brett stehen
  (-4,8 % statt -2,6 %): Buchstaben und Zahlen sind frei - und sie
  stehen jetzt in GLAENZENDEM GOLD (warmer Schimmer + Bodenschatten).
- FEHLER BEHOBEN: die gross gestellte Auswahl-Figur lag UEBER dem
  Aufgeben-Popup. Popup jetzt auf Ebene 200, Auswahl auf 40/41 -
  Sondenbeleg per elementFromPoint: der Punkt ueber der Figur gehoert
  dem Popup.
- DAS EMBLEM OBEN LINKS fuehrt jetzt per Tipp ins SPIELEN-Menue (beide
  Zweige).
- DER HALLEN-STAND wohnt RECHTS OBEN in der Online-Kachel und leuchtet
  bei Verbindung LILA (violetter Punkt mit Schein) statt gruen; offline
  bleibt grau.

## 0.71.0

DAS LETZTE TALENT BLEIBT SICHTBAR, FELDER OHNE FUGEN, KARTE OHNE SCHEIN:

- DAS LETZTE TALENT: wie der letzte Zug bleibt jetzt sichtbar, ob und
  welches Talent zuletzt verbraucht wurde - von dir (gruenlich) oder vom
  Gegner (roetlich), als schmaler violetter Chip ueber der Kampfleiste.
  Traeger ist das neue additive Feld lastMove.consumed im Kern (drei
  Stellen, ueberlebt Speichern/Fortsetzen, da der Codec lastMove ganz
  durchreicht). Beweis: Gegner-Teleport landet als consumed:"teleport".
- FELDER OHNE AUFGELEGTEN RAND: bei Besitzer-Kacheln fallen die
  Gitterfugen (gap 0) und die 1-px-Haarlinie des Bretts - die Kacheln
  bringen ihren eigenen Rand mit; nur der Goldrahmen bleibt. Messbeleg:
  Fuge zwischen Nachbarzellen exakt 0 px.
- DER LILA SCHEIN um die Kampagnenkarte ist fort (nur der schwarze
  Tiefenschatten bleibt); Bundle-Beleg: Schein-Signatur nicht mehr im
  Buendel.

## 0.70.3

ZWEI PILLEN WENIGER IM GEFECHT:

- Die Stationsnamen-Pille ("Alte Wacht") und die "Du"-Pille sind
  gestrichen (Besitzer: "kannst du dir sparen") - die Kampagnenkarte
  nennt die Station laengst, und wem die untere Reihe gehoert, ist
  offensichtlich. Der Hotseat behaelt seine Pille, denn dort traegt sie
  die Zugfarbe (Weiss/Schwarz am selben Geraet). Sondenbeleg: beide
  Texte im Gefecht verschwunden.

## 0.70.2

LEUCHTEND v3 - BRETTFESTE GLUTLINIEN:

- Besitzer-Befund: im Spiel wirkten die Gegner-Konturen "komplett weg".
  Wahrer Taeter war die SKALIERUNG: 640-px-Quellen stehen am Brett mit
  ~52 px - die 3-px-Linien schrumpften auf 0,3 px und fielen unter die
  Wahrnehmungsschwelle (Werkstatt und Bildprogramm zeigen Vollbild,
  darum leuchtete es dort).
- Rezept v3: vier Verdickungen statt zwei, Helligkeit x1,6 und ein
  LEUCHT-HALO (weichgezeichnete Kanten x1,7 unter den Linien), der die
  Verkleinerung ueberlebt. MESSBELEG IN BRETTGROESSE (52 px): Turm-
  Mittel 121, Max 255, 87 % der sichtbaren Pixel ueber Schwelle 60 -
  vorher praktisch schwarz.

## 0.70.1

LEUCHTEND v2 - NUR DIE GEGENSEITE GLUEHT:

- Besitzer-Korrektur: beide Seiten leuchtend war Quatsch. Jetzt gluehen
  NUR die Gegner (heller: Faktor x1,4, und breiter: Kantenbreite 3 statt
  2), die EIGENEN Figuren bleiben im Leuchtend-Stil die Geschnitzten -
  Lagerlesbarkeit pur: warme Schnitzerei gegen violette Glutlinien.
- Die hellen Leucht-Dateien sind entfernt (57 statt 114, Buendel um
  3,2 MB schlanker); die Tausch-Karte greift nur auf den dunklen
  Saetzen, alles andere faellt auf Geschnitzt zurueck. Sondenbeleg:
  16 Gegner-Glow, 16 eigene Geschnitzte, 0 eigene Glow.

## 0.70.0

DER LEUCHTENDE STIL - DAS WERKSTATT-REZEPT WIRD SPIELBAR:

- NEUER WAEHLBARER BRETTSTIL "LEUCHTEND" (Profil -> Brettfiguren, dritte
  Option neben Detailreich und Simpel): alle 114 Figuren - Hof, Helden-
  stufen, Bosse, beide Seiten - als Leuchtkonturen nach dem exakten
  Besitzer-Rezept aus der Werkstatt (Kantenbreite 2 - Kantenhelligkeit
  20 - Glaettung 2), lokal aus den Geschnitzten gerechnet mit demselben
  Algorithmus wie der Werkstatt-Regler.
- Die Zuordnung laeuft als Tausch-Karte ueber die Geschnitzt-Logik: Bosse,
  Hofstaats-Bosse (pb_) und Gambit-Stufen erben automatisch. Klassische
  Partien behalten den Klassik-Satz. Sondenbeleg: Profil auf Leuchtend,
  Schnellspiel gestartet - 32 Glow-Bilder auf dem Brett.
- Boot-Harness mit Heap-Vorspann (4 GB): der Einzelbau traegt jetzt
  >60 MB eingebettete Kunst; jsdom starb ohne Vorspann an
  "Ineffective mark-compacts". Der Lauf spannt sich selbst neu auf.

## 0.69.1

ZURUECK UND AUFGEBEN IM EXAKTEN ANPASSEN-GEWAND:

- Die beiden Gefechts-Pillen tragen jetzt BUCHSTAEBLICH den Stil des
  Anpassen-Knopfs der Schnellspiel-Kachel: voller selLine-Rand, selInk-
  Schrift, Verlauf T.sel -> #1a1030 (165 Grad) und der selGlow-Schein.
  Sondenbeleg: identischer Verlaufsstring am Zurueck-Knopf.

## 0.69.0

DAS LILA GEFECHTSKLEID - DAS SPIEL SPRICHT DIE MENUESPRACHE:

- ALLE Bedienelemente um das Brett tragen jetzt das Auswahl-Violett des
  Menues: die Pillen (Zurueck, Aufgeben) stehen auf lila Verlauf mit
  Goldschrift und selLine-Kante, alle sieben Chips der Kopf- und
  Fusszeile (Stationsname wie "Alte Wacht", Gegner, Uhr, Zugstatus)
  wechseln von Panel-Grau auf T.sel, und auch Trank-, Zeitriss- und
  Zeitenwender-Knoepfe stehen auf Violett.
- DIE AUSRUESTUNG ZIEHT GANZ NACH UNTEN: Trank, Zeitriss und
  Zeitenwender sind figurunabhaengige Gegenstaende und haben jetzt ihre
  eigene beschriftete Lila-Zeile ("AUSRUESTUNG") UNTER der Kampfleiste,
  am Fuss des Gefechts - in beiden Layout-Zweigen, ausserhalb der
  tight-Modus-Messung. Sondenbeleg: Zeile sitzt 6 px unter der Leiste.
- Die KAMPFLEISTE selbst und ihre Beschreibungskarte tragen denselben
  violetten Grund mit selLine-Kante.

## 0.68.0

DIE AKADEMIE IST EINE ECHTE KARTE - "GENAU, GENAU GLEICH":

- Kein Sonder-Knopf mehr: die Akademie nutzt jetzt DIESELBE Card wie
  Kampagne, Schnellspiel und Online-Duell - lila Flaeche mit Goldkante,
  Titel und Untertitel LINKS in derselben Schrift (Sondenbeleg: Titel
  15 px / 0,6 px Sperrung identisch mit der Kampagne, gleiche Kante,
  gleicher Grundtyp), das Buchmotiv rechts in voller Hoehe hinter dem
  Schleier.
- Der Text ist kuerzer ("Regeln, Figuren & Chronik") und der Absprung ein
  ruhiger Pfeil-CTA ("Jetzt lernen") - bewusst KEIN Gold-Glanzknopf: die
  Akademie bleibt sekundaer, in der Anpassen-Klasse, wie vom Besitzer
  angedacht.

## 0.67.2

DIE AKADEMIE-KACHEL BEKOMMT IHRE BUEHNE:

- Besitzer-Nachfrage "Was ist mit dem Bild bei Akademie?" - Befund: das
  Bild WAR verdrahtet, aber unsichtbar klein: der Akademie-Knopf mass nur
  79 px Hoehe (Geschwister 145+), und der erste Zuschnitt trug den
  dunklen Leerraum ueber dem Buch mit - vom Nachtmotiv blieb ein
  schwarzer Splitter.
- Heilung: engster BUCH-ZUSCHNITT ueber die Leuchtkern-BBox (nur Buch und
  Figuren, der matte Lichtstrahl faellt raus) und KACHELMASS fuer die
  Akademie (minHeight 132 statt 79, gemessen wie die Geschwister). Sonde:
  Bild sitzt rechts in voller Hoehe, Kachel 132 px.

## 0.67.1

DIE FELDER STEHEN ROH, KANTE AN KANTE:

- Besitzer-Wunsch: alle Schattierungen und Effekte ZWISCHEN den Kacheln
  sind fort, sobald seine Felder anliegen - kein Schleier, keine Fase,
  keine Fugenlinie. Die Rohdaten stehen Kante an Kante, genau wie
  geliefert; nur Freundschaftskaempfe dimmen weiter leicht. Der Goldrahmen
  bleibt. Sondenbeleg: eine Felder-Zelle traegt genau EINE Ebene - den
  Streifen, ohne boxShadow, ohne Verlauf.

## 0.67.0

DER NEUE HETZER UND DIE LEUCHTENDEN KONTUREN:

- DER HETZER (b02), vom Besitzer neu gezeichnet, ist eingebaut: aufs
  Familienmass gebracht (Sockel exakt 307 px, Hoehe 356 statt vormals 279
  - er steht endlich wie seine Brueder), Schattenzwilling frisch via
  verdorben-v2 (Torwaechter sauber). Der Upload kam bereits freigestellt
  und wurde ROH uebernommen (Alpha gemessen, Lehre aus v0.63.1).
- LEUCHTENDE KONTUREN in der Figurenwerkstatt, nach Bildprogramm-Vorbild
  und mit denselben drei Reglern: KANTENBREITE (Max-Filter verdickt),
  KANTENHELLIGKEIT (skaliert das Gluehen), GLAETTUNG (Kastenweichzeichner
  vor der Sobel-Kantensuche). Alles Flache faellt ins Schwarze, die
  Kanten gluehen in der Farbe der Figur; das Alpha bleibt unangetastet.
  Wird je Figur gespeichert und wandert wie alles in Zip-Export und
  GitHub-Ladung. Sondenbeleg: Mittel-Helligkeit 101 -> 18 bei stehendem
  Maximum 207.

## 0.66.0

DIE FELDER DES BESITZERS AUF JEDEM BRETT, AKADEMIE-KACHEL, RISS NACH KAPITEL:

- FELDERBRETT: fuer jedes Kapitel (1-12) ein eigenes Felderpaar aus den
  Streifenbildern des Besitzers (links hell, rechts dunkel) - jede Zelle
  schneidet sich ihr Fenster zur Laufzeit per Hash aus der richtigen
  Haelfte (Marmor-Prinzip ohne 190 Einzeldateien; Sondenbeleg: 64 Zellen,
  64 verschiedene Fenster). Seine Kacheln SIND die Felder und siegen auch
  ueber dem gemalten Boden. KLASSISCHE Partien wechseln je Partie durch
  drei Streifen; der ENDBOSS des letzten Kapitels traegt die Blitz-Kachel
  auf den dunklen Feldern.
- RAHMEN: nur noch der aeussere Rand (die innere Haarlinie ist fort - der
  Doppelrahmen war zuviel) und das Gold deutlich dunkler (#caa45c/#9a7430/
  #5c3d10 statt der hellen Toene).
- AKADEMIE-KACHEL: das neue Motiv des Besitzers (Schachbuch im Dunkel) im
  selben Kartenkleid wie alle Kacheln - schwarzer Grund, Motiv rechts in
  voller Hoehe, Schleier von links bis 94 %, keine harte Kante.
- RISSBODEN NACH KAPITEL: die alte Mischformel (Hofwert+Weganteil) blieb
  selbst im letzten Kapitel bei Bild 3 haengen (Werkbank-Befund des
  Besitzers) - jetzt zaehlt schlicht das Kapitel: 1 -> Bild 1 ... 10+ ->
  Bild 10.

## 0.65.0

DIE GROSSE KARTEN-WARTUNG (sieben Besitzer-Punkte; ein verwaister
Arbeitsstand einer frueheren Sitzung wurde analysiert, glattgezogen und
zu Ende gebracht):

- ROTE KAPITEL-SCHRIFT FORT: der karmesinrote "KAPITEL X"-Schriftzug und
  die Kapitel-Banner auf den Karten sind entfernt (Sondenbeleg: kein
  KAPITEL-Text mehr auf der Karte; das goldene "WELTKARTE" im Atlas
  bleibt).
- WOLKEN NUR AM HIMMEL DES BILDES: die Wolkenschicht blendet mit der
  Kameranaehe zum oberen Kartenrand ein und erlischt ganz, wenn man
  unten unterwegs ist (gemessen 0,88 beim Einflug oben).
- DER GAMBIT REIST IMMER MIT: beim Durchblaettern der Kapitel steht der
  Wanderer auf Station 1 des betrachteten Bodens statt zu verschwinden.
- KONTUR OBEN WIE UNTEN: der getoente Verlauf am Oberrand und der
  gespiegelte Blur-Streifen (der "seltsame Rand") sind fort - der Rahmen
  traegt ringsum dasselbe ruhige Dunkel.
- DESKTOP-POPUP IN VOLLER GROESSE: ab 760 px Rahmenbreite steht das
  Stations-Panel 400 px breit rechts unten (gemessen) und weicht nach
  links aus, wenn es den Gambit deckte - keine geschrumpften,
  umbrechenden Schriften mehr.
- KUGEL-ZIFFERN IM POPUP: eine Stufe kleiner gesetzt (num 0,52 statt
  0,58, Kugel 28) - die Zahl sitzt ruhig mittig.
- WELTKARTE OEFFNET WEITER: jedes Kapitel zeigt deutlich mehr Welt
  (Radius 36/27+ statt 26/15) - voll erspielt bleibt nur noch ein leiser
  schwarzer Saum am Aussenrand.

## 0.64.1

DER RISSBODEN AUF DESKTOP GEZAEHMT - 1280er-BAND MIT RANDVERLAEUFEN:

- Besitzer-Fund: auf Desktop skalierten die Menue-Boeden "voellig falsch,
  viel zu gross". Zwei Taeter: cover auf voller Fensterbreite UND der
  Desktop-Shell-Zoom (#root zoom 1,15/1,3 ab 1440/1760 px), der jedes
  Layout-Pixel multipliziert.
- Heilung: der Boden ist jetzt ein ZENTRIERTES BAND von sichtbar
  hoechstens 1280 px (Gegenrechnung ueber die --vhz-Variable neutralisiert
  den Shell-Zoom), und links wie rechts laeuft das Bild in einem WEICHEN
  VERLAUF INS SCHWARZE aus (Quermaske schneidet sich mit dem bestehenden
  Hoch-Verlauf, mask-composite intersect).
- Messbeleg am 1680er-Fenster: Bandbreite exakt 1280 px, zentriert,
  Querverlauf aktiv.

## 0.64.0

DIE KAMPFLEISTE NACH DER VORLAGE DES BESITZERS, DIE LUPE FAELLT:

- DIE LUPE IST FORT: der Nahansicht-Knopf im Gefecht verschwindet (das
  Feldglas ruht, die Maschinerie bleibt stumm im Code).
- KARTEN-SCHALTFLAECHEN statt nackter Bubbles, nach der Bildvorlage:
  schmale violette Kartenrahmen, darin der bewaehrte Goldring, darunter
  der Name in Kapitaelchen. Sonderzuege (Rochade, En passant) stehen
  gruen markiert voran. Die Reihe scrollt seitlich, wenn mehr Karten da
  sind, als der Schirm traegt.
- KEIN GROSS-PORTRAET mehr in der Leiste: die gewaehlte Figur steht ja
  bereits gross markiert auf dem Brett - die Leiste gehoert jetzt ganz
  den Faehigkeiten (schlanke Kopfzeile: Name, Stufe, Kugeln).
- DIE NAECHSTE GESPERRTE FAEHIGKEIT erscheint als Schloss-Karte mit
  ihrer Stufe (immer nur EINE, wie gewuenscht); ihre Beschreibung nennt
  den Weg: freischaltbar im Hofstaat ab Lv X. Sondenbeleg: Level-1-Bauer
  zeigt genau die Schloss-Karte "Sturmschritt Lv 3".
- Die Ausruestung (Trank, Zeitriss, Sanduhr) bleibt figurunabhaengig in
  ihrer Legende darunter - immer da, wie es der Besitzer beschrieb.

## 0.63.1

KLASSISCHE FIGUREN: DIE ORIGINALE DES BESITZERS, UNANGETASTET:

- Besitzer-Fund, doppelt berechtigt: seine zwoelf Klassik-Figuren waren
  BEREITS sauber freigestellt (RGBA, Ecken-Alpha 0, gemessen) - die
  zusaetzliche "Freistellung" von v0.54/0.62 war ueberfluessig und hat
  in den fertigen Bildern geschnitten (u. a. deckende Ecken am hellen
  Bauern belegt).
- Heilung: alle zwoelf ROH neu eingebettet - nur Alpha-Zuschnitt,
  Einpassen auf 640x800, Bodenanker. NULL Pixel-Aenderung an Farbe oder
  Alpha. Beweis: alle Ecken wieder transparent.
- Das Zwischenlager assets/klassisch/ (verarbeitete Zweitkopien) ist
  entfernt; eingebaut ist allein assets/klassik/.

## 0.63.0

DIE WERKSTATT BEKOMMT DIE ORIGINALE ZURUECK, DEN STEMPEL UND DAS BRETT:

- DIE ORIGINALE SIND WIEDER DIE BASIS: v0.53 hatte das v5-Rezept FEST in
  die 57 dunklen Dateien eingebrannt - "Zuruecksetzen" konnte darum nie
  das Original zeigen (Besitzer-Fund, und er hatte recht). Jetzt sind
  alle 57 unbearbeiteten Gegenseiten restauriert (51 aus dem Git-Verlauf,
  die 6 Gambit-Schatten frisch roh gerechnet, Torwaechter sauber).
  ZURUECKSETZEN = ORIGINAL; das v5-Rezept bleibt als Startwerte-Knopf je
  Figur waehlbar. Das Spiel zeigt damit wieder die Originale, bis der
  Besitzer seine eigene Fassung laedt.
- DER STEMPEL (wie im Bildprogramm): erster Tipp oder Alt+Klick setzt die
  QUELLE (gruener Fadenkreuz-Marker), danach malt jeder Zug eine Kopie
  der Komposition an die Zielstelle - die Quelle wandert klassisch mit
  dem Strichversatz. Groesse und Haerte gelten wie beim Pinsel;
  Rueckgaengig deckt ihn ab. Pixelbeweis: Zielstelle traegt nach dem
  Stempeln das kopierte Figurenmaterial.
- SCHACHBRETT-MUSTER einblendbar (Knopf ♟): ein 320er-Felderteppich fest
  im Rahmen, das Feld der Figur golden umrandet - man sieht, wie die
  Figur auf ihrem Feld sitzt, und Raster wie Brett stehen FEST, waehrend
  die Figur sich relativ dazu bewegt.

## 0.62.0

DER KLASSISCHE SATZ DES BESITZERS IST KOMPLETT AM BRETT, MENUES LOESEN
SICH AN DER LEISTE AUF:

- KLASSISCH IN MARMOR UND NACHTBLAU: alle zwoelf Figuren des Besitzers
  (hell: Elfenbein-Marmor mit Goldringen · dunkel: Nachtblau mit Tuerkis-
  ringen) freigestellt, bodenverankert und als klassischer Brettsatz
  verdrahtet - sie ERSETZEN den schmucklosen Creme/Grau-Satz aus v0.40 in
  assets/klassik/ (null Code-Aenderung noetig, das Klassik-System stand).
  Byte-Beweis: die neuen Dateien liegen im Build.
- AUFLOESUNG AN DER MENUELEISTE (Besitzer): in ALLEN Menues - besonders
  der Schatzkammer - blendet der Scrollinhalt jetzt in einem kurzen Band
  ueber dem Dock aus und ist an dessen Oberkante 100 % TRANSPARENT;
  nichts schimmert mehr halb hinter der Leiste. Maske in BEIDEN
  Layout-Zweigen, im Kampf und in der Kartenwelt aus. Sondenbeleg: Maske
  aktiv in Hub und Schatzkammer, Endstop voll transparent.

## 0.61.0

AUFGEBEN MIT WUERDE - ECHTES POPUP, KLARE WORTE, KEIN STILLER ABGANG:

- Der Mini-Pillen-Dialog (winzige Haken/Kreuz-Ziele) ist Geschichte:
  Aufgeben oeffnet jetzt ein ECHTES POPUP mit ordentlichen Schaltflaechen
  ("Weiterspielen" / roter "Aufgeben"-Knopf, gemessen 147x40 px).
- KLARE WORTE ueber die Folgen: online warnt der Dialog unmissverstaend-
  lich, dass die Partie fuer beide Seiten endgueltig endet und der Gegner
  den Sieg erhaelt; in der klassischen Partie steht ebenso deutlich, dass
  sie sofort endet und als Niederlage zaehlt.
- KEIN "ZURUECK" in Online-Partien mit Uhr: wer die Schnellpartie mit
  Zeit angenommen hat, laeuft nicht einfach vom Tisch - der einzige Weg
  hinaus ist das ehrliche Aufgeben.
- Sondenbeweis: Dialog erscheint, Klassik-Hinweis sitzt, "Weiterspielen"
  schliesst ohne Nebenwirkung.

## 0.60.0

PROFIL NICHT MEHR BREITER, DER RISSBODEN GEZAEHMT:

- BREITEN-FUND (Besitzer): unterm Admin war das Profil breiter als alle
  anderen Reiter. Taeter: die Kapitel-Schnellwahl des Admin-Werkzeugs -
  zehn Knoepfe in einer NICHT umbrechenden Flex-Zeile sprengten am Handy
  die Kachelbreite. Jetzt bricht die Reihe um; alle Reiter messen gleich.
- RISSBODEN (der Transparenz-Streifen unten, der Effekt bleibt!):
  (1) beginnt viel weiter unten - Hoehe min(30vh, 270px) statt
  min(58vh, 520px), am Referenzgeraet 253 statt ~490 px;
  (2) schimmert dezenter - Deckkraft 0,6 statt 0,85;
  (3) wird schneller deckend - Maske rgba(.55) bei 30 % -> voll bei 58 %
  (vorher .45/26 % -> 62 %).
- MEHR SCROLLWEG in BEIDEN Zweigen: Scroll-Polster um die Bodenhoehe
  erweitert (min(30vh, 270px) Reserve) - das Unterste laesst sich UEBER
  den Streifen scrollen und bleibt lesbar. Messbeleg: Polster 361 px,
  178 px Ueberhang schon im leeren Hub.

## 0.59.0

HUB-KACHELN AUF ECHTEM SCHWARZ, FUGENLOSE BILDER, STATUS AUS DEM MOTIV:

- Kachelgrund von #0a0910 auf ECHTES SCHWARZ (#000) - die nachtschwarzen
  Story-Bilder sinken fugenlos ein.
- Besitzer-Fund einer sichtbaren NAHT: der linke Schleier endete bei 72 %,
  die linke Bildkante beginnt aber je nach Seitenverhaeltnis erst bei
  ~75-85 % der Kachelbreite. Der Verlauf laeuft jetzt sanft bis 94 %
  (0,92 -> 0,55 -> 0,24 -> 0) und legt sich ueber jede Bildkante.
  Messbeleg: Grund rgb(0,0,0), Verlaufsende 94 %.
- Kampagnen-Kachel: "Naechster Halt" stand hinten ins Motiv hinein - jetzt
  eigene Zeile mit rechtem Polster in Bildbreite (min(30 %, 130 px)),
  gemessen 131 px frei bis zur Kachelkante.

## 0.58.0

WERKSTATT: RASTER MIT SOLL-MASS, FIGUR VERSCHIEBEN UND SKALIEREN, LADE-HEILUNG:

- RASTER (Knopf, an/aus): 40er-Netz, Mittelachse, Bodenlinie und das gruene
  SOLL-SOCKEL-BAND (303 px) mit Beschriftung - zoomt mit der Ansicht mit.
  Dazu das MASSBAND: gemessener Sockel und gemessene Hoehe der Figur in
  ihrer aktuellen Lage, gruen sobald der Sockel im Soll-Fenster liegt.
- FIGUR-WERKZEUG: die Figur selbst VERSCHIEBEN (ziehen) und SKALIEREN
  (40-180 %, bodenmitte-verankert - Skalieren waechst aus dem Sockel),
  "Lage 0" setzt zurueck. Die Lage wird je Figur gespeichert und wandert in
  Zip-Export und GitHub-Ladung - was die Vorschau zeigt, geht live.
- LADE-HEILUNG (der gemeldete Fehler "meine Aenderungen werden nicht
  dargestellt"): v0.56 brach das Speicherformat (flach -> verschachtelt) -
  alte Speicherstaende wurden ignoriert. Jetzt versteht ein Migrationsleser
  beide Formen. Zusaetzlich eine Stale-Closure-Haertung: der Lade-Pfad las
  Regler aus einem veralteten Render - jetzt immer der aktuelle Stand.
- Beweise: eingepflanzter v0.54-Altstand wird geladen (Reglerstand 1.00 /
  0.00 sichtbar, Anzeige-Saettigung 7,84 vs. roh 15,88 - Rezept wirkt);
  Skala 130 % hebt das Massband von Sockel 344 auf 447 px. Sondenlehre:
  Ein-Pixel-Urteile taeuschen (Violett-Zone behaelt Farbe) - Ganzbildmasse
  entscheiden.

## 0.57.0

HUB-KACHELN IN VOLLER PRACHT, DER KNOPF ENDLICH SCHMAL, DAS ADMIN-PORTAL:

- Die Kachelbilder im Hauptmenue fuellen jetzt die VOLLE Kachelhoehe (oben
  und unten klebend) und stehen rechts buendig (right center / auto 100%);
  der Links-Schleier fuer die Textlesbarkeit bleibt. Messbeleg: drei
  Kacheln mit auto-100%-Hintergrund, Lage 100% 50%.
- "Sofort spielen" war trotz Pillenmass noch VOLLBREIT GESTRECKT (flex
  1 1 auto) - der Besitzer hatte zweimal recht. Jetzt inhaltsbreit
  (flex 0 0 auto, gemessen 151 px statt Kachelbreite).
- DAS ADMIN-PORTAL (?admin): eine Tuer zu allen Werkbaenken - Figuren-
  werkstatt, Musterkammer, zurueck ins Spiel - mit Kurzbeschreibung je
  Seite. Nicht verlinkt, wie die Werkbaenke selbst.
- Sondenlehre: der Modal-Abraeumer traf mit /Start/i den Knopf
  "Herausforderung starten" und stolperte in die Kampagne - Muster
  entschaerft.

## 0.56.0

DIE WERKSTATT WIRD RETUSCHE-TISCH - ZOOM, PINSEL, PIPETTE, RADIERER:

- ZOOM (bis 800 %) mit Verschieben-Werkzeug; PINSEL mit Farbwahl und
  PIPETTE (tippt eine Stelle an und uebernimmt deren Farbe, wechselt dann
  selbst zum Pinsel); RADIERER, der ehrlich ins Transparente radiert.
  PINSEL UND RADIERER mit GROESSE (2-90 px) und HAERTE (0-100 %, weicher
  Verlaufsstempel). RUECKGAENGIG ueber sechs Schritte.
- EBENEN-BAUART: Grundbild -> Regler-Rechnung -> Strich-Ebene -> Radier-
  Maske. Handstriche ueberleben dadurch jeden Reglerzug und wandern mit in
  Vorschau, Zip-Export und GitHub-Ladung. Gespeichert wohnen sie je Figur
  als kompakte webp-DataURLs im Geraet (mit Platz-Warnung).
- Sondenbeweise: Pinselstrich faerbt den Messpixel in Pinselfarbe, der
  Radierer senkt sein Alpha (255 -> 69 am weichen Rand), Zoomanzeige 150 %.
  Sondenlehre: setPointerCapture kann werfen und haette den Malvorgang
  abgewuergt - jetzt gefangen.

## 0.55.0

DIE WERKSTATT LAEDT DIREKT ZU GITHUB (Admin-Weg ohne Umweg):

- Neuer Abschnitt "Nur Admin" in der Figurenwerkstatt: eigenes GitHub-Token
  einfuegen (Empfehlung: feinkoerniges Token, nur dieses Repo, nur
  Contents: Read and write) - dann laedt "Geaenderte Figuren zu GitHub
  laden" alle Figuren mit gespeicherten Reglern als EINEN Commit auf main
  (Git-Data-API: Blobs -> Baum -> Commit -> Ref); Cloudflare deployt danach
  von selbst.
- SICHERHEITS-BAUART: das Token steckt NIE im Spiel (Bundle-Beweis: null
  Token-Muster) - es lebt ausschliesslich im Geraet des Admins (localStorage,
  abschaltbar) und ist zugleich das Tor: ohne Token ist der Ladeknopf
  gesperrt (Sondenbeweis). Die Pfade werden strikt aus dem Figurenkatalog
  gebaut - das Tool kann nur carved-*-dark.webp anfassen, nichts sonst.
- Der Zip-Export bleibt unveraendert daneben bestehen.

## 0.54.0

GAMBIT GEHEILT, DIE FIGURENWERKSTATT, KLASSISCHE FIGUREN AN BORD:

- GAMBIT-RESTAURATION: die sechs unbeschaedigten Ur-Zeichnungen (v0.32.0)
  sind aus dem Git-Verlauf zurueckgeholt - die Rasterfaerbung der damaligen
  Cluster-Umfaerbung (v0.32.1) ist damit aus der App verschwunden. Die sechs
  Schattenwesen-Zwillinge wurden aus den restaurierten Hellen frisch
  gerechnet (verdorben-v2, Torwaechter 6/6 ok) und tragen das v5-Rezept.
- DIE FIGURENWERKSTATT (?werkstatt): das Besitzer-Tool. Alle 57 Figuren-
  paare, je Figur Regler fuer Tonwertspreizung, Farbe der Grau-Zone, Farbe
  des Lila-Koerpers, Glimmen-Schwelle/-Leuchtkraft/-Sattheit und ein
  Farbwinkel-Ersetzer; Einstellungen wohnen je Figur im Geraet
  (localStorage), v5-Startwerte per Knopf, helle Schwester als Referenz
  daneben. "Zip exportieren" rechnet ALLE Gegenseiten mit ihren Reglern und
  liefert gegenseite.zip (eigener Zip-Schreiber, plus einstellungen.json) -
  das Paket ist die Gegenseite, wie sie sein soll.
- KLASSISCHE FIGUREN (vom Besitzer geliefert): Bauer, Laeufer, Koenig, Dame,
  Springer der dunklen Seite freigestellt (weisser Grund und Schlagschatten
  entfernt), auf 640x800 bodenverankert und unter assets/klassisch/
  eingelagert. Es fehlen noch: der TURM und die HELLE Seite - erst dann kann
  der Stil als Brettfiguren-Option verdrahtet werden.

## 0.53.0

DIE VERDORBENEN, NEU AUSGELEUCHTET (Tonwert-Rezept v5, Besitzer-abgenommen):

- Alle 57 Schattenwesen und verdorbenen Monster tragen jetzt das v5-Rezept:
  TONWERTSPREIZUNG (p2->p98 auf 5..243, farbtreu) holt die inneren Konturen
  zurueck - Gesichter, Schnitzkanten, nicht nur die Silhouette; der KOERPER
  geht Richtung GRAUSTUFEN (28 % Chroma in den nicht-violetten Zonen,
  gemessen z.B. Knight 0,49 -> 0,11); VIOLETT bleibt die einzige Farbstimme
  (violetter Koerperanteil haelt 75 %); und die LILA-KONTUR GLIMMT STAERKER
  (nur das hellste Viertel der Violett-Pixel zaehlt als Kontur, x1,62
  Leuchtkraft plus Chroma-Nachschub gegen Weissausbrennen - Konturhelligkeit
  206-229 statt 140-160).
- Drei kalibrierte Fehlversuche dokumentiert: Unscharfmaskierung ueberschoss
  auf +294 % Kantenenergie (Knusper); ein zu breites Lila-Band schuetzte den
  ganzen violetten Koerper vor der Entfaerbung (113k statt 28k Pixel beim
  Knight) - die Kontur ist der HELLE Violett-Anteil, nicht das Violett.
- TORWAECHTER vor dem Einbau: 57/57 Dateien geprueft (Groesse, Alphamaske
  auf 0,2 % genau, nie bunter als der Bestand), 0 verweigert.

## 0.52.1

DESIGN-ENTSCHEID DES BESITZERS, FESTGESCHRIEBEN: GESCHNITZT IST FUEHREND.

- Das gemalte ("detailreiche") Design wird NICHT weiterentwickelt. Alle
  painted-Assets sind als design/archiv/detailreich.zip (72 Dateien, 11,8 MB)
  konserviert, mit LIES-MICH: nichts Neues im gemalten Stil; der Rueckbau
  der letzten App-Stellen, die noch painted laden (Brettstil "Detailreich",
  Freischalt-Portraets, Gegnerportraet), ist der naechste Migrationsschritt -
  erst danach duerfen die Ordner-Dateien fallen.
- Geraeteurteil des Besitzers eingetragen: die Kampagnenkarte ruckelt NICHT
  mehr - KNOWN_ISSUES 5 geschlossen, der SVG-Raster-Hebel wird nie gebraucht.
- Der Zerreisser (b22): zwei GESCHNITZTE Kandidaten per Bild-zu-Bild auf dem
  Familiensockel erzeugt (Referenzen b21/b20/b23; Vorgabe: massiger als die
  Familie, gerissene Basaltplatten, rote Innenglut) - gemessen Deck 40/56 %
  (altes b22: duerre 14 %), L 32/33, Rot-Dominanz +15/+10. Einbau erst nach
  Besitzer-Wahl.
## 0.52.0

HUB-FEINSCHLIFF, AUFGERAEUMTE MENUES, DAS GESICHT DES GEGNERS:

- KACHELBILDER HALB SO GROSS, RECHTS UNTEN (Besitzer): die Assets sind eng
  aufs Motiv beschnitten (640 px, 12-17 KB) und sitzen als kleines Bild in
  der Ecke (Hoehe 52 % der Kachel, right bottom) auf dem eigenen schwarzen
  Grund; der Schleier von links sichert weiter die Schrift.
- KNOPFHOEHEN VEREINT: "Sofort spielen" und "Anpassen" tragen jetzt exakt
  die Pillenmasse der Nachbar-CTAs (9/16 px, gemessen beide 38 px) - und
  "Anpassen" traegt das LILA AUSWAHL-GEWAND aus dem Profil: violetter
  Verlauf, leuchtende lila Kontur (gemessen: selLine-Rand + selGlow-Schein).
- INFO-TEXTE RAUS: der Skillpunkt-Hinweis der Schatzkammer und der
  Aufstellungs-Erklaertext des Hofstaats sind gestrichen - dieses Wissen
  wohnt seit v0.51 in Herald und Akademie. Vesnas Chronik-Vorrede bleibt:
  sie ist Stimme, kein Hinweiszettel.
- DAS GEGNERPORTRAET (Kampagne): der Boss schaut dir jetzt ins Gesicht -
  sein gemaltes Bildnis steht bis zur Schulter HINTER dem oberen Brettrand
  (z=-1: die Gegnerzeile deckt den Kopfansatz, der Brettkasten den Rumpf),
  seitlich und oben ins Dunkel maskiert, im Gegner-Filter. Hoffiguren-Bosse
  (pb_) nutzen ihr Figurenportraet. Geraetesicht ausstehend - der Messkasten
  spielt keine Boss-Partien.

## 0.51.0

AKADEMIE VERSCHMOLZEN, DIE MENUES STELLEN SICH SELBST VOR:

- AKADEMIE auf DREI Reiter (Besitzer: "Regeln, Figuren und Chronik sind doch
  dasselbe" - stimmt): CHRONIK (jede Figur lehrt ihre Gangart selbst, die
  klassischen sechs eingeschlossen; hierher zieht die Chronik ENDGUELTIG aus
  dem Hofstaat um), SPIELWEISE (Ziel, Zugrecht, die Sonderzuege, HP, Energie,
  Ausruestung, Kampagne und der HOFWERT samt seiner Online-Bedeutung - die
  frueheren Regel-Tafeln stehen hier vorn) und SCHNELLKURS.
- Der Hofstaat traegt nur noch Stammbaum, Aufstellung, Ausruestung -
  aufgeraeumter, wie gewuenscht. Der Chronik-Waechter in test_ui zog mit um.
- ERSTBESUCH-HERALDE: beim ersten Betreten eines Menues stellt sich der Raum
  EINMAL vor (Titel, ein Satz, kurzer Text) - "Verstanden" bringt genau
  dieses Menue zum Schweigen, "Alle Vorstellungen ueberspringen" alle.
  Gemerkt im Spielstand (profile.gesehen). Datensatz MENUE_LEHREN in
  src/content/lehren.js - dieselbe Quelle traegt spaeter auch die Kurztexte,
  die aus den Menues weichen.
- Die festen Messwerkzeuge bestaetigen Heralde jetzt wie ein Mensch (Haupt-
  knopf per Beschriftung) - Lehre: ein Abraeumer, der stumpf den LETZTEN
  Knopf drueckt, trifft im Herald "Alle ueberspringen" (so wurde immerhin
  der Ueberspringen-Pfad bewiesen).

## 0.50.0

DIE KAMPFLEISTE - FIGUR GROSS, TALENTE ALS ECHTE SCHALTFLAECHEN:

- Tippt man eine eigene Figur an, erscheint sie unten GROSS (die geschnitzte
  Kunst vom Brett, gemessen 75 px) mit Name, Stufe und den Lebens-/Kraft-
  Kugeln - und daneben ihre Talente als GOLDGERAHMTE BUBBLE-SCHALTFLAECHEN
  (Goldring, violettes Email, Talentzeichen). Ein Druck oeffnet die
  BESCHREIBUNG als Karte ueber der Leiste; verbrauchte Einmal-Zauber stehen
  entsaettigt da.
- Die SONDERZUEGE stehen mit in der Liste: steht der Rochade- oder
  En-passant-Augenblick offen (aus denselben legalen Zuegen wie die
  Brettmarkierungen), traegt die Figur die Bubble dazu - mit Erklaerung, wie
  der Zug ausgefuehrt wird. Genau der Wunsch "Rochade als eine Art
  Faehigkeit gelistet".
- Der alte schwebende Eigen-Dossier-Chip entfaellt; der Spaeher-Blick auf
  GEGNER (oben ueber dem Feld) bleibt unveraendert.
- Die Ausruestung (Trank, Zeitriss, Sanduhr) bleibt die feste Legende; die
  Leiste steht IM FLUSS DARUNTER, wo 371 px frei liegen. Zwei verworfene
  Bauarten, gemessen: in-flow ZWISCHEN Brett und Legende kippte die
  Hoehenbilanz in den tight-Modus (Brett sank 51 px); schwebend UEBER der
  Legende landete sie im Mobil-Zweig auf den unteren Brettreihen. Offene
  Geschmacksfrage an den Besitzer: Talente ueber oder unter der Ausruestung.
- Brettzellen tragen jetzt data-zelle-Adressen (Sonden und Werkzeuge).
- Sondenlehre: das Willkommens-Modal (z=60) verschluckte in Messlaeufen alle
  Brettklicks - Sonden raeumen Modale jetzt ueber ihren Hauptknopf ab.

## 0.49.0

DIE SONDERZUEGE DES SCHACHS ZIEHEN EIN - ROCHADE UND EN PASSANT:

- ROCHADE: Koenig ungezogen, Turm ungezogen in seiner Ecke der Heimreihe,
  Gasse frei - dann zieht der Koenig ZWEI Felder zum Turm und der Turm
  springt im selben Zug auf seine Innenseite. Beide Seiten (kurz und lang),
  auf jedem Brett mit Eckturm - auch auf dem 10x10-Hausbrett. Aus dem Schach
  heraus gibt es keine Rochade, und das KREUZFELD darf nicht bedroht sein
  (die Wache sitzt in legalMoves; attacks.js importiert den Zuggenerator,
  ein Gegenimport waere ein Zyklus).
- EN PASSANT: stand der gegnerische Bauer im LETZTEN Zug per Doppelschritt
  neben dem eigenen, darf er im Vorbeigehen geschlagen werden - Zug aufs
  uebersprungene Feld, der ueberholte Bauer verschwindet von seinem. Genau
  einen Zug lang, danach ist das Fenster zu. Nur ausserhalb des HP-Modus:
  dort gibt es kein "Vorbeiziehen", Schlagen ist Schaden auf dem Zielfeld.
- UMWANDLUNG und DOPPELSCHRITT gab es bereits - damit ist der klassische
  Sonderzug-Satz vollstaendig.
- lastMove traegt die Zeugen (double, epCapture, rookFrom/rookTo) fuer die
  kommende Zugliste unter dem Brett; auf dem Brett erscheint die Rochade
  von selbst als Zwei-Felder-Zug des angewaehlten Koenigs.
- NEUE SUITE test_sonderzuege.mjs (19 Pruefungen: Angebot, Verweigerung bei
  gezogenem Koenig/Turm, blockierter Gasse, bedrohtem Kreuzfeld, Ausfuehrung
  mit Turmsprung und Bauernverschwinden, Fensterschluss) - die eiserne Kette
  zaehlt jetzt 20 SUITEN / 810 Pruefungen. Die Suite ist layout-agnostisch:
  alle Koordinaten werden aus dem Brett gescannt (Lehre: das Hausbrett ist
  10x10, geratene 8x8-Geometrie schlug fehl).
- Zwei gefixte Engine-Fallen: (1) beim En-passant-Probelauf starb die
  lastMove-Buchung am leeren Zielfeld (captured true, target null) - sie
  greift jetzt auf das Opfer zurueck; (2) der Turmsprung setzt hasMoved,
  damit derselbe Turm nie zweimal rochiert.

## 0.50.0

DIE AKADEMIE WIRD DAS LERNHAUS DES HOFES (Auftrag: "Hauptsache man lernt
Schach und die Regeln dieses erweiterten Schachs - und den Hofwert muss man
erklaeren, auch seine Online-Bedeutung"):

- FUENF REITER wie im Hofstaat: REGELN (Ziel, Zugrecht, ROCHADE, EN PASSANT,
  Umwandlung, Hausbrett/Loecher), FIGUREN (die klassischen sechs mit Gangart
  UND die Hausfiguren: Kanzler, Erzbischof, Falke, Amazone, Drache, Grand
  Gambit), SPIELWEISE (HP-Modus, Energie mit der Ein-Zauber-Regel,
  Ausruestung, Kampagne samt Wiederholungsregel - und der HOFWERT), CHRONIK
  (dieselbe Stimme wie im Hofstaat, hier eingebettet - ChroniclePanel wird
  wiederverwendet, nicht kopiert) und SCHNELLKURS (die alte Zwei-Minuten-
  Akademie, unveraendert erreichbar).
- DER HOFWERT, ehrlich aus dem Code erklaert (src/meta/rating.js): +100 je
  geraeumter Station, +200 je Liga, Gefaehrten nach Figurenwert, +40 je
  Stufe, +30 je Stern, +15 je Faehigkeit - und online stellt die
  Zufallssuche Gegner mit AEHNLICHEM Hofwert: Band ab +/-150, alle fuenf
  Sekunden um 60 weiter.
- EIN DATENSATZ fuer alles Erklaeren: src/content/lehren.js traegt jede
  Lehre mit Kurzfassung (fuers kommende Erstbesuch-Popup) und Langtext
  (Akademie), de und en. Die Popups der Menues sind der dokumentierte
  naechste Ausbauschritt - sie lesen denselben Datensatz.
- Gepureft per Sonde: alle fuenf Reiter rendern echten Inhalt (7/8/6/3/6
  Tafeln, 392-1914 Zeichen).

## 0.49.0

ROCHADE UND EN PASSANT - DIE SONDERZUEGE DES SCHACHS ZIEHEN EIN:

- ROCHADE: Koenig ungezogen, Turm ungezogen in seiner Ecke der Heimreihe,
  Gasse frei - dann zieht der Koenig ZWEI Felder zum Turm und der Turm
  springt im selben Zug auf seine Innenseite. Aus dem Schach heraus gibt es
  keine Rochade, und das Kreuzfeld darf nicht bedroht sein (die Wache sitzt
  in legalMoves - attacks.js importiert den Zuggenerator, ein Gegenimport
  waere ein Zyklus). Funktioniert auf jedem Brett mit Eckturm, also auch auf
  dem 10x10-Hausbrett (kurz UND lang).
- EN PASSANT: zog der gegnerische Nachbarbauer im LETZTEN Zug per
  Doppelschritt vorbei, darf er im Voruebergehen geschlagen werden - Zug auf
  das uebersprungene Feld, das Opfer verschwindet von seinem eigenen. Nur
  einen Zug lang, und nur ausserhalb des HP-Modus (dort gibt es kein
  "Vorbeiziehen", Schlagen ist Schaden auf dem Zielfeld).
- Beide Zuege erscheinen OHNE UI-Umbau direkt auf dem Brett: die Feldwahl
  reicht den vollen generierten Zug durch (BoardView targets.get), der
  Reducer wendet ihn samt rookFrom/epCapture an. Die Zugliste unter dem
  Brett und die Listung der Rochade als Faehigkeit kommen mit dem
  Kampfleisten-Umbau.
- NEUE SUITE test_sonderzuege.mjs (19 Pruefungen, layout-agnostisch - alles
  wird aus dem Brett gescannt, nichts geraten): Angebot, alle Verweigerungen
  (gezogen, blockiert, Kreuzfeld bedroht, Fenster zu), Ausfuehrung beider
  Seiten, Schlagbuchung. DAS KETTENSOLL STEIGT VON 791/19 AUF 810/20.
- Crash-Befund behoben: bei En passant ist das Zielfeld leer (target null),
  geschlagen wird trotzdem - lastMove bucht das Opfer jetzt von SEINEM Feld.

## 0.49.0

DIE SONDERZUEGE DES SCHACHS ZIEHEN EIN - ROCHADE UND EN PASSANT (Umwandlung
und Doppelschritt gab es schon):

- ROCHADE: Koenig ungezogen, Turm ungezogen in seiner Ecke der Heimreihe,
  Gasse frei - dann zieht der Koenig ZWEI Felder zum Turm und der Turm
  springt im selben Zug auf die Innenseite. Kein Weg aus dem Schach heraus,
  kein Weg ueber ein bedrohtes Kreuzfeld. Funktioniert auf dem 8x8- wie dem
  10x10-Brett (die Bedingung liest die Ecke, nicht eine feste Spalte). Auf
  dem Brett erscheint sie als markierter Zwei-Felder-Zug des Koenigs.
- EN PASSANT: zog der gegnerische Nachbar-Bauer im LETZTEN Zug per
  Doppelschritt vorbei, darf er im Vorbeigehen geschlagen werden - Zug aufs
  uebersprungene Feld, der Bauer verschwindet von seinem. Genau einen Zug
  lang. Nur ausserhalb des HP-Modus (dort ist Schlagen Schaden am Zielfeld,
  ein "Vorbeiziehen" gibt es nicht).
- Beides laeuft durch UI, KI, PvP und Fernpartien unveraendert durch: das
  volle Zugobjekt reist vom Brett-Tipp bis in den Netz-Befehl.
- NEUE SUITE 20 (test_sonderzuege.mjs, 17 Pruefungen) in der Kette:
  KETTEN-SOLL AB JETZT 808 PRUEFUNGEN / 20 SUITEN.

Drei Funde auf dem Weg, fuer die Uebergabe:
(1) Das Hausbrett ist 10x10 - die Suite scannt seither ALLE Koordinaten aus
dem Brett statt 8x8 zu raten. (2) isSquareAttacked zaehlt nur SCHLAG-Zuege -
ein leeres Kreuzfeld ist fuer sie nie bedroht; die Wache stellt den Koenig
jetzt probeweise aufs Kreuzfeld und fragt die normale Schachprobe. (3) Bei
En passant ist das Zielfeld leer (target null), geschlagen wird trotzdem -
der lastMove-Bau kennt jetzt das Opfer (Crash "reading 'kind' of null").

## 0.48.0

DIE GROSSEN KACHELN ERZAEHLEN JETZT DIE GESCHICHTE (drei Bilder des
Besitzers):

- Kampagne: die Bauernfigur von hinten vor dem leuchtenden Riss. Schnelles
  Spiel: die Sanduhr mit violettem Sand auf dem geborstenen Brett.
  Online-Duell: zwei Koenige am Riss. Motiv rechts, Titel und Griffe auf der
  linken, nachgemessen fast schwarzen Zone (L 0,9-1,6), dazu ein leiser
  Schleier von links. Die Wappen-Grafiken entfallen auf diesen drei Karten.
- Assets rechts beschnitten (das Cover-Fitting quetschte sonst die halbe
  Schwarzflaeche der Quellen in die Kachel und das Motiv wurde winzig) und
  auf 14-20 KB gepackt; Motivnachweis per Glanzlicht-Perzentil (p99 159-204).
- Designleitsatz des Besitzers dazu im Quelltext verankert: mehr Flaeche
  heisst echte Bildsprache, nicht Symbolik.
- messe-hub versteht Bildkacheln: die Zeichen-gegen-Schrift-Pruefung gilt
  nur noch, wo ein diskretes Zeichen existiert (Lehre: der erste Fallback
  mass den ganzen Kopf gegen seine eigene Schrift - 4560 px2 Unsinnswert).

## 0.47.0

DIE ZAHLEN IN DEN LEBENS- UND ENERGIEKUGELN STEHEN RUHIG:

- Der Besitzer meldete die Kugeln als unruhig und schlecht lesbar. Die
  Messung (NEU tools/pruefe-kugeln.mjs, liest getBBox im SVG) zeigte: der
  Textkasten sitzt exakt mittig (Versatz dy = 0) - die Unruhe kam von der
  SCHRIFT. Georgia bringt MEDIAEVALZIFFERN mit: 3, 4, 5, 7, 9 haengen unter
  die Grundlinie, 6 und 8 ragen hoch. In einer Kugel wirkt das wie Wackeln.
- Jetzt System-Sans mit LINIENDEN, TABELLARISCHEN Ziffern (tnum/lnum): alle
  einstelligen Zahlen exakt gleich hoch (Streuung 0,02 des Fuellgrades),
  gleiche Breite, und eine Stufe groesser gesetzt, weil Sans-Ziffern schmaler
  bauen als Antiqua - Fuellgrad 0,65 -> 0,71. Dunklerer Kern (.62 statt .55)
  fuer den Stand auf hellen Feldern.
- Die Kugeln stehen jetzt in der Musterkammer (?galerie) in drei Groessen und
  allen Ziffernlaengen - dort messen sie sich deterministisch, ohne dass ein
  Spielmodus mitredet.
- Lehre am Messgeraet selbst: die erste Fassung verglich ROHE Ziffernhoehen
  ueber verschieden GROSSE Kugeln und meldete Fehlalarm; verglichen wird der
  auf den Radius normierte Fuellgrad.

## 0.46.2

AKADEMIE-KARTE NACHGERECHNET STATT NACHGEBESSERT: die Kur von v0.46.1 reichte
dem Besitzer nicht - und die Messung gab ihm recht. Flaeche gegen Grund lag
bei 1,57:1, die Goldkante gegen die Flaeche bei 2,39:1, also UNTER dem
3:1-Minimum fuer nicht-textliche Kanten. Jetzt Violett 20 % heller im
gleichen Ton (#594684 -> #3a2c59, deckend statt 96 %) und Kante auf 60 %
Deckkraft: 1,93:1 bzw. 3,14:1, Text bleibt bei 8,08:1. Die Karte bleibt
sekundaer - kein Gold-CTA, kein Glanzlauf.

## 0.46.0

DIE GEGNER WERDEN HELL, DER RISSBODEN ZIEHT EIN:

- VERDORBENE SEITE, DRITTE FASSUNG: "sehr viel heller, mehr Farbtoene
  durchscheinen lassen". Restfarbe 0.16 -> 0.55 (die Figur behaelt ueber die
  Haelfte ihrer eigenen Farbe), Abdunklung fast aufgehoben: Leuchtdichte-
  Verhaeltnis q von 0,66 auf 0,88-1,02. Die UNTERSCHEIDUNG traegt jetzt die
  Toenung statt der Dunkelheit: violetter Saum fast verdoppelt (0,5 -> 0,95).
  Neuer Torwaechter mit drei Bedingungen je Figur - Farbabstand zur hellen
  Schwester >=14 (gemessen 35-65), Saettigung >=12, nachweisbare Kuehl-
  Toenung (Chroma-Richtung gegen das eigene Grau, mit Zweitmessung fuer
  Figuren, deren Grundfarbe schon kuehl ist).
- REPARATUR: ein abgebrochener Erzeugungslauf hatte zwei Dateien halb
  geschrieben (queen, guardian) und sechs auf altem Stand gelassen - alle
  acht nachgerechnet, danach ALLE 57 auf Unversehrtheit und Frische geprueft.
- DER RISSBODEN (10 Bilder des Besitzers, 188 KB): unten fixiert hinter jedem
  Menue, nach oben in Schwarz auslaufend, waechst mit HOFWERT UND KAMPAGNE
  je zur Haelfte - Stufe 1 ungebrochener Boden, Stufe 10 offener Riss. Im
  Kampf und auf der Karte bleibt er fort.
- BRETT BREITER: Seitenrand 4 -> 1 px, gemessen 376 -> 382 px bei 390 px.
- HUB: auf "Schnelles Spiel" ragte das Wappen 6 px oben und 2 px unten aus
  dem Kartenkopf (gemessen) - seit die CTA-Pille zwei eigenen Griffen wich,
  war der Kopf kuerzer als das 84-px-Bild. Der Kopf haelt jetzt Mindesthoehe.

Drei Fallen, die diese Fassung gestellt hat und die in die Uebergabe gehoeren:
(1) Der Rissboden lag zuerst NUR im Breit-Zweig von App.jsx - die App hat
ZWEI Rueckgaben. (2) Gleicher zIndex wie MysticBackground: bei Gleichstand
gewinnt der spaeter gezeichnete, der Boden lag unter deckendem Schwarz.
(3) import.meta.glob bricht die Rauchprobe (esbuild/Node kennt es nicht) -
zehn gewoehnliche Importe tun es auch.

## 0.45.1

DER UEBERLAPPUNGS-WAECHTER LERNT DESKTOP UND UEBERDECKUNG (Dauerauftrag des
Besitzers: "nie Elemente uebereinander, nie Text verschluckt - Desktop und
mobil"):

- pruefe-textfluss.mjs laeuft jetzt DREISPURIG (320, 412, 1280 px); die
  Dock-Navigation greift per Beschriftung statt Index und traegt damit
  beide Layoutzweige (nav unten / aside oben).
- NEU: paarweise UEBERDECKUNGSPRUEFUNG - kein sichtbarer Knopf darf einen
  anderen verdecken. Zwei Verfeinerungen aus echten Fehlalarmen: (1) Inhalt
  unter dem GLAS-DOCK ist in Scroll-Mitte legitim - geprueft wird am
  SCROLL-ENDE, wo das Bodenpolster Freiheit garantieren muss; (2) 
  getBoundingClientRect ignoriert Clipping - ein aus main herausgescrollter
  Knopf "ueberlappte" numerisch die Kopfleiste (top -1125, real unsichtbar);
  der Waechter rechnet jetzt SICHTBARE Rechtecke, mit jedem overflow-
  schneidenden Vorfahren verschnitten.
- Befund nach Schaerfung: App auf allen drei Viewports sauber - null Funde.
  KNOWN_ISSUES 4 damit erledigt.

## 0.45.0

ACHT PUNKTE DES BESITZERS - UHR, GEGNERFIGUREN, KARTE, LEISTUNG:

- DIE UHR IST NICHT MEHR ZU UEBERSEHEN: drei Stufen (golden -> gross ab
  20 s -> ALARM ab 10 s: 23 px, fett, rot, pulsierend), und in den letzten
  Sekunden glimmt der Innenrand des BRETTS im Takt der Uhr (Licht statt
  neuer Elemente; Zug-Timer: 5 s / 3 s; reduced-motion: gross+rot, still).
- GEGNERFIGUREN NEU GERECHNET (tools/verdorben-v2.py, 57 Stueck, numerisch
  belegt): deutlich heller (Leuchtdichte-Verhaeltnis 0,52 -> 0,66; Bauer
  43,2 -> 55,5), leichte Lila-Toenung ueberall nachweisbar (B-R +1..+14,
  auch beim ziegelroten Turm), und die EINGEBACKENEN BLITZE sind fort - per
  Konstruktion, kein _ast-Aufruf existiert mehr. Nachtwesen-Bosse (helle
  Fassung selbst dunkel) mit dokumentierter q-Ausnahme.
- RAHMEN: die Riss-Blitze an der oberen Leiste sind ersatzlos gestrichen;
  der 11-s-Wanderglanz ist drei OERTLICHEN Aufglaenzern gewichen (9-13-s-
  Takte, versetzt, nie im Chor).
- KARTE - WIEDERHOLUNGEN SIND JETZT KLAR: jede Station bleibt spielbar;
  nur der FREUNDSCHAFTSKAMPF zahlt noch (+15 % Gold, +25 % XP), jede andere
  Wiederholung nichts (vorher: halbes Gold!). Das Stations-Panel sagt es
  bei geraeumten Stationen dazu (camp.replayHint/replayNone, de+en).
- KARTE - FLUSS: der Zug laeuft jetzt DIREKT am DOM (vorher rendertee jeder
  Pointer-Move den ganzen Weltbaum: gemessen 48 ms mittlerer Frame, 77/92
  verloren); waehrend des Ziehens RUHT DAS WETTER (Animations-Pause-Klasse);
  Terrain-Spiegel von 460 % Hoehe/blur24 auf 150 %/blur14; Wolken kleiner
  und ohne mixBlendMode; Tor-Puls von box-shadow (malt!) auf Opazitaet;
  Medaillon-Ring der aktuellen Station steht still (sein Puls rasterte das
  SVG 60x/s). Hinweis: der Messkasten rastert ohne GPU (SwiftShader) und
  zeigt einen Software-Composite-Boden - das Geraeteurteil hat der Besitzer.
- BOOT: die drei Hausschriften werden vorgeladen (preload), grosse
  Kachel-/Wappenbilder dekodieren asynchron. Boot-Messung: 17 ms mittel,
  2-5 Ausreisser in 3,5 s.
- HUB: "Kampagne starten" statt "Neue Kampagne starten" bei frischem Stand.
- TEXTFLUSS-WAECHTER zweispurig (320 UND 412 px, mit Nichtmess-Schutz);
  Desktop-Breit steht als naechster Ausbau in KNOWN_ISSUES.

## 0.44.0

RUECKMELDUNG DES BESITZERS EINGEARBEITET (Auswahl, Online, Sofortstart, Hofstaat):

- AUSWAHL IST VIOLETT - ENDGUELTIG: die goldene Wahlpille (v0.43, aus den
  GPT-Blaettern) ist nach Live-Sicht verworfen; Segmente, Reiter und
  Kartenchips tragen wieder die tiefe violette Flaeche mit violetter Kontur
  aus v0.42. Gold gehoert allein den Handlungen.
- SOFORT LOSLEGEN: die Schnellspiel-Karte im Hub traegt jetzt einen echten
  "Sofort spielen"-Griff, der ohne Konfiguration mit den letzten
  Einstellungen startet (localStorage gambit:lastQuick, sonst Hausvorgaben);
  "Anpassen" fuehrt auf den bisherigen Weg. Kopf der Karte oeffnet weiter
  die Konfiguration.
- ONLINE-DUELL: der Spielmodus (Gambit/Klassisch) steht jetzt GANZ OBEN;
  Privatheit und "Beim Start verbinden" sind ans Ende geruext - erst
  spielen, dann verwalten.
- KEIN WAHLSCHALTER VERSCHLUCKT TEXT - jetzt MASCHINELL erzwungen:
  tools/pruefe-textfluss.mjs prueft bei 320 px jede Schaltflaeche in
  Schnellspiel, allen Hofstaat-Reitern und Profil auf Ueberlauf. Funde und
  Kuren: 12 Reiter-Ueberlaeufe ("Aufstellung" breiter als ein Viertel der
  Schiene) -> Silbentrennung (hyphens auto, lang=de) + engere Polster;
  8 Aufstellungs-Zellen (+4 px) -> gg-fit-svg-Einpasshuelle mit BESTIMMTEN
  Grid-Spuren (mit auto-Zeile ist max-height:100% unbestimmt und wird
  ignoriert - das Bild folgte nur seinem Seitenverhaeltnis).
- EIN VERZEICHNIS, EINE HANDSCHRIFT: Meister-Kacheln im Hofstaat tragen
  dieselbe Goldpalette wie der Hof (das rosa Siegel ist Geschichte) und
  verbuendete Meister zeigen ihre Stufe wie jede Hofkachel.

## 0.43.0

DIE VORLAGEN DES BESITZERS (design/vorlagen/ds1-vorlage-*.png) EINGEBAUT:

- FARBWELT DER VORLAGE in der geschnitzten Livree: Grund #0B0E14 statt reinem
  Schwarz, Tafeln #15121E/#1D1730, Schrift waermer (#F1E7C6/#A89E8A), Violett
  heller (#7A3CFF, Glow #B07CFF), Status kraeftiger (Erfolg #3CCB7A, Warnung
  #FFC857). Eintritt (Login/Spielstaende) bleibt tiefschwarz, classic-Livree
  unangetastet. Kontrastsuite: 30/30 gruen.
- AUSWAHL IST WIEDER GOLD - die Vorlage schlaegt den Auftragstext: aktive
  Reiter, Segmente und Kartenwahl tragen FLACHES Gold (matter Verlauf, dunkle
  Tinte, kein Schein); der glaenzende Verlauf mit Glanzlauf bleibt allein dem
  CTA. Violett behaelt Fokusring, Riss und Auren. Umbruch langer Namen und
  Beruehrhoehen aus v0.42 bleiben.
- EIN GOLDVERLAUF FUER ALLE HANDLUNGEN: GOLD_CTA (#D4AF37 -> #B78A21) als eine
  Quelle in theme.js - ersetzt drei Literal-Varianten in Gilded, primitives,
  Hub-CTA und Schatzkammer-Einfordern. Sekundaerknopf mit goldener Kontur.
- KOPFLEISTE ALS RESSOURCEN-PILLE: voll gerundet, violetter Glasverlauf,
  duenne violette Kante - Fluchtlinie bleibt bei 10 px.
- HOFSTAAT-KACHELN tragen ihre Stufe ("Koenig - Stufe 8", golden unter dem
  Namen); SCHALTER nach Vorlage (violette Bahn, cremefarbener Knauf) als
  neues Bauteil, Musik im Profil nutzt ihn, Musterkammer zeigt ihn.
- Vorlagen liegen im Repo unter design/vorlagen/ als Referenz.

## 0.42.0

DESIGNSYSTEM 1.0 - DIE GROSSE UI-UEBERARBEITUNG (alles gemessen, nichts geschaetzt):

- AUSWAHL IST VIOLETT, AKTION IST GOLD: Segmented und MapChip lesen die neuen
  Tokens T.sel/selLine/selInk - im Schnellen Spiel standen vorher vier
  Goldflaechen gleichzeitig, jetzt null; lange Optionsnamen brechen um statt
  abgeschnitten zu werden; Beruehrziele auf Hausmass (T.touch 44).
- HUB BEGINNT OBEN: Luecke Kopfleiste->Karte 67->22 px, nur noch EIN
  Glanzlauf (Kampagne) statt drei im Chor.
- DAS BRETT RUECKT AN DIE GEGNERZEILE: Blockdeckel statt Zentrierung, totes
  Band 160->2 px, Brett 366->376 px, Spielerzeile direkt darunter,
  Zoom-Mathematik unangetastet.
- SCHATZKAMMER KOMPAKT: Hero 200->175 px, Platte 90->84 px, Dauerglow
  14->0 (Reward-Rahmen nur bei wartender Belohnung), 7 statt 6 Ruhmestaten
  im Blick. Hofstaat-Vorrede: 2 Zeilen + "Mehr".
- DIE DREI STIMMEN ALS ECHTE SCHRIFTEN: Cinzel 600 (Wortmarke, grosse Titel)
  und Cormorant Garamond 600/500i (Erzaehlstimme) - selbst subsettet, OFL
  beigelegt, 91 KB, offline im Precache; IM-Fell-Doppellast entfernt
  (Precache netto 2770->2533 KiB).
- KONTRAST ALS 19. SUITE: test_kontrast.mjs rechnet jede Textrolle gegen ihre
  ECHTE (gemischte) Flaeche in beiden Livreen - fand classic faint bei
  3,51:1, angehoben auf 4,61:1. NEUES KETTENSOLL: 791 gruen / 19 Suiten.
- Dazu: prefers-reduced-motion, sichtbarer violetter Tastaturfokus,
  einheitliches disabled, Motion-Uhr T.mo, Musterkammer unter ?galerie,
  Foto-Tour + Lage-/Schatz-Messwerkzeuge, 19 Doku-Dateien unter
  docs/grand_gambit_design/ inkl. Rollback-Anleitung.

## 0.32.2

ELFTES KAPITEL: KRUMMHOLZ - DIE BAUMGRENZE ZWISCHEN EICHWALD UND GRAUWACHT:

- NEUES KAPITEL IV eingeschoben, alle folgenden ruecken um eins: Kronland,
  Kornmark, Eichwald, KRUMMHOLZ, Grauwacht, Wolkenjoch, Aschgrund, Sattelweite,
  Die Wunde, Sonnenschlund, Endloses Meer. Der Sprung vom Wald direkt ins
  Gebirge war zu hart - das Krummholz ist der Uebergang, benannt nach den
  windschiefen Baeumen an der Baumgrenze.
- 51 NEUE ORTSNAMEN fuer das Kapitel (Ueber die Baumgrenze, Die Windfluechter,
  Die letzte Alm, Gamswechsel, Der Zerzauste Wald, Die Zwei Wetterfichten,
  Zirbenwacht ...), Dublettenpruefung ueber alle 561 Namen gruen.
- VIER KAPITELTITEL: Ueber die Baumgrenze / Krummholzpfade / Die letzte Alm /
  Der kahle Kamm.
- MEISTER des Krummholz ist der SPRINGBOCK (b02) - der Fels-zu-Fels-Springer
  gehoert an die Baumgrenze; die Meisterliste zaehlt jetzt elf.
- WELTKARTE: neuer Anker und neuer Lore-Text (die Stille zwischen zwei
  Glockenschlaegen) auf Deutsch und Englisch; alle folgenden Kapitel-Lore-
  Schluessel verschoben.
- TECHNIK: der Weltzyklus laeuft ueberall auf Modulo 11 statt 10 (Themen,
  Hintergrund-Tints, Brettfarben, Beschriftungs-Tints, Titel, Ortsnamen,
  Meister, Speicher-Biome). Der Kapitaen ist jetzt Meister von Kapitel X,
  das Meer ist Kapitel XI; roemische Ziffern bis XI, Warentexte (Bergschluessel
  VI, Schwarzes Tor VII, Duerrgras VIII, Schrein X) nachgezogen. Kartenbild:
  vorerst das Wolkenjoch-Bild als Platzhalter, bis die V5-Karte kommt.

## 0.30.2

WERKZEUG FUER DIE NEUEN WELTKARTEN:

- tools/detect-stations.py liest die Stationsmarker aus einer gemalten Karte
  automatisch aus, statt 51 Punkte je Welt von Hand nachzumessen. Verfahren:
  Schwellenwert auf sehr dunkel und sehr unbunt, Zwei-Durchgang-Markierung der
  zusammenhaengenden Flaechen, Filter auf Groesse und Rundheit, Schwerpunkt je
  Marker. Am Ende Abgleich gegen die erwartete Anzahl, damit ein Fehlschlag
  auffaellt statt still durchzurutschen.
- NACHGEMESSEN am gerechneten Wegeplan: 51 von 51 Markern gefunden, groesster
  Versatz zur wahren Koordinate 1,4 Pixel, im Mittel 0,8.
- DABEI AUFGEFALLEN: sechs Stationspaare liegen in den heutigen Positionen
  praktisch aufeinander - b2 und r1 sind auf einer 4096 Pixel breiten Leinwand
  nur 5 Pixel auseinander, dazu c3/u3, c3/o1, o1/u3, a1/s1 und d1/s2. Beim
  ersten Testlauf verschmolzen sie zu einem Marker und die Erkennung lieferte
  46 statt 51. Fuer die neuen Karten sind die Punkte deshalb auf mindestens
  78 Pixel Abstand entzerrt.

## 0.30.1

DIE SECHS WILDEN KAPITEL TRAGEN JETZT EIGENE NAMEN STATT GELAENDEETIKETTEN:

- Gebirge -> GRAUWACHT (die letzten grauen Wachtuerme vor dem Anstieg)
- Hochgebirge -> WOLKENJOCH (die Paesse ueber den Wolken, ueber die der Hof floh)
- Oedland -> ASCHGRUND (der erste Preis, den der Riss trank)
- Steppe -> SATTELWEITE (wo der Lanzenmeister seine Turniere ritt)
- Roter Canyon -> DIE WUNDE (der Riss selbst, die Treppe hinab)
- Wueste -> SONNENSCHLUND (verschluckt Spuren, Namen und Absichten)

Kronland, Kornmark, Eichwald und Endloses Meer bleiben.

- ALLE SICHTBAREN TEXTE NACHGEZOGEN, nicht nur die Kartenbeschriftung: die zehn
  Kapitel-Lore-Texte auf der Weltkarte (deutsch und englisch), die Warentexte
  von Bergschluessel, Kriegsaxt, Kamel und Sternenkompass, dazu die Kommentare
  im Kartenschirm und in der Kapiteltitel-Tabelle. Die Lore liest sich an zwei
  Stellen jetzt sogar besser: Die Wunde traegt ihren Namen zu Recht statt Der
  rote Canyon ist die Wunde selbst.
- KEIN KOLLISIONSFALL: alle sechs neuen Namen wurden gegen die 510
  Stationsnamen geprueft, keiner war vergeben.

## 0.30.0

DIE ZEHN WELTEN HEISSEN JETZT NACH IHREM GELAENDE, NICHT NACH JAHRESZEITEN:

- UMBENANNT: Fruehling -> KRONLAND (die Kronenstadt und ihre gruenen Heimfelder),
  Sommer -> KORNMARK (fruchtbares Bauernland), Herbst -> EICHWALD (dichter Wald),
  Winter -> GEBIRGE. Damit liest sich die Reise als Weg durchs Land statt als
  Kalenderjahr: Heimat, Aecker, Wald, Berge, Hochgebirge, Oedland, Steppe,
  Roter Canyon, Wueste, Endloses Meer.
- DIE ORTSNAMEN PASSTEN SCHON: Kapitel II trug immer bereits Bauernland-Namen
  (Sichelmark, Kapelle im Korn, Garbenwall), Kapitel III Wald-Namen
  (Kastanienhall, Der Rehpfad, Klingenwald). Nur die Etiketten waren
  Jahreszeiten. Im Gebirge wurden zehn reine Kalender-Namen auf Hoehe
  umgestellt (Polarnacht -> Nachtwand, Koenigsfrost -> Koenigsgrat, Letzte
  Flocke -> Letzter Steig, Kerzenmesse -> Kluftmesse und weitere); der
  Dubletten-Test ueber alle 510 Ortsnamen bleibt gruen.
- ALLE 40 KAPITELTITEL neu gesetzt, wo sie eine Jahreszeit meinten: Kornmark
  Ins hohe Korn / Wege zwischen den Aeckern / Die Zehntwaage / Der Erntethron;
  Eichwald Unter das Blaetterdach / Der Nebelscheid / Ins Dickicht / Der Herr
  der Eichen; Gebirge Der erste Anstieg / Drei kalte Paesse / Die Steinprobe /
  Der Sattel des Winds. Wueste beginnt jetzt mit DER GLUEHENDE SAND.
- DAS WORT LIGA IST VERSCHWUNDEN. Es stand noch in der Bestenliste, im
  Online-Bildschirm, in der Spielstand-Liste und im Teilen-Text; ueberall steht
  jetzt Kapitel. Auch der Rueckblick heisst bereits gemeisterte Kapitel.
- MEISTER STATT ENDBOSS: der Gegner am Ende eines Kapitels heisst jetzt MEISTER,
  die Aufforderung Meister fordern. Grossmeister bleibt Osric allein
  vorbehalten.

## 0.29.1

SCHLEIER WEG - KORREKTUR ZU 0.29.0:

- URSACHE: 0.29.0 hat den Schwarzpunkt ANGEHOBEN, jeder Pixel bekam einen Boden
  von 14. Das macht ein Bild heller, legt aber einen milchigen Schleier darueber:
  die Tiefen sind nicht mehr schwarz. Bei den Waren der Schatzkammer stieg das
  fuenfte Perzentil von 13 auf 32, der Median von 53 auf 117 - genau das hat man
  als Schleier gesehen. Glanz ist Kontrast, nicht Helligkeit.
- WAREN, ERFOLGE, ORBS, WERTELEISTEN, WAPPEN UND EMBLEM sind vollstaendig auf den
  Stand vor 0.29.0 zurueckgesetzt. Sie waren nie das Problem und haetten gar nicht
  angefasst werden duerfen.
- INSIGNIEN bleiben aufgehellt, aber ueber den umgekehrten Griff: ein EINGANGS-
  Schwarzpunkt bei 0.12 klemmt die Tiefen auf echtes Schwarz, danach zieht eine
  Gammakurve die Mitten und Lichter hoch. Ergebnis am Beispiel des Dock-Symbols
  Spielen: fuenftes Perzentil 10 -> 0, Median 45 -> 166, Mittel 67 -> 150. Heller
  als je zuvor UND tiefer im Schwarz als im Original.
- WERKZEUG tools/lift-art.py entsprechend umgebaut: nur noch die Insignien, ein
  Verfahren, Zielwerte als Konstanten im Kopf, --dry fuer den Probelauf.

## 0.29.0

HELLERES BILDWERK IN DER GANZEN APP:

- ALLE VIER BILDFAMILIEN AUFGEHELLT, nicht mehr nur die Insignien. 48 gemalte
  Bilder liegen jetzt auf definierten Ziel-Leuchtdichten statt irgendwo
  zwischen 30 und 118:
  - Insignien (9 Dock- und Kopfleisten-Symbole): 36 bis 88 -> 160
  - Waren der Schatzkammer (13): 30 bis 118 -> 140
  - Erfolgs-Embleme (14): 51 bis 63 -> 132
  - Orbs und Werteleisten (8): 37 bis 109 -> 104
  - Wappen und Emblem (4): 55 bis 92 -> 118
- INSIGNIEN AUS DEM ORIGINAL NEU GERECHNET statt ein zweites Mal ueber die
  bereits gehobene Fassung: die Ausgangsbilder aus 0.28.1 wurden aus der
  Historie geholt und in EINEM Schritt auf 160 gezogen. Damit faellt die
  doppelte webp-Verlustrunde von 0.28.3 und 0.28.4 weg.
- VERFAHREN unveraendert und bewusst konservativ: Gammakurve haelt den
  Weisspunkt (keine ausgebrannten Glanzlichter), angehobener Schwarzpunkt
  haelt die Konturen ueber dem Navy, leichte Saettigung haelt das Gold golden.
  Die Orbs bekommen bewusst nur wenig Saettigung, damit Rot und Blau ihre
  Bedeutung als Leben und Energie behalten.
- WERKZEUG: tools/lift-art.py loest tools/lift-icons.py ab. Ziele stehen als
  Tabelle im Kopf, Probelauf ueber --dry, idempotent (was schon auf Ziel liegt,
  wird nicht angefasst). Nachgemessen bei 24, 32 und 44 px auf App-Navy.

## 0.28.4

HELLERE INSIGNIEN:

- AUFGEHELLT: alle zehn gemalten Icons (Dock-Navigation, Muenze, Skillfunke,
  Gold-Totenkopf, Wappen, Faehigkeitsstern, Sternensplitter) liegen jetzt
  einheitlich auf einer mittleren Leuchtdichte von 118 statt 48 bis 102. Der
  Lift laeuft ueber eine Gammakurve statt ueber einen Multiplikator: der
  Weisspunkt bleibt stehen, die Glanzlichter brennen nicht aus, die Mitten
  kommen hoch. Dazu ein angehobener Schwarzpunkt, damit die Konturen nicht
  absaufen, und leicht mehr Saettigung, damit das Gold golden bleibt.
- DOCK-AUS-ZUSTAND: das inaktive Tab-Symbol war mit Graustufe 85 Prozent und
  88 Prozent Helligkeit fast ausgeloescht; jetzt Graustufe 50 Prozent bei
  voller Helligkeit -- erkennbar, aber weiter klar hinter dem aktiven Tab.
- WERKZEUG: tools/lift-icons.py backt die Icons reproduzierbar neu und ist
  idempotent (liegt ein Bild schon auf Ziel, bleibt es unberuehrt).

## 0.28.3

NACHSCHLIFF UND WERKZEUGKASTEN:

- ADAPTIVE HELLIGKEIT: die Insignien werden nicht mehr pauschal aufgehellt,
  sondern je Bild auf eine Ziel-Leuchtdichte von etwa 78 normalisiert -- die
  dunkelsten Gemaelde (Helm, Pokal, Totenkopf) bekommen den staerksten Schub
  (gedeckelt bei +42 Prozent), helle bleiben unangetastet.
- DESIGN-WERKZEUGKASTEN: unter design/ liegen der komplette Prompt-Katalog
  "Chunky Masterpiece" (182 Bloecke) und der OpenAI-Bildgenerator gen.py --
  damit kann jede frische Sitzung die Neugestaltung ohne Anlauf fortsetzen.
  Der Generator liest den Key NUR aus der Umgebung, nie aus Dateien.

## 0.28.2

SICHTBARKEIT FUER DIE INSIGNIEN. Die gemalten Goldstuecke aus 0.28.1 waren
zu leise -- jetzt treten sie vor:

- HELLER GEBACKEN: alle zehn Bilder laufen neu durch die Werkbank mit
  +16 Prozent Helligkeit, etwas mehr Saettigung und einer sanften
  Kontrastkurve -- das Gold traegt jetzt auf dunklem Filz.
- DER SCHEIN: jedes Insignienbild steht auf einem gelb-weisslichen
  Lichthauch (warmer drop-shadow-Glow) -- Dock, Kopfchips, Muenzen auf
  Preisschildern, Skillfunken, Splitter, Brettstern.
- GROESSER: Dock-Bilder von 22 auf rund 29 Punkt (echte 26 plus sanfte
  Skalierung), Kopfleisten-Chips von 15 auf 20 mit groesserer Zahl,
  Muenze und Funke in den Zeilen 18 Prozent groesser, Splitter-Zeile 24,
  Splitter-Blatt 124, Brettstern 14 Prozent groesser mit doppeltem Schein.
- DIE SCHATZKAMMER IST WIEDER KLAR: die Gold-Glasur und das Ecklicht,
  die UEBER den Erfolgs-Gemaelden lagen, sind ersatzlos gestrichen --
  sie lasen sich als milchiger Schleier. Die Bilder stehen blank und
  einen Hauch heller.
- DIE WEISSE KONTUR IST GEZAEHMT: Plattenrand von Fast-Weiss auf ruhiges
  Gold (1.5px statt 2), Medaillonring von Weissgold auf sattes Gold,
  die hellen Innenschimmer halbiert.
- DER GLANZ UEBER DEN BRETTKACHELN ZIEHT JETZT UEBER DAS GANZE: das
  Lichtband der freundlichen Tische war ein schmaler 16-Prozent-Streifen
  und las sich als duenne Linie -- jetzt ein breiter, weicher Schein
  (rund zwei Drittel der Laufflaeche), etwas kraeftiger und langsamer.

## 0.28.1

DIE GEMALTEN INSIGNIEN. Zehn Goldbilder aus der Werkstatt ersetzen die
gezeichneten Zunftzeichen, ueberall wo dieselbe Sache gemeint ist -- die
Aufrufstellen blieben unangetastet, nur die Icon-Bausteine selbst tragen
jetzt Gemaelde:

- DAS DOCK: Springer (Spielen), gekreuzte Schwerter (Hofstaat), Pokal
  (Schatzkammer) und Helm (Profil) als gemalte Goldstuecke. Der aktive Reiter
  leuchtet voll, die anderen treten entsaettigt und gedimmt zurueck -- ein
  Gemaelde laesst sich nicht umfaerben, also uebernimmt der Filter die Arbeit
  der alten Strichfarbe.
- DIE KOPFLEISTE: Muenze (Goldstand) und Schachbrett-Wappen (Hofwert) als
  gemalte Chips; dieselbe Muenze prangt nun auf jedem Preisschild, jeder
  Belohnung und jedem Kaufknopf (GoldCoin/CoinIc), der gemalte Funke auf
  allen Skillpunkt-Angaben (SkillStar/SkillIc), der vergoldete Totenkopf
  im Tutorial (GoldSkullIc).
- DER FAEHIGKEITSSTERN AM BRETT: der schwebende Stern ueber Figuren mit
  ungezuendetem Talent ist jetzt das gelieferte Gemaelde, der Glutschein
  bleibt. Wie die Orbs reist er als Daten-URL IM Buendel -- kein
  Cache-Fenster kann das Brett je aushungern.
- DER STERNENSPLITTER: die seltenste Ware der Schatzkammer traegt endlich
  ihr eigenes Bild -- der facettierte Kristall in der Truhenzeile (22px)
  und gross auf dem Warenblatt (116px), wie jede andere Ware.
- HANDWERK: 1024er-Originale per Alpha-Beschnitt freigestellt, quadratisch
  gefasst und auf 64-232px webp gepackt; die kleinen Insignien leben als
  generierte Daten-URLs in iconAssets.js (34 KB), der Splitter als eigenes
  Item-Asset. In Chromium nachgemessen: Dock 96px echt, Chips quadratisch,
  Splitter-Zeile und -Blatt geladen, keine Seitenfehler.
- NICHT ANGETASTET: der kleine farbcodierte Boss-Totenkopf (SkullIc, dient
  als 8px-Silhouette in drei Farben), die drei gemalten Wappen der Wege
  (crest-1/2/3) und alle uebrigen gezeichneten Glyphen.

## 0.28.0
- FERNSCHACH KOMPLETT — DIE BENACHRICHTIGUNG IST DA: Classic Gambit hatte schon das erste Standbein (Partien leben auf dem Server: Seed, beide Armeen, jede Zugliste — sie ueberleben, wenn beide die App schliessen). Jetzt steht das zweite: Web-Push. Ziehst du, waehrend dein Gegner die App geschlossen hat, klopft eine Benachrichtigung an sein Geraet — "Dein Zug gegen …".
- DIE GLOCKE IN DER LOBBY: Unter den Fernpartien (und auf der Classic-Gambit-Karte) sitzt ein Opt-in-Knopf. Zustaende sauber getrennt: an (mit Aus-Schalter), blockiert (Hinweis auf Seiten-Einstellungen), iPhone/iPad ohne Installation (Hinweis auf "Zum Home-Bildschirm"). Bei jedem Verbinden wird die Adresse still aufgefrischt, denn Push-Endpunkte rotieren.
- DER HALL SIGNIERT SELBST: Das VAPID-Schluesselpaar wird beim ersten Start im Durable Object erzeugt und dort aufbewahrt — kein Wrangler-Secret, kein Dashboard-Schritt, nichts, das ein Redeploy vergisst. Der oeffentliche Schluessel reist im welcome zum Browser.
- VERSCHLUESSELT NACH RFC 8291: Jede Nachricht wird fuer genau den einen Browser versiegelt (ECDH P-256 + HKDF + AES-128-GCM, alles WebCrypto, null Abhaengigkeiten). Der Beweis steht in test_worker.mjs: ein UNABHAENGIGER Entschluesseler, direkt aus dem RFC-Text geschrieben, holt den Klartext Byte fuer Byte zurueck.
- DER HALL WECKT SICH SELBST: Ein Durable-Object-Alarm zielt auf den naechsten faelligen Moment — 24 h vor Fristablauf erinnert er den Saeumigen ("Noch rund 24 Std. …"), zur Frist entscheidet er die Partie auf Zeit und benachrichtigt beide Abwesende. Ein frischer Zug setzt Frist UND Erinnerung zurueck.
- ALLE EREIGNISSE KLOPFEN AN: Partie eroeffnet (Weiss zieht zuerst), Gegner hat gezogen, Frist laeuft ab, Partie beendet (gewonnen/verloren, auf Zeit oder durch Aufgabe) — Texte auf Deutsch oder Englisch, je nach Spielersprache aus dem hello.
- BIS ZU FUENF GERAETE je Spieler (Handy, Tablet, Schreibtisch), das aelteste faellt raus; tote Postfaecher (410) werden beerdigt. Klick auf die Benachrichtigung fokussiert das offene Spiel oder oeffnet es neu.
- SAUBER VERDRAHTET: push-sw.js haengt per importScripts am generierten Service Worker — Precache-Manifest, skipWaiting und die Stuck-Update-Rettung aus main.jsx bleiben unberuehrt. 41 neue Worker-Tests (VAPID-Signaturpruefung, Header-Anatomie, 410-Beerdigung, Erinnerung-einmalig, Zeitverlust-Wertung, Alarmziel); Gesamtbatterie 738 gruen.

## 0.27.5
- ALLE 25 MEISTER NEU GEZEICHNET — ALS SCHACHFIGUREN: Bisher waren es frei schwebende Kreaturen mit aufgemalten Augen und Mund; die Brutmutter las sich als Smiley. Jetzt steht jeder auf DERSELBEN Schachachse wie die Dame — ihr Rock, ihr Kragen, denn ein Meister nimmt ja ihr Feld ein — und nur der KOPF unterscheidet ihn. Damit liest sich jedes Ungeheuer zuerst als Figur auf einem Brett und erst dann als Ungeheuer.
- UND DIE KOEPFE FOLGEN DEN BESCHREIBUNGEN: Der Waechter ist ein Schild mit Sehschlitz, das Bollwerk traegt Zinnen, der Kanonier ein ausgefahrenes Rohr, der Koloss Klippenschultern, Eisenfaust die Hammerhand; der Springbock zwei geschwungene Hoerner, das Zebra den Maehnenkamm, der Doppelritter zwei abgewandte Pferdekoepfe, die Sturmkraehe den vorgestreckten Schnabel, der Zerreisser Zaehne und Klaue; die Brutmutter einen prallen Sack auf gespreizten Beinen, der Skorpion den gewoelbten Stachel, der Brandstifter die Flamme, die Blutmagd drei lange Schleierspitzen, der Seuchenkoenig drei gestapelte Windungen mit gekroentem Kopf; die Schemen ihre Kapuzen, die Tyrannen Helm, Lanze, Schluesselring und Klingenkronen.
- KEINE GESICHTER MEHR: Augen und Mund sind fort — genau sie liessen die Gestalten laecheln statt drohen.
- VERMESSEN STATT GERATEN: In Chromium gerendert und nachgerechnet — Hoehen 58-68 px neben 69-79 px der echten Figuren, jede auf demselben 9-px-Fuss. Drei Paare waren einander zu aehnlich (Waechter/Schleicher, Geist/Blutmagd, Geist/Wandlerin) und wurden nachgeschaerft, ein viertes (Schattenfuerst/Seuchenkoenig) danach ebenfalls. Kleinster Kopf-Unterschied jetzt 2.19 %, Mittel 4.97 %.
- SIEBEN NEUE WACHEN: jeder Meister hat eine Zeichnung, steht auf dem Schachsockel, traegt den Kragen, hat KEINE gezeichneten Augen, ist eine einzige Silhouette, und keine zwei teilen sich einen Kopf. Gesamtbatterie: 697 gruen.

## 0.27.4
- JEDES AUSRUESTUNGSSTUECK LAESST SICH ANTIPPEN und oeffnet sein eigenes Blatt: das Bild gross oben (116 px), darunter Name, Bestand, die kurze Wirkung — und neu ein ausfuehrlicher Text. Gekauft wird direkt aus dem Blatt heraus.
- AUSFUEHRLICHE ERKLAERUNGEN FUER ALLE DREIZEHN, in beiden Sprachen. Besonders fuer die erklaerungsbeduerftigen Stuecke, denn sechs davon wirken NUR mit der passenden Figur im Hofstaat — der Bergschluessel braucht einen Techniker, die Kriegsaxt einen Schildtraeger, das Donnerpulver einen Alchemisten, der Sternenkompass einen Spaeher, der Anker und das Boot den Kapitaen. Das stand nirgends und ist jetzt in jedem Blatt vermerkt. Auch die Feinheiten stehen dort: dass der Trank den ganzen Zug kostet, dass der Zeitenwender in Online-Duellen nicht gilt, dass die Brieftaube aus der eigenen Kasse zahlt.
- DER STERNENSPLITTER STEHT NICHT MEHR AUF DEM PODEST: Seine eigene Goldplatte mit wanderndem Glanz und Goldschrift ist fort — er ist eine Ware wie jede andere. Was ihn besonders macht (zwei je erreichtem Kapitel), sagt sein Blatt, und ist der Vorrat des Kapitels gehoben, steht der Hinweis genau dort.
- EIN ABSTURZ, DEN DREI PRUEFUNGEN NICHT SAHEN: Das neue Blatt liest die Gegenstandsliste, deren Import aber fehlte — beim ersten Antippen brach der ganze Hofstaat zusammen ("ITEMS is not defined"). Build, Smoke und SSR blieben gruen, weil NIEMAND das Blatt je geoeffnet hat. Behoben, und die Batterie oeffnet jetzt jedes einzelne Blatt (alle dreizehn plus den Splitter) — derselbe Griff, der schon den Schatzkammer-Absturz gefangen hat.
- ZEHN NEUE WACHEN: jedes Blatt oeffnet ohne Absturz, zeigt das grosse Bild, die kurze Wirkung und den langen Text; jeder Gegenstand hat seine Erklaerung in beiden Sprachen; die sechs Stuecke mit Begleiter-Pflicht sagen es ausdruecklich; keine Herz-Zeichen mehr in den Texten; der Splitter ohne eigene Platte. Gesamtbatterie: 690 gruen.

## 0.27.3
- "LÄUFER FREIE FIGUR" — DIE URSACHE GEFUNDEN UND BEHOBEN: Name und Hauszeile waren BEIDE als inline-flex gesetzt, und zwei Inline-Kaesten in einem Block fliessen nebeneinander. Genau darum stand der Zusatz seit Wochen hinter dem Namen statt darunter. Beide sind jetzt blockweise gesetzt — jede Zeile bekommt ihre eigene Reihe. Im Browser an fuenf Figuren nachgemessen: Bauer, Springer, Laeufer, Turm, Dame — ueberall +2 px UNTER dem Namen.
- MEIN PRUEFER HATTE EIN LOCH: Er uebersprang jeden Zusatz, der selbst ein Zeichen traegt (die Hausraute) — und das war ausgerechnet dieser. Er ist geschlossen, und eine zweite, direkte Messung schaut den beiden Kaesten jetzt frontal auf die Kanten. Gegen den alten Stand geprueft: faellt rot.
- KEIN EINZIGES MONSTER HATTE EIN BILD — und die Gemaelde lagen die ganze Zeit da: Die Chronik las die Galerie mit Klammern statt als Funktionsaufruf (paintedById["boss-b01"] statt paintedById("boss-b01")), was IMMER undefined ergibt. Deshalb standen Waechter, Brutmutter, Bollwerk, Geist, Sturmkraehe, Zerreisser — und alle uebrigen — als Fragezeichen da. Berichtigt; im Browser gezaehlt: 47 von 47 Kacheln tragen jetzt ihr Bild.
- UND NIE WIEDER EIN FRAGEZEICHEN, WO EINE FIGUR HINGEHOERT: Fehlt einmal ein Gemaelde, zeigt die Kachel die eigene Vektorgestalt als schwarze Silhouette. Der NAME darf "???" bleiben, bis du der Figur begegnet bist — die Gestalt muss es nicht.
- DREI NEUE BROWSER-MESSUNGEN halten alles fest: fuenf Figurenblaetter werden geoeffnet und die Kanten vermessen, und keine Kachel darf je wieder ohne Figur oder mit einem Fragezeichen dastehen. Gesamtbatterie: 681 gruen, Geometrie-Test 30 gruen.

## 0.27.2
- DIE TRUHE IST GEMALT: Zwoelf Ausruestungsgegenstaende tragen jetzt ihr eigenes Bild — Lebenstrank, Zeitenwender, Buschmesser, Enterhaken, Fackel, Bergschluessel, Kriegsaxt, Kamel, Donnerpulver, Anker, Brieftaube und Boot. Sie erscheinen ueberall gleich, weil alle Stellen durch EIN Symbol laufen: Vorratstruhe, Kampf-HUD (Trank- und Zeitenwender-Knopf), verschlossene Pfade auf der Karte, Kapitel-Belohnungen und die Akademie.
- SECHS DAVON MUSSTEN ERST FREIGESTELLT WERDEN: Die Haelfte der Lieferung kam mit weissem Hintergrund. Ein einfacher Weiss-Filter haette das Segel des Bootes, die Federn der Taube und den Sand der Sanduhr mitgefressen — deshalb wird der Hintergrund nur vom RAND her weggenommen (zusammenhaengende Flaeche), die Kante eine Spur eingezogen und weich ausgelaufen. Gemessene Kantenhelligkeit danach hoechstens 89 von 255: kein weisser Saum.
- DER STERNENKOMPASS FEHLT in der Lieferung — er behaelt sein gezeichnetes Symbol, bis sein Bild kommt. Der Test nennt ihn beim Namen, damit er nicht vergessen wird.
- DIE AKADEMIE WAR VERALTET: Sie sprach von einer "Ligafeste", die es in der Geschichte nicht mehr gibt. Die Kampagnen-Karte nennt jetzt die vier Kapitel beim Namen (Der Aufbruch, Die drei Pfade, Die Pruefungen, Der Aufstieg), die Zitadelle als Ziel, den Grossmeister als Gegner und die 51 Stationen. Auch im Code hiess n22 noch "League Keep" — ebenfalls berichtigt.
- UND ZWEI REGELN FEHLTEN DORT GANZ: Die Hofstaat-Karte erklaert jetzt, dass eine Figur mehrere Faehigkeiten KOENNEN darf, aber pro Partie nur EINE wirkt (und dass der goldene Stern genau das anzeigt) sowie die festen Plaetze von Koenig und Dame. Die Duell-Karte nennt die vier Zeitformate.
- ZEHN NEUE WACHEN: fast die ganze Truhe gemalt, Ungemaltes faellt sauber zurueck, ein gemaltes Stueck rendert als Bild in der gewuenschten Groesse, die Akademie zeigt Bilder statt Zeichen, spricht nicht mehr von der Ligafeste, nennt Zitadelle und Grossmeister, lehrt die Ein-Zauber-Regel und die vier Gambits. Gesamtbatterie: 681 gruen.

## 0.27.1
- CLASSIC GAMBIT IST GEBAUT — FERNSCHACH, DAS OFFLINE WEITERLEBT: Ein Live-Duell ist eine Bruecke zwischen zwei offenen Verbindungen; schliesst einer die App, ist die Partie tot. Eine Fernpartie liegt jetzt VOLLSTAENDIG auf dem Server: Saat, beide Armeen und die geordnete Liste aller Zuege. Weil das Brett deterministisch ist (gleiche Saat + gleiche Zuege = gleiche Stellung), spielt der zurueckkehrende Spieler die Liste einfach nach — der Server muss kein Schach verstehen und keine Stellung serialisieren.
- BEWIESEN, NICHT BEHAUPTET: Ein Test spielt VIER Halbzuege ueber vier Tage durch den echten Regelkern, beide Spieler zwischendurch offline — danach bauen beide Seiten unabhaengig nach und landen auf der IDENTISCHEN Stellung, einig darueber, wer am Zug ist.
- DIE FERNPARTIEN-LISTE in der Lobby: jede laufende Partie mit Gegner, Zugzahl und Restfrist; die, in denen DU am Zug bist, stehen oben und leuchten violett. Ein Tipp oeffnet sie, ein Zug legt sie zurueck ins Regal — mit einer ruhigen Karte, die sagt, dass der Gegner nun dran ist.
- FRIST UND FAIRNESS: Wer drei Tage nicht zieht, verliert auf Zeit; jeder Zugriff auf das Regal raeumt abgelaufene Partien ab und wertet sie. Niemand kann zweimal hintereinander ziehen, ein Fremder kann eine Partie nicht anfassen, eine beendete Partie nimmt keinen Zug mehr an, und Aufgeben entscheidet sie sofort. Die Wertung laeuft ueber dieselbe Leiter wie die Live-Duelle.
- KEINE KI IN FERNPARTIEN: Die Maschine schweigt — hier schuldet ein Mensch die Antwort.
- OFFEN BLEIBT EINZIG DIE PUSH-BENACHRICHTIGUNG: Solange der Gegner online ist, erfaehrt er den Zug sofort; sonst findet er ihn beim naechsten Oeffnen in der Liste. Echtes Push braucht Signaturschluessel (VAPID) und einen Abo-Speicher — das ist ein eigener Schritt, kein Teil dieses Umbaus. Gesamtbatterie: 671 gruen (26 neue Pruefungen im Saal).

## 0.27.0
- DIE VIER GAMBITS: Online-Duelle haben jetzt Zeitformate, als Karten in der Lobby — QUICK GAMBIT (1 Min +1, rotes Blitzzeichen, "Kugelschnell und pure Reflexe"), RUSH GAMBIT (3 Min +2, gelbe Stoppuhr, hervorgehoben als der Modus, in dem die meisten Duelle laufen), PRIME GAMBIT (10 Min, blaues Schild, mit der Vorwarnung "eine Partie kann 20-30 Minuten dauern") und CLASSIC GAMBIT (1-3 Tage, violette Krone).
- EINE ECHTE DUELL-UHR: Bisher tickte nur in Kampagnenstationen eine Uhr, und nur auf deiner Seite. Im Duell laufen jetzt BEIDE Uhren — deine auf deinem Zug, seine auf seinem — und jeder Zug gibt seinem Urheber den Zuschlag zurueck (Fischer). Die Bedenkzeit des Gegners haengt neben deiner im Kopfbereich und tritt zurueck, solange du am Zug bist. Faellt seine Uhr auf null, gewinnst du; faellt deine, verlierst du.
- PAARUNG NACH UHR: Der Worker fuehrt den gewaehlten Takt in der Warteschlange und paart nur Gleiches mit Gleichem — ein Bullet-Spieler landet nie in einer Rapid-Partie. Beide Seiten bekommen dieselbe Uhr angesagt, keiner startet mit einem anderen Budget.
- CLASSIC GAMBIT EHRLICH AUSGEWIESEN: Fernschach braucht Partien, die weiterlaufen, wenn beide die App schliessen, und eine Benachrichtigung, wenn man am Zug ist — beides kann die heutige Live-Verbindung nicht. Die Karte kuendigt das Format an und sagt genau das, statt einen Modus vorzutaeuschen, der ins Leere laeuft.
- SECHZEHN NEUE WACHEN: vier Gambits mit Namen, Takt, Farbe und Zeichen in beiden Sprachen, steigende Budgets von Bullet bis Fernschach, Zuschlag in den schnellen Formaten, Rueckfall bei unbekanntem Takt — und im Worker: getrennte Warteschlangen je Uhr, gleiche Ansage an beide Seiten. Gesamtbatterie: 645 gruen.

## 0.26.12
- ZUSATZ NEBEN DEM NAMEN: NACHGEMESSEN, IN ALLEN VIER RAEUMEN — und nirgends gefunden. Der Hofstaat wurde in echtem Chromium Raum fuer Raum abgetastet (Chronik, Aufstellung, Ausruestung, Verzeichnis) und zusaetzlich das geoeffnete Figurenblatt: Fuer JEDEN Figurennamen wird geprueft, ob rechts daneben auf derselben Zeile ein Kleintext derselben Karte steht. Ergebnis ueberall 0. Die Sache aus 0.26.9 haelt also — wer den Zusatz noch neben dem Namen sieht, hat vermutlich noch einen aelteren Stand geladen.
- UND SIE KANN NICHT MEHR ZURUECKKOMMEN: Sechs neue Browser-Messungen im Geometrie-Test halten es fest. Der Messfuehler unterscheidet dabei sauber zwischen echten Namenszeilen und den Wert-Zeilen ("3 Angriffsstaerke"), deren Beschriftung absichtlich NEBEN der Kugel steht — und ignoriert die "???"-Platzhalter unentdeckter Figuren.
- ERFOLGS-EMBLEME NOCH GOLDENER: Helligkeit von 1.35 auf 1.5 im geoeffneten und 1.16 auf 1.28 im ruhenden Zustand, mehr Sattheit und ein staerkerer Goldstich. Neu darueber: eine warme Goldglasur und ein weiches Glanzlicht oben links, wo die Kerze steht — die Platte liest sich als poliert statt flach.

## 0.26.11
- DIE ZWEI ERSTEN FRAGEN STEHEN JETZT AN DER TUER: Gleich nach dem Einstieg fragt das Spiel, welche Figuren du sehen willst (Simpel oder Detailreich gemalt) und wie stark der Gegner rechnen soll. Beides lag bisher tief im Profil, wo ein Neuling nie hinsieht. Dabei steht ausdruecklich dabei, dass die Kampagne ihre EIGENE Steigerung mitbringt (spaetere Kapitel fordern auch auf "Leicht") und dass sich beides jederzeit unter PROFIL wieder aendern laesst.
- BESCHREIBUNGEN DER SCHATZKAMMER GEGEN DEN CODE GEPRUEFT — zwei waren schlicht falsch: "Blitzmatt" nannte seine Grenze nie (der Code zaehlt 40 HALBZUEGE, beide Seiten zusammen — also spaetestens dein 20. Zug), und "Schmiedekunst" sprach von einer SCHMIEDE, die es im Spiel gar nicht gibt: Aufstiege kauft man im Hofstaat mit Skillpunkten. Beides richtiggestellt, dazu zehn weitere Texte geschaerft: wessen Schlagzahl zaehlt (deine), was "Dame gehalten" wirklich meint (nie gefallen; ein Meister auf ihrem Feld zaehlt als Dame), wieviele Stationen es gibt (51), dass Freundschaftskaempfe nicht erneut zaehlen, und dass ein Remis die Siegesserie ebenso beendet wie eine Niederlage.
- GLANZ LAEUFT JETZT: Die Lichtstraehne lag als starres Band auf der Platte — beim Antippen wandert sie nun EINMAL von links nach rechts hindurch, offen wie geschlossen, mit eigenem Zaehler je Platte.
- EMBLEME HELLER UND GOLDENER: Die gemalten Erfolgsbilder standen fuer eine Schatzkammer eine Spur zu dunkel — angehoben, waermer und mit etwas mehr Gold (geoeffnet noch kraeftiger).
- VIERZEHN NEUE WACHEN, darunter zwei, die die Zahlen im Text gegen den Code halten: Nennt der Blitzmatt seine Grenze? Erfindet noch irgendein Text eine Schmiede? Gesamtbatterie: 629 gruen.

## 0.26.10
- AUFSTELLUNG BEI RUHENDEM KAMPF: GEPRUEFT — KEIN FEHLER, aber ab jetzt gesagt. Nachgerechnet: Ein pausierter Kampagnenkampf wird aus seinem eigenen Schnappschuss fortgesetzt, deine laufende Partie behaelt also exakt ihre Aufstellung; was du im Hofstaat aenderst, wirkt ab dem NAECHSTEN Kampf. Beides ist jetzt als Dauertest verankert (Brett unveraendert UND naechste Schlacht mit der neuen Reihe). Neu ist ein Hinweis im Aufstellungs-Editor, sobald ein Kampf ruht — damit niemand fuerchten muss, gerade einen Spielstand zerschossen zu haben.
- DIE SCHATZKAMMER SETZT IHR EMBLEM IN SZENE: Wird eine Platte geoeffnet, stellt sie sich auf — das Medaillon steigt nach oben in die Mitte, waechst von 56 auf 104 px, leuchtet heller (kraeftigerer Rand, satterer Schein, das Bild eine Spur heller und farbiger). Um den Kreis wandert ein rotierender Lichtring, und aus seiner hellsten Stelle spruehen fuenf Funken TANGENTIAL davon — jeder auf seiner eigenen Bahn, mit eigenem Takt und Versatz. Geschlossene Platten bleiben still.
- NEUN NEUE WACHEN: aufgestellte Platte, gewachsenes Emblem, aufsteigende Bewegung, drehender Ring, Funken auf eigenen Tangenten, Ruhe im geschlossenen Zustand — und der Hinweis erscheint nur, wenn wirklich ein Kampf ruht. Gesamtbatterie: 615 gruen.

## 0.26.9
- DER ZUSATZ STEHT JETZT UNTER DEM NAMEN — endlich, und diesmal nachgemessen: Auf den Kacheln der Chronik klebte "Krone" / "Schatten" als winzige Zeile in der OBEREN RECHTEN ECKE. Er sitzt nun als Bildunterschrift direkt unter dem Figurennamen. Im Browser vermessen: 20 Zusaetze unter dem Namen, KEINER daneben.
- JEDE KACHEL TRAEGT IHRE VEKTORFIGUR: Oben rechts steht jetzt die simple Figur selbst (28 px, blank, ohne Ring oder Rahmen) — bei Kronen- und Schattenfiguren wie bei jedem Monster mit seiner eigenen Silhouette. Gemessen: 27 von 27 Kacheln.
- AUCH IM FIGUREN-POPUP: Ueber dem Gemaelde sitzt oben rechts der Vektor-Zwilling (40 px im grossen Blatt, 28 px in der Karte), damit Gemaelde und Silhouette als EINE Figur gelernt werden.
- EIN SAAL STATT FUENF LUECKENREIHEN: Die Meister standen in fuenf Sippen-Abschnitten (Golems, Bestien, Schlangen, Schemen, Tyrannen) — jeder duenn besetzt und voller "???", was wie fehlende Bilder aussah. Es fehlt KEIN Bild: die Fragezeichen sind Monster, denen du noch nicht begegnet bist. Sie stehen jetzt gemeinsam unter "MEISTER & GROSSMEISTER".
- DURCHGAENGIGE BENENNUNG: Ueberschrift, Kachel-Zusatz und die Zeile unter dem Namen sagen jetzt dasselbe — "Figuren der Krone" und "Figuren des Schattens" statt "Kronenfiguren" hier und "FIGUREN DER KRONE" dort.
- FUENF NEUE BROWSER-MESSUNGEN im Geometrie-Test halten das fest: Kacheln werden gezeichnet, jede traegt ihr Eck-Zeichen, kein Zusatz steht je wieder neben dem Namen, die Meister haben einen Saal, die Sippen-Ueberschriften sind fort. Gesamtbatterie: 603 gruen.

## 0.26.8
- DAS HAUPTMENUE IM KAMPF WAR EINE SACKGASSE: Auf breiten Bildschirmen bleibt die Menueleiste waehrend einer Partie sichtbar — ein Klick darauf bewirkte jedoch GAR NICHTS, weil das Brett einfach ueber dem gewaehlten Bereich weiter gezeichnet wurde. Jetzt fragt das Spiel nach: "Kampf verlassen?" — und es sagt ehrlich, was es kostet. Ein Kampagnenkampf wird gesichert und laesst sich an derselben Station fortsetzen; ein Schnelles Spiel oder ein Online-Duell laeuft ohne Sicherung und waere verloren. Dazu ein Weg zurueck zum Brett.
- UND ER WIRD JETZT WIRKLICH GESICHERT: Bisher sicherte sich ein Kampagnenkampf nur beim Wegblenden der App und ueber den Zurueck-Pfeil. Wer ihn anders verliess — Menue, Browser-Geste — verlor ihn. Das Verlassen selbst sichert jetzt, genau wie der Pfeil (eine beendete Partie bleibt unberuehrt).
- AUFSTELLUNG: NACHGEWIESEN, NICHT VERSPROCHEN. Auf deine Frage hin geprueft und als Dauertest verankert: Was du im Hofstaat je Karte aufstellst, wird auf JEDER Karte auch wirklich ins Feld geschickt — und der Koenig steht dabei weiterhin auf seinem festen Feld. Eine beschaedigte gespeicherte Reihe kann den Kampf nicht sprengen.
- ZEHN NEUE WACHEN und ein Durchlauf im echten Browser (Kampf → Menue → Rueckfrage → zurueck zum Brett → wechseln). Gesamtbatterie: 599 gruen.

## 0.26.7
- DIE WICHTIGSTE REGEL WIRD ENDLICH ERKLAERT: Vor jedem Lebenskampf erscheint eine Einweisung — BLAU ist die Kampfkraft (so viele Lebenspunkte reisst die Figur beim Angriff herunter), ROT sind die Lebenspunkte (so viel haelt sie selbst aus) — und vor allem der RUECKPRALL: Haelt der Verteidiger stand, springt der Angreifer auf sein Ausgangsfeld zurueck; erst mit dem letzten Lebenspunkt rueckt man vor. Das sah bisher wie ein Fehler aus, weil es nirgends stand. Auch der goldene Stern wird erklaert (die eine Faehigkeit dieser Partie ist noch frei).
- MIT "NICHT MEHR ANZEIGEN": Die Einweisung kommt vor jedem Lebenskampf, bis man sie einmal wegwinkt — dann bleibt sie fuer immer fort. Bei Kampagnenstationen erscheint sie hinter der Erzaehlkarte, damit die Geschichte den Vortritt hat.
- ZUM NACHLESEN IN DER AKADEMIE: Zwei neue Lehrkarten — "Die zwei Kugeln" und "Angriff & Rueckprall", letztere mit gerechnetem Beispiel (3 Kraft gegen 5 Leben braucht zwei Angriffe) und den echten Kugelgrafiken statt Platzhaltern.
- ZWEI FEHLER NEBENBEI BEHOBEN: Die Akademie stuerzte ab, wenn der Seitenzeiger hinter das Ende der kuerzeren Kartenreihe geriet (Spurwechsel) — der Index wird jetzt geklemmt. Und die Brettmessung aus 0.26.0 warf beim Server-Rendern eine React-Warnung; sie nutzt jetzt den passenden Haken.
- NEUN NEUE WACHEN: Die Einweisung muss beide Kugeln und den Rueckprall erklaeren, einen Weg zum Abschalten anbieten und nach dem Abwinken fortbleiben; die Akademie muss beide Lehrkarten fuehren. Zusaetzlich im echten Browser durchgespielt: Erzaehlkarte, Einweisung, Brett. Gesamtbatterie: 589 gruen.

## 0.26.6
- JEDES MONSTER BEKOMMT SEIN EIGENES GESICHT: Im simplen Modus teilten sich 25 Monster ganze FUENF Sippen-Silhouetten — Der Waechter, Das Bollwerk, Kanonier, Der Koloss und Eisenfaust waren buchstaeblich dieselbe Zeichnung, ebenso je fuenf Bestien, Schlangen, Schemen und Tyrannen. Alle 25 sind jetzt einzeln gezeichnet: der Waechter als Schild mit Sehschlitz, das Bollwerk mit Zinnen, der Kanonier mit ausgefahrenem Rohr, der Koloss mit Klippenschultern, Eisenfaust mit Hammerhand, der Springbock mit geschwungenen Hoernern, das Zebra mit Maehne, der Doppelritter mit zwei Koepfen, die Sturmkraehe mit vorgestrecktem Schnabel, der Zerreisser mit Zaehnen und Klaue, die Brutmutter als praller Sack auf Spreizbeinen, der Skorpion mit gewoelbtem Stachel, der Brandstifter als Flamme, die Blutmagd mit spitzem Schleier, der Seuchenkoenig als gekroente Windung, und so fort bis zu Asra mit ihrer Klingenkrone und Osric mit der hoechsten Krone des Bretts.
- AUSWAHL NACH MONSTER, NICHT NACH SIPPE: Die Gestalt wird jetzt zuerst ueber die Monster-Kennung gesucht; die fuenf Sippenbilder bleiben als Rueckfalloption fuer alles Neue (und fuer die Figuren-Bosse der Kampagne).
- GEPRUEFT STATT BEHAUPTET: Alle 25 in Chromium gerendert und vermessen — Deckung 4-7 %, Hoehe 46-66 % der Kachel, exakt im Band der bewaehrten Sippenbilder (5-7 %, 51-61 %), kein Randkontakt, keine zwei Silhouetten einander aehnlich. Der Kanonier fiel dabei zu klein aus und wurde gestreckt.
- SECHS NEUE WACHEN: jedes Monster besitzt eine eigene Gestalt, alle 25 unterscheiden sich, die Sippenbilder bleiben als Rueckfall erhalten, jede Zeichnung nimmt die Brettfarben an und traegt die Kontur, und zwei Monster derselben Sippe muessen verschieden zeichnen. Gesamtbatterie: 580 gruen.

## 0.26.5
- KONTUREN FUER DIE SIMPLEN FIGUREN (Kontraste gerechnet): Die goldenen Figuren trugen bisher GAR KEINE Kante und verschmolzen auf hellen Feldern mit dem Untergrund, die Haarlinie des Gegners war auf dunklen Feldern zu duenn. Jetzt traegt jede Seite ihr Gegenteil — fast schwarze Kontur ums Gold (7.8:1 zur eigenen Fuellung, 7.4:1 zum hellen Feld), fast weisse ums Marineblau (12.4:1 und 6.6:1). Die Kontur wird UNTER die Flaeche gemalt (paint-order), sie schaerft also den Umriss ohne Details zu fressen, und ihre Staerke ist ueber eine Variable regelbar (alle 34 Figuren-Dateien entsprechend erweitert).
- DER GRAND GAMBIT HAT ENDLICH EINE EIGENE SILHOUETTE: Er teilt sich die Figurenart mit dem Bauern und lieh sich darum dessen Umriss — als einzige Figur im Spiel ohne eigene Gestalt. Neu gezeichnet als Bauer, der weitergegangen ist: derselbe runde Kopf und Kragen, aber breitere Schultern zum Umhang und eine Klinge im Ruecken. Sein Wappen reitet weiterhin obenauf.
- UMSCHALTER KLARER BENANNT: "Simpel" und "Detailreich gemalt" (englisch "Simple" / "Painted in detail") statt "Simpel (Vektor)" und "Gemalt"; der Hinweistext nennt jetzt die Kontur.
- ACHT NEUE WACHEN: jede Figurenart besitzt eine Vektorgestalt, der Gambit eine eigene (und nicht die des Bauern), beide Seiten tragen eine Kontur, und die beiden Konturen sind Gegensaetze. Gesamtbatterie: 574 gruen.

## 0.26.4
- DIE EMBLEME ZEIGEN SICH, WIE SIE GEMALT SIND: Bis ein Erfolg begonnen war, lag ein Graufilter samt Abdunklung auf dem Medaillon — bei dieser Staerke war schlicht nicht mehr zu erkennen, WAS das Bild zeigt. Der Filter ist ersatzlos weg; jedes Emblem steht auf jeder Platte in voller Staerke. Was erreicht ist, sagen weiterhin Balken, Rauten und Zaehler.
- MEHR GOLD, KRAEFTIGERE KONTUR: Der Plattengrund ist waermer und heller (rgba 96,74,34), der Saum von 1.5 auf 2 px verstaerkt und aufgehellt, der Medaillonring auf 2.5 px in hellem Gold mit staerkerem Schein. Die Glanzstraehne ueber der Platte ist doppelt so praesent.
- SCHRIFT KONTRASTREICHER (nachgerechnet): Titel jetzt 12.5:1 statt 6.1:1, Beschreibungen 10.2:1, die blasseste Stufe noch 7.6:1 — WCAG verlangt 4.5. Der Titel traegt zusaetzlich einen feinen Schattenriss, damit er sich vom Gold abhebt.
- DREI NEUE WACHEN: kein Emblem darf je wieder ausgegraut oder abgedunkelt werden, alle 14 muessen in voller Staerke gezeichnet sein, und die Kontur muss kraeftig genug bleiben. Der Platten-Test prueft jetzt farbunabhaengig, dass alle Karten denselben Grund tragen — so kann ein Neuanstrich keine dunkle Sonderfassung zurueckschmuggeln. Gesamtbatterie: 566 gruen.

## 0.26.3
- FEHLERBERICHT VOM 22. JULI AUFGEKLAERT (Android, v0.24.25, "Cannot read properties of undefined (reading 'map')"): Das war der Schatzkammer-Absturz beim Antippen eines Erfolgs. Nachgestellt am alten Stand — der Absturz tritt Wort fuer Wort auf, sobald ein Erfolg aufgeklappt ist; auf dem heutigen Stand nicht mehr. Behoben wurde er in 0.24.26 (evaluate reicht die Stufenliste mit, dazu ein Rueckfall auf eine leere Liste), gedeckt vom Smoke-Fall "AchievementsScreen (open)".
- VIER NEUE WACHEN gegen dieselbe Fehlerklasse: (1) Die leere Kulisse fuer GEMALTE Kapitelkarten muss jedes Feld erklaeren, das die Karte zeichnet — genau dieser Pfad wird heiss, sobald die gemalten Karten kommen, und ein fehlendes Feld dort wuerde exakt denselben Absturz ausloesen. (2–4) Schatzkammer, Hofstaat und Chronik werden gegen einen Spielstand gerendert, dem optionale Teile fehlen (wie bei alten Speicherstaenden), und muessen das ueberleben. Gesamtbatterie: 562 gruen.

## 0.26.2
- DIE SCHATZKAMMER TRAEGT IHRE GEMALTEN EMBLEME: Alle 14 Erfolge haben jetzt ihr eigenes Bild — Siegeskranz, gestuerzte Krone, gefluegelte Sanduhr, Monsterschaedel und die uebrigen. 14 Erfolge, 14 Embleme, kein Ueberhang auf keiner Seite.
- FREIGESTELLT UND NEU GEGOSSEN: Die Vorlagen kamen als undurchsichtige Quadrate auf fast schwarzem Grund. Zuerst per Leuchtdichte-Matte freigestellt (Grund abgezogen, Farbe zurueckgerechnet, damit keine dunklen Saeume bleiben) — auf hellem Untergrund blieb aber ein feiner Kasten vom Vignetten-Schleier sichtbar. Deshalb sind sie als RUNDE Medaillons neu gegossen: die Scheibe traegt das warme Dunkel der Goldplatten, das Emblem sitzt mittig darin. So gibt es auf keinem Untergrund eine Kante — geprueft auf hellem Gold wie auf dunklem Grund.
- Das Medaillon waechst von 48 auf 54 px, damit die Zeichnung atmet; der goldene Ring, sein Schein und die gedaempfte Darstellung unbegonnener Erfolge bleiben. Fuer alles ohne Gemaelde steht weiterhin das gezeichnete Zeichen bereit.
- DREI NEUE WACHEN: jeder Erfolg hat sein Emblem, kein Emblem ist verwaist, und alle sind quadratisch und gross genug fuer eine scharfe Praegung (aus den WebP-Kopfdaten gelesen). Gesamtbatterie: 557 gruen.

## 0.26.1
- DIE CHRONIK LIEGT DEM ADMIN OFFEN: Als Admin siehst du jede Figur und jedes Monster sofort — mit Namen, Grundzuegen und Faehigkeiten, ohne etwas freizuschalten oder umzustellen. Gemessen: Beim Spieler bleiben 45 Eintraege verhuellt, beim Admin keiner (alle 27 Figuren namentlich, dazu die Monster). Fuer Spieler bleibt die Chronik unveraendert eine Seite-fuer-Seite verdiente Sammlung.
- BEIDE GESICHTER JEDER FIGUR: Neben dem gemalten Portrait steht in der Chronik jetzt das schlichte Vektor-Zeichen — die Silhouette, die man auf dem Brett in einer Sekunde liest. Bei Figuren wie bei Monstern, 52 Zeilen, jedes Paar vollstaendig.
- ZUG-VORSCHAU IN DER FARBE IHRER ARMEE: Die Zielfelder tragen jetzt dieselbe Legierung wie Knoepfe, Kugeln und Figuren — deine Zuege als geschliffene GOLD-Perle, die eines vom Seher gelesenen Gegners in poliertem STAHL. Ein Schlagzug bleibt ein Ring, ein Schritt eine Perle: die Form sagt was, das Metall sagt wessen. Der Ring entsteht aus einem einzigen Farbverlauf mit klarer Mitte — ohne Masken, damit er auf jeder Darstellungsmaschine gleich aussieht.
- SIEBEN NEUE PRUEFUNGEN halten das fest: dass der Admin nichts verborgen sieht, der Spieler weiterhin schon, und dass Portrait und Vektor-Zeichen in jeder Zeile paarweise auftreten. Gesamtbatterie: 554 gruen.

## 0.26.0
- DAS BRETT RUHT ENDLICH IN DER MITTE — im Browser vermessen, nicht geschaetzt: Auf einem 390x844-Telefon standen 437 px Himmel ueber dem Brett und 47 px darunter. Zwei Ursachen: (1) der Brett-Rahmen richtete seinen Inhalt nach UNTEN aus, sodass aller freie Platz oben landete; (2) die Leiste oben (Zurueck + Gegnerzeile) ist hoeher als deine Zeile unten, was das Brett zusaetzlich nach unten schob. Jetzt zentriert der Rahmen, der Kopfraum wird nur noch reserviert wenn die Hoehe wirklich knapp ist, und die HUD-Hoehen werden zur Laufzeit gemessen und ausgeglichen. Ergebnis auf iPhone, Android, grossem Telefon und Tablet: 0 px Abweichung.
- ALLE FIGUREN SCHARF: Die Eroeffnung legte zwei Sekunden lang einen Weichzeichner ueber das ganze Brett, um einen unbekannten Gegner hervorzuheben — und weil ein Meister im DAMEN-Feld steht, las sich das als "nur die Dame ist scharf". Der Weichzeichner ist raus; der Fremde meldet sich weiterhin mit seinem pulsierenden Ring.
- KUGELN GROESSER: Die Wertkugeln unter jeder Figur wachsen um 17 % (Ziffern mit ihnen), die Armee-Summen von 30 auf 38 px.
- DAS FELD BEKOMMT SEINE ORDNUNG: Erbeutete Figuren liegen oben LINKS am Brett (seine Beute) und unten rechts (deine), die Gesamtwerte halten die rechten Ecken oben und unten, die Ausruestung sitzt unten links — alles mit demselben Randabstand (12 px), auch das Inspektionsblatt.
- NEUE PRUEFUNG test_layout.mjs: misst die Brettlage in echtem Chromium auf vier Geraetegroessen und faellt, wenn die Mitte um mehr als 8 px verfehlt wird. Die erste Pruefung im Projekt, die echte Geometrie misst statt Markup.

## 0.25.5
- JEDE PLATTE LEUCHTET: Unbegonnene Erfolge lagen bisher auf einem dunkleren Grund und wirkten wie abgeschaltet. Jetzt tragen ALLE Karten denselben warmen Goldgrund und denselben Schein — was erreicht ist, sagen Medaillon, Balken und Rauten, nicht mehr das Abdunkeln der halben Schatzkammer. Auch die Medaillons unbegonnener Erfolge stehen im Licht (Graustufe von 80 % auf 35 % zurueckgenommen).
- KONTUR RUNDUM GLEICH: Der goldene Saum lief als 3 px starker Balken NUR an der linken Kante — das las sich wie ein schiefer Rahmen statt wie ein Rand aus Gold. Er ist ersetzt durch eine gleichmaessige Kontur (1.5 px) mit umlaufender innerer Lichtkante.
- WARTENDE BELOHNUNG BEKOMMT RAUM: Steht eine Belohnung bereit, sitzt die Platte spuerbar grosszuegiger (19 statt 16 px Innenabstand), leuchtet kraeftiger, und der Einfordern-Knopf bricht auf eine eigene Zeile: volle Breite, eine Schriftgroesse groesser (14 statt 12) und mit echter Luft nach oben (9 px Abstand plus 13 px Innenabstand oben), damit er nie mehr am Text klebt.
- DREI NEUE WACHEN dazu: keine einseitige Kontur, keine dunkle Karte, und die Einfordern-Platte muss messbar geraeumiger sein als die uebrigen. Gesamtbatterie: 547 gruen.

## 0.25.4
- DIE KRONE HAELT IHRE PLAETZE: Koenig und Dame starten jetzt auf JEDEM Brett an derselben Stelle — Koenig auf der Mitte-Rechts-Position, seine Gemahlin links daneben (10 Felder → 5/4, 8 Felder → 4/3 wie im Schach, 6 Felder → 3/2). Ein Liga-Boss uebernimmt exakt ihr Feld. Vorher mussten die beiden nur nebeneinander stehen und konnten durch die ganze Reihe wandern; das machte jede Karte unnoetig fremd.
- IM AUFSTELLUNGS-EDITOR MITGEZOGEN: Das Koenigsfeld ist gesperrt (mit Hinweis), das Damenfeld bietet nur Dame oder Boss, und in allen anderen Feldern taucht die Krone gar nicht mehr auf. Der Boss-Bereich der Auswahl erscheint nur noch am Damenplatz.
- KEINE SACKGASSE FUER ALTE AUFSTELLUNGEN: Eine gespeicherte Reihe mit wanderndem Koenig waere unrettbar geworden (das Feld laesst sich ja nicht mehr bearbeiten) — solche Reihen fallen jetzt sauber auf die Standardaufstellung der Karte zurueck.
- SCHATZKAMMER ENDLICH LESBAR (vermessen): Die Schrift stand mit 2.9:1 auf den Goldplatten — unter dem Mindestwert selbst fuer grosse Schrift — und unbegonnene Karten liefen zusaetzlich auf 62 % Deckkraft, was den Kontrast Richtung 2:1 drueckte. Neue warme Pergamenttoene liegen bei 6.8:1 und 9.0:1, unbegonnene Karten treten jetzt ueber FARBE zurueck statt ihre eigene Schrift wegzublenden (90 % statt 62 %), Beschreibungen eine Spur groesser.
- ZWEI NEUE WACHEN: Der Kronen-Vertrag prueft auf jeder Karte, dass Koenig und Dame auf ihren festen Feldern sitzen UND dass ein Verschieben abgelehnt wird. Der Kontrast-Vertrag rechnet die WCAG-Kontraste jeder Textfarbe der Schatzkammer gegen die dunkelste Platte nach und schlaegt Alarm, bevor wieder etwas im Dunkeln verschwindet. Gesamtbatterie: 541 gruen.

## 0.25.3
- CHAMPIONS FUELLEN DAS KARTEN-POPUP: Der Bilderrahmen war 84x108 — hoeher als breit. Ein quadratisches Gemaelde wurde darin von der BREITE begrenzt und nur 84 px hoch gezeigt: ein Viertel des Rahmens blieb leer. Der Rahmen ist jetzt quadratisch und waechst mit der Panelbreite mit (96-148 px), die Figuren stehen rund 60 % groesser und fuellen die volle Hoehe.
- VERMESSEN STATT GERATEN: Ueber alle 70 Gemaelde geprueft, wie breit eine Figur bei voller Hoehenfuellung wird — Maximum 0.918 der Hoehe (ein ausladendes Monster). Ein quadratischer Rahmen fasst damit jede Figur, ohne dass etwas ueber den Namen daneben ragt.
- KUNST-VERTRAG ALS DAUERWACHE (4 Pruefungen): Die Testbatterie liest jetzt die WebP-Kopfdaten aller Gemaelde direkt von der Platte — kuenftige Bilder muessen das Seitenverhaeltnis einhalten (max 1.1) und genug Bildzeilen mitbringen (280+), sonst faellt der Test, bevor etwas im Popup ueberlaeuft oder unscharf wird. Gesamtbatterie: 534 gruen.

## 0.25.2
- MEIN FEHLER, ZURUECKGENOMMEN: Gegnerische Meister im Damen-Slot wurden seit 0.24.23 als DAME gemalt — ich hatte "treten beim Gegner in Form der Dame zum Vorschein" als Verhuellung gelesen, gemeint war der Damen-PLATZ. Jeder Champion zeigt wieder sein wahres Gesicht; genau darum tritt man ja gegen ihn an.
- STORY-WIDERSPRUECHE BEHOBEN (belegt, nicht geraten): Die Klingenschlucht kuendigte namentlich "den Zerreisser" an, schickte aber vier verschiedene Wesen ins Feld — ebenso das Geisterfeld mit dreien. Beide Texte sagen jetzt die Wahrheit. Drei Stationen nannten die FALSCHE Figur: Karawanenrast und Verborgener Schrein sprachen vom "Spaeher", obwohl der Kundschafter wartet (zwei verschiedene Figuren!), und der Schrein nannte eine "Zauberin" statt der Hexerin. Ankerbucht benennt ihren Spaeher jetzt beim Namen.
- BUBBLES AUF KARTE UND IM KAMPF-HUD: Gesamtleben und Gesamtstaerke fast doppelt so gross (30 px) und OHNE Pillen-Kontur — die Kugeln sind das Abzeichen, ein Rahmen drumherum kaempfte nur gegen ihren eigenen Rand.
- ZIFFERN OPTISCH AUSGEMITTELT (vermessen): Die Kugelgrafik sitzt mit 49.6 % / 48.2 % leicht hoch in ihrem Rahmen — jede Zahl stand darum systematisch ~1.8 % zu tief. Neue zentrale Korrektur zieht sie auf die echte Kugelmitte, auf dem Brett wie in allen Abzeichen. Zuwachs-Kugeln (+1) deutlich groesser (27 px) und mehrstellige Werte bekommen eine Stufe mehr Raum, damit "+1" sauber sitzt und lesbar bleibt.
- DIE STILLE TESTFALLE GESCHLOSSEN: Die Bildschirm-Smokes meldeten Fehler und beendeten sich trotzdem mit Erfolg — ein kaputter Screen konnte durch die ganze Batterie segeln. Sie zaehlen jetzt und brechen rot ab.
- ZWEI NEUE SUITEN, 47 PRUEFUNGEN: test_ui prueft das GERENDERTE Markup (Champion zeigt sein Portrait und ist damenformatig, beide Seiten tragen zwei Kugeln, Ziffern ein- wie zweistellig gleich gross, der Zauberstern erscheint nur bei einer noch einsetzbaren Faehigkeit und erlischt danach, nichts rendert leer). test_story prueft Erzaehlung und Gewichtung (keine Station nennt ein Monster, das die Rotation nicht liefert; keine nennt eine Figur, die sie nicht aufbietet; jede rekrutierbare Figur hat einen Weg in den Hofstaat; Tore fordern nur Erreichbares; Bauer bleibt der Schwaechste, kein Wert sprengt das Band; die Hauptstrasse zahlt nie rueckwaerts). Gesamtbatterie: 530 gruen.

## 0.25.1
- HOFREIHE ENDLICH MITTIG — GEMESSEN, GEFUNDEN, GENAGELT: Im echten Chromium vermessen (Bildmitte gegen Zellmitte, jede Figur): Bauern +0.3 px, ALLE Hofreihen-Figuren +3.9 bis +5.5 px rechts. Ursache: Der Figuren-Layer lebt im groesseren Hofreihen-Font (1.16em), wurde damit BREITER als die Zelle und klebte an ihrer linken Kante — Versatz exakt (Kasten−Zelle)/2 = 4.22 px. Der Layer spannt sich jetzt absolut auf die Zelle (inset 0), der Ueberstand zentriert sich symmetrisch. Nachmessung: alle Figuren im Bereich −0.3 bis +0.3 px (Springer +1.2 px Layout, den sein Gemaelde visuell aufhebt).
- BRETT VERTIKAL MITTIG: Das Spielfeld ruht jetzt mittig im Kampfbereich — oben wie unten gleich viel Luft.
- KUGELN FAST BERUEHREND: Der Abstand der beiden Juwelen unter jeder Figur ist auf ein Haar reduziert (4.5 % statt 14 % des Durchmessers).

## 0.25.0
- DIE GROSSE REGELWENDE, VOLLENDET UND VERSIEGELT: Energie ist restlos aus dem Spiel — jede Figur darf beliebig viele Faehigkeiten KOENNEN, aber pro Partie nur EINE ausfuehren. Der Kern trug die Regel bereits (jeder Spezialzug schreibt ins Buch der Figur, danach bleibt es zu); diese Version vollendet sie sichtbar und nagelt sie fest:
- ZWEI JUWELEN UNTER JEDER FIGUR: Blau ist der neue ANGRIFF, Rot bleibt LEBEN — gleiche Groesse, gleiche Praegeschrift wie zuvor, fuer beide Seiten. Der Drei-Kugel-Streifen ist Geschichte (Bundle traegt nur noch die zwei Kugeln als eingebettete Daten).
- DER ZAUBERSTERN: Mittig ueber den beiden Kugeln funkelt ein goldener Stern, solange die Figur noch eine EINSETZBARE Faehigkeit hat. Verfeinert: rein passive Gaben zaehlen nicht — kein Stern ohne echte Tat. Ist der eine Zauber gesprochen, erlischt er.
- REGEL-TEST VERANKERT (4 neue Pruefungen): Zwei einsetzbare Talente bieten zwei Spezialzuege; EIN Wirken schreibt ins Buch; danach ist JEDES weitere Talent versiegelt, waehrend normale Schachzuege bleiben. Gesamtbatterie jetzt 466 gruen.
- LETZTE ENERGIE-RESTE GETILGT: tote Energie-Importe und irrefuehrende Kommentare entfernt — der Begriff existiert im Spiel nicht mehr.

## 0.24.28
- DIE SCHATZKAMMER GLAENZT: Jede Erfolgs-Karte ist jetzt eine Goldplatte — warmer Goldverlauf statt flacher Panels, Goldsaum mit innerer Lichtkante, eine stille Glanz-Straehne ueber der Platte, Medaillons mit goldenem Ring und satterem Schein, ein gegossener Gold-Fortschrittsbalken mit Gluehen statt der duennen Linie, gepraegte Gold-Rauten fuer eingeloeste Stufen, Zaehler und "SO ERREICHST DU ES" in Goldschrift. Unbegonnene Erfolge liegen gedaempft im Halbdunkel — Schaetze, die noch gehoben werden wollen.

## 0.24.27
- ZUWACHS-ZAHLEN JETZT IN DEN KUGELN: "+1", "+2" usw. stehen bei Ausbau-Vorschau, Familien-Boni und Energie-Regeneration nicht mehr NEBEN der Kugel, sondern IN ihr — dieselbe Praegeschrift wie auf dem Brett, die Kugeln eine Nummer groesser (19-21 px) und der Ziffernanteil auf 62 %, damit das Plus atmet.

## 0.24.26
- SCHATZKAMMER-ABSTURZ BEHOBEN: Das Aufklappen eines Erfolgs stuerzte ab, weil evaluate() die Stufenliste (tiers) nie mit ans Item gab — das Akkordeon griff ins Leere. Jetzt reisen tiers UND die Beschreibungen mit (die waren aus demselben Grund nie sichtbar). Neuer Smoke-Fall "AchievementsScreen (open)" rendert genau diesen Pfad bei jedem Push.
- BRETT WIEDER MITTIG (MOBIL): Der Zierrahmen ragt 2.6 % ueber jede Brettkante — ohne das im Breiten-Budget einzurechnen, sprengten Brett+Rahmen den Viewport und die Seite bekam Seitwaerts-Scroll (Brett wirkte verschoben). Die Zellrechnung teilt die verfuegbare Breite jetzt durch 1.052 — Rahmen und alles bleibt drin, sauber zentriert.

## 0.24.25
- GOLDENER ZIERRAHMEN UM JEDES BRETT: Der neue Rahmen (frame1) liegt als Auflage um alle Schachbretter — vermessen auf die Leisten-Innenkante (2.5 %), sodass die Zierleiste exakt auf der Brettkante sitzt und die Filigran-Spitzen die Randfelder kuessen. Figuren, Kugeln und Auswahl stehen IM Rahmen (Schaukasten-Tiefe), ein weicher Schattenwurf hebt ihn vom Untergrund. Getrimmt und als 26-KB-WebP mit Alpha eingebunden.

## 0.24.24
- POPUP-WERTE UNTEREINANDER: Im Charakter-Blatt stehen Angriffsstärke, Lebenspunkte und Energie jetzt gestapelt wie ein Kontobuch — eine Kugel pro Zeile, der Name daneben.
- LETZTE SYMBOL-RESTE GETILGT (Restzählung: 0): Kampagnen-Boss-Vorschau (Stahl-Kugeln mit Zahl statt Herz/Schwert), Revanche-Knopf, Intro-Zeile, Tutorial-Kopfkarte 2 — alle sprechen jetzt Juwelen.
- DELTAS IMMER MIT ZAHL: Ausbau-Vorschau zeigt einheitlich Kugel gefolgt von +N (auch Lebenspunkte, vorher nacktes Herz), Familien-Boni ebenso (Kugel +N statt "+2 ♥").
- SYMBOLE AUCH AUS TEXTEN: Tutorial-Fliesstexte und Trank-Hinweis sagen "Lebenspunkte" und "Angriffsstärke" statt ♥/⚔ — eine Sprache ueberall.

## 0.24.23
- DAMEN-SLOT IN VOLLEM GLANZ: Meister im Damen-Slot leuchten jetzt EXAKT wie die Dame (eigene Seite 1.62, Gegner 1.42) — vorher hingen sie eine Lichtstufe darunter. Die Groessen waren bereits auf Damen-Format kalibriert.
- VERHUELLTE MEISTER: Fremde Sonderfiguren im Damen-Slot erscheinen dem Gegner als gewoehnliche Dame — erst der eigene Feldherr sieht, wer die Krone wirklich traegt (dasselbe Prinzip wie die Maskerade des Gambit). Bewusster Kompromiss: Das Inspektions-Blatt nennt weiterhin den echten Namen.
- DIE DAME FLANKIERT DEN KOENIG: Aufstellungen sind nur noch legal, wenn Dame (oder ihr Boss-Stellvertreter) direkt neben dem Koenig steht — das Kronenpaar trennt sich nie.
- SCHATZKAMMER MIT AKKORDEON: Jeder Erfolg klappt per Tipp auf und zeigt "SO ERREICHST DU ES" — jede Stufe mit Ziel und Belohnung (Sterne + Gold), abgehakt was erreicht ist. Der Einloesen-Knopf toggelt das Akkordeon nicht mehr versehentlich.
- LETZTE SCHWERT-SYMBOLE ERSETZT: Auch Online-Duell, Kampf-Buttons und Tutorial-Kopf sprechen jetzt die Juwelen-Sprache (JewelIc statt gekreuzter Schwerter/Herz-Icons).
- BRETT-GEMAELDE ASYNCHRON DEKODIERT: decoding="async" am Figuren-Bild — das Brett blockiert beim Aufbau nicht mehr auf Bilddekodierung.

## 0.24.22
- BUBBLES UNVERGIFTBAR — INS BUNDLE EINGEBETTET: Zweimal hat ein Deploy-Fenster eine Bild-URL mit der HTML-Ersatzseite beantwortet, und Browser-/Service-Worker-Caches hielten das Gift dauerhaft fest (Gegner zeigte nur Zahlen). Jetzt leben alle acht Kugel-Grafiken als Daten-URLs IM Bundle (generiertes Modul statAssets.js): Es gibt keine eigene Bild-URL mehr, die je wieder vergiftet werden koennte — mit jedem Build wandert alles unter neuem Namen aus.
- ZIFFERN UEBERALL EXAKT GLEICH GROSS, ein- wie zweistellig (58 % der Kugel, feste Groesse ohne Sonderstufe).
- POPUP-BEGRIFFE AUSGESCHRIEBEN: Angriffsstärke / Lebenspunkte / Energie statt STK / LEB / ENE (englisch Attack / Life / Energy), LVL -> Level.
- EINE BILDSPRACHE — KUGELN STATT SYMBOLE: Herz, Schwerter und Blitz weichen den kleinen Juwelen-Kugeln: Armeesummen im Kampf-HUD (gold fuer dich, stahl fuer den Gegner), Figuren-Inspektion, Faehigkeits-Energiekosten, Ausbau-Voransicht. Neues JewelIc fuer die nackte Kugel als Symbol.
- KARTE OHNE KAPITEL-SCHILD: Oben nur noch vor, zurueck und Weltkarte.
- POPUPS OHNE ANIMATION: Alle Dialoge erscheinen sofort (rise/fade entfernt).
- FAHRTEST VERSIONIERT: drive3.mjs lag nur im Arbeitscontainer und ging bei jedem frischen Klon verloren — jetzt fest im Repo (dist per HTTP, echter Chromium-Boot, Konsolen-Fehler = rot).

## 0.24.21
- FESTSITZENDE UPDATES LOESEN SICH JETZT SELBST: Live beobachtet — ein frisch installierter Service-Worker blieb dauerhaft im Zustand "waiting", und die Seite lieferte Reload um Reload den alten Stand ("ich lade neu und nichts aendert sich"). Der generierte Worker besitzt keinen Meldungs-Empfaenger, mit dem man ihn aktivieren koennte. Neu: Erkennt die App einen festsitzenden Worker, deregistriert sie ihn EINMALIG und laedt neu — der frische Worker uebernimmt sofort (skipWaiting + clientsClaim). Ein Sitzungs-Schutz verhindert Reload-Schleifen. Damit greifen kuenftige Deploys ohne Zutun des Spielers.

## 0.24.20
- LETZTE SCHICHT DER BUBBLE-VERGIFTUNG: Selbst OHNE Service-Worker blieb strip-steel kaputt — Chromes HTTP-Festplatten-Cache haelt Asset-Antworten als "immutable" fuer immer, und die Datei trug seit 0.24.17 denselben Namens-Hash; genau in dessen Deploy-Fenster wurde die HTML-Ersatzseite unter dieser URL eingelagert. (Die in 0.24.16 neu erzeugten Kugeln bekamen neue Hashes — deshalb funktionierten die sofort.) Loesung: beide Streifen neu kodiert -> neue Bytes -> neuer Hash -> neue URL, am vergifteten Cache vorbei. Der 0.24.18-Waechter verhindert kuenftige Vergiftungen im Service-Worker; gegen den Browser-HTTP-Cache schuetzt ab jetzt das Wissen: Nach einem Deploy-Unfall genuegt ein Re-Encode der betroffenen Datei.

## 0.24.19
- REFACTORING DER WERTUNGS-KUGELN — Kugeln gehoeren zum FELD, nicht zur Figur: Bisher hingen die Streifen am Zeichenkasten der Figur, und dessen Geometrie ist je Figur anders (Bauer 0.98em, Hoffiguren 1.16em, Drache 1.48em). Deshalb sassen sie beim Bauern richtig und rutschten bei Turm, Dame & Co. unter das Feld — und jede Groessenkorrektur verschob heimlich die Hoehe. Jetzt rendert die ZELLE die Kugeln, verankert an der Feld-Unterkante mit fester Zell-Schriftbasis: identische Groesse und identischer Sitz fuer jede Figur, buendig mit dem Feld wie beim Bauern (nur der Drache im 2x2-Feld zeichnet seine weiterhin selbst, exakt gleich gross).
- ZIFFERN NOCHMAL MINIMAL KLEINER (58 % statt 64 % der Kugel) und ZWEISTELLIGE WERTE (hochgelevelte Spielstaende: 12, 27, 46 ...) bekommen eine eigene kleinere Stufe (46 %), damit sie in der Kugel bleiben statt sie zu sprengen.

## 0.24.18
- DIE EIGENTLICHE URSACHE DER FEHLENDEN BUBBLES — GEFUNDEN UND BEHOBEN: In Chrome Schritt fuer Schritt nachgewiesen. Der Server lieferte fuer strip-steel keine Bilddatei, sondern die HTML-Startseite (6 KB, beginnend mit "<!doctype html>") — mit Status 200. Grund: Waehrend eines Deploys kann das frische JS-Bundle schon live sein, bevor die zugehoerige Bilddatei fertig hochgeladen ist; die Seite antwortet dann mit ihrer Ersatzseite. Der Service-Worker legte diese HTML-Antwort brav als Bild ab — und damit blieb die Kugel fuer diesen Besucher DAUERHAFT unsichtbar, obwohl die Datei laengst korrekt online war. Deshalb sahen alle bisherigen Pruefungen (Abruf erfolgreich!) das Problem nicht.
- SCHUTZ EINGEBAUT: Bilder wandern nicht mehr blind in den Vorrats-Cache. Sie werden erst beim Gebrauch gespeichert und NUR, wenn die Antwort wirklich ein Bild ist (Inhaltstyp-Pruefung). Eine untergeschobene HTML-Ersatzseite kann den Bild-Cache nicht mehr vergiften. Alte, bereits vergiftete Eintraege werden beim naechsten Start automatisch entsorgt.

## 0.24.17
- GEGNERISCHE (SILBERNE) BUBBLES ERSCHEINEN ENDLICH: In Chrome direkt nachgewiesen — die Datei strip-steel wurde zwar fehlerfrei geladen (Abruf ok), aber vom Browser NICHT dekodiert; CSS zeigt dann still nichts an, waehrend die Ziffern darueber sichtbar blieben. Genau derselbe Fehler wie zuvor bei den gelben und roten Hofstaat-Kugeln. Beide Streifen aus den gelieferten Vorlagen mit der reparierten Bildpipeline neu erzeugt und der Decode geprueft.
- ALLE BUBBLES GLEICH GROSS — SO KLEIN WIE BEIM BAUERN: Das Brett gibt Bauern 0.98em und allen anderen Figuren 1.16em Schriftmass (dem Drachen noch mehr); der Kugel-Streifen erbte das und wuchs bei jeder groesseren Figur um 18 %. Die Groesse rechnet dieses Mass jetzt heraus, sodass jede Figur — Bauer, Dame, Boss, Drache, Gambit — exakt dieselbe kleine Kugelgroesse traegt.
- ZIFFERN MINIMAL KLEINER UND HELLER: Fuellgrad 70 % -> 64 % der Kugel, ueberall gleich (Brett und Charakterkarten), Farbe von #F5E8C8 auf das hellere #FCF5E2, Praegeschimmer eine Spur kraeftiger.

## 0.24.16
- HOFSTAAT-KUGELN GELB & ROT: Live in Chrome nachgewiesen, dass die STK- und LEB-Kugelbilder dort mit einem Browser-Dekodierfehler scheiterten ("The source image cannot be decoded" — der HTTP-Abruf war ok, deshalb sahen alle frueheren Pruefungen sie als intakt). Alle sechs Einzel-Kugeln aus den frisch gelieferten Vorlagen neu geschnitten (Kreis exakt, WEBP q95/method6) und per libwebp-Decode verifiziert.

## 0.24.15
- CHARAKTERKARTEN-ZIFFERN WIE AUF DEM BRETT: Live in Chrome verglichen — auf dem Brett fuellt die Zahl 70 % der Kugel mit 0.018em-Haarkontur, auf den Karten nur 50 % mit dickerer 0.5px-Kontur; dadurch wirkten die Karten-Zahlen mickrig. Jetzt identische Regel ueberall: 70 % Fuellgrad, gleiche Haarkontur.
- LIVE-BEFUND (Chrome, grandgambit.win, v0.24.14): HP-Gefecht rendert 32 Streifen — 16 gold + 16 STAHL, alle Bilder laden; unterster Streifen der Grundreihe voll sichtbar; Hofstaat-Karte zeigt alle drei Kugeln in Spectral 700. Die frueher gemeldeten fehlenden Stahl-Kugeln/STK-LEB-Orbs waren der alte Service-Worker-Stand.

## 0.24.14
- BRETT NOCH ETWAS KLEINER — dafuer nichts mehr abgeschnitten: Die Hoehenrechnung reserviert jetzt fast eine Zellhoehe Kopfraum (eine ANGEWAEHLTE Figur waechst 1.58x und ragte sonst oben raus — im Test steht der Kopf der vergroesserten Dame jetzt 64 px unter der Rahmenkante) und zusaetzlich 0.3 Zellen Fussraum, damit die Wertungs-Kugeln der eigenen Grundreihe unten nicht mehr vom Rahmen verdeckt werden.
- KOORDINATEN NUR NOCH IM KLASSISCHEN SCHACH: Die Raender a–h / 1–8 erscheinen nur, wenn der Spielmodus klassisches Schach ist — in Kampagne, HP-Gefecht und allen anderen Modi sind sie weg.
- ZIFFERN-KONTUR VIEL DUENNER: Die dunkle Umrandung der Zahlen frass die Ziffer auf — von 0.05em auf 0.018em reduziert (Charakterkarten von 1 px auf 0.5 px). Die Zahl selbst bleibt in der Groesse von 0.24.12.
- ZENTRIERUNG, DRITTE ITERATION: Die Glyph-Kaesten stehen nachweislich exakt zellmittig (gemessen: max 1.7 px, Mittel 0.5 px auf 1280 px Breite) — der wahrgenommene Versatz kommt aus der Bildkomposition. Der Ausrichtungspunkt ist jetzt das MITTEL aus Masse- und Sockel-Schwerpunkt je Gemaelde (frisch vermessen fuer alle Figuren, Bosse und Gambit-Stufen), was z. B. den Springer doppelt so stark nach rechts rueckt wie die reine Sockel-Metrik.
- DESKTOP: Die Kopfleiste (SPIELEN / HOFSTAAT / ...) bleibt jetzt auch waehrend eines Kampfes sichtbar.
- CHARAKTER-POPUP: Hoehe ist jetzt zoom-fest (84dvh durch den Interface-Zoom geteilt) — es waechst am Rechner nicht mehr aus dem Bildschirm, der Inhalt scrollt.
- HINWEIS STAHL-KUGELN & STK/LEB & "Freie Figur": Im aktuellen Build nachgeprueft — die silbernen Streifen sind im Bundle verdrahtet, die Charakterkarte rendert alle drei Kugeln (Staerke/Leben/Energie) und "Freie Figur" steht als eigene Zeile unter dem Titel. Die Screenshots zeigen einen aelteren Live-Stand; nach diesem Deploy die App einmal neu laden (Service-Worker-Update).

## 0.24.13
- KARTE AUF MENUEBREITE — RICHTIG: In 0.24.10 hatte ich die Karte am Rechner faelschlich auf die Handy-Dockbreite (536) gedeckelt, wodurch sie viel zu schmal wurde. Gemeint war die Kopfleiste, die am Rechner bis 1020 laeuft. Das Kartenfenster ist jetzt exakt so breit wie die Menueleiste darueber: gemessen bei 420, 900, 1000, 1400 und 1920 px Fensterbreite jeweils 0 px Unterschied in Breite UND linker Kante. Das Gemaelde deckt den gerundeten Rahmen weiterhin randlos (Farbsonde: 0.000 % Untergrund sichtbar).

## 0.24.12
- ZIFFERN GROESSER UND LESBARER: Am gerenderten Brett nachgemessen waren die Zahlen auf dem Handy nur rund 8 px hoch. Die Ziffer fuellt die Kugel jetzt deutlich staerker (70 % statt 52 % des Durchmessers) — gemessen rund 9 px auf dem Handy und 14 px am Rechner, ohne dass die Zahl den Glasrand beruehrt.
- KEINE UEBERLAPPUNG: Der Kugel-Streifen ist exakt so breit wie ein Brettfeld (gemessen 47 px bei 47er Zelle, 64 px bei 64er Zelle). Ein erster Versuch mit groesseren Kugeln haette die Streifen benachbarter Figuren um mehrere Pixel ueberlappen lassen; deshalb bleibt der Durchmesser innerhalb der Feldbreite und nur die Ziffer waechst.

## 0.24.11
- BRETT: Die drei Wertungs-Kugeln liegen jetzt als EIN ungeteiltes Bild unter der Figur — die Kugeln behalten ihre Ueberlappung und den gemeinsamen Schatten. Die Ziffern sind an den im Gemaelde ausgemessenen Kugelmitten platziert (18.6 % / 50 % / 81.4 % der Streifenbreite, halbe Hoehe); im Pruefstand nachgemessen: hoechstens 1 px Abweichung. Fuehrt eine Figur keine Energie, zeigt sie einen schmaleren Ausschnitt desselben Streifens (erste zwei Kugeln).
- CHARAKTERKARTEN: Eigene, sauber freigestellte Einzel-Kugeln aus den dafuer gelieferten Bildern — gold fuer den Hofstaat, silbern fuer Monster und Schatten.
- SCHRIFT: Ziffern jetzt Spectral Bold 700 statt Cinzel — deutlich besser lesbar bei kleiner Groesse; weiterhin Pergamentweiss mit dunkelbrauner Haarkontur und leichtem Praegeschimmer. Cinzel entfernt.

## 0.24.10
- KARTE AUF DESKTOP: Das Kartenfenster war am Rechner so breit wie der ganze Bildschirm und ueberragte damit das Menue, zu dem es gehoert. Es sitzt jetzt auf JEDER Bildschirmgroesse exakt auf Menuebreite (wie der Dock-Balken, max 536).
- KEIN LEERRAUM MEHR IM RAHMEN: Am Rechner wurde das Gemaelde kleiner als sein gerundeter Rahmen gerechnet (Faktor 0.8), wodurch der schwarze Untergrund an den Kanten durchschien. Jetzt deckt das Bild den Rahmen auf allen Groessen randlos ab — es waechst immer mit der Kante, die mehr verlangt. Mit einer Farbsonde hinter der Karte geprueft: bei 390, 1440 und 1920 px Breite ist der Untergrund zu 0.000 % sichtbar.

## 0.24.9
- NEUE WERTUNGS-BUBBLES: Die drei Kennzahl-Kugeln unter jeder Figur (Staerke / Leben / Energie) sind jetzt gemalte Juwelen-Orbs — goldener Ring fuer den eigenen Hofstaat, stahlkalter Ring fuer den Gegner; Kern gelbgold, rubinrot und saphirblau. Einheitliche Groesse fuer alle Figuren (auch der Drache), da Wertungen einstellig bleiben (hoechste Wertung 9).
- ZIFFERN IM PRAEGE-STIL: Cinzel SemiBold in Pergamentweiss (#F5E8C8) mit hauchduenner dunkelbrauner Kontur und leichtem Praegeschimmer — lokal gebuendelt, kein Netz-Font.
- LESBARKEIT: Die angewaehlte Figur schwebt samt ihrer Bubbles jetzt ueber ALLEN anderen Reihen, damit die Wertigkeit nie verdeckt wird.
- HOFSTAAT: Die Charakterbogen-Orbs (STK/LEB) nutzen dieselben gemalten Kugeln.
- Nebenfix: playwright-core als Dev-Abhaengigkeit verankert (wurde von npm beim Font-Install entfernt und brach die Pruef-Batterie).

## 0.24.8
- ZENTRIERUNG RICHTIG GEMESSEN: Die x-Korrektur aus 0.24.7 nutzte den Masse-Schwerpunkt der Gemaelde — Staebe, Arme und Umhaenge zogen ihn zur Seite, obwohl der SOCKEL mittig sitzt; einige Figuren rutschten dadurch sogar nach links. Jetzt zaehlt die Sockelmitte (unterste 10% der Figur): neu vermessen fuer alle Figuren, Bosse, Figuren-Bosse und Gambit-Stufen — die Teller stehen damit exakt auf der Feldmitte.
- GAMBIT-FUSSLINIE: Der Held schwebte deutlich ueber den Bauern (alter y-Wert aus der Vor-Kalibrierung). Seine Fusslinie folgt jetzt derselben Formel wie Bauer und Dame und wandert mit den Stufen sauber von Bauern- zu Damen-Hoehe (eigene y-Treppe je Stufe).
- KOEPFE NICHT MEHR ABGESCHNITTEN: Das Brett reserviert in der Hoehenrechnung jetzt Kopffreiraum (~ein Drittel Zellhoehe) ueber der hintersten Reihe und richtet sich unten aus — die ueberstehenden Koepfe der 8. Reihe werden vom Zoom-Rahmen nicht mehr beschnitten (das Brett wird dafuer minimal kleiner).

## 0.24.7
- FIGUREN-FEINSCHLIFF: Bauern nochmals dunkler und matter (weniger Glanz); alle uebrigen Figuren (ausser Held) spuerbar heller — klar unter Dame und Koenig, aber deutlich ueber den Bauern. Gilt gespiegelt auch fuer die Gegner-Seite.
- RECHTS-VERSATZ BEHOBEN: Viele Gemaelde sitzen nicht exakt mittig im Bild (gemessen: Schwerpunkte von -4.1% bis +2.8% der Bildbreite, z.B. Waechter +2.8%, Barde +2.2%) — die Groessen-Skalierung schob diesen Versatz zusaetzlich nach aussen, weshalb die meisten Figuren etwas zu weit rechts standen. Jetzt traegt jedes Bild seinen gemessenen x-Versatz in den Fit-Karten (Figuren, Bosse, Figuren-Bosse, Gambit-Stufen), und der Renderer zieht den Schwerpunkt exakt auf die Feldmitte zurueck.

## 0.24.6
- GROESSEN-VOLLKALIBRIERUNG: Jedes Figuren- und Boss-Bild wurde vermessen (sichtbarer Anteil im Canvas) und auf einheitliche Ziel-Groessen gebracht: Bauer 0.867, Figuren 1.016, Koenigspaar/Bosse 1.082 (effektiv). Behebt drei Figuren-Ausreisser (Turm, Assassine, Warlock standen zu klein) und vor allem: ALLE Bosse stehen jetzt bildgenau in Damen-Groesse — Monster wie Figuren-Bosse (z.B. der Attentaeter an der Nebelfaehre, der bisher voellig unkalibriert in Normalgroesse stand). Fuss-Abstaende der Boss-Bilder werden pro Bild kompensiert, damit nichts schwebt. Gambits Stufen-Wachstum ist nun ebenfalls pro Stufen-Portrait vermessen (Bauer -> Dame ueber die Bilder t1-t6).

## 0.24.5
- MACHT-SYSTEM (Licht + Groesse): Je maechtiger eine Figur, desto heller und glaenzender. Dame nochmals heller; Bauern UND Gambit dunkler gestuft; rekrutierbare Meister (anstelle der Dame) erhalten Boss-Glanz samt Schein — auch gegnerische Bosse in der Kampagne wirken damit imposanter. Der Gambit traegt jetzt schon ab Stufe 1 einen leisen Schimmer (gold im eigenen Heer, stahlkalt beim Gegner), der ihn trotz Bauern-Dunkelheit klar heraushebt.
- GROESSEN: Gambit startet exakt in Bauern-Groesse und WAECHST mit seinen Stufen — Stufe VI steht in Damen-Groesse. Meister anstelle der Dame stehen immer in Damen-Groesse. Skalierung weiterhin vom Fusspunkt, Grundlinie bleibt exakt.
- BUGFIX (latent seit 0.22.80): OnlineScreen crashte, wenn kein Account uebergeben wurde (account.id in useEffect-Abhaengigkeit) — der Render-Smoke-Test deckte es auf; jetzt defensiv abgesichert. Ausserdem brach der Smoke-Bundler still ab (silent-Flag), wodurch vier Test-Suiten unbemerkt uebersprungen wurden — Ursache (doppelte Deklaration) behoben, alle 15 Suiten laufen wieder.

## 0.24.4
- FIGUREN: Der Koenig strahlt jetzt wie die Dame. Sein Gemaelde ist von Haus aus deutlich dunkler gemalt (gemessen: Median 32 gegen 58 bei der Dame), weshalb er mit gleichem Filter blass neben ihr stand. Seine Helligkeit ist nun so angehoben, dass beide gleichauf liegen, und er traegt den breitesten Schein von allen.

## 0.24.3
- BUGFIX HINTERGRUND: Die Halle mit dem Marmorbrett stand nicht mittig, sondern hing nach rechts aus dem Bild. Ursache: Die Zentrierung lief ueber transform: translateX(-50%), das vom CSS-zoom des App-Wurzelelements verschluckt wird (der Transform kam gar nicht an). Ersetzt durch einen negativen Rand von der halben Eigenbreite, der den Zoom uebersteht und auch dann traegt, wenn das Bild breiter als der Bildschirm ist. Am gebauten Stand gemessen: 0.0 px Abweichung bei 390, 820, 1440 und 1920 px Breite.

## 0.24.2
- FIGUREN: Rang wird sichtbar. Koenig und Koenigin tragen jetzt einen weichen Schein (warm-golden im eigenen Hofstaat, kuehl-silbrig beim Gegner) und die hellste Malerei; alle uebrigen Figuren sind eine Spur dunkler und weniger gesaettigt, damit die Krone das Auge fuehrt. Der Gambit-Held behaelt seine eigene Stufen-Aura unveraendert.

## 0.24.1
- FIGUREN: Groessen-Hierarchie auf dem Brett. Bauern etwas kleiner, alle anderen Figuren etwas groesser, Koenig und Koenigin am groessten. Umgesetzt ueber Skalierung der Figurenhoehen (vom Fusspunkt aus, daher bleibt die gemeinsame Grundlinie erhalten); der Gambit-Held und der Drache bleiben unveraendert.

## 0.24.0
- ONLINE-DUELL: Kartenwahl hinzugefuegt (Zufaellig oder eine bestimmte freigeschaltete Karte), sichtbar VOR dem Suchen inkl. Hinweis, dass deine dafuer gespeicherte Aufstellung verwendet wird. Waehrend der Suche erscheint ein Hinweis, wenn gerade niemand sonst online ist.
- BUGFIX (Worker): Die Armee eines Online-Duells wurde bisher fuer eine feste Karte (Arena bzw. erste freigeschaltete Karte) gebaut, unabhaengig davon, welche Karte das Matchmaking am Ende tatsaechlich waehlte. Jeder Spieler sendet nun pro Kandidaten-Karte eine eigene Aufstellung; der Server nutzt beim Start des Matches genau die zur gewaehlten Karte passende. Betrifft Zufallssuche, Freundes-Herausforderung und Annahme einer Herausforderung.

## 0.23.1
- BEGRIFFE: Die rekrutierbaren Kapitel-Endgegner heissen jetzt schlicht MEISTER (statt Kapitelmeister).
- ORTSNAME: Die Finalstation von Kapitel I heisst nun DIE ZITADELLE (statt der unklaren "Meisterfeste"/"Ligafeste"). Der generische Finale-Story-Text nennt keinen Ortsnamen mehr, sodass er in jedem Kapitel zum jeweiligen Ort passt.

## 0.23.0
- STORY/BEGRIFFE: Grosser Umbau der Weltsprache passend zur ueberarbeiteten Erzaehlung. Die zehn Welten heissen jetzt KAPITEL (statt Liga), die vier inneren Etappen ABSCHNITT (statt Kapitel). Der Endgegner der Reise ist OSRIC, DER GROSSMEISTER (statt Ligameister); die rekrutierbaren Welt-Endgegner heissen KAPITELMEISTER (statt Liga-Bosse).
- NAME: Die Erzfeindin heisst nun ASRA (statt Mirenn) — durchgezogen ueber Boss-Namen, Welt-Lore, Herold-Sprueche und den Ortsnamen "Asras Brunnen" (Kapitel VII).
- Betroffen: i18n (DE+EN), Boss-Namen, Ortsnamen, Herold-Texte, Welt-Lore, Item-Beschreibungen und die Landing-Page. Reine Umbenennung mit korrekter deutscher Grammatik; Spielmechanik unveraendert.

## 0.22.80
- ADMIN: Neue Nutzerliste im Online-Bereich (nur fuer Admins). Zeigt alle Nutzer, die online waren, mit Liga/Fortschritt, Spielzeit, Anzahl Spiele, Duell-Bilanz und ELO. Jeder Client spiegelt beim Verbinden dieselben Werte, die er auf dem eigenen Profil sieht, an die Hall; der Admin-Dump liefert sie gesammelt zurueck (ohne Secrets). Reine Offline-Spieler erscheinen nicht, da ihre Daten lokal auf dem Geraet bleiben.
- SICHERHEIT: Der Admin-Dump gibt keine Spieler-Secrets mehr preis (nur Name, Liga, Spielzeit, Spiele, Bilanz, Rating, zuletzt gesehen).

## 0.22.79
- ANIMATIONEN: Panels und Popups blenden jetzt sanft ein (Fade) statt herein- oder hochzugleiten. Die rise-Animation zieht nichts mehr hoch, und das Kampagnen-Panel gleitet nicht mehr seitlich mit der Kamera mit.
- HOFSTAAT: Die Figurenbilder werden vorgeladen und erscheinen gemeinsam mit den Kacheln (kurzer Ladespinner beim ersten Oeffnen), statt dass leere Kacheln sich erst danach fuellen.

## 0.22.78
- DRACHE vereinfacht und intuitiver: Er zieht ein Feld orthogonal (vorwaerts, seitlich oder zurueck) und darf dabei schlagen, was unter seiner Vorderkante steht. Zuvor konnte er zu Fuss gar nicht schlagen. Die Trampel-Aura (Nachbar-Gegner nahmen automatisch Schaden) wurde ersatzlos entfernt. Der einmalige Flug pro Partie bleibt unveraendert. Beschreibungstext im Hofstaat angepasst.

## 0.22.77
- FIGUREN-RENDERING: Systematischen Rechts-Versatz aller Hoffiguren behoben. Ursache war die Feld-Zentrierung per CSS-Grid, die eine Figur groesser als ihr Feld nicht symmetrisch zentriert (~4-5px nach rechts wandernd); auf Flexbox umgestellt -> jetzt exakt mittig (am echten Brett verifiziert: Schnitt -0.4px statt +4.6px). Bauern waren nie betroffen (kleiner als das Feld).
- Turm minimal verkleinert, jetzt auf Groesse der uebrigen Hoffiguren.
- Drache waechst beim Anwaehlen nicht mehr, sondern behaelt seine Groesse; angewaehlt werden nur die moeglichen Zug-Felder gezeigt.

## 0.22.76
- FIGUREN-RENDERING: Alle Figuren einheitlich etwas hoeher gesetzt (gemeinsame Grundlinie und Bauern gleichmaessig um denselben Betrag angehoben), sodass sie mittiger im Feld sitzen. Groessen und horizontale Zentrierung unveraendert.

## 0.22.75
- FIGUREN-RENDERING: Die Spielfiguren stehen jetzt einheitlich gross und auf einer gemeinsamen Grundlinie mit etwas Luft darunter. Die fruehere Sockelbreiten-Normierung hatte breite Figuren (Turm, Magier u.a.) zu stark verkleinert und die uebrigen unterschiedlich hoch sitzen lassen. Ersetzt durch eine Box-Anpassung: einheitliche Figurhoehe (sehr breite Figuren werden nur sanft in der Breite begrenzt) plus Grundlinien-Ausrichtung. Bauern, Grand Gambit und Drache behalten bewusst ihre eigene Groesse.

## 0.22.74
- KAMPAGNENKARTE: Tippen auf den Grand Gambit oeffnet jetzt das Level-Panel der aktuellen Station ("Herausforderung starten"), statt zum Faehigkeitenbaum zu springen. Dadurch laesst sich das Panel nach dem Schliessen jederzeit wieder oeffnen und das Level erneut starten. Die alte Rang-Box mit dem Faehigkeitenbaum-Sprung wurde entfernt (der Faehigkeitenbaum bleibt ueber den Hofstaat erreichbar).

## 0.22.73
- LANDING-SEITE deutlich ausgebaut: Spielmodi (klassisches Schach ODER das RPG; gegen die KI, zu zweit an einem Geraet, oder online), eine Figuren-Chronik mit vier Helden (Bild, Flavor-Text und Faehigkeiten), ein geformtes Liga-Brett mit gesperrten Feldern und ein stilisiertes Weltkarten-Diagramm der Kampagne (drei Pfade laufen zum Ligameister zusammen). Durchgehende Hallen-Atmosphaere, die auch unter dem letzten Container mit Abstand wieder sichtbar wird. Der Hinweis "im Browser" wurde aus der Kopfzeile entfernt. Vier verkleinerte Figurenbilder unter public/pieces.

## 0.22.72
- FIGUREN-SOCKEL VEREINHEITLICHT: Jede gemalte Figur fuellt ihr 1024er Quadrat anders aus, darum kamen die Fuesse (die Standflaeche auf dem Feld) bei gleicher Schriftgroesse unterschiedlich breit heraus - der Turm wirkte viel groesser. Aus den Bildern vermessene Pro-Figur-Faktoren (paintedScaleFor) skalieren nun jede Figur so, dass alle Sockel gleich breit stehen (Turm/Dame/Koenig/Waechter kleiner, schlanke Figuren groesser); der Bauer bleibt ueber seine kleinere Schriftgroesse kleiner, der Gambit wird bewusst etwas kleiner, der Drache (2x2) etwas groesser. Skalierung am Fuss verankert, damit die Figur auf dem Feld stehen bleibt.

## 0.22.71
- OEFFENTLICHE STARTSEITE (landing.html) fuer das Google-Login-Branding: Google verlangt, dass die im OAuth-Zustimmungsbildschirm angegebene Startseite OHNE Anmeldung erklaert, was die App ist - die App-Wurzel zeigt aber den Login-Screen. Neue oeffentliche Landing-Seite im Spiel-Stil (dunkle Halle, GG-Wappen, Feature-Uebersicht, "Jetzt spielen"-Button zur App, Hinweis zum optionalen Konto, Links zu Datenschutz + Nutzungsbedingungen). Im Google-Branding als Startseite eintragen: https://grandgambit.win/landing.html

## 0.22.70
- ZUG-ANIMATION SAUBER REFACTORED: die ziehende Figur wird jetzt als EIN Objekt animiert, das pixelgenau der Figur entspricht, die danach im Feld steht (gleicher Versatz, gleiche Groesse). Frueher glitt ein mittig sitzender, kleinerer Ghost und wurde beim Landen durch die echte, hoehere + groessere Figur ersetzt - das war das "zieht zu weit, springt dann zurecht". Die Figur sitzt nun auf ihrem ZIELFELD und gleitet per Transform vom Start auf translate(0,0) = exakt das Feld; per DOM-Messung als pixelgenau verifiziert (Delta 0)
- SPRINGEN/HUEPFEN: Pferd & Co. landen jetzt exakt statt daneben und werden nicht mehr nachtraeglich zurechtgerueckt; eigener Sprung minimal laenger fuer ein volleres Sprunggefuehl
- RAUSFLIEGENDE FIGUREN endlich sichtbar: der Todesflug wurde nie ausgeloest, weil er auf lethal (nur HP-Modus) statt auf capture pruefte - im normalen Schach ist lethal=false. Er fliegt jetzt bei jedem Schlag; die geschlagene Figur bleibt stehen, bis der Angreifer ankommt, und wird dann zur Ablage geschleudert
- ALLE FIGUREN ETWAS GROESSER
- GEGNER: 1 Sekunde Pause vor seinem Zug (statt 260ms) - kein hektischer Sofort-Zug mehr
- KAMPAGNENKARTE: der blaue Himmel hinter den Wolken ist jetzt komplett transparent (kein Blau mehr), Wolken-Animation ~30% langsamer

## 0.22.69
- FAVICON UEBERALL ERNEUERT: das neue runde GG-Wappen liegt jetzt konsistent als Browser-Tab-Icon (favicon.ico + PNG 16/32/192), Apple-Touch-Icon, PWA-Icon (192/512) und maskable-Icon (mit gefuellter Safe-Zone) vor; index.html und PWA-Manifest darauf umgestellt
- DATENSCHUTZERKLAERUNG EU-KONFORM UEBERARBEITET: konkrete Aufsichtsbehoerde (LfDI Baden-Wuerttemberg), Drittlanduebermittlung mit Rechtsgrundlage (EU-SCC/DPF), jsDelivr-CDN der Login-Bibliothek, Speicherdauern, Abschnitt Minderjaehrige (Art. 8 DSGVO), kein Profiling (Art. 22), Widerspruchsrecht (Art. 21); bewusst KEIN Verweis auf die zum 20.7.2025 abgeschaltete EU-ODR-Plattform (waere abmahngefaehrlich)
- NUTZUNGSBEDINGUNGEN NEU (terms.html): kostenloser Dienst, Pflichten/verbotene Nutzung (Cheaten, Bots, rechtswidrige Namen), Rechte am Spiel, dreistufige Haftungsklausel nach deutschem Recht (Vorsatz/grobe Fahrlaessigkeit und Leben/Koerper/Gesundheit unbeschraenkt, einfache Fahrlaessigkeit nur Kardinalpflicht), deutsches Recht, § 36 VSBG; im Footer und in der Datenschutzseite verlinkt
- Hinweis: keine anwaltliche Pruefung - solide DSGVO-orientierte Grundlage, fuer volle Rechtssicherheit fachliche Pruefung empfohlen

## 0.22.68
- FEHLERBERICHTE ZUM DIREKTEN KOPIEREN: unter Profil -> Fehlerberichte gibt es jetzt "Alle kopieren" (kopiert saemtliche geladenen Berichte als lesbaren Text, durch Trennlinien getrennt - zum direkten Einfuegen hier im Chat) sowie einen "Kopieren"-Knopf an jedem einzelnen aufgeklappten Bericht. Der kopierte Text enthaelt Zeit, Version, Art, Konto, URL, Geraet, Meldung, Notiz, Stacktrace und die letzten Ereignisse - alles, was fuer eine Fehlersuche gebraucht wird, in einem Block

## 0.22.67
- KEIN AUFBLINZELN MEHR AM ZUGENDE: die Uebergabe von der Zug-Animation zur echten Figur ist jetzt unsichtbar. Ursache war, dass die animierte Figur nach der Landung noch schraeg gekippt (und mit Schatten) stehen blieb und erst spaeter gegen die aufrechte echte Figur getauscht wurde - dieser Sprung war das Blinzeln. Jetzt richtet sich die Neigung schon VOR der Landung wieder auf, der Schatten blendet mit aus, und der Tausch passiert im Moment der Landung, wenn beide pixelgleich sind
- SPRUNG-ZUEGE (Springer und alle Figuren mit Sprung-Bewegung): deutlich hoeherer Bogen (ueber eine ganze Feldhoehe), langsamer in der Luft, und die Figur bleibt dabei komplett aufrecht - keine Schraegstellung beim Huepfen. Der Schatten unter der Figur vertieft sich am Scheitel
- Gleit-Zuege neigen sich weiterhin in Laufrichtung, aber nur MITTEN im Zug - zur Landung hin stehen sie wieder gerade
- CHARAKTERKARTE: das Portrait sitzt jetzt vertikal mittig in seiner Kachel und fuellt sie maximal aus (vorher klebte die Figur am unteren Rand)

## 0.22.66
- BUBBLES OHNE GLANZ: der weisse Glanzpunkt ist aus allen Stat-Bubbles entfernt (Staerke/Leben/Energie) - durchgaengig im Spiel wie auf den Charakterkarten. Die Farbe fuellt die Kugel jetzt satt, nur die Kante dunkelt fuer die Rundung nach
- CHARAKTERKARTE, TEXTREIHENFOLGE: der Flavor-Text (in der Serifenschrift, kursiv) steht jetzt direkt unter dem Namen - noch VOR den Stats, nicht mehr danach. Dazwischen bleibt die kleine Zeile mit Name der Zugehoerigkeit (Freie Figur, Kronenfigur bzw. das Haus). Reihenfolge also: Name, Zugehoerigkeit, Flavor, dann die Werte

## 0.22.65
- GESCHLAGENE FIGUR LANDET EXAKT IN DER ABLAGE: statt nur grob vom Brett zu fliegen, dreht sich die geschlagene Figur jetzt heraus und landet PRAEZISE auf dem Ablage-Feld, das sie danach anzeigt - beim Gegner oben rechts, bei mir unten rechts. Die echte Bildschirmposition der Ablage wird im Flugmoment gemessen, also stimmt das Ziel in Hoch- und Querformat und egal aus welcher Perspektive gespielt wird
- SPRINGER HUEPFT WIRKLICH: ein Sprung ist jetzt ein echter Bogen - die Figur springt hoch, wird am Scheitel eine Spur groesser (als kaeme sie dem Auge naeher) und landet wieder, statt nur ueber das Brett zu gleiten
- alle uebrigen Zuege gleiten weiterhin leicht schraeg gekippt wie ein schreitender Wanderer

## 0.22.64
- CHARAKTERKARTEN ALS STECKBRIEF: die Detailkarte einer Figur ist neu aufgebaut wie ein Wanted-Poster-Dossier. Portrait links in gerahmter Platte, Name und Haus-Zeile (mit Familien-Raute) oben, daneben die DREI SPIEL-BUBBLES (dieselben Kugeln wie im Kampf) fuer Staerke/Leben/Energie zur sofortigen Wiedererkennung, darunter Ledger-Zeilen (Stufe, Faehigkeiten) im Steckbrief-Rhythmus
- FAEHIGKEITEN ALS AKKORDEON: jede Faehigkeit ist eine aufklappbare Zeile. Schon EINGEKLAPPT sichtbar sind Icon, Name, Typ-Badge (Bewegung/Angriff/Fernkampf/passiv...) und die Kosten (Energie-Pips, oder "passiv" wenn kostenlos). Antippen klappt Beschreibung, Zug-Diagramm und Erlernen-Knopf auf. Weit entfernte Talente bleiben "noch verhuellt"
- Upgrade-Box verschlankt: keine doppelten Stats mehr, nur der Fortschritt Stufe->Stufe+1 mit den Zuwaechsen und der Verbessern-Knopf

## 0.22.63
- GEGNER-ZUG STARTET ENDLICH AM RICHTIGEN FELD: der Gegner-Ghost begann seine Bewegung faelschlich dort, wo MEINE Figur zuletzt hinzog. Ursache: bei zwei schnellen Zuegen in derselben Millisekunde bekam die Animation dieselbe Kennung, React verwendete das alte Element wieder und die Figur glitt von der alten Zielposition herein. Jetzt bekommt jeder Zug eine streng fortlaufende Kennung UND die Gleit-Animation ist im Startmoment abgeschaltet - die Figur wird am FROM-Feld gesetzt und gleitet erst dann sauber zum Ziel
- ALLE Figuren ziehen leicht schraeg gekippt (nicht nur der Gegner) - auch gerade Zuege bekommen eine leichte Neigung, wie ein schreitender Wanderer
- GESCHLAGENE FIGUR: ausdrucksstaerkerer Flug zur Ablage (klarer Bogen, mehr Drehung, sauberes Verblassen) - nach oben zur Gegner-Ablage wenn ich schlage, nach unten zu meiner wenn der Gegner schlaegt
- NICHTS ist per Rechtsklick/Markieren/Ziehen speicherbar (verstaerkt: selectstart blockiert, jedes Bild draggable=false, auch spaet geladene) - Ausnahme bleiben Eingabefelder (Name, Passwort), wo Kopieren/Einfuegen funktioniert

## 0.22.62
- HIMMEL UEBER DER KARTE: hinter den Wolken liegt jetzt ein Himmel in der Stimmung der Welt - blauer Himmel mit Sonne in den gruenen Welten, kuehler im Herbst/Winter, duestere Lila- und Glut-Toene in den tiefen Welten. Durch die Luecken der ziehenden Wolken schimmert dieser Himmel durch
- WOLKEN STAERKER ANIMIERT: die Wolken ziehen jetzt weiter und sichtbarer ueber den Himmel (mehrere Ebenen in unterschiedlichem Tempo), luftiger, sodass mehr Himmel durchscheint
- META/SEO: Titel und Beschreibung geschaerft (Das Schach-RPG - Schach auf einem neuen Level), Ladehinweis entschlackt (kein Browser-Hinweis mehr)

## 0.22.61
- GEGNER-ZUG-ANIMATION: CLIP-FEHLER BEHOBEN + LANGSAMER
  - Der Gegner-Zug klippte manchmal (die Figur erschien kurz an der falschen Stelle - etwa auf meiner Figur - und sprang dann). Ursache war ein Timing-Fenster, in dem die echte Figur schon am Zielfeld stand, bevor die Gleit-Animation begann. Die Animation wird jetzt VOR dem Bildaufbau scharf gestellt (useLayoutEffect) und der Startpunkt garantiert zuerst gezeichnet - die Figur gleitet jetzt sauber von ihrem Feld los
  - Gegnerzuege sind jetzt DEUTLICH langsamer animiert (0,9s statt 0,66s), eigene Zuege minimal ruhiger (0,52s) - der Gegnerzug ist klar nachvollziehbar

## 0.22.60
- KARTE UNTEN WIEDER GESCHLOSSEN: die Karte fuellt das Fenster jetzt wieder voll und ist unten buendig - die runde untere Kante ist sauber geschlossen (vorher fehlte dort ein Stueck, weil die Karte nach unten verschoben war)
- SCHACHBRETT-HINTERGRUND WEG: der Kartenhintergrund ist jetzt reines Schwarz - kein durchschimmerndes Muster mehr am Rand
- WOLKEN AM KARTENKOPF UEBERARBEITET: drei Ebenen ziehen jetzt sichtbar und in unterschiedlichem Tempo (rollen + atmen wie echtes Wetter). Oben ist es nicht mehr flaechig weiss - dunklere Stellen der Karte schimmern zwischen den Wolken durch, wie am Himmel. Der untere Rand des Nebels laeuft ueber eine lange weiche Maske aus, keine harte Kante mehr

## 0.22.59
- ELO-EINSCHAETZUNG BEIM KAMPAGNEN-SCHWIERIGKEITSGRAD: unter Sanft/Normal/Hart steht jetzt eine grobe Einordnung der Gegnerstaerke - Sanft etwa Anfaenger (grob 600-900 Elo), Normal etwa Gelegenheitsspieler (grob 1000-1300), Hart etwa Vereinsspieler (grob 1400-1700). Die Angabe ist bewusst grob, da die Kampagne kein reines Schach ist (Faehigkeiten, Level, Lebenspunkte spielen mit)

## 0.22.58
- WOLKENKOPF KORRIGIERT: der Wolkenbereich reichte zu weit in die Karte und hatte unten eine harte Kante. Er ist jetzt deutlich niedriger und der GANZE Kopf wird nach unten weich ausgeblendet (per Maske) - die Wolken loesen sich sanft in die Karte auf, keine harte Kante mehr. Die Karte rueckt entsprechend weniger tief nach unten

## 0.22.57
- ZIEHENDE WOLKEN UEBER DEM KARTENKOPF: der weiche obere Bereich der Karte bekommt jetzt langsam ziehende Wolken/Rauch (zwei Ebenen in unterschiedlichem Tempo, sanft atmend) - in den Farben der jeweiligen Welt. Die Helligkeit folgt der Reise: Grasland hell, SOMMER fast weiss, danach Herbst/Winter/Hochgebirge duenner und die tiefen Welten (Oedland, Canyon) dunkel und schwer. Der alte statische Nebel oben wurde durch die Wolken ersetzt

## 0.22.56
- WEICHER KARTENKOPF IN EIGENER FARBE: die gemalte Karte sitzt jetzt etwas tiefer im Fenster, und der obere Bereich wird von einem sanften Verlauf gefuellt, der aus der Karte SELBST stammt (ihre obere Kante, vergroessert und weich verwischt) - der Uebergang traegt also genau die Farben der jeweiligen Welt. Die oben schwebenden Knoepfe (Atlas, Liga-Navigation) liegen jetzt in diesem weichen Kopf statt hart auf der Karte; der obere Kartenrand blendet zusaetzlich weich ein, sodass keine harte Kante bleibt

## 0.22.55
- KARTE IM FENSTER FEINER: die Rahmen-Kontur ist duenner (3 statt 5 Pixel), und die Karte selbst wird eine Stufe kleiner im Fenster gezeichnet - dadurch wirkt sie auf hochaufloesenden Handys SCHAERFER (die Unschaerfe kam vom Hochskalieren der gemalten Welt). Wegpunkte und Wanderer skalieren mit. Der schmale Rand, der so entsteht, wird von einem weichen Verlauf (Vignette) nach aussen ins Dunkle gefuehrt

## 0.22.54
- ZUG-ANIMATION GRUNDLEGEND UEBERARBEITET:
  - RUCKELN BEHOBEN: eine doppelte CSS-Transition an der Figur liess sie nach dem Zug nochmal zucken - jetzt eine saubere kombinierte Transition, die ankommende Figur blendet sanft ein statt hart aufzupoppen
  - FIGUREN NEIGEN SICH BEIM ZIEHEN: wie der Wanderer auf der Karte lehnt sich die gleitende Figur leicht in die Laufrichtung (nach rechts beim Zug nach rechts, nach links andersrum)
  - SPRINGER UND UEBERSPRINGENDE ZUEGE HUEPFEN: das Pferd (und jeder nicht-gerade/nicht-diagonale Sprung) macht jetzt einen echten Huepfer im Bogen statt zu gleiten
  - GESCHLAGENE FIGUREN FLIEGEN ZUR RICHTIGEN ABLAGE: rotierend raus - nach OBEN zur Gegner-Ablage, wenn ich schlage, nach UNTEN zu meiner Ablage, wenn der Gegner mich schlaegt (dorthin, wo man die Figur danach als Symbol sieht)
  - ANIMATION INSGESAMT ETWAS LANGSAMer und ruhiger, beim Gegner wie bei mir

## 0.22.53
- GEGNERZUEGE DEUTLICH LANGSAMER ANIMIERT: wenn der Gegner (KI oder online) am Zug ist, gleitet seine Figur jetzt spuerbar langsamer ueber das Brett (rund doppelt so lang wie ein eigener Zug) - so siehst du bewusst, welchen Zug er macht, statt dass er blitzschnell passiert. Eigene Zuege bleiben flott. Im Zwei-Spieler-Modus an einem Geraet bleibt alles gleich schnell (beide Seiten bist du)

## 0.22.52
- SIEG-POPUP LIEGT JETZT UEBER ALLEM: das Ergebnis-Banner (Geschafft/Verloren mit Belohnungen) wurde bisher IM zoombaren Brett-Container gezeichnet und lag dadurch hinter Figuren und Overlays. Es wird jetzt ganz oben im Bildschirm als festes Overlay (position fixed, hoechste Ebene) gerendert - immer klar ueber allen Figuren
- SCHWIERIGKEIT DER KAMPAGNE EINSTELLBAR: unter Profil gibt es jetzt den Regler Schwierigkeit der Kampagne (Sanft / Normal / Hart), jederzeit aenderbar. Sanft macht jede Station eine Stufe leichter, Hart eine Stufe schwerer - das verschiebt Gegner-Level UND KI-Suchtiefe pro Station relativ zu ihrer vorgesehenen Staerke

## 0.22.51
- FEHLERBERICHTE LAUFEN JETZT UEBER DIE ONLINE-HALLE: statt E-Mail oder nur lokal werden Berichte im bestehenden Multiplayer-Worker gesammelt (POST /report offen fuer alle, GET /reports nur mit Admin-Token). Im Admin-Profil traegst du einmal das Token ein und siehst dann die Berichte ALLER Nutzer geraeteuebergreifend - ohne neue Infrastruktur, kein Supabase noetig. Einrichtung: worker deployen + ADMIN_TOKEN setzen (Anleitung in REPORTS-SETUP.md)
- Absturzberichte werden weiterhin automatisch vermerkt und an die Halle gesendet (auch nach einem Absturz dank keepalive)

## 0.22.50
- SAFARI OEFFNET WIEDER: aeltere iOS-Safari-Versionen (vor 15.4) kennen structuredClone nicht - eine einzige fehlende Funktion lie? die ganze App dort nicht starten (weisser Bildschirm). Ein kleiner Ersatz fuellt die Luecke, sodass die App auf jedem Geraet bootet. Zusaetzlich sind die neuen Bild- und Fehler-Bausteine rundum abgesichert, damit kein Browser-Eigenheit den Start blockiert
- FEHLERBERICHTE IM ADMIN-BEREICH STATT PER MAIL: Absturz- und Fehlerberichte gehen nicht mehr an eine E-Mail, sondern werden in der App gesammelt - im Admin-Profil gibt es jetzt den Bereich Fehlerberichte, der sie auflistet (aufklappbar mit Zeit, Geraet, Meldung, Stacktrace und den letzten Fehlern). Mit eingerichteter Cloud (Supabase-Tabelle error_reports, Anleitung in SUPABASE-REPORTS.md) siehst du die Berichte ALLER Nutzer zentral; ohne Cloud die dieses Geraets
- Der Absturz-Bildschirm vermerkt einen Fehler jetzt automatisch (kein Knopfdruck noetig) und bietet weiterhin Neu laden

## 0.22.49
- APP-INSTALLATION AUF DEM IPHONE ERKLAERT SICH SELBST: Safari kennt keinen Installations-Knopf - der einzige Weg ist Teilen -> Zum Home-Bildschirm. Auf iPhone/iPad zeigt der Profil-Bereich Als App jetzt direkt die Schritt-fuer-Schritt-Anleitung statt eines Knopfs, der dort nichts tun kann; zudem zeigt das Home-Icon jetzt auf das echte 180er Apple-Touch-Icon
- JEDES BILD KOMMT MIT EINEM KLEINEN AUFTRITT: Bilder, die noch laden muessen, blenden sanft ein (kurzes Aufsteigen); bereits geladene erscheinen sofort - kein Flackern mitten im Gefecht, kaputte Bilder bleiben nie unsichtbar
- SCHWARZE BOX + FEHLERBERICHT AN DEN SUPPORT: Laufzeitfehler landen in einem kleinen Ringpuffer; stuerzt die App ab, bietet der Absturz-Bildschirm neben Neu laden jetzt Bericht an Support senden (oeffnet die Mail-App mit Version, Browser, Zeit, Absturz und den letzten Fehlern vorausgefuellt) und Bericht kopieren

## 0.22.48
- ABMELDEN JETZT UNUMSTOESSLICH: der Abmelde-Knopf (Profil und Spielstand-Auswahl) faehrt jetzt einen harten, deterministischen Pfad - Login erscheint sofort, lokale Sitzung wird geloescht, die Cloud-Abmeldung bekommt ein kurzes Zeitfenster (damit kein Wiederherstellen nach dem Neuladen das Konto zurueckholt), dann startet die App sauber neu am Anmeldebildschirm. Kein React-Zustand, Cache oder Listener kann das mehr rueckgaengig machen - auf jedem Browser

## 0.22.47
- ABMELDEN IN SAFARI REPARIERT: der Abmelden-Knopf im Profil lag unter dem schwebenden Menue-Dock - in Safari (Home-Balken-Reserve) hat das Dock den Tipp geschluckt. Der Scrollbereich reserviert jetzt Dock-Hoehe plus Safe-Area, sodass die letzten Knoepfe immer frei liegen. Zusaetzlich meldet der Knopf jetzt SOFORT ab (lokal), waehrend Cloud-Abmeldung und Aufraeumen im Hintergrund folgen - ein haengender Netzwerk-Aufruf kann den Knopf nicht mehr tot wirken lassen

## 0.22.46
- KARTE ALS GERAHMTES GEMAELDE: das Kartenfenster ist auf dem Handy jetzt exakt so breit wie das Menue darunter (gleiches Raster, 536er-Cap) mit spuerbar mehr Luft zum Menue; die Welt darin zeigt sich eine Stufe kleiner (Fit aufs Fenster statt auf den Bildschirm) - Wegpunkte und Wanderer skalieren automatisch mit; um das Fenster laeuft ein Rahmen im Randton der jeweiligen Liga mit leichtem Verlauf ins Dunkle
- BUBBLES MITTIG UNTER DER FIGUR: die drei Stat-Kugeln stehen jetzt als eine zentrierte Reihe unter der Figur - Staerke, Leben, Energie (statt L-Form unten links); die Farbe fuellt die Kugel deutlich satter, der weisse Glanz ist nur noch ein kleiner Lichtpunkt (~1 Prozent der Flaeche)

## 0.22.45
- KLASSIK BEHERRSCHT DAS REICH: die Karten-Verteilung der Kampagne ist umgebaut - das 8x8-Feld traegt jetzt 75 Prozent aller Stationen (Klassik allein 19 von 51 und damit groesste Einzelgruppe, dazu Schneise 12 und Hof 7); die weite Arena und das enge Scharmuetzel ueberleben nur auf ihren Signatur-Stationen (Ligameister, Finale, wenige markante Orte)
- RUECKBLICK IST JETZT SPIELBAR: in bereits gemeisterten Ligen (Pfeile auf der Karte) laesst sich jede Station antippen und als FREUNDSCHAFTSKAMPF der alten Liga erneut spielen - Gegner, Karte und Boss skalieren auf die damalige Liga, kein Fortschritt/keine Rekrutierung/kein Zeitdruck, nur die Ehre (und etwas Freundschafts-XP). Kuenftige Ligen bleiben verschlossen
- JEDE LIGA ERZAEHLT EIGENE KAPITEL: die vier Kapitel-Banner oben tragen jetzt pro Welt eigene Titel (Sommer, Herbst, Winter, Hochgebirge, Oedland, Steppe, Canyon, Wueste, Meer) statt immer derselben vier Namen
- 5 neue Regressionstests (8x8-Mehrheit, Klassik groesste Gruppe, Rueckblick friendly/alte Skalierung/keine Rekrutierung)

## 0.22.44
- DRACHE KANN ENDLICH VORWAERTS: der Schritt nach vorne landet auf einem Feld, das sein eigener 2x2-Block gerade ueberdeckt (ein Fluegel-Feld) - bisher wurde ein Tipp darauf als "Drache erneut antippen" gedeutet und der Zug verworfen. Jetzt gewinnt ein gueltiges Zugziel vor der Fluegel-Umleitung, und das grosse Drachenbild laesst bei Auswahl Tipps auf die Zielfelder darunter durch. Er wandert jetzt sichtbar Feld fuer Feld
- 3 neue Regressionstests (Vorwaerts-Feld ist Fluegel, Zug ist legal, Drache rueckt eine Reihe vor)

## 0.22.43
- DOPPELTE KRAEFTE-ANZEIGE ENTFERNT: die bunte DU/GEGNER-Leiste mit Leben und Energie direkt ueber dem Brett ist raus - die Kraefte stehen weiterhin in den Kopf- und Fussleisten (Herz + Staerke je Seite), also keine Dopplung mehr
- KAMPAGNEN-SMOKE-TEST: neuer Regressionstest spielt JEDEN der 51 Kampagnen-Knoten ueber 5 Startwerte voll durch (ueber 25000 Zuege) inklusive Belohnungs-Auswertung und prueft, dass jedes Drachen-Level seinen 2x2-Block korrekt entfaltet - faengt Zug- und Aufbau-Abstuerze auf Engine-Ebene ab und laeuft ab jetzt bei jedem npm test mit

## 0.22.42
- STAT-BUBBLES GROESSER UND TIEFER: die drei Kugeln (Leben, Staerke, Energie) sind rund 30 Prozent groesser und sitzen weiter unten an der Figur (die L-Form ragt jetzt leicht unter das Feld) - die Zahlen sind dadurch deutlich besser lesbar; der Leben-Orb misst rund 42 Prozent der Feldbreite statt vorher ~30

## 0.22.41
- GRAND GAMBIT VERDIENT MUTIG: der Kommandant bekommt jetzt Bonus-Erfahrung, wenn ER selbst eine Figur schlaegt (+8) und wenn er das ganze Gefecht auf dem Brett uebersteht (+14) - das belohnt einen kuehnen, stets anwesenden Anfuehrer; Schlag-Herkunft und Opfer laufen dafuer durch die Event-Kette (byHero/hitHero)
- ONBOARDING IN DREI STUFEN: neue einmalige Erklaerungs-Popups entlang des Fortschritts - (1) wie man aufstellt, sobald die erste Zusatzfigur freigespielt ist; (2) die Gambit-Bonus-XP-Mechanik nach dem 2. gewonnenen Kampf; (3) dass der Gambit ab dem 3. Kampf seine Spalte selbst waehlen darf. Erscheinen nur zwischen Kaempfen, nie ueber einem laufenden Spiel, je genau einmal
- Das Sieg-Banner (Errungenschaften, neue Faehigkeiten, Erfahrung, Skillpunkte, Story) bleibt wie gehabt am Spielende
- 2 neue Regressionstests (Gambit-Ueberlebensbonus, heroSurvived im Summary)

## 0.22.40
- FIGUREN ZIEHEN UND FALLEN ANIMIERT: Zuege werden jetzt fuer BEIDE Armeen animiert - die Figur gleitet sichtbar von ihrem Feld zum Ziel (mit Kometenschweif), nicht nur der Gegner wie bisher
- TODESFLUG: schlaegt man eine Figur und sie stirbt, wirbelt sie mit vielen Rotationen aus dem Spielfeld - im Flug wird sie immer kleiner und segelt zur Beute-Seite des Siegers (Endposition ausserhalb des Bretts)
- UEBERLEBTER TREFFER: ueberlebt die getroffene Figur, wackelt sie kurz und bleibt stehen, waehrend die angreifende Figur genau den Weg zurueckgleitet, den sie gekommen ist (Prellzug)

## 0.22.39
- AUFSTELLUNG WIRD JETZT IM KAMPF UEBERNOMMEN: in fruehen Ligen biegt das Spiel jeden Kampf auf das 8x8-Klassik-Feld um, auch wenn der Knoten eine andere Karte vorsieht - dadurch wurde die gespeicherte Aufstellung unter der falschen Karte gesucht und still verworfen. Jetzt greift, wenn fuer das genaue Kampffeld keine eigene Aufstellung vorliegt, eine gespeicherte Aufstellung von einem gleich grossen Feld (gleiche Slot-Zahl), sofern sie hier legal ist; die exakte Karte hat weiter Vorrang. End-to-End geprueft: Turm-gegen-Springer-Tausch erscheint auf dem Brett (1 Turm, 3 Springer statt 2/2)
- 2 neue Regressionstests (Aufstellung uebertraegt sich aufs umgebogene Feld; exakte Karte gewinnt)

## 0.22.38
- BUBBLES MIT GLANZ: die Stat-Kugeln haben oben jetzt einen weissen Glanzpunkt statt der durchsichtigen Stelle - die Zahl liest sich besser; die schwarze Kontur ist deutlich duenner (nur noch ein zarter unterer Rand statt Vollring)
- VEKTOR-ZWILLING WEG: beim Antippen einer Figur erschien oben links im Feld ihre simple Vektor-Kopie - diese Anzeige ist entfernt
- DRACHE MITTIG & GROSS: im Aufstellungs-Editor wird der Drache jetzt als ein grosses, mittig ueber seinem 2x2-Block schwebendes Bild gezeichnet (nicht mehr klein in einem Einzelfeld); auf dem Spielfeld fuellt er seinen Block zentriert (big-Flag ans Sprite durchgereicht)
- ZUGDIAGRAMM PRO FAEHIGKEIT: Faehigkeiten, die die Bewegung veraendern (Weitsprung, Vorreiter, Phase, Blinzeln, Koenigsflucht u.a.), zeigen ihr eigenes Mini-Diagramm mit den neuen Feldern in Gruen - eingebettet sowohl in die Chronik als auch in die Hofstaat-Figurenkarten unter der jeweiligen Faehigkeit

## 0.22.37
- AUFSTELLUNG ZEIGT BEIDE REIHEN: ueber der Hinterreihe erscheint jetzt die Bauernreihe mit echten Figurenbildern - gewoehnliche Bauern und der Grand Gambit (sein aktuelles Siegel-Portrait) auf seiner Spalte, mit Stern markiert; ein Tipp auf ein Bauernfeld setzt seine Spalte. Der alte separate Positionsbalken entfaellt
- DRACHE VERDRAENGT SICHTBAR: setzt man den Drachen in eine Ecke, verschwinden in der Anzeige die zwei Bauern vor ihm UND die Nachbarfigur in der Hinterreihe (Flug-Symbol, ausgegraut) - man sieht direkt, dass er 2x2 Felder samt der zwei Bauern beansprucht
- KAMPFSTAERKE FOLGT DEM REGELWERK, NICHT DEM BRETT: auf dem klassischen 8x8-Feld gibt es HP-Kaempfe (31 Kampagnen-Knoten) - dort bringen deine Figuren jetzt ihre Level, Faehigkeiten und Duplikate mit, genau wie auf jeder anderen Karte. Reines Schach (Schnellspiel-Klassik, Schach-Knoten) bleibt Level 1 ohne Faehigkeiten. Betrifft Spieler UND Gegner und den Grand Gambit; Seher-Vorschau ebenso an die Regel gekoppelt

## 0.22.36
- KLASSIK WIEDER AUFSTELLBAR: die Klassik-Karte ist zurueck in der Kartenwahl des Aufstellungs-Editors und voll bearbeitbar - es geht um das SPIELFELD (8x8), nicht um die Schach-Regeln. Im Schnellspiel bleibt Klassik unveraendert die traditionelle Aufstellung (eigener Baupfad); nur Kampagnen-Bretter ehren die gespeicherte Formation (Sperre map.classic in buildArmyForMap entfernt)
- FIGURENWAHL SPRINGT AUF: tippt man einen Slot an, scrollt die Auswahl-Liste automatisch ins Bild (vorher musste man selbst suchen)
- DRACHEN-FLUEGEL GESPERRT: der leere 2x2-Nachbarplatz laesst sich nicht mehr eigenstaendig belegen - er zeigt sich als Teil des Drachen (lila Schimmer, Flug-Symbol) und ein Tipp darauf springt zum Drachen-Slot; der Drache traegt jetzt ein sichtbares 2x2-Abzeichen
- BAUERNREIHE + GAMBIT IM EDITOR: die Position des Grand Gambit (seine Spalte in der Bauernreihe) ist jetzt auf JEDER Karte waehlbar, auch Klassik - der Rest der Bauernreihe steht fest; Hinweistext klargestellt

## 0.22.35
- KARTEN-BUTTON VEREINHEITLICHT: der goldene Textknopf "Weiter - Liga X" (erschien nur nach dem Ligameister-Sieg) ist ersetzt durch einen runden Symbol-Knopf im selben Stil wie der Zurueck-Knopf, nur seitenverkehrt (Pfeil nach vorn)
- STAT-BUBBLES NACH UNTEN LINKS: Leben (gruen) sitzt jetzt fest in der unteren linken Ecke jeder Figur, Staerke (gelb) direkt darueber, Energie (blau) rechts neben dem Leben - L-Form mit kleinem tangentialem Abstand zwischen den Kugeln; Gegner und eigene Figuren gleich
- KRAEFTIGERE BUBBLES: leuchtender Kern, satter Mittelton und fast schwarzer Rand (dreistufiger Verlauf plus dunkler Aussenring) fuer klaren Kontrast auf jedem Untergrund
- DOSSIER OHNE MINI-BILD: beim Antippen der eigenen Figur zeigt das Info-Feld weiterhin Name, Werte und Faehigkeiten, aber nicht mehr das kleine Figurenbild - die Kugeln wachsen ja bereits beim Fokus

## 0.22.34
- CHRONIK HINTER AUSRUESTUNG: Reiter-Reihenfolge jetzt Hofstaat, Aufstellung, Ausruestung, Chronik
- BESTIARIUM: alle 25 Monster des Risses in der Chronik ergaenzt (eigene Sektion unter den Figuren), mit Familie, Zug-Diagramm und Andeutung
- NUR ERLEBTES WIRD ENTHUELLT: Chronik-Eintraege sind verschlossen (Silhouette, "???", "noch nicht begegnet"), bis man die Figur besitzt ODER ihr im Kampf begegnet ist - Standardfiguren kennt man von Beginn an, exotische Figuren und Monster erst nach der Begegnung (nutzt denselben Codex wie der Hofstaat-Baum)
- GRUNDZUEGE VISUALISIERT: jede enthuellte Figur zeigt ihr Zugmuster auf einem kleinen 7x7-Diagramm - blaue Felder fuers Gleiten (mit Reichweite), gelbe fuer Spruenge, die Figur in der Mitte; fuer Standardfiguren aus den Engine-Vektoren abgeleitet, fuer Sonderfiguren und Monster aus ihrem moveSpec (verifiziert: Springer zeigt reines Sprung-L, 0 Gleitfelder)

## 0.22.33
- TUERME SIND KEINE PFLICHT MEHR: alle Karten verlangen nur noch Koenig, Dame und Laeufer - Tuerme wandern in den Flex-Pool und koennen wie jede Hofstaat-Figur getauscht werden (ein spaeter ueberschreibendes flank:false am Turm behoben). Rochade existiert im Spiel ohnehin nicht; falls sie je kommt, gilt sie den FELDERN, nicht den Figuren
- STAT-TRIADE AUF JEDER FIGUR: Leben (gruen), Staerke (gelb) und Energie (blau) als drei gleichgestaltete Kugeln im Dreieck oben links an jeder Figur, Zahlen in der Kugel; die Kugel WAECHST mit ihrem Wert (zweistellige Zahlen bekommen ein breiteres Zuhause) und waechst nochmals um 40 Prozent, wenn die Figur angetippt ist; Gegner und eigene Figuren exakt gleich dargestellt; ersetzt die alten Punktspalten links/rechts. Gemessen: 96 Kugeln bei 32 Figuren, Groessen 8.8-14.8px je nach Wert und Fokus

## 0.22.32
- CHRONIK-REITER IM HOFSTAAT: neuer Tab "Chronik" zwischen Hofstaat und Aufstellung - jede Figur des Reichs mit Portrait, Grundzugsbeschreibung (was sie von Natur aus kann, unveraenderlich) und vollstaendigem Faehigkeitsbaum (welche Faehigkeit ab welcher Stufe); Gambit erhielt dabei eine explizite Erlaueterung dass nur seine Siegel-Stufen wachsen, nie seine Schrittart; der einleitende Satz wiederholt die Regel: Grundzuege sind angeboren, Faehigkeiten kommen mit den Stufen hinzu
- BESTAETIGT: kein Charakter ausser Gambit veraendert seine Grundzuege beim Leveln (maschinell geprueft, 0 Faelle); Faehigkeiten sind ausschliesslich Spezial-Effekte und einmalige Zugmodifikatoren, keine neuen Zugrichtungen

## 0.22.32
- NEUER REITER "CHRONIK" IM HOFSTAAT: das Regelbuch des Hofes - jede der 27 Figuren aufklappbar mit ihren GRUNDZUEGEN (handgeschrieben fuer die klassischen Gattungen inkl. Drache-2x2 und Grand Gambit; automatisch und stets korrekt aus dem moveSpec fuer alle Spezialisten: Gleiten/Reichweite/Spruenge) und ihrer kompletten FAEHIGKEITEN-LEITER (Symbol, Name, ab Stufe, Beschreibung). Noch nicht rekrutierte Figuren erscheinen ausgegraut, ihr Wissen ist frei einsehbar
- DAS GESETZ STEHT DARUEBER: Grundzuege sind angeboren und aendern sich nie - allein der Grand Gambit waechst ueber seine Siegel-Stufen; Faehigkeiten kommen mit den Stufen hinzu und aendern die Schrittart nicht (im Code stimmt das per Bauart: moveSpec ist statisch je Figur)

## 0.22.31
- DER DRACHE BREITET SICH AUS: der Drachenhort-Boss verlor beim Spec-Bau sein big-Flag und stand deshalb auf einem Feld - jetzt entfaltet er sich wie vorgesehen ueber 2x2 (Anker plus drei Fluegel-Marker)
- AUFSTELLUNG WIEDER AENDERBAR: zwei Blocker behoben. Erstens startete der Editor auf der Klassik-Karte, wo alle Felder bewusst gesperrt sind (reines Schach) - Klassik ist jetzt aus der Kartenwahl des Editors raus, Arena zuerst. Zweitens kannte die map-bewusste Legalitaetspruefung die Drachen-Regeln nicht: der leere Fluegel-Slot machte jede Drachen-Formation illegal (Speichern gesperrt, Kampf fiel still auf Standard zurueck) - Ecken-Regel, Fluegel-Slot und Flex-Abzug jetzt uebernommen
- BESTAETIGT: Dame kann durch verbuendete Liga-Bosse ersetzt werden, alle anderen Plaetze durch Hofstaat-Figuren (Pflicht-Kontingente der Karte bleiben) - im Browser durchgespielt: Slot antippen, Boss waehlen, speichern
- 3 neue Regressionstests (Drachen-Formation legal, Spieler-Drache entfaltet 2x2, Hort-Boss traegt big) - 432 gesamt

## 0.22.30
- ALLE ZEHN WELTEN UNTERM BRETT: die Ground-Tabelle ist komplett - Sommer (Trockengras), Herbst (Laubgrund), Winter (Schnee mit gefrorenem Bach), Hochgebirge (Fels mit Schneeresten), Oedland (rissige Erde mit Glutadern), Steppe (Grasland mit Pfaden), Roter Canyon (geborstener Fels), Wueste (Duenen mit Spuren) und Endloses Meer (Wellengang) liegen jetzt wie die Fruehlingswiese unter den Kampagnen-Brettern ihrer Liga, mit denselben organischen Hell/Dunkel-Schleiern; im Browser verifiziert (Liga IX rendert ground-09)

## 0.22.29
- ZOOM STATT KAMERAFAHRT: die 6-Sekunden-Eroeffnungsfahrt ueber die Feindreihe ist ersetzt durch einen kurzen, sauberen Zoom (1,9s) - das Brett steigt klein und leicht verschwommen aus der Kartenhoehe auf und rastet scharf in voller Groesse ein, wie ein Hineinzoomen in die Station; gilt fuer Kampagne und Duelle, Schnellspiel bleibt ohne Anlauf

## 0.22.28
- ORGANISCHE FELD-UEBERGAENGE AUF GROUND-BRETTERN: die Hell/Dunkel-Schleier sind jetzt radiale Verlaeufe (kraeftig in der Feldmitte, zu den Raendern auslaufend), sodass Nachbarfelder ueber der Wiese ineinander verschmelzen statt an einer Kante zu stossen; die harten Relief-Linien weichen einem weichen, verwaschenen Hauch. Gemessen: Uebergangsbreite an der Naht ~17px statt 1-2px, Zentren-Kontrast 75 (Schachbrett klar lesbar)

## 0.22.27
- GROUND-BRETT ENTSAETTIGT: die Feld-Schleier sind jetzt neutral (reines Weiss 20 Prozent / reines Schwarz 30 Prozent statt warmer Creme/Braun-Toene) und die Holz-Abnutzungstextur liegt auf Ground-Brettern nicht mehr drueber - die Wiese zeigt ihre echten Farben durch die Transparenzen, Hell/Dunkel bleibt klar erkennbar. Gemessen: Warmstich weg (Rot-Gruen-Abstand 12 auf 2), Gruen-Anteil deutlich hoeher, Hell/Dunkel-Abstand 62

## 0.22.26
- WEISSE EINSCHLUESSE IN 25 FIGUREN ENTFERNT: beim urspruenglichen Freistellen ueberlebten eingeschlossene Hintergrund-Reste (weisse Taschen zwischen Arm und Koerper, unter Fluegeln, neben Sockeln). Alle 70 Figuren-Gemaelde maschinell gesichtet, Taschen mit der Original-Freistell-Logik plus Kern-Kriterium (grosse flache Reinweiss-Kerne) entfernt, Raender wie beim Import weich abgefedert. Nachgearbeitet: Amazone, Erzbischof, Attentaeter, Barde, Laeufer, Schildtraeger, Spaeher, Springer, Magier, Paladin, Dame, Seherin, Hexerin, Flaggentraeger sowie die Monster Waechter, Skorpion, Koloss, Sturmkraehe, Blutmagd, Eisenfaust, Schattenfuerst, Hueter, Wandlerin und Mirenn. Kontrolle: groesster verbliebener Weiss-Kern 179px (ein echtes Mal-Highlight), Malerei ausserhalb der Taschen unangetastet (nur Re-Encode-Rauschen), Erzbischof und Inquisitor bewusst in einem einzigen Encode-Durchgang

## 0.22.25
- WIESE ALS STAR, KACHELN ALS RELIEF: das Liga-I-Brett umgedreht - vorher lagen Themenfarbe und Stein-Slab fast deckend UEBER dem Grund, jetzt ist der gemalte Boden voll sichtbar und die Felder sind nur noch neutrale Hell/Dunkel-Schleier (34/44 Prozent) mit den bestehenden Relief-Kanten, wie erhabene Kacheln im Gelaende; Stein-Textur auf Ground-Brettern entfernt, Koordinaten in satter Tinte. Gemessen an leeren Reihen: Hell/Dunkel-Abstand 83, Wiese in beiden Feldtypen deutlich sichtbar (Gruen-Ueberhang +10/+26)

## 0.22.24
- DER GAMBIT STICHT IN SEE: auf der Meeres-Liga sitzt der Wanderer jetzt im gemalten Ruderboot (sobald das Boot in der Truhe liegt) - der Rumpf legt sich als vordere Ebene vor die Figur, die Gischt ersetzt den Wegschatten, die Figur hebt sich leicht ueber die Bordwand; alle sechs Stufen-Portraits funktionieren unveraendert, das alte Mini-SVG-Boot ist ersetzt
- WIESE UNTERM BRETT (LIGA I): der gemalte Fruehlingsgrund (Bach, Pfad, Bluehwiese) liegt jetzt unter jedem Kampagnen-Brett der ersten Liga - die Felder oeffnen sich (60/66 Prozent Deckung), damit das Land durchschimmert; Schnellspiel und Duelle behalten ihre blanken Tische. Weitere Welten folgen, sobald ihre Gemaelde eintreffen (GROUNDS-Tabelle 1-10 vorbereitet)
- Assets importiert und optimiert: Boot freigestellt und beschnitten (640x344, 92 KB WebP mit Alpha), Grund als 1024er WebP (246 KB)

## 0.22.23
- SOFORT AUFS BRETT: die Eroeffnungs-Kamerafahrt entfaellt im Schnellen Spiel komplett (auch Klassik Schach und Hotseat) - sie gehoert zur Reise und bleibt Kampagne und Online-Duellen vorbehalten
- SIMPLE FIGUREN UEBERALL: der Vektor-Figurenstil aus den Einstellungen gilt jetzt auch in Klassik Schach im Schnellen Spiel (vorher ueberschrieb der Klassik-Modus die Wahl mit seinen Gemaelden)
- AUSRUESTUNG ALS SIEGESBEUTE: nichts liegt mehr von Beginn an im Vorratslager. Der erste Kampagnen-Sieg enthuellt den Lebenstrank (+1 gratis), der zweite den Zeitenwender (+1 gratis), der dritte oeffnet den Sternensplitter-Tresor, danach enthuellt die Reise Stueck fuer Stueck den Rest - jede Freischaltung erscheint als eigene Siegel-Zeile im Siegesbanner; Schluessel-Gegenstaende werden angekuendigt und bleiben kaeuflich (die Tore behalten ihren Preis)
- Test angepasst und erweitert (429 gesamt): Lebenstrank zu Beginn verhuellt, nach dem ersten Sieg enthuellt

## 0.22.22
- MEER-ORTSNAMEN OHNE PLAKETTE: auf Liga X wird die helle Grund-Ellipse hinter den Namen jetzt WEGGELASSEN (an Land verschmilzt sie mit hellem Boden, auf dem Wasser sah sie wie ein aufgesetztes Oval aus). Die Namen tragen sich dort ueber die Schrift selbst - heller Text mit dunklem Umriss, gut lesbar auf dem Wasser. Alle anderen Ligen unveraendert (Halo wie gehabt). Verifiziert: Meer-Labels rendern jetzt in hellem #fbf6e8 statt dunkler Schrift auf Halo

## 0.22.21
- KARTENNAMEN FOLGEN DER ANGEZEIGTEN LIGA: der Ortsname (und sein Text-Schein) richtete sich nach der Fortschritts-Liga statt nach der gerade angezeigten - beim Zurueckblattern auf fruehere Welten passten Name und Farbe nicht zusammen. Jetzt konsequent an viewLeague gekoppelt (die Werkbank setzt die Fortschritts-Liga, daher wirkte es dort besonders)
- MEER-BESCHRIFTUNG WIE AN LAND: der Namens-Schein auf Liga X war graublau getoent und stach auf dem Wasser als Farbfleck hervor - jetzt heller neutraler Dunst wie bei den anderen Ligen, die Plakette verschwindet (0 graublaue Halo-Pixel im Meeresband gemessen)
- KOPFLEISTE AUFGERAEUMT: nur noch Gold und Hofwert; Level-Anzeige und Skillpunkte entfernt (Skillpunkte fliessen ohnehin in den Hofwert). Ungenutzte Importe/Variablen mitentfernt

## 0.22.20
- ORTSNAMEN IM SITZ-REGISTER: alle Ligen II-X erneut ueberarbeitet in Richtung grosser Fantasy-Chroniken - Namen, die wie Stammsitze und Wegmarken klingen (Sichelmark, Zwillingsfeste, Frostthron, Koenigsjoch, Dornendiadem, Gischtthron, Ebbe und Niemand), nichts direkt uebernommen (Blacklist-Pruefung gegen bekannte Westeros-Namen im Build-Skript), kein Name doppelt, keine Slot-Stempel (Suffix-Budget geprueft: max 7 von 510)
- NAMENSWUERFEL FUER ONLINE-DUELLE: zwei Muster statt einem - "Vorname Beiname" (Maera Salzherz, Torvin Rissgaenger) und das Siegel (EhernerFalke IX); 36 Vornamen x 32 Beinamen plus 20x20x9 Siegel = rund 4750 Kombinationen, dieselbe Kennung faellt in einer Sitzung nie zweimal (Session-Merker mit Ausweich-Suffix), Laengenkappe 24 Zeichen

## 0.22.19
- NAMEN, RICHTIG KREATIV: die Ligen II-X komplett neu benannt - eigenstaendige, bildhafte Orte je Welt (Sommer: Maeusekirche, Wende des Lichts; Winter: Barfussspur, Letzte Flocke; Steppe: Hufdonner, Lied der Weite; Wueste: Fata Morgana, Namenlose Weite; Meer: Flaschenpost, Ebbe und Niemand, Planke ueber Schwarz). Bewusste Ketten bleiben als Erzaehlmotiv: je Liga eine Halle, eine Messe, eine Kanzel - und Osrics Koenigs-Mal auf jedem Land. Kein Name doppelt ueber alle zehn Ligen (Test erzwingt es)
- FAEHIGKEITSKARTE FEINSCHLIFF: Talent-Symbole exakt mittig in den Bubbles (Grid statt Zeilenhoehe), Werte-Pillen fuer Leben/Staerke/Energie gleich gross (58px) mit sauberem Abstand nach oben und unten, Stufen-Chip mit Luft zum Schliessen-Knopf, Stufenpunkte ruecken ab
- MEHR KONTRAST IM TALENTE-MENUE: Beschreibungen, Titel, Chips und die "ab Stufe"-Hinweise deutlich heller
- GLANZ NUR IN DER KONTUR: kaufbare Talente tragen den Lichtlauf jetzt ausschliesslich in der Umrandung (Ring-Maske, neues Keyframe ggEdgeSweep) statt ueber der Flaeche; dabei eine Keyframe-Namenskollision behoben, die den Brett-Sweep still ueberschrieben hatte

## 0.22.18
- CHANGELOG bereinigt: drei 0.22.17-Bloecke aus mehreren Arbeitsgaengen zu einem zusammengefasst (keine Code-Aenderung)

## 0.22.17
- ECHTE ORTSNAMEN STATT PRAEFIX-SCHEMA: alle Stationen der Ligen II-X tragen handgeschriebene, storygebundene Namen - keine mechanischen Serien mehr (vorher Saatwacht/Frostwacht/Sandwacht und zuletzt noch Gras 12x, Sand 17x, Salz 9x in VII/IX/X), kein Name doppelt ueber alle zehn Ligen inkl. Liga I (per Test gesichert); Liga I behaelt ihre Heimatnamen
- FIGUREN ERST NACH DEM KAMPF: jeder Posten bleibt leer, bis man an dieser Station in dieser Liga gespielt hat (Sieg oder Niederlage, campaign.faced) - gemalte Karte, Boss-Blatt und Totenkopf decken erst dann auf; auch die Story-Zeile des Ortsblatts und die Abtruennig-Zeile bleiben bis dahin verschleiert (Schleiertext: "Niemand berichtet, was hier wartet ...")
- Namens- und Aufdeckungs-Tests erweitert (428 gesamt gruen)

## 0.22.16
- SIEGEL-FAMILIE AUF DER CHARAKTERKARTE: alle Zeichen-Bubbles tragen jetzt den Look des Verbessern-Knopfs (tiefes Nachtblau, Goldrand, Goldschrift) - die Herz/Schwert-Pillen im Kopf, der Sterne-Chip, die Wertezeile neben dem Verbessern-Knopf und die runden Talent-Symbole; die Zeichen selbst behalten ihre Bedeutungsfarbe, gekaufte Talente ihren Familien-Schein
- PORTRAITS GROESSER: geoeffnete Karte 118x152 -> 144x186, eingeklappte Kartenreihe 74x96 -> 86x112, Vektor-Fallback entsprechend

## 0.22.15
- DIE CHRONIK DES RISSES: die zehn Welt-Geschichten sind jetzt EIN durchgehender Bogen mit drei Gestalten - Corvin (der Gambit, dem der Hof den Namen nahm), Mirenn (die Geopferte, die aus dem Riss zurueckkam und jeden genommenen Namen zurueckgeben will) und Vesna (die Seherin, die das verbotene Verzeichnis fuehrte und Mirenn einst selbst benannte). Osric, der Kapitaen, Doppelritter, Schattenfuerst, Lanzenmeister und Blutmagd bleiben Nebenwirkungen derselben Wunde, keine Nebenhelden
- NAMEN MIT BEDEUTUNG: b23 heisst Mirenn, b25 heisst Osric, die Hellseherin heisst Vesna - und dass Opfer nur Titel tragen, ist jetzt selbst Teil der Geschichte (der Riss nimmt zuerst den Namen). Gambit-Tag, Riss-Begegnung, Bestechungs-Hinweis und Chronik-Intro sind in den Bogen eingewoben
- KARTEN-BESCHRIFTUNG ZURUECKGENOMMEN: die Ellipsen unter den Ortsnamen sind auf ein Fluestern reduziert (Deckkraft .58 -> .22, langer Auslauf ins Transparente, staerkerer Blur); Lesbarkeit haengt jetzt an einem Schein entlang der Buchstaben statt an einer Flaeche - besonders auf dem Meer verschwinden die Felder unter der Schrift

## 0.22.14
- NACHZUEGLER: die Vollausbau-Engine selbst (withProgressPct baut jetzt Codex-Sichtungen, Liga-Kronen, Monster-Buendnisse und volle Truhe mit auf) lag nur im Arbeitsstand und fehlte im 0.22.13-Commit - ohne sie zeigte die neue Werkbank weiter Luecken und die neuen Tests schluegen auf frischem Klon fehl
- ABSICHERUNG: kompletter Testlauf zusaetzlich auf einem frischen Klon des Repos ausgefuehrt, damit keine ungetrackten Arbeitsstand-Reste mehr fehlen koennen

## 0.22.13
- WERKBANK OHNE REIHENFOLGE-FALLE: die Liga-Knoepfe WAEHLEN jetzt nur noch aus, SETZEN wendet Liga und Fortschritt zusammen an. Vorher wirkte der Regler auf die noch aktive Liga - wer erst Setzen und dann Liga 10 drueckte, bekam 17 Monster in Nacht, leaguesWon=1 und leere Liga-Boss-Plaetze
- VOLLAUSBAU WIRKLICH VOLL SICHTBAR: Liga-Bosse, die fuer dich kaempfen, stehen im Figurenbaum jetzt golden mit "Im Hofstaat" statt grau (gilt auch im normalen Spielverlauf nach Liga-Siegen); nur die Erzfeindin bleibt bewusst unverbuendet, ihr Antlitz ist im Codex sichtbar
- 5 neue Tests sichern den Vollausbau ab: alle Figuren rekrutiert, alle Monster im Codex, alle Monster ausser der Erzfeindin im Feld, Truhe voll, zehn Kronen

## 0.22.13
- WERKBANK-REGLER BAUT JETZT DIE ECHTE REISE: fruehere Ligen zaehlen als gemeistert (Ligameister-Trophaeen inklusive), Rekruten und Codex-Sichtungen wachsen den Weg entlang mit - vorher setzte der Regler nur die aktuelle Liga und liess alles andere dunkel
- 100% = VOLLAUSBAU: alle Figuren rekrutiert, jedes Monster im Codex, bestechbare Monster verbuendet, Tyrannen-Ligameister ueber Siege feldbar, Truhe komplett gefuellt - Liga X bei 100% garantiert den kompletten Katalog (nur die Erzfeindin bleibt wie im Spiel unerreichbar)
- 5 neue Tests fuer die Vollausbau-Semantik (jetzt 416)

## 0.22.12
- FEATURES AUS 0.22.9/0.22.10 ZURUECK: Glanz-Sweep auf kaufbaren Faehigkeitskarten, Medaillon-Symbole exakt mittig, Sicht-Leck im Figurenbaum gestopft (nur diesseits des Nebels gilt als gesichtet), Eroeffnungsfahrt nur noch ueber die Feindreihe (Variante C gestrichen), Vektor-Zwilling entfernt, CharCard-Portraits groesser
- URSACHEN-ANALYSE: kein Code-Defekt in 0.22.9/0.22.10 reproduzierbar - echter Chromium-Boot des Multi-Chunk-Builds, eingeloggter Bootpfad mit Fortschritt und der Service-Worker-Deploy-Uebergang liefen alle fehlerfrei; der Haenger war sehr wahrscheinlich ein Deploy-/Cache-Zustand nach zwei Deploys in sieben Minuten
- TESTPFLICHT: vor jedem Push npm test UND npm run build UND npm run build:single UND node test_boot.mjs

## 0.22.11
- NOTFALL-REVERT auf Stand 0.22.8 - grandgambit.win blieb mit v0.22.9/10 beim Boot im Fallback haengen ("Wird geladen ...")
- src/ und index.html exakt auf Commit 9cf98a2 (v0.22.8) zurueckgesetzt; die Features aus 0.22.9/0.22.10 folgen repariert als 0.22.12
- NEUE EISERNE REGEL: vor jedem Push npm test UND npm run build UND npm run build:single UND node test_boot.mjs (3/3)

## 0.21.95
- ABSTURZ BEHOBEN: Tipp auf Gambit in der Karte crashte die App - der onOpenTree-Prop fehlte in der CampaignScreen-Signatur (ReferenceError beim Rendern des Rang-Blatts)
- GAMBIT-BLATT SAUBER IM FRAME: das Blatt sass faelschlich IN der schwebenden Kopf-Leiste (doppelter Versatz) - jetzt liegt es auf Karten-Ebene, mittig, immer INNERHALB der Karte
- FESTER KARTENRAHMEN MIT GLEICHMAESSIGEM ABSTAND: 12px Luft oben, 12px ueber dem Menue unten (mobil 78px inkl. Dock) - der Rahmen steht fest, die Karte SKALIERT und pannt innerhalb dieses Fensters (vorher schrumpfte der Rahmen mit dem Inhalt)

## 0.21.94
- DER HOFSTAAT (vormals Chronik) IST JETZT REITER 1 im Hofstaat-Bereich und der Standard-Einstieg; danach Aufstellung, Figuren, Ausruestung
- KACHELN AUFGERAEUMT: die zweite Zeile unter dem Figurennamen ist weg, die Figuren dafuer deutlich groesser (68px statt 52px); Status wie "Gesichtet"/"Verbuendet" und die Herkunft stehen als kleines Eck-Kuerzel oben rechts
- VOLLE FIGUREN-FUNKTIONEN IM HOFSTAAT: ein Tipp auf eine Figur oeffnet ihre komplette Karte als Overlay (Level, Fahigkeitsleiter, Aufwerten, Zoom) - fuer rekrutierte UND begegnete Figuren; der Bestechen-Knopf bleibt direkt auf der Kachel
- BEITRITTS-LOGIK: rekrutierte Kronen- und Schattenfiguren RUTSCHEN HOCH in die Hofstaat-Sektion (mit Herkunfts-Vermerk "Krone"/"Schatten"), verbuendete Monster ebenso ("Verbuendet") - die Ursprungs-Sektionen zeigen nur noch die Unerreichten

## 0.21.93
- BRETT-EBENEN STRIKT: auch die gewaehlte/vergroesserte Figur bleibt in ihrer Reihen-Ebene - eine grosse Figur in Reihe b verdeckt NIE eine Figur in Reihe a (naeher = hoeher, ausnahmslos)
- KLICK-DURCHLASS: Figuren fangen keine Klicks mehr - das Feld direkt hinter einer vergroesserten Figur bleibt anklickbar (Klicks treffen immer die Zelle unterm Finger)
- FEIND-RAUCH ENTFERNT (samt Animation)
- MARMOR-WELLE ("Glow") ENTFERNT - der gelegentlich verbuggte Schimmer-Effekt ist raus
- KACHEL-3D ALS SAUBERE FASE: statt des weichen Verlaufs klare Kanten - oben/links hell, unten/rechts dunkel (2px Inset)
- FIGURENGROESSEN: Bauern (inkl. Gambit) auf 90%, alle anderen Figuren auf 107% - der Hof ueberragt das Fussvolk
- KARTE MOBIL: der Kartenrahmen laesst dem Menue unten jetzt 78px Luft (nur auf schmalen Screens)
- SCHATZKAMMER: jede der 14 Errungenschaften traegt jetzt eine ERKLAERUNG, was gezaehlt wird (de/en)

## 0.21.92
- MONSTER-BESTECHUNG (Chronik): begegnete Monster lassen sich mit VIEL GOLD (1800) UND DEM OPFER EINER KRONENFIGUR auf deine Seite ziehen - der Knopf oeffnet die Opferwahl unter den rekrutierten Kronenfiguren; TYRANNEN und die beiden benannten Finals (Erzfeindin, Ligameister) sind unbestechlich. Bestochene Monster stehen als "Verbuendet" in Gold im Baum und sind sofort in der Aufstellung waehlbar (boss-Slot); Formationen, die das Opfer enthielten, werden aufgeloest, seine Siege verfallen
- GAMBIT TRAEGT SEINEN RANG UEBERALL: das Stufen-Antlitz (Tier 1-6) erscheint jetzt zentral ueber die Galerie - auf dem BRETT, im HOFSTAAT, in der CHRONIK und auf der Karte (Formel exakt wie meta gambitTier: neue Gestalt alle 10 Level)
- 3 neue Tests sichern den Monster-Besitz ab (403 gesamt)

## 0.21.91
- GAMBIT-BLATT REPARIERT: das Rang-Blatt haengt nicht mehr am Wanderer (ragte ueber den Kartenrand), sondern sitzt fest oben mittig im Kartenfenster mit sauberem Innenabstand - NEU: Knopf "Zum Faehigkeitenbaum" springt direkt in den Hofstaat zu den Figuren
- DER FIGURENBAUM (Chronik, erste Version): neuer Hofstaat-Reiter mit ALLEN Figuren des Reichs, unterteilt in Hofstaat / Krone / Schatten / Monster-Familien (Golems, Bestien, Schlangen, Schemen, Tyrannen). SICHTBARKEIT NACH ERLEBTEM: Rekrutierte in Gold, Begegnete zeigen Gesicht + Siege-Zaehler, Monster der AKTUELLEN Liga lauern als dunkle Silhouette mit Namen ("Gesichtet"), der Rest ist ??? 
- BESTECHUNG: begegnete Champions mit mind. 1 Sieg lassen sich mit GOLD bestechen (ca. 90% ihres Hofwerts) - Gold statt weiterer Siege, der Freundschaftskampf wird uebersprungen
- FAEHIGKEITS-GESCHICHTEN IM SIEGESBANNER: jede in dieser Schlacht erklommene Leiterstufe wird erzaehlt - "{Figur} lernt {Faehigkeit}" mit Beschreibung, "+1 Schild"-Meldungen, und GAMBIT-STUFEN-WECHSEL ("sein Antlitz wandelt sich") werden angekuendigt

## 0.21.90
- AKADEMIE-KNOPF im Hub zweizeilig: Zeile 1 "Die Akademie" (etwas kleiner, 13.5, mit den Doppel-Rauten), darunter "Regeln in zwei Minuten - jederzeit ueberspringbar" - gleiche Panel-Huelle wie die anderen Karten

## 0.21.89
- STATIONSNAMEN-TOENE JETZT AUS DEN KARTEN SELBST: der Schein hinter jedem Namen wurde pro Liga aus den FREIEN FLAECHEN des jeweiligen Gemaeldes GESAMPELT (hellstes Luminanz-Band, Glanzlichter uebersprungen, +12% Licht fuer die Tinte) - Fruehling Wiesen-Pergament, Sommer Olivgold, Wueste Sandgold, Meer Graublau der See usw.; dazu DEUTLICH TRANSPARENTER (Halo .58/.38 statt .95/.78, Textschatten .55)
- GAMBIT STEHT HOEHER auf der Karte (Fuesse ueber dem Ankerpunkt, -102%) - er verdeckt keine Stationsnamen mehr
- GAMBIT IST ANTIPPBAR: ein Tipp laesst ihn auf 132% vortreten (goldener Schein) und oeffnet ueber seinem Kopf ein kleines Rang-Blatt - Level, Stufe (I-VI) und die Funken-Kette; zweiter Tipp schliesst

## 0.21.88
- DAS BOOT IST JETZT EIN LEBENSWERK: 2400 Gold statt 140 - die Passage aufs Endlose Meer will ueber die ganze Reise ERSPART sein (neue Test-Invarianten: Boot >= 2000, Einkommen der Ligen 1-9 deckt es locker; Liga-1-Invariante zaehlt nur noch Liga-1-Schluessel)
- NAHANSICHT RICHTIG GEBAUT: freies PINCH-ZOOM bis 200% (zwei Finger), Ein-Finger-Ziehen verschiebt den Ausschnitt (Tippen bleibt Zug - nach einem Zieh-Manoever wird der versehentliche Tap geschluckt), am Desktop zoomt das Mausrad; KEIN Scrollbalken mehr (Transform statt Scroll). Der LUPEN-KNOPF sitzt jetzt UNTEN RECHTS im Brettfenster - weit weg vom Aufgeben-Knopf; Ausschalten setzt die Ansicht zurueck
- EBENEN-STAPEL DER FIGUREN: die Reihen liegen jetzt sauber uebereinander - Brett zuunterst, hinterste Reihe darueber, jede naehere Reihe hoeher; vordere Figuren VERDECKEN dahinterstehende, die gewaehlte Figur steht ueber allem; die Marmor-Welle laeuft weiter unter den Figuren
- DIE LETZTE REIHE WIRD NICHT MEHR ABGESCHNITTEN: das Brett laesst die Koepfe der hintersten Reihe ueber das Spielfeld hinausragen (overflow frei)

## 0.21.87
- EROEFFNUNG DRAMATISCHER + VARIIERT: drei Kamerafluege (A/B/C), jede Schlacht zieht zufaellig einen - alle beginnen NAH UEBER DEN FEINDREIHEN und verweilen dort (die eigene Reihe kennt man), mit seitlichen Schwenks, 3.4s; NEUE, nie gesehene Feindfiguren PULSIEREN waehrend des Flugs golden - die Kamera stellt sie vor
- DER CODEX (neue Kernmechanik): das Profil merkt sich, welchen exotischen Figuren man je begegnet ist. FEINDE SIND JETZT IMMER ANKLICKBAR - Standardfiguren und bereits BEKANNTE zeigen ihre Zuege; FREMDE behalten ihre Zuege beim ersten Treffen fuer sich (ab der naechsten Schlacht offen)
- SEHER-GABE PRAEZISIERT: Hellseherin und Falke lesen auch FREMDE - aber erst ab Level 2 (die erste erworbene Faehigkeitsstufe schaltet den Spaehblick frei)
- FIRST-MEET-GESCHICHTEN: klickt man eine nie gesehene Figur an, stellt sie sich einmalig mit einem Popup vor (Portrait, Name, Sage) - inkl. Hinweis, ob die Seher-Gabe sie bereits liest oder sie ihre Geheimnisse noch behaelt
- Gewaehlte Figuren wachsen beim Anklicken jetzt auf 138% (vorher 124%)

## 0.21.86
- KARTE: das Liga-Blaettern sind jetzt runde GOLD-PFEILE (links/rechts, gleicher Siegel-Stil) - der Karten-Nadel-Knopf bleibt ganz links
- WERKBANK: der SPIELFORTSCHRITT-REGLER ist von der Spielstand-Karte in die Werkbank umgezogen (alte Stelle entfernt) und wirkt jetzt auf die GEWAEHLTE LIGA statt stur auf Liga 1
- LIGA-10-BUG BEHOBEN: der Liga-Sprung setzt die Reise sauber auf (frisches cleared, Tore geleert) - und das ENDLOSE MEER kommt automatisch mit Kapitaen + Boot ausgestattet, sonst sperrte die Meer-Maut die komplette Karte ("bei 10 kann man nichts spielen")

## 0.21.85
- GROSSE EMOJI-JAGD: die komplette App wurde nach Emoji-Symbolen durchkaemmt - alles jetzt handgezeichnet im Haus-Gold. NEU GEZEICHNET: gekreuzte Klingen, Seherkugel, Anker, Ruderboot, Wellen-Siegel, Wachs-Haken + Pflicht-Kaestchen, Gold-Sanduhr, vergoldeter Schaedel
- AKADEMIE: alle Lektions-Icons auf Schatz-Gold umgestellt (Gold-Herz + Klingen, Sanduhr, Schaedel, Funke + Wimpel, Muenze); Stern-Emoji in den Texten durch den Funken ersetzt
- MEER-POPUP: Wellen-Titel, Anker- und Boot-Bedingungen mit gezeichneten Haken/Kaestchen statt Emoji; ebenso die TOR-Bedingungen der Reise
- AUSSERDEM: Seher-Fenster mit gezeichneter Kristallkugel, Bestenliste mit Gold-Pokal, Sperrschirm mit gezeichnetem Schloss, Schild-/Drachen-Emoji-Reste im Hofstaat entfernt, tote Emoji-Daten der Navigation bereinigt

## 0.21.84
- GEZEICHNETE ICONS komplettiert: das Willkommen-Fenster traegt jetzt GOLD-HERZ, Gold-Funke und Feldkarte (statt gruenem Herz/Stern); der Namens-Wuerfel im Online-Duell ist ein handgezeichneter GOLD-WUERFEL mit dunklen Augen
- DIE GEWAEHLTE FIGUR TRITT VOR: beim Anwaehlen waechst jede Figur um 24% aus ihrer Kachel (sanfte .16s-Bewegung) - eigene wie feindliche
- SEHER-SPAEHBLICK (neue Faehigkeit von Hellseherin und Falke): steht eine SEHERIN oder ein FALKE in deinen Reihen, kannst du JEDE feindliche Figur antippen - sie tritt vor und ihre moeglichen Zuege leuchten in Seher-Violett auf. So analysierst du fremde Champions und Monster, bevor du ziehst
- EROEFFNUNGSFLUG: jede Partie beginnt mit einem kurzen Kameraflug uebers Brett (2.5s, von den Feindreihen heran) - der Gegner steht dir einmal vor Augen, dann setzt sich das Brett
- NAHANSICHT (Lupen-Knopf neben Aufgeben): schaltet einen scrollbaren Zoom-Modus (185%), um das Brett im Detail zu studieren - das feste, unverrueckbare Brett bleibt der Standard

## 0.21.83
- UPDATE-PROBLEM AN DER WURZEL BEHOBEN: der Service Worker bekam skipWaiting + clientsClaim - neue Versionen uebernehmen ab jetzt beim NAECHSTEN LADEN sofort, statt zu warten bis alle Tabs geschlossen sind (der Grund, warum Aenderungen oft "nicht ankamen")
- VERSIONSANZEIGE: unten auf Login und Spielstand-Auswahl steht jetzt dezent die laufende Versionsnummer - so ist sofort sichtbar, welcher Stand laedt
- ABSTAND Logo -> Text nochmals kraeftiger: Login 42px, Spielstand-Auswahl 38px

## 0.21.82
- STATIONSNAMEN tragen jetzt das Licht ihres Landes: der Schein hinter jedem Namen ist je Liga getoent - Fruehling Wiesengruen, Sommer Sonnengold, Herbst Bernstein, Winter Eisblau, Hochgebirge Felsgrau, Oedland Aschebeige, Steppe Grasgelb, Canyon Terrakotta, WUESTE SANDGELB, MEER MEERBLAU (dunkle Tinte bleibt lesbar)
- BRETTFIGUREN nochmals groesser: die Glyphe waechst von 90% auf 98% der Kachel

## 0.21.81
- DER WANDERER auf der Karte deutlich groesser (76x78 statt 56x58) - jetzt klar erkennbar
- SCHACHBRETT breiter und hoeher: die Partie-Ansicht laesst nur noch einen schmalen dunklen Rand (Brett-Rand 2/4px, Shell-Polster im Spiel 10px Desktop / 3px mobil)

## 0.21.80
- KARTEN-NAVIGATION neu: statt +/- jetzt ein runder SIEGEL-KNOPF mit handgezeichneter FELDKARTE + NADEL (drei gefaltete Bahnen, gestichelte Route, goldene Wegnadel mit Lichtpunkt) - ein Tipp oeffnet das Weltgemaelde; IN der Weltkarte sitzt oben links ein runder ZURUECK-PFEIL (ebenfalls handgezeichnet, Haus-Gold) zurueck zur Liga

## 0.21.79
- LOGIN + SPIELSTAND: mehr Freiraum unter dem Logo (26px bzw. 24px Abstand zum Anmelde-Bereich / zur Spielstand-Liste)

## 0.21.78
- FEIND-RAUCH nochmals deutlich verstaerkt (im Live-Test war er selbst im Zoom kaum sichtbar): hellere Schwaden, Deckkraft-Zyklus 0.45-0.8, breiter und hoeher (0.95em x 1.42em)

## 0.21.77
- SPERRSCHIRM-SACKGASSE BEHOBEN (im Live-UX-Test gefunden): der "Profil gesperrt"-Schirm hatte KEINEN Weg zurueck - wer den falschen Spielstand antippte oder das Passwort nicht parat hatte, sass fest. Jetzt gibt es "Zurueck zur Spielstand-Auswahl" direkt unter dem Entsperren-Knopf

## 0.21.76
- ERSTER START OEFFNET DIE WELT: wer die Kampagne zum ersten Mal betritt, sieht zuerst das grosse Weltgemaelde (einmalig, danach gemerkt) - die Reise beginnt mit dem Blick aufs Ganze
- LORE-FENSTER IN DER KARTE: tippt man eine Liga an, erscheint die Geschichte jetzt INNERHALB des Gemaeldes - schwebend ueber dem Anker im vergrauten Dunkel (bei den obersten Ligen klappt es stattdessen darunter auf); kein Block mehr unter der Karte, auch auf Desktop
- HELLER STRICH LINKS BEHOBEN: die Karte bekommt eine Deckungs-Reserve (Zoom +0.5%) und der Rahmen hinter Gemaelden ist dunkel statt Pergament - keine helle Naht mehr am Rand
- NEBEL & RAUCH KRAEFTIGER: Kartenfenster-Nebel heller und dichter (0.4 + zweite 0.26er-Schicht, hellere Schwaden), der Rauch hinter feindlichen Figuren ist breiter, steigt ueber den Kopf hinaus und traegt mehr Deckkraft (0.55) - jetzt wirklich sichtbar

## 0.21.75
- LOGIN + SPIELSTAND final aufgeraeumt: Inhalt beginnt GANZ OBEN (kein Riesen-Abstand mehr auf Desktop - die vertikale Zentrierung ist raus), das Ritter-Bild ist GROESSER (Login 36vh/720px, Spielstand 32vh/620px) und steht als Erstes; "Waehle deinen Spielstand" kleiner (14.5 statt 19); die GEISTER-PILL unter dem Absatz ist entfernt (leere Huelle des alten Admin-Hinweises, auf beiden Schirmen geprueft); Eingabefelder und Knoepfe kompakter - und gescrollt wird ganz normal, wenn die Bildschirmhoehe nicht reicht

## 0.21.74
- KARTE: statt "Weltkarte"-Pill jetzt ein +/- UNTEREINANDER (minus = raus zur Weltkarte, plus = zurueck in die Liga; inaktive Richtung gedimmt) - die Kapitel-Pille steht damit frei; die Kopfzeile sitzt 8px tiefer. NEBEL deutlich praesenter (Kartenfenster 0.28, Weltkarten-Schleier 0.72/0.55, groessere Schwaden)
- BRETT: das Gluehen/Vignette des Schachbretts ist KOMPLETT entfernt; Figuren nochmal minimal groesser (0.99em) und heller (1.36), eigene Figuren weniger orange/mehr gelb (hue +8); FEINDE weisser statt blau (Saettigung 0.32, Helligkeit 1.02/1.2) - und hinter JEDER feindlichen Figur steigt ganz leiser RAUCH auf (geblurte Schwade, 5.5s-Zyklus)
- KOPFLEISTE: die 4 Menuepunkte auf Desktop MITTIG; das GG-Emblem ist im BILD selbst gelber getuned (Hue +7, Saettigung 1.22); die Schatz-Chips liegen NEBENEINANDER und sind hochwertig neu gezeichnet (facettierte Gold-Icons mit Sheen und Schlagschatten, Serif-Ziffern mit Tabellenziffern, satter Doppelrand) - dieselben Icons jetzt auch beim Kontostand im Hofstaat
- ABSTAENDE: die Kopfleiste steht in JEDEM Menue fuer sich (22px Luft zum Inhalt, Desktop + Mobil); Hofstaat-Kacheln nochmals groesser (Slots bis 74px, Boss-Bilder 78px), mehr Luft um die Bauern-Reihe-Zeile und ueber dem Kontostand
- AUFGERAEUMT: Meta-Texte ohne "kostenlos"; der Admin-Passwort-Hinweis beim Anmelden ist raus; "Willkommen, Admin · Admin" zeigt das Admin-Etikett nur noch, wenn der Name nicht schon Admin lautet

## 0.21.73
- LOGIN + SPIELSTAND repariert: beide Schirme auf REINEM SCHWARZ (das Schachbrett/Hallen-Panorama hinter der Spielstand-Auswahl ist entfernt - wo Ritter und Schriftzug stehen, braucht es kein Brett)
- CONTAIN STATT ABSCHNEIDEN: die Zentrierung lief in die klassische Flexbox-Falle (justify-content: center + Overflow schneidet oben ab). Jetzt margin-auto-Container: passt der Inhalt, steht er exakt mittig OHNE Scrollen - passt er nicht (kleine Schirme), scrollt es sauber ab der ersten Zeile. Bild kompakter gedeckelt (Login 30vh, Spielstand 22vh), Abstaende gestrafft

## 0.21.72
- FIGUREN AUF DEM BRETT: deutlich heller (eigene brightness 1.3, Feind 1.18) und GROESSER - die Kunst bekommt 16% mehr Hoehe als die Kachel, der Kopf ragt bewusst leicht ueber das Feld hinaus (Figur sitzt unten auf)
- NEUE WERTE-ANORDNUNG UM DIE FIGUR: LINKS die Lebenspunkte zweireihig vertikal (Schwergewichte: vertikale Lebenssaeule), RECHTS die Faehigkeiten zweireihig vertikal (aktiv bunt, verbraucht grau), OBEN LINKS der Angriffswert als Gold-Raute, OBEN RECHTS wie gehabt das Level - die Figur selbst bleibt frei
- GOLD APP-WEIT EINEN HAUCH GELBER (lime/gold/goldBright verschoben), auch das GRAND-GAMBIT-Startbild minimal gelber gesaettigt (Hue +6, Saettigung 1.12) - Rand-Feder bleibt

## 0.21.71
- LOGIN/SPIELSTAND: Ritter-Artwork groesser (bis 700px / 42vh) mit mehr Luft zum Text; RAND-FEDER statt harter Kante - innen 100% Original, nur die Raender schmelzen ins Schwarze (oben kraeftig), kein Rechteck-Hintergrund mehr; beide Schirme sind jetzt BILDSCHIRMFUELLEND OHNE SCROLLEN (Inhalt zentriert, gescrollt wird nur falls er wirklich nicht passt)
- KOPFLEISTE: nur noch das GG-EMBLEM (groesser, heller, goldener Glanz-Schein) - die Wortmarke ist raus; rechts ein sauberes 2x2-SCHATZGRID: Gold, Skillpunkte, Level (XP im Tooltip), Hofwert - ALLE Icons handgezeichnet im einen Haus-Goldton (der gruene Funke ist jetzt gold)
- MENUES SCROLLEN NUR NOCH BEI BEDARF: App-Shell auf feste Bildschirmhoehe, der Inhalt scrollt intern nur, wenn er nicht passt - definierter Abstand zum Hauptmenue, kein Leerlauf-Gescrolle mehr
- AUFSTELLUNG: der Erklaertext (Klassische Schlacht / Bauern-Reihe) steht jetzt UEBER der Formation statt daneben - die Formation bekommt die volle Breite, Kacheln nochmals groesser (Slots bis 62px, Boss-Bilder 66px), Figuren exakt mittig

## 0.21.70
- HOTFIX 2 (React #310): der 0.21.69-Fix griff zu kurz - VOR dem Zurueck-Gesten-Hook lauerte noch ein weiterer Fruehausgang (authReady-Boot-Return). Der Hook steht jetzt VOR ALLEN Returns; per grep verifiziert, dass kein Return mehr davor liegt. Login laeuft

## 0.21.69
- HOTFIX LOGIN-CRASH (React #310): der Zurueck-Gesten-Hook aus 0.21.67 stand HINTER den Login-/Spielstand-Fruehausgaengen und brach die Hook-Reihenfolge beim Einloggen - er laeuft jetzt bedingungslos vor allen Returns. Login funktioniert wieder
- LOGIN- UND SPIELSTAND-BILD: das Ritter-Artwork wird jetzt EXAKT wie hochgeladen verwendet (keine Freistellung, kein Verlauf, kein Abdunkeln mehr) - nur sanft gerundete Ecken und ein Schatten

## 0.21.68
- ADMIN-WERKBANK im Profil (nur Admin-Konto): Liga I-X direkt anspringen, alle Figuren rekrutieren, +1000 Gold / +50 Skillpunkte - Vollzugriff zum Testen, wirkt nur aufs eigene Profil

## 0.21.67
- LOGIN-BILD: sanfter Verlauf oben ins Schwarze (kein harter Rand am Lichtschein mehr)
- KOPFLEISTE: das runde GG-EMBLEM steht jetzt vor der Wortmarke (Desktop + Mobil); Gold, Skillpunkte und neu der HOFWERT als sauber GEZEICHNETE Gold-Icons (Muenze, Funke, Wappen - keine Emojis mehr); Level-/XP-Balken bleibt
- WELTKARTE: Schloesser der verhuellten Ligen sind handgezeichnete GOLD-SCHLOESSER; der Nebel schweift jetzt VON RECHTS herueber (zwei Schichten, im Fenster gehalten)
- LIGAKARTE: fuellt auf dem Handy den kompletten Schirm bis zum Menue (Vollbild-Zoom, gleichmaessiges Randpadding); ganz sanfter Nebel zieht von rechts durchs Kartenfenster; das LIGA-Schild bleibt mit kleinem Abstand innerhalb der Karte; KAPITEL-Pill und Weltkarte-Pill sitzen vertikal mittig zueinander
- DER WANDERER steht hoeher (nicht mehr auf den Stationsnamen) und ist einen Hauch groesser
- ZURUECK-GESTE IM SPIEL: verlaesst jetzt die Partie statt die App zu beenden (History-Wache fuer Schnellspiel, Kampagne und Online)

## 0.21.66
- NEUES LOGIN-BILD (die hellere Fassung): Ritter und Titel freigestellt, Schachboden entfernt - und VIEL groesser dargestellt (bis 620px, Spielstand-Schirm 420px)
- AUFSTELLUNG DESKTOP: das Auswahlmenue ist jetzt eine LISTE ueber die volle Breite - grosse Figur (52px), Name fett, Erklaerungstext darunter; Figuren sitzen ueberall MITTIG in ihren Kacheln (neue TileArt statt Brett-Verankerung, das behebt den Versatz)
- REITER-REIHENFOLGE im Hofstaat: Aufstellung, FIGUREN, Ausruestung (Ausruestung ans Ende)
- START-SPLASH traegt jetzt die goldene Wortmarke (statt Vektor-Schriftzug); die Kopfleisten-Logos (Desktop + Mobil) kamen bereits mit 0.21.65

## 0.21.65
- NEUE LOGOS ueberall: Login zeigt den goldenen Ritter (Schachboden aus dem Bild entfernt - Luminanz-Freistellung, das App-Brett uebernimmt), Kopfleiste (Desktop + Mobil) traegt die goldene GRAND-GAMBIT-Wortmarke, App-Symbol/PWA-Icons/Favicon sind das GG-Emblem auf Navy (192/512/maskable/apple-touch neu gebaut)
- WAEHRUNGEN IMMER IM BLICK: Kopfleiste zeigt Gold und Skillpunkte als Chips (Desktop und Mobil), XP-Balken wie gehabt; OFFENE BELOHNUNGEN erscheinen als goldene Zaehler-Plakette am Schatzkammer-Reiter
- STATIONSNAMEN EINMALIG: alle 51 Orte tragen in jeder Liga einen eigenen Namen (510 Namen, keiner doppelt) - Liga I behaelt die Gruendungsnamen, spaetere Ligen benennen nach ihrem Land (Sonnenklippe, Frosthort, Oasenfeste, Moewenwacht ...), der markante Namenskern bleibt erhalten
- MARMOR-SCHALTFLAECHEN ENTFERNT: Buttons (auch im Profil) sind wieder klare Gold-/Panel-Verlaeufe ohne Steintextur
- MOBIL: Figuren-Kacheln in der Aufstellung nochmals groesser skaliert (8vw-Anteil, Roster-Glyphen 50px)

## 0.21.64
- DESKTOP-BREITE: alle Menues laufen jetzt so breit wie die Kopfleiste (1020px statt 720); in der Aufstellung nutzen Auswahlmenue und Slots die volle Breite, Figuren-Kacheln deutlich groesser (Slots bis 46px, Auswahl-Buttons 30px-Bilder, Roster-Glyphen 44px)
- ABTRUENNIG NUR VOR DEM SIEG: die rote "hat sich gegen dich gewandt"-Zeile erscheint nur noch, solange die Station offen ist - nach dem Sieg bleibt allein die Freundschaftskampf-Info
- DIE SAGE SPRICHT AUF DER KARTE: die mystische Herold-Zeile (3. Person) jeder Figur steht jetzt auch im Stations-Panel unter dem Boss - Champions wie Monster; die Rotations-Stationen zeigen die Zeile des aktuell wachhabenden Monsters
- DER DRACHE SCHLUEPFT IN LIGA II: im Drachenhort wacht in Liga I die BRUTMUTTER (eigene Story-Zeile, 1 Sieg, keine Rekrutierung); ab Liga II wartet der Drache (3 Siege) - wer ihn frueher schon rekrutiert hat, behaelt ihn
- WELTKARTE: oeffnet jetzt DORT, wo du gerade bist (Auto-Scroll zur aktuellen Liga), und ueber dem noch verhuellten Land liegt wieder ganz sanfter, treibender NEBEL (zwei geblurte Schichten, 44s/58s Drift)

## 0.21.63
- DER DRACHE IST GROSS (2x2): er belegt jetzt echte vier Felder. AUFSTELLUNG nur ganz aussen; sein Preis: der Nachbarplatz wird zur Drachenschwinge (leer) und die beiden Bauern davor weichen - mit Bestaetigungs-Abfrage im Editor ("Platz machen?"), der Grand Gambit tritt automatisch zur Seite, Rueckbau fuellt die Schwinge wieder
- ZU FUSS langsam (der ganze Block schiebt sich 1 Feld, nie auf Figuren), dafuer GEWICHTS-AURA: nach jedem Setzen nehmen ALLE an den Block gedraengten Feinde ceil(atk/2) Schaden (automatisch, wie besprochen)
- FLIEGEN einmal pro Partie (Faehigkeit L3, Reichweite 2; Weite Schwingen L6: 3; Sturmschwingen L9: 4): der Block springt, Landung auf Gegnern trifft JEDES bedeckte Feld direkt - ueberleben nicht alle, faellt er auf sein Ursprungsfeld zurueck (der Schlag zaehlt trotzdem; steht woertlich in der Faehigkeits-Beschreibung). Im Klassik-Regelwerk darf er den Koenig nie ersticken
- TECHNIK: Schwingen-Marker (D+) leiten Treffer auf den Drachen um, sein Tod raeumt alle vier Zellen, Marker blocken Linien, tragen keine eigenen HP und zaehlen der KI nichts; Zuege/Hash/Speicherstaende bleiben deterministisch. ALTE Spielstaende mit 1x1-Drachen laufen unveraendert weiter (big-Flag nur auf neu gebauten Armeen)
- 19 neue Drachen-Tests inkl. KI-Vollpartie (395 gesamt)

## 0.21.62
- DIE HELLSEHERIN IST DA: eigene Championfigur (Kind SE, sanfte Mystikerin: Damen-Linien mit 2 Feldern Reichweite, HP 3 / ATK 2, Leiter mit Teleport + Fernschuss). Neue Station MONDWARTE (e3) im Wisdom-Zweig direkt hinter der Sturmfeste, spaet in Liga I, 2 Siege - Position auf allen 10 gemalten Ligakarten gesetzt, eigene Vektor-Silhouette, gemaltes Portraet, Sage-Stimme (Herold + Antwort)
- HELLSICHT PRO FAMILIE: die Gabe liegt jetzt bei EINEM Seher je Haus - KRONE: Hellseherin, SCHATTEN: Spaeher (Falke). Die Hexerin gibt die Gabe ab; online zaehlen die Kinds SE und H
- FIGUREN-AUDIT: alle Anzeigewege (Brett, Karten-Medaillons, Vorspann, Siegesbanner, Hofstaat) ziehen aus den NEUEN painted-Dateien; dist-Hash-Vergleich bestaetigt die Auslieferung. Wer alte Figuren sieht, hat noch eine App-Version vor 0.21.58 - einmal komplett schliessen und neu oeffnen
- WELTKARTEN-ANKER VERIFIZIERT: Kontrollbild mit allen 10 Ringen gerendert - L1-L8 sitzen auf der Schneise, L9 auf der Oase, L10 auf der Leuchtturm-Insel

## 0.21.61
- NEUE FIGUREN-GALERIE: alle 25 Figuren aus dem Menschen-Setting eingebunden (Standard-Sechs + 19 Champions), plus ALLE SECHS Gambit-Stufenbilder und die HELLSEHERIN (painted-seeress.webp, wartet auf ihren Spielauftritt). Opake Lieferungen wurden per Rand-Flood-Fill freigestellt (weiche Weiss-Schleier, eingeschlossene Taschen und die Barden-Feder alle sauber), Klassik-Modus behaelt die alten classic-*.webp unangetastet
- GAMBIT 6x10: der Held steigt jetzt bis LEVEL 60 (sechs Stufen a zehn Level). Jede Stufe traegt ihr eigenes Portraet und eine tiefere Gold-Aura (nur fuer die eigene Seite sichtbar). Der Aufstieg wird STEIL teurer: 2/3/4/6/8/10 SP pro Level nach Stufe - der ganze Weg kostet 328 SP. Fuenf weitere Schilde auf der langen Strasse (L34/40/46/52/58, gesamt 11); Staerke kommt weiter ueber +1 HP je Level
- WELTKARTE ALS GEMAELDE: das Overlay zeigt jetzt das hochkant gemalte Reich (Fruehling unten bis Endloses Meer mit Leuchtturm oben). Die 10 Liga-Anker wurden auf der Schneise VERMESSEN (Zeilen-Farbanalyse + hellste-Spalte), erreichte Welten tragen einen hellen Halo auf dem Weg, Kommendes schlaeft unter Nebel und Schloss. Jeder Anker oeffnet seine LIGA-LORE: zwei Saetze je Liga (de+en), verknuepft mit dem jeweiligen Tor-Hueter und der Riss-Sage, plus Reise-Knopf
- DRACHE 2x2 GEPLANT: vollstaendige Spezifikation in DRACHE-2x2-PLAN.md festgehalten (Platzierung aussen, 4-Slot-Verbrauch mit Bestaetigung, Gambit-Auto-Shift, Blockzug, Flug mit Rueckfall-Regel) - Umsetzung folgt als eigenes Versions-Paket

## 0.21.60
- DIE SAGE WAECHST: alle 23 Monster (b01-b22, b24) haben jetzt ihre Stimmen - 44 Figuren insgesamt, jede mit Herold-Satz (3. Person, vor dem Kampf) und direkter Antwort (nach dem Sieg), de+en. Drei neue Schichten der Geschichte: die WACHEN der anderen Seite (Waechter ohne Abloesung, Bollwerk das nie erfuhr was es haelt), die GESCHOEPFE durch die der Riss selbst murmelt (Springbock, Zebra, Zerreisser - abgehackte, unheimliche Stimmen), und die ABTRUENNIGEN des alten Hofes (Richter, Lanzenmeister, Schattenfuerst). Alle 10 Liga-Tor-Hueter tragen das Miete-Motiv weiter, und die Spur zum Endlosen Meer verdichtet sich (Sturmkraehe: "Komm nicht ans Meer", Hueter: ein ungeprobter Schluessel, Koloss: der Deckel auf dem Brunnen)

## 0.21.59
- DIE SAGE VOM RISS: jede der 19 Champions plus Erzfeindin und Ligameister traegt jetzt ihre Zeile einer uebergeordneten Geschichte (content/voices.js, de+en). VOR dem Kampf steht der HEROLD-Satz in dritter Person neben der Figur im Vorspann (episch, kursiv); NACH dem Sieg antwortet die Figur im Siegesbanner in DIREKTER ANSPRACHE an den Wanderer (Zitatkarte mit Namenszeile). In Summe erzaehlen die Herold-Zeilen die Sage: der erste Ligameister oeffnete den Riss, der Hof zerbrach, manche fluechteten mit Fragmenten, manche hoerten den Sog gern - und das Endlose Meer verbirgt die Quelle
- SEHER-KORREKTUR: der "Spaeher" ist der FALKE (nameDe) - die Hellsicht liegt jetzt auf Hexerin + Falke (statt Pfadfinder)

## 0.21.58
- SCHNELLES SPIEL UMSORTIERT: der Modus steht jetzt GANZ OBEN, Klassisch als erste Option (Klassisch | Klassik-Schach... | Duell-Modi), Karte/Gegner/Staerke folgen darunter; Partie-starten-Knopf mit Abstand zum Text darueber
- ELO-FELD SAUBER: native Spinner entfernt (WebKit/Firefox), neutrales Appearance, hellere Goldschrift, Hinweistext gekuerzt ("Die Elo steuert die Staerke der KI.")
- UPDATE-HAERTUNG FUER INSTALLIERTE APPS: Sofort-Check beim Start, controllerchange loest garantiert genau EINEN Reload aus (Gurt und Hosentraeger neben dem Plugin-Hook), pageshow faengt Rueckkehr aus dem Back-Forward-Cache ab (typisches iOS-PWA-Loch), focus-Check zusaetzlich

## 0.21.57
- FUNKEN UND RAUCH KOMPLETT ENTFERNT: der Partikel-Canvas ist raus - die Halle steht still und klar (Hintergrundbild + Licht bleiben)
- HELLSICHT ONLINE: fuehrt ein Spieler Hexerin oder Pfadfinder aktiv im Heer, oeffnet sich vor dem ersten Zug der Spaeher-Moment - und online darf der Seher dabei ZWEI EIGENE Figuren antippen und ihre Plaetze TAUSCHEN (beliebig oft), waehrend der Gegner hinter einem Hinweis wartet: "Der Gegner liest deine Aufstellung und ordnet die eigenen Reihen neu". Beim Beginnen reist die Tauschliste als scoutDone-Nachricht mit (Worker-Relay), der Gegner spiegelt die Tausche - beide Bretter bleiben identisch, die Zug-Hashes stimmen weiter
- Fuehren BEIDE einen Seher, spaehen beide gleichzeitig und das Duell beginnt, sobald beide fertig sind; Uhr und Zuege pausieren waehrend jeder Spaeh-Phase
- WICHTIG: Worker (gg-hall) erneut deployen (wrangler) - das scoutDone-Relay ist neu

## 0.21.56
- NICHTS IST RUNTERLADBAR: Bilder/Canvas/SVG ohne Long-Press-Speichern-Sheet (iOS touch-callout aus), ohne Drag-out, ohne Rechtsklick-Kontextmenue - Eingabefelder und Text behalten ihre normalen Menues
- PULL-TO-REFRESH AUS: das Runterziehen zum Aktualisieren ist abgeschaltet (overscroll-behavior none) - die App haelt sich seit 0.21.42 selbst frisch, die Geste stoerte nur Karten-Pan und Brett

## 0.21.55
- ZWEITER SEHER: auch der PFADFINDER (der Spaeher) traegt jetzt die Hellsicht - aktiv aufgestellt liegt die Gegner-Aufstellung vor dem Horn offen (gleiche Regel wie bei der Hexerin, Texte figurneutral auf Seher umgestellt)
- Prompts fuer die kommende HELLSEHERIN (eigene Figur, silbernes Mondlicht #c9d8f2) und die grosse WELTKARTE (hochkant 1024x2304, zehn Klimazonen von Fruehling bis Endloses Meer, ohne Beschriftung) als Dokument uebergeben

## 0.21.54
- BLICK DER HELLSEHERIN: steht die HEXERIN aktiv in der Aufstellung (nur bewusst gesetzt - Standard-Formationen zaehlen nie), liegt in Kampagnen-Partien nach dem Vorspann die komplette Gegner-Aufstellung offen: das Brett ist sichtbar, Uhr und Aufgeben pausieren, unten eine goldene Leiste mit Kampf beginnen und Zur Aufstellung (zurueck zum Neuordnen). Sie wird gegen Ende von Liga I rekrutiert (2 Siege)
- DER LIGAMEISTER STELLT JEDES MAL NEU AUF: die Burg (n22) mischt ihre hintere Reihe pro Anlauf (seed-basiert) - wer verliert, trifft eine NEUE Formation; nur die Hellsicht verraet sie vorab
- AUFSTELLUNG OHNE VORSCHAU-BRETT: das Brett in der Aufstellung ist raus (vor dem Match kennt man den Gegner ohnehin nicht) - uebrig bleiben die Auswahl-Slots und die Familien-Chips; die Brett-Ansicht lebt jetzt genau dort, wo sie eine Entscheidung informiert: im Spaeher-Moment
- Rauch-Thema ruht wie gewuenscht (Funken/Rauch von 0.21.53 bleiben unangetastet)

## 0.21.53
- ALS WUERDE DIE WELT BRENNEN: die Flammenzungen sind FUNKEN gewichen - kleine gluehende Ausleufer (2-6px), amber geboren, in tiefes Glutrot kuehlend, nervoes flackernd, kurzlebig (1.5-3.5s), aus den untersten Ecken. Kein flaechiges Feuer mehr
- RAUCH VERBLASST UND VERSCHWINDET: die dunklen Schleier verloeschen jetzt hart (fadeOut^2.6), weniger (16 statt 22), alles lebt noch tiefer (Handy stirbt bei 86%, Desktop 74%)
- GPU-Blur 16 -> 9px, damit die Funken ihren Punkt behalten und nicht zu Nebel verschwimmen; Episoden-Rhythmus (mal golden, mal dunkel) bleibt

## 0.21.52
- WELTKARTE: neuer ❖-Knopf oben links auf der Kampagnen-Karte oeffnet die Reise durch alle 10 Ligen - vertikal von Fruehling (unten) bis zum Endlosen Meer (oben), jede Welt als runde Vignette aus ihrer echten gemalten Karte, gemeisterte Welten antippbar (reist dorthin), kommende im Nebel mit Schloss, aktuelle golden markiert
- KAMPAGNE IM HALLEN-LICHT: die Halle mit dem Marmorbrett liegt jetzt wie in allen anderen Menues auch hinter der Kampagnen-Karte; die Karte dockt GANZ OBEN an (kein schwebender Zwischenrahmen mehr) - darunter atmet die Halle
- FIGUREN HELLER: die goldene eigene Seite +16% Helligkeit, der stahlblaue Gegner +7%
- ELO-FELD LESBAR: Goldschrift auf dunklem Grund, zentriert, goldene Kante

## 0.21.51
- KLASSISCH SCHACH ALS SPIELMODUS: dritter Modus im Schnellen Spiel - reines Standardschach (8x8, Matt-Regeln, keine Faehigkeiten, keine Level, beide Seiten die blanke Grundaufstellung)
- ELO-WAHL: statt Leicht/Normal/Schwer gibt es im Klassik-Modus einen Elo-Regler + Zahlenfeld (600-2200, gemerkt im Profil) - die Elo steuert die Suchtiefe der KI (unter 1000: 1, unter 1600: 2, darueber: 3)
- KLASSISCHE FIGUREN EINGEFROREN: die bisherigen Standard-Gemaelde sind als classic-*.webp fest kopiert und haengen NUR am Klassik-Modus - wenn die Kampagnen-Standardfiguren neu (menschlich) bebildert werden, behaelt Klassik die alten Figuren fuer immer
- KLASSISCH ONLINE: eigener Umschalter Duell/Klassisch in der Online-Lobby; der Worker paart Klassik nur mit Klassik (getrennte Warteschlange), Raum spielt Matt-Regeln, Challenges und Rematches tragen den Modus mit (3 neue Worker-Tests)
- WICHTIG: der Worker (gg-hall) muss einmal neu deployt werden (wrangler, siehe DEPLOY-WORKER.md), damit Klassik online greift

## 0.21.50
- FREUNDSCHAFTS-BRETT: Duelle gegen den eigenen Hofstaat (rekrutierte Champions, gefallener Ligameister) spielen auf einem sichtbar freundlicheren Tisch - Marmor-Struktur auf 40% gedaempft, waermerer hellerer Schleier (Elfenbein-Lift .26), ein leiser goldener Hauch ueber dem ganzen Brett, und die frischeste Abnutzungs-Textur des Hauses statt der liga-rauen
- GLANZ-SWEEP RECYCELT: das weiche Gold-Band gleitet jetzt NUR im Freundschaftskampf mit jeder Adern-Welle uebers polierte Brett - dort passt der Glanz; ernste Duelle behalten den nuechternen Stein
- match.friendly kommt aus buildStageMatch (Test: Champion-Station liefert den Freundschafts-Tisch, normale Stationen nicht)

## 0.21.49
- FERNWIRKUNG HALBIERT: Spruenge (longleap u.a.) und Fernschuesse (ranged) treffen in HP-Partien nur noch mit HALBER Wucht (aufgerundet) - Nahkampf behaelt den vollen Biss. Sniper-Burst ist Geschichte
- DER KOENIG HAERTET SCHNELLER: +2 HP pro Level statt +1 (alle anderen +1) - ein gelevelter Hofstaat muss den Koenig belagern, nicht bersten. Level-5-Koenig: 18 HP, Dame daneben: 11
- BRETT-OPTIK KORRIGIERT: das wandernde Glanz-Band (Sweep) ist raus - geblieben ist der Adern-Impuls pro Feld, der versetzt als Welle durchlaeuft (der war fast richtig). NEU: jede Platte traegt wieder ihre 3D-Fase - Lichtkante oben links, Schattenkante unten rechts, als EIGENE Ebene UEBER dem Marmor (die alte Fase lag unter der Marmor-Ebene und war unsichtbar)
- 6 neue Balance-Tests (Sprung halbe Wucht, Nahkampf voll, Schuss halbe Wucht + Schuetze bleibt, Koenig-Skalierung) - 370 Pruefungen gesamt

## 0.21.48
- BALANCE-TESTSUITE: die KI spielt jetzt selbst komplette Partien auf echten Stationen (test_balance.mjs, deterministisch geseedet) und misst die Zuganzahl - Mindestlaengen sind festgeschrieben: kein Blitz-Ende in 2 Zuegen, Burg >= 16 Halbzuege und entscheidend, Spiegel-Armeen >= 20
- ZWEI ECHTE BALANCE-BUGS GEFUNDEN UND GEFIXT: (1) auf KLASSIK-Brettern bekam die KI trotzdem den Liga-Bonus - Level-9-Blink-Laeufer gegen die Level-1-Klassikarmee des Spielers, Matt in 3 Zuegen. Klassik ist jetzt fuer BEIDE Seiten reines Schach (Level 1), die Schwierigkeit kommt ab Liga 3 stattdessen ueber +1 Suchtiefe. (2) der WEITE SPRUNG (knight_longleap u.a.) konnte den eingeklemmten Start-Koenig in Matt-Partien in 2-3 Zuegen ersticken - in Matt-Regeln trifft ein Sprung nie den Koenig (kein Schach aus dem Sprung); HP-Partien unveraendert. Liga-V-Duelle: von 6 auf 101 Halbzuege
- FIGUREN-HOEHE VERMESSEN STATT GESCHAETZT: die sichtbare Masse der Gemaelde sitzt bei ~60% Bildhoehe (Alpha-Schwerpunkt aller 7 Grundfiguren) - rechnerisch zentriert -9.3%. Desktop jetzt -10%, Handy -13% (tools/piece-lift.mjs dokumentiert Messung + Bildvergleich)

## 0.21.47
- RAUCH WIEDER HOERBAR: die letzte Abstimmrunde hatte ihn in die Unsichtbarkeit gedreht (kleine Zungen x niedrige Deckung x gedimmte Dunkel-Episoden x Pausen bis 32s). Jetzt: Zungen 19-51 statt 15-41, Deckung .09/.075 statt .055/.045, Dunkel-Episoden auf 70% statt 55%, Schlieren minimal breiter, Pausen max ~20s statt 32s, und beim Laden steht der Rauch sofort halb da statt bei null zu beginnen. Charakter (Episoden, Schlieren, flach) bleibt

## 0.21.46
- KEIN LIGAMEISTER-REMATCH MEHR: faellt die Burg, BLEIBT die Karte stehen (bisher sprang die Liga sofort um). Der Meister tritt in deinen Hofstaat ueber und haelt seine Burg golden besetzt - jedes Rematch ist ein Freundschaftskampf (25% XP, halbes Gold)
- WEITER-KNOPF: oben rechts oeffnet sich ein goldenes Tor "Weiter - Liga {r}", sobald der Meister gefallen ist - EIN Tipp und die naechste Liga beginnt (advanceLeague: Hofstaat, Zaehler und Dupes reisen mit, Clears und Zoelle setzen zurueck)
- LIGA-NAVIGATION MIT PFEILEN: links "< IX" blaettert in gemeisterte Welten zurueck, rechts "X >" wieder vor (ab Liga II) - der alte Dropdown ist raus, Liga I hat kein Zurueck
- ZURUECK-KNOPF ENTFERNT + HAUPTMENUE AUF DER KARTE: die Tab-Leiste (Hof, Spielen, ...) bleibt auch in der Kampagne sichtbar (mobil unten, Desktop oben) - ein Tipp und man ist am Hof; die Karte misst sich automatisch den Platz darueber ab
- Tests: 356 Pruefungen (Tor verweigert solange der Meister steht, Rollover erst durchs Tor, Kapitaen + See ueber das Tor)

## 0.21.45
- STATIONEN ERZAEHLEN NACH DEM SIEG NEU: eine Station bleibt nur offen, solange dort eine Figur steht
- FREUNDSCHAFTSKAMPF: rekrutierte Champions halten ihren Posten (goldene Figur bleibt auf der Karte) - jedes Rematch gegen den eigenen Gefolgsmann ist ein Freundschaftskampf mit 25% XP und halbem Gold (Chips zeigen die reduzierten Werte, eigener Button-Text, neue Panel-Meldung)
- GEFLOHENE VERSCHWINDEN: nicht rekrutierte Champions und erlegte Monster raeumen die Station - Knopf zeigt deaktiviert Abgeschlossen, Panel-Text erklaert: die Spur ist kalt, Wiedersehen in einer neuen Liga (der Sieg-Zaehler bleibt ligenuebergreifend erhalten)
- Ligameister-Rematch (Burg) bleibt wie gehabt offen; laufende pausierte Partien lassen sich weiterhin fortsetzen
- KONSEQUENZ: mehrfach geforderte Champions (z.B. der Drache mit 3 Siegen) sammeln ihre Siege jetzt ueber Nebenstationen und LIGEN statt ueber Station-Farming

## 0.21.44
- RAUCH: stirbt noch frueher (Handy 84% statt 76%, Desktop 68%), leiser (Alphas gesenkt), noch schlankere und laengere Schlieren (Ellipse .42 x 1.9), kleinere Zungen
- RAUCH-STIMMUNGEN: jede Episode ist mal GOLDEN (amber, weichere Schatten), mal DUNKEL (gedimmte Zungen, kraeftigere blauschwarze Schlieren) - gewaehlt beim Anschwellen
- BRETT-WELLE MIT ECHTEM VERLAUF: ein einzelnes weiches Gold-Band (Gradient quer zur Laufrichtung) zieht als eine Ebene uebers ganze Brett, waehrend die Adern der Platten darunter synchron aufglimmen; alles langsamer (2.6s pro Feld, 2s Versatz, Band 3.6s)
- FIGUREN NOCH HOEHER: Desktop -8%, Handy -12%

## 0.21.43
- RAUCH IN EPISODEN: nicht mehr staendig - eine Phase von 9-17s schwillt an und vergeht, dann steht die Halle 10-32s klar (weiche Uebergaenge, nichts poppt)
- SCHLIEREN STATT BUBBLES: auch die hellen Zungen sind jetzt gestreckte, langsam kippende Ellipsen; kleiner (18-50 statt 26-70), schmalere Spawn-Zonen an den Ecken, weniger Partikel (72+22 statt 96+30), Desktop-Sterbehoehe .55 -> .62
- HALLE AUF MOBIL SICHTBAR: das Hintergrund-Brett waechst auf 142% und hebt sich 7vh ueber das Bottom-Menue - es verschwindet nicht mehr hinter der Navigation
- FIGUREN AUCH AUF MOBIL ANGEHOBEN (-9%, Desktop -6%) - gilt ueberall inkl. Aufstellungs-Vorschau

## 0.21.42
- NIE WIEDER CACHE-LEEREN: die App prueft jetzt selbst auf neue Builds - beim Oeffnen, bei jedem Tab-Fokus und alle 60s. Ist ein neuer Stand da, uebernimmt der Service Worker sofort und die Seite laedt sich EINMAL selbst neu. Nach einem Deploy reicht es, das Spiel am Handy einfach wieder anzuschauen
- Registrierung wandert vom HTML-Snippet in main.jsx (injectRegister aus, keine Doppel-Registrierung)

## 0.21.41
- DAS BRETT ATMET ALS EINS: statt einzeln glimmender Kacheln rollt jetzt gelegentlich EINE goldene Adern-Welle uebers Brett (zufaellige Richtung, ~1.2s Lauf, sanftes Auf- und Abglimmen pro Feld)
- TAKT NACH GEGNERSTAERKE: Intervall als geneigte Ziehung aus 2-60s - je staerker der Gegner, desto oefter faellt sie kurz aus. Endboss/Monster ~ oft, Champions mittel, freies Spiel nach Schwierigkeit; nie dauerhaft, nie hektisch
- FIGUREN AUF DESKTOP ~6% ANGEHOBEN - sie sassen zu tief im Feld

## 0.21.40
- RAUCH AUF MOBIL NOCH FLACHER: Zungen sterben schon bei 76% Hoehe (vorher 68%)
- SCHATTENWESEN IM RAUCH: 30 blauschwarze Schlieren ziehen jetzt DURCH den hellen Rauch - ein zweiter Zeichen-Pass (normal statt additiv, denn additiv kann nie dunkel), gestreckte, traege kippende Ellipsen mit Nachtblau an der Wurzel, das nach oben in Fast-Schwarz verschluckt wird; langsamer und langlebiger als die Zungen, gleiche Ecken, gleiche Sterbe-Hoehe

## 0.21.39
- GLUEH-BUG GEFUNDEN UND GEFIXT: die Gold-Adern-Ebene startete wegen der Animations-Verzoegerung (bis 14s) auf VOLLER Deckung - das ganze Brett gluehte beim Laden, bis jedes Feld seinen ersten Zyklus begann. Jetzt Basis-Opacity .03 + fill-mode backwards + Ebene erscheint erst nach dem Marmor-Preload
- BRETT WIRKLICH HELLER: die Karten geben eigene Feldfarben mit (CLASSIC_SQ) - die bisherige Theme-Aufhellung griff im Spiel nie. CLASSIC_SQ angehoben (hell #6f6a5f -> #8a8371, dunkel #26282d -> #3a3e49), Schleier-Deckung .68/.72 -> .78/.80 mit staerkerem Elfenbein-Lift (.12): heller UND ruhiger, per Ebenen-Mock visuell gegengeprueft (tools/board-mock.mjs)

## 0.21.38
- BRETT HELLER: Feldfarben angehoben (hell #2c3a5c, dunkel #1b2540), Rand-Vignette deutlich weicher (.52 -> .34), waermeres Herzlicht, weniger Eck-Schatten pro Platte
- KEIN LADE-GLUEHEN MEHR: die goldene Lade-Raute ist raus - das Brett steht ab dem ERSTEN Frame in flacher Feldfarbe und ist sofort spielbar; der Marmor-Hauch blendet pro Feld sanft nach (0.6s), sobald der Preload fertig ist. Nichts poppt, nichts glueht, kein Vorhang
- FIGUREN GROESSER: Glyphen 85% -> 90% der Feldgroesse
- FALKE, ATTENTAETER, PFADFINDER auf 2 Siege (alle Stationen dieser Champions, Zaehlung laeuft pro Figur ueber Haupt- und Nebenwege); Tests angepasst: erster Sieg zaehlt nur, der zweite rekrutiert

## 0.21.37
- MARMOR AUF EIN FLUESTERN: jedes Feld traegt jetzt einen Schleier in der EIGENEN Feldfarbe mit ~70% Deckung (vorher pauschal 35% dunkel) - die Struktur ist nur noch ein Hauch, Figuren und Zuege stehen klar im Vordergrund; funktioniert auch mit Karten-Themes, da der Schleier aus der Theme-Farbe gerechnet wird
- Adern-Glimmen ebenfalls halbiert (Spitze .25 -> .14)
- KEIN KACHEL-POPPEN MEHR: alle 18 Marmor-Platten werden VOR dem ersten Brett geladen (Warmstart schon beim App-Oeffnen). Bis dahin atmet eine kleine goldene Raute im Rahmen, dann blendet das fertige Brett in einem Stueck auf (Sicherheits-Timeout 2.5s - das Spiel wartet nie ewig)

## 0.21.36
- GRAND GAMBIT STEIGT AUF: als einzige Figur 3 Stufen x 10 Level (bis 30). Stufe II ab Level 11, Stufe III ab Level 21 - auf dem langen Weg warten vier weitere Schilde (L12/16/21/26, max. 6)
- Der Aufstieg ist SICHTBAR, aber nur fuer dich: eigenes Portraet je Stufe (painted-gambit-t2/-t3 - Platzhalter liegen bereit, deine Bilder ersetzen sie 1:1) plus eine leise goldene Aura auf Brett und Kampagnen-Karte. Der Gegner sieht immer den schlichten Helden
- Hofstaat: die Level-Leiste zeigt beim Gambit die 10 Schritte der AKTUELLEN Stufe, davor Stufen-Sterne (Stufe I/II/III); Verbessern-Knopf laeuft bis 30
- 28 Figuren-Prompts im Boss-Stil als Dokument uebergeben: alle Figuren bekommen wie die Bosse eine Akzentfarbe (Grundfiguren dezent als Einlage, Champions kraeftiger, Gambit dreistufig in Morgengold)
- 5 neue Pruefungen sichern Cap, Stufengrenzen, Schilde und Tier-Uebergabe ab (352 gesamt)

## 0.21.35
- BRETT ALS STEINPLATTEN: fast schwarze Fugen (2px) statt Gold-Grid, Schleier ueber dem Marmor (Struktur ~50% zurueck - die Figuren fuehren, das Brett tritt zurueck), gerichtetes Licht pro Platte (helle Kante oben links, weicher Schatten unten rechts)
- Adern-GLIMMEN statt Dauerpuls: 14s-Zyklus, 85% der Zeit fast unsichtbar (Opacity .05), kurzes sanftes Aufleuchten (.25) - Versatz pro Feld ueber den ganzen Zyklus gestreut, kein Wellen-Effekt mehr
- Buttons zeigen mehr Stein: Gold-Deckung 93% -> 83%
- Der Rauch der Halle stirbt auf dem Handy frueher (flacher) - verdeckt Brett und Karten weniger
- Familien-Pacing der Siege: Standarte (Krone) 3 -> 1, Alchemist und Hexerin (Schatten) 1 -> 2; Test sichert das Muster ab (347 Pruefungen)
- BLAU BIS ZUR ERLOESUNG: Herausforderer bleiben ueberall feindblau (stehende Figuren, Medaillon-Miniaturen, Panel-Portraet), bis sie rekrutiert sind - erst dann Gold. Im Rekrutierungs-Popup blendet das Portraet sichtbar von Blau nach Gold ueber
- Das Panel besiegter Stationen erzaehlt den Ausgang: "Abgeschlossen - X dient nun deinem Gefolge" / "Besiegt xN - X konnte erneut fluechten" / "Abgeschlossen"
- KARTE FREI VERSCHIEBEN: ein Finger (oder die Maus) zieht das Kartenfenster ueber die Welt, die Kamera kehrt beim naechsten Schritt zum Wanderer zurueck
- LIGA-RUECKBLICK: ab Liga II waehlt eine Pille neben dem Zurueck-Knopf jede gemeisterte Welt zum Betrachten (nur Ansicht - ohne Schloesser, Nebel und Wanderer; alle Wege liegen offen)
- Karten-Chips (Karte/Modus/Schwierigkeit/XP/Gold) in Serifen - die Karte ist jetzt 100% Serife
- Doku bereinigt: Repo ist OEFFENTLICH - Zugangsdaten, Konto-IDs und Projekt-Refs aus allen Doku-Dateien entfernt (Grundregel dokumentiert)

## 0.21.34
- ADERN-PULS, ECHT: aus den beiden neuen Texturen (schwarzer Goldadern-Marmor + Leuchtmasken-Variante, deckungsgleich geschnitten) bekommen die dunklen Felder ihr Glow-Overlay exakt auf den Adern - jedes Feld atmet mit eigenem Versatz (screen-Blend, 6s), Reduced-Motion respektiert
- Buttons: der Marmor sitzt jetzt SANFT - Gold-Siegel wie gewohnt, darunter nur ein Hauch Steinstruktur (93% Deckung), dunkle Buttons analog
- Stationskarte der Gegner: grosses Portraet links (84x108), Name in Serifen, darunter einfarbig Leben - Angriff - Familie (Kronenfiguren/Schattenwesen). Kein "Gegner:"-Praefix, kein "Bewegungen unbekannt" mehr
- Zurueck-Knopf der Karte: dunkles Glas mit Blur, goldene Serifen - statt Pergament-Pille
- Karte auf dem Handy: minimales Seitenpolster (6px)

## 0.21.33
- FIX: die Kampagnenkarte war nach dem Top-Bar-Umbau am Desktop schwarz (das Spalten-Layout gab ihr keine Hoehe) - behoben
- Figuren stehen jetzt IMMER buendig ueber ihrem Lebensbalken (Fuesse auf den Punkten), in Aufstellung und Kampf
- Der Umschalter fuer simple SVG-Figuren ist entfernt - es gibt nur noch die gemalten Figuren
- Ueberall nur noch GEGNER: das Karten-Panel verraet weder Art noch Sieg-Rauten. Erst nach dem Kampf: "X schliesst sich deinem Gefolge an!" oder "X konnte fluechten ..."
- ONLINE: vor dem ersten Verbinden fragt der Herold nach deinem Anzeigenamen - mit Wuerfel-Knopf fuer Namen aus der Welt des Spiels (Eherner Turm IV, Stiller Falke, Wandernder Gambit ...)
- Marmor auch auf den Knoepfen: CTA-Buttons aus der goldgeaederten Platte, ruhige Buttons aus dunklem Stein - mit Verlauf fuer klare Lesbarkeit
- Datenschutz-Kurzhinweis aktualisiert (Konto, Cloud-Sicherung und Online-Duell erwaehnt statt "bleibt nur auf diesem Geraet")

## 0.21.32
- MARMOR-BRETTER: die Spielfelder tragen jetzt die Optik der dunklen Marmorhalle - jedes Feld ist eine echte Steinplatte, aus dem Referenzbild geschnitten (6 helle + 6 dunkle Varianten, per Feld-Hash deterministisch verteilt, ~75 KB gesamt). Goldene Fugen zwischen den Platten, Vignette mit warmem Lichtherz ueber dem Brett
- ERSTER PULS: ein langsamer goldener Glanz (Overlay-Blend, 6s-Atem) laesst die Goldadern im Stein periodisch aufleuchten - respektiert prefers-reduced-motion. Echte adern-genaue Leuchtmasken koennen spaeter folgen
- Auswahl-, Zug- und Treffer-Markierungen liegen unveraendert ueber dem Stein

## 0.21.31
- Desktop: das Grand-Gambit-Menue sitzt jetzt als TOP-BAR ueber dem Inhalt (Wortmarke - Reiter in einer Reihe - Level rechts, sticky), statt als Seitenleiste links
- Die kleinen Eck-Rauten in den goldgerahmten Boxen (Kontostand, Schatzkammer usw.) sind entfernt
- Rauch-Feintuning: die Zungen duerfen deutlich weiter Richtung Bildmitte entstehen, steigen dafuer weniger hoch (loesen sich unterhalb der Bildmitte auf) und einen Hauch gemaechlicher

## 0.21.30
- Rauch komplett neu nach Feedback: schneller und FLAMMENARTIG - viele kleine Zungen steigen aus den unteren Ecken auf, flackern seitlich und ueberlagern sich zu dichten Koerpern (warm am Fuss, rauchig-kuehl oben)
- Butterweich statt pixelig: halbe Render-Aufloesung plus GPU-Blur (16px) auf dem Canvas - keine sichtbaren Kanten mehr
- TIEFE: die Zungen schrumpfen beim Aufstieg, werden langsamer und dunkler und ziehen einen Hauch Richtung Fluchtpunkt - als wuerden sie in der Halle verschwinden; oberhalb von ~30% Hoehe loest sich alles auf
- Der Rauch bleibt strikt in den unteren Ecken verankert (Rueckstellkraft zum Emitter) und laeuft weder in die Bildmitte noch ueber UI-Elemente
- KEINE Spuren mehr: der Trail-Puffer ist raus, jede Frame wird sauber geleert - nichts verweilt

## 0.21.29
- Hintergrund-Feinschliff nach Feedback: das Marmorbrett ist deutlich kleiner eingebettet (max. 1080px, engere Nacht-Maske) - besonders am Desktop wirkt es jetzt wie ein Fenster in die Halle statt wie eine Tapete
- Der Rauch ist neu choreografiert: nur noch WENIGE (hoechstens drei), GROSSE, LANGSAME Schwaden, die ausschliesslich in den unteren Ecken geboren werden und auf Bogenbahnen nach innen ziehen - ihre stehenbleibenden Spuren malen SICHELN. Zwischen zwei Geburten vergehen 5-16 Sekunden; eine Sichel lebt ca. 20-35 Sekunden
- Die Spielstand-Auswahl (Login) traegt jetzt ebenfalls Halle und Rauch - getoent nach der hoechsten Liga deiner Spielstaende

## 0.21.28
- NEUER APP-HINTERGRUND: die dunkle Marmorhalle (Schachboden mit Goldadern) liegt jetzt hinter Menues, Hub und Hofstaat - smart eingebettet statt gestreckt: eine weiche Maske laesst das Bild an allen Raendern in die Nacht verlaufen, dadurch passt es auf jede Bildschirmgroesse
- MYSTISCHER RAUCH darueber: keine runden Wolken, sondern schweifartige Schwaden - Partikel reiten ein gekruemmtes Stroemungsfeld, ihre Bahnen bleiben als verblassende Spuren stehen (Canvas, destination-out). Steigt wie in der Vorlage von den Flanken auf
- Der Rauch-FARBTON wandelt sich sanft mit der Liga (I Nacht & Gold, II Violett, III Moorgruen, IV Nachtrose, V Stahl, VI Glut, VII Petrol, VIII Bernstein, IX Wueste, X Tiefsee-Silber)
- Ruecksichtsvoll: pausiert im Hintergrund-Tab, respektiert prefers-reduced-motion, laeuft nicht im Match oder auf der Kampagnenkarte

## 0.21.27
- ZWEI FAMILIEN statt drei: KRONENFIGUREN (Schildtraeger, Barde, Paladin, Inquisitor, Standarte, Techniker, Kanzler, Erzbischof, Kapitaen, Magier) und SCHATTENWESEN (Falke, Attentaeter, Kundschafter, Drache, Amazone, Alchemist, Hexerin, Hexer, Stratege). Mischen bleibt immer erlaubt - aber je mehr man sich einer Seite verschreibt, desto staerker ihr Geschenk:
  - Krone: ab 2 Schildwall (benachbarte Kronenfiguren -1 Schaden, LEBEND: broeckelt wenn der Hof faellt), ab 4 zusaetzlich +1 max. Leben je Kronenfigur, ab 6 wehrt der Wall 2 ab
  - Schatten: ab 2 ein Zeitriss pro Partie, ab 4 zusaetzlich +1 Angriff je Schattenwesen und ein zweiter Riss, ab 6 ein dritter
- BOSSE sind eine eigene Rubrik: genau 10 LIGA-BOSSE, einer als Endgegner jeder Liga (I Ligameister, II Richter, III Doppelritter, IV Schattenfuerst, V Hueter, VI Blutmagd, VII Lanzenmeister, VIII Eisenfaust, IX Kanonier, X Koloss). Jeder traegt eine AURA, die die GANZE Partie beugt (z.B. "Das Urteil: gegnerische Traenke verboten", "Blutzoll: Angriffe der Verbuendeten heilen", "Unerschuetterlich: alle Verbuendeten wehren 1 Schaden ab")
- Wer eine Liga gewinnt, gewinnt ihren Boss: er darf fortan ANSTELLE DER DAME in der eigenen Aufstellung marschieren - maximal EIN Boss auf dem Feld, seine Aura dient dann dir. Auswahl im Hofstaat-Picker unter "Liga-Bosse"
- Stations-Monster behalten schlankere Rotationen; die Erzfeindin haelt weiter den Aschenpass

## 0.21.26
- DIE DREI HAEUSER: jede rekrutierbare Figur gehoert einer von drei Familien an - und Familien, die gemeinsam antreten, wecken Kollektiv-Eigenschaften:
  - JAGDRUDEL (Klingen: Falke, Attentaeter, Kundschafter, Drache, Amazone, Kapitaen): +1 max. Leben je weiterem Rudelmitglied in der Aufstellung (max +3)
  - ZIRKEL (Magie: Magier, Alchemist, Hexerin, Hexer, Erzbischof, Stratege): 2 Mitglieder schenken einen ZEITRISS pro Partie, 4 Mitglieder zwei - ein Riss laesst den naechsten eigenen Zug das Zugrecht behalten (Doppelzug)
  - SCHILDWALL (Ordnung: Schildtraeger, Barde, Paladin, Inquisitor, Standarte, Techniker, Kanzler): wer orthogonal neben einem Ordnungs-Verbuendeten steht, erleidet 1 Schaden weniger (min 1)
- Boni gelten fuer beide Seiten - auch Gegner-Formationen mit Familienmitgliedern profitieren (die KI zuendet nur keine Zeitrisse)
- Hofstaat zeigt Familien-Rauten an den Karten und unter der Aufstellungs-Vorschau die Muster-Zeile mit aktiven Boni; im Kampf sitzt der Zeitriss-Knopf neben dem Trank
- Zeitrisse ueberleben Speichern/Laden (Codec); vorerst nur Solo-Partien (Online folgt)

## 0.21.25
- Das Bestiarium marschiert komplett auf: die fuenf Monster-Stationen (Vergessener Schrein, Klingenschlucht, Geisterfeld, Grenzwall, Sturmfeste) rotieren ihren Champion pro Liga - thematisch gruppiert (Schrecken des Erwachens, schnelle Killer, Schemen & Blutmagie, eiserne Golems, Taktiker). Ueber die Ligen hinweg treten damit alle 23 benannten Monster auf, jedes mit seinem eigenen Portrait. Liga I bleibt unveraendert; ab Liga II warten neue Gegner an bekannten Orten
- Nichts wurde ersetzt: die 23 Unikat-Portraits gehoeren zu Bossen, die es in der Spiellogik laengst gab (eigene Namen, Werte, Zugmuster) - sie teilten sich nur fuenf generische Familienbilder und waren zu 18/23 nie in der Kampagne verdrahtet

## 0.21.24
- Die Galerie ist komplett: alle 23 uebrigen Monster-Bosse (b01-b22, b24) haben jetzt ihr eigenes gemaltes Unikat-Portrait - auf der Kampagnenkarte, im Stationspanel, auf dem Brett und in der Flucht-Animation. Sechs Rohbilder kamen mit weissem Hintergrund und wurden freigestellt (Flood-Fill vom Rand, beim Zebra zusaetzlich das eingemalte Transparenz-Schachbrett entfernt)

## 0.21.23
- Rekrutierung neu gedacht: kein Liga-Gating mehr - stattdessen fordern starke Figuren MEHRERE Siege, bevor sie beitreten (3 Siege: Drache, Amazone, Standarte - 2 Siege: Hexer, Inquisitor, Stratege, Techniker, Kanzler, Erzbischof - alle anderen treten beim ersten Sieg bei). Der Zaehler zaehlt jeden Sieg, Replays inklusive, und ueberlebt den Liga-Wechsel
- Das Stationspanel zeigt bei stoerrischen Champions die Sieg-Rauten ("Siege bis zum Beitritt: x/y")
- Besiegte, nicht rekrutierte Champions FLIEHEN nach dem Sieg sichtbar nach rechts aus der Karte - danach markiert nur noch ein Haken die Station. Rekruten treten stattdessen dem Hofstaat bei
- Rekrutierungs-Vorstellung im Siegesbanner: gemaltes Portrait, Name, Zitat und ein grober Steckbrief (Faehigkeiten, Schilde, Maximalstufe) plus direkter "Zum Hofstaat"-Knopf zum Weiterleveln
- Die roten Schwierigkeits-Punkte unter den Stationsnamen sind weg (verstand niemand)
- Grand Gambit steht auf der Karte jetzt knapp ueber dem Stationsnamen und ist scharf (die permanente Subpixel-Atmung ist raus)

## 0.21.22
- Kampagnen-Pacing entzerrt: Liga I schenkt nur noch vier Rekruten (Falke, Magier, Schildtraeger, Erzbischof) - alle anderen Figuren-Bosse kaempfen zwar von Anfang an, treten aber erst ab ihrer Liga bei (II: Attentaeter/Alchemist/Barde/Kanzler, III: Kundschafter/Hexerin/Paladin/Techniker, IV: Drache/Hexer/Inquisitor/Stratege, V: Standarte/Amazone). Bis dahin gibt es Gold und XP - das Panel sagt "tritt ab Liga N bei"
- Liga I spielt (fast) nur auf dem klassischen Brett - nur die Ligafeste behaelt ihre Arena. Neue Bretter kommen gestaffelt: Liga II Schneise, Liga III Hof & Spiessrutenlauf, ab Liga IV alles
- Brett-Texturen variieren ab sofort pro Station: jede Partie wuerfelt ihr Holz deterministisch aus einem Pool, der mit der Liga rauer wird - inkl. neuer sehr rauer dunkler Tafel (tex-wear-4)
- Wanderer steht tiefer am Boden, gleitet mit leichter Kippung in Laufrichtung statt zu huepfen und zieht einen goldenen Schweif hinter sich her, der nach der Ankunft verblasst; im Stand nur noch ein ruhiges Atmen

## 0.21.21
- Liga-Aufstieg sichtbar gemacht: an der geschafften Ligafeste heißt der Knopf jetzt "Ligameister fordern -> Liga II" statt "Nochmal" - ein erneuter Sieg eröffnet die nächste Liga
- Aufgeräumt: versehentlich committetes Test-Backup entfernt, server/backups/ ignoriert

## 0.21.20
- Figuren stehen jetzt mittig in der Feldhöhe statt am unteren Feldrand; die Lebenspunkt-Kugeln bleiben an der Unterkante
- Liga-Aufstieg entsperrt: Wer die Ligafeste bei voll freigespielter Karte erneut bezwingt, steigt in die nächste Liga auf (vorher Sackgasse bei 100%)
- Kampagnenkarte: der Wanderer ist jetzt das gemalte Grand-Gambit-Porträt; der Zurück-Knopf trägt Pergament statt Nachtblau
- Brett-Badges harmonisiert: Stärke-Klingen und -Zahl in Lack-Tönen statt Neon (Gold für dich, Stahl für den Gegner), Level-Raute antiker und ohne grellen Glow
- Lebenspunkt-Kugeln einen Hauch heller

## 0.21.19
- Kampagnenkarte: an jeder Boss-Station steht jetzt die detailreiche gemalte Figur — stählern-dunkel bis zum Sieg, in warmem Lack sobald sie dem Hofstaat beigetreten ist; auch das Stations-Panel zeigt das Gemälde
- Glanzeffekte gezähmt: der Lichtlauf über Buttons und Rahmen kommt deutlich seltener (ein kurzer Schimmer alle ~11 s) und mehrere Glanzflächen auf einer Seite laufen zeitversetzt statt im Chor
- Figuren stehen höher im Feld: unter ihnen ist jetzt Platz für die Lebenspunkte, die als dunkelgrüne Glaskugeln fast an der Unterkante des Feldes ruhen — die Figur immer darüber
- Level als goldene Raute mit Zahl oben rechts an der Figur — auf dem Brett, in der Aufstellung und überall wo Figuren gezeigt werden (ab Stufe 2)
- Fähigkeits-Punkte in den Farben ihrer Kategorie bleiben rechts neben der Figur

## 0.21.18
- Duell-Worker deployed: Rangliste zeigt nur noch Spieler mit gespielten Partien oder Online-Status (Karteileichen mit 0 Spielen gefiltert); eigener Rang-Eintrag mit Fallback wenn ungelistet
- Aufgeräumt: temporäres Deploy-Bundle gg-hall-fix.js und CORS-Freigabe aus public/ entfernt

## 0.21.17
- Hauptmenü: Karten-Hintergrund-Schimmer entfernt — Glanz liegt jetzt gezielt auf den drei Aktionen "Fortsetzen", "Spielen" und "Verbinden", im gleichen Gold-Design mit heller Kontur wie die übrigen Highlight-Buttons
- Spielen-Symbol neu gezeichnet: gekreuzte Schwerter in klaren Strichen (runde Kappen) statt überlappender Flächen — keine seltsame Vereinigung mehr in der Mitte
- Figuren: zugeklappte Kacheln sind pro Zeile exakt gleich hoch; die GANZE Kachel öffnet per Klick; aufgeklappt nimmt die Karte die volle Breite ein, der Nachbar rutscht darunter

## 0.21.16
- Boss-Gemälde repariert: Kampagnen-Konkurrenten zeigten gar kein Bild (Zuordnung suchte "boss-01" statt der Art-Familie) — jetzt eigenes Porträt zuerst, dann Erzfeindin/Ligameister, dann Familien-Gemälde (Golem/Bestie/Schlange/Schemen/Tyrann)
- Karten-Wording: Figuren-Stationen heißen "Neue Figur", Unikate "Konkurrent" — nur die Ligafeste trägt noch "Endboss"
- SEO-Feinschliff: doppeltes canonical und relatives twitter:image entfernt, og:url + og:image-Maße/alt ergänzt, sitemap.xml angelegt und in robots.txt verlinkt

## 0.21.15
- Crash behoben: Held-Fähigkeiten (Tag "List") ließen den Figuren-Tab beim Verbessern abstürzen — Tag ergänzt, Anzeige zusätzlich abgesichert
- Glanz nur noch dort, wo die UX hinzeigen will: Reiter und Profil-Regler sind ruhig-gold ohne Schimmer; dafür leuchten jetzt "Verbessern", "Erwerben" und "Partie starten" im Einfordern-Glanz
- Figuren-Tab als Akkordeon: Karten zeigen Figur, Werte und Zitat — ein Tipp klappt Leveln und Fähigkeiten auf (eine Karte offen)
- Noch gesperrte Fähigkeits-Kacheln deutlich lesbarer (heller, sichtbare Umrandung)
- Brett-Figuren wieder größer und höher gestellt; Lebens-Bubbles kleiner und ganz unten an der Feldkante; Level-Rauten kleiner und golden leuchtend
- Online-Rangliste zeigt nur noch echte Duellanten (mind. ein gewertetes Duell) und wer gerade online ist; Cloud-Sicherung ist nur noch für Admin-Konten sichtbar (die automatische Sicherung beim Verbinden läuft für alle weiter)

## 0.21.14
- Figuren stehen jetzt sauber mittig im Feld (Brett wie Aufstellung), mit klarem Abstand zum Feldrand
- Lebenspunkte als glänzende kleine Glas-Bubbles direkt unter der Figur — mit Lichtpunkt, passend zum lackierten Look der Figuren; Riesen (>10 Leben) behalten einen schmalen Balken
- Kampfkraft: Klingen-Symbol jetzt über der Zahl, links neben der Figur vertikal mittig
- Desktop scrollt nicht mehr: die eingebaute Vergrößerung wird bei allen Vollbild-Höhen herausgerechnet (Match, Kampagne, Hub-Zentrierung, Aufstellungs-Brett)
- Spielen-Symbol in der Navigation: echte gekreuzte Schwerter mit Parierstange und Knauf (die Pfeile sind Geschichte)
- Liga-Ziffer im Schild exakt auf 50% / 47.5% gesetzt

## 0.21.13
- Figuren-Overlays neu: Level als kleine Gold-Rauten oben mittig (keine Zahlen-Plakette mehr), Lebenspunkte als dezente Punkte unten mittig (statt breitem Balken), Kampfkraft als Zahl über gekreuzten Klingen links neben der Figur, Fähigkeits-Punkte in Talentfarben rechts — verbrauchte Einmal-Fähigkeiten ergrauen
- Figuren stehen mit kleinem Abstand über dem Feldrand (Brett wie Wahlfelder), kleben nicht mehr am Boden
- Aufstellung auf Desktop als Ein-Bildschirm-Layout: großes Brett links (skaliert mit der Fensterhöhe), Wahlfelder, Heldenposition und Speichern rechts daneben — kein Scrollen mehr
- Reiter (Aufstellung/Ausrüstung/Figuren u. a.): aktiver Tab trägt jetzt den schimmernden Einfordern-Glanz der Schatzkammer
- "Charaktere" heißt jetzt "Figuren"; der Verbessern-Knopf zeigt den Preis immer direkt im Button
- Neues Schatzstück in der Ausrüstung: der Sternensplitter — ein Skillpunkt für 45 Gold, streng rationiert auf zwei je erreichter Liga
- Match-Brett auf Desktop mit fester Luft nach oben und unten

## 0.21.12
- Charaktersystem neu aufgebaut: Fähigkeiten sind jetzt gleich große Kacheln (Desktop zweispaltig) mit Gold-Rahmen — erworbene glimmen in ihrer Talentfarbe mit Gold-Raute, erwerbbare tragen einen goldenen "Erwerben"-Knopf (die Spitzhacke ist Geschichte), kommende sind gedimmt, tiefere bleiben verhüllt
- Fähigkeits-Erklärungen verschwinden nie mehr: Jede enthüllte Fähigkeit zeigt ihren Text dauerhaft — vor dem Kauf, nach dem Kauf (nebenbei einen Alt-Bug behoben, durch den Kaufzeilen nie eine Beschreibung zeigten)
- Schatzkammer-Glanz wandert weiter: Kontostand im Hofstaat und der Profil-Kopf tragen jetzt den goldenen Rahmen mit Eck-Rauten und Lichtstreif
- Aufstellung: Brett auf Desktop deutlich größer (560px), Figuren in den Wahlfeldern höher gesetzt, Vorschau zentriert
- Hauptmenü jetzt auch im schmalen Layout vertikal zentriert; Akademie-Zeile als würdige Kachel gestaltet
- Neues Klingen-Icon (Spielen): elegante gekreuzte Schwerter mit Parierstange und Knauf

## 0.21.11
- Desktop-Feinschliff: Auf großen Bildschirmen skaliert die App bei 100 % Browser-Zoom sanft mit (eingebaute Vergrößerung ab 1440/1760 px) — nichts wirkt mehr verloren klein
- Spielstand-Auswahl vertikal zentriert; Liga-Ziffer im Schild kleiner und optisch mittig
- Startmenü (Hub) auf Desktop vertikal zentriert; Kampagnen-Spalte breiter (920 px)
- Hofstaat: Figuren-Gemälde deutlich größer (62×80) und antippbar — ein Tipp öffnet das Gemälde groß als Lightbox mit Name und Spruch, ein Tipp schließt
- Aufstellungs-Vorschau zentriert
- Profil: neuer Abschnitt "Spielstand & Konto" mit "Spielstand wechseln" (zurück zur Auswahl) und "Abmelden"

## 0.18.0

**Die Halle — Multiplayer auf Durable Objects**

- **Der Spielserver läuft jetzt als Cloudflare Worker mit einem SQLite-Durable-Object** („Hall"): WebSocket-Hibernation (im Leerlauf 0 Kosten, Verbindungen bleiben stehen), Spieler/Elo/Freunde/Vault im eingebauten SQLite — überlebt Schlaf und Deploys, läuft im **Workers Free Plan**. Deploy in 5 Minuten: `cd worker && npx wrangler deploy`, dann `SERVER_URL` eintragen (DEPLOY-WORKER.md).
- **Protokoll 1:1 portiert**, Client unverändert: score-gebandetes Matchmaking (Band wächst mit Wartezeit), Elo K=32, Zug-Relay mit Hash, Resign/Disconnect-Wertung, Rematch-Fenster 2 min mit Seitenwechsel, Freunde + Anfragen + Brieftauben-Geschenk, Privatsphäre „nur Freunde", Cloud-Vault (5 Snapshots), Duell-Bestenliste, token-gesicherte Admin-Kommandos (konstante Vergleichszeit, Lockout nach 5 Fehlversuchen).
- **Kern als testbare Logik ausgekoppelt** (`worker/src/logic.mjs`, storage-agnostisch): neue Suite mit **29 Protokoll-Tests** — Identitätsschutz, Band-Erweiterung, Relay, Elo-Nullsumme, doppelte Ergebnis-Meldungen, Rematch-Ablauf, Vault-Rotation, Admin-Lockout. Gesamt jetzt 11 Suiten.
- Der alte Node-Server bleibt als Referenz unter `server/` liegen.

## 0.17.0

**Wappen, Bestenlisten & feine Schlösser**

- **Das neue Logo ist im Spiel:** Der Login-Bildschirm trägt jetzt das goldene Grand-Gambit-Wappen (weich in den Hintergrund eingebettet), und der **Grand Gambit auf der Kampagnenkarte wurde nach der Logo-Figur neu modelliert** — Kugel-Kopf mit Glanzlicht, doppelter Kragenring, glatter konischer Körper, Rauten-Emblem mit Vierstrahl-Stern, gestufter Doppelsockel, Licht von links.
- **Bestenlisten & Statistiken:** Der Erfolge-Tab hat einen zweiten Reiter „Bestenlisten": dein eigener Fortschritt (%, Liga, Spielzeit, schnellster Liga-I-Durchlauf, Zug-Bestwerte) plus drei Ranglisten — Fortschritt, schnellster Durchlauf, wenigste Züge — mit ausdrücklichem „Bestwert teilen" und „Als Text kopieren" (System-Share). Das Spiel erfasst dafür ab jetzt **Züge pro Levelsieg** (nur Verbesserungen zählen) und die **Durchlaufzeit** vom ersten Sieg bis zum Thron. Die Listen laufen über die geteilte Speicherschicht: heute gerätelokal, **automatisch weltweit, sobald Supabase konfiguriert ist** — inklusive Hinweis im UI.
- **Spielstand-Werkzeuge sind jetzt Admin-Sache:** Exportieren/Importieren und die Wiederherstellungspunkte erscheinen im Profil nur noch für Admin-Konten.
- **Passwort statt PIN:** Der Sperrschutz akzeptiert jetzt vollständige Zeichenfolgen (beliebige Zeichen, 4–64), gehasht wie gehabt — bestehende Ziffern-PINs bleiben gültig.
- **Mehr Login-Wege:** Neben Google stehen **Apple** und **Discord** bereit (echte Markenzeichen, gleiche Ein-Klick-OAuth-Mechanik, aktiv mit Supabase).
- Testsuite auf 37 Prüfungen erweitert (Rekorde, Ranglisten-Merge, Kappung, Eigen-Upsert).

## 0.16.0

**Der Einstieg wie bei den Großen**

- **Login vor dem Spiel:** E-Mail + Passwort, „Mit Google anmelden" und ein Gast-Zugang. Läuft heute komplett offline über Gerätekonten (Passwörter salted-gehasht); sobald Supabase konfiguriert ist (SUPABASE-SETUP.md, 10 Minuten), übernehmen echte Cloud-Konten Google- und E-Mail-Anmeldung automatisch — der Code ist fertig verdrahtet.
- **Mehrere Spielstände pro Konto:** Nach dem Login wählst du deinen Spielstand — jede Karte zeigt Liga, geschaffte Stationen, **Fortschritt in %**, **Spielzeit** und „zuletzt gespielt", mit Fortschrittsbalken, Umbenennen und Löschen. Die Spielzeit tickt nur, während das Spiel sichtbar ist. Ein vorhandener alter Spielstand wird beim ersten Login automatisch als „Übernommener Spielstand" importiert.
- **Admin-Konto eingebaut:** `admin` mit Standard-Passwort (Warnhinweis bis zur Passwort-Änderung). Admins bekommen pro Spielstand den **Fortschrittsregler: 0 %, 100 % oder jeder Wert dazwischen** — gesetzt in Reise-Reihenfolge, mit passendem Gold/XP und freigeschalteten Bossen.
- **Meta sauber:** OpenGraph/Twitter-Karten mit eigenem Vorschaubild (og.jpg aus dem Frühlings-Artwork), Canonical auf grandgambit.win, Apple-Touch-Icon.
- Neue Testsuite (27 Prüfungen) für Konten, Spielstände, Fortschrittsregler und Migration — plus ein still gewordener Smoke-Test, der wieder scharf ist (jpg-Loader fehlte).

## 0.15.0

**Die ganze Welt ist gemalt**

- **Sechs neue Welten:** Hochgebirge (V), Ödland (VI), Steppe (VII), Roter Canyon (VIII), Wüste (IX) und das Endlose Meer (X) sind jetzt gemalte Karten — analysiert mit paletten-unabhängiger, lokal-adaptiver Kreiserkennung (mit Lochfüllung für die große Endgegner-Fläche), Knoten per Optimierung + Reparaturlauf zugewiesen, inklusive der jeweiligen Liga-Sonderorte (Seilbahnstation, Schwarzes Tor, Karawanenrast, Gesprengter Pass, Verborgener Schrein, Ankerbucht).
- **Neun neue liga-eigene Orte** füllen die restlichen echten Kreise — jede Welt bekommt Eigenes: Steppe: *Grasmeerwacht*, *Termitenturm* (Techniker-Boss). Wüste: *Singende Düne*, *Karawanengrab*, *Skorpionnest* (Attentäter-Boss). Ödland: *Aschequelle*, *Knochenacker*, *Schlackenfeld* (Alchemist-Boss). Canyon: *Echoschlucht*. Alle mit eigener Story (DE/EN), Sackgassen-Boni, drei davon rekrutierbare Bosse — 50 Stationen insgesamt.
- **Gemalte Karten, zwei neue Regeln:** Ortsnamen stehen jetzt überall **leicht unterhalb der Fläche**, und der Grand Gambit steht **mittig auf seiner Lichtung** (statt links daneben).
- 235 Tests grün; Ligen V–X laden als eigene Dateien, Single-File enthält alle zehn Welten.

## 0.14.0

**Volle Karten, ruhiges HUD**

- **Alle vier Welten sauber neu analysiert — jede helle Fläche trägt jetzt ein Level.** Vollzuweisung statt Snap: Frühling 35/35, Sommer 33/33 (handkuratiert), Herbst 34/34, Winter 33/33 gemalte Kreise belegt. Dafür gibt es ein neues Level: der **Stille Hain** (oben links am Wasserfall, Abstecher von der Silbermühle — „Ein Hain, in dem kein Vogel singt.") — 35 Stationen insgesamt.
- **HUD entschlackt:** Das „Kampagne · Liga"-Badge, das die Kapitel-Pille verdeckte, ist weg — links steht nur noch Zurück, die Kapitel-Anschrift ist frei sichtbar; rechts bleibt ein schlanker Fortschritts-Zähler (z. B. 12/35). Die Liga steht weiterhin auf der Karte selbst.
- **Zoom-Knöpfe entfernt:** Die Karte skaliert automatisch passend (Desktop mit ruhigem Rahmenabstand, mobil bildfüllend) — kein + / − mehr.
- **Ortsnamen kompakter:** Zweizeilige Namen wie „Vergessener Schrein" sitzen jetzt eng (Zeilenhöhe 0,92 statt luftig) unter ihrem Licht-Halo.

## 0.13.0

**Gerahmte Welt**

- **Die Karte lebt jetzt in einem gerundeten Rahmen:** Egal welches Bildschirmformat — die Welt füllt den Rahmen randlos, übrige Fläche bleibt dunkles Chrome (Letterbox zentriert), die Kanten sind weich gerundet. Zurück-Pille, Liga-Badge, Zoom und das Orts-Panel liegen **immer innerhalb der Karte** mit sauberem Abstand zum Rand.
- **Level-Box fix links unten:** Das Orts-Panel dockt dauerhaft unten links im Rahmen an (14 px Padding, scrollt bei Platznot) statt am Medaillon zu springen.
- **Federschrift auch im Panel:** Der Levelname steht in der Kapitel-Schrift (IM Fell, 20 px) — der Fließtext bleibt in gut lesbarer Schrift. Gehört das Level zu einem Pfad, begrüßt dich der Pfadname („Pfad der Klingen") in Federschrift am **ersten Level des Zweigs** — die schwebenden Wimpel auf der Karte sind dafür komplett verschwunden.
- **„Herausforderung starten" in Gold-Glas:** halbtransparentes Gold mit Blur, heller Kante und einem leise wandernden Glanz.
- **Ortsnamen mit Licht-Halo:** Hinter jedem Namen liegt ein weicher radialer Hell-Verlauf (geblurt, konturlos, nach außen in alle Richtungen voll transparent) — lesbar auf jedem Untergrund. Das Wort „START" ist von der Karte verschwunden, und die erste Station heißt jetzt schlicht **„Alte Wacht"** (statt Glanzfeste).
- Der Grand Gambit steht wieder etwas tiefer an seiner Station.

## 0.12.0

**Federschrift & Figur**

- **Kartenbeschriftung mit der Feder:** Ortsnamen, Zweig-Wimpel, Kapitel-Banner und der „Hier steht dein Gambit"-Hinweis stehen jetzt in *IM Fell English* kursiv — als hätte ein Kartograph sie mit Tinte eingeschrieben. Die Schrift wird selbst gehostet und eingebettet (offline-fähig). Die Wimpel verlieren ihre Icons: nur noch der geschriebene Name.
- **Der Grand Gambit ist wieder als Bauer lesbar** — runder Kopf, Kragen-Wulst, tailliert geschwungener Körper, Rocksockel — bleibt aber gemalt: zarte Kontur, Aquarell-Schattierung (jetzt größer) und eine breitere warme Aura.
- **Glas-Kacheln veredelt:** Blur deutlich stärker (12–16 px), mehr Rundung (Panel 18 px), und die versetzten Kontur-Schatten sind durch weiche, zentrierte Leuchtschatten ersetzt — keine „abgesetzte Kante" mehr hinter den Overlays.

## 0.11.0

**Die Karte flüstert**

- **Gestrichelte Reiserouten und Stationsnummern sind von den gemalten Karten verschwunden** — die gemalten Wege der Artworks tragen die Reise, die Ortsnamen genügen. (Prozedurale Ligen behalten ihre Trails; das Panel behält seine Stationsnummer.)
- **Stationen deuten nur noch an:** kein Wappen, kein Totenkopf mehr auf den Feldern — die Glow-Fläche selbst erzählt den Status (warmgold = offen, grünlich mit zartem ✓ = geschafft, bronze mit Münze = Zoll, beinahe unsichtbar = fern). Der Puls unter dem Grand Gambit bleibt.
- **Der Grand Gambit ist noch weicher:** eine fließende Silhouette ohne Ecken — runder Kopf, geschwungener Rock statt Trapez-Sockel, Kontur auf ein Viertel gedimmt, Aquarell-Schattierung und größere Aura.
- **Overlays aus Milchglas:** Kapitel-Banner, Zweig-Wimpel und das Orts-Panel liegen jetzt als transparente Blur-Flächen über der Karte (Pergament-Glas, 55–70 % Deckung); die dunklen HUD-Pillen wurden ebenfalls durchlässiger.

## 0.10.0

**Vier gemalte Jahreszeiten-Welten + verschmolzene Spielschicht**

- **Sommer, Herbst und Winter** sind jetzt gemalte Welten (Liga II, III, IV) — gleiche Pipeline wie Liga I: Lichtungserkennung mit jahreszeiten-eigener Kalibrierung (Winter über Weiß-auf-Weiß-Schwellen), L1-Layout als Rückgrat mit Snap auf gemalte Kreise, Kanten-Validierung, Prüfbilder. Endgegner liegt auf jeder Karte auf der Riesenfläche unter der Burg.
- **Stationen sind jetzt Licht statt Stein:** Auf gemalten Karten ersetzt eine flach in der Ebene liegende Glow-Fläche (weicher radialer Verlauf, statusfarben) die Sockel und Haus-Silhouetten. Steht der Grand Gambit darauf, atmet sie hell (Puls). Die Boss-Wappen schweben mit weichem Schatten darüber — SVG und Malerei verschmelzen.
- **Der Grand Gambit ist auf der Karte neu gemalt:** warme Verläufe, sanfte Kontur, zarte Aura — im Duktus der Artworks. Im Match bleibt die vertraute Spielfigur unverändert.
- Assets: Liga I eingebettet, Ligen II–IV laden als eigene Dateien (Service Worker precacht sie); Single-File-Version enthält alle vier Welten.

## 0.9.0

**Karte voll besiedelt + ruhigere Bühne**

- **Zwei neue Orte füllen die letzten freien Lichtungen:** das **Wildererlager** (unten links am stillen Flussarm — ungegateter Früh-Abstecher von der Silbermühle aus, Beute: 35 Gold) und der **Kristallgarten** (rechts an der Kristallformation — harter Warlock-Boss auf dem Weg zwischen Bannerhöhe und Torfeste, rekrutierbar). Damit ist jede gemalte Fläche der Liga-I-Welt bespielt: 34 Stationen.
- **Plattform-Sockel zurückgenommen:** halbtransparenter Stein, leiserer Ring — das Artwork führt, die Spielschicht schwebt nur noch darüber.
- **Desktop atmet:** Die Kampagnen-Kamera startet auf großen Bildschirmen eine Stufe weiter draußen (0,9× Cover statt 1×), Letterbox-Ränder zentrieren sich statt oben-links zu kleben.
- Neuer Ort-Glyph „Kristall" (drei Zacken auf Felsboden); 237 Tests.

## 0.8.0

**Liga I als gemalte Welt**

- Die erste Liga spielt jetzt auf dem **handgemalten Frühlings-Artwork**: Dörfer, Windmühle, Flüsse, Monolithen, Kristall, Höhlen — und die Burg über der großen Endgegner-Lichtung.
- **32 Lichtungen, 32 Stationen:** Die hellen Flächen der Karte wurden programmatisch erkannt (Helligkeits-/Sättigungs-Analyse) und der Kampagnen-Graph per Optimierung x-monoton daraufgelegt — kuratiert nachjustiert (d-Route zu den Monolithen, Geheimpfad an die Höhle, Zollbrücke an den Fluss, Endgegner auf die Riesenfläche unter der Burg).
- Gestrichelte Reiserouten, Plattform-Sockel, Ort-Silhouetten, Kapitel-Banner und Zweig-Wimpel liegen weiter über dem Artwork; prozedurale Landschaft, Flüsse und Rand-Festungen pausieren in Bitmap-Ligen. Ligen II–X bleiben prozedural — weitere Artworks können über dieselbe Pipeline einziehen.
- Karte ist in Liga I höher (748 statt 590 Kartenpixel) — unverzerrtes Seitenverhältnis; Kamera, Nebel und Zoom folgen. Artwork wird ins Bundle eingebettet (funktioniert auch in der Single-File-Version).

## 0.7.0

**Feinschliff-Batch: Aufstellung, Währung v3, Karte, Schimmer**

- **Aufstellung neu sortiert:** Vorschau-Brett zuerst, darunter die Slot-Aufstellung samt Grand-Gambit-Position — und die Kartenwahl wandert als eigener Streifen **unter die Box**: eine Reihe, horizontal scrollbar statt Umbruch, ohne Mini-Brett-Icons. Auch im Schnellspiel-Setup laufen die Karten-Chips jetzt einzeilig.
- **Währung v3 — Insignien statt Comic-Gold:** Skillpunkte als vierstrahliger Ordensstern mit feinen Diagonalstrahlen, Gold als geprägte Kronenmünze mit Juwelenband. Klare Silhouetten, feine Konturen — gestochen auch in Chip-Größe.
- **Feine Zahlen:** Kontostand (Hofstaat) und Schatzkammer-Summen in leichter Serifen-Schrift statt fettem Sans.
- **Preise mit echter Münze:** Ausrüstungs-Kaufknöpfe und alle Kostenangaben zeigen die gezeichnete Münze bzw. den Stern — kein Emoji-Kästchen mehr.
- **Karte:** Das Lila ist verbannt (Zoll-/Gate-Markierungen jetzt in Karten-Bronze). Die Stationen sind **flache Plattform-Sockel in der Ebene** — mit Seitenkante und Wappenfigur, die darauf steht, wie die Häuser daneben. Der Grand Gambit steht spürbar tiefer am Ort statt darüber zu schweben. Der Nebel des Unbekannten beginnt erst 3–4 Spalten weiter rechts (die nächsten 4–5 Stationen bleiben sichtbar) und ist jetzt **dunkel** statt milchig.
- **Schimmer:** Der leichte Glanz-Sweep der Schatzkammer läuft nun gestaffelt und stark gedimmt über die drei Spielen-Kacheln.

## 0.6.0

**Orte statt Punkte (Map-Immersion II) + Hofstaat-Feinschliff**

- **Jede Station ist jetzt ein Ort:** 10 gezeichnete Silhouetten (Weiler, Torhof, Arena, Zeltlager, Palisade, Bergfried, Höhle, Zollbrücke, Fähranleger, Ligafeste) wachsen leicht versetzt hinter den Medaillons aus der Karte — pseudo-3D in der schrägen Vogelperspektive. Ortsnamen thronen über ihrer Silhouette.
- **Der Grand Gambit geht hinein:** Er steht nicht mehr AUF dem Punkt, sondern tritt tiefer und links ans Tor — mit Bodenschatten unter den Füßen. Wer tiefer steht, ist näher am Betrachter: echtes Tiefen-Gefühl.
- **Kampagne randlos:** In der Kartenansicht verschwinden Kopfzeile, Seitenleiste und Dock — die Welt füllt den ganzen Schirm, wie im Match.
- **Hub-Embleme neu:** Heraldische Wappenschilde (Feste mit Banner / gekreuzte Klingen / Botentaube mit Brief) — kräftig, vollständig sichtbar, nichts steht mehr über.
- **Hofstaat lesbarer:** Goldrahmen des Grand Gambit entfernt (oben stehen + Erklärung genügt), Fließtexte eine Stufe heller, **jede der 26 Figuren spricht jetzt in einem eigenen Flavor-Satz** (DE/EN, auch die Verborgenen flüstern schon).
- **Taktik braucht Horizont:** Die **nächsten zwei** noch gesperrten Fähigkeiten zeigen Name + Symbol (ausgegraut, antippbar für Details, mit Stufen-Angabe) — erst dahinter bleibt es „???".
- **Währung v2:** Stern und Münze rendern größenadaptiv — bei Chip-Größe ohne Mikrodetail und Schatten, dafür gestochen scharf; Skillpunkt-Kosten überall mit gezeichnetem Stern.

## 0.5.0

**Hofstaat, Schatzkammer & die Gold-Ökonomie (UX-Review + Nutzerbatch)**

- **Umbenannt:** „Gefolge" → **Hofstaat** (⚜️), „Erfolge" → **Schatzkammer** (👑) — kein verwechselbares Wortbild mehr in der Navigation; alle Texte (auch EN: Court / Treasury) ziehen mit.
- **Schatzkammer, pompös:** goldener Verlaufs-Rahmen mit Ecken-Diamanten, wandernder Glanz-Sweep, Serifen-Zahlen in Gold-Verlauf — und **selbst gezeichnete Währung**: facettierter Skillpunkt-Stern und geprägte Goldmünze (mit Bauern-Relief) ersetzen die Emojis überall (Schatzkammer, Hofstaat-Guthaben, Ergebnis-Banner, Einfordern-Knöpfe, Karten-Medaillons).
- **Gold pro Sieg — sichtbar:** Jeder Sieg zahlt jetzt in den Beutel, direkt im Ergebnis-Banner. Etappen tragen ihr eigenes Gold (je tiefer die Reise und je größer der Boss, desto schwerer der Beutel — Endbosse zahlen Aufschlag), Wiederholungen die Hälfte, Schnellspiel skaliert mit der Schwierigkeit (4/7/11 + Basis), Online-Siege 6.
- **Zollwege mit Story:** Zwei neue Orte — die **Nebelfähre** (der Fährmann rudert nur für Münze; drüben hortet ein Schmugglerfürst) und die **Zollbrücke** (der Brückenwärter hebt die Schranke nur für Gold; dahinter rastet eine schwer beladene Karawane). Zoll einmal pro Liga, skaliert mit ihr — und der Schatz dahinter ist immer größer als der Zoll.
- **Ökonomie durchgerechnet:** Liga-1-Einkommen ≈ 1015 Gold deckt alle Schlüssel + Zölle (845) mit Luft; Einfordern zahlt jetzt 80 % der Stufenpunkte (min. 5) statt der Hälfte — die Schatzkammer lohnt sich. Neuer Invarianten-Test wacht darüber.
- **Aufgeben mit Netz:** ⚑ verwandelt sich beim ersten Tipp in „Wirklich aufgeben? ✓ ✕" (3,5 s) — kein Ein-Klick-Verlust mehr.
- **Onboarding & Hub:** „Auf ins Abenteuer!" springt direkt auf die Kampagnen-Karte; Kampagnen-Karte zeigt „Station X von Y · Nächster Halt" mit Fortschrittsbalken; Online-Karte ohne Text-Überlauf, ehrlich mit „Bald verfügbar"-Siegel solange kein Server steht; Level-Leiste in Gold und nie mehr unsichtbar.
- **Konsistente Sperren:** Der Aufstellungs-Editor sperrt Karten jetzt genau wie das Schnellspiel (🔒 statt Phantom-Aufstellungen); gesperrte Karten-Chips erklären sich per Tipp auch auf Touch.
- **Match-Topbar:** Kontext-Chips mittig zwischen den Pillen — kein zerfallender Leerraum auf breiten Screens.
- 235 Tests (12 neue: Etappen-Gold, Zoll-Mechanik, Claim-Beutel, Einkommens-Invariante).

## 0.4.0

**Brett & Spiel-Immersion (Umbau-Plan B + Nutzerbatch)**

- **Brett-Fixes:** Kacheln jetzt pixelgenau identisch (Ganzzahl-Zellen statt fr-Rundung — keine Verzerrung mehr), alle Karten in Klassik-Farbgebung, Mini-Koordinaten a–j / 1–10 am Rand, Desktop-Brett füllt die volle Höhe.
- **Kein Scrollen im Spiel:** Schnellspiel & Kampagne laufen jetzt im Vollbild — das Brett sitzt fest, oben schweben ‹ Zurück und ⚑ Aufgeben (gleiche Pille, roter Ton), unten die schmale Spieler-Leiste mit Status, Trank, Schlagbilanz und ↶.
- **Schnellspiel-Setup vorgelagert:** Karte, Modus und Schwierigkeit wählst du VOR der Partie; im Spiel gibt es keine Einstellungen mehr. Nach der Partie: Neue Partie oder zurück zu den Einstellungen.
- **Zeitdruck ab Liga 5:** Monster-Meilensteine bekommen ein Gesamtzeit-Budget (6 min, pro Liga −30 s bis min. 3 min), Elite-Figurenbosse ein Zug-Limit (20 s, pro Liga −1 s bis min. 12 s). Die Uhr läuft nur in deinem Zug, pausiert bei Story & Banner, und wird in der Story-Karte angekündigt. Ablauf = Zeitüberschreitung (Niederlage).
- **Gefolge in drei Reitern:** Aufstellung · Ausrüstung · Charaktere — Guthaben-Leiste bleibt immer sichtbar, kein Endlos-Scroll. Der Grand Gambit führt die Charakterliste an, mit Erklärung: ein besonderer Bauer, dein Held.
- **Spiel-Intro:** Beim allerersten Start (nach dem Datenschutz-Hinweis) erklärt eine Pergament-Karte, was Grand Gambit ist und was es besonders macht.

## 0.3.0 — Map-Immersion (Umbau-Plan Block A)
- Kampagne füllt den Bildschirm: Karte = fester Viewport (100dvh minus
  Kopfleiste), kein Seiten-Scroll mehr — Zurück-Pille, Liga-Abzeichen und
  Zoom schweben über der Welt
- Stations-Medaillons ~30 % kleiner (46 → 32 px), der Grand Gambit als
  Wanderfigur ~40 % größer (34×36 → 48×50) — er ist der Held, nicht die Felder
- Level-Detail als Pergament-Panel IN der Karte, direkt am Node verankert
  (gleitet mit Kamera und Zoom mit); Ankunft ist Teil der Welt, das Panel
  trägt Geschichte, Belohnungen, Boss-/Tor-Infos und den Start-Knopf
- Endloses-Meer-Sperre schwebt zentriert über der ausgegrauten Karte

## 0.2.0 — Erster öffentlicher Release (Browser)
- Der Grand Gambit: die Titelfigur als Helden-Bauer mit Wappen, eigener
  Fähigkeiten-Leiter (inkl. Maskerade) und wählbarer Position in der Bauernreihe
- Zehn Ligen mit zehn Klimazonen (Frühling bis Endloses Meer), Kapitän & Boot,
  neun Geheimpfade mit Gegenstands- und Begleiter-Schlössern, Brieftaube (Online-Geschenk)
- Kampagnen-Kamera folgt dem Wanderer (kein freies Scrollen), drei Zoomstufen,
  Nebel des Krieges hinter der Frontlinie
- Alle Figuren- und Landschaftsgrafiken als editierbare SVG-Dateien (assets/)
- Release-Härtung: PWA (Service Worker, Icons), Datenschutz-Hinweis & -Seite,
  Online-Zustimmung, Spielstand-Export/-Import, Fehlerfänger statt Weißbildschirm
