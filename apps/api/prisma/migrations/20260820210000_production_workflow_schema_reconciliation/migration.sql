-- PROPOSED ONLY. Review before applying to the linked production database.
-- Additive reconciliation for the legacy Supabase schema and Prisma workflow.
-- This migration contains no DROP or DELETE statements.

ALTER TYPE "ApplicationStatus" ADD VALUE IF NOT EXISTS 'reviewing';
ALTER TYPE "ApplicationStatus" ADD VALUE IF NOT EXISTS 'shortlisted';
ALTER TYPE "ApplicationStatus" ADD VALUE IF NOT EXISTS 'hired';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ApplicationEventType') THEN
    CREATE TYPE "ApplicationEventType" AS ENUM (
      'application_submitted',
      'application_reviewed',
      'candidate_shortlisted',
      'application_accepted',
      'candidate_hired',
      'application_rejected',
      'application_withdrawn'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname IN ('notificationtype', 'NotificationType')) THEN
    CREATE TYPE "NotificationType" AS ENUM (
      'application_status_changed',
      'certificate_verified',
      'certificate_rejected'
    );
  END IF;
END $$;

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'certificate_verified';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'certificate_rejected';

ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "reviewNote" TEXT;
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "candidateFeedback" TEXT;

CREATE TABLE IF NOT EXISTS "ApplicationStatusHistory" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "previousStatus" "ApplicationStatus" NOT NULL,
  "newStatus" "ApplicationStatus" NOT NULL,
  "actorId" TEXT,
  "reviewNote" TEXT,
  "candidateFeedback" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ApplicationStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ApplicationEvent" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "eventType" "ApplicationEventType" NOT NULL,
  "actorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ApplicationEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "applicationId" TEXT,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CertificateVerificationHistory" (
  "id" TEXT NOT NULL,
  "certificateId" TEXT NOT NULL,
  "actorId" TEXT,
  "previousStatus" "CertificateVerificationStatus" NOT NULL,
  "newStatus" "CertificateVerificationStatus" NOT NULL,
  "candidateReason" TEXT,
  "internalNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CertificateVerificationHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ApplicationStatusHistory_applicationId_createdAt_idx"
  ON "ApplicationStatusHistory"("applicationId", "createdAt");
CREATE INDEX IF NOT EXISTS "ApplicationStatusHistory_actorId_idx"
  ON "ApplicationStatusHistory"("actorId");
CREATE INDEX IF NOT EXISTS "ApplicationEvent_applicationId_createdAt_idx"
  ON "ApplicationEvent"("applicationId", "createdAt");
CREATE INDEX IF NOT EXISTS "ApplicationEvent_eventType_createdAt_idx"
  ON "ApplicationEvent"("eventType", "createdAt");
CREATE INDEX IF NOT EXISTS "Notification_userId_createdAt_idx"
  ON "Notification"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Notification_applicationId_idx"
  ON "Notification"("applicationId");
CREATE INDEX IF NOT EXISTS "CertificateVerificationHistory_certificateId_createdAt_idx"
  ON "CertificateVerificationHistory"("certificateId", "createdAt");
CREATE INDEX IF NOT EXISTS "CertificateVerificationHistory_actorId_idx"
  ON "CertificateVerificationHistory"("actorId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ApplicationStatusHistory_applicationId_fkey') THEN
    ALTER TABLE "ApplicationStatusHistory"
      ADD CONSTRAINT "ApplicationStatusHistory_applicationId_fkey"
      FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ApplicationStatusHistory_actorId_fkey') THEN
    ALTER TABLE "ApplicationStatusHistory"
      ADD CONSTRAINT "ApplicationStatusHistory_actorId_fkey"
      FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ApplicationEvent_applicationId_fkey') THEN
    ALTER TABLE "ApplicationEvent"
      ADD CONSTRAINT "ApplicationEvent_applicationId_fkey"
      FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Notification_userId_fkey') THEN
    ALTER TABLE "Notification"
      ADD CONSTRAINT "Notification_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Notification_applicationId_fkey') THEN
    ALTER TABLE "Notification"
      ADD CONSTRAINT "Notification_applicationId_fkey"
      FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CertificateVerificationHistory_certificateId_fkey') THEN
    ALTER TABLE "CertificateVerificationHistory"
      ADD CONSTRAINT "CertificateVerificationHistory_certificateId_fkey"
      FOREIGN KEY ("certificateId") REFERENCES "Certificate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CertificateVerificationHistory_actorId_fkey') THEN
    ALTER TABLE "CertificateVerificationHistory"
      ADD CONSTRAINT "CertificateVerificationHistory_actorId_fkey"
      FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
