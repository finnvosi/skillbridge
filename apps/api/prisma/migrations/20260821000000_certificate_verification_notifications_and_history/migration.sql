-- Certificate verification notifications and immutable audit history.
-- Additive: extends the NotificationType enum and creates the audit table.
-- No existing columns or tables are altered or dropped.

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'certificate_verified';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'certificate_rejected';

CREATE TABLE "CertificateVerificationHistory" (
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

CREATE INDEX "CertificateVerificationHistory_certificateId_createdAt_idx"
  ON "CertificateVerificationHistory"("certificateId", "createdAt");
CREATE INDEX "CertificateVerificationHistory_actorId_idx"
  ON "CertificateVerificationHistory"("actorId");

ALTER TABLE "CertificateVerificationHistory"
  ADD CONSTRAINT "CertificateVerificationHistory_certificateId_fkey"
  FOREIGN KEY ("certificateId") REFERENCES "Certificate"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "CertificateVerificationHistory_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
