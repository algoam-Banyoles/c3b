const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('⚠️ Falta configurar SUPABASE_URL i SUPABASE_KEY al fitxer .env');
    console.log('Crea un fitxer .env basant-te en .env.example');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
