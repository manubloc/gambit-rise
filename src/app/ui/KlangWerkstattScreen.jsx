// ── DIE KLANGWERKSTATT ──────────────────────────────────────────────────────
// Besitzer-Tool (?klangwerkstatt, verlinkt in der Verwaltung): JEDER Klang des
// Spiels zum Anhoeren - und zwar exakt so, wie er spaeter klingt, denn die
// Knoepfe rufen dieselbe klang()-Schicht mit denselben Pegeln und derselben
// Tonhoehenstreuung (+-4 %) wie das Spiel. Mehrfach tippen lohnt sich darum:
// Varianten und Streuung wechseln von selbst.
//
// Der Regler oben spiegelt den Effekt-Regler des Profils NICHT - er ist eine
// reine Abhoerhilfe und fasst das Profil nicht an.
import { useEffect, useRef, useState } from "react";
import { klang, klangEinstellen, klangVorwaermen } from "./klang.js";
import { T } from "./theme.js";
/* v0.89: die Werkstatt zeigt jetzt JEDES Stueck, das je erzeugt wurde -
   nicht nur die fuenf eingebauten. Der Besitzer sucht die Fassung, die ihm
   am besten gefaellt, und die frueheren waren im Spiel nicht mehr zu
   erreichen. Das Archiv wird NICHT eingebunden (26 MB), sondern beim Bau
   neben das Spiel gelegt; die Liste kommt zur Laufzeit. */
const ARCHIV = "./klangarchiv/verzeichnis.json";


// Reihenfolge und Woerter der Werkbank: erst das Brett (das man tausendmal
// hoert), dann Sonderzuege, Talente, Auftritte, Feier, zuletzt Menue+Karte.
const GRUPPEN = [
  ["Das Brett", [
    ["wahl", "Figur anwählen", "kurzer Holzgriff beim Aufnehmen"],
    ["zug", "Ziehen (3 Varianten)", "die Figur schleift über die Holzplatte"],
    ["treffer", "Treffer (2 Varianten)", "Holz auf Holz, dumpf — Ziel überlebt"],
    ["fall", "Sturz (2 Varianten)", "die Figur kippt und bleibt liegen"],
    ["nein", "Gesperrt", "gedämpfter Stopp — dieser Zug geht nicht"],
    ["schach", "Schach!", "tiefe Saite, ferne Glocke"],
  ]],
  ["Sonderzüge", [
    ["rochade", "Rochade", "zwei Figuren setzen nacheinander auf"],
    ["kroenung", "Bauernumwandlung", "wachsender Schimmer, würdevoll"],
    ["pfeil", "Fernangriff (2 Varianten)", "Sehne, Flug, hölzerner Einschlag"],
    ["drachenflug", "Drachenflug", "schwere Schwingen, wuchtige Landung"],
  ]],
  ["Talente & Vorräte", [
    ["talentGold", "Talent des Hofes", "goldener Schimmer über Holz"],
    ["sturmschritt", "Sturmschritt", "rasches Schleifen nach vorn"],
    ["trank", "Lebenstrank", "Korken, Schluck, warmes Glimmen"],
    ["zeitenwender", "Zeitenwender", "Sand rieselt rückwärts"],
    ["zeitriss", "Zeitriss spannen", "Ladung baut sich auf und schnappt"],
    ["rissBlitz", "Riss-Blitz", "violette Entladung, kristallener Schweif"],
  ]],
  /* v1.0.73: die Klaenge zu den Animationen aus v1.0.67-70. Eigene Gruppe,
     weil sie zusammen entstanden sind und zusammen beurteilt werden wollen -
     die vier Schlagarten hoert man am besten direkt hintereinander. */
  ["Schlagarten & Animationen", [
    ["stoss", "Schlagart: Stoß", "Schild schiebt — Bauer, Wache, Hauptmann"],
    ["klinge", "Schlagart: Klinge", "heller Schlitz — Springer, Läufer, Assassine"],
    ["wucht", "Schlagart: Wucht", "Rammstoß mit Beben — Turm, Golem"],
    ["bann", "Schlagart: Bann", "aufsteigendes Licht — Dame, König, Erzbischof"],
    ["drachenfeuer", "Drachenfeuer", "Feuerzunge beim Fernstoß des Drachen"],
    ["koenigsfall", "Königsfall (Matt)", "schweres Holz kippt und schlägt auf"],
    ["muenzregen", "Münzregen", "Gold fällt ins Siegesbanner"],
    ["glanz", "Verbessern-Glanz", "goldener Schimmer über dem Porträt"],
    ["faehigkeit", "Fähigkeit erwacht", "violetter Kristallschimmer"],
    ["sperrsetzen", "Sperre setzen", "Stein wird satt aufgesetzt"],
    ["zerfall", "Sperre zerfällt", "trockenes Bröckeln, Schutt löst sich"],
  ]],
  ["Auftritte & Feier", [
    ["bestie", "Bestie erscheint", "Stein öffnet sich, kalter Atem"],
    ["meister", "Meister betritt das Feld", "tiefe Glocke, dunkler Chor"],
    ["sieg", "Sieg", "warmer Akkord mit Gong, edel"],
    ["niederlage", "Niederlage", "fallende Saiten, still endend"],
    ["stufe", "Stufenaufstieg", "drei steigende Schläge auf Gold"],
    ["frei", "Fähigkeit freigeschaltet", "Steinschloss dreht sich, Schimmer"],
    ["werbung", "Held rekrutiert", "Figur setzt auf, ferner Hornruf"],
    ["kapitelEnde", "Kapitel abgeschlossen", "Kirchenglocke, Blatt wendet sich"],
    ["gold", "Gold / Kauf", "Münzen fallen in den Lederbeutel"],
  ]],
  ["Menü & Karte (bewusst leise)", [
    ["menue", "Menü-Tipp", "der leiseste Klang im Haus"],
    ["blattAuf", "Blatt öffnen", "Pergament wird aufgeschlagen"],
    ["blattZu", "Blatt schließen", "Pergament wird abgelegt"],
    ["karteStation", "Station antippen", "hölzerne Marke drückt in die Karte"],
    ["karteFrei", "Station freigeschaltet", "Schimmer läuft übers Pergament"],
    ["kapitel", "Neues Kapitel", "die Karte rollt sich auf, ferner Hornruf"],
    ["karteSchritt", "Gambit rückt vor", "Holz rutscht über Stein"],
  ]],
];

export function KlangWerkstattScreen() {
  const [staerke, setStaerke] = useState(0.6);
  const [zuletzt, setZuletzt] = useState(null);
  /* Die Musikabteilung: EIN Spieler, damit nie zwei Stuecke uebereinander
     laufen. Erneutes Tippen auf dasselbe Stueck haelt an. */
  const spieler = useRef(null);
  const [laeuft, setLaeuft] = useState(null);
  const [stuecke, setStuecke] = useState([]);
  useEffect(() => {
    let lebt = true;
    fetch(ARCHIV).then((r) => r.json()).then((l) => lebt && setStuecke(l)).catch(() => {});
    return () => { lebt = false; };
  }, []);
  useEffect(() => {
    const a = new Audio(); a.loop = true; a.volume = 0.5;
    spieler.current = a;
    return () => { a.pause(); a.src = ""; spieler.current = null; };
  }, []);
  useEffect(() => { if (spieler.current) spieler.current.volume = staerke * 0.85; }, [staerke]);
  const musik = (datei) => {
    const a = spieler.current; if (!a) return;
    if (laeuft === datei) { a.pause(); setLaeuft(null); return; }
    a.src = "./klangarchiv/" + datei; a.volume = staerke * 0.85;
    a.play().then(() => setLaeuft(datei)).catch(() => setLaeuft(null));
  };
  const gruppen = [];
  for (const e of stuecke) if (!gruppen.includes(e.gruppe)) gruppen.push(e.gruppe);
  const spiele = (art) => {
    klangEinstellen({ ein: true, lautstaerke: staerke });
    klang(art);
    setZuletzt(art);
  };
  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(120% 90% at 50% -10%, ${T.bg2} 0%, #0a0812 70%)`,
      color: "#e8e2cf", fontFamily: "system-ui, sans-serif", padding: "18px 14px 60px" }}>
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        <div className="gg-serif" style={{ fontSize: 22, color: T.goldBright, letterSpacing: ".05em" }}>Die Klangwerkstatt</div>
        <div style={{ fontSize: 12.5, color: T.dim, marginTop: 4, lineHeight: 1.5 }}>
          Jeder Knopf ruft dieselbe Klangschicht wie das Spiel — gleiche Pegel, gleiche
          Tonhöhenstreuung. Mehrfach tippen wechselt die Varianten. Der Regler hier ist
          nur fürs Abhören und ändert das Profil nicht.
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0 4px" }}>
          <span className="gg-serif" style={{ fontSize: 12, letterSpacing: ".1em", color: T.dim }}>ABHÖRPEGEL</span>
          <input type="range" min="0" max="1" step="0.05" value={staerke}
            onChange={(e) => { const v = Number(e.target.value); setStaerke(v); klangEinstellen({ ein: true, lautstaerke: v }); }}
            style={{ flex: 1, accentColor: T.gold }} />
          <span style={{ fontSize: 12, width: 34, textAlign: "right", color: T.goldBright }}>{Math.round(staerke * 100)}%</span>
          <button onClick={() => klangVorwaermen()} style={{ fontFamily: "inherit", fontSize: 11.5, cursor: "pointer",
            background: "none", border: `1px solid ${T.line}`, borderRadius: 8, color: T.dim, padding: "5px 9px" }}>
            Vorwärmen</button>
        </div>
        {GRUPPEN.map(([titel, reihe]) => (
          <div key={titel} style={{ marginTop: 18 }}>
            <div className="gg-serif" style={{ fontSize: 12.5, letterSpacing: ".14em", textTransform: "uppercase",
              color: T.goldBright, marginBottom: 8 }}>{titel}</div>
            <div style={{ display: "grid", gap: 7 }}>
              {reihe.map(([art, name, was]) => (
                <button key={art} onClick={() => spiele(art)}
                  style={{ display: "flex", alignItems: "center", gap: 11, textAlign: "left", cursor: "pointer",
                    fontFamily: "inherit", color: "inherit", width: "100%",
                    background: zuletzt === art
                      ? "linear-gradient(165deg, rgba(240,206,122,.14), rgba(20,14,34,.6))"
                      : "linear-gradient(165deg, rgba(30,22,52,.55), rgba(14,10,24,.6))",
                    border: `1px solid ${zuletzt === art ? T.gold + "aa" : "rgba(167,139,250,.28)"}`,
                    borderRadius: 12, padding: "10px 12px" }}>
                  <span aria-hidden style={{ flex: "0 0 auto", width: 30, height: 30, display: "grid", placeItems: "center",
                    borderRadius: 999, border: `1.5px solid ${T.gold}88`, color: T.goldBright, fontSize: 13 }}>▶</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 13.5, fontWeight: 800, color: "#efe7c8" }}>{name}</span>
                    <span className="gg-serif" style={{ display: "block", fontSize: 11.5, color: T.dim, fontStyle: "italic", marginTop: 2 }}>{was}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
        <div style={{ marginTop: 24 }}>
          <div className="gg-serif" style={{ fontSize: 12.5, letterSpacing: ".14em", textTransform: "uppercase",
            color: T.goldBright, marginBottom: 8 }}>Das Musikarchiv</div>
          <div className="gg-serif" style={{ fontSize: 11.5, color: T.dim, fontStyle: "italic", marginBottom: 11 }}>
            {stuecke.length ? `${stuecke.length} Stücke — jede Fassung, die je entstanden ist. Erneut tippen hält an.`
              : "Wird geladen …"}
          </div>
          {gruppen.map((g) => (
            <div key={g} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase",
                color: T.dim, margin: "0 2px 6px" }}>{g}</div>
              <div style={{ display: "grid", gap: 6 }}>
                {stuecke.filter((e) => e.gruppe === g).map((e) => (
                  <button key={e.datei} onClick={() => musik(e.datei)}
                    style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left", cursor: "pointer",
                      fontFamily: "inherit", color: "inherit", width: "100%",
                      background: laeuft === e.datei
                        ? "linear-gradient(165deg, rgba(240,206,122,.16), rgba(20,14,34,.6))"
                        : "linear-gradient(165deg, rgba(30,22,52,.55), rgba(14,10,24,.6))",
                      border: `1px solid ${laeuft === e.datei ? T.gold + "aa" : "rgba(167,139,250,.28)"}`,
                      borderRadius: 11, padding: "9px 11px" }}>
                    <span aria-hidden style={{ flex: "0 0 auto", width: 27, height: 27, display: "grid",
                      placeItems: "center", borderRadius: 999, border: `1.5px solid ${T.gold}88`,
                      color: T.goldBright, fontSize: 12 }}>{laeuft === e.datei ? "❚❚" : "▶"}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#efe7c8" }}>{e.titel}</span>
                      <span className="gg-serif" style={{ display: "block", fontSize: 11, color: T.dim,
                        fontStyle: "italic", marginTop: 1 }}>{e.bemerkung}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <a href="/" style={{ display: "inline-block", marginTop: 22, fontSize: 12.5, color: T.dim }}>‹ Zurück ins Spiel</a>
      </div>
    </div>
  );
}
