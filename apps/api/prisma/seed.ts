/**
 * SkillBridge seed script — idempotent demo data (Cambodian context).
 *
 * Safe to run repeatedly: every record is keyed by a stable unique field
 * (user email / project title) via upsert, so re-running never duplicates.
 *
 *   pnpm --filter api seed
 */
import * as bcrypt from 'bcryptjs';
import { prisma } from '../src/db/prisma';

const DEMO_PASSWORD = 'Password123!';

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  console.log('🌱 Seeding SkillBridge demo data...');

  // ---- Employers (Cambodian companies) ----
  const employers = [
    {
      email: 'amara@techforgood.kh',
      name: 'Amara Chen',
      companyName: 'TechForGood Cambodia',
      industry: 'Software & IT',
      companySize: 24,
      verified: true,
    },
    {
      email: 'sok@angkortextiles.com',
      name: 'Sok Visal',
      companyName: 'Angkor Textiles Co.',
      industry: 'Garment Manufacturing',
      companySize: 320,
      verified: true,
    },
    {
      email: 'linna@mekongtravel.kh',
      name: 'Linna Pich',
      companyName: 'Mekong Travel Group',
      industry: 'Tourism & Hospitality',
      companySize: 86,
      verified: false,
    },
  ];

  const employerRecords = [];
  for (const e of employers) {
    const user = await prisma.user.upsert({
      where: { email: e.email },
      update: { name: e.name, role: 'employer' },
      create: {
        email: e.email,
        name: e.name,
        passwordHash,
        role: 'employer',
        emailVerified: true,
      },
    });
    const employer = await prisma.employer.upsert({
      where: { userId: user.id },
      update: {
        companyName: e.companyName,
        industry: e.industry,
        companySize: e.companySize,
        verified: e.verified,
        verifiedAt: e.verified ? new Date() : null,
      },
      create: {
        userId: user.id,
        companyName: e.companyName,
        industry: e.industry,
        companySize: e.companySize,
        verified: e.verified,
        verifiedAt: e.verified ? new Date() : null,
      },
    });
    employerRecords.push({ ...e, user, employer });
  }

  // ---- Students (Cambodian universities) ----
  const students = [
    {
      email: 'sokha@rupp.edu.kh',
      name: 'Sokha Chan',
      university: 'Royal University of Phnom Penh',
      major: 'Computer Science',
      graduationYear: 2026,
      skills: ['React', 'TypeScript', 'Figma', 'UI Design'],
    },
    {
      email: 'dara@nuol.edu.kh',
      name: 'Dara Heng',
      university: 'National University of Laos',
      major: 'Business Administration',
      graduationYear: 2027,
      skills: ['Marketing', 'Excel', 'Public Speaking'],
    },
    {
      email: 'bopha@itc.edu.kh',
      name: 'Bopha Khut',
      university: 'Institute of Technology of Cambodia',
      major: 'Software Engineering',
      graduationYear: 2025,
      skills: ['Node.js', 'PostgreSQL', 'Docker', 'AWS'],
    },
  ];

  for (const s of students) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: { name: s.name, role: 'student' },
      create: {
        email: s.email,
        name: s.name,
        passwordHash,
        role: 'student',
        emailVerified: true,
      },
    });
    await prisma.student.upsert({
      where: { userId: user.id },
      update: {
        university: s.university,
        major: s.major,
        graduationYear: s.graduationYear,
        skills: s.skills,
      },
      create: {
        userId: user.id,
        university: s.university,
        major: s.major,
        graduationYear: s.graduationYear,
        skills: s.skills,
      },
    });
  }

  // ---- Projects ----
  const projects = [
    {
      title: 'Mobile App UI for Local Marketplace',
      description:
        'Design and build a clean React Native interface for a Phnom Penh peer-to-peer marketplace connecting small vendors with buyers.',
      employerEmail: 'amara@techforgood.kh',
      type: 'freelance' as const,
      status: 'open' as const,
      budget: 1200,
      skillsRequired: ['React Native', 'UI Design', 'Figma'],
      location: 'Phnom Penh',
      remote: true,
    },
    {
      title: 'Backend API for Attendance System',
      description:
        'Build a Node.js + PostgreSQL service to track factory worker shift attendance with QR check-in.',
      employerEmail: 'sok@angkortextiles.com',
      type: 'part_time' as const,
      status: 'open' as const,
      budget: 800,
      skillsRequired: ['Node.js', 'PostgreSQL', 'REST API'],
      location: 'Phnom Penh',
      remote: false,
    },
    {
      title: 'Summer Web Development Internship',
      description:
        'Three-month paid internship building features for our travel booking platform. Mentorship provided.',
      employerEmail: 'linna@mekongtravel.kh',
      type: 'internship' as const,
      status: 'open' as const,
      budget: null,
      skillsRequired: ['HTML', 'CSS', 'JavaScript'],
      location: 'Siem Reap',
      remote: false,
    },
    {
      title: 'Data Dashboard for Tourism Insights',
      description:
        'Create a React + Chart.js dashboard visualizing visitor trends across Cambodian provinces.',
      employerEmail: 'linna@mekongtravel.kh',
      type: 'freelance' as const,
      status: 'in_progress' as const,
      budget: 1500,
      skillsRequired: ['React', 'Chart.js', 'Data Viz'],
      location: null,
      remote: true,
    },
  ];

  for (const p of projects) {
    const employerRec = employerRecords.find((e) => e.email === p.employerEmail);
    if (!employerRec) continue;

    const existing = await prisma.project.findFirst({ where: { title: p.title } });
    if (existing) {
      await prisma.project.update({
        where: { id: existing.id },
        data: {
          description: p.description,
          type: p.type,
          status: p.status,
          budget: p.budget,
          skillsRequired: p.skillsRequired,
          location: p.location,
          remote: p.remote,
        },
      });
    } else {
      await prisma.project.create({
        data: {
          title: p.title,
          description: p.description,
          employerId: employerRec.employer.id,
          type: p.type,
          status: p.status,
          budget: p.budget,
          skillsRequired: p.skillsRequired,
          location: p.location,
          remote: p.remote,
        },
      });
    }
  }

  console.log('✅ Seed complete.');
  console.log(`   Employers: ${employerRecords.length}, Students: ${students.length}, Projects: ${projects.length}`);
  console.log(`   Demo password for all seeded users: "${DEMO_PASSWORD}"`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
