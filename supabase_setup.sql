-- SQL per crear les taules a Supabase

-- Taula per les partides de Gómez
CREATE TABLE partides_gomez (
    id SERIAL PRIMARY KEY,
    num INTEGER NOT NULL,
    data DATE,
    lloc TEXT,
    oponent TEXT,
    equip TEXT,
    competicio TEXT,
    caramboles INTEGER NOT NULL,
    caramboles_oponent INTEGER,
    entrades INTEGER NOT NULL,
    mitjana DECIMAL(10, 4),
    mitjana_oponent DECIMAL(10, 4),
    serie_major INTEGER,
    url_video TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(num)
);

-- Taula per les partides de Chuecos
CREATE TABLE partides_chuecos (
    id SERIAL PRIMARY KEY,
    num INTEGER NOT NULL,
    data DATE,
    lloc TEXT,
    oponent TEXT,
    equip TEXT,
    competicio TEXT,
    caramboles INTEGER NOT NULL,
    caramboles_oponent INTEGER,
    entrades INTEGER NOT NULL,
    mitjana DECIMAL(10, 4),
    mitjana_oponent DECIMAL(10, 4),
    serie_major INTEGER,
    url_video TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(num)
);

-- Índexs per millorar el rendiment
CREATE INDEX idx_gomez_num ON partides_gomez(num);
CREATE INDEX idx_chuecos_num ON partides_chuecos(num);
CREATE INDEX idx_gomez_data ON partides_gomez(data);
CREATE INDEX idx_chuecos_data ON partides_chuecos(data);

-- Habilitar Row Level Security (RLS)
ALTER TABLE partides_gomez ENABLE ROW LEVEL SECURITY;
ALTER TABLE partides_chuecos ENABLE ROW LEVEL SECURITY;

-- Política per permetre totes les operacions (pots fer-ho més restrictiu si vols)
CREATE POLICY "Permetre totes les operacions a partides_gomez" ON partides_gomez
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permetre totes les operacions a partides_chuecos" ON partides_chuecos
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Funció per actualitzar updated_at automàticament
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers per actualitzar updated_at
CREATE TRIGGER update_gomez_updated_at BEFORE UPDATE ON partides_gomez
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chuecos_updated_at BEFORE UPDATE ON partides_chuecos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
