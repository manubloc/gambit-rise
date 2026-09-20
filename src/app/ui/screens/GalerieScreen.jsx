// ── DIE MUSTERKAMMER ────────────────────────────────────────────────────────
// Interne Designsystem-Galerie (Auftrag §17): jede Grundkomponente in jedem
// Zustand auf einer Seite, samt Farben, Schriftrollen, Abstandsleiter und
// langen deutschen Texten. Erreichbar NUR ueber ?galerie in der Adresse -
// kein Spieler stolpert hinein, kein Menuepunkt, kein Bundle-Umweg.
import { useState } from "react";
import { T, SPACING } from "../theme.js";
import { Button, Panel, PanelTitle, FieldLabel, MapChip, Bar, Chip, Segmented, Stat, Toggle } from "../primitives.jsx";
import { GildedFrame, GoldShineButton, GoldRule, goldText } from "../Gilded.jsx";


const H = ({ children }) => <div className="gg-display" style={{ fontSize: 19, color: T.gold, letterSpacing: ".04em", margin: "26px 0 10px" }}>{children}</div>;
const Reihe = ({ children }) => <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>{children}</div>;
const Farbe = ({ name, wert }) => (
  <div style={{ display: "grid", gap: 4, justifyItems: "center", fontSize: 10.5, color: T.dim }}>
    <span style={{ width: 46, height: 34, borderRadius: 8, background: wert, border: `1px solid ${T.line}` }} />
    {name}
  </div>
);
const LANG = "Außergewöhnlich lange deutsche Beschriftungsprobe für Schaltflächen und Auswahlfelder";

export function GalerieScreen() {
  const [seg, setSeg] = useState("b");
  const [an, setAn] = useState(true);
  const [chip, setChip] = useState(true);
  return (
    <div className="gg-thinbar" style={{ maxWidth: 560, margin: "0 auto", padding: "20px 14px 60px", height: "100dvh", overflowY: "auto", color: T.text }}>
      <div className="gg-display" style={{ fontSize: 24, ...goldText }}>MUSTERKAMMER</div>
      <div style={{ fontSize: 12.5, color: T.dim, marginTop: 4 }}>Designsystem 1.0 · alle Bauteile, alle Zustände · nur über <code>?galerie</code></div>

      <H>Farben & Stimmen</H>
      <Reihe>
        {[["bg", T.bg], ["bg2", T.bg2], ["panel", T.panel], ["panel2", T.panel2], ["line", T.line],
          ["text", T.text], ["dim", T.dim], ["faint", T.faint],
          ["gold", T.gold], ["lime", T.lime], ["sel", T.sel], ["selLine", T.selLine], ["rift", T.rift],
          ["danger", T.danger], ["warn", T.warn], ["info", T.info], ["green", T.green]].map(([n, w]) => <Farbe key={n} name={n} wert={w} />)}
      </Reihe>

      <H>Schriftrollen</H>
      <div className="gg-display" style={{ fontSize: 21, color: T.gold }}>Display · Cinzel — GRAND GAMBIT</div>
      <div className="gg-serif" style={{ fontSize: 15.5, color: T.goldBright, letterSpacing: ".07em", marginTop: 6 }}>Serif · Georgia — Panel-Titel und Zierzeilen</div>
      <div className="gg-quill" style={{ fontSize: 17, marginTop: 6 }}>Erzählstimme · Cormorant — „Der Riss gibt nie zurück, was man ihm gab."</div>
      <div style={{ fontSize: 13.5, marginTop: 6 }}>Funktional · System-Sans — Zahlen 0123456789, Labels, {LANG}.</div>

      <H>Knöpfe (Gold = Handlung)</H>
      <Reihe>
        <GoldShineButton onClick={() => {}}>Primär · Glanzlauf</GoldShineButton>
        <GoldShineButton disabled>Primär · aus</GoldShineButton>
        <Button variant="rift">Riss</Button>
        <Button variant="subtle">Ruhig</Button>
        <Button variant="ghost">Geist</Button>
        <Button variant="danger">Gefahr</Button>
        <Button variant="subtle" disabled>Deaktiviert</Button>
      </Reihe>

      <H>Auswahl (Violett = gewählt)</H>
      <Segmented value={seg} onChange={setSeg} options={[
        { value: "a", label: "Klassisch" }, { value: "b", label: "HP-Gefecht" },
        { value: "c", label: "Scharmützel · 6×6 · langer Name" }, { value: "d", label: "Gesperrt", disabled: true }]} />
      <div style={{ height: 10 }} />
      <Reihe>
        <MapChip on={chip} onClick={() => setChip(true)} label="Klassik · 8×8" theme={{ sqLight: T.sqLight, sqDark: T.sqDark }} />
        <MapChip on={!chip} onClick={() => setChip(false)} label="Arena · 10×10" theme={{ sqLight: T.sqLight, sqDark: T.sqDark }} />
        <MapChip on={false} locked label="Gesperrt" theme={{ sqLight: T.sqLight, sqDark: T.sqDark }} />
      </Reihe>

      <H>Tafeln</H>
      <Panel><PanelTitle tag="Tag">Standardtafel</PanelTitle>
        <div style={{ fontSize: 12.5, color: T.dim, marginTop: 6 }}>PANEL_WASH, eine dünne Linie, Radius {T.radius}. {LANG}.</div>
        <div style={{ marginTop: 10 }}><FieldLabel>Feldbeschriftung</FieldLabel>
          <Bar pct={0.62} color={T.gold} /></div>
      </Panel>
      <div style={{ height: 10 }} />
      <GildedFrame corners><div className="gg-serif" style={{ color: T.goldBright, letterSpacing: ".06em" }}>Hero-Tafel (Gilded) — sparsam einsetzen</div>
        <GoldRule /><div style={{ fontSize: 12.5, color: T.dim }}>Goldrahmen nur für Belohnung, Marke, große Momente.</div></GildedFrame>

      <H>Marken & Status</H>
      <Reihe>
        <Chip color={T.limeInk} bg={T.gold}>Belohnung</Chip>
        <Chip color={T.selInk} bg={T.sel} style={{ border: `1px solid ${T.selLine}` }}>Gewählt</Chip>
        <Chip color={T.danger}>Gefahr</Chip>
        <Chip color={T.warn}>Warnung</Chip>
        <Chip color={T.info}>Hinweis</Chip>
        <Chip color={T.faint}>offline</Chip>
        <Stat label="Wert" value="4,8:1" color={T.gold} />
      </Reihe>

      <H>Kugeln: Leben & Energie</H>
      <Reihe>
        {/* v1.25.4: die Schaukammer zeigt keine Perlen mehr - sie sind aus
            dem Spiel genommen (Besitzer: "die koennen raus, egal wo"). Die
            Zahlensprache steht jetzt im Sockelband, und das hat seine eigene
            Reihe weiter unten. */}
      </Reihe>

      <H>Schalter</H>
      <Reihe>
        <Toggle on={an} onChange={setAn} label={an ? "An" : "Aus"} />
        <Toggle on={false} onChange={() => {}} label="Aus" disabled />
      </Reihe>

      <H>Eingaben</H>
      <Reihe>
        <input placeholder="Standard" style={{ padding: "11px 12px", minHeight: T.touch }} />
        <input placeholder="Fokus antippen" style={{ padding: "11px 12px", minHeight: T.touch }} />
        <input disabled placeholder="Deaktiviert" style={{ padding: "11px 12px", minHeight: T.touch, opacity: T.disOpacity }} />
      </Reihe>

      <H>Abstandsleiter</H>
      <Reihe>{SPACING.map((n) => <div key={n} style={{ width: n, height: 18, background: T.rift, borderRadius: 3, opacity: 0.75 }} title={String(n)} />)}</Reihe>
      <div style={{ fontSize: 11, color: T.faint, marginTop: 4 }}>{SPACING.join(" · ")}</div>
    </div>
  );
}
