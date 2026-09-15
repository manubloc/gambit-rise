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
import { AbilityIcon, FAMILIE, BUND_Z } from "./AbilityIcons.jsx";

/* ── DIE ECHTEN KULISSEN (v1.12.1) ───────────────────────────────────────
   Besitzerwunsch: "Was ich gut faende, wenn diese Popups evtl auch den
   Hintergrund haben, die auch die anderen haben."

   Statt eines Farbverlaufs traegt das Fenster jetzt dasselbe Bild wie die
   Figurenkarten dieses Bundes - Hof, Wildnis, Riss oder Schmiede. Der
   Verlauf bleibt als Rueckfall darunter, falls ein Bild fehlt.

   Darueber liegt ein dunkler Schleier: der Text muss lesbar bleiben, und ein
   Hintergrund, der mit der Schrift kaempft, hilft niemandem. */
/* ── v1.13.4: JEDER BUND HAT JETZT SEINE EIGENE KULISSE ────────────────────
   Bis hierher teilten sich die zehn Buende vier Stimmungsbilder - Hof,
   Wildnis, Riss, Schmiede. Drei Buende sahen also gleich aus. Der Besitzer
   hat zehn eigene Hintergruende geliefert, einen je Bund; sie liegen unter
   assets/kulissen. Die Stimmung bleibt als Farbverlauf darunter und faengt
   den Fall ab, dass ein Bild fehlt. */
import kulisseKrone from "./assets/kulissen/bund-krone.webp";
import kulisseKonzil from "./assets/kulissen/bund-konzil.webp";
import kulisseGeleit from "./assets/kulissen/bund-geleit.webp";
import kulisseFaehrte from "./assets/kulissen/bund-faehrte.webp";
import kulisseSchatten from "./assets/kulissen/bund-schatten.webp";
import kulisseSchildwacht from "./assets/kulissen/bund-schildwacht.webp";
import kulisseGezeiten from "./assets/kulissen/bund-gezeiten.webp";
import kulisseBannkreis from "./assets/kulissen/bund-bannkreis.webp";
import kulisseSturm from "./assets/kulissen/bund-sturm.webp";
import kulisseNachtwache from "./assets/kulissen/bund-nachtwache.webp";

const BILD = {
  krone: kulisseKrone, konzil: kulisseKonzil, geleit: kulisseGeleit,
  faehrte: kulisseFaehrte, schatten: kulisseSchatten, schildwacht: kulisseSchildwacht,
  gezeiten: kulisseGezeiten, bannkreis: kulisseBannkreis, sturm: kulisseSturm,
  nachtwache: kulisseNachtwache,
};
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
  /* Die Familienfarbe des Bundsymbols - sie faerbt die Regelbox. */
  const fam = FAMILIE[(BUND_Z[`bund_${b.id}`] || [])[0]] || FAMILIE.riss;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 64, display: "grid", placeItems: "center",
      background: "rgba(8,10,14,.86)", backdropFilter: "blur(3px)", padding: "18px 10px" }}
      onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 380,
        background: KULISSE[b.stimmung] || KULISSE.hof,
        border: "1px solid rgba(167,139,250,.5)", borderRadius: 18,
        /* v1.13.1: dieselbe leuchtende Kontur wie am Verbessern-Knopf - der
           Besitzer mag sie, und hier passt sie: ein Bund erwacht. */
        animation: "ggUpPulse 2.6s ease-in-out infinite",
        boxShadow: "0 18px 60px rgba(0,0,0,.7), 0 0 40px rgba(124,58,237,.18)",
        padding: "18px 16px 16px", textAlign: "center",
        position: "relative", overflow: "hidden" }}>

        {/* die Kulisse DIESES Bundes, gedaempft - der Text hat Vorrang */}
        {BILD[b.id] && <img src={BILD[b.id]} alt="" aria-hidden draggable={false}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", opacity: 0.42, pointerEvents: "none" }} />}
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(180deg, rgba(10,7,19,.32) 0%, rgba(10,7,19,.62) 58%, rgba(10,7,19,.86) 100%)" }} />
        <div style={{ position: "relative" }}>

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
        {/* ── DIE REGEL TRAEGT DIE FARBE IHRER FAEHIGKEIT (v1.13.1) ────────
            Besitzerwunsch: das Symbol gehoert zur Beschreibung, nicht ueber
            den Namen - und die Box soll die Farbe des Symbolhintergrunds
            haben, nur eine Spur heller.

            Das bindet beides zusammen: wer das Zeichen spaeter auf einer
            Karte wiedersieht, erkennt die Farbe und weiss, wovon die Rede
            ist. */}
        <div style={{ display: "flex", alignItems: "center", gap: 10,
          background: fam.grund, border: `1px solid ${fam.ring}66`,
          borderRadius: 11, padding: "10px 12px", marginBottom: 10, textAlign: "left" }}>
          <AbilityIcon id={`bund_${b.id}`} size={34} />
          <div className="gg-quill" style={{ fontSize: 14, lineHeight: 1.32, color: fam.strich }}>{regel}</div>
        </div>

        {/* WARUM - die Geschichte. Kursiv und stiller, sie erklaert nichts,
            sie faerbt. */}
        <div className="gg-quill" style={{ fontSize: 12.5, lineHeight: 1.45, fontStyle: "italic",
          color: "rgba(214,206,232,.78)", marginBottom: 14, padding: "0 4px" }}>{story}</div>

        <button onClick={onClose} style={{ width: "100%", padding: "11px 12px", borderRadius: 11,
          border: "1px solid rgba(167,139,250,.6)",
          background: "linear-gradient(180deg,#5b21b6,#3b1080)", color: "#fff",
          font: "700 14.5px system-ui", letterSpacing: ".02em",
          animation: "ggUpPulse 2.2s ease-in-out infinite",
          boxShadow: "0 0 16px rgba(124,58,237,.45)" }}>
          {en ? "Understood" : "Verstanden"}
        </button>
        </div>
      </div>
    </div>
  );
}
