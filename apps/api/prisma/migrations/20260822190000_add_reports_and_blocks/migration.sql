-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('payment_requested', 'false_information', 'recruiter_identity', 'unsafe_contact', 'other');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('submitted', 'under_review', 'resolved');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'report_status_changed';

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "category" "ReportCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'submitted',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Report_workerId_idx" ON "Report"("workerId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "Block_workerId_idx" ON "Block"("workerId");

-- CreateIndex
CREATE UNIQUE INDEX "Block_workerId_jobId_key" ON "Block"("workerId", "jobId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "WorkerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "WorkerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

