// DER VORLADER (v1.0.12, Besitzer-Punkt 5): der Boot-Riss bleibt stehen, bis
// ALLES im Haus ist - Gemaelde, Schnitzereien, Klaenge, Karten, Boeden. Er
// nutzt dieselben Keyframes wie der HTML-Bootschirm (die <style> im body
// ueberlebt den React-Mount) und geht erst, wenn der letzte Gast da ist.
// Sicherungen: 10 s je Datei, 25 s insgesamt - ein kaputter Pfad haelt das
// Spiel NIE auf. In jsdom (drive3/test_boot) scheitert fetch relativer URLs
// sofort, der Schirm schliesst sich dort also praktisch augenblicklich.
import { useEffect, useState } from "react";
import { alleGemaeldeQuellen } from "./board/paintedArt.js";
import { klangAlleQuellen } from "./klang.js";
import a0 from "./assets/bg-hall.carved.webp";
import a2 from "./assets/board-frame.carved.webp";
import a4 from "./assets/crest-1.carved.webp";
import a6 from "./assets/crest-2.carved.webp";
import a8 from "./assets/crest-3.carved.webp";
import a10 from "./assets/emblem-riss.webp";
import a11 from "./assets/emblem.carved.webp";
import a13 from "./assets/ground-01.carved.webp";
import a15 from "./assets/ground-02.carved.webp";
import a17 from "./assets/ground-03.carved.webp";
import a19 from "./assets/ground-04.carved.webp";
import a21 from "./assets/ground-05.carved.webp";
import a23 from "./assets/ground-06.carved.webp";
import a25 from "./assets/ground-07.carved.webp";
import a27 from "./assets/ground-08.carved.webp";
import a29 from "./assets/ground-09.carved.webp";
import a31 from "./assets/ground-10.carved.webp";
import a33 from "./assets/ground-11.carved.webp";
import a35 from "./assets/ground-12.carved.webp";
import a37 from "./assets/intro-riss.webp";
import a38 from "./assets/liga-canyon.jpg";
import a39 from "./assets/liga-herbst.jpg";
import a40 from "./assets/liga-hochgebirge.jpg";
import a41 from "./assets/liga-meer.jpg";
import a42 from "./assets/liga-oedland.jpg";
import a43 from "./assets/liga-sommer.jpg";
import a44 from "./assets/liga-steppe.jpg";
import a45 from "./assets/liga-winter.jpg";
import a46 from "./assets/liga-wueste.jpg";
import a47 from "./assets/liga1.jpg";
import a48 from "./assets/logo-menu.carved.webp";
import a50 from "./assets/logo.carved.webp";
import a51 from "./assets/logo.jpg";
import a53 from "./assets/marble-btn.webp";
import a54 from "./assets/marble-d0.webp";
import a55 from "./assets/marble-d1.webp";
import a56 from "./assets/marble-d2.webp";
import a57 from "./assets/marble-d3.webp";
import a58 from "./assets/marble-d4.webp";
import a59 from "./assets/marble-d5.webp";
import a60 from "./assets/marble-g0.webp";
import a61 from "./assets/marble-g1.webp";
import a62 from "./assets/marble-g2.webp";
import a63 from "./assets/marble-g3.webp";
import a64 from "./assets/marble-g4.webp";
import a65 from "./assets/marble-g5.webp";
import a66 from "./assets/marble-l0.webp";
import a67 from "./assets/marble-l1.webp";
import a68 from "./assets/marble-l2.webp";
import a69 from "./assets/marble-l3.webp";
import a70 from "./assets/marble-l4.webp";
import a71 from "./assets/marble-l5.webp";
import a72 from "./assets/shield-league.carved.webp";
import a74 from "./assets/tex-wear-1.webp";
import a75 from "./assets/tex-wear-2.webp";
import a76 from "./assets/tex-wear-3.webp";
import a77 from "./assets/tex-wear-4.webp";
import a78 from "./assets/wanderer-boot.webp";
import a79 from "./assets/weltkarte.webp";
import a80 from "./assets/riss/riss-01.webp";
import a81 from "./assets/riss/riss-02.webp";
import a82 from "./assets/riss/riss-03.webp";
import a83 from "./assets/riss/riss-04.webp";
import a84 from "./assets/riss/riss-05.webp";
import a85 from "./assets/riss/riss-06.webp";
import a86 from "./assets/riss/riss-07.webp";
import a87 from "./assets/riss/riss-08.webp";
import a88 from "./assets/riss/riss-09.webp";
import a89 from "./assets/riss/riss-10.webp";
import a90 from "./assets/kap/kap-01.webp";
import a91 from "./assets/kap/kap-02.webp";
import a92 from "./assets/kap/kap-03.webp";
import a93 from "./assets/kap/kap-04.webp";
import a94 from "./assets/kap/kap-05.webp";
import a95 from "./assets/kap/kap-06.webp";
import a96 from "./assets/kap/kap-07.webp";
import a97 from "./assets/kap/kap-08.webp";
import a98 from "./assets/kap/kap-09.webp";
import a99 from "./assets/kap/kap-10.webp";
import a100 from "./assets/kap/kap-11.webp";
import a101 from "./assets/kap/kap-12.webp";
import a102 from "./assets/karten/karte-akademie.webp";
import a103 from "./assets/karten/karte-kampagne.webp";
import a104 from "./assets/karten/karte-online.webp";
import a105 from "./assets/karten/karte-schnell.webp";
import a106 from "./assets/items/item-anker.carved.webp";
import a108 from "./assets/items/item-bergschluessel.carved.webp";
import a110 from "./assets/items/item-boat.carved.webp";
import a112 from "./assets/items/item-brieftaube.carved.webp";
import a114 from "./assets/items/item-donnerpulver.carved.webp";
import a116 from "./assets/items/item-grapnel.carved.webp";
import a118 from "./assets/items/item-hourglass.carved.webp";
import a120 from "./assets/items/item-kamel.carved.webp";
import a122 from "./assets/items/item-kriegsaxt.carved.webp";
import a124 from "./assets/items/item-machete.carved.webp";
import a126 from "./assets/items/item-potion.carved.webp";
import a128 from "./assets/items/item-sternenkompass.carved.webp";
import a129 from "./assets/items/item-sternensplitter.carved.webp";
import a131 from "./assets/items/item-torch.carved.webp";
import a133 from "./assets/felder/feld-classic1.webp";
import a134 from "./assets/felder/feld-classic2.webp";
import a135 from "./assets/felder/feld-classic3.webp";
import a136 from "./assets/felder/feld-finale.webp";
import a137 from "./assets/felder/feld-k01.webp";
import a138 from "./assets/felder/feld-k02.webp";
import a139 from "./assets/felder/feld-k03.webp";
import a140 from "./assets/felder/feld-k04.webp";
import a141 from "./assets/felder/feld-k05.webp";
import a142 from "./assets/felder/feld-k06.webp";
import a143 from "./assets/felder/feld-k07.webp";
import a144 from "./assets/felder/feld-k08.webp";
import a145 from "./assets/felder/feld-k09.webp";
import a146 from "./assets/felder/feld-k10.webp";
import a147 from "./assets/felder/feld-k11.webp";
import a148 from "./assets/felder/feld-k12.webp";
import a149 from "./assets/ach/ach-bosses.carved.webp";
import a151 from "./assets/ach/ach-captures.carved.webp";
import a153 from "./assets/ach/ach-checkmates.carved.webp";
import a155 from "./assets/ach/ach-fast.carved.webp";
import a157 from "./assets/ach/ach-flawless.carved.webp";
import a159 from "./assets/ach/ach-games.carved.webp";
import a161 from "./assets/ach/ach-hpwins.carved.webp";
import a163 from "./assets/ach/ach-promotions.carved.webp";
import a165 from "./assets/ach/ach-recruits.carved.webp";
import a167 from "./assets/ach/ach-stages.carved.webp";
import a169 from "./assets/ach/ach-streak.carved.webp";
import a171 from "./assets/ach/ach-upgrades.carved.webp";
import a173 from "./assets/ach/ach-wins.carved.webp";
import a175 from "./assets/ach/ach-xp.carved.webp";
import a177 from "./assets/stat/orb-gold-energy.webp";
import a178 from "./assets/stat/orb-gold-life.webp";
import a179 from "./assets/stat/orb-gold-power.webp";
import a180 from "./assets/stat/orb-steel-energy.webp";
import a181 from "./assets/stat/orb-steel-life.webp";
import a182 from "./assets/stat/orb-steel-power.webp";
import a183 from "./assets/stat/strip-gold.webp";
import a184 from "./assets/stat/strip-steel.webp";
const WEITERE = [a0, a2, a4, a6, a8, a10, a11, a13, a15, a17, a19, a21, a23, a25, a27, a29, a31, a33, a35, a37, a38, a39, a40, a41, a42, a43, a44, a45, a46, a47, a48, a50, a51, a53, a54, a55, a56, a57, a58, a59, a60, a61, a62, a63, a64, a65, a66, a67, a68, a69, a70, a71, a72, a74, a75, a76, a77, a78, a79, a80, a81, a82, a83, a84, a85, a86, a87, a88, a89, a90, a91, a92, a93, a94, a95, a96, a97, a98, a99, a100, a101, a102, a103, a104, a105, a106, a108, a110, a112, a114, a116, a118, a120, a122, a124, a126, a128, a129, a131, a133, a134, a135, a136, a137, a138, a139, a140, a141, a142, a143, a144, a145, a146, a147, a148, a149, a151, a153, a155, a157, a159, a161, a163, a165, a167, a169, a171, a173, a175, a177, a178, a179, a180, a181, a182, a183, a184];

function alleQuellen() {
  const out = new Set();
  for (const u of alleGemaeldeQuellen()) out.add(u);
  /* v1.0.41: Der ZWEITSATZ wird nicht mehr vorgeladen. Er stand mit 114
     Dateien in der Startlast, obwohl das Spiel ihn seit dem Besitzerentscheid
     gar nicht mehr zeigt. */
  for (const u of klangAlleQuellen()) out.add(u);
  for (const u of WEITERE) if (typeof u === "string") out.add(u);
  return [...out];
}

/* Ein Lauf pro Seitenladung - StrictMode ruft Effekte doppelt, deshalb lebt
   der Zustand im Modul und beide Aufrufe teilen sich denselben Lauf. */
let lauf = null;
const lauscher = new Set();
const stand = { zahl: 0, gesamt: 0, fertig: false };
function melde() { for (const f of lauscher) f({ ...stand }); }

function starte() {
  if (lauf) return lauf;
  lauf = (async () => {
    const urls = alleQuellen();
    stand.gesamt = urls.length; melde();
    const deckel = new Promise((r) => setTimeout(r, 25000));   // Gesamtsicherung
    const einer = async (u) => {
      try {
        await Promise.race([
          fetch(u, { cache: "force-cache" }).then((r) => r.blob && r.blob()).catch(() => {}),
          new Promise((r) => setTimeout(r, 10000)),
        ]);
      } catch {}
      stand.zahl++; if (stand.zahl % 4 === 0 || stand.zahl === stand.gesamt) melde();
    };
    /* v1.0.36 (Besitzer: "ist bei der Leistung noch was zu holen?"): GEMESSEN.
       Der Vorlader holt rund 400 Dateien und brauchte dafuer ueber 20
       Sekunden - nicht wegen der Bandbreite (zusammen keine 900 KB), sondern
       wegen der Anzahl: bei acht Spuren sind das fuenfzig Runden, und jede
       Runde kostet ihren eigenen Aufschlag. Zwanzig Spuren teilen dieselbe
       Arbeit auf ein Viertel der Runden. Mehr waere unklug: Browser deckeln
       gleichzeitige Verbindungen je Gegenstelle ohnehin, und ein Telefon
       soll waehrend des Ladens noch fluessig zeichnen. */
    const arbeit = (async () => {
      let i = 0;
      const hand = async () => { while (i < urls.length) { const u = urls[i++]; await einer(u); } };
      await Promise.all([...Array(20)].map(hand));
    })();
    await Promise.race([arbeit, deckel]);
    stand.fertig = true; melde();
  })();
  return lauf;
}

const FUNKEN = [["-64px","-72px","2.6s","0s"],["70px","-58px","3.1s",".35s"],["-78px","44px","2.9s",".7s"],
  ["58px","76px","3.4s","1.05s"],["-30px","-90px","2.4s","1.4s"],["88px","12px","3.2s","1.75s"],
  ["-90px","-8px","2.8s","2.1s"],["22px","-92px","3.0s","2.45s"]];
const TANGENTEN = [["44px","-12px","1.1s","0s"],["34px","-24px","1.3s",".22s"],["56px","-3px","1.2s",".44s"],
  ["28px","-30px","1.45s",".66s"],["66px","-16px","1.6s",".88s"],["38px","6px","1.25s","1.1s"],["50px","-34px","1.7s","1.32s"]];

export default function Vorlader() {
  const [s, setS] = useState({ ...stand });
  const [weg, setWeg] = useState(false);
  useEffect(() => {
    const f = (n) => setS(n);
    lauscher.add(f); starte();
    return () => lauscher.delete(f);
  }, []);
  useEffect(() => {
    if (!s.fertig) return;
    const t = setTimeout(() => setWeg(true), 420);   // Zeit fuer das Ausblenden
    return () => clearTimeout(t);
  }, [s.fertig]);
  if (weg) return null;
  const anteil = s.gesamt ? Math.min(1, s.zahl / s.gesamt) : 0;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#000",
      display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
      fontFamily: "Georgia, serif", color: "#f2d98c", padding: 24,
      opacity: s.fertig ? 0 : 1, transition: "opacity .38s ease",
      pointerEvents: s.fertig ? "none" : "auto" }}>
      <div>
        <div style={{ position: "relative", width: "min(58vw, 208px)", height: "min(58vw, 208px)", margin: "0 auto 26px" }}>
          {FUNKEN.map(([dx, dy, d, t], i) => (
            <div key={i} className="gg-funke" style={{ "--dx": dx, "--dy": dy, "--d": d, "--t": t }} />
          ))}
          <div style={{ position: "absolute", inset: "3%", animation: "ggBootKreis 1.5s linear infinite",
            willChange: "transform", transform: "translateZ(0)" }}>
            <div style={{ position: "absolute", left: "50%", top: 0, width: 9, height: 9, marginLeft: -4.5, borderRadius: "50%",
              background: "radial-gradient(circle,#efe8ff 0%,#a78bfa 45%,transparent 75%)",
              boxShadow: "0 0 9px 3px rgba(139,92,246,.9),0 0 20px 7px rgba(124,58,237,.4)" }} />
            <div style={{ position: "absolute", left: "50%", top: 1.5, width: 34, height: 5, marginLeft: -34, borderRadius: 99,
              background: "linear-gradient(90deg,transparent 0%,rgba(124,58,237,.28) 45%,rgba(196,181,253,.9) 100%)",
              filter: "blur(1.2px)" }} />
            {TANGENTEN.map(([tx, ty, d, t], i) => (
              <div key={i} className="gg-funke" style={{ left: "50%", top: 2, "--tx": tx, "--ty": ty,
                animation: `ggBootTangente ${d} ease-out ${t} infinite` }} />
            ))}
          </div>
          <img src="./icons/boot-riss.webp" alt="Grand Gambit" width={208} height={208}
            style={{ position: "relative", width: "100%", height: "100%", display: "block",
              animation: "ggBootAtem 3.2s ease-in-out infinite",
              filter: "drop-shadow(0 0 24px rgba(139,92,246,.6))", willChange: "transform" }} />
        </div>
        <div style={{ fontSize: "clamp(17px,4.6vw,23px)", letterSpacing: ".26em", animation: "ggBootWort 1.1s ease-out both" }}>
          GRAND GAMBIT</div>
        <div style={{ width: "min(60vw, 220px)", height: 3, margin: "18px auto 0", borderRadius: 99,
          background: "rgba(242,217,140,.14)", overflow: "hidden" }}>
          <div style={{ width: `${Math.round(anteil * 100)}%`, height: "100%", borderRadius: 99,
            background: "linear-gradient(90deg,#c9a45c,#f2d98c)", transition: "width .25s ease" }} />
        </div>
        <div style={{ fontSize: 13, color: "#8b7fb0", marginTop: 11, maxWidth: 420, lineHeight: 1.5 }}>
          {s.fertig ? "Der Riss ist offen." : `Der Riss \u00f6ffnet sich \u2026 ${s.zahl} / ${s.gesamt || "?"}`}</div>
      </div>
    </div>
  );
}
