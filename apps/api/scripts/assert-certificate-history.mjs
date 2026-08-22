import { PrismaClient } from '@prisma/client';

const certificateId = process.argv[2];
if (!certificateId) {
  process.exitCode = 2;
  throw new Error('certificate id is required');
}

const prisma = new PrismaClient();
try {
  const row = await prisma.certificateVerificationHistory.findFirst({
    where: { certificateId },
    orderBy: { createdAt: 'desc' },
  });
  process.stdout.write(JSON.stringify(row ?? {}));
} finally {
  await prisma.$disconnect();
}
