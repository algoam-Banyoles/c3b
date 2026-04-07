-- ============================================================================
-- Migration: Cross-modality match history
-- ----------------------------------------------------------------------------
-- Adds support for importing matches from external sources (Ranquing app)
-- and tracking matches in modalities beyond the user's primary one.
--
-- Changes:
--   1. usuaris.web_id           → stable federation id (nullable, unique)
--   2. partides.origen          → 'c3b' (manual entry) | 'ranquing' (imported)
--   3. partides.punts /
--      partides.punts_oponent   → match points (used in some modalities)
--   4. partides.num             → made nullable for imported rows that have
--                                 no natural sequential numbering
--   5. New modalitats: Q47/2, Q71/2
--
-- Idempotent: safe to run multiple times.
-- ============================================================================

BEGIN;

-- 1. Stable external player id ------------------------------------------------
ALTER TABLE usuaris
    ADD COLUMN IF NOT EXISTS web_id INTEGER;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'usuaris_web_id_unique'
    ) THEN
        ALTER TABLE usuaris
            ADD CONSTRAINT usuaris_web_id_unique UNIQUE (web_id);
    END IF;
END $$;

COMMENT ON COLUMN usuaris.web_id IS
    'Stable federation player id (FCBillar web_id). Nullable: not all players have one.';

-- 2. Origin marker on partides ------------------------------------------------
ALTER TABLE partides
    ADD COLUMN IF NOT EXISTS origen TEXT NOT NULL DEFAULT 'c3b';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'partides_origen_check'
    ) THEN
        ALTER TABLE partides
            ADD CONSTRAINT partides_origen_check
            CHECK (origen IN ('c3b', 'ranquing'));
    END IF;
END $$;

COMMENT ON COLUMN partides.origen IS
    'Source of the match record: c3b (manual entry in this app) or ranquing (imported from Ranquing app).';

-- 3. Points columns (used in some modalities, e.g. Lliure team play) ---------
ALTER TABLE partides
    ADD COLUMN IF NOT EXISTS punts INTEGER,
    ADD COLUMN IF NOT EXISTS punts_oponent INTEGER;

COMMENT ON COLUMN partides.punts IS 'Match points scored by player (when applicable, e.g. team competitions).';
COMMENT ON COLUMN partides.punts_oponent IS 'Match points scored by opponent.';

-- 4. Make num nullable for imported rows --------------------------------------
ALTER TABLE partides
    ALTER COLUMN num DROP NOT NULL;

-- The existing UNIQUE(usuari_id, modalitat_id, num) constraint already
-- tolerates NULLs in PostgreSQL (NULLs are considered distinct), so multiple
-- imported rows with NULL num won't conflict. No further change needed.

-- 5. New modalitats -----------------------------------------------------------
INSERT INTO modalitats (nom, descripcio)
VALUES
    ('Q47/2', 'Quadre 47/2 — modalitat de billar artístic'),
    ('Q71/2', 'Quadre 71/2 — modalitat de billar artístic')
ON CONFLICT (nom) DO NOTHING;

-- ============================================================================
COMMIT;

-- Verification queries (run manually after migration if you want):
--   SELECT column_name, data_type, is_nullable FROM information_schema.columns
--     WHERE table_name = 'usuaris' AND column_name = 'web_id';
--   SELECT column_name, data_type, is_nullable FROM information_schema.columns
--     WHERE table_name = 'partides' AND column_name IN ('origen','punts','punts_oponent','num');
--   SELECT * FROM modalitats ORDER BY id;
