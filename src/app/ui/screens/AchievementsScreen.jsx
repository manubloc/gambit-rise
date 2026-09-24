// Achievements — a lean, modern trophy wall. Every entry gets a monochrome
// in-house icon in a medallion: earned tiers glow gold, untouched ones sit
// grayed and quiet. Progress is a single number and a thin bar — no clutter.
import kammerBild from "../assets/painted/painted-schatzkammer.webp";
import { paintedById, schlichtAn } from "../board/paintedArt.js";
import { klang } from "../klang.js";
import { useState } from "react";
import { SchatzIc, HaendlerIc } from "../RaumIcons.jsx";
import { GearPanel } from "./ArmyScreen.jsx";
import { Segmented } from "../primitives.jsx";
import { evaluate, claimedTiers, claimReward, claimableCount } from "../../../meta/index.js";
import { T, GOLD_CTA } from "../theme.js";
import { Panel, Bar, Chip } from "../primitives.jsx";
import { AchIcon, SkillStar, GoldCoin } from "../icons.jsx";
import { achArt } from "../assets/ach/index.js";
import { useMedia } from "../../App.jsx";

// MEASURED, then lifted: on the gilded plates T.faint came in at 2.9:1 against
// the card — under the 3.0 floor even for large text — and unstarted cards ran
// at 62% opacity on top of that, sinking it near 2:1. Nothing was readable.
// These two warm tones sit at 6.8:1 and 9.0:1 on the same plates, and cards
// now go quiet through COLOUR, not through fading their own text away.
const VELLUM = "#eadfc0";        // labels, tier rows, hints
const VELLUM_DIM = "#cec2a0";    // the faintest tier still legible

// Gold that reads as gold: gradient-filled serif numerals.
const goldText = {
  backgroundImage: "linear-gradient(168deg, #f8e6ab 8%, #d9b565 45%, #a17f3e 78%, #e9cf8a 100%)",
  WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
};
const cornerDiamond = (pos) => (
  <span style={{ position: "absolute", width: 7, height: 7, transform: "rotate(45deg)",
    background: "linear-gradient(135deg, #f0d68a, #8a6d35)", boxShadow: "0 0 6px #d9b56588", ...pos }} />
);

export function AchievementsScreen({ profile, dispatch, t, initialOpenId = null }) {
  // v0.72.2 (Besitzer): DAS LAGER - zwei Raeume unter einem Dach: die
  // Schatzkammer (Taten, Beutel) und der HAENDLER (ehemals Ausruestung im
  // Hofstaat).
  const [lagerTab, setLagerTab] = useState("schatz");
  const [openId, setOpenId] = useState(initialOpenId);
  // one counter per plate — a tap bumps it and replays the sweep of light
  const [sheenAt, setSheenAt] = useState({});
  const en = profile.lang === "en";
  const { items } = evaluate(profile.stats);
  const tiersDone = items.reduce((a, i) => a + i.done, 0);
  const tiersTotal = items.reduce((a, i) => a + i.total, 0);
  const claimable = claimableCount(profile);
  const wide = useMedia("(min-width: 900px)");

  if (lagerTab === "haendler") return <div style={{ display: "grid", gap: 10 }}>
    <Segmented value={lagerTab} onChange={setLagerTab} options={[
      { value: "schatz", label: t("lager.tabSchatz"), icon: <SchatzIc /> },
      { value: "haendler", label: t("lager.tabHaendler"), icon: <HaendlerIc /> },
    ]} />
    <GearPanel profile={profile} dispatch={dispatch} t={t} en={en} />
  </div>;
  return <div style={{ display: "grid", gap: 10, gridTemplateColumns: wide ? "1fr 1fr" : "1fr", alignItems: "start" }}>
    <div style={{ gridColumn: wide ? "1 / -1" : undefined }}>
      <Segmented value={lagerTab} onChange={setLagerTab} options={[
        { value: "schatz", label: t("lager.tabSchatz"), icon: <SchatzIc /> },
        { value: "haendler", label: t("lager.tabHaendler"), icon: <HaendlerIc /> },
      ]} />
    </div>
    {/* ── the vault: a gilded frame, a passing gleam, real coinage ── */}
    <div style={{ gridColumn: "1 / -1", position: "relative", borderRadius: T.radius, padding: 1.5,
      background: "linear-gradient(135deg, #6f5526, #f0d68a 28%, #8a6d35 52%, #e9cf8a 76%, #6f5526)",
      boxShadow: `${T.shadow}, 0 0 26px #d9b56522` }}>
      <div style={{ position: "relative", overflow: "hidden", borderRadius: T.radius - 2, textAlign: "center",
        padding: "13px 14px 11px",
        background: `radial-gradient(130% 100% at 50% 0%, #2b2410 0%, ${T.panel2} 46%, ${T.panel} 100%)` }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "42%", pointerEvents: "none",
          background: "linear-gradient(90deg, transparent, rgba(255,240,190,.09), transparent)",
          animation: `ggShine ${T.mo.sheen} linear 1.1s infinite` }} />
        {cornerDiamond({ top: 7, left: 7 })}{cornerDiamond({ top: 7, right: 7 })}
        {cornerDiamond({ bottom: 7, left: 7 })}{cornerDiamond({ bottom: 7, right: 7 })}
        {/* v1.0.92 (Besitzer: "oben das Bild nehmen und darunter deine
            Schatzkammer beschreiben - da muss schon ein Abstand zum Bild sein,
            sie klebt ja direkt drauf"): BILD ZUERST, dann der Titel mit Luft.
            Vorher stand der Titel darueber und das Bild schob sich von unten
            an ihn heran. */}
        {/* v1.0.91 (Besitzerwunsch): DIE KAMMER HAT EIN GESICHT - wie Corvo
            beim Kraemer. Gewoelbe aus Quadern, offene Truhe, zwei Kerzen, auf
            demselben runden Steinsockel wie der Kraemerstand. */}
        <div style={{ display: "grid", placeItems: "center", marginTop: 2, marginBottom: 14 }}>
          <img src={kammerBild} alt="" draggable={false} decoding="async"
            style={{ width: "min(58%, 208px)", height: "auto", display: "block",
              filter: "drop-shadow(0 3px 8px rgba(0,0,0,.55)) drop-shadow(0 0 16px rgba(233,207,138,.16))" }} />
        </div>
        <div className="gg-serif" style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: ".3em",
          ...goldText, filter: "drop-shadow(0 1px 1px rgba(0,0,0,.5))" }}>{t("ach.wallet")}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "7px 12%" }}>
          <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #8a6d35)" }} />
          <span style={{ width: 5, height: 5, background: "#d9b565", transform: "rotate(45deg)" }} />
          <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, #8a6d35, transparent)" }} />
        </div>
        {/* v1.0.94 (Besitzer): der Skillpunkt traegt seine Zahl in LILA, wie
            oben in der Kopfleiste - nicht in Gold. Beide Zahlen GLEICH GROSS
            (vorher 34 gegen 29), und mehr Luft zwischen Zeichen und Zahl. */}
        <div style={{ display: "flex", justifyContent: "center", gap: 26, alignItems: "center", margin: "2px 0 8px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 13 }}>
            <SkillStar size={30} />
            <span className="gg-serif" style={{ fontSize: 31, fontWeight: 450, letterSpacing: ".02em", lineHeight: 1,
              color: "#c4b5fd", textShadow: "0 0 10px rgba(167,139,250,.45), 0 1px 1px rgba(0,0,0,.6)" }}>{profile.sp || 0}</span>
          </span>
          <span style={{ width: 1, height: 34, background: "#8a6d3566" }} />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 13 }}>
            <GoldCoin size={28} />
            <span className="gg-serif" style={{ fontSize: 31, fontWeight: 450, letterSpacing: ".02em", lineHeight: 1, ...goldText }}>{profile.gold || 0}</span>
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
          {/* v1.0.91 (Besitzer: "dass das tatsaechlich unten dran einfach dann
              ist, ohne in einem Button zu sein"): der Stand der Taten steht
              als Zeile da, nicht als Plakette. Nur das, was man EINLOESEN
              kann, bleibt ein Chip - das ist ein Knopf-Versprechen. */}
          <span style={{ fontSize: 12, color: T.dim, letterSpacing: ".02em" }}>
            {tiersDone} / {tiersTotal} {t("ach.tiers")}</span>
          {/* v1.59.0 (Besitzer: "wenn ich oben auf Einfordern druecke, dass ich
              zum ersten, was von der Hoehe her kommt, runterspringe") */}
          {claimable > 0 && <button onClick={() => { const k = document.querySelector("[data-einfordern]");
              if (k) k.scrollIntoView({ behavior: "smooth", block: "center" }); }}
            style={{ border: "none", background: "none", padding: 0, cursor: "pointer", fontFamily: "inherit" }}>
            <Chip color={"#17110a"} bg={T.gold}>{t("ach.claimable", { n: claimable })} ↓</Chip></button>}
        </div>
        {/* v0.52: Skillpunkt-Erklaerung raus - das lehrt der Herald/die Akademie. */}
      </div>
    </div>

    {/* v1.0.91 (Besitzer: "statt alle untereinander, weil das dann viel zu
        scrollen ist, doch nebeneinander - zwei pro Reihe, das Medaillon und
        darunter zentriert kurz, was es ist und was der naechste Schritt
        bringt"): ZWEI SPALTEN. Eine geoeffnete Kachel nimmt wieder die ganze
        Breite, damit die Zahlen darin Platz haben. */}
    {/* v1.59.0 (Besitzer: "die Kachel sollte nicht irgendwo aufhoeren und
        dann einen Leerraum bilden"): die Kacheln einer Zeile strecken sich auf
        die gleiche Hoehe - auch neben einer Kachel mit Einfordern-Knopf. */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, alignItems: "stretch" }}>
    {items.map((it) => {
      const done = it.nextN === null;
      const pct = done ? 1 : Math.min(1, it.val / it.nextN);
      const isOpen = openId === it.id;
      // is there a purse waiting on this one? that plate gets the full treatment
      const ready = claimedTiers(profile, it.id) < it.done;
      return (
        <Panel key={it.id} onClick={() => { klang("menue"); /* v1.0.11: Schatzkammer-Kachel klingt - der Klangfaenger hoert keine div-onClicks */ setSheenAt((m) => ({ ...m, [it.id]: (m[it.id] || 0) + 1 })); setOpenId(isOpen ? null : it.id); }}
          style={{ display: "flex", gap: 13, cursor: "pointer", position: "relative",
          /* v1.0.91: geoeffnet nimmt die Kachel beide Spalten - die Stufenliste
             mit ihren Zahlen braucht die Breite. */
          gridColumn: isOpen ? "1 / -1" : "auto", minWidth: 0,
          // OPENED, THE EMBLEM TAKES THE STAGE: the plate turns into a column,
          // the medallion rises to the top at nearly twice its size, its ring
          // of light turns, and sparks leave the brightest point sideways.
          /* v1.0.91: auch GESCHLOSSEN eine Saeule - im Zweispalter ist keine
             Breite fuer Medaillon neben Text. Medaillon oben, darunter
             zentriert der Name und der naechste Schritt. */
          flexDirection: "column", alignItems: "center", textAlign: "center", padding: isOpen ? 16 : "13px 9px",
          alignItems: isOpen ? "stretch" : "center",
          // EVERY PLATE IS LIT. Dimming the untouched ones made half the
          // treasury look switched off; the medallion and the bar already say
          // what is earned. And the rim is EVEN now: the old look carried a
          // 3px gold bar down the left edge only, which read as a lopsided
          // frame rather than a rim of gold.
          // DS1 §15: der REWARD-RAHMEN gehoert der wartenden Belohnung. Vorher
          // trugen ALLE 14 Platten Goldschein (gemessen) - Wert ohne Anlass.
          // Geschlossene Platten: ruhige Kante, normaler Schatten, weniger
          // Polster (Kartenhoehe 90 -> 84 px, mehr Ruhmestaten im Blick).
          padding: ready ? 17 : 13,
          /* v1.1.4: die Kachel ist der Bezug fuer die Belohnung in ihrer Ecke. */
          position: "relative",
          background: "linear-gradient(160deg, rgba(96,74,34,.62), rgba(28,21,11,.95) 62%)",
          border: `1.5px solid ${ready ? "rgba(240,214,138,.8)" : "rgba(214,176,96,.34)"}`,
          boxShadow: ready
            ? "0 0 26px rgba(240,214,138,.32), " + T.shadow
            : T.shadow }}>
          {/* THE GLEAM NOW MOVES: it used to be a fixed band painted across the
              plate. Tapping a plate sends it sweeping once, left to right —
              gold catching the light as the card turns. The key on the wrapper
              restarts the run on every tap, open or closed. */}
          <span key={`sheen-${it.id}-${sheenAt[it.id] || 0}`} aria-hidden style={{ position: "absolute", inset: 0,
            borderRadius: "inherit", pointerEvents: "none", overflow: "hidden" }}>
            <span style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "62%",
              background: "linear-gradient(115deg, transparent 6%, rgba(255,247,214,.34) 42%, rgba(255,247,214,.10) 58%, transparent 92%)",
              animation: sheenAt[it.id] ? "ggPlateSheen .72s cubic-bezier(.3,.7,.4,1) both" : "none",
              transform: sheenAt[it.id] ? undefined : "translateX(-120%)" }} />
          </span>
          {/* THE STRUCK MEDALLION: each achievement now wears its own painted
              emblem, already cast as a round plate in the treasury's warm dark
              — so it seats itself in the gold rim with no seam and no cut-out
              work at runtime. The drawn icon still stands in for anything that
              has no painting yet. */}
          <div style={{ position: "relative", flex: "none", alignSelf: isOpen ? "center" : "auto",
            width: isOpen ? 104 : 56, height: isOpen ? 104 : 56, margin: isOpen ? "2px 0 10px" : 0,
            animation: isOpen ? "ggMedalRise .34s cubic-bezier(.2,.9,.3,1) both" : "none" }}>
          {isOpen && <>
            {/* the ring of light, turning */}
            <span aria-hidden style={{ position: "absolute", inset: -9, borderRadius: "50%", pointerEvents: "none",
              background: "conic-gradient(from 0deg, rgba(255,246,214,0) 0deg, rgba(255,246,214,.85) 38deg, rgba(240,214,138,.25) 96deg, rgba(255,246,214,0) 190deg, rgba(255,246,214,0) 360deg)",
              filter: "blur(2.5px)", animation: "ggRingSpin 5.5s linear infinite" }} />
            {/* sparks off the brightest point, each on its own tangent */}
            {[0, 1, 2, 3, 4].map((n) => (
              <span key={n} aria-hidden style={{ position: "absolute", left: "50%", top: "50%",
                width: 3.5, height: 3.5, marginLeft: -1.75, marginTop: -1.75, borderRadius: "50%",
                background: "radial-gradient(circle, #fffdf2, #f0d68a 60%, rgba(240,214,138,0))",
                boxShadow: "0 0 6px rgba(255,244,200,.9)", pointerEvents: "none",
                "--a": `${34 + n * 7}deg`, "--r": "56px",
                animation: `ggSpark ${1.5 + n * 0.24}s ease-out ${n * 0.32}s infinite` }} />
            ))}
          </>}
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", display: "grid", placeItems: "center",
            overflow: "hidden",
            // THE EMBLEM IS SHOWN AS PAINTED. It used to be greyed and darkened
            // until the achievement was under way, which read as "the picture
            // is half transparent" — you could not make out what it showed. The
            // painting now stands at full strength on every plate; what is
            // earned is told by the bar, the diamonds and the tally.
            background: "radial-gradient(circle at 32% 28%, rgba(240,214,138,.5), rgba(36,28,14,.96) 70%)",
            border: isOpen ? "2.5px solid #e9cf8a" : "2px solid #d9b565",
            boxShadow: isOpen
              ? "0 0 30px rgba(255,240,190,.6), 0 2px 6px rgba(0,0,0,.6), inset 0 1px 2px rgba(255,252,236,.3)"
              : "0 0 14px rgba(240,214,138,.45), 0 1px 3px rgba(0,0,0,.55), inset 0 1px 1px rgba(255,250,228,.25)" }}>
            {achArt(it.id)
              ? <img src={achArt(it.id)} alt="" draggable={false} decoding="async"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block",
                    // the paintings came out of the forge a shade dim for a
                    // treasury: lifted, warmed and given a touch more gold
                    filter: isOpen
                      ? "brightness(1.58) saturate(1.3) contrast(1.1) sepia(.14)"
                      : "brightness(1.38) saturate(1.22) contrast(1.06) sepia(.1)" }} />
              : <AchIcon id={it.id} color={isOpen ? "#fff6d8" : "#f6e4a2"} size={isOpen ? 52 : 28} />}
            {/* NO GLAZE ANY MORE. The gold wash and the corner light that used
                to ride ON TOP of the painting read as a milky film — the
                emblems looked veiled. The paintings now stand bare and clear;
                brightness lives in the image filter alone. */}
          </div>
          </div>
          <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
            {/* v1.0.91: geschlossen stehen Name und Stufenrauten UNTEREINANDER
                und zentriert - nebeneinander bliebe im Zweispalter nichts
                lesbar. Geoeffnet wie gehabt in einer Zeile. */}
            <div style={{ display: "flex", flexDirection: isOpen ? "row" : "column", alignItems: "center",
              justifyContent: isOpen ? "space-between" : "center", gap: isOpen ? 8 : 5 }}>
              <span className="gg-serif" style={{ fontSize: 15.5, letterSpacing: ".03em",
                color: "#fdf6e2", textShadow: "0 1px 2px rgba(0,0,0,.6)" }}>
                {en ? it.nameEn : it.nameDe}
              </span>
              <span style={{ display: "flex", gap: 3 }}>
                {Array.from({ length: it.total }).map((_, i) => {
                  const cl = claimedTiers(profile, it.id);
                  const state = i < cl ? "claimed" : i < it.done ? "ready" : "locked";
                  return <span key={i} style={{ width: 7, height: 7, transform: "rotate(45deg)", borderRadius: 1.5,
                    background: state === "claimed" ? "linear-gradient(160deg, #f6e4a2, #d9b565 70%)" : state === "ready" ? T.lime : "rgba(30,24,13,.9)",
                    border: state === "locked" ? "1px solid rgba(180,150,90,.3)" : "none",
                    boxShadow: state === "claimed" ? "0 0 6px rgba(240,214,138,.75)" : state === "ready" ? `0 0 6px ${T.lime}aa` : "inset 0 1px 1px rgba(0,0,0,.5)",
                    animation: state === "ready" ? "herePulse 1.6s ease-in-out infinite" : "none" }} />;
                })}
              </span>
            </div>
            {isOpen && <div style={{ fontSize: 12, color: VELLUM, lineHeight: 1.55, margin: "4px 0 3px" }}>
              {(en ? it.descEn : it.descDe) || null}
              {/* the LEDGER of the goal: every tier, its target and its purse —
                  the character-card accordion, brought to the treasury */}
              <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
                <div className="gg-serif" style={{ letterSpacing: ".22em", fontSize: 10.5, ...goldText, filter: "drop-shadow(0 1px 1px rgba(0,0,0,.5))" }}>{en ? "HOW TO EARN IT" : "SO ERREICHST DU ES"}</div>
                {(it.tiers || []).map((tr, i) => {
                  const cl = claimedTiers(profile, it.id);
                  const st = i < cl ? "✓" : i < it.done ? "◆" : "·";
                  const r = claimReward(it, i);
                  return <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8,
                    color: i < it.done ? "#f6ecd2" : VELLUM }}>
                    {/* v1.0.91 (Besitzer: "die kleinen Mini-Icons wie auch die
                        Zahlen koennen ein bisschen groesser werden, das kann man
                        fast nicht lesen"): 10 -> 15 px Zeichen, die Zahlen fett
                        und eine Stufe groesser. */}
                    <span style={{ fontSize: 13 }}>{st} {en ? "Tier" : "Stufe"} {i + 1}: {tr.n} ×</span>
                    <span style={{ whiteSpace: "nowrap", fontSize: 14, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <SkillStar size={15} /> {r.sp} <span style={{ opacity: .62 }}>·</span> <GoldCoin size={15} /> {r.gold}</span>
                  </div>;
                })}
              </div>
            </div>}
            {/* v1.1.4 (Besitzer: "man muss auf jeden Fall sehen, pro Kachel, was
                man jetzt gewinnen kann - das kannst du rechts oben auf die
                Kachel packen, untereinander: Gold zuerst, dann Skillpunkte"):
                DIE NAECHSTE BELOHNUNG STEHT IN DER ECKE. Sie war nur in der
                geoeffneten Kachel zu sehen; geschlossen wusste man nicht,
                wofuer man sammelt. Gold oben, Skillpunkt darunter, beide klein
                und in ihrer eigenen Farbe (Gold golden, Skillpunkt lila wie in
                der Kopfleiste). Bei fertiger Tat steht dort nichts mehr. */}
            {!done && (() => {
              const r = claimReward(it, claimedTiers(profile, it.id));
              if (!r || (!r.gold && !r.sp)) return null;
              return <div style={{ position: "absolute", top: 9, right: 10, display: "flex", flexDirection: "column",
                alignItems: "flex-end", gap: 3, pointerEvents: "none" }}>
                {!!r.gold && <span style={{ display: "inline-flex", alignItems: "center", gap: 3,
                  fontSize: 11, fontWeight: 800, color: "#f0d68a" }}><GoldCoin size={11} />{r.gold}</span>}
                {!!r.sp && <span style={{ display: "inline-flex", alignItems: "center", gap: 3,
                  fontSize: 11, fontWeight: 800, color: "#c4b5fd" }}><SkillStar size={11} />{r.sp}</span>}
              </div>;
            })()}
            <div style={{ margin: "6px 0 4px", height: 7, borderRadius: 999, position: "relative",
              background: "rgba(12,9,5,.85)", boxShadow: "inset 0 1px 2px rgba(0,0,0,.7), inset 0 -1px 0 rgba(255,240,190,.06)" }}>
              <div style={{ position: "absolute", inset: 0, width: `${pct * 100}%`, borderRadius: 999,
                background: done
                  ? "linear-gradient(90deg, #b8944e, #f6e4a2 55%, #e0bd72)"
                  : "linear-gradient(90deg, #8a6d35, #f0d68a 60%, #d9b565)",
                boxShadow: "0 0 9px rgba(217,181,101,.55)" }} />
            </div>
            {/* WHEN A PURSE IS WAITING the row breaks apart: the tally keeps its
                line and the claim drops beneath it, full width and a size up,
                with real air above so it never crowds the text. */}
            <div style={{ fontSize: 11.5, color: VELLUM, display: "flex", gap: 8,
              flexDirection: ready ? "column" : "row", alignItems: ready ? "stretch" : "center",
              justifyContent: ready ? "flex-start" : "space-between" }}>
              {/* v1.1.4 (Besitzer: "unten entsprechend ein Fortschrittsbalken,
                  wo auch in klein dransteht, was halt fehlt fuer den naechsten
                  Schritt"): DIE RESTANGABE. Vorher stand dort nur der Zaehler
                  (3 / 5); jetzt sagt eine kleine Zeile, was noch fehlt - das
                  ist die Auskunft, die man beim Sammeln braucht. */}
              <span style={{ display: "inline-flex", flexDirection: "column", gap: 1 }}>
                <span style={{ color: "#f4e3ab", fontWeight: 800 }}>{done ? <span style={{ color: "#f6e4a2", textShadow: "0 0 6px rgba(240,214,138,.5)" }}>✓ {t("ach.done")}</span> : `${it.val} / ${it.nextN}`}</span>
                {!done && it.nextN > it.val && (
                  <span style={{ fontSize: 9.5, color: "#a99a72", fontStyle: "italic" }}>
                    {en ? `${it.nextN - it.val} more to go` : `noch ${it.nextN - it.val} bis zur nächsten Stufe`}</span>
                )}
              </span>
              {(() => {
                const cl = claimedTiers(profile, it.id);
                if (cl >= it.done) return null;
                const r = claimReward(it, cl);
                /* v1.59.0 (Besitzer: "Einfordern steht viel zu knapp am Button -
                   gleichmaessiger Abstand nach oben wie nach links; den Button
                   weniger hoch"): flacher, eine Spur kleinere Schrift, gleicher
                   Rand ringsum, und die goldene Laufkontur. */
                return <button className="gg-goldlauf" data-einfordern="1"
                  onClick={(e) => { e.stopPropagation(); dispatch({ type: "CLAIM_ACH", id: it.id }); }}
                  aria-label={`${t("ach.claim")}: ${r.sp} SP, ${r.gold} Gold`}
                  style={{ fontFamily: "inherit", fontWeight: 900, fontSize: 14, borderRadius: 999, padding: "8px 12px",
                    marginTop: 9, width: "100%", lineHeight: 1.1,
                    border: "1px solid rgba(255,240,200,.5)", background: GOLD_CTA, color: "#17110a", cursor: "pointer",
                    boxShadow: `0 0 14px ${T.gold}77`, whiteSpace: "nowrap",
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                  {/* v1.60.0: GEMESSEN auf 400 px - "Einfordern · Stern 1 Krone 5"
                      passte nicht in die halbe Kachel, das E wurde angeschnitten.
                      Die Belohnung steht bereits oben rechts in jeder Kachel;
                      der Knopf sagt nur noch, was er tut. */}
                  {t("ach.claim")}
                </button>;
              })()}
            </div>
          </div>
        </Panel>
      );
    })}
    </div>
  </div>;
}
