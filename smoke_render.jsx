// SSR smoke: render every screen with realistic profiles to surface runtime errors.
import { renderToStaticMarkup } from "react-dom/server";
import App, { PlayHub } from "./src/app/App.jsx";
import { CampaignScreen } from "./src/app/ui/screens/CampaignScreen.jsx";
import { ArmyScreen } from "./src/app/ui/screens/ArmyScreen.jsx";
import { GameScreen } from "./src/app/ui/screens/GameScreen.jsx";
import { AchievementsScreen } from "./src/app/ui/screens/AchievementsScreen.jsx";
import { ProfileScreen } from "./src/app/ui/screens/ProfileScreen.jsx";
import { Splash, Wordmark } from "./src/app/ui/Brand.jsx";
import { OnlineScreen } from "./src/app/ui/screens/OnlineScreen.jsx";
import { LoginScreen } from "./src/app/ui/screens/LoginScreen.jsx";
import { LeaderboardSection } from "./src/app/ui/screens/LeaderboardScreen.jsx";
import { createNet } from "./src/platform/net.web.js";
import { defaultProfile, buildStageMatch, advanceCampaign, withProgressPct } from "./src/meta/index.js";
import { CAMPAIGN } from "./src/content/index.js";
import { makeT } from "./src/app/i18n/strings.js";

const t = makeT("de");
let prof = defaultProfile();
const legacy = { v: 1, xp: 777, charXp: { pawn: 300, knight: 120 }, campaign: { cleared: 3 }, loadout: {}, stats: {} };

// THE SILENT TRAP, closed: this harness printed FAIL and then exited 0, so a
// broken screen sailed straight through `npm test`. Failures are counted now
// and the process ends red — plus a RESULT line so the battery can tally it.
let sPass = 0, sFail = 0;
const step = (name, fn) => {
  try { fn(); sPass++; console.log("  ok  -", name); }
  catch (e) { sFail++; console.log(" FAIL -", name, "→", e.message); console.log(e.stack.split("\n").slice(0, 4).join("\n")); }
};

step("Splash renders", () => renderToStaticMarkup(<Splash onDone={() => {}} />));
step("Wordmark renders", () => renderToStaticMarkup(<Wordmark />));
step("App initial render", () => renderToStaticMarkup(<App />));
step("LoginScreen renders", () => renderToStaticMarkup(<LoginScreen onSignedIn={() => {}} />));
/* v1.29.1: der Spielstandschirm ist fort - nach der Anmeldung ist man im Spiel */
step("LeaderboardSection renders", () => renderToStaticMarkup(<LeaderboardSection profile={prof} playtimeSec={4200} />));
step("PlayHub", () => renderToStaticMarkup(<PlayHub profile={prof} t={t} onQuick={() => {}} onCamp={() => {}} />));
step("CampaignScreen (fresh)", () => renderToStaticMarkup(<CampaignScreen profile={prof} t={t} onStart={() => {}} />));
prof = advanceCampaign(advanceCampaign(advanceCampaign(prof, "n01"), "n02"), "n03");
step("CampaignScreen (forked)", () => renderToStaticMarkup(<CampaignScreen profile={prof} t={t} onStart={() => {}} />));
step("ArmyScreen", () => renderToStaticMarkup(<ArmyScreen profile={prof} dispatch={() => {}} t={t} />));
step("GameScreen quick play", () => renderToStaticMarkup(<GameScreen profile={prof} dispatch={() => {}} t={t} />));
step("GameScreen campaign piece-boss", () => renderToStaticMarkup(<GameScreen profile={prof} dispatch={() => {}} t={t} match={buildStageMatch("L06s12", { campaign: { league: 6, cleared: [], unlocked: [] } })} onExit={() => {}} />));
// EVERY campaign node must at least OPEN (render) without crashing — this is
// exactly the "a level won't open" failure, dragon stages included. We build a
// fully-progressed profile so every node (dragons a4/g7/g1, all bosses) is reachable.
{
  const full = withProgressPct(defaultProfile(), 100, 10);
  let opened = 0, failed = [];
  for (const node of CAMPAIGN) {
    try {
      const m = buildStageMatch(node.id, full);
      renderToStaticMarkup(<GameScreen profile={full} dispatch={() => {}} t={t} match={m} onExit={() => {}} />);
      opened++;
    } catch (e) { failed.push(node.id + ": " + e.message); }
  }
  step(`all ${CAMPAIGN.length} campaign nodes open (render)`, () => {
    if (failed.length) throw new Error(`${failed.length} node(s) crash on open: ` + failed.slice(0, 4).join(" | "));
  });
}
step("OnlineScreen (disconnected)", () => renderToStaticMarkup(<OnlineScreen profile={prof} dispatch={() => {}} t={t} net={createNet()} onMatch={() => {}} />));
step("AchievementsScreen", () => renderToStaticMarkup(<AchievementsScreen profile={prof} t={t} />));
// the accordion OPEN: this exact path once crashed live (tiers missing on the item)
step("AchievementsScreen (open)", () => renderToStaticMarkup(<AchievementsScreen profile={prof} t={t} initialOpenId="wins" />));
step("ProfileScreen", () => renderToStaticMarkup(<ProfileScreen profile={prof} dispatch={() => {}} t={t} />));
console.log(`\nRESULT: ${sPass} passed, ${sFail} failed`);
if (sFail) process.exit(1);
