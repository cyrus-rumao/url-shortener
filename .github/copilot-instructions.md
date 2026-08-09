# Copilot Instructions

## Project Overview

This repository is a distributed URL shortener built as a traditional two-application project:

- `frontend/` → React + TypeScript + Vite
- `backend/` → Node.js + Express + TypeScript

The project is intended to demonstrate production-oriented distributed systems concepts rather than being a basic CRUD application. Every design decision should reflect how a real system like Bitly/TinyURL would be built at scale: correctness, maintainability, scalability, performance, and clean architecture.

Core backend technologies:

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- Redis
- Apache Kafka
- JWT
- Argon2
- Zod

Frontend technologies:

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios
- React Compiler
- Lucide React
- Recharts

## Repository Rules

- Keep `frontend/` and `backend/` independent.
- Frontend dependencies belong in `frontend/package.json`.
- Backend dependencies belong in `backend/package.json`.
- Do not install application dependencies at the repository root.
- Do not introduce a monorepo tool such as Nx.
- Do not restructure either app's internal folder structure unless explicitly requested.
- Do not modify unrelated files.
- Do not create unnecessary abstractions.
- Every non-trivial piece of code — especially distributed-systems logic (caching, retries, idempotency, Kafka usage) — must be clearly commented, explaining *why*, not just *what*.

## Ask Before Creating Files or Folders

This applies across the whole repository, in both `frontend/` and `backend/`.

**Before creating any new file or folder, briefly state what you intend to create and why, and wait for confirmation before creating it.**

- Example: "This needs a new module — `backend/src/modules/analytics/` with a controller, service, and repository — since analytics doesn't exist as a feature yet. Should I create it?"
- If a task needs several new files at once, list them together in one question rather than asking repeatedly.
- Editing an existing file does not require asking first — only net-new files/folders do.
- Never scaffold a folder "to be safe" or "for future use." If unsure whether something is needed, ask.

## Frontend Instructions

Frontend-specific implementation rules are maintained separately.

When working inside `frontend/`, follow:

```text
.github/instructions/frontend.instructions.md
```

Do not apply backend-specific architecture rules to frontend code.

## Backend Instructions

When working inside `backend/`, follow:

```text
.github/instructions/backend.instructions.md
```

The backend instructions define the module structure, controller, service, repository, authentication, Prisma, Redis, validation, and error-handling conventions.

## General TypeScript Rules

- Use strict TypeScript.
- Avoid `any`.
- Prefer explicit types where inference is insufficient.
- Do not suppress TypeScript errors simply to make code compile.
- Use ESM imports and exports.
- Preserve the existing TypeScript configuration.
- Do not introduce CommonJS unless explicitly required.

## API Response Contract

Every backend response, success or failure, uses the same envelope. The frontend assumes this shape everywhere it calls the API — treat any deviation as a breaking change.

Success:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Failure:

```json
{
  "success": false,
  "message": "...",
  "errors": []
}
```

## Authentication

The application uses:

- JWT access tokens
- JWT refresh tokens
- HTTP-only cookies
- Redis refresh-session storage
- Argon2 password hashing

Authentication tokens must not be stored in:

- `localStorage`
- `sessionStorage`
- React state

The backend is responsible for authentication cookies.

The authenticated user identity should come from the verified JWT and be attached to the Express request as:

```ts
req.user = {
  id: userId,
};
```

Do not trust a client-supplied user ID when the authenticated identity is available through `req.user`.

## Database

PostgreSQL is the primary source of truth.

Prisma is used for database access.

Database models are defined in:

```text
backend/prisma/schema.prisma
```

Database access should follow the backend repository pattern (see `backend.instructions.md`).

Use Prisma migrations for schema changes.

## Distributed Systems

The project is intended to demonstrate real distributed-systems concepts.

When implementing functionality, consider:

- Horizontal scalability
- Stateless services
- Redis caching
- Cache invalidation
- Database consistency
- Idempotency
- Retries
- Timeouts
- Failure handling
- Race conditions
- Kafka event processing
- Duplicate events
- Eventual consistency
- Observability
- Backpressure

Do not introduce distributed infrastructure merely for the sake of using a technology. Every component should have a clear responsibility.

## URL Redirect Path

The URL redirect path is performance-critical.

The intended flow is:

```text
Short URL
    ↓
Backend
    ↓
Redis lookup
    │
    ├── Cache HIT
    │      ↓
    │   Redirect
    │
    └── Cache MISS
           ↓
       PostgreSQL
           ↓
      Populate Redis
           ↓
         Redirect
```

Non-critical analytics and event processing should not unnecessarily block the redirect response.

## Security

Never commit:

- `.env`
- Database credentials
- JWT secrets
- Redis credentials
- API keys
- AWS credentials

Never expose:

- Password hashes
- JWT secrets
- Database credentials
- Redis credentials

Authentication cookies should use appropriate `httpOnly`, `secure`, `sameSite`, and `maxAge` settings depending on the environment.

## Code Quality

- Prefer simple and explicit implementations.
- Reuse existing utilities before creating new ones.
- Keep business logic testable.
- Keep controllers thin.
- Keep database access isolated.
- Keep authentication logic isolated.
- Handle errors explicitly.
- Do not silently swallow errors.
- Do not return sensitive database fields to the frontend.
- Comment non-obvious distributed-systems behavior.
- Do not over-engineer simple functionality.

## Git Conventions

Use conventional commit prefixes:

```text
feat:
fix:
refactor:
perf:
docs:
test:
chore:
```

Keep commits focused and changes related to the task.

## Documentation

Update documentation when introducing:

- New commands
- New environment variables
- New architectural conventions
- New infrastructure
- New development workflows

Do not rewrite unrelated documentation.