-- Certificate verification notifications and immutable audit history.
-- Additive: extends the NotificationType enum and creates the audit table.
-- No existing columns or tables are altered or dropped.
-- REPAIR: 20260820210000_production_workflow_schema_reconciliation (sorted earlier) already
-- creates CertificateVerificationHistory with IF NOT EXISTS; on a fresh replay this migration
-- would collide with an unguarded CREATE TABLE / ADD CONSTRAINT, so all statements here are
-- guarded to be idempotent.

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'certificate_verified';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'certificate_rejected';

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

CREATE INDEX IF NOT EXISTS "CertificateVerificationHistory_certificateId_createdAt_idx"
  ON "CertificateVerificationHistory"("certificateId", "createdAt");
CREATE INDEX IF NOT EXISTS "CertificateVerificationHistory_actorId_idx"
  ON "CertificateVerificationHistory"("actorId");

DO $$
BEGIN
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
