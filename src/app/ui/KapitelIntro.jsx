// ── DER EINSTIEG IN EIN KAPITEL ─────────────────────────────────────────────
// v0.98: Wer ein neues Kapitel betritt, sieht zuerst SEIN LAND - vollflaechig,
// ohne Rahmen, mit einem kurzen Wort dazu. Ein Druck, und er steht auf der
// Karte.
//
// Drei Entscheidungen stecken darin:
//
//  1. KEN BURNS. Das Bild steht nicht still: es wandert langsam und wird
//     dabei eine Spur groesser (24 s, kaum merklich). Ein stehendes Bild
//     wirkt wie ein Ladeschirm; ein wanderndes wie ein Blick.
//  2. DIE BILDER SIND NICHT EINGEBUNDEN. Zwoelf Landschaften waeren 3,9 MB
//     im Buendel - mehr als das ganze Spiel. Sie liegen als Dateien daneben
//     und werden geholt, wenn sie gebraucht werden.
//  3. DIE MUSIK KOMMT MIT. Das Kapitelthema beginnt zugleich und blendet
//     ueber neun Sekunden herauf - beim Weiterdruecken laeuft es weiter,
//     der Einstieg geht also nahtlos in die Karte ueber.
import { useEffect, useRef, useState } from "react";
import { T } from "./theme.js";
import { musikBereich } from "./musik.js";
import { klang } from "./klang.js";

const BILD = {
  1: "01-kronland", 2: "02-kornmark", 3: "03-eichwald", 4: "04-krummholz",
  5: "05-grauwacht", 6: "06-wolkenjoch", 7: "07-sattelweite",
  /* v1.0.19: Kapitel VIII war das einzige ohne Bild - der Einstieg fiel dort
     stumm auf die Karte durch. Der Aschgrund ist KEIN graues Aschefeld,
     sondern eine rote Felsschlucht (deshalb heisst das Kartenbild
     "liga-canyon"); wer hier "Asche" liest und grau malt, malt am Ort
     vorbei. */
  8: "08-aschgrund",
  9: "09-wunde", 10: "10-sonnenschlund", 11: "11-kueste", 12: "12-meer",
};

export function kapitelBildDa(liga) { return !!BILD[liga]; }

export function KapitelIntro({ liga, titel, text, onWeiter }) {
  const [da, setDa] = useState(false);
  /* v1.0.3 (Besitzerwunsch): MEHR VOM LAND. Die Bilder sind 16:9 quer -
     am Hochformat-Telefon zeigte object-fit:cover nur den Mittelstreifen,
     rund die Haelfte blieb unsichtbar. Jetzt steht das Bild in voller
     Hoehe und die Kamera FAEHRT quer darueber: von einem Rand zum anderen,
     mit sanftem Zoom 1,0 -> 1,07 (die Quelle traegt 1920 px, am Telefon
     bleibt reichlich Schaerfe-Reserve; ueber 1,1 wird nicht gegangen).
     Die Fahrt wird je Schirm GEMESSEN, nicht geraten: onLoad rechnet den
     Ueberstand aus Bild- und Schirmmass und legt Start/Ziel als
     CSS-Variablen an; ungerade Kapitel fahren nach rechts, gerade nach
     links, damit nicht jeder Einstieg gleich beginnt. */
  const [fahrt, setFahrt] = useState(null);
  const imgRef = useRef(null);
  const t0 = useRef(Date.now());
  const datei = BILD[liga];

  /* Dreht das Telefon mitten im Einstieg, stimmt die gemessene Fahrt nicht
     mehr - dann wird neu gemessen (die Fahrt beginnt von vorn, das ist der
     kleinere Schaden gegenueber einer Luecke am Bildrand). */
  useEffect(() => {
    const neu = () => { if (imgRef.current && imgRef.current.naturalWidth) misst(imgRef.current); };
    window.addEventListener("resize", neu);
    return () => window.removeEventListener("resize", neu);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const misst = (img) => {
    const nw = img.naturalWidth || 16, nh = img.naturalHeight || 9;
    const vw = window.innerWidth, vh = window.innerHeight;
    const bw = vh * (nw / nh);              // Bildbreite, wenn die Hoehe fuellt
    if (bw > vw * 1.04) {
      const ueber = bw - vw;
      // 88 % des Ueberstands abfahren; der Rest ist Reserve fuer den Zoom,
      // dessen Mitte-Skalierung je Seite (0,07 * bw) / 2 hinzugibt.
      const weg = ueber * 0.88;
      const [von, bis] = liga % 2 ? [0, -weg] : [-ueber, -ueber + weg];
      setFahrt({ quer: true, von, bis });
    } else {
      setFahrt({ quer: false });            // Breitschirm: Bild deckt, alter Weg
    }
    setDa(true);
  };

  useEffect(() => {
    try { musikBereich("karte"); } catch {}
    try { klang("kapitel"); } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const weiter = () => {
    /* Ein Versehen soll den Einstieg nicht ueberspringen: die ersten 700 ms
       nimmt der Schirm keinen Druck an. */
    if (Date.now() - t0.current < 700) return;
    try { klang("blattZu"); } catch {}
    onWeiter && onWeiter();
  };

  if (!datei) { onWeiter && onWeiter(); return null; }

  return (
    <div onClick={weiter} style={{ position: "fixed", inset: 0, zIndex: 70, cursor: "pointer",
      background: "#05040a", overflow: "hidden", display: "flex", flexDirection: "column",
      justifyContent: "flex-end" }}>
      {/* Das Land, vollflaechig und in langsamer Fahrt */}
      <img ref={imgRef} src={`./kapitel/${datei}.webp`} alt="" onLoad={(e) => misst(e.target)}
        style={fahrt && fahrt.quer
          ? { position: "absolute", top: 0, left: 0, height: "100%", width: "auto", maxWidth: "none",
              opacity: da ? 1 : 0, transition: "opacity 1.2s ease",
              "--kbVon": fahrt.von + "px", "--kbBis": fahrt.bis + "px",
              animation: "ggKenBurnsFahrt 26s ease-in-out both", willChange: "transform" }
          : { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
              opacity: da ? 1 : 0, transition: "opacity 1.2s ease",
              animation: da ? "ggKenBurns 24s ease-out both" : "none", willChange: "transform" }} />
      {/* Der Fuss dunkelt ab, damit der Text ruhig steht */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none",
        background: "linear-gradient(180deg, rgba(5,4,10,.55) 0%, rgba(5,4,10,0) 26%, rgba(5,4,10,0) 46%, rgba(5,4,10,.88) 92%)" }} />

      <div style={{ position: "relative", padding: "0 22px calc(38px + env(safe-area-inset-bottom))",
        maxWidth: 720, margin: "0 auto", width: "100%", textAlign: "center",
        opacity: da ? 1 : 0, transform: da ? "none" : "translateY(14px)",
        transition: "opacity 1s ease .5s, transform 1s ease .5s" }}>
        <div className="gg-serif" style={{ fontSize: 12, letterSpacing: ".26em", textTransform: "uppercase",
          color: T.gold, marginBottom: 9 }}>Kapitel {["", "I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"][liga] || liga}</div>
        <div className="gg-serif" style={{ fontSize: 30, lineHeight: 1.12, color: "#f4ecd6",
          textShadow: "0 2px 18px rgba(0,0,0,.8)", marginBottom: 12 }}>{titel}</div>
        {text && <div className="gg-serif" style={{ fontSize: 14.5, lineHeight: 1.6, color: "#d8cfbc",
          fontStyle: "italic", textShadow: "0 1px 12px rgba(0,0,0,.9)", marginBottom: 22 }}>{text}</div>}
        <button onClick={(e) => { e.stopPropagation(); weiter(); }}
          style={{ cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 800,
            color: "#241a08", background: "linear-gradient(180deg,#f0d68f,#d3ae5c)",
            border: "none", borderRadius: 12, padding: "12px 30px",
            boxShadow: "0 6px 22px rgba(0,0,0,.5)" }}>Weiter zur Karte ›</button>
      </div>
    </div>
  );
}
