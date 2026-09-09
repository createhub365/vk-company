-- The receiving inbox is a server-side setting, independent of public business
-- contact details and all customer input. No credentials belong in this function.
create function owner_notification_recipient() returns text
language sql immutable set search_path = public
as $$ select 'vkandcompanymohali@gmail.com'::text $$;
revoke all on function owner_notification_recipient() from public;
grant execute on function owner_notification_recipient() to service_role;

alter table notification_outbox add column provider_message_id text;

-- Existing acknowledgement/other notification rows are left untouched.
create unique index notification_outbox_owner_record_idx
  on notification_outbox(record_type, record_id)
  where kind = 'enquiry_owner_notification';

-- Enquiry and outbox intent commit together. A failed save creates neither;
-- transport failure after commit cannot remove the enquiry or retry payload.
create function queue_enquiry_owner_notification() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into notification_outbox(kind, recipient, record_type, record_id, payload, transport, status, last_error)
  values (
    'enquiry_owner_notification', owner_notification_recipient(),
    case when tg_table_name = 'enquiries' then 'enquiry' else 'support_request' end,
    new.id,
    to_jsonb(new) - array['idempotency_key', 'internal_notes', 'status', 'archived_at', 'created_at', 'updated_at'],
    'outbox', 'pending_configuration', 'transport_not_configured'
  );
  return new;
end $$;
revoke all on function queue_enquiry_owner_notification() from public;

create trigger enquiry_owner_notification_after_insert
  after insert on enquiries for each row execute function queue_enquiry_owner_notification();
create trigger support_owner_notification_after_insert
  after insert on support_requests for each row execute function queue_enquiry_owner_notification();

-- Deliberately no backfill: historical enquiries must not produce surprise mail.
