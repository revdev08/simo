-- Registro de intentos y reportes de errores de las preguntas.
-- Ejecutar una vez en el SQL Editor de Supabase.
-- Las API (/api/attempts y /api/reports) escriben con el service role, igual que /api/progress.

-- Cada respuesta que da un usuario. El primer intento de cada (user_id, question_id)
-- es el que sirve para calcular la dificultad real y la discriminación de cada pregunta.
create table if not exists public.question_attempts (
  id               bigint generated always as identity primary key,
  user_id          text        not null,
  question_id      text        not null,          -- "34" o "TC-909-001"
  question_version integer     not null default 1,
  selected_option  char(1)     not null check (selected_option in ('A','B','C','D')),
  is_correct       boolean     not null,
  time_ms          integer     check (time_ms is null or time_ms between 0 and 3600000),
  mode             text        not null check (mode in ('modulo','simulacro')),
  created_at       timestamptz not null default now()
);

create index if not exists question_attempts_question_idx on public.question_attempts (question_id, created_at);
create index if not exists question_attempts_user_question_idx on public.question_attempts (user_id, question_id, created_at);

-- Errores que reportan los usuarios desde la pregunta.
create table if not exists public.question_reports (
  id               bigint generated always as identity primary key,
  user_id          text        not null,
  question_id      text        not null,
  question_version integer     not null default 1,
  motivo           text        not null check (motivo in ('respuesta_incorrecta','mas_de_una_correcta','norma_desactualizada','redaccion_confusa','otro')),
  comentario       text        check (comentario is null or char_length(comentario) <= 1000),
  estado           text        not null default 'nuevo' check (estado in ('nuevo','revisado','corregido','descartado')),
  created_at       timestamptz not null default now()
);

create index if not exists question_reports_estado_idx on public.question_reports (estado, created_at desc);
create index if not exists question_reports_user_idx on public.question_reports (user_id, created_at desc);

-- Sin políticas: solo el service role (servidor) puede leer y escribir.
alter table public.question_attempts enable row level security;
alter table public.question_reports  enable row level security;

-- Vista de análisis: dificultad real por pregunta usando solo el primer intento de cada usuario.
-- security_invoker hace que la vista respete el RLS de question_attempts (si no, quedaría expuesta por la API pública).
create or replace view public.question_stats with (security_invoker = true) as
with primeros as (
  select distinct on (user_id, question_id)
         user_id, question_id, question_version, selected_option, is_correct, time_ms
  from public.question_attempts
  order by user_id, question_id, created_at
)
select question_id,
       count(*)                                         as usuarios,
       round(avg(is_correct::int)::numeric, 3)          as p_aciertos,
       percentile_cont(0.5) within group (order by time_ms) as tiempo_mediano_ms,
       count(*) filter (where selected_option = 'A')    as eligieron_a,
       count(*) filter (where selected_option = 'B')    as eligieron_b,
       count(*) filter (where selected_option = 'C')    as eligieron_c,
       count(*) filter (where selected_option = 'D')    as eligieron_d
from primeros
group by question_id;
