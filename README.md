# 🎱 Estadístiques de Billar

Aplicació web per gestionar i visualitzar estadístiques de partides de billar amb dues versions personalitzades:
- **Albert Gómez** ([index.html](index.html))
- **Chuecos** ([chuecos.html](chuecos.html))

## 📁 Estructura del Projecte

```
c3b/
├── index.html                          # App principal (Albert Gómez)
├── chuecos.html                        # App personalitzada (Chuecos)
├── sw.js                               # Service Worker (PWA + Cache)
├── manifest.json                       # Manifest PWA
│
├── BILLAR (1).xlsx                     # Dades font de Chuecos (100 partides)
├── Partides.xlsx                       # Dades font de Gomez (35 partides)
│
├── partides_chuecos_updated.json       # Dades processades de Chuecos
├── partides_gomez_updated.json         # Dades processades de Gomez
│
├── process_excel_data.py               # Script per processar Excels → JSON
└── README.md                           # Aquest fitxer
```

## ✨ Funcionalitats

### 📊 Visualització
- **Gràfic d'evolució** de la mitjana per grups de 15 partides
- **Estadístiques globals**: mitjana general, total caramboles, entrades, etc.
- **Millor/Pitjor partida**: targetes destacades amb gradient verd/vermell
- **Taula completa** amb totes les partides ordenades

### 📝 Gestió de Partides
- ➕ **Afegir** noves partides amb formulari complet
- ✏️ **Editar** partides existents
- 🗑️ **Eliminar** partides
- Camps disponibles:
  - Data, lloc, oponent, equip
  - Caramboles (pròpies i oponent)
  - Entrades
  - **Sèrie Major** (nou camp!)
  - **URL Vídeo** (nou camp!) - enllaç a gravacions de YouTube/altres

### 📋 Taula de Partides
Mostra per cada partida:
- Número, data, oponent
- Caramboles pròpies i oponent
- Entrades i sèrie major
- Mitjana (destacada en verd/vermell si és millor/pitjor)
- Resultat (✅ victòria / 🟰 empat / ❌ derrota)
- 🎥 Enllaç al vídeo (si existeix)
- Accions (editar/eliminar)

### 🎯 Simulador
Preveu com canviarà la mitjana amb la propera partida introduint caramboles i entrades hipotètiques.

### 💾 Dades
- **Emmagatzematge local** (localStorage) - les dades es guarden al navegador
- **Exportar/Importar** dades en format JSON
- **Hard Reset** per tornar a les dades inicials
- Separació de dades entre index.html i chuecos.html (diferents localStorage keys)

### 📱 PWA (Progressive Web App)
- **Instal·lable** com a aplicació nativa
- **Funciona offline** gràcies al Service Worker
- **Optimitzat per mòbil** - responsive design

## 🚀 Tecnologies

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Gràfics**: Chart.js
- **Emmagatzematge**: localStorage API
- **PWA**: Service Worker API, Cache API
- **Estil**: Gradient blau modern, disseny responsive
- **Processament de dades**: Python + pandas

## 🔧 Processament de Dades

Per actualitzar les dades des dels fitxers Excel:

```bash
python process_excel_data.py
```

Aquest script:
1. Llegeix `BILLAR (1).xlsx` → genera `partides_chuecos_updated.json`
2. Llegeix `Partides.xlsx` → genera `partides_gomez_updated.json`
3. Processa camps especials:
   - Format "24-30" per caramboles (Chuecos)
   - Decimals amb comes
   - URLs de vídeo (Gomez)
   - Sèrie major (Chuecos)

## 🎨 Disseny

- **Colors principals**: Blaus (#2563eb, #3b82f6, #1e3a8a)
- **Gràfics**: Verd (#10b981) per mitjana partida, blau (#2563eb) per acumulada
- **Targetes**: Gradient blau amb ombres suaus
- **Millor/Pitjor**: Gradients verd/vermell
- **Responsive**: Grid adaptatiu per mòbil/tauleta/escriptori

## 📝 Diferències entre Versions

| Característica | index.html (Gomez) | chuecos.html (Chuecos) |
|----------------|-------------------|------------------------|
| Partides inicials | 35 | 100 |
| Sèrie major | ❌ (null) | ✅ (des d'Excel) |
| URLs vídeo | ✅ (des d'Excel) | ❌ (null inicial) |
| localStorage key | `billar_partides_data` | `billar_chuecos_partides_data` |
| Títol | Albert Gómez | Chuecos |

## 🔄 Service Worker

El fitxer [sw.js](sw.js) gestiona:
- **Estratègies de cache**:
  - Network First per recursos locals (sempre actualitzat)
  - Cache First per recursos externs/CDN (optimització)
- **Versionat automàtic** per actualitzacions
- **Neteja de caches antigues**
- **Timeout de xarxa** (3 segons)
- **Missatges bidireccionals** per control des del client

## 📱 Compatibilitat

- ✅ Safari (iOS/macOS)
- ✅ Chrome (Android/Windows/macOS)
- ✅ Firefox
- ✅ Edge
- ✅ Opera

## 🛠️ Desenvolupament Local

1. Clonar el repositori
2. Obrir amb un servidor local:
   ```bash
   python -m http.server 8000
   ```
3. Navegar a `http://localhost:8000`

**Important**: No obrir directament el fitxer HTML (file://), ja que el Service Worker no funcionarà.

## 📊 Format de Dades JSON

```json
{
  "num": 1,
  "data": "2024-04-12",
  "lloc": "Sants",
  "oponent": "Albert Garcia",
  "equip": "C. B. Banyoles",
  "caramboles": 30,
  "caramboles_oponent": 12,
  "entrades": 41,
  "mitjana": 0.7317,
  "mitjana_oponent": 0.2927,
  "serie_major": 5,
  "url_video": "https://youtube.com/..."
}
```

## 🤝 Contribucions

Aquest és un projecte personal d'estadístiques. Si trobes errors o tens suggeriments, pots obrir un issue.

---

Creat amb ❤️ per a la gestió d'estadístiques de billar a tres bandes
