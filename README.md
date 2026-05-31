# 🌟 SalaryFlow — Premium Employee Salary Slip Automation System

> **SalaryFlow** is a state-of-the-art, full-stack payroll automation and management platform. Built using a sleek, premium dark-themed React frontend and powered by a secure Supabase backend, it automates the entire process of uploading payroll data, generating gorgeous interactive PDFs, and dispatching password-protected salary slips directly to employees.

---

## 🎨 Design System & Visual Excellence
SalaryFlow features an incredibly rich, modern user interface inspired by premium dashboard experiences:
*   **Vibrant Color Palette**: Tailored Tailwind CSS config with cohesive deep grays, cyan/blue highlights, and glassmorphic UI elements.
*   **Physics-Based Micro-Animations**: Smooth, interactive sidebar menus, button transitions, and **lateral detail sheets** powered by **Framer Motion**.
*   **Beautiful Visualizations**: Real-time payroll trends, statistics card grids, and interactive salary breakdown charts using **Recharts**.
*   **Dynamic Response States**: Instant feedback for file parsing, database synchronization, and email dispatch status.

---

## 🏗️ System Architecture & Code Structure

```text
Toyota/
├── frontend/                     # React 18 + Vite + Tailwind CSS V4 + Framer Motion
│   ├── src/
│   │   ├── components/           # Core Layout, Sidebar, Navbar, and Protected Route components
│   │   │   ├── Navbar.jsx        # Live global search and real-time notification bell panel
│   │   │   ├── Sidebar.jsx       # Elegant physics-based responsive sidebar
│   │   │   └── Layout.jsx        # Master template wrap
│   │   ├── hooks/                # Secure Supabase data connector hooks
│   │   │   ├── useEmployees.jsx  # Employee CRUD state management
│   │   │   ├── useSalaryRecords.jsx# Monthly payroll state management
│   │   │   └── useAuth.jsx       # Supabase Admin Session management
│   │   ├── pages/                # High-fidelity dashboard views
│   │   │   ├── Dashboard.jsx     # Payroll trends, stats dashboard, & real-time visual charts
│   │   │   ├── EmployeeManagement.jsx # Full-featured employee directory and interactive profile drawers
│   │   │   ├── UploadPortal.jsx  # Drag-and-drop CSV parser with instant preview grids
│   │   │   ├── SalarySlips.jsx   # Interactive modal PDF viewer and dispatch panel
│   │   │   ├── EmailDispatcher.jsx# Advanced bulk dispatcher with queue tracking
│   │   │   ├── Settings.jsx      # SMTP configuration and company profiles
│   │   │   └── Login.jsx         # Secure modern glassmorphic admin log-in portal
│   │   ├── lib/
│   │   │   └── supabase.js       # Global Supabase client initialization
│   │   └── index.css             # Main stylesheet & animation rules
│   ├── .env                      # Local Supabase credentials configuration (Git ignored)
│   └── package.json              # Client-side dependencies and script runners
│
└── supabase/                     # Supabase Backend Configuration
    ├── migrations/               # PostgreSQL structural migrations
    │   ├── 001_initial_schema.sql  # Initializes base schema (employees, salary_records, email_logs)
    │   ├── 002_fix_rls_policies.sql# Sets up public-facing read-write permissions
    │   ├── 003_seed_data.sql     # Injects mock admin and employee records for staging
    │   ├── 004_secure_rls.sql    # Bulletproofs Row-Level Security tables
    │   └── 005_create_settings.sql# Integrates global company profile and SMTP database tables
    └── functions/                # Deno Edge Functions
        ├── send-email/           # Dispatches secure emails via dynamic SMTP (Nodemailer), Brevo, or Resend
        └── process-payroll/      # Edge engine processing bulk database payroll upserts
```

---

## ⚡ Core Features

| Feature | Description | Technologies |
| :--- | :--- | :--- |
| **Admin Dashboard** | Real-time visual metrics, salary statistics, and graphical charts. | React, Recharts |
| **Interactive Drawers** | Physics-based slide-out panels displaying live employee histories. | Framer Motion |
| **Drag & Drop Upload** | Clientside CSV parser featuring structured validation and grid previews. | XLSX, Tailwind |
| **Dynamic PDF Generator**| Standard-compliant, downloadable, password-protected PDF compiler. | jsPDF |
| **Smart Email Dispatcher**| Multi-threaded bulk email queue with status tracking and history. Multi-provider strategy supporting custom SMTP (Nodemailer), Brevo, and Resend. | Edge Functions + Nodemailer / Brevo / Resend |
| **Relational Database** | Relational integrity, triggers, auto-updating calculated salaries. | PostgreSQL, Supabase |
| **Row Level Security** | Multi-tenant row access policies securing confidential data. | Supabase RLS |

---

## 🚀 Setup & Execution Guide (Any Device)

Follow this universal guide to run the entire SalaryFlow codebase locally on any system with Node.js and npm installed.

### 📋 Prerequisites
*   [Node.js](https://nodejs.org/) (version `18.x` or higher recommended)
*   [Git](https://git-scm.com/) installed
*   A free [Supabase](https://supabase.com) account

---

### Step 1: Clone and Prepare Workspace
Open your terminal and clone or enter the project directory:
```bash
cd Toyota
```

---

### Step 2: Database Provisioning (Supabase Setup)

1.  **Create a New Project**:
    *   Sign in to [Supabase](https://supabase.com) and click **New Project**.
    *   Set your project name, password, and region.
2.  **Execute the SQL Migrations**:
    *   From the Supabase sidebar, select **SQL Editor** -> click **New Query**.
    *   Open and copy the contents of the local migrations in the following order, then paste and click **Run** in the editor for each:
        1.  `supabase/migrations/001_initial_schema.sql` (Creates base database structure)
        2.  `supabase/migrations/002_fix_rls_policies.sql` (Adjusts RLS policies)
        3.  `supabase/migrations/003_seed_data.sql` (Seeds the DB with mock employees for immediate testing)
        4.  `supabase/migrations/004_secure_rls.sql` (Secures access control tables)
        5.  `supabase/migrations/005_create_settings.sql` (Initializes settings records)
3.  **Capture Credentials**:
    *   Go to **Project Settings** -> **API**.
    *   Copy the **Project URL** and the **`anon` public API Key**.

---

### Step 3: Frontend Environment Setup

1.  Navigate into the `frontend` folder:
    ```bash
    cd frontend
    ```
2.  Create a local configuration file `.env` by duplicating `.env.example`:
    *   On Windows (PowerShell):
        ```powershell
        Copy-Item .env.example .env
        ```
    *   On macOS / Linux:
        ```bash
        cp .env.example .env
        ```
3.  Open the newly created `.env` file and insert your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=https://your-project-reference.supabase.co
    VITE_SUPABASE_ANON_KEY=your-actual-anon-public-key-here
    ```

---

### Step 4: Run the Application Locally

1.  Install the required dependencies inside the `frontend` directory:
    ```bash
    npm install
    ```
2.  Start the local development server:
    ```bash
    npm run dev
    ```
3.  **Explore the App**:
    *   The terminal will print the local hosting URL (e.g., `http://localhost:5173` or `http://localhost:5174`).
    *   Open your web browser and navigate to this address.

---

### Step 5: (Optional) Configure Automated Emails & Deploy Edge Functions

To test the automated email dispatch service using Supabase Edge Functions:

1.  **Install Supabase CLI** globally:
    ```bash
    npm install -g supabase
    ```
2.  **Authenticate & Link to Project**:
    ```bash
    supabase login
    supabase link --project-ref your-project-reference
    ```
3.  **Setup Secrets & Configuration**:
    The email dispatcher implements a robust **Multi-Provider Strategy** with three fallbacks:
    *   **Custom SMTP (Nodemailer)**: Priortized automatically if custom SMTP details are configured inside the database admin panel under `Settings` (saved in `system_settings` table, key: `smtp_config`).
    *   **Brevo HTTP API**: Secondary fallback using `BREVO_API_KEY`.
    *   **Resend HTTP API**: Tertiary fallback using `RESEND_API_KEY`.

    To use Brevo or Resend APIs, run the following:
    ```bash
    supabase secrets set BREVO_API_KEY=your_brevo_api_key
    supabase secrets set RESEND_API_KEY=re_your_resend_api_key
    supabase secrets set FROM_EMAIL=payroll@yourdomain.com
    ```
4.  **Deploy the Functions**:
    ```bash
    supabase functions deploy send-email
    supabase functions deploy process-payroll
    ```

---

## 📝 Staging Credentials & Testing
If you executed the migration `003_seed_data.sql`, the database is loaded with mock employee entries and testing parameters.
*   **Sample Payroll CSV**: A preconfigured sample CSV file `sample_payroll.csv` is provided in the project root directory. You can drag and drop this file directly into the **Upload Portal** page to test the bulk payroll generation engine instantly.
*   **Salary Slip PDFs**: Navigating to the **Salary Slips** tab allows you to preview, export, and download highly detailed salary slip PDFs built directly using our custom-styled jsPDF theme.

---

## 🛠️ Built With

*   **Frontend**: React (18.x), Vite, Tailwind CSS V4, Framer Motion (Physics Animations), Recharts, jsPDF (PDF Engine), Lucide React (Icons).
*   **Backend**: Supabase, PostgreSQL Database, Supabase Storage, Supabase Edge Functions (Deno runtime).
*   **Emails**: Multi-Provider (Nodemailer / SMTP, Brevo, Resend).
