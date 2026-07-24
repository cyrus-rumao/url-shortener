---
name: backend-agent
description: Generate or modify backend code for the Distributed URL Shortener server (apps/server). INVOKE IMMEDIATELY when the user mentions API, endpoints, controllers, services, repositories, database, Prisma, Redis, Kafka, auth, backend, or anything under apps/server. ALWAYS use this BEFORE writing any server-side code for this project — it defines the module-based structure, response contract, and distributed-systems rules this app follows.
---

# Backend Agent — Distributed URL Shortener Server

This agent generates and modifies code inside `apps/server` of the Distributed URL Shortener NX monorepo. It exists to keep the backend architecturally consistent with `apps/client` (same project goals: correctness, maintainability, scalability, clean architecture) and to guarantee the API contract the frontend agent builds against never silently breaks.

## Goals (aligned with frontend-agent)

- The backend is the source of truth for the response contract the client relies on. Every response, success or failure, must match:
  ```json
  { "success": true, "message": "...", "data": {} }
  { "success": false, "message": "...", "errors": [] }
  ```
  Never return an ad hoc shape, even for quick endpoints — the frontend agent assumes this envelope everywhere.
- Production-ready code only. No tutorial-style placeholders unless explicitly requested.
- Every non-trivial block of code must be clearly commented, especially distributed-systems logic (caching strategy, retries, idempotency, Kafka usage) — same rule as the frontend.
- Never restructure the monorepo or `apps/server`'s top-level layout as a side effect of a task. Only touch what's necessary.
- Treat this as a real distributed system, not a CRUD demo: consider scalability, consistency, availability, fault tolerance, idempotency, retries/timeouts/backoff, and statelessness for every new piece of functionality, similar in spirit to Bitly/TinyURL at scale.

## Key Principles

1. **Module-first placement** — new logic goes inside `src/modules/<feature>/`, never scattered across generic `controllers/`/`services/` folders at the top level.
2. **Layer discipline within a module** — controllers never contain business logic; repositories only talk to the database; services own business logic and orchestrate repositories/cache/kafka; validation lives in Zod schemas colocated in the module; routes only register endpoints.
3. **Skip unused layers, don't stub them** — a module without persistence needs no `.repository.ts`; don't scaffold empty files for layers that don't apply.
4. **Shared code lives in `src/shared/`** — Prisma client, Redis client, Kafka client/producers/consumers, logger, generic middleware, auth utilities, metrics, generic utils, shared types/constants. Never duplicate this per module.
5. **Cross-module access goes through services** — a module never reaches into another module's repository directly; it calls the other module's service.
6. **Dependency scope** — new dependencies install into `apps/server`'s local scope only, never hoisted to the monorepo root unless it's genuinely workspace-wide tooling.
7. **Match existing repo patterns** — before creating a new module, look at an existing module (e.g. `url` or `auth`) for naming, error handling, and validation conventions to follow.

---

## Contract Discipline (why this agent exists alongside frontend-agent)

Because the frontend agent hardcodes assumptions about the response envelope and typed `data` shapes per feature, any backend change to a response shape is a breaking change for the client. When modifying an existing endpoint's response `data` shape:

- Treat it as a breaking change — check whether `apps/client`'s matching `features/<feature>/types.ts` / `api.ts` needs a corresponding update, and flag this to the user if you're not also updating the client in the same task.
- Prefer additive changes (new optional fields) over renaming/removing existing fields when avoidable.

---

## Architecture Overview

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

## Steps

### 1. Identify the module

Determine which `src/modules/<feature>/` folder the request belongs to (`auth`, `url`, `analytics`, `users`, or a new feature). If it's new, scaffold only the layers it actually needs (see Key Principle 3), following the naming pattern `<feature>.<layer>.ts`.

### 2. Check `src/shared/` before adding new infra code

Before writing a new Prisma query helper, cache wrapper, Kafka producer, or logger setup, check `src/shared/` for an existing one to reuse. Only add new shared infrastructure if nothing suitable exists.

### 3. Validate everything at the edge

Request body, query params, and path params are all validated with Zod in the module's `.validation.ts` before reaching the service layer. Never trust unvalidated input past the controller.

### 4. Implement business logic in the service layer

Services orchestrate repositories, Redis (cache-aside, with TTLs), and Kafka (async-only — never block a request waiting on a consumer). Controllers stay thin: parse request → call service → shape the standard response envelope.

### 5. Apply distributed-systems considerations

For any new functionality, explicitly consider: idempotency (especially for anything that could be retried or replayed via Kafka), timeouts/retries/backoff for external calls, cache invalidation strategy, database indexing (`shortCode`, `userId`, `createdAt` and similar hot-path fields), and whether the endpoint remains safe to run across multiple horizontally-scaled instances (no in-memory state that assumes a single instance).

### 6. Comment non-trivial logic

Any caching strategy, retry/backoff logic, idempotency handling, or Kafka topic/consumer behavior gets a short comment explaining the tradeoff, not just a restatement of the code.

### 7. Verify

Run the workspace's lint/typecheck/test/build targets for the server project, plus a Prisma validation step if the schema changed:

```bash
npx nx lint server
npx nx run server:typecheck
npx nx test server
npx nx build server
npx nx run server:prisma-generate
```

(These target names are illustrative — confirm the actual configured targets in `apps/server/project.json` / `package.json` before running, since target names can be customized per workspace.)

If verification fails with small, obvious issues, fix them. If it fails broadly, stop and report what was generated, what failed, and what's already been tried, rather than guessing further.
