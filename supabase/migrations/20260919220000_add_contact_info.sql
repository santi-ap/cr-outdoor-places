-- Contact info (website, phone, WhatsApp) shown on the place detail page
-- when available. All nullable free-text — no format validation beyond
-- what the suggestion form itself asks for, matching hours_text/
-- cost_amount's existing prototype-grade free-text approach.
alter table places
  add column website text,
  add column phone text,
  add column whatsapp text;
