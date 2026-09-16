/* ── DIE BUNDTAFEL (v1.16.0) ─────────────────────────────────────────────────
   Besitzerentscheid: die Kachel im Hofstaat traegt nur den Namen. Alles
   Weitere - welchem Bund eine Figur angehoert, welches Kapitel ein
   Grossmeister haelt, zu welcher Gruppe ein Monster zaehlt, und woher es
   ueberhaupt kommt - steht erst beim Antippen, auf dem Blatt.

   Die Tafel spricht dieselbe Sprache wie die Kachel: ein Streifen der Kulisse,
   darueber die Zeile in Kapitaelchen, darunter die Regel in der Serifen-
   stimme. Bei einem Bund stehen die Mitglieder mit ihrer Stufe daneben -
   wer die Zehn hat, glimmt; sind alle da, ist der Bund erwacht.

   RICHTLINIEN, die hier zum ersten Mal festgehalten sind (Besitzer: "daraus
   Guidelines ableiten"):
     1. Kachel = Name, Werte, Stufe, Talente. Blatt = alles andere.
     2. Die Kulisse einer Figur ist ihr Erkennungszeichen; sie kehrt auf dem
        Blatt als Streifen wieder, nie als Vollbild hinter Text.
     3. Ueberschriften in Kapitaelchen (letterSpacing .1em), Regeln in Serife,
        Zahlen in der Kreisform der Stufe.
     4. Gold ist erreicht (Hoechststufe, erwacht), Violett ist unterwegs,
        Grau ist fremd. */
import { BUENDE, bundVon, bundErwacht } from "../../content/buende.js";
import { CHARACTERS, LEAGUE_BOSSES } from "../../content/index.js";
import { characterLevel, maxLevelFor } from "../../meta/index.js";
import { kulisseFuer, MONSTER_GRUPPE } from "./kulissen.js";
import { KULISSE_URL } from "./KulissenBilder.jsx";
import { paintedById } from "./board/paintedArt.js";

const ROEMISCH = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const GRUPPE_NAME = { brut: ["Brut", "Brood"], untot: ["Untot", "Undead"], gesindel: ["Gesindel", "Rabble"], gemaeuer: ["Gemäuer", "Masonry"] };
const GOLD = "#e9cf8a", VIOLETT = "#b39ddb", GRAU = "#8d8776", INK = "#cfc9b4";

function Streifen({ name, children }) {
  const src = name ? KULISSE_URL[name] : null;
  return <div data-bundtafel={name || "keine"} style={{ position: "relative", isolation: "isolate", overflow: "hidden", borderRadius: 12,
    border: "1px solid rgba(233,207,138,.28)", padding: "10px 12px 11px", marginTop: 10,
    background: "linear-gradient(180deg, rgba(20,13,36,.9), rgba(10,7,19,.96))" }}>
    {src && <img src={src} alt="" aria-hidden draggable={false} data-gg-still="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
      objectFit: "cover", objectPosition: "center 35%", opacity: .32, zIndex: -1, pointerEvents: "none" }} />}
    {src && <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: -1, pointerEvents: "none",
      background: "linear-gradient(90deg, rgba(10,7,19,.92) 0%, rgba(10,7,19,.6) 55%, rgba(10,7,19,.35) 100%)" }} />}
    {children}
  </div>;
}

const Kopf = ({ links, rechts, farbe = GOLD }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
    <span className="gg-serif" style={{ fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: farbe }}>{links}</span>
    {rechts && <span className="gg-serif" style={{ fontSize: 10.5, letterSpacing: ".06em", color: INK, whiteSpace: "nowrap" }}>{rechts}</span>}
  </div>
);

/* Herkunft: dieselben Worte, die frueher auf der Kachel standen */
export function herkunftsWort(status, en) {
  return { eigen: en ? "In your court" : "Im Hof", verbuendet: en ? "Allied" : "Verbündet",
    begegnet: en ? "Met in battle" : "Begegnet", gesichtet: en ? "Sighted" : "Gesichtet" }[status] || "";
}

export function BundTafel({ profile, charId = null, bossId = null, status = null, en = false }) {
  /* ── eine Figur mit Bund ── */
  if (charId) {
    const bundId = bundVon(charId);
    if (!bundId) {
      return <Streifen name={kulisseFuer({ charId })}>
        <Kopf links={en ? "No covenant" : "Ohne Bund"} rechts={status ? herkunftsWort(status, en) : null} farbe={GRAU} />
        <div className="gg-serif" style={{ marginTop: 4, fontSize: 12, lineHeight: 1.4, color: INK }}>
          {charId === "dragon" ? (en ? "A captured beast. It answers to no covenant." : "Ein erbeutetes Ungeheuer. Es hört auf keinen Bund.")
            : (en ? "Stands alone. Its strength is its own." : "Steht für sich. Seine Stärke gehört ihm allein.")}
        </div>
      </Streifen>;
    }
    const b = BUENDE[bundId];
    const stufe = (cid) => characterLevel(profile, cid) || 1;
    const erwacht = bundErwacht(bundId, stufe, maxLevelFor);
    const voll = b.figuren.filter((cid) => stufe(cid) >= maxLevelFor(cid)).length;
    return <Streifen name={`bund-${bundId}`}>
      <Kopf links={`${en ? "Covenant" : "Bund"} · ${en ? b.nameEn : b.nameDe}`}
        rechts={erwacht ? (en ? "awakened" : "erwacht") : `${voll} ${en ? "of" : "von"} ${b.figuren.length} ${en ? "at peak" : "auf Höchststufe"}`}
        farbe={erwacht ? GOLD : VIOLETT} />
      <div className="gg-serif" style={{ marginTop: 4, fontSize: 12, lineHeight: 1.4, color: INK }}>{en ? b.regelEn : b.regelDe}</div>
      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        {b.figuren.map((cid) => {
          const ch = CHARACTERS[cid]; const l = stufe(cid); const top = l >= maxLevelFor(cid); const selbst = cid === charId;
          const img = paintedById(cid);
          return <div key={cid} data-mitglied={cid} data-stufe={l} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 7px 3px 3px", borderRadius: 999,
            background: "rgba(10,7,19,.7)", border: `1px solid ${top ? GOLD : selbst ? VIOLETT : "rgba(179,157,219,.35)"}66`,
            boxShadow: top ? "0 0 8px rgba(233,207,138,.25)" : "none" }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", overflow: "hidden", display: "grid", placeItems: "center",
              background: "rgba(34,22,60,.9)", flex: "0 0 auto" }}>
              {img && <img src={img} alt="" style={{ width: 26, height: 26, objectFit: "contain", objectPosition: "top", marginTop: 4 }} />}
            </span>
            <span style={{ fontSize: 11, color: selbst ? "#f0e8cc" : INK, fontWeight: selbst ? 800 : 600 }}>{en ? ch.nameEn : ch.nameDe}</span>
            <span style={{ width: 17, height: 17, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: "17px",
              font: "600 9px Georgia, serif", color: top ? "#17110a" : "#d8c4ff",
              background: top ? GOLD : "radial-gradient(circle at 50% 40%, #241a3e, #120c22)", border: `1px solid ${top ? GOLD : "rgba(167,139,250,.75)"}` }}>{l}</span>
          </div>;
        })}
      </div>
      {b.storyDe && <div className="gg-serif" style={{ marginTop: 8, fontSize: 11.5, lineHeight: 1.4, color: "#b9b295", fontStyle: "italic" }}>„{en ? b.storyEn : b.storyDe}“</div>}
    </Streifen>;
  }
  /* ── ein Grossmeister oder ein Monster ── */
  if (bossId) {
    const kap = LEAGUE_BOSSES.indexOf(bossId);
    const gruppe = MONSTER_GRUPPE[bossId];
    const links = kap >= 0 ? `${en ? "Grandmaster" : "Großmeister"} · ${en ? "Chapter" : "Kapitel"} ${ROEMISCH[kap] || kap + 1}`
      : gruppe ? `${en ? "Group" : "Gruppe"} · ${GRUPPE_NAME[gruppe]?.[en ? 1 : 0] || gruppe}` : (en ? "Monster" : "Ungeheuer");
    const text = kap >= 0
      ? (en ? "Keeper of a chapter. Beat it, and it may follow you." : "Hält ein Kapitel. Wer es schlägt, kann es in den Hof holen.")
      : { brut: [en ? "Brood of the wild: nests, chitin, hunger." : "Brut der Wildnis: Nester, Chitin, Hunger."],
          untot: [en ? "What should have stayed buried." : "Was begraben bleiben sollte."],
          gesindel: [en ? "Alleys, smoke, and stolen goods." : "Gassen, Rauch und Diebesgut."],
          gemaeuer: [en ? "Stone that learned to fight back." : "Stein, der sich zu wehren gelernt hat."] }[gruppe]?.[0] || "";
    return <Streifen name={kulisseFuer({ bossId })}>
      <Kopf links={links} rechts={status ? herkunftsWort(status, en) : null} farbe={kap >= 0 ? GOLD : VIOLETT} />
      <div className="gg-serif" style={{ marginTop: 4, fontSize: 12, lineHeight: 1.4, color: INK }}>{text}</div>
    </Streifen>;
  }
  return null;
}
