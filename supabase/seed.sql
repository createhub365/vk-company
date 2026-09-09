-- Development only. Deliberately does not create an owner or customer records.
-- Use local Supabase Studio or the documented bootstrap command with an explicit auth UUID.
insert into published_content(key,title,body,published)
values
  ('faq.packaging','How should I prepare my parcel?','Share the contents and packaging details with our team. Requirements depend on the shipment and route.',true),
  ('faq.international','What is needed for an international shipment?','Acceptance, documentation, availability and charges are confirmed for each shipment.',true)
on conflict (key) do nothing;
