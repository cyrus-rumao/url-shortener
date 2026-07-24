# GitHub Copilot Instructions

# Project

Distributed URL Shortener

This repository is intended to be a production-quality distributed systems project that demonstrates scalable backend engineering rather than a simple CRUD application.

Every implementation should prioritize correctness, maintainability, scalability, performance, and clean architecture.

Assume this project will eventually be deployed to AWS and should support horizontal scaling.

---

# Project Goals

The purpose of this project is to gain practical experience with

- Distributed Systems
- Backend Engineering
- Cloud Native Applications
- System Design
- Event Driven Architecture
- Scalable APIs
- Performance Optimization
- High Availability
- Fault Tolerance
- DevOps

Every design decision should reflect real production systems.

---

# Monorepo Structure

This project uses an **NX Monorepo**.

The repository root contains a single NX workspace. All runnable applications live inside the `apps/` directory as independent apps with their own dependencies, configs, and lifecycles.

```
apps/
  client/     -> React + TypeScript frontend
  server/     -> Node.js + TypeScript backend
```

Rules for the monorepo:

- The overall workspace structure (root config, `apps/`, `libs/` if introduced later, NX config files) must remain **unaltered** unless a change is explicitly requested.
- Only the necessary files and sections of code relevant to a task should be changed. Never refactor, move, rename, or restructure unrelated files or folders as a side effect of a task.
- `client` and `server` are independent apps. Do not assume shared dependencies unless something is intentionally placed in a shared `libs/` package.
- Never merge, flatten, or collapse the `apps/client` and `apps/server` boundary.
- Do not introduce a new app, package, or top-level folder unless explicitly requested.

---

# Dependency Installation Rules

This is an NX Monorepo with per-app dependency scoping. When installing any new dependency:

- Install the dependency **only in the local scope of the app that needs it** (`apps/client` or `apps/server`), never at the monorepo root, unless the dependency is a workspace-wide tool (e.g. NX plugins, root-level dev tooling) and this is explicitly requested.
- Never hoist a dependency to the root `package.json` as a shortcut.
- Never add a dependency to both apps unless both apps actually need it.
- Prefer running installs scoped to the target project (e.g. via the package manager's workspace/filter flag for that app) rather than a blanket root install.
- Do not introduce a new dependency if the same capability can be achieved with an existing one already present in that app.

---

# Code Comments

Every piece of code generated must be **neatly and clearly commented**.

- Explain the purpose of functions, classes, and non-trivial logic blocks.
- Explain *why* a decision was made, not just *what* the code does, especially for distributed-systems-related logic (caching strategy, retries, idempotency, Kafka usage, etc).
- Comments should be concise and professional, not redundant restatements of the code.
- Complex algorithms and distributed system tradeoffs must always be documented inline, in addition to any higher-level docs.

---

# Technology Stack

## Frontend (`apps/client`)

React

TypeScript

Tailwind CSS

Axios

Recharts

---

## Backend (`apps/server`)

Node.js

TypeScript

Express

Prisma ORM

Zod

---

## Database

PostgreSQL

---

## Cache

Redis

---

## Message Broker

Apache Kafka

---

## Authentication

JWT

---

## DevOps

Docker

Docker Compose

NGINX

Kubernetes

NX (monorepo tooling / task orchestration)

---

## Cloud

AWS EC2

AWS RDS

AWS ElastiCache

AWS S3

---

## Monitoring

Prometheus

---

## CI/CD

GitHub Actions

---

# General Philosophy

Always generate production-ready code.

Never generate tutorial code.

Never generate placeholder implementations unless explicitly requested.

Prefer scalable solutions over simplistic ones.

Avoid unnecessary abstractions.

Avoid unnecessary dependencies.

Follow industry best practices.

Every generated code block must be clearly commented (see Code Comments section above).

---

# Backend Architecture (`apps/server`)

The backend follows a **feature/module-based architecture**. Each business domain (feature) owns a single self-contained folder under `src/modules/`, containing everything specific to that feature.

A module may contain, as relevant:

Controller

Service

Repository

Routes

Validation (Zod schemas)

Types

Not every module needs every file — for example, a simpler module may skip its own `.repository.ts` or `.validation.ts` if it has no persistence or input validation needs. Do not create empty placeholder files for a layer a module doesn't need.

Within a module:

Controllers should never contain business logic.

Repositories should only communicate with the database.

Services contain business logic and orchestrate repositories/cache/kafka.

Validation belongs in Zod schemas, colocated in that module's `.validation.ts`.

Routes only register endpoints and wire them to controllers.

Cross-cutting, non-feature-specific code (Prisma client, Redis client, Kafka client, logger, auth utilities/middleware, generic middleware, metrics, generic utils, shared types, constants) lives in `src/shared/`, never duplicated inside a module.

A module should only import from other modules through their public surface (e.g. a service function), never reach into another module's repository directly.

---

# Folder Structure

## Backend (`apps/server`) — Module-Based

```
apps/
  server/
    src/
      modules/
        auth/
          auth.controller.ts
          auth.service.ts
          auth.repository.ts
          auth.routes.ts
          auth.validation.ts
          auth.types.ts
        url/
          url.controller.ts
          url.service.ts
          url.repository.ts
          url.routes.ts
          url.validation.ts
          url.types.ts
        analytics/
          analytics.controller.ts
          analytics.service.ts
          analytics.repository.ts
          analytics.routes.ts
        users/
          user.controller.ts
          user.service.ts
          user.repository.ts
      shared/
        auth/
        cache/
        config/
        kafka/
        logger/
        middleware/
        metrics/
        prisma/
        utils/
        types/
        constants/
      app.ts
      server.ts
```

Rules:

- Every feature/domain gets its own folder under `src/modules/<feature>/`.
- Files inside a module are named `<feature>.<layer>.ts` (see Naming).
- `app.ts` assembles the Express app (middleware, route registration, error handler). `server.ts` boots the HTTP server and process-level concerns (graceful shutdown, port binding).
- Anything reusable across more than one module belongs in `src/shared/`, not duplicated per module.
- New features get a new folder under `modules/`; do not bolt new feature logic onto an existing unrelated module.

## Frontend (`apps/client`) — Feature-First

```
apps/
  client/
    public/
    src/
      app/
        App.tsx
        main.tsx
        providers.tsx
        router.tsx
      assets/
        images/
        icons/
        fonts/
      components/
        ui/
        layout/
        common/
        charts/
      features/
        auth/
          components/
          hooks/
          pages/
          api.ts
          types.ts
          validation.ts
        url/
          components/
          hooks/
          pages/
          api.ts
          types.ts
          validation.ts
        analytics/
        dashboard/
      hooks/
      services/
        axios.ts
        auth.service.ts
        storage.service.ts
      context/
      lib/
      utils/
      constants/
      styles/
      types/
      vite-env.d.ts
    package.json
    tsconfig.json
```

Rules:

- Every feature (auth, url, analytics, dashboard, etc.) is self-contained under `src/features/<feature>/`, owning its own components, hooks, pages, API calls, types, and validation.
- `components/` at the root holds only generic, feature-agnostic UI (design-system primitives in `ui/`, page shells in `layout/`, shared widgets in `common/`, reusable chart wrappers in `charts/`) — never feature-specific components.
- `services/` holds cross-cutting client infrastructure (the shared Axios instance, auth service, storage service) — not feature API calls, which belong in each feature's own `api.ts`.
- `hooks/`, `lib/`, `utils/`, `constants/`, `types/`, `context/` at the root are for genuinely cross-feature concerns only. If a hook/type/util is only used by one feature, it belongs inside that feature's folder, not at the root.
- `app/` owns bootstrapping only: app composition, providers, and routing — not business logic.

## General

Do not alter either structure beyond adding files necessary for the requested task. New modules/features get new folders following the pattern above; do not invent a different pattern for a new feature.

---

# API Standards

Always use REST conventions.

Return consistent response structures.

Success

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Failure

```json
{
  "success": false,
  "message": "...",
  "errors": []
}
```

Never return inconsistent response objects.

---

# Error Handling

Always use centralized error middleware.

Never expose stack traces.

Always return meaningful messages.

Prefer custom error classes.

---

# Validation

Always validate

Request Body

Query Parameters

Path Parameters

using Zod.

Never trust user input.

---

# TypeScript

Always use strict typing.

Never use

any

Prefer

unknown

or proper interfaces.

Prefer interfaces for API contracts.

Prefer enums where appropriate.

Avoid type assertions.

Avoid implicit any.

Use readonly whenever applicable.

---

# Async Code

Always use

async/await

Avoid nested promises.

Avoid callback style.

---

# Database

Use Prisma ORM.

Never duplicate database logic.

Use transactions when multiple writes are involved.

Always index

shortCode

userId

createdAt

Use unique constraints appropriately.

Prefer pagination over loading large datasets.

Avoid N+1 query problems.

---

# Redis

Redis is used for

URL cache

Rate limiting

Frequently accessed metadata

Cache strategy should follow Cache Aside.

Never store unnecessary data.

Always consider TTL where applicable.

---

# Kafka

Kafka should only be used for asynchronous processing.

Examples

Analytics

Notifications

Audit Logs

Background Workers

Never block API requests waiting for Kafka consumers.

---

# Authentication

Use JWT.

Support

Access Token

Refresh Token

Protect authenticated endpoints.

Hash passwords using bcrypt.

Never store plaintext passwords.

---

# Logging

Use structured logging.

Log

Errors

Authentication

Database failures

Kafka failures

Unexpected exceptions

Never log passwords.

Never log secrets.

---

# Security

Always consider

SQL Injection

XSS

JWT validation

Rate limiting

CORS

Helmet

Environment variables

Never hardcode secrets.

Never commit API keys.

---

# Performance

Always optimize

Database Queries

Redis Cache

Indexes

Connection Pooling

Compression

Pagination

Avoid unnecessary allocations.

Avoid duplicate computations.

---

# Frontend (`apps/client`)

Use

React Functional Components

Hooks

TypeScript

Axios instance (shared, from `src/services/axios.ts`)

Reusable Components

Never use class components.

Prefer composition over inheritance.

Organize by feature first (see Folder Structure). New UI for a feature (auth, url, analytics, dashboard, etc.) goes inside that feature's own folder under `src/features/`, not into the shared `src/components/` tree.

Only promote a component, hook, or type out of a feature folder into a shared root folder (`components/`, `hooks/`, `types/`, etc.) once it is genuinely reused by more than one feature.

---

# Styling

Use Tailwind CSS only.

Do not write inline styles.

Avoid duplicated utility classes.

Extract reusable UI components.

---

# Charts

Use Recharts.

Analytics dashboard should support

Daily Clicks

Monthly Clicks

Browser Distribution

Country Distribution

Device Distribution

Referrer Distribution

---

# Naming

Variables

camelCase

Functions

camelCase

Components

PascalCase

Interfaces

PascalCase

Enums

PascalCase

Constants

UPPER_SNAKE_CASE

Folders

lowercase

Files

feature.type.ts

Backend examples (inside `src/modules/<feature>/`)

modules/url/url.service.ts

modules/url/url.repository.ts

modules/url/url.controller.ts

modules/url/url.routes.ts

modules/url/url.validation.ts

modules/url/url.types.ts

modules/auth/auth.service.ts

modules/analytics/analytics.controller.ts

Shared/backend examples (inside `src/shared/`)

shared/middleware/auth.middleware.ts

shared/prisma/prisma.client.ts

shared/cache/redis.client.ts

shared/kafka/kafka.producer.ts

Frontend examples (inside `src/features/<feature>/`)

features/url/api.ts

features/url/types.ts

features/url/validation.ts

features/url/hooks/useShortenUrl.ts

features/url/components/UrlForm.tsx

features/url/pages/UrlDashboardPage.tsx

---

# Code Quality

Functions should do one thing.

Prefer functions under 40 lines.

Avoid deeply nested logic.

Prefer early returns.

Prefer guard clauses.

Avoid duplicate code.

Always extract reusable helpers.

Every function, class, and non-trivial block must include clear comments explaining intent.

---

# SOLID Principles

Follow

Single Responsibility

Open Closed

Liskov Substitution

Interface Segregation

Dependency Inversion

---

# Clean Code

Code should be

Readable

Predictable

Modular

Reusable

Self-documenting

Avoid clever code.

Optimize for maintainability.

---

# Documentation

Document

Public APIs

Complex algorithms

Distributed system decisions

Caching strategy

Kafka topics

Tradeoffs

Do not document obvious code.

---

# Distributed Systems Principles

Whenever implementing new functionality, consider

Scalability

Consistency

Availability

Fault Tolerance

Idempotency

Retries

Timeouts

Backoff

Caching

Horizontal Scaling

Database Replication

Eventually Consistent Workflows

Stateless Services

Avoid single points of failure.

---

# DevOps

Development uses

Docker Compose

Production uses

Docker

Kubernetes

NGINX

AWS

Generate production-ready Dockerfiles per app (`apps/client/Dockerfile`, `apps/server/Dockerfile`).

Use multi-stage Docker builds.

Optimize image size.

---

# Monitoring

Expose Prometheus metrics for

HTTP Requests

Response Time

Cache Hits

Cache Misses

Database Queries

Kafka Events

System Health

---

# Git

Commit message format

feat:

fix:

refactor:

perf:

docs:

test:

chore:

---

# Testing

Code should be testable.

Business logic should not depend directly on Express.

Repositories should be mockable.

Use dependency injection where practical.

---

# Copilot Behavior

When generating code

Follow the existing project architecture.

Follow the existing NX monorepo structure exactly. Do not restructure the monorepo.

Follow the module-based structure on the backend (`src/modules/<feature>/`, `src/shared/`) and the feature-first structure on the frontend (`src/features/<feature>/`). Place new code in the correct module/feature folder rather than in a generic or shared location by default.

Do not create empty or unused files for a layer a module doesn't need (e.g. skip `.repository.ts` for a module with no persistence).

Reuse existing utilities whenever possible.

Avoid introducing new libraries unless explicitly requested.

When a new library is required, install it in the local scope of the specific app only (see Dependency Installation Rules).

Always add clear, professional comments to generated code (see Code Comments).

Change only what is necessary and relevant to the requested task; leave everything else untouched.

Prefer scalable implementations.

Prefer production-ready solutions.

If multiple implementations exist, choose the one most suitable for a high-scale distributed system similar to Bitly or TinyURL.

Assume every component will eventually need to run in multiple instances behind a load balancer.

Always optimize for readability before micro-optimizations.

Do not simplify architectural patterns for convenience.