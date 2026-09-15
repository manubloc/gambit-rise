/* ── DIE KULISSENBILDER (v1.14.0) ─────────────────────────────────────────────
   Die Zuordnung Figur -> Name steht in kulissen.js (reine Daten, in node
   pruefbar). Hier haengen die Bilder dran - alle 27, damit Vite sie kennt.
   Wer eine Kulisse hinzufuegt, traegt sie hier UND in kulissen.js ein; eine
   Probe in test_ui haelt beide Listen aneinander. */
import k_bund_krone from "./assets/kulissen/bund-krone.webp";
import k_bund_konzil from "./assets/kulissen/bund-konzil.webp";
import k_bund_geleit from "./assets/kulissen/bund-geleit.webp";
import k_bund_faehrte from "./assets/kulissen/bund-faehrte.webp";
import k_bund_schatten from "./assets/kulissen/bund-schatten.webp";
import k_bund_schildwacht from "./assets/kulissen/bund-schildwacht.webp";
import k_bund_gezeiten from "./assets/kulissen/bund-gezeiten.webp";
import k_bund_bannkreis from "./assets/kulissen/bund-bannkreis.webp";
import k_bund_sturm from "./assets/kulissen/bund-sturm.webp";
import k_bund_nachtwache from "./assets/kulissen/bund-nachtwache.webp";
import k_meister_richter from "./assets/kulissen/meister-richter.webp";
import k_meister_doppelritter from "./assets/kulissen/meister-doppelritter.webp";
import k_meister_hetzer from "./assets/kulissen/meister-hetzer.webp";
import k_meister_schattenfuerst from "./assets/kulissen/meister-schattenfuerst.webp";
import k_meister_hueter from "./assets/kulissen/meister-hueter.webp";
import k_meister_blutmagd from "./assets/kulissen/meister-blutmagd.webp";
import k_meister_lanzenmeister from "./assets/kulissen/meister-lanzenmeister.webp";
import k_meister_eisenfaust from "./assets/kulissen/meister-eisenfaust.webp";
import k_meister_kanonier from "./assets/kulissen/meister-kanonier.webp";
import k_meister_koloss from "./assets/kulissen/meister-koloss.webp";
import k_meister_asra from "./assets/kulissen/meister-asra.webp";
import k_meister_osric from "./assets/kulissen/meister-osric.webp";
import k_monster_brut from "./assets/kulissen/monster-brut.webp";
import k_monster_untot from "./assets/kulissen/monster-untot.webp";
import k_monster_gesindel from "./assets/kulissen/monster-gesindel.webp";
import k_monster_gemaeuer from "./assets/kulissen/monster-gemaeuer.webp";
import k_drache from "./assets/kulissen/drache.webp";
import k_figur_bauer from "./assets/kulissen/figur-bauer.webp";
import k_figur_gambit from "./assets/kulissen/figur-gambit.webp";

export const KULISSE_URL = {
  "bund-krone": k_bund_krone,
  "bund-konzil": k_bund_konzil,
  "bund-geleit": k_bund_geleit,
  "bund-faehrte": k_bund_faehrte,
  "bund-schatten": k_bund_schatten,
  "bund-schildwacht": k_bund_schildwacht,
  "bund-gezeiten": k_bund_gezeiten,
  "bund-bannkreis": k_bund_bannkreis,
  "bund-sturm": k_bund_sturm,
  "bund-nachtwache": k_bund_nachtwache,
  "meister-richter": k_meister_richter,
  "meister-doppelritter": k_meister_doppelritter,
  "meister-hetzer": k_meister_hetzer,
  "meister-schattenfuerst": k_meister_schattenfuerst,
  "meister-hueter": k_meister_hueter,
  "meister-blutmagd": k_meister_blutmagd,
  "meister-lanzenmeister": k_meister_lanzenmeister,
  "meister-eisenfaust": k_meister_eisenfaust,
  "meister-kanonier": k_meister_kanonier,
  "meister-koloss": k_meister_koloss,
  "meister-asra": k_meister_asra,
  "meister-osric": k_meister_osric,
  "monster-brut": k_monster_brut,
  "monster-untot": k_monster_untot,
  "monster-gesindel": k_monster_gesindel,
  "monster-gemaeuer": k_monster_gemaeuer,
  "drache": k_drache,
  "figur-bauer": k_figur_bauer,
  "figur-gambit": k_figur_gambit
};

/* Kulisse als Hintergrundbild fuer eine Kachel.
   v1.14.2 (Besitzerbefund: "man erkennt sie nicht"): 42 % Deckung plus ein
   dunkler Verlauf ueber die ganze Hoehe - das waren die Werte des
   Bundfensters, wo ein langer Text darueber lesbar bleiben muss. Auf der
   Kachel steht kein Text, nur der Name am Fuss. Also fast volle Deckung, und
   der Verlauf nur noch im unteren Drittel, wo der Name sitzt. Die Landschaft
   im oberen Teil - Himmel, Burg, Laterne - bleibt frei. */
/* v1.15.1 (Besitzer): grau = Graustufen fuer alles, was noch nicht zu einem
   gehoert; ton = ein Farbschleier in der Farbe der Figur (Monster: b.accent),
   damit Kulisse und Figur sich grob angleichen. Der Schleier liegt als
   mix-blend-mode: color ueber dem Bild - er faerbt, ohne Helligkeit oder
   Zeichnung zu nehmen. */
export function KulisseHinterGrund({ name, radius = 11, deckung = 0.92, grau = false, ton = null }) {
  const src = name ? KULISSE_URL[name] : null;
  if (!src) return null;
  return <>
    <img src={src} alt="" aria-hidden draggable={false} data-kulisse={name} data-gg-still="" data-grau={grau ? "1" : "0"}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
        borderRadius: radius, opacity: deckung, pointerEvents: "none", zIndex: -1,
        filter: grau ? "grayscale(1) brightness(.55)" : "none" }} />
    {ton && !grau && <div aria-hidden data-kulisse-ton={ton} style={{ position: "absolute", inset: 0, borderRadius: radius, pointerEvents: "none", zIndex: -1,
      background: ton, mixBlendMode: "color", opacity: 0.45 }} />}
    <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: radius, pointerEvents: "none", zIndex: -1,
      background: "linear-gradient(180deg, rgba(10,7,19,0) 0%, rgba(10,7,19,0) 58%, rgba(10,7,19,.55) 82%, rgba(10,7,19,.78) 100%)" }} />
  </>;
}
