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

- [ ] **S2 Datensicherheit eintragen.** Bogen in `PLAYSTORE.md`.
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

  **Stand 27.9. abends:** Schritt 1–3 ausgefüllt und als Entwurf gespeichert
  (Erhebung ja, Verschlüsselung ja, Kontowege Passwort + OAuth, Lösch-Link,
  alle zehn Datentypen). Offen ist Schritt 4 (zehn Fenster je Datentyp) und
  das Absenden. Google hat den Bogen erweitert — die **zwei neuen Fragen**
  (Methoden der Kontoerstellung, Link zum Löschen des Kontos) stehen jetzt mit
  Antwort in `PLAYSTORE.md`.

- [ ] **S3 Grafiken hochladen.** *Store-Präsenz → Hauptspeicher-Eintrag* für
  Deutsch die Dateien aus `design/playstore/de/`, dann unter „Übersetzungen
  verwalten" Englisch anlegen und `…/en/` hochladen.

- [ ] **S4 Android-Paket bauen.** Nach `design/PWABUILDER.md`: Adresse
  `https://gambitrise.com/spielen/`, Paket `com.gambitrise.app`, App- und
  Launcher-Name „Gambit Rise", Signaturschlüssel **neu erzeugen lassen**.
  **Den Schlüssel sofort doppelt sichern** (Passwortmanager + zweiter Ort) —
  ohne ihn ist nie wieder ein Update der Hülle möglich. Das ist der einzige
  Schritt auf dieser Liste, der sich nicht nachholen lässt.

- [ ] **S5 Fingerabdrücke abgleichen.** *Testen und Veröffentlichen →
  Einrichtung → App-Integrität → App-Signatur*: dort steht **Googles**
  SHA-256 (bei Play App Signing signiert Google neu, der eigene aus der ZIP
  genügt nicht). Beide Abdrücke an die Sitzung geben → sie kommen nach
  `public/.well-known/assetlinks.json`. Prüfen:
  <https://gambitrise.com/.well-known/assetlinks.json>

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

- [ ] **S15 Löschseite live prüfen.** Seit v1.89.6 gibt es
  `https://gambitrise.com/konto-loeschen.html` (Quelle `public/konto-loeschen.html`,
  verlinkt aus Landingpage-Fußzeile, `privacy.html` und Sitemap). Sie ist die
  Adresse im Datensicherheits-Bogen. Nach dem Deploy einmal aufrufen — liefert
  sie die Landingpage statt der Seite, fehlt der Eintrag in `AN_DIE_WURZEL`
  (`tools/seite-bauen.mjs`).

## Nebenher, unabhängig von der Einreichung

- [ ] **S10 Search Console:** Adressänderung `grandgambit.win` →
  `gambitrise.com` melden (die 301-Umleitung läuft seit v1.61.0).
- [ ] **S11 Alten Console-Eintrag** mit der alten Paketkennung löschen oder
  liegen lassen. Eine Paketkennung lässt sich nie ändern, auch nicht im
  Entwurf — deshalb der neue Eintrag.
- [ ] **S12 Store-Bild mit Lebenspunkten.** Gemessen: ein Gast kann das
  HP-Gefecht gar nicht wählen (`hpWach: league > 2`), im Anpassen-Schirm ist
  nur die Klassik-Karte frei. Es braucht einen vorbereiteten Spielstand ab
  Kapitel III, kein Drehen am Schalter — der Kommentar in
  `tools/playstore-schirme.mjs` hält das fest.
- [ ] **S13 Monsterbilder freistellen** — der Besitzer nennt die Nummern
  („lassen wir erstmal, kann man nachziehen").
  Voraussetzung: **beide** Domains müssen als Property bestätigt sein, sonst
  bietet die Console das Werkzeug nicht an. Danach `sitemap.xml` für
  gambitrise.com einreichen (sie führt seit v1.89.6 auch `konto-loeschen.html`).

- [ ] **S16 Soll /spielen/ in die Suche?** `robots.txt` sperrt die App seit
  v1.43.1 mit der Begründung „Riegel davor" — den Riegel gibt es seit v1.88.0
  nicht mehr. Die Sperre steht weiter (Besitzerentscheidung: der Weg ins Spiel
  führt über den Play Store). Offen ist nur, ob das so bleiben soll, jetzt wo
  die App frei zugänglich ist.

## Eine Entscheidung, die noch aussteht

- [ ] **S14 Soll der automatische Absturzbericht abschaltbar sein?** Heute ist
  er „erforderlich"; abschaltbar wäre er im Datensicherheitsformular
  „optional", was freundlicher aussieht. Kostet eine kleine Änderung im Client
  und eine Zeile im Bogen.

## Was nach der Veröffentlichung gilt

Die App ist eine **TWA** — eine dünne Android-Hülle, die `gambitrise.com`
zeigt. Darum gilt dauerhaft: **jeder Push auf `main` ist zugleich das
Store-Update.** Eine neue `.aab` braucht es nur, wenn sich die Hülle selbst
ändert (Symbol, Name, Farben, Berechtigungen) oder Bubblewrap ein
Sicherheitsupdate verlangt; dann `appVersionCode` +1 und neu bauen.
Spielinhalt braucht das nie.
