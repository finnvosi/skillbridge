import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seeds demo certificates for the 5 seeded students and is idempotent:
 * it skips any student that already has at least one certificate.
 *
 * Run against prod with the pooler URL + pgbouncer params, e.g.:
 *   DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=1" \
 *     npx ts-node-dev --transpile-only scripts/seed-analytics.ts
 */

const STUDENT_EMAILS = [
  'sopanha.vosi@skillbridge.demo',
  'chan.dara@skillbridge.demo',
  'srey.pich@skillbridge.demo',
  'vannak.heng@skillbridge.demo',
  'sovannara.kim@skillbridge.demo',
];

const CERTS: Record<string, { title: string; description: string; verified: boolean }[]> = {
  'sopanha.vosi@skillbridge.demo': [
    { title: 'Meta Front-End Developer Certificate', description: 'React, TypeScript, responsive UI', verified: true },
    { title: 'Google UX Design Certificate', description: 'End-to-end product design', verified: false },
  ],
  'chan.dara@skillbridge.demo': [
    { title: 'Python for Data Science', description: 'Pandas, NumPy, SQL', verified: true },
  ],
  'srey.pich@skillbridge.demo': [
    { title: 'Adobe Certified Professional — Visual Design', description: 'Branding & illustration', verified: true },
  ],
  'vannak.heng@skillbridge.demo': [
    { title: 'Google Digital Marketing Certificate', description: 'Campaigns & analytics', verified: true },
  ],
  'sovannara.kim@skillbridge.demo': [
    { title: 'Android Associate Certificate', description: 'Jetpack Compose fundamentals', verified: false },
  ],
};

async function main() {
  console.log('🌱 Seeding certificates...');
  let created = 0;

  for (const email of STUDENT_EMAILS) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { student: true },
    });
    if (!user?.student) {
      console.log(`  skip ${email} (no student profile)`);
      continue;
    }
    const existing = await prisma.certificate.count({
      where: { studentId: user.student.id },
    });
    if (existing > 0) {
      console.log(`  skip ${email} (already has ${existing} certs)`);
      continue;
    }

    for (const c of CERTS[email]) {
      const key = `seed-${user.student.id}-${created}.pdf`;
      await prisma.certificate.create({
        data: {
          studentId: user.student.id,
          title: c.title,
          description: c.description,
          fileUrl: `/uploads/certificates/${key}`,
          fileKey: key,
          mimeType: 'application/pdf',
          fileSize: 124000,
          verified: c.verified,
          verifiedAt: c.verified ? new Date() : null,
        },
      });
      created++;
    }
    console.log(`  ✓ ${email}: ${CERTS[email].length} cert(s)`);
  }

  console.log(`✅ Seeded ${created} certificates.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
