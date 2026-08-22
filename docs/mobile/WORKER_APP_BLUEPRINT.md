# SkillBridge Worker App Blueprint

**Market:** Cambodia  
**Platforms:** iOS and Android  
**Primary user:** Factory and blue-collar workers aged 26–45  
**Product stage:** Discovery and MVP definition  
**Decision:** Build the trust-first MVP after field validation of the highest-risk assumptions

## 1. Product Thesis

SkillBridge is not another general job board.

> SkillBridge helps Cambodian workers find safer, verified work, understand which jobs fit their skills, and carry a portable record of verified employment.

### Core promise

**Find trusted work. Prove your skills. Build a career record you own.**

### Product pillars

1. **Verified Opportunities**
   - SkillBridge checks the company, authorized recruiter, and job-posting evidence.
   - Each verification label explains what was checked and when.
   - Workers can report suspicious jobs, recruiters, fees, or messages.

2. **Skill-Based Job Matching**
   - Jobs are ranked by demonstrated skills, experience, location, shift preference, and eligibility.
   - Every recommendation explains the match and any missing requirement.
   - AI supports normalization and explanation. It does not make unappealable hiring decisions.

3. **Career Passport**
   - A simple, passport-like digital CV containing identity, skills, work history, training, and credentials.
   - Past employers can verify employment records.
   - Workers control what is shared and can present a QR code or time-limited link.

## 2. Evidence and Assumptions

### Known from the founder

- The launch market is Cambodia.
- The primary audience is factory and blue-collar workers aged 26–45.
- The differentiating problem is job-scam risk.
- The intended product capabilities are verified jobs, skill-based matching, and a Career Passport with employer-verified work history.
- The desired experience is minimalist, simple, industrial-premium, and easy to use.

### Desk-research context

Cambodia had 10.8 million internet users at the start of 2025, but 39.3% of the population remained offline. The population was also predominantly rural. This supports a lightweight, low-bandwidth product with recoverable actions rather than an image-heavy experience.[1]

Facebook's reported advertising reach was very large relative to Cambodia's adult population, although DataReportal warns that these figures are not equivalent to unique active users. SkillBridge should support shareable job and Passport links, while keeping verification and application actions inside the trusted product.[1]

Better Factories Cambodia reports more than 645,000 workers across participating factories, with approximately 80% women. Recruitment research must therefore include women workers and account for safety, caregiving, shift, and transport constraints rather than treating the audience as male by default.[2]

Cambodia's manufacturing-export sector remains economically important, while the World Bank highlights uneven household conditions, skills gaps, and the need for better-quality jobs. The product should make compensation and conditions understandable, not optimize only for application volume.[3]

### Product hypotheses requiring field validation

- Workers experience enough uncertainty or fraud in factory recruitment to change their behavior for a verified alternative.
- Workers will trust SkillBridge verification when the proof is explained clearly.
- Phone-number onboarding is more accessible than mandatory email onboarding.
- Salary, take-home pay, location, transport, shift, overtime, benefits, and fees are the first facts workers use to judge a factory job.
- Workers understand a passport metaphor and value a portable verified employment record.
- Employers will spend time verifying past employment records.
- Skill-based explanations improve application quality without discouraging capable workers.

These are hypotheses, not established user preferences. No worker interviews or usability tests have been completed for this blueprint.

## 3. Target User

### Primary persona: experienced factory worker

- Age 26–45
- Khmer-first; English ability varies
- Uses an Android phone in many cases, sometimes shared or low-storage
- May change jobs for income, location, conditions, family needs, or stability
- Has practical skills that are difficult to express in a traditional CV
- Needs to judge whether a job and recruiter are real before investing time or money
- Wants clear facts, not recruitment jargon

### Jobs to be done

1. **When I need work, help me find real jobs near me without risking a scam.**
2. **When I see a job, show me the pay, shift, location, requirements, and proof that it is legitimate.**
3. **When I apply, let me use the experience and skills I already have without repeatedly building a CV.**
4. **When I finish a job, help me preserve verified evidence of that work for my next opportunity.**
5. **When something feels wrong, let me report it safely and understand what happens next.**

### Secondary users

- Factory recruiter or HR representative
- SkillBridge verification and support operator
- Training provider or credential issuer, later

The first mobile release is worker-first. Employer and verification operations should remain in the web/admin product unless field evidence shows a mobile employer workflow is necessary.

## 4. Trust Model

SkillBridge must never display one vague decorative “verified” badge.

### Company verification states

`unsubmitted → under_review → verified → restricted → suspended → expired`

### Job verification states

`draft → evidence_review → verified_open → paused → closed → withdrawn → removed`

### Verification card

Every verified job exposes:

- Company legal or registered name
- Factory or workplace location
- Authorized recruiter name or role
- Verification level
- Evidence categories checked
- Last checked date
- “What this means” explanation
- “What SkillBridge cannot guarantee” explanation
- Report button

### Proposed verification levels

- **Identity checked:** recruiter identity and contact verified
- **Company checked:** organization evidence and workplace checked
- **Job checked:** the company confirmed this vacancy, pay range, location, and recruiter

The label must reflect real operational evidence. It must not imply that SkillBridge guarantees future employer conduct.

### Anti-scam MVP controls

- No worker-facing recruitment fee allowed in a job post
- Warning if a recruiter requests money, deposits, gift cards, passwords, or off-platform identity documents
- In-app report and block
- Verified contact channel shown separately from unverified contact details
- Application submitted inside SkillBridge
- Immutable verification and moderation audit history
- Job-post edits to pay, location, recruiter, or conditions trigger re-review
- Fast suspension workflow for credible reports
- Worker-facing support status after a report
- No public display of sensitive worker documents

## 5. Career Passport

### Purpose

The Career Passport is not a profile-completion game. It is portable evidence that helps a worker move to a better opportunity.

### Passport sections

1. Identity summary
2. Preferred work area and availability
3. Skills grouped by job family
4. Verified employment history
5. Training and credentials
6. Languages
7. Safety or machine-operation qualifications
8. Share controls

### Employment record lifecycle

`worker_draft → employer_requested → employer_verified → disputed → corrected → revoked`

Each record stores:

- Company and workplace
- Role
- Start and end period
- Skills or machines used
- Verification source
- Verification timestamp
- Dispute history

### Privacy rules

- The worker owns the Passport and controls sharing.
- Employers see only the fields included in an application or explicit share.
- Sensitive documents remain private and use short-lived access links.
- A verifier confirms a claim but does not gain unrestricted access to the full Passport.
- QR links expire or can be revoked.
- Changes to verified facts are versioned rather than silently overwritten.

## 6. Skill Matching

### MVP matching method

Start with an explainable weighted matching model, not opaque generative ranking.

**Inputs:**

- Required and preferred skills
- Years or recency of relevant work
- Location and commute preference
- Shift preference and availability
- Employment type
- Required credential
- Salary expectation, when voluntarily provided

**Output shown to the worker:**

- Strong match, possible match, or requirements missing
- “Why this matches you”
- Matching skills
- Missing or unverified requirements
- A way to correct inaccurate profile data

AI may normalize Khmer and English skill names, map similar factory roles, extract skills from verified work records, and generate plain-language explanations. The underlying factors remain inspectable. Protected or sensitive traits must not influence ranking.

## 7. MVP Scope

### Must ship

- Khmer-first onboarding with language switch
- Phone-number sign-in and secure session recovery
- Worker consent and privacy explanation
- Verified-jobs feed
- Search by job, skill, and location
- Simple filters: distance/location, shift, job type, salary, accommodation/transport
- Job-detail page with verification proof and scam-safety guidance
- Explainable skill match
- One-review-page application
- Application status tracking
- Basic Career Passport
- Employer-requested employment verification
- Report, block, and support-status flow
- Low-bandwidth behavior and recoverable drafts
- Push notification plus in-app notification center

### Should ship after core validation

- Saved jobs
- Map view as an alternative, not the default
- Voice-assisted skill entry in Khmer
- Offline Passport preview
- Interview scheduling
- Trusted emergency or family contact sharing

### Later

- Training recommendations
- Skill assessments
- Employer messaging
- Advanced AI career coaching
- Cross-border work
- Financial services
- Social feed

### Explicitly out of scope for worker MVP

- Employer dashboard inside the worker app
- AI-generated resume as the home-page focus
- Public social profiles
- Gamified streaks and badges
- Unverified jobs mixed into the main feed
- Long cover letters
- Required profile completion before job browsing

## 8. Primary User Flow

```text
Open app
  ↓
Choose Khmer or English
  ↓
Continue with phone number
  ↓
View safety promise and consent
  ↓
Choose job interests, location, skills, and shift
  ↓
Browse verified jobs
  ↓
Open job
  ↓
See pay, location, shift, conditions, match reasons, and verification proof
  ↓
Apply using Career Passport
  ↓
Review exactly what will be shared
  ↓
Submit
  ↓
Track status and receive updates
  ↓
If hired, request verified employment record when work ends
```

### Failure and recovery

- Network loss: preserve onboarding and application drafts locally
- Job closes during application: stop submission, explain why, retain the Passport
- Duplicate application: open existing application instead of creating another
- Verification expires: pause new applications until re-reviewed
- Suspicious request: show report/block controls without requiring the worker to finish the application
- Lost phone number: assisted account recovery with strong identity checks
- Employer rejects an employment claim: allow evidence submission and operational review

## 9. Information Architecture

Use four worker tabs only:

1. **Jobs**
2. **Applications**
3. **Passport**
4. **Help**

Account and settings are accessed from the Passport header. Notifications open from a single top-level bell and deep-link to the relevant job, application, verification request, or report.

## 10. Low-Fidelity Wireframes

### Jobs

```text
┌──────────────────────────────┐
│ SkillBridge        🔔   KH ▾ │
│ Find trusted work            │
│ [ Search job or skill      ] │
│ [Near me] [Day] [Salary ▾]   │
│                              │
│ ✓ Job checked                │
│ Sewing Machine Operator      │
│ Reliable Garment Co.         │
│ $___ / month                 │
│ Day shift · 6 km             │
│ You match 4 of 5 skills      │
│ [View job]                   │
│                              │
│ Jobs  Applications Passport  │
│ Help                         │
└──────────────────────────────┘
```

### Job detail

```text
┌──────────────────────────────┐
│ ← Job details                │
│ Sewing Machine Operator      │
│ Reliable Garment Co.         │
│ ✓ Job checked · 12 Aug 2026  │
│ [See what was checked]       │
│                              │
│ PAY        SHIFT      PLACE   │
│ $___       Day        6 km    │
│                              │
│ Why it matches you           │
│ ✓ Industrial sewing          │
│ ✓ Quality inspection         │
│ ! Safety certificate needed  │
│                              │
│ Work conditions              │
│ Transport · Overtime · Leave │
│                              │
│ [Apply with Passport]        │
│ Report a concern             │
└──────────────────────────────┘
```

### Apply review

```text
┌──────────────────────────────┐
│ ← Review application         │
│ The company will receive:    │
│ ✓ Name and contact           │
│ ✓ Matching skills            │
│ ✓ 2 verified work records    │
│ ○ Hide certificate details   │
│                              │
│ No payment is required.      │
│ [Submit application]         │
└──────────────────────────────┘
```

### Career Passport

```text
┌──────────────────────────────┐
│ Career Passport       Share  │
│ [Photo] Sokha                │
│ Machine operator             │
│ 68% ready for applications   │
│                              │
│ VERIFIED WORK                │
│ ✓ ABC Factory · 2022–2025    │
│   Sewing · Quality checking  │
│                              │
│ SKILLS                       │
│ 6 verified · 3 self-declared │
│                              │
│ [Request work verification]  │
└──────────────────────────────┘
```

### Report concern

```text
┌──────────────────────────────┐
│ Report a concern             │
│ What happened?               │
│ ○ Asked me to pay money      │
│ ○ Job information is false   │
│ ○ Recruiter identity concern │
│ ○ Unsafe or abusive contact  │
│ ○ Something else             │
│ [Add optional evidence]      │
│ [Send report]                │
│ Reports are not shown to the │
│ recruiter.                   │
└──────────────────────────────┘
```

## 11. Visual and Interaction Direction

### Design character

**Industrial premium means dependable tools, precise information, strong materials, and calm authority.** It does not mean dark luxury, metallic gradients, machinery photographs, or dense enterprise dashboards.

### Palette

| Token | Color | Use |
|---|---:|---|
| Warm Canvas | `#F7F4ED` | Main background |
| Paper | `#FFFFFF` | Cards and forms |
| Steel Navy | `#17324D` | Primary action, navigation, trust anchor |
| Workwear Orange | `#B45309` | Attention, selected filters, important secondary action |
| Safety Amber | `#F2B84B` | Warning surfaces with dark text |
| Ink | `#17202A` | Primary text |
| Muted Steel | `#5D6875` | Secondary text |
| Border | `#D9D4CA` | Dividers and field outlines |
| Verified Green | `#217A4B` | Confirmed status only |
| Risk Red | `#B42318` | Destructive and scam-risk states only |

White on Steel Navy has a 13.13:1 contrast ratio, Ink on Warm Canvas 14.98:1, Muted Steel on Warm Canvas 5.16:1, and white on Workwear Orange 5.02:1. These combinations clear the WCAG 2.2 minimum for normal text.[6]

### Typography

- Khmer: **Noto Sans Khmer**, tested on real low-cost Android devices
- Latin/numerals: **Inter** or platform system sans
- Body: 17–18 px equivalent
- Labels: 15–16 px minimum
- Important salary: 24–28 px, bold
- No condensed type
- No all-caps Khmer
- Use numerals consistently and localize currency display deliberately

### Components

- Minimum 48 × 48 dp tap targets, exceeding WCAG's 24 × 24 CSS-pixel baseline and aligning with a touch-first audience.[5]
- Full-width primary action on decision screens
- One main action per screen
- Text labels with icons, never icon-only for essential actions
- One radius system: 12 px fields, 16 px cards, pill only for compact filters
- Borders before shadows
- No glassmorphism
- No auto-advancing carousels
- No decorative animation during critical tasks
- Use skeletons and inline retry states, not blocking spinners
- Never communicate verification or risk by color alone

### Voice

- Respectful adult language
- Short sentences
- Concrete facts before marketing copy
- “Job checked” rather than “100% safe”
- “We checked the company and this vacancy” rather than “Trusted badge”
- “No payment is required to apply” near the application action

## 12. Recommended Technology Stack

### Mobile

- Existing **Expo SDK 57 + React Native 0.86 + React 19.2 + TypeScript** foundation
- Existing **React Navigation 7** for native stack and four-tab navigation
- **TanStack Query** for API cache, retries, request state, and offline-aware synchronization
- Existing **Zustand** only for small local UI/session state
- **expo-secure-store** for refresh tokens and sensitive session material
- **expo-localization + i18next** for Khmer-first localization
- **expo-notifications** for application, verification, and safety updates
- **expo-sqlite** for recoverable drafts and bounded offline cache
- **FlashList** for long job lists on lower-end devices
- **Sentry** for crash and release monitoring, with sensitive fields scrubbed
- **EAS Build / Submit / Update** with staged releases and rollback controls

Expo SDK 57 targets React Native 0.86 and React 19.2.3, matching the current mobile package. Its documented minimum Node version is 22.13.x, so the repository's current `node >=18` declaration must be tightened before reproducible mobile builds.[4]

### Backend

Preserve the existing API direction initially:

- Node.js and TypeScript
- Express API
- PostgreSQL
- Prisma
- Zod request validation
- Supabase Postgres and private object storage
- Short-lived signed URLs for private Passport documents
- Background job runner for notifications, verification expiry, and audit processing
- Structured audit log for verification, reports, moderation, and application-state changes

Do not add a separate mobile backend or direct database access from the app. The mobile client should use versioned API contracts.

### Matching service

- MVP: deterministic weighted matching in the API
- AI assist: Khmer/English skill normalization and plain-language explanations
- Later: embeddings or a dedicated matching service only after enough labeled outcomes exist
- Store match factors and model/version metadata for auditability

### Authentication

- Phone OTP as the default worker path
- Email optional for recovery, not mandatory for first access
- Rate limiting, device/session management, and abuse detection
- Assisted recovery workflow for changed or lost numbers

### Testing

- Unit tests for matching, permissions, state transitions, and verification rules
- API contract tests
- React Native Testing Library for critical screens
- Maestro end-to-end tests for onboarding, application, reporting, and Passport sharing
- Real-device testing on at least one low-memory Android device and one supported iPhone
- Khmer truncation, text scaling, screen-reader, weak-network, and interrupted-flow tests

## 13. Existing Repository Impact

The repository already contains an Expo mobile app, so this should be a product reset inside `apps/mobile`, not a second app.

### Existing assets to keep

- Expo and React Native foundation
- TypeScript
- React Navigation
- Shared monorepo types and utilities
- Existing Express, Prisma, and PostgreSQL backend
- Application status history and notification concepts

### Existing concepts that must change

- `Student` and `Project` language is not appropriate for the worker product.
- Mobile navigation currently mixes student, project, AI-resume, and employer flows.
- The `Worker` model currently stores only a skills array.
- `Application` currently belongs to `studentId`, not a general candidate/worker identity.
- `User` requires email and password, which conflicts with phone-first onboarding.
- `Project` lacks factory-job fields such as salary period, pay range, shift, openings, workplace, transport, accommodation, overtime, recruiter, and verification state.
- Employer `verified: Boolean` is too weak for an evidence-based trust model.
- Current shared tokens are generic Apple-blue and do not express the approved industrial trust direction.

These changes require a migration plan that preserves any existing student data rather than renaming tables destructively in one release.

## 14. Delivery Sequence

### Phase 0: Validate the problem and language

- Interview 15 workers across Phnom Penh, Kandal, Kampong Speu, and one additional factory area
- Recruit ages 26–34 and 35–45
- Ensure a strong majority of participants are women because of the garment-sector workforce composition[2]
- Include employed workers, active job seekers, and recent job changers
- Test scam experiences, trust signals, current job-search channels, language, and Passport comprehension
- Interview 5 factory HR/recruiters and 3 verification/support operators

**Gate:** Proceed only if workers recognize the trust problem, understand the proposed proof, and can complete the core prototype without coaching.

### Phase 1: Product and domain foundation

- Approve terminology in Khmer and English
- Define verification policy and operational SLAs
- Finalize Job, Verification, Worker, Employment Record, Report, and Application state machines
- Define worker/employer/admin permissions
- Create API contracts and migration strategy
- Build the revised design tokens and component primitives

### Phase 2: Trusted job discovery vertical slice

- Phone onboarding
- Worker preferences
- Verified job list
- Job detail and verification explanation
- Skill-match explanation
- Application review and submission
- Application tracking
- Report flow

**Gate:** A worker can discover, assess, apply to, and report a verified job on a real Android device under constrained connectivity.

### Phase 3: Career Passport

- Skill and work-history entry
- Employer verification request
- Verified record lifecycle
- Worker-controlled application sharing
- QR and expiring-link sharing
- Dispute and correction flow

### Phase 4: Pilot

- One or two verified factory partners
- 100–300 workers
- Human review for every job
- Feature flags and staged mobile rollout
- Weekly trust, support, and application-quality review

### Phase 5: Scale only after evidence

- Improve matching using real outcomes
- Expand employer self-service carefully
- Add voice assistance if research validates it
- Expand geography and job categories

## 15. Success Metrics

### North-star outcome

**Verified employment outcomes initiated through SkillBridge**

### Primary MVP metrics

- Verified-job detail to application conversion
- Completed verified applications
- Application-to-interview conversion
- Verified employment records created after hiring
- Median time from report submission to first safety action
- Percentage of workers who understand what “verified” means in follow-up testing

### Guardrails

- Confirmed scam or impersonation incidents
- Jobs requiring unauthorized worker payment
- False-positive job suspensions
- Worker support burden
- Unexplained match complaints
- Passport shares containing unintended data
- Crash-free sessions and application-draft recovery rate

### Core analytics events

- `onboarding_started`
- `onboarding_completed`
- `verified_job_viewed`
- `verification_details_opened`
- `match_explanation_viewed`
- `application_started`
- `application_submitted`
- `application_status_viewed`
- `job_report_started`
- `job_report_submitted`
- `employment_verification_requested`
- `employment_record_verified`
- `passport_share_created`
- `passport_share_revoked`

Analytics must never include uploaded documents, government identifiers, report narratives, or sensitive Passport content.

## 16. Discovery Test Plan

### Worker interview prompts

- Tell us about the last time you looked for factory work.
- Where did you first hear about the job?
- What made you trust or distrust it?
- Did anyone ask you for money or documents before you were sure the job was real?
- Which job facts did you check first?
- What would prove that a recruiter and vacancy are genuine?
- How do you show a new employer what work you have done before?
- Who would you allow to see that information?

### Prototype tasks

1. Find a day-shift job near your home.
2. Decide whether the job is genuine.
3. Explain what SkillBridge checked.
4. Decide whether your skills match.
5. Apply and identify what information will be shared.
6. Report a recruiter who asks for money.
7. Add a past job and request employer verification.
8. Share and revoke the Career Passport.

### Validation targets

- At least 80% complete each critical task without facilitator help
- At least 80% correctly explain the verification label
- At least 90% recognize that verification reduces risk but is not a guarantee
- No critical accidental sharing of Passport information
- Khmer copy is understood without relying on English labels

## 17. Immediate Product Decision

**Build, but in this order:** validate the trust model, define verification operations, then ship one complete trusted-job application flow. Do not begin with an AI dashboard, a large job marketplace, or a fully automated Passport system.

The smallest defensible product is:

> A worker opens SkillBridge, sees only reviewed factory jobs, understands what was verified, sees why one job matches their skills, applies with controlled Passport data, tracks the result, and can report suspicious behavior.

## Sources

[1] https://datareportal.com/reports/digital-2025-cambodia — Digital 2025: Cambodia
[2] https://betterwork.org/cambodia — Better Factories Cambodia
[3] https://www.worldbank.org/en/country/cambodia/overview — Cambodia Overview
[4] https://docs.expo.dev/versions/v57.0.0 — Expo SDK 57 Reference
[5] https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html — WCAG 2.2 Target Size Minimum
[6] https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html — WCAG 2.2 Contrast Minimum
