# FraudShield

FraudShield is a web-based fraud detection and transaction-monitoring platform for digital/mobile-money payments. It scores transactions for risk in real time, raises fraud alerts, and gives users, fraud analysts, and administrators role-specific dashboards to review activity, investigate alerts, and manage detection rules.

This is a group project by **Group 4**.

## What it does

- **Risk scoring** – every transaction (send, receive, withdraw, deposit) is given a risk score and a risk level (`safe`, `medium`, `high`) based on configurable fraud rules.
- **Fraud alerts** – suspicious transactions generate alerts that analysts can confirm as fraud or dismiss, and that users can give feedback on.
- **Configurable rules** – admins create and tune fraud rules (thresholds, risk weights, active/inactive).
- **Audit logging** – key actions are recorded for accountability.
- **Role-based access** – three areas, each with its own dashboard and navigation:

| Role | Area | What they see |
|------|------|---------------|
| User | `/dashboard` | Their own transactions, alerts on their account, and account settings. |
| Analyst | `/analyst` | A monitoring dashboard, the full alert queue, and all transactions to investigate. |
| Admin | `/admin` | System dashboard, user management, fraud-rule configuration, and reports. |

Authentication and authorization are handled with Supabase Auth plus a separate `user_roles` table, and the database enforces access with Row Level Security (RLS).

## Tech stack

- **Frontend:** React 18 + TypeScript, built with Vite
- **UI:** shadcn/ui (Radix UI primitives) + Tailwind CSS
- **Routing:** React Router
- **Data/state:** TanStack Query
- **Charts:** Recharts
- **Forms/validation:** React Hook Form + Zod
- **Backend:** Supabase (Postgres, Auth, Row Level Security)

## Project structure

```
src/
  pages/
    Index.tsx            # landing page
    Auth.tsx             # sign in / sign up
    dashboard/           # USER pages (dashboard, alerts, transactions, settings)
    analyst/             # ANALYST pages (dashboard, alerts, transactions)
    admin/               # ADMIN pages (dashboard, users, rules, reports)
  components/
    layout/              # navbar, sidebars, and per-role layouts
    ui/                  # shared shadcn/ui components + app cards/badges
  contexts/              # AuthContext, ThemeContext
  hooks/                 # custom hooks
  integrations/supabase/ # Supabase client + generated types
  lib/                   # shared types and utilities
supabase/
  migrations/            # database schema (tables, enums, RLS, triggers)
  config.toml
```

## Database overview

The schema (see `supabase/migrations/`) includes:

- `profiles` – user profile details linked to `auth.users`
- `user_roles` – roles (`admin`, `user`) kept separate from profiles for security
- `transactions` – payment records with risk score/level and device/location metadata
- `fraud_alerts` – alerts raised against transactions, with status and user feedback
- `fraud_rules` – admin-configurable detection rules
- `audit_logs` – record of sensitive actions

All tables have RLS enabled, with a `has_role()` security-definer function used in policies.

## Getting started

Requires **Node.js 18+** and npm.

```sh
# 1. Clone the repository
git clone https://github.com/sawanehabubakarr/G4_Mobile_Money_Fraud-Alert_System.git
cd securepay-alerts

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env   # then fill in the values below

# 4. Start the dev server
npm run dev
```

The app runs on `http://localhost:8080`.

### Environment variables

Create a `.env` file in the project root with your Supabase project values:

```
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_URL=https://your_project_id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

> Do not commit your real `.env` file. It is git-ignored.

### Setting up the database

Apply the SQL migrations in `supabase/migrations/` to your Supabase project (via the Supabase CLI `supabase db push`, or by running the SQL in the Supabase dashboard SQL editor in order).

## Available scripts

- `npm run dev` – start the development server
- `npm run build` – production build
- `npm run build:dev` – development-mode build
- `npm run preview` – preview the production build
- `npm run lint` – run ESLint

## Team & contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for who owns which part of the codebase and the team's Git workflow (branching, commit order, and pull requests).

## License

This project was created for academic coursework by Group 4.
