# 📖 Guia d'Usuari - Billar Stats v2.0

## Benvingut al Sistema Multi-Usuari!

Aquesta versió permet que **múltiples jugadors** facin servir la mateixa aplicació i **registrin partides en diferents modalitats** de billar (Tres Bandes, Lliure, Banda, etc.).

---

## 🎯 Novetats de la Versió 2.0

✅ **Múltiples usuaris**: Cada jugador té el seu propi perfil
✅ **Múltiples modalitats**: Tres Bandes, Lliure, Banda...
✅ **Selecció automàtica**: L'app recorda qui ets
✅ **Gestió d'usuaris**: Crea, edita i elimina usuaris
✅ **Comparació futura**: Preparada per comparar jugadors
✅ **Base de dades al núvol**: Sincronització automàtica

---

## 🚀 Primer Ús

### Pas 1: Obre l'aplicació

Accedeix a l'aplicació des del teu navegador:
- **Local**: `http://localhost:3000`
- **Producció**: La teva URL de Vercel/Netlify

### Pas 2: Selecciona o crea el teu usuari

La primera vegada que obris l'app, veuràs una **pantalla de benvinguda**:

```
┌────────────────────────────────┐
│     🎱 Billar Stats            │
│  Selecciona el teu usuari      │
├────────────────────────────────┤
│  📋 Usuaris Disponibles:       │
│  • Albert Gómez                │
│  • Chuecos                     │
│                                │
│  Modalitat: [Tres Bandes ▼]   │
│                                │
│  [Continuar →]                 │
│                                │
│  O bé                          │
│  [➕ Crear Nou Usuari]         │
└────────────────────────────────┘
```

**Opcions:**

1. **Si ja tens un usuari**: Clica sobre el teu nom → Selecciona modalitat → Continuar
2. **Si ets nou**: Clica "Crear Nou Usuari" → Introdueix el teu nom → Continuar

### Pas 3: Comença a registrar partides!

Un cop seleccionat l'usuari, accediràs a la **pàgina principal** amb les teves estadístiques.

---

## 📊 Pàgina Principal

### Barra de Navegació (Navbar)

A la part superior veuràs:

```
🎱 Albert Gómez | Modalitat: [Tres Bandes ▼] | [👤 Gestionar Usuaris] [🔄 Canviar Usuari]
```

**Controls:**

- **Modalitat**: Canvia entre Tres Bandes, Lliure, Banda, etc.
- **Gestionar Usuaris**: Obre la pàgina d'administració d'usuaris
- **Canviar Usuari**: Torna a la pantalla de selecció per canviar de jugador

### Estadístiques

Veuràs les teves estadístiques personalitzades:

- **Total de partides** jugades (a la modalitat actual)
- **Mitjana general**
- **Mitjana recent** (últimes 15 partides)
- **Millor/Pitjor partida**
- **Victòries/Empats/Derrotes**

### Gràfics

- **Evolució de la mitjana**: Veure com progressa la teva mitjana amb el temps
- **Simulador**: Predir futures mitjanes afegint partides hipotètiques

### Taula de Partides

Llista completa de totes les teves partides amb:
- Número
- Data
- Lloc
- Oponent
- Equip
- Competició
- Caràmboles (teves i del rival)
- Entrades
- Mitjana
- Sèrie major
- Vídeo (si n'hi ha)

**Accions:**
- **✏️ Editar**: Modificar una partida existent
- **🗑️ Eliminar**: Esborrar una partida

---

## ➕ Afegir una Nova Partida

1. Clica el botó **"➕ Afegir Partida"**
2. Omple el formulari:
   - **Data**: Quan es va jugar
   - **Lloc**: On es va jugar (ex: Banyoles)
   - **Oponent**: Nom del rival
   - **Equip**: Club o equip del rival
   - **Competició**: Lliga, torneig, amistós...
   - **Les teves caràmboles**
   - **Caràmboles del rival**
   - **Entrades**: Nombre de torns totals
   - **Sèrie major**: (opcional) Millor sèrie de la partida
   - **URL del vídeo**: (opcional) Enllaç a YouTube

3. Clica **"Guardar"**
4. La partida s'afegeix automàticament i les estadístiques es recalculen

---

## 🔄 Canviar de Modalitat

Si vols veure les teves estadístiques en una altra modalitat:

1. A la barra superior, clica el **dropdown de Modalitat**
2. Selecciona la modalitat desitjada (ex: "Lliure")
3. **Confirma** el canvi
4. Les estadístiques es recalcularan automàticament per la nova modalitat

**Nota:** Cada modalitat té les seves pròpies partides independents.

---

## 👤 Gestionar Usuaris

### Accedir a Gestió d'Usuaris

Clica el botó **"👤 Gestionar Usuaris"** a la navbar.

### Crear un Nou Usuari

1. Clica **"➕ Nou Usuari"**
2. Introdueix:
   - **Nom** (obligatori)
   - **Email** (opcional)
3. Clica **"Crear i Continuar"**
4. El nou usuari apareixerà a la llista

### Editar un Usuari

1. Busca l'usuari a la llista
2. Clica **"✏️ Editar"**
3. Modifica les dades
4. Clica **"Guardar"**

### Eliminar un Usuari

1. Busca l'usuari a la llista
2. Clica **"🗑️ Eliminar"**
3. **ATENCIÓ**: Si l'usuari té partides registrades, també s'eliminaran!
4. Confirma l'eliminació

---

## 🔄 Canviar d'Usuari

Si vols canviar al perfil d'un altre jugador:

1. Clica **"🔄 Canviar Usuari"** a la navbar
2. Selecciona el nou usuari
3. Selecciona la modalitat
4. Clica **"Continuar"**
5. Veuràs les estadístiques del nou usuari

---

## 💾 Exportar i Importar Dades

### Exportar Partides

1. Ves a la secció **"Gestió de Dades"** (pestanya)
2. Clica **"Exportar JSON"**
3. Es descarregarà un fitxer amb totes les teves partides
4. Nom del fitxer: `billar_[NomUsuari]_[Modalitat]_[Data].json`

**Útil per:**
- Fer còpies de seguretat
- Compartir dades amb altres dispositius
- Anàlisi de dades externes

### Importar Partides

1. Ves a la secció **"Gestió de Dades"**
2. Clica **"Importar JSON"**
3. Selecciona un fitxer JSON prèviament exportat
4. Confirma la importació
5. Les partides s'afegiran a les teves dades actuals

**Nota:** La importació **NO** elimina les partides existents, les afegeix.

---

## 🔒 Privacitat i Seguretat

### Qui veu les meves dades?

Per defecte, **tots els usuaris poden veure les partides de tothom**.

Això permet:
- Comparar estadístiques entre jugadors
- Veure com estan jugant els companys
- Futures funcions de comparació

**En futures versions** es podrà configurar la privacitat per usuari.

### On es guarden les dades?

- **Al núvol**: Supabase (PostgreSQL) - sincronització automàtica
- **Al navegador**: localStorage com a còpia de seguretat local

### Puc eliminar les meves dades?

Sí! Tens 3 opcions:

1. **Eliminar partides individuals**: Des de la taula de partides
2. **Netejar totes les partides**: Botó "Netejar Totes les Dades" (amb confirmació doble)
3. **Eliminar el teu usuari**: Des de "Gestionar Usuaris" (elimina usuari i partides)

---

## 📱 Instal·lar l'App (PWA)

### Android

1. Obre l'app al navegador (Chrome recomanat)
2. Toca el **menú** (⋮) > **"Afegir a la pantalla d'inici"**
3. Confirma la instal·lació
4. L'app apareixerà com una icona al teu mòbil

### iPhone / iPad

1. Obre l'app al Safari
2. Toca la icona de **"Compartir"** (quadrat amb fletxa)
3. Selecciona **"Afegir a la pantalla d'inici"**
4. Confirma

### Desktop (Chrome, Edge, Brave...)

1. Obre l'app al navegador
2. Veuràs una icona d'instal·lació a la barra d'adreces
3. Clica **"Instal·lar"**
4. L'app s'obrirà en una finestra independent

**Avantatges de la PWA:**
- Accés ràpid des de la pantalla d'inici
- Funciona offline (amb limitacions)
- Experiència d'app nativa

---

## 🛠️ Solució de Problemes

### No es carreguen les partides

**Causa:** Problema de connexió al servidor

**Solució:**
1. Comprova que el servidor està funcionant (`npm start`)
2. Revisa la consola del navegador (F12 → Console)
3. Verifica la connexió a Supabase

### Les estadístiques no es recalculen

**Solució:**
1. Refresca la pàgina (F5)
2. Canvia de modalitat i torna a la original
3. Tanca i torna a obrir l'app

### He perdut les meves dades

**Solució:**
1. Les dades estan guardades a Supabase (núvol)
2. Simplement torna a seleccionar el teu usuari
3. Si tens una còpia exportada, importa-la

### L'app em demana seleccionar usuari constantment

**Causa:** localStorage esborrat o navegació privada

**Solució:**
1. Comprova que no estàs en mode incògnit
2. Permet cookies i localStorage al teu navegador
3. No esborris les dades del navegador

### No puc afegir partides

**Causa:** Camps obligatoris buits o error de validació

**Solució:**
1. Omple tots els camps marcats amb *
2. Comprova que les caràmboles i entrades són números vàlids
3. Revisa la consola per errors

---

## 💡 Consells i Trucs

### Per millorar les estadístiques:

1. **Registra totes les partides**: Fins i tot les dolentes, per tenir dades reals
2. **Afegeix vídeos**: Ajuda a revisar i aprendre dels errors
3. **Utilitza el simulador**: Planifica quantes partides necessites per millorar la mitjana

### Per optimitzar l'experiència:

1. **Instal·la la PWA**: Accés més ràpid i experiència millor
2. **Fes còpies de seguretat**: Exporta les dades periòdicament
3. **Mantén les dades netes**: Elimina partides duplicades o errònies

### Per a ús amb múltiples jugadors:

1. **Crea usuaris des del principi**: Evitaràs barrejar dades
2. **Utilitza noms clars**: Evita confusions (ex: "Joan Garcia", no "JG")
3. **Comprova l'usuari actiu**: Mira la navbar abans d'afegir partides

---

## 🔮 Futures Funcionalitats (Roadmap)

- [ ] **Comparació entre jugadors**: Gràfics i taules comparatives
- [ ] **Estadístiques avançades**: Percentatges de victòria, tendències...
- [ ] **Notificacions**: Recordatoris per registrar partides
- [ ] **Exportar a PDF**: Generar informes imprimibles
- [ ] **Gràfics avançats**: Heat maps, distribucions...
- [ ] **Mode fosc**: Tema fosc per a ús nocturn
- [ ] **Suport multiidioma**: Català, Castellà, Anglès

---

## 📞 Suport

Si tens problemes o suggeriments:

1. **Revisa aquesta guia** primer
2. **Comprova la consola** del navegador (F12)
3. **Contacta amb l'administrador** del sistema
4. **Obre un issue** al repositori de GitHub (si aplica)

---

## 📄 Llicència i Crèdits

**Versió:** 2.0 - Sistema Multi-Usuari
**Data:** Octubre 2025
**Tecnologies:** HTML5, JavaScript, Node.js, Express, Supabase, Chart.js
**Creat per:** Estadístiques Billar Team

---

**Gaudeix registrant les teves partides! 🎱**
