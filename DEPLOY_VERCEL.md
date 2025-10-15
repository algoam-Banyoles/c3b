# 🚀 Guia de Desplegament a Vercel

## 📋 Pas a Pas

### 1. Instal·lar Vercel CLI (si no la tens)

```bash
npm install -g vercel
```

### 2. Login a Vercel

```bash
vercel login
```

Segueix les instruccions per autenticar-te.

### 3. Desplegar el projecte

Des de la carpeta del projecte:

```bash
vercel
```

Respon les preguntes:
- **Set up and deploy?** → Yes
- **Which scope?** → Selecciona el teu compte
- **Link to existing project?** → No
- **Project name?** → c3b (o el nom que vulguis)
- **Directory?** → `.` (directori actual)
- **Override settings?** → No

### 4. Desplegar a producció

```bash
vercel --prod
```

Et donarà una URL tipus: `https://c3b.vercel.app`

---

## ⚙️ Configuració automàtica

He creat un fitxer `vercel.json` que configura automàticament:
- ✅ API endpoints (`/api/partides/gomez` i `/api/partides/chuecos`)
- ✅ Fitxers estàtics (HTML, JSON)
- ✅ CORS activat
- ✅ Rutes correctes

---

## 🔄 Actualitzar desplegament

Cada vegada que facis canvis:

```bash
git add .
git commit -m "Actualització"
git push
vercel --prod
```

O simplement:

```bash
vercel --prod
```

---

## 🌐 Configurar domini personalitzat (opcional)

1. Ves a https://vercel.com/dashboard
2. Selecciona el projecte `c3b`
3. Settings → Domains
4. Afegeix el teu domini

---

## ⚠️ IMPORTANT sobre Vercel

### Limitacions del sistema de fitxers

⚠️ **Vercel té un sistema de fitxers de només lectura** en producció!

Això significa que **NO es poden modificar els fitxers JSON directament** a Vercel.

### Solucions:

#### Opció A: Base de dades gratuïta (RECOMANAT)
Utilitzar Vercel KV (Redis) o Vercel Postgres (gratuït):
- ✅ Gratuït fins a 256MB
- ✅ Persistència de dades real
- ✅ Molt ràpid

#### Opció B: GitHub com a base de dades
Guardar els JSON directament a GitHub via API:
- ✅ Totalment gratuït
- ✅ Historial de canvis
- ❌ Més lent

#### Opció C: Supabase (Base de dades PostgreSQL gratuïta)
- ✅ 500MB gratuïts
- ✅ Molt ràpid
- ✅ API REST automàtica

---

## 🎯 Recomanació

Per al teu cas, et recomano **Opció A: Vercel KV** perquè:
1. És gratuït
2. És super ràpid
3. S'integra perfectament amb Vercel
4. Només cal modificar lleugerament el codi

Vols que t'ajudi a implementar Vercel KV? És molt senzill! 🚀

---

## 📝 Alternativa: Desplegament híbrid

### Frontend → Vercel (gratuït)
- `index.html` i `chuecos.html` estàtics

### Backend → Railway/Render (gratuït)
- API Node.js que guarda als JSON

Aquesta seria la solució més simple sense base de dades.

---

## 🛠️ Scripts útils

```bash
# Desenvolupament local
npm start

# Desplegar a preview
vercel

# Desplegar a producció
vercel --prod

# Veure logs
vercel logs
```

---

Digues-me quina opció prefereixes i t'ajudo a implementar-la! 🎱
