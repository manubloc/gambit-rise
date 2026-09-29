// THE CHEST, PAINTED. Every item now shows its own painting; the hand-drawn
// vector icon stays underneath as the fallback for anything not yet painted
// (today: the star compass), and the emoji beneath that. One component, so
// wherever an item appears — supply chest, battle HUD, a barred path on the
// map, the academy — it wears the same face.
import { ICON_ART } from "./art.generated.js";
import { itemArt } from "./assets/items/itemArt.js";
import { schlichtAn } from "./board/paintedArt.js";
import { sperrBild } from "./board/sperrenArt.js";
import { SperrVektor, FalleVektor } from "./board/sperrenVektor.jsx";
import { ITEMS } from "../../content/index.js";

export function ItemIcon({ id, size = 22, style = null }) {
  /* v0.84 (Besitzer): im schlichten Stil zeichnet ueberall dieselbe Hand -
     auch beim Trank und beim Zubehoer. Das gemalte Bild tritt zurueck, die
     Vektorzeichnung uebernimmt. Entweder das eine oder das andere; ein
     Haus aus gemalten Truhen und schlichten Figuren war der Zwitter, den
     der Besitzer zu Recht bemaengelt hat. */
  /* v1.0.63: die SPERREN im Laden tragen genau das Gesicht, das gleich auf
     dem Brett stehen wird - das gemalte Bild, wo es eines gibt (die Mauer),
     sonst die Zeichnung aus sperrenVektor. Ein Zaun als Emoji im Bündel des
     Kraemers waere die einzige Stelle im ganzen Haus gewesen, an der ein
     Systemzeichen fuer ein Spielstueck steht. */
  const sperrArt = ITEMS[id]?.sperre || null;
  const painted = schlichtAn() ? null : itemArt(id) || (sperrArt ? sperrBild(sperrArt, "heil") : null);
  if (painted) {
    return <img src={painted} alt="" draggable={false} decoding="async" aria-hidden="true"
      style={{ width: size, height: size, objectFit: "contain", display: "block",
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,.45))", ...style }} />;
  }
  if (sperrArt) return <SperrVektor art={sperrArt} zustand="heil" size={size} style={style} />;
  /* v1.90.9 (Audit A32): dasselbe fuer die Fallen. Sie zeigen ihre VERDECKTE
     Fassung - das ist es, was der Spieler kauft und aufs Brett legt; die
     aufgerissene sieht er erst, wenn jemand hineingetreten ist. Ein Emoji
     im Buendel waere die einzige Stelle im Haus, an der ein Systemzeichen
     fuer ein Spielstueck steht (siehe oben). */
  const fallenArt = ITEMS[id]?.falle || null;
  if (fallenArt) return <FalleVektor art={fallenArt} offen={false} size={size} style={style} />;
  const art = ICON_ART[id];
  if (!art) return <span style={{ fontSize: size * 0.86, ...style }}>{ITEMS[id]?.emoji || "❔"}</span>;
  return <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true"
    style={{ display: "block", filter: "drop-shadow(0 1px 1px rgba(0,0,0,.35))", ...style }}
    dangerouslySetInnerHTML={{ __html: art }} />;
}
