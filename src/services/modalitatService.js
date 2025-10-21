const supabase = require('../config/database');
const { DB_TABLES } = require('../config/constants');

class ModalitatService {
    /**
     * Obtenir totes les modalitats
     */
    async getAll() {
        const { data, error } = await supabase
            .from(DB_TABLES.MODALITATS)
            .select('*')
            .order('nom', { ascending: true });

        if (error) throw error;
        return data;
    }

    /**
     * Obtenir una modalitat per ID
     */
    async getById(id) {
        const { data, error } = await supabase
            .from(DB_TABLES.MODALITATS)
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Crear una nova modalitat
     */
    async create(modalitatData) {
        const { nom, descripcio, camps_personalitzats } = modalitatData;

        const { data, error } = await supabase
            .from(DB_TABLES.MODALITATS)
            .insert([{ nom, descripcio, camps_personalitzats }])
            .select();

        if (error) throw error;
        return data[0];
    }

    /**
     * Actualitzar una modalitat
     */
    async update(id, modalitatData) {
        const { nom, descripcio, camps_personalitzats } = modalitatData;

        const { data, error } = await supabase
            .from(DB_TABLES.MODALITATS)
            .update({ nom, descripcio, camps_personalitzats })
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0];
    }

    /**
     * Eliminar una modalitat
     */
    async delete(id) {
        const { error } = await supabase
            .from(DB_TABLES.MODALITATS)
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    }
}

module.exports = new ModalitatService();
