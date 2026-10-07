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
import { PASSIVE_TALENTE } from "../../core/index.js";   /* v1.38.0, v1.86.0 ueber das Barrel */
import { paintedForPiece } from "./board/paintedArt.js";
import { BandBild } from "./BandBild.jsx";   /* v1.90.26 */
import { rohrAnteile } from "./board/PieceGlyph.jsx";
import { LockIc } from "./icons.jsx";   /* v1.89.0: das hauseigene Schloss statt des Emojis */
import { AbilityIcon } from "./AbilityIcons.jsx";   /* v1.89.0: dasselbe Zeichen wie im Hofstaat */

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
/* v1.89.0 (Besitzer: "dass die Faehigkeiten dann wirklich auch immer diese
   viereckige Kachel haben"): der Ring ist ein abgerundetes Viereck wie die
   Karte (12 aussen, 9 innen), und er traegt das hauseigene Zeichen
   (AbilityIcon) statt eines Emojis. */
function Ring({ icon, dry, gruen }) {
  return (
    <span style={{ width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", flex: "0 0 auto",
      background: dry
        ? "radial-gradient(circle at 35% 28%, #6b6252 0%, #4a4438 55%, #2e2a22 100%)"
        : "radial-gradient(circle at 35% 28%, #f0d68a 0%, #d4af37 48%, #8a6a1f 100%)",
      boxShadow: "0 1px 2px rgba(0,0,0,.5), 0 3px 10px rgba(0,0,0,.45)" }}>
      <span style={{ width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center",
        background: "radial-gradient(circle at 38% 30%, #4a3a6e 0%, #241a3a 100%)",
        border: "1px solid rgba(0,0,0,.45)",
        color: dry ? "#8d8674" : gruen ? "#9fe0b0" : "#f0d68a", fontSize: 17, lineHeight: 1 }}>{icon}</span>
    </span>
  );
}

// DIE KARTE (nach der Vorlage): schmaler violetter Rahmen, Ring oben,
// Name darunter - und bei der gesperrten Karte die Stufe als Untertitel.
/* v1.90.34 (Besitzer 5.10.: "die Erklaertexte sind unterschiedlich lang, und
   entsprechend wandert das ganze Menue nach unten ... nimm die laengsten oder
   kuerz die Texte"): die Leiste haelt fuer den Text ein FESTES Fenster frei
   (TEXT_HOEHE), die Karten stehen darum immer auf derselben Hoehe. Damit kein
   Text darin abgeschnitten wird, sagt die Leiste die sechs langen Erklaerungen
   kuerzer - die volle Fassung steht weiter im Hofstaat. test_ui prueft die
   Grenze LEISTE_TEXT_MAX fuer jeden Text, den die Leiste zeigen kann. */
export const LEISTE_TEXT_MAX = 135;
export const LEISTE_KURZ = {
  castle: { de: "König und Turm ziehen zusammen. Nur wenn beide unbewegt sind, die Gasse frei ist und der König nicht durchs Schach zieht.",
            en: "King and rook move together. Only while both are unmoved, the lane is clear and the king does not pass through check." },
  enpassant: { de: "Zog ein Bauer eben per Doppelschritt an deinem vorbei, schlägst du ihn im Vorbeigehen. Nur genau einen Zug lang möglich.",
               en: "If a pawn just double-stepped past yours, capture it in passing. Possible for exactly one move." },
  dragon_flight: { de: "Der Drache springt als ganzer Block bis zu 2 Felder und trifft jedes bedeckte Feld. Überlebt ein Getroffener, fällt er zurück.",
                   en: "The dragon leaps as a full block, up to 2 squares, striking every covered square. If a struck foe survives, he falls back." },
  blenden: { de: "Zieht das Monster neben Gegner (bis zwei Felder), sind sie einen Zug lang blind und ziehen nicht. Den König blendet es nie.",
             en: "When the monster moves within two squares of foes, they are blind for one move and may not move. Never the king." },
  gift: { de: "Ein Treffer vergiftet: drei Runden lang kostet jeder eigene Zug Leben. Gift tötet nie, ein Leben bleibt.",
          en: "A hit poisons: for three rounds each own move costs life. Poison never kills; one life remains." },
  widerhall: { de: "Wer das Monster trifft, bekommt einen Teil des Schadens sofort zurück. Das kann den Angreifer fällen.",
               en: "Whoever hits the monster takes part of the damage straight back. It can fell the attacker." },
};
export const leistenText = (id, quelle, en) => {
  const k = LEISTE_KURZ[id];
  return k ? (en ? k.en : k.de) : (en ? quelle.descEn : quelle.descDe);
};
const TEXT_HOEHE = 96;   // Kopfzeile + vier Textzeilen
const HINWEIS_HOEHE = 28;   // zwei Zeilen: auf schmalen Geraeten bricht der Hinweis um
/* ── v1.92.1: DIE LEISTE IST IMMER GLEICH HOCH ─────────────────────────────────
   Besitzer 6.10., mit zwei Fotos: "In dem Moment, wo ich eine Figur ausgewaehlt
   habe, wird das Schachbrett kleiner. Das darf nicht passieren ... das
   Schachbrett muss immer komplett statisch in der Groesse bleiben." GEMESSEN:
   ohne Auswahl war die Leiste 96 px hoch (minHeight), mit Auswahl 242 (Textfenster
   96 + Karten + Hinweis) - und weil der Brettkasten den REST des Schirms nimmt,
   gab das Brett auf jedem Geraet, dem die Hoehe knapp ist, 146 px ab (auf
   seinem Foto 848 -> 762 breit). Dieselbe Klasse: die Pille "letztes Talent"
   (+24 px beim ersten Einsatz), die Kroenungswahl (+170 px), eine Karte mit
   zweizeiligem Namen (+10 px), das Banner (Leiste fort, Brett waechst).

   Jetzt hat die Leiste EINE Hoehe je Geraet, die an nichts haengt, was im Spiel
   geschieht. Der Spielschirm misst, wie viel Platz unter einem Brett in voller
   Breite bleibt, und gibt eine von zwei Bauarten vor:
     hoch   (>= LEISTE_HOCH frei): wie bisher - Text ueber den Karten.
     flach  (weniger): Figur klein, daneben die Karten; die Erklaerung steht
            RECHTS daneben, wenn die Leiste breit genug ist, sonst legt sie sich
            UEBER die Kartenreihe (ein Tipp schliesst sie). Das Brett bleibt frei. */
export const KARTE_HOEHE = 98;   // 12 Rand + 42 Ring + 4 + zwei Namenszeilen + 4 + Fusszeile (94 war fuer "Frühe Krönung" mit Fusszeile zu knapp: pruefe-leiste L1 rot)
export const LEISTE_HOCH = 6 + 4 + TEXT_HOEHE + 6 + KARTE_HOEHE + 2 + 6 + HINWEIS_HOEHE;   // 246
export const LEISTE_FLACH = 6 + 4 + KARTE_HOEHE;   // 108
export const LEISTE_BREIT_AB = 640;   // ab dieser Breite steht die Erklaerung neben den Karten

/* Gemessen im Browser (tools/pruefe-leiste.mjs): Grossbuchstaben in fetter
   Schrift brauchen rund 0,78 em je Zeichen, und aus "ß" wird in Grossschrift
   "SS" - STOSSSCHLAG hat elf Zeichen, nicht zehn. Die Schrift richtet sich nach
   dem laengsten Wort, damit es in KACHEL_TEXT Pixel passt. */
export const KACHEL_TEXT = 70;
export const nameGroesse = (label) => {
  const lang = Math.max(...String(label || "").toUpperCase().split(/[\s-]+/).map((w) => w.length));
  return Math.max(6.5, Math.min(9, (KACHEL_TEXT - 2) / (Math.max(1, lang) * 0.78)));
};

/* zwei Zeilen der groessten Namensschrift (9 px x 1,15) */
const NAME_KASTEN = 21;
function Karte({ icon, label, unter, dry, gruen, active, lock, onTap, scharf = false, fuss = null }) {
  return (
    /* v1.89.0 (Besitzer: "Talent-Kacheln: Kontur Lila; wenn man eine auswaehlt,
       ein animiertes leuchtendes Lila ... eine Kachel nur dann aktiv hervorheben,
       wenn man sie auch druecken kann"): GEMESSEN ruhten die Kacheln in Gold
       (rgba(233,210,150,.42)), die geoeffnete gesperrte Kachel bekam sogar eine
       goldene Aktivkontur, und die scharfe Kachel leuchtete ohne Bewegung. Jetzt
       ruhen alle in Riss-Lila, die Aktivkontur gibt es nur fuer Schaltbares, und
       die scharfe Kachel traegt die laufende Kontur .gg-funkenkontur, dieselbe
       wie der Verbessern-Knopf im Hofstaat. */
    <button onClick={onTap} title={label} className={scharf ? "gg-funkenkontur" : undefined}
      style={{ width: 78, height: KARTE_HOEHE, flex: "0 0 auto", cursor: "pointer", fontFamily: "inherit", /* v1.92.1: fest - eine Karte mit zweizeiligem Namen war 10 px hoeher und schob das Brett */
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "7px 3px 5px",
        borderRadius: 12,
        /* v1.38.0: SCHARF leuchtet violett - dieselbe Farbe, die das Brett fuer
           die Zauberfelder nimmt. */
        border: scharf ? "1.5px solid #c4b5fd"
          : active && !lock ? `1.5px solid ${T.riftBright}` : `1px solid ${lock ? "rgba(167,139,250,.22)" : "rgba(167,139,250,.5)"}`,
        background: lock
          ? "linear-gradient(180deg, rgba(20,16,32,.55), rgba(10,9,16,.6))"
          : "linear-gradient(180deg, rgba(38,28,64,.78), rgba(16,12,30,.9))",
        boxShadow: scharf ? "0 0 14px rgba(167,139,250,.65)" : active && !lock ? "0 0 10px rgba(167,139,250,.35)" : "0 2px 8px rgba(0,0,0,.4)",
        opacity: lock ? 0.78 : 1 }}>
      <Ring icon={lock ? <LockIc size={17} color="#a78bfa" /> : icon} dry={dry || lock} gruen={gruen} />
      {/* v1.90.34 (Besitzer: "sehr unvorteilhaft, wenn der Name der Faehigkeit
          nicht ganz auf die Kachel passt" - STOSSSCHLAG stand als STOSSSCHLA
          da): die Kachel ist 78 statt 66 breit (drei passen bei 390 px neben die Figur), und die Schrift richtet sich
          nach dem LAENGSTEN WORT des Namens (ein Wort bricht nicht um). */}
      {/* v1.94.2 (Besitzer 7.10.: "alle Buttons gleich gross, und wenn eine
          Faehigkeit zwei Zeilen braucht, dann bei einzeilig mittig vertikal
          ausrichten"): der Name steht in einem Kasten von IMMER zwei Zeilen
          Hoehe (NAME_KASTEN) und sitzt darin mittig. Vorher begann ein
          einzeiliger Name oben, und die Fusszeile ("antippen") stand je nach
          Namenslaenge auf verschiedener Hoehe. */}
      <span data-kachel-namenkasten style={{ height: NAME_KASTEN, flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span data-kachel-name style={{ fontSize: nameGroesse(label), fontWeight: 800, letterSpacing: ".02em", textTransform: "uppercase",
        color: lock ? T.faint : gruen ? "#9fe0b0" : T.goldBright, lineHeight: 1.15, textAlign: "center",
        maxWidth: KACHEL_TEXT, flex: "0 0 auto", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
        {label}</span></span>
      {unter && <span style={{ fontSize: 8.5, fontWeight: 800, color: T.faint }}>{unter}</span>}
      {/* v1.38.0: die Fusszeile der Pillen zog mit um - dauerhaft, antippen,
          eingesetzt. Sie sagt in einem Wort, was die Karte kann. */}
      {fuss && <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: ".02em",
        color: scharf ? "#cbbcf5" : dry ? T.faint : "#a99ac9" }}>{fuss}</span>}
    </button>
  );
}

export function KampfLeiste({ state, inspect, en, myColor = "w", banner = false, stil = "painted", scharf = null, onScharf = null,
  raum = "hoch", hoehe = null, breit = false, fest = true }) {
  const [offen, setOffen] = useState(null);
  const flach = raum === "flach";
  const H = fest ? (hoehe || (flach ? LEISTE_FLACH : LEISTE_HOCH)) : null;
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
    if (lm?.consumed && ABILITIES[lm.consumed]) { setLetztes({ id: lm.consumed, color: lm.color }); setPilleFrisch(true); }
  }, [state]);
  /* v1.92.1: in der flachen Leiste ohne Luft ueber den Karten steht die Pille
     nur einen Augenblick da (sie laege sonst dauerhaft auf den Karten). */
  const [pilleFrisch, setPilleFrisch] = useState(false);
  useEffect(() => { if (!pilleFrisch) return; const t = setTimeout(() => setPilleFrisch(false), 3600); return () => clearTimeout(t); }, [pilleFrisch, letztes]); // { art: "ab"|"sonder"|"lock", id, level? }
  // v0.71.8: die Leiste dient BEIDEN Seiten - eigene Figuren voll, fremde
  // mit Nebelregel (ein Talent bleibt "???", bis die Figur es gezeigt hat).
  const pc = inspect && state.board[inspect.i] ? state.board[inspect.i] : null;
  const eigen = pc ? pc.color === myColor : true;
  /* ── v1.38.0 (Besitzer): DIE LEISTE SCHALTET DEN ZAUBER SCHARF ────────────
     Bisher oeffnete ein Tipp nur die Beschreibung, und scharf schalten ging
     allein ueber die Pillen im Talentband - dieselben Talente ZWEIMAL, und
     die Karten "griffen nicht". Jetzt: ein Tipp auf einen Zauber der eigenen
     Figur, wenn sie am Zug ist, schaltet ihn scharf UND erklaert ihn; ein
     zweiter Tipp entschaerft. Passive Talente, fremde Figuren und gesperrte
     Karten zeigen wie bisher nur ihre Beschreibung. */
  const amZug = !!(pc && eigen && pc.color === state.turn);
  const istZauber = (id) => !!ABILITIES[id] && !PASSIVE_TALENTE.has(id);
  const schaltbar = (id) => amZug && istZauber(id) && !(pc.used || {})[id];
  useEffect(() => { setOffen(null); }, [inspect && inspect.i, state]);
  /* v1.92.1: auch unter dem Siegbanner bleibt der Platz stehen - vorher fiel die
     Leiste weg und das Brett wuchs hinter dem Banner. */
  if (banner) return H ? <div aria-hidden data-kampfleiste="leer" style={{ flex: "0 0 auto", height: H }} /> : null;

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
  /* v1.94.2 (Besitzer 7.10., Handyfoto mit "PHASE Lv 3" unter dem Laeufer:
     "wenn Faehigkeiten noch nicht freigeschaltet sind, auch den Button weg"):
     die Karte mit dem Schloss ist fort. Ob die Figur spaeter noch etwas lernt,
     wird weiter gebraucht - fuer den Satz unter der Reihe ("lernt sie im
     Hofstaat") statt "Keine Talente". */
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

  const pille = letztes ? (
    <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".04em", borderRadius: 999, whiteSpace: "nowrap",
      padding: "3px 10px", border: "1px solid rgba(167,139,250,.4)",
      background: "linear-gradient(165deg, rgba(40,27,70,.96), rgba(18,12,36,.97))",
      color: letztes.color === myColor ? "#cdebd2" : "#e8c9cf" }}>
      {ABILITIES[letztes.id].icon} {en ? ABILITIES[letztes.id].nameEn : ABILITIES[letztes.id].nameDe}
      {" — "}{letztes.color === myColor ? (en ? "you" : "Du") : (en ? "foe" : "Gegner")}</span>) : null;
  /* Wo die Pille steht, ohne Platz zu nehmen: hoch im (meist leeren) Textfenster,
     solange keine Erklaerung offen ist; flach ueber den Karten, wenn dort Luft
     ist, sonst kurz als Einblendung. */
  const flachLuft = flach && H != null && H >= LEISTE_FLACH + 26;
  const pilleZeigen = !!pille && (flach ? (flachLuft || pilleFrisch) : !beschreibung);
  const bildH = flach ? Math.max(56, Math.min(108, (H || LEISTE_FLACH) - 42)) : 108;
  const textBlock = beschreibung ? (
    <div onClick={() => setOffen(null)} data-talent-text style={{ padding: "2px 4px 4px", cursor: "pointer", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" }}>
        <span className="gg-serif" style={{ fontSize: flach ? 13 : 14, color: T.goldBright, letterSpacing: ".04em" }}>
          {en ? beschreibung.nameEn : beschreibung.nameDe}</span>
        {offen.art === "ab" && ABILITIES[offen.id]?.once && (
          <span style={{ fontSize: 10.5, fontWeight: 800, color: dry ? T.faint : "#cbbcf5" }}>
            {dry ? (en ? "spell spent" : "Zauber verbraucht") : (en ? "once per battle" : "einmal pro Gefecht")}</span>)}
        {offen.art === "sonder" && (
          <span style={{ fontSize: 10.5, fontWeight: 800, color: "#9fe0b0" }}>
            {en ? "available now" : "jetzt möglich"}</span>)}
        {offen.art === "lock" && (
          <span style={{ fontSize: 10.5, fontWeight: 800, color: "#cbbcf5" }}>
            {en ? `locked · from Lv ${offen.level}` : `gesperrt · ab Lv ${offen.level}`}</span>)}
      </div>
      <div style={{ fontSize: flach ? 11.5 : 12, lineHeight: flach ? 1.36 : 1.5, color: T.text,
        overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical" }}>
        {offen.nebel ? (en ? beschreibung.descEn : beschreibung.descDe) : leistenText(offen.id, beschreibung, en)}</div>
    </div>) : null;
  const hinweis = (<>
    {!scharf && dry && amZug && abIds.some((id) => istZauber(id)) && (
      <span style={{ fontSize: 10.5, color: "#b8a7ea", paddingLeft: 2 }}>
        {en ? "One spell per battle — it is spent."
            : "Das Buch ist geschlossen — der Zauber ist eingesetzt."}</span>
    )}
    {scharf && ABILITIES[scharf] && (
      <span style={{ fontSize: 10.5, fontWeight: 700, color: "#cbbcf5", paddingLeft: 2 }}>
        {en ? "ready — tap a ✦ square · tap again to cancel"
            : "bereit — tippe ein ✦-Feld · nochmal tippen bricht ab"}</span>
    )}
     {/* v1.92.1: der Satz stand als Zeile UNTER dem Brett (BoardView) und lag dort
        auf dem Hofwert der eigenen Seite - er gehoert zu den Karten. */}
    {!scharf && pc && eigen && amZug && abIds.length === 0 && (sonder.length > 0 || naechste) && (
      <span style={{ fontSize: 10.5, fontStyle: "italic", color: "rgba(226,218,246,.62)", paddingLeft: 2 }}>
        {state.rules === "chess" && (pc.level || 1) <= 1
          ? (en ? "Classic — only chess counts here. Pieces learn talents in the HP Battle."
                : "Klassisch — hier zählt nur Schach. Talente lernen die Figuren im Gambit-Modus.")
          : (en ? "This piece has no talents yet — it learns them in your court."
                : "Diese Figur hat noch keine Talente — im Hofstaat lernt sie welche.")}</span>
    )}
  </>);

  return (
    <div data-kampfleiste={flach ? "flach" : "hoch"} style={{ position: "relative", flex: "0 0 auto", padding: "0 10px 6px",
      ...(H ? { height: H, boxSizing: "border-box", overflow: "hidden" } : null) }}>
      {pilleZeigen && (
        <div data-talent-pille style={{ position: "absolute", left: 0, right: 0, top: flach ? (flachLuft ? 2 : 4) : 6, zIndex: 3,
          display: "flex", justifyContent: "center", pointerEvents: "none" }}>{pille}</div>
      )}
      {/* v1.89.0: die Beschreibung steht nicht mehr als Kasten UEBER der
          Leiste (gemessen: sie lag ueber dem Hinweis unter dem Brett), sondern
          IN der Leiste, mittig ueber den Karten - siehe unten bei den Karten. */}

      {/* v0.71.7 (Besitzer): KEINE Panel-Kachel mehr - die Leiste steht frei
          auf dem Schwarz: links die gewaehlte Figur FREIGESTELLT, daneben
          Kopfzeile und die Karten-Knoepfe. */}
      <div style={{ height: H ? H - 6 : undefined, minHeight: H ? undefined : 96, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 10, padding: "2px 2px",
        paddingTop: flachLuft ? 24 : 2 }}>
        {pc && (() => { const bild = paintedForPiece(pc); /* v1.0.41: ueberall derselbe eine Satz */ return bild ? (
          <div style={{ position: "relative", flex: "0 0 auto", alignSelf: "flex-end",
            display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* v0.71.9 (Besitzer): der Name steht MITTIG UEBER der Figur -
                winzig, besondere Schrift, keine Pille. */}
            <span className="gg-serif" style={{ fontSize: 10.5, letterSpacing: ".06em", marginBottom: 1,
              color: eigen ? T.goldBright : "#cbbcf5", opacity: 0.92, whiteSpace: "nowrap",
              maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", textAlign: "center" }}>
              {nm}{(pc.level || 1) > 1 ? ` · Lv ${pc.level}` : ""}</span>
            {/* v1.90.26: die gewaehlte Figur traegt hier DASSELBE Band wie auf dem
                Brett - im Gefecht mit ihren Werten, im Schach schwarz. */}
            <BandBild kennung="leiste" src={bild} style={{ height: bildH,
              filter: "drop-shadow(0 3px 8px rgba(0,0,0,.6))" }}
              {...(state?.rules === "hp" && pc.maxHp > 0 ? rohrAnteile(pc) : null)} />
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
        <div style={{ flex: flach && breit ? "0 1 auto" : 1, minWidth: 0, position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
        {pc ? (<>
          {!flach && <div data-talent-fenster style={{ height: TEXT_HOEHE, display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden" }}>
          {textBlock}
          </div>}
          {/* v0.71.8 (Besitzer): kein Kopfzeilen-Balken mehr - der Name steht
              WINZIG in der besonderen Schrift oben links, nimmt keinen Platz
              und traegt keine Pille; die Kugeln haengen klein daneben. */}
          {/* v0.71.12: der Kopf-Block oben links ist fort - alles wohnt an der Figur. */}
          {/* DIE KARTENREIHE: Sonderzuege · Faehigkeiten (v1.94.2: keine gesperrte Karte mehr) */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
            {sonder.map((k) => (
              <Karte key={k} icon={SONDER[k].icon} label={en ? SONDER[k].nameEn : SONDER[k].nameDe} gruen
                active={offen?.art === "sonder" && offen.id === k}
                onTap={() => setOffen((o) => o?.id === k ? null : { art: "sonder", id: k })} />
            ))}
            {abIds.map((id) => {
              const gezeigt = eigen || !!(pc.used && pc.used[id]);
              return (
              <Karte key={id} icon={gezeigt ? <AbilityIcon id={id} size={28} /> : "✦"}
                label={gezeigt ? (en ? ABILITIES[id].nameEn : ABILITIES[id].nameDe) : "???"}
                dry={dry && ABILITIES[id].once} active={offen?.art === "ab" && offen.id === id}
                scharf={scharf === id}
                fuss={!gezeigt ? null
                  : PASSIVE_TALENTE.has(id) ? (en ? "always on" : "dauerhaft")
                  : (pc.used || {})[id] ? (en ? "spent" : "eingesetzt")
                  : scharf === id ? (en ? "ready" : "bereit")
                  : schaltbar(id) ? (en ? "tap" : "antippen") : null}
                onTap={() => {
                  if (schaltbar(id) && onScharf) onScharf(scharf === id ? null : id);
                  setOffen((o) => (o?.id === id && (!schaltbar(id) || scharf === id)) ? null : { art: "ab", id, nebel: !gezeigt });
                }} />
            ); })}
            {sonder.length === 0 && abIds.length === 0 && !naechste && (
              <span style={{ fontSize: 11.5, color: T.faint, alignSelf: "center" }}>
                {en ? "No talents — this piece fights with its movement alone."
                    : "Keine Talente — diese Figur kämpft allein mit ihrer Gangart."}</span>
            )}
          </div>
          {/* v1.38.0: der Hinweis steht UNTER der Reihe - in ihr scrollte er
              mit und wurde am Rand abgeschnitten (im Browser gesehen). */}
          {/* v1.38.0: der Satz aus dem alten Talentband - er sagt, warum keine
              Karte mehr schaltet, wenn der eine Zauber der Partie fort ist. */}
          {!flach && <div data-talent-hinweis style={{ height: HINWEIS_HOEHE, overflow: "hidden", fontSize: 10.5, lineHeight: 1.3 }}>
          {hinweis}
          </div>}
          {/* v1.92.1, FLACH UND SCHMAL: die Erklaerung legt sich ueber die
              Kartenreihe - ueber nichts sonst. Ein Tipp schliesst sie. */}
          {flach && !breit && textBlock && (
            <div data-talent-fenster style={{ position: "absolute", inset: 0, zIndex: 4, display: "flex", flexDirection: "column",
              justifyContent: "center", overflow: "hidden", borderRadius: 12,
              background: "linear-gradient(180deg, rgba(24,18,42,.985), rgba(12,9,22,.985))", border: "1px solid rgba(167,139,250,.35)" }}>
              {textBlock}
            </div>
          )}
        </>) : (
          <span style={{ fontSize: 11.5, color: T.faint, padding: "0 4px" }}>
            {en ? "Tap one of your pieces — its talents and special moves appear here."
                : "Tippe eine deiner Figuren an — ihre Talente und Sonderzüge erscheinen hier."}</span>
        )}
        </div>
        {/* v1.92.1, FLACH UND BREIT: die Erklaerung steht rechts neben den Karten. */}
        {flach && breit && pc && (
          <div data-talent-fenster style={{ flex: "1 0 240px", minWidth: 0, alignSelf: "stretch", display: "flex", flexDirection: "column",
            justifyContent: "center", overflow: "hidden" }}>
            {textBlock}
            {!textBlock && <div data-talent-hinweis style={{ textAlign: "center", lineHeight: 1.3 }}>{hinweis}</div>}
          </div>
        )}
      </div>
    </div>
  );
}