# ⚡ Solució Ràpida als Problemes Detectats

## ❌ Problemes Actuals

1. **Selector de modalitat a select-user.html** - JA SOLUCIONAT ✅
   - Eliminat el dropdown de modalitat
   - Tres Bandes es selecciona automàticament per defecte

2. **index.html carrega sempre dades de Gómez** - CAL SOLUCIONAR ⚠️
   - L'API està hardcodejada a `/api/partides/gomez`
   - No integra el sistema multi-usuari

---

## 🔧 Solució: Integrar config.js i navbar.js a index.html

Necessites afegir aquests canvis a `index.html`:

### 1. Afegir scripts al `<head>` (línia 8)

**Canviar:**
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

**Per:**
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="config.js"></script>
<script src="navbar.js"></script>
```

### 2. Canviar el títol dinàmic (línia 541-542)

**Canviar:**
```html
<h1>🎱 Estadístiques de Billar</h1>
<div style="text-align: center; color: #666; margin-top: 5px;">A. Gómez</div>
```

**Per:**
```html
<h1 id="mainTitle">🎱 Estadístiques de Billar</h1>
<div id="userSubtitle" style="text-align: center; color: #666; margin-top: 5px;"></div>
```

### 3. Modificar la funció `init()` (línia 1250)

**Canviar:**
```javascript
async function init() {
    await carregarDades();
```

**Per:**
```javascript
async function init() {
    // Verificar que hi ha usuari configurat
    const userConfig = BillarConfig.requireUser();
    if (!userConfig) return;

    // Actualitzar títol amb nom d'usuari i modalitat
    document.getElementById('mainTitle').textContent = `🎱 ${userConfig.usuariNom}`;
    document.getElementById('userSubtitle').textContent = userConfig.modalitatNom;

    await carregarDades();
```

### 4. Modificar la funció `carregarDades()` (línia 1286)

**Canviar:**
```javascript
async function carregarDades() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error carregant dades del servidor');

        PARTIDES_DATA = await response.json();
```

**Per:**
```javascript
async function carregarDades() {
    try {
        // Carregar amb la nova API utilitzant config
        PARTIDES_DATA = await BillarConfig.loadPartides();
```

### 5. Modificar la funció `guardarDadesStorage()` (línia 1319)

**Canviar:**
```javascript
async function guardarDadesStorage() {
    // Guardar al servidor
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(PARTIDES_DATA)
        });

        if (!response.ok) throw new Error('Error guardant al servidor');

        const result = await response.json();
        console.log('✅ Dades guardades al servidor:', PARTIDES_DATA.length, 'partides');
    } catch (error) {
        console.error('❌ Error guardant al servidor:', error);
        alert('⚠️ No s\'han pogut guardar les dades al servidor. Assegura\'t que el servidor està funcionant.');
    }

    // També guardar còpia local com a backup
    const data = {
        version: STORAGE_VERSION,
        lastUpdate: new Date().toISOString(),
        partides: PARTIDES_DATA
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('💾 Còpia local guardada (backup)');
}
```

**Per:**
```javascript
async function guardarDadesStorage() {
    // Guardar al servidor utilitzant BillarConfig
    const config = BillarConfig.getConfig();
    if (!config) {
        console.error('No hi ha configuració d\'usuari');
        return;
    }

    // També guardar còpia local com a backup
    const data = {
        version: STORAGE_VERSION,
        lastUpdate: new Date().toISOString(),
        usuari: config.usuariNom,
        modalitat: config.modalitatNom,
        partides: PARTIDES_DATA
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('💾 Còpia local guardada (backup)');
}
```

### 6. Modificar la funció `guardarPartida()` (línia 1454)

**Dins de la funció, després de crear l'objecte `partida`, afegir:**

```javascript
const partida = {
    num: editingIndex >= 0 ? PARTIDES_DATA[editingIndex].num : (PARTIDES_DATA.length > 0 ? Math.max(...PARTIDES_DATA.map(p => p.num)) + 1 : 1),
    data: document.getElementById('formData').value,
    lloc: document.getElementById('formLloc').value || null,
    oponent: document.getElementById('formOponent').value,
    equip: document.getElementById('formEquip').value || null,
    caramboles: caramboles,
    caramboles_oponent: carambolesOponent,
    entrades: entrades,
    mitjana: caramboles / entrades,
    mitjana_oponent: carambolesOponent / entrades,
    serie_major: serieMajor,
    url_video: urlVideo
};

// AFEGIR AQUÍ:
const config = BillarConfig.getConfig();
if (config) {
    partida.usuari_id = config.usuariId;
    partida.modalitat_id = config.modalitatId;
}
```

### 7. Després de modificar les partides, guardar amb BillarConfig

**A la funció `guardarPartida()`, canviar:**

```javascript
if (editingIndex >= 0) {
    PARTIDES_DATA[editingIndex] = partida;
} else {
    PARTIDES_DATA.push(partida);
}

// Reordenar per número de partida
PARTIDES_DATA.sort((a, b) => a.num - b.num);

await guardarDadesStorage();
```

**Per:**
```javascript
if (editingIndex >= 0) {
    // Actualitzar partida existent
    const partidaExistent = PARTIDES_DATA[editingIndex];
    await BillarConfig.updatePartida(partidaExistent.id, partida);
    PARTIDES_DATA[editingIndex] = { ...partidaExistent, ...partida };
} else {
    // Crear nova partida
    const novaPartida = await BillarConfig.savePartida(partida);
    PARTIDES_DATA.push(novaPartida);
}

// Reordenar per número de partida
PARTIDES_DATA.sort((a, b) => a.num - b.num);

await guardarDadesStorage();
```

### 8. Modificar la funció `eliminarPartida()` (línia 1494)

**Canviar:**
```javascript
async function eliminarPartida(index) {
    const partida = PARTIDES_DATA[index];
    if (confirm(`Segur que vols eliminar la partida #${partida.num} contra ${partida.oponent}?`)) {
        PARTIDES_DATA.splice(index, 1);
        await guardarDadesStorage();
        refreshAll();
        alert('✅ Partida eliminada!');
    }
}
```

**Per:**
```javascript
async function eliminarPartida(index) {
    const partida = PARTIDES_DATA[index];
    if (confirm(`Segur que vols eliminar la partida #${partida.num} contra ${partida.oponent}?`)) {
        try {
            // Eliminar amb la nova API
            if (partida.id) {
                await BillarConfig.deletePartida(partida.id);
            }

            // Eliminar de la llista local
            PARTIDES_DATA.splice(index, 1);
            await guardarDadesStorage();
            refreshAll();
            alert('✅ Partida eliminada!');
        } catch (error) {
            console.error('Error eliminant partida:', error);
            alert('Error eliminant la partida: ' + error.message);
        }
    }
}
```

---

## ✅ Després d'aplicar els canvis

1. Reinicia el servidor: `npm start`
2. Esborra el localStorage del navegador (F12 → Application → Storage → Clear site data)
3. Obre `http://localhost:3000`
4. Hauries de ser redirigit a `select-user.html`
5. Selecciona un usuari (Gómez o Chuecos)
6. Veuràs les seves partides correctament!

---

## 🤔 Alternativa Més Ràpida

Si prefereixes, puc crear un fitxer `index-v2.html` completament nou amb tots aquests canvis ja aplicats. Després només caldria:

1. Fer backup de l'actual: `mv index.html index.html.backup`
2. Renombrar el nou: `mv index-v2.html index.html`
3. Provar!

**Vols que crei el fitxer index-v2.html complet?**
