// Seed the worker vertical slice with demo Cambodian factory/blue-collar data.
// Idempotent: clears worker-slice rows first, then re-creates. Run:
//   pnpm --filter api exec ts-node-dev --transpile-only scripts/seed-worker.ts
import { prisma } from '../src/db/prisma';

async function main() {
  console.log('Clearing worker-slice tables...');
  await prisma.workerApplication.deleteMany();
  await prisma.workRecord.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();
  await prisma.workerProfile.deleteMany();

  console.log('Seeding companies...');
  const garment = await prisma.company.create({
    data: {
      name: 'Phnom Penh Garment Co.',
      location: 'Phnom Penh',
      verified: true,
      verificationLevel: 'company_checked',
    },
  });
  const toy = await prisma.company.create({
    data: {
      name: 'Sihanoukville Toy Factory',
      location: 'Sihanoukville',
      verified: true,
      verificationLevel: 'company_checked',
    },
  });
  const food = await prisma.company.create({
    data: {
      name: 'Angkor Food Processing',
      location: 'Siem Reap',
      verified: false,
      verificationLevel: 'job_checked',
    },
  });

  console.log('Seeding jobs...');
  const jobs = [
    {
      companyId: garment.id,
      title: 'Sewing Machine Operator',
      summary: 'Operate industrial sewing machines on garment production lines.',
      payPerMonth: 220,
      currency: 'USD',
      shift: 'day' as const,
      employmentType: 'full_time' as const,
      location: 'Phnom Penh',
      distanceKm: 4,
      skillsRequired: ['sewing', 'garment', 'attention to detail'],
      matchReason: 'Matches your garment and sewing skills.',
      verificationLevel: 'identity_checked' as const,
      accommodation: false,
      transportProvided: true,
      overtimePaid: true,
    },
    {
      companyId: garment.id,
      title: 'Quality Control Inspector',
      summary: 'Inspect finished garments for defects before shipment.',
      payPerMonth: 250,
      currency: 'USD',
      shift: 'day' as const,
      employmentType: 'full_time' as const,
      location: 'Phnom Penh',
      distanceKm: 6,
      skillsRequired: ['quality control', 'garment', 'English basic'],
      matchReason: 'Uses your quality control experience.',
      verificationLevel: 'identity_checked' as const,
      accommodation: true,
      transportProvided: true,
      overtimePaid: true,
    },
    {
      companyId: toy.id,
      title: 'Assembly Line Worker',
      summary: 'Assemble toy components on a rotating shift.',
      payPerMonth: 210,
      currency: 'USD',
      shift: 'rotating' as const,
      employmentType: 'full_time' as const,
      location: 'Sihanoukville',
      distanceKm: 18,
      skillsRequired: ['assembly', 'factory'],
      matchReason: 'Matches your factory assembly background.',
      verificationLevel: 'company_checked' as const,
      accommodation: false,
      transportProvided: false,
      overtimePaid: false,
    },
    {
      companyId: food.id,
      title: 'Packaging Assistant',
      summary: 'Pack processed food products for distribution.',
      payPerMonth: 180,
      currency: 'USD',
      shift: 'night' as const,
      employmentType: 'contract' as const,
      location: 'Siem Reap',
      distanceKm: 32,
      skillsRequired: ['packaging', 'factory'],
      matchReason: 'Entry-level, no prior experience required.',
      verificationLevel: 'job_checked' as const,
      accommodation: true,
      transportProvided: false,
      overtimePaid: true,
    },
    {
      companyId: toy.id,
      title: 'Warehouse Forklift Operator',
      summary: 'Move materials with a forklift in the warehouse.',
      payPerMonth: 280,
      currency: 'USD',
      shift: 'day' as const,
      employmentType: 'full_time' as const,
      location: 'Sihanoukville',
      distanceKm: 15,
      skillsRequired: ['forklift', 'warehouse', 'logistics'],
      matchReason: 'Matches your logistics and warehouse skills.',
      verificationLevel: 'company_checked' as const,
      accommodation: false,
      transportProvided: true,
      overtimePaid: true,
    },
  ];

  for (const j of jobs) {
    await prisma.job.create({ data: j });
  }

  console.log('Seeding demo worker + passport...');
  const worker = await prisma.workerProfile.upsert({
    where: { phone: '+85512345678' },
    update: {},
    create: {
      id: 'demo-worker-1',
      phone: '+85512345678',
      fullName: 'Sokha Chan',
      preferredArea: 'Phnom Penh',
      availability: 'Immediate',
      skills: ['sewing', 'garment', 'quality control', 'factory'],
      languages: ['Khmer', 'Basic English'],
      identityVerified: true,
      workRecords: {
        create: [
          {
            role: 'Sewing Operator',
            company: 'Prev Garment Factory',
            workplace: 'Phnom Penh',
            startDate: new Date('2021-03-01'),
            endDate: new Date('2024-01-15'),
            verified: true,
            provenance: 'company_verified',
          },
          {
            role: 'Quality Checker',
            company: 'Another Garment Co.',
            workplace: 'Phnom Penh',
            startDate: new Date('2024-02-01'),
            endDate: null,
            verified: false,
            provenance: 'self_declared',
          },
        ],
      },
    },
  });

  console.log(`Done. Demo worker id: ${worker.id}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
