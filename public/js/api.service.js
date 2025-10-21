/**
 * Servei d'API per gestionar les crides al backend
 */
class ApiService {
    constructor() {
        this.baseUrl = '';
    }

    /**
     * Mètode genèric per fer peticions
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error en ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * GET request
     */
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    /**
     * POST request
     */
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     */
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // ============================================
    // ENDPOINTS D'USUARIS
    // ============================================

    async getUsuaris() {
        return this.get('/api/usuaris');
    }

    async createUsuari(data) {
        return this.post('/api/usuaris', data);
    }

    async updateUsuari(id, data) {
        return this.put(`/api/usuaris/${id}`, data);
    }

    async deleteUsuari(id) {
        return this.delete(`/api/usuaris/${id}`);
    }

    // ============================================
    // ENDPOINTS DE MODALITATS
    // ============================================

    async getModalitats() {
        return this.get('/api/modalitats');
    }

    async createModalitat(data) {
        return this.post('/api/modalitats', data);
    }

    async updateModalitat(id, data) {
        return this.put(`/api/modalitats/${id}`, data);
    }

    async deleteModalitat(id) {
        return this.delete(`/api/modalitats/${id}`);
    }

    // ============================================
    // ENDPOINTS DE PARTIDES
    // ============================================

    async getPartides(filters = {}) {
        const params = new URLSearchParams(filters);
        const query = params.toString() ? `?${params.toString()}` : '';
        return this.get(`/api/partides${query}`);
    }

    async createPartida(data) {
        return this.post('/api/partides', data);
    }

    async createPartidesInBulk(partides) {
        return this.post('/api/partides/bulk', partides);
    }

    async updatePartida(id, data) {
        return this.put(`/api/partides/${id}`, data);
    }

    async deletePartida(id) {
        return this.delete(`/api/partides/${id}`);
    }
}

// Crear instància global
const apiService = new ApiService();

// Exportar per utilitzar a altres scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiService;
}
