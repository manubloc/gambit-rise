// The front door — sign in the way players expect: e-mail + password,
// a Google button, and a quiet guest path for the impatient.
// Runs fully offline on local accounts; the Google/e-mail cloud path takes
// over automatically once Supabase is configured (SUPABASE-SETUP.md).
import { useState } from "react";
import { T } from "../theme.js";
import { register, login, cloudConfigured, signInWithProvider, signInEmailCloud, signUpEmailCloud } from "../../../meta/index.js";
import { logoArt } from "../livery.js";
import { RissBoden } from "../RissBoden.jsx";
/* v1.77.0 (Besitzer): das gelieferte Logo als Bild - die gezeichnete
   Wortmarke ist damit aus der App heraus. */
import wortmarkeBild from "../assets/wortmarke.webp";
import { loginGuest } from "../../../meta/index.js";   /* v1.46.0 */

const STR = {
  de: {
    tag: "Ein Reich wartet auf seinen Strategen.",
    email: "E-Mail", pass: "Passwort (mind. 6 Zeichen)", signin: "Anmelden", signup: "Konto erstellen",
    google: "Mit Google anmelden", apple: "Mit Apple anmelden", discord: "Mit Discord anmelden", guest: "Als Gast spielen", or: "oder",
    haveNo: "Noch kein Konto? Erstellen", have: "Schon ein Konto? Anmelden",
    cloudOff: "Google-, Apple- und Discord-Anmeldung werden freigeschaltet, sobald das Online-Konto eingerichtet ist — bis dahin gilt dein Konto auf diesem Gerät.",
    err: { "invalid-email": "Das sieht nicht nach einer E-Mail-Adresse aus.", "weak-pass": "Das Passwort braucht mindestens 6 Zeichen.",
      exists: "Dieses Konto gibt es schon — melde dich an.", "not-found": "Kein Konto mit dieser E-Mail. Erstelle eins!",
      "wrong-pass": "Falsches Passwort.", unconfigured: "Online-Anmeldung ist noch nicht eingerichtet.", generic: "Das hat nicht geklappt. Versuch es noch einmal." },
  },
  en: {
    tag: "A realm awaits its strategist.",
    email: "E-mail", pass: "Password (min. 6 characters)", signin: "Sign in", signup: "Create account",
    google: "Sign in with Google", apple: "Sign in with Apple", discord: "Sign in with Discord", guest: "Play as guest", or: "or",
    haveNo: "No account yet? Create one", have: "Have an account? Sign in",
    cloudOff: "Google, Apple and Discord sign-in unlock once the online account is configured — until then your account lives on this device.",
    err: { "invalid-email": "That doesn't look like an e-mail address.", "weak-pass": "Passwords need at least 6 characters.",
      exists: "That account already exists — sign in instead.", "not-found": "No account with this e-mail. Create one!",
      "wrong-pass": "Wrong password.", unconfigured: "Online sign-in isn't configured yet.", generic: "That didn't work. Please try again." },
  },
};

// Apple & Discord are wired in code but their providers are not configured in
// Supabase yet (Apple needs a paid developer account). Hidden until then —
// flip to true after following SUPABASE-SETUP.md for the provider.
const SHOW_EXTRA_PROVIDERS = false;

const field = {
  width: "100%", boxSizing: "border-box", background: T.input, border: `1px solid ${T.line}`,
  color: T.text, borderRadius: 12, padding: "10px 13px", fontSize: 15, fontFamily: "inherit", outline: "none",
};

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.1 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.4 17.7 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/>
      <path fill="#FBBC05" d="M10.4 28.7a14.5 14.5 0 0 1 0-9.4l-7.8-6.1a24 24 0 0 0 0 21.6l7.8-6.1z"/>
      <path fill="#34A853" d="M24 48c6.1 0 11.2-2 15-5.5l-7.5-5.8c-2.1 1.4-4.7 2.2-7.5 2.2-6.3 0-11.7-3.9-13.6-9.4l-7.8 6.1C6.5 42.6 14.6 48 24 48z"/>
    </svg>
  );
}

export function LoginScreen({ onSignedIn, initialLang = "de" }) {
  const [lang, setLang] = useState(initialLang);
  const [mode, setMode] = useState("signin");  // signin | signup
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [cloudNote, setCloudNote] = useState(false);
  const s = STR[lang];
  const cloud = cloudConfigured();

  const run = async (fn) => {
    setBusy(true); setErr("");
    try { const acc = await fn(); if (acc) onSignedIn(acc); }
    /* v1.26.8: ein UNERWARTETER Fehler nennt jetzt seinen Grund. Bisher kam
       alles, was nicht "falsches Passwort" oder "kein Konto" war, als "Das
       hat nicht geklappt" an - wer am Computer scheiterte, erfuhr nie wieso. */
    catch (e) { setErr(s.err[e?.message] || (s.err.generic + (e?.message ? " (" + String(e.message).slice(0, 80) + ")" : ""))); }
    finally { setBusy(false); }
  };
  const submit = () => run(async () => {
    if (cloud && email.includes("@")) {
      return mode === "signup" ? signUpEmailCloud(email, pass) : signInEmailCloud(email, pass);
    }
    return mode === "signup" ? register(email, pass) : login(email, pass);
  });

  /* v1.0.4 (Besitzer: "auf dem Desktop kann ich beim Anmelden nicht
     scrollen"). Die Ursache lag nicht hier, sondern eine Etage hoeher:
     ab 1440 px traegt #root ein zoom von 1,15 (ab 1760 px 1,3). Ein Kind
     mit height:100dvh ist dann VISUELL 115 % des Fensters hoch - und weil
     html/body/#root alle auf height:100% stehen, gibt es darueber keinen
     Rollbereich, der das auffangen koennte. Der Rest des Hauses rechnet
     laengst mit calc(100dvh / var(--vhz)); Anmeldung und Spielstaende
     hatten diese Teilung nie bekommen. */
  return (
    <div style={{ height: "calc(100dvh / var(--vhz, 1))", overflowY: "auto", overscrollBehavior: "none", display: "flex", flexDirection: "column", alignItems: "center",
      padding: "16px 18px", background: T.loginBg }}>
      {/* v1.0.95 (Besitzer: "das ist voellig der falsche - wir hatten
          verschiedene Stufen von Rissen, je weiter man fortschreitet, desto
          groesser"): ES IST DER RISSBODEN, nicht die Halle. Mein Einbau in
          v1.0.94 nahm bg-hall (RiftFloor) - das war das falsche Bild. Der
          Hintergrund des Hauses ist RissBoden: ZEHN Stufen, die mit Hofwert
          und Kampagne aufreissen (seit v0.46.0). Im Hauptmenue lag er immer
          schon; hier vor dem Haus fehlte er, und Stufe 1 ist der richtige
          Anfang - man hat ja noch nichts erreicht. */}
      <RissBoden profile={null} />
      {/* Der Sprachknopf lag UNTER dem Titelbild und schluckte jeden Tipp -
          gemessen fing ein IMG die Klicks ab. Er sitzt jetzt fest am Schirm
          und ueber allem, mit lesbarer Schrift auf dunklem Grund. */}
      <button onClick={() => setLang(lang === "de" ? "en" : "de")} style={{ position: "fixed", top: "calc(12px + env(safe-area-inset-top))", right: "calc(14px + env(safe-area-inset-right))", zIndex: 30,
        background: "rgba(10,8,18,.72)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        border: "1px solid rgba(167,139,250,.5)", color: "#e9e3d4", borderRadius: 999, padding: "6px 13px",
        fontFamily: "inherit", fontSize: 12, fontWeight: 700, letterSpacing: ".06em", cursor: "pointer",
        boxShadow: "0 2px 10px rgba(0,0,0,.5)" }}>{lang === "de" ? "EN" : "DE"}</button>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>

      {/* the artwork carries its own night sky — no vignette, no glow, nothing
          between the eye and the wordmark at its base */}
      <img src={logoArt()} alt="Gambit" draggable={false} style={{ width: "min(100vw, 800px)", maxHeight: "41vh",
        objectFit: "cover", display: "block", marginTop: 0, marginBottom: 42,
        WebkitMaskImage: "radial-gradient(ellipse 78% 74% at 50% 50%, #000 42%, rgba(0,0,0,.6) 70%, transparent 95%)",
        maskImage: "radial-gradient(ellipse 78% 74% at 50% 50%, #000 42%, rgba(0,0,0,.6) 70%, transparent 95%)" }} />
      {/* v1.43.0: die Wortmarke - dieselbe wie auf dem Ladeschirm */}
      <div style={{ marginTop: -30, marginBottom: 6 }}>
        <img src={wortmarkeBild} alt="Gambit Rise" draggable={false}
          style={{ width: "min(84vw, 420px)", height: "auto", display: "block", margin: "0 auto" }} /></div>
      <div className="gg-quill" style={{ color: T.dim, fontSize: 16, lineHeight: 1.6, margin: "12px 0 34px" }}>{s.tag}</div>

      <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 10 }}>
        <input style={field} type="email" placeholder={s.email} value={email} autoComplete="username"
          onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
        <input style={field} type="password" placeholder={s.pass} value={pass} autoComplete={mode === "signup" ? "new-password" : "current-password"}
          onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
        {err && <div style={{ color: T.errText, fontSize: 13, padding: "0 3px" }}>{err}</div>}

        <button disabled={busy} onClick={submit} style={{ position: "relative", overflow: "hidden",
          background: `linear-gradient(180deg, ${T.goldBright} 0%, ${T.gold} 46%, ${T.lime} 100%)`,
          border: `1px solid ${T.goldBright}`, color: T.limeInk,
          boxShadow: `0 6px 18px rgba(0,0,0,.45), 0 0 14px ${T.gold}55`,
          borderRadius: 12, padding: "11px 14px", fontFamily: "inherit", fontWeight: 800, fontSize: 14.5,
          cursor: "pointer", boxShadow: "0 0 16px rgba(201,164,92,.25)", opacity: busy ? 0.6 : 1 }}>
          <span aria-hidden style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "42%",
            background: "linear-gradient(90deg, transparent, rgba(255,244,210,.3), transparent)",
            animation: "ggShine 11s ease-in-out 0.6s infinite", pointerEvents: "none" }} />
          {mode === "signup" ? s.signup : s.signin}
        </button>
        <button onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setErr(""); }}
          style={{ background: "none", border: "none", color: T.gold, fontFamily: "inherit", fontSize: 13, cursor: "pointer", padding: 4 }}>
          {mode === "signup" ? s.have : s.haveNo}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, color: T.dim, fontSize: 12, margin: "2px 0" }}>
          <div style={{ flex: 1, height: 1, background: T.line }} />{s.or}<div style={{ flex: 1, height: 1, background: T.line }} />
        </div>

        <button disabled={busy} onClick={() => (cloud ? run(() => signInWithProvider("google")) : setCloudNote(true))}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            background: "#fff", border: "1px solid #dadce0", color: "#3c4043", borderRadius: 12,
            padding: "10px 14px", fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer",
            opacity: cloud ? 1 : 0.75 }}>
          <GoogleG /> {s.google}
        </button>
        {/* v1.46.0 (Besitzerentscheid): DER GAST. Ein eingefrorener Schaustand -
            Kapitel I, vier Stationen, drei Sonderfiguren, kein Online, kein
            Fortschritt, der bleibt. Wer sein Reich behalten will, legt ein
            Konto an; genau das sagt der Satz darunter. */}
        <button disabled={busy} onClick={() => run(() => loginGuest())}
          style={{ background: "transparent", border: "1px solid rgba(167,139,250,.32)",
            color: "rgba(226,218,246,.8)", borderRadius: 12, padding: "10px 14px",
            fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          {s.guest}
        </button>
        <div style={{ fontSize: 11.5, lineHeight: 1.45, color: "rgba(226,218,246,.5)", textAlign: "center" }}>
          {initialLang === "en"
            ? "As a guest: chapter I, four stations, three extra pieces. No online play, and progress is not kept."
            : "Als Gast: Kapitel I, vier Stationen, drei Sonderfiguren. Kein Online-Spiel, und der Fortschritt bleibt nicht."}
        </div>
        {SHOW_EXTRA_PROVIDERS && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button disabled={busy} onClick={() => (cloud ? run(() => signInWithProvider("apple")) : setCloudNote(true))}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: "#000", border: "1px solid #333", color: "#fff", borderRadius: 12,
              padding: "11px 10px", fontFamily: "inherit", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
              opacity: cloud ? 1 : 0.75 }}>
<svg width="15" height="15" viewBox="0 0 384 512" aria-hidden><path fill="#fff" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg> {s.apple}
          </button>
          <button disabled={busy} onClick={() => (cloud ? run(() => signInWithProvider("discord")) : setCloudNote(true))}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: "#5865F2", border: "1px solid #4752c4", color: "#fff", borderRadius: 12,
              padding: "11px 10px", fontFamily: "inherit", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
              opacity: cloud ? 1 : 0.75 }}>
<svg width="16" height="16" viewBox="0 0 640 512" aria-hidden><path fill="#fff" d="M524.5 69.8a1.5 1.5 0 0 0-.8-.7A485.1 485.1 0 0 0 404.1 32a1.8 1.8 0 0 0-1.9.9 337.5 337.5 0 0 0-14.9 30.6 447.8 447.8 0 0 0-134.4 0 309.5 309.5 0 0 0-15.1-30.6 1.9 1.9 0 0 0-1.9-.9A483.7 483.7 0 0 0 116.1 69.1a1.7 1.7 0 0 0-.8.7C39.1 183.7 18.2 294.7 28.4 404.4a2 2 0 0 0 .8 1.4A487.7 487.7 0 0 0 176 479.9a1.9 1.9 0 0 0 2.1-.7A348.2 348.2 0 0 0 208.1 430.4a1.9 1.9 0 0 0-1-2.6 321.2 321.2 0 0 1-45.9-21.9 1.9 1.9 0 0 1-.2-3.1c3.1-2.3 6.2-4.7 9.1-7.1a1.8 1.8 0 0 1 1.9-.3c96.3 44 200.6 44 295.8 0a1.8 1.8 0 0 1 1.9.2c2.9 2.4 6 4.9 9.1 7.2a1.9 1.9 0 0 1-.2 3.1 301.4 301.4 0 0 1-45.9 21.8 1.9 1.9 0 0 0-1 2.6 391.1 391.1 0 0 0 30 48.8 1.9 1.9 0 0 0 2.1.7A486 486 0 0 0 610.7 405.7a1.9 1.9 0 0 0 .8-1.4c12.2-126.7-20.6-236.8-87-334.5zM222.5 337.6c-29 0-52.8-26.6-52.8-59.2s23.4-59.3 52.8-59.3c29.7 0 53.3 26.8 52.8 59.2 0 32.7-23.4 59.3-52.8 59.3zm195.4 0c-29 0-52.8-26.6-52.8-59.2s23.4-59.3 52.8-59.3c29.7 0 53.3 26.8 52.8 59.2 0 32.7-23.2 59.3-52.8 59.3z"/></svg> {s.discord}
          </button>
        </div>}
        {cloudNote && !cloud && <div style={{ color: T.dim, fontSize: 12.5, lineHeight: 1.45, padding: "0 3px" }}>{s.cloudOff}</div>}

        {/* v0.92 (Besitzerentscheid): DER GASTWEG IST FORT. Wer spielen will,
            legt ein Konto an - sonst haengt kein Fortschritt an einem Namen,
            die Halle findet niemanden wieder, und beim naechsten Start ist
            alles verloren. Der stille Seitenweg hat mehr gekostet als
            gebracht. */}
      </div>
      </div>
      <div style={{ marginTop: "auto", paddingTop: 14, color: "rgba(240,233,216,.28)", fontSize: 10.5,
        letterSpacing: ".08em" }}>v{typeof __GG_VERSION__ !== "undefined" ? __GG_VERSION__ : "dev"}</div>
    </div>
  );
}
