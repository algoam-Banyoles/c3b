-- ============================================
-- MIGRACIÓ A SISTEMA MULTI-USUARI I MULTI-MODALITAT
-- ============================================

-- 1. CREAR TAULA D'USUARIS
-- ============================================
CREATE TABLE IF NOT EXISTS usuaris (
    id SERIAL PRIMARY KEY,
    nom TEXT NOT NULL UNIQUE,
    email TEXT,
    avatar_url TEXT,
    preferencies JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CREAR TAULA DE MODALITATS
-- ============================================
CREATE TABLE IF NOT EXISTS modalitats (
    id SERIAL PRIMARY KEY,
    nom TEXT NOT NULL UNIQUE,
    descripcio TEXT,
    camps_personalitzats JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CREAR TAULA UNIFICADA DE PARTIDES
-- ============================================
CREATE TABLE IF NOT EXISTS partides (
    id SERIAL PRIMARY KEY,
    usuari_id INTEGER NOT NULL REFERENCES usuaris(id) ON DELETE CASCADE,
    modalitat_id INTEGER NOT NULL REFERENCES modalitats(id) ON DELETE RESTRICT,
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
    UNIQUE(usuari_id, modalitat_id, num)
);

-- 4. INSERIR MODALITATS PER DEFECTE
-- ============================================
INSERT INTO modalitats (nom, descripcio) VALUES
    ('Tres Bandes', 'Billar a tres bandes o carambola'),
    ('Lliure', 'Billar lliure sense bandes obligatòries'),
    ('Banda', 'Billar a una banda')
ON CONFLICT (nom) DO NOTHING;

-- 5. INSERIR USUARIS EXISTENTS
-- ============================================
INSERT INTO usuaris (nom) VALUES
    ('Albert Gómez'),
    ('Chuecos')
ON CONFLICT (nom) DO NOTHING;

-- 6. MIGRAR DADES DE partides_gomez
-- ============================================
INSERT INTO partides (
    usuari_id,
    modalitat_id,
    num,
    data,
    lloc,
    oponent,
    equip,
    competicio,
    caramboles,
    caramboles_oponent,
    entrades,
    mitjana,
    mitjana_oponent,
    serie_major,
    url_video,
    created_at,
    updated_at
)
SELECT
    (SELECT id FROM usuaris WHERE nom = 'Albert Gómez'),
    (SELECT id FROM modalitats WHERE nom = 'Tres Bandes'),
    num,
    data,
    lloc,
    oponent,
    equip,
    competicio,
    caramboles,
    caramboles_oponent,
    entrades,
    mitjana,
    mitjana_oponent,
    serie_major,
    url_video,
    created_at,
    updated_at
FROM partides_gomez
ON CONFLICT (usuari_id, modalitat_id, num) DO NOTHING;

-- 7. MIGRAR DADES DE partides_chuecos
-- ============================================
INSERT INTO partides (
    usuari_id,
    modalitat_id,
    num,
    data,
    lloc,
    oponent,
    equip,
    competicio,
    caramboles,
    caramboles_oponent,
    entrades,
    mitjana,
    mitjana_oponent,
    serie_major,
    url_video,
    created_at,
    updated_at
)
SELECT
    (SELECT id FROM usuaris WHERE nom = 'Chuecos'),
    (SELECT id FROM modalitats WHERE nom = 'Tres Bandes'),
    num,
    data,
    lloc,
    oponent,
    equip,
    competicio,
    caramboles,
    caramboles_oponent,
    entrades,
    mitjana,
    mitjana_oponent,
    serie_major,
    url_video,
    created_at,
    updated_at
FROM partides_chuecos
ON CONFLICT (usuari_id, modalitat_id, num) DO NOTHING;

-- 8. CREAR ÍNDEXS PER MILLORAR RENDIMENT
-- ============================================
CREATE INDEX IF NOT EXISTS idx_partides_usuari ON partides(usuari_id);
CREATE INDEX IF NOT EXISTS idx_partides_modalitat ON partides(modalitat_id);
CREATE INDEX IF NOT EXISTS idx_partides_data ON partides(data);
CREATE INDEX IF NOT EXISTS idx_partides_num ON partides(num);
CREATE INDEX IF NOT EXISTS idx_partides_usuari_modalitat ON partides(usuari_id, modalitat_id);

-- 9. HABILITAR ROW LEVEL SECURITY
-- ============================================
ALTER TABLE usuaris ENABLE ROW LEVEL SECURITY;
ALTER TABLE modalitats ENABLE ROW LEVEL SECURITY;
ALTER TABLE partides ENABLE ROW LEVEL SECURITY;

-- Polítiques per permetre totes les operacions (públic)
CREATE POLICY "Permetre totes les operacions a usuaris" ON usuaris
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permetre totes les operacions a modalitats" ON modalitats
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permetre totes les operacions a partides" ON partides
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 10. TRIGGERS PER ACTUALITZAR updated_at
-- ============================================
CREATE TRIGGER update_usuaris_updated_at BEFORE UPDATE ON usuaris
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partides_updated_at BEFORE UPDATE ON partides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. VISTES ÚTILS (OPCIONAL)
-- ============================================
CREATE OR REPLACE VIEW v_partides_completes AS
SELECT
    p.*,
    u.nom as nom_usuari,
    m.nom as nom_modalitat
FROM partides p
JOIN usuaris u ON p.usuari_id = u.id
JOIN modalitats m ON p.modalitat_id = m.id
ORDER BY p.usuari_id, p.modalitat_id, p.num;

-- ============================================
-- NOTES IMPORTANTS:
-- ============================================
-- 1. Les taules antigues (partides_gomez, partides_chuecos) NO s'eliminen
--    per seguretat. Pots eliminar-les manualment després de verificar la migració.
--
-- 2. Per eliminar les taules antigues (OPCIONAL, fer-ho amb precaució):
--    DROP TABLE IF EXISTS partides_gomez CASCADE;
--    DROP TABLE IF EXISTS partides_chuecos CASCADE;
--
-- 3. Aquesta migració és idempotent (pots executar-la múltiples vegades)
--
-- ============================================
