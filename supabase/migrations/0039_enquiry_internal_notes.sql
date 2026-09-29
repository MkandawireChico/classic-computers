-- 0039_enquiry_internal_notes.sql
--
-- Found while building enquiry admin (Phase 6, section 7): neither
-- enquiries nor corporate_enquiries (0024) has ANY notes column — the
-- brief asks for internal notes on both. Adding staff-only columns;
-- customer-visible replies are deferred (see PHASE_6 report) since that
-- would need a reply/thread model, not just one text field, to do
-- properly rather than as a half-built afterthought.

alter table enquiries add column internal_notes text;
alter table corporate_enquiries add column internal_notes text;
