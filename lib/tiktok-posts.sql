-- Publicaciones de TikTok del equipo, para el control diario en /admin/tiktok.
-- Ejecutar una vez en el SQL Editor de Supabase.
-- Solo escribe el servidor (service role) desde las acciones del panel de administración.

create table if not exists public.tiktok_posts (
  id                 bigint generated always as identity primary key,
  user_id            text        not null,          -- usuario de Clerk que la registró
  video_id           text        not null unique,   -- id del video en TikTok: no se puede registrar dos veces
  url                text        not null,
  author_handle      text,                          -- @usuario de TikTok, sacado del enlace
  posted_at          timestamptz not null,          -- hora de publicación, sacada del id del video
  created_at         timestamptz not null default now(),
  -- Métricas: se llenan cuando se conecte la API de TikTok (fase 2)
  views              bigint,
  likes              integer,
  comments           integer,
  shares             integer,
  metrics_updated_at timestamptz
);

create index if not exists tiktok_posts_user_posted_idx on public.tiktok_posts (user_id, posted_at desc);
create index if not exists tiktok_posts_posted_idx on public.tiktok_posts (posted_at desc);

-- Sin políticas: solo el service role (servidor) puede leer y escribir.
alter table public.tiktok_posts enable row level security;
