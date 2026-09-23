// ── DAS ADMIN-PORTAL ────────────────────────────────────────────────────────
// Besitzer-Wunsch (v0.57): "eine Menueseite, wo alle Unterseiten dabei sind."
// Erreichbar nur ueber ?admin - eine Tuer zu allen Werkbaenken, damit sich
// niemand die Suchparameter merken muss. Bewusst schlicht: Karten mit Titel,
// Zweck und Absprung.
import { T } from "./theme.js";

const SEITEN = [
  { ziel: "?werkstatt", name: "Die Figurenwerkstatt",
    was: "Alle 57 Figurenpaare: Regler (v5-Rezept), Pinsel mit Pipette, Radierer, Zoom — je Figur speichern, als Zip exportieren oder direkt zu GitHub laden." },
  { ziel: "?galerie", name: "Die Musterkammer",
    was: "Die Designsystem-Galerie: Farben, Knöpfe, Karten, Kugeln und Bausteine des Spiels in einer Schau." },
  { ziel: "?spielerbuch", name: "Das Spielerbuch",
    was: "Alle angemeldeten Spieler mit Fortschritt (Kapitel, Gold, Partien, Siege), wer gerade online ist, grobe Herkunft und Zahlen über das Spiel im Ganzen. Braucht das Admin-Wort." },
  { ziel: "https://gambitrise.com/landing.html", name: "Die Landingpage",
    was: "Die öffentliche Seite, so wie Besucher sie sehen — in neuem Tab." },
  { ziel: "/", name: "Zurück ins Spiel",
    was: "Das Hauptmenü — der normale Weg für alle." },
];

export function AdminPortal() {
  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, padding: "18px 14px 40px", maxWidth: 560, margin: "0 auto" }}>
      <div className="gg-serif" style={{ fontSize: 22, color: T.goldBright, letterSpacing: ".05em" }}>Admin-Portal</div>
      <div style={{ fontSize: 12, color: T.dim, marginBottom: 14 }}>Alle Werkbänke des Spiels hinter einer Tür. Diese Seite ist nicht verlinkt — wer sie kennt, gehört hierher.</div>
      {SEITEN.map((s) => (
        <a key={s.ziel} href={s.ziel} target={s.ziel.startsWith("http") ? "_blank" : undefined} rel={s.ziel.startsWith("http") ? "noreferrer" : undefined} style={{ display: "block", textDecoration: "none", color: "inherit",
          border: `1px solid ${T.line}`, borderRadius: 14, background: T.panel, padding: "13px 14px", marginBottom: 10 }}>
          <div className="gg-serif" style={{ fontSize: 16, color: T.goldBright, letterSpacing: ".04em", marginBottom: 3 }}>{s.name} ›</div>
          <div style={{ fontSize: 12, color: T.dim, lineHeight: 1.5 }}>{s.was}</div>
        </a>
      ))}
      <div style={{ fontSize: 11, color: T.faint, marginTop: 14, lineHeight: 1.5 }}>
        Merkzettel: Werkstatt-Einstellungen und dein GitHub-Token leben nur auf diesem Gerät.
      </div>
    </div>
  );
}
