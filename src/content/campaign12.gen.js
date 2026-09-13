// GENERIERT von tools/build-campaign12.mjs - nicht von Hand pflegen.
// Quelle ist tools/stationen.json, der im Stationspruefer gepflegte Stand
// (2026-07-27T07:35:03.714Z). Zwoelf Liga-Graphen, 529 Stationen.
// Zum Neubau: node tools/build-campaign12.mjs
export const CAMPAIGN12 = [
 {
  "id": "L01s00",
  "league": 1,
  "place": "Alte Wacht",
  "col": 0,
  "row": 1,
  "map": "classic",
  "chapter": 1,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L01s01"
  ],
  "reward": {
   "xp": 36
  },
  "storyDe": "Der Weg beginnt bei Alte Wacht.",
  "storyEn": "The road begins at Alte Wacht."
 },
 {
  "id": "L01s01",
  "league": 1,
  "place": "Silbermühle",
  "col": 1,
  "row": 2,
  "map": "skirmish",
  "chapter": 1,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L01s03"
  ],
  "reward": {
   "xp": 39
  },
  "storyDe": "Der Weg beginnt bei Silbermühle.",
  "storyEn": "The road begins at Silbermühle."
 },
 {
  "id": "L01s02",
  "league": 1,
  "place": "Verlassene Ruinen",
  "col": 3,
  "row": 2,
  "map": "courtyard",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 60,
   "gold": 48
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Verlassene Ruinen.",
  "storyEn": "A side path branches toward Verlassene Ruinen."
 },
 {
  "id": "L01s03",
  "league": 1,
  "place": "Vergessener Schrein",
  "col": 1,
  "row": 2,
  "map": "courtyard",
  "chapter": 1,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L01s04",
   "L01s07"
  ],
  "reward": {
   "xp": 42
  },
  "storyDe": "Der Weg beginnt bei Vergessener Schrein.",
  "storyEn": "The road begins at Vergessener Schrein."
 },
 {
  "id": "L01s04",
  "league": 1,
  "place": "Nordwacht",
  "col": 1,
  "row": 2,
  "map": "gauntlet",
  "chapter": 1,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L01s06"
  ],
  "reward": {
   "xp": 45
  },
  "storyDe": "Der Weg beginnt bei Nordwacht.",
  "storyEn": "The road begins at Nordwacht."
 },
 {
  "id": "L01s05",
  "league": 1,
  "place": "Sturmfeste",
  "col": 3,
  "row": 2,
  "map": "classic",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L01s02"
  ],
  "reward": {
   "xp": 60
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Sturmfeste.",
  "storyEn": "A side path branches toward Sturmfeste."
 },
 {
  "id": "L01s06",
  "league": 1,
  "place": "Schattenklippe",
  "col": 1,
  "row": 3,
  "map": "arena",
  "chapter": 1,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L01s09"
  ],
  "reward": {
   "xp": 48
  },
  "storyDe": "Der Weg beginnt bei Schattenklippe.",
  "storyEn": "The road begins at Schattenklippe."
 },
 {
  "id": "L01s07",
  "league": 1,
  "place": "Mondwarte",
  "col": 1,
  "row": 3,
  "map": "courtyard",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L01s12"
  ],
  "reward": {
   "xp": 52
  },
  "storyDe": "Ein stiller Umweg führt zu Mondwarte.",
  "storyEn": "A quiet detour leads to Mondwarte.",
  "gate": {
   "gold": 25
  },
  "tagDe": "Zollstation",
  "tagEn": "Toll station"
 },
 {
  "id": "L01s08",
  "league": 1,
  "place": "Krähenfels",
  "col": 3,
  "row": 3,
  "map": "gauntlet",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L01s05"
  ],
  "reward": {
   "xp": 60
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Krähenfels.",
  "storyEn": "A side path branches toward Krähenfels."
 },
 {
  "id": "L01s09",
  "league": 1,
  "place": "Wolfspass",
  "col": 2,
  "row": 3,
  "map": "classic",
  "chapter": 1,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L01s10"
  ],
  "reward": {
   "xp": 51
  },
  "storyDe": "Der Weg beginnt bei Wolfspass.",
  "storyEn": "The road begins at Wolfspass."
 },
 {
  "id": "L01s10",
  "league": 1,
  "place": "Steinernes Tor",
  "col": 2,
  "row": 3,
  "map": "skirmish",
  "chapter": 2,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L01s13"
  ],
  "reward": {
   "xp": 54
  },
  "storyDe": "Der Pfad führt weiter über Steinernes Tor.",
  "storyEn": "The path leads on across Steinernes Tor."
 },
 {
  "id": "L01s11",
  "league": 1,
  "place": "Furt am Grauen Bach",
  "col": 3,
  "row": 3,
  "map": "skirmish",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L01s08"
  ],
  "reward": {
   "xp": 52
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Furt am Grauen Bach.",
  "storyEn": "A side path branches toward Furt am Grauen Bach."
 },
 {
  "id": "L01s12",
  "league": 1,
  "place": "Zehntscheune",
  "col": 1,
  "row": 4,
  "map": "courtyard",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L01s16"
  ],
  "reward": {
   "xp": 60
  },
  "storyDe": "Abseits des Weges liegt Zehntscheune.",
  "storyEn": "Off the road lies Zehntscheune."
 },
 {
  "id": "L01s13",
  "league": 1,
  "place": "Klingenschlucht",
  "col": 2,
  "row": 4,
  "map": "courtyard",
  "chapter": 2,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L01s14"
  ],
  "reward": {
   "xp": 57
  },
  "storyDe": "Der Pfad führt weiter über Klingenschlucht.",
  "storyEn": "The path leads on across Klingenschlucht."
 },
 {
  "id": "L01s14",
  "league": 1,
  "place": "Sonnenheiligtum",
  "col": 3,
  "row": 4,
  "map": "gauntlet",
  "chapter": 2,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L01s11",
   "L01s17"
  ],
  "reward": {
   "xp": 60
  },
  "storyDe": "Der Pfad führt weiter über Sonnenheiligtum.",
  "storyEn": "The path leads on across Sonnenheiligtum."
 },
 {
  "id": "L01s15",
  "league": 1,
  "place": "Mühlensteg",
  "col": 5,
  "row": 4,
  "map": "classic",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 60,
   "gold": 48
  },
  "storyDe": "Abseits des Weges liegt Mühlensteg.",
  "storyEn": "Off the road lies Mühlensteg."
 },
 {
  "id": "L01s16",
  "league": 1,
  "place": "Alter Markt",
  "col": 1,
  "row": 4,
  "map": "skirmish",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L01s18",
   "L01s23"
  ],
  "reward": {
   "xp": 60
  },
  "storyDe": "Ein stiller Umweg führt zu Alter Markt.",
  "storyEn": "A quiet detour leads to Alter Markt."
 },
 {
  "id": "L01s17",
  "league": 1,
  "place": "Alte Sternwarte",
  "col": 3,
  "row": 5,
  "map": "arena",
  "chapter": 2,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L01s20"
  ],
  "reward": {
   "xp": 63
  },
  "storyDe": "Der Pfad führt weiter über Alte Sternwarte.",
  "storyEn": "The path leads on across Alte Sternwarte."
 },
 {
  "id": "L01s18",
  "league": 1,
  "place": "Wachtbaum",
  "col": 1,
  "row": 5,
  "map": "gauntlet",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 60,
   "gold": 48
  },
  "storyDe": "Abseits des Weges liegt Wachtbaum.",
  "storyEn": "Off the road lies Wachtbaum."
 },
 {
  "id": "L01s19",
  "league": 1,
  "place": "Kalkhöhle",
  "col": 5,
  "row": 5,
  "map": "arena",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L01s15"
  ],
  "reward": {
   "xp": 60
  },
  "storyDe": "Ein stiller Umweg führt zu Kalkhöhle.",
  "storyEn": "A quiet detour leads to Kalkhöhle."
 },
 {
  "id": "L01s20",
  "league": 1,
  "place": "Hexenmoor",
  "col": 3,
  "row": 5,
  "map": "classic",
  "chapter": 2,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L01s22"
  ],
  "reward": {
   "xp": 66
  },
  "storyDe": "Der Pfad führt weiter über Hexenmoor.",
  "storyEn": "The path leads on across Hexenmoor."
 },
 {
  "id": "L01s21",
  "league": 1,
  "place": "Grenzstein",
  "col": 4,
  "row": 5,
  "map": "skirmish",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L01s19"
  ],
  "reward": {
   "xp": 60
  },
  "storyDe": "Abseits des Weges liegt Grenzstein.",
  "storyEn": "Off the road lies Grenzstein."
 },
 {
  "id": "L01s22",
  "league": 1,
  "place": "Nebelmoor",
  "col": 3,
  "row": 5,
  "map": "skirmish",
  "chapter": 3,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L01s25",
   "L01s28"
  ],
  "reward": {
   "xp": 69
  },
  "storyDe": "Die Prüfung wartet bei Nebelmoor.",
  "storyEn": "The trial waits at Nebelmoor."
 },
 {
  "id": "L01s23",
  "league": 1,
  "place": "Jagdrast",
  "col": 1,
  "row": 5,
  "map": "gauntlet",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L01s27"
  ],
  "reward": {
   "xp": 60
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Jagdrast.",
  "storyEn": "A side path branches toward Jagdrast."
 },
 {
  "id": "L01s24",
  "league": 1,
  "place": "Sonnenhang",
  "col": 4,
  "row": 6,
  "map": "arena",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L01s21",
   "L01s30"
  ],
  "reward": {
   "xp": 52
  },
  "storyDe": "Abseits des Weges liegt Sonnenhang.",
  "storyEn": "Off the road lies Sonnenhang."
 },
 {
  "id": "L01s25",
  "league": 1,
  "place": "Geisterfeld",
  "col": 3,
  "row": 6,
  "map": "courtyard",
  "chapter": 3,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L01s26"
  ],
  "reward": {
   "xp": 72
  },
  "storyDe": "Die Prüfung wartet bei Geisterfeld.",
  "storyEn": "The trial waits at Geisterfeld."
 },
 {
  "id": "L01s26",
  "league": 1,
  "place": "Waldfeste",
  "col": 4,
  "row": 6,
  "map": "gauntlet",
  "chapter": 3,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L01s24",
   "L01s30"
  ],
  "reward": {
   "xp": 75
  },
  "storyDe": "Die Prüfung wartet bei Waldfeste.",
  "storyEn": "The trial waits at Waldfeste.",
  "boss": {
   "piece": "mage",
   "wins": 1
  },
  "tier": 2
 },
 {
  "id": "L01s27",
  "league": 1,
  "place": "Talsperre",
  "col": 1,
  "row": 6,
  "map": "courtyard",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L01s32"
  ],
  "reward": {
   "xp": 60
  },
  "storyDe": "Abseits des Weges liegt Talsperre.",
  "storyEn": "Off the road lies Talsperre."
 },
 {
  "id": "L01s28",
  "league": 1,
  "place": "Brackwasserbrücke",
  "col": 3,
  "row": 6,
  "map": "gauntlet",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L01s29",
   "L01s36"
  ],
  "reward": {
   "xp": 52
  },
  "storyDe": "Ein stiller Umweg führt zu Brackwasserbrücke.",
  "storyEn": "A quiet detour leads to Brackwasserbrücke."
 },
 {
  "id": "L01s29",
  "league": 1,
  "place": "Steinkreis",
  "col": 3,
  "row": 6,
  "map": "arena",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 60,
   "gold": 48
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Steinkreis.",
  "storyEn": "A side path branches toward Steinkreis."
 },
 {
  "id": "L01s30",
  "league": 1,
  "place": "Lindenhain",
  "col": 4,
  "row": 6,
  "map": "arena",
  "chapter": 3,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L01s35"
  ],
  "reward": {
   "xp": 78
  },
  "storyDe": "Die Prüfung wartet bei Lindenhain.",
  "storyEn": "The trial waits at Lindenhain."
 },
 {
  "id": "L01s31",
  "league": 1,
  "place": "Hirtenruh",
  "col": 5,
  "row": 6,
  "map": "skirmish",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 60,
   "gold": 27
  },
  "storyDe": "Ein stiller Umweg führt zu Hirtenruh.",
  "storyEn": "A quiet detour leads to Hirtenruh."
 },
 {
  "id": "L01s32",
  "league": 1,
  "place": "Königsallee",
  "col": 1,
  "row": 6,
  "map": "courtyard",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 60,
   "gold": 48
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Königsallee.",
  "storyEn": "A side path branches toward Königsallee."
 },
 {
  "id": "L01s33",
  "league": 1,
  "place": "Pilgerpfad",
  "col": 5,
  "row": 6,
  "map": "gauntlet",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L01s31"
  ],
  "reward": {
   "xp": 60
  },
  "storyDe": "Abseits des Weges liegt Pilgerpfad.",
  "storyEn": "Off the road lies Pilgerpfad."
 },
 {
  "id": "L01s34",
  "league": 1,
  "place": "Rabenstieg",
  "col": 5,
  "row": 7,
  "map": "arena",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L01s33"
  ],
  "reward": {
   "xp": 52
  },
  "storyDe": "Ein stiller Umweg führt zu Rabenstieg.",
  "storyEn": "A quiet detour leads to Rabenstieg."
 },
 {
  "id": "L01s35",
  "league": 1,
  "place": "Kronenstadt",
  "col": 4,
  "row": 7,
  "map": "classic",
  "chapter": 3,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L01s34",
   "L01s37"
  ],
  "reward": {
   "xp": 81
  },
  "storyDe": "Die Prüfung wartet bei Kronenstadt.",
  "storyEn": "The trial waits at Kronenstadt."
 },
 {
  "id": "L01s36",
  "league": 1,
  "place": "Feldkapelle",
  "col": 3,
  "row": 7,
  "map": "skirmish",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L01s38"
  ],
  "reward": {
   "xp": 60
  },
  "storyDe": "Abseits des Weges liegt Feldkapelle.",
  "storyEn": "Off the road lies Feldkapelle."
 },
 {
  "id": "L01s37",
  "league": 1,
  "place": "Eisenbollwerk",
  "col": 4,
  "row": 7,
  "map": "skirmish",
  "chapter": 4,
  "haupt": true,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L01s39"
  ],
  "reward": {
   "xp": 84
  },
  "storyDe": "Der letzte Anstieg:  Eisenbollwerk.",
  "storyEn": "The final ascent:  Eisenbollwerk."
 },
 {
  "id": "L01s38",
  "league": 1,
  "place": "Heckenrondell",
  "col": 3,
  "row": 7,
  "map": "gauntlet",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L01s41"
  ],
  "reward": {
   "xp": 60
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Heckenrondell.",
  "storyEn": "A side path branches toward Heckenrondell."
 },
 {
  "id": "L01s39",
  "league": 1,
  "place": "Grenzwall",
  "col": 4,
  "row": 7,
  "map": "courtyard",
  "chapter": 4,
  "haupt": true,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L01s40"
  ],
  "reward": {
   "xp": 87
  },
  "storyDe": "Der letzte Anstieg:  Grenzwall.",
  "storyEn": "The final ascent:  Grenzwall."
 },
 {
  "id": "L01s40",
  "league": 1,
  "place": "Hohes Heiligtum",
  "col": 4,
  "row": 8,
  "map": "gauntlet",
  "chapter": 4,
  "haupt": true,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L01s42"
  ],
  "reward": {
   "xp": 90
  },
  "storyDe": "Der letzte Anstieg:  Hohes Heiligtum.",
  "storyEn": "The final ascent:  Hohes Heiligtum.",
  "boss": {
   "piece": "paladin",
   "wins": 1
  },
  "tier": 2
 },
 {
  "id": "L01s41",
  "league": 1,
  "place": "Torfstich",
  "col": 3,
  "row": 8,
  "map": "skirmish",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 60,
   "gold": 48
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Torfstich.",
  "storyEn": "A side path branches toward Torfstich."
 },
 {
  "id": "L01s42",
  "league": 1,
  "place": "Ratshalle",
  "col": 5,
  "row": 8,
  "map": "arena",
  "chapter": 4,
  "haupt": true,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L01s43"
  ],
  "reward": {
   "xp": 93
  },
  "storyDe": "Der letzte Anstieg:  Ratshalle.",
  "storyEn": "The final ascent:  Ratshalle."
 },
 {
  "id": "L01s43",
  "league": 1,
  "place": "Schmiedegrund",
  "col": 5,
  "row": 9,
  "map": "classic",
  "chapter": 4,
  "haupt": true,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L01s44"
  ],
  "reward": {
   "xp": 96
  },
  "storyDe": "Der letzte Anstieg:  Schmiedegrund.",
  "storyEn": "The final ascent:  Schmiedegrund."
 },
 {
  "id": "L01s44",
  "league": 1,
  "place": "Bannerhöhe",
  "col": 5,
  "row": 9,
  "map": "skirmish",
  "chapter": 4,
  "haupt": true,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 99,
   "gold": 24
  },
  "storyDe": "Bannerhöhe: Hier wartet der Meister von Kapitel I.",
  "storyEn": "Bannerhöhe: here waits the master of chapter I.",
  "final": true,
  "boss": {
   "pure": "b12"
  },
  "tier": 4
 },
 {
  "id": "L02s00",
  "league": 2,
  "place": "Sichelmark",
  "col": 1,
  "row": 1,
  "map": "classic",
  "chapter": 1,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L02s02"
  ],
  "reward": {
   "xp": 42
  },
  "storyDe": "Der Weg beginnt bei Sichelmark.",
  "storyEn": "The road begins at Sichelmark."
 },
 {
  "id": "L02s01",
  "league": 2,
  "place": "Waage und Wort",
  "col": 3,
  "row": 2,
  "map": "skirmish",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 66,
   "gold": 32
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Waage und Wort.",
  "storyEn": "A side path branches toward Waage und Wort."
 },
 {
  "id": "L02s02",
  "league": 2,
  "place": "Zehntwacht",
  "col": 1,
  "row": 2,
  "map": "skirmish",
  "chapter": 1,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L02s03",
   "L02s04"
  ],
  "reward": {
   "xp": 45
  },
  "storyDe": "Der Weg beginnt bei Zehntwacht.",
  "storyEn": "The road begins at Zehntwacht."
 },
 {
  "id": "L02s03",
  "league": 2,
  "place": "Kapelle im Korn",
  "col": 1,
  "row": 2,
  "map": "courtyard",
  "chapter": 1,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L02s04",
   "L02s06"
  ],
  "reward": {
   "xp": 48
  },
  "storyDe": "Der Weg beginnt bei Kapelle im Korn.",
  "storyEn": "The road begins at Kapelle im Korn."
 },
 {
  "id": "L02s04",
  "league": 2,
  "place": "Glutstoppel",
  "col": 1,
  "row": 3,
  "map": "arena",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L02s09"
  ],
  "reward": {
   "xp": 58
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Glutstoppel.",
  "storyEn": "A side path branches toward Glutstoppel.",
  "gate": {
   "gold": 35
  },
  "tagDe": "Zollstation",
  "tagEn": "Toll station"
 },
 {
  "id": "L02s05",
  "league": 2,
  "place": "Fronburg",
  "col": 3,
  "row": 3,
  "map": "classic",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L02s01"
  ],
  "reward": {
   "xp": 66
  },
  "storyDe": "Abseits des Weges liegt Fronburg.",
  "storyEn": "Off the road lies Fronburg."
 },
 {
  "id": "L02s06",
  "league": 2,
  "place": "Garbenwall",
  "col": 1,
  "row": 3,
  "map": "gauntlet",
  "chapter": 1,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L02s07"
  ],
  "reward": {
   "xp": 51
  },
  "storyDe": "Der Weg beginnt bei Garbenwall.",
  "storyEn": "The road begins at Garbenwall."
 },
 {
  "id": "L02s07",
  "league": 2,
  "place": "Krähenschreck",
  "col": 2,
  "row": 3,
  "map": "arena",
  "chapter": 1,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L02s10"
  ],
  "reward": {
   "xp": 54
  },
  "storyDe": "Der Weg beginnt bei Krähenschreck.",
  "storyEn": "The road begins at Krähenschreck."
 },
 {
  "id": "L02s08",
  "league": 2,
  "place": "Leere Scheune",
  "col": 3,
  "row": 3,
  "map": "gauntlet",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L02s05"
  ],
  "reward": {
   "xp": 58
  },
  "storyDe": "Abseits des Weges liegt Leere Scheune.",
  "storyEn": "Off the road lies Leere Scheune."
 },
 {
  "id": "L02s09",
  "league": 2,
  "place": "Wetterhahnturm",
  "col": 1,
  "row": 3,
  "map": "arena",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L02s13"
  ],
  "reward": {
   "xp": 66
  },
  "storyDe": "Ein stiller Umweg führt zu Wetterhahnturm.",
  "storyEn": "A quiet detour leads to Wetterhahnturm."
 },
 {
  "id": "L02s10",
  "league": 2,
  "place": "Der lange Acker",
  "col": 2,
  "row": 4,
  "map": "classic",
  "chapter": 2,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L02s12"
  ],
  "reward": {
   "xp": 57
  },
  "storyDe": "Der Pfad führt weiter über Der lange Acker.",
  "storyEn": "The path leads on across Der lange Acker.",
  "boss": {
   "pure": "b02",
   "rotation": [
    "b02",
    "b11"
   ]
  },
  "tier": 2
 },
 {
  "id": "L02s11",
  "league": 2,
  "place": "Wende des Lichts",
  "col": 5,
  "row": 4,
  "map": "skirmish",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 66,
   "gold": 32
  },
  "storyDe": "Abseits des Weges liegt Wende des Lichts.",
  "storyEn": "Off the road lies Wende des Lichts."
 },
 {
  "id": "L02s12",
  "league": 2,
  "place": "Wo die Sense ruht",
  "col": 2,
  "row": 4,
  "map": "skirmish",
  "chapter": 2,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L02s08",
   "L02s15"
  ],
  "reward": {
   "xp": 60
  },
  "storyDe": "Der Pfad führt weiter über Wo die Sense ruht.",
  "storyEn": "The path leads on across Wo die Sense ruht."
 },
 {
  "id": "L02s13",
  "league": 2,
  "place": "Königsstroh",
  "col": 1,
  "row": 4,
  "map": "gauntlet",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L02s14",
   "L02s18"
  ],
  "reward": {
   "xp": 66
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Königsstroh.",
  "storyEn": "A side path branches toward Königsstroh."
 },
 {
  "id": "L02s14",
  "league": 2,
  "place": "Aschengarbe",
  "col": 1,
  "row": 4,
  "map": "arena",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 66,
   "gold": 56
  },
  "storyDe": "Abseits des Weges liegt Aschengarbe.",
  "storyEn": "Off the road lies Aschengarbe."
 },
 {
  "id": "L02s15",
  "league": 2,
  "place": "Spreugericht",
  "col": 3,
  "row": 5,
  "map": "courtyard",
  "chapter": 2,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L02s17"
  ],
  "reward": {
   "xp": 63
  },
  "storyDe": "Der Pfad führt weiter über Spreugericht.",
  "storyEn": "The path leads on across Spreugericht."
 },
 {
  "id": "L02s16",
  "league": 2,
  "place": "Osrics Speicher",
  "col": 4,
  "row": 5,
  "map": "skirmish",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L02s11"
  ],
  "reward": {
   "xp": 66
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Osrics Speicher.",
  "storyEn": "A side path branches toward Osrics Speicher."
 },
 {
  "id": "L02s17",
  "league": 2,
  "place": "Mittsommerbank",
  "col": 3,
  "row": 5,
  "map": "gauntlet",
  "chapter": 2,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L02s21"
  ],
  "reward": {
   "xp": 66
  },
  "storyDe": "Der Pfad führt weiter über Mittsommerbank.",
  "storyEn": "The path leads on across Mittsommerbank."
 },
 {
  "id": "L02s18",
  "league": 2,
  "place": "Fuhrmannsrast",
  "col": 1,
  "row": 5,
  "map": "gauntlet",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L02s23"
  ],
  "reward": {
   "xp": 66
  },
  "storyDe": "Ein stiller Umweg führt zu Fuhrmannsrast.",
  "storyEn": "A quiet detour leads to Fuhrmannsrast."
 },
 {
  "id": "L02s19",
  "league": 2,
  "place": "Dürretor",
  "col": 4,
  "row": 5,
  "map": "arena",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L02s16"
  ],
  "reward": {
   "xp": 58
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Dürretor.",
  "storyEn": "A side path branches toward Dürretor."
 },
 {
  "id": "L02s20",
  "league": 2,
  "place": "Dreschhof",
  "col": 3,
  "row": 5,
  "map": "classic",
  "chapter": 3,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L02s22"
  ],
  "reward": {
   "xp": 72
  },
  "storyDe": "Die Prüfung wartet bei Dreschhof.",
  "storyEn": "The trial waits at Dreschhof.",
  "boss": {
   "piece": "hawk",
   "wins": 1
  },
  "tier": 2
 },
 {
  "id": "L02s21",
  "league": 2,
  "place": "Lerchenhorst",
  "col": 3,
  "row": 5,
  "map": "arena",
  "chapter": 3,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L02s20",
   "L02s25"
  ],
  "reward": {
   "xp": 69
  },
  "storyDe": "Die Prüfung wartet bei Lerchenhorst.",
  "storyEn": "The trial waits at Lerchenhorst."
 },
 {
  "id": "L02s22",
  "league": 2,
  "place": "Schwelrain",
  "col": 4,
  "row": 6,
  "map": "skirmish",
  "chapter": 3,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L02s19",
   "L02s24"
  ],
  "reward": {
   "xp": 75
  },
  "storyDe": "Die Prüfung wartet bei Schwelrain.",
  "storyEn": "The trial waits at Schwelrain."
 },
 {
  "id": "L02s23",
  "league": 2,
  "place": "Erntewiege",
  "col": 1,
  "row": 6,
  "map": "gauntlet",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L02s28"
  ],
  "reward": {
   "xp": 66
  },
  "storyDe": "Abseits des Weges liegt Erntewiege.",
  "storyEn": "Off the road lies Erntewiege."
 },
 {
  "id": "L02s24",
  "league": 2,
  "place": "Brandblatt",
  "col": 4,
  "row": 6,
  "map": "courtyard",
  "chapter": 3,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L02s30"
  ],
  "reward": {
   "xp": 78
  },
  "storyDe": "Die Prüfung wartet bei Brandblatt.",
  "storyEn": "The trial waits at Brandblatt."
 },
 {
  "id": "L02s25",
  "league": 2,
  "place": "Mohnwerder",
  "col": 3,
  "row": 6,
  "map": "classic",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L02s27",
   "L02s31"
  ],
  "reward": {
   "xp": 58
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Mohnwerder.",
  "storyEn": "A side path branches toward Mohnwerder."
 },
 {
  "id": "L02s26",
  "league": 2,
  "place": "Gebeugte Kapelle",
  "col": 5,
  "row": 6,
  "map": "skirmish",
  "chapter": 4,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 66,
   "gold": 32
  },
  "storyDe": "Abseits des Weges liegt Gebeugte Kapelle.",
  "storyEn": "Off the road lies Gebeugte Kapelle."
 },
 {
  "id": "L02s27",
  "league": 2,
  "place": "Sichelbucht",
  "col": 3,
  "row": 6,
  "map": "courtyard",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L02s32"
  ],
  "reward": {
   "xp": 66
  },
  "storyDe": "Ein stiller Umweg führt zu Sichelbucht.",
  "storyEn": "A quiet detour leads to Sichelbucht."
 },
 {
  "id": "L02s28",
  "league": 2,
  "place": "Flammenfurt",
  "col": 1,
  "row": 6,
  "map": "gauntlet",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 66
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Flammenfurt.",
  "storyEn": "A side path branches toward Flammenfurt.",
  "boss": {
   "piece": "bard",
   "wins": 1
  },
  "tier": 1
 },
 {
  "id": "L02s29",
  "league": 2,
  "place": "Halmbruch",
  "col": 5,
  "row": 6,
  "map": "arena",
  "chapter": 4,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L02s26"
  ],
  "reward": {
   "xp": 66
  },
  "storyDe": "Abseits des Weges liegt Halmbruch.",
  "storyEn": "Off the road lies Halmbruch."
 },
 {
  "id": "L02s30",
  "league": 2,
  "place": "Volle Scheuer",
  "col": 4,
  "row": 7,
  "map": "gauntlet",
  "chapter": 3,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L02s34"
  ],
  "reward": {
   "xp": 81
  },
  "storyDe": "Die Prüfung wartet bei Volle Scheuer.",
  "storyEn": "The trial waits at Volle Scheuer."
 },
 {
  "id": "L02s31",
  "league": 2,
  "place": "Dörrkammer",
  "col": 3,
  "row": 7,
  "map": "skirmish",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L02s35"
  ],
  "reward": {
   "xp": 66
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Dörrkammer.",
  "storyEn": "A side path branches toward Dörrkammer."
 },
 {
  "id": "L02s32",
  "league": 2,
  "place": "Windfähre",
  "col": 2,
  "row": 7,
  "map": "courtyard",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 66,
   "gold": 56
  },
  "storyDe": "Abseits des Weges liegt Windfähre.",
  "storyEn": "Off the road lies Windfähre."
 },
 {
  "id": "L02s33",
  "league": 2,
  "place": "Mautbalken",
  "col": 5,
  "row": 7,
  "map": "gauntlet",
  "chapter": 4,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L02s29"
  ],
  "reward": {
   "xp": 58
  },
  "storyDe": "Ein stiller Umweg führt zu Mautbalken.",
  "storyEn": "A quiet detour leads to Mautbalken."
 },
 {
  "id": "L02s34",
  "league": 2,
  "place": "Lindensitz",
  "col": 4,
  "row": 7,
  "map": "arena",
  "chapter": 4,
  "haupt": true,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L02s33",
   "L02s36"
  ],
  "reward": {
   "xp": 84
  },
  "storyDe": "Der letzte Anstieg:  Lindensitz.",
  "storyEn": "The final ascent:  Lindensitz."
 },
 {
  "id": "L02s35",
  "league": 2,
  "place": "Bei den Schnittern",
  "col": 3,
  "row": 7,
  "map": "classic",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L02s37"
  ],
  "reward": {
   "xp": 66
  },
  "storyDe": "Abseits des Weges liegt Bei den Schnittern.",
  "storyEn": "Off the road lies Bei den Schnittern."
 },
 {
  "id": "L02s36",
  "league": 2,
  "place": "Fürstenmahd",
  "col": 4,
  "row": 8,
  "map": "classic",
  "chapter": 4,
  "haupt": true,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L02s38"
  ],
  "reward": {
   "xp": 87
  },
  "storyDe": "Der letzte Anstieg:  Fürstenmahd.",
  "storyEn": "The final ascent:  Fürstenmahd."
 },
 {
  "id": "L02s37",
  "league": 2,
  "place": "Der Schweigende Halm",
  "col": 3,
  "row": 8,
  "map": "courtyard",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L02s39"
  ],
  "reward": {
   "xp": 66
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Der Schweigende Halm.",
  "storyEn": "A side path branches toward Der Schweigende Halm."
 },
 {
  "id": "L02s38",
  "league": 2,
  "place": "Der Steinerne Pflug",
  "col": 4,
  "row": 8,
  "map": "skirmish",
  "chapter": 4,
  "haupt": true,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L02s40"
  ],
  "reward": {
   "xp": 90
  },
  "storyDe": "Der letzte Anstieg:  Der Steinerne Pflug.",
  "storyEn": "The final ascent:  Der Steinerne Pflug."
 },
 {
  "id": "L02s39",
  "league": 2,
  "place": "Welkgart",
  "col": 2,
  "row": 8,
  "map": "arena",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 66,
   "gold": 56
  },
  "storyDe": "Ein stiller Umweg führt zu Welkgart.",
  "storyEn": "A quiet detour leads to Welkgart."
 },
 {
  "id": "L02s40",
  "league": 2,
  "place": "Grenzmark",
  "col": 5,
  "row": 9,
  "map": "courtyard",
  "chapter": 4,
  "haupt": true,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L02s41"
  ],
  "reward": {
   "xp": 93
  },
  "storyDe": "Der letzte Anstieg:  Grenzmark.",
  "storyEn": "The final ascent:  Grenzmark."
 },
 {
  "id": "L02s41",
  "league": 2,
  "place": "Kanzel im Weizen",
  "col": 5,
  "row": 9,
  "map": "gauntlet",
  "chapter": 4,
  "haupt": true,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 96,
   "gold": 28
  },
  "storyDe": "Kanzel im Weizen: Hier wartet der Meister von Kapitel II.",
  "storyEn": "Kanzel im Weizen: here waits the master of chapter II.",
  "final": true,
  "boss": {
   "pure": "b10"
  },
  "tier": 4
 },
 {
  "id": "L03s00",
  "league": 3,
  "place": "Erstes Rot",
  "col": 0,
  "row": 1,
  "map": "classic",
  "chapter": 1,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L03s04"
  ],
  "reward": {
   "xp": 48
  },
  "storyDe": "Der Weg beginnt bei Erstes Rot.",
  "storyEn": "The road begins at Erstes Rot."
 },
 {
  "id": "L03s01",
  "league": 3,
  "place": "Laubpresse",
  "col": 2,
  "row": 1,
  "map": "skirmish",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 72,
   "gold": 37
  },
  "storyDe": "Abseits des Weges liegt Laubpresse.",
  "storyEn": "Off the road lies Laubpresse."
 },
 {
  "id": "L03s02",
  "league": 3,
  "place": "Rostlaube",
  "col": 1,
  "row": 2,
  "map": "skirmish",
  "chapter": 1,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L03s06"
  ],
  "reward": {
   "xp": 51
  },
  "storyDe": "Der Weg beginnt bei Rostlaube.",
  "storyEn": "The road begins at Rostlaube."
 },
 {
  "id": "L03s03",
  "league": 3,
  "place": "Wipfelkanzel",
  "col": 5,
  "row": 2,
  "map": "gauntlet",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 72,
   "gold": 64
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Wipfelkanzel.",
  "storyEn": "A side path branches toward Wipfelkanzel."
 },
 {
  "id": "L03s04",
  "league": 3,
  "place": "Halle der zwei Schwüre",
  "col": 1,
  "row": 2,
  "map": "arena",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L03s02",
   "L03s09"
  ],
  "reward": {
   "xp": 64
  },
  "storyDe": "Abseits des Weges liegt Halle der zwei Schwüre.",
  "storyEn": "Off the road lies Halle der zwei Schwüre."
 },
 {
  "id": "L03s05",
  "league": 3,
  "place": "Harzträne",
  "col": 2,
  "row": 2,
  "map": "classic",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L03s01"
  ],
  "reward": {
   "xp": 72
  },
  "storyDe": "Ein stiller Umweg führt zu Harzträne.",
  "storyEn": "A quiet detour leads to Harzträne."
 },
 {
  "id": "L03s06",
  "league": 3,
  "place": "Bernsteinaltar",
  "col": 1,
  "row": 3,
  "map": "courtyard",
  "chapter": 1,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L03s07"
  ],
  "reward": {
   "xp": 54
  },
  "storyDe": "Der Weg beginnt bei Bernsteinaltar.",
  "storyEn": "The road begins at Bernsteinaltar."
 },
 {
  "id": "L03s07",
  "league": 3,
  "place": "Kastanienhall",
  "col": 2,
  "row": 3,
  "map": "gauntlet",
  "chapter": 1,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L03s11"
  ],
  "reward": {
   "xp": 57
  },
  "storyDe": "Der Weg beginnt bei Kastanienhall.",
  "storyEn": "The road begins at Kastanienhall."
 },
 {
  "id": "L03s08",
  "league": 3,
  "place": "Pilzring",
  "col": 2,
  "row": 3,
  "map": "gauntlet",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L03s05"
  ],
  "reward": {
   "xp": 64
  },
  "storyDe": "Ein stiller Umweg führt zu Pilzring.",
  "storyEn": "A quiet detour leads to Pilzring."
 },
 {
  "id": "L03s09",
  "league": 3,
  "place": "Morschenburg",
  "col": 1,
  "row": 3,
  "map": "arena",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L03s12"
  ],
  "reward": {
   "xp": 72
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Morschenburg.",
  "storyEn": "A side path branches toward Morschenburg."
 },
 {
  "id": "L03s10",
  "league": 3,
  "place": "Sturmlaub",
  "col": 5,
  "row": 4,
  "map": "classic",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L03s03"
  ],
  "reward": {
   "xp": 72
  },
  "storyDe": "Abseits des Weges liegt Sturmlaub.",
  "storyEn": "Off the road lies Sturmlaub."
 },
 {
  "id": "L03s11",
  "league": 3,
  "place": "Ockergrund",
  "col": 2,
  "row": 4,
  "map": "arena",
  "chapter": 2,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L03s08",
   "L03s13"
  ],
  "reward": {
   "xp": 60
  },
  "storyDe": "Der Pfad führt weiter über Ockergrund.",
  "storyEn": "The path leads on across Ockergrund."
 },
 {
  "id": "L03s12",
  "league": 3,
  "place": "Dämmerlaube",
  "col": 1,
  "row": 4,
  "map": "courtyard",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L03s16"
  ],
  "reward": {
   "xp": 72
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Dämmerlaube.",
  "storyEn": "A side path branches toward Dämmerlaube."
 },
 {
  "id": "L03s13",
  "league": 3,
  "place": "Der Rehpfad",
  "col": 2,
  "row": 4,
  "map": "classic",
  "chapter": 2,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L03s15"
  ],
  "reward": {
   "xp": 63
  },
  "storyDe": "Der Pfad führt weiter über Der Rehpfad.",
  "storyEn": "The path leads on across Der Rehpfad.",
  "boss": {
   "pure": "b24",
   "rotation": [
    "b24",
    "b05"
   ]
  },
  "tier": 3
 },
 {
  "id": "L03s14",
  "league": 3,
  "place": "Königslaub",
  "col": 5,
  "row": 4,
  "map": "arena",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L03s10"
  ],
  "reward": {
   "xp": 72
  },
  "storyDe": "Ein stiller Umweg führt zu Königslaub.",
  "storyEn": "A quiet detour leads to Königslaub."
 },
 {
  "id": "L03s15",
  "league": 3,
  "place": "Wo der Eid brach",
  "col": 2,
  "row": 5,
  "map": "skirmish",
  "chapter": 2,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L03s17"
  ],
  "reward": {
   "xp": 66
  },
  "storyDe": "Der Pfad führt weiter über Wo der Eid brach.",
  "storyEn": "The path leads on across Wo der Eid brach."
 },
 {
  "id": "L03s16",
  "league": 3,
  "place": "Gilbfeuer",
  "col": 1,
  "row": 5,
  "map": "skirmish",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L03s21"
  ],
  "reward": {
   "xp": 72
  },
  "storyDe": "Abseits des Weges liegt Gilbfeuer.",
  "storyEn": "Off the road lies Gilbfeuer."
 },
 {
  "id": "L03s17",
  "league": 3,
  "place": "Klingenwald",
  "col": 3,
  "row": 5,
  "map": "courtyard",
  "chapter": 2,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L03s19",
   "L03s20"
  ],
  "reward": {
   "xp": 69
  },
  "storyDe": "Der Pfad führt weiter über Klingenwald.",
  "storyEn": "The path leads on across Klingenwald."
 },
 {
  "id": "L03s18",
  "league": 3,
  "place": "Der geteilte Schwur",
  "col": 5,
  "row": 5,
  "map": "gauntlet",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L03s14"
  ],
  "reward": {
   "xp": 72
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Der geteilte Schwur.",
  "storyEn": "A side path branches toward Der geteilte Schwur."
 },
 {
  "id": "L03s19",
  "league": 3,
  "place": "Köhlersitz",
  "col": 2,
  "row": 6,
  "map": "arena",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L03s24"
  ],
  "reward": {
   "xp": 64
  },
  "storyDe": "Abseits des Weges liegt Köhlersitz.",
  "storyEn": "Off the road lies Köhlersitz."
 },
 {
  "id": "L03s20",
  "league": 3,
  "place": "Erntedank",
  "col": 3,
  "row": 6,
  "map": "gauntlet",
  "chapter": 3,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L03s23"
  ],
  "reward": {
   "xp": 72
  },
  "storyDe": "Die Prüfung wartet bei Erntedank.",
  "storyEn": "The trial waits at Erntedank."
 },
 {
  "id": "L03s21",
  "league": 3,
  "place": "Moderpforte",
  "col": 1,
  "row": 6,
  "map": "skirmish",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 72,
   "gold": 64
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Moderpforte.",
  "storyEn": "A side path branches toward Moderpforte."
 },
 {
  "id": "L03s22",
  "league": 3,
  "place": "Wandererrast",
  "col": 5,
  "row": 6,
  "map": "courtyard",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L03s18",
   "L03s25"
  ],
  "reward": {
   "xp": 72
  },
  "storyDe": "Abseits des Weges liegt Wandererrast.",
  "storyEn": "Off the road lies Wandererrast."
 },
 {
  "id": "L03s23",
  "league": 3,
  "place": "Drosselsang",
  "col": 3,
  "row": 6,
  "map": "arena",
  "chapter": 3,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L03s27",
   "L03s28"
  ],
  "reward": {
   "xp": 75
  },
  "storyDe": "Die Prüfung wartet bei Drosselsang.",
  "storyEn": "The trial waits at Drosselsang.",
  "boss": {
   "piece": "alchemist",
   "wins": 1
  },
  "tier": 3
 },
 {
  "id": "L03s24",
  "league": 3,
  "place": "Eichelschatz",
  "col": 2,
  "row": 6,
  "map": "arena",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L03s29"
  ],
  "reward": {
   "xp": 72
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Eichelschatz.",
  "storyEn": "A side path branches toward Eichelschatz."
 },
 {
  "id": "L03s25",
  "league": 3,
  "place": "Verhüllter Altar",
  "col": 5,
  "row": 6,
  "map": "classic",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L03s30"
  ],
  "reward": {
   "xp": 72
  },
  "storyDe": "Abseits des Weges liegt Verhüllter Altar.",
  "storyEn": "Off the road lies Verhüllter Altar."
 },
 {
  "id": "L03s26",
  "league": 3,
  "place": "Treibholzufer",
  "col": 4,
  "row": 6,
  "map": "skirmish",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L03s22"
  ],
  "reward": {
   "xp": 64
  },
  "storyDe": "Ein stiller Umweg führt zu Treibholzufer.",
  "storyEn": "A quiet detour leads to Treibholzufer.",
  "gate": {
   "gold": 45
  },
  "tagDe": "Zollstation",
  "tagEn": "Toll station"
 },
 {
  "id": "L03s27",
  "league": 3,
  "place": "Schwelnest",
  "col": 4,
  "row": 6,
  "map": "classic",
  "chapter": 3,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L03s31"
  ],
  "reward": {
   "xp": 78
  },
  "storyDe": "Die Prüfung wartet bei Schwelnest.",
  "storyEn": "The trial waits at Schwelnest."
 },
 {
  "id": "L03s28",
  "league": 3,
  "place": "Fuchsfurt",
  "col": 3,
  "row": 6,
  "map": "gauntlet",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L03s33"
  ],
  "reward": {
   "xp": 64
  },
  "storyDe": "Abseits des Weges liegt Fuchsfurt.",
  "storyEn": "Off the road lies Fuchsfurt."
 },
 {
  "id": "L03s29",
  "league": 3,
  "place": "Wurzelgewölbe",
  "col": 2,
  "row": 6,
  "map": "arena",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L03s32"
  ],
  "reward": {
   "xp": 72
  },
  "storyDe": "Ein stiller Umweg führt zu Wurzelgewölbe.",
  "storyEn": "A quiet detour leads to Wurzelgewölbe."
 },
 {
  "id": "L03s30",
  "league": 3,
  "place": "Eulenwarte",
  "col": 5,
  "row": 6,
  "map": "classic",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 72,
   "gold": 64
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Eulenwarte.",
  "storyEn": "A side path branches toward Eulenwarte."
 },
 {
  "id": "L03s31",
  "league": 3,
  "place": "Falbes Licht",
  "col": 4,
  "row": 7,
  "map": "skirmish",
  "chapter": 3,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L03s26",
   "L03s34"
  ],
  "reward": {
   "xp": 81
  },
  "storyDe": "Die Prüfung wartet bei Falbes Licht.",
  "storyEn": "The trial waits at Falbes Licht."
 },
 {
  "id": "L03s32",
  "league": 3,
  "place": "Blätterkahn",
  "col": 2,
  "row": 7,
  "map": "courtyard",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L03s36"
  ],
  "reward": {
   "xp": 72
  },
  "storyDe": "Ein stiller Umweg führt zu Blätterkahn.",
  "storyEn": "A quiet detour leads to Blätterkahn."
 },
 {
  "id": "L03s33",
  "league": 3,
  "place": "Ahornbrück",
  "col": 3,
  "row": 7,
  "map": "gauntlet",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L03s35"
  ],
  "reward": {
   "xp": 72
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Ahornbrück.",
  "storyEn": "A side path branches toward Ahornbrück."
 },
 {
  "id": "L03s34",
  "league": 3,
  "place": "Fallendes Laub",
  "col": 4,
  "row": 7,
  "map": "courtyard",
  "chapter": 4,
  "haupt": true,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L03s37"
  ],
  "reward": {
   "xp": 84
  },
  "storyDe": "Der letzte Anstieg:  Fallendes Laub.",
  "storyEn": "The final ascent:  Fallendes Laub."
 },
 {
  "id": "L03s35",
  "league": 3,
  "place": "Marderschlupf",
  "col": 3,
  "row": 7,
  "map": "classic",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L03s38"
  ],
  "reward": {
   "xp": 72
  },
  "storyDe": "Ein stiller Umweg führt zu Marderschlupf.",
  "storyEn": "A quiet detour leads to Marderschlupf."
 },
 {
  "id": "L03s36",
  "league": 3,
  "place": "Der Stumme Hain",
  "col": 2,
  "row": 7,
  "map": "skirmish",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 72,
   "gold": 64
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Der Stumme Hain.",
  "storyEn": "A side path branches toward Der Stumme Hain."
 },
 {
  "id": "L03s37",
  "league": 3,
  "place": "Zwillingsfeste",
  "col": 4,
  "row": 8,
  "map": "gauntlet",
  "chapter": 4,
  "haupt": true,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L03s39"
  ],
  "reward": {
   "xp": 87
  },
  "storyDe": "Der letzte Anstieg:  Zwillingsfeste.",
  "storyEn": "The final ascent:  Zwillingsfeste."
 },
 {
  "id": "L03s38",
  "league": 3,
  "place": "Modergraben",
  "col": 4,
  "row": 8,
  "map": "gauntlet",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L03s40"
  ],
  "reward": {
   "xp": 72
  },
  "storyDe": "Ein stiller Umweg führt zu Modergraben.",
  "storyEn": "A quiet detour leads to Modergraben."
 },
 {
  "id": "L03s39",
  "league": 3,
  "place": "Lindenschatten",
  "col": 4,
  "row": 8,
  "map": "arena",
  "chapter": 4,
  "haupt": true,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L03s41"
  ],
  "reward": {
   "xp": 90
  },
  "storyDe": "Der letzte Anstieg:  Lindenschatten.",
  "storyEn": "The final ascent:  Lindenschatten."
 },
 {
  "id": "L03s40",
  "league": 3,
  "place": "Reisigschneise",
  "col": 3,
  "row": 8,
  "map": "classic",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 72,
   "gold": 64
  },
  "storyDe": "Abseits des Weges liegt Reisigschneise.",
  "storyEn": "Off the road lies Reisigschneise."
 },
 {
  "id": "L03s41",
  "league": 3,
  "place": "Amselthron",
  "col": 4,
  "row": 9,
  "map": "classic",
  "chapter": 4,
  "haupt": true,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L03s42"
  ],
  "reward": {
   "xp": 93
  },
  "storyDe": "Der letzte Anstieg:  Amselthron.",
  "storyEn": "The final ascent:  Amselthron."
 },
 {
  "id": "L03s42",
  "league": 3,
  "place": "Der Rostige Riegel",
  "col": 4,
  "row": 9,
  "map": "skirmish",
  "chapter": 4,
  "haupt": true,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 96,
   "gold": 32
  },
  "storyDe": "Der Rostige Riegel: Hier wartet der Meister von Kapitel III.",
  "storyEn": "Der Rostige Riegel: here waits the master of chapter III.",
  "final": true,
  "boss": {
   "pure": "b02"
  },
  "tier": 4
 },
 {
  "id": "L04s00",
  "league": 4,
  "place": "Über die Baumgrenze",
  "col": 0,
  "row": 1,
  "map": "classic",
  "chapter": 1,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L04s01"
  ],
  "reward": {
   "xp": 54
  },
  "storyDe": "Der Weg beginnt bei Über die Baumgrenze.",
  "storyEn": "The road begins at Über die Baumgrenze."
 },
 {
  "id": "L04s01",
  "league": 4,
  "place": "Latschenfeld",
  "col": 1,
  "row": 1,
  "map": "skirmish",
  "chapter": 1,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L04s02"
  ],
  "reward": {
   "xp": 57
  },
  "storyDe": "Der Weg beginnt bei Latschenfeld.",
  "storyEn": "The road begins at Latschenfeld."
 },
 {
  "id": "L04s02",
  "league": 4,
  "place": "Die Windflüchter",
  "col": 1,
  "row": 2,
  "map": "courtyard",
  "chapter": 1,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L04s04"
  ],
  "reward": {
   "xp": 60
  },
  "storyDe": "Der Weg beginnt bei Die Windflüchter.",
  "storyEn": "The road begins at Die Windflüchter."
 },
 {
  "id": "L04s03",
  "league": 4,
  "place": "Die Kahle Kuppe",
  "col": 4,
  "row": 2,
  "map": "gauntlet",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L04s37"
  ],
  "reward": {
   "xp": 78
  },
  "storyDe": "Abseits des Weges liegt Die Kahle Kuppe.",
  "storyEn": "Off the road lies Die Kahle Kuppe."
 },
 {
  "id": "L04s04",
  "league": 4,
  "place": "Almrast",
  "col": 1,
  "row": 3,
  "map": "gauntlet",
  "chapter": 1,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L04s06"
  ],
  "reward": {
   "xp": 63
  },
  "storyDe": "Der Weg beginnt bei Almrast.",
  "storyEn": "The road begins at Almrast."
 },
 {
  "id": "L04s05",
  "league": 4,
  "place": "Hüttenrauch",
  "col": 4,
  "row": 3,
  "map": "classic",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L04s03"
  ],
  "reward": {
   "xp": 78
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Hüttenrauch.",
  "storyEn": "A side path branches toward Hüttenrauch."
 },
 {
  "id": "L04s06",
  "league": 4,
  "place": "Steinmandl",
  "col": 2,
  "row": 3,
  "map": "arena",
  "chapter": 1,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L04s08"
  ],
  "reward": {
   "xp": 66
  },
  "storyDe": "Der Weg beginnt bei Steinmandl.",
  "storyEn": "The road begins at Steinmandl."
 },
 {
  "id": "L04s07",
  "league": 4,
  "place": "Sennenwacht",
  "col": 3,
  "row": 4,
  "map": "courtyard",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L04s05"
  ],
  "reward": {
   "xp": 78
  },
  "storyDe": "Ein stiller Umweg führt zu Sennenwacht.",
  "storyEn": "A quiet detour leads to Sennenwacht."
 },
 {
  "id": "L04s08",
  "league": 4,
  "place": "Der Krumme Hain",
  "col": 2,
  "row": 4,
  "map": "classic",
  "chapter": 2,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L04s10"
  ],
  "reward": {
   "xp": 69
  },
  "storyDe": "Der Pfad führt weiter über Der Krumme Hain.",
  "storyEn": "The path leads on across Der Krumme Hain."
 },
 {
  "id": "L04s09",
  "league": 4,
  "place": "Der Steile Anger",
  "col": 3,
  "row": 4,
  "map": "arena",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L04s07"
  ],
  "reward": {
   "xp": 78
  },
  "storyDe": "Abseits des Weges liegt Der Steile Anger.",
  "storyEn": "Off the road lies Der Steile Anger."
 },
 {
  "id": "L04s10",
  "league": 4,
  "place": "Hirtenkanzel",
  "col": 2,
  "row": 4,
  "map": "skirmish",
  "chapter": 2,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L04s11",
   "L04s39"
  ],
  "reward": {
   "xp": 72
  },
  "storyDe": "Der Pfad führt weiter über Hirtenkanzel.",
  "storyEn": "The path leads on across Hirtenkanzel.",
  "boss": {
   "pure": "b09",
   "rotation": [
    "b09",
    "b13"
   ]
  },
  "tier": 2
 },
 {
  "id": "L04s11",
  "league": 4,
  "place": "Wetterbaum",
  "col": 2,
  "row": 4,
  "map": "courtyard",
  "chapter": 2,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L04s13"
  ],
  "reward": {
   "xp": 75
  },
  "storyDe": "Der Pfad führt weiter über Wetterbaum.",
  "storyEn": "The path leads on across Wetterbaum."
 },
 {
  "id": "L04s12",
  "league": 4,
  "place": "Käserast",
  "col": 3,
  "row": 4,
  "map": "classic",
  "chapter": 3,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L04s15",
   "L04s42"
  ],
  "reward": {
   "xp": 84
  },
  "storyDe": "Die Prüfung wartet bei Käserast.",
  "storyEn": "The trial waits at Käserast."
 },
 {
  "id": "L04s13",
  "league": 4,
  "place": "Zwieselgrund",
  "col": 2,
  "row": 4,
  "map": "gauntlet",
  "chapter": 2,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L04s14",
   "L04s41"
  ],
  "reward": {
   "xp": 78
  },
  "storyDe": "Der Pfad führt weiter über Zwieselgrund.",
  "storyEn": "The path leads on across Zwieselgrund."
 },
 {
  "id": "L04s14",
  "league": 4,
  "place": "Die letzte Alm",
  "col": 3,
  "row": 4,
  "map": "arena",
  "chapter": 2,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L04s12"
  ],
  "reward": {
   "xp": 81
  },
  "storyDe": "Der Pfad führt weiter über Die letzte Alm.",
  "storyEn": "The path leads on across Die letzte Alm."
 },
 {
  "id": "L04s15",
  "league": 4,
  "place": "Hochleger",
  "col": 3,
  "row": 5,
  "map": "skirmish",
  "chapter": 3,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L04s16"
  ],
  "reward": {
   "xp": 87
  },
  "storyDe": "Die Prüfung wartet bei Hochleger.",
  "storyEn": "The trial waits at Hochleger.",
  "boss": {
   "piece": "sorceress",
   "wins": 1
  },
  "tier": 3
 },
 {
  "id": "L04s16",
  "league": 4,
  "place": "Marchstein",
  "col": 3,
  "row": 5,
  "map": "courtyard",
  "chapter": 3,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L04s21"
  ],
  "reward": {
   "xp": 90
  },
  "storyDe": "Die Prüfung wartet bei Marchstein.",
  "storyEn": "The trial waits at Marchstein."
 },
 {
  "id": "L04s17",
  "league": 4,
  "place": "Wildheuplatz",
  "col": 5,
  "row": 5,
  "map": "courtyard",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 78,
   "gold": 72
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Wildheuplatz.",
  "storyEn": "A side path branches toward Wildheuplatz."
 },
 {
  "id": "L04s18",
  "league": 4,
  "place": "Felsenfenster",
  "col": 1,
  "row": 6,
  "map": "gauntlet",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L04s23"
  ],
  "reward": {
   "xp": 78
  },
  "storyDe": "Abseits des Weges liegt Felsenfenster.",
  "storyEn": "Off the road lies Felsenfenster."
 },
 {
  "id": "L04s19",
  "league": 4,
  "place": "Zundermoos",
  "col": 5,
  "row": 6,
  "map": "arena",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L04s17"
  ],
  "reward": {
   "xp": 78
  },
  "storyDe": "Ein stiller Umweg führt zu Zundermoos.",
  "storyEn": "A quiet detour leads to Zundermoos."
 },
 {
  "id": "L04s20",
  "league": 4,
  "place": "Die Wolkenweide",
  "col": 2,
  "row": 6,
  "map": "classic",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 78,
   "gold": 42
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Die Wolkenweide.",
  "storyEn": "A side path branches toward Die Wolkenweide."
 },
 {
  "id": "L04s21",
  "league": 4,
  "place": "Gamswechsel",
  "col": 4,
  "row": 6,
  "map": "gauntlet",
  "chapter": 3,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L04s24",
   "L04s36"
  ],
  "reward": {
   "xp": 93
  },
  "storyDe": "Die Prüfung wartet bei Gamswechsel.",
  "storyEn": "The trial waits at Gamswechsel."
 },
 {
  "id": "L04s22",
  "league": 4,
  "place": "Salzleck",
  "col": 5,
  "row": 6,
  "map": "courtyard",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L04s19",
   "L04s31"
  ],
  "reward": {
   "xp": 78
  },
  "storyDe": "Ein stiller Umweg führt zu Salzleck.",
  "storyEn": "A quiet detour leads to Salzleck."
 },
 {
  "id": "L04s23",
  "league": 4,
  "place": "Der Geduckte Forst",
  "col": 1,
  "row": 6,
  "map": "gauntlet",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L04s25"
  ],
  "reward": {
   "xp": 78
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Der Geduckte Forst.",
  "storyEn": "A side path branches toward Der Geduckte Forst."
 },
 {
  "id": "L04s24",
  "league": 4,
  "place": "Die Schindelhütte",
  "col": 4,
  "row": 7,
  "map": "arena",
  "chapter": 3,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L04s26",
   "L04s32"
  ],
  "reward": {
   "xp": 96
  },
  "storyDe": "Die Prüfung wartet bei Die Schindelhütte.",
  "storyEn": "The trial waits at Die Schindelhütte."
 },
 {
  "id": "L04s25",
  "league": 4,
  "place": "Gratrast",
  "col": 1,
  "row": 7,
  "map": "classic",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 78,
   "gold": 72
  },
  "storyDe": "Ein stiller Umweg führt zu Gratrast.",
  "storyEn": "A quiet detour leads to Gratrast."
 },
 {
  "id": "L04s26",
  "league": 4,
  "place": "Murmelfeld",
  "col": 4,
  "row": 7,
  "map": "skirmish",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L04s27"
  ],
  "reward": {
   "xp": 70
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Murmelfeld.",
  "storyEn": "A side path branches toward Murmelfeld."
 },
 {
  "id": "L04s27",
  "league": 4,
  "place": "Die Zwei Wetterfichten",
  "col": 4,
  "row": 8,
  "map": "courtyard",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L04s28"
  ],
  "reward": {
   "xp": 78
  },
  "storyDe": "Abseits des Weges liegt Die Zwei Wetterfichten.",
  "storyEn": "Off the road lies Die Zwei Wetterfichten."
 },
 {
  "id": "L04s28",
  "league": 4,
  "place": "Hangdorf",
  "col": 3,
  "row": 8,
  "map": "gauntlet",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 78,
   "gold": 42
  },
  "storyDe": "Ein stiller Umweg führt zu Hangdorf.",
  "storyEn": "A quiet detour leads to Hangdorf."
 },
 {
  "id": "L04s29",
  "league": 4,
  "place": "Almglocken",
  "col": 5,
  "row": 9,
  "map": "arena",
  "chapter": 4,
  "haupt": true,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L04s30"
  ],
  "reward": {
   "xp": 111
  },
  "storyDe": "Der letzte Anstieg:  Almglocken.",
  "storyEn": "The final ascent:  Almglocken."
 },
 {
  "id": "L04s30",
  "league": 4,
  "place": "Bergahornhof",
  "col": 5,
  "row": 9,
  "map": "classic",
  "chapter": 4,
  "haupt": true,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 114,
   "gold": 36
  },
  "storyDe": "Bergahornhof: Hier wartet der Meister von Kapitel IV.",
  "storyEn": "Bergahornhof: here waits the master of chapter IV.",
  "final": true,
  "boss": {
   "pure": "b19"
  },
  "tier": 4
 },
 {
  "id": "L04s31",
  "league": 4,
  "place": "Steinrose",
  "col": 5,
  "row": 7,
  "map": "skirmish",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 78,
   "gold": 72
  },
  "storyDe": "Ein stiller Umweg führt zu Steinrose.",
  "storyEn": "A quiet detour leads to Steinrose."
 },
 {
  "id": "L04s32",
  "league": 4,
  "place": "Windkamm",
  "col": 4,
  "row": 7,
  "map": "classic",
  "chapter": 4,
  "haupt": true,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L04s33"
  ],
  "reward": {
   "xp": 99
  },
  "storyDe": "Der letzte Anstieg:  Windkamm.",
  "storyEn": "The final ascent:  Windkamm."
 },
 {
  "id": "L04s33",
  "league": 4,
  "place": "Lärchentor",
  "col": 4,
  "row": 7,
  "map": "skirmish",
  "chapter": 4,
  "haupt": true,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L04s34"
  ],
  "reward": {
   "xp": 102
  },
  "storyDe": "Der letzte Anstieg:  Lärchentor.",
  "storyEn": "The final ascent:  Lärchentor."
 },
 {
  "id": "L04s34",
  "league": 4,
  "place": "Wurzelstieg",
  "col": 5,
  "row": 8,
  "map": "courtyard",
  "chapter": 4,
  "haupt": true,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L04s35"
  ],
  "reward": {
   "xp": 105
  },
  "storyDe": "Der letzte Anstieg:  Wurzelstieg.",
  "storyEn": "The final ascent:  Wurzelstieg."
 },
 {
  "id": "L04s35",
  "league": 4,
  "place": "Der Zerzauste Wald",
  "col": 5,
  "row": 9,
  "map": "gauntlet",
  "chapter": 4,
  "haupt": true,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L04s29"
  ],
  "reward": {
   "xp": 108
  },
  "storyDe": "Der letzte Anstieg:  Der Zerzauste Wald.",
  "storyEn": "The final ascent:  Der Zerzauste Wald."
 },
 {
  "id": "L04s36",
  "league": 4,
  "place": "Der Letzte Schatten",
  "col": 4,
  "row": 6,
  "map": "skirmish",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L04s22"
  ],
  "reward": {
   "xp": 70
  },
  "storyDe": "Abseits des Weges liegt Der Letzte Schatten.",
  "storyEn": "Off the road lies Der Letzte Schatten."
 },
 {
  "id": "L04s37",
  "league": 4,
  "place": "Adlerstein",
  "col": 4,
  "row": 2,
  "map": "courtyard",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L04s38"
  ],
  "reward": {
   "xp": 78
  },
  "storyDe": "Ein stiller Umweg führt zu Adlerstein.",
  "storyEn": "A quiet detour leads to Adlerstein."
 },
 {
  "id": "L04s38",
  "league": 4,
  "place": "Kammweg",
  "col": 4,
  "row": 1,
  "map": "gauntlet",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 78
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Kammweg.",
  "storyEn": "A side path branches toward Kammweg.",
  "boss": {
   "piece": "pathfinder",
   "wins": 1
  },
  "tier": 2
 },
 {
  "id": "L04s39",
  "league": 4,
  "place": "Die Stumme Glocke",
  "col": 1,
  "row": 5,
  "map": "arena",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L04s40"
  ],
  "reward": {
   "xp": 70
  },
  "storyDe": "Abseits des Weges liegt Die Stumme Glocke.",
  "storyEn": "Off the road lies Die Stumme Glocke."
 },
 {
  "id": "L04s40",
  "league": 4,
  "place": "Almabtrieb",
  "col": 1,
  "row": 5,
  "map": "classic",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L04s18"
  ],
  "reward": {
   "xp": 78
  },
  "storyDe": "Ein stiller Umweg führt zu Almabtrieb.",
  "storyEn": "A quiet detour leads to Almabtrieb."
 },
 {
  "id": "L04s41",
  "league": 4,
  "place": "Der Schiefe Zaun",
  "col": 2,
  "row": 5,
  "map": "skirmish",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L04s20"
  ],
  "reward": {
   "xp": 70
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Der Schiefe Zaun.",
  "storyEn": "A side path branches toward Der Schiefe Zaun."
 },
 {
  "id": "L04s42",
  "league": 4,
  "place": "Nebelweide",
  "col": 3,
  "row": 4,
  "map": "courtyard",
  "chapter": 3,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L04s09"
  ],
  "reward": {
   "xp": 70
  },
  "storyDe": "Abseits des Weges liegt Nebelweide.",
  "storyEn": "Off the road lies Nebelweide.",
  "gate": {
   "gold": 55
  },
  "tagDe": "Zollstation",
  "tagEn": "Toll station"
 },
 {
  "id": "L05s00",
  "league": 5,
  "place": "Der erste Anstieg",
  "col": 1,
  "row": 1,
  "map": "classic",
  "chapter": 1,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L05s02"
  ],
  "reward": {
   "xp": 60
  },
  "storyDe": "Der Weg beginnt bei Der erste Anstieg.",
  "storyEn": "The road begins at Der erste Anstieg."
 },
 {
  "id": "L05s01",
  "league": 5,
  "place": "Barfußspur",
  "col": 2,
  "row": 2,
  "map": "skirmish",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 84,
   "gold": 47
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Barfußspur.",
  "storyEn": "A side path branches toward Barfußspur."
 },
 {
  "id": "L05s02",
  "league": 5,
  "place": "Klammglocke",
  "col": 1,
  "row": 2,
  "map": "skirmish",
  "chapter": 1,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L05s03"
  ],
  "reward": {
   "xp": 63
  },
  "storyDe": "Der Weg beginnt bei Klammglocke.",
  "storyEn": "The road begins at Klammglocke."
 },
 {
  "id": "L05s03",
  "league": 5,
  "place": "Vereister Altar",
  "col": 1,
  "row": 3,
  "map": "courtyard",
  "chapter": 1,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L05s08"
  ],
  "reward": {
   "xp": 66
  },
  "storyDe": "Der Weg beginnt bei Vereister Altar.",
  "storyEn": "The road begins at Vereister Altar."
 },
 {
  "id": "L05s04",
  "league": 5,
  "place": "Königsgrat",
  "col": 5,
  "row": 3,
  "map": "arena",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 84,
   "gold": 80
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Königsgrat.",
  "storyEn": "A side path branches toward Königsgrat."
 },
 {
  "id": "L05s05",
  "league": 5,
  "place": "Grabesgeröll",
  "col": 2,
  "row": 3,
  "map": "classic",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L05s01"
  ],
  "reward": {
   "xp": 76
  },
  "storyDe": "Abseits des Weges liegt Grabesgeröll.",
  "storyEn": "Off the road lies Grabesgeröll."
 },
 {
  "id": "L05s06",
  "league": 5,
  "place": "Firnriss",
  "col": 2,
  "row": 3,
  "map": "arena",
  "chapter": 1,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L05s09",
   "L05s05"
  ],
  "reward": {
   "xp": 72
  },
  "storyDe": "Der Weg beginnt bei Firnriss.",
  "storyEn": "The road begins at Firnriss."
 },
 {
  "id": "L05s07",
  "league": 5,
  "place": "Der Fürst im Halbschatten",
  "col": 4,
  "row": 3,
  "map": "courtyard",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L05s04"
  ],
  "reward": {
   "xp": 84
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Der Fürst im Halbschatten.",
  "storyEn": "A side path branches toward Der Fürst im Halbschatten."
 },
 {
  "id": "L05s08",
  "league": 5,
  "place": "Jägersitz",
  "col": 2,
  "row": 4,
  "map": "gauntlet",
  "chapter": 1,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L05s06",
   "L05s14"
  ],
  "reward": {
   "xp": 69
  },
  "storyDe": "Der Weg beginnt bei Jägersitz.",
  "storyEn": "The road begins at Jägersitz."
 },
 {
  "id": "L05s09",
  "league": 5,
  "place": "Die Wolfsspur",
  "col": 2,
  "row": 4,
  "map": "classic",
  "chapter": 1,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L05s10"
  ],
  "reward": {
   "xp": 75
  },
  "storyDe": "Der Weg beginnt bei Die Wolfsspur.",
  "storyEn": "The road begins at Die Wolfsspur."
 },
 {
  "id": "L05s10",
  "league": 5,
  "place": "Wo der Atem gefror",
  "col": 2,
  "row": 4,
  "map": "skirmish",
  "chapter": 2,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L05s16"
  ],
  "reward": {
   "xp": 78
  },
  "storyDe": "Der Pfad führt weiter über Wo der Atem gefror.",
  "storyEn": "The path leads on across Wo der Atem gefror."
 },
 {
  "id": "L05s11",
  "league": 5,
  "place": "Jägersteig",
  "col": 4,
  "row": 4,
  "map": "skirmish",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L05s13"
  ],
  "reward": {
   "xp": 84
  },
  "storyDe": "Abseits des Weges liegt Jägersteig.",
  "storyEn": "Off the road lies Jägersteig."
 },
 {
  "id": "L05s12",
  "league": 5,
  "place": "Das Erfrorene Tor",
  "col": 3,
  "row": 4,
  "map": "courtyard",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L05s11"
  ],
  "reward": {
   "xp": 84
  },
  "storyDe": "Ein stiller Umweg führt zu Das Erfrorene Tor.",
  "storyEn": "A quiet detour leads to Das Erfrorene Tor."
 },
 {
  "id": "L05s13",
  "league": 5,
  "place": "Rast der Erschöpften",
  "col": 4,
  "row": 4,
  "map": "gauntlet",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L05s07",
   "L05s17"
  ],
  "reward": {
   "xp": 84
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Rast der Erschöpften.",
  "storyEn": "A side path branches toward Rast der Erschöpften."
 },
 {
  "id": "L05s14",
  "league": 5,
  "place": "Schneegrenze",
  "col": 2,
  "row": 4,
  "map": "arena",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L05s20"
  ],
  "reward": {
   "xp": 76
  },
  "storyDe": "Abseits des Weges liegt Schneegrenze.",
  "storyEn": "Off the road lies Schneegrenze."
 },
 {
  "id": "L05s15",
  "league": 5,
  "place": "Vereiste Klause",
  "col": 3,
  "row": 5,
  "map": "classic",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L05s12"
  ],
  "reward": {
   "xp": 76
  },
  "storyDe": "Ein stiller Umweg führt zu Vereiste Klause.",
  "storyEn": "A quiet detour leads to Vereiste Klause.",
  "gate": {
   "gold": 65
  },
  "tagDe": "Zollstation",
  "tagEn": "Toll station"
 },
 {
  "id": "L05s16",
  "league": 5,
  "place": "Eisnadel",
  "col": 3,
  "row": 5,
  "map": "courtyard",
  "chapter": 2,
  "haupt": true,
  "rules": "chess",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L05s18"
  ],
  "reward": {
   "xp": 81
  },
  "storyDe": "Der Pfad führt weiter über Eisnadel.",
  "storyEn": "The path leads on across Eisnadel.",
  "boss": {
   "pure": "b22",
   "rotation": [
    "b22",
    "b04"
   ]
  },
  "tier": 3
 },
 {
  "id": "L05s17",
  "league": 5,
  "place": "Eisbucht",
  "col": 4,
  "row": 5,
  "map": "courtyard",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L05s19"
  ],
  "reward": {
   "xp": 84
  },
  "storyDe": "Abseits des Weges liegt Eisbucht.",
  "storyEn": "Off the road lies Eisbucht."
 },
 {
  "id": "L05s18",
  "league": 5,
  "place": "Kluftmesse",
  "col": 3,
  "row": 5,
  "map": "gauntlet",
  "chapter": 2,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L05s15",
   "L05s24"
  ],
  "reward": {
   "xp": 84
  },
  "storyDe": "Der Pfad führt weiter über Kluftmesse.",
  "storyEn": "The path leads on across Kluftmesse."
 },
 {
  "id": "L05s19",
  "league": 5,
  "place": "Splitterbrück",
  "col": 5,
  "row": 5,
  "map": "arena",
  "chapter": 2,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 84,
   "gold": 80
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Splitterbrück.",
  "storyEn": "A side path branches toward Splitterbrück."
 },
 {
  "id": "L05s20",
  "league": 5,
  "place": "Frostbeulen",
  "col": 2,
  "row": 5,
  "map": "classic",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L05s21",
   "L05s25"
  ],
  "reward": {
   "xp": 84
  },
  "storyDe": "Abseits des Weges liegt Frostbeulen.",
  "storyEn": "Off the road lies Frostbeulen."
 },
 {
  "id": "L05s21",
  "league": 5,
  "place": "Gefrorene Träne",
  "col": 2,
  "row": 5,
  "map": "skirmish",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 84,
   "gold": 80
  },
  "storyDe": "Ein stiller Umweg führt zu Gefrorene Träne.",
  "storyEn": "A quiet detour leads to Gefrorene Träne."
 },
 {
  "id": "L05s22",
  "league": 5,
  "place": "Blaue Wand",
  "col": 4,
  "row": 5,
  "map": "skirmish",
  "chapter": 2,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L05s26"
  ],
  "reward": {
   "xp": 93
  },
  "storyDe": "Der Pfad führt weiter über Blaue Wand.",
  "storyEn": "The path leads on across Blaue Wand."
 },
 {
  "id": "L05s23",
  "league": 5,
  "place": "Raureifgitter",
  "col": 3,
  "row": 5,
  "map": "classic",
  "chapter": 2,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L05s22"
  ],
  "reward": {
   "xp": 90
  },
  "storyDe": "Der Pfad führt weiter über Raureifgitter.",
  "storyEn": "The path leads on across Raureifgitter."
 },
 {
  "id": "L05s24",
  "league": 5,
  "place": "Nachtwand",
  "col": 3,
  "row": 5,
  "map": "arena",
  "chapter": 2,
  "haupt": true,
  "rules": "chess",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L05s23"
  ],
  "reward": {
   "xp": 87
  },
  "storyDe": "Der Pfad führt weiter über Nachtwand.",
  "storyEn": "The path leads on across Nachtwand."
 },
 {
  "id": "L05s25",
  "league": 5,
  "place": "Eiskahn",
  "col": 2,
  "row": 6,
  "map": "classic",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L05s28"
  ],
  "reward": {
   "xp": 84
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Eiskahn.",
  "storyEn": "A side path branches toward Eiskahn."
 },
 {
  "id": "L05s26",
  "league": 5,
  "place": "Wächtenwall",
  "col": 4,
  "row": 6,
  "map": "courtyard",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L05s27"
  ],
  "reward": {
   "xp": 96
  },
  "storyDe": "Wächtenwall: die alte Magie erwacht - Figuren bluten, Figuren halten stand.",
  "storyEn": "Wächtenwall: the old magic wakes - pieces bleed, pieces endure.",
  "boss": {
   "pure": "b01",
   "rotation": [
    "b01",
    "b03",
    "b02"
   ]
  },
  "tier": 1
 },
 {
  "id": "L05s27",
  "league": 5,
  "place": "Eisburg",
  "col": 4,
  "row": 6,
  "map": "gauntlet",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L05s29"
  ],
  "reward": {
   "xp": 99
  },
  "storyDe": "Die Prüfung wartet bei Eisburg.",
  "storyEn": "The trial waits at Eisburg.",
  "boss": {
   "piece": "guardian",
   "wins": 1
  },
  "tier": 3
 },
 {
  "id": "L05s28",
  "league": 5,
  "place": "Knirschsteg",
  "col": 2,
  "row": 6,
  "map": "gauntlet",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L05s30"
  ],
  "reward": {
   "xp": 84
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Knirschsteg.",
  "storyEn": "A side path branches toward Knirschsteg."
 },
 {
  "id": "L05s29",
  "league": 5,
  "place": "Schneelinde",
  "col": 4,
  "row": 6,
  "map": "arena",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L05s31"
  ],
  "reward": {
   "xp": 102
  },
  "storyDe": "Die Prüfung wartet bei Schneelinde.",
  "storyEn": "The trial waits at Schneelinde."
 },
 {
  "id": "L05s30",
  "league": 5,
  "place": "Fallenstellerlager",
  "col": 1,
  "row": 6,
  "map": "classic",
  "chapter": 1,
  "rules": "chess",
  "difficulty": "hard",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 84,
   "gold": 80
  },
  "storyDe": "Ein stiller Umweg führt zu Fallenstellerlager.",
  "storyEn": "A quiet detour leads to Fallenstellerlager."
 },
 {
  "id": "L05s31",
  "league": 5,
  "place": "Frostthron",
  "col": 3,
  "row": 7,
  "map": "classic",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L05s33",
   "L05s36"
  ],
  "reward": {
   "xp": 105
  },
  "storyDe": "Die Prüfung wartet bei Frostthron.",
  "storyEn": "The trial waits at Frostthron."
 },
 {
  "id": "L05s32",
  "league": 5,
  "place": "Nordlichtkanzel",
  "col": 4,
  "row": 7,
  "map": "gauntlet",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L05s35"
  ],
  "reward": {
   "xp": 114
  },
  "storyDe": "Der letzte Anstieg:  Nordlichtkanzel.",
  "storyEn": "The final ascent:  Nordlichtkanzel."
 },
 {
  "id": "L05s33",
  "league": 5,
  "place": "Der Zugefrorene Riegel",
  "col": 4,
  "row": 7,
  "map": "skirmish",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L05s34"
  ],
  "reward": {
   "xp": 108
  },
  "storyDe": "Die Prüfung wartet bei Der Zugefrorene Riegel.",
  "storyEn": "The trial waits at Der Zugefrorene Riegel."
 },
 {
  "id": "L05s34",
  "league": 5,
  "place": "Fährtenfeld",
  "col": 4,
  "row": 7,
  "map": "courtyard",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L05s32"
  ],
  "reward": {
   "xp": 111
  },
  "storyDe": "Die Prüfung wartet bei Fährtenfeld.",
  "storyEn": "The trial waits at Fährtenfeld."
 },
 {
  "id": "L05s35",
  "league": 5,
  "place": "Halle der stillen Kälte",
  "col": 5,
  "row": 7,
  "map": "arena",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L05s38"
  ],
  "reward": {
   "xp": 117
  },
  "storyDe": "Der letzte Anstieg:  Halle der stillen Kälte.",
  "storyEn": "The final ascent:  Halle der stillen Kälte."
 },
 {
  "id": "L05s36",
  "league": 5,
  "place": "Der Erstarrte Hain",
  "col": 3,
  "row": 7,
  "map": "skirmish",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L05s37"
  ],
  "reward": {
   "xp": 76
  },
  "storyDe": "Ein stiller Umweg führt zu Der Erstarrte Hain.",
  "storyEn": "A quiet detour leads to Der Erstarrte Hain."
 },
 {
  "id": "L05s37",
  "league": 5,
  "place": "Steinrosen",
  "col": 3,
  "row": 8,
  "map": "courtyard",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L05s39"
  ],
  "reward": {
   "xp": 84
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Steinrosen.",
  "storyEn": "A side path branches toward Steinrosen."
 },
 {
  "id": "L05s38",
  "league": 5,
  "place": "Taustelle",
  "col": 5,
  "row": 8,
  "map": "classic",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L05s40",
   "L05s41"
  ],
  "reward": {
   "xp": 120
  },
  "storyDe": "Der letzte Anstieg:  Taustelle.",
  "storyEn": "The final ascent:  Taustelle."
 },
 {
  "id": "L05s39",
  "league": 5,
  "place": "Firnscharte",
  "col": 2,
  "row": 8,
  "map": "arena",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 84,
   "gold": 47
  },
  "storyDe": "Ein stiller Umweg führt zu Firnscharte.",
  "storyEn": "A quiet detour leads to Firnscharte."
 },
 {
  "id": "L05s40",
  "league": 5,
  "place": "Frostglockenturm",
  "col": 4,
  "row": 8,
  "map": "classic",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L05s42"
  ],
  "reward": {
   "xp": 76
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Frostglockenturm.",
  "storyEn": "A side path branches toward Frostglockenturm."
 },
 {
  "id": "L05s41",
  "league": 5,
  "place": "Gipfelruh",
  "col": 5,
  "row": 8,
  "map": "skirmish",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L05s44"
  ],
  "reward": {
   "xp": 123
  },
  "storyDe": "Der letzte Anstieg:  Gipfelruh.",
  "storyEn": "The final ascent:  Gipfelruh."
 },
 {
  "id": "L05s42",
  "league": 5,
  "place": "Wächtenkamm",
  "col": 4,
  "row": 8,
  "map": "courtyard",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L05s43"
  ],
  "reward": {
   "xp": 84
  },
  "storyDe": "Ein stiller Umweg führt zu Wächtenkamm.",
  "storyEn": "A quiet detour leads to Wächtenkamm."
 },
 {
  "id": "L05s43",
  "league": 5,
  "place": "Wolfsgrube",
  "col": 4,
  "row": 9,
  "map": "gauntlet",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L05s46"
  ],
  "reward": {
   "xp": 84
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Wolfsgrube.",
  "storyEn": "A side path branches toward Wolfsgrube."
 },
 {
  "id": "L05s44",
  "league": 5,
  "place": "Verwaiste Hütte",
  "col": 5,
  "row": 9,
  "map": "courtyard",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L05s48"
  ],
  "reward": {
   "xp": 126
  },
  "storyDe": "Der letzte Anstieg:  Verwaiste Hütte.",
  "storyEn": "The final ascent:  Verwaiste Hütte."
 },
 {
  "id": "L05s45",
  "league": 5,
  "place": "Rabenkanzel",
  "col": 3,
  "row": 9,
  "map": "classic",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 84,
   "gold": 80
  },
  "storyDe": "Ein stiller Umweg führt zu Rabenkanzel.",
  "storyEn": "A quiet detour leads to Rabenkanzel."
 },
 {
  "id": "L05s46",
  "league": 5,
  "place": "Quellen unterm Eis",
  "col": 4,
  "row": 9,
  "map": "skirmish",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L05s47"
  ],
  "reward": {
   "xp": 84
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Quellen unterm Eis.",
  "storyEn": "A side path branches toward Quellen unterm Eis."
 },
 {
  "id": "L05s47",
  "league": 5,
  "place": "Steinerner Schlaf",
  "col": 3,
  "row": 9,
  "map": "courtyard",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L05s45"
  ],
  "reward": {
   "xp": 84
  },
  "storyDe": "Abseits des Weges liegt Steinerner Schlaf.",
  "storyEn": "Off the road lies Steinerner Schlaf."
 },
 {
  "id": "L05s48",
  "league": 5,
  "place": "Lawinenhang",
  "col": 5,
  "row": 9,
  "map": "gauntlet",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 129,
   "gold": 40
  },
  "storyDe": "Lawinenhang: Hier wartet der Meister von Kapitel V.",
  "storyEn": "Lawinenhang: here waits the master of chapter V.",
  "final": true,
  "boss": {
   "pure": "b20"
  },
  "tier": 4
 },
 {
  "id": "L06s00",
  "league": 6,
  "place": "Erster Grat",
  "col": 0,
  "row": 1,
  "map": "classic",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L06s01"
  ],
  "reward": {
   "xp": 66
  },
  "storyDe": "Der Weg beginnt bei Erster Grat.",
  "storyEn": "The road begins at Erster Grat."
 },
 {
  "id": "L06s01",
  "league": 6,
  "place": "Meißelschlag",
  "col": 1,
  "row": 1,
  "map": "skirmish",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L06s02",
   "L06s04"
  ],
  "reward": {
   "xp": 69
  },
  "storyDe": "Der Weg beginnt bei Meißelschlag.",
  "storyEn": "The road begins at Meißelschlag."
 },
 {
  "id": "L06s02",
  "league": 6,
  "place": "Gipfelaltar",
  "col": 1,
  "row": 2,
  "map": "courtyard",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L06s05"
  ],
  "reward": {
   "xp": 72
  },
  "storyDe": "Der Weg beginnt bei Gipfelaltar.",
  "storyEn": "The road begins at Gipfelaltar."
 },
 {
  "id": "L06s03",
  "league": 6,
  "place": "Der Hüter ohne Tür",
  "col": 5,
  "row": 2,
  "map": "gauntlet",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 82,
   "gold": 28
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Der Hüter ohne Tür.",
  "storyEn": "A side path branches toward Der Hüter ohne Tür."
 },
 {
  "id": "L06s04",
  "league": 6,
  "place": "Seilpfad",
  "col": 1,
  "row": 2,
  "map": "arena",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L06s08"
  ],
  "reward": {
   "xp": 82
  },
  "storyDe": "Abseits des Weges liegt Seilpfad.",
  "storyEn": "Off the road lies Seilpfad."
 },
 {
  "id": "L06s05",
  "league": 6,
  "place": "Steinmetzsitz",
  "col": 1,
  "row": 2,
  "map": "gauntlet",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L06s07"
  ],
  "reward": {
   "xp": 75
  },
  "storyDe": "Der Weg beginnt bei Steinmetzsitz.",
  "storyEn": "The road begins at Steinmetzsitz."
 },
 {
  "id": "L06s06",
  "league": 6,
  "place": "Splitterkar",
  "col": 5,
  "row": 3,
  "map": "classic",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L06s09"
  ],
  "reward": {
   "xp": 96
  },
  "storyDe": "Der Pfad führt weiter über Splitterkar.",
  "storyEn": "The path leads on across Splitterkar."
 },
 {
  "id": "L06s07",
  "league": 6,
  "place": "Geröllzunge",
  "col": 1,
  "row": 3,
  "map": "arena",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L06s10"
  ],
  "reward": {
   "xp": 78
  },
  "storyDe": "Der Weg beginnt bei Geröllzunge.",
  "storyEn": "The road begins at Geröllzunge."
 },
 {
  "id": "L06s08",
  "league": 6,
  "place": "Das Verriegelte Tor",
  "col": 1,
  "row": 3,
  "map": "gauntlet",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L06s11"
  ],
  "reward": {
   "xp": 90
  },
  "storyDe": "Ein stiller Umweg führt zu Das Verriegelte Tor.",
  "storyEn": "A quiet detour leads to Das Verriegelte Tor."
 },
 {
  "id": "L06s09",
  "league": 6,
  "place": "Firnhang",
  "col": 5,
  "row": 3,
  "map": "courtyard",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L06s03",
   "L06s12"
  ],
  "reward": {
   "xp": 102
  },
  "storyDe": "Der Pfad führt weiter über Firnhang.",
  "storyEn": "The path leads on across Firnhang."
 },
 {
  "id": "L06s10",
  "league": 6,
  "place": "Der Gamssteig",
  "col": 2,
  "row": 4,
  "map": "classic",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L06s14"
  ],
  "reward": {
   "xp": 81
  },
  "storyDe": "Der Weg beginnt bei Der Gamssteig.",
  "storyEn": "The road begins at Der Gamssteig."
 },
 {
  "id": "L06s11",
  "league": 6,
  "place": "Rast am Abgrund",
  "col": 1,
  "row": 4,
  "map": "skirmish",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L06s17"
  ],
  "reward": {
   "xp": 90
  },
  "storyDe": "Ein stiller Umweg führt zu Rast am Abgrund.",
  "storyEn": "A quiet detour leads to Rast am Abgrund."
 },
 {
  "id": "L06s12",
  "league": 6,
  "place": "Zwergkiefer",
  "col": 5,
  "row": 4,
  "map": "arena",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L06s18"
  ],
  "reward": {
   "xp": 108
  },
  "storyDe": "Die Prüfung wartet bei Zwergkiefer.",
  "storyEn": "The trial waits at Zwergkiefer.",
  "boss": {
   "piece": "assassin",
   "wins": 1
  },
  "tier": 2
 },
 {
  "id": "L06s13",
  "league": 6,
  "place": "Adlermesse",
  "col": 3,
  "row": 4,
  "map": "gauntlet",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L06s15",
   "L06s06"
  ],
  "reward": {
   "xp": 90
  },
  "storyDe": "Der Pfad führt weiter über Adlermesse.",
  "storyEn": "The path leads on across Adlermesse.",
  "boss": {
   "pure": "b21",
   "rotation": [
    "b21",
    "b07"
   ]
  },
  "tier": 2
 },
 {
  "id": "L06s14",
  "league": 6,
  "place": "Wo der letzte Riegel fiel",
  "col": 2,
  "row": 4,
  "map": "skirmish",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L06s16"
  ],
  "reward": {
   "xp": 84
  },
  "storyDe": "Der Weg beginnt bei Wo der letzte Riegel fiel.",
  "storyEn": "The road begins at Wo der letzte Riegel fiel."
 },
 {
  "id": "L06s15",
  "league": 6,
  "place": "Wolkenstube",
  "col": 3,
  "row": 4,
  "map": "arena",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L06s19"
  ],
  "reward": {
   "xp": 93
  },
  "storyDe": "Der Pfad führt weiter über Wolkenstube.",
  "storyEn": "The path leads on across Wolkenstube."
 },
 {
  "id": "L06s16",
  "league": 6,
  "place": "Kluftfeste",
  "col": 2,
  "row": 5,
  "map": "courtyard",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L06s13",
   "L06s22"
  ],
  "reward": {
   "xp": 87
  },
  "storyDe": "Der Pfad führt weiter über Kluftfeste.",
  "storyEn": "The path leads on across Kluftfeste."
 },
 {
  "id": "L06s17",
  "league": 6,
  "place": "Grathelm",
  "col": 1,
  "row": 5,
  "map": "courtyard",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L06s20"
  ],
  "reward": {
   "xp": 90
  },
  "storyDe": "Ein stiller Umweg führt zu Grathelm.",
  "storyEn": "A quiet detour leads to Grathelm."
 },
 {
  "id": "L06s18",
  "league": 6,
  "place": "Das Verlorene Schloss",
  "col": 5,
  "row": 5,
  "map": "skirmish",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L06s21"
  ],
  "reward": {
   "xp": 114
  },
  "storyDe": "Die Prüfung wartet bei Das Verlorene Schloss.",
  "storyEn": "The trial waits at Das Verlorene Schloss."
 },
 {
  "id": "L06s19",
  "league": 6,
  "place": "Dohlenflug",
  "col": 3,
  "row": 5,
  "map": "skirmish",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L06s23"
  ],
  "reward": {
   "xp": 99
  },
  "storyDe": "Der Pfad führt weiter über Dohlenflug.",
  "storyEn": "The path leads on across Dohlenflug."
 },
 {
  "id": "L06s20",
  "league": 6,
  "place": "Steinerne Stube",
  "col": 1,
  "row": 5,
  "map": "classic",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 90,
   "gold": 88
  },
  "storyDe": "Ein stiller Umweg führt zu Steinerne Stube.",
  "storyEn": "A quiet detour leads to Steinerne Stube."
 },
 {
  "id": "L06s21",
  "league": 6,
  "place": "Schutthalde",
  "col": 5,
  "row": 5,
  "map": "courtyard",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L06s26"
  ],
  "reward": {
   "xp": 117
  },
  "storyDe": "Die Prüfung wartet bei Schutthalde.",
  "storyEn": "The trial waits at Schutthalde."
 },
 {
  "id": "L06s22",
  "league": 6,
  "place": "Gletschermilch",
  "col": 2,
  "row": 5,
  "map": "courtyard",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L06s24"
  ],
  "reward": {
   "xp": 82
  },
  "storyDe": "Abseits des Weges liegt Gletschermilch.",
  "storyEn": "Off the road lies Gletschermilch.",
  "gate": {
   "gold": 75
  },
  "tagDe": "Zollstation",
  "tagEn": "Toll station"
 },
 {
  "id": "L06s23",
  "league": 6,
  "place": "Hochwacht",
  "col": 3,
  "row": 5,
  "map": "gauntlet",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L06s25"
  ],
  "reward": {
   "xp": 105
  },
  "storyDe": "Die Prüfung wartet bei Hochwacht.",
  "storyEn": "The trial waits at Hochwacht."
 },
 {
  "id": "L06s24",
  "league": 6,
  "place": "Hängender Weiler",
  "col": 2,
  "row": 6,
  "map": "arena",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L06s30"
  ],
  "reward": {
   "xp": 90
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Hängender Weiler.",
  "storyEn": "A side path branches toward Hängender Weiler."
 },
 {
  "id": "L06s25",
  "league": 6,
  "place": "Gipfelkron",
  "col": 3,
  "row": 6,
  "map": "classic",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L06s29",
   "L06s21"
  ],
  "reward": {
   "xp": 111
  },
  "storyDe": "Die Prüfung wartet bei Gipfelkron.",
  "storyEn": "The trial waits at Gipfelkron."
 },
 {
  "id": "L06s26",
  "league": 6,
  "place": "Adlerkanzel",
  "col": 5,
  "row": 6,
  "map": "gauntlet",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L06s28"
  ],
  "reward": {
   "xp": 120
  },
  "storyDe": "Die Prüfung wartet bei Adlerkanzel.",
  "storyEn": "The trial waits at Adlerkanzel."
 },
 {
  "id": "L06s27",
  "league": 6,
  "place": "Murmelloch",
  "col": 5,
  "row": 6,
  "map": "courtyard",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 82,
   "gold": 28
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Murmelloch.",
  "storyEn": "A side path branches toward Murmelloch."
 },
 {
  "id": "L06s28",
  "league": 6,
  "place": "Halle der leeren Regale",
  "col": 5,
  "row": 6,
  "map": "arena",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L06s31"
  ],
  "reward": {
   "xp": 123
  },
  "storyDe": "Die Prüfung wartet bei Halle der leeren Regale.",
  "storyEn": "The trial waits at Halle der leeren Regale."
 },
 {
  "id": "L06s29",
  "league": 6,
  "place": "Kristallader",
  "col": 3,
  "row": 6,
  "map": "arena",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L06s32"
  ],
  "reward": {
   "xp": 82
  },
  "storyDe": "Ein stiller Umweg führt zu Kristallader.",
  "storyEn": "A quiet detour leads to Kristallader."
 },
 {
  "id": "L06s30",
  "league": 6,
  "place": "Seilwinde",
  "col": 2,
  "row": 6,
  "map": "classic",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L06s33"
  ],
  "reward": {
   "xp": 90
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Seilwinde.",
  "storyEn": "A side path branches toward Seilwinde."
 },
 {
  "id": "L06s31",
  "league": 6,
  "place": "Schlüsselbund",
  "col": 5,
  "row": 7,
  "map": "classic",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L06s27",
   "L06s34"
  ],
  "reward": {
   "xp": 126
  },
  "storyDe": "Der letzte Anstieg:  Schlüsselbund.",
  "storyEn": "The final ascent:  Schlüsselbund."
 },
 {
  "id": "L06s32",
  "league": 6,
  "place": "Schwindelsteg",
  "col": 3,
  "row": 7,
  "map": "courtyard",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L06s35"
  ],
  "reward": {
   "xp": 90
  },
  "storyDe": "Ein stiller Umweg führt zu Schwindelsteg.",
  "storyEn": "A quiet detour leads to Schwindelsteg."
 },
 {
  "id": "L06s33",
  "league": 6,
  "place": "Bei den Steinmetzen",
  "col": 2,
  "row": 7,
  "map": "gauntlet",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L06s36"
  ],
  "reward": {
   "xp": 90
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Bei den Steinmetzen.",
  "storyEn": "A side path branches toward Bei den Steinmetzen."
 },
 {
  "id": "L06s34",
  "league": 6,
  "place": "Sieben Riegel",
  "col": 5,
  "row": 7,
  "map": "skirmish",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L06s37",
   "L06s38"
  ],
  "reward": {
   "xp": 129
  },
  "storyDe": "Der letzte Anstieg:  Sieben Riegel.",
  "storyEn": "The final ascent:  Sieben Riegel."
 },
 {
  "id": "L06s35",
  "league": 6,
  "place": "Der Kahle Rücken",
  "col": 3,
  "row": 7,
  "map": "classic",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 90,
   "gold": 52
  },
  "storyDe": "Ein stiller Umweg führt zu Der Kahle Rücken.",
  "storyEn": "A quiet detour leads to Der Kahle Rücken."
 },
 {
  "id": "L06s36",
  "league": 6,
  "place": "Flechtenteppich",
  "col": 2,
  "row": 7,
  "map": "skirmish",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L06s39"
  ],
  "reward": {
   "xp": 90
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Flechtenteppich.",
  "storyEn": "A side path branches toward Flechtenteppich."
 },
 {
  "id": "L06s37",
  "league": 6,
  "place": "Klufttreppe",
  "col": 5,
  "row": 8,
  "map": "courtyard",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L06s40"
  ],
  "reward": {
   "xp": 82
  },
  "storyDe": "Abseits des Weges liegt Klufttreppe.",
  "storyEn": "Off the road lies Klufttreppe."
 },
 {
  "id": "L06s38",
  "league": 6,
  "place": "Verfallene Klause",
  "col": 5,
  "row": 8,
  "map": "courtyard",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L06s43"
  ],
  "reward": {
   "xp": 132
  },
  "storyDe": "Der letzte Anstieg:  Verfallene Klause.",
  "storyEn": "The final ascent:  Verfallene Klause."
 },
 {
  "id": "L06s39",
  "league": 6,
  "place": "Schlüsselzinne",
  "col": 2,
  "row": 8,
  "map": "arena",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L06s45"
  ],
  "reward": {
   "xp": 90
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Schlüsselzinne.",
  "storyEn": "A side path branches toward Schlüsselzinne."
 },
 {
  "id": "L06s40",
  "league": 6,
  "place": "Nebelmeerblick",
  "col": 4,
  "row": 8,
  "map": "classic",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L06s41"
  ],
  "reward": {
   "xp": 90
  },
  "storyDe": "Abseits des Weges liegt Nebelmeerblick.",
  "storyEn": "Off the road lies Nebelmeerblick."
 },
 {
  "id": "L06s41",
  "league": 6,
  "place": "Schieferwiege",
  "col": 4,
  "row": 8,
  "map": "skirmish",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L06s42"
  ],
  "reward": {
   "xp": 90
  },
  "storyDe": "Ein stiller Umweg führt zu Schieferwiege.",
  "storyEn": "A quiet detour leads to Schieferwiege."
 },
 {
  "id": "L06s42",
  "league": 6,
  "place": "Steinbockstand",
  "col": 4,
  "row": 8,
  "map": "courtyard",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L06s44"
  ],
  "reward": {
   "xp": 90
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Steinbockstand.",
  "storyEn": "A side path branches toward Steinbockstand."
 },
 {
  "id": "L06s43",
  "league": 6,
  "place": "Donnerkar",
  "col": 5,
  "row": 8,
  "map": "gauntlet",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L06s46"
  ],
  "reward": {
   "xp": 135
  },
  "storyDe": "Der letzte Anstieg:  Donnerkar.",
  "storyEn": "The final ascent:  Donnerkar."
 },
 {
  "id": "L06s44",
  "league": 6,
  "place": "Tropfstein",
  "col": 3,
  "row": 9,
  "map": "arena",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L06s47"
  ],
  "reward": {
   "xp": 90
  },
  "storyDe": "Ein stiller Umweg führt zu Tropfstein.",
  "storyEn": "A quiet detour leads to Tropfstein."
 },
 {
  "id": "L06s45",
  "league": 6,
  "place": "Ödgrat",
  "col": 1,
  "row": 9,
  "map": "classic",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L06s48"
  ],
  "reward": {
   "xp": 90
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Ödgrat.",
  "storyEn": "A side path branches toward Ödgrat."
 },
 {
  "id": "L06s46",
  "league": 6,
  "place": "Sternenlager",
  "col": 5,
  "row": 9,
  "map": "arena",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L06s50"
  ],
  "reward": {
   "xp": 138
  },
  "storyDe": "Der letzte Anstieg:  Sternenlager.",
  "storyEn": "The final ascent:  Sternenlager."
 },
 {
  "id": "L06s47",
  "league": 6,
  "place": "Echostille",
  "col": 3,
  "row": 9,
  "map": "courtyard",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 90,
   "gold": 88
  },
  "storyDe": "Ein stiller Umweg führt zu Echostille.",
  "storyEn": "A quiet detour leads to Echostille."
 },
 {
  "id": "L06s48",
  "league": 6,
  "place": "Zwölf Türen",
  "col": 1,
  "row": 9,
  "map": "gauntlet",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 90
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Zwölf Türen.",
  "storyEn": "A side path branches toward Zwölf Türen.",
  "boss": {
   "piece": "captain",
   "wins": 1
  },
  "tier": 2
 },
 {
  "id": "L06s49",
  "league": 6,
  "place": "Grauer Atem",
  "col": 5,
  "row": 10,
  "map": "skirmish",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 144,
   "gold": 44
  },
  "storyDe": "Grauer Atem: Hier wartet der Meister von Kapitel VI.",
  "storyEn": "Grauer Atem: here waits the master of chapter VI.",
  "final": true,
  "boss": {
   "pure": "b16"
  },
  "tier": 3
 },
 {
  "id": "L06s50",
  "league": 6,
  "place": "Königsjoch",
  "col": 5,
  "row": 9,
  "map": "classic",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L06s49",
   "L06s51"
  ],
  "reward": {
   "xp": 141
  },
  "storyDe": "Der letzte Anstieg:  Königsjoch.",
  "storyEn": "The final ascent:  Königsjoch."
 },
 {
  "id": "L06s51",
  "league": 6,
  "place": "Erster Grat II",
  "col": 5,
  "row": 9,
  "map": "skirmish",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 82,
   "gold": 28
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Erster Grat II.",
  "storyEn": "A side path branches toward Erster Grat II."
 },
 {
  "id": "L07s00",
  "league": 7,
  "place": "Weites Rund",
  "col": 0,
  "row": 1,
  "map": "classic",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L07s02"
  ],
  "reward": {
   "xp": 72
  },
  "storyDe": "Der Weg beginnt bei Weites Rund.",
  "storyEn": "The road begins at Weites Rund."
 },
 {
  "id": "L07s01",
  "league": 7,
  "place": "Murmeltierstadt",
  "col": 3,
  "row": 1,
  "map": "skirmish",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 96,
   "gold": 96
  },
  "storyDe": "Ein stiller Umweg führt zu Murmeltierstadt.",
  "storyEn": "A quiet detour leads to Murmeltierstadt."
 },
 {
  "id": "L07s02",
  "league": 7,
  "place": "Hufdonner",
  "col": 1,
  "row": 1,
  "map": "skirmish",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L07s05",
   "L07s09"
  ],
  "reward": {
   "xp": 75
  },
  "storyDe": "Der Weg beginnt bei Hufdonner.",
  "storyEn": "The road begins at Hufdonner."
 },
 {
  "id": "L07s03",
  "league": 7,
  "place": "Grasklinge",
  "col": 5,
  "row": 2,
  "map": "gauntlet",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 96,
   "gold": 96
  },
  "storyDe": "Abseits des Weges liegt Grasklinge.",
  "storyEn": "Off the road lies Grasklinge."
 },
 {
  "id": "L07s04",
  "league": 7,
  "place": "Bohlenweg",
  "col": 3,
  "row": 2,
  "map": "arena",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L07s01"
  ],
  "reward": {
   "xp": 96
  },
  "storyDe": "Ein stiller Umweg führt zu Bohlenweg.",
  "storyEn": "A quiet detour leads to Bohlenweg."
 },
 {
  "id": "L07s05",
  "league": 7,
  "place": "Jurtenring",
  "col": 1,
  "row": 2,
  "map": "gauntlet",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L07s07"
  ],
  "reward": {
   "xp": 81
  },
  "storyDe": "Der Weg beginnt bei Jurtenring.",
  "storyEn": "The road begins at Jurtenring."
 },
 {
  "id": "L07s06",
  "league": 7,
  "place": "Bei den Pferdehirten",
  "col": 3,
  "row": 2,
  "map": "skirmish",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L07s04"
  ],
  "reward": {
   "xp": 96
  },
  "storyDe": "Abseits des Weges liegt Bei den Pferdehirten.",
  "storyEn": "Off the road lies Bei den Pferdehirten."
 },
 {
  "id": "L07s07",
  "league": 7,
  "place": "Der Wildwechsel",
  "col": 2,
  "row": 3,
  "map": "classic",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L07s12"
  ],
  "reward": {
   "xp": 87
  },
  "storyDe": "Der Weg beginnt bei Der Wildwechsel.",
  "storyEn": "The road begins at Der Wildwechsel."
 },
 {
  "id": "L07s08",
  "league": 7,
  "place": "Der Wispernde Halm",
  "col": 5,
  "row": 3,
  "map": "gauntlet",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L07s03"
  ],
  "reward": {
   "xp": 96
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Der Wispernde Halm.",
  "storyEn": "A side path branches toward Der Wispernde Halm."
 },
 {
  "id": "L07s09",
  "league": 7,
  "place": "Reiteraltar",
  "col": 1,
  "row": 3,
  "map": "courtyard",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L07s14"
  ],
  "reward": {
   "xp": 78
  },
  "storyDe": "Der Weg beginnt bei Reiteraltar.",
  "storyEn": "The road begins at Reiteraltar."
 },
 {
  "id": "L07s10",
  "league": 7,
  "place": "Zeltasche",
  "col": 5,
  "row": 3,
  "map": "classic",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L07s08"
  ],
  "reward": {
   "xp": 96
  },
  "storyDe": "Ein stiller Umweg führt zu Zeltasche.",
  "storyEn": "A quiet detour leads to Zeltasche."
 },
 {
  "id": "L07s11",
  "league": 7,
  "place": "Weidewende",
  "col": 4,
  "row": 3,
  "map": "skirmish",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L07s06"
  ],
  "reward": {
   "xp": 96
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Weidewende.",
  "storyEn": "A side path branches toward Weidewende."
 },
 {
  "id": "L07s12",
  "league": 7,
  "place": "Grasmeer",
  "col": 2,
  "row": 4,
  "map": "courtyard",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L07s16"
  ],
  "reward": {
   "xp": 93
  },
  "storyDe": "Der Weg beginnt bei Grasmeer.",
  "storyEn": "The road begins at Grasmeer."
 },
 {
  "id": "L07s13",
  "league": 7,
  "place": "Windzinne",
  "col": 4,
  "row": 4,
  "map": "gauntlet",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L07s10"
  ],
  "reward": {
   "xp": 96
  },
  "storyDe": "Ein stiller Umweg führt zu Windzinne.",
  "storyEn": "A quiet detour leads to Windzinne."
 },
 {
  "id": "L07s14",
  "league": 7,
  "place": "Zunderflur",
  "col": 1,
  "row": 4,
  "map": "arena",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L07s17"
  ],
  "reward": {
   "xp": 84
  },
  "storyDe": "Der Weg beginnt bei Zunderflur.",
  "storyEn": "The road begins at Zunderflur."
 },
 {
  "id": "L07s15",
  "league": 7,
  "place": "Trockene Tränke",
  "col": 4,
  "row": 4,
  "map": "classic",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L07s11",
   "L07s13"
  ],
  "reward": {
   "xp": 96
  },
  "storyDe": "Abseits des Weges liegt Trockene Tränke.",
  "storyEn": "Off the road lies Trockene Tränke."
 },
 {
  "id": "L07s16",
  "league": 7,
  "place": "Freier Himmel",
  "col": 3,
  "row": 4,
  "map": "arena",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L07s19"
  ],
  "reward": {
   "xp": 99
  },
  "storyDe": "Der Pfad führt weiter über Freier Himmel.",
  "storyEn": "The path leads on across Freier Himmel."
 },
 {
  "id": "L07s17",
  "league": 7,
  "place": "Wo die Lanze fällt",
  "col": 1,
  "row": 4,
  "map": "skirmish",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L07s20",
   "L07s21"
  ],
  "reward": {
   "xp": 90
  },
  "storyDe": "Der Weg beginnt bei Wo die Lanze fällt.",
  "storyEn": "The road begins at Wo die Lanze fällt."
 },
 {
  "id": "L07s18",
  "league": 7,
  "place": "Wolfsfalle",
  "col": 4,
  "row": 5,
  "map": "gauntlet",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L07s15"
  ],
  "reward": {
   "xp": 96
  },
  "storyDe": "Abseits des Weges liegt Wolfsfalle.",
  "storyEn": "Off the road lies Wolfsfalle."
 },
 {
  "id": "L07s19",
  "league": 7,
  "place": "Flirrende Luft",
  "col": 3,
  "row": 5,
  "map": "skirmish",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L07s26"
  ],
  "reward": {
   "xp": 105
  },
  "storyDe": "Der Pfad führt weiter über Flirrende Luft.",
  "storyEn": "The path leads on across Flirrende Luft.",
  "boss": {
   "pure": "b15",
   "rotation": [
    "b15",
    "b06"
   ]
  },
  "tier": 2
 },
 {
  "id": "L07s20",
  "league": 7,
  "place": "Turniermesse",
  "col": 2,
  "row": 5,
  "map": "gauntlet",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L07s23"
  ],
  "reward": {
   "xp": 96
  },
  "storyDe": "Der Weg beginnt bei Turniermesse.",
  "storyEn": "The road begins at Turniermesse."
 },
 {
  "id": "L07s21",
  "league": 7,
  "place": "Geierschatten",
  "col": 1,
  "row": 5,
  "map": "skirmish",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L07s24"
  ],
  "reward": {
   "xp": 88
  },
  "storyDe": "Abseits des Weges liegt Geierschatten.",
  "storyEn": "Off the road lies Geierschatten."
 },
 {
  "id": "L07s22",
  "league": 7,
  "place": "Siegerquell",
  "col": 4,
  "row": 6,
  "map": "courtyard",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L07s18"
  ],
  "reward": {
   "xp": 96
  },
  "storyDe": "Ein stiller Umweg führt zu Siegerquell.",
  "storyEn": "A quiet detour leads to Siegerquell."
 },
 {
  "id": "L07s23",
  "league": 7,
  "place": "Stutenmilch",
  "col": 2,
  "row": 6,
  "map": "classic",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 1,
  "next": [
   "L07s28"
  ],
  "reward": {
   "xp": 102
  },
  "storyDe": "Der Pfad führt weiter über Stutenmilch.",
  "storyEn": "The path leads on across Stutenmilch."
 },
 {
  "id": "L07s24",
  "league": 7,
  "place": "Brandschneise",
  "col": 1,
  "row": 6,
  "map": "arena",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L07s27"
  ],
  "reward": {
   "xp": 96
  },
  "storyDe": "Abseits des Weges liegt Brandschneise.",
  "storyEn": "Off the road lies Brandschneise."
 },
 {
  "id": "L07s25",
  "league": 7,
  "place": "Distelwind",
  "col": 4,
  "row": 6,
  "map": "classic",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L07s22"
  ],
  "reward": {
   "xp": 96
  },
  "storyDe": "Ein stiller Umweg führt zu Distelwind.",
  "storyEn": "A quiet detour leads to Distelwind."
 },
 {
  "id": "L07s26",
  "league": 7,
  "place": "Sattelfeste",
  "col": 3,
  "row": 6,
  "map": "gauntlet",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L07s32"
  ],
  "reward": {
   "xp": 111
  },
  "storyDe": "Der Pfad führt weiter über Sattelfeste.",
  "storyEn": "The path leads on across Sattelfeste."
 },
 {
  "id": "L07s27",
  "league": 7,
  "place": "Lied der Weite",
  "col": 1,
  "row": 7,
  "map": "courtyard",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L07s30"
  ],
  "reward": {
   "xp": 96
  },
  "storyDe": "Abseits des Weges liegt Lied der Weite.",
  "storyEn": "Off the road lies Lied der Weite."
 },
 {
  "id": "L07s28",
  "league": 7,
  "place": "Fahnenwind",
  "col": 2,
  "row": 7,
  "map": "courtyard",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L07s31"
  ],
  "reward": {
   "xp": 108
  },
  "storyDe": "Der Pfad führt weiter über Fahnenwind.",
  "storyEn": "The path leads on across Fahnenwind."
 },
 {
  "id": "L07s29",
  "league": 7,
  "place": "Weites Rund II",
  "col": 4,
  "row": 7,
  "map": "arena",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L07s25"
  ],
  "reward": {
   "xp": 96
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Weites Rund II.",
  "storyEn": "A side path branches toward Weites Rund II."
 },
 {
  "id": "L07s30",
  "league": 7,
  "place": "Hufdonner II",
  "col": 1,
  "row": 7,
  "map": "classic",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L07s34"
  ],
  "reward": {
   "xp": 96
  },
  "storyDe": "Abseits des Weges liegt Hufdonner II.",
  "storyEn": "Off the road lies Hufdonner II."
 },
 {
  "id": "L07s31",
  "league": 7,
  "place": "Steppenulme",
  "col": 3,
  "row": 7,
  "map": "arena",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L07s38"
  ],
  "reward": {
   "xp": 114
  },
  "storyDe": "Der Pfad führt weiter über Steppenulme.",
  "storyEn": "The path leads on across Steppenulme."
 },
 {
  "id": "L07s32",
  "league": 7,
  "place": "Steppenkron",
  "col": 3,
  "row": 7,
  "map": "classic",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L07s35"
  ],
  "reward": {
   "xp": 117
  },
  "storyDe": "Der Pfad führt weiter über Steppenkron.",
  "storyEn": "The path leads on across Steppenkron."
 },
 {
  "id": "L07s33",
  "league": 7,
  "place": "Reiteraltar II",
  "col": 5,
  "row": 7,
  "map": "gauntlet",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L07s29"
  ],
  "reward": {
   "xp": 88
  },
  "storyDe": "Abseits des Weges liegt Reiteraltar II.",
  "storyEn": "Off the road lies Reiteraltar II.",
  "gate": {
   "gold": 85
  },
  "tagDe": "Zollstation",
  "tagEn": "Toll station"
 },
 {
  "id": "L07s34",
  "league": 7,
  "place": "Jurtenring II",
  "col": 1,
  "row": 8,
  "map": "arena",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L07s39"
  ],
  "reward": {
   "xp": 96
  },
  "storyDe": "Ein stiller Umweg führt zu Jurtenring II.",
  "storyEn": "A quiet detour leads to Jurtenring II."
 },
 {
  "id": "L07s35",
  "league": 7,
  "place": "Bannergrund",
  "col": 4,
  "row": 8,
  "map": "courtyard",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L07s40"
  ],
  "reward": {
   "xp": 123
  },
  "storyDe": "Der Pfad führt weiter über Bannergrund.",
  "storyEn": "The path leads on across Bannergrund."
 },
 {
  "id": "L07s36",
  "league": 7,
  "place": "Verlassene Jurte",
  "col": 5,
  "row": 8,
  "map": "courtyard",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L07s33",
   "L07s42"
  ],
  "reward": {
   "xp": 138
  },
  "storyDe": "Die Prüfung wartet bei Verlassene Jurte.",
  "storyEn": "The trial waits at Verlassene Jurte."
 },
 {
  "id": "L07s37",
  "league": 7,
  "place": "Asras Brunnen",
  "col": 4,
  "row": 8,
  "map": "classic",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L07s36"
  ],
  "reward": {
   "xp": 132
  },
  "storyDe": "Die Prüfung wartet bei Asras Brunnen.",
  "storyEn": "The trial waits at Asras Brunnen."
 },
 {
  "id": "L07s38",
  "league": 7,
  "place": "Der Ferne Riegel",
  "col": 3,
  "row": 8,
  "map": "skirmish",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 120
  },
  "storyDe": "Der Pfad führt weiter über Der Ferne Riegel.",
  "storyEn": "The path leads on across Der Ferne Riegel."
 },
 {
  "id": "L07s39",
  "league": 7,
  "place": "Zunderflur II",
  "col": 1,
  "row": 8,
  "map": "arena",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L07s46"
  ],
  "reward": {
   "xp": 96
  },
  "storyDe": "Abseits des Weges liegt Zunderflur II.",
  "storyEn": "Off the road lies Zunderflur II."
 },
 {
  "id": "L07s40",
  "league": 7,
  "place": "Falkenkanzel",
  "col": 4,
  "row": 8,
  "map": "gauntlet",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L07s41"
  ],
  "reward": {
   "xp": 126
  },
  "storyDe": "Die Prüfung wartet bei Falkenkanzel.",
  "storyEn": "The trial waits at Falkenkanzel."
 },
 {
  "id": "L07s41",
  "league": 7,
  "place": "Halle des einen Gangs",
  "col": 4,
  "row": 8,
  "map": "arena",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L07s37"
  ],
  "reward": {
   "xp": 129
  },
  "storyDe": "Die Prüfung wartet bei Halle des einen Gangs.",
  "storyEn": "The trial waits at Halle des einen Gangs.",
  "boss": {
   "piece": "dragon",
   "wins": 2
  },
  "tier": 2
 },
 {
  "id": "L07s42",
  "league": 7,
  "place": "Letzte Schranke",
  "col": 5,
  "row": 8,
  "map": "arena",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L07s43",
   "L07s45"
  ],
  "reward": {
   "xp": 144
  },
  "storyDe": "Die Prüfung wartet bei Letzte Schranke.",
  "storyEn": "The trial waits at Letzte Schranke."
 },
 {
  "id": "L07s43",
  "league": 7,
  "place": "Königsweide",
  "col": 5,
  "row": 9,
  "map": "classic",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L07s47"
  ],
  "reward": {
   "xp": 147
  },
  "storyDe": "Die Prüfung wartet bei Königsweide.",
  "storyEn": "The trial waits at Königsweide."
 },
 {
  "id": "L07s44",
  "league": 7,
  "place": "Grasklause",
  "col": 3,
  "row": 9,
  "map": "courtyard",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 168
  },
  "storyDe": "Der letzte Anstieg:  Grasklause.",
  "storyEn": "The final ascent:  Grasklause."
 },
 {
  "id": "L07s45",
  "league": 7,
  "place": "Zerrissene Standarte",
  "col": 5,
  "row": 9,
  "map": "skirmish",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L07s54",
   "L07s56",
   "L07s57"
  ],
  "reward": {
   "xp": 150
  },
  "storyDe": "Die Prüfung wartet bei Zerrissene Standarte.",
  "storyEn": "The trial waits at Zerrissene Standarte."
 },
 {
  "id": "L07s46",
  "league": 7,
  "place": "Der Wildwechsel II",
  "col": 1,
  "row": 9,
  "map": "skirmish",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L07s52"
  ],
  "reward": {
   "xp": 96
  },
  "storyDe": "Ein stiller Umweg führt zu Der Wildwechsel II.",
  "storyEn": "A quiet detour leads to Der Wildwechsel II."
 },
 {
  "id": "L07s47",
  "league": 7,
  "place": "Der Meister der Lanze",
  "col": 4,
  "row": 9,
  "map": "courtyard",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L07s48"
  ],
  "reward": {
   "xp": 153
  },
  "storyDe": "Der letzte Anstieg:  Der Meister der Lanze.",
  "storyEn": "The final ascent:  Der Meister der Lanze."
 },
 {
  "id": "L07s48",
  "league": 7,
  "place": "Viehtrift",
  "col": 4,
  "row": 9,
  "map": "gauntlet",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L07s51"
  ],
  "reward": {
   "xp": 156
  },
  "storyDe": "Der letzte Anstieg:  Viehtrift.",
  "storyEn": "The final ascent:  Viehtrift."
 },
 {
  "id": "L07s49",
  "league": 7,
  "place": "Hufschlagring",
  "col": 3,
  "row": 9,
  "map": "skirmish",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L07s44"
  ],
  "reward": {
   "xp": 165
  },
  "storyDe": "Der letzte Anstieg:  Hufschlagring.",
  "storyEn": "The final ascent:  Hufschlagring."
 },
 {
  "id": "L07s50",
  "league": 7,
  "place": "Rast der Reiter",
  "col": 3,
  "row": 9,
  "map": "classic",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L07s49"
  ],
  "reward": {
   "xp": 162
  },
  "storyDe": "Der letzte Anstieg:  Rast der Reiter.",
  "storyEn": "The final ascent:  Rast der Reiter."
 },
 {
  "id": "L07s51",
  "league": 7,
  "place": "Das Ferne Tor",
  "col": 4,
  "row": 9,
  "map": "arena",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L07s50"
  ],
  "reward": {
   "xp": 159
  },
  "storyDe": "Der letzte Anstieg:  Das Ferne Tor.",
  "storyEn": "The final ascent:  Das Ferne Tor."
 },
 {
  "id": "L07s52",
  "league": 7,
  "place": "Wo die Lanze fällt II",
  "col": 1,
  "row": 9,
  "map": "courtyard",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [
   "L07s53"
  ],
  "reward": {
   "xp": 96,
   "gold": 96
  },
  "storyDe": "Ein stiller Umweg führt zu Wo die Lanze fällt II.",
  "storyEn": "A quiet detour leads to Wo die Lanze fällt II."
 },
 {
  "id": "L07s53",
  "league": 7,
  "place": "Hoher Ausguck",
  "col": 1,
  "row": 10,
  "map": "skirmish",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [
   "L07s55"
  ],
  "reward": {
   "xp": 135
  },
  "storyDe": "Die Prüfung wartet bei Hoher Ausguck.",
  "storyEn": "The trial waits at Hoher Ausguck."
 },
 {
  "id": "L07s54",
  "league": 7,
  "place": "Hufeisenglück",
  "col": 5,
  "row": 10,
  "map": "classic",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 177,
   "gold": 48
  },
  "storyDe": "Hufeisenglück: Hier wartet der Meister von Kapitel VII.",
  "storyEn": "Hufeisenglück: here waits the master of chapter VII.",
  "final": true,
  "boss": {
   "pure": "b17"
  },
  "tier": 3
 },
 {
  "id": "L07s55",
  "league": 7,
  "place": "Böenritt",
  "col": 1,
  "row": 10,
  "map": "gauntlet",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 141
  },
  "storyDe": "Die Prüfung wartet bei Böenritt.",
  "storyEn": "The trial waits at Böenritt."
 },
 {
  "id": "L07s56",
  "league": 7,
  "place": "Schilfmeer",
  "col": 5,
  "row": 9,
  "map": "gauntlet",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 171
  },
  "storyDe": "Der letzte Anstieg:  Schilfmeer.",
  "storyEn": "The final ascent:  Schilfmeer."
 },
 {
  "id": "L07s57",
  "league": 7,
  "place": "Stromschnellenfurt",
  "col": 5,
  "row": 9,
  "map": "arena",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 1,
  "next": [],
  "reward": {
   "xp": 174
  },
  "storyDe": "Der letzte Anstieg:  Stromschnellenfurt.",
  "storyEn": "The final ascent:  Stromschnellenfurt."
 },
 {
  "id": "L08s00",
  "league": 8,
  "place": "Oberkante",
  "col": 1,
  "row": 1,
  "map": "classic",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L08s01"
  ],
  "reward": {
   "xp": 78
  },
  "storyDe": "Der Weg beginnt bei Oberkante.",
  "storyEn": "The road begins at Oberkante."
 },
 {
  "id": "L08s01",
  "league": 8,
  "place": "Hammerschlag",
  "col": 1,
  "row": 1,
  "map": "skirmish",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L08s02"
  ],
  "reward": {
   "xp": 81
  },
  "storyDe": "Der Weg beginnt bei Hammerschlag.",
  "storyEn": "The road begins at Hammerschlag."
 },
 {
  "id": "L08s02",
  "league": 8,
  "place": "Zinnoberaltar",
  "col": 1,
  "row": 2,
  "map": "courtyard",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L08s03"
  ],
  "reward": {
   "xp": 84
  },
  "storyDe": "Der Weg beginnt bei Zinnoberaltar.",
  "storyEn": "The road begins at Zinnoberaltar."
 },
 {
  "id": "L08s03",
  "league": 8,
  "place": "Räubersitz",
  "col": 1,
  "row": 2,
  "map": "gauntlet",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L08s06"
  ],
  "reward": {
   "xp": 87
  },
  "storyDe": "Der Weg beginnt bei Räubersitz.",
  "storyEn": "The road begins at Räubersitz."
 },
 {
  "id": "L08s04",
  "league": 8,
  "place": "Steinschlag",
  "col": 6,
  "row": 3,
  "map": "arena",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 102
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Steinschlag.",
  "storyEn": "A side path branches toward Steinschlag.",
  "boss": {
   "piece": "amazon",
   "wins": 1
  },
  "tier": 3
 },
 {
  "id": "L08s05",
  "league": 8,
  "place": "Tiefenblick",
  "col": 4,
  "row": 3,
  "map": "classic",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 102,
   "gold": 62
  },
  "storyDe": "Abseits des Weges liegt Tiefenblick.",
  "storyEn": "Off the road lies Tiefenblick."
 },
 {
  "id": "L08s06",
  "league": 8,
  "place": "Geröllrutsche",
  "col": 1,
  "row": 3,
  "map": "arena",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L08s08",
   "L08s11"
  ],
  "reward": {
   "xp": 90
  },
  "storyDe": "Der Weg beginnt bei Geröllrutsche.",
  "storyEn": "The road begins at Geröllrutsche."
 },
 {
  "id": "L08s07",
  "league": 8,
  "place": "Königsschlucht",
  "col": 5,
  "row": 3,
  "map": "courtyard",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L08s04"
  ],
  "reward": {
   "xp": 102
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Königsschlucht.",
  "storyEn": "A side path branches toward Königsschlucht."
 },
 {
  "id": "L08s08",
  "league": 8,
  "place": "Der Kondorpfad",
  "col": 2,
  "row": 3,
  "map": "classic",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L08s10"
  ],
  "reward": {
   "xp": 93
  },
  "storyDe": "Der Weg beginnt bei Der Kondorpfad.",
  "storyEn": "The road begins at Der Kondorpfad."
 },
 {
  "id": "L08s09",
  "league": 8,
  "place": "Rostregen",
  "col": 3,
  "row": 3,
  "map": "arena",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L08s05"
  ],
  "reward": {
   "xp": 94
  },
  "storyDe": "Ein stiller Umweg führt zu Rostregen.",
  "storyEn": "A quiet detour leads to Rostregen."
 },
 {
  "id": "L08s10",
  "league": 8,
  "place": "Wo die Treppe hinabführt",
  "col": 2,
  "row": 3,
  "map": "skirmish",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L08s12"
  ],
  "reward": {
   "xp": 96
  },
  "storyDe": "Der Pfad führt weiter über Wo die Treppe hinabführt.",
  "storyEn": "The path leads on across Wo die Treppe hinabführt."
 },
 {
  "id": "L08s11",
  "league": 8,
  "place": "Die Faust am Grund",
  "col": 1,
  "row": 4,
  "map": "skirmish",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L08s16"
  ],
  "reward": {
   "xp": 94
  },
  "storyDe": "Abseits des Weges liegt Die Faust am Grund.",
  "storyEn": "Off the road lies Die Faust am Grund."
 },
 {
  "id": "L08s12",
  "league": 8,
  "place": "Messerschlucht",
  "col": 2,
  "row": 4,
  "map": "courtyard",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L08s15"
  ],
  "reward": {
   "xp": 99
  },
  "storyDe": "Der Pfad führt weiter über Messerschlucht.",
  "storyEn": "The path leads on across Messerschlucht.",
  "boss": {
   "pure": "b01",
   "rotation": [
    "b01",
    "b09"
   ]
  },
  "tier": 3
 },
 {
  "id": "L08s13",
  "league": 8,
  "place": "Maultiersteige",
  "col": 5,
  "row": 4,
  "map": "gauntlet",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L08s07"
  ],
  "reward": {
   "xp": 102
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Maultiersteige.",
  "storyEn": "A side path branches toward Maultiersteige."
 },
 {
  "id": "L08s14",
  "league": 8,
  "place": "Abbruchkante",
  "col": 3,
  "row": 4,
  "map": "classic",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L08s09",
   "L08s17"
  ],
  "reward": {
   "xp": 108
  },
  "storyDe": "Der Pfad führt weiter über Abbruchkante.",
  "storyEn": "The path leads on across Abbruchkante."
 },
 {
  "id": "L08s15",
  "league": 8,
  "place": "Steinmesse",
  "col": 2,
  "row": 4,
  "map": "gauntlet",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L08s21"
  ],
  "reward": {
   "xp": 102
  },
  "storyDe": "Der Pfad führt weiter über Steinmesse.",
  "storyEn": "The path leads on across Steinmesse."
 },
 {
  "id": "L08s16",
  "league": 8,
  "place": "Das Glühende Tor",
  "col": 1,
  "row": 4,
  "map": "skirmish",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L08s19"
  ],
  "reward": {
   "xp": 102
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Das Glühende Tor.",
  "storyEn": "A side path branches toward Das Glühende Tor."
 },
 {
  "id": "L08s17",
  "league": 8,
  "place": "Flimmerhitze",
  "col": 4,
  "row": 5,
  "map": "skirmish",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L08s18"
  ],
  "reward": {
   "xp": 111
  },
  "storyDe": "Die Prüfung wartet bei Flimmerhitze.",
  "storyEn": "The trial waits at Flimmerhitze."
 },
 {
  "id": "L08s18",
  "league": 8,
  "place": "Glutofen",
  "col": 4,
  "row": 5,
  "map": "courtyard",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L08s22"
  ],
  "reward": {
   "xp": 114
  },
  "storyDe": "Die Prüfung wartet bei Glutofen.",
  "storyEn": "The trial waits at Glutofen.",
  "boss": {
   "piece": "warlock",
   "wins": 2
  },
  "tier": 4
 },
 {
  "id": "L08s19",
  "league": 8,
  "place": "Rast am Schlund",
  "col": 1,
  "row": 5,
  "map": "arena",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L08s26"
  ],
  "reward": {
   "xp": 102
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Rast am Schlund.",
  "storyEn": "A side path branches toward Rast am Schlund."
 },
 {
  "id": "L08s20",
  "league": 8,
  "place": "Zerborstene Stufen",
  "col": 5,
  "row": 5,
  "map": "classic",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L08s13"
  ],
  "reward": {
   "xp": 102
  },
  "storyDe": "Abseits des Weges liegt Zerborstene Stufen.",
  "storyEn": "Off the road lies Zerborstene Stufen."
 },
 {
  "id": "L08s21",
  "league": 8,
  "place": "Kupferader",
  "col": 2,
  "row": 5,
  "map": "arena",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L08s14",
   "L08s24"
  ],
  "reward": {
   "xp": 105
  },
  "storyDe": "Der Pfad führt weiter über Kupferader.",
  "storyEn": "The path leads on across Kupferader."
 },
 {
  "id": "L08s22",
  "league": 8,
  "place": "Felsenhorst",
  "col": 4,
  "row": 5,
  "map": "gauntlet",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L08s25"
  ],
  "reward": {
   "xp": 117
  },
  "storyDe": "Die Prüfung wartet bei Felsenhorst.",
  "storyEn": "The trial waits at Felsenhorst."
 },
 {
  "id": "L08s23",
  "league": 8,
  "place": "Einsiedlerloch",
  "col": 5,
  "row": 5,
  "map": "gauntlet",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L08s20"
  ],
  "reward": {
   "xp": 102
  },
  "storyDe": "Abseits des Weges liegt Einsiedlerloch.",
  "storyEn": "Off the road lies Einsiedlerloch."
 },
 {
  "id": "L08s24",
  "league": 8,
  "place": "Windgeschliffen",
  "col": 2,
  "row": 6,
  "map": "arena",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L08s30"
  ],
  "reward": {
   "xp": 94
  },
  "storyDe": "Ein stiller Umweg führt zu Windgeschliffen.",
  "storyEn": "A quiet detour leads to Windgeschliffen."
 },
 {
  "id": "L08s25",
  "league": 8,
  "place": "Zinnendorn",
  "col": 4,
  "row": 6,
  "map": "arena",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L08s27",
   "L08s28"
  ],
  "reward": {
   "xp": 120
  },
  "storyDe": "Die Prüfung wartet bei Zinnendorn.",
  "storyEn": "The trial waits at Zinnendorn."
 },
 {
  "id": "L08s26",
  "league": 8,
  "place": "Furtlose Enge",
  "col": 1,
  "row": 6,
  "map": "skirmish",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L08s29"
  ],
  "reward": {
   "xp": 102
  },
  "storyDe": "Abseits des Weges liegt Furtlose Enge.",
  "storyEn": "Off the road lies Furtlose Enge."
 },
 {
  "id": "L08s27",
  "league": 8,
  "place": "Glutkamm",
  "col": 4,
  "row": 6,
  "map": "classic",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L08s32"
  ],
  "reward": {
   "xp": 123
  },
  "storyDe": "Die Prüfung wartet bei Glutkamm.",
  "storyEn": "The trial waits at Glutkamm."
 },
 {
  "id": "L08s28",
  "league": 8,
  "place": "Scherbengrat",
  "col": 4,
  "row": 6,
  "map": "gauntlet",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L08s31",
   "L08s23"
  ],
  "reward": {
   "xp": 94
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Scherbengrat.",
  "storyEn": "A side path branches toward Scherbengrat.",
  "gate": {
   "gold": 95
  },
  "tagDe": "Zollstation",
  "tagEn": "Toll station"
 },
 {
  "id": "L08s29",
  "league": 8,
  "place": "Tropfsteinorgel",
  "col": 1,
  "row": 6,
  "map": "arena",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 102,
   "gold": 104
  },
  "storyDe": "Abseits des Weges liegt Tropfsteinorgel.",
  "storyEn": "Off the road lies Tropfsteinorgel."
 },
 {
  "id": "L08s30",
  "league": 8,
  "place": "Seilrolle",
  "col": 2,
  "row": 6,
  "map": "classic",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L08s33"
  ],
  "reward": {
   "xp": 102
  },
  "storyDe": "Ein stiller Umweg führt zu Seilrolle.",
  "storyEn": "A quiet detour leads to Seilrolle."
 },
 {
  "id": "L08s31",
  "league": 8,
  "place": "Hängebrück",
  "col": 5,
  "row": 7,
  "map": "skirmish",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L08s35"
  ],
  "reward": {
   "xp": 102
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Hängebrück.",
  "storyEn": "A side path branches toward Hängebrück."
 },
 {
  "id": "L08s32",
  "league": 8,
  "place": "Das Berstende Tor",
  "col": 4,
  "row": 7,
  "map": "skirmish",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L08s36"
  ],
  "reward": {
   "xp": 126
  },
  "storyDe": "Die Prüfung wartet bei Das Berstende Tor.",
  "storyEn": "The trial waits at Das Berstende Tor."
 },
 {
  "id": "L08s33",
  "league": 8,
  "place": "Grubenlampen",
  "col": 2,
  "row": 7,
  "map": "gauntlet",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L08s37"
  ],
  "reward": {
   "xp": 102
  },
  "storyDe": "Ein stiller Umweg führt zu Grubenlampen.",
  "storyEn": "A quiet detour leads to Grubenlampen."
 },
 {
  "id": "L08s34",
  "league": 8,
  "place": "Der Versteinerte Hain",
  "col": 6,
  "row": 7,
  "map": "arena",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 102,
   "gold": 104
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Der Versteinerte Hain.",
  "storyEn": "A side path branches toward Der Versteinerte Hain."
 },
 {
  "id": "L08s35",
  "league": 8,
  "place": "Dornengesims",
  "col": 5,
  "row": 7,
  "map": "classic",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L08s34"
  ],
  "reward": {
   "xp": 102
  },
  "storyDe": "Abseits des Weges liegt Dornengesims.",
  "storyEn": "Off the road lies Dornengesims."
 },
 {
  "id": "L08s36",
  "league": 8,
  "place": "Schwalbennische",
  "col": 4,
  "row": 7,
  "map": "courtyard",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L08s38",
   "L08s39"
  ],
  "reward": {
   "xp": 129
  },
  "storyDe": "Der letzte Anstieg:  Schwalbennische.",
  "storyEn": "The final ascent:  Schwalbennische."
 },
 {
  "id": "L08s37",
  "league": 8,
  "place": "Talenge",
  "col": 2,
  "row": 8,
  "map": "courtyard",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L08s41"
  ],
  "reward": {
   "xp": 102
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Talenge.",
  "storyEn": "A side path branches toward Talenge."
 },
 {
  "id": "L08s38",
  "league": 8,
  "place": "Wachtfels",
  "col": 4,
  "row": 8,
  "map": "gauntlet",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 94,
   "gold": 34
  },
  "storyDe": "Abseits des Weges liegt Wachtfels.",
  "storyEn": "Off the road lies Wachtfels."
 },
 {
  "id": "L08s39",
  "league": 8,
  "place": "Kondorkanzel",
  "col": 4,
  "row": 8,
  "map": "gauntlet",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L08s40"
  ],
  "reward": {
   "xp": 132
  },
  "storyDe": "Der letzte Anstieg:  Kondorkanzel.",
  "storyEn": "The final ascent:  Kondorkanzel."
 },
 {
  "id": "L08s40",
  "league": 8,
  "place": "Halle der geballten Faust",
  "col": 5,
  "row": 9,
  "map": "arena",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L08s43",
   "L08s46"
  ],
  "reward": {
   "xp": 135
  },
  "storyDe": "Der letzte Anstieg:  Halle der geballten Faust.",
  "storyEn": "The final ascent:  Halle der geballten Faust."
 },
 {
  "id": "L08s41",
  "league": 8,
  "place": "Ockerwanne",
  "col": 2,
  "row": 9,
  "map": "skirmish",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L08s42"
  ],
  "reward": {
   "xp": 102
  },
  "storyDe": "Abseits des Weges liegt Ockerwanne.",
  "storyEn": "Off the road lies Ockerwanne."
 },
 {
  "id": "L08s42",
  "league": 8,
  "place": "Schuttrinne",
  "col": 2,
  "row": 9,
  "map": "courtyard",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L08s44"
  ],
  "reward": {
   "xp": 102
  },
  "storyDe": "Ein stiller Umweg führt zu Schuttrinne.",
  "storyEn": "A quiet detour leads to Schuttrinne."
 },
 {
  "id": "L08s43",
  "league": 8,
  "place": "Bussardstand",
  "col": 4,
  "row": 9,
  "map": "gauntlet",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L08s47"
  ],
  "reward": {
   "xp": 94
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Bussardstand.",
  "storyEn": "A side path branches toward Bussardstand."
 },
 {
  "id": "L08s44",
  "league": 8,
  "place": "Heiße Quelle",
  "col": 1,
  "row": 9,
  "map": "arena",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L08s45"
  ],
  "reward": {
   "xp": 102
  },
  "storyDe": "Abseits des Weges liegt Heiße Quelle.",
  "storyEn": "Off the road lies Heiße Quelle."
 },
 {
  "id": "L08s45",
  "league": 8,
  "place": "Eisenblüte",
  "col": 1,
  "row": 9,
  "map": "classic",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 102,
   "gold": 104
  },
  "storyDe": "Ein stiller Umweg führt zu Eisenblüte.",
  "storyEn": "A quiet detour leads to Eisenblüte."
 },
 {
  "id": "L08s46",
  "league": 8,
  "place": "Blasebalg",
  "col": 5,
  "row": 9,
  "map": "classic",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L08s48"
  ],
  "reward": {
   "xp": 138
  },
  "storyDe": "Der letzte Anstieg:  Blasebalg.",
  "storyEn": "The final ascent:  Blasebalg."
 },
 {
  "id": "L08s47",
  "league": 8,
  "place": "Zunderspalte",
  "col": 4,
  "row": 9,
  "map": "courtyard",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 102,
   "gold": 62
  },
  "storyDe": "Abseits des Weges liegt Zunderspalte.",
  "storyEn": "Off the road lies Zunderspalte."
 },
 {
  "id": "L08s48",
  "league": 8,
  "place": "Aussichtsnadel",
  "col": 5,
  "row": 10,
  "map": "skirmish",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L08s49"
  ],
  "reward": {
   "xp": 141
  },
  "storyDe": "Der letzte Anstieg:  Aussichtsnadel.",
  "storyEn": "The final ascent:  Aussichtsnadel."
 },
 {
  "id": "L08s49",
  "league": 8,
  "place": "Verlassener Stollen",
  "col": 5,
  "row": 10,
  "map": "courtyard",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 144,
   "gold": 52
  },
  "storyDe": "Verlassener Stollen: Hier wartet der Meister von Kapitel VIII.",
  "storyEn": "Verlassener Stollen: here waits the master of chapter VIII.",
  "final": true,
  "boss": {
   "pure": "b18"
  },
  "tier": 4
 },
 {
  "id": "L09s00",
  "league": 9,
  "place": "Erster Riss",
  "col": 1,
  "row": 1,
  "map": "classic",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 3,
  "next": [
   "L09s01"
  ],
  "reward": {
   "xp": 84
  },
  "storyDe": "Der Weg beginnt bei Erster Riss.",
  "storyEn": "The road begins at Erster Riss."
 },
 {
  "id": "L09s01",
  "league": 9,
  "place": "Staubglocke",
  "col": 1,
  "row": 2,
  "map": "skirmish",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 3,
  "next": [
   "L09s02",
   "L09s07"
  ],
  "reward": {
   "xp": 87
  },
  "storyDe": "Der Weg beginnt bei Staubglocke.",
  "storyEn": "The road begins at Staubglocke."
 },
 {
  "id": "L09s02",
  "league": 9,
  "place": "Wundaltar",
  "col": 2,
  "row": 2,
  "map": "courtyard",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 3,
  "next": [
   "L09s04"
  ],
  "reward": {
   "xp": 90
  },
  "storyDe": "Der Weg beginnt bei Wundaltar.",
  "storyEn": "The road begins at Wundaltar."
 },
 {
  "id": "L09s03",
  "league": 9,
  "place": "Rabenacker",
  "col": 5,
  "row": 3,
  "map": "gauntlet",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [],
  "reward": {
   "xp": 108,
   "gold": 112
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Rabenacker.",
  "storyEn": "A side path branches toward Rabenacker."
 },
 {
  "id": "L09s04",
  "league": 9,
  "place": "Plünderersitz",
  "col": 2,
  "row": 3,
  "map": "gauntlet",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 3,
  "next": [
   "L09s06"
  ],
  "reward": {
   "xp": 93
  },
  "storyDe": "Der Weg beginnt bei Plünderersitz.",
  "storyEn": "The road begins at Plünderersitz."
 },
 {
  "id": "L09s05",
  "league": 9,
  "place": "Kanzel der Wunde",
  "col": 4,
  "row": 3,
  "map": "classic",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L09s03"
  ],
  "reward": {
   "xp": 108
  },
  "storyDe": "Ein stiller Umweg führt zu Kanzel der Wunde.",
  "storyEn": "A quiet detour leads to Kanzel der Wunde."
 },
 {
  "id": "L09s06",
  "league": 9,
  "place": "Splitterknochen",
  "col": 2,
  "row": 3,
  "map": "arena",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 3,
  "next": [
   "L09s08"
  ],
  "reward": {
   "xp": 96
  },
  "storyDe": "Der Pfad führt weiter über Splitterknochen.",
  "storyEn": "The path leads on across Splitterknochen."
 },
 {
  "id": "L09s07",
  "league": 9,
  "place": "Halle des vollen Kelchs",
  "col": 1,
  "row": 4,
  "map": "courtyard",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [
   "L09s10"
  ],
  "reward": {
   "xp": 100
  },
  "storyDe": "Abseits des Weges liegt Halle des vollen Kelchs.",
  "storyEn": "Off the road lies Halle des vollen Kelchs."
 },
 {
  "id": "L09s08",
  "league": 9,
  "place": "Der Galgenpfad",
  "col": 3,
  "row": 4,
  "map": "classic",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 3,
  "next": [
   "L09s11"
  ],
  "reward": {
   "xp": 99
  },
  "storyDe": "Der Pfad führt weiter über Der Galgenpfad.",
  "storyEn": "The path leads on across Der Galgenpfad.",
  "boss": {
   "pure": "b13",
   "rotation": [
    "b13",
    "b22"
   ]
  },
  "tier": 4
 },
 {
  "id": "L09s09",
  "league": 9,
  "place": "Bittersalz",
  "col": 4,
  "row": 4,
  "map": "arena",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L09s05",
   "L09s12"
  ],
  "reward": {
   "xp": 100
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Bittersalz.",
  "storyEn": "A side path branches toward Bittersalz.",
  "gate": {
   "gold": 105
  },
  "tagDe": "Zollstation",
  "tagEn": "Toll station"
 },
 {
  "id": "L09s10",
  "league": 9,
  "place": "Galgenhöhe",
  "col": 1,
  "row": 4,
  "map": "classic",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [
   "L09s15"
  ],
  "reward": {
   "xp": 108
  },
  "storyDe": "Abseits des Weges liegt Galgenhöhe.",
  "storyEn": "Off the road lies Galgenhöhe."
 },
 {
  "id": "L09s11",
  "league": 9,
  "place": "Wo die Erde trank",
  "col": 3,
  "row": 4,
  "map": "skirmish",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [
   "L09s09",
   "L09s14",
   "L09s16"
  ],
  "reward": {
   "xp": 102
  },
  "storyDe": "Der Pfad führt weiter über Wo die Erde trank.",
  "storyEn": "The path leads on across Wo die Erde trank."
 },
 {
  "id": "L09s12",
  "league": 9,
  "place": "Verlassene Kate",
  "col": 4,
  "row": 5,
  "map": "courtyard",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L09s13"
  ],
  "reward": {
   "xp": 108
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Verlassene Kate.",
  "storyEn": "A side path branches toward Verlassene Kate."
 },
 {
  "id": "L09s13",
  "league": 9,
  "place": "Staubwalze",
  "col": 5,
  "row": 5,
  "map": "gauntlet",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L09s17"
  ],
  "reward": {
   "xp": 108
  },
  "storyDe": "Abseits des Weges liegt Staubwalze.",
  "storyEn": "Off the road lies Staubwalze."
 },
 {
  "id": "L09s14",
  "league": 9,
  "place": "Dornenkelch",
  "col": 3,
  "row": 5,
  "map": "courtyard",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [
   "L09s18"
  ],
  "reward": {
   "xp": 105
  },
  "storyDe": "Der Pfad führt weiter über Dornenkelch.",
  "storyEn": "The path leads on across Dornenkelch."
 },
 {
  "id": "L09s15",
  "league": 9,
  "place": "Letzter Schluck",
  "col": 1,
  "row": 5,
  "map": "classic",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [],
  "reward": {
   "xp": 108,
   "gold": 67
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Letzter Schluck.",
  "storyEn": "A side path branches toward Letzter Schluck."
 },
 {
  "id": "L09s16",
  "league": 9,
  "place": "Königsdurst",
  "col": 2,
  "row": 5,
  "map": "skirmish",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L09s19",
   "L09s20"
  ],
  "reward": {
   "xp": 100
  },
  "storyDe": "Abseits des Weges liegt Königsdurst.",
  "storyEn": "Off the road lies Königsdurst."
 },
 {
  "id": "L09s17",
  "league": 9,
  "place": "Zehrfeuer",
  "col": 5,
  "row": 5,
  "map": "courtyard",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [],
  "reward": {
   "xp": 108,
   "gold": 112
  },
  "storyDe": "Ein stiller Umweg führt zu Zehrfeuer.",
  "storyEn": "A quiet detour leads to Zehrfeuer."
 },
 {
  "id": "L09s18",
  "league": 9,
  "place": "Kelchmesse",
  "col": 4,
  "row": 6,
  "map": "gauntlet",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [
   "L09s21"
  ],
  "reward": {
   "xp": 108
  },
  "storyDe": "Die Prüfung wartet bei Kelchmesse.",
  "storyEn": "The trial waits at Kelchmesse."
 },
 {
  "id": "L09s19",
  "league": 9,
  "place": "Die Magd am Kelch",
  "col": 2,
  "row": 6,
  "map": "arena",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L09s24"
  ],
  "reward": {
   "xp": 108
  },
  "storyDe": "Abseits des Weges liegt Die Magd am Kelch.",
  "storyEn": "Off the road lies Die Magd am Kelch."
 },
 {
  "id": "L09s20",
  "league": 9,
  "place": "Marterpfad",
  "col": 3,
  "row": 6,
  "map": "classic",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [],
  "reward": {
   "xp": 108,
   "gold": 112
  },
  "storyDe": "Ein stiller Umweg führt zu Marterpfad.",
  "storyEn": "A quiet detour leads to Marterpfad."
 },
 {
  "id": "L09s21",
  "league": 9,
  "place": "Fahles Land",
  "col": 4,
  "row": 6,
  "map": "arena",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [
   "L09s22"
  ],
  "reward": {
   "xp": 111
  },
  "storyDe": "Die Prüfung wartet bei Fahles Land.",
  "storyEn": "The trial waits at Fahles Land.",
  "boss": {
   "piece": "inquisitor",
   "wins": 2
  },
  "tier": 4
 },
 {
  "id": "L09s22",
  "league": 9,
  "place": "Sprödes Bett",
  "col": 4,
  "row": 7,
  "map": "classic",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [
   "L09s23"
  ],
  "reward": {
   "xp": 114
  },
  "storyDe": "Die Prüfung wartet bei Sprödes Bett.",
  "storyEn": "The trial waits at Sprödes Bett."
 },
 {
  "id": "L09s23",
  "league": 9,
  "place": "Grauschleier",
  "col": 4,
  "row": 7,
  "map": "skirmish",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [
   "L09s25"
  ],
  "reward": {
   "xp": 117
  },
  "storyDe": "Die Prüfung wartet bei Grauschleier.",
  "storyEn": "The trial waits at Grauschleier."
 },
 {
  "id": "L09s24",
  "league": 9,
  "place": "Das Rostige Tor",
  "col": 1,
  "row": 8,
  "map": "arena",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [],
  "reward": {
   "xp": 108,
   "gold": 112
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Das Rostige Tor.",
  "storyEn": "A side path branches toward Das Rostige Tor."
 },
 {
  "id": "L09s25",
  "league": 9,
  "place": "Totes Geäst",
  "col": 4,
  "row": 8,
  "map": "courtyard",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L09s26",
   "L09s27"
  ],
  "reward": {
   "xp": 120
  },
  "storyDe": "Der letzte Anstieg:  Totes Geäst.",
  "storyEn": "The final ascent:  Totes Geäst."
 },
 {
  "id": "L09s26",
  "league": 9,
  "place": "Rast der Verlorenen",
  "col": 4,
  "row": 8,
  "map": "skirmish",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L09s28"
  ],
  "reward": {
   "xp": 100
  },
  "storyDe": "Ein stiller Umweg führt zu Rast der Verlorenen.",
  "storyEn": "A quiet detour leads to Rast der Verlorenen."
 },
 {
  "id": "L09s27",
  "league": 9,
  "place": "Dornenfeste",
  "col": 5,
  "row": 8,
  "map": "gauntlet",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L09s29",
   "L09s31"
  ],
  "reward": {
   "xp": 123
  },
  "storyDe": "Der letzte Anstieg:  Dornenfeste.",
  "storyEn": "The final ascent:  Dornenfeste."
 },
 {
  "id": "L09s28",
  "league": 9,
  "place": "Aschepfand",
  "col": 4,
  "row": 8,
  "map": "gauntlet",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L09s30"
  ],
  "reward": {
   "xp": 108
  },
  "storyDe": "Abseits des Weges liegt Aschepfand.",
  "storyEn": "Off the road lies Aschepfand."
 },
 {
  "id": "L09s29",
  "league": 9,
  "place": "Graudorn",
  "col": 5,
  "row": 8,
  "map": "arena",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L09s32"
  ],
  "reward": {
   "xp": 126
  },
  "storyDe": "Der letzte Anstieg:  Graudorn.",
  "storyEn": "The final ascent:  Graudorn."
 },
 {
  "id": "L09s30",
  "league": 9,
  "place": "Wundklause",
  "col": 4,
  "row": 8,
  "map": "classic",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L09s33"
  ],
  "reward": {
   "xp": 108
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Wundklause.",
  "storyEn": "A side path branches toward Wundklause."
 },
 {
  "id": "L09s31",
  "league": 9,
  "place": "Lakensenke",
  "col": 4,
  "row": 9,
  "map": "skirmish",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [],
  "reward": {
   "xp": 100,
   "gold": 37
  },
  "storyDe": "Abseits des Weges liegt Lakensenke.",
  "storyEn": "Off the road lies Lakensenke."
 },
 {
  "id": "L09s32",
  "league": 9,
  "place": "Dornendiadem",
  "col": 5,
  "row": 9,
  "map": "classic",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L09s34"
  ],
  "reward": {
   "xp": 129
  },
  "storyDe": "Der letzte Anstieg:  Dornendiadem.",
  "storyEn": "The final ascent:  Dornendiadem."
 },
 {
  "id": "L09s33",
  "league": 9,
  "place": "Blutzoll",
  "col": 3,
  "row": 9,
  "map": "gauntlet",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [],
  "reward": {
   "xp": 108,
   "gold": 112
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Blutzoll.",
  "storyEn": "A side path branches toward Blutzoll."
 },
 {
  "id": "L09s34",
  "league": 9,
  "place": "Das Ausgeblutete Tor",
  "col": 5,
  "row": 9,
  "map": "skirmish",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [],
  "reward": {
   "xp": 132,
   "gold": 56
  },
  "storyDe": "Das Ausgeblutete Tor: Hier wartet der Meister von Kapitel IX.",
  "storyEn": "Das Ausgeblutete Tor: here waits the master of chapter IX.",
  "final": true,
  "boss": {
   "pure": "b08"
  },
  "tier": 4
 },
 {
  "id": "L10s00",
  "league": 10,
  "place": "Trockentor",
  "col": 0,
  "row": 1,
  "map": "classic",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L10s02"
  ],
  "reward": {
   "xp": 90
  },
  "storyDe": "Der Weg beginnt bei Trockentor.",
  "storyEn": "The road begins at Trockentor."
 },
 {
  "id": "L10s01",
  "league": 10,
  "place": "Wasserprobe",
  "col": 3,
  "row": 2,
  "map": "skirmish",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 114,
   "gold": 120
  },
  "storyDe": "Ein stiller Umweg führt zu Wasserprobe.",
  "storyEn": "A quiet detour leads to Wasserprobe."
 },
 {
  "id": "L10s02",
  "league": 10,
  "place": "Karawanenglocke",
  "col": 1,
  "row": 2,
  "map": "skirmish",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L10s04"
  ],
  "reward": {
   "xp": 93
  },
  "storyDe": "Der Weg beginnt bei Karawanenglocke.",
  "storyEn": "The road begins at Karawanenglocke."
 },
 {
  "id": "L10s03",
  "league": 10,
  "place": "Skarabäenfeld",
  "col": 3,
  "row": 2,
  "map": "gauntlet",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L10s01"
  ],
  "reward": {
   "xp": 114
  },
  "storyDe": "Abseits des Weges liegt Skarabäenfeld.",
  "storyEn": "Off the road lies Skarabäenfeld."
 },
 {
  "id": "L10s04",
  "league": 10,
  "place": "Dünenaltar",
  "col": 1,
  "row": 2,
  "map": "courtyard",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L10s05"
  ],
  "reward": {
   "xp": 96
  },
  "storyDe": "Der Weg beginnt bei Dünenaltar.",
  "storyEn": "The road begins at Dünenaltar."
 },
 {
  "id": "L10s05",
  "league": 10,
  "place": "Lastenrast",
  "col": 1,
  "row": 3,
  "map": "gauntlet",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L10s08"
  ],
  "reward": {
   "xp": 99
  },
  "storyDe": "Der Weg beginnt bei Lastenrast.",
  "storyEn": "The road begins at Lastenrast."
 },
 {
  "id": "L10s06",
  "league": 10,
  "place": "Blaue Grotte",
  "col": 2,
  "row": 3,
  "map": "skirmish",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L10s03",
   "L10s07"
  ],
  "reward": {
   "xp": 114
  },
  "storyDe": "Abseits des Weges liegt Blaue Grotte.",
  "storyEn": "Off the road lies Blaue Grotte."
 },
 {
  "id": "L10s07",
  "league": 10,
  "place": "Treibsandfalle",
  "col": 2,
  "row": 3,
  "map": "courtyard",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L10s10"
  ],
  "reward": {
   "xp": 114
  },
  "storyDe": "Ein stiller Umweg führt zu Treibsandfalle.",
  "storyEn": "A quiet detour leads to Treibsandfalle."
 },
 {
  "id": "L10s08",
  "league": 10,
  "place": "Dornengürtel",
  "col": 1,
  "row": 4,
  "map": "arena",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L10s15"
  ],
  "reward": {
   "xp": 102
  },
  "storyDe": "Der Weg beginnt bei Dornengürtel.",
  "storyEn": "The road begins at Dornengürtel."
 },
 {
  "id": "L10s09",
  "league": 10,
  "place": "Seilbrück",
  "col": 3,
  "row": 4,
  "map": "arena",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L10s06"
  ],
  "reward": {
   "xp": 114
  },
  "storyDe": "Abseits des Weges liegt Seilbrück.",
  "storyEn": "Off the road lies Seilbrück."
 },
 {
  "id": "L10s10",
  "league": 10,
  "place": "Bei den Wasserträgern",
  "col": 2,
  "row": 4,
  "map": "classic",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L10s14"
  ],
  "reward": {
   "xp": 114
  },
  "storyDe": "Ein stiller Umweg führt zu Bei den Wasserträgern.",
  "storyEn": "A quiet detour leads to Bei den Wasserträgern."
 },
 {
  "id": "L10s11",
  "league": 10,
  "place": "Gebleichte Rippen",
  "col": 5,
  "row": 4,
  "map": "arena",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L10s16"
  ],
  "reward": {
   "xp": 162
  },
  "storyDe": "Die Prüfung wartet bei Gebleichte Rippen.",
  "storyEn": "The trial waits at Gebleichte Rippen."
 },
 {
  "id": "L10s12",
  "league": 10,
  "place": "Der Singende Fels",
  "col": 3,
  "row": 4,
  "map": "courtyard",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L10s09"
  ],
  "reward": {
   "xp": 114
  },
  "storyDe": "Abseits des Weges liegt Der Singende Fels.",
  "storyEn": "Off the road lies Der Singende Fels."
 },
 {
  "id": "L10s13",
  "league": 10,
  "place": "Sandhose",
  "col": 5,
  "row": 5,
  "map": "gauntlet",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L10s11"
  ],
  "reward": {
   "xp": 159
  },
  "storyDe": "Die Prüfung wartet bei Sandhose.",
  "storyEn": "The trial waits at Sandhose."
 },
 {
  "id": "L10s14",
  "league": 10,
  "place": "Bleichgart",
  "col": 1,
  "row": 5,
  "map": "arena",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 114
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Bleichgart.",
  "storyEn": "A side path branches toward Bleichgart.",
  "boss": {
   "piece": "strategist",
   "wins": 1
  },
  "tier": 3
 },
 {
  "id": "L10s15",
  "league": 10,
  "place": "Der Fennekpfad",
  "col": 1,
  "row": 5,
  "map": "classic",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L10s20"
  ],
  "reward": {
   "xp": 105
  },
  "storyDe": "Der Weg beginnt bei Der Fennekpfad.",
  "storyEn": "The road begins at Der Fennekpfad."
 },
 {
  "id": "L10s16",
  "league": 10,
  "place": "Königsdüne",
  "col": 5,
  "row": 5,
  "map": "classic",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L10s19"
  ],
  "reward": {
   "xp": 165
  },
  "storyDe": "Der letzte Anstieg:  Königsdüne.",
  "storyEn": "The final ascent:  Königsdüne.",
  "boss": {
   "piece": "engineer",
   "wins": 2
  },
  "tier": 3
 },
 {
  "id": "L10s17",
  "league": 10,
  "place": "Sichelgrab",
  "col": 3,
  "row": 5,
  "map": "courtyard",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L10s12"
  ],
  "reward": {
   "xp": 106
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Sichelgrab.",
  "storyEn": "A side path branches toward Sichelgrab.",
  "gate": {
   "gold": 115
  },
  "tagDe": "Zollstation",
  "tagEn": "Toll station"
 },
 {
  "id": "L10s18",
  "league": 10,
  "place": "Vergessene Zisterne",
  "col": 4,
  "row": 5,
  "map": "courtyard",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L10s13"
  ],
  "reward": {
   "xp": 156
  },
  "storyDe": "Die Prüfung wartet bei Vergessene Zisterne.",
  "storyEn": "The trial waits at Vergessene Zisterne."
 },
 {
  "id": "L10s19",
  "league": 10,
  "place": "Glutspiegel",
  "col": 5,
  "row": 6,
  "map": "skirmish",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L10s26"
  ],
  "reward": {
   "xp": 168
  },
  "storyDe": "Der letzte Anstieg:  Glutspiegel.",
  "storyEn": "The final ascent:  Glutspiegel."
 },
 {
  "id": "L10s20",
  "league": 10,
  "place": "Wo der Name verweht",
  "col": 1,
  "row": 6,
  "map": "skirmish",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L10s27"
  ],
  "reward": {
   "xp": 108
  },
  "storyDe": "Der Weg beginnt bei Wo der Name verweht.",
  "storyEn": "The road begins at Wo der Name verweht."
 },
 {
  "id": "L10s21",
  "league": 10,
  "place": "Hoher Kamm",
  "col": 4,
  "row": 6,
  "map": "skirmish",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L10s18",
   "L10s22"
  ],
  "reward": {
   "xp": 153
  },
  "storyDe": "Die Prüfung wartet bei Hoher Kamm.",
  "storyEn": "The trial waits at Hoher Kamm."
 },
 {
  "id": "L10s22",
  "league": 10,
  "place": "Spiegelzinne",
  "col": 4,
  "row": 6,
  "map": "courtyard",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L10s25"
  ],
  "reward": {
   "xp": 106
  },
  "storyDe": "Ein stiller Umweg führt zu Spiegelzinne.",
  "storyEn": "A quiet detour leads to Spiegelzinne."
 },
 {
  "id": "L10s23",
  "league": 10,
  "place": "Halle des letzten Tors",
  "col": 3,
  "row": 6,
  "map": "arena",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L10s17",
   "L10s24"
  ],
  "reward": {
   "xp": 147
  },
  "storyDe": "Die Prüfung wartet bei Halle des letzten Tors.",
  "storyEn": "The trial waits at Halle des letzten Tors."
 },
 {
  "id": "L10s24",
  "league": 10,
  "place": "Vesnas Schatten",
  "col": 4,
  "row": 6,
  "map": "classic",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L10s21"
  ],
  "reward": {
   "xp": 150
  },
  "storyDe": "Die Prüfung wartet bei Vesnas Schatten.",
  "storyEn": "The trial waits at Vesnas Schatten."
 },
 {
  "id": "L10s25",
  "league": 10,
  "place": "Ausgetrocknet",
  "col": 5,
  "row": 6,
  "map": "classic",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 114,
   "gold": 72
  },
  "storyDe": "Ein stiller Umweg führt zu Ausgetrocknet.",
  "storyEn": "A quiet detour leads to Ausgetrocknet."
 },
 {
  "id": "L10s26",
  "league": 10,
  "place": "Der Kanonier am Wasser",
  "col": 5,
  "row": 6,
  "map": "courtyard",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L10s29"
  ],
  "reward": {
   "xp": 171
  },
  "storyDe": "Der letzte Anstieg:  Der Kanonier am Wasser.",
  "storyEn": "The final ascent:  Der Kanonier am Wasser."
 },
 {
  "id": "L10s27",
  "league": 10,
  "place": "Spiegelung",
  "col": 1,
  "row": 6,
  "map": "courtyard",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L10s30"
  ],
  "reward": {
   "xp": 111
  },
  "storyDe": "Der Weg beginnt bei Spiegelung.",
  "storyEn": "The road begins at Spiegelung."
 },
 {
  "id": "L10s28",
  "league": 10,
  "place": "Geierkanzel",
  "col": 3,
  "row": 7,
  "map": "gauntlet",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L10s23"
  ],
  "reward": {
   "xp": 144
  },
  "storyDe": "Die Prüfung wartet bei Geierkanzel.",
  "storyEn": "The trial waits at Geierkanzel."
 },
 {
  "id": "L10s29",
  "league": 10,
  "place": "Kamelspur",
  "col": 5,
  "row": 7,
  "map": "gauntlet",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L10s31"
  ],
  "reward": {
   "xp": 174
  },
  "storyDe": "Der letzte Anstieg:  Kamelspur.",
  "storyEn": "The final ascent:  Kamelspur."
 },
 {
  "id": "L10s30",
  "league": 10,
  "place": "Oasenmesse",
  "col": 1,
  "row": 7,
  "map": "gauntlet",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L10s33"
  ],
  "reward": {
   "xp": 114
  },
  "storyDe": "Der Weg beginnt bei Oasenmesse.",
  "storyEn": "The road begins at Oasenmesse."
 },
 {
  "id": "L10s31",
  "league": 10,
  "place": "Das Flüsternde Tor",
  "col": 5,
  "row": 7,
  "map": "arena",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L10s37"
  ],
  "reward": {
   "xp": 177
  },
  "storyDe": "Der letzte Anstieg:  Das Flüsternde Tor.",
  "storyEn": "The final ascent:  Das Flüsternde Tor."
 },
 {
  "id": "L10s32",
  "league": 10,
  "place": "Salzkruste",
  "col": 3,
  "row": 7,
  "map": "courtyard",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L10s28"
  ],
  "reward": {
   "xp": 141
  },
  "storyDe": "Die Prüfung wartet bei Salzkruste.",
  "storyEn": "The trial waits at Salzkruste."
 },
 {
  "id": "L10s33",
  "league": 10,
  "place": "Sieben Palmen",
  "col": 1,
  "row": 8,
  "map": "arena",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L10s39"
  ],
  "reward": {
   "xp": 117
  },
  "storyDe": "Der Pfad führt weiter über Sieben Palmen.",
  "storyEn": "The path leads on across Sieben Palmen."
 },
 {
  "id": "L10s34",
  "league": 10,
  "place": "Das Versandete Tor",
  "col": 3,
  "row": 8,
  "map": "skirmish",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L10s32"
  ],
  "reward": {
   "xp": 138
  },
  "storyDe": "Der Pfad führt weiter über Das Versandete Tor.",
  "storyEn": "The path leads on across Das Versandete Tor."
 },
 {
  "id": "L10s35",
  "league": 10,
  "place": "Schlangenloch",
  "col": 5,
  "row": 8,
  "map": "classic",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L10s36"
  ],
  "reward": {
   "xp": 106
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Schlangenloch.",
  "storyEn": "A side path branches toward Schlangenloch."
 },
 {
  "id": "L10s36",
  "league": 10,
  "place": "Stachelnest",
  "col": 4,
  "row": 8,
  "map": "skirmish",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L10s38"
  ],
  "reward": {
   "xp": 114
  },
  "storyDe": "Abseits des Weges liegt Stachelnest.",
  "storyEn": "Off the road lies Stachelnest."
 },
 {
  "id": "L10s37",
  "league": 10,
  "place": "Rast der Durstigen",
  "col": 5,
  "row": 8,
  "map": "classic",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L10s35",
   "L10s41"
  ],
  "reward": {
   "xp": 180
  },
  "storyDe": "Der letzte Anstieg:  Rast der Durstigen.",
  "storyEn": "The final ascent:  Rast der Durstigen."
 },
 {
  "id": "L10s38",
  "league": 10,
  "place": "Tiefbrunnen",
  "col": 4,
  "row": 8,
  "map": "gauntlet",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L10s43"
  ],
  "reward": {
   "xp": 114
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Tiefbrunnen.",
  "storyEn": "A side path branches toward Tiefbrunnen."
 },
 {
  "id": "L10s39",
  "league": 10,
  "place": "Glasfeld",
  "col": 1,
  "row": 8,
  "map": "classic",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 2,
  "next": [
   "L10s42"
  ],
  "reward": {
   "xp": 120
  },
  "storyDe": "Der Pfad führt weiter über Glasfeld.",
  "storyEn": "The path leads on across Glasfeld.",
  "boss": {
   "pure": "b05",
   "rotation": [
    "b05",
    "b24"
   ]
  },
  "tier": 3
 },
 {
  "id": "L10s40",
  "league": 10,
  "place": "Sonnenspeer",
  "col": 2,
  "row": 8,
  "map": "classic",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L10s34"
  ],
  "reward": {
   "xp": 135
  },
  "storyDe": "Der Pfad führt weiter über Sonnenspeer.",
  "storyEn": "The path leads on across Sonnenspeer."
 },
 {
  "id": "L10s41",
  "league": 10,
  "place": "Dünenwerder",
  "col": 5,
  "row": 9,
  "map": "skirmish",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L10s47"
  ],
  "reward": {
   "xp": 183
  },
  "storyDe": "Der letzte Anstieg:  Dünenwerder.",
  "storyEn": "The final ascent:  Dünenwerder."
 },
 {
  "id": "L10s42",
  "league": 10,
  "place": "Fata Morgana",
  "col": 1,
  "row": 9,
  "map": "skirmish",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L10s45"
  ],
  "reward": {
   "xp": 123
  },
  "storyDe": "Der Pfad führt weiter über Fata Morgana.",
  "storyEn": "The path leads on across Fata Morgana."
 },
 {
  "id": "L10s43",
  "league": 10,
  "place": "Namenlose Weite",
  "col": 4,
  "row": 9,
  "map": "gauntlet",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L10s46"
  ],
  "reward": {
   "xp": 114
  },
  "storyDe": "Ein stiller Umweg führt zu Namenlose Weite.",
  "storyEn": "A quiet detour leads to Namenlose Weite."
 },
 {
  "id": "L10s44",
  "league": 10,
  "place": "Dattelhain",
  "col": 2,
  "row": 9,
  "map": "arena",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L10s40"
  ],
  "reward": {
   "xp": 132
  },
  "storyDe": "Der Pfad führt weiter über Dattelhain.",
  "storyEn": "The path leads on across Dattelhain.",
  "boss": {
   "piece": "archbishop",
   "wins": 2
  },
  "tier": 3
 },
 {
  "id": "L10s45",
  "league": 10,
  "place": "Wanderdüne",
  "col": 1,
  "row": 9,
  "map": "courtyard",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L10s48"
  ],
  "reward": {
   "xp": 126
  },
  "storyDe": "Der Pfad führt weiter über Wanderdüne.",
  "storyEn": "The path leads on across Wanderdüne."
 },
 {
  "id": "L10s46",
  "league": 10,
  "place": "Sternenpfad",
  "col": 3,
  "row": 9,
  "map": "skirmish",
  "chapter": 4,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 114,
   "gold": 120
  },
  "storyDe": "Ein stiller Umweg führt zu Sternenpfad.",
  "storyEn": "A quiet detour leads to Sternenpfad."
 },
 {
  "id": "L10s47",
  "league": 10,
  "place": "Sandklause",
  "col": 5,
  "row": 9,
  "map": "courtyard",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [
   "L10s49"
  ],
  "reward": {
   "xp": 186
  },
  "storyDe": "Der letzte Anstieg:  Sandklause.",
  "storyEn": "The final ascent:  Sandklause."
 },
 {
  "id": "L10s48",
  "league": 10,
  "place": "Karawanserei",
  "col": 2,
  "row": 9,
  "map": "gauntlet",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 2,
  "next": [
   "L10s44"
  ],
  "reward": {
   "xp": 129
  },
  "storyDe": "Der Pfad führt weiter über Karawanserei.",
  "storyEn": "The path leads on across Karawanserei."
 },
 {
  "id": "L10s49",
  "league": 10,
  "place": "Palmschatten",
  "col": 5,
  "row": 10,
  "map": "gauntlet",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 2,
  "next": [],
  "reward": {
   "xp": 189,
   "gold": 60
  },
  "storyDe": "Palmschatten: Hier wartet der Meister von Kapitel X.",
  "storyEn": "Palmschatten: here waits the master of chapter X.",
  "final": true,
  "boss": {
   "pure": "b14"
  },
  "tier": 3
 },
 {
  "id": "L11s00",
  "league": 11,
  "place": "Königsklippe",
  "col": 3,
  "row": 1,
  "map": "classic",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [],
  "reward": {
   "xp": 171,
   "gold": 64
  },
  "storyDe": "Königsklippe: Hier wartet der Meister von Kapitel XI.",
  "storyEn": "Königsklippe: here waits the master of chapter XI.",
  "final": true,
  "boss": {
   "pure": "b23"
  },
  "tier": 4
 },
 {
  "id": "L11s01",
  "league": 11,
  "place": "Erste Gischt",
  "col": 0,
  "row": 1,
  "map": "classic",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 3,
  "next": [
   "L11s03"
  ],
  "reward": {
   "xp": 96
  },
  "storyDe": "Der Weg beginnt bei Erste Gischt.",
  "storyEn": "The road begins at Erste Gischt."
 },
 {
  "id": "L11s02",
  "league": 11,
  "place": "Bleicher Horizont",
  "col": 4,
  "row": 1,
  "map": "arena",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L11s00"
  ],
  "reward": {
   "xp": 168
  },
  "storyDe": "Der letzte Anstieg:  Bleicher Horizont.",
  "storyEn": "The final ascent:  Bleicher Horizont."
 },
 {
  "id": "L11s03",
  "league": 11,
  "place": "Tidenglocke",
  "col": 0,
  "row": 1,
  "map": "skirmish",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 3,
  "next": [
   "L11s05",
   "L11s08"
  ],
  "reward": {
   "xp": 99
  },
  "storyDe": "Der Weg beginnt bei Tidenglocke.",
  "storyEn": "The road begins at Tidenglocke."
 },
 {
  "id": "L11s04",
  "league": 11,
  "place": "Sturmglas",
  "col": 4,
  "row": 2,
  "map": "gauntlet",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L11s02"
  ],
  "reward": {
   "xp": 165
  },
  "storyDe": "Der letzte Anstieg:  Sturmglas.",
  "storyEn": "The final ascent:  Sturmglas."
 },
 {
  "id": "L11s05",
  "league": 11,
  "place": "Wrackaltar",
  "col": 1,
  "row": 2,
  "map": "courtyard",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 3,
  "next": [
   "L11s07"
  ],
  "reward": {
   "xp": 102
  },
  "storyDe": "Der Weg beginnt bei Wrackaltar.",
  "storyEn": "The road begins at Wrackaltar."
 },
 {
  "id": "L11s06",
  "league": 11,
  "place": "Verlassener Kai",
  "col": 4,
  "row": 2,
  "map": "courtyard",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L11s04"
  ],
  "reward": {
   "xp": 162
  },
  "storyDe": "Der letzte Anstieg:  Verlassener Kai.",
  "storyEn": "The final ascent:  Verlassener Kai."
 },
 {
  "id": "L11s07",
  "league": 11,
  "place": "Strandgutlese",
  "col": 1,
  "row": 3,
  "map": "gauntlet",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 3,
  "next": [
   "L11s10"
  ],
  "reward": {
   "xp": 105
  },
  "storyDe": "Der Weg beginnt bei Strandgutlese.",
  "storyEn": "The road begins at Strandgutlese."
 },
 {
  "id": "L11s08",
  "league": 11,
  "place": "Aschesegel",
  "col": 1,
  "row": 3,
  "map": "gauntlet",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L11s11"
  ],
  "reward": {
   "xp": 112
  },
  "storyDe": "Abseits des Weges liegt Aschesegel.",
  "storyEn": "Off the road lies Aschesegel.",
  "gate": {
   "gold": 125
  },
  "tagDe": "Zollstation",
  "tagEn": "Toll station"
 },
 {
  "id": "L11s09",
  "league": 11,
  "place": "Krähennest",
  "col": 4,
  "row": 3,
  "map": "skirmish",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L11s06"
  ],
  "reward": {
   "xp": 159
  },
  "storyDe": "Der letzte Anstieg:  Krähennest.",
  "storyEn": "The final ascent:  Krähennest."
 },
 {
  "id": "L11s10",
  "league": 11,
  "place": "Muschelscherben",
  "col": 1,
  "row": 3,
  "map": "arena",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 3,
  "next": [
   "L11s12"
  ],
  "reward": {
   "xp": 108
  },
  "storyDe": "Der Weg beginnt bei Muschelscherben.",
  "storyEn": "The road begins at Muschelscherben."
 },
 {
  "id": "L11s11",
  "league": 11,
  "place": "Osrics letztes Tor",
  "col": 1,
  "row": 3,
  "map": "skirmish",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L11s13"
  ],
  "reward": {
   "xp": 120
  },
  "storyDe": "Abseits des Weges liegt Osrics letztes Tor.",
  "storyEn": "Off the road lies Osrics letztes Tor."
 },
 {
  "id": "L11s12",
  "league": 11,
  "place": "Der Möwenstrich",
  "col": 2,
  "row": 4,
  "map": "classic",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 3,
  "next": [
   "L11s14"
  ],
  "reward": {
   "xp": 111
  },
  "storyDe": "Der Weg beginnt bei Der Möwenstrich.",
  "storyEn": "The road begins at Der Möwenstrich."
 },
 {
  "id": "L11s13",
  "league": 11,
  "place": "Wracklichter",
  "col": 1,
  "row": 4,
  "map": "gauntlet",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L11s16"
  ],
  "reward": {
   "xp": 120
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Wracklichter.",
  "storyEn": "A side path branches toward Wracklichter."
 },
 {
  "id": "L11s14",
  "league": 11,
  "place": "Wo der Riss ausblutet",
  "col": 2,
  "row": 5,
  "map": "skirmish",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 3,
  "next": [
   "L11s17"
  ],
  "reward": {
   "xp": 114
  },
  "storyDe": "Der Weg beginnt bei Wo der Riss ausblutet.",
  "storyEn": "The road begins at Wo der Riss ausblutet."
 },
 {
  "id": "L11s15",
  "league": 11,
  "place": "Das Ertrunkene Tor",
  "col": 3,
  "row": 5,
  "map": "classic",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [],
  "reward": {
   "xp": 112,
   "gold": 43
  },
  "storyDe": "Ein stiller Umweg führt zu Das Ertrunkene Tor.",
  "storyEn": "A quiet detour leads to Das Ertrunkene Tor."
 },
 {
  "id": "L11s16",
  "league": 11,
  "place": "Rast der Gestrandeten",
  "col": 1,
  "row": 5,
  "map": "skirmish",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L11s19"
  ],
  "reward": {
   "xp": 120
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Rast der Gestrandeten.",
  "storyEn": "A side path branches toward Rast der Gestrandeten."
 },
 {
  "id": "L11s17",
  "league": 11,
  "place": "Gezeitenklinge",
  "col": 3,
  "row": 5,
  "map": "courtyard",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 3,
  "next": [
   "L11s18"
  ],
  "reward": {
   "xp": 117
  },
  "storyDe": "Der Pfad führt weiter über Gezeitenklinge.",
  "storyEn": "The path leads on across Gezeitenklinge."
 },
 {
  "id": "L11s18",
  "league": 11,
  "place": "Leuchtfeuermesse",
  "col": 3,
  "row": 5,
  "map": "gauntlet",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [
   "L11s15",
   "L11s20"
  ],
  "reward": {
   "xp": 120
  },
  "storyDe": "Der Pfad führt weiter über Leuchtfeuermesse.",
  "storyEn": "The path leads on across Leuchtfeuermesse.",
  "boss": {
   "pure": "b07",
   "rotation": [
    "b07",
    "b21"
   ]
  },
  "tier": 4
 },
 {
  "id": "L11s19",
  "league": 11,
  "place": "Piersplitter",
  "col": 1,
  "row": 6,
  "map": "arena",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L11s25"
  ],
  "reward": {
   "xp": 120
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Piersplitter.",
  "storyEn": "A side path branches toward Piersplitter."
 },
 {
  "id": "L11s20",
  "league": 11,
  "place": "Kap der Fracht",
  "col": 3,
  "row": 6,
  "map": "arena",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [
   "L11s21",
   "L11s26"
  ],
  "reward": {
   "xp": 123
  },
  "storyDe": "Der Pfad führt weiter über Kap der Fracht.",
  "storyEn": "The path leads on across Kap der Fracht."
 },
 {
  "id": "L11s21",
  "league": 11,
  "place": "Kalter Sog",
  "col": 3,
  "row": 6,
  "map": "classic",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [
   "L11s27"
  ],
  "reward": {
   "xp": 126
  },
  "storyDe": "Der Pfad führt weiter über Kalter Sog.",
  "storyEn": "The path leads on across Kalter Sog."
 },
 {
  "id": "L11s22",
  "league": 11,
  "place": "Brackwasserklause",
  "col": 5,
  "row": 6,
  "map": "courtyard",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L11s24"
  ],
  "reward": {
   "xp": 120
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Brackwasserklause.",
  "storyEn": "A side path branches toward Brackwasserklause."
 },
 {
  "id": "L11s23",
  "league": 11,
  "place": "Ankerfriedhof",
  "col": 5,
  "row": 6,
  "map": "gauntlet",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L11s22"
  ],
  "reward": {
   "xp": 120
  },
  "storyDe": "Abseits des Weges liegt Ankerfriedhof.",
  "storyEn": "Off the road lies Ankerfriedhof."
 },
 {
  "id": "L11s24",
  "league": 11,
  "place": "Salzlippen",
  "col": 5,
  "row": 6,
  "map": "arena",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [],
  "reward": {
   "xp": 120,
   "gold": 128
  },
  "storyDe": "Ein stiller Umweg führt zu Salzlippen.",
  "storyEn": "A quiet detour leads to Salzlippen."
 },
 {
  "id": "L11s25",
  "league": 11,
  "place": "Flaschenpost",
  "col": 0,
  "row": 6,
  "map": "classic",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L11s45"
  ],
  "reward": {
   "xp": 120
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Flaschenpost.",
  "storyEn": "A side path branches toward Flaschenpost."
 },
 {
  "id": "L11s26",
  "league": 11,
  "place": "Perlmuttgrotte",
  "col": 3,
  "row": 6,
  "map": "skirmish",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L11s29"
  ],
  "reward": {
   "xp": 112
  },
  "storyDe": "Abseits des Weges liegt Perlmuttgrotte.",
  "storyEn": "Off the road lies Perlmuttgrotte."
 },
 {
  "id": "L11s27",
  "league": 11,
  "place": "Milchsee",
  "col": 4,
  "row": 6,
  "map": "skirmish",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [
   "L11s30"
  ],
  "reward": {
   "xp": 129
  },
  "storyDe": "Der Pfad führt weiter über Milchsee.",
  "storyEn": "The path leads on across Milchsee.",
  "boss": {
   "piece": "chancellor",
   "wins": 2
  },
  "tier": 4
 },
 {
  "id": "L11s28",
  "league": 11,
  "place": "Fährmannsruf",
  "col": 4,
  "row": 7,
  "map": "gauntlet",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L11s23"
  ],
  "reward": {
   "xp": 112
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Fährmannsruf.",
  "storyEn": "A side path branches toward Fährmannsruf."
 },
 {
  "id": "L11s29",
  "league": 11,
  "place": "Planke über Schwarz",
  "col": 3,
  "row": 7,
  "map": "arena",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L11s31"
  ],
  "reward": {
   "xp": 120
  },
  "storyDe": "Abseits des Weges liegt Planke über Schwarz.",
  "storyEn": "Off the road lies Planke über Schwarz."
 },
 {
  "id": "L11s30",
  "league": 11,
  "place": "Wogenmark",
  "col": 4,
  "row": 7,
  "map": "courtyard",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [
   "L11s28",
   "L11s32"
  ],
  "reward": {
   "xp": 132
  },
  "storyDe": "Der Pfad führt weiter über Wogenmark.",
  "storyEn": "The path leads on across Wogenmark."
 },
 {
  "id": "L11s31",
  "league": 11,
  "place": "Bei den Strandläufern",
  "col": 3,
  "row": 7,
  "map": "skirmish",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L11s34"
  ],
  "reward": {
   "xp": 120
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Bei den Strandläufern.",
  "storyEn": "A side path branches toward Bei den Strandläufern."
 },
 {
  "id": "L11s32",
  "league": 11,
  "place": "Wellenwacht",
  "col": 4,
  "row": 7,
  "map": "gauntlet",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [
   "L11s36"
  ],
  "reward": {
   "xp": 135
  },
  "storyDe": "Die Prüfung wartet bei Wellenwacht.",
  "storyEn": "The trial waits at Wellenwacht."
 },
 {
  "id": "L11s33",
  "league": 11,
  "place": "Die Stille See",
  "col": 1,
  "row": 7,
  "map": "gauntlet",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L11s37"
  ],
  "reward": {
   "xp": 120
  },
  "storyDe": "Ein stiller Umweg führt zu Die Stille See.",
  "storyEn": "A quiet detour leads to Die Stille See."
 },
 {
  "id": "L11s34",
  "league": 11,
  "place": "Seegraswiege",
  "col": 2,
  "row": 8,
  "map": "arena",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L11s35"
  ],
  "reward": {
   "xp": 120
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Seegraswiege.",
  "storyEn": "A side path branches toward Seegraswiege."
 },
 {
  "id": "L11s35",
  "league": 11,
  "place": "Ebbe und Niemand",
  "col": 2,
  "row": 8,
  "map": "classic",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [],
  "reward": {
   "xp": 120,
   "gold": 128
  },
  "storyDe": "Abseits des Weges liegt Ebbe und Niemand.",
  "storyEn": "Off the road lies Ebbe und Niemand."
 },
 {
  "id": "L11s36",
  "league": 11,
  "place": "Tangwald",
  "col": 4,
  "row": 8,
  "map": "arena",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [
   "L11s38"
  ],
  "reward": {
   "xp": 138
  },
  "storyDe": "Die Prüfung wartet bei Tangwald.",
  "storyEn": "The trial waits at Tangwald."
 },
 {
  "id": "L11s37",
  "league": 11,
  "place": "Der Leuchtturm",
  "col": 1,
  "row": 8,
  "map": "courtyard",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [],
  "reward": {
   "xp": 120,
   "gold": 128
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Der Leuchtturm.",
  "storyEn": "A side path branches toward Der Leuchtturm."
 },
 {
  "id": "L11s38",
  "league": 11,
  "place": "Gischtthron",
  "col": 4,
  "row": 8,
  "map": "classic",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [
   "L11s39"
  ],
  "reward": {
   "xp": 141
  },
  "storyDe": "Die Prüfung wartet bei Gischtthron.",
  "storyEn": "The trial waits at Gischtthron."
 },
 {
  "id": "L11s39",
  "league": 11,
  "place": "Das Berstende Gatter",
  "col": 4,
  "row": 9,
  "map": "skirmish",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [
   "L11s41"
  ],
  "reward": {
   "xp": 144
  },
  "storyDe": "Die Prüfung wartet bei Das Berstende Gatter.",
  "storyEn": "The trial waits at Das Berstende Gatter."
 },
 {
  "id": "L11s40",
  "league": 11,
  "place": "Möwenkanzel",
  "col": 5,
  "row": 9,
  "map": "gauntlet",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [
   "L11s42"
  ],
  "reward": {
   "xp": 150
  },
  "storyDe": "Die Prüfung wartet bei Möwenkanzel.",
  "storyEn": "The trial waits at Möwenkanzel."
 },
 {
  "id": "L11s41",
  "league": 11,
  "place": "Treibnetz",
  "col": 4,
  "row": 9,
  "map": "courtyard",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [
   "L11s40",
   "L11s43"
  ],
  "reward": {
   "xp": 147
  },
  "storyDe": "Die Prüfung wartet bei Treibnetz.",
  "storyEn": "The trial waits at Treibnetz."
 },
 {
  "id": "L11s42",
  "league": 11,
  "place": "Halle der herrenlosen Fracht",
  "col": 5,
  "row": 9,
  "map": "arena",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L11s44"
  ],
  "reward": {
   "xp": 153
  },
  "storyDe": "Der letzte Anstieg:  Halle der herrenlosen Fracht.",
  "storyEn": "The final ascent:  Halle der herrenlosen Fracht.",
  "boss": {
   "piece": "standard",
   "wins": 2
  },
  "tier": 4
 },
 {
  "id": "L11s43",
  "league": 11,
  "place": "Robbenbank",
  "col": 4,
  "row": 9,
  "map": "gauntlet",
  "chapter": 3,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [],
  "reward": {
   "xp": 112,
   "gold": 43
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Robbenbank.",
  "storyEn": "A side path branches toward Robbenbank."
 },
 {
  "id": "L11s44",
  "league": 11,
  "place": "Kielwasser",
  "col": 5,
  "row": 10,
  "map": "classic",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L11s09"
  ],
  "reward": {
   "xp": 156
  },
  "storyDe": "Der letzte Anstieg:  Kielwasser.",
  "storyEn": "The final ascent:  Kielwasser."
 },
 {
  "id": "L11s45",
  "league": 11,
  "place": "Tintengrund",
  "col": 1,
  "row": 7,
  "map": "classic",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L11s33"
  ],
  "reward": {
   "xp": 120
  },
  "storyDe": "Ein stiller Umweg führt zu Tintengrund.",
  "storyEn": "A quiet detour leads to Tintengrund."
 },
 {
  "id": "L12s00",
  "league": 12,
  "place": "Leuchtfeuerrest",
  "col": 0,
  "row": 5,
  "map": "classic",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [
   "L12s01"
  ],
  "reward": {
   "xp": 118
  },
  "storyDe": "Ein Seitenpfad zweigt ab nach Leuchtfeuerrest.",
  "storyEn": "A side path branches toward Leuchtfeuerrest.",
  "gate": {
   "gold": 135
  },
  "tagDe": "Zollstation",
  "tagEn": "Toll station"
 },
 {
  "id": "L12s01",
  "league": 12,
  "place": "Kap der Stille",
  "col": 1,
  "row": 8,
  "map": "skirmish",
  "chapter": 2,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [],
  "reward": {
   "xp": 126,
   "gold": 82
  },
  "storyDe": "Abseits des Weges liegt Kap der Stille.",
  "storyEn": "Off the road lies Kap der Stille."
 },
 {
  "id": "L12s02",
  "league": 12,
  "place": "Eiserne Untiefe",
  "col": 5,
  "row": 3,
  "map": "courtyard",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [],
  "reward": {
   "xp": 126,
   "gold": 82
  },
  "storyDe": "Ein stiller Umweg führt zu Eiserne Untiefe.",
  "storyEn": "A quiet detour leads to Eiserne Untiefe."
 },
 {
  "id": "L12s03",
  "league": 12,
  "place": "Wrack der Morgenröte",
  "col": 1,
  "row": 3,
  "map": "skirmish",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 3,
  "next": [
   "L12s04"
  ],
  "reward": {
   "xp": 105
  },
  "storyDe": "Der Weg beginnt bei Wrack der Morgenröte.",
  "storyEn": "The road begins at Wrack der Morgenröte."
 },
 {
  "id": "L12s04",
  "league": 12,
  "place": "Einsame Boje",
  "col": 2,
  "row": 4,
  "map": "gauntlet",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 3,
  "next": [
   "L12s05",
   "L12s00"
  ],
  "reward": {
   "xp": 111
  },
  "storyDe": "Der Pfad führt weiter über Einsame Boje.",
  "storyEn": "The path leads on across Einsame Boje.",
  "boss": {
   "pure": "b15",
   "rotation": [
    "b15",
    "b04"
   ]
  },
  "tier": 4
 },
 {
  "id": "L12s05",
  "league": 12,
  "place": "Gekentertes Glück",
  "col": 3,
  "row": 6,
  "map": "classic",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [
   "L12s06"
  ],
  "reward": {
   "xp": 117
  },
  "storyDe": "Der Pfad führt weiter über Gekentertes Glück.",
  "storyEn": "The path leads on across Gekentertes Glück."
 },
 {
  "id": "L12s06",
  "league": 12,
  "place": "Versunkener Wachtturm",
  "col": 3,
  "row": 7,
  "map": "courtyard",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [
   "L12s07"
  ],
  "reward": {
   "xp": 123
  },
  "storyDe": "Die Prüfung wartet bei Versunkener Wachtturm.",
  "storyEn": "The trial waits at Versunkener Wachtturm."
 },
 {
  "id": "L12s07",
  "league": 12,
  "place": "Krumme Klippe",
  "col": 3,
  "row": 8,
  "map": "arena",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L12s08"
  ],
  "reward": {
   "xp": 129
  },
  "storyDe": "Der letzte Anstieg:  Krumme Klippe.",
  "storyEn": "The final ascent:  Krumme Klippe."
 },
 {
  "id": "L12s08",
  "league": 12,
  "place": "Blitzfeste des Grossmeisters",
  "col": 4,
  "row": 8,
  "map": "skirmish",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [],
  "reward": {
   "xp": 135,
   "gold": 68
  },
  "storyDe": "Blitzfeste des Grossmeisters: Hier wartet der Meister von Kapitel XII.",
  "storyEn": "Blitzfeste des Grossmeisters: here waits the master of chapter XII.",
  "final": true,
  "boss": {
   "pure": "b25"
  },
  "tier": 4
 },
 {
  "id": "L12s09",
  "league": 12,
  "place": "Riff der Rippen",
  "col": 4,
  "row": 7,
  "map": "arena",
  "chapter": 2,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [
   "L12s12"
  ],
  "reward": {
   "xp": 114
  },
  "storyDe": "Der Pfad führt weiter über Riff der Rippen.",
  "storyEn": "The path leads on across Riff der Rippen."
 },
 {
  "id": "L12s10",
  "league": 12,
  "place": "Mastbruch",
  "col": 4,
  "row": 5,
  "map": "courtyard",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 3,
  "next": [
   "L12s09",
   "L12s11"
  ],
  "reward": {
   "xp": 108
  },
  "storyDe": "Der Weg beginnt bei Mastbruch.",
  "storyEn": "The road begins at Mastbruch."
 },
 {
  "id": "L12s11",
  "league": 12,
  "place": "Sturmauge",
  "col": 5,
  "row": 5,
  "map": "skirmish",
  "chapter": 1,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [
   "L12s02"
  ],
  "reward": {
   "xp": 118
  },
  "storyDe": "Ein stiller Umweg führt zu Sturmauge.",
  "storyEn": "A quiet detour leads to Sturmauge."
 },
 {
  "id": "L12s12",
  "league": 12,
  "place": "Treibholzfeld",
  "col": 5,
  "row": 8,
  "map": "skirmish",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [
   "L12s14"
  ],
  "reward": {
   "xp": 120
  },
  "storyDe": "Die Prüfung wartet bei Treibholzfeld.",
  "storyEn": "The trial waits at Treibholzfeld.",
  "boss": {
   "piece": "seeress",
   "wins": 2
  },
  "tier": 4
 },
 {
  "id": "L12s13",
  "league": 12,
  "place": "Nebelbank",
  "col": 4,
  "row": 9,
  "map": "classic",
  "chapter": 4,
  "haupt": true,
  "rules": "hp",
  "difficulty": "hard",
  "bump": 3,
  "next": [
   "L12s08"
  ],
  "reward": {
   "xp": 132
  },
  "storyDe": "Der letzte Anstieg:  Nebelbank.",
  "storyEn": "The final ascent:  Nebelbank."
 },
 {
  "id": "L12s14",
  "league": 12,
  "place": "Salzfels",
  "col": 5,
  "row": 9,
  "map": "gauntlet",
  "chapter": 3,
  "haupt": true,
  "rules": "hp",
  "difficulty": "normal",
  "bump": 3,
  "next": [
   "L12s13"
  ],
  "reward": {
   "xp": 126
  },
  "storyDe": "Die Prüfung wartet bei Salzfels.",
  "storyEn": "The trial waits at Salzfels."
 },
 {
  "id": "L12s15",
  "league": 12,
  "place": "Der letzte Steg",
  "col": 1,
  "row": 1,
  "map": "classic",
  "chapter": 1,
  "haupt": true,
  "rules": "hp",
  "difficulty": "easy",
  "bump": 3,
  "next": [
   "L12s03",
   "L12s10"
  ],
  "reward": {
   "xp": 102
  },
  "storyDe": "Der Weg beginnt bei Der letzte Steg.",
  "storyEn": "The road begins at Der letzte Steg."
 }
];
