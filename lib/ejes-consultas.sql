-- Consultas de la herramienta «Pega los ejes temáticos de tu empleo» (/mi-convocatoria), para saber qué temas
-- piden los aspirantes y no tenemos en el banco. No guarda datos personales: solo el texto de los ejes que no
-- reconocimos, cuántos pegó y en qué convocatoria estaba.
-- Ejecutar una vez en el SQL Editor de Supabase. Escribe /api/ejes y lee /admin/ejes, ambos con el service role.

create table if not exists public.ejes_consultas (
  id            bigint generated always as identity primary key,
  convocatoria  text,                                      -- slug del catálogo, o null si la pegó en la página general
  total_ejes    integer     not null check (total_ejes between 1 and 60),
  sin_cobertura text[]      not null default '{}',         -- ejes que no se relacionaron con ningún módulo
  created_at    timestamptz not null default now()
);

create index if not exists ejes_consultas_created_idx on public.ejes_consultas (created_at desc);

-- Sin políticas: solo el service role (servidor) puede leer y escribir.
alter table public.ejes_consultas enable row level security;
