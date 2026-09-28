# Play-Store-Backlog — was bis zur Veröffentlichung fehlt

> **Wofür diese Datei da ist.** Besitzer am 26.9.2026: *„tu trotzdem immer eine
> Backlog machen, dass klar ist, was man bei dem Play Store noch alles machen
> muss. Und dass auch diese Store-Einreichungen immer klar ist, was da noch zu
> tun ist."*
>
> Also: **eine Liste, ein Ort, immer aktuell.** Die technischen Punkte des
> Projekts stehen in `design/STAND-2026-09-26.md` (T1–T11) — hier steht
> ausschließlich, was zwischen dem heutigen Stand und der veröffentlichten App
> liegt. Wer einen Punkt erledigt, hakt ihn **hier** ab.
>
> Die ausführlichen Anleitungen liegen daneben und werden nicht doppelt
> geführt: `design/PLAYSTORE.md` (beide Console-Bögen Frage für Frage) und
> `design/PWABUILDER.md` (das Android-Paket in zehn Schritten).

**Stand:** App **nicht veröffentlicht**. Paket `com.gambitrise.app`, Host
`gambitrise.com`, Startpfad `/spielen/`.

---

## Was fertig ist — daran muss niemand mehr arbeiten

- **Store-Bilder:** 7 Motive × 3 Formate × 2 Sprachen in
  `design/playstore/de/` und `…/en/`, auf Knopfdruck neu baubar
  (`tools/playstore-schirme.mjs` + `tools/playstore_gestell.py`).
- **Feature-Grafik** 1024×500 (DE und EN) und **Symbol** 512×512.
- **Store-Texte** (Name, Kurz- und Langbeschreibung, DE/EN) in `PLAYSTORE.md`.
  Am 26.9. gegen den Code gegengerechnet und richtig: 27 Helden + 25 Bestien =
  52, also „mehr als 50 Figuren"; `MAX_KAPITEL` steht auf 12 und ist nicht
  gedeckelt, „zwölf Kapitel" trifft zu.
- **`design/twa-manifest.json`** — fertige Bubblewrap-Konfiguration.
- **`public/.well-known/assetlinks.json`** — trägt zwei echte
  SHA-256-Fingerabdrücke (noch gegen die Console abzugleichen, siehe S5).
- **In der Console schon erledigt:** App angelegt, Store-Texte,
  Datenschutzlink, Werbung, Werbe-ID, Behörden-App, Zielgruppe 13+,
  Finanz- und Gesundheitsfunktionen, App-Zugriff. Altersfragebogen ausgefüllt.

## Offen — in dieser Reihenfolge

- [x] **S1 Altersfreigabe absenden.** — **erledigt.** Am 27.9. abends in der
  Console nachgesehen: „Einstufung des Inhalts" trägt im Dashboard den Haken,
  der Bogen ist also abgesendet und kein Entwurf mehr.

- [x] **S2 Datensicherheit eintragen — ERLEDIGT 29.9.2026.** Bogen in `PLAYSTORE.md`.
  **⚠ Der Bogen wurde am 26.9. berichtigt — bitte die berichtigte Fassung
  nehmen.** Er wies an, Standort *nicht* anzukreuzen. Das ist unwahr, am Code
  gemessen: `worker/src/index.mjs:322` legt zu jedem Online-Spieler `land`,
  `region` und `stadt` aus den Cloudflare-Kopfzeilen an, Zeile 333 dazu einen
  Kurz-Hash der IP; `worker/src/logic.mjs:380-383` schreibt das dauerhaft ins
  Spielerbuch. Nach Googles Kategorien ist das **Standort → Ungefährer
  Standort** (optional, nur bei Online-Nutzung), der IP-Hash gehört unter
  **Geräte- oder andere IDs**.
  Dass nur der Besitzer es sieht, ändert nichts — gefragt ist, ob Daten
  *erhoben* werden. Eine falsche Angabe ist Ablehnungs- und später Sperrgrund.
  *Falls der Bogen schon abgesendet wurde: nachtragen.*

  **Abgeschlossen am 29.9.2026.** „App-Inhalte → Überprüfung erforderlich" ist
  leer („Alles erledigt"), die Datensicherheit steht unter „Abgeschlossen",
  zuletzt bearbeitet 29.9.2026. Zwei Dinge waren noch offen und sind jetzt
  drin: **Standort → Ungefährer Standort** (die Berichtigung vom 26.9. — der
  Worker legt Land/Region/Stadt an; Zweck **Analyse + Betrugsprävention**,
  „Nutzer können entscheiden", nicht sitzungsspezifisch) und die Umstellung
  der **Absturzprotokolle von „erforderlich" auf „Nutzer können
  entscheiden"** — möglich geworden durch S14 (v1.90.2, live geprüft, ehe die
  Angabe gemacht wurde). Die Vorschau zeigt: keine geteilten Daten, sechs
  Kategorien erhoben, Lösch-Link und Datenschutzerklärung verlinkt.

- [x] **S3 Grafiken hochgeladen — ERLEDIGT 29.9.2026.** *Store-Präsenz → Hauptspeicher-Eintrag* für
  Deutsch die Dateien aus `design/playstore/de/`, dann unter „Übersetzungen
  verwalten" Englisch anlegen und `…/en/` hochladen.

  **Erledigt 29.9.2026:** beide Sprachen tragen die NEUEN Bilder (v1.90.2) —
  Deutsch wurde ersetzt (acht alte entfernt, acht neue in Reihenfolge), und
  Englisch (en-US) hat erstmals eigene englische Screenshots statt der
  geerbten deutschen. Beides gespeichert. **Zwei Fallen, die viel Zeit
  gekostet haben und beim nächsten Mal Zeit sparen:** (1) Hochladen legt ein
  Bild NUR in die Bibliothek — in den Eintrag kommt es erst über
  *Zeile anfahren → Pfeil „Details ansehen" → Hinzufügen*. (2) Ein offenes
  Menü („Übersetzungen verwalten") fängt still ALLE Klicks ab; daran sind acht
  Löschversuche gescheitert, ohne eine Fehlermeldung. Dateien mit gleichem
  Inhalt werden dedupliziert („Asset wurde dedupliziert"), darum die Kopien
  für den Upload eindeutig benennen.

  *Frühere Notiz (28.9., überholt):* Deutsch war hochgeladen (Symbol, Vorstellungsgrafik,
  8 Telefon-Screenshots). Englisch (en-US) ist **angelegt und gespeichert** —
  App-Name, Kurz- und Langbeschreibung stehen drin; die Grafiken **erbt** der
  englische Eintrag vom deutschen (Google zeigt sie mit generischem Namen an,
  gegengeprüft: identische Bild-Adressen wie de-DE).
  **Alle 48 Bilder sind seit v1.90.0 neu** (Rahmen tangential, Halle ohne
  Gast, Englisch wirklich englisch) — beide Sprachen müssen also **noch
  einmal hochgeladen** werden, Deutsch ersetzen und Englisch erstmals eigene
  bekommen. Der Weg in der Console (gemessen, mehrfach im Kreis gelaufen):
  *Assets hinzufügen* → in der Seitenleiste die Zeile **anfahren**, damit der
  Pfeil „Details ansehen" erscheint → in der Detailansicht **Hinzufügen**.
  Ein Hochladen allein legt das Bild NUR in die Bibliothek, nicht in den
  Eintrag; gleiche Dateien werden dabei dedupliziert („Asset wurde
  dedupliziert").

  **Nebenbefund, erledigt:** unter den Übersetzungen stand versehentlich auch
  **en-GB** — leer, und ein leerer Eintrag blockierte jedes Speichern
  („Einige Sprachen sind fehlerhaft"). Entfernt; UK-Nutzer sehen ohnehin den
  en-US-Eintrag.

- [ ] **S4 Android-Paket bauen.** Nach `design/PWABUILDER.md`: Adresse
  `https://gambitrise.com/spielen/`, Paket `com.gambitrise.app`, App- und
  Launcher-Name „Gambit Rise", Signaturschlüssel **neu erzeugen lassen**.
  **Den Schlüssel sofort doppelt sichern** (Passwortmanager + zweiter Ort) —
  ohne ihn ist nie wieder ein Update der Hülle möglich. Das ist der einzige
  Schritt auf dieser Liste, der sich nicht nachholen lässt.

- [x] **S5 Fingerabdrücke abgeglichen — ERLEDIGT 29.9.2026.**
  `public/.well-known/assetlinks.json` trug bis heute zwei **Platzhalter**.
  Jetzt stehen die echten Abdrücke aus *App-Signatur* darin: Googles
  **App-Signaturschlüssel** (`D9:2D:FB:…:A8:F6` — genau der Block, den die
  Console dort als fertiges Digital-Asset-Links-JSON anbietet) und der
  **Uploadschlüssel** (`00:4B:29:…:E6:52`), damit auch eine selbst signierte
  Installation desselben Pakets ohne Browserleiste startet. Prüfen nach dem
  Deploy: <https://gambitrise.com/.well-known/assetlinks.json>

  **WICHTIGER NEBENBEFUND FÜR S4:** in der Console ist bereits ein
  **Uploadschlüssel registriert** (sein öffentliches Zertifikat steht auf der
  Seite). Eine `.aab`, die mit einem NEU erzeugten Schlüssel signiert ist,
  weist Google dann ab. Also vor dem Bau prüfen, ob der zugehörige private
  Schlüssel noch vorliegt; wenn nicht, bei Google einen **Reset des
  Uploadschlüssels** beantragen — nicht einfach einen neuen erzeugen.

- [ ] **S6 Erster Start auf dem Handy — der Prüfschritt, der über die Freigabe
  entscheidet.** Als Tester installieren und auf zwei Dinge achten:
  1. **Kommt eine Passwortabfrage?** Seit v1.88.0 darf keine mehr kommen —
     der Riegel vor `/spielen/` ist fort (Besitzer 27.9.; `PWABUILDER.md`
     Abschnitt 9). Kommt doch eine, zeigt die Hülle einen alten Stand aus dem
     Zwischenspeicher: App-Daten löschen, neu starten.
  2. **Graue Browserleiste oben?** Dann stimmt der Fingerabdruck nicht (S5).

- [ ] **S7 Geschlossener Test.** Dieselbe `.aab` mit „Version hochstufen"
  hinüberkopieren, Tester per E-Mail-Liste eintragen, Release einführen.

- [ ] **S8 12 Tester, 14 Tage am Stück.** Pflicht für private
  Entwicklerkonten, die nach dem 13.11.2023 angelegt wurden — **für dieses
  Konto noch zu prüfen**. Zeit im *internen* Test zählt dafür nicht.

- [ ] **S9 Produktionszugriff beantragen, dann einreichen.** Prüfung durch
  Google meist einige Tage. Danach funktioniert der Link, auf den das
  Play-Abzeichen der Landingpage schon zeigt.

- [x] **S15 Löschseite live geprüft.** `konto-loeschen.html` liegt an der
  Wurzel und ist per einfachem HTTP-Abruf erreichbar (gegengeprüft, nachdem
  der Browser Integrity Check aus ist). Seit v1.89.9 ohne die private
  E-Mail-Adresse.

## Nebenher, unabhängig von der Einreichung

- [x] **S10 Search Console: Adressänderung erledigt (28.9.2026).**
  grandgambit.win → gambitrise.com, „Überprüfung bestanden", Startdatum
  28.9.2026. URSACHE des wochenlangen Scheiterns: Cloudflares **Browser
  Integrity Check** war auf grandgambit.win aktiv und wies Googles
  Prüf-Abruf ab (er prüft die HTTP-Kopfzeilen und blockt alles, was nicht
  wie ein Browser aussieht). Im Browser lief die Weiterleitung deshalb
  einwandfrei, für Google war die Seite „nicht abrufbar". Schalter auf
  BEIDEN Domains abgeschaltet — auf gambitrise.com hätte er sonst auch die
  Play-Prüfung der Datenschutz- und Löschseite treffen können.
  Die Sitemap war bereits eingereicht und erfolgreich gelesen.

  **Nachgezogen am 28.9. abends:** Startseite per URL-Prüfung eingereicht
  („Indexierung wurde beantragt — URL wurde einer bevorzugten
  Crawling-Warteschlange hinzugefügt"); die Seite ist bereits „auf Google".
  Sitemap neu eingereicht, damit die vierte Adresse
  (`konto-loeschen.html`) mitgelesen wird — der letzte Lesestand war der
  26.9. mit drei Seiten. Gemessen in der Google-Suche: `gambitrise.com`
  steht bei „Gambit Rise Schach" auf **Platz 1**, bei „Schach RPG Figuren
  leveln" auf **Platz 2** (hinter chess.com).

- [x] **S16 entschieden (Besitzer 28.9.): NEIN, weiter sperren.** `robots.txt` sperrt die App seit
  v1.43.1 mit der Begründung „Riegel davor" — den Riegel gibt es seit v1.88.0
  nicht mehr. Die Sperre steht weiter (Besitzerentscheidung: der Weg ins Spiel
  führt über den Play Store). Offen ist nur, ob das so bleiben soll, jetzt wo
  die App frei zugänglich ist.

- [x] **S17 entschieden (Besitzer 28.9.): „Bilder passen, lade sie so hoch." Bleibt so.** Der Bau-Rechner
  darf `duell.gambitrise.com` nicht erreichen (gemessen: „Host not in
  allowlist"), darum meldet die Kachel im Bild ehrlich „offline". Auf einem
  Gerät mit Netz steht dort „verbunden". Entweder so lassen oder den Zustand
  für die Aufnahme setzen — **Besitzerentscheid**, nicht ungefragt gebaut.

## Eine Entscheidung, die noch aussteht

- [x] **S14 Absturzbericht abschaltbar — ERLEDIGT (v1.90.2, Besitzerentscheid
  28.9.: „gerne abschaltbar machen").** Der Schalter steht im Profil unter
  „Automatische Absturzberichte" und liegt am Gerät (`gg_absturzberichte`),
  nicht im Spielstand — ein Absturz kann kommen, ehe ein Stand geladen ist.
  Aus heißt: der Bericht bleibt im örtlichen Spiegel. Selbst geschickte
  Rückmeldungen sind nie betroffen. Im Datensicherheitsbogen stehen die
  Absturzprotokolle seither auf „Nutzer können entscheiden".

## Was nach der Veröffentlichung gilt

Die App ist eine **TWA** — eine dünne Android-Hülle, die `gambitrise.com`
zeigt. Darum gilt dauerhaft: **jeder Push auf `main` ist zugleich das
Store-Update.** Eine neue `.aab` braucht es nur, wenn sich die Hülle selbst
ändert (Symbol, Name, Farben, Berechtigungen) oder Bubblewrap ein
Sicherheitsupdate verlangt; dann `appVersionCode` +1 und neu bauen.
Spielinhalt braucht das nie.
