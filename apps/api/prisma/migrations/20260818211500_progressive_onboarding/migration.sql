-- SkillBridge progressive signup/onboarding (additive migration)
ALTER TABLE "User"
  ADD COLUMN "onboardingStep" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "onboardingCompletedAt" TIMESTAMP(3);

ALTER TABLE "Student"
  ADD COLUMN "location" TEXT,
  ADD COLUMN "opportunityTypes" "ProjectType"[] NOT NULL DEFAULT ARRAY[]::"ProjectType"[],
  ADD COLUMN "workPreference" TEXT;

ALTER TABLE "Employer"
  ADD COLUMN "position" TEXT,
  ADD COLUMN "website" TEXT,
  ADD COLUMN "location" TEXT,
  ADD COLUMN "hiringTypes" "ProjectType"[] NOT NULL DEFAULT ARRAY[]::"ProjectType"[],
  ADD COLUMN "hiringSkills" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "workPreference" TEXT;

-- Existing accounts have already used the product, so do not force them back
-- through first-run onboarding after deployment.
UPDATE "User"
SET "onboardingStep" = 3,
    "onboardingCompletedAt" = COALESCE("onboardingCompletedAt", "createdAt");
