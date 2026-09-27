-- ─────────────────────────────────────────────────────────────────────────
--  RoadNest – foglalások
--  Futtasd le egyszer a Supabase irányítópult SQL Editorában (vagy
--  `supabase db push` paranccsal).
-- ─────────────────────────────────────────────────────────────────────────

-- A dátumtartományok átfedés-ellenőrzéséhez kell (exclusion constraint).
create extension if not exists btree_gist;

do $$ begin
  create type public.booking_status as enum ('pending', 'confirmed', 'cancelled', 'expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_option as enum ('full', 'deposit');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.balance_status as enum ('not_required', 'scheduled', 'processing', 'paid', 'failed');
exception when duplicate_object then null; end $$;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  access_token text not null,
  status public.booking_status not null default 'pending',

  check_in date not null,
  check_out date not null,
  nights integer generated always as (check_out - check_in) stored,
  -- [érkezés, távozás): a távozás napján már érkezhet a következő vendég
  stay daterange generated always as (daterange(check_in, check_out, '[)')) stored,
  -- Függő foglalásnál eddig vannak zárolva a dátumok
  expires_at timestamptz,

  guest_name text not null,
  guest_email text not null,
  guest_phone text not null,
  guest_birth_date date not null,
  guest_postal_code text not null,
  guest_city text not null,
  guest_street text not null,
  guest_country text not null,
  guest_count smallint not null,
  licence_number text not null,
  licence_country text not null,
  licence_issued_at date not null,
  licence_expires_at date not null,
  notes text not null default '',

  extras jsonb not null default '[]'::jsonb,
  quote jsonb not null,
  currency text not null,
  total_amount integer not null,
  security_deposit integer not null,
  payment_option public.payment_option not null,
  amount_due_now integer not null,
  balance_amount integer not null default 0,
  balance_due_date date,
  balance_status public.balance_status not null default 'not_required',
  amount_paid integer not null default 0,

  stripe_customer_id text,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  stripe_payment_method_id text,
  stripe_balance_payment_intent_id text,

  terms_accepted_at timestamptz not null,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint bookings_dates_check check (check_out > check_in),
  -- DUPLA FOGLALÁS ELLEN: két függő vagy megerősített foglalás nem fedheti át egymást.
  -- A lejárt és lemondott foglalások nem számítanak.
  constraint bookings_no_overlap exclude using gist (stay with &&)
    where (status in ('pending', 'confirmed'))
);

create index if not exists bookings_status_expires_idx on public.bookings (status, expires_at);
create index if not exists bookings_balance_idx on public.bookings (balance_status, balance_due_date);
create index if not exists bookings_check_in_idx on public.bookings (check_in);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- A táblához csak a szerver fér hozzá (service role / secret key).
-- A nyilvános (anon) kulcs semmit nem láthat belőle.
alter table public.bookings enable row level security;
revoke all on public.bookings from anon, authenticated;
