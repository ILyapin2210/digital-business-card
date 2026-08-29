import {
  Prisma,
  PrismaClient,
  SkillCategory,
} from './../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

function getRequiredEnv(name: 'SEED_EMAIL' | 'SEED_PASSWORD'): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} must be set before seeding.`);
  }

  return value;
}

const seedEmail = getRequiredEnv('SEED_EMAIL');
const seedPassword = getRequiredEnv('SEED_PASSWORD');

const skills = [
  { name: 'TypeScript', category: SkillCategory.BACKEND },
  { name: 'Node.js', category: SkillCategory.BACKEND },
  { name: 'NestJS', category: SkillCategory.BACKEND },
  { name: 'GraphQL', category: SkillCategory.BACKEND },
  { name: 'REST APIs', category: SkillCategory.BACKEND },
  { name: 'Kafka', category: SkillCategory.BACKEND },
  { name: 'CockroachDB', category: SkillCategory.DATA },
  { name: 'PostgreSQL', category: SkillCategory.DATA },
  { name: 'Prisma', category: SkillCategory.DATA },
  { name: 'SQL', category: SkillCategory.DATA },
  { name: 'S3-compatible storage', category: SkillCategory.INTEGRATIONS },
  { name: 'Webhooks', category: SkillCategory.INTEGRATIONS },
  { name: 'LLM APIs', category: SkillCategory.INTEGRATIONS },
  { name: 'Email OTP', category: SkillCategory.INTEGRATIONS },
  { name: 'Docker', category: SkillCategory.INFRASTRUCTURE },
  { name: 'Linux', category: SkillCategory.INFRASTRUCTURE },
  { name: 'Git', category: SkillCategory.INFRASTRUCTURE },
  { name: 'React', category: SkillCategory.FRONTEND },
] satisfies Prisma.SkillCreateWithoutProfileInput[];

const profile = {
  name: 'Ivan Lyapin',
  headline: 'Backend developer · Node.js',
  description:
    'Backend developer with 1.5 years of commercial experience building business-process automation and integrations. I design reliable TypeScript services, work with APIs, data and asynchronous workflows.',
  location: 'Semey, Kazakhstan',
  availability: 'Remote · open to opportunities',
  githubUrl: '',
  telegramUrl: 'https://t.me/NaiveAlgorithm',
  contactEmail: 'lyapin.ivan2210@yandex.kz',
  resumeUrl: '',
  experience:
    'NocoBase Russia · 2025–2026\nModular business-process automation platform · Backend / Fullstack developer',
  highlights:
    'Event processing — Kafka retries, idempotency and deduplication\nExternal integrations — S3-compatible storage, webhooks and LLM API\nPlatform backend — REST APIs, data schemas, SQL optimisation and migrations\nIdentity — Email OTP verification for user authentication',
};

async function seed() {
  const user = await prisma.user.upsert({
    where: { email: seedEmail },
    update: {
      passwordHash: await bcrypt.hash(seedPassword, 10),
    },
    create: {
      email: seedEmail,
      passwordHash: await bcrypt.hash(seedPassword, 10),
    },
  });

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {
      ...profile,
      skills: {
        deleteMany: {},
        create: skills,
      },
    },
    create: {
      ...profile,
      userId: user.id,
      skills: {
        create: skills,
      },
    },
  });
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
