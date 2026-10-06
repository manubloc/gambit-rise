/* ── DIE UEBERSICHT ALLER FIGUREN, BESTIEN UND BUENDE (v1.91.0) ────────────────
   Besitzerauftrag 6.10.2026: "mach mir, wenn du mit allem fertig bist, eine
   saubere Uebersicht mit Figuren, Zuegen und natuerlich den Faehigkeiten."

   Sie wird aus dem ECHTEN Spiel gebaut, nicht von Hand geschrieben: die Karte
   ist die HofKachel des Hofstaats, das Zugbild das MoveDiagram des Blatts, die
   Werte kommen aus kachelWerteFuer/bossSpecLeveled, die Faehigkeiten aus der
   Leiter, der Fundort aus der Kampagne. Aendert sich das Spiel, aendert sich
   die Uebersicht - `node tools/uebersicht-fotos.mjs <ordner>` baut sie neu.

   Lagen (Abfrage in der Adresse):
     ?bund=<id>            ein Bund mit seinen Figuren ("ohne" = Bauer, Gambit, Drache)
     ?bosse=meister        die vierzehn Grossmeister in Kapitelfolge
     ?bosse=bestien&teil=N die Bestien in der Folge ihres ersten Auftritts (je 7)
     ?kapitel=1            was ein Kapitel an Figuren, Bestien und Meistern bringt */
import { createRoot } from "react-dom/client";
import { GLOBAL_CSS, T } from "../src/app/ui/theme.js";
import { setAnimAn } from "../src/app/ui/anim.js";
import { paintedById, paintedForPiece } from "../src/app/ui/board/paintedArt.js";
import { HofKachel, MoveDiagram, kachelWerteFuer, describeMoves } from "../src/app/ui/screens/ArmyScreen.jsx";
import { AbilityIcon } from "../src/app/ui/AbilityIcons.jsx";
import { rohrAnteile } from "../src/app/ui/board/PieceGlyph.jsx";
import { CHARACTERS, ABILITIES, BOSSES, CAMPAIGN, LEAGUE_BOSSES, KAPITEL_TROPHAEE, auraText, istBestechlich } from "../src/content/index.js";
import { BUENDE, bundVon } from "../src/content/buende.js";
import { stufenText, maxStufe } from "../src/content/abilities.js";
import { ZIEL_PROFIL } from "../src/core/domain/constants.js";
import { defaultProfile, withProgressPct, maxLevelFor, bossSpecLeveled, BOSS_MAX_LEVEL, monsterBestechPreis, ZIEL_PROFIL_BOSS } from "../src/meta/index.js";

const Q = new URLSearchParams(location.search);
setAnimAn(false);
const style = document.createElement("style");
style.textContent = GLOBAL_CSS + "\nhtml,body{margin:0;background:#0b0d18}";
document.head.appendChild(style);

const ROEM = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
/* ein Stand, in dem alles auf Hoechststufe steht - die Karte zeigt, wohin eine Figur waechst */
const profil = (() => {
  const p = withProgressPct(defaultProfile(), 100, 12);
  const levels = {}; for (const id of Object.keys(CHARACTERS)) levels[id] = maxLevelFor(id);
  return { ...p, pieces: { ...(p.pieces || {}), levels } };
})();
const figurStation = (id) => CAMPAIGN.find((n) => n.boss && n.boss.piece === id && n.league <= 12);
const bossStation = (id) => CAMPAIGN.filter((n) => n.boss && n.boss.pure === id && n.league <= 12).sort((a, b) => a.league - b.league)[0];
const fundort = (id) => {
  const c = CHARACTERS[id];
  if (c.unlock && c.unlock.type === "start") return "von Anfang an dabei";
  const n = figurStation(id);
  return n ? `Kapitel ${ROEM[n.league]} · ${n.place}${n.haupt ? "" : " (Nebenweg)"}${(n.boss.wins || 1) > 1 ? ` · ${n.boss.wins} Siege` : ""}` : "—";
};

function Faehigkeiten({ leiter, monster }) {
  return <div style={{ display: "grid", gap: 5, marginTop: 8 }}>
    {leiter.filter((r) => r.ability && ABILITIES[r.ability]).map((r) => {
      const ab = ABILITIES[r.ability];
      const st = maxStufe(r.ability);
      return <div key={r.ability} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
        <span style={{ flex: "0 0 auto", marginTop: 1 }}><AbilityIcon id={r.ability} size={22} /></span>
        <div style={{ minWidth: 0, fontSize: 11, lineHeight: 1.38, color: "#cfc9b4" }}>
          <b style={{ color: "#f1e6c4", fontSize: 12 }}>{ab.nameDe}</b>
          <span style={{ color: "#9a947c" }}> · {r.geschenkt ? "geschenkt" : `ab Stufe ${r.level}`}{ab.once ? " · einmal je Partie" : ""}{ab.hpOnly ? " · nur mit Lebenspunkten" : ""}</span>
          <div>{ab.descDe}</div>
          {st > 1 && !monster && <div style={{ color: "#8f8a73" }}>Stufen: {[1, 2, 3].slice(0, st).map((n) => stufenText(r.ability, n, false)).filter(Boolean).join(" → ")}</div>}
        </div>
      </div>;
    })}
  </div>;
}

function FigurKarte({ id }) {
  const c = CHARACTERS[id];
  const lv = maxLevelFor(id);
  const bild = paintedForPiece({ kind: c.kind, color: "w", hero: id === "gambit", level: lv, tier: id === "gambit" ? 6 : id === "pawn" ? 3 : undefined });
  const z = ZIEL_PROFIL[c.kind];
  return <div data-karte={id} style={{ width: 372, padding: 10, borderRadius: 14, background: "rgba(16,20,36,.92)", border: `1px solid ${T.line}` }}>
    <div style={{ display: "flex", gap: 10 }}>
      <div style={{ width: 132, flex: "0 0 auto" }}>
        <HofKachel img={bild} artId={id} kind={c.kind} hero={id === "gambit"} lvl={lv} stufe={lv}
          werte={kachelWerteFuer(profil, id)} name={c.nameDe} glow talente={[]} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 10.5, color: "#c9b26a", letterSpacing: ".06em" }}>{fundort(id)}</div>
        <div style={{ fontSize: 11.5, color: "#e4dcc6", margin: "3px 0 6px" }}>
          {id === "gambit" ? <>Höchststufe {lv}: dein Held – <b style={{ color: "#f1e6c4" }}>36 Punkte</b> statt 24, frei auf Leben und Angriff verteilt</>
            : z ? <>Höchststufe {lv}: <b style={{ color: "#ff8f8f" }}>{z[0]} Leben</b> · <b style={{ color: "#8fc1ff" }}>{z[1]} Angriff</b></> : null}
        </div>
        <MoveDiagram kind={c.kind} moveSpec={c.moveSpec} breite={"128px"} />
      </div>
    </div>
    <div style={{ fontSize: 11.5, color: "#e4dcc6", marginTop: 7, lineHeight: 1.4 }}><b style={{ color: "#c9b26a" }}>Zug:</b> {describeMoves(c, false)}</div>
    <div style={{ fontSize: 11, fontStyle: "italic", color: "#a9a28a", marginTop: 7, lineHeight: 1.4 }}>{c.flavorDe}</div>
    <Faehigkeiten leiter={c.ladder || []} />
  </div>;
}

function BossKarte({ b }) {
  const spec = bossSpecLeveled(b, BOSS_MAX_LEVEL);
  const meister = LEAGUE_BOSSES.includes(b.id);
  const kap = KAPITEL_TROPHAEE.indexOf(b.id) + 1;
  const n = bossStation(b.id);
  const z = ZIEL_PROFIL_BOSS[b.id] || [spec.hp, spec.atk];
  const woher = kap ? `Meister von Kapitel ${ROEM[kap]} · der Sieg gibt ihn dir`
    : n ? `Kapitel ${ROEM[n.league]} · ${n.place}${n.haupt ? "" : " (Nebenweg)"}` : "—";
  return <div data-karte={b.id} style={{ width: 372, padding: 10, borderRadius: 14, background: "rgba(16,20,36,.92)", border: `1px solid ${meister ? "rgba(167,139,250,.7)" : T.line}` }}>
    <div style={{ display: "flex", gap: 10 }}>
      <div style={{ width: 132, flex: "0 0 auto" }}>
        <HofKachel img={paintedById("boss-" + b.id)} bossId={b.id} glow meister={meister} zier={meister}
          werte={rohrAnteile({ hp: spec.hp, atk: spec.atk, level: BOSS_MAX_LEVEL, maxLevel: BOSS_MAX_LEVEL })} ton={b.accent || null}
          stufe={BOSS_MAX_LEVEL} name={b.nameDe} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 10.5, color: "#c9b26a", letterSpacing: ".06em" }}>{woher}</div>
        <div style={{ fontSize: 11.5, color: "#e4dcc6", margin: "3px 0 2px" }}>
          Höchststufe 5: <b style={{ color: "#ff8f8f" }}>{z[0]} Leben</b> · <b style={{ color: "#8fc1ff" }}>{z[1]} Angriff</b></div>
        <div style={{ fontSize: 10.5, color: "#9a947c", marginBottom: 5 }}>
          {meister ? "steht anstelle der Dame" : "steht auf einem freien Platz"}{istBestechlich(b.id) ? ` · Bestechen ${monsterBestechPreis(b)} Gold` : ""}</div>
        <MoveDiagram kind={null} moveSpec={b.moveSpec} breite={"128px"} />
      </div>
    </div>
    <div style={{ fontSize: 11.5, color: "#e4dcc6", marginTop: 7, lineHeight: 1.4 }}><b style={{ color: "#c9b26a" }}>Zug:</b> {describeMoves({ id: "boss-" + b.id, moveSpec: b.moveSpec }, false)}</div>
    {b.flavorDe && <div style={{ fontSize: 11, fontStyle: "italic", color: "#a9a28a", marginTop: 7, lineHeight: 1.4 }}>{b.flavorDe}</div>}
    {auraText(b.aura, false) && <div style={{ marginTop: 7, padding: "6px 8px", borderRadius: 9, border: "1px solid rgba(167,139,250,.55)", background: "rgba(30,24,52,.7)", fontSize: 11.5, color: "#e4dcc6" }}>
      <b style={{ color: "#c3aaf5", letterSpacing: ".1em", fontSize: 10 }}>AURA</b> · {auraText(b.aura, false)}</div>}
    <Faehigkeiten leiter={b.ladder || []} monster />
  </div>;
}

const Kopf = ({ titel, unter, text }) => <div style={{ marginBottom: 12 }}>
  <div className="gg-serif" style={{ fontSize: 26, color: T.gold, letterSpacing: ".06em" }}>{titel}</div>
  {unter && <div style={{ fontSize: 13, color: "#c9b26a", marginTop: 2 }}>{unter}</div>}
  {text && <div style={{ fontSize: 13.5, color: "#e4dcc6", marginTop: 6, lineHeight: 1.45, maxWidth: 760 }}>{text}</div>}
</div>;
const Raster = ({ children, spalten = 3 }) => <div style={{ display: "grid", gridTemplateColumns: `repeat(${spalten}, 372px)`, gap: 12, alignItems: "start" }}>{children}</div>;
const Blatt = ({ children, spalten = 3 }) => <div id="ziel" data-fertig="1" style={{ boxSizing: "content-box", width: spalten * 372 + (spalten - 1) * 12, padding: 22, background: "#0b0d18", fontFamily: "Georgia, serif" }}>{children}</div>;

function Wurzel() {
  try {
    const bund = Q.get("bund");
    if (bund === "ohne") {
      const ids = Object.keys(CHARACTERS).filter((id) => !bundVon(id));
      return <Blatt spalten={3}><Kopf titel="Ohne Bund" unter="Bauer, Gambit und der Drache" text="Sie gehören zu keinem Bund – der Bauer und der Gambit stehen in jeder Aufstellung, der Drache deckt vier Felder und kommt in Kapitel VII." />
        <Raster>{ids.map((id) => <FigurKarte key={id} id={id} />)}</Raster></Blatt>;
    }
    if (bund) {
      const b = BUENDE[bund];
      const sp = Math.min(3, Math.max(2, b.figuren.length));
      return <Blatt spalten={sp}><Kopf titel={"Bund " + b.nameDe} unter={b.figuren.map((f) => CHARACTERS[f].nameDe).join(" · ")}
        text={<><b style={{ color: "#c3aaf5" }}>Wirkt, sobald alle in der Aufstellung stehen:</b> {b.regelDe}</>} />
        <Raster spalten={sp}>{b.figuren.map((id) => <FigurKarte key={id} id={id} />)}</Raster></Blatt>;
    }
    const bosse = Q.get("bosse");
    if (bosse === "meister") {
      const teil = Number(Q.get("teil") || 1);
      const alle = LEAGUE_BOSSES.map((id) => BOSSES.find((b) => b.id === id));
      const liste = alle.slice((teil - 1) * 6, teil * 6 + (teil === 2 ? 2 : 0));
      return <Blatt><Kopf titel={`Die vierzehn Großmeister (${teil} von 2)`} unter="je Kapitel einer, dazu Morwen und Thalor mitten in Kapitel VI und IX"
        text="Ein Großmeister steht anstelle der Dame und trägt eine Aura, die seinen ganzen Hof stärkt. Wer ein Kapitel gewinnt, bekommt dessen Meister." />
        <Raster>{liste.map((b) => <BossKarte key={b.id} b={b} />)}</Raster></Blatt>;
    }
    if (bosse === "bestien") {
      const teil = Number(Q.get("teil") || 1);
      const alle = BOSSES.filter((b) => !LEAGUE_BOSSES.includes(b.id))
        .sort((x, y) => ((bossStation(x.id)?.league || 99) - (bossStation(y.id)?.league || 99)) || x.id.localeCompare(y.id));
      const liste = alle.slice((teil - 1) * 9, teil * 9 + (teil === 3 ? 1 : 0));
      return <Blatt><Kopf titel={`Die ${alle.length} Bestien (${teil} von 3)`} unter="in der Folge ihres ersten Auftritts – die ersten erst in Kapitel III"
        text="Eine Bestie steht auf einem freien Platz (anstelle von Turm, Läufer oder Springer). Wer sie besiegt hat, kann sie mit Gold bestechen." />
        <Raster>{liste.map((b) => <BossKarte key={b.id} b={b} />)}</Raster></Blatt>;
    }
  } catch (e) {
    return <div id="ziel" data-fertig="0" data-fehler={String(e?.stack || e)} style={{ color: "#f88", font: "12px monospace", whiteSpace: "pre-wrap" }}>{String(e?.stack || e)}</div>;
  }
  return <div id="ziel" data-fertig="0" data-fehler="keine Lage gewaehlt">?</div>;
}

const wurzel = document.createElement("div");
document.body.appendChild(wurzel);
createRoot(wurzel).render(<Wurzel />);
