-- CreateTable
CREATE TABLE "PassportShare" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PassportShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PassportShare_token_key" ON "PassportShare"("token");

-- CreateIndex
CREATE INDEX "PassportShare_workerId_idx" ON "PassportShare"("workerId");

-- CreateIndex
CREATE INDEX "PassportShare_token_idx" ON "PassportShare"("token");

-- AddForeignKey
ALTER TABLE "PassportShare" ADD CONSTRAINT "PassportShare_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "WorkerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

