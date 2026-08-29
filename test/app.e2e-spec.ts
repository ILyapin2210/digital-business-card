import { randomUUID } from 'crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

type GraphqlError = {
  extensions?: {
    code?: string;
  };
};

type GraphqlResponse<TData> = {
  data?: TData | null;
  errors?: GraphqlError[];
};

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl || !testDatabaseUrl.includes('_test')) {
  throw new Error(
    'Set TEST_DATABASE_URL to a dedicated database whose name contains "_test".',
  );
}

process.env.DATABASE_URL = testDatabaseUrl;
process.env.JWT_SECRET ??=
  'test-only-jwt-secret-that-is-at-least-32-characters';

describe('GraphQL API (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const testEmail = `e2e-${randomUUID()}@example.test`;
  const testPassword = 'e2e-password';

  async function graphql<TData>(
    query: string,
    variables?: Record<string, unknown>,
    token?: string,
  ) {
    const httpRequest = request(app.getHttpServer()).post('/graphql');

    if (token) {
      httpRequest.set('Authorization', `Bearer ${token}`);
    }

    const response = await httpRequest.send({ query, variables });
    expect(response.status).toBe(200);

    return response.body as GraphqlResponse<TData>;
  }

  function getData<TData>(response: GraphqlResponse<TData>): TData {
    expect(response.errors).toBeUndefined();
    expect(response.data).toBeDefined();

    return response.data as TData;
  }

  async function login() {
    const response = await graphql<{ login: { accessToken: string } }>(
      `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            accessToken
          }
        }
      `,
      { input: { email: testEmail, password: testPassword } },
    );

    return getData(response).login.accessToken;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash: await bcrypt.hash(testPassword, 10),
        profile: {
          create: {
            name: 'E2E User',
            description: 'Temporary test profile',
            skills: {
              create: [{ name: 'TypeScript', category: 'BACKEND' }],
            },
          },
        },
      },
    });
  });

  afterAll(async () => {
    const user = await prisma.user.findUnique({ where: { email: testEmail } });

    if (user) {
      const profile = await prisma.profile.findUnique({
        where: { userId: user.id },
      });

      if (profile) {
        await prisma.skill.deleteMany({ where: { profileId: profile.id } });
        await prisma.profile.delete({ where: { id: profile.id } });
      }

      await prisma.user.delete({ where: { id: user.id } });
    }

    await app.close();
  });

  it('returns a public profile without authentication', async () => {
    const response = await graphql<{
      profile: {
        name: string;
        description: string;
        skills: Array<{ name: string; category: string }>;
      };
    }>(`
      query {
        profile {
          name
          description
          skills {
            name
            category
          }
        }
      }
    `);

    const { profile } = getData(response);
    expect(profile.name).toBeDefined();
    expect(profile.description).toBeDefined();
    expect(profile.skills).toBeInstanceOf(Array);
  });

  it('returns an access token for valid credentials', async () => {
    await expect(login()).resolves.toEqual(expect.any(String));
  });

  it('rejects invalid credentials', async () => {
    const response = await graphql<{ login: { accessToken: string } }>(
      `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            accessToken
          }
        }
      `,
      { input: { email: testEmail, password: 'wrong-password' } },
    );

    expect(response.data).toBeNull();
    expect(response.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED');
  });

  it('rejects unauthenticated profile updates', async () => {
    const response = await graphql(
      `
        mutation UpdateProfile($input: UpdateProfileInput!) {
          updateProfile(input: $input) {
            name
          }
        }
      `,
      { input: validProfileInput() },
    );

    expect(response.data).toBeNull();
    expect(response.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED');
  });

  it('updates the authenticated user profile', async () => {
    const accessToken = await login();
    const response = await graphql<{
      updateProfile: {
        name: string;
        skills: Array<{ name: string; category: string }>;
      };
    }>(
      `
        mutation UpdateProfile($input: UpdateProfileInput!) {
          updateProfile(input: $input) {
            name
            skills {
              name
              category
            }
          }
        }
      `,
      { input: validProfileInput() },
      accessToken,
    );

    const { updateProfile } = getData(response);
    expect(updateProfile.name).toBe('Updated E2E User');
    expect(updateProfile.skills).toEqual(
      expect.arrayContaining([
        { name: 'TypeScript', category: 'BACKEND' },
        { name: 'PostgreSQL', category: 'DATA' },
      ]),
    );
  });

  it('rejects invalid profile input', async () => {
    const accessToken = await login();
    const response = await graphql(
      `
        mutation UpdateProfile($input: UpdateProfileInput!) {
          updateProfile(input: $input) {
            name
          }
        }
      `,
      {
        input: {
          ...validProfileInput(),
          name: '',
          contactEmail: 'not-an-email',
          githubUrl: 'not-a-url',
        },
      },
      accessToken,
    );

    expect(response.data).toBeNull();
    expect(response.errors).toBeDefined();
  });
});

function validProfileInput() {
  return {
    name: 'Updated E2E User',
    headline: 'Backend developer',
    description: 'Updated temporary test profile',
    location: 'Test city',
    availability: 'Remote',
    githubUrl: '',
    telegramUrl: '',
    contactEmail: '',
    resumeUrl: '',
    experience: '',
    highlights: '',
    skills: [
      { name: 'TypeScript', category: 'BACKEND' },
      { name: 'PostgreSQL', category: 'DATA' },
    ],
  };
}
