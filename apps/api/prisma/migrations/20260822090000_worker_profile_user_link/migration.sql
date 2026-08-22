-- Link WorkerProfile to the authenticated User (fixes SEC-1 IDOR on the
-- worker vertical slice). The userId column is nullable so the pre-existing
-- seeded demo-worker-1 (phone-keyed) remains valid until it is backfilled to a
-- real user account.
ALTER TABLE "WorkerProfile" ADD COLUMN "userId" TEXT;

CREATE UNIQUE INDEX "WorkerProfile_userId_key" ON "WorkerProfile"("userId");

CREATE INDEX "WorkerProfile_userId_idx" ON "WorkerProfile"("userId");

-- REPAIR: constraint renamed to Prisma's canonical name (`WorkerProfile_userId_fkey`); the
-- original name `WorkerProfile_user_fkey` caused drift in prisma migrate diff.
ALTER TABLE "WorkerProfile"
  ADD CONSTRAINT "WorkerProfile_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
