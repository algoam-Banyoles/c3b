-- Marca "computa al rànquing oficial" a public.partides.
--
-- La calcula i escriu FCBillar (cmd: `fcbillar publish-estadistiques-computa`,
-- dins de `publish-cloud`), casant cada partida amb la finestra oficial federativa
-- (taula fcbillar.ranking_game_links). Aplicar un sol cop a Supabase.

alter table public.partides
    add column if not exists computa boolean not null default false;

alter table public.partides
    add column if not exists computa_font text;

comment on column public.partides.computa is
    'true = la partida entra a la finestra oficial del rànquing federatiu vigent (marcat per FCBillar)';
comment on column public.partides.computa_font is
    'traça de l''origen del flag, p. ex. fcbillar:rk<ranking_id>';
