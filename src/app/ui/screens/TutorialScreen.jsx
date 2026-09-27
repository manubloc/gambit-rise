// The academy — a skippable, step-through tutorial in the world's own voice:
// parchment cards, drawn glyphs, one idea per step. Reachable from the hub,
// never forced; "skip" is always one tap away.
import { useState } from "react";
import { T } from "../theme.js";
import { Button } from "../primitives.jsx";
import { PieceArt } from "../board/PieceArt.jsx";
import { ItemIcon } from "../ItemIcon.jsx";
import { GoldSkullIc, SkillIc, LevelIc, CoinIc } from "../icons.jsx";
import { AbilityIcon } from "../AbilityIcons.jsx";

/* ── v1.89.0 (Besitzer: "Der Schnellkurs muss vor allem ueberarbeitet werden.
   Es sind noch alte Bilder drin - gerade diese Lebensbubbles und das Zeug.
   Achte darauf, dass es selbst von dir gezeichnete Dinge sind, und versuch
   die Texte wirklich kurz zu halten."): acht Lektionen statt neun, jede zwei
   bis drei Saetze, auf dem Stand von heute (zwoelf Kapitel, Zahlen am Sockel
   statt Kugeln, Talentband, Haendler, Zweier-Grenze der Aufstellung). Die
   Bilder sind Vektor-Zeichen aus icons.jsx, PieceArt und AbilityIcons -
   kein Juwel, kein Foto. Die Woerter "Kampfkraft", "Rueckprall" und "ZURUECK"
   bleiben stehen: test_ui.jsx sucht sie. */
const ZAHL = (farbe, n, gross = 26) => <span style={{ font: `800 ${gross}px/1 Georgia, serif`, color: farbe }}>{n}</span>;
const STEPS = [
  {
    de: { title: "Das Spiel", text: "Schach mit Lebenspunkten: Jede Figur trägt Leben und Kampfkraft. Wer angreift, macht Schaden — erst bei null verlässt die Figur das Brett. Der Gambit, der goldene Bauer, ist dein Held." },
    en: { title: "The game", text: "Chess with life points: every piece carries life and attack strength. Attacking deals damage — a piece only leaves the board at zero. The Gambit, the golden pawn, is your hero." },
    art: <div style={{ width: 64, height: 64 }}><PieceArt kind="P" fill="#c9a45c" rim="#f0dfae" detail="#59421a" size="100%" level={1} hero /></div>,
  },
  {
    de: { title: "Die Zahlen am Sockel", text: "Unter jeder Figur stehen zwei Zahlen: ROT ihr Leben, BLAU ihre Kampfkraft. Beide wachsen mit den Stufen im Hofstaat." },
    en: { title: "The numbers on the plinth", text: "Two numbers sit beneath every piece: RED its life, BLUE its attack strength. Both grow with the levels in your court." },
    art: <div style={{ display: "flex", gap: 14, alignItems: "baseline" }}>{ZAHL("#ffb3aa", 5)}{ZAHL("#b6cdff", 3)}</div>,
  },
  {
    de: { title: "Angriff & Rückprall", text: "Ein Zug auf ein besetztes Feld ist ein Angriff: Deine Kampfkraft trifft sein Leben. Hält der Gegner stand, springt deine Figur ZURÜCK — erst wenn sein letzter Punkt fällt, rückst du vor. Mit 3 Kraft gegen 5 Leben brauchst du zwei Angriffe." },
    en: { title: "Strike & rebound", text: "Moving onto an occupied square is an attack: your strength meets their life. If the defender holds, your piece springs BACK — only when their last point falls do you advance. With 3 strength against 5 life you need two strikes." },
    art: <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>{ZAHL("#b6cdff", 3, 22)}<span style={{ color: "#8a6f4d", fontSize: 18 }}>→</span>{ZAHL("#ffb3aa", 5, 22)}<span style={{ color: "#8a6f4d", fontSize: 18 }}>→</span>{ZAHL("#ffb3aa", 2, 22)}</div>,
  },
  {
    de: { title: "Talente & Zauber", text: "Im Hofstaat lernen Figuren Fähigkeiten. Im Gefecht liegt das Talentband unter dem Brett: Kachel antippen, leuchtendes Feld wählen. Jeder Zauber wirkt nur einmal je Partie." },
    en: { title: "Talents & spells", text: "Pieces learn abilities in the court. In battle the talent band sits below the board: tap a tile, pick the glowing square. Each spell works only once per match." },
    art: <div style={{ display: "flex", gap: 10, alignItems: "center" }}><AbilityIcon id="teleport" size={30} /><AbilityIcon id="ranged_shot" size={30} /><AbilityIcon id="knight_longleap" size={30} /></div>,
  },
  {
    de: { title: "Die Kampagne", text: "Zwölf Kapitel, jedes eine Karte voller Stationen. Besiegte Herausforderer treten deinem Hofstaat bei; am Ende jedes Kapitels wartet ein Meister." },
    en: { title: "The campaign", text: "Twelve chapters, each a map full of stations. Beaten challengers join your court; a master waits at the end of every chapter." },
    art: <div style={{ display: "flex", gap: 12, alignItems: "center" }}><LevelIc size={26} /><GoldSkullIc size={26} /></div>,
  },
  {
    de: { title: "Hofstaat & Aufstellung", text: "Skillpunkte ✦ heben deine Figuren auf neue Stufen. In der Aufstellung wählst du deine Reihe: Turm, Läufer und Springer höchstens zweimal, jede andere Figur einmal — und nur ein Meister darf den Platz der Dame nehmen." },
    en: { title: "Court & formation", text: "Skill points ✦ raise your pieces to new levels. In the formation you pick your rank: rook, bishop and knight at most twice, every other piece once — and only a master may take the queen's place." },
    art: <div style={{ display: "flex", gap: 10, alignItems: "center" }}><SkillIc size={26} /><LevelIc size={26} /></div>,
  },
  {
    de: { title: "Gold & Händler", text: "Siege füllen die Schatzkammer. Beim Händler gibt es Lebenstränke, Zeitenwender, Mauern und Schlüssel — jeder Einsatz im Gefecht kostet den Zug." },
    en: { title: "Gold & merchant", text: "Victories fill the treasury. The merchant sells life potions, time-turners, walls and keys — every use in battle costs your turn." },
    art: <div style={{ display: "flex", gap: 10, alignItems: "center" }}><CoinIc size={30} /><ItemIcon id="potion" size={34} /><ItemIcon id="hourglass" size={34} /></div>,
  },
  {
    de: { title: "Schnell & zu zweit", text: "Schnelles Spiel: sofort aufs Brett — klassisch oder mit Lebenspunkten, gegen die KI oder zu zweit an einem Gerät. Und nun: Ein Reich wartet auf seinen Strategen." },
    en: { title: "Quick & together", text: "Quick play: straight onto the board — classic or with life points, against the AI or two players on one device. And now: a realm awaits its strategist." },
    art: <div style={{ width: 56, height: 56 }}><PieceArt kind="K" fill="#c9a45c" rim="#f0dfae" detail="#59421a" size="100%" level={1} /></div>,
  },
];

// ── the chess school: how each piece moves, drawn as a 5×5 slate — gold dots
// are quiet steps, red-ringed dots are squares it attacks. ───────────────────
function MoveDiagram({ kind, dots, hits = [] }) {
  const C = 30, N = 5;
  const sq = (x, y) => ((x + y) % 2 === 0 ? "#20283e" : "#161d30");
  const px = 150, cell = px / N;
  return (
    <div style={{ position: "relative", width: px, height: px }}>
      <svg viewBox={`0 0 ${N * C} ${N * C}`} width={px} height={px} style={{ borderRadius: 10, display: "block" }}>
        {Array.from({ length: N * N }).map((_, i) => {
          const x = i % N, y = Math.floor(i / N);
          return <rect key={i} x={x * C} y={y * C} width={C} height={C} fill={sq(x, y)} />;
        })}
        {dots.map(([x, y], i) => <circle key={"d" + i} cx={x * C + C / 2} cy={y * C + C / 2} r={5.5} fill="#c9a45c" opacity=".9" />)}
        {hits.map(([x, y], i) => <circle key={"h" + i} cx={x * C + C / 2} cy={y * C + C / 2} r={6.5} fill="none" stroke="#c25b66" strokeWidth="2.4" />)}
      </svg>
      <div style={{ position: "absolute", left: 2 * cell + 2, top: 2 * cell + 1, width: cell - 4, height: cell - 4 }}>
        <PieceArt kind={kind} fill="#c9a45c" rim="#f0dfae" detail="#59421a" size="100%" level={1} />
      </div>
    </div>
  );
}

const ray = (dx, dy) => Array.from({ length: 4 }, (_, k) => [2 + dx * (k + 1), 2 + dy * (k + 1)]).filter(([x, y]) => x >= 0 && x < 5 && y >= 0 && y < 5);
const SCHOOL = [
  { kind: "P", dots: [[2, 1], [2, 0]], hits: [[1, 1], [3, 1]],
    de: { title: "Der Bauer", text: "Zieht ein Feld geradeaus (aus der Grundstellung zwei) — angreifen kann er aber nur schräg vorwärts. Erreicht ein Bauer die letzte Reihe, wird er befördert. Der Gambit ist ein Bauer mit einem großen Schicksal." },
    en: { title: "The pawn", text: "Moves one square straight ahead (two from its home row) — but it only attacks diagonally forward. Reaching the last rank, a pawn is promoted. The Gambit is a pawn with a great destiny." } },
  { kind: "N", dots: [[1, 0], [3, 0], [0, 1], [4, 1], [0, 3], [4, 3], [1, 4], [3, 4]],
    de: { title: "Der Springer", text: "Springt im L: zwei Felder in eine Richtung, eines zur Seite — als einzige Figur über alles hinweg. Stark in vollen Stellungen, in denen Läufer und Türme feststecken." },
    en: { title: "The knight", text: "Leaps in an L: two squares one way, one to the side — the only piece that jumps over everything. Strong in crowded positions where bishops and rooks are stuck." } },
  { kind: "B", dots: [...ray(1, 1), ...ray(-1, 1), ...ray(1, -1), ...ray(-1, -1)],
    de: { title: "Der Läufer", text: "Gleitet beliebig weit diagonal und bleibt sein Leben lang auf seiner Feldfarbe. Zwei Läufer zusammen bestreichen das ganze Brett." },
    en: { title: "The bishop", text: "Glides any distance diagonally and stays on its square colour for life. Two bishops together sweep the whole board." } },
  { kind: "R", dots: [...ray(1, 0), ...ray(-1, 0), ...ray(0, 1), ...ray(0, -1)],
    de: { title: "Der Turm", text: "Fährt beliebig weit gerade — waagrecht oder senkrecht. Türme lieben offene Linien und werden im Endspiel zu Riesen." },
    en: { title: "The rook", text: "Runs any distance in straight lines — across or down. Rooks love open files and grow into giants in the endgame." } },
  { kind: "Q", dots: [...ray(1, 0), ...ray(-1, 0), ...ray(0, 1), ...ray(0, -1), ...ray(1, 1), ...ray(-1, 1), ...ray(1, -1), ...ray(-1, -1)],
    de: { title: "Die Dame", text: "Turm und Läufer in einer Figur: beliebig weit in alle acht Richtungen. Die stärkste Figur — und gerade darum kein Werkzeug für leichtsinnige Ausflüge." },
    en: { title: "The queen", text: "Rook and bishop in one: any distance in all eight directions. The strongest piece — which is exactly why she is no tool for careless outings." } },
  { kind: "K", dots: [[1, 1], [2, 1], [3, 1], [1, 2], [3, 2], [1, 3], [2, 3], [3, 3]],
    de: { title: "Der König", text: "Ein Feld in jede Richtung — langsam, aber unersetzlich: Fällt der König, ist die Partie verloren. In Gambit gilt wie im Schach: Ihn zu schützen ist Auftrag Nummer eins." },
    en: { title: "The king", text: "One square in any direction — slow but irreplaceable: lose the king, lose the game. In Gambit as in chess, guarding him is task number one." } },
];

export function TutorialScreen({ t, en, onDone, startAt = 0 }) {
  const [track, setTrack] = useState("game");   // "game" | "chess"
  const [i, setI] = useState(startAt);
  const PAGES = track === "game" ? STEPS : SCHOOL;
  // switching tracks can leave the cursor past the end of the shorter deck —
  // and a page that does not exist used to take the whole screen down with it
  const page = Math.min(Math.max(i, 0), PAGES.length - 1);
  const step = PAGES[page];
  const L = en ? step.en : step.de;
  const last = page === PAGES.length - 1;
  /* v1.89.0: zehn Ziffern - bei neun Lektionen stand ab der achten "undefined" */
  const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  return (
    <div style={{ maxWidth: 460, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 12 }}>
        {[["game", en ? "The adventure" : "Das Abenteuer"], ["chess", en ? "Chess school" : "Schachschule"]].map(([id, lbl]) => (
          <button key={id} onClick={() => { setTrack(id); setI(0); }} className="gg-serif"
            style={{ fontFamily: "inherit", cursor: "pointer", fontSize: 13, letterSpacing: ".05em", borderRadius: 999,
              padding: "7px 15px", border: `1px solid ${track === id ? "rgba(255,240,200,.45)" : T.line}`,
              background: track === id ? "linear-gradient(165deg, #e0b76c, #b78d43)" : "transparent",
              color: track === id ? "#17110a" : T.dim, fontWeight: 700 }}>{lbl}</button>
        ))}
      </div>
      <div style={{ background: "#efe9da", color: "#2e2a20", border: "1px solid #c9bfa4", borderRadius: 16,
        boxShadow: "0 14px 40px rgba(0,0,0,.45)", padding: "20px 18px 16px", textAlign: "center" }} key={track + i}>
        <div className="gg-serif" style={{ fontSize: 10.5, letterSpacing: ".22em", color: "#8a6f4d" }}>
          {(en ? "LESSON " : "LEKTION ")}{roman[i]} / {roman[PAGES.length - 1]}
        </div>
        <div className="gg-serif" style={{ fontSize: 22, letterSpacing: ".04em", marginTop: 5 }}>{L.title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "9px 0 12px" }}>
          <span style={{ flex: 1, height: 1, background: "#c9bfa4" }} />
          <span style={{ width: 6, height: 6, background: "#8a6f4d", transform: "rotate(45deg)" }} />
          <span style={{ flex: 1, height: 1, background: "#c9bfa4" }} />
        </div>
        <div style={{ display: "grid", placeItems: "center", minHeight: 66, marginBottom: 10 }}>
          {track === "chess" ? <MoveDiagram kind={step.kind} dots={step.dots} hits={step.hits || []} /> : step.art}
        </div>
        <div className="gg-serif" style={{ fontSize: 13.5, lineHeight: 1.6, color: "#4a4433", textAlign: "left" }}>{L.text}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 5, margin: "14px 0 12px" }}>
          {PAGES.map((_, k) => (
            <span key={k} style={{ width: 6, height: 6, borderRadius: "50%", transform: "rotate(45deg)",
              background: k === i ? "#8a6f4d" : "#cfc5a8" }} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: page > 0 ? "1fr 2fr" : "1fr", gap: 8 }}>
          {page > 0 && <button onClick={() => setI(page - 1)} style={{ padding: "11px 12px", borderRadius: 10, background: "none",
            border: "1px solid #c9bfa4", color: "#6f6752", fontWeight: 700, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>
            ‹ {t("common.back")}</button>}
          <button onClick={() => (last ? onDone() : setI(page + 1))} style={{ padding: "11px 14px", borderRadius: 10,
            background: "#1d2436", color: "#e9e2cf", fontWeight: 800, fontSize: 14, border: "none", fontFamily: "inherit",
            cursor: "pointer", letterSpacing: ".04em" }}>{last ? t("tut.done") : t("tut.next")} ›</button>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <button onClick={onDone} style={{ background: "none", border: "none", color: T.dim, fontFamily: "inherit",
          fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>{t("tut.skip")}</button>
      </div>
    </div>
  );
}
