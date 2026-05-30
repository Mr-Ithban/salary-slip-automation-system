// Mock data for frontend demonstration
export const employees = [
  { id: 'EMP001', name: 'Arjun Sharma',    email: 'arjun.sharma@company.com',    designation: 'Senior Engineer',     department: 'Engineering', dob: '1990-03-15', joinDate: '2020-01-10', avatar: 'AS' },
  { id: 'EMP002', name: 'Priya Nair',      email: 'priya.nair@company.com',      designation: 'Product Manager',      department: 'Product',     dob: '1988-07-22', joinDate: '2019-06-01', avatar: 'PN' },
  { id: 'EMP003', name: 'Ravi Menon',      email: 'ravi.menon@company.com',      designation: 'UI/UX Designer',       department: 'Design',      dob: '1993-11-05', joinDate: '2021-03-15', avatar: 'RM' },
  { id: 'EMP004', name: 'Sunita Patel',    email: 'sunita.patel@company.com',    designation: 'HR Manager',           department: 'HR',          dob: '1985-09-12', joinDate: '2018-08-20', avatar: 'SP' },
  { id: 'EMP005', name: 'Karan Verma',     email: 'karan.verma@company.com',     designation: 'Data Analyst',         department: 'Analytics',   dob: '1995-02-28', joinDate: '2022-01-05', avatar: 'KV' },
  { id: 'EMP006', name: 'Deepika Iyer',    email: 'deepika.iyer@company.com',    designation: 'Backend Developer',    department: 'Engineering', dob: '1991-06-18', joinDate: '2020-09-01', avatar: 'DI' },
  { id: 'EMP007', name: 'Mohit Gupta',     email: 'mohit.gupta@company.com',     designation: 'DevOps Engineer',      department: 'Engineering', dob: '1989-12-30', joinDate: '2019-11-12', avatar: 'MG' },
  { id: 'EMP008', name: 'Anjali Singh',    email: 'anjali.singh@company.com',    designation: 'QA Engineer',          department: 'QA',          dob: '1994-04-07', joinDate: '2021-07-20', avatar: 'AS2' },
]

export const salaryData = [
  { employeeId: 'EMP001', baseSalary: 85000, hra: 25500, allowances: 12000, deductions: 9500, month: 'May', year: 2026, status: 'Sent' },
  { employeeId: 'EMP002', baseSalary: 95000, hra: 28500, allowances: 15000, deductions: 11000, month: 'May', year: 2026, status: 'Sent' },
  { employeeId: 'EMP003', baseSalary: 72000, hra: 21600, allowances: 9000,  deductions: 7800,  month: 'May', year: 2026, status: 'Generated' },
  { employeeId: 'EMP004', baseSalary: 78000, hra: 23400, allowances: 10000, deductions: 8500,  month: 'May', year: 2026, status: 'Sent' },
  { employeeId: 'EMP005', baseSalary: 68000, hra: 20400, allowances: 8000,  deductions: 7200,  month: 'May', year: 2026, status: 'Generated' },
  { employeeId: 'EMP006', baseSalary: 88000, hra: 26400, allowances: 13000, deductions: 10200, month: 'May', year: 2026, status: 'Sent' },
  { employeeId: 'EMP007', baseSalary: 82000, hra: 24600, allowances: 11000, deductions: 9000,  month: 'May', year: 2026, status: 'Pending' },
  { employeeId: 'EMP008', baseSalary: 65000, hra: 19500, allowances: 7500,  deductions: 6800,  month: 'May', year: 2026, status: 'Pending' },
]

export const monthlyPayrollTrend = [
  { month: 'Dec', total: 580000 },
  { month: 'Jan', total: 592000 },
  { month: 'Feb', total: 588000 },
  { month: 'Mar', total: 605000 },
  { month: 'Apr', total: 610000 },
  { month: 'May', total: 633000 },
]

export const departmentDistribution = [
  { name: 'Engineering', value: 3, color: '#7c3aed' },
  { name: 'Product',     value: 1, color: '#06b6d4' },
  { name: 'Design',      value: 1, color: '#10b981' },
  { name: 'HR',          value: 1, color: '#f59e0b' },
  { name: 'Analytics',   value: 1, color: '#ef4444' },
  { name: 'QA',          value: 1, color: '#8b5cf6' },
]

export const recentActivity = [
  { id: 1, action: 'Salary slip generated',   employee: 'Arjun Sharma',  time: '2 mins ago',  type: 'generate' },
  { id: 2, action: 'Email dispatched',         employee: 'Priya Nair',    time: '5 mins ago',  type: 'email'    },
  { id: 3, action: 'Payroll uploaded',         employee: 'Admin',         time: '12 mins ago', type: 'upload'   },
  { id: 4, action: 'Email dispatched',         employee: 'Sunita Patel',  time: '18 mins ago', type: 'email'    },
  { id: 5, action: 'Salary slip generated',   employee: 'Deepika Iyer',  time: '25 mins ago', type: 'generate' },
]

export const getNetSalary = (row) =>
  (row.baseSalary + row.hra + row.allowances) - row.deductions
