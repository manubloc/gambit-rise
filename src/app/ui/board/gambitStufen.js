/* Reine Daten, KEINE Bild-Importe - damit die Proben sie ohne Bundler lesen
   koennen. (Erst in paintedArt.js abgelegt; dessen webp-Importe brachen
   test_anim mit ERR_UNKNOWN_FILE_EXTENSION.) */
/* ── DIE SECHS STUFEN DES GAMBIT (v1.0.75) ──────────────────────────────────
   Der Besitzer wollte "eine kleine Story" zum Aufstieg. Sie steht hier bei
   den Bildern, nicht in strings.js: sie gehoert zu den sechs handgefuehrten
   Gemaelden und aendert sich mit ihnen. Ton wie im ganzen Haus - knapp,
   ernst, kein Fantasy-Schwulst. */
export const GAMBIT_STUFEN = [
  { r: "I",   name: "Der Bauer",        text: "Ein Bauer unter Bauern — nur einer, der weitergeht, wenn die anderen fallen." },
  { r: "II",  name: "Der Geprüfte",     text: "Er hat den Riss gesehen und ist nicht davongelaufen. Das allein trennt ihn schon von der Reihe." },
  { r: "III", name: "Der Getragene",    text: "Man kennt ihn an den Stationen. Wo er das Brett betritt, richten sich Reihen aus, die niemand befohlen hat." },
  { r: "IV",  name: "Der Standhafte",   text: "Er ist zu oft geschlagen worden, um noch zu erschrecken. Sein Gold ist kein Schmuck mehr, sondern Narbe." },
  { r: "V",   name: "Der Gezeichnete",  text: "Der Riss hat ihn geprägt, wie er alles prägt — aber er trägt es nach außen statt nach innen." },
  { r: "VI",  name: "Der Gambit", text: "Kein Bauer mehr, und doch nie etwas anderes gewesen. Die Krone weiß nicht, ob sie ihn ehren oder fürchten soll." },
];
