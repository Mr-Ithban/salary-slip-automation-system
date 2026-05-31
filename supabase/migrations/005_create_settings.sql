-- =====================================================
-- Migration 005: Create system_settings table for SMTP config
-- =====================================================

create table if not exists system_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table system_settings enable row level security;

-- Authenticated policy
create policy "Authenticated only on system_settings"
  on system_settings for all
  to authenticated
  using (true)
  with check (true);

-- Insert default configs
insert into system_settings (key, value)
values 
  ('smtp_config', '{"host": "smtp.gmail.com", "port": "587", "user": "admin@company.com", "pass": ""}'::jsonb),
  ('company_config', '{"name": "TechCorp Pvt. Ltd.", "address": "Bangalore, India", "cin": "U72200KA2020PTC123456"}'::jsonb)
on conflict (key) do nothing;
