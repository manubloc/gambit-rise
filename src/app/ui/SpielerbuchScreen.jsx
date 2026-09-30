// ── DAS SPIELERBUCH ─────────────────────────────────────────────────────────
// Besitzer-Wunsch (v0.73): "eine Liste aller angemeldeten User, deren
// Fortschritt und ein paar Statistiken - gerne auch grob, woher die Leute
// kommen." Die Halle fuehrt das Buch; diese Seite liest es mit dem Admin-Wort.
//
// DATENSPARSAM: Land, Region und Stadt kommen von Cloudflares Kantennetz,
// die IP wird NIE im Klartext gespeichert - nur ein kurzer, nicht
// rueckrechenbarer Fingerabdruck, mit dem sich Geraete zaehlen lassen.
import { useState, useEffect } from "react";
import { T } from "./theme.js";
import { SERVER_URL } from "../config.js";
import { getAdminToken, setAdminToken } from "../../meta/index.js";
import { ZeitBalken } from "./ZeitBalken.jsx";

export function SpielerbuchScreen() {
  /* v1.0.3 (Besitzerwunsch): EIN Admin-Wort fuer alles. Spielerbuch und
     Fehlerberichte teilen jetzt denselben Speicher (gg_admin_token, ueber
     src/meta/reports.js) - wer es einmal eingibt, sieht beides. Ist eines
     gespeichert und die Halle nimmt es an, klappt die Eingabe zu einer
     Zeile zusammen. */
  const [token, setToken] = useState(() => getAdminToken());
  const [wortOffen, setWortOffen] = useState(() => !getAdminToken());
  const [buch, setBuch] = useState(null);
  const [fehler, setFehler] = useState(null);
  const [laedt, setLaedt] = useState(false);
  const [suche, setSuche] = useState("");

  async function holen(t = token) {
    if (!t) { setFehler("Ohne Admin-Wort bleibt das Buch zu."); return; }
    setLaedt(true); setFehler(null);
    try {
      /* v1.90.18 (A56): das Admin-Wort im Kopf, nicht in der Adresse */
      const r = await fetch(`${SERVER_URL.replace(/^ws/, "http").replace(/\/ws$/, "")}/spielerbuch`, { headers: { authorization: "Bearer " + t } });
      if (r.status === 401) throw new Error("Die Halle lehnt ab — falsches Admin-Wort.");
      if (!r.ok) throw new Error(`Die Halle antwortet mit ${r.status}.`);
      const d = await r.json();
      setBuch(d);
      setAdminToken(t); setWortOffen(false);
    } catch (e) {
      setFehler(e.message || "Die Halle schweigt — ist der Worker deployt?");
      if (/Admin-Wort/.test(String(e.message))) setWortOffen(true);
      setBuch(null);
    } finally { setLaedt(false); }
  }
  useEffect(() => { if (token) holen(token); }, []); // eslint-disable-line

  const datum = (ms) => {
    if (!ms) return "—";
    const d = Math.floor((Date.now() - ms) / 60000);
    if (d < 1) return "gerade eben";
    if (d < 60) return `vor ${d} min`;
    if (d < 1440) return `vor ${Math.floor(d / 60)} h`;
    return `vor ${Math.floor(d / 1440)} Tagen`;
  };
  const karte = { border: `1px solid ${T.line}`, borderRadius: 12, background: T.panel, padding: "10px 12px" };
  const liste = (buch?.spieler || []).filter((s) => {
    const q = suche.trim().toLowerCase();
    if (!q) return true;
    return [s.name, s.id, s.land, s.stadt].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
  });

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, padding: "18px 14px 40px", maxWidth: 900, margin: "0 auto" }}>
      <div className="gg-serif" style={{ fontSize: 22, color: T.goldBright, letterSpacing: ".05em" }}>Das Spielerbuch</div>
      <div style={{ fontSize: 12, color: T.dim, marginBottom: 12 }}>
        Wer spielt, wie weit ist er, woher kommt er. Die Halle fuehrt das Buch — diese Seite liest nur mit.
      </div>

      {!wortOffen && token ? (
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14, fontSize: 12, color: T.dim }}>
          <span style={{ color: "#7fd6a0" }}>✓</span> Admin-Wort gespeichert — es gilt hier und bei den Fehlerberichten.
          <button onClick={() => setWortOffen(true)} style={{ background: "none", border: "none", color: T.goldBright,
            cursor: "pointer", fontFamily: "inherit", fontSize: 12, padding: 0, textDecoration: "underline" }}>ändern</button>
          {laedt && <span style={{ color: T.faint }}>Die Halle antwortet …</span>}
        </div>
      ) : (
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Admin-Wort"
          style={{ flex: "1 1 200px", minWidth: 0, padding: "9px 12px", borderRadius: 10, fontFamily: "inherit",
            border: `1px solid ${T.line}`, background: "#0d1017", color: T.text, fontSize: 13 }} />
        <button onClick={() => holen()} disabled={laedt}
          style={{ padding: "9px 16px", borderRadius: 10, fontFamily: "inherit", fontWeight: 800, fontSize: 13,
            cursor: laedt ? "default" : "pointer", border: `1px solid ${T.selLine}`, color: T.selInk,
            background: `linear-gradient(165deg, ${T.sel}, #1a1030)` }}>
          {laedt ? "Die Halle antwortet …" : "Buch öffnen"}</button>
      </div>
      )}
      {fehler && <div style={{ ...karte, borderColor: "#a4463f", color: "#e8b7b2", fontSize: 12.5, marginBottom: 12 }}>{fehler}</div>}

      {buch && (<>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(128px, 1fr))", gap: 8, marginBottom: 14 }}>
          {[["Spieler", buch.zahlen.spieler], ["Gerade online", buch.zahlen.online],
            ["Aktiv (24 h)", buch.zahlen.aktiv24h], ["Aktiv (7 Tage)", buch.zahlen.aktiv7t],
            ["Mit Fortschritt", buch.zahlen.mitFortschritt], ["Kapitel im Schnitt", buch.zahlen.kapitelSchnitt ?? "—"],
            ["Partien gesamt", buch.zahlen.partienGesamt]].map(([n, v]) => (
            <div key={n} style={karte}>
              <div style={{ fontSize: 20, fontWeight: 900, color: T.goldBright, lineHeight: 1.1 }}>{v}</div>
              <div style={{ fontSize: 10.5, color: T.dim, letterSpacing: ".04em", textTransform: "uppercase" }}>{n}</div>
            </div>
          ))}
        </div>

        {/* v1.0.3: DIE KURVEN. Beitritte je Woche (aus dem festgehaltenen
            Beitrittsdatum; Konten von vor diesem Worker-Stand tragen keins
            und werden ehrlich gesondert gezaehlt) und Aktivitaet je Tag
            (wann Spieler zuletzt da waren - eine Naeherung, kein Verlauf). */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8, marginBottom: 14 }}>
          <div style={karte}>
            <ZeitBalken titel="Beitritte je Woche (12 Wochen)" farbe="#7fd6a0" wochen tage={84}
              zeiten={(buch.spieler || []).map((x) => x.beigetreten).filter(Boolean)}
              leerText={(buch.spieler || []).some((x) => x.beigetreten)
                ? "keine Beitritte im Zeitraum"
                : "Der Worker liefert noch keine Beitrittsdaten — nach dem nächsten Worker-Deploy füllt sich diese Kurve."} />
            {(() => { const ohne = (buch.spieler || []).filter((x) => !x.beigetreten).length;
              return ohne ? <div style={{ fontSize: 10.5, color: T.faint, marginTop: 4 }}>{ohne} ältere Konten ohne Beitrittsdatum</div> : null; })()}
          </div>
          <div style={karte}>
            <ZeitBalken titel="Zuletzt gesehen je Tag (30 Tage)" farbe="#a78bfa" tage={30}
              zeiten={(buch.spieler || []).map((x) => x.zuletzt).filter(Boolean)} />
          </div>
        </div>

        {Object.keys(buch.zahlen.laender || {}).length > 0 && (
          <div style={{ ...karte, marginBottom: 14 }}>
            <div className="gg-serif" style={{ fontSize: 13, color: T.goldBright, marginBottom: 6 }}>Woher sie kommen</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {Object.entries(buch.zahlen.laender).sort((a, b) => b[1] - a[1]).map(([l, n]) => (
                <span key={l} style={{ fontSize: 11.5, fontWeight: 800, padding: "3px 9px", borderRadius: 999,
                  border: `1px solid ${T.selLine}44`, color: T.text, background: T.sel }}>{l} · {n}</span>
              ))}
            </div>
          </div>
        )}

        <input value={suche} onChange={(e) => setSuche(e.target.value)} placeholder="Suchen: Name, Kennung, Land, Stadt"
          style={{ width: "100%", padding: "8px 12px", borderRadius: 10, fontFamily: "inherit", marginBottom: 8,
            border: `1px solid ${T.line}`, background: "#0d1017", color: T.text, fontSize: 12.5 }} />

        <div style={{ overflowX: "auto", ...karte, padding: 0 }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
            <thead>
              <tr style={{ color: T.dim, textAlign: "left" }}>
                {["Name", "Zuletzt", "Kapitel", "Gold", "Partien", "Siege", "Punkte", "Herkunft", "Gerät"].map((h) => (
                  <th key={h} style={{ padding: "8px 10px", borderBottom: `1px solid ${T.line}`, whiteSpace: "nowrap",
                    fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", fontSize: 10 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {liste.map((s) => (
                <tr key={s.id}>
                  <td style={{ padding: "7px 10px", borderBottom: `1px solid ${T.line}55`, whiteSpace: "nowrap" }}>
                    <span style={{ color: s.online ? "#a78bfa" : T.text, fontWeight: 700 }}>{s.online ? "● " : ""}{s.name}</span>
                    <span style={{ color: T.faint, fontSize: 10.5 }}> · {String(s.id).slice(0, 8)}</span>
                  </td>
                  <td style={{ padding: "7px 10px", borderBottom: `1px solid ${T.line}55`, color: T.dim, whiteSpace: "nowrap" }}>{datum(s.zuletzt)}</td>
                  <td style={{ padding: "7px 10px", borderBottom: `1px solid ${T.line}55`, color: T.goldBright, fontWeight: 800 }}>{s.kapitel ?? "—"}</td>
                  <td style={{ padding: "7px 10px", borderBottom: `1px solid ${T.line}55` }}>{s.gold ?? "—"}</td>
                  <td style={{ padding: "7px 10px", borderBottom: `1px solid ${T.line}55` }}>{s.partien ?? "—"}</td>
                  <td style={{ padding: "7px 10px", borderBottom: `1px solid ${T.line}55` }}>{s.siege ?? "—"}</td>
                  <td style={{ padding: "7px 10px", borderBottom: `1px solid ${T.line}55` }}>{s.punkte}</td>
                  <td style={{ padding: "7px 10px", borderBottom: `1px solid ${T.line}55`, color: T.dim, whiteSpace: "nowrap" }}>
                    {[s.land, s.region, s.stadt].filter(Boolean).join(" · ") || "—"}</td>
                  <td style={{ padding: "7px 10px", borderBottom: `1px solid ${T.line}55`, color: T.faint, fontFamily: "monospace", fontSize: 10.5 }}>{s.geraet || "—"}</td>
                </tr>
              ))}
              {liste.length === 0 && (
                <tr><td colSpan={9} style={{ padding: "14px 10px", color: T.dim, fontSize: 12 }}>
                  Noch kein Eintrag — Spieler erscheinen hier, sobald sie sich in der Halle gemeldet haben.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ fontSize: 11, color: T.faint, marginTop: 12, lineHeight: 1.6 }}>
          Merkzettel zum Datenschutz: Land, Region und Stadt liefert Cloudflares Kantennetz, die IP-Adresse wird
          NIE im Klartext gespeichert — die Spalte „Gerät" zeigt nur einen kurzen Fingerabdruck. Wenn du das Spiel
          öffentlich betreibst, gehört dieser Umstand in deine Datenschutzerklärung (Zweck, Speicherdauer,
          Auskunfts- und Löschrecht).
        </div>
      </>)}
      <div style={{ marginTop: 18 }}>
        <a href="?admin" style={{ color: T.goldBright, fontSize: 12.5 }}>Zurück ins Admin-Portal</a>
      </div>
    </div>
  );
}
