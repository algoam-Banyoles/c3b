-- Marca "computarà al PROPER rànquing" a public.partides.
--
-- Company del flag `computa` (finestra oficial vigent). `computa_prox` marca les
-- 15 partides que computaran DESPRÉS de la propera actualització del rànquing: els
-- games que hi resten (fcbillar.ranking_provisional.window_game_ids) + les partides
-- pendents encara no publicades (fcbillar.pending_games). Sense partides pendents,
-- coincideix amb `computa`.
--
-- La calcula i escriu FCBillar (cmd: `fcbillar publish-estadistiques-computa`, dins
-- de `publish-cloud`). Aplicar un sol cop a Supabase.

alter table public.partides
    add column if not exists computa_prox boolean not null default false;

alter table public.partides
    add column if not exists computa_prox_font text;

comment on column public.partides.computa_prox is
    'true = la partida entrarà a la finestra del PROPER rànquing federatiu (projecció FCBillar)';
comment on column public.partides.computa_prox_font is
    'traça de l''origen del flag, p. ex. fcbillar:rk<ranking_id>';
