/* ══════════════════════════════════════════════════════════════════════════
   DAS ERWACHEN EINES BUNDES  (v1.12.0)

   Besitzerwunsch: "Wir machen das so, dass diese Faehigkeiten erst
   aktivierbar sind, wenn man die Figuren auf der letzten Stufe hat. Und dann
   kriegt man natuerlich ein Pop-up und der Mechanismus wird erklaert."

   DER MOMENT, AUF DEN MAN HINARBEITET. Ein Bund erwacht nur einmal - wenn die
   letzte seiner Figuren die Hoechststufe erreicht. Das Fenster ist die
   Belohnung dafuer und muss drei Dinge leisten: zeigen, WER sich verbunden
   hat, sagen, WAS das bewirkt, und erzaehlen, WARUM.

   ES ERSCHEINT NUR EINMAL JE BUND. Das Profil merkt sich, welche schon
   vorgestellt wurden - sonst ginge es bei jedem Start wieder auf.
   ══════════════════════════════════════════════════════════════════════════ */

import React from "react";
import { T } from "./theme.js";
import { BUENDE } from "../../content/buende.js";
import { CHARACTERS } from "../../content/index.js";
import { paintedForPiece } from "./board/paintedArt.js";

/* Die vier Kulissen - jeder Bund traegt eine, wie seine Figuren. */
const KULISSE = {
  hof: "radial-gradient(120% 90% at 50% 10%, #3a2d5e 0%, #241a3e 46%, #14102a 100%)",
  wildnis: "radial-gradient(120% 90% at 50% 10%, #24402f 0%, #1a2e26 46%, #101c1a 100%)",
  riss: "radial-gradient(120% 90% at 50% 10%, #4a2260 0%, #2c1440 46%, #160a26 100%)",
  schmiede: "radial-gradient(120% 90% at 50% 10%, #4a3320 0%, #2e2014 46%, #18100a 100%)",
};

export function BundErwacht({ bundId, en, onClose }) {
  const b = BUENDE[bundId];
  if (!b) return null;
  const name = en ? (b.nameEn || b.nameDe) : b.nameDe;
  const regel = en ? (b.regelEn || b.regelDe) : b.regelDe;
  const story = en ? (b.storyEn || b.storyDe) : b.storyDe;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 64, display: "grid", placeItems: "center",
      background: "rgba(8,10,14,.86)", backdropFilter: "blur(3px)", padding: "18px 10px" }}
      onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 380,
        background: KULISSE[b.stimmung] || KULISSE.hof,
        border: "1px solid rgba(167,139,250,.5)", borderRadius: 18,
        boxShadow: "0 18px 60px rgba(0,0,0,.7), 0 0 40px rgba(124,58,237,.18)",
        padding: "18px 16px 16px", textAlign: "center" }}>

        {/* Die Ueberschrift sagt, was geschehen ist - nicht der Bundname
            allein, der stuende ohne Zusammenhang da. */}
        <div className="gg-serif" style={{ fontSize: 10.5, letterSpacing: ".18em",
          color: "rgba(196,181,253,.9)", marginBottom: 4 }}>
          {en ? "A BOND AWAKENS" : "EIN BUND ERWACHT"}
        </div>
        <div className="gg-quill" style={{ fontSize: 27, fontWeight: 700, color: "#f2ecdc",
          marginBottom: 12, textShadow: "0 0 18px rgba(167,139,250,.45)" }}>{name}</div>

        {/* WER - die Figuren nebeneinander, so gross wie es der Platz erlaubt.
            Sie sind der Grund, warum man hier steht. */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end",
          gap: 4, marginBottom: 12 }}>
          {b.figuren.map((id) => {
            const ch = CHARACTERS[id];
            if (!ch) return null;
            const bild = paintedForPiece({ kind: ch.kind, color: "w", hero: id === "gambit", level: 10 }, false);
            const h = b.figuren.length > 2 ? 78 : 92;
            return <div key={id} style={{ textAlign: "center" }}>
              {bild && <img src={bild} alt="" draggable={false}
                style={{ height: h, display: "block", filter: "drop-shadow(0 6px 14px rgba(0,0,0,.6))" }} />}
              <div className="gg-quill" style={{ fontSize: 10, color: "rgba(230,222,208,.82)", marginTop: 2 }}>
                {en ? (ch.nameEn || ch.nameDe) : ch.nameDe}
              </div>
            </div>;
          })}
        </div>

        {/* WAS - die Regel, in einem Satz. Hervorgehoben, weil sie der
            eigentliche Gewinn ist. */}
        <div style={{ background: "rgba(124,58,237,.16)", border: "1px solid rgba(167,139,250,.42)",
          borderRadius: 11, padding: "10px 12px", marginBottom: 10 }}>
          <div className="gg-quill" style={{ fontSize: 14.5, lineHeight: 1.35, color: "#f0ead9" }}>{regel}</div>
        </div>

        {/* WARUM - die Geschichte. Kursiv und stiller, sie erklaert nichts,
            sie faerbt. */}
        <div className="gg-quill" style={{ fontSize: 12.5, lineHeight: 1.45, fontStyle: "italic",
          color: "rgba(214,206,232,.78)", marginBottom: 14, padding: "0 4px" }}>{story}</div>

        <button onClick={onClose} style={{ width: "100%", padding: "11px 12px", borderRadius: 11,
          border: "1px solid rgba(167,139,250,.6)",
          background: "linear-gradient(180deg,#5b21b6,#3b1080)", color: "#fff",
          font: "700 14.5px system-ui", letterSpacing: ".02em",
          boxShadow: "0 0 16px rgba(124,58,237,.45)" }}>
          {en ? "So be it" : "So sei es"}
        </button>
      </div>
    </div>
  );
}
