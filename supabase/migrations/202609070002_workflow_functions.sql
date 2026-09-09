grant execute on function consume_rate_limit(text,text,integer,integer) to service_role;
grant execute on function accept_quote(text,text) to service_role;

create or replace function create_quote_atomic(
  p_enquiry_id uuid, p_reference text, p_currency text, p_valid_until timestamptz,
  p_service_details text, p_estimates text, p_inclusions text, p_exclusions text,
  p_token_hash text, p_token_expires_at timestamptz, p_items jsonb, p_actor uuid
) returns uuid language plpgsql security definer set search_path=public as $$
declare new_id uuid; next_revision integer; computed_total bigint;
begin
  if p_currency !~ '^[A-Z]{3}$' then raise exception 'Currency must be an ISO three-letter code'; end if;
  select coalesce(max(revision),0)+1 into next_revision from quotes where enquiry_id=p_enquiry_id;
  select coalesce(sum((item->>'quantity')::bigint * (item->>'unitAmountMinor')::bigint),0)
    into computed_total from jsonb_array_elements(p_items) item;
  if jsonb_array_length(p_items)=0 then raise exception 'At least one quote item is required'; end if;
  if computed_total < 0 then raise exception 'Invalid quote total'; end if;
  update quotes set status='superseded',updated_at=now() where enquiry_id=p_enquiry_id and status in ('draft','sent');
  insert into quotes(enquiry_id,reference,revision,status,currency,total_minor,valid_until,service_details,estimates,inclusions,exclusions,acceptance_token_hash,acceptance_token_expires_at,sent_at)
  values(p_enquiry_id,p_reference,next_revision,'sent',upper(p_currency),computed_total,p_valid_until,p_service_details,nullif(p_estimates,''),nullif(p_inclusions,''),nullif(p_exclusions,''),p_token_hash,p_token_expires_at,now()) returning id into new_id;
  insert into quote_items(quote_id,description,quantity,unit_amount_minor,sort_order)
    select new_id,item->>'description',(item->>'quantity')::integer,(item->>'unitAmountMinor')::bigint,ordinality-1
    from jsonb_array_elements(p_items) with ordinality as list(item,ordinality);
  update enquiries set status='quoted',updated_at=now() where id=p_enquiry_id;
  insert into audit_events(actor_id,action,record_type,record_id,detail) values(p_actor,'quote.sent','quote',new_id::text,jsonb_build_object('revision',next_revision,'total_minor',computed_total));
  return new_id;
end $$;
revoke all on function create_quote_atomic(uuid,text,text,timestamptz,text,text,text,text,text,timestamptz,jsonb,uuid) from public;
grant execute on function create_quote_atomic(uuid,text,text,timestamptz,text,text,text,text,text,timestamptz,jsonb,uuid) to service_role;

create or replace function add_tracking_event_atomic(
  p_shipment_id uuid, p_status shipment_status, p_description text, p_location text,
  p_occurred_at timestamptz, p_actor uuid
) returns uuid language plpgsql security definer set search_path=public as $$
declare event_id uuid;
begin
  perform 1 from shipments where id=p_shipment_id for update;
  if not found then raise exception 'Shipment not found'; end if;
  insert into tracking_events(shipment_id,status,public_description,public_location,occurred_at,created_by)
    values(p_shipment_id,p_status,p_description,nullif(p_location,''),p_occurred_at,p_actor) returning id into event_id;
  update shipments set status=p_status,last_event_at=greatest(coalesce(last_event_at,p_occurred_at),p_occurred_at),updated_at=now() where id=p_shipment_id;
  insert into audit_events(actor_id,action,record_type,record_id,detail) values(p_actor,'tracking_event.created','shipment',p_shipment_id::text,jsonb_build_object('event_id',event_id,'status',p_status));
  return event_id;
end $$;
revoke all on function add_tracking_event_atomic(uuid,shipment_status,text,text,timestamptz,uuid) from public;
grant execute on function add_tracking_event_atomic(uuid,shipment_status,text,text,timestamptz,uuid) to service_role;
