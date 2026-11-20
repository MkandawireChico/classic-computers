-- Trigger functions are not public RPC endpoints. Their attached triggers
-- continue to invoke them without granting direct client execution.
revoke all on function public.apply_business_document_decision() from public, anon, authenticated;
revoke all on function public.refresh_business_document_payment_status() from public, anon, authenticated;
revoke all on function public.guard_repair_work_log_insert() from public, anon, authenticated;
revoke all on function public.audit_repair_work_log_insert() from public, anon, authenticated;
revoke all on function public.guard_business_document_item_write() from public, anon, authenticated;
revoke all on function public.guard_business_document_transaction() from public, anon, authenticated;
