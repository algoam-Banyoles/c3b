-- ============================================================================
-- Migration: prevent duplicate matches at the DB level
-- ----------------------------------------------------------------------------
-- A match is considered a duplicate if the same player has another match in
-- the same modality, on the same date, against the same opponent, with the
-- exact same caramboles and entrades. The probability of two genuinely
-- distinct matches sharing all six fields is essentially zero in real play;
-- if it ever happens the user can nudge one value by 1 to bypass the check.
--
-- Verified before applying: 0 existing rows violate this constraint
-- (342 partides, 0 duplicate keys).
--
-- Idempotent.
-- ============================================================================

BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'partides_no_duplicates'
    ) THEN
        ALTER TABLE partides
            ADD CONSTRAINT partides_no_duplicates
            UNIQUE (usuari_id, modalitat_id, data, oponent, caramboles, entrades);
    END IF;
END $$;

COMMENT ON CONSTRAINT partides_no_duplicates ON partides IS
    'Prevents accidentally inserting the same match twice. Six-tuple identity: same player, modality, date, opponent and exact score.';

COMMIT;
