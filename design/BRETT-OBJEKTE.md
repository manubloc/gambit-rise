# Brett-Objekte — Prompts (fünfzehn Symbole)

Mauer, Zaun, Bollwerk, Fallgrube, Bärenfalle, Graben und das Boot — jeweils in
ihren Zuständen. Sie stehen später AUF einem Schachfeld, neben den Figuren.

---

## Der Größen-Einwand: 2048 px sind vierfach zu viel

Die ursprünglichen Prompts forderten „2048x2048 or larger". Das ist gemessen
zu groß. Der Bestand im Spiel sagt es genau:

| Was | Maß im Repo | Format |
|---|---|---|
| Spielfiguren (114 Stück, `carved-*`) | **640 × 800** | WebP, RGBA, 84 % transparent |
| Gegenstände (`item-*`) | **512 × 512** | WebP, RGBA, 76 % transparent |
| Kapitelgemälde | 1920 × 1081 | Vollbild, kein Alpha |

**Die Rechnung:** Ein Schachfeld misst auf einem 412-px-Telefon rund 49 CSS-Pixel.
Bei dreifacher Pixeldichte sind das **147 echte Pixel**. Die vorhandenen Figuren
liefern 640 px Breite — bereits **gut vierfache Reserve**, genug für Tablets und
für die vergrößerte Ansicht im Hofstaat-Popup.

2048 px wären das **Sechzehnfache an Bildpunkten** gegenüber 512 — bei fünfzehn
Objekten sammelt sich das im Ladepaket, ohne dass ein Auge es je sieht.

**Deshalb gilt hier:**
- **Stehende Objekte** (Mauer, Zaun, Bollwerk): **640 × 800** — exakt das Maß
  der Spielfiguren, damit sie nebeneinander stimmig wirken
- **Flach liegende** (Trümmer, Fallgrube, Bärenfalle, Graben): **640 × 640**
- **Das Boot**: **800 × 640** quer, weil eine Figur hineingesetzt wird

## Der zweite Einwand: „transparent background" reicht nicht

GPT-Image liefert trotz dieser Anweisung fast nie einen echten Alphakanal — es
malt stattdessen ein weißes oder kariertes Feld. Die Prompts unten fordern
darum bewusst **flaches Weiß ohne Verlauf**; das Freistellen geschieht danach
im Skript (Weiß entfernen, Kanten weich halten, als WebP mit Alpha sichern).
Genau so sind die vorhandenen 114 Figuren entstanden.

---

## Die fünfzehn Prompts

> **v1.90.13 — WARUM DIE FLACHEN OBJEKTE ANDERS ENDEN.** Der gemeinsame
> Stilsatz verlangte ursprünglich „the object resting on the BOTTOM edge of
> the frame". Das ist richtig für die STEHENDEN Objekte (Mauer, Zaun,
> Bollwerk) — sie stehen auf dem Feldboden wie eine Figur. Für die FLACH
> LIEGENDEN (Trümmer, Fallgrube, Graben, Bärenfalle) widerspricht er dem
> ersten Satz des Prompts („lying flat on the square"), und das Bild landet
> am unteren Rand. `tools/pruefe-sperrsitz.mjs` würde so ein Bild als
> „sitzt zu tief" melden — genau die Zusage des Besitzers vom 29.9.:
> flache Sperren sitzen vertikal mittig. Deshalb tragen die flachen Prompts
> jetzt „centred BOTH horizontally and vertically".


### Mauer · heil · `mauer-heil`

**Zielmaß: 640 x 800 (portrait)**

```
Seen straight from the front at a slight downward angle, standing upright like a chess piece. A short section of fortification wall sized to fill one chess square: three courses of stacked stone blocks in cool grey with warm brown undertones (#6b6258, #4a453e, #8a7f70), a crenellated top edge with three merlons, mortar lines carved as grooves, a low warm wood beam (#a06020) framing the base. Solid, heavy, intact.

Hand-carved painted folk-art style matching a carved wooden chess set. Visible chisel facets, soft rounded edges, matte hand-painted surface, small honest imperfections. Soft warm light from the UPPER LEFT, soft shadow falling to the lower right, no cast shadow on the ground. Fully isolated on a PLAIN FLAT WHITE background with no gradient and no shadow touching the edges, centred horizontally, the object resting on the BOTTOM edge of the frame. No scene, no ground plane, no base plate, no text, no border. Painted illustration, matte, not photographic, not a 3D render.
```

### Mauer · angeschlagen · `mauer-schaden`

**Zielmaß: 640 x 800 (portrait)**

```
Seen straight from the front at a slight downward angle, standing upright like a chess piece. The SAME short fortification wall, now damaged: one merlon broken off, a deep crack running down the left face, two stones loosened and sitting askew, a scatter of small rubble at the foot. Still standing and clearly solid, but wounded. Same cool grey stone (#6b6258, #4a453e, #8a7f70) and warm wood base beam (#a06020).

Hand-carved painted folk-art style matching a carved wooden chess set. Visible chisel facets, soft rounded edges, matte hand-painted surface, small honest imperfections. Soft warm light from the UPPER LEFT, soft shadow falling to the lower right, no cast shadow on the ground. Fully isolated on a PLAIN FLAT WHITE background with no gradient and no shadow touching the edges, centred horizontally, the object resting on the BOTTOM edge of the frame. No scene, no ground plane, no base plate, no text, no border. Painted illustration, matte, not photographic, not a 3D render.
```

### Mauer · Trümmer · `mauer-truemmer`

**Zielmaß: 640 x 640 (square)**

```
Seen from a steep angle looking down, lying flat on the square, no upright parts taller than a chess pawn's base. The remains of a broken stone wall: a low heap of tumbled grey blocks (#6b6258, #4a453e) with broken edges, dust and small chips scattered around, one splintered wood beam (#a06020) lying across the pile. Nothing standing taller than a hand's width. Ruined, cleared, passable.

Hand-carved painted folk-art style matching a carved wooden chess set. Visible chisel facets, soft rounded edges, matte hand-painted surface, small honest imperfections. Soft warm light from the UPPER LEFT, soft shadow falling to the lower right, no cast shadow on the ground. Fully isolated on a PLAIN FLAT WHITE background with no gradient and no shadow touching the edges, centred BOTH horizontally and vertically in the frame with even margins on all four sides. No scene, no ground plane, no base plate, no text, no border. Painted illustration, matte, not photographic, not a 3D render.
```

### Zaun · heil · `zaun-heil`

**Zielmaß: 640 x 800 (portrait)**

```
Seen straight from the front at a slight downward angle, standing upright like a chess piece. A short palisade fence sized to fill one chess square: six sharpened stakes of warm honey wood (#a06020, #804000) of slightly uneven height, bound with two horizontal rails and dark twisted rope, wood grain carved as fine grooves, muted forest green moss (#204000) at the very base. Sturdy and intact.

Hand-carved painted folk-art style matching a carved wooden chess set. Visible chisel facets, soft rounded edges, matte hand-painted surface, small honest imperfections. Soft warm light from the UPPER LEFT, soft shadow falling to the lower right, no cast shadow on the ground. Fully isolated on a PLAIN FLAT WHITE background with no gradient and no shadow touching the edges, centred horizontally, the object resting on the BOTTOM edge of the frame. No scene, no ground plane, no base plate, no text, no border. Painted illustration, matte, not photographic, not a 3D render.
```

### Zaun · angeschlagen · `zaun-schaden`

**Zielmaß: 640 x 800 (portrait)**

```
Seen straight from the front at a slight downward angle, standing upright like a chess piece. The SAME palisade fence, now damaged: two stakes snapped off at mid height with splintered tops, one rail hanging loose from its rope binding, the whole fence leaning slightly to the right. Same warm honey wood (#a06020, #804000) and muted green moss (#204000). Still standing but clearly about to fail.

Hand-carved painted folk-art style matching a carved wooden chess set. Visible chisel facets, soft rounded edges, matte hand-painted surface, small honest imperfections. Soft warm light from the UPPER LEFT, soft shadow falling to the lower right, no cast shadow on the ground. Fully isolated on a PLAIN FLAT WHITE background with no gradient and no shadow touching the edges, centred horizontally, the object resting on the BOTTOM edge of the frame. No scene, no ground plane, no base plate, no text, no border. Painted illustration, matte, not photographic, not a 3D render.
```

### Zaun · Trümmer · `zaun-truemmer`

**Zielmaß: 640 x 640 (square)**

```
Seen from a steep angle looking down, lying flat on the square, no upright parts taller than a chess pawn's base. The remains of a broken palisade: three snapped wooden stakes (#a06020, #804000) lying crossed on the ground with splintered ends, a length of dark rope coiled loose, wood chips scattered. Nothing upright.

Hand-carved painted folk-art style matching a carved wooden chess set. Visible chisel facets, soft rounded edges, matte hand-painted surface, small honest imperfections. Soft warm light from the UPPER LEFT, soft shadow falling to the lower right, no cast shadow on the ground. Fully isolated on a PLAIN FLAT WHITE background with no gradient and no shadow touching the edges, centred BOTH horizontally and vertically in the frame with even margins on all four sides. No scene, no ground plane, no base plate, no text, no border. Painted illustration, matte, not photographic, not a 3D render.
```

### Bollwerk · heil · `bollwerk-heil`

**Zielmaß: 640 x 800 (portrait)**

```
Seen straight from the front at a slight downward angle, standing upright like a chess piece. A massive fortified bulwark sized to fill one chess square, clearly heavier than a plain wall: four courses of large squared stone blocks in cool grey with warm brown undertones (#6b6258, #4a453e, #8a7f70), a crenellated top with four merlons, an arrow slit in the centre, iron-banded warm wood beams (#a06020) bracing the base. Solid, imposing, intact.

Hand-carved painted folk-art style matching a carved wooden chess set. Visible chisel facets, soft rounded edges, matte hand-painted surface, small honest imperfections. Soft warm light from the UPPER LEFT, soft shadow falling to the lower right, no cast shadow on the ground. Fully isolated on a PLAIN FLAT WHITE background with no gradient and no shadow touching the edges, centred horizontally, the object resting on the BOTTOM edge of the frame. No scene, no ground plane, no base plate, no text, no border. Painted illustration, matte, not photographic, not a 3D render.
```

### Bollwerk · angeschlagen · `bollwerk-schaden`

**Zielmaß: 640 x 800 (portrait)**

```
Seen straight from the front at a slight downward angle, standing upright like a chess piece. The SAME massive bulwark, now battered: two merlons shattered, a wide crack splitting the upper courses, one large block pushed out of line, the arrow slit chipped, rubble gathered at the foot. Still standing and clearly formidable. Same cool grey stone (#6b6258, #4a453e, #8a7f70) and iron-banded wood beams (#a06020).

Hand-carved painted folk-art style matching a carved wooden chess set. Visible chisel facets, soft rounded edges, matte hand-painted surface, small honest imperfections. Soft warm light from the UPPER LEFT, soft shadow falling to the lower right, no cast shadow on the ground. Fully isolated on a PLAIN FLAT WHITE background with no gradient and no shadow touching the edges, centred horizontally, the object resting on the BOTTOM edge of the frame. No scene, no ground plane, no base plate, no text, no border. Painted illustration, matte, not photographic, not a 3D render.
```

### Fallgrube · verdeckt · `falle-verdeckt`

**Zielmaß: 640 x 640 (square)**

```
Seen from a steep angle looking down, lying flat on the square, no upright parts taller than a chess pawn's base. A concealed pit trap covering one chess square: a shallow rectangular pit spanned by thin crossed branches and scattered dry leaves in muted brown and forest green (#804000, #204000, #406020), just a hint of darkness showing between the twigs. Deliberately subtle and easy to overlook - it must read as ordinary ground at a glance.

Hand-carved painted folk-art style matching a carved wooden chess set. Visible chisel facets, soft rounded edges, matte hand-painted surface, small honest imperfections. Soft warm light from the UPPER LEFT, soft shadow falling to the lower right, no cast shadow on the ground. Fully isolated on a PLAIN FLAT WHITE background with no gradient and no shadow touching the edges, centred BOTH horizontally and vertically in the frame with even margins on all four sides. No scene, no ground plane, no base plate, no text, no border. Painted illustration, matte, not photographic, not a 3D render.
```

### Fallgrube · ausgelöst · `falle-ausgeloest`

**Zielmaß: 640 x 640 (square)**

```
Seen from a steep angle looking down, lying flat on the square, no upright parts taller than a chess pawn's base. A sprung pit trap covering one chess square: the covering branches snapped inward and hanging into the hole, a dark open pit beneath with sharpened wooden stakes at the bottom, torn leaves and loose earth flung around the rim. Warm brown earth tones (#804000, #6b4a20) and deep shadow inside the pit.

Hand-carved painted folk-art style matching a carved wooden chess set. Visible chisel facets, soft rounded edges, matte hand-painted surface, small honest imperfections. Soft warm light from the UPPER LEFT, soft shadow falling to the lower right, no cast shadow on the ground. Fully isolated on a PLAIN FLAT WHITE background with no gradient and no shadow touching the edges, centred BOTH horizontally and vertically in the frame with even margins on all four sides. No scene, no ground plane, no base plate, no text, no border. Painted illustration, matte, not photographic, not a 3D render.
```

### Graben · heil · `graben-heil`

**Zielmaß: 640 x 640 (square)**

```
Seen from a steep angle looking down, lying flat on the square, no upright parts taller than a chess pawn's base. A narrow defensive ditch cutting straight across one chess square: dug earth with steep sides in warm brown (#804000, #6b4a20), a small heap of excavated soil along the near edge, a few tufts of muted green grass (#204000) on the rims, dark shadow in the trench.

Hand-carved painted folk-art style matching a carved wooden chess set. Visible chisel facets, soft rounded edges, matte hand-painted surface, small honest imperfections. Soft warm light from the UPPER LEFT, soft shadow falling to the lower right, no cast shadow on the ground. Fully isolated on a PLAIN FLAT WHITE background with no gradient and no shadow touching the edges, centred BOTH horizontally and vertically in the frame with even margins on all four sides. No scene, no ground plane, no base plate, no text, no border. Painted illustration, matte, not photographic, not a 3D render.
```

### Graben · überbrückt · `graben-bruecke`

**Zielmaß: 640 x 640 (square)**

```
Seen from a steep angle looking down, lying flat on the square, no upright parts taller than a chess pawn's base. The SAME narrow ditch, now crossed by a makeshift plank bridge: two rough boards of warm honey wood (#a06020) laid over the trench and lashed with dark rope, the dug earth (#804000, #6b4a20) and green grass tufts (#204000) unchanged. Passable.

Hand-carved painted folk-art style matching a carved wooden chess set. Visible chisel facets, soft rounded edges, matte hand-painted surface, small honest imperfections. Soft warm light from the UPPER LEFT, soft shadow falling to the lower right, no cast shadow on the ground. Fully isolated on a PLAIN FLAT WHITE background with no gradient and no shadow touching the edges, centred BOTH horizontally and vertically in the frame with even margins on all four sides. No scene, no ground plane, no base plate, no text, no border. Painted illustration, matte, not photographic, not a 3D render.
```

### Bärenfalle · verdeckt · `baerenfalle-verdeckt`

**Zielmaß: 640 x 640 (square)**

```
Seen from a steep angle looking down, lying flat on the square, no upright parts taller than a chess pawn's base. A concealed iron bear trap covering one chess square: dark iron jaws with blunt teeth held open in a ring, the mechanism mostly buried under scattered dry leaves and loose earth in muted brown and forest green (#804000, #204000, #406020), only a hint of dark metal showing through. Deliberately subtle - it must read as ordinary ground at a glance.

Hand-carved painted folk-art style matching a carved wooden chess set. Visible chisel facets, soft rounded edges, matte hand-painted surface, small honest imperfections. Soft warm light from the UPPER LEFT, soft shadow falling to the lower right, no cast shadow on the ground. Fully isolated on a PLAIN FLAT WHITE background with no gradient and no shadow touching the edges, centred BOTH horizontally and vertically in the frame with even margins on all four sides. No scene, no ground plane, no base plate, no text, no border. Painted illustration, matte, not photographic, not a 3D render.
```

### Bärenfalle · zugeschnappt · `baerenfalle-zu`

**Zielmaß: 640 x 640 (square)**

```
Seen from a steep angle looking down, lying flat on the square, no upright parts taller than a chess pawn's base. The SAME iron bear trap, now sprung: the dark iron jaws snapped shut in a tight closed ring, a short chain trailing to one side, leaves and earth flung outward around it, the ground scuffed where something struggled. Muted brown and forest green surroundings (#804000, #204000, #406020).

Hand-carved painted folk-art style matching a carved wooden chess set. Visible chisel facets, soft rounded edges, matte hand-painted surface, small honest imperfections. Soft warm light from the UPPER LEFT, soft shadow falling to the lower right, no cast shadow on the ground. Fully isolated on a PLAIN FLAT WHITE background with no gradient and no shadow touching the edges, centred BOTH horizontally and vertically in the frame with even margins on all four sides. No scene, no ground plane, no base plate, no text, no border. Painted illustration, matte, not photographic, not a 3D render.
```

### Das Boot · `boot`

**Zielmaß: 800 x 640 (landscape)**

```
Seen from slightly above and straight from the front. A single small carved wooden rowboat, seen from slightly above and straight from the front, the bow pointing toward the viewer, so the open hull forms a wide shallow cradle. Warm honey and walnut wood tones (#a06020, #804000) for the hull planks, muted forest green (#204000, #406020) for the painted trim and inner boards. The MIDDLE OF THE BOAT IS COMPLETELY EMPTY - no figure, no oars crossing the centre, no mast, no sail - leaving a clear open seat where a small carved figure can later be placed. The gunwales rise on the left and right like low arms, one pair of oars resting flat along the outer sides.

Hand-carved painted folk-art style matching a carved wooden chess set. Visible chisel facets, soft rounded edges, matte hand-painted surface, small honest imperfections. Soft warm light from the UPPER LEFT, soft shadow falling to the lower right, no cast shadow on the ground. Fully isolated on a PLAIN FLAT WHITE background with no gradient and no shadow touching the edges, centred horizontally, the object resting on the BOTTOM edge of the frame. No scene, no ground plane, no base plate, no text, no border. Painted illustration, matte, not photographic, not a 3D render.
```

---

## Danach

1. Freistellen: Weiß entfernen, Alpha weich auslaufen lassen
2. Als WebP q82 mit Alpha sichern, Ziel unter 60 KB je Objekt
3. Ablegen neben den Figuren in `src/app/ui/assets/`
4. **Wichtig:** neue Dateitypen brauchen im esbuild-Skript einen eigenen
   `--loader`-Eintrag, sonst schlägt die Rauchprobe still fehl
