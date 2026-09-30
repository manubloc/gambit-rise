/* ── DIE ZWEITE FEHLERGRENZE (v1.90.18, Audit A45) ───────────────────────────
   Bis v1.90.17 gab es EINE Fehlergrenze, ganz aussen in main.jsx. Jeder
   Fehler beim Zeichnen eines einzelnen Schirms ersetzte damit das ganze Haus
   durch die Absturzkarte, und ihr einziger Ausweg war "Neu laden" - Reiter,
   Karte und ein ungesicherter Pausenstand waren fort. Mit A3/A4 (je ein
   ReferenceError im Siegesbanner und im Rueckblick) war genau das live.

   Diese Grenze sitzt um den SCHIRM (das <main> der App). Faellt ein Schirm,
   bleiben Kopfleiste und Reiter stehen, und die Karte bietet "Zurueck ins
   Hauptmenue" an: die App setzt Partie, Ansicht und Reiter zurueck, die
   Grenze vergisst den Fehler. Wechselt man selbst den Schirm (Reiter), gilt
   dasselbe - `schluessel` beschreibt, welcher Schirm gerade steht.

   Der Fehler landet wie bei der aeusseren Grenze im Geraete-Protokoll
   (gg_errlog, dasselbe Format) und als Bericht in der schwarzen Kiste. */
import { Component } from "react";

const ERRLOG = "gg_errlog";
function protokolliere(err) {
  try {
    const list = JSON.parse(localStorage.getItem(ERRLOG) || "[]");
    list.push({ t: new Date().toISOString(), kind: "schirm", msg: String(err?.message || err).slice(0, 300),
      stack: String(err?.stack || "").slice(0, 600), ua: navigator.userAgent.slice(0, 160),
      ver: (typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "?"), url: location.pathname });
    localStorage.setItem(ERRLOG, JSON.stringify(list.slice(-25)));
  } catch {}
}

export class SchirmGrenze extends Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err) {
    protokolliere(err);
    import("../../meta/index.js").then((m) => m.fileReport({ err })).catch(() => {});
  }
  componentDidUpdate(vorher) {
    if (this.state.err && vorher.schluessel !== this.props.schluessel) this.setState({ err: null });
  }
  render() {
    if (!this.state.err) return this.props.children;
    const en = !!this.props.en;
    const knopf = { fontFamily: "inherit", fontWeight: 700, fontSize: 14, padding: "11px 18px", borderRadius: 12,
      border: "1px solid #c9a45c", background: "rgba(201,164,92,.14)", color: "#f0e2bf", cursor: "pointer" };
    const leise = { ...knopf, border: "1px solid #3a4258", background: "transparent", color: "#aab2c8", fontSize: 13 };
    return (
      <div data-schirm-grenze="1" role="alert" style={{ display: "grid", placeItems: "center", padding: "40px 20px", textAlign: "center" }}>
        <div style={{ maxWidth: 360, display: "grid", gap: 12 }}>
          <div style={{ fontSize: 17, color: "#e8e4d8" }}>
            {en ? "This screen ran into an error." : "Dieser Schirm ist gestolpert."}</div>
          <div style={{ fontSize: 13, color: "#8b90a3", lineHeight: 1.5 }}>
            {en ? "Your progress is safe. The error has been noted."
              : "Dein Spielstand ist sicher. Der Fehler ist notiert."}</div>
          <button type="button" style={knopf} onClick={() => { this.setState({ err: null }); try { this.props.onReset?.(); } catch {} }}>
            {en ? "Back to the main menu" : "Zurück ins Hauptmenü"}</button>
          <button type="button" style={leise} onClick={() => { try { location.reload(); } catch {} }}>
            {en ? "Reload" : "Neu laden"}</button>
        </div>
      </div>
    );
  }
}
