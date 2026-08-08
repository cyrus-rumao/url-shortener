# Distributed URL Shortener

A production-oriented URL shortening system built to explore how a seemingly simple application evolves into a **distributed, highly scalable backend system**.

The core problem is simple:

> Convert a long URL into a short URL and redirect users back to the original destination.

The interesting part is what happens when the system has to handle **millions of URLs, billions of redirects, high read traffic, concurrent requests, failures, analytics, and horizontal scaling**.

This project focuses on solving those problems using real distributed-systems concepts.

---

## What This Project Is About

A basic URL shortener can be implemented with:

```text
Request → Database → Response
```

That works perfectly well at small scale.

But imagine the system receives:

* Millions of URLs
* Billions of redirects
* Thousands of requests per second
* Sudden traffic spikes
* Large amounts of analytics data
* Multiple API instances
* Database failures
* Cache failures
* Duplicate requests
* Concurrent URL creation

At that point, the problem is no longer simply:

> "How do I shorten a URL?"

It becomes:

> **"How do I design a system that can reliably resolve URLs at massive scale while keeping latency low?"**

That is the problem this project explores.

---

# Core Distributed Systems Concepts

## 1. Read-Heavy System Design

URL shorteners are naturally **read-heavy systems**.

Creating a short URL might happen once:

```text
POST /urls
```

But the resulting URL could be accessed thousands or millions of times:

```text
GET /abc123
```

Therefore, optimizing the redirect path is much more important than optimizing URL creation.

The system is designed around this asymmetry.

```text
URL Creation

Low frequency
     ↓
Database


URL Redirect

Extremely high frequency
     ↓
Cache
     ↓
Database only when necessary
```

This introduces the first major design principle:

> **Optimize the hot path rather than treating every operation equally.**

---

# 2. Redis Caching

The redirect path should not query PostgreSQL for every request.

Instead, frequently accessed URLs are cached in Redis.

```text
GET /abc123
      │
      ▼
    Redis
      │
   ┌──┴──┐
   │     │
  HIT   MISS
   │     │
   ▼     ▼
Redirect PostgreSQL
           │
           ▼
         Redis
```

This is the **cache-aside pattern**.

The cache significantly reduces:

* Database load
* Network round trips
* Query execution
* Redirect latency

The project also explores important caching questions:

* What should be cached?
* How long should it remain cached?
* What happens when the cache misses?
* What happens when Redis goes down?
* How should stale data be handled?
* What happens when millions of keys are cached?

Caching is treated as a system-design problem rather than simply adding Redis because Redis exists.

---

# 3. Cache Stampede

Suppose a popular URL expires from the cache.

Suddenly thousands of requests arrive:

```text
Request 1 ──┐
Request 2 ──┤
Request 3 ──┤
Request 4 ──┼──► Cache MISS ──► PostgreSQL
Request 5 ──┤
Request 6 ──┤
Request N ──┘
```

Every request may attempt to query PostgreSQL simultaneously.

This creates a **cache stampede**.

The project provides an opportunity to explore techniques such as:

* Request coalescing
* Locks
* TTL jitter
* Background cache refresh
* Single-flight patterns

This is an example of how caching introduces its own distributed-system problems.

---

# 4. Short URL Generation

A short URL requires a unique identifier.

For example:

```text
https://example.com/this/is/a/very/long/url
```

becomes:

```text
https://short.ly/aZ91xK
```

The identifier must be:

* Unique
* Short
* Efficient to generate
* Efficient to look up
* Safe under concurrent requests
* Scalable across multiple API instances

A common approach is Base62 encoding:

```text
a-z
A-Z
0-9
```

For example:

```text
62^7 = 3,521,614,606,208
```

possible 7-character combinations.

However, generating identifiers becomes more interesting when multiple servers are creating URLs simultaneously.

This leads into concepts such as:

* Collision handling
* Database uniqueness constraints
* Random ID generation
* Sequential IDs
* Distributed ID generation
* Snowflake-style identifiers

---

# 5. Concurrency

Imagine two requests arrive at almost exactly the same time:

```text
Request A ──► Generate abc123
Request B ──► Generate abc123
```

Without proper protection, both requests could attempt to create the same short URL.

The system therefore relies on multiple layers of protection:

```text
Application Logic
       ↓
Unique Constraint
       ↓
Database
```

This demonstrates an important principle:

> **Application-level checks alone are not sufficient for correctness under concurrency.**

The database must enforce invariants that must never be violated.

---

# 6. PostgreSQL as the Source of Truth

PostgreSQL acts as the durable source of truth.

Redis improves performance, but it should not become the authoritative storage system for permanent URL data.

Conceptually:

```text
PostgreSQL
    │
    │ source of truth
    ▼
Persistent URL Data

Redis
    │
    │ performance layer
    ▼
Frequently accessed URLs
```

This separation is important because caches can disappear.

If Redis is deleted:

```text
Redis = empty
```

the application should still function.

The database allows the cache to be rebuilt.

---

# 7. Kafka and Event-Driven Architecture

Redirecting a user and recording analytics are two different concerns.

Consider:

```text
GET /abc123
```

The user needs the redirect immediately.

But the system may also want to record:

* Timestamp
* IP address
* User agent
* Device
* Browser
* Geographic information
* Referrer
* Click count

Doing all of this synchronously increases latency.

Instead:

```text
User
 │
 ▼
API
 │
 ├──────────────► Redirect
 │
 └──────────────► Kafka
                       │
                       ▼
                   Consumers
                       │
                       ▼
                   Analytics
```

The redirect does not need to wait for analytics processing.

This introduces **asynchronous processing**.

---

# 8. Why Kafka?

Kafka allows the system to separate the producer of an event from the systems that consume it.

For example:

```text
                 Kafka
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
   Analytics    Statistics   Audit
   Consumer      Consumer     Consumer
```

The API does not need to know what every consumer does.

A new consumer can be introduced later without modifying the redirect logic.

This demonstrates:

* Event-driven architecture
* Loose coupling
* Producer/consumer models
* Consumer groups
* Partitioning
* Message ordering
* At-least-once delivery
* Idempotent processing

---

# 9. At-Least-Once Delivery

Distributed systems fail.

A Kafka consumer might process an event successfully but crash before acknowledging it.

The event may then be delivered again.

```text
Event
 │
 ▼
Consumer
 │
 ├── Process
 │
 └── Crash
      │
      ▼
Event delivered again
```

Therefore, analytics consumers should be designed to handle duplicate events.

This introduces:

> **Idempotency**

Processing the same event twice should not incorrectly increase the final result twice.

For example:

```text
Event ID: 78291
```

can be tracked so that duplicate processing is ignored.

This is one of the more important real-world distributed-system concepts demonstrated by the project.

---

# 10. Database Scaling

Eventually, PostgreSQL can become a bottleneck.

The project explores the progression from:

```text
Single PostgreSQL Instance
```

to:

```text
Primary
  │
  ├── Read Replica
  ├── Read Replica
  └── Read Replica
```

This introduces the difference between:

* Vertical scaling
* Horizontal scaling
* Read replicas
* Replication
* Eventual consistency
* Database bottlenecks

The important question is not simply:

> "Can PostgreSQL handle this?"

It is:

> **"Which workload should PostgreSQL handle, and which workload should be moved elsewhere?"**

---

# 11. Horizontal Scaling

A single API server eventually becomes a limitation.

Instead:

```text
                Load Balancer
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       Server 1   Server 2   Server 3
          │          │          │
          └──────────┼──────────┘
                     │
              Shared Services
```

Because the API is designed to be stateless, additional instances can be added as traffic increases.

This introduces:

* Load balancing
* Stateless services
* Horizontal scaling
* Service discovery
* Shared state
* Failure isolation

---

# 12. Stateless Architecture

A server should not depend on memory stored inside one particular API instance.

Bad:

```text
User → Server 1

Session stored only in Server 1
```

If the next request goes to Server 2:

```text
User → Server 2

Session does not exist
```

Instead, shared state belongs in systems such as:

```text
Redis
PostgreSQL
```

while API instances remain replaceable.

This makes horizontal scaling possible.

---

# 13. Authentication and Token Management

The system uses JWT-based authentication.

The authentication architecture separates:

```text
Access Token
    ↓
Short-lived
    ↓
API authorization
```

and:

```text
Refresh Token
    ↓
Longer-lived
    ↓
Obtain new access token
```

Redis can be used for refresh-token management and revocation.

This demonstrates the difference between:

* Authentication
* Authorization
* Stateless access tokens
* Stateful refresh-token management
* Token expiration
* Token revocation

---

# 14. Rate Limiting

Public URL shorteners are attractive targets for abuse.

Without rate limiting:

```text
Attacker
   │
   ├── Request
   ├── Request
   ├── Request
   ├── Request
   ├── Request
   └── ...
```

A distributed rate limiter can use Redis to coordinate limits across multiple API instances.

For example:

```text
IP → Redis Counter
```

rather than keeping counters inside individual servers.

This ensures:

```text
Server 1 ──┐
Server 2 ──┼──► Shared Rate Limit
Server 3 ──┘
```

---

# 15. Fault Tolerance

Distributed systems are interesting primarily because things fail.

The project considers failures such as:

```text
Redis unavailable
Kafka unavailable
Database unavailable
API instance crashes
Network timeout
Duplicate message
Slow database query
Cache corruption
Traffic spike
```

The important question becomes:

> **What should happen when a dependency fails?**

For example, if Redis fails:

```text
Redis unavailable
      │
      ▼
Fallback to PostgreSQL
```

The system may become slower, but it should ideally remain functional.

This introduces the concept of **graceful degradation**.

---

# 16. Observability

A distributed system cannot be operated reliably by guessing.

The project uses Prometheus metrics to observe system behavior.

Examples:

```text
Request rate
Request latency
Error rate
Cache hit ratio
Cache miss ratio
Database latency
Kafka throughput
Consumer lag
Redirect volume
```

One particularly useful metric is:

```text
Cache Hit Ratio
```

For example:

```text
Cache Hits   = 950,000
Cache Misses = 50,000

Hit Ratio = 95%
```

This tells us whether Redis is actually reducing database traffic.

---

# 17. CAP Theorem

The project also provides a practical context for understanding the **CAP theorem**.

In a distributed system, network partitions can occur.

The system must reason about:

* Consistency
* Availability
* Partition tolerance

Different components can make different tradeoffs.

For example:

### URL Mapping

Strong consistency is important.

```text
shortCode → correct URL
```

### Analytics

Some delay or eventual consistency is acceptable.

```text
Click happened
     ↓
Kafka
     ↓
Analytics
     ↓
Database
```

The analytics result does not necessarily need to be updated within the same millisecond as the redirect.

This demonstrates that consistency requirements depend on the business operation.

---

# 18. Eventual Consistency

Analytics data can be eventually consistent.

For example:

```text
User clicks URL
      │
      ▼
Redirect immediately
      │
      ▼
Kafka event
      │
      ▼
Consumer
      │
      ▼
Analytics database
```

The user gets their redirect immediately even though the analytics dashboard may update slightly later.

This is a deliberate tradeoff:

> Lower request latency in exchange for delayed analytical consistency.

---

# 19. Kubernetes

Once the application consists of multiple services and replicas, manually managing containers becomes painful.

Kubernetes can handle:

* Container orchestration
* Service discovery
* Scaling
* Health checks
* Rolling deployments
* Restarting failed containers
* Resource management

For example:

```text
Deployment
     │
     ├── API Pod
     ├── API Pod
     └── API Pod
```

If one pod crashes:

```text
API Pod
   X
   │
   ▼
Kubernetes
   │
   ▼
New Pod
```

The desired state is automatically restored.

---

# 20. Performance Goals

The project focuses on minimizing latency on the redirect path.

The ideal flow is:

```text
Client
  │
  ▼
Load Balancer
  │
  ▼
API
  │
  ▼
Redis
  │
  ▼
Redirect
```

rather than:

```text
Client
  │
  ▼
Load Balancer
  │
  ▼
API
  │
  ▼
PostgreSQL
  │
  ▼
Analytics
  │
  ▼
Multiple queries
  │
  ▼
Redirect
```

The goal is to keep the critical path small and move non-critical work into asynchronous systems.

---

# Technology

| Category         | Technology                     |
| ---------------- | ------------------------------ |
| Frontend         | React + TypeScript             |
| Backend          | Node.js + Express + TypeScript |
| Validation       | Zod                            |
| Authentication   | JWT                            |
| Password Hashing | Argon2                         |
| ORM              | Prisma                         |
| Database         | PostgreSQL                     |
| Cache            | Redis                          |
| Message Broker   | Apache Kafka                   |
| Reverse Proxy    | NGINX                          |
| Containerization | Docker                         |
| Orchestration    | Kubernetes                     |
| Cloud            | AWS                            |
| Monitoring       | Prometheus                     |
| CI/CD            | GitHub Actions                 |
| Monorepo         | Nx                             |

---

# Project Objectives

The goal is to understand and implement the concepts behind a production-grade distributed backend:

* Read-heavy system optimization
* Caching
* Cache invalidation
* Cache stampede prevention
* Distributed ID generation
* Concurrency control
* Database constraints
* Asynchronous processing
* Event-driven architecture
* Kafka producers and consumers
* Idempotency
* Message delivery semantics
* Stateless services
* Horizontal scaling
* Load balancing
* Rate limiting
* Fault tolerance
* Graceful degradation
* Observability
* Eventual consistency
* Database replication
* Container orchestration
* Cloud deployment

---

# Why Build a URL Shortener?

Because the application itself is deceptively simple.

The basic implementation can be written in a few hours.

The **distributed version** exposes a much deeper set of engineering problems:

```text
Simple CRUD
     │
     ▼
High traffic
     │
     ▼
Caching
     │
     ▼
Concurrency
     │
     ▼
Distributed instances
     │
     ▼
Asynchronous events
     │
     ▼
Failures
     │
     ▼
Observability
     │
     ▼
Scalability
```

That progression is the real purpose of the project.

The URL shortener is merely the battlefield. The actual subject is **distributed systems engineering**.
