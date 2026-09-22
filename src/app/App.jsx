import { useEffect, useReducer, useRef, useState } from "react";
import { klang, klangEinstellen, klangVorwaermen, klangUeberall } from "./ui/klang.js";
import { lautVon } from "./ui/lautstaerke.js";   /* v1.26.2 */
import { musikBereich } from "./ui/musik.js";
import { setSchlicht } from "./ui/board/paintedArt.js";
import { upgradeAbility, characterLevel, maxLevelFor, formationKey, loadProfile, saveProfile, defaultProfile, buildStageMatch, advanceCampaign, upgradePiece, buySpShard, clearedCount, campaignLength, currentNodeId , unlockAbility, respecPiece, claimAchievement, payToll, takeRestorePoint, serializeSave, isUnlocked } from "../meta/index.js";
import { nodeById, chapterForRow, buyItem, CHARACTER_LIST, clockFor } from "../content/index.js";
import { verifyPin } from "../platform/index.js";
import { makeT } from "./i18n/strings.js";
import { SERVER_URL } from "./config.js";
import { claimableCount, retinueScore, upgradeBoss, listSaves, createSave, loadSave, migrateLegacyInto } from "../meta/index.js";
import { mitAktivemDeck, mitDeckName, mitAufstellung } from "../meta/index.js";   /* v1.15.0: Decks */
import { naechsteErklaerung, merkschluessel } from "../meta/index.js";
import { setLivery, fetchHouseDesign, crestArt, emblemArt, logoMenuArt } from "./ui/livery.js";
import { Soundtrack } from "./ui/Soundtrack.jsx";
import { AchievementsScreen } from "./ui/screens/AchievementsScreen.jsx";
import { APP_DESIGN } from "./config.js";
import { CoinIc, SkillIc, CrestIc, GoldHeartIc, MapPinIc, LockIc } from "./ui/icons.jsx";
import { JewelIc } from "./ui/board/PieceGlyph.jsx";
import { T, GOLD_CTA } from "./ui/theme.js";
import { useShineDelay, GoldShineButton } from "./ui/Gilded.jsx";
import { rollTag } from "./ui/namen.js";
import { Wordmark } from "./ui/Brand.jsx";
import { LoginScreen } from "./ui/screens/LoginScreen.jsx";
import { GalerieScreen } from "./ui/screens/GalerieScreen.jsx";
import { currentAccount, clearSession, signOutCloud, resumeCloudSession, writeSave, recordStage } from "../meta/index.js";
import { OnlineScreen, buildStats } from "./ui/screens/OnlineScreen.jsx";
import { createNet } from "../platform/net.web.js";
import { NavIcon, HeartIc, SkillStar, MapIc } from "./ui/icons.jsx";
import { Bar, Panel, Button, Chip } from "./ui/primitives.jsx";
import { GameScreen, QuickSetup } from "./ui/screens/GameScreen.jsx";
import { ArmyScreen } from "./ui/screens/ArmyScreen.jsx";
import { CampaignScreen } from "./ui/screens/CampaignScreen.jsx";
import { MysticBackground } from "./ui/MysticBackground.jsx";
import { BundErwacht } from "./ui/BundErwacht.jsx";
import { BUND_LISTE } from "../content/buende.js";
import { animAn } from "./ui/anim.js";   // v1.1.4: der Muenzregen fragt, ob Bewegung erlaubt ist
import { RissBoden } from "./ui/RissBoden.jsx";
import { BrettHintergrund } from "./ui/BrettHintergrund.jsx";
import { setSparmodus } from "./ui/sparmodus.js";
import { setGegnerStil } from "./ui/gegnerstil.js";
import { MENUE_LEHREN } from "../content/lehren.js";
import { SchaukammerScreen } from "./ui/SchaukammerScreen.jsx";
import { AnimKammerScreen } from "./ui/AnimKammerScreen.jsx";
import { WerkzeugTuer } from "./ui/WerkzeugTuer.jsx";
import { torOffen } from "./ui/torschloss.js";
import { KlangWerkstattScreen } from "./ui/KlangWerkstattScreen.jsx";
import { SpielerbuchScreen } from "./ui/SpielerbuchScreen.jsx";
import { AdminPortal } from "./ui/AdminPortal.jsx";
import karteKampagne from "./ui/assets/karten/karte-kampagne.webp";
import karteSchnell from "./ui/assets/karten/karte-schnell.webp";
import karteOnline from "./ui/assets/karten/karte-online.webp";
import karteAkademie from "./ui/assets/karten/karte-akademie.webp";
import { AkademieScreen } from "./ui/screens/AkademieScreen.jsx";

// DIE GEMALTEN WAPPEN DER DREI WEGE. Kein Vektor-Siegel - der Besitzer will
// die gemalten Bilder, und zwar in der Fassung der jeweiligen Livree: crestArt
// folgt der Livree, liefert also im geschnitzten Haus die geschnitzten Wappen.
const CrestArt = ({ src }) => (
  <img src={src} alt="" aria-hidden decoding="async" style={{ width: 72, height: 84, objectFit: "contain",
    filter: "drop-shadow(0 4px 9px rgba(0,0,0,.55))" }} />
);


import { ProfileScreen } from "./ui/screens/ProfileScreen.jsx";


// viewport hook for the responsive shell (mobile dock ↔ desktop rail)
export function useMedia(q) {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const fn = () => setM(mq.matches);
    mq.addEventListener ? mq.addEventListener("change", fn) : mq.addListener(fn);
    return () => (mq.removeEventListener ? mq.removeEventListener("change", fn) : mq.removeListener(fn));
  }, [q]);
  return m;
}

/** Sub-view header: a bold, unmissable back pill + serif title. */
export function SubHeader({ title, onBack, t }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "2px 0 14px" }}>
      <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer",
        background: T.panel, border: `1.5px solid ${T.gold}88`, color: T.gold, borderRadius: 999,
        padding: "9px 16px 9px 12px", fontFamily: "inherit", fontWeight: 800, fontSize: 14, boxShadow: T.shadow }}>
        <span style={{ fontSize: 17, lineHeight: 1 }}>‹</span> {t("common.back")}
      </button>
      <div className="gg-serif" style={{ fontSize: 21, letterSpacing: ".05em", color: T.text }}>{title}</div>
    </div>
  );
}

function reducer(state, a) {
  switch (a.type) {
    case "HYDRATE": return a.profile;
    case "SET_NAME": return { ...state, name: a.name };
    case "SET_LANG": return { ...state, lang: a.lang };
    case "SET_SOUND": return { ...state, sound: a.on };
    case "SET_PIN": return { ...state, pin: a.pin };
    case "SET_DIFFICULTY": return { ...state, difficulty: a.difficulty };
    case "SET_PIECE_STYLE": return { ...state, pieceStyle: a.style };
    case "SET_CAMP_DIFFICULTY": return { ...state, campDifficulty: a.difficulty };
    case "SET_CLASSIC_ELO": return { ...state, classicElo: a.elo };
    case "SET_HERO_COL": return { ...state, loadout: { ...state.loadout, heroCols: { ...(state.loadout.heroCols || {}), [a.mapId]: a.col } } };
    case "SET_SPAR": return { ...state, spar: { ...(state.spar || {}), [a.posten]: !!a.an } };   /* v1.0.37 */
    case "SET_GEGNERSTIL": return { ...state, gegnerStil: a.stil };   /* v1.0.50: die Sicht auf den Gegner */
    /* v1.15.0: Speichern schreibt ins AKTIVE Fach und spiegelt es nach
       formations[key] - der alte Leseweg bleibt fuer alle gueltig. */
    case "SET_FORMATION": return mitAufstellung(state, formationKey(a.mapId, a.rules), a.formation);
    case "DECK_WAEHLEN": return mitAktivemDeck(state, formationKey(a.mapId, a.rules), a.index);
    case "DECK_UMBENENNEN": return mitDeckName(state, formationKey(a.mapId, a.rules), a.index, a.name);
    case "CAMPAIGN_CLEAR": return advanceCampaign(state, a.id);
    case "RECORD_STAGE": return recordStage(state, a);
    case "UPGRADE_PIECE": return upgradePiece(state, a.id);
    case "UPGRADE_BOSS": return upgradeBoss(state, a.id);
    case "BUY_SP_SHARD": return buySpShard(state);
    case "UNLOCK_ABILITY": return unlockAbility(state, a.id, a.ability);
    case "UPGRADE_ABILITY": return upgradeAbility(state, a.id, a.ability);   /* v1.28.0 */
    case "RESPEC": return respecPiece(state, a.id);
    case "CLAIM_ACH": return claimAchievement(state, a.id);
    case "PAY_TOLL": return payToll(state, a.id);
    case "BUY_ITEM": return buyItem(state, a.id);
    case "BUY_POTION": return buyItem(state, "potion");
    case "GIFT_GOLD": return { ...state, gold: (state.gold || 0) + (a.n || 0) };
    case "SET_NOTICE": return { ...state, notices: { ...(state.notices || {}), [a.key]: true } };
    case "SET_ONLINE": return { ...state, online: { ...state.online, ...a.online } };
    case "PAUSE_MATCH": return { ...state, pausedMatch: a.data || null };
    case "SET_PIECE_ART": return { ...state, pieceArt: a.style };
    case "REPLACE": if (state) takeRestorePoint(state, { force: true });
      // eslint-disable-next-line no-fallthrough
 return a.profile;
    case "RESET": return { ...defaultProfile(), name: state.name, lang: state.lang };
    default: return state;
  }
}


// Asked when the menu is used mid-fight. It names the price honestly: a
// campaign fight survives the switch, a quick or online game does not.
export function LeaveMatchAsk({ t, resumable, onLeave, onStay }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 40, display: "grid", placeItems: "center",
      background: "rgba(8,10,14,.78)", backdropFilter: "blur(3px)", padding: "16px 10px" }}>
      <div style={{ background: `radial-gradient(125% 135% at 50% -10%, ${T.panel2} 0%, ${T.panel} 52%, ${T.bg2} 100%)`, border: `1px solid ${T.line}`,
        borderRadius: 18, boxShadow: T.shadow, padding: "18px 18px 15px", maxWidth: 340, width: "100%" }}>
        <div className="gg-serif" style={{ fontSize: 18, color: T.goldBright, textAlign: "center" }}>{t("leave.title")}</div>
        <div style={{ fontSize: 13, color: T.dim, lineHeight: 1.55, margin: "10px 2px 14px", textAlign: "center" }}>
          {resumable ? t("leave.pause") : t("leave.quit")}
        </div>
        <button onClick={onLeave} style={{ width: "100%", fontFamily: "inherit", fontWeight: 900, fontSize: 14,
          borderRadius: 999, padding: "12px 16px", border: "1px solid rgba(255,240,200,.5)", cursor: "pointer", color: "#17110a",
          background: resumable ? "linear-gradient(160deg, #f0d68a, #d9b565 55%, #b08c44)" : `linear-gradient(160deg, ${T.danger}, #a3313f)`,
          boxShadow: "0 0 14px rgba(217,181,101,.4)" }}>
          {resumable ? t("leave.pauseGo") : t("leave.quitGo")}
        </button>
        <button onClick={onStay} style={{ width: "100%", marginTop: 8, fontFamily: "inherit", fontWeight: 700,
          fontSize: 12.5, borderRadius: 999, padding: "9px 14px", border: `1px solid ${T.line}`,
          background: "transparent", color: T.dim, cursor: "pointer" }}>{t("leave.stay")}</button>
      </div>
    </div>
  );
}

const TABS = [
  { id: "play", key: "nav.play" },
  { id: "army", key: "nav.army" },
  { id: "ach", key: "nav.ach" },
  { id: "profile", key: "nav.profile" },
];

export default function App() {
  const galerie = typeof location !== "undefined" && new URLSearchParams(location.search).has("galerie");
  /* v1.0.39 (Besitzer): DIE WERKZEUGE SIND VERSCHLOSSEN. Schaukammer,
     Klangwerkstatt und Spielerbuch hingen allein an einem Adressanhaengsel -
     wer "?werkstatt" kannte, war drin. Jetzt fragt eine Tuer nach dem Wort
     des Hauses; einmal geoeffnet, bleibt sie es fuer diese Sitzung. */
  const [torAuf, setTorAuf] = useState(() => torOffen());
  const werkstatt = typeof location !== "undefined" && new URLSearchParams(location.search).has("werkstatt");
  const klangwerkstatt = typeof location !== "undefined" && new URLSearchParams(location.search).has("klangwerkstatt");
  const adminPortal = typeof location !== "undefined" && new URLSearchParams(location.search).has("admin");
  const [profile, dispatch] = useReducer(reducer, null);
  // which livery the house wears — asked from the Hall once per boot
  const [houseDesign, setHouseDesign] = useState(null);
  useEffect(() => { fetchHouseDesign().then((d) => { if (d) setHouseDesign(d); }); }, []);
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [tab, setTab] = useState("play");
  const [view, setView] = useState("hub"); // play tab: hub | quick | camp | online
  /* ── JEDER RAUM BEGINNT OBEN (v1.0.53, Besitzerbefund) ────────────────────
     "Manchmal ist das Menue Spielen runtergescrollt." Der Grund: der Browser
     behaelt die Scroll-Position des DOKUMENTS, wenn nur der Inhalt darin
     ausgetauscht wird. Wer im Hofstaat weit unten stand und dann auf Spielen
     wechselte, landete dort ebenso weit unten - im Leeren, weil der neue
     Raum kuerzer ist.
     Bei jedem Wechsel von Reiter ODER Ansicht springt das Fenster zurueck
     nach oben. Ohne weiches Gleiten: das ist kein Weg, den jemand
     zuruecklegen will, sondern der Anfang eines neuen Raums. */
  useEffect(() => {
    /* v1.0.59: window.scrollTo liess die CI rot werden - JSDOM implementiert
       es nicht und meldet das als Konsolenfehler, den KEIN try/catch faengt
       (es wird nichts geworfen, nur geloggt). Die Zuweisung an scrollTop
       tut im Browser dasselbe und ist in JSDOM ein stilles No-op. */
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [tab, view]);
  const [match, setMatch] = useState(null);
  const [pvp, setPvp] = useState(null);
  const [quick, setQuick] = useState(null);   // running quick match (config decided in QuickSetup)
  const startQuickNow = () => {
    const cfg = lastQuick.current || { mapId: "classic", mode: "chess", difficulty: profile?.difficulty || "easy",
      elo: profile?.classicElo || 1000, hotseat: false, hotseatFlip: true };
    setTab("play"); setView("quick"); setQuick({ ...cfg, n: Date.now() });
  };
  // THE MENU DURING A FIGHT: on desktop the rail stays on screen while a match
  // runs, and tapping it did nothing at all — the match simply kept rendering
  // over the tab you chose. It asks now, and it says what leaving costs: a
  // campaign fight is saved and resumable, a quick or online game is not.
  const [leaveTo, setLeaveTo] = useState(null);
  // eine ueber die Abkuerzung im Hauptmenue gewaehlte Fernpartie
  const oeffneDaily = useRef(null);
  // A CORRESPONDENCE GAME OPENED FROM THE SHELF. The server hands back seed,
  // both armies and every command played so far; the board replays them and
  // hands the single next move back. Nothing here lives in a socket.
  const [dailyGame, setDailyGame] = useState(null);
  // Das letzte Schnellspiel-Setup ueberlebt jetzt die Sitzung (localStorage):
  // der "Sofort spielen"-Griff im Hub startet damit ohne einen Umweg ueber
  // die Konfiguration - wie es ein Handyspiel schuldig ist.
  const lastQuick = useRef((() => { try { return JSON.parse(localStorage.getItem("gambit:lastQuick") || "null"); } catch { return null; } })());
  const wide = useMedia("(min-width: 900px)");
  const netRef = useRef(null);
  if (!netRef.current) netRef.current = createNet();
  const profileRef = useRef(null);
  useEffect(() => { profileRef.current = profile; }, [profile]);
  const [armyTab, setArmyTab] = useState({ tab: null, n: 0 }); // deep-link into the court (e.g. the skill tree)
  const [account, setAccount] = useState(null);     // signed-in account (null → login screen)
  const [slot, setSlot] = useState(null);           // active save slot (null → save select)
  const [authReady, setAuthReady] = useState(false);
  const playtimeRef = useRef(0);                    // unflushed seconds of visible play
  useEffect(() => netRef.current.on("welcome", () => {
    // one cloud restore point per session, automatically on connect
    const p = profileRef.current;
    if (p) netRef.current.send({ t: "vaultPush", save: serializeSave(p),
      meta: { league: p.campaign?.league || 1, gold: p.gold || 0 } });
  }), []);
  useEffect(() => netRef.current.on("gift", (m) => dispatch({ type: "GIFT_GOLD", n: m.gold || 10 })), []);

  // ── DIE HALLE STEHT OFFEN ──────────────────────────────────────────────────
  // Wer der Verbindung EINMAL zugestimmt hat, muss sich nicht jedesmal neu
  // verbinden: die App klinkt sich beim Start still ein. Zwei Bedingungen sind
  // dabei unverhandelbar - eine vorliegende Einwilligung (notices.online, so
  // steht es auch in der Datenschutzerklaerung) und ein Schalter, mit dem man
  // die Automatik abstellen kann (online.autoConnect !== false). Schlaegt es
  // fehl, passiert nichts weiter: das Spiel laeuft ohne Halle genauso.
  const [hallenSteht, setHallenSteht] = useState(false);
  useEffect(() => {
    const ab = netRef.current.on("welcome", () => setHallenSteht(true));
    const zu = netRef.current.on("close", () => setHallenSteht(false));
    return () => { ab && ab(); zu && zu(); };
  }, []);
  const stillVerbunden = useRef(false);
  useEffect(() => {
    if (stillVerbunden.current || !profile) return;
    const o = profile.online || {};
    if (!profile.notices?.online || o.autoConnect === false || !o.server || !o.id) return;
    stillVerbunden.current = true;
    const t0 = setTimeout(() => {
      netRef.current.connect(o.server, {
        id: o.id, secret: o.secret, name: o.name || profile.name || "?",
        score: retinueScore(profile), privacy: o.privacy || "public",
        stats: buildStats(profile, 0), lang: profile.lang === "en" ? "en" : "de",
      }).catch(() => { /* keine Halle, kein Drama - offline spielt es sich weiter */ });
    }, 1200);   // erst das Spiel zeigen, dann leise verbinden
    return () => clearTimeout(t0);
  }, [profile?.notices?.online, profile?.online?.server]);
  useEffect(() => netRef.current.on("daily:game", (m) => {
    if (!m.game) return;
    setMatch(null); setPvp(null); setQuick(null);
    setDailyGame({ ...m.game, net: netRef.current });
  }), []);
  useEffect(() => netRef.current.on("match", (m) => {
    setMatch(null);
    setPvp({ matchId: m.matchId, seed: m.seed, mapId: m.map, color: m.youAre, rules: m.rules,
      // the clock both sides agreed on in the lobby, handed to the board
      tc: m.tc || "rush", clock: clockFor(m.tc || "rush"),
      oppName: m.opp?.name || "?", oppScore: m.opp?.score || 0, oppArmy: m.oppArmy, net: netRef.current });
  }), []);

  // THE HARD GOODBYE: sign-out must WORK on every browser, every time. We show
  // the login instantly, clear the local session, give the cloud sign-out a
  // short window (so a resume after reload cannot revive the account), then
  // restart the app cold — no React state, cache or listener can undo that.
  /* v1.29.1: den einen Spielstand oeffnen, sobald ein Konto da ist */
  useEffect(() => {
    if (!account || slot) return;
    let lebt = true;
    (async () => {
      try {
        await migrateLegacyInto(account.id);
        let liste = await listSaves(account.id);
        let eintrag = liste && liste[0];
        if (!eintrag) eintrag = await createSave(account.id, null);
        const prof = await loadSave(account.id, eintrag.id);
        if (!lebt || !prof) return;
        dispatch({ type: "HYDRATE", profile: prof }); setLocked(!!prof.pin); setSlot(eintrag); setReady(true);
      } catch (e) { console.error("Spielstand konnte nicht geoeffnet werden", e); }
    })();
    return () => { lebt = false; };
  }, [account, slot]);
  const hardLogout = async () => {
    setSlot(null); setAccount(null);
    try { await clearSession(); } catch {}
    try { await Promise.race([signOutCloud(), new Promise((r) => setTimeout(r, 1500))]); } catch {}
    try { location.replace(location.pathname + location.search); } catch {}
  };

  // boot: resume a cloud session (OAuth redirect) or the local one; the game
  // itself only hydrates once an account picked a save slot.
  useEffect(() => { (async () => {
    let acc = null;
    try { acc = await resumeCloudSession(); } catch {}
    if (!acc) acc = await currentAccount();
    setAccount(acc); setAuthReady(true);
  })(); }, []);

  // playtime: count visible seconds, flush into the slot with every persist
  useEffect(() => {
    const iv = setInterval(() => {
      if (typeof document === "undefined" || document.visibilityState === "visible") playtimeRef.current += 5;
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => { if (ready && profile && account && slot) {
    saveProfile(profile); takeRestorePoint(profile);
    const add = playtimeRef.current; playtimeRef.current = 0;
    writeSave(account.id, slot.id, profile, add).then((e) => e && setSlot((sl) => (sl && sl.id === e.id ? e : sl)));
  } }, [profile, ready]);
  // idle playtime flush (menus, reading): every 30 s without a profile change
  useEffect(() => {
    if (!(account && slot)) return;
    const iv = setInterval(() => {
      const add = playtimeRef.current;
      if (add > 0 && profileRef.current) { playtimeRef.current = 0;
        writeSave(account.id, slot.id, profileRef.current, add).then((e) => e && setSlot((sl) => (sl && sl.id === e.id ? e : sl))); }
    }, 30000);
    return () => clearInterval(iv);
  }, [account, slot]);

  // ANDROID/PWA BACK: inside a match the back gesture must fall back to the
  // hall, never kill the app. This hook lives ABOVE the login early-returns —
  // hooks must run in the same order on every render (React #310).
  const inMatchNow = !!match || !!pvp || !!quick || !!dailyGame;
  useEffect(() => {
    if (!inMatchNow) return;
    try { window.history.pushState({ gg: "match" }, ""); } catch {}
    const onPop = () => {
      if (pvp) setPvp(null); else if (match) setMatch(null); else if (quick) setQuick(null); else if (dailyGame) setDailyGame(null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [inMatchNow]);

  /* v0.80: die Huelle meldet der Musikregie ihren Bereich. Im Kampf meldet
     die Partie selbst (kampf/kampfSpannung/meister) - deshalb schweigt die
     Huelle, solange eine Partie laeuft, und uebernimmt beim Verlassen.
     WICHTIG: dieser Hook MUSS vor allen bedingten Rueckkehrstellen stehen
     (Musterkammer, Werkstaetten, Anmeldung) - ein Hook dahinter aendert die
     Hook-Reihenfolge zwischen den Renderlaeufen und stuerzt mit React #310
     ab. Genau das ist beim ersten Einbau passiert; die Sonde hat es vor dem
     Push gefangen. Darum rechnet er inMatch/mapView selbst. */
  useEffect(() => {
    const im = !!match || !!pvp || !!quick || !!dailyGame;
    if (im) return;
    try { musikBereich(tab === "play" && view === "camp" ? "karte" : "menue"); } catch {}
  }, [match, pvp, quick, dailyGame, tab, view]);
  /* v0.80: DIE POPUP-FREIRAEUME. <main> traegt eine mask-image und bildet
     damit einen Stapelkontext: die Menueleiste (breit, oben) und das Dock
     (schmal, unten) liegen darum IMMER ueber jedem Popup, das in <main>
     wohnt - kein z-Index hilft. Also sagen wir jedem Popup per CSS-Variable,
     wie viel Rand es oben und unten freihalten muss. */
  /* v0.82, dritter Anlauf: NICHT MEHR RATEN, SONDERN MESSEN. Zweimal habe
     ich hier Zahlen gesetzt (104 px breit, 0 px schmal) und zweimal lag ich
     daneben - auf dem Telefon klebt naemlich ebenfalls eine Leiste oben (die
     Zaehler mit Wappen, Funken, Kronen, Gold), und zeitweise auch das
     Installations-Banner. Also fragt die Huelle jetzt den Bildschirm selbst:
     Wie tief reicht das, was oben festklebt? Der groesste gemessene Wert
     wird zum Freiraum, plus etwas Luft. Das haelt auch, wenn morgen eine
     weitere Leiste dazukommt. */
  /* v0.83: der schlichte Stil gilt im GANZEN Haus, nicht nur auf dem Brett. */
  /* Vorsicht: dieser Hook laeuft VOR dem Laden des Spielstands, wenn profile
     noch null ist - ohne den Fragezeichen-Zugriff stuerzt die App beim Start
     ab (von der Sonde gefangen, nicht live). */
  useEffect(() => { setSchlicht(profile?.pieceStyle === "svg"); }, [profile?.pieceStyle]);

  /* ── DIE ZURUECK-GESTE (v0.99, Besitzerfrage: "geht das?") ────────────────
     Ja. Am Telefon wischt man von der Kante nach innen, um zurueckzugehen -
     bisher verliess das die App, weil unsere Ansichten keinen Verlauf haben:
     alles ist EINE Seite. Der Kniff: bei jedem Wechsel in eine tiefere
     Ansicht legen wir einen Eintrag in den Verlauf des Browsers. Die Geste
     nimmt dann diesen Eintrag zurueck, und wir fuehren dieselbe Bewegung im
     Spiel aus, statt die Seite zu verlassen.
     Bewusst KEIN vollstaendiger Verlauf: nur eine Ebene tief, damit die
     Geste nie mehr wegnimmt, als der Spieler erwartet. Wer schon ganz oben
     steht (Spielen-Reiter, keine Partie), darf die App verlassen - alles
     andere waere ein Kaefig. */
  const tiefe = (!!match || !!pvp || !!quick || !!dailyGame) ? 3
    : view !== "hub" ? 2
    : tab !== "play" ? 1 : 0;
  const tiefeRef = useRef(0);
  useEffect(() => {
    if (tiefe > tiefeRef.current) {
      try { history.pushState({ ggTiefe: tiefe }, ""); } catch {}
    }
    tiefeRef.current = tiefe;
  }, [tiefe]);
  useEffect(() => {
    const zurueck = () => {
      // von innen nach aussen: erst die Partie, dann die Ansicht, dann der Reiter
      if (match || pvp || quick || dailyGame) {
        setMatch(null); setPvp(null); setQuick(null); setDailyGame(null);
      } else if (view !== "hub") setView("hub");
      else if (tab !== "play") setTab("play");
      else { history.back(); return; }   // ganz oben: die App darf gehen
      try { history.pushState({ ggTiefe: 0 }, ""); } catch {}
    };
    window.addEventListener("popstate", zurueck);
    return () => window.removeEventListener("popstate", zurueck);
  }, [match, pvp, quick, dailyGame, view, tab]);
  useEffect(() => {
    const r = document.documentElement;
    const messen = () => {
      let unterkante = 0;
      // 1. die Leisten, die sich selbst zu erkennen geben (Kopfleiste breit,
      //    Zaehlerleiste schmal) - unabhaengig davon, WIE sie positioniert
      //    sind: im breiten Zweig liegt die Leiste im Fluss, nicht fixiert.
      //    Genau daran ist die reine Heuristik zuvor gescheitert.
      for (const el of document.querySelectorAll("[data-gg-leiste='oben']")) {
        const k = el.getBoundingClientRect();
        if (k.height > 2 && k.top < 40) unterkante = Math.max(unterkante, k.bottom);
      }
      // 2. alles Uebrige, das oben festklebt (etwa das Installations-Banner)
      for (const el of document.querySelectorAll("body *")) {
        const cs = getComputedStyle(el);
        if (cs.position !== "fixed" && cs.position !== "sticky") continue;
        if (cs.display === "none" || cs.visibility === "hidden") continue;
        const k = el.getBoundingClientRect();
        if (k.height < 8 || k.height > 190) continue;      // keine Vollflaechen
        if (k.width < innerWidth * 0.35) continue;          // keine Knoepfchen
        if (k.top > 24) continue;                           // klebt es wirklich oben?
        unterkante = Math.max(unterkante, k.bottom);
      }
      r.style.setProperty("--gg-popfrei-oben", Math.round(unterkante) + "px");
      r.style.setProperty("--gg-popfrei-unten", wide ? "16px" : "calc(92px + env(safe-area-inset-bottom))");
    };
    messen();
    const iv = setInterval(messen, 900);   // Leisten kommen und gehen (Banner!)
    window.addEventListener("resize", messen);
    return () => { clearInterval(iv); window.removeEventListener("resize", messen); };
  }, [wide]);

  // DIE MUSTERKAMMER: interne Designsystem-Galerie, nur ueber ?galerie in der
  // Adresse erreichbar - kein Menuepunkt, kein Spielerweg. Sitzt NACH allen
  // Hooks (Hook-Reihenfolge bleibt stabil) und VOR Anmeldung/Spielstand,
  // damit sie auch ohne Konto aufgeht. (DS1 §17)
  if (galerie) return <GalerieScreen />;
  // DIE FIGURENWERKSTATT (Besitzer, v0.54): nur ueber ?werkstatt erreichbar.
  /* v0.88: aus der Figurenwerkstatt wurde die SCHAUKAMMER - kein Werkzeug
     zum Verstellen mehr, sondern der volle Blick auf alles Bildmaterial des
     Hauses, mit Titel, Dateiname und Ladeknopf. Der alte Weg ?werkstatt
     bleibt bestehen. */
  /* ── WER ADMIN IST, KLOPFT NICHT (v1.0.52, Besitzerwunsch) ──────────────
     Der Besitzer stand VIERMAL vor dieser Tuer. Sein Einwand ist richtig
     und einfacher als alles, was ich gebaut habe: wer sich bereits als
     Admin angemeldet hat, HAT das Wort schon gesagt. Ein zweites Mal danach
     zu fragen ist keine zusaetzliche Sicherheit, sondern nur eine
     zusaetzliche Fehlerquelle - und genau die hat ihn ausgesperrt.
     Darum: erst warten, bis die Anmeldung geklaert ist (sonst faende ein
     Admin die Tuer vor, bloss weil sein Konto noch nicht geladen war), dann
     Admins durchlassen. Fuer alle anderen bleibt die Tuer stehen - der
     direkte Weg ueber "?werkstatt" ohne Konto soll weiter etwas kosten. */
  const werkzeugFrei = !!account?.isAdmin || torAuf;
  if (werkstatt) {
    if (!authReady) return null;
    return werkzeugFrei ? <SchaukammerScreen />
      : <WerkzeugTuer was="Schaukammer" onOffen={() => setTorAuf(true)} />;
  }
  // DIE KLANGWERKSTATT (Besitzer, v0.79): alle Klaenge zum Abhoeren, ueber die
  // echte klang()-Schicht - nur ueber ?klangwerkstatt erreichbar.
  if (klangwerkstatt) {
    if (!authReady) return null;
    return werkzeugFrei ? <KlangWerkstattScreen />
      : <WerkzeugTuer was="Klangwerkstatt" onOffen={() => setTorAuf(true)} />;
  }
  // DIE ANIMATIONSKAMMER (Besitzer, v1.0.67): das Register aller Bewegungen
  // des Spiels, jede vorfuehrbar, mit dem einen Schalter - ?animkammer.
  if (typeof location !== "undefined" && new URLSearchParams(location.search).has("animkammer")) {
    if (!authReady) return null;
    return werkzeugFrei ? <AnimKammerScreen />
      : <WerkzeugTuer was="Animationskammer" onOffen={() => setTorAuf(true)} />;
  }
  // DAS ADMIN-PORTAL (Besitzer, v0.57): eine Tuer zu allen Unterseiten.
  // DAS SPIELERBUCH (Besitzer, v0.73): Liste, Fortschritt, Herkunft.
  if (typeof location !== "undefined" && new URLSearchParams(location.search).has("spielerbuch")) {
    if (!authReady) return null;
    return werkzeugFrei ? <SpielerbuchScreen />
      : <WerkzeugTuer was="Spielerbuch" onOffen={() => setTorAuf(true)} />;
  }
  if (adminPortal) return <AdminPortal />;
  if (!authReady) return null;
  if (!account) return <LoginScreen onSignedIn={(acc) => setAccount(acc)} />;
  /* v1.29.1 (Besitzer): "In dem Moment, wo ich mich eingeloggt habe, bin ich
     einfach im Spiel." Es gibt nur EINEN Spielstand - also keinen Schirm mehr,
     der ihn zeigt oder wechseln laesst. Nach der Anmeldung wird er geoeffnet
     oder, beim allerersten Mal, angelegt; gesichert wird immer von selbst.
     Unter Profil kann man sich nur noch abmelden. */
  if (!slot) return null;   // wird von oeffneSpielstand geoeffnet
  if (!ready || !profile) return null;
  // The chosen piece style is announced to the gallery ONCE, here. Every screen
  // that looks a figure up by id — the court, the chronicle, the unlock pop-ups
  // — then answers in that style without knowing anything about it.
  // The livery is the HOUSE's choice, not the player's. Priority: the admin's
  // local preview override, then the Hall's live answer (cached), then the
  // shipped APP_DESIGN. houseDesign state re-renders us when the Hall differs.
  setLivery((account?.isAdmin && profile.design) || houseDesign || APP_DESIGN);
  const showPrivacy = !profile.notices?.privacy;
  const showIntro = !showPrivacy && !profile.notices?.intro; // what the game IS — once, at the very start
  /* v1.0.5: Bestandsstaende ohne Namen (seit der E-Mail-Trennung gibt es
     die) bekommen den Herold-Ruf nachgereicht - einmal, mit vorbefuelltem
     Vorschlag. Neue Spieler setzen den Namen schon im GameIntro. */
  const showName = !showPrivacy && !showIntro && !(profile.name || "").trim();
  // onboarding lessons appear between battles, never over a running match
  const teach = (!showPrivacy && !showIntro && !showName && !inMatchNow) ? pendingTeach(profile) : null;
  /* v1.12.0: ein erwachter Bund geht VOR den Lehrstunden - er ist der
     seltenere Moment und der, auf den man hingearbeitet hat. */
  const bundWach = (!showPrivacy && !showIntro && !showName && !inMatchNow && !teach)
    ? offenerBund(profile) : null;
  /* v1.0.44: die naechste Freigabe, die sich noch nicht erklaert hat. Nach
     den Lehrstunden, damit nie zwei Fenster uebereinander stehen - und nie
     mitten in einer Partie. */
  const freigabe = (!showPrivacy && !showIntro && !showName && !inMatchNow && !teach)
    ? naechsteErklaerung(profile) : null;
  const t = makeT(profile.lang);
  if (locked) return <Lock t={t} profile={profile} onUnlock={() => setLocked(false)}
    onBack={hardLogout} />;   /* v1.29.1: zurueck heisst abmelden - einen Spielstandschirm gibt es nicht mehr */

  const sub = (title, node) => <div><SubHeader title={title} onBack={() => setView("hub")} t={t} />{node}</div>;
  const screen = pvp
    ? <GameScreen key={"pvp" + pvp.matchId} profile={profile} dispatch={dispatch} t={t} pvp={pvp} onExit={() => setPvp(null)} />
    : match
    ? <GameScreen key={"camp" + match.nodeId} profile={profile} dispatch={dispatch} t={t} match={match} onExit={() => setMatch(null)}
        onArmy={() => { setMatch(null); setTab("army"); }} />
    : quick
    ? <GameScreen key={"q" + quick.n} profile={profile} dispatch={dispatch} t={t} quick={quick} onExit={() => setQuick(null)} />
    : dailyGame
    ? <GameScreen key={"daily" + dailyGame.gameId} profile={profile} dispatch={dispatch} t={t}
        daily={dailyGame} onExit={() => setDailyGame(null)} />
    : tab === "play" ? (
        view === "quick" ? sub(t("hub.quick"), <QuickSetup profile={profile} dispatch={dispatch} t={t} initial={lastQuick.current}
          onStart={(cfg) => { lastQuick.current = cfg; try { localStorage.setItem("gambit:lastQuick", JSON.stringify(cfg)); } catch { /* voll/aus */ } setQuick({ ...cfg, n: Date.now() }); }} />)
        : view === "camp" ? <CampaignScreen profile={profile} dispatch={dispatch} t={t} onBack={() => setView("hub")} onStart={(id, lookLeague = null) => {
          if (lookLeague != null) { setMatch(buildStageMatch(id, profile, lookLeague)); return; } // the look back: a friendly replay, no bookkeeping
          // the first fight at a station lifts its veil: FACED is recorded at
          // battle start (win or lose), per league — empty posts until then
          const faced = profile.campaign?.faced || [];
          const m = buildStageMatch(id, profile);
          /* v1.35.0: DIE BESETZUNG WIRD BEIM BETRETEN FESTGEHALTEN - im selben
             Schritt wie "gekaempft", damit sich zwei Ersetzungen desselben
             Stands nicht gegenseitig ueberschreiben. Danach aendert sie sich
             nur noch, wenn sich der Besitz aendert (besetzung.js). */
          let neu = profile;
          if (!faced.includes(id)) neu = { ...neu, campaign: { ...neu.campaign, faced: [...faced, id] } };
          if (m.besetzung && m.besetzung.neu)
            neu = { ...neu, campaign: { ...neu.campaign, besetzung: { ...(neu.campaign?.besetzung || {}), [id]: m.besetzung.eintraege } } };
          if (neu !== profile) dispatch({ type: "REPLACE", profile: neu });
          setMatch(m);
        }} onOpenTree={() => { setArmyTab({ tab: "tree", n: Date.now() }); setTab("army"); }} />
        : view === "online" ? sub(t("online.title"), account?.provider === "guest"
          ? <Panel><div className="gg-quill" style={{ fontSize: 18, color: T.goldBright, marginBottom: 6 }}>
              {profile.lang === "en" ? "The Hall needs an account" : "Die Halle braucht ein Konto"}</div>
            <div className="gg-serif" style={{ fontSize: 13, lineHeight: 1.6, color: T.dim }}>
              {profile.lang === "en"
                ? "Online duels, correspondence games and the cloud vault are tied to an account — a guest leaves no trace the Hall could find again. Create an account and everything you have played stays with you."
                : "Online-Duelle, Fernpartien und die Wolken-Sicherung hängen an einem Konto — ein Gast hinterlässt keine Spur, die die Halle wiederfinden könnte. Lege ein Konto an, dann bleibt dir alles erhalten, was du gespielt hast."}</div>
          </Panel>
          : <OnlineScreen profile={profile} dispatch={dispatch} t={t} net={netRef.current} account={account}
            oeffneDaily={oeffneDaily}
            onDaily={(gameId) => netRef.current.send({ t: "daily:open", gameId })} />)
        : view === "tutorial" ? sub(t("tut.title"), <AkademieScreen profile={profile} t={t} en={profile.lang === "en"} account={account} onDone={() => setView("hub")} />)
        : <PlayHub profile={profile} t={t} onQuick={() => setView("quick")} onQuickStart={startQuickNow} onCamp={() => setView("camp")} onOnline={(gid) => { oeffneDaily.current = gid || null; setView("online"); }} onTutorial={() => setView("tutorial")} hallenStand={hallenSteht} />
      )
      : tab === "army" ? <ArmyScreen key={armyTab.n} profile={profile} dispatch={dispatch} t={t} initialTab={armyTab.tab} account={account} />
        : tab === "ach" ? <AchievementsScreen profile={profile} dispatch={dispatch} t={t} en={profile.lang === "en"} />
          : <ProfileScreen profile={profile} dispatch={dispatch} t={t} account={account}
              onLogout={hardLogout} />;

  const inMatch = !!match || !!pvp || !!quick || !!dailyGame;
  // map & match immersion (v0.3/v0.4): the campaign map and every running
  // match fill the screen — the shell locks to 100dvh, UI floats above
  const immersive = inMatch || (tab === "play" && view === "camp");
  // the campaign map stays fullscreen, but the MAIN MENU stays with it — the
  // court is always one tap away, and leaving the map needs no back button
  const mapView = tab === "play" && view === "camp" && !inMatch;
  const claimable = claimableCount(profile);
  const railItems = TABS.map((tb) => {
    const on = tab === tb.id;
    const badge = tb.id === "ach" && claimable > 0;
    return (
      <button key={tb.id} onClick={() => {
        if (inMatch && tb.id !== tab) { setLeaveTo(tb.id); return; }
        if (tb.id !== tab) { try { klang("menue"); } catch {} }   /* v0.79: der leiseste Klang im Haus */
        setTab(tb.id); setView("hub");
      }} style={{ position: "relative",
        display: "flex", alignItems: "center", gap: wide ? 12 : 0, flexDirection: wide ? "row" : "column",
        justifyContent: wide ? "flex-start" : "center", width: wide ? "auto" : "100%",
        background: on ? "linear-gradient(135deg, rgba(139,92,246,.30), rgba(124,58,237,.14))" : "none",
        border: on ? "1px solid rgba(196,181,253,.55)" : "1px solid transparent",
        borderRadius: 14, cursor: "pointer", fontFamily: "inherit",
        padding: wide ? "11px 14px" : "9px 4px 8px", color: on ? "#ffffff" : "#cfc8e6",
        transition: "background .18s, color .18s" }}>
        <NavIcon id={tb.id} color={on ? T.goldBright : "#b9b0d8"} size={wide ? 25 : 26} />
        <span className="gg-serif" style={{ fontSize: wide ? 13 : 10, fontWeight: 800, marginTop: wide ? 0 : 3,
          letterSpacing: ".09em", textTransform: "uppercase",
          textShadow: on ? "0 0 8px rgba(196,181,253,.6), 0 1px 2px rgba(0,0,0,.6)" : "0 1px 2px rgba(0,0,0,.55)" }}>{t(tb.key)}</span>
        {/* v1.1.4 (Besitzeridee): DER MUENZREGEN. Der Zaehler gab es schon, aber
            still - man musste hinsehen. Jetzt poppt er auf, sobald eine
            Belohnung faellig wird, und drei Muenzen rasseln ueber die Leiste
            herunter. Der Regen laeuft EINMAL je neuer Belohnung (Schluessel am
            Zaehler), nicht endlos: ein Dauerregen waere nach einer Minute
            nur noch Unruhe. */}
        {badge && <span key={"bdg" + claimable} style={{ position: "absolute", top: wide ? 7 : 4, right: wide ? 8 : "calc(50% - 17px)",
          minWidth: 15, height: 15, padding: "0 3px", borderRadius: 9, background: T.gold, color: "#241a08",
          fontSize: 9.5, fontWeight: 900, display: "grid", placeItems: "center",
          boxShadow: "0 0 8px rgba(240,200,110,.7)",
          ...(animAn() ? { animation: "ggBeutelPop .42s cubic-bezier(.24,1.3,.4,1) both" } : null) }}>{claimable}</span>}
        {badge && animAn() && <span key={"rgn" + claimable} aria-hidden style={{ position: "absolute", inset: 0,
          pointerEvents: "none", overflow: "hidden" }}>
          {[0, 1, 2].map((k) => (
            <span key={k} style={{ position: "absolute", top: wide ? 6 : 3,
              right: `calc(${wide ? 8 : "50% - 17px"} + ${(k - 1) * 9}px)`,
              width: 7, height: 7, borderRadius: "50%",
              background: "radial-gradient(circle at 34% 30%, #fff3c4, #e9cf8a 55%, #b8944e)",
              boxShadow: "0 0 5px rgba(240,200,110,.8)",
              animation: `ggMuenzeFaellt .72s ease-in ${k * 0.13 + 0.18}s both` }} />
          ))}
        </span>}
      </button>
    );
  });

  // OHNE PILLE: Zeichen und Zahl stehen frei in der Leiste - der Rahmen um
  // jede Zahl war ein Kasten zu viel. Die Skillpunkte sind vom Hofstaat
  // hierher gezogen, damit sie ueberall in Sicht bleiben.
  const coinChip = (icon, val, title, farbe = T.goldBright) => (
    <span title={title} className="gg-serif" style={{ display: "inline-flex", alignItems: "center", gap: 6,
      color: farbe, fontSize: 15, fontWeight: 700, letterSpacing: ".04em", whiteSpace: "nowrap",
      textShadow: "0 1px 3px rgba(0,0,0,.7)", fontVariantNumeric: "tabular-nums" }}>{icon} {val}</span>
  );
  const currencyRow = (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 14, flex: "0 0 auto", alignItems: "center", justifyContent: "flex-end" }}>
      {coinChip(<SkillIc size={19} />, profile.sp || 0, t("banner.sp").replace("+{n} ", ""), T.riftBright)}
      {coinChip(<CoinIc size={19} />, profile.gold || 0, t("army.balance"))}
      {coinChip(<CrestIc size={19} />, retinueScore(profile), t("online.score"))}
    </div>
  );
  const headerBar = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
      <img src={emblemArt()} alt="Grand Gambit" onClick={() => setTab("play")}
        style={{ cursor: "pointer", height: 34, display: "block", flex: "0 0 auto",
        filter: "drop-shadow(0 0 5px rgba(139,92,246,.4)) drop-shadow(0 0 11px rgba(124,58,237,.22))" }} />
      <div style={{ flex: 1 }} />
      {currencyRow}
    </div>
  );

  if (wide) return (
    <div style={{ height: "calc(100dvh / var(--vhz, 1))", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
      padding: immersive ? "14px 16px 14px" : "16px 18px 0", rowGap: immersive ? 10 : 22 }}>
      {/* v0.80: der breite Zweig hatte NIE Musik oder Effekt-Regie - die
          Zwei-Zweige-Falle. Jetzt spielt der Schreibtisch dasselbe Haus. */}
      <Soundtrack an={profile.sound !== false && lautVon(profile, "musik") > 0} laut={lautVon(profile, "musik")} />
      <KlangRegie an={profile.sfx !== false && lautVon(profile, "klang") > 0} laut={lautVon(profile, "klang")} />
      {/* v1.0.25 (Besitzer: "das Spiel ruckelt"): DIE UNSICHTBARE EBENE.
          Hier fehlte das inMatch-Gate, das der zweite Zweig laengst hat - im
          Kampf lief die Halle WEITER, obwohl das Kapitelgemaelde sie
          vollstaendig verdeckt. Der Browser rechnete also jeden Frame ein
          168 % breites Bild MIT CSS-MASKE mit, das niemand sieht; Masken sind
          auf Telefon-Grafikkernen teuer, und beim Ziehen kommt die Animation
          obendrauf. Genau da war das Stocken. */}
      {!immersive && !inMatch && <MysticBackground league={profile?.campaign?.league || 1} />}
      {/* DER RISSBODEN liegt unten fixiert hinter jedem Menue und waechst mit
          Hofwert und Kampagne (RissBoden.jsx). Im Kampf und in der Kartenwelt
          bleibt er fort - dort gehoert der Blick dem Brett bzw. der Karte. */}
      {!immersive && !inMatch && !(tab === "play" && view === "camp") && <RissBoden profile={profile} />}
      {/* v1.0.24 (Besitzer): DAS LAND HINTER DEM BRETT. Im Kampf tritt der
          Rissboden ab und das Kapitelgemaelde nimmt seinen Platz - zwoelf
          Oelbilder, deren Mitte absichtlich leer gemalt ist, damit das Brett
          darauf lesbar steht. Kampagne: das Kapitel der Station. Schnelles
          Spiel, Halle und Tagesraetsel: der eigene Kapitelstand. */}
      {inMatch && <BrettHintergrund liga={match?.league || profile?.campaign?.league || 1} />}
      {(() => {
        // ── ERSTBESUCH-HERALD (v0.51): beim ersten Betreten eines Menues
        // stellt sich der Raum EINMAL vor - danach schweigt er fuer immer
        // (profile.gesehen). "Alle ueberspringen" bringt alle zum Schweigen.
        const ml = MENUE_LEHREN[profile?.lang === "en" ? "en" : "de"];
        const eintrag = ml && ml[tab];
        const zeigen = eintrag && ready && !showIntro && !showPrivacy && !showName && !inMatch && !(profile?.gesehen || {})[tab];
        if (!zeigen) return null;
        const merken = (alle) => dispatch({ type: "REPLACE", profile: { ...profile,
          gesehen: alle ? Object.fromEntries(Object.keys(ml).map((k) => [k, true]))
                        : { ...(profile.gesehen || {}), [tab]: true } } });
        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "grid", placeItems: "center",
            background: "rgba(8,10,14,.78)", backdropFilter: "blur(3px)", padding: "16px 10px" }}>
            <div style={{ background: `radial-gradient(125% 135% at 50% -10%, ${T.panel2} 0%, ${T.panel} 52%, ${T.bg2} 100%)`,
              border: `1.5px solid ${T.gold}66`, borderRadius: 16, padding: "18px 18px 14px", maxWidth: 420, width: "100%",
              boxShadow: "0 14px 44px rgba(0,0,0,.6)" }}>
              <div className="gg-serif" style={{ fontSize: 19, color: T.goldBright, letterSpacing: ".04em", marginBottom: 4 }}>{eintrag.titel}</div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: "#cbbcf5", marginBottom: 8 }}>{eintrag.kurz}</div>
              <div style={{ fontSize: 12.5, lineHeight: 1.62, color: T.text, marginBottom: 14 }}>{eintrag.text}</div>
              <button onClick={() => merken(false)} style={{ width: "100%", padding: "11px 14px", borderRadius: 12,
                border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 900, fontSize: 14.5, color: "#17110a",
                background: "linear-gradient(160deg, #f0d68a, #d9b565 55%, #b08c44)" }}>
                {profile?.lang === "en" ? "Got it" : "Verstanden"}</button>
              <button onClick={() => merken(true)} style={{ width: "100%", marginTop: 8, padding: "9px 14px", borderRadius: 12,
                border: `1px solid ${T.line}`, cursor: "pointer", fontFamily: "inherit", fontWeight: 800, fontSize: 12.5,
                color: T.dim, background: "transparent" }}>
                {profile?.lang === "en" ? "Skip all introductions" : "Alle Vorstellungen überspringen"}</button>
            </div>
          </div>
        );
      })()}
      {showPrivacy && <PrivacyNotice t={t} dispatch={dispatch} />}
      {showIntro && <GameIntro t={t} en={profile.lang === "en"} dispatch={dispatch} onStart={() => { setTab("play"); setView("hub"); }} />}
      {showName && !inMatch && <NamensRuf t={t} en={profile.lang === "en"} dispatch={dispatch} />}
      {bundWach && <BundErwacht bundId={bundWach} en={profile.lang === "en"}
        onClose={() => dispatch({ type: "SET_NOTICE", key: `bund_${bundWach}` })} />}
      {teach && <TeachPopup which={teach} t={t} dispatch={dispatch} />}
      {freigabe && <FreigabeFenster freigabe={freigabe} en={profile.lang === "en"} dispatch={dispatch} />}
      {leaveTo && <LeaveMatchAsk t={t} resumable={!!match && !pvp}
        onStay={() => setLeaveTo(null)}
        onLeave={() => { setPvp(null); setMatch(null); setQuick(null); setDailyGame(null); setTab(leaveTo); setView("hub"); setLeaveTo(null); }} />}
      {(<>
        {/* v1.0.92 (Besitzer: "wenn man hinter der Menueleiste durchscrollt,
            ist rechts und links oben im Eck einfach so eine Kante - nicht dass
            es aussieht, als waere da nur der Hintergrund schwarz"): DER SAUM.
            Die Leiste ist rund und durchscheinend; an ihren Ecken lief der
            Inhalt hart hinter sie. Jetzt blendet ein Verlauf darunter vom
            Seitenhintergrund nach transparent aus - was durchscrollt,
            verschwindet weich. Volle Breite, damit auch die Ecken gedeckt
            sind; zIndex 6 gegen die Leiste (7). */}
        <div aria-hidden style={{ position: "sticky", top: 0, zIndex: 6, width: "100vw",
          marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)", marginBottom: -74,
          height: 74, pointerEvents: "none",
          background: `linear-gradient(180deg, ${T.bg} 0%, ${T.bg} 34%, ${T.bg}d8 62%, ${T.bg}00 100%)` }} />
        <aside data-gg-leiste="oben" style={{ width: "100%", maxWidth: 1020, position: "sticky", top: 12, zIndex: 7,
          background: "linear-gradient(180deg, rgba(60,38,110,.62) 0%, rgba(30,18,58,.66) 100%)",
          backdropFilter: `blur(${T.glassBlur})`, WebkitBackdropFilter: `blur(${T.glassBlur})`,
          border: "1px solid rgba(167,139,250,.5)", borderRadius: 20, padding: "10px 16px",
          boxShadow: `${T.shadow}, 0 0 16px rgba(124,58,237,.34), 0 0 34px rgba(124,58,237,.16)`,
          display: "flex", alignItems: "center", gap: 10 }}>
          <img src={emblemArt()} alt="Grand Gambit" onClick={() => setTab("play")}
            style={{ cursor: "pointer", height: 40, display: "block", flex: "0 0 auto", paddingRight: 6,
            filter: "drop-shadow(0 0 5px rgba(139,92,246,.4)) drop-shadow(0 0 11px rgba(124,58,237,.22))" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, flex: "1 1 auto", minWidth: 0 }}>{railItems}</div>
          {currencyRow}
        </aside>
      </>)}
      <main style={{ width: "100%", minWidth: 0, flex: "1 1 auto", minHeight: 0,
        overflowY: immersive ? "hidden" : "auto", overscrollBehavior: "none",
        // AUSBLENDUNG AN DER MENUELEISTE (Besitzer, v0.62): was hinter das
        // Dock rutscht, ist bei dessen Oberkante 100 % transparent - der
        // Inhalt loest sich im kurzen Band darueber auf, in ALLEN Menues.
        WebkitMaskImage: immersive ? "none" : "linear-gradient(180deg, #000 0%, #000 calc(100% - 170px - env(safe-area-inset-bottom)), rgba(0,0,0,.4) calc(100% - 118px - env(safe-area-inset-bottom)), transparent calc(100% - 74px - env(safe-area-inset-bottom)))",
        maskImage: immersive ? "none" : "linear-gradient(180deg, #000 0%, #000 calc(100% - 170px - env(safe-area-inset-bottom)), rgba(0,0,0,.4) calc(100% - 118px - env(safe-area-inset-bottom)), transparent calc(100% - 74px - env(safe-area-inset-bottom)))",
        // the fixed dock (~76px) + Safari's home-bar safe-area float OVER the
        // scroll area: without this reserve the last buttons (e.g. sign-out on
        // the profile) end up UNDER the dock, which then swallows the tap
        paddingBottom: immersive ? 0 : "calc(94px + min(30vh, 270px) + env(safe-area-inset-bottom))", // v0.60: Reserve in Bodenhoehe - das Unterste kann UEBER den Riss-Streifen scrollen
        maxWidth: immersive ? "none" : 1020, // menus run as wide as the header bar
        ...(immersive ? { display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 } : {}),
        ...(tab === "play" && view === "hub" && !inMatch && !immersive
          // DS1 Phase 6: nicht mehr vertikal zentriert - die Zentrierung
          // schob die Haelfte des Leerraums ZWISCHEN Kopfleiste und Karten
          // (gemessen: 67 px Luecke). Inhalt beginnt oben, der Rest der Buehne
          // gehoert dem MysticBackground.
          ? { display: "flex", flexDirection: "column", justifyContent: "flex-start", minHeight: "calc(100dvh / var(--vhz, 1) - 72px)" } : {}) }}>{screen}</main>
    </div>
  );

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", height: "calc(100dvh / var(--vhz, 1))", overflow: "hidden", display: "flex", flexDirection: "column",
      ...(immersive ? { maxWidth: "none" } : {}) }}>
      {(!immersive || mapView) && !inMatch && <MysticBackground league={profile?.campaign?.league || 1} />}
      {!immersive && !inMatch && <RissBoden profile={profile} />}
      {inMatch && <BrettHintergrund liga={match?.league || profile?.campaign?.league || 1} />}   {/* v1.0.24: auch im zweiten Zweig */}
      {(() => {
        // ── ERSTBESUCH-HERALD (v0.51): beim ersten Betreten eines Menues
        // stellt sich der Raum EINMAL vor - danach schweigt er fuer immer
        // (profile.gesehen). "Alle ueberspringen" bringt alle zum Schweigen.
        const ml = MENUE_LEHREN[profile?.lang === "en" ? "en" : "de"];
        const eintrag = ml && ml[tab];
        const zeigen = eintrag && ready && !showIntro && !showPrivacy && !showName && !inMatch && !(profile?.gesehen || {})[tab];
        if (!zeigen) return null;
        const merken = (alle) => dispatch({ type: "REPLACE", profile: { ...profile,
          gesehen: alle ? Object.fromEntries(Object.keys(ml).map((k) => [k, true]))
                        : { ...(profile.gesehen || {}), [tab]: true } } });
        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "grid", placeItems: "center",
            background: "rgba(8,10,14,.78)", backdropFilter: "blur(3px)", padding: "16px 10px" }}>
            <div style={{ background: `radial-gradient(125% 135% at 50% -10%, ${T.panel2} 0%, ${T.panel} 52%, ${T.bg2} 100%)`,
              border: `1.5px solid ${T.gold}66`, borderRadius: 16, padding: "18px 18px 14px", maxWidth: 420, width: "100%",
              boxShadow: "0 14px 44px rgba(0,0,0,.6)" }}>
              <div className="gg-serif" style={{ fontSize: 19, color: T.goldBright, letterSpacing: ".04em", marginBottom: 4 }}>{eintrag.titel}</div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: "#cbbcf5", marginBottom: 8 }}>{eintrag.kurz}</div>
              <div style={{ fontSize: 12.5, lineHeight: 1.62, color: T.text, marginBottom: 14 }}>{eintrag.text}</div>
              <button onClick={() => merken(false)} style={{ width: "100%", padding: "11px 14px", borderRadius: 12,
                border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 900, fontSize: 14.5, color: "#17110a",
                background: "linear-gradient(160deg, #f0d68a, #d9b565 55%, #b08c44)" }}>
                {profile?.lang === "en" ? "Got it" : "Verstanden"}</button>
              <button onClick={() => merken(true)} style={{ width: "100%", marginTop: 8, padding: "9px 14px", borderRadius: 12,
                border: `1px solid ${T.line}`, cursor: "pointer", fontFamily: "inherit", fontWeight: 800, fontSize: 12.5,
                color: T.dim, background: "transparent" }}>
                {profile?.lang === "en" ? "Skip all introductions" : "Alle Vorstellungen überspringen"}</button>
            </div>
          </div>
        );
      })()}
      {showPrivacy && <PrivacyNotice t={t} dispatch={dispatch} />}
      {showIntro && <GameIntro t={t} en={profile.lang === "en"} dispatch={dispatch} onStart={() => { setTab("play"); setView("hub"); }} />}
      {showName && !inMatch && <NamensRuf t={t} en={profile.lang === "en"} dispatch={dispatch} />}
      {bundWach && <BundErwacht bundId={bundWach} en={profile.lang === "en"}
        onClose={() => dispatch({ type: "SET_NOTICE", key: `bund_${bundWach}` })} />}
      {teach && <TeachPopup which={teach} t={t} dispatch={dispatch} />}
      {freigabe && <FreigabeFenster freigabe={freigabe} en={profile.lang === "en"} dispatch={dispatch} />}
      {leaveTo && <LeaveMatchAsk t={t} resumable={!!match && !pvp}
        onStay={() => setLeaveTo(null)}
        onLeave={() => { setPvp(null); setMatch(null); setQuick(null); setDailyGame(null); setTab(leaveTo); setView("hub"); setLeaveTo(null); }} />}
      {/* ── DER VERLAUF NACH OBEN (v1.4.4, Besitzerbefund) ────────────────────
            "Der schwarze Verlauf zur Leiste nach oben fehlt immer noch, da ist
            immer so eine komische Kante, das sieht super haesslich aus."

            GEFUNDEN: es gibt ZWEI Kopfleisten in der App. Die eine (aside,
            Hauptmenue) hat ihren Verlauf seit je - die hier nicht. Der Inhalt
            scrollte also mit harter Kante dahinter durch, waehrend er unten
            sauber ins Schwarze lief. Derselbe Verlauf wie beim Zwilling,
            damit beide Leisten gleich aussehen. */}
      {!immersive && (<>
        <div aria-hidden style={{ position: "sticky", top: 0, zIndex: 6, width: "100vw",
          marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)", marginBottom: -74,
          height: 74, pointerEvents: "none",
          background: `linear-gradient(180deg, ${T.bg} 0%, ${T.bg} 34%, ${T.bg}d8 62%, ${T.bg}00 100%)` }} />
        <header data-gg-leiste="oben" style={{ position: "sticky", top: 0, zIndex: 7, padding: "10px 10px 0" }}>
          {/* Die Ressourcen-PILLE der Vorlage: voll gerundet, violetter Glas-
              verlauf, duenne violette Kante. Fluchtlinie bleibt bei 10 px. */}
          <div style={{ background: "linear-gradient(90deg, rgba(58,36,110,.72) 0%, rgba(26,17,50,.78) 100%)",
            backdropFilter: `blur(${T.glassBlur})`, WebkitBackdropFilter: `blur(${T.glassBlur})`,
            border: "1px solid rgba(176,124,255,.4)", borderRadius: 999, padding: "10px 16px",
            boxShadow: `${T.shadow}, 0 0 16px rgba(122,60,255,.28)` }}>{headerBar}</div>
        </header>
      </>)}
      {/* ONE flush edge: header card, screen panels and dock all sit 10px from
          the viewport — before this, header ran at 10, dock at 12, content at
          14, three different alignments (the profile looked narrower than the
          menu). */}
      <main style={{ flex: 1, minHeight: 0, overflowY: immersive ? "hidden" : "auto", overflowX: "hidden", overscrollBehavior: "none",
        WebkitMaskImage: (immersive || inMatch) ? "none" : "linear-gradient(180deg, #000 0%, #000 calc(100% - 170px - env(safe-area-inset-bottom)), rgba(0,0,0,.4) calc(100% - 118px - env(safe-area-inset-bottom)), transparent calc(100% - 74px - env(safe-area-inset-bottom)))",
        maskImage: (immersive || inMatch) ? "none" : "linear-gradient(180deg, #000 0%, #000 calc(100% - 170px - env(safe-area-inset-bottom)), rgba(0,0,0,.4) calc(100% - 118px - env(safe-area-inset-bottom)), transparent calc(100% - 74px - env(safe-area-inset-bottom)))", padding: immersive ? (mapView ? "0 6px calc(72px + env(safe-area-inset-bottom))" : "0 3px") : inMatch ? "8px 6px 12px" : "22px 10px calc(108px + min(30vh, 270px))",
        ...(tab === "play" && view === "hub" && !inMatch && !immersive
          ? { display: "flex", flexDirection: "column", justifyContent: "flex-start" } : {}),
        ...(immersive ? { display: "flex", flexDirection: "column" } : {}) }}>{screen}</main>
      {/* die Melodie des Hauses - abschaltbar unter Profil */}
      <Soundtrack an={profile.sound !== false && lautVon(profile, "musik") > 0} laut={lautVon(profile, "musik")} />
      <KlangRegie an={profile.sfx !== false && lautVon(profile, "klang") > 0} laut={lautVon(profile, "klang")} />
      {/* v1.0.6 (Besitzer, auf dem Weg in den Play Store): das automatische
          Installations-Banner ist FORT. Wer die App will, holt sie aus dem
          Store; Web-Spieler finden den stillen Weg weiter unter Profil ->
          "Als App" (der sich in der installierten App selbst versteckt). Ein
          aufpoppender "Installieren"-Knopf wirkt neben einem Store-Eintrag
          unfertig - und genau dieses Banner war es, das der Besitzer weg
          haben wollte. */}
      {(!immersive || mapView) && (
        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9,
          padding: "0 10px calc(10px + env(safe-area-inset-bottom))", pointerEvents: "none" }}>
          <div style={{ maxWidth: 540, margin: "0 auto", pointerEvents: "auto",
            background: "linear-gradient(180deg, rgba(60,38,110,.62) 0%, rgba(30,18,58,.66) 100%)",
            backdropFilter: `blur(${T.glassBlur})`, WebkitBackdropFilter: `blur(${T.glassBlur})`,
            border: "1.5px solid rgba(178,150,255,.62)", borderRadius: 22,
            boxShadow: "0 12px 32px rgba(0,0,0,.55), 0 0 18px rgba(124,58,237,.22)",
            display: "grid", gridTemplateColumns: `repeat(${TABS.length}, 1fr)`, padding: "6px 8px" }}>
            {railItems}
          </div>
        </nav>
      )}
    </div>
  );
}

// ── hub emblems: heraldic shields, fully inside the card, bold shapes ───────
export const HubArt = ({ children }) => (
  <svg width="72" height="80" viewBox="0 0 64 72">
    <defs>
      <radialGradient id="hubg" cx="38%" cy="26%" r="85%">
        <stop offset="0%" stopColor="#2c3554" /><stop offset="100%" stopColor="#121828" />
      </radialGradient>
      <linearGradient id="hubrim" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ecd08c" /><stop offset=".5" stopColor="#c9a45c" /><stop offset="1" stopColor="#8a6d35" />
      </linearGradient>
    </defs>
    <path d="M32 2.5 L58.5 9.5 V33 C58.5 51.5 46.5 62.5 32 69.5 C17.5 62.5 5.5 51.5 5.5 33 V9.5 Z"
      fill="url(#hubg)" stroke="url(#hubrim)" strokeWidth="2.4" strokeLinejoin="round" />
    <path d="M32 7 L54.5 13 V33 C54.5 49 44 58.8 32 64.9 C20 58.8 9.5 49 9.5 33 V13 Z"
      fill="none" stroke="#c9a45c55" strokeWidth="1" />
    {children}
  </svg>
);
const G = "#c9a45c", GH = "#e8c97e", NV = "#0e1424";


export function PlayHub({ profile, t, onQuick, onCamp, onOnline, onTutorial = null, hallenStand = false, onQuickStart = null }) {
  /* v1.0.37: der Sparmodus steht VOR dem Zeichnen - sonst liefe ein Bild
     lang die teure Fassung. */
  setSparmodus(profile.spar);
  setGegnerStil(profile.gegnerStil);   /* v1.0.50: die gewaehlte Sicht auf den Gegner */
  const en = profile.lang === "en";
  const hubWide = useMedia("(min-width: 900px)");
  const cur = nodeById(currentNodeId(profile));
  const done = clearedCount(profile), total = campaignLength(profile);
  const ch = chapterForRow(cur?.row || 0);
  const roman = ["I", "II", "III", "IV"][ch.n - 1];
  // WER NOCH NIE GESPIELT HAT, KANN NICHTS "FORTSETZEN". Der Knopf log den
  // Neuling an: keine geraeumte Station, kein ruhender Kampf, erstes Kapitel.
  const nieGespielt = done === 0 && !profile.pausedMatch && (profile.campaign?.league || 1) === 1;

  // laufende Fernpartien aus dem letzten Hallenbesuch - braucht keine Verbindung
  let fernpartien = [];
  try { fernpartien = JSON.parse(localStorage.getItem("gambit:u::daily:v1") || "[]"); } catch { fernpartien = []; }
  const amZug = fernpartien.filter((g) => g.yourTurn);

  // DIE KARTE ALS HUELLE: frueher war die ganze Karte EIN Knopf, deshalb
  // konnte nichts Anklickbares in ihr sitzen (Knoepfe in Knoepfen sind
  // ungueltig). Jetzt traegt eine Huelle das Aussehen, der Kopfbereich ist der
  // Knopf - und darunter ist Platz fuer eigene Griffe (die Fernpartien).
  // `ruhig`: der Gold-CTA ohne Glanzlauf. Im Hub laeuft der Glanz nur noch
  // auf der Kampagne (dem Hauptweg) - vorher glaenzten drei Knoepfe im Chor
  // (gemessen), und "dominant" verliert seinen Sinn, wenn es alle sind.
  // `bild`: die grosse Kachel traegt ein echtes Bild (Designleitsatz des
  // Besitzers, v0.48: "wenn wir mehr Flaeche haben, gehen wir in eine
  // ordentliche Bildsprache und erzaehlen die Geschichte"). Die Motive sitzen
  // rechts, die linke Textzone der Bilder ist nachgemessen fast schwarz
  // (L 0,9-1,6 von 255) - ein leiser Schleier von links sichert die Schrift
  // zusaetzlich, die Wappen-Grafik entfaellt auf diesen Karten.
  const Card = ({ title, sub, extra, body, cta, onGo, art, style, children, artTop = false, ruhig = false, bild = null }) => {
    const shineDelay = useShineDelay();
    /* v1.0.4, ZWEI BESITZERFUNDE AN EINER STELLE:
       (1) "bei manchen dieser Bilder noch eine Kante auf der linken Seite" -
           das Motiv lag als BACKGROUND-Ebene unter einem Schleier, der ueber
           die KACHELBREITE lief und erst bei 94 % durchsichtig wurde. Die
           Bildkante selbst sitzt aber schon bei ~78 % (das Motiv ist nur
           AR x Kachelhoehe breit, hier ~205 px). Dort war der Schleier noch
           ~14 % deckend - also stiess das helle Bild als harte senkrechte
           Naht auf reines Schwarz. Ein Schleier ueber der Kachel kann eine
           Bildkante nicht weichzeichnen, die woanders liegt. Das Motiv ist
           jetzt ein ECHTES Bildelement mit eigener Maske: es verliert nach
           links seine Deckkraft und geht damit ins Schwarz der Kachel ueber,
           wo immer seine Kante steht.
       (2) "der gelbe Balken geht viel zu weit, er ueberdeckt sogar das Bild" -
           der Balken lief in der Textspalte mit 92 px rechtem Polster, das
           Motiv ist aber gut doppelt so breit. Statt zu raten wird das Bild
           GEMESSEN und der Balken haelt genau davor an. */
    const bildRef = useRef(null);
    const [bildBreite, setBildBreite] = useState(0);
    useEffect(() => {
      if (!bild) return undefined;
      const el = bildRef.current;
      if (!el || typeof ResizeObserver === "undefined") return undefined;
      const messen = () => setBildBreite(Math.round(el.getBoundingClientRect().width));
      messen();
      const ro = new ResizeObserver(messen);
      ro.observe(el);
      if (el.parentElement) ro.observe(el.parentElement);
      return () => ro.disconnect();
    }, [bild]);
    // Bis die erste Messung da ist, gilt der gemessene Normalfall (~205 px);
    // 55 % deckelt schmale Schirme, damit der Balken nie zum Strich wird.
    const bildFrei = `min(${(bildBreite || 205) + 12}px, 55%)`;
    return (
    <div style={{ position: "relative", background: bild
        ? "#000"
        : `radial-gradient(125% 135% at 50% -10%, ${T.panel2} 0%, ${T.panel} 52%, ${T.bg2} 100%)`,
      border: `1px solid ${T.line}`, borderRadius: T.radius, boxShadow: T.shadow,
      position: "relative", overflow: "hidden",
      // Das gemessene Mass reicht als Variable nach unten durch - der
      // Fortschrittsbalken wird ausserhalb dieser Huelle gebaut und kaeme
      // sonst nicht an die Zahl heran.
      "--gg-bildfrei": bildFrei, ...style }}>
      {bild && <>
        <img ref={bildRef} src={bild} alt="" aria-hidden draggable={false}
          style={{ position: "absolute", top: 0, right: 0, height: "100%", width: "auto", maxWidth: "none",
            objectFit: "cover", pointerEvents: "none",
            // Die Maske sitzt am BILD, nicht an der Kachel: links verlaeuft
            // es ins Nichts und damit ins Schwarz darunter - egal, wo seine
            // Kante gerade steht.
            WebkitMaskImage: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,.35) 22%, rgba(0,0,0,.85) 52%, #000 78%)",
            maskImage: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,.35) 22%, rgba(0,0,0,.85) 52%, #000 78%)" }} />
        {/* Ein leiser Schleier bleibt - er sichert die Schrift, nicht die Kante. */}
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(90deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.34) 46%, rgba(0,0,0,0) 74%)" }} /></>}
      {/* GEMESSEN (v0.46): auf der Karte "Schnelles Spiel" ragte das Wappen
          oben 6 px und unten 2 px aus dem Kopf heraus - seit der CTA-Pille
          dort zwei eigene Griffe abgeloest haben, ist der Kopf kuerzer als
          das 84 px hohe Bild. Der Kopf haelt jetzt Mindesthoehe fuer sein
          Zeichen (84 + Polster). */}
      <button onClick={onGo} style={{ textAlign: "left", fontFamily: "inherit", cursor: "pointer", width: "100%",
        background: "none", border: "none", padding: "16px 16px 14px", display: "block", position: "relative",
        minHeight: art ? 114 : undefined }}>
        {/* Das Zeichen sitzt bei Karten MIT Fliesstext oben statt mittig - so
            laeuft der Fortschrittsbalken nicht mehr unter ihm hindurch. */}
        <div style={{ position: "absolute", right: 12, ...(artTop ? { top: 12 } : { top: "50%", transform: "translateY(-50%)" }),
          opacity: 0.95, filter: "drop-shadow(0 3px 6px rgba(0,0,0,.35))" }}>{art}</div>
        <div className="gg-display" style={{ fontSize: artTop ? 21 : 19, letterSpacing: ".04em", color: T.gold, paddingRight: 92 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: T.dim, marginTop: 4, paddingRight: 92 }}>{sub}</div>
        {/* Fliesstext: nimmt die volle Breite, KEINE absolute Ecke mehr -
            darum ueberlappt hier nichts mehr, egal wie lang der Ortsname ist. */}
        {body && <div style={{ marginTop: 12, fontSize: 12.5, color: T.text, paddingRight: 92 }}>{body}</div>}
        {/* Der Verbindungsstand sass in der rechten unteren Ecke - genau dort,
            wo das Wappen haengt (nachgemessen: 176 px2 Ueberschneidung). Er
            laeuft jetzt im Fliesstext mit, links unter dem Untertitel. */}
        {extra && <div style={{ marginTop: 7, fontSize: 12.5, color: T.text, paddingRight: 92 }}>{extra}</div>}
        {cta && <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, padding: "9px 16px",
          borderRadius: 999, position: "relative", overflow: "hidden", border: "1px solid rgba(255,240,200,.5)",
          background: GOLD_CTA,
          boxShadow: `0 0 12px ${T.gold}55`,
          color: "#17110a", fontWeight: 800, fontSize: 13.5 }}>
          {!ruhig && <span aria-hidden style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "46%", pointerEvents: "none",
            background: "linear-gradient(90deg, transparent, rgba(255,252,235,.4), transparent)",
            animation: `ggShine ${T.mo.sheen} linear ${shineDelay} infinite` }} />}
          <span style={{ position: "relative" }}>{cta}</span>
        </div>}
      </button>
      {children}
    </div>
  ); };
  return (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: hubWide ? "1fr 1fr" : "1fr" }}>
      {/* DER FELDZUG BEKOMMT DEN GROSSEN PLATZ: eigene Zeile ueber die volle
          Breite, groesserer Titel, der Balken laeuft unter dem Text durch
          statt unter dem Zeichen. */}
      <Card title={t("camp.title")} sub={t("hub.campSub")} onGo={onCamp} artTop
        cta={nieGespielt ? t("hub.newCampaign") : t("hub.continue")}
        body={nieGespielt
          ? <span style={{ color: T.dim }}>{t("hub.campFresh")}</span>
          : <>
          <span className="gg-serif" style={{ color: T.gold, letterSpacing: ".06em" }}>{t("camp.leagueNo", { r: ["I","II","III","IV","V"][(profile.campaign?.league || 1) - 1] || profile.campaign?.league })}</span> <span style={{ color: T.faint }}>·</span> <span className="gg-serif" style={{ color: T.dim, letterSpacing: ".06em" }}>{t("story.chapter", { r: roman })} · {en ? ch.titleEn : ch.titleDe}</span><br />
          {/* STATUS OHNE BILDBERUEHRUNG (Besitzer, v0.59): der "Naechste
              Halt" stand hinten ins Motiv hinein - jetzt eigene Zeile mit
              rechtem Polster in Bildbreite, das Motiv bleibt frei. */}
          <span className="gg-serif" style={{ color: T.gold, letterSpacing: ".04em" }}>{t("hub.station", { a: done, b: total })}</span><br />
          <span style={{ display: "inline-block", paddingRight: "min(30%, 130px)" }}>{t("hub.nextStop")}: <b>{cur?.place}</b></span>
          <div style={{ marginTop: 8, paddingRight: "var(--gg-bildfrei, 217px)" }}><Bar pct={Math.max(done / Math.max(1, total), 0.02)} height={5} color={T.gold} /></div></>}
        bild={karteKampagne} art={null} style={{ gridColumn: "1 / -1" }} />
      <Card ruhig title={t("hub.quick")} sub={t("hub.quickSub")} onGo={onQuick} cta={null}
        bild={karteSchnell} art={null}>
        {/* SOFORT LOSLEGEN: ein Griff, keine Konfiguration - gestartet wird
            mit den letzten Einstellungen (oder den Hausvorgaben). "Anpassen"
            fuehrt auf den bisherigen Weg. Zwei ECHTE Knoepfe unterhalb des
            Kopfes, weil Knoepfe in Knoepfen ungueltig sind. Beide Knoepfe
            INHALTSBREIT (v0.57: flex 0 0 auto) - der Besitzer fand den
            gestreckten Gold-Knopf zweimal zu breit, er hatte recht. */}
        {/* GLEICHE HOEHE wie die CTA-Pillen der Nachbarkacheln (9px/16px,
            13,5) - und "Anpassen" traegt das LILA AUSWAHL-GEWAND aus dem
            Profil: violetter Verlauf, leuchtende lila Kontur (T.sel-Familie
            der Segmented-Auswahl). */}
        <div style={{ display: "flex", gap: 8, padding: "0 16px 14px", marginTop: -2 }}>
          <GoldShineButton onClick={onQuickStart || onQuick} style={{ flex: "0 0 auto", padding: "9px 16px", fontSize: 13.5, borderRadius: 999 }}>
            {t("hub.playNow")}</GoldShineButton>
          <button onClick={onQuick} style={{ flex: "0 0 auto", padding: "9px 16px", fontSize: 13, borderRadius: 999,
            fontFamily: "inherit", fontWeight: 800, cursor: "pointer",
            border: `1px solid ${T.selLine}`, color: T.selInk,
            background: `linear-gradient(165deg, ${T.sel}, #1a1030)`,
            boxShadow: `0 0 10px ${T.selGlow}` }}>
            {t("hub.adjust")}</button>
        </div>
      </Card>
      <Card ruhig title={t("online.title")} sub={t("online.sub")} onGo={onOnline}
        cta={hallenStand ? (profile.lang === "en" ? "Play" : "Spielen") : t("online.connect")}
        extra={!SERVER_URL ? <Chip color={"#17110a"} bg={T.gold}>{t("hub.soon")}</Chip>
          : <span title={hallenStand ? (profile.lang === "en" ? "Connected" : "Verbunden")
              : (profile.lang === "en" ? "Not connected" : "Nicht verbunden")}
              data-hallenstand
              style={{ position: "absolute", top: 10, right: 12, // v0.71.1: rechts oben in der Kachel
                display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 800,
                letterSpacing: ".05em", color: hallenStand ? "#cdbcf7" : T.faint }}>
              <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%",
                background: hallenStand ? "#a78bfa" : "rgba(150,150,170,.5)",
                boxShadow: hallenStand ? "0 0 10px #8b5cf6, 0 0 4px #a78bfa" : "none" }} />
              {hallenStand ? (profile.lang === "en" ? "online" : "verbunden")
                : (profile.lang === "en" ? "offline" : "offline")}
            </span>}
        bild={karteOnline} art={null}>
        {/* DIE FERNPARTIEN STEHEN JETZT IN DER KARTE SELBST. Vorher lagen sie
            als eigener Block zwischen den Karten - der Besitzer wollte sie
            dort sehen, wo das Fernduell wohnt. Ein Griff je Partie. */}
        {fernpartien.length > 0 && (
          <div style={{ borderTop: `1px solid ${T.line}`, padding: "10px 12px 12px", display: "grid", gap: 7 }}>
            <div className="gg-serif" style={{ fontSize: 11.5, letterSpacing: ".13em", color: T.gold, textTransform: "uppercase" }}>
              {t("daily.title")}{amZug.length > 0 ? ` \u00b7 ${amZug.length}\u00d7 ${en ? "your move" : "du bist dran"}` : ""}
            </div>
            <div style={{ display: "grid", gap: 6, gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
              {[...amZug, ...fernpartien.filter((g) => !g.yourTurn)].slice(0, 4).map((g) => {
                const tage = g.deadline ? Math.max(0, Math.ceil((g.deadline - Date.now()) / 86400000)) : null;
                return <button key={g.gameId} onClick={() => onOnline && onOnline(g.gameId)}
                  style={{ display: "flex", alignItems: "center", gap: 9, textAlign: "left", cursor: "pointer",
                    fontFamily: "inherit", padding: "10px 12px", borderRadius: 12,
                    background: g.yourTurn ? "linear-gradient(150deg, rgba(139,92,246,.3), rgba(12,10,22,.9) 62%)"
                      : "linear-gradient(150deg, rgba(30,26,44,.55), rgba(10,9,16,.8))",
                    border: `1px solid ${g.yourTurn ? T.riftLine : "rgba(120,110,150,.3)"}`,
                    boxShadow: g.yourTurn ? "0 0 12px rgba(124,58,237,.3)" : "none" }}>
                  <span aria-hidden style={{ width: 9, height: 9, borderRadius: "50%", flex: "0 0 auto",
                    background: g.yourTurn ? T.riftBright : "rgba(150,145,180,.45)",
                    boxShadow: g.yourTurn ? `0 0 9px ${T.riftBright}` : "none" }} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="gg-quill" style={{ display: "block", fontSize: 14, color: T.text,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.opp}</span>
                    <span style={{ display: "block", fontSize: 11, color: g.yourTurn ? T.riftBright : T.faint }}>
                      {g.yourTurn ? (en ? "your move" : "du bist dran") : (en ? "waiting" : "wartet auf ihn")}
                      {tage != null ? ` \u00b7 ${tage}\u202fd` : ""}
                    </span>
                  </span>
                </button>;
              })}
            </div>
          </div>
        )}
      </Card>
      {onTutorial && (
        /* DIE AKADEMIE ALS ECHTE KARTE (Besitzer, v0.68): "mach es wirklich
           genau, genau gleich" - also kein Sonder-Knopf mehr, sondern
           dieselbe Card wie Kampagne, Schnellspiel und Online-Duell: lila
           Flaeche mit Goldkante, Titel und Untertitel LINKS in derselben
           Schrift, Buchmotiv rechts in voller Hoehe hinter dem Schleier.
           Der Text ist kuerzer, der Absprung ein ruhiger Pfeil-CTA wie bei
           der Kampagne - bewusst KEIN Gold-Glanzknopf, die Akademie bleibt
           sekundaer (Anpassen-Klasse, wie vom Besitzer angedacht). */
        <div style={{ gridColumn: "1 / -1" }}>
          <Card ruhig title={t("tut.title")} sub={t("tut.subKurz")} onGo={onTutorial}
            cta={t("tut.cta")} bild={karteAkademie} art={null} />
        </div>
      )}
    </div>
  );
}

function Lock({ t, profile, onUnlock, onBack }) {
  const [pin, setPin] = useState("");
  const [wrong, setWrong] = useState(false);
  async function tryUnlock() {
    if (await verifyPin(pin, profile.pin)) onUnlock();
    else { setWrong(true); setPin(""); }
  }
  return <div style={{ minHeight: "100%", display: "grid", placeItems: "center", padding: 20 }}>
    <Panel style={{ width: "100%", maxWidth: 320, textAlign: "center" }}>
      <div style={{ display: "grid", placeItems: "center", marginBottom: 8 }}><LockIc size={34} color={"#d9b264"} /></div>
      <div style={{ fontWeight: 800, marginBottom: 14 }}>{t("lock.title")}</div>
      <input autoFocus value={pin} type="password" placeholder={t("lock.enter")}
        onChange={(e) => { setWrong(false); setPin(e.target.value.slice(0, 64)); }}
        onKeyDown={(e) => e.key === "Enter" && tryUnlock()}
        style={{ width: "100%", textAlign: "center", letterSpacing: 2, background: T.bg2, border: `1px solid ${wrong ? T.danger : T.line}`, borderRadius: 10, color: T.text, padding: "12px", fontSize: 18, outline: "none", marginBottom: 10 }} />
      {wrong && <div style={{ color: T.danger, fontSize: 13, marginBottom: 10 }}>{t("lock.wrong")}</div>}
      <Button style={{ width: "100%" }} onClick={tryUnlock} disabled={pin.length < 4}>{t("lock.unlock")}</Button>
      {onBack && <button onClick={onBack} className="gg-serif" style={{ background: "none", border: "none",
        color: T.dim, textDecoration: "underline", fontFamily: "inherit", fontSize: 13, cursor: "pointer",
        marginTop: 12, padding: 4 }}>{t("lock.back")}</button>}
    </Panel>
  </div>;
}


// ── first-run game intro (once): what Grand Gambit IS and what makes it
// special — a parchment card in the world's own voice. ───────────────────────
export function GameIntro({ t, dispatch, onStart, en = false }) {
  const [style, setStyle] = useState("painted");    // v1.0.8 (Besitzer): die detailreichen Figuren sind der Standard
  const [diff, setDiff] = useState("easy");
  /* v1.0.5 (Besitzer): "wenn ich mich angemeldet habe, muss ich mir doch
     einen Namen geben - das koennte beim ersten Popup mit drin sein." Genau
     hier ist das erste Popup mit Entscheidungen. Das Feld kommt VORBEFUELLT
     vom Herold (rollTag), der Wuerfel bleibt daneben - ein Tipp reicht, wer
     will, schreibt seinen eigenen. Der Hinweis sagt ehrlich, wofuer der
     Name zaehlt: vor allem fuer Online-Duelle und Ranglisten. */
  /* v1.0.17 (Besitzer): der Herold wuerfelt in der SPRACHE DES SPIELERS.
     Bisher stand die Sprache hier fest auf Deutsch - im englischen Spiel
     schlug er "Eiserner Turm" vor. Die Namenslisten sind laengst
     zweisprachig, nur gefragt wurde nie danach. */
  const [name, setName] = useState(() => rollTag(en));
  const pick = (on) => ({ flex: 1, padding: "9px 6px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
    fontWeight: 800, fontSize: 12.5, letterSpacing: ".02em",
    background: on ? "linear-gradient(165deg, #e0b76c, #b78d43)" : "transparent",
    border: `1px solid ${on ? "rgba(255,240,200,.55)" : T.line}`, color: on ? "#17110a" : T.dim });
  // Dark and quiet like the privacy notice before it — night blue, gold serif,
  // drawn glyphs. The parchment look stays on the campaign map where it lives.
  /* v1.0.28 (Besitzer: "Popup sollte nicht scrollbar sein"): GEMESSEN, nicht
     geschaetzt. Auf einem 320-px-Schirm ragte dieses Blatt um 292 px ueber
     seinen Kasten hinaus - man musste scrollen, um den Start-Knopf zu
     erreichen. Statt Inhalt zu streichen, zieht sich das Blatt auf schmalen
     Geraeten zusammen: Schrift, Zeilenhoehe und Abstaende folgen der
     Schirmbreite. Auf einem normalen Telefon aendert sich nichts. */
  const eng = typeof innerWidth !== "undefined" && innerWidth < 360;
  const Row = ({ icon, children }) => (
    <div style={{ display: "flex", gap: eng ? 8 : 11, alignItems: "flex-start", textAlign: "left" }}>
      <span style={{ width: eng ? 20 : 24, display: "grid", placeItems: "center", flex: "0 0 auto", paddingTop: 1 }}>{icon}</span>
      <span style={{ fontSize: eng ? 11.5 : 13, lineHeight: eng ? 1.32 : 1.55, color: T.dim }}>{children}</span>
    </div>
  );
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "grid", placeItems: "center",
      background: "rgba(8,10,14,.8)", backdropFilter: "blur(3px)", padding: eng ? "6px 6px" : "18px 10px" }}>
      <div style={{ width: "100%", maxWidth: 420, background: `radial-gradient(125% 135% at 50% -10%, #241a3e 0%, ${T.panel} 52%, ${T.bg2} 100%)`,
        border: "1.5px solid rgba(168,130,255,.55)", borderRadius: 16, boxShadow: "0 18px 50px rgba(60,30,120,.55)",
        padding: eng ? "11px 12px 10px" : "22px 20px 18px", textAlign: "center",
        maxHeight: "calc(100dvh - 36px)", overflowY: "auto" }}>
        <div className="gg-serif" style={{ fontSize: eng ? 17 : 21, letterSpacing: ".05em", color: "#cbb6ff" }}>{t("intro.title")}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: eng ? "3px 0" : "10px 0" }}>
          <span style={{ flex: 1, height: 1, background: `${T.gold}44` }} />
          <span style={{ width: 6, height: 6, background: T.gold, transform: "rotate(45deg)" }} />
          <span style={{ flex: 1, height: 1, background: `${T.gold}44` }} />
        </div>
        <div className="gg-serif" style={{ fontSize: eng ? 11.5 : 13.5, fontStyle: "italic", lineHeight: eng ? 1.32 : 1.55, color: T.dim }}>{t("intro.lead")}</div>
        <div style={{ display: "grid", gap: eng ? 5 : 11, margin: eng ? "6px 0 2px" : "15px 0 4px" }}>
          <Row icon={<JewelIc kind="life" size={17} />}>{t("intro.p1")}</Row>
          <Row icon={<SkillIc size={17} />}>{t("intro.p2")}</Row>
          <Row icon={<MapPinIc size={17} />}>{t("intro.p3")}</Row>
        </div>
        {/* THE TWO CHOICES, ASKED ONCE AND UP FRONT: which figures you want to
            look at, and how hard the opponent should think. Both were buried in
            the profile screen, where a new player never looks. Both stay
            changeable there — the note says so, so nobody feels locked in. */}
        <div style={{ marginTop: eng ? 6 : 16, textAlign: "left" }}>
          <div className="gg-serif" style={{ fontSize: 12, letterSpacing: ".12em", color: T.gold }}>{t("setup.name").toUpperCase()}</div>
          <div style={{ display: "flex", gap: 8, margin: "7px 0 4px" }}>
            <input value={name} onChange={(e) => setName(e.target.value.slice(0, 24))}
              placeholder={t("profile.namePh")} autoComplete="off"
              style={{ flex: 1, minWidth: 0, background: T.bg2, border: `1px solid ${T.line}`, borderRadius: 10,
                color: T.text, padding: eng ? "7px 10px" : "9px 12px", fontSize: eng ? 13.5 : 14.5, fontFamily: "inherit", outline: "none" }} />
            <button onClick={() => setName(rollTag(en))} title={t("online.tagRoll")}
              style={{ flex: "0 0 auto", width: 42, borderRadius: 10, border: `1px solid ${T.line}`,
                background: T.bg2, color: T.gold, fontSize: 18, cursor: "pointer" }}>⚄</button>
          </div>
          {!eng && <div style={{ fontSize: 11.5, color: T.faint, lineHeight: 1.45 }}>{t("setup.nameHint")}</div>}   {/* v1.0.28: auf 320px weicht der Hinweis - der Start-Knopf zaehlt mehr */}
          {!name.trim() && <div style={{ fontSize: 11.5, color: "#e0a0a8", fontWeight: 800, marginTop: 4 }}>{t("setup.nameNeed")}</div>}

          <div className="gg-serif" style={{ fontSize: 12, letterSpacing: ".12em", color: T.gold, marginTop: 14 }}>{t("setup.style").toUpperCase()}</div>
          <div style={{ display: "flex", gap: 8, margin: "7px 0 4px" }}>
            {[["svg", t("profile.styleSvg")], ["painted", t("profile.stylePainted")]].map(([v, label]) => (
              <button key={v} onClick={() => setStyle(v)} style={pick(style === v)}>{label}</button>
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: T.faint, lineHeight: 1.45 }}>{t("setup.styleHint")}</div>

          <div className="gg-serif" style={{ fontSize: 12, letterSpacing: ".12em", color: T.gold, marginTop: 14 }}>{t("setup.diff").toUpperCase()}</div>
          <div style={{ display: "flex", gap: 8, margin: "7px 0 4px" }}>
            {[["easy", t("diff.easy")], ["normal", t("diff.normal")], ["hard", t("diff.hard")]].map(([v, label]) => (
              <button key={v} onClick={() => setDiff(v)} style={pick(diff === v)}>{label}</button>
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: T.faint, lineHeight: 1.45 }}>{t("setup.diffHint")}</div>
          <div style={{ fontSize: 11.5, color: T.dim, lineHeight: 1.45, marginTop: 12 }}>{t("setup.lead")}</div>
        </div>
        <button disabled={!name.trim()} onClick={() => {
            /* v1.0.6: DER NAME IST PFLICHT. Vorher liess der Knopf auch ein
               geleertes Feld durch - dann fing zwar der NamensRuf den Spieler
               gleich danach ab, aber zwei Blaetter fuer eine Frage sind eins
               zu viel. Das Feld kommt vorbefuellt, der Wuerfel liegt daneben:
               niemand muss dichten, aber leer geht es nicht hinein. */
            const n = name.trim();
            if (!n) return;
            dispatch({ type: "SET_NAME", name: n });
            dispatch({ type: "SET_PIECE_STYLE", style });
            dispatch({ type: "SET_DIFFICULTY", difficulty: diff });
            dispatch({ type: "SET_NOTICE", key: "intro" }); onStart && onStart();
          }}
          style={{ marginTop: 15, width: "100%", padding: "12px 14px", borderRadius: 10,
            background: "linear-gradient(165deg, #e0b76c, #b78d43)", border: "1px solid rgba(255,240,200,.5)",
            color: "#17110a", fontWeight: 800, fontSize: 14.5, fontFamily: "inherit",
            cursor: "pointer", letterSpacing: ".04em", opacity: name.trim() ? 1 : 0.55 }}>{t("setup.go")}</button>
      </div>
    </div>
  );
}

// ── DER NAMENSRUF (v1.0.5) ──────────────────────────────────────────────────
// Fuer Spielstaende, die noch keinen Namen tragen: ein kleines Blatt, ein
// vorbefuellter Vorschlag, der Wuerfel daneben. Kein Wegklicken ohne Namen -
// aber der eine Tipp auf "Uebernehmen" genuegt, niemand muss dichten.
export function NamensRuf({ t, dispatch, en = false }) {
  /* v1.0.17 (Besitzer): der Herold wuerfelt in der SPRACHE DES SPIELERS.
     Bisher stand die Sprache hier fest auf Deutsch - im englischen Spiel
     schlug er "Eiserner Turm" vor. Die Namenslisten sind laengst
     zweisprachig, nur gefragt wurde nie danach. */
  const [name, setName] = useState(() => rollTag(en));
  const nimm = () => { const n = name.trim(); if (n) dispatch({ type: "SET_NAME", name: n }); };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "grid", placeItems: "center",
      background: "rgba(8,10,14,.78)", backdropFilter: "blur(3px)", padding: "18px 10px" }}>
      <div style={{ width: "100%", maxWidth: 380, background: `radial-gradient(125% 135% at 50% -10%, ${T.panel2} 0%, ${T.panel} 52%, ${T.bg2} 100%)`,
        border: `1px solid ${T.gold}66`, borderRadius: 16, boxShadow: "0 18px 50px rgba(0,0,0,.6)",
        padding: "20px 18px 16px" }}>
        <div className="gg-serif" style={{ fontSize: 19, color: T.goldBright, letterSpacing: ".04em" }}>{t("setup.nameTitle")}</div>
        <div style={{ fontSize: 12.5, color: T.dim, lineHeight: 1.6, margin: "8px 0 12px" }}>{t("setup.nameHint")}</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input value={name} onChange={(e) => setName(e.target.value.slice(0, 24))}
            placeholder={t("profile.namePh")} autoComplete="off"
            onKeyDown={(e) => e.key === "Enter" && nimm()}
            style={{ flex: 1, minWidth: 0, background: T.bg2, border: `1px solid ${T.line}`, borderRadius: 10,
              color: T.text, padding: "10px 12px", fontSize: 15, fontFamily: "inherit", outline: "none" }} />
          <button onClick={() => setName(rollTag(en))} title={t("online.tagRoll")}
            style={{ flex: "0 0 auto", width: 44, borderRadius: 10, border: `1px solid ${T.line}`,
              background: T.bg2, color: T.gold, fontSize: 19, cursor: "pointer" }}>⚄</button>
        </div>
        <button onClick={nimm} disabled={!name.trim()}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,240,200,.5)",
            background: "linear-gradient(165deg, #e0b76c, #b78d43)", color: "#17110a",
            fontFamily: "inherit", fontWeight: 800, fontSize: 14.5, cursor: "pointer",
            opacity: name.trim() ? 1 : 0.55 }}>{t("setup.nameGo")}</button>
      </div>
    </div>
  );
}

// ── first-run privacy notice (no cookies, local save, optional online) ──────
function PrivacyNotice({ t, dispatch }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "grid", placeItems: "center",
      background: "rgba(8,10,14,.78)", backdropFilter: "blur(3px)", padding: "18px 10px" }}>
      <div style={{ width: "100%", maxWidth: 400, background: T.panel, border: `1px solid ${T.gold}66`,
        borderRadius: T.radius, boxShadow: "0 18px 50px rgba(0,0,0,.6)", padding: "20px 18px 16px" }}>
        <div className="gg-serif" style={{ fontSize: 19, color: T.gold, letterSpacing: ".05em" }}>{t("privacy.title")}</div>
        <div style={{ fontSize: 13.5, color: T.dim, lineHeight: 1.6, margin: "10px 0 6px" }}>{t("privacy.body")}</div>
        <div style={{ fontSize: 12.5, color: T.faint, lineHeight: 1.55, marginBottom: 14 }}>
          {t("privacy.online")}{" "}
          <a href="./privacy.html" target="_blank" rel="noreferrer" style={{ color: T.gold }}>{t("privacy.link")}</a>
        </div>
        <Button variant="primary" style={{ width: "100%" }}
          onClick={() => dispatch({ type: "SET_NOTICE", key: "privacy" })}>{t("privacy.ok")}</Button>
      </div>
    </div>
  );
}

// ── ONBOARDING: three one-time lessons that ride the natural progression ──
/* ── WELCHER BUND IST GERADE ERWACHT? (v1.12.0) ──────────────────────────
   Ein Bund erwacht, wenn ALLE seine Figuren die Hoechststufe erreicht haben.
   Das Fenster erscheint genau EINMAL je Bund - gemerkt wird das in
   profile.notices, wie bei den Lehrstunden auch.

   Geprueft wird bei jedem Aufbau der Oberflaeche, nicht beim Aufsteigen
   selbst: so faellt auch der Fall auf, dass jemand mit einem alten Spielstand
   kommt, bei dem der Bund laengst erwacht waere. */
function offenerBund(profile) {
  if (!profile) return null;
  const n = profile.notices || {};
  for (const b of BUND_LISTE) {
    if (n[`bund_${b.id}`]) continue;
    const wach = b.figuren.every((id) => (characterLevel(profile, id) || 0) >= (maxLevelFor(id) || 10));
    if (wach) return b.id;
  }
  return null;
}

function pendingTeach(profile) {
  if (!profile) return null;
  const n = profile.notices || {};
  const cleared = clearedCount(profile);
  const hasExtra = CHARACTER_LIST.some((c) => c.kind !== "P" && c.unlock?.type !== "start" && isUnlocked(c, profile));
  if (hasExtra && !n.teachFormation) return "teachFormation";
  /* v1.0.50: ZWEI LEHRSTUNDEN SIND UMGEZOGEN.
     teachGambitXp stand bei 2 Stationen - da ist der Gambit seit v1.0.50
     noch gar nicht in der Welt (er erwacht bei 3, vorher ist er ein blauer
     Bauer und taucht nirgends auf). Ueber die Erfahrung eines Helden zu
     reden, den es noch nicht gibt, waere ein Loch in der Erzaehlung. Jetzt
     kommt sie EINE Station NACH dem Erwachen, wenn sie zum ersten Mal
     zutrifft.
     teachGambitPos ist ganz gefallen: sie feuerte bei 3 Stationen - im
     selben Atemzug wie die held-FREIGABE, die woertlich dasselbe sagt
     ("Vor jeder Partie darfst du entscheiden, in welcher Spalte er
     antritt"). Zwei Fenster nacheinander mit einem Inhalt sind keins zu
     viel, sondern zwei. */
  if (cleared >= 4 && !n.teachGambitXp) return "teachGambitXp";
  return null;
}
function TeachPopup({ which, t, dispatch }) {
  const map = { teachFormation: ["teach.formationTitle", "teach.formationBody"],
    teachGambitXp: ["teach.gambitXpTitle", "teach.gambitXpBody"],
    teachGambitPos: ["teach.gambitPosTitle", "teach.gambitPosBody"] };
  const [tk, bk] = map[which];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 62, display: "grid", placeItems: "center",
      background: "rgba(8,10,14,.8)", backdropFilter: "blur(3px)", padding: "18px 10px" }}>
      <div style={{ width: "100%", maxWidth: 400, background: T.panel, border: `1px solid ${T.gold}77`,
        borderRadius: T.radius, boxShadow: "0 18px 50px rgba(0,0,0,.6)", padding: "20px 18px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, background: T.gold, transform: "rotate(45deg)", flex: "0 0 auto" }} />
          <div className="gg-serif" style={{ fontSize: 18.5, color: T.gold, letterSpacing: ".04em" }}>{t(tk)}</div>
        </div>
        <div style={{ fontSize: 13.5, color: T.dim, lineHeight: 1.6, margin: "8px 0 14px" }}>{t(bk)}</div>
        <button onClick={() => dispatch({ type: "SET_NOTICE", key: which })}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 10,
            background: "linear-gradient(165deg, #e0b76c, #b78d43)", border: "1px solid rgba(255,240,200,.5)",
            color: "#17110a", fontWeight: 800, fontSize: 14.5, fontFamily: "inherit", cursor: "pointer", letterSpacing: ".04em" }}>
          {t("teach.ok")}</button>
      </div>
    </div>
  );
}

/* ── DAS FREIGABE-FENSTER (v1.0.44) ─────────────────────────────────────────
   Die Lehrstunden oben erklaeren, wie man etwas tut. Dieses Fenster sagt,
   dass etwas AUFGEGANGEN ist - der Held erwacht, die hintere Reihe oeffnet
   sich, die Lebenspunkte kommen. Titel und Text stehen nicht hier, sondern
   bei der Freigabe selbst (meta/freigaben.js), damit Bedingung und
   Erklaerung nicht auseinanderlaufen koennen: eine neue Freigabe OHNE Text
   ist so gar nicht erst schreibbar.

   Es teilt sich den Merker mit den Lehrstunden (profile.notices, SET_NOTICE),
   nur mit dem Praefix "frei:". Ein zweiter Topf waere eine zweite Wahrheit.

   Vorrang: erst Datenschutz, Auftakt und Namensruf, dann die Lehrstunden,
   dann das hier - und nie waehrend einer Partie. Wer gerade zieht, will
   kein Fenster. */
function FreigabeFenster({ freigabe, en, dispatch }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 63, display: "grid", placeItems: "center",
      background: "rgba(8,10,14,.82)", backdropFilter: "blur(3px)", padding: "18px 10px" }}>
      <div style={{ width: "100%", maxWidth: 400, background: T.panel,
        border: `1px solid ${T.gold}88`, borderRadius: T.radius,
        boxShadow: `0 18px 50px rgba(0,0,0,.6), 0 0 34px ${T.gold}22`, padding: "20px 18px 16px" }}>
        <div className="gg-serif" style={{ fontSize: 10.5, letterSpacing: ".18em",
          color: "#a78bfa", textTransform: "uppercase", marginBottom: 7 }}>
          {en ? "Something has opened" : "Etwas hat sich geöffnet"}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, background: T.gold, transform: "rotate(45deg)", flex: "0 0 auto" }} />
          <div className="gg-serif" style={{ fontSize: 18.5, color: T.gold, letterSpacing: ".04em" }}>
            {en ? freigabe.titelEn : freigabe.titelDe}</div>
        </div>
        <div style={{ fontSize: 13.5, color: T.dim, lineHeight: 1.6, margin: "8px 0 14px" }}>
          {en ? freigabe.textEn : freigabe.textDe}</div>
        <button onClick={() => dispatch({ type: "SET_NOTICE", key: merkschluessel(freigabe.id) })}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 10,
            background: "linear-gradient(165deg, #e0b76c, #b78d43)", border: "1px solid rgba(255,240,200,.5)",
            color: "#17110a", fontWeight: 800, fontSize: 14.5, fontFamily: "inherit",
            cursor: "pointer", letterSpacing: ".04em" }}>
          {en ? "Understood" : "Verstanden"}</button>
      </div>
    </div>
  );
}

// ── DIE KLANGREGIE ──────────────────────────────────────────────────────────
// Meldet den Profilschalter an die Klangschicht und waermt die Puffer vor,
// damit der erste Zug nicht auf das Entschluesseln wartet.
function KlangRegie({ an, laut = 1 }) {
  useEffect(() => {
    klangEinstellen({ ein: an, lautstaerke: 0.6 * Math.max(0, Math.min(1, laut)) });
    if (an) klangVorwaermen();
    klangUeberall();   /* v1.0.3: jeder Knopf ohne eigenen Klang tippt leise */
  }, [an, laut]);
  return null;
}
