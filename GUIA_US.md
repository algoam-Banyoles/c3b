# 🎱 GUIA D'ÚS - Sistema de Sincronització Automàtica

## ✅ Què s'ha implementat?

Ara tens un servidor Node.js que:
- Serveix les pàgines web
- Guarda automàticament els canvis als fitxers JSON
- Sincronitza les dades entre tots els dispositius que accedeixin al servidor

## 🚀 Com utilitzar-ho

### 1. SEMPRE iniciar el servidor abans d'editar partides

```bash
npm start
```

Veuràs aquest missatge:
```
🎱 Servidor d'estadístiques de billar iniciat!
📊 Pàgina principal (Gómez): http://localhost:3000
📊 Pàgina Chuecos: http://localhost:3000/chuecos.html
```

### 2. Obrir l'aplicació al navegador

- **Ordinador**: http://localhost:3000
- **Mòbil/Tablet** (mateixa WiFi): http://[IP-del-teu-PC]:3000
  - Per trobar la IP: `ipconfig` a PowerShell
  - Exemple: http://192.168.1.100:3000

### 3. Editar partides normalment

Ara quan edites, afegeixes o elimines partides:
1. ✅ Es guarda automàticament al fitxer JSON
2. ✅ Es guarda una còpia al localStorage (backup)
3. ✅ Tots els dispositius connectats veuran els canvis

## 🔄 Sincronització entre dispositius

### Escenari 1: Mateix ordinador, diferents navegadors
✅ Funciona automàticament! El servidor guarda al JSON i tots els navegadors llegeixen del mateix fitxer.

### Escenari 2: Diferents dispositius a la mateixa xarxa (WiFi casa)
✅ Accedeix des del mòbil a http://[IP-PC]:3000
✅ Tots els canvis es guarden al JSON del PC

### Escenari 3: Diferents ubicacions (casa, club de billar, etc.)
📦 Solucions:
1. **Git** (Recomanat): Fes push dels canvis i pull a l'altre ubicació
2. **Dropbox/OneDrive**: Sincronitza la carpeta del projecte
3. **Exportar/Importar**: Usa el botó d'exportar JSON i importa a l'altre dispositiu

## 📁 Fitxers que es sincronitzen automàticament

- `partides_gomez_updated.json` → S'actualitza quan edites a la pàgina de Gómez
- `partides_chuecos_updated.json` → S'actualitza quan edites a la pàgina de Chuecos

Aquests fitxers ara sempre estan actualitzats! Pots fer commit a Git sense por.

## 💾 Sistema de backup automàtic

L'aplicació té 2 nivells de seguretat:

1. **Primer nivell**: Fitxers JSON (dades principals)
2. **Segon nivell**: localStorage (backup si el servidor està apagat)

Si obres l'aplicació sense el servidor:
- ⚠️ Llegirà del localStorage (backup)
- ⚠️ NO podrà guardar canvis als JSON
- ⚠️ Els canvis només es guardaran localment

## 🛠️ Comandos útils

### Iniciar servidor
```bash
npm start
```

### Aturar servidor
```
Ctrl + C
```

### Veure estat del servidor
Si el servidor està funcionant, veuràs a la consola:
```
✅ Dades guardades al servidor: X partides
```

## ⚠️ IMPORTANT

1. **SEMPRE inicia el servidor abans d'editar partides**
2. **NO editis els JSON manualment** mentre el servidor està funcionant
3. **Fes backup regular** exportant els JSON (botó "Exportar Dades")

## 🐛 Resolució de problemes

### ❌ Error: "No s'han pogut guardar les dades al servidor"
**Solució**: 
- Comprova que el servidor està funcionant (`npm start`)
- Recarrega la pàgina

### ❌ Els canvis no es veuen a un altre dispositiu
**Solució**:
- Recarrega la pàgina a l'altre dispositiu (F5)
- Les dades es carreguen quan obres la pàgina

### ❌ Port 3000 ja està en ús
**Solució**:
1. Obre `server.js`
2. Canvia `const PORT = 3000;` per `const PORT = 3001;`
3. Accedeix a http://localhost:3001

## 📊 Exemple d'ús diari

### A casa:
1. `npm start` → Inicia el servidor
2. Obrir http://localhost:3000
3. Afegir/editar partides
4. Els JSON s'actualitzen automàticament
5. `Ctrl+C` per aturar el servidor
6. `git add .` i `git commit` si vols guardar a Git

### Al club de billar (desde el mòbil):
1. Assegura't que l'ordinador de casa té el servidor funcionant
2. Connecta el mòbil a la mateixa WiFi
3. Obre http://[IP-PC]:3000 al mòbil
4. Edita partides des del mòbil
5. Els canvis es guarden al PC automàticament

### En una altra ubicació:
1. `git pull` (si uses Git)
2. `npm start`
3. Les últimes dades es carreguen automàticament

## 🎉 Avantatges del nou sistema

✅ No perds dades mai en recarregar
✅ Els JSON sempre estan actualitzats
✅ Pots fer commit a Git sense problemes
✅ Sincronització automàtica entre dispositius
✅ Backup automàtic al localStorage
✅ Funciona fins i tot sense servidor (mode lectura)

---

**Fet amb ❤️ per C3B Banyoles**
