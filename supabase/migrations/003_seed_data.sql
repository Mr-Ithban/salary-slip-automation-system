-- =====================================================
-- Seed: Demo employee data
-- Run this in Supabase SQL Editor
-- =====================================================

insert into employees (emp_id, name, email, designation, department, dob, join_date) values
  ('EMP001', 'Arjun Sharma',  'arjun.sharma@company.com',  'Senior Engineer',    'Engineering', '1990-03-15', '2020-01-10'),
  ('EMP002', 'Priya Nair',    'priya.nair@company.com',    'Product Manager',     'Product',     '1988-07-22', '2019-06-01'),
  ('EMP003', 'Ravi Menon',    'ravi.menon@company.com',    'UI/UX Designer',      'Design',      '1993-11-05', '2021-03-15'),
  ('EMP004', 'Sunita Patel',  'sunita.patel@company.com',  'HR Manager',          'HR',          '1985-09-12', '2018-08-20'),
  ('EMP005', 'Karan Verma',   'karan.verma@company.com',   'Data Analyst',        'Analytics',   '1995-02-28', '2022-01-05'),
  ('EMP006', 'Deepika Iyer',  'deepika.iyer@company.com',  'Backend Developer',   'Engineering', '1991-06-18', '2020-09-01'),
  ('EMP007', 'Mohit Gupta',   'mohit.gupta@company.com',   'DevOps Engineer',     'Engineering', '1989-12-30', '2019-11-12'),
  ('EMP008', 'Anjali Singh',  'anjali.singh@company.com',  'QA Engineer',         'QA',          '1994-04-07', '2021-07-20')
on conflict (emp_id) do nothing;

-- Seed salary records for May 2026
insert into salary_records (employee_id, emp_id, base_salary, hra, allowances, deductions, month, year, status)
select
  e.id,
  e.emp_id,
  s.base_salary,
  s.hra,
  s.allowances,
  s.deductions,
  'May',
  2026,
  s.status
from (values
  ('EMP001', 85000, 25500, 12000, 9500,  'Sent'),
  ('EMP002', 95000, 28500, 15000, 11000, 'Sent'),
  ('EMP003', 72000, 21600, 9000,  7800,  'Generated'),
  ('EMP004', 78000, 23400, 10000, 8500,  'Sent'),
  ('EMP005', 68000, 20400, 8000,  7200,  'Generated'),
  ('EMP006', 88000, 26400, 13000, 10200, 'Sent'),
  ('EMP007', 82000, 24600, 11000, 9000,  'Pending'),
  ('EMP008', 65000, 19500, 7500,  6800,  'Pending')
) as s(emp_id, base_salary, hra, allowances, deductions, status)
join employees e on e.emp_id = s.emp_id
on conflict (emp_id, month, year) do nothing;
