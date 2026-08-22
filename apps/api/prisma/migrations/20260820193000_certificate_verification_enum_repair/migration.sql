-- Repair certificate verification state after the original migration was recorded
-- without creating the enum type in the live database.
-- REPAIR: typname check made case-insensitive — a quoted CREATE TYPE stores the
-- mixed-case name in pg_type, so the lowercase-only check missed the existing enum
-- and re-created it (error 42710 "type already exists").
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname IN ('certificateverificationstatus', 'CertificateVerificationStatus')
  ) THEN
    CREATE TYPE "CertificateVerificationStatus" AS ENUM ('pending', 'verified', 'rejected');
  END IF;
END $$;

ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "verifiedBy" TEXT;

ALTER TABLE "Certificate" ALTER COLUMN "verificationStatus" DROP DEFAULT;
ALTER TABLE "Certificate"
  ALTER COLUMN "verificationStatus" TYPE "CertificateVerificationStatus"
  USING CASE
    WHEN "verificationStatus" IN ('pending', 'verified', 'rejected')
      THEN "verificationStatus"::"CertificateVerificationStatus"
    ELSE 'pending'::"CertificateVerificationStatus"
  END;

ALTER TABLE "Certificate" ALTER COLUMN "verificationStatus"
  SET DEFAULT 'pending'::"CertificateVerificationStatus";

UPDATE "Certificate"
SET "verificationStatus" = CASE WHEN "verified" = TRUE THEN 'verified' ELSE 'pending' END::"CertificateVerificationStatus"
WHERE "verificationStatus" IS NULL;

CREATE INDEX IF NOT EXISTS "Certificate_verificationStatus_idx"
  ON "Certificate"("verificationStatus");
