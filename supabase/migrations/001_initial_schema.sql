-- =====================================================
-- SalaryFlow: Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================================================
-- Table: employees
-- =====================================================
create table if not exists employees (
  id          uuid primary key default uuid_generate_v4(),
  emp_id      text unique not null,          -- e.g. EMP001
  name        text not null,
  email       text unique not null,
  designation text not null,
  department  text not null,
  dob         date,
  join_date   date,
  is_active   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- =====================================================
-- Table: salary_records
-- =====================================================
create table if not exists salary_records (
  id           uuid primary key default uuid_generate_v4(),
  employee_id  uuid references employees(id) on delete cascade,
  emp_id       text not null,                -- denormalized for easy lookup
  base_salary  numeric(12,2) not null,
  hra          numeric(12,2) default 0,
  allowances   numeric(12,2) default 0,
  deductions   numeric(12,2) default 0,
  net_salary   numeric(12,2) generated always as
               ((base_salary + hra + allowances) - deductions) stored,
  month        text not null,                -- e.g. "May"
  year         integer not null,
  status       text default 'Pending'
               check (status in ('Pending','Generated','Sent')),
  pdf_url      text,                         -- Supabase Storage URL
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique (emp_id, month, year)               -- one record per employee per month
);

-- =====================================================
-- Table: email_logs
-- =====================================================
create table if not exists email_logs (
  id            uuid primary key default uuid_generate_v4(),
  salary_record_id uuid references salary_records(id) on delete cascade,
  employee_id   uuid references employees(id) on delete cascade,
  recipient_email text not null,
  subject       text,
  status        text default 'Pending'
                check (status in ('Pending','Sent','Failed')),
  error_message text,
  sent_at       timestamptz,
  created_at    timestamptz default now()
);

-- =====================================================
-- Indexes for performance
-- =====================================================
create index if not exists idx_salary_records_emp_id   on salary_records(emp_id);
create index if not exists idx_salary_records_month_yr on salary_records(month, year);
create index if not exists idx_salary_records_status   on salary_records(status);
create index if not exists idx_email_logs_status        on email_logs(status);

-- =====================================================
-- Auto-update updated_at trigger
-- =====================================================
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger employees_updated_at
  before update on employees
  for each row execute procedure handle_updated_at();

create trigger salary_records_updated_at
  before update on salary_records
  for each row execute procedure handle_updated_at();

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================
alter table employees     enable row level security;
alter table salary_records enable row level security;
alter table email_logs     enable row level security;

-- For now: allow all authenticated users (you can tighten later)
create policy "Authenticated users can do all on employees"
  on employees for all to authenticated using (true) with check (true);

create policy "Authenticated users can do all on salary_records"
  on salary_records for all to authenticated using (true) with check (true);

create policy "Authenticated users can do all on email_logs"
  on email_logs for all to authenticated using (true) with check (true);

-- =====================================================
-- Seed demo data (comment out in production)
-- =====================================================
insert into employees (emp_id, name, email, designation, department, dob, join_date) values
  ('EMP001', 'Arjun Sharma',  'arjun.sharma@company.com',  'Senior Engineer',  'Engineering', '1990-03-15', '2020-01-10'),
  ('EMP002', 'Priya Nair',    'priya.nair@company.com',    'Product Manager',   'Product',     '1988-07-22', '2019-06-01'),
  ('EMP003', 'Ravi Menon',    'ravi.menon@company.com',    'UI/UX Designer',    'Design',      '1993-11-05', '2021-03-15'),
  ('EMP004', 'Sunita Patel',  'sunita.patel@company.com',  'HR Manager',        'HR',          '1985-09-12', '2018-08-20'),
  ('EMP005', 'Karan Verma',   'karan.verma@company.com',   'Data Analyst',      'Analytics',   '1995-02-28', '2022-01-05'),
  ('EMP006', 'Deepika Iyer',  'deepika.iyer@company.com',  'Backend Developer', 'Engineering', '1991-06-18', '2020-09-01'),
  ('EMP007', 'Mohit Gupta',   'mohit.gupta@company.com',   'DevOps Engineer',   'Engineering', '1989-12-30', '2019-11-12'),
  ('EMP008', 'Anjali Singh',  'anjali.singh@company.com',  'QA Engineer',       'QA',          '1994-04-07', '2021-07-20')
on conflict (emp_id) do nothing;
