# Gambit Rise in den Play Store — der ganze Weg

> **Stand 23.9.2026 (Umbenennung, Umzug, neues Paket).** Das Spiel heißt
> **Gambit Rise**, die Adresse ist **gambitrise.com**, die App wohnt unter
> **/spielen/**.
> **GEPRÜFT: die App ist im Play Store NICHT veröffentlicht** (die Store-
> Adresse gibt es nicht). Damit ist die Paketkennung frei — sie lautet jetzt
> **`com.gambitrise.app`** statt `com.gambitrise.app`.
> In der Play Console liegt noch ein alter Eintrag (App 4972631526998923335,
> altes Paket). Eine Paketkennung lässt sich dort nie ändern, auch nicht im
> Entwurf: also **neuer Eintrag** mit der neuen Kennung, den alten löschen
> oder liegen lassen.
> **Neues Paket bauen ist Pflicht**: die TWA zeigt auf Host und Startpfad, und
> beides hat sich geändert (gambitrise.com, /spielen/). Danach die
> Fingerabdrücke des neuen Schlüssels in `public/.well-known/assetlinks.json`
> eintragen — die Datei wird auf der neuen Domain korrekt als JSON
> ausgeliefert (geprüft).

Stand: 5.8.2026, v1.0.6. Die App ist eine **TWA** (Trusted Web Activity):
eine dünne Android-Hülle, die gambitrise.com zeigt. Darum gilt dauerhaft:
**jeder Push auf main ist zugleich das Play-Store-Update** — nur Änderungen an
der Hülle selbst (Icon, Name, Berechtigungen) brauchen eine neue Einreichung.

Vorbereitet liegt hier:
- `design/twa-manifest.json` — fertige Bubblewrap-Konfiguration
- `design/playstore-feature-1024x500.png` — Pflicht-Grafik für den Store-Eintrag
- `public/.well-known/assetlinks.json` — liegt schon live, trägt aber noch den
  Platzhalter-Fingerprint (Schritt 4)
- Store-Texte: unten in diesem Dokument

## 1. Die Hülle bauen (einmalig, ~20 Minuten)

Braucht Node (hast du) und einmalig das Android-SDK, das Bubblewrap selbst
herunterlädt, wenn du es lässt.

```
npm i -g @bubblewrap/cli
mkdir gg-android && cd gg-android
cp ../grand-gambit/design/twa-manifest.json .
bubblewrap build
```

Beim ersten Lauf fragt Bubblewrap nach JDK/SDK (beides "herunterladen"
bestätigen) und legt den **Upload-Schlüssel** `gg-upload.keystore` an —
**Passwort merken und die Datei sichern** (Passwortmanager + Kopie). Ohne sie
kannst du später keine neue Hüllen-Version hochladen.

Ergebnis: `app-release-bundle.aab` — das lädst du in die Play Console.

Alternative ohne Kommandozeile: https://www.pwabuilder.com → gambitrise.com
eingeben → Android-Paket herunterladen. Erzeugt dasselbe, nur klickbar.

## 2. App in der Play Console anlegen

Play Console → „App erstellen": Name **Gambit Rise**, Standardsprache
Deutsch, App (kein Spiel? → doch: **Spiel**, Kategorie **Brettspiele**),
kostenlos.

Danach das Dashboard abarbeiten („Richte deine App ein"):
- **Datenschutzerklärung**: `https://gambitrise.com/privacy.html`
- **App-Zugriff**: „Alle Funktionen ohne Anmeldung zugänglich" trifft NICHT zu
  (Konto ist Pflicht) → Zugangsdaten für das Prüferteam hinterlegen: lege
  dafür ein eigenes Konto an (z. B. pruefer-google@…) und gib E-Mail+Passwort
  dort an.
- **Anzeigen**: enthält keine Werbung.
- **Altersfreigabe** (IARC-Fragebogen): Kategorie Spiel; Gewalt: milde
  Fantasy-Gewalt gegen Fantasiewesen (Schachfiguren/Bestien, kein Blut,
  keine realistische Gewalt); kein Glücksspiel, keine Käufe, keine
  Nutzerinteraktion mit freiem Chat (Freundes-Duelle ohne Chat), keine
  Standortweitergabe. Ergebnis wird voraussichtlich USK 6 / PEGI 7 (wegen
  milder Fantasy-Kämpfe) oder niedriger.
- **Zielgruppe**: 13+ wählen (einfachster Weg; unter 13 zieht die strengen
  Familienrichtlinien nach sich).
- **Datensicherheit** (der Fragebogen, ehrlich ausfüllen):
  - Werden Daten erhoben? **Ja.**
  - *E-Mail-Adresse* — Zweck: Kontoverwaltung/Anmeldung; verpflichtend;
    verschlüsselt übertragen; Löschung auf Anfrage UND in der App möglich
    (Profil → Konto löschen). Wird NICHT mit Dritten geteilt.
  - *Nutzer-IDs (Spielname, Freundes-Code)* — Zweck: App-Funktionen
    (Online-Duelle); optional (nur bei Online-Nutzung).
  - *Ungefährer Standort (Land/Region aus dem Netz, kein GPS)* — Zweck:
    Analysen/Betrugsprävention; wird nicht geteilt. (Das ist die grobe
    Herkunft im Spielerbuch.)
  - *App-Interaktionen/Absturzprotokolle* — Zweck: Analysen/Stabilität.
  - Alle Daten werden verschlüsselt übertragen (HTTPS/WSS): **Ja.**
  - Löschmöglichkeit: **Ja, in der App** (Profil → Konto löschen).

## 3. Interner Test starten

Test und Release → **Interner Test** → neue Version → `app-release-bundle.aab`
hochladen → Versionshinweise (ein Satz reicht) → speichern/veröffentlichen.
Dann **Tester**: E-Mail-Liste anlegen (bis 100 Adressen, Google-Konten) und
den **Opt-in-Link** teilen. Freigabe dauert Minuten, keine Prüfung.

Merke: Zeit im internen Test zählt NICHT für die 12-Tester-Pflicht. Sobald
~20 Leute mitspielen wollen → dieselbe .aab in den **geschlossenen Test**
kopieren (ein Klick, „Version hochstufen"), dort läuft die 14-Tage-Uhr.

## 4. assetlinks scharf schalten (wichtig — sonst Browserleiste)

Die Hülle gilt erst als „vertrauenswürdig", wenn die Domain den
Signatur-Fingerprint bestätigt. **Achtung:** Bei Play App Signing signiert
GOOGLE die ausgelieferte App mit einem eigenen Schlüssel — es zählt also
**Googles** Fingerprint, nicht dein Upload-Schlüssel.

Play Console → Test und Release → Einrichtung → **App-Integrität** →
App-Signatur → „SHA-256-Zertifikatfingerabdruck" kopieren. Dann in
`public/.well-known/assetlinks.json` den Platzhalter ersetzen — am
robustesten BEIDE Fingerprints als zwei Einträge im Array (Googles +
Upload-Key, für lokale Testbuilds). Push auf main, ~2 Minuten später live.
Prüfen: https://gambitrise.com/.well-known/assetlinks.json

Zeigt die installierte App oben eine graue Browserleiste, stimmt der
Fingerprint (noch) nicht — häufigster Stolperstein des ganzen Wegs.

## 5. Store-Eintrag (für später, schon vorformuliert)

**App-Name:** Gambit Rise — Das Schach-RPG

**Kurzbeschreibung (≤ 80 Zeichen):**
> Schach mit Leben: Figuren leveln, lernen Fähigkeiten — Kampagne & Duelle.

**Lange Beschreibung:**
> Gambit Rise ist Schach, das mit dir wächst. Deine Figuren haben
> Lebenspunkte, steigen im Level auf und lernen echte Fähigkeiten — vom
> Sturmschritt des Bauern bis zum Drachenflug.
>
> ♟ KAMPAGNE: Ein Feldzug über zwölf Kapitel mit verzweigten Pfaden,
> 27 rekrutierbaren Helden und 25 Bestien. Jedes Kapitel ein eigenes Land,
> jeder Meister ein eigenes Duell.
>
> ♟ ZWEI SPIELARTEN: Klassisches Schach in voller Strenge — oder Gefechte
> mit Fähigkeiten, Lebenspunkten und Ausrüstung.
>
> ♟ ONLINE & ZU ZWEIT: Faire Duelle gegen Freunde und Zufallsgegner,
> Fernpartien mit Benachrichtigung, oder zu zweit an einem Gerät.
>
> ♟ OFFLINE SPIELBAR: Die ganze Kampagne läuft ohne Internet.
>
> Kostenlos. Ohne Werbung. Ohne Käufe.

(Englische Fassung analog; die App selbst ist zweisprachig DE/EN.)

**Grafiken:**
- App-Symbol 512×512: `public/icons/icon-512.png` (liegt bereit)
- Feature-Grafik 1024×500: `design/playstore-feature-1024x500.png`
- Screenshots Telefon (mind. 2, besser 4–6, Hochformat): am echten Gerät
  aufnehmen — Hauptmenü, Kapitel-Einstieg (Ken Burns), Kampagnenkarte,
  Brett im Gefecht, Hofstaat. (Der Kapitel-Einstieg und das Brett sind die
  stärksten Motive.)

## 6. Wenn die Hülle sich mal ändern muss

`appVersionCode` in twa-manifest.json +1, `bubblewrap update && bubblewrap
build`, neue .aab hochladen. Nötig nur bei: Icon/Name/Farben der Hülle,
Berechtigungen, Bubblewrap-Sicherheitsupdates (die Console erinnert daran).
Spielinhalt braucht das nie — der kommt von gambitrise.com.

## Datensicherheit — Antwortbogen (Stand v1.47.0, aus dem Code erhoben)

Grundlage ist, was das Spiel tatsächlich an Server schickt (geprüft im Code,
nicht aus der Erinnerung). **Achtung:** eine frühere Zusammenfassung im Chat
nannte nur E-Mail, Name und Spielstände — das war unvollständig.

**Erhebt oder teilt die App Nutzerdaten? — Ja.**
**Werden alle Daten bei der Übertragung verschlüsselt? — Ja** (HTTPS/WSS).
**Können Nutzer die Löschung ihrer Daten beantragen? — Ja** (Profil →
Konto löschen, ruft `/vergiss` am Spielserver auf).
**Geteilt mit Dritten (im Sinne von Google)? — Nein.** Supabase und
Cloudflare sind Dienstleister, die in unserem Auftrag verarbeiten — das ist
laut Google kein „Teilen".

| Datentyp (Play-Kategorie) | Was genau | Erhoben | Pflicht? | Zweck |
|---|---|---|---|---|
| Persönliche Info → E-Mail-Adresse | Konto (Supabase) | ja | **optional** (Gast geht ohne) | Kontoverwaltung |
| Persönliche Info → Name | Spielername | ja | optional | App-Funktionen (Rangliste, Duelle) |
| Persönliche Info → Nutzer-IDs | Konto-ID | ja | optional | Kontoverwaltung |
| App-Aktivität → Sonstige Aktionen | Spielstand in der Wolke, Ranglistenpunkte, Züge in Online-Duellen | ja | optional | App-Funktionen |
| App-Aktivität → Sonstige nutzergenerierte Inhalte | Feedbacktext | ja | optional | Support / Entwicklung |
| Fotos und Videos → Fotos | bis zu zwei Bilder im Feedback | ja | optional | Support |
| App-Infos und Leistung → Absturzprotokolle | **automatisch** bei Absturz: Fehlertext, Stapelspur | ja | **nicht optional** (automatisch) | Analyse, App-Funktionen |
| App-Infos und Leistung → Diagnose | Spielversion, Browserkennung, letzte Fehler | ja | nicht optional | Analyse |
| Geräte- oder andere IDs | Push-Kennung für Benachrichtigungen | ja | optional (nur wer einschaltet) | App-Funktionen |

**Nicht erhoben:** Standort, Kontakte, Finanzdaten, Gesundheit, Nachrichten,
Audio, Dateien, Kalender, Web-Browsing, Werbe-ID.

**Offen zu entscheiden:** Soll der automatische Absturzbericht künftig
abschaltbar sein? Dann wäre er „optional" und das Formular freundlicher.

## Weg zum Livegang (Stand 24.9.2026, v1.61.0)

### Fertig vorbereitet (liegt in design/playstore/)
- icon-512.png - Store-Symbol, 512 x 512, randlos (Google rundet selbst)
- feature-1024x500.png - Feature-Grafik mit neuer Wortmarke
- handy-1080x1920-1..6 - Handy-Screenshots, montiert (Ueberschrift + echte Aufnahme)
- tablet7-1200x1920-1..6 - 7-Zoll-Tablet
- tablet10-1600x2560-1..6 - 10-Zoll-Tablet
Alle als 24-Bit-PNG ohne Transparenz, Seitenverhaeltnis unter 2:1 (Googles Vorgabe).
Reihenfolge: Gefecht, Hofstaat, Faehigkeiten, Aufstellung, Welt, Haendler.

### In der Play Console bereits erledigt
App angelegt (com.gambitrise.app), Store-Texte, Datenschutzlink, Werbung, Werbe-ID,
Behoerden-App, Zielgruppe 13+, Finanz- und Gesundheitsfunktionen, App-Zugriff
(Gastzugang -> nicht zugangsbeschraenkt). Altersfragebogen vollstaendig ausgefuellt.

### Schritte, in dieser Reihenfolge
1. **Altersfreigaben absenden** - Speichern, Weiter, Zusammenfassung bestaetigen.
2. **Datensicherheit** nach dem Antwortbogen oben eintragen (oder Claude, sobald
   der Browser stabil laeuft).
3. **Store-Eintrag -> Grafiken**: die Dateien aus design/playstore/ hochladen.
4. **Android-Paket bauen** auf pwabuilder.com:
   - Adresse: https://gambitrise.com/spielen/
   - "Package for stores" -> Android -> Google Play
   - Package ID `com.gambitrise.app`, App name und Launcher name `Gambit Rise`
   - Signing key: **neu erzeugen lassen**. Die ZIP enthaelt `signing.keystore`
     und `signing-key-info.txt` mit den Passwoertern.
   - **Schluessel und Passwoerter doppelt sichern** (Passwortmanager + zweiter Ort).
     Ohne diesen Schluessel ist nie wieder ein Update moeglich.
5. **assetlinks.json** aus der ZIP an Claude geben -> kommt nach
   public/.well-known/assetlinks.json. Zusaetzlich den SHA-256 des
   **App-Signaturschluessels** aus der Console (Test und Veroeffentlichung ->
   App-Integritaet) - Google signiert neu, beide Fingerabdruecke gehoeren hinein,
   sonst zeigt die App eine Browserleiste.
6. **Geschlossener Test**: Testen -> Geschlossene Tests -> Track anlegen, die
   .aab hochladen, Tester per E-Mail-Liste eintragen, Release einfuehren.
7. **Fuer private Entwicklerkonten** (angelegt nach dem 13.11.2023): mindestens
   **12 Tester, 14 Tage am Stueck** im geschlossenen Test, dann unter
   "Produktionszugriff" den Antrag stellen. Pruefen, ob das fuer dieses Konto gilt.
8. **Produktion**: Release anlegen, einreichen. Pruefung durch Google meist
   einige Tage. Ab dann funktioniert der Link
   https://play.google.com/store/apps/details?id=com.gambitrise.app -
   das Abzeichen auf der Landingpage zeigt schon dorthin.

### Parallel
- grandgambit.win leitet ab v1.61.0 per 301 auf gambitrise.com (Pages-Funktion).
  Danach in der Search Console die **Adressaenderung** von grandgambit.win auf
  gambitrise.com melden.
