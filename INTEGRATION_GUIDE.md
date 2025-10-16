# 🔧 Guia d'Integració del Sistema Multi-Usuari

## Objectiu

Integrar el nou sistema multi-usuari i multi-modalitat a les pàgines HTML existents (`index.html`, `chuecos.html`) amb **canvis mínims**.

---

## 📝 Canvis Necessaris a index.html

### 1️⃣ Afegir els nous scripts al `<head>`

**Trobar:**
```html
<head>
    <meta charset="UTF-8">
    ...
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

**Afegir després de Chart.js:**
```html
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="config.js"></script>
    <script src="navbar.js"></script>
```

---

### 2️⃣ Modificar el títol del `<head>`

**Canviar:**
```html
<title>Estadístiques Billar - A. Gómez</title>
```

**Per:**
```html
<title>Estadístiques Billar</title>
```

---

### 3️⃣ Modificar el header H1

**Trobar:**
```html
<h1>📊 Estadístiques de Billar - A. Gómez</h1>
```

**Canviar per:**
```html
<h1 id="mainTitle">📊 Estadístiques de Billar</h1>
```

---

### 4️⃣ Modificar la funció de càrrega de partides

**Trobar la funció `carregarPartides()` o similar (on es carreguen les dades):**

```javascript
async function carregarPartides() {
    try {
        const response = await fetch('/api/partides/gomez');
        const data = await response.json();
        partides = data;
        // ...
    } catch (error) {
        // ...
    }
}
```

**Reemplaçar per:**
```javascript
async function carregarPartides() {
    try {
        // Verificar configuració d'usuari
        const config = BillarConfig.requireUser();
        if (!config) return;

        // Actualitzar títol amb nom d'usuari i modalitat
        const titleEl = document.getElementById('mainTitle');
        if (titleEl) {
            titleEl.textContent = `📊 ${config.usuariNom} - ${config.modalitatNom}`;
        }

        // Carregar partides amb la nova API
        partides = await BillarConfig.loadPartides();

        // Continuar amb la lògica existent...
        calcularEstadistiques();
        renderitzarTaula();
        actualitzarGrafics();
    } catch (error) {
        console.error('Error carregant partides:', error);
        alert('Error carregant les dades. Comprova la connexió al servidor.');
    }
}
```

---

### 5️⃣ Modificar la funció de guardar partides

**Trobar la funció que guarda partides (normalment dins d'un `guardarPartida()` o `afegirPartida()`):**

```javascript
async function guardarPartida(partida) {
    partides.push(partida);

    const response = await fetch('/api/partides/gomez', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partides)
    });
    // ...
}
```

**Reemplaçar per:**
```javascript
async function guardarPartida(partida) {
    try {
        // Utilitzar la nova API per guardar UNA partida
        const novaPartida = await BillarConfig.savePartida(partida);

        // Afegir a la llista local
        partides.push(novaPartida);

        // Recalcular estadístiques
        calcularEstadistiques();
        renderitzarTaula();
        actualitzarGrafics();

        alert('Partida guardada correctament!');
    } catch (error) {
        console.error('Error guardant partida:', error);
        alert('Error guardant la partida: ' + error.message);
    }
}
```

---

### 6️⃣ Modificar la funció d'actualitzar partida

**Trobar:**
```javascript
async function actualitzarPartida(index, partida) {
    partides[index] = partida;

    await fetch('/api/partides/gomez', {
        method: 'POST',
        body: JSON.stringify(partides)
    });
}
```

**Reemplaçar per:**
```javascript
async function actualitzarPartida(partidaId, partida) {
    try {
        // Utilitzar la nova API per actualitzar
        const partidaActualitzada = await BillarConfig.updatePartida(partidaId, partida);

        // Actualitzar a la llista local
        const index = partides.findIndex(p => p.id === partidaId);
        if (index !== -1) {
            partides[index] = partidaActualitzada;
        }

        // Recalcular
        calcularEstadistiques();
        renderitzarTaula();
        actualitzarGrafics();

        alert('Partida actualitzada correctament!');
    } catch (error) {
        console.error('Error actualitzant partida:', error);
        alert('Error actualitzant la partida: ' + error.message);
    }
}
```

---

### 7️⃣ Modificar la funció d'eliminar partida

**Trobar:**
```javascript
async function eliminarPartida(index) {
    partides.splice(index, 1);

    await fetch('/api/partides/gomez', {
        method: 'POST',
        body: JSON.stringify(partides)
    });
}
```

**Reemplaçar per:**
```javascript
async function eliminarPartida(partidaId) {
    if (!confirm('Estàs segur que vols eliminar aquesta partida?')) {
        return;
    }

    try {
        // Utilitzar la nova API per eliminar
        await BillarConfig.deletePartida(partidaId);

        // Eliminar de la llista local
        partides = partides.filter(p => p.id !== partidaId);

        // Recalcular
        calcularEstadistiques();
        renderitzarTaula();
        actualitzarGrafics();

        alert('Partida eliminada correctament!');
    } catch (error) {
        console.error('Error eliminant partida:', error);
        alert('Error eliminant la partida: ' + error.message);
    }
}
```

---

### 8️⃣ Actualitzar la funció d'exportar/importar (si existeix)

**Funció d'exportar:**
```javascript
function exportarDades() {
    const dataStr = JSON.stringify(partides, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const config = BillarConfig.getConfig();
    const fileName = `billar_${config.usuariNom}_${config.modalitatNom}_${new Date().toISOString().split('T')[0]}.json`;

    const exportLink = document.createElement('a');
    exportLink.setAttribute('href', dataUri);
    exportLink.setAttribute('download', fileName);
    exportLink.click();
}
```

**Funció d'importar (amb confirmació):**
```javascript
async function importarDades(file) {
    const reader = new FileReader();

    reader.onload = async function(e) {
        try {
            const partidesImportades = JSON.parse(e.target.result);

            if (!Array.isArray(partidesImportades)) {
                throw new Error('Format de fitxer invàlid');
            }

            if (!confirm(`Vols importar ${partidesImportades.length} partides? Això s'afegirà a les dades existents.`)) {
                return;
            }

            // Guardar en bulk
            await BillarConfig.savePartidesInBulk(partidesImportades);

            // Recarregar
            await carregarPartides();

            alert('Dades importades correctament!');
        } catch (error) {
            console.error('Error important dades:', error);
            alert('Error important les dades: ' + error.message);
        }
    };

    reader.readAsText(file);
}
```

---

## 🔄 Flux d'Execució Actualitzat

### Primer cop que s'obre l'app:

1. L'usuari accedeix a `index.html`
2. El script `navbar.js` detecta que no hi ha configuració
3. Es redirigeix automàticament a `select-user.html`
4. L'usuari selecciona usuari i modalitat
5. Es guarda la configuració al `localStorage`
6. Es redirigeix a `index.html`
7. Ara `index.html` carrega les partides de l'usuari/modalitat seleccionats

### Sessions posteriors:

1. L'usuari accedeix a `index.html`
2. El navbar detecta que hi ha configuració
3. Carrega automàticament les dades correctes
4. Mostra el navbar amb opcions per canviar usuari/modalitat

---

## 🧪 Proves Recomanades

Després d'aplicar els canvis, prova:

1. **Navegar a index.html sense configuració**
   → Hauria de redirigir a select-user.html

2. **Seleccionar un usuari i modalitat**
   → Hauria de tornar a index.html amb les dades correctes

3. **Afegir una partida nova**
   → Hauria de guardar-se a la base de dades

4. **Canviar de modalitat des del navbar**
   → Les estadístiques s'haurien de recalcular

5. **Canviar d'usuari**
   → Hauria de redirigir a select-user i carregar les dades del nou usuari

6. **Gestionar usuaris**
   → Hauria d'obrir manage-users.html

---

## ⚠️ Notes Importants

1. **Backup**: Fes una còpia de `index.html` abans de modificar-lo
   ```bash
   cp index.html index.html.backup
   ```

2. **Compatibilitat**: Les funcions `requireUser()` redirigirien automàticament si no hi ha usuari configurat

3. **Errors comuns**:
   - Si veus "BillarConfig is not defined", comprova que `config.js` estigui inclòs ABANS de `navbar.js`
   - Si el navbar no apareix, comprova que hi hagi un element amb class="container"

4. **Depuració**: Obre la consola del navegador (F12) per veure errors

---

## 📋 Checklist d'Integració

- [ ] Afegir `<script src="config.js"></script>` al head
- [ ] Afegir `<script src="navbar.js"></script>` al head
- [ ] Modificar títol dinàmic amb `id="mainTitle"`
- [ ] Actualitzar `carregarPartides()` per utilitzar `BillarConfig.loadPartides()`
- [ ] Actualitzar `guardarPartida()` per utilitzar `BillarConfig.savePartida()`
- [ ] Actualitzar `actualitzarPartida()` per utilitzar `BillarConfig.updatePartida()`
- [ ] Actualitzar `eliminarPartida()` per utilitzar `BillarConfig.deletePartida()`
- [ ] Testejar flux complet: selecció usuari → afegir partida → canviar modalitat

---

**Data:** Octubre 2025
**Versió:** 2.0 - Sistema Multi-Usuari
