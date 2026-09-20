// The academy — a skippable, step-through tutorial in the world's own voice:
// parchment cards, drawn glyphs, one idea per step. Reachable from the hub,
// never forced; "skip" is always one tap away.
import { useState } from "react";
import { T } from "../theme.js";
import { Button } from "../primitives.jsx";
import { PieceArt } from "../board/PieceArt.jsx";
import { ItemIcon } from "../ItemIcon.jsx";
import { SkullIc, BladesIc, HourglassIc, SkillStar, GoldCoin, HeartIc, GoldHeartIc, SwordsIc, HourglassGIc, GoldSkullIc, SkillIc, LevelIc, CoinIc } from "../icons.jsx";
import { JewelIc } from "../board/PieceGlyph.jsx";

const STEPS = [
  {
    de: { title: "Das Spiel", text: "Grand Gambit ist Schach mit Herz: Jede Figur hat Lebenspunkte und Angriffsstärke. Wer eine Figur angreift, richtet Schaden an — erst wenn die Herzen fallen, verlässt sie das Brett. Der Grand Gambit selbst, der goldene Bauer, ist der Held der Geschichte." },
    en: { title: "The game", text: "Grand Gambit is chess with a heartbeat: every piece carries life points and attack strength. Attacking deals damage — a piece only leaves the board once its hearts run out. The Grand Gambit himself, the golden pawn, is the hero of the tale." },
    art: <div style={{ width: 64, height: 64 }}><PieceArt kind="P" fill="#c9a45c" rim="#f0dfae" detail="#59421a" size="100%" level={1} hero /></div>,
  },
  {
    de: { title: "Ziehen & Kämpfen", text: "Figuren ziehen wie im Schach. Ein Zug auf ein gegnerisches Feld ist ein Angriff: Deine Angriffsstärke trifft seine Lebenspunkte. Überlebt der Gegner, bleibst du stehen — überlege also, wen du wohin schickst. Der König muss immer geschützt bleiben." },
    en: { title: "Move & fight", text: "Pieces move as in chess. Stepping onto an enemy square is an attack: your attack strikes their life points. If the defender survives, you hold your ground — so choose your targets well. The king must always be kept safe." },
    art: <div style={{ display: "flex", gap: 12, alignItems: "center" }}><JewelIc kind="life" size={26} /><JewelIc kind="power" size={26} /></div>,
  },
  {
    de: { title: "Die zwei Kugeln", text: "Unter jeder Figur liegen zwei Juwelen. BLAU ist die Kampfkraft: so viele Lebenspunkte reißt sie dem Gegner bei einem Angriff herunter. ROT sind ihre Lebenspunkte: so viel hält sie selbst aus. Ein goldener Stern darüber heißt, dass ihre eine Fähigkeit für diese Partie noch frei ist." },
    en: { title: "The two orbs", text: "Two jewels sit beneath every piece. BLUE is attack strength: that many life points it tears off an enemy when it strikes. RED is its own life: that much it endures. A golden star above them means its one ability is still unspent this match." },
    /* v1.25.4: die Lehre zeigt die Zahlen in den Farben des Sockelbandes,
       nicht mehr als Perlen (Besitzer: "die koennen raus, egal wo"). */
    art: <div style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
      <span style={{ font: "800 26px/1 Georgia, serif", color: "#b6cdff" }}>3</span>
      <span style={{ font: "800 26px/1 Georgia, serif", color: "#ffb3aa" }}>5</span></div>,
  },
  {
    de: { title: "Angriff & Rückprall", text: "Ein Zug auf ein besetztes Feld ist ein Angriff: Deine Kampfkraft trifft seine Lebenspunkte. Hält der Gegner stand, springt deine Figur auf ihr Ausgangsfeld ZURÜCK — das ist kein Fehler, sondern die Regel. Erst wenn sein letzter Lebenspunkt fällt, rückst du auf sein Feld vor. Ein Angreifer mit 3 Kraft braucht gegen 5 Leben also zwei Angriffe." },
    en: { title: "Strike & rebound", text: "Moving onto an occupied square is an attack: your force meets their life. If the defender holds, your piece springs BACK to where it came from — that is the rule, not a glitch. Only when their last life point falls do you advance onto their square. So a striker with 3 force needs two attacks to fell 5 life." },
    art: <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
      <span style={{ font: "800 22px/1 Georgia, serif", color: "#b6cdff" }}>3</span>
      <span style={{ color: "#8a6f4d", fontSize: 18 }}>→</span>
      <span style={{ font: "800 22px/1 Georgia, serif", color: "#ffb3aa" }}>5</span>
      <span style={{ color: "#8a6f4d", fontSize: 18 }}>→</span>
      <span style={{ font: "800 22px/1 Georgia, serif", color: "#ffb3aa" }}>2</span></div>,
  },
  {
    de: { title: "Tränke & Zeitenwender", text: "In der Vorratstruhe warten Helfer: Der Lebenstrank heilt im Kampf eine Figur um 2 Lebenspunkte (kostet den Zug). Der Zeitenwender nimmt deinen letzten Zug zurück — jede Umkehr verbrennt eine Sanduhr. Beides wird mit Gold gekauft und ist begrenzt." },
    en: { title: "Draughts & time-turners", text: "The supply chest holds helpers: the healing draught restores 2 life points to a piece mid-battle (spends the turn). The time-turner takes back your last move — each reversal burns one hourglass. Both are bought with gold, both are scarce." },
    art: <div style={{ display: "flex", gap: 10, alignItems: "center" }}><ItemIcon id="potion" size={34} /><ItemIcon id="hourglass" size={34} /></div>,
  },
  {
    de: { title: "Die Kampagne", text: "Jede Welt führt über vier Kapitel — Der Aufbruch, Die drei Pfade, Die Prüfungen, Der Aufstieg — bis zur Zitadelle, wo der Großmeister wartet. An den 51 Stationen stehen Herausforderer: Besiege sie, und sie treten deinem Hofstaat bei. Nur die Gegner mit dem Totenkopf sind reine Ungeheuer. Manche Pfade sind verschlossen und wollen Gold oder Ausrüstung. Und hinter der Zitadelle liegt die nächste Welt." },
    en: { title: "The campaign", text: "Every world runs through four chapters — The Setting Out, The Three Paths, The Trials, The Ascent — up to the Citadel, where the Grandmaster waits. Challengers hold the 51 stations: beat them and they join your court. Only the skull-marked foes are pure monsters. Some paths are barred and demand gold or gear. And beyond the Citadel lies the next world." },
    art: <div style={{ display: "flex", gap: 12, alignItems: "center" }}><JewelIc kind="power" size={26} /><GoldSkullIc size={26} /></div>,
  },
  {
    de: { title: "Der Hofstaat", text: "Rekrutierte Figuren steigen mit Skillpunkten ✦ auf und lernen dabei Fähigkeiten. Eine Figur darf mehrere KÖNNEN — aber pro Partie nur EINE wirken; der goldene Stern über ihren Kugeln zeigt, dass sie ihren Zauber noch frei hat. In der Aufstellung wählst du deine Reihe und den Platz des Grand Gambit; König und Dame stehen dabei immer auf denselben Feldern, und nur ein Meister darf den Platz der Dame einnehmen. Besiegst du einen Herausforderer erneut, tritt er als Abtrünniger gegen dich an — der Doppelsieg schenkt einen Stern ★." },
    en: { title: "The court", text: "Recruited pieces rise with skill points ✦ and learn abilities along the way. A piece may KNOW several — but casts only ONE per match; the golden star above its orbs means its spell is still unspent. In the formation you choose your rank and the Grand Gambit's file; king and queen always hold the same squares, and only a master may take the queen's place. Beat a challenger a second time and they face you as a turncoat — the double victory grants a star ★." },
    art: <div style={{ display: "flex", gap: 10, alignItems: "center" }}><SkillIc size={26} /><LevelIc size={26} /></div>,
  },
  {
    de: { title: "Gold & Truhe", text: "Jeder Sieg füllt die Schatzkammer. Gold öffnet Zollbrücken, kauft Ausrüstung und Tränke. Die Truhe enthüllt ihre Gegenstände erst nach und nach — was die Reise noch nicht erreicht hat, bleibt versiegelt." },
    en: { title: "Gold & chest", text: "Every victory fills the treasury. Gold opens toll bridges, buys gear and draughts. The chest reveals its wares one by one — whatever the journey has not reached stays under seal." },
    art: <CoinIc size={30} />,
  },
  {
    de: { title: "Schnell & zu zweit", text: "Im Schnellen Spiel wartet die KI in drei Stufen — oder ihr spielt zu zweit an einem Gerät: Das Brett dreht sich nach jedem Zug zum Ziehenden. Online wählst du dein Tempo: Quick Gambit für pure Reflexe, Rush Gambit als schneller Wettkampf, Prime Gambit für ruhige Berechnung und Classic Gambit über Tage hinweg. Und nun: Ein Reich wartet auf seinen Strategen." },
    en: { title: "Quick & together", text: "Quick play offers the AI in three tiers — or two players share one device: the board turns to face whoever moves. Online you pick your pace: Quick Gambit for pure reflex, Rush Gambit for a fast contest, Prime Gambit for calm calculation and Classic Gambit across days. And now: a realm awaits its strategist." },
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
    de: { title: "Der Bauer", text: "Zieht ein Feld geradeaus (aus der Grundstellung zwei) — angreifen kann er aber nur schräg vorwärts. Erreicht ein Bauer die letzte Reihe, wird er befördert. Der Grand Gambit ist ein Bauer mit einem großen Schicksal." },
    en: { title: "The pawn", text: "Moves one square straight ahead (two from its home row) — but it only attacks diagonally forward. Reaching the last rank, a pawn is promoted. The Grand Gambit is a pawn with a great destiny." } },
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
    de: { title: "Der König", text: "Ein Feld in jede Richtung — langsam, aber unersetzlich: Fällt der König, ist die Partie verloren. In Grand Gambit gilt wie im Schach: Ihn zu schützen ist Auftrag Nummer eins." },
    en: { title: "The king", text: "One square in any direction — slow but irreplaceable: lose the king, lose the game. In Grand Gambit as in chess, guarding him is task number one." } },
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
  const roman = ["I", "II", "III", "IV", "V", "VI", "VII"];
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
