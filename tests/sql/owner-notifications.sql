-- Run ONLY in a fresh disposable PostgreSQL database with psql -v ON_ERROR_STOP=1.
-- Minimal Supabase auth fixtures; this does not exercise hosted Supabase Auth.
begin;
create role anon;
create role authenticated;
create role service_role bypassrls;
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql as $$ select null::uuid $$;
\ir ../../supabase/migrations/202609070001_initial_schema.sql
\ir ../../supabase/migrations/202609070002_workflow_functions.sql
\ir ../../supabase/migrations/202609090001_owner_notifications.sql

insert into enquiries (
  id, reference, idempotency_key, name, phone, email,
  origin_country, origin_city, origin_postal_code, destination_country, destination_city, destination_postal_code,
  contents_description, package_count, approximate_weight, weight_unit, dimensions, dimension_unit,
  preferred_dispatch_date, instructions, internal_notes
) values (
  '00000000-0000-4000-8000-000000000001', 'ENQ-TEST', '00000000-0000-4000-8000-000000000011',
  'Test <customer>', '+91 9876543210', 'customer@example.com', 'India', 'Mohali', '160055', 'Canada', 'Toronto', 'M5V 2T6',
  'Books & papers', 2, 3.5, 'kg', '30 x 20 x 10', 'cm', '2026-10-01', 'Handle carefully', 'Private owner note'
);
insert into support_requests (id, reference, idempotency_key, name, phone, email, subject, message, shipment_reference)
values ('00000000-0000-4000-8000-000000000002', 'SUP-TEST', '00000000-0000-4000-8000-000000000012',
  'Contact customer', '+91 9876543210', 'customer@example.com', 'Shipment query', 'Please explain the route.', 'VKC-TEST123456');

do $$
declare n notification_outbox; claimed integer;
begin
  if (select count(*) from notification_outbox) <> 2 then raise exception 'Expected one outbox row per form'; end if;
  if exists (select 1 from notification_outbox where recipient <> 'vkandcompanymohali@gmail.com'
      or kind <> 'enquiry_owner_notification' or status <> 'pending_configuration' or attempts <> 0
      or last_error <> 'transport_not_configured') then raise exception 'Incorrect notification defaults'; end if;
  select * into strict n from notification_outbox where record_type = 'enquiry';
  if n.payload->>'name' <> 'Test <customer>' or n.payload->>'instructions' <> 'Handle carefully'
     or n.payload->>'destination_city' <> 'Toronto' or (n.payload->>'approximate_weight')::numeric <> 3.5
     or n.payload->>'dimensions' <> '30 x 20 x 10' or n.payload->>'reference' <> 'ENQ-TEST'
     or n.payload ? 'internal_notes' or n.payload ? 'idempotency_key' then
    raise exception 'Quote snapshot incorrect or exposes internal fields';
  end if;
  select * into strict n from notification_outbox where record_type = 'support_request';
  if n.payload->>'message' <> 'Please explain the route.' or n.payload->>'shipment_reference' <> 'VKC-TEST123456'
     or n.payload->>'subject' <> 'Shipment query' then raise exception 'Contact snapshot incorrect'; end if;

  -- Duplicate submission must preserve the original saved data and outbox row.
  begin
    insert into support_requests (reference, idempotency_key, name, phone, subject, message)
    values ('SUP-DUP', '00000000-0000-4000-8000-000000000012', 'Changed name', '+91 9876543210', 'Changed subject', 'Changed message');
    raise exception 'Duplicate idempotency key was accepted';
  exception when unique_violation then null;
  end;
  begin
    insert into notification_outbox (kind, recipient, record_type, record_id, transport, status)
    values ('enquiry_owner_notification', 'attacker@example.com', 'support_request', n.record_id, 'outbox', 'pending_configuration');
    raise exception 'Duplicate notification was accepted';
  exception when unique_violation then null;
  end;
  if (select count(*) from support_requests) <> 1 or (select count(*) from notification_outbox) <> 2 then
    raise exception 'Duplicates changed saved records';
  end if;

  -- Compare-and-set permits only the first dispatch claim.
  update notification_outbox set status='processing', attempts=1 where id=n.id and status='pending_configuration' and attempts=0;
  get diagnostics claimed = row_count;
  if claimed <> 1 then raise exception 'First claim failed'; end if;
  update notification_outbox set status='processing', attempts=1 where id=n.id and status='pending_configuration' and attempts=0;
  get diagnostics claimed = row_count;
  if claimed <> 0 then raise exception 'Duplicate claim succeeded'; end if;
  update notification_outbox set status='failed',last_error='notification_dispatch_failed',next_attempt_at=now()+interval '5 minutes' where id=n.id;
  if not exists (select 1 from support_requests where id=n.record_id) then raise exception 'Dispatch failure removed enquiry'; end if;

  if has_function_privilege('anon', 'owner_notification_recipient()', 'execute')
     or has_function_privilege('authenticated', 'owner_notification_recipient()', 'execute') then
    raise exception 'Recipient setting exposed through public RPC';
  end if;
  if not has_function_privilege('service_role', 'owner_notification_recipient()', 'execute') then
    raise exception 'Service role cannot read receiving inbox';
  end if;
  if not (select relrowsecurity from pg_class where oid='notification_outbox'::regclass) then
    raise exception 'Outbox RLS disabled';
  end if;
end $$;

-- If queuing fails, the whole save must roll back instead of orphaning an enquiry.
create function fail_test_outbox_insert() returns trigger language plpgsql as $$
begin raise exception 'Simulated outbox failure' using errcode='P0002'; end $$;
create trigger fail_test_outbox_insert before insert on notification_outbox
  for each row execute function fail_test_outbox_insert();
do $$
begin
  begin
    insert into support_requests (reference, idempotency_key, name, phone, subject, message)
    values ('SUP-FAIL', gen_random_uuid(), 'Test customer', '+91 9876543210', 'Test subject', 'Test message');
    raise exception 'Expected outbox failure';
  exception when no_data_found then null;
  end;
  if exists (select 1 from support_requests where reference='SUP-FAIL') then raise exception 'Orphaned enquiry'; end if;
end $$;
rollback;
\echo 'Owner notification SQL checks passed; all fixtures rolled back.'
