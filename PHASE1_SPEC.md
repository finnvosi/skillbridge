# Phase 1 Specification: Student Profile Editor + Certificate Upload

## Context

SkillBridge Sprint 1 (Auth) is complete. The API layer (Express + Prisma) already supports:

- Student profile with `skills[]`, `university`, `major`, `graduationYear`, `bio`, `location`, `opportunityTypes`, `workPreference`
- Certificate model with file upload fields (`fileUrl`, `fileKey`, `mimeType`, `fileSize`, `verified`)
- Matching algorithm that scores projects by skill overlap (40% weight)

**Gap**: No UI for students to edit their profile or upload certificates. The matcher receives empty skill arrays.

---

## User Stories

### US-1: Edit Core Profile

> As a **student**, I want to **edit my university, major, graduation year, bio, location, and work preferences** so that **employers see a complete picture and the matcher can recommend relevant projects**.

### US-2: Manage Skills

> As a **student**, I want to **add/remove skills from a searchable multi-select** so that **my profile reflects what I actually know and matching works**.

### US-3: Upload Certificates

> As a **student**, I want to **upload PDF/image certificates (degree, courses, awards)** so that **admins can verify them and employers trust my credentials**.

### US-4: View Certificate Status

> As a **student**, I want to **see my uploaded certificates with status badges (Pending / Verified / Rejected)** so that **I know what's been reviewed**.

### US-5: Admin Verifies Certificates

> As an **admin**, I want to **view pending certificates, preview the file, and approve/reject with a note** so that **verified badges mean something**.

---

## Functional Requirements

### FR-1: Student Profile Page (`/dashboard/student/profile`)

- **Tabs**: `Profile` | `Certificates` | `Portfolio` (placeholder)
- **Profile Tab** fields:
  - University (text, autocomplete from known list + free entry)
  - Major (text)
  - Graduation Year (number, 2020–2030)
  - Bio (textarea, 500 char max)
  - Location (text, city/country)
  - Opportunity Types (multi-checkbox: Internship, Part-time, Freelance, Full-time)
  - Work Preference (radio: Remote, Hybrid, On-site, No preference)
  - Skills (multi-select with search, from curated taxonomy + custom entry)
- **Save**: Single "Save Changes" button → PATCH `/api/users/profile`
- **Profile Strength Ring** (existing on dashboard) updates in real-time

### FR-2: Skills Taxonomy

- Source: `/api/certificates/skills-taxonomy` (GET) → returns `{ categories: { "Programming": ["TypeScript", "Python", ...], "Design": [...] } }`
- UI: Grouped multi-select with search; "Add custom skill" creates new entry
- Max 20 skills per profile

### FR-3: Certificate Upload (`Certificates` tab)

- **Dropzone**: Drag-drop or click to select
- **Accepted**: PDF, PNG, JPG, JPEG (max 10 MB)
- **Metadata captured on upload**:
  - Title (required, text)
  - Description (optional, textarea)
  - Issuer (optional, text)
  - Issue Date (optional, date picker)
- **Upload flow**:
  1. Client requests presigned URL: POST `/api/certificates/presign` `{ fileName, mimeType, fileSize }`
  2. Client PUTs file directly to Supabase Storage / S3
  3. Client POSTs metadata to `/api/certificates` `{ title, description, issuer, issueDate, fileUrl, fileKey, mimeType, fileSize }`
- **Progress**: Show upload progress bar per file
- **List**: Cards showing thumbnail (PDF icon / image preview), title, issuer, issue date, **status badge**

### FR-4: Certificate Status Badges

- `pending` → Amber "Pending Review"
- `verified` → Green "Verified" + `verifiedAt` timestamp
- `rejected` → Red "Rejected" + admin note (tooltip)

### FR-5: Admin Certificate Verification (`/dashboard/admin/verifications`)

- **List**: Paginated table of pending certificates
  - Columns: Student (name + email link), Certificate Title, Issuer, Issue Date, Uploaded At, Actions
- **Detail Modal** (click row):
  - Full-screen PDF viewer / image preview
  - Student profile link
  - Admin notes field (textarea)
  - Buttons: **Approve** / **Reject**
- **Approve**: PATCH `/api/admin/verifications/certificate/:id` `{ status: 'verified', note }` → sets `verified=true`, `verifiedAt=now()`
- **Reject**: PATCH same endpoint `{ status: 'rejected', note }` → sets `verified=false`, stores note

### FR-6: Profile Strength Calculation (Client-Side)

- Weights (total 100%):
  - Has university: 15%
  - Has major: 10%
  - Has graduation year: 5%
  - Has bio (>100 chars): 10%
  - Has location: 5%
  - Has ≥1 opportunity type: 5%
  - Has work preference: 5%
  - Skills count: 25% (5 skills = 100% of this bucket)
  - Certificates count: 20% (3+ verified = 100% of this bucket)
- Displayed on student dashboard hero ring (existing component)

---

## API Endpoints (Already Exist or Minimal Addition)

| Method | Path                                       | Auth    | Purpose                                |
| ------ | ------------------------------------------ | ------- | -------------------------------------- |
| GET    | `/api/users/profile`                       | Student | Fetch current profile                  |
| PATCH  | `/api/users/profile`                       | Student | Update profile                         |
| GET    | `/api/certificates/skills-taxonomy`        | Student | Skills catalog                         |
| POST   | `/api/certificates/presign`                | Student | Get presigned upload URL               |
| POST   | `/api/certificates`                        | Student | Create certificate record after upload |
| GET    | `/api/certificates`                        | Student | List my certificates                   |
| GET    | `/api/admin/verifications`                 | Admin   | List pending certificates (paginated)  |
| PATCH  | `/api/admin/verifications/certificate/:id` | Admin   | Approve/reject certificate             |

> **Note**: Certificate routes exist in `apps/api/src/routes/certificates.routes.ts`. Admin verification route may need adding.

---

## Database (Prisma) — No Changes Needed

```prisma
model Student {
  // ... existing fields
  certificates Certificate[]  // already present
}

model Certificate {
  id          String   @id @default(cuid())
  studentId   String
  title       String
  description String?
  fileUrl     String
  fileKey     String
  mimeType    String
  fileSize    Int
  verified    Boolean  @default(false)
  verifiedAt  DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  student     Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  @@index([studentId])
  @@index([verified])
}
```

---

## UI/UX Requirements

### Design System

- Use existing components: `Card`, `Button`, `Input`, `Textarea`, `Select`, `MultiSelect`, `Badge`, `Dropzone`, `Progress`, `Modal`, `Table`, `Tabs`
- Follow existing motion patterns: `FadeUp`, `Stagger` for lists
- Color tokens: `primary` (purple), `success` (green), `warning` (amber), `danger` (red)

### Accessibility

- All form inputs: `<label>` + `htmlFor`, `aria-describedby` for errors
- Dropzone: keyboard accessible (Enter/Space to open file picker)
- Modal: focus trap, ESC to close, `aria-modal="true"`
- Status badges: color + text (not color-only)

### Responsive

- Mobile: stacked tabs, full-width dropzone, single-column forms
- Desktop: two-column form (labels left, inputs right), side-by-side certificate cards

### Empty States

- No skills: "Add skills to improve your matches" → CTA to skills section
- No certificates: "Upload your first certificate" → CTA to dropzone

---

## Acceptance Criteria

### AC-1: Profile Edit

- [ ] Student can navigate to `/dashboard/student/profile`
- [ ] All fields pre-populated from API
- [ ] Skills multi-select loads taxonomy, allows search + custom entry
- [ ] Save shows toast "Profile updated" and updates dashboard strength ring
- [ ] Validation: required fields (university, major, graduationYear, at least 1 skill)

### AC-2: Certificate Upload

- [ ] Dropzone accepts PDF/PNG/JPG ≤10MB, rejects others with inline error
- [ ] Upload progress visible per file
- [ ] After upload, certificate appears in list with "Pending Review" badge
- [ ] Certificate metadata editable before final submit (title required)

### AC-3: Admin Verification

- [ ] Admin sees paginated list of pending certificates
- [ ] Click row opens modal with file preview
- [ ] Approve → badge turns green "Verified", student sees update on refresh
- [ ] Reject → badge turns red "Rejected", admin note visible to student on hover

### AC-4: Profile Strength

- [ ] Ring updates immediately after profile save
- [ ] Ring updates after certificate upload (pending counts at 50%, verified at 100%)

### AC-5: Permissions

- [ ] Student cannot access `/dashboard/admin/verifications`
- [ ] Admin cannot edit student profile via API
- [ ] Unauthenticated requests redirect to login

---

## Technical Notes for Developer

### File Upload (Supabase Storage)

```typescript
// apps/web/lib/storage.ts (create if missing)
export async function getPresignedUploadUrl(
  fileName: string,
  mimeType: string,
  fileSize: number,
) {
  const res = await apiRequest<{
    uploadUrl: string;
    fileKey: string;
    publicUrl: string;
  }>(API_ENDPOINTS.certificates.presign, {
    method: "POST",
    body: { fileName, mimeType, fileSize },
    token: getToken(),
  });
  return res;
}

export async function uploadToStorage(uploadUrl: string, file: File) {
  await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
}
```

### API Client Extensions (add to `apps/web/lib/api-client.ts`)

```typescript
certificates: {
  list: '/certificates',
  presign: '/certificates/presign',
  create: '/certificates',
  skillsTaxonomy: '/certificates/skills-taxonomy',
},
admin: {
  // ... existing
  verifyCertificate: (id: string) => `/admin/verifications/certificate/${id}`,
}
```

### Skills Taxonomy Endpoint (add to API if missing)

```typescript
// apps/api/src/routes/certificates.routes.ts
router.get(
  "/skills-taxonomy",
  authenticate,
  asyncHandler(async (req, res) => {
    // Static for now; later move to DB
    const taxonomy = {
      Programming: [
        "TypeScript",
        "JavaScript",
        "Python",
        "Java",
        "Go",
        "Rust",
        "C++",
        "React",
        "Node.js",
        "Next.js",
      ],
      Data: [
        "SQL",
        "PostgreSQL",
        "MongoDB",
        "Pandas",
        "NumPy",
        "Tableau",
        "Power BI",
      ],
      Design: [
        "Figma",
        "UI/UX",
        "Graphic Design",
        "Prototyping",
        "Design Systems",
      ],
      // ... more categories
    };
    res.json({ categories: taxonomy });
  }),
);
```

---

## Out of Scope (Phase 2+)

- AI resume generation
- Portfolio items (projects, links, images)
- Work experience entries
- Public profile view (shareable link)
- Certificate expiration/renewal
- Bulk certificate upload
- Email notifications on verification status change

---

## Dependencies

- Supabase Storage bucket `certificates` configured (public read, authenticated write)
- SendGrid/Mailgun for verification emails (Phase 1.5)
- Skills taxonomy static JSON or DB table

---

## Definition of Done

- All ACs pass manual test
- Lint + typecheck clean (`pnpm run lint && pnpm run build`)
- No console errors in browser
- Mobile + desktop verified
- Code reviewed and merged to `main`
