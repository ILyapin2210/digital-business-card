# Digital Business Card

A terminal-style digital business card with a public profile and a protected editing interface.

## Stack

- Frontend: React, TypeScript, Vite, Apollo Client, React Router
- Backend: NestJS, GraphQL, Prisma, JWT, class-validator
- Database: CockroachDB
- Delivery: Docker Compose, Nginx, GitHub Actions

## Architecture

The browser requests the public profile through GraphQL. Editing is protected by a JWT bearer token. The backend validates input, updates the profile and skills in a Prisma transaction, and exposes a health endpoint at `GET /health`.

In Docker, Nginx serves the React build and proxies `/graphql` and `/health` to the API. Prisma migrations run in a separate one-off container before the API starts.

## Local development

Prerequisites: Node.js 22+, pnpm 11+, Docker Desktop.

```bash
cp .env.example .env
docker compose up -d database
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

`pnpm db:seed` creates or resets the owner profile from `SEED_EMAIL` and
`SEED_PASSWORD`. It intentionally does not contain a public default password.

In another terminal, start the frontend:

```bash
pnpm --dir frontend dev
```

Open `http://localhost:5173`. Vite proxies `/graphql` to the local API. Replace the default `JWT_SECRET` in `.env` before any public deployment.

## Environment

Backend variables are listed in `.env.example`:

- `DATABASE_URL` — CockroachDB connection URL
- `JWT_SECRET` — random string of at least 32 characters
- `NODE_ENV` — `development`, `test`, or `production`
- `PORT` — API port, defaults to `3000`
- `CORS_ORIGIN` — comma-separated allowed origins; required in production

The frontend uses `VITE_GRAPHQL_URL` from `frontend/.env.example`. It defaults to `/graphql`, which works with the Vite and Nginx proxies.

## Tests and checks

```bash
pnpm format:check
pnpm lint
pnpm build
pnpm --dir frontend lint
pnpm --dir frontend build
```

E2E tests require a dedicated database whose name includes `_test`:

```bash
docker compose exec database cockroach sql --insecure --execute 'CREATE DATABASE IF NOT EXISTS digital_business_card_test'
DATABASE_URL='postgresql://root@localhost:26257/digital_business_card_test?sslmode=disable' pnpm db:migrate
TEST_DATABASE_URL='postgresql://root@localhost:26257/digital_business_card_test?sslmode=disable' pnpm test:e2e
```

The suite creates and deletes its own user and profile; it never writes to the development profile.

## Docker demo stack

```bash
cp .env.example .env
# Set strong JWT_SECRET and SEED_PASSWORD values in .env
docker compose up -d --build
docker compose run --rm --no-deps migrate pnpm db:seed
```

Open `http://localhost:8080`. The one-off `migrate` container applies database
migrations before the API starts; the explicit second command creates the local
owner account and demo profile from `SEED_EMAIL` and `SEED_PASSWORD`. It is not
run automatically, so it never resets an existing local profile on a later
`docker compose up`.

The Compose database runs in insecure single-node mode and is intended only for
local demos. Its SQL port is also available at `localhost:26257`, so the backend
can be run directly with `pnpm dev`. For a real deployment, use a managed
CockroachDB/PostgreSQL-compatible database with TLS, set its `DATABASE_URL`,
and provide a restricted `CORS_ORIGIN`.

## CI

GitHub Actions runs formatting, linting, production builds, and GraphQL e2e tests against an isolated CockroachDB container on every push and pull request.
