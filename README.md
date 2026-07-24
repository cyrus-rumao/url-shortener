# Distributed URL Shortener

A production-grade, horizontally scalable URL shortening system built to demonstrate real distributed-systems engineering — not a CRUD toy app. Designed with the same concerns as systems like Bitly/TinyURL: high availability, fault tolerance, caching, async processing, and observability.

This repository is an **NX Monorepo** containing two independent applications:

```
apps/
  client/     -> React + TypeScript frontend (Tailwind, Axios, Recharts)
  server/     -> Node.js + TypeScript backend (Express, Prisma, Zod)
```

Each app manages its own dependencies within its own scope inside the workspace. Shared workspace tooling (NX itself, root-level dev tooling) lives at the repo root only.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Tailwind CSS, Axios, Recharts |
| Backend | Node.js, TypeScript, Express, Prisma ORM, Zod |
| Database | PostgreSQL |
| Cache | Redis |
| Message Broker | Apache Kafka |
| Auth | JWT (access + refresh tokens) |
| Monorepo Tooling | NX |
| Containerization | Docker, Docker Compose |
| Orchestration | Kubernetes |
| Reverse Proxy | NGINX |
| Cloud | AWS (EC2, RDS, ElastiCache, S3) |
| Monitoring | Prometheus |
| CI/CD | GitHub Actions |

---

## Project Structure

```
.
├── apps/
│   ├── client/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   ├── types/
│   │   │   └── styles/
│   │   ├── package.json
│   │   └── ...
│   └── server/
│       ├── src/
│       │   ├── api/
│       │   │   ├── controllers/
│       │   │   ├── routes/
│       │   │   └── middlewares/
│       │   ├── services/
│       │   ├── repositories/
│       │   ├── prisma/
│       │   ├── cache/
│       │   ├── kafka/
│       │   ├── auth/
│       │   ├── validation/
│       │   ├── config/
│       │   ├── logger/
│       │   ├── metrics/
│       │   ├── utils/
│       │   └── types/
│       ├── package.json
│       └── ...
├── nx.json
├── package.json
├── docker-compose.yml
└── README.md
```

> The monorepo structure is intentionally fixed. Only the files relevant to a given change should ever be touched.

---

## Prerequisites

- Node.js (LTS)
- npm (or the package manager configured at the workspace root)
- Docker & Docker Compose
- PostgreSQL (via Docker Compose, or a local instance)
- Redis (via Docker Compose, or a local instance)
- Apache Kafka (via Docker Compose, or a local instance)

---

## Installation

Install root workspace tooling first:

```bash
npm install
```

### Installing dependencies per app

Because this is an NX monorepo, dependencies must be installed **in the local scope of the app that needs them**, not hoisted to the root.

```bash
# Install a dependency into the client app only
npm install <package-name> --workspace=apps/client

# Install a dependency into the server app only
npm install <package-name> --workspace=apps/server

# Install a dev dependency scoped to one app
npm install -D <package-name> --workspace=apps/server
```

Do not run a bare `npm install <package>` at the root for something only one app needs.

---

## Environment Variables

Create a `.env` file inside `apps/server/` (and `apps/client/` if needed) based on the provided `.env.example` files. Typical variables include:

```
# Server
DATABASE_URL=postgresql://user:password@localhost:5432/url_shortener
REDIS_URL=redis://localhost:6379
KAFKA_BROKERS=localhost:9092
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
PORT=4000

# Client
VITE_API_BASE_URL=http://localhost:4000
```

Never commit `.env` files or secrets.

---

## Running in Development

Spin up infrastructure dependencies (Postgres, Redis, Kafka) with Docker Compose:

```bash
docker compose up -d
```

Run both apps in dev mode via NX:

```bash
# Run the server in watch mode
npx nx serve server

# Run the client in dev mode
npx nx serve client


# Run the server in Development mode
npx nx run client:dev
# Run the client in dev mode
npx nx run server:dev
# Run both in parallel

npx nx run-many --target=serve --projects=server,client --parallel
```

Apply Prisma migrations and generate the client:

```bash
npx nx run server:prisma-migrate
npx nx run server:prisma-generate
```

(Or, if the Prisma CLI is invoked directly within the server app: `npx prisma migrate dev` / `npx prisma generate` from `apps/server`.)

---

## Debugging

```bash
# Run the server with the Node inspector attached
npx nx serve server --inspect

# View NX's dependency/task graph to understand what a change affects
npx nx graph

# Show effective config for a given project/target
npx nx show project server --web
```

Use structured logs (see `apps/server/src/logger`) to trace request lifecycles, cache hits/misses, and Kafka event flow during debugging.

---

## Static Analysis / Linting / Formatting

```bash
# Lint all projects
npx nx run-many --target=lint --all

# Lint a single project
npx nx lint server
npx nx lint client

# Type-check
npx nx run-many --target=typecheck --all

# Format
npx nx format:write

# Check formatting without writing
npx nx format:check
```

---

## Testing

```bash
# Run all tests across the workspace
npx nx run-many --target=test --all

# Run tests for a single project
npx nx test server
npx nx test client

# Run tests in watch mode
npx nx test server --watch

# Run only tests affected by your current changes (compared to main)
npx nx affected --target=test

# Generate coverage
npx nx test server --coverage
```

Business logic in `services/` and `repositories/` should remain testable in isolation (dependency-injected, not tightly coupled to Express).

---

## Building

```bash
# Build a single app
npx nx build server
npx nx build client

# Build everything
npx nx run-many --target=build --all

# Build only what's affected by recent changes
npx nx affected --target=build
```

---

## Running in Production (Docker)

Each app ships its own multi-stage, size-optimized Dockerfile.

```bash
# Build production images
docker build -f apps/server/Dockerfile -t url-shortener-server .
docker build -f apps/client/Dockerfile -t url-shortener-client .

# Run the full stack (app services + Postgres + Redis + Kafka + NGINX)
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Deployment (Kubernetes / AWS)

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check rollout status
kubectl rollout status deployment/url-shortener-server
kubectl rollout status deployment/url-shortener-client

# View logs
kubectl logs -f deployment/url-shortener-server

# Scale horizontally
kubectl scale deployment/url-shortener-server --replicas=5
```

Production infrastructure targets:

- **Compute:** AWS EC2 (behind a load balancer), Kubernetes for orchestration
- **Database:** AWS RDS (PostgreSQL) with read replicas as needed
- **Cache:** AWS ElastiCache (Redis)
- **Storage:** AWS S3 (static assets / exports)
- **Reverse Proxy / TLS termination:** NGINX

Services are designed to be stateless and horizontally scalable — no component should be a single point of failure.

---

## CI/CD

GitHub Actions runs on every push/PR:

- Lint (`nx run-many --target=lint`)
- Type-check (`nx run-many --target=typecheck`)
- Test (`nx affected --target=test`)
- Build (`nx affected --target=build`)
- Docker image build & push (on merge to main)

---

## Monitoring

Prometheus metrics are exposed by the server for:

- HTTP request counts & latency
- Cache hit/miss ratio
- Database query performance
- Kafka event throughput
- General system health

---

## Analytics Dashboard

The client exposes an analytics dashboard (via Recharts) covering:

- Daily clicks
- Monthly clicks
- Browser distribution
- Country distribution
- Device distribution
- Referrer distribution

---

## Contribution Guidelines

- Follow the architecture and rules defined in `.github/copilot-instructions.md`.
- Do not alter the monorepo structure (`apps/client`, `apps/server`, NX config) as a side effect of unrelated changes.
- Install new dependencies only in the local scope of the app that needs them.
- Comment all non-trivial code, especially distributed-systems logic (caching, retries, idempotency, Kafka usage).
- Commit messages follow: `feat:`, `fix:`, `refactor:`, `perf:`, `docs:`, `test:`, `chore:`.

---

## License

Add license details here.