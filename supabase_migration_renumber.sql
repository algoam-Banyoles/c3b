-- Funció per renumerar `num` (posició cronològica) de les partides d'un usuari+
-- modalitat per data, de forma segura amb el constraint únic (usuari,modalitat,num).
--
-- La crida FCBillar (publish-estadistiques-partides) després d'inserir partides
-- oficials/pendents noves, perquè `num` segueixi l'ordre de data. Primer mou els num
-- existents fora de rang i després assigna 1..N per ordre de data (evita col·lisions
-- transitòries del constraint únic). Aplicar un sol cop a Supabase.

create or replace function public.renumber_estadistiques(p_usuari int, p_mod int)
returns void
language plpgsql
as $$
begin
  update public.partides set num = num + 1000000
    where usuari_id = p_usuari and modalitat_id = p_mod and num is not null;
  with ordered as (
    select id, row_number() over (order by data nulls last, id) as rn
    from public.partides where usuari_id = p_usuari and modalitat_id = p_mod
  )
  update public.partides p set num = o.rn from ordered o where p.id = o.id;
end;
$$;
