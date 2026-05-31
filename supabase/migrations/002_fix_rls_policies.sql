-- =====================================================
-- FIX: RLS Policies — allow anon key access
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop old "authenticated-only" policies
drop policy if exists "Authenticated users can do all on employees"     on employees;
drop policy if exists "Authenticated users can do all on salary_records" on salary_records;
drop policy if exists "Authenticated users can do all on email_logs"     on email_logs;

-- New policies: allow both anon and authenticated roles
-- (Tighten these once you add Supabase Auth login)

create policy "Allow all on employees"
  on employees for all
  to anon, authenticated
  using (true)
  with check (true);

create policy "Allow all on salary_records"
  on salary_records for all
  to anon, authenticated
  using (true)
  with check (true);

create policy "Allow all on email_logs"
  on email_logs for all
  to anon, authenticated
  using (true)
  with check (true);
