# Online-Anmeldung aktivieren (Supabase) — 10 Minuten

Das Spiel läuft heute komplett ohne Backend: Konten und Spielstände liegen auf
dem Gerät. Sobald du die zwei Umgebungsvariablen setzt, schalten sich
**E-Mail-Login und „Mit Google anmelden"** automatisch auf echte Cloud-Konten um
(Code ist fertig, `src/meta/cloudAuth.js`).

## 1. Projekt anlegen
1. https://supabase.com → New project (Free Tier reicht).
2. Settings → API: kopiere **Project URL** und **anon public key**.

## 2. Google-Login aktivieren
1. Supabase: Authentication → Providers → Google → Enable.
2. Der Dialog zeigt dir die Redirect-URL. Lege in der Google Cloud Console
   (APIs & Services → Credentials → OAuth Client "Web") Client-ID + Secret an,
   trage die Redirect-URL ein und füge beides in Supabase ein.
3. Authentication → URL Configuration → Site URL: `https://gambitrise.com`.

## 3. Variablen setzen (Cloudflare Pages)
Pages → grand-gambit → Settings → Environment variables (Production):

    VITE_SUPABASE_URL = https://<projekt>.supabase.co
    VITE_SUPABASE_KEY = <anon public key>

Neu deployen — fertig. (Lokal: `.env.local` mit denselben Zeilen.)

## 4. Optional: geteilter Speicher (Cloud-Saves / später PvP)
Im SQL-Editor:

    create table if not exists gambit_store (
      key text primary key,
      value text not null,
      updated_at timestamptz default now()
    );
    alter table gambit_store enable row level security;
    create policy "gambit rw" on gambit_store for all
      using (true) with check (true);

## Admin
* Cloud-Konten: trage die E-Mail in `src/app/config.js` → `ADMIN_EMAILS` ein.
* Lokal eingebaut: Konto **admin** (Standard-Passwort steht im Code,
  `src/meta/accounts.js` — das Repo ist öffentlich!). Nach dem ersten Login
  daher unbedingt ändern (der Spielstand-Bildschirm erinnert daran).
  Admins sehen pro Spielstand den Fortschrittsregler (0–100 %).
