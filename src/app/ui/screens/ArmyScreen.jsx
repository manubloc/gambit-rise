import { JewelIc } from "../board/PieceGlyph.jsx";
import { FigurenIc, AufstellungIc } from "../RaumIcons.jsx";
import { AbilityIcon, abilityTint } from "../AbilityIcons.jsx";
import { useState, useEffect, useMemo, useRef } from "react";
import { useMedia } from "../../App.jsx";
import { GildedFrame, goldText, GoldShineButton } from "../Gilded.jsx";
import { SP_SHARD_GOLD, SP_VAULT_MIN_CLEARED, spShardCap, bossLevelOf, bossUpgradeCost, bossSpecLeveled, BOSS_MAX_LEVEL, gambitWach,
  darfHeldSetzen, darfReiheStellen, freigegeben } from "../../../meta/index.js";
import { CHARACTER_LIST, CHARACTERS, ABILITIES, TAGS, SPERRGRUND, faehigkeitZustand, MAPS, mapById, ITEM_LIST, bossById, BOSSES, ITEMS, itemPrice } from "../../../content/index.js";
import LebensRohr from "../board/LebensRohr.jsx";
import { rohrAnteile } from "../board/PieceGlyph.jsx";
import { talentFarbe, maxStufe, stufenText } from "../../../content/abilities.js";
import { iconFarbe } from "../AbilityIcons.jsx";   /* v1.26.6 */
import { BASE_HP, BASE_ATK, SHIELD_HP, HELD_PUNKTE, NORM_PUNKTE, werteBeiStufe, createGame, familyOf, crownHp, crownWallSoak, shadowRifts, shadowAtk } from "../../../core/index.js";
import {
  characterLevel, resolveCharacter, isUnlocked, upgradeCost, canUpgrade, maxLevelFor, gambitTier, clearedCount,
  formationKey, formationLegalOn, formationCounts, buildArmyFromFormation, buildArmyFrom, defaultFormation, buildAiArmyForMap, hpUnlocked, ownedLeagueBosses, isBossEntry, bossEntryId, crownSlots,
  chosenAbilities, abilityCost, canUnlockAbility, faehigkeitsStufe, stufeBenoetigt, canUpgradeAbility, dupeCount, RESPEC_GOLD, heroColFor, mapUnlocked,
  itemRevealed, bossWinsFor, effectiveNodeBoss, nodeStatus, hpWach } from "../../../meta/index.js";
import { CAMPAIGN } from "../../../content/index.js";
import { klang } from "../klang.js";   /* v0.77: Stufe, Freischalten, Gold bekommen ihren Klang */
import { T } from "../theme.js";
import { animAn } from "../anim.js";
import { Panel, Bar, Chip, Shields, Button, Segmented, PanelTitle, FieldLabel, MapChip, MapMini } from "../primitives.jsx";
import { SkillStar, GoldCoin, LockIc, BladesIc, SealIc, HeartIc } from "../icons.jsx";
import { PieceGlyph } from "../board/PieceGlyph.jsx";
import { PieceArt } from "../board/PieceArt.jsx";
import { paintedFitById, paintedFitFor, paintedById, paintedForPiece, schlichtAn } from "../board/paintedArt.js";
import { GAMBIT_STUFEN } from "../board/gambitStufen.js";
import { kulisseFuer } from "../kulissen.js";
import { LEAGUE_BOSSES } from "../../../content/index.js";   /* v1.23.0: Grossmeister-Rahmen */
import { KulisseHinterGrund, KULISSE_URL } from "../KulissenBilder.jsx";
import { BundTafel } from "../BundTafel.jsx";
import { SockelBand, bandBekannt, bodenAusgleichProzent, sockelSkalierung, figurStreckung, tellerMitteProzent } from "../SockelBand.jsx";   /* v1.17.0: das Band im Sockel */
import { paintedIdOf } from "../board/paintedArt.js";
import { figurFarbe, hellDunkel } from "../figurfarbe.js";   /* v1.19.0: Medaillon und Kulisse in der Farbe der Figur */
import { StufenAbzeichen, AbzeichenDefs } from "../StufenAbzeichen.jsx";   /* v1.21.0 */
import { formFuer } from "../kulissen.js";   /* v1.16.0: Bund, Kapitel, Gruppe, Herkunft - erst auf dem Blatt */
import { CoinIc, SkillIc } from "../icons.jsx";
import { ItemIcon } from "../ItemIcon.jsx";
import { BoardView } from "../board/BoardView.jsx";
import { itemArt } from "../assets/items/itemArt.js";
import { DECK_ANZAHL, deckStand, deckName } from "../../../meta/index.js";   /* v1.15.0: Decks */

const aName = (id, en) => ABILITIES[id][en ? "nameEn" : "nameDe"];

/** A painted figure, DEAD-CENTERED in its frame — tiles are not the board,
 *  so no bottom-anchoring, no hp padding, no badge chrome. */
/* v1.0.83: EIN Weg zum Bildnis - und er kennt den Rang. Bis hierher rief
   jede Stelle paintedById(id) einzeln auf und bekam beim Gambit immer sein
   erstes Gesicht; das hat den Besitzer durch drei Fassungen begleitet. */
/* v1.25.7: das Budget einer Figur an EINER Stelle. Der Held bekommt
   HELD_PUNKTE, alle anderen ihr Grundprofil (das seit dem Wegfall der Schilde
   von selbst NORM_PUNKTE ergibt). So steht sein Vorsprung als Zahl da, statt
   in neun Schildsprossen versteckt zu sein. */
export const punkteVon = (charId) => (charId === "gambit" ? HELD_PUNKTE : null);

export function bildnisVon(id, level = 1) {
  if (id === "gambit") return paintedById("gambit-t" + gambitTier(level)) || paintedById("gambit");
  return paintedById(id);
}

function TileArt({ kind, size, hero = false, level = 1, bossId = null, tier = 0 }) {
  /* v0.83: im schlichten Stil zeichnet ueberall dieselbe Hand - auch hier,
     nicht nur auf dem Brett. Sonst sitzt man vor einem Zwitter aus schlichtem
     Brett und gemaltem Hofstaat. */
  if (schlichtAn()) return <PieceArt kind={kind} size={size ?? "100%"} level={level} hero={hero} bossId={bossId} />;
  /* v1.0.74 (Besitzerbefund: "er hat nie eine neue Figur bekommen, auch wenn
     eine Stufe gestiegen ist"): DAS FIGURENBLATT REICHTE DEN RANG NIE WEITER.
     paintedForPiece waehlt das Gambit-Gemaelde ueber piece.TIER - hier stand
     aber nur level, und tier blieb undefined, also zeigte das Blatt seit
     v1.0.62 immer Rang I. Die sechs handgefuehrten Bilder existieren und
     unterscheiden sich (geprueft: sechs verschiedene Pruefsummen); allein
     der Weg dorthin fehlte. Das Brett bekam tier ueber buildArmy, die Karte
     rechnet es selbst - nur das Blatt, wo man den Aufstieg am ehesten sucht,
     ging leer aus. */
  const stueck = { kind, color: "w", hero, level, bossId,
    ...(tier ? { tier } : null) };
  const src = paintedForPiece(stueck);
  /* v1.0.49 (Besitzerbefund, Aufstellung): DIE FIGUREN SASSEN ZU WEIT RECHTS.
     Nicht die Kacheln - der INHALT der Bilder. Jede Figur sitzt anders weit
     aus ihrer Bildmitte; das Brett gleicht das ueber PAINTED_FIT.x aus, die
     Aufstellungskacheln taten es nicht. In der hinteren Reihe faellt es am
     staerksten auf, weil dort acht verschiedene Figuren nebeneinander stehen
     und die Versaetze sich nicht mehr wegmitteln. Derselbe Wert wie am
     Brett, gegenlaeufig: -x schiebt den Inhalt in die Mitte der Kachel. */
  /* v1.0.52 (Besitzerbefund): UEBER DEN SOCKEL, nicht ueber die Silhouette.
     paintedFitFor(...).x misst die ganze Gestalt - ein Laeufer mit Mitra und
     Stab zog sie zur Seite, obwohl sein Sockel gerade stand, und mein
     Ausgleich schob ihn daraufhin erst recht nach rechts. Der Standfuss ist
     der Anker, an dem das Auge nebeneinanderstehende Figuren ausrichtet. */
  /* v1.0.62: kein Versatz mehr - die Bilder selbst sind gerichtet. */
  return src
    ? <img src={src} alt="" draggable={false} style={{ width: size ?? "100%", height: size ?? "100%", objectFit: "contain",
        objectPosition: "center center",
        filter: "brightness(1.16) saturate(1.05) drop-shadow(0 2px 3px rgba(0,0,0,.6))",
        userSelect: "none", pointerEvents: "none", display: "block", flex: "none" }} />
    : <span style={{ fontSize: size * 0.8, lineHeight: 1 }}>♟</span>;
}
function Glyph({ kind, level, abilities, shield, size = 50, hero = false, art = "painted" }) {
  return <div style={{ width: size * 1.3, height: size * 1.3, display: "grid", placeItems: "center", background: T.bg2, borderRadius: 10, border: `1px solid ${T.line}`, flex: "none" }}>
    <TileArt kind={kind} size={size} hero={hero} level={level} tier={hero ? gambitTier(level) : 0} />
  </div>;
}

function rewardLabel(r, en) {
  if (!r) return null;
  if (r.ability) return ABILITIES[r.ability].icon + " " + aName(r.ability, en);
  if (r.shield) return "+" + r.shield + (en ? " shield" : " Schild");
  return null;
}

function StatPill({ icon, val, color }) {
  // the little seals: the same deep night-blue as the Verbessern button, gold
  // rim, the SIGN keeps its meaning-color — one visual family across the card
  return <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
    fontSize: 12.5, fontWeight: 900, minWidth: 58, boxSizing: "border-box",
    padding: "3px 10px", borderRadius: 999, color: "#f6e9a4",
    background: "linear-gradient(168deg, #2c4f9e 0%, #1b3068 55%, #142450 100%)",
    border: "1px solid #e3c07a", boxShadow: "0 0 8px rgba(64,110,220,.3)" }}>
    <span style={{ display: "inline-flex", color }}>{icon}</span> {val}</span>;
}

// THE STAT ORB — the very same sphere the pieces wear on the board, so the
// character sheet speaks the game's own visual language (instant recognition).
// power = gold, life = green, energy = blue.

// a dossier line: LABEL ........ value — the wanted-poster rhythm

/* ═══ DAS FIGURENBLATT, ENTWURF 8 ═════════════════════════════════════════
   Acht Runden Entwurf mit dem Besitzer, jede an gerenderten Blaettern
   entschieden. Was dabei herauskam und hier gebaut ist:

   - EINE Buehne traegt alles: Stufe, Figur, Zuege, Zeichen, Werte, Knopf.
     "Ziehe diesen Hintergrund und diesen Container ueber alles, was du
     aktuell in dem Vorschlag drin hast." Entwurf 5 hatte noch das Blatt mit
     eigenem violettem Verlauf UNTER der Buehne; das Polster liess ihn als
     hellen Rahmen stehen ("da hast du noch einen Hintergrund reingebaut, der
     so hell ist"). Deshalb hat die Buehne kein Polster um sich.
   - Die Figur LINKS, ihr Name DARUNTER - wie auf der Kachel.
   - Rechts das Zugbild, darunter die Faehigkeitszeichen: "direkt unter dem
     Schachbrettmuster, so dass es auf gleicher Hoehe mit der Figur ist."
   - Die Stufenanzeige oben rechts, das Emblem direkt an ihrem Ende.
   - Die Zeichen sind ABGERUNDETE VIERECKE, nicht Kreise, und fuenf je Reihe.
   - Angriff und Leben im Rot und Blau des Sockelbandes, als heller Strich auf
     dunklem Grund ("eher das Design von den Faehigkeiten"), Zahl und Wort im
     selben Ton, der Zuwachs klein und violett im selben Kasten.
   - Kein Kreuz: geblaettert wird mit den Pfeilen, zurueck geht es ueber die
     Reiter. "So dass wir mal davon ausgehen, dass man das Spiel auch am
     Gamepad spielen koennte." */
const BAND_ROT = ["#571419", "#2e080b", "#ff9f96", "#ffe6e2"];
const BAND_BLAU = ["#16295a", "#0a1633", "#a3c1ff", "#e4eeff"];
const WZ_KLINGE = <><path d="M12 3.2l2.1 3.6v7.4H9.9V6.8z" /><path d="M7.4 14.2h9.2" /><path d="M12 14.2v4.3" /><path d="M10.3 18.5h3.4" /></>;
const WZ_HERZ = <path d="M12 19.4c-3.8-3-6.7-5.4-6.7-8.5A3.7 3.7 0 0 1 12 8.2a3.7 3.7 0 0 1 6.7 2.7c0 3.1-2.9 5.5-6.7 8.5z" />;
/* dasselbe Medaillon wie ein Faehigkeitszeichen, nur im Ton des Bandes */
function WertZeichen({ art, size = 26, id }) {
  const [grund, tief, ring, strich] = art === "rot" ? BAND_ROT : BAND_BLAU;
  const u = (k) => `wz-${id}-${art}-${k}`;
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ display: "block", flex: "0 0 auto" }}>
    <defs>
      <radialGradient id={u("g")} cx="50%" cy="28%" r="82%">
        <stop offset="0" stopColor={grund} /><stop offset="1" stopColor={tief} />
      </radialGradient>
      <linearGradient id={u("s")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity=".22" /><stop offset=".5" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="22" height="22" rx="6.2" fill={`url(#${u("g")})`} />
    <rect x="1" y="1" width="22" height="22" rx="6.2" fill={`url(#${u("s")})`} />
    <rect x="1" y="1" width="22" height="22" rx="6.2" fill="none" stroke={ring} strokeWidth="1.5" />
    <g transform="translate(12 12) scale(.78) translate(-12 -12)" fill="none" stroke={strich}
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{art === "rot" ? WZ_KLINGE : WZ_HERZ}</g>
  </svg>;
}
/* die Stufenanzeige: zehn Striche je Reihe, beim Gambit also mehrere Reihen */
function StufenStriche({ stufe, maxStufe }) {
  /* GEMESSEN beim ersten Bau: der Grand Gambit hat SECHZIG Stufen - das
     ergaben sechs Reihen Striche und sprengte den Kopf des Blattes. Der
     Besitzer will ihn ohnehin auf zwanzig kuerzen; bis das in der Staffelung
     entschieden ist, zeigt die Anzeige hoechstens ZWANZIG Striche in zwei
     Reihen und fasst den Rest zusammen. */
  const zeige = Math.min(20, maxStufe);
  const reihen = [];
  for (let r = 0; r * 10 < zeige; r++) {
    reihen.push(Array.from({ length: Math.min(10, zeige - r * 10) }, (_, i) =>
      (r * 10 + i) < Math.round(stufe / maxStufe * zeige)));
  }
  return <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
    {reihen.map((z, ri) => <div key={ri} style={{ display: "flex", gap: 3.5 }}>
      {z.map((voll, i) => <span key={i} style={{ width: 9, height: 6, borderRadius: 3, display: "block",
        background: voll ? "linear-gradient(90deg,#d1ad55,#eac96b)" : "rgba(255,255,255,.12)",
        boxShadow: voll ? "0 0 5px rgba(234,201,107,.5)" : "none" }} />)}
    </div>)}
  </div>;
}
/* die Eckverzierung der Kachel, kleiner - v1.23.6 */
const BLATT_ECKE = <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden>
  <path d="M1.5 9.5V5" fill="none" stroke="#e9cf8a" strokeWidth="0.85" strokeLinecap="round" />
  <path d="M1.5 5A3.5 3.5 0 0 1 5 1.5" fill="none" stroke="#e9cf8a" strokeWidth="0.85" strokeLinecap="round" />
  <path d="M5 1.5H9.5" fill="none" stroke="#e9cf8a" strokeWidth="0.85" strokeLinecap="round" />
  <path d="M1.5 12.5c0 1.6 1 2.4 2.4 2.4" fill="none" stroke="#e9cf8a" strokeWidth="1" strokeLinecap="round" opacity=".8" />
  <path d="M12.5 1.5c1.6 0 2.4 1 2.4 2.4" fill="none" stroke="#e9cf8a" strokeWidth="1" strokeLinecap="round" opacity=".8" />
  <circle cx="4.6" cy="4.6" r="1.05" fill="#e9cf8a" />
</svg>;
const BlattEcken = () => <>{[["top:2px;left:2px", 0], ["top:2px;right:2px", 90], ["bottom:2px;right:2px", 180], ["bottom:2px;left:2px", 270]]
  .map(([pos, dreh], i) => { const [a, b] = pos.split(";").map((x) => x.split(":"));
    return <div key={i} aria-hidden style={{ position: "absolute", [a[0]]: a[1], [b[0]]: b[1],
      transform: `rotate(${dreh}deg)`, zIndex: -1, lineHeight: 0, opacity: .85, pointerEvents: "none" }}>{BLATT_ECKE}</div>; })}</>;


/* ═══ DIE BUEHNE ALS BAUTEIL (v1.25.9) ══════════════════════════════════════
   Besitzer: "Ich wollte doch bei allen Monstern genau das gleiche Design wie
   bei meinen Figuren - und auch von der Bedienung."
   Bis hierher war die Buehne in das Figurenblatt eingebacken und las dessen
   lokale Groessen. Jetzt ist sie ein Bauteil mit Eigenschaften: Figurenblatt
   und Monsterfenster rufen DASSELBE auf. Was ein Monster nicht hat (Bund,
   Leiter zum Waehlen), laesst es einfach weg. */
function BlattBuehne({ kennung, name, haus, satz, portraet, pid, ton, kul, form, stufe, maxStufe,
  zugKind, moveSpec, talente, zeichen, band, atk, maxHp, plusAtk, plusHp, werteAn, maxed, en,
  knopf = null, tonStaerke = 0.30 }) {
  const gezeigt = zeichen.slice(0, 10);
  const reihen = []; for (let r = 0; r * 5 < Math.max(5, gezeigt.length); r++) reihen.push(gezeigt.slice(r * 5, r * 5 + 5));
  return <div style={{ position: "relative", isolation: "isolate", borderRadius: 15, overflow: "hidden",
        padding: "10px 12px 12px", border: "1px solid rgba(233,207,138,.26)",
        background: "linear-gradient(180deg, rgba(20,13,36,.9), rgba(10,7,19,.96))" }}>
        {kul && <img src={kul} alt="" data-gg-still="" draggable={false} style={{ position: "absolute", inset: 0,
          width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 38%", opacity: .66, zIndex: -2 }} />}
        {/* v1.26.3 (Besitzer): "die Farbgebung, die du auf der Uebersicht jeder
            Figur gibst, tust du im Fenster nicht auf den Hintergrund beziehen -
            da bitte auch so soft einfaerben." Dieselbe Schicht wie auf der
            Kachel (KulisseHinterGrund): der Ton der Figur im Mischmodus color,
            Figuren 30 %, Monster 45 %. */}
        {ton && <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: -2,
          background: ton, mixBlendMode: "color", opacity: tonStaerke, pointerEvents: "none" }} />}
        <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: -1,
          background: "linear-gradient(180deg, rgba(8,5,14,.6) 0%, rgba(8,5,14,.22) 38%, rgba(8,5,14,.72) 100%)" }} />
        <BlattEcken />
        {/* oben rechts: Stufenanzeige, und an ihrem Ende das Emblem */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
            <StufenStriche stufe={stufe} maxStufe={maxStufe} />
            {/* Die Zeichnung der Abzeichen steht genau EINMAL im Hofstaat und
                gilt fuer das ganze Dokument - hier darf sie nicht noch einmal
                eingehaengt werden (test_ui prueft die Anzahl). */}
            <StufenAbzeichen form={form} stufe={stufe} maxStufe={maxStufe} farbe={ton} size={40} />
          </div>
        </div>
        {/* Figur links, Name darunter - rechts Zugbild und Zeichen */}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", padding: "0 6px" }}>
          <div style={{ flex: "0 0 auto", width: 148 }}>
            {/* ── DERSELBE KASTEN WIE AUF DER KACHEL ────────────────────────
                Besitzer: "auch dort hast du dieses Band anders, teilweise bei
                der gleichen Figur. Wieso vermessen wir das alles und dann
                kriegst du es nicht uebertragen?"
                MEIN FEHLER, gemessen: im ersten Bau trug das BILD die
                Skalierung (translate + scale), das Band daneben aber NICHT -
                es wurde unskaliert ueber ein skaliertes Bild gelegt. Auf der
                Kachel stehen Bild und Band in EINEM Kasten, und der Kasten
                traegt die Verwandlung; genau so jetzt auch hier. Kein zweites
                Mass, keine zweite Rechnung - derselbe Bau. */}
            <div style={{ position: "relative", width: 148, height: 148 }}>
              <div style={{ position: "absolute", inset: 0, transformOrigin: "50% 100%",
                transform: `translate(${tellerMitteProzent(pid).toFixed(2)}%, ${bodenAusgleichProzent(pid).toFixed(2)}%) scale(${sockelSkalierung(pid).toFixed(3)}, ${(sockelSkalierung(pid) * figurStreckung(pid)).toFixed(3)})`,
                filter: `drop-shadow(0 0 12px ${ton}88) drop-shadow(0 3px 5px rgba(0,0,0,.55))` }}>
                <img src={portraet} alt="" draggable={false} style={{ position: "absolute", inset: 0,
                  width: "100%", height: "100%", objectFit: "contain", objectPosition: "center" }} />
                {bandBekannt(pid) && <SockelBand paintedId={pid} id={`blatt-${kennung}`}
                  /* ── v1.24.5 (Besitzer): DIESELBEN ANTEILE WIE DIE KACHEL ──
                     "Ich habe Figuren, wo im Pop-up das eine andere Wertigkeit
                      hat wie in der Uebersicht. Das geht nicht."
                     Richtig, und es war meine eigene Erfindung: hier stand
                     leben=1 und kraft=atk/12 - eine zweite Rechnung neben
                     rohrAnteile(), das die Kachel und das Gefecht benutzen.
                     Jetzt liest das Blatt dieselbe Quelle wie die Kachel. */
                  {...band}
                  grau={!werteAn} ausrichtung="mitte" />}
              </div>
            </div>
            <div style={{ textAlign: "center", marginTop: 4 }}>
              <div className="gg-quill" style={{ fontSize: 20, lineHeight: 1.1, color: "#f3ecd2",
                textShadow: "0 1px 6px rgba(0,0,0,.9)" }}>{name}</div>
              <div style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "#cbbf9a",
                marginTop: 4, textShadow: "0 1px 5px rgba(0,0,0,.9)" }}>
                {haus}
              </div>
            </div>
          </div>
          <div style={{ flex: "0 0 auto", width: 154, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ width: 154, maxWidth: 154, overflow: "hidden" }}>
              <MoveDiagram kind={zugKind} moveSpec={moveSpec} talente={talente} breite={154} />
            </div>
            {/* v1.25.4 (Besitzer): "wenn mehrere Faehigkeiten wie hier
                zweiteilig, mehr Abstand nach unten lassen - das wirkt zu
                gedrungen." Die zweite Reihe stiess bisher direkt an die
                Wertkaesten. */}
            {reihen.map((z, ri) => <div key={ri} style={{ display: "flex", gap: 6,
              marginBottom: ri === reihen.length - 1 && reihen.length > 1 ? 8 : 0 }}>
              {Array.from({ length: ri === 0 ? 5 : z.length }, (_, i) => {
                const rg = z[i];
                return rg && rg.gelernt
                  ? <AbilityIcon key={i} id={rg.id} size={26} />
                  : <span key={i} style={{ width: 26, height: 26, borderRadius: 7, display: "block",
                      border: "1px dashed rgba(233,207,138,.32)", background: "rgba(8,5,14,.4)",
                      opacity: rg ? .75 : .45 }} />;
              })}
            </div>)}
          </div>
        </div>
        {/* der Satz, mittig unter beiden Spalten */}
        {satz && <div className="gg-serif" style={{ margin: "9px 0 10px",
          textAlign: "center", fontSize: 11.5, lineHeight: 1.4, color: "#cec7ab", fontStyle: "italic",
          textShadow: "0 1px 5px rgba(0,0,0,.9)" }}>„{satz}“</div>}
        {/* die Werte - nur wenn die alte Magie erwacht ist (v1.0.33) */}
        {werteAn && <div style={{ display: "flex", gap: 9 }}>
          {[["rot", atk, en ? "Attack" : "Angriff", "#ffb3aa", "#e08a84", plusAtk],
            ["blau", maxHp, en ? "Life" : "Leben", "#b6cdff", "#8ba6e0", plusHp]].map(([art, wert, wort, hell, matt, plus]) =>
            <div key={art} style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "6px 9px",
              borderRadius: 11, background: "rgba(10,7,19,.72)", border: `1px solid ${T.line}` }}>
              <WertZeichen art={art} id={kennung} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ font: "800 15px/1 Georgia, serif", color: hell }}>{wert}</span>
                  {plus > 0 && <b style={{ font: "800 11.5px/1 Georgia, serif", color: "#c4b5fd",
                    textShadow: "0 0 7px rgba(167,139,250,.75)" }}>+{plus}</b>}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ font: "600 8.5px/1 Georgia, serif", letterSpacing: ".11em", textTransform: "uppercase", color: matt }}>{wort}</span>
                  {plus > 0 && <span style={{ font: "600 7.5px/1 Georgia, serif", letterSpacing: ".09em",
                    textTransform: "uppercase", color: "#9a8fc0" }}>{en ? "next" : "nächste"}</span>}
                </div>
              </div>
            </div>)}
        </div>}
        {/* v1.26.3: der Verbessern-Knopf unter Angriff und Leben */}
        {knopf && <div style={{ marginTop: 10 }}>{knopf}</div>}
      </div>;
}


/* ═══ DER AUFSTIEGSPLAN ALS BAUTEIL (v1.26.7) ═══════════════════════════════
   Besitzer: "Mach es wirklich so, dass es global der gleiche Designblock ist.
   Wenn ich in Zukunft dort etwas aendere, will ich nicht pruefen muessen, ob
   du es bei den Monstern und bei den Figuren gemacht hast."
   Bis hierher lebte die Trainingsleiter nur im Figurenblatt, mit dessen
   lokalen Groessen. Jetzt ist sie ein Bauteil: Figurenblatt und Monsterfenster
   rufen DASSELBE auf. `schluessel` ist die Figur (etwa "knight") oder das
   Monster ("X:b01" - dieselbe Schreibweise, unter der das Spiel seinen Rang
   fuehrt). Zusammen mit BlattBuehne sind damit beide Fenster aus denselben
   zwei Teilen gebaut. */
function Aufstiegsplan({ schluessel, kind, rungs, level, chosen, profile, en, t, dispatch, setFeier, bild,
  frisch = null, glanz = 0 }) {
  const [openAb, setOpenAb] = useState(null);
      const future = rungs.filter((rg) => level < rg.level);
  return <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 12 }}>
    <div className="gg-serif" style={{ fontSize: 10, letterSpacing: ".14em", color: "#c9b26a", marginBottom: 1 }}>
      {(en ? "Abilities" : "Fähigkeiten").toUpperCase()}</div>
    {rungs.map((rg) => {
      const owned = chosen.includes(rg.id);
      const reach = level >= rg.level;
      if (!reach && future.indexOf(rg) >= 2) return (
        <div key={rg.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 11px",
          borderRadius: 11, border: `1px dashed ${T.line}`, background: "rgba(10, 14, 26, .4)", color: "#a9a28a", fontSize: 12 }}>
          <LockIc size={12} />
          <span className="gg-serif" style={{ letterSpacing: ".06em" }}>
            {en ? "Level" : "Stufe"} {rg.level} · {en ? "still veiled" : "noch verhüllt"}</span>
        </div>
      );
      const ab = ABILITIES[rg.id];
      if (!ab) return null;
      /* v1.0.44: WAS ES NOCH NICHT GIBT, STEHT AUCH NICHT DA. Vor dem
         Erwachen fielen die HP-Talente durch dieselbe Anzeige wie alles
         andere und trugen nur einen Hinweis - man sah also eine Leiter
         voller Dinge, die es in Kapitel I gar nicht gibt. Verborgene
         Sprossen fallen jetzt ganz weg; verriegelte bleiben stehen und
         sagen, warum. */
      const zustand = faehigkeitZustand(rg.id, hpWach(profile));
      if (zustand === "verborgen") return null;
      const tg = TAGS[ab.tag] || { color: T.gold, nameDe: "Talent", nameEn: "Talent" };
      const price = abilityCost(rg.level);
      const cost = 0; // energy is gone — talents are once-per-game now
      const can = reach && !owned && canUnlockAbility(profile, schluessel, rg.id);
      /* v1.0.70: die eben erwachte Sprosse pulst dreimal - key=glanz
         startet den Puls je Stufenkauf genau einmal neu. */
      const eben = rg.level === frisch;
      /* ── v1.28.0: DIE STUFEN EINER FAEHIGKEIT. Unter einer gelernten steht,
         auf welcher Stufe sie ist und - wenn moeglich - der Knopf fuer die
         naechste. Figur und Monster teilen diese Leiter, also beide. */
      const stNow = owned ? faehigkeitsStufe(profile, schluessel, rg.id) : 0;
      const stMax = maxStufe(rg.id);
      const stNext = owned && stNow < stMax ? stNow + 1 : null;
      const stBrauch = stNext ? stufeBenoetigt(schluessel, { level: rg.level }, stNext) : null;
      const stKann = stNext ? canUpgradeAbility(profile, schluessel, rg.id) : false;
      const ROEM = ["", "I", "II", "III"];
      const stufenZeile = owned && stMax > 1 ? <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "5px 2px 0",
          fontSize: 11.5, color: "#b9b295" }}>
        <span className="gg-serif" style={{ letterSpacing: ".06em", color: "#e9cf8a" }}>
          {en ? "Tier" : "Stufe"} {ROEM[stNow]} {en ? "of" : "von"} {ROEM[stMax]}
          <span style={{ color: "#8a856f" }}> · {stufenText(rg.id, stNow, en)}</span></span>
        <span style={{ flex: 1 }} />
        {stNext && (stKann
          ? <button onClick={() => { klang("stufe"); dispatch({ type: "UPGRADE_ABILITY", id: schluessel, ability: rg.id }); }}
              className="gg-funkenkontur" style={{ padding: "5px 10px", borderRadius: 8, fontFamily: "inherit", fontWeight: 800,
                fontSize: 11.5, cursor: "pointer", color: T.riftBright, border: `1px solid ${T.riftLine}`,
                background: "linear-gradient(172deg, rgba(40,24,72,.97) 0%, rgba(14,9,28,.99) 100%)" }}>
              {en ? "To tier" : "Auf Stufe"} {ROEM[stNext]} · {abilityCost(stBrauch)} <SkillStar size={10} /></button>
          : <span style={{ color: "#8a856f" }}>{en ? "Tier" : "Stufe"} {ROEM[stNext]} {en ? "from level" : "ab Stufe"} {stBrauch}</span>)}
      </div> : null;
      return <div key={rg.id + (eben ? ":" + glanz : "")}
        style={eben ? { animation: "ggSprossePuls 1.5s ease-in-out" } : undefined}>
        <AbilityAccordion ab={{ ...ab, _lvl: rg.level }} charId={schluessel} tg={tg} price={price} cost={cost}
        owned={owned} reach={reach} can={can} kind={kind} en={en} sperre={zustand === "wirkt" ? null : zustand}
        open={openAb === rg.id} onToggle={() => setOpenAb(openAb === rg.id ? null : rg.id)}
        onBuy={() => { klang("frei");
          dispatch({ type: "UNLOCK_ABILITY", id: schluessel, ability: rg.id });
          /* v1.0.75 (Besitzer: "megawichtig, dass Du mir zeigst, was die
             Faehigkeit dann ist"): die frisch gekaufte Faehigkeit erklaert
             sich sofort selbst - Zeichen, Name und ihre WIRKUNG im
             Klartext aus ABILITIES.descDe/descEn. Kein Nachschlagen. */
          setFeier && setFeier({ art: "faehigkeit", bild: bild, charId: schluessel, kind: kind, abId: rg.id, ab: {
            icon: ab.icon, name: en ? ab.nameEn : ab.nameDe,
            desc: faehigkeitsText(ab, schluessel, en), once: ab.once } });
        }} />{stufenZeile}</div>;
    })}
    {chosen.length > 0 && (() => {
      /* v1.0.11 (Besitzer): Vergessen kostet einen VERGESSENSTRANK aus
         dem Lager (steigender Preis beim Händler), keine Goldgebühr mehr. */
      const trank = profile.items?.vergessenstrank || 0;
      return <button onClick={() => trank > 0 && dispatch({ type: "RESPEC", id: schluessel })} disabled={trank < 1}
        style={{ justifySelf: "start", background: "none", border: "none", fontFamily: "inherit",
          cursor: trank > 0 ? "pointer" : "default", fontSize: 11.5, color: trank > 0 ? T.dim : T.faint,
          padding: "2px 2px 0", textDecoration: trank > 0 ? "underline" : "none", textAlign: "left" }}>
        ↺ {trank > 0 ? t("army.respec", { n: trank }) : t("army.respecNeed")}
      </button>;
    })()}
  </div>;
}


/* ═══ DER VERBESSERN-KNOPF ALS BAUTEIL (v1.26.7) ════════════════════════════
   Derselbe Knopf fuer Figur und Monster - ueber die ganze Breite, im
   Riss-Gewand, mit Funkenkontur, wenn er bezahlbar ist. */
function VerbessernKnopf({ kann, kosten, onClick, t }) {
  return <button disabled={!kann} onClick={kann ? onClick : undefined}
    className={kann ? "gg-funkenkontur" : undefined}
    style={{ display: "flex", width: "100%", justifyContent: "center", alignItems: "center", gap: 6, padding: "11px 15px",
      borderRadius: 10, fontFamily: "inherit", fontWeight: 800, fontSize: 13, letterSpacing: ".02em",
      cursor: kann ? "pointer" : "default",
      background: kann ? "linear-gradient(172deg, rgba(40,24,72,.97) 0%, rgba(14,9,28,.99) 100%)" : "#151827",
      color: kann ? T.riftBright : "#8d94ad", border: `1px solid ${kann ? T.riftLine : "#3d4666"}`,
      boxShadow: kann ? `0 0 12px ${T.riftGlow}, 0 0 26px rgba(124,58,237,.25), inset 0 0 10px rgba(124,58,237,.14)` : "none",
      animation: kann ? "ggUpPulse 2.2s ease-in-out infinite" : "none",
      textShadow: kann ? "0 0 8px rgba(196,181,253,.8), 0 1px 2px rgba(0,0,0,.6)" : "none" }}>
    {t("army.upgrade")} · {kosten} <SkillStar size={12} /></button>;
}

function SheetRow({ label, children }) {
  return <div style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "3px 0" }}>
    <span className="gg-serif" style={{ fontSize: 11.5, letterSpacing: ".14em", color: "#9a8f6f",
      textTransform: "uppercase", flex: "0 0 auto" }}>{label}</span>
    <span aria-hidden style={{ flex: 1, borderBottom: "1px dotted #8a7f5f", opacity: 0.35, transform: "translateY(-2px)" }} />
    <span style={{ fontSize: 13.5, fontWeight: 800, color: "#e8e1c8", flex: "0 0 auto" }}>{children}</span>
  </div>;
}

// one talent as an ACCORDION row: the header always shows the icon, name,
// TYPE badge (movement/attack/passive…) and cost; tapping it unfolds the full
// description (and move diagram, when the talent changes how the piece strides).
/* v1.27.3: faehigkeitsText liefert wieder fuer jede Figur denselben Text - die
   Heldenausnahme ("jederzeit") ist zurueckgenommen (Besitzer: keine Figur darf
   starke Faehigkeiten dauerhaft haben). Die Funktion bleibt als EINE Stelle,
   an der kuenftig die Stufen I-III ihren Text bekommen. */
export function faehigkeitsText(ab, charId, en) { return en ? ab.descEn : ab.descDe; }
function AbilityAccordion({ ab, tg, price, cost, owned, reach, can, kind, en, open, onToggle, onBuy, sperre, charId = null }) {
  const typeName = en ? tg.nameEn : tg.nameDe;
  return <div style={{ borderRadius: 11, overflow: "hidden",
    border: `1px solid ${owned ? tg.color + "77" : can ? "#e3c07acc" : reach ? "#6f5a30" : "#3a4360"}`,
    background: owned ? `linear-gradient(165deg, ${tg.color}14, rgba(8,10,20,.5))` : "rgba(10,13,24,.5)" }}>
    <button onClick={onToggle} style={{ width: "100%", display: "flex", alignItems: "center", gap: 9,
      padding: "9px 11px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
      fontFamily: "inherit", color: "inherit" }}>
      {/* das gezeichnete Medaillon der Faehigkeit - Farbe nach ihrem Wesen */}
      <span style={{ flex: "0 0 auto", filter: owned ? "none" : "grayscale(.35) opacity(.85)" }}>
        <AbilityIcon id={ab.id} size={30} /></span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 13.5, fontWeight: 800, color: owned ? "#f1e8c6" : "#d7d0b6",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{en ? ab.nameEn : ab.nameDe}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          {/* TYPE badge — attack/movement/passive, in the talent's own colour */}
          <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase",
            color: tg.color, background: tg.color + "1f", border: `1px solid ${tg.color}66`,
            padding: "1.5px 6px", borderRadius: 999 }}>{typeName}</span>
          
        </span>
      </span>
      {owned && <span style={{ fontSize: 10, fontWeight: 800, color: tg.color, flex: "0 0 auto" }}>✓</span>}
      <span aria-hidden style={{ fontSize: 11, color: "#8a856f", flex: "0 0 auto",
        transform: open ? "rotate(90deg)" : "none", transition: "transform .15s" }}>▸</span>
    </button>
    {open && <div style={{ padding: "0 11px 11px", fontSize: 12.5, lineHeight: 1.5, color: "#c6c0a8" }}>
      <div style={{ borderTop: `1px solid ${tg.color}22`, paddingTop: 8 }}>{faehigkeitsText(ab, charId, en)}</div>
      {ABILITY_MOVE[ab.id] && <div style={{ marginTop: 9 }}>
        <MoveDiagram kind={kind} moveSpec={null} extra={ABILITY_MOVE[ab.id]} />
        <div style={{ fontSize: 9.5, color: "#8a856f", marginTop: 3, fontStyle: "italic" }}>{en ? MOVE_LEGEND_ABILITY.en : MOVE_LEGEND_ABILITY.de}</div>
      </div>}
      {reach && !owned && can && onBuy && <button onClick={(e) => { e.stopPropagation(); onBuy(); }}
        style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 9,
          fontFamily: "inherit", fontWeight: 800, fontSize: 12.5, cursor: "pointer",
          background: "linear-gradient(168deg, #2c4f9e 0%, #1b3068 55%, #142450 100%)", color: "#f6e9a4",
          border: "1px solid #e3c07a", boxShadow: "0 0 10px rgba(64,110,220,.35)" }}>
        {en ? "Learn" : "Erlernen"} · {price} <SkillStar size={11} /></button>}
      {/* v1.0.44: DIE SPERRE SAGT, WARUM SIE DA IST. Vorher gab es einen
          einzigen Satz fuer alles Gesperrte ("Schlaeft, bis die alte Magie
          erwacht") - der stimmte fuer HP-Talente und log bei allem anderen.
          Jetzt kommt der Grund aus SPERRGRUND, also aus derselben Quelle wie
          die Sperre selbst; ein neuer Sperrgrund kann gar nicht mehr
          erfunden werden, ohne dass hier ein Satz dazu steht. */}
      {reach && !owned && sperre && <div className="gg-serif" style={{ marginTop: 9, fontSize: 11.5, color: "#9a92cf",
        fontStyle: "italic", display: "inline-flex", alignItems: "flex-start", gap: 6, lineHeight: 1.45 }}>
        <LockIc size={11} /> <span>{en ? SPERRGRUND[sperre].en : SPERRGRUND[sperre].de}</span></div>}
      {!reach && <div style={{ marginTop: 8, fontSize: 11.5, color: "#8a856f", display: "inline-flex", alignItems: "center", gap: 6 }}>
        <LockIc size={11} /> {en ? "Unlocks at level" : "Ab Stufe"} {price != null ? "" : ""}<b style={{ color: "#b9b295" }}>{ab._lvl}</b></div>}
    </div>}
  </div>;
}

// ── THE CHRONICLE: every figure of the court, its inborn moves and its whole

// ability ladder — a rulebook page, not a progression view. One law rules it:
// base moves are INBORN and never change; abilities are LEARNED by level.
const DIRS_ORTHO = JSON.stringify([[1,0],[-1,0],[0,1],[0,-1]].sort());
const DIRS_DIAG = JSON.stringify([[1,1],[1,-1],[-1,1],[-1,-1]].sort());
function describeMoves(ch, en) {
  const FIX = {
    pawn: ["Zieht ein Feld voran (zwei aus der Grundreihe), schlägt schräg nach vorn.",
           "Moves one square forward (two from home), captures diagonally forward."],
    gambit: ["Zieht wie ein Bauer — doch er ist der Feldherr: Fällt er, ist die Schlacht verloren. Seine sechs Siegel-Stufen schärfen Fähigkeiten und Rüstzeug, nie die Schrittart.",
             "Moves like a pawn — but he is the commander: lose him and the battle is lost. His six seal tiers sharpen abilities and gear, never the stride."],
    knight: ["Springt im L (zwei vor, eins zur Seite) — über alles hinweg.", "Leaps in an L (two then one) — over everything."],
    bishop: ["Gleitet diagonal, beliebig weit.", "Slides diagonally, any distance."],
    rook: ["Gleitet gerade — waagerecht und senkrecht, beliebig weit.", "Slides straight — files and ranks, any distance."],
    queen: ["Gleitet in alle acht Richtungen, beliebig weit.", "Slides in all eight directions, any distance."],
    king: ["Ein Feld in jede Richtung.", "One square in any direction."],
    archbishop: ["Läufer und Springer in einer Gestalt: diagonal gleiten oder im L springen.", "Bishop and knight in one: slide diagonally or leap the L."],
    chancellor: ["Turm und Springer in einer Gestalt: gerade gleiten oder im L springen.", "Rook and knight in one: slide straight or leap the L."],
    hawk: ["Springer-Sprung oder ein einzelner diagonaler Schritt — der wendige Flügelstürmer.", "Knight leap or a single diagonal step — the nimble flanker."],
    amazon: ["Dame und Springer zugleich — das Schwerste, was der Hof kennt.", "Queen and knight at once — the heaviest piece the court knows."],
    dragon: ["Ein 2×2-Koloss: Zu Fuß schiebt sich der ganze Block um ein Feld — gerade, seitlich oder zurück — und zermalmt dabei, was unter seiner Vorderkante steht. Der Flug (per Fähigkeit) trägt ihn einmal pro Partie weiter ins Getümmel.",
             "A 2×2 colossus: on foot the whole block shifts one square — forward, sideways or back — crushing whatever stands under his leading edge. Flight (an ability) carries him once per battle deeper into the fray."],
  };
  if (FIX[ch.id]) return FIX[ch.id][en ? 1 : 0];
  const ms = ch.moveSpec || {};
  const parts = [];
  if (ms.slides?.length) {
    const key = JSON.stringify([...ms.slides].sort());
    const dir = key === DIRS_ORTHO ? (en ? "straight" : "gerade")
      : key === DIRS_DIAG ? (en ? "diagonally" : "diagonal")
      : (en ? "in all eight directions" : "in alle acht Richtungen");
    const r = ms.range || 99;
    parts.push(en ? `Slides ${dir}, up to ${r} square${r > 1 ? "s" : ""}` : `Gleitet ${dir}, bis zu ${r} ${r > 1 ? "Felder" : "Feld"}`);
  }
  if (ms.leaps?.length) {
    const L = ms.leaps, n = L.length;
    const allDiag1 = n === 4 && L.every(([a, b]) => Math.abs(a) === 1 && Math.abs(b) === 1);
    const diag12 = n === 8 && L.every(([a, b]) => Math.abs(a) === Math.abs(b) && Math.abs(a) <= 2);
    const ring2 = n === 16 && L.every(([a, b]) => Math.max(Math.abs(a), Math.abs(b)) === 2);
    const ortho2 = n === 4 && L.every(([a, b]) => (a === 0) !== (b === 0) && Math.max(Math.abs(a), Math.abs(b)) === 2);
    const knightL = n === 8 && L.every(([a, b]) => Math.abs(a) + Math.abs(b) === 3 && a && b);
    const what = allDiag1 ? (en ? "one square diagonally (leaping)" : "ein Feld diagonal (springend)")
      : diag12 ? (en ? "one or two squares diagonally, over pieces" : "ein bis zwei Felder diagonal, über Figuren hinweg")
      : ring2 ? (en ? "anywhere on the 2-ring around it, over pieces" : "auf den gesamten 2er-Ring, über Figuren hinweg")
      : ortho2 ? (en ? "two squares straight, over pieces" : "zwei Felder gerade, über Figuren hinweg")
      : knightL ? (en ? "the knight's L" : "im Springer-L")
      : (en ? `to ${n} fixed squares, over pieces` : `auf ${n} feste Zielfelder, über Figuren hinweg`);
    parts.push((en ? "leaps " : "springt ") + what);
  }
  if (!parts.length) return en ? "Moves as its kind." : "Zieht nach Art seiner Gattung.";
  const txt = parts.join(en ? "; " : "; ");
  return txt.charAt(0).toUpperCase() + txt.slice(1) + ".";
}

// ── MOVE VISUALISATION ───────────────────────────────────────────────────────
// Every piece's BASE stride drawn on a small board: the piece sits in the
// centre, reachable squares glow. Slides (rays) shade the whole line and mark
// their reach; leaps (fixed jumps) mark single squares. Standard kinds have no
// stored moveSpec, so we derive one from the same vectors the engine uses.
const DIRS_O = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const DIRS_D = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
const DIRS_ALL = [...DIRS_O, ...DIRS_D];
const KNIGHT_L = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
function specForKind(kind, ownSpec) {
  if (ownSpec) return ownSpec;
  switch (kind) {
    case "N": return { leaps: KNIGHT_L };
    case "B": return { slides: DIRS_D, range: 99 };
    case "R": return { slides: DIRS_O, range: 99 };
    case "Q": return { slides: DIRS_ALL, range: 99 };
    case "K": return { slides: DIRS_ALL, range: 1 };
    case "A": return { slides: DIRS_D, range: 99, leaps: KNIGHT_L };
    case "C": return { slides: DIRS_O, range: 99, leaps: KNIGHT_L };
    case "H": return { leaps: [...KNIGHT_L, ...DIRS_D] };
    case "M": return { slides: DIRS_ALL, range: 99, leaps: KNIGHT_L };
    case "D": return { slides: DIRS_ALL, range: 1 };            // the block shuffles one square
    case "P": return { leaps: [[0, 1]], pawn: true };
    default: return null;
  }
}
// Which abilities CHANGE how a piece moves — and the squares they add. Only
// these get their own little diagram; combat/sustain abilities do not. Deltas
// are [file, rank] offsets from the piece; "spec" abilities extend slides.
const ABILITY_MOVE = {
  knight_longleap: { leaps: [[1, 3], [3, 1], [-1, 3], [-3, 1], [1, -3], [3, -1], [-1, -3], [-3, -1]] },
  knight_outrider: { leaps: [[2, 2], [2, -2], [-2, 2], [-2, -2]] },
  bishop_hop: { leaps: [[2, 2], [2, -2], [-2, 2], [-2, -2]] },       // hop over a neighbour
  bishop_ortho_step: { leaps: [[1, 0], [-1, 0], [0, 1], [0, -1]] },
  rook_diag_step: { leaps: [[1, 1], [1, -1], [-1, 1], [-1, -1]] },
  rook_breach: { leaps: [[2, 0], [-2, 0], [0, 2], [0, -2]] },        // breach over an adjacent piece
  queen_knightleap: { leaps: [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]] },
  king_dash: { leaps: [[2, 0], [-2, 0], [0, 2], [0, -2]] },
  pawn_sidestep: { leaps: [[1, 0], [-1, 0]] },
  pawn_forward_capture: { leaps: [[0, 1]] },
  pawn_charge: { leaps: [[0, 2]] },
  pawn_backstep: { leaps: [[0, -1]] },
  // v0.72.3 (Besitzer-Befund): der GROSSE Drache fliegt auf JEDES Feld im
  // Umkreis seiner Schwinge (so rechnet es die Engine) - nicht nur ueber
  // Achsen und Diagonalen.
  dragon_flight: { leaps: [[-2, -2], [-2, -1], [-2, 0], [-2, 1], [-2, 2], [-1, -2], [-1, -1], [-1, 0], [-1, 1], [-1, 2], [0, -2], [0, -1], [0, 1], [0, 2], [1, -2], [1, -1], [1, 0], [1, 1], [1, 2], [2, -2], [2, -1], [2, 0], [2, 1], [2, 2]] },
  dragon_flight2: { leaps: [[-3, -3], [-3, -2], [-3, -1], [-3, 0], [-3, 1], [-3, 2], [-3, 3], [-2, -3], [-2, -2], [-2, -1], [-2, 0], [-2, 1], [-2, 2], [-2, 3], [-1, -3], [-1, -2], [-1, -1], [-1, 0], [-1, 1], [-1, 2], [-1, 3], [0, -3], [0, -2], [0, -1], [0, 1], [0, 2], [0, 3], [1, -3], [1, -2], [1, -1], [1, 0], [1, 1], [1, 2], [1, 3], [2, -3], [2, -2], [2, -1], [2, 0], [2, 1], [2, 2], [2, 3], [3, -3], [3, -2], [3, -1], [3, 0], [3, 1], [3, 2], [3, 3]] },
  dragon_flight3: { leaps: [[-3, -3], [-3, -2], [-3, -1], [-3, 0], [-3, 1], [-3, 2], [-3, 3], [-2, -3], [-2, -2], [-2, -1], [-2, 0], [-2, 1], [-2, 2], [-2, 3], [-1, -3], [-1, -2], [-1, -1], [-1, 0], [-1, 1], [-1, 2], [-1, 3], [0, -3], [0, -2], [0, -1], [0, 1], [0, 2], [0, 3], [1, -3], [1, -2], [1, -1], [1, 0], [1, 1], [1, 2], [1, 3], [2, -3], [2, -2], [2, -1], [2, 0], [2, 1], [2, 2], [2, 3], [3, -3], [3, -2], [3, -1], [3, 0], [3, 1], [3, 2], [3, 3]] },
};
/* v1.1.17: das Diagramm nimmt jetzt eine Breite entgegen. In der Wischreihe
   der Aufstellung steht es in einer 132-px-Karte; die feste Breite von
   min(150px, 52vw) haette sie gesprengt. */
/* Der Schein hinter einer Figur, aus ihrer eigenen Farbe: derselbe Hex, auf
   die Deckung des alten Riss-Scheins gebracht (.55). Ohne Farbe bleibt der
   Riss - besser ein ehrliches Violett als gar kein Schein. */
export function schimmer(hex) {
  if (!hex || hex[0] !== "#" || hex.length !== 7) return T.riftGlow;
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},.55)`;
}

/* Eine Farbe mit Deckung versehen - die Ringfarben der Symbole kommen als
   #rrggbb, #rgb oder rgb()/rgba(). */
function farbeMitDeckung(farbe, a) {
  if (!farbe) return `rgba(167,139,250,${a})`;
  if (farbe.startsWith("#")) {
    let h = farbe.slice(1);
    if (h.length === 3) h = h.split("").map((x) => x + x).join("");
    const n = parseInt(h.slice(0, 6), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  const m = farbe.match(/rgba?\(([^)]+)\)/);
  if (m) { const t = m[1].split(",").slice(0, 3).map((x) => x.trim()); return `rgba(${t.join(",")},${a})`; }
  return farbe;
}
export function MoveDiagram({ kind, moveSpec, extra = null, breite = null, talente = null }) {
  const sp = specForKind(kind, moveSpec);
  // DER GROSSE DRACHE (Besitzer, v0.72.3): er ist KEIN einzelnes Feld - er
  // deckt 2x2 und schiebt diesen Block um ein Feld in die vier Richtungen.
  // Bisher zeigte das Blatt ihn als Punkt mit 3x3-Umfeld; richtig sind ein
  // goldener VIERERBLOCK und die Felder, die der geschobene Block neu
  // betritt (Gesamtausdehnung 4x4).
  const grossDrache = kind === "D";
  if (!sp && !extra && !grossDrache) return null;
  const R = 3;                                     // radius → 7x7 board (fits knight L and 2-3 slides)
  const N = R * 2 + 1;
  const reach = new Map();                          // "df,dr" → "slide" | "leap" | "extra"
  if (sp) {
    const rng = Math.min(sp.range || 1, R);
    for (const [df, dr] of sp.slides || [])
      for (let k = 1; k <= rng; k++) reach.set(`${df * k},${dr * k}`, "slide");
    for (const [df, dr] of sp.leaps || [])
      if (Math.abs(df) <= R && Math.abs(dr) <= R) reach.set(`${df},${dr}`, "leap");
  }
  // ability squares glow green, ON TOP of the base pattern
  if (extra) for (const [df, dr] of extra.leaps || [])
    if (Math.abs(df) <= R && Math.abs(dr) <= R) reach.set(`${df},${dr}`, "extra");
  /* ── JEDES TALENT IN SEINER FARBE (v1.5.0, Besitzerwunsch) ────────────────
     "Besser waere sogar, wenn jede Faehigkeit eine eigene Farbe bekommt,
     sodass ich sofort sehe, welche Faehigkeit welche Zuege ermoeglicht."

     Bisher trugen ALLE Zusatzfelder dasselbe Gruen - man sah, DASS ein Talent
     etwas hinzufuegt, nicht WELCHES. Jetzt bekommt jedes seine Farbe aus
     talentFarbe() (die Art gibt den Ton, die Stellung unter den Geschwistern
     die Nuance), und das Feld merkt sich, von wem es stammt.

     Reihenfolge ist Absicht: das ZULETZT eingetragene Talent gewinnt ein
     Feld, das zwei Talente erreichen. Sonst gaebe es Mischfarben, die zu
     keinem Zeichen unter der Karte passen. */
  for (const t of (talente || [])) {
    const spec = ABILITY_MOVE[t]; if (!spec) continue;
    for (const [df, dr] of spec.leaps || [])
      if (Math.abs(df) <= R && Math.abs(dr) <= R) reach.set(`${df},${dr}`, "t:" + t);
  }
  // Der Block sitzt auf (0,0) und (1,0) sowie (0,1) und (1,1).
  const blockFelder = grossDrache ? [[0, 0], [1, 0], [0, 1], [1, 1]] : [[0, 0]];
  if (grossDrache) {
    /* v1.1.3 (Besitzerbefund: "Es sollte sich symmetrisch verhalten, und er
       belegt vier Felder - nicht links unten eins. In Bild 2 sieht man, dass
       du nicht verstanden hast, wie er ziehen soll."): ER HAT RECHT, und zwar
       zweifach. Erstens kannte das Diagramm nur vier Richtungen - die
       Diagonalen fehlten, wie im Kern. Zweitens malte es sie fuer JEDES der
       vier Blockfelder einzeln: daraus entstand ein krummes Muster mit
       einzelnen Feldern an der Seite, das nichts mit dem Zug zu tun hatte.

       Richtig ist: der Drache zieht wie ein KOENIG, einen Schritt in alle
       acht Richtungen - nur wandert sein ganzer 2x2-Block mit. Gezeichnet
       wird deshalb, wo der BLOCK nach dem Schritt LIEGT: acht verschobene
       Bloecke, symmetrisch um den eigenen. Der eigene Block bleibt frei. */
    const RICHTUNGEN = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (const [dx, dy] of RICHTUNGEN)
      for (const [bx, by] of blockFelder) {
        const f = bx + dx, r = by + dy;
        if (blockFelder.some(([qx, qy]) => qx === f && qy === r)) continue;   // eigener Block
        if (Math.abs(f) <= R && Math.abs(r) <= R) reach.set(`${f},${r}`, "slide");
      }
  }
  const cells = [];
  for (let r = R; r >= -R; r--) for (let f = -R; f <= R; f++) {
    const here = blockFelder.some(([bx, by]) => bx === f && by === r);
    const mark = here ? null : reach.get(`${f},${r}`);
    const light = (f + r + 100) % 2 === 0;
    cells.push({ f, r, here, mark, light });
  }
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(${N}, 1fr)`, gap: 1.5, width: breite || "min(150px, 52vw)",
    padding: 4, borderRadius: 8, background: "rgba(8,12,22,.55)", border: "1px solid #ffffff10" }}>
    {cells.map((c, i) => <div key={i} style={{ aspectRatio: "1", borderRadius: 3, position: "relative",
      background: c.here ? "linear-gradient(160deg,#e7c877,#b1863c)"
        : c.mark === "slide" ? "rgba(74,163,232,.42)"
        : c.mark === "leap" ? "rgba(233,197,63,.5)"
        : c.mark && c.mark.startsWith("t:") ? farbeMitDeckung(iconFarbe(c.mark.slice(2)), 0.82)   /* v1.26.6: Farbe des Symbols */
        : c.mark === "extra" ? "rgba(62,224,137,.62)"
        : c.light ? "rgba(255,255,255,.05)" : "rgba(255,255,255,.02)",
      boxShadow: c.here ? "0 0 5px rgba(231,200,119,.7)" : c.mark === "extra" ? "inset 0 0 0 1px rgba(120,255,180,.5)" : c.mark ? "inset 0 0 0 1px rgba(255,255,255,.18)" : "none" }}>
      {c.here && c.f === 0 && c.r === 0 && <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center",
        fontSize: 8, fontWeight: 900, color: "#1a1206" }}>✦</span>}
    </div>)}
  </div>;
}
const MOVE_LEGEND = { de: "Blau: Gleiten · Gelb: Sprung · ✦ die Figur", en: "Blue: slide · Yellow: leap · ✦ the piece" };
const MOVE_LEGEND_ABILITY = { de: "Grün: neue Felder durch diese Fähigkeit", en: "Green: squares this ability adds" };

export function ChroniclePanel({ profile, t, en, account = null }) {
  const [openId, setOpenId] = useState(null);
  const met = new Set(profile.codex?.met || []);
  // THE KEEPER OF THE RECORD sees the whole record. For a player the chronicle
  // is earned page by page; for an admin it is a working reference — every
  // figure legible at once, with nothing to unlock or toggle first.
  const isAdmin = !!account?.isAdmin;
  // seen = recruited OR met in battle. Base moves are only revealed once you
  // have actually LIVED the piece — recruited, or faced across the board.
  const seenChar = (ch) => isAdmin || isUnlocked(ch, profile) || met.has(ch.kind);
  const seenBoss = (b) => isAdmin || met.has("X:" + b.id) || (profile.campaign?.bribedBosses || []).includes(b.id)
    || ownedLeagueBosses(profile).includes(b.id);
  /* v1.0.50: auch die Chronik schweigt ueber den Gambit, bis er erwacht ist
     (sein kind "P" waere durch jeden Bauern sofort "begegnet"). */
  const figures = CHARACTER_LIST.filter((c) => c.id !== "gambit" || gambitWach(profile));
  const FAM = { golem: ["Golems", "Golems"], beast: ["Bestien", "Beasts"], serpent: ["Schlangen", "Serpents"], wraith: ["Schemen", "Wraiths"], tyrant: ["Tyrannen", "Tyrants"] };
  return <div style={{ display: "grid", gap: 8 }}>
    <div className="gg-serif" style={{ fontSize: 12.5, color: "#a9a28a", fontStyle: "italic", lineHeight: 1.5, padding: "2px 4px" }}>
      {t("chron.law")}</div>
    {figures.map((ch) => {
      const open = openId === ch.id;
      const seen = seenChar(ch);
      const rungs = ch.ladder.filter((r) => r.ability);
      // Jede Figur kam durch den Riss - deshalb umfasst sie sein Licht:
      // ruhig im Regal, leuchtend sobald sie aufgeschlagen wird.
      return <div key={ch.id} style={{ borderRadius: 12, border: `1px solid ${open ? T.riftLine : "rgba(124,58,237,.4)"}`,
        boxShadow: open ? `0 0 16px ${T.riftGlow}` : "0 0 7px rgba(124,58,237,.16)",
        background: "linear-gradient(180deg, rgba(30,18,58,.55), rgba(6,4,12,.7))", overflow: "hidden" }}>
        <button onClick={() => seen && setOpenId(open ? null : ch.id)} style={{ display: "flex", alignItems: "center", gap: 10,
          width: "100%", padding: "8px 10px", background: "none", border: "none", cursor: seen ? "pointer" : "default", textAlign: "left" }}>
          {/* BOTH FACES OF A FIGURE: the painting as she appears in battle and,
              beside it, the plain vector sigil — the shape you read at a glance
              on the board. The chronicle is a reference, so it shows both. */}
          <span style={{ display: "flex", alignItems: "flex-end", gap: 6, flex: "0 0 auto" }}>
            <span style={{ width: 40, height: 50, display: "grid", placeItems: "center" }}>
              {(!schlichtAn() && bildnisVon(ch.id, characterLevel(profile, ch.id) || 1))
                ? <img src={bildnisVon(ch.id, characterLevel(profile, ch.id) || 1)} alt="" style={{ width: 40, height: 50, objectFit: "contain", objectPosition: "bottom",
                    filter: seen ? "none" : "grayscale(1) brightness(.4)" }} />
                : <PieceArt kind={ch.kind} size={32} level={1} />}
            </span>
            <span title={en ? "vector sigil" : "Vektor-Zeichen"} style={{ width: 30, height: 50, display: "grid", placeItems: "center",
              opacity: seen ? 0.95 : 0.4, filter: seen ? "none" : "grayscale(1) brightness(.5)" }}>
              <PieceArt kind={ch.kind} size={28} level={1} />
            </span>
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span className="gg-quill" style={{ display: "block", fontSize: 14.5, color: seen ? T.text : "#79735f" }}>{seen ? (en ? ch.nameEn : ch.nameDe) : "???"}</span>
            {!seen && <span style={{ fontSize: 11, color: "#6c6653" }}><LockIc size={10} /> {en ? "not yet encountered" : "noch nicht begegnet"}</span>}
          </span>
          {seen && <span style={{ color: "#c9b26a", fontSize: 12 }}>{open ? "▾" : "▸"}</span>}
        </button>
        {open && seen && <div style={{ padding: "0 12px 11px", display: "grid", gap: 8 }}>
          <div>
            <div className="gg-serif" style={{ fontSize: 10.5, letterSpacing: ".12em", color: "#c9b26a", marginBottom: 3 }}>{t("chron.moves").toUpperCase()}</div>
            <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "#ddd6bd", marginBottom: 7 }}>{describeMoves(ch, en)}</div>
            {/* v1.5.0: die Talente der Figur faerben ihre Zusatzfelder. So
                sieht man ohne Antippen, welche Faehigkeit welche Zuege
                eroeffnet - der Wunsch des Besitzers. */}
            <MoveDiagram kind={ch.kind} moveSpec={ch.moveSpec}
              talente={(ch.ladder || []).map((x) => x.ability).filter(Boolean)} />
            <div style={{ fontSize: 10, color: "#8a856f", marginTop: 4, fontStyle: "italic" }}>{en ? MOVE_LEGEND.en : MOVE_LEGEND.de}</div>
          </div>
          {rungs.length > 0 && <div>
            <div className="gg-serif" style={{ fontSize: 10.5, letterSpacing: ".12em", color: "#c9b26a", marginBottom: 4 }}>{t("chron.abilities").toUpperCase()}</div>
            <div style={{ display: "grid", gap: 6 }}>
              {rungs.map((rg) => { const ab = ABILITIES[rg.ability]; const mv = ABILITY_MOVE[rg.ability];
                /* v1.0.44: dieselben drei Stufen wie in der Akademie. Die
                   Chronik ist ein NACHSCHLAGEWERK - was es noch nicht gibt,
                   gehoert nicht hinein; was gesperrt ist, schon, aber mit
                   seinem Grund. */
                const zst = faehigkeitZustand(rg.ability, hpWach(profile));
                if (zst === "verborgen") return null;
                return <div key={rg.ability} style={{ fontSize: 12, lineHeight: 1.5, color: "#c9c3aa",
                  opacity: zst === "wirkt" ? 1 : 0.62 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#f6e4a8", fontWeight: 800 }}>
                    <AbilityIcon id={ab.id} size={22} /> {ab[en ? "nameEn" : "nameDe"]}</span>
                  <span className="gg-serif" style={{ color: "#a9a28a", fontSize: 11 }}> · {en ? "from level" : "ab Stufe"} {rg.level}</span>
                  {" — "}{ab[en ? "descEn" : "descDe"]}
                  {zst !== "wirkt" && <div className="gg-serif" style={{ marginTop: 4, fontSize: 11, color: "#9a92cf",
                    fontStyle: "italic", display: "inline-flex", alignItems: "flex-start", gap: 5, lineHeight: 1.45 }}>
                    <LockIc size={10} /> <span>{en ? SPERRGRUND[zst].en : SPERRGRUND[zst].de}</span></div>}
                  {mv && <div style={{ marginTop: 5, marginBottom: 3 }}>
                    <MoveDiagram kind={ch.kind} moveSpec={ch.moveSpec} extra={mv} />
                    <div style={{ fontSize: 9.5, color: "#7fb98f", marginTop: 3, fontStyle: "italic" }}>{en ? MOVE_LEGEND_ABILITY.en : MOVE_LEGEND_ABILITY.de}</div>
                  </div>}</div>; })}
            </div>
          </div>}
        </div>}
      </div>; })}

    {/* ── THE BESTIARY: monsters of the rift, revealed once faced ── */}
    <div className="gg-serif" style={{ fontSize: 11, letterSpacing: ".14em", color: "#c9b26a", textTransform: "uppercase",
      marginTop: 10, marginBottom: 2, padding: "2px 4px" }}>{en ? "Bestiary" : "Bestiarium"}</div>
    {BOSSES.map((b) => {
      const open = openId === "X:" + b.id;
      const seen = seenBoss(b);
      const fam = FAM_LABEL[b.art] ? (en ? FAM_LABEL[b.art][1] : FAM_LABEL[b.art][0]) : b.art;
      return <div key={b.id} style={{ borderRadius: 12, border: `1px solid ${open ? T.riftLine : "rgba(124,58,237,.4)"}`,
        boxShadow: open ? `0 0 16px ${T.riftGlow}` : "0 0 7px rgba(124,58,237,.16)",
        background: "linear-gradient(180deg, rgba(46,24,40,.42), rgba(14,10,18,.6))", overflow: "hidden" }}>
        <button onClick={() => seen && setOpenId(open ? null : "X:" + b.id)} style={{ display: "flex", alignItems: "center", gap: 10,
          width: "100%", padding: "8px 10px", background: "none", border: "none", cursor: seen ? "pointer" : "default", textAlign: "left" }}>
          <span style={{ width: 40, height: 50, flex: "0 0 auto", display: "grid", placeItems: "center" }}>
            {(paintedById("boss-" + b.id) || paintedById("boss-" + b.art))
              ? <img src={paintedById("boss-" + b.id) || paintedById("boss-" + b.art)} alt="" style={{ width: 40, height: 50, objectFit: "contain", objectPosition: "bottom",
                  filter: seen ? "none" : "grayscale(1) brightness(.35)" }} />
              : <span style={{ fontSize: 24, filter: seen ? "none" : "grayscale(1) brightness(.4)" }}>👁</span>}
          </span>
          {/* the monster's vector sigil beside its portrait, same as the court */}
          <span title={en ? "vector sigil" : "Vektor-Zeichen"} style={{ width: 30, height: 50, flex: "0 0 auto", display: "grid", placeItems: "center",
            opacity: seen ? 0.95 : 0.4, filter: seen ? "none" : "grayscale(1) brightness(.5)" }}>
            <PieceArt kind={b.kind} art={b.art} size={28} level={1} fill="#5b2f3f" rim="#e7b7c9" detail="#c58fa6" />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span className="gg-quill" style={{ display: "block", fontSize: 14.5, color: seen ? "#e7b7c9" : "#79735f" }}>{seen ? (en ? b.nameEn : b.nameDe) : "???"}</span>
            <span style={{ fontSize: 11, color: seen ? "#a98ba0" : "#6c6653" }}>{seen ? fam : (en ? "a shadow on the road" : "ein Schemen auf der Straße")}</span>
          </span>
          {seen && <span style={{ color: "#c9b26a", fontSize: 12 }}>{open ? "▾" : "▸"}</span>}
        </button>
        {open && seen && <div style={{ padding: "0 12px 11px", display: "grid", gap: 8 }}>
          <div>
            <div className="gg-serif" style={{ fontSize: 10.5, letterSpacing: ".12em", color: "#c9b26a", marginBottom: 3 }}>{t("chron.moves").toUpperCase()}</div>
            <MoveDiagram kind={null} moveSpec={b.moveSpec} />
            <div style={{ fontSize: 10, color: "#8a856f", marginTop: 4, fontStyle: "italic" }}>{en ? MOVE_LEGEND.en : MOVE_LEGEND.de}</div>
          </div>
          {(en ? b.hintEn : b.hintDe) && <div className="gg-serif" style={{ fontSize: 12, fontStyle: "italic", color: "#b7a9b2", lineHeight: 1.5 }}>„{en ? b.hintEn : b.hintDe}“</div>}
        </div>}
      </div>; })}
  </div>;
}

function CharCard({ char, profile, dispatch, t, en, onZoom, open = true, onToggle, bigArt = false }) {
  /* v1.0.67: VERBESSERN-GLANZ (Besitzer: "dass hier wirklich, richtig
     gestiegen ist" - und auch die Figur, deren Bild sich nicht aendert,
     "trotzdem so einen Schein bekommt"). Jeder Stufenkauf zaehlt glanz hoch;
     der key erzwingt den Neustart der Animation, ein Lichtstreif laeuft
     uebers Portraet und ein Sternenstoss feiert - unabhaengig davon, ob die
     Stufe ein neues Gemaelde bringt. */
  const [glanz, setGlanz] = useState(0);
  /* v1.0.70: bringt die NAECHSTE Stufe eine Faehigkeit, wird der Glanz
     violett und die frisch erwachte Sprosse pulst - der Spieler soll den
     Unterschied zwischen "eine Stufe mehr" und "eine FAEHIGKEIT mehr"
     sehen, nicht nachlesen. */
  const [faehig, setFaehig] = useState(null);      // ability-id der eben erwachten Sprosse
  /* v1.0.75: die Feier - was gerade gefeiert wird, oder null. */
  const [feier, setFeier] = useState(null);
  const [frisch, setFrisch] = useState(0);         // deren Stufe, fuer den Sprossenpuls
  const unlocked = isUnlocked(char, profile);
  const bossNode = CAMPAIGN.find((n) => n.boss?.piece === char.id);
  const abWide = useMedia("(min-width: 680px)");
  /* v1.26.7: der Aufklappzustand der Leiter lebt jetzt im Bauteil Aufstiegsplan */

  // Locked pieces stay a MYSTERY: a grayed silhouette, the name, and only the
  // place where their boss awaits — no stats, no abilities, pure temptation.
  const epic = !!char.epic;
  if (!unlocked) {
    return (
      <Panel style={{ position: "relative", overflow: "hidden", opacity: 0.62 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, filter: "grayscale(1)" }}>
          <div style={{ width: 46, height: 48, flex: "0 0 auto", opacity: 0.75 }}>
            {/* locked pieces stay a mystery: always the plain silhouette, never the painting */}
            <PieceGlyph piece={{ kind: char.kind, color: "w", level: 1, abilities: [], used: {}, shield: 0 }} artStyle="svg" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="gg-quill" style={{ fontSize: 18, letterSpacing: ".03em", color: T.dim }}>{en ? char.nameEn : char.nameDe}</div>
            {(en ? char.flavorEn : char.flavorDe) && (
              <div className="gg-serif" style={{ fontSize: 11.5, color: "#9a947f", fontStyle: "italic", marginTop: 2, lineHeight: 1.4 }}>
                „{en ? char.flavorEn : char.flavorDe}“
              </div>
            )}
            <div style={{ fontSize: 12, color: T.faint, marginTop: 3 }}>
              <LockIc size={12} /> {bossNode ? t("army.lockedBoss", { place: bossNode.place }) : t("army.locked")}
            </div>
          </div>
          <span style={{ display: "grid", placeItems: "center" }}><LockIc size={19} /></span>
        </div>
      </Panel>
    );
  }

  const level = unlocked ? characterLevel(profile, char.id) : 1;
  /* v1.0.79: das Bildnis dieser Figur - beim Gambit das seines RANGES. */
  /* v1.24.5: dasselbe Bildnis wie die Kachel. Beim Gambit und beim Bauern
     haengt das Gemaelde an der Stufe (gambit-t1..t6); zeigte das Blatt eine
     andere Stufe als die Kachel, standen zwei verschiedene Figuren da. */
  const portraet = bildnisVon(char.id, level);
  const chosen = chosenAbilities(profile, char.id);
  const { abilities, shield } = resolveCharacter(char, level, chosen);
  const stars = dupeCount(profile, char.id);
  const isKing = char.kind === "K";
  /* v1.22.0: das Blatt rechnet wie der Kern (werteBeiStufe) - vorher stand
     hier eine DRITTE Staffelung (+1 Angriff alle zwei Stufen). */
  const _w = werteBeiStufe(char.kind, level, { maxLevel: maxLevelFor(char.id), punkte: punkteVon(char.id) });
  /* v1.25.6: keine Schilde im Leben mehr - dieselbe Rechnung wie im Kern
     (setup.js), samt Heldenbudget fuer den Gambit. */
  /* v1.25.6: dieselbe Rechnung wie im Kern, Angriff als Rest - sonst 37. */
  /* ── v1.26.4 (Besitzer): "das Angriff und Leben springt zurueck und
     verhaelt sich gar nicht wie es sollte - und nur in der letzten Stufe
     duerfen Rot und Blau sich beruehren."
     GEMESSEN, beim Gambit: der Kern rechnet das Heldenbudget schon ein
     (punkte: HELD_PUNKTE) und liefert 2/1 auf Stufe 1 bis 26/10 auf Stufe 20.
     Hier wurde AUF JEDER STUFE noch einmal auf 36 hochskaliert - von der
     jeweiligen Stufe aus. Das Blatt zeigte deshalb 24/12 auf Stufe 1, 27/9 auf
     Stufe 2 und 25/11 auf Stufe 5: immer volle 36, und dazwischen RUECKWAERTS.
     Der Ring war dadurch immer voll, Rot beruehrte Blau schon auf Stufe 1.
     Jetzt gilt der Kern unveraendert. */
  const maxHp = _w.hp;
  const atk = _w.atk;
  /* ── v1.25.0 (Besitzer): WAS DIE NAECHSTE STUFE WIRKLICH BRINGT ───────────
     "Da steht naechste +1, aber das stimmt teilweise gar nicht. Bei der einen
      geht es bei der naechsten Stufe plus 3 Angriff, bei der anderen plus 2
      Leben - das muss hier richtig stehen."
     Richtig: das "+1" war fest hingeschrieben. Die Werte wachsen aber am
     VERHAELTNIS Stufe zu Hoechststufe, und die Schilde kommen sprungweise auf
     ihren eigenen Sprossen dazu. Beides wird jetzt ausgerechnet, indem die
     naechste Stufe durch dieselbe Kernrechnung geschickt wird - Differenz
     statt Annahme. Auf der Hoechststufe steht nichts mehr da. */
  const _wNext = level < maxLevelFor(char.id)
    ? werteBeiStufe(char.kind, level + 1, { maxLevel: maxLevelFor(char.id), punkte: punkteVon(char.id) }) : null;

  /* v1.26.4: der Zuwachs ist die reine Differenz zweier Kernstufen - ohne das
     zweite Hochskalieren, das beim Gambit auch hier stand. */
  const plusAtk = _wNext ? Math.max(0, _wNext.atk - atk) : 0;
  const plusHp = _wNext ? Math.max(0, _wNext.hp - maxHp) : 0;
  const rungs = char.ladder.filter((r) => r.ability).map((r) => ({ level: r.level, id: r.ability }));
  const maxed = level >= maxLevelFor(char.id);
  const cost = upgradeCost(char.id, level);
  const affordable = canUpgrade(profile, char.id);


  const INK = "#cfc9b4"; // body text a notch brighter than T.dim — readability pass
  const fam = familyOf(char.kind);
  return <Panel style={{ opacity: unlocked ? 1 : 0.74, height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
    {/* THE DOSSIER HEAD: a wanted-poster masthead — portrait to the side, name
        and house up top, the game's own stat orbs for instant recognition, and
        the vital lines beneath in a ledger rhythm. */}
    {/* ── DIE BUEHNE (Entwurf 8) - nur im grossen Blatt ──────────────── */}
    {bigArt ? (() => {
      const kul = KULISSE_URL[kulisseFuer({ charId: char.id })];
      const pid = paintedIdOf(portraet) || char.id;
      const ton = figurFarbe(pid) || "#5b3fa6";
      const mx = maxLevelFor(char.id);
      const wMax = werteBeiStufe(char.kind, mx, { maxLevel: mx, punkte: punkteVon(char.id) });
      const budget = wMax.hp + wMax.atk;   /* v1.26.4: mit Heldenbudget, wie die Kachel */
      const band = rohrAnteile({ hp: maxHp, maxHp, atk, level, maxLevel: mx, budget });
      return <BlattBuehne kennung={char.id} name={en ? char.nameEn : char.nameDe}
        haus={epic ? (en ? "The Grand Gambit" : "Der Grand Gambit") : fam ? (en ? FAMILIES[fam].en : FAMILIES[fam].de) : (en ? "Free piece" : "Freie Figur")}
        satz={!epic ? (en ? char.flavorEn : char.flavorDe) : ""} portraet={portraet} pid={pid} ton={ton} kul={kul}
        form={formFuer({ charId: char.id })} stufe={level} maxStufe={mx}
        zugKind={char.kind} moveSpec={char.moveSpec} talente={chosen}
        zeichen={rungs.map((r) => ({ id: r.id, gelernt: chosen.includes(r.id) }))}
        band={{ leben: band.leben, kraft: band.kraft }}
        atk={atk} maxHp={maxHp} plusAtk={plusAtk} plusHp={plusHp} werteAn={hpUnlocked(profile)} maxed={maxed} en={en}
        tonStaerke={0.30}
        knopf={open && unlocked ? (<div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 11, padding: "8px 10px",
        background: T.panel2, borderRadius: T.radiusSm, border: `1px solid ${T.line}` }}>
        {/* ── v1.26.4 (Besitzer): KEIN "Stufe 1 -> 2" MEHR, DER KNOPF UEBER DIE
            GANZE BREITE. Und die alte Staffel ist weg: hier stand noch
            hpAt = BASE_HP + (l-1) und atkAt = BASE_ATK + floor((l-1)/2) - das
            "+1 Angriff alle zwei Stufen" von vor v1.22.0. Es rechnete neben
            werteBeiStufe her; der Zuwachs, den diese Zeile nannte, war deshalb
            ein anderer als der, den die Figur nach dem Klick wirklich bekam -
            und die Werte schienen zurueckzuspringen. Was man bekommt, steht
            jetzt nur noch EINMAL: in den Wertkaesten darueber, dort aus
            derselben Kernrechnung wie das Gefecht. */}
        {char.id === "gambit" && <div className="gg-serif" style={{ width: "100%", textAlign: "center", color: T.goldBright,
          letterSpacing: ".05em", fontSize: 12.5, marginBottom: 6 }}>
          {"✦".repeat(gambitTier(level))} {t("army.stufe", { r: ["I", "II", "III", "IV", "V", "VI"][gambitTier(level) - 1] })}</div>}
        {maxed && <div className="gg-serif" style={{ width: "100%", textAlign: "center", color: T.faint, letterSpacing: ".03em" }}>{t("army.maxed")}</div>}
        {/* v1.26.7: derselbe Knopf wie beim Monster (VerbessernKnopf) */}
        {!maxed && <VerbessernKnopf kann={affordable} kosten={cost} t={t} onClick={() => { klang("stufe");
            if (animAn()) {
              const sprosse = rungs.find((r) => r.level === level + 1);
              setFaehig(sprosse ? sprosse.id : null);
              setFrisch(sprosse ? sprosse.level : 0);
              setGlanz((n) => n + 1);
              /* v1.0.73: der Glanz klingt - und eine FAEHIGKEIT klingt
                 anders als eine blosse Stufe (violetter Kristallschimmer
                 statt goldenem Wusch), genau wie im Bild. */
              setTimeout(() => { try { klang(sprosse ? "faehigkeit" : "glanz"); } catch {} }, 140);
            }
            /* v1.0.75: WECHSELT DER GAMBIT SEINE STUFE, wird das gefeiert -
               mit seinem neuen Antlitz und der Zeile dazu. Der Vergleich
               laeuft ueber gambitTier VOR und NACH dem Schritt; nur der
               Sprung zaehlt, nicht jedes Level. */
            if (char.id === "gambit" && gambitTier(level + 1) > gambitTier(level)) {
              const neuerRang = gambitTier(level + 1);
              setTimeout(() => setFeier({ art: "rang", tier: neuerRang,
                bild: paintedForPiece({ kind: "P", color: "w", hero: true, level: level + 1, tier: neuerRang }) }), 620);
            }
            dispatch({ type: "UPGRADE_PIECE", id: char.id }); }} />}
      </div>) : null} />;
    })() : (
    <div style={{ display: "flex", gap: 13, alignItems: "stretch", cursor: onToggle ? "pointer" : "default" }}
      onClick={onToggle ? (e) => { e.stopPropagation(); onToggle(); } : undefined}>
      {/* v1.0.65 (Besitzerentscheid): DAS BILD STEHT FREI - wie beim Monster.
          Bis hierher sass die Figur in einer gerahmten Platte: goldene Kontur,
          eigener Grund, abgerundete Ecken, Bild darin beschnitten. Das
          Monsterblatt hat nie eine gehabt; es stellt sein Gemaelde einfach neben
          den Namen und laesst es leuchten. Der Besitzer hat beide nebeneinander
          gesehen und das freie Bild gewaehlt - "das bitte komplett uebernehmen
          auf alle Figuren".
          Also faellt die Platte: kein Rahmen, kein Grund, kein overflow-hidden
          (das schnitt eine gross gezogene Figur ab). Was bleibt, ist das MASS -
          sonst rutschte die Schrift daneben - und was dazukommt, ist genau die
          Behandlung der Monsterkarte: unten verankert, mit Schein. */}
      <div style={{ flex: "0 0 auto", position: "relative",
        width: bigArt ? 148 : 92, minHeight: bigArt ? 178 : 128,
        display: "grid", placeItems: "center" }}>
        {glanz > 0 && <span key={glanz} aria-hidden style={{ position: "absolute", inset: 0,
          overflow: "hidden", borderRadius: 10, pointerEvents: "none", zIndex: 3 }}>
          <span style={{ position: "absolute", top: "-8%", bottom: "-8%", width: "34%",
            background: faehig
              ? "linear-gradient(105deg, rgba(196,181,253,0) 0%, rgba(196,181,253,.9) 50%, rgba(196,181,253,0) 100%)"
              : "linear-gradient(105deg, rgba(255,246,214,0) 0%, rgba(255,246,214,.85) 50%, rgba(255,246,214,0) 100%)",
            animation: "ggGlanzLauf 1.15s ease-out both" }} />
          <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center",
            fontSize: 30, color: faehig ? "#c4b5fd" : T.gold,
            textShadow: faehig ? "0 0 12px rgba(167,139,250,.95)" : "0 0 12px rgba(233,207,138,.95)",
            animation: "ggStufenStern 1.1s ease-out .12s both" }}>✦</span>
        </span>}
        {/* v1.0.79 (Besitzer: "das neue Bild wird danach gar nicht
            uebernommen"): DAS PORTRAET NAHM STUR paintedById(char.id), also
            immer "gambit" - den Rang hat es nie gelesen. v1.0.74 hatte nur
            die KACHEL (TileArt) geheilt, nicht das grosse Bild darunter.
            Jetzt waehlt eine Zeile das Rangbild; fuer alle anderen Figuren
            aendert sich nichts. */}
        {portraet
          ? <img src={portraet} alt="" onClick={unlocked && onZoom ? (e) => { e.stopPropagation(); onZoom(char); } : undefined}
              title={unlocked && onZoom ? (en ? "Tap to enlarge" : "Antippen zum Vergrößern") : undefined}
              /* v1.0.49 (Besitzerbefund): DIE FIGUR SITZT JETZT UEBER IHRER
                 SCHRIFT. Das Bild war zentriert, der INHALT darin aber nicht -
                 jede Figur sitzt anders weit aus der Bildmitte, und das Brett
                 gleicht das ueber PAINTED_FIT.x aus. Der Hofstaat tat es
                 nicht, also standen die Figuren neben ihrem Namen. Derselbe
                 Wert, gegenlaeufig angewandt: -x schiebt den Inhalt zurueck
                 in die Mitte der Platte. */
              /* v1.0.65: dieselben Werte wie im Monsterblatt - unten verankert
                 (die Figuren stehen auf einer Linie statt in der Luft zu
                 schweben) und mit dem violetten Schein statt eines Rahmens. */
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain",
              objectPosition: "bottom",
              /* v1.23.6 (Besitzer): "es ist ja immer so ein Schimmer hinter den
                 Figuren - nimm dafuer bitte auch die Farbe, die du fuer das
                 Emblem holst." Bisher schien hinter JEDER Figur dasselbe
                 Riss-Violett; jetzt schimmert der Springer rot, der Koenig
                 blau, der Magier violett - dieselbe gemessene Figurenfarbe,
                 die auch das Stufen-Abzeichen traegt. Wo keine bekannt ist,
                 bleibt es beim Riss. */
              filter: `drop-shadow(0 0 10px ${schimmer(figurFarbe(paintedIdOf(portraet)))}) drop-shadow(0 3px 5px rgba(0,0,0,.5))`,
              cursor: unlocked && onZoom ? "zoom-in" : "default" }} />
          : <div style={{ padding: 8 }}><Glyph kind={char.kind} level={level} abilities={abilities} shield={shield} hero={epic} art={"painted"} size={bigArt ? 104 : 76} /></div>}
        {/* v1.0.11 (Besitzer): der Vektor-Zwilling im Eck ist fort — die
            Platte gehört ganz dem Gemälde. Das Zeichen lehrt die Chronik. */}
      </div>
      {/* masthead + orbs + ledger */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8,
          paddingRight: bigArt ? 26 : 0 }}>
          <div style={{ minWidth: 0 }}>
            {/* THE LINE BREAK THAT KEPT NOT HAPPENING: name and house were BOTH
                inline-flex, and two inline boxes in a block simply flow side by
                side — which is why the card read "Läufer Freie Figur" on one
                line. Block-level flex gives each its own row, always. */}
            <div className="gg-quill" style={{ fontWeight: 800, fontSize: 19, letterSpacing: ".02em", color: "#f0e8cc",
              display: "flex", alignItems: "center", gap: 7, lineHeight: 1.15 }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{en ? char.nameEn : char.nameDe}</span>
              {onToggle && <span aria-hidden style={{ fontSize: 10, color: T.faint, flex: "0 0 auto",
                transform: open ? "rotate(90deg)" : "none", transition: "transform .15s" }}>▸</span>}
            </div>
            {/* the house line, poster-style */}
            <div style={{ fontSize: 11, color: "#9a8f6f", letterSpacing: ".05em", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
              {fam && <span aria-hidden style={{ width: 8, height: 8, transform: "rotate(45deg)", borderRadius: 2, flex: "0 0 auto",
                background: FAMILIES[fam].color, boxShadow: `0 0 4px ${FAMILIES[fam].color}88` }} />}
              {epic ? (en ? "The Grand Gambit" : "Der Grand Gambit") : fam ? (en ? FAMILIES[fam].en : FAMILIES[fam].de) : (en ? "Free piece" : "Freie Figur")}
            </div>
          </div>
          {stars > 0 && <Chip color="#f6e9a4" bg="linear-gradient(168deg, #2c4f9e 0%, #1b3068 55%, #142450 100%)" style={{ border: "1px solid #e3c07a", flex: "0 0 auto", boxShadow: "0 0 8px rgba(64,110,220,.3)" }}>{"★".repeat(stars)}</Chip>}
        </div>
        {/* the flavour line, in the serif voice — directly under the name and
            house line, BEFORE the stats, as asked */}
        {!epic && (en ? char.flavorEn : char.flavorDe) && (
          <div className="gg-serif" style={{ marginTop: 7, fontSize: 12, lineHeight: 1.4, color: "#b9b295",
            fontStyle: "italic", letterSpacing: ".015em" }}>
            „{en ? char.flavorEn : char.flavorDe}“
          </div>
        )}
        {/* THE ORBS — the same spheres the piece wears in battle, stacked as a
            ledger: one value per line, its name beside it */}
        {/* v1.0.33 (Besitzer): SOLANGE NICHTS BLUTET, SPRICHT NIEMAND VON
            LEBENSPUNKTEN. In Kapitel I ist das Spiel reines Schach - dort
            waeren Angriffsstaerke und Lebenspunkte auf der Figurenkarte
            zwei Zahlen, die nichts tun und nur Fragen aufwerfen. Sie
            erscheinen an dem Tag, an dem die alte Magie erwacht. Was
            BLEIBT, ist alles, was auch im Schach zaehlt: Stufe, Gangart,
            Herkunft, Erzaehlung. */}
        {hpUnlocked(profile) && <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, margin: "10px 0 2px" }}>
          {/* ── v1.25.4 (Besitzer, mehrfach): KEINE PERLEN MEHR ───────────────
              "Die Bubbles Angriff und Leben will ich nicht sehen - egal wo,
               auch in der Akademie und ueberall."
              GEFUNDEN beim Aufraeumen: der Import der Perle war schon
              entfernt, DIESE VIER STELLEN benutzten sie aber weiter - das
              Figurenblatt stuerzte beim Oeffnen ab ("Da ist etwas
              schiefgelaufen"), gefangen von der Messprobe, die den Schimmer
              am geoeffneten Blatt sucht und nichts mehr fand. Statt der
              Perlen stehen die Zahlen schlicht in den Farben des
              Sockelbandes: Rot fuer Leben, Blau fuer Staerke. */}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <b style={{ font: "800 13px/1 Georgia, serif", color: "#b6cdff" }}>{atk}</b>
            <span style={{ fontSize: 10.5, color: "#9a8f6f", letterSpacing: ".04em" }}>{en ? "Attack" : "Angriffsstärke"}</span></span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <b style={{ font: "800 13px/1 Georgia, serif", color: "#ffb3aa" }}>{maxHp}</b>
            <span style={{ fontSize: 10.5, color: "#9a8f6f", letterSpacing: ".04em" }}>{en ? "Life" : "Lebenspunkte"}</span></span>
        </div>}
        {/* the ledger lines */}
        <div style={{ marginTop: 6 }}>
          <SheetRow label={t("army.lvl")}>{level}{maxed && <span style={{ color: "#9a8f6f", fontWeight: 600, fontSize: 11 }}> · {en ? "max" : "max."}</span>}</SheetRow>
          <SheetRow label={en ? "Abilities" : "Fähigkeiten"}>{chosen.length}/{rungs.length}</SheetRow>
        </div>
      </div>
    </div>
    )}
    {/* v1.16.0: DIE BUNDTAFEL - was die Kachel nicht mehr traegt, steht hier,
        in voller Breite unter dem Kopf, nicht in der schmalen Spalte neben dem Bild */}
    {open && <BundTafel profile={profile} charId={char.id} en={en} status={unlocked ? "eigen" : null} />}
    {open && epic && (
      <div style={{ marginTop: 7, fontSize: 11.5, lineHeight: 1.5 }}>
        <span style={{ color: T.gold, fontWeight: 700 }}>{t("army.gambitTag")}</span>{" "}
        <span style={{ color: INK }}>{t("army.gambitExplain")}</span>
      </div>
    )}
    {!unlocked && bossNode && (
      <div style={{ marginTop: 9, fontSize: 12, color: T.dim, display: "flex", alignItems: "center", gap: 6 }}>
        <JewelIc kind="power" size={13} /> {t("army.lockedBoss", { place: bossNode.place })}
      </div>
    )}
    {/* v1.26.3 (Besitzer): im grossen Blatt steht der Verbessern-Knopf jetzt
        OBEN in der Buehne, unter Angriff und Leben - dort, wo man sieht, was
        die naechste Stufe bringt. Hier unten nur noch in der kleinen
        Fassung. */}
    {open && unlocked && !bigArt && (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: 0, marginTop: 11 }}>
        {/* ── v1.26.4 (Besitzer): KEIN "Stufe 1 -> 2" MEHR, DER KNOPF UEBER DIE
            GANZE BREITE. Und die alte Staffel ist weg: hier stand noch
            hpAt = BASE_HP + (l-1) und atkAt = BASE_ATK + floor((l-1)/2) - das
            "+1 Angriff alle zwei Stufen" von vor v1.22.0. Es rechnete neben
            werteBeiStufe her; der Zuwachs, den diese Zeile nannte, war deshalb
            ein anderer als der, den die Figur nach dem Klick wirklich bekam -
            und die Werte schienen zurueckzuspringen. Was man bekommt, steht
            jetzt nur noch EINMAL: in den Wertkaesten darueber, dort aus
            derselben Kernrechnung wie das Gefecht. */}
        {char.id === "gambit" && <div className="gg-serif" style={{ width: "100%", textAlign: "center", color: T.goldBright,
          letterSpacing: ".05em", fontSize: 12.5, marginBottom: 6 }}>
          {"✦".repeat(gambitTier(level))} {t("army.stufe", { r: ["I", "II", "III", "IV", "V", "VI"][gambitTier(level) - 1] })}</div>}
        {maxed && <div className="gg-serif" style={{ width: "100%", textAlign: "center", color: T.faint, letterSpacing: ".03em" }}>{t("army.maxed")}</div>}
        {/* v1.26.7: derselbe Knopf wie beim Monster (VerbessernKnopf) */}
        {!maxed && <VerbessernKnopf kann={affordable} kosten={cost} t={t} onClick={() => { klang("stufe");
            if (animAn()) {
              const sprosse = rungs.find((r) => r.level === level + 1);
              setFaehig(sprosse ? sprosse.id : null);
              setFrisch(sprosse ? sprosse.level : 0);
              setGlanz((n) => n + 1);
              /* v1.0.73: der Glanz klingt - und eine FAEHIGKEIT klingt
                 anders als eine blosse Stufe (violetter Kristallschimmer
                 statt goldenem Wusch), genau wie im Bild. */
              setTimeout(() => { try { klang(sprosse ? "faehigkeit" : "glanz"); } catch {} }, 140);
            }
            /* v1.0.75: WECHSELT DER GAMBIT SEINE STUFE, wird das gefeiert -
               mit seinem neuen Antlitz und der Zeile dazu. Der Vergleich
               laeuft ueber gambitTier VOR und NACH dem Schritt; nur der
               Sprung zaehlt, nicht jedes Level. */
            if (char.id === "gambit" && gambitTier(level + 1) > gambitTier(level)) {
              const neuerRang = gambitTier(level + 1);
              setTimeout(() => setFeier({ art: "rang", tier: neuerRang,
                bild: paintedForPiece({ kind: "P", color: "w", hero: true, level: level + 1, tier: neuerRang }) }), 620);
            }
            dispatch({ type: "UPGRADE_PIECE", id: char.id }); }} />}
      </div>
    )}

    {open && (() => {
      // the Gambit climbs three tiers of ten — the pip row shows the CURRENT
      // tier's ten steps; every other piece keeps its plain ten.
      const tier = char.id === "gambit" ? gambitTier(level) : 1;
      const base = (tier - 1) * 10;
      return <div style={{ display: "flex", gap: 4, marginTop: 13, marginBottom: 2 }} aria-label={t("army.lvl") + " " + level}>
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} style={{ flex: 1, height: 5, borderRadius: 3,
            background: i < level - base ? `linear-gradient(90deg, ${T.lime}, ${T.gold})` : T.panel2,
            boxShadow: i < level - base ? `0 0 6px ${T.gold}66` : "none",
            border: i < level - base ? "none" : `1px solid ${T.line}` }} />
        ))}
      </div>;
    })()}
    {/* v1.24.0: im grossen Blatt steht das Zugbild jetzt OBEN auf der Buehne,
        neben der Figur - der eigene Abschnitt weiter unten zeigte es ein
        zweites Mal. Die Legende zieht mit nach oben, sobald der (i) dort
        sitzt; bis dahin bleibt sie hier bei der kleinen Fassung. */}
    {open && unlocked && char.kind !== "P" && !bigArt && (
      <div style={{ marginTop: 12 }}>
        <div className="gg-serif" style={{ fontSize: 10, letterSpacing: ".12em", color: "#c9b26a", marginBottom: 5 }}>{(en ? "Base moves" : "Grundzüge").toUpperCase()}</div>
        <MoveDiagram kind={char.kind} moveSpec={char.moveSpec} />
        <div style={{ fontSize: 9.5, color: "#8a856f", marginTop: 3, fontStyle: "italic" }}>{en ? MOVE_LEGEND.en : MOVE_LEGEND.de}</div>
      </div>
    )}
    {open && unlocked && <Aufstiegsplan schluessel={char.id} kind={char.kind} rungs={rungs} level={level}
      chosen={chosen} profile={profile} en={en} t={t} dispatch={dispatch} setFeier={setFeier}
      bild={paintedById(char.id)} frisch={frisch} glanz={glanz} />}
  </Panel>;
}

/* ── WIE VIELE ZEICHEN DIE KACHEL TRAEGT (v1.23.6) ────────────────────────
   GEMESSEN an der gebauten Fassung, nicht geschaetzt: die Kachel ist
   119 x 179 px, die Talentspalte beginnt 7 px unter der Oberkante, der Name
   steht bei 153,1 - dazwischen liegen 146 px. Bei 19 px Zeichen und 3 px
   Abstand passen SECHS hinein (129 px), bei 21 px ebenfalls sechs (141 px);
   kleiner zu werden gewinnt also kein einziges Zeichen dazu.

   Sechs klebt mit 5 px am Namen. Der Besitzer hat sich nach dem Bildblatt
   fuer VIER entschieden ("machen wir max. 4 + 6"): das laesst 65 px Luft, die
   Spalte bleibt deutlich kuerzer als die Figur, und die stille Ziffer traegt
   den Rest (Besitzer: "wenn man es wissen will, muss man halt auf die Karte
   druecken, fertig"). Das Antippen der Ziffer oeffnet dasselbe Blatt wie das
   Antippen der Kachel - der Klick steigt einfach auf.

   Die reichsten Figuren: Dame 10, Amazone 9, Erzbischof und Kanzler 7 - die
   Dame zeigt also vier Zeichen und "+6". */
export const TALENT_KACHEL_MAX = 4;

const SlotGlyph = ({ kind, size = 29, art = "painted", hero = false, level = 1, bossId = null }) => (
  // DER DECKEL DER HUELLE: die Groesse mass sich per 9vw am VIEWPORT, nicht an
  // der Zelle - bei 320 px standen Glyphe+Beschriftung 39 px in einer 35-px-
  // Zelle (gemessen, pruefe-textfluss: +0x4px an acht Knoepfen). maxHeight
  // beisst nur, wenn es eng wird; die Glyphe darin passt sich ein (gg-fit-svg).
  <span className="gg-fit-svg" style={{ width: typeof size === "number" ? size : size, height: typeof size === "number" ? size : size,
    maxWidth: "100%", maxHeight: "100%" }}>
    <TileArt kind={kind} size={typeof size === "number" ? size : undefined} hero={hero} level={level} bossId={bossId} tier={hero ? gambitTier(level) : 0} />
  </span>
);

// Classic is fixed standard chess → only non-classic maps are editable.
const FORMATION_MAPS = MAPS; // every board is arrangeable here — even Classic. This is about the FIELD, not the ruleset (quick-play Classic keeps the fixed chess setup regardless)

function FormationEditor({ profile, dispatch, t, en }) {
  const feWide = useMedia("(min-width: 900px)");
  const pieces = CHARACTER_LIST.filter((c) => c.kind !== "P" && isUnlocked(c, profile));
  const unlockedIds = pieces.map((c) => c.id);

  const [mapId, setMapId] = useState(FORMATION_MAPS[0].id); // default: die Klassik-Karte
  const map = mapById(mapId);
  const required = map.formation.required;
  const flexNeed = map.formation.flex;
  // NO DEAD ENDS: a rank saved before the crown was pinned would load with the
  // king off his square — and since that square can no longer be edited, the
  // player could never make it legal again. Anything unlawful falls back to
  // the map's own default, which always seats the crown correctly.
  /* v1.0.20 (Besitzer): ZWEI PLAENE JE BRETT - einer fuers reine Schach, einer
     fuers HP-Gefecht. Wer zwischen beiden wechselt, baut sonst jedes Mal neu.
     Solange Kapitel I reines Schach ist, sieht man hier nur den Schach-Plan;
     die Schiene erscheint erst, wenn das erste Gefecht geschlagen ist. */
  const [regel, setRegel] = useState("chess");
  const loadFormation = (id, rl = regel) => {
    const m = mapById(id);
    const f = profile.loadout.formations?.[formationKey(id, rl)] ?? profile.loadout.formations?.[id];
    return f && formationLegalOn(f, unlockedIds, m, ownedLeagueBosses(profile)) ? f : m.defaultFormation;
  };
  const saved = loadFormation(mapId);
  /* v1.15.0: DREI FAECHER JE BRETT UND REGELWERK. Das aktive Fach ist nach
     formations[key] gespiegelt (decks.js), loadFormation liest also weiter
     dieselbe Stelle. Der Index steht hier nur, damit der Entwurf beim
     Wechsel neu laedt - und fuer die Anzeige. */
  const deckKey = formationKey(mapId, regel);
  const deck = deckStand(profile, deckKey);
  const [umbenennen, setUmbenennen] = useState(null);   // Index des Fachs, dessen Name gerade getippt wird

  const [draft, setDraft] = useState(saved);
  const [pick, setPick] = useState(null);
  // Load the selected map's saved formation when the map changes.
  useEffect(() => { setDraft(loadFormation(mapId)); setPick(null); }, [mapId, regel, deck.aktiv]); // eslint-disable-line

  const legal = formationLegalOn(draft, unlockedIds, map, ownedLeagueBosses(profile));
  const changed = JSON.stringify(draft) !== JSON.stringify(saved);
  const counts = formationCounts(draft);
  const dragonFielded = draft[0] === "dragon" || draft[draft.length - 1] === "dragon";
  const flexCount = draft.filter((id) => id != null && required[id] === undefined).length;
  // the wing eats one flex slot: show the reduced requirement so the chip stays honest

  // THE CROWN'S OWN SQUARES: the king never moves, and his consort's square
  // takes only the queen or the one boss standing in for her. Everything else
  // is yours to arrange — that fixed pair is what makes a rank readable.
  const crown = crownSlots(map.w);

  const [dragonAsk, setDragonAsk] = useState(null); // { slot, wing } awaiting consent
  const pickerRef = useRef(null);
  const scrollToPicker = () => requestAnimationFrame(() =>
    pickerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  const setSlot = (i, id) => {
    if (id === "dragon") {
      const last = draft.length - 1;
      if (i !== 0 && i !== last) { setDragonAsk({ slot: -1 }); return; }   // -1 = "edge only" notice
      setDragonAsk({ slot: i, wing: i === 0 ? 1 : last - 1 });
      return;
    }
    setDraft((d) => {
      const n = [...d]; n[i] = id;
      // the dragon left this slot (or his wing got filled): restore the wing
      const last = n.length - 1;
      if (n[0] !== "dragon" && n[1] == null) n[1] = "knight";
      if (n[last] !== "dragon" && n[last - 1] == null) n[last - 1] = "knight";
      return n;
    });
    setPick(null);
  };
  const confirmDragon = () => {
    const { slot, wing } = dragonAsk;
    setDraft((d) => {
      const n = [...d];
      // clear a previous dragon elsewhere
      const last = n.length - 1;
      if (n[0] === "dragon" && slot !== 0) { n[0] = "knight"; if (n[1] == null) n[1] = "knight"; }
      if (n[last] === "dragon" && slot !== last) { n[last] = "knight"; if (n[last - 1] == null) n[last - 1] = "knight"; }
      n[slot] = "dragon"; n[wing] = null;
      return n;
    });
    // the Grand Gambit never falls to the wing: if his file lies under the
    // block, he steps one column aside (inward)
    const hc = heroColFor(profile, map);
    const covered = slot === 0 ? [0, 1] : [draft.length - 2, draft.length - 1];
    if (covered.includes(hc)) {
      const safe = slot === 0 ? 2 : draft.length - 3;
      dispatch({ type: "SET_HERO_COL", mapId: map.id, col: safe });
    }
    setDragonAsk(null); setPick(null);
  };
  const reqChips = Object.entries(required).map(([id, need]) => ({ id, need, have: counts[id] || 0 }));

  // Full-board live preview: exactly the starting position this formation
  // produces in a match (your side below, a standard opponent above).
  const preview = useMemo(() => {
    if (!legal) return null;
    const levelOf = map.classic ? () => 1 : (id) => characterLevel(profile, id);
    const mine = buildArmyFromFormation(levelOf, draft, map.classic ? null : (id) => chosenAbilities(profile, id), map.classic ? null : (id) => dupeCount(profile, id));
    mine.hero = { col: heroColFor(profile, map), spec: (() => {
      const lvl = map.classic ? 1 : (characterLevel(profile, "gambit") || 1);
      const r = resolveCharacter(CHARACTERS.gambit, lvl, map.classic ? null : chosenAbilities(profile, "gambit"));
      return { kind: "P", level: lvl, abilities: r.abilities, shield: r.shield, tier: gambitTier(lvl) };
    })() };
    const foe = buildAiArmyForMap("easy", map, 0);
    return createGame(mine, foe, { map, rules: "hp", seed: 1 });
  }, [draft, mapId, legal, profile]); // eslint-disable-line

  return <>
  <Panel>
    <PanelTitle>{t("army.formation")}</PanelTitle>   {/* v1.0.14: der 2er-Zwang faellt, der Grundabstand traegt */}
    {/* v1.0.20 (Besitzer): ZWEI PLAENE, ABER ERST WENN ES SIE BRAUCHT.
        Solange die alte Magie schlaeft, gibt es nur Schach - eine Schiene mit
        einer sinnlosen zweiten Wahl waere blosser Laerm. Sie erscheint an dem
        Tag, an dem die erste Figur blutet. */}
    {hpUnlocked(profile) && <>
      <Segmented value={regel} onChange={setRegel}
        options={[{ value: "chess", label: t("army.planChess") }, { value: "hp", label: t("army.planHp") }]} />
      {/* v1.2.1 (Besitzer: "der Erklaertext ist denke ich nicht noetig"): die
          beiden Knoepfe heissen Schach und HP-Gefecht - mehr muss man dazu
          nicht sagen. Der Platz gehoert der Wischreihe darunter. */}
      <div style={{ height: 8 }} />
    </>}
    {/* v0.52: Aufstellungs-Erklaertext raus - Herald und Akademie tragen das Wissen. */}
    {/* A RESTING FIGHT KEEPS ITS RANKS. Verified: resuming decodes the board
        from its snapshot, so nothing you do here can reach into a match that
        is already under way — but nobody was told, which invites the fear of
        having just broken a saved game. */}
    {profile.pausedMatch?.v === 1 && (
      <div style={{ fontSize: 12, lineHeight: 1.5, color: "#e6d09a", marginBottom: 10, padding: "8px 11px",
        borderRadius: 10, background: "rgba(74,58,28,.32)", border: "1px solid rgba(233,207,138,.45)" }}>
        {t("army.pausedHint")}
      </div>
    )}

    {/* STACKED, not side-by-side: the intro text sits ABOVE, the formation
        gets the FULL width below — room for properly big figures */}
    <div style={{ display: "block" }}>
    <div style={{ minWidth: 0 }}>
    {preview && (
      <div style={{ marginBottom: feWide ? 0 : 12 }}>
        {/* the preview BOARD is retired here — before a match you cannot know
            the foe anyway; the board view returns as the Seeress's scout,
            right before the horn, where it actually informs a decision */}
        {(() => {
          const kin = { crown: 0, shadow: 0 };
          for (const p of preview.board) if (p && p.color === "w") { const f = familyOf(p); if (f) kin[f] += 1; }
          if (!kin.crown && !kin.shadow) return null;
          const wall = crownWallSoak(kin.crown), cHp = crownHp(kin.crown);
          const rifts = shadowRifts(kin.shadow), sAtk = shadowAtk(kin.shadow);
          const chip = (f, label) => kin[f] > 0 && (
            <span key={f} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px",
              borderRadius: 999, border: `1px solid ${FAMILIES[f].color}66`, background: `${FAMILIES[f].color}1c`,
              color: FAMILIES[f].color, fontSize: 11.5, fontWeight: 800 }}>
              <span style={{ width: 7, height: 7, transform: "rotate(45deg)", borderRadius: 2, background: FAMILIES[f].color }} />
              {(en ? FAMILIES[f].en : FAMILIES[f].de)} {kin[f]}{label ? <> · {label}</> : null}
            </span>);
          const cParts = <>{wall ? `${t("army.famWall")} ${wall}` : t("army.famNeedTwo")}{cHp ? <> · <span style={{ display: "inline-flex", verticalAlign: "-0.3em" }}><b style={{ font: "800 11px/1 Georgia, serif", color: "#ffb3aa" }}>{"+" + cHp}</b></span></> : null}</>;
          const sParts = <>{rifts ? `${rifts} ⧗` : t("army.famNeedTwo")}{sAtk ? <> · <span style={{ display: "inline-flex", verticalAlign: "-0.3em" }}><b style={{ font: "800 11px/1 Georgia, serif", color: "#b6cdff" }}>{"+" + sAtk}</b></span></> : null}</>;
          return <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>
            {chip("crown", cParts)}
            {chip("shadow", sParts)}
          </div>;
        })()}
        <div style={{ fontSize: 11.5, color: T.faint, marginTop: 14, marginBottom: 4, textAlign: "center" }}>{t("army.pawnSoon")}</div>
      </div>
    )}
    </div>

    <div style={{ minWidth: 0 }}>
    {(() => {
      const heroCol = heroColFor(profile, map);
      const dragonAt = draft[0] === "dragon" ? 0 : draft[draft.length - 1] === "dragon" ? draft.length - 1 : -1;
      // the block swallows the two pawns standing in front of the dragon's 2x2
      const dragonPawns = dragonAt === 0 ? [0, 1] : dragonAt === draft.length - 1 ? [draft.length - 2, draft.length - 1] : [];
      const gLvl = characterLevel(profile, "gambit") || 1;
      const heldFrei = darfHeldSetzen(profile);
      const reiheFrei = darfReiheStellen(profile);
      /* v1.0.10 (Besitzer): der SCHLICHTE Stil gilt auch hier. Bisher zeigte
         die Aufstellung den Gambit (und die Bauern) IMMER gemalt, weil sie
         direkt in die Galerie griff, ohne den Schalter zu fragen - der eine
         Zwitter, den v0.83 ueberall sonst abgeschafft hat. Ohne Gemaelde
         faellt jede Kachel auf SlotGlyph zurueck, das schlicht zeichnet. */
      const schlicht = schlichtAn();
      const gImg = schlicht ? null : (paintedById("gambit-t" + gambitTier(gLvl)) || paintedById("gambit"));
      const pawnImg = schlicht ? null : paintedById("pawn");
      return <div style={{ position: "relative" }}>
      {/* ── THE PAWN RANK (front): ordinary pawns, save the Grand Gambit on his
          chosen file. Tap it to move him. Squares the dragon covers go dark. ── */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${map.w}, 1fr)`, gap: 3, marginBottom: 3 }}>
        {Array.from({ length: map.w }).map((_, f) => {
          /* v1.0.50: solange der Held nicht erwacht ist, traegt KEINE Spalte
             sein Gold - vorher gab es zwar keinen Klick (heldZu), aber die
             Spalte glomm trotzdem und verriet ihn. */
          const isHero = heldFrei && f === heroCol;
          const eaten = dragonPawns.includes(f);
          /* v1.0.43: DIE SPALTE DES HELDEN GEHT ERST MIT DEM ERWACHEN AUF.
             Vorher gibt es ihn nicht - eine Bauernreihe ist eine Bauernreihe,
             und es waere sinnlos, eine Spalte fuer niemanden zu waehlen. */
          const heldZu = !heldFrei;
          return <button key={f} disabled={eaten || heldZu} onClick={() => { if (!eaten && !heldZu) dispatch({ type: "SET_HERO_COL", mapId: map.id, col: f }); }}
            title={heldZu ? (en ? "The Grand Gambit has not awakened yet" : "Der Grand Gambit ist noch nicht erwacht")
              : isHero ? t("army.heroPos") : undefined}
            style={{ width: "100%", aspectRatio: "5 / 6", minWidth: 0, borderRadius: 8, cursor: eaten ? "default" : "pointer",
              display: "grid", placeItems: "center", fontFamily: "inherit", padding: 0, position: "relative",
              background: eaten ? "rgba(120,90,190,.1)" : isHero ? `radial-gradient(circle at 42% 30%, ${T.gold}2e, ${T.bg2})` : T.bg2,
              border: `1px solid ${isHero ? T.gold : eaten ? "#8a7ab8" : T.line}`, opacity: eaten ? 0.4 : 1,
              boxShadow: isHero ? `0 0 9px ${T.gold}55` : "none" }}>
            {eaten
              ? <span style={{ fontSize: "clamp(10px, 3.6vw, 16px)", opacity: 0.5, color: "#b9a6e6" }}>🜁</span>
              : (isHero ? gImg : pawnImg)
              ? <img src={isHero ? gImg : pawnImg} alt="" draggable={false}
                  /* v1.0.10: DECKEL DER HUELLE - die 8vw massen sich am
                     Schirm, nicht an der Zelle; auf breiten Karten ragte die
                     Figur ueber den Kachelrand. max 100% beisst nur im Notfall. */
                  /* v1.0.14 (Besitzer): MITTIG UND GROESSER. Die Bilder hingen an
                     der Unterkante (objectPosition bottom) und massen sich in
                     vw am Schirm - beides zusammen liess sie klein und nach
                     unten gerutscht wirken. Jetzt zentriert und eine Stufe
                     hoeher; der Grand Gambit steht als Held noch groesser. */
                  /* v1.0.65 (Besitzer): DER BAUER IST SO GROSS WIE DER GAMBIT
                     UND STEHT GENAUSO HOCH. v1.0.14 gab dem Helden absichtlich
                     eine Stufe mehr (10,5vw gegen 9,4vw) - das machte die
                     Bauernreihe uneben: bei 390 px Schirm 41 gegen 37 px, und
                     weil beide Bilder in ihrer Zelle MITTIG sitzen, lagen auch
                     Ober- und Unterkante zwei Pixel auseinander. Eine Reihe
                     gleicher Figuren muss eine Linie bilden.
                     Der Held bleibt trotzdem kenntlich: goldener Schein,
                     goldene Zellkontur, Stern in der Ecke - Zeichen, die keine
                     Groesse brauchen. Da beide Gemaelde gleich gerichtet sind
                     (gemessen: Hoehe 92,88 %, gleicher Fussabstand), steht die
                     Reihe damit auf einer Linie. */
                  style={{ height: "clamp(26px, 10.5vw, 86px)",
                    maxWidth: "100%", maxHeight: "100%",
                    objectFit: "contain", objectPosition: "center", pointerEvents: "none",
                    filter: isHero ? "drop-shadow(0 1px 3px rgba(201,164,92,.5))" : "none" }} />
              /* v1.0.65: derselbe Entscheid im SCHLICHTEN Stil - sonst haette
                 der Besitzer die Ungleichheit dort weiterhin gesehen. */
              : <SlotGlyph kind="P" size={"clamp(30px, 12vw, 98px)"} hero={isHero} level={gLvl} />}
            {isHero && <span style={{ position: "absolute", bottom: 1, right: 2, fontSize: 8, fontWeight: 800,
              color: "#e9d296", textShadow: "0 1px 2px #000", pointerEvents: "none" }}>★</span>}
          </button>;
        })}
      </div>
      {/* ── THE BACK RANK (rear): the pieces you arrange ── */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${draft.length}, 1fr)`, gap: 3, marginBottom: 10 }}>
        {draft.map((id, i) => {
          const open = pick === i;
          const isWing = id == null;
          const isDragon = id === "dragon";
          // the dragon is drawn by the centred 2x2 overlay instead — its two
          // squares here stay empty of art (but keep their tap targets)
          const dragonSquare = isDragon || (isWing && dragonAt >= 0);
          const isKingSlot = i === crown.king;
          /* v1.28.5 (Besitzer): KOENIG UND DAME STEHEN IMMER FEST - und man soll
             es sehen. Der Koenig traegt KEINE Kontur und einen gedaempften Grund:
             er ist nicht anklickbar. Der Damenplatz traegt die laufende lila
             Kontur der Grossmeister: hier steht die Dame oder ihr Ersatz, der
             Kapitelmeister - nirgends sonst. */
          const isQueenSlot = i === crown.queen;
          /* v1.0.43: DIE HINTERE REIHE BLEIBT ZU, BIS DIE ERSTE FIGUR
             BEITRITT. Solange nur die sieben Grundfiguren im Heer stehen,
             gaebe es ohnehin nichts zu tauschen - die Reihe waere ein Regal
             ohne zweites Buch. Mit der ersten gewonnenen Figur geht sie auf,
             und die Freigabe erklaert sich einmal selbst. */
          const reiheZu = !reiheFrei;
          const zu = isKingSlot || reiheZu;
          return <button key={i} disabled={zu}
            className={isQueenSlot && reiheFrei ? "gg-funkenkontur-innen" : undefined}
            title={reiheZu ? (en ? "Win your first figure to arrange the back rank" : "Gewinne deine erste Figur, um die hintere Reihe zu stellen")
              : isKingSlot ? (en ? "The king holds this square" : "Der König hält diesen Platz")
              : isQueenSlot ? (en ? "The queen's square - or her stand-in, a chapter master" : "Der Damenplatz - hier steht die Dame oder ihr Ersatz, ein Kapitelmeister") : undefined}
            onClick={() => { if (zu) return; if (isWing) { setPick(dragonAt); scrollToPicker(); } else { setPick(open ? null : i); if (!open) scrollToPicker(); } }}
            style={{ width: "100%", aspectRatio: "5 / 6", minWidth: 0, borderRadius: 8, cursor: isKingSlot ? "default" : "pointer",
              display: "grid", placeItems: "center", fontFamily: "inherit", padding: 0, position: "relative",
              background: open || (isWing && pick === dragonAt) ? T.lime : isWing ? "rgba(120,90,190,.16)" : isKingSlot ? "rgba(18,14,26,.6)" : T.bg2,
              border: `1px solid ${open || (isWing && pick === dragonAt) ? T.lime : isDragon || isWing ? "#8a7ab8" : isKingSlot ? "transparent" : T.line}` }}>
            {isWing
              ? <span title={t("army.wing")} style={{ fontSize: "clamp(11px, 4vw, 18px)", opacity: 0.5, color: "#b9a6e6" }}>🜁</span>
              : isDragon
              ? null /* drawn by the overlay */
              : isBossEntry(id)
              ? (schlicht
                ? <SlotGlyph kind="X" bossId={bossEntryId(id)} size={"clamp(26px, 10vw, 84px)"} />
                : <img src={paintedById("boss-" + bossEntryId(id)) || undefined} alt="" draggable={false}
                    style={{ height: "clamp(28px, 11vw, 90px)", maxWidth: "100%", maxHeight: "100%",
                      objectFit: "contain", objectPosition: "center", pointerEvents: "none" }} />)
              /* v1.0.87 (Besitzer: "die Figuren der unteren Reihe alle mittig"),
                 GEMESSEN: die hintere Reihe stand 1,8 px aus der Mitte und lief
                 2,6 px ueber - das SlotGlyph-Bild mass sich an seinem span,
                 nicht an der Zelle. Die Bauern (0 px) haben maxWidth 100 % direkt
                 am Bild. Jetzt bekommt die hintere Reihe EXAKT die Bildzeile der
                 Bauern - gleiche Hoehe, gleiche Grenzen, gleiche Mitte. */
              : schlicht
                ? <SlotGlyph kind={CHARACTERS[id].kind} size={"clamp(26px, 10.5vw, 86px)"} art={"painted"} />
                : <img src={bildnisVon(id, characterLevel(profile, id) || 1) || undefined} alt="" draggable={false}
                    style={{ height: "clamp(26px, 10.5vw, 86px)", maxWidth: "100%", maxHeight: "100%",
                      objectFit: "contain", objectPosition: "center", pointerEvents: "none" }} />}
          </button>;
        })}
      </div>
      {/* ── THE DRAGON: one big sprite centred over its 2x2 block (the anchor +
          wing in the back rank, and the two pawn squares above them) ── */}
      {dragonAt >= 0 && (() => {
        const dImg = schlichtAn() ? null : paintedById("dragon");
        // columns the block spans (anchor + neighbour, inward)
        const c0 = dragonAt === 0 ? 0 : draft.length - 2;
        // left edge in %, block is 2 columns wide of `map.w`
        const leftPct = (c0 / map.w) * 100;
        return <div onClick={() => { setPick(dragonAt); scrollToPicker(); }}
          style={{ position: "absolute", top: 0, left: `${leftPct}%`, width: `${(2 / map.w) * 100}%`,
            height: "100%", display: "grid", placeItems: "center", cursor: "pointer", zIndex: 4, pointerEvents: "auto" }}>
          {dImg
            ? <img src={dImg} alt="" draggable={false} style={{ width: "94%", height: "94%", objectFit: "contain",
                objectPosition: "center", filter: "drop-shadow(0 2px 6px rgba(0,0,0,.55))", pointerEvents: "none" }} />
            : <SlotGlyph kind="D" size="clamp(60px, 22vw, 180px)" art={"painted"} />}
          <span style={{ position: "absolute", bottom: 3, right: 4, fontSize: 10, fontWeight: 800,
            color: "#e9d296", textShadow: "0 1px 2px #000", pointerEvents: "none" }}>2×2</span>
        </div>;
      })()}
      </div>;
    })()}

    {dragonAsk && (
      <div style={{ background: T.bg2, border: `1.5px solid ${T.gold}66`, borderRadius: 10, padding: "11px 12px", marginBottom: 10 }}>
        {dragonAsk.slot === -1 ? (
          <>
            <div style={{ fontSize: 12.5, lineHeight: 1.55, color: T.text }}>{t("army.dragonEdgeOnly")}</div>
            <div style={{ marginTop: 9 }}><Button variant="subtle" onClick={() => setDragonAsk(null)}>{t("common.ok")}</Button></div>
          </>
        ) : (
          <>
            <div className="gg-serif" style={{ fontSize: 13, letterSpacing: ".08em", color: T.gold, marginBottom: 4 }}>{t("army.dragonAskTitle")}</div>
            <div style={{ fontSize: 12.5, lineHeight: 1.55, color: T.text }}>
              {t("army.dragonAsk", { p: (() => { const w = draft[dragonAsk.wing]; const nm = w && !isBossEntry(w) ? (en ? CHARACTERS[w].nameEn : CHARACTERS[w].nameDe) : "—"; return nm; })() })}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <Button variant="primary" onClick={confirmDragon}>{t("army.dragonYes")}</Button>
              <Button variant="subtle" onClick={() => setDragonAsk(null)}>{t("common.cancel")}</Button>
            </div>
          </>
        )}
      </div>
    )}
    {pick !== null && (
      <div ref={pickerRef} style={{ background: T.bg2, border: `1px solid ${T.line}`, borderRadius: 10, padding: 8, marginBottom: 10 }}>
        {/* v1.1.15 (Besitzerwunsch): DIE FIGURENWAHL IST EINE WISCHREIHE.
            "Wenn man in der Aufstellung auf eine Figur drueckt, dass dann
            unten in gross man nach rechts oder nach links sliden kann und die
            Figuren dort zieht, die man hinzufuegen kann. Das waere von der
            User Experience schoen, und dann sieht man noch die Figuren in
            gross - und was sie potenziell fuer Faehigkeiten haben."

            Vorher war es eine senkrechte Liste mit 52-px-Bildern: viel
            Scrollen, kleine Figuren, und die Talente standen gar nicht da.
            Jetzt eine waagerechte Reihe mit 108-px-Gemaelden, die man wischt -
            mit Namen, Spruch UND den Talentzeichen in ihrer Artfarbe
            (dieselbe wie im Talentband und in der Zugspur). Die Reihe
            schnappt auf die Karten ein (scroll-snap), damit das Wischen
            aufhoert, wo eine Figur steht. */}
        {/* v1.1.17 (Besitzer: "der Slider in Aufstellung geht auch noch nicht,
            funktioniert gar nicht mehr"): DREI HAERTUNGEN. touchAction "pan-x"
            sagt dem Browser ausdruecklich, dass hier waagerecht gewischt wird -
            ohne das schluckt die senkrechte Seitenbewegung die Geste, und die
            Reihe fuehlt sich fest an. minWidth statt width haelt die Karten
            auf Mass, auch wenn ein Elternteil sie quetschen will (flex-Kinder
            schrumpfen sonst unter ihre Breite). Und eine Mindesthoehe, damit
            die Reihe nicht auf null faellt, wenn ein Bild spaeter laedt. */}
        <div style={{ display: "flex", gap: 10, overflowX: "auto", overflowY: "hidden",
          scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch",
          touchAction: "pan-x",
          padding: "2px 2px 8px", margin: "0 -2px",
          scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {pieces.filter((c) => (pick === crown.queen
              ? c.id === "queen"          // her square: the queen or a boss (below)
              : c.id !== "queen" && c.id !== "king"))  // the crown never wanders
            .map((c) => {
            const on = draft[pick] === c.id;
            /* Die Talente stehen nicht an der Figur, sondern in ihrer
               STUFENLEITER (ladder) - dort, wo sie erlernt werden. Gezeigt
               werden die ersten vier, in ihrer Artfarbe. Das ist die Auskunft,
               die der Besitzer beim Waehlen sehen wollte: "was sie potenziell
               auch fuer Faehigkeiten haben". */
            const talente = (c.ladder || [])
              .map((stufe) => stufe.ability && ABILITIES[stufe.ability])
              .filter(Boolean).slice(0, 4);
            return <button key={c.id} onClick={() => setSlot(pick, c.id)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                padding: "9px 8px 10px", borderRadius: 13, cursor: "pointer", fontFamily: "inherit",
                /* v1.2.1 (Besitzer: "mach es so, dass schon alles von der Karte
                   drauf passt, und skaliere die Karte einfach entsprechend
                   Bildschirmgroesse"): die Karte waechst mit dem Schirm
                   (30 % der Breite, zwischen 118 und 150 px) und ist so hoch,
                   dass Bild, Name, Gangart und Talente ZUSAMMEN hineinpassen -
                   vorher schnitt die Reihe die Gangart unten ab. */
                flex: "0 0 auto", width: "clamp(118px, 30vw, 150px)", scrollSnapAlign: "center", textAlign: "center",
                background: on ? T.lime : T.panel2, color: on ? T.limeInk : T.text,
                border: `1.5px solid ${on ? T.lime : T.line}`,
                boxShadow: on ? `0 0 12px ${T.lime}55` : "none" }}>
              <SlotGlyph kind={c.kind} size={"clamp(64px, 17vw, 88px)"} art={"painted"} />
              <span style={{ display: "block", fontWeight: 800, fontSize: 13.5, lineHeight: 1.15 }}>{en ? c.nameEn : c.nameDe}</span>
              {/* v1.1.17 (Besitzer: "du musst wie bei der Chronik, wie die Zuege
                  dargestellt werden, das auch noch bei den Figuren reinbringen -
                  sonst weiss man ja nicht, wie wo was"): DIE GANGART STEHT IN
                  DER KARTE. Man waehlt hier eine Figur fuer seine Hinterreihe;
                  ohne ihr Zugbild waehlt man nach Aussehen. Dasselbe Diagramm
                  wie in der Chronik, nur klein (96 px). */}
              <span style={{ display: "block", marginTop: 1, opacity: on ? 1 : 0.92 }}>
                <MoveDiagram kind={c.kind} moveSpec={c.moveSpec} breite={"clamp(74px, 20vw, 96px)"} />
              </span>
              {talente.length > 0 && (
                <span style={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center", marginTop: 1 }}>
                  {talente.map((ab) => {
                    const tg = TAGS[ab.tag];
                    return <span key={ab.id} title={en ? ab.nameEn : ab.nameDe}
                      style={{ fontSize: 10, lineHeight: 1, padding: "3px 5px", borderRadius: 6,
                        background: tg ? tg.color + "2e" : "rgba(167,139,250,.18)",
                        border: `1px solid ${tg ? tg.color + "88" : "rgba(167,139,250,.5)"}`,
                        color: on ? T.limeInk : T.text }}>{ab.icon}</span>;
                  })}
                </span>
              )}
              {/* v1.2.1: der Spruch ist fort - er kostete zwei Zeilen und
                  verdraengte die Gangart aus der Karte. Er steht vollstaendig
                  in der Chronik, wo man ihn liest, statt beim Aufstellen. */}
            </button>;
          })}
        </div>
        {(() => {
          // league bosses — trophies of finished leagues; ONE may take the queen's place
          const owned = ownedLeagueBosses(profile);
          if (!owned.length || pick !== crown.queen) return null;   // a boss stands in for the QUEEN, nowhere else
          const usedElsewhere = draft.some((d, j) => j !== pick && isBossEntry(d));
          return <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${T.gold}44` }}>
            <div className="gg-serif" style={{ fontSize: 11.5, letterSpacing: ".1em", color: T.gold, marginBottom: 6 }}>
              {t("army.bossSection")}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {owned.map((bid) => {
                const b = bossById(bid);
                const eid = "boss:" + bid;
                const on = draft[pick] === eid;
                const blocked = usedElsewhere && !on;
                return <button key={bid} disabled={blocked} onClick={() => setSlot(pick, eid)}
                  title={en ? undefined : (b.aura ? t("army.bossAuraHint") : undefined)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 9,
                    cursor: blocked ? "default" : "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13, opacity: blocked ? 0.45 : 1,
                    background: on ? "#8a7ab8" : T.panel2, color: on ? "#171125" : T.text, border: `1px solid ${on ? "#8a7ab8" : T.line}` }}>
                  {paintedById("boss-" + bid) && <img src={paintedById("boss-" + bid)} alt="" style={{ height: 20, objectFit: "contain" }} />}
                  {en ? b.nameEn : b.nameDe}
                </button>;
              })}
            </div>
            <div style={{ fontSize: 10.5, color: T.faint, marginTop: 6 }}>{t("army.bossHint")}</div>
          </div>;
        })()}
      </div>
    )}

    {/* the pawn rank above already carries the Grand Gambit's file — no
        separate hero strip needed anymore */}

    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12, alignItems: "center" }}>
      {reqChips.map((r) => (
        <Chip key={r.id} color={r.have === r.need ? T.green : T.danger} bg={T.panel2}>
          <SlotGlyph kind={CHARACTERS[r.id].kind} size={13} art={"painted"} /> {r.have}/{r.need}
        </Chip>
      ))}
      <Chip color={flexCount === flexNeed - (dragonFielded ? 1 : 0) ? T.green : T.danger} bg={T.panel2}>{t("army.flex")} {flexCount}/{flexNeed - (dragonFielded ? 1 : 0)}</Chip>
    </div>

    {/* v1.15.0: DIE DREI FAECHER. Tippen wechselt (ein ungespeicherter
        Entwurf verfaellt dabei - der Speichern-Knopf zeigt vorher, ob einer
        offen ist). Das aktive Fach noch einmal tippen oeffnet das
        Umbenennen; leer lassen heisst zurueck zu "Aufstellung I". */}
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${DECK_ANZAHL}, 1fr)`, gap: 6, marginBottom: 10 }}>
      {Array.from({ length: DECK_ANZAHL }, (_, i) => {
        const aktiv = i === deck.aktiv;
        const belegt = !!deck.liste[i]?.formation;
        const name = deckName(profile, deckKey, i, en);
        if (umbenennen === i) {
          return <input key={i} autoFocus defaultValue={deck.liste[i]?.name || ""} maxLength={24} data-deck={String(i)}
            placeholder={name}
            onBlur={(e) => { dispatch({ type: "DECK_UMBENENNEN", mapId, rules: regel, index: i, name: e.target.value }); setUmbenennen(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") setUmbenennen(null); }}
            style={{ fontFamily: "inherit", fontSize: 12, padding: "6px 8px", borderRadius: 9, minWidth: 0,
              background: "#120c22", color: "#f2ecdc", border: "1px solid rgba(167,139,250,.75)", outline: "none" }} />;
        }
        return <button key={i} type="button" data-deck={String(i)} data-aktiv={aktiv ? "1" : "0"}
          onClick={() => { if (aktiv) setUmbenennen(i); else { klang("menue"); dispatch({ type: "DECK_WAEHLEN", mapId, rules: regel, index: i }); } }}
          title={aktiv ? (en ? "Tap to rename" : "Antippen zum Umbenennen") : undefined}
          style={{ fontFamily: "inherit", fontSize: 12, fontWeight: aktiv ? 800 : 600, padding: "6px 6px", borderRadius: 9, minWidth: 0,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer",
            background: aktiv ? "radial-gradient(130% 120% at 50% -12%, rgba(124,58,237,.42) 0%, rgba(34,22,60,.8) 60%)" : "rgba(12,8,22,.5)",
            color: aktiv ? "#f2ecdc" : belegt ? T.text : T.dim,
            border: `1px solid ${aktiv ? "rgba(167,139,250,.85)" : "rgba(124,58,237,.35)"}`,
            boxShadow: aktiv ? "0 0 10px rgba(124,58,237,.35)" : "none" }}>
          {name}{!belegt && !aktiv ? <span style={{ opacity: .55 }}> ·</span> : null}
        </button>;
      })}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      <Button variant="primary" disabled={!legal || !changed} onClick={() => dispatch({ type: "SET_FORMATION", mapId, rules: regel, formation: draft })}>{t("common.save")}</Button>
      <Button variant="subtle" onClick={() => setDraft(map.defaultFormation)}>{t("army.standard")}</Button>
    </div>
    {!legal && <div style={{ fontSize: 12, color: T.danger, marginTop: 8 }}>{t("army.invalid")}</div>}
    </div>
    </div>
  </Panel>

  {/* map choice — its own strip below the box: ONE row, scroll if it must */}
  {/* v1.15.0 (Uebergabe): DIE KARTENWAHL ERSCHEINT ERST AB KAPITEL 5 - bis
      dahin ist jede Station 8x8 (Klassik, Hof, Schneise unterscheiden sich
      in Loechern, nicht im Mass, und das Scharmuetzel fuehrt erst der
      Endboss von Kapitel 5 ein). Eine Auswahl, die nur eine Wahl kennt, ist
      keine. */}
  {(profile.campaign?.league || 1) >= 5 && <div style={{ minWidth: 0, maxWidth: "100%" }}>
    <FieldLabel>{t("army.mapPick")}</FieldLabel>
    {/* v1.0.87 (Besitzer: "pro Karte eine kleine Visualisierung, ohne
        Scrollbalken, es ist ja noch Platz"): RASTER statt Streifen. Jede
        Karte zeigt ihr echtes Brett - Groesse, Farben, Loecher. */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(62px, 1fr))", gap: 6, minWidth: 0 }}>
      {FORMATION_MAPS.map((m) => {
        const on = m.id === mapId;
        const open = mapUnlocked(profile, m.id);
        return <MapChip key={m.id} on={on} locked={!open} theme={m.theme} stapel
          mini={<MapMini w={m.w} h={m.h} holes={m.holes} theme={m.theme} on={on} size={44} />}
          onClick={() => open && setMapId(m.id)}
          label={<><span>{open ? null : <LockIc size={11} />}{en ? m.nameEn : m.nameDe}</span><span style={{ opacity: .7, fontWeight: 600 }}>{m.w}×{m.h}</span></>} />;
      })}
    </div>
  </div>}
  </>;
}

// Gear & supplies — its own room now (tab 2), no longer part of one long scroll.
export function GearPanel({ profile, dispatch, t, en, initialGearInfo = null }) {
  const [gearInfo, setGearInfo] = useState(initialGearInfo);   // ein angetipptes Stück zeigt sein Blatt
  /* v0.82: solange ein Blatt offen ist, traegt das Wurzelelement eine Marke -
     daran erkennt das Installations-Banner (reines CSS), dass es weichen
     muss. Ohne das lag es auf dem Telefon ueber dem Blattkopf. */
  useEffect(() => {
    if (!gearInfo) return;
    document.documentElement.dataset.ggPopup = "1";
    return () => { delete document.documentElement.dataset.ggPopup; };
  }, [gearInfo]);
  return (
    <div style={{ background: "radial-gradient(140% 120% at 50% -14%, rgba(240,206,122,.13) 0%, rgba(26,20,12,.62) 44%, rgba(10,8,6,.55) 100%)",
      backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)",
      border: "1px solid rgba(227,192,122,.5)", borderRadius: T.radius, padding: "12px 14px",
      boxShadow: "0 0 16px rgba(240,206,122,.12), inset 0 1px 0 rgba(255,240,200,.08)" }}>
      {/* DER STAND DES HÄNDLERS: er steht bei seiner Ware und sagt ein Wort -
          und ein anderes, sobald etwas NEU in seinem Bündel liegt. */}
      {(() => {
        const neuDa = ITEM_LIST.filter((it) => itemRevealed(profile, it) && !(it.kind === "key" ? profile.items?.[it.id] : (profile.items?.[it.id] || 0)) && (profile.gold || 0) >= itemPrice(profile, it));
        const spruch = neuDa.length
          ? (en ? `New in my bundle — ${neuDa.length === 1 ? "one piece" : neuDa.length + " pieces"} you can afford today.`
                : `Neu im Bündel — ${neuDa.length === 1 ? "ein Stück" : neuDa.length + " Stücke"}, die du heute zahlen kannst.`)
          : (en ? "Look your fill. What I have, I have honestly." : "Sieh dich um. Was ich habe, habe ich ehrlich.");
        /* v1.0.1 (Besitzerwunsch): Corvo steht jetzt GROSS am Kopf des
           Reiters, sein Name darunter - vorher stand er klein daneben und
           ging neben dem Spruch unter. Er ist der Wirt dieses Raumes, also
           soll man ihn auch sehen. */
        return <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
          gap: 6, marginBottom: 14, textAlign: "center" }}>
          {/* v0.74.2 (Besitzer): sein Bildnis, FREIGESTELLT wie alle anderen
              Figuren - nur ein ehrlicher Schlagschatten, kein Schimmer. */}
          <img src={paintedById("haendler")} alt="" draggable={false}
            style={{ width: "min(62vw, 230px)", height: "auto", maxHeight: "34dvh", objectFit: "contain",
              filter: "drop-shadow(0 6px 14px rgba(0,0,0,.65))" }} />
          <div style={{ width: "100%", minWidth: 0 }}>
            <div className="gg-quill" style={{ fontSize: 18, color: T.goldBright, textShadow: "0 0 10px rgba(240,206,122,.3)" }}>
              {en ? "Corvo the Pedlar" : "Corvo, der Krämer"}</div>
            <div className="gg-serif" style={{ fontSize: 12, color: neuDa.length ? "#f2dca0" : "#b9a98a", fontStyle: "italic",
              lineHeight: 1.45, marginTop: 3 }}>„{spruch}"</div>
          </div>
          {/* v1.0.8: die NEU-Pille ist fort (Besitzer) - der Laden soll ruhig wirken */}
        </div>;
      })()}
      <div className="gg-serif" style={{ fontSize: 12.5, letterSpacing: ".14em", color: T.goldBright, textTransform: "uppercase", marginBottom: 8,
        textShadow: "0 0 8px rgba(240,206,122,.35)" }}>{t("army.supplies")}</div>
      <div style={{ display: "grid", gap: 8 }}>
        {(() => {
          // Star shards: the treasury's rarest ware — skill points for gold,
          // strictly rationed: two per league the campaign has reached.
          // The vault itself is EARNED: it stays closed until the third victory.
          if (clearedCount(profile) < SP_VAULT_MIN_CLEARED) return null;
          const cap = spShardCap(profile);
          const bought = profile.spShards || 0;
          const left = Math.max(0, cap - bought);
          const can = left > 0 && (profile.gold || 0) >= SP_SHARD_GOLD;
          // NO PEDESTAL. The shard used to sit on its own gilded plate with a
          // travelling shine, which made it shout across the whole chest. It is
          // a ware like any other now — what is special about it (the ration
          // per chapter) is said in its sheet, where it belongs.
          return <div onClick={() => setGearInfo("shard")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <span style={{ width: 26, display: "grid", placeItems: "center" }}><img src={itemArt("sternensplitter")} alt="" aria-hidden draggable={false} style={{ width: 24, height: 24, objectFit: "contain", display: "block", filter: "drop-shadow(0 0 5px rgba(246,222,150,.55)) drop-shadow(0 1px 2px rgba(0,0,0,.45))" }} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800 }}>
                {en ? "Star shard" : "Sternensplitter"}
                <span style={{ color: T.dim, fontWeight: 700 }}> · {bought}/{cap}</span>
              </div>
              <div style={{ fontSize: 11.5, color: T.dim, lineHeight: 1.5 }}>
                {en ? "A spark of insight, ground into a skill point."
                    : "Ein Funke Erleuchtung, zu einem Skillpunkt geschliffen."}
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); dispatch({ type: "BUY_SP_SHARD" }); }} disabled={!can}
              style={{ fontFamily: "inherit", fontWeight: 900, fontSize: 12.5, borderRadius: 999, padding: "8px 13px",
                position: "relative", border: "1px solid rgba(255,240,200,.5)", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 5,
                background: can ? "linear-gradient(160deg, #f0d68a, #d9b565 55%, #b08c44)" : T.panel,
                boxShadow: can ? `0 0 12px ${T.gold}66` : "none",
                color: can ? "#17110a" : T.faint, cursor: can ? "pointer" : "default",
                outline: can ? "none" : `1.5px solid ${T.line}` }}>
              {left === 0 ? (en ? "Vault empty" : "Tresor leer") : <><GoldCoin size={13} /> {SP_SHARD_GOLD}</>}
            </button>
          </div>;
        })()}
        {ITEM_LIST.filter((it) => itemRevealed(profile, it)).map((it) => {
          const owned = it.kind === "key" ? !!profile.items?.[it.id] : (profile.items?.[it.id] || 0);
          const full = it.kind === "key" ? owned : owned >= (it.max || 99);
          const can = !full && (profile.gold || 0) >= itemPrice(profile, it);
          return <div key={it.id} onClick={() => setGearInfo(it.id)}
            style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <span style={{ width: 24, display: "grid", placeItems: "center" }}><ItemIcon id={it.id} size={22} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800 }}>
                {en ? it.nameEn : it.nameDe}
                {it.kind === "consumable" ? <span style={{ color: T.dim, fontWeight: 700 }}> · {owned}/{it.max}</span>
                  : owned ? <span style={{ color: T.green, fontWeight: 800 }}> ✓</span> : null}
              </div>
              <div style={{ fontSize: 11.5, color: T.dim }}>{en ? it.textEn : it.textDe}</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); klang("gold"); dispatch({ type: "BUY_ITEM", id: it.id }); }} disabled={!can}
              /* v1.0.87 (Besitzer: "die gelbe Kachel und die Goldmuenze stechen
                 sich, man erkennt die Muenze kaum"): der Knopf war eine volle
                 Goldflaeche - die Muenze verschwand darin. Jetzt: dunkler Grund
                 wie das ganze Menue, GOLDENE KONTUR mit Glanz, Schrift in
                 Gold. Die Muenze steht wieder frei. */
              style={{ fontFamily: "inherit", fontWeight: 900, fontSize: 12.5, borderRadius: 999, padding: "8px 13px",
                border: `1.5px solid ${can ? "rgba(233,207,138,.9)" : T.line}`,
                background: can ? "linear-gradient(180deg, rgba(58,44,20,.55), rgba(24,18,10,.85))" : T.panel,
                boxShadow: can ? "0 0 10px rgba(233,207,138,.28)" : "none",
                color: can ? T.goldBright : T.faint, cursor: can ? "pointer" : "default", whiteSpace: "nowrap",
                display: "inline-flex", alignItems: "center", gap: 5 }}>
              {full ? (it.kind === "key" ? "✓" : t("army.full")) : <><GoldCoin size={14} /> {itemPrice(profile, it)}</>}
            </button>
          </div>;
        })}
        {(() => {
          // the veiled remainder: one quiet row, no names, no prices — the road
          // ahead keeps its secrets until you walk it
          const hidden = ITEM_LIST.filter((it) => !itemRevealed(profile, it)).length;
          if (!hidden) return null;
          return <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: 0.6, paddingTop: 2 }}>
            <span style={{ width: 24, display: "grid", placeItems: "center" }}><SealIc size={20} /></span>
            <div style={{ fontSize: 12, color: T.faint, fontStyle: "italic" }}
              className="gg-serif">{t(hidden === 1 ? "army.itemHidden1" : "army.itemsHidden", { n: hidden })}</div>
          </div>;
        })()}
      </div>
      {/* THE SHEET OF A SINGLE PIECE OF GEAR: its painting large at the top,
          then what it does, then the longer word — several of these are only
          half the story without the piece they need at your side. */}
      {gearInfo && (() => {
        const shard = gearInfo === "shard";
        const it = shard ? null : ITEMS[gearInfo];
        if (!shard && !it) return null;
        const cap = spShardCap(profile), bought = profile.spShards || 0;
        const left = Math.max(0, cap - bought);
        const owned = it ? (it.kind === "key" ? !!profile.items?.[it.id] : (profile.items?.[it.id] || 0)) : 0;
        const full = it ? (it.kind === "key" ? owned : owned >= (it.max || 99)) : left === 0;
        const price = it ? itemPrice(profile, it) : SP_SHARD_GOLD;
        const can = !full && (profile.gold || 0) >= price;
        return <div onClick={() => setGearInfo(null)} style={{ position: "fixed", inset: 0, zIndex: 56,
          background: "rgba(4,6,10,.74)", display: "block", overflow: "hidden",
          /* v0.81 (Besitzer): OBEN VERANKERT statt zentriert. Eine zentrierte
             Karte waechst in BEIDE Richtungen - ist sie hoch, wandert ihr Kopf
             unter die Leiste. Jetzt beginnt jedes Popup auf DERSELBEN Hoehe,
             gleich wie gross sein Inhalt ist, und scrollt in sich. */
          
          /* v0.80: <main> traegt eine mask-image und bildet damit einen
             Stapelkontext - Menueleiste (breit, oben) und Dock (unten) liegen
             IMMER ueber diesem Popup, egal welcher z-Index. Also weicht die
             Karte ihnen aus: die Freiraeume kommen als CSS-Variablen aus der
             Huelle. */
        }}>
          <div onClick={(e) => e.stopPropagation()} className="gg-thinbar" style={{ width: "min(100vw - 20px, 380px)",
            position: "absolute", left: "50%", transform: "translateX(-50%)",
            top: "calc(14px + var(--gg-popfrei-oben, 0px))",
            maxHeight: "calc(100dvh / var(--vhz, 1) - 30px - var(--gg-popfrei-oben, 0px) - var(--gg-popfrei-unten, 0px))", overflowY: "auto", borderRadius: 20, padding: "18px 18px 16px",
            background: "radial-gradient(130% 120% at 50% -12%, rgba(240,206,122,.16) 0%, rgba(24,19,11,.97) 44%, rgba(10,8,5,.99) 100%)",
            border: "1px solid rgba(227,192,122,.55)",
            boxShadow: "0 18px 50px rgba(0,0,0,.6), 0 0 22px rgba(240,206,122,.16)" }}>
            <div style={{ display: "grid", placeItems: "center", marginBottom: 10 }}>
              {shard ? <img src={itemArt("sternensplitter")} alt="" aria-hidden draggable={false} style={{ width: 124, height: 124, objectFit: "contain", display: "block", filter: "drop-shadow(0 0 12px rgba(246,222,150,.5)) drop-shadow(0 2px 5px rgba(0,0,0,.5))" }} /> : <ItemIcon id={it.id} size={116} />}
            </div>
            <div className="gg-serif" style={{ fontSize: 19, letterSpacing: ".03em", color: T.goldBright, textAlign: "center" }}>
              {shard ? (en ? "Star shard" : "Sternensplitter") : (en ? it.nameEn : it.nameDe)}
            </div>
            <div style={{ fontSize: 12, color: T.dim, textAlign: "center", marginTop: 3 }}>
              {shard ? `${bought}/${cap}`
                : it.kind === "consumable" ? `${owned}/${it.max}` : (owned ? (en ? "In your supplies" : "In deinem Vorrat") : (en ? "Not yet bought" : "Noch nicht gekauft"))}
            </div>
            <div style={{ height: 1, background: "rgba(233,210,150,.22)", margin: "12px 0 11px" }} />
            <div style={{ fontSize: 13, lineHeight: 1.55, color: "#ded7c0" }}>
              {shard ? (en ? "A spark of insight, ground into a skill point. Spend it in the court to raise a piece a level."
                           : "Ein Funke Erleuchtung, zu einem Skillpunkt geschliffen. Im Hofstaat hebst du damit eine Figur um eine Stufe.")
                     : (en ? it.textEn : it.textDe)}
            </div>
            <div style={{ fontSize: 12.5, lineHeight: 1.6, color: T.dim, marginTop: 9 }}>
              {shard ? (en ? `The court's vault holds two shards per chapter you have reached — ${cap} so far, ${bought} of them taken.`
                           : `Der Tresor des Hofes verwahrt zwei Splitter je erreichtem Kapitel — bisher ${cap}, davon ${bought} gehoben.`)
                     : (en ? it.loreEn : it.loreDe)}
            </div>
            {shard && left === 0 && (
              <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "#e6d09a", marginTop: 10, padding: "9px 11px",
                borderRadius: 10, background: "rgba(74,58,28,.32)", border: "1px solid rgba(233,207,138,.45)" }}>
                {en ? "This chapter's shards are all taken. The next ones wait in the chapter beyond."
                    : "Die Splitter dieses Kapitels sind alle gehoben. Die nächsten warten im nächsten Kapitel."}
              </div>
            )}
            <button onClick={() => { if (!can) return; klang("gold"); dispatch(shard ? { type: "BUY_SP_SHARD" } : { type: "BUY_ITEM", id: it.id }); setGearInfo(null); }}
              disabled={!can} style={{ width: "100%", marginTop: 14, fontFamily: "inherit", fontWeight: 900, fontSize: 14,
                borderRadius: 999, padding: "12px 16px", border: "1px solid rgba(255,240,200,.5)", whiteSpace: "nowrap",
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                background: can ? "linear-gradient(160deg, #f0d68a, #d9b565 55%, #b08c44)" : T.panel2,
                color: can ? "#17110a" : T.faint, cursor: can ? "pointer" : "default",
                outline: can ? "none" : `1px solid ${T.line}` }}>
              {full ? (en ? "Nothing more to take" : "Nichts mehr zu holen")
                    : <><GoldCoin size={14} /> {price}</>}
            </button>
            <button onClick={() => setGearInfo(null)} style={{ width: "100%", marginTop: 7, fontFamily: "inherit",
              fontWeight: 700, fontSize: 12.5, borderRadius: 999, padding: "8px 14px", border: `1px solid ${T.line}`,
              background: "transparent", color: T.dim, cursor: "pointer" }}>{t("tree.cancel")}</button>
          </div>
        </div>;
      })()}
    
    </div>
  );
}

// Tap a figurine → the painting fills the stage. One tap anywhere closes it.
/* ── DIE VOLLBILD-ANSICHT (v1.22.1, Besitzer) ──────────────────────────────
   "Genau diese Art der Ansicht mega cool - mit dem Hintergrund, den ich fuer
   jede Figur geschaffen habe." Die Kulisse der Figur steht jetzt hinter ihr,
   in voller Groesse, oben und unten abgedunkelt, damit Name und Satz stehen.
   Der Satz war unten abgeschnitten und zu klein: jetzt 16 px auf einer
   dunklen Platte, mit Abstand zur Leiste.

   Vorbereitet fuer den Moment, in dem man eine Figur GEWINNT: titel (oben,
   z. B. "hat sich dir angeschlossen") und aktionen (unten, z. B. "Zurueck
   zur Karte", "Zum Hofstaat"). Ohne beides ist es die Ansicht von heute. */
export function CharLightbox({ char, en, onClose, titel = null, aktionen = null }) {
  if (!char) return null;
  const src = char.boss ? (paintedById("boss-" + char.bid) || paintedById("boss-" + char.art)) : bildnisVon(char.id, char.level || 1);
  const kul = char.boss ? kulisseFuer({ bossId: char.bid }) : kulisseFuer({ charId: char.id });
  const kulUrl = kul ? KULISSE_URL[kul] : null;
  const name = en ? char.nameEn : char.nameDe;
  const satz = en ? char.flavorEn : char.flavorDe;
  return (
    <div data-vollbild={char.id || char.bid || ""} onClick={aktionen ? undefined : onClose} style={{ position: "fixed", inset: 0, zIndex: 80, background: "#07050d",
      display: "grid", gridTemplateRows: "auto 1fr auto", cursor: aktionen ? "default" : "zoom-out", overflow: "hidden" }}>
      {kulUrl && <img src={kulUrl} alt="" aria-hidden draggable={false} data-gg-still="" data-kulisse={kul} style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", objectPosition: "center 30%", opacity: .92, pointerEvents: "none", zIndex: 0 }} />}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "linear-gradient(180deg, rgba(7,5,13,.82) 0%, rgba(7,5,13,.15) 22%, rgba(7,5,13,.05) 55%, rgba(7,5,13,.72) 78%, rgba(7,5,13,.96) 100%)" }} />
      {/* oben: die Ueberschrift des Moments - oder nichts */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "max(18px, env(safe-area-inset-top)) 20px 0", minHeight: 24 }}>
        {titel && <div className="gg-serif" style={{ fontSize: 12, letterSpacing: ".22em", textTransform: "uppercase", color: "#e9cf8a",
          textShadow: "0 1px 6px rgba(0,0,0,.8)", animation: "ggFeierBild .7s cubic-bezier(.2,1.3,.4,1) both" }}>{titel}</div>}
      </div>
      {/* Mitte: die Figur, gross */}
      <div style={{ position: "relative", zIndex: 1, display: "grid", placeItems: "center", padding: "0 16px", minHeight: 0 }}>
        {src && <img src={src} alt="" style={{ height: "min(56vh, 520px)", maxWidth: "90vw", objectFit: "contain",
          filter: "drop-shadow(0 22px 44px rgba(0,0,0,.75))", ...(titel ? { animation: "ggFeierBild .9s cubic-bezier(.2,1.3,.4,1) .15s both" } : null) }} />}
      </div>
      {/* unten: Name, Satz, Aktionen - auf der dunklen Platte, mit Luft zur Leiste */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "10px 22px max(26px, env(safe-area-inset-bottom))" }}>
        <div className="gg-quill" style={{ color: char.boss ? "#e7b7c9" : T.goldBright, fontSize: 28, letterSpacing: ".04em",
          textShadow: "0 2px 10px rgba(0,0,0,.9)" }}>{name}</div>
        {satz && <div className="gg-serif" style={{ color: "#d9d2bb", fontStyle: "italic", fontSize: 16, lineHeight: 1.5, marginTop: 8,
          textShadow: "0 1px 6px rgba(0,0,0,.9)", maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>„{satz}“</div>}
        {aktionen && <div style={{ display: "grid", gridTemplateColumns: `repeat(${aktionen.length}, 1fr)`, gap: 10, marginTop: 18, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
          {aktionen.map((a, i) => <button key={i} type="button" onClick={(e) => { e.stopPropagation(); a.onClick?.(); }} data-aktion={a.id || i}
            style={{ fontFamily: "inherit", fontSize: 14, fontWeight: 800, padding: "12px 10px", borderRadius: 12, cursor: "pointer",
              background: a.primary ? "linear-gradient(180deg, #f0d894, #c9a95c)" : "rgba(12,8,22,.75)",
              color: a.primary ? "#2a1f0a" : "#f2ecdc", border: `1px solid ${a.primary ? "#e9cf8a" : "rgba(233,207,138,.45)"}` }}>{a.label}</button>)}
        </div>}
      </div>
    </div>
  );
}

const FAMILIES = {
  crown:  { de: "Figuren der Krone", en: "Pieces of the Crown", color: "#c9a45c" },
  shadow: { de: "Figuren des Schattens", en: "Pieces of the Shadow", color: "#8a7ab8" },
};


/** ── THE FIGURE TREE (Chronik) ──────────────────────────────────────────────
 * Every piece of the realm on one page, sorted by kin. What you see depends
 * on what you have LIVED: recruited pieces stand in gold; foes you have met
 * show their face and their tally; monsters lurking in the CURRENT league are
 * "sighted" (a dark silhouette with a name to earn); the rest is night.
 * Champions you have beaten at least once can be BRIBED — gold instead of
 * the remaining victories, the friendly duel politely skipped. */
const CROWN_IDS = ["mage","guardian","bard","paladin","inquisitor","archbishop","chancellor","engineer","standard","seeress"];
const SHADOW_IDS = ["hawk","assassin","pathfinder","dragon","sorceress","alchemist","warlock","amazon","strategist","captain"];
const COURT_IDS = ["gambit","pawn","knight","bishop","rook","queen","king"];
const FAM_LABEL = { golem: ["Golems","Golems"], beast: ["Bestien","Beasts"], serpent: ["Schlangen","Serpents"], wraith: ["Schemen","Wraiths"], tyrant: ["Tyrannen","Tyrants"] };
// figure paintings preload once per session, so the muster grid shows tiles
// and figures TOGETHER instead of empty tiles that fill in a moment later
let codexArtReady = false;
function CodexTree({ profile, dispatch, t, en, onZoom, account = null }) {
  // Werkbank-Durchblick: der Admin sieht jedes Monster und kann jede Kachel
  // oeffnen - Spieler sehen weiter nur, was sie erlebt haben.
  const isAdmin = !!account?.isAdmin;
  const met = new Set(isAdmin ? BOSSES.map((b) => "X:" + b.id) : (profile.codex?.met || []));
  const unlocked = new Set(profile.campaign?.unlocked || []);
  const league = profile.campaign?.league || 1;
  const gold = profile.gold || 0;
  // monsters currently prowling THIS league's road (rotations included)
  const sighted = useMemo(() => {
    const set = new Set();
    for (const n of CAMPAIGN) {
      const st = nodeStatus(profile, n.id);
      if (st === "locked" || st === "hidden") continue; // beyond the fog: never glimpsed
      const b = effectiveNodeBoss(n, league);
      if (b?.pure) set.add(b.pure);
    }
    return set;
  }, [profile, league]);
  const bribePrice = (ch) => Math.max(250, Math.round((ch.costValue || 320) * 0.9));
  // ── monster bribery: SOME monsters take gold — but only a lot of it, and
  // only sealed with the SACRIFICE of a recruited crown piece. Tyrants and
  // the two named finals are beyond corruption. ──
  const MONSTER_BRIBE_GOLD = 1800;
  const [sacrificeFor, setSacrificeFor] = useState(null); // bossId awaiting a crown sacrifice
  // preload every painting shown in the grid, then reveal tiles + figures at once
  const [artReady, setArtReady] = useState(codexArtReady);
  useEffect(() => {
    if (codexArtReady) return;
    const urls = new Set();
    const push = (u) => { if (u) urls.add(u); };
    for (const cid of [...COURT_IDS, ...CROWN_IDS, ...SHADOW_IDS]) {
      const ch = CHARACTERS[cid];
      /* v1.0.84: alle SECHS Raenge vorladen, sonst blitzt beim Aufstieg ein
         leeres Bild auf, bis die Datei geholt ist. */
      if (ch) { if (cid === 'gambit') for (let t = 1; t <= 6; t++) push(paintedForPiece({ kind: ch.kind, color: "w", hero: true, tier: t }));
        else push(paintedForPiece({ kind: ch.kind, color: "w", hero: false, level: 1 })); }
    }
    for (const b of BOSSES) push(paintedById("boss-" + b.id) || paintedById("boss-" + b.art));
    const list = [...urls];
    if (!list.length) { codexArtReady = true; setArtReady(true); return; }
    let done = 0, cancelled = false;
    const bump = () => { if (!cancelled && ++done >= list.length) { codexArtReady = true; setArtReady(true); } };
    for (const u of list) { const im = new Image(); im.onload = bump; im.onerror = bump; im.src = u; }
    const to = setTimeout(() => { if (!cancelled) { codexArtReady = true; setArtReady(true); } }, 3000);
    return () => { cancelled = true; clearTimeout(to); };
  }, []);
  const bribedSet = new Set(profile.campaign?.bribedBosses || []);
  const ownedBossSet = new Set(ownedLeagueBosses(profile)); // beaten league tyrants fight FOR you — the tree shows them in gold
  const crownOwned = CROWN_IDS.filter((cid) => unlocked.has(cid));
  /* v1.0.50: BESTECHEN IST EINE FREIGABE. Der Knopf existiert erst, nachdem
     das erste echte Monster besiegt wurde (Freischalt-Ordnung "bestechen") -
     vorher ist er nicht gesperrt, sondern GAR NICHT DA. Ein Knopf, den man
     sieht, aber nicht versteht, ist schlechter als keiner. */
  const bestechenOffen = freigegeben(profile, "bestechen");
  const monsterBribable = (b) => bestechenOffen && b.art !== "tyrant" && b.id !== "b23" && b.id !== "b25" && met.has("X:" + b.id) && !bribedSet.has(b.id);
  const bribeMonster = (bossId, victim) => {
    if (gold < MONSTER_BRIBE_GOLD || !unlocked.has(victim)) return;
    // formations that fielded the victim are dissolved (they fall back to default)
    const forms = { ...(profile.loadout?.formations || {}) };
    for (const k of Object.keys(forms)) if ((forms[k] || []).includes(victim)) delete forms[k];
    dispatch({ type: "REPLACE", profile: { ...profile, gold: gold - MONSTER_BRIBE_GOLD,
      loadout: { ...(profile.loadout || {}), formations: forms },
      campaign: { ...profile.campaign,
        unlocked: (profile.campaign?.unlocked || []).filter((c) => c !== victim),
        bossWins: { ...(profile.campaign?.bossWins || {}), [victim]: 0 },
        bribedBosses: [...new Set([...(profile.campaign?.bribedBosses || []), bossId])] } } });
    setSacrificeFor(null);
  };
  const bribe = (ch) => {
    const price = bribePrice(ch);
    if (gold < price) return;
    dispatch({ type: "REPLACE", profile: { ...profile, gold: gold - price,
      campaign: { ...profile.campaign, unlocked: [...new Set([...(profile.campaign?.unlocked || []), ch.id])],
        bossWins: { ...(profile.campaign?.bossWins || {}), [ch.id]: 99 } } } });
  };
  /* v1.0.60 (Besitzer, SECHSTE Meldung - und die Live-Messung gab ihm recht):
     der Sockelausgleich griff NUR bei den sechs Grundarten. Tile schluesselte
     ueber die Figurenart (kind), die Sockeltabelle kennt Hofstaat-Charaktere
     und Monster aber unter ihrer ID ("guardian", "boss-b04"). Der Schluessel
     lief ins Leere, Versatz 0 - Schildtraeger (+6.1 %!) und alle Monster
     standen weiter schief, waehrend Laeufer und Dame laengst sassen.
     Jetzt reicht champTile die ID als artId durch; Tile prueft ID, dann
     boss-ID, dann erst die Art. */
  /* v1.4.0: was die Kachel an Werten zeigt. Die Anteile rechnen wie am Brett
     (rohrAnteile), damit dieselbe Figur ueberall dasselbe Bild ergibt. */
  /* ── DIE WERTE DIREKT AUS DEN GRUNDZAHLEN (v1.6.0) ───────────────────────
     Besitzerbefund am Screenshot: "Warum haben manche Figuren jetzt so einen
     Lebensbalken und andere nicht?"

     GEFUNDEN: ich habe die Werte aus einer STANDARDAUFSTELLUNG geholt - und
     die kennt nur die sechs Grundarten (P, N, B, R, Q, K). Magier (E), Barde
     (J), Paladin (U), Schildtraeger und Spaeher haben eigene Arten, standen
     in keiner Aufstellung und fielen deshalb durch. Sie bekamen kein Rohr.

     Jetzt wird direkt gerechnet, aus BASE_HP/BASE_ATK und der Stufe - so wie
     das Spiel selbst es tut (leveling.js: hp = basis + (stufe - 1)). Damit
     bekommt JEDE Figur ihre Werte, auch eine, die nie in einer Grundstellung
     steht. */
  const kachelWerte = (cid) => {
    const ch = CHARACTERS[cid]; if (!ch) return null;
    const lv = characterLevel(profile, cid) || 1;
    const hp0 = BASE_HP[ch.kind], atk0 = BASE_ATK[ch.kind];
    if (!hp0 || !atk0) return null;
    /* v1.22.0: DIESELBE Rechnung wie im Kern (werteBeiStufe). Vorher stand
       hier eine eigene Staffelung (+1 Leben je Stufe, +1 Angriff alle drei),
       die dem Kern seit dem relativen Wachstum nicht mehr entsprach - die
       Kachel zeigte andere Werte als das Gefecht. */
    /* ── v1.24.8 (Besitzer, zum zweiten Mal gemeldet): DIE SCHILDE FEHLTEN ──
       "Im Pop-up, wo ich trainieren kann, ist der Lebensbalken und die
        Angriffsstaerke immer noch anders vom Visuellen als in der Uebersicht.
        Das muesste doch eins zu eins dasselbe sein."

       GEFUNDEN: das Blatt rechnet
         maxHp = werteBeiStufe(...).hp + shield * SHIELD_HP
       und zaehlt damit die Schilde mit. Diese Kachel rechnete nur
       werteBeiStufe(...) - OHNE Schilde. Beim Springer auf Stufe 10 mit drei
       Schilden sind das 11 gegen 17 Lebenspunkte, also ein Drittel mehr Rot
       im Ring. Genau die Figuren mit Schildsprossen fielen auf, die anderen
       nicht - deshalb "ein paar Figuren verhalten sich anders".

       Richtig ist die Fassung MIT Schilden: sie sind dauerhaftes Leben und
       zaehlen im Gefecht mit. Die Kachel zieht also nach, nicht das Blatt.
       Der Koenig hat keine Schildsprossen, bei ihm aendert sich nichts. */
    const { hp, atk } = werteBeiStufe(ch.kind, lv, { maxLevel: maxLevelFor(cid), punkte: punkteVon(cid) });
    const { shield } = resolveCharacter(ch, lv, chosenAbilities(profile, cid));
    /* v1.25.6: keine Schilde im Leben mehr */
    const heldK = cid === "gambit";
    /* v1.26.4: KEIN zweites Hochskalieren - der Kern liefert das
       Heldenbudget schon (siehe Figurenblatt). */
    const hpGanz = hp;
    const atkGanz = atk;
    /* v1.25.3: das eigene Gesamtmass der Figur auf IHRER Hoechststufe - damit
       sich Rot und Blau dort immer beruehren (der Koenig kommt auf 24, der
       Gambit auf 42, der Drache auf 54). */
    const mx = maxLevelFor(cid);
    const wMax = werteBeiStufe(ch.kind, mx, { maxLevel: mx, punkte: punkteVon(cid) });
    const sMax = resolveCharacter(ch, mx, chosenAbilities(profile, cid)).shield;
    const budget = heldK ? HELD_PUNKTE : wMax.hp + wMax.atk;
    return rohrAnteile({ hp: hpGanz, maxHp: hpGanz, atk: atkGanz, level: lv, maxLevel: mx, budget });
  };
  /* Wie weit bis zur naechsten Stufe? Aus den Skillpunkten, die sie kostet. */
  /* Es gibt keine Erfahrungspunkte JE FIGUR - Stufen kosten Skillpunkte aus
     einem gemeinsamen Vorrat. Der Balken zeigt deshalb, wie viel von den
     Kosten der naechsten Stufe schon beisammen ist. Das ist die einzige
     ehrliche Lesart: "du hast 2 von 3 Punkten, die der Turm braucht". */
  const kachelXp = (cid) => {
    const lv = characterLevel(profile, cid) || 1;
    const kosten = upgradeCost(cid, lv);
    if (!kosten) return null;
    const hat = Math.max(0, profile.sp || 0);
    return { anteil: Math.max(0, Math.min(1, hat / kosten)), hat: Math.min(hat, kosten), kosten };
  };

  const Tile = ({ img, name, dim, dark, action, glow, origin, onOpen, sigil = null, sigilBig = null, stufe = null, kind = null, hero = false, lvl = 1,
    werte = null, xpAnteil = null, artId = null, bossId = null, talente = [], ton = null, meister = false }) => (
    /* v1.0.11 (Besitzer): die Kachel KLINGT beim Tippen. Der Klangfaenger
       hoert nur auf button/[role=button] — diese div blieb stumm. */
    /* v1.14.0: DIE KACHEL TRAEGT DIE KULISSE IHRES BUNDES (Besitzerentscheid
       aus der Bundsitzung). Grossmeister eigene, Monster nach Gruppe, der
       Drache allein; Bauer und Gambit ohne. isolation: isolate oeffnet einen
       eigenen Stapel, damit das Bild mit z -1 ueber dem Kachelgrund, aber
       unter Figur und Schrift liegt. overflow: hidden beschneidet es auf die
       runden Ecken. */
    <div onClick={onOpen ? () => { klang("menue"); onOpen(); } : undefined}
      className={meister ? "gg-funkenkontur-innen" : undefined}   /* v1.27.1: laufende Kontur der Grossmeister */
      style={{ position: "relative",
      isolation: "isolate", overflow: "hidden",
      // der leichte Riss-Verlauf der Menueleisten, eine Stufe stiller
      background: "radial-gradient(130% 120% at 50% -12%, rgba(124,58,237,.20) 0%, rgba(34,22,60,.55) 46%, rgba(12,8,22,.7) 100%)",
      border: `1px solid ${glow ? T.gold : "rgba(124,58,237,.38)"}`,
      borderRadius: 11, padding: "10px 7px 9px", textAlign: "center", minWidth: 0, cursor: onOpen ? "pointer" : "default",
      /* v1.23.0 (Besitzer): Grossmeister tragen einen leuchtenden violetten Rahmen */
      ...(meister ? { border: "1px solid rgba(167,139,250,.85)", boxShadow: "0 0 14px rgba(124,58,237,.55), inset 0 0 10px rgba(124,58,237,.18)" } : null),
      boxShadow: meister ? "0 0 14px rgba(124,58,237,.55), inset 0 0 10px rgba(124,58,237,.18)" : glow ? "0 0 10px rgba(240,206,122,.22)" : "0 0 6px rgba(124,58,237,.12)" }}>
      {/* v1.15.1 (Besitzer): was noch nicht zu einem gehoert, steht in
          GRAUSTUFEN da - Kulisse wie Figur. Vorher fehlte dunklen Kacheln die
          Kulisse ganz, gedaempfte trugen sie farbig. Monster bekommen dazu
          einen Farbschleier im Ton der Figur. */}
      {/* v1.19.0 (Besitzer): der Farbangleich der Monster auch bei den
          Figuren - aber schwaecher, sie tragen mehrere Farben. Ton der Figur
          aus der Messung (figurfarbe.json), 22 % statt 45 %. */}
      <KulisseHinterGrund name={kulisseFuer({ charId: artId, bossId })} deckung={dark ? 0.5 : dim ? 0.7 : 0.92}
        grau={!!(dim || dark)} ton={ton || figurFarbe(paintedIdOf(img))} tonStaerke={ton ? 0.45 : 0.30} />
      {/* v1.23.2 (Besitzer, aus der Vorlage): DIE ECKVERZIERUNG - kleine
          Goldwinkel mit Punkt, wie die Beschlaege einer Kartenbox. Grau bei
          Fremdem, violett beim Grossmeister. */}
      {/* v1.23.3 (Besitzer mit Screenshot): DREI BEFUNDE, ALLE GEMESSEN.
          1. ZWEI DER VIER ECKEN WAREN FALSCH GEDREHT. Der Grundpfad zeichnet
             einen Winkel OBEN LINKS; die Liste gab unten links 90 statt 270
             und oben rechts 270 statt 90 - die beiden Eintraege waren
             vertauscht, deshalb zeigten zwei Winkel nach innen ("manche
             zeigen nach innen, manche nach aussen").
          2. DER WINKEL WAR DICKER ALS DER REST SEINES EIGENEN ZEICHENS:
             Hauptwinkel 1,3 px, die beiden kleinen Striche daneben 1,0
             ("die Ecke ist ein bisschen dicker"). Jetzt 0,85 - eine Spur
             feiner als die Striche - und der Eckradius 3,5 statt 0,6, damit
             die Kontur der Kachelrundung (11) folgt.
          Die Verzierung liegt auf z -1, also HINTER allem ausser der Kulisse
          ("die muessen natuerlich hinter allen Elementen sein"). */}
      {/* v1.23.4 (Besitzer): WIEDER IN ALLEN VIER ECKEN, aber mit gerechnetem
          SICHERHEITSABSTAND ("es muss auf jeden Fall sichergestellt werden,
          dass wir nie dieses Emblem mit der Stufe oder die Faehigkeiten damit
          ueberschneiden ... und immer ein symmetrischer Abstand dazu, von
          rechts und oben oder links und oben").

          GEMESSEN, warum es vorher nicht ging: das Stufen-Abzeichen stand
          4 px unter der Oberkante und 4 px vor dem rechten Rand und ist
          36x36 gross - es besetzte die ganze rechte obere Ecke. Die
          Talentspalte sass bei 11 oben / 8 links, also nicht einmal
          symmetrisch zu sich selbst (die Kachel hat 10 px Polster oben, 7 an
          den Seiten). Der Winkel bei Abstand 5 lief mit seinem Punkt genau
          hinein.

          GEBAUT: beide ruecken auf SYMMETRISCHE 10/10 - das Abzeichen 10 von
          oben und 10 von rechts, die Talente 10 von oben und 10 von links.
          Die Verzierung rueckt weiter in den Rand, auf Abstand 3. Damit
          reicht ihre tiefste Tinte (der Punkt, Mitte 7,0 px, Halbmesser 0,9)
          bis 7,9 px - 2,1 px Luft zu beidem. Nachgemessen in
          messe_kulissen.mjs, alle vier Ecken und beide Nachbarn. */}
      {/* v1.23.5 (Besitzer): "mach die Verzierung noch ein Stueck weiter in die
          Ecke und noch ein bisschen kleiner" - damit Stufe und Faehigkeiten
          selbst weiter nach aussen ruecken koennen. 10 px statt 14, Abstand 1
          statt 3. Gerechnet: die tiefste Tinte ist der Punkt, Mitte
          4,6/16 x 10 = 2,9 px, Halbmesser 0,7 - er reicht bis 2+2,9+0,7 = 5,6
          px von jeder Kante. Abzeichen und Talente stehen auf 7, also bleiben
          1,4 px Luft. Nachgemessen, nicht geschaetzt. */}
      {[["oben-links", 0, true, true], ["oben-rechts", 90, true, false],
        ["unten-rechts", 180, false, false], ["unten-links", 270, false, true]].map(([wo, rot, oben, links]) =>
        <svg key={wo} data-ecke={wo} viewBox="0 0 16 16" width="10" height="10" aria-hidden
          style={{ position: "absolute", top: oben ? 1 : "auto", bottom: oben ? "auto" : 1,
            left: links ? 1 : "auto", right: links ? "auto" : 1,
            transform: `rotate(${rot}deg)`, zIndex: -1, pointerEvents: "none", opacity: dark ? .35 : .85 }}>
          {/* v1.23.4: der Winkel in DREI Stuecken statt einem. Grund ist die
              Probe: ein L hat als Kasten ein Quadrat, und ein Kastenvergleich
              meldet deshalb eine Ueberschneidung mit dem Abzeichen, wo gar
              keine Tinte liegt. Zerlegt in Arm - Bogen - Arm ist jeder Kasten
              wieder so duenn wie der Strich, und der Abstand zum Abzeichen
              laesst sich messen statt behaupten. Gezeichnet aendert sich
              nichts: gleiche Punkte, gleiche Staerke, runde Enden. */}
          <path d="M1.5 9.5V5" fill="none" stroke={meister ? "#c3aaf5" : "#e9cf8a"} strokeWidth="0.85" strokeLinecap="round" />
          <path d="M1.5 5A3.5 3.5 0 0 1 5 1.5" fill="none" stroke={meister ? "#c3aaf5" : "#e9cf8a"} strokeWidth="0.85" strokeLinecap="round" />
          <path d="M5 1.5H9.5" fill="none" stroke={meister ? "#c3aaf5" : "#e9cf8a"} strokeWidth="0.85" strokeLinecap="round" />
          <path d="M1.5 12.5c0 1.6 1 2.4 2.4 2.4" fill="none" stroke={meister ? "#c3aaf5" : "#e9cf8a"} strokeWidth="1" strokeLinecap="round" opacity=".8" />
          <path d="M12.5 1.5c1.6 0 2.4 1 2.4 2.4" fill="none" stroke={meister ? "#c3aaf5" : "#e9cf8a"} strokeWidth="1" strokeLinecap="round" opacity=".8" />
          <circle cx="4.6" cy="4.6" r="1.05" fill={meister ? "#c3aaf5" : "#e9cf8a"} />
        </svg>)}
      {/* v1.15.1: DIE KOPFZEILE - fuer JEDE Kachel gleich (Besitzervorlage):
          links die Talente, in der Mitte das Lebensrohr, rechts die Stufe.
          Monster tragen dieselbe Zeile; wo nichts zu zeigen ist, bleibt der
          Platz leer, das Mass aber steht. */}
      {/* v1.20.2 (Besitzer: "warum sind Stratege und Kapitaen so hoch?"): die
          Talentspalte links wuchs mit zwei Zeichen auf 45 px und drueckte
          Figur und Namen ihrer Kachel nach unten - die Nachbarn ohne Talente
          sassen 24 px hoeher. Die Kopfzeile hat jetzt eine FESTE Hoehe (21),
          die Talente haengen als eigene Spalte ueber dem Bild (absolut), wie
          in der Vorlage. Gemessen: Namenszeile in allen Kacheln gleich. */}
      <div data-kopf="1" style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 4, marginBottom: 2, height: 21 }}>
        {/* v1.23.4: die Talentspalte auf symmetrische 10/10 zum Kachelrand
            (vorher 11 oben / 8 links) - dieselbe Lage wie das Abzeichen
            gegenueber, und damit frei von der Eckverzierung.
            v1.23.5 (Besitzer): auf 7/7, also weiter in die Ecke - und ALLE
            Faehigkeiten statt der ersten zwei ("ich habe beim Kanzler alle
            aktiviert, es werden aber nicht alle angezeigt; die muessten die
            ganze Karte links runter fuellen"). Die Spalte liegt auf z 2, also
            ueber dem Gemaelde, und ist etwas schmaler (19 statt 21), damit
            der Figur in der Mitte mehr Bahn bleibt. */}
        <div data-talentspalte="1" style={{ position: "absolute", left: -1, top: -4, display: "flex", flexDirection: "column", gap: 3, width: 19, zIndex: 2 }}>
          {(talente || []).slice(0, TALENT_KACHEL_MAX).map((id) => <span key={id} data-talent={id} style={{ width: 19, height: 19, display: "grid", placeItems: "center",
            borderRadius: 6, background: "rgba(12,8,22,.78)", border: "1px solid rgba(233,207,138,.45)",
            filter: dim || dark ? "grayscale(1)" : "none" }}><AbilityIcon id={id} size={14} /></span>)}
          {(talente || []).length > TALENT_KACHEL_MAX && <span data-talentmehr={(talente || []).length - TALENT_KACHEL_MAX}
            style={{ width: 19, height: 19, display: "grid", placeItems: "center", borderRadius: 6,
              background: "rgba(12,8,22,.78)", border: "1px solid rgba(233,207,138,.3)",
              font: "700 9.5px/1 Georgia, serif", color: dim || dark ? "#8d8776" : "#e9cf8a" }}>+{(talente || []).length - TALENT_KACHEL_MAX}</span>}
        </div>
        <div style={{ flex: "1 1 auto", minWidth: 0, height: 21, display: "flex", justifyContent: "center", alignItems: "center", lineHeight: 0, overflow: "visible",
          /* der SVG-Kasten des Rohrs reserviert oben Platz fuer die Perle, der
             Rohrkoerper sitzt darin unten: gemessen 3,4 px unter der Mitte
             der Stufe. Um genau das hochgerueckt. */
          transform: "translateY(-3.4px)" }}>
          {werte && !bandBekannt(paintedIdOf(img)) && <LebensRohr lebenAnteil={werte.leben} kraftAnteil={werte.kraft} talentBereit={false} breite="4.2em" hoehe="0.72em"
            style={dim || dark ? { filter: "grayscale(1)", opacity: .6 } : undefined} />}
        </div>
        {/* Die Stufe: die Ziffer sitzt als Flex-Kind mit line-height 1 in der
            Mitte - kein SVG-Text mehr, dessen Grundlinie je Schrift wanderte
            (Besitzerbefund: "nicht sauber ausgemittelt"). Gemessen in
            messe_kulissen.mjs. */}
        {/* v1.19.0 (Besitzer): DAS MEDAILLON - der Stufenkreis in der Farbe
            der Figur (Monster: Akzent des Bosses), mit feiner Struktur
            (Speichen aus einem konischen Verlauf) und Schattierung: Glanz
            oben, Schatten unten, ein Rand im helleren Ton. Grau fuer Fremdes,
            Violett nur noch, wenn keine Farbe bekannt ist. */}
        {/* v1.21.0: DAS STUFEN-ABZEICHEN - Form nach Bund, Farbe der Figur,
            Metall nach Stufe (Bronze, Silber, Gold, Lorbeer auf Zehn). 30 px,
            ragt 4 px ueber die Kopfzeile, wie in der Vorlage. */}
        {stufe != null
          ? <div style={{ width: 21, height: 21, flex: "0 0 auto", position: "relative" }}>
              {/* v1.21.2 (Besitzer): groesser - 36 px statt 30, ragt 7 px ueber die Kopfzeile und 7 px in den Rand */}
              {/* v1.23.0 (Besitzer): gleicher Abstand nach oben und rechts */}
              {/* v1.23.4: 10 px beidseits statt 4 - der Platz gehoert jetzt
                  auch der Eckverzierung, und dieselbe Lage wie die
                  Talentspalte auf der anderen Seite.
                  v1.23.5 (Besitzer): 7/7 - die kleinere Verzierung gibt den
                  Platz frei, das Abzeichen rueckt weiter in die Ecke. */}
              <div style={{ position: "absolute", top: -4, right: -1 }}>
                <StufenAbzeichen form={formFuer({ charId: artId, bossId })} stufe={stufe} maxStufe={bossId ? BOSS_MAX_LEVEL : maxLevelFor(artId || "pawn")}
                  farbe={ton || figurFarbe(paintedIdOf(img)) || "#5b3fa6"} grau={!!(dim || dark)} size={36} /></div></div>
          : <div style={{ width: 21, height: 21, flex: "0 0 auto" }} />}
      </div>
      {/* v1.0.11 (Besitzer): das ECK-SIGIL ist fort — die Kachel gehört ganz
          der Figur. Das Vektorzeichen lebt weiter in der Chronik (beide
          Gesichter) und als Sperr-Silhouette unten, wenn kein Gemälde da ist. */}
      {schlichtAn() && kind ? <div style={{ width: "100%", aspectRatio: "1 / 1", display: "grid", placeItems: "center", margin: "0 auto",
        opacity: dark ? 0.5 : dim ? 0.7 : 1, filter: dark ? "brightness(0.35)" : "none" }}>
          <PieceArt kind={kind} size={"112%"} level={lvl} hero={hero} />   {/* v1.0.35: Kachelfigur groesser */}
        </div>
      : img ? <div data-boden={bodenAusgleichProzent(paintedIdOf(img)).toFixed(2)} style={{ position: "relative", width: "118%", aspectRatio: "1 / 1", margin: "0 0 -7px -9%",
          /* v1.20.1: alle Figuren auf dieselbe Bodenlinie (siehe bodenAusgleichProzent) */
          /* v1.23.0: und alle auf dieselbe Tellerbreite (sockelSkalierung), um den Fuss herum */
          transformOrigin: "50% 100%", "--skala": sockelSkalierung(paintedIdOf(img)).toFixed(3), "--streck": figurStreckung(paintedIdOf(img)).toFixed(3),
          /* v1.23.2: auf den Teller zentriert, auf Bauernhoehe gestreckt (siehe SockelBand.jsx) */
          transform: `translate(${tellerMitteProzent(paintedIdOf(img)).toFixed(2)}%, ${bodenAusgleichProzent(paintedIdOf(img)).toFixed(2)}%) scale(var(--skala), calc(var(--skala) * var(--streck)))` }}>
        {/* v1.17.0: Bild und Sockelband in EINEM Kasten mit denselben
            Massen, die vorher das Bild allein trug - so bleibt die
            Zentrierung (siehe unten), und der SVG liegt deckungsgleich. */}
        <img src={img} alt="" decoding="async" /* v1.0.35 (Besitzer): "unter Figuren in den Kacheln koennten sie auch
             noch etwas groesser sein." 104 % liessen an den Seiten Luft, die
             die Kachel groesser wirken liess als ihr Bild. Jetzt 118 % mit
             etwas mehr Ueberhang nach unten. */
        /* v1.0.56 (Besitzerbefund, VIERTE Meldung): DIESE Kachel war es. Ich
           hatte den Sockelausgleich in der Aufstellung und in der Detailkarte
           gesetzt - aber der HOFSTAAT, also genau das Bild, das der Besitzer
           jedes Mal fotografiert hat, rendert ueber einen dritten Weg, den
           ich nie angefasst habe. Darum "hat sich nichts geaendert": es
           stimmte, meine Aenderungen liefen an dieser Ansicht vorbei. */
        /* v1.0.65 (Besitzerbefund "immer noch nicht mittig", GEMESSEN):
           HIER lag es - und es waren nie die Bilder. `margin: 0 auto` zentriert
           NICHT, wenn der Kasten breiter ist als sein Elter: bei ueberbestimmten
           Raendern verwirft CSS den rechten und macht den linken zu null. Das
           Bild hing also mit seinen vollen 18 Ueberbreite nach RECHTS ueber,
           seine Mitte lag 9 % neben der Kachelmitte. Am lebenden DOM gemessen:
           +9,2 px bei 119 px Kachel, bei JEDER Figur exakt gleich - das
           verraet die Bauweise, nicht das Gemaelde (die Bilder selbst messen
           nur ±0,5 % Sockelversatz).
           Darum drei Anlaeufe (v1.0.49 x, v1.0.52 Sockel, v1.0.62 Bilder
           gerichtet) am Ziel vorbei: sie haben die Gemaelde vermessen, waehrend
           der Versatz aus dem Rand kam.
           linker Rand 50 % der Kachel, dann das Bild um seine halbe eigene
           Breite zurueck - das trifft die Mitte bei jeder Ueberbreite. */
        /* v1.0.87 (Besitzer-Screenshot 11.9.2026, "beim Wechsel von der Karte
           in den Figuren-Reiter"): DIE BILDER SASSEN UM IHRE HALBE BREITE
           RECHTS - das ist exakt margin-left 50 % OHNE translateX(-50 %).
           Ein Transform kann beim Neuaufbau nach einem Tabwechsel spaeter
           greifen als der Rand (Uebergang, Compositing) - fuer einen Rahmen
           steht das Bild dann falsch, und wer in dem Moment hinsieht, sieht
           die "verschobenen Kacheln". Jetzt zentriert der Rand ALLEIN:
           118 % Breite, -9 % links - kein Transform, nichts, was spaeter
           greifen koennte. Gleiches Ergebnis, eine Fehlerklasse weniger. */
        style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "contain", display: "block",
        /* v1.0.59: HIER LAG DER ABSTURZ ("ch is not defined", Besitzer-Foto).
           Diese Kachel ist die generische Tile-Komponente - sie kennt die
           champTile-Variablen NICHT, sie bekommt kind und hero als PROPS.
           Mein v1.0.56-Edit hat die fremden Namen hierher kopiert, wo es
           sie nie gab; beim ersten Rendern des Figuren-Reiters flog der
           ReferenceError und der Fehlervorhang stand. Die Proben fingen es
           nicht, weil sie den QUELLTEXT lasen statt zu rendern - das ist
           jetzt nachgeholt (test_ui rendert die Kachel). */
        filter: dark ? "brightness(0) opacity(.55)" : dim ? "grayscale(1) brightness(.8)" : "brightness(1.14) saturate(1.05)",
        userSelect: "none" }} />
        {werte && <SockelBand paintedId={paintedIdOf(img)} leben={werte.leben} kraft={werte.kraft} grau={!!(dim || dark)} id={`sb-${artId || bossId || "x"}`} />}
        </div>
        : <div style={{ width: "100%", aspectRatio: "1 / 1", display: "grid", placeItems: "center", margin: "0 auto" }}>
            {/* NEVER A QUESTION MARK WHERE A FIGURE BELONGS. If no painting is
                at hand, the tile shows the piece's own shape as a black
                silhouette — a shadow you can still recognise. The NAME may stay
                "???" until you have met it; the shape does not have to. */}
            {sigil
              ? <span className="gg-fit-svg" style={{ display: "grid", placeItems: "center", width: "72%", height: "72%",
                  filter: "brightness(0) opacity(.62)" }}>{sigilBig || sigil}</span>
              : <span style={{ fontSize: 26, color: T.faint }}>◆</span>}
          </div>}
      {/* v1.4.0: DAS ROHR UNTER DER FIGUR. Gerade und duenn - die Kruemmung
          nimmt am Brett die Sockelwoelbung auf, hier gibt es keinen Sockel.
          Es erscheint nur, wenn die Figur ueberhaupt Werte hat. */}
      {/* v1.15.1: das Rohr sitzt jetzt oben in der Kopfzeile */}
      <div className="gg-quill" style={{ fontSize: 12.5, marginTop: 5, color: dark ? T.faint : glow ? T.goldBright : T.text,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
      {/* Die Vorlage (ds1-vorlage-screens): jede Kachel traegt ihre Stufe -
          "Koenig Stufe 8" - klein und golden unter dem Namen. */}
      {/* v1.4.0: DIE STUFE ALS GOLDKREIS OBEN RECHTS (Besitzerwunsch). Vorher
          stand sie als Zeile unter dem Namen und kostete Platz, den jetzt der
          Erfahrungsbalken bekommt. Die Ziffer sitzt als SVG-Text mit
          dominant-baseline central - jeder Versuch mit line-height sass
          daneben, weil Georgias Ziffern Unterlaenge haben. */}
      {/* v1.15.1: die Stufe steht in der Kopfzeile, siehe oben */}
      {/* v1.6.0: DER ERFAHRUNGSBALKEN IST FORT (Besitzerentscheid). Es macht
          gar keinen Sinn, diesen zu haben - im Endeffekt sind die Schritte zu
          klein, ich kann ja fast schon mit einem Schritt aufleveln.

          Er hat recht, und das war mein Denkfehler: ich habe ihn als
          Fortschrittsanzeige gebaut, aber Stufen kosten Skillpunkte aus einem
          gemeinsamen Vorrat - da gibt es keinen Fortschritt, nur reicht oder
          reicht nicht. Eine Anzeige, die fast immer voll ist, sagt nichts. */}
      {/* v1.15.1 (Besitzer): "Verbuendet", "Meister & Grossmeister" und Co.
          stehen nicht mehr auf der Kachel - nur der Name. Wer mehr wissen
          will, tippt die Karte an. origin bleibt als Prop, wird aber nicht
          mehr gezeichnet. */}
      {action}
    </div>
  );
  const [detail, setDetail] = useState(null); // a tapped figure opens its FULL card (level, ladder, upgrades)
  useEffect(() => {   // dieselbe Marke fuer das Figuren- und Monsterblatt
    if (!detail) return;
    document.documentElement.dataset.ggPopup = "1";
    return () => { delete document.documentElement.dataset.ggPopup; };
  }, [detail]);
  const champTile = (cid, origin) => {
    const ch = CHARACTERS[cid]; if (!ch) return null;
    /* v1.0.50: VOR DEM ERWACHEN GIBT ES IHN NICHT - auch nicht im
       Verzeichnis-Baum. Dieselbe Regel wie in Figurenliste und Chronik. */
    if (cid === "gambit" && !gambitWach(profile)) return null;
    const img = schlichtAn() ? null : paintedForPiece({ kind: ch.kind, color: "w", hero: cid === "gambit", level: characterLevel(profile, cid) || 1 });
    const own = unlocked.has(cid) || COURT_IDS.includes(cid);
    const seen = met.has(ch.kind);
    const wins = bossWinsFor(profile, cid) || 0;
    const sig = <PieceArt kind={ch.kind} hero={cid === "gambit"} size={28} level={1}
      fill="#c9a45c" rim="#1b1408" rimW={1.6} detail="#7a5c26" accent="#eac96b" />;
    const sigBig = <PieceArt kind={ch.kind} hero={cid === "gambit"} size={58} level={1}
      fill="#c9a45c" rim="#1b1408" rimW={1.6} detail="#7a5c26" accent="#eac96b" />;
    if (own) return <Tile key={cid} werte={kachelWerte(cid)} xpAnteil={kachelXp(cid)} artId={cid} img={img} kind={ch.kind} hero={cid === "gambit"} lvl={characterLevel(profile, cid) || 1} talente={chosenAbilities(profile, cid)} /* v1.4.2: GEFUNDEN, warum der Stufenkreis nie erschien - die Bedingung
           fragte unlocked.has(cid), aber die Grundfiguren des Hofstaats
           (Koenig, Dame, Turm ...) sind von Anfang an da und stehen NIE in
           unlocked. Sie hatten damit immer null. \ deckt beides ab:
           freigeschaltet ODER von Haus aus dabei. */
        stufe={own ? (characterLevel(profile, cid) || 1) : null} name={en ? ch.nameEn : ch.nameDe} glow origin={origin} sigil={sig} sigilBig={sigBig} onOpen={() => setDetail(cid)} />;
    if (seen || wins > 0) {
      const price = bribePrice(ch);
      return <Tile key={cid} artId={cid} img={img} kind={ch.kind} hero={cid === "gambit"} lvl={characterLevel(profile, cid) || 1} dim name={en ? ch.nameEn : ch.nameDe} sigil={sig} sigilBig={sigBig} origin={origin} onOpen={() => setDetail(cid)}
        action={wins >= 1 ? <button onClick={(e) => { e.stopPropagation(); bribe(ch); }} disabled={gold < price}
          title={t("tree.bribeHint")}
          style={{ marginTop: 5, width: "100%", padding: "4px 4px", borderRadius: 7, fontFamily: "inherit", fontWeight: 800,
            fontSize: 10, cursor: gold >= price ? "pointer" : "default", opacity: gold >= price ? 1 : 0.45,
            background: "linear-gradient(165deg, #e0b76c, #b78d43)", border: "1px solid rgba(255,240,200,.5)", color: "#17110a" }}>
          {t("tree.bribe", { g: price })}</button> : null} />;
    }
    return <Tile key={cid} artId={cid} img={img} dark name={"???"} sigil={sig} sigilBig={sigBig} />;
  };
  const monsterTile = (b) => {
    // paintedById is a FUNCTION — reading it with brackets returned undefined
    // every single time, which is why every master stood as a question mark
    // while its painting sat right there in the gallery.
    const img = paintedById("boss-" + b.id) || paintedById("boss-" + b.art);
    const k = "X:" + b.id;
    // Rueckmeldung des Besitzers (v0.44): Monster und Figuren trugen im
    // Verzeichnis ZWEI Handschriften - die Meister ein rosa Siegel, der Hof
    // ein goldenes. Jetzt EINE Goldpalette fuer beide; wer Meister von Hof
    // unterscheiden will, liest es am Bild und der Herkunftszeile, nicht an
    // einer zweiten Farbwelt.
    const sig = <PieceArt kind="X" bossId={b.id} art={b.art} size={28} level={1}
      fill="#c9a45c" rim="#1b1408" rimW={1.6} detail="#7a5c26" accent="#eac96b" />;
    const sigBig = <PieceArt kind="X" bossId={b.id} art={b.art} size={58} level={1}
      fill="#c9a45c" rim="#1b1408" rimW={1.6} detail="#7a5c26" accent="#eac96b" />;
    /* v1.15.1: Monster tragen dieselbe Kopfzeile wie alle - Rohr aus den
       Bosswerten der aktuellen Stufe, Stufe rechts, Farbschleier im Ton. */
    const mLv = characterLevel(profile, k) || 1;
    const mSpec = bossSpecLeveled(b, mLv);
    const mWerte = rohrAnteile({ hp: mSpec.hp, atk: mSpec.atk, level: mLv, maxLevel: BOSS_MAX_LEVEL });
    const ton = b.accent || null;
    const meister = LEAGUE_BOSSES.includes(b.id);
    if (bribedSet.has(b.id) || ownedBossSet.has(b.id)) return <Tile key={b.id} img={img} bossId={b.id} glow meister={meister} sigil={sig} sigilBig={sigBig} werte={mWerte} ton={ton}
      onOpen={() => setDetail(k)} stufe={mLv}
      name={en ? b.nameEn : b.nameDe} origin={bribedSet.has(b.id) ? t("tree.allied") : t("tree.inCourt")} />;
    if (met.has(k)) {
      const can = monsterBribable(b);
      return <Tile key={b.id} img={img} bossId={b.id} dim sigil={sig} sigilBig={sigBig} werte={mWerte} ton={ton} stufe={mLv} name={en ? b.nameEn : b.nameDe} origin={t("tree.masters")}
        onOpen={() => setDetail(k)}
        action={can ? (sacrificeFor === b.id
          ? <div style={{ marginTop: 5 }}>
              <div style={{ fontSize: 9.5, color: T.gold, marginBottom: 3 }}>{t("tree.pickSacrifice")}</div>
              {crownOwned.length === 0 && <div style={{ fontSize: 9.5, color: T.faint }}>{t("tree.noCrown")}</div>}
              {crownOwned.map((cid) => <button key={cid} onClick={() => bribeMonster(b.id, cid)}
                style={{ display: "block", width: "100%", marginTop: 3, padding: "3px 4px", borderRadius: 6,
                  fontFamily: "inherit", fontSize: 9.5, fontWeight: 800, cursor: "pointer",
                  background: T.panel, border: `1px solid ${T.gold}66`, color: T.gold }}>
                {en ? CHARACTERS[cid].nameEn : CHARACTERS[cid].nameDe}</button>)}
              <button onClick={() => setSacrificeFor(null)} style={{ display: "block", width: "100%", marginTop: 3,
                padding: "3px 4px", borderRadius: 6, fontFamily: "inherit", fontSize: 9.5, cursor: "pointer",
                background: "none", border: `1px solid ${T.line}`, color: T.dim }}>{t("tree.cancel")}</button>
            </div>
          : <button onClick={() => setSacrificeFor(b.id)} disabled={gold < MONSTER_BRIBE_GOLD}
              title={t("tree.monsterBribeHint")}
              style={{ marginTop: 5, width: "100%", padding: "4px 4px", borderRadius: 7, fontFamily: "inherit", fontWeight: 800,
                fontSize: 10, cursor: gold >= MONSTER_BRIBE_GOLD ? "pointer" : "default", opacity: gold >= MONSTER_BRIBE_GOLD ? 1 : 0.45,
                background: "linear-gradient(165deg, #b78de0, #7a5ab0)", border: "1px solid rgba(226,205,255,.5)", color: "#17110a" }}>
              {t("tree.bribe", { g: MONSTER_BRIBE_GOLD })}</button>) : null} />;
    }
    if (sighted.has(b.id)) return <Tile key={b.id} img={img} bossId={b.id} dark sigil={sig} sigilBig={sigBig} werte={mWerte} ton={ton} name={en ? b.nameEn : b.nameDe} origin={t("tree.sighted")} />;
    return <Tile key={b.id} img={img} dark name={"???"} />;
  };
  const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 7 };
  const H = ({ children }) => <div className="gg-serif" style={{ fontSize: 12, letterSpacing: ".12em", color: T.gold, margin: "14px 0 7px" }}>{children}</div>;
  const fams = ["golem", "beast", "serpent", "wraith", "tyrant"];
  // recruits RISE into the court — each keeps a small note of where it came from
  const crownIn = CROWN_IDS.filter((c) => unlocked.has(c));
  const shadowIn = SHADOW_IDS.filter((c) => unlocked.has(c));
  const alliedIn = BOSSES.filter((b) => bribedSet.has(b.id));
  // DS1 Phase 8: Vesnas Vorrede stand dauerhaft vierzeilig ueber dem
  // Verzeichnis. Jetzt zwei Zeilen (-webkit-line-clamp), ein Tipp klappt den
  // Rest auf - die Chronikstimme bleibt, die Figuren ruecken nach oben.
  const [introOffen, setIntroOffen] = useState(false);
  /* v1.1.17 (Besitzer: "dieses Mehr hat keine Funktion, lass das weg"): ER
     HAT RECHT, UND ICH HABE ES SELBST VERURSACHT. Die Vorrede war auf zwei
     Zeilen beschnitten, "… Mehr" klappte den Rest auf. Seit ich den Text in
     v1.1.11 von 244 auf 127 Zeichen gekuerzt habe, passt er in die zwei
     Zeilen - das Antippen tat sichtbar nichts mehr. Jetzt steht der Text
     ganz da, ohne Beschnitt und ohne Knopf. */
  const Vorrede = () => <div style={{ fontSize: 12.5, color: T.dim, lineHeight: 1.55, marginBottom: 4 }}>
    {t("tree.intro")}
  </div>;
  if (!artReady) return <div style={{ }}>
    <Vorrede />
    <div style={{ padding: "48px 0", display: "grid", placeItems: "center" }}>
      <div style={{ width: 26, height: 26, borderRadius: "50%", border: `2px solid ${T.line}`,
        borderTopColor: T.gold, animation: "spin .8s linear infinite" }} />
    </div>
  </div>;
  return <div style={{ }}>
    <Vorrede />
    <H>{t("tree.court")}</H><div style={grid}>
      {/* v0.81: DER GAMBIT FEHLT HIER, BIS ER ERWACHT. Vor dem dritten
          geschafften Gefecht gibt es ihn nicht - kein Name, kein Bild, kein
          leerer Platz mit Fragezeichen. Erst wenn er sich selbst entdeckt,
          steht er im Verzeichnis. */}
      {(gambitWach(profile) ? COURT_IDS : COURT_IDS.filter((c) => c !== "gambit")).map((c) => champTile(c))}
      {crownIn.map((c) => champTile(c, t("tree.fromCrown")))}
      {shadowIn.map((c) => champTile(c, t("tree.fromShadow")))}
      {alliedIn.map(monsterTile)}
    </div>
    {(() => { const rest = CROWN_IDS.filter((c) => !unlocked.has(c));
      return rest.length ? <><H>{t("tree.crown")}</H><div style={grid}>{rest.map((c) => champTile(c))}</div></> : null; })()}
    {(() => { const rest = SHADOW_IDS.filter((c) => !unlocked.has(c));
      return rest.length ? <><H>{t("tree.shadow")}</H><div style={grid}>{rest.map((c) => champTile(c))}</div></> : null; })()}
    {/* ONE HALL FOR THE MASTERS. Five family headings (Golems, Beasts,
        Serpents, Wraiths, Tyrants) split twenty-five monsters into five thin
        rows of mostly "???" — the register read as a list of holes rather than
        a chronicle. They stand together now, in the order you meet them. */}
    {(() => {
      const list = BOSSES.filter((b) => !bribedSet.has(b.id) && !ownedBossSet.has(b.id));
      return list.length ? <div><H>{t("tree.masters")}</H><div style={grid}>{list.map(monsterTile)}</div></div> : null;
    })()}
    {/* EIN MONSTER OEFFNET SEINE KARTE wie jede Figur des Hofs: Portrait,
        Zeichen, Familie, Zugbild und sein Fluestern. Der Rahmen traegt das
        Licht des Risses statt des Goldes der Krone. */}
    {detail && detail.startsWith("X:") && (() => {
      const b = BOSSES.find((x) => "X:" + x.id === detail);
      if (!b) return null;
      const img = paintedById("boss-" + b.id) || paintedById("boss-" + b.art);
      const fam = FAM_LABEL[b.art] ? (en ? FAM_LABEL[b.art][1] : FAM_LABEL[b.art][0]) : b.art;
      return <div onClick={() => setDetail(null)} style={{ position: "fixed", inset: 0, zIndex: 55, background: "rgba(4,6,10,.72)",
        display: "block", overflow: "hidden",
          /* v0.81 (Besitzer): OBEN VERANKERT statt zentriert. Eine zentrierte
             Karte waechst in BEIDE Richtungen - ist sie hoch, wandert ihr Kopf
             unter die Leiste. Jetzt beginnt jedes Popup auf DERSELBEN Hoehe,
             gleich wie gross sein Inhalt ist, und scrollt in sich. */
        }}>
        <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", left: "50%", transform: "translateX(-50%)",
          top: "calc(14px + var(--gg-popfrei-oben, 0px))",
          maxHeight: "calc(100dvh / var(--vhz, 1) - 30px - var(--gg-popfrei-oben, 0px) - var(--gg-popfrei-unten, 0px))",
          display: "flex", flexDirection: "column", width: "min(100vw - 20px, 420px)",
          borderRadius: 22, overflow: "hidden", boxShadow: `0 18px 50px rgba(0,0,0,.6), 0 0 26px ${T.riftGlow}`,
          border: `1px solid ${T.riftLine}`,
          background: "radial-gradient(130% 110% at 50% -10%, rgba(124,58,237,.28) 0%, rgba(26,16,44,.97) 46%, rgba(8,5,14,.99) 100%)" }}>
          <button onClick={() => setDetail(null)} aria-label="close" style={{ position: "absolute", top: 9, right: 9, zIndex: 4,
            width: 30, height: 30, borderRadius: "50%", display: "grid", placeItems: "center", cursor: "pointer",
            background: "rgba(10,13,20,.72)", border: `1px solid ${T.riftLine}`, color: T.riftBright,
            fontFamily: "inherit", fontSize: 13, lineHeight: 1 }}>✕</button>
          <div className="gg-thinbar" style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", padding: "18px 16px 16px" }}>
            {/* ── v1.25.9 (Besitzer): DIESELBE BUEHNE WIE BEIM FIGURENBLATT ────
                "Ich wollte doch bei allen Monstern genau das gleiche Design wie
                 bei meinen Figuren." Kulisse, Eckverzierungen, Figur mit
                 Sockelband, Name darunter, rechts das Zugbild und die
                 Faehigkeitszeichen, Stufenanzeige mit Emblem, die Wertkaesten.
                 Es ist DASSELBE Bauteil (BlattBuehne), nichts nachgebaut. */}
            {(() => {
              const pidB = bandBekannt("boss-" + b.id) ? "boss-" + b.id : "boss-" + b.art;
              const tonB = figurFarbe(pidB) || b.accent || "#5b3fa6";
              const lvlB = bossLevelOf(profile, b.id) || 1;
              const budgetB = b.hp + b.atk;
              const bandB = rohrAnteile({ hp: b.hp, maxHp: b.hp, atk: b.atk, level: BOSS_MAX_LEVEL, maxLevel: BOSS_MAX_LEVEL, budget: budgetB });
              let kulB = null; try { kulB = KULISSE_URL[kulisseFuer({ bossId: b.id })]; } catch { kulB = null; }
              return <BlattBuehne kennung={"boss-" + b.id} name={en ? b.nameEn : b.nameDe} haus={fam}
                satz={en ? b.flavorEn : b.flavorDe} portraet={img} pid={pidB} ton={tonB} kul={kulB}
                form={formFuer({ bossId: b.id })} stufe={lvlB} maxStufe={BOSS_MAX_LEVEL}
                zugKind={null} moveSpec={b.moveSpec} talente={[]}
                zeichen={(b.abilities || []).map((id) => ({ id, gelernt: true }))}
                band={{ leben: bandB.leben, kraft: bandB.kraft }}
                atk={bossSpecLeveled(b, lvlB).atk} maxHp={bossSpecLeveled(b, lvlB).hp}
                plusAtk={lvlB < BOSS_MAX_LEVEL ? Math.max(0, bossSpecLeveled(b, lvlB + 1).atk - bossSpecLeveled(b, lvlB).atk) : 0}
                plusHp={lvlB < BOSS_MAX_LEVEL ? Math.max(0, bossSpecLeveled(b, lvlB + 1).hp - bossSpecLeveled(b, lvlB).hp) : 0}
                werteAn={hpUnlocked(profile)} maxed={lvlB >= BOSS_MAX_LEVEL} en={en}
                tonStaerke={0.45}
                knopf={((profile.campaign?.bribedBosses || []).includes(b.id) || ownedBossSet.has(b.id)) && lvlB < BOSS_MAX_LEVEL
                  ? <VerbessernKnopf kann={(profile.sp || 0) >= bossUpgradeCost(lvlB + 1)} kosten={bossUpgradeCost(lvlB + 1)}
                      onClick={() => { klang("stufe"); dispatch({ type: "UPGRADE_BOSS", id: b.id }); }} t={t} />
                  : null} />;
            })()}
            {/* ── v1.26.7 (Besitzer): DIESELBE TRAININGSLEITER WIE BEI DEN FIGUREN.
                "Mach es wirklich so, dass es global der gleiche Designblock
                 ist." Kein eigener Raenge-Block mehr: das Monster ruft
                 dasselbe Bauteil Aufstiegsplan wie das Figurenblatt. Seine
                 Leiter traegt 1 bis 5 Faehigkeiten ueber die fuenf Stufen (v1.32.0),
                 und es lernt sie wie jede Figur - mit Skillpunkten. */}
            {(profile.campaign?.bribedBosses || []).includes(b.id) || ownedBossSet.has(b.id)
              ? <Aufstiegsplan schluessel={"X:" + b.id} kind={null}
                  rungs={(b.ladder || []).map((r) => ({ level: r.level, id: r.ability }))}
                  level={bossLevelOf(profile, b.id)} chosen={chosenAbilities(profile, "X:" + b.id)}
                  profile={profile} en={en} t={t} dispatch={dispatch} setFeier={null}
                  bild={img} />
              : null}
          </div>
        </div>
      </div>;
    })()}
    {detail && CHARACTERS[detail] && (
      <div onClick={() => setDetail(null)} style={{ position: "fixed", inset: 0, zIndex: 55, background: "rgba(4,6,10,.72)",
        display: "block", overflow: "hidden",
          /* v0.81 (Besitzer): OBEN VERANKERT statt zentriert. Eine zentrierte
             Karte waechst in BEIDE Richtungen - ist sie hoch, wandert ihr Kopf
             unter die Leiste. Jetzt beginnt jedes Popup auf DERSELBEN Hoehe,
             gleich wie gross sein Inhalt ist, und scrollt in sich. */
        }}>
        <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", left: "50%", transform: "translateX(-50%)",
          top: "calc(14px + var(--gg-popfrei-oben, 0px))",
          maxHeight: "calc(100dvh / var(--vhz, 1) - 30px - var(--gg-popfrei-oben, 0px) - var(--gg-popfrei-unten, 0px))",
          display: "flex", flexDirection: "column", width: "min(100vw - 20px, 440px)",
          borderRadius: 22, overflow: "hidden",
          // dasselbe Gewand wie die Monsterkarte: Riss-Kontur, violetter
          // Schein, halbdurchsichtiger dunkler Grund
          boxShadow: `0 18px 50px rgba(0,0,0,.6), 0 0 26px ${T.riftGlow}`,
          border: `1px solid ${T.riftLine}`,
          background: "radial-gradient(130% 110% at 50% -10%, rgba(124,58,237,.24) 0%, rgba(20,14,34,.97) 46%, rgba(8,5,14,.99) 100%)" }}>
          <button onClick={() => setDetail(null)} aria-label="close" style={{ position: "absolute", top: 9, right: 9, zIndex: 4,
            width: 30, height: 30, borderRadius: "50%", display: "grid", placeItems: "center", cursor: "pointer",
            background: "rgba(10,13,20,.72)", border: `1px solid ${T.riftLine}`, color: T.riftBright,
            fontFamily: "inherit", fontSize: 13, lineHeight: 1 }}>✕</button>
          <div className="gg-thinbar" style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto" }}>
            <CharCard char={CHARACTERS[detail]} profile={profile} dispatch={dispatch} t={t} en={en}
              onZoom={onZoom} open bigArt />
          </div>
        </div>
      </div>
    )}
  </div>;
}

export function ArmyScreen({ profile, dispatch, t, initialTab, account = null, initialGearInfo = null }) {
  const [zoomChar, setZoomChar] = useState(null);
  const [openChar, setOpenChar] = useState(null); // Figuren-Akkordeon: eine Karte offen
  const en = profile.lang === "en";
  const wide = useMedia("(min-width: 900px)");
  const [tab, setTab] = useState(initialTab || "tree"); // tree (der Hof) | formation | gear (der Haendler) | chron
  // Grand Gambit LEADS the roster — he is the piece the whole tale bends around.
  /* v1.0.50 (Besitzerentscheid): VOR DEM ERWACHEN GIBT ES IHN NICHT. Bis zu
     seinem Erwachen ist der Gambit ein blauer Bauer wie jeder andere - auf
     dem Brett (leveling.js setzt army.hero nur bei gambitWach) UND hier in
     der Figurenliste. Er taucht weder unter den eigenen noch unter den
     verborgenen auf; das Erwachen soll ein Auftritt sein, keine Fussnote,
     die man vorher schon nachlesen konnte. */
  const gambitDa = gambitWach(profile);
  const sichtbarErst = (c) => c.id !== "gambit" || gambitDa;
  const rec = CHARACTER_LIST.filter((c) => isUnlocked(c, profile) && sichtbarErst(c)).sort((a, b) => (b.epic ? 1 : 0) - (a.epic ? 1 : 0));
  const hid = CHARACTER_LIST.filter((c) => !isUnlocked(c, profile) && sichtbarErst(c));
  const H = ({ children }) => <div className="gg-serif" style={{ fontSize: 14, letterSpacing: ".14em",
    color: T.dim, margin: "6px 2px -4px", textTransform: "uppercase", gridColumn: wide ? "1 / -1" : undefined }}>{children}</div>;
  return <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 12, maxWidth: "100%", minWidth: 0, overflowX: "clip", paddingTop: 8 }}>
    <CharLightbox char={zoomChar} en={profile.lang === "en"} onClose={() => setZoomChar(null)} />
    {/* three rooms instead of one endless scroll */}
    {/* v0.72.2 (Besitzer): der HAENDLER ist ins LAGER umgezogen - im Hofstaat
        bleiben Hof und Aufstellung. */}
    <Segmented value={tab === "gear" ? "tree" : tab} onChange={setTab} options={[
      { value: "tree", label: t("army.tabTree"), icon: <FigurenIc /> },
      { value: "formation", label: t("army.tabFormation"), icon: <AufstellungIc /> },
    ]} />
    {/* v0.72.2: der Haendler-Zweig BLEIBT fuer Direktaufrufe (Blatt-Verweise
        aus Taten und Popups nutzen initialTab="gear") - er steht nur nicht
        mehr in der Tab-Leiste, denn sein Zuhause ist jetzt das Lager. */}
    {tab === "gear" && <GearPanel profile={profile} dispatch={dispatch} t={t} en={en} initialGearInfo={initialGearInfo} />}
    <AbzeichenDefs />
    {tab === "formation" && <FormationEditor profile={profile} dispatch={dispatch} t={t} en={en} />}
    {/* Die Chronik wohnt seit v0.51 in der AKADEMIE - ChroniclePanel bleibt hier nur exportiert. */}
    {tab === "tree" && <CodexTree profile={profile} dispatch={dispatch} t={t} en={en} onZoom={setZoomChar} account={account} />}
  </div>;
}


/* ── DIE AUFSTIEGSFEIER (v1.0.75, Besitzerwunsch) ──────────────────────────
 * "Ich moechte nicht nur beim Aufstieg eine kleine Story dazu haben - ich
 *  moechte auch, wenn eine Faehigkeit dazukommt, dass die gesondert erklaert
 *  wird, was die machen kann."
 *
 * Ein Fenster, zwei Anlaesse:
 *  - RANG: der Gambit wechselt seine Stufe (alle zehn Level). Es zeigt sein
 *    NEUES Gemaelde gross, den Stufennamen und die Zeile aus GAMBIT_STUFEN.
 *  - FAEHIGKEIT: eine Figur lernt etwas. Es zeigt das Zeichen der Faehigkeit,
 *    ihren Namen und - das war der Kern des Auftrags - ihre WIRKUNG im
 *    Klartext aus ABILITIES.descDe. Der Spieler soll nicht nachschlagen
 *    muessen, was er gerade gekauft hat.
 *
 * Der Strahlenkranz laeuft nur einmal und verglueht; ohne Animationen
 * (Schalter aus) erscheint das Fenster still, aber vollstaendig.
 */
export function AufstiegsFeier({ art, gambitTier = 1, bild = null, chName = "", ab = null, t, onClose, charId = null, kind = null, abId = null }) {
  const an = animAn();
  const stufe = GAMBIT_STUFEN[Math.max(0, Math.min(5, gambitTier - 1))];
  const rang = art === "rang";
  const ton = rang ? "233,207,138" : "196,181,253";
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 260, display: "grid",
      placeItems: "center", padding: 16, background: "rgba(6,7,12,.78)", backdropFilter: "blur(3px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: "100%", maxWidth: 330,
        borderRadius: 16, padding: "20px 18px 16px", textAlign: "center",
        background: "linear-gradient(170deg, rgba(34,30,52,.97), rgba(14,13,24,.99))",
        border: `1px solid rgba(${ton},.55)`,
        boxShadow: `0 18px 50px rgba(0,0,0,.6), 0 0 40px rgba(${ton},.16)`,
        ...(an ? { animation: "ggFeierKarte .5s cubic-bezier(.2,1.2,.35,1) both" } : null) }}>

        {an && <span aria-hidden style={{ position: "absolute", left: "50%", top: rang ? 96 : 74,
          width: 200, height: 200, marginLeft: -100, marginTop: -100, pointerEvents: "none",
          background: `conic-gradient(from 0deg, rgba(${ton},0) 0deg, rgba(${ton},.5) 22deg, rgba(${ton},0) 44deg, rgba(${ton},0) 90deg, rgba(${ton},.5) 112deg, rgba(${ton},0) 134deg, rgba(${ton},0) 180deg, rgba(${ton},.5) 202deg, rgba(${ton},0) 224deg, rgba(${ton},0) 270deg, rgba(${ton},.5) 292deg, rgba(${ton},0) 314deg)`,
          borderRadius: "50%", animation: "ggFeierKranz 1.5s ease-out both" }} />}

        <div style={{ position: "relative", fontSize: 10.5, letterSpacing: 1.6, fontWeight: 800,
          color: `rgba(${ton},.95)`, textTransform: "uppercase" }}>
          {rang ? t("rang.titel") : t("rang.faehigTitel")}
        </div>

        {rang ? <>
          {/* v1.0.79 (Besitzer: "das Bild ueberdeckt den Text, das geht
              nicht"): maxHeight allein hat das nicht gehalten - der Kasten
              hatte zwar 132 px, aber das Bild wuchs waehrend der Feier auf
              scale(1.12) und ragte damit unten heraus, mitten in Titel und
              Geschichte. Jetzt hat der Kasten eine FESTE Hoehe, schneidet ab
              (overflow: hidden), das Bild bekommt height 100% statt einer
              blossen Obergrenze, und die Vergroesserung wirkt vom FUSS aus
              (transformOrigin bottom) - sie waechst also nach oben in den
              freien Raum statt nach unten in den Text. Darunter ein fester
              Abstand, der nicht mehr unterschritten werden kann. */}
          <div style={{ position: "relative", height: 150, overflow: "hidden",
            display: "grid", placeItems: "end center", margin: "8px 0 14px" }}>
            {bild && <img src={bild} alt="" draggable={false} style={{ height: "100%", width: "auto",
              maxWidth: "72%", objectFit: "contain", objectPosition: "bottom", transformOrigin: "50% 100%",
              filter: `drop-shadow(0 4px 10px rgba(0,0,0,.6)) drop-shadow(0 0 16px rgba(${ton},.5))`,
              ...(an ? { animation: "ggFeierBild .8s cubic-bezier(.2,1.3,.4,1) .1s both" } : null) }} />}
          </div>
          <div className="gg-serif" style={{ fontSize: 21, fontWeight: 900, color: T.gold }}>{stufe.name}</div>
          <div style={{ fontSize: 11.5, color: T.dim, marginTop: 2, letterSpacing: .4 }}>
            {t("rang.stufe", { r: stufe.r })} · {t("rang.neuesAntlitz")}</div>
          <div className="gg-serif" style={{ fontSize: 13, lineHeight: 1.62, color: T.ink, fontStyle: "italic",
            margin: "11px 4px 4px" }}>{stufe.text}</div>
        </> : <>
          {/* v1.20.0 (Uebergabe, Punkt 4): DAS TALENT-FREISCHALTFENSTER wie das
              Bundfenster - FIGUR LINKS vor ihrer Kulisse, ZUGDIAGRAMM RECHTS
              (wo das Talent einen Zug hat; sonst sein Zeichen, gross). Jede
              freigeschaltete Faehigkeit stellt sich so vor. */}
          <div data-talentfenster={abId || ""} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, alignItems: "stretch", margin: "10px 0 4px" }}>
            <div style={{ position: "relative", height: 150, overflow: "hidden", borderRadius: 12, isolation: "isolate",
              display: "grid", placeItems: "end center", border: `1px solid rgba(${ton},.3)`, background: "rgba(10,7,19,.6)" }}>
              <KulisseHinterGrund name={kulisseFuer({ charId })} deckung={0.8} radius={12} />
              {bild && <img src={bild} alt="" draggable={false} style={{ height: "96%", width: "auto", maxWidth: "88%",
                objectFit: "contain", objectPosition: "bottom", transformOrigin: "50% 100%",
                filter: "drop-shadow(0 4px 10px rgba(0,0,0,.6))",
                ...(an ? { animation: "ggFeierBild .8s cubic-bezier(.2,1.3,.4,1) .1s both" } : null) }} />}
            </div>
            <div style={{ display: "grid", placeItems: "center", borderRadius: 12, padding: 6,
              border: `1px solid rgba(${ton},.3)`, background: "rgba(10,7,19,.6)" }}>
              {abId && ABILITY_MOVE[abId]
                ? <MoveDiagram kind={kind} moveSpec={null} extra={ABILITY_MOVE[abId]} breite={128} />
                : <div style={{ fontSize: 44, lineHeight: 1.1, color: `rgba(${ton},1)`, textShadow: `0 0 18px rgba(${ton},.7)`,
                    ...(an ? { animation: "ggFeierBild .8s cubic-bezier(.2,1.3,.4,1) .1s both" } : null) }}>{ab?.icon || "✦"}</div>}
            </div>
          </div>
          <div style={{ fontSize: 11, color: T.dim }}>{t("rang.faehigVon", { ch: chName })}</div>
          <div className="gg-serif" style={{ fontSize: 20, fontWeight: 900, color: "#dcd2ff", marginTop: 1 }}>
            {ab?.name || ""}</div>
          <div style={{ margin: "12px 2px 4px", padding: "11px 12px", borderRadius: 11, textAlign: "left",
            background: "rgba(76,54,140,.22)", border: "1px solid rgba(167,139,250,.35)" }}>
            <div style={{ fontSize: 9.5, letterSpacing: 1.1, fontWeight: 800, color: "rgba(196,181,253,.9)",
              textTransform: "uppercase", marginBottom: 4 }}>{t("rang.wirkung")}</div>
            <div style={{ fontSize: 13, lineHeight: 1.55, color: T.ink }}>{ab?.desc || ""}</div>
            {ab?.once != null && <div style={{ fontSize: 10.5, color: T.faint, marginTop: 6 }}>
              {ab.once ? t("rang.einmal") : t("rang.immer")}</div>}
          </div>
        </>}

        <button onClick={onClose} style={{ marginTop: 12, width: "100%", padding: "11px 0", borderRadius: 11,
          cursor: "pointer", fontFamily: "inherit", fontWeight: 800, fontSize: 14, color: "#17110a",
          border: "none", background: `linear-gradient(180deg, rgba(${ton},1), rgba(${ton},.72))` }}>
          {t("rang.weiter")}
        </button>
      </div>
    </div>
  );
}
