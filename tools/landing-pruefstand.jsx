/* ── DER PRUEFSTAND DER STARTSEITE (v1.90.25, Besitzerauftrag 3.10.2026) ───────
   "Wir killen den grauen Sockel ... ueberall das Band, in schwarz ... Also
    auch auf dem Schachbrett [der Startseite], da hast du ja gar nicht die
    Baender drauf, und die Positionen und Groessen der Figuren sind auch nicht
    so wie im Spiel spaeter ... wirklich genau das bringen, wie es im Spiel
    aussieht. Das ist mir tatsaechlich sehr wichtig."

   WARUM ES IHN GIBT: bis v1.90.24 setzte tools/landing_bilder.py die Bretter
   der Startseite aus den rohen Gemaelden zusammen - jede Figur im selben
   228-px-Kasten, auf ihrem gemalten grauen Teller. Das Spiel macht es anders
   (Tellerskalierung, Offizierslinie, Bauernsenkung, Band im Sockel), und so
   sah die Startseite nach einem anderen Spiel aus als dem, das dahinter
   wartet. Hier laufen die ECHTEN Bauteile: SockelBand, HofKachel, MoveDiagram
   und die BoardView mit buildStageMatch/createGame und Zuegen aus applyMove.
   tools/landing-fotos.mjs fotografiert sie, tools/landing_bilder.py schneidet
   nur noch zu.

   Lagen (Abfrage in der Adresse):
     ?figur=<gemaelde>                      Gemaelde + schwarzes Band, durchsichtig
     ?karte=<figur>&gelernt=a,b             die Karte der Aufstellung (HofKachel)
     ?zug=<Art>&extra=<faehigkeit>          das Zugbild der Figur, gruen obenauf die
                                            Felder, die die Faehigkeit hinzugibt
     ?brett=<station>&zuege=e2e4,...        das Brett dieser Station nach den Zuegen
            &heer=captain,hawk,...          eigene Grundreihe (acht Eintraege)
            &stand=<prozent>                Fortschritt im Kapitel (Vorgabe 50) */
import { createRoot } from "react-dom/client";
import { GLOBAL_CSS, T } from "../src/app/ui/theme.js";
import { setAnimAn } from "../src/app/ui/anim.js";
import { SockelBand } from "../src/app/ui/SockelBand.jsx";
import { paintedById, paintedForPiece } from "../src/app/ui/board/paintedArt.js";
import { BoardView } from "../src/app/ui/board/BoardView.jsx";
import { BrettHintergrund } from "../src/app/ui/BrettHintergrund.jsx";
import { FELD_KAPITEL } from "../src/app/ui/board/feldArt.js";
import { HofKachel, MoveDiagram, kachelWerteFuer } from "../src/app/ui/screens/ArmyScreen.jsx";
import { AbilityIcon } from "../src/app/ui/AbilityIcons.jsx";
import { createGame, applyMove, legalMovesFrom } from "../src/core/index.js";
import { nodeById, mapById, CHARACTERS, ABILITIES } from "../src/content/index.js";
import { ABILITY_MOVE } from "../src/content/zugbilder.js";
import { buildStageMatch, buildArmy, defaultProfile, withProgressPct, characterLevel } from "../src/meta/index.js";

const Q = new URLSearchParams(location.search);
setAnimAn(false);
const style = document.createElement("style");
style.textContent = GLOBAL_CSS + "\nhtml,body{margin:0;background:transparent}";
document.head.appendChild(style);

/* ── EINE FIGUR MIT IHREM BAND ──────────────────────────────────────────────
   576 px wie das Gemaelde; das Band liegt in BILDPIXELN darueber (ausrichtung
   "unten": seine Hoehe ist dann 46 px geteilt durch die Tellerskalierung -
   auf gleiche Tellerbreite gebracht, sind alle Baender gleich hoch, wie am
   Brett). Es darf unter die gemalte Bodenkante haengen, darum 60 px Luft. */
function Figur({ pid }) {
  return <div id="ziel" data-fertig="1" style={{ position: "relative", width: 576, height: 636 }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 576, height: 576 }}>
      <img src={paintedById(pid)} alt="" data-gg-still="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <SockelBand paintedId={pid} leben={0} kraft={0} grau ausrichtung="unten" id={`lf-${pid}`} />
    </div>
  </div>;
}

/* ── DIE KARTE DER AUFSTELLUNG ──────────────────────────────────────────────
   Derselbe Bau wie in ArmyScreen (Wischreihe der Aufstellung): HofKachel,
   darunter Zugbild und die Zeichen der Leiter. `gelernt` sind die Talente,
   die die Figur schon kann - das Zugbild legt ihre Felder farbig obenauf. */
function Karte({ id, gelernt }) {
  const c = CHARACTERS[id];
  const profil = defaultProfile();
  const lv = Number(Q.get("stufe")) || characterLevel(profil, id) || 1;
  const bild = paintedForPiece({ kind: c.kind, color: "w", hero: id === "gambit", level: lv });
  const alle = (c.ladder || []).map((st) => st.ability).filter((a) => a && ABILITIES[a]);
  const zeigen = alle.slice(0, 5);
  return <div id="ziel" data-fertig="1" style={{ width: 210, padding: 0, background: T.bg, fontFamily: "Georgia, serif", textAlign: "center" }}>
    <HofKachel img={bild} artId={id} kind={c.kind} hero={id === "gambit"} lvl={lv} stufe={lv}
      werte={kachelWerteFuer(profil, id)} name={c.nameDe} glow={false} gewaehlt={false} talente={[]}
      unten={<div style={{ marginTop: 7 }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <MoveDiagram kind={c.kind} moveSpec={c.moveSpec} breite={"132px"} talente={gelernt} />
        </div>
        {zeigen.length > 0 && <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 8 }}>
          {zeigen.map((a) => <span key={a} style={{ width: 24, height: 24, display: "grid", placeItems: "center", borderRadius: 7,
            background: "rgba(12,8,22,.78)", border: `1px solid rgba(233,207,138,${gelernt.includes(a) ? ".8" : ".3"})`,
            opacity: gelernt.length && !gelernt.includes(a) ? 0.55 : 1 }}>
            <AbilityIcon id={a} size={18} /></span>)}
        </div>}
      </div>} />
  </div>;
}

/* ── DAS ZUGBILD EINER FAEHIGKEIT ───────────────────────────────────────────
   Dasselbe Raster, das die Leiter im Hofstaat neben jede Zug-Faehigkeit setzt:
   die Grundgangart in den Farben des Bretts (Blau zieht, Gelb springt), gruen
   obenauf, was die Faehigkeit hinzugibt. */
function Zug({ art, extra }) {
  return <div id="ziel" data-fertig={ABILITY_MOVE[extra] ? "1" : "0"} data-fehler={ABILITY_MOVE[extra] ? "" : "unbekannte Faehigkeit " + extra}
    style={{ width: 242, background: "#0b0d18" }}>
    <MoveDiagram kind={art} moveSpec={null} extra={ABILITY_MOVE[extra]} breite={"242px"} />
  </div>;
}

/* ── DAS BRETT EINER STATION, NACH EIN PAAR ZUEGEN ──────────────────────────
   Wie die Aufstellungskammer (aufstellungFuer), nur mit waehlbarer Grundreihe
   und mit Zuegen: jeder Zug kommt aus legalMovesFrom und geht durch applyMove,
   es steht also nichts auf dem Brett, was im Spiel nicht stehen koennte. */
const W = 8;
const sq = (n) => (n.charCodeAt(0) - 97) + (Number(n.slice(1)) - 1) * W;
function Brett({ station }) {
  const node = nodeById(station);
  const lg = node.league || 1;
  let profil = withProgressPct(defaultProfile(), Number(Q.get("stand") || 50), lg);
  const match0 = buildStageMatch(station, profil);
  const map = mapById(match0.map);
  const heer = (Q.get("heer") || "").split(",").filter(Boolean);
  if (heer.length === 8) {
    const figuren = heer.filter((e) => !e.startsWith("boss:"));
    const bosse = heer.filter((e) => e.startsWith("boss:")).map((e) => e.slice(5));
    profil = { ...profil,
      campaign: { ...profil.campaign, unlocked: [...new Set([...(profil.campaign.unlocked || []), ...figuren])],
        bribedBosses: [...new Set([...(profil.campaign.bribedBosses || []), ...bosse])] },
      loadout: { ...profil.loadout, formations: { ...(profil.loadout?.formations || {}), [map.id]: heer } } };
  }
  const match = buildStageMatch(station, profil);
  let s = createGame(buildArmy(profil, map), match.aiArmy, { seed: 1, map, rules: match.rules });
  const fehler = [];
  let letzter = null;
  for (const z of (Q.get("zuege") || "").split(",").filter(Boolean)) {
    const von = sq(z.slice(0, 2)), nach = sq(z.slice(2, 4));
    const m = legalMovesFrom(s, von).find((x) => x.to === nach);
    if (!m) { fehler.push(`${z}: kein Zug (${legalMovesFrom(s, von).map((x) => x.to).join(" ")})`); break; }
    s = applyMove(s, m); letzter = m;
  }
  const reihe = [];
  for (let f = 0; f < 8; f++) { const p = s.board[f]; reihe.push(p ? (p.charId || p.bossId || p.kind) : "-"); }
  const biom = ((lg - 1) % 12) + 1;
  const breite = Number(Q.get("breite")) || 460;
  return <div id="ziel" data-fertig={fehler.length ? "0" : "1"} data-fehler={fehler.join(" | ")} data-regeln={match.rules} data-reihe={reihe.join(",")}
    style={{ position: "relative", width: breite + 16, padding: "40px 8px 10px", background: "#05060a", overflow: "hidden", isolation: "isolate" }}>
    {Q.get("grund") !== "0" && <BrettHintergrund liga={biom} />}
    <div style={{ position: "relative", zIndex: 2, width: breite, margin: "0 auto" }}>
      <BoardView lang="de" state={s} onMove={() => {}} interactive={false} lastMove={Q.get("spur") === "1" ? letzter : null}
        maxPx={breite} feld={FELD_KAPITEL[biom - 1]} feldDunkel={null} showLevel artStyle="painted" ruhig />
    </div>
  </div>;
}

function Wurzel() {
  try {
    if (Q.get("figur")) return <Figur pid={Q.get("figur")} />;
    if (Q.get("karte")) return <Karte id={Q.get("karte")} gelernt={(Q.get("gelernt") || "").split(",").filter(Boolean)} />;
    if (Q.get("zug")) return <Zug art={Q.get("zug")} extra={Q.get("extra")} />;
    if (Q.get("brett")) return <Brett station={Q.get("brett")} />;
  } catch (e) {
    return <div id="ziel" data-fertig="0" data-fehler={String(e?.stack || e)} style={{ color: "#f88", font: "12px monospace", whiteSpace: "pre-wrap" }}>{String(e?.stack || e)}</div>;
  }
  return <div id="ziel" data-fertig="0" data-fehler="keine Lage gewaehlt">?</div>;
}

const wurzel = document.createElement("div");
document.body.appendChild(wurzel);
createRoot(wurzel).render(<Wurzel />);
