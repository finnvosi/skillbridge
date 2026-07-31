# SkillBridge MVP - Setup & Deployment Guide

## ⚡ Quick Start (5 minutes)

### 1. Prerequisites
- Node.js v18+ installed
- npm/pnpm available
- Supabase account (free at supabase.com)

### 2. Clone Environment
```bash
cd /Users/finn/Documents/skillbridge/apps/web
npm install
```

### 3. Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Create a new project (free tier is fine)
- Wait for setup to complete
- Copy API keys from Settings → API

### 4. Setup Database
- Go to Supabase SQL Editor
- Copy entire contents of `lib/schema.sql`
- Paste and run it
- Tables created automatically ✅

### 5. Configure App
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
JWT_SECRET=any-random-32-char-string
```

### 6. Run Locally
```bash
npm run dev
```

Visit: http://localhost:3000

---

## 🧪 Test the Full Authentication Flow

### Test 1: Register as Student
1. Go to http://localhost:3000/auth/register
2. Fill form:
   - Name: Test Student
   - Email: student@test.com
   - Password: TestPass123!
   - Role: Student
3. Click "Sign Up"
4. Should see success message
5. Check Supabase `users` table - new user should be there

### Test 2: Login
1. Go to http://localhost:3000/auth/login
2. Use credentials from Test 1
3. Should redirect to `/dashboard/student`
4. Session cookie set ✅

### Test 3: Try Different Roles
Register users with each role and verify redirects:
- Student → `/dashboard/student`
- Worker → `/dashboard/worker`
- Employer → `/dashboard/employer`
- Factory Admin → `/dashboard/factory`
- Admin → `/dashboard/admin`

### Test 4: Logout
1. From any dashboard, look for "Logout" link
2. Click it
3. Should redirect to login page
4. Session cookie deleted ✅

---

## 🐳 Docker Deployment

### Build Docker Image
```bash
cd /Users/finn/Documents/skillbridge

docker build -f apps/web/Dockerfile -t skillbridge:latest .
```

### Run Container Locally
```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  skillbridge:latest
```

---

## ☁️ Deploy to DigitalOcean

### Using Docker
1. Create Droplet (2GB+ RAM recommended)
2. Install Docker on droplet:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

3. Push image to Docker Hub:
```bash
docker tag skillbridge:latest yourname/skillbridge:latest
docker push yourname/skillbridge:latest
```

4. Pull and run on droplet:
```bash
docker pull yourname/skillbridge:latest
docker run -d -p 80:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  yourname/skillbridge:latest
```

### Using Vercel (Easiest)
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Add environment variables
5. Deploy (automatic!)

---

## 📋 Production Checklist

Before going live, complete:

- [ ] Database backups configured (Supabase auto-backup)
- [ ] Environment variables secured (never commit .env)
- [ ] HTTPS enabled (automatic on Vercel, use Let's Encrypt on VPS)
- [ ] Rate limiting configured
- [ ] Email service integrated (SendGrid/Mailgun)
- [ ] Google OAuth credentials obtained
- [ ] Domain name configured
- [ ] Analytics setup (optional: Vercel Analytics)
- [ ] Error tracking (optional: Sentry)
- [ ] Security headers configured
- [ ] Database indexes verified
- [ ] Monitoring alerts setup

---

## 🔧 Configuration Reference

### Environment Variables

| Variable | Required | Example |
|----------|----------|---------|
| NEXT_PUBLIC_SUPABASE_URL | Yes | https://abc123.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Yes | eyJ0eXAiOiJKV1QiLCJhbGc... |
| GOOGLE_CLIENT_ID | No* | 12345...apps.googleusercontent.com |
| GOOGLE_CLIENT_SECRET | No* | GOCSPX-... |
| JWT_SECRET | Yes | any_random_string_min_32_chars |

*Required only if implementing Google OAuth

### Database URLs
- Development: `.env.local`
- Staging: `.env.staging`
- Production: Use Vercel/DigitalOcean dashboard

---

## 🆘 Troubleshooting

### "Missing Supabase configuration"
**Fix**: Check `.env.local` has correct URLs and keys

### Database connection fails
**Fix**: Verify Supabase project is running and API keys are correct

### Build fails with TypeScript errors
**Fix**: Run `npm install`, then `npm run build` again

### Cookies not working
**Fix**: Ensure production uses HTTPS. Check browser cookie settings.

### Session persists after logout
**Fix**: Clear browser cookies and cache

---

## 📚 API Reference

### All API Routes

#### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Reset password

### Response Format

All responses follow this format:

```json
{
  "success": true/false,
  "user": { /* user object */ },
  "error": "error message if success=false"
}
```

---

## 📖 Documentation Files

- **SPRINT1.md** - Detailed Sprint 1 documentation
- **lib/schema.sql** - Database schema
- **lib/auth.ts** - Authentication utilities
- **types/index.ts** - TypeScript types
- **SETUP_GUIDE.md** - This file

---

## 🚀 Next Steps

1. ✅ Run locally and test
2. ✅ Configure Supabase production project
3. ✅ Deploy to staging
4. ✅ Test in staging environment
5. ✅ Deploy to production
6. ✅ Start Sprint 2 (Student Portal)

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review SPRINT1.md for detailed info
3. Check Supabase documentation
4. Review Next.js documentation

---

**Good luck! 🚀 Happy coding!**
