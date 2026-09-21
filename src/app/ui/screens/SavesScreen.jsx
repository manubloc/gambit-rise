// Career select — every account keeps several save slots, each documenting
// its league, cleared count, percentage and total playtime. Admins get the
// progress dial: any slot can be set to 0…100% in journey order.
import { useEffect, useState } from "react";
import { T } from "../theme.js";
import { RissBoden } from "../RissBoden.jsx";
import { TrashIc } from "../icons.jsx";
import { logoArt } from "../livery.js";
import { LeagueShield } from "../LeagueShield.jsx";
import { listSaves, createSave, deleteSave, renameSave, loadSave, writeSave,
  migrateLegacyInto, fmtPlaytime, adminHasDefaultPass } from "../../../meta/index.js";

const STR = {
  de: { hello: "Willkommen", pick: "Wähle deinen Spielstand", new: "+ Neuer Spielstand", play: "Weiterspielen",
    league: "Kapitel", time: "Spielzeit", last: "Zuletzt", del: "Löschen", delSure: "Wirklich löschen?", rename: "Umbenennen",
    empty: "Noch kein Spielstand — beginne deine erste Reise.", logout: "Abmelden",
    admin: "Admin · Spielfortschritt", adminHint: "Setzt den gewählten Spielstand auf einen Fortschritt (Reihenfolge der Reise).",
    apply: "Anwenden", zero: "0 %", full: "100 %", namePh: "Name des Spielstands", },
  en: { hello: "Welcome", pick: "Choose your save", new: "+ New save", play: "Continue",
    league: "League", time: "Playtime", last: "Last played", del: "Delete", delSure: "Really delete?", rename: "Rename",
    empty: "No saves yet — begin your first journey.", logout: "Sign out",
    admin: "Admin · game progress", adminHint: "Sets the selected save to a progress level (in journey order).",
    apply: "Apply", zero: "0 %", full: "100 %", namePh: "Save name", },
};
const ROMAN = ["I","II","III","IV","V","VI","VII","VIII","IX","X"];
const fmtDate = (ts, lang) => new Date(ts).toLocaleDateString(lang === "de" ? "de-DE" : "en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" });

export function SavesScreen({ account, onOpen, onLogout, initialLang = "de", __testSaves = null }) {
  const [lang, setLang] = useState(initialLang);
  const en = lang === "en";
  const [saves, setSaves] = useState(__testSaves);
  const [confirmDel, setConfirmDel] = useState(null);
  const [adminPct, setAdminPct] = useState(100);
  const s = STR[lang];

  const refresh = async () => setSaves(await listSaves(account.id));
  useEffect(() => { (async () => {
    if (__testSaves) return;   // harness: keep injected slots
    await migrateLegacyInto(account.id);
    await refresh();
  })(); }, [account.id]);

  const open = async (slot) => { const p = await loadSave(account.id, slot.id); if (p) onOpen(slot, p); };
  const create = async () => { const e = await createSave(account.id, null); const p = await loadSave(account.id, e.id); onOpen(e, p); };

  const card = { background: T.panel, border: `1px solid ${T.line}`, borderRadius: 16, padding: "13px 14px", boxShadow: T.shadow };
  return (
    <div style={{ height: "calc(100dvh / var(--vhz, 1))", overflowY: "auto", overscrollBehavior: "none", background: T.savesBg, padding: "14px 16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* v1.0.95: derselbe Rissboden wie auf dem Anmeldeschirm (Stufe 1) -
          die Spielstaende sind der zweite Raum vor dem Haus. */}
      <RissBoden profile={null} />
      <button onClick={() => setLang(lang === "de" ? "en" : "de")} style={{ position: "absolute", top: "calc(12px + env(safe-area-inset-top))", right: "calc(14px + env(safe-area-inset-right))",
        background: "none", border: `1px solid ${T.line}`, color: T.dim, borderRadius: 999, padding: "5px 12px",
        fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>{lang === "de" ? "EN" : "DE"}</button>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      {/* the emblem greets returning strategists too — same night sky, no glow */}
      <img src={logoArt()} alt="Grand Gambit" draggable={false} style={{ width: "min(94vw, 620px)", maxHeight: "32vh",
        objectFit: "cover", display: "block", marginTop: 0, marginBottom: 38,
        WebkitMaskImage: "radial-gradient(ellipse 78% 74% at 50% 50%, #000 42%, rgba(0,0,0,.6) 70%, transparent 95%)",
        maskImage: "radial-gradient(ellipse 78% 74% at 50% 50%, #000 42%, rgba(0,0,0,.6) 70%, transparent 95%)" }} />
      <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, letterSpacing: ".13em",
        fontSize: "clamp(19px, 5.2vw, 30px)", lineHeight: 1.15, textAlign: "center", marginTop: -22, marginBottom: 14,
        background: `linear-gradient(180deg, ${T.goldBright} 0%, ${T.gold} 52%, ${T.lime} 100%)`,
        WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
        filter: "drop-shadow(0 2px 12px rgba(0,0,0,.9))" }}>GRAND GAMBIT</div>
      <div className="gg-serif" style={{ color: T.dim, fontSize: 13.5, letterSpacing: ".05em", margin: "2px 0 2px" }}>
        {/* v1.0.4: OHNE KONTONAMEN. Er kam aus der E-Mail und stand damit
            gross auf dem ersten Schirm nach der Anmeldung - genau das soll
            nie passieren. Der Name im Spiel haengt am Spielstand, nicht am
            Konto, und steht auf den Karten darunter. */}
        {s.hello}
        {account.isAdmin && <span style={{ color: T.gold }}> · Admin</span>}
        <button onClick={onLogout} className="gg-serif" style={{ background: "none", border: "none", color: T.faint,
          textDecoration: "underline", fontSize: 12.5, letterSpacing: ".05em", cursor: "pointer", marginLeft: 8 }}>{s.logout}</button>
      </div>
      {/* ALS GAST SPIELT MAN AUF SAND: nichts wird gesichert, und die Halle
          bleibt zu. Das gehoert VOR die Spielstandsliste, nicht in eine
          Fussnote - sonst merkt man es erst, wenn der Fortschritt weg ist. */}
      {account.provider === "guest" && (
        <div style={{ width: "min(100%, 520px)", margin: "6px 0 14px", padding: "12px 14px", borderRadius: 14,
          background: "radial-gradient(130% 120% at 50% -12%, rgba(124,58,237,.2) 0%, rgba(22,16,34,.92) 46%, rgba(10,8,16,.96) 100%)",
          border: "1px solid rgba(167,139,250,.55)", boxShadow: "0 0 16px rgba(124,58,237,.22)" }}>
          <div className="gg-quill" style={{ fontSize: 16.5, color: "#e6dcff", marginBottom: 5 }}>
            {en ? "You are playing as a guest" : "Du spielst als Gast"}</div>
          <div className="gg-serif" style={{ fontSize: 12.5, lineHeight: 1.55, color: "#c3b8d4" }}>
            {en
              ? "Nothing is saved: close the app and your progress is gone — every start begins anew. Online duels stay closed as well; they need an account. Create one at any time to keep your court and enter the Hall."
              : "Es wird nichts gesichert: Schließt du die App, ist dein Fortschritt fort — jeder Start beginnt von vorn. Auch die Online-Duelle bleiben zu, dafür braucht es ein Konto. Du kannst jederzeit eins anlegen, dann bleibt dein Hofstaat erhalten und die Halle steht dir offen."}
          </div>
        </div>
      )}
      <div className="gg-serif" style={{ color: T.goldBright, fontSize: 14.5, letterSpacing: ".08em", margin: "8px 0 12px",
        display: "flex", alignItems: "center", gap: 8 }}>
        <span aria-hidden style={{ width: 5, height: 5, background: T.gold, transform: "rotate(45deg)" }} />
        {s.pick}
        <span aria-hidden style={{ width: 5, height: 5, background: T.gold, transform: "rotate(45deg)" }} />
      </div>
      

      <div style={{ width: "100%", maxWidth: 430, display: "flex", flexDirection: "column", gap: 10 }}>
        {saves && saves.length === 0 && <div style={{ color: T.dim, fontSize: 14, textAlign: "center", padding: "12px 0" }}>{s.empty}</div>}
        {(saves || []).map((sv, i) => (
          <div key={sv.id} style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <LeagueShield league={sv.league || 1} size={58} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <div className="gg-serif" style={{ fontSize: 16.5, color: T.text, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sv.name}</div>
                  <div style={{ color: T.gold, fontWeight: 800, fontSize: 15 }}>{sv.pct ?? 0}%</div>
                </div>
                <div style={{ color: T.dim, fontSize: 12.5, margin: "3px 0 8px" }}>
                  {s.league} {ROMAN[(sv.league || 1) - 1] || sv.league} · {sv.clearedCount ?? 0}/{sv.total ?? "–"} · {s.time} {fmtPlaytime(sv.playtimeSec)} · {s.last} {fmtDate(sv.updatedAt || sv.createdAt, lang)}
                </div>
              </div>
            </div>
            <div style={{ height: 5, background: "#0d1017", borderRadius: 99, overflow: "hidden", marginBottom: 10 }}>
              <div style={{ width: `${sv.pct ?? 0}%`, height: "100%", background: `linear-gradient(90deg, ${T.gold}bb, ${T.gold})` }} />
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={() => open(sv)} style={{ flex: 1, position: "relative", overflow: "hidden",
                /* Derselbe Goldverlauf wie der Knopf im Anmeldeschirm - die
                   Eingangsstrecke soll durchgehend gleich aussehen. Der zweite
                   und jeder weitere Spielstand bleibt zurueckhaltend, damit klar
                   ist, welcher der zuletzt gespielte ist. */
                background: i === 0
                  ? `linear-gradient(180deg, ${T.goldBright} 0%, ${T.gold} 46%, ${T.lime} 100%)`
                  : "rgba(201,164,92,.24)",
                border: i === 0 ? `1.5px solid ${T.goldBright}` : `1px solid ${T.line}`,
                color: i === 0 ? T.limeInk : T.text, borderRadius: 11,
                boxShadow: i === 0 ? `0 6px 18px rgba(0,0,0,.45), 0 0 14px ${T.gold}55` : "none",
                padding: "13px 14px", fontFamily: "inherit", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
                {i === 0 && <span aria-hidden style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "42%",
                  background: "linear-gradient(90deg, transparent, rgba(255,244,210,.3), transparent)",
                  animation: "ggShine 11s ease-in-out 2.7s infinite", pointerEvents: "none" }} />}
                ▶ {s.play}
              </button>
              <button onClick={() => { const n = prompt(s.rename, sv.name); if (n != null) renameSave(account.id, sv.id, n).then(refresh); }}
                style={{ background: "none", border: `1px solid ${T.line}`, color: T.dim, borderRadius: 11, padding: "10px 11px", fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}>✎</button>
              {/* v1.26.9: kein Loeschen mehr hier - das geschieht unter Profil,
                  ueber "Konto loeschen" (Besitzerentscheid, nur EIN Spielstand). */}
            </div>

          </div>
        ))}
        {/* v1.26.9 (Besitzer: "Ich moechte nur einen Spielstand haben. Man
            sollte nicht mehrere erschaffen koennen. Loeschen ist ok - aber
            unter Profil, am besten ueber Konto loeschen.") Der Knopf fuer einen
            neuen Stand erscheint nur noch, solange es KEINEN gibt. */}
        {(saves || []).length === 0 && <button onClick={create} style={{ background: "none", border: `1.5px dashed ${T.gold}66`, color: T.gold,
          borderRadius: 16, padding: "14px", fontFamily: "inherit", fontWeight: 800, fontSize: 14.5, cursor: "pointer" }}>
          <LeagueShield league={1} size={26} dim style={{ verticalAlign: "-7px", marginRight: 8 }} />{s.new}
        </button>}
      </div>
      </div>
      <div style={{ marginTop: "auto", paddingTop: 14, color: "rgba(240,233,216,.28)", fontSize: 10.5,
        letterSpacing: ".08em" }}>v{typeof __GG_VERSION__ !== "undefined" ? __GG_VERSION__ : "dev"}</div>
    </div>
  );
}
