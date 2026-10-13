-- Ejecutar antes de desplegar el nuevo checkout/webhook.
alter table public.subscriptions
  add column if not exists checkout_email text,
  add column if not exists mp_payer_email text,
  add column if not exists updated_at timestamptz not null default now();

-- Conserva una copia recuperable de cualquier fila duplicada antes de eliminarla.
create table if not exists public.subscription_duplicates_archive (
  archived_id text primary key,
  payload jsonb not null,
  archive_reason text not null,
  archived_at timestamptz not null default now()
);

alter table public.subscription_duplicates_archive enable row level security;
revoke all on table public.subscription_duplicates_archive from anon, authenticated;

with ranked_subscriptions as (
  select
    id,
    row_number() over (
      partition by mp_preapproval_id
      order by
        current_period_end desc nulls last,
        updated_at desc nulls last,
        created_at desc nulls last,
        id desc
    ) as duplicate_position
  from public.subscriptions
  where mp_preapproval_id is not null
), duplicates as (
  select subscriptions.*
  from public.subscriptions as subscriptions
  join ranked_subscriptions as ranked
    on ranked.id = subscriptions.id
  where ranked.duplicate_position > 1
)
insert into public.subscription_duplicates_archive (
  archived_id,
  payload,
  archive_reason
)
select
  duplicates.id::text,
  to_jsonb(duplicates),
  'duplicate mp_preapproval_id before unique index'
from duplicates
on conflict (archived_id) do nothing;

with ranked_subscriptions as (
  select
    id,
    row_number() over (
      partition by mp_preapproval_id
      order by
        current_period_end desc nulls last,
        updated_at desc nulls last,
        created_at desc nulls last,
        id desc
    ) as duplicate_position
  from public.subscriptions
  where mp_preapproval_id is not null
)
delete from public.subscriptions as subscriptions
using ranked_subscriptions as ranked
where subscriptions.id = ranked.id
  and ranked.duplicate_position > 1
  and exists (
    select 1
    from public.subscription_duplicates_archive as archive
    where archive.archived_id = subscriptions.id::text
  );

create unique index if not exists subscriptions_mp_preapproval_id_unique
  on public.subscriptions (mp_preapproval_id)
  where mp_preapproval_id is not null;

create index if not exists subscriptions_user_id_idx
  on public.subscriptions (user_id);
