-- CreateEnum
CREATE TYPE "VerificationLevel" AS ENUM ('none', 'job_checked', 'company_checked', 'identity_checked');

-- CreateEnum
CREATE TYPE "ShiftType" AS ENUM ('day', 'night', 'rotating', 'flexible');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('full_time', 'contract', 'seasonal');

-- CreateEnum
CREATE TYPE "WorkerApplicationStatus" AS ENUM ('submitted', 'reviewing', 'shortlisted', 'interview', 'hired', 'rejected', 'withdrawn');

-- REPAIR: TeamMember and PhoneOtp were created on the live DB out-of-band (prisma db push)
-- and no migration ever contained their CREATE TABLE. This migration is the earliest one
-- referencing them, so splice the tables in here (current-schema shape) so a fresh replay
-- can build them. TeamMember is created WITHOUT the legacy `invitedById` column / `email_idx`
-- index (dropped below), so those DROP statements are guarded with IF EXISTS below.
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'recruiter',
    "status" TEXT NOT NULL DEFAULT 'invited',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TeamMember_employerId_idx" ON "TeamMember"("employerId");

ALTER TABLE "TeamMember"
  ADD CONSTRAINT "TeamMember_employerId_fkey"
  FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "PhoneOtp" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "PhoneOtp_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PhoneOtp_phone_createdAt_idx" ON "PhoneOtp"("phone", "createdAt");
CREATE INDEX "PhoneOtp_phone_expiresAt_idx" ON "PhoneOtp"("phone", "expiresAt");

-- REPAIR: the Conversation/Interview/Message/SkillAttestation tables (and their legacy
-- columns/indexes/types below) were created out-of-band and dropped on the live DB; no
-- migration ever created them, so a fresh replay has nothing to drop. All DROP statements
-- for those objects are guarded with IF EXISTS to replay cleanly from an empty database.
-- DropForeignKey
ALTER TABLE IF EXISTS "Conversation" DROP CONSTRAINT IF EXISTS "Conversation_applicationId_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "Conversation" DROP CONSTRAINT IF EXISTS "Conversation_employerId_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "Conversation" DROP CONSTRAINT IF EXISTS "Conversation_projectId_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "Conversation" DROP CONSTRAINT IF EXISTS "Conversation_studentId_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "Interview" DROP CONSTRAINT IF EXISTS "Interview_applicationId_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "Interview" DROP CONSTRAINT IF EXISTS "Interview_employerId_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "Interview" DROP CONSTRAINT IF EXISTS "Interview_projectId_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "Interview" DROP CONSTRAINT IF EXISTS "Interview_studentId_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "Message" DROP CONSTRAINT IF EXISTS "Message_conversationId_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "SkillAttestation" DROP CONSTRAINT IF EXISTS "SkillAttestation_employerId_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "SkillAttestation" DROP CONSTRAINT IF EXISTS "SkillAttestation_studentId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "TeamMember_email_idx";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN IF EXISTS "stage";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN IF EXISTS "publishedAt";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "bio";

-- AlterTable
ALTER TABLE "TeamMember" DROP COLUMN IF EXISTS "invitedById";

-- DropTable
DROP TABLE IF EXISTS "Conversation";

-- DropTable
DROP TABLE IF EXISTS "Interview";

-- DropTable
DROP TABLE IF EXISTS "Message";

-- DropTable
DROP TABLE IF EXISTS "SkillAttestation";

-- DropEnum
DROP TYPE IF EXISTS "ApplicationStage";

-- DropEnum
DROP TYPE IF EXISTS "InterviewRecommendation";

-- DropEnum
DROP TYPE IF EXISTS "InterviewStatus";

-- DropEnum
DROP TYPE IF EXISTS "InterviewType";

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verificationLevel" "VerificationLevel" NOT NULL DEFAULT 'none',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "payPerMonth" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "shift" "ShiftType" NOT NULL DEFAULT 'day',
    "employmentType" "EmploymentType" NOT NULL DEFAULT 'full_time',
    "location" TEXT,
    "distanceKm" INTEGER NOT NULL DEFAULT 0,
    "skillsRequired" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "matchReason" TEXT,
    "verificationLevel" "VerificationLevel" NOT NULL DEFAULT 'none',
    "lastCheckedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerProfile" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "fullName" TEXT,
    "preferredArea" TEXT,
    "availability" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "identityVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerApplication" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "status" "WorkerApplicationStatus" NOT NULL DEFAULT 'submitted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkRecord" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "workplace" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "provenance" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Company_verified_idx" ON "Company"("verified");

-- CreateIndex
CREATE INDEX "Job_companyId_idx" ON "Job"("companyId");

-- CreateIndex
CREATE INDEX "Job_verificationLevel_idx" ON "Job"("verificationLevel");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerProfile_phone_key" ON "WorkerProfile"("phone");

-- CreateIndex
CREATE INDEX "WorkerProfile_phone_idx" ON "WorkerProfile"("phone");

-- CreateIndex
CREATE INDEX "WorkerApplication_workerId_idx" ON "WorkerApplication"("workerId");

-- CreateIndex
CREATE INDEX "WorkerApplication_jobId_idx" ON "WorkerApplication"("jobId");

-- CreateIndex
CREATE INDEX "WorkerApplication_status_idx" ON "WorkerApplication"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerApplication_workerId_jobId_key" ON "WorkerApplication"("workerId", "jobId");

-- CreateIndex
CREATE INDEX "WorkRecord_workerId_idx" ON "WorkRecord"("workerId");

-- CreateIndex
CREATE INDEX "WorkRecord_verified_idx" ON "WorkRecord"("verified");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_employerId_email_key" ON "TeamMember"("employerId", "email");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerApplication" ADD CONSTRAINT "WorkerApplication_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "WorkerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerApplication" ADD CONSTRAINT "WorkerApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkRecord" ADD CONSTRAINT "WorkRecord_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "WorkerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

