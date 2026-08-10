# SkillBridge — Security & Resilience Plan

> **Read this first (founder-to-founder).** You do not need to be a security
> expert to run SkillBridge safely. The platform is built on Supabase + Vercel,
> which already do the heavy lifting (encryption in transit, managed auth,
> managed Postgres). This document describes the *layered* model we use so that
> a single mistake does not become a catastrophe: **protect → restore → fix.**

**On the "jail" fear:** Collecting user data is legal. What creates real legal
exposure is (a) *selling* user data without consent, or (b) *gross* negligence
—e.g. storing plaintext passwords or leaving a public database wide open. This
plan's job is to keep us far away from (b). Cambodia does not yet have a full
GDPR-style law, but the 2023 Telecom Law covers data/privacy and regulation is
tightening. **Get a 30-minute lawyer sign-off on the data we collect before
public launch.** This file is engineering armor, not legal advice.

---

## 1. The three layers

| Layer | Question it answers | What we do |
|-------|---------------------|------------|
| **PROTECT** | How do we stop bad things getting in? | Least data, HTTPS, auth, authorization (RLS + server checks), secrets in env, input validation, rate limiting, security headers, secure uploads |
| **RESTORE** | If data is corrupted/deleted/leaked, can we get back? | Supabase PITR + nightly cold-storage dump + a **tested** restore runbook |
| **FIX** | If a breach happens, what do we do *now*? | Written incident runbook: revoke → isolate → notify → restore from backup |

The point: even if PROTECT fails, RESTORE + FIX mean the business survives.

---

## 2. PROTECT — what is in place / mandated

### 2.1 Data minimization (Layer 0 — highest payoff)
- Only collect fields the product needs. **Do not** store national ID numbers,
  government IDs, or payment card data in our database.
- Payment: use a PCI-compliant processor (Stripe/etc.) — we never touch card numbers.
- Profile photos: store in Supabase Storage (not base64 in the DB), size-capped.

### 2.2 Transport encryption
- Vercel + Supabase serve everything over TLS (HTTPS). No action needed; just
  never downgrade to plain HTTP and keep HSTS on (see middleware headers).

### 2.3 Authentication
- **Supabase Auth** is the canonical auth for the web/Student+Employer+Admin
  flows (email/password + Google OAuth).
- The Express API (`apps/api`) also issues JWTs for the mobile app. Both must
  stay coherent — see §5 known gaps.

### 2.4 Authorization (the big one)
- **Students** can only read/write **their own** rows.
- **Employers** can only read/write **their own company's** opportunities &
  applications.
- **Admins** can manage the platform.
- Implemented TWO ways (defense in depth):
  1. **Database level — Row Level Security (RLS).** See `supabase/rls.sql`.
     This is the real guarantee: even if app code has a bug, the DB refuses
     cross-user access. **Never disable RLS. Never use the service-role key
     from the client/browser.**
  2. **Server level — `authorize(role)` checks** in `apps/api/src/middleware/auth.ts`.
     API routes that change state must call `authenticate` then `authorize(...)`.

### 2.5 Secrets
- All secrets live in env vars (`SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`,
  `DATABASE_URL`, etc.). See `.env.example`.
- **Never** commit `.env*.local`. They are git-ignored.
- The **service-role key can bypass RLS** — treat it like a root password.
  Only use it in trusted server-side scripts, never shipped to the browser.
- Rotate any secret that may have leaked (and revoke pasted tokens — see below).

### 2.6 Input validation
- All API input validated with **Zod** (`apps/api` + web route handlers).
- Client forms validate too. Never trust the client; server is the gate.

### 2.7 Rate limiting
- Auth endpoints (`/register`, `/login`) are now rate-limited
  (`apps/api/src/routes/auth.routes.ts`) to block brute-force / credential stuffing.

### 2.8 Security headers
- `apps/web/middleware.ts` now sets CSP, HSTS, X-Frame-Options (clickjacking),
  X-Content-Type-Options, and Referrer-Policy on every response.

### 2.9 Secure file uploads
- Profile photos / certificates go to **Supabase Storage** buckets with their
  own RLS. Validate MIME type + size server-side. Generate unguessable object
  names (UUIDs), never use the original filename as a path.

---

## 3. RESTORE — backups

**Goal:** a "dropped the table" or "ransomware encrypted the DB" event is a
restore-from-last-night, not a company-ending event.

- **Supabase Point-in-Time Recovery (PITR):** enable on the paid plan. Gives
  continuous backup + rewind.
- **Nightly dump to cold storage:** `scripts/db-backup.sh` dumps the DB to a
  timestamped file and (optionally) pushes to Supabase Storage / S3. Wire it
  into a daily cron (Vercel Cron / GitHub Action / system timer).
- **Tested restore:** `scripts/db-restore.sh` replays a dump. **Practice a
  restore once a quarter** so you know it works under pressure.

Runbooks:
```bash
# Backup now
./scripts/db-backup.sh

# Restore a specific dump
./scripts/db-restore.sh dumps/skillbridge_2026-08-10_020000.sql
```

---

## 4. FIX — incident response runbook

If you suspect a breach, do this in order. Do not panic; do not delete
evidence.

1. **Contain.** Rotate/revoke the suspected compromised secret
   (`SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`) immediately. Revoke leaked
   personal tokens (e.g. GitHub PATs used for deploys) at their provider.
2. **Isolate.** Flip the app to maintenance mode or temporarily disable the
   affected endpoint if user data is actively leaking.
3. **Assess.** Pull Supabase audit logs + Vercel function logs. Identify scope:
   which table, which users, what timeframe.
4. **Restore.** If data was corrupted/deleted, restore from the latest clean
   backup (§3) or use PITR to rewind to just-before the event.
5. **Notify.** Email affected users if their data was exposed. Keep it plain:
   what happened, what we did, what they should do (reset password).
6. **Post-mortem.** Write a 1-page note: root cause, fix, how to prevent. Store
   in `docs/incidents/`.

**Revoke pasted tokens:** if you ever pasted a token into chat (GitHub PAT,
Supabase key, etc.), revoke it at the source right after use:
`github.com/settings/tokens`.

---

## 5. KNOWN GAPS (be honest about these)

These are real and tracked. None are "rocket science," but you should know
they exist:

1. **Privilege escalation in self-registration — FIXED.** `apps/api` previously
   allowed anyone to register as `admin`. Now only `student`/`employer` are
   permitted via the public route; admin is provisioned out-of-band.
2. **Web stores JWT in `localStorage`** (`apps/web/lib/api-client.ts`). This
   means an XSS bug could steal the token. **Recommended upgrade:** move web
   sessions to httpOnly, Secure, SameSite cookies. Bigger refactor — scheduled,
   not done yet. Keep client JS XSS-clean in the meantime.
3. **Two auth backends.** There is a vestigial Supabase `app/api/auth/*` set
   of routes AND the Express `apps/api` JWT service. This doubles attack
   surface and causes confusion. Plan: pick ONE canonical auth (Supabase Auth
   for web, Express JWT for mobile) and delete the dead one before launch.
4. **No `.env.example` previously** — added. Ensure CI/deploy secrets are set
   and never logged.
5. **RLS SQL is target-state.** `supabase/rls.sql` is the intended policy set;
   apply it via Supabase migrations once the schema exists. Until applied, the
   DB has no RLS guarantee — do not go to production without it.
6. **No automated dependency scanning.** Add `pnpm audit` (or Dependabot) to CI
   so a vulnerable dependency is caught early.

---

## 6. Quick security checklist (before public launch)

- [ ] `.env*.local` never committed (confirmed in `.gitignore`)
- [ ] Service-role key only server-side, never in browser bundle
- [ ] RLS applied to every table (`supabase/rls.sql` executed)
- [ ] Admin NOT self-registrable (fixed in code)
- [ ] Rate limiting on auth (done)
- [ ] Security headers present (done in middleware)
- [ ] Backups running nightly + 1 successful test restore
- [ ] Lawyer sign-off on collected data + privacy policy live
- [ ] Incident runbook (§4) reviewed
