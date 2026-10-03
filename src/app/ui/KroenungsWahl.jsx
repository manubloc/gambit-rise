/* ── DIE KRONENWAHL (v1.90.12, Audit A11 + Besitzerwunsch 29.9.2026) ────────
   "man sollte uebrigens auch andere figuren kroenen koennen. und dafuer dann
   unten dem schachbrett in meinem bereich wo sonst die entsprechenden popups
   aus dem haendershop oder faehigkeiten sind dort sollte dann eine kleiner
   hinweis text kommen waehle eine figur aus die gekroent werden soll mit dem
   anteil mit dem du mit deinem bauer ankommst und dann ist die auswahl auch
   ueber den slider wie wir ihn aus der aufstellung kennen. bloss halt in
   etwas kleiner."

   WARUM EINE EIGENE DATEI: als Block in GameScreen.jsx waere sie nur ueber
   Zeichenketten im Quelltext pruefbar gewesen - und genau diese Art Probe
   ist der Befund von A15 (in test_anim stand drei Fassungen lang "das
   Rueckblickfenster zeigt Bild, Namen und Werte", geprueft an zwei
   Zeichenketten, waehrend das Fenster abstuerzte). Als eigene Komponente
   laesst sie sich WIRKLICH rendern: test_ui baut sie auf und liest heraus,
   was darinsteht.

   DIE WERTE: gerechnet mit derselben Formel wie die Kroenung selbst
   (werteBeiStufe, beim Helden auf HELD_PUNKTE umskaliert, Angriff als Rest).
   Sonst verspraeche die Kachel etwas anderes, als danach auf dem Brett
   steht. Der uebertragene Lebensanteil steht dabei - der Besitzer hat ihn
   ausdruecklich so gewollt ("uebertrage den Anteil mit dem man kroent").

   KEIN ABBRECHEN: der Zug ist getan, sobald der Bauer die Grundreihe
   betritt - offen ist nur die Art. Ein "Zurueck" muesste den Zug zuruecknehmen,
   und das ist der Zeitenwender, nicht diese Karte.                          */
import { KROENUNG_ARTEN, werteBeiStufe, HELD_PUNKTE } from "../../core/index.js";
import { BandBild } from "./BandBild.jsx";   /* v1.90.26 */
import { CHARACTERS, KIND_TO_CHAR } from "../../content/index.js";
import { paintedForPiece } from "./board/paintedArt.js";
import { T } from "./theme.js";

/** Die Werte, die eine Figur dieser Art nach der Kroenung WIRKLICH haette. */
export function kroenungsWerte(kind, bauer) {
  if (!bauer || bauer.maxHp == null) return null;
  const anteil = bauer.maxHp ? (bauer.hp ?? bauer.maxHp) / bauer.maxHp : 1;
  const w = werteBeiStufe(kind, bauer.level || 1,
    { maxLevel: bauer.maxLevel || undefined, punkte: bauer.hero ? HELD_PUNKTE : null });
  let mhp = w.hp, atk = w.atk;
  if (bauer.hero) { const ganz = w.hp + w.atk; mhp = Math.round(w.hp * HELD_PUNKTE / Math.max(1, ganz)); atk = HELD_PUNKTE - mhp; }
  mhp = Math.max(1, mhp); atk = Math.max(1, atk);
  return { hp: Math.max(1, Math.min(mhp, Math.round(mhp * anteil))), maxHp: mhp, atk };
}

export function KroenungsWahl({ bauer, en = false, hpMode = false, onWahl }) {
  if (!bauer) return null;
  const anteil = bauer.maxHp ? (bauer.hp ?? bauer.maxHp) / bauer.maxHp : 1;
  const nameFuer = (k) => {
    const ch = CHARACTERS[KIND_TO_CHAR[k]];
    return ch ? (en ? ch.nameEn : ch.nameDe) : k;
  };
  return (
    <div data-kroenung="1" style={{ flex: "0 0 auto", padding: "8px 0 6px",
      borderTop: `1px solid ${T.selLine}33`, background: "rgba(14,10,24,.55)" }}>
      <div className="gg-quill" style={{ textAlign: "center", fontSize: 13.5, color: "#e9d296",
        padding: "0 14px 7px", lineHeight: 1.35 }}>
        {en ? "Choose the piece to be crowned" : "Wähle eine Figur, die gekrönt werden soll"}
        {hpMode && <span style={{ display: "block", fontSize: 11.5, color: "#aab2c8", marginTop: 2 }}>
          {en ? `Your pawn carries ${Math.round(anteil * 100)} % of its life across.`
              : `Dein Bauer bringt ${Math.round(anteil * 100)} % seines Lebens mit.`}</span>}
      </div>
      <div data-kroenung-schieber="1" style={{ display: "flex", gap: 8, overflowX: "auto", overflowY: "hidden",
        scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", padding: "0 14px 2px" }}>
        {KROENUNG_ARTEN.map((k) => {
          /* GEMESSEN, statt angenommen: `paintedRoh` in paintedArt.js liest
             `piece.color` an KEINER Stelle - die Gemaelde sind farbneutral,
             Freund und Feind unterscheiden Sockelband und Filter (v1.0.49,
             Besitzerentscheid: "beide Seiten tragen den blauen Soldaten").
             Die Farbe hier durchzureichen sah richtig aus und tat nichts;
             eine Probe, die "Schwarz sieht andere Bilder" verlangte, wurde
             darum rot und hat es aufgedeckt. Und einen Feind-Filter braucht
             die Karte nicht: wer kroent, ist immer die eigene Seite - auch
             im Hotseat, wo das Brett zum Ziehenden dreht. */
          const bild = paintedForPiece({ kind: k, hero: !!bauer.hero, level: bauer.level || 1 });
          const w = hpMode ? kroenungsWerte(k, bauer) : null;
          return (
            <button key={k} data-kroenung-art={k} onClick={() => onWahl && onWahl(k)}
              style={{ flex: "0 0 auto", width: 84, scrollSnapAlign: "center", cursor: "pointer",
                fontFamily: "inherit", padding: "6px 4px 7px", borderRadius: 11,
                border: `1px solid ${k === KROENUNG_ARTEN[0] ? "rgba(233,210,150,.62)" : T.selLine + "55"}`,
                background: "rgba(8,11,20,.55)", color: "#e8e4d8", textAlign: "center" }}>
              {bild && <BandBild kennung={"kr-" + k} src={bild} style={{ width: 58, height: 58, objectFit: "contain", objectPosition: "bottom" }} />}
              <div className="gg-quill" style={{ fontSize: 11.5, lineHeight: 1.1, marginTop: 3 }}>{nameFuer(k)}</div>
              {w && <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 3 }}>
                <span style={{ font: "800 12px/1 Georgia, serif", color: "#b6cdff" }}>{w.atk}</span>
                <span style={{ font: "800 12px/1 Georgia, serif", color: "#ffb3aa" }}>{w.hp}/{w.maxHp}</span>
              </div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
