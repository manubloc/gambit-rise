# Das Android-Paket bauen — in zehn Schritten

Kurzfassung für den Tag, an dem du es machst. Die lange Fassung mit allem
Drumherum steht in `PLAYSTORE.md`; hier steht nur, was du klickst.

Du brauchst: einen Rechner mit Browser. Kein Android-SDK, kein Java.
**Und den Uploadschlüssel, der in der Console schon registriert ist** —
siehe Abschnitt 3a, bevor du auf Generate klickst.

---

## 1. PWABuilder öffnen

<https://www.pwabuilder.com> → in das Feld **`https://gambitrise.com`**
eintippen → **Start**.

Er liest `/site.webmanifest` und zeigt eine Auswertung. Ein paar gelbe Punkte
(„screenshots", „categories") sind egal — sie betreffen den PWA-Score, nicht
das Paket.

## 2. Package auswählen

**Package For Stores** → Kachel **Android** → **Generate Package**.

## 3. Die Werte prüfen — das ist der wichtige Schritt

Im Dialog auf **All Settings** / **Advanced** klappen und gegenprüfen:

| Feld | Wert |
|---|---|
| Package ID | `com.gambitrise.app` |
| App name | `Gambit Rise` |
| Launcher name | `Gambit` |
| App version | `1.0.0` |
| App version code | `1` |
| Host | `gambitrise.com` |
| Start URL | `/spielen/` |
| Display mode | `standalone` |
| Theme / Background color | `#000000` |
| Icon URL | `https://gambitrise.com/spielen/icons/maskable-512.png` |
| Maskable icon URL | dieselbe |
| Notifications | an |
| Signing key | **NICHT einfach Create new** — erst Abschnitt 3a lesen |

**Start URL `/spielen/` ist Pflicht.** Steht dort `/`, landet die App auf der
Landingpage statt im Spiel.

> **Gemessen am 29.9.2026 (dist nach `npm run build`):** die Wurzel liefert
> `/site.webmanifest` mit `start_url: "/spielen/"` — PWABuilder füllt den
> Startpfad also von selbst richtig aus. Die Icons (`/icons/icon-192.png`,
> `…/maskable-512.png`) liegen an der Wurzel UND unter `/spielen/icons/`,
> beide Wege tragen. Der einzige Unterschied: das Wurzel-Manifest hat
> `scope: "/"`, das App-Manifest `scope: "./"` (also `/spielen/`). Mit
> Scope `/` öffnet die Hülle auch die Landingpage in der App statt im
> Browser — unschädlich, aber wissen sollte man es.

## 3a. DER SCHLÜSSEL — hier wird es unumkehrbar

**In der Play Console ist bereits ein Uploadschlüssel registriert** (S5,
gemessen am 29.9.: unter *App-Integrität → App-Signatur* stehen BEIDE
Zertifikate — Googles App-Signaturschlüssel `D9:2D:FB:…:A8:F6` und der
Uploadschlüssel `00:4B:29:…:E6:52`). Eine `.aab`, die mit einem NEU
erzeugten Schlüssel signiert ist, weist Google beim Hochladen ab.

Bis v1.90.12 stand in der Tabelle oben „Create new". Das war falsch und
hätte einen halben Tag gekostet — die Zeile ist berichtigt. Drei Fälle:

1. **Der alte Keystore liegt noch vor** (Passwortmanager, alter Rechner,
   altes ZIP): in PWABuilder **Use mine** wählen und ihn samt Passwort und
   Alias hochladen. Das ist der schnelle Weg.
2. **Er ist fort:** bei Google einen **Reset des Uploadschlüssels**
   beantragen (Play Console → App-Integrität → App-Signatur). Dauert ein paar
   Tage. Danach mit dem NEUEN Schlüssel bauen — und `assetlinks.json`
   nachziehen, denn der Abdruck ändert sich.
3. **Unklar:** erst in der Console nachsehen, NICHT auf gut Glück bauen.

Gemessen am 29.9.: unter `~/.gambit/` liegt auf dem Cloud-Rechner **kein**
Keystore, und im Repo (richtigerweise) auch keiner. Wo der alte liegt, weiß
nur der Besitzer.

> **Warum das Paket nicht aus der Cloud-Sitzung kommen kann** (gemessen
> 29.9.): Bubblewrap braucht das Android-SDK von `dl.google.com`, ein JDK von
> `api.adoptium.net` und Gradle von `services.gradle.org`. Alle drei weist
> der Egress-Proxy des Containers ab (die Verbindung kommt gar nicht zustande,
> während `github.com` und die Paketregister antworten). Java 21 und
> `keytool` sind zwar da, das SDK nicht. Der Weg über **pwabuilder.com im
> Browser** braucht genau deshalb keinen Werkzeugkasten — er baut auf deren
> Rechnern.

## 4. Herunterladen

**Download** → du bekommst ein ZIP mit:

- `app-release-bundle.aab` → das lädst du in die Play Console
- `app-release-signed.apk` → zum Direkttesten auf dem Handy
- `signing.keystore` + `signing-key-info.txt` → **der Schlüssel**
- `assetlinks.json` → brauchst du gleich (Schritt 8)

## 5. DEN SCHLÜSSEL SICHERN — jetzt sofort

> **NIEMALS IN DEN REPO-ORDNER LEGEN.** Das Repo ist öffentlich. Entpacke das
> ZIP außerhalb, und lege den Schlüssel nach `~/.gambit/gg-upload.keystore` —
> genau dorthin zeigt `design/twa-manifest.json` seit v1.90.8 (vorher stand
> dort `./gg-upload.keystore`, also **im Repo**, direkt neben der
> Konfiguration). `.gitignore` sperrt `*.keystore`, `*.jks`, `*.p12` und
> `signing-key-info.txt` zusätzlich ab — aber ein Riegel ersetzt keine
> Gewohnheit. Ein geleakter Uploadschlüssel muss bei Google zurückgesetzt
> werden, und in der Console ist bereits einer registriert.

`signing.keystore` und `signing-key-info.txt` (darin stehen Passwort, Alias
und Fingerprint) in den Passwortmanager und zusätzlich an einen zweiten Ort.

Ohne diese Datei kannst du **nie wieder** eine neue Version derselben App
hochladen. Es gibt keinen Weg zurück — Google kann das nicht reparieren.

## 6. In der Play Console hochladen

Play Console → deine App → **Testen und Veröffentlichen** → **Interner Test**
→ **Neue Version erstellen** → `app-release-bundle.aab` hineinziehen →
Versionshinweise → **Speichern** → **Überprüfen** →
**Veröffentlichung starten**.

Freigabe dauert Minuten, **keine Prüfung durch Google**. Die Pflichtuhr
„12 Tester, 14 Tage" gilt für den GESCHLOSSENEN Test (Backlog S8), nicht hier.

**Versionshinweise zum Einsetzen** (Play verlangt sie je Sprache):

*de-DE*
```
Erste Fassung für den internen Test. Vollständige Kampagne mit zwölf
Kapiteln, Hofstaat, Ausrüstung und Online-Duell. Rückmeldungen bitte über
Profil → Feedback & Fehler melden.
```

*en-US*
```
First build for internal testing. Full campaign across twelve chapters,
court, equipment and online duels. Please report anything you find via
Profile → Feedback.
```

**Was vorher vollständig sein muss** (Stand 29.9.2026 alles erledigt):
App-Inhalte (Altersfreigabe S1, Datensicherheit S2), Store-Eintrag in
beiden Sprachen (S3), Löschseite erreichbar (S15).

## 7. Auf dem eigenen Handy testen

Interner Test → **Tester** → deine Google-Adresse eintragen → den
**Opt-in-Link** auf dem Handy öffnen → „Tester werden" → App aus dem Play
Store installieren.

**Beim ersten Start auf zwei Dinge achten** — beides entscheidet darüber, ob
Google die App durchlässt:

1. **Kommt eine Passwortabfrage?** Darf seit v1.88.0 nicht mehr sein — der
   Riegel ist fort (Abschnitt 9). Kommt trotzdem eine, zeigt die Hülle einen
   alten Stand aus dem Zwischenspeicher: einmal die App-Daten löschen und neu
   starten.
2. **Ist oben eine graue Browserleiste?** Dann stimmt der Fingerprint nicht
   (Abschnitt 8).

## 8. assetlinks scharf schalten — der häufigste Stolperstein

Zeigt die installierte App oben eine **graue Browserleiste**, stimmt der
Fingerprint nicht. So geht es richtig:

Play Console → **Testen und Veröffentlichen** → **Einrichtung** →
**App-Integrität** → **App-Signatur** → dort steht der
**SHA-256-Zertifikatfingerabdruck**.

Wichtig: Bei Play App Signing signiert **Google** die ausgelieferte App mit
einem eigenen Schlüssel. Es zählt also **Googles** Fingerprint, nicht der aus
deinem ZIP.

Schick mir beide Fingerprints (Googles aus der Console und deinen aus
`signing-key-info.txt`), dann trage ich sie in
`public/.well-known/assetlinks.json` ein und pushe. Zwei Minuten später ist
es live.

> In der Datei stehen schon zwei Fingerprints aus einem früheren Anlauf.
> Ob die stimmen, weiß ich nicht — bitte gegenprüfen, sonst bleibt die
> Browserleiste.

Prüfen kannst du es unter
<https://gambitrise.com/.well-known/assetlinks.json>.

## 9. Passwortriegel — seit v1.88.0 gibt es keinen mehr

Bis v1.87.0 lag `/spielen/` hinter einem `prompt()`-Passwort, mit einem
Durchlass für die TWA über `document.referrer`. Am 27.9. hat der Besitzer den
Riegel gestrichen: er sperrte ihn selbst auf dem Handy aus (in installierten
Seiten liefert `prompt()` stumm `null`, und der Riegel sprang zurück auf die
Landingpage), und Neugierige hielt er nur mit einem Klartext-Hash im Quelltext
ab. Die Anmeldung der App ist jetzt die Tür (`tools/seite-bauen.mjs`,
Schritt 3).

Für die Einreichung heißt das: **kein Ablehnungsrisiko „App-Zugriff nicht
möglich"** mehr, kein Durchlass, der an einem Verweis hängt, nichts, was ein
Prüfer mit leerem `localStorage` anders sähe als du.

## 10. Danach

Läuft der interne Test, kopierst du dieselbe `.aab` mit einem Klick
(„Version hochstufen") in den **geschlossenen Test**. Dort läuft die
Pflichtuhr: **12 Tester, 14 Tage** ununterbrochen. Erst danach kannst du die
Produktion beantragen.

Zeit im internen Test zählt dafür **nicht** mit.

---

## Was du danach nie wieder brauchst

Solange nur die Website sich ändert, brauchst du **kein neues Paket**: die
App ist nur eine Hülle um gambitrise.com. Jeder Push auf `main` ist
gleichzeitig das App-Update.

Ein neues Paket ist nur nötig, wenn sich die Hülle ändert — Symbol, Name,
Berechtigungen, Start-URL.
