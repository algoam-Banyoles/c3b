const supabase = require('../config/database');
const { DB_TABLES } = require('../config/constants');

class UsuariService {
    /**
     * Obtenir tots els usuaris
     */
    async getAll() {
        const { data, error } = await supabase
            .from(DB_TABLES.USUARIS)
            .select('*')
            .order('nom', { ascending: true });

        if (error) throw error;
        return data;
    }

    /**
     * Obtenir un usuari per ID
     */
    async getById(id) {
        const { data, error } = await supabase
            .from(DB_TABLES.USUARIS)
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Crear un nou usuari
     */
    async create(usuariData) {
        const { nom, email, avatar_url } = usuariData;

        const { data, error } = await supabase
            .from(DB_TABLES.USUARIS)
            .insert([{ nom, email, avatar_url }])
            .select();

        if (error) throw error;
        return data[0];
    }

    /**
     * Actualitzar un usuari
     */
    async update(id, usuariData) {
        const { nom, email, avatar_url, preferencies } = usuariData;

        const { data, error } = await supabase
            .from(DB_TABLES.USUARIS)
            .update({ nom, email, avatar_url, preferencies })
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0];
    }

    /**
     * Eliminar un usuari
     */
    async delete(id) {
        const { error } = await supabase
            .from(DB_TABLES.USUARIS)
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    }
}

module.exports = new UsuariService();
