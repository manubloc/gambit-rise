// Leaderboards — your realm against the world.
// Shown as the second tab of the trophy screen: own stats up top, then three
// boards (progress %, fastest run, fewest moves) with an explicit share
// button. Boards ride the shared storage layer, so they turn truly online the
// moment Supabase is configured.
import { useEffect, useState } from "react";
import { T } from "../theme.js";
import { TrophyIc } from "../icons.jsx";
import { Panel, Button } from "../primitives.jsx";
import { progressPct, totalBestMoves, fmtMs, fmtPlaytime, fetchBoard, submitScore, cloudConfigured,
  clearedCount, campaignLength } from "../../../meta/index.js";

const STR = {
  de: { own: "Dein Spielfortschritt", boards: { progress: "Fortschritt", fastrun: "Schnellster Durchlauf", moves: "Wenigste Züge" },
    share: "Bestwert teilen", shared: "Geteilt ✓", copy: "Als Text kopieren", copied: "Kopiert ✓",
    league: "Kapitel", time: "Spielzeit", run: "Durchlauf (Kapitel I)", movesSum: "Züge gesamt (Bestwerte)", stages: "Stationen",
    empty: "Noch keine Einträge — teile deinen Bestwert als Erster!",
    offline: "Diese Liste gilt bisher nur auf diesem Gerät. Sobald das Online-Konto eingerichtet ist (SUPABASE-SETUP.md), vergleichen sich hier alle Spieler.",
    noRun: "Beende Kapitel I für deine Durchlauf-Zeit.", you: "du" },
  en: { own: "Your progress", boards: { progress: "Progress", fastrun: "Fastest run", moves: "Fewest moves" },
    share: "Share best", shared: "Shared ✓", copy: "Copy as text", copied: "Copied ✓",
    league: "League", time: "Playtime", run: "Run (League I)", movesSum: "Total moves (bests)", stages: "stages",
    empty: "No entries yet — be the first to share!",
    offline: "This board is device-local for now. Once the online account is configured (SUPABASE-SETUP.md), every player compares here.",
    noRun: "Finish League I for your run time.", you: "you" },
};
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export function LeaderboardSection({ profile, playtimeSec = 0 }) {
  const lang = profile.lang === "en" ? "en" : "de";
  const s = STR[lang];
  const [board, setBoard] = useState("progress");
  const [rows, setRows] = useState(null);
  const [note, setNote] = useState("");
  const uid = profile.online?.id || "anon";
  const name = profile.name || (lang === "de" ? "Namenloser Stratege" : "Nameless strategist");

  const pct = progressPct(profile);
  const league = profile.campaign?.league || 1;
  const bm = totalBestMoves(profile);
  const runMs = profile.records?.fastestRunMs;

  useEffect(() => { let on = true; setRows(null); fetchBoard(board).then((r) => on && setRows(r)); return () => { on = false; }; }, [board]);

  const myEntry = () => board === "progress"
    ? { uid, name, value: pct, extra: `${s.league} ${ROMAN[league - 1] || league} · ${fmtPlaytime(playtimeSec)}` }
    : board === "fastrun"
      ? (runMs ? { uid, name, value: runMs, extra: fmtMs(runMs) } : null)
      : (bm.stages > 0 ? { uid, name, value: bm.sum, extra: `${bm.stages} ${s.stages}` } : null);

  const share = async () => {
    const e = myEntry(); if (!e) { setNote(s.noRun); return; }
    setRows(await submitScore(board, e)); setNote(s.shared);
    setTimeout(() => setNote(""), 2200);
  };
  const copyText = async () => {
    const txt = lang === "de"
      ? `Gambit — ${name}: ${pct} % (Kapitel ${ROMAN[league - 1] || league}), Durchlauf ${fmtMs(runMs)}, ${bm.sum || "–"} Züge · grandgambit.win`
      : `Gambit — ${name}: ${pct}% (League ${ROMAN[league - 1] || league}), run ${fmtMs(runMs)}, ${bm.sum || "–"} moves · grandgambit.win`;
    try { if (navigator.share) { await navigator.share({ text: txt }); } else { await navigator.clipboard.writeText(txt); } setNote(s.copied); }
    catch {}
    setTimeout(() => setNote(""), 2200);
  };
  const fmtVal = (b, e) => b === "progress" ? `${e.value} %` : b === "fastrun" ? fmtMs(e.value) : `${e.value}`;

  return <div style={{ display: "grid", gap: 10 }}>
    <Panel>
      <div style={{ fontWeight: 800, marginBottom: 8 }}>{s.own}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", fontSize: 13.5, color: T.text }}>
        <div><span style={{ color: T.dim }}>{s.boards.progress}: </span><b style={{ color: T.gold }}>{pct} %</b> · {s.league} {ROMAN[league - 1] || league} ({clearedCount(profile)}/{campaignLength(profile)})</div>
        <div><span style={{ color: T.dim }}>{s.time}: </span>{fmtPlaytime(playtimeSec)}</div>
        <div><span style={{ color: T.dim }}>{s.run}: </span>{runMs ? fmtMs(runMs) : "–"}</div>
        <div><span style={{ color: T.dim }}>{s.movesSum}: </span>{bm.stages ? `${bm.sum} (${bm.stages} ${s.stages})` : "–"}</div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 11 }}>
        <Button variant="subtle" onClick={copyText} style={{ flex: 1 }}>{s.copy}</Button>
      </div>
    </Panel>

    <Panel>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {["progress", "fastrun", "moves"].map((b) => (
          <button key={b} onClick={() => setBoard(b)} style={{ flex: 1, background: board === b ? "rgba(201,164,92,.25)" : "none",
            border: `1px solid ${board === b ? T.gold + "88" : T.line}`, color: board === b ? T.gold : T.dim,
            borderRadius: 999, padding: "7px 6px", fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
            {s.boards[b]}
          </button>
        ))}
      </div>
      {!cloudConfigured() && <div style={{ color: T.dim, fontSize: 11.5, lineHeight: 1.45, marginBottom: 9 }}>{s.offline}</div>}
      {rows === null ? <div style={{ color: T.dim, fontSize: 13 }}>…</div>
        : rows.length === 0 ? <div style={{ color: T.dim, fontSize: 13 }}>{s.empty}</div>
        : <div style={{ display: "grid", gap: 5 }}>
            {rows.map((e, i) => (
              <div key={e.uid + i} style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: 13.5,
                background: e.uid === uid ? "rgba(201,164,92,.14)" : "none", borderRadius: 8, padding: "5px 8px" }}>
                <span style={{ width: 24, color: i < 3 ? T.gold : T.dim, fontWeight: 800 }}>{i + 1}.</span>
                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: T.text }}>
                  {e.name}{e.uid === uid && <span style={{ color: T.gold }}> ({s.you})</span>}
                </span>
                <span style={{ color: T.dim, fontSize: 11.5 }}>{e.extra}</span>
                <b style={{ color: T.gold }}>{fmtVal(board, e)}</b>
              </div>
            ))}
          </div>}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 11 }}>
        <Button onClick={share} style={{ flex: 1 }}><TrophyIc size={14} /> {s.share}</Button>
        {note && <span style={{ color: T.gold, fontSize: 12.5 }}>{note}</span>}
      </div>
    </Panel>
  </div>;
}
