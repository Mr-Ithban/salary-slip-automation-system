-- =====================================================
-- Migration 004: Lock down RLS to authenticated users only
-- Run in Supabase SQL Editor AFTER adding auth
-- =====================================================

-- Drop permissive anon policies
drop policy if exists "Allow all on employees"      on employees;
drop policy if exists "Allow all on salary_records" on salary_records;
drop policy if exists "Allow all on email_logs"     on email_logs;

-- Authenticated users only (admin dashboard is login-gated)
create policy "Authenticated only on employees"
  on employees for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated only on salary_records"
  on salary_records for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated only on email_logs"
  on email_logs for all
  to authenticated
  using (true)
  with check (true);
