const supabase = require('../config/database');
const { DB_TABLES } = require('../config/constants');

class PartidaService {
    /**
     * Obtenir partides amb filtres opcionals
     */
    async getAll(filters = {}) {
        let query = supabase
            .from(DB_TABLES.PARTIDES)
            .select(`
                *,
                usuaris:usuari_id(id, nom),
                modalitats:modalitat_id(id, nom)
            `)
            .order('num', { ascending: true });

        if (filters.usuari_id) {
            query = query.eq('usuari_id', filters.usuari_id);
        }

        if (filters.modalitat_id) {
            query = query.eq('modalitat_id', filters.modalitat_id);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
    }

    /**
     * Obtenir una partida per ID
     */
    async getById(id) {
        const { data, error } = await supabase
            .from(DB_TABLES.PARTIDES)
            .select(`
                *,
                usuaris:usuari_id(id, nom),
                modalitats:modalitat_id(id, nom)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Crear una nova partida
     */
    async create(partidaData) {
        // Netejar camps auto-generats
        const { id, created_at, updated_at, usuaris, modalitats, ...cleanData } = partidaData;

        const { data, error } = await supabase
            .from(DB_TABLES.PARTIDES)
            .insert([cleanData])
            .select();

        if (error) throw error;
        return data[0];
    }

    /**
     * Crear múltiples partides (bulk)
     */
    async createBulk(partides) {
        // Netejar camps auto-generats
        const cleanPartides = partides.map(p => {
            const { id, created_at, updated_at, usuaris, modalitats, ...rest } = p;
            return rest;
        });

        const { data, error } = await supabase
            .from(DB_TABLES.PARTIDES)
            .insert(cleanPartides)
            .select();

        if (error) throw error;
        return data;
    }

    /**
     * Actualitzar una partida
     */
    async update(id, partidaData) {
        // Netejar camps auto-generats
        const { id: _, created_at, updated_at, usuaris, modalitats, ...cleanData } = partidaData;

        const { data, error } = await supabase
            .from(DB_TABLES.PARTIDES)
            .update(cleanData)
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0];
    }

    /**
     * Eliminar una partida
     */
    async delete(id) {
        const { error } = await supabase
            .from(DB_TABLES.PARTIDES)
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    }
}

module.exports = new PartidaService();
