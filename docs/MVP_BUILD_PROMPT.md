# SkillBridge MVP — Master Build Prompt

You are the lead product engineer and UI/UX engineer responsible for building the **SkillBridge MVP**.

SkillBridge is an **AI-powered workforce development platform** that connects students with employers through project-based and entry-level opportunities.

The goal of this MVP is **not to build the entire long-term SkillBridge ecosystem**. The goal is to create a polished, functional, scalable foundation that can be used to validate the product with real users.

---

## 1. PRODUCT VISION

SkillBridge bridges the gap between:

**Student → Skills → Opportunity → Experience → Career**

Instead of functioning like a traditional job board, SkillBridge should focus on helping students discover opportunities, build experience, and connect with employers.

The MVP should feel like a real startup product, not a prototype or admin dashboard.

The experience should be:

* Modern
* Fast
* Minimal
* Professional
* Youth-oriented without feeling childish
* Technology-driven
* Trustworthy
* Easy to understand
* Mobile-first
* Scalable

Do not overload the product with unnecessary features.

---

# 2. MVP USER TYPES

The MVP has only **three roles**.

### Student

Students can:

* Create an account
* Build their profile
* Add education
* Add skills
* Add experience/projects
* Upload a profile photo
* Discover opportunities
* Search and filter opportunities
* View opportunity details
* Apply for opportunities
* Track applications
* Manage their profile
* Receive messages/notifications where necessary

### Employer

Employers can:

* Create an employer account
* Create and manage their company profile
* Post opportunities
* Edit/delete their opportunities
* View applicants
* View applicant profiles
* Change application status
* Manage active/closed opportunities

### Admin

Admin has complete platform control.

Admin can:

* View platform overview
* Manage students
* Manage employers
* Manage companies
* Manage opportunities
* Manage applications
* Verify users/employers where necessary
* Remove inappropriate content
* View basic platform analytics
* Manage platform status

Do NOT build separate worker/factory platforms yet.

The architecture should allow them to be added later without rebuilding the entire system.

---

# 3. CORE MVP USER FLOW

## Student flow

Landing Page
→ Sign Up / Login
→ Student Onboarding
→ Create Profile
→ Student Dashboard
→ Discover Opportunities
→ Opportunity Details
→ Apply
→ Application Status
→ Profile

The onboarding process should be short.

Do not force users to complete a massive profile before entering the application.

Allow profile completion progressively.

---

## Employer flow

Landing Page
→ Sign Up / Login
→ Employer Onboarding
→ Company Profile
→ Employer Dashboard
→ Create Opportunity
→ Manage Opportunities
→ View Applicants
→ Applicant Profile
→ Update Application Status

---

## Admin flow

Login
→ Admin Dashboard
→ Platform Overview
→ Users
→ Employers
→ Opportunities
→ Applications
→ Verification / Moderation

---

# 4. MAIN PAGES

Build these pages properly.

## Public

### Landing Page

Sections:

1. Hero
2. Value proposition
3. How SkillBridge works
4. Opportunity discovery preview
5. Student/employer benefits
6. Trust / verification concept
7. CTA
8. Footer

Hero messaging should communicate the concept immediately.

Example direction:

**Bridge your skills to real opportunities.**

Supporting message:

SkillBridge connects students with employers through meaningful projects, jobs, and career opportunities.

Do not copy this blindly if better product copy can be created.

---

## Authentication

Create:

* Login
* Sign Up
* Forgot Password
* Reset Password

During registration, allow the user to choose:

**Student**
or
**Employer**

Admin accounts should NOT be publicly selectable.

---

# 5. STUDENT EXPERIENCE

## Student Dashboard

The dashboard should prioritize:

### Primary

* Recommended opportunities
* Recent opportunities
* Application status

### Secondary

* Profile completion
* Saved opportunities
* Upcoming actions

Avoid turning the dashboard into a giant analytics screen.

---

## Opportunity Discovery

Create a dedicated opportunity marketplace.

Users should be able to:

* Search
* Filter
* Sort
* Browse opportunity cards

Filters can include:

* Category
* Location
* Work type
* Opportunity type
* Skills
* Compensation
* Duration

Use realistic data.

Do not create hundreds of fake records.

Seed enough realistic demo data to make the application feel alive.

---

## Opportunity Card

Each card should clearly show:

* Company
* Opportunity title
* Type
* Location
* Compensation if available
* Required skills
* Posted date

The card should be visually clean and scannable.

---

## Opportunity Detail

Include:

* Opportunity title
* Company
* Company information
* Description
* Responsibilities
* Requirements
* Skills
* Compensation
* Location
* Duration
* Application deadline
* Apply button

The Apply CTA should remain easy to access.

---

## Application Flow

Application should be simple.

Student clicks:

**Apply Now**

Then:

* Confirm profile
* Optional cover message
* Submit application

After submission:

**Application submitted successfully.**

Application status should be:

* Submitted
* Reviewing
* Shortlisted
* Accepted
* Rejected

---

# 6. STUDENT PROFILE

Create a strong professional profile.

Sections:

* Profile photo
* Name
* Bio
* Education
* Skills
* Experience
* Projects
* Certifications
* Contact information

Include a profile completion indicator.

Example:

**Profile strength**
78%

Do not require every field.

---

# 7. EMPLOYER EXPERIENCE

## Employer Dashboard

Show:

* Active opportunities
* Total applicants
* Applications requiring review
* Recent activity

Keep analytics simple.

---

## Create Opportunity

Fields:

* Title
* Description
* Opportunity type
* Location
* Work arrangement
* Compensation
* Duration
* Deadline
* Required skills
* Requirements
* Responsibilities

Provide clear validation.

Drafts should be supported if practical.

---

## Applicant Management

Employer should see:

* Applicant name
* Profile
* Skills
* Education
* Experience
* Application date
* Current status

Employer can change status:

Submitted
→ Reviewing
→ Shortlisted
→ Accepted / Rejected

---

# 8. ADMIN DASHBOARD

Admin should have a clean control center.

Dashboard cards:

* Total Students
* Total Employers
* Active Opportunities
* Total Applications

Include basic charts only where useful.

Admin tables:

### Users

* Name
* Email
* Role
* Status
* Created date

### Opportunities

* Title
* Employer
* Status
* Applications
* Created date

### Applications

* Student
* Opportunity
* Employer
* Status
* Date

Admin should be able to:

* View
* Edit
* Disable
* Delete
* Verify where applicable

Use confirmation dialogs for destructive actions.

---

# 9. DATABASE ARCHITECTURE

Use **Supabase PostgreSQL**.

Use a relational structure that can scale.

Core tables:

### profiles

* id
* user_id
* role
* full_name
* avatar_url
* bio
* phone
* location
* created_at
* updated_at

### student_profiles

* id
* profile_id
* university
* major
* graduation_year
* education_level
* profile_completion

### employer_profiles

* id
* profile_id
* company_id
* position
* verified

### companies

* id
* name
* logo_url
* description
* industry
* website
* location
* employee_count
* verified
* created_at

### skills

* id
* name

### student_skills

* student_id
* skill_id

### experiences

* id
* student_id
* title
* company
* description
* start_date
* end_date

### projects

* id
* student_id
* title
* description
* technologies
* url

### opportunities

* id
* company_id
* created_by
* title
* description
* type
* location
* work_type
* compensation
* duration
* deadline
* status
* created_at
* updated_at

### opportunity_skills

* opportunity_id
* skill_id

### applications

* id
* opportunity_id
* student_id
* cover_message
* status
* created_at
* updated_at

### notifications

* id
* user_id
* type
* title
* message
* read
* created_at

Design foreign keys and indexes correctly.

Use UUIDs.

Use timestamps consistently.

---

# 10. AUTHENTICATION

Use **Supabase Auth**.

Support:

* Email/password
* Google OAuth

Use role-based authorization.

Roles:

```text
student
employer
admin
```

Never trust role information supplied by the client.

Use database-level authorization and Supabase Row Level Security.

Students must only be able to modify their own data.

Employers must only manage their own companies/opportunities/applications.

Admins can manage the entire platform.

---

# 11. SECURITY

Security is not optional.

Implement:

* Supabase RLS
* Protected routes
* Server-side authorization
* Input validation
* Form validation
* Secure file uploads
* No exposed service-role keys
* Environment variables for secrets
* Proper database constraints
* Prevent duplicate applications

Never place sensitive credentials in frontend code.

---

# 12. TECH STACK

Use:

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* Next.js server/API layer
* Supabase

### Database

* PostgreSQL through Supabase

### Authentication

* Supabase Auth

### Storage

* Supabase Storage

### Deployment architecture

Keep the project structured so it can later move into a monorepo architecture.

Prefer a clean separation between:

```text
apps/
  web/

packages/
  ui/
  database/
  types/
  config/
```

If the chosen environment does not require a monorepo immediately, structure the code so migration into one later is straightforward.

Do not introduce unnecessary infrastructure at MVP stage.

---

# 13. UI / UX BRAND IDENTITY

This is extremely important.

SkillBridge must visually feel like the SkillBridge brand.

## Brand personality

**Intelligent**
**Ambitious**
**Human**
**Modern**
**Progressive**
**Trustworthy**

Avoid:

* Generic corporate HR SaaS
* Generic Bootstrap dashboard
* Excessive gradients
* Overly playful startup aesthetics
* Cheap-looking purple UI
* Template-like layouts

---

# 14. COLOR SYSTEM

Primary brand:

**#3C096C**

Use it strategically.

Supporting purple:

**#5A189A**

Secondary purple:

**#7B2CBF**

Light purple:

**#E9D8FD**

AI / technology accent:

**#38BDF8**

Base:

* White
* Very light gray
* Dark charcoal
* Near-black

The overall interface should remain **light-mode first**.

Purple should be an accent and brand anchor, not a wall of purple.

Use neutral surfaces for most application UI.

---

# 15. TYPOGRAPHY

Primary typography direction:

### Headings

**Urbanist**

Use:

* Strong weights
* Large display typography
* Tight hierarchy
* Confident headlines

### Body

**Jost**

Use for:

* Paragraphs
* Labels
* Navigation
* Supporting information

Typography should feel contemporary and slightly editorial rather than generic SaaS.

---

# 16. VISUAL LANGUAGE

Use:

* Large typography
* Generous whitespace
* Strong grid
* Clean cards
* Subtle borders
* Soft shadows
* Controlled corner radius
* Fine gradients
* Very subtle grain/noise
* Purple light effects
* Glass layers only where appropriate
* Strong alignment
* Editorial composition

The visual identity should combine:

**Modern digital product + premium career platform + subtle neo-brutalist influence.**

Do NOT turn the entire application into literal brutalism.

Use brutalist influence through:

* strong typography
* asymmetry
* hard visual hierarchy
* oversized elements
* deliberate spacing
* confident layouts

---

# 17. COMPONENT SYSTEM

Create reusable components.

Examples:

```text
Button
Input
Select
Modal
Dialog
Badge
Avatar
Card
OpportunityCard
CompanyCard
ProfileCard
StatusBadge
Navbar
Sidebar
MobileNavigation
SearchBar
FilterPanel
EmptyState
LoadingState
Toast
Dropdown
Tabs
Pagination
DataTable
```

Avoid duplicating UI patterns.

Create a small design system before building every page independently.

---

# 18. RESPONSIVE DESIGN

Mobile is a first-class experience.

Breakpoints should support:

* Mobile
* Tablet
* Desktop
* Large desktop

Do not simply shrink the desktop UI.

Redesign navigation and information density for mobile.

Student opportunity discovery should be particularly strong on mobile.

Employer/admin dashboards can become denser on desktop.

---

# 19. LOADING STATES

Do NOT use generic spinning circles everywhere.

Use:

* Skeleton screens
* Progressive loading
* Content placeholders
* Subtle transitions

For major page transitions, use restrained motion.

Loading should feel intentional and premium.

---

# 20. EMPTY STATES

Every major feature needs a meaningful empty state.

Examples:

No applications:

**Your applications will appear here.**

No opportunities:

**No opportunities match your search.**

No applicants:

**Applicants will appear here once students apply.**

Do not leave blank white screens.

---

# 21. MOTION

Use subtle motion.

Examples:

* Card hover
* Button interaction
* Page transitions
* Modal transitions
* Dropdown transitions
* Skeleton shimmer
* Progress animation

Motion should communicate hierarchy and feedback.

Do not use excessive animations.

---

# 22. DATA

Create realistic seed/demo data.

Include:

* Students
* Companies
* Opportunities
* Skills
* Applications

Use realistic Cambodian / Southeast Asian context where appropriate.

Do not use nonsense placeholder content such as:

"Lorem ipsum"
"Company 1"
"Test Job"
"John Doe"

The application should feel like an actual product.

---

# 23. AI FEATURES

AI is part of the long-term SkillBridge vision, but do NOT overbuild AI in the first MVP.

Create the architecture so AI features can be added later.

Possible future features:

* AI resume generation
* AI career guidance
* AI opportunity matching
* AI skill recommendations
* AI workforce analytics

For this MVP, prioritize the core marketplace and workflow.

If implementing an AI feature requires external API credentials that are not available, create a clean abstraction/interface rather than hardcoding fake AI functionality.

---

# 24. ERROR HANDLING

Every important action must have proper states:

* Loading
* Success
* Error
* Empty
* Unauthorized
* Not found

Examples:

Opportunity not found:

Show a proper 404 state.

Unauthorized:

Redirect appropriately.

Failed application:

Show a useful error message.

Never silently fail.

---

# 25. CODE QUALITY

Write production-quality code.

Requirements:

* TypeScript strictness
* Reusable components
* Clear naming
* Small focused components
* No unnecessary duplication
* Proper error handling
* Proper types
* Clean folder structure
* Environment variables
* No hardcoded secrets

Avoid premature abstraction.

Do not build an enormous enterprise architecture for a small MVP.

---

# 26. IMPORTANT DEVELOPMENT RULES

### Rule 1 — Do not invent features

Only implement features required by this specification unless a small supporting feature is clearly necessary.

If you believe a feature is necessary but it is not specified, keep it minimal.

### Rule 2 — Do not replace the stack

Use the specified technology stack.

Do not randomly introduce Firebase, MongoDB, Prisma, Clerk, Auth0, etc.

Supabase is the backend foundation.

### Rule 3 — Build the actual product

Do not create a collection of static screens.

Buttons must work.

Forms must submit.

Authentication must work.

Database operations must work.

Applications must persist.

Employer actions must affect application state.

Admin actions must affect the platform.

### Rule 4 — Test each workflow

Verify:

Student:
Sign up → Profile → Browse → Apply → Track application

Employer:
Sign up → Company → Create opportunity → View applicants → Change status

Admin:
Login → View platform → Manage users/opportunities/applications

### Rule 5 — Do not fake backend functionality

Do not simulate successful database actions with local state when the feature is supposed to persist to Supabase.

### Rule 6 — Protect the database

Implement RLS before considering the feature complete.

### Rule 7 — Maintain visual consistency

Do not create each page with a different design language.

All pages must feel like one product.

---

# 27. BUILD ORDER

Build in this order:

### Phase 1 — Foundation

* Project setup
* Design tokens
* Typography
* Global styles
* Component system
* Supabase connection
* Database schema
* Authentication
* RLS

### Phase 2 — Public Experience

* Landing page
* Login
* Sign up
* Forgot password

### Phase 3 — Student

* Onboarding
* Profile
* Dashboard
* Opportunity marketplace
* Opportunity detail
* Application flow
* Application tracking

### Phase 4 — Employer

* Employer onboarding
* Company profile
* Dashboard
* Opportunity creation
* Opportunity management
* Applicant management

### Phase 5 — Admin

* Admin dashboard
* User management
* Employer management
* Opportunity management
* Application management

### Phase 6 — Polish

* Responsive behavior
* Loading states
* Empty states
* Error states
* Accessibility
* Motion
* UX refinement
* Security review
* End-to-end workflow testing

---

# 28. DEFINITION OF DONE

The MVP is complete only when:

* A student can register.
* A student can create a profile.
* A student can browse opportunities.
* A student can apply.
* The application is stored in Supabase.
* The student can see application status.
* An employer can register.
* An employer can create a company profile.
* An employer can publish an opportunity.
* Students can see the opportunity.
* Employers can see applicants.
* Employers can update application status.
* Admin can manage the platform.
* Authentication works.
* RLS is implemented.
* Responsive layouts work.
* Loading/error/empty states exist.
* No critical console errors remain.
* No fake backend behavior remains.
* The product visually follows the SkillBridge brand identity.

---

# 29. FINAL PRODUCT STANDARD

When making implementation decisions, ask:

> "Would this feel like a real product that SkillBridge could put in front of its first 100 users?"

If the answer is no, improve it.

Do not optimize for the number of screens.

Optimize for:

**clarity → usability → reliability → visual quality → scalability.**

Build SkillBridge as a coherent product, not a collection of pages.
