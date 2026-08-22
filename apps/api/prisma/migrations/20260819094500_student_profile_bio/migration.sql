ALTER TABLE "Student" ADD COLUMN "bio" TEXT;

ALTER TABLE "Certificate"
  ADD COLUMN "verificationStatus" TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN "verificationNote" TEXT;

UPDATE "Certificate"
SET "verificationStatus" = CASE WHEN "verified" = TRUE THEN 'verified' ELSE 'pending' END;