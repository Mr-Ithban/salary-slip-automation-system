# SalaryFlow — Employee Salary Slip Automation

> Full-stack payroll automation: React frontend + Supabase backend (PostgreSQL + Edge Functions + Storage).

---

## Project Structure

```
Toyota/
├── frontend/               # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── lib/supabase.js         # Supabase client
│   │   ├── hooks/
│   │   │   ├── useEmployees.js
│   │   │   ├── useSalaryRecords.js
│   │   │   └── useEmailDispatcher.js
│   │   └── pages/
│   └── .env                        # Your Supabase keys (not committed)
└── supabase/
    ├── migrations/
    │   └── 001_initial_schema.sql  # DB schema — run in Supabase SQL editor
    └── functions/
        ├── send-email/index.ts     # Edge Function: email via Resend
        └── process-payroll/index.ts # Edge Function: bulk upsert salary records
```

---

## Quick Start

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) → New Project
2. Note your **Project URL** and **Anon Key** from Settings → API

### 2. Run the Database Schema

1. In Supabase Dashboard → **SQL Editor**
2. Paste and run: `supabase/migrations/001_initial_schema.sql`

### 3. Configure Frontend Environment

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Install & Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit: **http://localhost:5173**

---

## Deploy Supabase Edge Functions

### Prerequisites

```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
```

### Set Edge Function Secrets

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
supabase secrets set FROM_EMAIL=payroll@yourdomain.com
```

> Get a free Resend API key at [https://resend.com](https://resend.com) (100 free emails/day)

### Deploy Functions

```bash
supabase functions deploy send-email
supabase functions deploy process-payroll
```

---

## Features

| Feature | Status |
|---------|--------|
| Employee CRUD (Add/Edit/Delete) | ✅ Supabase |
| Payroll CSV/Excel Upload | ✅ Parsed client-side (xlsx) |
| Bulk salary record generation | ✅ Edge Function |
| Salary slip modal viewer | ✅ Live DB data |
| Email dispatch (individual) | ✅ Edge Function + Resend |
| Email dispatch (bulk) | ✅ With progress bar |
| Email logs tracking | ✅ email_logs table |
| Auto net salary calculation | ✅ Generated column in DB |
| Row Level Security | ✅ Enabled |
| PDF generation | 🔜 Add pdf-lib Edge Function |
| Auth (admin login) | 🔜 Add Supabase Auth |

---

## Payroll CSV Format

Your upload file must have these exact column headers:

| Employee ID | Base Salary | HRA | Allowances | Deductions | Month | Year |
|-------------|-------------|-----|------------|------------|-------|------|
| EMP001 | 85000 | 25500 | 12000 | 9500 | May | 2026 |

---

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `frontend/.env` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `frontend/.env` | Supabase anonymous key |
| `RESEND_API_KEY` | Supabase Secret | Resend API key for emails |
| `FROM_EMAIL` | Supabase Secret | Sender email address |
| `SUPABASE_URL` | Auto-injected | Available inside Edge Functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-injected | Available inside Edge Functions |
