-- Certificate verification loop: explicit verification status, a candidate-facing
-- rejection reason that is safe to return to students, an internal admin note that
-- must never leave the server, and a reviewer audit trail.
--
-- This migration is additive. The live table already carries `verificationStatus`
-- (TEXT) and `verificationNote` (TEXT) columns that were created by an earlier
-- applied migration whose schema.prisma was never updated. We reconcile those
-- columns to the canonical enum/shape used by the generated client and add the
-- new fields. Re-running this migration is safe (all statements are guarded).

-- Create the enum only if it does not already exist.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'certificateverificationstatus'
  ) THEN
    CREATE TYPE "CertificateVerificationStatus" AS ENUM ('pending', 'verified', 'rejected');
  END IF;
END $$;

ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "verifiedBy" TEXT;
ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);

-- Reconcile the pre-existing text `verificationStatus` column to the enum. If it
-- is already the enum type, the DO block is a no-op. The text default must be
-- dropped first because it cannot be auto-cast to the enum type.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Certificate'
      AND column_name = 'verificationStatus'
      AND udt_name <> 'certificateverificationstatus'
  ) THEN
    ALTER TABLE "Certificate" ALTER COLUMN "verificationStatus" DROP DEFAULT;
    ALTER TABLE "Certificate"
      ALTER COLUMN "verificationStatus" TYPE "CertificateVerificationStatus"
        USING "verificationStatus"::"CertificateVerificationStatus";
  END IF;
END $$;

-- Guarantee a sane default for the status column.
ALTER TABLE "Certificate" ALTER COLUMN "verificationStatus"
  SET DEFAULT 'pending';

-- Backfill explicit status from the legacy boolean for any row not already set.
UPDATE "Certificate"
SET "verificationStatus" = CASE WHEN "verified" = TRUE THEN 'verified' ELSE 'pending' END
WHERE "verificationStatus" IS NULL OR "verificationStatus" = '';

-- Index for the admin pending queue.
CREATE INDEX IF NOT EXISTS "Certificate_verificationStatus_idx"
  ON "Certificate"("verificationStatus");
