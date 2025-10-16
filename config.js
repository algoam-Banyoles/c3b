/**
 * Gestió de configuració d'usuari i modalitat
 * Utilitzat per totes les pàgines de l'aplicació
 */

const BillarConfig = {
    // Clau localStorage
    CONFIG_KEY: 'billar_user_config',
    API_BASE: '',

    /**
     * Obtenir la configuració actual de l'usuari
     * @returns {Object|null} Configuració amb usuariId, modalitatId, usuariNom, modalitatNom
     */
    getConfig() {
        const stored = localStorage.getItem(this.CONFIG_KEY);
        return stored ? JSON.parse(stored) : null;
    },

    /**
     * Guardar configuració de l'usuari
     */
    saveConfig(usuariId, modalitatId, usuariNom, modalitatNom) {
        const config = {
            usuariId: parseInt(usuariId),
            modalitatId: parseInt(modalitatId),
            usuariNom,
            modalitatNom,
            lastUpdate: new Date().toISOString()
        };
        localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
        return config;
    },

    /**
     * Netejar configuració (logout)
     */
    clearConfig() {
        localStorage.removeItem(this.CONFIG_KEY);
    },

    /**
     * Comprovar si hi ha usuari configurat
     * Si no, redirigir a la pantalla de selecció
     */
    requireUser() {
        const config = this.getConfig();
        if (!config || !config.usuariId || !config.modalitatId) {
            window.location.href = 'select-user.html';
            return null;
        }
        return config;
    },

    /**
     * Canviar d'usuari (redirigir a selecció)
     */
    changeUser() {
        this.clearConfig();
        window.location.href = 'select-user.html';
    },

    /**
     * Actualitzar només la modalitat
     */
    async updateModalitat(modalitatId) {
        const config = this.getConfig();
        if (!config) return;

        try {
            // Obtenir info de la modalitat
            const response = await fetch(`${this.API_BASE}/api/modalitats`);
            const modalitats = await response.json();
            const modalitat = modalitats.find(m => m.id === parseInt(modalitatId));

            if (modalitat) {
                config.modalitatId = parseInt(modalitatId);
                config.modalitatNom = modalitat.nom;
                config.lastUpdate = new Date().toISOString();
                localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
                return config;
            }
        } catch (error) {
            console.error('Error actualitzant modalitat:', error);
        }
    },

    /**
     * Obtenir dades de l'usuari actual
     */
    async getCurrentUser() {
        const config = this.getConfig();
        if (!config || !config.usuariId) return null;

        try {
            const response = await fetch(`${this.API_BASE}/api/usuaris`);
            const usuaris = await response.json();
            return usuaris.find(u => u.id === config.usuariId);
        } catch (error) {
            console.error('Error obtenint usuari:', error);
            return null;
        }
    },

    /**
     * Obtenir totes les modalitats
     */
    async getModalitats() {
        try {
            const response = await fetch(`${this.API_BASE}/api/modalitats`);
            return await response.json();
        } catch (error) {
            console.error('Error obtenint modalitats:', error);
            return [];
        }
    },

    /**
     * Obtenir tots els usuaris
     */
    async getUsuaris() {
        try {
            const response = await fetch(`${this.API_BASE}/api/usuaris`);
            return await response.json();
        } catch (error) {
            console.error('Error obtenint usuaris:', error);
            return [];
        }
    },

    /**
     * Carregar partides de l'usuari i modalitat actuals
     */
    async loadPartides() {
        const config = this.getConfig();
        if (!config) return [];

        try {
            const url = `${this.API_BASE}/api/partides?usuari_id=${config.usuariId}&modalitat_id=${config.modalitatId}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error carregant partides:', error);
            return [];
        }
    },

    /**
     * Guardar una partida
     */
    async savePartida(partida) {
        const config = this.getConfig();
        if (!config) throw new Error('No hi ha usuari configurat');

        // Assegurar que té usuari_id i modalitat_id
        partida.usuari_id = config.usuariId;
        partida.modalitat_id = config.modalitatId;

        try {
            const response = await fetch(`${this.API_BASE}/api/partides`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(partida)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error guardant partida');
            }

            return await response.json();
        } catch (error) {
            console.error('Error guardant partida:', error);
            throw error;
        }
    },

    /**
     * Actualitzar una partida
     */
    async updatePartida(partidaId, partida) {
        try {
            const response = await fetch(`${this.API_BASE}/api/partides/${partidaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(partida)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error actualitzant partida');
            }

            return await response.json();
        } catch (error) {
            console.error('Error actualitzant partida:', error);
            throw error;
        }
    },

    /**
     * Eliminar una partida
     */
    async deletePartida(partidaId) {
        try {
            const response = await fetch(`${this.API_BASE}/api/partides/${partidaId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error eliminant partida');
            }

            return await response.json();
        } catch (error) {
            console.error('Error eliminant partida:', error);
            throw error;
        }
    },

    /**
     * Guardar múltiples partides (bulk)
     */
    async savePartidesInBulk(partides) {
        const config = this.getConfig();
        if (!config) throw new Error('No hi ha usuari configurat');

        // Assegurar que totes tenen usuari_id i modalitat_id
        const partidesWithIds = partides.map(p => ({
            ...p,
            usuari_id: config.usuariId,
            modalitat_id: config.modalitatId
        }));

        try {
            const response = await fetch(`${this.API_BASE}/api/partides/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(partidesWithIds)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error guardant partides');
            }

            return await response.json();
        } catch (error) {
            console.error('Error guardant partides en bulk:', error);
            throw error;
        }
    },

    /**
     * Crear un nou usuari
     */
    async createUser(nom, email = null) {
        try {
            const response = await fetch(`${this.API_BASE}/api/usuaris`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nom, email })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error creant usuari');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creant usuari:', error);
            throw error;
        }
    },

    /**
     * Actualitzar un usuari
     */
    async updateUser(usuariId, data) {
        try {
            const response = await fetch(`${this.API_BASE}/api/usuaris/${usuariId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error actualitzant usuari');
            }

            return await response.json();
        } catch (error) {
            console.error('Error actualitzant usuari:', error);
            throw error;
        }
    },

    /**
     * Eliminar un usuari
     */
    async deleteUser(usuariId) {
        try {
            const response = await fetch(`${this.API_BASE}/api/usuaris/${usuariId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error eliminant usuari');
            }

            return await response.json();
        } catch (error) {
            console.error('Error eliminant usuari:', error);
            throw error;
        }
    },

    /**
     * Crear una nova modalitat
     */
    async createModalitat(nom, descripcio = null) {
        try {
            const response = await fetch(`${this.API_BASE}/api/modalitats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nom, descripcio })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error creant modalitat');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creant modalitat:', error);
            throw error;
        }
    }
};

// Exportar per utilitzar a altres scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BillarConfig;
}
