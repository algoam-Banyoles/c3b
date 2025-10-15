# 🎱 Estadístiques de Billar

Aplicació web per gestionar i visualitzar estadístiques de partides de billar amb dues versions personalitzades:
- **Albert Gómez** ([index.html](index.html))
- **Chuecos** ([chuecos.html](chuecos.html))

## 📁 Estructura del Projecte

```
# 🎱 Estadístiques de Billar C3B

Aplicació web per gestionar i visualitzar estadístiques de partides de billar amb sincronització automàtica.

## ✨ Característiques

- 📊 Visualització d'estadístiques en temps real
- 📈 Gràfics d'evolució de la mitjana
- 🎯 Simulador de mitjana
- 💾 **Guardada automàtica als fitxers JSON**
- 🔄 **Sincronització automàtica entre dispositius**
- 📱 Disseny responsive (mòbil, tablet, desktop)
- 🗂️ Gestió completa de partides (crear, editar, eliminar)

## 🚀 Instal·lació i ús

### 1. Instal·lar dependències

```bash
npm install
```

### 2. Iniciar el servidor

```bash
npm start
```

El servidor s'iniciarà a `http://localhost:3000`

### 3. Obrir l'aplicació

- **Pàgina de Gómez**: http://localhost:3000
- **Pàgina de Chuecos**: http://localhost:3000/chuecos.html

## 💾 Com funciona la sincronització

1. **Quan edites una partida**: Les dades es guarden automàticament al fitxer JSON corresponent (`partides_gomez_updated.json` o `partides_chuecos_updated.json`)

2. **Quan obres l'aplicació en un altre dispositiu**: Si tens els fitxers JSON sincronitzats (per exemple, amb Git, Dropbox, o compartint la carpeta), veuràs automàticament les últimes dades

3. **Backup local**: L'aplicació també guarda una còpia al localStorage del navegador com a backup per si el servidor no està disponible

## 🌐 Accés des d'altres dispositius a la mateixa xarxa

Si vols accedir des del mòbil o tablet a la mateixa xarxa WiFi:

1. Troba la IP del teu ordinador:
   ```bash
   ipconfig
   ```
   (Busca "IPv4 Address" de la teva connexió WiFi, exemple: 192.168.1.100)

2. Des del mòbil/tablet obre:
   ```
   http://192.168.1.100:3000
   ```

## 📁 Estructura de fitxers

```
c3b/
├── index.html                      # Pàgina de Gómez
├── chuecos.html                    # Pàgina de Chuecos
├── partides_gomez_updated.json     # Dades de Gómez
├── partides_chuecos_updated.json   # Dades de Chuecos
├── server.js                       # Servidor Node.js
├── package.json                    # Configuració del projecte
└── README.md                       # Aquest fitxer
```

## 🛠️ Scripts disponibles

- `npm start` o `npm run dev`: Inicia el servidor
- `Ctrl+C`: Atura el servidor

## 📝 Notes importants

- **Els fitxers JSON s'actualitzen automàticament** quan edites, afegeixes o elimines partides
- Per sincronitzar entre dispositius diferents, comparteix la carpeta del projecte (Git, Dropbox, etc.)
- El servidor ha d'estar funcionant per poder guardar canvis als JSON
- Si el servidor no està disponible, l'aplicació utilitzarà el localStorage com a fallback

## 🐛 Solució de problemes

### El servidor no s'inicia
```bash
# Assegura't que el port 3000 no està en ús
# O canvia el port a server.js (línia 6: const PORT = 3000;)
```

### No es guarden els canvis
- Comprova que el servidor està funcionant
- Mira la consola del navegador per errors
- Verifica que tens permisos d'escriptura als fitxers JSON

### Error carregant dades
- El servidor carregarà les dades dels JSON la primera vegada
- Si els JSON no existeixen, assegura't que els tens a la carpeta

## 📄 Llicència

MIT

---

Creat amb ❤️ per a C3B Banyoles

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
