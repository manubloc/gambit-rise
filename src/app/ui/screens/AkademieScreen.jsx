// ── DIE AKADEMIE ────────────────────────────────────────────────────────────
// Besitzer-Feedback (v0.51): "Regeln, Figuren und Chronik sind doch das
// gleiche" - stimmt. DREI Reiter statt fuenf: CHRONIK (jede Figur lehrt ihre
// Gangart selbst, die klassischen sechs eingeschlossen), SPIELWEISE (Ziel,
// Sonderzuege, HP, Energie, Ausruestung, Kampagne und der HOFWERT samt
// seiner Online-Bedeutung - die frueheren Regeln-Tafeln stehen hier vorn)
// und der SCHNELLKURS. Alle Texte kommen aus EINEM
// Datensatz (src/content/lehren.js), den spaeter auch die Erstbesuch-Popups
// der Menues lesen - Kurz- und Langfassung laufen nie auseinander.
import { useState } from "react";
import { T } from "../theme.js";
import { Segmented } from "../primitives.jsx";
import { GoldRule } from "../Gilded.jsx";
import { hpUnlocked } from "../../../meta/index.js";
import { LEHREN } from "../../../content/lehren.js";
import { ChroniclePanel } from "./ArmyScreen.jsx";
import { TutorialScreen } from "./TutorialScreen.jsx";
import { Brettchen } from "../Brettchen.jsx";

/* ── v1.89.0 (Besitzer: "bei der Spielweise visuell arbeiten mit diesen
   Schachfelddarstellungen"): zu den Lehren, die einen ZUG erklaeren, steht
   ein Brettchen - gezeichnet, nicht fotografiert. Koordinaten (x, y) mit
   (0,0) oben links; Weiss unten. */
const BRETTCHEN = {
  ziel: { figuren: [{ x: 0, y: 0, kind: "K", dunkel: true }, { x: 1, y: 1, kind: "Q" }, { x: 1, y: 2, kind: "K" }],
    schlaege: [[1, 0], [0, 1]] },
  rochade: { figuren: [{ x: 1, y: 4, kind: "K" }, { x: 4, y: 4, kind: "R" }],
    pfeile: [[1, 4, 3, 4], [4, 4, 2, 4]], geister: [{ x: 3, y: 4, kind: "K" }, { x: 2, y: 4, kind: "R" }] },
  enpassant: { figuren: [{ x: 1, y: 2, kind: "P" }, { x: 2, y: 2, kind: "P", dunkel: true }],
    pfeile: [[2, 0, 2, 2, "gestrichelt"], [1, 2, 2, 1]], schlaege: [[2, 2]], ziele: [[2, 1]] },
  umwandlung: { figuren: [{ x: 2, y: 1, kind: "P" }], pfeile: [[2, 1, 2, 0]], geister: [{ x: 2, y: 0, kind: "Q" }] },
};

function Lehrtafel({ eintrag }) {
  const brett = BRETTCHEN[eintrag.id];
  return (
    <div style={{ background: `linear-gradient(170deg, ${T.panel2}, ${T.panel})`,
      border: `1px solid ${T.line}`, borderRadius: T.radius, padding: "12px 14px" }}>
      <div className="gg-serif" style={{ fontSize: 15.5, color: T.gold, letterSpacing: ".04em", marginBottom: 6 }}>
        {eintrag.sym ? <span style={{ marginRight: 8, fontSize: 18 }}>{eintrag.sym}</span> : null}
        {eintrag.titel}
      </div>
      {brett && <div style={{ margin: "4px 0 10px" }}><Brettchen {...brett} /></div>}
      {eintrag.text.split("\n\n").map((abs, i) => (
        <div key={i} style={{ fontSize: 12.5, lineHeight: 1.62, color: T.text, marginTop: i ? 8 : 0 }}>{abs}</div>
      ))}
    </div>
  );
}

export function AkademieScreen({ profile, t, en = false, account = null, onDone }) {
  const [tab, setTab] = useState("chron");
  const L = LEHREN[en ? "en" : "de"];
  /* v1.0.33 (Besitzer): DIE AKADEMIE LEHRT NUR, WAS ES SCHON GIBT. Der
     Lehrblock "Der HP-Modus" erklaerte Lebenspunkte und Schaden auch dann,
     wenn das Spiel noch reines Schach ist - er beantwortete eine Frage, die
     sich der Spieler in Kapitel I gar nicht stellen kann, und nahm dem
     Erwachen seine Ueberraschung. Er tritt an dem Tag hinzu, an dem die
     alte Magie erwacht. Alles andere (Ziel, Gangarten, Rochade, Matt)
     bleibt von Anfang an lesbar. */
  const blutet = hpUnlocked(profile);
  const liste = tab === "spielweise"
    ? [...L.regeln, ...L.spielweise].filter((e) => blutet || e.id !== "hp")
    : null;
  return (
    <div style={{ display: "grid", gap: 12, paddingTop: 8 }}>
      <Segmented value={tab} onChange={setTab} options={[
        { value: "chron", label: en ? "Chronicle" : "Chronik" },
        { value: "spielweise", label: en ? "Playstyle" : "Spielweise" },
        { value: "kurs", label: en ? "Crash course" : "Schnellkurs" },
      ]} />
      {liste && (
        <div style={{ display: "grid", gap: 10 }}>
          {tab === "spielweise" && (
            <div style={{ fontSize: 11.5, color: T.dim, lineHeight: 1.55, padding: "0 2px" }}>
              {en ? "How this game grows beyond chess — and what your court value means."
                  : "Wie dieses Spiel über das Schach hinauswächst — und was dein Hofwert bedeutet."}
            </div>
          )}
          {liste.map((e) => <Lehrtafel key={e.id} eintrag={e} />)}
        </div>
      )}
      {tab === "chron" && <ChroniclePanel profile={profile} t={t} en={en} account={account} />}
      {tab === "kurs" && (
        <div style={{ display: "grid", gap: 10 }}>
          <GoldRule />
          <TutorialScreen t={t} en={en} onDone={() => setTab("chron")} />
        </div>
      )}
    </div>
  );
}
