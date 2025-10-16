# 🔄 Guia de Migració al Sistema Multi-Usuari

## Què canvia?

Aquesta migració transforma l'aplicació d'un sistema d'un sol usuari a un **sistema multi-usuari amb múltiples modalitats**.

### Abans:
- Només Gómez i Chuecos (hardcoded)
- Només modalitat "Tres Bandes"
- Taules separades per cada usuari

### Després:
- ✅ **Infinits usuaris** (crear, editar, eliminar)
- ✅ **Múltiples modalitats** (Tres Bandes, Lliure, Banda, etc.)
- ✅ **Taula unificada** de partides amb relacions
- ✅ **PWA personalitzada** per usuari
- ✅ **Selecció automàtica** d'usuari en obrir l'app

---

## 📋 Pre-requisits

1. **Supabase actiu** amb les teves credencials a `.env`
2. **Node.js instal·lat** (per al servidor)
3. **Còpia de seguretat** de les dades actuals (exporta des de l'app!)

---

## 🚀 Passos de Migració

### 1️⃣ Executar el Script SQL a Supabase

1. Obre la consola de Supabase: [https://app.supabase.com](https://app.supabase.com)
2. Selecciona el teu projecte
3. Ves a **SQL Editor** (barra lateral esquerra)
4. Copia **tot el contingut** del fitxer `supabase_migration_multi_user.sql`
5. Enganxa'l a l'editor SQL
6. Clica **"Run"** per executar

**Què fa aquest script?**
- Crea les taules: `usuaris`, `modalitats`, `partides`
- Insereix usuaris per defecte: "Albert Gómez" i "Chuecos"
- Insereix modalitats: "Tres Bandes", "Lliure", "Banda"
- Migra totes les dades de `partides_gomez` → `partides` (amb usuari_id = 1)
- Migra totes les dades de `partides_chuecos` → `partides` (usuari_id = 2)
- Crea índexs per optimitzar consultes
- Configura permisos (RLS policies)

### 2️⃣ Verificar la Migració

Després d'executar el script, verifica que tot s'ha creat correctament:

```sql
-- Comprovar usuaris
SELECT * FROM usuaris;
-- Hauries de veure: Albert Gómez (id=1), Chuecos (id=2)

-- Comprovar modalitats
SELECT * FROM modalitats;
-- Hauries de veure: Tres Bandes, Lliure, Banda

-- Comprovar partides migrades
SELECT COUNT(*) FROM partides WHERE usuari_id = 1; -- Gómez (35 partides)
SELECT COUNT(*) FROM partides WHERE usuari_id = 2; -- Chuecos (100 partides)

-- Veure les primeres partides amb joins
SELECT p.num, u.nom as usuari, m.nom as modalitat, p.oponent, p.caramboles
FROM partides p
JOIN usuaris u ON p.usuari_id = u.id
JOIN modalitats m ON p.modalitat_id = m.id
ORDER BY p.id
LIMIT 10;
```

### 3️⃣ Reiniciar el Servidor

```bash
npm start
```

El servidor mostrarà els nous endpoints disponibles:

```
🎱 Servidor d'estadístiques de billar iniciat!

📊 Pàgina principal: http://localhost:3000

🆕 NOUS ENDPOINTS:
   GET    /api/usuaris              - Llistar usuaris
   POST   /api/usuaris              - Crear usuari
   ...
```

### 4️⃣ Provar la Pantalla de Selecció d'Usuari

1. Obre el navegador a: `http://localhost:3000/select-user.html`
2. Hauries de veure els 2 usuaris (Gómez i Chuecos)
3. Selecciona un usuari
4. Selecciona la modalitat "Tres Bandes"
5. Clica "Continuar"
6. L'app et redirigirà a `index.html` (que actualitzarem al següent pas)

---

## 🛠️ Resolució de Problemes

### Error: "No s'han pogut carregar usuaris"

**Solució:**
- Comprova que el servidor està funcionant (`npm start`)
- Verifica que Supabase està actiu
- Revisa les credencials al fitxer `.env`

### Error: "duplicate key value violates unique constraint"

**Solució:**
Aquest error apareix si tries executar el script múltiples vegades. El script és idempotent, però si vols reiniciar completament:

```sql
-- ATENCIÓ: Això eliminarà totes les dades!
DROP TABLE IF EXISTS partides CASCADE;
DROP TABLE IF EXISTS usuaris CASCADE;
DROP TABLE IF EXISTS modalitats CASCADE;

-- Després torna a executar el script de migració
```

### Les partides antigues no es veuen

**Solució:**
Les partides antigues estan a les taules `partides_gomez` i `partides_chuecos`. El script les copia a la nova taula `partides`. Si vols eliminar les taules antigues (opcional):

```sql
-- NOMÉS després de verificar que tot funciona correctament!
DROP TABLE IF EXISTS partides_gomez CASCADE;
DROP TABLE IF EXISTS partides_chuecos CASCADE;
```

### Error de permisos (RLS)

**Solució:**
Si tens errors de permisos, desactiva temporalment RLS per testejar:

```sql
ALTER TABLE partides DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuaris DISABLE ROW LEVEL SECURITY;
ALTER TABLE modalitats DISABLE ROW LEVEL SECURITY;
```

---

## 📊 Diagrama de la Nova Base de Dades

```
┌─────────────┐
│  usuaris    │
├─────────────┤
│ id (PK)     │
│ nom         │──┐
│ email       │  │
│ avatar_url  │  │
│ preferencies│  │
└─────────────┘  │
                 │
┌─────────────┐  │   ┌─────────────┐
│ modalitats  │  │   │  partides   │
├─────────────┤  │   ├─────────────┤
│ id (PK)     │──┼──→│ id (PK)     │
│ nom         │  │   │ usuari_id   │←─┘
│ descripcio  │  │   │ modalitat_id│
└─────────────┘  └──→│ num         │
                     │ data        │
                     │ lloc        │
                     │ oponent     │
                     │ caramboles  │
                     │ ...         │
                     └─────────────┘
```

---

## 🎯 Proper Pas

Un cop completada la migració, actualitzarem els fitxers HTML principals (`index.html`, `chuecos.html`) per utilitzar el nou sistema.

---

## ❓ Dubtes?

Si tens algun problema durant la migració:

1. Comprova els logs del servidor (`npm start`)
2. Revisa la consola del navegador (F12 → Console)
3. Verifica que Supabase estigui operatiu
4. Contacta amb el desenvolupador

---

**Data de creació:** Octubre 2025
**Versió:** 2.0 - Sistema Multi-Usuari
