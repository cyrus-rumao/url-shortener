---
applyTo: "backend/**/*.ts"
---

# Backend Instructions

## Backend Stack

The backend is a Node.js + Express + TypeScript API using:

- Express
- TypeScript
- Prisma
- PostgreSQL
- Redis (via ioredis)
- JWT
- Argon2
- Zod
- cookie-parser
- Apache Kafka

Use the existing stack before introducing additional dependencies. Do not introduce a framework or library without a clear reason, and never install a backend dependency anywhere other than `backend/package.json`.

## Ask Before Creating Files or Folders

Before creating any new file or folder under `backend/`, briefly state what you intend to create and why, and wait for confirmation.

- Example: "This needs a new module — `backend/src/modules/analytics/` with `analytics.controller.ts`, `analytics.service.ts`, and `analytics.repository.ts` — since analytics doesn't exist as a feature yet. Should I create it?"
- Batch multiple new files into a single question when a task needs several at once.
- Editing an existing file never requires asking first.
- Do not scaffold a layer a module doesn't need (e.g. no empty `.repository.ts` for a module with no persistence).

## Backend Architecture — Module-Based

The backend is organized by feature module, not by generic technical layer. Each business domain owns a single self-contained folder under `src/modules/`.

```text
backend/
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
      auth/          -> JWT utilities, cookie utilities
      cache/          -> Redis client, cache-aside helpers
      config/          -> environment configuration
      kafka/            -> Kafka client, producers, consumers
      logger/
      middleware/       -> authenticate, error handler, rate limiter
      metrics/
      prisma/            -> Prisma client singleton
      utils/
      types/
      constants/
    app.ts
    server.ts
```

Within a module, requests flow the same way as a classic layered backend — the layering is just scoped per feature instead of global:

```text
Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Prisma
  ↓
PostgreSQL
```

Redis operations are isolated behind the shared cache layer:

```text
Service
  ↓
Cache / Redis layer (src/shared/cache)
  ↓
Redis
```

Rules:

- A module only contains the layers it actually needs — a module with no persistence needs no `.repository.ts`.
- Cross-cutting, non-feature-specific code (Prisma client, Redis client, Kafka client, logger, generic middleware, auth utilities, metrics, generic utils, shared types/constants) lives in `src/shared/`, never duplicated inside a module.
- A module never reaches into another module's repository directly — cross-module access goes through the other module's service.
- `app.ts` assembles the Express app (middleware, route registration, error handler). `server.ts` boots the HTTP server and process-level concerns (graceful shutdown, port binding).

### Controllers

Controllers are responsible for HTTP concerns:

- Reading `req`
- Validating request input (via the module's Zod schema)
- Calling services
- Setting cookies
- Returning HTTP responses in the standard envelope
- Passing errors to error middleware

Controllers should not:

- Query Prisma directly
- Execute Redis commands directly
- Hash passwords
- Generate JWTs
- Contain substantial business logic

Every response uses the standard envelope:

```ts
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const signupBody = signupSchema.parse(req.body);

    const user = await signupService(signupBody);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};
```

Always send a response from a terminal controller path. On failure, the centralized error middleware returns:

```ts
res.status(statusCode).json({
  success: false,
  message: "...",
  errors: [],
});
```

### Services

Services contain business logic and live in `<feature>.service.ts` within their module.

For authentication, the service coordinates:

- User lookup
- Password hashing/verification
- JWT generation
- Redis session management
- Repository calls

Services should not depend on Express `Request`/`Response`.

```ts
export const signup = async (signupBody: SignupInput) => {
  const existingUser = await findByEmail(signupBody.email);

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await encryptPassword(signupBody.password);

  return createUser(signupBody.name, signupBody.email, hashedPassword);
};
```

Do not put HTTP response logic inside services.

### Repositories

Repositories live in `<feature>.repository.ts` and are the only place that talks to Prisma for that module.

```ts
export async function findByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function findById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function createUser(
  name: string,
  email: string,
  password: string
) {
  return prisma.user.create({
    data: { name, email, password },
  });
}
```

- Do not access Prisma directly from controllers.
- Do not access Prisma directly from services when the operation belongs in a repository.
- Repositories should generally allow database errors to propagate instead of silently returning `undefined`. Avoid unnecessary `try/catch` in repositories.

## Prisma

Prisma is the ORM for PostgreSQL. The schema is located at:

```text
backend/prisma/schema.prisma
```

```bash
# Apply a new migration
npx prisma migrate dev --name <migration-name>

# Regenerate the Prisma Client
npx prisma generate

# Inspect the database
npx prisma studio

# Check migration status
npx prisma migrate status
```

Do not use `prisma db pull` when the schema and migrations are the source of truth. Never manually modify generated Prisma Client files.

Always index `shortCode`, `userId`, and `createdAt` where relevant to query patterns.

## Validation

Use Zod for request validation, defined in each module's `<feature>.validation.ts`.

```ts
export const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export type SignupInput = z.infer<typeof signupSchema>;
```

Validation happens at the controller boundary:

```ts
const signupBody = signupSchema.parse(req.body);
```

Services receive already-validated input. Do not duplicate Zod validation inside services unless there's a specific reason.

## Authentication

Authentication uses:

- Access JWT
- Refresh JWT
- HTTP-only cookies
- Redis refresh sessions
- Argon2 password hashing

### JWT

Access tokens contain the user's ID:

```ts
{
  userId: user.id;
}
```

JWT generation/verification is centralized in `src/shared/auth/` — never generate a JWT directly inside a controller.

### Authentication Middleware

Lives in `src/shared/middleware/` (used across modules via routes). It:

1. Reads the access token from the cookie.
2. Verifies the JWT.
3. Extracts the user ID.
4. Optionally verifies the user still exists.
5. Sets `req.user`.
6. Calls `next()`.

```ts
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthenticated",
        errors: [],
      });
    }

    const decoded = jwt.verify(
      accessToken,
      env.JWT_ACCESS_SECRET
    ) as { userId: string };

    const user = await findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errors: [],
      });
    }

    req.user = { id: user.id };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Token expired",
        errors: [],
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
        errors: [],
      });
    }

    next(error);
  }
};
```

Calling `next()` after successful authentication is mandatory. Never send a response and then call `next()` for the same request.

### Request User Type

Extend Express's request type in `src/shared/types/`:

```ts
declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
      };
    }
  }
}

export {};
```

Use `req.user.id` for authenticated identity. Never trust `req.body.id` for authorization.

## Passwords

Use Argon2 for password hashing.

```text
Signup:  Plain password → Argon2 → hash → PostgreSQL
Login:   Incoming password → Argon2 verification → stored hash
```

Never return the password or password hash in an API response. Never store plaintext passwords.

## Login

1. Find the user by email.
2. Verify the password.
3. Generate an access token.
4. Generate a refresh token.
5. Store the refresh session in Redis.
6. Set authentication cookies.
7. Return safe user information in `data`.

Use the same authentication error for an unknown email and an incorrect password — never reveal whether an email exists.

## Signup

1. Validate input.
2. Check whether the email already exists.
3. Hash the password.
4. Create the user through the repository.
5. Generate authentication tokens if signup logs the user in.
6. Store the refresh session in Redis.
7. Set authentication cookies.
8. Return safe user information in `data`. Never return `password`.

## Redis

Redis is used for temporary/high-speed state, isolated behind `src/shared/cache/`.

Current authentication use:

```text
refresh:<userId>  -> refresh-session information required to validate the refresh token
```

```text
Login:   generate refresh token -> store refresh session in Redis
Refresh: refresh cookie -> verify refresh JWT -> read session from Redis -> validate -> new access token
Logout:  req.user.id -> delete refresh:<userId> from Redis -> clear cookies -> 200
```

Logout should not delete the PostgreSQL user. Never require the client to send a user ID in the logout request body.

## Cookies

Use HTTP-only cookies for authentication tokens.

```ts
{
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
}
```

Use appropriate expiration times for access and refresh tokens. Cookie creation/clearing is centralized in a shared cookie utility (`src/shared/auth/`). When clearing a cookie, preserve `path`/`domain` attributes used when it was set.

## Error Handling

Controllers pass errors to centralized Express error middleware:

```ts
try {
  // operation
} catch (error) {
  next(error);
}
```

- Do not silently swallow errors (`catch (error) { console.log(error) }` when the request still needs to communicate failure).
- Do not replace useful errors with a generic `throw new Error("Something went wrong")` — this destroys debugging information.
- The error middleware always responds with the failure envelope (`success: false`), never a raw stack trace.

## Routes

Each module's `<feature>.routes.ts` defines that module's endpoints and middleware composition.

```ts
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", authenticate, logout);
```

Authentication middleware lives in `src/shared/middleware/`. Routes decide which endpoints require it — do not duplicate authentication logic across individual controllers.

## Environment Variables

Keep secrets in `.env`, loaded through `src/shared/config/` — do not access `process.env` throughout the application.

```text
DATABASE_URL
REDIS_URL
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
PORT
NODE_ENV
KAFKA_BROKERS
```

Never commit `.env`. Never hardcode secrets in source code.

## Distributed Systems

The backend should remain stateless where possible. For any new functionality, explicitly consider:

- Horizontal scaling
- Cache consistency / cache invalidation
- Idempotency
- Retry behavior / timeouts
- Failure handling / race conditions
- Duplicate Kafka events / consumer failures
- Eventual consistency
- Observability
- Backpressure

Do not make Kafka synchronous when the operation doesn't require it. For analytics, prefer:

```text
Request -> perform critical operation -> publish event -> return response
```

rather than blocking the request on analytics processing.

## URL Shortening — Redirect Path

The redirect path is the highest-performance path in the system.

```text
Short Code
   ↓
Redis
   │
   ├── HIT → Redirect immediately
   │
   └── MISS
         ↓
      PostgreSQL
         ↓
      Redis SET
         ↓
      Redirect
```

Analytics should be published asynchronously (Kafka) where possible. Do not perform expensive analytics work before returning the redirect response.

## Performance

- Avoid unnecessary database calls.
- Check Redis first for frequently accessed URL redirects; PostgreSQL remains the source of truth; populate Redis after a cache miss.
- Avoid loading unnecessary columns.
- Do not introduce caching without considering invalidation behavior.

## Security

Never expose: password hashes, JWT secrets, database credentials, Redis credentials, internal infrastructure credentials.

Never trust user-provided IDs for authorization — authorization is based on `req.user.id`.

Use parameterized Prisma queries; avoid constructing raw SQL from user input.

## Code Style

- Use ESM imports. Use `.js` extensions where required by the current module configuration.
- Use `type` imports for type-only imports.
- Avoid `any`.
- Keep controllers thin, services focused on business logic, repositories focused on persistence, middleware focused on request processing/authentication.
- Keep Redis logic and cryptographic operations isolated in `src/shared/`.
- Do not over-engineer simple CRUD operations.

## Do Not

- Put Prisma queries in controllers.
- Put Redis commands in controllers.
- Put business logic in routes.
- Put Express `Request`/`Response` objects in services.
- Return password hashes.
- Store JWTs in `localStorage`.
- Trust client-supplied authenticated user IDs.
- Swallow database errors.
- Disable TypeScript strictness to fix an implementation problem.
- Add unnecessary dependencies.
- Rewrite unrelated backend code.
- Scaffold an unused layer file for a module that doesn't need it.
- Create a new file or folder without asking first.