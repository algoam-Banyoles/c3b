# AUDIT.md — Auditoria del codebase c3b

> Abast: aplicació web PWA (HTML + JS vanilla) amb backend Node/Express
> sobre Supabase, desplegada a Vercel. **No** és una app d'escriptori
> (no hi ha Electron, Tauri, .NET ni PyInstaller); per tant, els
> criteris específics d'aquests entorns no apliquen i s'enumeren
> explícitament al final. Sí que hi ha dos scripts Python auxiliars
> de processament d'Excel; s'auditen també.

## Resum executiu

L'app funciona i el codi és llegible, però el **model de seguretat
està essencialment buit**: el backend exposa CRUD complet sense
autenticació, la CORS és oberta a qualsevol origen i les polítiques
RLS de Supabase són `USING (true)`. Combinat amb diverses
interpolacions `innerHTML` sense escapar de camps editables per
l'usuari (oponent, lloc, equip, **url_video usat com a href**), un
visitant qualsevol pot llegir/modificar/esborrar les partides de tots
els usuaris i col·locar payloads XSS persistents. Hi ha també codi
mort considerable (carpeta `public/`, scripts Python, referències a
una `chuecos.html` inexistent).

Top 3 urgents:

1. Afegir autenticació al backend (o servir Supabase directament amb
   auth de l'usuari i RLS reals). Avui mateix qualsevol pot fer
   `DELETE /api/partides/:id`.
2. Escapar tota interpolació `innerHTML` que toqui camps de partida o
   d'usuari, i validar `url_video` (rebutjar tot el que no sigui
   `http(s):`).
3. Restringir CORS al(s) origen(s) legítim(s) i afegir CSP.

---

## Troballes

### [CRÍTIC] API backend completament oberta (sense autenticació)

- Fitxer: [server.js:19-307](server.js#L19-L307)
- Problema: cap dels endpoints (`/api/usuaris`, `/api/modalitats`,
  `/api/partides` GET/POST/PUT/DELETE, `/api/partides/bulk`) verifica
  identitat ni autorització. L'única "auth" és la selecció d'usuari a
  `localStorage` ([config.js:46-52](config.js#L46-L52)). Qualsevol
  desconegut amb la URL de Vercel pot llistar tots els usuaris,
  esborrar partides alienes, o modificar el nom de qualsevol jugador.
- Impacte: pèrdua/manipulació de totes les dades del projecte;
  vandalisme; impossible auditar qui ha fet què.
- Solució proposada: introduir Supabase Auth (magic-link n'hi ha
  prou per a un grup tancat de jugadors), passar el JWT del client a
  Supabase com a `Authorization: Bearer ...`, i convertir les
  polítiques RLS a expressions reals (`auth.uid() = usuari_id`).
  Mentrestant, com a tirita: un middleware Express que requereixi un
  token compartit en una capçalera.
- Esforç estimat: gran.

### [CRÍTIC] RLS oberta a Supabase (`USING (true)`)

- Fitxer: [supabase_migration_multi_user.sql:165-178](supabase_migration_multi_user.sql#L165-L178)
- Problema: les tres polítiques permeten qualsevol operació sense
  comprovar res. RLS activat però sense efecte. L'anon key del
  `.env` aplicada per `supabase.js` no afegeix cap restricció.
- Impacte: si algú obtingués l'anon key (que és pública per disseny),
  podria operar directament contra la BD sense passar pel backend.
- Solució proposada: una vegada hi hagi auth, substituir per
  polítiques amb `auth.uid()`/`auth.jwt()` i RESTRICTIVE on calgui.
- Esforç estimat: mitjà.

### [CRÍTIC] XSS emmagatzemat via `innerHTML` amb camps de partida

- Fitxer: [js/table.js:54-75](js/table.js#L54-L75)
- Problema: `p.oponent`, `p.url_video`, `p.serie_major` i d'altres es
  concatenen dins d'un template literal i s'assignen a
  `tbody.innerHTML` sense escapar. Combinat amb la troballa anterior
  (API oberta), qualsevol pot crear una partida amb
  `oponent = "<img src=x onerror=alert(1)>"` i s'executarà a totes les
  sessions que la pintin.
- Impacte: cookie/session-storage theft, suplantació d'usuari,
  defacement.
- Solució proposada: extreure `escapeHtml` a un fitxer compartit (ara
  hi ha duplicats a `toast.js`, `suggestions.js`, `vs.html`,
  `player.html`) i envoltar **totes** les interpolacions d'usuari.
  Idealment, refactoritzar a `document.createElement` per a cada `td`.
- Esforç estimat: mitjà.

### [CRÍTIC] `javascript:` URI possible al camp `url_video`

- Fitxer: [js/table.js:67](js/table.js#L67)
- Problema: `url_video` es posa directament com a `href` sense
  validar l'esquema. `lib/validation.js` no valida `url_video` en
  absolut. `<input type="url">` filtra al client, però l'API
  l'accepta tal qual. Un valor `javascript:alert(document.cookie)`
  s'executa quan l'usuari clica el 🎥.
- Impacte: XSS clickjacking-style.
- Solució proposada: rebutjar a `validarPartida` qualsevol
  `url_video` que no comenci per `http://` o `https://`. Quick fix
  al renderer: `const href = /^https?:\/\//.test(p.url_video) ? p.url_video : '#';`.
- Esforç estimat: trivial.

```js
// lib/validation.js — afegir
if (p.url_video != null) {
    if (typeof p.url_video !== 'string') return 'url_video ha de ser una cadena';
    if (p.url_video && !/^https?:\/\//i.test(p.url_video)) return 'url_video ha de començar per http:// o https://';
}
```

### [CRÍTIC] CORS obert a tothom + cap CSP

- Fitxer: [server.js:10](server.js#L10)
- Problema: `app.use(cors())` accepta qualsevol `Origin`. Vercel
  tampoc afegeix CSP. Qualsevol pàgina web visitada per un usuari
  amb sessió legítima pot fer fetch contra l'API i exfiltrar/alterar
  dades (CSRF de facto, ja que no hi ha auth tampoc).
- Impacte: combinat amb la falta d'auth, qualsevol web pot fer CRUD
  a la BD a través del navegador d'un visitant.
- Solució proposada: `cors({ origin: ['https://el-domini-de-produccio'], credentials: false })`. Afegir capçaleres CSP a `vercel.json` (per exemple, `script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'` i prou).
- Esforç estimat: trivial.

### [CRÍTIC] XSS via nom d'usuari/modalitat a UI de gestió

- Fitxer: [manage-users.html:379-401](manage-users.html#L379-L401)
- Problema: `user.nom` i `user.email` s'interpolen dins d'`innerHTML`
  sense escapar. La línia 398 incrusta el nom dins d'un atribut
  `onclick="confirmarEliminar(${user.id}, '${user.nom.replace(/'/g, "\\'")}', ${totalPartides})"` i només escapa apòstrofs — un
  nom com `Joe");alert(1);//` trenca tot.
- Impacte: XSS persistent qualsevol vegada que algú entri a la
  pàgina de gestió.
- Solució proposada: usar `dataset.userId` als botons + `addEventListener`. Aplicar `escapeHtml` a noms i emails. Mateixa
  feina cal a [select-user.html:454-470](select-user.html#L454-L470)
  i a [navbar.js:214-224](navbar.js#L214-L224).
- Esforç estimat: mitjà.

### [CRÍTIC] XSS via `usuariNom` a la capçalera

- Fitxer: [js/app.js:20](js/app.js#L20)
- Problema: `userConfig.usuariNom` (vingut de l'API, controllable per
  qualsevol amb la troballa anterior) es concatena dins d'`innerHTML`.
- Impacte: XSS a cada càrrega de l'app.
- Solució proposada: `mainTitle` amb un `<img>` fix i un `<span>`
  amb `textContent = userConfig.usuariNom`. Una sola línia canviada.
- Esforç estimat: trivial.

---

### [ALT] Cap validació de mida/contingut a POST /api/usuaris i /api/modalitats

- Fitxer: [server.js:37-58](server.js#L37-L58), [server.js:124-146](server.js#L124-L146)
- Problema: només es comprova que `nom` existeixi. Es pot crear un
  usuari amb `nom` de 1 MB, o amb HTML al camp. Combinat amb XSS,
  vector d'atac trivial.
- Impacte: pol·lució de dades, vector XSS persistent.
- Solució proposada: validar `typeof nom === 'string'`, `nom.length <= 100`, no `<` o `>` o limitar a `[\p{L}\p{N} .'-]`. Si email
  present, validar format mínim.
- Esforç estimat: trivial.

### [ALT] `event` global a `switchTab` i `selectUsuari`

- Fitxer: [js/app.js:169](js/app.js#L169), [select-user.html:490](select-user.html#L490)
- Problema: `typeof event !== 'undefined' && event.target` depèn de
  la variable global `event` (només existeix dins handlers crida
  directament des d'`onclick=...`). En strict mode o quan es crida
  programàticament, salta el branch d'`else`.
- Impacte: incoherències subtils al canvi de pestanya / selecció
  d'usuari quan es crida des d'altres llocs.
- Solució proposada: passar l'`event` com a paràmetre (`onclick="switchTab(event, 'evolution')"`) o adjuntar listeners amb
  `addEventListener` i `e.currentTarget`.
- Esforç estimat: trivial.

### [ALT] Carpeta `public/` sencera (CSS+JS) no referenciada — codi mort

- Fitxer: [public/js/api.service.js](public/js/api.service.js), [public/js/chart.service.js](public/js/chart.service.js), [public/js/stats.service.js](public/js/stats.service.js), [public/css/variables.css](public/css/variables.css), [public/css/components.css](public/css/components.css)
- Problema: cap HTML/JS del projecte els carrega
  (`grep -r "public/" --include="*.{html,js}"` retorna 0 matches).
  Sembla una arquitectura abandonada paral·lela a `js/`.
- Impacte: confusió per a nou desenvolupador, bundle SW els ignora
  però estan al repo.
- Solució proposada: eliminar `public/` o moure'l a `legacy/` amb un
  README que digui què era.
- Esforç estimat: trivial.

### [ALT] Referències a `chuecos.html` que no existeix

- Fitxer: [README.md](README.md), [GUIA_US.md](GUIA_US.md), [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md), [update_html_data.py:60](update_html_data.py#L60)
- Problema: la documentació i el script Python referencien una
  pàgina `chuecos.html` que es va eliminar quan es va passar al
  sistema multi-usuari. `update_html_data.py` ja no es pot executar.
- Impacte: documentació enganyosa per a contribuïdors o per al mateix
  autor d'aquí a 6 mesos.
- Solució proposada: actualitzar README i GUIA_US, esborrar
  `update_html_data.py` (no té sentit ara que les dades són a BD).
- Esforç estimat: trivial.

### [ALT] Restauració de dades inicials trenca el flux multi-usuari

- Fitxer: [js/data.js:107-119](js/data.js#L107-L119), [js/initial-data.js](js/initial-data.js)
- Problema: el botó "Restaurar Dades Inicials" reemplaça
  `PARTIDES_RAW` per `INITIAL_DATA` (35 partides hardcoded
  d'Albert Gómez). Si l'usuari actual és un altre jugador, l'app
  mostrarà partides d'un altre però NO es guarden a BD (només
  `guardarDadesStorage` que toca localStorage). Després del primer
  reload tornen a desaparèixer. És UX trencada que produeix
  confusió.
- Impacte: l'usuari creu que ha restaurat dades i en realitat les
  veu només temporalment.
- Solució proposada: o bé eliminar el botó (les dades reals viuen a
  Supabase, no cal "restaurar"), o bé fer-lo POST bulk al backend amb
  l'`usuari_id` i `modalitat_id` actuals, i acceptar que sempre crea
  35 entrades de Gómez per a qui premi el botó. La primera opció és
  més coherent.
- Esforç estimat: trivial (eliminar) / mitjà (re-pensar).

### [ALT] `setInterval(registration.update, 60000)` etern

- Fitxer: [js/app.js:58](js/app.js#L58)
- Problema: el client demana `update()` al Service Worker cada
  minut, indefinidament, incloent quan la pestanya és inactiva. A
  llarga ocupació de bateria i tràfic innecessari.
- Impacte: drenatge de bateria al mòbil, tràfic de fons constant.
- Solució proposada: actualitzar només quan la pestanya recupera
  focus (`document.addEventListener('visibilitychange', ...)`) o cada
  10-15 min, no cada minut.
- Esforç estimat: trivial.

### [ALT] Keep-alive cada càrrega de pàgina + cada 24h

- Fitxer: [config.js:355-376](config.js#L355-L376)
- Problema: cada vegada que es carrega `config.js` (és a totes les
  pàgines) es fa un `fetch('/api/usuaris')` immediat, i a més es
  programa un `setInterval` de 24h. Si l'usuari obre 4 pestanyes,
  s'inicialitzen 4 intervals; quan tanca i obre l'app, no es
  cancel·la cap (els intervals viuen amb la pestanya). Tot i així,
  amb el plan free de Supabase no és inútil.
- Impacte: tràfic redundant i lleugera incoherència; lleus efectes
  de N pestanyes.
- Solució proposada: un únic ping al carregar és prou. L'interval
  de 24h pràcticament no s'arribarà a executar (qui té una pestanya
  oberta 24h?). Pots fer-ho amb un cron de Vercel si vols garanties.
- Esforç estimat: trivial.

### [ALT] `partidesPerUsuari` carrega TOTES les partides de tots els usuaris

- Fitxer: [manage-users.html:345-355](manage-users.html#L345-L355)
- Problema: la pàgina de gestió fa un `GET /api/partides` sense
  filtres per saber quants registres té cada usuari. Amb 5 usuaris
  i ~400 partides cada un, ja són 2000 files que viatgen per la
  xarxa només per a mostrar "📊 12 partides".
- Impacte: pàgina lenta, dades sensibles innecessàriament
  exposades a l'usuari que entri allà.
- Solució proposada: nou endpoint `GET /api/usuaris/stats` que
  retorni `[ { id, count } ]` amb un sol SQL agregat. O com a mínim
  retornar només `(id, usuari_id)` a la query.
- Esforç estimat: mitjà.

### [ALT] `Number.isFinite` rebutja `caramboles_oponent` enviat com a string

- Fitxer: [lib/validation.js:14](lib/validation.js#L14)
- Problema: `parseInt` al modal ([js/modal.js:47](js/modal.js#L47))
  retorna `NaN` si el camp està buit i es fa fallback a `0`. Però si
  l'API rebés `"30"` (string) en lloc de `30`, `Number.isFinite("30")`
  és `false` i el missatge "caramboles_oponent ha de ser >= 0"
  s'activa sense indicar el problema real (string vs number).
- Impacte: errors confusos en clients de tercers o si es retoca el
  modal.
- Solució proposada: normalitzar al servidor (`Number(p.caramboles)`)
  o coercionar abans de validar.
- Esforç estimat: trivial.

### [ALT] `PARTIDES_DATA` global compartit; race entre `aplicarFiltrePeriode` i renders

- Fitxer: [js/app.js:5-14](js/app.js#L5-L14), [js/modal.js:84-89](js/modal.js#L84-L89)
- Problema: a `guardarPartida`, primer es modifica `PARTIDES_RAW`,
  després s'ordena, després s'aplica filtre, i finalment es crida
  `refreshAll`. Si entre mig un altre `await` (per exemple un
  refresh de suggeriments) reentra al mateix camí, `PARTIDES_DATA`
  pot quedar en estat intermedi. [A VERIFICAR] sota interaccions
  ràpides.
- Impacte: comptadors o gràfics inconsistents un instant.
- Solució proposada: encapsular l'estat en un mòdul amb un únic
  punt d'entrada (un store), o evitar `await` enmig de mutacions.
- Esforç estimat: mitjà.

### [ALT] Index `originalIdx` invertit pot quedar stale

- Fitxer: [js/table.js:18-19](js/table.js#L18-L19)
- Problema: `originalIdx = PARTIDES_DATA.length - 1 - reverseIdx`
  serveix per a `onclick="openEditModal(${originalIdx})"`. Si entre
  la generació de la taula i el clic, `PARTIDES_DATA` canvia (per
  ex. eliminació en una altra pestanya via Supabase realtime — a
  l'app actual no hi és, però sí amb el botó d'eliminar), l'índex
  apunta a una altra partida. Avui funciona perquè tot es re-renderitza
  al moment, però és fràgil. [A VERIFICAR].
- Impacte: editar/eliminar una partida diferent de la que apareix.
- Solució proposada: utilitzar `data-partida-id="${p.id}"` i
  `addEventListener`. Buscar per id, no per índex.
- Esforç estimat: mitjà.

### [ALT] `pitjor` inclou partides amb mitjana 0 reals

- Fitxer: [vs.html:309](vs.html#L309), [player.html:344-356](player.html#L344-L356)
- Problema: `pitjor` s'inicialitza a `partides[0]` i es compara amb
  `(p.mitjana || 0) < (pitjor.mitjana || 0)`. Si la primera partida
  té mitjana 0.5 i la segona 0 (vàlida però mala), passarà a ser
  pitjor; bé. Però player.html línia 354 afegeix `m > 0`, cosa que
  amaga la pitjor partida real si va ser 0. Incoherent entre vs.html
  i player.html.
- Impacte: estadística "Pitjor partida" pot mentir en casos
  extrems.
- Solució proposada: definir una regla única ("pitjor" = mínim
  estricte sobre totes; o sobre `entrades > 0`) i aplicar-la igual.
- Esforç estimat: trivial.

### [ALT] `STORAGE_VERSION` mai usat per a migracions

- Fitxer: [js/data.js:6](js/data.js#L6)
- Problema: es desa la `version` al localStorage però mai es llegeix
  per a migrar dades antigues. Si en el futur es canvia el format,
  no hi ha fonament per detectar-ho.
- Impacte: futurs canvis de schema poden trencar localStorage de
  forma silenciosa.
- Solució proposada: o bé eliminar la versió, o bé afegir codi de
  migració quan calgui canviar-la.
- Esforç estimat: trivial.

---

### [MITJÀ] `escapeHtml`/`escapeAttr` duplicat a 4 llocs

- Fitxer: [js/toast.js:82-85](js/toast.js#L82-L85), [js/suggestions.js:52-54](js/suggestions.js#L52-L54), [vs.html:441-444](vs.html#L441-L444), [player.html:456-459](player.html#L456-L459)
- Problema: la mateixa funció copiada quatre vegades. Quan se'n
  modifiqui una, les altres divergiran.
- Impacte: bug-prone, mala higiene de codi.
- Solució proposada: moure a `js/utils.js` (ja existeix) i
  exposar-la com a `window.escapeHtml`.
- Esforç estimat: trivial.

### [MITJÀ] `updateGlobalStats` és de 124 línies amb template gegant

- Fitxer: [js/stats.js:5-129](js/stats.js#L5-L129)
- Problema: un sol template literal renderitza 8 targetes diferents
  amb branques `${condició ? `...` : ''}`. Difícil de modificar i de
  testar.
- Impacte: qualsevol canvi de stat trenca regressions visuals.
- Solució proposada: una funció `renderStatCard({ label, value, subvalue, color })` i muntar l'array amb push condicional. Bonus:
  permet ordenar targetes.
- Esforç estimat: mitjà.

### [MITJÀ] Magia "3 Bandes" / "Tres Bandes" repartida

- Fitxer: [js/app.js:25](js/app.js#L25), [player.html:190](player.html#L190), [vs.html:203](vs.html#L203)
- Problema: la mida de finestra mòbil (15 o 10) depèn de comparar el
  nom de modalitat. Hardcodejat a 3 llocs. Si afegeixes una modalitat
  amb finestra de 20 (per exemple "Banda"), has de tocar 3 fitxers.
- Impacte: lligadura forta, propensa a divergir.
- Solució proposada: emmagatzemar `rolling_window` a la taula
  `modalitats` (`camps_personalitzats` ja és JSONB) i llegir d'allà.
- Esforç estimat: mitjà.

### [MITJÀ] `confirm()` natiu vs. sistema de toast

- Fitxer: [js/data.js:96](js/data.js#L96), [js/modal.js:104](js/modal.js#L104), múltiples llocs
- Problema: l'app té un sistema de toast bonic ([js/toast.js](js/toast.js)) però segueix usant `confirm()` modal natiu per a destructives,
  cosa que dóna UX inconsistent (i pitjor en PWA mode standalone).
- Impacte: UX irregular.
- Solució proposada: afegir `toast.confirm(msg, onYes)` amb dos
  botons. No urgent.
- Esforç estimat: mitjà.

### [MITJÀ] `reminderShouldShow` retorna mixed (`false` o `number`)

- Fitxer: [js/reminder.js:16-29](js/reminder.js#L16-L29)
- Problema: la funció torna `false` o el nombre de dies. El cridador
  ho usa truthy, però el tipus de retorn confús.
- Impacte: sorpresa al llegir; refactor futur trencadís.
- Solució proposada: retornar `null | number`.
- Esforç estimat: trivial.

### [MITJÀ] `INITIAL_DATA` ocupa 493 línies dins del bundle

- Fitxer: [js/initial-data.js](js/initial-data.js)
- Problema: 35 partides hardcoded carregades a totes les visites,
  només per a un botó de restaurar dades que (com s'ha vist) no
  funciona bé.
- Impacte: cada usuari carrega ~15 KB de dades d'algú altre.
- Solució proposada: si es manté el botó, fer fetch a un fitxer
  JSON estàtic només quan es premi.
- Esforç estimat: trivial.

### [MITJÀ] CDN Chart.js cache-first sense versió

- Fitxer: [sw.js:43-46](sw.js#L43-L46), [index.html:12](index.html#L12)
- Problema: `<script src="https://cdn.jsdelivr.net/npm/chart.js">` sense
  versió fixada + el SW fa cache-first del CDN. Resultat: la versió
  primera que el navegador hagi carregat queda enganxada per sempre.
  A més, si jsdelivr canvia el comportament d'una versió, es
  silenciarà aquí.
- Impacte: actualitzacions no propagades; build no reproduïble.
- Solució proposada: fixar versió (`chart.js@4.4.0`) i, si vols
  garanties extra, instal·lar Chart.js localment via npm i
  servir-lo.
- Esforç estimat: trivial.

### [MITJÀ] `meta viewport` impedeix zoom (accessibilitat)

- Fitxer: [index.html:5](index.html#L5), [select-user.html:5](select-user.html#L5), [player.html:5](player.html#L5), [vs.html:5](vs.html#L5), [manage-users.html:5](manage-users.html#L5)
- Problema: `maximum-scale=1.0, user-scalable=no` viola WCAG
  (1.4.4 — Resize text).
- Impacte: usuaris amb baixa visió no poden ampliar la pàgina.
- Solució proposada: deixar només `width=device-width, initial-scale=1`.
- Esforç estimat: trivial.

### [MITJÀ] Botons amb icona sense `aria-label`

- Fitxer: [js/table.js:70-72](js/table.js#L70-L72) (✏️ 📤 🗑️) i altres
- Problema: l'únic text del botó és un emoji. Els screen readers no
  llegeixen "editar" / "compartir" / "eliminar"; llegeixen el nom
  Unicode de l'emoji.
- Impacte: inaccessible per a usuaris de tecnologies assistives.
- Solució proposada: `<button aria-label="Editar partida">✏️</button>`
  (el `title` que ja hi és no és equivalent per a SR).
- Esforç estimat: trivial.

### [MITJÀ] Cors per dependencies amb arxiu d'origen Vercel

- Fitxer: [vercel.json](vercel.json)
- Problema: la configuració de Vercel no afegeix capçaleres de
  seguretat (Strict-Transport-Security, X-Content-Type-Options,
  Referrer-Policy, Permissions-Policy, Content-Security-Policy).
- Impacte: pèrdua de defensa en profunditat.
- Solució proposada:

  ```json
  "headers": [
    { "source": "/(.*)", "headers": [
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
      { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data:; connect-src 'self'; style-src 'self' 'unsafe-inline'" }
    ]}
  ]
  ```

- Esforç estimat: trivial.

---

### [BAIX] `console.log` de producció

- Fitxer: [server.js](server.js) (12 ocurrències), [js/app.js](js/app.js) (3), [navbar.js:195](navbar.js#L195), [config.js:372](config.js#L372), [sw.js](sw.js) (10), [supabase.js:8](supabase.js#L8)
- Problema: logs pintorescos en català es publiquen a stdout de
  Vercel. No són secrets però fan soroll als logs i la consola del
  client.
- Impacte: cosmètic.
- Solució proposada: un wrapper `log()` controlat per
  `process.env.NODE_ENV !== 'production'`.
- Esforç estimat: trivial.

### [BAIX] `process_excel_data.py` i Excels obsolets

- Fitxer: [process_excel_data.py](process_excel_data.py), [BILLAR (1).xlsx](BILLAR%20%281%29.xlsx), [Partides.xlsx](Partides.xlsx), [partides_chuecos_updated.json](partides_chuecos_updated.json), [partides_gomez_updated.json](partides_gomez_updated.json)
- Problema: el flux ETL d'Excel→JSON va deixar de tenir sentit quan
  les dades es van migrar a Supabase. Els fitxers segueixen al repo
  ocupant ~115 KB i potencialment poden induir a algú a "refrescar"
  des d'allà.
- Impacte: confusió, pes del repo.
- Solució proposada: moure a `legacy/` o eliminar (estan al git
  history si calen).
- Esforç estimat: trivial.

### [BAIX] `partidesPerUsuari` declarat amb `let` però mutat com a objecte

- Fitxer: [manage-users.html:330](manage-users.html#L330)
- Problema: petita inconsistència estilística — declarat amb `let` i
  re-assignat a `{}` cada càrrega, però amb `const` n'hi hauria
  prou.
- Impacte: cosmètic.
- Solució proposada: `const partidesPerUsuari = new Map();` per
  consistència amb `byMod` a player.html.
- Esforç estimat: trivial.

### [BAIX] Funcions duplicades de càlcul d'estadístiques

- Fitxer: [js/stats.js](js/stats.js), [player.html:344-365](player.html#L344-L365), [vs.html:299-322](vs.html#L299-L322)
- Problema: cada pàgina re-implementa `computeStats` (millor, pitjor,
  mitjana, totalCar, totalEnt) lleugerament diferent. Variacions
  subtils → estadístiques diferents per la mateixa partida segons on
  la mires.
- Impacte: incoherència de números entre pàgines.
- Solució proposada: una sola `statsService.js` (probablement el que
  intentava ser `public/js/stats.service.js`!) carregada des de
  tots els HTML.
- Esforç estimat: mitjà.

### [BAIX] `tests/` només té smoke-test i validation

- Fitxer: [tests/syntax.test.js](tests/syntax.test.js), [tests/validation.test.js](tests/validation.test.js)
- Problema: cap test E2E ni de la lògica de càlcul de mitjanes /
  punts / fiabilitat. La regressió més probable (canviar un peu de
  pàgina) no la detecta res.
- Impacte: refactoritzacions futures inseguras.
- Solució proposada: afegir tests unitaris per a `js/utils.js`
  (puntuació, temporada, tendència).
- Esforç estimat: mitjà.

### [BAIX] Strings en català hardcoded

- Fitxer: tot el codebase
- Problema: cap layer de traducció. Si en algun moment vols anglès
  per a la fitxa "Compartir", caldria substituir un per un.
- Impacte: cap a curt termini; obstacle si vols compartir l'app
  fora del cercle català.
- Solució proposada: només si planeges expandir. Avui no cal.
- Esforç estimat: gran.

---

## Quick wins (top 10)

1. [CRÍTIC] **Validar `url_video` que comenci per `http(s)://`** a `lib/validation.js` (~3 línies). Tanca la porta `javascript:`.
2. [CRÍTIC] **Restringir CORS** a l'origen de producció a `server.js:10`. Una línia.
3. [CRÍTIC] **Afegir `escapeHtml` al nom d'usuari a `js/app.js:20`** (substituir `innerHTML` per separar `<img>` i `<span>.textContent`).
4. [ALT] **Validar mida i caràcters al POST de `/api/usuaris`** (`length <= 100`, regex bàsic).
5. [ALT] **Afegir CSP a `vercel.json`** (snippet ja proposat).
6. [ALT] **Fixar versió de Chart.js al CDN** (`chart.js@4.4.0`) — `index.html:12`, `player.html:12`, `vs.html:12`.
7. [ALT] **Eliminar `public/` o moure a `legacy/`** — 5 fitxers no usats.
8. [ALT] **Esborrar `update_html_data.py`** i les referències a `chuecos.html` al README, GUIA_US, DEPLOY_VERCEL.
9. [MITJÀ] **Centralitzar `escapeHtml` a `js/utils.js`** i exportar-la a window.
10. [MITJÀ] **Treure `maximum-scale=1.0, user-scalable=no`** dels 5 HTMLs.

---

## Riscos de distribució

L'app es desplega a Vercel (no és binari), però hi ha riscos
operacionals que apareixeran quan algú visiti l'app públicament:

- **Sense auth, qualsevol amb la URL pot llistar/esborrar dades**.
  No és un risc d'instal·lació sinó un risc operacional crític.
  Considera no compartir la URL fins que tinguis auth.
- **PWA standalone + Service Worker amb timeout 3s**: en xarxes
  mòbils mediocres, els recursos locals trigaran a actualitzar-se
  i caurà sempre al fallback de cache. Quan facis un canvi, l'usuari
  pot veure'l amb 1-2 dies de retard.
- **Service Worker registrat només a `index.html`**: si un usuari
  entra primer per `select-user.html` o `player.html`, el SW no es
  registra fins que arribi a `index`. Possibles inconsistències
  d'offline mode.
- **Anon key Supabase exposada al backend**: és correcta per a
  l'anon role, però com que les polítiques RLS són obertes, **la
  key pública pot operar a tot arreu** sense passar pel servidor
  Express. Aïllat de la troballa principal (cal arreglar RLS abans
  de res).
- **CDN Chart.js sense pinning**: si jsdelivr cau, l'app no
  arrenca gràfics. Si Chart.js puja una major version trencadissa,
  l'app es trenca silenciosament. Recomanat servir local després
  d'`npm install`.
- **Excels (.xlsx) i JSONs al repo**: ~115 KB de dades que ja no
  s'utilitzen — augmenten el bundle de Vercel innecessàriament
  (vercel.json:21 inclou `*.json` com a static).
- **`partides_*_updated.json` accessibles a /partides_chuecos_updated.json**
  via la regla catch-all (vercel.json:51). Són públiques al
  navegador. Per a un joc amistós tampoc passa res, però és exposat
  sense voler-ho.

---

## Aplicabilitat dels criteris demanats

Aquests blocs de criteris **no apliquen** a aquest projecte i
s'enumeren explícitament per evitar confusió:

- **Electron / Tauri** (`nodeIntegration`, `contextIsolation`,
  `BrowserWindow`, allowlist, `contextBridge`): l'app és web pura
  servida per Express+Vercel, sense embolcall natiu. Si en algun
  moment es vol convertir en app d'escriptori, recomano Tauri amb
  `allowlist.shell.all = false` i `allowlist.fs.scope = []`. CSP
  ja s'apunta més amunt.
- **Arquitectura main/renderer** (`webContents`, `before-quit`,
  cicle de vida): no aplica per la mateixa raó.
- **Patrons .NET** (`async void`, `.Result/.Wait()`, `IDisposable`,
  `INotifyPropertyChanged`, `ConfigureAwait`): no hi ha codi .NET.
- **GUI Python amb PyQt/Tkinter** (`signals/slots`, `QThread`,
  `after()`): els dos scripts Python (`process_excel_data.py`,
  `update_html_data.py`) són CLI batch one-shot; no tenen GUI ni
  threads. **No** usen `pickle`, `eval`, `exec`, `subprocess`,
  `requests` ni xarxa — només `pandas.read_excel` i
  `open(...).write`. Per tant, els criteris de "Seguretat Python"
  i "Empaquetat Python (PyInstaller)" no apliquen.
- **Empaquetat PyInstaller / __file__ / hooks**: no hi ha
  empaquetat d'app Python.
- **Persistència multi-plataforma** (AppData, ~/Library, XDG): no
  aplica, l'usuari final no instal·la res. Tot viu al navegador i
  al cloud.
- **Code signing / SmartScreen / Gatekeeper / Updater**: no aplica,
  no hi ha binari distribuïble.

Si en el futur empaqueteu això com a PWA en una store o com a
Electron/Tauri, tornaré a auditar aquests punts.

---

## Optimització de funcions

> **Nota prèvia**: per a un dataset realista (≤500 partides per
> usuari, ≤10 modalitats), gairebé totes les funcions O(n) o O(n·W)
> trigaran <5 ms al navegador modern. Marca general: cap funció no
> és evidentment crítica; tot l'apartat s'ha de validar amb un
> profiler abans d'invertir-hi temps. La llegibilitat actual és
> bona; **no toquis res que no estigui mesurat**.

### `updateChart` — [js/chart.js:33-149](js/chart.js#L33-L149)

- **Complexitat actual**: O(W·W) en temps (W = ROLLING_WINDOW, 10 o 15)
  pel càlcul de `mitjanaAcumulada`: per cada partida visible (W),
  fa un `slice(start, end)` (O(W)) i dos `reduce` (O(W)). Memòria
  O(W).
- **Complexitat assolible**: O(W) amb prefix sums precalculats sobre
  `PARTIDES_DATA` (calculats un cop per refresh).
- **Hot path?**: [A VERIFICAR amb profiler]. Es crida en cada arrossegada
  del `range slider` (`slider.oninput`, [js/chart.js:17](js/chart.js#L17))
  que pot disparar 30-60 cops/segon mentre l'usuari arrossega. Per
  W=15 són ~225 operacions per render. Probablement imperceptible a
  desktop, podria notar-se a mòbil baix de gamma.
- **Diagnòstic**: la mitjana mòbil es recalcula des de zero per a
  cada punt en lloc d'utilitzar la finestra anterior i sumar/restar
  un element.
- **Refactor proposat**:

  ```js
  // Una vegada al carregar/refrescar PARTIDES_DATA
  const prefixCar = [0], prefixEnt = [0];
  for (const p of PARTIDES_DATA) {
      prefixCar.push(prefixCar.at(-1) + p.caramboles);
      prefixEnt.push(prefixEnt.at(-1) + p.entrades);
  }
  // Després, per cada punt visible:
  const start = Math.max(0, globalIdx - (ROLLING_WINDOW - 1));
  const end = globalIdx + 1;
  const car = prefixCar[end] - prefixCar[start];
  const ent = prefixEnt[end] - prefixEnt[start];
  ```

- **Trade-offs**: cal mantenir els prefix sums actualitzats després
  de cada add/edit/delete (recalcular-los des de zero és O(n), més
  ràpid que el càlcul actual per render). +2 arrays de mida n+1.
- **Guany estimat**: ~15× al càlcul de la mitjana acumulada. Però
  Chart.js domina el cost del render, així que el guany **net per
  frame** probablement és 2-3× a tot estirar. Marginal a desktop.
- **Esforç**: mitjà (cal sincronitzar amb mutacions de
  `PARTIDES_DATA`).
- **Prioritat**: mitjana. Si el profiler mostra que el slider va
  fluix a mòbil, val la pena. Si no, deixa-ho.

### `buildChart` — [player.html:367-436](player.html#L367-L436)

- **Complexitat actual**: O(n·W) en temps per cada modalitat. Mateix
  problema que `updateChart` però sense slider: només es calcula al
  canviar de pestanya.
- **Complexitat assolible**: O(n) amb prefix sums.
- **Hot path?**: No. Es crida un cop per modalitat a `renderPanes`
  i una vegada a `activateTab`. Per 5 modalitats × 500 partides ×
  W=15 són ~37 500 operacions. <10 ms.
- **Diagnòstic**: idèntic a `updateChart`.
- **Refactor proposat**: mateix patró de prefix sums (i convé fer
  un helper compartit a `js/utils.js` un cop refactorem
  `updateChart`).
- **Trade-offs**: +2 arrays per modalitat (mida total n).
- **Guany estimat**: 10-15×, però sobre un cost que ja és <10 ms.
  Marginal.
- **Esforç**: trivial (un cop existeix el helper).
- **Prioritat**: baixa.

### `renderEvolutionChart` — [vs.html:361-433](vs.html#L361-L433)

- **Complexitat actual**: O(n·W) en cadascun dels dos jugadors.
- **Complexitat assolible**: O(n) amb prefix sums (un cop per
  jugador).
- **Hot path?**: No. Es crida quan canvies de modalitat o
  d'usuari.
- **Diagnòstic**: mateix patró que els altres dos. La funció
  `movingAvg` fa el mateix slice+reduce per cada punt.
- **Refactor proposat**: extreure `movingAverage(partides, window)`
  a `js/utils.js` amb prefix sums i compartir-la entre les 3
  vistes.
- **Trade-offs**: una nova dependència compartida entre 3 pàgines;
  positiu (DRY).
- **Guany estimat**: 10×, però sobre cold path. Marginal.
- **Esforç**: trivial un cop existeix el helper.
- **Prioritat**: baixa.

### `carregarDades` (manage-users) — [manage-users.html:339-362](manage-users.html#L339-L362)

- **Complexitat actual**: O(n_total) en temps i memòria al client
  (descarrega TOTES les partides de TOTS els usuaris només per a
  comptar-les). Tràfic real: ~400 partides × ~500 bytes = ~200 KB
  per visita a la pàgina.
- **Complexitat assolible**: O(n_usuaris) si afegim un endpoint
  agregat `GET /api/usuaris/stats` que retorni `[{ id, count }]`
  amb un sol SQL `GROUP BY usuari_id` (Postgres ho resol en una
  passada amb index sobre `usuari_id`, que ja existeix).
- **Hot path?**: No (pàgina d'administració, rarament visitada).
  Però el cost de xarxa és visible a 3G.
- **Diagnòstic**: és el cas de llibre de "carregar dades fortes per
  fer-ne agregació trivial al client".
- **Refactor proposat**:

  ```js
  // server.js
  app.get('/api/usuaris/stats', async (req, res) => {
      const { data, error } = await supabase
          .rpc('user_match_counts'); // o un view SQL
      if (error) return res.status(500).json({ error: error.message });
      res.json(data);
  });
  ```

- **Trade-offs**: cal afegir endpoint i mantenir-lo sincronitzat.
- **Guany estimat**: 10-50× en bytes transferits; cosmètic en
  temps CPU.
- **Esforç**: mitjà (endpoint nou + funció SQL).
- **Prioritat**: mitjana (val la pena pel sanejament arquitectònic;
  no urgent).

### `carregarSuggeriments` — [js/suggestions.js:10-26](js/suggestions.js#L10-L26)

- **Complexitat actual**: 1 fetch HTTP cada vegada que s'obre el
  modal. La resposta pot ser de centenars de partides.
- **Complexitat assolible**: 0 fetches després del primer
  (memoització en mòdul) o reutilitzar `PARTIDES_RAW` quan
  cobreix prou modalitats.
- **Hot path?**: Sí — cada vegada que l'usuari clica "Afegir
  partida" o "Editar" es dispara una crida. En sessions on s'afegeixen
  5-10 partides seguides, són 5-10 fetches redundants.
- **Diagnòstic**: l'autocompletar no canvia gaire entre dos modals
  consecutius; la dada és bàsicament estàtica durant la sessió.
- **Refactor proposat**:

  ```js
  let SUGG_CACHE = null;
  let SUGG_CACHE_TIME = 0;
  const CACHE_TTL_MS = 5 * 60 * 1000;

  async function carregarSuggeriments() {
      const now = Date.now();
      if (SUGG_CACHE && (now - SUGG_CACHE_TIME) < CACHE_TTL_MS) {
          SUGG_PARTIDES_TOTES = SUGG_CACHE;
          omplirDatalists();
          return;
      }
      // ... fetch existent ...
      SUGG_CACHE = SUGG_PARTIDES_TOTES;
      SUGG_CACHE_TIME = now;
  }
  ```

- **Trade-offs**: si l'usuari crea una partida amb un oponent nou
  i obre un altre modal en <5 min, no apareixerà a l'autocompletar
  fins refrescar (acceptable: el camp és lliure).
- **Guany estimat**: estalvia ~1-5 KB i ~200-500 ms cada apertura
  de modal. Notable a mòbil.
- **Esforç**: trivial.
- **Prioritat**: mitjana.

### `renderPanes` — [player.html:257-262](player.html#L257-L262)

- **Complexitat actual**: O(M · n_M) on M = modalitats. Construeix
  l'HTML de **totes** les modalitats al carregar la pàgina, encara
  que l'usuari només en mirarà una.
- **Complexitat assolible**: O(n_actual) si es renderitza només
  l'activa, i la resta sota demanda quan es clica una pestanya.
- **Hot path?**: No, és cost de càrrega inicial. Per 5 modalitats ×
  500 partides genera ~2500 files de taula + 5 charts.
- **Diagnòstic**: estratègia eager innecessària; els charts inactius
  consumeixen memòria i temps de creació.
- **Refactor proposat**: marcar panes sense renderitzar amb un
  placeholder `<div data-mod-id="X" data-rendered="false">` i a
  `activateTab(modId)`, si `data-rendered === "false"`, construir el
  contingut i el chart aleshores.
- **Trade-offs**: la primera vegada que s'obre cada pestanya pot
  haver-hi un petit "lag" (~50 ms). El primer render és més ràpid.
- **Guany estimat**: 2-5× en temps de càrrega inicial si hi ha 3+
  modalitats.
- **Esforç**: mitjà.
- **Prioritat**: baixa fins que l'usuari noti lentitud a player.html.

### `Math.max/min(...PARTIDES_DATA.map(...))` — [js/table.js:13-14](js/table.js#L13-L14)

- **Complexitat actual**: O(n) en temps, però fa **dues** passes
  separades (una per al màxim, una per al mínim) + un .map intermedi
  que crea un array temporal de mides.
- **Complexitat assolible**: O(n) en una sola passa sense array
  intermedi.
- **Hot path?**: Sí, es crida a cada `renderPartidesTable` (és a
  dir, cada carregada de tab "Partides" + cada add/edit/delete).
- **Diagnòstic**: codi clar però una mica malgastador. Per n=400 el
  cost és <1 ms, però el `Math.max(...array)` amb spread pot petar
  el call stack per n > ~100 000 en alguns runtimes (mai aquí, però
  bon costum evitar-ho).
- **Refactor proposat**:

  ```js
  let millor = -Infinity, pitjor = Infinity;
  for (const p of PARTIDES_DATA) {
      if (p.mitjana > millor) millor = p.mitjana;
      if (p.mitjana < pitjor) pitjor = p.mitjana;
  }
  ```

- **Trade-offs**: cap.
- **Guany estimat**: marginal (microsegons).
- **Esforç**: trivial.
- **Prioritat**: baixa. La versió actual és més idiomàtica.

### `updateGlobalStats` — [js/stats.js:5-129](js/stats.js#L5-L129)

- **Complexitat actual**: ~6 passes O(n) sobre `PARTIDES_DATA`
  (`reduce` per caramboles/entrades, `reduce` per millor, `reduce`
  per pitjor, `calcularEstadistiquesPunts` recorre tot, `trobarRivalMesFrequent` també,
  `calcularMitjanesPerTemporada` també, `calcularFiabilitatPerTipus` també).
  Total ~6n.
- **Complexitat assolible**: O(n) en una sola passa que omple totes
  les agregacions.
- **Hot path?**: Sí, cada `refreshAll` (canvi de període, edició,
  etc.) la crida.
- **Diagnòstic**: cada agregació viu en una funció separada (clean
  code) però recorre l'array completament.
- **Refactor proposat**: deixar-ho com està. Per n=400 el cost total
  és ~3 ms. Mantenir 6 funcions petites i clares val més que la
  unió manual.
- **Trade-offs**: si s'unifica, es perd la composabilitat de les
  funcions a `js/utils.js` (que es reutilitzen a vs.html i
  player.html).
- **Guany estimat**: 4-6× → 0.5 ms enlloc de 3 ms. Imperceptible.
- **Esforç**: mitjà.
- **Prioritat**: baixa. **No tocar fins que un profiler ho marqui.**

### `comprovarRecordatori` — [js/reminder.js:31-54](js/reminder.js#L31-L54)

- **Complexitat actual**: O(n) per trobar la data més recent
  (recorre `PARTIDES_RAW` comparant strings).
- **Complexitat assolible**: O(1) si `PARTIDES_RAW` es manté
  ordenat per data (que de fet ho està al servidor amb
  `.order('num')`, però `num` ≠ data necessàriament).
- **Hot path?**: No, es crida un cop a `init()`.
- **Diagnòstic**: fa una passa lineal innecessària, però és un cop
  per sessió.
- **Refactor proposat**: cap, el cost és <1 ms.
- **Trade-offs**: cap (no canviar res).
- **Guany estimat**: nul.
- **Esforç**: cap.
- **Prioritat**: baixa (no fer).

### `actualitzarH2H` — [js/suggestions.js:60-92](js/suggestions.js#L60-L92)

- **Complexitat actual**: O(n) per cada keystroke (filtra
  `SUGG_PARTIDES_TOTES` per nom d'oponent).
- **Complexitat assolible**: O(1) amb un índex `Map<oponent_lower, partides[]>`
  precalculat un cop per fetch.
- **Hot path?**: Sí (input event de mecanografia). Però amb n≈500 i
  un filtre simple, cada keystroke triga <2 ms. Imperceptible.
- **Diagnòstic**: clàssic exemple on un Map donaria O(1) però la
  realitat és que n és petit i el `filter` és prou ràpid.
- **Refactor proposat**: només si es detecta lag.
- **Trade-offs**: +memòria per al Map.
- **Guany estimat**: marginal.
- **Esforç**: trivial.
- **Prioritat**: baixa.

---

## Mesurament suggerit

Abans d'aplicar cap de les optimitzacions anteriors, mesura amb
**Chrome DevTools → Performance tab** (mòbil emulat amb CPU 4× slowdown):

1. **Slider drag a `index.html`**
   - Eina: gravar Performance mentre s'arrossega el slider 5 segons.
   - Mesurar: temps total dins `updateChart` per render i FPS efectiu
     durant l'arrossegada.
   - Valor esperat si tot va bé: <16 ms per frame (60 FPS), o ≤33 ms
     a CPU 4× (30 FPS).
   - Si supera 33 ms → val la pena fer el refactor de prefix sums a
     [js/chart.js:47-56](js/chart.js#L47-L56).

2. **Càrrega inicial de `player.html` amb 5 modalitats**
   - Eina: `performance.now()` al voltant de `renderPanes(modalities)`
     i `for (const m of modalities) buildChart(m)`.
   - Mesurar: temps total entre `loading` ocult i `content` visible.
   - Valor esperat: <500 ms.
   - Si supera 500 ms → lazy render de panes inactives.

3. **Refresh complet (add/edit/delete partida)**
   - Eina: `console.time('refreshAll')` envoltant la crida a
     `refreshAll()` a [js/modal.js:88](js/modal.js#L88).
   - Mesurar: temps des de submit del formulari fins a UI
     reactualitzada.
   - Valor esperat: <200 ms (la majoria és latència de Supabase).
   - Si l'await del fetch >150 ms és el coll d'ampolla, no és codi
     de l'app, és la BD.

4. **Pàgina `manage-users.html` amb 5+ usuaris**
   - Eina: DevTools Network tab.
   - Mesurar: temps de resposta del fetch a `/api/partides` (sense
     filtre) i mida en bytes.
   - Valor esperat: <50 KB i <300 ms.
   - Si supera 100 KB → crear endpoint agregat.

5. **Service Worker fetch interceptat**
   - Eina: DevTools → Application → Service Workers → "Update on reload"
     i Network tab amb "Disable cache".
   - Mesurar: latència entre `fetch` event i resposta retornada per
     `networkFirstStrategy`.
   - Valor esperat: <50 ms a cache hit, <300 ms a cache miss.
   - Si el timeout de 3 s a [sw.js:49](sw.js#L49) salta sovint
     en xarxa mòbil, baixar-lo a 1.5 s redueix latència percebuda.
