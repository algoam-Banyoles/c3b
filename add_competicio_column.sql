-- Afegir la columna competicio a les taules existents
ALTER TABLE partides_gomez ADD COLUMN IF NOT EXISTS competicio TEXT;
ALTER TABLE partides_chuecos ADD COLUMN IF NOT EXISTS competicio TEXT;
