// The chest, painted TWICE over: the classic paintings restored from history,
// and the carved repaint beside them. itemArt() answers in the app's current
// livery; anything a livery lacks falls back to the drawn vector icon (in
// classic that is still the star compass, which was never painted).
import { livery } from "../../livery.js";
/* v1.0.89: DIE SPERREN IM LADEN TRAGEN IHR EIGENES GEMAELDE. Zaun, Mauer und
   Bollwerk zeigten bis jetzt ein Emoji zwischen gemalten Nachbarn - der
   Besitzer hat die Bilder geliefert, das Ladensymbol ist aus dem heilen
   Zustand gerechnet (sein Vorschlag: "fuer die Icons skalierst du einfach
   die ganzen"). Beide Livreen tragen dasselbe Bild: geschnitzt ist es
   ohnehin. */
/* v1.0.91: DER VERGESSENSTRANK HAT SEIN GEMAELDE (Besitzer, 12.9.2026) - der
   letzte Gegenstand, der noch ein Emoji zeigte. Geschnitzte Kugelflasche,
   sagegruen und beinweiss mit Goldband und wirbelnder Milch darin. */
import sVergessenstrank from "./item-vergessenstrank.webp";
import sZaun from "./item-zaun.webp";
import sMauer from "./item-mauer.webp";
import sBergfried from "./item-bergfried.webp";
import cAnker from "./item-anker.webp";
import cBergschluessel from "./item-bergschluessel.webp";
import cBoat from "./item-boat.webp";
import cBrieftaube from "./item-brieftaube.webp";
import cDonnerpulver from "./item-donnerpulver.webp";
import cGrapnel from "./item-grapnel.webp";
import cHourglass from "./item-hourglass.webp";
import cKamel from "./item-kamel.webp";
import cKriegsaxt from "./item-kriegsaxt.webp";
import cMachete from "./item-machete.webp";
import cPotion from "./item-potion.webp";
import cSternensplitter from "./item-sternensplitter.webp";
import cTorch from "./item-torch.webp";
import kAnker from "./item-anker.carved.webp";
import kBergschluessel from "./item-bergschluessel.carved.webp";
import kBoat from "./item-boat.carved.webp";
import kBrieftaube from "./item-brieftaube.carved.webp";
import kDonnerpulver from "./item-donnerpulver.carved.webp";
import kGrapnel from "./item-grapnel.carved.webp";
import kHourglass from "./item-hourglass.carved.webp";
import kKamel from "./item-kamel.carved.webp";
import kKriegsaxt from "./item-kriegsaxt.carved.webp";
import kMachete from "./item-machete.carved.webp";
import kPotion from "./item-potion.carved.webp";
import kSternenkompass from "./item-sternenkompass.carved.webp";
import kSternensplitter from "./item-sternensplitter.carved.webp";
import kTorch from "./item-torch.carved.webp";
/* v1.0.53 (Besitzerbefund): DER STERNENSPLITTER TRAEGT DEN EINFACHEN STIL.
   Von ihm lagen zwei Fassungen vor: ein aufwendiges goldenes Gefaess mit
   Galaxie darin (die alte, "klassische") und der geschnitzte blaue Kristall
   mit goldenem Stern. Der Besitzer will den zweiten - vereinfacht, klar,
   auf einen Blick erkennbar wie die uebrige Ausruestung. Das Goldgefaess
   stach zwischen Axt, Fackel und Trank heraus wie aus einem anderen Spiel.
   Ausserdem hatte CLASSIC gar keinen sternenkompass - wer nicht auf
   "carved" stand, sah fuer diesen Gegenstand NICHTS. Beide Luecken zu. */
const CLASSIC = { anker: cAnker, bergschluessel: cBergschluessel, boat: cBoat, brieftaube: cBrieftaube, donnerpulver: cDonnerpulver, grapnel: cGrapnel, hourglass: cHourglass, kamel: cKamel, kriegsaxt: cKriegsaxt, machete: cMachete, potion: cPotion, sternenkompass: kSternenkompass, sternensplitter: kSternensplitter, torch: cTorch , zaun: sZaun, mauer: sMauer, bergfried: sBergfried , vergessenstrank: sVergessenstrank };
const CARVED = { anker: kAnker, bergschluessel: kBergschluessel, boat: kBoat, brieftaube: kBrieftaube, donnerpulver: kDonnerpulver, grapnel: kGrapnel, hourglass: kHourglass, kamel: kKamel, kriegsaxt: kKriegsaxt, machete: kMachete, potion: kPotion, sternenkompass: kSternenkompass, sternensplitter: kSternensplitter, torch: kTorch , zaun: sZaun, mauer: sMauer, bergfried: sBergfried , vergessenstrank: sVergessenstrank };
export const itemArt = (id) => (livery() === "carved" ? CARVED : CLASSIC)[id] || null;
