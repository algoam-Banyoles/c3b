# 🗄️ Configuració de Supabase - Guia Pas a Pas

## ✅ Pas 1: Crear les taules a Supabase

1. Ves a: https://supabase.com/dashboard/project/unocmdvjuncqnzscrypg/sql

2. Copia i enganxa tot el contingut del fitxer `supabase_setup.sql`

3. Clica "Run" per executar l'SQL

Això crearà:
- ✅ Taula `partides_gomez`
- ✅ Taula `partides_chuecos`
- ✅ Índexs per optimitzar consultes
- ✅ Row Level Security (RLS) amb polítiques obertes
- ✅ Triggers per actualitzar `updated_at` automàticament

---

## ✅ Pas 2: Migrar les dades dels JSON a Supabase

Un cop creades les taules, executa:

```bash
npm run migrate
```

Aquest script:
1. Llegeix els fitxers JSON (`partides_gomez_updated.json` i `partides_chuecos_updated.json`)
2. Neteja les dades buides
3. Les puja a Supabase
4. Verifica que tot s'ha pujat correctament

**Espera't aquesta sortida:**
```
🚀 Iniciant migració de dades a Supabase...
📋 Creant taules...
⚠️  Executa aquest SQL manualment al SQL Editor de Supabase:
    https://supabase.com/dashboard/project/unocmdvjuncqnzscrypg/sql

Prem Enter quan hagis executat el SQL...
```

Prem Enter després d'executar l'SQL, i veuràs:

```
📊 Migrant dades de Gómez...
✅ 35 partides de Gómez migrades correctament
📊 Migrant dades de Chuecos...
✅ 33 partides de Chuecos migrades correctament

🔍 Verificant dades...

📊 Resum:
   - Partides de Gómez a Supabase: 35
   - Partides de Chuecos a Supabase: 33

✅ Migració completada amb èxit!
```

---

## ✅ Pas 3: Provar localment

```bash
npm start
```

Obre http://localhost:3000 i prova:
- ✅ Veure les partides (carregades des de Supabase)
- ✅ Editar una partida (es guarda a Supabase)
- ✅ Afegir una nova partida (es guarda a Supabase)
- ✅ Eliminar una partida (s'elimina de Supabase)

---

## ✅ Pas 4: Configurar variables d'entorn a Vercel

1. Ves a: https://vercel.com/dashboard
2. Selecciona el projecte `c3b`
3. Settings → Environment Variables
4. Afegeix aquestes variables:

**Variable 1:**
- Name: `SUPABASE_URL`
- Value: `https://unocmdvjuncqnzscrypg.supabase.co`

**Variable 2:**
- Name: `SUPABASE_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVub2NtZHZqdW5jcW56c2NyeXBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1Mjc4NjIsImV4cCI6MjA3NjEwMzg2Mn0.nhPnwBRKkxL9re3Ik99frloldzf8MNtYszsQo2OkyiE`

5. Marca totes per Production, Preview, i Development

---

## ✅ Pas 5: Desplegar a Vercel

```bash
vercel --prod
```

O si ja tens el projecte connectat a Git:
```bash
git add .
git commit -m "Migració a Supabase"
git push
```

Vercel desplegarà automàticament!

---

## 🎉 Resultat Final

Ara tens:
- ✅ **Dades a Supabase** (base de dades real PostgreSQL)
- ✅ **Sincronització automàtica** entre tots els dispositius
- ✅ **Funciona a Vercel** sense problemes de només lectura
- ✅ **Backup automàtic** a Supabase (amb historial de canvis)
- ✅ **Dashboard web** per veure/editar dades: https://supabase.com/dashboard/project/unocmdvjuncqnzscrypg/editor

---

## 📊 Veure les dades a Supabase

1. Ves a: https://supabase.com/dashboard/project/unocmdvjuncqnzscrypg/editor
2. Selecciona `partides_gomez` o `partides_chuecos`
3. Pots veure, editar i filtrar totes les partides!

---

## 🔧 Scripts disponibles

```bash
npm start          # Iniciar servidor local
npm run migrate    # Migrar dades dels JSON a Supabase
vercel --prod      # Desplegar a producció
```

---

## ⚠️ Important

Els fitxers JSON (`partides_*_updated.json`) ja no s'utilitzen per guardar dades.
Ara tot es guarda a Supabase! Pots mantenir els JSON com a backup si vols.

---

## 🐛 Solució de problemes

### Error: "relation partides_gomez does not exist"
👉 No has executat l'SQL del Pas 1. Executa `supabase_setup.sql` a Supabase.

### Error: "Invalid API key"
👉 Comprova que les variables d'entorn (`SUPABASE_URL` i `SUPABASE_KEY`) siguin correctes.

### No es carreguen les dades
👉 Executa `npm run migrate` per pujar les dades a Supabase.

---

**Fet amb ❤️ per C3B Banyoles**
