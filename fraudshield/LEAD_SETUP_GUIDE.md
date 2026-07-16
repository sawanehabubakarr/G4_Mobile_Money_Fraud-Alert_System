# Lead Setup Guide — FraudShield (Group 4)

Step-by-step for **Abubakarr (Lead)** to start the repo as a clean skeleton, push it, and hand each member their area to fill in from the existing finished project.

The idea: push a **bare skeleton** first, then each member copies **their** real files from the finished app into the skeleton and commits them, so everyone gets visible commits.

Repo: `https://github.com/sawanehabubakarr/G4_Mobile_Money_Fraud-Alert_System.git`

---

## Part A — Lead: create the empty project and structure

Keep the existing finished app somewhere safe (this is your "source" copy that members will pull files from). Build the skeleton in a **new, separate folder**.

### 1. Scaffold an empty Vite + React 18 + TypeScript project

```sh
npm create vite@latest fraudshield -- --template react-ts
cd fraudshield
npm install
npm run dev
```

This gives you a clean React 18 + TS + Vite project. Confirm it runs at the URL printed.

### 2. Install the libraries the project uses

```sh
npm install react-router-dom @tanstack/react-query @supabase/supabase-js react-hook-form @hookform/resolvers zod recharts lucide-react date-fns next-themes sonner clsx tailwind-merge class-variance-authority

npm install -D tailwindcss postcss autoprefixer @types/node
npx tailwindcss init -p
```

shadcn/ui components get copied in later by members, or you can run `npx shadcn@latest init`. For now you only need the folders.

### 3. Set the dev port to 8080 to match the project

Edit `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  server: { host: "::", port: 8080 },
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
```

### 4. Create the folder structure with placeholders

```sh
mkdir -p src/pages/dashboard src/pages/admin src/pages/analyst
mkdir -p src/components/layout src/components/ui
mkdir -p src/contexts src/hooks src/lib
mkdir -p src/integrations/supabase
mkdir -p supabase/migrations

echo "// USER dashboard pages go here (owner: Abdallah)" > src/pages/dashboard/.gitkeep
echo "// ADMIN pages go here (owner: Alie Jinnah)" > src/pages/admin/.gitkeep
echo "// ANALYST pages go here (owner: Ibrahim)" > src/pages/analyst/.gitkeep
echo "// Database / migrations go here (owner: Momodu)" > supabase/migrations/.gitkeep
```

The `.gitkeep` files keep empty folders in Git and signal who owns each area.

### 5. Add the project files YOU own

Copy these from the finished app into the skeleton (the Lead's area: structure, routing, auth, shared code):

- `index.html`
- `src/main.tsx`, `src/App.tsx`
- `src/index.css`, `tailwind.config.ts`, `postcss.config.js`, `components.json`
- `src/contexts/` (AuthContext, ThemeContext)
- `src/components/layout/Navbar.tsx`, `ThemeToggle.tsx`
- `src/lib/utils.ts`, `src/lib/types.ts`
- `src/integrations/supabase/client.ts` (shared client)
- `.gitignore`, `.env.example`, `README.md`, `CONTRIBUTING.md`, this guide

**Important — in `App.tsx`:** keep the route declarations, but the imported page files may not exist yet. To avoid a broken build before members add their pages, either temporarily comment out the role routes (admin / analyst / dashboard) and uncomment them as each PR merges, or add tiny stub pages that render `<div>Coming soon</div>`.

### 6. Create `.gitignore` and `.env.example`

`.gitignore` should contain at least:

```
node_modules
dist
.env
.env.local
```

`.env.example` (no real secrets):

```
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_URL=https://your_project_id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

### 7. First commit and push to the empty repo

```sh
git init
git add .
git commit -m "chore: initial project skeleton (Vite + React 18 + TS) and structure"
git branch -M main
git remote add origin https://github.com/sawanehabubakarr/G4_Mobile_Money_Fraud-Alert_System.git
git push -u origin main
```

The lecturer (already a collaborator) can now see your first commit.

### 8. Protect `main` (recommended)

On GitHub: **Settings, Branches, Add branch protection rule**, branch name `main`, tick **Require a pull request before merging**. This forces everyone through PRs and keeps each member's commits clearly attributed.

---

## Part B — What you send the team

Send members two things:

1. The repo URL (they already have access).
2. Tell them to read **`CONTRIBUTING.md`** — it lists who owns what and the exact branch / commit / PR steps.

Each member, in summary:

```sh
git clone https://github.com/sawanehabubakarr/G4_Mobile_Money_Fraud-Alert_System.git
cd G4_Mobile_Money_Fraud-Alert_System
npm install
cp .env.example .env
git config user.name "Their Name"
git config user.email "their-github-email"

git checkout -b feature/admin-pages
# copy THEIR files from the finished app into the matching folders
git add src/pages/admin
git commit -m "feat(admin): add admin dashboard and user management"
# more small commits...
git push -u origin feature/admin-pages
# then open a Pull Request on GitHub; you review and merge
```

Share each member's slice privately: either zip only their folders, or share the whole finished app and tell them to copy only their assigned folders. Either way they commit their own area so it shows under their name.

---

## Part C — Commit order (so nobody is blocked)

1. **You (Lead)** — skeleton and structure pushed first. (Part A)
2. **Momodu — Database** — adds `supabase/migrations/` and `src/integrations/supabase/types.ts` (pages depend on these).
3. **Alie / Abdallah / Ibrahim** — Admin / Dashboard / Analyst pages, **in parallel** (separate folders, no conflicts).
4. **You (Lead)** — final integration: wire all routes in `App.tsx`, fix anything, confirm `npm run dev` and `npm run build` work.

Everyone makes **several small commits** rather than one big dump — it shows real progress to the lecturer.

---

## Part D — Final check before submitting

```sh
git checkout main
git pull origin main
npm install
npm run dev
npm run build
```

On GitHub, open **Insights, Contributors** — you should see commits from all five members.
