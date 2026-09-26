# Das Android-Paket bauen — in zehn Schritten

Kurzfassung für den Tag, an dem du es machst. Die lange Fassung mit allem
Drumherum steht in `PLAYSTORE.md`; hier steht nur, was du klickst.

Du brauchst: einen Rechner mit Browser. Kein Android-SDK, kein Java.

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
| Signing key | **Create new** |

**Start URL `/spielen/` ist Pflicht.** Steht dort `/`, landet die App auf der
Landingpage statt im Spiel.

## 4. Herunterladen

**Download** → du bekommst ein ZIP mit:

- `app-release-bundle.aab` → das lädst du in die Play Console
- `app-release-signed.apk` → zum Direkttesten auf dem Handy
- `signing.keystore` + `signing-key-info.txt` → **der Schlüssel**
- `assetlinks.json` → brauchst du gleich (Schritt 8)

## 5. DEN SCHLÜSSEL SICHERN — jetzt sofort

`signing.keystore` und `signing-key-info.txt` (darin stehen Passwort, Alias
und Fingerprint) in den Passwortmanager und zusätzlich an einen zweiten Ort.

Ohne diese Datei kannst du **nie wieder** eine neue Version derselben App
hochladen. Es gibt keinen Weg zurück — Google kann das nicht reparieren.

## 6. In der Play Console hochladen

Play Console → deine App → **Testen und Veröffentlichen** → **Interner Test**
→ **Neue Version erstellen** → `app-release-bundle.aab` hineinziehen →
Versionshinweise (ein Satz genügt) → **Speichern** → **Überprüfen** →
**Veröffentlichung starten**.

Freigabe dauert Minuten, keine Prüfung.

## 7. Auf dem eigenen Handy testen

Interner Test → **Tester** → deine Google-Adresse eintragen → den
**Opt-in-Link** auf dem Handy öffnen → „Tester werden" → App aus dem Play
Store installieren.

**Beim ersten Start auf zwei Dinge achten** — beides entscheidet darüber, ob
Google die App durchlässt:

1. **Kommt eine Passwortabfrage?** Dann greift der Riegel (Abschnitt 9) nicht,
   und ein Prüfer würde die App ablehnen. Sag es mir, dann nehme ich den Riegel
   für die Einreichung heraus.
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

## 9. Passwortriegel — vorgesehen ist er gelöst, geprüft ist er nicht

`/spielen/` liegt hinter einem Passwort. Die TWA öffnet die Seite mit dem
Verweis `android-app://com.gambitrise.app`; daran erkennt der Riegel sie und
lässt sie ohne Abfrage durch (seit v1.45.1, `tools/seite-bauen.mjs:65` —
Paket und Startpfad passen zusammen, am 26.9. gegengeprüft).

**Aber der Durchlass hängt an einem Verweis, den niemand garantiert** — und
das ist das größte Ablehnungsrisiko des ganzen Weges, weil ein Prüfer, der vor
einer Passwortabfrage steht, die App wegen „App-Zugriff nicht möglich" ablehnt:

- `twa-manifest.json` setzt `fallbackType: "customtabs"`. Wo die TWA nicht
  greift, öffnet ein Custom Tab — dort kann der Verweis fehlen.
- Nach dem ersten Herein steht der Hash im `localStorage`. Wer ihn leert oder
  das Gerät wechselt, steht wieder vor der Abfrage — ein Prüfer startet immer
  frisch.

**Deshalb: Schritt 7 ernst nehmen.** Startet das Spiel auf dem Handy ohne
Abfrage, ist die Sache erledigt. Wenn nicht, gibt es zwei Auswege:

- den Riegel für die Einreichung fallen lassen (`GAMBIT_ZUGANG` leer bauen
  bzw. den Riegel-Einschub in `tools/seite-bauen.mjs` überspringen), oder
- einen zweiten Durchlass einbauen: `?zugang=<Hash>` an die `startUrl` der
  Hülle, den der Riegel zusätzlich akzeptiert. Der wirkt auch im Custom Tab.

Sag mir, was das Handy zeigt — dann baue ich den passenden Weg ein.

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
