/* ── DIE FORMEN UND METALLE DER STUFEN-ABZEICHEN (v1.21.0) ────────────────────
   Erzeugt aus dem abgestimmten Vorschlag (badge-vorschlag-6.html). Vier
   Formen (Medaillon, Schild, Banner, Siegel), drei Metalle (Bronze, Silber,
   Gold) mit je eigenem Zierat, Lorbeer auf der Hoechststufe. Wird EINMAL
   unsichtbar in den Hofstaat gehaengt; jedes Abzeichen greift per <use>. */
export const ABZEICHEN_DEFS = `
 <linearGradient id="sa-gold" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="#fff8d6"/><stop offset=".14" stop-color="#f7d97e"/><stop offset=".3" stop-color="#b8862f"/><stop offset=".44" stop-color="#8a6524"/><stop offset=".56" stop-color="#f1cf6a"/><stop offset=".68" stop-color="#c79a3f"/><stop offset=".84" stop-color="#e8c25f"/><stop offset="1" stop-color="#4e3410"/></linearGradient>
 <linearGradient id="sa-bronze" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="#f1c79b"/><stop offset=".18" stop-color="#c8834a"/><stop offset=".34" stop-color="#8a4e1f"/><stop offset=".5" stop-color="#6a3c16"/><stop offset=".66" stop-color="#b8773f"/><stop offset=".8" stop-color="#9b6534"/><stop offset="1" stop-color="#3a1d08"/></linearGradient>
 <linearGradient id="sa-bronzeDunkel" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="#8a5228"/><stop offset=".5" stop-color="#3a1f0a"/><stop offset="1" stop-color="#6e4020"/></linearGradient>
 <linearGradient id="sa-silber" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".18" stop-color="#d5dae2"/><stop offset=".34" stop-color="#8b93a0"/><stop offset=".5" stop-color="#6f7784"/><stop offset=".66" stop-color="#c3c9d3"/><stop offset=".8" stop-color="#a7aeb9"/><stop offset="1" stop-color="#3f4652"/></linearGradient>
 <linearGradient id="sa-silberDunkel" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="#9aa2ae"/><stop offset=".5" stop-color="#3a404a"/><stop offset="1" stop-color="#7a8290"/></linearGradient>
 <linearGradient id="sa-goldDunkel" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="#a87d33"/><stop offset=".5" stop-color="#4b3210"/><stop offset="1" stop-color="#8a6626"/></linearGradient>
 <linearGradient id="sa-kanteHell" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6d6" stop-opacity=".95"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <linearGradient id="sa-kanteDunkel" x1="0" y1="0" x2="1" y2="1"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#1a0f00" stop-opacity=".9"/></linearGradient>
 <radialGradient id="sa-emaille" cx=".5" cy=".5" r=".55"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient>
 <linearGradient id="sa-beize" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity=".02"/><stop offset=".5" stop-color="#000" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".32"/></linearGradient>
 <linearGradient id="sa-glanzpunkt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".55" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <filter id="sa-maser" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".035 .5" numOctaves="3" seed="7"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .34"/></feComponentTransfer><feComposite in2="SourceGraphic" operator="in"/></filter>
 <filter id="sa-patina" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".12" numOctaves="3" seed="11"/><feColorMatrix type="matrix" values="0 0 0 0 .12  0 0 0 0 .09  0 0 0 0 .04  0 0 0 .8 -.25"/><feComposite in2="SourceGraphic" operator="in"/></filter>
 <filter id="sa-korn" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .22"/></feComponentTransfer><feComposite in2="SourceGraphic" operator="in"/></filter>
 <filter id="sa-wurf" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="2.2" stdDeviation="1.8" flood-color="#000" flood-opacity=".75"/><feDropShadow dx="0" dy=".6" stdDeviation=".4" flood-color="#000" flood-opacity=".5"/></filter>
 <filter id="sa-innen" x="-20%" y="-20%" width="140%" height="140%"><feOffset dx="0" dy="1.4" in="SourceAlpha" result="o"/><feGaussianBlur in="o" stdDeviation="1.2" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
 <filter id="sa-gravur" x="-20%" y="-20%" width="140%" height="140%">
  <feMorphology in="SourceAlpha" operator="dilate" radius="1.1" result="d"/><feFlood flood-color="#1a1006" flood-opacity=".92" result="df"/><feComposite in="df" in2="d" operator="in" result="rand"/>
  <feOffset in="d" dx="0" dy="1.4" result="u"/><feFlood flood-color="#000" flood-opacity=".7" result="uf"/><feComposite in="uf" in2="u" operator="in" result="unten"/>
  <feOffset in="SourceAlpha" dx="0" dy="-.6" result="ob"/><feFlood flood-color="#fff" flood-opacity=".5" result="of"/><feComposite in="of" in2="ob" operator="in" result="oben"/>
  <feMerge><feMergeNode in="unten"/><feMergeNode in="rand"/><feMergeNode in="SourceGraphic"/><feMergeNode in="oben"/></feMerge></filter>
 <linearGradient id="sa-elfenbein" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe8"/><stop offset=".55" stop-color="#f1e3bd"/><stop offset="1" stop-color="#c9b27c"/></linearGradient>

 <!-- ZIERAT je Metall: Bronze Hammerschlag, Silber gravierte Doppellinie, Gold Filigran mit vier Steinen -->
 <symbol id="sa-zier-bronze" viewBox="0 0 64 64"><g fill="#000" fill-opacity=".22"><circle cx="32" cy="12.2" r="1.1"/><circle cx="51.8" cy="32" r="1.1"/><circle cx="32" cy="51.8" r="1.1"/><circle cx="12.2" cy="32" r="1.1"/><circle cx="46" cy="18" r=".9"/><circle cx="46" cy="46" r=".9"/><circle cx="18" cy="46" r=".9"/><circle cx="18" cy="18" r=".9"/></g><g fill="#fff" fill-opacity=".22"><circle cx="32" cy="11.4" r=".8"/><circle cx="52.6" cy="32" r=".8"/><circle cx="32" cy="51" r=".8"/><circle cx="11.4" cy="32" r=".8"/></g></symbol>
 <symbol id="sa-zier-silber" viewBox="0 0 64 64"><circle cx="32" cy="32" r="20.2" fill="none" stroke="#000" stroke-opacity=".32" stroke-width=".7"/><circle cx="32" cy="32" r="20.2" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width=".5" stroke-dasharray="6 2"/><circle cx="32" cy="32" r="18.3" fill="none" stroke="#000" stroke-opacity=".25" stroke-width=".5"/></symbol>
 <symbol id="sa-zier-gold" viewBox="0 0 64 64"><g fill="none" stroke="#5a3d10" stroke-opacity=".7" stroke-width=".55"><path d="M26 11.4c2 1.6 4 1.6 6 0 2 1.6 4 1.6 6 0"/><path d="M26 52.6c2-1.6 4-1.6 6 0 2-1.6 4-1.6 6 0"/><path d="M11.4 26c1.6 2 1.6 4 0 6 1.6 2 1.6 4 0 6"/><path d="M52.6 26c-1.6 2-1.6 4 0 6-1.6 2-1.6 4 0 6"/></g><g fill="none" stroke="#fff6d6" stroke-opacity=".55" stroke-width=".4"><path d="M26 10.8c2 1.6 4 1.6 6 0 2 1.6 4 1.6 6 0"/><path d="M26 52c2-1.6 4-1.6 6 0 2-1.6 4-1.6 6 0"/></g><g><circle cx="46.2" cy="17.8" r="1.5" fill="#c1121f"/><circle cx="46.2" cy="17.8" r="1.5" fill="url(#sa-glanzpunkt)"/><circle cx="17.8" cy="17.8" r="1.5" fill="#1f5fbf"/><circle cx="17.8" cy="17.8" r="1.5" fill="url(#sa-glanzpunkt)"/><circle cx="17.8" cy="46.2" r="1.5" fill="#1f8a3c"/><circle cx="17.8" cy="46.2" r="1.5" fill="url(#sa-glanzpunkt)"/><circle cx="46.2" cy="46.2" r="1.5" fill="#c1121f"/><circle cx="46.2" cy="46.2" r="1.5" fill="url(#sa-glanzpunkt)"/></g><g fill="#fff" fill-opacity=".9"><path d="M14 20l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z"/><path d="M50 43l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z"/></g></symbol>
 <symbol id="sa-zier-gold-schild" viewBox="0 0 64 64"><g><circle cx="16.5" cy="14" r="1.6" fill="#c1121f"/><circle cx="16.5" cy="14" r="1.6" fill="url(#sa-glanzpunkt)"/><circle cx="47.5" cy="14" r="1.6" fill="#1f5fbf"/><circle cx="47.5" cy="14" r="1.6" fill="url(#sa-glanzpunkt)"/><circle cx="32" cy="55.5" r="1.4" fill="#1f8a3c"/><circle cx="32" cy="55.5" r="1.4" fill="url(#sa-glanzpunkt)"/></g><g fill="#fff" fill-opacity=".9"><path d="M13 22l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z"/><path d="M50 40l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z"/></g></symbol>
 <symbol id="sa-zier-gold-siegel" viewBox="0 0 64 64"><g><circle cx="32" cy="8.5" r="1.5" fill="#c1121f"/><circle cx="32" cy="8.5" r="1.5" fill="url(#sa-glanzpunkt)"/><circle cx="55.5" cy="32" r="1.5" fill="#1f5fbf"/><circle cx="55.5" cy="32" r="1.5" fill="url(#sa-glanzpunkt)"/><circle cx="32" cy="55.5" r="1.5" fill="#1f8a3c"/><circle cx="32" cy="55.5" r="1.5" fill="url(#sa-glanzpunkt)"/><circle cx="8.5" cy="32" r="1.5" fill="#c1121f"/><circle cx="8.5" cy="32" r="1.5" fill="url(#sa-glanzpunkt)"/></g><g fill="#fff" fill-opacity=".9"><path d="M14 20l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z"/><path d="M50 43l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z"/></g></symbol>
 <symbol id="sa-medaillon" viewBox="0 0 64 64">
  <g filter="url(#sa-wurf)">
   <g id="sa-lorbeerL" class="lorbeer" style="opacity:var(--lorbeer,0)"><path d="M12 45c-5-6-6-16-1-23" fill="none" stroke="var(--md,url(#sa-goldDunkel))" stroke-width="2.6" stroke-linecap="round"/>
    <g fill="var(--m,url(#sa-gold))" stroke="#5a3d10" stroke-width=".35">
     <path d="M10 22c3 0 5 3 4 6-3 0-5-3-4-6z"/><path d="M7.5 29c3 .5 4.5 4 3 7-3-.5-4.5-4-3-7z"/><path d="M8 36.5c3 1 4 5 2 7.5-3-1-4-5-2-7.5z"/><path d="M11 43c3 1.5 3 5.5 1 7.5-3-1.5-3-5.5-1-7.5z"/>
    </g></g>
   <use href="#sa-lorbeerL" class="lorbeer" style="opacity:var(--lorbeer,0)" transform="translate(64 0) scale(-1 1)"/>
   <circle cx="32" cy="32" r="21.5" fill="var(--m,url(#sa-gold))"/>
   <circle cx="32" cy="32" r="21.5" fill="var(--m,url(#sa-gold))" filter="url(#sa-korn)"/>
   <circle cx="32" cy="32" r="21.5" fill="none" stroke="url(#sa-kanteHell)" stroke-width="1.2"/>
   <circle cx="32" cy="32" r="21.5" fill="none" stroke="url(#sa-kanteDunkel)" stroke-width="1.2"/>
   <circle cx="32" cy="32" r="17.4" fill="var(--md,url(#sa-goldDunkel))"/>
   <circle cx="32" cy="32" r="16.4" class="ton" filter="url(#sa-innen)"/>
   <circle cx="32" cy="32" r="16.4" class="ton" filter="url(#sa-maser)"/>
   <circle cx="32" cy="32" r="16.4" fill="url(#sa-beize)"/>
   <circle cx="32" cy="32" r="16.4" fill="url(#sa-emaille)"/>
   <circle cx="32" cy="32" r="19.4" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="2.2" stroke-dasharray=".6 2.2" stroke-linecap="round"/>
   <circle cx="32" cy="32" r="19.4" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1" stroke-dasharray=".6 2.2" stroke-linecap="round"/>
   <circle cx="32" cy="32" r="21.5" fill="var(--m,url(#sa-gold))" filter="url(#sa-patina)"/>
   <ellipse cx="32" cy="22.5" rx="10" ry="4.2" fill="url(#sa-glanzpunkt)"/>
   <circle cx="32" cy="32" r="16.4" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width=".6"/>
  </g></symbol>

 <symbol id="sa-schild" viewBox="0 0 64 64">
  <g filter="url(#sa-wurf)">
   <path id="sa-sf" d="M32 5l21 6.5V31c0 13.5-9.5 23-21 28C20.5 54 11 44.5 11 31V11.5z" fill="var(--m,url(#sa-gold))"/>
   <use href="#sa-sf" filter="url(#sa-korn)"/>
   <use href="#sa-sf" fill="none" stroke="url(#sa-kanteHell)" stroke-width="1.2"/><use href="#sa-sf" fill="none" stroke="url(#sa-kanteDunkel)" stroke-width="1.2"/>
   <path d="M32 10.2l16.2 5V31c0 11-7.4 18.6-16.2 22.8C23.2 49.6 15.8 42 15.8 31V15.2z" fill="var(--md,url(#sa-goldDunkel))"/>
   <path d="M32 11.6l15 4.6V31c0 10.2-6.9 17.3-15 21.2C23.9 48.3 17 41.2 17 31V16.2z" class="ton" filter="url(#sa-innen)"/>
   <path d="M32 11.6l15 4.6V31c0 10.2-6.9 17.3-15 21.2C23.9 48.3 17 41.2 17 31V16.2z" class="ton" filter="url(#sa-maser)"/>
   <path d="M32 11.6l15 4.6V31c0 10.2-6.9 17.3-15 21.2C23.9 48.3 17 41.2 17 31V16.2z" fill="url(#sa-beize)"/>
   <path d="M32 11.6l15 4.6V31c0 10.2-6.9 17.3-15 21.2C23.9 48.3 17 41.2 17 31V16.2z" fill="url(#sa-emaille)"/>
   <use href="#sa-sf" fill="var(--m,url(#sa-gold))" filter="url(#sa-patina)"/>
   <path d="M32 11.6v40.6" stroke="#fff" stroke-opacity=".22" stroke-width="1"/><path d="M33.2 12v39.4" stroke="#000" stroke-opacity=".22" stroke-width="1"/>
   <path d="M20 16c5-2 9-2.8 12-2.8s7 .8 12 2.8c-3-1-7-1.4-12-1.4s-9 .4-12 1.4z" fill="url(#sa-glanzpunkt)"/>
   <g fill="var(--m,url(#sa-gold))" stroke="#3a2608" stroke-width=".3"><circle cx="16.5" cy="14" r="1.3"/><circle cx="47.5" cy="14" r="1.3"/><circle cx="14" cy="30" r="1.3"/><circle cx="50" cy="30" r="1.3"/></g>
   <path d="M32 2.2l3.4 4.2L32 8.8l-3.4-2.4z" fill="var(--m,url(#sa-gold))" stroke="#5a3d10" stroke-width=".35"/>
  </g></symbol>

 <symbol id="sa-banner" viewBox="0 0 64 64">
  <g filter="url(#sa-wurf)">
   <rect x="13" y="3" width="38" height="4.6" rx="2" fill="var(--m,url(#sa-gold))"/><rect x="13" y="3" width="38" height="4.6" rx="2" fill="none" stroke="url(#sa-kanteDunkel)" stroke-width=".8"/>
   <path id="sa-bf" d="M16.5 7.6h31V57l-15.5-8.2L16.5 57z" fill="var(--m,url(#sa-gold))"/>
   <use href="#sa-bf" fill="none" stroke="url(#sa-kanteHell)" stroke-width="1"/><use href="#sa-bf" fill="none" stroke="url(#sa-kanteDunkel)" stroke-width="1"/>
   <path d="M19.3 7.6h25.4v44.6L32 45.5l-12.7 6.7z" fill="var(--md,url(#sa-goldDunkel))"/>
   <path d="M20.5 7.6h23v42.6L32 44l-11.5 6.2z" class="ton" filter="url(#sa-innen)"/>
   <path d="M20.5 7.6h23v42.6L32 44l-11.5 6.2z" class="ton" filter="url(#sa-maser)"/>
   <path d="M20.5 7.6h23v42.6L32 44l-11.5 6.2z" fill="url(#sa-beize)"/>
   <path d="M24 7.6v40M32 7.6v36M40 7.6v40" stroke="#000" stroke-opacity=".22" stroke-width="3"/>
   <path d="M26.4 7.6v39M34.4 7.6v35.5M42.4 7.6v39" stroke="#fff" stroke-opacity=".14" stroke-width="1.6"/>
   <path d="M20.5 7.6h23v42.6L32 44l-11.5 6.2z" fill="url(#sa-emaille)"/>
   <rect x="20.5" y="7.6" width="23" height="5" fill="url(#sa-glanzpunkt)"/>
   <path d="M32 40.5l2.8 2.3-1.1 3.4h-3.4l-1.1-3.4z" fill="var(--m,url(#sa-gold))" opacity=".9"/>
   <g stroke="var(--m,url(#sa-gold))" stroke-width="1" stroke-linecap="round"><path d="M17.5 57v3.4M20.5 55.5v3.4M23.5 54v3.4M40.5 54v3.4M43.5 55.5v3.4M46.5 57v3.4"/></g>
  </g></symbol>

 <symbol id="sa-siegel" viewBox="0 0 64 64">
  <g filter="url(#sa-wurf)">
   <path id="sa-zk" d="M32 3.5l5.2 7.6 9.1-2.4 1.3 9.3 8.6 3.8-4.6 8.2 4.6 8.2-8.6 3.8-1.3 9.3-9.1-2.4L32 60.5l-5.2-7.6-9.1 2.4-1.3-9.3-8.6-3.8 4.6-8.2-4.6-8.2 8.6-3.8 1.3-9.3 9.1 2.4z" fill="var(--m,url(#sa-gold))"/>
   <use href="#sa-zk" filter="url(#sa-korn)"/>
   <use href="#sa-zk" fill="none" stroke="url(#sa-kanteHell)" stroke-width="1"/><use href="#sa-zk" fill="none" stroke="url(#sa-kanteDunkel)" stroke-width="1"/>
   <path d="M32 12.5c3 0 4.8 2.3 7.2 3s5.2-.4 7.3 1.6 1.9 5 3.1 7.4 3.7 4 3.7 7.5-2.5 5.1-3.7 7.5-1 5.4-3.1 7.4-5 .9-7.3 1.6-4.2 3-7.2 3-4.8-2.3-7.2-3-5.2.4-7.3-1.6-1.9-5-3.1-7.4-3.7-4-3.7-7.5 2.5-5.1 3.7-7.5 1-5.4 3.1-7.4 5-.9 7.3-1.6 4.2-3 7.2-3z" fill="var(--md,url(#sa-goldDunkel))"/>
   <circle cx="32" cy="32" r="17" class="ton" filter="url(#sa-innen)"/>
   <circle cx="32" cy="32" r="17" class="ton" filter="url(#sa-maser)"/>
   <circle cx="32" cy="32" r="17" fill="url(#sa-beize)"/>
   <circle cx="32" cy="32" r="17" fill="url(#sa-emaille)"/>
   <use href="#sa-zk" fill="var(--m,url(#sa-gold))" filter="url(#sa-patina)"/>
   <circle cx="32" cy="32" r="13.6" fill="none" stroke="#000" stroke-opacity=".38" stroke-width="1.6"/>
   <circle cx="32" cy="31.2" r="13.6" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width=".9"/>
   <g fill="var(--m,url(#sa-gold))" opacity=".9"><path d="M32 16.5l1 2.6-1 .9-1-.9z"/><path d="M32 47.5l1-2.6-1-.9-1 .9z"/><path d="M16.5 32l2.6-1 .9 1-.9 1z"/><path d="M47.5 32l-2.6-1-.9 1 .9 1z"/></g>
   <ellipse cx="32" cy="22.5" rx="10" ry="4" fill="url(#sa-glanzpunkt)"/>
  </g></symbol>
`;
