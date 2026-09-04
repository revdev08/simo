-- Ejecutar antes de desplegar el nuevo checkout/webhook.
alter table public.subscriptions
  add column if not exists checkout_email text,
  add column if not exists mp_payer_email text,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists subscriptions_mp_preapproval_id_unique
  on public.subscriptions (mp_preapproval_id)
  where mp_preapproval_id is not null;

create index if not exists subscriptions_user_id_idx
  on public.subscriptions (user_id);
