/**
 * Navbar component amb botons de modalitat (només si l'usuari té múltiples modalitats)
 * Afegir aquest script a qualsevol pàgina per incloure el navbar
 */

// Inserir el navbar HTML
function insertNavbar() {
    const navbarHTML = `
        <div id="billarNavbar" style="
            background: rgba(255,255,255,0.98);
            padding: 12px 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 15px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 15px;
            position: sticky;
            top: 10px;
            z-index: 999;
        ">
            <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap; flex: 1;">
                <div style="font-weight: 700; color: #1e40af; font-size: 16px; display: flex; align-items: center;">
                    <img src="icons/billar-stats-icon-32.png" alt="Billar" style="width: 24px; height: 24px; margin-right: 8px;">
                    <span id="navbarUsuari">Carregant...</span>
                </div>

                <!-- Botons de modalitat (només si n'hi ha més d'una) -->
                <div id="navbarModalitats" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <!-- Es renderitzaran dinàmicament -->
                </div>
            </div>

            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button onclick="NavbarComponent.gestionarUsuaris()" style="
                    background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                ">👤 Gestionar Usuaris</button>

                <button onclick="NavbarComponent.canviarUsuari()" style="
                    background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 2px 6px rgba(37, 99, 235, 0.2);
                ">🔄 Canviar Usuari</button>
            </div>
        </div>

        <style>
            #billarNavbar button:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }

            #billarNavbar button:active {
                transform: scale(0.98);
            }

            .modalitat-btn {
                padding: 6px 14px;
                border: 2px solid #ddd;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                background: white;
                color: #666;
                transition: all 0.3s;
            }

            .modalitat-btn:hover {
                border-color: #2563eb;
                color: #2563eb;
                transform: translateY(-1px);
            }

            .modalitat-btn.active {
                background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
                color: white;
                border-color: #2563eb;
                box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
            }

            @media (max-width: 600px) {
                #billarNavbar {
                    flex-direction: column;
                    align-items: stretch;
                    text-align: center;
                }

                #billarNavbar > div {
                    justify-content: center;
                }

                #navbarModalitats {
                    justify-content: center;
                }
            }
        </style>
    `;

    // Inserir al principi del container principal
    const container = document.querySelector('.container');
    if (container) {
        container.insertAdjacentHTML('afterbegin', navbarHTML);
    }
}

// Component de navbar
const NavbarComponent = {
    config: null,
    modalitats: [],
    modalitatAmbPartides: [],

    // Inicialitzar navbar
    async init() {
        // Verificar que hi ha usuari configurat
        this.config = BillarConfig.requireUser();
        if (!this.config) return;

        // Inserir HTML
        insertNavbar();

        // Carregar dades
        await this.carregarDades();

        // Detectar modalitats amb partides
        await this.detectarModalitatsAmbPartides();

        // Actualitzar UI
        this.renderNavbar();
    },

    // Carregar modalitats
    async carregarDades() {
        try {
            this.modalitats = await BillarConfig.getModalitats();
        } catch (error) {
            console.error('Error carregant modalitats:', error);
        }
    },

    // Detectar quines modalitats tenen partides per l'usuari actual
    async detectarModalitatsAmbPartides() {
        try {
            // Obtenir totes les partides de l'usuari (sense filtrar per modalitat)
            const response = await fetch(`${BillarConfig.API_BASE}/api/partides?usuari_id=${this.config.usuariId}`);
            if (!response.ok) return;

            const partides = await response.json();

            // Comptar partides per modalitat
            const countPerModalitat = {};
            partides.forEach(p => {
                if (!countPerModalitat[p.modalitat_id]) {
                    countPerModalitat[p.modalitat_id] = 0;
                }
                countPerModalitat[p.modalitat_id]++;
            });

            // Filtrar modalitats que tenen almenys 1 partida
            this.modalitatAmbPartides = this.modalitats.filter(m =>
                countPerModalitat[m.id] && countPerModalitat[m.id] > 0
            );

            console.log('Modalitats amb partides:', this.modalitatAmbPartides.map(m => m.nom));
        } catch (error) {
            console.error('Error detectant modalitats amb partides:', error);
        }
    },

    // Renderitzar navbar
    renderNavbar() {
        // Actualitzar nom d'usuari
        const usuariEl = document.getElementById('navbarUsuari');
        if (usuariEl) {
            usuariEl.textContent = this.config.usuariNom;
        }

        // Renderitzar botons de modalitat (només si hi ha més d'una modalitat amb partides)
        const modalitatContainer = document.getElementById('navbarModalitats');
        if (modalitatContainer) {
            if (this.modalitatAmbPartides.length > 1) {
                // Mostrar botons
                modalitatContainer.innerHTML = this.modalitatAmbPartides.map(m => `
                    <button
                        class="modalitat-btn ${m.id === this.config.modalitatId ? 'active' : ''}"
                        onclick="NavbarComponent.canviarModalitatAmbId(${m.id})"
                    >
                        ${m.nom}
                    </button>
                `).join('');
            } else if (this.modalitatAmbPartides.length === 1) {
                // Només una modalitat: mostrar-la com a text (no botons)
                modalitatContainer.innerHTML = `
                    <span style="font-size: 13px; color: #666; font-weight: 600;">
                        ${this.modalitatAmbPartides[0].nom}
                    </span>
                `;
            } else {
                // No hi ha modalitats amb partides
                modalitatContainer.innerHTML = '';
            }
        }
    },

    // Canviar modalitat amb ID
    async canviarModalitatAmbId(modalitatId) {
        if (modalitatId === this.config.modalitatId) return;

        // Confirmar canvi
        const modalitat = this.modalitats.find(m => m.id === modalitatId);
        if (!confirm(`Vols canviar a la modalitat "${modalitat.nom}"? Les estadístiques es recalcularan.`)) {
            return;
        }

        // Actualitzar configuració
        await BillarConfig.updateModalitat(modalitatId);
        this.config = BillarConfig.getConfig();

        // Recarregar pàgina
        window.location.reload();
    },

    // Canviar usuari
    canviarUsuari() {
        if (confirm('Vols canviar d\'usuari? Es carregarà la pantalla de selecció.')) {
            BillarConfig.changeUser();
        }
    },

    // Gestionar usuaris
    gestionarUsuaris() {
        window.location.href = 'manage-users.html';
    }
};

// Auto-inicialitzar si estem en una pàgina que no és select-user
if (typeof BillarConfig !== 'undefined' && !window.location.pathname.includes('select-user')) {
    window.addEventListener('DOMContentLoaded', () => {
        NavbarComponent.init();
    });
}
