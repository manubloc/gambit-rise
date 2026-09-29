# Ausgemustert in v1.90.13 (Audit A35, Rest)

## `mapBitmaps.js`
Die Koordinatentafel des ALTEN 51-Knoten-Graphen, mit Kennungen wie `n22`.
Seit dem Zwoelf-Kapitel-Graphen importiert sie **niemand** mehr —
CampaignScreen liest `mapBitmaps12.gen.js`. Gemessen am 29.9.2026: kein
einziger Importeur im ganzen Baum. Sie war der letzte Ort, an dem die
n22-Kennungen als CODE standen (die Erwaehnungen in CampaignScreen sind
Kommentare, die die Geschichte festhalten, und bleiben).

## Die zehn `liga*.jpg`
Die Kapitelgemaelde der alten Weltkarte, 4,19 MB. Angezeigt hat sie zuletzt
`mapBitmaps.js`; die heutigen Karten nehmen `assets/kap/kap-01..12.webp`.

**Aber sie wurden trotzdem bei JEDEM Start heruntergeladen**: `Vorlader.jsx`
holt vor dem ersten Bild alles ins Haus, und die zehn standen noch in seiner
Liste. Vier Megabyte pro Erstaufruf fuer Bilder, die seit dem Umbau auf zwoelf
Kapitel niemand mehr zu sehen bekommt. Genau davor warnt `livery.js:123`
schon fuer die Riss-Bilder: "werden vom Vorlader bei JEDEM Start geladen -
gezeigt hat sie nie jemand."

Wer sie zurueckholt, braucht auch wieder einen Anzeiger — sonst laedt er nur.
