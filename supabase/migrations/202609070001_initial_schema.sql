-- VK AND COMPANY initial operational schema
-- All business tables are private by default. Public access is through narrow server routes.
create extension if not exists pgcrypto;

create type enquiry_status as enum ('new','reviewing','quoted','closed','declined');
create type quote_status as enum ('draft','sent','accepted','rejected','expired','superseded','revoked');
create type booking_status as enum ('confirmed','preparing','ready','cancelled','completed');
create type shipment_status as enum ('booked','collected','dispatched','in_transit','out_for_delivery','delivery_attempted','delivered','delayed','return_in_transit','returned','cancelled');
create type pickup_status as enum ('requested','confirmed','rescheduled','declined','cancelled');
create type payment_status as enum ('not_recorded','pending_verification','verified','failed','refunded');

create table admin_users (
  auth_user_id uuid primary key references auth.users(id) on delete restrict,
  role text not null default 'owner' check (role = 'owner'),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table enquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  idempotency_key uuid not null unique,
  status enquiry_status not null default 'new',
  name text not null, phone text not null, email text,
  origin_country text not null, origin_city text not null, origin_postal_code text not null,
  destination_country text not null, destination_city text not null, destination_postal_code text not null,
  contents_description text not null, package_count integer not null check (package_count > 0),
  approximate_weight numeric(12,3) not null check (approximate_weight > 0),
  weight_unit text not null check (weight_unit in ('kg','lb')),
  dimensions text, dimension_unit text not null check (dimension_unit in ('cm','in')),
  preferred_dispatch_date date, pickup_requested boolean not null default false,
  instructions text, internal_notes text,
  archived_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index enquiries_status_created_idx on enquiries(status, created_at desc);
create index enquiries_reference_search_idx on enquiries(reference);

create table quotes (
  id uuid primary key default gen_random_uuid(), enquiry_id uuid not null references enquiries(id) on delete restrict,
  reference text not null unique, revision integer not null default 1 check (revision > 0),
  status quote_status not null default 'draft', currency char(3) not null,
  total_minor bigint not null default 0 check (total_minor >= 0), valid_until timestamptz not null,
  service_details text not null, estimates text, inclusions text, exclusions text,
  acceptance_token_hash text unique, acceptance_token_expires_at timestamptz,
  sent_at timestamptz, accepted_at timestamptz, rejected_at timestamptz,
  supersedes_quote_id uuid references quotes(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(enquiry_id, revision)
);
create index quotes_enquiry_idx on quotes(enquiry_id, created_at desc);

create table quote_items (
  id uuid primary key default gen_random_uuid(), quote_id uuid not null references quotes(id) on delete cascade,
  description text not null, quantity integer not null check (quantity > 0),
  unit_amount_minor bigint not null check (unit_amount_minor >= 0), sort_order integer not null default 0
);

create table bookings (
  id uuid primary key default gen_random_uuid(), quote_id uuid not null unique references quotes(id) on delete restrict,
  enquiry_id uuid not null references enquiries(id) on delete restrict, reference text not null unique,
  status booking_status not null default 'confirmed', payment_status payment_status not null default 'not_recorded',
  payment_amount_minor bigint, payment_currency char(3), payment_method text, payment_verified_reference text,
  payment_verified_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table shipments (
  id uuid primary key default gen_random_uuid(), booking_id uuid not null references bookings(id) on delete restrict,
  public_tracking_code text not null unique, status shipment_status not null default 'booked',
  courier_partner_name text, courier_partner_tracking_number text,
  source text not null default 'manual' check (source in ('manual','partner')),
  partner_tracking_url text, is_test boolean not null default false,
  last_event_at timestamptz, archived_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index shipments_booking_idx on shipments(booking_id);

create table tracking_events (
  id uuid primary key default gen_random_uuid(), shipment_id uuid not null references shipments(id) on delete restrict,
  status shipment_status not null, public_description text not null, public_location text,
  occurred_at timestamptz not null, recorded_at timestamptz not null default now(),
  corrected_at timestamptz, correction_reason text, created_by uuid references auth.users(id) on delete restrict
);
create index tracking_events_public_idx on tracking_events(shipment_id, occurred_at desc);

create table pickup_requests (
  id uuid primary key default gen_random_uuid(), enquiry_id uuid references enquiries(id) on delete restrict,
  booking_id uuid references bookings(id) on delete restrict, status pickup_status not null default 'requested',
  address_line_1 text not null, address_line_2 text, city text not null, region text, postal_code text not null, country text not null,
  contact_name text not null, contact_phone text not null, preferred_date date not null, confirmed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (enquiry_id is not null or booking_id is not null)
);

create table support_requests (
  id uuid primary key default gen_random_uuid(), reference text not null unique, idempotency_key uuid not null unique,
  name text not null, email text, phone text, subject text not null, message text not null,
  shipment_reference text, status text not null default 'open' check (status in ('open','in_progress','resolved','closed')),
  internal_notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table published_content (
  id uuid primary key default gen_random_uuid(), key text not null unique, title text not null, body text not null,
  published boolean not null default false, reviewed_at timestamptz,
  updated_by uuid references auth.users(id) on delete set null, updated_at timestamptz not null default now()
);

create table business_settings (
  id boolean primary key default true check (id), phone text, whatsapp text, email text, address text,
  map_url text, operating_hours text, pickup_enabled boolean not null default false,
  courier_integrations jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null, updated_at timestamptz not null default now()
);
insert into business_settings(id) values (true);

create table audit_events (
  id bigint generated always as identity primary key, actor_id uuid references auth.users(id) on delete set null,
  action text not null, record_type text not null, record_id text not null, detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_events_record_idx on audit_events(record_type, record_id, created_at desc);

create table notification_outbox (
  id uuid primary key default gen_random_uuid(), kind text not null, recipient text, record_type text not null, record_id uuid not null,
  payload jsonb not null default '{}'::jsonb, transport text not null, status text not null,
  attempts integer not null default 0, last_error text, next_attempt_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index notification_outbox_status_idx on notification_outbox(status, next_attempt_at);

create table rate_limits (
  bucket text not null, fingerprint_hash text not null, window_started_at timestamptz not null,
  request_count integer not null default 1, primary key(bucket, fingerprint_hash)
);

create or replace function is_owner() returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from admin_users where auth_user_id = auth.uid() and active) $$;
revoke all on function is_owner() from public;
grant execute on function is_owner() to authenticated;

create or replace function consume_rate_limit(p_bucket text, p_fingerprint text, p_limit integer, p_window_seconds integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare k text := encode(digest(p_fingerprint, 'sha256'), 'hex'); c integer; started timestamptz;
begin
  insert into rate_limits(bucket, fingerprint_hash, window_started_at, request_count)
  values (p_bucket, k, now(), 1)
  on conflict (bucket, fingerprint_hash) do update set
    window_started_at = case when rate_limits.window_started_at < now() - make_interval(secs => p_window_seconds) then now() else rate_limits.window_started_at end,
    request_count = case when rate_limits.window_started_at < now() - make_interval(secs => p_window_seconds) then 1 else rate_limits.request_count + 1 end
  returning request_count, window_started_at into c, started;
  return c <= p_limit;
end $$;
revoke all on function consume_rate_limit(text,text,integer,integer) from public;

create or replace function accept_quote(p_token_hash text, p_booking_reference text)
returns table(booking_reference text, already_accepted boolean) language plpgsql security definer set search_path = public as $$
declare q quotes; existing bookings;
begin
  select * into q from quotes where acceptance_token_hash = p_token_hash for update;
  if q.id is null then raise exception 'Offer not found'; end if;
  select * into existing from bookings where quote_id = q.id;
  if existing.id is not null then return query select existing.reference, true; return; end if;
  if q.status <> 'sent' then raise exception 'Offer is not available'; end if;
  if q.valid_until <= now() or q.acceptance_token_expires_at <= now() then raise exception 'Offer has expired'; end if;
  if exists(select 1 from quotes newer where newer.enquiry_id=q.enquiry_id and newer.revision>q.revision and newer.status <> 'revoked') then
    raise exception 'Offer has been superseded';
  end if;
  update quotes set status='accepted', accepted_at=now(), updated_at=now() where id=q.id;
  update enquiries set status='quoted', updated_at=now() where id=q.enquiry_id;
  insert into bookings(quote_id,enquiry_id,reference) values(q.id,q.enquiry_id,p_booking_reference) returning * into existing;
  insert into audit_events(action,record_type,record_id,detail) values('quote.accepted','quote',q.id::text,jsonb_build_object('booking_id',existing.id));
  return query select existing.reference, false;
end $$;
revoke all on function accept_quote(text,text) from public;

alter table admin_users enable row level security;
alter table enquiries enable row level security;
alter table quotes enable row level security;
alter table quote_items enable row level security;
alter table bookings enable row level security;
alter table shipments enable row level security;
alter table tracking_events enable row level security;
alter table pickup_requests enable row level security;
alter table support_requests enable row level security;
alter table published_content enable row level security;
alter table business_settings enable row level security;
alter table audit_events enable row level security;
alter table notification_outbox enable row level security;
alter table rate_limits enable row level security;

create policy owner_admin_users_select on admin_users for select to authenticated using (is_owner());
create policy owner_enquiries_all on enquiries for all to authenticated using (is_owner()) with check (is_owner());
create policy owner_quotes_all on quotes for all to authenticated using (is_owner()) with check (is_owner());
create policy owner_quote_items_all on quote_items for all to authenticated using (is_owner()) with check (is_owner());
create policy owner_bookings_all on bookings for all to authenticated using (is_owner()) with check (is_owner());
create policy owner_shipments_all on shipments for all to authenticated using (is_owner()) with check (is_owner());
create policy owner_tracking_events_all on tracking_events for all to authenticated using (is_owner()) with check (is_owner());
create policy owner_pickups_all on pickup_requests for all to authenticated using (is_owner()) with check (is_owner());
create policy owner_support_all on support_requests for all to authenticated using (is_owner()) with check (is_owner());
create policy public_content_read on published_content for select to anon, authenticated using (published);
create policy owner_content_all on published_content for all to authenticated using (is_owner()) with check (is_owner());
create policy owner_settings_all on business_settings for all to authenticated using (is_owner()) with check (is_owner());
create policy owner_audit_read on audit_events for select to authenticated using (is_owner());
create policy owner_outbox_all on notification_outbox for all to authenticated using (is_owner()) with check (is_owner());

-- No insert/update/delete policy exists on admin_users. Owner identities are bootstrapped via audited SQL only.
-- No anonymous policy exists for private operational tables.
