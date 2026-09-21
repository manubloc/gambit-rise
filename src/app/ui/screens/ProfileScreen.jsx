import { useState, useEffect, useMemo } from "react";
import { CAMPAIGN12 } from "../../../content/campaign12.gen.js";
import { MAX_KAPITEL } from "../../config.js";
import { hashPin } from "../../../platform/index.js";
import { SPAR_POSTEN, sparsam } from "../sparmodus.js";
import { animAn, setAnimAn } from "../anim.js";
import { serializeSave, parseSave, listRestorePoints, readSnapshot, withProgressPct, listReports, clearLocalReports, getAdminToken, setAdminToken, deleteAccount , adminHasDefaultPass } from "../../../meta/index.js";
import { CHARACTERS } from "../../../content/index.js";
import { T } from "../theme.js";
import { Panel, Button, Segmented, Stat, PanelTitle, Toggle } from "../primitives.jsx";
import { GildedFrame, goldText, GoldRule } from "../Gilded.jsx";
import { FeedbackPanel, rubrikWort } from "./FeedbackPanel.jsx";
import { ZeitBalken } from "../ZeitBalken.jsx";
import { lautVon, merkeLaut } from "../lautstaerke.js";   /* v1.26.2 */


/* Das Namensfeld: bearbeiten, pruefen, speichern. Der Name steht an zwei
   Stellen - im Profil (Anzeige, Spielstand) und am Konto (Eindeutigkeit).
   Gespeichert wird erst am Konto, und nur wenn das gelingt, im Profil. */
function NamenFeld({ profile, dispatch, account, en }) {
  const [entwurf, setEntwurf] = useState(profile.name || "");
  const [meldung, setMeldung] = useState(null);
  const [laeuft, setLaeuft] = useState(false);
  const TEXTE = en
    ? { save: "Save", ok: "Saved.", "name-short": "At least 2 characters.", "name-long": "At most 24 characters.",
        "name-taken": "That name is already taken.", "not-found": "Account not found.", hint: "Unique online - the server checks it.",
        "server-unreachable": "The server can't be reached - the name can't be checked right now.",
        "server-old": "The server doesn't check names yet - it needs to be redeployed." }
    : { save: "Speichern", ok: "Gespeichert.", "name-short": "Mindestens 2 Zeichen.", "name-long": "Höchstens 24 Zeichen.",
        "name-taken": "Diesen Namen trägt schon jemand.", "not-found": "Konto nicht gefunden.", hint: "Online einzigartig - der Server prüft ihn.",
        "server-unreachable": "Der Server ist nicht erreichbar - der Name kann gerade nicht geprüft werden.",
        "server-old": "Der Server prüft Namen noch nicht - er muss neu ausgerollt werden." };
  const geaendert = entwurf.trim().replace(/\s+/g, " ") !== (profile.name || "");
  const speichern = async () => {
    if (!geaendert || laeuft) return;
    setLaeuft(true); setMeldung(null);
    try {
      /* v1.27.2 (Besitzer: "auf jeden Fall muss der Server pruefen, denn er
         muss online eindeutig sein"). ERST der Server, dann das Geraet. Ist
         der Server nicht erreichbar, wird NICHT gespeichert - sonst waere die
         Eindeutigkeit wieder nur eine Hoffnung. */
      const { HALL_HTTP } = await import("../../config.js");
      const kennung = profile.online?.id || "";
      let antwort = null;
      try {
        const r = await fetch(`${HALL_HTTP}/name-frei?n=${encodeURIComponent(entwurf.trim())}&id=${encodeURIComponent(kennung)}`);
        antwort = r.ok ? await r.json() : { fehlt: r.status };
      } catch { antwort = null; }
      if (!antwort) throw new Error("server-unreachable");
      if (antwort.fehlt) throw new Error("server-old");
      if (antwort.frei === false) throw new Error("name-taken");
      const { renameAccount } = await import("../../../meta/accounts.js");
      const neu = account && account.id ? await renameAccount(account.id, entwurf) : entwurf.trim().replace(/\s+/g, " ");
      dispatch({ type: "REPLACE", profile: { ...profile, name: neu } });
      setEntwurf(neu); setMeldung({ ok: true, text: TEXTE.ok });
    } catch (e) {
      setMeldung({ ok: false, text: TEXTE[e?.message] || String(e?.message || e) });
    } finally { setLaeuft(false); }
  };
  return <div>
    <div style={{ display: "flex", gap: 8 }}>
      <input value={entwurf} maxLength={24} onChange={(e) => { setEntwurf(e.target.value); setMeldung(null); }}
        onKeyDown={(e) => e.key === "Enter" && speichern()} autoComplete="nickname"
        style={{ flex: 1, minWidth: 0, padding: "11px 12px", background: T.bg2, border: `1px solid ${T.line}`, borderRadius: 10,
          color: T.text, fontSize: 15, fontWeight: 800, fontFamily: "inherit", outline: "none" }} />
      <button onClick={speichern} disabled={!geaendert || laeuft}
        style={{ padding: "0 14px", borderRadius: 10, fontFamily: "inherit", fontWeight: 800, fontSize: 13,
          cursor: geaendert && !laeuft ? "pointer" : "default",
          background: geaendert ? "linear-gradient(172deg, rgba(40,24,72,.97) 0%, rgba(14,9,28,.99) 100%)" : "#151827",
          color: geaendert ? T.riftBright : "#8d94ad", border: `1px solid ${geaendert ? T.riftLine : "#3d4666"}`,
          opacity: laeuft ? 0.6 : 1 }}>{TEXTE.save}</button>
    </div>
    <div style={{ fontSize: 11, marginTop: 5, lineHeight: 1.4,
      color: meldung ? (meldung.ok ? "#9fd6a8" : "#e0a0a8") : T.faint }}>{meldung ? meldung.text : TEXTE.hint}</div>
  </div>;
}

export function ProfileScreen({ profile, dispatch, t, account, onSwitchSave, onLogout }) {
  const en = profile.lang === "en";
  const [devPct, setDevPct] = useState(0); // workbench: journey progress slider
  /* v1.0.97: die Kapitelliste der Werkbank faellt aus der Kampagne heraus. */
  const LIGEN_DER_KAMPAGNE = useMemo(() => {
    const s = new Set();
    for (const n of CAMPAIGN12) { const l = n.league ?? n.liga; if (l) s.add(l); }
    /* v1.1.10: die freie Fassung reicht nur bis MAX_KAPITEL - auch auf der
       Werkbank, sonst koennte ein Admin in ein Kapitel setzen, das die
       ausgelieferte Fassung nicht kennt. */
    return [...s].filter((l) => l <= MAX_KAPITEL).sort((a, b) => a - b);
  }, []);
  const [devLg, setDevLg] = useState(profile.campaign?.league || 1); // workbench: league pick — applied together with the dial via SETZEN
  const [pin, setPin] = useState("");
  /* v1.0.17: steht beim Admin noch das mitgelieferte Standardwort? Die Antwort
     kommt asynchron (der Vergleich hasht), also wird sie einmal geholt und
     faellt auf "nein" zurueck - eine falsche Warnung waere schlimmer als
     keine. */
  const [defaultPass, setDefaultPass] = useState(false);
  useEffect(() => {
    let lebt = true;
    adminHasDefaultPass().then((ja) => { if (lebt) setDefaultPass(!!ja && account?.email === "admin"); }).catch(() => {});
    return () => { lebt = false; };
  }, [account?.email]);
  // the version check: what the server is serving RIGHT NOW, next to what this
  // device is running. cache:"no-store" skips the http cache, and version.json
  // sits outside the sw precache glob — the answer is always the deployed
  // truth. This is how "did the deploy land?" and "is my phone stuck on an old
  // build?" become two different, visible answers instead of one guess.
  const [srvVer, setSrvVer] = useState(null); // null = unknown (offline/dev)
  useEffect(() => {
    let on = true;
    fetch("./version.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (on && j && typeof j.version === "string") setSrvVer(j.version); })
      .catch(() => {});
    return () => { on = false; };
  }, []);
  const s = profile.stats;

  // the stuck-cache hammer: drop the service worker, then reload — the fresh
  // sw registers and activates immediately (skipWaiting + clientsClaim), and
  // the page comes back on the server's build.
  async function hardReload() {
    try { sessionStorage.removeItem("gg-sw-kick"); } catch {}
    try { const r = await navigator.serviceWorker?.getRegistration?.(); if (r) await r.unregister(); } catch {}
    window.location.reload();
  }

  async function setPinProtect() {
    if (pin.length < 4) return;
    const record = await hashPin(pin);
    dispatch({ type: "SET_PIN", pin: record });
    setPin("");
  }

  return <div style={{ display: "grid", gap: 12 }}>
    <GildedFrame center pad="15px 16px 13px">
      <div className="gg-serif" style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: ".3em",
        ...goldText, filter: "drop-shadow(0 1px 1px rgba(0,0,0,.5))" }}>{t("profile.title")}</div>
      <GoldRule margin="8px 18%" />
      {/* v1.0.4: HIER STEHT NUR DER NAME IM SPIEL. Darunter stand bisher der
          Kontoname - und der wurde aus der E-Mail gebildet, stand also
          faktisch die E-Mail-Adresse auf dem Schirm. Die Anmeldung ist eine
          Tuer, kein Name; wer als Admin angemeldet ist, sieht das am Rang,
          nicht an seiner Adresse. */}
      <div className="gg-serif" style={{ fontSize: 22, letterSpacing: ".04em", color: T.goldBright }}>
        {profile.name || t("profile.namePh")}</div>
      {account?.isAdmin && <div style={{ fontSize: 12, color: T.gold, marginTop: 3, letterSpacing: ".08em" }}>Admin</div>}
      {/* v0.82 (Besitzer): SPIELSTAND WECHSELN und ABMELDEN gehoeren nach OBEN,
          zum Namen - dorthin, wo jeder sie erwartet. Vorher standen sie weit
          unten hinter Schwierigkeit und Figurenstil; man musste scrollen, um
          sich abzumelden. Das ist keine Kleinigkeit: es ist die Handlung, die
          man am haeufigsten sucht, wenn man das Profil ueberhaupt oeffnet. */}
      {(onSwitchSave || onLogout) && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
          {onSwitchSave && <Button kind="ghost" onClick={onSwitchSave}>{t("profile.switchSave")}</Button>}
          {onLogout && <Button kind="ghost" onClick={onLogout}>{t("profile.signout")}</Button>}
        </div>
      )}
    </GildedFrame>
    <Panel>
      <div style={{ fontSize: 12, color: T.faint, marginBottom: 6 }}>{t("profile.name")}</div>
      {/* v1.27.0 (Besitzer): der Name ist AENDERBAR. v1.0.8 hatte ihn
          festgeschrieben, weil er Anmeldename werden sollte - das ist nie
          geschehen, angemeldet wird mit E-Mail oder Google. Eindeutig bleibt
          er: das Konto prueft vor dem Speichern, dass kein anderes ihn traegt. */}
      <NamenFeld profile={profile} dispatch={dispatch} account={account} en={profile.lang === "en"} />
      {/* v0.99 (Besitzerwunsch): LAUTSTAERKE EINSTELLBAR - bisher gab es nur
          an und aus. Zwei getrennte Regler, weil Musik und Spielklaenge
          verschieden empfunden werden: viele wollen die Musik leise im
          Hintergrund, die Zuege aber deutlich hoeren. */}
      {/* v1.0.2 (Besitzer): EIN Regler je Klangart - kein zusaetzlicher
          Schalter mehr. Ganz nach links heisst aus; das ist dieselbe
          Handlung an derselben Stelle statt zweier Bedienelemente, die
          dasselbe meinen. */}
      {[["musikLaut", "sound", "Musik"], ["klangLaut", "sfx", "Soundeffekte"]].map(([schl, schalter, wort]) => {
        const wert = lautVon(profile, schl === "musikLaut" ? "musik" : "klang");   /* v1.26.2 */
        return (
        <div key={schl} style={{ margin: "12px 0 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.faint, marginBottom: 4 }}>
            <span>{wort}</span>
            <span style={{ color: wert <= 0 ? T.faint : T.dim }}>{wert <= 0 ? "aus" : Math.round(wert * 100) + " %"}</span>
          </div>
          <input type="range" min="0" max="100" step="5"
            value={Math.round(wert * 100)}
            onChange={(e) => { const v = Number(e.target.value) / 100;
              merkeLaut(schl === "musikLaut" ? "musik" : "klang", v);   /* v1.26.2: ueberlebt jeden Spielstandwechsel */
              dispatch({ type: "REPLACE", profile: { ...profile, [schl]: v, [schalter]: v > 0 } }); }}
            className="gg-regler" style={{ width: "100%", "--gg-fuell": Math.round(wert * 100) + "%" }} />
        </div>);
      })}
      <div style={{ fontSize: 12, color: T.faint, margin: "14px 0 6px" }}>{t("profile.pieceStyle")}</div>
      <Segmented value={profile.pieceStyle === "svg" ? "svg" : "painted"}
        onChange={(v) => dispatch({ type: "REPLACE", profile: { ...profile, pieceStyle: v } })}
        options={[{ value: "painted", label: t("profile.stylePainted") }, { value: "svg", label: t("profile.styleSvg") }]} />
      <div style={{ fontSize: 11.5, color: T.faint, margin: "5px 2px 0", lineHeight: 1.45 }}>{t("profile.pieceStyleHint")}</div>
      {/* v1.0.8 (Besitzer): NUR die Regler. Die alten An/Aus-Schalter
          darunter sagten dasselbe zweimal - sie sind fort. */}
      <div style={{ fontSize: 12, color: T.faint, margin: "14px 0 6px" }}>{t("profile.lang")}</div>
      <Segmented value={profile.lang} onChange={(v) => dispatch({ type: "SET_LANG", lang: v })}
        options={[{ value: "de", label: "Deutsch" }, { value: "en", label: "English" }]} />
      <div style={{ fontSize: 12, color: T.faint, margin: "14px 0 6px" }}>{t("profile.campDiff")}</div>
      <Segmented value={profile.campDifficulty || "normal"} onChange={(v) => dispatch({ type: "SET_CAMP_DIFFICULTY", difficulty: v })}
        options={[{ value: "gentle", label: t("profile.diffGentle") }, { value: "normal", label: t("profile.diffNormal") }, { value: "brutal", label: t("profile.diffBrutal") }]} />
      <div style={{ fontSize: 11.5, color: T.gold, margin: "6px 2px 0", letterSpacing: 0.2 }}>
        {t("profile.campDiffElo_" + (profile.campDifficulty || "normal"))}</div>
      <div style={{ fontSize: 11.5, color: T.faint, margin: "3px 2px 0", lineHeight: 1.45 }}>{t("profile.campDiffHint")}</div>
      <div style={{ fontSize: 11.5, color: T.faint, marginTop: 5, lineHeight: 1.45 }}>{t("profile.artHint")}</div>
      {/* v1.0.7 (Besitzer): auch der stille Install-Weg ist fort - die App
          kommt kuenftig allein aus dem Play Store ("ich will erstmal alle
          nur ueber Google bekommen"). Web bleibt voll spielbar, wirbt aber
          nicht mehr fuer die Installation. */}
    </Panel>

    <Panel>
      <div className="gg-serif" style={{ fontSize: 15, letterSpacing: ".1em", textTransform: "uppercase", color: T.dim }}>{t("profile.record")}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
        <Stat label={t("profile.wins")} value={s.wins || 0} />
        <Stat label={t("profile.losses")} value={s.losses || 0} />
        <Stat label={t("profile.draws")} value={s.draws || 0} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
        <Stat label={t("profile.games")} value={s.games || 0} />
        <Stat label={t("profile.winrate")} value={`${Math.round(100 * (s.wins || 0) / Math.max(1, (s.wins || 0) + (s.losses || 0)))}%`} />
        <Stat label={t("profile.bestStreak")} value={s.bestStreak || 0} />
      </div>
    </Panel>

    <Panel>
      <div className="gg-serif" style={{ fontSize: 15, letterSpacing: ".1em", textTransform: "uppercase", color: T.dim }}>{t("profile.journey")}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
        <Stat label={t("profile.stages")} value={s.stagesCleared || 0} />
        <Stat label={t("profile.bosses")} value={s.bossKills || 0} />
        <Stat label={t("profile.recruits")} value={s.recruits || 0} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
        <Stat label={t("profile.upgrades")} value={s.upgrades || 0} />
        <Stat label={t("profile.captures")} value={s.captures || 0} />
        <Stat label={t("profile.xpTotal")} value={profile.xpEarned || 0} />
      </div>
      {profile.online?.rating != null && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12,
          padding: "10px 12px", background: T.panel2, borderRadius: T.radiusSm, border: `1px solid ${T.gold}44` }}>
          <span className="gg-serif" style={{ fontSize: 13, letterSpacing: ".08em", color: T.dim }}>ELO · {t("online.title")}</span>
          <span style={{ fontWeight: 900, fontSize: 18, color: T.gold }}>{profile.online.rating}</span>
        </div>
      )}
    </Panel>

    {/* ── DIE VERWALTUNG (Besitzer, v0.74.1) ──────────────────────────────
        Wer als Admin angemeldet ist, findet hier EINE Tuer zu allen
        Unterseiten - Portal, Spielerbuch, Werkstatt, Musterkammer und die
        oeffentliche Landingpage. Fuer alle anderen existiert der Block nicht. */}
    {account?.isAdmin && <Panel>
      <div className="gg-serif" style={{ fontSize: 13, letterSpacing: ".12em", textTransform: "uppercase",
        color: T.goldBright, marginBottom: 8 }}>Verwaltung</div>
      <div style={{ display: "grid", gap: 6 }}>
        {/* v1.0.1: das Admin-Portal ist fort - es war nur eine zweite Tuer zu
            denselben Werkbaenken, die hier schon stehen. */}
        {[
          ["?spielerbuch", "Das Spielerbuch", "Spieler, Fortschritt, Herkunft, Zahlen"],
          ["?werkstatt", "Die Figurenwerkstatt", "Figurenpaare malen und ausspielen"],
          ["?klangwerkstatt", "Die Klangwerkstatt", "Alle Klänge abhören, wie sie im Spiel klingen"],
          /* v1.0.68 (Besitzer): die Animationskammer bekommt ihre Tuer in der
             Verwaltung - bisher stand sie nur als nackte Adresse im
             Hinweistext des Schalters, und wer die Liste hier als DEN Zugang
             zu allen Werkbaenken kennt, haette sie nie gefunden. */
          ["?animkammer", "Die Animationskammer", "Alle Bewegungen des Spiels vorführen, an- und ausschalten"],
          ["?galerie", "Die Musterkammer", "Farben, Knöpfe, Bausteine"],
          ["/landing.html", "Die Landingpage", "Die öffentliche Seite"]].map(([ziel, name, was]) => (
          <a key={ziel} href={ziel} target={ziel.startsWith("/landing") ? "_blank" : undefined}
            rel={ziel.startsWith("/landing") ? "noreferrer" : undefined}
            style={{ display: "block", textDecoration: "none", color: "inherit", borderRadius: 10,
              border: `1px solid ${T.selLine}44`, background: `linear-gradient(165deg, ${T.sel}, #1a1030)`,
              padding: "9px 11px" }}>
            <div className="gg-serif" style={{ fontSize: 13.5, color: T.goldBright, letterSpacing: ".03em" }}>{name}</div>
            <div style={{ fontSize: 11, color: T.dim, marginTop: 1 }}>{was}</div>
          </a>
        ))}
      </div>
    </Panel>}

    {account?.isAdmin && <Panel>
      {/* v1.1.0 (Besitzerentscheid): DIE DESIGN-WAHL IST FORT. "Ich moechte
          eigentlich nur das geschnitzt-helle Design. Das andere kannst du
          alles loeschen - ich moechte die App jetzt glattziehen." Das Haus
          traegt eine Livree; sie steht als Konstante in livery.js und laesst
          sich nicht mehr umstellen, auch nicht von der Halle. Damit fallen
          hier drei Dinge weg: die Umschaltung, der Knopf "Fuer alle Spieler
          uebernehmen" und der Erklaertext dazu. Was die Spieler weiter
          waehlen, ist Detailreich oder Simpel - das ist eine andere Frage
          (Brettfiguren, nicht Livree) und bleibt. */}
      <PanelTitle tag="Admin">{t("profile.saveTitle")}</PanelTitle>
      <div style={{ fontSize: 12, color: T.dim, margin: "2px 0 12px" }}>{t("profile.saveHint")}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Button variant="subtle" onClick={() => {
          const blob = new Blob([serializeSave(profile)], { type: "application/json" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = `grand-gambit-save-${new Date().toISOString().slice(0, 10)}.json`;
          a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        }}>⬇ {t("profile.saveExport")}</Button>
        <Button variant="subtle" onClick={() => {
          const inp = document.createElement("input");
          inp.type = "file"; inp.accept = ".json,application/json";
          inp.onchange = async () => {
            const f = inp.files?.[0]; if (!f) return;
            try {
              const next = parseSave(await f.text());
              if (confirm(t("profile.saveConfirm"))) dispatch({ type: "REPLACE", profile: next });
            } catch { alert(t("profile.saveBad")); }
          };
          inp.click();
        }}>⬆ {t("profile.saveImport")}</Button>
      </div>
    </Panel>}

    {account?.isAdmin && <Panel>
      <PanelTitle tag="Admin">{t("profile.devTitle")}</PanelTitle>
      <div style={{ fontSize: 12, color: T.dim, margin: "2px 0 10px" }}>{t("profile.devHint")}</div>
      {/* UMBRECHEN (Besitzer, v0.60): zehn Knoepfe in einer nowrap-Zeile
          sprengten am Handy die Kachelbreite - der Grund, warum das
          Profil unterm Admin breiter war als alle anderen Reiter. */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <span className="gg-serif" style={{ fontSize: 12.5, color: T.dim }}>{t("profile.devLeague")}</span>
        {/* v1.0.97 (Besitzer: "da fehlen die Stufen elf und zwoelf"): DIE
            WERKBANK KANNTE NUR ZEHN KAPITEL. Die Kampagne hat aber ZWOELF -
            gemessen an campaign12.gen.js: 529 Stationen, Ligen 1 bis 12. Wer
            die letzten beiden Kapitel testen wollte, kam gar nicht hin. Die
            Liste wird jetzt aus der Kampagne selbst abgeleitet, nicht
            abgeschrieben: eine feste Zahl hier ist am Tag des dreizehnten
            Kapitels wieder falsch, und niemand merkt es. */}
        {LIGEN_DER_KAMPAGNE.map((lg) => (
          <button key={lg} onClick={() => setDevLg(lg)}
            title={t("profile.devApplyHint")}
            style={{ minWidth: 26, padding: "5px 4px", borderRadius: 7, cursor: "pointer", fontFamily: "inherit",
              fontWeight: 800, fontSize: 11.5,
              background: devLg === lg ? T.gold : T.panel2,
              color: devLg === lg ? "#241a08" : T.text,
              border: `1px solid ${devLg === lg ? T.gold : T.line}` }}>{lg}</button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
        <span className="gg-serif" style={{ fontSize: 12.5, color: T.dim, whiteSpace: "nowrap" }}>{t("profile.devProgress")}</span>
        <input type="range" min="0" max="100" step="5" value={devPct} onChange={(e) => setDevPct(+e.target.value)}
          style={{ flex: 1, accentColor: T.gold }} />
        <span style={{ color: T.text, fontWeight: 800, width: 42, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{devPct}%</span>
        <Button variant="subtle" style={{ padding: "7px 12px", fontSize: 12.5 }} onClick={() => dispatch({ type: "REPLACE",
          profile: withProgressPct(profile, devPct, devLg) })}>{t("profile.devApply")}</Button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Button variant="subtle" onClick={() => dispatch({ type: "REPLACE",
          profile: { ...profile, campaign: { ...profile.campaign, unlocked: Object.keys(CHARACTERS) } } })}>
          ⚜ {t("profile.devUnlockAll")}</Button>
        <Button variant="subtle" onClick={() => dispatch({ type: "REPLACE",
          profile: { ...profile, gold: (profile.gold || 0) + 1000, sp: (profile.sp || 0) + 50 } })}>
          ✦ {t("profile.devFunds")}</Button>
      </div>
    </Panel>}

    {account?.isAdmin && <Panel>
      <PanelTitle tag="Admin">{t("profile.rpTitle")}</PanelTitle>
      <div style={{ fontSize: 12, color: T.dim, margin: "2px 0 10px" }}>{t("profile.rpHint")}</div>
      <RestorePoints t={t} dispatch={dispatch} />
    </Panel>}

    {/* v1.0.3: JEDER darf melden - Absturz, Balance, Wunsch, mit Bild.
        Die Meldung faehrt denselben Weg wie die Absturzberichte und landet
        beim Admin im selben Stapel. */}
    <Panel>
      <PanelTitle>{t("profile.fbTitle")}</PanelTitle>
      <FeedbackPanel t={t} en={en} account={account} />
    </Panel>
    {account?.isAdmin && <Panel>
      <PanelTitle tag="Admin">{t("profile.reportsTitle")}</PanelTitle>
      <div style={{ fontSize: 12, color: T.dim, margin: "2px 0 10px" }}>{t("profile.reportsHint")}</div>
      <ErrorReports t={t} />
    </Panel>}

    {/* v1.0.8 (Besitzer): "Passwort setzen" hiess bisher die Geraete-Sperre -
        das klang nach dem Anmelde-Passwort. Jetzt gibt es BEIDES, klar
        getrennt: hier das echte Konto-Passwort, darunter die Sperre. */}
    {/* v1.0.17 (Besitzer, Backlog "Admin-Defaultpasswort"): DER ADMIN WAR HIER
        AUSGESPERRT (email !== "admin") - er konnte sein mitgeliefertes
        Standardwort also gar nicht aendern, weshalb der Punkt seit Monaten
        offen stand. Jetzt darf jedes lokale Konto sein Passwort aendern, und
        solange das Standardwort steht, sagt es die Karte deutlich. */}
    {/* ── DER SPARMODUS (v1.0.37) ─────────────────────────────────────────
        Vier Zeichenposten, einzeln abschaltbar. Sie stehen hier, weil das
        Ruckeln auf dem GERAET des Besitzers auftritt und nicht auf meinem
        Messplatz - wer umlegt, sieht in Sekunden, welcher Posten es ist.
        Die teuersten zuerst, damit der erste Versuch der beste ist. */}
    <Panel>
      <PanelTitle>{t("profile.sparTitle")}</PanelTitle>
      <div style={{ fontSize: 12, color: T.dim, margin: "2px 0 12px", lineHeight: 1.5 }}>{t("profile.sparHint")}</div>
      <div style={{ display: "grid", gap: 10 }}>
        {SPAR_POSTEN.map((posten) => {
          const an = !profile.spar?.[posten];   // AN heisst: der Posten wird gezeichnet
          return <label key={posten} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={an} style={{ marginTop: 3, width: 18, height: 18, flex: "0 0 auto", accentColor: T.gold }}
              onChange={() => dispatch({ type: "SET_SPAR", posten, an: an })} />
            <span style={{ minWidth: 0 }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: T.ink }}>{t(`profile.spar.${posten}`)}</span>
              <span style={{ display: "block", fontSize: 11.5, color: T.faint, lineHeight: 1.45, marginTop: 1 }}>
                {t(`profile.spar.${posten}Hint`)}</span>
            </span>
          </label>;
        })}
      </div>
      {sparsam() && <div style={{ fontSize: 11.5, color: "#f0c98a", marginTop: 12, padding: "8px 10px", borderRadius: 8,
        background: "rgba(216,164,65,.12)", border: "1px solid rgba(216,164,65,.4)", lineHeight: 1.45 }}>
        {t("profile.sparAktiv")}</div>}

      {/* ── DIE SICHT AUF DEN GEGNER (v1.0.50 -> v1.0.62) ────────────────────
          Der Besitzer hat gewaehlt: die TOENUNG (farbige Figur, lila
          Sockel-Glut) ist der Standard fuer ALLE Spieler. Die drei Stile
          zum Ausprobieren sieht nur noch der Admin - als Werkzeug, nicht
          als Einstellung. Der klassische Satz bleibt immer unberuehrt. */}
      {/* v1.0.83 (Besitzerentscheid): DIE WAHL IST FORT, weil es nichts mehr
          zu waehlen gibt - "entferne diesen lila-gold Style, nur schwarz-weiss
          beim Sockel ist interessant, die Option kann weg". Es bleibt der
          Animationsschalter darunter. Die Sockelglut selbst bleibt: Gegner
          schwarz, eigene Seite weiss, je Figur gemessen (v1.0.72/76/80). */}
      {account?.isAdmin && <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${T.line}` }}>
        {/* v1.0.67: DER EINE SCHALTER FUER ALLE ANIMATIONEN. Er schreibt in
            den Geraetespeicher (gg:anim) - dieselbe Stelle, die Brett, Banner
            und Figurenblatt zur Zeichenzeit lesen. Die Kammer (?animkammer)
            fuehrt jede Bewegung einzeln vor. */}
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.line}` }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink, marginBottom: 6 }}>Animationen</div>
          <AnimSchalter />
          <div style={{ fontSize: 11, color: T.faint, marginTop: 7, lineHeight: 1.45 }}>
            Gilt fuer dieses Geraet und wirkt ueberall: Zugschweif, Schlagarten, Drachenfeuer,
            lebende Aufstellung, Schachpuls, Koenigsfall, Muenzregen, gestaffelte Beute,
            Verbessern-Glanz. Einzeln vorfuehren: die Animationskammer unter Verwaltung.</div>
        </div>
      </div>}
    </Panel>

    {account?.provider === "local" && <Panel>
      <PanelTitle>{t("profile.pwTitle")}</PanelTitle>
      {defaultPass && <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "#f0c98a", margin: "2px 0 10px",
        padding: "9px 11px", borderRadius: 9, background: "rgba(216,164,65,.13)", border: "1px solid rgba(216,164,65,.45)" }}>
        {t("profile.pwDefaultWarn")}</div>}
      <div style={{ fontSize: 12, color: T.dim, margin: "2px 0 10px" }}>{t("profile.pwHint")}</div>
      <PasswortAendern t={t} account={account} onDone={() => setDefaultPass(false)} />
    </Panel>}
    <Panel>
      <PanelTitle>{t("profile.pinTitle")}</PanelTitle>
      <div style={{ fontSize: 12, color: T.dim, margin: "2px 0 12px" }}>{t("profile.pinHint")}</div>
      {profile.pin
        ? <Button variant="ghost" onClick={() => dispatch({ type: "SET_PIN", pin: null })} style={{ width: "100%" }}>{t("profile.clearPin")}</Button>
        : <div style={{ display: "flex", gap: 8 }}>
            <input value={pin} onChange={(e) => setPin(e.target.value.slice(0, 64))} placeholder={t("profile.pinPh")} type="password" autoComplete="new-password"
              style={{ flex: 1, background: T.bg2, border: `1px solid ${T.line}`, borderRadius: 10, color: T.text, padding: "11px 12px", fontSize: 16, outline: "none" }} />
            <Button onClick={setPinProtect} disabled={pin.length < 4}>{t("profile.setPin")}</Button>
          </div>}
    </Panel>

    {/* v1.0.5: DIE LETZTE TUER. Loeschen ist endgueltig - darum eingeklappt,
        mit Klartext, was faellt, und beim lokalen Konto mit Passwort. Das
        eingebaute admin-Konto ist ausgenommen. */}
    {account && account.email !== "admin" && <Panel>
      <PanelTitle>{t("profile.delTitle")}</PanelTitle>
      <KontoLoeschen t={t} account={account} onLogout={onLogout} />
    </Panel>}

    <div style={{ textAlign: "center", fontSize: 11.5, color: T.faint, padding: "4px 0 10px" }}>
      Grand Gambit v{typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev"}
      {srvVer && (srvVer === (typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev")
        ? <> · Server v{srvVer} ✓</>
        : <> · <span style={{ color: T.gold }}>Server v{srvVer}</span> —{" "}
            <span onClick={hardReload} style={{ color: T.gold, textDecoration: "underline", cursor: "pointer" }}>
              {t("profile.srvReload")}</span></>)}
      {" "}·{" "}
      <a href="./privacy.html" target="_blank" rel="noreferrer" style={{ color: T.dim }}>{t("profile.privacy")}</a> ·{" "}
      <a href="./terms.html" target="_blank" rel="noreferrer" style={{ color: T.dim }}>{t("profile.terms")}</a>
    </div>

  </div>;
}


// one report, formatted as plain text ready to paste straight into a chat
// with Claude (or anywhere else) — every field a debugger would want, in a
// readable order, no JSON braces to wade through.
function reportText(r, t) {
  const fmt = (iso) => { try { return new Date(iso).toLocaleString(); } catch { return iso; } };
  const L = [
    `[Grand Gambit — ${t("profile.reportsTitle")}]`,
    `${fmt(r.created_at)} · v${r.version || "?"} · ${r.kind || "?"}`,
  ];
  if (r.account) L.push(`Konto/Account: ${r.account}`);
  if (r.url) L.push(`URL: ${r.url}`);
  if (r.ua) L.push(`Geraet/UA: ${r.ua}`);
  L.push("", r.message || "(kein Text)");
  if (r.note) L.push("", `Notiz/Note: ${r.note}`);
  if (r.stack) L.push("", "Stack:", r.stack);
  if (Array.isArray(r.log) && r.log.length) {
    L.push("", "Letzte Ereignisse/Recent log:");
    for (const l of r.log.slice(-15)) L.push(`[${l.kind}] ${l.msg}`);
  }
  return L.join("\n");
}

// copies text to the clipboard, flashing a brief "copied" confirmation —
// falls back to the old execCommand trick if the async Clipboard API isn't
// available (some embedded/older webviews).
function CopyBtn({ text, label, t, style }) {
  const [copied, setCopied] = useState(false);
  const doCopy = async (e) => {
    e.stopPropagation();
    try { await navigator.clipboard.writeText(text); }
    catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        document.execCommand("copy"); document.body.removeChild(ta);
      } catch { return; }
    }
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };
  return <Button kind="ghost" onClick={doCopy} style={{ fontSize: 11.5, whiteSpace: "nowrap", ...style }}>
    {copied ? t("profile.reportsCopied") : "⧉ " + label}
  </Button>;
}

function ErrorReports({ t }) {
  const [state, setState] = useState({ loading: true, source: "", rows: [], error: "" });
  const [open, setOpen] = useState(null);
  const [tok, setTok] = useState(() => getAdminToken());
  const [savedTok, setSavedTok] = useState(() => getAdminToken());
  const load = () => {
    setState((s) => ({ ...s, loading: true }));
    listReports({ limit: 120 }).then((r) => setState({ loading: false, source: r.source, rows: r.rows || [], error: r.error || "" }))
      .catch(() => setState({ loading: false, source: "local", rows: [], error: "offline" }));
  };
  useEffect(() => { load(); }, []);
  const saveToken = () => { setAdminToken(tok.trim()); setSavedTok(tok.trim()); load(); };
  /* v1.0.3 (Besitzerwunsch): das Admin-Wort EINMAL eingeben. Ist eines
     gespeichert und die Halle nimmt es an, klappt das Feld zu einer Zeile
     zusammen; erst ein 401 oder "aendern" holt es zurueck. Spielerbuch und
     Berichte teilen denselben Speicherplatz (gg_admin_token). */
  const [wortOffen, setWortOffen] = useState(() => !getAdminToken());
  useEffect(() => { if (state.error === "unauthorized") setWortOffen(true); }, [state.error]);
  const fmt = (iso) => { try { return new Date(iso).toLocaleString(); } catch { return iso; } };
  return <div>
    {/* the read token: paste the Worker's ADMIN_TOKEN once to see ALL devices */}
    {!wortOffen && savedTok ? (
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, fontSize: 12, color: T.dim }}>
        <span style={{ color: "#7fd6a0" }}>✓</span> {t("profile.reportsSaved")}
        <button onClick={() => setWortOffen(true)} style={{ background: "none", border: "none",
          color: T.gold, cursor: "pointer", fontFamily: "inherit", fontSize: 12, padding: 0,
          textDecoration: "underline" }}>{t("profile.reportsChange")}</button>
      </div>
    ) : (
    <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
      <input value={tok} onChange={(e) => setTok(e.target.value)} placeholder={t("profile.reportsToken")} type="password" autoComplete="off"
        style={{ flex: 1, background: T.bg2, border: `1px solid ${savedTok ? T.line : "#a9853f"}`, borderRadius: 10, color: T.text, padding: "10px 12px", fontSize: 14, outline: "none" }} />
      <Button onClick={() => { saveToken(); setWortOffen(false); }} disabled={!tok.trim()}>{t("profile.reportsTokenSave")}</Button>
    </div>
    )}
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
      <Button kind="ghost" onClick={load}>{t("profile.reportsRefresh")}</Button>
      <span style={{ fontSize: 11.5, color: state.error === "unauthorized" ? "#e0574f" : T.faint }}>
        {state.loading ? t("profile.reportsLoading")
          : state.error === "unauthorized" ? t("profile.reportsBadToken")
          : state.source === "hall" ? t("profile.reportsCloud") + " · " + state.rows.length
          : state.error === "no-token" ? t("profile.reportsNeedToken")
          : t("profile.reportsLocal") + " · " + state.rows.length}</span>
      <div style={{ flex: 1 }} />
      {state.rows.length > 0 &&
        <CopyBtn t={t} label={t("profile.reportsCopyAll")}
          text={state.rows.map((r) => reportText(r, t)).join("\n\n" + "—".repeat(24) + "\n\n")} />}
      {state.source === "local" && state.rows.length > 0 &&
        <Button kind="ghost" onClick={() => { clearLocalReports(); load(); }}>{t("profile.reportsClear")}</Button>}
    </div>
    {state.rows.length > 0 && <div style={{ fontSize: 11, color: T.faint, marginTop: -4, marginBottom: 10 }}>{t("profile.reportsCopyAllHint")}</div>}
    {/* v1.0.3: die Berichte als Kurve - wann haeuft sich etwas? */}
    {state.rows.length > 1 && <div style={{ border: `1px solid ${T.line}`, borderRadius: 10,
      background: T.bg2, padding: "9px 11px", marginBottom: 10 }}>
      <ZeitBalken titel={t("profile.reportsChart")} farbe="#e0574f"
        zeiten={state.rows.map((r) => Date.parse(r.created_at)).filter(Boolean)} tage={30} />
    </div>}
    {state.loading ? null : state.rows.length === 0
      ? <div style={{ fontSize: 12.5, color: T.dim, padding: "6px 0" }}>{t("profile.reportsEmpty")}</div>
      : <div style={{ display: "grid", gap: 6, maxHeight: 340, overflowY: "auto" }}>
          {state.rows.map((r, i) => {
            const isOpen = open === i;
            const isCrash = r.kind === "crash";
            return <div key={i} style={{ border: `1px solid ${T.line}`, borderRadius: 9, overflow: "hidden" }}>
              <button onClick={() => setOpen(isOpen ? null : i)} style={{ width: "100%", textAlign: "left",
                background: T.bg2, border: "none", color: T.text, padding: "9px 11px", cursor: "pointer", display: "flex", gap: 8, alignItems: "baseline" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", flex: "0 0 auto", alignSelf: "center",
                  background: isCrash ? "#e0574f" : "#c9a45c" }} />
                <span style={{ fontSize: 12.5, fontWeight: 700, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.message || "(kein Text)"}</span>
                {r.rubrik && <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: ".03em",
                  color: "#241a08", background: "linear-gradient(180deg,#f0d68f,#d3ae5c)",
                  borderRadius: 999, padding: "2px 7px", whiteSpace: "nowrap" }}>{rubrikWort(r.rubrik, false)}</span>}
                {Array.isArray(r.bilder) && r.bilder.length > 0 && <span style={{ fontSize: 10.5, color: T.faint }}>🖼{r.bilder.length}</span>}
                <span style={{ fontSize: 10.5, color: T.faint, whiteSpace: "nowrap" }}>v{r.version || "?"}</span>
              </button>
              {isOpen && <div style={{ padding: "9px 11px", fontSize: 11.5, color: T.dim, lineHeight: 1.5, background: T.bg }}>
                <div>{fmt(r.created_at)}{r.account ? " · " + r.account : ""}</div>
                <div style={{ color: T.faint, marginTop: 3, wordBreak: "break-word" }}>{r.ua}</div>
                {r.note && <div style={{ marginTop: 6, color: T.text }}>{r.note}</div>}
                {Array.isArray(r.bilder) && r.bilder.length > 0 && <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  {r.bilder.map((b, j) => typeof b === "string" && b.startsWith("data:image")
                    ? <a key={j} href={b} target="_blank" rel="noreferrer">
                        <img src={b} alt="" style={{ maxHeight: 110, maxWidth: "100%", borderRadius: 8, border: `1px solid ${T.line}`, display: "block" }} />
                      </a>
                    : null)}
                </div>}
                {r.stack && <pre style={{ marginTop: 6, whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 10.5, color: T.faint, fontFamily: "monospace" }}>{r.stack}</pre>}
                {Array.isArray(r.log) && r.log.length > 0 && <div style={{ marginTop: 6, color: T.faint }}>
                  {r.log.slice(-6).map((l, j) => <div key={j} style={{ fontFamily: "monospace", fontSize: 10 }}>[{l.kind}] {l.msg}</div>)}
                </div>}
                <div style={{ marginTop: 8 }}>
                  <CopyBtn t={t} label={t("profile.reportsCopyOne")} text={reportText(r, t)} />
                </div>
              </div>}
            </div>;
          })}
        </div>}
  </div>;
}

function RestorePoints({ t, dispatch }) {
  const [points, setPoints] = useState(null);
  useEffect(() => { let on = true; listRestorePoints().then((l) => on && setPoints(l)); return () => { on = false; }; }, []);
  if (!points) return <div style={{ fontSize: 12, color: T.faint }}>…</div>;
  if (!points.length) return <div style={{ fontSize: 12.5, color: T.faint }}>{t("profile.rpNone")}</div>;
  const fmt = (ts) => new Date(ts).toLocaleString(undefined, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  return (
    <div style={{ display: "grid", gap: 6, maxHeight: 210, overflowY: "auto" }}>
      {points.map((e) => (
        <div key={e.ts} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 10px",
          background: T.panel2, borderRadius: T.radiusSm, border: `1px solid ${T.line}` }}>
          <span style={{ fontSize: 12.5, flex: 1 }}>
            <b>{fmt(e.ts)}</b>
            <span style={{ color: T.faint, fontSize: 11.5 }}> · {t("profile.rpMeta", { league: e.league, gold: e.gold })}</span>
          </span>
          <Button variant="subtle" style={{ padding: "6px 11px", fontSize: 12 }} onClick={() => {
            try {
              const prof = readSnapshot(e);
              if (confirm(t("profile.rpConfirm", { when: fmt(e.ts) }))) dispatch({ type: "REPLACE", profile: prof });
            } catch { alert(t("profile.saveBad")); }
          }}>↩ {t("profile.rpRestore")}</Button>
        </div>
      ))}
    </div>
  );
}

function KontoLoeschen({ t, account, onLogout }) {
  const [offen, setOffen] = useState(false);
  const [pass, setPass] = useState("");
  const [stand, setStand] = useState(null); // null | "laeuft" | fehlerwort
  const brauchtPass = account?.provider === "local";
  const los = async () => {
    setStand("laeuft");
    try {
      const r = await deleteAccount(account.id, pass);
      // Ehrlich sagen, was mit der Halle wurde - dann raus.
      const rest = r.halle.versucht - r.halle.geloescht;
      if (rest > 0) alert(t("profile.delHalleRest", { n: rest }));
      onLogout && onLogout();
    } catch (e) {
      setStand(e?.message === "wrong-pass" ? t("profile.delWrongPass") : t("profile.delFail"));
    }
  };
  if (!offen) return <>
    <div style={{ fontSize: 12.5, color: T.dim, lineHeight: 1.55, marginBottom: 10 }}>{t("profile.delHint")}</div>
    {/* v1.26.9 (Besitzer: "der Button Konto loeschen ist immer noch komisch,
        die Schrift hat so eine seltsame Farbe - zieh auch dort alles glatt").
        v1.4.3 hatte nur den ZWEITEN Knopf (endgueltig loeschen) auf
        gedaempftes Rot gebracht - dieser erste, der das Loeschen oeffnet, trug
        weiter das Violett der Riss-Magie. Jetzt dieselbe Farbe wie sein
        Nachfolger: man sieht an beiden, dass es ums Loeschen geht. */}
    <button onClick={() => setOffen(true)}
      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(214,92,104,.55)",
        background: "linear-gradient(165deg, #52202a, #34141c)", color: "#f0b8bf",
        fontFamily: "inherit", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>{t("profile.delOpen")}</button>
  </>;
  return <div>
    <div style={{ fontSize: 12.5, color: T.text, lineHeight: 1.6, marginBottom: 10 }}>{t("profile.delWhat")}</div>
    {brauchtPass && <input type="password" value={pass} onChange={(e) => setPass(e.target.value)}
      placeholder={t("profile.delPass")} autoComplete="current-password"
      style={{ width: "100%", boxSizing: "border-box", background: T.bg2, border: `1px solid ${T.line}`,
        borderRadius: 10, color: T.text, padding: "10px 12px", fontSize: 14, outline: "none", marginBottom: 10 }} />}
    {typeof stand === "string" && stand !== "laeuft" &&
      <div style={{ fontSize: 12, color: "#e0a0a8", marginBottom: 8 }}>{stand}</div>}
    <div style={{ display: "flex", gap: 8 }}>
      <Button kind="ghost" onClick={() => { setOffen(false); setPass(""); setStand(null); }} style={{ flex: 1 }}>{t("profile.delBack")}</Button>
      <button onClick={los} disabled={stand === "laeuft" || (brauchtPass && !pass)}
        /* v1.4.3 (Besitzerbefund: "Warum ist der Knopf 'Konto endgueltig
           loeschen' so komisch von der Farbgebung?"): ER TRUG VIOLETT - die
           Farbe der Riss-Magie, die im ganzen Spiel fuer Zauber und
           Fortschritt steht. Ausgerechnet der Knopf, der alles ungeschehen
           macht, sah aus wie eine Belohnung. Jetzt gedaempftes Rot: warnend,
           aber nicht schreiend - er soll erkennbar sein, nicht anziehend. */
        style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(214,92,104,.55)",
          background: "linear-gradient(165deg, #52202a, #34141c)", color: "#f0b8bf",
          fontFamily: "inherit", fontWeight: 800, fontSize: 13, cursor: "pointer",
          opacity: stand === "laeuft" || (brauchtPass && !pass) ? 0.55 : 1 }}>
        {stand === "laeuft" ? t("profile.delLaeuft") : t("profile.delGo")}
      </button>
    </div>
  </div>;
}

function PasswortAendern({ t, account, onDone }) {
  const [alt, setAlt] = useState("");
  const [neu, setNeu] = useState("");
  const [wort, setWort] = useState(null);
  const los = async () => {
    setWort(null);
    try {
      const { changePassword } = await import("../../../meta/accounts.js");
      await changePassword(account.id, alt, neu);
      setWort("ok"); setAlt(""); setNeu(""); onDone && onDone();
    } catch (e) { setWort(e?.message === "wrong-pass" ? "falsch" : "fehler"); }
  };
  const feld = { width: "100%", boxSizing: "border-box", background: T.bg2, border: `1px solid ${T.line}`,
    borderRadius: 10, color: T.text, padding: "10px 12px", fontSize: 14, outline: "none", marginBottom: 8 };
  return <div>
    <input type="password" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder={t("profile.pwOld")} autoComplete="current-password" style={feld} />
    <input type="password" value={neu} onChange={(e) => setNeu(e.target.value)} placeholder={t("profile.pwNew")} autoComplete="new-password" style={feld} />
    {wort === "ok" && <div style={{ fontSize: 12, color: "#9fdcae", marginBottom: 8 }}>{t("profile.pwOk")}</div>}
    {wort === "falsch" && <div style={{ fontSize: 12, color: "#e0a0a8", marginBottom: 8 }}>{t("profile.pwWrong")}</div>}
    {wort === "fehler" && <div style={{ fontSize: 12, color: "#e0a0a8", marginBottom: 8 }}>{t("profile.delFail")}</div>}
    <Button onClick={los} disabled={!alt || neu.length < 6} style={{ width: "100%" }}>{t("profile.pwGo")}</Button>
    <div style={{ fontSize: 11.5, color: T.faint, marginTop: 8, lineHeight: 1.45 }}>{t("profile.pwReset")}</div>
  </div>;
}

/* v1.0.67: der Animations-Hauptschalter - gleicher Bau wie in der Kammer. */
function AnimSchalter() {
  const [an, setAn] = useState(animAn());
  return <button onClick={() => { setAnimAn(!an); setAn(!an); }}
    style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 13px", borderRadius: 999,
      cursor: "pointer", fontFamily: "inherit", fontWeight: 800, fontSize: 12.5,
      background: an ? "linear-gradient(180deg, rgba(227,192,122,.26), rgba(227,192,122,.12))" : T.bg2,
      border: an ? "1px solid rgba(227,192,122,.6)" : `1px solid ${T.line}`,
      color: an ? T.gold : T.dim }}>
    <span style={{ width: 30, height: 18, borderRadius: 99, position: "relative",
      background: an ? T.gold : "#3a4058", transition: "background .2s" }}>
      <span style={{ position: "absolute", top: 2, left: an ? 14 : 2, width: 14, height: 14,
        borderRadius: "50%", background: "#0d1017", transition: "left .2s" }} /></span>
    {an ? "An" : "Aus"}
  </button>;
}
