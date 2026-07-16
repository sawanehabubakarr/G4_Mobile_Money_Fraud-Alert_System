# Contributing Guide — FraudShield (Group 4)

This guide explains **who owns what**, the **order we commit in**, and the **exact Git steps** each member follows so everyone's work shows up as their own commits in the repo.

> Goal: the lecturer (added as a collaborator) can open the repo and clearly see commits from every team member.

---

## 1. Team & ownership

| # | Member              | GitHub username | Owns | Main files / folders |
|---|---------------------|----|------|----------------------|
| Lead | `Abubakarr Sawaneh` | `sawanehabubakarr ` | Project setup, structure, routing, auth, shared code | `App.tsx`, `main.tsx`, `index.html`, `src/contexts/`, `src/components/layout/Navbar.tsx`, `src/components/ui/` (shared), `README.md`, config files |
| 1 | `Alie Jinnah Musa`  | `Jinnah674` | **Admin pages** | `src/pages/admin/`, `src/components/layout/AdminLayout.tsx`, `src/components/layout/AdminSidebar.tsx` |
| 2 | `Abdallah Bah`      | `Abdallah-Ba-001` | **Dashboard (user) pages** | `src/pages/dashboard/`, `src/components/layout/DashboardLayout.tsx`, `src/components/layout/UserSidebar.tsx` |
| 3 | `Ibrahim Jalloh`    | `ibrahimjalloh10-byte` | **Analyst pages** | `src/pages/analyst/`, `src/components/layout/AnalystLayout.tsx`, `src/components/layout/AnalystSidebar.tsx` |
| 4 | `Momodu Kamara`     | `Momodu111` | **Database** | `supabase/migrations/`, `supabase/config.toml`, `src/integrations/supabase/` |

---

## 2. One-time setup (everyone)

1. The **Lead** creates the GitHub repo and pushes the base project first (see Section 4).
2. The Lead adds everyone — including the **lecturer** — as collaborators:
   - On GitHub: **Settings → Collaborators → Add people** → enter each person's GitHub username or email → they accept the email invite.
3. Each member then clones the repo:
   ```sh
   git clone <YOUR_GIT_URL>
   cd securepay-alerts
   npm install
   cp .env.example .env   # paste the shared Supabase keys
   npm run dev
   ```
4. Set your Git identity so your commits are credited to you:
   ```sh
   git config user.name "Your Name"
   git config user.email "your-github-email@example.com"
   ```
   > Use the **same email as your GitHub account**, otherwise GitHub won't link the commit to your profile.

---

## 3. Commit order (why this sequence)

Work in this order so people aren't blocked and merges stay clean:

1. **Lead — project skeleton & structure** (must be first; everything depends on it: routing, layouts, auth, shared UI).
2. **Member 4 — Database** (next; the pages read/write these tables and types, so the schema should exist early).
3. **Members 1, 2, 3 — Admin / Dashboard / Analyst pages** (can work **in parallel** once the skeleton and DB are in, because they touch separate folders).
4. **Lead — final integration** (wire everything in `App.tsx` routes, polish, fixes).

Each person makes **several small commits**, not one big one — the lecturer wants to see ongoing progress.

---

## 4. Lead: first push

```sh
cd securepay-alerts
git add .
git commit -m "chore: initial FraudShield project structure and setup"
git branch -M main
git remote add origin <YOUR_GIT_URL>
git push -u origin main
```
Then add collaborators (Section 2.2).

---

## 5. Everyone: the branch → commit → pull request loop

**Never commit directly to `main`.** Each person works on their own branch and opens a Pull Request (PR). This keeps history clean and makes each person's contribution obvious.

```sh
# 1. Start from the latest main
git checkout main
git pull origin main

# 2. Create your feature branch (use your area)
git checkout -b feature/admin-pages      # member 1
# feature/dashboard-pages  (member 2)
# feature/analyst-pages    (member 3)
# feature/database         (member 4)

# 3. Do your work, then commit in small steps
git add src/pages/admin/AdminUsers.tsx
git commit -m "feat(admin): build user management table"
# ...keep working and committing...
git commit -am "feat(admin): add fraud rule editing form"

# 4. Push your branch
git push -u origin feature/admin-pages
```

Then on GitHub: **Compare & pull request → base `main` ← compare your branch → Create pull request.**
The Lead reviews and clicks **Merge pull request**.

Before starting new work each day, sync:
```sh
git checkout main
git pull origin main
git checkout your-branch
git merge main      # pull the latest shared code into your branch
```

---

## 6. Commit message style

Keep messages short and prefixed by type:

- `feat:` a new feature — `feat(analyst): add alert investigation panel`
- `fix:` a bug fix — `fix(dashboard): correct transaction total`
- `style:` formatting/UI only
- `chore:` setup, config, dependencies
- `docs:` documentation

This makes the history easy for the lecturer to scan.

---

## 7. Avoiding conflicts

- **Stay in your own folder.** Most conflicts happen when two people edit the same file. The ownership table is designed so that doesn't happen.
- **Shared files** (`App.tsx`, shared `components/ui/`): tell the **Lead** what route/component you need rather than editing them yourself.
- Pull `main` often.
- **Never commit your `.env`** — it holds secret keys and is already in `.gitignore`. Share keys privately (chat), not in the repo.

---

## 8. Quick checklist before each push

- [ ] App still runs: `npm run dev`
- [ ] No lint errors: `npm run lint`
- [ ] You only changed files in your area
- [ ] Your commit message is clear
- [ ] You're on your branch, not `main`
