# SkillBridge - Quick Reference

## 🚀 Start Development (30 seconds)
```bash
cd /Users/finn/Documents/skillbridge/apps/web
npm install          # (already done)
npm run dev          # Start dev server at http://localhost:3000
```

## 📋 Before Running
1. Create Supabase project at supabase.com
2. Copy schema from `lib/schema.sql` to Supabase SQL editor and run
3. Copy `.env.local.example` → `.env.local`
4. Fill in Supabase credentials in `.env.local`

## 🌍 URLs
- Landing: http://localhost:3000
- Login: http://localhost:3000/auth/login
- Register: http://localhost:3000/auth/register
- Dashboard: http://localhost:3000/dashboard

## 👥 Test Users (create them yourself)
After running dev server:
1. Go to `/auth/register`
2. Create test users with different roles
3. Passwords must have: 8+ chars, uppercase, number, special char (!@#$%^&*)
4. Example password: `TestPass123!`

## 📁 Important Files
| File | Purpose |
|------|---------|
| `app/api/auth/` | API endpoints |
| `app/auth/` | Login/register pages |
| `app/dashboard/` | Role dashboards |
| `lib/auth.ts` | Password hashing, validation |
| `lib/schema.sql` | Database schema |
| `types/index.ts` | TypeScript types |
| `middleware.ts` | Route protection |
| `components/auth/` | Form components |
| `.env.local.example` | Env template |

## 🔑 Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
JWT_SECRET=any_32_char_random_string
```

## 📊 5 User Roles
1. **student** → `/dashboard/student`
2. **worker** → `/dashboard/worker`
3. **employer** → `/dashboard/employer`
4. **factory_admin** → `/dashboard/factory`
5. **admin** → `/dashboard/admin`

## 🔐 Database Tables
- `users` - User accounts
- `student_profiles` - Student data
- `worker_profiles` - Worker data
- `companies` - Employer companies
- `factories` - Factories
- `email_verification_tokens`
- `password_reset_tokens`
- `audit_logs` - Action history

## 🧪 Test Flow
1. Register user with email & password
2. Check Supabase `users` table
3. Login with those credentials
4. Should redirect to role dashboard
5. Verify session cookie set
6. Click logout to clear session

## 📦 Build & Deploy
```bash
npm run build        # Build for production
npm run dev          # Start dev server
npm run lint         # Run linter (if configured)
```

## 🚨 Common Issues
| Issue | Fix |
|-------|-----|
| "Missing Supabase config" | Check `.env.local` |
| Build fails TypeScript | Run `npm install` |
| Database connection fails | Verify Supabase project running |
| Can't login | Check password has uppercase, number, special char |

## 📚 Documentation
- **BUILD_SUMMARY.md** - Complete overview
- **SPRINT1.md** - Detailed Sprint 1 docs
- **SETUP_GUIDE.md** - Setup & deployment
- **QUICK_REFERENCE.md** - This file

## 🎯 Next Steps
1. ✅ Run dev server
2. ✅ Test registration & login
3. ✅ Deploy to Vercel/DigitalOcean
4. ✅ Start Sprint 2 (Student Portal)

## 💡 Pro Tips
- Session lasts 7 days (modify in `login/route.ts`)
- Passwords hashed with bcryptjs (10 rounds)
- All actions logged in `audit_logs` table
- Middleware protects `/dashboard` routes
- Use Vercel for easiest deployment

---

**Questions?** See full docs in BUILD_SUMMARY.md or SPRINT1.md
