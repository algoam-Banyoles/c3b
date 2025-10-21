# Refactorització del Codi - Billar Stats

## 📋 Resum

Aquest document descriu les millores implementades en la refactorització del codi de l'aplicació d'estadístiques de billar.

## 🎯 Objectius

1. **Modularització**: Separar el codi en components reutilitzables
2. **Mantenibilitat**: Facilitar futures modificacions i extensions
3. **Escalabilitat**: Preparar l'aplicació per créixer
4. **Qualitat**: Millorar la llegibilitat i reducir la duplicació de codi

## 🏗️ Nova Estructura del Backend

### Abans
```
c3b/
├── server.js (400+ línies, tot en un sol fitxer)
├── supabase.js
└── config.js
```

### Després
```
c3b/
├── server.refactored.js (80 línies, net i organitzat)
└── src/
    ├── config/
    │   ├── database.js       # Connexió a Supabase
    │   └── constants.js      # Constants globals
    ├── middleware/
    │   ├── errorHandler.js   # Gestió d'errors centralitzada
    │   └── validator.js      # Validacions de dades
    ├── services/
    │   ├── usuariService.js     # Lògica de negoci d'usuaris
    │   ├── modalitatService.js  # Lògica de negoci de modalitats
    │   └── partidaService.js    # Lògica de negoci de partides
    ├── controllers/
    │   ├── usuariController.js     # Controlador d'usuaris
    │   ├── modalitatController.js  # Controlador de modalitats
    │   └── partidaController.js    # Controlador de partides
    └── routes/
        ├── index.js      # Combinació de totes les rutes
        ├── usuaris.js    # Rutes d'usuaris
        ├── modalitats.js # Rutes de modalitats
        └── partides.js   # Rutes de partides
```

## 🎨 Nova Estructura del Frontend

### Abans
```
c3b/
├── index.html (2000+ línies amb tot el CSS i JS inline)
├── select-user.html
├── manage-users.html
├── config.js
└── navbar.js
```

### Després
```
c3b/
└── public/
    ├── css/
    │   ├── variables.css   # Variables CSS globals
    │   └── components.css  # Components reutilitzables
    └── js/
        ├── api.service.js   # Servei per crides a l'API
        ├── stats.service.js # Servei de càlculs estadístics
        └── chart.service.js # Servei de gràfics
```

## ✨ Millores Implementades

### 1. Backend Modular

#### **Separació de Responsabilitats (SOLID)**

- **Controllers**: Gestionen les peticions HTTP i retornen respostes
- **Services**: Contenen la lògica de negoci i interaccionen amb la base de dades
- **Middleware**: Gestionen validacions, errors i autenticació
- **Routes**: Defineixen els endpoints de l'API

#### **Gestió d'Errors Centralitzada**

```javascript
// Abans: Cada endpoint gestionava errors de forma diferent
app.get('/api/usuaris', async (req, res) => {
    try {
        const { data, error } = await supabase...
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error llegint usuaris' });
    }
});

// Després: Middleware centralitzat
const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: err.message,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};
```

#### **Validacions Robustes**

```javascript
// Middleware de validació
const validatePartida = (req, res, next) => {
    const { usuari_id, modalitat_id, caramboles, entrades } = req.body;
    
    if (!usuari_id || !modalitat_id) {
        return res.status(400).json({
            error: 'usuari_id i modalitat_id són obligatoris'
        });
    }
    
    if (typeof entrades !== 'number' || entrades <= 0) {
        return res.status(400).json({
            error: 'Les entrades han de ser un número major que 0'
        });
    }
    
    next();
};
```

### 2. Serveis del Frontend

#### **ApiService** - Gestió de Peticions HTTP

```javascript
// Abans: Crides fetch duplicades arreu
const response = await fetch('/api/usuaris');
const usuaris = await response.json();

// Després: Servei centralitzat
const usuaris = await apiService.getUsuaris();
```

#### **StatsService** - Càlculs Estadístics

```javascript
// Càlculs reutilitzables
const mitjana = StatsService.calcularMitjana(partides);
const punts = StatsService.calcularEstadistiquesPunts(partides);
const { millor, pitjor } = StatsService.getMillorIPitjorPartida(partides);
```

#### **ChartService** - Gràfics amb Chart.js

```javascript
// Gestió simplificada de gràfics
chartService.createEvolutionChart('evolutionChart', partides, {
    showTrend: true,
    showAccumulated: true,
    maxPartides: 15
});
```

### 3. CSS Modular

#### **Variables CSS**

```css
:root {
    --color-primary: #2563eb;
    --spacing-md: 15px;
    --radius-lg: 15px;
    --transition-base: 0.3s ease;
}
```

#### **Components Reutilitzables**

- Cards
- Buttons (primary, secondary, success, danger, warning)
- Modals
- Forms
- Alerts
- Tables
- Animacions

## 📦 Com Utilitzar la Versió Refactoritzada

### Backend

1. **Utilitza el nou servidor**:
```bash
node server.refactored.js
```

2. **Estructura dels endpoints** (no canvia):
```
GET    /api/usuaris
POST   /api/usuaris
PUT    /api/usuaris/:id
DELETE /api/usuaris/:id
...
```

### Frontend

1. **Inclou els nous serveis** als teus HTML:
```html
<!-- Variables i components CSS -->
<link rel="stylesheet" href="public/css/variables.css">
<link rel="stylesheet" href="public/css/components.css">

<!-- Serveis JavaScript -->
<script src="public/js/api.service.js"></script>
<script src="public/js/stats.service.js"></script>
<script src="public/js/chart.service.js"></script>
```

2. **Usa els serveis** al teu codi:
```javascript
// Carregar partides
const partides = await apiService.getPartides({
    usuari_id: config.usuariId,
    modalitat_id: config.modalitatId
});

// Calcular estadístiques
const stats = StatsService.getEstadistiquesGlobals(partides);

// Crear gràfic
chartService.createEvolutionChart('myChart', partides);
```

## 🔄 Migració Gradual

La refactorització permet una **migració gradual**:

1. El servidor original (`server.js`) segueix funcionant
2. El nou servidor (`server.refactored.js`) té la mateixa API
3. Els fitxers HTML actuals poden començar a usar els nous serveis sense canvis dràstics
4. Els CSS es poden migrar component per component

## 🎉 Beneficis

### Codi més Net
- ✅ 400+ línies → múltiples fitxers de <150 línies
- ✅ Funcions més petites i enfocades
- ✅ Millor llegibilitat

### Mantenibilitat
- ✅ Canvis aïllats (modificar usuaris no afecta partides)
- ✅ Més fàcil trobar i corregir bugs
- ✅ Tests més senzills d'implementar

### Escalabilitat
- ✅ Fàcil afegir nous endpoints
- ✅ Nous serveis sense modificar els existents
- ✅ Preparats per créixer

### Reutilització
- ✅ Serveis compartits entre pàgines
- ✅ Components CSS consistents
- ✅ Menys duplicació de codi

## 🚀 Pròxims Passos

1. **Migrar els HTML actuals** per usar els nous serveis
2. **Afegir tests unitaris** per controllers i services
3. **Implementar autenticació** amb middleware
4. **Documentar l'API** amb Swagger/OpenAPI
5. **Optimitzar rendiment** amb caching
6. **Afegir logs** estructurats

## 📝 Notes

- Tots els fitxers originals es mantenen intactes
- La refactorització és **compatible amb el codi actual**
- Es poden anar adoptant components gradualment
- El servidor refactoritzat és **production-ready**

---

**Data**: Octubre 2025  
**Autor**: Refactorització Billar Stats  
**Versió**: 2.0
