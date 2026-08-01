# SkillBridge — Agent Task Board (Pilot Mode)

**Orchestration model:** Hermes (me) = Pilot/Orchestrator. I plan, coordinate, verify, and merge.
Specialized sub-agents do the *building* and report back. I do NOT write feature code myself.

**Status:** BOARD PREPPED — awaiting Figma design drop to flip `READY` → `EXECUTING`.

> ⚠️ Runtime note: the `delegate_task` tool is not active in this Hermes runtime yet.
> When enabled, each `[AGENT TASK]` below becomes one `delegate_task({ goal, context })`
> call. Until then, the same briefs can be executed by me sequentially or by you manually.
> The board is the source of truth either way.

---

## 🎯 MVP Goal (to archive when done)
Ship a working SkillBridge pilot:
- Student + Employer + (Admin later) flows
- Real backend (Prisma/Postgres) — DONE ✅
- Mobile app wired to API — DONE ✅ (logic only; UI pending Figma)
- Polished UI/UX matching Finn's Figma (Apple/minimalist/brutalist)
- Seed data so the app isn't empty
- Verified by a dedicated tester agent

---

## 🧱 Shared Foundation (must land BEFORE feature agents run)
These are cross-cutting — one agent owns them so all others consume the same tokens.

### [AGENT: FOUNDATION-01] Design Token + Component Kit
**Role:** Frontend Platform / Design Systems
**Owns:** `packages/ui`, `apps/mobile/src/theme.ts`
**Inputs:** Finn's Figma (dev mode link or exported frames in `design/`)
**Deliverables:**
1. `theme.ts` — colors, typography, spacing, radius, shadows (exact Figma values)
2. Rebuild `packages/ui` primitives to match: Button, Input, Card, Badge, TabBar, Modal, Avatar, Skeleton
3. Export from `packages/ui` so mobile + web import the same kit
4. A `Storybook`-lite or simple demo screen proving the kit renders
**Done when:** `pnpm --filter @skillbridge/ui build` passes; mobile can `import { Button } from '@skillbridge/ui'`
**Reports:** token values used, components shipped, any Figma ambiguities

---

## 🔧 Backend Agents (API already exists — these extend/secure it)

### [AGENT: BACKEND-01] Auth Hardening + Refresh
**Role:** Backend Dev
**Owns:** `apps/api/src/routes/auth.routes.ts`, `middleware/auth.ts`
**Deliverables:**
- Refresh-token rotation + revocation list (in-memory or DB-backed)
- `/auth/me` returns full profile
- Rate-limit login (already has config; wire it)
- Password reset flow stub (email later)
**Depends on:** existing Prisma schema (DONE)
**Reports:** endpoints changed, security notes

### [AGENT: BACKEND-02] Employers + Projects CRUD completeness
**Role:** Backend Dev
**Owns:** `apps/api/src/routes/projects.routes.ts`, `users.routes.ts`, `employer.routes.ts` (new)
**Deliverables:**
- Employer profile + company CRUD
- Project filters (location, remote, type, budget range, skills)
- Reverse-recruitment: employer can browse student profiles / invite
- Pagination on list endpoints
**Depends on:** BACKEND-01 (auth), FOUNDATION not needed
**Reports:** new routes, query params

### [AGENT: BACKEND-03] Seed Data
**Role:** Backend Dev / Data
**Owns:** `apps/api/prisma/seed.ts` (new)
**Deliverables:**
- 5 employers (Cambodian garment/factory context), 15 students, 20 projects
- Realistic Khmer/Cambodian names + skills
- Idempotent seed (clears + re-seeds)
- `pnpm --filter api db:seed` script
**Depends on:** BACKEND-02 (schema stable)
**Reports:** row counts seeded

---

## 📱 Frontend Agents (mobile — the big reskin)

### [AGENT: FRONTEND-01] Auth Screens Reskin
**Role:** Frontend Dev (Mobile)
**Owns:** `apps/mobile/src/screens/auth/*`
**Inputs:** Figma login/register frames + `theme.ts` from FOUNDATION-01
**Deliverables:** Login + Register pixel-matched to Figma, using `@skillbridge/ui`
**Depends on:** FOUNDATION-01
**Reports:** screens done, animations/transitions added

### [AGENT: FRONTEND-02] Projects + Home Reskin
**Role:** Frontend Dev (Mobile)
**Owns:** `apps/mobile/src/screens/projects/*`, `home/*`
**Inputs:** Figma project list / detail / home frames
**Deliverables:** Project list (cards), detail, apply flow, home dashboard
**Depends on:** FOUNDATION-01, BACKEND-02 (filters)
**Reports:** screens done

### [AGENT: FRONTEND-03] Profile + Navigation Reskin
**Role:** Frontend Dev (Mobile)
**Owns:** `apps/mobile/src/screens/profile/*`, `App.tsx` (nav structure)
**Inputs:** Figma profile + bottom-nav frames
**Deliverables:** Profile view/edit, bottom tab nav, settings
**Depends on:** FOUNDATION-01
**Reports:** screens done

---

## 🧪 Quality Agents

### [AGENT: TESTER-01] API Contract Tests
**Role:** QA / Tester
**Owns:** `apps/api/tests/` (new, vitest)
**Deliverables:**
- Hit every route with real assertions (register/login/projects/apply/profile)
- Seed-dependent tests use BACKEND-03 seed
- CI-able: `pnpm --filter api test`
**Depends on:** BACKEND-01/02/03
**Reports:** pass/fail matrix, uncovered routes

### [AGENT: TESTER-02] Mobile E2E Smoke
**Role:** QA / Tester
**Owns:** `apps/mobile/e2e/` (detox or maestro)
**Deliverables:**
- Boot app → login (seeded user) → view projects → apply → edit profile
- Screenshot diff vs Figma key screens
**Depends on:** FRONTEND-01/02/03
**Reports:** flow pass/fail, visual mismatches

---

## 🚀 Release Agent

### [AGENT: RELEASE-01] Archive the Goal
**Role:** Release / DevOps
**Owns:** `docs/GOALS_ACHIEVED.md`, git tag `v0.1.0-pilot`, PRs
**Deliverables:**
- Merge all feature branches → `main` via PRs
- Write `GOALS_ACHIEVED.md` (what shipped, what deferred)
- Tag release, write changelog
**Depends on:** all above green
**Reports:** release tag, summary

---

## 📋 Execution Order (DAG)
```
FOUNDATION-01 ─┬─> FRONTEND-01 ─┐
               ├─> FRONTEND-02 ─┤
               └─> FRONTEND-03 ─┤
                                 ├─> TESTER-02
BACKEND-01 ───> BACKEND-02 ──> BACKEND-03 ──> TESTER-01
                                 └─────────────> RELEASE-01
```
**Parallelizable:** FRONTEND-01/02/03 (after FOUNDATION-01); BACKEND-01/02 (independent); TESTER-01 vs TESTER-02.

## 🚦 Gate to start
1. Finn drops Figma → `design/` (frames or dev-mode link)
2. Pilot flips board → EXECUTING
3. I launch FOUNDATION-01 + BACKEND-01/02 in parallel
4. Each agent reports; I verify + merge; next wave launches
5. RELEASE-01 archives the goal
