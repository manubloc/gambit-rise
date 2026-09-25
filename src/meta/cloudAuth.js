// Cloud sign-in (Supabase Auth) — Google OAuth + e-mail/password, exactly the
// flow players know from other games. Self-activates when the environment
// provides VITE_SUPABASE_URL / VITE_SUPABASE_KEY (see SUPABASE-SETUP.md);
// until then every function reports "unconfigured" and the local accounts
// carry the game.
import { upsertCloudAccount } from "./accounts.js";
import { ADMIN_EMAILS } from "../app/config.js";

const ENV = (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env : {};
const URL = ENV.VITE_SUPABASE_URL;
const KEYV = ENV.VITE_SUPABASE_KEY;

export const cloudConfigured = () => !!(URL && KEYV);

let _sb = null;
async function sb() {
  if (!cloudConfigured()) return null;
  if (_sb) return _sb;
  const { createClient } = await import(/* @vite-ignore */ "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
  _sb = createClient(URL, KEYV);
  return _sb;
}
/** Shared Supabase client for other cloud features (e.g. error reports). */
export const sbClient = sb;

const isAdminMail = (email) => (ADMIN_EMAILS || []).map((e) => e.toLowerCase()).includes(String(email || "").toLowerCase());

async function mirror(user, provider) {
  return upsertCloudAccount({
    email: user.email,
    /* v1.0.4: KEIN Rueckfall auf den Teil vor dem @ - lieber gar kein Name
       als die E-Mail als Name. Wer ueber Google kommt, bringt meist einen
       echten Anzeigenamen mit; sonst vergibt ihn der Spieler im Spiel. */
    name: user.user_metadata?.full_name || user.user_metadata?.name || null,
    provider, isAdmin: isAdminMail(user.email),
  });
}

/** Redirect into a provider's consent screen (google, apple, discord);
    the return trip lands in resumeCloudSession(). */
export async function signInWithProvider(provider) {
  const c = await sb(); if (!c) throw new Error("unconfigured");
  /* v1.64.0 (Besitzer: "mit meinem Google-Konto springt er zurueck auf die
     Landingpage"): die Rueckkehr ging an window.location.origin - seit die App
     unter /spielen/ wohnt (v1.42.0) ist das die LANDINGPAGE. Jetzt kehrt die
     Anmeldung auf die Seite zurueck, von der sie ausging. */
  const zurueck = window.location.origin + window.location.pathname.replace(/[^/]*$/, "");
  const { error } = await c.auth.signInWithOAuth({ provider, options: { redirectTo: zurueck } });
  if (error) throw error;
}
export const signInWithGoogle = () => signInWithProvider("google");

export async function signUpEmailCloud(email, pass) {
  const c = await sb(); if (!c) throw new Error("unconfigured");
  const { data, error } = await c.auth.signUp({ email, password: pass });
  if (error) throw error;
  return data.user ? mirror(data.user, "email") : null;
}

export async function signInEmailCloud(email, pass) {
  const c = await sb(); if (!c) throw new Error("unconfigured");
  const { data, error } = await c.auth.signInWithPassword({ email, password: pass });
  if (error) throw error;
  return mirror(data.user, "email");
}

/** Called once on boot: picks up OAuth redirects + persisted sessions. */
export async function resumeCloudSession() {
  const c = await sb(); if (!c) return null;
  const { data } = await c.auth.getSession();
  const user = data?.session?.user;
  if (!user) return null;
  const provider = ["google", "apple", "discord"].includes(user.app_metadata?.provider) ? user.app_metadata.provider : "email";
  return mirror(user, provider);
}

export async function signOutCloud() {
  const c = await sb(); if (!c) return;
  try { await c.auth.signOut(); } catch {}
}
