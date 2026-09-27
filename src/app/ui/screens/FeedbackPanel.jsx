// ── FEEDBACK & FEHLER MELDEN ────────────────────────────────────────────────
// v1.0.3 (Besitzerwunsch): "als Nutzer die Moeglichkeit, unter Profil
// Feedback zu geben - mit Screenshots, Text und groben Rubriken." Die Meldung
// faehrt denselben Weg wie die automatischen Absturzberichte (fileReport →
// Halle), traegt aber eine RUBRIK und bis zu zwei BILDER. So liest der Admin
// alles an einem Ort, und kein zweiter Kanal will gepflegt werden.
//
// BILDER WERDEN VOR DEM SENDEN KLEINGERECHNET: laengste Kante 900 px, WebP
// (Rueckfall JPEG), Qualitaet 0,62. Ein Telefon-Screenshot hat 3-4 MB - so
// werden daraus ~60-150 KB, und der Bericht bleibt eine einzige kleine
// Anfrage statt eines Uploads, der im Funkloch stirbt.
import { useState } from "react";
import { T } from "../theme.js";
import { Button } from "../primitives.jsx";
import { fileReport } from "../../../meta/index.js";

/* v1.89.0 (Besitzer: "bei Feedback oder Fehler melden die Rubriken ein
   bisschen reduzieren, dass es nicht ganz so viele gibt"): vier statt sieben.
   Balance, Darstellung und Online gehen in "Fehler im Spiel" bzw. "Vorschlag"
   auf; alte Berichte mit den alten Schluesseln bleiben lesbar (RUBRIKEN_ALT). */
export const RUBRIKEN = [
  ["absturz",     "Absturz / hängt",   "Crash / freeze"],
  ["fehler",      "Fehler im Spiel",   "Bug in the game"],
  ["vorschlag",   "Vorschlag / Idee",  "Suggestion / idea"],
  ["sonstiges",   "Sonstiges",         "Other"],
];
const RUBRIKEN_ALT = [
  ["balance",     "Schwierigkeit & Balance","Difficulty & balance"],
  ["darstellung", "Darstellung & Grafik",   "Visuals & layout"],
  ["online",      "Online & Halle",         "Online & Hall"],
];
export const rubrikWort = (schluessel, en) => {
  const r = RUBRIKEN.find((x) => x[0] === schluessel) || RUBRIKEN_ALT.find((x) => x[0] === schluessel);
  return r ? (en ? r[2] : r[1]) : schluessel;
};

/** Eine Bilddatei auf hoechstens `kante` px verkleinern → DataURL. */
async function verkleinere(datei, kante = 900) {
  const url = URL.createObjectURL(datei);
  try {
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i); i.onerror = rej; i.src = url;
    });
    const f = Math.min(1, kante / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(img.naturalWidth * f));
    c.height = Math.max(1, Math.round(img.naturalHeight * f));
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    let d = c.toDataURL("image/webp", 0.62);
    if (!d.startsWith("data:image/webp")) d = c.toDataURL("image/jpeg", 0.7);
    return d;
  } finally { URL.revokeObjectURL(url); }
}

export function FeedbackPanel({ t, en, account }) {
  const [rubrik, setRubrik] = useState("fehler");
  const [text, setText] = useState("");
  const [bilder, setBilder] = useState([]);   // DataURLs
  const [stand, setStand] = useState(null);   // null | "sendet" | "hall" | "local" | "leer"

  const nimmBilder = async (e) => {
    const dateien = [...(e.target.files || [])];
    e.target.value = "";                       // dieselbe Datei darf erneut gewaehlt werden
    for (const d of dateien) {
      if (bilder.length + 1 > 2) break;
      try { const b = await verkleinere(d); setBilder((v) => (v.length < 2 ? [...v, b] : v)); }
      catch { /* ein unlesbares Bild bricht die Meldung nicht */ }
    }
  };

  const senden = async () => {
    if (!text.trim() && !bilder.length) { setStand("leer"); return; }
    setStand("sendet");
    /* v1.0.4: NIE die E-Mail. Der Bericht traegt die Kontokennung - damit
       laesst sich im Spielerbuch nachschlagen, wer geschrieben hat, ohne
       die Adresse durch die Halle zu schicken. */
    const konto = account?.id ? "Konto " + account.id : null;
    const r = await fileReport({ note: text.trim(), rubrik, bilder, account: konto });
    setStand(r.where);                         // "hall" oder "local" - ehrlich benannt
    if (r.where === "hall") { setText(""); setBilder([]); }
  };

  /* v1.89.0 (Besitzer: "die Farbgebung von Feedback finde ich nicht so
     treffend wie 'Du spielst als Gast' - mach da lieber dieses Weiss/Lila"):
     die Rubriken tragen die Farben des Gast-Hinweises - gewaehlt Lila mit
     heller Schrift, sonst still mit lila Saum. */
  const chip = (an) => ({ cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700,
    color: an ? "#f7f3ff" : "#c3b8d4", borderRadius: 999, padding: "7px 12px",
    background: an ? "linear-gradient(160deg, rgba(139,92,246,.85), rgba(109,60,220,.85))" : "rgba(22,16,34,.6)",
    border: `1px solid ${an ? "rgba(196,181,253,.9)" : "rgba(167,139,250,.35)"}`,
    boxShadow: an ? "0 0 10px rgba(124,58,237,.35)" : "none" });

  return <div>
    <div style={{ fontSize: 12.5, color: T.dim, lineHeight: 1.55, marginBottom: 10 }}>{t("profile.fbIntro")}</div>
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
      {RUBRIKEN.map(([k, de, enW]) => (
        <button key={k} onClick={() => setRubrik(k)} style={chip(rubrik === k)}>{en ? enW : de}</button>
      ))}
    </div>
    <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4}
      placeholder={t("profile.fbText")}
      style={{ width: "100%", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit",
        fontSize: 14, lineHeight: 1.5, color: "#e6dcff", background: "rgba(12,8,22,.6)",
        border: "1px solid rgba(167,139,250,.35)", borderRadius: 10, padding: "10px 12px", outline: "none" }} />
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
      {bilder.map((b, i) => (
        <span key={i} style={{ position: "relative", display: "inline-block" }}>
          <img src={b} alt="" style={{ height: 54, borderRadius: 8, border: `1px solid ${T.line}`, display: "block" }} />
          <button aria-label={t("profile.fbBildWeg")} onClick={() => setBilder((v) => v.filter((_, j) => j !== i))}
            style={{ position: "absolute", top: -7, right: -7, width: 20, height: 20, lineHeight: "17px",
              borderRadius: "50%", border: `1px solid ${T.line}`, background: T.bg, color: T.text,
              fontSize: 12, fontWeight: 900, cursor: "pointer", padding: 0 }}>×</button>
        </span>
      ))}
      {bilder.length < 2 && (
        <label role="button" style={{ ...chip(false), display: "inline-block" }}>
          {t("profile.fbBild")}
          <input type="file" accept="image/*" multiple onChange={nimmBilder} style={{ display: "none" }} />
        </label>
      )}
      <div style={{ flex: 1 }} />
      <Button onClick={senden} disabled={stand === "sendet"}>
        {stand === "sendet" ? t("profile.fbSendet") : t("profile.fbSenden")}
      </Button>
    </div>
    {stand === "hall" && <div style={{ fontSize: 12, color: "#7fd6a0", marginTop: 8 }}>{t("profile.fbDanke")}</div>}
    {stand === "local" && <div style={{ fontSize: 12, color: "#d3ae5c", marginTop: 8 }}>{t("profile.fbLokal")}</div>}
    {stand === "leer" && <div style={{ fontSize: 12, color: "#e0a0a8", marginTop: 8 }}>{t("profile.fbLeer")}</div>}
  </div>;
}
