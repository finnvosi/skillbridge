-- Phase 2: employer hiring workflow. This migration is additive and preserves
-- existing `pending` applications as the submitted entry state.
ALTER TYPE "ApplicationStatus" ADD VALUE IF NOT EXISTS 'reviewing';
ALTER TYPE "ApplicationStatus" ADD VALUE IF NOT EXISTS 'shortlisted';
ALTER TYPE "ApplicationStatus" ADD VALUE IF NOT EXISTS 'hired';

CREATE TYPE "ApplicationEventType" AS ENUM (
  'application_submitted',
  'application_reviewed',
  'candidate_shortlisted',
  'application_accepted',
  'candidate_hired',
  'application_rejected'
);

CREATE TYPE "NotificationType" AS ENUM ('application_status_changed');

ALTER TABLE "Application"
  ADD COLUMN "reviewNote" TEXT,
  ADD COLUMN "candidateFeedback" TEXT;

CREATE TABLE "ApplicationStatusHistory" (
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

CREATE TABLE "ApplicationEvent" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "eventType" "ApplicationEventType" NOT NULL,
  "actorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ApplicationEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
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

CREATE INDEX "ApplicationStatusHistory_applicationId_createdAt_idx"
  ON "ApplicationStatusHistory"("applicationId", "createdAt");
CREATE INDEX "ApplicationStatusHistory_actorId_idx"
  ON "ApplicationStatusHistory"("actorId");
CREATE INDEX "ApplicationEvent_applicationId_createdAt_idx"
  ON "ApplicationEvent"("applicationId", "createdAt");
CREATE INDEX "ApplicationEvent_eventType_createdAt_idx"
  ON "ApplicationEvent"("eventType", "createdAt");
CREATE INDEX "Notification_userId_createdAt_idx"
  ON "Notification"("userId", "createdAt");
CREATE INDEX "Notification_applicationId_idx"
  ON "Notification"("applicationId");

ALTER TABLE "ApplicationStatusHistory"
  ADD CONSTRAINT "ApplicationStatusHistory_applicationId_fkey"
  FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "ApplicationStatusHistory_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ApplicationEvent"
  ADD CONSTRAINT "ApplicationEvent_applicationId_fkey"
  FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Notification"
  ADD CONSTRAINT "Notification_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "Notification_applicationId_fkey"
  FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
