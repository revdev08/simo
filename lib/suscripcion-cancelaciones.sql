-- Motivos de cancelación de la suscripción desde «Mi progreso», para saber qué mejorar.
-- Ejecutar una vez en el SQL Editor de Supabase. Escribe la acción de cancelar y lee /admin/cancelaciones,
-- ambos con el service role.

create table if not exists public.suscripcion_cancelaciones (
  id            bigint generated always as identity primary key,
  user_id       text        not null,            -- usuario de Clerk
  plan          text,                            -- plan_id de la suscripción cancelada
  motivo        text        check (motivo is null or motivo in ('ya_presente','precio','sin_tiempo','no_encuentro_concurso','contenido','otro')),
  comentario    text        check (comentario is null or char_length(comentario) <= 500),
  acceso_hasta  timestamptz,                     -- hasta cuándo conserva el acceso
  created_at    timestamptz not null default now()
);

create index if not exists suscripcion_cancelaciones_created_idx on public.suscripcion_cancelaciones (created_at desc);

-- Sin políticas: solo el service role (servidor) puede leer y escribir.
alter table public.suscripcion_cancelaciones enable row level security;
