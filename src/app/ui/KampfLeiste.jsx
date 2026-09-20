// ── DIE KAMPFLEISTE ─────────────────────────────────────────────────────────
// v0.50: Figur gross + Bubbles. v0.64, nach der Bildvorlage des Besitzers:
// KEIN Gross-Portraet mehr ("die Figur wird ja schon beim Auswaehlen gross" -
// auf dem Brett), stattdessen KARTEN-SCHALTFLAECHEN wie in seiner Vorlage:
// ein schmaler violetter Kartenrahmen, darin der bewaehrte Goldring-Bubble,
// darunter der Name. Die Reihe scrollt seitlich, wenn mehr Karten da sind,
// als der Schirm traegt. Sonderzuege (Rochade, En passant) stehen als
// gruen markierte Karten voran. Und NEU: die NAECHSTE noch gesperrte
// Faehigkeit der Figur erscheint als Schloss-Karte mit ihrer Stufe - man
// sieht im Gefecht, was die Figur noch lernen kann (Freischalten geschieht
// im Hofstaat; eines Tages vielleicht im Spiel selbst).
import { useState, useEffect } from "react";
import { legalMovesFrom } from "../../core/index.js";
import { ABILITIES, CHARACTERS, faehigkeitZustand } from "../../content/index.js";
import { paintedForPiece } from "./board/paintedArt.js";

import { T } from "./theme.js";

const SONDER = {
  castle: {
    icon: "⇄", nameDe: "Rochade", nameEn: "Castling",
    descDe: "König und Turm ziehen im selben Zug: der König zwei Felder zum Turm, der Turm springt auf seine Innenseite. Nur wenn beide noch nie gezogen haben, die Gasse frei ist und der König weder im Schach steht noch über ein bedrohtes Feld zieht. Tippe das markierte Feld zwei Schritte neben dem König.",
    descEn: "King and rook move together: the king steps two squares toward the rook, the rook jumps to his inner side. Only while both are unmoved, the lane is clear and the king neither stands in check nor crosses an attacked square. Tap the marked square two steps beside the king.",
  },
  enpassant: {
    icon: "⚔", nameDe: "En passant", nameEn: "En passant",
    descDe: "Zog der gegnerische Bauer eben per Doppelschritt an deinem vorbei, darfst du ihn im Vorbeigehen schlagen: Zug auf das übersprungene Feld, der überholte Bauer verschwindet. Das Fenster steht genau einen Zug lang offen.",
    descEn: "If an enemy pawn just double-stepped past yours, you may capture it in passing: move onto the skipped square and the overtaken pawn vanishes. The window stays open for exactly one move.",
  },
};

// Der Goldring aus v0.50 - unveraendert, nur als reiner Schmuck (kein
// eigener Knopf mehr; die KARTE ist die Schaltflaeche).
function Ring({ icon, dry, gruen }) {
  return (
    <span style={{ width: 42, height: 42, borderRadius: "50%", display: "grid", placeItems: "center", flex: "0 0 auto",
      background: dry
        ? "radial-gradient(circle at 35% 28%, #6b6252 0%, #4a4438 55%, #2e2a22 100%)"
        : "radial-gradient(circle at 35% 28%, #f0d68a 0%, #d4af37 48%, #8a6a1f 100%)",
      boxShadow: "0 1px 2px rgba(0,0,0,.5), 0 3px 10px rgba(0,0,0,.45)" }}>
      <span style={{ width: 34, height: 34, borderRadius: "50%", display: "grid", placeItems: "center",
        background: "radial-gradient(circle at 38% 30%, #4a3a6e 0%, #241a3a 100%)",
        border: "1px solid rgba(0,0,0,.45)",
        color: dry ? "#8d8674" : gruen ? "#9fe0b0" : "#f0d68a", fontSize: 17, lineHeight: 1 }}>{icon}</span>
    </span>
  );
}

// DIE KARTE (nach der Vorlage): schmaler violetter Rahmen, Ring oben,
// Name darunter - und bei der gesperrten Karte die Stufe als Untertitel.
function Karte({ icon, label, unter, dry, gruen, active, lock, onTap }) {
  return (
    <button onClick={onTap} title={label}
      style={{ width: 66, minHeight: 78, flex: "0 0 auto", cursor: "pointer", fontFamily: "inherit",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "7px 3px 5px",
        borderRadius: 12,
        border: active ? `1.5px solid ${T.goldBright}` : `1px solid ${lock ? "rgba(233,210,150,.2)" : "rgba(233,210,150,.42)"}`,
        background: lock
          ? "linear-gradient(180deg, rgba(20,16,32,.55), rgba(10,9,16,.6))"
          : "linear-gradient(180deg, rgba(38,28,64,.78), rgba(16,12,30,.9))",
        boxShadow: active ? "0 0 10px rgba(240,214,138,.35)" : "0 2px 8px rgba(0,0,0,.4)",
        opacity: lock ? 0.78 : 1 }}>
      <Ring icon={lock ? "🔒" : icon} dry={dry || lock} gruen={gruen} />
      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase",
        color: lock ? T.faint : gruen ? "#9fe0b0" : T.goldBright, lineHeight: 1.15, textAlign: "center",
        maxWidth: 60, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
        {label}</span>
      {unter && <span style={{ fontSize: 8.5, fontWeight: 800, color: T.faint }}>{unter}</span>}
    </button>
  );
}

export function KampfLeiste({ state, inspect, en, myColor = "w", banner = false, stil = "painted" }) {
  const [offen, setOffen] = useState(null);
  /* v1.0.44: Ob die gesperrten Kuenste wach sind, entscheidet hier die
     PARTIE, nicht der Spielstand: unter Schachregeln ruhen sie immer - auch
     im Schnellspiel-Klassik, wo ein laengst erwachter Spielstand sonst
     Karten anbieten wuerde, die das Regelwerk verbietet. */
  const wach = state?.rules !== "chess";
  // DAS LETZTE TALENT (Besitzer, v0.71): wie der letzte Zug bleibt sichtbar,
  // ob und welches Talent zuletzt verbraucht wurde - von DIR oder vom Gegner.
  const [letztes, setLetztes] = useState(null);
  useEffect(() => {
    const lm = state?.lastMove;
    if (lm?.consumed && ABILITIES[lm.consumed]) setLetztes({ id: lm.consumed, color: lm.color });
  }, [state]); // { art: "ab"|"sonder"|"lock", id, level? }
  // v0.71.8: die Leiste dient BEIDEN Seiten - eigene Figuren voll, fremde
  // mit Nebelregel (ein Talent bleibt "???", bis die Figur es gezeigt hat).
  const pc = inspect && state.board[inspect.i] ? state.board[inspect.i] : null;
  const eigen = pc ? pc.color === myColor : true;
  useEffect(() => { setOffen(null); }, [inspect && inspect.i, state]);
  if (banner) return null;

  /* v1.0.44: DIE LEISTE BIETET NUR AN, WAS AUCH GEHT. Vorher zeigte sie
     jede lebende Faehigkeit als Karte - auch die beiden Reichweiten-Kuenste,
     die im Zug dreifach verriegelt sind. Der Spieler tippte also auf eine
     Karte, die nichts tun konnte. Jetzt entscheidet derselbe Zustand wie in
     Akademie und Chronik. */
  const abIds = pc ? (pc.abilities || []).filter((id) =>
    ABILITIES[id] && ABILITIES[id].live && faehigkeitZustand(id, wach) === "wirkt") : [];
  const dry = pc ? Object.keys(pc.used || {}).length > 0 : false;
  let sonder = [];
  if (pc && eigen) {
    try {
      const setS = new Set(legalMovesFrom(state, inspect.i).map((m) => m.special).filter(Boolean));
      sonder = ["castle", "enpassant"].filter((k) => setS.has(k));
    } catch { sonder = []; }
  }

  const ch = pc ? Object.values(CHARACTERS).find((c) => c.kind === pc.kind) : null;
  const nm = pc ? (pc.name ? (en ? pc.name.en : pc.name.de) : ch ? (en ? ch.nameEn : ch.nameDe) : pc.kind) : "";
  // DIE NAECHSTE GESPERRTE: der erste Leiter-Eintrag der Figur, dessen
  // Faehigkeit sie noch nicht traegt - nur EINER, wie gewuenscht. Der Held
  // traegt seinen eigenen Baum im Hofstaat und bleibt hier ohne Schloss.
  const naechste = (pc && eigen && !pc.hero && ch?.ladder)
    ? ch.ladder
        .filter((e) => e.ability && ABILITIES[e.ability]?.live && !abIds.includes(e.ability)
          && faehigkeitZustand(e.ability, wach) !== "verborgen")
        .sort((a, b) => a.level - b.level)[0] || null
    : null;

  const beschreibung = offen && (offen.nebel
    ? { nameDe: "Verborgenes Talent", nameEn: "Hidden talent",
        descDe: "Noch im Nebel: dieses Talent zeigt sich erst, wenn die Figur es im Gefecht einsetzt.",
        descEn: "Still veiled: this talent reveals itself only once the piece uses it in battle." }
    : offen.art === "sonder" ? SONDER[offen.id] : ABILITIES[offen.id]);

  return (
    <div style={{ position: "relative", flex: "0 0 auto", padding: "0 10px 6px" }}>
      {letztes && !banner && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".04em", borderRadius: 999,
            padding: "3px 10px", border: "1px solid rgba(167,139,250,.4)",
            background: "linear-gradient(165deg, rgba(40,27,70,.9), rgba(18,12,36,.94))",
            color: letztes.color === myColor ? "#cdebd2" : "#e8c9cf" }}>
            {ABILITIES[letztes.id].icon} {en ? ABILITIES[letztes.id].nameEn : ABILITIES[letztes.id].nameDe}
            {" — "}{letztes.color === myColor ? (en ? "you" : "Du") : (en ? "foe" : "Gegner")}</span>
        </div>
      )}
      {beschreibung && (
        <div onClick={() => setOffen(null)} style={{ position: "absolute", left: 10, right: 10, bottom: "100%",
          marginBottom: 6, zIndex: 8, borderRadius: 12, padding: "9px 12px 10px", cursor: "pointer",
          background: "rgba(28, 19, 50, .95)", border: "1px solid rgba(167,139,250,.5)",
          boxShadow: "0 8px 24px rgba(0,0,0,.55)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
            <span className="gg-serif" style={{ fontSize: 14, color: T.goldBright, letterSpacing: ".04em" }}>
              {en ? beschreibung.nameEn : beschreibung.nameDe}</span>
            {offen.art === "ab" && ABILITIES[offen.id]?.once && (
              <span style={{ fontSize: 10.5, fontWeight: 800, color: dry ? T.faint : "#cbbcf5" }}>
                {dry ? (en ? "spell spent" : "Zauber verbraucht") : (en ? "once per battle" : "einmal pro Gefecht")}</span>)}
            {offen.art === "sonder" && (
              <span style={{ fontSize: 10.5, fontWeight: 800, color: "#9fe0b0" }}>
                {en ? "available now" : "jetzt möglich"}</span>)}
            {offen.art === "lock" && (
              <span style={{ fontSize: 10.5, fontWeight: 800, color: "#e0b46a" }}>
                {en ? `locked · unlock in the court from Lv ${offen.level}` : `gesperrt · freischaltbar im Hofstaat ab Lv ${offen.level}`}</span>)}
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.5, color: T.text }}>
            {en ? beschreibung.descEn : beschreibung.descDe}</div>
        </div>
      )}

      {/* v0.71.7 (Besitzer): KEINE Panel-Kachel mehr - die Leiste steht frei
          auf dem Schwarz: links die gewaehlte Figur FREIGESTELLT, daneben
          Kopfzeile und die Karten-Knoepfe. */}
      <div style={{ minHeight: 96, display: "flex", alignItems: "center", gap: 10, padding: "2px 2px" }}>
        {pc && (() => { const bild = paintedForPiece(pc); /* v1.0.41: ueberall derselbe eine Satz */ return bild ? (
          <div style={{ position: "relative", flex: "0 0 auto", alignSelf: "flex-end",
            display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* v0.71.9 (Besitzer): der Name steht MITTIG UEBER der Figur -
                winzig, besondere Schrift, keine Pille. */}
            <span className="gg-serif" style={{ fontSize: 10.5, letterSpacing: ".06em", marginBottom: 1,
              color: eigen ? T.goldBright : "#cbbcf5", opacity: 0.92, whiteSpace: "nowrap",
              maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", textAlign: "center" }}>
              {nm}{(pc.level || 1) > 1 ? ` · Lv ${pc.level}` : ""}</span>
            <img src={bild} alt="" draggable={false} style={{ height: 108,
              filter: "drop-shadow(0 3px 8px rgba(0,0,0,.6))" }} />
            {/* v0.71.12 (Besitzer): die Kugeln stehen wie auf dem Brett DIREKT
                UNTER der Figur - und im Massstab der grossen Figur. */}
            {(pc.maxHp > 0 || pc.atk != null || pc.shield > 0) && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                {/* v1.25.4: keine Perlen mehr - die Zahlen stehen schlicht in
                    den Farben des Sockelbandes, Rot fuer Leben, Blau fuer
                    Staerke. Dieselbe Sprache wie am Brett und im Blatt. */}
                {pc.maxHp > 0 && <span style={{ font: "800 12px/1 Georgia, serif", color: "#ffb3aa" }}>{pc.hp}</span>}
                {pc.atk != null && <span style={{ font: "800 12px/1 Georgia, serif", color: "#b6cdff" }}>{pc.atk}</span>}
                {pc.shield > 0 && <span style={{ fontSize: 11.5, fontWeight: 800, color: "#9fc1e8" }}>⛨ {pc.shield}</span>}
              </div>
            )}
          </div>
        ) : null; })()}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
        {pc ? (<>
          {/* v0.71.8 (Besitzer): kein Kopfzeilen-Balken mehr - der Name steht
              WINZIG in der besonderen Schrift oben links, nimmt keinen Platz
              und traegt keine Pille; die Kugeln haengen klein daneben. */}
          {/* v0.71.12: der Kopf-Block oben links ist fort - alles wohnt an der Figur. */}
          {/* DIE KARTENREIHE: Sonderzuege · Faehigkeiten · die naechste Gesperrte */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
            {sonder.map((k) => (
              <Karte key={k} icon={SONDER[k].icon} label={en ? SONDER[k].nameEn : SONDER[k].nameDe} gruen
                active={offen?.art === "sonder" && offen.id === k}
                onTap={() => setOffen((o) => o?.id === k ? null : { art: "sonder", id: k })} />
            ))}
            {abIds.map((id) => {
              const gezeigt = eigen || !!(pc.used && pc.used[id]);
              return (
              <Karte key={id} icon={gezeigt ? ABILITIES[id].icon : "?"}
                label={gezeigt ? (en ? ABILITIES[id].nameEn : ABILITIES[id].nameDe) : "???"}
                dry={dry && ABILITIES[id].once} active={offen?.art === "ab" && offen.id === id}
                onTap={() => setOffen((o) => o?.id === id ? null : { art: "ab", id, nebel: !gezeigt })} />
            ); })}
            {naechste && (
              <Karte lock icon="🔒"
                label={en ? ABILITIES[naechste.ability].nameEn : ABILITIES[naechste.ability].nameDe}
                unter={`Lv ${naechste.level}`}
                active={offen?.art === "lock" && offen.id === naechste.ability}
                onTap={() => setOffen((o) => o?.id === naechste.ability ? null : { art: "lock", id: naechste.ability, level: naechste.level })} />
            )}
            {sonder.length === 0 && abIds.length === 0 && !naechste && (
              <span style={{ fontSize: 11.5, color: T.faint, alignSelf: "center" }}>
                {en ? "No talents — this piece fights with its movement alone."
                    : "Keine Talente — diese Figur kämpft allein mit ihrer Gangart."}</span>
            )}
          </div>
        </>) : (
          <span style={{ fontSize: 11.5, color: T.faint, padding: "0 4px" }}>
            {en ? "Tap one of your pieces — its talents and special moves appear here."
                : "Tippe eine deiner Figuren an — ihre Talente und Sonderzüge erscheinen hier."}</span>
        )}
        </div>
      </div>
    </div>
  );
}