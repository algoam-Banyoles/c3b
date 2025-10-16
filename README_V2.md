# 🎱 Estadístiques Billar - Versió 2.0 Multi-Usuari

> Aplicació web progressiva (PWA) per registrar i analitzar estadístiques de billar amb suport multi-usuari i múltiples modalitats.

---

## 🆕 Què hi ha de nou a la v2.0?

### Funcionalitats Principals

✅ **Sistema Multi-Usuari**
- Crear usuaris infinits
- Cada usuari té el seu propi perfil i estadístiques
- Gestió completa d'usuaris (crear, editar, eliminar)

✅ **Múltiples Modalitats**
- Tres Bandes (billar carambola)
- Lliure (sense bandes obligatòries)
- Banda (una banda obligatòria)
- Extensible a futures modalitats

✅ **PWA Personalitzada**
- Selecció automàtica d'usuari en obrir l'app
- La configuració es guarda al dispositiu
- Funciona offline amb dades en caché

✅ **Base de Dades al Núvol**
- Supabase (PostgreSQL)
- Sincronització automàtica entre dispositius
- API REST completa

✅ **Interfície Millorada**
- Navbar amb selector d'usuari i modalitat
- Pantalla de benvinguda per primer ús
- Pàgina d'administració d'usuaris
- Responsive i mobile-first

---

## 📁 Estructura del Projecte

```
c3b/
├── 📄 Frontend
│   ├── index.html                          # Pàgina principal (a actualitzar)
│   ├── select-user.html                    # Pantalla de selecció d'usuari (NOU)
│   ├── manage-users.html                   # Gestió d'usuaris (NOU)
│   ├── config.js                           # Llibreria de configuració (NOU)
│   ├── navbar.js                           # Component navbar (NOU)
│   └── chuecos.html                        # Versió alternativa (legacy)
│
├── 🔧 Backend
│   ├── server.js                           # API Express actualitzada
│   ├── supabase.js                         # Client Supabase
│   └── vercel.json                         # Config deployment
│
├── 💾 Base de Dades
│   ├── supabase_setup.sql                  # Schema original (legacy)
│   ├── supabase_migration_multi_user.sql   # Migració v2.0 (NOU)
│   └── migrate.js                          # Script de migració
│
├── 📚 Documentació
│   ├── README_V2.md                        # Aquest fitxer (NOU)
│   ├── USER_GUIDE_V2.md                    # Guia d'usuari (NOU)
│   ├── MIGRATION_GUIDE.md                  # Guia de migració SQL (NOU)
│   ├── INTEGRATION_GUIDE.md                # Guia d'integració HTML (NOU)
│   ├── DEPLOY_VERCEL.md                    # Deployment guide
│   └── SUPABASE_SETUP.md                   # Setup Supabase
│
├── 🎨 PWA
│   ├── manifest.json                       # Manifest actualitzat
│   └── sw.js                               # Service Worker
│
└── 📦 Config
    ├── package.json
    ├── .env.example
    └── .gitignore
```

---

## 🚀 Instal·lació i Configuració

### 1. Prerequisits

- **Node.js** (v16 o superior)
- **npm** o **yarn**
- Compte de **Supabase** (gratuït)

### 2. Clonar el Repositori

```bash
git clone <url-del-repo>
cd c3b
```

### 3. Instal·lar Dependències

```bash
npm install
```

### 4. Configurar Variables d'Entorn

Copia `.env.example` a `.env` i omple les credencials:

```bash
cp .env.example .env
```

Edita `.env`:

```env
SUPABASE_URL=https://el-teu-projecte.supabase.co
SUPABASE_KEY=la-teva-clau-publica-anon
```

### 5. Executar la Migració SQL

1. Obre [Supabase Dashboard](https://app.supabase.com)
2. Ves a **SQL Editor**
3. Copia i enganxa el contingut de `supabase_migration_multi_user.sql`
4. Executa l'script (Run)

Això crearà:
- Taules: `usuaris`, `modalitats`, `partides`
- Usuaris per defecte: Albert Gómez, Chuecos
- Modalitats: Tres Bandes, Lliure, Banda
- Migració de dades antigues

### 6. Iniciar el Servidor

```bash
npm start
```

El servidor s'iniciarà a `http://localhost:3000`

---

## 🎯 Ús de l'Aplicació

### Primera Vegada

1. Obre `http://localhost:3000` al navegador
2. Seràs redirigit a `select-user.html`
3. Selecciona un usuari (o crea'n un de nou)
4. Selecciona la modalitat
5. Clica "Continuar"
6. Ja pots començar a registrar partides!

### Sessions Posteriors

L'app recordarà el teu usuari i modalitat. Només caldrà obrir-la i ja estarà llesta.

### Canviar d'Usuari

Clica el botó **"🔄 Canviar Usuari"** a la navbar superior.

### Canviar de Modalitat

Utilitza el dropdown **"Modalitat"** a la navbar per canviar entre Tres Bandes, Lliure, etc.

### Gestionar Usuaris

Clica **"👤 Gestionar Usuaris"** per crear, editar o eliminar usuaris.

---

## 🔌 API Endpoints

### Usuaris

```
GET    /api/usuaris              # Llistar tots els usuaris
POST   /api/usuaris              # Crear nou usuari
PUT    /api/usuaris/:id          # Actualitzar usuari
DELETE /api/usuaris/:id          # Eliminar usuari
```

### Modalitats

```
GET    /api/modalitats           # Llistar modalitats
POST   /api/modalitats           # Crear modalitat
```

### Partides

```
GET    /api/partides             # Llistar partides (amb filtres)
                                 # Query params: ?usuari_id=1&modalitat_id=2
POST   /api/partides             # Crear partida
PUT    /api/partides/:id         # Actualitzar partida
DELETE /api/partides/:id         # Eliminar partida
POST   /api/partides/bulk        # Crear múltiples partides
```

### Legacy (Compatibilitat)

```
GET    /api/partides/gomez       # Partides de Gómez
GET    /api/partides/chuecos     # Partides de Chuecos
```

---

## 📊 Esquema de Base de Dades

### Taula: `usuaris`

| Camp         | Tipus     | Descripció              |
|--------------|-----------|-------------------------|
| id           | SERIAL    | Clau primària           |
| nom          | TEXT      | Nom de l'usuari         |
| email        | TEXT      | Email (opcional)        |
| avatar_url   | TEXT      | URL avatar (opcional)   |
| preferencies | JSONB     | Preferències JSON       |
| created_at   | TIMESTAMP | Data de creació         |
| updated_at   | TIMESTAMP | Última actualització    |

### Taula: `modalitats`

| Camp                 | Tipus     | Descripció              |
|----------------------|-----------|-------------------------|
| id                   | SERIAL    | Clau primària           |
| nom                  | TEXT      | Nom de la modalitat     |
| descripcio           | TEXT      | Descripció              |
| camps_personalitzats | JSONB     | Camps extra (futurs)    |
| created_at           | TIMESTAMP | Data de creació         |

### Taula: `partides`

| Camp               | Tipus      | Descripció                   |
|--------------------|------------|------------------------------|
| id                 | SERIAL     | Clau primària                |
| usuari_id          | INTEGER    | FK → usuaris(id)             |
| modalitat_id       | INTEGER    | FK → modalitats(id)          |
| num                | INTEGER    | Número de partida            |
| data               | DATE       | Data de la partida           |
| lloc               | TEXT       | Lloc on es va jugar          |
| oponent            | TEXT       | Nom del rival                |
| equip              | TEXT       | Equip/club del rival         |
| competicio         | TEXT       | Tipus de competició          |
| caramboles         | INTEGER    | Caràmboles pròpies           |
| caramboles_oponent | INTEGER    | Caràmboles del rival         |
| entrades           | INTEGER    | Nombre d'entrades            |
| mitjana            | DECIMAL    | Mitjana pròpia               |
| mitjana_oponent    | DECIMAL    | Mitjana del rival            |
| serie_major        | INTEGER    | Millor sèrie (opcional)      |
| url_video          | TEXT       | URL vídeo YouTube (opcional) |
| created_at         | TIMESTAMP  | Data de creació              |
| updated_at         | TIMESTAMP  | Última actualització         |

**Constraint:** `UNIQUE(usuari_id, modalitat_id, num)`

---

## 🧪 Testing

### Test Manual

1. **Selecció d'usuari:**
   - Obre l'app sense configuració
   - Hauria de redirigir a `select-user.html`
   - Selecciona un usuari i modalitat
   - Hauria de redirigir a `index.html`

2. **Afegir partida:**
   - Clica "Afegir Partida"
   - Omple el formulari
   - Guarda
   - Comprova que apareix a la taula i les estadístiques es recalculen

3. **Canviar modalitat:**
   - Canvia de modalitat al navbar
   - Les estadístiques s'haurien de recalcular per la nova modalitat

4. **Gestionar usuaris:**
   - Ves a "Gestionar Usuaris"
   - Crea un nou usuari
   - Edita un usuari existent
   - Elimina un usuari (amb confirmació)

5. **Persistència:**
   - Tanca el navegador
   - Torna a obrir l'app
   - Hauria de recordar l'usuari i modalitat

### Test amb SQL

Comprova que les dades s'han migrat correctament:

```sql
-- Comptar usuaris
SELECT COUNT(*) FROM usuaris;  -- Ha de ser >= 2

-- Comptar modalitats
SELECT COUNT(*) FROM modalitats;  -- Ha de ser >= 3

-- Comptar partides de Gómez
SELECT COUNT(*) FROM partides WHERE usuari_id = 1;  -- ~35

-- Comptar partides de Chuecos
SELECT COUNT(*) FROM partides WHERE usuari_id = 2;  -- ~100
```

---

## 🚢 Deployment

### Vercel (Recomanat)

1. Connecta el repositori a Vercel
2. Afegeix les variables d'entorn:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
3. Deploy!

### Netlify

1. Connecta el repositori
2. Build command: `npm run build` (si cal)
3. Publish directory: `./`
4. Afegeix variables d'entorn

### Render / Railway

Similar a Vercel. Consulta `DEPLOY_VERCEL.md` per més detalls.

---

## 🛠️ Migració des de v1.0

Si ja tens l'aplicació funcionant amb Gómez i Chuecos:

1. **Fes backup** de les dades actuals (exporta des de l'app)
2. Executa el script SQL: `supabase_migration_multi_user.sql`
3. Actualitza els fitxers: `server.js`, `config.js`, `navbar.js`
4. Integra els canvis a `index.html` (segueix `INTEGRATION_GUIDE.md`)
5. Reinicia el servidor
6. Verifica que les dades s'han migrat correctament

**Les taules antigues NO s'eliminen automàticament** per seguretat.

---

## 📖 Documentació Completa

- **[USER_GUIDE_V2.md](USER_GUIDE_V2.md)** - Guia detallada per als usuaris finals
- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Guia per executar la migració SQL
- **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** - Com integrar el nou sistema a index.html
- **[DEPLOY_VERCEL.md](DEPLOY_VERCEL.md)** - Deployment a Vercel
- **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** - Configuració inicial de Supabase

---

## 🐛 Problemes Comuns

### Error: "No hi ha usuari configurat"

**Solució:** Ves a `select-user.html` i selecciona un usuari.

### Les partides no es carreguen

**Solució:**
1. Comprova que el servidor està funcionant
2. Revisa les credencials de Supabase al `.env`
3. Comprova la consola del navegador (F12)

### "BillarConfig is not defined"

**Solució:** Assegura't que `config.js` està inclòs ABANS de `navbar.js` al HTML.

---

## 🔮 Roadmap

- [ ] Comparació entre usuaris amb gràfics
- [ ] Estadístiques avançades (percentatges, tendències)
- [ ] Exportar a PDF
- [ ] Mode fosc
- [ ] Notificacions push
- [ ] App mòbil nativa (React Native/Flutter)
- [ ] Suport multiidioma

---

## 🤝 Contribucions

Les contribucions són benvingudes! Si vols afegir funcionalitats:

1. Fes un fork del repositori
2. Crea una branca: `git checkout -b feature/nova-funcionalitat`
3. Commit: `git commit -m 'Afegir nova funcionalitat'`
4. Push: `git push origin feature/nova-funcionalitat`
5. Obre un Pull Request

---

## 📄 Llicència

Aquest projecte és de codi obert. Consulta el fitxer LICENSE per més detalls.

---

## 💬 Contacte

Per dubtes o suggeriments, obre un issue al repositori o contacta amb l'equip de desenvolupament.

---

**Versió:** 2.0.0
**Data:** Octubre 2025
**Tecnologies:** HTML5, CSS3, JavaScript (Vanilla), Node.js, Express, Supabase, Chart.js

---

**Gaudeix registrant les teves millors partides de billar! 🎱🎯**
