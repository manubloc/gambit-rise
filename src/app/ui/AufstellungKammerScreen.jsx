/* ── DIE AUFSTELLUNGSKAMMER (v1.90.15, Besitzerauftrag 30.9.2026) ───────────
 * "von allen möglichen Kapiteln und in allen möglichen Konstellationen ...
 *  gib mir die ganzen ersten Spiele von den Figuren raus, wie da die
 *  Aufstellung der Figuren oder wie entsprechend die Szenen aussehen, dass
 *  ich wirklich genau sehe, wie das aussieht. Also auch gerade zum Beispiel
 *  der Drache ist ein spannender Gegner."
 *
 * Ein Werkzeug hinter dem Torschloss, nach dem Muster der Animations- und
 * der Schaukammer:
 *   ?aufstellung            -> die Liste aller Schluesselstationen
 *   ?aufstellung=L07s41     -> diese Station, so wie sie beim ERSTEN Zug steht
 *
 * WAS HIER STEHT, IST DAS ECHTE: dasselbe `buildStageMatch`, dasselbe
 * `createGame`, dieselbe `BoardView` mit dem Kapitelstreifen und dem
 * Kapitelgemaelde dahinter wie im Gefecht. Keine Attrappe - genau darum
 * gibt es diese Kammer. Die Animationskammer zeigt ihre Bewegungen auf
 * NACHGEBAUTEN Buehnen, und dort sieht niemand, wie eine Figur auf dem
 * echten Brett steht.
 *
 * WESSEN SPIELSTAND: ein Spieler, der dieses Kapitel gerade zur Haelfte
 * hinter sich hat - alle frueheren Kapitel gemeistert (withProgressPct, 50 %).
 * Das ist der Stand, mit dem man einer Boss-Station realistisch begegnet;
 * er bestimmt auch die BESETZUNG (ab Kapitel III ruecken begegnete, nicht
 * eigene Figuren und Monster auf freie Plaetze). Die Finale mischen ihre
 * Grundreihe bei JEDEM Versuch neu - hier steht der Wurf zum Samen 1.
 */
import { useMemo } from "react";
import { T } from "./theme.js";
import { BoardView } from "./board/BoardView.jsx";
import { BrettHintergrund } from "./BrettHintergrund.jsx";
import { FELD_KAPITEL, FELD_FINALE } from "./board/feldArt.js";
import { createGame } from "../../core/index.js";
import { CAMPAIGN, nodeById, mapById, BOSSES, CHARACTERS } from "../../content/index.js";
import { buildStageMatch, buildArmy, defaultProfile, withProgressPct } from "../../meta/index.js";

/** Die Schluesselstationen: jede Boss-Station und jedes Kapitelfinale. */
export function schluesselStationen() {
  return CAMPAIGN.filter((n) => n.boss || n.final)
    .sort((a, b) => (a.league - b.league) || String(a.id).localeCompare(String(b.id)));
}

/** Wer wartet dort? Name aus Bestiarium oder Hofstaat. */
function gegnerName(match) {
  const b = match?.boss;
  const id = b?.bossId || b?.pure || b?.piece || null;
  if (!id) return "—";
  const bo = BOSSES.find((x) => x.id === id || x.id === String(id).replace(/^pb_/, ""));
  if (bo) return bo.nameDe;
  const ch = CHARACTERS[String(id).replace(/^pb_/, "")];
  return ch ? ch.nameDe : String(id);
}

/** Der Anfangszustand einer Station - fuer die Kammer und fuer die Probe. */
export function aufstellungFuer(nodeId, seed = 1) {
  const node = nodeById(nodeId);
  if (!node) return null;
  const lg = node.league || 1;
  const profil = withProgressPct(defaultProfile(), 50, lg);
  const match = buildStageMatch(nodeId, profil);
  const map = mapById(match.map);
  let ai = match.aiArmy;
  /* Dieselbe Umstellung wie in GameScreen: jedes Kapitelfinale mischt die
     Grundreihe. Ohne sie zeigte die Kammer ein Finale, das so nie auftritt. */
  if (node.final && ai?.back?.length) {
    const arr = [...ai.back]; let sh = seed >>> 0;
    for (let i = arr.length - 1; i > 0; i--) {
      sh = (Math.imul(sh, 1664525) + 1013904223) >>> 0;
      const j = sh % (i + 1); [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    ai = { ...ai, back: arr };
  }
  const state = createGame(buildArmy(profil, map), ai, { seed, map, rules: match.rules });
  /* Wer auf freien Plaetzen steht (nur an GEWOEHNLICHEN Stationen - an Boss-
     und Finalstationen ist die Besetzung absichtlich aus, besetzung.js). */
  const besetzt = (match.besetzung?.eintraege || []).filter(Boolean).map((e) => {
    if (e.startsWith("boss:")) return BOSSES.find((b) => b.id === e.slice(5))?.nameDe || e;
    return CHARACTERS[e]?.nameDe || e;
  });
  return { node, match, state, map, gegner: gegnerName(match), besetzt };
}

export function AufstellungKammerScreen() {
  const wahl = typeof location !== "undefined" ? new URLSearchParams(location.search).get("aufstellung") : null;
  const liste = useMemo(() => schluesselStationen(), []);
  const eintrag = useMemo(() => {
    if (!wahl) return null;
    try { return aufstellungFuer(wahl); } catch (e) { return { fehler: String(e?.message || e) }; }
  }, [wahl]);

  const huelle = { minHeight: "100dvh", background: "#05060a", color: T.text, fontFamily: "Georgia, serif",
    padding: "14px 14px 40px", boxSizing: "border-box" };

  if (!wahl) {
    return (
      <div style={huelle}>
        <div style={{ fontSize: 20, letterSpacing: 2, color: "#c9a45c", marginBottom: 4 }}>AUFSTELLUNGSKAMMER</div>
        <div style={{ fontSize: 13, color: "#9aa3b8", marginBottom: 14 }}>
          {liste.length} Schlüsselstationen — jede so, wie sie beim ersten Zug steht.</div>
        <div style={{ display: "grid", gap: 4 }}>
          {liste.map((n) => (
            <a key={n.id} href={`?aufstellung=${n.id}`} style={{ color: T.text, textDecoration: "none",
              padding: "7px 10px", borderRadius: 8, background: "rgba(255,255,255,.04)", fontSize: 13.5 }}>
              <b style={{ color: n.final ? "#e0b76c" : "#b6cdff" }}>Kap. {n.league}</b> · {n.place}
              {n.final ? " · FINALE" : ""}</a>
          ))}
        </div>
      </div>
    );
  }

  if (!eintrag || eintrag.fehler) {
    return <div style={huelle}>Station „{wahl}" nicht darstellbar{eintrag?.fehler ? `: ${eintrag.fehler}` : ""}.</div>;
  }

  const { node, match, state, gegner, besetzt } = eintrag;
  const art = node.final ? "FINALE" : node.boss ? "BOSS-STATION" : "GEWÖHNLICHE STATION";
  const lg = ((node.league - 1) % 12) + 1;
  const feld = FELD_KAPITEL[lg - 1];
  const feldDunkel = lg >= 11 && node.final ? FELD_FINALE : null;
  return (
    <div style={{ ...huelle, position: "relative" }}>
      <BrettHintergrund liga={lg} />
      <div data-aufstellung-kopf="1" style={{ position: "relative", zIndex: 2, marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: "#9aa3b8", letterSpacing: 1.5 }}>
          KAPITEL {node.league} · {art} · {match.rules === "hp" ? "LEBENSPUNKTE" : "SCHACH"}</div>
        <div style={{ fontSize: 19, color: "#e8e4d8", marginTop: 2 }}>{node.place}</div>
        {node.boss || node.final
          ? <div style={{ fontSize: 14, color: "#e0b76c", marginTop: 2 }}>Gegner: {gegner}</div>
          : <div style={{ fontSize: 14, color: "#c4b5fd", marginTop: 2 }}>Besetzung: {besetzt.join(", ") || "—"}</div>}
        {node.final && <div style={{ fontSize: 11.5, color: "#9aa3b8", marginTop: 3 }}>
          Die Grundreihe wird bei jedem Versuch neu gemischt — hier der Wurf zum Samen 1.</div>}
      </div>
      {/* Luft ueber dem Brett: die gemalten Figuren ragen ueber ihr Feld
          hinaus, und die hintere Reihe stiess sonst in den Kopf. */}
      <div data-aufstellung-brett="1" style={{ position: "relative", zIndex: 2, width: "min(94vw, 460px)", margin: "34px auto 0" }}>
        <BoardView lang="de" state={state} onMove={() => {}} interactive={false} lastMove={null}
          maxPx={460} feld={feld} feldDunkel={feldDunkel} showLevel artStyle="painted" ruhig />
      </div>
    </div>
  );
}
