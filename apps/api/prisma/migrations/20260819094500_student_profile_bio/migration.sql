-- REPAIR: the Certificate table was created on the live DB out-of-band (prisma db push)
-- and no migration ever contained its CREATE TABLE; 6 later migrations ALTER it. Splice
-- the table (pre-bio shape: WITHOUT verificationStatus/verificationNote, which this
-- migration adds below) into the earliest migration that references it so a fresh replay
-- can build the schema. Columns/indexes follow prisma/schema.prisma.
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Certificate_studentId_idx" ON "Certificate"("studentId");
CREATE INDEX "Certificate_verified_idx" ON "Certificate"("verified");

ALTER TABLE "Certificate"
  ADD CONSTRAINT "Certificate_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Student" ADD COLUMN "bio" TEXT;

ALTER TABLE "Certificate"
  ADD COLUMN "verificationStatus" TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN "verificationNote" TEXT;

UPDATE "Certificate"
SET "verificationStatus" = CASE WHEN "verified" = TRUE THEN 'verified' ELSE 'pending' END;