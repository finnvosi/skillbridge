-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "accommodation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "overtimePaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "transportProvided" BOOLEAN NOT NULL DEFAULT false;

